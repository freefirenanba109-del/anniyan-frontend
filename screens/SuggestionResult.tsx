
import React from 'react';
import { AppScreen, SuggestionAnalysis, Language, UI_STRINGS, Theme } from '../types';

interface SuggestionResultProps {
  analysis: SuggestionAnalysis;
  onNavigate: (screen: AppScreen) => void;
  language: Language;
  theme: Theme;
}

const SuggestionResult: React.FC<SuggestionResultProps> = ({ analysis, onNavigate, language, theme }) => {
  const strings = UI_STRINGS[language] || UI_STRINGS.English;
  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col h-full transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      <header className={`p-6 border-b transition-colors ${isDark ? 'border-zinc-900' : 'border-zinc-200 bg-white'}`}>
        <h2 className="text-2xl font-cinzel font-black text-purple-500 uppercase">{analysis.title}</h2>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded border mt-2 inline-block ${isDark ? 'bg-purple-900/30 text-purple-400 border-purple-800' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
          Impact: {analysis.impactScore}%
        </span>
      </header>
      <div className="flex-grow overflow-y-auto p-6 space-y-10 pb-32">
        <div className={`p-8 rounded-3xl border text-center ${isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-200 shadow-sm'}`}>
           <p className="text-2xl font-cinzel italic">"{analysis.campaignSlogan}"</p>
        </div>
        <div className="space-y-4">
          {analysis.roadmap.map((step, i) => (
            <div key={i} className={`p-5 rounded-3xl border flex gap-4 items-center transition-all ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
              <span className="text-purple-600 font-black text-xl">0{i+1}</span>
              <p className={`text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{step}</p>
            </div>
          ))}
        </div>
        <button onClick={() => onNavigate(AppScreen.HOME)} className={`w-full font-black py-4 rounded-2xl border uppercase text-[10px] tracking-widest ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : 'bg-white border-zinc-200 text-zinc-600 shadow-sm'}`}>
          {strings.backHome}
        </button>
      </div>
    </div>
  );
};

export default SuggestionResult;
