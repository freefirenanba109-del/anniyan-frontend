
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppScreen, Language, UI_STRINGS, Theme, FontSize } from '../types';
import { generateTTS, decodeAudio, decodeAudioBuffer } from '../geminiService';

interface HomeProps {
  onNavigate: (screen: AppScreen) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  totalClaims: number;
  theme: Theme;
  onToggleTheme: () => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const LANGUAGES: Language[] = ['English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada'];

const Home: React.FC<HomeProps> = ({ onNavigate, language, setLanguage, totalClaims, theme, onToggleTheme, fontSize, setFontSize }) => {
  const strings = UI_STRINGS[language] || UI_STRINGS.English;
  const isDark = theme === 'dark';
  
  const [activeWidget, setActiveWidget] = useState<number | null>(null);
  const [isWidgetAudioLoading, setIsWidgetAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const widgets = [
    { icon: 'fa-shield-halved', label: strings.safeOpt, desc: strings.safeOptDesc, color: isDark ? 'text-zinc-500' : 'text-zinc-400', target: AppScreen.DISCLAIMER },
    { icon: 'fa-balance-scale', label: strings.dharmaOpt, desc: strings.dharmaOptDesc, color: 'text-red-600', target: AppScreen.SUBMIT },
    { icon: 'fa-wand-magic-sparkles', label: strings.reformOpt, desc: strings.reformOptDesc, color: 'text-purple-500', target: AppScreen.SUGGESTION }
  ];

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.onended = null;
      try { sourceRef.current.stop(); } catch (e) {}
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    offsetRef.current = 0;
  }, []);

