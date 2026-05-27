/** Cabinet 100-point agenda — items ७१–८५ (scans Page 14–16). */

export const cabinetPoints71to85 = [
  {
    id: "p71",
    pointNumber: 71,
    category: "Economy & Development",
    promise:
      "Promote foreign and domestic investment by ensuring a clean investment climate, implementing an automated investment approval system, strictly enforcing beneficial ownership disclosure, and applying international tax and financial transparency standards (BEPS) to curb capital flight and money laundering.",
    promiseNe:
      "वैदेशिक तथा आन्तरिक लगानी प्रवर्द्धन गर्न स्वच्छ लगानी वातावरण सुनिश्चित गर्ने, स्वचालित लगानी स्वीकृति प्रणाली लागू गर्ने, लगानीकर्ताको वास्तविक स्वामित्व (Beneficial Ownership) खुलाउने व्यवस्थालाई कडाइका साथ कार्यान्वयन गर्ने र अन्तर्राष्ट्रिय कर तथा वित्तीय पारदर्शिता मापदण्ड (Base Erosion and Profit Shifting-BEPS) लागू गरी पूँजी पलायन तथा मनी लाउण्डरिङ्ग नियन्त्रण गर्ने।",
    question:
      "What registry publishes beneficial owners in open data, which agency enforces BEPS-aligned transfer-pricing audits, and how are automated approvals tested against corruption risk?",
    questionNe:
      "लाभकारी स्वामी कुन दर्तामा खुला डेटामा, BEPS मिलान ट्रान्सफर प्राइसिङ लेखापरीक्षण कुन निकायले, र स्वचालित स्वीकृतिमा भ्रष्टाचार जोखिम कसरी परीक्षण?",
    whyThisMatters:
      "Capital flight and laundering hide in opaque ownership—automation without transparency just speeds bad money.",
    whyThisMattersNe:
      "पूँजी पलायन र धुलाइ अपारदर्शी स्वामित्वमा लुक्छ — पारदर्शिता बिना स्वचालन खराब पैसा छिटो बनाउँछ।",
    possiblePathItems: [
      "Public UBO API with update frequency rules",
      "Joint NRB-IRD risk models for related-party trades",
      "Appeal desk when auto-approval wrongly blocks legitimate FDI",
      "Annual peer review vs FATF/BEPS peer schedules",
    ],
    possiblePathItemsNe: [
      "अद्यावधिक नियमसहित सार्वजनिक UBO API",
      "सम्बन्धित पक्ष कारोबारका लागि NRB-IRD संयुक्त जोखिम नमूना",
      "कानुनी FDI रोकिए स्वतः स्वीकृतिमा पुनरावेदन डेस्क",
      "FATF/BEPS साथी तालिकाअनुसार वार्षिक सहकर्मी समीक्षा",
    ],
    systemInsight:
      "BEPS on paper is easy; simultaneous customs, tax, and banking data is where implementation lives or dies.",
    systemInsightNe:
      "BEPS कागजमा सजिलो; भन्सार, कर, बैंक डेटा एकै चोटि नआए कार्यान्वयन जिउँदै मर्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ७१ (investment climate, UBO, BEPS; scan Page 14)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ७१ (लगानी, स्वामित्व, BEPS; स्क्यान पृष्ठ १४)",
    sourceExcerpt:
      "From scan (Page 14): clean investment climate; automated approval; beneficial ownership; BEPS; capital flight and money laundering control.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १४: स्वच्छ लगानी; स्वचालित स्वीकृति; Beneficial Ownership; BEPS; पूँजी पलायन, मनी लाउण्डरिङ्ग नियन्त्रण।",
    layer1: {
      hookEmoji: "🌍",
      hook: "Clean investment climate: automated approvals, strict beneficial ownership, BEPS-aligned standards — curb flight and laundering.",
      hookNe: "स्वच्छ लगानी: स्वचालित स्वीकृति, कडा लाभकारी स्वामित्व, BEPS मिलान — पलायन र धुलाइ नियन्त्रण।",
      stakeLine: "Automation speeds both good and bad money — UBO in open data and joint tax-customs models are the test.",
      stakeLineNe: "स्वचालन राम्रो र नराम्रो दुवै पैसा छिटो बनाउँछ — खुला UBO र संयुक्त कर-भन्सार नमूना परीक्षण हो।",
      coreQuestionShort: "Public UBO registry; BEPS transfer-pricing enforcement; auto-approval corruption tests?",
      coreQuestionShortNe: "सार्वजनिक UBO दर्ता; BEPS ट्रान्सफर प्राइसिङ; स्वतः स्वीकृतिमा भ्रष्टाचार परीक्षण?",
      coreQuestion:
        "Which registry publishes beneficial owners with update duties; which agency runs BEPS-aligned transfer-pricing audits; how are automated approvals stress-tested for collusion and discretion overrides?",
      coreQuestionNe:
        "लाभकारी स्वामी कुन दर्तामा अद्यावधिक दायित्वसहित; BEPS मिलान ट्रान्सफर प्राइसिङ लेखापरीक्षण कुन निकाय; स्वचालित स्वीकृतिमा मिलेमतो र विवेक उल्ट्याउने परीक्षण कसरी?",
      quickScan: [
        {
          item: "Public beneficial-ownership API with legal update triggers and penalties",
          itemNe: "कानुनी अद्यावधिक ट्रिगर र जरिवानासहित सार्वजनिक UBO API",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Automated investment approval rules + published override log with reasons",
          itemNe: "स्वचालित लगानी स्वीकृति नियम + कारणसहित उल्ट्याउने लग प्रकाशित",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Joint IRD–NRB risk models for related-party and cross-border trades",
          itemNe: "सम्बन्धित पक्ष र सीमापार कारोबारका लागि संयुक्त आन्तरिक राजस्व-राष्ट्र बैंक नमूना",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Annual FATF/BEPS peer-alignment self-assessment published",
          itemNe: "वार्षिक FATF/BEPS सहकर्मी मिलान आत्म मूल्याङ्कन प्रकाशित",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Investment Board Nepal; IRD; Nepal Rastra Bank AML supervision; customs; Department of Money Laundering Investigation; MoF for BEPS policy.",
      primaryOwnersNe:
        "लगानी बोर्ड नेपाल; आन्तरिक राजस्व विभाग; नेपाल राष्ट्र बैंक AML पर्यवेक्षण; भन्सार; धन शुद्धीकरण अनुसन्धान विभाग; BEPS नीतिका लागि अर्थ मन्त्रालय।",
      coordinatingOfficeEn:
        "Investment integrity unit with shared analytics across tax, customs, and banking feeds.",
      coordinatingOfficeNe: "कर, भन्सार र बैंक फिडमा साझा विश्लेषणसहित लगानी अखण्डता एकाइ।",
      accountableRolesEn:
        "Quarterly public brief: UBO compliance rate, transfer-pricing adjustments, STR volumes.",
      accountableRolesNe:
        "त्रैमासिक सार्वजनिक संक्षिप्त: UBO अनुपालन दर, ट्रान्सफर प्राइसिङ समायोजन, STR आयतन।",
      timelineEn: "Rolling: UBO enforcement waves; Y1: auto-approval coverage targets; annual peer review.",
      timelineNe: "निरन्तर: UBO कार्यान्वयन लहर; Y१: स्वचालित स्वीकृति कभरेज लक्ष्य; वार्षिक सहकर्मी समीक्षा।",
      milestones: [
        {
          en: "Appeal desk when algorithms block legitimate FDI with explainable reasons.",
          ne: "व्याख्यात्मक कारणसहित एल्गोरिदमले वैध FDI रोक्दा पुनरावेदन डेस्क।",
        },
        {
          en: "Cross-border invoice matching pilot with major trading partners.",
          ne: "मुख्य व्यापार साझेदारसँग सीमापार इनभ्वाइस मिलान पाइलट।",
        },
        {
          en: "Beneficial ownership linked to company registrar and land transactions.",
          ne: "कम्पनी दर्ता र जग्गा लेनदेनसँग लाभकारी स्वामित्व जोडिएको।",
        },
      ],
      kpis: [
        {
          metricEn: "Share of large taxpayers with verified UBO chain (%)",
          metricNe: "प्रमाणित UBO श्रृङ्खला भए ठूला करदाता (%)",
          howEn: "IRD risk register vs registry.",
          howNe: "आन्तरिक राजस्व जोखिम दर्ता।",
        },
        {
          metricEn: "Median days from related-party audit start to adjustment notice",
          metricNe: "सम्बन्धित पक्ष लेखापरीक्षण सुरुदेखि समायोजन सूचनासम्म मध्यक दिन",
          howEn: "Tax case management system.",
          howNe: "कर मुद्दा व्यवस्थापन।",
        },
      ],
      risks: [
        {
          en: "Auto-approval captured by insiders — rubber-stamp digital.",
          ne: "स्वचालित स्वीकृति भित्रका मान्छेले कब्जा — डिजिटल रबर स्ट्याम्प।",
        },
        {
          en: "BEPS on paper only — customs and tax data never reconciled.",
          ne: "BEPS कागजमा मात्र — भन्सार र कर डेटा कहिल्यै मिल्दैन।",
        },
      ],
      escalation: [
        {
          en: "ICAEW or peer reviewers publish red-team report on approval algorithms.",
          ne: "ICAEW वा सहकर्मीले स्वीकृति एल्गोरिदम रातो टोली प्रतिवेदन।",
        },
        {
          en: "Share this point so clean investment means clean data (#point-71).",
          ne: "स्वच्छ लगानी भनेको स्वच्छ डेटा होस् भने साझेदारी गर्नुहोस् (#बुँदा-७१)।",
        },
      ],
      programStatusEn: "🟡 At risk — UBO, BEPS, and automated investment approval package not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — UBO, BEPS र स्वचालित लगानी स्वीकृति यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p72",
    pointNumber: 72,
    category: "Economy & Development",
    promise:
      "For organized tourism in Udayapur (Koshi area), Achham (Ramaroshan), Bajura Badimalika, Api Himal trekking route, Dordi Himal trekking route, and similar areas, complete necessary studies and submit an implementation-ready framework within one month.",
    promiseNe:
      "उदयपुर (कोशी नदी आसपास), अछाम (रामारोशन), बाजुरा बडिमालिका, अपी हिमाल ट्रेकिङ रुट, दोर्दी हिमाल ट्रेकिङ रुट लगायतका क्षेत्रमा व्यवस्थित पर्यटनका लागि आवश्यक अध्ययन गरी १ महिनाभित्र कार्यान्वयनयोग्य खाका प्रस्तुत गर्ने।",
    question:
      "What carrying-capacity limits and benefit-sharing with municipalities are in each framework, and who funds trail maintenance after month one?",
    questionNe:
      "प्रत्येक खाकामा बोक्ने क्षमता र पालिकासँग लाभ बाँडफाँड के, र एक महिनापछि पदमार्ग मर्मत कोष कहाँबाट?",
    whyThisMatters:
      "Tourism frameworks fail when they are only brochures—land use and waste plans must be binding.",
    whyThisMattersNe:
      "पर्यटन खाका ब्रोसर मात्र भए असफल — जग्गा प्रयोग र फोहोर योजना बाध्यात्मक हुनुपर्छ।",
    possiblePathItems: [
      "GIS zoning with public comment logs",
      "Waste-water and toilet standards per trail segment",
      "Local employment quotas in concession contracts",
      "Seasonal closure rules to protect ecosystems",
    ],
    possiblePathItemsNe: [
      "सार्वजनिक टिप्पणी अभिलेखसहित GIS जोनिङ",
      "पदखण्ड प्रति फोहर पानी र शौचालय मानक",
      "कन्सेसनमा स्थानीय रोजगार कोटा",
      "पारिस्थितिकी जोगाउन मौसमी बन्द नियम",
    ],
    systemInsight:
      "One month to “implementation-ready” is possible for outlines—budget lines must follow or trails erode.",
    systemInsightNe:
      "«कार्यान्वयनयोग्य» एक महिनामा रूपरेखा मात्र — बजेट पछि नआए पद बग्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ७२ (regional tourism frameworks; scan Page 14)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ७२ (क्षेत्रीय पर्यटन खाका; स्क्यान पृष्ठ १४)",
    sourceExcerpt:
      "From scan (Page 14): Udayapur, Achham, Bajura, Api/Dordi treks etc.—study and implementation-ready framework within 1 month.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १४: उदयपुर, अछाम, बाजुरा, अपी/दोर्दी आदि — अध्ययन र १ महिनामा कार्यान्वयनयोग्य खाका।",
    layer1: {
      hookEmoji: "🏔️",
      hook: "Regional tourism: Udayapur, Achham, Bajura, Api/Dordi treks — studies and implementation-ready framework in one month.",
      hookNe: "क्षेत्रीय पर्यटन: उदयपुर, अछाम, बाजुरा, अपी/दोर्दी — अध्ययन र १ महिनामा कार्यान्वयनयोग्य खाका।",
      stakeLine: "One month buys a serious outline — carrying capacity and waste budgets must be in the same PDF.",
      stakeLineNe: "एक महिनाले राम्रो रूपरेखा किन्छ — बोक्ने क्षमता र फोहोर बजेट एउटै PDF मा हुनुपर्छ।",
      coreQuestionShort: "Carrying capacity; benefit-sharing with municipalities; who funds trail maintenance after month one?",
      coreQuestionShortNe: "बोक्ने क्षमता; पालिकासँग लाभ बाँडफाँड; एक महिनापछि पदमार्ग मर्मत कोष?",
      coreQuestion:
        "What ecologically grounded visitor caps and zoning are proposed; how is revenue shared with local municipalities; which budget line funds trail maintenance and waste after the first month?",
      coreQuestionNe:
        "पारिस्थितिक आधारित आगन्तुक सीमा र जोनिङ के; स्थानीय पालिकासँग आम्दानी कसरी बाँडिन्छ; पहिलो महिनापछि पदमार्ग मर्मत र फोहोरका लागि कुन बजेट शीर्षक?",
      quickScan: [
        {
          item: "1-month framework: GIS zoning + seasonal closure rules published per site",
          itemNe: "१ महिना खाका: प्रति स्थल GIS जोनिङ + मौसमी बन्द नियम प्रकाशित",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Waste-water and toilet standards per trail segment with funding split",
          itemNe: "पदखण्ड प्रति फोहर पानी र शौचालय मानक र कोष बाँडफाँड",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Local employment quotas or benefit clauses in concession drafts",
          itemNe: "कन्सेसन मस्यौदामा स्थानीय रोजगार कोटा वा लाभ धारा",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Post-month-one O&M budget identified (federal/provincial/local)",
          itemNe: "एक महिनापछि सञ्चालन र पदमार्ग मर्मत बजेट पहिचान (संघ/प्रदेश/स्थानीय)",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Culture, Tourism and Civil Aviation; Department of National Parks and Wildlife Conservation where applicable; provincial tourism boards; concerned municipalities.",
      primaryOwnersNe:
        "संस्कृति, पर्यटन तथा नागरिक उड्डयन मन्त्रालय; लागू भए राष्ट्रिय निकुञ्ज तथा वन्यजन्तु संरक्षण विभाग; प्रदेश पर्यटन बोर्ड; सम्बन्धित पालिका।",
      coordinatingOfficeEn:
        "Regional tourism framework office with integrated environmental and infrastructure checklists.",
      coordinatingOfficeNe: "एकीकृत वातावरण र पूर्वाधार चेकलिस्टसहित क्षेत्रीय पर्यटन खाका कार्यालय।",
      accountableRolesEn:
        "Public comment log for each framework; response memo before cabinet endorsement.",
      accountableRolesNe:
        "प्रति खाका सार्वजनिक टिप्पणी अभिलेख; मन्त्रिपरिषद् अघि जवाफ मेमो।",
      timelineEn: "T+30 days: frameworks submitted; T+90: pilot permits; Y1: first season under caps.",
      timelineNe: "T+३० दिन: खाका पेश; T+९०: पाइलट अनुमति; Y१: सीमाअन्तर्गत पहिलो सिजन।",
      milestones: [
        {
          en: "Carrying-capacity model signed off by ecologists with public methodology.",
          ne: "पारिस्थितिकीज्ञले हस्ताक्षर गरेको बोक्ने क्षमता र सार्वजनिक विधि।",
        },
        {
          en: "Trail maintenance cooperative or user-fee mechanism with audit.",
          ne: "लेखापरीक्षणसहित पदमर्मत सहकारी वा प्रयोगकर्ता शुल्क।",
        },
        {
          en: "Emergency rescue SOP and insurance requirements for operators.",
          ne: "सञ्चालकका लागि उद्धार SOP र बीम आवश्यकता।",
        },
      ],
      kpis: [
        {
          metricEn: "Visitor volume vs. declared cap (%)",
          metricNe: "घोषित सीमाभन्दा आगन्तुक आयतन (%)",
          howEn: "Permit tickets vs trail counters.",
          howNe: "अनुमति टिकट बनाम पद गणक।",
        },
        {
          metricEn: "Solid waste collected vs. generated (kg) per site season",
          metricNe: "प्रति स्थल सिजन ठोस फोहोर संकलन बनाम उत्पादन (केजी)",
          howEn: "Municipal weighbridge data.",
          howNe: "पालिका तौल पुल डेटा।",
        },
      ],
      risks: [
        {
          en: "Beautiful PDFs — zero budget for maintenance after launch.",
          ne: "राम्रो PDF — सुरुवातपछि मर्मतको बजेट शून्य।",
        },
        {
          en: "Over-tourism and erosion before caps enforced.",
          ne: "सीमा लागू गर्नुअघि अधिक पर्यटन र कटाउन।",
        },
      ],
      escalation: [
        {
          en: "TAAN and local communities publish trail condition scorecards.",
          ne: "TAAN र स्थानीय समुदायले पद अवस्था स्कोरकार्ड।",
        },
        {
          en: "Share this point so trails get budgets not brochures (#point-72).",
          ne: "पदलाई ब्रोसर होइन बजेट चाहिन्छ भने साझेदारी गर्नुहोस् (#बुँदा-७२)।",
        },
      ],
      programStatusEn: "🟡 At risk — one-month implementation-ready regional tourism frameworks not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — १ महिना कार्यान्वयनयोग्य क्षेत्रीय पर्यटन खाका यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p73",
    pointNumber: 73,
    category: "Economy & Development",
    promise:
      "Make Nepal a hub for wellness tourism (Eastern philosophy, meditation, yoga, natural healing); issue a wellness tourism strategy within 15 days; thank all UN member states that voted for Nepal’s proposal to observe 15 April as International Wellness Day; treat wellness tourism as a national agenda for economic transformation; and establish an inter-agency coordination mechanism to observe “Nepal Wellness Year 2027.”",
    promiseNe:
      "नेपाललाई आरोग्य पर्यटन (पूर्वीय दर्शन, ध्यान, योग, प्राकृतिक चिकित्सा लगायत) को हब बनाउन १५ दिनभित्र आरोग्य पर्यटन रणनीति जारी गर्ने। साथै, नेपालको प्रस्तावमा संयुक्त राष्ट्रसंघले अप्रिल १५ लाई अन्तर्राष्ट्रिय आरोग्य दिवस मनाउने निर्णय गरेकोमा उक्त प्रस्तावमा मतदान गर्ने सबै सदस्य राष्ट्रहरूलाई धन्यवाद ज्ञापन गर्ने। आरोग्य पर्यटनलाई आर्थिक रूपान्तरणको राष्ट्रिय एजेण्डाको रूपमा लिई «Nepal Wellness Year २०२७» मनाउन अन्तरनिकाय समन्वय संयन्त्र बनाउने।",
    question:
      "What clinical and ethical standards separate wellness from unproven cures, and how is quality marked for international visitors?",
    questionNe:
      "क्लिनिकल र नैतिक मानकले आरोग्य र अप्रमाणित उपचार कसरी छुट्याउँछ, र अन्तर्राष्ट्रिय आगन्तुकका लागि गुणस्तर चिन्ह के?",
    whyThisMatters:
      "Wellness branding lifts Nepal only if fraud is rare and workers are trained, not just hashtags.",
    whyThisMattersNe:
      "आरोग्य ब्रान्डले जाल कम र कर्मचारी तालिम भए मात्र नेपाल उचाल्छ — हैसट्याग मात्र होइन।",
    possiblePathItems: [
      "Accreditation tiers for retreats and clinics",
      "Multilingual complaint channel with medical review",
      "Labor standards for spa and therapy staff",
      "Joint tourism-health inspection roster",
    ],
    possiblePathItemsNe: [
      "रिट्रिट र क्लिनिक प्रत्ययन तह",
      "चिकित्सकीय समीक्षासहित बहुभाषिक उजुरी",
      "स्पा र थेरापी कर्मचारी श्रम मानक",
      "पर्यटन-स्वास्थ्य संयुक्त निरीक्षण तालिका",
    ],
    systemInsight:
      "A national “wellness year” needs airport-to-village continuity—visa, transport, and insurance in one story.",
    systemInsightNe:
      "राष्ट्रिय «आरोग्य वर्ष» लाई भिसा, यातायात, बीमा एउटै कथामा चाहिन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ७३ (wellness tourism hub; UN day; Wellness Year 2027; scan Page 14)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ७३ (आरोग्य पर्यटन; स्क्यान पृष्ठ १४)",
    sourceExcerpt:
      "From scan (Page 14): wellness tourism strategy 15 days; thank all UN member states that voted for Nepal’s proposal on 15 April as International Wellness Day; national agenda; Nepal Wellness Year 2027 inter-agency mechanism.",
    sourceExcerptNe:
      "स्क्यान पृष्ठ १४: १५ दिन आरोग्य रणनीति; नेपालको प्रस्तावमा अप्रिल १५ आरोग्य दिवस पारित गर्न मतदान गर्ने सबै सदस्य राष्ट्रलाई धन्यवाद; राष्ट्रिय एजेण्डा; Wellness Year २०२७ समन्वय।",
    layer1: {
      hookEmoji: "🧘",
      hook: "Wellness tourism hub — strategy in 15 days; thank UN states for 15 April International Wellness Day; Nepal Wellness Year 2027 inter-agency mechanism.",
      hookNe: "आरोग्य पर्यटन केन्द्र — १५ दिन रणनीति; अप्रिल १५ आरोग्य दिवसका लागि UN सदस्यलाई धन्यवाद; Wellness Year २०२७ समन्वय।",
      stakeLine: "Wellness is clinical and ethical — separate evidence-based care from miracle marketing.",
      stakeLineNe: "आरोग्य नैतिक र चिकित्सकीय — प्रमाणमा आधारित र चमत्कारी बजार छुट्याउनुहोस्।",
      coreQuestionShort: "Clinical standards vs unproven cures; quality marks for visitors; airport-to-village continuity?",
      coreQuestionShortNe: "चिकित्सकीय मानक बनाम अप्रमाणित उपचार; आगन्तुकका लागि गुण चिन्ह; विमानदेखि गाउँ निरन्तरता?",
      coreQuestion:
        "What clinical and ethical standards define permissible wellness services; how are quality tiers and accreditation communicated to international visitors; are visa, transport, and insurance aligned with the wellness year narrative?",
      coreQuestionNe:
        "कुन चिकित्सकीय र नैतिक मानकले आरोग्य सेवा अनुमति दिन्छ; अन्तर्राष्ट्रिय आगन्तुकलाई गुणस्तर तह र प्रत्ययन कसरी सुनाइन्छ; भिसा, यातायात र बीम आरोग्य वर्ष कथासँग मिलेको छ?",
      quickScan: [
        {
          item: "15-day wellness tourism strategy document with scope and exclusions",
          itemNe: "१५ दिन आरोग्य पर्यटन रणनीति कागजात दायरा र बहिष्करणसहित",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Accreditation tiers for retreats, spas, and traditional medicine providers",
          itemNe: "रिट्रिट, स्पा र परम्परागत औषधि प्रदायक प्रत्ययन तह",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Multilingual complaint channel with medical review pathway",
          itemNe: "चिकित्सकीय समीक्षा मार्गसहित बहुभाषिक उजुरी",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Inter-agency Wellness Year 2027 calendar with budget lines per ministry",
          itemNe: "मन्त्रालय प्रति बजेट शीर्षकसहित Wellness Year २०२७ अन्तरनिकाय पात्रो",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Culture, Tourism and Civil Aviation; Ministry of Health and Population; Department of Drug Administration; Ayurveda and alternative medicine bodies; Nepal Tourism Board.",
      primaryOwnersNe:
        "संस्कृति, पर्यटन तथा नागरिक उड्डयन मन्त्रालय; स्वास्थ्य तथा जनजनसङ्ख्या मन्त्रालय; औषधि व्यवस्थापन विभाग; आयुर्वेद र वैकल्पिक औषधि निकाय; नेपाल पर्यटन बोर्ड।",
      coordinatingOfficeEn:
        "Wellness Year secretariat with joint tourism–health inspection roster and ethics board.",
      coordinatingOfficeNe: "संयुक्त पर्यटन-स्वास्थ्य निरीक्षण र नैतिक बोर्डसहित Wellness वर्ष सचिवालय।",
      accountableRolesEn:
        "Quarterly public report: accredited operators, complaints closed, serious incidents.",
      accountableRolesNe:
        "त्रैमासिक सार्वजनिक प्रतिवेदन: प्रत्ययन सञ्चालक, बन्द उजुरी, गम्भीर घटना।",
      timelineEn: "T+15 days: strategy published; 2026: build accreditation pipeline; 2027: full campaign with KPIs.",
      timelineNe: "T+१५ दिन: रणनीति प्रकाशित; २०२६: प्रत्ययन पाइपलाइन; २०२७: KPI सहित पूर्ण अभियान।",
      milestones: [
        {
          en: "Visitor insurance product covering wellness procedures with clear exclusions.",
          ne: "स्पष्ट बहिष्करणसहित आरोग्य प्रक्रिया बीम सहित आगन्तुक बीमा उत्पादन।",
        },
        {
          en: "Airport welcome and referral protocol for medical emergencies.",
          ne: "चिकित्सकीय आपत्कालका लागि विमानस्थल स्वागत र रेफरल प्रोटोकल।",
        },
        {
          en: "Labor standards for therapy and spa staff with training fund.",
          ne: "तालिम कोषसहित थेरापी र स्पा कर्मचारी श्रम मानक।",
        },
      ],
      kpis: [
        {
          metricEn: "Share of marketed wellness providers holding tier-1 accreditation (%)",
          metricNe: "पहिलो तह प्रत्ययन भए बजारिएका आरोग्य प्रदायक (%)",
          howEn: "Registry vs marketing site audits.",
          howNe: "दर्ता बनाम बजार साइट लेखापरीक्षा।",
        },
        {
          metricEn: "Complaint resolution median days with serious case escalations",
          metricNe: "गम्भीर मुद्दा उक्साइसहित उजुरी समाधान मध्यक दिन",
          howEn: "Ethics board ticketing.",
          howNe: "नैतिक बोर्ड टिकटिङ।",
        },
      ],
      risks: [
        {
          en: "Wellness branding attracts fraud and reputational damage.",
          ne: "आरोग्य ब्रान्डले ठगी र प्रतिष्ठा क्षति आकर्षित गर्छ।",
        },
        {
          en: "Inter-agency turf fights — health vs tourism standards diverge.",
          ne: "निकायबीच क्षेत्रीय झगडा — स्वास्थ्य बनाम पर्यटन मानक फरक।",
        },
      ],
      escalation: [
        {
          en: "Medical council and tourism board joint warning list for bad actors.",
          ne: "चिकित्सा परिषद् र पर्यटन बोर्ड संयुक्त चेतावनी सूची।",
        },
        {
          en: "Share this point so wellness stays credible (#point-73).",
          ne: "आरोग्य विश्वसनीय रहोस् भने साझेदारी गर्नुहोस् (#बुँदा-७३)।",
        },
      ],
      programStatusEn: "🟡 At risk — 15-day wellness strategy and Wellness Year 2027 mechanism not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — १५ दिन आरोग्य रणनीति र Wellness Year २०२७ संयन्त्र यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p74",
    pointNumber: 74,
    category: "Infrastructure & Energy",
    promise:
      "For energy sector development, carry out the following: (a) prepare an electricity export strategy within one month; (b) to develop the country’s energy sector as a main pillar of economic transformation, immediately remove obstacles to electricity production, transmission, distribution, and export, ensure rapid development, and decide all pending power purchase agreements (PPAs) and licence-related matters within a maximum of 180 days; (c) implement immediately a strategy focusing electricity exports on markets that yield higher prices (especially evening peak); (d) prepare a roadmap for structural reform of Nepal Electricity Authority and advance implementation immediately; (e) develop a multi-dimensional financing structure (government, private, foreign, diaspora) for long-term management of energy-sector financial resources.",
    promiseNe:
      "ऊर्जा क्षेत्र विकासका लागि देहायका कार्य गर्ने: (क) ऊर्जा निर्यात रणनीति एक महिनाभित्र तयार गर्ने। (ख) देशको ऊर्जा क्षेत्रलाई आर्थिक रूपान्तरणको प्रमुख आधारका रूपमा विकास गर्न, विद्युत् उत्पादन, प्रसारण, वितरण तथा निर्यात सम्बन्धी अवरोधहरू तत्काल हटाई द्रुत विकास सुनिश्चित गर्ने उद्देश्यले पेन्डिङ रहेका सबै विद्युत् खरिद सम्झौता (PPA) तथा अनुमतिपत्र सम्बन्धी निर्णय अधिकतम १८० दिनभित्र गर्ने। (ग) विद्युत् निर्यातलाई उच्च मूल्य प्राप्त हुने बजार (विशेष गरी साँझको पीक समय) मा केन्द्रित गर्ने रणनीति तत्कालै कार्यान्वयनमा लैजाने। (घ) नेपाल विद्युत् प्राधिकरणको संरचनात्मक सुधार सम्बन्धी रोडम्याप तयार गरी कार्यान्वयन प्रक्रिया तत्काल अघि बढाउने। (ङ) ऊर्जा क्षेत्रको दीर्घकालीन वित्तीय स्रोत व्यवस्थापनका लागि बहुआयामिक वित्तीय संरचना (सरकारी, निजी, विदेशी तथा डायस्पोरा लगानी) विकास गर्ने।",
    question:
      "What independent review approves PPA tariffs, how are community consent and river ecology weighed in the 180-day clock, and is NEA unbundling on the published roadmap?",
    questionNe:
      "PPA दर कुन स्वतन्त्र समीक्षाले स्वीकार्छ, १८० दिने घडीमा समुदाय सहमति र नदी पारिस्थितिकी कसरी, र NEA अनबन्डलिङ प्रकाशित रोडम्यापमा छ?",
    whyThisMatters:
      "Electricity is the economy’s throttle—opaque PPAs and stalled licences have cost decades.",
    whyThisMattersNe:
      "बिजुली अर्थतन्त्रको थ्रटल हो — अपारदर्शी PPA र अड्किएको अनुमति दशक खर्च गर्छ।",
    possiblePathItems: [
      "Published PPA decision register with reasons",
      "Community benefit agreements template",
      "NEA performance contracts with public KPIs",
      "Diaspora bond prospectus with risk disclosure",
    ],
    possiblePathItemsNe: [
      "कारणसहित प्रकाशित PPA निर्णय दर्ता",
      "समुदाय लाभ सम्झौता नमूना",
      "सार्वजनिक KPI सहित NEA प्रदर्शन सम्झौता",
      "जोखिम खुलाइएको डायस्पोरा बन्ड प्रोस्पेक्टस",
    ],
    systemInsight:
      "One hundred eighty days for all pending PPAs is a credibility bet—miss it and developers price in political risk forever.",
    systemInsightNe:
      "सबै पेन्डिङ PPA का लागि १८० दिन विश्वसनीयता दाउ — चुकियो भने विकासकले सधैं राजनीतिक जोखिम मूल्याङ्कन गर्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ७४ (energy export, PPAs 180d, NEA reform, finance; scan Page 14, section ज)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ७४ (ऊर्जा; स्क्यान पृष्ठ १४, खण्ड ज)",
    sourceExcerpt:
      "From scan (ज): export strategy 1 month; clear obstacles; pending PPA/licences max 180 days; peak export strategy; NEA reform roadmap; multi-source long-term finance.",
    sourceExcerptNe:
      "स्क्यान (ज): १ महिना निर्यात रणनीति; अवरोध हटाउने; PPA/अनुमति १८० दिन; पीक निर्यात; NEA सुधार; बहु स्रोत वित्त।",
    layer1: {
      hookEmoji: "⚡",
      hook: "Energy: export strategy in 1 month; clear obstacles; all pending PPAs and licences decided within 180 days; peak-price export focus; NEA reform roadmap; multi-source long-term finance.",
      hookNe: "ऊर्जा: १ महिना निर्यात रणनीति; अवरोध हटाउने; पेन्डिङ PPA/अनुमति १८० दिन; पीक निर्यात; NEA सुधार रोडम्याप; बहु स्रोत दीर्घ वित्त।",
      stakeLine: "180 days for every pending PPA is a credibility bet — miss it and developers price political risk forever.",
      stakeLineNe: "सबै पेन्डिङ PPA का लागि १८० दिन विश्वासको दाउ — चुकियो भने विकासकले सधैं राजनीतिक जोखिम मूल्याङ्कन गर्छ।",
      coreQuestionShort: "Independent PPA tariff review; community and ecology in the 180-day clock; NEA unbundling on roadmap?",
      coreQuestionShortNe: "स्वतन्त्र PPA दर समीक्षा; १८० दिन घडीमा समुदाय र पारिस्थितिकी; NEA अनबन्डलिङ रोडम्याप?",
      coreQuestion:
        "What independent body signs off on PPA terms and risk allocation; how are community consent and river ecology integrated into the 180-day decision clock; is NEA structural reform sequenced with milestones on the published roadmap?",
      coreQuestionNe:
        "PPA सर्त र जोखिम बाँडफाँड कुन स्वतन्त्र निकायले स्वीकार्छ; १८० दिन निर्णय घडीमा समुदाय सहमति र नदी पारिस्थितिकी कसरी जोडिन्छ; NEA संरचनात्मक सुधार प्रकाशित रोडम्यापमा कोसेङ्कसहित छ?",
      quickScan: [
        {
          item: "1-month electricity export strategy: markets, transmission, pricing assumptions",
          itemNe: "१ महिना बिजुली निर्यात रणनीति: बजार, प्रसारण, मूल्य धारणा",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Published register of pending PPAs/licences with decision dates and reasons",
          itemNe: "निर्णय मिति र कारणसहित पेन्डिङ PPA/अनुमति दर्ता प्रकाशित",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Peak-evening export strategy tied to grid data and contracts",
          itemNe: "ग्रिड डेटा र सम्झौतासँग जोडिएको साँझ पीक निर्यात रणनीति",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "NEA reform roadmap with governance, loss-reduction, and unbundling options",
          itemNe: "शासन, हानि घटाउने र अनबन्डलिङ विकल्पसहित NEA सुधार रोडम्याप",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Energy, Water Resources and Irrigation; Nepal Electricity Authority; Electricity Regulatory Commission; MoF for sovereign guarantees and diaspora instruments.",
      primaryOwnersNe:
        "ऊर्जा, जलस्रोत तथा सिँचाइ मन्त्रालय; नेपाल विद्युत् प्राधिकरण; विद्युत् नियमन आयोग; प्रभुत्त्व ग्यारेन्टी र डायस्पोरा उपकरणका लागि अर्थ मन्त्रालय।",
      coordinatingOfficeEn:
        "Energy sector delivery office with weekly PPA decision tracker and red-team grid studies.",
      coordinatingOfficeNe: "हप्तामा PPA निर्णय ट्र्याकर र रातो टोली ग्रिड अध्ययनसहित ऊर्जा कार्यान्वयन कार्यालय।",
      accountableRolesEn:
        "Fortnightly public scoreboard: PPAs decided vs. remaining; average days to signature.",
      accountableRolesNe:
        "पखेत्रे सार्वजनिक स्कोरबोर्ड: निर्णय भए बनाम बाँकी PPA; हस्ताक्षरसम्म औसत दिन।",
      timelineEn: "T+30 days: export strategy; T+180: all listed pending items decided or formally withdrawn; NEA reform parallel track.",
      timelineNe: "T+३० दिन: निर्यात रणनीति; T+१८०: सूचीका सबै पेन्डिङ निर्णय वा औपचारिक फिर्ता; NEA सुधार समानान्तर।",
      milestones: [
        {
          en: "Community benefit agreement template for hydropower projects.",
          ne: "जलविद्युत आयोजनाका लागि समुदाय लाभ सम्झौता नमूना।",
        },
        {
          en: "Transparent curtailment and spill data for export negotiations.",
          ne: "निर्यात वार्ताका लागि पारदर्शी कटौती र खोला डेटा।",
        },
        {
          en: "Diaspora bond or instrument prospectus with independent risk disclosure.",
          ne: "स्वतन्त्र जोखिम खुलाइएको डायस्पोरा बन्ड वा उपकरण प्रोस्पेक्टस।",
        },
      ],
      kpis: [
        {
          metricEn: "Cumulative MW under PPAs signed per quarter vs. plan",
          metricNe: "योजना बनाम त्रैमासिक हस्ताक्षर भए PPA अन्तर्गत MW",
          howEn: "ERC and NEA registers.",
          howNe: "आयोग र NEA दर्ता।",
        },
        {
          metricEn: "System average interruption duration (SAIDI) trend year on year",
          metricNe: "वर्ष प्रति वर्ष SAIDI प्रवृत्ति",
          howEn: "NEA distribution reporting.",
          howNe: "NEA वितरण प्रतिवेदन।",
        },
      ],
      risks: [
        {
          en: "Political interference in PPA tariffs destroys bankability.",
          ne: "PPA दरमा राजनीतिक हस्तक्षेप बैंकयोग्यता मेटाउँछ।",
        },
        {
          en: "Transmission bottlenecks — signed PPAs without electrons delivered.",
          ne: "प्रसारण बोतलनेक — हस्ताक्षर भए पनि इलेक्ट्रन नपुग्ने।",
        },
      ],
      escalation: [
        {
          en: "Independent power producers association publishes decision-delay table.",
          ne: "स्वतन्त्र उत्पादक संघले निर्णय ढिलाइ तालिका।",
        },
        {
          en: "Share this point so electrons become contracts (#point-74).",
          ne: "इलेक्ट्रन सम्झौतामा परिणत होस् भने साझेदारी गर्नुहोस् (#बुँदा-७४)।",
        },
      ],
      programStatusEn: "🟡 At risk — energy export strategy, 180-day PPA/licence decisions, and NEA reform roadmap not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ऊर्जा निर्यात रणनीति, १८० दिन PPA/अनुमति र NEA सुधार रोडम्याप यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p75",
    pointNumber: 75,
    category: "Infrastructure & Basic Services",
    promise:
      "To end weak coordination among bodies in drinking water and sanitation, form a high-level Integrated Water Supply Coordination Task Force led by the Office of the Prime Minister and Council of Ministers including Kathmandu Valley Water Supply Limited, Nepal Water Supply Corporation, and the Department of Water Supply and Sewerage Management; it shall submit an integrated structure and reform proposal within 30 days.",
    promiseNe:
      "खानेपानी तथा सरसफाइ क्षेत्रका विभिन्न निकायबीच समन्वयको अभाव अन्त्य गर्न प्रधानमन्त्री तथा मन्त्रिपरिषद् कार्यालयको नेतृत्वमा काठमाडौं उपत्यका खानेपानी लिमिटेड, नेपाल खानेपानी संस्थान र खानेपानी तथा ढल व्यवस्थापन विभाग समावेश गरी उच्चस्तरीय «एकीकृत खानेपानी समन्वय टास्कफोर्स» गठन गर्ने। सोले ३० दिनभित्र एकीकृत संरचना र सुधार प्रस्ताव पेश गर्ने।",
    question:
      "Who owns the bulk water budget after integration, how are leakage and non-revenue water targets enforced, and what role do municipalities get in governance?",
    questionNe:
      "एकीकरणपछि थोक पानी बजेट कस्को, चुहावट र गैर-आम्दानी पानी लक्ष्य कसरी लागू, र शासनमा पालिकाको भूमिका के?",
    whyThisMatters:
      "Kathmandu’s water crisis is institutional fragmentation—another committee without merger authority repeats the pattern.",
    whyThisMattersNe:
      "काठमाडौंको पानी संकट संस्थागत खण्डन हो — मर्ज अधिकार बिना अर्को समिति उही नमूना।",
    possiblePathItems: [
      "Single asset register for pipes and plants",
      "Ring-fenced capital budget for trunk mains",
      "Citizen water-quality dashboard by ward",
      "Tariff path with lifeline block for poor households",
    ],
    possiblePathItemsNe: [
      "पाइप र प्लान्टका लागि एकै सम्पत्ति दर्ता",
      "मुख्य लाइनका लागि छुट्टै पूँजी बजेट",
      "वडा अनुसार नागरिक पानी गुणस्तर ड्यासबोर्ड",
      "गरिब घरधुरीका लागि जीवनरेखा खण्डसहित दर पथ",
    ],
    systemInsight:
      "Thirty days for a structural proposal is tight—if it avoids naming who loses a chair, it is not a reform.",
    systemInsightNe:
      "संरचनात्मक प्रस्ताव ३० दिन कडा — कसको कुर्सी जान्छ ननाम लिए सुधार होइन।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ७५ (KV integrated water task force; scan Page 15)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ७५ (खानेपानी टास्कफोर्स; स्क्यान पृष्ठ १५)",
    sourceExcerpt:
      "From scan (ज/continuing): PM-led Integrated Water Supply Task Force with KV agencies; integrated structure & reform proposal in 30 days.",
    sourceExcerptNe:
      "स्क्यान: प्रधानमन्त्री नेतृत्व एकीकृत खानेपानी टास्कफोर्स; ३० दिनमा संरचना र सुधार प्रस्ताव।",
    layer1: {
      hookEmoji: "💧",
      hook: "PM-led Integrated Water Supply Task Force — KV Water, NWSC, DoWSSM — integrated structure and reform proposal in 30 days.",
      hookNe: "प्रधानमन्त्री नेतृत्व एकीकृत खानेपानी टास्कफोर्स — उपत्यका, संस्थान, विभाग — ३० दिनमा संरचना र सुधार प्रस्ताव।",
      stakeLine: "Another task force fails if it does not name who loses a chair — merge data before merging letterheads.",
      stakeLineNe: "कसको कुर्सी जान्छ ननाम लिए कार्यदल असफल — लेटरहेड अघि डेटा मर्ज गर्नुहोस्।",
      coreQuestionShort: "Bulk water budget owner post-merge; NRW targets; municipal role in governance?",
      coreQuestionShortNe: "एकीकरणपछि थोक पानी बजेट मालिक; गैर-आम्दानी पानी लक्ष्य; शासनमा पालिका?",
      coreQuestion:
        "After integration, which entity owns capital and O&M budgets for bulk supply; how are leakage and non-revenue water targets enforced with metering data; what voting or oversight role do municipalities get in the new governance?",
      coreQuestionNe:
        "एकीकरणपछि थोक आपूर्तिका लागि पूँजी र सञ्चालन बजेट कस्को; मिटरिङ डेटासहित चुहावट र गैर-आम्दानी पानी लक्ष्य कसरी लागू; नयाँ शासनमा पालिकालाई कस्तो मतदान वा निगरानी भूमिका?",
      quickScan: [
        {
          item: "30-day proposal: org design, asset transfer, and single customer bill path",
          itemNe: "३० दिन प्रस्ताव: संस्था डिजाइन, सम्पत्ति हस्तान्तरण, एकै ग्राहक बिल मार्ग",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Single asset register for pipes, plants, and valves across KV agencies",
          itemNe: "उपत्यका निकायबीच पाइप, प्लान्ट र भल्भ एकै सम्पत्ति दर्ता",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Published NRW baseline and quarterly reduction targets with metering plan",
          itemNe: "प्रकाशित NRW आधाररेखा र त्रैमासिक घटाउने लक्ष्य मिटरिङ योजनासहित",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Municipal representation on board with decision rights on tariffs and capex",
          itemNe: "दर र पूँजी खर्चमा निर्णय अधिकारसहित पालिका प्रतिनिधित्व बोर्डमा",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Office of the Prime Minister task force chair; Kathmandu Valley Water Supply Limited; Nepal Water Supply Corporation; Department of Water Supply and Sewerage Management; concerned municipalities.",
      primaryOwnersNe:
        "प्रधानमन्त्री कार्यालय अध्यक्ष कार्यदल; काठमाडौं उपत्यका खानेपानी लिमिटेड; नेपाल खानेपानी संस्थान; खानेपानी तथा ढल व्यवस्थापन विभाग; सम्बन्धित पालिका।",
      coordinatingOfficeEn:
        "Technical secretariat with hydraulic model, NRW diagnostics, and ring-fenced trunk main budget.",
      coordinatingOfficeNe: "हाइड्रोलिक मोडेल, NRW निदान र मुख्य लाइनका लागि छुट्टै बजेटसहित प्राविधिक सचिवालय।",
      accountableRolesEn:
        "Weekly public water dashboard: production, leakage estimate, hours of supply by zone.",
      accountableRolesNe:
        "हप्तामा सार्वजनिक पानी ड्यासबोर्ड: उत्पादन, चुहावट अनुमान, क्षेत्र अनुसार आपूर्ति घण्टा।",
      timelineEn: "T+30 days: structural proposal; M3: cabinet decision on merger option; Y1: pilot unified billing in one municipality.",
      timelineNe: "T+३० दिन: संरचनात्मक प्रस्ताव; M३: मर्ज विकल्पमा मन्त्रिपरिषद् निर्णय; Y१: एक पालिकामा पाइलट एकीकृत बिलिङ।",
      milestones: [
        {
          en: "Hydraulic model calibration with SCADA data from major treatment plants.",
          ne: "मुख्य प्रशोधन केन्द्र SCADA डेटासहित हाइड्रोलिक मोडेल क्यालिब्रेसन।",
        },
        {
          en: "Citizen water-quality sampling published by ward with lab chain of custody.",
          ne: "वडा अनुसार नागरिक पानी गुणस्तर नमूना प्रयोगशाला श्रृङ्खला सहित प्रकाशित।",
        },
        {
          en: "Lifeline tariff block for poor households with cross-subsidy transparency.",
          ne: "गरिब घरधुरीका लागि जीवनरेखा दर खण्ड क्रस-सब्सिडी पारदर्शितासहित।",
        },
      ],
      kpis: [
        {
          metricEn: "Non-revenue water (%) year on year",
          metricNe: "वर्ष प्रति वर्ष गैर-आम्दानी पानी (%)",
          howEn: "Water balance audits.",
          howNe: "पानी सन्तुलन लेखापरीक्षा।",
        },
        {
          metricEn: "Median hours of supply per week in worst-served wards",
          metricNe: "सबैभन्दा नराम्रो सेवा वडामा हप्तामा मध्यक आपूर्ति घण्टा",
          howEn: "Zone metering and customer surveys.",
          howNe: "क्षेत्र मिटरिङ र ग्राहक सर्वेक्षण।",
        },
      ],
      risks: [
        {
          en: "Task force report avoids hard merges — repeats fragmentation.",
          ne: "कार्यदल प्रतिवेदन कडा मर्ज टार्छ — खण्डन दोहोरिन्छ।",
        },
        {
          en: "Political resistance to tariff realism — subsidies hide losses.",
          ne: "दर वास्तविकताको राजनीतिक प्रतिरोध — अनुदानले हानि लुकाउँछ।",
        },
      ],
      escalation: [
        {
          en: "Consumer groups publish zone-wise hours-of-supply league table.",
          ne: "उपभोक्ता समूहले क्षेत्र अनुसार आपूर्ति घण्टा लिग तालिका।",
        },
        {
          en: "Share this point so Kathmandu gets water governance (#point-75).",
          ne: "काठमाडौंलाई पानी शासन चाहिन्छ भने साझेदारी गर्नुहोस् (#बुँदा-७५)।",
        },
      ],
      programStatusEn: "🟡 At risk — 30-day integrated water task force proposal not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ३० दिन एकीकृत खानेपानी कार्यदल प्रस्ताव यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p76",
    pointNumber: 76,
    category: "Environment & Sustainability",
    promise:
      "In Pokhara, within three months advance with stakeholders encroachment removal and restoration of the Fewa protected watershed, landslide management, springhead protection, and climate adaptation to conserve the watershed effectively.",
    promiseNe:
      "पोखरास्थित फेवा संरक्षित जलाधार क्षेत्रको अतिक्रमण हटाई पुनर्स्थापना, पहिरो व्यवस्थापन, मुहान संरक्षण र जलवायु परिवर्तन अनुकूलनका कार्यहरू सरोकारवालाको सहभागितामा तीन महिनाभित्र प्रक्रिया अघि बढाई जलाधार प्रभावकारी संरक्षण गर्ने।",
    question:
      "What resettlement or compensation rules apply to removed structures, and who monitors lake water quality weekly?",
    questionNe:
      "हटाइएका संरचनामा पुनर्वास वा क्षतिपूर्ति नियम के, र ताल पानी गुणस्तर साप्ताहिक कोले निगरानी गर्छ?",
    whyThisMatters:
      "Fewa is an icon—its watershed is climate infrastructure, not a real-estate frontier.",
    whyThisMattersNe:
      "फेवा प्रतीक हो — जलाधार जलवायु पूर्वाधार हो, रियल इस्टेट सीमा होइन।",
    possiblePathItems: [
      "Public cadastre of removed vs legal structures",
      "Sediment and nutrient monitoring with alerts",
      "Boating and construction permits in one GIS layer",
      "Community forest boundary reaffirmation",
    ],
    possiblePathItemsNe: [
      "हटाइए बनाम कानुनी संरचना सार्वजनिक क्याडेस्ट्र",
      "चेतावनीसहित तलछट र पोषक निगरानी",
      "नौका र निर्माण अनुमति एउटै GIS तहमा",
      "सामुदायिक वन सीमा पुन:पुष्टि",
    ],
    systemInsight:
      "Three months to “advance process” is honest if demolition and rehab budgets are already booked.",
    systemInsightNe:
      "«प्रक्रिया अघि बढाउने» तीन महिना ईमानदार छ यदि भत्काउने र पुनर्वास बजेट पहिले नै बुक छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ७६ (Fewa watershed restoration; scan Page 15)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ७६ (फेवा जलाधार; स्क्यान पृष्ठ १५)",
    sourceExcerpt:
      "From scan: Fewa protected watershed—encroachment removal, restoration, landslides, springs, climate adaptation within 3 months with stakeholders.",
    sourceExcerptNe:
      "स्क्यान: फेवा संरक्षित जलाधार — अतिक्रमण हटाउने, पुनर्स्थापना, पहिरो, मुहान, अनुकूलन, ३ महिना सरोकारवालासहित।",
    layer1: {
      hookEmoji: "🏞️",
      hook: "Pokhara: within 3 months advance Fewa protected watershed work — encroachment removal, restoration, landslides, springs, climate adaptation with stakeholders.",
      hookNe: "पोखरा: ३ महिनामा फेवा संरक्षित जलाधार — अतिक्रमण हटाउने, पुनर्स्थापना, पहिरो, मुहान, जलवायु अनुकूलन, सरोकारवालासहित।",
      stakeLine: "Icons need budgets — demolition without resettlement law repeats injustice.",
      stakeLineNe: "प्रतीकलाई बजेट चाहिन्छ — पुनर्वास कानुन बिना भत्काउनु अन्याय दोहोर्याउँछ।",
      coreQuestionShort: "Resettlement/compensation rules; weekly lake water quality monitor; booked rehab funds?",
      coreQuestionShortNe: "पुनर्वास/क्षतिपूर्ति; साप्ताहिक ताल गुणस्तर निगरानी; पुनर्वास बजेट बुक?",
      coreQuestion:
        "What published rules govern compensation or resettlement for removed structures; which agency publishes weekly lake and tributary water-quality results; are demolition and ecological rehab budgets line-item committed before notices go out?",
      coreQuestionNe:
        "हटाइएका संरचनाका लागि क्षतिपूर्ति वा पुनर्वास कुन प्रकाशित नियमले; ताल र सहायक नदीको पानी गुणस्तर साप्ताहिक कुन निकायले; सूचना अघि भत्काउने र पारिस्थितिक पुनर्वास बजेट शीर्षक प्रतिबद्ध छ?",
      quickScan: [
        {
          item: "3-month work plan: zones, milestones, and stakeholder sign-off published",
          itemNe: "३ महिना कार्य योजना: क्षेत्र, कोसेङ्क, सरोकारवाला स्वीकृति प्रकाशित",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Public cadastre: legal vs encroaching structures with appeal window",
          itemNe: "सार्वजनिक क्याडेस्ट्र: कानुनी बनाम अतिक्रमण पुनरावेदन खुला",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Weekly lake/tributary monitoring: parameters, lab, and alert thresholds",
          itemNe: "साप्ताहिक ताल/सहायक नदी निगरानी: मापदण्ड, प्रयोगशाला, चेतावनी थ्रेसहोल्ड",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "GIS layer: boating, construction, and landslide risk in one map service",
          itemNe: "GIS: नौका, निर्माण, पहिरो जोखिम एउटै नक्सा सेवा",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Forests and Environment; Gandaki provincial government; Pokhara Metropolitan City; National Lake Conservation Development Committee; Department of Soil Conservation and Watershed Management.",
      primaryOwnersNe:
        "वन तथा वातावरण मन्त्रालय; गण्डकी प्रदेश सरकार; पोखरा महानगर; राष्ट्रिय ताल संरक्षण विकास समिति; माटो संरक्षण तथा जलाधार व्यवस्थापन विभाग।",
      coordinatingOfficeEn:
        "Fewa watershed task force with joint enforcement, ecology, and community liaison cells.",
      coordinatingOfficeNe: "संयुक्त कार्यान्वयन, पारिस्थितिकी र समुदाय सम्पर्क कोठासहित फेवा जलाधार कार्यदल।",
      accountableRolesEn:
        "Monthly public dashboard: structures addressed, hectares restored, water-quality trend.",
      accountableRolesNe:
        "मासिक सार्वजनिक ड्यासबोर्ड: सम्बोधन भए संरचना, पुनर्स्थापित हेक्टर, पानी गुणस्तर प्रवृत्ति।",
      timelineEn: "T+3 months: process milestones met or explained slip; ongoing: climate adaptation works.",
      timelineNe: "T+३ महिना: कोसेङ्क पूरा वा ढिलाइ कारण; निरन्तर: जलवायु अनुकूलन।",
      milestones: [
        {
          en: "Sediment and nutrient monitoring with SMS alerts to municipalities.",
          ne: "पालिकालाई SMS चेतावनीसहित तलछट र पोषक निगरानी।",
        },
        {
          en: "Community forest boundary reaffirmation with GPS posts.",
          ne: "GPS खम्बासहित सामुदायिक वन सीमा पुन:पुष्टि।",
        },
        {
          en: "Independent audit of demolition and compensation fairness sample.",
          ne: "भत्काउने र क्षतिपूर्ति निष्पक्षताको स्वतन्त्र नमूना लेखापरीक्षा।",
        },
      ],
      kpis: [
        {
          metricEn: "Lake trophic state index trend (quarterly)",
          metricNe: "ताल ट्रोफिक अवस्था सूचक प्रवृत्ति (त्रैमासिक)",
          howEn: "Lab time series vs baseline.",
          howNe: "प्रयोगशाला समय शृङ्खला बनाम आधाररेखा।",
        },
        {
          metricEn: "Share of removed structures with documented compensation pathway (%)",
          metricNe: "कागजातीकृत क्षतिपूर्ति मार्ग भए हटाइए संरचना (%)",
          howEn: "Municipal case files.",
          howNe: "पालिका मुद्दा फाइल।",
        },
      ],
      risks: [
        {
          en: "Three-month “process” without cash for rehab — optics only.",
          ne: "पुनर्वास नगद बिना तीन महिना «प्रक्रिया» — देखावटी मात्र।",
        },
        {
          en: "Political pressure to spare vote-rich encroachments.",
          ne: "मत बढी अतिक्रमण जोगाउन राजनीतिक दबाब।",
        },
      ],
      escalation: [
        {
          en: "Environmental CSOs publish watershed health scorecard.",
          ne: "वातावरण NGO ले जलाधार स्वास्थ्य स्कोरकार्ड।",
        },
        {
          en: "Share this point so Fewa gets science and justice (#point-76).",
          ne: "फेवालाई विज्ञान र न्याय चाहिन्छ भने साझेदारी गर्नुहोस् (#बुँदा-७६)।",
        },
      ],
      programStatusEn: "🟡 At risk — 3-month Fewa watershed encroachment/restoration process not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ३ महिना फेवा जलाधार अतिक्रमण/पुनर्स्थापन प्रक्रिया यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p77",
    pointNumber: 77,
    category: "Infrastructure & Urban Development",
    promise:
      "Submit the Urban Development Bill and the Waste Management Bill to the Council of Ministers within two months for approval to table in the Federal Parliament.",
    promiseNe:
      "शहरी विकास विधेयक र फोहोरमैला व्यवस्था सम्बन्धी विधेयक संघीय संसदमा पेश गर्ने स्वीकृतिका लागि दुई महिनाभित्र मन्त्रिपरिषद्‍समक्ष पेश गर्ने।",
    question:
      "Will draft bills be published for comment before cabinet, and how do they align metropolitan waste with extended producer responsibility?",
    questionNe:
      "मन्त्रिपरिषद् अघि मस्यौदा टिप्पणीका लागि प्रकाशित हुन्छ, र महानगर फोहोर विस्तारित उत्पादक जिम्मेवारीसँग कसरी मिल्छ?",
    whyThisMatters:
      "Cities drown in waste without law that prices dumping and rewards separation at source.",
    whyThisMattersNe:
      "फोहोर फ्याँक्न मूल्य र स्रोत छुट्याउन इनाम बिना शहर फोहोरमा डुब्छ।",
    possiblePathItems: [
      "Cost recovery formula for landfill and recycling",
      "Informal waste-picker formalization chapter",
      "Building code hooks for septic and grey-water",
      "Metropolitan climate resilience chapters",
    ],
    possiblePathItemsNe: [
      "ल्यान्डफिल र पुनर्चक्रण लागत पुनर्प्राप्ति सूत्र",
      "अनौपचारिक फोहर संकलक औपचारिक अध्याय",
      "सेप्टिक र ग्रे-वाटरका लागि भवन संहिता हुक",
      "महानगर जलवायी लचिलोपन अध्याय",
    ],
    systemInsight:
      "Two months to cabinet is feasible if scope is not every urban problem in one omnibus.",
    systemInsightNe:
      "मन्त्रिपरिषद् दुई महिना सम्भव छ यदि दायरा प्रत्येक शहरी समस्या एउटै ऐनमा होइन।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ७७ (Urban Development & Waste Management bills; scan Page 15)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ७७ (शहरी विकास र फोहोर विधेयक; स्क्यान पृष्ठ १५)",
    sourceExcerpt:
      "From scan (झ header area): Urban Development Bill and Waste Management Bill to Council of Ministers within 2 months for parliamentary tabling approval.",
    sourceExcerptNe:
      "स्क्यान: शहरी विकास र फोहोर विधेयक २ महिनामा मन्त्रिपरिषद्, संसद पेश स्वीकृति।",
    layer1: {
      hookEmoji: "🏙️",
      hook: "Urban Development Bill + Waste Management Bill to Council of Ministers within 2 months for approval to table in Parliament.",
      hookNe: "शहरी विकास र फोहोर विधेयक २ महिनामा मन्त्रिपरिषद् — संसद पेश स्वीकृति।",
      stakeLine: "Omnibus bills sink — scope clarity and public comment before cabinet separate reform from rush.",
      stakeLineNe: "विशाल विधेयक डुब्छ — दायरा स्पष्ट र मन्त्रिपरिषद् अघि सार्वजनिक टिप्पणीले हतारबाट सुधार छुट्याउँछ।",
      coreQuestionShort: "Drafts published for comment; EPR for metropolitan waste; landfill cost recovery?",
      coreQuestionShortNe: "मस्यौदा टिप्पणीका लागि; महानगर फोहोरमा EPR; ल्यान्डफिल लागत पुनर्प्राप्ति?",
      coreQuestion:
        "Will draft bills be published with a meaningful comment window before cabinet; how does waste law embed extended producer responsibility and metropolitan cost recovery; are building-code hooks for septic and grey-water explicit?",
      coreQuestionNe:
        "मन्त्रिपरिषद् अघि मस्यौदा अर्थपूर्ण टिप्पणी खुला हुन्छ; फोहोर कानुनले विस्तारित उत्पादक जिम्मेवारी र महानगर लागत पुनर्प्राप्ति कसरी जोड्छ; सेप्टिक र ग्रे-वाटरका लागि भवन संहिता हुक स्पष्ट छ?",
      quickScan: [
        {
          item: "2-month milestone: bills with chapter summaries and regulatory impact notes",
          itemNe: "२ महिना कोसेङ्क: अध्याय सार र नियामक प्रभाव नोटसहित विधेयक",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Public consultation schedule and response memo before cabinet submission",
          itemNe: "मन्त्रिपरिषद् पेश अघि सार्वजनिक परामर्श तालिका र जवाफ मेमो",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Waste chapter: EPR, informal picker formalization, landfill minimum standards",
          itemNe: "फोहोर अध्याय: EPR, अनौपचारिक संकलक औपचारिक, ल्यान्डफिल न्यून मानक",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Urban chapter: metropolitan climate resilience and green-space obligations",
          itemNe: "शहरी अध्याय: महानगर जलवायी लचिलोपन र हरियाली दायित्व",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Urban Development; Ministry of Federal Affairs and General Administration; metropolitan and municipal associations; MoF for fiscal transfers tied to waste performance.",
      primaryOwnersNe:
        "शहरी विकास मन्त्रालय; संघीय मामिला तथा सामान्य प्रशासन मन्त्रालय; महानगर र पालिका संघ; फोहोर प्रदर्शनसँग जोडिएको राजस्व हस्तान्तरणका लागि अर्थ मन्त्रालय।",
      coordinatingOfficeEn:
        "Joint drafting cell with waste engineers and local-government lawyers in the same room.",
      coordinatingOfficeNe: "फोहोर इन्जिनियर र स्थानीय सरकार वकिल एउटै कोठामा संयुक्त मस्यौदा कोठा।",
      accountableRolesEn:
        "Tracked redlines: what changed after public consultation vs first draft.",
      accountableRolesNe:
        "ट्र्याक गरिएको रातो रेखा: सार्वजनिक परामर्शपछि पहिलो मस्यौदा बनाम के बदलियो।",
      timelineEn: "T+60 days: bills to cabinet; then parliamentary calendar with committee hearing plan.",
      timelineNe: "T+६० दिन: मन्त्रिपरिषद्; पछि समिति सुनुवाइ योजनासहित संसदीय पात्रो।",
      milestones: [
        {
          en: "Cost recovery formula for landfill, recycling, and transfer stations.",
          ne: "ल्यान्डफिल, पुनर्चक्रण र ट्रान्सफर स्टेसन लागत पुनर्प्राप्ति सूत्र।",
        },
        {
          en: "Metropolitan waste data standards interoperable with federal dashboards.",
          ne: "संघीय ड्यासबोर्डसँग अन्तरसञ्चालन योग्य महानगर फोहोर डेटा मानक।",
        },
        {
          en: "Plain-language citizen guide to new rights and penalties.",
          ne: "नयाँ अधिकार र जरिवानाको सरल नागरिक गाइड।",
        },
      ],
      kpis: [
        {
          metricEn: "Count of substantive public comments addressed in revised draft",
          metricNe: "संशोधित मस्यौदामा सम्बोधन भए गम्भीर सार्वजनिक टिप्पणी गणना",
          howEn: "Consultation log crosswalk.",
          howNe: "परामर्श लग क्रसवाक।",
        },
        {
          metricEn: "Projected landfill diversion rate under bill scenarios (%)",
          metricNe: "विधेयक परिदृश्य अन्तर्गत ल्यान्डफिल मोड्ने दर (%)",
          howEn: "Waste model runs.",
          howNe: "फोहोर मोडेल चलाउने।",
        },
      ],
      risks: [
        {
          en: "Rushed cabinet submission — laws challenged for inadequate consultation.",
          ne: "हतारिएको मन्त्रिपरिषद् — अपर्याप्त परामर्श भनी कानुन चुनौती।",
        },
        {
          en: "Unfunded mandates to municipalities — service collapse.",
          ne: "पालिकामा अवित्त पोषित जिम्मा — सेवा पतन।",
        },
      ],
      escalation: [
        {
          en: "Municipal association publishes readiness score for new waste duties.",
          ne: "पालिका संघले नयाँ फोहोर दायित्व तयारी अङ्क।",
        },
        {
          en: "Share this point so urban law is readable (#point-77).",
          ne: "शहरी कानुन पढ्न मिलोस् भने साझेदारी गर्नुहोस् (#बुँदा-७७)।",
        },
      ],
      programStatusEn: "🟡 At risk — 2-month Urban Development & Waste bills to cabinet not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — २ महिना शहरी विकास र फोहोर विधेयक मन्त्रिपरिषद् यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p78",
    pointNumber: 78,
    category: "Revenue & Fiscal System",
    promise:
      "Within 90 days, collect information on bank and financial institution accounts inactive for 10 years or more; transfer unclaimed balances to the state treasury after completing legal process; and identify and manage other idle state resources effectively.",
    promiseNe:
      "राज्यका निष्क्रिय स्रोतहरूको प्रभावकारी उपयोग गर्न १० वर्ष वा सोभन्दा बढी निष्क्रिय बैंक तथा वित्तीय संस्थाका खाताको विवरण सङ्कलन गरी हकवालाले दावी नगरेको रकम कानुनी प्रक्रिया पूरा गरी राज्यकोषमा ल्याउने तथा अन्य स्रोत पहिचान र व्यवस्थापन गर्ने कार्य ९० दिनभित्र सम्पन्न गर्ने।",
    question:
      "What notice and claims window protects legitimate heirs, and is the beneficiary list searchable by family with privacy safeguards?",
    questionNe:
      "वैध उत्तराधिकारी जोगाउन कुन सूचना र दावी म्याद, र गोपनीयता सहित परिवारले खोज्न मिल्ने लाभार्थी सूची छ?",
    whyThisMatters:
      "Escheat powers are just if process is loud and slow enough for savers to hear.",
    whyThisMattersNe:
      "निष्क्रिय रकम राज्यमा न्यायोचित छ यदि प्रक्रिया बचतकर्ताले सुन्ने गरी ठूलो र ढिलो छ।",
    possiblePathItems: [
      "Nationwide newspaper and SMS notice campaign",
      "Ombudsman for disputed dormant claims",
      "Annual report on amounts transferred vs returned",
      "Cross-check with election and citizenship records",
    ],
    possiblePathItemsNe: [
      "राष्ट्रव्यापी पत्रिका र SMS सूचना अभियान",
      "विवादित निष्क्रिय दावीका लागि अधिवक्ता",
      "सरे बनाम फिर्ता रकम वार्षिक प्रतिवेदन",
      "निर्वाचन र नागरिकता अभिलेखसँग क्रस-चेक",
    ],
    systemInsight:
      "Ninety days end-to-end is short for due process—risk of court challenges if notice is thin.",
    systemInsightNe:
      "९० दिन अन्त्यसम्म छोटो — सूचना पातलो भए अदालत चुनौती जोखिम।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ७८ (dormant accounts → treasury; scan Page 15, section झ)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ७८ (निष्क्रिय खाता; स्क्यान पृष्ठ १५, झ)",
    sourceExcerpt:
      "From scan (झ): within 90 days—dormant 10+ year BFIs, unclaimed to treasury after legal process; other idle resources.",
    sourceExcerptNe:
      "स्क्यान (झ): ९० दिन — १०+ वर्ष निष्क्रिय खाता, दावी नभए राज्यकोष; अन्य निष्क्रिय स्रोत।",
    layer1: {
      hookEmoji: "🏦",
      hook: "90 days: map BFI accounts inactive 10+ years; unclaimed balances to treasury after legal process; other idle state resources identified.",
      hookNe: "९० दिन: १०+ वर्ष निष्क्रिय बैंक/वित्त खाता; कानुनी प्रक्रियापछि दावी नभएको राज्यकोष; अन्य निष्क्रिय स्रोत।",
      stakeLine: "Escheat without loud notice is theft by procedure — heirs need time and searchable records.",
      stakeLineNe: "सूचना बिना राज्यमा लैजानु प्रक्रियाको चोरी — उत्तराधिकारीलाई समय र खोज्न मिल्ने अभिलेख चाहिन्छ।",
      coreQuestionShort: "Notice + claims window for heirs; privacy-safe search; amounts transferred vs returned?",
      coreQuestionShortNe: "उत्तराधिकारीका लागि सूचना र दावी म्याद; गोपनीय खोज; सरे बनाम फिर्ता रकम?",
      coreQuestion:
        "What multi-channel notice and minimum claims period protect legitimate heirs; can families search beneficiary lists with privacy safeguards; how are amounts transferred to treasury vs later returned published annually?",
      coreQuestionNe:
        "बहु माध्यम सूचना र न्यून दावी अवधिले वैध उत्तराधिकारी कसरी जोगाउँछ; परिवारले गोपनीयता सहित लाभार्थी खोज्न मिल्छ; राज्यकोषमा सरे र पछि फिर्ता रकम वार्षिक कसरी प्रकाशित?",
      quickScan: [
        {
          item: "90-day programme: BFI data pull methodology and legal gateway published",
          itemNe: "९० दिन कार्यक्रम: BFI डेटा तान्ने विधि र कानुनी प्रवेश प्रकाशित",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Nationwide notice campaign: print, SMS, and portal with claim workflow",
          itemNe: "राष्ट्रव्यापी सूचना: छापा, SMS, पोर्टल र दावी कार्यप्रवाह",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Ombudsman or appeal path for disputed dormant-account claims",
          itemNe: "विवादित निष्क्रिय खाता दावीका लागि लोकपाल/ओम्बुड्सम्यान वा पुनरावेदन मार्ग",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Annual report: transferred to treasury vs returned to claimants (NPR)",
          itemNe: "वार्षिक प्रतिवेदन: कोषमा सरे बनाम दावीदारलाई फिर्ता (रु.)",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Nepal Rastra Bank; Ministry of Finance; bank and finance company supervisors; Office of the Attorney General for process; MoHA for identity cross-checks where lawful.",
      primaryOwnersNe:
        "नेपाल राष्ट्र बैंक; अर्थ मन्त्रालय; बैंक र वित्त कम्पनी पर्यवेक्षण; प्रक्रियाका लागि महान्यायाधिवक्ता कार्यालय; कानुनी भए पहिचान क्रस-चेकका लागि गृह।",
      coordinatingOfficeEn:
        "Dormant assets programme office with encrypted claimant portal and audit trail per account.",
      coordinatingOfficeNe: "प्रति खाता लेखा पदचिन्हसहित गुप्त दावी पोर्टल र लेखापरीक्षा पदचिन्हसहित निष्क्रिय सम्पत्ति कार्यक्रम कार्यालय।",
      accountableRolesEn:
        "Quarterly transparency brief: accounts flagged, notices sent, claims received and resolved.",
      accountableRolesNe:
        "त्रैमासिक पारदर्शिता: चिन्ह लगाइएका खाता, पठाइएको सूचना, आए र टुङ्गिएका दावी।",
      timelineEn: "T+90 days: complete inventory transfer pathway per cabinet text; ongoing claims for years after.",
      timelineNe: "T+९० दिन: मन्त्रिपरिषद् पाठ अनुसार पूर्ण सूची हस्तान्तरण मार्ग; पछि वर्षौं दावी।",
      milestones: [
        {
          en: "Court-tested template notices with plain-language Nepali.",
          ne: "सरल नेपालीसहित अदालत परीक्षित सूचना नमूना।",
        },
        {
          en: "Cross-check workflow with citizenship and election records (privacy impact assessment).",
          ne: "नागरिकता र निर्वाचन अभिलेखसँग क्रस-चेक (गोपनीयता प्रभाव मूल्याङ्कन)।",
        },
        {
          en: "Idle non-bank state assets register (land, deposits) in same programme.",
          ne: "एकै कार्यक्रममा बैंक बाहेक निष्क्रिय राज्य सम्पत्ति दर्ता।",
        },
      ],
      kpis: [
        {
          metricEn: "Claims resolved as share of accounts notified (%)",
          metricNe: "सूचित खाताको हिस्सामा समाधान भए दावी (%)",
          howEn: "Programme MIS.",
          howNe: "कार्यक्रम MIS।",
        },
        {
          metricEn: "Court injunctions or writs filed vs programme (count)",
          metricNe: "कार्यक्रम विरुद्ध दायर रिट वा रोक आदेश (गणना)",
          howEn: "Court registry monitoring.",
          howNe: "अदालत दर्ता निगरानी।",
        },
      ],
      risks: [
        {
          en: "90-day rush — thin notice invites mass litigation.",
          ne: "९० दिन हतार — पातलो सूचनाले सामूहिक मुद्दा।",
        },
        {
          en: "Data breaches from centralizing dormant-account lists.",
          ne: "निष्क्रिय खाता सूची केन्द्रीकरणबाट डेटा उल्लंघन।",
        },
      ],
      escalation: [
        {
          en: "Banking consumer association publishes notice reach survey.",
          ne: "बैंकिङ उपभोक्ता संघले सूचना पुगाइ सर्वेक्षण।",
        },
        {
          en: "Share this point so savers get due process (#point-78).",
          ne: "बचतकर्ताले न्यायोचित प्रक्रिया पाओस् भने साझेदारी गर्नुहोस् (#बुँदा-७८)।",
        },
      ],
      programStatusEn: "🟡 At risk — 90-day dormant-account programme and treasury transfer rules not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ९० दिन निष्क्रिय खाता कार्यक्रम र कोष हस्तान्तरण नियम यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p79",
    pointNumber: 79,
    category: "Revenue & Fiscal System",
    promise:
      "Require large businesses to implement mandatory e-billing within one month to make the revenue system transparent, digital, and effective.",
    promiseNe:
      "राजस्व प्रणालीलाई पारदर्शी, डिजिटल तथा प्रभावकारी बनाउन ठूला व्यवसायहरूले अनिवार्य रूपमा e-billing प्रणाली एक महिनाभित्र लागू गर्ने।",
    question:
      "What revenue threshold defines “large,” how are invoices verified in real time at customs borders, and what penalties apply for split invoicing?",
    questionNe:
      "«ठूलो» कुन आम्दानी थ्रेसहोल्डले, भन्सारमा रसिद वास्तविक समय कसरी प्रमाणित, र विभाजित इनभ्वाइसमा जरिवाना के?",
    whyThisMatters:
      "E-billing closes the gap between reported sales and actual—if integration to IRD is shallow, evasion migrates sideways.",
    whyThisMattersNe:
      "e-billing ले बिक्रय र वास्तविक बीचको खाली बन्द गर्छ — IRD जोडी उथिनो भए उल्लंघन छेउ सर्छ।",
    possiblePathItems: [
      "Free certified billing software for mid-tier firms",
      "API for instant VAT credit matching",
      "Public leaderboard of compliance by sector",
      "Whistleblower share on proven VAT fraud",
    ],
    possiblePathItemsNe: [
      "मझौला फर्मका लागि निःशुल्क प्रमाणित बिलिङ सफ्टवेयर",
      "तत्काल VAT मिलान API",
      "क्षेत्रअनुसार अनुपालन सार्वजनिक लिडरबोर्ड",
      "प्रमाणित VAT ठगीमा उजागरकर्ता हिस्सा",
    ],
    systemInsight:
      "One month for large firms assumes vendors queued—otherwise only the compliant get punished.",
    systemInsightNe:
      "ठूला फर्म एक महिना विक्रेता लाइनमा मान्छ — नभए अनुपालक मात्र सजाय पाउँछ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ७९ (mandatory e-billing for large business; scan Page 15)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ७९ (e-billing; स्क्यान पृष्ठ १५)",
    sourceExcerpt:
      "From scan (झ): large businesses mandatory e-billing within 1 month for transparent digital revenue system.",
    sourceExcerptNe:
      "स्क्यान (झ): ठूला व्यवसाय e-billing १ महिना अनिवार्य।",
    layer1: {
      hookEmoji: "🧾",
      hook: "Mandatory e-billing for large businesses within 1 month — transparent, digital revenue system.",
      hookNe: "ठूला व्यवसायका लागि १ महिनामा अनिवार्य e-billing — पारदर्शी डिजिटल राजस्व।",
      stakeLine: "Define “large” clearly and integrate IRD–customs — otherwise compliant firms pay twice.",
      stakeLineNe: "«ठूलो» स्पष्ट परिभाषा र आन्तरिक राजस्व-भन्सार जोड — नभए अनुपालकले दोहोरो मूल्य तिर्छ।",
      coreQuestionShort: "Revenue threshold for “large”; real-time invoice verification at borders; split-invoice penalties?",
      coreQuestionShortNe: "«ठूलो» आम्दानी थ्रेसहोल्ड; सीमामा रसिद प्रमाणीकरण; विभाजित इनभ्वाइस जरिवाना?",
      coreQuestion:
        "What objective threshold defines large taxpayers; how are e-invoices verified in real time at customs and matched to VAT returns; what penalties and analytics detect split invoicing?",
      coreQuestionNe:
        "ठूला करदाता वस्तुनिष्ट थ्रेसहोल्ड के; भन्सारमा e-इनभ्वाइस वास्तविक समय कसरी प्रमाणित र VAT दाखिलासँग मिल्छ; विभाजित इनभ्वाइस पत्ता लगाउन जरिवाना र विश्लेषण के?",
      quickScan: [
        {
          item: "Published large-taxpayer definition + grandfathering for certified software cutover",
          itemNe: "प्रकाशित ठूला करदाता परिभाषा + प्रमाणित सफ्टवेयर कटओभरका लागि ग्रान्डफादरिङ",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "IRD API for invoice authentication linked to customs declarations",
          itemNe: "भन्सार घोषणासँग जोडिएको आन्तरिक राजस्व इनभ्वाइस प्रमाणीकरण API",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Free or subsidized certified billing stack for mid-tier firms",
          itemNe: "मझौला फर्मका लागि निःशुल्क वा अनुदान प्रमाणित बिलिङ स्ट्याक",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Public compliance leaderboard by sector with methodology",
          itemNe: "विधिसहित क्षेत्र अनुसार सार्वजनिक अनुपालन लिडरबोर्ड",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Inland Revenue Department; Customs Department; Nepal Rastra Bank for payment rails; MoF for thresholds and penalties; industry associations for onboarding support.",
      primaryOwnersNe:
        "आन्तरिक राजस्व विभाग; भन्सार विभाग; भुक्तानी रेलका लागि नेपाल राष्ट्र बैंक; थ्रेसहोल्ड र जरिवानाका लागि अर्थ मन्त्रालय; अनबोर्डिङ सहयोग उद्योग संघ।",
      coordinatingOfficeEn:
        "E-invoicing programme office with vendor certification lab and 24/7 integration hotline.",
      coordinatingOfficeNe: "विक्रेता प्रमाणन प्रयोगशाला र २४/७ एकीकरण हटलाइनसहित e-इनभ्वाइस कार्यक्रम कार्यालय।",
      accountableRolesEn:
        "Monthly stats: e-invoice volume, match exceptions, enforcement actions taken.",
      accountableRolesNe:
        "मासिक तथ्याङ्क: e-इनभ्वाइस आयतन, मिलान अपवाद, लिएका कारबाही।",
      timelineEn: "T+30 days: large-firm compliance wave; T+90: mid-tier rollout plan if capacity allows.",
      timelineNe: "T+३० दिन: ठूला फर्म अनुपालन लहर; T+९०: क्षमता भए मझौला विस्तार योजना।",
      milestones: [
        {
          en: "Instant VAT credit matching API with dispute desk for mismatches.",
          ne: "बेमिलानका लागि विवाद डेस्कसहित तत्काल VAT मिलान API।",
        },
        {
          en: "Whistleblower channel for split-invoicing patterns with reward rules.",
          ne: "इनाम नियमसहित विभाजित इनभ्वाइस ढाँचाका लागि उजागरकर्ता च्यानल।",
        },
        {
          en: "Sector-specific implementation playbooks (retail, manufacturing, services).",
          ne: "क्षेत्र विशेष कार्यान्वयन प्लेबुक (खुद्रा, उत्पादन, सेवा)।",
        },
      ],
      kpis: [
        {
          metricEn: "VAT gap estimate trend (quarterly)",
          metricNe: "त्रैमासिक VAT खाडल अनुमान प्रवृत्ति",
          howEn: "National accounts vs collections reconciliation.",
          howNe: "राष्ट्रिय लेखा बनाम संकलन मिलान।",
        },
        {
          metricEn: "Share of large taxpayers fully on e-billing (%)",
          metricNe: "पूर्ण e-billing मा ठूला करदाता (%)",
          howEn: "IRD registration flags.",
          howNe: "आन्तरिक राजस्व दर्ता चिन्ह।",
        },
      ],
      risks: [
        {
          en: "One-month deadline hits only vendors ready — punishes early adopters’ competitors unevenly.",
          ne: "एक महिना म्याद तयार विक्रेता मात्र — अनुपालक प्रतिस्पर्धीलाई असमान सजाय।",
        },
        {
          en: "Weak customs integration — e-billing becomes theatre at the border.",
          ne: "कमजोर भन्सार जोड — सीमामा e-billing नाटक मात्र।",
        },
      ],
      escalation: [
        {
          en: "FNCCI publishes integration failure log when APIs miss SLAs.",
          ne: "API ले SLA चुकाउँदा FNCCI ले एकीकरण असफलता लग।",
        },
        {
          en: "Share this point so invoices match reality (#point-79).",
          ne: "इनभ्वाइस वास्तविकतासँग मिलोस् भने साझेदारी गर्नुहोस् (#बुँदा-७९)।",
        },
      ],
      programStatusEn: "🟡 At risk — mandatory e-billing for large business (1 month) not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ठूला व्यवसाय अनिवार्य e-billing (१ महिना) यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p80",
    pointNumber: 80,
    category: "Revenue & Fiscal System",
    promise:
      "The Ministry of Finance shall within 45 days formulate and implement an action plan to automate tax administration, control revenue leakage, and deliver simpler services to taxpayers.",
    promiseNe:
      "कर प्रशासनलाई स्वचालित बनाउने, राजस्व चुहावट नियन्त्रण गर्ने तथा करदातालाई सरल सेवा उपलब्ध गराउने कार्ययोजना अर्थ मन्त्रालयले ४५ दिनभित्र तर्जुमा गरी लागू गर्ने।",
    question:
      "Which legacy systems are retired in the plan, what leakage metrics are published quarterly, and is pre-filled filing available for salary earners?",
    questionNe:
      "योजनामा कुन विरासत प्रणाली अवकाश, चुहावट मेट्रिक त्रैमासिक प्रकाशित हुन्छ, र तलबदारका लागि पूर्व-भरिएको दाखिला छ?",
    whyThisMatters:
      "Automation without service design just speeds up confusion at scale.",
    whyThisMattersNe:
      "सेवा डिजाइन बिना स्वचालन ठूलो पैमानामा दुर्भोध छिटो बनाउँछ।",
    possiblePathItems: [
      "End-to-end digital dispute trail",
      "Random audit selection algorithm published",
      "Taxpayer effort score tracked like wait times",
      "Integration with cooperatives and property registry",
    ],
    possiblePathItemsNe: [
      "अन्त्यदेखि अन्त्यसम्म डिजिटल विवाद पदचिन्ह",
      "प्रकाशित यादृच्छिक लेखापरीक्षण छनोट अल्गोरिदम",
      "प्रतीक्षा जस्तै करदाता प्रयास अङ्क ट्र्याक",
      "सहकारी र सम्पत्ति दर्तासँग एकीकरण",
    ],
    systemInsight:
      "Forty-five days for automation plus leakage control is two reforms in one brief—sequence or collide.",
    systemInsightNe:
      "४५ दिनमा स्वचालन र चुहावट नियन्त्रण दुई सुधार एकै म्याद — क्रम वा ठोक्किन।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ८० (automated tax admin & leakage control; scan Page 15)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ८० (कर स्वचालन; स्क्यान पृष्ठ १५)",
    sourceExcerpt:
      "From scan (झ): MoF 45 days—action plan automate tax admin, stop leakage, simpler taxpayer service.",
    sourceExcerptNe:
      "स्क्यान (झ): अर्थ ४५ दिन — कर स्वचालन, चुहावट नियन्त्रण, सरल सेवा योजना।",
    layer1: {
      hookEmoji: "⚙️",
      hook: "MoF: within 45 days — action plan to automate tax admin, control leakage, simpler taxpayer services (implement, not just draft).",
      hookNe: "अर्थ: ४५ दिन — कर प्रशासन स्वचालन, चुहावट नियन्त्रण, सरल करदाता सेवा (मस्यौदा मात्र होइन लागू)।",
      stakeLine: "One plan, two reforms — sequence leakage analytics before flashy front-ends.",
      stakeLineNe: "एक योजना दुई सुधार — चम्किलो अगाडि अनुहार अघि चुहावट विश्लेषण क्रम।",
      coreQuestionShort: "Legacy systems retired; quarterly leakage metrics; pre-filled filing for salary earners?",
      coreQuestionShortNe: "विरासत प्रणाली अवकाश; त्रैमासिक चुहावट मेट्रिक; तलबदार पूर्व-भरिएको दाखिला?",
      coreQuestion:
        "Which legacy IRD systems are sunset in the 45-day plan; what leakage metrics will be published quarterly with baselines; is pre-filled return filing on the roadmap for salary earners with consent?",
      coreQuestionNe:
        "४५ दिन योजनामा कुन विरासत आन्तरिक राजस्व प्रणाली सूर्यास्त; आधाररेखासहित त्रैमासिक कुन चुहावट मेट्रिक प्रकाशित; सहमतिसहित तलबदारका लागि पूर्व-भरिएको दाखिला रोडम्यापमा छ?",
      quickScan: [
        {
          item: "45-day published plan: workstreams, owners, budget, decommission list",
          itemNe: "४५ दिन प्रकाशित योजना: कार्यधारा, मालिक, बजेट, अवकाश सूची",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Leakage control metrics with third-party validation methodology",
          itemNe: "तेस्रो पक्ष प्रमाणन विधिसहित चुहावट नियन्त्रण मेट्रिक",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Taxpayer effort score / wait-time equivalents tracked like service SLAs",
          itemNe: "सेवा SLA जस्तै करदाता प्रयास अङ्क वा प्रतीक्षा ट्र्याक",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "End-to-end digital dispute trail from assessment to appellate stages",
          itemNe: "मूल्याङ्कनदेखि पुनरावेदन अन्त्यसम्म अन्त्यदेखि अन्त्य डिजिटल विवाद पदचिन्ह",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Finance; Inland Revenue Department; Large Taxpayers Office; customs; digital service delivery unit under MoF.",
      primaryOwnersNe:
        "अर्थ मन्त्रालय; आन्तरिक राजस्व विभाग; ठूला करदाता कार्यालय; भन्सार; अर्थ मन्त्रालय अन्तर्गत डिजिटल सेवा एकाइ।",
      coordinatingOfficeEn:
        "Tax transformation office with integrated backlog burn-down for legacy tickets.",
      coordinatingOfficeNe: "विरासत टिकट कम गर्न एकीकृत ब्याकलग जलाउने कर रूपान्तरण कार्यालय।",
      accountableRolesEn:
        "Fortnightly implementation note: what shipped vs. what slid with reasons.",
      accountableRolesNe:
        "पखेत्रे कार्यान्वयन नोट: के डिप्लय भयो बनाम के सर्यो कारणसहित।",
      timelineEn: "T+45 days: plan adopted and first automation releases live; quarterly leakage reports begin.",
      timelineNe: "T+४५ दिन: योजना स्वीकृत र पहिलो स्वचालन रिलिज लाइभ; त्रैमासिक चुहावट प्रतिवेदन सुरु।",
      milestones: [
        {
          en: "Published random audit selection algorithm for fairness.",
          ne: "निष्पक्षताका लागि प्रकाशित यादृच्छिक लेखापरीक्षण छनोट अल्गोरिदम।",
        },
        {
          en: "Integration milestones with cooperatives and land/property registry for third-party data.",
          ne: "तेस्रो पक्ष डेटाका लागि सहकारी र जग्गा/सम्पत्ति दर्तासँग एकीकरण कोसेङ्क।",
        },
        {
          en: "Pre-filled beta for salary earners with edit trail and consent logs.",
          ne: "सम्पादन पदचिन्ह र सहमति लगसहित तलबदारका लागि पूर्व-भरिएको बिटा।",
        },
      ],
      kpis: [
        {
          metricEn: "Cost to collect a rupee of tax (trend)",
          metricNe: "एक रुपैयाँ कर संकलन लागत (प्रवृत्ति)",
          howEn: "MoF fiscal analysis unit.",
          howNe: "अर्थ राजस्व विश्लेषण एकाइ।",
        },
        {
          metricEn: "Median time to resolve taxpayer service tickets (days)",
          metricNe: "करदाता सेवा टिकट समाधान मध्यक समय (दिन)",
          howEn: "CRM linked to IRD.",
          howNe: "आन्तरिक राजस्वसँग जोडिएको CRM।",
        },
      ],
      risks: [
        {
          en: "Automation without UX — faster broken processes.",
          ne: "UX बिना स्वचालन — छिटो बिग्रेका प्रक्रिया।",
        },
        {
          en: "Leakage metrics gamed — definitions shift to show progress.",
          ne: "चुहावट मेट्रिक खेल — प्रगति देखाउन परिभाषा सर्छ।",
        },
      ],
      escalation: [
        {
          en: "ICAN or professional bodies publish taxpayer experience survey.",
          ne: "ICAN वा पेशागत संस्थाले करदाता अनुभव सर्वेक्षण।",
        },
        {
          en: "Share this point so tax reform ships (#point-80).",
          ne: "कर सुधार डिप्लय होस् भने साझेदारी गर्नुहोस् (#बुँदा-८०)।",
        },
      ],
      programStatusEn: "🟡 At risk — MoF 45-day tax automation and leakage control action plan not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — अर्थ ४५ दिन कर स्वचालन र चुहावट नियन्त्रण योजना यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p81",
    pointNumber: 81,
    category: "Revenue & Fiscal System",
    promise:
      "Within 60 days, address weak use of public money from 139+ scattered, duplicated, or low-impact funds by merging like funds and designing a modality to invest consolidated balances in higher-return projects.",
    promiseNe:
      "करिब १३९ भन्दा बढी कोष छरिएर, दोहोरिएर वा कम प्रभावकारी सञ्चालन हुँदा सार्वजनिक स्रोत कमजोर उपयोग भएको समस्या समाधान गर्न ६० दिनभित्र समान प्रकृतिका कोष एकीकरण तथा रकम उच्च प्रतिफल परियोजनामा लगानी गर्ने ढाँचा तयार गर्ने।",
    question:
      "Who decides merged fund mandates, what guard stops pet projects, and are returns reported net of fees?",
    questionNe:
      "मर्ज कोषको जिम्मा कोले, पाल्तु आयोजना रोक्न के सुरक्षा, र शुल्क पछि खुद प्रतिफल प्रतिवेदन हुन्छ?",
    whyThisMatters:
      "Fund proliferation is how ministries hide slack capital—mergers without governance just create bigger silos.",
    whyThisMattersNe:
      "कोष प्रसार मन्त्रालयले ढिलो पूँजी लुकाउने तरिका — शासन बिना मर्ज ठूलो सिलो मात्र।",
    possiblePathItems: [
      "Published pre-merger beneficiary impact notes",
      "Independent investment committee minutes",
      "Cap on administrative cost ratio post-merger",
      "Sunset for funds without disbursement in 24 months",
    ],
    possiblePathItemsNe: [
      "मर्ज अघि लाभार्थी प्रभाव नोट प्रकाशन",
      "स्वतन्त्र लगानी समिति मिनेट",
      "मर्जपछि प्रशासनिक लागत अनुपात छत",
      "२४ महिनामा वितरण नभए कोष सूर्यास्त",
    ],
    systemInsight:
      "“High return” without a risk label invites the same political picking winners.",
    systemInsightNe:
      "जोखिम लेबल बिना «उच्च प्रतिफल» राजनीतिक विजेता छनोट दोहोर्याउँछ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ८१ (merge 139+ public funds; scan Page 15)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ८१ (कोष एकीकरण; स्क्यान पृष्ठ १५)",
    sourceExcerpt:
      "From scan (झ): within 60 days merge similar of 139+ scattered/low-impact funds; modality for higher-return investment.",
    sourceExcerptNe:
      "स्क्यान (झ): ६० दिन — १३९+ छरिएका कोष मर्ज; उच्च प्रतिफल लगानी ढाँचा।",
    layer1: {
      hookEmoji: "💰",
      hook: "60 days: fix weak use of 139+ scattered/duplicated/low-impact public funds — merge like funds; invest consolidated balances in higher-return projects (with guardrails).",
      hookNe: "६० दिन: १३९+ छरिएका/दोहोरिएका/कम प्रभाव कोष — समान मर्ज; एकीकृत रकम उच्च प्रतिफल आयोजनामा (सुरक्षा सहित)।",
      stakeLine: "Mergers without governance create bigger silos — independent investment committee and risk labels required.",
      stakeLineNe: "शासन बिना मर्ज ठूलो सिलो — स्वतन्त्र लगानी समिति र जोखिम लेबल अनिवार्य।",
      coreQuestionShort: "Who sets merged-fund mandates; anti–pet-project guards; net-of-fee return reporting?",
      coreQuestionShortNe: "मर्ज कोष जिम्मा कोले; पाल्तो आयोजना रोक; शुल्क पछि खुद प्रतिफल?",
      coreQuestion:
        "What governance body approves merged fund mandates and investment policy; what rules stop earmarks for political pet projects; are returns reported net of fees and with risk classification?",
      coreQuestionNe:
        "मर्ज कोष जिम्मा र लगानी नीति कुन शासन निकायले स्वीकार्छ; राजनीतिक पाल्तो आयोजन रोक्न के नियम; शुल्क पछि र जोखिम वर्गीकरणसहित प्रतिफल प्रतिवेदन हुन्छ?",
      quickScan: [
        {
          item: "60-day merger map: which funds → which successor + beneficiary impact notes",
          itemNe: "६० दिन मर्ज नक्सा: कुन कोष → उत्तराधिकारी + लाभार्थी प्रभाव नोट",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Independent investment committee charter with conflict-of-interest rules",
          itemNe: "द्वन्द्व नियमसहित स्वतन्त्र लगानी समिति विधान",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Cap on admin cost ratio and sunset for funds idle 24 months",
          itemNe: "प्रशासन लागत अनुपात छत र २४ महिना निष्क्रिय कोष सूर्यास्त",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Risk-labelled investment menu (liquidity, credit, tenor) published",
          itemNe: "तरलता, ऋण, अवधिसहित जोखिम लेबल लगानी मेनु प्रकाशित",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Finance; Financial Comptroller General’s Office; National Planning Commission; line ministries owning legacy funds; Public Debt Management Office where relevant.",
      primaryOwnersNe:
        "अर्थ मन्त्रालय; महालेखा नियन्त्रक कार्यालय; राष्ट्रिय योजना आयोग; विरासत कोष मालिक मन्त्रालय; लागू भए सार्वजनिक ऋण व्यवस्थापन कार्यालय।",
      coordinatingOfficeEn:
        "Fund consolidation programme office with legal merger playbooks per fund type.",
      coordinatingOfficeNe: "कोष प्रकार अनुसार कानुनी मर्ज प्लेबुकसहित कोष एकीकरण कार्यक्रम कार्यालय।",
      accountableRolesEn:
        "Public ledger: pre-merger balances, post-merger NAV, and quarterly investment performance.",
      accountableRolesNe:
        "सार्वजनिक खाता: मर्ज अघि ब्यालेन्स, पछि NAV, त्रैमासिक लगानी प्रदर्शन।",
      timelineEn: "T+60 days: merger decisions and first consolidated deployments; Y1: admin cost ratio targets.",
      timelineNe: "T+६० दिन: मर्ज निर्णय र पहिलो एकीकृत परिचालन; Y१: प्रशासन लागत अनुपात लक्ष्य।",
      milestones: [
        {
          en: "Beneficiary impact assessments published for each merger batch.",
          ne: "प्रति मर्ज लटका लागि लाभार्थी प्रभाव मूल्याङ्कन प्रकाशित।",
        },
        {
          en: "External audit of first consolidated portfolio within six months of deployment.",
          ne: "परिचालन छ महिनाभित्र पहिलो एकीकृत पोर्टफोलियो बाह्य लेखापरीक्षा।",
        },
        {
          en: "Whistleblower path for political pressure on investment picks.",
          ne: "लगानी छनोटमा राजनीतिक दबाबका लागि उजागरकर्ता मार्ग।",
        },
      ],
      kpis: [
        {
          metricEn: "Weighted average return on consolidated balances vs. benchmark",
          metricNe: "एकीकृत ब्यालेन्सको तौलित औसत प्रतिफल बनाम बेन्चमार्क",
          howEn: "Treasury investment reports.",
          howNe: "कोष लगानी प्रतिवेदन।",
        },
        {
          metricEn: "Count of funds sunset or merged vs. 139 baseline",
          metricNe: "१३९ आधाररेखा बनाम सूर्यास्त वा मर्ज भए कोष गणना",
          howEn: "Programme registry.",
          howNe: "कार्यक्रम दर्ता।",
        },
      ],
      risks: [
        {
          en: "“High return” becomes speculative bets without risk disclosure.",
          ne: "«उच्च प्रतिफल» जोखिम खुलाइएको बिना सट्टेबाजी बन्छ।",
        },
        {
          en: "Merger delays — staff and mandates stay duplicated.",
          ne: "मर्ज ढिलाइ — कर्मचारी र जिम्मा दोहोरिन्छ।",
        },
      ],
      escalation: [
        {
          en: "Parliamentary public accounts committee tracks merger slippage.",
          ne: "संसदीय लेखा समितिले मर्ज ढिलाइ ट्र्याक।",
        },
        {
          en: "Share this point so public funds work harder (#point-81).",
          ne: "सार्वजनिक कोष कडा काम गरोस् भने साझेदारी गर्नुहोस् (#बुँदा-८१)।",
        },
      ],
      programStatusEn: "🟡 At risk — 60-day public fund merger and higher-return investment modality not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ६० दिन सार्वजनिक कोष मर्ज र उच्च प्रतिफल ढाँचा यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p82",
    pointNumber: 82,
    category: "Economy & Development",
    promise:
      "In mining and minerals: cancel inactive licences; strictly regulate active firms; timeously amend the Mines and Minerals Act 2042 and related rules to be investment-friendly, transparent, and enforceable; begin within three months equipping departmental labs with modern instruments (XRF, XRD, ICP-MS, petrographic microscope, etc.) to expand testing capacity; and build an integrated strategic minerals database.",
    promiseNe:
      "खानी तथा खनिज क्षेत्रका निष्क्रिय अनुमतिपत्र खारेज गर्ने तथा सक्रिय फर्महरू कडाइका साथ नियमन गर्ने। खानी तथा खनिज पदार्थ ऐन, २०४२, सम्बन्धित नियमावली तथा कार्यविधि समयानुकूल संशोधन गरी लगानीमैत्री, पारदर्शी तथा कार्यान्वयनयोग्य बनाउने। विभाग अन्तर्गतका प्रयोगशालाहरूमा आधुनिक उपकरण (XRF, XRD, ICP-MS, Petrographic Microscope आदि) जडान गरी परीक्षण क्षमता बढाउने कार्य तीन महिनामा प्रारम्भ गर्ने। रणनीतिक खनिजहरूको एकीकृत डाटाबेस निर्माण गर्ने।",
    question:
      "What independent EIA and community consent gates survive amendment, and are lab results published for contested concessions?",
    questionNe:
      "संशोधनपछि कुन स्वतन्त्र EIA र समुदाय सहमति ढोका बाँच्छ, र विवादित कन्सेसनका लागि प्रयोगशाला नतिजा सार्वजनिक हुन्छ?",
    whyThisMatters:
      "Mining reform without open assay data repeats the geology of distrust.",
    whyThisMattersNe:
      "खुला परीक्षण डेटा बिना खानी सुधार अविश्वासको भूविज्ञान दोहोर्याउँछ।",
    possiblePathItems: [
      "Public cadastre of licences with status",
      "Rehabilitation bonds before extraction",
      "Third-party lab spot checks",
      "Export traceability for strategic minerals",
    ],
    possiblePathItemsNe: [
      "स्थितिसहित सार्वजनिक अनुमति क्याडेस्ट्र",
      "उत्खनन अघि पुनर्वास बन्धपत्र",
      "तेस्रो पक्ष प्रयोगशाला नमूना जाँच",
      "रणनीतिक खनिज निर्यात ट्रेसेबिलिटी",
    ],
    systemInsight:
      "Hardware in three months is procurement-heavy—corruption risk peaks in single-source kits.",
    systemInsightNe:
      "तीन महिना हार्डवेयर खरिद भारी — एकल स्रोत किटमा भ्रष्टाचार चरम।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ८२ (mining reform, labs, database; scan Pages 15–16)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ८२ (खानी सुधार; स्क्यान १५–१६)",
    sourceExcerpt:
      "From scan (झ): cancel inactive mining licences; strict regulation; amend Act 2042; modern lab equipment start in 3 months; strategic minerals integrated database.",
    sourceExcerptNe:
      "स्क्यान (झ): निष्क्रिय खानी खारेज; कडा नियमन; २०४२ ऐन संशोधन; ३ महिनामा प्रयोगशाला उपकरण; रणनीतिक खनिज डाटाबेस।",
    layer1: {
      hookEmoji: "⛏️",
      hook: "Mining: cancel inactive licences; regulate active firms; amend Mines & Minerals Act 2042 for investment-friendly enforceable rules; start equipping dept labs in 3 months (XRF, XRD, ICP-MS, etc.); integrated strategic minerals database.",
      hookNe: "खानी: निष्क्रिय अनुमति खारेज; सक्रिय नियमन; २०४२ ऐन लगानीमैत्री र कार्यान्वयनयोग्य; ३ महिनामा प्रयोगशाला उपकरण सुरु; रणनीतिक खनिज एकीकृत डेटाबेस।",
      stakeLine: "Open assay data and licence cadastre — hardware buys mean little without integrity chain.",
      stakeLineNe: "खुला परीक्षण डेटा र अनुमति क्याडेस्ट्र — अखण्डता श्रृङ्खला बिना उपकरण खरिद सानो अर्थ।",
      coreQuestionShort: "EIA & community gates after amendment; contested concession lab results public?",
      coreQuestionShortNe: "संशोधनपछि EIA र समुदाय ढोका; विवादित कन्सेसन प्रयोगशाला नतिजा सार्वजनिक?",
      coreQuestion:
        "Which independent environmental and social safeguards survive legislative amendment; will departmental lab results for contested concessions be published with chain-of-custody; how is procurement for instruments audited against single-source risk?",
      coreQuestionNe:
        "विधायी संशोधनपछि कुन स्वतन्त्र वातावरण र सामाजिक सुरक्षा बाँच्छ; विवादित कन्सेसनका लागि विभागीय प्रयोगशाला नतिजा हकको श्रृङ्खलासहित प्रकाशित हुन्छ; उपकरण खरिद एकल स्रोत जोखिम विरुद्ध कसरी लेखापरीक्षण?",
      quickScan: [
        {
          item: "Public licence cadastre: active, inactive-cancelled, and appeal status",
          itemNe: "सार्वजनिक अनुमति क्याडेस्ट्र: सक्रिय, खारेज, पुनरावेदन स्थिति",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "3-month lab procurement: open tender, specs, and delivery milestones",
          itemNe: "३ महिना प्रयोगशाला खरिद: खुला निविदा, विनिर्देश, वितरण कोसेङ्क",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Strategic minerals database schema + API access rules for researchers",
          itemNe: "रणनीतिक खनिज डेटाबेस स्किमा + अनुसन्धानकर्ताका लागि API नियम",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Rehabilitation bonds or escrow before extraction (draft law alignment)",
          itemNe: "उत्खनन अघि पुनर्वास बन्धपत्र वा इस्क्रो (मस्यौदा कानुन मिलान)",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Department of Mines and Geology; Ministry of Industry, Commerce and Supplies; Forest and environment clearances; MoF for royalties; AG for procurement audits.",
      primaryOwnersNe:
        "खानी तथा भूगर्भ विभाग; उद्योग, वाणिज्य तथा आपूर्ति मन्त्रालय; वन वातावरण स्वीकृति; रोयल्टिका लागि अर्थ मन्त्रालय; खरिद लेखापरीक्षण महालेखा।",
      coordinatingOfficeEn:
        "Mining reform programme office linking licence registry, lab QA, and export traceability.",
      coordinatingOfficeNe: "अनुमति दर्ता, प्रयोगशाला QA र निर्यात ट्रेसेबिलिटी जोड्ने खानी सुधार कार्यक्रम कार्यालय।",
      accountableRolesEn:
        "Quarterly report: licences cancelled, compliance actions, assay capacity (samples/day).",
      accountableRolesNe:
        "त्रैमासिक प्रतिवेदन: खारेज अनुमति, अनुपालन कारबाही, परीक्षण क्षमता (नमूना/दिन)।",
      timelineEn: "T+90 days: lab equipment contracts signed and calibration plan; parallel: amended act in parliament.",
      timelineNe: "T+९० दिन: प्रयोगशाला उपकरण सम्झौता र क्यालिब्रेसन योजना; समानान्तर: संशोधित ऐन संसद्।",
      milestones: [
        {
          en: "Inter-lab round-robin testing programme with published uncertainty budgets.",
          ne: "अनिश्चितता बजेट प्रकाशित अन्तरप्रयोगशाला राउन्ड-रोबिन परीक्षण।",
        },
        {
          en: "Third-party spot checks on high-value export lots.",
          ne: "उच्च मूल्य निर्यात लटमा तेस्रो पक्ष नमूना जाँच।",
        },
        {
          en: "Community grievance mechanism on blasting, water, and dust.",
          ne: "विस्फोट, पानी र धुलोमा समुदाय उजुरी प्रणाली।",
        },
      ],
      kpis: [
        {
          metricEn: "Share of active licences with filed work programmes (%)",
          metricNe: "कार्य कार्यक्रम दाखिल भए सक्रिय अनुमति (%)",
          howEn: "Mines department registry.",
          howNe: "खानी विभाग दर्ता।",
        },
        {
          metricEn: "Median lab turnaround for contested samples (days)",
          metricNe: "विवादित नमूनाका लागि प्रयोगशाला मध्यक फर्कन समय (दिन)",
          howEn: "Lab LIMS timestamps.",
          howNe: "प्रयोगशाला LIMS समय छाप।",
        },
      ],
      risks: [
        {
          en: "Procurement corruption in instrument packages.",
          ne: "उपकरण प्याकेजमा खरिद भ्रष्टाचार।",
        },
        {
          en: "Weaker safeguards in amended act — community trust collapses.",
          ne: "संशोधित ऐनमा कमजोर सुरक्षा — समुदाय विश्वास ढल्छ।",
        },
      ],
      escalation: [
        {
          en: "Extractive Industries Transparency Initiative alignment report.",
          ne: "Extractive Industries Transparency Initiative मिलान प्रतिवेदन।",
        },
        {
          en: "Share this point so geology is trusted (#point-82).",
          ne: "भूविज्ञान विश्वासयोग्य होस् भने साझेदारी गर्नुहोस् (#बुँदा-८२)।",
        },
      ],
      programStatusEn: "🟡 At risk — mining law reform, lab build-out, and strategic minerals database not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — खानी कानुन सुधार, प्रयोगशाला विस्तार र रणनीतिक खनिज डेटाबेस यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p83",
    pointNumber: 83,
    category: "Economy & Development",
    promise:
      "Restructure customs toward trade facilitation; separate commerce and consumer-protection functions for effective regulation; mandate and strictly enforce Maximum Retail Price (MRP) in the market with intensive monitoring.",
    promiseNe:
      "भन्सार प्रणालीलाई व्यापार सहजीकरणमुखी रूपमा पुनर्संरचना गर्ने, वाणिज्य तथा उपभोक्ता संरक्षण सम्बन्धी कार्य अलग गरी प्रभावकारी नियमन सुनिश्चित गर्ने तथा बजारमा Maximum Retail Price (MRP) अनिवार्य कार्यान्वयन र सघन अनुगमन गर्ने।",
    question:
      "How is MRP set for imports vs domestic goods, what appeals exist for errors, and does facilitation risk lower revenue collection?",
    questionNe:
      "आयात बनाम घरेलु मालमा MRP कसरी, त्रुटिमा पुनरावेदन के, र सहजीकरणले राजस्व घटाउँछ?",
    whyThisMatters:
      "MRP enforcement without supply-side competition can create shortages—pair with anti-cartel work.",
    whyThisMattersNe:
      "आपूर्ति प्रतिस्पर्धा बिना MRP अभाव सिर्जना गर्न सक्छ — कार्टेल विरोध जोड्नुहोस्।",
    possiblePathItems: [
      "Published MRP formula linked to landed cost",
      "Mystery shopping with fines for shelf violations",
      "Risk-based customs green lanes with post-audit",
      "Consumer app to scan and report prices",
    ],
    possiblePathItemsNe: [
      "ल्यान्ड लागतसँग जोडिएको MRP सूत्र",
      "अलमारी उल्लंघन जरिवानासहित गुप्त खरिद",
      "पछि लेखापरीक्षणसहित जोखिम आधारित हरियो लेन",
      "मूल्य स्क्यान र उजुरी उपभोक्ता एप",
    ],
    systemInsight:
      "Splitting commerce from consumer protection clarifies mandates—if IT systems stay shared, confusion returns.",
    systemInsightNe:
      "वाणिज्य र उपभोक्ता छुट्याउँदा जिम्मा स्पष्ट — IT साझा रह्यो भने दुर्भोध फर्किन्छ।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ८३ (customs facilitation, MRP enforcement; scan Page 16)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ८३ (भन्सार, MRP; स्क्यान पृष्ठ १६)",
    sourceExcerpt:
      "From scan: customs restructure trade facilitation; split commerce/consumer protection; mandatory MRP with intensive monitoring.",
    sourceExcerptNe:
      "स्क्यान: भन्सार सहजीकरण; वाणिज्य/उपभोक्ता अलग; MRP अनिवार्य सघन अनुगमन।",
    layer1: {
      hookEmoji: "📦",
      hook: "Customs → trade facilitation; split commerce from consumer protection for clearer regulation; mandatory MRP with intensive monitoring.",
      hookNe: "भन्सार व्यापार सहजीकरण; वाणिज्य र उपभोक्ता संरक्षण अलग; MRP अनिवार्य सघन अनुगमन।",
      stakeLine: "MRP without competition monitoring can cause shortages — pair with anti-cartel intelligence.",
      stakeLineNe: "प्रतिस्पर्धा निगरानी बिना MRP अभाव सिर्जना गर्न सक्छ — कार्टेल विरोध जाँच जोड्नुहोस्।",
      coreQuestionShort: "MRP formula import vs domestic; appeals for errors; facilitation vs revenue risk?",
      coreQuestionShortNe: "आयात बनाम घरेलु MRP सूत्र; त्रुटि पुनरावेदन; सहजीकरण बनाम राजस्व जोखिम?",
      coreQuestion:
        "How is MRP determined differently for imports vs domestic production; what independent appeal path fixes labelling errors; how will customs facilitation be monitored so revenue protection and risk-based post-audit keep pace?",
      coreQuestionNe:
        "आयात र घरेलु उत्पादनका लागि MRP कसरी फरक; लेबल त्रुटि सुधार स्वतन्त्र पुनरावेदन मार्ग के; भन्सार सहजीकरणको निगरानी कसरी गर्ने जसले राजस्व सुरक्षा र जोखिम आधारित पछि लेखापरीक्षा जोगाउँछ?",
      quickScan: [
        {
          item: "Published MRP methodology linked to landed cost, exchange, and duty",
          itemNe: "ल्यान्ड लागत, विनिमय र शुल्कसँग जोडिएको प्रकाशित MRP विधि",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Commerce vs consumer-protection org chart + separate IT service agreements",
          itemNe: "वाणिज्य बनाम उपभोक्ता संरक्षण संस्थापत्र + छुट्टै IT सेवा सम्झौता",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Mystery shopping / market surveillance plan with fine schedule",
          itemNe: "गुप्त खरिद/बजार निगरानी योजना जरिवाना तालिकासहित",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Risk-based green lanes with post-clearance audit hit rates published",
          itemNe: "जोखिम आधारित हरियो लेन; पछि लेखापरीक्षा हिट दर प्रकाशित",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Department of Customs; Department of Commerce, Supplies and Consumer Protection; Ministry of Industry; MoF for revenue impact; competition authority for cartel screening.",
      primaryOwnersNe:
        "भन्सार विभाग; वाणिज्य, आपूर्ति तथा उपभोक्ता संरक्षण विभाग; उद्योग मन्त्रालय; राजस्व प्रभावका लागि अर्थ मन्त्रालय; कार्टेल जाँचका लागि प्रतिस्पर्धा निकाय।",
      coordinatingOfficeEn:
        "Trade facilitation and MRP enforcement cell with joint customs–market inspection rosters.",
      coordinatingOfficeNe: "संयुक्त भन्सार-बजार निरीक्षण तालिकासहित व्यापार सहजीकरण र MRP कार्यान्वयन कोठा।",
      accountableRolesEn:
        "Monthly public stats: MRP violations fined, revenue recovered, facilitation clearance times.",
      accountableRolesNe:
        "मासिक सार्वजनिक तथ्याङ्क: MRP उल्लंघन जरिवाना, राजस्व पुनर्प्राप्ति, सहजीकरण निकासी समय।",
      timelineEn: "Immediate: MRP surge inspections; Q1: separated commerce/consumer IT and mandates.",
      timelineNe: "तत्काल: MRP बढी निरीक्षण; Q१: वाणिज्य/उपभोक्ता IT र जिम्मा छुट्याइएको।",
      milestones: [
        {
          en: "Consumer app or USSD to scan barcodes and flag over-MRP sales.",
          ne: "बारकोड स्क्यान गरी MRP भन्दा माथि बिक्री चिन्ह लगाउने उपभोक्ता एप वा USSD।",
        },
        {
          en: "Published appeals desk with SLA for wrongful seizure or penalty.",
          ne: "गलत जफत वा जरिवानाका लागि SLA सहित पुनरावेदन डेस्क।",
        },
        {
          en: "Trader training programme on new facilitation lanes and documentation.",
          ne: "नयाँ सहजीकरण लेन र कागजातमा व्यापारी तालिम।",
        },
      ],
      kpis: [
        {
          metricEn: "Median customs clearance time vs. baseline (hours)",
          metricNe: "आधाररेखा बनाम भन्सार निकासी मध्यक समय (घण्टा)",
          howEn: "ASYCUDA or equivalent timestamps.",
          howNe: "ASYCUDA वा समतुल्य समय छाप।",
        },
        {
          metricEn: "MRP compliance rate in mystery shops (%)",
          metricNe: "गुप्त पसलमा MRP अनुपालन दर (%)",
          howEn: "Surveillance programme database.",
          howNe: "निगरानी कार्यक्रम डेटाबेस।",
        },
      ],
      risks: [
        {
          en: "Facilitation lowers scrutiny — smuggling adapts to green lanes.",
          ne: "सहजीकरणले जाँच घटाउँछ — तस्करी हरियो लेन अनुकूल हुन्छ।",
        },
        {
          en: "MRP controls without supply — empty shelves and black markets.",
          ne: "आपूर्ति बिना MRP नियन्त्रण — खाली अलमारी र कालो बजार।",
        },
      ],
      escalation: [
        {
          en: "Consumer rights groups publish monthly overpricing heat map.",
          ne: "उपभोक्ता अधिकार समूहले मासिक महँगो बिक्री हिट म्याप।",
        },
        {
          en: "Share this point so shelves match stickers (#point-83).",
          ne: "अलमारी स्टिकरसँग मिलोस् भने साझेदारी गर्नुहोस् (#बुँदा-८३)।",
        },
      ],
      programStatusEn: "🟡 At risk — customs facilitation, mandate split, and MRP enforcement package not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — भन्सार सहजीकरण, जिम्मा विभाजन र MRP कार्यान्वयन यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p84",
    pointNumber: 84,
    category: "Revenue & Fiscal System",
    promise:
      "Within 60 days prepare a legal basis to mobilize large idle bail and deposit sums held in courts and government bodies that have not been deployed for development.",
    promiseNe:
      "अड्डा अदालत तथा सरकारी निकायमा रहेको ठूलो धरौटी रकम निष्क्रिय भई विकास निर्माणमा उपयोग हुन नसकेको समस्या समाधान गर्न ६० दिनभित्र सो रकम परिचालन गर्ने कानुनी आधार तयार गर्ने।",
    question:
      "How are title and claimant rights preserved, what interest flows to victims vs treasury, and who audits diversion risk?",
    questionNe:
      "हक र दावी अधिकार कसरी जोगिन्छ, पीडित बनाम कोषमा ब्याज कसरी, र मोड्ने जोखिम कसले लेखापरीक्षण गर्छ?",
    whyThisMatters:
      "Mobilizing bail pools touches due process—get the accounting wrong and trust in courts collapses.",
    whyThisMattersNe:
      "धरौटी कोष चलाउँदा न्याय प्रक्रिया छुन्छ — लेखा गलत भए अदालत विश्वास ढल्छ।",
    possiblePathItems: [
      "Supreme Court–MoF joint custody protocol",
      "Ring-fenced development bonds with court lien priority",
      "Quarterly public balance sheet of mobilized sums",
      "Sunset if cases revive needing liquidity",
    ],
    possiblePathItemsNe: [
      "सर्वोच्च-अर्थ संयुक्त राखेको प्रोटोकल",
      "अदालत लिन प्राथमिकतासहित विकास बन्धपत्र",
      "परिचालित रकम त्रैमासिक सार्वजनिक ब्यालेन्स",
      "मुद्दा पुनर्जीवित भए तरलता चाहिँदा सूर्यास्त",
    ],
    systemInsight:
      "Sixty days for novel bail law is a litigation magnet—expect injunctive relief unless drafting is conservative.",
    systemInsightNe:
      "नयाँ धरौटी कानुन ६० दिन मुद्दाको चुम्बक — मस्यौदा रूढ नभए रोक आदेश अपेक्षा गर्नुहोस्।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ८४ (mobilize idle court/govt bail deposits; scan Page 16)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ८४ (निष्क्रिय धरौटी परिचालन; स्क्यान पृष्ठ १६)",
    sourceExcerpt:
      "From scan: within 60 days legal basis to mobilize large idle bail/deposit sums in courts and government for development use.",
    sourceExcerptNe:
      "स्क्यान: ६० दिन — अदालत/सरकारी निष्क्रिय धरौटी विकास परिचालन कानुनी आधार।",
    layer1: {
      hookEmoji: "⚖️",
      hook: "60 days: legal basis to mobilize large idle bail and deposit sums held in courts and government for development — without vaporizing claimant rights.",
      hookNe: "६० दिन: अदालत र सरकारी निष्क्रिय धरौटी/जम्मा विकासमा परिचालन — दावी अधिकार मेटाउनु हुँदैन।",
      stakeLine: "Court money is trust money — conservative drafting and lien priority or injunctive chaos follows.",
      stakeLineNe: "अदालतको पैसा विश्वासको पैसा — रूढ मस्यौदा र लिन प्राथमिकता नभए रोक आदेश अव्यवस्था।",
      coreQuestionShort: "Preserved title & claimant rights; interest split victims vs treasury; diversion audit?",
      coreQuestionShortNe: "हक र दावी जोगिन्छ; पीडित बनाम कोष ब्याज; मोड्ने लेखापरीक्षण?",
      coreQuestion:
        "How are original titles and claimant access preserved in any investment instrument; how is interest allocated between victims, depositors, and treasury; which independent body audits diversion risk and liquidity if cases revive?",
      coreQuestionNe:
        "कुनै लगानी उपकरणमा मूल हक र दावी पहुँच कसरी जोगिन्छ; पीडित, जम्माकर्ता र कोष बीच ब्याज कसरी बाँडिन्छ; मुद्दा पुनर्जीवित भए तरलता र मोड्ने जोखिम कुन स्वतन्त्र निकायले लेखापरीक्षण गर्छ?",
      quickScan: [
        {
          item: "60-day draft law: custody model, lien priority, and claimant exit paths",
          itemNe: "६० दिन मस्यौदा कानुन: राखेको मोडेल, लिन प्राथमिकता, दावी निस्कने मार्ग",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "Supreme Court–MoF joint protocol on ring-fenced instruments",
          itemNe: "छुट्टै उपकरणमा सर्वोच्च-अर्थ संयुक्त प्रोटोकल",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "Quarterly public balance sheet: mobilized sums vs. claims pending",
          itemNe: "त्रैमासिक सार्वजनिक ब्यालेन्स: परिचालित रकम बनाम बाँकी दावी",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "Sunset/liquidity clause if underlying cases reopen",
          itemNe: "मुद्दा पुनःखुले तरलता/सूर्यास्त धारा",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Finance; Ministry of Law, Justice and Parliamentary Affairs; Supreme Court administration; Office of the Attorney General; development bank or treasury operator for instruments.",
      primaryOwnersNe:
        "अर्थ मन्त्रालय; कानुन, न्याय तथा संसदीय मामिला मन्त्रालय; सर्वोच्च अदालत प्रशासन; महान्यायाधिवक्ता कार्यालय; उपकरण सञ्चालक विकास बैंक वा कोष।",
      coordinatingOfficeEn:
        "Bail mobilization drafting group with court clerks and public auditors in working sessions.",
      coordinatingOfficeNe: "अदालत लेखापाल र सार्वजनिक लेखापाल कार्य समूहमा धरौटी परिचालन मस्यौदा समूह।",
      accountableRolesEn:
        "Legislative memo: constitutional issues, property rights, and precedent risks cited.",
      accountableRolesNe:
        "विधायी मेमो: संवैधानिक प्रश्न, सम्पत्ति अधिकार र नजिर जोखिम उल्लेख।",
      timelineEn: "T+60 days: bill to cabinet; pre-implementation pilot only with court buy-in.",
      timelineNe: "T+६० दिन: मन्त्रिपरिषद् विधेयक; अदालत सहमति बिना पाइलट होइन।",
      milestones: [
        {
          en: "Investor prospectus for development bonds with explicit subordination to claimants.",
          ne: "दावीदारप्रति स्पष्ट अधीनतासहित विकास बन्ड प्रोस्पेक्टस।",
        },
        {
          en: "Hotline and legal aid for depositors searching frozen funds.",
          ne: "जम्मा गरेकाले फ्रोजन कोष खोज्दा हटलाइन र कानुनी सहायता।",
        },
        {
          en: "Red-team review by banking and insolvency experts.",
          ne: "बैंकिङ र दिवालिया विज्ञद्वारा रातो टोली समीक्षा।",
        },
      ],
      kpis: [
        {
          metricEn: "Litigation or stays filed vs. mobilized volume (ratio)",
          metricNe: "परिचालित आयतन बनाम दायर मुद्दा वा रोक (अनुपात)",
          howEn: "Court registry monitoring.",
          howNe: "अदालत दर्ता निगरानी।",
        },
        {
          metricEn: "Share of mobilized funds matched to tagged development projects (%)",
          metricNe: "ट्याग भए विकास आयोजनासँग मिलेको परिचालित कोष (%)",
          howEn: "Treasury project codes.",
          howNe: "कोष आयोजन कोड।",
        },
      ],
      risks: [
        {
          en: "Constitutional challenge — programme frozen mid-rollout.",
          ne: "संवैधानिक चुनौती — कार्यक्रम बीचमा रोकिन्छ।",
        },
        {
          en: "Liquidity crunch if many cases revive simultaneously.",
          ne: "धेरै मुद्दा एकै चोटि पुनर्जीवित भए तरलता संकट।",
        },
      ],
      escalation: [
        {
          en: "Bar association publishes civil-liberties review of draft provisions.",
          ne: "वकालत संघले मस्यौदा प्रावधान मानव अधिकार समीक्षा।",
        },
        {
          en: "Share this point so justice keeps the cash (#point-84).",
          ne: "न्यायले नै पैसा जोगाओस् भने साझेदारी गर्नुहोस् (#बुँदा-८४)।",
        },
      ],
      programStatusEn: "🟡 At risk — 60-day legal basis to mobilize idle bail/deposits not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — ६० दिन निष्क्रिय धरौटी परिचालन कानुनी आधार यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
  {
    id: "p85",
    pointNumber: 85,
    category: "Health & Human Development",
    promise:
      "Health sector reform: (a) Strictly implement at least 10% free beds in total beds in public and private hospitals for poor, helpless, and unattended patients; develop a Free Health Portal within 30 days nationwide for real-time monitoring of free service availability, beneficiary data, and utilization. (b) Within three months develop a digital, integrated, interoperable health information system for patient records covering treatment history, referral, re-service, and clinical follow-up; implement clear referral protocols to curb unnecessary private referrals. (c) Within one week make attendance monitoring, conduct review, and cleanliness audit mandatory in public hospitals for staff presence, behavior, sanitation, and basic service standards; make all delivery citizen-friendly and accountable. (d) Within three months operate a digital pharmacy system showing stock and prices; aim to supply quality affordable medicines through “Sulabh” (accessible) arrangements in public and major health facilities. (e) Within 30 days begin establishing burn wards in major hospitals at provincial level for subsidized burn care where specialized hospitals are lacking. (f) Keep air ambulances on standby for emergency services in hill areas of Far-Western, Mid-Western, and Eastern Nepal.",
    promiseNe:
      "स्वास्थ्य क्षेत्र सुधार: (क) विपन्न, असहाय तथा वेवारिसे बिरामीका लागि सरकारी तथा निजी अस्पतालका कुल शय्यामध्ये कम्तीमा १०% निःशुल्क शय्या कडाइका साथ कार्यान्वयन; निःशुल्क सेवा उपलब्धता, लाभग्राही विवरण र प्रयोगको वास्तविक समय अनुगमनका लागि «Free Health Portal» ३० दिनभित्र देशभर। (ख) बिरामी उपचार इतिहास, रेफरल, पुनःसेवा र Clinical Follow-Up का लागि तीन महिनाभित्र डिजिटल, एकीकृत, अन्तरआबद्ध स्वास्थ्य सूचना प्रणाली; अनावश्यक निजी रेफर नियन्त्रणका लागि स्पष्ट रेफर प्रोटोकल। (ग) सरकारी अस्पतालमा उपस्थिति, व्यवहार, सरसफाइ र सेवा मापदण्डका लागि एक हप्ताभित्र उपस्थिति निगरानी, आचरण समीक्षा र सफाइ लेखापरीक्षण अनिवार्य। (घ) तीन महिनाभित्र फार्मेसीमा औषधि मौज्दात र मूल्य देखिने डिजिटल प्रणाली; सुलभ मूल्यमा गुणस्तरीय औषधि। (ङ) ३० दिनभित्र प्रदेशस्तरमा जलेको उपचार विशेष अस्पताल नभए मुख्य अस्पतालमा बर्न वार्ड सुरुवात। (च) सुदूरपश्चिम, मध्यपश्चिम र पूर्वका पहाडी क्षेत्रमा आकस्मिक सेवाका लागि एयर एम्बुलेन्स स्ट्यान्डबाइ।",
    question:
      "How is “free bed” utilization audited against means-testing, are air-ambulance costs capped for patients, and who owns health-record consent across public and private providers?",
    questionNe:
      "निःशुल्क शय्या आय परीक्षण विरुद्ध कसरी लेखापरीक्षण, एयर एम्बुलेन्स खर्च बिरामीका लागि छत छ, र सार्वजनिक-निजी प्रदातामा स्वास्थ्य अभिलेख सहमति कस्को?",
    whyThisMatters:
      "Free beds and portals are symbols—without staffing ratios and drug supply, they become queue politics.",
    whyThisMattersNe:
      "निःशुल्क शय्या र पोर्टल प्रतीक — दरबन्दी र औषधि बिना लाइन राजनीति बन्छ।",
    possiblePathItems: [
      "Open bed-availability API per hospital hourly",
      "Standard referral forms with accountability if breached",
      "Drug procurement integrity unit reporting shortages",
      "Air-ambulance triage protocol with weather abort rules",
    ],
    possiblePathItemsNe: [
      "घण्टामा अस्पताल प्रति खाली शय्या API",
      "उल्लंघनमा जवाफदेहीसहित मानक रेफर फारम",
      "अभाव प्रतिवेदन औषधि खरिद अखण्डता एकाइ",
      "मौसम रद्द नियमसहित एयर एम्बुलेन्स ट्राइएज",
    ],
    systemInsight:
      "Referral protocols bite only if insurers and councils enforce them—otherwise doctors route around.",
    systemInsightNe:
      "रेफर प्रोटोकल बीमा र परिषद् लागू गर्छ भने मात्र टोक्छ — नभए चिकित्सक बाइपास गर्छन्।",
    status: "Awaiting Response",
    lastUpdated: "April 3, 2026",
    sourceType: "Original Nepali Source",
    sourceDocumentTitle: "Cabinet 100-point agenda — item ८५ (health reform package; scan Pages 16–17, section ञ)",
    sourceDocumentTitleNe: "मन्त्रिपरिषद् १०० बुँदा — बुँदा ८५ (स्वास्थ्य सुधार प्याकेज; स्क्यान १६–१७, ञ)",
    sourceExcerpt:
      "From scan (ञ): 10% free beds; Free Health Portal 30d; integrated patient records 3mo; referral protocol; attendance/cleanliness audit 1wk; digital pharmacy 3mo; burn wards 30d; hill air ambulance standby.",
    sourceExcerptNe:
      "स्क्यान (ञ): १०% निःशुल्क शय्या; पोर्टल ३० दिन; अभिलेख ३ महिना; रेफर प्रोटोकल; उपस्थिति/सफाइ १ हप्ता; फार्मेसी डिजिटल; बर्न वार्ड; एयर एम्बुलेन्स।",
    layer1: {
      hookEmoji: "🏥",
      hook: "Health reform bundle: 10% free beds + Free Health Portal (30d); integrated patient records (3mo); referral protocols; hospital attendance/cleanliness (1wk); digital pharmacy (3mo); burn wards (30d); hill air-ambulance standby.",
      hookNe: "स्वास्थ्य सुधार प्याकेज: १०% निःशुल्क शय्या + पोर्टल ३० दिन; अभिलेख ३ महिना; रेफर प्रोटोकल; उपस्थिति/सफाइ १ हप्ता; डिजिटल फार्मेसी; बर्न वार्ड; पहाड एयर एम्बुलेन्स।",
      stakeLine: "Symbols need staff and drugs — a portal without beds staffed is a queue billboard.",
      stakeLineNe: "प्रतीकलाई दरबन्दी र औषधि चाहिन्छ — शय्या बिना पोर्टल लाइनको पोस्टर मात्र।",
      coreQuestionShort: "Free-bed means-testing audit; air-ambulance cost caps; unified health-record consent across providers?",
      coreQuestionShortNe: "निःशुल्क शय्या आय परीक्षण लेखापरीक्षण; एयर एम्बुलेन्स खर्च छत; प्रदाताबीच एक स्वास्थ्य अभिलेख सहमति?",
      coreQuestion:
        "How will utilization of free beds be audited against means-testing; what caps and triage govern air-ambulance charges for patients; who owns consent and liability for interoperable records across public and private hospitals?",
      coreQuestionNe:
        "निःशुल्क शय्या प्रयोग आय परीक्षण विरुद्ध कसरी लेखापरीक्षण; एयर एम्बुलेन्स शुल्क र ट्राइएज बिरामीका लागि के छत र नियम; सार्वजनिक र निजी अस्पतालबीच अन्तरआबद्ध अभिलेखको सहमति र दायित्व कस्को?",
      quickScan: [
        {
          item: "30-day Free Health Portal live: bed availability, beneficiaries, utilization API",
          itemNe: "३० दिन Free Health Portal लाइभ: शय्या, लाभार्थी, प्रयोग API",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
        {
          item: "10% free-bed compliance audit methodology (public + private hospitals)",
          itemNe: "१०% निःशुल्क शय्या अनुपालन लेखापरीक्षण विधि (सार्वजनिक + निजी)",
          status: "⚠️ Not verified",
          statusNe: "⚠️ प्रमाणित छैन",
        },
        {
          item: "3-month HIS roadmap: FHIR/interop, referral forms, unnecessary referral KPI",
          itemNe: "३ महिना HIS रोडम्याप: FHIR/अन्तरआबद्धता, रेफर फारम, अनावश्यक रेफर KPI",
          status: "❌ Not on file",
          statusNe: "❌ दर्ता छैन",
        },
        {
          item: "1-week audit rollout: attendance, behavior, sanitation scorecards per hospital",
          itemNe: "१ हप्ता लेखापरीक्षा: उपस्थिति, आचरण, सरसफाइ स्कोरकार्ड प्रति अस्पताल",
          status: "❌ Not verified",
          statusNe: "❌ प्रमाणित छैन",
        },
      ],
    },
    programMonitoring: {
      primaryOwnersEn:
        "Ministry of Health and Population; Department of Health Services; provincial health directorates; Nepal Medical Council for referral norms; MoF for free-bed funding; private hospital association for compliance.",
      primaryOwnersNe:
        "स्वास्थ्य तथा जनसङ्ख्या मन्त्रालय; स्वास्थ्य सेवा विभाग; प्रदेश स्वास्थ्य निर्देशनालय; रेफर मानकका लागि नेपाल चिकित्सा परिषद्; निःशुल्क शय्या कोषका लागि अर्थ मन्त्रालय; अनुपालनका लागि निजी अस्पताल संघ।",
      coordinatingOfficeEn:
        "Health transformation programme office with integrated portal, HIS, and pharmacy workstreams.",
      coordinatingOfficeNe: "एकीकृत पोर्टल, HIS र फार्मेसी कार्यधारासहित स्वास्थ्य रूपान्तरण कार्यक्रम कार्यालय।",
      accountableRolesEn:
        "Fortnightly integrated dashboard: portal uptime, free-bed occupancy, referral rates, drug stockouts.",
      accountableRolesNe:
        "पखेत्रे एकीकृत ड्यासबोर्ड: पोर्टल अपटाइम, निःशुल्क शय्या भराइ, रेफर दर, औषधि अभाव।",
      timelineEn: "T+7 days: hospital audit live; T+30: portal; T+90: HIS pilot; T+30: burn ward starts; air ambulance roster continuous.",
      timelineNe: "T+७ दिन: अस्पताल लेखापरीक्षा; T+३०: पोर्टल; T+९०: HIS पाइलट; T+३०: बर्न वार्ड सुरु; एयर एम्बुलेन्स निरन्तर।",
      milestones: [
        {
          en: "Standard referral form with accountability if breached (insurer/council hooks).",
          ne: "उल्लंघनमा जवाफदेहीसहित मानक रेफर फारम (बीमा/परिषद् हुक)।",
        },
        {
          en: "Digital pharmacy stock linked to national essential medicines list alerts.",
          ne: "राष्ट्रिय अत्यावश्यक औषधि सूची चेतावनीसँग जोडिएको डिजिटल फार्मेसी स्टक।",
        },
        {
          en: "Burn ward staffing plan with training pipeline and supplies.",
          ne: "तालिम पाइपलाइन र सामग्रीसहित बर्न वार्ड दरबन्दी योजना।",
        },
      ],
      kpis: [
        {
          metricEn: "Free-bed utilization vs. declared capacity (%)",
          metricNe: "घोषित क्षमता बनाम निःशुल्क शय्या प्रयोग (%)",
          howEn: "Portal + hospital discharge data.",
          howNe: "पोर्टल र अस्पताल डिस्चार्ज डेटा।",
        },
        {
          metricEn: "Median referral lead time and share deemed unnecessary (%)",
          metricNe: "रेफर मध्यक समय र अनावश्यक ठहरिएको हिस्सा (%)",
          howEn: "HIS event logs.",
          howNe: "HIS घटना लग।",
        },
      ],
      risks: [
        {
          en: "Underfunded free-bed mandate — private hospitals resist.",
          ne: "अवित्त पोषित निःशुल्क शय्या — निजी अस्पताल प्रतिरोध।",
        },
        {
          en: "HIS fragmentation — another silo next to three legacy systems.",
          ne: "HIS खण्डन — तीन विरासत प्रणाली छेउ अर्को सिलो।",
        },
      ],
      escalation: [
        {
          en: "Medical associations publish referral pattern audits by specialty.",
          ne: "विशेषताअनुसार रेफर ढाँचा लेखापरीक्षा चिकित्सा संघले।",
        },
        {
          en: "Share this point so health promises become bedside reality (#point-85).",
          ne: "स्वास्थ्य वाचा शय्यामा देखियोस् भने साझेदारी गर्नुहोस् (#बुँदा-८५)।",
        },
      ],
      programStatusEn: "🟡 At risk — multi-stream health reform package (free beds, portal, HIS, digital pharmacy, burn wards, air ambulance) not publicly verified on this tracker.",
      programStatusNe: "🟡 जोखिममा — बहुधारा स्वास्थ्य सुधार (निःशुल्क शय्या, पोर्टल, HIS, फार्मेसी, बर्न, हवाई) यो ट्र्याकरमा प्रमाणित छैन।",
    },
  },
];
