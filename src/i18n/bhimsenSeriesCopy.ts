import type { Lang } from '../context/LanguageContext'
import type { B } from './copy'
import { t } from './copy'

/** Row section titles — keys match `rowConfig[].name`. */
export const seriesVolumeRowTitle: Record<string, B> = {
  'Volume 1 - The Rebuke': {
    en: 'Volume 1 - The Rebuke',
    ne: 'भोल्युम १ — कडा प्रतिबिम्ब',
  },
  'Volume 2 - The Awakening': {
    en: 'Volume 2 - The Awakening',
    ne: 'भोल्युम २ — बोध र जागरण',
  },
  'Volume 3 - The Rise': {
    en: 'Volume 3 - The Rise',
    ne: 'भोल्युम ३ — उत्थान',
  },
  'Series Finale': {
    en: 'Series finale',
    ne: 'श्रृङ्खलाको समापन',
  },
}

/** Row descriptions — keys match `rowConfig[].name`. */
export const seriesVolumeRowDesc: Record<string, B> = {
  'Volume 1 - The Rebuke': {
    en: 'A hard reflection on silence, identity, economy, division, education, culture, and responsibility.',
    ne: 'मौनता, पहिचान, अर्थतन्त्र, विभाजन, शिक्षा, संस्कृति र जिम्मेवारीमाथिको कडा प्रतिबिम्ब।',
  },
  'Volume 2 - The Awakening': {
    en: 'A shift toward clarity—exploring infrastructure, technology, energy, and digital sovereignty.',
    ne: 'स्पष्टतातर्फ मोड — पूर्वाधार, प्रविधि, ऊर्जा र डिजिटल स्वाधीनताको अन्वेषण।',
  },
  'Volume 3 - The Rise': {
    en: 'A vision for independence, return, integrity, unity, and collective nation-building.',
    ne: 'स्वाधीनता, फर्काइ, ईमान्दारी, एकता र सामूहिक देश निर्माणको दृष्टिकोण।',
  },
  'Series Finale': {
    en: 'A closing piece — an emotional and symbolic end to the series.',
    ne: 'समापन खण्ड — श्रृङ्खलाको भावनात्मक र प्रतीकात्मक अन्त्य।',
  },
}

/** Episode `volume` field values as shown on cards and modal badges. */
export const seriesEpisodeVolumeLabel: Record<string, B> = {
  'Volume 1 - The Rebuke': {
    en: 'Volume 1 - The Rebuke',
    ne: 'भोल्युम १ — कडा प्रतिबिम्ब',
  },
  'Volume 2 - The Awakening': {
    en: 'Volume 2 - The Awakening',
    ne: 'भोल्युम २ — बोध र जागरण',
  },
  'Volume 3 - The Rise': {
    en: 'Volume 3 - The Rise',
    ne: 'भोल्युम ३ — उत्थान',
  },
  'Series Finale': {
    en: 'Series finale',
    ne: 'श्रृङ्खलाको समापन',
  },
}

export const seriesAriaNav: B = {
  en: 'Bhimsen Thapa series',
  ne: 'भिमसेन थापा श्रृङ्खला',
}

export const seriesHeroEyebrow: B = {
  en: 'Desh Uthcha — Bhimsen Thapa Series',
  ne: 'देश उठ्छ — भिमसेन थापा श्रृङ्खला',
}

export const seriesHeroTitle: B = {
  en: 'Bhimsen Thapa Speaks to Nepal',
  ne: 'भिमसेन थापाले नेपालसँग कुरा गर्दै',
}

export const seriesHeroLead: B = {
  en: 'A bold, history-inspired series on Nepal — past, present, and future.',
  ne: 'ऐतिहासिक-प्रेरित श्रृङ्खला — नेपालको विगत, वर्तमान र भविष्य।',
}

export const seriesHeroSub: B = {
  en: 'A cinematic lens on identity, responsibility, technology, self-reliance, and national awakening.',
  ne: 'पहिचान, जिम्मेवारी, प्रविधि, आत्मनिर्भरता र देशीय बोध — सिनेमाटिक प्रतिबिम्ब।',
}

export const seriesPlayEpisode1: B = {
  en: 'Play Episode 1',
  ne: 'एपिसोड १ हेर्नुहोस्',
}

