import type { Lang } from '../context/LanguageContext'
import { integerToDevanagari } from '../utils/formatNprSavings'

type B = { en: string; ne: string }

export function tx(block: B, lang: Lang): string {
  return block[lang]
}

/** Production copy: Nepal Transparency Experience (EN + NE). */
export const transparencyExperience = {
  pageEyebrow: {
    en: 'Nepal Transparency Experience',
    ne: 'नेपाल पारदर्शिता अनुभव',
  } satisfies B,

  heroMain: {
    en: 'Where did your sweat go?',
    ne: 'तपाईंको पसिना कहाँ गयो?',
  } satisfies B,
  heroSub: {
    en: 'The Government of Nepal spends roughly NPR 18 kharab every year.',
    ne: 'नेपाल सरकारले प्रत्येक वर्ष करिब १८ खर्ब रुपैयाँ खर्च गर्छ।',
  } satisfies B,
  heroHook: {
    en: 'Yet why are roads still unfinished, services slow, and opportunity limited?',
    ne: 'तर किन अझै सडक अधुरो, सेवा ढिलो, र अवसर सीमित?',
  } satisfies B,
  heroInsight: {
    en: 'The problem is not a lack of money — it is leakage in the system.',
    ne: 'समस्या पैसाको अभाव होइन — प्रणालीको चुहावट हो।',
  } satisfies B,
  heroCredibility: {
    en: 'This experience is a simple explanation based on publicly available information and systems-level observation.',
    ne: 'यो अनुभव सार्वजनिक रूपमा उपलब्ध जानकारी र प्रणालीगत अवलोकनमा आधारित सरल व्याख्या हो।',
  } satisfies B,
  heroScroll: {
    en: 'Scroll down',
    ne: 'तल स्क्रोल गर्नुहोस्',
  } satisfies B,

  problemHeading: {
    en: 'Where does money get stuck?',
    ne: 'पैसा कहाँ अड्किन्छ?',
  } satisfies B,

  infraTitle: {
    en: 'Billion-rupee projects, years of delay',
    ne: 'अर्बौंको परियोजना, वर्षौं ढिला',
  } satisfies B,
  infraP1: {
    en: 'A budget is allocated for a project, but the work is not finished on time.',
    ne: 'परियोजनाको बजेट छुट्याइन्छ, तर काम समयमै सकिँदैन।',
  } satisfies B,
  infraP2: {
    en: 'Delays raise costs — and then more budget is needed.',
    ne: 'ढिलाइ हुँदा लागत बढ्छ — फेरि थप बजेट आवश्यक पर्छ।',
  } satisfies B,
  infraImpact: {
    en: 'Time lost, money lost.',
    ne: 'समय गयो, पैसा गयो।',
  } satisfies B,

  marketTitle: {
    en: 'Farmers earn little, consumers pay a lot',
    ne: 'किसानले पाउँछ कम, उपभोक्ताले तिर्छ धेरै',
  } satisfies B,
  marketP1: {
    en: 'Produce leaves the farm cheap, but becomes expensive by the time it reaches the market.',
    ne: 'उत्पादन खेतबाट सस्तो निस्कन्छ, तर बजारमा पुग्दा धेरै महँगो हुन्छ।',
  } satisfies B,
  marketP2: {
    en: 'When the distribution system is weak, prices stay out of balance.',
    ne: 'बीचको वितरण प्रणाली कमजोर हुँदा मूल्य असन्तुलित हुन्छ।',
  } satisfies B,
  marketImpact: {
    en: 'Cheap to produce, expensive to consume.',
    ne: 'उत्पादन सस्तो, उपभोग महँगो।',
  } satisfies B,

  debtTitle: {
    en: 'Debt is rising; outcomes stay unclear',
    ne: 'ऋण बढ्दैछ, परिणाम स्पष्ट छैन',
  } satisfies B,
  debtP1: {
    en: 'Government borrows, but it is hard to see clearly how much impact that had in each sector.',
    ne: 'सरकारले ऋण लिन्छ, तर त्यसले कुन क्षेत्रमा कति प्रभाव पार्‍यो भन्ने स्पष्ट देखिँदैन।',
  } satisfies B,
  debtImpact: {
    en: 'Debt exists; outcomes stay opaque.',
    ne: 'ऋण छ, परिणाम अस्पष्ट।',
  } satisfies B,

  problemInsight: {
    en: 'When the system is slow, citizens lose time, money, and trust — all three.',
    ne: 'जब प्रणाली ढिलो हुन्छ, नागरिकको समय, पैसा, र विश्वास तीनै गुम्छ।',
  } satisfies B,

  whyHeading: {
    en: 'Where is the problem?',
    ne: 'समस्या कहाँ छ?',
  } satisfies B,
  whyFraming: {
    en: 'The issue is not only about resources — it is also about visibility, accountability, and connected information.',
    ne: 'समस्या केवल स्रोतको होइन — दृश्यता, जिम्मेवारी, र जोडिएको सूचनाको पनि हो।',
  } satisfies B,
  whyMain: {
    en: 'The problem is not a person — it is the design of the system.',
    ne: 'समस्या व्यक्ति होइन — प्रणालीको डिजाइन हो।',
  } satisfies B,

  cause1Title: {
    en: 'No real-time visibility',
    ne: 'Real-time visibility छैन',
  } satisfies B,
  cause1Body: {
    en: 'Citizens cannot easily see whether work is actually happening.',
    ne: 'काम भइरहेको छ कि छैन — नागरिकले सजिलै देख्न सक्दैन।',
  } satisfies B,
  cause2Title: {
    en: 'Accountability arrives late',
    ne: 'Accountability ढिलो हुन्छ',
  } satisfies B,
  cause2Body: {
    en: 'Questions rise after mistakes — not while there is still time to correct course.',
    ne: 'गल्ती भएपछि मात्रै कुरा उठ्छ — समयमा होइन।',
  } satisfies B,
  cause3Title: {
    en: 'Data is not in one place',
    ne: 'Data एकै ठाउँमा छैन',
  } satisfies B,
  cause3Body: {
    en: 'Information sits in different silos — a clear picture never forms.',
    ne: 'सूचना विभिन्न ठाउँमा हुन्छ — स्पष्ट चित्र बन्न सक्दैन।',
  } satisfies B,

  whyPower: {
    en: 'Where there is no visibility, accountability weakens.',
    ne: 'जहाँ देखिँदैन, त्यहाँ जिम्मेवारी कमजोर हुन्छ।',
  } satisfies B,

  solutionHeading: {
    en: 'What can change?',
    ne: 'के परिवर्तन गर्न सकिन्छ?',
  } satisfies B,
  solutionConcept: {
    en: 'When you change the design of the system, outcomes change.',
    ne: 'प्रणालीको डिजाइन बदल्दा परिणाम बदलिन्छ।',
  } satisfies B,

  oldSystemLabel: {
    en: 'Old system',
    ne: 'पुरानो प्रणाली',
  } satisfies B,
  oldSystemItems: {
    en: ['Paper processes', 'Unclear tracking', 'Advance payment', 'Delay is normal'],
    ne: ['कागजी प्रक्रिया', 'tracking स्पष्ट छैन', 'advance payment', 'ढिलाइ सामान्य'],
  },
  newSystemLabel: {
    en: 'New system',
    ne: 'नयाँ प्रणाली',
  } satisfies B,
  newSystemItems: {
    en: [
      'Every project online',
      'Progress visible live',
      'Payment by milestone',
      'Real-time updates',
    ],
    ne: [
      'प्रत्येक परियोजना online',
      'progress live देखिन्छ',
      'milestone अनुसार भुक्तानी',
      'real-time updates',
    ],
  },

  coreLines: {
    en: [
      'Every rupee can be traced',
      'Every piece of work can be seen',
      'Every outcome can be measured',
    ],
    ne: ['प्रत्येक रुपैयाँ ट्र्याक हुन्छ', 'प्रत्येक काम देखिन्छ', 'प्रत्येक परिणाम मापन हुन्छ'],
  } satisfies { en: string[]; ne: string[] },

  globalCredibility: {
    en: 'These principles are not new — countries such as Estonia have strengthened public systems by linking digital services, and countries such as the United Kingdom have made government spending data publicly available.',
    ne: 'यी सिद्धान्तहरू नयाँ होइनन् — Estonia जस्ता देशहरूले डिजिटल सेवा र सार्वजनिक प्रणालीलाई जोडेर प्रभावकारी बनाएका छन्, र United Kingdom जस्ता देशहरूले सरकारी खर्चसम्बन्धी डेटा सार्वजनिक रूपमा उपलब्ध गराएका छन्।',
  } satisfies B,

  trustLine: {
    en: 'Transparency is not anti-government — it is a way to make government more capable.',
    ne: 'Transparency सरकारविरोधी होइन — सरकारलाई अझ सक्षम बनाउने माध्यम हो।',
  } satisfies B,

  digitalHeading: {
    en: 'Why should we wait in line?',
    ne: 'हामी किन लाइन बस्ने?',
  } satisfies B,
  digitalConcept: {
    en: 'From a line-based system toward a login-based system.',
    ne: 'Line-based system बाट login-based system तिर।',
  } satisfies B,
  digitalExamples: {
    en: [
      'License renewal → online',
      'Tax payment → instant',
      'Land records → digital',
      'Business registration → faster',
      'Birth, marriage, and civil registration → one portal',
      'Allowances and social benefits → direct digital transfer',
      'Court case status and hearing dates → track online',
      'Local permits (nama, construction) → apply and pay online',
      'Education records and exam results → verifiable digital credentials',
    ],
    ne: [
      'लाइसेन्स renewal → online',
      'कर भुक्तानी → तुरुन्त',
      'जग्गा अभिलेख → digital',
      'व्यवसाय दर्ता → छिटो',
      'जन्म / विवाह / नागरिक दर्ता → एउटै पोर्टल',
      'भत्ता र सामाजिक सुविधा → खातामै (digital transfer)',
      'मुद्दाको अवस्था / सुनुवाइ मिति → online tracking',
      'नक्सा पास / स्थानीय अनुमति → online निवेदन र भुक्तानी',
      'शैक्षिक प्रमाणपत्र / परीक्षा नतिजा → जाँच गर्न मिल्ने digital',
    ],
  } satisfies { en: string[]; ne: string[] },
  digitalExamplesFootnote: {
    en: 'These are examples, not an exhaustive list — the same idea applies to education, health, agriculture, justice, transport, and local government services.',
    ne: 'यी केही उदाहरण मात्र हुन् — शिक्षा, स्वास्थ्य, कृषि, न्याय, यातायात र स्थानीय सरकारका सेवामा पनि यही दिशामा जान सकिन्छ।',
  } satisfies B,
  digitalCore: {
    en: 'One digital identity can simplify many services.',
    ne: 'एक डिजिटल परिचयले धेरै सेवा सजिलो बनाउँछ।',
  } satisfies B,
  digitalInsight: {
    en: 'Where processes are simpler, opportunity grows.',
    ne: 'जहाँ प्रक्रिया सरल हुन्छ, त्यहाँ अवसर बढ्छ।',
  } satisfies B,

  impactSub: {
    en: 'This uses Nepal’s typical scale of annual government spending (about NPR 18 kharab) as a working reference. Move the slider to see indicative savings.',
    ne: 'यो नेपालको औसत वार्षिक सरकारी खर्चको स्तर (लगभग १८ खर्ब) लाई आधार मानेर गरिएको जनाउ हिसाब हो। स्लाइडर चलाएर कति रकम पुनः निर्देशित हुन सक्छ भन्ने हेर्नुहोस्।',
  } satisfies B,
  impactHint: {
    en: 'Indicative only: ~NPR 18 kharab (typical annual scale) × the percentage you choose.',
    ne: 'जनाउ मात्र: लगभग १८ खर्ब (वार्षिक खर्चको सामान्य स्तर) × तपाईंले छान्नुभएको प्रतिशत।',
  } satisfies B,
  impactSavingsLabel: {
    en: 'Potential savings',
    ne: 'बचत',
  } satisfies B,
  impactPercentLabel: {
    en: 'Leakage reduced',
    ne: 'चुहावट कम',
  } satisfies B,
  impactCouldEnable: {
    en: 'This could potentially:',
    ne: 'यसले सम्भावित रूपमा:',
  } satisfies B,
  impactBullets: {
    en: [
      '🏥 Expand health services',
      '🛣️ Improve local infrastructure',
      '💡 Develop digital systems',
      '🚀 Support youth entrepreneurship',
    ],
    ne: [
      '🏥 नयाँ स्वास्थ्य सेवा विस्तार गर्न सक्छ',
      '🛣️ स्थानीय पूर्वाधार सुधार गर्न सक्छ',
      '💡 डिजिटल प्रणाली विकास गर्न सक्छ',
      '🚀 युवा उद्यमशीलतालाई सहयोग गर्न सक्छ',
    ],
  } satisfies { en: string[]; ne: string[] },

  impactCategoryHealth: { en: 'Health', ne: 'स्वास्थ्य' } satisfies B,
  impactCategoryInfra: { en: 'Infrastructure', ne: 'पूर्वाधार' } satisfies B,
  impactCategoryStartup: { en: 'Startups', ne: 'उद्यमशीलता' } satisfies B,

  impactPower: {
    en: 'This is not new money — it is using what we already have in the right places.',
    ne: 'यो नयाँ पैसा होइन — भएको स्रोतलाई सही ठाउँमा प्रयोग गर्ने कुरा हो।',
  } satisfies B,

  nextHeading: {
    en: 'Go deeper',
    ne: 'अब थप बुझ्नुहोस्',
  } satisfies B,
  nextTracker: {
    en: 'Public Commitments Tracker',
    ne: 'सार्वजनिक प्रतिबद्धता ट्रयाकर',
  } satisfies B,
  nextSeries: {
    en: 'Bhimsen Thapa Series — Nepal’s first Prime Minister',
    ne: 'भिमसेन थापा श्रृङ्खला — नेपालका पहिलो प्रधानमन्त्री',
  } satisfies B,
  nextVision: {
    en: 'Desh Uthcha Vision',
    ne: 'देश उठ्छ दृष्टिकोण',
  } satisfies B,
} as const

