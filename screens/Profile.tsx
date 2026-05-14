import React from 'react';
import { AppScreen, Theme, Language, HistoryItem } from '../types';

interface ProfileProps {
  theme: Theme;
  language: Language;
  onNavigate: (screen: AppScreen) => void;
  user: any;
  onLogout: () => void;
  history: HistoryItem[];
}

const Profile: React.FC<ProfileProps> = ({ theme, onNavigate, user, onLogout, history }) => {
  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col h-full w-full relative transition-colors duration-500 overflow-y-auto ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      <header className={`sticky top-0 z-50 p-4 shrink-0 flex items-center justify-between border-b backdrop-blur-xl ${isDark ? 'bg-black/80 border-zinc-900' : 'bg-white/80 border-zinc-200'}`}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate(AppScreen.HOME)} className={`w-10 h-10 flex items-center justify-center rounded-2xl border transition-all active:scale-90 ${isDark ? 'text-zinc-400 bg-zinc-900 border-zinc-800' : 'text-zinc-600 bg-white border-zinc-200'}`}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <h2 className="text-sm font-cinzel font-black uppercase tracking-widest">Citizen Profile</h2>
        </div>
      </header>

      <main className="p-6 space-y-8 flex-grow">
        <div className="text-center relative">
          <div className="w-32 h-32 mx-auto rounded-full border-4 border-red-600 flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(220,38,38,0.3)] bg-zinc-900">
            <i className="fas fa-user-secret text-6xl text-zinc-700"></i>
          </div>
          <div className="mt-6">
            <h1 className="text-2xl font-black uppercase tracking-widest">{user?.name || 'Unknown Citizen'}</h1>
            <p className={`text-sm mt-1 font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>ID: {user?.contact || 'N/A'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-3xl border flex flex-col items-center justify-center text-center ${isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-200 shadow-sm'}`}>
            <span className="text-3xl font-cinzel font-black text-red-600 mb-2">{history.length}</span>
            <span className="text-[0.6rem] font-black uppercase tracking-widest text-zinc-500">Sins Reported</span>
          </div>
          <div className={`p-4 rounded-3xl border flex flex-col items-center justify-center text-center ${isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-200 shadow-sm'}`}>
            <span className="text-3xl font-cinzel font-black text-purple-600 mb-2">0</span>
            <span className="text-[0.6rem] font-black uppercase tracking-widest text-zinc-500">Reforms Sent</span>
          </div>
        </div>

        <div className={`p-6 rounded-3xl border space-y-4 ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
          <div className="flex justify-between items-center border-b border-zinc-700/50 pb-4">
            <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Account Status</span>
            <span className="text-xs font-black uppercase tracking-widest text-green-500"><i className="fas fa-shield-check mr-1"></i> Verified</span>
          </div>
          <div className="flex justify-between items-center border-b border-zinc-700/50 pb-4">
            <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Join Date</span>
            <span className="text-xs font-mono">{new Date(user?.joinedAt || Date.now()).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Trust Level</span>
            <span className="text-xs font-black text-blue-500 uppercase tracking-widest">Informant</span>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className={`w-full py-5 rounded-2xl border text-xs font-black uppercase tracking-[0.2em] transition-colors ${isDark ? 'border-red-900/50 text-red-500 hover:bg-red-950/30' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
        >
          <i className="fas fa-sign-out-alt mr-2"></i> Disconnect
        </button>
      </main>
    </div>
  );
};

export default Profile;
