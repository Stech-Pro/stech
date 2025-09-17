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

// 옵션: 외부 signal + timeout 합치기
function composeSignal({ signal, timeout = 15000 } = {}) {
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort(signal?.reason || new Error('aborted'));
  signal?.addEventListener?.('abort', onAbort, { once: true });

  const t = timeout > 0 ? setTimeout(() => {
    ctrl.abort(new Error('Request timeout'));
  }, timeout) : null;

  const cleanup = () => {
    if (t) clearTimeout(t);
    signal?.removeEventListener?.('abort', onAbort);
  };

  return { signal: ctrl.signal, cleanup };
}

export async function fetchTeamStatsByKey(gameKey, { signal, timeout = 15000 } = {}) {
  if (!gameKey) throw new APIError('gameKey가 필요합니다', 400);

  // /team/stats/{gameKey}
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_TEAM_STATS_BY_KEY}/${encodeURIComponent(gameKey)}`;

  const { signal: mergedSignal, cleanup } = composeSignal({ signal, timeout });
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: mergedSignal,
    });

    const data = await jsonOrText(res);

    if (!res.ok) {
      throw new APIError(
        typeof data === 'object' ? (data.message || '팀 스탯 조회 실패') : '팀 스탯 조회 실패',
        res.status,
        data
      );
    }

    // 사진 예시 응답 구조: { success, message, data: { homeTeamStats, awayTeamStats, ... } }
    const payload = data?.data || data || {};

    const home =
      payload.homeTeamStats ||
      payload.homeTeam ||
      payload.home ||
      {};
    const away =
      payload.awayTeamStats ||
      payload.awayTeam ||
      payload.away ||
      {};

    return { home, away };
  } finally {
    cleanup();
  }
}

export async function fetchTeamTotalStats({ league, signal, timeout = 15000 } = {}) {
  const { signal: mergedSignal, cleanup } = composeSignal({ signal, timeout });
  try {
    // league 파라미터 정규화
    const params = new URLSearchParams();
    if (league && String(league).trim() !== '' && league !== '--') {
      const norm = String(league).replace(/\s/g, '');
      const leagueParam =
        norm === '1' || norm === '1부' ? '1부'
      : norm === '2' || norm === '2부' ? '2부'
      : norm;
      params.set('league', leagueParam);
    }

    const qs = params.toString();
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_TEAM_TOTAL_STATS}${qs ? `?${qs}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: mergedSignal,
    });

    const data = await jsonOrText(res);
    if (!res.ok) {
      throw new APIError(
        typeof data === 'object' ? (data.message || '팀 누계 스탯 조회 실패') : '팀 누계 스탯 조회 실패',
        res.status,
        data
      );
    }
    const payload = data?.data ?? data;
    return payload;
  } finally {
    cleanup();
  }
}