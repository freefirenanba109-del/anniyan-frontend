
import React, { useState } from 'react';
import { AppScreen, Language, UI_STRINGS, SuggestionAnalysis, Theme } from '../types';
import { processSuggestion } from '../geminiService';

interface SuggestionProps {
  onNavigate: (screen: AppScreen) => void;
  onComplete: (result: SuggestionAnalysis) => void;
  setIsLoading: (val: boolean) => void;
  isLoading: boolean;
  language: Language;
  theme: Theme;
}

const Suggestion: React.FC<SuggestionProps> = ({ 
  onNavigate, 
  onComplete, 
  setIsLoading, 
  isLoading,
  language,
  theme
}) => {
  const strings = UI_STRINGS[language] || UI_STRINGS.English;
  const [text, setText] = useState('');
  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const result = await processSuggestion(text, language);
      setIsLoading(false); // Reset loading state on success
      onComplete(result);
    } catch (error) { 
      console.error(error); 
      setIsLoading(false); // Reset loading state on error
    }
  };

  if (isLoading) {
    return (
      <div className={`p-8 flex flex-col items-center justify-center min-h-full text-center ${isDark ? 'bg-black' : 'bg-zinc-50'}`}>
        <i className="fas fa-brain text-7xl text-purple-600 mb-8 animate-pulse"></i>
        <h2 className="text-3xl font-cinzel text-purple-600 tracking-widest uppercase">REMO IS DESIGNING...</h2>
      </div>
    );
  }

  return (
    <div className={`p-6 h-full flex flex-col transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => onNavigate(AppScreen.HOME)} className={`w-10 h-10 flex items-center justify-center rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'}`}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <h2 className={`text-2xl font-cinzel font-bold tracking-widest ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{strings.suggestTitle}</h2>
      </header>
      <form onSubmit={handleSubmit} className="space-y-6">
        <textarea 
          rows={6}
          className={`w-full border rounded-2xl p-5 outline-none transition-all resize-none text-sm font-light ${isDark ? 'bg-zinc-900 border-zinc-800 text-white focus:border-purple-600' : 'bg-white border-zinc-200 text-zinc-900 focus:border-purple-500 shadow-sm'}`}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Suggest a reform..."
        />
        <button type="submit" className="w-full bg-purple-700 text-white font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest text-sm">
          {strings.submitSuggestion}
        </button>
      </form>
    </div>
  );
};

export default Suggestion;
