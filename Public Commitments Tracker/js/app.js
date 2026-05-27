(function () {
  const STORAGE_KEY = "cap_state_v3";
  const LAST_UPDATE_FALLBACK = "March 29, 2026";

  const STATUS_META = {
    awaiting: {
      label: "Awaiting Response",
      className:
        "bg-amber-500/15 text-amber-300 border border-amber-500/40",
    },
    received: {
      label: "Response Received",
      className: "bg-sky-500/15 text-sky-300 border border-sky-500/40",
    },
    verifying: {
      label: "Under Review",
      className: "bg-blue-500/15 text-blue-300 border border-blue-500/40",
    },
    verified: {
      label: "Verified",
      className: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40",
    },
    rejected: {
      label: "Rejected / Invalid",
      className: "bg-red-500/15 text-red-300 border border-red-500/40",
    },
  };

  const FILTERS = ["All"].concat(window.AGENDA_CATEGORIES || []);

  let questions = [];
  let activeFilter = "All";
  let modalPointId = null;
  let lastResponseAt = null;

  const el = {
    grid: document.getElementById("question-grid"),
    filterBar: document.getElementById("filter-bar"),
    counterAnswered: document.getElementById("counter-answered"),
    counterTotal: document.getElementById("counter-total"),
    heroUnderReview: document.getElementById("hero-under-review"),
    statLastUpdate: document.getElementById("stat-last-update"),
    rtVerified: document.getElementById("rt-verified"),
    rtReview: document.getElementById("rt-review"),
    rtRejected: document.getElementById("rt-rejected"),
    modal: document.getElementById("response-modal"),
    modalTitle: document.getElementById("modal-title"),
    form: document.getElementById("response-form"),
    backdrop: document.getElementById("modal-backdrop"),
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          questions = parsed.questions;
        }
        if (parsed.lastResponseAt) {
          lastResponseAt = parsed.lastResponseAt;
        }
      }
    } catch (_) {
      questions = [];
    }
    if (
      (!questions.length || !Array.isArray(questions)) &&
      window.QUESTIONS_DATA &&
      window.QUESTIONS_DATA.length
    ) {
      questions = window.QUESTIONS_DATA.map(function (q) {
        return Object.assign({}, q);
      });
    }
  }

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        questions: questions,
        lastResponseAt: lastResponseAt,
      })
    );
  }

  function countVerified() {
    return questions.filter(function (q) {
      return q.status === "verified";
    }).length;
  }

  function countRejected() {
    return questions.filter(function (q) {
      return q.status === "rejected";
    }).length;
  }

  function countUnderReview() {
    return questions.filter(function (q) {
      return q.status === "received" || q.status === "verifying";
    }).length;
  }

  function updateCounter() {
    el.counterAnswered.textContent = String(countVerified());
    el.counterTotal.textContent = String(questions.length);
  }

  function updateStats() {
    const v = countVerified();
    const review = countUnderReview();
    const rej = countRejected();

    if (el.heroUnderReview) el.heroUnderReview.textContent = String(review);
    if (el.rtVerified) el.rtVerified.textContent = String(v);
    if (el.rtReview) el.rtReview.textContent = String(review);
    if (el.rtRejected) el.rtRejected.textContent = String(rej);

    if (el.statLastUpdate) {
      if (lastResponseAt) {
        const d = new Date(lastResponseAt);
        el.statLastUpdate.textContent = d.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } else {
        el.statLastUpdate.textContent = LAST_UPDATE_FALLBACK;
      }
    }
  }

  function filtered() {
    if (activeFilter === "All") return questions;
    return questions.filter(function (q) {
      return q.category === activeFilter;
    });
  }

  function renderFilters() {
    el.filterBar.innerHTML = FILTERS.map(function (name) {
      const active =
        name === activeFilter
          ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/40"
          : "bg-slate-800/80 text-slate-300 border-slate-700 hover:border-blue-500/50 hover:text-white";
      return (
        '<button type="button" data-filter="' +
        escapeAttr(name) +
        '" class="filter-btn max-w-full rounded-lg border px-2.5 py-2 text-left text-xs font-medium leading-snug transition-colors sm:px-3 sm:text-sm ' +
        active +
        '">' +
        escapeHtml(name) +
        "</button>"
      );
    }).join("");

    el.filterBar.querySelectorAll(".filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeFilter = btn.getAttribute("data-filter");
        renderFilters();
        renderCards();
      });
    });
  }

  function badgeHtml(status) {
    const m = STATUS_META[status] || STATUS_META.awaiting;
    return (
      '<span class="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ' +
      m.className +
      '">' +
      m.label +
      "</span>"
    );
  }

  function referencesBlock(q, mUrl, mLabel) {
    return (
      '<details class="mt-1 rounded-lg border border-slate-800/60 bg-slate-950/30">' +
      '<summary class="cursor-pointer list-none px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:bg-slate-900/40 hover:text-slate-400 [&::-webkit-details-marker]:hidden">' +
      "Source references" +
      "</summary>" +
      '<div class="space-y-2.5 border-t border-slate-800/50 px-3 py-3 text-xs leading-relaxed text-slate-400">' +
      '<p class="break-words"><span class="mr-1.5 shrink-0 text-slate-600">Primary</span>' +
      '<a href="' +
      escapeAttr(q.sourceUrl) +
      '" class="text-blue-400/90 hover:text-blue-300 hover:underline" target="_blank" rel="noopener noreferrer">' +
      escapeHtml(q.sourceLabel) +
      "</a></p>" +
      '<p class="break-words"><span class="mr-1.5 shrink-0 text-slate-600">Corroboration</span>' +
      '<a href="' +
      escapeAttr(mUrl) +
      '" class="text-blue-400/90 hover:text-blue-300 hover:underline" target="_blank" rel="noopener noreferrer">' +
      escapeHtml(mLabel) +
      "</a></p>" +
      "</div>" +
      "</details>"
    );
  }

  function renderCards() {
    const list = filtered();
    el.grid.innerHTML = list
      .map(function (q) {
        const mUrl = q.mediaUrl || "https://www.opmcm.gov.np/";
        const mLabel = q.mediaLabel || "Public coverage — triangulate with primary sources";
        return (
          '<article class="rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg shadow-black/40">' +
          '<div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">' +
          '<div class="min-w-0 flex-1">' +
          '<p class="text-xs font-bold uppercase tracking-wider text-slate-500">Point #' +
          q.id +
          " — " +
          escapeHtml(q.category) +
          "</p>" +
          "</div>" +
          '<div class="flex flex-wrap items-center gap-2">' +
          badgeHtml(q.status) +
          "</div>" +
          "</div>" +
          '<div class="mt-5 space-y-5">' +
          section("Promise (Official)", '<p class="font-semibold text-slate-100">' + escapeHtml(q.promise) + "</p>") +
          section(
            "Accountability Question",
            '<p class="italic text-slate-300">' + escapeHtml(q.question) + "</p>"
          ) +
          section("Why This Matters", "<p>" + escapeHtml(q.why) + "</p>") +
          section("Possible Path", "<p>" + escapeHtml(q.path) + "</p>") +
          referencesBlock(q, mUrl, mLabel) +
          "</div>" +
          '<div class="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">' +
          '<a href="nepali-source.html" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center rounded-lg border border-slate-600 bg-transparent px-3 py-2 text-xs font-semibold text-slate-200 hover:border-blue-500/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">View Source</a>' +
          '<button type="button" class="submit-response rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-950" data-id="' +
          q.id +
          '">Submit Official Response</button>' +
          "</div>" +
          '<p class="mt-3 max-w-2xl text-xs leading-relaxed text-slate-500">' +
          "Submissions are reviewed before publication. Uploading a response does not automatically verify authenticity." +
          "</p>" +
          "</article>"
        );
      })
      .join("");

    el.grid.querySelectorAll(".submit-response").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openModal(parseInt(btn.getAttribute("data-id"), 10));
      });
    });

  }

  function section(title, inner) {
    return (
      '<div>' +
      '<h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">' +
      title +
      "</h3>" +
      '<div class="text-sm leading-relaxed text-slate-300">' +
      inner +
      "</div>" +
      "</div>"
    );
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function openModal(pointId) {
    modalPointId = pointId;
    el.modalTitle.textContent = "Submit Official Response — Point #" + pointId;
    el.form.reset();
    el.modal.classList.remove("hidden");
    el.modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modalPointId = null;
    el.modal.classList.add("hidden");
    el.modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function onSubmit(e) {
    e.preventDefault();
    if (modalPointId == null) return;

    const fileInput = document.getElementById("field-file");
    const f = fileInput.files && fileInput.files[0];
    if (f && f.type !== "application/pdf") {
      alert("Please upload a PDF file only.");
      return;
    }

    const idx = questions.findIndex(function (q) {
      return q.id === modalPointId;
    });
    if (idx === -1) return;

    questions[idx].status = "verifying";
    lastResponseAt = new Date().toISOString();
    saveState();
    updateCounter();
    updateStats();
    renderCards();
    closeModal();
  }

  function bindModal() {
    el.form.addEventListener("submit", onSubmit);
    document.getElementById("modal-close").addEventListener("click", closeModal);
    el.backdrop.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !el.modal.classList.contains("hidden")) {
        closeModal();
      }
    });
  }

  loadState();
  updateCounter();
  updateStats();
  renderFilters();
  renderCards();
  bindModal();
})();
