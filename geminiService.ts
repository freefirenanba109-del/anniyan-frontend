
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { JusticeAnalysis, ComplaintData, SuggestionAnalysis, Language } from "./types";

/**
 * Creates a fresh GoogleGenAI instance with the latest injected API_KEY
 */
const getApiKey = () => {
  return localStorage.getItem('gemini_api_key')
    || (typeof process !== 'undefined' && process.env?.API_KEY) 
    || (import.meta as any).env?.VITE_GEMINI_API_KEY 
    || '';
};

const getAI = () => new GoogleGenAI({ apiKey: getApiKey() });

function cleanJSONResponse(raw: string): string {
  return raw
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();
}

/**
 * Handles API errors globally, specifically watching for quota or key issues
 */
async function handleApiCall<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // If rate limited or entity not found (key issues), trigger the key selector if possible
    if (error.message?.includes("429") || error.message?.includes("Requested entity was not found")) {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        window.aistudio.openSelectKey();
      }
    }
    throw error;
  }
}

/**
 * Generates TTS with high-priority language instructions.
 * Forces the model to use native script and pronunciation.
 */
export async function generateTTS(text: string, lang: Language, voice: 'Fenrir' | 'Kore' | 'Zephyr' | 'Puck' = 'Zephyr'): Promise<string | undefined> {
  return handleApiCall(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ 
        parts: [{ 
          text: `SPEAK EXCLUSIVELY IN NATIVE ${lang.toUpperCase()}. DO NOT USE ENGLISH PHONETICS. 
                 TONE: AUTHORITATIVE, IMPACTFUL, DIVINE JUSTICE.
                 SCRIPT: ${text}` 
        }] 
      }],
      config: { 
        responseModalities: [Modality.AUDIO], 
        speechConfig: { 
          voiceConfig: { 
            prebuiltVoiceConfig: { voiceName: voice } 
          } 
        } 
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }).catch(e => {
    console.warn("TTS API Failed, returning undefined audio:", e);
    return undefined;
  });
}

/**
 * Quick text-only analysis to provide instant feedback.
 */
