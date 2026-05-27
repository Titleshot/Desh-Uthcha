import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileStack,
  FileText,
  Filter,
  Menu,
  Search,
  Share2,
  X,
} from "lucide-react";

import { cabinetPoints71to85 } from "./cabinetPoints71to85.js";
import { cabinetPoints86to100 } from "./cabinetPoints86to100.js";
import {
  CABINET_DATA_POINT_COUNT,
  CABINET_DATA_SNAPSHOT_ISO,
  CABINET_DATA_SNAPSHOT_LABEL_EN,
  CABINET_DATA_SNAPSHOT_LABEL_NE,
} from "./dataSnapshot.js";
import { promiseSummaries } from "./promiseSummaries.js";
import { supabaseConfigured } from "./supabaseClient.js";
import { submitAgendaUpdate } from "./submitAgendaUpdate.js";

/** Recommended: Supabase URL + anon key — form rows go to your database (see scripts/supabase-setup.sql). */
/** Optional: Formspree form id — free tier at https://formspree.io (when Supabase is not set). */
const FORMSPREE_FORM_ID = (() => {
  const raw = typeof import.meta.env.VITE_FORMSPREE_FORM_ID === "string" ? import.meta.env.VITE_FORMSPREE_FORM_ID.trim() : "";
  if (!raw) return "";
  return raw
    .replace(/^https?:\/\/formspree\.io\/f\//i, "")
    .replace(/^formspree\.io\/f\//i, "")
    .replace(/^\/f\//, "")
    .replace(/^f\//, "")
    .replace(/^\//, "");
})();
/** Optional: Web3Forms access key — also has a free tier at https://web3forms.com */
const WEB3FORMS_ACCESS_KEY =
  typeof import.meta.env.VITE_WEB3FORMS_ACCESS_KEY === "string" ? import.meta.env.VITE_WEB3FORMS_ACCESS_KEY.trim() : "";

/** Optional: inbox for mailto fallback when no backend relay is set. */
const SUBMISSION_EMAIL =
  typeof import.meta.env.VITE_SUBMISSION_EMAIL === "string" ? import.meta.env.VITE_SUBMISSION_EMAIL.trim() : "";

const CAN_RECEIVE_SUBMISSIONS = Boolean(
  supabaseConfigured || FORMSPREE_FORM_ID || WEB3FORMS_ACCESS_KEY || SUBMISSION_EMAIL,
);

/** Stored in DB / email; labels are translated in the form per language. */
const UPDATE_TYPE_KEYS = [
  "official_government_response",
  "policy_action",
  "public_report_data",
  "correction",
];

const SOURCE_TYPE_KEYS = ["gov_website", "official_document_pdf", "news_media", "other"];

const SUBMISSION_MIN_DESCRIPTION_LEN = 15;

function commitmentTitleForPoint(point, language) {
  const full =
    language === "ne" ? point.promiseNe ?? point.promise ?? "" : point.promise ?? point.promiseNe ?? "";
  const one = full.replace(/\s+/g, " ").trim();
  const max = 160;
  if (!one) return language === "ne" ? "(शीर्षक)" : "(No title)";
  return one.length <= max ? one : `${one.slice(0, Math.max(0, max - 1))}…`;
}

function normalizeSourceUrl(raw) {
  const t = String(raw).trim();
  if (!t) return null;
  try {
    const u = new URL(t.includes("://") ? t : `https://${t}`);
    if (u.protocol === "http:" || u.protocol === "https:") return u.href;
  } catch {
    return null;
  }
  return null;
}

/** Canonical YYYY-MM-DD or null if not a real calendar date (guards extra digits / bad months). */
function parseValidPublicationDateIso(raw) {
  const t = String(raw).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const y = Number(t.slice(0, 4));
  const m = Number(t.slice(5, 7));
  const d = Number(t.slice(8, 10));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  if (y < 1900 || y > 2100) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return t;
}

/**
 * Do not use window.open(mailto, "_blank") — Chrome often opens a tab that searches the mailto string on Google
 * instead of handing off to a mail app. Same-document navigation (anchor click or location.assign) is reliable.
 */
function navigateMailtoHref(href) {
  try {
    const a = document.createElement("a");
    a.href = href;
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    window.location.assign(href);
  }
}

const statuses = ["Awaiting Response", "Under Review", "Addressed", "No Action"];

const fullPoints = [
  {
    id: "p1",
    pointNumber: 1,
    category: "Commitment, Coordination & Trust",
    promise:
      "Express heartfelt thanks to the then Sushila Karki–led government, the Election Commission, security agencies, staff, media workers, and all voters who contributed to successfully holding the general election completed on 2082 Falgun 21 in a clean, fair, and independent environment.",
    promiseNe:
      "सम्वत् २०८२ फागुन २१ मा सम्पन्न आम निर्वाचनलाई स्वच्छ, निष्पक्ष र स्वतन्त्र वातावरणमा सफलतापूर्वक सम्पन्न गराउन योगदान पुर्याउने तत्कालीन सुशीला कार्की नेतृत्वको सरकार, निर्वाचन आयोग, सुरक्षा निकाय, कर्मचारी, सञ्चारकर्मी तथा सम्पूर्ण मतदाताप्रति हार्दिक आभार प्रकट गर्ने।",
    question:
      "Beyond this acknowledgment, what formal follow-up will document lessons from the 2082 Falgun 21 process, strengthen institutional safeguards for future elections, and make post-election review data accessible to the public?",
    questionNe:
      "यस कृतज्ञताभन्दा बाहिर, २०८२ फागुन २१ को प्रक्रियाबाट सिकाइ कागजातीकृत गर्ने, आगामी निर्वाचनका लागि संस्थागत सुरक्षा सुदृढ गर्ने र निर्वाचनपछिको समीक्षा डेटा सार्वजनिक पहुँचयोग्य बनाउने औपचारिक कार्य के हुन्छ?",
    whyThisMatters:
      "Gratitude records a successful election cycle, but legitimacy is renewed each time citizens see transparent administration of the vote and credible handling of disputes.",
    whyThisMattersNe:
      "कृतज्ञताले सफल निर्वाचन चक्रलाई दर्शाउँछ, तर मतदानको पारदर्शी व्यवस्थापन र विवादको विश्वसनीय समाधान देख्दा मात्र वैधता नयाँ पुस्तामा नवीकृत हुन्छ।",
    possiblePathItems: [
      "Public archive of election administration decisions and turnout data for 2082 Falgun 21",
      "Structured dialogue with EC, security bodies, and observers on operational lessons",
      "Published roadmap for recurring integrity checks before the next election cycle",
      "Citizen-facing FAQ and complaint pathways tied to EC processes",
    ],
    possiblePathItemsNe: [
      "२०८२ फागुन २१ का निर्वाचन व्यवस्थापन निर्णय र मतदान डेटाको सार्वजनिक अभिलेख",
      "निर्वाचन आयोग, सुरक्षा निकाय र पर्यवेक्षकसँग सञ्चालनात्मक सिकाइका लागि संरचित संवाद",
      "अर्को निर्वाचन चक्रअघि नियमित अखण्डता जाँचको सार्वजनिक रोडम्याप",
      "निर्वाचन आयोग प्रक्रियासँग जोडिएको नागरिकमुखी प्रश्नोत्तर र गुनासो मार्ग",
    ],
    visualAccountability: [
      {
        area: "Election day conduct (Falgun 21)",
        areaNe: "निर्वाचन दिन (फागुन २१)",
        currentRecognition: "Agenda: gratitude for clean, fair, free conduct",
        currentRecognitionNe: "एजेन्डा: स्वच्छ, निष्पक्ष, स्वतन्त्र निर्वाचनप्रति हार्दिक आभार",
        futureNeed: "Published after-action review with EC and security inputs",
        futureNeedNe: "आयोग र सुरक्षाको इनपुटसहित पछिको समीक्षा प्रकाशन",
        transparency: "Open data on polling, incidents, and resolutions",
        transparencyNe: "मतदान, घटना र निराकरणसम्बन्धी खुला डेटा",
        safeguardStrength: "Moderate",
        safeguardStrengthNe: "मध्यम",
        visibility: "High",
        visibilityNe: "उच्च",
      },
      {
        area: "Election Commission role",
        areaNe: "निर्वाचन आयोगको भूमिका",
        currentRecognition: "Named alongside the Sushila Karki–led caretaker government and voters in the commitment",
        currentRecognitionNe: "प्रतिबद्धतामा सुशीला कार्की नेतृत्वको सरकार र मतदातासँगै उल्लेख",
        futureNeed: "Strengthened transparency on rule changes and enforcement",
        futureNeedNe: "नियम परिवर्तन र कार्यान्वयनमा पारदर्शिता सुदृढ",
        transparency: "Timely publication of directives and statistics",
        transparencyNe: "निर्देशिका र तथ्याङ्क समयमै प्रकाशन",
        safeguardStrength: "Developing",
        safeguardStrengthNe: "विकासोन्मुख",
        visibility: "High",
        visibilityNe: "उच्च",
      },
      {
        area: "Security & media",
        areaNe: "सुरक्षा र सञ्चार",
        currentRecognition: "Security agencies and media explicitly thanked",
        currentRecognitionNe: "सुरक्षा निकाय र सञ्चारकर्मी प्रष्ट कदर",
        futureNeed: "Protocols for proportional response and press access",
        futureNeedNe: "सन्तुलित प्रतिक्रिया र प्रेस पहुँचका प्रोटोकल",
        transparency: "Incident logs and media safety reporting",
        transparencyNe: "घटना अभिलेख र सञ्चार सुरक्षा प्रतिवेदन",
        safeguardStrength: "Developing",
        safeguardStrengthNe: "विकासोन्मुख",
        visibility: "Medium",
        visibilityNe: "मध्यम",
      },
      {
        area: "Voter trust",
        areaNe: "मतदाता विश्वास",
        currentRecognition: "Voters credited for democratic participation",
        currentRecognitionNe: "लोकतान्त्रिक सहभागिताका लागि मतदातालाई श्रेय",
        futureNeed: "Continuous civic education and dispute transparency",
        futureNeedNe: "निरन्तर नागरिक शिक्षा र विवाद पारदर्शिता",
        transparency: "Public communication on electoral rights",
        transparencyNe: "निर्वाचन अधिकारमाथि सार्वजनिक सूचना",
        safeguardStrength: "Moderate",
        safeguardStrengthNe: "मध्यम",
        visibility: "High",
        visibilityNe: "उच्च",
      },
    ],
    systemInsight:
      "Acknowledgment is the start: durable trust requires the same institutions to show how the next election will be run as fairly as the last.",
    systemInsightNe:
      "कृतज्ञता सुरुवात हो: टिकाउ विश्वासका लागि उही संस्थाहरूले अर्को निर्वाचन पनि उत्तिकै निष्पक्ष कसरी चल्छ देखाउनुपर्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item १ (Falgun 21 election gratitude; scan Page 1)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा १ (फागुन २१ निर्वाचन कृतज्ञता; स्क्यान पृष्ठ १)",
    sourceExcerpt:
      "From scanned agenda (section क): heartfelt thanks to those who contributed to the 2082 Falgun 21 general election held cleanly, fairly, and independently—Sushila Karki–led government, EC, security, staff, media workers, all voters.",
    sourceExcerptNe:
      "स्क्यान गरिएको एजेन्डा (खण्ड क): २०८२ फागुन २१ मा सम्पन्न आम निर्वाचन स्वच्छ, निष्पक्ष, स्वतन्त्र वातावरणमा सफलतापूर्वक सम्पन्न गराउन योगदान पुर्याउने तत्कालीन सुशीला कार्की नेतृत्वको सरकार, निर्वाचन आयोग, सुरक्षा निकाय, कर्मचारी, सञ्चारकर्मी, सम्पूर्ण मतदाताप्रति हार्दिक आभार।",
    layer1: {
      hookEmoji: "⚠️",
      hook: "Election’s done — but where’s the proof for next time?",
      hookNe: "निर्वाचन भयो — अर्कोपटकको प्रमाण कहाँ?",
      stakeLine: "No public review data means citizens can’t verify fairness.",
      stakeLineNe: "सार्वजनिक समीक्षा डेटा बिना नागरिकले निष्पक्षता जाँच गर्न सक्दैनन्।",
      coreQuestionShort: "Where’s the public proof on fair elections — for next time too?",
      coreQuestionShortNe: "निष्पक्ष निर्वाचनको सार्वजनिक प्रमाण कहाँ — अर्कोपटक पनि?",
      coreQuestion:
        "Will election administration data, review reports, and safeguards for future elections be published for citizens?",
      coreQuestionNe:
        "नागरिकका लागि निर्वाचन व्यवस्थापन डेटा, समीक्षा प्रतिवेदन र आगामी निर्वाचनका सुरक्षाहरू प्रकाशित हुन्छन्?",
      quickScan: [
        {
          item: "Public post-election / lessons-learned report",
          itemNe: "निर्वाचनपछिको वा सिकाइ समीक्षा प्रतिवेदन (सार्वजनिक)",
          status: "❌ No public report",
          statusNe: "❌ सार्वजनिक प्रतिवेदन छैन",
        },
        {
          item: "Open data: administration & turnout (2082 Falgun 21)",
          itemNe: "खुला डेटा: व्यवस्थापन र मतदान (२०८२ फागुन २१)",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Clear plan for future integrity checks",
          itemNe: "आगामी अखण्डता जाँचको स्पष्ट योजना",
          status: "❌ No plan announced",
          statusNe: "❌ योजना घोषणा छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Election Commission; security agencies; Ministry of Home Affairs (operational security); Government of Nepal for publishing review materials.",
      primaryOwnersNe:
        "निर्वाचन आयोग; सुरक्षा निकाय; गृह मन्त्रालय (सञ्चालन सुरक्षा); समीक्षा सामग्री प्रकाशनका लागि नेपाल सरकार।",
      coordinatingOfficeEn:
        "Office of the Prime Minister and Council of Ministers — tracks cross-agency follow-up on cabinet commitments.",
      coordinatingOfficeNe:
        "प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय — मन्त्रिपरिषद् प्रतिबद्धतामा अन्तरनिकाय पछ्याइ।",
      accountableRolesEn:
        "EC and line bodies publish verifiable administration data; GoN archives and communicates post-election integrity evidence to the public.",
      accountableRolesNe:
        "आयोग र सम्बन्धित निकायले प्रमाणित व्यवस्थापन डेटा प्रकाशन गर्छन्; निर्वाचनपछिको अखण्डता प्रमाण जनतासम्म नेपाल सरकारमार्फत अभिलेख/सञ्चार हुन्छ।",
      timelineEn: "Continuous through the next election cycle; post–2082 Falgun 21 evidence should be public before the following poll.",
      timelineNe: "अर्को निर्वाचन चक्रसम्म निरन्तर; २०८२ फागुन २१ पछिको प्रमाण अर्को मतदानअघि सार्वजनिक हुनुपर्छ।",
      milestones: [
        {
          en: "Publish a post-election / lessons-learned report with named data releases.",
          ne: "नामित डेटा सार्वजनिकीकरणसहित निर्वाचनपछिको / सिकाइ समीक्षा प्रतिवेदन प्रकाशन।",
        },
        {
          en: "Release open administration & turnout data for 2082 Falgun 21 (machine-readable if possible).",
          ne: "२०८२ फागुन २१ को व्यवस्थापन र मतदान खुला डेटा सार्वजनिक (सकिएसम्म मेसिनपढ्न मिल्ने)।",
        },
        {
          en: "Publish a dated roadmap for future integrity checks and dispute handling.",
          ne: "आगामी अखण्डता जाँच र विवाद समाधानका लागि मितिसहित रोडमेप सार्वजनिक।",
        },
      ],
      kpis: [
        {
          metricEn: "Official post-election review report live (Y/N)",
          metricNe: "आधिकारिक निर्वाचनपछिको समीक्षा प्रतिवेदन लाइभ (हो/होइन)",
          howEn: "Single government URL; publication date; downloadable or readable annexes.",
          howNe: "एक सरकारी URL; प्रकाशन मिति; डाउनलोड वा पढ्न मिल्ने अनुसूची।",
        },
        {
          metricEn: "Open dataset for administration & turnout (Y/N + URL)",
          metricNe: "व्यवस्थापन र मतदान खुला डेटासेट (हो/होइन + URL)",
          howEn: "Public portal link; update frequency stated; field definitions published.",
          howNe: "सार्वजनिक पोर्टल लिंक; अद्यावधिक फ्रिक्वेन्सी खुलाइएको; क्षेत्र परिभाषा प्रकाशित।",
        },
      ],
      risks: [
        {
          en: "Reports stay internal — citizens cannot verify fairness claims.",
          ne: "प्रतिवेदन आन्तरिक मात्र — नागरिकले निष्पक्षताको दाबी जाँच गर्न सक्दैनन्।",
        },
        {
          en: "Political pressure to limit disclosure before the next election.",
          ne: "अर्को निर्वाचनअघि खुलासा सीमित गर्न राजनीतिक दबाब।",
        },
      ],
      escalation: [
        {
          en: "Citizen & media requests for publication under right-to-information norms.",
          ne: "सूचनाको हक अन्तर्गत प्रकाशनका लागि नागरिक र सञ्चार माध्यमको माग।",
        },
        {
          en: "Parliamentary questions on EC / Home timelines and missing deliverables.",
          ne: "आयोग / गृहको समयसीमा र हराएका वितरणयोग्य सामग्रीबारे संसदीय प्रश्न।",
        },
        {
          en: "Share this tracker link so the gap stays visible (#point-1).",
          ne: "यो ट्र्याकर लिंक साझेदारी गरी खालीपन दृश्य राख्नुहोस् (#बुँदा-१)।",
        },
      ],
      programStatusEn: "🔴 No evidence on file — key post-election deliverables not publicly verified here.",
      programStatusNe: "🔴 प्रमाण दर्ता छैन — मुख्य निर्वाचनपछिका वितरणयोग्य सामग्री सार्वजनिक रूपमा प्रमाणित छैनन्।",
    },
  },
  {
    id: "p2",
    pointNumber: 2,
    category: "Commitment, Coordination & Trust",
    promise:
      "Implement result-based governance arrangements (“Delivery-Based Governance”) to make the government’s overall performance results-oriented, effective, measurable, and accountable, and to transform it into a model that brings direct improvement to citizens’ lives. For this, within 7 days each ministry shall prepare and put into implementation an action plan covering its 10 priority tasks, their timelines, responsible officials, and key performance indicators; arrange to submit monthly progress on those tasks to the Office of the Prime Minister and Council of Ministers; and through that office ensure regular monitoring, evaluation, and public reporting.",
    promiseNe:
      "सरकारको समग्र कार्यसम्पादनलाई नतिजामुखी, प्रभावकारी, मापनयोग्य र जवाफदेही बनाउन तथा नागरिक जीवनमा प्रत्यक्ष सुधार ल्याउने ढाँचामा रूपान्तरण गर्न नतिजामा आधारित शासकीय प्रवन्ध (Delivery-Based Governance) लागू गर्ने। यसको लागि प्रत्येक मन्त्रालयले ७ दिनभित्र प्रमुख १० कार्य, तिनका समयसीमा, जिम्मेवार अधिकारी र प्रमुख कार्यसम्पादन सूचकसहितको कार्ययोजना तयार गरी कार्यान्वयनमा लैजाने। ती कार्यहरूको मासिक प्रगति प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालयमा पेश गर्ने व्यवस्था मिलाई उक्त कार्यालयमार्फत नियमित अनुगमन, मूल्याङ्कन तथा सार्वजनिक रिपोर्टिङ सुनिश्चित गर्ने।",
    question:
      "Will each ministry’s 7-day plan and its 10 priority tasks be published in full, what KPI definitions and data sources will be standardized across ministries, and how will OPMCM’s monthly monitoring translate into verified public dashboards and corrective action when targets slip?",
    questionNe:
      "प्रत्येक मन्त्रालयको सात दिने योजना र दश प्रमुख कार्य पूर्ण रूपमा प्रकाशित हुन्छ कि हुँदैन, मन्त्रालयहरूमा KPI परिभाषा र डेटा स्रोत कसरी मानकीकृत हुन्छ, र प्रधानमन्त्री कार्यालयको मासिक निगरानी प्रमाणित सार्वजनिक ड्यासबोर्ड र लक्ष्य चुक्दा सुधारात्मक कारबाहीमा कसरी रूपान्तरण हुन्छ?",
    whyThisMatters:
      "The agenda binds rhetoric to a calendar: seven days for plans, ten visible priorities per ministry, and monthly reporting upward. Without public visibility, those mechanics become another unread memo.",
    whyThisMattersNe:
      "एजेन्डाले नारालाई तालिकासँग जोड्छ: योजनाका लागि सात दिन, मन्त्रालय प्रति दश दृश्य प्राथमिकता र माथितिर मासिक प्रतिवेदन। सार्वजनिक दृश्यता बिना यी व्यवस्था अर्को नपढिएको जानकारी मात्र बन्छ।",
    possiblePathItems: [
      "Single public register of all ministries’ 7-day action plans and 10 tasks",
      "Standard KPI handbook (definitions, baselines, verification rules)",
      "Monthly OPMCM summaries released in citizen-readable form",
      "Escalation protocol when ministries miss reporting deadlines",
      "Independent spot-checks or legislative review of reported KPIs",
    ],
    possiblePathItemsNe: [
      "सबै मन्त्रालयका सात दिने योजना र दश कार्यको एकीकृत सार्वजनिक दर्ता",
      "मानक KPI पुस्तिका (परिभाषा, आधाररेखा, प्रमाणीकरण नियम)",
      "नागरिकमुखी रूपमा प्रकाशित प्रधानमन्त्री कार्यालयको मासिक सार",
      "प्रतिवेदन म्याद चुक्दा उचालन प्रोटोकल",
      "प्रतिवेदित KPI माथि स्वतन्त्र नमूना जाँच वा विधायी समीक्षा",
    ],
    deliveryPerformanceDashboard: [
      {
        ministry: "Health",
        ministryNe: "स्वास्थ्य",
        kpi: "Maternal mortality rate",
        kpiNe: "मातृ मृत्युदर",
        target: "↓ 20%",
        targetNe: "↓ २०%",
        current: "↓ 8%",
        currentNe: "↓ ८%",
        gap: "-12%",
        gapNe: "-१२%",
        status: "🟡 Behind",
        statusNe: "🟡 लक्ष्यभन्दा पछाडि",
      },
      {
        ministry: "Transport",
        ministryNe: "यातायात",
        kpi: "Road completion (km/year)",
        kpiNe: "सडक निर्माण (किमी/वर्ष)",
        target: "500 km",
        targetNe: "५०० किमी",
        current: "320 km",
        currentNe: "३२० किमी",
        gap: "-180 km",
        gapNe: "-१८० किमी",
        status: "🟡 Behind",
        statusNe: "🟡 लक्ष्यभन्दा पछाडि",
      },
      {
        ministry: "Energy",
        ministryNe: "ऊर्जा",
        kpi: "Electricity access",
        kpiNe: "बिजुली पहुँच",
        target: "100%",
        targetNe: "१००%",
        current: "92%",
        currentNe: "९२%",
        gap: "-8%",
        gapNe: "-८%",
        status: "🔵 In progress",
        statusNe: "🔵 प्रगतिमा",
      },
      {
        ministry: "Education",
        ministryNe: "शिक्षा",
        kpi: "School enrollment",
        kpiNe: "विद्यालय भर्ना",
        target: "98%",
        targetNe: "९८%",
        current: "95%",
        currentNe: "९५%",
        gap: "-3%",
        gapNe: "-३%",
        status: "🔵 In progress",
        statusNe: "🔵 प्रगतिमा",
      },
    ],
    systemStatusOverview: [
      { en: "7-day ministry action plans (10 tasks + KPIs): Publication status unclear", ne: "सात दिने मन्त्रालय योजना (१० कार्य + KPI): प्रकाशन स्थिति अस्पष्ट" },
      { en: "Monthly OPMCM progress reports: Not publicly verified", ne: "प्रधानमन्त्री कार्यालयमा मासिक प्रगति: सार्वजनिक प्रमाणित छैन" },
      { en: "Cross-ministry KPI standards: Not established", ne: "अन्तरमन्त्रालय KPI मानक: स्थापित छैन" },
      { en: "Public dashboards from OPMCM monitoring: Not available", ne: "कार्यालय निगरानीबाट सार्वजनिक ड्यासबोर्ड: उपलब्ध छैन" },
    ],
    systemInsight:
      "The engine of this point is operational: ten tasks, seven days, monthly lines to the PM’s office. Citizens should see those plans and scores, not only hear the slogan “delivery-based governance.”",
    systemInsightNe:
      "यो बुँदाको इन्जिन सञ्चालन हो: दश कार्य, सात दिन, प्रधानमन्त्री कार्यालयतिर मासिक लाइन। नागरिकले Delivery-Based Governance नारा मात्र नभई योजना र अङ्क देख्नुपर्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item २ (delivery-based governance; scan Page 1)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा २ (Delivery-Based Governance; स्क्यान पृष्ठ १)",
    sourceExcerpt:
      "From scanned agenda: Delivery-Based Governance (result-based governance arrangements); within 7 days each ministry prepares and implements a plan for 10 priority tasks, timelines, responsible officials, and KPIs; monthly progress to OPMCM; monitoring, evaluation, and public reporting through that office.",
    sourceExcerptNe:
      "स्क्यान गरिएको एजेन्डा: नतिजामा आधारित शासकीय प्रवन्ध (Delivery-Based Governance); ७ दिनभित्र प्रमुख १० कार्य, समयसीमा, जिम्मेवार अधिकारी, प्रमुख कार्यसम्पादन सूचकसहित कार्ययोजना र कार्यान्वयन; मासिक प्रगति प्रधानमन्त्री कार्यालयमा; सो कार्यालयमार्फत अनुगमन, मूल्याङ्कन, सार्वजनिक रिपोर्टिङ।",
    layer1: {
      hookEmoji: "📊",
      hook: "7 days. 10 priorities. Where are the plans?",
      hookNe: "७ दिन। १० प्राथमिकता। योजना कहाँ?",
      stakeLine:
        "Citizens still can’t see ministry plans, KPIs, or verified dashboards in one public place.",
      stakeLineNe:
        "नागरिकले अझै एकै सार्वजनिक ठाउँमा मन्त्रालयका योजना, KPI वा प्रमाणित ड्यासबोर्ड देख्न पाएका छैनन्।",
      coreQuestionShort: "Where are the 7-day plans and public dashboards?",
      coreQuestionShortNe: "७ दिने योजना र सार्वजनिक ड्यासबोर्ड कहाँ छन्?",
      coreQuestion:
        "Will every ministry’s 7-day plan and 10 tasks be published, with verified public progress reporting?",
      coreQuestionNe:
        "प्रत्येक मन्त्रालयको सात दिने योजना र दश कार्य प्रकाशित हुन्छन्, प्रमाणित सार्वजनिक प्रगति प्रतिवेदन हुन्छ?",
      quickScan: [
        {
          item: "Single public register of all ministries’ plans & 10 tasks",
          itemNe: "सबै मन्त्रालयका योजना र दश कार्यको एकीकृत सार्वजनिक दर्ता",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Standard KPI definitions across ministries",
          itemNe: "मन्त्रालयहरूमा मानक KPI परिभाषा",
          status: "❌ Not in place",
          statusNe: "❌ अझै छैन",
        },
        {
          item: "Monthly OPMCM summaries citizens can read",
          itemNe: "नागरिकले पढ्न मिल्ने मासिक प्रधानमन्त्री कार्यालय सार",
          status: "⚠️ Not verified publicly",
          statusNe: "⚠️ सार्वजनिक प्रमाण छैन",
        },
        {
          item: "Public dashboards from monitoring",
          itemNe: "निगरानीबाट सार्वजनिक ड्यासबोर्ड",
          status: "❌ None available",
          statusNe: "❌ उपलब्ध छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Each line ministry (10 priority tasks + KPIs + responsible officials); Ministry of Finance / National Planning Commission for budget and indicator alignment where relevant.",
      primaryOwnersNe:
        "प्रत्येक मन्त्रालय (दश प्राथमिक कार्य + KPI + जिम्मेवार अधिकारी); बजेट र सूचक मिलानका लागि अर्थ मन्त्रालय / राष्ट्रिय योजना आयोग।",
      coordinatingOfficeEn:
        "Office of the Prime Minister and Council of Ministers — receives monthly progress, runs monitoring/evaluation, and is responsible for public reporting per the agenda text.",
      coordinatingOfficeNe:
        "प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय — मासिक प्रगति ग्रहण, अनुगमन/मूल्याङ्कन र एजेन्डा अनुसार सार्वजनिक रिपोर्टिङको जिम्मेवारी।",
      accountableRolesEn:
        "Secretaries / line ministers accountable for published plans; OPMCM for releasing citizen-readable summaries and dashboards when targets slip.",
      accountableRolesNe:
        "प्रकाशित योजनाका लागि सचिव/मन्त्री जवाफदेह; लक्ष्य चुक्दा नागरिकमुखी सार र ड्यासबोर्ड प्रधानमन्त्री कार्यालयको जिम्मेवारी।",
      timelineEn:
        "T+7 days: each ministry’s plan live; month 1 onward: first monthly submissions; ongoing: standardized KPI handbook and public dashboard cadence.",
      timelineNe:
        "T+७ दिन: प्रत्येक मन्त्रालयको योजना लाइभ; पहिलो महिनादेखि: पहिलो मासिक पेश; निरन्तर: मानक KPI पुस्तिका र सार्वजनिक ड्यासबोर्ड तालिका।",
      milestones: [
        {
          en: "Single public register: all ministries’ 7-day plans with 10 tasks, owners, and KPI definitions.",
          ne: "एकीकृत सार्वजनिक दर्ता: सबै मन्त्रालयका सात दिने योजना, दश कार्य, जिम्मेवार र KPI परिभाषा।",
        },
        {
          en: "Published KPI verification rules (data sources, baselines, who certifies updates).",
          ne: "KPI प्रमाणीकरण नियम प्रकाशित (डेटा स्रोत, आधाररेखा, अद्यावधिक कसले प्रमाणित गर्छ)।",
        },
        {
          en: "First OPMCM monthly summary in open, citizen-readable form with ministry scorecards.",
          ne: "पहिलो प्रधानमन्त्री कार्यालय मासिक सार खुला, नागरिकमुखी रूपमा मन्त्रालय स्कोरकार्डसहित।",
        },
      ],
      kpis: [
        {
          metricEn: "% of ministries with published 7-day plans (target 100%)",
          metricNe: "प्रकाशित सात दिने योजना भएका मन्त्रालय % (लक्ष्य १००%)",
          howEn: "Countable URLs on a government index; checksum or publication date per ministry.",
          howNe: "सरकारी सूचीमा गन्न मिल्ने URL; मन्त्रालय प्रति प्रकाशन मिति वा जाँच कोड।",
        },
        {
          metricEn: "Monthly OPMCM report published on schedule (Y/N + date)",
          metricNe: "मासिक प्रधानमन्त्री कार्यालय प्रतिवेदन तालिकामा प्रकाशित (हो/होइन + मिति)",
          howEn: "Public document series; late flags when a ministry misses submission.",
          howNe: "सार्वजनिक कागजात शृङ्खला; मन्त्रालयले पेश नगर्दा ढिलो चिन्ह।",
        },
      ],
      risks: [
        {
          en: "Plans exist only as internal PDFs — no machine-readable tracking.",
          ne: "योजना आन्तरिक PDF मात्र — मेसिनपढ्न मिल्ने ट्र्याकिङ छैन।",
        },
        {
          en: "Inconsistent KPI definitions make cross-ministry comparison meaningless.",
          ne: "असंगत KPI परिभाषाले अन्तरमन्त्रालय तुलना अर्थहीन बनाउँछ।",
        },
      ],
      escalation: [
        {
          en: "Parliamentary committee review of missing plans or late monthly returns.",
          ne: "हराएका योजना वा ढिलो मासिक फिर्ताका लागि संसदीय समिति समीक्षा।",
        },
        {
          en: "Media and civil society “dashboard watch” naming ministries without public artifacts.",
          ne: "सार्वजनिक कलाकृतिविहीन मन्त्रालय नाम लिई सञ्चार र नागरिक समाजको «ड्यासबोर्ड वाच»।",
        },
        {
          en: "Share this point so delivery stays visible (#point-2).",
          ne: "वितरण दृश्य राख्न यो बुँदा साझेदारी गर्नुहोस् (#बुँदा-२)।",
        },
      ],
      programStatusEn: "🟡 Delayed / unverified — operating rules exist in text but unified public proof is not established.",
      programStatusNe: "🟡 ढिलो / अप्रमाणित — पाठमा सञ्चालन नियम छ तर एकीकृत सार्वजनिक प्रमाण स्थापित छैन।",
    },
  },
  {
    id: "p3",
    pointNumber: 3,
    category: "Commitment, Coordination & Trust",
    promise:
      "To give institutional effect to the core spirit of Nepal’s Constitution, strengthening of the democratic system, and the mandate expressed through the election, summarize implementable items included in the manifestos, “vachapatras,” and commitment letters of all political parties that participated in the election, and prepare a “National Commitment” while establishing shared ownership by the Government of Nepal. Link that commitment to the annual policy and program, the budget, and the reform agenda; and to implement it from the outset without delay, immediately establish the necessary structure under the Office of the Prime Minister and Council of Ministers and assign responsibilities.",
    promiseNe:
      "नेपालको संविधानको मूल मर्म, लोकतान्त्रिक प्रणालीको सुदृढीकरण तथा निर्वाचनमार्फत व्यक्त जनादेशलाई संस्थागत रूपले कार्यान्वयन गर्न निर्वाचनमा सहभागी सबै राजनीतिक दलका घोषणापत्र, वाचापत्र तथा प्रतिबद्धतापत्रहरूमा समावेश कार्यान्वयनयोग्य विषयहरूको संक्षेपण गरी «राष्ट्रिय प्रतिबद्धता» तयार गर्ने एवं सोमा नेपाल सरकारको साझा स्वामित्व स्थापित गर्ने। उक्त प्रतिबद्धतालाई वार्षिक नीति तथा कार्यक्रम, बजेट तथा सुधार एजेण्डासँग आबद्ध गरी तत्कालैदेखि कार्यान्वयन गर्न तत्काल प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय अन्तर्गत आवश्यक संरचना स्थापना गरी जिम्मेवारी दिने।",
    question:
      "How will manifesto and pledge text be methodically extracted and reconciled, who certifies the final National Commitment document, and what public traceability will show each line item’s budget line, ministry owner, and review cycle?",
    questionNe:
      "घोषणापत्र र प्रतिबद्धता पाठ कसरी व्यवस्थित रूपमा निकाली मिलाइन्छ, अन्तिम राष्ट्रिय प्रतिबद्धता कागज कसले प्रमाणित गर्छ, र प्रत्येक बुँदाको बजेट शीर्षक, मन्त्रालय जिम्मेवार र समीक्षा चक्र देखाउने सार्वजनिक ट्रेस कसरी हुन्छ?",
    whyThisMatters:
      "This turns scattered party promises into a single state-owned program map—if it stays secret, ministries cannot be held to one shared baseline.",
    whyThisMattersNe:
      "यसले दलका छरिएका वाचाहरू एउटा राज्यस्वामित्वको कार्यक्रम नक्सामा बदल्छ — गोप्य रह्यो भने मन्त्रालयहरू एउटै आधाररेखामा जवाफदेह हुन सक्दैनन्।",
    possiblePathItems: [
      "Published methodology for mapping manifesto pledges to implementable actions",
      "Version-controlled National Commitment text with party attribution per clause",
      "Formal budget and policy hooks (program codes) for each commitment cluster",
      "OPMCM-led implementation cell with published terms of reference",
      "Semi-annual public reconciliation of “pledged vs. funded vs. delivered”",
    ],
    possiblePathItemsNe: [
      "घोषणापत्र वाचालाई कार्यान्वयनयोग्य कार्यसँग जोड्ने विधि सार्वजनिक गर्ने",
      "दलगत श्रेयसहित संस्करण नियन्त्रित राष्ट्रिय प्रतिबद्धता पाठ",
      "प्रतिबद्धता समूह प्रति औपचारिक बजेट र नीति जोड (कार्यक्रम कोड)",
      "सार्वजनिक कार्यदेशसहित प्रधानमन्त्री कार्यालय नेतृत्वको कार्यान्वयन एकाइ",
      "«वाचा बनाम बजेट बनाम वितरण» द्विवार्षिक सार्वजनिक मिलान",
    ],
    commitmentTrackingDashboard: [
      {
        commitment: "Road infrastructure expansion",
        commitmentNe: "सडक पूर्वाधार विस्तार",
        ministry: "Transport",
        ministryNe: "यातायात",
        timeline: "2026–2028",
        timelineNe: "२०२६–२०२८",
        budgetLinked: "Yes",
        budgetLinkedNe: "हो",
        status: "🔵 In progress",
        statusNe: "🔵 प्रगतिमा",
        percentComplete: "35%",
        percentCompleteNe: "३५%",
        lastUpdated: "Apr 2026",
        lastUpdatedNe: "अप्रिल २०२६",
      },
      {
        commitment: "Electricity access expansion",
        commitmentNe: "बिजुली पहुँच विस्तार",
        ministry: "Energy",
        ministryNe: "ऊर्जा",
        timeline: "2025–2027",
        timelineNe: "२०२५–२०२७",
        budgetLinked: "Yes",
        budgetLinkedNe: "हो",
        status: "🔵 In progress",
        statusNe: "🔵 प्रगतिमा",
        percentComplete: "60%",
        percentCompleteNe: "६०%",
        lastUpdated: "Apr 2026",
        lastUpdatedNe: "अप्रिल २०२६",
      },
      {
        commitment: "School enrollment improvement",
        commitmentNe: "विद्यालय भर्ना सुधार",
        ministry: "Education",
        ministryNe: "शिक्षा",
        timeline: "2025–2026",
        timelineNe: "२०२५–२०२६",
        budgetLinked: "Partial",
        budgetLinkedNe: "आंशिक",
        status: "🟡 Behind",
        statusNe: "🟡 लक्ष्यभन्दा पछाडि",
        percentComplete: "75%",
        percentCompleteNe: "७५%",
        lastUpdated: "Mar 2026",
        lastUpdatedNe: "मार्च २०२६",
      },
      {
        commitment: "Public hospital upgrade",
        commitmentNe: "सार्वजनिक अस्पताल स्तरोन्नति",
        ministry: "Health",
        ministryNe: "स्वास्थ्य",
        timeline: "2026–2029",
        timelineNe: "२०२६–२०२९",
        budgetLinked: "No",
        budgetLinkedNe: "छैन",
        status: "🔴 Not Started",
        statusNe: "🔴 सुरु भएको छैन",
        percentComplete: "10%",
        percentCompleteNe: "१०%",
        lastUpdated: "Feb 2026",
        lastUpdatedNe: "फेब्रुअरी २०२६",
      },
    ],
    frameworkStatusOverview: [
      { en: "Synthesized manifesto & pledge register: Not published", ne: "घोषणापत्र र प्रतिबद्धता संश्लेषण दर्ता: प्रकाशित छैन" },
      { en: "GoN “common ownership” governance structure under OPMCM: Pending detail", ne: "प्रधानमन्त्री कार्यालय अन्तर्गत सरकारी «सामूहिक स्वामित्व» संरचना: विवरण बाँकी" },
      { en: "Link to annual policy, program & budget: Not demonstrated", ne: "वार्षिक नीति, कार्यक्रम र बजेटसँग जोड: प्रमाणित छैन" },
      { en: "Public tracking of pledge → budget → delivery: Not established", ne: "प्रतिबद्धता → बजेट → वितरण सार्वजनिक ट्र्याक: स्थापित छैन" },
      { en: "Independent audit of mapping accuracy: Not defined", ne: "म्यापिङ शुद्धताको स्वतन्त्र लेखापरीक्षा: परिभाषित छैन" },
    ],
    commitmentFlowSteps: [
      { en: "Party manifestos & pledges", ne: "दलका घोषणापत्र र प्रतिबद्धता" },
      { en: "Synthesis", ne: "संश्लेषण" },
      { en: "National Commitment document", ne: "राष्ट्रिय प्रतिबद्धता कागज" },
      { en: "Policy / program / budget link", ne: "नीति, कार्यक्रम, बजेट जोड" },
      { en: "OPMCM implementation structure", ne: "प्रधानमन्त्री कार्यालय कार्यान्वयन संरचना" },
      { en: "Public reporting", ne: "सार्वजनिक प्रतिवेदन" },
      { en: "Review & audit", ne: "समीक्षा र लेखापरीक्षा" },
    ],
    systemInsight:
      "The agenda’s innovation is “common ownership” of all parties’ written promises. That only works if the synthesized document is public and wired into budget lines—otherwise it is a filing exercise.",
    systemInsightNe:
      "एजेन्डाको नवीनता सबै दलका लिखित वाचामा «सामूहिक स्वामित्व» हो। संश्लेषित कागज सार्वजनिक र बजेट शीर्षकसँग जोडिएन भने यो दर्ता अभ्यास मात्र हुन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ३ (National Commitment; scan Page 1)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ३ (राष्ट्रिय प्रतिबद्धता; स्क्यान पृष्ठ १)",
    sourceExcerpt:
      "From scanned agenda: National Commitment—summary of implementable items from manifestos, vachapatras, and commitment letters of all participating parties; GoN shared ownership; link to annual policy & program, budget, reform agenda; immediate OPMCM structure and responsibilities.",
    sourceExcerptNe:
      "स्क्यान गरिएको एजेन्डा: घोषणापत्र, वाचापत्र, प्रतिबद्धतापत्रका कार्यान्वयनयोग्य विषय संक्षेपण गरी राष्ट्रिय प्रतिबद्धता; नेपाल सरकारको साझा स्वामित्व; वार्षिक नीति तथा कार्यक्रम, बजेट, सुधार एजेण्डासँग आबद्ध; तत्काल प्रधानमन्त्री कार्यालय अन्तर्गत संरचना र जिम्मेवारी।",
    layer1: {
      hookEmoji: "🗺️",
      hook: "All party pledges → one National Commitment. Where’s the public map?",
      hookNe: "सबै दलका वाचा → एउटा राष्ट्रिय प्रतिबद्धता। सार्वजनिक नक्सा कहाँ?",
      stakeLine: "Hidden synthesis + no budget link = no shared baseline to hold ministries to.",
      stakeLineNe: "गोप्य संश्लेषण र बजेट जोड बिना मन्त्रालयलाई एउटै आधारमा जवाफदेह बनाउन सकिँदैन।",
      coreQuestionShort: "Where’s the public map of the National Commitment?",
      coreQuestionShortNe: "राष्ट्रिय प्रतिबद्धताको सार्वजनिक नक्सा कहाँ छ?",
      coreQuestion:
        "Who certifies the National Commitment, and how will each line item trace to budget, owner, and review?",
      coreQuestionNe:
        "राष्ट्रिय प्रतिबद्धता कसले प्रमाणित गर्छ, प्रत्येक बुँदा बजेट, जिम्मेवार र समीक्षामा कसरी जोडिन्छ?",
      quickScan: [
        {
          item: "Published manifesto / pledge synthesis register",
          itemNe: "घोषणापत्र/प्रतिबद्धता संश्लेषण दर्ता (प्रकाशित)",
          status: "❌ No public report",
          statusNe: "❌ सार्वजनिक प्रतिवेदन छैन",
        },
        {
          item: "OPMCM “common ownership” structure (public detail)",
          itemNe: "प्रधानमन्त्री कार्यालय «साझा स्वामित्व» संरचना (सार्वजनिक विवरण)",
          status: "⚠️ Details still missing",
          statusNe: "⚠️ विवरण अझै छैन",
        },
        {
          item: "Link demonstrated: policy, program & budget",
          itemNe: "जोड प्रमाणित: नीति, कार्यक्रम र बजेट",
          status: "❌ Not shown yet",
          statusNe: "❌ देखाइएको छैन",
        },
        {
          item: "Public trace: pledge → budget → delivery",
          itemNe: "सार्वजनिक ट्रेस: प्रतिबद्धता → बजेट → वितरण",
          status: "❌ Not in place",
          statusNe: "❌ अझै छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of the Prime Minister and Council of Ministers (structure + synthesis); Ministry of Finance / NPC for budget and program linkage; line ministries as eventual owners of mapped actions.",
      primaryOwnersNe:
        "प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय (संरचना + संश्लेषण); बजेट र कार्यक्रम जोडका लागि अर्थ मन्त्रालय / राष्ट्रिय योजना आयोग; म्याप गरिएका कार्यका अन्तिम जिम्मेवार मन्त्रालयहरू।",
      coordinatingOfficeEn:
        "OPMCM-led unit for National Commitment maintenance, versioning, and cross-government alignment.",
      coordinatingOfficeNe:
        "राष्ट्रिय प्रतिबद्धता अभिलेख, संस्करण र अन्तरसरकारी मिलानका लागि प्रधानमन्त्री कार्यालय नेतृत्वको एकाइ।",
      accountableRolesEn:
        "Named sign-off on final synthesized text; published party attribution per clause; audit trail for changes.",
      accountableRolesNe:
        "अन्तिम संश्लेषित पाठमा नामित स्वीकृति; धारा प्रति दल आबद्धता प्रकाशित; परिवर्तनका लागि लेखा ट्रेल।",
      timelineEn:
        "Immediate: stand up OPMCM structure; 30–90 days: first public register; each budget cycle: trace updates from pledge to appropriation.",
      timelineNe:
        "तत्काल: प्रधानमन्त्री कार्यालय संरचना; ३०–९० दिन: पहिलो सार्वजनिक दर्ता; प्रत्येक बजेट चक्र: प्रतिबद्धतादेखि विनियोजनसम्म ट्रेस अद्यावधिक।",
      milestones: [
        {
          en: "Publish methodology: how manifesto / vachapatra text becomes implementable line items.",
          ne: "विधि प्रकाशन: घोषणापत्र/वाचापत्र पाठ कसरी कार्यान्वयनयोग्य बुँदा बन्छ।",
        },
        {
          en: "Version-controlled National Commitment document with party attribution and change log.",
          ne: "दल आबद्धता र परिवर्तन लगसहित संस्करण नियन्त्रित राष्ट्रिय प्रतिबद्धता कागज।",
        },
        {
          en: "Demonstrated links: each commitment cluster → policy & program line → budget code (published).",
          ne: "जोड प्रमाणित: प्रतिबद्धता समूह → नीति तथा कार्यक्रम पङ्क्ति → बजेट कोड (प्रकाशित)।",
        },
      ],
      kpis: [
        {
          metricEn: "National Commitment document public with version ID (Y/N)",
          metricNe: "संस्करण ID सहित राष्ट्रिय प्रतिबद्धता कागज सार्वजनिक (हो/होइन)",
          howEn: "Stable URL; dated releases; diff or changelog for updates.",
          howNe: "स्थिर URL; मितिसहित प्रकाशन; अद्यावधिकका लागि फरक वा परिवर्तन लग।",
        },
        {
          metricEn: "% of mapped items with published ministry owner + budget trace",
          metricNe: "प्रकाशित मन्त्रालय जिम्मेवार + बजेट ट्रेस भएका म्याप गरिएका बुँदा %",
          howEn: "Open register fields; spot-check sample against Red Book / program documents.",
          howNe: "खुला दर्ता क्षेत्र; रातो पुस्तक/कार्यक्रम कागजसँग नमूना जाँच।",
        },
      ],
      risks: [
        {
          en: "Opaque synthesis allows selective inclusion of party pledges.",
          ne: "अपारदर्शी संश्लेषणले दलका वाचा छान्ने जोखिम।",
        },
        {
          en: "Budget linkage claimed in narrative but not traceable in open data.",
          ne: "बजेट जोड कथनमा दाबी तर खुला डेटामा ट्रेस नहुनु।",
        },
      ],
      escalation: [
        {
          en: "Legislative demand for an independent sampling audit of pledge-to-budget mapping.",
          ne: "प्रतिबद्धता–बजेट म्यापिङको स्वतन्त्र नमूना लेखापरीक्षणका लागि विधायी माग।",
        },
        {
          en: "CSO coalition tracking missing clauses versus original party documents.",
          ne: "मूल दल कागजसँग हराएका धारा पछ्याउने गैरसरकारी गठबन्धन।",
        },
        {
          en: "Share this point to keep the map demand visible (#point-3).",
          ne: "नक्साको माग दृश्य राख्न यो बुँदा साझेदारी गर्नुहोस् (#बुँदा-३)।",
        },
      ],
      programStatusEn: "🔴 No evidence on file — synthesized National Commitment and budget traces not publicly verified here.",
      programStatusNe: "🔴 प्रमाण दर्ता छैन — संश्लेषित राष्ट्रिय प्रतिबद्धता र बजेट ट्रेस यहाँ सार्वजनिक रूपमा प्रमाणित छैन।",
    },
  },
  {
    id: "p4",
    pointNumber: 4,
    category: "Commitment, Coordination & Trust",
    promise:
      "To build national consensus on long-term political and institutional reform, the electoral system, and matters related to constitutional amendment, the Office of the Prime Minister and Council of Ministers shall within 7 days form a task force to prepare a “Constitutional Amendment Debate Paper,” and shall make that debate process participatory, transparent, and fact-based.",
    promiseNe:
      "देशको दीर्घकालीन राजनीतिक तथा संस्थागत सुधार, निर्वाचन प्रणाली लगायतका विषयमा संविधान संशोधनसम्बन्धी विषयहरूमा राष्ट्रिय सहमति निर्माण गर्न प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालयले सात दिनभित्र «संविधान संशोधन बहस पत्र» तयार गर्न कार्यदल गठन गर्ने तथा उक्त बहस प्रक्रियालाई सहभागितामूलक, पारदर्शी र तथ्यमा आधारित बनाउने।",
    question:
      "Who sits on the 7-day task force, when will the Constitutional Amendment Debate Paper be released, what factual basis will it cite, and how will participatory consultation and independent legal review be scheduled before any amendment bill moves forward?",
    questionNe:
      "सात दिने कार्यदलमा को को पर्छन्, संविधान संशोधन बहस पत्र कहिले सार्वजनिक हुन्छ, कुन तथ्य आधार उल्लेख हुन्छ, र कुनै संशोधन विधेयक अगाडि बढ्नुअघि सहभागी परामर्श र स्वतन्त्र कानुनी समीक्षा कसरी तालिकाबद्ध हुन्छ?",
    whyThisMatters:
      "The agenda sets a hard front edge—seven days to stand up the paper that frames consensus. Missing that window signals whether constitutional dialogue is procedural or serious.",
    whyThisMattersNe:
      "एजेन्डाले कडो सुरुवात तोकेको छ — सहमति कोर्ने कागज उठाउन सात दिन। यो म्याद चुक्यो भने संवैधानिक संवाद औपचारिक मात्र कि गम्भीर छ भन्ने संकेत हुन्छ।",
    possiblePathItems: [
      "Published task-force order with names, quorum rules, and 7-day deadline",
      "Debate Paper outline covering electoral system and amendment pathways",
      "Calendar for provincial, local, and civil-society consultation rounds",
      "Independent expert panel review before wider circulation",
      "Archive of submissions and government responses",
    ],
    possiblePathItemsNe: [
      "नाम, कोरम र सात दिने म्यादसहित कार्यदल आदेश प्रकाशन",
      "निर्वाचन प्रणाली र संशोधन मार्गसहित बहस पत्र रूपरेखा",
      "प्रदेश, स्थानीय र नागरिक समाज परामर्श चरणको तालिका",
      "व्यापक प्रचारअघि स्वतन्त्र विज्ञ प्यानल समीक्षा",
      "ज्ञापन र सरकारी प्रतिक्रियाको अभिलेख",
    ],
    constitutionalAmendmentTracker: [
      {
        area: "Constitutional Amendment Debate Paper (task force, 7 days)",
        areaNe: "संविधान संशोधन बहस पत्र (कार्यदल, ७ दिन)",
        status: "🔵 Under Study",
        statusNe: "🔵 अध्ययन अन्तर्गत",
        publicConsultation: "Not Started",
        publicConsultationNe: "सुरु भएको छैन",
        draftPublished: "No",
        draftPublishedNe: "छैन",
        reviewCompleted: "No",
        reviewCompletedNe: "छैन",
        lastUpdated: "Apr 2026",
        lastUpdatedNe: "अप्रिल २०२६",
      },
      {
        area: "Federal–provincial powers",
        areaNe: "संघीय–प्रदेशीय अधिकार",
        status: "🟡 Consultation Phase",
        statusNe: "🟡 परामर्श चरण",
        publicConsultation: "Ongoing",
        publicConsultationNe: "जारी",
        draftPublished: "Partial",
        draftPublishedNe: "आंशिक",
        reviewCompleted: "No",
        reviewCompletedNe: "छैन",
        lastUpdated: "Apr 2026",
        lastUpdatedNe: "अप्रिल २०२६",
      },
      {
        area: "Judicial reforms",
        areaNe: "न्यायिक सुधार",
        status: "🔴 Not Initiated",
        statusNe: "🔴 आरम्भ भएको छैन",
        publicConsultation: "No",
        publicConsultationNe: "छैन",
        draftPublished: "No",
        draftPublishedNe: "छैन",
        reviewCompleted: "No",
        reviewCompletedNe: "छैन",
        lastUpdated: "Mar 2026",
        lastUpdatedNe: "मार्च २०२६",
      },
      {
        area: "Electoral system changes",
        areaNe: "निर्वाचन प्रणाली परिवर्तन",
        status: "🔵 Under Study",
        statusNe: "🔵 अध्ययन अन्तर्गत",
        publicConsultation: "Planned",
        publicConsultationNe: "योजना गरिएको",
        draftPublished: "No",
        draftPublishedNe: "छैन",
        reviewCompleted: "No",
        reviewCompletedNe: "छैन",
        lastUpdated: "Apr 2026",
        lastUpdatedNe: "अप्रिल २०२६",
      },
    ],
    constitutionalReformProcessSteps: [
      { en: "7-day OPMCM task force", ne: "७ दिने प्रधानमन्त्री कार्यालय कार्यदल" },
      { en: "Debate Paper draft", ne: "बहस पत्र मस्यौदा" },
      { en: "Evidence & legal analysis", ne: "प्रमाण र कानुनी विश्लेषण" },
      { en: "Participatory consultation", ne: "सहभागी परामर्श" },
      { en: "National consensus building", ne: "राष्ट्रिय सहमति निर्माण" },
      { en: "Independent review", ne: "स्वतन्त्र समीक्षा" },
      { en: "Formal next steps", ne: "औपचारिक अगाडिका चरण" },
    ],
    processStatusOverview: [
      { en: "7-day task-force formation: To be verified publicly", ne: "७ दिने कार्यदल गठन: सार्वजनिक प्रमाणित गर्न बाँकी" },
      { en: "Debate Paper publication date: Not announced", ne: "बहस पत्र प्रकाशन मिति: घोषणा भएको छैन" },
      { en: "Participation & transparency plan: Not detailed", ne: "सहभागिता र पारदर्शिता योजना: विस्तृत छैन" },
      { en: "Evidence base & expert input: Not disclosed", ne: "प्रमाण आधार र विज्ञ इनपुट: खुलाइएको छैन" },
      { en: "Electoral system scope in paper: Not defined", ne: "बहस पत्रमा निर्वाचन प्रणाली दायरा: परिभाषित छैन" },
    ],
    systemInsight:
      "A Debate Paper in seven days can focus the country—or rush it. Credibility rests on who writes it, what facts it carries, and how soon the public can read it.",
    systemInsightNe:
      "सात दिनभित्रको बहस पत्रले देश केन्द्रित गर्न वा हताराउन सक्छ। विश्वास लेख्ने को, कुन तथ्य बोक्छ, र जनताले कति चाँडो पढ्न पाउँछ भन्नेमा निर्भर छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ४ (Constitutional Amendment Debate Paper; scan Page 2)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ४ (संविधान संशोधन बहस पत्र; स्क्यान पृष्ठ २)",
    sourceExcerpt:
      "From scanned agenda: within 7 days OPMCM forms a task force to prepare the Constitutional Amendment Debate Paper for national consensus on long-term political/institutional reform, the electoral system, and constitutional amendment matters; participatory, transparent, fact-based debate.",
    sourceExcerptNe:
      "स्क्यान गरिएको एजेन्डा: सात दिनभित्र प्रधानमन्त्री कार्यालयले संविधान संशोधन बहस पत्र तयार गर्न कार्यदल गठन; दीर्घकालीन सुधार, निर्वाचन प्रणाली, संविधान संशोधनसम्बन्धी विषयमा राष्ट्रिय सहमति; बहस सहभागितामूलक, पारदर्शी, तथ्यमा आधारित।",
    layer1: {
      hookEmoji: "📜",
      hook: "7 days to name a constitutional debate paper. Who writes—and when do we read it?",
      hookNe: "७ दिनमा संविधान बहस पत्र। को लेख्छ — कहिले पढ्न पाइन्छ?",
      stakeLine: "Trust needs real names, real evidence, and real consultation—not a rushed PDF.",
      stakeLineNe: "विश्वासका लागि वास्तविक नाम, प्रमाण र परामर्च चाहिन्छ — हतारिएको PDF मात्र होइन।",
      coreQuestionShort: "When do we see the constitutional debate paper — for real?",
      coreQuestionShortNe: "संविधान बहस पत्र कहिले देखिन्छ — वास्तवमा?",
      coreQuestion:
        "When will the Debate Paper be released, and how will participatory consultation and independent legal review be scheduled?",
      coreQuestionNe:
        "बहस पत्र कहिले सार्वजनिक हुन्छ, सहभागी परामर्श र स्वतन्त्र कानुनी समीक्षा कसरी तालिकाबद्ध हुन्छ?",
      quickScan: [
        {
          item: "7-day task force (published order, names, deadline)",
          itemNe: "७ दिने कार्यदल (प्रकाशित आदेश, नाम, म्याद)",
          status: "⚠️ Needs public proof",
          statusNe: "⚠️ सार्वजनिक प्रमाण चाहिन्छ",
        },
        {
          item: "Debate Paper publication date",
          itemNe: "बहस पत्र प्रकाशन मिति",
          status: "❌ No date announced",
          statusNe: "❌ मिति घोषणा छैन",
        },
        {
          item: "Participation & transparency plan",
          itemNe: "सहभागिता र पारदर्शिता योजना",
          status: "❌ Not spelled out",
          statusNe: "❌ खुलाइएको छैन",
        },
        {
          item: "Disclosed evidence base & expert input",
          itemNe: "प्रमाण आधार र विज्ञ इनपुट खुलाइएको",
          status: "❌ Not disclosed",
          statusNe: "❌ खुलाइएको छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of the Prime Minister and Council of Ministers (7-day task force and Debate Paper); Legislature and political parties as stakeholders; Attorney General’s office / legal experts for review inputs.",
      primaryOwnersNe:
        "प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय (७ दिने कार्यदल र बहस पत्र); संसद् र राजनीतिक दल सरोकारवाला; कानुनी समीक्षाका लागि महान्यायाधिवक्ता/कानुन विज्ञ।",
      coordinatingOfficeEn:
        "OPMCM secretariat for task-force orders, consultation calendar, and publication of the Debate Paper.",
      coordinatingOfficeNe:
        "कार्यदल आदेश, परामर्श तालिका र बहस पत्र प्रकाशनका लागि प्रधानमन्त्री कार्यालय सचिवालय।",
      accountableRolesEn:
        "Published membership and terms of reference; cited evidence annex; schedule for participatory sessions before any bill.",
      accountableRolesNe:
        "प्रकाशित सदस्यता र कार्यदेश; उल्लेखित प्रमाण अनुसूची; विधेयक अगाडि बढ्नुअघि सहभागी सत्रको तालिका।",
      timelineEn:
        "T+7 days: task-force order and names; T+30–60 days: draft Debate Paper for public comment; pre-bill: independent legal review milestone.",
      timelineNe:
        "T+७ दिन: कार्यदल आदेश र नाम; T+३०–६० दिन: सार्वजनिक टिप्पणीका लागि बहस पत्र मस्यौदा; विधेयकअघि: स्वतन्त्र कानुनी समीक्षा कोसेढुङ्गा।",
      milestones: [
        {
          en: "Gazette or public notice: task force TOR, chair, members, and reporting line.",
          ne: "राजपत्र वा सार्वजनिक सूचना: कार्यदल कार्यदेश, अध्यक्ष, सदस्य र रिपोर्टिङ लाइन।",
        },
        {
          en: "Published Debate Paper with bibliography, legal notes, and electoral-system scope.",
          ne: "ग्रन्थसूची, कानुनी टिप्पणी र निर्वाचन प्रणाली दायरासहित बहस पत्र प्रकाशन।",
        },
        {
          en: "Consultation plan: dates, venues/URLs, minutes, and how feedback alters the text.",
          ne: "परामर्श योजना: मिति, स्थान/URL, मिनेट र प्रतिक्रियाले पाठ कसरी बदलिन्छ।",
        },
      ],
      kpis: [
        {
          metricEn: "Task-force order public with named members (Y/N)",
          metricNe: "नाम खुलाइएका सदस्यसहित कार्यदल आदेश सार्वजनिक (हो/होइन)",
          howEn: "Official URL; appointment dates; conflict-of-interest declarations if published.",
          howNe: "आधिकारिक URL; नियुक्ति मिति; प्रकाशित भए द्वन्द्व-रुचि घोषणा।",
        },
        {
          metricEn: "Debate Paper released + consultation events held (count + documentation)",
          metricNe: "बहस पत्र जारी + परामर्श कार्यक्रम (संख्या + कागजात)",
          howEn: "Video or minutes; submission docket; published response matrix.",
          howNe: "भिडियो वा मिनेट; जम्मा दर्ता; प्रकाशित प्रतिक्रिया म्याट्रिक्स।",
        },
      ],
      risks: [
        {
          en: "Seven-day window becomes a checkbox — weak paper undermines legitimacy.",
          ne: "७ दिने म्याद फारम मात्र — कमजोर पत्रले वैधतामा आँच आउँछ।",
        },
        {
          en: "Electoral reform bundled opaquely with unrelated constitutional issues.",
          ne: "निर्वाचन सुधार असम्बन्धित संविधान विषयसँग अपारदर्शी रूपमा गाँसिनु।",
        },
      ],
      escalation: [
        {
          en: "Public interest litigation or legislative hold until consultation criteria are met.",
          ne: "परामर्श मापदण्ड पूरा नभएसम्म सार्वजनिक हित वा विधायी रोक।",
        },
        {
          en: "Academia and bar associations publish parallel evidence reviews.",
          ne: "विद्यालय र बार संघले समानान्तर प्रमाण समीक्षा प्रकाशन।",
        },
        {
          en: "Share this point so deadlines stay in the public eye (#point-4).",
          ne: "म्याद सार्वजनिक दृष्टिमा राख्न यो बुँदा साझेदारी गर्नुहोस् (#बुँदा-४)।",
        },
      ],
      programStatusEn: "🟡 At risk — 7-day institutional start not publicly verified; paper and consultation trail still missing.",
      programStatusNe: "🟡 जोखिममा — ७ दिने संस्थागत सुरुवात सार्वजनिक प्रमाणित छैन; पत्र र परामर्श ट्रेल अझै छैन।",
    },
  },
  {
    id: "p5",
    pointNumber: 5,
    category: "Commitment, Coordination & Trust",
    promise:
      "Formally acknowledge injustice, discrimination, and denial of opportunity against Dalit and historically excluded communities arising from the state, society, and policy structures; within 15 days, issue a formal state apology with a plea for forgiveness and announce reform-oriented programs to prepare the ground for social justice, inclusive restoration, and historical reconciliation.",
    promiseNe:
      "दलित तथा ऐतिहासिक रूपमा बहिष्कृत समुदायमाथि राज्य, समाज र नीतिगत संरचनाबाट भएका अन्याय, विभेद र अवसरवञ्चनाको औपचारिक स्वीकारोक्ति गर्दै सामाजिक न्याय, समावेशी पुनस्र्थापना र ऐतिहासिक मेलमिलापको आधार तयार गर्न १५ दिनभित्र राज्यका तर्फबाट औपचारिक क्षमायाचनासहित सुधारमुखी कार्यक्रम घोषणा गर्ने।",
    question:
      "What will the apology text contain and who signs it, which programs are in the 15-day package (budget, beneficiaries, agencies), how will affected communities co-design implementation, and what indicators will show whether reconciliation is real?",
    questionNe:
      "माफीको पाठमा के हुन्छ र को हस्ताक्षर गर्छ, पन्ध्र दिने प्याकेजमा कुन कार्यक्रम (बजेट, लाभार्थी, निकाय), प्रभावित समुदायले कार्यान्वयन कसरी सह-डिजाइन गर्छन्, र मेलमिलाप वास्तविक छ भन्ने देखाउने सूचक के हुन्छ?",
    whyThisMatters:
      "Symbolic repair must arrive with operational commitments; a deadline (15 days) makes the state testable in public view.",
    whyThisMattersNe:
      "प्रतीकात्मक उपचार सञ्चालन प्रतिबद्धतासँग आउनुपर्छ; पन्ध्र दिने म्यादले राज्यलाई सार्वजनिक रूपमा जाँच्न योग्य बनाउँछ।",
    possiblePathItems: [
      "Published apology document with scope of acknowledged harms",
      "Line-item list of 15-day program launches with ministers accountable",
      "Participatory design sessions with Dalit and historically excluded representatives",
      "Independent monitoring board or civil-society observers",
      "Annual reconciliation and outcomes report",
    ],
    possiblePathItemsNe: [
      "हानिको दायरा उल्लेखसहित सार्वजनिक माफी कागज",
      "मन्त्री जवाफदेहितासहित पन्ध्र दिने कार्यक्रम सूची",
      "दलित र बहिष्कृत समुदायका प्रतिनिधिसहित सहभागी डिजाइन बैठक",
      "स्वतन्त्र निगरानी बोर्ड वा नागरिक समाज पर्यवेक्षक",
      "वार्षिक मेलमिलाप र नतिजा प्रतिवेदन",
    ],
    inclusionMonitoringMatrix: [
      {
        area: "Historical injustice (Dalit & excluded)",
        areaNe: "ऐतिहासिक अन्याय (दलित र बहिष्कृत)",
        currentRecognition: "Agenda: formal acknowledgment (state, society, policy structures)",
        currentRecognitionNe: "एजेन्डा: औपचारिक स्वीकारोक्ति (राज्य, समाज, नीतिगत संरचना)",
        policyMechanismNeeded: "Written apology + restorative policy package",
        policyMechanismNeededNe: "लिखित क्षमायाचनासहित माफी + पुनस्र्थापनात्मक नीति प्याकेज",
        measurementApproach: "Documented harm scope + response milestones",
        measurementApproachNe: "कागजातीकृत हानि दायरा र प्रतिक्रिया कोसेढुङ्गा",
        publicVisibility: "Full text of apology and program registry",
        publicVisibilityNe: "माफी पूर्ण पाठ र कार्यक्रम दर्ता",
      },
      {
        area: "15-day reform launch",
        areaNe: "१५ दिने सुधार सुरुवात",
        currentRecognition: "Deadline stated in Cabinet agenda",
        currentRecognitionNe: "मन्त्रिपरिषद् एजेन्डामा म्याद उल्लेख",
        policyMechanismNeeded: "Ministerial rollout plans with budgets",
        policyMechanismNeededNe: "बजेटसहित मन्त्रालयगत विस्तार योजना",
        measurementApproach: "Day-15 checklist: announced vs. operational",
        measurementApproachNe: "दिन १५ चेकलिस्ट: घोषित बनाम सञ्चालन",
        publicVisibility: "Press releases + implementation portals",
        publicVisibilityNe: "प्रेस विज्ञप्ति र कार्यान्वयन पोर्टल",
      },
      {
        area: "Social justice & access",
        areaNe: "सामाजिक न्याय र पहुँच",
        currentRecognition: "Focus on injustice, discrimination, opportunity denial",
        currentRecognitionNe: "अन्याय, विभेद, अवसरवञ्चनामा केन्द्रित",
        policyMechanismNeeded: "Targeted services (education, employment, justice)",
        policyMechanismNeededNe: "लक्षित सेवा (शिक्षा, रोजगार, न्याय)",
        measurementApproach: "Equity indicators by sector",
        measurementApproachNe: "क्षेत्रगत समानता सूचक",
        publicVisibility: "Sectoral inclusion dashboards",
        publicVisibilityNe: "क्षेत्रगत समावेश ड्यासबोर्ड",
      },
      {
        area: "Reconciliation process",
        areaNe: "मेलमिलाप प्रक्रिया",
        currentRecognition: "Inclusive restoration named in agenda",
        currentRecognitionNe: "एजेन्डामा समावेशी पुनस्र्थापना",
        policyMechanismNeeded: "Dialogue forums and grievance redress",
        policyMechanismNeededNe: "संवाद मञ्च र गुनासो निवारण",
        measurementApproach: "Participation rates & outcome surveys",
        measurementApproachNe: "सहभागिता दर र नतिजा सर्वेक्षण",
        publicVisibility: "Public reconciliation updates",
        publicVisibilityNe: "सार्वजनिक मेलमिलाप अद्यावधिक",
      },
    ],
    inclusionFrameworkStatus: [
      { en: "Formal apology issued: To be verified (15-day window)", ne: "औपचारिक माफी: प्रमाणित गर्न बाँकी (१५ दिने म्याद)" },
      { en: "15-day program catalog: Not published", ne: "१५ दिने कार्यक्रम सूची: प्रकाशित छैन" },
      { en: "Community co-design mechanism: Not defined", ne: "समुदाय सह-डिजाइन संयन्त्र: परिभाषित छैन" },
      { en: "Dedicated budget lines for package: Not disclosed", ne: "प्याकेजका लागि छुट्टै बजेट शीर्षक: खुलाइएको छैन" },
    ],
    systemInsight:
      "Apologies matter when they are specific, resourced, and co-owned with those harmed. The 15-day clock turns a pledge into a public test.",
    systemInsightNe:
      "माफी तब अर्थपूर्ण हुन्छ जब ठोस, स्रोतसहित र पीडितसँग साझा मालिकानामा हुन्छ। पन्ध्र दिने घडीले वाचालाई सार्वजनिक जाँच बनाउँछ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ५ (Dalit/marginalized apology & programs; scan Page 2)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ५ (दलित/बहिष्कृत; क्षमायाचना र कार्यक्रम; स्क्यान पृष्ठ २)",
    sourceExcerpt:
      "From scanned agenda: formal acknowledgment of injustice, discrimination, and opportunity denial against Dalit and historically excluded communities (state, society, policy structures); within 15 days, formal apology with plea for forgiveness and reform programs for social justice, inclusive restoration, historical reconciliation.",
    sourceExcerptNe:
      "स्क्यान गरिएको एजेन्डा: दलित तथा ऐतिहासिक रूपमा बहिष्कृत समुदायमाथि राज्य, समाज, नीतिगत संरचनाबाट अन्याय, विभेद, अवसरवञ्चना औपचारिक स्वीकारोक्ति; १५ दिनभित्र राज्यबाट औपचारिक क्षमायाचनासहित सुधारमुखी कार्यक्रम — सामाजिक न्याय, समावेशी पुनस्र्थापना, ऐतिहासिक मेलमिलापको आधार।",
    layer1: {
      hookEmoji: "⚖️",
      hook: "15 days: state apology + repair programs. Show us the budget.",
      hookNe: "१५ दिन: राज्यीय माफी + सुधार। बजेट देखाउनुहोस्।",
      stakeLine: "Without programs built with affected communities, it’s a headline—not repair.",
      stakeLineNe: "प्रभावित समुदायसँग बनेका कार्यक्रम बिना यो शीर्षक मात्र हो — उपचार होइन।",
      coreQuestionShort: "Where’s the apology text, programs, and budget — in public?",
      coreQuestionShortNe: "माफी पाठ, कार्यक्रम र बजेट — सार्वजनिक कहाँ छ?",
      coreQuestion:
        "What will the apology say, who signs it, and which 15-day programs (budget, agencies) will be published?",
      coreQuestionNe:
        "माफीमा के हुन्छ, को हस्ताक्षर गर्छ, र कुन पन्ध्र दिने कार्यक्रम (बजेट, निकाय) प्रकाशित हुन्छन्?",
      quickScan: [
        {
          item: "Formal apology text (public, specific scope)",
          itemNe: "औपचारिक माफी पाठ (सार्वजनिक, स्पष्ट दायरा)",
          status: "⚠️ Not verified yet",
          statusNe: "⚠️ अझै प्रमाणित छैन",
        },
        {
          item: "15-day program catalog with budgets",
          itemNe: "बजेटसहित पन्ध्र दिने कार्यक्रम सूची",
          status: "❌ No public report",
          statusNe: "❌ सार्वजनिक सूची छैन",
        },
        {
          item: "Community co-design mechanism",
          itemNe: "समुदाय सह-डिजाइन संयन्त्र",
          status: "❌ Not defined",
          statusNe: "❌ परिभाषित छैन",
        },
        {
          item: "Dedicated budget lines disclosed",
          itemNe: "छुट्टै बजेट शीर्षक खुलाइएको",
          status: "❌ Not disclosed",
          statusNe: "❌ खुलाइएको छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Council of Ministers / Prime Minister’s Office for the formal apology and cross-cutting package; Ministry of Women, Children and Senior Citizens and Ministry of Social Development (or successor line) for targeted programs; Ministry of Finance for budget lines.",
      primaryOwnersNe:
        "औपचारिक माफी र अन्तरक्षेत्रीय प्याकेजका लागि मन्त्रिपरिषद् / प्रधानमन्त्री कार्यालय; लक्षित कार्यक्रमका लागि महिला, बालबालिका तथा ज्येष्ठ नागरिक मन्त्रालय र सामाजिक विकास मन्त्रालय (वा उत्तराधिकारी); बजेट शीर्षकका लागि अर्थ मन्त्रालय।",
      coordinatingOfficeEn:
        "OPMCM or designated inter-ministerial cell to synchronize the 15-day announcement with sector plans and monitoring.",
      coordinatingOfficeNe:
        "पन्ध्र दिने घोषणालाई क्षेत्रगत योजना र निगरानीसँग मिलाउन प्रधानमन्त्री कार्यालय वा निर्दिष्ट अन्तरमन्त्रालय एकाइ।",
      accountableRolesEn:
        "Named signatories on apology instrument; published program sheet with agencies, beneficiaries, and budget; co-design protocol with Dalit and excluded-community representatives.",
      accountableRolesNe:
        "माफी कागजमा नामित हस्ताक्षरकर्ता; निकाय, लाभार्थी र बजेटसहित प्रकाशित कार्यक्रम पाना; दलित र बहिष्कृत समुदाय प्रतिनिधिसँग सह-डिजाइन प्रोटोकल।",
      timelineEn:
        "T+15 days: apology text + program catalog; +30 days: implementation guidelines; quarterly: published inclusion/reconciliation indicators.",
      timelineNe:
        "T+१५ दिन: माफी पाठ + कार्यक्रम सूची; +३० दिन: कार्यान्वदेश निर्देशिका; त्रैमासिक: समावेश/मेलमिलाप सूचक प्रकाशित।",
      milestones: [
        {
          en: "Publish full apology text (Nepali + English) with scope of acknowledged harms.",
          ne: "स्वीकार गरिएका हानीको दायरासहित पूर्ण माफी पाठ (नेपाली + अङ्ग्रेजी) प्रकाशन।",
        },
        {
          en: "Itemized 15-day program list: budget, targets, responsible agencies, grievance path.",
          ne: "पन्ध्र दिने कार्यक्रम सूची: बजेट, लक्ष्य, जिम्मेवार निकाय, गुनासो मार्ग।",
        },
        {
          en: "Co-design charter: how affected communities approve or amend delivery design.",
          ne: "सह-डिजाइन चार्टर: प्रभावित समुदायले वितरण डिजाइन कसरी स्वीकृति वा संशोधन गर्छन्।",
        },
      ],
      kpis: [
        {
          metricEn: "Apology instrument public with signatory roles (Y/N)",
          metricNe: "हस्ताक्षर भूमिकासहित माफी कागज सार्वजनिक (हो/होइन)",
          howEn: "Official portal PDF; archive date; accessible plain-language summary.",
          howNe: "आधिकारिक पोर्टल PDF; अभिलेख मिति; सरल भाषा सार।",
        },
        {
          metricEn: "Program rows with budget + beneficiary definition (count / completeness %)",
          metricNe: "बजेट + लाभार्थी परिभाषासहित कार्यक्रम पङ्क्ति (संख्या / पूर्णता %)",
          howEn: "Open table; random audit by CSO or legislature on three sample programs.",
          howNe: "खुला तालिका; तीन नमूना कार्यक्रममा गैरसरकारी वा संसद् जाँच।",
        },
      ],
      risks: [
        {
          en: "Symbolic statement without resourced programs deepens distrust.",
          ne: "स्रोतविहीन कार्यक्रम बिनाको प्रतीकात्मक घोषणाले अविश्वास बढाउँछ।",
        },
        {
          en: "Token consultation — affected groups not in decision rooms.",
          ne: "प्रारूपिक परामर्च — प्रभावित समूह निर्णय कोठामा छैनन्।",
        },
      ],
      escalation: [
        {
          en: "Community-led public scorecards on apology implementation milestones.",
          ne: "माफी कार्यान्वयन कोसेढुङ्गामा समुदाय नेतृत्वको सार्वजनिक स्कोरकार्ड।",
        },
        {
          en: "National Human Rights Commission thematic follow-up if programs stall.",
          ne: "कार्यक्रम अड्किए राष्ट्रिय मानव अधिकार आयोगको विषयगत पछ्याइ।",
        },
        {
          en: "Share this point so the 15-day test stays visible (#point-5).",
          ne: "१५ दिने जाँच दृश्य राख्न यो बुँदा साझेदारी गर्नुहोस् (#बुँदा-५)।",
        },
      ],
      programStatusEn: "🔴 No evidence on file — apology text, program catalog, and budget traces not publicly verified here.",
      programStatusNe: "🔴 प्रमाण दर्ता छैन — माफी पाठ, कार्यक्रम सूची र बजेट ट्रेस यहाँ सार्वजनिक रूपमा प्रमाणित छैन।",
    },
  },
  {
    id: "p6",
    pointNumber: 6,
    category: "Commitment, Coordination & Trust",
    promise:
      "Pursue an integrated initiative for justice, rehabilitation, and restoration of trust in the state among families and citizens affected by incidents during the Gen Z movement on Bhadra 23–24, 2082 BS. Under this initiative: collect and verify statistics on families of martyrs and injured persons and, within 100 days, implement a coordinated package—according to eligibility—including employment opportunities in government, public, and private sectors, skills development, psychosocial counselling, and rehabilitation assistance, ensuring dignified rehabilitation, security of livelihood, and social protection; and concurrently, on the basis of the report of the Gauri Bahadur Karki Commission constituted to inquire into the truth of incidents during that movement, immediately advance necessary investigation, disciplinary or administrative action, and prosecution against responsible persons and parties in accordance with prevailing law.",
    promiseNe:
      "सम्वत् २०८२ भदौ २३ र २४ मा भएको जेन-जी (Gen Z) आन्दोलनका क्रममा भएका घटनाबाट प्रभावित परिवार र नागरिकहरूको न्याय, पुनस्र्थापना र राज्यप्रतिको विश्वास पुनस्र्थापना गर्न एकीकृत पहल गर्ने। यस पहल अन्तर्गत शहीदका परिवार तथा घाइतेहरूको तथ्याङ्क सङ्कलन तथा प्रमाणीकरण गरी सम्मानजनक पुनस्र्थापना, जीवनयापनको सुरक्षा र सामाजिक संरक्षण सुनिश्चित गर्न १०० दिनभित्र योग्यताअनुसार सरकारी, सार्वजनिक र निजी क्षेत्रमा रोजगारीका अवसर, सीप विकास, मनोसामाजिक परामर्श तथा पुनस्र्थापना सहायता समेटिएको समन्वित प्याकेज कार्यान्वयन गर्ने; साथै उक्त आन्दोलनका क्रममा भएका घटनाको सत्यतथ्य छानबिन गर्न गठित गौरीबहादुर कार्की आयोगको प्रतिवेदनका आधारमा दोषी व्यक्ति तथा पक्षहरूमाथि प्रचलित कानूनबमोजिम आवश्यक अनुसन्धान, कारबाही र अभियोजन प्रक्रिया तत्काल अघि बढाउने।",
    question:
      "What exactly will the 100-day coordinated package include (budget, agencies, eligibility, and delivery channels), how will outcomes for families and victims be tracked and published, and what concrete legal steps will follow the Karki Commission findings?",
    questionNe:
      "१०० दिने समन्वित प्याकेजमा के के पर्छ (बजेट, निकाय, योग्यता र वितरण माध्यम), पीडित र परिवारका नतिजा कसरी ट्र्याक र सार्वजनिक गरिन्छ, र कार्की आयोगका निष्कर्षअनुसार कुन ठोस कानुनी चरण हुन्छ?",
    whyThisMatters:
      "After high-casualty political violence, public trust depends on timely, transparent remedies—not only statements. Without clear packages, timelines, and accountability for recommendations, grievances deepen and reconciliation fails.",
    whyThisMattersNe:
      "ठूलो हिंसापछि जनविश्वास समयमै र पारदर्शी उपचारमा निर्भर छ — मात्र घोषणामा होइन। स्पष्ट प्याकेज, समयसीमा र सिफारिसप्रति जवाफदेहिता बिना गुनासो गहिरिन्छ र मेलमिलाप कमजोर हुन्छ।",
    possiblePathItems: [
      "Publish an itemized 100-day package with responsible agencies and milestones",
      "Dedicated tracking and public reporting for employment, training, and counseling delivery",
      "Victim support desks with documented referral pathways",
      "Prosecutorial and administrative follow-through tied to commission findings",
      "Independent monitoring or legislative oversight of implementation",
    ],
    possiblePathItemsNe: [
      "जिम्मेवार निकाय र कोसेढुङ्गासहित विस्तृत १०० दिने प्याकेज सार्वजनिक गर्ने",
      "रोजगार, तालिम र परामर्श वितरणको ट्र्याकिङ र सार्वजनिक प्रतिवेदन",
      "कागजातीकृत सिफारिस मार्गसहित पीडित सहयोग डेस्क",
      "आयोगका निष्कर्षसँग जोडिएको अभियोजन र प्रशासनिक कारबाही",
      "कार्यान्वयनको स्वतन्त्र निगरानी वा विधायी निरीक्षण",
    ],
    systemInsight:
      "Movements of this scale require operational clarity: who is helped, how, by when, and how the public can verify progress. Otherwise commitments read as crisis management rather than justice.",
    systemInsightNe:
      "यस्तो स्तरको आन्दोलनपछि सञ्चालन स्पष्टता चाहिन्छ: कसलाई, कसरी, कहिलेसम्म, र प्रगति जनताले कसरी प्रमाणित गर्छ। नभए प्रतिबद्धता न्यायभन्दा संकट व्यवस्थापन जस्तो देखिन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ६ (Gen Z movement / 100-day package; scan Page 2)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ६ (जेन-जी आन्दोलन / १०० दिने प्याकेज; स्क्यान पृष्ठ २)",
    sourceExcerpt:
      "From scanned agenda (section क): integrated initiative for justice, rehabilitation, trust in state for those affected by Gen Z movement (Bhadra 23–24, 2082); martyr/injured family statistics collection & verification; 100-day coordinated package (eligible govt/public/private jobs, skills, psychosocial, rehabilitation aid); Karki Commission report—immediate investigation, action, prosecution per law.",
    sourceExcerptNe:
      "स्क्यान (खण्ड क): २०८२ भदौ २३ र २४ जेन-जी (Gen Z) आन्दोलन प्रभावितका न्याय, पुनस्र्थापना, राज्यप्रतिको विश्वास — एकीकृत पहल; शहीद/घाइते तथ्याङ्क सङ्कलन-प्रमाणीकरण; १०० दिने समन्वित प्याकेज (योग्यताअनुसार रोजगार, सीप, मनोसामाजिक, पुनस्र्थापना सहायता); गौरीबहादुर कार्की आयोग प्रतिवेदन — कानूनबमोजिम अनुसन्धान, कारबाही, अभियोजन तत्काल।",
    layer1: {
      hookEmoji: "🕊️",
      hook: "100 days for victims and families. Where’s the published package?",
      hookNe: "१०० दिन: पीडित र परिवार। प्रकाशित प्याकेज कहाँ छ?",
      stakeLine: "Justice needs budgets, services, and legal follow-through citizens can verify.",
      stakeLineNe: "न्यायका लागि बजेट, सेवा र कानुनी पछ्याइ नागरिकले प्रमाणित गर्न सक्नुपर्छ।",
      coreQuestionShort: "Where’s the 100-day package and commission follow-through — in public?",
      coreQuestionShortNe: "१०० दिने प्याकेज र आयोग पछ्याइ — सार्वजनिक कहाँ छ?",
      coreQuestion:
        "What will the 100-day package include, how will outcomes be tracked and published, and what legal steps follow the Karki Commission report?",
      coreQuestionNe:
        "१०० दिने प्याकेजमा के के पर्छ, नतिजा कसरी ट्र्याक र सार्वजनिक हुन्छ, र कार्की आयोग प्रतिवेदनपछि कुन कानुनी चरण?",
      quickScan: [
        {
          item: "Verified martyr/injured registry + published statistics",
          itemNe: "प्रमाणित शहीद/घाइते दर्ता र सार्वजनिक तथ्याङ्क",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Itemized 100-day package (budget, agencies, eligibility)",
          itemNe: "विस्तृत १०० दिने प्याकेज (बजेट, निकाय, योग्यता)",
          status: "❌ No public report",
          statusNe: "❌ सार्वजनिक प्रतिवेदन छैन",
        },
        {
          item: "Investigation / prosecution steps tied to Karki Commission findings",
          itemNe: "कार्की आयोग निष्कर्षसँग जोडिएको अनुसन्धान/अभियोजन",
          status: "⚠️ Not verified publicly",
          statusNe: "⚠️ सार्वजनिक प्रमाण छैन",
        },
        {
          item: "Public dashboards for jobs, counselling, rehabilitation delivery",
          itemNe: "रोजगार, परामर्श, पुनस्र्थापना वितरणका सार्वजनिक ड्यासबोर्ड",
          status: "❌ None available",
          statusNe: "❌ उपलब्ध छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of the Prime Minister and Council of Ministers (coordination); Ministry of Home Affairs; Ministry of Labour, Employment and Social Security; Ministry of Women, Children and Senior Citizens; Attorney General’s Office / police / courts for investigation and prosecution per law.",
      primaryOwnersNe:
        "प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय (समन्वय); गृह मन्त्रालय; श्रम, रोजगार तथा सामाजिक सुरक्षा मन्त्रालय; महिला, बालबालिका तथा ज्येष्ठ नागरिक मन्त्रालय; अनुसन्धान र अभियोजनका लागि महान्यायाधिवक्ता/प्रहरी/अदालत।",
      coordinatingOfficeEn:
        "OPMCM-led cell for cross-ministry 100-day package delivery; line ministries accountable for published service outputs.",
      coordinatingOfficeNe:
        "अन्तरमन्त्रालय १०० दिने प्याकेज वितरणका लागि प्रधानमन्त्री कार्यालय नेतृत्वको एकाइ; प्रकाशित सेवा नतिजाका लागि मन्त्रालय जिम्मेवार।",
      accountableRolesEn:
        "Named focal agencies for registry, benefits, and legal follow-up; public reporting on commission-recommended actions.",
      accountableRolesNe:
        "दर्ता, सुविधा र कानुनी पछ्याइका लागि नामित फोकल निकाय; आयोग सिफारिस कारबाहीको सार्वजनिक प्रतिवेदन।",
      timelineEn:
        "T+100 days: coordinated package milestones; concurrent: commission-based investigation and prosecution advanced “immediately” per agenda text.",
      timelineNe:
        "T+१०० दिन: समन्वित प्याकेज कोसेढुङ्गा; सँगसँगै: एजेन्डा अनुसार आयोग आधारित अनुसन्धान र अभियोजन तत्काल अगाडि।",
      milestones: [
        {
          en: "Publish verified statistics methodology and open registry fields for affected families.",
          ne: "प्रभावित परिवारका लागि प्रमाणित तथ्याङ्क विधि र खुला दर्ता क्षेत्र प्रकाशन।",
        },
        {
          en: "Release itemized 100-day package with budget lines and eligibility rules.",
          ne: "बजेट शीर्षक र योग्यता नियमसहित विस्तृत १०० दिने प्याकेज जारी।",
        },
        {
          en: "Publish a response matrix: each Karki Commission recommendation → agency → status → date.",
          ne: "प्रत्येक कार्की सिफारिस → निकाय → स्थिति → मिति प्रतिक्रिया म्याट्रिक्स सार्वजनिक।",
        },
      ],
      kpis: [
        {
          metricEn: "100-day package document public (Y/N + URL)",
          metricNe: "१०० दिने प्याकेज कागज सार्वजनिक (हो/होइन + URL)",
          howEn: "Single government index page; version date; annexes for agencies.",
          howNe: "एक सरकारी सूची पृष्ठ; संस्करण मिति; निकाय अनुसूची।",
        },
        {
          metricEn: "Published outcomes: families served / jobs / counselling sessions (minimum quarterly)",
          metricNe: "सार्वजनिक नतिजा: सेवा पाएका परिवार/रोजगार/परामर्ध (कम्तीमा त्रैमासिक)",
          howEn: "Open statistics with definitions; third-party or legislative spot-check possible.",
          howNe: "परिभाषासहित खुला तथ्याङ्क; तेस्रो पक्ष वा संसद् नमूना जाँच।",
        },
      ],
      risks: [
        {
          en: "Package stays a press event — delivery channels never documented.",
          ne: "प्याकेज प्रेस कार्यक्रम मात्र — वितरण मार्ग कागजात हुँदैन।",
        },
        {
          en: "Legal processes stall while public attention moves on.",
          ne: "सार्वजनिक ध्यान सर्दा कानुनी प्रक्रिया अड्किन्छ।",
        },
      ],
      escalation: [
        {
          en: "Victim associations and media ask for line-by-line package proof.",
          ne: "पीडित संघ र सञ्चारले पङ्क्तिवार प्याकेज प्रमाण माग।",
        },
        {
          en: "Parliamentary questions on 100-day milestones and prosecution dockets.",
          ne: "१०० दिने कोसेढुङ्गा र अभियोजन दर्तामाथि संसदीय प्रश्न।",
        },
        {
          en: "Share this point to keep pressure visible (#point-6).",
          ne: "दबाब दृश्य राख्न यो बुँदा साझेदारी गर्नुहोस् (#बुँदा-६)।",
        },
      ],
      programStatusEn: "🔴 No evidence on file — package, registry, and commission follow-through not publicly verified here.",
      programStatusNe: "🔴 प्रमाण दर्ता छैन — प्याकेज, दर्ता र आयोग पछ्याइ यहाँ सार्वजनिक रूपमा प्रमाणित छैन।",
    },
  },
  {
    id: "p7",
    pointNumber: 7,
    category: "Commitment, Coordination & Trust",
    promise:
      "Form a high-level investigation committee within one week to inquire into the truth of the incident that occurred on Bhadra 24, 2082 BS; mandate it to collect and analyze all incident-related details, identify responsible parties, and submit a report within a fixed time limit; and advance any further necessary action processes on the basis of the committee’s recommendations.",
    promiseNe:
      "सम्वत् २०८२ भाद्र २४ गते घटेको घटनाको सत्यतथ्य छानबिन गर्न एक उच्चस्तरीय छानबिन समिति एक हप्ताभित्र गठन गर्ने। उक्त समितिलाई घटनासम्बन्धी सम्पूर्ण विवरण सङ्कलन, विश्लेषण तथा जिम्मेवार पक्ष पहिचान गरी निश्चित समयसीमाभित्र प्रतिवेदन पेश गर्न कार्यादेश दिने तथा समितिको सिफारिसका आधारमा आवश्यक थप कारबाही प्रक्रिया अघि बढाउने।",
    question:
      "What are the committee’s mandate, membership, powers to compel evidence, timeline for findings, and mechanisms to publish a full report and act on its conclusions?",
    questionNe:
      "समितिको कार्यदेश, सदस्यता, प्रमाण जुटाउने अधिकार, निष्कर्षका लागि समयसीमा, पूर्ण प्रतिवेदन सार्वजनिक गर्ने र निष्कर्षअनुसार कार्य गर्ने संयन्त्र के हुनेछ?",
    whyThisMatters:
      "Without an independent, time-bound inquiry with public reporting, contested events erode legitimacy. Clarity on facts is a prerequisite for accountability and reform.",
    whyThisMattersNe:
      "स्वतन्त्र, समयबद्ध र सार्वजनिक प्रतिवेदनयुक्त छानबिन बिना विवादित घटनाले वैधता कमजोर बनाउँछ। तथ्य स्पष्टता जवाफदेहिता र सुधारको पूर्वशर्त हो।",
    possiblePathItems: [
      "Publish terms of reference and named members within the stated deadline",
      "Secure access to witnesses, documents, and security footage where relevant",
      "Interim and final reports with structured findings and recommendations",
      "Public release of the report and a government response plan",
      "Follow-through on criminal or disciplinary processes where warranted",
    ],
    possiblePathItemsNe: [
      "तोकिएको समयभित्र कार्यक्षेत्र र नामित सदस्य सार्वजनिक गर्ने",
      "साक्षी, कागजात र सुरक्षा फुटेजसम्म पहुँच सुनिश्चित गर्ने",
      "संरचित निष्कर्ष र सिफारिससहित अन्तरिम र अन्तिम प्रतिवेदन",
      "प्रतिवेदन सार्वजनिकीकरण र सरकारी प्रतिक्रिया योजना",
      "आवश्यक ठाउँमा फौजदारी वा अनुशासनिक प्रक्रिया पूरा गर्ने",
    ],
    systemInsight:
      "Investigations only restore trust when their outputs are visible: who was heard, what was found, and what will change as a result.",
    systemInsightNe:
      "छानबिनले तब मात्र विश्वास फर्काउँछ जब नतिजा देखिन्छ: कसको बयान, के पत्ता लाग्यो, र परिणामस्वरूप के बदलिन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ७ (Bhadra 24, 2082 BS incident inquiry; scan Page 2)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ७ (भाद्र २४ गते; स्क्यान पृष्ठ २)",
    sourceExcerpt:
      "From scanned agenda: within one week, high-level committee on truth of Bhadra 24, 2082 incident; collect/analyze details, identify responsible parties, report in fixed time; further action per recommendations.",
    sourceExcerptNe:
      "स्क्यान: २०८२ भाद्र २४ गतेको घटनाको सत्यतथ्य छानबिन — एक हप्तामा उच्चस्तरीय समिति; विवरण सङ्कलन/विश्लेषण, जिम्मेवार पक्ष, निश्चित म्यादमा प्रतिवेदन; सिफारिसअनुसार थप कारबाही।",
    layer1: {
      hookEmoji: "🔎",
      hook: "One week to name a Bhadra 24 inquiry. Who sits — and when do we read the report?",
      hookNe: "एक हप्ता: भाद्र २४ छानबिन। को बस्छ — प्रतिवेदन कहिले?",
      stakeLine: "Credibility needs published TOR, names, powers to gather evidence, and a firm reporting date.",
      stakeLineNe: "विश्वासका लागि कार्यदेश, नाम, प्रमाण जुटाउने अधिकार र प्रतिवेदन मिति सार्वजनिक हुनुपर्छ।",
      coreQuestionShort: "Where’s the committee order, membership, and timeline — in public?",
      coreQuestionShortNe: "समिति आदेश, सदस्यता र समयसीमा — सार्वजनिक कहाँ छ?",
      coreQuestion:
        "What are the mandate, membership, powers, timeline, and publication plan for the Bhadra 24 inquiry?",
      coreQuestionNe:
        "भाद्र २४ छानबिनको कार्यदेश, सदस्यता, अधिकार, समयसीमा र प्रकाशन योजना के हो?",
      quickScan: [
        {
          item: "Committee formation order + TOR within 7 days (public)",
          itemNe: "७ दिनभित्र समिति गठन आदेश + कार्यदेश (सार्वजनिक)",
          status: "⚠️ Needs public proof",
          statusNe: "⚠️ सार्वजनिक प्रमाण चाहिन्छ",
        },
        {
          item: "Named members + powers to compel evidence",
          itemNe: "नाम खुलाइएका सदस्य + प्रमाण जुटाउने अधिकार",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Fixed deadline for final report + publication plan",
          itemNe: "अन्तिम प्रतिवेदनको निश्चित म्याद + प्रकाशन योजना",
          status: "❌ Not announced",
          statusNe: "❌ घोषणा छैन",
        },
        {
          item: "Government response plan to committee recommendations",
          itemNe: "समिति सिफारिसमा सरकारी प्रतिक्रिया योजना",
          status: "❌ Not in place",
          statusNe: "❌ अझै छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Government of Nepal / Office of the Prime Minister and Council of Ministers (committee formation); Ministry of Home Affairs; Nepal Police / Attorney General’s Office as relevant to evidence and prosecution.",
      primaryOwnersNe:
        "नेपाल सरकार / प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय (समिति गठन); गृह मन्त्रालय; प्रमाण र अभियोजन सम्बन्धी नेपाल प्रहरी / महान्यायाधिवक्ता।",
      coordinatingOfficeEn:
        "OPMCM for gazette/public notice of the high-level committee and inter-agency cooperation.",
      coordinatingOfficeNe: "उच्चस्तरीय समितिका लागि राजपत्र/सूचना र अन्तरनिकाय सहकार्य — प्रधानमन्त्री कार्यालय।",
      accountableRolesEn:
        "Committee chair and members accountable for timely, evidence-based findings; line agencies must respond to recommendations in writing.",
      accountableRolesNe:
        "समिति अध्यक्ष र सदस्य समयमै प्रमाण आधारित निष्कर्षका जिम्मेवार; निकायले सिफारिसको लिखित प्रतिक्रिया दिनुपर्छ।",
      timelineEn: "T+7 days: committee constituted; T+X: interim updates if mandated; final report by stated deadline; follow-on actions published.",
      timelineNe: "T+७ दिन: समिति गठन; T+X: आदेश भए अन्तरिम अद्यावधिक; निर्धारित म्यादमा अन्तिम प्रतिवेदन; पछ्याइ सार्वजनिक।",
      milestones: [
        {
          en: "Public notice: committee mandate, members, secretariat, and reporting line.",
          ne: "सार्वजनिक सूचना: समिति कार्यदेश, सदस्य, सचिवालय, रिपोर्टिङ लाइन।",
        },
        {
          en: "Evidence plan: witnesses, documents, CCTV / forensic access as applicable.",
          ne: "प्रमाण योजना: साक्षी, कागजात, CCTV/फरेन्सिक पहुँच।",
        },
        {
          en: "Full report released + government implementation matrix with dates.",
          ne: "पूर्ण प्रतिवेदन जारी + मितिसहित सरकारी कार्यान्वयन म्याट्रिक्स।",
        },
      ],
      kpis: [
        {
          metricEn: "Formation order + TOR on official URL within 7 days (Y/N)",
          metricNe: "७ दिनभित्र गठन आदेश + कार्यदेश आधिकारिक URL मा (हो/होइन)",
          howEn: "Dated PDF or notice number; archive link.",
          howNe: "मितिसहित PDF वा सूचना नम्बर; अभिलेख लिंक।",
        },
        {
          metricEn: "Final report published by stated deadline (Y/N + date)",
          metricNe: "निर्धारित म्यादभित्र अन्तिम प्रतिवेदन प्रकाशित (हो/होइन + मिति)",
          howEn: "Downloadable report; redactions policy if any stated.",
          howNe: "डाउनलोडयोग्य प्रतिवेदन; संवेदनशील खण्ड नीति खुलाइएको।",
        },
      ],
      risks: [
        {
          en: "Narrow mandate or political pressure weakens fact-finding.",
          ne: "साँघुरो कार्यदेश वा राजनीतिक दबाबले तथ्य खोजी कमजोर बनाउँछ।",
        },
        {
          en: "Report completed but not released — trust collapses.",
          ne: "प्रतिवेदन तयार तर जारी नभए — विश्वास ढल्छ।",
        },
      ],
      escalation: [
        {
          en: "Legal practitioners and HR bodies demand publication under transparency norms.",
          ne: "पारदर्शिता मापदण्डअन्तर्गत प्रकाशनका लागि कानुन व्यवसायी र मानव अधिकार निकायको माग।",
        },
        {
          en: "Parliamentary inquiry if deadlines slip without explanation.",
          ne: "म्याद बिना कारण चुक्दा संसदीय छानबिन।",
        },
        {
          en: "Share this point so the inquiry stays visible (#point-7).",
          ne: "छानबिन दृश्य राख्न यो बुँदा साझेदारी गर्नुहोस् (#बुँदा-७)।",
        },
      ],
      programStatusEn: "🟡 At risk — one-week formation and full inquiry trail not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — एक हप्ते गठन र पूर्ण छानबिन ट्रेल यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p8",
    pointNumber: 8,
    category: "Commitment, Coordination & Trust",
    promise:
      "To address the problem that various commission reports remain confined to the record with weak implementation, within 30 days begin the legal, administrative, and prosecution processes necessary to implement the recommendations of the relevant reports.",
    promiseNe:
      "विभिन्न आयोगका प्रतिवेदनहरू केवल अभिलेखमा सीमित रहने र कार्यान्वयन कमजोर हुने समस्या समाधान गर्न ३० दिनभित्र सम्बन्धित प्रतिवेदनका सिफारिसहरू कार्यान्वयन गर्न आवश्यक कानूनी, प्रशासनिक र अभियोजन प्रक्रिया सुरु गर्ने।",
    question:
      "Which dormant reports are prioritized, what implementation roadmap and responsible bodies are assigned for each, and how will progress be tracked and disclosed to the public?",
    questionNe:
      "कुन निष्क्रिय प्रतिवेदनलाई प्राथमिकता, प्रत्येकका लागि कार्यान्वयन रोडम्याप र जिम्मेवार निकाय के, र प्रगति कसरी ट्र्याक र सार्वजनिक गरिन्छ?",
    whyThisMatters:
      "Unimplemented commission reports signal institutional drift. Citizens lose confidence when recommendations accumulate without follow-through.",
    whyThisMattersNe:
      "आयोग प्रतिवेदन नकार्यान्वयनले संस्थागत जडत्व देखाउँछ। सिफारिस जम्मा भएर कार्यान्वयन नभए जनविश्वास घट्छ।",
    possiblePathItems: [
      "Publish a register of pending reports with status and lead ministries",
      "30-day kickoff actions with milestones for each prioritized report",
      "Quarterly public implementation updates",
      "Parliamentary or oversight review of stalled recommendations",
      "Clear criteria for closing items as implemented or superseded",
    ],
    possiblePathItemsNe: [
      "मन्त्रालय जिम्मेवारी र स्थितिसहित बाँकी प्रतिवेदनको दर्ता सार्वजनिक गर्ने",
      "प्राथमिकता पाएका प्रत्येक प्रतिवेदनका लागि ३० दिने सुरुवात र कोसेढुङ्गा",
      "त्रैमासिक सार्वजनिक कार्यान्वयन अद्यावधिक",
      "अवरुद्ध सिफारिसको संसदीय वा निगरानी समीक्षा",
      "कार्यान्वयन वा प्रतिस्थापन भएका बुँदा बन्द गर्ने स्पष्ट मापदण्ड",
    ],
    systemInsight:
      "Implementation is a system: without a visible pipeline from recommendation to action, even strong reports expire on the shelf.",
    systemInsightNe:
      "कार्यान्वयन एउटा प्रणाली हो: सिफारिसदेखि कार्यसम्म देखिने पाइपलाइन बिना राम्रो प्रतिवेदन पनि ताकामा मर्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ८ (commission reports implementation; scan Page 2)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ८ (आयोग प्रतिवेदन कार्यान्वयन; स्क्यान पृष्ठ २)",
    sourceExcerpt:
      "From scanned agenda: within 30 days start legal, administrative, and prosecution processes needed to implement recommendations of relevant reports (problem: reports stuck in files, weak implementation).",
    sourceExcerptNe:
      "स्क्यान: प्रतिवेदन अभिलेखमै सीमित र कार्यान्वयन कमजोर — ३० दिनभित्र सम्बन्धित सिफारिस कार्यान्वयनका लागि कानूनी, प्रशासनिक, अभियोजन प्रक्रिया सुरु।",
    layer1: {
      hookEmoji: "📂",
      hook: "30 days to move old commission reports off the shelf. Where’s the register?",
      hookNe: "३० दिन: पुराना आयोग प्रतिवेदन ताकबाट। दर्ता कहाँ छ?",
      stakeLine: "Without a public list and lead ministry per report, “implementation” is impossible to track.",
      stakeLineNe: "सार्वजनिक सूची र प्रतिवेदन प्रति नेतृत्व मन्त्रालय बिना «कार्यान्वयन» ट्र्याक गर्न सकिँदैन।",
      coreQuestionShort: "Which reports are prioritized — and who owns each action?",
      coreQuestionShortNe: "कुन प्रतिवेदन प्राथमिक — प्रत्येक कार्य कोकोले चलाउँछ?",
      coreQuestion:
        "Which dormant reports are prioritized, what roadmap and bodies implement them, and how is progress disclosed?",
      coreQuestionNe:
        "कुन निष्क्रिय प्रतिवेदन प्राथमिक, कुन रोडम्याप र निकायले कार्यान्वयन गर्छ, प्रगति कसरी खुलाइन्छ?",
      quickScan: [
        {
          item: "Public register of pending commission reports + status",
          itemNe: "बाँकी आयोग प्रतिवेदन + स्थितिको सार्वजनिक दर्ता",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
        {
          item: "30-day kickoff: legal / admin / prosecution starts per report",
          itemNe: "३० दिने सुरुवात: प्रतिवेदनअनुसार कानूनी/प्रशासनिक/अभियोजन",
          status: "⚠️ Not verified publicly",
          statusNe: "⚠️ सार्वजनिक प्रमाण छैन",
        },
        {
          item: "Quarterly public implementation updates",
          itemNe: "त्रैमासिक सार्वजनिक कार्यान्वयन अद्यावधिक",
          status: "❌ None on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Criteria to close items as implemented or superseded",
          itemNe: "कार्यान्वयन वा प्रतिस्थापन भए बन्द गर्ने मापदण्ड",
          status: "❌ Not defined",
          statusNe: "❌ परिभाषित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of the Prime Minister and Council of Ministers (oversight); Ministry of Law, Justice and Parliamentary Affairs; line ministries named in each commission report; Attorney General’s Office for prosecution tracks.",
      primaryOwnersNe:
        "प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय (निगरानी); कानून, न्याय तथा संसदीय मामिला मन्त्रालय; प्रत्येक आयोग प्रतिवेदनमा नामित मन्त्रालय; अभियोजन मार्गका लागि महान्यायाधिवक्ता।",
      coordinatingOfficeEn:
        "OPMCM or cabinet secretariat to maintain a single cross-government implementation register.",
      coordinatingOfficeNe: "एकीकृत अन्तरसरकारी कार्यान्वयन दर्ताका लागि प्रधानमन्त्री कार्यालय वा मन्त्रिपरिषद् सचिवालय।",
      accountableRolesEn:
        "Each prioritized report has a named secretary-level owner and published next actions within 30 days of kickoff.",
      accountableRolesNe:
        "प्रत्येक प्राथमिक प्रतिवेदनमा सचिव स्तरको जिम्मेवार र सुरुवातपछि ३० दिनभित्र अर्का कदम सार्वजनिक।",
      timelineEn: "T+30 days: start legal, administrative, and prosecution processes; ongoing: quarterly disclosure until items closed or superseded.",
      timelineNe: "T+३० दिन: कानूनी, प्रशासनिक र अभियोजन सुरु; निरन्तर: बन्द वा प्रतिस्थापन नभएसम्म त्रैमासिक खुलासा।",
      milestones: [
        {
          en: "Publish prioritized report list with ministry owners and baseline status.",
          ne: "मन्त्रालय जिम्मेवार र आधार स्थितिसहित प्राथमिकता प्रतिवेदन सूची प्रकाशन।",
        },
        {
          en: "Issue written kickoff orders per report (what starts in 30 days).",
          ne: "प्रतिवेदन प्रति ३० दिनमा के सुरु हुन्छ भनी लिखित सुरुवात आदेश।",
        },
        {
          en: "Quarterly dashboard or PDF: % recommendations on track / delayed / completed.",
          ne: "त्रैमासिक ड्यासबोर्ड वा PDF: सिफारिस % मार्गमा/ढिलो/पूरा।",
        },
      ],
      kpis: [
        {
          metricEn: "Open register with ≥1 next action per prioritized report (Y/N)",
          metricNe: "प्राथमिक प्रतिवेदन प्रति कम्तीमा एउटा अर्को कदम खुला दर्तामा (हो/होइन)",
          howEn: "Filterable table; ministry column; last updated date.",
          howNe: "फिल्टर गर्न मिल्ने तालिका; मन्त्रालय स्तम्भ; अन्तिम अद्यावधिक मिति।",
        },
        {
          metricEn: "Share of commission recommendations marked completed with source link",
          metricNe: "स्रोत लिंकसहित पूरा चिन्ह लागेका आयोग सिफारिसको हिस्सा",
          howEn: "Audit sample against original report PDFs.",
          howNe: "मूल प्रतिवेदन PDF सँग नमूना जाँच।",
        },
      ],
      risks: [
        {
          en: "Kickoff letters exist but no durable tracking — fatigue returns.",
          ne: "सुरुवात पत्र छ तर दीर्घकालीन ट्र्याक छैन — फेरि बेवास्ता।",
        },
        {
          en: "Selective implementation — politically sensitive items stall.",
          ne: "छानिएको कार्यान्वयन — राजनीतिक संवेदनशील बुँदा अड्किन्छ।",
        },
      ],
      escalation: [
        {
          en: "Public interest litigation on statutory deadlines tied to commission findings.",
          ne: "आयोग निष्कर्षसँग जोडिएको कानूनी म्यादमा सार्वजनिक हित मुद्दा।",
        },
        {
          en: "Parliamentary committee hearings on stalled recommendations.",
          ne: "अड्किएका सिफारिसमा संसदीय समिति बैठक।",
        },
        {
          en: "Share this point to keep shelf-clearing visible (#point-8).",
          ne: "ताक खाली गर्ने प्रयास दृश्य राख्न साझेदारी गर्नुहोस् (#बुँदा-८)।",
        },
      ],
      programStatusEn: "🔴 No evidence on file — cross-report register and 30-day kickoff not publicly verified here.",
      programStatusNe: "🔴 प्रमाण दर्ता छैन — अन्तरप्रतिवेदन दर्ता र ३० दिने सुरुवात यहाँ प्रमाणित छैन।",
    },
  },
  {
    id: "p9",
    pointNumber: 9,
    category: "Administrative Reform & Restructuring",
    promise:
      "To resolve the problem that an excessive number of ministries has inflated recurrent expenditure, within 30 days amend the existing Nepal Government (Division of Work) Regulations with a decision to reduce the number of ministries and fix the number of federal ministries at 17. Where review of ministry numbers requires managing existing posts including authorized positions without harming service delivery, manage promotions accordingly. In line with that, form a “Restructuring Management Secretariat” under the Office of the Prime Minister and Council of Ministers to prepare a transition roadmap (Transition Roadmap) for service continuity and to arrange manpower, budget, programs, and related measures.",
    promiseNe:
      "मन्त्रालयहरूको सङ्ख्या आवश्यकताभन्दा ठूलो भई चालु खर्च बढेको समस्यालाई समाधान गर्न ३० दिनभित्र मन्त्रालयको सङ्ख्या घटाउने निर्णयसहित मौजुदा नेपाल सरकार (कार्य विभाजन) नियमावली संशोधन गरी सङ्घीय मन्त्रालयको सङ्ख्या १७ कायम गर्ने। मन्त्रालयहरूको सङ्ख्या पुनरावलोकन गर्ने सन्दर्भमा हाल कायम रहेका दरबन्दीहरूसमेत व्यवस्थापन गर्नुपर्ने भएमा सेवा प्रवाहलाई असर नपर्ने गरी बढुवा व्यवस्थापन गर्ने। सो बमोजिम सेवा निरन्तरताका लागि सङ्क्रमण मार्गचित्र (Transition Roadmap) तयार गर्न, जनशक्ति, बजेट तथा कार्यक्रम लगायतका प्रबन्ध मिलाउन प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालयमा «पुनर्संरचना व्यवस्थापन सचिवालय» गठन गर्ने।",
    question:
      "Which ministries are merged, abolished, or renamed to reach the 17-ministry target, what is the published transition roadmap with dates, and how will the secretariat report restructuring progress to the public?",
    questionNe:
      "१७ मन्त्रालय लक्ष्य पुग्न कुन मन्त्रालय मिलाइन्छ, खारेज वा नामकरण हुन्छ, मितिसहित संक्रमण रोडम्याप के छ, र सचिवालयले पुनर्संरचना प्रगति जनतालाई कसरी प्रतिवेदन गर्छ?",
    whyThisMatters:
      "Ministry count is a visible proxy for administrative cost and clarity. Without a transparent roadmap, restructuring disrupts services and accountability.",
    whyThisMattersNe:
      "मन्त्रालय संख्या प्रशासनिक लागत र स्पष्टताको दृश्य सूचक हो। पारदर्शी रोडम्याप बिना पुनर्संरचनाले सेवा र जवाफदेहितामा अवरोध ल्याउँछ।",
    possiblePathItems: [
      "Public list of final 17 ministries with mandates and reporting lines",
      "Amended allocation of business rules and HR transfer plan",
      "Transition milestones for budgets, assets, and ongoing programs",
      "Secretariat dashboard or periodic public updates",
      "Post-reform evaluation of cost and decision speed",
    ],
    possiblePathItemsNe: [
      "जिम्मेवारी र रिपोर्टिङ लाइनसहित अन्तिम १७ मन्त्रालयको सार्वजनिक सूची",
      "संशोधित कार्यविभाजन नियमावली र मानव संसाधन स्थानान्तरण योजना",
      "बजेट, सम्पत्ति र चलिरहेका कार्यक्रमका संक्रमण कोसेढुङ्गा",
      "सचिवालय ड्यासबोर्ड वा आवधिक सार्वजनिक अद्यावधिक",
      "पुनर्संरचनापछि लागत र निर्णय गतिको मूल्याङ्कन",
    ],
    systemInsight:
      "Restructuring succeeds when citizens can see which office now owns which service—and when staff and budgets actually move on schedule.",
    systemInsightNe:
      "पुनर्संरचना तब सफल हुन्छ जब नागरिकले कुन कार्यालयले कुन सेवाको जिम्मा लियो देख्छ — र कर्मचारी र बजेट तालिकाअनुसार साँच्चै सर्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ९ (ministries to 17; scan Page 3)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ९ (१७ मन्त्रालय; स्क्यान पृष्ठ ३)",
    sourceExcerpt:
      "From scanned agenda (section ख): 30 days—decision to cut ministries, amend Nepal Government (Division of Work) Regulations, 17 federal ministries; manage posts/promotions without harming services; Transition Roadmap; Restructuring Management Secretariat under OPMCM.",
    sourceExcerptNe:
      "स्क्यान (खण्ड ख): चालु खर्च बढेको समस्या — ३० दिन, निर्णयसहित (कार्य विभाजन) नियमावली संशोधन, सङ्घीय मन्त्रालय १७; दरबन्दी/बढुवा सेवा प्रभाव नगरी; सङ्क्रमण मार्गचित्र; «पुनर्संरचना व्यवस्थापन सचिवालय» प्रधानमन्त्री कार्यालयमा।",
    layer1: {
      hookEmoji: "🏛️",
      hook: "17 ministries in 30 days. Show the map: who merges, who stays?",
      hookNe: "३० दिनमा १७ मन्त्रालय। नक्सा: को मिल्छ, को रहन्छ?",
      stakeLine: "Restructuring without a published roadmap confuses citizens and breaks service chains.",
      stakeLineNe: "सार्वजनिक रोडम्याप बिना पुनर्संरचनाले नागरिक अलमलिन्छ, सेवा च्यान तुहिन्छ।",
      coreQuestionShort: "Where’s the Transition Roadmap and the list of 17 ministries?",
      coreQuestionShortNe: "संक्रण मार्गचित्र र १७ मन्त्रालयको सूची कहाँ छ?",
      coreQuestion:
        "Which ministries merge or close to reach 17, what is the dated transition roadmap, and how will the secretariat report progress?",
      coreQuestionNe:
        "१७ पुग्न कुन मन्त्रालय मिल्छ/बन्द हुन्छ, मितिसहित संक्रण मार्गचित्र के, सचिवालयले प्रगति कसरी बताउँछ?",
      quickScan: [
        {
          item: "Amended Division of Work regulations + 17-ministry decision (public)",
          itemNe: "संशोधित कार्य विभाजन नियमावली + १७ मन्त्रालय निर्णय (सार्वजनिक)",
          status: "⚠️ Not verified publicly",
          statusNe: "⚠️ सार्वजनिक प्रमाण छैन",
        },
        {
          item: "Restructuring Management Secretariat under OPMCM (TOR, staff)",
          itemNe: "प्रधानमन्त्री कार्यालय अन्तर्गत पुनर्संरचना सचिवालय (कार्यदेश, जनशक्ति)",
          status: "❌ Not spelled out",
          statusNe: "❌ खुलाइएको छैन",
        },
        {
          item: "Published Transition Roadmap (budgets, HR, programs, dates)",
          itemNe: "प्रकाशित संक्रण मार्गचित्र (बजेट, जनशक्ति, कार्यक्रम, मिति)",
          status: "❌ No public report",
          statusNe: "❌ सार्वजनिक प्रतिवेदन छैन",
        },
        {
          item: "Citizen-facing map: which office now owns which service",
          itemNe: "नागरिकमुखी नक्सा: कुन सेवा कुन कार्यालयको",
          status: "❌ Not available",
          statusNe: "❌ उपलब्ध छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of the Prime Minister and Council of Ministers; Ministry of Federal Affairs and General Administration; Ministry of Finance; concerned line ministries subject to merger.",
      primaryOwnersNe:
        "प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय; संघीय मामिला तथा सामान्य प्रशासन मन्त्रालय; अर्थ मन्त्रालय; मिलाप अधीनका सम्बन्धित मन्त्रालय।",
      coordinatingOfficeEn:
        "Restructuring Management Secretariat under OPMCM — transition roadmap, manpower, budget alignment.",
      coordinatingOfficeNe:
        "प्रधानमन्त्री कार्यालय अन्तर्गत «पुनर्संरचना व्यवस्थापन सचिवालय» — संक्रण मार्गचित्र, जनशक्ति, बजेट मिलान।",
      accountableRolesEn:
        "Cabinet/Council of Ministers for regulation amendments; secretaries accountable for service continuity during moves.",
      accountableRolesNe:
        "नियमावली संशोधनका लागि मन्त्रिपरिषद्; सर्दा सेवा निरन्तरताका लागि सचिव जवाफदेह।",
      timelineEn:
        "T+30 days: amend Division of Work regulations toward 17 ministries; parallel: transition roadmap and secretariat stand-up.",
      timelineNe: "T+३० दिन: १७ मन्त्रालयतर्फ (कार्य विभाजन) नियमावली संशोधन; सँगै: संक्रण मार्गचित्र र सचिवालय सञ्चालन।",
      milestones: [
        {
          en: "Publish final list of 17 ministries with mandates and reporting lines.",
          ne: "जिम्मेवारी र रिपोर्टिङ लाइनसहित अन्तिम १७ मन्त्रालय सूची प्रकाशन।",
        },
        {
          en: "Approve Transition Roadmap with dated HR, budget, and asset moves.",
          ne: "मितिसहित जनशक्ति, बजेट र सम्पत्ति सर्ने संक्रण मार्गचित्र स्वीकृति।",
        },
        {
          en: "Issue citizen service redirect guide (online + local offices).",
          ne: "नागरिक सेवा कहाँ सर्छ — अनलाइन र स्थानीय कार्यालय मार्गदर्शन।",
        },
      ],
      kpis: [
        {
          metricEn: "Gazetted or official map of 17 ministries (Y/N + URL)",
          metricNe: "१७ मन्त्रालयको राजपत्र वा आधिकारिक नक्सा (हो/होइन + URL)",
          howEn: "Stable URL; version history if amended.",
          howNe: "स्थिर URL; संशोधन भए संस्करण इतिहास।",
        },
        {
          metricEn: "Published roadmap milestone completion % (self-reported + audit sample)",
          metricNe: "प्रकाशित रोडम्याप कोसेढुङ्गा पूरा % (आत्म प्रतिवेदन + नमूना जाँच)",
          howEn: "Quarterly progress PDF or dashboard.",
          howNe: "त्रैमासिक प्रगति PDF वा ड्यासबोर्ड।",
        },
      ],
      risks: [
        {
          en: "Staff and budgets move on paper only — services stall on the ground.",
          ne: "कागजमा मात्र सर्छ — जमिनमा सेवा अड्किन्छ।",
        },
        {
          en: "Political trade-offs recreate hidden parallel bodies.",
          ne: "राजनीतिक सौदाले गुप्त समानान्तर निकाय पुनर्जीवित हुन्छ।",
        },
      ],
      escalation: [
        {
          en: "CSO and media monitor service disruption hotspots by district.",
          ne: "जिल्लागत सेवा अवरोध निगरानी गर्न गैरसरकारी र सञ्चार।",
        },
        {
          en: "Legislative questions on savings vs recurrent cost claims.",
          ne: "बचत बनाम चालु खर्च दाबीमा संसदीय प्रश्न।",
        },
        {
          en: "Share this point so the 17-ministry map stays visible (#point-9).",
          ne: "१७ मन्त्रालय नक्सा दृश्य राख्न साझेदारी गर्नुहोस् (#बुँदा-९)।",
        },
      ],
      programStatusEn: "🟡 Delayed / unverified — 17-ministry map and transition roadmap not publicly proven on this tracker.",
      programStatusNe: "🟡 ढिलो / अप्रमाणित — १७ मन्त्रालय नक्सा र संक्रण मार्गचित्र यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p10",
    pointNumber: 10,
    category: "Administrative Reform & Restructuring",
    promise:
      "To end slow, costly, and ineffective service delivery caused by duplication, complexity, and unnecessary procedures, all public bodies shall broadly review processes in force in their organizations, remove unnecessary and duplicated processes, limit multi-level approvals in decision-making to a maximum of three tiers, and through Business Process Re-engineering (BPR) prepare or amend and implement within 30 days the procedures, standards, and monitoring systems needed to make all service delivery simple, fast, and results-oriented; where legislation is required, prepare a draft law amendment within the same period.",
    promiseNe:
      "सबै सार्वजनिक निकायले सेवा प्रवाहमा विद्यमान दोहोरोपन, जटिलता तथा अनावश्यक प्रक्रियाका कारण सेवा प्रवाह ढिलो, खर्चिलो र अप्रभावकारी भएको अवस्थालाई अन्त्य गर्न आफ्ना निकायमा प्रचलनमा रहेका प्रक्रियाहरूको व्यापक समीक्षा गरी अनावश्यक तथा दोहोरिएका प्रक्रियाहरू हटाउन, निर्णय प्रक्रियामा रहेका बहु-स्वीकृति तहलाई बढीमा तीन तहमा सीमित गर्न तथा Business Process Re-engineering (BPR) मार्फत सम्पूर्ण सेवा प्रवाहलाई सरल, छिटो तथा परिणाममुखी बनाउनका लागि आवश्यक कार्यविधि, मापदण्ड तथा अनुगमन प्रणाली ३० दिनभित्र तयार/संशोधन गरी लागू गर्ने। कानूनी व्यवस्था गर्नुपर्ने अवस्थामा सो अवधिभित्र कानून संशोधनको मस्यौदा तयार गर्ने।",
    question:
      "Which high-volume services are prioritized for BPR first, how will the three-layer rule be enforced and audited, and what published standards define compliant timelines and responsible officers?",
    questionNe:
      "पहिले कुन उच्च मात्राका सेवामा BPR, तीन-तह नियम कसरी लागू र लेखापरीक्षा हुन्छ, र अनुकूल समयसीमा र जिम्मेवार अधिकृत परिभाषित गर्ने सार्वजनिक मानक के हुनेछ?",
    whyThisMatters:
      "Citizens experience government as queues and forms. BPR only matters if layer reduction and standards change what people wait for in practice.",
    whyThisMattersNe:
      "नागरिकले सरकारलाई लाइन र फारमको रूपमा अनुभव गर्छन्। तह घटाउने र मानकले व्यवहारमा प्रतिक्षा के बदल्छ भने मात्र BPR अर्थपूर्ण हुन्छ।",
    possiblePathItems: [
      "Published BPR scope per ministry with before/after process maps",
      "Three-layer compliance checks in service manuals",
      "30-day amended SOPs with citizen-facing summaries",
      "Mystery shopping or delay audits on priority services",
      "Annual public report on average completion times",
    ],
    possiblePathItemsNe: [
      "मन्त्रालयगत BPR दायरा र अघि/पछि प्रक्रिया नक्सा सार्वजनिक गर्ने",
      "सेवा मार्गदर्शनमा तीन-तह अनुपालन जाँच",
      "३० दिनभित्र संशोधित SOP र नागरिकमुखी सारांश",
      "प्राथमिक सेवामा गोप्य निरीक्षण वा ढिलाइ लेखापरीक्षा",
      "औसत पूरा समयमाथि वार्षिक सार्वजनिक प्रतिवेदन",
    ],
    systemInsight:
      "Service reform fails when only org charts change: success requires measurable fewer handoffs and documented turnaround times.",
    systemInsightNe:
      "संरचना मात्र बदलियो भने सेवा सुधार असफल हुन्छ: सफलताको माप हात बदलाइ घट्नु र कागजातीकृत समयसीमा हो।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item १० (BPR & three layers; scan Page 3)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा १० (BPR र तीन तह; स्क्यान पृष्ठ ३)",
    sourceExcerpt:
      "From scanned agenda: all public bodies—broad process review; cut duplication; max three approval tiers; BPR for simple, fast, result-oriented services; procedures, standards, monitoring in 30 days; draft statute amendments if needed in same period.",
    sourceExcerptNe:
      "स्क्यान: सबै सार्वजनिक निकाय — प्रक्रिया समीक्षा, दोहोरो हटाउने, निर्णयमा बढीमा तीन तह, BPR ले सरल/छिटो/परिणाममुखी सेवा; ३० दिनमा कार्यविधि, मापदण्ड, अनुगमन लागू; आवश्यक भए सोही अवधिमा कानून संशोधन मस्यौदा।",
    layer1: {
      hookEmoji: "⚡",
      hook: "30 days to cut red tape: max 3 approval tiers. Who checks compliance?",
      hookNe: "३० दिन: लालफिता कटौती, बढीमा तीन स्वीकृति। अनुपालन को जाँच्छ?",
      stakeLine: "BPR only works if citizens can see before/after timelines and which offices actually complied.",
      stakeLineNe: "BPR तब मात्र जब अघि/पछि समयसीमा देखिन्छ र कुन कार्यालयले मानेको छ थाहा हुन्छ।",
      coreQuestionShort: "Where are the new SOPs and the proof that waits got shorter?",
      coreQuestionShortNe: "नयाँ SOP र प्रतीक्षा छोटो भएको प्रमाण कहाँ छ?",
      coreQuestion:
        "Which services are prioritized, how is the three-tier rule enforced, and what standards define compliant timelines?",
      coreQuestionNe:
        "कुन सेवा प्राथमिक, तीन-तह नियम कसरी लागू हुन्छ, अनुकूल समयसीमा के मानकले परिभाषित गर्छ?",
      quickScan: [
        {
          item: "Per-ministry BPR scope + before/after process maps (public)",
          itemNe: "मन्त्रालयगत BPR दायरा + अघि/पछि प्रक्रिया नक्सा (सार्वजनिक)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "30-day amended SOPs + monitoring system in force",
          itemNe: "३० दिनभित्र संशोधित SOP र अनुगमन प्रणाली लागू",
          status: "⚠️ Not verified publicly",
          statusNe: "⚠️ सार्वजनिक प्रमाण छैन",
        },
        {
          item: "Three-tier approval compliance in service manuals",
          itemNe: "सेवा मार्गदर्शनमा तीन-तह स्वीकृति अनुपालन",
          status: "❌ Not audited",
          statusNe: "❌ लेखापरीक्षा छैन",
        },
        {
          item: "Published average turnaround times for top services",
          itemNe: "शीर्ष सेवाका औसत पूरा समय प्रकाशित",
          status: "❌ None available",
          statusNe: "❌ उपलब्ध छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "All public bodies (per agenda); Ministry of Federal Affairs and General Administration for civil service process norms; line ministries for sector SOPs; Ministry of Law for draft amendments.",
      primaryOwnersNe:
        "एजेन्डाअनुसार सबै सार्वजनिक निकाय; निजामती प्रक्रिया मानकका लागि संघीय मामिला तथा सामान्य प्रशासन; क्षेत्रगत SOP का लागि मन्त्रालय; मस्यौदाका लागि कानून मन्त्रालय।",
      coordinatingOfficeEn:
        "OPMCM or MoFAGA for cross-government BPR benchmarks and compliance sampling.",
      coordinatingOfficeNe: "अन्तरसरकारी BPR मापदण्ड र अनुपालन नमूनाका लागि प्रधानमन्त्री कार्यालय वा संघीय मामिला मन्त्रालय।",
      accountableRolesEn:
        "Heads of agencies certify SOP adoption; internal audit or third line reviews three-tier compliance annually.",
      accountableRolesNe:
        "निकाय प्रमुखले SOP अपनाउने प्रमाणित गर्छन्; आन्तरिक लेखापरीक्षा वा तेस्रो रेखाले वार्षिक तीन-तह जाँच।",
      timelineEn:
        "T+30 days: procedures, standards, monitoring systems implemented; parallel: draft law amendments if legislation required.",
      timelineNe: "T+३० दिन: कार्यविधि, मापदण्ड, अनुगमन लागू; सँगै: कानून चाहिए मस्यौदा।",
      milestones: [
        {
          en: "Publish priority service list with baseline wait times (pre-BPR).",
          ne: "आधार प्रतीक्षा समय (BPR अघि) सहित प्राथमिक सेवा सूची प्रकाशन।",
        },
        {
          en: "Issue revised SOPs with three-tier approval maps per service.",
          ne: "प्रति सेवा तीन-तह स्वीकृति नक्सासहित संशोधित SOP जारी।",
        },
        {
          en: "Launch monitoring dashboard or quarterly PDF on turnaround times.",
          ne: "पूरा समयमाथि निगरानी ड्यासबोर्ड वा त्रैमासिक PDF सुरु।",
        },
      ],
      kpis: [
        {
          metricEn: "Median days to complete top 10 services: before vs after (published)",
          metricNe: "शीर्ष १० सेवा पूरा गर्न मध्यक मिति: अघि र पछि (प्रकाशित)",
          howEn: "Same definitions quarter to quarter; sample of case IDs.",
          howNe: "एकै परिभाषा प्रत्येक त्रैमासिक; मुद्दा ID नमूना।",
        },
        {
          metricEn: "Share of approvals exceeding three tiers (audit finding count)",
          metricNe: "तीन तहभन्दा बढी स्वीकृति (लेखापरीक्षा फेला संख्या)",
          howEn: "Mystery shopping or random case file review.",
          howNe: "गोप्य निरीक्षण वा यादृच्छिक फाइल समीक्षा।",
        },
      ],
      risks: [
        {
          en: "SOPs published but staff still route informally — metrics lie.",
          ne: "SOP छ तर कर्मचारी अनौपचारीकै बाटो — सूचक झुटो देखिन्छ।",
        },
        {
          en: "Legislation delayed — agencies blame law for inaction.",
          ne: "कानून ढिलो — निकायले निष्क्रियताको बहाना बनाउँछ।",
        },
      ],
      escalation: [
        {
          en: "Citizen grievance escalation when SLA missed (published path).",
          ne: "SLA चुक्दा नागरिक उचालन मार्ग (प्रकाशित)।",
        },
        {
          en: "Media spot-checks on high-volume services (land, tax, ID).",
          ne: "उच्च मात्राका सेवामा सञ्चार नमूना जाँच।",
        },
        {
          en: "Share this point so BPR proof stays on the radar (#point-10).",
          ne: "BPR प्रमाण दृश्य राख्न साझेदारी गर्नुहोस् (#बुँदा-१०)।",
        },
      ],
      programStatusEn: "🟡 At risk — 30-day SOP and turnaround proof not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ३० दिने SOP र समय प्रमाण यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p11",
    pointNumber: 11,
    category: "Administrative Reform & Restructuring",
    promise:
      "Comprehensively evaluate boards, committees, projects, and institutional structures under the Government of Nepal that are unproductive, have overlapping mandates, or create unnecessary financial burden, and abolish, merge, or restructure them, by forming a high-level task force comprising representatives of the Office of the Prime Minister and Council of Ministers, the Ministry of Finance, the Ministry of Industry, Commerce and Supplies, and the Ministry of Federal Affairs and General Administration; assign the task force to submit, within one month, a report with clear recommendations.",
    promiseNe:
      "नेपाल सरकार अन्तर्गत रहेका अनुत्पादक, दोहोरो कार्यक्षेत्र भएका तथा अनावश्यक वित्तीय भार सिर्जना गर्ने बोर्ड, समिति, आयोजना तथा संस्थागत संरचनाहरूको समग्र मूल्याङ्कन गरी खारेज, एकीकरण वा पुनर्संरचना गर्न प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय, अर्थ मन्त्रालय, उद्योग, वाणिज्य तथा आपूर्ति मन्त्रालय र सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालयका प्रतिनिधिहरू रहेको एक उच्चस्तरीय कार्यदल गठन गर्ने तथा सो कार्यदललाई एक महिनाभित्र स्पष्ट सिफारिससहितको प्रतिवेदन पेश गर्न कार्यादेश दिने।",
    question:
      "How will “unproductive,” overlapping mandate, and unnecessary financial burden be scored for boards, committees, projects, and bodies; what is the published review list; and how will the PMO–Finance–Industry/Commerce/Supplies–Federal Affairs task force report be implemented?",
    questionNe:
      "बोर्ड, समिति, आयोजना र संरचनामा अनुत्पादकता, दोहोरो क्षेत्र र अनावश्यक वित्तीय भार कसरी मापन हुन्छ; समीक्षा सूची कहिले सार्वजनिक हुन्छ; प्रधानमन्त्री कार्यालय–अर्थ–उद्योग वाणिज्य आपूर्ति–संघीय मामिलाको कार्यदल प्रतिवेदन कार्यान्वयन कसरी हुन्छ?",
    whyThisMatters:
      "Duplicate bodies drain budgets and blur accountability. A time-bound review forces explicit keep-or-cut decisions.",
    whyThisMattersNe:
      "दोहोरो निकायले बजेट खर्च गर्छ र जिम्मेवारी मधुरो बनाउँछ। समयबद्ध समीक्षाले राख्ने/कटाउने स्पष्ट निर्णय बाध्य बनाउँछ।",
    possiblePathItems: [
      "Public register of all boards/committees under review",
      "Scoring method (cost, mandate overlap, outcomes)",
      "One-month report with merge/dissolve recommendations",
      "Implementation calendar and savings estimates",
      "Stakeholder consultation where mandates affect sectors",
    ],
    possiblePathItemsNe: [
      "समीक्षाधीन सबै बोर्ड/समितिको सार्वजनिक दर्ता",
      "मूल्याङ्कन विधि (लागत, जिम्मेवारी दोहोरो, नतिजा)",
      "मिलाप/खारेज सिफारिससहित एक महिने प्रतिवेदन",
      "कार्यान्वयन तालिका र बचत अनुमान",
      "क्षेत्र असर पर्दा हितधारक परामर्श",
    ],
    systemInsight:
      "Governance hygiene means retiring structures that no longer earn their cost—visibility prevents quiet revival.",
    systemInsightNe:
      "शासन स्वच्छता भनेको लागत जित्न नसक्ने संरचना अवकाश दिनु हो — दृश्यता बिना तिनीहरू चुपचाप पुनर्जीवित हुन्छन्।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ११ (boards/task force; scan Page 3)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ११ (बोर्ड/कार्यदल; स्क्यान पृष्ठ ३)",
    sourceExcerpt:
      "From scan (Page 3): evaluate unproductive/overlapping/financially burdensome boards, committees, projects, structures; abolish, merge, or restructure; high-level task force (PMO, Finance, Industry/Commerce/Supplies, Federal Affairs); report with clear recommendations within one month.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ३: अनुत्पादक/दोहोरो क्षेत्र/अनावश्यक वित्तीय भार भएका बोर्ड, समिति, आयोजना, संरचनाको समग्र मूल्याङ्कन; खारेज, एकीकरण वा पुनर्संरचना; प्रधानमन्त्री कार्यालय, अर्थ, उद्योग वाणिज्य आपूर्ति, संघीय मामिला प्रतिनिधिको उच्चस्तरीय कार्यदल; एक महिनामा सिफारिससहित प्रतिवेदन।",
    layer1: {
      hookEmoji: "🧹",
      hook: "One month to name boards to cut or merge. Where’s the full list?",
      hookNe: "एक महिना: कटाउने/मिलाउने बोर्ड। पूर्ण सूची कहाँ छ?",
      stakeLine: "Governance savings need a public inventory — otherwise cuts look arbitrary.",
      stakeLineNe: "बचत देखाउन सार्वजनिक सूची चाहिन्छ — नभए कटौती मनोमानी जस्तो देखिन्छ।",
      coreQuestionShort: "Where’s the task-force report and the implementation calendar?",
      coreQuestionShortNe: "कार्यदल प्रतिवेदन र कार्यान्वयन तालिका कहाँ छ?",
      coreQuestion:
        "How are unproductive or overlapping bodies scored; what is the published review list; and how will recommendations be implemented?",
      coreQuestionNe:
        "अनुत्पादक वा दोहोरो निकाय कसरी मापन हुन्छ; समीक्षा सूची कहिले सार्वजनिक; सिफारिस कसरी लागू हुन्छ?",
      quickScan: [
        {
          item: "High-level task force formed (PMO, Finance, Industry, Federal Affairs)",
          itemNe: "उच्चस्तरीय कार्यदल (प्रधानमन्त्री कार्यालय, अर्थ, उद्योग, संघीय मामिला)",
          status: "⚠️ Needs public proof",
          statusNe: "⚠️ सार्वजनिक प्रमाण चाहिन्छ",
        },
        {
          item: "Public register of boards / committees / projects under review",
          itemNe: "समीक्षाधीन बोर्ड/समिति/आयोजनाको सार्वजनिक दर्ता",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
        {
          item: "One-month report: merge / dissolve recommendations",
          itemNe: "एक महिने प्रतिवेदन: मिलाप/खारेज सिफारिस",
          status: "❌ No public report",
          statusNe: "❌ सार्वजनिक प्रतिवेदन छैन",
        },
        {
          item: "Implementation calendar + estimated savings",
          itemNe: "कार्यान्वयन तालिका + अनुमानित बचत",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "High-level task force: Office of the Prime Minister and Council of Ministers; Ministry of Finance; Ministry of Industry, Commerce and Supplies; Ministry of Federal Affairs and General Administration.",
      primaryOwnersNe:
        "उच्चस्तरीय कार्यदल: प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय; अर्थ मन्त्रालय; उद्योग, वाणिज्य तथा आपूर्ति मन्त्रालय; संघीय मामिला तथा सामान्य प्रशासन मन्त्रालय।",
      coordinatingOfficeEn:
        "PMO secretariat support for task-force operations and cabinet submission of recommendations.",
      coordinatingOfficeNe: "कार्यदल सञ्चालन र सिफारिस मन्त्रिपरिषदमा पेश गर्न प्रधानमन्त्री कार्यालय सचिवालय सहयोग।",
      accountableRolesEn:
        "Task-force chair delivers dated report; ministries execute merge/dissolve decisions with asset and staff plans.",
      accountableRolesNe:
        "कार्यदल अध्यक्षले मितिसहित प्रतिवेदन; मन्त्रालयले सम्पत्ति र जनशक्ति योजनासहित मिलाप/खारेज कार्यान्वयन।",
      timelineEn: "T+1 month: report with clear recommendations; follow-on: implementation waves per cabinet decisions.",
      timelineNe: "T+१ महिना: स्पष्ट सिफारिससहित प्रतिवेदन; पछि: मन्त्रिपरिषद् निर्णयअनुसार कार्यान्वयन चरण।",
      milestones: [
        {
          en: "Publish scoring rubric (unproductive / overlap / financial burden).",
          ne: "मूल्याङ्कन मापदण्ड सार्वजनिक (अनुत्पादक/दोहरो/वित्तीय भार)।",
        },
        {
          en: "Release full inventory under review with ministry sponsors.",
          ne: "मन्त्रालय प्रायोजकसहित समीक्षाधीन पूर्ण सूची जारी।",
        },
        {
          en: "Cabinet decisions + implementation orders with deadlines per body.",
          ne: "प्रति निकाय म्यादसहित मन्त्रिपरिषद् निर्णय र कार्यान्वयन आदेश।",
        },
      ],
      kpis: [
        {
          metricEn: "Task-force report on official site within one month (Y/N + URL)",
          metricNe: "एक महिनाभित्र कार्यदल प्रतिवेदन आधिकारिक साइटमा (हो/होइन + URL)",
          howEn: "PDF with signatures; annex list of entities.",
          howNe: "हस्ताक्षरसहित PDF; निकाय सूची अनुसूची।",
        },
        {
          metricEn: "Count of bodies merged/dissolved vs recommended (12-month follow-up)",
          metricNe: "सिफारिस बमोजिम मिलेका/खारेज संख्या (१२ महिना पछ्याइ)",
          howEn: "Annual implementation audit table.",
          howNe: "वार्षिक कार्यान्वयन लेखापरीक्षा तालिका।",
        },
      ],
      risks: [
        {
          en: "Report shelves — bodies quietly continue with new names.",
          ne: "प्रतिवेदन ताकमा — निकाय नयाँ नाममा चुपचाप चल्छ।",
        },
        {
          en: "Stakeholder resistance without transition support.",
          ne: "संक्रण सहयोग बिना हितधारक प्रतिरोध।",
        },
      ],
      escalation: [
        {
          en: "Finance ministry tracks recurrent savings vs report projections.",
          ne: "अर्थ मन्त्रालयले चालु बचत र प्रतिवेदन अनुमान ट्र्याक गर्छ।",
        },
        {
          en: "Public audit of dormant boards still spending budget lines.",
          ne: "बजेट शीर्षक खाइरहेका निष्क्रिय बोर्डको सार्वजनिक लेखापरीक्षा।",
        },
        {
          en: "Share this point so cuts stay transparent (#point-11).",
          ne: "कटौती पारदर्शी राख्न साझेदारी गर्नुहोस् (#बुँदा-११)।",
        },
      ],
      programStatusEn: "🔴 No evidence on file — one-month task-force report and inventory not publicly verified here.",
      programStatusNe: "🔴 प्रमाण दर्ता छैन — एक महिने कार्यदल प्रतिवेदन र सूची यहाँ प्रमाणित छैन।",
    },
  },
  {
    id: "p12",
    pointNumber: 12,
    category: "Administrative Reform & Restructuring",
    promise:
      "Make public administration fully free from political interference, and impartial, neutral, and accountable to citizens. For this purpose, require civil servants, teachers, professors, and all public employees to perform duties free of direct or indirect affiliation with any party, group, or interest center, with violations subject to strict departmental action under prevailing law. Further, abolish party-based trade unions in public administration, end unwanted interference and informal pressure, and make decision-making processes and service delivery effective. For this, establish the necessary legal arrangements, in particular by drafting the Federal Civil Service Bill within 45 days.",
    promiseNe:
      "सार्वजनिक प्रशासनलाई पूर्णतः राजनीतिक हस्तक्षेपबाट मुक्त गर्दै निष्पक्ष, तटस्थ र नागरिकप्रति उत्तरदायी बनाउने। यस उद्देश्यका लागि निजामती कर्मचारी, शिक्षक, प्राध्यापक तथा सबै राष्ट्रसेवकले कुनै पनि दल, समूह वा स्वार्थ केन्द्रसँगको प्रत्यक्ष वा अप्रत्यक्ष आबद्धताबाट मुक्त भई कार्यसम्पादन गर्न अनिवार्य गर्ने र उल्लङ्घन भएमा प्रचलित कानूनबमोजिम कडाइका साथ विभागीय कारवाही गर्ने। साथै, सार्वजनिक प्रशासनमा दलीय ट्रेड युनियन खारेज गरी अवाञ्छित हस्तक्षेप र अनौपचारिक दबाबको अन्त्य गर्दै निर्णय प्रक्रिया तथा सेवा प्रवाहलाई प्रभावकारी बनाउने। यसका लागि आवश्यक कानुनी व्यवस्था विशेषतः सङ्घीय निजामती सेवा विधेयक ४५ दिनभित्र तर्जुमा गर्ने।",
    question:
      "How will the Federal Civil Service Bill (45-day draft) codify neutrality, discipline, and union rules; what transition plan applies to dissolving party-based trade unions in public administration; and how will complaints, investigations, and legitimate labor rights be balanced?",
    questionNe:
      "४५ दिने सङ्घीय निजामती सेवा विधेयकले निष्पक्षता, अनुशासन र युनियन नियम कसरी कानूनी रूप दिन्छ; सार्वजनिक प्रशासनका दलीय ट्रेड युनियन खारेजको संक्रमण योजना के हुन्छ; र गुनासो, छानबिन र वैध श्रम अधिकार कसरी सन्तुलन हुन्छ?",
    whyThisMatters:
      "When civil service is perceived as an extension of parties, policy continuity and citizen fairness collapse.",
    whyThisMattersNe:
      "निजामती सेवा दलको विस्तार जस्तो देखियो भने नीतिगत निरन्तरता र नागरिक निष्पक्षता कमजोर हुन्छ।",
    possiblePathItems: [
      "Clear code of conduct and whistleblower protections",
      "Independent investigation unit for political interference claims",
      "Transparent criteria for union recognition in public sector",
      "Training and sanctions tied to documented violations",
      "Public annual integrity report for education and civil service",
    ],
    possiblePathItemsNe: [
      "स्पष्ट आचारसंहिता र गोप्य सूचनाकर्ता सुरक्षा",
      "राजनीतिक हस्तक्षेप दाबीका लागि स्वतन्त्र छानबिन एकाइ",
      "सार्वजनिक क्षेत्रमा युनियन मान्यताको पारदर्शी मापदण्ड",
      "कागजातीकृत उल्लङ्घनसँग जोडिएको तालिम र सजाय",
      "शिक्षा र निजामती सेवाको वार्षिक सार्वजनिक सुशासन प्रतिवेदन",
    ],
    systemInsight:
      "Neutrality is operational: it needs rules people can cite, channels that work, and consequences that are applied evenly.",
    systemInsightNe:
      "निष्पक्षता सञ्चालनको कुरा हो: उद्धृत गर्न मिल्ने नियम, चल्ने माध्यम र समान रूपमा लागू सजाय चाहिन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item १२ (impartial administration; scan Page 3)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा १२ (निष्पक्ष प्रशासन; स्क्यान पृष्ठ ३)",
    sourceExcerpt:
      "From scan (Pages 3–4): administration free of political interference; all public employees neutral—no party/interest ties, departmental action if violated; abolish party trade unions in public administration; effective decisions and service delivery; Federal Civil Service Bill drafted within 45 days.",
    sourceExcerptNe:
      "स्क्यान ३–४: राजनीतिक हस्तक्षेपबाट मुक्त प्रशासन; राष्ट्रसेवक दल/स्वार्थबाट मुक्त, उल्लङ्घनमा विभागीय कारवाही; प्रशासनमा दलीय ट्रेड युनियन खारेज; निर्णय र सेवा प्रवाह प्रभावकारी; सङ्घीय निजामती सेवा विधेयक ४५ दिनमा तर्जुमा।",
    layer1: {
      hookEmoji: "⚖️",
      hook: "45 days for a Federal Civil Service Bill. Neutrality has to be written in law.",
      hookNe: "४५ दिन: सङ्घीय निजामती विधेयक। निष्पक्षता कानूनमा लेखिनुपर्छ।",
      stakeLine: "Trade-offs between neutrality, discipline, and workers’ rights need a public draft — not rumours.",
      stakeLineNe: "निष्पक्षता, अनुशासन र श्रम अधिकारको सन्तुलन सार्वजनिक मस्यौदाबाट — अफवाहबाट होइन।",
      coreQuestionShort: "Where’s the bill draft — and the plan for party-based unions?",
      coreQuestionShortNe: "विधेयक मस्यौदा र दलीय युनियन योजना कहाँ छ?",
      coreQuestion:
        "How will the bill codify neutrality and union rules; what is the transition for party-based unions in public administration?",
      coreQuestionNe:
        "विधेयकले निष्पक्षता र युनियन नियम कसरी कानूनी रूप दिन्छ; प्रशासनका दलीय युनियनको संक्रण योजना के हो?",
      quickScan: [
        {
          item: "Federal Civil Service Bill draft within 45 days (published)",
          itemNe: "४५ दिनभित्र सङ्घीय निजामती सेवा विधेयक मस्यौदा (प्रकाशित)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Clear neutrality & discipline rules + appeal path",
          itemNe: "स्पष्ट निष्पक्षता र अनुशासन नियम + पुनरावेदन मार्ग",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Transition plan: party-based unions in public administration",
          itemNe: "संक्रण योजना: प्रशासनका दलीय ट्रेड युनियन",
          status: "❌ Not spelled out",
          statusNe: "❌ खुलाइएको छैन",
        },
        {
          item: "Consultation record (employees, unions, legal experts)",
          itemNe: "परामर्च अभिलेख (कर्मचारी, युनियन, कानुन विज्ञ)",
          status: "⚠️ Not verified publicly",
          statusNe: "⚠️ सार्वजनिक प्रमाण छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Federal Affairs and General Administration; Ministry of Law, Justice and Parliamentary Affairs; Office of the Prime Minister and Council of Ministers for cabinet bill track; Public Service Commission as relevant.",
      primaryOwnersNe:
        "संघीय मामिला तथा सामान्य प्रशासन मन्त्रालय; कानून, न्याय तथा संसदीय मामिला मन्त्रालय; विधेयक मार्गका लागि प्रधानमन्त्री कार्यालय; सम्बन्धित राष्ट्रसेवा आयोग।",
      coordinatingOfficeEn:
        "Inter-ministerial drafting committee with published consultation plan before tabling.",
      coordinatingOfficeNe: "पेश गर्नुअघि सार्वजनिक परामर्श योजनासहित अन्तरमन्त्रालय मस्यौदा समिति।",
      accountableRolesEn:
        "Law minister / bill sponsor accountable for 45-day draft milestone; social dialogue on union transition documented.",
      accountableRolesNe:
        "४५ दिने मस्यौदा कोसेढुङ्गाका लागि कानून मन्त्री/प्रायोजक जवाफदेह; युनियन संक्रणमा सामाजिक संवाद कागजात।",
      timelineEn: "T+45 days: Federal Civil Service Bill draft; thereafter: parliamentary process and implementation regulations.",
      timelineNe: "T+४५ दिन: सङ्घीय निजामती सेवा विधेयक मस्यौदा; पछि: संसदीय प्रक्रिया र कार्यान्वयन नियम।",
      milestones: [
        {
          en: "Publish draft bill + explanatory note (Nepali, plain-language summary).",
          ne: "विधेयक मस्यौदा + व्याख्यात्मक नोट (नेपाली, सरल सार) प्रकाशन।",
        },
        {
          en: "Stakeholder consultation log and response matrix.",
          ne: "हितधारक परामर्श लग र प्रतिक्रिया म्याट्रिक्स।",
        },
        {
          en: "Transition rules for existing union structures in public bodies.",
          ne: "सार्वजनिक निकायका हालका युनियन संरचनाका संक्रण नियम।",
        },
      ],
      kpis: [
        {
          metricEn: "Draft bill on MoLJPA or Nepal Law Commission site by day 45 (Y/N)",
          metricNe: "दिन ४५ सम्म मस्यौदा कानून मन्त्रालय वा कानून आयोग साइटमा (हो/होइन)",
          howEn: "Dated PDF; version number.",
          howNe: "मितिसहित PDF; संस्करण नम्बर।",
        },
        {
          metricEn: "Count of documented consultation sessions + published feedback summary",
          metricNe: "कागजातीकृत परामर्श सत्र संख्या + प्रतिक्रिया सार प्रकाशित",
          howEn: "Minutes or video links archived.",
          howNe: "मिनेट वा भिडियो लिंक अभिलेख।",
        },
      ],
      risks: [
        {
          en: "Rushed draft — labour rights challenged in court or on streets.",
          ne: "हतारिएको मस्यौदा — अदालत वा सडकमा श्रम अधिकार चुनौती।",
        },
        {
          en: "Selective enforcement — neutrality rules weaponized against dissent.",
          ne: "छानिएको कार्यान्वयन — निष्पक्षता नियम दुरुपयोग।",
        },
      ],
      escalation: [
        {
          en: "Labour federations and legal aid clinics review draft articles.",
          ne: "श्रम महासङ्घ र कानुनी सहायता केन्द्रले मस्यौदा धारा समीक्षा।",
        },
        {
          en: "Parliamentary public hearings before passage.",
          ne: "पारित हुनुअघि संसदीय सार्वजनिक सुनुवाइ।",
        },
        {
          en: "Share this point so the 45-day clock stays visible (#point-12).",
          ne: "४५ दिने घडी दृश्य राख्न साझेदारी गर्नुहोस् (#बुँदा-१२)।",
        },
      ],
      programStatusEn: "🔴 No evidence on file — 45-day civil service bill draft not publicly verified on this tracker.",
      programStatusNe: "🔴 प्रमाण दर्ता छैन — ४५ दिने निजामती विधेयक मस्यौदा यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p13",
    pointNumber: 13,
    category: "Administrative Reform & Restructuring",
    promise:
      "Improve patterns of corruption, delay, and discourteous conduct toward service seekers by strictly implementing the civil service code of conduct so the bureaucracy becomes accountable, service-oriented, citizen-oriented, and exemplary; ensure an environment where staff uphold professional dignity and work impartially and neutrally to implement government decisions effectively.",
    promiseNe:
      "विद्यमान भ्रष्टाचार, ढिलासुस्ती तथा सेवाग्राहीप्रति असहज व्यवहारजस्ता प्रवृत्तिहरूको सुधार गर्दै कर्मचारीतन्त्रलाई उत्तरदायी, सेवामुखी, जनमुखी र उदाहरणीय बनाउन कर्मचारी आचारसंहिताको अक्षरशः कार्यान्वयन गर्ने। साथै, कर्मचारीहरूले व्यावसायिक मर्यादा कायम राख्दै निष्पक्ष, तटस्थ र सरकारका निर्णयहरूको प्रभावकारी कार्यान्वयनमा समर्पित भई काम गर्ने वातावरण सुनिश्चित गर्ने।",
    question:
      "How will code-of-conduct violations be logged, investigated, and sanctioned in practice, and what public metrics will show reduced delays and improved citizen-facing behavior?",
    questionNe:
      "आचारसंहिता उल्लङ्घन व्यवहारमा कसरी दर्ता, छानबिन र सजाय हुन्छ, र ढिलाइ घट्ने तथा सेवाग्राहीप्रतिको व्यवहार सुधार देखाउने सार्वजनिक माप के हुन्छ?",
    whyThisMatters:
      "Formal rules already exist in many systems; credibility comes from visible enforcement when citizens are mistreated or files stall.",
    whyThisMattersNe:
      "औपचारिक नियम धेरै ठाउँमा हुन्छ; सेवाग्राही दुर्व्यवहार वा फाइल अड्किँदा देखिने कार्यान्वयनले मात्र विश्वास जन्माउँछ।",
    possiblePathItems: [
      "Public service standards and courtesy KPIs by office type",
      "Time-stamped grievance portal with escalation SLAs",
      "Published disciplinary statistics (cases opened/closed)",
      "Mystery shopping or third-party citizen experience audits",
      "Leadership accountability when repeat offenders stay in post",
    ],
    possiblePathItemsNe: [
      "कार्यालय प्रकारअनुसार सार्वजनिक सेवा मानक र शिष्टाचार सूचक",
      "उचालन SLA सहित समयांकित गुनासो पोर्टल",
      "अनुशासनिक तथ्याङ्क (मुद्दा दर्ता/निराकरण) प्रकाशन",
      "गोप्य निरीक्षण वा तेस्रो पक्षको नागरिक अनुभव लेखापरीक्षा",
      "दोहोरो उल्लङ्घक तैनाथ रहँदा नेतृत्व जवाफदेहिता",
    ],
    systemInsight:
      "“Strict implementation” is measurable: fewer unexplained delays, fewer informal ‘speed fees,’ and published consequences for misconduct.",
    systemInsightNe:
      "«अक्षरशः कार्यान्वयन» माप्न मिल्छ: अनौठो ढिलाइ घट्नु, अनौपचारिक «चाँडो शुल्क» कम हुनु, र दुराचारमा सजाय सार्वजनिक हुनु।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item १३ (code of conduct & service culture; scan Page 4)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा १३ (आचारसंहिता र सेवा संस्कृति; स्क्यान पृष्ठ ४)",
    sourceExcerpt:
      "From scan: curb corruption, delay, poor treatment of service seekers; strict code of conduct; accountable, service- and citizen-oriented bureaucracy; impartial, neutral environment for implementing government decisions.",
    sourceExcerptNe:
      "स्क्यान: भ्रष्टाचार, ढिला, सेवाग्राहीप्रति असहज व्यवहार सुधार; आचारसंहिता कडाइ; उत्तरदायी, सेवा-र जनमुखी कर्मचारीतन्त्र; निर्णय कार्यान्वयनका लागि निष्पक्ष वातावरण।",
    layer1: {
      hookEmoji: "🤝",
      hook: "Strict code of conduct — but where’s the proof of enforcement?",
      hookNe: "कडा आचारसंहिता — कार्यान्वयन प्रमाण कहाँ छ?",
      stakeLine: "Citizens need visible sanctions and fewer unexplained delays — not another poster on the wall.",
      stakeLineNe: "नागरिकले सजाय र अनौठो ढिलाइ कम देख्न चाहन्छन् — पर्खालको अर्को पोस्टर होइन।",
      coreQuestionShort: "Where are the stats on violations, investigations, and outcomes?",
      coreQuestionShortNe: "उल्लङ्घन, छानबिन र नतिजाका तथ्याङ्क कहाँ छन्?",
      coreQuestion:
        "How are code violations logged, investigated, and sanctioned; what public metrics show fewer delays and better behaviour?",
      coreQuestionNe:
        "आचार उल्लङ्घन कसरी दर्ता, छानबिन र सजाय हुन्छ; ढिलाइ घट्ने र व्यवहार सुधार देखाउने सार्वजनिक माप के हो?",
      quickScan: [
        {
          item: "Published disciplinary cases opened / closed per year",
          itemNe: "वार्षिक दर्ता/निराकरण अनुशासन मुद्दा प्रकाशित",
          status: "❌ Not available",
          statusNe: "❌ उपलब्ध छैन",
        },
        {
          item: "Time-stamped grievance portal with escalation SLAs",
          itemNe: "समयांकित गुनासो पोर्टल र उचालन SLA",
          status: "❌ Not in place",
          statusNe: "❌ अझै छैन",
        },
        {
          item: "Courtesy / delay KPIs by office type",
          itemNe: "कार्यालय प्रकारअनुसार शिष्टाचार/ढिलाइ सूचक",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Third-party or mystery-shopping citizen experience audits",
          itemNe: "तेस्रो पक्ष वा गोप्य निरीक्षण नागरिक अनुभव लेखापरीक्षा",
          status: "❌ None on file",
          statusNe: "❌ दर्ता छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Federal Affairs and General Administration; Public Service Commission; line ministries for sector staff; MoLJPA for disciplinary law alignment; CIAA where corruption overlaps.",
      primaryOwnersNe:
        "संघीय मामिला तथा सामान्य प्रशासन मन्त्रालय; लोक सेवा आयोग; क्षेत्रगत कर्मचारीका लागि मन्त्रालय; अनुशासन कानुन मिलानका लागि कानून मन्त्रालय; भ्रष्टाचारमा अख्तियार।",
      coordinatingOfficeEn:
        "Central integrity or HR unit publishing annual enforcement statistics and grievance SLAs.",
      coordinatingOfficeNe: "वार्षिक कार्यान्वयन तथ्याङ्क र गुनासो SLA प्रकाशन गर्न केन्द्रीय सुशासन वा जनशक्ति एकाइ।",
      accountableRolesEn:
        "Department heads must refer misconduct cases; integrity unit tracks repeat offenders and leadership accountability.",
      accountableRolesNe:
        "विभाग प्रमुखले दुराचार मुद्दा सिफारिस गर्नुपर्छ; सुशासन एकाइले दोहोरो उल्लङ्घक र नेतृत्व जवाफदेहिता ट्र्याक गर्छ।",
      timelineEn: "Ongoing: strict implementation per code; annual public reporting cycle to be established.",
      timelineNe: "निरन्तर: आचारसंहिता अनुसार कडा कार्यान्वयन; वार्षिक सार्वजनिक प्रतिवेदन चक्र स्थापना।",
      milestones: [
        {
          en: "Publish standard operating procedure for misconduct complaints end-to-end.",
          ne: "दुराचार उजुरी अन्त्यसम्मको मानक सञ्चालन प्रक्रिया प्रकाशन।",
        },
        {
          en: "Launch or upgrade grievance portal with SLA timers visible to applicants.",
          ne: "आवेदकलाई SLA घडी देखिने गुनासो पोर्टल सुधार वा सुरु।",
        },
        {
          en: "Annual integrity report: delays reduced, sanctions applied, appeals resolved.",
          ne: "वार्षिक सुशासन प्रतिवेदन: ढिलाइ घट्यो, सजाय भयो, पुनरावेदन टुंगियो।",
        },
      ],
      kpis: [
        {
          metricEn: "Median days to resolve standard service requests (by top 5 services)",
          metricNe: "मानक सेवा अनुरोध टुंग्याउन मध्यक दिन (शीर्ष ५ सेवा)",
          howEn: "Before/after code enforcement campaign; same definitions.",
          howNe: "आचार अभियान अघि/पछि; एउटै परिभाषा।",
        },
        {
          metricEn: "Share of misconduct cases resulting in documented sanction",
          metricNe: "कागजातीकृत सजाय भएका दुराचार मुद्दाको हिस्सा",
          howEn: "Annual table with anonymized case types.",
          howNe: "बेपर्दा प्रकारसहित वार्षिक तालिका।",
        },
      ],
      risks: [
        {
          en: "Formalism — codes exist, supervisors shield favourites.",
          ne: "औपचारिकता — संहिता छ, तर माथिल्लोले मनपर्नेलाई जोगाउँछ।",
        },
        {
          en: "Fear-based culture — staff avoid decisions, delays grow.",
          ne: "डरको संस्कृति — कर्मचारी निर्णय टार्छन्, ढिलाइ बढ्छ।",
        },
      ],
      escalation: [
        {
          en: "Citizen charters displayed in every office with complaint QR code.",
          ne: "प्रत्येक कार्यालयमा नागरिक घोषणापत्र र उजुरी QR।",
        },
        {
          en: "Media exposes chronic delay offices until KPIs improve.",
          ne: "KPI नसुध्रिञ्जेल सञ्चारले दीर्घ ढिलाइ कार्यालय उजागर।",
        },
        {
          en: "Share this point so enforcement stays in the open (#point-13).",
          ne: "कार्यान्वयन खुला राख्न साझेदारी गर्नुहोस् (#बुँदा-१३)।",
        },
      ],
      programStatusEn: "🔴 No evidence on file — disciplinary stats and grievance SLAs not publicly verified here.",
      programStatusNe: "🔴 प्रमाण दर्ता छैन — अनुशासन तथ्याङ्क र गुनासो SLA यहाँ प्रमाणित छैन।",
    },
  },
  {
    id: "p14",
    pointNumber: 14,
    category: "Administrative Reform & Restructuring",
    promise:
      "Draft and approve national standards for organization and management (O&M) surveys at the federal, provincial, and local levels within 15 days.",
    promiseNe:
      "सङ्घ, प्रदेश तथा स्थानीय तहको सङ्गठन तथा व्यवस्थापन सर्वेक्षणको राष्ट्रिय मापदण्ड १५ दिनभित्र तर्जुमा गरी स्वीकृत गर्ने।",
    question:
      "Who approves the final O&M standards, how will provinces and municipalities adopt them, and what public template will be used so survey results are comparable across all three tiers?",
    questionNe:
      "अन्तिम O&M मानक कसले स्वीकृत गर्छ, प्रदेश र पालिकाले कसरी अपनाउँछन्, र तीनै तहमा सर्वेक्षण नतिजा तुलनीय बनाउने सार्वजनिक ढाँचा के हुन्छ?",
    whyThisMatters:
      "Without shared O&M standards, restructuring debates rely on anecdotes instead of comparable staffing and function data.",
    whyThisMattersNe:
      "साझा O&M मानक बिना पुनर्संरचना बहस कथनमा मात्र टिक्छ — तुलनीय दरबन्दी र कार्य डेटा हुँदैन।",
    possiblePathItems: [
      "Published standard document with definitions and survey cycle",
      "Training for provincial/local teams applying the standard",
      "Repository of completed O&M surveys open to oversight bodies",
      "Linkage to ministry merger and post-reform staffing decisions",
    ],
    possiblePathItemsNe: [
      "परिभाषा र सर्वेक्षण चक्रसहित सार्वजनिक मानक कागज",
      "मानक लागू गर्ने प्रदेश/स्थानीय टोलीलाई तालिम",
      "पूर्ण O&M सर्वेक्षण अभिलेख — निगरानी निकायलाई खुला",
      "मन्त्रालय मिलाप र पुनर्संरचनापछिको दरबन्दी निर्णयसँग जोड",
    ],
    systemInsight:
      "Fifteen days is ambitious; the accountability test is whether one standard actually governs all three levels’ surveys.",
    systemInsightNe:
      "पन्ध्र दिन महत्वाकांक्षी; जवाफदेहिताको जाँच एउटै मानकले तीनै तहको सर्वेक्षण चलाउँछ कि चलाउँदैन भन्नेमा छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item १४ (O&M survey national standards; scan Page 4)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा १४ (संघसंस्था सर्वेक्षण राष्ट्रिय मानक; स्क्यान पृष्ठ ४)",
    sourceExcerpt:
      "From scan: national standards for federal, provincial, and local O&M surveys drafted and approved within 15 days.",
    sourceExcerptNe:
      "स्क्यान: सङ्घ, प्रदेश, स्थानीय संगठन–व्यवस्थापन सर्वेक्षणको राष्ट्रिय मापदण्ड १५ दिनभित्र तर्जुमा र स्वीकृति।",
    layer1: {
      hookEmoji: "📐",
      hook: "15 days for national O&M standards — all three tiers must match.",
      hookNe: "१५ दिन: राष्ट्रिय संघसंस्था मानक — तीनै तह मिल्नुपर्छ।",
      stakeLine: "Without one standard, restructuring debates stay anecdotal — not comparable data.",
      stakeLineNe: "एउटै मानक बिना पुनर्संरचना कथनमा मात्र — तुलनीय डेटा हुँदैन।",
      coreQuestionShort: "Where’s the approved standard document — and who adopts it where?",
      coreQuestionShortNe: "स्वीकृत मानक कागज कहाँ — कहाँ कसले अपनाउँछ?",
      coreQuestion:
        "Who approves the O&M standards; how will provinces and local governments adopt them; what template makes surveys comparable?",
      coreQuestionNe:
        "O&M मानक कसले स्वीकृत गर्छ; प्रदेश र स्थानीय कसरी अपनाउँछन्; सर्वेक्षण तुलनीय बनाउने ढाँचा के हो?",
      quickScan: [
        {
          item: "National O&M standard drafted + approved within 15 days (public)",
          itemNe: "१५ दिनभित्र राष्ट्रिय संघसंस्था मानक तर्जुमा र स्वीकृति (सार्वजनिक)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Adoption circulars to provinces and municipalities",
          itemNe: "प्रदेश र पालिकामा अपनाउने परिपत्र",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Training schedule for survey teams",
          itemNe: "सर्वेक्षण टोलीका लागि तालिम तालिका",
          status: "⚠️ Not announced",
          statusNe: "⚠️ घोषणा छैन",
        },
        {
          item: "Repository of completed O&M surveys open to oversight",
          itemNe: "निगरानीका लागि पूर्ण O&M सर्वेक्षण भण्डार खुला",
          status: "❌ Not available",
          statusNe: "❌ उपलब्ध छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Federal Affairs and General Administration; National Planning Commission or statistics office as technical lead; Ministry of Finance for post data; provincial and local coordination bodies.",
      primaryOwnersNe:
        "संघीय मामिला तथा सामान्य प्रशासन मन्त्रालय; प्राविधिक नेतृत्वका लागि राष्ट्रिय योजना आयोग वा तथ्याङ्क कार्यालय; पछिको डेटाका लागि अर्थ मन्त्रालय; प्रदेश र स्थानीय समन्वय निकाय।",
      coordinatingOfficeEn:
        "Inter-government technical committee aligning federal, provincial, and local O&M definitions.",
      coordinatingOfficeNe: "सङ्घ, प्रदेश र स्थानीय O&M परिभाषा मिलाउन अन्तरसरकारी प्राविधिक समिति।",
      accountableRolesEn:
        "Approving authority publishes gazette or cabinet decision; provinces certify local adoption timelines.",
      accountableRolesNe:
        "स्वीकृत गर्ने निकायले राजपत्र वा मन्त्रिपरिषद् निर्णय प्रकाशन; प्रदेशले स्थानीय अपनाउने मिति प्रमाणित गर्छ।",
      timelineEn: "T+15 days: national standards drafted and approved; then: rollout to subnational tiers with training.",
      timelineNe: "T+१५ दिन: राष्ट्रिय मानक तर्जुमा र स्वीकृति; पछि: तालिमसहित उपराष्ट्रिय तहमा विस्तार।",
      milestones: [
        {
          en: "Publish standard PDF with definitions, survey cycle, and data fields.",
          ne: "परिभाषा, सर्वेक्षण चक्र र डेटा क्षेत्रसहित मानक PDF प्रकाशन।",
        },
        {
          en: "Issue adoption guidelines for provincial and local governments.",
          ne: "प्रदेश र स्थानीय सरकारका लागि अपनाउने निर्देशिका जारी।",
        },
        {
          en: "Open repository template for completed surveys (searchable by tier).",
          ne: "पूर्ण सर्वेक्षणका लागि खोज्न मिल्ने भण्डार ढाँचा (तहअनुसार)।",
        },
      ],
      kpis: [
        {
          metricEn: "Approved standard on official site with approval date (Y/N)",
          metricNe: "स्वीकृति मितिसहित मानक आधिकारिक साइटमा (हो/होइन)",
          howEn: "Stable URL; version control.",
          howNe: "स्थिर URL; संस्करण नियन्त्रण।",
        },
        {
          metricEn: "% of provinces reporting adoption + first survey wave completed",
          metricNe: "अपनाउने प्रतिवेदन गर्ने प्रदेश % + पहिलो सर्वेक्षण चरण पूरा",
          howEn: "Quarterly federal dashboard.",
          howNe: "त्रैमासिक संघीय ड्यासबोर्ड।",
        },
      ],
      risks: [
        {
          en: "Rushed standard — provinces interpret differently anyway.",
          ne: "हतारिएको मानक — प्रदेशले फरक व्याख्या गर्छ।",
        },
        {
          en: "Survey fatigue — forms without use in staffing decisions.",
          ne: "सर्वेक्षण थकान — दरबन्दी निर्णयमा प्रयोग हुँदैन।",
        },
      ],
      escalation: [
        {
          en: "LG associations demand simple templates and help desks.",
          ne: "पालिका संघले सरल ढाँचा र हेल्प डेस्क माग।",
        },
        {
          en: "Researchers compare O&M data with ministry merger outcomes.",
          ne: "अनुसन्धानकर्ताले O&M डेटा र मन्त्रालय मिलाप नतिजा तुलना गर्छन्।",
        },
        {
          en: "Share this point so one standard stays the story (#point-14).",
          ne: "एउटै मानक कथा राख्न साझेदारी गर्नुहोस् (#बुँदा-१४)।",
        },
      ],
      programStatusEn: "🟡 At risk — 15-day national O&M standard approval not publicly proven on this tracker.",
      programStatusNe: "🟡 जोखिममा — १५ दिने राष्ट्रिय संघसंस्था मानक स्वीकृति यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p15",
    pointNumber: 15,
    category: "Administrative Reform & Restructuring",
    promise:
      "From the next fiscal year onward, arrange for teacher service records (sitrol) registration and management of post-retirement service benefits to be handled through the provincial ministry responsible for education.",
    promiseNe:
      "शिक्षकको सिटरोल दर्ता तथा अवकाशपश्चातका सेवा सुविधा व्यवस्थापन आगामी आर्थिक वर्षदेखि प्रदेशको शिक्षा हेर्ने मन्त्रालयबाटै गर्ने व्यवस्था मिलाउने।",
    question:
      "What intergovernmental handover plan moves historical sitrol data from federal systems, how are disputes and pensions verified, and what timeline is published for teachers and unions?",
    questionNe:
      "पुरानो सिटरोल डेटा संघीय प्रणालीबाट हस्तान्तरण कसरी हुन्छ, विवाद र पेन्सन प्रमाणीकरण कसरी हुन्छ, र शिक्षक र युनियनका लागि कुन तालिका सार्वजनिक हुन्छ?",
    whyThisMatters:
      "Teacher records touch pay and retirement; unclear handoffs between tiers create anxiety and payment errors.",
    whyThisMattersNe:
      "शिक्षक अभिलेख तलब र अवकाशसँग जोडिन्छ; तहबीच हस्तान्तरण अस्पष्ट भए तनाव र भुक्तानी त्रुटि हुन्छ।",
    possiblePathItems: [
      "Published MOU between federal education / personnel bodies and provinces",
      "Data migration checklist and citizen service charter for teachers",
      "Help desks and appeals path for record mismatches",
      "Budget flow for provincial administration of retirement benefits",
    ],
    possiblePathItemsNe: [
      "संघीय शिक्षा/कर्मचारी निकाय र प्रदेशबीच सार्वजनिक समझदारी पत्र",
      "डेटा स्थानान्तरण चेकलिस्ट र शिक्षकका लागि सेवा घोषणापत्र",
      "अभिलेख बेमेलका लागि हेल्प डेस्क र पुनरावेदन मार्ग",
      "अवकाश सुविधा प्रदेश प्रशासनका लागि बजेट प्रवाह",
    ],
    systemInsight:
      "Federalism in practice is often payroll and records; this item tests whether provinces can run them without losing audit trails.",
    systemInsightNe:
      "संघीयता व्यवहारमा प्रायः तलब र अभिलेख हुन्छ; यो बुँदाले प्रदेशले लेखापरीक्षा नछोडी चलाउन सक्छ कि सक्दैन भन्ने जाँच गर्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item १५ (teacher sitrol & retirement; scan Page 4)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा १५ (शिक्षक सिटरोल र अवकाश; स्क्यान पृष्ठ ४)",
    sourceExcerpt:
      "From scan: from next FY, teacher sitrol registration and post-retirement benefit management through the provincial education ministry.",
    sourceExcerptNe:
      "स्क्यान: आगामी आर्थिक वर्षदेखि शिक्षक सिटरोल दर्ता र अवकाशपछिको सेवा सुविधा प्रदेश शिक्षा मन्त्रालयबाट।",
    layer1: {
      hookEmoji: "📚",
      hook: "Teacher records moving to provinces. Where’s the handover plan?",
      hookNe: "शिक्षक अभिलेख प्रदेशतिर। हस्तान्तरण योजना कहाँ छ?",
      stakeLine: "Pay and pensions need clean data — messy handoffs create real harm.",
      stakeLineNe: "तलब र पेन्सन सफा डेटा चाहिन्छ — मिलेको हस्तान्तरणले साँचो हानि गर्छ।",
      coreQuestionShort: "Where’s the MoU, migration plan, and help desk for mismatches?",
      coreQuestionShortNe: "समझदारी पत्र, स्थानान्तरण र बेमेल हेल्प डेस्क कहाँ छ?",
      coreQuestion:
        "How will historical sitrol data hand over from federal systems; how are disputes and pensions verified; what timeline is published?",
      coreQuestionNe:
        "पुरानो सिटरोल डेटा संघीय प्रणालीबाट कसरी हुन्छ; विवाद र पेन्सन कसरी प्रमाणित; कुन तालिका सार्वजनिक?",
      quickScan: [
        {
          item: "Federal–provincial MoU on sitrol + retirement benefit handover",
          itemNe: "सिटरोल र अवकाश सुविधा हस्तान्तरणमा संघ–प्रदेश समझदारी पत्र",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Data migration checklist + verified cutover date",
          itemNe: "डेटा स्थानान्तरण चेकलिस्ट + प्रमाणित कटओभर मिति",
          status: "⚠️ Not verified publicly",
          statusNe: "⚠️ सार्वजनिक प्रमाण छैन",
        },
        {
          item: "Help desks + appeals path for record errors",
          itemNe: "अभिलेख त्रुटिका लागि हेल्प डेस्क र पुनरावेदन",
          status: "❌ Not defined",
          statusNe: "❌ परिभाषित छैन",
        },
        {
          item: "Budget flow for provincial administration of retirement benefits",
          itemNe: "अवकाश सुविधा प्रदेश प्रशासनका लागि बजेट प्रवाह",
          status: "❌ Not disclosed",
          statusNe: "❌ खुलाइएको छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Provincial ministries of education (implementation from next FY); Ministry of Education, Science and Technology (federal policy handover); Ministry of Federal Affairs and General Administration for HR records; Ministry of Finance for pension budget routing.",
      primaryOwnersNe:
        "प्रदेश शिक्षा मन्त्रालय (आगामी आवदेखि कार्यान्वयन); शिक्षा, विज्ञान तथा प्रविधि मन्त्रालय (संघीय नीति हस्तान्तरण); मानव संसहित अभिलेखका लागि संघीय मामिला मन्त्रालय; पेन्सन बजेटका लागि अर्थ मन्त्रालय।",
      coordinatingOfficeEn:
        "Federal–provincial implementation committee with dated migration windows and joint testing.",
      coordinatingOfficeNe: "मितिसहित स्थानान्तरण खिडकी र संयुक्त परीक्षणसहित संघ–प्रदेश कार्यान्वयन समिति।",
      accountableRolesEn:
        "Provincial education secretaries own service delivery; federal bodies certify data extracts and audit trails.",
      accountableRolesNe:
        "सेवा वितरणका लागि प्रदेश शिक्षा सचिव जिम्मेवार; संघीय निकायले डेटा निकासा र लेखा ट्रेल प्रमाणित गर्छ।",
      timelineEn: "From next fiscal year: provincial handling of sitrol registration and post-retirement benefits; prior FY: migration and testing.",
      timelineNe: "आगामी आवदेखि: सिटरोल दर्ता र अवकाशपछिको सुविधा प्रदेश; अघिल्लो आव: स्थानान्तरण र परीक्षण।",
      milestones: [
        {
          en: "Signed intergovernmental agreement with data field mapping.",
          ne: "डेटा क्षेत्र म्यापिङसहित हस्ताक्षरित अन्तरसरकारी सम्झौता।",
        },
        {
          en: "Pilot migration for one province + reconciliation report.",
          ne: "एक प्रदेश पाइलट स्थानान्तरण + मिलान प्रतिवेदन।",
        },
        {
          en: "National go-live notice with teacher-facing service charter.",
          ne: "शिक्षकमुखी सेवा घोषणापत्रसहित राष्ट्रिय गो-लाइभ सूचना।",
        },
      ],
      kpis: [
        {
          metricEn: "% of teacher records successfully migrated vs exceptions queue",
          metricNe: "सफल स्थानान्तरण शिक्षक अभिलेख % बनाम अपवाद लाइन",
          howEn: "Monthly reconciliation dashboard.",
          howNe: "मासिक मिलान ड्यासबोर्ड।",
        },
        {
          metricEn: "Pension payment error rate before vs after handover (published)",
          metricNe: "हस्तान्तरण अघि/पछि पेन्सन त्रुटि दर (प्रकाशित)",
          howEn: "Sample audit of complaints vs payments.",
          howNe: "गुनासा र भुक्तानी नमूना जाँच।",
        },
      ],
      risks: [
        {
          en: "Duplicate or missing records — teachers unpaid or wrong post.",
          ne: "दोहोरो वा हराएको अभिलेख — तलब वा पद गलत।",
        },
        {
          en: "Provincial capacity gaps — backlog grows at handover.",
          ne: "प्रदेश क्षमता कम — हस्तान्तरणमा फिर्ता बढ्छ।",
        },
      ],
      escalation: [
        {
          en: "Teacher unions escalate systemic errors with public dashboards.",
          ne: "शिक्षक संघले प्रणालीगत त्रुटि सार्वजनिक ड्यासबोर्डसहित उचाल्छ।",
        },
        {
          en: "Federal treasury holds contingency until reconciliation clears.",
          ne: "मिलान नभएसम्म संघीय कोषमा आकस्मिक रोक।",
        },
        {
          en: "Share this point so payroll handover stays visible (#point-15).",
          ne: "तलब हस्तान्तरण दृश्य राख्न साझेदारी गर्नुहोस् (#बुँदा-१५)।",
        },
      ],
      programStatusEn: "🔴 No evidence on file — federal–provincial sitrol handover not publicly verified on this tracker.",
      programStatusNe: "🔴 प्रमाण दर्ता छैन — संघ–प्रदेश सिटरोल हस्तान्तरण यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p16",
    pointNumber: 16,
    category: "Administrative Reform & Restructuring",
    promise:
      "Link employee performance to results: each public body or office shall, within 45 days, prepare objective performance indicators tied to the job descriptions of every post; within 90 days, implement an accountability and review system linked to performance to end the practice of treating strong and weak performers alike.",
    promiseNe:
      "कर्मचारीहरूको कार्यसम्पादनलाई परिणामसँग जोड्न प्रत्येक पदको कार्य विवरणको वस्तुनिष्ठ कार्यसम्पादन सूचक सम्बन्धित सार्वजनिक निकाय/कार्यालयले ४५ दिनभित्र तयार गर्ने। कार्यसम्पादन मूल्याङ्कन कमजोर हुँदा राम्रो र खराब कार्यसम्पादनलाई समान व्यवहार गर्ने प्रवृत्ति हटाउन ९० दिनभित्र कार्यसम्पादनमा आबद्ध उत्तरदायित्व र पुनरावलोकन प्रणाली लागू गर्ने।",
    question:
      "Will KPI templates be published office-by-office, how are ratings verified to prevent favoritism, and what consequences (promotion, training, separation) attach to sustained underperformance after 90 days?",
    questionNe:
      "कार्यालयअनुसार KPI ढाँचा सार्वजनिक हुन्छ कि हुँदैन, पक्षपात रोक्न मूल्याङ्कन कसरी प्रमाणित हुन्छ, र ९० दिनपछि निरन्तर कमजोर प्रदर्शनमा बढुवा, तालिम वा छुट्टै के अनुमोदन हुन्छ?",
    whyThisMatters:
      "Performance systems fail when indicators are vague or reviews are ceremonial; staff morale depends on fair differentiation.",
    whyThisMattersNe:
      "सूचक अस्पष्ट वा समीक्षा औपचारिक भए प्रदर्शन प्रणाली असफल हुन्छ; निष्पक्ष भिन्नतामा मनोबल निर्भर छ।",
    possiblePathItems: [
      "Public KPI register per office with job description mapping",
      "Calibration panels and random audit of supervisor ratings",
      "Published progression rules tied to performance bands",
      "Appeals mechanism with timelines",
    ],
    possiblePathItemsNe: [
      "पद विवरण म्यापिङसहित कार्यालयगत सार्वजनिक KPI दर्ता",
      "सुपरभाइजर मूल्याङ्कनका लागि क्यालिब्रेसन र यादृच्छिक लेखापरीक्षा",
      "प्रदर्शन स्तरसँग जोडिएको बढुवा नियम सार्वजनिक",
      "समयसीमासहित पुनरावेदन संयन्त्र",
    ],
    systemInsight:
      "The 45/90-day pairing is the agenda’s engine: indicators first, then consequences—skipping either side preserves the old culture.",
    systemInsightNe:
      "४५/९० दिनको जोडी एजेन्डाको इन्जिन हो: पहिले सूचक, पछि परिणाम — कुनै एक छोड्यो पुरानो संस्कृति जोगिन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item १६ (performance KPIs & review; scan Page 4)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा १६ (प्रदर्शन सूचक र पुनरावलोकन; स्क्यान पृष्ठ ४)",
    sourceExcerpt:
      "From scan: within 45 days objective performance indicators per post; within 90 days accountability and review system linked to performance to stop equal treatment of good and poor performers.",
    sourceExcerptNe:
      "स्क्यान: ४५ दिनभित्र पदगत वस्तुनिष्ठ कार्यसम्पादन सूचक; ९० दिनभित्र प्रदर्शन जोडिएको उत्तरदायित्व र पुनरावलोकन — राम्रो र नराम्रोलाई समान व्यवहार अन्त्य।",
    layer1: {
      hookEmoji: "📊",
      hook: "45 days for KPIs per post, 90 days for real consequences. Where’s the proof?",
      hookNe: "४५ दिन: पदगत KPI, ९० दिन: साँचो परिणाम। प्रमाण कहाँ छ?",
      stakeLine: "Fair performance systems need published indicators — not secret scorecards.",
      stakeLineNe: "निष्पक्ष प्रदर्शन प्रणालीलाई सार्वजनिक सूचक चाहिन्छ — गोप्य स्कोरकार्ड होइन।",
      coreQuestionShort: "Where are office-by-office KPIs and post-90-day consequences — in public?",
      coreQuestionShortNe: "कार्यालयगत KPI र ९० दिनपछिको परिणाम — सार्वजनिक कहाँ छ?",
      coreQuestion:
        "Will KPI templates be published per office; how are ratings verified; what happens after sustained underperformance?",
      coreQuestionNe:
        "कार्यालयअनुसार KPI ढाँचा सार्वजनिक हुन्छ; मूल्याङ्कन कसरी प्रमाणित; निरन्तर कमजोर प्रदर्शनपछि के हुन्छ?",
      quickScan: [
        {
          item: "Public KPI register mapped to job descriptions (45-day milestone)",
          itemNe: "पद विवरणसँग जोडिएको सार्वजनिक KPI दर्ता (४५ दिने कोसेढुङ्गा)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Performance-linked review system live (90-day milestone)",
          itemNe: "प्रदर्शन जोडिएको पुनरावलोकन प्रणाली लाइभ (९० दिने कोसेढुङ्गा)",
          status: "⚠️ Not verified publicly",
          statusNe: "⚠️ सार्वजनिक प्रमाण छैन",
        },
        {
          item: "Calibration / audit rules to limit supervisor favouritism",
          itemNe: "सुपरभाइजर पक्षपात सीमित गर्न क्यालिब्रेसन/लेखापरीक्षा नियम",
          status: "❌ Not defined",
          statusNe: "❌ परिभाषित छैन",
        },
        {
          item: "Published progression & underperformance consequences",
          itemNe: "बढुवा र कमजोर प्रदर्शनका परिणाम सार्वजनिक",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Each public body’s head; Ministry of Federal Affairs and General Administration for standards; Public Service Commission for appeals and fairness; line ministries for sector KPIs.",
      primaryOwnersNe:
        "प्रत्येक सार्वजनिक निकाय प्रमुख; मानकका लागि संघीय मामिला तथा सामान्य प्रशासन मन्त्रालय; पुनरावेदन र निष्पक्षताका लागि लोक सेवा आयोग; क्षेत्रगत KPI का लागि मन्त्रालय।",
      coordinatingOfficeEn:
        "MoFAGA-led harmonization of KPI templates and cross-office comparability rules.",
      coordinatingOfficeNe: "KPI ढाँचा र अन्तरकार्यालय तुलनात्मक नियम मिलाउन संघीय मामिला मन्त्रालय नेतृत्व।",
      accountableRolesEn:
        "Supervisors document ratings; independent calibration or HR audit samples cases quarterly.",
      accountableRolesNe:
        "सुपरभाइजरले मूल्याङ्कन कागजात गर्छ; स्वतन्त्र क्यालिब्रेसन वा HR लेखापरीक्षाले त्रैमासिक नमूना जाँच।",
      timelineEn: "T+45 days: objective KPIs per post; T+90 days: accountability and review system operational.",
      timelineNe: "T+४५ दिन: पदगत वस्तुनिष्ठ सूचक; T+९० दिन: उत्तरदायित्व र पुनरावलोकन प्रणाली सञ्चालन।",
      milestones: [
        {
          en: "Publish KPI handbook: definitions, baselines, data sources per cadre.",
          ne: "दर्जाअनुसार परिभाषा, आधाररेखा र डेटा स्रोतसहित KPI पुस्तिका प्रकाशन।",
        },
        {
          en: "Activate review cycles with appeals timeline and anonymized samples.",
          ne: "पुनरावेदन समयसीमा र बेपर्दा नमूनासहित पुनरावलोकन चक्र सक्रिय।",
        },
        {
          en: "Report first cohort outcomes: promotions, training, separation tied to ratings.",
          ne: "पहिलो समूह नतिजा: मूल्याङ्कनसँग जोडिएको बढुवा, तालिम, छुट्टै प्रतिवेदन।",
        },
      ],
      kpis: [
        {
          metricEn: "Offices with published KPI matrix by day 45 (%)",
          metricNe: "दिन ४५ सम्म KPI म्याट्रिक्स प्रकाशित कार्यालय (%)",
          howEn: "Central MoFAGA index; spot-check three offices.",
          howNe: "केन्द्रीय संघीय मामिला सूची; तीन कार्यालय नमूना जाँच।",
        },
        {
          metricEn: "Share of staff with completed review + documented rating (sample)",
          metricNe: "समीक्षा पूरा + कागजातीकृत मूल्याङ्कन भएका कर्मचारी हिस्सा (नमूना)",
          howEn: "HR audit of files; whistleblower spot-check.",
          howNe: "HR फाइल लेखापरीक्षा; गोप्य सूचना नमूना।",
        },
      ],
      risks: [
        {
          en: "Box-ticking appraisals — no real differentiation.",
          ne: "फारम मात्र भर्ने मूल्याङ्कन — वास्तविक भिन्नता छैन।",
        },
        {
          en: "Political interference in ratings at senior levels.",
          ne: "वरिष्ठ स्तरमा मूल्याङ्कनमा राजनीतिक हस्तक्षेप।",
        },
      ],
      escalation: [
        {
          en: "Staff associations demand published appeal outcomes.",
          ne: "कर्मचारी संघले पुनरावेदन नतिजा सार्वजनिक माग।",
        },
        {
          en: "Legislative review if differentiation never materializes.",
          ne: "भिन्नता देखिँदैन भने संसदीय समीक्षा।",
        },
        {
          en: "Share this point so the 45/90-day test stays visible (#point-16).",
          ne: "४५/९० दिने जाँच दृश्य राख्न साझेदारी गर्नुहोस् (#बुँदा-१६)।",
        },
      ],
      programStatusEn: "🔴 No evidence on file — 45/90-day KPI and review proof not publicly verified here.",
      programStatusNe: "🔴 प्रमाण दर्ता छैन — ४५/९० दिने KPI र समीक्षा प्रमाण यहाँ प्रमाणित छैन।",
    },
  },
  {
    id: "p17",
    pointNumber: 17,
    category: "Administrative Reform & Restructuring",
    promise:
      "Put in place quality certification of public-sector services; to incentivize excellence, the Ministry of Federal Affairs and General Administration shall, within 45 days, prepare standards for certifying the quality of services delivered by local governments.",
    promiseNe:
      "सार्वजनिक निकायको सेवाको गुणस्तर प्रमाणीकरण गर्ने व्यवस्था गरी उत्कृष्ट निकायलाई प्रोत्साहित गर्न सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालयले स्थानीय तहबाट प्रवाह हुने सेवाको गुणस्तर प्रमाणीकरण मापदण्ड ४५ दिनभित्र तयार गर्ने।",
    question:
      "What objective criteria define “certified” local services, who audits certifications, and what benefits (fiscal or reputational) flow to high-performing municipalities?",
    questionNe:
      "«प्रमाणित» स्थानीय सेवाको वस्तुनिष्ठ मापदण्ड के, प्रमाणीकरण कसले लेखापरीक्षा गर्छ, र उत्कृष्ट पालिकालाई के लाभ (बजेट वा प्रतिष्ठा) मिल्छ?",
    whyThisMatters:
      "Certification only drives improvement if standards are hard to game and citizens can see who earned the badge.",
    whyThisMattersNe:
      "मानक कमजोर वा गोप्य भए प्रमाणीकरण सुधार चलाउँदैन — नागरिकले कसले बैज लगायो देख्नुपर्छ।",
    possiblePathItems: [
      "Published rubric covering timeliness, accessibility, and redress",
      "Third-party or peer audit rotation for certifications",
      "Public dashboard of certified/uncertified service counters",
      "Incentive rules (grants, awards) tied to certification level",
    ],
    possiblePathItemsNe: [
      "समयमै, पहुँच र गुनासो निवारण समेट्ने सार्वजनिक मापदण्ड",
      "प्रमाणीकरणका लागि तेस्रो पक्ष वा साथी लेखापरीक्षा चक्र",
      "प्रमाणित/अप्रमाणित सेवा काउन्टरको सार्वजनिक ड्यासबोर्ड",
      "प्रमाणन स्तरसँग जोडिएको अनुदान वा पुरस्कार नियम",
    ],
    systemInsight:
      "Local quality certification can reduce the ‘lottery’ of service—if MoFAGA publishes standards citizens can compare across wards.",
    systemInsightNe:
      "स्थानीय गुणस्तर प्रमाणीकरणले सेवाको «भाग्य» घटाउन सक्छ — यदि मन्त्रालयले नागरिकले वडातिर तुलना गर्न मिल्ने मानक प्रकाशन गर्छ भने।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item १७ (local service quality certification; scan Page 4)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा १७ (स्थानीय सेवा गुणस्तर प्रमाणन; स्क्यान पृष्ठ ४)",
    sourceExcerpt:
      "From scan: quality certification for public services; MoFAGA prepares standards within 45 days for certifying quality of services provided by local levels; incentivize excellent bodies.",
    sourceExcerptNe:
      "स्क्यान: सार्वजनिक सेवा गुणस्तर प्रमाणीकरण; संघीय मामिला मन्त्रालयले ४५ दिनभित्र स्थानीय सेवाको गुणस्तर प्रमाणन मापदण्ड; उत्कृष्टलाई प्रोत्साहन।",
    layer1: {
      hookEmoji: "🎖️",
      hook: "45 days for local service quality standards. Who gets the badge — and who checks?",
      hookNe: "४५ दिन: स्थानीय सेवा गुणस्तर मानक। बैज कसले पाउँछ — जाँच कसले गर्छ?",
      stakeLine: "Certification works only if standards are hard to game and results are visible ward-by-ward.",
      stakeLineNe: "गुणस्तर कमजोर वा गोप्य भए प्रमाणीकरण सुधार चलाउँदैन — वडादेखि देखिनुपर्छ।",
      coreQuestionShort: "Where’s the rubric, the auditor, and the incentives for certified municipalities?",
      coreQuestionShortNe: "मापदण्ड, लेखापरीक्षक र प्रमाणित पालिकाका लाभ कहाँ छन्?",
      coreQuestion:
        "What criteria define “certified” local services; who audits; what fiscal or reputational benefits apply?",
      coreQuestionNe:
        "«प्रमाणित» स्थानीय सेवाको मापदण्ड के; लेखापरीक्षा कसले; बजेट वा प्रतिष्ठा के लाभ?",
      quickScan: [
        {
          item: "MoFAGA quality standards document published (45-day milestone)",
          itemNe: "संघीय मामिला मन्त्रालय गुणस्तर मानक कागज प्रकाशित (४५ दिने कोसेढुङ्गा)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Independent or peer audit protocol for certifications",
          itemNe: "प्रमाणनका लागि स्वतन्त्र वा साथी लेखापरीक्षा प्रोटोकल",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Public dashboard of certified vs uncertified service counters",
          itemNe: "प्रमाणित/अप्रमाणित सेवा काउन्टरको सार्वजनिक ड्यासबोर्ड",
          status: "❌ None available",
          statusNe: "❌ उपलब्ध छैन",
        },
        {
          item: "Published incentive rules (grants, awards) tied to certification level",
          itemNe: "प्रमाणन स्तरसँग जोडिएको प्रोत्साहन नियम (अनुदान, पुरस्कार) प्रकाशित",
          status: "❌ Not spelled out",
          statusNe: "❌ खुलाइएको छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Federal Affairs and General Administration; Ministry of Federal Affairs coordination with provincial/local governments; auditors (third-party or peer) as defined in standards.",
      primaryOwnersNe:
        "संघीय मामिला तथा सामान्य प्रशासन मन्त्रालय; प्रदेश/स्थानीय सरकारसँग समन्वय; मानकअनुसार लेखापरीक्षक (तेस्रो पक्ष वा साथी)।",
      coordinatingOfficeEn:
        "MoFAGA certification unit with application portal and appeals for municipalities.",
      coordinatingOfficeNe: "पालिकाका लागि आवेदन पोर्टल र पुनरावेदनसहित संघीय मामिला प्रमाणन एकाइ।",
      accountableRolesEn:
        "Municipal chief executive accountable for service quality data; auditors publish findings without ministry editing.",
      accountableRolesNe:
        "सेवा गुणस्तर डेटाका लागि पालिका प्रमुख कार्यकारी जवाफदेह; लेखापरीक्षकले मन्त्रालय सम्पादन बिना निष्कर्ष प्रकाशन।",
      timelineEn: "T+45 days: certification standards prepared; then: pilot certifications and national rollout.",
      timelineNe: "T+४५ दिन: प्रमाणन मानक तयार; पछि: पाइलट प्रमाणन र राष्ट्रिय विस्तार।",
      milestones: [
        {
          en: "Publish rubric: timeliness, accessibility, redress, citizen feedback.",
          ne: "समयमै, पहुँच, गुनासो निवारण, नागरिक प्रतिक्रिया समेट्ने मापदण्ड प्रकाशन।",
        },
        {
          en: "First audit cycle completed and badges awarded with evidence packs.",
          ne: "पहिलो लेखापरीक्षा चक्र पूरा र प्रमाण सहित बैज प्रदान।",
        },
        {
          en: "Link to fiscal transfers or performance grants where policy allows.",
          ne: "नीति अनुमति भए बजेट हस्तान्तरण वा प्रदर्शन अनुदानसँग जोड।",
        },
      ],
      kpis: [
        {
          metricEn: "Standards PDF on MoFAGA site with version date (Y/N)",
          metricNe: "संस्करण मितिसहित मानक PDF संघीय मामिला साइटमा (हो/होइन)",
          howEn: "Hash or stable URL; changelog.",
          howNe: "स्थिर URL; परिवर्तन लग।",
        },
        {
          metricEn: "Count of municipalities certified / in progress / failed audit",
          metricNe: "प्रमाणित / प्रगतिमा / लेखापरीक्षा असफल पालिका संख्या",
          howEn: "Quarterly public table.",
          howNe: "त्रैमासिक सार्वजनिक तालिका।",
        },
      ],
      risks: [
        {
          en: "Rubber-stamp audits — badge becomes political favour.",
          ne: "औपचारिक लेखापरीक्षा — बैज राजनीतिक मनपर्ने।",
        },
        {
          en: "Unfunded mandates — locals cannot meet standards.",
          ne: "अनुदानविहीन निर्देश — स्थानीयले मानक पुरा गर्न सक्दैन।",
        },
      ],
      escalation: [
        {
          en: "Citizen scorecards comparing municipalities in open data.",
          ne: "खुला डेटामा पालिका तुलना गर्ने नागरिक स्कोरकार्ड।",
        },
        {
          en: "National federation of municipalities pushes for grant support.",
          ne: "पालिका महासङ्घले अनुदान सहयोगका लागि दबाब।",
        },
        {
          en: "Share this point so certification stays honest (#point-17).",
          ne: "प्रमाणन ईमानदार राख्न साझेदारी गर्नुहोस् (#बुँदा-१७)।",
        },
      ],
      programStatusEn: "🟡 At risk — 45-day local quality standards not publicly proven on this tracker.",
      programStatusNe: "🟡 जोखिममा — ४५ दिने स्थानीय गुणस्तर मानक यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p18",
    pointNumber: 18,
    category: "Administrative Reform & Restructuring",
    promise:
      "For physical infrastructure and standardized layout of government offices, the Ministry of Urban Development shall, within two months, formulate minimum standards and bring them into implementation within 100 days.",
    promiseNe:
      "सरकारी कार्यालयहरूको भौतिक पूर्वाधार र स्तरीकृत विन्यासका लागि शहरी विकास मन्त्रालयले दुई महिनाभित्र न्यूनतम मापदण्ड तर्जुमा गरी १०० दिनभित्र कार्यान्वयनमा लैजाने।",
    question:
      "Which office types and levels are in scope, how will compliance be inspected, and what budget line funds retrofits within the 100-day implementation window?",
    questionNe:
      "कुन कार्यालय प्रकार र तह दायरामा पर्छ, अनुपालन कसरी निरीक्षण हुन्छ, र १०० दिने कार्यान्वयनमा पुनर्संरचनाका लागि कुन बजेट शीर्षक छ?",
    whyThisMatters:
      "Uniform office standards affect accessibility, safety, and dignity for citizens and staff; without funding plans they stay on paper.",
    whyThisMattersNe:
      "एकरूप कार्यालय मानकले नागरिक र कर्मचारीका लागि पहुँच, सुरक्षा र मर्यादा असर गर्छ; बजेट योजना बिना कागजमै रहन्छ।",
    possiblePathItems: [
      "Published standard drawings and accessibility checklist",
      "Phased rollout prioritizing high-traffic service centers",
      "Joint inspection protocol with local governments",
      "Capital maintenance budget guidance for compliance",
    ],
    possiblePathItemsNe: [
      "नक्सा र पहुँच योग्यता चेकलिस्ट सार्वजनिक",
      "बढी भीडका सेवा केन्द्र प्राथमिकता चरणबद्ध विस्तार",
      "स्थानीय सरकारसँग संयुक्त निरीक्षण प्रोटोकल",
      "अनुपालनका लागि पूँजीगत मर्मत बजेट मार्गदर्शन",
    ],
    systemInsight:
      "Two months to draft and 100 days to implement is tight; success means a realistic scope and visible pilot sites, not a binder on a shelf.",
    systemInsightNe:
      "दुई महिना तर्जुमा र १०० दिन कार्यान्वयन कडा; सफलता वास्तविक दायरा र देखिने नमूना साइटमा निर्भर छ — ताकमा मात्र बाइन्डर होइन।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item १८ (office infrastructure & layout; scan Page 4)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा १८ (कार्यालय पूर्वाधार र विन्यास; स्क्यान पृष्ठ ४)",
    sourceExcerpt:
      "From scan: MoUD drafts minimum standards for government office physical infrastructure and standard layout within two months; implement within 100 days.",
    sourceExcerptNe:
      "स्क्यान: शहरी विकास मन्त्रालयले दुई महिनामा सरकारी कार्यालय भौतिक पूर्वाधार र स्तरीकृत विन्यासको न्यूनतम मापदण्ड; १०० दिनमा कार्यान्वयन।",
    layer1: {
      hookEmoji: "🏢",
      hook: "2 months to draft office standards, 100 days to implement. Where’s the money?",
      hookNe: "२ महिना: मानक तर्जुमा, १०० दिन: कार्यान्वयन। पैसा कहाँ छ?",
      stakeLine: "Accessibility and safety need drawings and budgets — not a binder alone.",
      stakeLineNe: "पहुँच र सुरक्षाका लागि नक्सा र बजेट — मात्र फाइल होइन।",
      coreQuestionShort: "Where’s the standard, the inspection plan, and the retrofit budget?",
      coreQuestionShortNe: "मानक, निरीक्षण योजना र पुनर्संरचना बजेट कहाँ छ?",
      coreQuestion:
        "Which office types are in scope; how is compliance inspected; what budget funds retrofits within 100 days?",
      coreQuestionNe:
        "कुन कार्यालय दायरामा; अनुपालन कसरी निरीक्षण; १०० दिनभित्र पुनर्संरचनाका लागि बजेट के?",
      quickScan: [
        {
          item: "Minimum standards published (2-month milestone) — layout, accessibility",
          itemNe: "न्यूनतम मानक प्रकाशित (२ महिने कोसेढुङ्गा) — विन्यास, पहुँच",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "100-day implementation plan with pilot sites and milestones",
          itemNe: "१०० दिने कार्यान्वयन योजना नमूना साइट र कोसेढुङ्गासहित",
          status: "⚠️ Not verified publicly",
          statusNe: "⚠️ सार्वजनिक प्रमाण छैन",
        },
        {
          item: "Joint inspection protocol with local governments",
          itemNe: "स्थानीय सरकारसँग संयुक्त निरीक्षण प्रोटोकल",
          status: "❌ Not defined",
          statusNe: "❌ परिभाषित छैन",
        },
        {
          item: "Capital budget line or guidance for compliance retrofits",
          itemNe: "अनुपालन पुनर्संरचनाका लागि पूँजीगत बजेट शीर्षक वा मार्गदर्शन",
          status: "❌ Not disclosed",
          statusNe: "❌ खुलाइएको छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Urban Development (standards and implementation lead); Ministry of Finance for capital; Ministry of Federal Affairs and General Administration for office inventory; local governments for joint inspection.",
      primaryOwnersNe:
        "शहरी विकास मन्त्रालय (मानक र कार्यान्वयन नेतृत्व); पूँजीगतका लागि अर्थ मन्त्रालय; कार्यालय सूचीका लागि संघीय मामिला मन्त्रालय; संयुक्त निरीक्षणका लागि स्थानीय सरकार।",
      coordinatingOfficeEn:
        "MoUD programme office tracking 100-day rollout against published standard drawings.",
      coordinatingOfficeNe: "प्रकाशित नक्सासहित १०० दिने विस्तार पछ्याउने शहरी विकास कार्यक्रम कार्यालय।",
      accountableRolesEn:
        "Secretaries certify office compliance; accessibility audits include DPO or civil society spot-checks.",
      accountableRolesNe:
        "सचिवले कार्यालय अनुपालन प्रमाणित गर्छन्; पहुँच लेखापरीक्षामा अपाङ्ग वा नागरिक समाज नमूना।",
      timelineEn: "T+2 months: minimum standards formulated; T+100 days: implementation in target offices.",
      timelineNe: "T+२ महिना: न्यूनतम मानक तर्जुमा; T+१०० दिन: लक्षित कार्यालयमा कार्यान्वयन।",
      milestones: [
        {
          en: "Publish standard drawings + accessibility checklist (Nepali/English).",
          ne: "नक्सा र पहुँच चेकलिस्ट प्रकाशन (नेपाली/अङ्ग्रेजी)।",
        },
        {
          en: "Name high-traffic pilot sites and completion dates.",
          ne: "बढी भीडका नमूना साइट र पूरा मिति नाम।",
        },
        {
          en: "Post-implementation inspection report with photos open to the public.",
          ne: "कार्यान्वयनपछि निरीक्षण प्रतिवेदन फोटोसहित सार्वजनिक।",
        },
      ],
      kpis: [
        {
          metricEn: "Offices meeting minimum standard by day 100 (count / %)",
          metricNe: "दिन १०० सम्म न्यूनतम मानक पुरा गर्ने कार्यालय (संख्या / %)",
          howEn: "Inspection checklist; random revisit.",
          howNe: "निरीक्षण चेकलिस्ट; यादृच्छिक पुनर्भ्रमण।",
        },
        {
          metricEn: "Budget utilization vs published retrofit plan",
          metricNe: "प्रकाशित पुनर्संरचना योजनाको बजेट उपयोग",
          howEn: "Red Book line vs expenditure reports.",
          howNe: "रातो पुस्तक शीर्षक र खर्च प्रतिवेदन।",
        },
      ],
      risks: [
        {
          en: "Standards exist only on paper — no retrofit funding.",
          ne: "मानक कागजमा मात्र — पुनर्संरचना बजेट छैन।",
        },
        {
          en: "Scope creep — 100 days cannot cover all offices.",
          ne: "दायरा बढ्दै — १०० दिनमा सबै कार्यालय पुग्दैन।",
        },
      ],
      escalation: [
        {
          en: "Citizens with disabilities file complaints on inaccessible offices.",
          ne: "अपाङ्ग नागरिकले पहुँचविहीन कार्यालयमा उजुरी।",
        },
        {
          en: "Media tours of pilot sites vs non-compliant offices.",
          ne: "नमूना साइट र अनुपालन नगरेका कार्यालय सञ्चार भ्रमण।",
        },
        {
          en: "Share this point so the 100-day window stays visible (#point-18).",
          ne: "१०० दिने म्याद दृश्य राख्न साझेदारी गर्नुहोस् (#बुँदा-१८)।",
        },
      ],
      programStatusEn: "🟡 At risk — 2-month/100-day office standard proof not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — २ महिना/१०० दिने कार्यालय मानक प्रमाण यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p19",
    pointNumber: 19,
    category: "Administrative Reform & Restructuring",
    promise:
      "Prepare up-to-date digital profiles of employees so that appointments, postings, transfers, training, promotion, and retirement can be predictable and automated; the Ministry of Federal Affairs and General Administration shall, within three months, prepare the architecture for a Personnel Management Information System (PMIS).",
    promiseNe:
      "कर्मचारीहरूको अद्यावधिक डिजिटल प्रोफाइल तयार गरी नियुक्ति, पदस्थापना, सरुवा, तालिम, बढुवा तथा अवकाससम्मको व्यवस्था अनुमानयोग्य र स्वचालित बनाउन सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालयले तीन महिनाभित्र कर्मचारी व्यवस्थापन सूचना प्रणाली (Personnel Management Information System- PMIS) को आर्किटेक्चर तयार गर्ने।",
    question:
      "What data model and privacy safeguards will PMIS use, which legacy HR systems will integrate or sunset, and what citizen-visible milestones are set after the architecture is approved?",
    questionNe:
      "PMIS का लागि कुन डेटा मोडेल र गोपनीयता सुरक्षा, कुन पुराना मानव संसाधन प्रणाली जोडिने वा अवकाश, र आर्किटेक्चर स्वीकृत पछि नागरिकले देख्ने कोसेढुङ्गा के?",
    whyThisMatters:
      "Personnel decisions shape every service outcome; opaque HR data perpetuates patronage and unpredictability for staff.",
    whyThisMattersNe:
      "कर्मचारी निर्णयले हरेक सेवाको नतिजा कोर्छ; अपारदर्शी मानव संसाधन डेटाले सिफारिस र अनिश्चितता जोगाउँछ।",
    possiblePathItems: [
      "Published PMIS architecture document with data dictionary",
      "Interoperability standards with provincial HR modules",
      "Consent and audit trail rules for sensitive employee data",
      "Roadmap from architecture to pilot payroll/posting automation",
    ],
    possiblePathItemsNe: [
      "डेटा शब्दकोशसहित सार्वजनिक PMIS आर्किटेक्चर कागज",
      "प्रदेशीय HR मोडुलसँग अन्तरसञ्चालन मानक",
      "संवेदनशील कर्मचारी डेटाका लागि सहमति र अभिलेख नियम",
      "आर्किटेक्चरदेखि पाइलट तलब/सरुवा स्वचालनसम्म रोडम्याप",
    ],
    systemInsight:
      "Architecture in three months is the blueprint moment—without open specs, PMIS risks becoming another silo that staff work around.",
    systemInsightNe:
      "तीन महिनामा आर्किटेक्चर नक्सा क्षण हो — खुला विशेषण बिना PMIS अर्को टापु बन्छ जुन कर्मचारीले वरिपरि काम गर्छन्।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item १९ (PMIS architecture; scan Page 4)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा १९ (PMIS आर्किटेक्चर; स्क्यान पृष्ठ ४)",
    sourceExcerpt:
      "From scan: digital employee profiles; predictable, automated handling of appointment, posting, transfer, training, promotion, retirement; MoFAGA prepares PMIS architecture within three months.",
    sourceExcerptNe:
      "स्क्यान: कर्मचारी डिजिटल प्रोफाइल; नियुक्ति, पदस्थापना, सरुवा, तालिम, बढुवा, अवकास अनुमानयोग्य र स्वचालित; संघीय मामिला मन्त्रालयले तीन महिनामा PMIS आर्किटेक्चर।",
    layer1: {
      hookEmoji: "💾",
      hook: "3 months for PMIS architecture. One HR spine or another silo?",
      hookNe: "३ महिना: PMIS आर्किटेक्चर। एउटै HR मेरुदण्ड वा अर्को टापु?",
      stakeLine: "Payroll and posting need privacy, audit trails, and interoperability — publish the blueprint.",
      stakeLineNe: "तलब र सरुवालाई गोपनीयता, लेखा ट्रेल र अन्तरसञ्चालन चाहिन्छ — नक्सा सार्वजनिक गर्नुहोस्।",
      coreQuestionShort: "Where’s the architecture doc, data model, and integration roadmap?",
      coreQuestionShortNe: "आर्किटेक्चर कागज, डेटा मोडेल र एकीकरण रोडम्याप कहाँ छ?",
      coreQuestion:
        "What data model and privacy safeguards will PMIS use; which legacy systems integrate; what milestones follow architecture approval?",
      coreQuestionNe:
        "PMIS का लागि डेटा मोडेल र गोपनीयता; कुन पुराना प्रणाली जोडिने; आर्किटेक्चर पछि कोसेढुङ्गा के?",
      quickScan: [
        {
          item: "PMIS architecture document published (3-month milestone)",
          itemNe: "PMIS आर्किटेक्चर कागज प्रकाशित (३ महिने कोसेढुङ्गा)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Data dictionary + privacy / consent rules for employee data",
          itemNe: "डेटा शब्दकोश + कर्मचारी डेटाका लागि गोपनीयता/सहमति नियम",
          status: "⚠️ Not verified publicly",
          statusNe: "⚠️ सार्वजनिक प्रमाण छैन",
        },
        {
          item: "Integration or sunset plan for legacy HR systems",
          itemNe: "पुराना HR प्रणाली एकीकरण वा अवकाश योजना",
          status: "❌ Not spelled out",
          statusNe: "❌ खुलाइएको छैन",
        },
        {
          item: "Roadmap from architecture to pilot automation (posting/payroll)",
          itemNe: "आर्किटेक्चरदेखि पाइलट स्वचालन (सरुवा/तलब) सम्म रोडम्याप",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Federal Affairs and General Administration; Department of IT / digital government unit; Ministry of Finance for payroll interfaces; provinces for HR module alignment.",
      primaryOwnersNe:
        "संघीय मामिला तथा सामान्य प्रशासन मन्त्रालय; सूचना प्रविधि विभाग / डिजिटल सरकार एकाइ; तलब इन्टरफेसका लागि अर्थ मन्त्रालय; HR मोडुल मिलानका लागि प्रदेश।",
      coordinatingOfficeEn:
        "Chief information officer / enterprise architect accountable for open specification release.",
      coordinatingOfficeNe: "खुला विशेषण जारीका लागि मुख्य सूचना अधिकृत / उद्यम वास्तुकार जवाफदेह।",
      accountableRolesEn:
        "Data protection officer signs off on fields stored; audit logs for every posting and pay change.",
      accountableRolesNe:
        "डेटा संरक्षण अधिकृतले भण्डारण क्षेत्र स्वीकृत गर्छ; हरेक सरुवा र तलब परिवर्तन अभिलेख।",
      timelineEn: "T+3 months: PMIS architecture; subsequent phases: pilot, scale, decommission legacy.",
      timelineNe: "T+३ महिना: PMIS आर्किटेक्चर; पछिका चरण: पाइलट, विस्तार, पुरानो बन्द।",
      milestones: [
        {
          en: "Public architecture PDF with entity-relationship overview and APIs.",
          ne: "एन्टिटी-सम्बन्ध अवलोकन र API सहित सार्वजनिक आर्किटेक्चर PDF।",
        },
        {
          en: "Security assessment and penetration test summary published.",
          ne: "सुरक्षा मूल्याङ्कन र पेनेट्रेसन परीक्षण सार प्रकाशन।",
        },
        {
          en: "Pilot province live with parallel run vs legacy HR.",
          ne: "पुराना HR सँग समानान्तर चलाउने पाइलट प्रदेश लाइभ।",
        },
      ],
      kpis: [
        {
          metricEn: "Architecture on official URL by month 3 (Y/N)",
          metricNe: "तीन महिनामा आर्किटेक्चर आधिकारिक URL मा (हो/होइन)",
          howEn: "Versioned document; checksum.",
          howNe: "संस्करणयुक्त कागज; जाँच कोड।",
        },
        {
          metricEn: "API coverage: % of HR transactions available via PMIS interfaces (roadmap)",
          metricNe: "API दायरा: PMIS मार्फत उपलब्ध HR कारोबार % (रोडम्याप)",
          howEn: "Quarterly developer changelog.",
          howNe: "त्रैमासिक विकासकर्ता परिवर्तन लग।",
        },
      ],
      risks: [
        {
          en: "Vendor lock-in — proprietary stack without open APIs.",
          ne: "विक्रेता बन्दी — खुला API बिना मालिकाना स्ट्याक।",
        },
        {
          en: "Data breaches — weak access control on sensitive profiles.",
          ne: "डेटा उल्लङ्घन — संवेदनशील प्रोफाइलमा कमजोर पहुँच नियन्त्रण।",
        },
      ],
      escalation: [
        {
          en: "Privacy commissioner review of employee data fields.",
          ne: "कर्मचारी डेटा क्षेत्रमा गोपनीयता आयुक्त समीक्षा।",
        },
        {
          en: "Open-source or standards-based procurement if silo risk high.",
          ne: "टापु जोखिम उच्च भए खुला स्रोत वा मानक आधारित खरिद।",
        },
        {
          en: "Share this point so PMIS stays open (#point-19).",
          ne: "PMIS खुला राख्न साझेदारी गर्नुहोस् (#बुँदा-१९)।",
        },
      ],
      programStatusEn: "🔴 No evidence on file — 3-month PMIS architecture not publicly verified on this tracker.",
      programStatusNe: "🔴 प्रमाण दर्ता छैन — ३ महिने PMIS आर्किटेक्चर यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p20",
    pointNumber: 20,
    category: "Public Service Delivery",
    promise:
      "End the situation where citizens must visit many offices, bear procedural hassle, and face higher time and cost to obtain government services by operating citizen service centers under an agencification modality in major cities, and arrange for those centers to run at least 12 hours per day.",
    promiseNe:
      "नागरिकलाई सरकारी सेवा लिन धेरै कार्यालय धाउनुपर्ने, प्रक्रियागत झन्झट व्यहोर्नुपर्ने तथा समय र लागत दुवै बढ्ने अवस्थाको अन्त्य गर्न प्रमुख शहरहरूमा एजेन्सिफिकेसन मोडालिटीमा नागरिक सेवा केन्द्र सञ्चालन गर्ने। त्यस्ता केन्द्रहरूलाई दैनिक कम्तीमा १२ घण्टा सञ्चालन गर्ने व्यवस्था मिलाउने।",
    question:
      "Which cities launch first, what services are bundled in each center, how are hours and queue data published, and how will agencification reduce total office visits per transaction?",
    questionNe:
      "कुन शहर पहिले, प्रत्येक केन्द्रमा कुन सेवा समेटिन्छ, घण्टा र लाइन डेटा कसरी प्रकाशित हुन्छ, र एजेन्सिफिकेसनले प्रति कारोबार कार्यालय धाउने संख्या कसरी घटाउँछ?",
    whyThisMatters:
      "One-stop models only work when citizens see shorter queues and clearer rules—not just a new signboard.",
    whyThisMattersNe:
      "एक ढोकामा सेवा तब मात्र काम गर्छ जब लाइन छोटो र नियम स्पष्ट देखिन्छ — नयाँ बोर्ड मात्र भए हुँदैन।",
    possiblePathItems: [
      "Published rollout map: cities, services, go-live dates",
      "Standard operating hours and holiday calendar per center",
      "Digital queue tokens and average wait-time reporting",
      "Feedback loop from users on denied or redirected cases",
    ],
    possiblePathItemsNe: [
      "शहर, सेवा र सुरु मितिसहित विस्तार नक्सा प्रकाशन",
      "केन्द्रअनुसार सञ्चालन समय र बिदा तालिका",
      "डिजिटल लाइन टोकन र औसत प्रतीक्षा प्रतिवेदन",
      "अस्वीकृत वा पठाइएका मुद्दाबाट प्रतिक्रिया लूप",
    ],
    systemInsight:
      "Twelve-hour operations signal intent to serve working people—if staffing and supervision do not follow, the extra hours become fiction.",
    systemInsightNe:
      "१२ घण्टे सञ्चालनले कामदार नागरिकलाई लक्ष्य गर्छ — दरबन्दी र निगरानी नआए अतिरिक्त घण्टा कथामै सीमित हुन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item २० (agencification / CSC; scan Pages 4–5)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा २० (एजेन्सिफिकेसन/नागरिक सेवा केन्द्र; स्क्यान ४–५)",
    sourceExcerpt:
      "From scan (ग): agencification in major cities; citizen service centers; minimum 12 hours daily operation.",
    sourceExcerptNe:
      "स्क्यान (ग): प्रमुख शहरमा एजेन्सिफिकेसन; नागरिक सेवा केन्द्र; दैनिक कम्तीमा १२ घण्टा।",
    layer1: {
      hookEmoji: "🏙️",
      hook: "One-stop centers, 12 hours a day — or just new signage?",
      hookNe: "एक ढोकामा सेवा, दिनमा १२ घण्टा — नयाँ बोर्ड मात्र?",
      stakeLine: "Agencification only works if queues shrink and rules are clear — measure visits and waits.",
      stakeLineNe: "एजेन्सिफिकेसन तब मात्र जब लाइन छोटो र नियम स्पष्ट — धाउने र प्रतीक्षा माप्नुहोस्।",
      coreQuestionShort: "Which cities first, which services bundled, where’s the wait-time data?",
      coreQuestionShortNe: "पहिले कुन शहर, कुन सेवा समेटिए, प्रतीक्षा डेटा कहाँ छ?",
      coreQuestion:
        "Which cities launch first; what services are bundled; how are hours and queue data published?",
      coreQuestionNe:
        "कुन शहर पहिले; के के सेवा समेटिन्छ; घण्टा र लाइन डेटा कसरी प्रकाशित हुन्छ?",
      quickScan: [
        {
          item: "Published rollout map: cities, services, go-live dates",
          itemNe: "शहर, सेवा र सुरु मितिसहित विस्तार नक्सा प्रकाशित",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "12-hour staffing roster + supervision plan verified",
          itemNe: "१२ घण्टे दरबन्दी र निगरानी योजना प्रमाणित",
          status: "⚠️ Not verified publicly",
          statusNe: "⚠️ सार्वजनिक प्रमाण छैन",
        },
        {
          item: "Digital queue / average wait time published per center",
          itemNe: "डिजिटल लाइन / केन्द्र प्रति औसत प्रतीक्षा प्रकाशित",
          status: "❌ None available",
          statusNe: "❌ उपलब्ध छैन",
        },
        {
          item: "User feedback on denied or redirected cases",
          itemNe: "अस्वीकृत वा पठाइएका मुद्दामा प्रयोगकर्ता प्रतिक्रिया",
          status: "❌ Not in place",
          statusNe: "❌ अझै छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of the Prime Minister and Council of Ministers for agencification policy; Ministry of Federal Affairs and General Administration; concerned line ministries for bundled services; metropolitan/municipal governments for premises.",
      primaryOwnersNe:
        "एजेन्सिफिकेसन नीतिका लागि प्रधानमन्त्री कार्यालय; संघीय मामिला मन्त्रालय; समेटिएका सेवाका सम्बन्धित मन्त्रालय; भवनका लागि महानगर/पालिका।",
      coordinatingOfficeEn:
        "Program management office for CSC rollout with weekly public throughput statistics.",
      coordinatingOfficeNe: "हप्तामा सार्वजनिक थ्रुपुट तथ्याङ्कसहित CSC विस्तारका लागि कार्यक्रम व्यवस्थापन कार्यालय।",
      accountableRolesEn:
        "Center managers report actual hours open; mystery visits verify service bundling claims.",
      accountableRolesNe:
        "केन्द्र प्रमुखले वास्तविक खुला घण्टा प्रतिवेदन; सेवा समेट्ने दाबी गोप्य निरीक्षणले जाँच।",
      timelineEn: "Phased city rollout; 12-hour operations once staffing and security baselines met.",
      timelineNe: "चरणबद्ध शहर विस्तार; दरबन्दी र सुरक्षा आधार पूरा भएपछि १२ घण्टे सञ्चालन।",
      milestones: [
        {
          en: "Signed service-level agreements per bundled transaction type.",
          ne: "समेटिएको कारोबार प्रकार प्रति सेवा स्तर सम्झौता हस्ताक्षर।",
        },
        {
          en: "Publish baseline vs post-launch visits per citizen transaction.",
          ne: "आधार र सुरुवातपछि प्रति नागरिक कारोबार धाउने संख्या प्रकाशन।",
        },
        {
          en: "Annual citizen satisfaction survey with independent sampling.",
          ne: "स्वतन्त्र नमूनासहित वार्षिक नागरिक सन्तुष्टि सर्वेक्षण।",
        },
      ],
      kpis: [
        {
          metricEn: "Median wait minutes at top 3 centers (weekly)",
          metricNe: "शीर्ष ३ केन्द्रमा मध्यक प्रतीक्षा मिनेट (हप्तामा)",
          howEn: "Digital queue data or manual sample.",
          howNe: "डिजिटल लाइन डेटा वा मानव नमूना।",
        },
        {
          metricEn: "Office visits per completed service vs pre-agencification baseline",
          metricNe: "पूर्ण सेवा प्रति कार्यालय धाउने संख्या बनाम एजेन्सिफिकेसन अघिको आधार",
          howEn: "Before/after survey; administrative counts.",
          howNe: "अघि/पछि सर्वेक्षण; प्रशासन गणना।",
        },
      ],
      risks: [
        {
          en: "Understaffed counters — 12 hours on paper only.",
          ne: "कर्मचारी अपुग — कागजमा मात्र १२ घण्टा।",
        },
        {
          en: "Bundled services blocked by legacy IT — citizens still bounce.",
          ne: "पुरानो IT ले सेवा रोक्छ — नागरिक अझै धाउँछ।",
        },
      ],
      escalation: [
        {
          en: "Mayors publish weekly CSC performance boards.",
          ne: "मेयरले हप्तामा CSC प्रदर्शन बोर्ड प्रकाशन।",
        },
        {
          en: "Media mystery visits with published findings.",
          ne: "निष्कर्ष प्रकाशित गोप्य सञ्चार भ्रमण।",
        },
        {
          en: "Share this point so CSC hours stay real (#point-20).",
          ne: "CSC घण्टा वास्तविक राख्न साझेदारी गर्नुहोस् (#बुँदा-२०)।",
        },
      ],
      programStatusEn: "🟡 At risk — agencification rollout and 12-hour proof not publicly verified here.",
      programStatusNe: "🟡 जोखिममा — एजेन्सिफिकेसन विस्तार र १२ घण्टे प्रमाण यहाँ प्रमाणित छैन।",
    },
  },
  {
    id: "p21",
    pointNumber: 21,
    category: "Public Service Delivery",
    promise:
      "Provide fast, easy, broker-free services by running citizenship, passport, national ID, and all services delivered by the Chief District Office through digital and integrated systems; immediately enable citizenship copies and passport services from any CDO office; implement digital recommendation from the ward level; use the national ID as the mandatory single identifier; and make all service processes faceless, time-bound, and trackable.",
    promiseNe:
      "नागरिकलाई छिटो, सहज र बिचौलिया मुक्त सेवा उपलब्ध गराउन नागरिकता, राहदानी, राष्ट्रिय परिचयपत्र तथा जिल्ला प्रशासन कार्यालयबाट प्रदान हुने सम्पूर्ण सेवाहरूलाई डिजिटल तथा एकीकृत प्रणालीमार्फत सञ्चालन गर्ने, नागरिकताको प्रतिलिपि तथा राहदानी सेवा जुनसुकै जिल्ला प्रशासन कार्यालयबाट प्राप्त गर्न सकिने व्यवस्था तत्काल लागू गर्ने, वडास्तरबाट डिजिटल सिफारिस प्रणाली लागू गर्ने, राष्ट्रिय परिचयपत्रलाई अनिवार्य एकल परिचय प्रणालीका रूपमा प्रयोग गर्ने तथा सबै सेवा प्रक्रियालाई फेसलेस, टाइम-बाउण्ड र ट्रयाकिङ योग्य बनाउने।",
    question:
      "What integration timeline links NID, citizenship, and passport databases, how is “broker-free” enforced, and where can citizens track each application’s status in one place?",
    questionNe:
      "NID, नागरिकता र राहदानी डेटाबेस कहिले जोडिन्छ, «बिचौलिया मुक्त» कसरी लागू हुन्छ, र नागरिकले एउटै ठाउँबाट आवेदन स्थिति कहाँ ट्र्याक गर्छ?",
    whyThisMatters:
      "Fragmented ID and document systems are where delays and informal fees thrive; integration is the technical core of fair access.",
    whyThisMattersNe:
      "टुटेको परिचय र कागजात प्रणालीमा ढिलाइ र अनौपचारिक शुल्क बढ्छ; एकीकरण नै निष्पक्ष पहुँचको प्राविधिक केन्द्र हो।",
    possiblePathItems: [
      "Single citizen portal with unified tracking IDs",
      "Published APIs and data-sharing agreements across agencies",
      "Anti-broker hotline tied to licensing and notary oversight",
      "Ward digital recommendation pilot metrics and appeals",
    ],
    possiblePathItemsNe: [
      "एकीकृत ट्र्याकिङ ID सहित एकल नागरिक पोर्टल",
      "निकायबीच सार्वजनिक API र डेटा साझेदारी सम्झौता",
      "दर्ता र नोटरी निगरानीसँग जोडिएको बिचौलिया विरोधी हटलाइन",
      "वडा डिजिटल सिफारिस पाइलट मेट्रिक र पुनरावेदन",
    ],
    systemInsight:
      "Faceless, time-bound, trackable is a full stack promise—front office, back office, and audit trail must move together.",
    systemInsightNe:
      "फेसलेस, समयबद्ध, ट्र्याक योग्य पूर्ण प्रणालीको वाचा हो — अगाडि, पछाडि र अभिलेख एकसाथ चल्नुपर्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item २१ (integrated digital DAO services; scan Page 5)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा २१ (एकीकृत डिजिटल प्रशासन सेवा; स्क्यान पृष्ठ ५)",
    sourceExcerpt:
      "From scan (Page 5): digital integrated citizenship, passport, NID, all CDO services; any district office for copy/passport; ward digital recommendation; NID as mandatory single ID; faceless, time-bound, trackable.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ५: डिजिटल एकीकृत नागरिकता, राहदानी, रा.प., सबै जिल्ला प्रशासन सेवा; जुनसुकै प्रशासनबाट प्रतिलिपि/राहदानी; वडा डिजिटल सिफारिस; अनिवार्य एकल परिचय; फेसलेस, टाइम-बाउण्ड, ट्रयाकिङ योग्य।",
    layer1: {
      hookEmoji: "🪪",
      hook: "One ID, any district, track every step — or still many doors?",
      hookNe: "एक परिचय, जुनसुकै जिल्ला, हरेक चरण ट्र्याक — अझै धेरै ढोका?",
      stakeLine: "Integration needs APIs, anti-broker enforcement, and one portal citizens trust.",
      stakeLineNe: "एकीकरणका लागि API, बिचौलिया विरोध र नागरिकले विश्वास गर्ने एउटै पोर्टल चाहिन्छ।",
      coreQuestionShort: "Where’s the unified tracking ID and the broker crackdown — in public?",
      coreQuestionShortNe: "एकीकृत ट्र्याकिङ ID र बिचौलिया कारबाही — सार्वजनिक कहाँ छ?",
      coreQuestion:
        "What timeline links NID, citizenship, and passport data; how is broker-free enforced; where is single status tracking?",
      coreQuestionNe:
        "NID, नागरिकता र राहदानी डेटा कहिले जोडिन्छ; बिचौलिया मुक्त कसरी लागू; एकै स्थिति ट्र्याक कहाँ छ?",
      quickScan: [
        {
          item: "Single citizen portal + unified application tracking ID",
          itemNe: "एकीकृत नागरिक पोर्टल र आवेदन ट्र्याकिङ ID",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Published integration milestones (NID ↔ citizenship ↔ passport)",
          itemNe: "एकीकरण कोसेढुङ्गा प्रकाशित (रा.प. ↔ नागरिकता ↔ राहदानी)",
          status: "⚠️ Not verified publicly",
          statusNe: "⚠️ सार्वजनिक प्रमाण छैन",
        },
        {
          item: "Enforcement stats: broker cases filed / sanctioned",
          itemNe: "कारबाही तथ्याङ्क: बिचौलिया मुद्दा दर्ता/सजाय",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
        {
          item: "Ward digital recommendation pilot metrics + appeals",
          itemNe: "वडा डिजिटल सिफारिस पाइलट मेट्रिक र पुनरावेदन",
          status: "❌ Not in place",
          statusNe: "❌ अझै छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Department of National ID and Civil Registration; Department of Passport; Ministry of Home Affairs / Chief District Officers; Ministry of Federal Affairs and General Administration for digital backbone.",
      primaryOwnersNe:
        "राष्ट्रिय परिचयपत्र तथा नागरिक दर्ता विभाग; राहदानी विभाग; गृह मन्त्रालय / जिल्ला प्रशासन कार्यालय; डिजिटल मेरुदण्डका लागि संघीय मामिला मन्त्रालय।",
      coordinatingOfficeEn:
        "National digital architecture committee with published API catalogue and SLA between agencies.",
      coordinatingOfficeNe: "निकायबीच SLA र प्रकाशित API सूचीसहित राष्ट्रिय डिजिटल वास्तु समिति।",
      accountableRolesEn:
        "Agency heads sign data-sharing agreements; DPO reviews lawful basis for each field.",
      accountableRolesNe:
        "निकाय प्रमुखले डेटा साझेदारी सम्झौता हस्ताक्षर; प्रत्येक क्षेत्रका लागि कानूनी आधार डीपीओ समीक्षा।",
      timelineEn: "Immediate: any-district passport/citizenship copy where tech allows; phased full integration per published roadmap.",
      timelineNe: "तत्काल: प्राविधिक मिले जुनसुकै जिल्लाबाट राहदानी/नागरिकता प्रतिलिपि; पूर्ण एकीकरण चरणबद्ध रोडम्यापअनुसार।",
      milestones: [
        {
          en: "Publish integration roadmap with dependency graph between systems.",
          ne: "प्रणालीबीच निर्भरता ग्राफसहित एकीकरण रोडम्याप प्रकाशन।",
        },
        {
          en: "Go-live unified tracking for at least one high-volume service.",
          ne: "कम्तीमा एउटा उच्च मात्राका सेवामा एकीकृत ट्र्याकिङ गो-लाइभ।",
        },
        {
          en: "Anti-broker task force quarterly report with case counts.",
          ne: "मुद्दा संख्यासहित त्रैमासिक बिचौलिया विरोध कार्यदल प्रतिवेदन।",
        },
      ],
      kpis: [
        {
          metricEn: "Share of applications trackable end-to-end in one portal (%)",
          metricNe: "एकै पोर्टलमा अन्त्यसम्म ट्र्याक हुने आवेदन (%)",
          howEn: "Sample 500 cases across districts.",
          howNe: "जिल्लाभर ५०० नमूना मुद्दा।",
        },
        {
          metricEn: "Median days citizenship/passport/NID (published SLAs)",
          metricNe: "नागरिकता/राहदानी/रा.प. मध्यक दिन (प्रकाशित SLA)",
          howEn: "Monthly dashboard.",
          howNe: "मासिक ड्यासबोर्ड।",
        },
      ],
      risks: [
        {
          en: "Database mismatches — wrong person records after merge.",
          ne: "डेटाबेस बेमेल — मर्जपछि गलत व्यक्ति अभिलेख।",
        },
        {
          en: "Broker networks shift online — harder to police.",
          ne: "बिचौलिया सञ्जाल अनलाइन — प्रहरी गर्न गाह्रो।",
        },
      ],
      escalation: [
        {
          en: "Right-to-information requests on integration delays.",
          ne: "एकीकरण ढिलाइमा सूचनाको हक माग।",
        },
        {
          en: "Embassy and diaspora pressure for passport turnaround transparency.",
          ne: "राहदानी समय पारदर्शिताका लागि दूतावास र प्रवासी दबाब।",
        },
        {
          en: "Share this point so integration stays visible (#point-21).",
          ne: "एकीकरण दृश्य राख्न साझेदारी गर्नुहोस् (#बुँदा-२१)।",
        },
      ],
      programStatusEn: "🔴 No evidence on file — unified digital DAO integration not publicly verified on this tracker.",
      programStatusNe: "🔴 प्रमाण दर्ता छैन — एकीकृत डिजिटल प्रशासन जोड यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p22",
    pointNumber: 22,
    category: "Public Service Delivery",
    promise:
      "Train all front-desk staff on every service the office delivers: within 15 days, all offices shall submit to the Ministry of Federal Affairs and General Administration lists of such staff and training needs; the ministry shall coordinate with training providers and arrange required training within six months, and continue the process thereafter.",
    promiseNe:
      "फ्रन्ट डेस्कमा काम गर्ने सबै कर्मचारीहरूलाई कार्यालयबाट उपलब्ध हुने सबै सेवाहरूको तालिम प्रदान गर्न त्यस्ता कर्मचारीहरू सूची र तालिमको आवश्यकता सबै कार्यालयहरूले १५ दिनभित्र सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालयमा उपलब्ध गराउने। मन्त्रालयले सम्बन्धित तालिम प्रदायक संस्थाहरूसँग समन्वय गरी ६ महिनाभित्र आवश्यक तालिमको व्यवस्था गर्ने। तत्पश्चात पनि सो प्रक्रियालाई निरन्तर सञ्चालन गर्ने।",
    question:
      "What curriculum and competency test certify a front-desk officer, how is refresher training scheduled, and what public score exists for first-contact resolution rates?",
    questionNe:
      "फ्रन्ट डेस्क अधिकृत प्रमाणित गर्न पाठ्यक्रम र क्षमता परीक्षा के, ताजगी तालिम कसरी तालिका हुन्छ, र पहिलो सम्पर्क निराकरण दरको सार्वजनिक अङ्क के छ?",
    whyThisMatters:
      "Citizens meet the state at the front desk; untrained staff multiply rejections and return trips.",
    whyThisMattersNe:
      "नागरिकले राज्य फ्रन्ट डेस्कमै भेट्छ; नतालिम कर्मचारीले अस्वीकृति र दोहोरो यात्रा बढाउँछ।",
    possiblePathItems: [
      "National training catalog mapped to each service type",
      "Published completion rates by office and cadre",
      "Mystery visits focused on front-desk accuracy",
      "Certification badge or roster visible to the public",
    ],
    possiblePathItemsNe: [
      "सेवा प्रकारअनुसार राष्ट्रिय तालिम सूची",
      "कार्यालय र दर्जअनुसार पूरा दर प्रकाशन",
      "फ्रन्ट डेस्क शुद्धतामा केन्द्रित गोप्य भ्रमण",
      "नागरिकले देख्ने प्रमाणपत्र वा नामावली",
    ],
    systemInsight:
      "Fifteen days for rosters forces honesty about staffing gaps; six months for training is the real delivery test.",
    systemInsightNe:
      "१५ दिने नामावलीले दरबन्दी अन्तर ईमानदार बनाउँछ; छ महिने तालिम वास्तविक वितरण जाँच हो।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item २२ (front-desk training; scan Page 5)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा २२ (फ्रन्ट डेस्क तालिम; स्क्यान पृष्ठ ५)",
    sourceExcerpt:
      "From scan (Page 5): front-desk staff lists and training needs to MoFAGA in 15 days; ministry coordinates providers; training within 6 months; process continues thereafter.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ५: फ्रन्ट डेस्क सूची र तालिम आवश्यकता १५ दिनमा संघीय मामिला मन्त्रालयमा; मन्त्रालयले तालिम प्रदायकसँग समन्वय; ६ महिनाभित्र तालिम; पछि पनि निरन्तर।",
    layer1: {
      hookEmoji: "🎓",
      hook: "15 days for rosters, 6 months for training — who’s certified to serve?",
      hookNe: "१५ दिन: नामावली, ६ महिना: तालिम — सेवाका लागि को प्रमाणित?",
      stakeLine: "Untrained front desks multiply rejections; citizens need competency proof, not promises.",
      stakeLineNe: "नतालिम फ्रन्ट डेस्कले अस्वीकृति बढाउँछ; नागरिकलाई प्रतिज्ञा होइन क्षमता प्रमाण चाहिन्छ।",
      coreQuestionShort: "Where’s the curriculum, the test, and first-contact resolution rates?",
      coreQuestionShortNe: "पाठ्यक्रम, परीक्षा र पहिलो सम्पर्क निराकरण दर कहाँ छ?",
      coreQuestion:
        "What curriculum and competency test certify officers; how is refresher training scheduled; what public first-contact resolution score exists?",
      coreQuestionNe:
        "अधिकृत प्रमाणित गर्न पाठ्यक्रम र परीक्षा के; ताजगी तालिम कसरी; पहिलो सम्पर्क निराकरण सार्वजनिक अङ्क के छ?",
      quickScan: [
        {
          item: "Front-desk staff lists + training needs submitted (15-day milestone)",
          itemNe: "फ्रन्ट डेस्क सूची र तालिम आवश्यकता पेश (१५ दिने कोसेढुङ्गा)",
          status: "⚠️ Needs public proof",
          statusNe: "⚠️ सार्वजनिक प्रमाण चाहिन्छ",
        },
        {
          item: "National training catalog mapped to each service type",
          itemNe: "सेवा प्रकारअनुसार राष्ट्रिय तालिम सूची",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Training completion rates published by office and cadre",
          itemNe: "कार्यालय र दर्जाअनुसार तालिम पूरा दर प्रकाशित",
          status: "❌ Not available",
          statusNe: "❌ उपलब्ध छैन",
        },
        {
          item: "Certification roster or badge visible to citizens",
          itemNe: "नागरिकले देख्ने प्रमाणपत्र वा बैज नामावली",
          status: "❌ Not in place",
          statusNe: "❌ अझै छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Federal Affairs and General Administration; training providers (PSC, staff college, vendors); line ministries for sector content; heads of offices for roster accuracy.",
      primaryOwnersNe:
        "संघीय मामिला तथा सामान्य प्रशासन मन्त्रालय; तालिम प्रदायक (लोक सेवा, कर्मचारी कलेज, विक्रेता); क्षेत्रगत सामग्रीका लागि मन्त्रालय; नामावली शुद्धताका लागि कार्यालय प्रमुख।",
      coordinatingOfficeEn:
        "MoFAGA training coordination cell with published schedule and completion dashboard.",
      coordinatingOfficeNe: "प्रकाशित तालिका र पूरा ड्यासबोर्डसहित संघीय मामिला तालिम समन्वय एकाइ।",
      accountableRolesEn:
        "Trainers issue competency certificates; offices barred from deploying uncertified staff to listed services.",
      accountableRolesNe:
        "तालिमकर्ताले क्षमता प्रमाणपत्र जारी गर्छ; सूचीकृत सेवामा प्रमाणित नभएका कर्मचारी तैनाथ रोक।",
      timelineEn: "T+15 days: rosters to MoFAGA; T+6 months: training arranged; ongoing refresher cycles.",
      timelineNe: "T+१५ दिन: संघीय मामिलामा नामावली; T+६ महिना: तालिम; निरन्तर ताजगी चक्र।",
      milestones: [
        {
          en: "Publish aggregated roster gap analysis (shortfall by service).",
          ne: "सेवाअनुसार अभाव विश्लेषण सहित समेकित नामावली खाडल प्रतिवेदन।",
        },
        {
          en: "Issue competency exam syllabus and pass criteria per role.",
          ne: "भूमिकाअनुसित पाठ्यक्रम र उत्तीर्ण मापदण्ड जारी।",
        },
        {
          en: "Publish first cohort completion and post-training error rates.",
          ne: "पहिलो समूह पूरा र तालिमपछि त्रुटि दर प्रकाशन।",
        },
      ],
      kpis: [
        {
          metricEn: "% of front-desk staff trained vs roster by month 6",
          metricNe: "छ महिनामा नामावली बमोजिम तालिम पाएका फ्रन्ट डेस्क %",
          howEn: "HR system match; spot tests.",
          howNe: "HR प्रणाली मिलान; नमूना परीक्षा।",
        },
        {
          metricEn: "First-contact resolution rate for top 5 services (baseline vs post-training)",
          metricNe: "शीर्ष ५ सेवामा पहिलो सम्पर्क निराकरण दर (आधार बनाम तालिमपछि)",
          howEn: "Call logs + citizen survey.",
          howNe: "कल लग र नागरिक सर्वेक्षण।",
        },
      ],
      risks: [
        {
          en: "Tick-box training — no behaviour change at the window.",
          ne: "फारम मात्र तालिम — झ्यालमा व्यवहार परिवर्तन छैन।",
        },
        {
          en: "Provider capacity — six-month deadline slips nationwide.",
          ne: "प्रदायक क्षमता — छ महिने म्याद राष्ट्रव्यापी चुक्छ।",
        },
      ],
      escalation: [
        {
          en: "Citizens refuse to leave counter until trained officer serves.",
          ne: "प्रमाणित अधिकृत नआएसम्म नागरिक काउन्टर छोड्दैनन् भन्ने अभियान।",
        },
        {
          en: "Media spot-tests on front-desk accuracy after rollout.",
          ne: "विस्तारपछि फ्रन्ट डेस्क शुद्धिमा सञ्चार नमूना जाँच।",
        },
        {
          en: "Share this point so training deadlines stay real (#point-22).",
          ne: "तालिम म्याद वास्तविक राख्न साझेदारी गर्नुहोस् (#बुँदा-२२)।",
        },
      ],
      programStatusEn: "🟡 At risk — 15-day roster and 6-month training proof not publicly verified here.",
      programStatusNe: "🟡 जोखिममा — १५ दिने नामावली र ६ महिने तालिम प्रमाण यहाँ प्रमाणित छैन।",
    },
  },
  {
    id: "p23",
    pointNumber: 23,
    category: "Public Service Delivery",
    promise:
      "To make every public service process digital, trackable, and transparent, each office shall within one month conduct a time-and-motion study and prepare a restructuring plan for the office (Restructuring Plan).",
    promiseNe:
      "सम्पूर्ण सार्वजनिक सेवाका प्रक्रियालाई डिजिटल, ट्रयाकिङयोग्य र पारदर्शी बनाउन प्रत्येक कार्यालयले एक महिनाभित्र समय र गति (Time and Motion) को अध्ययन गरी कार्यालयको पुनर्संरचना योजना (Restructuring Plan) तयार गर्ने।",
    question:
      "Will each plan be published, who validates time-and-motion findings, and what budget follows approved restructuring?",
    questionNe:
      "प्रत्येक योजना सार्वजनिक हुन्छ कि हुँदैन, समय-गति निष्कर्ष कसले प्रमाणित गर्छ, र स्वीकृत पुनर्संरचनापछि बजेट के आउँछ?",
    whyThisMatters:
      "Without public plans, “restructuring” becomes a label for unchanged queues.",
    whyThisMattersNe:
      "योजना सार्वजनिक नभए «पुनर्संरचना» लाइन नबदलीको ट्याग मात्र बन्छ।",
    possiblePathItems: [
      "Template for time-and-motion and restructuring plan",
      "Central repository of approved plans with milestones",
      "Citizen-readable summary of before/after steps per service",
      "Follow-up audit at 90 days on promised cuts",
    ],
    possiblePathItemsNe: [
      "समय-गति र पुनर्संरचना योजनाको ढाँचा",
      "कोसेढुङ्गासहित स्वीकृत योजनाको केन्द्रीय भण्डारण",
      "प्रति सेवा अघि/पछि चरणको नागरिकमुखी सार",
      "वाचा घटाउन ९० दिने पछिको लेखापरीक्षा",
    ],
    systemInsight:
      "One month per office is feasible only if a common methodology is issued on day one—otherwise each desk reinvents the wheel.",
    systemInsightNe:
      "एक महिना प्रति कार्यालय तब मात्र सम्भव जब पहिलो दिनै साझा विधि आउँछ — नभए हरेक डेस्क पाङ्ग्रा पुनः बनाउँछ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item २३ (time & motion / restructuring plan; scan Page 5)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा २३ (समय-गति/पुनर्संरचना योजना; स्क्यान पृष्ठ ५)",
    sourceExcerpt:
      "From scan (Page 5): within one month, time-and-motion study and restructuring plan (Restructuring Plan) for digital, trackable, transparent services.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ५: एक महिनाभित्र समय-गति अध्ययन र कार्यालयको पुनर्संरचना योजना (Restructuring Plan)।",
    layer1: {
      hookEmoji: "⏱️",
      hook: "Time-and-motion in one month — then a real restructuring plan.",
      hookNe: "एक महिना: समय-गति — अनि साँचो पुनर्संरचना योजना।",
      stakeLine: "Without published plans, “restructuring” is just a label for the same queues.",
      stakeLineNe: "योजना सार्वजनिक नभए «पुनर्संरचना» उही लाइनका लागि ट्याग मात्र।",
      coreQuestionShort: "Will each plan be public — and who validates the findings?",
      coreQuestionShortNe: "प्रत्येक योजना सार्वजनिक हुन्छ — निष्कर्ष कसले प्रमाणित गर्छ?",
      coreQuestion:
        "Will each restructuring plan be published; who validates time-and-motion; what budget follows approval?",
      coreQuestionNe:
        "प्रत्येक पुनर्संरचना योजना सार्वजनिक हुन्छ; समय-गति कसले प्रमाणित; स्वीकृतपछि बजेट के?",
      quickScan: [
        {
          item: "Common methodology / template issued for all offices (day 1)",
          itemNe: "सबै कार्यालयका लागि साझा विधि/ढाँचा (पहिलो दिन)",
          status: "❌ Not announced",
          statusNe: "❌ घोषणा छैन",
        },
        {
          item: "Restructuring plans submitted + published per office (1-month milestone)",
          itemNe: "पुनर्संरचना योजना पेश र प्रति कार्यालय प्रकाशित (१ महिने कोसेढुङ्गा)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Independent validation or peer review of time-and-motion findings",
          itemNe: "समय-गति निष्कर्ष स्वतन्त्र वा साथी समीक्षा",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Budget allocation tied to approved restructuring milestones",
          itemNe: "स्वीकृत पुनर्संरचना कोसेढुङ्गासँग जोडिएको बजेट विनियोजन",
          status: "❌ Not disclosed",
          statusNe: "❌ खुलाइएको छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Each office head; Ministry of Federal Affairs and General Administration for template and repository; Ministry of Finance for approved restructuring budgets.",
      primaryOwnersNe:
        "प्रत्येक कार्यालय प्रमुख; ढाँचा र भण्डारका लागि संघीय मामिला मन्त्रालय; स्वीकृत पुनर्संरचना बजेटका लागि अर्थ मन्त्रालय।",
      coordinatingOfficeEn:
        "Central Restructuring Plan repository with search by ministry/office and status.",
      coordinatingOfficeNe: "मन्त्रालय/कार्यालय र स्थितिअनुसार खोज्न मिल्ने केन्द्रीय पुनर्संरचना योजना भण्डार।",
      accountableRolesEn:
        "Third-line audit or MoFAGA quality review signs off before plans go live.",
      accountableRolesNe:
        "योजना लाइभ अघि तेस्रो रेखा लेखापरीक्षा वा संघीय मामिला गुणस्तर समीक्षा स्वीकृति।",
      timelineEn: "T+1 month: time-and-motion study + Restructuring Plan per office; follow-on: funding and implementation waves.",
      timelineNe: "T+१ महिना: प्रति कार्यालय समय-गति र पुनर्संरचना योजना; पछि: बजेट र कार्यान्वयन चरण।",
      milestones: [
        {
          en: "Publish template: steps, roles, evidence annex for each plan.",
          ne: "प्रत्येक योजनाका लागि चरण, भूमिका र प्रमाण अनुसूचीसहित ढाँचा प्रकाशन।",
        },
        {
          en: "Upload all plans to central repository with version dates.",
          ne: "संस्करण मितिसहित सबै योजना केन्द्रीय भण्डारमा अपलोड।",
        },
        {
          en: "90-day audit on promised step reductions per service.",
          ne: "प्रति सेवा वाचा घटाएका चरणमा ९० दिने लेखापरीक्षा।",
        },
      ],
      kpis: [
        {
          metricEn: "Plans published / total offices in scope (%)",
          metricNe: "प्रकाशित योजना / दायराका कार्यालय कुल (%)",
          howEn: "Repository count monthly.",
          howNe: "मासिक भण्डार गणना।",
        },
        {
          metricEn: "Average process steps before vs after (sample of services)",
          metricNe: "अघि/पछि औसत प्रक्रिया चरण (सेवा नमूना)",
          howEn: "Independent verification of claims.",
          howNe: "दाबीको स्वतन्त्र प्रमाणीकरण।",
        },
      ],
      risks: [
        {
          en: "Each office reinvents methodology — incomparable plans.",
          ne: "प्रत्येक कार्यालयले विधि पुनः बनाउँछ — तुलना हुँदैन।",
        },
        {
          en: "Plans shelf — no budget or IT to execute.",
          ne: "योजना ताकमा — कार्यान्वयन बजेट वा IT छैन।",
        },
      ],
      escalation: [
        {
          en: "Citizen compare offices with same service — name and shame delays.",
          ne: "उही सेवामा कार्यालय तुलना — ढिलाइ नाम लिई उजागर।",
        },
        {
          en: "Legislative committee samples random plans for realism.",
          ne: "वास्तविकताका लागि संसदीय समितिले यादृच्छिक योजना नमूना।",
        },
        {
          en: "Share this point so plans stay public (#point-23).",
          ne: "योजना सार्वजनिक राख्न साझेदारी गर्नुहोस् (#बुँदा-२३)।",
        },
      ],
      programStatusEn: "🔴 No evidence on file — time-and-motion restructuring plans not publicly verified here.",
      programStatusNe: "🔴 प्रमाण दर्ता छैन — समय-गति पुनर्संरचना योजना यहाँ प्रमाणित छैन।",
    },
  },
  {
    id: "p24",
    pointNumber: 24,
    category: "Public Service Delivery",
    promise:
      "Operate a 24-hour national citizen assistance and grievance management system that addresses complaints, suggestions, and service requests quickly, effectively, and in a results-oriented way; arrange multi-channel registration including phone, mobile app, portal, and social media.",
    promiseNe:
      "देशभरका नागरिकका गुनासो, सुझाव तथा सेवा अनुरोधलाई छिटो, प्रभावकारी तथा परिणाममुखी रूपमा सम्बोधन गर्न २४ घण्टे राष्ट्रिय नागरिक सहायता तथा गुनासो व्यवस्थापन प्रणाली सञ्चालन गर्ने। सो को लागि फोन, मोबाइल एप, पोर्टल तथा सामाजिक सञ्जालमार्फत गुनासो दर्ता गर्न सकिने बहु-च्यानलको व्यवस्था मिलाउने।",
    question:
      "What SLAs apply per channel, how are cases escalated across tiers, and what public statistics show resolution time and repeat complaints?",
    questionNe:
      "प्रति च्यानल कुन SLA, तह उचालन कसरी हुन्छ, र निराकरण समय र दोहोरो गुनासो देखाउने सार्वजनिक तथ्य के छ?",
    whyThisMatters:
      "A 24/7 line that nobody answers erodes trust faster than no line at all.",
    whyThisMattersNe:
      "२४/७ लाइन उठ्दैन भने नलाइनभन्दा छिटो विश्वास गुम्छ।",
    possiblePathItems: [
      "Published SLA matrix and escalation tree",
      "Real-time public dashboard: open/closed cases by ministry",
      "Quality monitoring of call/chat transcripts (privacy-safe)",
      "Integration with local grievance systems where relevant",
    ],
    possiblePathItemsNe: [
      "सार्वजनिक SLA म्याट्रिक्स र उचालन रूख",
      "मन्त्रालयअनुसार खुला/बन्द मुद्दाको रियल-टाइम ड्यासबोर्ड",
      "कल/च्याट गुणस्तर निगरानी (गोपनीयता सुरक्षित)",
      "सान्दर्भिक ठाउँमा स्थानीय गुनासो प्रणालीसँग जोड",
    ],
    systemInsight:
      "Multi-channel intake multiplies expectations—only unified case IDs prevent citizens from re-telling their story on every platform.",
    systemInsightNe:
      "बहु-च्यानलले अपेक्षा बढाउँछ — एकीकृत मुद्दा ID बिना नागरिक हरेक मञ्चमा कथा दोहोर्याउँछन्।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item २४ (24h grievance system; scan Page 5)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा २४ (२४ घण्टे गुनासो प्रणाली; स्क्यान पृष्ठ ५)",
    sourceExcerpt:
      "From scan (Page 5): 24-hour national citizen assistance and grievance system; multi-channel registration—phone, mobile app, portal, social media.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ५: २४ घण्टे राष्ट्रिय नागरिक सहायता तथा गुनासो व्यवस्थापन; फोन, मोबाइल एप, पोर्टल, सामाजिक सञ्जालबाट दर्ता।",
    layer1: {
      hookEmoji: "☎️",
      hook: "24/7 grievance — multi-channel. If nobody answers, trust dies faster.",
      hookNe: "२४/७ गुनासो — बहुच्यानल। उठ्दैन भने विश्वास छिटो मर्छ।",
      stakeLine: "Unified case IDs and SLAs matter — or citizens repeat the same story on every app.",
      stakeLineNe: "एकीकृत मुद्दा ID र SLA मायने राख्छ — नभए हरेक एपमा उही कथा।",
      coreQuestionShort: "Where’s the SLA matrix, escalation tree, and resolution-time stats?",
      coreQuestionShortNe: "SLA म्याट्रिक्स, उचालन रूख र निराकरण समय तथ्य कहाँ छ?",
      coreQuestion:
        "What SLAs apply per channel; how are cases escalated; what public stats show resolution time and repeats?",
      coreQuestionNe:
        "प्रति च्यानल कुन SLA, तह उचालन कसरी, निराकरण समय र दोहोरो गुनासो सार्वजनिक तथ्य के छ?",
      quickScan: [
        {
          item: "Published SLA matrix + escalation tree (all channels)",
          itemNe: "सबै च्यानलका लागि SLA म्याट्रिक्स र उचालन रूख प्रकाशित",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Real-time dashboard: open/closed cases by ministry",
          itemNe: "रियल-टाइम ड्यासबोर्ड: मन्त्रालयअनुसार खुला/बन्द मुद्दा",
          status: "❌ Not available",
          statusNe: "❌ उपलब्ध छैन",
        },
        {
          item: "Unified case ID across phone, app, portal, social",
          itemNe: "फोन, एप, पोर्टल, सामाजिक सञ्जालमा एकीकृत मुद्दा ID",
          status: "⚠️ Not verified publicly",
          statusNe: "⚠️ सार्वजनिक प्रमाण छैन",
        },
        {
          item: "Median resolution hours + repeat-complaint rate published",
          itemNe: "मध्यक निराकरण घण्टा + दोहोरो गुनासो दर प्रकाशित",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of the Prime Minister and Council of Ministers (often grievance lead); Ministry of Federal Affairs and General Administration for operations; line ministries for resolution; telecom/IT for hotline uptime.",
      primaryOwnersNe:
        "प्रधानमन्त्री कार्यालय (प्रायः गुनासो नेतृत्व); सञ्चालनका लागि संघीय मामिला मन्त्रालय; निराकरणका लागि मन्त्रालय; हटलाइन अपटाइमका लागि दूरसञ्चार/IT।",
      coordinatingOfficeEn:
        "National contact centre with 24/7 roster, SLA monitoring, and integration to ministry CRMs.",
      coordinatingOfficeNe: "२४/७ दरबन्दी, SLA निगरानी र मन्त्रालय CRM जोडसहित राष्ट्रिय सम्पर्क केन्द्र।",
      accountableRolesEn:
        "Duty managers log missed SLAs; weekly public report on oldest open cases.",
      accountableRolesNe:
        "ड्युटी प्रबन्धकले SLA चुकाइ दर्ता गर्छ; सबैभन्दा पुरानो खुला मुद्दामा हप्तामा सार्वजनिक प्रतिवेदन।",
      timelineEn: "Go-live: multi-channel intake; 30 days: baseline SLA metrics; quarterly: improvement targets.",
      timelineNe: "गो-लाइभ: बहुच्यानल दर्ता; ३० दिन: आधार SLA मेट्रिक; त्रैमासिक: सुधार लक्ष्य।",
      milestones: [
        {
          en: "Publish channel-specific SLA (first response, full resolution).",
          ne: "च्यानलअनुसार SLA (पहिलो प्रतिक्रिया, पूर्ण निराकरण) प्रकाशन।",
        },
        {
          en: "Integrate social and chat into same case management backbone.",
          ne: "सामाजिक र च्याट एकै मुद्दा व्यवस्थापन मेरुदण्डमा जोड।",
        },
        {
          en: "Citizen satisfaction callback sample on closed cases.",
          ne: "बन्द मुद्दामा नागरिक सन्तुष्टि कलब्याक नमूना।",
        },
      ],
      kpis: [
        {
          metricEn: "% of calls answered within SLA (weekly)",
          metricNe: "SLA भित्र उठाइएको कल % (हप्तामा)",
          howEn: "ACD reports; public summary.",
          howNe: "ACD प्रतिवेदन; सार्वजनिक सार।",
        },
        {
          metricEn: "Median days to resolve by ministry (published monthly)",
          metricNe: "मन्त्रालयअनुसार निराकरण मध्यक दिन (मासिक प्रकाशित)",
          howEn: "Case management system export.",
          howNe: "मुद्दा व्यवस्थापन प्रणाली निकासा।",
        },
      ],
      risks: [
        {
          en: "Channel overload — social media becomes dumping ground.",
          ne: "च्यानल बढी भार — सामाजिक सञ्जाल फोहोर थुप्रिन्छ।",
        },
        {
          en: "Ministries ignore tickets — national desk becomes mailroom.",
          ne: "मन्त्रालयले टिकट बेवास्ता — राष्ट्रिय डेस्क मात्र डाक कोठा।",
        },
      ],
      escalation: [
        {
          en: "Auto-escalate to ministerial office when SLA breached twice.",
          ne: "SLA दुई पटक उल्लङ्घन भए मन्त्रालय कार्यालयतिर स्वतः उचालन।",
        },
        {
          en: "Annual third-party audit of grievance data quality.",
          ne: "गुनासो डेटा गुणस्तरको वार्षिक तेस्रो पक्ष लेखापरीक्षा।",
        },
        {
          en: "Share this point so 24/7 isn’t fiction (#point-24).",
          ne: "२४/७ कथामात्र नहोस् भने साझेदारी गर्नुहोस् (#बुँदा-२४)।",
        },
      ],
      programStatusEn: "🟡 At risk — 24h grievance SLAs and public stats not verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — २४ घण्टे गुनासो SLA र सार्वजनिक तथ्य यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p25",
    pointNumber: 25,
    category: "Public Service Delivery",
    promise:
      "Upgrade the Hello Sarkar mechanism into a citizen dialogue platform and, through an integrated dashboard, coordinate directly with all ministries to monitor grievance resolution progress in real time.",
    promiseNe:
      "हेलो सरकार संयन्त्रलाई स्तरोन्नति गरी नागरिक संवादको प्लेटफार्मका रूपमा विकास गर्ने तथा एकीकृत ड्यासबोर्डमार्फत सबै मन्त्रालयसँग प्रत्यक्ष समन्वय गरी गुनासो समाधानको प्रगति real-time मा अनुगमन गर्ने।",
    question:
      "Which data fields feed the integrated dashboard, who owns data quality, and can citizens see ministry-level backlog and aging?",
    questionNe:
      "एकीकृत ड्यासबोर्डमा कुन क्षेत्र, डेटा गुणस्तरको जिम्मा कोसँग, र नागरिकले मन्त्रालयस्तरको बाँकी र उमेर देख्छ कि देख्दैन?",
    whyThisMatters:
      "Hello Sarkar’s credibility depends on ministries actually closing loops—not only acknowledging tickets.",
    whyThisMattersNe:
      "हेलो सरकारको विश्वास मन्त्रालयले लूप बन्द गर्छ कि गर्दैनमा निर्भर छ — टिकट मात्र स्वीकार भए हुँदैन।",
    possiblePathItems: [
      "API hooks from each ministry case system to central dashboard",
      "Public view of aging buckets (>7/>30/>90 days)",
      "Escalation to ministerial office when SLA breached",
      "Annual citizen satisfaction survey on dialogue quality",
    ],
    possiblePathItemsNe: [
      "प्रत्येक मन्त्रालय मुद्दा प्रणालीबाट केन्द्रीय ड्यासबोर्डमा API",
      ">७/>३०/>९० दिन उमेर बाल्टी सार्वजनिक दृश्य",
      "SLA उल्लङ्घनमा मन्त्रालय कार्यालयतिर उचालन",
      "संवाद गुणस्तरमा वार्षिक नागरिक सन्तुष्टि सर्वेक्षण",
    ],
    systemInsight:
      "Real-time monitoring is only as honest as the timestamps on the backend—opaque status changes will show up in public impatience.",
    systemInsightNe:
      "रियल-टाइम निगरानी पछाडिको समयमोहर जति ईमानदार, सार्वजनिक अधीरता उति कम — स्थिति गोप्य भए देखिन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item २५ (Hello Sarkar upgrade; scan Page 5)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा २५ (हेलो सरकार स्तरोन्नति; स्क्यान पृष्ठ ५)",
    sourceExcerpt:
      "From scan (Page 5): upgrade Hello Sarkar to a citizen dialogue platform; integrated dashboard; direct ministry coordination; real-time monitoring of grievance resolution.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ५: हेलो सरकारलाई नागरिक संवाद प्लेटफर्म; एकीकृत ड्यासबोर्ड; मन्त्रालयसँग प्रत्यक्ष समन्वय; गुनासो समाधान real-time अनुगमन।",
    layer1: {
      hookEmoji: "👋",
      hook: "Hello Sarkar → real dialogue + real-time ministry dashboards?",
      hookNe: "हेलो सरकार → वास्तविक संवाद + मन्त्रालय ड्यासबोर्ड?",
      stakeLine: "Credibility needs ministries closing loops — not only acknowledging tickets.",
      stakeLineNe: "विश्वासका लागि मन्त्रालयले लूप बन्द गर्छ — टिकट मात्र स्वीकार भए हुँदैन।",
      coreQuestionShort: "Can citizens see ministry backlog, aging, and honest timestamps?",
      coreQuestionShortNe: "नागरिकले मन्त्रालय बाँकी, उमेर र ईमानदार समयमोहर देख्छन्?",
      coreQuestion:
        "Which fields feed the integrated dashboard; who owns data quality; can citizens see ministry backlog and aging?",
      coreQuestionNe:
        "एकीकृत ड्यासबोर्डमा कुन क्षेत्र; डेटा गुणस्तरको जिम्मा कोसँग; मन्त्रालय बाँकी र उमेर देखिन्छ?",
      quickScan: [
        {
          item: "API hooks from ministry case systems to central dashboard",
          itemNe: "मन्त्रालय मुद्दा प्रणालीबाट केन्द्रीय ड्यासबोर्डमा API जोड",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Public view of aging buckets (>7 / >30 / >90 days)",
          itemNe: ">७ / >३० / >९० दिन उमेर बाल्टी सार्वजनिक दृश्य",
          status: "❌ Not available",
          statusNe: "❌ उपलब्ध छैन",
        },
        {
          item: "Escalation to ministerial office when SLA breached",
          itemNe: "SLA उल्लङ्घनमा मन्त्रालय कार्यालयतिर उचालन",
          status: "⚠️ Not verified publicly",
          statusNe: "⚠️ सार्वजनिक प्रमाण छैन",
        },
        {
          item: "Annual citizen satisfaction survey on dialogue quality",
          itemNe: "संवाद गुणस्तरमा वार्षिक नागरिक सन्तुष्टि सर्वेक्षण",
          status: "❌ Not in place",
          statusNe: "❌ अझै छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of the Prime Minister and Council of Ministers (Hello Sarkar upgrade); Ministry of Federal Affairs and General Administration; each ministry IT/case owner for API feeds.",
      primaryOwnersNe:
        "हेलो सरकार स्तरोन्नतिका लागि प्रधानमन्त्री कार्यालय; संघीय मामिला मन्त्रालय; API फिडका लागि प्रत्येक मन्त्रालय IT/मुद्दा जिम्मेवार।",
      coordinatingOfficeEn:
        "Integrated dashboard product owner with data-quality SLAs per ministry.",
      coordinatingOfficeNe: "प्रति मन्त्रालय डेटा गुणस्तर SLA सहित एकीकृत ड्यासबोर्ड उत्पादन मालिक।",
      accountableRolesEn:
        "Ministry secretaries responsible for timestamp accuracy; tampering logs audited.",
      accountableRolesNe:
        "मन्त्रालय सचिव समयमोहर शुद्धताका जिम्मेवार; छेडछाड लग लेखापरीक्षा।",
      timelineEn: "Phase 1: dialogue UX; Phase 2: live ministry metrics; Phase 3: citizen-facing backlog views.",
      timelineNe: "चरण १: संवाद UX; चरण २: लाइभ मन्त्रालय मेट्रिक; चरण ३: नागरिकमुखी बाँकी दृश्य।",
      milestones: [
        {
          en: "Publish data dictionary for dashboard fields and refresh cadence.",
          ne: "ड्यासबोर्ड क्षेत्र र रिफ्रेस तालिकाका लागि डेटा शब्दकोश प्रकाशन।",
        },
        {
          en: "Ministry-level backlog and aging visible without login (or guest login).",
          ne: "लगइन बिना (वा अतिथि) मन्त्रालय बाँकी र उमेर दृश्य।",
        },
        {
          en: "Quarterly integrity report on status changes vs audit trail.",
          ne: "स्थिति परिवर्तन बनाम लेखा ट्रेलमा त्रैमासिक सुशासन प्रतिवेदन।",
        },
      ],
      kpis: [
        {
          metricEn: "Dashboard refresh latency (minutes) vs published target",
          metricNe: "ड्यासबोर्ड रिफ्रेस ढिलाइ (मिनेट) बनाम प्रकाशित लक्ष्य",
          howEn: "Synthetic monitoring; public status page.",
          howNe: "सिंथेटिक निगरानी; सार्वजनिक स्थिति पृष्ठ।",
        },
        {
          metricEn: "Ministry tickets closed / opened ratio (monthly)",
          metricNe: "मन्त्रालय टिकट बन्द/खुला अनुपात (मासिक)",
          howEn: "Exported from case systems.",
          howNe: "मुद्दा प्रणालीबाट निकासा।",
        },
      ],
      risks: [
        {
          en: "Cosmetic dashboard — ministries update status without action.",
          ne: "प्रदर्शन मात्र ड्यासबोर्ड — कारबाही बिना स्थिति अद्यावधिक।",
        },
        {
          en: "Data quality fights — each ministry defines fields differently.",
          ne: "डेटा गुणस्तर विवाद — प्रत्येक मन्त्रालयले क्षेत्र फरक परिभाषा।",
        },
      ],
      escalation: [
        {
          en: "Journalists compare dashboard numbers to ministry press releases.",
          ne: "नागरिकले ड्यासबोर्ड र मन्त्रालय प्रेस तुलना गर्छन्।",
        },
        {
          en: "Parliamentary questions when backlog aging spikes.",
          ne: "बाँकी उमेर बढ्दा संसदीय प्रश्न।",
        },
        {
          en: "Share this point so Hello Sarkar stays honest (#point-25).",
          ne: "हेलो सरकार ईमानदार राख्न साझेदारी गर्नुहोस् (#बुँदा-२५)।",
        },
      ],
      programStatusEn: "🟡 At risk — Hello Sarkar integrated dashboard proof not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — हेलो सरकार एकीकृत ड्यासबोर्ड प्रमाण यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p26",
    pointNumber: 26,
    category: "Public Service Delivery",
    promise:
      "Implement arrangements so passport, citizenship, driving licence, and similar services reach citizens quickly, easily, and free of middlemen within predictable time (Predictable Time), and transform all related service processes to faceless, time-bound, digital systems.",
    promiseNe:
      "पासपोर्ट, नागरिकता, सवारी चालक अनुमति पत्र लगायतका सेवाहरू नागरिकलाई छिटो, सहज र बिचौलिया-मुक्त तरिकाले पूर्वानुमानयोग्य समय (Predictable Time) मा उपलब्ध गराउने व्यवस्था लागू गर्ने तथा सम्पूर्ण सेवा प्रक्रियालाई मुहारविहीन र समयवद्ध (faceless, time-bound) र डिजिटल प्रणालीमा रूपान्तरण गर्ने।",
    question:
      "What published turnaround times apply per service, how are brokers prosecuted or de-licensed, and how is “faceless” reconciled with identity verification?",
    questionNe:
      "प्रति सेवा प्रकाशित समय के, बिचौलियालाई कसरी कारबाही वा इजाजत खारेज, र पहिचान प्रमाणितसँग «मुहारविहीन» कसरी मिलाइन्छ?",
    whyThisMatters:
      "Predictable time plus digital traceability is how citizens know the system is not arbitrary.",
    whyThisMattersNe:
      "पूर्वानुमानित समय र डिजिटल ट्रेसले नागरिकलाई मनमानी छैन थाहा हुन्छ।",
    possiblePathItems: [
      "Legally binding service standards per document type",
      "Online status + SMS/email milestones",
      "Task force on illegal brokerage at service gates",
      "Video KYC or appointment-only exceptions documented",
    ],
    possiblePathItemsNe: [
      "कागजात प्रकारअनुसार कानुनी सेवा मानक",
      "अनलाइन स्थिति + SMS/इमेल कोसेढुङ्गा",
      "सेवा प्रवेशमा अवैध दलाली कार्यदल",
      "भिडियो KYC वा अप्वाइन्टमेन्ट अपवाद कागजातीकृत",
    ],
    systemInsight:
      "Broker-free service is a law-enforcement and UX problem together—digital alone does not remove parking-lot fixers.",
    systemInsightNe:
      "बिचौलिया-मुक्त सेवा कानुन र UX दुवै — डिजिटल मात्रले पार्किङ फिक्सर हटाउँदैन।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item २६ (predictable document services; scan Page 5)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा २६ (पूर्वानुमानित कागजात सेवा; स्क्यान पृष्ठ ५)",
    sourceExcerpt:
      "From scan (Page 5): passport, citizenship, licence, etc.—fast, easy, broker-free, predictable time (Predictable Time); faceless, time-bound, digital processes.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ५: पासपोर्ट, नागरिकता, चालक अनुमति आदि—छिटो, सहज, बिचौलिया मुक्त, पूर्वानुमानयोग्य समय (Predictable Time); मुहारविहीन, समयवद्ध (faceless, time-bound), डिजिटल।",
    layer1: {
      hookEmoji: "📄",
      hook: "Predictable time + faceless digital — the whole stack for ID documents.",
      hookNe: "पूर्वानुमानित समय + मुहारविहीन डिजिटल — परिचयपत्रका लागि पूरै थाक।",
      stakeLine: "Brokers live in the gap between published SLAs and what counters actually do.",
      stakeLineNe: "प्रकाशित SLA र काउन्टर व्यवहारबीचको खालीमा बिचौलिया बाँच्छ।",
      coreQuestionShort: "Published turnaround per service — and proof brokers are losing ground?",
      coreQuestionShortNe: "प्रति सेवा प्रकाशित समय — बिचौलिया घटेको प्रमाण?",
      coreQuestion:
        "What legally binding turnaround applies per document; how are middlemen prosecuted; how is faceless delivery reconciled with strong identity proof?",
      coreQuestionNe:
        "प्रति कागजात कानुनी समय के; बिचौलियालाई कसरी कारबाही; मुहारविहीन र बलियो पहिचान कसरी मिल्छ?",
      quickScan: [
        {
          item: "Published service standards (TAT) per passport / citizenship / licence path",
          itemNe: "पासपोर्ट/नागरिकता/लाइसेन्स प्रति प्रकाशित सेवा मानक (TAT)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Digital status + milestone notifications (SMS/email) live for each service",
          itemNe: "प्रति सेवा डिजिटल स्थिति + SMS/इमेल कोसेढुङ्गा लाइभ",
          status: "⚠️ Partial / not verified",
          statusNe: "⚠️ आंशिक / प्रमाणित छैन",
        },
        {
          item: "Broker enforcement: cases filed, licences revoked, public summary",
          itemNe: "बिचौलिया कारबाही: मुद्दा, इजाजत खारेज, सार्वजनिक सार",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
        {
          item: "Documented exceptions: video KYC / appointment-only where faceless cannot apply",
          itemNe: "मुहारविहीन नलाग्ने ठाउँ भिडियो KYC/अप्वाइन्टमेन्ट अपवाद कागजात",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Department of Passport; Department of National ID and Citizenship; Department of Transport Management; Ministry of Home Affairs; Ministry of Physical Infrastructure and Transport; MoFAGA for CSC standards.",
      primaryOwnersNe:
        "राहदानी विभाग; नागरिकता विभाग; यातायात व्यवस्थापन विभाग; गृह मन्त्रालय; भौतिक पूर्वाधार तथा यातायात मन्त्रालय; CSC मानकका लागि संघीय मामिला मन्त्रालय।",
      coordinatingOfficeEn:
        "Cross-agency predictable-time dashboard with one queue metric per document type.",
      coordinatingOfficeNe: "कागजात प्रकार प्रति एउटा लाइन मेट्रिकसहित अन्तरनिकाय पूर्वानुमानित-समय ड्यासबोर्ड।",
      accountableRolesEn:
        "Heads publish monthly breach lists; anti-broker task force reports to MoHA.",
      accountableRolesNe:
        "प्रमुखले मासिक उल्लंघन सूची प्रकाशन; बिचौलिया कार्यदल गृह मन्त्रालयमा प्रतिवेदन।",
      timelineEn: "Rolling: publish SLAs → instrument digital tracking → enforce brokerage rules → audit wait times quarterly.",
      timelineNe: "क्रमशः: SLA प्रकाशन → डिजिटल ट्रयाक → बिचौलिया नियम → त्रैमासिक प्रतीक्षा लेखापरीक्षा।",
      milestones: [
        {
          en: "Citizen-facing SLA page per service with legal basis.",
          ne: "कानुनी आधारसहित प्रति सेवा नागरिकमुखी SLA पृष्ठ।",
        },
        {
          en: "Integration: application ID tracks through payment, biometric, printing.",
          ne: "जोड: आवेदन ID भुक्तान, बायोमेट्रिक, छपाइसम्म ट्रयाक।",
        },
        {
          en: "Annual third-party queue audit at top 10 crowded offices.",
          ne: "सबैभन्दा भीड १० कार्यालयमा वार्षिक तेस्रो पक्ष लाइन लेखापरीक्षा।",
        },
      ],
      kpis: [
        {
          metricEn: "Median days issuance vs published SLA (by document type)",
          metricNe: "जारी मध्यक दिन बनाम प्रकाशित SLA (कागजात प्रकारअनुसार)",
          howEn: "Sample of completed cases; public methodology.",
          howNe: "पूरा मुद्दा नमूना; सार्वजनिक विधि।",
        },
        {
          metricEn: "Broker-related arrests or de-licensing actions per quarter",
          metricNe: "त्रैमासिक बिचौलिया सम्बन्धी पक्राउ वा इजाजत खारेज",
          howEn: "Prosecution and transport/home ministry data.",
          howNe: "अभियोजन र यातायात/गृह डेटा।",
        },
      ],
      risks: [
        {
          en: "Digital front — manual back: citizens still pay fixers for “movement.”",
          ne: "अगाडि डिजिटल — पछाडि म्यानुअल: नागरिकले «चलाउन» फिक्सरलाई तिर्छन्।",
        },
        {
          en: "Faceless without capacity — queues become opaque black boxes.",
          ne: "क्षमता बिना मुहारविहीन — लाइन अपारदर्शी कालो बाकस बन्छ।",
        },
      ],
      escalation: [
        {
          en: "Compare same service across districts — name offices breaching SLA most.",
          ne: "उही सेवा जिल्ला तुलना — SLA उल्लंघन बढी कार्यालय नाम।",
        },
        {
          en: "MP questions when median wait exceeds SLA two quarters running.",
          ne: "दुई त्रैमासिक मध्यक प्रतीक्षा SLA नाघे सांसद प्रश्न।",
        },
        {
          en: "Share this point so predictable time stays real (#point-26).",
          ne: "पूर्वानुमानित समय वास्तविक राख्न साझेदारी गर्नुहोस् (#बुँदा-२६)।",
        },
      ],
      programStatusEn: "🔴 No evidence on file — predictable-time document delivery not publicly verified here.",
      programStatusNe: "🔴 प्रमाण दर्ता छैन — पूर्वानुमानित-समय कागजात वितरण यहाँ प्रमाणित छैन।",
    },
  },
  {
    id: "p27",
    pointNumber: 27,
    category: "Public Service Delivery",
    promise:
      "With the objective of delivering government services at citizens’ homes, modernize postal services and develop them as a “Government Courier Service,” through which passports, citizenship copies, licences, and similar government documents or materials shall be delivered to citizens’ homes, with arrangements implemented within 100 days.",
    promiseNe:
      "सरकारी सेवा घरमै उपलब्ध गराउने उद्देश्यले हुलाक सेवालाई आधुनिकीकरण गरी «Government Courier Service» का रूपमा विकास गर्ने, जसमार्फत राहदानी, नागरिकता प्रतिलिपि, लाइसेन्स लगायतका सरकारी कागजातहरू/सामग्रीहरू घरमै पुर्याउने व्यवस्था १०० दिनभित्र लागू गर्ने।",
    question:
      "What fees, security, and proof-of-delivery standards apply, which geographies are in phase one, and how are lost or mis-delivered items remedied?",
    questionNe:
      "शुल्क, सुरक्षा र वितरण प्रमाणको मानक के, पहिलो चरणमा कुन क्षेत्र, र हराउने वा गलत वितरणको उपचार कसरी?",
    whyThisMatters:
      "Home delivery shifts risk to logistics and identity proof—citizens need clarity on liability and tracking.",
    whyThisMattersNe:
      "घर वितरणले जोखिम लजिस्टिक्स र पहिचान प्रमाणतिर सर्छ — दायित्व र ट्र्याक स्पष्ट हुनुपर्छ।",
    possiblePathItems: [
      "Pilot routes with insured carriers and signature capture",
      "Integration with application status (“out for delivery”)",
      "Pricing schedule and subsidy rules for remote areas",
      "Redress SLA for failed deliveries",
    ],
    possiblePathItemsNe: [
      "बीमित वाहक र हस्ताक्षर क्याप्चरसहित पाइलट मार्ग",
      "आवेदन स्थितिसँग जोड («वितरणमा निस्किएको»)",
      "दूर क्षेत्र अनुदान नियमसहित मूल्य तालिका",
      "असफल वितरणका लागि उपचार SLA",
    ],
    systemInsight:
      "This is the last mile of digital government—if parcels stall, the whole reform looks like a brochure.",
    systemInsightNe:
      "यो डिजिटल सरकारको अन्तिम माइल हो — पार्सल अड्कियो भने सुधार ब्रोसर जस्तो देखिन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item २७ (Government Courier; scan Page 6)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा २७ (सरकारी कुरियर; स्क्यान पृष्ठ ६)",
    sourceExcerpt:
      "From scan (Page 6): modernize postal as Government Courier Service; deliver passport, citizenship copy, licence, etc. to homes within 100 days.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ६: हुलाकलाई Government Courier Service; राहदानी, नागरिकता प्रतिलिपि, लाइसेन्स घरमै पुर्याउने १०० दिनभित्र।",
    layer1: {
      hookEmoji: "📮",
      hook: "Government Courier — documents to the doorstep in 100 days.",
      hookNe: "सरकारी कुरियर — १०० दिनमा कागजात ढोकासम्म।",
      stakeLine: "Last-mile trust needs insured carriers, proof of delivery, and a clear liability map.",
      stakeLineNe: "अन्तिम माइल विश्वासका लागि बीमित वाहक, वितरण प्रमाण र स्पष्ट दायित्व नक्सा।",
      coreQuestionShort: "Who pays if a passport goes missing — and is tracking one click?",
      coreQuestionShortNe: "राहदानी हरायो भने को तिर्छ — ट्र्याक एक क्लिक?",
      coreQuestion:
        "What fees and insurance apply; which regions are phase one; how are lost or mis-delivered items remedied with published SLAs?",
      coreQuestionNe:
        "शुल्क र बीमा के; पहिलो चरण कुन क्षेत्र; हराउने वा गलत वितरणको उपचार प्रकाशित SLA सहित कसरी?",
      quickScan: [
        {
          item: "100-day go-live: pilot routes + carrier contracts on file",
          itemNe: "१०० दिन गो-लाइभ: पाइलट मार्ग + वाहक सम्झौता दर्ता",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Published proof-of-delivery standard (signature / OTP / photo)",
          itemNe: "प्रकाशित वितरण प्रमाण मानक (हस्ताक्षर/OTP/फोटो)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Integration with application status (“out for delivery”)",
          itemNe: "आवेदन स्थितिसँग जोड («वितरणमा निस्किएको»)",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Remote-area pricing / subsidy rules published",
          itemNe: "दूर क्षेत्र मूल्य/अनुदान नियम प्रकाशित",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Nepal Post / Ministry of Communications and Information Technology; Ministry of Home Affairs for documents; insurers; line ministries for contents.",
      primaryOwnersNe:
        "नेपाल हुलाक / सञ्चार मन्त्रालय; कागजातका लागि गृह मन्त्रालय; बीमक; सामग्रीका लागि मन्त्रालय।",
      coordinatingOfficeEn:
        "Courier operations centre with chain-of-custody logging from print facility to doorstep.",
      coordinatingOfficeNe: "छपाइदेखि ढोकासम्म हिरासत श्रृङ्खला लगसहित कुरियर सञ्चालन केन्द्र।",
      accountableRolesEn:
        "Postmaster general signs monthly on-time and loss-rate targets.",
      accountableRolesNe:
        "मुख्य हुलाक प्रमुखले मासिक समयमै र हराउने दर लक्ष्य हस्ताक्षर।",
      timelineEn: "T+100 days: home delivery live for listed documents; T+30: first public loss/remedy stats.",
      timelineNe: "T+१०० दिन: सूचीबद्ध कागजात घर वितरण लाइभ; T+३०: पहिलो सार्वजनिक हराउने/उपचार तथ्य।",
      milestones: [
        {
          en: "Publish carrier SLAs, insurance caps, and citizen complaint hotline.",
          ne: "वाहक SLA, बीमा सीमा र नागरिक उजुरी हटलाइन प्रकाशन।",
        },
        {
          en: "Barcode or parcel ID linked to application reference.",
          ne: "आवेदन सन्दर्भसँग जोडिएको बारकोड वा पार्सल ID।",
        },
        {
          en: "Quarterly report: deliveries completed vs failed vs compensated.",
          ne: "त्रैमासिक प्रतिवेदन: पूरा/असफल/क्षतिपूर्ति वितरण।",
        },
      ],
      kpis: [
        {
          metricEn: "On-time delivery % (published monthly)",
          metricNe: "समयमै वितरण % (मासिक प्रकाशित)",
          howEn: "Carrier scans vs promised window.",
          howNe: "वाहक स्क्यान बनाम वाचा खिडकी।",
        },
        {
          metricEn: "Loss / damage rate per 10,000 shipments",
          metricNe: "प्रति १०,००० वितरण हराउने/क्षति दर",
          howEn: "Insurance claims + audit sample.",
          howNe: "बीमा दाबी + लेखापरीक्षा नमूना।",
        },
      ],
      risks: [
        {
          en: "Under-insured last mile — citizens bear cost of state logistics failure.",
          ne: "कम बीमित अन्तिम माइल — राज्य लजिस्टिक्स असफलताको लागत नागरिकमा।",
        },
        {
          en: "Urban-only pilots — hills and Tarai left for “phase two forever.”",
          ne: "शहरी मात्र पाइलट — पहाड र तराई «सदाको चरण दुई»।",
        },
      ],
      escalation: [
        {
          en: "Media test: order three document types — publish actual delivery times.",
          ne: "मिडिया परीक्षण: तीन कागजात अर्डर — वास्तविक वितरण समय प्रकाशन।",
        },
        {
          en: "Share this point so courier promises stay trackable (#point-27).",
          ne: "कुरियर वाचा ट्रयाकयोग्य राख्न साझेदारी गर्नुहोस् (#बुँदा-२७)।",
        },
      ],
      programStatusEn: "🟡 At risk — Government Courier home delivery proof not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — सरकारी कुरियर घर वितरण प्रमाण यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p28",
    pointNumber: 28,
    category: "Digital Governance & Data",
    promise:
      "Within 100 days, strengthen the existing GIOMS system and make it user-friendly across all government bodies at the federal, provincial, and local levels so public service delivery becomes faster, transparent, paperless, and interconnected.",
    promiseNe:
      "सार्वजनिक सेवा प्रवाहलाई छिटो, पारदर्शी, कागजरहित तथा अन्तरआबद्ध बनाउन सङ्घ, प्रदेश र स्थानीय तहका सबै सरकारी निकायहरूमा १०० दिनभित्र विद्यमान GIOMS प्रणालीलाई सुदृढ र प्रयोगकर्तामैत्री बनाउने।",
    question:
      "What upgrade roadmap, training hours, and interoperability tests are published per tier, and how will citizens verify paperless receipts?",
    questionNe:
      "तहअनुसार कुन स्तरोन्नति रोडम्याप, तालिम घण्टा र अन्तरसञ्चालन परीक्षण सार्वजनिक हुन्छ, र नागरिकले कागजरहित रसिद कसरी प्रमाणित गर्छ?",
    whyThisMatters:
      "GIOMS is the plumbing of digital government—if it stays brittle, every portal above it wobbles.",
    whyThisMattersNe:
      "GIOMS डिजिटल सरकारको पाइप हो — कमजोर भए माथिको हरेक पोर्टल लड्छ।",
    possiblePathItems: [
      "Version changelog and uptime dashboard",
      "Role-based training completion by organization",
      "Cross-tier test cases for shared workflows",
      "Helpdesk SLAs for GIOMS outages",
    ],
    possiblePathItemsNe: [
      "संस्करण परिवर्तन र अपटाइम ड्यासबोर्ड",
      "संस्थाअनुसार भूमिकामूलक तालिम पूरा",
      "साझा कार्यप्रवाहका तहबीच परीक्षण केस",
      "GIOMS बन्दका लागि हेल्पडेस्क SLA",
    ],
    systemInsight:
      "“User-friendly in 100 days” needs a definition—tasks per screen, load time, and error rates should be public.",
    systemInsightNe:
      "«१०० दिनमा प्रयोगकर्तामैत्री» परिभाषा चाहिन्छ — स्क्रिन प्रति काम, लोड समय, त्रुटि दर सार्वजनिक हुनुपर्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item २८ (GIOMS; scan Page 6, section घ)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा २८ (GIOMS; स्क्यान पृष्ठ ६, खण्ड घ)",
    sourceExcerpt:
      "From scan (Page 6, section घ): within 100 days strengthen GIOMS and make it user-friendly at federal, provincial, and local levels; faster, transparent, paperless, interconnected service delivery.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ६ (घ): १०० दिनमा GIOMS सुदृढ र सङ्घ–प्रदेश–स्थानीयमा प्रयोगकर्तामैत्री; सेवा छिटो, पारदर्शी, कागजरहित, अन्तरआबद्ध।",
    layer1: {
      hookEmoji: "🧩",
      hook: "GIOMS in 100 days — the plumbing every portal stands on.",
      hookNe: "१०० दिनमा GIOMS — हरेक पोर्टलको पाइप।",
      stakeLine: "“User-friendly” needs public metrics: uptime, tasks-per-screen, and error rates.",
      stakeLineNe: "«प्रयोगकर्तामैत्री» लाई अपटाइम, स्क्रिन प्रति काम, त्रुटि दर सार्वजनिक चाहिन्छ।",
      coreQuestionShort: "Roadmap, training, and cross-tier tests — where are the receipts?",
      coreQuestionShortNe: "रोडम्याप, तालिम, तहबीच परीक्षण — रसिद कहाँ?",
      coreQuestion:
        "What upgrade roadmap and interoperability tests are published per tier; how do citizens verify paperless receipts?",
      coreQuestionNe:
        "तहअनुसार स्तरोन्नति र अन्तरसञ्चालन परीक्षण के प्रकाशित; नागरिकले कागजरहित रसिद कसरी प्रमाणित गर्छ?",
      quickScan: [
        {
          item: "Published version roadmap + changelog (federal / province / local)",
          itemNe: "प्रकाशित संस्करण रोडम्याप + परिवर्तन सूची (संघ/प्रदेश/स्थानीय)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Uptime / incident dashboard for GIOMS (or honest “not yet”)",
          itemNe: "GIOMS अपटाइम/घटना ड्यासबोर्ड (वा ईमानदार «अझै छैन»)",
          status: "❌ Not available",
          statusNe: "❌ उपलब्ध छैन",
        },
        {
          item: "Role-based training completion rates by organization",
          itemNe: "संस्थाअनुसार भूमिकामूलक तालिम पूरा दर",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Cross-tier test cases passed (shared workflows)",
          itemNe: "साझा कार्यप्रवाहका तहबीच परीक्षण केस पास",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Federal Affairs and General Administration (GIOMS lead); provincial and local IT units; NPCS/contractor for platform.",
      primaryOwnersNe:
        "संघीय मामिला मन्त्रालय (GIOMS नेतृत्व); प्रदेश र स्थानीय IT; प्लेटफर्मका लागि NPCS/ठेकेदार।",
      coordinatingOfficeEn:
        "GIOMS program management office with tiered rollout scorecards.",
      coordinatingOfficeNe: "तहगत रोलआउट स्कोरकार्डसहित GIOMS कार्यक्रम व्यवस्थापन कार्यालय।",
      accountableRolesEn:
        "CIO-equivalent in each tier attests interoperability test sign-off.",
      accountableRolesNe:
        "प्रत्येक तहमा CIO-समकक्षले अन्तरसञ्चालन परीक्षण स्वीकृति प्रमाणित।",
      timelineEn: "T+100 days: user-facing improvements live; parallel: training hours and helpdesk SLAs.",
      timelineNe: "T+१०० दिन: नागरिकमुखी सुधार लाइभ; समानान्तर: तालिम र हेल्पडेस्क SLA।",
      milestones: [
        {
          en: "Public definition of “user-friendly” with load-time and error KPIs.",
          ne: "लोड समय र त्रुटि KPI सहित «प्रयोगकर्तामैत्री» सार्वजनिक परिभाषा।",
        },
        {
          en: "Paperless receipt verification (QR/API) documented per service.",
          ne: "प्रति सेवा कागजरहित रसिद प्रमाणन (QR/API) कागजात।",
        },
        {
          en: "Post-incident review published for major GIOMS outages.",
          ne: "ठूलो GIOMS बन्दपछि पछिको समीक्षा प्रकाशन।",
        },
      ],
      kpis: [
        {
          metricEn: "Monthly uptime % (tier breakdown)",
          metricNe: "मासिक अपटाइम % (तह विभाजन)",
          howEn: "Monitoring tool export; public status page.",
          howNe: "निगरानी उपकरण निकासा; सार्वजनिक स्थिति पृष्ठ।",
        },
        {
          metricEn: "Mean time to restore after P1 incident",
          metricNe: "P१ घटनापछि पुनर्स्थापना औसत समय",
          howEn: "Incident tickets; quarterly summary.",
          howNe: "घटना टिकट; त्रैमासिक सार।",
        },
      ],
      risks: [
        {
          en: "100-day rush ships brittle releases — more downtime, not less.",
          ne: "१०० दिन हतारोले कमजोर रिलिज — बन्द बढ्छ, घट्दैन।",
        },
        {
          en: "Local bodies lack bandwidth — GIOMS becomes federal-only in practice.",
          ne: "स्थानीयमा ब्यान्डविथ छैन — व्यवहारमा GIOMS संघ मात्र।",
        },
      ],
      escalation: [
        {
          en: "Civil society files accessibility complaint when portals break at local level.",
          ne: "स्थानीय पोर्टल बिग्रँदा नागरिक समाजले पहुँच उजुरी।",
        },
        {
          en: "Share this point so GIOMS metrics stay public (#point-28).",
          ne: "GIOMS मेट्रिक सार्वजनिक राख्न साझेदारी गर्नुहोस् (#बुँदा-२८)।",
        },
      ],
      programStatusEn: "🟡 At risk — GIOMS 100-day upgrade claims not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — GIOMS १०० दिन स्तरोन्नति दाबी यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p29",
    pointNumber: 29,
    category: "Digital Governance & Data",
    promise:
      "Within 60 days, relevant offices shall implement auto-fill in their systems so that citizens are not again asked for personal details the government already holds (for example: when the citizenship number is entered, name and address auto-fill); arrange an environment where, after a citizen provides information to the government once (for example: citizenship number), other government bodies can reuse that data.",
    promiseNe:
      "सरकारसँग पहिले नै भएको नागरिकको वैयक्तिक विवरण (जस्तै: नागरिकता नम्बर हाल्दा नाम/ठेगाना) पुनः सोध्नुको सट्टा Auto-fill हुने व्यवस्था सम्बन्धित कार्यालयहरूले आफ्ना प्रणालीहरूमा ६० दिनभित्र गर्ने। नागरिकले आफ्नो विवरण (जस्तै: नागरिकता नम्बर) सरकारलाई एक पटक दिएपछि, अन्य सरकारी निकायले सोही डेटा प्रयोग गर्ने वातावरण मिलाउने।",
    question:
      "What consent, logging, and correction rights apply when data is reused across agencies, and which master registry is authoritative?",
    questionNe:
      "निकायबीच डेटा पुन:प्रयोगमा सहमति, अभिलेख र सच्याउने अधिकार के, र कुन मास्टर दर्ता आधिकारिक?",
    whyThisMatters:
      "Auto-fill cuts hassle but raises privacy stakes—reuse without governance becomes surveillance by default.",
    whyThisMattersNe:
      "अटो-फिल सहज बनाउँछ तर गोपनीयता जोखिम बढाउँछ — शासन बिना पुन:प्रयोग निगरानी बन्छ।",
    possiblePathItems: [
      "Published data-sharing framework with legal basis",
      "Citizen-facing log of which agency accessed what",
      "Correction workflow with timelines",
      "Red-team tests for over-collection",
    ],
    possiblePathItemsNe: [
      "कानुनी आधारसहित डेटा साझेदारी ढाँचा प्रकाशन",
      "कुन निकायले के हेर्यो नागरिकमुखी अभिलेख",
      "समयसीमासहित सच्याउने कार्यप्रवाह",
      "अतिसङ्कलनका लागि रेड-टिम परीक्षण",
    ],
    systemInsight:
      "\"Tell the government once\" is elegant policy—implementation needs APIs, not copy-paste between silos.",
    systemInsightNe:
      "«एक पटक भन्नु» सुन्दर नीति हो — कार्यान्वयनमा प्रतिलिपि होइन API चाहिन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item २९ (auto-fill / once-only data; scan Page 6)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा २९ (अटो-फिल/एक पटक डेटा; स्क्यान पृष्ठ ६)",
    sourceExcerpt:
      "From scan (Page 6, घ): within 60 days, auto-fill (e.g. citizenship no. fills name/address); after a citizen gives details once (e.g. citizenship no.), other agencies reuse the data.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ६ (घ): ६० दिनमा अटो-फिल (जस्तै नागरिकता नम्बर हाल्दा नाम/ठेगाना); नागरिकले एक पटक (जस्तै नागरिकता नम्बर) दिएपछि अन्य निकायले सोही डेटा प्रयोग।",
    layer1: {
      hookEmoji: "🔁",
      hook: "Auto-fill and “tell once” — convenience that needs consent and audit trails.",
      hookNe: "अटो-फिल र «एक पटक भन्नु» — सहमति र अभिलेख बिना सुविधा जोखिम।",
      stakeLine: "Reuse without rules becomes silent surveillance across agencies.",
      stakeLineNe: "नियम बिना पुन:प्रयोग निकायबीच मौन निगरानी बन्छ।",
      coreQuestionShort: "Which master registry wins — and can citizens see who touched their data?",
      coreQuestionShortNe: "कुन मास्टर दर्ता आधिकारिक — नागरिकले कसले डेटा छोयो देख्छ?",
      coreQuestion:
        "What consent, logging, and correction rights apply when data is reused; which registry is authoritative?",
      coreQuestionNe:
        "पुन:प्रयोगमा सहमति, अभिलेख र सच्याउने अधिकार के; कुन दर्ता आधिकारिक?",
      quickScan: [
        {
          item: "Published data-sharing framework (legal basis + purpose limitation)",
          itemNe: "प्रकाशित डेटा साझेदारी ढाँचा (कानुनी आधार + उद्देश्य सीमा)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Citizen-facing access log: which agency read which field",
          itemNe: "नागरिकमुखी पहुँच लग: कुन निकायले कुन क्षेत्र पढ्यो",
          status: "❌ Not available",
          statusNe: "❌ उपलब्ध छैन",
        },
        {
          item: "Auto-fill live in ≥60-day target % of frontline systems",
          itemNe: "६० दिन लक्ष्यका अग्रपंक्ति प्रणालीमा अटो-फिल लाइभ %",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Correction workflow with published timelines",
          itemNe: "प्रकाशित समयसीमासहित सच्याउने कार्यप्रवाह",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of the Prime Minister and Council of Ministers (often digital governance lead); Ministry of Communications and Information Technology; National ID Department; line ministries and provinces.",
      primaryOwnersNe:
        "डिजिटल शासन नेतृत्व प्रधानमन्त्री कार्यालय; सञ्चार मन्त्रालय; राष्ट्रिय परिचयपत्र विभाग; मन्त्रालय र प्रदेश।",
      coordinatingOfficeEn:
        "National data exchange / consent service with API catalogue and audit store.",
      coordinatingOfficeNe: "API क्याटलग र लेखा भण्डारसहित राष्ट्रिय डेटा एक्सचेन्ज/सहमति सेवा।",
      accountableRolesEn:
        "Data protection officer (or equivalent) signs off on new cross-agency pipes.",
      accountableRolesNe:
        "डेटा संरक्षण अधिकृत (वा समकक्ष) नयाँ अन्तरनिकाय पाइप स्वीकृत।",
      timelineEn: "T+60 days: auto-fill in listed systems; parallel: citizen consent UX and logs.",
      timelineNe: "T+६० दिन: सूचीबद्ध प्रणालीमा अटो-फिल; समानान्तर: नागरिक सहमति UX र लग।",
      milestones: [
        {
          en: "Publish DPIA-style summary for each auto-fill data flow.",
          ne: "प्रत्येक अटो-फिल प्रवाहका लागि DPIA-शैली सार प्रकाशन।",
        },
        {
          en: "Red-team exercise: over-collection and silent profile merging.",
          ne: "रेड-टिम: अतिसङ्कलन र मौन प्रोफाइल मर्ज।",
        },
        {
          en: "Annual third-party audit of consent logs and retention.",
          ne: "सहमति लग र प्रतिधारणको वार्षिक तेस्रो पक्ष लेखापरीक्षा।",
        },
      ],
      kpis: [
        {
          metricEn: "% of eligible forms with working auto-fill (by ministry)",
          metricNe: "योग्य फारममध्ये काम गर्ने अटो-फिल % (मन्त्रालयअनुसार)",
          howEn: "Sample testing; ministry self-report with audit.",
          howNe: "नमूना परीक्षण; लेखापरीक्षासहित आत्मप्रतिवेदन।",
        },
        {
          metricEn: "Average days to correct citizen data after dispute",
          metricNe: "विवादपछि नागरिक डेटा सच्याउन औसत दिन",
          howEn: "Ticketing system export.",
          howNe: "टिकटिङ प्रणाली निकासा।",
        },
      ],
      risks: [
        {
          en: "Silent merges — one typo propagates everywhere.",
          ne: "मौन मर्ज — एउटा टाइपो सबैतिर सर्छ।",
        },
        {
          en: "Agencies opt out — “tell once” dies in silos.",
          ne: "निकाय बाहिरिन्छन् — «एक पटक» सिलोमा मर्छ।",
        },
      ],
      escalation: [
        {
          en: "Privacy advocate publishes monthly “who accessed my record” test.",
          ne: "गोपनीयता वकालतले मासिक «मेरो रेकर्ड कसले हेर्यो» परीक्षण।",
        },
        {
          en: "Share this point so reuse stays lawful (#point-29).",
          ne: "पुन:प्रयोग कानूनी राख्न साझेदारी गर्नुहोस् (#बुँदा-२९)।",
        },
      ],
      programStatusEn: "🔴 No evidence on file — once-only auto-fill governance not publicly verified here.",
      programStatusNe: "🔴 प्रमाण दर्ता छैन — एक पटक अटो-फिल शासन यहाँ प्रमाणित छैन।",
    },
  },
  {
    id: "p30",
    pointNumber: 30,
    category: "Digital Governance & Data",
    promise:
      "Complete, within 100 days, work to simplify government apps and portals so that persons with disabilities and citizens with limited technical skills can also use them with ease.",
    promiseNe:
      "सरकारी एप वा पोर्टलहरू अपाङ्गता भएका व्यक्ति र कम प्राविधिक ज्ञान भएका नागरिकले पनि चलाउन सक्ने गरी सरल बनाउने कार्य १०० दिनमा सम्पन्न गर्ने।",
    question:
      "Which WCAG or national accessibility standards are adopted, how is user testing with disabled persons documented, and what fallback channels exist?",
    questionNe:
      "कुन WCAG वा राष्ट्रिय पहुँच मानक अपनाइन्छ, अपाङ्गता भएका व्यक्तिसँग प्रयोग परीक्षण कसरी कागजातीकृत हुन्छ, र वैकल्पिक माध्यम के छ?",
    whyThisMatters:
      "Digital-by-default must not mean exclusion-by-default for those who need accommodation most.",
    whyThisMattersNe:
      "डिजिटल पूर्वनिर्धारित भनेर सबैभन्दा आवश्यक समायोजन चाहिनेहरू बाहिर पर्नु हुँदैन।",
    possiblePathItems: [
      "Accessibility statement and roadmap per major portal",
      "Screen-reader and keyboard-only audits published",
      "Low-literacy mode (audio, larger type) where feasible",
      "In-person assist counters linked to same backlog metrics",
    ],
    possiblePathItemsNe: [
      "मुख्य पोर्टलप्रति पहुँच घोषणा र रोडम्याप",
      "स्क्रिन-रीडर र किबोर्डमात्र लेखापरीक्षण प्रकाशन",
      "सम्भव ठाउँमा कम साक्षरता मोड (आवाज, ठूलो अक्षर)",
      "एकै मेट्रिकसँग जोडिएको उपस्थित सहायता काउन्टर",
    ],
    systemInsight:
      "Accessibility is not a skin—it is tested journeys. A hundred-day deadline should end with published audit results, not promises.",
    systemInsightNe:
      "पहुँच थिम होइन — परीक्षण यात्रा। सय दिने म्याद प्रतिबद्धताले होइन लेखापरीक्षण नतिजाले टुंगिनुपर्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ३० (accessible apps/portals; scan Page 6)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ३० (पहुँचयोग्य एप/पोर्टल; स्क्यान पृष्ठ ६)",
    sourceExcerpt:
      "From scan (Page 6, section घ): within 100 days, complete work to simplify government apps and portals for persons with disabilities and citizens with limited technical skills.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ६ (घ): १०० दिनमा अपाङ्गता भएका व्यक्ति र कम प्राविधिक ज्ञान भएका नागरिकले सजिलै चलाउन सक्ने गरी सरकारी एप/पोर्टल सरल बनाउने कार्य सम्पन्न।",
    layer1: {
      hookEmoji: "♿",
      hook: "Accessibility in 100 days — tested journeys, not checkbox labels.",
      hookNe: "१०० दिनमा पहुँच — परीक्षण यात्रा, चेकबक्स होइन।",
      stakeLine: "Digital-by-default must not exclude those who need accommodation most.",
      stakeLineNe: "डिजिटल पूर्वनिर्धारित भनेर सबैभन्दा समायोजन चाहिनेलाई बाहिर पर्नु हुँदैन।",
      coreQuestionShort: "WCAG targets, user tests with disabled persons — published where?",
      coreQuestionShortNe: "WCAG लक्ष्य, अपाङ्गता भएका व्यक्तिसँग परीक्षण — कहाँ प्रकाशित?",
      coreQuestion:
        "Which WCAG or national standards are adopted; how is user testing documented; what fallback channels exist?",
      coreQuestionNe:
        "कुन WCAG वा राष्ट्रिय मानक; प्रयोग परीक्षण कसरी कागजातीकृत; वैकल्पिक माध्यम के?",
      quickScan: [
        {
          item: "Accessibility statement + roadmap per major portal/app",
          itemNe: "मुख्य पोर्टल/एप प्रति पहुँच घोषणा र रोडम्याप",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Published audit: screen reader + keyboard-only (sample pages)",
          itemNe: "प्रकाशित लेखापरीक्षा: स्क्रिन रीडर + किबोर्डमात्र (नमूना पृष्ठ)",
          status: "❌ Not available",
          statusNe: "❌ उपलब्ध छैन",
        },
        {
          item: "Documented usability tests with persons with disabilities",
          itemNe: "अपाङ्गता भएका व्यक्तिसँग प्रयोग परीक्षण कागजात",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "In-person assist counters linked to same service metrics",
          itemNe: "उपस्थित सहायता काउन्टर एउटै सेवा मेट्रिकसँग जोडिएको",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "MoFAGA / NPCS for major portals; Ministry of Communications and Information Technology; Ministry of Women, Children and Senior Social Welfare; disability organizations as review partners.",
      primaryOwnersNe:
        "मुख्य पोर्टलका लागि संघीय मामिला/NPCS; सञ्चार मन्त्रालय; महिला बालबालिका र ज्येष्ठ नागरिक मन्त्रालय; अपाङ्गता संस्था समीक्षा साझेदार।",
      coordinatingOfficeEn:
        "Accessibility conformance board with quarterly scorecards per flagship service.",
      coordinatingOfficeNe: "प्रति प्रमुख सेवा त्रैमासिक स्कोरकार्डसहित पहुँच अनुरूपता बोर्ड।",
      accountableRolesEn:
        "Product owners sign release only after remediation of critical WCAG gaps.",
      accountableRolesNe:
        "उत्पादन मालिकले गम्भीर WCAG खाली सुधारपछि मात्र रिलिज स्वीकृत।",
      timelineEn: "T+100 days: remediation backlog closed for critical paths; ongoing: minor issues.",
      timelineNe: "T+१०० दिन: गम्भीर मार्गका लागि सुधार बाँकी बन्द; निरन्तर: सानो समस्या।",
      milestones: [
        {
          en: "Publish conformance level target (e.g. AA) and testing vendor.",
          ne: "अनुरूपता स्तर लक्ष्य (जस्तै AA) र परीक्षण विक्रेता प्रकाशन।",
        },
        {
          en: "Low-literacy / audio mode pilot on top three services.",
          ne: "शीर्ष तीन सेवामा कम साक्षरता/आवाज मोड पाइलट।",
        },
        {
          en: "Citizen satisfaction survey on accessibility (annual).",
          ne: "पहुँचमा नागरिक सन्तुष्टि सर्वेक्षण (वार्षिक)।",
        },
      ],
      kpis: [
        {
          metricEn: "Critical WCAG violations open vs closed (monthly)",
          metricNe: "गम्भीर WCAG उल्लंघन खुला बनाम बन्द (मासिक)",
          howEn: "Automated scan + manual verification.",
          howNe: "स्वचालित स्क्यान + हस्त प्रमाणीकरण।",
        },
        {
          metricEn: "% of services with documented disabled-user test sessions",
          metricNe: "अपाङ्गता प्रयोगकर्ता परीक्षण सत्र कागजात भएका सेवा %",
          howEn: "Program office records; spot checks.",
          howNe: "कार्यक्रम कार्यालय रेकर्ड; स्पट जाँच।",
        },
      ],
      risks: [
        {
          en: "Overlay plugins — fake accessibility that breaks real AT users.",
          ne: "ओभरले प्लगइन — झूटो पहुँच, वास्तविक AT प्रयोगकर्ता बिग्रँदा।",
        },
        {
          en: "100-day rush ships cosmetic fixes only.",
          ne: "१०० दिन हतारोले सजावट मात्र सुधार।",
        },
      ],
      escalation: [
        {
          en: "DPO organizations publish “accessibility fail” awards for worst portals.",
          ne: "अपाङ्गता संस्थाले नाजुक पोर्टलका लागि «पहुँच असफल» पुरस्कार।",
        },
        {
          en: "Share this point so inclusion stays measured (#point-30).",
          ne: "समावेश मापन मै राख्न साझेदारी गर्नुहोस् (#बुँदा-३०)।",
        },
      ],
      programStatusEn: "🟡 At risk — 100-day accessibility completion not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — १०० दिन पहुँच पूरा यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p31",
    pointNumber: 31,
    category: "Digital Governance & Data",
    promise:
      "To simplify online applications, enable applying through the Nagarik App. When applying via the app, allow form fill-up using data the app has locally stored on the person’s phone or obtained from other systems—but the Nagarik App must not centrally store data. Within 45 days, enable applications through this arrangement for police reports, passport, and driving licence.",
    promiseNe:
      "अनलाइन आवेदन प्रणालीलाई सहज बनाउन नागरिक एप मार्फत आवेदन दिने व्यवस्था मिलाउने। यसरी नागरिक एप मार्फत आवेदन दिँदा व्यक्तिले आफ्नो फोनमा रहेको एपले Locally Store गरेको विवरण वा अन्य प्रणालीबाट प्राप्त विवरणको आधारमा Form Fill-up गर्ने व्यवस्था मिलाउने। तर नागरिक एपले Centrally Data Store गर्न भने नमिल्ने बनाउने। यस्तो व्यवस्थाबाट प्रहरी प्रतिवेदन, राहदानी र सवारी चालक अनुमति पत्रका लागि आवेदन गर्न सकिने व्यवस्था ४५ दिनभित्र मिलाउने।",
    question:
      "How is “local only” verified in audits, what encryption and device-integrity checks apply, and which office owns incident response if data is exfiltrated from the app layer?",
    questionNe:
      "«स्थानीय मात्र» लेखापरीक्षणमा कसरी प्रमाणित हुन्छ, कुन कूटलेखन र उपकरण अखण्डता जाँच लागू हुन्छ, र एप तहबाट डेटा चुहियो भने घटना प्रतिक्रिया कुन कार्यालयको?",
    whyThisMatters:
      "Local-first design reduces central honeypots but pushes security to millions of devices—policy must say who is accountable when phones are compromised.",
    whyThisMattersNe:
      "स्थानीय-पहिले डिजाइनले केन्द्रीय लक्ष्य घटाउँछ तर सुरक्षा लाखौं उपकरणमा सर्छ — फोन सम्झौता भए जवाफदेही को भन्ने नीतिले भन्नुपर्छ।",
    possiblePathItems: [
      "Published threat model: on-device vs server responsibilities",
      "Pen-test results and citizen-safe update channel for the app",
      "Clear opt-in for each data pull used to pre-fill forms",
      "Helpdesk path when local cache is corrupted or replaced",
    ],
    possiblePathItemsNe: [
      "प्रकाशित खतरा नमूना: उपकरण बनाम सर्भर जिम्मेवारी",
      "पेन-टेस्ट र नागरिक सुरक्षित अद्यावधिक माध्यम",
      "पूर्व भर्न प्रयोग हुने प्रत्येक डेटा खिचाइमा स्पष्ट स्वीकृति",
      "स्थानीय क्यास बिग्रँदा वा बदलिँदा हेल्पडेस्क मार्ग",
    ],
    systemInsight:
      "“No central store” is a privacy promise that becomes a support nightmare unless backup and verification paths are designed upfront.",
    systemInsightNe:
      "«केन्द्रीय भण्डारण छैन» गोपनीयता वाचा हो — पूर्वाधार र प्रमाणन बाटो नबनाए सहयोग कोलाहल बन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ३१ (Nagarik App applications / local fill; scan Page 6)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ३१ (नागरिक एप आवेदन/स्थानीय भर्नु; स्क्यान पृष्ठ ६)",
    sourceExcerpt:
      "From scan (Page 6, घ): Nagarik App applications; Form Fill-up from Locally Stored or other-system data; no Centrally Data Store in the app; police report, passport, driving licence within 45 days.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ६ (घ): नागरिक एपबाट आवेदन; Locally Store वा अन्य प्रणालीबाट Form Fill-up; Centrally Data Store नगर्ने; प्रहरी प्रतिवेदन, राहदानी, चालक अनुमति पत्र ४५ दिनभित्र।",
    layer1: {
      hookEmoji: "📱",
      hook: "Apply from Nagarik App — local fill, no central hoard of your data.",
      hookNe: "नागरिक एपबाट आवेदन — स्थानीय भर्नु, केन्द्रमा थुप्रिनु छैन।",
      stakeLine: "Local-first shifts risk to millions of phones — threat model must be public.",
      stakeLineNe: "स्थानीय-पहिले जोखिम लाखौं फोनमा — खतरा नमूना सार्वजनिक हुनुपर्छ।",
      coreQuestionShort: "How is “no central store” proven in audits — and who owns incidents?",
      coreQuestionShortNe: "«केन्द्र भण्डारण छैन» लेखापरीक्षामा कसरी — घटना कोको?",
      coreQuestion:
        "How is local-only storage verified; what encryption and device checks apply; who runs incident response if data is exfiltrated?",
      coreQuestionNe:
        "स्थानीय भण्डारण कसरी प्रमाणित; कुन कूटलेखन र उपकरण जाँच; डेटा चुहियो भने घटना प्रतिक्रिया कोको?",
      quickScan: [
        {
          item: "Published threat model: on-device vs server responsibilities",
          itemNe: "प्रकाशित खतरा नमूना: उपकरण बनाम सर्भर जिम्मेवारी",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "45-day milestone: police report / passport / licence flows live in app",
          itemNe: "४५ दिन कोसेढुङ्गा: प्रहरी प्रतिवेदन/राहदानी/लाइसेन्स एपमा लाइभ",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Pen-test summary + secure update channel documented",
          itemNe: "पेन-टेस्ट सार + सुरक्षित अद्यावधिक माध्यम कागजात",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Per–data-pull opt-in UX implemented and logged",
          itemNe: "प्रति डेटा खिचाइ स्वीकृति UX लागू र लग",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "NPCS / Ministry of Communications and Information Technology (Nagarik App); Nepal Police; Department of Passport; Department of Transport Management; security auditors.",
      primaryOwnersNe:
        "NPCS/सञ्चार मन्त्रालय (नागरिक एप); नेपाल प्रहरी; राहदानी विभाग; यातायात व्यवस्थापन विभाग; सुरक्षा लेखापरीक्षक।",
      coordinatingOfficeEn:
        "Joint release train for 45-day services with shared API contracts.",
      coordinatingOfficeNe: "साझा API सम्झौतासहित ४५ दिन सेवाको संयुक्त रिलिज ट्रेन।",
      accountableRolesEn:
        "CISO-equivalent attests each release against published threat model.",
      accountableRolesNe:
        "CISO-समकक्ष प्रत्येक रिलिज प्रकाशित खतरा नमुनामा प्रमाणित।",
      timelineEn: "T+45 days: three application types live; T+90: incident playbooks exercised.",
      timelineNe: "T+४५ दिन: तीन आवेदन प्रकार लाइभ; T+९०: घटना प्लेबुक अभ्यास।",
      milestones: [
        {
          en: "Public security whitepaper for on-device storage and sync.",
          ne: "उपकरण भण्डारण र सिङ्कका लागि सार्वजनिक सुरक्षा श्वेतपत्र।",
        },
        {
          en: "Helpdesk runbook when local cache is corrupted or device replaced.",
          ne: "स्थानीय क्यास बिग्रँदा वा उपकरण बदलिँदा हेल्पडेस्क रनबुक।",
        },
        {
          en: "Post-release red-team on each new pre-fill integration.",
          ne: "प्रत्येक नयाँ पूर्व-भर्न जोडपछि रेड-टिम।",
        },
      ],
      kpis: [
        {
          metricEn: "Critical/high vulnerabilities open vs patched (per release)",
          metricNe: "गम्भीर/उच्च कमजोरी खुला बनाम प्याच (प्रति रिलिज)",
          howEn: "Vulnerability disclosure program + changelog.",
          howNe: "कमजोरी खुलासा कार्यक्रम + परिवर्तन सूची।",
        },
        {
          metricEn: "Successful applications via app vs web (three pilot services)",
          metricNe: "एप बनाम वेब सफल आवेदन (तीन पाइलट सेवा)",
          howEn: "Analytics export; monthly public summary.",
          howNe: "विश्लेषण निकासा; मासिक सार्वजनिक सार।",
        },
      ],
      risks: [
        {
          en: "Cloned apps and phishing — citizens sign on fake builds.",
          ne: "क्लोन एप र फिसिङ — नागरिक नक्कली बिल्डमा हस्ताक्षर।",
        },
        {
          en: "Support burden — “no central store” becomes “no one can help.”",
          ne: "सहयोग भार — «केन्द्र छैन» भने «कसैले मद्दत गर्दैन» बन्छ।",
        },
      ],
      escalation: [
        {
          en: "Security researchers disclose app issues under coordinated disclosure.",
          ne: "सुरक्षा अनुसन्धानकले समन्वयित खुलासामा एप समस्या।",
        },
        {
          en: "Share this point so local-first stays secure (#point-31).",
          ne: "स्थानीय-पहिले सुरक्षित राख्न साझेदारी गर्नुहोस् (#बुँदा-३१)।",
        },
      ],
      programStatusEn: "🟡 At risk — Nagarik App 45-day local-fill claims not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — नागरिक एप ४५ दिन स्थानीय भर्नु दाबी यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p32",
    pointNumber: 32,
    category: "Digital Governance & Data",
    promise:
      "Where physical presence is required to obtain a service after applying, within three months establish a system so citizens can take an appointment for a convenient date and time from among available slots, and provide services accordingly through citizen service centers or government bodies.",
    promiseNe:
      "आवेदन दिएको सेवा प्राप्त गर्न भौतिक रूपमा उपस्थित हुनुपर्ने अवस्था भएमा उपलब्ध मिति र समय मध्येबाट नागरिकलाई आफ्नो सुविधाको दिन र समयमा अपोइन्टमेन्ट लिन सक्ने व्यवस्था गरी सोही अनुसार नागरिक सेवा केन्द्र वा सरकारी निकाय मार्फत सेवा प्रवाह गर्ने व्यवस्था तीन महिनाभित्र मिलाउने।",
    question:
      "Will no-show and reschedule rules be published, how are same-day emergencies handled, and are walk-in quotas preserved for those without smartphones?",
    questionNe:
      "उपस्थित नभए र पुन:तालिकाको नियम प्रकाशित हुन्छ कि हुँदैन, आकस्मिक उही दिन कसरी, र स्मार्टफोनविहीनका लागि वॉक-इन कोटा जोगिन्छ?",
    whyThisMatters:
      "Appointments cut queues only if the booking system is fair, observable, and does not silently displace the most marginalized users.",
    whyThisMattersNe:
      "अपोइन्टमेन्टले लाइन कटाउँछ जब मात्र बुकिङ न्यायोचित, दृश्य र सबैभन्दा वञ्चितलाई निष्कासन गर्दैन।",
    possiblePathItems: [
      "Public metrics: average wait from booking to service",
      "Published fairness rules (elderly, disability priority)",
      "Offline or phone booking channel with audit trail",
      "Complaint path when slots are hoarded or resold",
    ],
    possiblePathItemsNe: [
      "सार्वजनिक मेट्रिक: बुकिङदेखि सेवासम्म औसत प्रतीक्षा",
      "प्रकाशित निष्पक्षता नियम (ज्येष्ठ, अपाङ्गता प्राथमिकता)",
      "अफलाइन वा फोन बुकिङ अनुगमन नै",
      "स्लट जम्मा वा पुन:बिक्रीमा उजुरी मार्ग",
    ],
    systemInsight:
      "Digital scheduling without published capacity is theater—the backend staffing model has to be visible.",
    systemInsightNe:
      "क्षमता नखुलेको डिजिटल तालिका नाटक हो — पछाडिको दरबन्दी मोडेल देखिनुपर्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ३२ (appointments for in-person service; scan Page 6)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ३२ (उपस्थित सेवाका लागि अपोइन्टमेन्ट; स्क्यान पृष्ठ ६)",
    sourceExcerpt:
      "From scan (Page 6, घ): if physical presence is needed after applying, appointment from available dates/times; service via citizen service center or government body; within three months.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ६ (घ): आवेदनपछि भौतिक उपस्थिति चाहिँदा उपलब्ध मिति/समयबाट अपोइन्टमेन्ट; नागरिक सेवा केन्द्र वा सरकारी निकाय मार्फत सेवा; तीन महिनाभित्र।",
    layer1: {
      hookEmoji: "📅",
      hook: "Book a slot — if capacity is secret, scheduling is theater.",
      hookNe: "स्लट बुक गर्नु — क्षमता गोप्य भए तालिका नाटक।",
      stakeLine: "Fair booking needs published staffing, walk-in quotas, and observable wait metrics.",
      stakeLineNe: "न्यायोचित बुकिङका लागि दरबन्दी, वॉक-इन कोटा र प्रतीक्षा मेट्रिक देखिनुपर्छ।",
      coreQuestionShort: "No-show rules, emergencies, smartphone-less citizens — all spelled out?",
      coreQuestionShortNe: "उपस्थित नभए, आकस्मिक, स्मार्टफोनविहीन — सबै स्पष्ट?",
      coreQuestion:
        "Are no-show and reschedule rules published; how are same-day emergencies handled; are walk-in quotas preserved?",
      coreQuestionNe:
        "उपस्थित नभए र पुन:तालिका नियम प्रकाशित; आकस्मिक उही दिन; वॉक-इन कोटा जोगिन्छ?",
      quickScan: [
        {
          item: "Three-month go-live: booking engine live at citizen service centres (%)",
          itemNe: "तीन महिना गो-लाइभ: नागरिक सेवा केन्द्रमा बुकिङ इन्जिन लाइभ %",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Published walk-in quota % and anti-scalping rules",
          itemNe: "वॉक-इन कोटा % र स्केल्पिङ विरुद्ध नियम प्रकाशित",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Public metrics: booking-to-service wait (median days)",
          itemNe: "सार्वजनिक मेट्रिक: बुकिङदेखि सेवासम्म प्रतीक्षा (मध्यक दिन)",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
        {
          item: "Phone/offline booking channel with audit trail",
          itemNe: "अनुगमन नैसहित फोन/अफलाइन बुकिङ",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "MoFAGA for CSC scheduling; line ministries for service-specific capacity; local governments operating CSCs.",
      primaryOwnersNe:
        "CSC तालिकाका लागि संघीय मामिला; सेवा अनुसार क्षमताका लागि मन्त्रालय; CSC सञ्चालन स्थानीय सरकार।",
      coordinatingOfficeEn:
        "National appointment registry with anti-fraud telemetry (slot hoarding alerts).",
      coordinatingOfficeNe: "स्लट जम्मा अलर्टसहित राष्ट्रिय अपोइन्टमेन्ट दर्ता।",
      accountableRolesEn:
        "CSC managers publish weekly fairness stats; investigations when scalping spikes.",
      accountableRolesNe:
        "CSC प्रबन्धकले हप्तामा निष्पक्षता तथ्य; स्केल्पिङ बढ्दा छानबिन।",
      timelineEn: "T+3 months: mandatory booking for listed in-person services; iterate on quotas.",
      timelineNe: "T+३ महिना: सूचीबद्ध उपस्थित सेवामा अनिवार्य बुकिङ; कोटा सुधार।",
      milestones: [
        {
          en: "Capacity model per office: slots tied to staff roster + service time.",
          ne: "प्रति कार्यालय क्षमता मोडेल: दरबन्दी र सेवा समयसँग स्लट।",
        },
        {
          en: "Priority rules for elderly and persons with disabilities published.",
          ne: "ज्येष्ठ र अपाङ्गताका लागि प्राथमिकता नियम प्रकाशन।",
        },
        {
          en: "Complaint path when slots are sold or hoarded.",
          ne: "स्लट बेचिँदा वा जम्मा हुँदा उजुरी मार्ग।",
        },
      ],
      kpis: [
        {
          metricEn: "No-show rate and slot utilization (monthly)",
          metricNe: "उपस्थित नभए दर र स्लट उपयोग (मासिक)",
          howEn: "Booking system export.",
          howNe: "बुकिङ प्रणाली निकासा।",
        },
        {
          metricEn: "Share of users booking via phone/offline vs app",
          metricNe: "फोन/अफलाइन बनाम एप बुकिङ प्रयोगकर्ता हिस्सा",
          howEn: "Channel analytics; published breakdown.",
          howNe: "च्यानल विश्लेषण; प्रकाशित विभाजन।",
        },
      ],
      risks: [
        {
          en: "Digital divide — rural users lose out to urban app users.",
          ne: "डिजिटल खाडल — ग्रामीण शहरी एप प्रयोगकर्ताभन्दा पछि।",
        },
        {
          en: "Hidden caps — “no slots” while touts sell queue positions.",
          ne: "लुकेको सीमा — स्लट छैन तर दलालले लाइन बेच्छन्।",
        },
      ],
      escalation: [
        {
          en: "Mystery shoppers test booking fairness across districts.",
          ne: "जिल्ला तिर रहस्यमय खरिददारले बुकिङ निष्पक्षता परीक्षण।",
        },
        {
          en: "Share this point so queues stay honest (#point-32).",
          ne: "लाइन ईमानदार राख्न साझेदारी गर्नुहोस् (#बुँदा-३२)।",
        },
      ],
      programStatusEn: "🟡 At risk — three-month appointment system proof not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — तीन महिने अपोइन्टमेन्ट प्रणाली प्रमाण यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p33",
    pointNumber: 33,
    category: "Digital Governance & Data",
    promise:
      "Shift from digital signatures that rely only on certificates toward e-signatures using the NID card, biometrics, or OTP so citizens can submit their particulars. Strengthen the physical and organizational capacity of the Department of National ID and Registration. Use the national ID (NID) number as the basis to roll out digital-signature authentication across citizen services; conduct a study coordinated by the Ministry of Home Affairs and submit a report to the Office of the Prime Minister and Council of Ministers within one month.",
    promiseNe:
      "डिजिटल हस्ताक्षर हाल प्रमाणपत्रको माध्यमबाट हुने गरेकोमा राष्ट्रिय परिचयपत्र (NID Card), बायोमेट्रिक वा OTP को प्रयोग गरी e-signature गरी नागरिकले आफ्नो विवरण बुझाउन सक्ने व्यवस्थातर्फ अग्रसर हुने। यसको लागि राष्ट्रिय परिचयपत्र तथा पञ्जीकरण विभागको भौतिक तथा साङ्गठनिक सुदृढीकरण गर्ने। राष्ट्रिय परिचयपत्र (NID) नम्बरलाई आधार बनाई नागरिकका सबै सेवाहरूमा डिजिटल हस्ताक्षरद्वारा प्रमाणीकरण प्रणाली लागू गर्न गृह मन्त्रालयको संयोजकत्वमा अध्ययन गरी एक महिनाभित्र प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालयमा प्रतिवेदन दिने।",
    question:
      "What legal equivalence is granted to OTP/biometric signatures, how are key compromise and impersonation cases investigated, and is NID verification latency measured at peak load?",
    questionNe:
      "OTP/बायोमेट्रिक हस्ताक्षरलाई कानुनीरूपमा के बराबर मानिन्छ, कुञ्जी सम्झौता र प्रतिरूपण छानबिन कसरी, र चरम लोडमा NID प्रमाणीकरण ढिलाइ मापिन्छ?",
    whyThisMatters:
      "E-signatures scale access, but they concentrate risk in identity infrastructure—failure modes must be public, not buried in vendor logs.",
    whyThisMattersNe:
      "इ-हस्ताक्षरले पहुँच बढाउँछ तर पहिचान पूर्वाधारमा जोखिम केन्द्रित हुन्छ — असफलता सार्वजिक हुनुपर्छ, विक्रेता लगमुनि होइन।",
    possiblePathItems: [
      "Public RFP criteria for e-sign and biometric vendors",
      "Independent red-team report on NID-linked signing",
      "Citizen revocation and re-issuance workflow if biometrics leak",
      "Court-admissible evidence standards published",
    ],
    possiblePathItemsNe: [
      "इ-हस्ताक्षर र बायोमेट्रिक विक्रेता छनोट सार्वजनिक मापदण्ड",
      "NID-जोडिएको हस्ताक्षरमा स्वतन्त्र रेड-टिम प्रतिवेदन",
      "बायोमेट्रिक चुहियो भने नागरिक खारेज/पुन:जारी कार्यप्रवाह",
      "अदालतमा स्वीकार्य प्रमाणको मानक प्रकाशन",
    ],
    systemInsight:
      "Linking every service to NID-based signing makes the civil registry the root of trust—its uptime becomes a constitutional issue.",
    systemInsightNe:
      "हरेक सेवालाई NID-आधारित हस्ताक्षरसँग जोड्दा नागरिक दर्ता विश्वासको जरो बन्छ — अपटाइम संवैधानिक प्रश्न बन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ३३ (e-sign via NID/OTP/biometric; NID dept; scan Pages 6–7)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ३३ (NID/OTP/बायोमेट्रिक इ-हस्ताक्षर; स्क्यान ६–७)",
    sourceExcerpt:
      "From scan (Pages 6–7, घ): from certificate-based digital signatures toward e-sign (NID card, biometric, OTP); strengthen NID & Registration Dept. (physical and organizational); NID-number-based authentication for citizen services; Home Ministry–coordinated study, report to PM office in one month.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ६–७ (घ): प्रमाणपत्रमुखीबाट NID Card/बायोमेट्रिक/OTP e-signature; परिचयपत्र विभाग भौतिक र साङ्गठनिक सुदृढ; NID नम्बर आधारित सेवा प्रमाणीकरण; गृह मन्त्रालय संयोजकत्व अध्ययन, एक महिनामा प्रधानमन्त्री कार्यालयमा प्रतिवेदन।",
    layer1: {
      hookEmoji: "✍️",
      hook: "E-sign with NID / OTP / biometrics — the civil registry becomes root of trust.",
      hookNe: "NID/OTP/बायोमेट्रिक इ-हस्ताक्षर — नागरिक दर्ता विश्वासको जरो।",
      stakeLine: "Scale access without publishing failure modes and you concentrate silent risk.",
      stakeLineNe: "असफलता सार्वजनिक नगरी पहुँच बढाउनु मौन जोखिम केन्द्रित गर्छ।",
      coreQuestionShort: "Legal weight of OTP signatures — and NID latency at peak load?",
      coreQuestionShortNe: "OTP हस्ताक्षरको कानुनी भार — चरम लोडमा NID ढिलाइ?",
      coreQuestion:
        "What legal equivalence for OTP/biometric signatures; how are compromise cases investigated; is NID latency measured at peak?",
      coreQuestionNe:
        "OTP/बायोमेट्रिक हस्ताक्षर कानुनीरूपमा के; सम्झौता छानबिन कसरी; चरम लोडमा NID ढिलाइ मापन?",
      quickScan: [
        {
          item: "One-month Home Ministry study: report filed to PMO and published (redacted OK)",
          itemNe: "एक महिना गृह अध्ययन: प्रधानमन्त्री कार्यालयमा पेश र प्रकाशित (लुकाइएको स्वीकार्य)",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Published legal equivalence for OTP / biometric vs certificate signatures",
          itemNe: "OTP/बायोमेट्रिक बनाम प्रमाणपत्र हस्ताक्षर कानुनी बराबर प्रकाशित",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "NID department capacity plan (queues, devices, staffing) public",
          itemNe: "NID विभाग क्षमता योजना (लाइन, उपकरण, दरबन्दी) सार्वजनिक",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Peak-load NID verification latency (p95) published",
          itemNe: "चरम लोडमा NID प्रमाणीकरण ढिलाइ (p९५) प्रकाशित",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Home Affairs (study lead); Department of National ID and Registration; Ministry of Law, Justice and Parliamentary Affairs; courts for evidence standards; OPMCM for report receipt.",
      primaryOwnersNe:
        "गृह मन्त्रालय (अध्ययन नेतृत्व); राष्ट्रिय परिचयपत्र तथा पञ्जीकरण विभाग; कानून मन्त्रालय; प्रमाण मानकका लागि अदालत; प्रतिवेदन प्रधानमन्त्री कार्यालय।",
      coordinatingOfficeEn:
        "National digital identity programme office with cross-ministry signing APIs.",
      coordinatingOfficeNe: "अन्तरमन्त्रालय हस्ताक्षर API सहित राष्ट्रिय डिजिटल पहिचान कार्यक्रम कार्यालय।",
      accountableRolesEn:
        "Attorney General office reviews admissibility of new signature types before rollout.",
      accountableRolesNe:
        "महान्यायाधिवक्ताले रोलआउट अघि नयाँ हस्ताक्षर प्रकार स्वीकार्यता समीक्षा।",
      timelineEn: "T+1 month: report to PMO; T+6 months: pilot e-sign on priority services; annual security review.",
      timelineNe: "T+१ महिना: प्रधानमन्त्री कार्यालयमा प्रतिवेदन; T+६ महिना: प्राथमिक सेवामा इ-हस्ताक्षर पाइलट; वार्षिक सुरक्षा समीक्षा।",
      milestones: [
        {
          en: "Public RFP criteria for e-sign and biometric infrastructure.",
          ne: "इ-हस्ताक्षर र बायोमेट्रिक पूर्वाधारका लागि सार्वजनिक RFP मापदण्ड।",
        },
        {
          en: "Citizen revocation workflow if biometrics leak or are misused.",
          ne: "बायोमेट्रिक चुहियो वा दुरुपयोग भए नागरिक खारेज कार्यप्रवाह।",
        },
        {
          en: "Independent red-team report on NID-linked signing published.",
          ne: "NID-जोडिएको हस्ताक्षरमा स्वतन्त्र रेड-टिम प्रतिवेदन प्रकाशन।",
        },
      ],
      kpis: [
        {
          metricEn: "Authentication success rate vs failures at peak (hourly)",
          metricNe: "चरममा प्रमाणीकरण सफलता बनाम असफलता (घण्टामा)",
          howEn: "NID platform logs; aggregated public dashboard.",
          howNe: "NID प्लेटफर्म लग; सार्वजनिक ड्यासबोर्ड।",
        },
        {
          metricEn: "Investigation closure time for impersonation / key compromise",
          metricNe: "प्रतिरूपण/कुञ्जी सम्झौता छानबिन टुङ्गो लाग्ने समय",
          howEn: "Cybercrime + NID dept case tracking.",
          howNe: "साइबर अपराध र NID विभाग मुद्दा ट्रयाक।",
        },
      ],
      risks: [
        {
          en: "Courts reject OTP signatures — services revert to paper chaos.",
          ne: "अदालतले OTP अस्वीकार — सेवा कागज अव्यवस्थामा फर्किन्छ।",
        },
        {
          en: "NID outage freezes all linked services — national standstill.",
          ne: "NID बन्दले सबै जोडिएको सेवा रोक्छ — राष्ट्रिय ठहर।",
        },
      ],
      escalation: [
        {
          en: "Bar association publishes guidance on evidentiary weight of e-signatures.",
          ne: "बार एसोसिएसनले इ-हस्ताक्षर प्रमाण भार मार्गदर्शन प्रकाशन।",
        },
        {
          en: "Share this point so e-sign stays trustworthy (#point-33).",
          ne: "इ-हस्ताक्षर विश्वसनीय राख्न साझेदारी गर्नुहोस् (#बुँदा-३३)।",
        },
      ],
      programStatusEn: "🟡 At risk — NID e-signature and one-month study proof not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — NID इ-हस्ताक्षर र एक महिना अध्ययन प्रमाण यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p34",
    pointNumber: 34,
    category: "Digital Governance & Data",
    promise:
      "Within 30 days, integrate into the existing integrated office management system tracking of how long a file remains at each desk, with alerts to higher authorities when prescribed time limits are exceeded.",
    promiseNe:
      "फाइल कुन टेबुलमा कति समय बस्यो भन्ने ट्रयाकिङ गर्ने र तोकिएको समय नाघेमा माथिल्लो अधिकारीलाई 'अलर्ट' जाने प्रणालीको उपयोग विद्यमान एकीकृत कार्यालय व्यवस्थापन प्रणालीमा ३० दिनभित्र गर्ने।",
    question:
      "What desk-level timestamps are immutable on the audit trail, can citizens see anonymized queue metrics for their application type, and who is sanctioned when alerts are ignored?",
    questionNe:
      "डेस्क स्तरको समय छाप अपरिवर्तनीय छ कि छैन, नागरिकले आवेदन प्रकारका लागि बेनाम मेट्रिक देख्छ, र अलर्ट बेवास्ता गर्दा कारबाही कोलाई?",
    whyThisMatters:
      "File tracking turns delay from folklore into data—if alerts are not enforced, the dashboard becomes wallpaper.",
    whyThisMattersNe:
      "फाइल ट्रयाकिङले ढिलाइ लोककथाबाट डेटामा बदल्छ — अलर्ट लागू नभए ड्यासबोर्ड पर्दा बन्छ।",
    possiblePathItems: [
      "Published SLA per service type and escalation ladder",
      "Monthly leak report: offices breaching time limits most",
      "Integration with anti-broker hotlines where delay correlates with bribes",
      "Appeal when timestamps are disputed",
    ],
    possiblePathItemsNe: [
      "सेवा प्रकार प्रति प्रकाशित SLA र उचालन सीढी",
      "मासिक चुहावट प्रतिवेदन: समय नाघ्ने कार्यालय",
      "ढिलाइ र घूस उच्च जोडिएमा बिचौलिया हटलाइन जोड",
      "समय छाप विवादमा पुनरावेदन",
    ],
    systemInsight:
      "Alerts without consequences train managers to click through—tie breach rates to performance reviews or funding.",
    systemInsightNe:
      "परिणामविहीन अलर्टले प्रबन्धकलाई क्लिक गर्न सिकाउँछ — उल्लंघन दर जिम्मेवारी वा बजेटसँग जोड्नुहोस्।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ३४ (file dwell time & alerts in IOMS; scan Page 7)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ३४ (IOMS मा फाइल बसाइ र अलर्ट; स्क्यान पृष्ठ ७)",
    sourceExcerpt:
      "From scan (Page 7, घ): within 30 days, use the existing integrated office management system to track how long a file stays at each desk; if the set time is exceeded, an ‘alert’ goes to the senior authority.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ७ (घ): विद्यमान एकीकृत कार्यालय व्यवस्थापन प्रणालीमा ३० दिनभित्र — टेबुल बसाइ ट्रयाक, तोकिएको समय नाघे माथिल्लो अधिकारीलाई 'अलर्ट'।",
    layer1: {
      hookEmoji: "⏲️",
      hook: "Know how long a file sat on each desk — and alert when time is blown.",
      hookNe: "फाइल कति बेर कुन डेस्कमा — समय नाघे अलर्ट।",
      stakeLine: "If timestamps can be edited, “tracking” is just a prettier delay.",
      stakeLineNe: "समय छाप मिलाउन मिल्यो भने «ट्रयाकिङ» ढिलाइ नै सिर्फ सुन्दर।",
      coreQuestionShort: "Immutable audit trail — and consequences when alerts are ignored?",
      coreQuestionShortNe: "अपरिवर्तनीय लेखा — अलर्ट बेवास्ता गर्दा परिणाम?",
      coreQuestion:
        "Which desk timestamps are immutable; can citizens see queue metrics; who is sanctioned when alerts are ignored?",
      coreQuestionNe:
        "कुन डेस्क समय अपरिवर्तनीय; नागरिकले लाइन मेट्रिक देख्छ; अलर्ट बेवास्ता गर्दा कारबाही कोलाई?",
      quickScan: [
        {
          item: "30-day integration: dwell time per desk live in production IOMS",
          itemNe: "३० दिन जोड: उत्पादन IOMS मा प्रति डेस्क बसाइ लाइभ",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Alerts to higher authority when SLA exceeded — with escalation log",
          itemNe: "SLA नाघे माथिल्लो अधिकारीलाई अलर्ट — उचालन लगसहित",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Immutable audit trail (who changed timestamps — third-party attestation)",
          itemNe: "अपरिवर्तनीय लेखा (समय कसले बदल्यो — तेस्रो पक्ष प्रमाणन)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Published sanctions when alerts are repeatedly ignored",
          itemNe: "अलर्ट बारम्बार बेवास्ता गर्दा प्रकाशित कारबाही",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "MoFAGA for IOMS; ministry IT units; internal audit; anti-corruption bodies for alert enforcement.",
      primaryOwnersNe:
        "IOMS का लागि संघीय मामिला; मन्त्रालय IT; आन्तरिक लेखापरीक्षा; अलर्ट कार्यान्वयन भ्रष्टाचार निरोधक।",
      coordinatingOfficeEn:
        "Central file-flow analytics with breach leaderboard by office and service.",
      coordinatingOfficeNe: "कार्यालय र सेवाअनुसार उल्लंघन लिडरबोर्डसहित केन्द्रीय फाइल प्रवाह विश्लेषण।",
      accountableRolesEn:
        "Heads of office tied to alert response times in performance agreements.",
      accountableRolesNe:
        "कार्यालय प्रमुखको प्रदर्शन सम्झौतामा अलर्ट प्रतिक्रिया समय जोडिएको।",
      timelineEn: "T+30 days: dwell tracking + alerts live; quarterly: leak reports for chronic delay offices.",
      timelineNe: "T+३० दिन: बसाइ ट्रयाक र अलर्ट लाइभ; त्रैमासिक: दीर्घ ढिलाइ कार्यालय चुहावट प्रतिवेदन।",
      milestones: [
        {
          en: "Publish SLA per service type and escalation ladder.",
          ne: "सेवा प्रकार प्रति SLA र उचालन सीढी प्रकाशन।",
        },
        {
          en: "Integration with grievance hotlines when delay correlates with broker complaints.",
          ne: "ढिलाइ र बिचौलिया उजुरी जोडिएमा बिचौलिया हटलाइन जोड।",
        },
        {
          en: "Appeal when citizen disputes timestamp accuracy.",
          ne: "नागरिकले समय छाप छान्दा पुनरावेदन।",
        },
      ],
      kpis: [
        {
          metricEn: "Mean desk dwell time vs SLA (by service)",
          metricNe: "डेस्क औसत बसाइ बनाम SLA (सेवाअनुसार)",
          howEn: "System export; sample audit.",
          howNe: "प्रणाली निकासा; नमूना लेखापरीक्षा।",
        },
        {
          metricEn: "% of alerts acknowledged within 24h / resolved within 7d",
          metricNe: "२४ घण्टामा स्वीकृत / ७ दिनमा समाधान अलर्ट %",
          howEn: "Ticketing linked to IOMS alerts.",
          howNe: "IOMS अलर्टसँग जोडिएको टिकटिङ।",
        },
      ],
      risks: [
        {
          en: "Click-through culture — managers acknowledge without fixing.",
          ne: "क्लिक संस्कृति — प्रबन्धकले स्वीकार गर्छ, सुधाउँदैन।",
        },
        {
          en: "Gaming timestamps — backdated entries after media pressure.",
          ne: "समय खेल — मिडिया दबाबपछि पछाडि मिति।",
        },
      ],
      escalation: [
        {
          en: "Citizen compares timestamps with receipt photos — expose mismatches.",
          ne: "नागरिकले समय छाप रसिद फोटो तुलना — मेल नखाने उजागर।",
        },
        {
          en: "Share this point so file tracking stays enforceable (#point-34).",
          ne: "फाइल ट्रयाकिङ कार्यान्वयनयोग्य राख्न साझेदारी गर्नुहोस् (#बुँदा-३४)।",
        },
      ],
      programStatusEn: "🟡 At risk — 30-day file dwell and alert proof not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ३० दिन फाइल बसाइ र अलर्ट प्रमाण यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p35",
    pointNumber: 35,
    category: "Digital Governance & Data",
    promise:
      "Within 15 days, arrange for citizens to download certificates through official mobile apps (such as the Nagarik App) or by email.",
    promiseNe:
      "प्रमाणपत्रहरू नागरिकले आधिकारिक मोबाइल एप/नागरिक एप वा इमेलमा डाउनलोड गर्न मिल्ने व्यवस्था १५ दिनभित्र मिलाउने।",
    question:
      "What file format, digital seal, and verification URL are embedded, and how are re-issues and revocations published for employers and banks?",
    questionNe:
      "कुन फाइल ढाँचा, डिजिटल छाप र प्रमाणित URL छ, र रोजगारदाता र बैंकका लागि पुन:जारी र खारेज कहाँ प्रकाशित?",
    whyThisMatters:
      "Downloadable certificates only beat photocopies if verification is one click away for every verifier.",
    whyThisMattersNe:
      "डाउनलोड प्रमाणपत्र फोटोकपीभन्दा माथि त जब प्रमाणीकरण प्रत्येक प्रमाणितकर्ताका लागि एक क्लिकमा।",
    possiblePathItems: [
      "QR or signed JSON with online validation API",
      "Revocation list updated in near real time",
      "Accessibility: screen-reader friendly download receipts",
      "Helpdesk for employers when verification fails",
    ],
    possiblePathItemsNe: [
      "अनलाइन प्रमाणित API सहित QR वा हस्ताक्षरित JSON",
      "नजिकै वास्तविक समयमा खारेज सूची",
      "पहुँच: स्क्रिन-रीडर मैत्री डाउनलोड रसिद",
      "प्रमाणन असफल भए रोजगारदाता हेल्पडेस्क",
    ],
    systemInsight:
      "Fifteen days is aggressive—if crypto signing pipelines are not ready, you will ship insecure PDFs and call it reform.",
    systemInsightNe:
      "पन्ध्र दिन आक्रामक — कूट साइनिङ तयार नभए असुरक्षित PDF सुधार भनिन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ३५ (download certificates via app/email; scan Page 7)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ३५ (एप/इमेलबाट प्रमाणपत्र डाउनलोड; स्क्यान पृष्ठ ७)",
    sourceExcerpt:
      "From scan (Page 7, घ): within 15 days, arrange for citizens to download certificates via official mobile app / Nagarik App or email.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ७ (घ): १५ दिनभित्र प्रमाणपत्रहरू आधिकारिक मोबाइल एप/नागरिक एप वा इमेलमा 'डाउनलोड' गर्न मिल्ने व्यवस्था।",
    layer1: {
      hookEmoji: "📥",
      hook: "Certificates in app or email 15 days — beats the queue if verification is one click.",
      hookNe: "१५ दिनमा एप वा इमेल प्रमाणपत्र — प्रमाणन एक क्लिक भए लाइन जित्छ।",
      stakeLine: "Unsigned PDFs are not reform — they are fakeables with a download button.",
      stakeLineNe: "हस्ताक्षरविहीन PDF सुधार होइन — डाउनलोड बटन भएको नक्कल।",
      coreQuestionShort: "QR, seal, verification URL — live for employers and banks?",
      coreQuestionShortNe: "QR, छाप, प्रमाणित URL — रोजगारदाता र बैंकका लागि लाइभ?",
      coreQuestion:
        "What format, digital seal, and verification URL are embedded; how are re-issue and revocation published for verifiers?",
      coreQuestionNe:
        "कुन ढाँचा, डिजिटल छाप र प्रमाणित URL; पुन:जारी र खारेज प्रमाणकर्ताका लागि कसरी प्रकाशित?",
      quickScan: [
        {
          item: "15-day go-live: downloadable certs for listed types (API + QR verify)",
          itemNe: "१५ दिन गो-लाइभ: सूचीबद्ध प्रकार डाउनलोड गर्न मिल्ने (API+QR प्रमाणन)",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Near–real-time revocation list + verification endpoint",
          itemNe: "नजिकै वास्तविक समय खारेज सूची + प्रमाणन बिन्दु",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Employer/bank verification guide published (what to trust)",
          itemNe: "रोजगारदाता/बैंक प्रमाणन मार्गदर्शन प्रकाशित (के विश्वास गर्ने)",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Accessibility: screen-reader friendly download receipts",
          itemNe: "पहुँच: स्क्रिन-रीडर मैत्री डाउनलोड रसिद",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "NPCS / Ministry of Communications and Information Technology; National ID Department; line ministries issuing certificates; Nepal Rastra Bank for bank acceptance criteria.",
      primaryOwnersNe:
        "NPCS/सञ्चार मन्त्रालय; राष्ट्रिय परिचयपत्र विभाग; प्रमाणपत्र जारी मन्त्रालय; बैंक स्वीकृति मापदण्डका लागि नेपाल राष्ट्र बैंक।",
      coordinatingOfficeEn:
        "National certificate authority with signed PDF pipeline, CRL/OCSP, and public verify portal.",
      coordinatingOfficeNe: "हस्ताक्षरित PDF, CRL/OCSP र सार्वजनिक प्रमाणन पोर्टलसहित राष्ट्रिय प्रमाणपत्र प्राधिकरण।",
      accountableRolesEn:
        "Crypto signing keys under HSM policy; dual control; quarterly penetration test.",
      accountableRolesNe:
        "HSM नीतिमा कूटो हस्ताक्षर कुञ्जी; दोहोरो नियन्त्रण; त्रैमासिक पेनिट्रेसन परीक्षण।",
      timelineEn: "T+15 days: first services with signed downloads; T+30: employer verification pilots; ongoing revocation.",
      timelineNe: "T+१५ दिन: पहिलो सेवा हस्ताक्षरित डाउनलोड; T+३०: रोजगारदाता प्रमाणन पाइलट; निरन्तर खारेज।",
      milestones: [
        {
          en: "Publish certificate format, hash algorithm, and signature chain.",
          ne: "प्रमाणपत्र ढाँचा, ह्यास अल्गोरिदम र हस्ताक्षर श्रृङ्खला प्रकाशन।",
        },
        {
          en: "Employer helpdesk when verification fails (SLA).",
          ne: "प्रमाणन असफल भए रोजगारदाता हेल्पडेस्क (SLA)।",
        },
        {
          en: "Incident response if private keys are compromised.",
          ne: "निजी कुञ्जी सम्झौता भए घटना प्रतिक्रिया।",
        },
      ],
      kpis: [
        {
          metricEn: "Verification success rate (%) vs failed lookups",
          metricNe: "प्रमाणन सफलता % बनाम असफल खोज",
          howEn: "API logs; public aggregate.",
          howNe: "API लग; सार्वजनिक कुल।",
        },
        {
          metricEn: "Median time to revoke after fraud report",
          metricNe: "ठगी प्रतिवेदनपछि खारेज मध्यक समय",
          howEn: "Revocation ticket queue.",
          howNe: "खारेज टिकट लाइन।",
        },
      ],
      risks: [
        {
          en: "15-day deadline ships insecure PDFs — mass fraud risk.",
          ne: "१५ दिन म्यादले असुरक्षित PDF — ठूलो ठगी जोखिम।",
        },
        {
          en: "Banks reject downloads — citizens still queue for paper.",
          ne: "बैंकले डाउनलोड अस्वीकार — नागरिक अझै कागज लाइन।",
        },
      ],
      escalation: [
        {
          en: "Chamber of commerce tests verification across member employers.",
          ne: "व्यापार संघले सदस्य रोजगारदातामा प्रमाणन परीक्षण।",
        },
        {
          en: "Share this point so digital certs beat photocopies (#point-35).",
          ne: "डिजिटल प्रमाणपत्र फोटोकपीभन्दा माथि भनि साझेदारी गर्नुहोस् (#बुँदा-३५)।",
        },
      ],
      programStatusEn: "🔴 No evidence on file — 15-day signed certificate download pipeline not publicly verified here.",
      programStatusNe: "🔴 प्रमाण दर्ता छैन — १५ दिन हस्ताक्षरित प्रमाणपत्र डाउनलोड पाइपलाइन यहाँ प्रमाणित छैन।",
    },
  },
  {
    id: "p36",
    pointNumber: 36,
    category: "Digital Governance & Data",
    promise:
      "With the objective of making public service delivery fully digital, one-door, and interconnected, establish the “National Integrated Digital Governance Platform” and implement the digital governance blueprint. Under this, apply the principle of submitting each detail only once, unify services, data, and systems of government at all levels, and begin—within 100 days—establishing and operating a National Data Exchange Platform anchored on digital public infrastructure.",
    promiseNe:
      "सार्वजनिक सेवा प्रवाहलाई पूर्ण रूपमा डिजिटल, एकद्वार र अन्तरआबद्ध प्रणालीमा रूपान्तरण गर्ने उद्देश्यले «राष्ट्रिय एकीकृत डिजिटल शासन प्लेटफर्म» स्थापना गरी डिजिटल गभर्नेन्स ब्लुप्रिन्ट कार्यान्वयन गर्ने। यस अन्तर्गत «एउटा विवरण एकपटकमात्र बुझाउने» सिद्धान्त अवलम्बन गर्दै सबै तहका सरकारका सेवा, डाटा र प्रणालीहरूलाई एकीकृत गरी डिजिटल सार्वजनिक पूर्वाधारमा आधारित राष्ट्रिय डाटा एक्सचेन्ज प्लेटफर्म स्थापना तथा सञ्चालनको कार्य १०० दिनभित्र प्रारम्भ गर्ने।",
    question:
      "What is the minimum interoperable API set on day one, which legacy systems must connect first, and how is citizen consent propagated across the exchange?",
    questionNe:
      "पहिलो दिन न्यूनतम अन्तरसञ्चालन API के, कुन विरासत प्रणाली पहिले जोडिन्छ, र एक्सचेन्जमा नागरिक सहमति कसरी सर्छ?",
    whyThisMatters:
      "A national exchange is where federalism meets data—without governance, it becomes the biggest breach surface in the country.",
    whyThisMattersNe:
      "राष्ट्रिय एक्सचेन्जमा संघीयता र डेटा भेटिन्छ — शासन बिना देशको सबैभन्दा ठूलो उल्लंघन सतह बन्छ।",
    possiblePathItems: [
      "Architecture diagram and trust boundaries published",
      "Data minimization catalog per service",
      "Incident response runbooks shared with provinces",
      "Load tests with published RTO/RPO",
    ],
    possiblePathItemsNe: [
      "वास्तुचित्र र विश्वास सीमा प्रकाशन",
      "सेवा प्रति न्यूनतम डेटा सूची",
      "प्रदेशसँग घटना प्रतिक्रिया रनबुक",
      "RTO/RPO सहित लोड परीक्षण प्रकाशन",
    ],
    systemInsight:
      "“Start in 100 days” should mean contracts signed and schemas frozen—not a ribbon-cutting for a slide deck.",
    systemInsightNe:
      "«१०० दिनमा सुरु» भनेको स्लाइडको रिबन होइन — सम्झौता र स्किमा स्थिर।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ३६ (National Integrated Digital Governance Platform & data exchange; scan Page 7)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ३६ (राष्ट्रिय एकीकृत डिजिटल शासन प्लेटफर्म र डेटा एक्सचेन्ज; स्क्यान पृष्ठ ७)",
    sourceExcerpt:
      "From scan (Page 7, घ): National Integrated Digital Governance Platform; digital governance blueprint; “submit details only once”; unify services, data, and systems; begin National Data Exchange Platform within 100 days on digital public infrastructure.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ७ (घ): राष्ट्रिय एकीकृत डिजिटल शासन प्लेटफर्म; डिजिटल गभर्नेन्स ब्लुप्रिन्ट; एकपटकमात्र विवरण; सेवा/डाटा/प्रणाली एकीकरण; १०० दिनभित्र डिजिटल सार्वजनिक पूर्वाधारमा आधारित डाटा एक्सचेन्ज प्रारम्भ।",
    layer1: {
      hookEmoji: "🌐",
      hook: "One national platform — and a Data Exchange that actually starts in 100 days.",
      hookNe: "एउटा राष्ट्रिय प्लेटफर्म — र १०० दिनमै सुरु हुने डेटा एक्सचेन्ज।",
      stakeLine: "Without frozen APIs and consent plumbing, “exchange” is a slide deck.",
      stakeLineNe: "API र सहमति पाइप नजमाए «एक्सचेन्ज» स्लाइड मात्र।",
      coreQuestionShort: "Day-one API set, legacy order, consent propagation — where’s the proof?",
      coreQuestionShortNe: "पहिलो दिन API, विरासत क्रम, सहमति सर्ने बाटो — प्रमाण कहाँ?",
      coreQuestion:
        "What minimum interoperable APIs go live on day one; which legacy systems connect first; how is citizen consent propagated across the exchange?",
      coreQuestionNe:
        "पहिलो दिन कुन न्यूनतम अन्तरसञ्चालन API; कुन विरासत पहिले; एक्सचेन्जमा नागरिक सहमति कसरी सर्छ?",
      quickScan: [
        {
          item: "Published blueprint: National Digital Governance Platform scope + milestones",
          itemNe: "प्रकाशित ब्लुप्रिन्ट/खाका: राष्ट्रिय डिजिटल शासन प्लेटफर्म दायरा र कोसेढुङ्गा",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "National Data Exchange: contracts signed, schemas frozen (100-day “start”)",
          itemNe: "राष्ट्रिय डेटा एक्सचेन्ज: सम्झौता, स्किमा स्थिर (१०० दिन «सुरु»)",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Minimum API catalogue + trust boundaries (federal / province / local)",
          itemNe: "न्यूनतम API सूची र विश्वास सीमा (संघ/प्रदेश/स्थानीय)",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Consent propagation design published (token / purpose / retention)",
          itemNe: "सहमति सर्ने डिजाइन प्रकाशित (टोकन/उद्देश्य/प्रतिधारण)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of the Prime Minister and Council of Ministers (program sponsor); Ministry of Communications and Information Technology; MoFAGA; NPCS; provinces and local governments for tier connections.",
      primaryOwnersNe:
        "कार्यक्रम प्रायोजक प्रधानमन्त्री कार्यालय; सञ्चार मन्त्रालय; संघीय मामिला; NPCS; तह जोडका लागि प्रदेश र स्थानीय।",
      coordinatingOfficeEn:
        "Program management office for NDGP + NDE with integrated roadmap and risk register.",
      coordinatingOfficeNe: "NDGP र NDE का लागि एकीकृत रोडम्याप र जोखिम दर्तासहित कार्यक्रम कार्यालय।",
      accountableRolesEn:
        "Steering committee minutes public; independent architecture review before go-live.",
      accountableRolesNe:
        "संचालक समिति मिनेट सार्वजनिक; गो-लाइभ अघि स्वतन्त्र वास्तु समीक्षा।",
      timelineEn: "T+100 days: exchange operational start (defined); Y1: connect priority legacy systems; ongoing: consent + DPIA.",
      timelineNe: "T+१०० दिन: एक्सचेन्ज सञ्चालन सुरु (परिभाषित); Y१: प्राथमिक विरासत जोड; निरन्तर: सहमति र DPIA।",
      milestones: [
        {
          en: "Signed inter-agency data-sharing agreements with legal basis.",
          ne: "कानुनी आधारसहित अन्तरनिकाय डेटा साझेदारी सम्झौता हस्ताक्षर।",
        },
        {
          en: "Load tests with published RTO/RPO before production traffic.",
          ne: "उत्पादन ट्राफिक अघि RTO/RPO सहित लोड परीक्षण प्रकाशन।",
        },
        {
          en: "Incident response runbooks shared with provinces and tested in tabletop.",
          ne: "प्रदेशसँग घटना रनबुक र टेबलटप परीक्षण।",
        },
      ],
      kpis: [
        {
          metricEn: "APIs in production / target API catalogue (%)",
          metricNe: "उत्पादनमा API / लक्ष्य सूची (%)",
          howEn: "Exchange registry; monthly scorecard.",
          howNe: "एक्सचेन्ज दर्ता; मासिक स्कोरकार्ड।",
        },
        {
          metricEn: "Cross-tier transactions with valid consent tokens (daily volume)",
          metricNe: "वैध सहमति टोकनसहित तहबीच लेनदेन (दैनिक)",
          howEn: "Exchange telemetry; sampled audit.",
          howNe: "एक्सचेन्ज टेलिमेट्री; नमूना लेखापरीक्षा।",
        },
      ],
      risks: [
        {
          en: "Federalism tension — provinces refuse central data pipes.",
          ne: "संघीयता तनाव — प्रदेशले केन्द्रीय डेटा पाइप अस्वीकार।",
        },
        {
          en: "Big-bang integration — outage cascades across government.",
          ne: "एकैचोटी जोड — सरकारभर क्यास्केड बन्द।",
        },
      ],
      escalation: [
        {
          en: "Parliamentary IT committee reviews quarterly integration scorecard.",
          ne: "संसदीय IT समितिले त्रैमासिक जोड स्कोरकार्ड समीक्षा।",
        },
        {
          en: "Share this point so the exchange stays real (#point-36).",
          ne: "एक्सचेन्ज वास्तविक राख्न साझेदारी गर्नुहोस् (#बुँदा-३६)।",
        },
      ],
      programStatusEn: "🟡 At risk — NDGP / National Data Exchange 100-day start not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — NDGP/राष्ट्रिय डेटा एक्सचेन्ज १०० दिन सुरु यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p37",
    pointNumber: 37,
    category: "Digital Governance & Data",
    promise:
      "To enable citizens to receive all services easily through one digital platform, end duplication in service delivery, increase transparency, and significantly reduce time and cost, formulate policies and laws on digital governance and personal data protection within 60 days.",
    promiseNe:
      "नागरिकले एउटै डिजिटल प्लेटफर्ममार्फत सबै सेवा सहज रूपमा प्राप्त गर्न सक्ने व्यवस्था मिलाउन, सेवा प्रवाहमा दोहोरोपनको अन्त्य गर्न, पारदर्शिता अभिवृद्धि गर्न तथा समय र लागत उल्लेख्य रूपमा घटाउन डिजिटल गभर्नेन्स र व्यक्तिगत डाटा संरक्षणसम्बन्धी नीति तथा कानूनको तर्जुमा ६० दिनभित्र गर्ने।",
    question:
      "Will draft texts be published for comment, how do they align with fundamental rights and sector regulators, and what independent oversight body is proposed?",
    questionNe:
      "मस्यौदा टिप्पणीका लागि प्रकाशित हुन्छ, मौलिक अधिकार र क्षेत्रीय नियामकसँग कसरी मिल्छ, र स्वतन्त्र निगरानी निकाय के प्रस्ताव?",
    whyThisMatters:
      "Sixty days for both digital governance and privacy law is ambitious—quality risk is real if consultation is cosmetic.",
    whyThisMattersNe:
      "डिजिटल शासन र गोपनीयता दुवै ६० दिनमा महत्वाकांक्षी — परामर्श सजावट भए गुण जोखिम।",
    possiblePathItems: [
      "Published comparative matrix with international models",
      "Impact assessment on SMEs and local governments",
      "Explicit lawful basis list for data processing",
      "Whistleblower protections for data breaches",
    ],
    possiblePathItemsNe: [
      "अन्तर्राष्ट्रिय नमूनासँग तुलनात्मक मैट्रिक्स प्रकाशन",
      "साना उद्यम र स्थानीय सरकारमा प्रभाव मूल्याङ्कन",
      "डेटा प्रक्रियाका लागि स्पष्ट कानुनी आधार सूची",
      "डेटा उल्लंघनमा उजागरकर्ता सुरक्षा",
    ],
    systemInsight:
      "Data protection law is not an IT annex—it should define rights first and vendor contracts second.",
    systemInsightNe:
      "डेटा संरक्षण कानुन IT परिशिष्ट होइन — पहिले अधिकार, अनि विक्रेता सम्झौता।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ३७ (digital governance & personal data law; scan Page 7)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ३७ (डिजिटल गभर्नेन्स र व्यक्तिगत डेटा कानुन; स्क्यान पृष्ठ ७)",
    sourceExcerpt:
      "From scan (Page 7, घ): within 60 days, formulate policy and law on digital governance and personal data protection (one digital platform, end duplication, transparency, cut time and cost).",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ७ (घ): ६० दिनमा डिजिटल गभर्नेन्स र व्यक्तिगत डाटा संरक्षण नीति/कानुन (एकै प्लेटफर्म, दोहोरोपन अन्त्य, पारदर्शिता, समय/लागत घटाउने)।",
    layer1: {
      hookEmoji: "⚖️",
      hook: "Digital governance + data protection law in 60 days — ambition vs. consultation quality.",
      hookNe: "६० दिनमा डिजिटल शासन र डेटा संरक्षण कानुन — महत्वाकांक्षा बनाम परामर्श गुणस्तर।",
      stakeLine: "Rushed law can harmonize the stack — or bury citizens in conflicting articles.",
      stakeLineNe: "हतार कानुनले थाक मिलाउँछ — वा नागरिकलाई विरोधाभासी धारामा पुर्याउँछ।",
      coreQuestionShort: "Drafts for comment, rights alignment, independent oversight — where?",
      coreQuestionShortNe: "टिप्पणीका लागि मस्यौदा, अधिकार मिलान, स्वतन्त्र निगरानी — कहाँ?",
      coreQuestion:
        "Will draft texts be published for comment; how do they align with fundamental rights and sector regulators; what independent oversight is proposed?",
      coreQuestionNe:
        "मस्यौदा टिप्पणीका लागि प्रकाशित हुन्छ; मौलिक अधिकार र नियामकसँग कसरी मिल्छ; स्वतन्त्र निगरानी के प्रस्ताव?",
      quickScan: [
        {
          item: "Public consultation window + chapter-wise comment portal (60-day track)",
          itemNe: "सार्वजनिक परामर्श खिडकी + अध्यायअनुसार टिप्पणी पोर्टल (६० दिन ट्रयाक)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Consolidated roadmap vs cybercrime, privacy, procurement laws (overlap map)",
          itemNe: "साइबर, गोपनीयता, खरिद कानुनसँग एकीकृत रोडम्याप (द्वन्द्व नक्सा)",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
        {
          item: "Proposed independent DPA or equivalent — mandate + budget line",
          itemNe: "प्रस्तावित स्वतन्त्र DPA वा समकक्ष — जिम्मेवारी + बजेट शीर्षक",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Published DPIA template for major data-processing programs",
          itemNe: "ठूलो डेटा प्रक्रियाका लागि प्रकाशित DPIA ढाँचा",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Communications and Information Technology (often drafting lead); Ministry of Law, Justice and Parliamentary Affairs; Office of the Prime Minister for coordination; NPCS for technical input.",
      primaryOwnersNe:
        "मस्यौदा नेतृत्व प्रायः सञ्चार मन्त्रालय; कानून मन्त्रालय; समन्वय प्रधानमन्त्री कार्यालय; प्राविधिक योगदान NPCS।",
      coordinatingOfficeEn:
        "Inter-ministerial drafting cell with published meeting minutes and version control.",
      coordinatingOfficeNe: "प्रकाशित मिनेट र संस्करण नियन्त्रणसहित अन्तरमन्त्रालय मस्यौदा कोठा।",
      accountableRolesEn:
        "Named drafting chair; monthly public progress note even if draft slips.",
      accountableRolesNe:
        "नामित मस्यौदा अध्यक्ष; मस्यौदा ढिलो भए पनि मासिक सार्वजनिक प्रगति।",
      timelineEn: "T+60 days: draft bills for tabling or publication; parallel: 30-day minimum consultation if released earlier.",
      timelineNe: "T+६० दिन: पेश वा प्रकाशनका लागि मस्यौदा; समानान्तर: अघि जारी भए कम्ती ३० दिन परामर्श।",
      milestones: [
        {
          en: "Comparative matrix with GDPR / regional models published with rationale.",
          ne: "GDPR/क्षेत्रीय नमूनासँग तुलनात्मक मैट्रिक्स र औचित्य प्रकाशन।",
        },
        {
          en: "Sector regulator alignment workshops (telecom, health, finance).",
          ne: "क्षेत्रीय नियामक मिलान कार्यशाला (दूरसञ्चार, स्वास्थ्य, वित्त)।",
        },
        {
          en: "Whistleblower and breach-notification articles with clear timelines.",
          ne: "उजागरकर्ता र उल्लंघन सूचना धारा स्पष्ट समयसीमासहित।",
        },
      ],
      kpis: [
        {
          metricEn: "Public comments received / responses incorporated (summary)",
          metricNe: "प्राप्त सार्वजनिक टिप्पणी / समावेश सार",
          howEn: "Consultation portal export.",
          howNe: "परामर्श पोर्टल निकासा।",
        },
        {
          metricEn: "Legal conflict count vs resolved (tracked in roadmap)",
          metricNe: "कानुनी द्वन्द्व संख्या बनाम समाधान (रोडम्यापमा)",
          howEn: "Legislative drafter spreadsheet; public reconciliation note.",
          howNe: "विधायी दर्ता स्प्रेडसिट; सार्वजनिक मिलान टिप्पणी।",
        },
      ],
      risks: [
        {
          en: "Calendar-driven drafting — weak consultation becomes box-ticking.",
          ne: "पात्रोले चलाएको मस्यौदा — कमजोर परामर्च चेकबक्स मात्र।",
        },
        {
          en: "Overlapping laws — citizens face three regimes for one dataset.",
          ne: "दोहोरो कानुन — एउटै डेटाका लागि तीन शासन।",
        },
      ],
      escalation: [
        {
          en: "CSO coalition publishes scorecard on consultation quality.",
          ne: "नागरिक समाज गठबन्धनले परामर्श गुणस्तर स्कोरकार्ड।",
        },
        {
          en: "Share this point so law-making stays open (#point-37).",
          ne: "कानुन निर्माण खुला राख्न साझेदारी गर्नुहोस् (#बुँदा-३७)।",
        },
      ],
      programStatusEn: "🟡 At risk — 60-day digital governance & data law package not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ६० दिन डिजिटल शासन र डेटा कानुन प्याकेज यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p38",
    pointNumber: 38,
    category: "Digital Governance & Data",
    promise:
      "Within 60 days, complete the legal and institutional arrangements needed to establish an independent regulatory authority (Independent Regulatory Authority) that will formulate rules and regulate matters related to information technology and digital governance.",
    promiseNe:
      "सूचना प्रविधि तथा डिजिटल गभर्नेन्स सम्बन्धी नियम बनाउने र नियमन गर्ने स्वतन्त्र नियामक निकाय (Independent Regulatory Authority) को स्थापनाका लागि आवश्यक कानूनी तथा संस्थागत प्रबन्ध ६० दिनभित्र गर्ने।",
    question:
      "What guarantees of tenure, budget independence, and appeal routes separate this body from line ministries and political cycles?",
    questionNe:
      "कार्यकाल, बजेट स्वतन्त्रता र पुनरावेदन मार्ग कस्तो छ — रेखा मन्त्रालय र राजनीतिक चक्रबाट अलग?",
    whyThisMatters:
      "Independence on paper is common; the test is whether the regulator can say no to powerful agencies and vendors.",
    whyThisMattersNe:
      "कागजमा स्वतन्त्रता सामान्य; परीक्षण — शक्तिशाली निकाय र विक्रेतालाई «न» भन्न सक्छ कि।",
    possiblePathItems: [
      "Published appointment and removal procedures",
      "Funding formula insulated from annual bargaining",
      "Annual enforcement statistics and judicial review rate",
      "Stakeholder board with civil society seats",
    ],
    possiblePathItemsNe: [
      "नियुक्ति र हटाउने प्रक्रिया प्रकाशन",
      "वार्षिक मोलतोलबाट छुट्टै अनुदान सूत्र",
      "कार्यान्वयन तथ्याङ्क र न्यायिक पुनरावलोकन दर",
      "नागरिक समाज सिटसहित हितधारक बोर्ड",
    ],
    systemInsight:
      "Regulators fail softly when they inherit staff and culture from the ministry they are meant to oversee—design for separation.",
    systemInsightNe:
      "नियामक नरम असफल हुन्छ जब मन्त्रालयकै संस्कृति उत्तरदायी हुनुपर्ने ठाउँबाट आउँछ — अलगाव डिजाइन गर्नुहोस्।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ३८ (independent IT/digital governance regulator; scan Page 7)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ३८ (स्वतन्त्र IT/डिजिटल नियामक; स्क्यान पृष्ठ ७)",
    sourceExcerpt:
      "From scan (Page 7, घ): within 60 days, legal and institutional arrangements for an independent regulatory authority on IT and digital governance (rule-making and regulation).",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ७ (घ): ६० दिनमा सूचना प्रविधि तथा डिजिटल गभर्नेन्स नियमन गर्ने स्वतन्त्र नियामक निकाय (Independent Regulatory Authority) स्थापनाका कानूनी तथा संस्थागत प्रबन्ध।",
    layer1: {
      hookEmoji: "🏛️",
      hook: "Independent IT/digital regulator in 60 days — legal + institutional shell.",
      hookNe: "६० दिनमा स्वतन्त्र IT/डिजिटल नियामक — कानुनी र संस्थागत खोल।",
      stakeLine: "Independence needs tenure, budget, and appeal routes — not a letterhead.",
      stakeLineNe: "स्वतन्त्रतालाई कार्यकाल, बजेट र पुनरावेदन चाहिन्छ — लेटरहेड मात्र होइन।",
      coreQuestionShort: "Who can fire the chair; who funds the budget; who hears appeals?",
      coreQuestionShortNe: "अध्यक्ष कसले हटाउँछ; बजेट कोले; पुनरावेदन कसले सुन्छ?",
      coreQuestion:
        "What tenure, budget independence, and appeal routes separate this body from line ministries and political cycles?",
      coreQuestionNe:
        "कार्यकाल, बजेट स्वतन्त्रता र पुनरावेदन मार्ग कस्तो छ — रेखा मन्त्रालय र राजनीतिक चक्रबाट अलग?",
      quickScan: [
        {
          item: "Draft statute / TOR published: appointment, removal, grounds for dismissal",
          itemNe: "मस्यौदा ऐन/TOR प्रकाशित: नियुक्ति, हटाउने, बर्खास्ती आधार",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Multi-year budget formula (insulated from annual bargaining)",
          itemNe: "बहुवर्षीय बजेट सूत्र (वार्षिक मोलतोलबाट छुट्टै)",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
        {
          item: "Appeal path to administrative court / tribunal defined",
          itemNe: "प्रशासनिक अदालत/न्यायाधिकरण पुनरावेदन मार्ग परिभाषित",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Enforcement powers vs MoCIT sector mandate — boundary memo public",
          itemNe: "कार्यान्वयन अधिकार बनाम सञ्चार मन्त्रालय क्षेत्र — सीमा ज्ञापन सार्वजनिक",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Law, Justice and Parliamentary Affairs; Ministry of Communications and Information Technology; Office of the Prime Minister; Public Service Commission for leadership recruitment.",
      primaryOwnersNe:
        "कानून मन्त्रालय; सञ्चार मन्त्रालय; प्रधानमन्त्री कार्यालय; नेतृत्व भर्नाका लागि लोक सेवा आयोग।",
      coordinatingOfficeEn:
        "Regulator design task force with published gap analysis vs existing MoCIT/NTA roles.",
      coordinatingOfficeNe: "विद्यमान सञ्चार/NTA भूमिकासँग खाली विश्लेषण प्रकाशित नियामक डिजाइन कार्यदल।",
      accountableRolesEn:
        "Parliamentary committee hearings before enabling legislation is fast-tracked.",
      accountableRolesNe:
        "सक्षम कानुन छिटो पार गर्न अघि संसदीय समिति सुनुवाइ।",
      timelineEn: "T+60 days: legal + institutional arrangements complete; Y1: operational regulator with staff plan.",
      timelineNe: "T+६० दिन: कानुनी र संस्थागत प्रबन्ध पूरा; Y१: दरबन्दी योजनासहित सञ्चालन नियामक।",
      milestones: [
        {
          en: "Public consultation on draft organic law for the authority.",
          ne: "निकायका लागि मस्यौदा मूल कानुनमा सार्वजनिक परामर्श।",
        },
        {
          en: "Enforcement statistics template (cases, fines, judicial review rate).",
          ne: "कार्यान्वयन तथ्य ढाँचा (मुद्दा, जरिवाना, न्यायिक पुनरावलोकन दर)।",
        },
        {
          en: "Civil society seats on advisory board (published criteria).",
          ne: "सल्लाहकार बोर्डमा नागरिक समाज सिट (प्रकाशित मापदण्ड)।",
        },
      ],
      kpis: [
        {
          metricEn: "Statutory independence score (external governance review)",
          metricNe: "कानुनी स्वतन्त्रता स्कोर (बाह्य शासन समीक्षा)",
          howEn: "Template from INTOSAI / regional benchmarks.",
          howNe: "INTOSAI/क्षेत्रीय मापदण्डबाट ढाँचा।",
        },
        {
          metricEn: "Time from complaint to first regulator decision (median days)",
          metricNe: "उजुरीदेखि पहिलो नियामक निर्णयसम्म मध्यक दिन",
          howEn: "Case management system once live.",
          howNe: "लाइभ भएपछि मुद्दा व्यवस्थापन प्रणाली।",
        },
      ],
      risks: [
        {
          en: "Captured regulator — staff seconded from ministry being overseen.",
          ne: "कब्जा नियामक — निरीक्षण गर्ने मन्त्रालयबाट दोस्रो हस्ताक्षर कर्मचारी।",
        },
        {
          en: "Overlapping NTA / MoCIT — jurisdictional turf wars.",
          ne: "NTA/सञ्चारसँग दोहोरो — क्षेत्रीय कब्जा युद्ध।",
        },
      ],
      escalation: [
        {
          en: "International partners (e.g. World Bank governance) review independence design.",
          ne: "अन्तर्राष्ट्रिय साझेदारले स्वतन्त्रता डिजाइन समीक्षा।",
        },
        {
          en: "Share this point so the regulator can say no (#point-38).",
          ne: "नियामकले «न» भन्न सकोस् भने साझेदारी गर्नुहोस् (#बुँदा-३८)।",
        },
      ],
      programStatusEn: "🟡 At risk — independent IT/digital regulator 60-day arrangements not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — स्वतन्त्र IT/डिजिटल नियामक ६० दिन प्रबन्ध यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p39",
    pointNumber: 39,
    category: "Digital Governance & Data",
    promise:
      "To resolve fragmentation, weak interoperability, inadequate standards and institutional coordination, shortages of skilled human resources and technical capacity, and ineffective service delivery in Nepal’s IT and e-governance landscape, within three months complete establishment of an Office of Information Technology and Electronic Governance under the Office of the Prime Minister and Council of Ministers for a unified, secure, efficient, results-oriented digital governance system; abolish the current Department of Information Technology; and arrange for all public bodies related to information technology to operate under this office.",
    promiseNe:
      "नेपालको सूचना प्रविधि तथा विद्युतीय शासन प्रणालीमा विद्यमान खण्डीकृत संरचना, अन्तरआबद्धताको अभाव, मापदण्ड तथा संस्थागत समन्वयको कमजोरी, दक्ष जनशक्ति र प्राविधिक क्षमताको कमी तथा सेवा प्रवाहमा देखिएको अप्रभावकारिता समाधान गरी एकीकृत, सुरक्षित, दक्ष र परिणाममुखी डिजिटल शासन प्रणाली स्थापना गर्न प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय मातहत रहने गरी सूचना प्रविधि तथा विद्युतीय शासन कार्यालय स्थापना गर्ने कार्य तीन महिनाभित्र सम्पन्न गर्ने। हालको सूचना प्रविधि विभाग खारेज गर्ने तथा सूचना प्रविधिसम्बन्धी सबै सार्वजनिक निकायहरूलाई यस कार्यालय अन्तर्गत सञ्चालन गर्ने व्यवस्था मिलाउने।",
    question:
      "What statutory instruments transfer staff, assets, and budgets from the abolished department, and how are conflicts with MoCIT’s sector mandate resolved during the transition?",
    questionNe:
      "खारेज विभागबाट कर्मचारी, सम्पत्ति र बजेट कुन कानुनी दस्ताबेजबाट सर्छ, र संक्रमणमा सञ्चार मन्त्रालयको क्षेत्रीय जिम्मेवारीसँग द्वन्द्व कसरी मिलाइन्छ?",
    whyThisMatters:
      "Centralizing IT under the PM office can speed decisions—or duplicate mandates—unless transition law is precise.",
    whyThisMattersNe:
      "प्रधानमन्त्री कार्यालयमुनि IT केन्द्रित निर्णय छिटो — तर संक्रमण कानुन स्पष्ट नभए जिम्मेवारी दोहोरिन्छ।",
    possiblePathItems: [
      "Published org chart and reporting lines vs line ministries",
      "Asset and contract inventory with successor liability",
      "180-day transition plan with milestones",
      "Public FAQ for employees on roles and union rights",
    ],
    possiblePathItemsNe: [
      "संस्थापत्र र रेखा मन्त्रालयसँग रिपोर्टिङ खाका",
      "उत्तराधिकार दायित्वसहित सम्पत्ति र सम्झौता सूची",
      "१८० दिन संक्रमण योजना कोसेङ्कसहित",
      "कर्मचारी भूमिका र संगठन अधिकार सार्वजनिक प्रश्नोत्तर",
    ],
    systemInsight:
      "Abolishing a department is easy; migrating live systems without outages is where governance earns its salary.",
    systemInsightNe:
      "विभाग खारेज सजिलो; बन्द बिना प्रणाली सार्नु जहाँ शासनले ज्याला कमाउँछ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ३९ (IT & e-governance office under PMO; abolish DoIT; scan Pages 7–8)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ३९ (प्रधानमन्त्री कार्यालयमुनि IT/इ-शासन कार्यालय; DoIT खारेज; स्क्यान ७–८)",
    sourceExcerpt:
      "From scan (Pages 7–8, घ): within three months, complete establishment of the Office of Information Technology and Electronic Governance under the PM office; abolish the current Department of Information Technology; arrange for all IT-related public bodies to operate under this office.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ७–८ (घ): तीन महिनाभित्र प्रधानमन्त्री कार्यालय मातहत सूचना प्रविधि तथा विद्युतीय शासन कार्यालय स्थापना सम्पन्न; हालको सूचना प्रविधि विभाग खारेज; सूचना प्रविधिसम्बन्धी सबै सार्वजनिक निकाय यस कार्यालय अन्तर्गत सञ्चालन।",
    layer1: {
      hookEmoji: "🏢",
      hook: "PMO-led IT & e-governance office — DoIT abolished, mandates unified.",
      hookNe: "प्रधानमन्त्री कार्यालयमुनि IT/इ-शासन — DoIT खारेज, जिम्मेवारी एकीकृत।",
      stakeLine: "Org charts are easy; migrating live systems and budgets without outages is the exam.",
      stakeLineNe: "संस्थापत्र सजिलो; बन्द बिना प्रणाली र बजेट सार्नु परीक्षा।",
      coreQuestionShort: "Which law moves staff, assets, contracts — and who resolves MoCIT overlap?",
      coreQuestionShortNe: "कुन ऐनले कर्मचारी, सम्पत्ति, सम्झौता सार्छ — सञ्चारसँग द्वन्द्व को मिलाउँछ?",
      coreQuestion:
        "What instruments transfer staff, assets, and budgets from the abolished department; how are conflicts with MoCIT’s mandate resolved during transition?",
      coreQuestionNe:
        "खारेज विभागबाट कर्मचारी, सम्पत्ति, बजेट कुन दस्ताबेजबाट सर्छ; संक्रमणमा सञ्चार मन्त्रालयसँग द्वन्द्व कसरी मिल्छ?",
      quickScan: [
        {
          item: "Three-month milestone: office legally established + accountable officer named",
          itemNe: "तीन महिना कोसेढुङ्गा: कार्यालय कानुनी रूपमा स्थापित + जिम्मेवार अधिकृत नाम",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Published org chart + reporting lines vs line ministries",
          itemNe: "प्रकाशित संस्थापत्र + रेखा मन्त्रालयसँग रिपोर्टिङ",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Asset & contract inventory with successor liability (DoIT → new office)",
          itemNe: "उत्तराधिकार दायित्वसहित सम्पत्ति र सम्झौता सूची (DoIT→नयाँ कार्यालय)",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "180-day transition plan with cutover windows for critical systems",
          itemNe: "गम्भीर प्रणाली कटओभर खिडकीसहित १८० दिन संक्रमण योजना",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of the Prime Minister and Council of Ministers; Ministry of Communications and Information Technology; Ministry of Federal Affairs and General Administration; Public Service Commission for staffing orders.",
      primaryOwnersNe:
        "प्रधानमन्त्री कार्यालय; सञ्चार मन्त्रालय; संघीय मामिला मन्त्रालय; कर्मचारी आदेशका लागि लोक सेवा आयोग।",
      coordinatingOfficeEn:
        "Transition command centre with war-room schedule for system migration and vendor novation.",
      coordinatingOfficeNe: "प्रणाली साराइ र विक्रेता नोभेसनका लागि वाररूम तालिकासहित संक्रमण कमान केन्द्र।",
      accountableRolesEn:
        "Named transition CRO reports weekly to PMO with outage and dispute log.",
      accountableRolesNe:
        "नामित संक्रमण CROले बन्द र विवाद लगसहित प्रधानमन्त्री कार्यालयमा हप्तामा प्रतिवेदन।",
      timelineEn: "T+3 months: establishment complete; T+180 days: full operational consolidation per plan.",
      timelineNe: "T+३ महिना: स्थापना पूरा; T+१८० दिन: योजना अनुसार पूर्ण सञ्चालन एकीकरण।",
      milestones: [
        {
          en: "Gazette notification abolishing DoIT and creating the new office.",
          ne: "DoIT खारेज र नयाँ कार्यालय सिर्जनाको राजपत्र सूचना।",
        },
        {
          en: "Employee FAQ: roles, union rights, relocation (published).",
          ne: "कर्मचारी प्रश्नोत्तर: भूमिका, संगठन अधिकार, सरुवा (प्रकाशित)।",
        },
        {
          en: "Vendor contract novation letters signed for all critical IT services.",
          ne: "सबै गम्भीर IT सेवाका लागि विक्रेता नोभेसन पत्र हस्ताक्षर।",
        },
      ],
      kpis: [
        {
          metricEn: "Critical systems migrated without P1 outage (count / target)",
          metricNe: "P१ बन्द बिना सरेका गम्भीर प्रणाली (गणना/लक्ष्य)",
          howEn: "Change management tickets; public status page.",
          howNe: "परिवर्तन टिकट; सार्वजनिक स्थिति पृष्ठ।",
        },
        {
          metricEn: "% of DoIT budget lines transferred to new office ledger",
          metricNe: "नयाँ कार्यालय खातामा सरेका DoIT बजेट शीर्षक %",
          howEn: "MoF system reconciliation.",
          howNe: "अर्थ प्रणाली मिलान।",
        },
      ],
      risks: [
        {
          en: "Dual power — DoIT ghosts and new office both claim authority.",
          ne: "दोहोरो अधिकार — DoIT भूत र नयाँ कार्यालय दुवै दाबी।",
        },
        {
          en: "MoCIT–PMO turf fight stalls national digital projects.",
          ne: "सञ्चार–प्रधानमन्त्री कार्यालय कब्जा झगडाले राष्ट्रिय डिजिटल रोक्छ।",
        },
      ],
      escalation: [
        {
          en: "Parliament questions if major portals go dark during transition.",
          ne: "संक्रमणमा पोर्टल बन्द भए संसदीय प्रश्न।",
        },
        {
          en: "Share this point so migration stays accountable (#point-39).",
          ne: "साराइ जवाफदेही राख्न साझेदारी गर्नुहोस् (#बुँदा-३९)।",
        },
      ],
      programStatusEn: "🟡 At risk — three-month PMO IT office + DoIT abolition not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — तीन महिना प्रधानमन्त्री कार्यालय IT कार्यालय र DoIT खारेज यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p40",
    pointNumber: 40,
    category: "Digital Governance & Data",
    promise:
      "Draft the Information Technology and Electronic Governance Bill within 60 days.",
    promiseNe:
      "सूचना प्रविधि तथा विद्युतीय शासन विधेयक ६० दिनभित्र तर्जुमा गर्ने।",
    question:
      "Will the bill’s public consultation include chapter-wise comments, and how are overlaps with existing cybercrime, privacy, and procurement laws resolved in a consolidated roadmap?",
    questionNe:
      "विधेयकको सार्वजनिक परामर्श अध्यायअनुसार हुन्छ, र साइबर अपराध, गोपनीयता र खरिद कानुनसँग द्वन्द्व एकीकृत रोडम्यापमा कसरी मिलाइन्छ?",
    whyThisMatters:
      "A framework bill can harmonize digital government—or create a thicket of conflicting articles if drafting races the calendar.",
    whyThisMattersNe:
      "ढाँचा विधेयकले डिजिटल सरकार मिलाउँछ — वा मस्यौदा दौडिन्छ भने विरोधाभासी धारा जङ्गल बन्छ।",
    possiblePathItems: [
      "Consolidated legislative map with repeal schedules",
      "Sovereign data and cloud provisions aligned with security policy",
      "Roles of regulator, ministries, and PM office clarified",
      "Post-enactment secondary regulation timeline",
    ],
    possiblePathItemsNe: [
      "खारेज तालिकासहित एकीकृत कानुनी नक्सा",
      "सुरक्षा नीतिसँग मिलेको डेटा र क्लाउड धारा",
      "नियामक, मन्त्रालय र प्रधानमन्त्री कार्यालयको भूमिका स्पष्ट",
      "कार्यान्वयनपछि द्वितीयक नियम समयरेखा",
    ],
    systemInsight:
      "Sixty days to draft a sector-defining bill is possible only if scope is ruthlessly prioritized—otherwise you ship ambiguity.",
    systemInsightNe:
      "क्षेत्र परिभाषित विधेयक ६० दिनमा सम्भव छ जब दायरा कठोर — नत्र अस्पष्टता ढुवानी हुन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ४० (IT & e-governance bill; scan Page 8)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ४० (सूचना प्रविधि तथा विद्युतीय शासन विधेयक; स्क्यान पृष्ठ ८)",
    sourceExcerpt:
      "From scan (Page 8, घ): within 60 days, draft the Information Technology and Electronic Governance Bill.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ८ (घ): ६० दिनभित्र सूचना प्रविधि तथा विद्युतीय शासन विधेयक तर्जुमा।",
    layer1: {
      hookEmoji: "📜",
      hook: "IT & e-governance bill drafted in 60 days — scope discipline or ambiguity shipped.",
      hookNe: "६० दिनमा IT/इ-शासन विधेयक — दायरा अनुशासन वा अस्पष्टता ढुवानी।",
      stakeLine: "A framework bill should repeal schedules and roles — not stack another layer of confusion.",
      stakeLineNe: "ढाँचा विधेयकले खारेज तालिका र भूमिका दिनुपर्छ — अर्को भ्रम थप्दैन।",
      coreQuestionShort: "Chapter-wise consultation and a consolidated legislative map — public?",
      coreQuestionShortNe: "अध्यायअनुसार परामर्श र एकीकृत कानुनी नक्सा — सार्वजनिक?",
      coreQuestion:
        "Will consultation include chapter-wise comments; how are overlaps with cybercrime, privacy, and procurement laws resolved in one roadmap?",
      coreQuestionNe:
        "परामर्श अध्यायअनुसार हुन्छ; साइबर, गोपनीयता, खरिद कानुनसँग द्वन्द्व एक रोडम्यापमा कसरी मिल्छ?",
      quickScan: [
        {
          item: "60-day draft delivered + public text repository (versioned)",
          itemNe: "६० दिनमा मस्यौदा + सार्वजनिक पाठ भण्डार (संस्करण)",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Consolidated legislative map: repeals, amendments, residual conflicts",
          itemNe: "एकीकृत कानुनी नक्सा: खारेज, संशोधन, बाँकी द्वन्द्व",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Clarified roles: regulator, ministries, PM IT office vs MoCIT",
          itemNe: "स्पष्ट भूमिका: नियामक, मन्त्रालय, प्रधानमन्त्री IT कार्यालय बनाम सञ्चार",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Secondary regulations timeline post-enactment (published)",
          itemNe: "कार्यान्वयनपछि द्वितीयक नियम समयरेखा (प्रकाशित)",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Law, Justice and Parliamentary Affairs; Ministry of Communications and Information Technology; drafting committee chair; NPCS for technical annexes.",
      primaryOwnersNe:
        "कानून मन्त्रालय; सञ्चार मन्त्रालय; मस्यौदा समिति अध्यक्ष; प्राविधिक अनुसूची NPCS।",
      coordinatingOfficeEn:
        "Bill drafting secretariat with public docket of comments and government responses.",
      coordinatingOfficeNe: "टिप्पणी र सरकारी प्रतिक्रियाको सार्वजनिक दर्तासहित विधेयक मस्यौदा सचिवालय।",
      accountableRolesEn:
        "Legislative management committee tracks conflict resolution with other bills in pipeline.",
      accountableRolesNe:
        "विधायी व्यवस्थापन समितिले पाइपलाइनका अन्य विधेयकसँग द्वन्द्व समाधान ट्रयाक।",
      timelineEn: "T+60 days: draft for Cabinet/Parliament; +30–60: revision cycle based on consultation.",
      timelineNe: "T+६० दिन: मन्त्रिपरिषद्/संसदका लागि मस्यौदा; +३०–६०: परामर्श अनुसार संशोधन चक्र।",
      milestones: [
        {
          en: "Sovereign cloud / data residency chapters aligned with security policy.",
          ne: "सुरक्षा नीतिसँग मिलेको संप्रभु क्लाउड/डेटा निवास धारा।",
        },
        {
          en: "Cross-walk table: bill articles vs existing Acts (searchable).",
          ne: "विधेयक धारा बनाम विद्यमान ऐन क्रसवॉक तालिका (खोज्न मिल्ने)।",
        },
        {
          en: "Post-enactment implementation plan with budget lines per chapter.",
          ne: "अध्याय प्रति बजेट रेखासहित कार्यान्वयन योजना।",
        },
      ],
      kpis: [
        {
          metricEn: "Comment threads resolved / total (%)",
          metricNe: "समाधान भएका टिप्पणी धागा / कुल (%)",
          howEn: "Consultation portal metrics.",
          howNe: "परामर्श पोर्टल मेट्रिक।",
        },
        {
          metricEn: "Legal conflict items closed before tabling",
          metricNe: "पेश अघि बन्द कानुनी द्वन्द्व विषय",
          howEn: "Drafter reconciliation log.",
          howNe: "मस्यौदाकर्ता मिलान लग।",
        },
      ],
      risks: [
        {
          en: "Scope creep — every ministry loads pet provisions.",
          ne: "दायरा बढो — हरेक मन्त्रालयले मनपर्ने धारा थप्छ।",
        },
        {
          en: "Dead-on-arrival overlaps — bill stalls in parliamentary queue.",
          ne: "मृत जन्म दोहोरो — विधेयक संसद लाइनमा अड्किन्छ।",
        },
      ],
      escalation: [
        {
          en: "Private sector publishes “red line” list for investment certainty.",
          ne: "लगानी निश्चितताका लागि निजी क्षेत्र «रातो रेखा» सूची।",
        },
        {
          en: "Share this point so the bill stays coherent (#point-40).",
          ne: "विधेयक एकमुखी राख्न साझेदारी गर्नुहोस् (#बुँदा-४०)।",
        },
      ],
      programStatusEn: "🟡 At risk — 60-day IT & e-governance bill draft not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ६० दिन IT/इ-शासन विधेयक मस्यौदा यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p41",
    pointNumber: 41,
    category: "Digital Governance & Data",
    promise:
      "Prepare the National Enterprise Architecture Framework within 60 days.",
    promiseNe:
      "National Enterprise Architecture Framework ६० दिनभित्र तयार गर्ने।",
    question:
      "What governance board owns the framework, how are legacy systems mapped to target reference architectures, and where is the public version published for vendor alignment?",
    questionNe:
      "ढाँचाको मालिकाना कुन बोर्डले गर्छ, विरासत प्रणाली लक्षित आर्किटेक्चरसँग कसरी म्याप हुन्छ, र विक्रेता मिलानका लागि सार्वजनिक संस्करण कहाँ?",
    whyThisMatters:
      "Enterprise architecture only reduces duplication if agencies cannot opt out silently—enforcement rules matter as much as diagrams.",
    whyThisMattersNe:
      "एन्टरप्राइज आर्किटेक्चरले दोहोरोपण घटाउँछ जब निकाय चुपचाप बाहिरिन सक्दैन — नियम रेखाचित्र जत्तिकै महत्वको।",
    possiblePathItems: [
      "Versioned blueprint with mandatory compliance checkpoints",
      "Cross-agency dependency register and sunset dates",
      "Training budget tied to architecture adoption metrics",
      "Annual independent conformance review published",
    ],
    possiblePathItemsNe: [
      "अनिवार्य अनुपालन चेकपोइन्टसहित संस्करण खाका",
      "निकायबीच निर्भरता दर्ता र अन्त्य मिति",
      "आर्किटेक्चर अपनाउने मेट्रिकसँग जोडिएको तालिम बजेट",
      "वार्षिक स्वतन्त्र अनुरूपता समीक्षा प्रकाशन",
    ],
    systemInsight:
      "A 60-day framework can be a credible scaffold or shelf-ware—scope should match what can be validated, not every agency’s wish list.",
    systemInsightNe:
      "६० दिने ढाँचा विश्वसनीय खम्बा वा ताकेता मात्र — दायरा प्रमाणित हुन सक्नेभन्दा बढी नहोस्।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ४१ (National Enterprise Architecture Framework; scan Page 8)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ४१ (National Enterprise Architecture Framework; स्क्यान पृष्ठ ८)",
    sourceExcerpt:
      "From scan (Page 8): National Enterprise Architecture Framework ६० दिनभित्र तयार गर्ने।",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ८: National Enterprise Architecture Framework ६० दिनभित्र तयार गर्ने।",
    layer1: {
      hookEmoji: "🗺️",
      hook: "National Enterprise Architecture in 60 days — blueprint agencies can’t quietly ignore.",
      hookNe: "६० दिनमा राष्ट्रिय एन्टरप्राइज आर्किटेक्चर — निकाय चुपचाप बेवास्ता गर्न नसक्ने खाका।",
      stakeLine: "Diagrams without enforcement checkpoints become shelf-ware.",
      stakeLineNe: "कार्यान्वयन चेकपोइन्ट बिना रेखाचित्र ताकेता मात्र।",
      coreQuestionShort: "Who owns the framework board; where’s the public vendor pack?",
      coreQuestionShortNe: "ढाँचा बोर्ड कोको; सार्वजनिक विक्रेता प्याक कहाँ?",
      coreQuestion:
        "What governance board owns the framework; how are legacy systems mapped to target architectures; where is the public version for vendors?",
      coreQuestionNe:
        "ढाँचाको मालिकाना कुन बोर्डले; विरासत कसरी म्याप हुन्छ; विक्रेताका लागि सार्वजनिक संस्करण कहाँ?",
      quickScan: [
        {
          item: "60-day framework v1 published (scope + non-goals explicit)",
          itemNe: "६० दिनमा ढाँचा v१ प्रकाशित (दायरा र नलक्ष्य स्पष्ट)",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Governance board named + meeting minutes public",
          itemNe: "संचालन बोर्ड नाम + मिनेट सार्वजनिक",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Legacy-to-target mapping register (agencies, sunset dates)",
          itemNe: "विरासत-देखि-लक्ष्य दर्ता (निकाय, अन्त्य मिति)",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Mandatory compliance checkpoints for new procurements",
          itemNe: "नयाँ खरिदका लागि अनिवार्य अनुपालन चेकपोइन्ट",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of Information Technology and Electronic Governance (or successor); MoFAGA; NPCS; Ministry of Finance for procurement alignment.",
      primaryOwnersNe:
        "सूचना प्रविधि तथा विद्युतीय शासन कार्यालय (वा उत्तराधिकारी); संघीय मामिला; NPCS; खरिद मिलानका लागि अर्थ मन्त्रालय।",
      coordinatingOfficeEn:
        "Architecture review board with published non-conformance register by agency.",
      coordinatingOfficeNe: "निकायअनुसार प्रकाशित गैरअनुपालन दर्तासहित आर्किटेक्चर समीक्षा बोर्ड।",
      accountableRolesEn:
        "CIO council signs off on major deviations with written risk acceptance.",
      accountableRolesNe:
        "ठूलो विचलन लेखित जोखिम स्वीकारसहित CIO परिषद् स्वीकृति।",
      timelineEn: "T+60 days: framework baseline; Y1: conformance reviews; rolling sunset for non-compliant systems.",
      timelineNe: "T+६० दिन: आधार रेखा; Y१: अनुरूपता समीक्षा; गैरअनुपालन प्रणालीको रोलिङ अन्त्य।",
      milestones: [
        {
          en: "Reference architectures per domain (identity, payments, documents).",
          ne: "क्षेत्र प्रति सन्दर्भ आर्किटेक्चर (पहिचान, भुक्तान, कागजात)।",
        },
        {
          en: "Training budget line tied to architecture adoption KPIs.",
          ne: "आर्किटेक्चर अपनाउने KPI सँग जोडिएको तालिम बजेट शीर्षक।",
        },
        {
          en: "Annual independent conformance report published.",
          ne: "वार्षिक स्वतन्त्र अनुरूपता प्रतिवेदन प्रकाशन।",
        },
      ],
      kpis: [
        {
          metricEn: "Agency systems mapped / total in scope (%)",
          metricNe: "म्याप भएका निकाय प्रणाली / दायराको कुल (%)",
          howEn: "Architecture repository; quarterly update.",
          howNe: "आर्किटेक्चर भण्डार; त्रैमासिक अद्यावधिक।",
        },
        {
          metricEn: "Procurement waivers granted vs denied (with reasons)",
          metricNe: "दिइएका बनाम अस्वीकृत खरिद छुट (कारणसहित)",
          howEn: "PPMO / MoF waiver log.",
          howNe: "PPMO/अर्थ छुट लग।",
        },
      ],
      risks: [
        {
          en: "Paper compliance — diagrams filed, systems unchanged.",
          ne: "कागज अनुपालन — रेखाचित्र दर्ता, प्रणाली उही।",
        },
        {
          en: "Vendor lock-in — framework used to cement single supplier.",
          ne: "विक्रेता बन्दी — ढाँचा एक आपूर्तिकर्ता जमाउन प्रयोग।",
        },
      ],
      escalation: [
        {
          en: "SAIs sample conformance claims against live systems.",
          ne: "लाइभ प्रणाली बनाम अनुरूपता दाबी महालेखा नमूना।",
        },
        {
          en: "Share this point so EA stops shelf-ware (#point-41).",
          ne: "EA ताकेता नहोस् भने साझेदारी गर्नुहोस् (#बुँदा-४१)।",
        },
      ],
      programStatusEn: "🟡 At risk — 60-day National Enterprise Architecture Framework not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ६० दिन राष्ट्रिय एन्टरप्राइज आर्किटेक्चर ढाँचा यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p42",
    pointNumber: 42,
    category: "Digital Governance & Data",
    promise:
      "The Ministry of Communication and Information Technology shall shut down betting apps and related websites within 24 hours.",
    promiseNe:
      "सञ्चार तथा सूचना प्रविधि मन्त्रालयले सट्टेबाजी एप (Betting App) र त्यससम्बन्धी वेबसाइट २४ घण्टाभित्र बन्द गर्ने।",
    question:
      "What legal basis and appeal process apply to each takedown, how is cross-border hosting handled, and are enforcement stats published to show sustained action beyond day one?",
    questionNe:
      "प्रत्येक बन्द गर्ने कानुनी आधार र पुनरावेदन के, सीमापार होस्टिङ कसरी, र पहिलो दिनपछि पनि कार्यान्वयन तथ्याङ्क सार्वजनिक हुन्छ?",
    whyThisMatters:
      "Rapid blocking can protect vulnerable users, but opaque takedowns risk overreach and whack-a-mole without structural fixes.",
    whyThisMattersNe:
      "छिटो बन्द कमजोर प्रयोगकर्ता जोगाउँछ — तर अपारदर्शी बन्द अतिक्रमण र संरचनात्मक उपचार बिना खेल जस्तो हुन्छ।",
    possiblePathItems: [
      "Published SOP: notice, review, and judicial remedy",
      "Coordination with NTA, ISPs, and payment gateways",
      "Quarterly transparency report: URLs, reasons, restoration",
      "Prevention education and addiction-support signposting",
    ],
    possiblePathItemsNe: [
      "प्रकाशित SOP: सूचना, समीक्षा, न्यायिक उपचार",
      "दूरसञ्चार प्राधिकरण, ISP र भुक्तानी गेटवे समन्वय",
      "त्रैमासिक पारदर्शिता: URL, कारण, पुनर्स्थापना",
      "रोकथाम शिक्षा र लत सहयोग सूचना",
    ],
    systemInsight:
      "Twenty-four hours is an operations stress test—if DNS and payment rails are not pre-mapped, the deadline becomes a press release.",
    systemInsightNe:
      "२४ घण्टा सञ्चालन परीक्षा — DNS र भुक्तानी पूर्व नक्सा नभए म्याद प्रेस विज्ञप्ति बन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ४२ (betting apps / sites takedown; scan Page 8)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ४२ (सट्टेबाजी एप/साइट बन्द; स्क्यान पृष्ठ ८)",
    sourceExcerpt:
      "From scan (Page 8): सञ्चार तथा सूचना प्रविधि मन्त्रालयले सट्टेबाजी एप (Betting App) र त्यससम्बन्धी वेबसाइट २४ घण्टाभित्र बन्द गर्ने।",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ८: सञ्चार तथा सूचना प्रविधि मन्त्रालयले सट्टेबाजी एप (Betting App) र त्यससम्बन्धी वेबसाइट २४ घण्टाभित्र बन्द गर्ने।",
    layer1: {
      hookEmoji: "🎲",
      hook: "Betting apps and sites down in 24 hours — ops, law, and due process together.",
      hookNe: "२४ घण्टामा सट्टेबाजी एप/साइट बन्द — सञ्चालन, कानुन र न्याय प्रक्रिया एकसाथ।",
      stakeLine: "Fast blocking helps vulnerable users; opaque takedowns help nobody long term.",
      stakeLineNe: "छिटो बन्द कमजोर जोगाउँछ; अपारदर्शी बन्द दीर्घकालमा कसैलाई होइन।",
      coreQuestionShort: "Legal basis per block, appeals, cross-border — and stats after day one?",
      coreQuestionShortNe: "प्रति बन्द कानुनी आधार, पुनरावेदन, सीमापार — पहिलो दिनपछि तथ्य?",
      coreQuestion:
        "What legal basis and appeal apply per takedown; how is cross-border hosting handled; are enforcement stats published beyond day one?",
      coreQuestionNe:
        "प्रत्येक बन्द कानुनी आधार र पुनरावेदन के; सीमापार होस्टिङ कसरी; पहिलो दिनपछि तथ्याङ्क सार्वजनिक?",
      quickScan: [
        {
          item: "24-hour action log: URLs, legal instrument, responsible officer",
          itemNe: "२४ घण्टा कार्य लग: URL, कानुनी दस्तावेज, जिम्मेवार अधिकृत",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Published SOP: notice → review → judicial remedy timeline",
          itemNe: "प्रकाशित SOP: सूचना → समीक्षा → न्यायिक उपचार समयरेखा",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "NTA + ISP + payment-gateway coordination plan on file",
          itemNe: "NTA+ISP+भुक्तानी गेटवे समन्वय योजना दर्ता",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Quarterly transparency: blocks, restorations, mistaken takedowns",
          itemNe: "त्रैमासिक पारदर्शिता: बन्द, पुनर्स्थापना, गलत बन्द",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Communications and Information Technology; Nepal Telecommunications Authority; Nepal Police / cyber units; payment system operators.",
      primaryOwnersNe:
        "सञ्चार तथा सूचना प्रविधि मन्त्रालय; दूरसञ्चार प्राधिकरण; नेपाल प्रहरी/साइबर एकाइ; भुक्तानी प्रणाली सञ्चालक।",
      coordinatingOfficeEn:
        "Rapid-response cell with pre-mapped DNS, hosting, and payment choke points.",
      coordinatingOfficeNe: "DNS, होस्टिङ र भुक्तानी थ्रोटल पूर्व नक्सासहित द्रुत प्रतिक्रिया कोठा।",
      accountableRolesEn:
        "Named officer signs each block order with legal reference; judicial review stats published.",
      accountableRolesNe:
        "नामित अधिकृतले कानुनी सन्दर्भसहित प्रत्येक बन्द आदेश हस्ताक्षर; न्यायिक समीक्षा तथ्य प्रकाशित।",
      timelineEn: "T+24h: first wave; ongoing: sustained enforcement with weekly stats for 90 days.",
      timelineNe: "T+२४ घण्टा: पहिलो लहर; निरन्तर: ९० दिन हप्तामा तथ्यसहित।",
      milestones: [
        {
          en: "Mirror list for app stores and side-load channels (updated).",
          ne: "एप स्टोर र साइड-लोड च्यानलका लागि अद्यावधिक सूची।",
        },
        {
          en: "Cross-border escalation playbook with hosting providers.",
          ne: "होस्टिङ प्रदायकसँग सीमापार उचालन प्लेबुक।",
        },
        {
          en: "Public education + addiction-support signposting campaign.",
          ne: "सार्वजनिक शिक्षा र लत सहयोग सूचना अभियान।",
        },
      ],
      kpis: [
        {
          metricEn: "Active betting domains blocked / resurfaced (rolling 7-day)",
          metricNe: "बन्द/पुनःसतह सक्रिय सट्टेबाजी डोमेन (७ दिन रोलिङ)",
          howEn: "NTA telemetry; public dashboard.",
          howNe: "NTA टेलिमेट्री; सार्वजनिक ड्यासबोर्ड।",
        },
        {
          metricEn: "Successful appeals / wrongful blocks (quarterly)",
          metricNe: "सफल पुनरावेदन / गलत बन्द (त्रैमासिक)",
          howEn: "MoCIT legal docket.",
          howNe: "सञ्चार मन्त्रालय कानुनी दर्ता।",
        },
      ],
      risks: [
        {
          en: "Whack-a-mole — mirrors spawn faster than block lists update.",
          ne: "खेल जस्तो — प्रतिबिम्ब सूचीभन्दा छिटो जन्मिन्छ।",
        },
        {
          en: "Over-blocking — legitimate sites caught in dragnet.",
          ne: "अतिबन्द — वैध साइट जालमा।",
        },
      ],
      escalation: [
        {
          en: "ISPs publish transparency reports on government blocking requests.",
          ne: "ISP ले सरकारी बन्द अनुरोध पारदर्शिता प्रतिवेदन।",
        },
        {
          en: "Share this point so enforcement stays lawful (#point-42).",
          ne: "कार्यान्वयन कानूनी रहोस् भने साझेदारी गर्नुहोस् (#बुँदा-४२)।",
        },
      ],
      programStatusEn: "🟡 At risk — 24-hour betting takedown proof and sustained stats not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — २४ घण्टे सट्टेबाजी बन्द प्रमाण र निरन्तर तथ्य यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p43",
    pointNumber: 43,
    category: "Good Governance & Anti-Corruption",
    promise:
      "To end widespread corruption, asset concealment, and impunity, within 15 days form an empowered Property Investigation Committee under the Office of the Prime Minister and Council of Ministers, including experts from law, finance, revenue, and investigation fields and representatives of relevant bodies; develop necessary legal and technical mechanisms so the process is transparent and results-oriented; grant the committee powers to collect, analyze, and recommend on required documents, details, and records. Phase 1: collect, verify, and investigate asset declarations of senior political officeholders and high-ranking officials who held public office from BS 2062/63 to the present (2082/83). Phase 2: investigate assets of comparable officeholders and officials who held public office from BS 2048 to 2061/62. Run the inquiry on legal standards, evidence, and impartiality, and arrange implementation of the committee’s reports and recommendations through competent bodies.",
    promiseNe:
      "देशमा व्याप्त भ्रष्टाचार, सम्पत्ति लुकाउने प्रवृत्ति तथा दण्डहीनताको अन्त्य गर्न प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय अन्तर्गत रहने गरी १५ दिनभित्र अधिकारसम्पन्न सम्पत्ति छानबिन समिति गठन गर्ने। सो समितिमा कानुन, अर्थ, राजस्व तथा अनुसन्धान क्षेत्रका विज्ञ तथा सम्बन्धित निकायका प्रतिनिधिहरू समावेश गर्ने। आवश्यक कानुनी तथा प्राविधिक संयन्त्र विकास गरी प्रक्रिया पारदर्शी र नतिजामुखी सुनिश्चित गर्ने। समितिलाई कागजात, विवरण तथा अभिलेख सङ्कलन, विश्लेषण र सिफारिस गर्ने अधिकार दिने। पहिलो चरण: वि.सं. २०६२/६३ देखि हाल (२०८२/८३) सम्म सार्वजनिक पद धारण गरेका प्रमुख राजनीतिक पदाधिकारी तथा उच्चपदस्थ कर्मचारीको सम्पत्ति विवरण सङ्कलन, प्रमाणीकरण र छानबिन। दोस्रो चरण: वि.सं. २०४८ देखि २०६१/६२ सम्म सोही प्रकृतिका पदाधिकारी तथा कर्मचारीको सम्पत्ति छानबिन। कानुनी मापदण्ड, प्रमाण र निष्पक्षतामा आधारित प्रक्रिया सञ्चालन गर्ने तथा प्रतिवेदन र सिफारिस सम्बन्धित निकायमार्फत कार्यान्वयन मिलाउने।",
    question:
      "What statute shields the committee’s work from political interference, how are parallel criminal investigations coordinated, and what public disclosure rules apply to findings before trial?",
    questionNe:
      "कुन ऐनले समितिको काम राजनीतिक हस्तक्षेपबाट जोगाउँछ, फौजदारी छानबिनसँग समन्वय कसरी, र मुद्दाअघि नतिजा सार्वजनिक नियम के?",
    whyThisMatters:
      "Asset probes touch powerful elites—credibility rests on law, not headlines.",
    whyThisMattersNe:
      "सम्पत्ति छानबिन शक्तिशालीसँग जोडिन्छ — विश्वास कानुनमा, शीर्षकमा होइन।",
    possiblePathItems: [
      "Published terms of reference and evidence standards",
      "Witness and whistleblower protection linked to the inquiry",
      "Asset verification methodology open to peer review",
      "Prosecution handoff SLA with CIAA and police",
    ],
    possiblePathItemsNe: [
      "प्रकाशित कार्यक्षेत्र र प्रमाण मानक",
      "छानबिनसँग जोडिएको साक्षी र उजागरकर्ता सुरक्षा",
      "सम्पत्ति प्रमाणीकरण विधि सहकर्मी समीक्षायोग्य",
      "अख्तियार र प्रहरीसँग अभियोग हस्तान्तरण SLA",
    ],
    systemInsight:
      "Two-phase windows create political flashpoints—without airtight rules, opponents will call it selective timing.",
    systemInsightNe:
      "दुई चरणको समयसीमाले राजनीतिक चट्याङ ल्याउँछ — नियम कडा नभए छनोटी समय भनिन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ४३ (PMO property investigation committee; scan Page 8, section ङ)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ४३ (सम्पत्ति छानबिन समिति; स्क्यान पृष्ठ ८, खण्ड ङ)",
    sourceExcerpt:
      "From scan (Page 8, ङ): १५ दिनभित्र प्रधानमन्त्री कार्यालय अन्तर्गत अधिकारसम्पन्न सम्पत्ति छानबिन समिति; कानुन/अर्थ/राजस्व/अनुसन्धान विज्ञ; चरण १: २०६२/६३–२०८२/८३ का प्रमुख राजनीतिक तथा उच्चपदस्थ कर्मचारीको सम्पत्ति विवरण; चरण २: २०४८–२०६१/६२; पारदर्शी, नतिजामुखी, कानुनी मापदण्ड र प्रमाण।",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ८ (ङ): १५ दिनभित्र प्रधानमन्त्री कार्यालय अन्तर्गत अधिकारसम्पन्न सम्पत्ति छानबिन समिति; कानुन/अर्थ/राजस्व/अनुसन्धान विज्ञ; चरण १: २०६२/६३ देखि हाल (२०८२/८३) सम्म; चरण २: २०४८–२०६१/६२; पारदर्शी, नतिजामुखी प्रक्रिया।",
    layer1: {
      hookEmoji: "🔍",
      hook: "PMO property probe in 15 days — two phases, high officeholders in scope.",
      hookNe: "१५ दिनमा प्रधानमन्त्री कार्यालय सम्पत्ति छानबिन — दुई चरण, उच्च पदाधिकारी दायरामा।",
      stakeLine: "Asset inquiries touch elites — credibility is legal process, not press conferences.",
      stakeLineNe: "सम्पत्ति छानबिन शक्तिशालीसँग जोडिन्छ — विश्वास कानुनी प्रक्रिया, प्रेस होइन।",
      coreQuestionShort: "Statute vs political interference; disclosure before trial?",
      coreQuestionShortNe: "ऐन बनाम राजनीतिक हस्तक्षेप; मुद्दाअघि खुलासा?",
      coreQuestion:
        "What statute shields the committee from interference; how are criminal probes coordinated; what disclosure rules apply pre-trial?",
      coreQuestionNe:
        "कुन ऐनले समितिलाई हस्तक्षेपबाट जोगाउँछ; फौजदारी छानबिन समन्वय; मुद्दाअघि खुलासा नियम के?",
      quickScan: [
        {
          item: "15-day formation: gazette / order + members + ToR public",
          itemNe: "१५ दिन गठन: राजपत्र/आदेश + सदस्य + ToR सार्वजनिक",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Published evidence standards + witness / whistleblower protections",
          itemNe: "प्रकाशित प्रमाण मानक + साक्षी/उजागरकर्ता सुरक्षा",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Phase 1 case pipeline: opened / referred / prosecuted (counts)",
          itemNe: "चरण १ मुद्दा पाइपलाइन: खुले/सिफारिस/अभियोग (गणना)",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Handoff SLA to CIAA / police with timelines",
          itemNe: "अख्तियार/प्रहरीमा हस्तान्तरण SLA समयसीमासहित",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of the Prime Minister and Council of Ministers; committee chair; Ministry of Law; Inland Revenue Department; Nepal Police; Commission for the Investigation of Abuse of Authority.",
      primaryOwnersNe:
        "प्रधानमन्त्री कार्यालय; समिति अध्यक्ष; कानून मन्त्रालय; आन्तरिक राजस्व विभाग; नेपाल प्रहरी; अख्तियार दुरुपयोग अनुसन्धान आयोग।",
      coordinatingOfficeEn:
        "Single evidence room with chain-of-custody for documents and digital forensics.",
      coordinatingOfficeNe: "कागजात र डिजिटल फरेन्सिकका लागि हिरासत श्रृङ्खलासहित एक प्रमाण कोठा।",
      accountableRolesEn:
        "Committee publishes semi-annual statistics; redacts only where law requires.",
      accountableRolesNe:
        "समितिले अर्धवार्षिक तथ्य प्रकाशन; कानुनले मात्र लुकाउने।",
      timelineEn: "Phase 1: BS 2062/63–2082/83 cohort; Phase 2: BS 2048–2061/62; prosecution handoff continuous.",
      timelineNe: "चरण १: २०६२/६३–२०८२/८३; चरण २: २०४८–२०६१/६२; अभियोग हस्तान्तरण निरन्तर।",
      milestones: [
        {
          en: "Asset verification methodology open to peer review.",
          ne: "सम्पत्ति प्रमाणीकरण विधि सहकर्मी समीक्षायोग्य।",
        },
        {
          en: "Memorandum with CIAA/police on parallel investigations.",
          ne: "समानान्तर छानबिनका लागि अख्तियार/प्रहरीसँग ज्ञापनपत्र।",
        },
        {
          en: "Public ethics rules for committee members and staff.",
          ne: "समिति सदस्य र कर्मचारीका लागि सार्वजनिक नैतिकता नियम।",
        },
      ],
      kpis: [
        {
          metricEn: "Cases referred for prosecution / total completed investigations",
          metricNe: "अभियोगका लागि सिफारिस / पूरा छानबिन कुल",
          howEn: "Committee annual report.",
          howNe: "समिति वार्षिक प्रतिवेदन।",
        },
        {
          metricEn: "Median days from referral to court filing",
          metricNe: "सिफारिसदेखि अदालत दर्तासम्म मध्यक दिन",
          howEn: "Prosecution coordination unit tracking.",
          howNe: "अभियोजन समन्वय एकाइ ट्रयाक।",
        },
      ],
      risks: [
        {
          en: "Selective timing allegations — phases seen as political weapons.",
          ne: "छनोटी समय आरोप — चरण राजनीतिक हतियार देखिन्छ।",
        },
        {
          en: "Leak-driven trials — evidence prejudices fair process.",
          ne: "चुहावट मुद्दा — प्रमाण निष्पक्ष प्रक्रियामा बाधा।",
        },
      ],
      escalation: [
        {
          en: "Supreme Court bar monitors disclosure compliance with fair-trial norms.",
          ne: "सर्वोच्च बारले निष्पक्ष मुद्दा मानकसँग खुलासा अनुपालन निगरानी।",
        },
        {
          en: "Share this point so probes stay lawful (#point-43).",
          ne: "छानबिन कानूनी रहोस् भने साझेदारी गर्नुहोस् (#बुँदा-४३)।",
        },
      ],
      programStatusEn: "🔴 No evidence on file — PMO property investigation committee operations not publicly verified here.",
      programStatusNe: "🔴 प्रमाण दर्ता छैन — प्रधानमन्त्री कार्यालय सम्पत्ति छानबिन समिति सञ्चालन यहाँ प्रमाणित छैन।",
    },
  },
  {
    id: "p44",
    pointNumber: 44,
    category: "Good Governance & Anti-Corruption",
    promise:
      "To promote good governance, control corruption, and strengthen transparency and accountability in public service delivery, prepare a restructuring plan for the National Vigilance Center within 30 days and bring it into implementation.",
    promiseNe:
      "सुशासन प्रवर्द्धन, भ्रष्टाचार नियन्त्रण तथा सार्वजनिक सेवा प्रवाहमा पारदर्शिता र जवाफदेहिता अभिवृद्धि गर्न राष्ट्रिय सतर्कता केन्द्रको पुनर्संरचना योजना ३० दिनभित्र तयार गरी कार्यान्वयनमा ल्याउने।",
    question:
      "What investigative powers, budget line, and reporting chain will the restructured center have, and how will its findings connect to disciplinary and criminal pathways?",
    questionNe:
      "पुनर्संरचित केन्द्रलाई कुन अनुसन्धान अधिकार, बजेट शीर्षक र रिपोर्टिङ श्रृङ्खला, र नतिजा कारबाही र फौजदारी मार्गसँग कसरी जोडिन्छ?",
    whyThisMatters:
      "Vigilance bodies fail when they are advisory-only—clarity on teeth separates signal from symbolism.",
    whyThisMattersNe:
      "सतर्कता निकाय सल्लाह मात्र भए असफल — दाँतको स्पष्टता संकेत र प्रतीक छुट्याउँछ।",
    possiblePathItems: [
      "Mandate comparison with CIAA and ministry inspectors",
      "Published KPIs: cases opened, closed, median time",
      "Secure whistleblower intake with retaliation tracking",
      "Annual public report to Parliament",
    ],
    possiblePathItemsNe: [
      "अख्तियार र मन्त्रालय निरीक्षकसँग जिम्मेवारी तुलना",
      "प्रकाशित KPI: मुद्दा खुले/बन्द, मध्य औसत समय",
      "प्रतिशोध ट्र्याकसहित सुरक्षित उजागरकर्ता प्रवेश",
      "संसदलाई वार्षिक सार्वजनिक प्रतिवेदन",
    ],
    systemInsight:
      "Thirty days to redesign an integrity institution is tight—expect a skeleton charter plus a 180-day build-out plan, or expect drift.",
    systemInsightNe:
      "३० दिनमा पुनर्डिजाइन कडा — खाका चार्टर र १८० दिन निर्माण योजना होइन भने बहाव।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ४४ (National Vigilance Center restructuring; scan Page 8)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ४४ (राष्ट्रिय सतर्कता केन्द्र पुनर्संरचना; स्क्यान पृष्ठ ८)",
    sourceExcerpt:
      "From scan (Page 8, ङ): सुशासन, भ्रष्टाचार नियन्त्रण, सार्वजनिक सेवामा पारदर्शिता/जवाफदेहिता — राष्ट्रिय सतर्कता केन्द्र पुनर्संरचना योजना ३० दिनभित्र तयार गरी कार्यान्वयनमा ल्याउने।",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ८ (ङ): सुशासन प्रवर्द्धन, भ्रष्टाचार नियन्त्रण, सार्वजनिक सेवा प्रवाहमा पारदर्शिता र जवाफदेहिता — राष्ट्रिय सतर्कता केन्द्र पुनर्संरचना ३० दिनभित्र तयार र कार्यान्वयन।",
    layer1: {
      hookEmoji: "👁️",
      hook: "National Vigilance Center — restructured in 30 days with real implementation.",
      hookNe: "राष्ट्रिय सतर्कता केन्द्र — ३० दिनमा पुनर्संरचना वास्तविक कार्यान्वयनसहित।",
      stakeLine: "Advisory-only vigilance is symbolism — teeth need law, budget, and KPIs.",
      stakeLineNe: "सल्लाहमात्र सतर्कता प्रतीक — दाँतका लागि कानुन, बजेट र KPI।",
      coreQuestionShort: "Investigative powers, budget line, link to discipline and courts?",
      coreQuestionShortNe: "अनुसन्धान अधिकार, बजेट शीर्षक, कारबाही र अदालत जोड?",
      coreQuestion:
        "What powers, budget, and reporting chain will the center have; how do findings feed discipline and criminal paths?",
      coreQuestionNe:
        "कुन अधिकार, बजेट, रिपोर्टिङ श्रृङ्खला; नतिजा कारबाही र फौजदारी मार्गसँग कसरी जोडिन्छ?",
      quickScan: [
        {
          item: "30-day restructuring plan published + accountable chief named",
          itemNe: "३० दिन पुनर्संरचना योजना प्रकाशित + जिम्मेवार प्रमुख नाम",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Mandate vs CIAA / ministry inspectors — boundary document public",
          itemNe: "अख्तियार/मन्त्रालय निरीक्षक बनाम जिम्मेवारी — सीमा कागज सार्वजनिक",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Published KPIs: cases opened, closed, median time",
          itemNe: "प्रकाशित KPI: खुले, बन्द, मध्यक समय",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Secure whistleblower channel + retaliation tracking live",
          itemNe: "सुरक्षित उजागरकर्ता च्यानल + प्रतिशोध ट्रयाक लाइभ",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of the Prime Minister and Council of Ministers; Ministry of Federal Affairs and General Administration; Ministry of Home Affairs; Commission for the Investigation of Abuse of Authority for boundary clarity.",
      primaryOwnersNe:
        "प्रधानमन्त्री कार्यालय; संघीय मामिला मन्त्रालय; गृह मन्त्रालय; सीमा स्पष्टताका लागि अख्तियार।",
      coordinatingOfficeEn:
        "Integrity programme office with case management and parliamentary reporting cadence.",
      coordinatingOfficeNe: "मुद्दा व्यवस्थापन र संसदीय प्रतिवेदन तालसहित सुशासन कार्यक्रम कार्यालय।",
      accountableRolesEn:
        "Head presents annual report to Parliament; follow-up questions on open cases.",
      accountableRolesNe:
        "प्रमुखले वार्षिक प्रतिवेदन संसदमा; खुला मुद्दामा पछिको प्रश्न।",
      timelineEn: "T+30 days: plan approved; T+90: first KPI publication; Y1: full staffing per plan.",
      timelineNe: "T+३० दिन: योजना स्वीकृत; T+९०: पहिलो KPI प्रकाशन; Y१: योजना अनुसार दरबन्दी।",
      milestones: [
        {
          en: "Memorandum with CIAA on case referrals and non-duplication.",
          ne: "मुद्दा सिफारिस र दोहोरो नहोस् भन्ने अख्तियारसँग ज्ञापनपत्र।",
        },
        {
          en: "Staff integrity screening and rotation policy published.",
          ne: "कर्मचारी सुशासन जाँच र रोटेसन नीति प्रकाशन।",
        },
        {
          en: "Citizen-facing annual report with anonymized case studies.",
          ne: "बेनाम केस अध्ययनसहित नागरिकमुखी वार्षिक प्रतिवेदन।",
        },
      ],
      kpis: [
        {
          metricEn: "Cases producing disciplinary action / referrals (%)",
          metricNe: "कारबाही/सिफारिस भएका मुद्दा (%)",
          howEn: "Case tracking system.",
          howNe: "मुद्दा ट्रयाक प्रणाली।",
        },
        {
          metricEn: "Median investigation length (days) vs target",
          metricNe: "छानबिन मध्यक लम्बाइ (दिन) बनाम लक्ष्य",
          howEn: "Quarterly management report.",
          howNe: "त्रैमासिक व्यवस्थापन प्रतिवेदन।",
        },
      ],
      risks: [
        {
          en: "Toothless redesign — same staff, new letterhead.",
          ne: "दाँतविहीन पुनर्डिजाइन — उही कर्मचारी, नयाँ लेटरहेड।",
        },
        {
          en: "Overlap with CIAA — cases stall in jurisdictional fights.",
          ne: "अख्तियारसँग दोहोरो — क्षेत्रीय झगडामा मुद्दा अड्किन्छ।",
        },
      ],
      escalation: [
        {
          en: "CSO audit of whistleblower channel safety (annual).",
          ne: "उजागरकर्ता च्यानल सुरक्षा वार्षिक नागरिक समाज लेखापरीक्षा।",
        },
        {
          en: "Share this point so vigilance gains teeth (#point-44).",
          ne: "सतर्कताले दाँत पाओस् भने साझेदारी गर्नुहोस् (#बुँदा-४४)।",
        },
      ],
      programStatusEn: "🟡 At risk — 30-day National Vigilance Center restructuring not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ३० दिन राष्ट्रिय सतर्कता केन्द्र पुनर्संरचना यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p45",
    pointNumber: 45,
    category: "Good Governance & Anti-Corruption",
    promise:
      "To systematize corruption control, Nepal Rastra Bank shall within 100 days establish an Integrated Digital Asset Registry covering bank accounts, digital wallets, share investments, and other financial activities; implement a risk-based red-flag system; automatically identify suspicious transactions; and advance investigation through relevant bodies.",
    promiseNe:
      "भ्रष्टाचार नियन्त्रणलाई प्रणालीगत बनाउन नेपाल राष्ट्र बैङ्कले १०० दिनभित्र बैंक खाता, डिजिटल वालेट, शेयर लगानी तथा अन्य वित्तीय गतिविधिहरूलाई समेट्ने समन्वित डिजिटल सम्पत्ति लगत (Integrated Digital Asset Registry) स्थापना गर्ने, सोमा जोखिममा आधारित सङ्केत (Risk-Based Red Flag) प्रणाली लागू गर्ने तथा सन्देहास्पद कारोबारहरूको स्वचालित पहिचान गरी सम्बन्धित निकायमार्फत अनुसन्धान प्रक्रिया अघि बढाउने।",
    question:
      "What legal gateway allows NRB to aggregate wallet and securities data, who may query the registry, and how are false positives remedied for ordinary account holders?",
    questionNe:
      "NRB ले वालेट र प्रतिभूति डेटा मिसाउन कानुनी मार्ग के, कोले दर्ता हेर्न पाउँछ, र साधारण खातावालाका लागि गलत सङ्केतको उपचार के?",
    whyThisMatters:
      "Financial surveillance architecture must balance enforcement with privacy—design choices here echo for decades.",
    whyThisMattersNe:
      "वित्तीय निगरानी पूर्वाधारले कार्यान्वयन र गोपनीयता मिलाउनुपर्छ — यहाँको डिजाइन दशकौंसम्म गुञ्जिन्छ।",
    possiblePathItems: [
      "Data protection impact assessment published",
      "Role-based access with immutable audit logs",
      "Human-review layer before account freezes",
      "Appeal and compensation rules for mistaken flags",
    ],
    possiblePathItemsNe: [
      "डेटा संरक्षण प्रभाव मूल्याङ्कन प्रकाशन",
      "अपरिवर्तनीय अभिलेखसहित भूमिकामूलक पहुँच",
      "खाता फ्रिज अघि मानव समीक्षा",
      "गलत सङ्केतका लागि पुनरावेदन र क्षतिपूर्ति नियम",
    ],
    systemInsight:
      "“Automatic suspicion” scales fast—without judicial thresholds, banks become parallel police.",
    systemInsightNe:
      "«स्वचालित सन्देह» छिटो बढ्छ — न्यायिक थ्रेसहोल्ड बिना बैंक समानान्तर प्रहरी बन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ४५ (NRB Integrated Digital Asset Registry; scan Page 8)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ४५ (समन्वित डिजिटल सम्पत्ति लगत; स्क्यान पृष्ठ ८)",
    sourceExcerpt:
      "From scan (Page 8, ङ): NRB १०० दिन — Integrated Digital Asset Registry (बैंक खाता, डिजिटल वालेट, शेयर लगानी, अन्य वित्तीय गतिविधि); Risk-Based Red Flag; सन्देहास्पद कारोबार स्वचालित पहिचान; सम्बन्धित निकायमार्फत अनुसन्धान।",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ८ (ङ): नेपाल राष्ट्र बैंक १०० दिन — समन्वित डिजिटल सम्पत्ति लगत; जोखिममा आधारित सङ्केत प्रणाली; सन्देहास्पद कारोबार स्वचालित पहिचान; सम्बन्धित निकायमार्फत अनुसन्धान।",
    layer1: {
      hookEmoji: "🏦",
      hook: "NRB Integrated Digital Asset Registry in 100 days — surveillance with rules.",
      hookNe: "१०० दिनमा राष्ट्र बैंक समन्वित डिजिटल सम्पत्ति लगत — नियमसहित निगरानी।",
      stakeLine: "Aggregation without legal gateways and appeals turns banks into parallel police.",
      stakeLineNe: "कानुनी मार्ग र पुनरावेदन बिना मिसाउनु बैंकलाई समानान्तर प्रहरी बनाउँछ।",
      coreQuestionShort: "Lawful basis to merge wallet & securities data — who queries; false positives?",
      coreQuestionShortNe: "वालेट र प्रतिभूति मिसाउन कानुनी आधार — को हेर्छ; गलत सङ्केत?",
      coreQuestion:
        "What legal gateway allows NRB to aggregate data; who may query the registry; how are false positives remedied for ordinary account holders?",
      coreQuestionNe:
        "NRB ले डेटा मिसाउन कानुनी मार्ग के; कोले दर्ता हेर्न पाउँछ; साधारण खातावालाका लागि गलत सङ्केत उपचार के?",
      quickScan: [
        {
          item: "100-day milestone: registry live with published lawful-basis schedule",
          itemNe: "१०० दिन कोसेढुङ्गा: प्रकाशित कानुनी आधार तालिकासहित लगत लाइभ",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Role-based access + immutable audit log for every query",
          itemNe: "भूमिकामूलक पहुँच + प्रत्येक खोजीका लागि अपरिवर्तनीय लग",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Human-review gate before account freeze / STR escalation",
          itemNe: "खाता फ्रिज/STR उचालन अघि मानव समीक्षा ढोका",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Published false-positive remedy SLA + compensation pathway",
          itemNe: "गलत सङ्केत उपचार SLA + क्षतिपूर्ति मार्ग प्रकाशित",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Nepal Rastra Bank (Financial Information Unit / supervision); Ministry of Finance; Ministry of Law; Nepal Police financial crime units; banks, PSPs, and capital-market regulators for feeds.",
      primaryOwnersNe:
        "नेपाल राष्ट्र बैंक (वित्तीय सूचना एकाइ/सुपरभिजन); अर्थ मन्त्रालय; कानून मन्त्रालय; वित्तीय अपराध एकाइ प्रहरी; फिडका लागि बैंक, भुक्तानी सेवा र पूँजी बजार नियामक।",
      coordinatingOfficeEn:
        "National asset registry programme office with DPIA and sector onboarding scorecards.",
      coordinatingOfficeNe: "DPIA र क्षेत्र अनबोर्डिङ स्कोरकार्डसहित राष्ट्रिय सम्पत्ति लगत कार्यक्रम कार्यालय।",
      accountableRolesEn:
        "NRB governor attests quarterly to proportionality and error rates; red-team review annual.",
      accountableRolesNe:
        "राष्ट्र बैंक गभर्नरले त्रैमासिक अनुपात र त्रुटि दर प्रमाणित; वार्षिक रेड-टिम।",
      timelineEn: "T+100 days: registry operational with pilot institutions; Y1: full sector coverage roadmap.",
      timelineNe: "T+१०० दिन: पाइलट संस्थासहित लगत सञ्चालन; Y१: पूर्ण क्षेत्र समेट्ने रोडम्याप।",
      milestones: [
        {
          en: "Published DPIA + data minimization catalogue for the registry.",
          ne: "लगतका लागि प्रकाशित DPIA र न्यूनतम डेटा सूची।",
        },
        {
          en: "Memoranda with securities and wallet providers on secure feeds.",
          ne: "सुरक्षित फिडका लागि प्रतिभूति र वालेट प्रदायकसँग ज्ञापनपत्र।",
        },
        {
          en: "Judicial threshold policy for automated referrals to law enforcement.",
          ne: "कानुन कार्यान्वयनमा स्वचालित सिफारिसका लागि न्यायिक थ्रेस नीति।",
        },
      ],
      kpis: [
        {
          metricEn: "False positive rate vs investigations opened (quarterly)",
          metricNe: "गलत सकारात्मक दर बनाम खुलेका छानबिन (त्रैमासिक)",
          howEn: "FIU analytics; sampled audit.",
          howNe: "FIU विश्लेषण; नमूना लेखापरीक्षा।",
        },
        {
          metricEn: "Median time to clear a mistaken flag (citizen SLA)",
          metricNe: "गलत सङ्केत हटाउन मध्यक समय (नागरिक SLA)",
          howEn: "Helpdesk ticket data.",
          howNe: "हेल्पडेस्क टिकट डेटा।",
        },
      ],
      risks: [
        {
          en: "Mass surveillance creep — registry used beyond anti-corruption mandate.",
          ne: "व्यापक निगरानी बढो — लगत भ्रष्टाचारभन्दा बढी प्रयोग।",
        },
        {
          en: "Data breach — single pane of glass for attackers.",
          ne: "डेटा चुहावट — आक्रमणकर्ताका लागि एकै झ्याल।",
        },
      ],
      escalation: [
        {
          en: "Privacy commissioner or court review of proportionality (if established).",
          ne: "अनुपातिकताका लागि गोपनीयता आयुक्त वा अदालत समीक्षा (स्थापना भएमा)।",
        },
        {
          en: "Share this point so the registry stays lawful (#point-45).",
          ne: "लगत कानूनी रहोस् भने साझेदारी गर्नुहोस् (#बुँदा-४५)।",
        },
      ],
      programStatusEn: "🔴 No evidence on file — NRB Integrated Digital Asset Registry 100-day delivery not publicly verified here.",
      programStatusNe: "🔴 प्रमाण दर्ता छैन — राष्ट्र बैंक समन्वित डिजिटल सम्पत्ति लगत १०० दिन वितरण यहाँ प्रमाणित छैन।",
    },
  },
  {
    id: "p46",
    pointNumber: 46,
    category: "Good Governance & Anti-Corruption",
    promise:
      "Issue the second National Action Plan against corruption within 15 days, aligned with the United Nations Convention against Corruption.",
    promiseNe:
      "भ्रष्टाचार विरुद्धको संयुक्त राष्ट्रसंघीय अभिसन्धि अनुकूल हुने गरी भ्रष्टाचार विरुद्धको दोस्रो राष्ट्रिय कार्ययोजना १५ दिनभित्र जारी गर्ने।",
    question:
      "How does the plan update indicators from the first NAP, which ministries own each commitment, and what independent review will track UNCAC alignment annually?",
    questionNe:
      "पहिलो कार्ययोजनाका सूचक कसरी अद्यावधिक, प्रत्येक प्रतिबद्धता कुन मन्त्रालयको, र UNCAC मिलान वार्षिक कसले स्वतन्त्र समीक्षा गर्छ?",
    whyThisMatters:
      "UNCAC alignment is a diplomatic promise to citizens too—it should be measurable, not a PDF on a website.",
    whyThisMattersNe:
      "UNCAC मिलान कूटनीतिमात्र होइन नागरिकप्रति पनि — मापयोग्य हुनुपर्छ, वेबसाइटको PDF मात्र होइन।",
    possiblePathItems: [
      "Indicator dashboard with baselines and targets",
      "CSO seat on implementation committee",
      "Gap analysis vs prior NAP commitments",
      "Parliamentary briefing schedule",
    ],
    possiblePathItemsNe: [
      "आधाररेखा र लक्ष्यसहित सूचक ड्यासबोर्ड",
      "कार्यान्वयन समितिमा नागरिक समाज सिट",
      "अघिल्लो NAP सँग अन्तर विश्लेषण",
      "संसदीय ब्रिफिङ तालिका",
    ],
    systemInsight:
      "Fifteen days to launch a whole-of-government plan invites copy-paste—guardrails are explicit budget lines per chapter.",
    systemInsightNe:
      "पन्ध्र दिनमा सरकारव्यापी योजना प्रतिलिपि जोखिम — अध्याय प्रति बजेट रेखा स्पष्ट होस्।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ४६ (second national anti-corruption action plan / UNCAC; scan Page 9)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ४६ (दोस्रो भ्रष्टाचार विरुद्ध राष्ट्रिय कार्ययोजना; स्क्यान पृष्ठ ९)",
    sourceExcerpt:
      "From scan (Page 9): भ्रष्टाचार विरुद्धको संयुक्त राष्ट्रसंघीय अभिसन्धि अनुकूल दोस्रो राष्ट्रिय कार्ययोजना १५ दिनभित्र जारी।",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ९: भ्रष्टाचार विरुद्धको संयुक्त राष्ट्रसंघीय अभिसन्धि अनुकूल दोस्रो राष्ट्रिय कार्ययोजना १५ दिनभित्र जारी।",
    layer1: {
      hookEmoji: "📋",
      hook: "Second National Anti-Corruption Action Plan in 15 days — UNCAC-aligned and measurable.",
      hookNe: "१५ दिनमा दोस्रो भ्रष्टाचार विरुद्ध राष्ट्रिय कार्ययोजना — UNCAC अनुरूप र मापयोग्य।",
      stakeLine: "Plans are only as good as indicators, owners, and someone independent checking the math.",
      stakeLineNe: "योजना सूचक, मालिक र स्वतन्त्र जाँच बिना मात्र कागज।",
      coreQuestionShort: "Updated indicators vs first NAP — who owns each line; who audits UNCAC fit yearly?",
      coreQuestionShortNe: "पहिलो NAP सँग सूचक — को मालिक; वार्षिक UNCAC मिलान कोले?",
      coreQuestion:
        "How does the plan update indicators from the first NAP; which ministries own each commitment; what independent review tracks UNCAC alignment annually?",
      coreQuestionNe:
        "पहिलो NAP का सूचक कसरी अद्यावधिक; प्रत्येक प्रतिबद्धता कुन मन्त्रालय; वार्षिक UNCAC मिलान स्वतन्त्र समीक्षा के?",
      quickScan: [
        {
          item: "NAP2 published with indicator table (baseline, target, year)",
          itemNe: "NAP२ सूचक तालिकासहित (आधार, लक्ष्य, वर्ष) प्रकाशित",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Ministry ownership matrix + lead officer per commitment",
          itemNe: "मन्त्रालय मालिकाना म्याट्रिक्स + प्रति प्रतिबद्धता प्रमुख अधिकृत",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Gap analysis vs first NAP + reasons for dropped items",
          itemNe: "पहिलो NAP सँग अन्तर विश्लेषण + हटाइएका वस्तुका कारण",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Independent annual UNCAC alignment review (third party or parliament)",
          itemNe: "वार्षिक स्वतन्त्र UNCAC मिलान समीक्षा (तेस्रो पक्ष वा संसद)",
          status: "❌ Not in place",
          statusNe: "❌ अझै छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Commission for the Investigation of Abuse of Authority; Ministry of Home Affairs; Ministry of Federal Affairs and General Administration; line ministries per commitment; OPMCM for coordination.",
      primaryOwnersNe:
        "अख्तियार; गृह मन्त्रालय; संघीय मामिला मन्त्रालय; प्रतिबद्धता अनुसार मन्त्रालय; समन्वय प्रधानमन्त्री कार्यालय।",
      coordinatingOfficeEn:
        "NAP implementation unit with public dashboard and quarterly implementation reports.",
      coordinatingOfficeNe: "सार्वजनिक ड्यासबोर्ड र त्रैमासिक कार्यान्वयन प्रतिवेदनसहित NAP कार्यान्वयन एकाइ।",
      accountableRolesEn:
        "Implementation committee minutes public; CSO observer seat if committed.",
      accountableRolesNe:
        "कार्यान्वयन समिति मिनेट सार्वजनिक; वाचा भए नागरिक समाज पर्यवेक्षक सिट।",
      timelineEn: "T+15 days: NAP2 issued; Y1–5: rolling indicator updates; annual independent review.",
      timelineNe: "T+१५ दिन: NAP२ जारी; Y१–५: सूचक अद्यावधिक; वार्षिक स्वतन्त्र समीक्षा।",
      milestones: [
        {
          en: "Public indicator dashboard with traffic-light status per chapter.",
          ne: "अध्याय प्रति ट्राफिक लाइट स्थितिसहित सार्वजनिक सूचक ड्यासबोर्ड।",
        },
        {
          en: "Parliamentary briefing schedule for progress and blockers.",
          ne: "प्रगति र अवरोधका लागि संसदीय ब्रिफिङ तालिका।",
        },
        {
          en: "Mid-term review with citizen and private-sector input.",
          ne: "नागरिक र निजी क्षेत्र इनपुटसहित मध्यावधि समीक्षा।",
        },
      ],
      kpis: [
        {
          metricEn: "% of NAP commitments on track (quarterly self-report + audit sample)",
          metricNe: "NAP प्रतिबद्धतामध्ये मार्गमा % (त्रैमासिक आत्मप्रतिवेदन + नमूना लेखापरीक्षा)",
          howEn: "Dashboard methodology published.",
          howNe: "ड्यासबोर्ड विधि प्रकाशित।",
        },
        {
          metricEn: "Corruption cases filed / concluded (baseline vs NAP target)",
          metricNe: "भ्रष्टाचार मुद्दा दायर/टुङ्गो (आधार बनाम NAP लक्ष्य)",
          howEn: "CIAA + court statistics.",
          howNe: "अख्तियार र अदालत तथ्याङ्क।",
        },
      ],
      risks: [
        {
          en: "Copy-paste NAP — indicators unchanged from first plan.",
          ne: "प्रतिलिपि NAP — सूचक पहिलो जस्तै।",
        },
        {
          en: "No budget lines — ministries sign but cannot spend.",
          ne: "बजेट रेखा छैन — मन्त्रालय हस्ताक्षर तिर्न सक्दैन।",
        },
      ],
      escalation: [
        {
          en: "Media compares NAP2 indicators to first NAP and budget allocations.",
          ne: "मिडियाले NAP२ सूचक पहिलो NAP र बजेट विनियोजनसँग तुलना।",
        },
        {
          en: "Share this point so UNCAC promises stay measurable (#point-46).",
          ne: "UNCAC वाचा मापयोग्य रहोस् भने साझेदारी गर्नुहोस् (#बुँदा-४६)।",
        },
      ],
      programStatusEn: "🟡 At risk — second NAP / UNCAC alignment not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — दोस्रो कार्ययोजना/UNCAC मिलान यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p47",
    pointNumber: 47,
    category: "Good Governance & Anti-Corruption",
    promise:
      "Within 30 days issue a National Integrity Policy to promote integrity, whistleblower protection, and conflict-of-interest management, and advance drafting and amendment processes for related laws.",
    promiseNe:
      "सदाचारिता प्रवर्द्धन, सूचनादाताको संरक्षण (Whistleblower Protection) र हित/स्वार्थको द्वन्द्व (Conflict of Interest) व्यवस्थापनका लागि ३० दिनभित्र राष्ट्रिय सदाचार नीति जारी गर्ने तथा सम्बन्धित कानून तर्जुमा तथा संशोधन प्रक्रिया अघि बढाउने।",
    question:
      "Will whistleblower rewards and anti-retaliation cover private-sector reporters on public contracts, and how are conflicts of interest declared and published for elected and senior appointed officials?",
    questionNe:
      "सूचनादाता पुरस्कार र प्रतिशोध निषेध सार्वजनिक ठेक्कामा निजी क्षेत्रलाई पनि छ, र हित द्वन्द्व निर्वाचित र वरिष्ठ नियुक्त अधिकारीले कसरी घोषणा र प्रकाशन गर्छन्?",
    whyThisMatters:
      "Integrity policy without enforceable retaliation bans is a suggestion box bolted to a wall.",
    whyThisMattersNe:
      "प्रतिशोध निषेध बिना सदाचार नीति भित्ते सुझाव पेटी मात्र।",
    possiblePathItems: [
      "Model disclosure form and public registry cadence",
      "Independent integrity office or ombudsperson mandate",
      "Protected channels: legal aid and interim income support",
      "Training for managers on handling reports",
    ],
    possiblePathItemsNe: [
      "नमूना खुलाइ फारम र सार्वजनिक दर्ता ताल",
      "स्वतन्त्र सदाचार कार्यालय वा अधिवक्ता जिम्मा",
      "संरक्षित मार्ग: कानुनी सहायता र अन्तरिम आय सहयोग",
      "प्रतिवेदन व्यवस्थापनका लागि प्रबन्धक तालिम",
    ],
    systemInsight:
      "Thirty days for policy plus law roadmap is ambitious—publish a sequenced bill list or ministries will stall behind ambiguity.",
    systemInsightNe:
      "३० दिनमा नीति र कानुन रोडम्याप महत्वाकांक्षी — विधेयक तालिका प्रकाशन नभए मन्त्रालय अस्पष्टतामा अड्किन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ४७ (National Integrity Policy; whistleblower & COI; scan Page 9)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ४७ (राष्ट्रिय सदाचार नीति; स्क्यान पृष्ठ ९)",
    sourceExcerpt:
      "From scan (Page 9): ३० दिनभित्र राष्ट्रिय सदाचार नीति — सदाचारिता, Whistleblower Protection, Conflict of Interest व्यवस्थापन; सम्बन्धित कानून तर्जुमा/संशोधन प्रक्रिया अघि बढाउने।",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ९: सदाचारिता, सूचनादाताको संरक्षण (Whistleblower Protection), हित/स्वार्थको द्वन्द्व (Conflict of Interest) — ३० दिनमा राष्ट्रिय सदाचार नीति; सम्बन्धित कानून तर्जुमा/संशोधन अघि बढाउने।",
    layer1: {
      hookEmoji: "🛡️",
      hook: "National Integrity Policy in 30 days — whistleblowers, conflicts of interest, and follow-on laws.",
      hookNe: "३० दिनमा राष्ट्रिय सदाचार नीति — सूचनादाता, हित द्वन्द्व र पछिका कानुन।",
      stakeLine: "Without enforceable anti-retaliation, integrity policy is a suggestion box.",
      stakeLineNe: "कार्यान्वयनयोग्य प्रतिशोध निषेध बिना सदाचार नीति सुझाव पेटी।",
      coreQuestionShort: "Private-sector reporters on public contracts — rewards and protection equal?",
      coreQuestionShortNe: "सार्वजनिक ठेक्कामा निजी सूचनादाता — पुरस्कार र सुरक्षा बराबर?",
      coreQuestion:
        "Will whistleblower rewards and anti-retaliation cover private-sector reporters on public contracts; how are conflicts of interest declared and published for elected and senior officials?",
      coreQuestionNe:
        "सार्वजनिक ठेक्कामा निजी सूचनादातामा पुरस्कार र प्रतिशोध निषेध; निर्वाचित र वरिष्ठ अधिकारीको हित द्वन्द्व कसरी घोषणा र प्रकाशन?",
      quickScan: [
        {
          item: "30-day policy text public + sequenced bill list (dates)",
          itemNe: "३० दिन नीति पाठ सार्वजनिक + मितिसहित विधेयक तालिका",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Whistleblower: protected channels, legal aid, interim support rules",
          itemNe: "सूचनादाता: संरक्षित मार्ग, कानुनी सहायता, अन्तरिम सहयोग नियम",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "COI: disclosure form + public registry cadence for senior roles",
          itemNe: "COI: खुलाइ फारम + वरिष्ठ भूमिकाका लागि सार्वजनिक दर्ता ताल",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Independent integrity office or ombud mandate defined",
          itemNe: "स्वतन्त्र सदाचार कार्यालय वा अधिवक्ता जिम्मा परिभाषित",
          status: "❌ Not in place",
          statusNe: "❌ अझै छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Federal Affairs and General Administration; Ministry of Law; CIAA; OPMCM; Public Service Commission for conduct rules.",
      primaryOwnersNe:
        "संघीय मामिला मन्त्रालय; कानून मन्त्रालय; अख्तियार; प्रधानमन्त्री कार्यालय; आचरण नियमका लागि लोक सेवा आयोग।",
      coordinatingOfficeEn:
        "Integrity policy secretariat with cross-ministry whistleblower intake and case tracking.",
      coordinatingOfficeNe: "अन्तरमन्त्रालय सूचनादाता दर्ता र मुद्दा ट्रयाकसहित सदाचार नीति सचिवालय।",
      accountableRolesEn:
        "Annual public report on retaliation complaints and outcomes.",
      accountableRolesNe:
        "प्रतिशोध उजुरी र नतिजाको वार्षिक सार्वजनिक प्रतिवेदन।",
      timelineEn: "T+30 days: policy gazetted; T+12 months: primary bills tabled per roadmap.",
      timelineNe: "T+३० दिन: नीति राजपत्र; T+१२ महिना: रोडम्याप अनुसार मुख्य विधेयक पेश।",
      milestones: [
        {
          en: "Model COI disclosure form and verification process published.",
          ne: "नमूना COI खुलाइ फारम र प्रमाणीकरण प्रक्रिया प्रकाशन।",
        },
        {
          en: "Manager training curriculum on handling internal reports.",
          ne: "आन्तरिक प्रतिवेदन व्यवस्थापनका लागि प्रबन्धक तालिम पाठ्यक्रम।",
        },
        {
          en: "Pilot whistleblower rewards fund with published criteria.",
          ne: "प्रकाशित मापदण्डसहित सूचनादाता पुरस्कार कोष पाइलट।",
        },
      ],
      kpis: [
        {
          metricEn: "Whistleblower cases opened / resolved; median days",
          metricNe: "सूचनादाता मुद्दा खुले/टुङ्गो; मध्यक दिन",
          howEn: "Integrity office case system.",
          howNe: "सदाचार कार्यालय मुद्दा प्रणाली।",
        },
        {
          metricEn: "COI declarations filed on time (%) by senior cohort",
          metricNe: "वरिष्ठ समूह समयमै दाखिल COI घोषणा (%)",
          howEn: "Registry export; spot audits.",
          howNe: "दर्ता निकासा; स्पट लेखापरीक्षा।",
        },
      ],
      risks: [
        {
          en: "Weak sanctions — disclosures filed but ignored.",
          ne: "कमजोर सजाय — घोषणा दर्ता, बेवास्ता।",
        },
        {
          en: "Employer retaliation — private sector fears blacklisting.",
          ne: "रोजगारदाता प्रतिशोध — निजी क्षेत्र कालोसूची डराउँछ।",
        },
      ],
      escalation: [
        {
          en: "Labour and industry chambers review whistleblower coverage gaps.",
          ne: "श्रम र उद्योग महासंघले सूचनादाता कभरेज खाली समीक्षा।",
        },
        {
          en: "Share this point so integrity rules bite (#point-47).",
          ne: "सदाचार नियम लागू होस् भने साझेदारी गर्नुहोस् (#बुँदा-४७)।",
        },
      ],
      programStatusEn: "🟡 At risk — 30-day National Integrity Policy delivery not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ३० दिन राष्ट्रिय सदाचार नीति वितरण यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p48",
    pointNumber: 48,
    category: "Procurement & Project Management",
    promise:
      "To control delays, cost escalation, poor quality work, and corruption in public procurement, amend the Public Procurement Act within 30 days to implement concepts such as Value for Money, Life Cycle Costing, E-Government Marketplace, and Performance-Based Contracting; make procurement fully digital, transparent, and trackable; and encourage competition.",
    promiseNe:
      "सार्वजनिक खरिद प्रक्रियामा हुने ढिलासुस्ती, लागत वृद्धि, गुणस्तरहीन कार्य तथा भ्रष्टाचार नियन्त्रण गर्न सार्वजनिक खरिद ऐनलाई ३० दिनभित्र संशोधन गरी Value for Money, Life Cycle Costing, EGov Market Place तथा Performance-Based Contracting जस्ता अवधारणाहरू लागू गर्ने। खरिद प्रक्रियालाई पूर्णतः डिजिटल, पारदर्शी तथा ट्र्याकिङयोग्य बनाउने तथा प्रतिस्पर्धालाई प्रोत्साहन गर्ने।",
    question:
      "What migration timeline moves legacy tenders onto the digital marketplace, how are lifecycle costs audited, and what safeguards prevent performance pay from becoming patronage?",
    questionNe:
      "विरासत टेण्डर डिजिटल मार्केटप्लेसमा कुन समयरेखामा सर्छ, जीवनचक्र लागत कसरी लेखापरीक्षण हुन्छ, र प्रदर्शन भुक्तानी पोखरा नबनोस् भनेर के सुरक्षा छ?",
    whyThisMatters:
      "Procurement is where money meets discretion—digital rails help only if rule changes close classic loopholes.",
    whyThisMattersNe:
      "खरिद पैसा र विवेक भेटिने ठाउँ हो — नियमले प्वाल बन्द नगरे डिजिटल रेल मात्र होइन।",
    possiblePathItems: [
      "Side-by-side old vs new process map for bidders",
      "Open data on bid evaluation criteria per sector",
      "Independent audit of first 100 digital contracts",
      "SME set-asides with simplified compliance",
    ],
    possiblePathItemsNe: [
      "बोलपत्रदाताका लागि पुरानो बनाम नयाँ प्रक्रिया नक्सा",
      "क्षेत्रअनुसार मूल्याङ्कन मापदण्ड खुला डेटा",
      "पहिलो १०० डिजिटल सम्झौताको स्वतन्त्र लेखापरीक्षण",
      "सरलीकृत अनुपालनसहित साना उद्योग कोटा",
    ],
    systemInsight:
      "Thirty-day statutory amendments need a freeze on unrelated riders—otherwise procurement reform becomes a Christmas tree bill.",
    systemInsightNe:
      "३० दिने ऐन संशोधनमा अनसम्बन्धित राइडर रोक्नुहोस् — नत्र खरिद सुधार क्रिसमस रूख विधेयक बन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ४८ (Public Procurement Act amendment; scan Page 9, section च)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ४८ (सार्वजनिक खरिद ऐन संशोधन; स्क्यान पृष्ठ ९, खण्ड च)",
    sourceExcerpt:
      "From scan (Page 9, च): सार्वजनिक खरिद ऐन ३० दिनमा संशोधन — Value for Money, Life Cycle Costing, EGov Market Place, Performance-Based Contracting; खरिद पूर्ण डिजिटल, पारदर्शी, ट्र्याकिङयोग्य; प्रतिस्पर्धा प्रोत्साहन।",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ९ (च): ढिलासुस्ती, लागत वृद्धि, गुणस्तरहीन कार्य, भ्रष्टाचार नियन्त्रण — खरिद ऐन ३० दिनमा संशोधन; VfM, Life Cycle Costing, EGov Market Place, Performance-Based Contracting; पूर्ण डिजिटल, पारदर्शी, ट्र्याकिङयोग्य।",
    layer1: {
      hookEmoji: "🛒",
      hook: "Public Procurement Act in 30 days — VfM, lifecycle cost, e-marketplace, performance contracts.",
      hookNe: "३० दिनमा सार्वजनिक खरिद ऐन — मूल्यका लागि पैसा, जीवनचक्र लागत, इ-मार्केटप्लेस, प्रदर्शन सम्झौता।",
      stakeLine: "Digital rails help only if statutory text closes classic loopholes — not just new portals.",
      stakeLineNe: "कानुनी पाठले प्वाल बन्द नगरे डिजिटल रेल मात्र — नयाँ पोर्टल होइन।",
      coreQuestionShort: "Legacy tenders on e-marketplace — when; lifecycle audits — who; perf pay — anti-patronage?",
      coreQuestionShortNe: "विरासत टेण्डर इ-मार्केटमा कहिले; जीवनचक्र लेखापरीक्षा को; प्रदर्शन भुक्तानी पोखरा रोक?",
      coreQuestion:
        "What migration timeline puts legacy tenders on the digital marketplace; how are lifecycle costs audited; what stops performance pay becoming patronage?",
      coreQuestionNe:
        "विरासत टेण्डर डिजिटल मार्केटप्लेसमा कुन समयरेखा; जीवनचक्र लागत कसरी लेखापरीक्षण; प्रदर्शन भुक्तानी पोखरा नबनोस् भने के सुरक्षा?",
      quickScan: [
        {
          item: "30-day amendment gazetted + consolidated diff vs prior Act",
          itemNe: "३० दिन संशोधन राजपत्र + पुरानो ऐनसँग एकीकृत फरक",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "E-Government Marketplace go-live date + mandatory lot categories",
          itemNe: "इ-सरकार मार्केटप्लेस गो-लाइभ मिति + अनिवार्य लट कोटी",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Life-cycle costing methodology + audit role (AG / third party)",
          itemNe: "जीवनचक्र लागत विधि + लेखापरीक्षा भूमिका (महालेखा/तेस्रो पक्ष)",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Performance-based contracting: KPI schedule + anti-patronage safeguards",
          itemNe: "प्रदर्शन आधारित सम्झौता: KPI तालिका + पोखरा विरुद्ध सुरक्षा",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Public Procurement Monitoring Office; Ministry of Finance; Ministry of Federal Affairs and General Administration; PPMO IT; line ministries as procuring entities.",
      primaryOwnersNe:
        "सार्वजनिक खरिद अनुगमन कार्यालय; अर्थ मन्त्रालय; संघीय मामिला मन्त्रालय; PPMO IT; खरिद निकाय मन्त्रालय।",
      coordinatingOfficeEn:
        "Procurement reform programme office with bidder FAQ and sector rollout calendar.",
      coordinatingOfficeNe: "बोलपत्रदाता प्रश्नोत्तर र क्षेत्र रोलआउट पात्रोसहित खरिद सुधार कार्यक्रम कार्यालय।",
      accountableRolesEn:
        "Head of PPMO signs quarterly on digital adoption rate and open contracting data quality.",
      accountableRolesNe:
        "PPMO प्रमुखले त्रैमासिक डिजिटल अपनाउने दर र खुला खरिद डेटा गुणस्तर हस्ताक्षर।",
      timelineEn: "T+30 days: Act in force; T+90: first mandatory e-marketplace lots; Y1: lifecycle pilots.",
      timelineNe: "T+३० दिन: ऐन लागू; T+९०: पहिलो अनिवार्य इ-मार्केटप्लेस लट; Y१: जीवनचक्र पाइलट।",
      milestones: [
        {
          en: "Side-by-side old vs new process map for bidders (all languages).",
          ne: "बोलपत्रदाताका लागि पुरानो बनाम नयाँ प्रक्रिया नक्सा (सबै भाषा)।",
        },
        {
          en: "Independent audit of first 100 fully digital contracts.",
          ne: "पहिलो १०० पूर्ण डिजिटल सम्झौताको स्वतन्त्र लेखापरीक्षा।",
        },
        {
          en: "Open data publication of evaluation criteria by sector.",
          ne: "क्षेत्रअनुसार मूल्याङ्कन मापदण्ड खुला डेटा प्रकाशन।",
        },
      ],
      kpis: [
        {
          metricEn: "% of tender value through digital marketplace",
          metricNe: "डिजिटल मार्केटप्लेसबाट खरिद मूल्य %",
          howEn: "PPMO analytics export.",
          howNe: "PPMO विश्लेषण निकासा।",
        },
        {
          metricEn: "Variation order value / original contract value (by sector)",
          metricNe: "भेरिएसन मूल्य / मूल सम्झौता मूल्य (क्षेत्रअनुसार)",
          howEn: "Statistical anomaly flags in monitoring system.",
          howNe: "निगरानी प्रणालीमा तथ्याङ्क विसंगति चिन्ह।",
        },
      ],
      risks: [
        {
          en: "Christmas-tree bill — unrelated riders stall reform.",
          ne: "क्रिसमस रूख विधेयक — असम्बन्धित राइडरले सुधार रोक्छ।",
        },
        {
          en: "Digital front, manual evaluation — integrity unchanged.",
          ne: "अगाडि डिजिटल, पछाडि म्यानुअल मूल्याङ्कन — सुशासन उही।",
        },
      ],
      escalation: [
        {
          en: "Private sector publishes red-flag cases when digital path blocked.",
          ne: "डिजिटल मार्ग रोकिँदा निजी क्षेत्रले रातो सङ्केत मुद्दा।",
        },
        {
          en: "Share this point so procurement reform stays clean (#point-48).",
          ne: "खरिद सुधार सफा रहोस् भने साझेदारी गर्नुहोस् (#बुँदा-४८)।",
        },
      ],
      programStatusEn: "🟡 At risk — 30-day Public Procurement Act amendment package not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ३० दिन सार्वजनिक खरिद ऐन संशोधन प्याकेज यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p49",
    pointNumber: 49,
    category: "Procurement & Project Management",
    promise:
      "For project management, carry out the following: (a) Within two months, the National Planning Commission shall complete work to prepare a national-level project pipeline that brings clarity to the country’s priority development projects, prioritize all projects on economic, social, and environmental grounds, and set appropriate investment modalities for each (government, PPP, foreign investment, etc.). (b) Review projects that have long been stranded, are in a moribund state, or could not be completed on time; simplify processes relating to budget, land acquisition, EIA approval, contract termination, and the like; to resolve problems of moribund projects, projects with terminated contracts, and investment yielding no returns, form a study team within 30 days so it can assess each project’s rationale and feasibility and recommend whether it should continue or not; where inter-agency coordination is needed for construction or operation, the Office of the Prime Minister and Council of Ministers shall immediately coordinate and facilitate. (c) For national pride and other large strategic projects, arrange fast-track processes for land acquisition, compensation (muaabja) determination, tree felling, and approval of environmental impact assessment reports so implementation is rapid, time-bound, and quality-focused; coordinate among all relevant bodies to implement an integrated, automated approval system, remove unnecessary delays and duplicated processes, set clear timelines for implementation, and resolve obstacles to implementation through direct monitoring and facilitation from the Office of the Prime Minister and Council of Ministers. (d) To end delays in implementing national and priority infrastructure projects and repeated failure of the tender process, within 30 days formulate legislation to enable direct implementation through a government infrastructure construction company for projects on which tenders have not been awarded after more than two rounds or where the tender process has failed, and arrange the resources, means, human resources, and equipment required for that company.",
    promiseNe:
      "आयोजना व्यवस्थापनका लागि देहायका कार्य गर्ने: (क) देशका प्राथमिकता प्राप्त विकास परियोजनाहरूमा स्पष्टता ल्याउन राष्ट्रिय स्तरको आयोजना पाइपलाइन तयार गर्ने, सबै परियोजनाहरूलाई आर्थिक, सामाजिक तथा वातावरणीय आधारमा प्राथमिकता निर्धारण गर्ने तथा प्रत्येक परियोजनाका लागि उपयुक्त लगानी मोडालिटी (सरकारी, PPP, विदेशी लगानी आदि) तय गर्ने कार्य राष्ट्रिय योजना आयोगले दुई महिनाभित्र सम्पन्न गर्ने। (ख) लामो समयदेखि अलपत्र परेका, रुग्ण अवस्थामा रहेका तथा समयमा सम्पन्न हुन नसकेका आयोजनाहरूको पुनरावलोकन गरी बजेट व्यवस्था, जग्गा अधिग्रहण, वातावरणीय प्रभाव मूल्याङ्कन (EIA) स्वीकृति, ठेक्का तोड्ने लगायतका प्रक्रियाहरू सरल बनाउने। रुग्ण आयोजना, ठेक्का तोडिएका परियोजना र प्रतिफलविहीन लगानी भइरहने समस्या समाधान गर्न ३० दिनभित्र अध्ययन टोली गठन गरी उक्त टोलीले आयोजनाको औचित्य र सम्भाव्यता मूल्याङ्कन गरी निरन्तरता दिनुपर्ने वा नपर्ने अवस्थाबारे सिफारिस गर्ने। कुनै आयोजनाहरूको निर्माण तथा सञ्चालनका लागि अन्तरनिकाय समन्वय गर्नुपर्ने भएमा प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालयले तत्काल समन्वय र सहजीकरण गर्ने। (ग) राष्ट्रिय गौरवका तथा ठूला रणनीतिक आयोजनाहरूको कार्यान्वयनलाई शीघ्र, समयबद्ध तथा गुणस्तरीय बनाउन जग्गा प्राप्ति, मुआब्जा निर्धारण, रुख कटान तथा वातावरणीय प्रभाव मूल्याङ्कन प्रतिवेदन स्वीकृतिसम्बन्धी प्रक्रियाहरू फास्ट-ट्र्याक गर्ने व्यवस्था मिलाउने। सम्बन्धित सबै निकायहरूबीच समन्वय गरी एकीकृत र स्वचालित स्वीकृति प्रणाली लागू गर्न, अनावश्यक ढिलासुस्ती तथा दोहोरो प्रक्रियाहरू हटाउन, स्पष्ट समयसीमा तोकी कार्यान्वयन गर्न तथा आयोजना कार्यान्वयनमा देखिने अवरोधहरू समाधान गर्न प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालयबाट प्रत्यक्ष अनुगमन तथा सहजीकरण गर्ने। (घ) राष्ट्रिय तथा प्राथमिकता प्राप्त पूर्वाधार आयोजनाहरूको कार्यान्वयनमा देखिएको ढिलासुस्ती तथा ठेक्का प्रक्रियामा बारम्बार असफलता अन्त्य गर्न दुई पटक भन्दा बढी ठेक्का नलागेका वा ठेक्का प्रक्रिया असफल भएका आयोजनाहरूलाई सरकारी पूर्वाधार निर्माण कम्पनीमार्फत प्रत्यक्ष कार्यान्वयन गर्ने व्यवस्थाका लागि तीस दिनभित्र कानून तर्जुमा गरी उक्त कम्पनीका लागि आवश्यक पर्ने स्रोत, साधन, जनशक्ति तथा उपकरण व्यवस्थापन गर्ने।",
    question:
      "How will pipeline entries be delisted when fiscal space shrinks, who can appeal a “terminate” recommendation, what environmental safeguards remain non-waivable on fast-track, and how will the government infrastructure company be governed when tenders fail repeatedly?",
    questionNe:
      "वित्तीय ठाउँ घट्दा पाइपलाइनबाट कसरी हटाइन्छ, «निरन्तरता नदिने» सिफारिस विरुद्ध को पुनरावेदन गर्न सक्छ, फास्ट-ट्र्याकमा कुन वातावरणीय सुरक्षा छोड्न नमिल्ने, र बारम्बार ठेक्का असफल भएका आयोजनामा सरकारी पूर्वाधार निर्माण कम्पनी कसरी सञ्चालन हुन्छ?",
    whyThisMatters:
      "Fast-track can accelerate development or bypass communities—rules must say which safeguards are non-negotiable.",
    whyThisMattersNe:
      "फास्ट-ट्र्याक विकास छिटो वा समुदाय बाइपास — कुन सुरक्षा अहंकारहित छैन भन्ने नियमले भन्नुपर्छ।",
    possiblePathItems: [
      "Published criteria for pipeline inclusion and exit",
      "Meaningful consultation logs for affected households",
      "Independent technical sign-off on EIA fast-tracks",
      "Quarterly pipeline fiscal stress test",
    ],
    possiblePathItemsNe: [
      "पाइपलाइन प्रवेश र निकासका मापदण्ड प्रकाशन",
      "प्रभावित घरधुरीसँग अर्थपूर्ण परामर्श अभिलेख",
      "EIA फास्ट-ट्र्याकमा स्वतन्त्र प्राविधिक सहमति",
      "त्रैमासिक पाइपलाइन वित्तीय तनाव परीक्षण",
    ],
    systemInsight:
      "Pipelines and fast-tracks concentrate power in a few desks—publish decision logs or trust erodes faster than concrete sets.",
    systemInsightNe:
      "पाइपलाइन र फास्ट-ट्र्याक शक्ति केवल डेस्कमा केन्द्रित — निर्णय लग प्रकाशन नभए विश्वास कंक्रीटभन्दा छिटो चुहिन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ४९ (project pipeline, sick projects, fast-track; scan Pages 9–10)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ४९ (पाइपलाइन, बिरामी आयोजना, फास्ट-ट्र्याक; स्क्यान ९–१०)",
    sourceExcerpt:
      "From scan (Pages 9–10, च / घ): (क) NPC — national project pipeline in 2 months, priorities, investment modalities. (ख) Stranded/moribund projects; simplified budget, land, EIA, contract termination; study team 30 days; OPMCM coordination. (ग) Fast-track land, muaabja, trees, EIA; integrated automated approvals; OPMCM monitoring. (घ) 30 days — law for direct execution via government infrastructure company when tender fails >2 times; resources for company.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ९–१० (च/घ): (क) योजना आयोग — २ महिनामा पाइपलाइन, प्राथमिकता, लगानी मोडालिटी। (ख) अलपत्र/रुग्ण आयोजना; बजेट/जग्गा/EIA/ठेक्का प्रक्रिया सरल; ३० दिनमा अध्ययन टोली; प्रधानमन्त्री कार्यालय समन्वय। (ग) फास्ट-ट्र्याक जग्गा, मुआब्जा, रुख, EIA; एकीकृत स्वचालित स्वीकृति; प्रधानमन्त्री कार्यालय अनुगमन। (घ) ३० दिन — दुई पटकभन्दा बढी ठेक्का असफलमा सरकारी पूर्वाधार कम्पनीमार्फत कार्यान्वयनको कानून र स्रोत।",
    layer1: {
      hookEmoji: "🚧",
      hook: "Pipeline, sick projects, fast-track, and a state construction company — one dense point.",
      hookNe: "पाइपलाइन, रुग्ण आयोजना, फास्ट-ट्र्याक र राज्य निर्माण कम्पनी — एउटै बाक्लो बुँदा।",
      stakeLine: "Fast-track can accelerate work or bypass communities — non-waivable safeguards must be named.",
      stakeLineNe: "फास्ट-ट्र्याकले काम छिटो वा समुदाय बाइपास — नछोडिने सुरक्षा नाम दिनुपर्छ।",
      coreQuestionShort: "Pipeline exit rules, appeal on “kill” recommendations, fast-track EIA floors, GovCo governance?",
      coreQuestionShortNe: "पाइपलाइन निकास, «बन्द» सिफारिस पुनरावेदन, फास्ट-ट्र्याक EIA न्यूनतम, GovCo सञ्चालन?",
      coreQuestion:
        "How are pipeline entries delisted when fiscal space shrinks; who appeals terminate recommendations; what environmental safeguards stay non-waivable on fast-track; how is the government infrastructure company governed when tenders fail?",
      coreQuestionNe:
        "वित्त घट्दा पाइपलाइनबाट कसरी हटाइन्छ; निरन्तरता नदिने सिफारिस विरुद्ध को; फास्ट-ट्र्याकमा कुन वातावरणीय सुरक्षा छोड्न नमिल्ने; बारम्बार ठेक्का असफलमा सरकारी पूर्वाधार कम्पनी कसरी सञ्चालन?",
      quickScan: [
        {
          item: "(a) NPC: 2-month national pipeline published + priorities + modalities",
          itemNe: "(क) योजना आयोग: २ महिनामा पाइपलाइन प्रकाशित + प्राथमिकता + मोडालिटी",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "(b) Sick projects: 30-day study team + simplify land/EIA/contract; OPMCM coordination",
          itemNe: "(ख) रुग्ण: ३० दिन अध्ययन टोली + जग्गा/EIA/ठेक्का सरल; प्रधानमन्त्री कार्यालय समन्वय",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "(c) Fast-track + integrated approval system; decision logs public",
          itemNe: "(ग) फास्ट-ट्र्याक + एकीकृत स्वीकृति; निर्णय लग सार्वजनिक",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "(d) 30-day law: GovCo direct execution after >2 failed tenders + resources",
          itemNe: "(घ) ३० दिन कानुन: २ पटकभन्दा बढी असफल ठेक्कापछि GovCo प्रत्यक्ष + स्रोत",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "National Planning Commission; Office of the Prime Minister and Council of Ministers; Ministry of Finance; Ministry of Forests and Environment; Ministry of Physical Infrastructure and Transport; Attorney General’s office for fast-track lawfulness.",
      primaryOwnersNe:
        "राष्ट्रिय योजना आयोग; प्रधानमन्त्री कार्यालय; अर्थ मन्त्रालय; वन वातावरण मन्त्रालय; भौतिक पूर्वाधार तथा यातायात मन्त्रालय; फास्ट-ट्र्याक कानूनीताका लागि महान्यायाधिवक्ता।",
      coordinatingOfficeEn:
        "National project pipeline office with fiscal stress tests and public delisting criteria.",
      coordinatingOfficeNe: "वित्तीय तनाव परीक्षण र सार्वजनिक निकास मापदण्डसहित राष्ट्रिय आयोजना पाइपलाइन कार्यालय।",
      accountableRolesEn:
        "OPMCM publishes decision logs for fast-track and GovCo interventions; AG samples EIA shortcuts.",
      accountableRolesNe:
        "प्रधानमन्त्री कार्यालयले फास्ट-ट्र्याक र GovCo हस्तक्षेप निर्णय लग प्रकाशन; महालेखाले EIA छोटो बाटो नमूना।",
      timelineEn: "Rolling: NPC pipeline T+2 months; sick-project review T+30; parallel fast-track SOP; GovCo law T+30.",
      timelineNe: "क्रमशः: आयोग पाइपलाइन T+२ महिना; रुग्ण समीक्षा T+३०; फास्ट-ट्र्याक SOP; GovCo कानुन T+३०।",
      milestones: [
        {
          en: "Pipeline inclusion/exit criteria and quarterly fiscal stress test published.",
          ne: "पाइपलाइन प्रवेश/निकास मापदण्ड र त्रैमासिक वित्तीय तनाव परीक्षण प्रकाशन।",
        },
        {
          en: "Meaningful consultation logs for affected households on fast-track projects.",
          ne: "फास्ट-ट्र्याक आयोजनामा प्रभावित घरधुरीसँग अर्थपूर्ण परामर्श अभिलेख।",
        },
        {
          en: "GovCo charter: board independence, procurement rules, audit, no patronage hiring.",
          ne: "GovCo चार्टर: बोर्ड स्वतन्त्रता, खरिद नियम, लेखापरीक्षा, पोखरा नियुक्ति।",
        },
      ],
      kpis: [
        {
          metricEn: "Stranded projects resolved / study recommendations (%)",
          metricNe: "समाधान भएका अलपत्र / अध्ययन सिफारिस (%)",
          howEn: "NPC project office tracking.",
          howNe: "योजना आयोग आयोजन ट्रयाक।",
        },
        {
          metricEn: "Median approval days for fast-track vs standard (by stage)",
          metricNe: "फास्ट-ट्र्याक बनाम मानक स्वीकृति मध्यक दिन (चरणअनुसार)",
          howEn: "Integrated approval system timestamps.",
          howNe: "एकीकृत स्वीकृति प्रणाली समय छाप।",
        },
      ],
      risks: [
        {
          en: "Fast-track waives consultation — legal challenges and social conflict.",
          ne: "फास्ट-ट्र्याकले परामर्श छोड्छ — कानुनी चुनौती र सामाजिक द्वन्द्व।",
        },
        {
          en: "GovCo becomes politicized contractor of last resort.",
          ne: "GovCo राजनीतिक निर्माण ठेकेदार बन्छ।",
        },
      ],
      escalation: [
        {
          en: "Parliamentary committee hearings when pipeline shifts fiscal exposure.",
          ne: "पाइपलाइनले वित्तीय जोखिम सर्दा संसदीय समिति सुनुवाइ।",
        },
        {
          en: "Share this point so megaprojects stay accountable (#point-49).",
          ne: "ठूला आयोजना जवाफदेही रहोस् भने साझेदारी गर्नुहोस् (#बुँदा-४९)।",
        },
      ],
      programStatusEn: "🟡 At risk — project pipeline / sick projects / fast-track / GovCo package not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — पाइपलाइन/रुग्ण/फास्ट-ट्र्याक/GovCo प्याकेज यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p50",
    pointNumber: 50,
    category: "Procurement & Project Management",
    promise:
      "To address irregularities, misuse of variation orders, and delays caused by lack of tracking across stages from project selection through payment, implement a data-based end-to-end e-procurement monitoring system within 90 days.",
    promiseNe:
      "आयोजना छनोटदेखि भुक्तानीसम्मका विभिन्न चरणहरूमा ट्र्याकिङ्ग नहुँदा अनियमितता, भेरिएसन आदेशको दुरुपयोग र ढिलाइ हुने समस्या समाधान गर्न ९० दिनभित्र data-based end-to-end e-procurement monitoring प्रणाली लागू गर्ने।",
    question:
      "Which data fields are mandatory at each milestone, who can export audit trails, and how are variation orders auto-flagged when they exceed statistical norms for similar contracts?",
    questionNe:
      "प्रत्येक कोसेङ्कमा कुन डेटा अनिवार्य, लेखापरीक्षा पदचिन्ह कोले निकाल्न पाउँछ, र समान सम्झौताको तथ्याङ्कभन्दा बढी भेरिएसन आदेश कसरी स्वतः सङ्केत हुन्छ?",
    whyThisMatters:
      "End-to-end monitoring turns procurement into observable infrastructure—if dashboards are internal-only, the reform is half-built.",
    whyThisMattersNe:
      "अन्त्यदेखि अन्त्यसम्म निगरानीले खरिदलाई दृश्य पूर्वाधार बनाउँछ — ड्यासबोर्ड आन्तरिक मात्र भए सुधार आधा बनेको।",
    possiblePathItems: [
      "Open API for civil society analytics on red flags",
      "Immutable hash chain for tender documents",
      "Standard variation templates with justification fields",
      "Integration with AG audit sampling",
    ],
    possiblePathItemsNe: [
      "रातो सङ्केत विश्लेषणका लागि नागरिक समाज API",
      "टेण्डर कागजात अपरिवर्तनीय ह्यास श्रृङ्खला",
      "कारण खुलाइएको मानक भेरिएसन ढाँचा",
      "महालेखा नियन्त्रक नमूना जाँचसँग एकीकरण",
    ],
    systemInsight:
      "Variation orders are the classic corruption valve—monitoring without statistical anomaly rules is just prettier paperwork.",
    systemInsightNe:
      "भेरिएसन आदेश क्लासिक भ्रष्टाचार वाल्भ — तथ्याङ्क विसंगति नियम बिना निगरानी सुन्दर कागज मात्र।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ५० (end-to-end e-procurement monitoring; scan Page 10)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ५० (e-procurement अन्त्यदेखि अन्त्य निगरानी; स्क्यान पृष्ठ १०)",
    sourceExcerpt:
      "From scan (Page 10, च): ९० दिनभित्र data-based end-to-end e-procurement monitoring — project selection through payment; curb irregularities, variation-order misuse, delays.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १० (च): छनोटदेखि भुक्तानीसम्म चरणमा ट्र्याकिङ्ग अभावबाट हुने अनियमितता, भेरिएसन दुरुपयोग, ढिलाइ — ९० दिनमा data-based end-to-end e-procurement monitoring।",
    layer1: {
      hookEmoji: "📊",
      hook: "90 days: end-to-end e-procurement monitoring — selection to payment on the record.",
      hookNe: "९० दिन: अन्त्यदेखि अन्त्य इ-खरिद निगरानी — छनोटदेखि भुक्तानी अभिलेखमा।",
      stakeLine: "Internal-only dashboards mean the reform is half-built — citizens and auditors need exports.",
      stakeLineNe: "आन्तरिक मात्र ड्यासबोर्ड भने सुधार आधा — नागरिक र लेखापरीक्षकलाई निकास चाहिन्छ।",
      coreQuestionShort: "Mandatory fields per milestone; who exports audit trails; variation anomalies auto-flagged?",
      coreQuestionShortNe: "कोसेङ्क प्रति अनिवार्य क्षेत्र; लेखा पदचिन्ह कोले निकाल्छ; भेरिएसन विसंगति स्वतः?",
      coreQuestion:
        "Which data fields are mandatory at each milestone; who can export audit trails; how are variation orders flagged when they exceed norms?",
      coreQuestionNe:
        "प्रत्येक कोसेङ्कमा कुन डेटा अनिवार्य; लेखापरीक्षा पदचिन्ह कोले निकाल्न पाउँछ; मानदण्ड नाघ्दा भेरिएसन कसरी चिन्ह हुन्छ?",
      quickScan: [
        {
          item: "90-day system live: milestone schema + mandatory fields published",
          itemNe: "९० दिन प्रणाली लाइभ: कोसेङ्क खाका + अनिवार्य क्षेत्र प्रकाशित",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Audit trail export role (AG / CIAA / public interest API)",
          itemNe: "लेखा पदचिन्ह निकास भूमिका (महालेखा/अख्तियार/सार्वजनिक हित API)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Variation statistical norms + auto-flag rules per sector",
          itemNe: "क्षेत्रअनुसार भेरिएसन तथ्याङ्क मानदण्ड + स्वतः चिन्ह नियम",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Integration with AG sampling + red-flag response SLA",
          itemNe: "महालेखा नमूना जाँचसँग एकीकरण + रातो सङ्केत प्रतिक्रिया SLA",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Public Procurement Monitoring Office; Ministry of Finance; AG Office for audit integration; PPMO for system; World Bank/development partners if co-funding.",
      primaryOwnersNe:
        "सार्वजनिक खरिद अनुगमन कार्यालय; अर्थ मन्त्रालय; लेखापरीक्षा एकीकरणका लागि महालेखा; प्रणालीका लागि PPMO; सह-वित्त भए विकास साझेदार।",
      coordinatingOfficeEn:
        "Monitoring system PMO with data dictionary and anomaly detection playbook.",
      coordinatingOfficeNe: "डेटा शब्दकोश र विसंगति पत्ता प्लेबुकसहित निगरानी प्रणाली PMO।",
      accountableRolesEn:
        "Monthly public summary: contracts monitored, anomalies flagged, actions taken.",
      accountableRolesNe:
        "मासिक सार्वजनिक सार: निगरानी सम्झौता, चिन्ह विसंगति, लिएका कारबाही।",
      timelineEn: "T+90 days: production monitoring; quarterly model recalibration for variation norms.",
      timelineNe: "T+९० दिन: उत्पादन निगरानी; त्रैमासिक भेरिएसन मानदण्ड पुन:मापन।",
      milestones: [
        {
          en: "Open API for civil society analytics (aggregated, privacy-safe).",
          ne: "नागरिक समाज विश्लेषणका लागि खुला API (कुल, गोपनीयता सुरक्षित)।",
        },
        {
          en: "Immutable document hash chain for tender packages.",
          ne: "टेण्डर प्याकेजका लागि अपरिवर्तनीय कागजात ह्यास श्रृङ्खला।",
        },
        {
          en: "Standard variation templates with mandatory justification fields.",
          ne: "अनिवार्य कारण क्षेत्रसहित मानक भेरिएसन ढाँचा।",
        },
      ],
      kpis: [
        {
          metricEn: "Variation rate vs sector benchmark (flagged contracts / 1000)",
          metricNe: "क्षेत्र मानदण्ड बनाम भेरिएसन दर (चिन्ह सम्झौता/१०००)",
          howEn: "Monitoring analytics; public methodology.",
          howNe: "निगरानी विश्लेषण; सार्वजनिक विधि।",
        },
        {
          metricEn: "Median days from selection to contract award",
          metricNe: "छनोटदेखि ठेक्का प्रदानसम्म मध्यक दिन",
          howEn: "System timestamps.",
          howNe: "प्रणाली समय छाप।",
        },
      ],
      risks: [
        {
          en: "Garbage-in monitoring — agencies skip mandatory fields.",
          ne: "फोहोर भित्र निगरानी — निकाय अनिवार्य क्षेत्र छोड्छ।",
        },
        {
          en: "Alert fatigue — flags ignored without enforcement.",
          ne: "चेतावना थकान — चिन्ह कार्यान्वयन बिना बेवास्ता।",
        },
      ],
      escalation: [
        {
          en: "AG publishes sample audit of monitoring data quality.",
          ne: "महालेखाले निगरानी डेटा गुणस्तर नमूना लेखापरीक्षा।",
        },
        {
          en: "Share this point so procurement stays observable (#point-50).",
          ne: "खरिद दृश्य रहोस् भने साझेदारी गर्नुहोस् (#बुँदा-५०)।",
        },
      ],
      programStatusEn: "🟡 At risk — 90-day end-to-end e-procurement monitoring not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ९० दिन अन्त्यदेखि अन्त्य इ-खरिद निगरानी यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p51",
    pointNumber: 51,
    category: "Procurement & Project Management",
    promise:
      "To resolve the problem of projects taking years to build and operate because they are entangled in multiple laws, approvals, and agency processes, prepare a draft umbrella law on project facilitation within 60 days.",
    promiseNe:
      "परियोजनाहरू विभिन्न कानून, स्वीकृति र निकायगत प्रक्रियामा अल्झिँदा आयोजना निर्माण तथा सञ्चालनमा वर्षौं लाग्ने समस्या समाधान गर्न ६० दिनभित्र परियोजना सहजीकरण (Project Facilitation) सम्बन्धी छाता कानूनको मस्यौदा तयार गर्ने।",
    question:
      "Which approvals move into a single statutory clock, how are environmental and community safeguards preserved in the umbrella law, and what dispute forum resolves cross-agency deadlocks?",
    questionNe:
      "कुन स्वीकृतिहरू एकै कानुनी घडीमा आउँछन्, छाता कानुनमा वातावरण र समुदाय सुरक्षा कसरी जोगिन्छ, र निकायबीच अड्कन फुटाउन कुन विवाद निकाय?",
    whyThisMatters:
      "A facilitation law only cuts delay if it replaces parallel vetoes with clear sequencing and accountable time limits.",
    whyThisMattersNe:
      "सहजीकरण कानुनले मात्र ढिलाइ कटाउँछ जब समानान्तर भेटोलाई स्पष्ट क्रम र जवाफदेह समयसीमाले बदल्छ।",
    possiblePathItems: [
      "Published comparison matrix: current vs proposed timelines",
      "Mandatory concurrent review where laws allow",
      "Sunset clauses for temporary emergency shortcuts",
      "Legislative hearing schedule with contractor and CSO input",
    ],
    possiblePathItemsNe: [
      "प्रकाशित तुलना: हाल बनाम प्रस्तावित समयरेखा",
      "कानुनले दिन्छ भने अनिवार्य एकसाथ समीक्षा",
      "अस्थायी छोटो बाटोका लागि सूर्यास्त धारा",
      "ठेकेदार र नागरिक समाज इनपुटसहित विधायी सुनुवाइ तालिका",
    ],
    systemInsight:
      "“Umbrella” laws fail when every ministry keeps a pocket veto—write who loses if the clock expires.",
    systemInsightNe:
      "«छाता» कानुन असफल हुन्छ जब हरेक मन्त्रालयमा खल्ती भेटो छ — घडी सकिँदा को हार्छ लेख्नुहोस्।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ५१ (Project Facilitation umbrella law draft; scan Page 10)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ५१ (परियोजना सहजीकरण छाता कानुन मस्यौदा; स्क्यान पृष्ठ १०)",
    sourceExcerpt:
      "From scan (Page 10, च): ६० दिनभित्र Project Facilitation छाता कानून मस्यौदा — विभिन्न कानून, स्वीकृति र निकायगत प्रक्रियामा अल्झिँदा वर्षौं लाग्ने समस्या समाधान।",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १० (च): परियोजनाहरू कानून/स्वीकृति/निकाय प्रक्रियामा अल्झिँदा निर्माण–सञ्चालनमा वर्षौं लाग्ने — ६० दिनमा परियोजना सहजीकरण छाता कानून मस्यौदा।",
    layer1: {
      hookEmoji: "☂️",
      hook: "Project Facilitation umbrella law in 60 days — one clock, clear losers when time expires.",
      hookNe: "६० दिनमा परियोजना सहजीकरण छाता कानुन — समय सकिँदा हार्ने स्पष्ट।",
      stakeLine: "Umbrella laws fail if every ministry keeps a pocket veto — write who loses on deadline.",
      stakeLineNe: "छाता कानुन असफल जब हरेक मन्त्रालयमा खल्ती भेटो — म्याद सकिँदा को हार्छ लेख्नुहोस्।",
      coreQuestionShort: "Single statutory clock; non-waivable EIA/community safeguards; cross-agency deadlock forum?",
      coreQuestionShortNe: "एकै कानुनी घडी; नछोडिने EIA/समुदाय सुरक्षा; निकायबीच अड्कन फोरम?",
      coreQuestion:
        "Which approvals move into one statutory clock; how are environmental and community safeguards preserved; what forum resolves cross-agency deadlocks?",
      coreQuestionNe:
        "कुन स्वीकृतिहरू एकै घडीमा; छाता कानुनमा वातावरण र समुदाय सुरक्षा कसरी; निकायबीच अड्कन कुन फोरम?",
      quickScan: [
        {
          item: "60-day draft published + comparison matrix: current vs proposed timelines",
          itemNe: "६० दिन मस्यौदा + तुलना: हाल बनाम प्रस्तावित समयरेखा",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Explicit list of non-waivable safeguards (EIA, consultation, compensation)",
          itemNe: "नछोडिने सुरक्षा सूची (EIA, परामर्श, क्षतिपूर्ति)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Dispute resolution: empowered facilitation council or tribunal",
          itemNe: "विवाद समाधान: अधिकार प्राप्त सहजीकरण परिषद् वा न्यायाधिकरण",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Sunset clauses for any temporary emergency shortcuts",
          itemNe: "अस्थायी आपतकालीन छोटो बाटोका लागि सूर्यास्त धारा",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Law; National Planning Commission; Ministry of Physical Infrastructure and Transport; Ministry of Forests and Environment; OPMCM for deadlock escalation.",
      primaryOwnersNe:
        "कानून मन्त्रालय; राष्ट्रिय योजना आयोग; भौतिक पूर्वाधार तथा यातायात मन्त्रालय; वन वातावरण मन्त्रालय; अड्कन उचालन प्रधानमन्त्री कार्यालय।",
      coordinatingOfficeEn:
        "Umbrella law drafting cell with ministry veto log and response deadlines.",
      coordinatingOfficeNe: "मन्त्रालय भेटो लग र प्रतिक्रिया म्यादसहित छाता कानुन मस्यौदा कोठा।",
      accountableRolesEn:
        "Named chair reports weekly during consultation; deadlocks escalated with paper trail.",
      accountableRolesNe:
        "नामित अध्यक्षले परामर्शमा हप्तामा प्रतिवेदन; अड्कन कागजी बाटोसहित उचालन।",
      timelineEn: "T+60 days: draft for consultation; +120: revised bill; parliamentary schedule published.",
      timelineNe: "T+६० दिन: परामर्शका लागि मस्यौदा; +१२०: संशोधित विधेयक; संसद तालिका प्रकाशन।",
      milestones: [
        {
          en: "Concurrent review obligations where laws permit single window.",
          ne: "कानुनले दिन्छ भने एकै खिड्की अनिवार्य एकसाथ समीक्षा।",
        },
        {
          en: "Legislative hearing schedule with contractors and CSOs.",
          ne: "ठेकेदार र नागरिक समाजसहित विधायी सुनुवाइ तालिका।",
        },
        {
          en: "Regulatory impact note on SMEs and local governments.",
          ne: "साना उद्यम र स्थानीय सरकारमा नियामक प्रभाव टिपोट।",
        },
      ],
      kpis: [
        {
          metricEn: "Median approval days before vs after law (pilot sectors)",
          metricNe: "कानुन अघि/पछि मध्यक स्वीकृति दिन (पाइलट क्षेत्र)",
          howEn: "Integrated approval system metrics.",
          howNe: "एकीकृत स्वीकृति प्रणाली मेट्रिक।",
        },
        {
          metricEn: "Deadlock cases resolved by facilitation forum (quarterly)",
          metricNe: "सहजीकरण फोरमले समाधान अड्कन मुद्दा (त्रैमासिक)",
          howEn: "Forum docket.",
          howNe: "फोरम दर्ता।",
        },
      ],
      risks: [
        {
          en: "Environmental safeguards diluted for speed.",
          ne: "गतिका लागि वातावरणीय सुरक्षा पातलो।",
        },
        {
          en: "Judicial challenge — overlapping statutes not reconciled.",
          ne: "न्यायिक चुनौती — दोहोरो ऐन मिलेन।",
        },
      ],
      escalation: [
        {
          en: "Environmental CSOs publish ‘red line’ analysis of draft chapters.",
          ne: "वातावरण नागरिक समाजले मस्यौदा अध्याय «रातो रेखा» विश्लेषण।",
        },
        {
          en: "Share this point so facilitation stays fair (#point-51).",
          ne: "सहजीकरण न्यायोचित रहोस् भने साझेदारी गर्नुहोस् (#बुँदा-५१)।",
        },
      ],
      programStatusEn: "🟡 At risk — 60-day Project Facilitation umbrella draft not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ६० दिन परियोजना सहजीकरण छाता मस्यौदा यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p52",
    pointNumber: 52,
    category: "Procurement & Project Management",
    promise:
      "To resolve delays in completing major road and transport infrastructure projects that have long caused daily hardship for citizens, immediately prepare and implement a project monitoring work schedule. After study, install weighbridges at strategic points on highways within 45 days.",
    promiseNe:
      "लामो समयदेखि नागरिकलाई दैनिक सास्ती दिइरहेका प्रमुख सडक तथा यातायात पूर्वाधार आयोजना समयमा पूरा नहुने समस्या समाधान गर्न तत्कालै आयोजना निगरानी कार्यतालिका बनाई कार्यान्वयन गर्ने। राजमार्ग (Highway) का रणनीतिक क्षेत्रहरूमा अध्ययन गरेर तौल पुल ४५ दिनभित्र राख्ने।",
    question:
      "Which projects are on the monitoring schedule with milestone owners, how will weighbridge data feed overload enforcement and road maintenance budgets, and what anti-corruption checks apply at weigh stations?",
    questionNe:
      "निगरानी तालिकामा कुन आयोजना कोसेङ्क मालिकसहित, तौल पुल डेटा अतिभार कार्यान्वयन र सडक मर्मत बजेटमा कसरी जान्छ, र तौल केन्द्रमा भ्रष्टाचार विरोधी जाँच के?",
    whyThisMatters:
      "Road pain is visceral for commuters—visible schedules and fair enforcement turn abstract reform into lived relief.",
    whyThisMattersNe:
      "सडक पीडा यात्रुका लागि प्रत्यक्ष — दृश्य तालिका र निष्पक्ष कार्यान्वयनले सुधारलाई अनुभवमा ओर्लाउँछ।",
    possiblePathItems: [
      "Public Gantt per flagship road project with delay reasons",
      "Weighbridge calibration certificates posted online",
      "Revenue from fines earmarked to road safety, not discretionary pools",
      "Third-party traffic and axle-load studies published",
    ],
    possiblePathItemsNe: [
      "झण्डै आयोजनाका लागि सार्वजनिक ग्यान्ट र ढिलाइ कारण",
      "तौल पुल क्यालिब्रेसन प्रमाणपत्र अनलाइन",
      "जरिवाना आम्दानी सडक सुरक्षामा, विवेकाधीन कोषमा होइन",
      "तेस्रो पक्ष यातायात र एक्सल लोड अध्ययन प्रकाशन",
    ],
    systemInsight:
      "Weighbridges fight overload and protect pavement—if operators are underpaid or unmonitored, the scales tilt toward bribery.",
    systemInsightNe:
      "तौल पुल अतिभार र पेवमेन्ट जोगाउँछ — सञ्चालक निगरानी वा तलब कमजोर भए तराजु घूसतिर ढल्किन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ५२ (road project monitoring schedule; highway weighbridges; scan Page 10)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ५२ (सडक निगरानी तालिका; राजमार्ग तौल पुल; स्क्यान पृष्ठ १०)",
    sourceExcerpt:
      "From scan (Page 10, च): तत्काल आयोजना निगरानी कार्यतालिका तयार र कार्यान्वयन; राजमार्ग (Highway) का रणनीतिक क्षेत्रमा अध्ययन गरी तौल पुल ४५ दिनभित्र।",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १० (च): प्रमुख सडक/यातायात आयोजना समयमा नपुगेको — निगरानी कार्यतालिका तत्काल; राजमार्गका रणनीतिक बिन्दुमा अध्ययनपछि ४५ दिनमा तौल पुल।",
    layer1: {
      hookEmoji: "⚖️",
      hook: "Road project monitoring schedule now — weighbridges on highways in 45 days after study.",
      hookNe: "अहिले सडक आयोजना निगरानी तालिका — अध्ययनपछि ४५ दिन राजमार्ग तौल पुल।",
      stakeLine: "Weighbridges cut overload — if operators are unmonitored, scales tip toward bribery.",
      stakeLineNe: "तौल पुलले अतिभार कटाउँछ — सञ्चालक निगरानी बिना तराजु घूसतिर ढल्किन्छ।",
      coreQuestionShort: "Gantt owners per flagship road; weigh data → enforcement + maintenance cash; station integrity?",
      coreQuestionShortNe: "झण्डै सडक ग्यान्ट मालिक; तौल डेटा कार्यान्वयन+मर्मत पैसा; केन्द्र सुशासन?",
      coreQuestion:
        "Which projects are on the monitoring schedule with owners; how does weighbridge data feed overload enforcement and road budgets; what anti-corruption checks apply at stations?",
      coreQuestionNe:
        "कुन आयोजना तालिकामा मालिकसहित; तौल डेटा अतिभार र सडक बजेटमा कसरी; तौल केन्द्रमा भ्रष्टाचार जाँच के?",
      quickScan: [
        {
          item: "Public Gantt: flagship road projects + delay reason codes",
          itemNe: "सार्वजनिक ग्यान्ट: झण्डै सडक आयोजना + ढिलाइ कारण कोड",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "45-day weighbridge plan: locations, calibration, operator SOP",
          itemNe: "४५ दिन तौल योजना: स्थान, क्यालिब्रेसन, सञ्चालक SOP",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Weigh data integrated to overload fines + maintenance earmark",
          itemNe: "तौल डेटा अतिभार जरिवाना र मर्मत छुट्याउन जोडिएको",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Third-party axle-load study published; station rotation audits",
          itemNe: "तेस्रो पक्ष एक्सल लोड अध्ययन प्रकाशन; केन्द्र रोटेसन लेखापरीक्षा",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Department of Roads; Department of Transport Management; traffic police; provincial infrastructure; Ministry of Physical Infrastructure and Transport.",
      primaryOwnersNe:
        "सडक विभाग; यातायात व्यवस्थापन विभाग; ट्राफिक प्रहरी; प्रदेश पूर्वाधार; भौतिक पूर्वाधार तथा यातायात मन्त्रालय।",
      coordinatingOfficeEn:
        "Highway enforcement cell linking weigh data, fines, and pavement maintenance programmes.",
      coordinatingOfficeNe: "तौल डेटा, जरिवाना र पेवमेन्ट मर्मत कार्यक्रम जोड्ने राजमार्ग कार्यान्वयन कोठा।",
      accountableRolesEn:
        "Monthly public dashboard: overload cases, revenue, reinvestment in road safety.",
      accountableRolesNe:
        "मासिक सार्वजनिक ड्यासबोर्ड: अतिभार मुद्दा, राजस्व, सडक सुरक्षामा पुन:लगानी।",
      timelineEn: "T+immediate: monitoring schedule live; T+45 days: weighbridges operational per plan.",
      timelineNe: "तत्काल: निगरानी तालिका लाइभ; T+४५ दिन: योजना अनुसार तौल पुल सञ्चालन।",
      milestones: [
        {
          en: "Calibration certificates online per weighbridge.",
          ne: "प्रति तौल पुल अनलाइन क्यालिब्रेसन प्रमाणपत्र।",
        },
        {
          en: "Anti-tamper seals and CCTV minimum standard at sites.",
          ne: "स्थलमा छेडछाड विरोधी छाप र न्यूनतम CCTV मानक।",
        },
        {
          en: "Revenue ring-fencing: fines to road safety, not discretionary pools.",
          ne: "राजस्व घेरा: जरिवाना सडक सुरक्षामा, विवेकाधीन कोषमा होइन।",
        },
      ],
      kpis: [
        {
          metricEn: "Overload detections / enforcement actions (monthly)",
          metricNe: "अतिभार पत्ता / कार्यान्वयन कारबाही (मासिक)",
          howEn: "Weigh station + police data merge.",
          howNe: "तौल केन्द्र र प्रहरी डेटा मर्ज।",
        },
        {
          metricEn: "Pavement maintenance spend linked to weigh revenue (%)",
          metricNe: "तौल राजस्वसँग जोडिएको पेवमेन्ट मर्मत खर्च (%)",
          howEn: "Road fund accounting.",
          howNe: "सडक कोष लेखा।",
        },
      ],
      risks: [
        {
          en: "Weighbridges bypassed via local roads — displacement not reduction.",
          ne: "स्थानीय बाटोबाट तौल उम्किन्छ — घटाइ होइन सर्नु।",
        },
        {
          en: "Corruption at stations — fake slips and deleted readings.",
          ne: "केन्द्रमा भ्रष्टाचार — नक्कली रसिद र मेटिएको पढाइ।",
        },
      ],
      escalation: [
        {
          en: "Freight associations audit random weigh slips vs central log.",
          ne: "माल ढुवानी संघले यादृच्छिक रसिद केन्द्रीय लगसँग लेखापरीक्षा।",
        },
        {
          en: "Share this point so roads get fair enforcement (#point-52).",
          ne: "सडकमा निष्पक्ष कार्यान्वयन होस् भने साझेदारी गर्नुहोस् (#बुँदा-५२)।",
        },
      ],
      programStatusEn: "🟡 At risk — road monitoring schedule + 45-day weighbridge plan not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — सडक निगरानी तालिका र ४५ दिन तौल योजना यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p53",
    pointNumber: 53,
    category: "Economy & Development",
    promise:
      "To improve the country’s investment climate, delegate further authority to staff at the Department of Industry’s Single Point Service Center so industry registration, approval, and operation processes become simpler, faster, and more transparent.",
    promiseNe:
      "देशमा लगानी वातावरण सुधार गर्न उद्योग दर्ता, स्वीकृति तथा सञ्चालन प्रक्रियालाई सरल, छिटो तथा पारदर्शी बनाउन उद्योग विभागमा रहेको एकल विन्दु सेवा केन्द्रमा खटिने कर्मचारीलाई थप अधिकार प्रत्यायोजन गरी प्रभावकारी बनाउने।",
    question:
      "Which decisions move to the center with published turnaround times, how is appeal handled when officers exceed delegated limits, and are service standards identical for domestic and foreign investors?",
    questionNe:
      "कुन निर्णय केन्द्रमा सार्वजनिक म्यादसहित सर्छ, प्रत्यायोजन नाघ्दा पुनरावेदन कसरी, र स्वदेशी विदेशी लगानीकर्ताका लागि सेवा मानक एकै छ?",
    whyThisMatters:
      "Delegation without digital logs recreates desk culture—citizens need to see who decided what and when.",
    whyThisMattersNe:
      "डिजिटल अभिलेख बिना प्रत्यायोजनले डेस्क संस्कृति फर्काउँछ — कोले के कहिले भन्यो देखिनुपर्छ।",
    possiblePathItems: [
      "Published checklist and SLA per service type",
      "Mystery-shopper audits with public scores",
      "Escalation to departmental ombud within 48 hours",
      "English/Nepali bilingual tracking numbers",
    ],
    possiblePathItemsNe: [
      "सेवा प्रकार प्रति प्रकाशित चेकलिस्ट र SLA",
      "सार्वजनिक अङ्कसहित गुप्त ग्राहक लेखापरीक्षण",
      "४८ घण्टाभित्र विभागीय अधिवक्तामा उचालन",
      "अङ्ग्रेजी/नेपाली द्विभाषी ट्रयाकिङ नम्बर",
    ],
    systemInsight:
      "Single-window centers work when back-office systems actually connect—otherwise they are a nicer waiting room.",
    systemInsightNe:
      "एकल खिड्की पछाडिको प्रणाली जोडिँदा मात्र काम गर्छ — नत्र राम्रो प्रतीक्षा कक्ष मात्र।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ५३ (Single Point Service Center delegation; scan Page 10, section छ)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ५३ (एकल विन्दु सेवा केन्द्र; स्क्यान पृष्ठ १०, खण्ड छ)",
    sourceExcerpt:
      "From scan (Page 10, छ): लगानी वातावरण — उद्योग विभागको एकल विन्दु सेवा केन्द्र (One Stop / single-window) मा खटिएका कर्मचारीलाई थप अधिकार प्रत्यायोजन; दर्ता, स्वीकृति, सञ्चालन सरल, छिटो, पारदर्शी।",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १० (छ): एकल विन्दु सेवा केन्द्रका कर्मचारीलाई थप अधिकार; उद्योग दर्ता, स्वीकृति तथा सञ्चालन सरल, छिटो, पारदर्शी।",
    layer1: {
      hookEmoji: "🪟",
      hook: "More power to Single Point Service Center staff — if the back office connects.",
      hookNe: "एकल विन्दु केन्द्र कर्मचारीलाई थप अधिकार — पछाडिको कार्यालय जोडिएमा।",
      stakeLine: "Delegation without digital logs brings desk culture back — show who decided, when.",
      stakeLineNe: "डिजिटल लग बिना प्रत्यायोजनले डेस्क संस्कृति फर्काउँछ — कोले कहिले भन्यो देखाउनुहोस्।",
      coreQuestionShort: "Published SLAs; appeals when limits exceeded; same standards domestic vs FDI?",
      coreQuestionShortNe: "प्रकाशित SLA; सीमा नाघ्दा पुनरावेदन; स्वदेशी FDI उही मानक?",
      coreQuestion:
        "Which decisions move to the center with turnaround times; how is appeal handled when limits are exceeded; are service standards identical for domestic and foreign investors?",
      coreQuestionNe:
        "कुन निर्णय केन्द्रमा म्यादसहित सर्छ; प्रत्यायोजन नाघ्दा पुनरावेदन कसरी; स्वदेशी विदेशीका लागि सेवा मानक एकै?",
      quickScan: [
        {
          item: "Delegated decision list + published SLA per service type",
          itemNe: "प्रत्यायोजित निर्णय सूची + सेवा प्रकार प्रति प्रकाशित SLA",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Digital audit trail for every approval at the center",
          itemNe: "केन्द्रमा प्रत्येक स्वीकृतिका लागि डिजिटल लेखा पदचिन्ह",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "48-hour escalation path to departmental ombud (documented)",
          itemNe: "४८ घण्टामा विभागीय अधिवक्तामा उचालन (कागजात)",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Mystery-shopper or independent SLA audit (annual)",
          itemNe: "गुप्त ग्राहक वा स्वतन्त्र SLA लेखापरीक्षा (वार्षिक)",
          status: "❌ Not in place",
          statusNe: "❌ अझै छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Department of Industry; Ministry of Industry, Commerce and Supplies; provincial industry offices; OCR for company registrar integration.",
      primaryOwnersNe:
        "उद्योग विभाग; उद्योग वाणिज्य तथा आपूर्ति मन्त्रालय; प्रदेश उद्योग कार्यालय; कम्पनी दर्तासँग एकीकरण OCR।",
      coordinatingOfficeEn:
        "Single-window programme office with integration backlog and API catalogue to line ministries.",
      coordinatingOfficeNe: "मन्त्रालयसँग एकीकरण बाँकी र API सूचीसहित एकल खिड्की कार्यक्रम कार्यालय।",
      accountableRolesEn:
        "Center head publishes monthly SLA compliance rate and top delay reasons.",
      accountableRolesNe:
        "केन्द्र प्रमुखले मासिक SLA पालना दर र शीर्ष ढिलाइ कारण प्रकाशन।",
      timelineEn: "Rolling: delegation orders gazetted; quarterly integration sprints to back-end systems.",
      timelineNe: "क्रमशः: प्रत्यायोजन आदेश राजपत्र; पछाडिको प्रणालीमा त्रैमासिक एकीकरण स्प्रिन्ट।",
      milestones: [
        {
          en: "Bilingual tracking numbers and SMS/email status for investors.",
          ne: "लगानीकर्ताका लागि द्विभाषी ट्रयाकिङ र SMS/इमेल स्थिति।",
        },
        {
          en: "API links to tax, labour, and municipality clearances where applicable.",
          ne: "लागू भए कर, श्रम र नगरपालिका खुले API जोड।",
        },
        {
          en: "Published appeal outcomes and median time to resolve.",
          ne: "पुनरावेदन नतिजा र समाधान मध्यक समय प्रकाशन।",
        },
      ],
      kpis: [
        {
          metricEn: "Median days to register / approve by investor type",
          metricNe: "लगानीकर्ता प्रकारअनुसार दर्ता/स्वीकृति मध्यक दिन",
          howEn: "Case management export.",
          howNe: "मुद्दा व्यवस्थापन निकासा।",
        },
        {
          metricEn: "% of applications meeting published SLA",
          metricNe: "प्रकाशित SLA पूरा आवेदन %",
          howEn: "Monthly scorecard.",
          howNe: "मासिक स्कोरकार्ड।",
        },
      ],
      risks: [
        {
          en: "Front office empowered — back office still paper.",
          ne: "अगाडि अधिकार — पछाडि अझै कागज।",
        },
        {
          en: "Inconsistent provincial interpretation — investors shop jurisdictions.",
          ne: "प्रदेश फरक व्याख्या — लगानीकर्ता अधिकार क्षेत्र छान्छन्।",
        },
      ],
      escalation: [
        {
          en: "Industry associations publish investor experience surveys.",
          ne: "उद्योग संघले लगानीकर्ता अनुभव सर्वेक्षण।",
        },
        {
          en: "Share this point so single-window actually delivers (#point-53).",
          ne: "एकल खिड्की साँच्चै देओस् भने साझेदारी गर्नुहोस् (#बुँदा-५३)।",
        },
      ],
      programStatusEn: "🟡 At risk — Single Point Service Center delegation + SLAs not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — एकल विन्दु केन्द्र प्रत्यायोजन र SLA यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p54",
    pointNumber: 54,
    category: "Economy & Development",
    promise:
      "To make national infrastructure development rapid, orderly, and investment-friendly, mandatorily determine an investment modality for every National Pride Project and for all projects registered with Investment Board Nepal. The National Planning Commission, Investment Board Nepal, and Ministry of Finance shall, jointly within 90 days, classify all projects under government funding, public–private partnership, private investment, or mixed modalities; prepare and publish a National Structured Project Pipeline that includes capital mobilization, risk sharing, implementation arrangements, and timelines; make projects bankable accordingly; and accelerate the implementation process.",
    promiseNe:
      "देशको पूर्वाधार विकासलाई द्रुत, व्यवस्थित तथा लगानीमैत्री बनाउन नेपालमा सञ्चालनमा रहेका राष्ट्रिय गौरवका आयोजना तथा लगानी बोर्ड नेपालमा दर्ता भएका सम्पूर्ण परियोजनाहरूको लगानी मोडालिटी (Investment Modality) अनिवार्य रूपमा निर्धारण गर्ने। सबै परियोजनालाई सरकारी कोष, सार्वजनिक–निजी साझेदारी, निजी लगानी वा मिश्रित लगानी ढाँचामा वर्गीकरण गरी पुँजी परिचालन, जोखिम बाँडफाँट, कार्यान्वयन ढाँचा तथा समयसीमा सहितको National Structured Project Pipeline ९० (नब्बे) दिनभित्र तयार गरी सार्वजनिक गर्ने। उक्त संरचना अनुसार परियोजनाहरूलाई लगानीयोग्य (Bankable) बनाउँदै कार्यान्वयन प्रक्रिया द्रुत रूपमा अघि बढाउने।",
    question:
      "How is modality choice appealed when sponsors disagree, what fiscal risk is disclosed for sovereign guarantees, and how often is the pipeline updated on a public dashboard?",
    questionNe:
      "प्रायोजक असहमत भए ढाँचा चयनमा पुनरावेदन कसरी, संप्रभु ग्यारेन्टीका लागि वित्तीय जोखिम के खुल्छ, र पाइपलाइन सार्वजनिक ड्यासबोर्डमा कति पटक अद्यावधिक?",
    whyThisMatters:
      "Without a published pipeline, “priority” becomes negotiable in back rooms instead of budgets.",
    whyThisMattersNe:
      "प्रकाशित पाइपलाइन बिना «प्राथमिकता» बजेट होइन पछाडि कोठामा मोलतोल बन्छ।",
    possiblePathItems: [
      "Single source of truth URL for pipeline versions",
      "Independent credit-readiness review for mega projects",
      "Climate and land-risk flags per project entry",
      "Parliamentary briefing when modalities shift fiscal exposure",
    ],
    possiblePathItemsNe: [
      "पाइपलाइन संस्करणका लागि एकीकृत स्रोत URL",
      "ठूला आयोजनाका लागि स्वतन्त्र ऋण तयारी समीक्षा",
      "प्रविष्टि प्रति जलवायु र जग्गा जोखिम चिन्ह",
      "वित्तीय जोखिम सर्दा संसदीय ब्रिफिङ",
    ],
    systemInsight:
      "“Bankable” is not a label—it is a spreadsheet with revenue, risk, and counterparties that outsiders can stress-test.",
    systemInsightNe:
      "«बैंकयोग्य» लेबल होइन — बाहिरीले तनाव परीक्षण गर्न सक्ने आम्दानी, जोखिम र प्रतिपक्षी सहित स्प्रेडसिट।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ५४ (investment modality & national pipeline; scan Pages 10–11)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ५४ (लगानी ढाँचा र राष्ट्रिय पाइपलाइन; स्क्यान १०–११)",
    sourceExcerpt:
      "From scan (Pages 10–11, छ): अनिवार्य Investment Modality; ९० दिनमा NPC+IBN+MoF संयुक्त — वर्गीकरण, पुँजी/जोखिम/कार्यान्वयन/समयसीमासहित National Structured Project Pipeline प्रकाशन; Bankable बनाई कार्यान्वयन तीव्र।",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १०–११ (छ): गौरव र लगानी बोर्डका आयोजनामा लगानी मोडालिटी; ९० दिनमा आयोग, बोर्ड, अर्थ — वर्गीकरण र समयसीमासहित राष्ट्रिय संरचित पाइपलाइन सार्वजनिक; लगानीयोग्य बनाई द्रुत कार्यान्वयन।",
    layer1: {
      hookEmoji: "📈",
      hook: "Mandatory investment modality + National Structured Project Pipeline in 90 days (NPC + IBN + MoF).",
      hookNe: "९० दिनमा अनिवार्य लगानी ढाँचा + राष्ट्रिय संरचित पाइपलाइन (आयोग, बोर्ड, अर्थ)।",
      stakeLine: "Without a public pipeline, “priority” is negotiated in back rooms — not budgets.",
      stakeLineNe: "सार्वजनिक पाइपलाइन बिना «प्राथमिकता» पछाडि कोठामा — बजेट होइन।",
      coreQuestionShort: "Appeals on modality; fiscal risk of guarantees; dashboard update cadence?",
      coreQuestionShortNe: "ढाँचामा पुनरावेदन; ग्यारेन्टी वित्तीय जोखिम; ड्यासबोर्ड अद्यावधिक ताल?",
      coreQuestion:
        "How is modality choice appealed; what fiscal risk is disclosed for sovereign guarantees; how often is the pipeline updated publicly?",
      coreQuestionNe:
        "ढाँचा चयनमा पुनरावेदन कसरी; संप्रभु ग्यारेन्टी वित्तीय जोखिम के खुल्छ; पाइपलाइन कति पटक सार्वजनिक अद्यावधिक?",
      quickScan: [
        {
          item: "90-day pipeline published: modality, capital, risk share, timeline per project",
          itemNe: "९० दिन पाइपलाइन प्रकाशित: प्रति आयोजना ढाँचा, पुँजी, जोखिम, समयरेखा",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Single source of truth URL + version history for pipeline",
          itemNe: "पाइपलाइनका लागि एकीकृत स्रोत URL + संस्करण इतिहास",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Sovereign guarantee / fiscal exposure annex per mega-project",
          itemNe: "ठूला आयोजना प्रति संप्रभु ग्यारेन्टी/वित्तीय जोखिम अनुसूची",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Independent bankability / credit-readiness review for top projects",
          itemNe: "शीर्ष आयोजनाका लागि स्वतन्त्र बैंकयोग्यता/ऋण तयारी समीक्षा",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "National Planning Commission; Investment Board Nepal; Ministry of Finance; line ministries as project owners; Nepal Rastra Bank for macro-fiscal risk.",
      primaryOwnersNe:
        "राष्ट्रिय योजना आयोग; लगानी बोर्ड नेपाल; अर्थ मन्त्रालय; आयोजना मालिक मन्त्रालय; म्याक्रो-वित्त जोखिमका लागि राष्ट्र बैंक।",
      coordinatingOfficeEn:
        "Joint pipeline secretariat with shared data model and dispute resolution on modality classification.",
      coordinatingOfficeNe: "साझा डेटा मोडेल र ढाँचा वर्गीकरण विवाद समाधानसहित संयुक्त पाइपलाइन सचिवालय।",
      accountableRolesEn:
        "Quarterly public refresh of pipeline; parliament brief when fiscal exposure shifts.",
      accountableRolesNe:
        "त्रैमासिक सार्वजनिक पाइपलाइन ताजा; वित्तीय जोखिम सर्दा संसद ब्रिफिङ।",
      timelineEn: "T+90 days: structured pipeline v1; semi-annual updates; annual stress test of fiscal capacity.",
      timelineNe: "T+९० दिन: संरचित पाइपलाइन v१; अर्धवार्षिक अद्यावधिक; वार्षिक वित्तीय क्षमता तनाव परीक्षण।",
      milestones: [
        {
          en: "Climate and land-risk flags on each pipeline entry.",
          ne: "प्रत्येक प्रविष्टिमा जलवायु र जग्गा जोखिम चिन्ह।",
        },
        {
          en: "Standardized financial model template for PPP / private bids.",
          ne: "PPP/निजी बोलपत्रका लागि मानक वित्तीय मोडेल ढाँचा।",
        },
        {
          en: "Disclosure when modality changes mid-project.",
          ne: "आयोजनामध्ये ढाँचा परिवर्तन खुलासा।",
        },
      ],
      kpis: [
        {
          metricEn: "Projects with agreed modality / total in scope (%)",
          metricNe: "सहमति ढाँचा भएका आयोजना / दायराको कुल (%)",
          howEn: "Pipeline registry export.",
          howNe: "पाइपलाइन दर्ता निकासा।",
        },
        {
          metricEn: "Contingent liabilities from guarantees (published stock + flow)",
          metricNe: "ग्यारेन्टीबाट सम्भावित दायित्व (प्रकाशित भण्डार र प्रवाह)",
          howEn: "MoF debt report annex.",
          howNe: "अर्थ ऋण प्रतिवेदन अनुसूची।",
        },
      ],
      risks: [
        {
          en: "Optimistic bankability — projects approved without revenue risk honesty.",
          ne: "आशावादी बैंकयोग्यता — आम्दानी जोखिम ईमानदारी बिना स्वीकृत।",
        },
        {
          en: "Pipeline churn without implementation — reputational damage to IBN.",
          ne: "कार्यान्वयन बिना पाइपलाइन घुमाइ — IBN प्रतिष्ठा जोखिम।",
        },
      ],
      escalation: [
        {
          en: "Credit rating agencies comment on disclosed guarantee stock.",
          ne: "खुलाइएको ग्यारेन्टी भण्डारमा क्रेडिट रेटिङ टिप्पणी।",
        },
        {
          en: "Share this point so the pipeline stays bankable (#point-54).",
          ne: "पाइपलाइन बैंकयोग्य रहोस् भने साझेदारी गर्नुहोस् (#बुँदा-५४)।",
        },
      ],
      programStatusEn: "🟡 At risk — 90-day structured national project pipeline not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ९० दिन संरचित राष्ट्रिय आयोजना पाइपलाइन यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p55",
    pointNumber: 55,
    category: "Economy & Development",
    promise:
      "To provide integrated services with ease to domestic and foreign investors within defined time limits as prescribed, establish a One Door Approval System under Investment Board Nepal within the coming month and bring it into operation within one month.",
    promiseNe:
      "स्वदेशी तथा वैदेशिक लगानीकर्ताहरूलाई एकीकृत रूपले सहजताका साथ निर्धारित समयावधि भित्रै तोकिए बमोजिमका सेवा उपलब्ध गराउनका निम्ति लगानी बोर्ड नेपाल अन्तर्गत आगामी एक महिना भित्रै एक द्वार स्वीकृति प्रणाली (One Door Approval System) स्थापना गरी एक महिनाभित्र सञ्चालनमा ल्याउने।",
    question:
      "Which permits are in-scope on day one versus phased, and how is inter-agency refusal documented when the one-door clock is running?",
    questionNe:
      "पहिलो दिन कुन अनुमति भित्र, कुन चरणमा; एक द्वार घडी चल्दा निकायबीच अस्वीकृति कसरी कागजातीकृत हुन्छ?",
    whyThisMatters:
      "Investors measure reform in calendar days—partial one-door systems feel like old silos with a new logo.",
    whyThisMattersNe:
      "लगानीकर्ताले सुधार पात्रोमा माप्छ — आंशिक एक द्वार पुरानो सिलो नयाँ लोगो जस्तो।",
    possiblePathItems: [
      "Investor journey map with legal max durations",
      "Single tracking ID across ministries",
      "Default approval if silence exceeds statutory time",
      "Quarterly investor satisfaction survey published",
    ],
    possiblePathItemsNe: [
      "कानुनी अधिकतम अवधिसहित लगानीकर्ता यात्रा नक्सा",
      "मन्त्रालयभरि एकै ट्रयाकिङ ID",
      "विधायी मौन नाघे स्वीकृति मान्य",
      "त्रैमासिक लगानीकर्ता सन्तुष्टि सर्वेक्षण",
    ],
    systemInsight:
      "One month to stand up a true one-stop shop is aggressive—scope ruthlessly to permits that block FDI most.",
    systemInsightNe:
      "साँचो एक स्टप एक महिना आक्रामक — FDI रोक्ने अनुमति मात्र दायरामा राख्नुहोस्।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ५५ (One Door Approval System under IBN; scan Page 11)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ५५ (लगानी बोर्डमुनि एक द्वार स्वीकृति; स्क्यान पृष्ठ ११)",
    sourceExcerpt:
      "From scan (Page 11, छ): One Door Approval System under IBN — establish within coming month, operational within one month; integrated, easeful services to domestic and foreign investors in set timeframes.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ११ (छ): लगानी बोर्ड नेपाल अन्तर्गत एक द्वार स्वीकृति — आगामी एक महिनामा स्थापना, एक महिनाभित्र सञ्चालन; स्वदेशी/वैदेशिक लगानीकर्तालाई निर्धारित समयमा सेवा।",
    layer1: {
      hookEmoji: "🚪",
      hook: "One Door Approval under IBN — stand up in a month, run in a month.",
      hookNe: "लगानी बोर्डमुनि एक द्वार स्वीकृति — एक महिनामा खडा, अर्को महिनामा चलाउने।",
      stakeLine: "Partial one-door feels like old silos with a new logo — scope ruthlessly to blocking permits.",
      stakeLineNe: "आंशिक एक द्वार पुरानो सिलो नयाँ लोगो — रोक्ने अनुमति मात्र दायरामा।",
      coreQuestionShort: "Day-one permit list vs phased; inter-agency refusal documented while clock runs?",
      coreQuestionShortNe: "पहिलो दिन अनुमति सूची बनाम चरण; घडी चल्दा निकाय अस्वीकृति कागजात?",
      coreQuestion:
        "Which permits are in-scope on day one versus phased; how is inter-agency refusal documented when the one-door clock is running?",
      coreQuestionNe:
        "पहिलो दिन कुन अनुमति भित्र, कुन चरणमा; एक द्वार घडी चल्दा निकायबीच अस्वीकृति कसरी कागजातीकृत?",
      quickScan: [
        {
          item: "Published phased roadmap: day-1 vs month-3 vs month-6 permit bundles",
          itemNe: "प्रकाशित चरण रोडम्याप: दिन १ बनाम महिना ३/६ अनुमति गुच्छ",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Single investor tracking ID across all agencies in scope",
          itemNe: "दायराका सबै निकायमा एकै लगानीकर्ता ट्रयाकिङ ID",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Refusal/reason code registry when any agency says no (time-stamped)",
          itemNe: "कुनै निकायले अस्वीकार गर्दा कारण कोड दर्ता (समय छाप)",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Legal max durations + deemed approval if silence (where law allows)",
          itemNe: "कानुनी अधिकतम अवधि + मौन भए मान्य (कानुनले दिन्छ भने)",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Investment Board Nepal; Ministry of Industry, Commerce and Supplies; Ministry of Finance; Ministry of Labour; line ministries issuing sector permits; OPMCM for escalations.",
      primaryOwnersNe:
        "लगानी बोर्ड नेपाल; उद्योग वाणिज्य तथा आपूर्ति मन्त्रालय; अर्थ मन्त्रालय; श्रम मन्त्रालय; क्षेत्रीय अनुमति मन्त्रालय; उचालन प्रधानमन्त्री कार्यालय।",
      coordinatingOfficeEn:
        "IBN one-door programme office with SLA dashboard and weekly cross-agency stand-up.",
      coordinatingOfficeNe: "SLA ड्यासबोर्ड र हप्तामा अन्तरनिकाय स्ट्यान्ड-अपसहित IBN एक द्वार कार्यक्रम कार्यालय।",
      accountableRolesEn:
        "Named service-level owners per permit type; public monthly compliance report.",
      accountableRolesNe:
        "अनुमति प्रकार प्रति नामित SLA मालिक; मासिक पालना सार्वजनिक प्रतिवेदन।",
      timelineEn: "T+1 month: system established; T+2 months: operational with KPI go-live; 90-day hypercare.",
      timelineNe: "T+१ महिना: स्थापना; T+२ महिना: KPI सहित सञ्चालन; ९० दिन हाइपरकेयर।",
      milestones: [
        {
          en: "Investor journey map with legal max durations per step.",
          ne: "चरण प्रति कानुनी अधिकतम अवधिसहित लगानीकर्ता यात्रा नक्सा।",
        },
        {
          en: "API or workflow integration to major permit systems (no swivel-chair).",
          ne: "मुख्य अनुमति प्रणालीमा API वा कार्यप्रवाह एकीकरण (स्विभेल चेयर होइन)।",
        },
        {
          en: "Quarterly investor satisfaction survey published.",
          ne: "त्रैमासिक लगानीकर्ता सन्तुष्टि सर्वेक्षण प्रकाशन।",
        },
      ],
      kpis: [
        {
          metricEn: "Median calendar days end-to-end for FDI greenfield (pilot sector)",
          metricNe: "FDI ग्रिनफिल्ड अन्त्यदेखि अन्त्य मध्यक दिन (पाइलट क्षेत्र)",
          howEn: "Tracking ID analytics.",
          howNe: "ट्रयाकिङ ID विश्लेषण।",
        },
        {
          metricEn: "% of steps completed within published SLA",
          metricNe: "प्रकाशित SLA भित्र पूरा चरण %",
          howEn: "Workflow timestamps.",
          howNe: "कार्यप्रवाह समय छाप।",
        },
      ],
      risks: [
        {
          en: "Scope too wide — nothing works reliably on day one.",
          ne: "दायरा धेरै विस्तृत — पहिलो दिन केही पनि विश्वसनीय छैन।",
        },
        {
          en: "Agencies ignore IBN routing — parallel approvals continue.",
          ne: "निकायले IBN मार्ग बेवास्ता — समानान्तर स्वीकृति जारी।",
        },
      ],
      escalation: [
        {
          en: "Embassy trade desks report friction against published SLAs.",
          ne: "दूतावास व्यापार डेस्कले प्रकाशित SLA विरुद्ध घर्षण।",
        },
        {
          en: "Share this point so one-door is real (#point-55).",
          ne: "एक द्वार वास्तविक होस् भने साझेदारी गर्नुहोस् (#बुँदा-५५)।",
        },
      ],
      programStatusEn: "🟡 At risk — IBN One Door Approval System (establish + operate) not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — लगानी बोर्ड एक द्वार स्वीकृति (स्थापना+सञ्चालन) यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p56",
    pointNumber: 56,
    category: "Economy & Development",
    promise:
      "To promote entrepreneurship, improve the investment climate, and simplify business registration, implement a “Startup Fast Track” system so registration is simple, completed within two days, and free of unnecessary hassle.",
    promiseNe:
      "देशमा उद्यमशीलता प्रवर्द्धन, लगानी वातावरण सुधार तथा व्यवसाय दर्ता प्रक्रियालाई सरल, छिटो (दुई दिनभित्र) र झन्झटरहित बनाउन «Startup Fast Track» प्रणाली लागू गर्ने।",
    question:
      "What statutory carve-outs enable two-day registration, how are beneficial owners verified without slowing founders, and which sectors are excluded for prudential reasons?",
    questionNe:
      "दुई दिने दर्ता कुन कानुनी छुटले, लाभकारी स्वामित्व प्रमाणित गर्दा संस्थापक नढिलाइ कसरी, र कुन क्षेत्र सावधानीले बाहिर?",
    whyThisMatters:
      "Startup timelines signal whether the state sees founders as partners or suspects.",
    whyThisMattersNe:
      "स्टार्टअप समयरेखाले राज्यले संस्थापकलाई साझेदार वा सन्देही देख्छ भन्छ।",
    possiblePathItems: [
      "Plain-language checklist and rejected-application reasons",
      "Integration with tax ID and social security in the same window",
      "Sandbox for regulated sectors with clear exit rules",
      "Founder feedback loop to regulators monthly",
    ],
    possiblePathItemsNe: [
      "सरल भाषा चेकलिस्ट र अस्वीकृति कारण",
      "एकै खिड्कीमा कर दर्ता र सामाजिक सुरक्षा जोड",
      "नियमित क्षेत्रका लागि स्यान्डबक्स स्पष्ट निकास नियमसहित",
      "नियामकप्रति मासिक संस्थापक प्रतिक्रिया",
    ],
    systemInsight:
      "Two-day registration is easy to announce and hard to sustain—automation and exception reporting separate reform from rhetoric.",
    systemInsightNe:
      "दुई दिने दर्ता घोषणा सजिलो टिकाउ गाह्रो — स्वचालन र अपवाद प्रतिवेदनले नारा र सुधार छुट्याउँछ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ५६ (Startup Fast Track registration; scan Page 11)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ५६ (Startup Fast Track दर्ता; स्क्यान पृष्ठ ११)",
    sourceExcerpt:
      "From scan (Page 11, छ): Startup Fast Track — entrepreneurship, investment climate, business registration simple and within two days, hassle-free.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ११ (छ): उद्यमशीलता, लगानी वातावरण, व्यवसाय दर्ता सरल र दुई दिनभित्र, झन्झटरहित — Startup Fast Track।",
    layer1: {
      hookEmoji: "🚀",
      hook: "Startup Fast Track — two-day registration, minimal hassle.",
      hookNe: "स्टार्टअप फास्ट ट्र्याक — दुई दिने दर्ता, कम झन्झट।",
      stakeLine: "Two days is easy to announce; automation and exception reports separate reform from slogans.",
      stakeLineNe: "दुई दिन घोषणा सजिलो; स्वचालन र अपवाद प्रतिवेदनले नारा र सुधार छुट्याउँछ।",
      coreQuestionShort: "Legal carve-outs, BO verification without slowing founders, excluded sectors?",
      coreQuestionShortNe: "कानुनी छुट, संस्थापक नढिलाइ BO प्रमाणित, बाहिर क्षेत्र?",
      coreQuestion:
        "What statutory carve-outs enable two-day registration; how are beneficial owners verified without slowing founders; which sectors are excluded for prudential reasons?",
      coreQuestionNe:
        "दुई दिने दर्ता कुन कानुनी छुटले; लाभकारी स्वामित्व प्रमाणित गर्दा संस्थापक नढिलाइ कसरी; कुन क्षेत्र सावधानीले बाहिर?",
      quickScan: [
        {
          item: "Published fast-track eligibility + prudential exclusion list",
          itemNe: "प्रकाशित फास्ट-ट्र्याक योग्यता + सावधानी बहिष्करण सूची",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "BO verification path: NID-linked / bank attestation / risk tiers",
          itemNe: "BO प्रमाणन: NID जोडिएको/बैंक प्रमाणन/जोखिम तह",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Median time-to-register for fast-track (actual vs 2-day target)",
          itemNe: "फास्ट-ट्र्याक दर्ता मध्यक समय (वास्तविक बनाम २ दिन लक्ष्य)",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
        {
          item: "Plain-language rejection reasons + appeal SLA",
          itemNe: "सरल भाषा अस्वीकृति कारण + पुनरावेदन SLA",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of Company Registrar; Department of Industry; Inland Revenue Department; Nepal Rastra Bank for BO norms; MoFAGA for single-window alignment.",
      primaryOwnersNe:
        "कम्पनी दर्ता कार्यालय; उद्योग विभाग; आन्तरिक राजस्व विभाग; BO मानकका लागि राष्ट्र बैंक; एकल खिड्की मिलानका लागि संघीय मामिला।",
      coordinatingOfficeEn:
        "Startup fast-track programme office with integration backlog to tax ID and social security.",
      coordinatingOfficeNe: "कर ID र सामाजिक सुरक्षासँग एकीकरण बाँकीसहित स्टार्टअप फास्ट-ट्र्याक कार्यक्रम कार्यालय।",
      accountableRolesEn:
        "Monthly public stats: applications, approvals, median hours, top rejection codes.",
      accountableRolesNe:
        "मासिक सार्वजनिक तथ्य: आवेदन, स्वीकृति, मध्यक घण्टा, शीर्ष अस्वीकृति कोड।",
      timelineEn: "Go-live: two-day path for listed sectors; quarterly expansion of eligible NAICS codes.",
      timelineNe: "गो-लाइभ: सूचीबद्ध क्षेत्रमा दुई दिने मार्ग; त्रैमासिक योग्य NAICS विस्तार।",
      milestones: [
        {
          en: "API integration: company registration → PAN in same session where possible.",
          ne: "सम्भव भए एउटै सत्रमा कम्पनी दर्ता → PAN API जोड।",
        },
        {
          en: "Sandbox for regulated sectors with published exit rules.",
          ne: "प्रकाशित निकास नियमसहित नियमित क्षेत्र स्यान्डबक्स।",
        },
        {
          en: "Founder feedback loop to regulators (monthly public summary).",
          ne: "नियामकप्रति संस्थापक प्रतिक्रिया (मासिक सार्वजनिक सार)।",
        },
      ],
      kpis: [
        {
          metricEn: "% of fast-track applications completed ≤2 business days",
          metricNe: "≤२ कार्य दिनमा पूरा फास्ट-ट्र्याक आवेदन %",
          howEn: "OCR system timestamps.",
          howNe: "कम्पनी दर्ता प्रणाली समय छाप।",
        },
        {
          metricEn: "Appeal overturn rate (quality signal for frontline decisions)",
          metricNe: "पुनरावेदन उल्ट्याउने दर (अग्रपंक्ति निर्णय गुण संकेत)",
          howEn: "Appeals docket.",
          howNe: "पुनरावेदन दर्ता।",
        },
      ],
      risks: [
        {
          en: "KYC-lite abused — shell companies for laundering.",
          ne: "कमजोर KYC दुरुपयोग — सेल कम्पनी धुन।",
        },
        {
          en: "Back-office backlog — two-day promise at front desk only.",
          ne: "पछाडिको बाँकी — अगाडि मात्र दुई दिन वाचा।",
        },
      ],
      escalation: [
        {
          en: "Startup associations publish quarterly scorecard vs SLAs.",
          ne: "स्टार्टअप संघले त्रैमासिक स्कोरकार्ड बनाम SLA।",
        },
        {
          en: "Share this point so two-day registration stays real (#point-56).",
          ne: "दुई दिने दर्ता वास्तविक रहोस् भने साझेदारी गर्नुहोस् (#बुँदा-५६)।",
        },
      ],
      programStatusEn: "🟡 At risk — Startup Fast Track two-day registration not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — स्टार्टअप फास्ट ट्र्याक दुई दिने दर्ता यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p57",
    pointNumber: 57,
    category: "Economy & Development",
    promise:
      "To improve credit flow to small and medium enterprises (SME), agriculture, and the information technology sector, Nepal Rastra Bank shall within 30 days put in place arrangements to reduce risk weighting (Risk Weightage) to an appropriate level.",
    promiseNe:
      "साना तथा मझौला उद्योग (SME), कृषि तथा सूचना प्रविधि क्षेत्रको ऋणप्रवाहमा हाल रहेको जोखिम भार (Risk Weightage) घटाई उपयुक्त तहमा झार्ने व्यवस्था नेपाल राष्ट्र बैंकले ३० दिनभित्र मिलाउने।",
    question:
      "What NPL thresholds trigger reversal of lower weights, how is sector definition standardized to prevent arbitrage, and are climate or green lines treated separately?",
    questionNe:
      "कुन NPL थ्रेसहोल्डले तौल घटाउन उल्ट्याउँछ, क्षेत्र परिभाषा मानकीकरण कसरी अर्बिट्रेज रोक्छ, र हरित कर्जा छुट्टै छ?",
    whyThisMatters:
      "Cheaper capital for SMEs is macro-prudential policy—without guardrails, forbearance becomes the next crisis.",
    whyThisMattersNe:
      "SME सस्तो पूँजी म्याक्रो नीति हो — सुरक्षा नभए माफी अर्को संकट बन्छ।",
    possiblePathItems: [
      "Published methodology note with stress scenarios",
      "Quarterly portfolio quality disclosure by bank",
      "Sunset review of weight relief with parliamentary note",
      "Targeted lines for women-led and rural MSMEs",
    ],
    possiblePathItemsNe: [
      "तनाव परिदृश्यसहित प्रकाशित विधि नोट",
      "बैंक प्रति त्रैमासिक पोर्टफोलियो गुणस्तर खुलाइ",
      "तौल राहत सूर्यास्त समीक्षा संसद नोटसहित",
      "महिला नेतृत्व र ग्रामीण MSME लक्षित रेखा",
    ],
    systemInsight:
      "Lowering risk weights moves risk from spreadsheets to supervisors’ judgment—publish the models or markets will guess.",
    systemInsightNe:
      "जोखिम तौल घटाउँदा जोखिम स्प्रेडसिटबाट पर्यवेक्षकको विवेकमा सर्छ — नमूना नखुले बजार अनुमान गर्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ५७ (NRB risk weighting for SME/ag/IT; scan Page 11)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ५७ (SME/कृषि/IT जोखिम तौल; स्क्यान पृष्ठ ११)",
    sourceExcerpt:
      "From scan (Page 11, छ): NRB within 30 days — reduce Risk Weightage (जोखिम भार) for SME, agriculture, and IT lending to an appropriate level.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ११ (छ): SME, कृषि, IT ऋणप्रवाहको जोखिम भार घटाई उपयुक्त तह — NRB ३० दिनभित्र व्यवस्था।",
    layer1: {
      hookEmoji: "🏦",
      hook: "NRB cuts risk weights for SME, agriculture, and IT lending — in 30 days.",
      hookNe: "राष्ट्र बैंकले SME, कृषि र IT ऋणका लागि जोखिम तौल घटाउँछ — ३० दिनमा।",
      stakeLine: "Cheaper capital is macro-prudential — without guardrails, forbearance seeds the next crisis.",
      stakeLineNe: "सस्तो पूँजी म्याक्रो नीति हो — सुरक्षा नभए माफी अर्को संकट बोयो।",
      coreQuestionShort: "NPL triggers reversal; standardized sector codes; green lines separate?",
      coreQuestionShortNe: "NPL ले उल्ट्याउँछ; क्षेत्र कोड मानक; हरित छुट्टै?",
      coreQuestion:
        "What NPL thresholds reverse lower weights; how is sector definition standardized to prevent arbitrage; are green lines treated separately?",
      coreQuestionNe:
        "कुन NPL थ्रेसहोल्डले तौल घटाउन उल्ट्याउँछ; क्षेत्र परिभाषा मानकीकरण कसरी अर्बिट्रेज रोक्छ; हरित कर्जा छुट्टै छ?",
      quickScan: [
        {
          item: "30-day circular: new weights + effective date + grandfathering rules",
          itemNe: "३० दिन परिपत्र: नयाँ तौल + लागू मिति + ग्रान्डफादर नियम",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Published methodology note + stress scenarios (macro stress test)",
          itemNe: "प्रकाशित विधि नोट + तनाव परिदृश्य (म्याक्रो तनाव परीक्षण)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Sector coding standard (ISIC/NAICS) to stop regulatory arbitrage",
          itemNe: "अर्बिट्रेज रोक्न क्षेत्र कोड मानक (ISIC/NAICS)",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Quarterly bank portfolio quality disclosure under new weights",
          itemNe: "नयाँ तौल अन्तर्गत त्रैमासिक बैंक पोर्टफोलियो गुणस्तर खुलाइ",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Nepal Rastra Bank (Banking Supervision, Monetary Policy); Ministry of Finance; banks’ risk committees; MFIs where applicable.",
      primaryOwnersNe:
        "नेपाल राष्ट्र बैंक (बैंकिङ पर्यवेक्षण, मौद्रिक नीति); अर्थ मन्त्रालय; बैंक जोखिम समिति; लागू भए साना वित्त।",
      coordinatingOfficeEn:
        "NRB policy unit with bank-by-bank impact models and sunset review calendar.",
      coordinatingOfficeNe: "बैंक प्रति प्रभाव मोडेल र सूर्यास्त समीक्षा पात्रोसहित NRB नीति एकाइ।",
      accountableRolesEn:
        "NRB governor attests quarterly that forbearance stock is within stress limits.",
      accountableRolesNe:
        "राष्ट्र बैंक गभर्नरले त्रैमासिक माफी भण्डार तनाव सीमाभित्र भनी प्रमाणित।",
      timelineEn: "T+30 days: circular effective; Y1: mid-year review; sunset or adjustment per methodology.",
      timelineNe: "T+३० दिन: परिपत्र लागू; Y१: मध्यवर्ष समीक्षा; विधि अनुसार सूर्यास्त वा समायोजन।",
      milestones: [
        {
          en: "Green/climate line eligibility if treated separately (published criteria).",
          ne: "छुट्टै भए हरित/जलवायद योग्यता (प्रकाशित मापदण्ड)।",
        },
        {
          en: "Women-led / rural MSME sub-limits tracked in disclosure.",
          ne: "खुलाइमा महिला नेतृत्व/ग्रामीण MSME उपसीमा ट्रयाक।",
        },
        {
          en: "Parliamentary briefing note on contingent fiscal risk from loan quality.",
          ne: "ऋण गुणस्तरबाट सम्भावित वित्तीय जोखिम संसद नोट।",
        },
      ],
      kpis: [
        {
          metricEn: "Growth in SME/ag/IT lending vs NPL ratio (quarterly)",
          metricNe: "SME/कृषि/IT ऋण वृद्धि बनाम NPL अनुपात (त्रैमासिक)",
          howEn: "NRB supervisory returns.",
          howNe: "NRB पर्यवेक्षक फिर्ता।",
        },
        {
          metricEn: "Number of weight reversals triggered by NPL breaches",
          metricNe: "NPL उल्लंघनले ट्रिगर भएका तौल उल्टाइ संख्या",
          howEn: "Bank notification log to NRB.",
          howNe: "बैंकले NRB मा सूचना लग।",
        },
      ],
      risks: [
        {
          en: "Sector misclassification — banks game codes for lower capital.",
          ne: "क्षेत्र गलत वर्गीकरण — बैंकले कम पूँजीका लागि कोड खेल्छ।",
        },
        {
          en: "Hidden forbearance — evergreening masks true NPLs.",
          ne: "लुकेको माफी — एभरग्रिनिङले साँचो NPL लुकाउँछ।",
        },
      ],
      escalation: [
        {
          en: "IMF/World Bank technical note on consistency with Basel norms.",
          ne: "Basel मानसँग मिलान IMF/विश्व बैंक प्राविधिक नोट।",
        },
        {
          en: "Share this point so risk relief stays prudent (#point-57).",
          ne: "जोखिम राहत सावधानीपूर्ण रहोस् भने साझेदारी गर्नुहोस् (#बुँदा-५७)।",
        },
      ],
      programStatusEn: "🟡 At risk — NRB 30-day risk-weight adjustment for SME/ag/IT not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — SME/कृषि/IT का लागि NRB ३० दिन जोखिम तौल समायोजन यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p58",
    pointNumber: 58,
    category: "Economy & Development",
    promise:
      "Within 45 days provide integrated services for business registration, tax registration, bank account opening, and other necessary permits through a One Door Business Platform. Make the entire service-delivery process digital, transparent, and trackable, and immediately implement legal, technical, and procedural reforms needed for execution.",
    promiseNe:
      "व्यवसाय दर्ता, कर दर्ता, बैंक खाता तथा अन्य आवश्यक अनुमति लिनुपर्ने विषयलाई एकीकृत गरी ४५ दिनभित्र One Door Business Platform मार्फत सेवा उपलब्ध गराउने। सेवा प्रवाहको क्रममा सम्पूर्ण प्रक्रिया डिजिटल, पारदर्शी तथा ट्र्याकिङयोग्य बनाई कार्यान्वयनका लागि कानुनी, प्राविधिक तथा प्रक्रियागत सुधार तत्काल लागू गर्ने।",
    question:
      "Which banks are API-integrated for account opening, how is KYC harmonized with NID, and what interoperability standards prevent duplicate data entry?",
    questionNe:
      "खाता खोल्न कुन बैंक API जोडिएको, NID सँग KYC कसरी मिलाइएको, र दोहोरो डेटा प्रवेश रोक्न अन्तरसञ्चालन मानक के?",
    whyThisMatters:
      "A unified business birth certificate reduces informal firms—but only if every agency consumes the same API truth.",
    whyThisMattersNe:
      "एकीकृत व्यवसाय जन्म प्रमाणपत्रले अनौपचारिक फर्म घटाउँछ — हरेक निकायले एउटै API सत्य खाने हो भने।",
    possiblePathItems: [
      "OAuth-style consent for sharing founder data across agencies",
      "Sandbox environment for banks before go-live",
      "Published error codes when integrations fail",
      "SME helpdesk with SLA for platform outages",
    ],
    possiblePathItemsNe: [
      "निकायबीच संस्थापक डेटा साझेदारीका लागि सहमति ढाँचा",
      "गो-लाइभ अघि बैंकका लागि स्यान्डबक्स",
      "एकीकरण असफल हुँदा प्रकाशित त्रुटि कोड",
      "प्लेटफर्म बन्दका लागि SME हेल्पडेस्क SLA",
    ],
    systemInsight:
      "Forty-five days for full-stack onboarding across tax, banks, and permits is a stress test for government middleware.",
    systemInsightNe:
      "कर, बैंक, अनुमति पूर्ण स्ट्याक ४५ दिन सरकारी मिडलवेयरको तनाव परीक्षण।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ५८ (One Door Business Platform; scan Page 11)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ५८ (एक द्वार व्यवसाय प्लेटफर्म; स्क्यान पृष्ठ ११)",
    sourceExcerpt:
      "From scan (Page 11, छ): ४५ दिनमा One Door Business Platform — business/tax/bank/other permits integrated; full process digital, transparent, trackable; immediate legal, technical, procedural reform.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ११ (छ): ४५ दिनमा एकीकृत One Door Business Platform; सेवा प्रवाह डिजिटल, पारदर्शी, ट्र्याकिङयोग्य; कानुनी, प्राविधिक, प्रक्रियागत सुधार तत्काल।",
    layer1: {
      hookEmoji: "🚪",
      hook: "One Door Business Platform in 45 days — registration, tax, bank, permits in one flow.",
      hookNe: "४५ दिनमा एक द्वार व्यवसाय प्लेटफर्म — दर्ता, कर, बैंक, अनुमति एउटै प्रवाहमा।",
      stakeLine: "One truth for all agencies — otherwise the platform is a prettier form dump.",
      stakeLineNe: "सबै निकायका लागि एउटै सत्य — नभए प्लेटफर्म राम्रो फर्म डम्प मात्र।",
      coreQuestionShort: "Bank APIs for account opening; KYC harmonized with NID; no duplicate data entry?",
      coreQuestionShortNe: "खाता खोल्न बैंक API; NID सँग KYC मिलाइएको; दोहोरो प्रवेश छैन?",
      coreQuestion:
        "Which banks are API-integrated; how is KYC harmonized with NID; what interoperability standards prevent duplicate entry?",
      coreQuestionNe:
        "कुन बैंक API जोडिएको; NID सँग KYC कसरी मिलाइएको; दोहोरो डेटा रोक्न अन्तरसञ्चालन मानक के?",
      quickScan: [
        {
          item: "45-day go-live: integrated journey for business + tax + at least 2 banks",
          itemNe: "४५ दिन गो-लाइभ: व्यवसाय+कर+कम्ती २ बैंक एकीकृत यात्रा",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "NID-verified KYC bundle reused across agencies (consent logged)",
          itemNe: "निकायबीच NID प्रमाणित KYC पुन:प्रयोग (सहमति लग)",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Published API specs + error codes when integrations fail",
          itemNe: "प्रकाशित API विनिर्देश + एकीकरण असफल हुँदा त्रुटि कोड",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "End-to-end digital audit trail exportable for compliance",
          itemNe: "अन्त्यदेखि अन्त्य डिजिटल लेखा पदचिन्ह अनुपालनका लागि निकाल्न मिल्ने",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of Company Registrar; Inland Revenue Department; Nepal Rastra Bank; major commercial banks; Department of Industry; NPCS for platform.",
      primaryOwnersNe:
        "कम्पनी दर्ता कार्यालय; आन्तरिक राजस्व विभाग; नेपाल राष्ट्र बैंक; ठूला वाणिज्य बैंक; उद्योग विभाग; प्लेटफर्मका लागि NPCS।",
      coordinatingOfficeEn:
        "One Door Business programme office with bank sandbox and ministry API onboarding.",
      coordinatingOfficeNe: "बैंक स्यान्डबक्स र मन्त्रालय API अनबोर्डिङसहित एक द्वार व्यवसाय कार्यक्रम कार्यालय।",
      accountableRolesEn:
        "Weekly integration stand-up with public red/yellow/green status per agency feed.",
      accountableRolesNe:
        "हप्तामा एकीकरण स्ट्यान्ड-अप; प्रति निकाय फिड सार्वजनिक रातो/पहेँलो/हरियो।",
      timelineEn: "T+45 days: MVP live; T+90: majority of banks on API; ongoing legal harmonization.",
      timelineNe: "T+४५ दिन: MVP लाइभ; T+९०: बैंकको बहुमत API; निरन्तर कानुनी मिलान।",
      milestones: [
        {
          en: "OAuth-style consent for founder data sharing across agencies.",
          ne: "निकायबीच संस्थापक डेटा साझेदारीका लागि OAuth-शैली सहमति।",
        },
        {
          en: "SME helpdesk with SLA for platform outages.",
          ne: "प्लेटफर्म बन्दका लागि SME हेल्पडेस्क SLA।",
        },
        {
          en: "Load and security test report published pre go-live.",
          ne: "गो-लाइभ अघि लोड र सुरक्षा परीक्षण प्रतिवेदन प्रकाशन।",
        },
      ],
      kpis: [
        {
          metricEn: "Share of new business registrations via platform (%)",
          metricNe: "प्लेटफर्मबाट नयाँ व्यवसाय दर्ता %",
          howEn: "OCR + platform analytics.",
          howNe: "कम्पनी दर्ता + प्लेटफर्म विश्लेषण।",
        },
        {
          metricEn: "Median hours from start to bank account + tax ID issued",
          metricNe: "सुरुदेखि बैंक खाता + PAN जारीसम्म मध्यक घण्टा",
          howEn: "Workflow timestamps across systems.",
          howNe: "प्रणालीबीच कार्यप्रवाह समय छाप।",
        },
      ],
      risks: [
        {
          en: "Weak bank APIs — manual uploads break the promise.",
          ne: "कमजोर बैंक API — म्यानुअल अपलोडले वाचा तोड्छ।",
        },
        {
          en: "Agency systems out of sync — duplicate records and disputes.",
          ne: "निकाय प्रणाली असिङ्क — दोहोरो रेकर्ड र विवाद।",
        },
      ],
      escalation: [
        {
          en: "Federation of Nepalese Chambers publishes integration friction index.",
          ne: "नेपाल उद्योग वाणिज्य महासंघले एकीकरण घर्षण सूचकांक।",
        },
        {
          en: "Share this point so one business birth certificate works (#point-58).",
          ne: "एक व्यवसाय जन्म प्रमाणपत्र काम गरोस् भने साझेदारी गर्नुहोस् (#बुँदा-५८)।",
        },
      ],
      programStatusEn: "🟡 At risk — 45-day One Door Business Platform not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ४५ दिन एक द्वार व्यवसाय प्लेटफर्म यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p59",
    pointNumber: 59,
    category: "Economy & Development",
    promise:
      "To strengthen job creation, skills development, and entrepreneurship in an integrated way, within 60 days transform employment service centers into Employment, Skill and Entrepreneurship Centers through joint work by the Council for Technical Education and Vocational Training under the Ministry of Education, Science and Technology; the Vocational and Skill Development Training Academy under the Ministry of Labour, Employment and Social Security; the Industrial Enterprise Development Institute under the Ministry of Industry, Commerce and Supplies; and related bodies. Centers shall register the unemployed and, in addition to public employment programs, map local skills and demand, coordinate training, facilitate entrepreneurship, and run reintegration activities for workers returning from foreign employment. Local levels shall be requested to allocate minimum budget for effective center operation and to include annual skill-development plans, ensuring accountability in implementation; and digital systems, standards, and procedures required to implement these arrangements shall be developed and applied immediately.",
    promiseNe:
      "देशमा रोजगारी सिर्जना, सीप विकास तथा उद्यमशीलता प्रवर्द्धनलाई एकीकृत रूपमा सुदृढ गर्न शिक्षा, विज्ञान तथा प्रविधि मन्त्रालय अन्तर्गतको प्राविधिक शिक्षा तथा व्यावसायिक तालिम परिषद् (CTEVT), श्रम, रोजगार तथा सामाजिक सुरक्षा मन्त्रालय अन्तर्गतको व्यावसायिक तथा सिप विकास तालिम प्रतिष्ठान तथा उद्योग, वाणिज्य तथा आपूर्ति मन्त्रालय अन्तर्गतको औद्योगिक व्यवसाय विकास प्रतिष्ठान लगायतका संस्थाहरूले संयुक्त रूपमा कार्य गर्ने गरी रोजगार सेवा केन्द्रहरूलाई ६० दिनभित्र «रोजगार, सीप तथा उद्यमशीलता केन्द्र» मा रूपान्तरण गर्ने। सो केन्द्रले रोजगारीविहीनहरूको दर्ता र सार्वजनिक रोजगार कार्यक्रमका अतिरिक्त स्थानीय सीप तथा सोको माग नक्साङ्कन, तालिम समन्वय, उद्यमशीलता सहजीकरण तथा वैदेशिक रोजगारीबाट फर्किएका श्रमिकहरूको पुनःएकीकरण सम्बन्धी कार्य सञ्चालन गर्ने। स्थानीय तहलाई उक्त केन्द्रको प्रभावकारी परिचालन गर्न न्यूनतम बजेट विनियोजन एवं वार्षिक सीप विकास योजना समावेश गरी कार्यसम्पादनमा जवाफदेहिता सुनिश्चित गर्न अनुरोध गर्ने। उक्त व्यवस्था कार्यान्वयनका लागि आवश्यक डिजिटल प्रणाली, मापदण्ड तथा कार्यविधि तत्काल निर्माण गरी लागू गर्ने।",
    question:
      "How are training outcomes linked to job orders from industry, what mental-health and rights counseling exists for returnees, and are placement rates published by municipality?",
    questionNe:
      "तालिम नतिजा उद्योगको जागिर आदेशसँग कसरी जोडिन्छ, फर्कने श्रमिकका लागि मानसिक स्वास्थ्य र अधिकार परामर्श के, र पालिका अनुसार प्लेसमेन्ट दर प्रकाशित हुन्छ?",
    whyThisMatters:
      "Employment centers become credible when employers show up with real vacancies, not just training certificates.",
    whyThisMattersNe:
      "रोजगार केन्द्र विश्वसनीय हुन्छ जब रोजगारदाता वास्तविक रिक्त पद लिएर आउँछ, प्रमाणपत्र मात्र होइन।",
    possiblePathItems: [
      "MOUs with sector associations for hire-or-train pledges",
      "Returnee desk with legal aid for wage theft abroad",
      "Open data on course completion vs job placement",
      "Mobile outreach for rural youth and women",
    ],
    possiblePathItemsNe: [
      "नियोजन वा तालिम प्रतिबद्धतासहित क्षेत्र संघसँग समझदारी",
      "विदेशी ज्याला हिनामिनाका लागि कानुनी सहायतासहित फर्कने डेस्क",
      "तालिम पूरा बनाम जागिर प्लेसमेन्ट खुला डेटा",
      "ग्रामीण युवा र महिलाका लागि मोबाइल आउटरीच",
    ],
    systemInsight:
      "Renaming offices without labor-market signal is theater—tie budgets to verified placements, not seat-days trained.",
    systemInsightNe:
      "श्रम बजार संकेत बिना कार्यालय पुन:नाम नाटक — बजेट सीट-दिन होइन प्रमाणित प्लेसमेन्टसँग जोड्नुहोस्।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ५९ (employment/skill/entrepreneurship centers; scan Page 11)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ५९ (रोजगार, सीप, उद्यम केन्द्र; स्क्यान पृष्ठ ११)",
    sourceExcerpt:
      "From scan (Pages 11–12, छ): CTEVT (MoEST), vocational/skill training academy (MoLESS), industrial enterprise institute (MoICS) — 60 days transform employment centers; unemployed + public employment programs, skill/demand mapping, training, entrepreneurship, foreign-returnee reintegration; local minimum budget, annual skill plans, accountability; immediate digital systems, standards, procedures.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ ११–१२ (छ): MoEST/CTEVT, MoLESS/तालिम प्रतिष्ठान, MoICS/औद्योगिक व्यवसाय विकास प्रतिष्ठान — ६० दिनमा «रोजगार, सीप तथा उद्यमशीलता केन्द्र»; रोजगारीविहीन दर्ता, सार्वजनिक रोजगार बाहेक सीप/माग नक्साङ्कन, फर्केका श्रमिक पुनःएकीकरण; स्थानीय न्यूनतम बजेट, वार्षिक सीप योजना, जवाफदेहिता; डिजिटल प्रणाली/मापदण्ड/कार्यविधि तत्काल।",
    layer1: {
      hookEmoji: "🧑‍🏭",
      hook: "Employment centres → Employment, Skill & Entrepreneurship hubs — 60 days, multi-ministry.",
      hookNe: "रोजगार केन्द्र → रोजगार, सीप र उद्यम केन्द्र — ६० दिन, बहु मन्त्रालय।",
      stakeLine: "Renaming without labour-market signal is theatre — tie budgets to verified placements.",
      stakeLineNe: "श्रम बजार संकेत बिना पुन:नाम नाटक — बजेट प्रमाणित प्लेसमेन्टसँग जोड्नुहोस्।",
      coreQuestionShort: "Training linked to real job orders; returnee support; placement rates by municipality?",
      coreQuestionShortNe: "वास्तविक जागिर आदेशसँग तालिम; फर्कने सहयोग; पालिका अनुसार प्लेसमेन्ट?",
      coreQuestion:
        "How are training outcomes linked to industry job orders; what support exists for returnees; are placement rates published by municipality?",
      coreQuestionNe:
        "तालिम नतिजा उद्योगको जागिर आदेशसँग कसरी जोडिन्छ; फर्कने श्रमिकका लागि के सहयोग; पालिका अनुसार प्लेसमेन्ट दर प्रकाशित?",
      quickScan: [
        {
          item: "60-day transformation plan: sites, staff, digital system per centre",
          itemNe: "६० दिन रूपान्तरण योजना: स्थल, कर्मचारी, प्रति केन्द्र डिजिटल प्रणाली",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Skill-demand map + training calendar with employer MOUs",
          itemNe: "सीप-माग नक्सा + रोजगारदाता समझदारीसहित तालिम पात्रो",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Returnee desk: legal aid, mental health, reintegration pathways",
          itemNe: "फर्कने डेस्क: कानुनी सहायता, मानसिक स्वास्थ्य, पुनःएकीकरण मार्ग",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Local minimum budget + annual skill plan accountability (published)",
          itemNe: "स्थानीय न्यूनतम बजेट + वार्षिक सीप योजना जवाफदेहिता (प्रकाशित)",
          status: "❌ Not published",
          statusNe: "❌ प्रकाशित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "CTEVT (MoEST); Vocational Training Academy (MoLESS); Industrial Enterprise Development Institute (MoICS); MoFAGA for local coordination; provincial/local governments for budgets.",
      primaryOwnersNe:
        "CTEVT (शिक्षा मन्त्रालय); तालिम प्रतिष्ठान (श्रम मन्त्रालय); औद्योगिक व्यवसाय विकास प्रतिष्ठान (उद्योग मन्त्रालय); स्थानीय समन्वयका लागि संघीय मामिला; बजेटका लागि प्रदेश/स्थानीय।",
      coordinatingOfficeEn:
        "Joint programme management unit with single MIS for unemployment register and placements.",
      coordinatingOfficeNe: "रोजगारीविहीन दर्ता र प्लेसमेन्टका लागि एकै MIS सहित संयुक्त कार्यक्रम व्यवस्थापन एकाइ।",
      accountableRolesEn:
        "Quarterly public report: trained, placed, median wage, retention at 90 days.",
      accountableRolesNe:
        "त्रैमासिक सार्वजनिक प्रतिवेदन: तालिम, प्लेसमेन्ट, मध्यक ज्याला, ९० दिन टिकाइ।",
      timelineEn: "T+60 days: rebranded centres operational; Y1: digital standards rolled out nationally.",
      timelineNe: "T+६० दिन: नाम बदलेका केन्द्र सञ्चालन; Y१: डिजिटल मानक राष्ट्रव्यापी।",
      milestones: [
        {
          en: "MOUs with sector associations for hire-or-train pledges.",
          ne: "नियोजन वा तालिम प्रतिबद्धतासहित क्षेत्र संघसँग समझदारी।",
        },
        {
          en: "Open data: course completion vs placement by cohort.",
          ne: "खुला डेटा: कोहोर्ट अनुसार तालिम पूरा बनाम प्लेसमेन्ट।",
        },
        {
          en: "Mobile outreach for rural youth and women.",
          ne: "ग्रामीण युवा र महिलाका लागि मोबाइल आउटरीच।",
        },
      ],
      kpis: [
        {
          metricEn: "Placement rate within 6 months of training completion (%)",
          metricNe: "तालिम पूरा भएको ६ महिनाभित्र प्लेसमेन्ट दर (%)",
          howEn: "MIS follow-up surveys.",
          howNe: "MIS पछिको सर्वेक्षण।",
        },
        {
          metricEn: "Returnee reintegration cases closed / opened (quarterly)",
          metricNe: "फर्कने पुनःएकीकरण मुद्दा टुङ्गो/खुला (त्रैमासिक)",
          howEn: "Returnee desk ticketing.",
          howNe: "फर्कने डेस्क टिकटिङ।",
        },
      ],
      risks: [
        {
          en: "Budget unfunded mandate — centres hollow shells.",
          ne: "अवित्त पोषित जिम्मा — केन्द्र खोलो खाली।",
        },
        {
          en: "Training supply without employer demand — certificate mills.",
          ne: "माग बिना तालिम आपूर्ति — प्रमाणपत्र मिल।",
        },
      ],
      escalation: [
        {
          en: "Trade unions and employers jointly audit placement claims.",
          ne: "ट्रेड युनियन र रोजगारदाताले प्लेसमेन्ट दाबी संयुक्त लेखापरीक्षा।",
        },
        {
          en: "Share this point so centres deliver jobs not paper (#point-59).",
          ne: "केन्द्रले कागज होइन जागिर देओस् भने साझेदारी गर्नुहोस् (#बुँदा-५९)।",
        },
      ],
      programStatusEn: "🟡 At risk — 60-day employment/skill/entrepreneurship centre transformation not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ६० दिन रोजगार/सीप/उद्यम केन्द्र रूपान्तरण यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p60",
    pointNumber: 60,
    category: "Economy & Development",
    promise:
      "To strengthen economic stability, the investment climate, and restore private-sector trust, approve the Private Sector Protection and Promotion Strategy (PSPP) and implement it immediately. Through that strategy, immediately implement measures on physical security and asset protection, economic recovery, regulatory simplification, investment promotion, and youth entrepreneurship.",
    promiseNe:
      "देशको आर्थिक स्थायित्व, लगानी वातावरण सुदृढीकरण तथा निजी क्षेत्रको विश्वास पुनर्स्थापना गर्ने उद्देश्यले «निजी क्षेत्र संरक्षण एवं प्रवर्द्धन रणनीति (Private Sector Protection and Promotion Strategy — PSPP)» स्वीकृत गरी तत्काल कार्यान्वयन गर्ने। सो रणनीति मार्फत भौतिक सुरक्षा तथा सम्पत्ति संरक्षण, आर्थिक पुनरुत्थान तथा नियामकीय सरलीकरण र लगानी प्रवर्द्धन तथा युवा उद्यमशीलता सम्बन्धी कार्यनीतिहरू तत्काल कार्यान्वयन गर्ने।",
    question:
      "What measurable targets define “confidence restored,” which ministries report monthly on PSPP work streams, and how do SMEs access dispute resolution under the strategy?",
    questionNe:
      "«विश्वास पुनर्स्थापित» कुन मापयोग लक्ष्यले, कुन मन्त्रालय मासिक प्रतिवेदन गर्छ, र SME ले रणनीतिमुनि विवाद समाधान कसरी पाउँछ?",
    whyThisMatters:
      "PSPP is both security and sentiment—if firms still self-insure with private guards only, policy has not landed.",
    whyThisMattersNe:
      "PSPP सुरक्षा र मनोवृत्ति दुवै — फर्म अझै निजी गार्ड मात्र भरिए कार्यान्वयन ओर्लेन।",
    possiblePathItems: [
      "Incident reporting hotline with published response times",
      "Insurance premium trends as a confidence proxy",
      "Regulatory burden survey baseline vs quarterly",
      "Youth startup fund rules with anti-crony safeguards",
    ],
    possiblePathItemsNe: [
      "सार्वजनिक प्रतिक्रिया समयसहित घटना हटलाइन",
      "विश्वास प्रोक्सीका रूपमा बीमा प्रिमियम प्रवृत्ति",
      "नियामक भार सर्वेक्षण आधाररेखा र त्रैमासिक",
      "क्रोनी विरोधी सुरक्षासहित युवा स्टार्टअप कोष नियम",
    ],
    systemInsight:
      "Strategies titled “protection” need chapter-and-verse on lawful protest rights—otherwise they read as shielding incumbents.",
    systemInsightNe:
      "«संरक्षण» रणनीतिमा कानुनी विरोध अधिकार स्पष्ट नभए स्थापित वर्ग जोगाउने जस्तो देखिन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ६० (PSPP strategy implementation; scan Page 12)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ६० (PSPP रणनीति कार्यान्वयन; स्क्यान पृष्ठ १२)",
    sourceExcerpt:
      "From scan (Page 12, छ): approve PSPP, implement immediately — economic stability, investment climate, private-sector trust; physical security, asset protection, economic recovery, regulatory simplification, investment promotion, youth entrepreneurship.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १२ (छ): PSPP स्वीकृत र तत्काल कार्यान्वयन — आर्थिक स्थायित्व, लगानी वातावरण, निजी क्षेत्रको विश्वास; भौतिक सुरक्षा, सम्पत्ति, पुनरुत्थान, नियामकीय सरलीकरण, लगानी प्रवर्द्धन, युवा उद्यमशीलता।",
    layer1: {
      hookEmoji: "🛡️",
      hook: "PSPP — protection and promotion of the private sector; immediate work streams across security and rules.",
      hookNe: "PSPP — निजी क्षेत्र संरक्षण र प्रवर्द्धन; सुरक्षा र नियममा तत्काल कार्यधारा।",
      stakeLine: "A strategy binder is not implementation — name owners, budgets, and first-quarter KPI baselines.",
      stakeLineNe: "रणनीति फाइल कार्यान्वयन होइन — मालिक, बजेट र पहिलो त्रैमासिक KPI आधाररेखा नाम गर्नुहोस्।",
      coreQuestionShort: "Monthly ministry scorecards; SME dispute resolution path; physical security tied to PSPP?",
      coreQuestionShortNe: "मासिक मन्त्रालय स्कोरकार्ड; SME विवाद समाधान मार्ग; PSPP सँग जोडिएको भौतिक सुरक्षा?",
      coreQuestion:
        "Which ministries own each PSPP stream monthly; how do SMEs access dispute resolution; how is physical security funding tied to measurable incident reduction?",
      coreQuestionNe:
        "प्रति धारा मासिक मालिक कुन मन्त्रालय; SME ले विवाद समाधान कसरी पाउँछ; घटना घटाउन मापयोग भौतिक सुरक्षा कोष कसरी जोडिन्छ?",
      quickScan: [
        {
          item: "Published PSPP implementation matrix: stream, owner, budget line, Q1 KPI baseline",
          itemNe: "प्रकाशित PSPP कार्यान्वयन मैट्रिक्स: धारा, मालिक, बजेट शीर्षक, Q१ KPI आधाररेखा",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "SME ombudsman or fast-track commercial dispute rules live",
          itemNe: "SME ओम्बुड्सम्यान वा छिटो व्यावसायिक विवाद नियम लाइभ",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Youth entrepreneurship window with anti-crony eligibility criteria published",
          itemNe: "क्रोनी विरोधी योग्यता मापदण्डसहित युवा उद्यम खिड्की प्रकाशित",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Regulatory simplification backlog cleared with dated sunset for redundant permits",
          itemNe: "अनावश्यक अनुमति सूर्यास्त मितिसहित नियामक सरलीकरण ब्याकलग खाली",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of the Prime Minister for PSPP coordination; MoHA for physical security streams; MoF for fiscal incentives; MoICS / IBN for investment promotion; MoLESS / MoEST for youth entrepreneurship links.",
      primaryOwnersNe:
        "PSPP समन्वयका लागि प्रधानमन्त्री कार्यालय; भौतिक सुरक्षाका लागि गृह मन्त्रालय; राजस्व प्रोत्साहनका लागि अर्थ मन्त्रालय; लगानी प्रवर्द्धनका लागि उद्योग/लगानी बोर्ड; युवा उद्यम जोडका लागि श्रम/शिक्षा।",
      coordinatingOfficeEn:
        "PSPP programme office with cross-ministry steering and public quarterly implementation review.",
      coordinatingOfficeNe: "मन्त्रालयबीच स्टियरिङ र त्रैमासिक सार्वजनिक कार्यान्वयन समीक्षासहित PSPP कार्यक्रम कार्यालय।",
      accountableRolesEn:
        "Monthly dashboard: investment pipeline, SME complaints resolved, security incidents by district.",
      accountableRolesNe:
        "मासिक ड्यासबोर्ड: लगानी पाइपलाइन, समाधान भए SME गुनासो, जिल्ला अनुसार सुरक्षा घटना।",
      timelineEn: "Immediate: work streams staffed; M3: first consolidated PSPP progress report; rolling legal harmonization.",
      timelineNe: "तत्काल: धारा कर्मचारी; M३: पहिलो एकीकृत PSPP प्रगति; निरन्तर कानुनी मिलान।",
      milestones: [
        {
          en: "Single SME grievance portal with SLA and appeal to independent panel.",
          ne: "SLA र स्वतन्त्र प्यानल अपिलसहित एकै SME गुनासो पोर्टल।",
        },
        {
          en: "Insurance and business interruption data linked to security KPIs.",
          ne: "सुरक्षा KPI सँग बीम र व्यवसाय अवरोध डेटा जोडिएको।",
        },
        {
          en: "Public chapter on lawful protest and property rights in PSPP annex.",
          ne: "PSPP परिशिष्टमा कानुनी प्रदर्शन र सम्पत्ति अधिकार सार्वजनिक अध्याय।",
        },
      ],
      kpis: [
        {
          metricEn: "PSPP stream completion rate vs quarterly plan (%)",
          metricNe: "त्रैमासिक योजना बनाम PSPP धारा पूरा दर (%)",
          howEn: "Steering committee self-report vs third-party spot check.",
          howNe: "स्टियरिङ आत्म प्रतिवेदन बनाम तेस्रो पक्ष नमूना जाँच।",
        },
        {
          metricEn: "Median days to resolve registered SME commercial disputes",
          metricNe: "दर्ता SME व्यावसायिक विवाद समाधान मध्यक दिन",
          howEn: "Case management system timestamps.",
          howNe: "मुद्दा व्यवस्थापन प्रणाली समय छाप।",
        },
      ],
      risks: [
        {
          en: "PSPP becomes a slogan — no budget lines or legislation.",
          ne: "PSPP नारा मात्र — बजेट शीर्षक वा विधेयक छैन।",
        },
        {
          en: "Security and deregulation streams conflict — unclear precedence.",
          ne: "सुरक्षा र नियामक खुकुलो धारा झगडा — प्राथमिकता अस्पष्ट।",
        },
      ],
      escalation: [
        {
          en: "FNCCI publishes sector confidence index tied to PSPP milestones.",
          ne: "PSPP कोसेङ्कसँग जोडिएको क्षेत्र विश्वास सूचकांक FNCCI ले।",
        },
        {
          en: "Share this point so PSPP gets numbers not speeches (#point-60).",
          ne: "PSPP लाई भाषण होइन अङ्क चाहिन्छ भने साझेदारी गर्नुहोस् (#बुँदा-६०)।",
        },
      ],
      programStatusEn: "🟡 At risk — PSPP immediate implementation streams not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — PSPP तत्काल कार्यान्वयन धारा यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p61",
    pointNumber: 61,
    category: "Economy & Development",
    promise:
      "Within 30 days the Ministry of Home Affairs shall develop the necessary structures and a rapid-response mechanism (द्रुत प्रतिकार्य संयन्त्र) to strengthen industrial and commercial security.",
    promiseNe:
      "गृह मन्त्रालयले औद्योगिक तथा व्यावसायिक सुरक्षा सुदृढीकरणका लागि आवश्यक संरचना तथा द्रुत प्रतिकार्य संयन्त्र ३० दिनभित्र विकास गर्ने।",
    question:
      "What triggers deployment, how are false alarms distinguished from credible threats, and are factory owners informed within minutes of an incident?",
    questionNe:
      "के ले प्रयोग सुरु हुन्छ, झूटो अलार्म र वास्तविक खतरा कसरी छुट्याइन्छ, र घटनामा मिनेटभित्र उद्योग मालिकलाई सूचना जान्छ?",
    whyThisMatters:
      "Rapid response must not mean blanket crackdown—proportionality keeps both workers and investors safe.",
    whyThisMattersNe:
      "द्रुत प्रतिक्रिया भनेर एकै खाले कडाइ होइन — अनुपातले श्रमिक र लगानीकर्ता दुवै सुरक्षित।",
    possiblePathItems: [
      "24/7 joint police-industry duty desk numbers",
      "After-action reviews published for major incidents",
      "Training on lawful assembly vs criminal damage",
      "Insurance linkage for documented business interruption",
    ],
    possiblePathItemsNe: [
      "२४/७ प्रहरी-उद्योग संयुक्त ड्युटी हटलाइन",
      "ठूलो घटनापछि सार्वजनिक पुनरावलोकन",
      "कानुनी सभा बनाम आपराधिक क्षति तालिम",
      "कागजातीकृत व्यवसाय अवरोध बीमासँग जोड",
    ],
    systemInsight:
      "Security for business without accountability for excessive force trades one risk for another.",
    systemInsightNe:
      "जवाफदेहिता बिना व्यवसाय सुरक्षा अतिरेक बलले अर्को जोखिम किन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ६१ (MoHA: industrial/commercial security — द्रुत प्रतिकार्य संयन्त्र; scan Page 12)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ६१ (गृह: उद्योग सुरक्षा द्रुत प्रतिक्रिया; स्क्यान पृष्ठ १२)",
    sourceExcerpt:
      "From scan (Page 12, छ): MoHA within 30 days — structures and rapid-response mechanism (द्रुत प्रतिकार्य संयन्त्र) for stronger industrial and commercial security.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १२ (छ): गृह मन्त्रालय ३० दिन — औद्योगिक तथा व्यावसायिक सुरक्षा सुदृढीकरणका लागि संरचना र द्रुत प्रतिकार्य संयन्त्र।",
    layer1: {
      hookEmoji: "🚨",
      hook: "MoHA: 30 days to stand up structures and a rapid-response mechanism for industrial and commercial security.",
      hookNe: "गृह: ३० दिनमा औद्योगिक तथा व्यावसायिक सुरक्षाका लागि संरचना र द्रुत प्रतिकार्य संयन्त्र।",
      stakeLine: "Speed without rules of engagement invites overreach — publish triggers and after-action reviews.",
      stakeLineNe: "नियम बिना गति अतिक्रमणतिर — ट्रिगर र पछिको समीक्षा प्रकाशन गर्नुहोस्।",
      coreQuestionShort: "Deployment triggers; false-alarm vs credible threat; factory notified in minutes?",
      coreQuestionShortNe: "प्रयोग ट्रिगर; झूटो बनाम वास्तविक खतरा; मिनेटमा उद्योगलाई सूचना?",
      coreQuestion:
        "What exactly triggers rapid-response deployment; how are false alarms distinguished; are factory security contacts notified within minutes with published response-time SLAs?",
      coreQuestionNe:
        "द्रुत प्रतिकार्य के ले सुरु हुन्छ; झूटो अलार्म कसरी छुट्याइन्छ; प्रकाशित प्रतिक्रिया समय SLA सहित मिनेटभित्र उद्योग सूचित?",
      quickScan: [
        {
          item: "30-day deliverable: org chart, hotlines, and escalation ladder published",
          itemNe: "३० दिन उपलब्धि: संस्थापत्र, हटलाइन, र उक्साइ सीढी प्रकाशित",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Joint police–industry SOP: lawful assembly vs criminal damage",
          itemNe: "संयुक्त प्रहरी-उद्योग SOP: कानुनी सभा बनाम आपराधिक क्षति",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "After-action reviews for major incidents published within 14 days",
          itemNe: "ठूलो घटनाको पछिको समीक्षा १४ दिनभित्र प्रकाशित",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Independent human-rights spot checks on deployment patterns",
          itemNe: "प्रयोग ढाँचामा स्वतन्त्र मानव अधिकार नमूना जाँच",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Home Affairs; Nepal Police; provincial security coordination; district administration; industry associations for liaison desks.",
      primaryOwnersNe:
        "गृह मन्त्रालय; नेपाल प्रहरी; प्रदेश सुरक्षा समन्वय; जिल्ला प्रशासन; सम्पर्क डेस्कका लागि उद्योग संघ।",
      coordinatingOfficeEn:
        "MoHA rapid-response cell with 24/7 duty roster and GIS layer for industrial zones.",
      coordinatingOfficeNe: "औद्योगिक क्षेत्रका लागि GIS स्तरसहित गृह द्रुत प्रतिकार्य कोठा २४/७ ड्युटी।",
      accountableRolesEn:
        "Weekly public summary: deployments, arrests by charge type, injuries, property damage estimates.",
      accountableRolesNe:
        "हप्तामा सार्वजनिक सारांश: प्रयोग, अभियोग प्रकार अनुसार गिरफ्तार, चोट, सम्पत्ति क्षति अनुमान।",
      timelineEn: "T+30 days: structures and mechanism operational; T+90: full training rollout to priority districts.",
      timelineNe: "T+३० दिन: संरचना र संयन्त्र सञ्चालन; T+९०: प्राथमिक जिल्लामा पूर्ण तालिम।",
      milestones: [
        {
          en: "Memoranda with top 20 industrial corridors on contact trees.",
          ne: "शीर्ष २० औद्योगिक करिडोरसँग सम्पर्क रूख समझदारी।",
        },
        {
          en: "Body-worn camera pilot for riot-line units with retention policy.",
          ne: "दंगा लाइन युनिटमा बडी-क्याम पाइलट र राख्ने नीति।",
        },
        {
          en: "Insurance linkage pilot for documented business interruption.",
          ne: "कागजातीकृत व्यवसाय अवरोधका लागि बीम जोड पाइलट।",
        },
      ],
      kpis: [
        {
          metricEn: "Median police arrival time to industrial zone incidents (minutes)",
          metricNe: "औद्योगिक क्षेत्र घटनामा प्रहरी आगमन मध्यक समय (मिनेट)",
          howEn: "GPS dispatch logs vs industry timestamps.",
          howNe: "GPS प्रेषण लग उद्योग समय छापसँग।",
        },
        {
          metricEn: "Share of incidents with published after-action review (%)",
          metricNe: "पछिको समीक्षा प्रकाशित घटनाको हिस्सा (%)",
          howEn: "MoHA incident registry.",
          howNe: "गृह घटना दर्ता।",
        },
      ],
      risks: [
        {
          en: "Rapid response used as cover for political targeting.",
          ne: "राजनीतिक निशाना ढाक्न द्रुत प्रतिक्रियाको दुरुपयोग।",
        },
        {
          en: "Industry liaison one-way — no worker voice in safety planning.",
          ne: "उद्योग सम्पर्क एकतर्फी — सुरक्षा योजनामा श्रमिक आवाज छैन।",
        },
      ],
      escalation: [
        {
          en: "Human rights NGOs co-publish deployment transparency score.",
          ne: "मानव अधिकार NGO ले प्रयोग पारदर्शिता अङ्क सँगै।",
        },
        {
          en: "Share this point so rapid response stays lawful (#point-61).",
          ne: "द्रुत प्रतिक्रिया कानुनी रहोस् भने साझेदारी गर्नुहोस् (#बुँदा-६१)।",
        },
      ],
      programStatusEn: "🟡 At risk — 30-day MoHA industrial/commercial rapid-response mechanism not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ३० दिन गृह औद्योगिक/व्यावसायिक द्रुत प्रतिकार्य यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p62",
    pointNumber: 62,
    category: "Economy & Development",
    promise:
      "Security agencies shall immediately advance strict legal processes against persons involved in damage to, looting of, or attacks on private property.",
    promiseNe:
      "सुरक्षा निकायहरूले निजी सम्पत्तिमा भएको क्षति, लुटपाट तथा आक्रमणमा संलग्न व्यक्तिहरूमाथि कडाइका साथ कानुनी कारबाही प्रक्रिया तत्काल अगाडि बढाउने।",
    question:
      "How are peaceful protests distinguished from property crimes in operational guidance, and what independent oversight reviews arrest patterns?",
    questionNe:
      "सञ्चालन निर्देशनमा शान्तिपूर्ण प्रदर्शन र सम्पत्ति अपराध कसरी छुट्याइन्छ, र गिरफ्तार ढाँचाको स्वतन्त्र निगरानी के?",
    whyThisMatters:
      "Property rights and protest rights can coexist only if enforcement rules are explicit and public.",
    whyThisMattersNe:
      "सम्पत्ति र प्रदर्शन अधिकार सँगै हुन्छ जब कार्यान्वयन नियम स्पष्ट र सार्वजनिक।",
    possiblePathItems: [
      "Body-worn camera rollout for riot-line units",
      "Victim compensation fund with fast-track claims",
      "Prosecution statistics disaggregated by charge type",
      "Human rights commission spot audits",
    ],
    possiblePathItemsNe: [
      "दंगा लाइन युनिटमा बडी-क्याम विस्तार",
      "छिटो दाबीसहित पीडित क्षतिपूर्ति कोष",
      "अभियोग प्रकारअनुसार छुट्टाछुट्टै अभियोजन तथ्याङ्क",
      "मानव अधिकार आयोग नमूना अनुगमन",
    ],
    systemInsight:
      "“Strict action” slogans invite selective enforcement unless charging standards are written down.",
    systemInsightNe:
      "«कडा कारबाही» नारा लेखित मानक बिना छनोटी कार्यान्वयनतिर आकर्षित गर्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ६२ (strict action on attacks on private property; scan Page 12)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ६२ (निजी सम्पत्ति आक्रमण कडा कारबाही; स्क्यान पृष्ठ १२)",
    sourceExcerpt:
      "From scan (Page 12, छ): security agencies immediately advance strict legal action over damage, looting, or attacks on private property.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १२ (छ): निजी सम्पत्तिमा क्षति, लुटपाट, आक्रमण — कडाइका साथ कानुनी कारबाही प्रक्रिया तत्काल अगाडि बढाउने।",
    layer1: {
      hookEmoji: "⚖️",
      hook: "Strict legal process for damage, looting, or attacks on private property — security agencies to advance cases immediately.",
      hookNe: "निजी सम्पत्तिमा क्षति, लुट, आक्रमण — सुरक्षा निकायले तत्काल कानुनी प्रक्रिया अगाडि बढाउने।",
      stakeLine: "Property protection must not erase the line between protest and crime — publish charging guidance.",
      stakeLineNe: "सम्पत्ति संरक्षणले प्रदर्शन र अपराधको रेखा मेटाउनु हुँदैन — अभियोग निर्देशन प्रकाशन गर्नुहोस्।",
      coreQuestionShort: "Operational distinction: peaceful protest vs property crime; oversight of arrest patterns?",
      coreQuestionShortNe: "सञ्चालन छुट्याउने: शान्त प्रदर्शन बनाम सम्पत्ति अपराध; गिरफ्तार ढाँचाको निगरानी?",
      coreQuestion:
        "How does operational guidance distinguish peaceful assembly from property offences; what independent body reviews arrest and charge patterns for bias?",
      coreQuestionNe:
        "सञ्चालन निर्देशनले शान्त सभा र सम्पत्ति अपराध कसरी छुट्याउँछ; पक्षपातका लागि गिरफ्तार र अभियोग ढाँचा को स्वतन्त्र निकायले हेर्छ?",
      quickScan: [
        {
          item: "Published prosecution SOP: evidence chain, timelines, victim updates",
          itemNe: "प्रकाशित अभियोजन SOP: प्रमाण श्रृङ्खला, समयसीमा, पीडित अपडेट",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Charge-type statistics disaggregated monthly (damage, theft, arson, etc.)",
          itemNe: "अभियोग प्रकार अनुसार मासिक छुट्टाछुट्टै तथ्याङ्क",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Fast-track victim compensation fund rules and claim portal",
          itemNe: "छिटो पीडित क्षतिपूर्ति कोष नियम र दाबी पोर्टल",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "NHRC spot audits on riot-line conduct with public summaries",
          itemNe: "दंगा लाइन आचरणमा मानव अधिकार आयोग नमूना अनुगमन र सार्वजनिक सारांश",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Nepal Police; Office of the Attorney General; district courts; NHRC for oversight; MoHA for policy coherence.",
      primaryOwnersNe:
        "नेपाल प्रहरी; महान्यायाधिवक्ता कार्यालय; जिल्ला अदालत; निगरानीका लागि मानव अधिकार आयोग; नीति एकरूपताका लागि गृह।",
      coordinatingOfficeEn:
        "Inter-agency task force on property crimes during unrest with single case registry.",
      coordinatingOfficeNe: "अशान्तिका बेला सम्पत्ति अपराधका लागि मन्त्रालयबीच कार्यदल र एकै मुद्दा दर्ता।",
      accountableRolesEn:
        "Monthly public dashboard: cases filed, convictions, acquittals, average time to charge.",
      accountableRolesNe:
        "मासिक सार्वजनिक ड्यासबोर्ड: दायर, दोष ठहर, सफाइ, औसत अभियोग समय।",
      timelineEn: "Immediate: backlog triage; ongoing: quarterly bias review of charging patterns.",
      timelineNe: "तत्काल: ब्याकलग छनोट; निरन्तर: त्रैमासिक अभियोग ढाँचा पक्षपात समीक्षा।",
      milestones: [
        {
          en: "Written charging standards endorsed by AG and police leadership.",
          ne: "महान्यायाधिवक्ता र प्रहरी नेतृत्वद्वारा समर्थित लिखित अभियोग मानक।",
        },
        {
          en: "Video evidence retention policy aligned with privacy law.",
          ne: "गोपनीयता कानुनसँग मिलेको भिडियो प्रमाण राख्ने नीति।",
        },
        {
          en: "Restitution orders tracked to actual payout rates.",
          ne: "वास्तविक भुक्तानी दरसँग क्षतिपूर्ति आदेश ट्र्याक।",
        },
      ],
      kpis: [
        {
          metricEn: "Median days from incident to charge sheet for property crimes",
          metricNe: "सम्पत्ति अपराधमा घटनादेखि चार्जसिटसम्म मध्यक दिन",
          howEn: "Court and police case management linkage.",
          howNe: "अदालत र प्रहरी मुद्दा जोड।",
        },
        {
          metricEn: "Share of cases with body-worn or third-party video in file (%)",
          metricNe: "फाइलमा बडी-क्याम वा तेस्रो पक्ष भिडियो भएका मुद्दाको हिस्सा (%)",
          howEn: "Evidence inventory fields.",
          howNe: "प्रमाण सूची क्षेत्र।",
        },
      ],
      risks: [
        {
          en: "Selective enforcement — loud firms protected, others ignored.",
          ne: "छनोटी कार्यान्वयन — चर्को फर्म सुरक्षित, अरू उपेक्षित।",
        },
        {
          en: "Chilling lawful protest through over-broad property charges.",
          ne: "फराकिलो सम्पत्ति अभियोगले कानुनी प्रदर्शन चिसो पार्ने।",
        },
      ],
      escalation: [
        {
          en: "Bar association publishes trial observation notes on property cases.",
          ne: "वकालत संघले सम्पत्ति मुद्दा अवलोकन नोट।",
        },
        {
          en: "Share this point so enforcement stays fair (#point-62).",
          ne: "कार्यान्वयन निष्पक्ष रहोस् भने साझेदारी गर्नुहोस् (#बुँदा-६२)।",
        },
      ],
      programStatusEn: "🟡 At risk — strict legal process on attacks on private property not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — निजी सम्पत्ति आक्रमण कडा कानुनी प्रक्रिया यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p63",
    pointNumber: 63,
    category: "Economy & Development",
    promise:
      "The Ministry of Finance and Nepal Rastra Bank shall issue concession and rehabilitation packages for enterprises affected during the Gen Z people’s movement and related civic movements.",
    promiseNe:
      "अर्थ मन्त्रालय तथा नेपाल राष्ट्र बैंकले जेन-जी जनआन्दोलनका क्रममा प्रभावित व्यवसायहरूका लागि सहुलियत तथा पुनःस्थापना प्याकेज जारी गर्ने।",
    question:
      "What objective criteria define eligibility and loss amounts, how long do applications stay open, and are packages audited to prevent political favoritism?",
    questionNe:
      "योग्यता र क्षति रकम वस्तुनिष्ट मापदण्ड के, आवेदन कति समय खुला, र राजनीतिक पक्षपात रोक्न प्याकेज लेखापरीक्षण हुन्छ?",
    whyThisMatters:
      "Relief after unrest is legitimate only if rules are blind to brand and loudness on social media.",
    whyThisMattersNe:
      "अशान्तिपछि राहत नियम सामाजिक सञ्जालको चर्को आवाज र ब्रान्डभन्दा अन्धो भए मात्र वैध।",
    possiblePathItems: [
      "Third-party loss verification for claims above threshold",
      "Published ceiling per firm and sector caps",
      "Sunset date for applications with reasons",
      "Gender- and MSME-weighted fairness review",
    ],
    possiblePathItemsNe: [
      "थ्रेसहोल्ड माथि दाबी तेस्रो पक्ष प्रमाणीकरण",
      "फर्म प्रति छत र क्षेत्र कोटा प्रकाशन",
      "कारणसहित आवेदन अन्त्य मिति",
      "लिङ्ग र MSME निष्पक्षता समीक्षा",
    ],
    systemInsight:
      "Blanket loan holidays distort credit culture—pair relief with restructuring data and survival tests.",
    systemInsightNe:
      "व्यापक ऋण छुट क्रेडिट संस्कृति बिगार्छ — पुनर्संरचना डेटा र टिकाउ परीक्षासँग जोड्नुहोस्।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ६३ (सहुलियत तथा पुनःस्थापना packages — Gen Z movement; scan Page 12)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ६३ (जेन-जी जनआन्दोलन प्रभावित व्यवसाय — सहुलियत/पुनःस्थापना; स्क्यान पृष्ठ १२)",
    sourceExcerpt:
      "From scan (Page 12, छ): MoF and NRB issue सहुलियत तथा पुनःस्थापना packages for businesses affected during the Gen Z people’s movement.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १२ (छ): जेन-जी जनआन्दोलन प्रभावित व्यवसाय — अर्थ मन्त्रालय र नेपाल राष्ट्र बैंकबाट सहुलियत तथा पुनःस्थापना प्याकेज।",
    layer1: {
      hookEmoji: "💼",
      hook: "MoF + NRB: concession and rehabilitation packages for enterprises hit during the Gen Z people’s movement.",
      hookNe: "अर्थ + राष्ट्र बैंक: जेन-जी जनआन्दोलन प्रभावित व्यवसायका लागि सहुलियत र पुनःस्थापना प्याकेज।",
      stakeLine: "Relief must be rule-based — loud brands and political ties cannot queue-jump verifiable loss.",
      stakeLineNe: "राहत नियममा आधारित — चर्को ब्रान्ड र राजनीतिक जोड प्रमाणित क्षतिमा लाइन काट्न पाउँदैन।",
      coreQuestionShort: "Eligibility criteria; loss verification; application window; audit against favoritism?",
      coreQuestionShortNe: "योग्यता मापदण्ड; क्षति प्रमाणीकरण; आवेदन खुला अवधि; पक्षपात विरुद्ध लेखापरीक्षण?",
      coreQuestion:
        "What objective criteria and third-party verification apply; how long are applications open; are packages audited and published to prevent political favoritism?",
      coreQuestionNe:
        "वस्तुनिष्ट मापदण्ड र तेस्रो पक्ष प्रमाणीकरण के; आवेदन कति खुला; पक्षपात रोक्न प्याकेज लेखापरीक्षण र प्रकाशित?",
      quickScan: [
        {
          item: "Published circular: eligible events, sectors, caps, and sunset date",
          itemNe: "प्रकाशित परिपत्र: योग्य घटना, क्षेत्र, छत, सूर्यास्त मिति",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Third-party loss verification above threshold with appeal window",
          itemNe: "थ्रेसहोल्ड माथि तेस्रो पक्ष क्षति प्रमाणीकरण र पुनरावेदन खुला",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "NRB prudential treatment for restructured loans disclosed",
          itemNe: "पुनर्संरचित ऋणका लागि राष्ट्र बैंक प्रुडेन्सियल व्यवहार खुलाइएको",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Gender- and MSME-weighted fairness review of approved grants",
          itemNe: "स्वीकृत अनुदानको लिङ्ग र MSME तौलन निष्पक्षता समीक्षा",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Finance; Nepal Rastra Bank; Inland Revenue Department; banking supervision; anti-money laundering unit for integrity checks.",
      primaryOwnersNe:
        "अर्थ मन्त्रालय; नेपाल राष्ट्र बैंक; आन्तरिक राजस्व विभाग; बैंकिङ पर्यवेक्षण; अखण्डताका लागि धन शुद्धीकरण एकाइ।",
      coordinatingOfficeEn:
        "Joint MoF–NRB implementation cell with single application portal and fraud analytics.",
      coordinatingOfficeNe: "एकै आवेदन पोर्टल र ठगी विश्लेषणसहित अर्थ-राष्ट्र बैंक संयुक्त कार्यान्वयन कोठा।",
      accountableRolesEn:
        "Quarterly public report: applications received, approved, rejected with anonymized reasons.",
      accountableRolesNe:
        "त्रैमासिक सार्वजनिक प्रतिवेदन: आवेदन, स्वीकृत, अस्वीकृत गुमनाम कारणसहित।",
      timelineEn: "Package issuance T+30 from cabinet nod; rolling application window with published sunset.",
      timelineNe: "मन्त्रिपरिषद् स्वीकृतिपछि T+३० प्याकेज जारी; सूर्यास्त मितिसहित खुल्ला आवेदन।",
      milestones: [
        {
          en: "Standardized damage affidavit with bank and insurer attestation options.",
          ne: "बैंक र बीम प्रमाणन विकल्पसहित मानक क्षति शपथपत्र।",
        },
        {
          en: "Random field audits on high-value claims.",
          ne: "उच्च मूल्य दाबीमा नमूना स्थल लेखापरीक्षा।",
        },
        {
          en: "Post-relief credit health monitoring to avoid NPL spikes.",
          ne: "NPL उछाल रोक्न राहतपछि ऋण स्वास्थ्य निगरानी।",
        },
      ],
      kpis: [
        {
          metricEn: "Median days from application to first disbursement",
          metricNe: "आवेदनदेखि पहिलो भुक्तानीसम्म मध्यक दिन",
          howEn: "Portal workflow timestamps.",
          howNe: "पोर्टल कार्यप्रवाह समय छाप।",
        },
        {
          metricEn: "Share of audited claims with material adjustment (%)",
          metricNe: "लेखापरीक्षित दाबीमा महत्त्वपूर्ण समायोजन (%)",
          howEn: "Audit sampling reports.",
          howNe: "लेखापरीक्षा नमूना प्रतिवेदन।",
        },
      ],
      risks: [
        {
          en: "Blanket forbearance weakens bank balance sheets.",
          ne: "व्यापक छुट बैंक ब्यालेन्स शीट कमजोर पार्छ।",
        },
        {
          en: "Political interference in claim approval.",
          ne: "दाबी स्वीकृतिमा राजनीतिक हस्तक्षेप।",
        },
      ],
      escalation: [
        {
          en: "CIAA or parliamentary committee spot-check on high-value approvals.",
          ne: "उच्च मूल्य स्वीकृतिमा अख्तियार वा संसदीय समिति नमूना जाँच।",
        },
        {
          en: "Share this point so relief stays fair (#point-63).",
          ne: "राहत निष्पक्ष रहोस् भने साझेदारी गर्नुहोस् (#बुँदा-६३)।",
        },
      ],
      programStatusEn: "🟡 At risk — MoF/NRB Gen Z–affected enterprise packages not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — जेन-जी प्रभावित व्यवसाय अर्थ/राष्ट्र बैंक प्याकेज यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p64",
    pointNumber: 64,
    category: "Governance & Implementation",
    promise:
      "Immediately establish a PM Delivery Unit (प्रधानमन्त्री कार्यसम्पादन एकाइ) under the Office of the Prime Minister and Council of Ministers to integrate and make effective, results-oriented systems for investment, production, export, productivity, and development finance. The unit shall operate a central dashboard with key performance indicators (KPIs) for nationally prioritized projects, ministry-level performance rankings, and a problem and obstacle resolution mechanism.",
    promiseNe:
      "देशको लगानी, उत्पादन, निर्यात, उत्पादकत्व तथा विकास वित्त प्रणालीलाई एकीकृत, प्रभावकारी तथा परिणाममुखी बनाउने उद्देश्यले प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय अन्तर्गत «प्रधानमन्त्री कार्यसम्पादन एकाइ (PM Delivery Unit)» तत्काल स्थापना गर्ने। उक्त एकाइले राष्ट्रिय प्राथमिकता प्राप्त परियोजनाहरूका लागि मुख्य कार्यसम्पादन सूचक (KPI), मन्त्रालयगत कार्यसम्पादन र्याकिङ, समस्या तथा अवरोध समाधान संयन्त्र सहितको केन्द्रीय ड्यासबोर्ड सञ्चालन गर्ने।",
    question:
      "Which KPIs are binding on ministries, who can override red ratings, and how often are dashboard data independently audited?",
    questionNe:
      "कुन KPI मन्त्रालयका लागि बाध्यात्मक, रातो मूल्याङ्कन कोले उल्ट्याउन पाउँछ, र ड्यासबोर्ड डेटा कति पटक स्वतन्त्र लेखापरीक्षण हुन्छ?",
    whyThisMatters:
      "Delivery units work when they can stop funding to chronic laggards—otherwise they are a slide deck above the org chart.",
    whyThisMattersNe:
      "डेलिभरी युनिट तब काम गर्छ जब निरन्तर पछाडिको बजेट रोक्न सक्छ — नत्र संस्थापत्र माथि स्लाइड मात्र।",
    possiblePathItems: [
      "Public API for KPI definitions and raw inputs",
      "Monthly PM-chaired review with published minutes",
      "Cross-ministry data stewards with named owners",
      "Ethics wall between unit and party-political staff",
    ],
    possiblePathItemsNe: [
      "KPI परिभाषा र कच्चा इनपुटका लागि सार्वजनिक API",
      "मासिक प्रधानमन्त्री अध्यक्षतामा समीक्षा र मिनेट प्रकाशन",
      "नामित मालिकसहित मन्त्रालयबीच डेटा स्टिवार्ड",
      "युनिट र दलिय कर्मचारीबीच नैतिक पर्खाल",
    ],
    systemInsight:
      "Dashboards without contested data pipelines become propaganda—publish the ETL lineage.",
    systemInsightNe:
      "विवादित डेटा पाइपलाइन बिना ड्यासबोर्ड प्रचार बन्छ — ETL वंश प्रकाशन गर्नुहोस्।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ६४ (PM Delivery Unit — productivity, KPIs, rankings, dashboard; scan Page 12)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ६४ (प्रधानमन्त्री कार्यसम्पादन एकाइ; उत्पादकत्व, KPI, र्याकिङ; स्क्यान पृष्ठ १२)",
    sourceExcerpt:
      "From scan (Page 12, छ): PM Delivery Unit under OPMCM — investment, production, export, productivity, development finance integrated and results-oriented; KPIs, ministry rankings, obstacle-resolution mechanism; central dashboard.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १२ (छ): प्रधानमन्त्री कार्यसम्पादन एकाइ — लगानी, उत्पादन, निर्यात, उत्पादकत्व, विकास वित्त; KPI, मन्त्रालयगत र्याकिङ, अवरोध समाधान; केन्द्रीय ड्यासबोर्ड।",
    layer1: {
      hookEmoji: "📊",
      hook: "PM Delivery Unit under OPMCM — KPIs, ministry rankings, central dashboard, obstacle resolution for national priorities.",
      hookNe: "प्रधानमन्त्री कार्यसम्पादन एकाइ — राष्ट्रिय प्राथमिकताका लागि KPI, मन्त्रालय र्याकिङ, केन्द्रीय ड्यासबोर्ड, अवरोध समाधान।",
      stakeLine: "Dashboards need teeth — who can override a red rating without a written reason in the log?",
      stakeLineNe: "ड्यासबोर्डलाई दाँत चाहिन्छ — रातो मूल्याङ्कन लगमा लिखित कारण बिना कोले उल्ट्याउन पाउँछ?",
      coreQuestionShort: "Binding KPIs; override rules; independent audit frequency for dashboard data?",
      coreQuestionShortNe: "बाध्य KPI; उल्ट्याउने नियम; ड्यासबोर्ड डेटाको स्वतन्त्र लेखापरीक्षण पटक?",
      coreQuestion:
        "Which KPIs are contractually binding on ministries; what governance log records overrides; how often is dashboard data independently audited and lineage published?",
      coreQuestionNe:
        "कुन KPI मन्त्रालयका लागि बाध्यात्मक; उल्ट्याउने शासन लगमा के दर्ता; ड्यासबोर्ड डेटा कति पटक स्वतन्त्र लेखापरीक्षण र वंश प्रकाशित?",
      quickScan: [
        {
          item: "Published KPI dictionary with data owners and update cadence",
          itemNe: "डेटा मालिक र अपडेट तालसहित प्रकाशित KPI शब्दकोश",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Public API or export for raw KPI inputs (with redaction policy)",
          itemNe: "कच्चा KPI इनपुटका लागि सार्वजनिक API वा निर्यात (रेड्याक्शन नीति)",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Monthly PM-chaired review minutes and obstacle ticket closure rates",
          itemNe: "मासिक प्रधानमन्त्री अध्यक्षतामा मिनेट र अवरोध टिकट बन्द दर",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Ethics wall documented between unit staff and party-political roles",
          itemNe: "एकाइ कर्मचारी र दलिय भूमिकाबीच नैतिक पर्खाल कागजातीकृत",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of the Prime Minister and Council of Ministers; PM Delivery Unit head; National Planning Commission for KPI alignment; line ministries for data feeds.",
      primaryOwnersNe:
        "प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय; प्रधानमन्त्री कार्यसम्पादन एकाइ प्रमुख; KPI मिलानका लागि राष्ट्रिय योजना आयोग; डेटाका लागि मन्त्रालय।",
      coordinatingOfficeEn:
        "Delivery unit with chief data officer role and cross-ministry data-sharing agreements.",
      coordinatingOfficeNe: "मुख्य डेटा अधिकारी भूमिका र मन्त्रालयबीच डेटा साझेदारी समझदारीसहित एकाइ।",
      accountableRolesEn:
        "Fortnightly obstacle stand-up; red-rated projects escalated to PM agenda with owner and deadline.",
      accountableRolesNe:
        "पखेत्रे अवरोध स्ट्यान्ड-अप; रातो परियोजना मालिक र म्यादसहित प्रधानमन्त्री एजेन्डामा।",
      timelineEn: "Immediate: unit staffed; M1: dashboard beta; M3: full ministry coverage; annual independent audit.",
      timelineNe: "तत्काल: एकाइ कर्मचारी; M१: ड्यासबोर्ड बिटा; M३: पूर्ण मन्त्रालय; वार्षिक स्वतन्त्र लेखापरीक्षा।",
      milestones: [
        {
          en: "ETL lineage documentation for each KPI on the public methodology page.",
          ne: "सार्वजनिक कार्यविधि पृष्ठमा प्रति KPI ETL वंश कागजात।",
        },
        {
          en: "Sanctions linkage — chronic red ratings trigger funding review.",
          ne: "प्रतिबन्ध जोड — निरन्तर रातो कोष समीक्षा ट्रिगर।",
        },
        {
          en: "Citizen-readable export and FOI channel for raw dispute data.",
          ne: "कच्चा विवाद डेटाका लागि नागरिक पढ्न मिल्ने निर्यात र सूचना खुला।",
        },
      ],
      kpis: [
        {
          metricEn: "Median days to close escalated obstacle tickets",
          metricNe: "उक्साइ अवरोध टिकट बन्द मध्यक दिन",
          howEn: "Ticketing system vs dashboard promise dates.",
          howNe: "टिकटिङ प्रणाली बनाम ड्यासबोर्ड वाचा मिति।",
        },
        {
          metricEn: "Share of KPI fields passing independent audit (%)",
          metricNe: "स्वतन्त्र लेखापरीक्षा पास KPI क्षेत्र (%)",
          howEn: "Annual audit report appendix.",
          howNe: "वार्षिक लेखापरीक्षा परिशिष्ट।",
        },
      ],
      risks: [
        {
          en: "Dashboard as propaganda — contested numbers, no lineage.",
          ne: "प्रचार ड्यासबोर्ड — विवादित अङ्क, वंश छैन।",
        },
        {
          en: "Unit captured by political staff — rankings lose credibility.",
          ne: "दलिय कर्मचारीले कब्जा — र्याकिङ विश्वास गुमाउँछ।",
        },
      ],
      escalation: [
        {
          en: "FNCCI and unions joint letter when KPI disputes stay unresolved 60+ days.",
          ne: "KPI विवाद ६०+ दिन अनिर्णित भए FNCCI र युनियन संयुक्त पत्र।",
        },
        {
          en: "Share this point so delivery is measured not marketed (#point-64).",
          ne: "डेलिभरी मापिन्छ बजार हुँदैन भने साझेदारी गर्नुहोस् (#बुँदा-६४)।",
        },
      ],
      programStatusEn: "🟡 At risk — PM Delivery Unit KPI dashboard and obstacle mechanism not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — प्रधानमन्त्री कार्यसम्पादन एकाइ KPI ड्यासबोर्ड र अवरोध संयन्त्र यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p65",
    pointNumber: 65,
    category: "Economy & Development",
    promise:
      "Within 30 days, immediately form a task force to conduct a detailed Organization and Management survey for an integrated structure to end duplication of responsibilities among Investment Board Nepal, the Trade and Export Promotion Centre (व्यापार तथा निकासी प्रवर्द्धन केन्द्र), the Department of Industry, and related bodies. The task force shall submit a report with a clear roadmap, functional structure, and necessary legal provisions to transform—in an integrated manner—investment promotion, export expansion and promotion, industry development, project structures, and development finance work into a Single Point Service System. On the basis of that report, immediately advance the necessary institutional and legal reform processes.",
    promiseNe:
      "लगानी बोर्ड नेपाल, व्यापार तथा निकासी प्रवर्द्धन केन्द्र, उद्योग विभाग लगायतका निकायहरूबीच रहेको कार्यजिम्मेवारीको दोहोरोपन अन्त्य गर्न ३० दिनभित्र एकीकृत संरचनाको विस्तृत सङ्गठन तथा व्यवस्थापन सर्भेका लागि तत्काल एक कार्यदल गठन गर्ने। उक्त कार्यदलले लगानी प्रवर्द्धन, निर्यात विस्तार तथा प्रवर्द्धन, उद्योग विकास, परियोजना संरचना तथा विकास वित्त सम्बन्धी कार्यहरूलाई एकीकृत रूपमा एकल बिन्दू सेवा प्रणालीमा रूपान्तरण गर्न स्पष्ट रोडम्याप, कार्यात्मक संरचना तथा आवश्यक कानुनी व्यवस्था सहितको प्रतिवेदन पेश गर्ने। सो प्रतिवेदनका आधारमा आवश्यक संस्थागत तथा कानुनी सुधार प्रक्रिया तत्काल अगाडि बढाउने।",
    question:
      "Which statutory amendments are prerequisite before go-live, how are staff transfers negotiated, and what single entry URL will investors use on day one?",
    questionNe:
      "गो-लाइभ अघि कुन ऐन संशोधन अनिवार्य, कर्मचारी सरुवा कसरी मोलिन्छ, र पहिलो दिन लगानीकर्ताले कुन एक प्रविष्टि URL प्रयोग गर्छ?",
    whyThisMatters:
      "Single window fails when three agencies still keep separate registries—merge data before merging logos.",
    whyThisMattersNe:
      "तीन निकाय अझै छुट्टै दर्ता राख्छ भने एकल खिड्की असफल — लोगो अघि डेटा मर्ज गर्नुहोस्।",
    possiblePathItems: [
      "Duplication matrix with owner and sunset date per function",
      "Change-management budget for redundant roles",
      "Investor testing before public launch",
      "Legislative calendar tied to roadmap milestones",
    ],
    possiblePathItemsNe: [
      "प्रति कार्य मालिक र सूर्यास्त मितिसहित दोहोरोपण मैट्रिक्स",
      "अनावश्यक भूमिकाका लागि परिवर्तन व्यवस्थापन बजेट",
      "सार्वजनिक सुरुवात अघि लगानीकर्ता परीक्षण",
      "कोसेङ्कसँग जोडिएको विधायी पात्रो",
    ],
    systemInsight:
      "Task forces buy time; only hard merges of IT systems buy single window.",
    systemInsightNe:
      "कार्यदल समय किन्छ; IT कडा मर्ज मात्र एकल खिड्की किन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ६५ (O&M survey task force; IBN / निकासी केन्द्र / Industry → Single Point Service; scan Page 12)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ६५ (O&M सर्भे कार्यदल; लगानी बोर्ड, निकासी प्रवर्द्धन केन्द्र, उद्योग विभाग; स्क्यान पृष्ठ १२)",
    sourceExcerpt:
      "From scan (Page 12, छ): 30 days — task force + O&M survey for integrated structure; IBN, व्यापार तथा निकासी प्रवर्द्धन केन्द्र, Industry, etc.; report with roadmap, functional structure, law → Single Point Service; then institutional/legal reform.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १२ (छ): ३० दिन — एकीकृत संरचनाको विस्तृत O&M सर्भे कार्यदल; लगानी बोर्ड, निकासी केन्द्र, उद्योग विभाग दोहोरोपन अन्त्य; रोडम्याप, कार्यात्मक संरचना, कानुनी व्यवस्थासहित प्रतिवेदन; एकल बिन्दू सेवा प्रणाली; प्रतिवेदनअनुसार सुधार अगाडि बढाउने।",
    layer1: {
      hookEmoji: "🪟",
      hook: "30 days: O&M survey task force — IBN, export promotion centre, Industry → one integrated Single Point Service roadmap.",
      hookNe: "३० दिन: O&M सर्भे कार्यदल — लगानी बोर्ड, निकासी केन्द्र, उद्योग विभाग → एकल बिन्दू सेवा रोडम्याप।",
      stakeLine: "Single window is a data merge before a logo merge — duplicate registries doom the reform.",
      stakeLineNe: "एकल खिड्की लोगो अघि डेटा मर्ज — दोहोरो दर्ताले सुधार बिगार्छ।",
      coreQuestionShort: "Statutory prerequisites; staff transfer plan; single investor URL on day one?",
      coreQuestionShortNe: "ऐन अग्र आवश्यकता; कर्मचारी सरुवा योजना; पहिलो दिन एक लगानी URL?",
      coreQuestion:
        "Which legal amendments are on the critical path; how will redundant roles and IT systems merge; what single entry URL and service catalogue will investors use on go-live day one?",
      coreQuestionNe:
        "कुन कानुनी संशोधन महत्वपूर्ण मार्गमा; अनावश्यक भूमिका र IT कसरी मर्ज; गो-लाइभ पहिलो दिन एक प्रविष्टि URL र सेवा सूची के?",
      quickScan: [
        {
          item: "30-day task force TOR: members, secretariat, stakeholder consult schedule",
          itemNe: "३० दिन कार्यदल TOR: सदस्य, सचिवालय, सरोकारवाला परामर्श तालिका",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Duplication matrix: function, current owner (IBN/TEPC/DoI), proposed single owner",
          itemNe: "दोहोरोपण मैट्रिक्स: कार्य, हाल मालिक (IBN/TEPC/DoI), प्रस्तावित एक मालिक",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Legislative calendar with bill titles tied to roadmap milestones",
          itemNe: "कोसेङ्कसँग जोडिएको विधेयक शीर्षकसहित विधायी पात्रो",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Change-management budget line for staff redeployment and IT merge",
          itemNe: "कर्मचारी पुनर्नियुक्ति र IT मर्जका लागि परिवर्तन व्यवस्थापन बजेट शीर्षक",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Investment Board Nepal; Trade and Export Promotion Centre; Department of Industry; MoICS; OPMCM for task force secretariat; MoLPA for legal drafting.",
      primaryOwnersNe:
        "लगानी बोर्ड नेपाल; व्यापार तथा निकासी प्रवर्द्धन केन्द्र; उद्योग विभाग; उद्योग मन्त्रालय; कार्यदल सचिवालयका लागि प्रधानमन्त्री कार्यालय; कानुनी मस्यौदाका लागि कानुन मन्त्रालय।",
      coordinatingOfficeEn:
        "Task force with weekly steering and investor association sandbox testing of proposed flows.",
      coordinatingOfficeNe: "हप्तामा स्टियरिङ र प्रस्तावित प्रवाहका लागि लगानीकर्ता संघ स्यान्डबक्स परीक्षणसहित कार्यदल।",
      accountableRolesEn:
        "Public interim report at T+30 with options analysis; final report with hard merge recommendation.",
      accountableRolesNe:
        "T+३० मा विकल्प विश्लेषणसहित अन्तरिम सार्वजनिक; अन्तिम प्रतिवेदन कडा मर्ज सिफारिससहित।",
      timelineEn: "T+30: task force report; T+90: draft bills; Y1: pilot single window in one priority sector.",
      timelineNe: "T+३०: कार्यदल प्रतिवेदन; T+९०: मस्यौदा विधेयक; Y१: एक प्राथमिक क्षेत्रमा पाइलट एकल खिड्की।",
      milestones: [
        {
          en: "Master data model for firm, investment, and export licences.",
          ne: "फर्म, लगानी र निर्यात अनुमति मास्टर डेटा मोडेल।",
        },
        {
          en: "Staff impact assessment with unions and civil service commission.",
          ne: "युनियन र लोक सेवा आयोगसहित कर्मचारी प्रभाव मूल्याङ्कन।",
        },
        {
          en: "Investor usability testing before parliamentary go-live commitment.",
          ne: "संसदीय गो-लाइभ प्रतिबद्धता अघि लगानीकर्ता प्रयोग्यता परीक्षण।",
        },
      ],
      kpis: [
        {
          metricEn: "Count of duplicate touchpoints removed per quarter",
          metricNe: "त्रैमासिक हटाइएको दोहोरो स्पर्श बिन्दु गणना",
          howEn: "Before/after process maps in report annex.",
          howNe: "प्रतिवेदन परिशिष्टमा अघि/पछि प्रक्रिया नक्सा।",
        },
        {
          metricEn: "Investor satisfaction score on pilot single window (1–5)",
          metricNe: "पाइलट एकल खिड्कीमा लगानीकर्ता सन्तुष्टि (१–५)",
          howEn: "Structured surveys post-transaction.",
          howNe: "लेनदेन पछि संरचित सर्वेक्षण।",
        },
      ],
      risks: [
        {
          en: "Task force report shelves — no legislative follow-through.",
          ne: "कार्यदल प्रतिवेदन ताकमा — विधायी पछिको कदम छैन।",
        },
        {
          en: "IT integration cost underestimated — pilot never scales.",
          ne: "IT एकीकरण लागत कम अनुमान — पाइलट कहिल्यै विस्तार हुँदैन।",
        },
      ],
      escalation: [
        {
          en: "Development partners publish independent integration readiness review.",
          ne: "विकास साझेदारले स्वतन्त्र एकीकरण तयारी समीक्षा।",
        },
        {
          en: "Share this point so one window means one door (#point-65).",
          ne: "एक खिड्की भनेको एक द्वार होस् भने साझेदारी गर्नुहोस् (#बुँदा-६५)।",
        },
      ],
      programStatusEn: "🟡 At risk — 30-day O&M task force toward Single Point Service not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — एकल बिन्दू सेवातर्फ ३० दिन O&M कार्यदल यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p66",
    pointNumber: 66,
    category: "Economy & Development",
    promise:
      "Make industry and business operations in Nepal simple, transparent, and broker-free; end dual practices in small-industry registration and, for enterprises with capital up to NPR 25 crores, provide that registration takes place only through integrated cottage and small industry offices; and within 45 days put in place arrangements to abolish registration fees.",
    promiseNe:
      "नेपालमा उद्योग तथा व्यवसाय सञ्चालनलाई सरल, पारदर्शी र बिचौलिया मुक्त बनाउन, साना उद्योग दर्ता प्रक्रियामा रहेको दोहोरो अभ्यास अन्त्य गरी २५ करोडसम्मका उद्योगहरूलाई एकीकृत रूपमा घरेलु तथा साना उद्योग कार्यालयमार्फत मात्र दर्ता हुने व्यवस्था गर्ने तथा दर्ता शुल्क खारेज गर्ने व्यवस्था ४५ दिनभित्र गर्ने।",
    question:
      "How is capital declared verified, what anti-evasion checks stop splitting firms to stay under the threshold, and are fee abolitions funded from budget lines that protect service quality?",
    questionNe:
      "पूँजी घोषणा कसरी प्रमाणित, थ्रेसहोल्डमुनि फर्म विभाजन रोक्न के जाँच, र शुल्क खारेज सेवा गुणस्तर जोगाउने बजेट शीर्षकबाट वित्त पोषित छ?",
    whyThisMatters:
      "Fee removal helps micro firms only if back-office capacity scales—otherwise queues replace receipts.",
    whyThisMattersNe:
      "शुल्क हटाउँदा पछाडिको क्षमता बढेन भने रसिदको ठाउँ लाइन बन्छ।",
    possiblePathItems: [
      "Digital capital attestation with bank reference option",
      "Random audits on clustered same-address registrations",
      "Service-level funding per registration completed",
      "Plain-language guide for cottage vs small industry routes",
    ],
    possiblePathItemsNe: [
      "बैंक सन्दर्भ विकल्पसहित डिजिटल पूँजी प्रमाणन",
      "एकै ठेगाना क्लस्टर दर्तामा नमूना जाँच",
      "पूरा दर्ता प्रति सेवा-स्तर कोष",
      "घरेलु बनाम साना उद्योग मार्ग सरल गाइड",
    ],
    systemInsight:
      "Twenty-five crore thresholds invite creative accounting—pair them with random field verification.",
    systemInsightNe:
      "२५ करोड थ्रेसहोल्ड सिर्जनात्मक लेखासँग जोडिन्छ — नमूना स्थल प्रमाणन जोड्नुहोस्।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ६६ (≤25 cr industry: single office registration; fees abolished; scan Pages 12–13)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ६६ (२५ करोडसम्म दर्ता सरलीकरण; शुल्क खारेज; स्क्यान १२–१३)",
    sourceExcerpt:
      "From scan (Pages 12–13, छ): broker-free, transparent; end dual small-industry registration; ≤25 crore via integrated cottage/small industry offices only; registration fee abolition arrangements in 45 days.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १२–१३ (छ): सरल, पारदर्शी, बिचौलिया मुक्त; साना उद्योग दर्ताको दोहोरो अभ्यास अन्त्य; २५ करोडसम्म — एकीकृत घरेलु तथा साना उद्योग कार्यालयमार्फत मात्र दर्ता; ४५ दिनमा दर्ता शुल्क खारेज व्यवस्था।",
    layer1: {
      hookEmoji: "🏭",
      hook: "≤25 cr firms: register only via integrated cottage/small industry offices; dual practice ended; registration fees gone in 45 days.",
      hookNe: "२५ करोडसम्म: एकीकृत घरेलु/साना कार्यालयबाट मात्र दर्ता; दोहोरो अभ्यास अन्त्य; ४५ दिनमा दर्ता शुल्क खारेज।",
      stakeLine: "Thresholds invite split firms — verify capital and audit same-address clusters.",
      stakeLineNe: "थ्रेसहोल्डले फर्म विभाजन आमन्त्रण — पूँजी प्रमाणित गर्नुहोस्, एउटै ठेगाना क्लस्टर लेखापरीक्षा।",
      coreQuestionShort: "Capital attestation; anti-splitting checks; fee abolition funded so service quality holds?",
      coreQuestionShortNe: "पूँजी प्रमाणन; विभाजन रोक; शुल्क हटाउँदा सेवा गुणस्तर जोगाउन बजेट?",
      coreQuestion:
        "How is declared capital verified against bank or audited statements; what stops related parties from splitting under the threshold; is registration fee removal backed by a budget line that preserves processing SLAs?",
      coreQuestionNe:
        "घोषित पूँजी बैंक वा लेखापरीक्षित विवरणसँग कसरी मिल्छ; थ्रेसहोल्डमुनि सम्बन्धित पक्ष विभाजन कसरी रोकिन्छ; शुल्क खारेज प्रक्रिया SLA जोगाउने बजेट शीर्षक छ?",
      quickScan: [
        {
          item: "45-day legal instrument: fee zero + single-route rule for ≤25 cr published",
          itemNe: "४५ दिन कानुनी: शुल्क शून्य + २५ करोडसम्म एक मार्ग नियम प्रकाशित",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Digital capital attestation workflow with random field verification sample",
          itemNe: "डिजिटल पूँजी प्रमाणन र नमूना स्थल जाँच कार्यप्रवाह",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Same-address / related-party cluster risk score in registrar MIS",
          itemNe: "दर्ता MIS मा एउटै ठेगाना/सम्बन्धित पक्ष क्लस्टर जोखिम अङ्क",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Service-level funding per completed registration (no fee ≠ no staff)",
          itemNe: "पूरा दर्ता प्रति सेवा-स्तर कोष (शुल्क छैन भनेर कर्मचारी छैन भन्न मिल्दैन)",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Department of Cottage and Small Industry; Department of Industry; Office of Company Registrar for alignment; MoF for fee policy and budget compensation.",
      primaryOwnersNe:
        "घरेलु तथा साना उद्योग विभाग; उद्योग विभाग; मिलानका लागि कम्पनी रजिष्ट्रार; शुल्क नीति र बजेटका लागि अर्थ मन्त्रालय।",
      coordinatingOfficeEn:
        "Single-window implementation office with weekly queue-time dashboards by district office.",
      coordinatingOfficeNe: "जिल्ला कार्यालय अनुसार हप्तामा लाइन समय ड्यासबोर्डसहित एकल खिड्की कार्यान्वयन कार्यालय।",
      accountableRolesEn:
        "Monthly public stats: registrations by route, median days, split-firm audit count.",
      accountableRolesNe:
        "मासिक सार्वजनिक तथ्याङ्क: मार्ग अनुसार दर्ता, मध्यक दिन, विभाजन लेखापरीक्षा गणना।",
      timelineEn: "T+45 days: fee abolition and routing rules in force; Y1: anti-evasion audits routine.",
      timelineNe: "T+४५ दिन: शुल्क खारेज र मार्ग नियम लागू; Y१: उल्लंघन विरोधी लेखापरीक्षा नियमित।",
      milestones: [
        {
          en: "Plain-language guide: cottage vs small industry paths and capital proof.",
          ne: "सरल गाइड: घरेलु बनाम साना मार्ग र पूँजी प्रमाण।",
        },
        {
          en: "Appeal desk when legitimate firms are mis-routed by threshold edge cases.",
          ne: "थ्रेसहोल्ड सीमामा वैध फर्म बिचुलिएमा पुनरावेदन डेस्क।",
        },
        {
          en: "Integration test: one birth certificate number flows to tax and social security hooks.",
          ne: "एक जन्म प्रमाणपत्र नम्बर कर र सामाजिक सुरक्षा हुकमा बग्छ भन्ने परीक्षण।",
        },
      ],
      kpis: [
        {
          metricEn: "Median calendar days from application to registration certificate",
          metricNe: "आवेदनदेखि दर्ता प्रमाणपत्रसम्म मध्यक क्यालेन्डर दिन",
          howEn: "Workflow timestamps in registrar system.",
          howNe: "दर्ता प्रणाली कार्यप्रवाह समय छाप।",
        },
        {
          metricEn: "Share of flagged related-party clusters resulting in correction or denial (%)",
          metricNe: "चिन्ह लगाइएको सम्बन्धित पक्ष क्लस्टरमध्ये सच्याइ वा अस्वीकृत (%)",
          howEn: "Compliance unit case outcomes.",
          howNe: "अनुपालन एकाइ मुद्दा नतिजा।",
        },
      ],
      risks: [
        {
          en: "Back-office collapse — abolished fees with no budget for processors.",
          ne: "पछाडिको पतन — प्रशोधकका लागि बजेट बिना शुल्क खारेज।",
        },
        {
          en: "Threshold gaming — shell firms multiply under 25 crore.",
          ne: "थ्रेसहोल्ड खेल — २५ करोडमुनि खोलो कम्पनी बढ्छ।",
        },
      ],
      escalation: [
        {
          en: "FNCCI publishes district-level registration delay league table.",
          ne: "FNCCI ले जिल्ला स्तर दर्ता ढिलाइ लिग तालिका।",
        },
        {
          en: "Share this point so small industry registration is fair (#point-66).",
          ne: "साना उद्योग दर्ता न्यायोचित होस् भने साझेदारी गर्नुहोस् (#बुँदा-६६)।",
        },
      ],
      programStatusEn: "🟡 At risk — ≤25 cr single-office registration and 45-day fee abolition not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — २५ करोडसम्म एक कार्यालय दर्ता र ४५ दिन शुल्क खारेज यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p67",
    pointNumber: 67,
    category: "Economy & Development",
    promise:
      "Within two months develop a system so industry- and business-related records held by the Office of the Company Registrar, the Department of Industry, and the Department of Commerce, Supplies and Consumer Protection are automatically exchanged (interoperability). Establish a free consultation service desk to provide information and facilitation to service users on company and industry registration and import/export; within 15 days develop digital systems and related work to end middlemen’s involvement. Within three months develop a system to update statistics and obtain real-time data on industries, businesses, and firms registered with government bodies at all three tiers.",
    promiseNe:
      "कम्पनी रजिष्ट्रार कार्यालय, उद्योग विभाग र वाणिज्य, आपूर्ति तथा उपभोक्ता संरक्षण विभागमा रहेका उद्योग व्यवसायसँग सम्बन्धित विवरणहरू स्वचालित रूपमा आदानप्रदान (Interoperability) हुने प्रणाली दुई महिनाभित्र विकास गर्ने। कम्पनी तथा उद्योग दर्ता र आयात/निर्यात सम्बन्धमा सेवाग्राहीलाई आवश्यक जानकारी तथा सहजीकरण गर्न निःशुल्क परामर्श सेवा डेस्क स्थापना गर्ने, डिजिटल प्रणाली विकास गरी बिचौलियाको संलग्नता अन्त्य गर्ने कार्य १५ दिनभित्र गर्ने। साथै तीनै तहका सरकारी निकायबाट दर्ता भएका उद्योग, व्यवसाय तथा फर्महरूको तथ्याङ्कलाई अद्यावधिक गरी Real Time Data लिने प्रणाली तीन महिनाभित्र विकास गर्ने।",
    question:
      "What consent model governs cross-agency pulls, who is liable for wrong merges of company IDs, and is real-time data open to researchers under privacy rules?",
    questionNe:
      "निकायबीच डेटा खिचाइ कुन सहमति मोडेलले, कम्पनी ID गलत मर्ज भए दायित्व कोको, र वास्तविक समय डेटा गोपनीयता नियमअन्तर्गत अनुसन्धानकर्तालाई खुला छ?",
    whyThisMatters:
      "Interoperability is the spine of ease-of-doing-business—without it, “digital” is three portals and three passwords.",
    whyThisMattersNe:
      "अन्तरसञ्चालन व्यवसाय सहजताको कशेरु हो — बिना यो «डिजिटल» तीन पोर्टल तीन पासवर्ड।",
    possiblePathItems: [
      "UUID-based legal entity identifier nationwide",
      "Synthetic test data for vendor onboarding",
      "Breach notification playbook shared across agencies",
      "Annual third-party penetration test published",
    ],
    possiblePathItemsNe: [
      "राष्ट्रव्यापी UUID आधारित कानुनी इकाई पहिचान",
      "विक्रेता अनबोर्डिङका लागि सिन्थेटिक परीक्षण डेटा",
      "निकायबीच साझा उल्लंघन सूचना खाका",
      "वार्षिक तेस्रो पक्ष पेनिट्रेसन प्रकाशन",
    ],
    systemInsight:
      "Fifteen days to cut middlemen is the easy promise—two months for APIs is where vendors quietly negotiate extensions.",
    systemInsightNe:
      "बिचौलिया कटाउन १५ दिन सजिलो वाचा — API का लागि दुई महिना विक्रेता म्याद मोल्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ६७ (interoperability, desks, anti-middleman, real-time registry data; scan Page 13)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ६७ (अन्तरसञ्चालन, परामर्श, वास्तविक समय डेटा; स्क्यान पृष्ठ १३)",
    sourceExcerpt:
      "From scan (Page 13, छ): 2 months auto interoperability — Company Registrar, Industry, Commerce/consumer protection; free desk + digital to end middlemen in 15 days; 3 months real-time data, firms registered at all three tiers.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १३ (छ): २ महिना स्वचालित Interoperability; निःशुल्क परामर्श डेस्क र १५ दिनमा बिचौलिया अन्त्यका लागि डिजिटल; ३ महिना तीनै तह दर्ता उद्योग/व्यवसाय/फर्मको Real Time Data।",
    layer1: {
      hookEmoji: "🔗",
      hook: "2 months: auto interoperability across Company Registrar, Industry, Commerce; free desk; 15 days to cut middlemen; 3 months real-time registry data (all tiers).",
      hookNe: "२ महिना: कम्पनी, उद्योग, वाणिज्यबीच अन्तरसञ्चालन; निःशुल्क डेस्क; १५ दिन बिचौलिया कट; ३ महिना तीनै तह वास्तविक समय डेटा।",
      stakeLine: "Interoperability needs consent, liability, and one legal entity ID — not three portals, three passwords.",
      stakeLineNe: "अन्तरसञ्चालनलाई सहमति, दायित्व र एउटै कानुनी इकाई ID चाहिन्छ — तीन पोर्टल, तीन पासवर्ड होइन।",
      coreQuestionShort: "Consent model for cross-agency pulls; who pays for bad merges; researcher access under privacy?",
      coreQuestionShortNe: "निकायबीच खिचाइ सहमति; गलत मर्ज दायित्व; गोपनीयतामा अनुसन्धान खुला?",
      coreQuestion:
        "What consent and purpose-limitation rules govern automated exchange; which agency is liable for incorrect entity merges; is real-time statistics available to researchers under de-identification rules?",
      coreQuestionNe:
        "स्वचालित आदानप्रदानमा सहमति र उद्देश्य सीमा के; गलत इकाई मर्जको दायित्व कुन निकाय; गोपनीयता नियमअन्तर्गत वास्तविक समय तथ्याङ्क अनुसन्धानकर्तालाई?",
      quickScan: [
        {
          item: "2-month milestone: API specs + sandbox for Company/Industry/Commerce live",
          itemNe: "२ महिना कोसेङ्क: API विनिर्देश + कम्पनी/उद्योग/वाणिज्य स्यान्डबक्स लाइभ",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "15-day deliverable: digital middleman-replacement flows + desk SLA published",
          itemNe: "१५ दिन उपलब्धि: बिचौलिया प्रतिस्थापन डिजिटल प्रवाह + डेस्क SLA प्रकाशित",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "UUID or national legal entity identifier mapped across all registries",
          itemNe: "सबै दर्तामा UUID वा राष्ट्रिय कानुनी इकाई पहिचान म्याप",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "3-month real-time tier: federal/provincial/local firm counts with refresh latency published",
          itemNe: "३ महिना वास्तविक समय: संघ/प्रदेश/स्थानीय फर्म गणना र ताजगी ढिलाइ प्रकाशित",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of Company Registrar; Department of Industry; Department of Commerce, Supplies and Consumer Protection; MoICS coordination; NPC/Digital Nepal for standards.",
      primaryOwnersNe:
        "कम्पनी रजिष्ट्रार; उद्योग विभाग; वाणिज्य, आपूर्ति तथा उपभोक्ता संरक्षण विभाग; समन्वय उद्योग मन्त्रालय; मानक डिजिटल नेपाल/योजना आयोग।",
      coordinatingOfficeEn:
        "Interoperability programme office with shared event bus and breach notification playbook across agencies.",
      coordinatingOfficeNe: "साझा इभेन्ट बस र निकायबीच उल्लंघन सूचना खाकासहित अन्तरसञ्चालन कार्यक्रम कार्यालय।",
      accountableRolesEn:
        "Weekly integration health: API uptime, error budget, records exchanged vs failed.",
      accountableRolesNe:
        "हप्तामा एकीकरण स्वास्थ्य: API अपटाइम, त्रुटि बजेट, साटिएको बनाम असफल रेकर्ड।",
      timelineEn: "T+15 days: anti-middleman digital paths; T+60: interoperability MVP; T+90: real-time stats pilot.",
      timelineNe: "T+१५ दिन: बिचौलिया विरोधी डिजिटल; T+६०: अन्तरसञ्चालन MVP; T+९०: वास्तविक समय तथ्याङ्क पाइलट।",
      milestones: [
        {
          en: "Synthetic test data packs for vendor certification before production keys.",
          ne: "उत्पादन कुञ्जी अघि विक्रेता प्रमाणनका लागि सिन्थेटिक परीक्षण डेटा।",
        },
        {
          en: "Annual third-party penetration test with public executive summary.",
          ne: "सार्वजनिक कार्यकारी सारसहित वार्षिक तेस्रो पक्ष पेनिट्रेसन।",
        },
        {
          en: "Researcher data-sharing agreement template with ethics review.",
          ne: "नैतिक समीक्षासहित अनुसन्धानकर्ता डेटा साझेदारी नमूना।",
        },
      ],
      kpis: [
        {
          metricEn: "Cross-registry entity match accuracy (precision/recall) on audit sample",
          metricNe: "लेखापरीक्षा नमूनामा अन्तरदर्ता इकाई मिलान शुद्धता",
          howEn: "Golden-record reconciliation exercises.",
          howNe: "गोल्डन रेकर्ड मिलान अभ्यास।",
        },
        {
          metricEn: "Median hours from desk ticket to resolution (free consultation)",
          metricNe: "डेस्क टिकटदेखि समाधानसम्म मध्यक घण्टा (निःशुल्क परामर्श)",
          howEn: "Helpdesk ticketing system.",
          howNe: "हेल्पडेस्क टिकटिङ।",
        },
      ],
      risks: [
        {
          en: "Rushed 15-day digital launch — brokers move to unofficial channels.",
          ne: "हतारिएको १५ दिन डिजिटल — बिचौलिया अनौपचारिक मार्गमा।",
        },
        {
          en: "Privacy breaches from over-sharing real-time firm data.",
          ne: "वास्तविक समय फर्म डेटा बढी साझेदारीबाट गोपनीयता उल्लंघन।",
        },
      ],
      escalation: [
        {
          en: "Private sector API council publishes friction log when agencies miss SLAs.",
          ne: "निकायले SLA चुकाउँदा निजी क्षेत्र API परिषद्ले घर्षण लग।",
        },
        {
          en: "Share this point so interoperability is real APIs (#point-67).",
          ne: "अन्तरसञ्चालन वास्तविक API होस् भने साझेदारी गर्नुहोस् (#बुँदा-६७)।",
        },
      ],
      programStatusEn: "🟡 At risk — 2-month interoperability, 15-day anti-middleman digital, 3-month real-time data not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — २ महिना अन्तरसञ्चालन, १५ दिन बिचौलिया विरोधी, ३ महिना वास्तविक समय डेटा यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p68",
    pointNumber: 68,
    category: "Economy & Development",
    promise:
      "Put in place arrangements to centralize corporate social responsibility (CSR) funds from industrial enterprises and channel them through a Nepal government–designated fund for deployment in priority sectors, completing necessary legal amendments and new legislation within three months.",
    promiseNe:
      "औद्योगिक प्रतिष्ठानहरूको Corporate Social Responsibility (CSR) रकमलाई केन्द्रीकृत गरी नेपाल सरकारले तोकेको कोषमार्फत प्राथमिकताका क्षेत्रमा परिचालन गर्ने व्यवस्था मिलाउने तथा यसका लागि आवश्यक कानुन संशोधन तथा निर्माण गर्ने कार्य तीन महिनाभित्र सम्पन्न गर्ने।",
    question:
      "How are project choices made transparent, can firms still co-brand local projects, and what audit regime prevents politicized spending?",
    questionNe:
      "आयोजना छनोट कसरी पारदर्शी, फर्म स्थानीय आयोजनामा सह-ब्रान्ड गर्न पाउँछ, र राजनीतिक खर्च रोक्न कुन लेखापरीक्षण छ?",
    whyThisMatters:
      "Pooling CSR can scale impact or dilute company accountability—governance design decides which.",
    whyThisMattersNe:
      "CSR एकीकरण प्रभाव ठूलो वा कम्पनी जवाफदेहिता पातलो — शासन डिजाइनले छान्छ।",
    possiblePathItems: [
      "Published allocation formula (sector, geography, disaster)",
      "Independent board with private-sector and CSO seats",
      "Beneficiary grievance mechanism",
      "Annual impact evaluation with open data",
    ],
    possiblePathItemsNe: [
      "क्षेत्र, भूगोल, प्रकोपअनुसार प्रकाशित विनियोजन सूत्र",
      "निजी क्षेत्र र नागरिक समाज सिटसहित स्वतन्त्र बोर्ड",
      "लाभार्थी उजुरी प्रणाली",
      "खुला डेटासहित वार्षिक प्रभाव मूल्याङ्कन",
    ],
    systemInsight:
      "Mandatory centralization can chill voluntary community partnerships unless co-investment rules are generous.",
    systemInsightNe:
      "अनिवार्य केन्द्रीकरण सह-लगानि नियम उदार नभए स्वैच्छिक साझेदारी चिसो पार्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ६८ (centralized CSR fund; scan Page 13)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ६८ (केन्द्रीकृत CSR कोष; स्क्यान पृष्ठ १३)",
    sourceExcerpt:
      "From scan (Page 13, छ): centralize industrial CSR through government-designated fund for priority sectors; legal amendment and drafting completed within 3 months.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १३ (छ): CSR केन्द्रीकृत, सरकारले तोकेको कोषमार्फत प्राथमिकता क्षेत्रमा परिचालन; कानुन संशोधन तथा निर्माण ३ महिनाभित्र।",
    layer1: {
      hookEmoji: "🤝",
      hook: "Centralize industrial CSR through a government-designated fund for priority sectors — legal framework in 3 months.",
      hookNe: "औद्योगिक CSR सरकारले तोकेको कोषबाट प्राथमिकता क्षेत्र — ३ महिनामा कानुनी ढाँचा।",
      stakeLine: "Pooling CSR raises scale risk — governance must stop politicized pet projects.",
      stakeLineNe: "CSR एकीकरणले पैमाना जोखिम बढाउँछ — शासनले राजनीतिक पाल्तो आयोजना रोक्नुपर्छ।",
      coreQuestionShort: "Transparent allocation; independent board; co-branding for firms; audit against patronage?",
      coreQuestionShortNe: "पारदर्शी विनियोजन; स्वतन्त्र बोर्ड; फर्म सह-ब्रान्ड; प्रश्रय विरुद्ध लेखापरीक्षण?",
      coreQuestion:
        "How are projects selected and published before funding; can firms still co-invest or co-brand local work; what audit and grievance rules prevent ministerial earmarks?",
      coreQuestionNe:
        "आयोजना कसरी छानिन्छ र कोष अघि प्रकाशित; फर्म स्थानीय काममा सह-लगानि वा सह-ब्रान्ड गर्न पाउँछ; मन्त्रीय छनोट रोक्न लेखापरीक्षण र उजुरी नियम के?",
      quickScan: [
        {
          item: "3-month deliverable: bill text + fund charter with allocation formula published",
          itemNe: "३ महिना उपलब्धि: विधेयक पाठ + कोष विधान र विनियोजन सूत्र प्रकाशित",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Independent board composition (private + CSO seats) and term limits",
          itemNe: "स्वतन्त्र बोर्ड संरचना (निजी + नागरिक समाज सिट) र कार्यकाल सीमा",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Beneficiary grievance mechanism with published SLA",
          itemNe: "लाभार्थी उजुरी प्रक्रिया र प्रकाशित SLA",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Annual impact evaluation with open disbursement and outcome data",
          itemNe: "खुला भुक्तानी र नतिजा डेटासहित वार्षिक प्रभाव मूल्याङ्कन",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Industry, Commerce and Supplies; MoF for fund design; IRD for CSR compliance linkage; line ministries for sector priorities; AG for audit standards.",
      primaryOwnersNe:
        "उद्योग, वाणिज्य तथा आपूर्ति मन्त्रालय; कोष डिजाइनका लागि अर्थ मन्त्रालय; CSR अनुपालन जोडका लागि आन्तरिक राजस्व; क्षेत्र प्राथमिकताका लागि मन्त्रालय; लेखापरीक्षण मानक महालेखा।",
      coordinatingOfficeEn:
        "CSR fund secretariat with single grant management system and anti-fraud analytics.",
      coordinatingOfficeNe: "एकै अनुदान व्यवस्थापन प्रणाली र ठगी विश्लेषणसहित CSR कोष सचिवालय।",
      accountableRolesEn:
        "Quarterly public dashboard: committed, disbursed, projects complete, complaints open.",
      accountableRolesNe:
        "त्रैमासिक सार्वजनिक ड्यासबोर्ड: प्रतिबद्ध, भुक्तान, पूरा आयोजना, खुला उजुरी।",
      timelineEn: "T+90 days: enabling law in force; Y1: first full grant cycle with published evaluations.",
      timelineNe: "T+९० दिन: सक्षम कानुन लागू; Y१: प्रकाशित मूल्याङ्कनसहित पहिलो पूर्ण अनुदान चक्र।",
      milestones: [
        {
          en: "Sector caps (education, health, disaster) with disaster fast-track rules.",
          ne: "शिक्षा, स्वास्थ्य, प्रकोप क्षेत्र कोटा र प्रकोप छिटो नियम।",
        },
        {
          en: "Optional top-up for firms that match fund grants in poor municipalities.",
          ne: "गरिब पालिकामा कोष अनुदान मिलाउने फर्मलाई वैकल्पिक थप।",
        },
        {
          en: "Whistleblower channel with protected disclosure for fund staff.",
          ne: "कोष कर्मचारीका लागि संरक्षित खुलासासहित उजागरकर्ता च्यानल।",
        },
      ],
      kpis: [
        {
          metricEn: "Share of funded projects selected via scored rubric vs discretionary (%)",
          metricNe: "अङ्कित रुब्रिक बनाम विवेकाधीन छनोट भएका आयोजनाको हिस्सा (%)",
          howEn: "Board minute classification.",
          howNe: "बोर्ड मिनेट वर्गीकरण।",
        },
        {
          metricEn: "Median days from application to first disbursement",
          metricNe: "आवेदनदेखि पहिलो भुक्तानीसम्म मध्यक दिन",
          howEn: "Grant management system.",
          howNe: "अनुदान व्यवस्थापन प्रणाली।",
        },
      ],
      risks: [
        {
          en: "Mandatory centralization chills voluntary community partnerships.",
          ne: "अनिवार्य केन्द्रीकरणले स्वैच्छिक सामुदायिक साझेदारी चिसो पार्छ।",
        },
        {
          en: "Politicized project lists undermine CSR credibility.",
          ne: "राजनीतिक आयोजन सूचीले CSR विश्वास कमजोर पार्छ।",
        },
      ],
      escalation: [
        {
          en: "FNCCI and NGO federation joint audit sample of first grant round.",
          ne: "पहिलो अनुदान चक्रको संयुक्त नमूना लेखापरीक्षा FNCCI र NGO महासंघ।",
        },
        {
          en: "Share this point so CSR funds serve communities (#point-68).",
          ne: "CSR कोष समुदायका लागि होस् भने साझेदारी गर्नुहोस् (#बुँदा-६८)।",
        },
      ],
      programStatusEn: "🟡 At risk — centralized CSR fund and 3-month legal framework not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — केन्द्रीकृत CSR कोष र ३ महिना कानुनी ढाँचा यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p69",
    pointNumber: 69,
    category: "Economy & Development",
    promise:
      "Address the impact of the Gen Z movement and public demonstrations on private investment and employment toward a stable business environment by: (a) immediately implementing a Private Sector Protection Strategy for industry, banks, financial institutions, SMEs, and the service sector; (b) directing security bodies to maintain high alert and special security arrangements for industrial areas, trade centers, banking infrastructure, and supply chains; (c) giving priority to administrative facilitation for the operation and reopening of businesses disrupted by demonstrations; (d) collecting data on business losses and preparing relief and rehabilitation packages including tax concessions, interest subsidies, and debt restructuring; and (e) activating the Industry–Commerce Dialogue Council chaired by the Prime Minister for continuous dialogue and coordination with the private sector.",
    promiseNe:
      "जेन-जी आन्दोलन तथा सार्वजनिक प्रदर्शनले निजी लगानी तथा रोजगारमा पारेको प्रभावलाई स्थिर व्यवसाय वातावरण सुनिश्चित गर्न सम्बोधन गर्न: (क) उद्योग, बैंक, वित्तीय संस्था, साना तथा मझौला उद्योग तथा सेवा क्षेत्रका लागि «निजी क्षेत्र संरक्षण रणनीति» तत्काल कार्यान्वयन गर्ने; (ख) उद्योग क्षेत्र, व्यापार केन्द्र, बैंकिङ पूर्वाधार तथा आपूर्ति श्रृङ्खलाका लागि सुरक्षा निकायले उच्च सतर्कता तथा विशेष सुरक्षा व्यवस्था कायम राख्ने; (ग) प्रदर्शनका कारण अवरुद्ध व्यवसायको सञ्चालन तथा पुनःसञ्चालनका लागि प्रशासनिक सहजीकरणलाई प्राथमिकता दिने; (घ) व्यवसायिक क्षतिको विवरण सङ्कलन गरी कर सहुलियत, ब्याज अनुदान तथा ऋण पुनर्संरचनासहित राहत तथा पुनःस्थापना प्याकेज तयार गर्ने; (ङ) प्रधानमन्त्रीको अध्यक्षतामा रहेको उद्योग-व्यापार संवाद परिषद् सक्रिय गरी निजी क्षेत्रसँग निरन्तर संवाद तथा समन्वय कायम गर्ने।",
    question:
      "How are protest rights and labor strikes balanced in the protection strategy, what independent body verifies loss data, and how often does the dialogue council meet with published outcomes?",
    questionNe:
      "संरक्षण रणनीतिमा प्रदर्शन र श्रम हडताल कसरी सन्तुलन, क्षति डेटा कसले स्वतन्त्र प्रमाणित गर्छ, र संवाद परिषद् कति पटक बस्छ नतिजा प्रकाशित?",
    whyThisMatters:
      "Stability for investors cannot mean chilling lawful dissent—dual tracks for security and rights must be explicit.",
    whyThisMattersNe:
      "लगानी स्थिरता भनेर कानुनी असहमति चिसो पार्न मिल्दैन — सुरक्षा र अधिकार दोहोरो मार्ग स्पष्ट होस्।",
    possiblePathItems: [
      "Tripartite protocol: police, industry, labor observers",
      "Loss methodology approved by statistics office",
      "Council minutes with action owners and deadlines",
      "Human rights impact review after each major deployment",
    ],
    possiblePathItemsNe: [
      "प्रहरी, उद्योग, श्रम पर्यवेक्षक त्रिपक्षीय प्रोटोकल",
      "तथ्याङ्क कार्यालयले स्वीकृत क्षति विधि",
      "म्याद र मालिकसहित परिषद् मिनेट",
      "प्रमुख तैनातीपछि मानव अधिकार प्रभाव समीक्षा",
    ],
    systemInsight:
      "PM-chaired councils succeed when agendas are narrow and minutes bind budgets—otherwise they are photo-ops.",
    systemInsightNe:
      "प्रधानमन्त्री अध्यक्ष परिषद् सफल हुन्छ जब एजेन्डा साँघुरो र मिनेट बजेट बाँध्छ — नत्र फोटो सत्र।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ६९ (Gen-Z movement impacts; protection, relief, PM dialogue council; scan Page 13)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ६९ (जेन-जी प्रभाव; संरक्षण, राहत, संवाद परिषद्; स्क्यान पृष्ठ १३)",
    sourceExcerpt:
      "From scan (Page 13, छ): Gen Z / protests impact on investment & jobs — protection strategy; high alert & special security for industry, trade, banking, supply chains; admin facilitation for operation & reopening; loss data → relief (tax, interest, restructuring); PM-chaired Industry–Commerce Dialogue Council.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १३ (छ): जेन-जी/प्रदर्शन प्रभाव — संरक्षण रणनीति; उद्योग/व्यापार/बैंकिङ/आपूर्तिमा उच्च सतर्कता; अवरुद्ध व्यवसाय सञ्चालन/पुनःसञ्चालन सहजीकरण; क्षति विवरण र राहत प्याकेज; प्रधानमन्त्री अध्यक्ष उद्योग-व्यापार संवाद परिषद्।",
    layer1: {
      hookEmoji: "🕊️",
      hook: "Gen Z / protests — protection strategy, high-alert security for industry & supply chains, reopening help, loss data → relief, PM-chaired Industry–Commerce Dialogue Council.",
      hookNe: "जेन-जी/प्रदर्शन — संरक्षण रणनीति, उद्योग र आपूर्तिमा उच्च सतर्कता, पुनःसञ्चालन सहयोग, क्षति र राहत, प्रधानमन्त्री अध्यक्ष उद्योग-व्यापार संवाद परिषद्।",
      stakeLine: "Stability for investors must not erase lawful protest — write both tracks in the same annex.",
      stakeLineNe: "लगानी स्थिरता भनेर कानुनी प्रदर्शन मेटाउनु हुँदैन — दुवै मार्ग एउटै परिशिष्टमा लेख्नुहोस्।",
      coreQuestionShort: "Balance strikes and protests in strategy; independent loss verification; council cadence + minutes?",
      coreQuestionShortNe: "रणनीतिमा हडताल र प्रदर्शन सन्तुलन; स्वतन्त्र क्षति प्रमाण; परिषद् बैठक र मिनेट?",
      coreQuestion:
        "How does the protection strategy balance security with rights to strike and assemble; who independently verifies business loss data for packages; how often does the dialogue council meet with binding minutes and budgets?",
      coreQuestionNe:
        "संरक्षण रणनीतिले सुरक्षा र हडताल/सभा अधिकार कसरी सन्तुलन गर्छ; प्याकेजका लागि व्यवसाय क्षति डेटा कसले स्वतन्त्र प्रमाणित गर्छ; संवाद परिषद् कति बस्छ, बाध्य मिनेट र बजेट छ?",
      quickScan: [
        {
          item: "Protection strategy text published with HR chapter and labor-tripartite hooks",
          itemNe: "मानव अधिकार अध्याय र श्रम त्रिपक्षीय हुकसहित संरक्षण रणनीति पाठ प्रकाशित",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Loss methodology signed off by national statistics office + open audit trail",
          itemNe: "राष्ट्रिय तथ्याङ्क कार्यालयले स्वीकृत क्षति विधि + खुला लेखा पदचिन्ह",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Relief packages linked to verified loss tiers (tax, interest, restructuring)",
          itemNe: "प्रमाणित क्षति तहसँग जोडिएको राहत (कर, ब्याज, पुनर्संरचना)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Dialogue council: schedule, quorum, public minutes with action owners",
          itemNe: "संवाद परिषद्: तालिका, कोरम, कार्य मालिकसहित सार्वजनिक मिनेट",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "OPMCM for council secretariat; MoHA for security deployments; MoICS for business continuity; MoF/NRB for relief instruments; MoLESS for labor interface.",
      primaryOwnersNe:
        "परिषद् सचिवालय प्रधानमन्त्री कार्यालय; तैनाती गृह मन्त्रालय; व्यवसाय निरन्तरता उद्योग मन्त्रालय; राहत अर्थ/राष्ट्र बैंक; श्रम जोड श्रम मन्त्रालय।",
      coordinatingOfficeEn:
        "Single situation room linking district security feeds with industry reopening desk tickets.",
      coordinatingOfficeNe: "जिल्ला सुरक्षा फिड र उद्योग पुनःसञ्चालन डेस्क टिकट जोड्ने एकै सिचुएसन रूम।",
      accountableRolesEn:
        "After each major event: published timeline of facilitation steps and appeals window.",
      accountableRolesNe:
        "प्रत्येक ठूलो घटनापछि: सहजीकरण चरण र पुनरावेदन खुला अवधि प्रकाशित समयरेखा।",
      timelineEn: "Rolling: protection strategy implementation; quarterly council minimum; relief tied to verified losses.",
      timelineNe: "निरन्तर: संरक्षण कार्यान्वयन; त्रैमासिक कम्तीमा एक परिषद्; प्रमाणित क्षतिसँग राहत।",
      milestones: [
        {
          en: "Tripartite protocol: police, industry, labor observers on industrial corridors.",
          ne: "औद्योगिक करिडोरमा प्रहरी, उद्योग, श्रम पर्यवेक्षक त्रिपक्षीय प्रोटोकल।",
        },
        {
          en: "NHRC spot review after large security deployments.",
          ne: "ठूलो सुरक्षा तैनातीपछि मानव अधिकार आयोग नमूना समीक्षा।",
        },
        {
          en: "Public appeal when reopening permits are delayed beyond SLA.",
          ne: "पुनःसञ्चालन अनुमति SLA भन्दा ढिलो भए सार्वजनिक पुनरावेदन।",
        },
      ],
      kpis: [
        {
          metricEn: "Median days from disruption end to normalized operations permit",
          metricNe: "अवरोध अन्त्यदेखि सामान्य सञ्चालन अनुमतिसम्म मध्यक दिन",
          howEn: "Industry helpdesk ticketing.",
          howNe: "उद्योग हेल्पडेस्क टिकटिङ।",
        },
        {
          metricEn: "Share of dialogue council action items closed on time (%)",
          metricNe: "समयमै बन्द संवाद परिषद् कार्य वस्तु (%)",
          howEn: "Minute tracker vs deadline fields.",
          howNe: "मिनेट ट्र्याकर बनाम म्याद क्षेत्र।",
        },
      ],
      risks: [
        {
          en: "Security overreach — lawful protests criminalized by default.",
          ne: "सुरक्षा अतिक्रमण — कानुनी प्रदर्शन पूर्वनिर्धारित अपराध।",
        },
        {
          en: "Council as photo-op — no budget follow-through.",
          ne: "परिषद् फोटो सत्र — बजेट पछिको कदम छैन।",
        },
      ],
      escalation: [
        {
          en: "Trade unions and FNCCI joint statement if minutes lack funding lines.",
          ne: "मिनेटमा कोष शीर्षक छैन भने ट्रेड युनियन र FNCCI संयुक्त वक्तव्य।",
        },
        {
          en: "Share this point so stability respects rights (#point-69).",
          ne: "स्थिरताले अधिकारको सम्मान गरोस् भने साझेदारी गर्नुहोस् (#बुँदा-६९)।",
        },
      ],
      programStatusEn: "🟡 At risk — Gen Z movement response package (protection, relief, PM dialogue council) not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — जेन-जी प्रतिक्रिया (संरक्षण, राहत, संवाद परिषद्) यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p70",
    pointNumber: 70,
    category: "Infrastructure & Transport",
    promise:
      "To prevent disruption of supply chains, the Ministry of Home Affairs shall immediately ensure unobstructed movement and operation of transport vehicles on import–export routes.",
    promiseNe:
      "आपूर्ति श्रृङ्खलामा अवरोध हुन नदिन आयात निर्यात हुने मार्गमा ढुवानीका साधनको अवरोधरहित सञ्चालन सुनिश्चित गर्न गृह मन्त्रालयले तत्काल व्यवस्था मिलाउने।",
    question:
      "What corridor-level metrics define “unobstructed,” how are provincial checkpoints harmonized, and where can traders report illegal stoppages with enforcement feedback?",
    questionNe:
      "«बिना अवरोध» कुन मार्ग स्तर मेट्रिकले, प्रदेश चेकपोइन कसरी मिल्छ, र गैरकानुनी रोक कहाँ उजुरी गर्ने र प्रतिक्रिया के?",
    whyThisMatters:
      "Perishable exports and factory inputs die in traffic jams—logistics is macro stability in motion.",
    whyThisMattersNe:
      "बिग्रने निर्यात र कारखाना इनपुट जाममा मर्छ — लजिस्टिक्स गतिमा म्याक्रो स्थिरता हो।",
    possiblePathItems: [
      "Green-channel stickers with dispute hotline",
      "Published average delay minutes per border post",
      "Joint MoHA-MoICS corridor command on peak days",
      "Trader satisfaction index monthly",
    ],
    possiblePathItemsNe: [
      "विवाद हटलाइनसहित ग्रीन-च्यानल स्टिकर",
      "सीमा पोस्ट प्रति औसत ढिलाइ मिनेट प्रकाशन",
      "चरम दिनमा गृह-उद्योग संयुक्त मार्ग कमान",
      "मासिक व्यापारी सन्तुष्टि सूचक",
    ],
    systemInsight:
      "“Immediate” logistics fixes often mean police phones—codify escort rules or informal tolls return.",
    systemInsightNe:
      "«तत्काल» लजिस्टिक प्रायः प्रहरी फोन — स्कर्ट नियम कागजी गर्नुहोस् नत्र अनौपचारिक शुल्क फर्किन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ७० (import/export routes: unobstructed transport; scan Page 14)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ७० (आयात-निर्यात मार्ग अवरोधरहित ढुवानी; स्क्यान पृष्ठ १४)",
    sourceExcerpt:
      "From scan (Page 14, छ): MoHA immediately arranges unobstructed movement/operation of transport vehicles on import–export routes — supply chain disruption prevention.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १४ (छ): आपूर्ति श्रृङ्खला अवरोध रोक्न आयात-निर्यात मार्गमा ढुवानी साधन अवरोधरहित सञ्चालन — गृह मन्त्रालय तत्काल।",
    layer1: {
      hookEmoji: "🚛",
      hook: "MoHA: unobstructed movement of transport on import–export routes — supply chains protected.",
      hookNe: "गृह: आयात-निर्यात मार्गमा ढुवानी अवरोधरहित — आपूर्ति श्रृङ्खला सुरक्षित।",
      stakeLine: "“Unobstructed” needs metrics — otherwise it is a switchboard promise, not a corridor standard.",
      stakeLineNe: "«बिना अवरोध» लाई मेट्रिक चाहिन्छ — नत्र करिडोर मानक होइन स्विचबोर्ड वाचा।",
      coreQuestionShort: "Corridor KPIs; harmonized checkpoints; trader hotline with enforcement feedback?",
      coreQuestionShortNe: "मार्ग KPI; मिलेका चेकपोइन; व्यापारी हटलाइन र कार्यान्वयन प्रतिक्रिया?",
      coreQuestion:
        "What measurable corridor-level KPIs define unobstructed flow; how are provincial checkpoints harmonized with federal standards; where can traders report illegal stops and see enforcement outcomes?",
      coreQuestionNe:
        "बिना अवरोध प्रवाहलाई कुन मापयोग मार्ग KPI परिभाषा गर्छ; प्रदेश चेकपोइन संघीय मानकसँग कसरी मिल्छ; गैरकानुनी रोक कहाँ उजुरी गर्ने र नतिजा देख्ने?",
      quickScan: [
        {
          item: "Published corridor SLA: max stoppage minutes except lawful inspection",
          itemNe: "प्रकाशित मार्ग SLA: कानुनी जाँच बाहेक अधिकतम रोक मिनेट",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Green-channel or trusted-operator scheme with dispute hotline number",
          itemNe: "विश्वासित सञ्चालक योजना र विवाद हटलाइन नम्बर",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Monthly average delay per major border post (published)",
          itemNe: "प्रमुख सीमा पोस्ट प्रति औसत ढिलाइ (मासिक प्रकाशित)",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Joint MoHA–MoICS corridor command roster on peak trade days",
          itemNe: "चरम व्यापार दिनमा गृह-उद्योग संयुक्त मार्ग कमान तालिका",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Home Affairs; Nepal Police traffic and border units; provincial governments for local checkpoints; customs for border coordination; MoICS for trader interface.",
      primaryOwnersNe:
        "गृह मन्त्रालय; नेपाल प्रहरी यातायात र सीमा; स्थानीय चेकपोइनका लागि प्रदेश; सीमा समन्वय भन्सार; व्यापारी जोड उद्योग मन्त्रालय।",
      coordinatingOfficeEn:
        "Logistics cell with real-time incident map and escalation to provincial police chiefs.",
      coordinatingOfficeNe: "वास्तविक समय घटना नक्सा र प्रदेश प्रहरी प्रमुख उक्साइसहित लजिस्टिक्स कोठा।",
      accountableRolesEn:
        "Weekly trader satisfaction sample on top three import–export routes.",
      accountableRolesNe:
        "शीर्ष तीन आयात-निर्यात मार्गमा हप्तामा व्यापारी सन्तुष्टि नमूना।",
      timelineEn: "Immediate: hotline live; M1: KPI baseline published; ongoing: reduce illegal stoppages quarter on quarter.",
      timelineNe: "तत्काल: हटलाइन; M१: KPI आधाररेखा; निरन्तर: गैरकानुनी रोक त्रैमासिक घटाउने।",
      milestones: [
        {
          en: "Body-worn or GPS log policy for contested stops on highways.",
          ne: "राजमार्ग विवादित रोकका लागि बडी-क्याम वा GPS लग नीति।",
        },
        {
          en: "Published list of lawful inspection points only — others void.",
          ne: "कानुनी जाँच बिन्दु मात्र प्रकाशित सूची — अरू बेमानी।",
        },
        {
          en: "Insurance linkage for documented perishable spoilage from delays.",
          ne: "ढिलाइबाट कागजातीकृत बिग्रने चिजको बीम जोड।",
        },
      ],
      kpis: [
        {
          metricEn: "Illegal stop reports resolved with disciplinary outcome (%)",
          metricNe: "गैरकानुनी रोक उजुरी कारवाही नतिजासहित समाधान (%)",
          howEn: "Hotline case management system.",
          howNe: "हटलाइन मुद्दा व्यवस्थापन।",
        },
        {
          metricEn: "Median additional minutes vs free-flow benchmark on monitored corridors",
          metricNe: "निगरानी मार्गमा स्वतन्त्र प्रवाह बनाम थप मध्यक मिनेट",
          howEn: "GPS truck samples vs baseline.",
          howNe: "GPS ट्रक नमूना बनाम आधाररेखा।",
        },
      ],
      risks: [
        {
          en: "Informal tolls return under “coordination” without codified rules.",
          ne: "«समन्वय» मुनि अनौपचारिक शुल्क — कागजी नियम बिना।",
        },
        {
          en: "Security used to harass certain cargoes or routes.",
          ne: "केही माल वा मार्ग दुःख दिन सुरक्षाको दुरुपयोग।",
        },
      ],
      escalation: [
        {
          en: "FNCCI publishes corridor friction index when delays spike.",
          ne: "ढिलाइ बढ्दा FNCCI ले मार्ग घर्षण सूचकांक।",
        },
        {
          en: "Share this point so trade routes stay open (#point-70).",
          ne: "व्यापार मार्ग खुला रहोस् भने साझेदारी गर्नुहोस् (#बुँदा-७०)।",
        },
      ],
      programStatusEn: "🟡 At risk — MoHA unobstructed import–export transport arrangement not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — गृह आयात-निर्यात अवरोधरहित ढुवानी व्यवस्था यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  ...cabinetPoints71to85,
  ...cabinetPoints86to100,
];

if (import.meta.env.DEV && fullPoints.length !== CABINET_DATA_POINT_COUNT) {
  console.warn(`[cabinet data] Expected ${CABINET_DATA_POINT_COUNT} points, got ${fullPoints.length}`);
}

function downloadCabinetAgendaJson() {
  const payload = {
    exportMeta: {
      version: "1.0",
      snapshotDate: CABINET_DATA_SNAPSHOT_ISO,
      snapshotLabelEn: CABINET_DATA_SNAPSHOT_LABEL_EN,
      snapshotLabelNe: CABINET_DATA_SNAPSHOT_LABEL_NE,
      pointCount: fullPoints.length,
      generator: "Nepal Public Commitments Tracker",
      note: "Independent civic dataset — not an official government publication.",
    },
    points: fullPoints,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nepal-cabinet-100-points-${CABINET_DATA_SNAPSHOT_ISO}.json`;
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const allPoints = fullPoints;

export { fullPoints };

function normalizeSearchTerm(raw) {
  return raw.trim().toLowerCase().normalize("NFC");
}

/** All EN/NE text users might remember when searching (promise, sources, paths, brief summaries). */
function buildPointSearchHaystack(point) {
  const parts = [
    point.id,
    String(point.pointNumber),
    point.status,
    point.promise,
    point.promiseNe,
    point.question,
    point.questionNe,
    point.whyThisMatters,
    point.whyThisMattersNe,
    point.systemInsight,
    point.systemInsightNe,
    point.category,
    point.sourceDocumentTitle,
    point.sourceDocumentTitleNe,
    point.sourceExcerpt,
    point.sourceExcerptNe,
    point.sourceType,
    point.possiblePath,
    point.possiblePathNe,
  ];
  if (point.layer1) parts.push(JSON.stringify(point.layer1));
  if (point.programMonitoring) parts.push(JSON.stringify(point.programMonitoring));
  if (Array.isArray(point.possiblePathItems)) parts.push(...point.possiblePathItems);
  if (Array.isArray(point.possiblePathItemsNe)) parts.push(...point.possiblePathItemsNe);
  const ps = promiseSummaries[point.pointNumber];
  if (ps) {
    if (ps.summary) parts.push(ps.summary);
    if (ps.summaryNe) parts.push(ps.summaryNe);
  }
  return parts
    .filter((s) => s != null && String(s).length > 0)
    .map((s) => String(s).normalize("NFC").toLowerCase())
    .join("\u0000");
}

/** Each whitespace-separated token must appear somewhere in the haystack (order-free). */
function pointMatchesSearch(point, normalizedTerm) {
  if (!normalizedTerm) return true;
  const haystack = buildPointSearchHaystack(point);
  const tokens = normalizedTerm.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  return tokens.every((tok) => haystack.includes(tok));
}

/** Lettered sections and point ranges per Cabinet scan (छ ५३–७३; ज ७४–७७; झ ७८–८४; ञ ८५–८९; ट ९०–९२; ठ ९३–१००). */
const AGENDA_SECTIONS = [
  {
    id: "ka",
    pointStart: 1,
    pointEnd: 8,
    titleEn: "(क) Common commitment, coordination & public trust",
    titleNe: "(क) साझा प्रतिबद्धता, समन्वय र जनविश्वास",
  },
  {
    id: "kha",
    pointStart: 9,
    pointEnd: 19,
    titleEn: "(ख) Administrative reform, restructuring & austerity",
    titleNe: "(ख) प्रशासनिक सुधार, पुनर्संरचना र मितव्ययिता",
  },
  {
    id: "ga",
    pointStart: 20,
    pointEnd: 27,
    titleEn: "(ग) Public service delivery & grievance management",
    titleNe: "(ग) सार्वजनिक सेवा प्रवाह र गुनासो व्यवस्थापन",
  },
  {
    id: "gha",
    pointStart: 28,
    pointEnd: 42,
    titleEn: "(घ) Digital governance, data governance & communication",
    titleNe: "(घ) डिजिटल शासन र डेटा गभर्नेन्स तथा सञ्चार",
  },
  {
    id: "nga",
    pointStart: 43,
    pointEnd: 47,
    titleEn: "(ङ) Good governance, transparency & corruption control",
    titleNe: "(ङ) सुशासन, पारदर्शिता र भ्रष्टाचार नियन्त्रण",
  },
  {
    id: "cha",
    pointStart: 48,
    pointEnd: 52,
    titleEn: "(च) Public procurement & project management reform",
    titleNe: "(च) सार्वजनिक खरिद र परियोजना व्यवस्थापन सुधार",
  },
  {
    id: "chha",
    pointStart: 53,
    pointEnd: 73,
    titleEn: "(छ) Investment, industry, private sector & tourism",
    titleNe: "(छ) लगानी, उद्योग, निजी क्षेत्र प्रवर्द्धन तथा पर्यटन",
  },
  {
    id: "ja",
    pointStart: 74,
    pointEnd: 77,
    titleEn: "(ज) Energy & water resources; urban bills",
    titleNe: "(ज) ऊर्जा तथा जलस्रोत; शहरी/फोहोर विधेयक",
  },
  {
    id: "jha",
    pointStart: 78,
    pointEnd: 84,
    titleEn: "(झ) Revenue reform, mining, customs & bail mobilization",
    titleNe: "(झ) राजस्व सुधार, खानी, भन्सार तथा धरौटी",
  },
  {
    id: "nya",
    pointStart: 85,
    pointEnd: 89,
    titleEn: "(ञ) Health, education & human development",
    titleNe: "(ञ) स्वास्थ्य, शिक्षा र मानव विकास",
  },
  {
    id: "ta",
    pointStart: 90,
    pointEnd: 92,
    titleEn: "(ट) Agriculture, land & encroachment control",
    titleNe: "(ट) कृषि, भूमि तथा अतिक्रमण नियन्त्रण",
  },
  {
    id: "tha",
    pointStart: 93,
    pointEnd: 100,
    titleEn: "(ठ) Strategic decisions, security & closing commitment",
    titleNe: "(ठ) रणनीतिक निर्णय, सुरक्षा र समापन आह्वान",
  },
];

function pointMatchesSelectedSection(pointNumber, sectionId) {
  if (sectionId === "All") return true;
  const sec = AGENDA_SECTIONS.find((s) => s.id === sectionId);
  if (!sec) return true;
  return pointNumber >= sec.pointStart && pointNumber <= sec.pointEnd;
}

function sectionFilterOptionLabel(sec, language, t) {
  const rangeStr = t.agendaSectionRange
    .replace("{{start}}", String(sec.pointStart))
    .replace("{{end}}", String(sec.pointEnd));
  const letter =
    language === "ne"
      ? sec.titleNe.match(/^\([^)]+\)/)?.[0] ?? sec.id
      : sec.titleEn.match(/^\([^)]+\)/)?.[0] ?? sec.id;
  return `${rangeStr} · ${letter}`;
}

function formatActiveFiltersSummary(language, search, selectedSectionId, selectedStatus, t) {
  const bits = [];
  const q = search.trim();
  if (q) bits.push(`${t.filterActiveSearchPrefix}: “${q}”`);
  if (selectedSectionId !== "All") {
    const sec = AGENDA_SECTIONS.find((s) => s.id === selectedSectionId);
    if (sec) bits.push(sectionFilterOptionLabel(sec, language, t));
  }
  if (selectedStatus !== "All") bits.push(statusFilterLabel(selectedStatus, t));
  if (bits.length === 0) return null;
  return `${t.filterActiveLabel}: ${bits.join(" · ")}`;
}

const sourceImageMap = import.meta.glob("../Page *.PNG", { eager: true, import: "default" });
const sourcePages = Object.entries(sourceImageMap)
  .map(([path, src]) => {
    const match = path.match(/Page\s+(\d+)\.PNG$/i);
    return { page: match ? Number(match[1]) : 0, src };
  })
  .filter((item) => item.page > 0)
  .sort((a, b) => a.page - b.page);

const DEVANAGARI_DIGIT_TO_INT = {
  "०": 0,
  "१": 1,
  "२": 2,
  "३": 3,
  "४": 4,
  "५": 5,
  "६": 6,
  "७": 7,
  "८": 8,
  "९": 9,
};

function devanagariDigitsToInt(str) {
  if (!str) return null;
  let n = 0;
  for (const ch of str) {
    if (!(ch in DEVANAGARI_DIGIT_TO_INT)) return null;
    n = n * 10 + DEVANAGARI_DIGIT_TO_INT[ch];
  }
  return n;
}

/** First page where this point's text appears, from source titles (e.g. "scan Page 4", "Pages 4–5"). */
function getSourceScanPageNumber(point) {
  if (!point) return null;
  if (typeof point.sourceScanPage === "number" && point.sourceScanPage >= 1) return point.sourceScanPage;

  const en = point.sourceDocumentTitle ?? "";
  let m = en.match(/scan Pages\s*(\d+)\s*[\u2013\u2014-]\s*(\d+)/i);
  if (m) return Number(m[1]);
  m = en.match(/scan Page\s*(\d+)/i);
  if (m) return Number(m[1]);

  const ne = point.sourceDocumentTitleNe ?? "";
  m = ne.match(/स्क्यान पृष्ठ ([०-९]+)/);
  if (m) {
    const n = devanagariDigitsToInt(m[1]);
    if (n != null && n >= 1) return n;
  }
  m = ne.match(/स्क्यान\s*([०-९]+)\s*[\u2013\u2014-]\s*([०-९]+)/);
  if (m) {
    const n = devanagariDigitsToInt(m[1]);
    if (n != null && n >= 1) return n;
  }
  return null;
}

function sourcePageIndexForScanPage(pages, pageNum) {
  if (!pages.length) return 0;
  if (pageNum == null || pageNum < 1) return 0;
  const idx = pages.findIndex((p) => p.page === pageNum);
  return idx >= 0 ? idx : 0;
}

const navItems = [{ id: "dashboard" }];

const uiText = {
  en: {
    platformTitle: "Nepal Public Commitments Tracker",
    home: "Home",
    dashboard: "Dashboard",
    sources: "Sources",
    methodology: "Methodology",
    about: "About",
    projectNav: "About project",
    betaLabel: "Beta",
    launchTagline: "Citizen understanding of public commitments",
    phaseLabel: "Phase 1 · 100-point Cabinet agenda mapping",
    siteLastUpdated: CABINET_DATA_SNAPSHOT_LABEL_EN,
    lastUpdatedTop: "Last updated",
    heroTitle: "Nepal Public Commitments Tracker",
    heroMeaningTitle: "Nepal Aama and the Condition of the Nation",
    heroProductName: "Nepal Public Commitments Tracker",
    heroAuthority:
      "100 Cabinet-listed commitments — each with source context, structured questions, and a channel for verified public responses.",
    heroSubtitle: "",
    heroMeta:
      "Independent citizen research tool — not a government audit or party project. Based on publicly documented Cabinet commitments and open records.",
    forCitizensNav: "For Citizens",
    forCitizensTitle: "Why it matters",
    forCitizensBullets: [
      "Services, jobs, roads, health, schools — commitments should show up in real life.",
      "Evidence-linked facts instead of noise.",
      "Open tracking: awaiting → review → addressed.",
    ],
    purposeTitle: "How it works",
    purposeCards: [
      { title: "Promises", text: "Official language, one point at a time." },
      { title: "Questions", text: "Execution and transparency, not slogans." },
      { title: "Context", text: "Brief why-it-matters." },
      { title: "Paths", text: "Next steps, framed constructively." },
      { title: "Status", text: "Response pipeline on the tracker." },
    ],
    viewDashboard: "View Dashboard",
    heroSubmitNote:
      "Serious channel — submissions are reviewed for accuracy and verification before publication (not a casual comment box).",
    statsTotal: "Total points",
    statsVerified: "Addressed",
    statsReview: "Under review",
    statsAwaiting: "Awaiting response",
    statsLastUpdate: "Last update",
    publicResponseNotAvailable: "Public response data: not yet available — beta pilot phase.",
    responsesInReviewNote: "Some items may be under review; verified publication still pending.",
    responseProgressLabel: "Points with a published verified response",
    projectAboutTitle: "About this project",
    projectAboutParagraphs: [
      "This is an independent, research-based civic-tech prototype designed to help citizens understand publicly announced commitments and their real-world implementation.",
      "It does not represent any government body, political group, or official audit authority.",
      "The goal is transparency, understanding, and constructive dialogue.",
    ],
    footerTagline: "Citizen understanding of public commitments — not an official audit.",
    footerIdentity: "An independent, citizen-led research initiative.",
    footerTrustLine:
      "Not a government site. A point stays “Awaiting response” until a verifiable public source is confirmed here.",
    footerSubmissionLine: "Submitted links are reviewed for accuracy before any status change on this tracker.",
    footerDataSnapshot: "Full dataset snapshot",
    footerSnapshotLine: "{{date}} · {{count}} points — Layer-1 scan + program monitoring on every item.",
    footerDownloadJson: "Download full data (JSON)",
    footerPrintHint: "Use your browser’s Print → Save as PDF for an offline copy of this page.",
    footerPrintBanner: "Nepal Public Commitments Tracker — data snapshot {{date}}",
    dashboardQuickRead: "Expand a card for the short read — deeper sections are optional.",
    tensionIntro: "Live tracker snapshot",
    tensionPubliclyAddressed: "commitments publicly addressed (verified reply published on this tracker).",
    tensionAwaitingIntro: "Awaiting response:",
    tensionAwaitingSuffix: "commitments still listed as awaiting response.",
    tensionNoReplies: "No verified official replies recorded on this tracker yet.",
    scansShort: "19-page scans",
    emotionalHookPublicCommitments: "Public Commitments",
    emotionalHookAddressed: "Addressed",
    emotionalHookAwaiting: "Awaiting Response",
    emotionalHookTagline: "Public commitments should show up in real life.",
    emotionalStripMicro: "Live snapshot — the headline lives in Why it matters below.",
    statsPilotBanner:
      "Beta pilot: empty response counts are expected until verified ministry replies are published. This is not a broken tracker.",
    systemHealthNav: "System health",
    systemHealthTitle: "National system health",
    systemHealthHint:
      "Illustrative bridge between lived reality and the formal agenda — summary lenses, not official government scores.",
    systemHealthLegend:
      "Legend: labels reflect an illustrative citizen-facing view, not formal government ratings or indices.",
    systemHealthCards: [
      {
        sector: "Health",
        level: "critical",
        status: "Critical",
        improvement: "Emergency access, supplies, and frontline staffing stabilised within 12 months.",
      },
      {
        sector: "Roads",
        level: "weak",
        status: "Weak",
        improvement: "Prioritised maintenance and safety fixes on national corridors within 12–24 months.",
      },
      {
        sector: "Jobs",
        level: "critical",
        status: "Critical",
        improvement: "Measurable new formal jobs and social protection coverage within one planning cycle.",
      },
      {
        sector: "Education",
        level: "developing",
        status: "Developing",
        improvement: "Learning outcomes and teacher presence tracked with public reporting each year.",
      },
    ],
    statsSectionEyebrow: "Commitment metrics",
    pointStructuredReview: "Structured accountability review",
    viewOfficialSource: "View official source",
    sourceModalTitle: "Official source & excerpt",
    openScannedPages: "Open 19-page scanned reference",
    navShare: "Share link",
    navShareCopied: "Link copied",
    navShareAria: "Copy site link to share this tracker",
    sourcePendingPrefix: "Interim quote from mapped commitment text (full scan match pending):",
    defaultSourceDocTitle: "Cabinet-approved 100-point reform agenda",
    point: "POINT",
    promise: "Promise (Official):",
    promiseInBrief: "In brief",
    fullOfficialWording: "Full official wording",
    accountabilityQuestion: "Question:",
    whyThisMatters: "Context:",
    possiblePath: "Paths:",
    visualTitle: "Safeguard table",
    visualTitleDelivery: "Delivery performance dashboard (illustrative)",
    deliveryDashboardDisclaimer:
      "Sample rows for discussion — not official government statistics or verified ministry data.",
    deliveryTableMinistry: "Ministry",
    deliveryTableKpi: "KPI",
    deliveryTableTarget: "Target",
    deliveryTableCurrent: "Current",
    deliveryTableGap: "Gap",
    deliveryTableStatus: "Status",
    systemStatusOverviewTitle: "System status overview",
    visualTitleCommitment: "National commitment tracker (illustrative)",
    commitmentTrackerDisclaimer:
      "Sample commitments for discussion — not an official government registry or verified progress data.",
    commitmentTableCommitment: "Commitment",
    commitmentTableMinistry: "Ministry",
    commitmentTableTimeline: "Timeline",
    commitmentTableBudgetLinked: "Budget linked",
    commitmentTableStatus: "Status",
    commitmentTablePercentComplete: "% complete",
    commitmentTableLastUpdated: "Last updated",
    frameworkStatusOverviewTitle: "Framework status overview",
    commitmentFlowTitle: "Commitment flow model",
    visualTitleAmendment: "Constitutional amendment tracker (illustrative)",
    amendmentTrackerDisclaimer:
      "Sample amendment areas for discussion — not an official government process map or verified status.",
    amendmentTableArea: "Amendment area",
    amendmentTablePublicConsultation: "Public consultation",
    amendmentTableDraftPublished: "Draft published",
    amendmentTableReviewCompleted: "Review completed",
    constitutionalReformProcessTitle: "Constitutional reform process (indicative flow)",
    processStatusOverviewTitle: "Process status overview",
    visualTitleInclusion: "Social inclusion monitoring matrix (illustrative)",
    inclusionMatrixDisclaimer:
      "Structured qualitative view — not a KPI dashboard, scorecard, or percent-complete tracker.",
    inclusionTableArea: "Area",
    inclusionTableCurrentRecognition: "Current recognition",
    inclusionTablePolicyMechanism: "Policy mechanism needed",
    inclusionTableMeasurementApproach: "Measurement approach",
    inclusionTablePublicVisibility: "Public visibility",
    inclusionFrameworkStatusTitle: "Inclusion framework status",
    visualTitleCoordination: "Intergovernmental coordination matrix (illustrative)",
    coordinationMatrixDisclaimer:
      "Structure-clarity map — not a KPI dashboard, delivery scorecard, or percent tracker.",
    coordTableFunction: "Function",
    coordTableFederal: "Federal role",
    coordTableProvincial: "Provincial role",
    coordTableLocal: "Local role",
    coordTableMechanism: "Coordination mechanism",
    coordinationSystemStatusTitle: "Coordination system status",
    visualTitleServiceDelivery: "Public service delivery tracker (illustrative)",
    serviceDeliveryTrackerDisclaimer:
      "Sample services for discussion — not verified official turnaround times or government statistics.",
    serviceTableService: "Service",
    serviceTableStandardTime: "Standard time",
    serviceTableActualTime: "Actual time",
    serviceTableGap: "Gap",
    serviceTableMode: "Service mode",
    serviceTableStatus: "Status",
    serviceDeliverySystemStatusTitle: "Service delivery system status",
    illustrativeVisualsSummary: "Illustrative tables & trackers",
    illustrativeVisualsHint:
      "Optional detail — sample dashboards and matrices for discussion, not official government KPIs or verified statistics.",
    area: "Area",
    currentRecognition: "Current Recognition",
    futureNeed: "Future Institutional Need",
    transparencyMechanism: "Public Transparency Mechanism",
    safeguardStrength: "Safeguard Strength",
    visibility: "Public Visibility",
    systemInsight: "Insight:",
    lastUpdated: "Last Updated:",
    simpleHelpTitle: "Simple Meaning:",
    simpleHelpSafeguard:
      "Safeguard Strength means how strong the system protections are in real practice.",
    simpleHelpVisibility:
      "Public Visibility means how easily people can see updates, reports, and evidence.",
    statusAwaiting: "⏳ Waiting for official response",
    statusReview: "Under Review",
    statusAddressed: "Addressed",
    statusNoAction: "No Action",
    current: "Current",
    futureNeedShort: "Future Need",
    transparencyShort: "Transparency",
    legitimacyCheck: "Legitimacy Check",
    neutral: "Neutral",
    sourceBased: "Source-based",
    nonAccusatory: "Non-accusatory",
    responseModalTitle: "Official / Department Response Submission",
    fullName: "Full Name",
    designation: "Designation",
    departmentOffice: "Department / Office",
    officialEmail: "Official Email",
    responseSummary: "Response Summary",
    fileUpload: "File Upload (PDF/DOCX placeholder only)",
    officialCapacity:
      "I confirm this submission is being made in a professional or official capacity.",
    modalNotice:
      "Independent civic prototype: submissions are reviewed before publication for accuracy and verification. Uploading material does not, by itself, confirm official status or authenticity.",
    submissionUnavailableTitle: "Submit a verified public update",
    submissionUnavailableBody:
      "This copy of the site cannot save suggestions until a database or email relay is configured for maintainers.",
    submissionUnavailableMaintainerNote:
      "Maintainers: see .env.example — Supabase (free DB), Formspree or Web3Forms (free email relays), or VITE_SUBMISSION_EMAIL as last resort.",
    submissionMailtoNote:
      "Use the form to suggest updates backed by verifiable public sources (when the database is configured).",
    suggestUpdateButton: "Submit verified public update",
    suggestUpdateButtonHint:
      "Government website, official PDF, news article, or public report — reviewed before it can appear on this point.",
    submissionSendTitle: "Submit a verified public update",
    submissionSendLead:
      "Add a source link and short summary of something already public (not rumour). If it checks out, it may be shown here.",
    submissionFormMeaning:
      "Crowd-sourced leads only: maintainers check the source before any update is shown.",
    commitmentLabel: "Commitment",
    submissionUpdateTypeLabel: "Type of update (required)",
    submissionUpdateTypeOfficial: "Official government response",
    submissionUpdateTypePolicy: "Policy/action implemented",
    submissionUpdateTypeReport: "Public report/data released",
    submissionUpdateTypeCorrection: "Correction",
    submissionDescriptionLabel: "Description (required)",
    submissionDescriptionPlaceholder: "Ministry of X published [report/update] on [date] outlining…",
    submissionSourceLinkLabel: "Source link (required)",
    submissionSourceTypeLabel: "Source type (required)",
    submissionSourceTypeGov: "Government website",
    submissionSourceTypeDoc: "Official document / PDF",
    submissionSourceTypeNews: "News media",
    submissionSourceTypeOther: "Other",
    submissionPublicationDateLabel: "Publication date (required)",
    submissionYourEmail: "Email (optional)",
    submissionVerifyCheckbox: "I confirm this is based on a verifiable public source.",
    submissionFormContinue: "Review before sending",
    submissionFormSubmit: "Submit for review",
    submissionFormSending: "Sending…",
    submissionFormSuccess:
      "Thank you. Your lead has been received and will be reviewed against the source. If verified, it may appear as a public update on this point.",
    submissionFormSuccessMailto:
      "Your email app should open with a draft — send it to finish.\n\nIf a new tab showed a Google search (or nothing happened), your browser is not using a mail app for mailto links. On Windows: Settings → Apps → Default apps → Email — pick Mail, Outlook, or Thunderbird. Close the wrong tab, return here, and tap Submit for review again.",
    submissionConfirmTitle: "Check before you send",
    submissionConfirmLead:
      "Double-check your source link, date, and description. Mistakes are common — a quick look saves time in review.",
    submissionConfirmQuestion: "Are you sure you want to submit this for review?",
    submissionConfirmBack: "Go back and edit",
    submissionFormError: "Could not send. Please try again.",
    submissionDbSaveError: "Could not save. Check your connection or Supabase setup.",
    submissionMessageRequired: "Please enter a description.",
    submissionMessageTooShort: `Please add a bit more detail (at least ${SUBMISSION_MIN_DESCRIPTION_LEN} characters).`,
    submissionSourceRequired: "Please enter a source link.",
    submissionInvalidUrl: "Enter a valid source link (http or https).",
    submissionDateRequired: "Please choose the publication date.",
    submissionDateInvalid:
      "Enter a valid publication date (year, month, and day). Check for extra digits or a wrong month.",
    submissionVerifyRequired: "Please confirm the checkbox to submit.",
    submissionMailtoTooLong: "The message is too long for the mail app. Shorten it or contact the maintainer.",
    submissionReviewNote:
      "Submissions are reviewed for accuracy and source validity before being reflected. This platform does not publish unverified claims.",
    modalDismiss: "Close",
    submit: "Submit",
    expandDetails: "Expand Details",
    expandFullAnalysis: "View full analysis",
    collapseDetails: "Collapse",
    expandTeaser: "More inside: question, context, paths, insight, and optional illustrative tables.",
    layer1ScanLabel: "What this really means",
    layer1ColExpect: "What we should see",
    layer1ColStatus: "Status",
    layer1SharePoint: "Share this",
    layer1CopyQuestion: "Copy question",
    layer1ActionCopied: "Copied",
    layer1ActionCopyFail: "Could not copy",
    layer1ShareFallbackHint: "Link copied — paste to share.",
    viralPunchLine: "Delivery without public proof is just a slogan.",
    siteTopViralHeadlineLine1: "100 Government Promises.",
    siteTopViralHeadlineLine2: "Can You See Even One Result?",
    siteTopHookLine1: "Every promise sounds good.",
    siteTopHookLine2: "Without public proof, it's just words.",
    nepalAamaLabel: "Mother Nepal — public proof gauge",
    nepalAamaCritical: "Status: Critical",
    nepalAamaDisclaimer:
      "Civic metaphor: visible, verifiable delivery on these pledges is still missing in one public place — not a medical diagnosis.",
    heroCtaShare: "Share this — demand public proof",
    cardScreenshotHeadline: "📍 POINT #{{n}} — No public proof on file yet",
    pmoSectionTitle: "Program monitoring (PMO-style)",
    pmoSectionHint:
      "Derived from the cabinet text — who should own delivery, by when, how to measure proof, what can block it, and what citizens can do next.",
    pmoOwnerTitle: "Owner & accountability",
    pmoPrimaryOwners: "Ministries / agencies",
    pmoCoordinatingOffice: "Coordinating office",
    pmoAccountableRoles: "Responsible roles (from agenda)",
    pmoTimelineTitle: "Timeline & milestones",
    pmoTimelineSummary: "Expected window",
    pmoMilestonesLabel: "Milestones to verify",
    pmoKpiTitle: "KPIs / proof checks",
    pmoKpiMetric: "Metric",
    pmoKpiHow: "How we’d verify",
    pmoRisksTitle: "Risks",
    pmoEscalationTitle: "If proof stays missing — escalation paths",
    pmoDeliveryStatusTitle: "Evidence-based status",
    pmoCitizenSnapshotTitle: "At a glance — public proof",
    pmoCitizenSnapshotHint: "Scan the lights: green = on track, yellow = needs proof, red = blocked or missing.",
    pmoLegendShort: "Green · Yellow · Red",
    pmoSnapshotSeeLayer1:
      "Line-by-line checks are already in the Quick scan table above — not repeated here to avoid duplication.",
    pmoPublicRecordTitle: "Public record (this tracker)",
    pmoPublicRecordBody:
      "Mar 2026 — no verified update · Apr 2026 — no verified update · An empty log keeps pressure visible until someone files proof.",
    pmoEscalationTriggerNote:
      "If there is still no verified public update after ~90 days, this entry stays on the public record — share it and ask again.",
    pmoDependencyChainNote:
      "Typical chain: agencies → data → report → public proof. A red row usually means an earlier link is still weak.",
    pmoFullDetailToggle: "Full accountability detail",
    pmoFullDetailHint: "Owners, KPIs, milestones, risks — for media, researchers, and officials",
    spotlightSectionLabel: "Spotlight",
    spotlightCardBadge: "One pledge to screenshot & share first — then explore all 100.",
    weeklyTop5Title: "Top 5 Questions This Week",
    weeklyTop5Lead:
      "A quick read on points 1–5. All 100 pledges matter — this is a simple entry point for busy readers.",
    weeklyTop5Jump: "Jump to point #1",
    globalViralSubline:
      "All 100 promises come from the official cabinet agenda — with links to the scanned pages. Click any promise to read the full question and context. Use Share or Copy if you want others to see it.",
    viewSource: "View Source",
    dashboardDisclaimer:
      "Independent, research-based civic-tech — not a government body, audit, or party project. For clarity and public dialogue.",
    dashboardFilterHint:
      "Section, status, and search combine (all must match). Every point is “Awaiting Response” until a verified update is published — so status alone should list all 100 unless another filter is set.",
    filterSearchPlaceholder: "Search by keyword…",
    filterAllSections: "All sections (full 100)",
    filterSectionAria: "Cabinet agenda section by point range",
    filterAllStatuses: "All statuses",
    filterSortAsc: "Point number: low → high",
    filterSortDesc: "Point number: high → low",
    agendaSectionJump: "Jump to section",
    agendaSectionRange: "Points {{start}}–{{end}}",
    agendaSectionShown: "{{count}} shown",
    agendaSectionHint:
      "Open one section at a time to reduce scrolling — matches Cabinet headings (क … ठ) by point range.",
    agendaSectionEmpty: "No points in this section match your filters.",
    filteredResultsOne: "1 point matches your search and filters.",
    filteredResultsMany: "{{count}} points match your search and filters.",
    filteredResultsEmpty: "No points match your search and filters.",
    filterActiveLabel: "Active filters",
    filterActiveSearchPrefix: "Search",
    introTitle: "Cabinet 100-point agenda",
    introLead:
      "Browse all commitments in English or Nepali using the header toggle. Each point links to scanned source pages. Independent reference site — not an official government publication.",
    mainSectionTitle: "Explore all 100 commitments",
    navScans: "Scanned pages",
    dashboardUseHint: "Search, filter, sort, and expand individual points.",
  },
  ne: {
    platformTitle: "नेपाल सार्वजनिक प्रतिबद्धता ट्र्याकर",
    home: "गृहपृष्ठ",
    dashboard: "ड्यासबोर्ड",
    sources: "स्रोतहरू",
    methodology: "कार्यविधि",
    about: "हाम्रो बारेमा",
    projectNav: "परियोजनाबारे",
    betaLabel: "बिटा",
    launchTagline: "सार्वजनिक प्रतिबद्धता बुझ्न नागरिक दृष्टिकोण",
    phaseLabel: "चरण १ · मन्त्रिपरिषद् १००-बुँदे एजेन्डा म्यापिङ",
    siteLastUpdated: CABINET_DATA_SNAPSHOT_LABEL_NE,
    lastUpdatedTop: "अन्तिम अद्यावधिक",
    heroTitle: "नेपाल सार्वजनिक प्रतिबद्धता ट्र्याकर",
    heroMeaningTitle: "नेपाल आमा र राष्ट्रको अवस्था",
    heroProductName: "नेपाल सार्वजनिक प्रतिबद्धता ट्र्याकर",
    heroAuthority:
      "मन्त्रिपरिषद् सूचीका १०० प्रतिबद्धता — प्रत्येकमा स्रोत सन्दर्भ, संरचित प्रश्न, र प्रमाणित भएपछि सार्वजनिक प्रतिक्रियाको माध्यम।",
    heroSubtitle: "",
    heroMeta:
      "स्वतन्त्र नागरिक अनुसन्धान उपकरण — सरकारी लेखापरीक्षण वा दलगत परियोजना होइन। सार्वजनिक रूपमा कागजातीकृत मन्त्रिपरिषद् प्रतिबद्धता र खुला अभिलेखमा आधारित।",
    forCitizensNav: "नागरिकका लागि",
    forCitizensTitle: "यो किन महत्वपूर्ण",
    forCitizensBullets: [
      "सेवा, रोजगार, सडक, स्वास्थ्य, विद्यालय — प्रतिबद्धता जीवनमा देखिनुपर्छ।",
      "प्रमाणसहितको तथ्य, हल्लाको सट्टा।",
      "खुला ट्र्याकिङ: प्रतिक्षा → समीक्षा → सम्बोधन।",
    ],
    purposeTitle: "यसले कसरी काम गर्छ",
    purposeCards: [
      { title: "प्रतिबद्धता", text: "आधिकारिक शब्द, बुँदागत रूपमा।" },
      { title: "प्रश्न", text: "कार्यान्वयन र पारदर्शिता — नारामात्र।" },
      { title: "सन्दर्भ", text: "छोटो: किन महत्वपूर्ण।" },
      { title: "मार्ग", text: "अगाडिका कदम, रचनात्मक।" },
      { title: "स्थिति", text: "ट्र्याकरमा प्रतिक्रिया प्रक्रिया।" },
    ],
    viewDashboard: "ड्यासबोर्ड हेर्नुहोस्",
    heroSubmitNote:
      "गम्भीर माध्यम — प्रकाशन अघि शुद्धता र प्रमाणीकरणका लागि समीक्षा हुन्छ (साधारण टिप्पणी बाकस होइन)।",
    statsTotal: "कुल बुँदा",
    statsVerified: "सम्बोधन भएको",
    statsReview: "समीक्षामा",
    statsAwaiting: "प्रतिक्रिया प्रतिक्षा",
    statsLastUpdate: "अन्तिम अद्यावधिक",
    publicResponseNotAvailable: "सार्वजनिक प्रतिक्रिया डेटा: अहिले उपलब्ध छैन — बिटा पाइलट चरण।",
    responsesInReviewNote: "केही बुँदा समीक्षामा हुन सक्छन्; प्रमाणित प्रकाशन बाँकी।",
    responseProgressLabel: "प्रमाणित प्रतिक्रिया प्रकाशित भएका बुँदा",
    projectAboutTitle: "यो परियोजनाबारे",
    projectAboutParagraphs: [
      "यो स्वतन्त्र, अनुसन्धान-आधारित नागरिक-प्रविधि प्रोटोटाइप हो — सार्वजनिक रूपमा घोषित प्रतिबद्धता र तिनको वास्तविक जीवनमा कार्यान्वयन बुझ्न नागरिकलाई मद्दत गर्न।",
      "यसले कुनै सरकारी निकाय, राजनीतिक समूह वा आधिकारिक लेखापरीक्षण अधिकारको प्रतिनिधित्व गर्दैन।",
      "लक्ष्य पारदर्शिता, बुझाइ र रचनात्मक संवाद हो।",
    ],
    footerTagline: "सार्वजनिक प्रतिबद्धता बुझ्न नागरिक दृष्टिकोण — आधिकारिक लेखापरीक्षण होइन।",
    footerIdentity: "स्वतन्त्र, नागरिक नेतृत्वको अनुसन्धानात्मक पहल।",
    footerTrustLine:
      "यो सरकारी साइट होइन। प्रमाणित सार्वजनिक स्रोत नपुगेसम्म बुँदा «प्रतिक्रिया प्रतीक्षा» मा रहन्छ।",
    footerSubmissionLine: "पेश गरिएका लिंक शुद्धता जाँचपछि मात्र यहाँ स्थिति बदलिन्छ।",
    footerDataSnapshot: "पूर्ण डेटा स्न्यापसोट",
    footerSnapshotLine: "{{date}} · {{count}} बुँदा — प्रत्येकमा लेयर-१ स्क्यान र कार्यक्रम निगरानी।",
    footerDownloadJson: "पूर्ण डेटा डाउनलोड (JSON)",
    footerPrintHint: "अफलाइन प्रतिलिपिका लागि ब्राउजरको प्रिन्ट → PDF मा सेभ प्रयोग गर्नुहोस्।",
    footerPrintBanner: "नेपाल सार्वजनिक प्रतिबद्धता ट्र्याकर — डेटा स्न्यापसोट {{date}}",
    dashboardQuickRead: "छोटो पढाइका लागि बुँदा विस्तार गर्नुहोस् — गहिरो खण्ड वैकल्पिक छन्।",
    tensionIntro: "ट्र्याकर स्थिति (प्रत्यक्ष)",
    tensionPubliclyAddressed: "बुँदामा यस ट्र्याकरमा प्रमाणित प्रतिक्रिया प्रकाशित।",
    tensionAwaitingIntro: "प्रतिक्रिया प्रतिक्षामा:",
    tensionAwaitingSuffix: "बुँदा अझै सूचीकृत।",
    tensionNoReplies: "यस ट्र्याकरमा अहिलेसम्म प्रमाणित आधिकारिक प्रतिक्रिया दर्ता छैन।",
    scansShort: "१९ पृष्ठ स्क्यान",
    emotionalHookPublicCommitments: "सार्वजनिक प्रतिबद्धता",
    emotionalHookAddressed: "सम्बोधन",
    emotionalHookAwaiting: "प्रतिक्षामा",
    emotionalHookTagline: "सार्वजनिक प्रतिबद्धता वास्तविक जीवनमा देखिनुपर्छ।",
    emotionalStripMicro: "प्रत्यक्ष गणना — मुख्य सन्देश तल “यो किन महत्वपूर्ण” मा छ।",
    statsPilotBanner:
      "बिटा पाइलट: प्रमाणित मन्त्रालय प्रतिक्रिया नआउँदा खाली गणना सामान्य हो। ट्र्याकर बिग्रेको होइन।",
    systemHealthNav: "प्रणाली स्वास्थ्य",
    systemHealthTitle: "राष्ट्रिय प्रणाली स्वास्थ्य",
    systemHealthHint:
      "दैनिक अनुभव र औपचारिक एजेन्डाबीचको दृष्टान्त — सारांश दृष्टिकोण मात्र, सरकारी मूल्याङ्कन होइन।",
    systemHealthLegend:
      "स्पष्टीकरण: यी स्तर नागरिक दृष्टिकोणका दृष्टान्त हुन् — आधिकारिक सरकारी मूल्याङ्कन वा सूचकांक होइनन्।",
    systemHealthCards: [
      {
        sector: "स्वास्थ्य",
        level: "critical",
        status: "गम्भीर",
        improvement: "१२ महिनाभित्र आपतकालीन पहुँच, औषधि र अग्रपङ्क्ति कर्मचारी स्थिर।",
      },
      {
        sector: "सडक",
        level: "weak",
        status: "कमजोर",
        improvement: "१२–२४ महिनाभित्र मुख्य राजमार्गमा मर्मत र सुरक्षा प्राथमिकता।",
      },
      {
        sector: "रोजगार",
        level: "critical",
        status: "गम्भीर",
        improvement: "एक योजना चक्रभित्र मापयोग्य औपचारिक रोजगार र सामाजिक सुरक्षा विस्तार।",
      },
      {
        sector: "शिक्षा",
        level: "developing",
        status: "विकासोन्मुख",
        improvement: "सिकाइ नतिजा र शिक्षक उपस्थिति सार्वजनिक प्रतिवेदनसहित वार्षिक ट्र्याक।",
      },
    ],
    statsSectionEyebrow: "प्रतिबद्धता मेट्रिक्स",
    pointStructuredReview: "संरचित जवाफदेहिता समीक्षा",
    viewOfficialSource: "आधिकारिक स्रोत हेर्नुहोस्",
    sourceModalTitle: "आधिकारिक स्रोत र अंश",
    openScannedPages: "१९-पृष्ठ स्क्यान सन्दर्भ खोल्नुहोस्",
    navShare: "लिंक साझेदारी",
    navShareCopied: "लिंक प्रतिलिपि भयो",
    navShareAria: "यो ट्र्याकर साझेदारी गर्न लिंक प्रतिलिपि गर्नुहोस्",
    sourcePendingPrefix: "म्याप गरिएको प्रतिबद्धता पाठ (पूर्ण स्क्यान मिलान बाँकी):",
    defaultSourceDocTitle: "मन्त्रिपरिषद्बाट स्वीकृत १००-बुँदे सुधार एजेन्डा",
    point: "बुँदा",
    promise: "प्रतिबद्धता (आधिकारिक):",
    promiseInBrief: "संक्षेपमा",
    fullOfficialWording: "पूर्ण आधिकारिक मन्त्रिपरिषद् शब्द",
    accountabilityQuestion: "प्रश्न:",
    whyThisMatters: "सन्दर्भ:",
    possiblePath: "मार्ग:",
    visualTitle: "सुरक्षा तालिका",
    visualTitleDelivery: "वितरण प्रदर्शन ड्यासबोर्ड (दृष्टान्त)",
    deliveryDashboardDisclaimer:
      "छलफलका लागि नमूना पङ्क्तिहरू — आधिकारिक सरकारी तथ्याङ्क वा प्रमाणित मन्त्रालय डेटा होइन।",
    deliveryTableMinistry: "मन्त्रालय",
    deliveryTableKpi: "सूचकांक (KPI)",
    deliveryTableTarget: "लक्ष्य",
    deliveryTableCurrent: "हाल",
    deliveryTableGap: "अन्तर",
    deliveryTableStatus: "स्थिति",
    systemStatusOverviewTitle: "प्रणाली स्थिति सारांश",
    visualTitleCommitment: "राष्ट्रिय प्रतिबद्धता ट्र्याकर (दृष्टान्त)",
    commitmentTrackerDisclaimer:
      "छलफलका लागि नमूना प्रतिबद्धताहरू — आधिकारिक सरकारी दर्ता वा प्रमाणित प्रगति डेटा होइन।",
    commitmentTableCommitment: "प्रतिबद्धता",
    commitmentTableMinistry: "मन्त्रालय",
    commitmentTableTimeline: "समयरेखा",
    commitmentTableBudgetLinked: "बजेट जोडिएको",
    commitmentTableStatus: "स्थिति",
    commitmentTablePercentComplete: "% पूर्ण",
    commitmentTableLastUpdated: "अन्तिम अद्यावधिक",
    frameworkStatusOverviewTitle: "संरचना स्थिति सारांश",
    commitmentFlowTitle: "प्रतिबद्धता प्रवाह नमूना",
    visualTitleAmendment: "संवैधानिक संशोधन ट्र्याकर (दृष्टान्त)",
    amendmentTrackerDisclaimer:
      "छलफलका लागि नमूना संशोधन क्षेत्रहरू — आधिकारिक सरकारी प्रक्रिया नक्सा वा प्रमाणित स्थिति होइन।",
    amendmentTableArea: "संशोधन क्षेत्र",
    amendmentTablePublicConsultation: "सार्वजनिक परामर्श",
    amendmentTableDraftPublished: "मस्यौदा प्रकाशित",
    amendmentTableReviewCompleted: "समीक्षा पूर्ण",
    constitutionalReformProcessTitle: "संवैधानिक सुधार प्रक्रिया (दृष्टान्त प्रवाह)",
    processStatusOverviewTitle: "प्रक्रिया स्थिति सारांश",
    visualTitleInclusion: "सामाजिक समावेश निगरानी म्याट्रिक्स (दृष्टान्त)",
    inclusionMatrixDisclaimer:
      "संरचित गुणात्मक दृष्टिकोण — KPI ड्यासबोर्ड, स्कोरकार्ड वा प्रतिशत-पूर्ण ट्र्याकर होइन।",
    inclusionTableArea: "क्षेत्र",
    inclusionTableCurrentRecognition: "हालको मान्यता",
    inclusionTablePolicyMechanism: "आवश्यक नीति संयन्त्र",
    inclusionTableMeasurementApproach: "मापन दृष्टिकोण",
    inclusionTablePublicVisibility: "सार्वजनिक दृश्यता",
    inclusionFrameworkStatusTitle: "समावेश संरचना स्थिति",
    visualTitleCoordination: "अन्तरसरकारी समन्वय म्याट्रिक्स (दृष्टान्त)",
    coordinationMatrixDisclaimer:
      "संरचना-स्पष्टता नक्सा — KPI ड्यासबोर्ड, वितरण स्कोरकार्ड वा प्रतिशत ट्र्याकर होइन।",
    coordTableFunction: "कार्यक्षेत्र",
    coordTableFederal: "संघीय भूमिका",
    coordTableProvincial: "प्रदेशीय भूमिका",
    coordTableLocal: "स्थानीय भूमिका",
    coordTableMechanism: "समन्वय संयन्त्र",
    coordinationSystemStatusTitle: "समन्वय प्रणाली स्थिति",
    visualTitleServiceDelivery: "सार्वजनिक सेवा वितरण ट्र्याकर (दृष्टान्त)",
    serviceDeliveryTrackerDisclaimer:
      "छलफलका लागि नमूना सेवाहरू — प्रमाणित आधिकारिक समय वा सरकारी तथ्याङ्क होइन।",
    serviceTableService: "सेवा",
    serviceTableStandardTime: "मानक समय",
    serviceTableActualTime: "वास्तविक समय",
    serviceTableGap: "अन्तर",
    serviceTableMode: "सेवा प्रणाली",
    serviceTableStatus: "स्थिति",
    serviceDeliverySystemStatusTitle: "सेवा वितरण प्रणाली स्थिति",
    illustrativeVisualsSummary: "दृष्टान्त तालिका र ट्र्याकर",
    illustrativeVisualsHint:
      "वैकल्पिक विवरण — छलफलका लागि नमूना ड्यासबोर्ड र म्याट्रिक्स; आधिकारिक सरकारी KPI वा प्रमाणित तथ्याङ्क होइन।",
    area: "क्षेत्र",
    currentRecognition: "हालको मान्यता",
    futureNeed: "भविष्यको संस्थागत आवश्यकता",
    transparencyMechanism: "सार्वजनिक पारदर्शिता संयन्त्र",
    safeguardStrength: "सुरक्षा संरचना बल",
    visibility: "सार्वजनिक दृश्यता",
    systemInsight: "अन्तरदृष्टि:",
    lastUpdated: "अन्तिम अद्यावधिक:",
    simpleHelpTitle: "सरल अर्थ:",
    simpleHelpSafeguard:
      "सुरक्षा संरचना बल भनेको प्रणालीका सुरक्षात्मक व्यवस्था व्यवहारमा कति बलियो छन् भन्ने हो।",
    simpleHelpVisibility:
      "सार्वजनिक दृश्यता भनेको नागरिकले अद्यावधिक, प्रतिवेदन र प्रमाण कति सजिलै देख्न सक्छन् भन्ने हो।",
    statusAwaiting: "⏳ आधिकारिक प्रतिक्रियाको प्रतीक्षा",
    statusReview: "समीक्षामा",
    statusAddressed: "सम्बोधन गरिएको",
    statusNoAction: "कुनै कार्यवाही छैन",
    current: "हालको अवस्था",
    futureNeedShort: "भविष्य आवश्यकता",
    transparencyShort: "पारदर्शिता",
    legitimacyCheck: "वैधता जाँच",
    neutral: "तटस्थ",
    sourceBased: "स्रोतमा आधारित",
    nonAccusatory: "आरोप-रहित",
    responseModalTitle: "आधिकारिक / विभागीय प्रतिक्रिया पेश गर्ने फारम",
    fullName: "पूरा नाम",
    designation: "पदनाम",
    departmentOffice: "विभाग / कार्यालय",
    officialEmail: "आधिकारिक इमेल",
    responseSummary: "प्रतिक्रिया सारांश",
    fileUpload: "फाइल अपलोड (PDF/DOCX placeholder only)",
    officialCapacity:
      "म यो पेश्की व्यावसायिक वा आधिकारिक हैसियतमा गरिएको हो भन्ने पुष्टि गर्छु।",
    modalNotice:
      "स्वतन्त्र नागरिक प्रोटोटाइप: प्रकाशन अघि शुद्धता र प्रमाणीकरणका लागि पेश गरिएका सामग्री समीक्षा गरिन्छन्। अपलोड मात्रले आधिकारिक हैसियत वा प्रामाणिकता स्वतः पुष्टि गर्दैन।",
    submissionUnavailableTitle: "प्रमाणित सार्वजनिक अद्यावधिक पेश गर्नुहोस्",
    submissionUnavailableBody:
      "सञ्चालकले डेटाबेस वा इमेल रिले नसम्मेलन गरेसम्म यो प्रतिलिपिले सुझाव बचत गर्न सक्दैन।",
    submissionUnavailableMaintainerNote:
      "सञ्चालक: .env.example हेर्नुहोस् — Supabase (निःशुल्क DB), Formspree वा Web3Forms (निःशुल्क इमेल रिले), वा अन्तिम विकल्प VITE_SUBMISSION_EMAIL।",
    submissionMailtoNote:
      "प्रमाणित हुन सक्ने सार्वजनिक स्रोतका सुझाव फारमबाट (डेटाबेस सेट भएमा)।",
    suggestUpdateButton: "प्रमाणित सार्वजनिक अद्यावधिक पेश गर्नुहोस्",
    suggestUpdateButtonHint:
      "सरकारी साइट, आधिकारिक PDF, समाचार वा सार्वजनिक प्रतिवेदन — प्रकाशन अघि समीक्षा हुन्छ।",
    submissionSendTitle: "प्रमाणित सार्वजनिक अद्यावधिक पेश गर्नुहोस्",
    submissionSendLead:
      "पहिले नै सार्वजनिक भएको कुराको लिङ्क र छोटो सारांश दिनुहोस् (अफवाह होइन)। प्रमाणित भए मात्र यहाँ देखिन सक्छ।",
    submissionFormMeaning:
      "नागरिकबाट सुझाइएका सुराग मात्र: स्रोत जाँचपछि मात्र अद्यावधिक देखाइन्छ।",
    commitmentLabel: "प्रतिबद्धता",
    submissionUpdateTypeLabel: "अद्यावधिकको प्रकार (आवश्यक)",
    submissionUpdateTypeOfficial: "सरकारी आधिकारिक प्रतिक्रिया",
    submissionUpdateTypePolicy: "नीति / कार्यान्वयन",
    submissionUpdateTypeReport: "सार्वजनिक प्रतिवेदन वा डेटा सार्वजनिक",
    submissionUpdateTypeCorrection: "सच्याउने जानकारी",
    submissionDescriptionLabel: "विवरण (आवश्यक)",
    submissionDescriptionPlaceholder:
      "X मन्त्रालयले [मिति] मा [प्रतिवेदन/अद्यावधिक] प्रकाशन गरी … समेटेको छ।",
    submissionSourceLinkLabel: "स्रोत लिङ्क (आवश्यक)",
    submissionSourceTypeLabel: "स्रोतको प्रकार (आवश्यक)",
    submissionSourceTypeGov: "सरकारी वेबसाइट",
    submissionSourceTypeDoc: "आधिकारिक कागजात / PDF",
    submissionSourceTypeNews: "समाचार माध्यम",
    submissionSourceTypeOther: "अन्य",
    submissionPublicationDateLabel: "प्रकाशन मिति (आवश्यक)",
    submissionYourEmail: "इमेल (वैकल्पिक)",
    submissionVerifyCheckbox: "म यो जानकारी प्रमाणित हुन सक्ने सार्वजनिक स्रोतमा आधारित छ भनी पुष्टि गर्छु।",
    submissionFormContinue: "पठाउनु अघि पुनः जाँच",
    submissionFormSubmit: "समीक्षाका लागि पेश गर्नुहोस्",
    submissionFormSending: "पठाइँदै…",
    submissionFormSuccess:
      "धन्यवाद। तपाईंको सुराग प्राप्त भयो र स्रोतसँग मिलाएर समीक्षा गरिनेछ। प्रमाणित भएमा यस बुँदामा सार्वजनिक अद्यावधिकका रूपमा देखिन सक्छ।",
    submissionFormSuccessMailto:
      "इमेल एपमा मस्यौदा खुल्नुपर्छ — पठाएर पूरा गर्नुहोस्।\n\nनयाँ ट्याबमा Google खोज देखियो वा केही नभएमा ब्राउजरले mailto लिङ्कलाई इमेल एपमा पठाएको छैन। Windows: सेटिङ → एप → पूर्वनिर्धारित एप → इमेल — Mail, Outlook वा Thunderbird छान्नुहोस्। गलत ट्याब बन्द गरी यहाँ फर्केर फेरि पेश गर्नुहोस्।",
    submissionConfirmTitle: "पठाउनु अघि जाँच गर्नुहोस्",
    submissionConfirmLead:
      "स्रोत लिङ्क, मिति र विवरण फेरि एक पटक हेर्नुहोस्। गल्ती सामान्य छ — छोटो जाँचले समीक्षा सजिलो बनाउँछ।",
    submissionConfirmQuestion: "यो समीक्षाका लागि पेश गर्न निश्चित हुनुहुन्छ?",
    submissionConfirmBack: "फर्केर सम्पादन गर्नुहोस्",
    submissionFormError: "पठाउन सकिएन। फेरि प्रयास गर्नुहोस्।",
    submissionDbSaveError: "बचत हुन सकेन। जडान वा Supabase सेटअप जाँच गर्नुहोस्।",
    submissionMessageRequired: "विवरण लेख्नुहोस्।",
    submissionMessageTooShort: `अलि बढी विवरण लेख्नुहोस् (कम्तिमा ${SUBMISSION_MIN_DESCRIPTION_LEN} अक्षर)।`,
    submissionSourceRequired: "स्रोत लिङ्क राख्नुहोस्।",
    submissionInvalidUrl: "मान्य स्रोत लिङ्क राख्नुहोस् (http वा https)।",
    submissionDateRequired: "प्रकाशन मिति छान्नुहोस्।",
    submissionDateInvalid:
      "मान्य प्रकाशन मिति राख्नुहोस् (वर्ष, महिना, दिन)। थप अंक वा गलत महिना छ कि जाँच गर्नुहोस्।",
    submissionVerifyRequired: "पेश गर्न पुष्टिकरण बाकस टिक गर्नुहोस्।",
    submissionMailtoTooLong: "इमेल एपका लागि सन्देश लामो छ। छोट्याउनुहोस् वा सञ्चालकलाई सम्पर्क गर्नुहोस्।",
    submissionReviewNote:
      "पेश गरिएका सामग्री प्रतिबिम्बित हुनुअघि शुद्धता र स्रोतको वैधताका लागि समीक्षा गरिन्छ। यो मञ्चले प्रमाणित नभएका दाबी प्रकाशित गर्दैन।",
    modalDismiss: "बन्द गर्नुहोस्",
    submit: "पेश गर्नुहोस्",
    expandDetails: "विवरण विस्तार गर्नुहोस्",
    expandFullAnalysis: "पूर्ण विश्लेषण हेर्नुहोस्",
    collapseDetails: "संक्षिप्त गर्नुहोस्",
    expandTeaser: "थप: प्रश्न, सन्दर्भ, मार्ग, अन्तरदृष्टि र वैकल्पिक दृष्टान्त तालिका।",
    layer1ScanLabel: "वास्तवमा यसको अर्थ",
    layer1ColExpect: "के देखिनुपर्छ",
    layer1ColStatus: "स्थिति",
    layer1SharePoint: "साझेदारी गर्नुहोस्",
    layer1CopyQuestion: "प्रश्न प्रतिलिपि",
    layer1ActionCopied: "प्रतिलिपि भयो",
    layer1ActionCopyFail: "प्रतिलिपि हुन सकेन",
    layer1ShareFallbackHint: "लिंक प्रतिलिपि भयो — साझेदारी गर्न पेस्ट गर्नुहोस्।",
    viralPunchLine: "सार्वजनिक प्रमाण बिना वितरण नारा मात्र हो।",
    siteTopViralHeadlineLine1: "१०० सरकारी वाचाहरू।",
    siteTopViralHeadlineLine2: "एउटा पनि नतिजा स्पष्ट देख्नुभयो?",
    siteTopHookLine1: "हरेक वाचा राम्रो सुनिन्छ।",
    siteTopHookLine2: "सार्वजनिक प्रमाण बिना, त्यो शब्द मात्र हो।",
    nepalAamaLabel: "नेपाल आमा — जन प्रमाणको मिटर",
    nepalAamaCritical: "स्थिति: गम्भीर",
    nepalAamaDisclaimer:
      "नागरिक प्रतीकात्मक भाषा: यी वाचाहरूको प्रमाणित नतिजा एक ठाउँमा सार्वजनिक देखिँदैन — यो चिकित्सकीय निदान होइन।",
    heroCtaShare: "साझेदारी गर्नुहोस् — सार्वजनिक प्रमाण माग्नुहोस्",
    cardScreenshotHeadline: "📍 बुँदा #{{n}} — अहिलेसम्म सार्वजनिक प्रमाण दर्ता छैन",
    pmoSectionTitle: "कार्यक्रम निगरानी (PMO शैली)",
    pmoSectionHint:
      "मन्त्रिपरिषद् पाठबाट — कसले वितरण गर्छ, कहिलेसम्म, प्रमाण कसरी मापन गर्ने, के अवरोध हुन सक्छ, नागरिकले अर्को के गर्न सक्छन्।",
    pmoOwnerTitle: "जिम्मेवारी र मालिकाना",
    pmoPrimaryOwners: "मन्त्रालय / निकाय",
    pmoCoordinatingOffice: "समन्वय कार्यालय",
    pmoAccountableRoles: "जिम्मेवार भूमिका (एजेन्डाअनुसार)",
    pmoTimelineTitle: "समयसीमा र कोसेढुङ्गा",
    pmoTimelineSummary: "अपेक्षित अवधि",
    pmoMilestonesLabel: "प्रमाणित गर्नुपर्ने कोसेढुङ्गा",
    pmoKpiTitle: "KPI / प्रमाण जाँच",
    pmoKpiMetric: "सूचक",
    pmoKpiHow: "कसरी प्रमाणित गर्ने",
    pmoRisksTitle: "जोखिम",
    pmoEscalationTitle: "प्रमाण नआएमा — अगाडि बढ्ने बाटाहरू",
    pmoDeliveryStatusTitle: "प्रमाणमा आधारित स्थिति",
    pmoCitizenSnapshotTitle: "एउटै नजरमा — सार्वजनिक प्रमाण",
    pmoCitizenSnapshotHint: "बत्ती हेर्नुहोस्: हरियो = मार्गमा, पहेँलो = प्रमाण चाहिन्छ, रातो = अवरोध वा छैन।",
    pmoLegendShort: "हरियो · पहेँलो · रातो",
    pmoSnapshotSeeLayer1:
      "पङ्क्तिगत जाँच माथिको छिटो स्क्यान तालिकामा नै छ — दोहोरो नहोस् भनेर यहाँ दोहराइँदैन।",
    pmoPublicRecordTitle: "सार्वजनिक अभिलेख (यो ट्र्याकर)",
    pmoPublicRecordBody:
      "२०२६ मार्च — प्रमाणित अद्यावधिक छैन · २०२६ अप्रिल — प्रमाणित अद्यावधिक छैन · खाली अभिलेखले प्रमाण नआउन्जेल दबाब देखाइरहन्छ।",
    pmoEscalationTriggerNote:
      "लगभग ९० दिनसम्म पनि प्रमाणित सार्वजनिक अद्यावधिक नआए यो दर्ता सार्वजनिक रेकर्डमै रहन्छ — साझेदारी गरी फेरि सोध्नुहोस्।",
    pmoDependencyChainNote:
      "सामान्य साङ्लो: निकाय → डेटा → प्रतिवेदन → सार्वजनिक प्रमाण। माथिल्लो कडी कमजोर भए प्रायः रातो देखिन्छ।",
    pmoFullDetailToggle: "पूर्ण जवाफदेहित विवरण",
    pmoFullDetailHint: "मालिक, KPI, कोसेढुङ्गा, जोखिम — सञ्चार, अनुसन्धान र अधिकारीका लागि",
    spotlightSectionLabel: "स्पटलाइट",
    spotlightCardBadge: "पहिले साझेदारी गर्न लायक एउटा वाचा — अनि सबै १०० अन्वेषण गर्नुहोस्।",
    weeklyTop5Title: "यो हप्ताका शीर्ष ५ प्रश्न",
    weeklyTop5Lead:
      "बुँदा १–५ को छिटो पढाइ। सबै १०० वाचा महत्त्वपूर्ण — व्यस्त पाठकका लागि सुरुवाती झलक मात्र।",
    weeklyTop5Jump: "बुँदा #१ मा जानुहोस्",
    globalViralSubline:
      "यहाँका १०० वाचाहरू आधिकारिक मन्त्रिपरिषद् एजेन्डाबाटै — स्क्यान गरिएका पृष्ठहरूमा लिंकसहित। कुनै पनि वाचामा क्लिक गरी पूर्ण प्रश्न र संदर्भ पढ्नुहोस्। अरूले देखुन् भने साझेदारी वा प्रतिलिपि प्रयोग गर्नुहोस्।",
    viewSource: "स्रोत हेर्नुहोस्",
    dashboardDisclaimer:
      "स्वतन्त्र, अनुसन्धान-आधारित नागरिक-प्रविधि — सरकारी निकाय, लेखापरीक्षण वा दलगत परियोजना होइन। स्पष्टता र सार्वजनिक संवादका लागि।",
    dashboardFilterHint:
      "खण्ड, स्थिति र खोज एकसाथ लागू हुन्छन् (सबै मिल्नुपर्छ)। प्रमाणित अद्यावधिक नआउन्जेल सबै बुँदा «प्रतिक्रिया प्रतीक्षा» मा छन् — अरू फिल्टर नभए स्थिति मात्रले १०० देखाउँछ।",
    filterSearchPlaceholder: "शब्द खोज्नुहोस्…",
    filterAllSections: "सबै खण्ड (१०० बुँदा)",
    filterSectionAria: "बुँदा दायराअनुसार मन्त्रिपरिषद् खण्ड",
    filterAllStatuses: "सबै स्थिति",
    filterSortAsc: "बुँदा नम्बर: सानो → ठूलो",
    filterSortDesc: "बुँदा नम्बर: ठूलो → सानो",
    agendaSectionJump: "खण्डमा जानुहोस्",
    agendaSectionRange: "बुँदा {{start}}–{{end}}",
    agendaSectionShown: "{{count}} देखाइएको",
    agendaSectionHint:
      "लामो स्क्रोल कम गर्न एउटै खण्ड खोल्नुहोस् — बुँदा दायराअनुसार मन्त्रिपरिषद् खण्ड (क … ठ)।",
    agendaSectionEmpty: "यो खण्डमा तपाईंको फिल्टर मिल्ने बुँदा छैन।",
    filteredResultsOne: "तपाईंको खोज र फिल्टरसँग १ बुँदा मिल्यो।",
    filteredResultsMany: "तपाईंको खोज र फिल्टरसँग {{count}} बुँदा मिले।",
    filteredResultsEmpty: "तपाईंको खोज र फिल्टरसँग कुनै बुँदा मिलेन।",
    filterActiveLabel: "सक्रिय फिल्टर",
    filterActiveSearchPrefix: "खोज",
    introTitle: "मन्त्रिपरिषद् १००-बुँदे एजेन्डा",
    introLead:
      "हेडरको भाषा टगलले अङ्ग्रेजी वा नेपालीमा हेर्नुहोस्। प्रत्येक बुँदामा स्क्यान गरिएका स्रोत पृष्ठहरू। स्वतन्त्र सन्दर्भ साइट — आधिकारिक सरकारी प्रकाशन होइन।",
    mainSectionTitle: "१०० वाचाहरू अन्वेषण गर्नुहोस्",
    navScans: "स्क्यान पृष्ठहरू",
    dashboardUseHint: "खोज, फिल्टर, क्रम र प्रत्येक बुँदा विस्तार गर्नुहोस्।",
  },
};

function SiteIntro({ language }) {
  const t = uiText[language];
  return (
    <header id="home" className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-6 pt-4 md:px-8">
      <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">{t.introTitle}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">{t.introLead}</p>
    </header>
  );
}

function PointOfficialSourceModal({ open, point, onClose, language, onOpenScans }) {
  function openScansAtMappedPage() {
    const targetPage = getSourceScanPageNumber(point);
    onClose();
    onOpenScans(targetPage);
  }
  const t = uiText[language];

  if (!open || !point) return null;

  const promise = language === "ne" ? point.promiseNe ?? point.promise : point.promise;
  const docTitle =
    language === "ne"
      ? point.sourceDocumentTitleNe ?? point.sourceDocumentTitle ?? t.defaultSourceDocTitle
      : point.sourceDocumentTitle ?? t.defaultSourceDocTitle;
  const rawExcerpt = language === "ne" ? point.sourceExcerptNe ?? point.sourceExcerpt : point.sourceExcerpt;
  const excerptDisplay = rawExcerpt
    ? rawExcerpt
    : `${t.sourcePendingPrefix} "${promise.slice(0, 220)}${promise.length > 220 ? "…" : ""}"`;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-3 sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-600 bg-slate-900 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-2 border-b border-slate-800 bg-slate-900/95 px-4 py-3 backdrop-blur">
          <div>
            <h3 className="text-base font-semibold text-white">{t.sourceModalTitle}</h3>
            <p className="mt-1 text-xs text-slate-400">
              {t.point} #{point.pointNumber}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4 px-4 py-4">
          <div>
            <p className="text-sm font-medium leading-snug text-slate-200">{docTitle}</p>
            <blockquote className="mt-2 border-l-2 border-amber-500/70 bg-slate-950/60 py-2 pl-3 text-sm leading-relaxed text-slate-200">{excerptDisplay}</blockquote>
          </div>
          <button
            type="button"
            onClick={openScansAtMappedPage}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500/50 bg-blue-600/20 px-3 py-2.5 text-sm font-medium text-blue-100 hover:bg-blue-600/30"
          >
            <FileStack size={16} aria-hidden />
            {t.openScannedPages}
          </button>
        </div>
      </div>
    </div>
  );
}

const statusClasses = {
  "Awaiting Response": "bg-amber-500/15 text-amber-100 border border-amber-500/45",
  "Under Review": "bg-amber-500/15 text-amber-200 border border-amber-500/40",
  Addressed: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/45",
  "No Action": "bg-red-500/15 text-red-200 border border-red-500/40",
};

/** Share or copy site link; optional callback when clipboard fallback succeeds. */
async function shareWholeSite(language, onCopied) {
  const t = uiText[language];
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = `${t.platformTitle}\n${url}\n\n— ${t.footerIdentity}`;
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title: t.platformTitle, text: `${t.platformTitle} — ${t.footerIdentity}`, url });
      return;
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    onCopied?.();
  } catch {
    /* clipboard unavailable */
  }
}

function Navbar({ language, setLanguage, onOpenScans }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const t = uiText[language];

  async function handleShareSite() {
    await shareWholeSite(language, () => {
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    });
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-[#070d1b]/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 md:px-8">
        <div className="max-w-[78%] md:max-w-none">
          <a href="#home" className="block text-xs font-semibold leading-tight text-slate-100 sm:text-sm md:text-base">
            {t.platformTitle}
          </a>
          <p className="mt-0.5 hidden text-[11px] text-slate-500 sm:block">
            {t.lastUpdatedTop}: {t.siteLastUpdated}
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            type="button"
            onClick={onOpenScans}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-800"
          >
            <FileStack size={14} aria-hidden />
            <span className="hidden sm:inline">{t.navScans}</span>
            <span className="sm:hidden">PDF</span>
          </button>
          <button
            type="button"
            onClick={handleShareSite}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-800"
            aria-label={t.navShareAria}
          >
            <Share2 size={14} aria-hidden />
            <span className="hidden sm:inline">{shareCopied ? t.navShareCopied : t.navShare}</span>
            {shareCopied ? <span className="text-emerald-400 sm:hidden">✓</span> : null}
          </button>
          <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900/90 p-0.5">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                language === "en" ? "bg-blue-700 text-white" : "text-slate-300 hover:bg-slate-800"
              }`}
              aria-label="Switch to English"
              aria-pressed={language === "en"}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("ne")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                language === "ne" ? "bg-blue-700 text-white" : "text-slate-300 hover:bg-slate-800"
              }`}
              aria-label="Switch to Nepali"
              aria-pressed={language === "ne"}
            >
              नेपाली
            </button>
          </div>
          <button
            className="rounded-md border border-slate-700 p-2 text-slate-200 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        <ul className="hidden items-center gap-4 text-sm text-slate-300 md:flex">
          {navItems.map((item) => (
            <li key={item.id}>
              <a className="hover:text-white" href={`#${item.id}`}>
                {t.dashboard}
              </a>
            </li>
          ))}
        </ul>
      </div>
      {mobileOpen && (
        <ul className="space-y-2 border-t border-slate-800 px-4 py-3 text-sm text-slate-300 md:hidden">
          {navItems.map((item) => (
            <li key={item.id}>
              <a className="block rounded px-2 py-1 hover:bg-slate-800/70" href={`#${item.id}`}>
                {t.dashboard}
              </a>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="block w-full rounded px-2 py-1 text-left hover:bg-slate-800/70"
              onClick={() => {
                setMobileOpen(false);
                onOpenScans();
              }}
            >
              {t.navScans}
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
}

function statusFilterLabel(s, t) {
  if (s === "Awaiting Response") return t.statusAwaiting;
  if (s === "Under Review") return t.statusReview;
  if (s === "Addressed") return t.statusAddressed;
  if (s === "No Action") return t.statusNoAction;
  return s;
}

function FiltersBar({
  language,
  search,
  setSearch,
  selectedSectionId,
  setSelectedSectionId,
  selectedStatus,
  setSelectedStatus,
  sortOrder,
  setSortOrder,
  showSubmissionMailtoHint,
}) {
  const t = uiText[language];
  return (
    <div className="mb-4 space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs leading-relaxed text-slate-500">{t.dashboardFilterHint}</p>
      {showSubmissionMailtoHint ? (
        <p className="text-xs leading-relaxed text-slate-500">{t.submissionMailtoNote}</p>
      ) : null}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.filterSearchPlaceholder}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none focus:border-blue-500"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <select
          className="rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-100"
          value={selectedSectionId}
          onChange={(e) => setSelectedSectionId(e.target.value)}
          aria-label={t.filterSectionAria}
        >
          <option value="All">{t.filterAllSections}</option>
          {AGENDA_SECTIONS.map((sec) => (
            <option key={sec.id} value={sec.id}>
              {sectionFilterOptionLabel(sec, language, t)}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-100"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="All">{t.filterAllStatuses}</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {statusFilterLabel(s, t)}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-100"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="asc">{t.filterSortAsc}</option>
          <option value="desc">{t.filterSortDesc}</option>
        </select>
      </div>
    </div>
  );
}

function updateTypeLabelFromT(t, key) {
  const m = {
    official_government_response: t.submissionUpdateTypeOfficial,
    policy_action: t.submissionUpdateTypePolicy,
    public_report_data: t.submissionUpdateTypeReport,
    correction: t.submissionUpdateTypeCorrection,
  };
  return m[key] ?? key;
}

function sourceTypeLabelFromT(t, key) {
  const m = {
    gov_website: t.submissionSourceTypeGov,
    official_document_pdf: t.submissionSourceTypeDoc,
    news_media: t.submissionSourceTypeNews,
    other: t.submissionSourceTypeOther,
  };
  return m[key] ?? key;
}

function SubmissionSendModal({ open, point, onClose, language }) {
  const t = uiText[language];
  const [step, setStep] = useState("form");
  const [updateType, setUpdateType] = useState(UPDATE_TYPE_KEYS[0]);
  const [sourceType, setSourceType] = useState(SOURCE_TYPE_KEYS[0]);
  const [description, setDescription] = useState("");
  const [sourceUrlRaw, setSourceUrlRaw] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [email, setEmail] = useState("");
  const [verifiedAck, setVerifiedAck] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [formError, setFormError] = useState("");
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [successViaMailto, setSuccessViaMailto] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSuccessViaMailto(false);
    setStep("form");
    setUpdateType(UPDATE_TYPE_KEYS[0]);
    setSourceType(SOURCE_TYPE_KEYS[0]);
    setDescription("");
    setSourceUrlRaw("");
    setPublicationDate("");
    setEmail("");
    setVerifiedAck(false);
    setHoneypot("");
    setFormError("");
    setSubmitStatus("idle");
  }, [open]);

  if (!open || !point) return null;
  if (!CAN_RECEIVE_SUBMISSIONS) return null;

  const commitmentTitle = commitmentTitleForPoint(point, language);

  function validateAndGetPayload() {
    const desc = description.trim();
    if (!desc) return { error: t.submissionMessageRequired };
    if (desc.length < SUBMISSION_MIN_DESCRIPTION_LEN) return { error: t.submissionMessageTooShort };
    const urlRaw = sourceUrlRaw.trim();
    if (!urlRaw) return { error: t.submissionSourceRequired };
    const sourceUrl = normalizeSourceUrl(urlRaw);
    if (!sourceUrl) return { error: t.submissionInvalidUrl };
    const pubTrim = publicationDate.trim();
    if (!pubTrim) return { error: t.submissionDateRequired };
    const pubIso = parseValidPublicationDateIso(pubTrim);
    if (!pubIso) return { error: t.submissionDateInvalid };
    if (!verifiedAck) return { error: t.submissionVerifyRequired };
    return {
      ok: true,
      desc,
      sourceUrl,
      publicationDate: pubIso,
      emailTrim: email.trim(),
    };
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (honeypot.trim()) return;
    const v = validateAndGetPayload();
    if (v.error) {
      setFormError(v.error);
      return;
    }
    setFormError("");
    setStep("confirm");
  }

  async function performSubmit() {
    const v = validateAndGetPayload();
    if (!v.ok) {
      setFormError(v.error);
      setStep("form");
      return;
    }
    const { desc, sourceUrl, publicationDate: pubDate, emailTrim } = v;
    setSuccessViaMailto(false);

    if (supabaseConfigured) {
      setSubmitStatus("sending");
      try {
        await submitAgendaUpdate({
          pointNumber: point.pointNumber,
          description: desc,
          sourceUrl,
          updateType,
          sourceType,
          publicationDate: pubDate,
          email: emailTrim,
          verifiableSourceAck: verifiedAck,
        });
        setSubmitStatus("success");
      } catch {
        setFormError(t.submissionDbSaveError);
        setSubmitStatus("error");
      }
      return;
    }

    if (FORMSPREE_FORM_ID) {
      setSubmitStatus("sending");
      try {
        const ut = updateTypeLabelFromT(t, updateType);
        const st = sourceTypeLabelFromT(t, sourceType);
        const subject = `[100-point tracker] Point #${point.pointNumber}`;
        const message =
          (language === "ne" ? `बुँदा: ${point.pointNumber}\n` : `Point: ${point.pointNumber}\n`) +
          (language === "ne" ? `अद्यावधिकको प्रकार: ${ut}\n\n` : `Type of update: ${ut}\n\n`) +
          (language === "ne" ? `विवरण:\n${desc}\n\n` : `Description:\n${desc}\n\n`) +
          (language === "ne" ? `स्रोत लिङ्क: ${sourceUrl}\n` : `Source link: ${sourceUrl}\n`) +
          (language === "ne" ? `स्रोतको प्रकार: ${st}\n` : `Source type: ${st}\n`) +
          (language === "ne" ? `प्रकाशन मिति: ${pubDate}\n` : `Publication date: ${pubDate}\n`) +
          (language === "ne"
            ? `प्रमाणित सार्वजनिक स्रोत: ${verifiedAck ? "हो" : "होइन"}\n`
            : `Verified public source: ${verifiedAck ? "yes" : "no"}\n`) +
          (emailTrim
            ? language === "ne"
              ? `सम्पर्क इमेल: ${emailTrim}\n`
              : `Contact email: ${emailTrim}\n`
            : language === "ne"
              ? "सम्पर्क इमेल: (फारममा दिइएन)\n"
              : "Contact email: (not provided in form)\n");

        const fd = new FormData();
        fd.append("_subject", subject);
        fd.append("message", message);
        if (emailTrim) {
          fd.append("email", emailTrim);
        }

        const res = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
          method: "POST",
          body: fd,
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          setSubmitStatus("success");
          return;
        }
        setSubmitStatus("error");
      } catch {
        setSubmitStatus("error");
      }
      return;
    }

    if (WEB3FORMS_ACCESS_KEY) {
      setSubmitStatus("sending");
      try {
        const fd = new FormData();
        fd.append("access_key", WEB3FORMS_ACCESS_KEY);
        fd.append("subject", `[100-point tracker] Point #${point.pointNumber}`);
        fd.append("name", "—");
        fd.append("message", desc);
        fd.append("cabinet_point", String(point.pointNumber));
        fd.append("official_url", sourceUrl);
        fd.append("submission_type", updateType);
        fd.append("source_type", sourceType);
        fd.append("publication_date", pubDate);
        fd.append("verifiable_source_ack", verifiedAck ? "true" : "false");
        fd.append("botcheck", "false");
        if (emailTrim) {
          fd.append("email", emailTrim);
          fd.append("replyto", emailTrim);
        }

        const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          setSubmitStatus("success");
          return;
        }
        setSubmitStatus("error");
      } catch {
        setSubmitStatus("error");
      }
      return;
    }

    if (SUBMISSION_EMAIL) {
      const subject =
        language === "ne"
          ? `१००-बुँदे — बुँदा ${point.pointNumber} सार्वजनिक स्रोत`
          : `[100-point tracker] Point #${point.pointNumber} — public source`;
      const ut = updateTypeLabelFromT(t, updateType);
      const st = sourceTypeLabelFromT(t, sourceType);
      const body =
        (language === "ne" ? `बुँदा: ${point.pointNumber}\n\n` : `Point: ${point.pointNumber}\n\n`) +
        (language === "ne" ? `अद्यावधिकको प्रकार: ${ut}\n` : `Type of update: ${ut}\n`) +
        (language === "ne" ? `विवरण:\n${desc}\n\n` : `Description:\n${desc}\n\n`) +
        (language === "ne" ? `स्रोत लिङ्क: ${sourceUrl}\n` : `Source link: ${sourceUrl}\n`) +
        (language === "ne" ? `स्रोतको प्रकार: ${st}\n` : `Source type: ${st}\n`) +
        (language === "ne" ? `प्रकाशन मिति: ${pubDate}\n` : `Publication date: ${pubDate}\n`) +
        (emailTrim ? `Email: ${emailTrim}\n` : "") +
        (language === "ne"
          ? "प्रमाणित सार्वजनिक स्रोत पुष्टि: हो\n"
          : "Confirmed verifiable public source: yes\n");
      const href = `mailto:${SUBMISSION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      if (href.length > 2200) {
        setFormError(t.submissionMailtoTooLong);
        return;
      }
      setSuccessViaMailto(true);
      navigateMailtoHref(href);
      setSubmitStatus("success");
      return;
    }

    setSubmitStatus("error");
  }

  const descPreview =
    description.trim().length > 220 ? `${description.trim().slice(0, 219)}…` : description.trim();
  const sourceUrlForPreview = normalizeSourceUrl(sourceUrlRaw.trim());

  return (
    <div
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-send-title"
      onClick={onClose}
    >
      <div
        className="max-h-[min(92vh,800px)] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-700/80 bg-[#0c1222] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h3 id="submission-send-title" className="text-[15px] font-semibold tracking-tight text-white">
              {t.submissionSendTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800/80 hover:text-slate-200"
            aria-label={t.modalDismiss}
          >
            <X size={18} />
          </button>
        </div>

        {submitStatus === "success" ? (
          <p className="mt-6 whitespace-pre-line rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-100/95">
            {successViaMailto ? t.submissionFormSuccessMailto : t.submissionFormSuccess}
          </p>
        ) : step === "confirm" ? (
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-100">{t.submissionConfirmTitle}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{t.submissionConfirmLead}</p>
              <p className="mt-3 text-sm font-medium text-slate-200">{t.submissionConfirmQuestion}</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-3 text-sm text-slate-300">
              <dl className="space-y-2.5">
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{t.commitmentLabel}</dt>
                  <dd className="mt-0.5 text-slate-200">
                    Point #{point.pointNumber} – {commitmentTitle}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{t.submissionUpdateTypeLabel}</dt>
                  <dd className="mt-0.5">{updateTypeLabelFromT(t, updateType)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{t.submissionDescriptionLabel}</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap break-words text-slate-300">{descPreview || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{t.submissionSourceLinkLabel}</dt>
                  <dd className="mt-0.5 break-all">
                    {sourceUrlForPreview ? (
                      <a
                        href={sourceUrlForPreview}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline decoration-blue-500/40 underline-offset-2 hover:text-blue-300"
                      >
                        {sourceUrlForPreview}
                      </a>
                    ) : (
                      <span className="text-slate-400">{sourceUrlRaw.trim() || "—"}</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{t.submissionSourceTypeLabel}</dt>
                  <dd className="mt-0.5">{sourceTypeLabelFromT(t, sourceType)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{t.submissionPublicationDateLabel}</dt>
                  <dd className="mt-0.5">{publicationDate.trim() || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{t.submissionYourEmail}</dt>
                  <dd className="mt-0.5">{email.trim() || "—"}</dd>
                </div>
              </dl>
            </div>
            {formError ? <p className="text-xs text-amber-200">{formError}</p> : null}
            {submitStatus === "error" ? <p className="text-xs text-amber-200">{t.submissionFormError}</p> : null}
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                disabled={submitStatus === "sending"}
                onClick={() => {
                  setFormError("");
                  setSubmitStatus("idle");
                  setStep("form");
                }}
                className="order-2 w-full rounded-lg border border-slate-600 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800/80 disabled:cursor-not-allowed disabled:opacity-60 sm:order-1 sm:flex-1"
              >
                {t.submissionConfirmBack}
              </button>
              <button
                type="button"
                disabled={submitStatus === "sending"}
                onClick={() => void performSubmit()}
                className="order-1 w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:order-2 sm:flex-1"
              >
                {submitStatus === "sending" ? t.submissionFormSending : t.submissionFormSubmit}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">{t.submissionSendLead}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{t.submissionFormMeaning}</p>
            <form className="relative mt-5 space-y-3" onSubmit={handleFormSubmit} noValidate>
              <input
                type="text"
                name="company_website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="absolute -left-[9999px] h-px w-px opacity-0"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
              />
              <div className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5">
                <span className="block text-xs font-medium text-slate-500">{t.commitmentLabel}</span>
                <p className="mt-1 text-sm leading-snug text-slate-200">
                  Point #{point.pointNumber} – {commitmentTitle}
                </p>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-400">{t.submissionUpdateTypeLabel}</span>
                <select
                  value={updateType}
                  onChange={(e) => setUpdateType(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500/70"
                >
                  {UPDATE_TYPE_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {updateTypeLabelFromT(t, key)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-400">{t.submissionDescriptionLabel}</span>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder={t.submissionDescriptionPlaceholder}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500/70"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-400">{t.submissionSourceLinkLabel}</span>
                <input
                  type="url"
                  value={sourceUrlRaw}
                  onChange={(e) => setSourceUrlRaw(e.target.value)}
                  placeholder="https://"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500/70"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-400">{t.submissionSourceTypeLabel}</span>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500/70"
                >
                  {SOURCE_TYPE_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {sourceTypeLabelFromT(t, key)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-400">{t.submissionPublicationDateLabel}</span>
                <input
                  type="date"
                  value={publicationDate}
                  min="1900-01-01"
                  max="2100-12-31"
                  onChange={(e) => setPublicationDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500/70"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-400">{t.submissionYourEmail}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500/70"
                />
              </label>
              <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-snug text-slate-300">
                <input
                  type="checkbox"
                  checked={verifiedAck}
                  onChange={(e) => setVerifiedAck(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-950 text-blue-600 focus:ring-blue-500/40"
                />
                <span>{t.submissionVerifyCheckbox}</span>
              </label>
              {formError ? <p className="text-xs text-amber-200">{formError}</p> : null}
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                {t.submissionFormContinue}
              </button>
            </form>
          </>
        )}

        {submitStatus !== "success" ? (
          <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-600">{t.submissionReviewNote}</p>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg py-2.5 text-sm text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300"
        >
          {t.modalDismiss}
        </button>
      </div>
    </div>
  );
}

function layer1StatusCellClass(statusText) {
  const s = String(statusText);
  if (s.includes("🟢")) return "font-semibold text-emerald-300/95";
  if (s.includes("🔵")) return "font-semibold text-sky-300/95";
  if (s.includes("🟡") || s.includes("⚠️")) return "font-semibold text-amber-200/95";
  if (s.includes("🔴") || s.includes("❌")) return "font-semibold text-red-300/95";
  return "text-slate-400";
}

/** Traffic-light level for quick-scan / PMO snapshot rows (R/Y/G scan). */
function layer1StatusLevel(statusText) {
  const s = String(statusText);
  if (s.includes("🟢")) return "green";
  if (s.includes("🔵")) return "yellow";
  if (s.includes("🟡") || s.includes("⚠️")) return "yellow";
  if (s.includes("🔴") || s.includes("❌")) return "red";
  return "neutral";
}

function StatusDot({ level }) {
  const cls =
    level === "green"
      ? "bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.45)]"
      : level === "yellow"
        ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]"
        : level === "red"
          ? "bg-red-500 shadow-[0_0_10px_rgba(248,113,113,0.45)]"
          : "bg-slate-600";
  return <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${cls}`} aria-hidden />;
}

function buildCitizenSnapshotRows(layer1, pm, language) {
  const pick = (en, ne) => (language === "ne" ? ne ?? en : en);
  const rows = [];
  if (layer1?.quickScan?.length) {
    for (const row of layer1.quickScan.slice(0, 3)) {
      const status = pick(row.status, row.statusNe);
      const item = pick(row.item, row.itemNe);
      rows.push({ item, status, level: layer1StatusLevel(status) });
    }
    return rows;
  }
  if (!pm) return rows;
  const overall = pick(pm.programStatusEn, pm.programStatusNe);
  if (overall) {
    rows.push({
      item: language === "ne" ? "समग्र स्थिति" : "Overall",
      status: overall,
      level: layer1StatusLevel(overall),
    });
  }
  if (pm.kpis?.[0]) {
    const k = pm.kpis[0];
    rows.push({
      item: pick(k.metricEn, k.metricNe),
      status: language === "ne" ? "प्रमाण जाँच (हेर्नुहोस् तल विवरणमा)" : "Proof check (see detail below)",
      level: "yellow",
    });
  }
  if (rows.length < 2 && pm.milestones?.[0]) {
    const m = pm.milestones[0];
    rows.push({
      item: pick(m.en, m.ne),
      status: language === "ne" ? "पहिलो कोसेढुङ्गा" : "First milestone",
      level: "yellow",
    });
  }
  return rows.slice(0, 3);
}

/** Layer 1: short hook + stake + quick scan + share actions (points that define `layer1`). */
function PointLayer1QuickView({ layer1, language, t, pointNumber }) {
  const [actionHint, setActionHint] = useState(null);
  if (!layer1) return null;
  const hookEmoji = typeof layer1.hookEmoji === "string" ? layer1.hookEmoji.trim() : "";
  const hook = language === "ne" ? layer1.hookNe ?? layer1.hook : layer1.hook;
  const stake = language === "ne" ? layer1.stakeLineNe ?? layer1.stakeLine : layer1.stakeLine;
  const coreQ = language === "ne" ? layer1.coreQuestionNe ?? layer1.coreQuestion : layer1.coreQuestion;
  const coreShort =
    language === "ne" ? layer1.coreQuestionShortNe ?? layer1.coreQuestionShort : layer1.coreQuestionShort;
  const rows = layer1.quickScan ?? [];
  const shareLead = hookEmoji ? `${hookEmoji} ${hook}` : hook;

  const pointHashUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}${window.location.search}#point-${pointNumber}`
      : "";

  function flashHint(key) {
    setActionHint(key);
    window.setTimeout(() => setActionHint(null), 2200);
  }

  async function handleShare() {
    if (typeof navigator === "undefined") return;
    const title = `POINT #${pointNumber} — Nepal Public Commitments Tracker`;
    const text = `${shareLead}\n\n${coreQ}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: pointHashUrl });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n${pointHashUrl}`);
        flashHint("shareFallback");
      } else flashHint("fail");
    } catch (e) {
      if (e && typeof e === "object" && "name" in e && e.name === "AbortError") return;
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(`${text}\n${pointHashUrl}`);
          flashHint("shareFallback");
        } else flashHint("fail");
      } catch {
        flashHint("fail");
      }
    }
  }

  async function handleCopyQuestion() {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      flashHint("fail");
      return;
    }
    try {
      await navigator.clipboard.writeText(coreQ);
      flashHint("question");
    } catch {
      flashHint("fail");
    }
  }

  return (
    <div className="mb-4 space-y-3 rounded-xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-950/25 via-slate-950/60 to-slate-950 p-3.5 ring-1 ring-fuchsia-500/10">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-200/85">{t.layer1ScanLabel}</p>
      <p className="flex items-start gap-2.5 text-[17px] font-bold leading-snug text-white sm:text-lg">
        {hookEmoji ? (
          <span className="shrink-0 text-[1.35em] leading-none" aria-hidden>
            {hookEmoji}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">{hook}</span>
      </p>
      <p className="border-l-2 border-fuchsia-400/55 pl-3 text-sm leading-relaxed text-slate-200">{stake}</p>
      {rows.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-slate-700/90 bg-slate-950/50">
          <table className="w-full min-w-[280px] text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/50 text-slate-200">
                <th className="px-2.5 py-2 font-semibold sm:px-3">{t.layer1ColExpect}</th>
                <th className="px-2.5 py-2 font-semibold sm:px-3">{t.layer1ColStatus}</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {rows.map((row) => (
                <tr key={row.item} className="border-t border-slate-800/90">
                  <td className="px-2.5 py-2 align-top sm:px-3">
                    {language === "ne" ? row.itemNe ?? row.item : row.item}
                  </td>
                  <td
                    className={`px-2.5 py-2 align-top tabular-nums sm:px-3 ${layer1StatusCellClass(
                      language === "ne" ? row.statusNe ?? row.status : row.status,
                    )}`}
                  >
                    {language === "ne" ? row.statusNe ?? row.status : row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <p className="my-1 rounded-lg border border-orange-400/40 bg-orange-950/30 px-4 py-3.5 text-center text-lg font-extrabold leading-snug tracking-tight text-orange-50 sm:text-xl">
        {t.viralPunchLine}
      </p>
      {coreShort ? (
        <div className="space-y-2">
          <p className="flex items-start gap-2.5 text-base font-bold leading-snug text-white sm:text-[1.05rem]">
            <span className="shrink-0 text-lg leading-none opacity-90" aria-hidden>
              ❓
            </span>
            <span className="min-w-0">{coreShort}</span>
          </p>
          <p className="border-l-2 border-slate-600 pl-3 text-xs font-normal leading-relaxed text-slate-400 sm:text-sm">
            {coreQ}
          </p>
        </div>
      ) : (
        <p className="text-sm font-semibold leading-snug text-slate-100">{coreQ}</p>
      )}
      <div className="flex flex-wrap gap-2 border-t border-fuchsia-500/15 pt-3">
        <button
          type="button"
          onClick={() => void handleShare()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
        >
          <Share2 size={13} className="shrink-0 opacity-90" aria-hidden />
          {t.layer1SharePoint}
        </button>
        <button
          type="button"
          onClick={() => void handleCopyQuestion()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
        >
          <Copy size={13} className="shrink-0 opacity-90" aria-hidden />
          {t.layer1CopyQuestion}
        </button>
      </div>
      {actionHint === "question" ? (
        <p className="text-[11px] text-emerald-400/90">{t.layer1ActionCopied}</p>
      ) : null}
      {actionHint === "shareFallback" ? (
        <p className="text-[11px] text-emerald-400/90">{t.layer1ShareFallbackHint}</p>
      ) : null}
      {actionHint === "fail" ? <p className="text-[11px] text-amber-200/90">{t.layer1ActionCopyFail}</p> : null}
    </div>
  );
}

function CitizenDeliverySnapshot({ layer1, pm, language, t }) {
  const pick = (en, ne) => (language === "ne" ? ne ?? en : en);
  const hasLayer1Scan = Boolean(layer1?.quickScan?.length);
  const rows = hasLayer1Scan ? [] : buildCitizenSnapshotRows(layer1, pm, language);
  const verdict = pick(pm.programStatusEn, pm.programStatusNe);

  return (
    <div className="mt-3 rounded-lg border border-slate-700/80 bg-slate-950/60 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{t.pmoCitizenSnapshotTitle}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        {hasLayer1Scan ? t.pmoSnapshotSeeLayer1 : t.pmoCitizenSnapshotHint}
      </p>
      {verdict ? (
        <p className="mt-3 rounded-md border border-slate-600/60 bg-slate-900/80 px-2.5 py-2 text-sm font-semibold leading-snug text-slate-100">
          {verdict}
        </p>
      ) : null}
      {rows.length > 0 ? (
        <ul className="mt-3 space-y-2.5" aria-label={t.pmoCitizenSnapshotTitle}>
          {rows.map((r, i) => (
            <li key={i} className="flex gap-2.5 text-sm">
              <span className="pt-1">
                <StatusDot level={r.level} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-snug text-slate-200 line-clamp-3">{r.item}</p>
                <p className={`mt-0.5 text-xs leading-snug ${layer1StatusCellClass(r.status)}`}>{r.status}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {!hasLayer1Scan && rows.length > 0 ? (
        <p className="mt-3 text-[10px] font-medium uppercase tracking-wide text-slate-600">{t.pmoLegendShort}</p>
      ) : null}
    </div>
  );
}

function PointProgramMonitoringBlock({ pm, language, t, layer1 }) {
  if (!pm) return null;
  const pick = (en, ne) => (language === "ne" ? ne ?? en : en);

  return (
    <div className="rounded-xl border border-cyan-500/35 bg-gradient-to-br from-cyan-950/25 via-slate-950/60 to-slate-950 p-3.5 ring-1 ring-cyan-500/10">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200/90">{t.pmoSectionTitle}</p>
      <CitizenDeliverySnapshot layer1={layer1} pm={pm} language={language} t={t} />

      <div className="mt-3 rounded-lg border border-slate-700/70 bg-slate-950/50 px-2.5 py-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{t.pmoPublicRecordTitle}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">{t.pmoPublicRecordBody}</p>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-amber-200/90">{t.pmoEscalationTriggerNote}</p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{t.pmoDependencyChainNote}</p>

      <details className="group mt-3 rounded-lg border border-cyan-500/25 bg-slate-950/40 open:border-cyan-500/45">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left hover:bg-slate-800/50 [&::-webkit-details-marker]:hidden">
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-cyan-100">{t.pmoFullDetailToggle}</span>
            <span className="mt-0.5 block text-[11px] font-normal text-slate-500">{t.pmoFullDetailHint}</span>
          </span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="space-y-3 border-t border-cyan-500/15 px-3 pb-3 pt-3">
          <p className="text-[11px] leading-relaxed text-slate-500">{t.pmoSectionHint}</p>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-cyan-100/90">{t.pmoOwnerTitle}</p>
            <p className="mt-1 text-[11px] font-semibold text-slate-400">{t.pmoPrimaryOwners}</p>
            <p className="text-sm leading-relaxed text-slate-100">{pick(pm.primaryOwnersEn, pm.primaryOwnersNe)}</p>
            {pm.coordinatingOfficeEn || pm.coordinatingOfficeNe ? (
              <>
                <p className="mt-2 text-[11px] font-semibold text-slate-400">{t.pmoCoordinatingOffice}</p>
                <p className="text-sm leading-relaxed text-slate-100">{pick(pm.coordinatingOfficeEn, pm.coordinatingOfficeNe)}</p>
              </>
            ) : null}
            <p className="mt-2 text-[11px] font-semibold text-slate-400">{t.pmoAccountableRoles}</p>
            <p className="text-sm leading-relaxed text-slate-100">{pick(pm.accountableRolesEn, pm.accountableRolesNe)}</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-cyan-100/90">{t.pmoTimelineTitle}</p>
            <p className="mt-1 text-[11px] font-semibold text-slate-400">{t.pmoTimelineSummary}</p>
            <p className="text-sm leading-relaxed text-slate-100">{pick(pm.timelineEn, pm.timelineNe)}</p>
            {pm.milestones?.length ? (
              <>
                <p className="mt-2 text-[11px] font-semibold text-slate-400">{t.pmoMilestonesLabel}</p>
                <ul className="mt-1 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-200">
                  {pm.milestones.map((m) => (
                    <li key={m.en}>{pick(m.en, m.ne)}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          {pm.kpis?.length ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-cyan-100/90">{t.pmoKpiTitle}</p>
              <ul className="mt-2 space-y-2">
                {pm.kpis.map((k) => (
                  <li key={k.metricEn} className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-2.5 py-2">
                    <p className="text-[11px] font-semibold text-slate-400">{t.pmoKpiMetric}</p>
                    <p className="text-sm text-slate-100">{pick(k.metricEn, k.metricNe)}</p>
                    <p className="mt-1.5 text-[11px] font-semibold text-slate-500">{t.pmoKpiHow}</p>
                    <p className="text-xs leading-relaxed text-slate-300">{pick(k.howEn, k.howNe)}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {pm.risks?.length ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-rose-200/90">{t.pmoRisksTitle}</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-300">
                {pm.risks.map((r) => (
                  <li key={r.en}>{pick(r.en, r.ne)}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {pm.escalation?.length ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-amber-200/90">{t.pmoEscalationTitle}</p>
              <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-slate-300">
                {pm.escalation.map((e) => (
                  <li key={e.en}>{pick(e.en, e.ne)}</li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </details>
    </div>
  );
}

function PointCard({ point, onResponseUnavailable, onOfficialSource, language, spotlight = false }) {
  const [expanded, setExpanded] = useState(false);
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const t = uiText[language];
  const promiseFull = language === "ne" ? point.promiseNe ?? point.promise : point.promise ?? point.promiseNe;
  const ps = promiseSummaries[point.pointNumber];
  const promiseLead =
    language === "ne"
      ? ps?.summaryNe ?? ps?.summary ?? promiseFull
      : ps?.summary ?? ps?.summaryNe ?? promiseFull;
  const normPromise = (s) => s.replace(/\s+/g, " ").trim();
  const showFullOfficialBlock = ps && normPromise(promiseLead) !== normPromise(promiseFull);
  const question = language === "ne" ? point.questionNe ?? point.question : point.question;
  const whyThisMatters = language === "ne" ? point.whyThisMattersNe ?? point.whyThisMatters : point.whyThisMatters;
  const systemInsight = language === "ne" ? point.systemInsightNe ?? point.systemInsight : point.systemInsight;
  const statusLabel =
    point.status === "Awaiting Response"
      ? t.statusAwaiting
      : point.status === "Under Review"
        ? t.statusReview
        : point.status === "Addressed"
          ? t.statusAddressed
          : t.statusNoAction;
  const pathItems =
    language === "ne"
      ? point.possiblePathItemsNe ?? (point.possiblePathNe ? [point.possiblePathNe] : point.possiblePathItems ?? (point.possiblePath ? [point.possiblePath] : []))
      : point.possiblePathItems ?? (point.possiblePath ? [point.possiblePath] : []);
  const hasIllustrativeVisuals = Boolean(
    point.deliveryPerformanceDashboard ||
      point.commitmentTrackingDashboard ||
      point.constitutionalAmendmentTracker ||
      point.inclusionMonitoringMatrix ||
      point.intergovernmentalCoordinationMatrix ||
      point.publicServiceDeliveryTracker ||
      point.visualAccountability,
  );
  const borderRing = expanded
    ? "border-amber-500/35 ring-2 ring-amber-500/20 shadow-amber-950/20"
    : spotlight
      ? "border-orange-400/55 ring-2 ring-orange-400/35 shadow-orange-950/25"
      : "border-slate-800";

  return (
    <article
      id={`point-${point.pointNumber}`}
      className={`scroll-mt-28 rounded-xl border bg-slate-900 shadow-lg shadow-black/20 transition-shadow ${
        spotlight ? "p-4 md:p-5" : "p-4"
      } ${borderRing}`}
    >
      {point.status === "Awaiting Response" ? (
        <div className="mb-3 rounded-lg border border-amber-500/35 bg-gradient-to-r from-amber-950/50 to-slate-950/40 px-3 py-2.5 sm:px-4">
          <p className="text-center text-[13px] font-black uppercase tracking-wide text-amber-100 sm:text-sm sm:tracking-[0.12em]">
            {t.cardScreenshotHeadline.replace("{{n}}", String(point.pointNumber))}
          </p>
        </div>
      ) : null}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-blue-700/40 px-2 py-1 text-xs font-semibold text-blue-200">{t.point} #{point.pointNumber}</span>
        <span className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300">{point.category}</span>
        <span className={`rounded-md px-2 py-1 text-xs font-medium ${statusClasses[point.status]}`}>{statusLabel}</span>
      </div>
      {spotlight ? (
        <div className="mb-3">
          <span className="inline-flex rounded-full border border-orange-400/50 bg-orange-500/15 px-2.5 py-1 text-[11px] font-semibold leading-snug text-orange-100">
            {t.spotlightCardBadge}
          </span>
        </div>
      ) : null}
      {point.pointNumber >= 1 && point.pointNumber <= 100 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-200">
            {t.legitimacyCheck}
          </span>
          <span className="rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1 text-[11px] text-slate-200">
            {t.neutral}
          </span>
          <span className="rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1 text-[11px] text-slate-200">
            {t.sourceBased}
          </span>
          <span className="rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1 text-[11px] text-slate-200">
            {t.nonAccusatory}
          </span>
        </div>
      )}
      <p className="mb-3 text-xs text-slate-300">
        {t.lastUpdated} {point.lastUpdated ?? "April 3, 2026"}
      </p>

      <section className="space-y-5 text-base">
        <div className="space-y-2 rounded-lg border border-slate-700/70 bg-slate-950/40 p-3">
          <p className="text-[15px] font-bold tracking-wide text-white">{t.promise}</p>
          {showFullOfficialBlock && (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t.promiseInBrief}</p>
          )}
          <p className="border-l-2 border-blue-400/70 pl-3 text-sm leading-6 text-slate-200">
            {showFullOfficialBlock ? promiseLead : promiseFull}
          </p>
          {showFullOfficialBlock && (
            <details className="mt-1 rounded-md border border-slate-700/50 bg-slate-900/40 px-2 py-1.5 text-sm text-slate-200">
              <summary className="cursor-pointer select-none text-blue-300 hover:text-blue-200">{t.fullOfficialWording}</summary>
              <p className="mt-2 border-l-2 border-slate-600 pl-3 text-sm leading-6 text-slate-300">{promiseFull}</p>
            </details>
          )}
        </div>
        {point.layer1 ? (
          <PointLayer1QuickView layer1={point.layer1} language={language} t={t} pointNumber={point.pointNumber} />
        ) : null}
        {!expanded && (
          <p className="flex items-start gap-2 border-t border-slate-700/60 pt-3 text-xs leading-relaxed text-slate-400">
            <ChevronDown className="mt-0.5 shrink-0 text-blue-400" size={14} aria-hidden />
            <span>{t.expandTeaser}</span>
          </p>
        )}
        {expanded && (
          <>
            <div className="mb-3 rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2">
              <p className="text-center text-[11px] font-bold uppercase tracking-widest text-amber-200/90">{t.pointStructuredReview}</p>
            </div>
            <div className="space-y-2 rounded-lg border border-slate-700/70 bg-slate-950/40 p-3">
              <p className="text-base font-extrabold tracking-wide text-white">{t.accountabilityQuestion}</p>
              <p className="border-l-2 border-blue-400/70 pl-3 leading-7 text-slate-100">{question}</p>
            </div>
            <div className="space-y-2 rounded-lg border border-slate-700/70 bg-slate-950/40 p-3">
              <p className="text-[15px] font-bold tracking-wide text-white">{t.whyThisMatters}</p>
              <p className="border-l-2 border-blue-400/70 pl-3 leading-7 text-slate-100">{whyThisMatters}</p>
            </div>
            <div className="space-y-2 rounded-lg border border-slate-700/70 bg-slate-950/40 p-3">
              <p className="text-[15px] font-bold tracking-wide text-white">{t.possiblePath}</p>
              <ul className="mt-1 list-disc space-y-2 pl-8 leading-7 text-slate-100">
                {pathItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {point.programMonitoring ? (
              <PointProgramMonitoringBlock
                pm={point.programMonitoring}
                language={language}
                t={t}
                layer1={point.layer1}
              />
            ) : null}
            {systemInsight && (
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                <p className="text-sm font-semibold text-blue-100">{t.systemInsight}</p>
                <p className="mt-1 text-sm leading-6 text-slate-100">{systemInsight}</p>
              </div>
            )}
            {hasIllustrativeVisuals && (
              <details className="group mt-1 rounded-xl border border-slate-600/60 bg-slate-950/50 open:border-slate-500/50 open:bg-slate-950/70">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-800/60 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 flex-1">
                    {t.illustrativeVisualsSummary}
                    <span className="mt-0.5 block text-xs font-normal text-slate-400">
                      {t.illustrativeVisualsHint}
                    </span>
                  </span>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <div className="space-y-3 border-t border-slate-700/80 px-1 pb-2 pt-3 sm:px-2">
            {point.deliveryPerformanceDashboard && (
              <div className="mt-3 rounded-lg border border-slate-700/70 bg-slate-950/40 p-3">
                <p className="mb-1 text-[15px] font-bold tracking-wide text-white">{t.visualTitleDelivery}</p>
                <p className="mb-3 text-xs leading-relaxed text-slate-500">{t.deliveryDashboardDisclaimer}</p>
                <div className="hidden overflow-x-auto rounded-lg border border-slate-700 md:block">
                  <table className="min-w-[920px] text-left text-sm">
                    <thead className="bg-slate-800/70 text-slate-200">
                      <tr>
                        <th className="px-3 py-2">{t.deliveryTableMinistry}</th>
                        <th className="px-3 py-2">{t.deliveryTableKpi}</th>
                        <th className="px-3 py-2">{t.deliveryTableTarget}</th>
                        <th className="px-3 py-2">{t.deliveryTableCurrent}</th>
                        <th className="px-3 py-2">{t.deliveryTableGap}</th>
                        <th className="px-3 py-2">{t.deliveryTableStatus}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {point.deliveryPerformanceDashboard.map((row) => (
                        <tr key={`${row.ministry}-${row.kpi}`} className="border-t border-slate-800 text-slate-300">
                          <td className="px-3 py-2 font-medium text-slate-200">
                            {language === "ne" ? row.ministryNe ?? row.ministry : row.ministry}
                          </td>
                          <td className="px-3 py-2">{language === "ne" ? row.kpiNe ?? row.kpi : row.kpi}</td>
                          <td className="px-3 py-2 tabular-nums">{language === "ne" ? row.targetNe ?? row.target : row.target}</td>
                          <td className="px-3 py-2 tabular-nums">{language === "ne" ? row.currentNe ?? row.current : row.current}</td>
                          <td className="px-3 py-2 tabular-nums">{language === "ne" ? row.gapNe ?? row.gap : row.gap}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{language === "ne" ? row.statusNe ?? row.status : row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-2 md:hidden">
                  {point.deliveryPerformanceDashboard.map((row) => (
                    <div key={`${row.ministry}-${row.kpi}`} className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm">
                      <p className="font-semibold text-slate-100">
                        {language === "ne" ? row.ministryNe ?? row.ministry : row.ministry}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.deliveryTableKpi}: </span>
                        {language === "ne" ? row.kpiNe ?? row.kpi : row.kpi}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.deliveryTableTarget}: </span>
                        {language === "ne" ? row.targetNe ?? row.target : row.target}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.deliveryTableCurrent}: </span>
                        {language === "ne" ? row.currentNe ?? row.current : row.current}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.deliveryTableGap}: </span>
                        {language === "ne" ? row.gapNe ?? row.gap : row.gap}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.deliveryTableStatus}: </span>
                        {language === "ne" ? row.statusNe ?? row.status : row.status}
                      </p>
                    </div>
                  ))}
                </div>
                {point.systemStatusOverview && point.systemStatusOverview.length > 0 && (
                  <div className="mt-4 rounded-md border border-slate-700 bg-slate-900/60 p-3">
                    <p className="text-sm font-semibold text-slate-100">{t.systemStatusOverviewTitle}</p>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-300">
                      {point.systemStatusOverview.map((item) => (
                        <li key={item.en}>{language === "ne" ? item.ne : item.en}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {point.commitmentTrackingDashboard && (
              <div className="mt-3 rounded-lg border border-slate-700/70 bg-slate-950/40 p-3">
                <p className="mb-1 text-[15px] font-bold tracking-wide text-white">{t.visualTitleCommitment}</p>
                <p className="mb-3 text-xs leading-relaxed text-slate-500">{t.commitmentTrackerDisclaimer}</p>
                <div className="hidden overflow-x-auto rounded-lg border border-slate-700 md:block">
                  <table className="min-w-[980px] text-left text-sm">
                    <thead className="bg-slate-800/70 text-slate-200">
                      <tr>
                        <th className="px-3 py-2">{t.commitmentTableCommitment}</th>
                        <th className="px-3 py-2">{t.commitmentTableMinistry}</th>
                        <th className="px-3 py-2">{t.commitmentTableTimeline}</th>
                        <th className="px-3 py-2">{t.commitmentTableBudgetLinked}</th>
                        <th className="px-3 py-2">{t.commitmentTableStatus}</th>
                        <th className="px-3 py-2">{t.commitmentTablePercentComplete}</th>
                        <th className="px-3 py-2">{t.commitmentTableLastUpdated}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {point.commitmentTrackingDashboard.map((row) => (
                        <tr key={row.commitment} className="border-t border-slate-800 text-slate-300">
                          <td className="px-3 py-2 font-medium text-slate-200">
                            {language === "ne" ? row.commitmentNe ?? row.commitment : row.commitment}
                          </td>
                          <td className="px-3 py-2">
                            {language === "ne" ? row.ministryNe ?? row.ministry : row.ministry}
                          </td>
                          <td className="px-3 py-2 tabular-nums whitespace-nowrap">
                            {language === "ne" ? row.timelineNe ?? row.timeline : row.timeline}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {language === "ne" ? row.budgetLinkedNe ?? row.budgetLinked : row.budgetLinked}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {language === "ne" ? row.statusNe ?? row.status : row.status}
                          </td>
                          <td className="px-3 py-2 tabular-nums whitespace-nowrap">
                            {language === "ne" ? row.percentCompleteNe ?? row.percentComplete : row.percentComplete}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {language === "ne" ? row.lastUpdatedNe ?? row.lastUpdated : row.lastUpdated}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-2 md:hidden">
                  {point.commitmentTrackingDashboard.map((row) => (
                    <div key={row.commitment} className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm">
                      <p className="font-semibold text-slate-100">
                        {language === "ne" ? row.commitmentNe ?? row.commitment : row.commitment}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.commitmentTableMinistry}: </span>
                        {language === "ne" ? row.ministryNe ?? row.ministry : row.ministry}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.commitmentTableTimeline}: </span>
                        {language === "ne" ? row.timelineNe ?? row.timeline : row.timeline}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.commitmentTableBudgetLinked}: </span>
                        {language === "ne" ? row.budgetLinkedNe ?? row.budgetLinked : row.budgetLinked}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.commitmentTableStatus}: </span>
                        {language === "ne" ? row.statusNe ?? row.status : row.status}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.commitmentTablePercentComplete}: </span>
                        {language === "ne" ? row.percentCompleteNe ?? row.percentComplete : row.percentComplete}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.commitmentTableLastUpdated}: </span>
                        {language === "ne" ? row.lastUpdatedNe ?? row.lastUpdated : row.lastUpdated}
                      </p>
                    </div>
                  ))}
                </div>
                {point.frameworkStatusOverview && point.frameworkStatusOverview.length > 0 && (
                  <div className="mt-4 rounded-md border border-slate-700 bg-slate-900/60 p-3">
                    <p className="text-sm font-semibold text-slate-100">{t.frameworkStatusOverviewTitle}</p>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-300">
                      {point.frameworkStatusOverview.map((item) => (
                        <li key={item.en}>{language === "ne" ? item.ne : item.en}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {point.commitmentFlowSteps && point.commitmentFlowSteps.length > 0 && (
                  <div className="mt-4 rounded-md border border-slate-700 bg-slate-900/60 p-3">
                    <p className="mb-2 text-sm font-semibold text-slate-100">{t.commitmentFlowTitle}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-slate-200">
                      {point.commitmentFlowSteps.flatMap((step, i) => {
                        const label = language === "ne" ? step.ne : step.en;
                        const chip = (
                          <span
                            key={`cf-${i}`}
                            className="rounded-md border border-slate-600 bg-slate-800/80 px-2 py-1 font-medium"
                          >
                            {label}
                          </span>
                        );
                        if (i === 0) return [chip];
                        return [
                          <span key={`cfa-${i}`} className="text-slate-500" aria-hidden>
                            →
                          </span>,
                          chip,
                        ];
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            {point.constitutionalAmendmentTracker && (
              <div className="mt-3 rounded-lg border border-violet-900/40 bg-slate-950/50 p-3 ring-1 ring-violet-950/30">
                <p className="mb-1 text-[15px] font-bold tracking-wide text-violet-100">{t.visualTitleAmendment}</p>
                <p className="mb-3 text-xs leading-relaxed text-slate-500">{t.amendmentTrackerDisclaimer}</p>
                <div className="hidden overflow-x-auto rounded-lg border border-slate-700 md:block">
                  <table className="min-w-[900px] text-left text-sm">
                    <thead className="bg-slate-800/70 text-slate-200">
                      <tr>
                        <th className="px-3 py-2">{t.amendmentTableArea}</th>
                        <th className="px-3 py-2">{t.deliveryTableStatus}</th>
                        <th className="px-3 py-2">{t.amendmentTablePublicConsultation}</th>
                        <th className="px-3 py-2">{t.amendmentTableDraftPublished}</th>
                        <th className="px-3 py-2">{t.amendmentTableReviewCompleted}</th>
                        <th className="px-3 py-2">{t.commitmentTableLastUpdated}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {point.constitutionalAmendmentTracker.map((row) => (
                        <tr key={row.area} className="border-t border-slate-800 text-slate-300">
                          <td className="px-3 py-2 font-medium text-slate-200">
                            {language === "ne" ? row.areaNe ?? row.area : row.area}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {language === "ne" ? row.statusNe ?? row.status : row.status}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {language === "ne" ? row.publicConsultationNe ?? row.publicConsultation : row.publicConsultation}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {language === "ne" ? row.draftPublishedNe ?? row.draftPublished : row.draftPublished}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {language === "ne" ? row.reviewCompletedNe ?? row.reviewCompleted : row.reviewCompleted}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {language === "ne" ? row.lastUpdatedNe ?? row.lastUpdated : row.lastUpdated}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-2 md:hidden">
                  {point.constitutionalAmendmentTracker.map((row) => (
                    <div key={row.area} className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm">
                      <p className="font-semibold text-slate-100">
                        {language === "ne" ? row.areaNe ?? row.area : row.area}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.deliveryTableStatus}: </span>
                        {language === "ne" ? row.statusNe ?? row.status : row.status}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.amendmentTablePublicConsultation}: </span>
                        {language === "ne" ? row.publicConsultationNe ?? row.publicConsultation : row.publicConsultation}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.amendmentTableDraftPublished}: </span>
                        {language === "ne" ? row.draftPublishedNe ?? row.draftPublished : row.draftPublished}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.amendmentTableReviewCompleted}: </span>
                        {language === "ne" ? row.reviewCompletedNe ?? row.reviewCompleted : row.reviewCompleted}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.commitmentTableLastUpdated}: </span>
                        {language === "ne" ? row.lastUpdatedNe ?? row.lastUpdated : row.lastUpdated}
                      </p>
                    </div>
                  ))}
                </div>
                {point.constitutionalReformProcessSteps && point.constitutionalReformProcessSteps.length > 0 && (
                  <div className="mt-4 rounded-md border border-violet-900/35 bg-violet-950/20 p-3">
                    <p className="mb-2 text-sm font-semibold text-violet-100">{t.constitutionalReformProcessTitle}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-slate-200">
                      {point.constitutionalReformProcessSteps.flatMap((step, i) => {
                        const label = language === "ne" ? step.ne : step.en;
                        const chip = (
                          <span
                            key={`cr-${i}`}
                            className="rounded-md border border-violet-800/50 bg-slate-900/80 px-2 py-1 font-medium text-slate-100"
                          >
                            {label}
                          </span>
                        );
                        if (i === 0) return [chip];
                        return [
                          <span key={`cra-${i}`} className="text-violet-400/80" aria-hidden>
                            →
                          </span>,
                          chip,
                        ];
                      })}
                    </div>
                  </div>
                )}
                {point.processStatusOverview && point.processStatusOverview.length > 0 && (
                  <div className="mt-4 rounded-md border border-slate-700 bg-slate-900/60 p-3">
                    <p className="text-sm font-semibold text-slate-100">{t.processStatusOverviewTitle}</p>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-300">
                      {point.processStatusOverview.map((item) => (
                        <li key={item.en}>{language === "ne" ? item.ne : item.en}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {point.inclusionMonitoringMatrix && (
              <div className="mt-3 rounded-lg border border-teal-900/45 bg-slate-950/50 p-3 ring-1 ring-teal-950/25">
                <p className="mb-1 text-[15px] font-bold tracking-wide text-teal-100">{t.visualTitleInclusion}</p>
                <p className="mb-3 text-xs leading-relaxed text-slate-500">{t.inclusionMatrixDisclaimer}</p>
                <div className="hidden overflow-x-auto rounded-lg border border-slate-700 md:block">
                  <table className="min-w-[920px] text-left text-sm">
                    <thead className="bg-slate-800/70 text-slate-200">
                      <tr>
                        <th className="px-3 py-2">{t.inclusionTableArea}</th>
                        <th className="px-3 py-2">{t.inclusionTableCurrentRecognition}</th>
                        <th className="px-3 py-2">{t.inclusionTablePolicyMechanism}</th>
                        <th className="px-3 py-2">{t.inclusionTableMeasurementApproach}</th>
                        <th className="px-3 py-2">{t.inclusionTablePublicVisibility}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {point.inclusionMonitoringMatrix.map((row) => (
                        <tr key={row.area} className="border-t border-slate-800 text-slate-300">
                          <td className="px-3 py-2 font-medium text-slate-200 align-top">
                            {language === "ne" ? row.areaNe ?? row.area : row.area}
                          </td>
                          <td className="px-3 py-2 align-top">
                            {language === "ne" ? row.currentRecognitionNe ?? row.currentRecognition : row.currentRecognition}
                          </td>
                          <td className="px-3 py-2 align-top">
                            {language === "ne"
                              ? row.policyMechanismNeededNe ?? row.policyMechanismNeeded
                              : row.policyMechanismNeeded}
                          </td>
                          <td className="px-3 py-2 align-top">
                            {language === "ne"
                              ? row.measurementApproachNe ?? row.measurementApproach
                              : row.measurementApproach}
                          </td>
                          <td className="px-3 py-2 align-top">
                            {language === "ne" ? row.publicVisibilityNe ?? row.publicVisibility : row.publicVisibility}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-2 md:hidden">
                  {point.inclusionMonitoringMatrix.map((row) => (
                    <div key={row.area} className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm">
                      <p className="font-semibold text-slate-100">
                        {language === "ne" ? row.areaNe ?? row.area : row.area}
                      </p>
                      <p className="mt-1 leading-6 text-slate-200">
                        <span className="text-slate-400">{t.inclusionTableCurrentRecognition}: </span>
                        {language === "ne" ? row.currentRecognitionNe ?? row.currentRecognition : row.currentRecognition}
                      </p>
                      <p className="mt-1 leading-6 text-slate-200">
                        <span className="text-slate-400">{t.inclusionTablePolicyMechanism}: </span>
                        {language === "ne"
                          ? row.policyMechanismNeededNe ?? row.policyMechanismNeeded
                          : row.policyMechanismNeeded}
                      </p>
                      <p className="mt-1 leading-6 text-slate-200">
                        <span className="text-slate-400">{t.inclusionTableMeasurementApproach}: </span>
                        {language === "ne"
                          ? row.measurementApproachNe ?? row.measurementApproach
                          : row.measurementApproach}
                      </p>
                      <p className="mt-1 leading-6 text-slate-200">
                        <span className="text-slate-400">{t.inclusionTablePublicVisibility}: </span>
                        {language === "ne" ? row.publicVisibilityNe ?? row.publicVisibility : row.publicVisibility}
                      </p>
                    </div>
                  ))}
                </div>
                {point.inclusionFrameworkStatus && point.inclusionFrameworkStatus.length > 0 && (
                  <div className="mt-4 rounded-md border border-slate-700 bg-slate-900/60 p-3">
                    <p className="text-sm font-semibold text-slate-100">{t.inclusionFrameworkStatusTitle}</p>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-300">
                      {point.inclusionFrameworkStatus.map((item) => (
                        <li key={item.en}>{language === "ne" ? item.ne : item.en}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {point.intergovernmentalCoordinationMatrix && (
              <div className="mt-3 rounded-lg border border-sky-900/45 bg-slate-950/50 p-3 ring-1 ring-sky-950/30">
                <p className="mb-1 text-[15px] font-bold tracking-wide text-sky-100">{t.visualTitleCoordination}</p>
                <p className="mb-3 text-xs leading-relaxed text-slate-500">{t.coordinationMatrixDisclaimer}</p>
                <div className="hidden overflow-x-auto rounded-lg border border-slate-700 md:block">
                  <table className="min-w-[1040px] text-left text-sm">
                    <thead className="bg-slate-800/70 text-slate-200">
                      <tr>
                        <th className="px-3 py-2">{t.coordTableFunction}</th>
                        <th className="px-3 py-2">{t.coordTableFederal}</th>
                        <th className="px-3 py-2">{t.coordTableProvincial}</th>
                        <th className="px-3 py-2">{t.coordTableLocal}</th>
                        <th className="px-3 py-2">{t.coordTableMechanism}</th>
                        <th className="px-3 py-2">{t.inclusionTablePublicVisibility}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {point.intergovernmentalCoordinationMatrix.map((row) => (
                        <tr key={row.function} className="border-t border-slate-800 text-slate-300">
                          <td className="px-3 py-2 font-medium text-slate-200 align-top">
                            {language === "ne" ? row.functionNe ?? row.function : row.function}
                          </td>
                          <td className="px-3 py-2 align-top">
                            {language === "ne" ? row.federalRoleNe ?? row.federalRole : row.federalRole}
                          </td>
                          <td className="px-3 py-2 align-top">
                            {language === "ne" ? row.provincialRoleNe ?? row.provincialRole : row.provincialRole}
                          </td>
                          <td className="px-3 py-2 align-top">
                            {language === "ne" ? row.localRoleNe ?? row.localRole : row.localRole}
                          </td>
                          <td className="px-3 py-2 align-top">
                            {language === "ne"
                              ? row.coordinationMechanismNe ?? row.coordinationMechanism
                              : row.coordinationMechanism}
                          </td>
                          <td className="px-3 py-2 align-top">
                            {language === "ne" ? row.publicVisibilityNe ?? row.publicVisibility : row.publicVisibility}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-2 md:hidden">
                  {point.intergovernmentalCoordinationMatrix.map((row) => (
                    <div key={row.function} className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm">
                      <p className="font-semibold text-slate-100">
                        {language === "ne" ? row.functionNe ?? row.function : row.function}
                      </p>
                      <p className="mt-1 leading-6 text-slate-200">
                        <span className="text-slate-400">{t.coordTableFederal}: </span>
                        {language === "ne" ? row.federalRoleNe ?? row.federalRole : row.federalRole}
                      </p>
                      <p className="mt-1 leading-6 text-slate-200">
                        <span className="text-slate-400">{t.coordTableProvincial}: </span>
                        {language === "ne" ? row.provincialRoleNe ?? row.provincialRole : row.provincialRole}
                      </p>
                      <p className="mt-1 leading-6 text-slate-200">
                        <span className="text-slate-400">{t.coordTableLocal}: </span>
                        {language === "ne" ? row.localRoleNe ?? row.localRole : row.localRole}
                      </p>
                      <p className="mt-1 leading-6 text-slate-200">
                        <span className="text-slate-400">{t.coordTableMechanism}: </span>
                        {language === "ne"
                          ? row.coordinationMechanismNe ?? row.coordinationMechanism
                          : row.coordinationMechanism}
                      </p>
                      <p className="mt-1 leading-6 text-slate-200">
                        <span className="text-slate-400">{t.inclusionTablePublicVisibility}: </span>
                        {language === "ne" ? row.publicVisibilityNe ?? row.publicVisibility : row.publicVisibility}
                      </p>
                    </div>
                  ))}
                </div>
                {point.coordinationSystemStatus && point.coordinationSystemStatus.length > 0 && (
                  <div className="mt-4 rounded-md border border-slate-700 bg-slate-900/60 p-3">
                    <p className="text-sm font-semibold text-slate-100">{t.coordinationSystemStatusTitle}</p>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-300">
                      {point.coordinationSystemStatus.map((item) => (
                        <li key={item.en}>{language === "ne" ? item.ne : item.en}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {point.publicServiceDeliveryTracker && (
              <div className="mt-3 rounded-lg border border-amber-900/45 bg-slate-950/50 p-3 ring-1 ring-amber-950/25">
                <p className="mb-1 text-[15px] font-bold tracking-wide text-amber-100">{t.visualTitleServiceDelivery}</p>
                <p className="mb-3 text-xs leading-relaxed text-slate-500">{t.serviceDeliveryTrackerDisclaimer}</p>
                <div className="hidden overflow-x-auto rounded-lg border border-slate-700 md:block">
                  <table className="min-w-[880px] text-left text-sm">
                    <thead className="bg-slate-800/70 text-slate-200">
                      <tr>
                        <th className="px-3 py-2">{t.serviceTableService}</th>
                        <th className="px-3 py-2">{t.serviceTableStandardTime}</th>
                        <th className="px-3 py-2">{t.serviceTableActualTime}</th>
                        <th className="px-3 py-2">{t.serviceTableGap}</th>
                        <th className="px-3 py-2">{t.serviceTableMode}</th>
                        <th className="px-3 py-2">{t.serviceTableStatus}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {point.publicServiceDeliveryTracker.map((row) => (
                        <tr key={row.service} className="border-t border-slate-800 text-slate-300">
                          <td className="px-3 py-2 font-medium text-slate-200">
                            {language === "ne" ? row.serviceNe ?? row.service : row.service}
                          </td>
                          <td className="px-3 py-2 tabular-nums whitespace-nowrap">
                            {language === "ne" ? row.standardTimeNe ?? row.standardTime : row.standardTime}
                          </td>
                          <td className="px-3 py-2 tabular-nums whitespace-nowrap">
                            {language === "ne" ? row.actualTimeNe ?? row.actualTime : row.actualTime}
                          </td>
                          <td className="px-3 py-2 tabular-nums whitespace-nowrap">
                            {language === "ne" ? row.gapNe ?? row.gap : row.gap}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {language === "ne" ? row.serviceModeNe ?? row.serviceMode : row.serviceMode}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {language === "ne" ? row.statusNe ?? row.status : row.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-2 md:hidden">
                  {point.publicServiceDeliveryTracker.map((row) => (
                    <div key={row.service} className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm">
                      <p className="font-semibold text-slate-100">
                        {language === "ne" ? row.serviceNe ?? row.service : row.service}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.serviceTableStandardTime}: </span>
                        {language === "ne" ? row.standardTimeNe ?? row.standardTime : row.standardTime}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.serviceTableActualTime}: </span>
                        {language === "ne" ? row.actualTimeNe ?? row.actualTime : row.actualTime}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.serviceTableGap}: </span>
                        {language === "ne" ? row.gapNe ?? row.gap : row.gap}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.serviceTableMode}: </span>
                        {language === "ne" ? row.serviceModeNe ?? row.serviceMode : row.serviceMode}
                      </p>
                      <p className="mt-1 text-slate-200">
                        <span className="text-slate-400">{t.serviceTableStatus}: </span>
                        {language === "ne" ? row.statusNe ?? row.status : row.status}
                      </p>
                    </div>
                  ))}
                </div>
                {point.serviceDeliverySystemStatus && point.serviceDeliverySystemStatus.length > 0 && (
                  <div className="mt-4 rounded-md border border-slate-700 bg-slate-900/60 p-3">
                    <p className="text-sm font-semibold text-slate-100">{t.serviceDeliverySystemStatusTitle}</p>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-300">
                      {point.serviceDeliverySystemStatus.map((item) => (
                        <li key={item.en}>{language === "ne" ? item.ne : item.en}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {point.visualAccountability && (
              <div className="mt-3 rounded-lg border border-slate-700/70 bg-slate-950/40 p-3">
                <p className="mb-2 text-[15px] font-bold tracking-wide text-white">{t.visualTitle}</p>
                <div className="hidden overflow-x-auto rounded-lg border border-slate-700 md:block">
                  <table className="min-w-[680px] text-left text-sm">
                    <thead className="bg-slate-800/70 text-slate-200">
                      <tr>
                        <th className="px-3 py-2">{t.area}</th>
                        <th className="px-3 py-2">{t.currentRecognition}</th>
                        <th className="px-3 py-2">{t.futureNeed}</th>
                        <th className="px-3 py-2">{t.transparencyMechanism}</th>
                        <th className="px-3 py-2">{t.safeguardStrength}</th>
                        <th className="px-3 py-2">{t.visibility}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {point.visualAccountability.map((row) => (
                        <tr key={row.area} className="border-t border-slate-800 text-slate-300">
                          <td className="px-3 py-2 font-medium text-slate-200">{language === "ne" ? row.areaNe ?? row.area : row.area}</td>
                          <td className="px-3 py-2">{language === "ne" ? row.currentRecognitionNe ?? row.currentRecognition : row.currentRecognition}</td>
                          <td className="px-3 py-2">{language === "ne" ? row.futureNeedNe ?? row.futureNeed : row.futureNeed}</td>
                          <td className="px-3 py-2">{language === "ne" ? row.transparencyNe ?? row.transparency : row.transparency}</td>
                          <td className="px-3 py-2">
                            {language === "ne"
                              ? row.safeguardStrengthNe ?? row.safeguardStrength
                              : row.safeguardStrength}
                          </td>
                          <td className="px-3 py-2">{language === "ne" ? row.visibilityNe ?? row.visibility : row.visibility}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-2 md:hidden">
                  {point.visualAccountability.map((row) => (
                    <div key={row.area} className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm">
                      <p className="font-semibold text-slate-100">{language === "ne" ? row.areaNe ?? row.area : row.area}</p>
                      <p className="mt-1 leading-6 text-slate-200">
                        <span className="text-slate-100">{t.current}:</span>{" "}
                        {language === "ne" ? row.currentRecognitionNe ?? row.currentRecognition : row.currentRecognition}
                      </p>
                      <p className="mt-1 leading-6 text-slate-200">
                        <span className="text-slate-100">{t.futureNeedShort}:</span>{" "}
                        {language === "ne" ? row.futureNeedNe ?? row.futureNeed : row.futureNeed}
                      </p>
                      <p className="mt-1 leading-6 text-slate-200">
                        <span className="text-slate-100">{t.transparencyShort}:</span>{" "}
                        {language === "ne" ? row.transparencyNe ?? row.transparency : row.transparency}
                      </p>
                      <p className="mt-1 leading-6 text-slate-200">
                        <span className="text-slate-100">{t.safeguardStrength}:</span>{" "}
                        {language === "ne"
                          ? row.safeguardStrengthNe ?? row.safeguardStrength
                          : row.safeguardStrength}
                      </p>
                      <p className="mt-1 leading-6 text-slate-200">
                        <span className="text-slate-100">{t.visibility}:</span>{" "}
                        {language === "ne" ? row.visibilityNe ?? row.visibility : row.visibility}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-md border border-slate-700 bg-slate-900/60 p-3 text-sm">
                  <p className="font-semibold text-slate-100">{t.simpleHelpTitle}</p>
                  <p className="mt-1 text-slate-200">- {t.simpleHelpSafeguard}</p>
                  <p className="mt-1 text-slate-200">- {t.simpleHelpVisibility}</p>
                </div>
              </div>
            )}
                </div>
              </details>
            )}
          </>
        )}
      </section>
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
            expanded
              ? "border border-slate-600 bg-slate-800/80 text-slate-100 hover:bg-slate-800"
              : "border border-blue-500/60 bg-blue-600/20 text-blue-100 hover:bg-blue-600/30"
          }`}
        >
          {expanded ? (
            <>
              <ChevronUp size={16} aria-hidden /> {t.collapseDetails}
            </>
          ) : (
            <>
              <ChevronDown size={16} aria-hidden /> {t.expandFullAnalysis}
            </>
          )}
        </button>
        <div className="flex flex-col gap-1.5">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:items-stretch">
            <button
              type="button"
              onClick={() => onOfficialSource(point)}
              className="flex min-h-[2.75rem] w-full items-center justify-center gap-1.5 rounded-lg border border-amber-500/45 bg-amber-500/10 px-3 py-2.5 text-center text-sm font-semibold leading-snug text-amber-100 transition-colors hover:bg-amber-500/15"
            >
              <FileText size={15} className="shrink-0 opacity-90" aria-hidden /> {t.viewOfficialSource}
            </button>
            {CAN_RECEIVE_SUBMISSIONS ? (
              <button
                type="button"
                onClick={() => setSubmissionOpen(true)}
                className="flex min-h-[2.75rem] w-full items-center justify-center gap-1.5 rounded-lg border border-blue-500/45 bg-blue-600/15 px-3 py-2.5 text-center text-sm font-semibold leading-snug text-blue-100 transition-colors hover:bg-blue-600/25"
              >
                <Share2 size={15} className="shrink-0 opacity-90" aria-hidden /> {t.suggestUpdateButton}
              </button>
            ) : (
              <button
                type="button"
                onClick={onResponseUnavailable}
                className="flex min-h-[2.75rem] w-full items-center justify-center gap-1.5 rounded-lg border border-blue-500/45 bg-blue-600/15 px-3 py-2.5 text-center text-sm font-semibold leading-snug text-blue-100 transition-colors hover:bg-blue-600/25"
              >
                <Share2 size={15} className="shrink-0 opacity-90" aria-hidden /> {t.suggestUpdateButton}
              </button>
            )}
          </div>
          <p className="px-0.5 text-center text-[10px] leading-snug text-slate-500 sm:px-1">{t.suggestUpdateButtonHint}</p>
        </div>
      </div>
      <SubmissionSendModal open={submissionOpen} point={point} onClose={() => setSubmissionOpen(false)} language={language} />
    </article>
  );
}

function SourceModal({ open, onClose, pages, currentIndex, setCurrentIndex }) {
  if (!open) return null;
  const current = pages[currentIndex];
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-3 sm:p-4">
      <div className="flex h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-white sm:text-base">Source Pages (19-page reference set)</h3>
            <p className="text-xs text-slate-400">Page {current?.page ?? "-"} of {pages.length}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-slate-300 hover:bg-slate-800" aria-label="Close source modal">
            <X size={18} />
          </button>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[260px_1fr]">
          <aside className="overflow-y-auto border-b border-slate-800 p-2 md:border-b-0 md:border-r md:p-3">
            <div className="flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-2 md:gap-2 md:overflow-visible md:pb-0">
              {pages.map((page, idx) => (
                <button
                  key={page.page}
                  onClick={() => setCurrentIndex(idx)}
                  className={`min-w-[104px] shrink-0 overflow-hidden rounded-lg border ${idx === currentIndex ? "border-blue-500" : "border-slate-700"} bg-slate-950/70 md:min-w-0`}
                >
                  <img src={page.src} alt={`Source page ${page.page}`} className="h-16 w-full object-cover md:h-28" />
                  <p className="px-1 py-1 text-[11px] text-slate-300">Page {page.page}</p>
                </button>
              ))}
            </div>
          </aside>
          <section className="relative flex min-h-0 flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 px-2 py-2 text-xs text-slate-300 sm:px-3">
              <button
                onClick={() => setCurrentIndex((prev) => (prev - 1 + pages.length) % pages.length)}
                className="rounded border border-slate-700 px-3 py-1.5 hover:bg-slate-800"
              >
                Previous
              </button>
              <span>Page {current?.page ?? "-"}</span>
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % pages.length)}
                className="rounded border border-slate-700 px-3 py-1.5 hover:bg-slate-800"
              >
                Next
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-black/20 p-2 sm:p-4">
              {current ? (
                <img
                  src={current.src}
                  alt={`Source page ${current.page} full view`}
                  className="mx-auto h-auto max-w-full rounded-lg border border-slate-700 bg-white object-contain"
                />
              ) : (
                <p className="text-sm text-slate-400">No source pages available.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ResponseModal({ open, onClose, language }) {
  const t = uiText[language];
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{t.submissionUnavailableTitle}</h3>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-300 hover:bg-slate-800" aria-label={t.modalDismiss}>
            <X size={18} />
          </button>
        </div>
        <p className="text-sm leading-relaxed text-slate-300">{t.submissionUnavailableBody}</p>
        <p className="mt-3 rounded-md border border-slate-600/80 bg-slate-950/80 p-3 text-xs leading-relaxed text-slate-400">
          {t.submissionUnavailableMaintainerNote}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-lg border border-slate-600 bg-slate-800 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-700"
        >
          {t.modalDismiss}
        </button>
      </div>
    </div>
  );
}

function Footer({ language, onDownloadJson }) {
  const t = uiText[language];
  const snapshotLine = t.footerSnapshotLine
    .replace("{{date}}", language === "ne" ? CABINET_DATA_SNAPSHOT_LABEL_NE : CABINET_DATA_SNAPSHOT_LABEL_EN)
    .replace("{{count}}", String(CABINET_DATA_POINT_COUNT));
  const printBanner = t.footerPrintBanner.replace(
    "{{date}}",
    language === "ne" ? CABINET_DATA_SNAPSHOT_LABEL_NE : CABINET_DATA_SNAPSHOT_LABEL_EN,
  );
  return (
    <footer className="border-t border-slate-800 bg-[#050913] px-4 py-6 text-sm text-slate-400 md:px-8 print:border-slate-300 print:bg-white print:text-slate-800">
      <p className="mb-4 hidden text-center text-sm font-semibold text-black print:block">{printBanner}</p>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-medium text-slate-200 print:text-slate-900">{t.platformTitle}</p>
          <p className="text-xs text-slate-500 print:text-slate-600">{t.footerTagline}</p>
          <p className="mt-2 text-xs text-slate-400 print:text-slate-700">{t.footerIdentity}</p>
          <p className="mt-2 max-w-xl text-[11px] leading-snug text-slate-500 print:text-slate-600">{t.footerTrustLine}</p>
          <p className="mt-1 max-w-xl text-[11px] leading-snug text-slate-600 print:text-slate-600">{t.footerSubmissionLine}</p>
          <div className="mt-4 rounded-lg border border-slate-700/80 bg-slate-900/40 p-3 print:border-slate-300 print:bg-slate-50">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 print:text-slate-600">{t.footerDataSnapshot}</p>
            <p className="mt-1 text-xs leading-snug text-slate-300 print:text-slate-800">{snapshotLine}</p>
            <button
              type="button"
              onClick={onDownloadJson}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/45 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/20 sm:w-auto print:hidden"
            >
              <Download size={15} className="shrink-0 opacity-90" aria-hidden />
              {t.footerDownloadJson}
            </button>
            <p className="mt-2 text-[11px] leading-snug text-slate-500 print:text-slate-600">{t.footerPrintHint}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs print:hidden">
          <a href="#home" className="hover:text-slate-200">
            {t.home}
          </a>
          <a href="#dashboard" className="hover:text-slate-200">
            {t.dashboard}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    document.documentElement.lang = language === "ne" ? "ne" : "en";
  }, [language]);
  const [search, setSearch] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("asc");
  const [modalOpen, setModalOpen] = useState(false);
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [officialSourcePoint, setOfficialSourcePoint] = useState(null);
  const firstAgendaPoint = useMemo(() => allPoints.find((p) => p.pointNumber === 1) ?? allPoints[0] ?? null, []);

  const filteredPoints = useMemo(() => {
    const term = normalizeSearchTerm(search);
    const filtered = allPoints.filter((point) => {
      const sectionMatch = pointMatchesSelectedSection(point.pointNumber, selectedSectionId);
      const statusMatch = selectedStatus === "All" || point.status === selectedStatus;
      const searchMatch = pointMatchesSearch(point, term);
      return sectionMatch && statusMatch && searchMatch;
    });

    return filtered.sort((a, b) => (sortOrder === "asc" ? a.pointNumber - b.pointNumber : b.pointNumber - a.pointNumber));
  }, [search, selectedSectionId, selectedStatus, sortOrder]);

  const tDash = uiText[language];
  const agendaSectionGroups = useMemo(() => {
    return AGENDA_SECTIONS.map((sec) => ({
      ...sec,
      points: filteredPoints.filter((p) => p.pointNumber >= sec.pointStart && p.pointNumber <= sec.pointEnd),
    }));
  }, [filteredPoints]);

  const hasActiveDashboardFilter =
    Boolean(search.trim()) || selectedSectionId !== "All" || selectedStatus !== "All";

  const activeFiltersSummary = hasActiveDashboardFilter
    ? formatActiveFiltersSummary(language, search, selectedSectionId, selectedStatus, tDash)
    : null;

  const showSpotlightCard = !hasActiveDashboardFilter && Boolean(firstAgendaPoint);

  return (
    <div className="min-h-screen bg-dashboard-bg text-slate-100 print:bg-white print:text-slate-900">
      <div className="border-b border-orange-400/35 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-4 shadow-[0_1px_0_0_rgba(251,146,60,0.12)] md:px-6 md:py-5 print:hidden">
        <h1 className="mx-auto max-w-5xl text-balance text-center text-[1.05rem] font-extrabold leading-tight tracking-tight text-white sm:text-xl md:text-2xl">
          <span className="block">{tDash.siteTopViralHeadlineLine1}</span>
          <span className="mt-1.5 block text-white">{tDash.siteTopViralHeadlineLine2}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-balance text-center text-sm font-medium leading-snug text-orange-100/95 sm:text-base">
          <span className="block">{tDash.siteTopHookLine1}</span>
          <span className="mt-0.5 block text-orange-200/90">{tDash.siteTopHookLine2}</span>
        </p>
        <div
          className="mx-auto mt-4 max-w-lg rounded-xl border border-red-500/45 bg-gradient-to-br from-red-950/50 to-slate-950/80 px-4 py-3 shadow-inner shadow-red-950/40"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <span className="relative mt-0.5 flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-35" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]" />
            </span>
            <div className="min-w-0 text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-200/90">{tDash.nepalAamaLabel}</p>
              <p className="mt-1 text-base font-bold text-red-50">{tDash.nepalAamaCritical}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-red-100/75">{tDash.nepalAamaDisclaimer}</p>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-4 flex max-w-xl justify-center sm:max-w-none">
          <button
            type="button"
            onClick={() => void shareWholeSite(language)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-500/70 bg-slate-800/90 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-black/20 hover:bg-slate-800 sm:w-auto"
          >
            <Share2 size={16} className="shrink-0 opacity-90" aria-hidden />
            {tDash.heroCtaShare}
          </button>
        </div>
      </div>
      <Navbar
        language={language}
        setLanguage={setLanguage}
        onOpenScans={() => {
          setCurrentSourceIndex(0);
          setSourceModalOpen(true);
        }}
      />
      <SiteIntro language={language} />

      <main id="dashboard" className="mx-auto mt-6 max-w-7xl scroll-mt-24 px-4 pb-10 md:px-8">
        <header className="mb-5 rounded-2xl border border-slate-600/60 bg-gradient-to-br from-slate-900 via-slate-900 to-fuchsia-950/30 px-4 py-4 shadow-lg shadow-black/25 ring-1 ring-white/5 md:px-7 md:py-5">
          <p className="max-w-3xl text-pretty text-sm font-medium leading-relaxed text-slate-300">{tDash.globalViralSubline}</p>
        </header>
        <div className="mb-4 rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-3 text-xs leading-relaxed text-slate-400 md:px-5">
          <p>{uiText[language].dashboardDisclaimer}</p>
          <p className="mt-2 border-t border-slate-700/70 pt-2 text-[11px] leading-snug text-slate-500">
            {uiText[language].dashboardQuickRead}
          </p>
        </div>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-white">{uiText[language].mainSectionTitle}</h2>
        </div>
        <div className="mb-2 inline-flex items-center gap-2 text-sm text-slate-300 print:hidden">
          <Filter size={14} /> {tDash.dashboardUseHint}
        </div>
        <div className="print:hidden">
          <FiltersBar
            language={language}
            search={search}
            setSearch={setSearch}
            selectedSectionId={selectedSectionId}
            setSelectedSectionId={setSelectedSectionId}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            showSubmissionMailtoHint={CAN_RECEIVE_SUBMISSIONS}
          />
        </div>
        {!hasActiveDashboardFilter ? (
          <div className="mb-4 rounded-xl border-2 border-fuchsia-500/40 bg-gradient-to-r from-fuchsia-950/45 via-slate-900/90 to-slate-900 px-4 py-4 shadow-md shadow-fuchsia-950/20 ring-1 ring-fuchsia-400/20 print:hidden">
            <p className="text-base font-bold tracking-tight text-fuchsia-50">{tDash.weeklyTop5Title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{tDash.weeklyTop5Lead}</p>
            <a
              href="#point-1"
              className="mt-2 inline-flex text-xs font-semibold text-fuchsia-300 underline decoration-fuchsia-500/50 underline-offset-2 hover:text-fuchsia-200"
            >
              {tDash.weeklyTop5Jump}
            </a>
          </div>
        ) : null}
        {hasActiveDashboardFilter ? (
          <>
            {activeFiltersSummary ? (
              <p className="mb-2 text-xs leading-relaxed text-slate-500">{activeFiltersSummary}</p>
            ) : null}
            {filteredPoints.length === 0 ? (
              <p className="mb-4 rounded-xl border border-slate-800 bg-slate-900/60 py-10 text-center text-sm text-slate-400">
                {tDash.filteredResultsEmpty}
              </p>
            ) : (
              <>
                <p className="mb-3 text-sm text-slate-300">
                  {filteredPoints.length === 1
                    ? tDash.filteredResultsOne
                    : tDash.filteredResultsMany.replace("{{count}}", String(filteredPoints.length))}
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredPoints.map((point) => (
                    <PointCard
                      key={point.id}
                      point={point}
                      onResponseUnavailable={() => setModalOpen(true)}
                      onOfficialSource={setOfficialSourcePoint}
                      language={language}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {showSpotlightCard && firstAgendaPoint ? (
              <section className="mb-6 scroll-mt-28" aria-labelledby="spotlight-heading">
                <h3 id="spotlight-heading" className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-200/90">
                  {tDash.spotlightSectionLabel}
                </h3>
                <PointCard
                  key={`spotlight-${firstAgendaPoint.id}`}
                  point={firstAgendaPoint}
                  spotlight
                  onResponseUnavailable={() => setModalOpen(true)}
                  onOfficialSource={setOfficialSourcePoint}
                  language={language}
                />
              </section>
            ) : null}
            <p className="mb-3 text-xs leading-relaxed text-slate-500">{tDash.agendaSectionHint}</p>
            <nav
              className="mb-4 flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4 print:hidden"
              aria-label={tDash.agendaSectionJump}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{tDash.agendaSectionJump}:</span>
              {AGENDA_SECTIONS.map((sec) => (
                <a
                  key={sec.id}
                  href={`#agenda-${sec.id}`}
                  className="rounded-md border border-slate-600 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-200 hover:border-blue-500/50 hover:bg-slate-800"
                >
                  {language === "ne" ? sec.titleNe.split(" ").slice(0, 2).join(" ") : sec.titleEn.match(/^\([^)]+\)/)?.[0] ?? sec.id}
                </a>
              ))}
            </nav>
            <div className="space-y-4">
              {agendaSectionGroups.map((section) => (
                <details
                  key={section.id}
                  id={`agenda-${section.id}`}
                  className="group scroll-mt-28 rounded-xl border border-slate-700/80 bg-slate-900/40"
                  open={section.id === "ka"}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3.5 marker:hidden [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold leading-snug text-white sm:text-base">
                        {language === "ne" ? section.titleNe : section.titleEn}
                      </h3>
                      <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
                        {tDash.agendaSectionRange.replace("{{start}}", String(section.pointStart)).replace("{{end}}", String(section.pointEnd))}
                        <span className="text-slate-500"> · </span>
                        {tDash.agendaSectionShown.replace("{{count}}", String(section.points.length))}
                      </p>
                    </div>
                    <ChevronDown
                      className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <div className="border-t border-slate-800 px-3 pb-4 pt-3 md:px-4">
                    {section.points.length === 0 ? (
                      <p className="py-6 text-center text-sm text-slate-500">{tDash.agendaSectionEmpty}</p>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {(showSpotlightCard && section.id === "ka"
                          ? section.points.filter((p) => p.pointNumber !== 1)
                          : section.points
                        ).map((point) => (
                          <PointCard
                            key={point.id}
                            point={point}
                            onResponseUnavailable={() => setModalOpen(true)}
                            onOfficialSource={setOfficialSourcePoint}
                            language={language}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer language={language} onDownloadJson={downloadCabinetAgendaJson} />
      <ResponseModal open={modalOpen} onClose={() => setModalOpen(false)} language={language} />
      <SourceModal
        open={sourceModalOpen}
        onClose={() => setSourceModalOpen(false)}
        pages={sourcePages}
        currentIndex={currentSourceIndex}
        setCurrentIndex={setCurrentSourceIndex}
      />
      <PointOfficialSourceModal
        open={Boolean(officialSourcePoint)}
        point={officialSourcePoint}
        onClose={() => setOfficialSourcePoint(null)}
        language={language}
        onOpenScans={(targetPage) => {
          setCurrentSourceIndex(sourcePageIndexForScanPage(sourcePages, targetPage));
          setSourceModalOpen(true);
        }}
      />
    </div>
  );
}
