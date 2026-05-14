
import React from 'react';
import { AppScreen, Language, UI_STRINGS, Theme } from '../types';

interface TrinityIntroProps {
  language: Language;
  onNavigate: (screen: AppScreen) => void;
  theme: Theme;
}

const TrinityIntro: React.FC<TrinityIntroProps> = ({ language, onNavigate, theme }) => {
  const strings = UI_STRINGS[language] || UI_STRINGS.English;
  const isDark = theme === 'dark';

  const personas = [
    { 
      title: strings.ambiTitle, 
      desc: strings.ambiDesc, 
      color: 'text-blue-500', 
      icon: 'fa-heart', 
      border: isDark ? 'border-blue-900/40' : 'border-blue-100',
      bg: isDark ? 'bg-blue-950/20' : 'bg-blue-50/50'
    },
    { 
      title: strings.anniyanTitle, 
      desc: strings.anniyanDesc, 
      color: 'text-red-500', 
      icon: 'fa-gavel', 
      border: isDark ? 'border-red-900/40' : 'border-red-100',
      bg: isDark ? 'bg-red-950/20' : 'bg-red-50/50'
    },
    { 
      title: strings.remoTitle, 
      desc: strings.remoDesc, 
      color: 'text-purple-500', 
      icon: 'fa-wand-magic-sparkles', 
      border: isDark ? 'border-purple-900/40' : 'border-purple-100',
      bg: isDark ? 'bg-purple-950/20' : 'bg-purple-50/50'
    }
  ];

  return (
    <div className={`flex flex-col h-full relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-zinc-50'}`}>
      {/* Background Ambience */}
      <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-[radial-gradient(circle_at_50%_20%,rgba(220,38,38,0.1)_0%,transparent_60%)]' : 'bg-[radial-gradient(circle_at_50%_20%,rgba(220,38,38,0.03)_0%,transparent_60%)]'}`}></div>
      <div className="absolute inset-x-0 h-px bg-red-600/30 blur-sm animate-scan z-10 pointer-events-none"></div>

      <header className="pt-16 pb-8 px-8 text-center relative z-20">
        <h1 className={`text-4xl font-cinzel font-black tracking-[-0.05em] transition-colors ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          {strings.introTitle}
        </h1>
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-black mt-2">
          {strings.introSub}
        </p>
        <div className="mt-8 mx-auto w-16 h-px bg-red-600/50"></div>
      </header>

      <main className="flex-grow overflow-y-auto px-6 space-y-6 pb-40">
        <div className={`p-8 rounded-[3rem] border text-center transition-all ${isDark ? 'bg-zinc-900/30 border-zinc-800' : 'bg-white border-zinc-200 shadow-xl'}`}>
           <p className={`text-[11px] leading-relaxed uppercase tracking-widest font-black ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
             {strings.reformOptDesc}
           </p>
        </div>

        <div className="grid gap-4">
          {personas.map((p, i) => (
            <div 
              key={i} 
              className={`p-6 rounded-[2.5rem] border flex items-start gap-5 transition-all animate-in slide-in-from-bottom-10 duration-700 ${p.bg} ${p.border}`}
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'}`}>
                <i className={`fas ${p.icon} ${p.color} text-xl`}></i>
              </div>
              <div className="space-y-1">
                <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] ${p.color}`}>
                  {p.title}
                </h4>
                <p className={`text-[10px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="absolute bottom-0 inset-x-0 p-8 z-30 pointer-events-none">
        <button 
          onClick={() => onNavigate(AppScreen.HOME)}
          className={`w-full font-black py-7 rounded-[2rem] shadow-2xl transition-all transform active:scale-[0.97] flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-xs pointer-events-auto border group relative overflow-hidden ${isDark ? 'bg-red-700 hover:bg-red-600 text-white border-red-500' : 'bg-red-600 hover:bg-red-700 text-white border-red-500'}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
          {strings.proceedToJustice}
          <i className="fas fa-chevron-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
        </button>
      </footer>
    </div>
  );
};

export default TrinityIntro;
