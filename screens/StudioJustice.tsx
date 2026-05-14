
import React, { useState, useEffect } from 'react';
import { AppScreen, Language, UI_STRINGS, Theme } from '../types';
import { generateProImage, generateVideo, editImage } from '../geminiService';

const StudioJustice: React.FC<{ language: Language, onNavigate: (s: AppScreen) => void, theme: Theme }> = ({ language, onNavigate, theme }) => {
  const [activeMode, setActiveMode] = useState<'IMAGE' | 'VIDEO' | 'EDIT'>('IMAGE');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const isDark = theme === 'dark';
  const strings = UI_STRINGS[language] || UI_STRINGS.English;

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);
    setVideoUrl(null);
    try {
      if (activeMode === 'IMAGE') {
        const data = await generateProImage(prompt, '1:1', '1K');
        if (data) setResult(`data:image/png;base64,${data}`);
      } else if (activeMode === 'VIDEO') {
        const url = await generateVideo(prompt, '16:9');
        setVideoUrl(url);
      }
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  return (
    <div className={`flex flex-col h-full transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      <header className={`p-6 border-b transition-colors ${isDark ? 'border-zinc-900' : 'border-zinc-200'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate(AppScreen.HUB)} className={`w-10 h-10 flex items-center justify-center rounded-2xl border transition-all ${isDark ? 'text-zinc-400 bg-zinc-900 border-zinc-800' : 'text-zinc-600 bg-white border-zinc-200 shadow-sm'}`}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <h2 className="text-lg font-cinzel font-black uppercase tracking-widest">{strings.studioTitle}</h2>
        </div>
      </header>
      <div className="flex-grow overflow-y-auto p-6 space-y-6 pb-32">
        <div className={`p-6 rounded-[2.5rem] border space-y-6 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
          <textarea 
            className={`w-full border rounded-2xl p-4 outline-none resize-none text-sm font-light ${isDark ? 'bg-black border-zinc-800 text-white focus:border-purple-600' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-purple-500'}`}
            rows={4} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Vision prompt..."
          />
          <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full bg-purple-700 text-white font-black py-4 rounded-3xl shadow-xl active:scale-95 uppercase text-xs">
            {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-wand-magic-sparkles mr-2"></i>}
            {strings.generateButton}
          </button>
        </div>
        {(result || videoUrl) && (
          <div className={`border rounded-[2.5rem] overflow-hidden shadow-2xl ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            {result && <img src={result} className="w-full" alt="Studio" />}
            {videoUrl && <video src={videoUrl} controls autoPlay loop className="w-full" />}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioJustice;
