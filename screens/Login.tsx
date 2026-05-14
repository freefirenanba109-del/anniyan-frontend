import React, { useState } from 'react';
import { Theme } from '../types';

interface LoginProps {
  theme: Theme;
  onLogin: (userData: any) => void;
}

// ─── Inline API helpers (no separate module needed) ──────────────────────────
async function apiPost(path: string, body: object) {
  const API_BASE = (import.meta as any).env?.VITE_API_URL || '';
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const Login: React.FC<LoginProps> = ({ theme, onLogin }) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [step, setStep] = useState<'contact' | 'verify' | 'name'>('contact');
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isDark = theme === 'dark';

  // ─── Step 1: Send OTP ───────────────────────────────────────────────────────
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;
    setLoading(true);
    setError('');

    try {
      await apiPost('/auth/send-code', { contact: contact.trim(), mode: isSignIn ? 'signin' : 'signup' });
      setStep('verify');
    } catch (err: any) {
      // Fallback: local-only logic if backend is down
      try {
        const existingUsers = JSON.parse(localStorage.getItem('anniyan_all_users') || '[]');
        const userExists = existingUsers.find((u: any) => u.contact === contact.trim());
        if (isSignIn && !userExists) {
          setError('User not found. Please Sign Up.');
        } else if (!isSignIn && userExists) {
          setError('User already exists. Please Sign In.');
        } else {
          setStep('verify');
        }
      } catch {
        setStep('verify');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await apiPost('/auth/verify-code', {
        contact: contact.trim(),
        code,
        mode: isSignIn ? 'signin' : 'signup',
        ...(isSignIn ? {} : { name: name.trim() || undefined })
      });

      if (isSignIn) {
        localStorage.setItem('anniyan_user', JSON.stringify(result.user));
        onLogin(result.user);
      } else {
        setStep('name');
      }
    } catch (err: any) {
      // Fallback: local OTP check
      if (code !== '1234') {
        setError('Invalid code. Use 1234');
      } else {
        if (isSignIn) {
          const existingUsers = JSON.parse(localStorage.getItem('anniyan_all_users') || '[]');
          const user = existingUsers.find((u: any) => u.contact === contact.trim());
          if (user) {
            localStorage.setItem('anniyan_user', JSON.stringify(user));
            onLogin(user);
          } else {
            setError('User not found. Please Sign Up.');
          }
        } else {
          setStep('name');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: Complete Registration ─────────────────────────────────────────
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    try {
      const result = await apiPost('/auth/verify-code', {
        contact: contact.trim(),
        code,
        mode: 'signup',
        name: name.trim()
      });
      localStorage.setItem('anniyan_user', JSON.stringify(result.user));
      onLogin(result.user);
    } catch {
      // Fallback: local registration
      const user = {
        id: crypto.randomUUID(),
        name: name.trim(),
        contact: contact.trim(),
        joinedAt: Date.now()
      };
      const existingUsers = JSON.parse(localStorage.getItem('anniyan_all_users') || '[]');
      existingUsers.push(user);
      localStorage.setItem('anniyan_all_users', JSON.stringify(existingUsers));
      localStorage.setItem('anniyan_user', JSON.stringify(user));
      onLogin(user);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-[100dvh] w-full relative transition-colors duration-500 overflow-hidden items-center justify-center ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className={`absolute -top-[20%] -left-[20%] w-[140%] h-[140%] animate-[spin_30s_linear_infinite] ${isDark ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-black to-black' : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/20 via-zinc-50 to-zinc-50'}`}></div>
      </div>

      <div className={`relative z-10 w-full max-w-sm p-8 rounded-[2rem] border shadow-2xl backdrop-blur-xl ${isDark ? 'bg-zinc-950/80 border-red-900/30' : 'bg-white/80 border-zinc-200'}`}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
            <i className="fas fa-fingerprint text-3xl text-white"></i>
          </div>
          <h1 className="text-2xl font-cinzel font-black uppercase tracking-widest text-red-600">
            {step === 'verify' ? 'Verify Identity' : (isSignIn ? 'Sign In' : 'Sign Up')}
          </h1>
          <p className={`text-[10px] uppercase tracking-widest mt-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {step === 'contact' ? 'National Justice Dashboard' : step === 'verify' ? 'Enter Code Sent to Contact' : 'Finalize Profile'}
          </p>
        </div>

        {step === 'contact' && (
          <div className="flex justify-center gap-4 mb-6">
             <button onClick={() => { setIsSignIn(true); setError(''); }} className={`text-xs font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${isSignIn ? 'border-red-600 text-red-600' : 'border-transparent text-zinc-500'}`}>Sign In</button>
             <button onClick={() => { setIsSignIn(false); setError(''); }} className={`text-xs font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${!isSignIn ? 'border-red-600 text-red-600' : 'border-transparent text-zinc-500'}`}>Sign Up</button>
          </div>
        )}

        {error && <p className="text-xs text-red-500 text-center mb-4 font-bold">{error}</p>}

        {step === 'contact' && (
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className={`text-[0.6rem] font-black uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Gmail / Mobile Number</label>
              <div className={`flex items-center border rounded-xl overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <div className="w-10 flex justify-center text-zinc-500"><i className="fas fa-envelope"></i></div>
                <input 
                  type="text" 
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  placeholder="name@gmail.com or +91..."
                  className="w-full bg-transparent py-3 pr-4 text-sm outline-none placeholder:text-zinc-600"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-red-600 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] uppercase tracking-[0.2em] text-[0.7rem] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <i className="fas fa-spinner fa-spin"></i>}
              Send Code
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="space-y-1 text-center">
              <label className={`text-[0.6rem] font-black uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Enter 4-Digit Code</label>
              <input 
                type="text" 
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="1234"
                className={`w-full text-center text-2xl font-mono tracking-[1em] py-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} outline-none`}
                maxLength={4}
                required
              />
              <p className="text-[10px] text-zinc-500 mt-2">Hint: Use 1234 for testing</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white font-black py-4 rounded-xl uppercase tracking-[0.2em] text-[0.7rem] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <i className="fas fa-spinner fa-spin"></i>}
              Verify
            </button>
          </form>
        )}

        {step === 'name' && (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className={`text-[0.6rem] font-black uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Full Citizen Name</label>
              <div className={`flex items-center border rounded-xl overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <div className="w-10 flex justify-center text-zinc-500"><i className="fas fa-user"></i></div>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-transparent py-3 pr-4 text-sm outline-none"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white font-black py-4 rounded-xl uppercase tracking-[0.2em] text-[0.7rem] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <i className="fas fa-spinner fa-spin"></i>}
              Complete Profile
            </button>
          </form>
        )}
      </div>

      <div className="absolute bottom-8 text-center w-full">
        <p className={`text-[10px] font-cinzel font-black tracking-widest uppercase opacity-30 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Anniyan Justice System</p>
      </div>
    </div>
  );
};

export default Login;
