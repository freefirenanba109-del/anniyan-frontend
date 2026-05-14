
export type SeverityLevel = 'Low' | 'Medium' | 'High';
export type Language = 'English' | 'Tamil' | 'Hindi' | 'Telugu' | 'Malayalam' | 'Kannada';
export type Theme = 'dark' | 'light';
export type FontSize = 'small' | 'medium' | 'large';

export interface JusticeAnalysis {
  mistakeType: string;
  severity: SeverityLevel;
  anniyanJudgement: string;
  remoReform: string;
  prayaschittaSteps: string[];
  legalAdvice: string;
  helplines: string[];
  audioBase64?: string;
  reformAudioBase64?: string;
  imageBase64?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  analysis: JusticeAnalysis;
  language: Language;
}

export interface SuggestionAnalysis {
  title: string;
  moralWeight: string;
  roadmap: string[];
  impactScore: number;
  remoQuote: string;
  campaignSlogan: string;
  policyChange: string;
}

export interface ComplaintData {
  name?: string;
  category: string;
  description: string;
  evidence?: string;
  emotionLevel: number;
  language: Language;
}

export enum AppScreen {
  INTRO = 'INTRO',
  HOME = 'HOME',
  SUBMIT = 'SUBMIT',
  ANALYSIS = 'ANALYSIS',
  ABOUT = 'ABOUT',
  DISCLAIMER = 'DISCLAIMER',
  SUGGESTION = 'SUGGESTION',
  SUGGESTION_RESULT = 'SUGGESTION_RESULT',
  DASHBOARD = 'DASHBOARD',
  HUB = 'HUB',
  CHAT = 'CHAT',
  STUDIO = 'STUDIO',
  LIVE = 'LIVE',
  LOGIN = 'LOGIN',
  PROFILE = 'PROFILE'
}

