
import React, { useState, useRef, useEffect } from 'react';
import { AppScreen, Language, UI_STRINGS, Theme } from '../types';
import { generateTTS, decodeAudio, decodeAudioBuffer } from '../geminiService';

interface DisclaimerProps {
  language: Language;
  onNavigate: (screen: AppScreen) => void;
  theme: Theme;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ language, onNavigate, theme }) => {
  const strings = UI_STRINGS[language] || UI_STRINGS.English;
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isDark = theme === 'dark';

  const handleListen = async () => {
    if (isAudioLoading) return;
    setIsAudioLoading(true);
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const fullText = `${strings.disclaimerTitle}. ${strings.disclaimerBody}`;
      const audioBase64 = await generateTTS(fullText, language, 'Zephyr');
      if (audioBase64) {
        const bytes = decodeAudio(audioBase64);
        const buffer = await decodeAudioBuffer(bytes, audioCtxRef.current);
        if (sourceRef.current) sourceRef.current.stop();
        const source = audioCtxRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtxRef.current.destination);
        source.start();
        sourceRef.current = source;
      }
    } catch (err) { console.error(err); } finally { setIsAudioLoading(false); }
  };

  const handleAccept = () => {
    setIsScanning(true);
    setTimeout(() => {
      onNavigate(AppScreen.HOME);
    }, 1500);
  };

  return (
    <div className={`p-6 h-full flex flex-col transition-colors duration-500 overflow-hidden ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      <header className="flex items-center gap-4 shrink-0">
        <button onClick={() => onNavigate(AppScreen.HOME)} className={`w-10 h-10 flex items-center justify-center rounded-2xl border transition-all ${isDark ? 'text-zinc-400 bg-zinc-900 border-zinc-800' : 'text-zinc-600 bg-white border-zinc-200'}`}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <h2 className="text-xl font-cinzel font-black uppercase tracking-widest">{strings.disclaimer}</h2>
      </header>

      <main className={`mt-8 p-8 rounded-[3rem] border flex-grow overflow-y-auto space-y-8 relative group transition-all ${isDark ? 'bg-zinc-950 border-red-900/30' : 'bg-white border-red-100 shadow-xl'}`}>
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <i className={`fas fa-balance-scale text-6xl ${isDark ? 'text-red-900/40' : 'text-red-600/20'}`}></i>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-eye text-red-600 animate-pulse"></i>
            </div>
          </div>
          
          <button 
            onClick={handleListen} 
            className={`px-8 py-3 rounded-full border text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center gap-3 ${isDark ? 'bg-red-900/10 text-red-500 border-red-900/30' : 'bg-red-50 text-red-600 border-red-200 shadow-sm'}`}
          >
            {isAudioLoading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-ear-listen"></i>}
            {strings.listenDisclaimer}
          </button>
        </div>

        <div className="space-y-4">
          <h3 className={`text-sm font-cinzel font-black uppercase tracking-widest text-center ${isDark ? 'text-red-600' : 'text-red-700'}`}>
            {strings.disclaimerTitle}
          </h3>
          <p className={`text-xs leading-relaxed text-justify font-light tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {strings.disclaimerBody}
          </p>
        </div>

        {/* Scroll indicator for longer text */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-20 animate-bounce pointer-events-none">
          <i className="fas fa-chevron-down text-[10px]"></i>
        </div>
      </main>

      <footer className="mt-8 shrink-0">
        <button 
          onClick={handleAccept} 
          disabled={isScanning}
          className={`w-full font-black py-6 rounded-[2.5rem] shadow-2xl active:scale-95 uppercase tracking-[0.4em] text-xs relative overflow-hidden transition-all duration-700 ${isScanning ? 'bg-green-700 scale-95' : (isDark ? 'bg-red-700 text-white' : 'bg-red-600 text-white')}`}
        >
          <span className="relative z-10">
            {isScanning ? 'IDENTITY_VERIFIED' : strings.understand}
          </span>
          {isScanning && (
            <div className="absolute inset-0 bg-green-500/20 animate-pulse"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
        </button>
      </footer>
    </div>
  );
};

export default Disclaimer;
