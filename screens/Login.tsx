import React, { useState } from 'react';
import { Theme } from '../types';

interface LoginProps {
  theme: Theme;
  onLogin: (userData: any) => void;
}

// ─── Inline API helpers ──────────────────────────────────────────────────────
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
  const [view, setView] = useState<'login' | 'signup_start' | 'signup_verify' | 'signup_finish'>('login');
  
  // Login States
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  // Signup States
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isDark = theme === 'dark';

  // ─── LOGIN HANDLER ─────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await apiPost('/auth/login', { loginId, password });
      localStorage.setItem('anniyan_user', JSON.stringify(result.user));
      onLogin(result.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── SIGNUP STEP 1: Send OTP ───────────────────────────────────────────────
  const handleSignupStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiPost('/auth/register-start', { contact });
      setView('signup_verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── SIGNUP STEP 2: Verify OTP ──────────────────────────────────────────────
  const handleSignupVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiPost('/auth/register-verify', { contact, code: otp });
      setView('signup_finish');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── SIGNUP STEP 3: Complete ───────────────────────────────────────────────
  const handleSignupComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await apiPost('/auth/register-complete', {
        contact,
        name: fullName,
        username,
        password: signupPassword
      });
      localStorage.setItem('anniyan_user', JSON.stringify(result.user));
      onLogin(result.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-[100dvh] w-full items-center justify-center p-4 transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-zinc-50'}`}>
      
      {/* Container Box */}
      <div className={`w-full max-w-[350px] flex flex-col items-center border ${isDark ? 'bg-black border-zinc-800' : 'bg-white border-zinc-200'} py-10 px-8 rounded-sm`}>
        
        {/* Logo */}
        <h1 className="text-4xl font-cinzel font-black uppercase tracking-tighter text-red-600 mb-8 italic">
          Anniyan
        </h1>

        {error && <p className="text-xs text-red-500 text-center mb-4 font-semibold">{error}</p>}

        {/* ─── VIEW: LOGIN ───────────────────────────────────────────────────── */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="w-full space-y-2">
            <input 
              type="text" placeholder="Phone number, username, or email"
              className={`w-full px-3 py-2 text-xs border rounded-sm outline-none ${isDark ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-600' : 'bg-zinc-50 border-zinc-300 text-black focus:border-zinc-400'}`}
              value={loginId} onChange={e => setLoginId(e.target.value)} required
            />
            <input 
              type="password" placeholder="Password"
              className={`w-full px-3 py-2 text-xs border rounded-sm outline-none ${isDark ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-600' : 'bg-zinc-50 border-zinc-300 text-black focus:border-zinc-400'}`}
              value={password} onChange={e => setPassword(e.target.value)} required
            />
            <button 
              type="submit" disabled={loading}
              className="w-full bg-red-600 text-white text-sm font-bold py-1.5 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
            <div className="flex items-center my-4">
              <div className="flex-1 h-[1px] bg-zinc-800"></div>
              <span className="mx-4 text-[10px] font-bold text-zinc-500 uppercase">OR</span>
              <div className="flex-1 h-[1px] bg-zinc-800"></div>
            </div>
            <button type="button" className="text-xs text-zinc-400 font-semibold w-full">Forgot password?</button>
          </form>
        )}

        {/* ─── VIEW: SIGNUP START ────────────────────────────────────────────── */}
        {view === 'signup_start' && (
          <form onSubmit={handleSignupStart} className="w-full space-y-2 text-center">
            <p className="text-sm font-bold text-zinc-400 mb-4">Sign up to see justice served.</p>
            <input 
              type="text" placeholder="Mobile Number or Email"
              className={`w-full px-3 py-2 text-xs border rounded-sm outline-none ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300'}`}
              value={contact} onChange={e => setContact(e.target.value)} required
            />
            <button 
              type="submit" disabled={loading}
              className="w-full bg-red-600 text-white text-sm font-bold py-1.5 rounded-md disabled:opacity-50 mt-2"
            >
              Next
            </button>
          </form>
        )}

        {/* ─── VIEW: SIGNUP VERIFY ───────────────────────────────────────────── */}
        {view === 'signup_verify' && (
          <form onSubmit={handleSignupVerify} className="w-full space-y-2 text-center">
            <p className="text-xs font-bold text-zinc-400 mb-4">Enter the 6-digit code we sent to {contact}</p>
            <input 
              type="text" placeholder="######"
              className={`w-full px-3 py-4 text-center text-xl font-mono tracking-widest border rounded-sm outline-none ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300'}`}
              value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required
            />
            <button 
              type="submit" disabled={loading}
              className="w-full bg-red-600 text-white text-sm font-bold py-1.5 rounded-md disabled:opacity-50 mt-2"
            >
              Verify
            </button>
            <div className="mt-6 p-3 bg-zinc-900/50 border border-zinc-800 rounded-sm">
              <p className="text-[9px] text-zinc-500 leading-relaxed uppercase tracking-widest">
                Note: If email delivery is delayed, contact the system administrator for your 6-digit access code.
              </p>
            </div>
          </form>
        )}

        {/* ─── VIEW: SIGNUP FINISH ───────────────────────────────────────────── */}
        {view === 'signup_finish' && (
          <form onSubmit={handleSignupComplete} className="w-full space-y-2">
            <input 
              type="text" placeholder="Full Name"
              className={`w-full px-3 py-2 text-xs border rounded-sm outline-none ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300'}`}
              value={fullName} onChange={e => setFullName(e.target.value)} required
            />
            <input 
              type="text" placeholder="Username"
              className={`w-full px-3 py-2 text-xs border rounded-sm outline-none ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300'}`}
              value={username} onChange={e => setUsername(e.target.value)} required
            />
            <input 
              type="password" placeholder="Password"
              className={`w-full px-3 py-2 text-xs border rounded-sm outline-none ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300'}`}
              value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required
            />
            <button 
              type="submit" disabled={loading}
              className="w-full bg-red-600 text-white text-sm font-bold py-1.5 rounded-md disabled:opacity-50 mt-2"
            >
              Sign up
            </button>
          </form>
        )}
      </div>

      {/* Toggle Box */}
      <div className={`w-full max-w-[350px] mt-4 border py-6 text-center ${isDark ? 'bg-black border-zinc-800 text-white' : 'bg-white border-zinc-200 text-black'}`}>
        <p className="text-sm">
          {view === 'login' ? (
            <>Don't have an account? <button onClick={() => setView('signup_start')} className="text-red-600 font-bold">Sign up</button></>
          ) : (
            <>Have an account? <button onClick={() => setView('login')} className="text-red-600 font-bold">Log in</button></>
          )}
        </p>
      </div>

      {/* App Promo */}
      <div className="mt-4 text-center">
        <p className="text-xs text-zinc-500">Get the Anniyan Justice System app.</p>
        <div className="flex gap-2 mt-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer">
           <div className="h-10 w-32 bg-zinc-900 border border-zinc-800 rounded-md flex items-center justify-center text-[10px] text-white">App Store</div>
           <div className="h-10 w-32 bg-zinc-900 border border-zinc-800 rounded-md flex items-center justify-center text-[10px] text-white">Google Play</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
