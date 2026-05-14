
import React, { useState, useEffect, useRef } from 'react';
import { AppScreen, ComplaintData, JusticeAnalysis, Language, UI_STRINGS, Theme } from '../types';
// Fixed incorrect export name
import { analyzeInjusticeText } from '../geminiService';

interface SubmitComplaintProps {
  onNavigate: (screen: AppScreen) => void;
  onComplete: (result: JusticeAnalysis) => void;
  setIsLoading: (val: boolean) => void;
  isLoading: boolean;
  language: Language;
  theme: Theme;
}

const SubmitComplaint: React.FC<SubmitComplaintProps> = ({ 
  onNavigate, 
  onComplete, 
  setIsLoading, 
  isLoading,
  language,
  theme
}) => {
  const strings = UI_STRINGS[language] || UI_STRINGS.English;
  const categories = strings.categories;
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [formData, setFormData] = useState<ComplaintData>({
    name: '',
    category: categories[0],
    description: '',
    evidence: '',
    emotionLevel: 5,
    language: language
  });

  // Tense, Irritating, Dissonant Tribal Loading Audio with Simulated growls
  useEffect(() => {
    let intervalId: number;
    if (isLoading) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioCtx;

      const playTenseAudio = () => {
        const now = audioCtx.currentTime;
        
        // Menacing Low Thump (Double Heartbeat)
        const playHeartbeat = (time: number, freq: number) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.frequency.setValueAtTime(freq, time);
          osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.4);
          gain.gain.setValueAtTime(1.2, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(time);
          osc.stop(time + 0.4);
        };

        // Irritating Piercing Shriek (Random high frequencies)
        const playShriek = (time: number) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(3000 + Math.random() * 2000, time);
          osc.frequency.linearRampToValueAtTime(20, time + 0.15);
          gain.gain.setValueAtTime(0.06, time);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(time);
          osc.stop(time + 0.15);
        };

        // Low Growl Simulation (Gravelly texture)
        const playGrowl = (time: number) => {
          const osc = audioCtx.createOscillator();
          const lfo = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const lfoGain = audioCtx.createGain();
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(50, time);
          lfo.frequency.setValueAtTime(20, time);
          lfoGain.gain.setValueAtTime(20, time);
          
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          
          gain.gain.setValueAtTime(0.05, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.start(time);
          lfo.start(time);
          osc.stop(time + 1.2);
          lfo.stop(time + 1.2);
        };

        playHeartbeat(now, 45);
        playHeartbeat(now + 0.25, 40);
        
        if (Math.random() > 0.5) playShriek(now + 0.1);
        if (Math.random() > 0.7) playGrowl(now + 0.4);
      };

      playTenseAudio();
      intervalId = window.setInterval(playTenseAudio, 800);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) return;
    
    setIsLoading(true);
    try {
      // Fixed function call name
      const result = await analyzeInjusticeText({ ...formData, language });
      onComplete(result);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center p-10 text-center overflow-hidden">
        {/* Thematic Background */}
        <div className="absolute inset-0 bg-red-950/20 animate-pulse"></div>
        <div className="absolute inset-x-0 h-[3px] bg-red-600/40 blur-xl animate-scan"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.2)_0%,transparent_70%)]"></div>
        
        {/* Animated Anniyan Face & Bull Silhouette Component */}
        <div className="relative mb-24 z-10 w-full max-w-sm flex justify-center items-center h-80">
           {/* Bull Silhouette - Large & Menacing */}
           <div className="absolute inset-0 flex items-center justify-center opacity-10 animate-[zoomInOut_6s_infinite] pointer-events-none">
              <svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-red-900 blur-[2px]">
                 <path d="M2 10c0-2 4-5 10-5s10 3 10 5-4 5-10 5-10-3-10-5zm3-2s1-2 4-2 4 2 4 2-1 2-4 2-4-2-4-2z" fill="currentColor"/>
                 <path d="M6 14c0 3 2 5 6 5s6-2 6-5" strokeLinecap="round"/>
                 <circle cx="9" cy="10" r="1" fill="black"/>
                 <circle cx="15" cy="10" r="1" fill="black"/>
                 <path d="M10 12l2 2 2-2" strokeLinecap="round"/>
              </svg>
           </div>
           
           {/* Detailed Anniyan Face Silhouette */}
           <div className="relative z-10 w-56 h-72 animate-[violentShake_0.15s_infinite]">
              {/* Mask Outline */}
              <div className="absolute inset-0 border-2 border-red-900/50 rounded-[45%_45%_55%_55%] bg-zinc-950/80 shadow-[0_0_80px_rgba(153,27,27,0.3)]"></div>
              
              {/* Fearsome Red Eyes */}
              <div className="flex justify-between w-full px-12 mt-24">
                 <div className="relative">
                    <div className="w-12 h-6 bg-red-600 rounded-[80%_20%_80%_20%] shadow-[0_0_40px_red] animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-red-500 blur-sm opacity-50 animate-ping"></div>
                 </div>
                 <div className="relative">
                    <div className="w-12 h-6 bg-red-600 rounded-[20%_80%_20%_80%] shadow-[0_0_40px_red] animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-red-500 blur-sm opacity-50 animate-ping"></div>
                 </div>
              </div>

              {/* Dark Scarring / Lines */}
              <div className="absolute top-36 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-red-900/40"></div>
              
              {/* Jagged Grin */}
              <div className="mt-16 px-16">
                 <div className="w-full h-10 border-b-4 border-red-600 rounded-[50%] opacity-80 shadow-[0_5px_15px_red]"></div>
              </div>

              {/* Central Spiritual Eye (Flickering) */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-4 h-8 bg-red-500 rounded-full blur-[1px] shadow-[0_0_20px_red] animate-[flicker_0.5s_infinite]"></div>
           </div>
        </div>

        <div className="z-10 space-y-10 max-w-sm">
          <div className="space-y-6">
            <h2 className="text-4xl font-cinzel font-black text-red-600 tracking-[0.1em] uppercase leading-tight animate-[shake_0.3s_infinite]">
              {strings.analyzing}
            </h2>
            <p className="text-zinc-500 font-bold tracking-[0.25em] uppercase text-xs italic opacity-80">
              {strings.analyzingSub}
            </p>
          </div>
          
          <div className="flex gap-3 justify-center">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-red-900 rounded-full animate-bounce shadow-[0_0_10px_red]" style={{ animationDelay: `${i * 0.05}s` }}></div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-12 flex flex-col items-center gap-4 opacity-70">
           <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-red-900 to-transparent"></div>
           <p className="text-[10px] text-zinc-600 font-black tracking-[0.4em] uppercase">JUSTICE IS NOT SILENT. IT IS PREPARING.</p>
        </div>

        <style>{`
          @keyframes violentShake {
            0%, 100% { transform: translate(0, 0) rotate(0); }
            25% { transform: translate(-2px, 2px) rotate(-0.5deg); }
            50% { transform: translate(2px, -2px) rotate(0.5deg); }
            75% { transform: translate(-1px, -1px) rotate(-0.2deg); }
          }
          @keyframes flicker {
            0%, 100% { opacity: 1; transform: scale(1) translateX(-50%); }
            50% { opacity: 0.3; transform: scale(0.8) translateX(-50%); }
          }
          @keyframes zoomInOut {
            0%, 100% { transform: scale(1); opacity: 0.05; }
            50% { transform: scale(1.15); opacity: 0.15; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black">
      <header className="p-6 shrink-0 flex items-center justify-between border-b border-zinc-900 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate(AppScreen.HOME)} className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors bg-zinc-900 rounded-2xl border border-zinc-800 active:scale-90">
            <i className="fas fa-chevron-left"></i>
          </button>
          <div>
            <h2 className="text-lg font-cinzel font-black text-white tracking-widest uppercase">{strings.submitTitle}</h2>
            <p className="text-[8px] text-zinc-500 uppercase tracking-widest mt-1">{strings.submitSub}</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-8 pb-32">
        <div className="space-y-6">
          <div className="bg-zinc-900/40 p-6 rounded-[2.5rem] border border-zinc-800 space-y-8 shadow-2xl transition-all hover:border-zinc-700">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-600 mb-3 font-black">{strings.nameLabel}</label>
              <input 
                type="text" 
                placeholder={strings.nameLabel} 
                className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-white focus:border-red-600 outline-none transition-all text-sm font-light placeholder:text-zinc-800"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-600 mb-3 font-black">{strings.catLabel}</label>
              <div className="relative">
                <select 
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-white focus:border-red-600 outline-none appearance-none cursor-pointer text-sm font-light"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <i className="fas fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-zinc-700 pointer-events-none"></i>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-600 mb-3 font-black">{strings.descLabel}</label>
              <textarea 
                rows={5}
                placeholder="Unburden your soul here..."
                className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-white focus:border-red-600 outline-none transition-all resize-none text-sm font-light placeholder:text-zinc-800"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-600 mb-4 font-black">{strings.intensityLabel}</label>
              <div className="flex items-center gap-8 px-2">
                <input 
                  type="range" 
                  min="1" max="10" 
                  className="flex-grow h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                  value={formData.emotionLevel}
                  onChange={e => setFormData({ ...formData, emotionLevel: parseInt(e.target.value) })}
                />
                <div className="flex flex-col items-center">
                   <span className="text-red-600 font-cinzel font-black text-2xl leading-none">{formData.emotionLevel}</span>
                   <span className="text-[7px] text-zinc-600 uppercase tracking-widest mt-1">Severity</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-red-700 hover:bg-red-600 text-white font-black py-7 rounded-[2rem] shadow-[0_25px_80px_rgba(220,38,38,0.5)] transition-all duration-500 transform active:scale-95 uppercase tracking-[0.6em] relative overflow-hidden group text-xs border border-red-500/30"
          >
            <span className="relative z-10 flex items-center justify-center gap-6">
              <i className="fas fa-balance-scale-left text-lg"></i>
              {strings.seekButton}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitComplaint;