export const seriesBrowse: B = {
  en: 'Browse Series',
  ne: 'श्रृङ्खला हेर्नुहोस्',
}

export const seriesAboutHeading: B = {
  en: 'About the Series',
  ne: 'श्रृङ्खलाको बारेमा',
}

export const seriesAboutBody: B = {
  en: 'Desh Uthcha is a creative, historical-inspired video series imagining how a figure like Bhimsen Thapa might respond to Nepal’s present condition. Through strong reflection, civic challenge, and future-focused vision, the series moves from rebuke to awakening to rise.',
  ne: 'देश उठ्छ भिमसेन थापाजस्तो पात्रले नेपालको वर्तमान अवस्थाप्रति कसरी प्रतिक्रिया दिन सक्छ भनी कल्पना गर्ने सिर्जनात्मक, ऐतिहासिक-प्रेरित भिडियो श्रृङ्खला हो। कडा प्रतिबिम्ब, नागरिक प्रश्न र भविष्यकेन्द्रित दृष्टिकोणमार्फत यो श्रृङ्खला आलोचनाबाट बोध र उत्थानतर्फ अग्रसर हुन्छ।',
}

export const seriesDisclaimerHeading: B = {
  en: 'Disclaimer',
  ne: 'अस्वीकरण',
}

export const seriesDisclaimerBody: B = {
  en: 'This is a creative, historical-inspired series imagining how a historical figure might respond to Nepal’s present condition. The tone is intentionally strong to provoke thought—not to insult individuals. This series is not against Nepal—it is for Nepal.',
  ne: 'यो सिर्जनात्मक, ऐतिहासिक-प्रेरित श्रृङ्खला हो जसले ऐतिहासिक पात्रले नेपालको वर्तमानमा कसरी प्रतिक्रिया दिन सक्छ भनी कल्पना गर्छ। स्वर जानाजानी बलियो राखिएको छ — सोच जगाउनका लागि, कुनै व्यक्तिलाई अपमान गर्न होइन। यो श्रृङ्खला नेपाल विरुद्ध होइन — नेपालका लागि हो।',
}

/** Tone / intensity — separate short callout visitors see first. */
export const seriesDisclaimerTone: B = {
  en: 'Some language is blunt — to spark reflection and dialogue, not to harm anyone or Nepal.',
  ne: 'केही शब्द सोझा र तीव्र छन् — सोच र संवादका लागि; कसैलाई वा नेपाललाई दुखाउन होइन।',
}

export const seriesCtaTitle: B = {
  en: 'The Future Is Not Watched. It Is Built.',
  ne: 'भविष्य हेरेर मात्र हुँदैन — बनाइन्छ।',
}

export const seriesCtaSub: B = {
  en: 'A nation rises when its people rise together.',
  ne: 'जनता सँगै उठ्दा देश उठ्छ।',
}

export const seriesCtaStart: B = {
  en: 'Start the Series',
  ne: 'श्रृङ्खला सुरु गर्नुहोस्',
}

export const seriesCtaExplore: B = {
  en: 'Explore All Episodes',
  ne: 'सबै एपिसोड हेर्नुहोस्',
}

export const seriesCtaBackHome: B = {
  en: 'Back to Home',
  ne: 'गृह फर्कनुहोस्',
}

export const seriesFooterTag: B = {
  en: 'Historical-inspired cinematic series',
  ne: 'ऐतिहासिक-प्रेरित सिनेमाटिक श्रृङ्खला',
}

export const seriesCopyright: B = {
  en: '© 2026 Desh Uthcha. All rights reserved.',
  ne: '© २०२६ देश उठ्छ। सर्वाधिकार सुरक्षित।',
}

export const seriesFooterMoreHeading: B = {
  en: 'More on this site',
  ne: 'यस साइटका अन्य पृष्ठ',
}

export const seriesFooterMoreAria: B = {
  en: 'Other pages on Desh Uthcha',
  ne: 'देश उठ्छका अन्य पृष्ठ',
}

export const seriesPlayVerb: B = {
  en: 'Play',
  ne: 'हेर्नुहोस्',
}

/** Label for the closing episode (not the national anthem). */
export const seriesFinaleKind: B = {
  en: 'Closing chapter',
  ne: 'समापन अध्याय',
}

