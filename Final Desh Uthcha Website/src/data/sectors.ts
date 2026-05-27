/**
 * Sector explorer — consistent 4-part structure (Reality → Gap → Clean → Impact).
 * Video URLs come from `V` at render time.
 */
export type SectorBlock = {
  id: string;
  title: string;
  subtitle: string;
  realityLine: string;
  realityBullets: string[];
  gapLine: string;
  gapBullets: string[];
  cleanBullets: string[];
  impactLine: string;
  /** Primary cinematic (reality / in-depth) */
  videoRealityKey:
    | "sectorHealth"
    | "sectorEducation"
    | "sectorTransport"
    | "sectorAgriculture"
    | "sectorEnergy"
    | "sectorIndustry"
    | "sectorDigital"
    | "sectorGovernance"
    | null;
  realityVideoLabel: string;
  /** Optional second clip (e.g. health clean flow) */
  videoCleanKey: "healthCleanFlow" | null;
  cleanVideoLabel: string;
};

export const SECTOR_BLOCKS: SectorBlock[] = [
  {
    id: "health",
    title: "स्वास्थ्य",
    subtitle: "सेवा प्रणाली",
    realityLine: "सेवा चाहिन्छ—तर सजिलै पुग्दैन।",
    realityBullets: ["लामो प्रतीक्षा", "चिकित्सक अभाव", "औषधि अभाव"],
    gapLine: "समस्या सुविधा होइन—प्रणाली हो।",
    gapBullets: ["चिकित्सक वितरण असन्तुलित", "आपूर्ति शृंखला कमजोर", "प्रगति ट्रयाकिङ्ग छैन"],
    cleanBullets: ["चिकित्सक तालिका देखिने", "औषधि भण्डारण स्पष्ट", "सेवा प्रगति ट्रयाकिङ्ग"],
    impactLine: "सेवा समयमै पुग्छ।",
    videoRealityKey: "sectorHealth",
    realityVideoLabel: "Health — Reality / In depth",
    videoCleanKey: "healthCleanFlow",
    cleanVideoLabel: "Health — Clean system flow",
  },
  {
    id: "education",
    title: "शिक्षा",
    subtitle: "सिकाइ प्रणाली",
    realityLine: "कक्षामा उपस्थिति छ—तर सिकाइ सक्रिय हुँदैन।",
    realityBullets: ["निष्क्रिय सिकाइ", "शिक्षक अभाव", "सीमित स्रोत"],
    gapLine: "समस्या कक्षा मात्र होइन—प्रणाली हो।",
    gapBullets: ["प्रणाली पुरानो", "प्रगति ट्रयाकिङ्ग छैन", "गुणस्तर मापन कमजोर"],
    cleanBullets: ["विद्यार्थी प्रगति ट्रयाकिङ्ग", "शिक्षक जवाफदेहिता", "डाटा आधारित सुधार"],
    impactLine: "सिकाइ गुणस्तरीय हुन्छ।",
    videoRealityKey: "sectorEducation",
    realityVideoLabel: "Education — In depth",
    videoCleanKey: null,
    cleanVideoLabel: "",
  },
  {
    id: "transport",
    title: "पूर्वाधार",
    subtitle: "परियोजना प्रणाली",
    realityLine: "परियोजना अगाडि बढ्छ—तर टुंगो धमिलो हुन्छ।",
    realityBullets: ["समयसीमा ढिला", "सडक अधुरो", "निर्माण रोकिएको अनुभव"],
    gapLine: "समस्या मात्र ठेक्का होइन—प्रणाली हो।",
    gapBullets: ["समयरेखा अस्पष्ट", "अनुगमन कमजोर", "जिम्मेवारी बाँडफाँड कम"],
    cleanBullets: ["परियोजना ट्रयाकिङ्ग", "समयरेखा सार्वजनिक", "माइलस्टोन देखिने"],
    impactLine: "समयमै पूर्वाधार पूरा हुन्छ।",
    videoRealityKey: "sectorTransport",
    realityVideoLabel: "Transport — In depth",
    videoCleanKey: null,
    cleanVideoLabel: "",
  },
  {
    id: "agriculture",
    title: "कृषि",
    subtitle: "मूल्य शृंखला",
    realityLine: "उत्पादन धेरै—तर उचित मूल्य कम।",
    realityBullets: ["किसानको आम्दानी कम", "बीचलेता बलियो", "बजार टाढो"],
    gapLine: "समस्या मात्र बजार होइन—प्रणाली हो।",
    gapBullets: ["मूल्य पारदर्शिता छैन", "भण्डारण कमजोर", "आपूर्ति शृंखला लामो"],
    cleanBullets: ["प्रत्यक्ष बजार जोड", "मूल्य देखिने", "भण्डारण र लजिस्टिक्स"],
    impactLine: "किसानले उचित मूल्य पाउँछ।",
    videoRealityKey: "sectorAgriculture",
    realityVideoLabel: "Agriculture — In depth",
    videoCleanKey: null,
    cleanVideoLabel: "",
  },
  {
    id: "energy",
    title: "ऊर्जा",
    subtitle: "वितरण प्रणाली",
    realityLine: "ऊर्जा उत्पादन हुन्छ—तर उपयोग पूर्ण देखिँदैन।",
    realityBullets: ["भार असन्तुलन", "वितरण कमजोर", "प्रणालीमाथि कम विश्वास"],
    gapLine: "समस्या मात्र उपलब्धता होइन—प्रणाली हो।",
    gapBullets: ["वितरण दक्षता कम", "प्रसारण हानि", "ग्रिड ट्रयाकिङ्ग कम"],
    cleanBullets: ["रियल-टाइम ग्रिड ट्रयाकिङ्ग", "सन्तुलित वितरण", "उपयोग देखिने"],
    impactLine: "ऊर्जा पूर्ण रूपमा उपयोग हुन्छ।",
    videoRealityKey: "sectorEnergy",
    realityVideoLabel: "Energy — In depth",
    videoCleanKey: null,
    cleanVideoLabel: "",
  },
  {
    id: "industry",
    title: "उद्योग",
    subtitle: "उत्पादन प्रणाली",
    realityLine: "लगानी छ—तर उद्योग निरन्तर चल्दैन।",
    realityBullets: ["उद्योग बन्द", "रोजगार घट्दो", "उत्पादन अनिश्चित"],
    gapLine: "समस्या मात्र पुँजी होइन—प्रणाली हो।",
    gapBullets: ["व्यवस्थापन कमजोर", "प्रणाली भंग", "आपूर्ति शृंखला अस्पष्ट"],
    cleanBullets: ["उत्पादन ट्रयाकिङ्ग", "आपूर्ति शृंखला देखिने", "गुणस्तर नियन्त्रण"],
    impactLine: "रोजगार सिर्जना हुन्छ।",
    videoRealityKey: "sectorIndustry",
    realityVideoLabel: "Industry — In depth",
    videoCleanKey: null,
    cleanVideoLabel: "",
  },
  {
    id: "digital",
    title: "डिजिटल",
    subtitle: "डाटा प्रणाली",
    realityLine: "दस्तावेज धेरै—तर डाटा एकै ठाउँमा छैन।",
    realityBullets: ["म्यानुअल प्रक्रिया", "डाटा टुक्रिएको", "सेवा ढिलो"],
    gapLine: "समस्या मात्र कर्मचारी होइन—प्रणाली हो।",
    gapBullets: ["एकीकरण छैन", "रियल-टाइम डाटा छैन", "निर्णय ढिलो"],
    cleanBullets: ["एकीकृत प्रणाली", "स्वचालन", "सार्वजनिक ट्रयाकिङ्ग"],
    impactLine: "सेवा छिटो र स्पष्ट हुन्छ।",
    videoRealityKey: "sectorDigital",
    realityVideoLabel: "Digital — In depth",
    videoCleanKey: null,
    cleanVideoLabel: "",
  },
  {
    id: "governance",
    title: "शासन",
    subtitle: "निर्णय प्रणाली",
    realityLine: "निर्णय भयो भन्ने हुन्छ—तर परिणाम स्पष्ट हुँदैन।",
    realityBullets: ["कार्यान्वयन धमिलो", "नागरिक अनुभव फरक", "जवाफदेहिता कम"],
    gapLine: "समस्या मात्र नीति होइन—प्रणाली हो।",
    gapBullets: ["प्रक्रिया अस्पष्ट", "अनुगमन कम", "निरन्तरता हराउँछ"],
    cleanBullets: ["निर्णय ट्रयाकिङ्ग", "सार्वजनिक अनुगमन", "भूमिका स्पष्ट"],
    impactLine: "निर्णय विश्वासयोग्य र छिटो हुन्छ।",
    videoRealityKey: "sectorGovernance",
    realityVideoLabel: "Shashan — In depth",
    videoCleanKey: null,
    cleanVideoLabel: "",
  },
];
