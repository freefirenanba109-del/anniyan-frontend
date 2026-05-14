
import React, { useMemo } from 'react';
import { AppScreen, Language, UI_STRINGS, HistoryItem, Theme } from '../types';

interface DashboardProps {
  language: Language;
  onNavigate: (screen: AppScreen) => void;
  totalClaims: number;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  theme: Theme;
}

const Dashboard: React.FC<DashboardProps> = ({ language, onNavigate, totalClaims, history, onSelectHistory, theme }) => {
  const strings = UI_STRINGS[language] || UI_STRINGS.English;
  const isDark = theme === 'dark';

  // Calculate actual category breakdown based on lodged complaints
  const catCounts = history.reduce((acc, item) => {
     let cat = item.analysis.mistakeType.replace('CRIMINAL ACT: ', '').replace('CRITICAL SIN: ', '').trim();
     if (!cat) cat = 'OTHER';
     acc[cat] = (acc[cat] || 0) + 1;
     return acc;
  }, {} as Record<string, number>);

  const categoryStats = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
       name,
       percentage: history.length > 0 ? Math.round((count / history.length) * 100) : 0,
       count
    }));

  const highSeverityCount = history.filter(h => h.analysis.severity === 'High').length;
  const decayValue = history.length > 0 ? Math.round((highSeverityCount / history.length) * 100) : 0;

  // High-fidelity stats
  const stats = [
    { label: 'YOUR DECAY', value: `${decayValue}%`, color: 'text-red-600' },
    { label: 'TOTAL LODGED', value: history.length, color: 'text-orange-500' },
    { label: 'REFORMS ISSUED', value: history.length, color: 'text-blue-500' }
  ];

  // Generate a smooth wave path for the SVG chart
  const wavePath = useMemo(() => {
    const width = 400;
    const height = 100;
    const points = 10;
    const step = width / points;
    
    // Create random but somewhat consistent points for a "heartbeat/wave" look
    const values = history.length > 5 
      ? history.slice(0, points).map((h, i) => 20 + (h.analysis.severity === 'High' ? 60 : 30) + Math.random() * 20)
      : [40, 60, 45, 80, 50, 70, 40, 65, 45, 60];

    let d = `M 0 ${height - values[0]}`;
    for (let i = 1; i < values.length; i++) {
      const x = i * step;
      const y = height - values[i];
      const prevX = (i - 1) * step;
      const prevY = height - values[i - 1];
      const cx = (prevX + x) / 2;
      d += ` C ${cx} ${prevY}, ${cx} ${y}, ${x} ${y}`;
    }
    return d;
  }, [history]);

  return (
    <div className={`flex flex-col h-full transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      {/* Header Section */}
      <header className={`px-8 pt-12 pb-8 border-b shrink-0 flex justify-between items-end sticky top-0 z-40 transition-colors backdrop-blur-xl ${isDark ? 'border-zinc-900 bg-black/80' : 'border-zinc-200 bg-white/80'}`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]"></div>
            <h2 className="text-2xl font-cinzel font-black uppercase tracking-tighter">{strings.dashboard}</h2>
          </div>
          <p className={`text-[8px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{strings.dashboardSubtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-cinzel font-black text-red-600 leading-none">{totalClaims.toLocaleString()}</p>
          <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{strings.totalClaims}</p>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto p-6 space-y-10 pb-40">
        
        {/* Karma Resonance Wave Chart */}
        <section className={`p-6 rounded-[3rem] border shadow-2xl transition-all relative overflow-hidden ${isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-200'}`}>
           <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                 <i className="fas fa-satellite-dish text-red-600 text-xs"></i>
                 <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">ALL-INDIA RADAR</h4>
              </div>
              <span className="text-[8px] font-black text-green-500 animate-pulse">LIVE TRACKING</span>
           </div>
           
           <div className="relative h-24 w-full">
              <svg viewBox="0 0 400 100" className="w-full h-full preserve-3d">
                <defs>
                  <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#991b1b" />
                    <stop offset="50%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#991b1b" />
                  </linearGradient>
                </defs>
                <path 
                  d={wavePath} 
                  fill="none" 
                  stroke="url(#waveGradient)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  className="animate-[wavePulse_4s_infinite_linear]"
                />
                <path 
                  d={wavePath} 
                  fill="none" 
                  stroke="#dc2626" 
                  strokeWidth="1" 
                  strokeOpacity="0.3"
                  className="translate-y-1"
                />
              </svg>
           </div>
           
           <div className="flex justify-between mt-4 text-[7px] font-black text-zinc-600 uppercase tracking-widest">
              <span>24h Scan</span>
              <span>Scanning 1.4 Billion Souls</span>
              <span>Now</span>
           </div>
        </section>

        {/* KPI Grid */}
        <div className="grid grid-cols-3 gap-4">
           {stats.map((s, i) => (
             <div key={i} className={`p-5 rounded-3xl border flex flex-col items-center text-center space-y-2 transition-all ${isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-100 shadow-sm'}`}>
                <span className={`text-xl font-cinzel font-black ${s.color}`}>{s.value}</span>
                <span className="text-[7px] font-black text-zinc-500 uppercase leading-tight tracking-widest">{s.label}</span>
             </div>
           ))}
        </div>

        {/* Categories Analysis */}
        <section className={`p-8 rounded-[3rem] border shadow-2xl transition-all group ${isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-200'}`}>
           <div className="flex items-center gap-3 mb-8">
              <i className="fas fa-chart-pie text-orange-600 text-sm"></i>
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">YOUR COMPLAINT BREAKDOWN</h4>
           </div>

           <div className="space-y-6">
              {categoryStats.length > 0 ? categoryStats.map((stat, i) => (
                <div key={i} className="space-y-2">
                   <div className="flex justify-between items-end">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{stat.name} ({stat.count})</span>
                      <div className="flex items-center gap-2">
                         <span className={`text-[10px] font-cinzel font-black ${stat.percentage > 30 ? 'text-red-600' : 'text-zinc-500'}`}>{stat.percentage}%</span>
                         <i className={`fas ${stat.percentage > 20 ? 'fa-arrow-up text-red-600' : 'fa-arrow-right text-zinc-700'} text-[8px]`}></i>
                      </div>
                   </div>
                   <div className={`h-2 rounded-full overflow-hidden p-[1.5px] ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${stat.percentage > 30 ? 'bg-gradient-to-r from-red-900 to-red-600' : 'bg-gradient-to-r from-zinc-700 to-zinc-500'}`} 
                        style={{ width: `${stat.percentage}%`, transitionDelay: `${i * 100}ms` }}
                      ></div>
                   </div>
                </div>
              )) : (
                 <p className="text-[10px] uppercase text-zinc-500 font-bold text-center">Lodge a complaint to see statistics</p>
              )}
           </div>
        </section>

        {/* History Ledger */}
        <section className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">YOUR RECENT COMPLAINTS</h4>
              <span className={`text-[8px] font-bold px-3 py-1 rounded-full border ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-600' : 'bg-white border-zinc-200 text-zinc-400 shadow-sm'}`}>
                {history.length} REPORTED
              </span>
           </div>

           <div className="space-y-4">
              {history.length > 0 ? history.map((item, i) => (
                <button 
                  key={item.id} 
                  onClick={() => onSelectHistory(item)} 
                  className={`w-full p-6 rounded-[2.5rem] border flex items-center justify-between transition-all transform active:scale-[0.98] group relative overflow-hidden ${isDark ? 'bg-zinc-950 border-zinc-900 hover:border-red-900/40' : 'bg-white border-zinc-200 shadow-sm hover:border-red-300'}`}
                >
                   <div className="flex items-center gap-5 truncate">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${isDark ? 'bg-zinc-900 border-zinc-800 group-hover:bg-red-950/20' : 'bg-zinc-50 border-zinc-100 group-hover:bg-red-50'}`}>
                         <i className={`fas ${item.analysis.severity === 'High' ? 'fa-skull text-red-600' : 'fa-balance-scale text-zinc-400'} text-sm`}></i>
                      </div>
                      <div className="truncate text-left">
                         <h4 className={`text-sm font-cinzel font-black uppercase truncate tracking-tight transition-colors ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{item.analysis.mistakeType}</h4>
                         <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${isDark ? 'bg-zinc-900 text-zinc-500' : 'bg-zinc-100 text-zinc-400'}`}>{item.analysis.severity} SIN</span>
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">• {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex flex-col items-end shrink-0">
                      <i className="fas fa-chevron-right text-[12px] text-zinc-700 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"></i>
                   </div>
                </button>
              )) : (
                <div className={`py-24 flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed transition-colors ${isDark ? 'bg-zinc-950/20 border-zinc-900' : 'bg-zinc-50/50 border-zinc-200'}`}>
                   <i className={`fas fa-ghost text-4xl mb-4 opacity-10 ${isDark ? 'text-white' : 'text-zinc-900'}`}></i>
                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">{strings.noJudgements}</p>
                </div>
              )}
           </div>
        </section>
      </main>

      <style>{`
        @keyframes wavePulse {
          0% { stroke-dasharray: 0, 1000; stroke-dashoffset: 0; }
          100% { stroke-dasharray: 1000, 0; stroke-dashoffset: -1000; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
