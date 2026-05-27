/**
 * Public Accountability System — 100-point reform question bank.
 * Filter categories: six thematic buckets aligned with the Cabinet-approved agenda.
 */
(function () {
  window.AGENDA_CATEGORIES = [
    "Governance",
    "Digital",
    "Economy",
    "Anti-corruption",
    "Infrastructure",
    "Social",
  ];

  const CATS = window.AGENDA_CATEGORIES;

  const detailed = [
    {
      category: "Governance",
      promise:
        "Strengthen inter-ministerial coordination and cabinet decision tracking with published timelines.",
      question:
        "How will the government publish quarterly, machine-readable updates on cabinet decisions and their implementation status?",
      why: "Traceable execution turns reform commitments into outcomes that institutions and citizens can verify.",
      path: "A public dashboard with decision reference, lead ministry, milestone dates, and variance notes.",
      sourceUrl: "https://www.opmcm.gov.np/",
      sourceLabel: "Office of the Prime Minister and Council of Ministers — official releases",
      mediaUrl: "https://www.opmcm.gov.np/",
      mediaLabel: "Public notices — verify against the primary OPMCM text",
    },
    {
      category: "Digital",
      promise:
        "Digitize core citizen services and reduce in-person dependency for high-friction processes.",
      question:
        "What mechanism will consolidate service delivery metrics (uptime, turnaround, appeals) into a single periodic national report?",
      why: "Digital reform is measurable when service levels are visible, not only when systems are launched.",
      path: "Published SLAs per service, independent uptime reporting, and a scheduled third-party usability review.",
      sourceUrl: "https://www.opmcm.gov.np/",
      sourceLabel: "OPMCM — official releases",
      mediaUrl: "https://www.opmcm.gov.np/",
      mediaLabel: "Media summaries — cross-check with official statements",
    },
    {
      category: "Anti-corruption",
      promise: "Advance procurement integrity and transparency in large public contracts.",
      question:
        "Which authority will apply systematic pre-award checks (for example bid analytics or red-flag rules), and how will methodology be published?",
      why: "Procurement is a concentration point for fiscal risk; clear rules and disclosure support fair competition.",
      path: "Published risk-scoring methodology, appeals statistics, and post-award performance reporting.",
      sourceUrl: "https://www.opmcm.gov.np/",
      sourceLabel: "OPMCM — official releases",
      mediaUrl: "https://www.opmcm.gov.np/",
      mediaLabel: "Public procurement reporting — compare to primary documents",
    },
    {
      category: "Infrastructure",
      promise: "Improve subnational capacity for planning and fiscal discipline in capital execution.",
      question:
        "How will the centre measure and publish improvements in local capital execution and audit closure rates?",
      why: "Federal effectiveness depends on whether provinces and municipalities can deliver projects, not only on fund transfers.",
      path: "Standard indicators, peer benchmarks, and corrective support where execution falls below threshold.",
      sourceUrl: "https://www.opmcm.gov.np/",
      sourceLabel: "OPMCM — official releases",
      mediaUrl: "https://www.opmcm.gov.np/",
      mediaLabel: "Press reporting — verify figures against official releases",
    },
    {
      category: "Social",
      promise: "Strengthen rule-of-law institutions and predictable enforcement.",
      question:
        "What concrete steps will shorten investigation-to-prosecution timelines for high-impact economic offences?",
      why: "Predictable enforcement supports deterrence and public confidence in reform implementation.",
      path: "Case-tracking visibility, resourcing plans for prosecution units, and periodic outcome reporting.",
      sourceUrl: "https://www.opmcm.gov.np/",
      sourceLabel: "OPMCM — official releases",
      mediaUrl: "https://www.opmcm.gov.np/",
      mediaLabel: "Independent reporting — triangulate with official sources",
    },
  ];

  const pendingBlock = {
    promise:
      "This agenda point is being reconciled with the Cabinet-approved Nepali source text; English wording will follow the official formulation.",
    question:
      "Accountability language for this point will be published after cross-reference with the original document and OPMCM materials.",
    why: "Each published entry will map to a specific commitment in the Cabinet-approved 100-point instrument.",
    path: "Review the Nepali original in the source viewer and official releases before relying on interim text.",
    sourceUrl: "https://www.opmcm.gov.np/",
    sourceLabel: "OPMCM — official releases",
    mediaUrl: "https://www.opmcm.gov.np/",
    mediaLabel: "Public coverage — triangulate with primary sources",
  };

  const items = [];
  for (let i = 1; i <= 100; i++) {
    const cat = CATS[(i - 1) % CATS.length];
    const d = detailed[i - 1];
    if (d) {
      items.push({
        id: i,
        category: d.category || cat,
        promise: d.promise,
        question: d.question,
        why: d.why,
        path: d.path,
        sourceUrl: d.sourceUrl,
        sourceLabel: d.sourceLabel,
        mediaUrl: d.mediaUrl,
        mediaLabel: d.mediaLabel,
        status: "awaiting",
      });
    } else {
      items.push({
        id: i,
        category: cat,
        promise: pendingBlock.promise,
        question: pendingBlock.question,
        why: pendingBlock.why,
        path: pendingBlock.path,
        sourceUrl: pendingBlock.sourceUrl,
        sourceLabel: pendingBlock.sourceLabel,
        mediaUrl: pendingBlock.mediaUrl,
        mediaLabel: pendingBlock.mediaLabel,
        status: "awaiting",
      });
    }
  }

  window.QUESTIONS_DATA = items;
})();