/** Matches the slider so the title never disagrees with “चुहावट कम / X%”. */
export function impactHeadingForPercent(lang: Lang, percent: number): string {
  const p = Math.max(1, Math.min(20, Math.round(percent)))
  if (lang === 'ne') {
    const d = integerToDevanagari(p)
    if (p === 10) return `यदि हामीले ${d}% मात्र चुहावट रोक्यौं भने...`
    return `यदि हामीले ${d}% चुहावट रोक्यौं भने...`
  }
  if (p === 10) return `If we stopped only ${p}% of leakage…`
  return `If we stopped ${p}% of leakage…`
}

export type ImpactCategory = 'health' | 'infra' | 'startup'

/** Qualitative tiers vs slider only — not a costed forecast; avoids fake “N hospitals” counts. */
export function categoryImpactLine(
  lang: Lang,
  category: ImpactCategory,
  percent: number,
): string {
  const p = Math.max(1, Math.min(20, percent))
  if (lang === 'ne') {
    if (category === 'health') {
      if (p <= 6) {
        return 'स्वास्थ्य सेवा विस्तार र पहुँच सुधारमा महत्त्वपूर्ण लगानी सम्भव'
      }
      if (p <= 12) {
        return 'स्वास्थ्य पूर्वाधार र सेवा विस्तारमा ठूलो सुधार सम्भव'
      }
      return 'देशव्यापी स्वास्थ्य प्रणाली बलियो बनाउन उल्लेखनीय स्रोत सम्भव'
    }
    if (category === 'infra') {
      if (p <= 5) return 'स्थानीय सडक र मर्मतमा महत्त्वपूर्ण सुधार सम्भव'
      if (p <= 12) return 'स्थानीय सडक र मर्मतमा ठूलो सुधार सम्भव'
      return 'पूर्वाधार र मर्मतमा देशव्यापी स्तरको सुधार सम्भव'
    }
    return 'युवा उद्यमशीलता र नवप्रवर्तनलाई सहयोग गर्न ठूलो स्रोत सम्भव'
  }
  if (category === 'health') {
    if (p <= 6) {
      return 'Could meaningfully support health service access and expansion'
    }
    if (p <= 12) {
      return 'Could support major health infrastructure and service improvements'
    }
    return 'Could support significant strengthening of the health system at scale'
  }
  if (category === 'infra') {
    if (p <= 5) return 'Could enable meaningful local road and maintenance improvements'
    if (p <= 12) return 'Could enable major local road and maintenance improvements'
    return 'Could enable broad infrastructure and maintenance upgrades'
  }
  return 'Could provide substantial support for youth entrepreneurship and innovation'
}