  const updateProgress = useCallback(() => {
    if (!audioCtxRef.current || !bufferRef.current || !isPlaying || isPaused) return;
    const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
    const currentPos = elapsed + offsetRef.current;
    const duration = bufferRef.current.duration;
    const currentProgress = (currentPos / duration) * 100;

    if (currentProgress >= 100) {
      setProgress(100);
      setIsPlaying(false);
      setIsPaused(false);
      offsetRef.current = 0;
    } else {
      setProgress(currentProgress);
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isPlaying, isPaused]);

  const startPlayback = useCallback((buffer: AudioBuffer) => {
    if (!audioCtxRef.current) return;
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

    if (sourceRef.current) {
      sourceRef.current.onended = null;
      try { sourceRef.current.stop(); } catch (e) {}
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current.destination);
    
    const startAt = isPaused ? offsetRef.current : 0;
    source.start(0, Math.max(0, startAt % buffer.duration));
    startTimeRef.current = audioCtxRef.current.currentTime;
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
  }, [isPaused, updateProgress]);

  const handlePause = useCallback(() => {
    if (!sourceRef.current || isPaused || !audioCtxRef.current) return;
    const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
    offsetRef.current += elapsed;
    
    sourceRef.current.onended = null;
    try { sourceRef.current.stop(); } catch (e) {}
    sourceRef.current.disconnect();
    sourceRef.current = null;
    
    setIsPaused(true);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [isPaused]);

  const togglePlayPause = () => {
    initAudio();
    if (isPlaying && !isPaused) {
      handlePause();
    } else if (bufferRef.current) {
      startPlayback(bufferRef.current);
    }
  };

  const handleWidgetClick = async (index: number) => {
    if (activeWidget === index) {
      setActiveWidget(null);
      stopAudio();
      bufferRef.current = null;
      return;
    }
    
    stopAudio();
    bufferRef.current = null;
    setActiveWidget(index);
    const widget = widgets[index];
    
    if (index === 2) {
      setIsWidgetAudioLoading(false);
      return;
    }

    initAudio();
    setIsWidgetAudioLoading(true);
    try {
      const voice = index === 0 ? 'Zephyr' : 'Fenrir';
      const audioBase64 = await generateTTS(widget.desc, language, voice);
      
      if (audioBase64) {
        const bytes = decodeAudio(audioBase64);
        const buffer = await decodeAudioBuffer(bytes, audioCtxRef.current!);
        bufferRef.current = buffer;
        startPlayback(buffer);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsWidgetAudioLoading(false);
    }
  };

  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  return (
    <div className={`flex flex-col items-center h-full text-center relative overflow-hidden px-4 sm:px-6 py-4 justify-between transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-zinc-50'}`}>
      <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-[radial-gradient(circle_at_50%_20%,rgba(220,38,38,0.15)_0%,transparent_60%)]' : 'bg-[radial-gradient(circle_at_50%_20%,rgba(220,38,38,0.05)_0%,transparent_60%)]'}`}></div>

      <div className="w-full flex justify-between items-center z-30 shrink-0">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]"></div>
           <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>ANNIYAN_SCAN</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative group">
            <button className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600 shadow-sm'}`}>
              <i className="fas fa-font"></i>
            </button>
            <div className={`absolute right-0 top-full mt-2 w-32 border rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-50 overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
              {(['small', 'medium', 'large'] as FontSize[]).map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors ${fontSize === size ? 'text-red-500' : (isDark ? 'text-zinc-500' : 'text-zinc-400')}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => { stopAudio(); onNavigate(AppScreen.ABOUT); }} className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all active:scale-90 ${isDark ? 'bg-zinc-900 border-zinc-800 text-red-500' : 'bg-white border-zinc-200 text-red-600'}`}>
            <i className="fas fa-circle-info"></i>
          </button>

          <button onClick={() => { stopAudio(); onNavigate(AppScreen.PROFILE); }} className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all active:scale-90 ${isDark ? 'bg-zinc-900 border-zinc-800 text-blue-500' : 'bg-white border-zinc-200 text-blue-600'}`}>
            <i className="fas fa-user-secret"></i>
          </button>

          <button onClick={() => { stopAudio(); onToggleTheme(); }} className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all active:scale-90 ${isDark ? 'bg-zinc-900 border-zinc-800 text-yellow-500' : 'bg-white border-zinc-200 text-indigo-600'}`}>
            <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>

          <div className="relative group">
            <button className={`flex items-center gap-2 border px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'}`}>
              <i className="fas fa-globe"></i> {language}
            </button>
            <div className={`absolute right-0 top-full mt-2 w-32 border rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-50 overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  onClick={() => { stopAudio(); setLanguage(lang as Language); }}
                  className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors ${language === lang ? 'text-red-500' : (isDark ? 'text-zinc-500' : 'text-zinc-400')}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full h-32 sm:h-36 flex items-center justify-center z-10 pointer-events-none shrink-0 my-2">
        <div className="relative w-24 sm:w-28 h-32 sm:h-36 animate-[anniyanBreathing_4s_easeInOutSine_infinite]">
          <div className={`absolute inset-0 blur-3xl animate-pulse ${isDark ? 'bg-red-900/10' : 'bg-red-500/5'}`}></div>
          <div className={`absolute inset-0 border rounded-[45%_45%_55%_55%] backdrop-blur-sm transition-all duration-500 ${isDark ? 'bg-zinc-950/40 border-red-900/20 shadow-[0_0_40px_rgba(153,27,27,0.2)]' : 'bg-white border-zinc-200 shadow-[0_10px_30px_rgba(0,0,0,0.1)]'}`}></div>
          <div className="flex justify-between w-full px-5 sm:px-6 mt-10 sm:mt-12">
            <div className="w-5 sm:w-6 h-1.5 bg-red-600 rounded-[80%_20%_80%_20%] shadow-[0_0_15px_red] animate-[eyeFlicker_2s_infinite]"></div>
            <div className="w-5 sm:w-6 h-1.5 bg-red-600 rounded-[20%_80%_20%_80%] shadow-[0_0_15px_red] animate-[eyeFlicker_2s_infinite_0.3s]"></div>
          </div>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-red-700/60 rounded-full blur-[1px] animate-pulse"></div>
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-8 sm:w-10 h-3 border-b rounded-[50%] ${isDark ? 'border-red-900/60' : 'border-red-200'}`}></div>
        </div>
        <div className={`absolute inset-x-0 h-[1px] blur-sm animate-scan z-20 ${isDark ? 'bg-red-600/30' : 'bg-red-400/20'}`}></div>
      </div>

      <div className="relative z-20 flex flex-col items-center shrink-0">
        <h1 className={`text-3xl sm:text-4xl font-cinzel font-black tracking-[-0.05em] leading-none transition-colors ${isDark ? 'text-white' : 'text-zinc-900'}`}>ANNIYAN</h1>
        <p className={`font-cinzel tracking-[0.3em] uppercase text-[11px] font-black mt-1 ${isDark ? 'text-red-700' : 'text-red-600'}`}>THE FINAL JUSTICE</p>

        <div className={`mt-3 flex items-center gap-2 px-3 py-1 border rounded-full transition-colors ${isDark ? 'bg-zinc-950/80 border-zinc-900' : 'bg-white border-zinc-200 shadow-sm'}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
          <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>RECORDS</span>
          <span className={`text-[12px] font-cinzel font-bold tracking-widest ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>{totalClaims.toLocaleString()}</span>
        </div>

        <div className="mt-6 sm:mt-8 max-w-[280px] relative px-6">
          <p className={`text-[11px] font-cinzel leading-relaxed tracking-[0.1em] uppercase font-bold italic animate-[textDistort_8s_infinite] drop-shadow-[0_0_2px_rgba(220,38,38,0.2)] ${isDark ? 'text-red-600/80' : 'text-red-700'}`}>"{strings.homeQuote}"</p>
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-4 sm:gap-6 mt-4 relative z-20 shrink-0">
        <div className="flex flex-col gap-3 w-full max-w-[320px]">
          <button onClick={() => { stopAudio(); onNavigate(AppScreen.SUBMIT); }} className={`font-black py-4 rounded-2xl shadow-xl active:scale-[0.97] flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-[11px] border ${isDark ? 'bg-red-900/90 hover:bg-red-800 text-white border-red-600/30' : 'bg-red-600 hover:bg-red-700 text-white border-red-500'}`}>
            <i className="fas fa-gavel text-sm"></i> {strings.sharePain}
          </button>

          <button onClick={() => { stopAudio(); onNavigate(AppScreen.SUGGESTION); }} className={`font-black py-3.5 rounded-2xl border transition-all active:scale-[0.97] flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] ${isDark ? 'bg-zinc-950/80 hover:bg-zinc-900 text-zinc-400 border-zinc-800' : 'bg-white hover:bg-zinc-50 text-zinc-600 border-zinc-200'}`}>
            <i className="fas fa-lightbulb text-purple-600"></i> {strings.suggestReform}
          </button>
        </div>

        <div className={`flex justify-around w-full max-w-[320px] pt-4 border-t ${isDark ? 'border-zinc-900/50' : 'border-zinc-200'}`}>
          {widgets.map((opt, i) => (
            <button key={i} onClick={() => handleWidgetClick(i)} className="flex flex-col items-center gap-2 group transition-all">
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-base transition-all group-active:scale-90 shadow-md ${activeWidget === i ? 'bg-red-600 text-white border-red-500 ring-4 ring-red-500/20' : (isDark ? 'bg-zinc-900/30 border-zinc-800' : 'bg-white border-zinc-100')} ${opt.color}`}>
                <i className={`fas ${opt.icon}`}></i>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity leading-tight w-16 text-center ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeWidget !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80" onClick={() => { setActiveWidget(null); stopAudio(); }}></div>
          <div className={`relative w-full max-w-sm rounded-[2.5rem] border p-6 sm:p-8 overflow-y-auto max-h-[90vh] shadow-[0_0_100px_rgba(220,38,38,0.3)] ${isDark ? 'bg-zinc-950 border-red-900/50' : 'bg-white border-red-100'}`}>
             <div className="absolute top-0 inset-x-0 h-1 bg-red-600/30 animate-scan"></div>
             
             <div className="flex flex-col items-center text-center space-y-6">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border text-2xl ${widgets[activeWidget].color} ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                   <i className={`fas ${widgets[activeWidget].icon}`}></i>
                </div>
                
                <h3 className="text-base sm:text-lg font-cinzel font-black uppercase tracking-widest text-red-600">{widgets[activeWidget].label}</h3>

                {activeWidget === 2 ? (
                  <div className="w-full space-y-4 text-left">
                    <p className={`text-[11px] font-black uppercase tracking-widest text-center ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{strings.reformOptDesc}</p>
                    {/* Character Persona Summaries */}
                    <div className="space-y-3">
                      {[strings.ambiTitle, strings.anniyanTitle, strings.remoTitle].map((t, idx) => (
                        <div key={t} className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                          <h4 className="text-[10px] font-black uppercase text-red-600 mb-1">{t}</h4>
                          <p className={`text-[9px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{idx === 0 ? strings.ambiDesc : idx === 1 ? strings.anniyanDesc : strings.remoDesc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full space-y-6">
                    <p className={`text-sm leading-relaxed font-light ${isWidgetAudioLoading ? 'opacity-30' : 'opacity-100'} ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {widgets[activeWidget].desc}
                    </p>
                    
                    <div className="flex items-center gap-4 w-full pt-2">
                      <button 
                        onClick={togglePlayPause}
                        disabled={isWidgetAudioLoading || !bufferRef.current}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all active:scale-90 ${isDark ? 'bg-red-700' : 'bg-red-600'} text-white disabled:opacity-30`}
                      >
                        {isWidgetAudioLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className={`fas ${isPlaying && !isPaused ? 'fa-pause' : 'fa-play'}`}></i>}
                      </button>
                      <div className="flex-grow">
                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                          <div className="h-full bg-red-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Resonance Scan</span>
                          <span className="text-[8px] font-black uppercase text-zinc-500">{Math.round(progress)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 w-full pt-4">
                  <button onClick={() => { setActiveWidget(null); stopAudio(); }} className={`flex-1 py-4 rounded-2xl border text-[11px] font-black uppercase tracking-widest ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : 'bg-zinc-100 border-zinc-200 text-zinc-500'}`}>Close</button>
                  <button onClick={() => { stopAudio(); onNavigate(widgets[activeWidget].target); }} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white shadow-xl ${isDark ? 'bg-red-700' : 'bg-red-600'}`}>Proceed</button>
                </div>
             </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes anniyanBreathing {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.03); opacity: 1; }
        }
        @keyframes eyeFlicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes textDistort {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; color: #ff0000; }
        }
      `}</style>
    </div>
  );
};

export default Home;
