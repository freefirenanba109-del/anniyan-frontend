
import React, { useState, useEffect, useRef } from 'react';
import { AppScreen, Language, UI_STRINGS, Theme } from '../types';

const LiveJustice: React.FC<{ language: Language, onNavigate: (s: AppScreen) => void, theme: Theme }> = ({ language, onNavigate, theme }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const strings = UI_STRINGS[language] || UI_STRINGS.English;
  const isDark = theme === 'dark';

  const stopLive = () => { setIsActive(false); };
  const startLive = async () => { setIsActive(true); };

  return (
    <div className={`flex flex-col h-full transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      <header className={`p-6 border-b transition-colors ${isDark ? 'border-zinc-900' : 'border-zinc-200'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate(AppScreen.HUB)} className={`w-10 h-10 flex items-center justify-center rounded-2xl border transition-all ${isDark ? 'text-zinc-400 bg-zinc-900 border-zinc-800' : 'text-zinc-600 bg-white border-zinc-200 shadow-sm'}`}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <h2 className="text-lg font-cinzel font-black uppercase tracking-widest">{strings.liveTitle}</h2>
        </div>
      </header>
      <div className="flex-grow flex flex-col items-center justify-center p-8 space-y-12">
        <div className={`w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${isActive ? 'border-red-600 animate-pulse' : (isDark ? 'border-zinc-800' : 'border-zinc-200')}`}>
           {isActive ? (
             <div className="flex gap-1 items-center">
               {[...Array(8)].map((_, i) => (
                 <div key={i} className="w-1 bg-red-600 h-8 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
               ))}
             </div>
           ) : <i className="fas fa-microphone-slash text-5xl text-zinc-400"></i>}
        </div>
        <div className={`w-full h-40 p-6 rounded-3xl border overflow-y-auto transition-colors ${isDark ? 'bg-zinc-950 border-zinc-900 text-zinc-500' : 'bg-white border-zinc-200 text-zinc-400 shadow-inner'}`}>
          <p className="text-[10px] font-black uppercase mb-2">Interrogation Live Feed</p>
          {transcription.length === 0 && <p className="text-[10px] italic">Awaiting connection...</p>}
        </div>
        <button 
          onClick={isActive ? stopLive : startLive}
          className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all ${isActive ? 'bg-zinc-800 text-red-600' : 'bg-red-700 text-white'}`}
        >
          <i className={`fas ${isActive ? 'fa-stop' : 'fa-microphone'} text-2xl`}></i>
        </button>
      </div>
    </div>
  );
};

export default LiveJustice;
