
import React, { useState, useRef, useEffect } from 'react';
import { AppScreen, Language, UI_STRINGS, Theme } from '../types';
import { generateTTS, decodeAudio, decodeAudioBuffer } from '../geminiService';

interface AboutProps {
  onNavigate: (screen: AppScreen) => void;
  language: Language;
  theme: Theme;
}

const About: React.FC<AboutProps> = ({ onNavigate, language, theme }) => {
  const strings = UI_STRINGS[language] || UI_STRINGS.English;
  const isDark = theme === 'dark';

  const [activePersona, setActivePersona] = useState<number | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const steps = [
    { title: strings.step1Title, desc: strings.step1Desc, color: 'text-blue-500', icon: 'fa-file-lines', voice: 'Puck' },
    { title: strings.step2Title, desc: strings.step2Desc, color: 'text-red-500', icon: 'fa-gavel', voice: 'Fenrir' },
    { title: strings.step3Title, desc: strings.step3Desc, color: 'text-purple-500', icon: 'fa-compass-drafting', voice: 'Kore' }
  ];

  const personas = [
    { title: strings.ambiTitle, desc: strings.ambiDesc, color: 'text-blue-500', icon: 'fa-heart', voice: 'Puck' },
    { title: strings.anniyanTitle, desc: strings.anniyanDesc, color: 'text-red-500', icon: 'fa-skull', voice: 'Fenrir' },
    { title: strings.remoTitle, desc: strings.remoDesc, color: 'text-purple-500', icon: 'fa-bolt', voice: 'Kore' }
  ];

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const stopAudio = () => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch (e) {}
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
    bufferRef.current = null;
  };

  useEffect(() => {
    return () => stopAudio();
  }, []);

  const updateProgress = () => {
    if (!audioCtxRef.current || !bufferRef.current || !isPlaying || isPaused) return;
    const elapsed = audioCtxRef.current.currentTime - startTimeRef.current + offsetRef.current;
    const duration = bufferRef.current.duration;
    const currentProgress = (elapsed / duration) * 100;

    if (currentProgress >= 100) {
      setProgress(100);
      setIsPlaying(false);
      offsetRef.current = 0;
    } else {
      setProgress(currentProgress);
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const startPlayback = (buffer: AudioBuffer) => {
    if (!audioCtxRef.current) return;
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch (e) {}
    }

    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current.destination);
    
    const startAt = isPaused ? offsetRef.current : 0;
    source.start(0, startAt);
    startTimeRef.current = audioCtxRef.current.currentTime;
    sourceRef.current = source;
    
    setIsPlaying(true);
    setIsPaused(false);
    rafRef.current = requestAnimationFrame(updateProgress);
  };

  const handlePause = () => {
    if (!sourceRef.current || isPaused) return;
    sourceRef.current.stop();
    if (audioCtxRef.current) {
      offsetRef.current += audioCtxRef.current.currentTime - startTimeRef.current;
    }
    setIsPaused(true);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const toggleListen = async (index: number, isPersona: boolean = false) => {
    initAudio();
    const uniqueIndex = isPersona ? index + 10 : index;
    if (activePersona === uniqueIndex && (isPlaying || isPaused)) {
      if (isPaused) {
        if (bufferRef.current) startPlayback(bufferRef.current);
      } else {
        handlePause();
      }
      return;
    }

    stopAudio();
    setActivePersona(uniqueIndex);
    setIsAudioLoading(true);

    try {
      const item = isPersona ? personas[index] : steps[index];
      const fullText = `${item.title}. ${item.desc}`;
      const audioBase64 = await generateTTS(fullText, language, item.voice as any);
      if (audioBase64) {
        const bytes = decodeAudio(audioBase64);
        const buffer = await decodeAudioBuffer(bytes, audioCtxRef.current!);
        bufferRef.current = buffer;
        startPlayback(buffer);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAudioLoading(false);
    }
  };

  return (
    <div className={`p-4 sm:p-6 space-y-8 h-full overflow-y-auto pb-40 transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-zinc-50'}`}>
      <header className="flex items-center gap-4 sticky top-0 bg-inherit py-4 z-50">
        <button onClick={() => { stopAudio(); onNavigate(AppScreen.HOME); }} className={`w-10 h-10 flex items-center justify-center rounded-2xl border transition-all active:scale-90 ${isDark ? 'text-zinc-400 bg-zinc-900 border-zinc-800 shadow-lg' : 'text-zinc-600 bg-white border-zinc-200 shadow-sm'}`}>
          <i className="fas fa-arrow-left text-sm"></i>
        </button>
        <div>
           <h2 className={`text-xl sm:text-2xl font-cinzel font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-zinc-900'}`}>{strings.about}</h2>
           <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">{strings.loreSub}</p>
        </div>
      </header>

      <section className="space-y-10 sm:space-y-12">
        {/* APP MOTIVE */}
        <div className={`p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border-l-4 shadow-xl transition-all relative overflow-hidden ${isDark ? 'bg-zinc-900/30 border-red-600' : 'bg-white border-red-500'}`}>
          <div className="absolute top-0 right-0 p-6 opacity-10">
             <i className="fas fa-bullseye text-5xl sm:text-6xl"></i>
          </div>
          <h3 className="text-red-500 font-black uppercase tracking-widest mb-3 text-[11px]">{strings.appMotive}</h3>
          <p className={`text-sm leading-relaxed font-light ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
            {strings.appMotiveDesc}
          </p>
        </div>

        {/* HOW IT WORKS STEPS */}
        <div className="space-y-4">
           <h4 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>THE SYSTEM WORKFLOW</h4>
           <div className="grid gap-4">
              {steps.map((step, i) => (
                <div key={i} className={`p-5 sm:p-6 rounded-3xl sm:rounded-[2.5rem] border flex items-start gap-4 transition-all ${isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-100 shadow-sm'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                    <i className={`fas ${step.icon} ${step.color} text-sm`}></i>
                  </div>
                  <div className="space-y-1">
                    <h5 className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-zinc-800'}`}>{step.title}</h5>
                    <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{step.desc}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* TRINITY CHARACTERS */}
        <div className="space-y-6">
          <h4 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>THE TRINITY PERSONAS</h4>
          <div className="grid gap-6">
            {personas.map((persona, i) => (
              <div key={i} className={`p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border transition-all relative group ${activePersona === (i + 10) ? (isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-300 ring-4 ring-zinc-100') : (isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-200 shadow-sm')}`}>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-100 shadow-inner'}`}>
                      <i className={`fas ${persona.icon} ${persona.color} text-lg sm:text-xl`}></i>
                    </div>
                    <h4 className={`font-cinzel font-black text-sm uppercase tracking-widest ${isDark ? 'text-white' : 'text-zinc-800'}`}>{persona.title}</h4>
                  </div>
                  
                  <button 
                    onClick={() => toggleListen(i, true)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${activePersona === (i + 10) && isPlaying ? 'bg-red-600 text-white shadow-lg' : (isDark ? 'bg-zinc-900 text-zinc-400 hover:text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 shadow-sm')}`}
                  >
                    {isAudioLoading && activePersona === (i + 10) ? (
                      <i className="fas fa-spinner fa-spin text-sm"></i>
                    ) : (
                      <i className={`fas ${activePersona === (i + 10) && isPlaying && !isPaused ? 'fa-pause' : 'fa-play'} text-sm`}></i>
                    )}
                  </button>
                </div>

                <p className={`text-sm font-light leading-relaxed mb-4 sm:mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{persona.desc}</p>
                
                {activePersona === (i + 10) && (
                   <div className="mt-2 animate-in fade-in duration-500">
                      <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                         <div className="h-full bg-red-600 transition-all duration-300 shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ width: `${progress}%` }}></div>
                      </div>
                   </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="pt-8 text-center opacity-30 pb-10">
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">Justice Awareness Manual v1.0</p>
      </div>
    </div>
  );
};

export default About;
