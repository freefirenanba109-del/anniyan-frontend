
import React, { useState, useRef, useEffect } from 'react';
import { AppScreen, ComplaintData, JusticeAnalysis, Language, SuggestionAnalysis, UI_STRINGS, HistoryItem, Theme, FontSize } from './types';
import Home from './screens/Home';
import SubmitComplaint from './screens/SubmitComplaint';
import AnalysisView from './screens/AnalysisView';
import About from './screens/About';
import Disclaimer from './screens/Disclaimer';
import Suggestion from './screens/Suggestion';
import SuggestionResult from './screens/SuggestionResult';
import Dashboard from './screens/Dashboard';
import JusticeHub from './screens/JusticeHub';
import ChatJustice from './screens/ChatJustice';
import StudioJustice from './screens/StudioJustice';
import LiveJustice from './screens/LiveJustice';
import TrinityIntro from './screens/TrinityIntro';
import Login from './screens/Login';
import Profile from './screens/Profile';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.HOME);
  const [language, setLanguage] = useState<Language>('English');
  const [theme, setTheme] = useState<Theme>('dark');
  const [fontSize, setFontSize] = useState<FontSize>('small'); 
  const [analysisResult, setAnalysisResult] = useState<JusticeAnalysis | null>(null);
  const [suggestionResult, setSuggestionResult] = useState<SuggestionAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalClaims, setTotalClaims] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [hasKey, setHasKey] = useState<boolean>(true); // Assume true initially to avoid flicker
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      const storedKey = localStorage.getItem('gemini_api_key');
      const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
      const hasRealKey = storedKey || (envKey && envKey !== 'PLACEHOLDER_API_KEY');

      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected || !!hasRealKey);
      } else {
        setHasKey(!!hasRealKey);
      }
    };
    checkKey();
  }, []);

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // ─── ANNIYAN VOICE SETTINGS ─────────────────────────────────────────────
    utterance.pitch = 0.1;  // Ultra Deep
    utterance.rate = 0.85;  // Slightly Slow & Powerful
    utterance.volume = 1.0;
    
    // Try to find a deep male voice
    const voices = window.speechSynthesis.getVoices();
    const deepVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Male')) || voices[0];
    if (deepVoice) utterance.voice = deepVoice;

    // Add visual feedback (Shake Effect)
    document.body.style.animation = 'shake 0.5s infinite';
    utterance.onend = () => {
      document.body.style.animation = '';
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleOpenKeySelector = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setHasKey(true); // Proceed assuming success per race condition guidelines
    } else {
      const key = prompt("Enter your Google Gemini API Key:\n(Get one for free at aistudio.google.com)");
      if (key && key.trim().length > 10) {
        localStorage.setItem('gemini_api_key', key.trim());
        setHasKey(true);
        window.location.reload();
      }
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    switch(fontSize) {
      case 'small': root.style.fontSize = '11px'; break;
      case 'large': root.style.fontSize = '22px'; break;
      case 'medium':
      default: root.style.fontSize = '16px';
    }
  }, [fontSize]);

  useEffect(() => {
    // Fresh start: Clear old data to start from 0
    localStorage.removeItem('anniyan_total_claims');
    localStorage.removeItem('anniyan_history');

    const initial = 0;
    setTotalClaims(initial);
    localStorage.setItem('anniyan_total_claims', initial.toString());

    setHistory([]);

    const savedTheme = localStorage.getItem('anniyan_theme') as Theme;
    if (savedTheme) setTheme(savedTheme);

    const savedSize = localStorage.getItem('anniyan_fontsize') as FontSize;
    if (savedSize) setFontSize(savedSize);

    const savedUser = localStorage.getItem('anniyan_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      setCurrentScreen(AppScreen.LOGIN);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('anniyan_theme', nextTheme);
  };

  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem('anniyan_fontsize', size);
  };

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const navigateTo = (screen: AppScreen) => {
    initAudio();
    setIsLoading(false);
    if (!currentUser && screen !== AppScreen.LOGIN) {
      setCurrentScreen(AppScreen.LOGIN);
      return;
    }
    if (screen === AppScreen.HOME || screen === AppScreen.SUBMIT || screen === AppScreen.SUGGESTION) {
        setAnalysisResult(null);
        setSuggestionResult(null);
    }
    setCurrentScreen(screen);
  };

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setCurrentScreen(AppScreen.HOME);
  };

  const handleLogout = () => {
    localStorage.removeItem('anniyan_user');
    setCurrentUser(null);
    setCurrentScreen(AppScreen.LOGIN);
  };

  const handleAnalysisComplete = async (result: JusticeAnalysis) => {
    const nextCount = totalClaims + 1;
    setTotalClaims(nextCount);
    localStorage.setItem('anniyan_total_claims', nextCount.toString());

    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      analysis: result,
      language: language
    };
    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('anniyan_history', JSON.stringify(updatedHistory));

    // Persist to backend (non-blocking — fails silently)
    if (currentUser?.id) {
      const API_BASE = (import.meta as any).env?.VITE_API_URL || '';
      fetch(`${API_BASE}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, analysis: result, language })
      }).catch(err => console.warn('[Backend] Could not save complaint:', err));
    }

    setAnalysisResult(result);
    setCurrentScreen(AppScreen.ANALYSIS);
  };

  const handleViewHistoryItem = (item: HistoryItem) => {
    setAnalysisResult(item.analysis);
    setLanguage(item.language);
    setCurrentScreen(AppScreen.ANALYSIS);
  };

  const handleSuggestionComplete = (result: SuggestionAnalysis) => {
    setSuggestionResult(result);
    setCurrentScreen(AppScreen.SUGGESTION_RESULT);
  };

  const showNav = [AppScreen.HOME, AppScreen.HUB, AppScreen.DASHBOARD].includes(currentScreen);

  // Key Selection Overlay
  if (!hasKey) {
    return (
      <div className={`h-[100dvh] w-full flex flex-col items-center justify-center p-8 text-center bg-black text-white`}>
        <div className="max-w-xs space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-red-600/20 rounded-3xl flex items-center justify-center mx-auto border border-red-500/30">
            <i className="fas fa-key text-3xl text-red-500"></i>
          </div>
          <div className="space-y-4">
            <h1 className="text-2xl font-cinzel font-black uppercase tracking-widest">Identify Yourself</h1>
            <p className="text-xs text-zinc-500 font-light leading-relaxed">
              To perform real AI justice analysis on every unique complaint, you must provide a valid Gemini API Key. 
              <br/><br/>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-red-500 underline">Get a Free Key Here</a>
            </p>
          </div>
          <button 
            onClick={handleOpenKeySelector}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-2xl shadow-xl transition-all uppercase tracking-[0.2em] text-[11px]"
          >
            Connect API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-[100dvh] w-full flex flex-col transition-all duration-300 relative font-sans overflow-hidden select-none touch-none overscroll-none ${theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      <main className="flex-grow max-w-xl mx-auto w-full relative h-full flex flex-col overflow-hidden">
        {currentScreen === AppScreen.INTRO && (
          <TrinityIntro theme={theme} language={language} onNavigate={navigateTo} />
        )}
        {currentScreen === AppScreen.LOGIN && (
          <Login theme={theme} onLogin={handleLogin} />
        )}
        {currentScreen === AppScreen.HOME && (
          <Home 
            onNavigate={navigateTo} 
            language={language} 
            setLanguage={setLanguage} 
            totalClaims={totalClaims} 
            theme={theme} 
            onToggleTheme={toggleTheme}
            fontSize={fontSize}
            setFontSize={handleFontSizeChange}
          />
        )}
        {currentScreen === AppScreen.PROFILE && (
          <Profile theme={theme} language={language} onNavigate={navigateTo} user={currentUser} onLogout={handleLogout} history={history} />
        )}
        {currentScreen === AppScreen.SUBMIT && (
          <SubmitComplaint theme={theme} language={language} onNavigate={navigateTo} onComplete={handleAnalysisComplete} setIsLoading={setIsLoading} isLoading={isLoading} />
        )}
        {currentScreen === AppScreen.SUGGESTION && (
          <Suggestion theme={theme} language={language} onNavigate={navigateTo} onComplete={handleSuggestionComplete} setIsLoading={setIsLoading} isLoading={isLoading} />
        )}
        {currentScreen === AppScreen.SUGGESTION_RESULT && suggestionResult && (
          <SuggestionResult theme={theme} language={language} analysis={suggestionResult} onNavigate={navigateTo} />
        )}
        {currentScreen === AppScreen.ANALYSIS && analysisResult && (
          <AnalysisView theme={theme} language={language} analysis={analysisResult} onNavigate={navigateTo} audioCtx={audioCtxRef.current} />
        )}
        {currentScreen === AppScreen.ABOUT && <About theme={theme} language={language} onNavigate={navigateTo} />}
        {currentScreen === AppScreen.DISCLAIMER && <Disclaimer theme={theme} language={language} onNavigate={navigateTo} />}
        {currentScreen === AppScreen.DASHBOARD && <Dashboard theme={theme} language={language} onNavigate={navigateTo} totalClaims={totalClaims} history={history} onSelectHistory={handleViewHistoryItem} />}
        {currentScreen === AppScreen.HUB && <JusticeHub theme={theme} language={language} onNavigate={navigateTo} />}
        {currentScreen === AppScreen.CHAT && <ChatJustice theme={theme} language={language} onNavigate={navigateTo} />}
        {currentScreen === AppScreen.STUDIO && <StudioJustice theme={theme} language={language} onNavigate={navigateTo} />}
        {currentScreen === AppScreen.LIVE && <LiveJustice theme={theme} language={language} onNavigate={navigateTo} />}
      </main>

      {showNav && (
        <nav className={`sticky bottom-0 border-t px-4 py-3 flex justify-around items-center z-50 w-full max-w-xl mx-auto safe-area-bottom transition-all duration-500 ${theme === 'dark' ? 'bg-black/95 backdrop-blur-3xl border-zinc-900/50' : 'bg-white/95 backdrop-blur-3xl border-zinc-200 shadow-up'}`}>
          <button 
            onClick={() => navigateTo(AppScreen.HOME)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 w-1/4 ${currentScreen === AppScreen.HOME ? 'text-red-600 scale-105' : 'text-zinc-500'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${currentScreen === AppScreen.HOME ? (theme === 'dark' ? 'bg-red-950/20 shadow-red' : 'bg-red-50') : 'bg-transparent'}`}>
              <i className="fas fa-home text-lg"></i>
            </div>
            <span className="text-[0.6rem] font-black uppercase tracking-[0.2em]">Home</span>
          </button>
          <button 
            onClick={() => navigateTo(AppScreen.HUB)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 w-1/4 ${currentScreen === AppScreen.HUB ? 'text-blue-600 scale-105' : 'text-zinc-500'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${currentScreen === AppScreen.HUB ? (theme === 'dark' ? 'bg-blue-950/20 shadow-blue' : 'bg-blue-50') : 'bg-transparent'}`}>
              <i className="fas fa-layer-group text-lg"></i>
            </div>
            <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] whitespace-nowrap">Hub</span>
          </button>
          <button 
            onClick={() => navigateTo(AppScreen.DASHBOARD)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 w-1/4 ${currentScreen === AppScreen.DASHBOARD ? 'text-purple-600 scale-105' : 'text-zinc-500'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${currentScreen === AppScreen.DASHBOARD ? (theme === 'dark' ? 'bg-purple-950/20 shadow-purple' : 'bg-purple-50') : 'bg-transparent'}`}>
              <i className="fas fa-chart-line text-lg"></i>
            </div>
            <span className="text-[0.6rem] font-black uppercase tracking-[0.2em]">Dashboard</span>
          </button>
          <button 
            onClick={() => navigateTo(AppScreen.SUBMIT)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 w-1/4 ${currentScreen === AppScreen.SUBMIT ? 'text-red-700 scale-105' : 'text-zinc-500'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${currentScreen === AppScreen.SUBMIT ? (theme === 'dark' ? 'bg-red-950/20' : 'bg-red-50') : 'bg-transparent'}`}>
              <i className="fas fa-balance-scale text-lg"></i>
            </div>
            <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] whitespace-nowrap">Ambi</span>
          </button>
        </nav>
      )}

      <style>{`
        .shadow-up { box-shadow: 0 -4px 12px rgba(0,0,0,0.05); }
        .shadow-red { box-shadow: 0 0 20px rgba(220,38,38,0.2); }
        .shadow-blue { box-shadow: 0 0 20px rgba(59,130,246,0.2); }
        .shadow-purple { box-shadow: 0 0 20px rgba(168,85,247,0.2); }
      `}</style>
    </div>
  );
};

export default App;
