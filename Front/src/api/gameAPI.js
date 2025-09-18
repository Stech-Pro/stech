// src/api/gameAPI.js
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
    try {
      return await res.json();
    } catch {
      return {};
    }
  }
  try {
    return await res.text();
  } catch {
    return '';
  }
};

/* 팀별 경기 목록 조회: GET /api/game/team/{teamName} */
export async function fetchTeamGames(teamNameOrId) {
  if (!teamNameOrId) return [];
  const url = `${API_CONFIG.BASE_URL}${
    API_CONFIG.ENDPOINTS.GET_GAMES_BY_TEAM
  }/${encodeURIComponent(teamNameOrId)}`;

  const res = await fetch(url, { method: 'GET' });
  const data = await jsonOrText(res);

  if (!res.ok) {
    throw new APIError(
      typeof data === 'object'
        ? data.message || '팀 경기 조회 실패'
        : '팀 경기 조회 실패',
      res.status,
      data,
    );
  }

  // 백엔드 응답 구조: { success: true, data: [...], message: "..." }
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
    date: (g.date || '').slice(0, 10), // '2024-09-07'
    type: g.type || 'Season',
    location: g.location || '',
    homeId: g.homeTeam,
    awayId: g.awayTeam,
    homeScore: g?.score?.home ?? 0,
    awayScore: g?.score?.away ?? 0,
    length: g.length || '-', // 없으면 '-'
    report: !!g.report, // bool
  }));
}

export async function fetchGameClips(gameKey) {
  if (!gameKey) return [];

  const url = `${API_CONFIG.BASE_URL}${
    API_CONFIG.ENDPOINTS.GET_CLIPS_BY_TEAM
  }/${encodeURIComponent(gameKey)}`;

  const res = await fetch(url, { method: 'GET' });
  const data = await jsonOrText(res);

  if (!res.ok) {
    throw new APIError(
      typeof data === 'object'
        ? data.message || '클립 조회 실패'
        : '클립 조회 실패',
      res.status,
      data,
    );
  }

  // 실제 API 응답 구조에 맞게 수정
  let clips = [];
  if (
    typeof data === 'object' &&
    data.success &&
    data.data &&
    Array.isArray(data.data.Clips)
  ) {
    clips = data.data.Clips;
  } else if (Array.isArray(data)) {
    clips = data;
  }

  return clips;
}
