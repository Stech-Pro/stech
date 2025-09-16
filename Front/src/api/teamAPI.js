// src/api/teamAPI.js
import { API_CONFIG } from '../config/api';

export class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

const jsonOrText = async (res) => {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return await res.json(); } catch { return {}; }
  }
  try { return await res.text(); } catch { return ''; }
};

// 공통 timeout
const withTimeout = (ms, signal) => {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(new Error('Request timeout')), ms);
  const composite = new AbortController();
  const onAbort = () => ctrl.abort();
  signal?.addEventListener?.('abort', onAbort, { once: true });
  return { signal: ctrl.signal, clear: () => clearTimeout(id) };
};


export async function analyzeGamePlaycall(gameKey) {
  if (!gameKey) throw new Error('gameKey가 없습니다.');

  const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE_GAME_PLAYCALL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gamekey: gameKey }),
  });

  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : {};
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);

  const payload = data?.data || data;
  console.log(payload);
  console.log(gameKey);
  return {
    home: payload?.homeTeamStats ?? {},
    away: payload?.awayTeamStats ?? {},
  };
}