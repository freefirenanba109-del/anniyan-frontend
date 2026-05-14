
import React from 'react';
import { AppScreen, Language, UI_STRINGS, Theme } from '../types';

interface JusticeHubProps {
  language: Language;
  onNavigate: (screen: AppScreen) => void;
  theme: Theme;
}

const JusticeHub: React.FC<JusticeHubProps> = ({ language, onNavigate, theme }) => {
  const strings = UI_STRINGS[language] || UI_STRINGS.English;
  const isDark = theme === 'dark';

  const tools = [
    { id: AppScreen.ABOUT, title: strings.originsTitle, sub: strings.originsSub, icon: 'fa-book-skull', color: 'text-red-500', bg: isDark ? 'bg-red-900/10' : 'bg-red-50' },
    { id: AppScreen.CHAT, title: strings.chatTitle, sub: strings.chatSub, icon: 'fa-comments', color: isDark ? 'text-blue-400' : 'text-blue-600', bg: isDark ? 'bg-blue-900/10' : 'bg-blue-50' },
    { id: AppScreen.STUDIO, title: strings.studioTitle, sub: strings.studioSub, icon: 'fa-palette', color: isDark ? 'text-purple-400' : 'text-purple-600', bg: isDark ? 'bg-purple-900/10' : 'bg-purple-50' },
    { id: AppScreen.LIVE, title: strings.liveTitle, sub: strings.liveSub, icon: 'fa-microphone', color: isDark ? 'text-red-400' : 'text-red-600', bg: isDark ? 'bg-red-900/10' : 'bg-red-50' }
  ];

  return (
    <div className={`flex flex-col h-full overflow-y-auto p-6 space-y-8 transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-zinc-50'}`}>
      <header className="pt-8">
        <h2 className={`text-3xl font-cinzel font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-zinc-900'}`}>{strings.hubTitle}</h2>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-2">{strings.hubSub}</p>
      </header>
      <div className="grid gap-6 pb-32">
        {tools.map((tool) => (
          <button key={tool.id} onClick={() => onNavigate(tool.id)} className={`w-full rounded-[2.5rem] p-8 text-left border transition-all active:scale-95 relative overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-600' : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${tool.bg} ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
              <i className={`fas ${tool.icon} ${tool.color} text-xl`}></i>
            </div>
            <h3 className={`text-xl font-cinzel font-black uppercase transition-colors ${isDark ? 'text-white' : 'text-zinc-800'}`}>{tool.title}</h3>
            <p className="text-zinc-500 text-xs font-light">{tool.sub}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default JusticeHub;
