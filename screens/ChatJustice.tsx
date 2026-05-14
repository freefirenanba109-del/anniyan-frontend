
import React, { useState, useRef, useEffect } from 'react';
import { AppScreen, Language, UI_STRINGS, Theme } from '../types';
import { complexChat } from '../geminiService';

interface ChatJusticeProps {
  language: Language;
  onNavigate: (screen: AppScreen) => void;
  theme: Theme;
}

const ChatJustice: React.FC<ChatJusticeProps> = ({ language, onNavigate, theme }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string, grounding?: any[] }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';
  const strings = UI_STRINGS[language] || UI_STRINGS.English;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);
    try {
      const response = await complexChat(userMsg, { search: useSearch, maps: useMaps }, language);
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Error", grounding: response.grounding }]);
    } catch (err) { setMessages(prev => [...prev, { role: 'ai', text: "Error" }]); } finally { setIsLoading(false); }
  };

  return (
    <div className={`flex flex-col h-full transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      <header className={`p-6 border-b transition-colors ${isDark ? 'border-zinc-900 bg-black/50' : 'border-zinc-200 bg-white/50'} backdrop-blur-md`}>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate(AppScreen.HUB)} className={`w-10 h-10 flex items-center justify-center rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600 shadow-sm'}`}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <h2 className="text-lg font-cinzel font-black uppercase">{strings.chatTitle}</h2>
        </div>
      </header>
      <div className="flex-grow overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-3xl border shadow-sm ${m.role === 'user' ? (isDark ? 'bg-red-950/20 border-red-900/30 text-red-100' : 'bg-red-50 border-red-100 text-red-700') : (isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-800')}`}>
              <p className="text-sm font-light leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className={`p-6 border-t ${isDark ? 'bg-black border-zinc-900' : 'bg-white border-zinc-200'}`}>
        <div className="relative">
          <input 
            className={`w-full rounded-full py-5 pl-6 pr-16 outline-none transition-all text-sm font-light border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white focus:border-red-600' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-red-500'}`}
            value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..."
          />
          <button type="submit" className="absolute right-2 top-2 bottom-2 w-12 bg-red-700 text-white rounded-full flex items-center justify-center"><i className="fas fa-gavel"></i></button>
        </div>
      </form>
    </div>
  );
};

export default ChatJustice;
