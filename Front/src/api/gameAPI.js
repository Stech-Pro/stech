// src/api/gameAPI.js
import { API_CONFIG } from '../config/api';
import { apiFetch } from '../common/apiFetch';

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

/* 팀별 경기 목록 조회: GET /api/game/team/{teamName} */
export async function fetchTeamGames(teamNameOrId) {
  if (!teamNameOrId) return [];

  const url = `${API_CONFIG.ENDPOINTS.GET_GAMES_BY_TEAM}/${encodeURIComponent(teamNameOrId)}`;
  const res = await apiFetch(url, { method: 'GET' });
  const data = await jsonOrText(res);

  if (!res.ok) {
    throw new APIError(
      typeof data === 'object' ? data.message || '팀 경기 조회 실패' : '팀 경기 조회 실패',
      res.status,
      data
    );
  }

  // 백엔드 응답 구조: { success: true, data: [...] } | [...] | { ... }
  let games = [];
  if (typeof data === 'object' && data.success && Array.isArray(data.data)) {
    games = data.data;
  } else if (Array.isArray(data)) {
    games = data;
  } else if (data && typeof data === 'object') {
    games = [data];
  }

  // 서버 스키마 → GamePage 스키마 매핑
  return games.map((g) => ({
    gameKey: g.gameKey,
    date: (g.date || '').slice(0, 10), // 'YYYY-MM-DD'
    type: g.type || 'Season',
    location: g.location || '',
    homeId: g.homeTeam,
    awayId: g.awayTeam,
    homeScore: g?.score?.home ?? 0,
    awayScore: g?.score?.away ?? 0,
    length: g.length || '-',   // 없으면 '-'
    report: !!g.report,        // bool
    uploadStatus: g.uploadStatus || 'completed', // pending, completed
  }));
}

/* 특정 경기의 클립 목록: GET /api/game/clips/{gameKey} (ENDPOINTS.GET_CLIPS_BY_TEAM에 매핑돼 있다면 그대로 사용) */
export async function fetchGameClips(gameKey) {
  if (!gameKey) return [];

  const url = `${API_CONFIG.ENDPOINTS.GET_CLIPS_BY_TEAM}/${encodeURIComponent(gameKey)}`;
  const res = await apiFetch(url, { method: 'GET' });
  const data = await jsonOrText(res);

  if (!res.ok) {
    throw new APIError(
      typeof data === 'object' ? data.message || '클립 조회 실패' : '클립 조회 실패',
      res.status,
      data
    );
  }
  console.log('fetchGameClips data:', data);

  // 실제 API 응답 구조에 맞게 방어적으로 파싱
  let clips = [];
  if (typeof data === 'object' && data.success && data.data && Array.isArray(data.data.Clips)) {
    clips = data.data.Clips;
  } else if (Array.isArray(data)) {
    clips = data;
  }
  return clips;
}

/* 코치 하이라이트: GET /api/game/highlights/coach (가정) */
export async function getCoachHighlights() {
  const res = await apiFetch(`${API_CONFIG.ENDPOINTS.GET_COACH_HIGHLIGHTS}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await jsonOrText(res);

  if (!res.ok) {
    throw new APIError(
      typeof data === 'object' ? data.message || '하이라이트 조회 실패' : '하이라이트 조회 실패',
      res.status,
      data
    );
  }

  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.highlights)) return data.highlights;
    if (Array.isArray(data.data)) return data.data;
  }
  return [];
}

/* 선수 하이라이트: GET /api/game/highlights/player (가정) */
export async function getPlayerHighlights() {
  const res = await apiFetch(`${API_CONFIG.ENDPOINTS.GET_PLAYER_HIGHLIGHTS}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await jsonOrText(res);

  if (!res.ok) {
    throw new APIError(
      typeof data === 'object' ? data.message || '하이라이트 조회 실패' : '하이라이트 조회 실패',
      res.status,
      data
    );
  }
  console.log('getPlayerHighlights data:', data);

  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.highlights)) return data.highlights;
    if (Array.isArray(data.data)) return data.data;
  }
  return [];
}

/* 분석 대기중 경기 목록: GET /game/pending (관리자 전용) */
export async function fetchPendingGames() {
  const res = await apiFetch('/game/pending', { method: 'GET' });
  const data = await jsonOrText(res);

  if (!res.ok) {
    throw new APIError(
      typeof data === 'object' ? data.message || '분석 대기 경기 조회 실패' : '분석 대기 경기 조회 실패',
      res.status,
      data
    );
  }

  // 백엔드 응답 구조: { success: true, data: [...] }
  let games = [];
  if (typeof data === 'object' && data.success && Array.isArray(data.data)) {
    games = data.data;
  } else if (Array.isArray(data)) {
    games = data;
  } else if (data && typeof data === 'object') {
    games = [data];
  }

  // 서버 스키마 그대로 반환 (분석팀용이므로 추가 변환 불필요)
  return games;
}
