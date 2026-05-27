import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * Called by a Supabase Database Webhook on INSERT into public.agenda_submissions.
 *
 * Secrets (Dashboard → Edge Functions → notify-submission → Secrets, or CLI):
 *   RESEND_API_KEY      — https://resend.com/api-keys
 *   NOTIFY_TO_EMAIL     — e.g. radheradhe742@proton.me
 *   NOTIFY_FROM_EMAIL   — optional; default onboarding@resend.dev
 *   WEBHOOK_SECRET      — optional; if set, webhook must send header x-webhook-secret: <same value>
 *
 * Deploy: supabase functions deploy notify-submission --no-verify-jwt
 */

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  const secret = Deno.env.get("WEBHOOK_SECRET");
  if (secret) {
    const provided = req.headers.get("x-webhook-secret");
    if (provided !== secret) {
      return json({ error: "unauthorized" }, 401);
    }
  }

  let payload: { type?: string; record?: Record<string, unknown> };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const record = payload.record;
  if (!record || record.cabinet_point == null) {
    return json({ error: "missing record" }, 400);
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const to = Deno.env.get("NOTIFY_TO_EMAIL");
  const from = Deno.env.get("NOTIFY_FROM_EMAIL") ?? "onboarding@resend.dev";

  if (!resendKey || !to) {
    console.error("notify-submission: set RESEND_API_KEY and NOTIFY_TO_EMAIL secrets");
    return json({ error: "misconfigured" }, 500);
  }

  const point = record.cabinet_point;
  const typeKey = String(record.submission_type ?? "update");
  const typeLabel = updateTypeLabel(typeKey);
  const subject = `[100-point tracker] Point #${point} · ${typeLabel}`;

  const text = formatBody(record);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Resend:", res.status, detail);
    return json({ error: "resend_failed", detail }, 502);
  }

  return json({ ok: true }, 200);
});

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function updateTypeLabel(key: string): string {
  const m: Record<string, string> = {
    official_government_response: "Official government response",
    policy_action: "Policy/action implemented",
    public_report_data: "Public report/data released",
    correction: "Correction",
  };
  return m[key] ?? key;
}

function sourceTypeLabel(key: string): string {
  const m: Record<string, string> = {
    gov_website: "Government website",
    official_document_pdf: "Official document / PDF",
    news_media: "News media",
    other: "Other",
  };
  return m[key] ?? key;
}

function formatBody(r: Record<string, unknown>): string {
  const uType = String(r.submission_type ?? "");
  const sType = String(r.source_type ?? "");
  const reply = r.submitter_email as string | null | undefined;
  const ack = r.verifiable_source_ack === true;

  const lines = [
    `Cabinet point: ${r.cabinet_point}`,
    `Type of update: ${uType ? updateTypeLabel(uType) : "—"}`,
    `Source type: ${sType ? sourceTypeLabel(sType) : "—"}`,
    `Publication date: ${r.publication_date ?? "—"}`,
    `Source URL: ${r.official_url ?? "—"}`,
    `Reply email: ${reply ?? "—"}`,
    `Confirmed verifiable public source (checkbox): ${ack ? "yes" : "no"}`,
    "",
    "Description:",
    String(r.message ?? ""),
    "",
    r.attachment_name
      ? `Attachment (legacy row): ${r.attachment_name} — ${r.attachment_path ?? ""}`
      : null,
    `Row id: ${r.id ?? "—"}`,
    `Submitted (UTC): ${r.created_at ?? "—"}`,
  ].filter((x) => x != null) as string[];

  return lines.join("\n");
}
