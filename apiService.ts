/**
 * apiService.ts — Frontend API Client
 * 
 * All calls go to /api/* which Vite proxies to the Express backend (port 5000).
 * Falls back gracefully to localStorage if backend is unavailable.
 */

const BASE = '/api';

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export const AuthAPI = {
  /**
   * Request an OTP for the given contact (email or phone).
   * Mode: 'signin' or 'signup'
   */
  sendCode: (contact: string, mode: 'signin' | 'signup') =>
    apiFetch('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ contact, mode })
    }),

  /**
   * Verify OTP. For signup, also provide name.
   * Returns { user } on success.
   */
  verifyCode: (contact: string, code: string, mode: 'signin' | 'signup', name?: string) =>
    apiFetch('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ contact, code, mode, name })
    }),

  /**
   * Logout the current user.
   */
  logout: (userId: string) =>
    apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ userId })
    }),

  /**
   * Get a user's profile by ID.
   */
  getUser: (userId: string) =>
    apiFetch(`/auth/user/${userId}`)
};

// ─── Complaints API ──────────────────────────────────────────────────────────

export const ComplaintsAPI = {
  /**
   * Save a new complaint analysis to the backend.
   */
  save: (userId: string, analysis: any, language: string) =>
    apiFetch('/complaints', {
      method: 'POST',
      body: JSON.stringify({ userId, analysis, language })
    }),

  /**
   * Get all complaints for a user (sorted newest first).
   */
  getHistory: (userId: string) =>
    apiFetch(`/complaints/${userId}`),

  /**
   * Get a specific complaint by ID.
   */
  getOne: (userId: string, id: string) =>
    apiFetch(`/complaints/${userId}/${id}`),

  /**
   * Delete a complaint.
   */
  delete: (userId: string, id: string) =>
    apiFetch(`/complaints/${userId}/${id}`, { method: 'DELETE' }),

  /**
   * Get aggregate stats for a user.
   */
  getStats: (userId: string) =>
    apiFetch(`/complaints/${userId}/stats/summary`)
};

// ─── Dashboard API ───────────────────────────────────────────────────────────

export const DashboardAPI = {
  /**
   * Get global platform statistics.
   */
  global: () => apiFetch('/dashboard/global'),

  /**
   * Get per-user dashboard data.
   */
  user: (userId: string) => apiFetch(`/dashboard/user/${userId}`)
};

// ─── Health ──────────────────────────────────────────────────────────────────

export const checkHealth = () => apiFetch('/health');
