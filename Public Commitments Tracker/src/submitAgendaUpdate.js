import { supabase, supabaseConfigured } from "./supabaseClient.js";

/**
 * Saves evidence-style submission to Supabase (table row only).
 * @returns {Promise<void>}
 */
export async function submitAgendaUpdate({
  pointNumber,
  description,
  sourceUrl,
  updateType,
  sourceType,
  publicationDate,
  email,
  verifiableSourceAck,
}) {
  if (!supabaseConfigured || !supabase) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  const { error: insErr } = await supabase.from("agenda_submissions").insert({
    cabinet_point: pointNumber,
    message: description,
    official_url: sourceUrl,
    submission_type: updateType,
    source_type: sourceType,
    publication_date: publicationDate,
    submitter_email: email || null,
    verifiable_source_ack: verifiableSourceAck,
    submitter_name: null,
    department: null,
    email_affiliation: null,
    attachment_path: null,
    attachment_name: null,
  });

  if (insErr) {
    throw insErr;
  }
}