export const UI_STRINGS: Record<Language, any> = {
  English: {
    homeQuote: 'DO NOT HIDE. ANNIYAN IS WATCHING YOU. THERE IS NO ESCAPE.',
    sharePain: 'SEND THE GUILTY TO ANNIYAN',
    suggestReform: 'TRINITY: PURIFY THE WORLD',
    dashboard: 'JUSTICE COMMAND CENTER',
    about: 'APP GUIDE & MOTIVE',
    loreSub: 'HOW TO USE THE ANNIYAN JUSTICE SYSTEM',
    disclaimer: 'FINAL WARNING',
    disclaimerTitle: 'YOUR SOUL IS NOW TRACKED',
    disclaimerBody: 'By proceeding, you acknowledge that every confession is recorded in the cosmic ledger of Dharma. Anniyan does not forget. Remo does not overlook. This is not a game. If you provide false information, Anniyan foretells a fate worse than death. You are entering a zone of absolute moral accountability.',
    submitTitle: 'CONFESS THE CRIME',
    submitSub: 'SPEAK THE TRUTH. ANNIYAN IS WATCHING YOU. SILENCE IS GUILT.',
    suggestTitle: 'THE PURIFICATION VISION',
    suggestSub: 'Architect a world where the corrupt find no shadow.',
    nameLabel: 'NAME OF THE SINNER',
    catLabel: 'TYPE OF ATROCITY',
    descLabel: 'WHAT HAPPENED? (BE HONEST)',
    evidenceLabel: 'PROOFS FOR THE JUDGE',
    suggestionLabel: 'HOW TO ERADICATE THE EVIL',
    intensityLabel: 'HOW BAD IS THIS SIN?',
    seekButton: 'DEMAND JUSTICE NOW',
    submitSuggestion: 'GENERATE BLUEPRINT',
    analyzing: 'ANNIYAN IS WATCHING YOU...',
    analyzingSub: 'SCANNING YOUR SOUL. THE LEDGER IS OPEN. NO ESCAPE.',
    anniyan: 'HELL\'S VERDICT',
    remo: 'TRINITY PATH',
    legal: 'HUMAN LAWS',
    backHome: 'RETURN TO THE SHADOWS',
    totalClaims: 'TOTAL CRIMES RECORDED',
    blueprintTitle: 'THE PURIFICATION PLAN',
    roadmapLabel: 'STEPS TO ATONE',
    sloganLabel: 'WAR CRY',
    categories: ['Corruption', 'Harassment', 'Fraud', 'Abuse', 'Negligence', 'Lies', 'Other'],
    safeOpt: 'ENCRYPTED HELL',
    safeOptDesc: 'CONFESSIONS ARE SHIELDED BY COSMIC ENCRYPTION. ONLY THE JUDGE CAN SEE YOUR TRUTH.',
    dharmaOpt: 'ABSOLUTE JUSTICE',
    dharmaOptDesc: 'THE PRICE OF EVERY SIN IS FIXED. THERE IS NO MERCY, ONLY BALANCE.',
    reformOpt: 'THE TRINITY CONCEPT',
    reformOptDesc: 'The motive of this app is absolute moral purification through three divine personas.',
    ambiTitle: 'AMBI: THE EMPATH',
    ambiDesc: 'The voice of rules and victims. He feels the pain of the common man and attempts to follow the law.',
    anniyanTitle: 'ANNIYAN: THE JUDGE',
    anniyanDesc: 'The executioner of pure justice. He delivers inescapable punishments for every sin committed.',
    remoTitle: 'REMO: THE ARCHITECT',
    remoDesc: 'The social visionary. He designs the roadmap for a world where corruption has no place to exist.',
    introTitle: 'THE TRINITY AWAKENS',
    introSub: 'Meet the architects of your judgment.',
    proceedToJustice: 'PROCEED TO JUSTICE',
    listenNarrative: 'HEAR YOUR FATE',
    hubTitle: 'DHARMA_ENGINE',
    hubSub: 'Tapping into the Cosmic Death-Note',
    chatTitle: 'DEATH_CHAT',
    chatSub: 'Talk to the spirits of Punishment',
    studioTitle: 'VISION_OF_HELL',
    studioSub: 'See the world after the Great Purge',
    liveTitle: 'THE VOICE OF WRATH',
    liveSub: 'Real-time interrogation',
    originsTitle: 'THE TRINITY LORE',
    originsSub: 'The concept behind Anniyan',
    dharmaVerdict: 'FINAL JUDGMENT',
    copyLegal: 'EXTRACT LAW',
    setDeadline: 'DEADLINE',
    daysLeft: 'DAYS UNTIL YOU BURN',
    completeReform: 'SIN ERASED',
    dashboardSubtitle: 'LIVE AI MONITORING OF HUMAN ATROCITIES',
    moralHazard: 'SOCIETAL_ROT_INDEX',
    dharmaQuotient: 'DHARMA_STABILITY',
    reformRate: 'PUNISHMENT_VELOCITY',
    mistakePattern: 'CRIME CATEGORY ANALYSIS',
    karmaLiveTrace: 'KARMA RESONANCE WAVE',
    dharmaRhythm: 'DHARMA RHYTHM (GLOBAL)',
    societalDecay: 'COMMUNITY HEALTH ANALYSIS',
    impactScoreLabel: 'Terror Level',
    policyLabel: 'Legislative Execution',
    sourceLabel: 'Sin Context',
    visionLabel: 'Purification Vision',
    aspectLabel: 'Vision Ratio',
    resLabel: 'Clarity',
    generateButton: 'Summon Vision',
    transcriptLabel: 'Live Interrogation',
    consultationPrompt: 'Start Interrogation',
    listeningStatus: 'Soul Scan Active...',
    verifiedSources: 'DHARMA_RECORDS',
    identity: 'IDENTITY',
    category: 'CATEGORY',
    emotionalIntensity: 'SIN_MAGNITUDE',
    yourJudgements: 'ANONYMOUS CRIME LEDGER',
    noJudgements: 'The ledger is silent. No sins reported.',
    viewVerdict: 'VIEW YOUR FATE',
    understand: 'I ACCEPT MY FATE',
    listenDisclaimer: 'HEAR THE WARNING',
    searchOn: 'Global Hunt ON',
    searchOff: 'Global Hunt OFF',
    mapsOn: 'Sin Mapping ON',
    mapsOff: 'Sin Mapping OFF',
    rotStatus: 'SOCIETAL DECAY CHANCE',
    bloodCount: 'PUNISHMENT_QUEUE',
    soulIndex: 'DHARMA_BREACH_DETECTED',
    interrogationLogs: 'ANONYMOUS JUSTICE FEED',
    appMotive: 'APP MISSION',
    appMotiveDesc: 'This application acts as a digital mirror for societal accountability.',
    step1Title: '1. REPORT INJUSTICE',
    step1Desc: 'Confess or report a crime as Ambi.',
    step2Title: '2. RECEIVE VERDICT',
    step2Desc: 'Anniyan will weigh the sin and issue a judgment.',
    step3Title: '3. ARCHITECT REFORM',
    step3Desc: 'Remo provides a visionary blueprint.',
    exportVerdict: 'DOWNLOAD VERDICT',
    exportAudio: 'DOWNLOAD AUDIO',
    exportImage: 'SAVE IMAGE (TEXT)',
    exportBoth: 'SAVE IMAGE + AUDIO',
    appSize: 'APP SIZE'
  },
  Tamil: {
    homeQuote: '"ஒளிய முடியாது. அந்நியன் உன்னைப் பார்க்கிறான். தப்பிக்க வழியில்லை."',
    sharePain: 'குற்றவாளியைக் காட்டித்தா - அந்நியன் வருவான்',
    suggestReform: 'முக்கூட்டு: உலகச் சுத்திகரிப்பு',
    dashboard: 'நீதிக் கட்டுப்பாட்டு மையம்',
    about: 'செயலி வழிகாட்டி',
    loreSub: 'அந்நியன் நீதி முறையை எவ்வாறு பயன்படுத்துவது',
    disclaimer: 'இறுதி எச்சரிக்கை',
    disclaimerTitle: 'உன் ஆத்மா கண்காணிக்கப்படுகிறது',
    disclaimerBody: 'தொடர்வதன் மூலம், ஒவ்வொரு ஒப்புதல் வாக்குமூலமும் தர்மத்தின் அண்டப் பேரேட்டில் பதிவு செய்யப்படுவதை நீங்கள் ஒப்புக்கொள்கிறீர்கள். அந்நியன் மறப்பதில்லை. ரெமோ அலட்சியப்படுத்துவதில்லை. நீங்கள் தவறான தகவல்களை வழங்கினால், மரணத்தை விட மோசமான விதியை அந்நியன் முன்னறிவிக்கிறான்.',
    submitTitle: 'பாவத்தை ஒப்புக்கொள்',
    submitSub: 'உண்மையைச் சொல். அந்நியன் உன்னைப் பார்க்கிறான். அமைதி பாவம்.',
    suggestTitle: 'சுத்திகரிப்பு தொலைநோக்கு',
    suggestSub: 'ஊழல்வாதிகள் ஒளிய முடியாத ஒரு உலகத்தை உருவாக்குங்கள்.',
    nameLabel: 'பாவியின் பெயர்',
    catLabel: 'அநீதியின் வகை',
    descLabel: 'என்ன நடந்தது? (உண்மையைச் சொல்)',
    evidenceLabel: 'ஆதாரங்கள்',
    suggestionLabel: 'அழுக்கை வேரறுக்க வழி',
    intensityLabel: 'பாவத்தின் அளவு',
    seekButton: 'நீதி கொடு',
    submitSuggestion: 'திட்டத்தை உருவாக்கு',
    analyzing: 'அந்நியன் உன்னைப் பார்க்கிறான்...',
    analyzingSub: 'உன் ஆத்மாவை ஸ்கேன் செய்கிறது. தப்பிக்க வழியில்லை.',
    anniyan: 'நரகத் தீர்ப்பு',
    remo: 'முக்கூட்டு பாதை',
    legal: 'மனித சட்டங்கள்',
    backHome: 'நிழல்களுக்குத் திரும்பு',
    totalClaims: 'பதிவான மொத்த குற்றங்கள்',
    blueprintTitle: 'சுத்திகரிப்பு வரைபடம்',
    roadmapLabel: 'பிராயச்சித்த படிகள்',
    sloganLabel: 'யுத்த முழக்கம்',
    categories: ['ஊழல்', 'துன்புறுத்தல்', 'மோசடி', 'அத்துமீறல்', 'அலட்சியம்', 'பொய்', 'மற்றவை'],
    safeOpt: 'மறைக்கப்பட்ட நரகம்',
    safeOptDesc: 'உங்கள் வாக்குமூலங்கள் பாதுகாக்கப்பட்டவை. உங்கள் உண்மையை நீதிபதி மட்டுமே பார்க்க முடியும்.',
    dharmaOpt: 'முழுமையான நீதி',
    dharmaOptDesc: 'ஒவ்வொரு பாவத்திற்கும் ஒரு விலை உண்டு. மன்னிப்பு இல்லை. அந்நியன் உங்களை விடமாட்டான்.',
    reformOpt: 'முக்கூட்டு தத்துவம்',
    reformOptDesc: 'மூன்று தெய்வீக ஆளுமைகளின் மூலம் முழுமையான சுத்திகரிப்பு.',
    ambiTitle: 'அம்பி: சட்டத்தின் குரல்',
    ambiDesc: 'பாதிக்கப்பட்டவர்களின் குரல். அவர் சட்டத்தைப் பின்பற்றி மக்களின் வலியைப் புரிந்துகொள்கிறார்.',
    anniyanTitle: 'அந்நியன்: நீதிபதி',
    anniyanDesc: 'தப்பிக்க முடியாத தண்டனைகளை வழங்குபவர்.',
    remoTitle: 'ரெமோ: சிற்பி',
    remoDesc: 'ஊழலுக்கு இடமில்லாத உலகத்தை உருவாக்குபவர்.',
    introTitle: 'முக்கூட்டு எழுச்சி',
    introSub: 'உங்கள் தீர்ப்பின் சிற்பிகளைச் சந்திக்கவும்.',
    proceedToJustice: 'நீதிக்குச் செல்க',
    listenNarrative: 'உன் விதியைக் கேள்',
    hubTitle: 'தர்ம இயந்திரம்',
    hubSub: 'மரணக் குறிப்பேடு',
    chatTitle: 'மரண அரட்டை',
    chatSub: 'தண்டனை ஆவிகளுடன் பேசு',
    studioTitle: 'நரகக் காட்சி',
    studioSub: 'சுத்திகரிக்கப்பட்ட உலகத்தைக் காண்',
    liveTitle: 'கோபத்தின் குரல்',
    liveSub: 'நேரடி விசாரணை',
    originsTitle: 'மூவர் வரலாறு',
    originsSub: 'அந்நியன் உருவான கதை',
    dharmaVerdict: 'இறுதித் தீர்ப்பு',
    copyLegal: 'சட்டத்தை நகலெடு',
    setDeadline: 'காலக்கெடு',
    daysLeft: 'நீ எரிய இன்னும் சில நாட்களே',
    completeReform: 'பாவம் மன்னிக்கப்பட்டது',
    dashboardSubtitle: 'மனித அழுக்குகளின் நேரடிப் பதிவு',
    moralHazard: 'சமூகச் சீரழிவு',
    dharmaQuotient: 'ஆத்ம தூய்மை',
    reformRate: 'சுத்திகரிப்பு விகிதம்',
    mistakePattern: 'குற்ற வகை பகுப்பாய்வு',
    karmaLiveTrace: 'கர்மா அதிர்வு அலை',
    dharmaRhythm: 'தர்ம தாளம்',
    societalDecay: 'சமூக சுகாதார பகுப்பாய்வு',
    impactScoreLabel: 'பயத்தின் அளவு',
    policyLabel: 'சட்ட தண்டனை',
    sourceLabel: 'பாவ பின்னணி',
    visionLabel: 'சுத்திகரிப்பு பார்வை',
    aspectLabel: 'விகிதம்',
    resLabel: 'தெளிவு',
    generateButton: 'காட்சியை உருவாக்கு',
    transcriptLabel: 'நேரடி விசாரணை',
    consultationPrompt: 'விசாரணையைத் தொடங்கு',
    listeningStatus: 'ஸிகேன் நடக்கிறது...',
    verifiedSources: 'ஆதாரங்கள்',
    identity: 'அடையாளம்',
    category: 'வகை',
    emotionalIntensity: 'பாவத்தின் வீரியம்',
    yourJudgements: 'குற்றப் பதிவுகள்',
    noJudgements: 'குற்றங்கள் எதுவும் இல்லை.',
    viewVerdict: 'உன் விதியைக் காண்',
    understand: 'என் விதியை ஏற்கிறேன்',
    listenDisclaimer: 'எச்சரிக்கையைக் கேள்',
    searchOn: 'ஆன்',
    searchOff: 'ஆஃப்',
    mapsOn: 'ஆன்',
    mapsOff: 'ஆஃப்',
    rotStatus: 'சீரழிவு',
    bloodCount: 'தண்டனை',
    soulIndex: 'தர்ம நிலை',
    interrogationLogs: 'பதிவுகள்',
    appMotive: 'செயலி நோக்கம்',
    appMotiveDesc: 'சமூகப் பொறுப்புக்கூறலுக்கான டிஜிட்டல் கண்ணாடி.',
    step1Title: '1. புகாரளித்தல்',
    step1Desc: 'அம்பியாக ஒரு குற்றத்தைப் புகாரளிக்கவும்.',
    step2Title: '2. தீர்ப்பு பெறுதல்',
    step2Desc: 'அந்நியன் உங்கள் பாவத்தை எடைபோடுவார்.',
    step3Title: '3. சீர்திருத்தம்',
    step3Desc: 'ரெமோ ஒரு தொலைநோக்குத் திட்டத்தை வழங்குவார்.',
    exportVerdict: 'பதிவிறக்கவும்',
    exportAudio: 'ஆடியோ',
    exportImage: 'படம்',
    exportBoth: 'படம் + ஆடியோ',
    appSize: 'அளவு'
  },
  Hindi: {},
  Telugu: {},
  Malayalam: {},
  Kannada: {}
};

UI_STRINGS.Hindi = { ...UI_STRINGS.English };
UI_STRINGS.Telugu = { ...UI_STRINGS.English };
UI_STRINGS.Malayalam = { ...UI_STRINGS.English };
UI_STRINGS.Kannada = { ...UI_STRINGS.English };