export async function analyzeInjusticeText(data: ComplaintData): Promise<JusticeAnalysis> {
  return handleApiCall(async () => {
    const ai = getAI();
    const textPrompt = `
      Analyze this report strictly in ${data.language}.
      Category: ${data.category}
      Description: ${data.description}
      Victim Pain: ${data.emotionLevel}/10
      
      Return JSON only:
      {
        "mistakeType": "Concise title in ${data.language}",
        "severity": "Low" | "Medium" | "High",
        "anniyanJudgement": "Dramatic moral verdict in ${data.language}",
        "remoReform": "Visionary solution in ${data.language}",
        "prayaschittaSteps": ["Step 1", "Step 2", "Step 3"] in ${data.language},
        "legalAdvice": "Human law context in ${data.language}",
        "helplines": ["Real Number 1", "Real Number 2"]
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: textPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mistakeType: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
              anniyanJudgement: { type: Type.STRING },
              remoReform: { type: Type.STRING },
              prayaschittaSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              legalAdvice: { type: Type.STRING },
              helplines: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['mistakeType', 'severity', 'anniyanJudgement', 'remoReform', 'prayaschittaSteps', 'legalAdvice', 'helplines']
          }
        }
      });
      return JSON.parse(cleanJSONResponse(response.text || '{}')) as JusticeAnalysis;
    } catch (e) {
      console.warn("API Call Failed, using fallback data:", e);
      return getMockAnalysis(data.category, data.description, data.language, data.emotionLevel);
    }
  });
}

function getMockAnalysis(category: string, description: string, lang: Language, emotion: number = 5): JusticeAnalysis {
  let act = "Section 420 (Cheating and Dishonestly Inducing Delivery of Property) - IPC";
  const cat = category.toLowerCase();
  if (cat.includes("corrupt") || cat.includes("bribe")) act = "Prevention of Corruption Act, 1988 - Section 7, 13(1)(a)";
  else if (cat.includes("violen") || cat.includes("assault")) act = "Section 319-322 IPC (Hurt) & Section 307 IPC (Attempt to Murder)";
  else if (cat.includes("cyber") || cat.includes("hack")) act = "Information Technology Act, 2000 - Section 66, 66C, 66D";
  else if (cat.includes("fraud") || cat.includes("scam")) act = "Section 420 IPC, Section 406 IPC (Criminal Breach of Trust)";
  else if (cat.includes("harass") || cat.includes("abuse")) act = "Section 354 IPC, Section 509 IPC, Protection of Women from Domestic Violence Act";

  const snippet = description && description.trim().length > 0 
      ? `your act of "${description.substring(0, 40).replace(/[^a-zA-Z0-9 ]/g, '')}..."` 
      : `this ${category}`;

  let j = `You thought you could hide ${snippet} in the dark? The cosmic ledger has recorded every tear you caused. You will be punished in the exact measure of their suffering.`;
  let r = `To prevent acts like ${snippet}, we must build a system where transparency is not an option, but a mandatory foundation of society. Only then can we eradicate this poison.`;
  let p = [`Publicly confess regarding ${snippet}.`, "Compensate the victim tenfold.", "Dedicate your life to preventing others from committing this sin."];
  let l = `Under the earthly penal code, this specific crime is classified under: ${act}. Severe imprisonment and absolute forfeiture of assets will follow. Surrender to the law immediately.`;

  if (lang === 'Tamil') {
    j = `இருட்டில் உங்கள் பாவங்களை மறைக்க முடியும் என்று நினைத்தீர்களா? பிரபஞ்ச கணக்கு புத்தகம் நீங்கள் ஏற்படுத்திய ஒவ்வொரு கண்ணீரையும் பதிவு செய்துள்ளது. அவர்களின் துன்பத்திற்கு நிகரான தண்டனையை நீங்கள் அனுபவிப்பீர்கள்.`;
    r = `வெளிப்படைத்தன்மை ஒரு விருப்பம் அல்ல, ஆனால் சமூகத்தின் கட்டாய அடித்தளமாக இருக்கும் ஒரு அமைப்பை நாம் உருவாக்க வேண்டும். அப்போதுதான் இந்த நஞ்சை ஒழிக்க முடியும்.`;
    p = ["உங்கள் தவறுகளை பகிரங்கமாக ஒப்புக்கொள்ளுங்கள்.", "பாதிக்கப்பட்டவருக்கு பத்து மடங்கு இழப்பீடு வழங்குங்கள்.", "மற்றவர்கள் இந்த பாவத்தை செய்வதை தடுக்க உங்கள் வாழ்க்கையை அர்ப்பணியுங்கள்."];
    l = `பூமியின் தண்டனைச் சட்டத்தின் கீழ், இந்த குற்றம் இதன்கீழ் வகைப்படுத்தப்பட்டுள்ளது: ${act}. கடுமையான சிறைத்தண்டனையும் சொத்துக்கள் பறிமுதலும் தொடரும். உடனடியாக சட்டத்திடம் சரணடையுங்கள்.`;
  } else if (lang === 'Hindi') {
    j = `क्या तुम्हें लगा तुम अपने पापों को अंधेरे में छिपा सकते हो? ब्रह्मांडीय बहीखाते ने तुम्हारे कारण गिरे हर आंसू को दर्ज किया है। तुम्हें उनकी पीड़ा के बराबर सजा मिलेगी।`;
    r = `हमें एक ऐसी प्रणाली बनानी होगी जहां पारदर्शिता कोई विकल्प नहीं, बल्कि समाज की अनिवार्य नींव हो। तभी हम इस जहर को मिटा सकते हैं।`;
    p = ["सार्वजनिक रूप से अपने गलत कामों को स्वीकार करें।", "पीड़ित को दस गुना मुआवजा दें।", "दूसरों को इस पाप से बचाने के लिए अपना जीवन समर्पित करें।"];
    l = `पृथ्वी के दंड संहिता के तहत, इस अपराध को वर्गीकृत किया गया है: ${act}। कठोर कारावास और संपत्ति की जब्ती होगी। तुरंत कानून के सामने आत्मसमर्पण करें।`;
  }

  return {
    mistakeType: `CRIMINAL ACT: ${category.toUpperCase()}`,
    severity: emotion > 7 ? 'High' : (emotion > 4 ? 'Medium' : 'Low'),
    anniyanJudgement: j,
    remoReform: r,
    prayaschittaSteps: p,
    legalAdvice: l,
    helplines: ["1800-JUSTICE", "112-EMERGENCY", "1930 (Cyber)"]
  };
}

/**
 * Generates cinematic visuals in the background.
 */
export async function generateJusticeImage(mistakeType: string): Promise<string | undefined> {
  return handleApiCall(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Cinematic dramatic noir justice visual for: ${mistakeType}. Red and Black theme, High contrast shadows, Anniyan movie style aesthetic.` }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return part.inlineData.data;
    }
  }).catch(e => {
    console.warn("Image API failed, using fallback:", e);
    return undefined;
  });
}

