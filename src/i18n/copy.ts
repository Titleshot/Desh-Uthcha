import type { Lang } from '../context/LanguageContext'

export type B = { en: string; ne: string }

export function t(block: B, lang: Lang): string {
  return block[lang]
}

/** Site-wide UI (switcher, stubs, footer nav). */
export const ui = {
  /** Site / product name by language (navbar, footer brand). */
  brandDisplay: {
    en: 'Desh Uthcha',
    ne: 'देश उठ्छ',
  } satisfies B,
  languageGroup: {
    en: 'Choose language',
    ne: 'भाषा छान्नुहोस्',
  },
  english: { en: 'English', ne: 'English' },
  nepali: { en: 'Nepali', ne: 'नेपाली' },
  home: { en: 'Home', ne: 'गृह' },
  transparency: { en: 'Transparency', ne: 'पारदर्शिता' },
  tracker: { en: 'Tracker', ne: 'ट्रयाकर' },
  series: { en: 'Series', ne: 'श्रृङ्खला' },
  vision: { en: 'Vision', ne: 'दृष्टिकोण' },
  fullWebsite: { en: 'Full website', ne: 'पूर्ण वेबसाइट' },
  about: { en: 'About', ne: 'बारेमा' },
  disclaimer: { en: 'Disclaimer', ne: 'अस्वीकरण' },
  stubNote: {
    en: 'This section will be available soon.',
    ne: 'यो खण्ड छिट्टै उपलब्ध हुनेछ।',
  },
  stubBack: { en: '← Home', ne: '← गृह' },
  scrollNext: {
    en: 'Scroll to next section',
    ne: 'अर्को खण्डमा जानुहोस्',
  },
} as const