export const seriesNavMenu: B = {
  en: 'Menu',
  ne: 'मेनु',
}

export const seriesEpisodeWord: B = {
  en: 'Episode',
  ne: 'एपिसोड',
}

export const seriesModalClose: B = {
  en: 'Close',
  ne: 'बन्द गर्नुहोस्',
}

export const seriesModalPrev: B = {
  en: '← Previous',
  ne: '← अघिल्लो',
}

export const seriesModalNext: B = {
  en: 'Next →',
  ne: 'अर्को →',
}

export const seriesModalPrevAria: B = {
  en: 'Previous episode',
  ne: 'अघिल्लो एपिसोड',
}

export const seriesModalNextAria: B = {
  en: 'Next episode',
  ne: 'अर्को एपिसोड',
}

export const seriesPlayEpisodeAria: B = {
  en: 'Play',
  ne: 'बजाउनुहोस्',
}

/** Per-episode titles and summaries — keys are episode ids. */
export const seriesEpisodeI18n: Record<number, { title: B; summary: B }> = {
  1: {
    title: { en: 'Silence', ne: 'मौनता' },
    summary: {
      en: 'This episode reflects on social silence, migration, and lost national confidence—asking whether a nation can rise while its people remain passive.',
      ne: 'सामाजिक मौनता, बसाइँसराइ र हराएको देशीय आत्मविश्वासमाथि प्रतिबिम्ब — जनता निष्क्रिय रहँदा पनि देश उठ्न सक्छ कि सक्दैन भन्ने प्रश्न।',
    },
  },
  2: {
    title: { en: 'Identity', ne: 'पहिचान' },
    summary: {
      en: 'This episode questions dependency, labor, and dignity—challenging whether true strength lies in serving others or building one’s own future.',
      ne: 'निर्भरता, श्रम र मर्यादामाथि प्रश्न — साँचो शक्ति अरूको सेवामा हो वा आफ्नो भविष्य निर्माणमा भन्ने चुनौती।',
    },
  },
  3: {
    title: { en: 'Dependency', ne: 'निर्भरता' },
    summary: {
      en: 'A reflection on remittance, land, and production—asking whether a nation can stand strong if it cannot sustain itself.',
      ne: 'रेमिट्यान्स, जमिन र उत्पादनमाथि प्रतिबिम्ब — आफैलाई धान्न नसक्ने देश कसरी बलियो उभिन सक्छ?',
    },
  },
  4: {
    title: { en: 'Division', ne: 'विभाजन' },
    summary: {
      en: 'This episode reflects on political fragmentation, media influence, and digital noise—questioning whether division is weakening national unity.',
      ne: 'राजनीतिक टुक्रिएको अवस्था, सञ्चारको प्रभाव र डिजिटल कोलाहलमाथि प्रतिबिम्ब — विभाजनले देशीय एकतालाई कमजोर पारिरहेको छ कि?',
    },
  },
  5: {
    title: { en: 'Education Crisis', ne: 'शिक्षा संकट' },
    summary: {
      en: 'A critique of education without real skill, creativity, or capability in a fast-changing technological world.',
      ne: 'द्रुत परिवर्तनशील प्राविधिक संसारमा वास्तविक सीप, सिर्जनशीलता र क्षमताविनाको शिक्षाको आलोचना।',
    },
  },
  6: {
    title: { en: 'Cultural Disconnection', ne: 'सांस्कृतिक अलगाव' },
    summary: {
      en: 'A reflection on imitation, spiritual emptiness, and disconnection from Nepal’s deeper philosophical and cultural roots.',
      ne: 'नक्कल, आध्यात्मिक खालीपन र नेपालको गहिरो दार्शनिक तथा सांस्कृतिक जरासँगको अलगावमाथि प्रतिबिम्ब।',
    },
  },
  7: {
    title: { en: 'The Turning Point', ne: 'निर्णायक मोड' },
    summary: {
      en: 'A shift from blame to responsibility—challenging people to stop complaining and start building.',
      ne: 'दोषबाट जिम्मेवारीतर्फ मोड — गुनासो छाडेर निर्माण सुरु गर्न जनतालाई चुनौती।',
    },
  },
  8: {
    title: { en: 'Breaking Barriers', ne: 'बाधाहरू तोड्दै' },
    summary: {
      en: 'A vision of infrastructure and technology transforming distance into opportunity across Nepal.',
      ne: 'पूर्वाधार र प्रविधिले दूरीलाई अवसरमा बदल्ने नेपालव्यापी दृष्टिकोण।',
    },
  },
  9: {
    title: { en: 'Power of the Himalayas', ne: 'हिमालको शक्ति' },
    summary: {
      en: 'A reimagining of the Himalayas as a foundation for digital innovation, intelligence, and global technological advantage.',
      ne: 'डिजिटल नवप्रवर्तन, बुद्धिमत्ता र वैश्विक प्राविधिक लाभको आधारका रूपमा हिमालको पुनर्कल्पना।',
    },
  },
  10: {
    title: { en: 'Energy Independence', ne: 'ऊर्जा स्वाधीनता' },
    summary: {
      en: 'A vision for turning Nepal’s water resources into energy, sovereignty, and economic strength.',
      ne: 'नेपालको जलस्रोतलाई ऊर्जा, सार्वभौमिकता र आर्थिक शक्तिमा बदल्ने दृष्टिकोण।',
    },
  },
  11: {
    title: { en: 'Digital Sovereignty', ne: 'डिजिटल स्वाधीनता' },
    summary: {
      en: 'A reflection on data, code, AI, and the new meaning of borders in a digital age.',
      ne: 'डिजिटल युगमा डाटा, कोड, AI र सीमाको नयाँ अर्थमाथि प्रतिबिम्ब।',
    },
  },
  12: {
    title: { en: 'Choosing Independence', ne: 'स्वाधीनता रोजाइ' },
    summary: {
      en: 'A challenge to dependency on aid and external support, urging economic self-reliance and dignity.',
      ne: 'सहायता र बाह्य निर्भरतालाई चुनौती — आर्थिक आत्मनिर्भरता र मर्यादाको आह्वान।',
    },
  },
  13: {
    title: { en: 'Return & Rebuild', ne: 'फर्काइ र पुनर्निर्माण' },
    summary: {
      en: 'A call to students, professionals, and the diaspora to bring their skills, knowledge, and power back into nation-building.',
      ne: 'विद्यार्थी, पेशेवर र प्रवासीलाई सीप, ज्ञान र शक्ति देश निर्माणमा फर्काउन आह्वान।',
    },
  },
  14: {
    title: { en: 'Integrity & Justice', ne: 'ईमान्दारी र न्याय' },
    summary: {
      en: 'A reflection on accountability, ethical leadership, justice, and the moral values required for national rise.',
      ne: 'जवाफदेहिता, नैतिक नेतृत्व, न्याय र देशीय उत्थानका लागि चाहिने नैतिक मूल्यमाथि प्रतिबिम्ब।',
    },
  },
  15: {
    title: { en: 'A Nation Rises', ne: 'देश उठ्छ' },
    summary: {
      en: 'The final unifying episode—calling for collective identity, shared responsibility, and a new national future.',
      ne: 'अन्तिम एकीकरण एपिसोड — सामूहिक पहिचान, साझा जिम्मेवारता र नयाँ देशीय भविष्यको आह्वान।',
    },
  },
  16: {
    title: { en: 'Closing Chapter', ne: 'समापन अध्याय' },
    summary: {
      en: 'A short closing piece — a distilled emotional and symbolic end to the series arc.',
      ne: 'छोटो समापन खण्ड — श्रृङ्खलाको भावनात्मक र प्रतीकात्मक अन्त्य।',
    },
  },
}

export function seriesLocalizedEpisodeTitle(id: number, fallback: string, lang: Lang): string {
  const block = seriesEpisodeI18n[id]?.title
  return block ? t(block, lang) : fallback
}

export function seriesLocalizedEpisodeSummary(id: number, fallback: string, lang: Lang): string {
  const block = seriesEpisodeI18n[id]?.summary
  return block ? t(block, lang) : fallback
}

export function seriesLocalizedVolume(vol: string, lang: Lang): string {
  const block = seriesEpisodeVolumeLabel[vol]
  return block ? t(block, lang) : vol
}