export async function translateAnalysis(analysis: JusticeAnalysis, targetLang: Language): Promise<JusticeAnalysis> {
  return handleApiCall(async () => {
    const ai = getAI();
    const prompt = `Translate this justice analysis JSON into ${targetLang}. Preserve the dramatic tone. JSON: ${JSON.stringify(analysis)}`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJSONResponse(response.text || '{}'));
  }).catch(e => {
    console.warn("Translate API failed, using native fallback:", e);
    return getMockAnalysis(analysis.mistakeType.replace('CRIMINAL ACT: ', ''), analysis.anniyanJudgement, targetLang);
  });
}

export async function processSuggestion(text: string, lang: Language): Promise<SuggestionAnalysis> {
  return handleApiCall(async () => {
    const ai = getAI();
    const prompt = `Analyze this reform idea as the character Remo in ${lang}: "${text}"`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJSONResponse(response.text || '{}')) as SuggestionAnalysis;
  }).catch(e => {
    console.warn("Suggestion API Failed, using fallback data:", e);
    return {
      reformTitle: `THE ${text.substring(0, 10).toUpperCase()} REFORM`,
      remoResponse: "A brilliant and visionary idea! Together, we can rebuild society piece by piece using your suggestion. Perfection takes time, but this is the first step.",
      impactScore: "95/100",
      implementationSteps: ["Analyze the structural flaws in the current system.", "Deploy the new rules strictly.", "Monitor compliance without mercy."],
      aestheticTheme: "Cyberpunk neon purple and black."
    } as SuggestionAnalysis;
  });
}

export async function complexChat(message: string, tools: { search?: boolean, maps?: boolean } = {}, lang: Language = 'English') {
  return handleApiCall(async () => {
    const ai = getAI();
    const activeTools: any[] = [];
    if (tools.search) activeTools.push({ googleSearch: {} });
    if (tools.maps) activeTools.push({ googleMaps: {} });
    const modelToUse = tools.maps ? 'gemini-2.5-flash' : 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: `Respond as the spirits of Justice in ${lang}: ${message}`,
      config: { tools: activeTools.length > 0 ? activeTools : undefined }
    });
    return { text: response.text, grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
  });
}

export async function generateProImage(prompt: string, aspectRatio: string, imageSize: '1K' | '2K' | '4K') {
  return handleApiCall(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: aspectRatio as any, imageSize: imageSize } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return part.inlineData.data;
    }
  });
}

export async function generateVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string | undefined> {
  return handleApiCall(async () => {
    const ai = getAI();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      const response = await fetch(`${downloadLink}&key=${getApiKey()}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
  });
}

export async function editImage(base64ImageData: string, prompt: string, mimeType: string = 'image/png'): Promise<string | undefined> {
  return handleApiCall(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType: mimeType } },
          { text: prompt }
        ]
      },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return part.inlineData.data;
    }
  });
}

export function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioBuffer(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
  return buffer;
}