export const landing = {
  heroHeadline: {
    en: 'A new way to understand Nepal’s story',
    ne: 'नेपालको कथा बुझ्ने नयाँ तरिका',
  } satisfies B,
  heroHook: {
    en: 'Is Nepal keeping its promises?',
    ne: 'के नेपालले आफ्ना वाचा पूरा गरिरहेको छ?',
  } satisfies B,
  heroSupport: {
    en: 'A digital platform that connects systems, history, and what comes next.',
    ne: 'प्रणाली, इतिहास र आगामी बाटोलाई जोड्ने डिजिटल मञ्च।',
  } satisfies B,
  heroEmotional: {
    en: 'We have heard much — but have we truly seen?',
    ne: 'हामीले सुनेका छौं… तर के हामीले देखेका छौं?',
  } satisfies B,
  heroSub: {
    en: 'Ask sharper questions. See the system. Imagine what’s possible.',
    ne: 'गहिरो प्रश्न, प्रणालीको नजर, र सम्भावनाको कल्पना।',
  } satisfies B,
  explorePlatform: {
    en: 'Start understanding Nepal',
    ne: 'देशलाई बुझ्न सुरु गर्नुहोस्',
  } satisfies B,
  heroDeferredAria: {
    en: 'About the platform',
    ne: 'मञ्चको परिचय',
  } satisfies B,
  whyHeading: {
    en: 'Why Desh Uthcha?',
    ne: 'किन Desh Uthcha?',
  } satisfies B,
  whySectionImageAlt: {
    en: 'Visual for the Why Desh Uthcha section',
    ne: 'किन Desh Uthcha खण्डको दृश्य',
  } satisfies B,
  whyPunch1: { en: 'Plans exist.', ne: 'योजना छन्।' } satisfies B,
  whyPunch2: { en: 'Budgets exist.', ne: 'बजेट छ।' } satisfies B,
  whyPunch3: { en: 'History exists.', ne: 'इतिहास छ।' } satisfies B,
  whyPunch4: { en: 'But clarity is missing.', ne: 'तर स्पष्टता छैन।' } satisfies B,
  whyPunchClose: {
    en: 'Desh Uthcha brings clarity.',
    ne: 'Desh Uthcha = स्पष्टता।',
  } satisfies B,
  finalWebsiteEyebrow: {
    en: 'The full Desh Uthcha experience',
    ne: 'देश उठ्छको पूर्ण अनुभव',
  } satisfies B,
  finalWebsiteTitle: {
    en: 'Desh Uthcha — cinematic story of systems and nation',
    ne: 'देश उठ्छ — प्रणाली र राष्ट्रको दृश्यात्मक कथा',
  } satisfies B,
  finalWebsiteSummary: {
    en: 'A scroll-through journey from silence to systems: the problem, the logic, sectors, trust, and what Nepal could become — told in video, data, and clear Nepali.',
    ne: 'मौनदेखि प्रणालीसम्म — समस्या, तर्क, क्षेत्र, विश्वास र नेपाल के बन्न सक्छ भन्ने दृश्यात्मक कथा। भिडियो, डाटा र स्पष्ट नेपालीमा।',
  } satisfies B,
  finalWebsiteBullet1: {
    en: 'Systems thinking — not slogans',
    ne: 'प्रणालीगत सोच — नारा होइन',
  } satisfies B,
  finalWebsiteBullet2: {
    en: 'Sectors, nation, and public trust in one arc',
    ne: 'क्षेत्र, राष्ट्र र जनविश्वास — एकै कथामा',
  } satisfies B,
  finalWebsiteBullet3: {
    en: 'Independent citizen perspective',
    ne: 'स्वतन्त्र नागरिक दृष्टिकोण',
  } satisfies B,
  finalWebsiteCta: {
    en: 'Open the full website',
    ne: 'पूर्ण वेबसाइट खोल्नुहोस्',
  } satisfies B,
  finalWebsiteImageAlt: {
    en: 'Preview of the full Desh Uthcha cinematic website',
    ne: 'देश उठ्छ पूर्ण वेबसाइटको पूर्वावलोकन',
  } satisfies B,
  ecosystemHeading: {
    en: 'The ecosystem',
    ne: 'इकोसिस्टम',
  } satisfies B,
  cardTransparencyTitle: {
    en: 'Nepal Transparency Experience',
    ne: 'नेपाल पारदर्शिता अनुभव',
  } satisfies B,
  cardTransparencyImageAlt: {
    en: 'Illustration for Nepal Transparency Experience',
    ne: 'नेपाल पारदर्शिता अनुभवको दृश्य',
  } satisfies B,
  cardTransparencyText: {
    en: 'Understand Nepal’s budget, systems, and their impact — simply and clearly.',
    ne: 'नेपालको बजेट, प्रणाली र यसको प्रभावलाई सरल र स्पष्ट रूपमा बुझ्नुहोस्।',
  } satisfies B,
  cardTransparencyCta: {
    en: 'Start seeing the facts',
    ne: 'तथ्य हेर्न सुरु गर्नुहोस्',
  } satisfies B,
  cardTrackerTitle: {
    en: 'Prime Minister Balendra Shah and the 100-point plan',
    ne: 'प्रधानमन्त्री बालेन्द्र शाह र १०० बुँदे योजना',
  } satisfies B,
  cardTrackerImageAlt: {
    en: 'Prime Minister Balendra Shah — 100-point plan, simple questions for each point',
    ne: 'प्रधानमन्त्री बालेन्द्र शाह — १०० बुँदे योजना, प्रत्येक बुँदाका सरल प्रश्न',
  } satisfies B,
  cardTrackerText: {
    en: 'Simple questions for each of the 100 points — what was promised, and what is happening. How many are truly done? You decide. (In office as Prime Minister from 27 March 2026.)',
    ne: '१०० बुँदामध्ये प्रत्येकबारे सरल प्रश्न — के वाचा भयो, के भइरहेको छ। १०० मध्ये कति पूरा भए? तपाईं आफै निर्णय गर्नुहोस्। (२०२६ मार्च २७ देखि प्रधानमन्त्रीको रूपमा कार्यभार।)',
  } satisfies B,
  cardTrackerCta: {
    en: 'See promise vs reality',
    ne: 'वाचा बनाम वास्तविकता हेर्नुहोस्',
  } satisfies B,
  cardSeriesTitle: {
    en: 'Bhimsen Thapa Series — Nepal’s first Prime Minister',
    ne: 'भिमसेन थापा श्रृङ्खला — नेपालका पहिलो प्रधानमन्त्री',
  } satisfies B,
  cardSeriesImageAlt: {
    en: 'Bhimsen Thapa — Nepal’s first Prime Minister, series visual',
    ne: 'भिमसेन थापा — नेपालका पहिलो प्रधानमन्त्री, श्रृङ्खलाको दृश्य',
  } satisfies B,
  cardSeriesText: {
    en: 'Nepal’s first Prime Minister — experience history, power, and nation-building through cinematic storytelling.',
    ne: 'नेपालका पहिलो प्रधानमन्त्री — इतिहास, शक्ति र देश निर्माणलाई दृश्यात्मक शैलीमा अनुभव गर्नुहोस्।',
  } satisfies B,
  cardSeriesCta: {
    en: 'Enter the series',
    ne: 'श्रृङ्खलामा प्रवेश गर्नुहोस्',
  } satisfies B,
  cardVisionTitle: {
    en: 'Desh Uthcha Vision',
    ne: 'देश उठ्छ दृष्टिकोण',
  } satisfies B,
  cardVisionImageAlt: {
    en: 'Desh Uthcha vision — future and systems',
    ne: 'देश उठ्छ दृष्टिकोण — भविष्य र प्रणाली',
  } satisfies B,
  cardVisionText: {
    en: 'See a systems-level view of what Nepal’s future could become.',
    ne: 'नेपालको भविष्य कस्तो हुन सक्छ भन्ने प्रणालीगत दृष्टिकोण हेर्नुहोस्।',
  } satisfies B,
  cardVisionCta: {
    en: 'Start seeing the vision',
    ne: 'दृष्टिकोण हेर्न सुरु गर्नुहोस्',
  } satisfies B,
  experienceHeading: {
    en: 'What will you experience here?',
    ne: 'यहाँ तपाईं के अनुभव गर्नुहुन्छ?',
  } satisfies B,
  experience1: {
    en: 'Clear, simple explanations',
    ne: 'स्पष्ट र सरल व्याख्या',
  } satisfies B,
  experience2: {
    en: 'Thinking grounded in data and logic',
    ne: 'data र logic आधारित सोच',
  } satisfies B,
  experience3: {
    en: 'Cinematic storytelling',
    ne: 'दृश्यात्मक कथावाचन',
  } satisfies B,
  experience4: {
    en: 'A fresh perspective on Nepal’s future',
    ne: 'नेपालको भविष्यप्रतिको नयाँ दृष्टिकोण',
  } satisfies B,
  ctaLine1: { en: 'Understand the country.', ne: 'देशलाई बुझ्नुहोस्।' } satisfies B,
  ctaLine2: { en: 'Question the country.', ne: 'देशलाई प्रश्न गर्नुहोस्।' } satisfies B,
  ctaLine3: { en: 'Imagine the country.', ne: 'देशलाई कल्पना गर्नुहोस्।' } satisfies B,
  ctaTrust: {
    en: 'This platform is not driven by any political agenda — it is an independent citizen’s perspective.',
    ne: 'यो प्लेटफर्म कुनै राजनीतिक उद्देश्यबाट प्रेरित होइन — यो एक स्वतन्त्र नागरिक दृष्टिकोण हो।',
  } satisfies B,
  footerBlurb: {
    en: 'Desh Uthcha is a citizen-inspired platform that helps make Nepal’s systems easier to understand.',
    ne: 'Desh Uthcha एक नागरिक-प्रेरित platform हो जसले नेपालको प्रणालीलाई स्पष्ट रूपमा बुझ्न मद्दत गर्छ।',
  } satisfies B,
  footerNavLabel: {
    en: 'Footer',
    ne: 'फुटर',
  } satisfies B,
  brandEyebrow: { en: 'Desh Uthcha', ne: 'देश उठ्छ' } satisfies B,
} as const

export const stubs = {
  transparency: {
    title: { en: 'Nepal Transparency Experience', ne: 'नेपाल पारदर्शिता अनुभव' } satisfies B,
  },
  tracker: {
    title: {
      en: 'Prime Minister Balendra Shah and the 100-point plan',
      ne: 'प्रधानमन्त्री बालेन्द्र शाह र १०० बुँदे योजना',
    } satisfies B,
  },
  series: {
    title: {
      en: 'Bhimsen Thapa Series — Nepal’s first Prime Minister',
      ne: 'भिमसेन थापा श्रृङ्खला — नेपालका पहिलो प्रधानमन्त्री',
    } satisfies B,
  },
  vision: {
    title: { en: 'Desh Uthcha Vision', ne: 'देश उठ्छ दृष्टिकोण' } satisfies B,
  },
} as const
