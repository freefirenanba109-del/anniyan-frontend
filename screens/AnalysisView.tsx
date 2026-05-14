
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppScreen, JusticeAnalysis, Language, UI_STRINGS, Theme } from '../types';
import { decodeAudio, decodeAudioBuffer, generateTTS, translateAnalysis, generateJusticeImage } from '../geminiService';

interface AnalysisViewProps {
  analysis: JusticeAnalysis;
  onNavigate: (screen: AppScreen) => void;
  language: Language;
  audioCtx: AudioContext | null;
  theme: Theme;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis: initialAnalysis, onNavigate, language: initialLanguage, audioCtx, theme }) => {
  const [activeTab, setActiveTab] = useState<'ANNIYAN' | 'REMO' | 'LEGAL'>('ANNIYAN');
  const [currentLanguage, setCurrentLanguage] = useState<Language>(initialLanguage);
  const [analysis, setAnalysis] = useState<JusticeAnalysis>(initialAnalysis);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRevealing, setIsRevealing] = useState(true);
  const [imageLoading, setImageLoading] = useState(!initialAnalysis.imageBase64);
  const [audioLoading, setAudioLoading] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const isDark = theme === 'dark';
  const strings = UI_STRINGS[currentLanguage] || UI_STRINGS.English;
  
  const [audioCache, setAudioCache] = useState<{ [lang: string]: { ANNIYAN?: string, REMO?: string } }>({
    [initialLanguage]: {
      ANNIYAN: initialAnalysis.audioBase64,
      REMO: initialAnalysis.reformAudioBase64
    }
  });

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.onended = null;
      try { sourceRef.current.stop(); } catch (e) {}
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    offsetRef.current = 0;
  }, []);

  const updateProgress = useCallback(() => {
    if (!audioCtx || !bufferRef.current || !isPlaying || isPaused) return;
    const elapsed = audioCtx.currentTime - startTimeRef.current;
    const currentPos = elapsed + offsetRef.current;
    const pct = (currentPos / bufferRef.current.duration) * 100;
    
    if (pct >= 100) {
      setProgress(100);
      setIsPlaying(false);
      setIsPaused(false);
      offsetRef.current = 0;
    } else {
      setProgress(pct);
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  }, [audioCtx, isPlaying, isPaused]);

  const startPlayback = useCallback(() => {
    if (!audioCtx || !bufferRef.current) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    if (sourceRef.current) {
      sourceRef.current.onended = null;
      try { sourceRef.current.stop(); } catch(e) {}
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = bufferRef.current;
    source.connect(audioCtx.destination);
    
    const startAt = isPaused ? offsetRef.current : 0;
    const safeOffset = startAt % bufferRef.current.duration;
    
    source.start(0, safeOffset);
    startTimeRef.current = audioCtx.currentTime;
    sourceRef.current = source;
    
    setIsPlaying(true);
    setIsPaused(false);
    rafRef.current = requestAnimationFrame(updateProgress);
    
    source.onended = () => {
      if (sourceRef.current === source) {
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(0);
        offsetRef.current = 0;
      }
    };
  }, [audioCtx, isPaused, updateProgress]);

  const handlePause = useCallback(() => {
    if (!sourceRef.current || isPaused || !audioCtx) return;
    
    const elapsed = audioCtx.currentTime - startTimeRef.current;
    offsetRef.current += elapsed;
    
    const source = sourceRef.current;
    source.onended = null;
    try { source.stop(); } catch(e) {}
    source.disconnect();
    sourceRef.current = null;
    
    setIsPaused(true);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [audioCtx, isPaused]);

  const togglePlay = () => {
    if (isPlaying && !isPaused) {
      if (sourceRef.current) handlePause();
      else if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        setIsPaused(true);
        setIsPlaying(false);
      }
    } else if (isPaused) {
      if (bufferRef.current) startPlayback();
      else if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setIsPlaying(true);
      }
    } else {
      handlePlayAudio();
    }
  };

  useEffect(() => {
    if (isRevealing) {
      const timer = setTimeout(() => setIsRevealing(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isRevealing]);

  // Visual generation removed as per user request.

  // We no longer auto-play audio on tab switch to prevent browser Autoplay Policy errors.
  useEffect(() => {
    if (isRevealing || activeTab === 'LEGAL') {
        stopAudio();
    }
  }, [activeTab, isRevealing, stopAudio]);

  const handlePlayAudio = () => {
    if (activeTab === 'LEGAL') return;
    
    // Stop any existing audio
    stopAudio();
    
    const text = activeTab === 'ANNIYAN' ? analysis.anniyanJudgement : analysis.remoReform;

    // SYNCHRONOUS UNLOCK FOR BROWSER TTS (Fixes Autoplay Error)
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
    }
    
    setAudioLoading(true);
    const voice = activeTab === 'ANNIYAN' ? 'Fenrir' : 'Kore';

    generateTTS(text, currentLanguage, voice).then(audio => {
      setAudioLoading(false);
      if (audio) {
        const bytes = decodeAudio(audio);
        decodeAudioBuffer(bytes, audioCtx!).then(buf => {
          bufferRef.current = buf;
          startPlayback();
        });
      } else {
        // FALLBACK: Native speech wrapped in timeout to bypass cancel() bug
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(text);
          
          // Map all languages to correct BCP 47 tags for proper native accent playing
          if (currentLanguage === 'Tamil') utterance.lang = 'ta-IN';
          else if (currentLanguage === 'Hindi') utterance.lang = 'hi-IN';
          else if (currentLanguage === 'Telugu') utterance.lang = 'te-IN';
          else if (currentLanguage === 'Malayalam') utterance.lang = 'ml-IN';
          else if (currentLanguage === 'Kannada') utterance.lang = 'kn-IN';
          else utterance.lang = 'en-US';
          
          utterance.pitch = activeTab === 'ANNIYAN' ? 0.1 : 1.2;
          utterance.rate = activeTab === 'ANNIYAN' ? 0.8 : 1.0;
          
          utterance.onstart = () => setIsPlaying(true);
          utterance.onend = () => { setIsPlaying(false); setProgress(0); };
          utterance.onerror = (e) => { console.error("SpeechSynth error", e); setIsPlaying(false); };
          
          // CRITICAL BUG FIX: Attach to window to prevent Chrome Garbage Collection stopping the audio mid-way
          (window as any).__utteranceCache = utterance;
          
          window.speechSynthesis.speak(utterance);
          
          const estDuration = (text.length / 15) * 1000;
          let start = Date.now();
          const animate = () => {
             if (!window.speechSynthesis.speaking) {
                setProgress(100);
                return;
             }
             const pct = ((Date.now() - start) / estDuration) * 100;
             setProgress(Math.min(pct, 99));
             rafRef.current = requestAnimationFrame(animate);
          };
          rafRef.current = requestAnimationFrame(animate);
        }, 50);
      }
    }).catch(() => setAudioLoading(false));
  };

  const handleLanguageChange = async (newLang: Language) => {
    setIsLangMenuOpen(false); // Definitively close
    if (newLang === currentLanguage || isProcessing) return;
    
    setIsProcessing(true);
    stopAudio();
    try {
      const translated = await translateAnalysis(initialAnalysis, newLang);
      setAnalysis(translated);
      setCurrentLanguage(newLang);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  return (
    <div className={`flex flex-col h-[100dvh] w-full relative transition-colors duration-500 overflow-hidden ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      <header className={`p-4 shrink-0 flex items-center justify-between border-b ${isDark ? 'bg-black border-zinc-900' : 'bg-white border-zinc-200 shadow-sm'}`}>
        <div className="flex items-center gap-3 truncate">
          <button onClick={() => { stopAudio(); onNavigate(AppScreen.HOME); }} className={`w-10 h-10 flex items-center justify-center rounded-2xl border transition-all active:scale-90 shrink-0 ${isDark ? 'text-zinc-400 bg-zinc-900 border-zinc-800' : 'text-zinc-600 bg-white border-zinc-200'}`}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <div className="truncate text-left">
            <h2 className="text-sm font-cinzel font-black uppercase truncate">{analysis.mistakeType}</h2>
            <span className={`text-[0.5rem] font-black uppercase px-2 py-0.5 rounded border inline-block mt-0.5 ${analysis.severity === 'High' ? 'bg-red-950/20 text-red-500 border-red-900/50' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
              {analysis.severity} SIN
            </span>
          </div>
        </div>
        
        <div className="relative shrink-0">
            <button 
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg text-[0.6rem] font-black uppercase tracking-widest ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'}`}
            >
              <i className="fas fa-language"></i> {currentLanguage.slice(0,3)}
            </button>
            {isLangMenuOpen && (
              <>
                <div className="fixed inset-0 z-[55]" onClick={() => setIsLangMenuOpen(false)}></div>
                <div className={`absolute right-0 top-full mt-2 w-32 border rounded-xl shadow-2xl z-[60] overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
                  {['English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada'].map(lang => (
                    <button 
                      key={lang} 
                      onClick={() => handleLanguageChange(lang as Language)} 
                      className={`w-full text-left px-4 py-3 text-[0.6rem] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors ${currentLanguage === lang ? 'text-red-500' : (isDark ? 'text-zinc-500' : 'text-zinc-400')}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </>
            )}
        </div>
      </header>

      <main className="flex-grow overflow-y-auto w-full flex flex-col">
        <div className="relative w-full aspect-video overflow-hidden shrink-0 max-h-[30vh] flex items-center justify-center">
           <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-zinc-900 to-black' : 'bg-gradient-to-br from-red-50 to-zinc-200'}`}></div>
           
           {/* Attractive Animated Background Replacement */}
           <div className="absolute inset-0 opacity-30 flex items-center justify-center overflow-hidden">
              <div className={`w-[200%] h-[200%] animate-[spin_20s_linear_infinite] rounded-[40%] ${isDark ? 'bg-red-900/20' : 'bg-red-500/10'}`}></div>
              <div className={`absolute w-[180%] h-[180%] animate-[spin_15s_linear_infinite_reverse] rounded-[45%] ${isDark ? 'bg-black/40' : 'bg-white/40'}`}></div>
           </div>

           <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center transform hover:scale-105 transition-transform duration-700">
             <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-2xl border ${isDark ? 'bg-zinc-950 border-red-900/50 shadow-[0_0_30px_rgba(220,38,38,0.3)]' : 'bg-white border-red-200 shadow-[0_0_30px_rgba(220,38,38,0.15)]'}`}>
               <i className={`fas ${activeTab === 'ANNIYAN' ? 'fa-gavel text-red-600' : activeTab === 'REMO' ? 'fa-wand-magic-sparkles text-purple-600' : 'fa-balance-scale text-blue-600'} text-3xl animate-pulse`}></i>
             </div>
             <h3 className={`font-cinzel font-black uppercase text-xl sm:text-2xl tracking-widest ${isDark ? 'text-white' : 'text-zinc-900'}`}>{analysis.mistakeType}</h3>
             <div className="mt-2 flex gap-2 justify-center">
                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-500'}`}>Resonance Scan Complete</span>
             </div>
           </div>

           <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        <div className="px-4 -mt-6 relative z-10 shrink-0">
          <div className={`border rounded-[2rem] p-1 flex ${isDark ? 'bg-zinc-950/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-xl'}`}>
            {(['ANNIYAN', 'REMO', 'LEGAL'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 rounded-[1.5rem] text-[0.6rem] font-black uppercase tracking-widest transition-all ${activeTab === tab ? (isDark ? 'bg-zinc-900 text-white shadow-lg' : 'bg-zinc-100 text-zinc-900 shadow-sm') : 'text-zinc-500 opacity-60'}`}>{tab}</button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6 flex-grow">
          <div className="min-h-[150px]">
            {activeTab === 'ANNIYAN' && (
              <div className={`p-6 rounded-[2rem] border shadow-xl animate-in slide-in-from-bottom-5 duration-500 ${isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-100'}`}>
                <h3 className="text-[0.5rem] font-black text-red-600 uppercase tracking-widest mb-4">Judgment Verdict</h3>
                <p className={`text-base font-cinzel italic leading-relaxed ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>"{analysis.anniyanJudgement}"</p>
              </div>
            )}
            {activeTab === 'REMO' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                <div className={`p-6 rounded-[2rem] border shadow-xl ${isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-100'}`}>
                  <h3 className="text-[0.5rem] font-black text-purple-600 uppercase tracking-widest mb-4">Visionary Reform</h3>
                  <p className={`text-base font-cinzel italic leading-relaxed ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>"{analysis.remoReform}"</p>
                </div>
                {analysis.prayaschittaSteps.map((step, i) => (
                  <div key={i} className={`p-4 rounded-2xl border flex gap-4 items-center ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
                    <span className="text-lg font-cinzel font-black text-red-600 shrink-0">0{i+1}</span>
                    <p className={`text-[0.7rem] font-light ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{step}</p>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'LEGAL' && (
              <div className={`p-6 rounded-[2rem] border shadow-xl animate-in slide-in-from-bottom-5 duration-500 ${isDark ? 'bg-zinc-950 border-zinc-900 text-zinc-300' : 'bg-white border-zinc-100 text-zinc-600'}`}>
                <h3 className="text-[0.5rem] font-black text-blue-600 uppercase tracking-widest mb-4">Earthly Laws</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{analysis.legalAdvice}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className={`shrink-0 p-6 border-t relative z-50 transition-colors w-full ${isDark ? 'bg-zinc-950 border-zinc-900 shadow-up' : 'bg-white border-zinc-200 shadow-up'}`}>
        <div className="flex items-center gap-6 max-w-xl mx-auto">
           <button 
             onClick={togglePlay}
             disabled={audioLoading || activeTab === 'LEGAL'}
             className={`w-16 h-16 rounded-3xl text-white flex items-center justify-center shadow-xl active:scale-90 transition-all shrink-0 ${isDark ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-20`}
           >
              {audioLoading ? <i className="fas fa-spinner fa-spin text-lg"></i> : <i className={`fas ${isPlaying && !isPaused ? 'fa-pause' : 'fa-play'} text-lg`}></i>}
           </button>
           <div className="flex-grow">
              <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                 <div className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[0.5rem] font-black uppercase tracking-widest opacity-40">Resonance Scan</span>
                <span className="text-[0.5rem] font-black uppercase">{Math.round(progress)}%</span>
              </div>
           </div>
        </div>
      </footer>
      <style>{`.shadow-up { box-shadow: 0 -4px 12px rgba(0,0,0,0.05); }`}</style>
    </div>
  );
};

export default AnalysisView;
