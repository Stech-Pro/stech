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
    try { return await res.json(); } catch { return {}; }
  }
  try { return await res.text(); } catch { return ''; }
};

/* 팀별 경기 목록 조회: GET /api/game/team/{teamName} */
export async function fetchTeamGames(teamNameOrId) {
  if (!teamNameOrId) return [];
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_GAMES_BY_TEAM}/${encodeURIComponent(teamNameOrId)}`;

  const res = await fetch(url, { method: 'GET' });
  const data = await jsonOrText(res);

  if (!res.ok) {
    throw new APIError(
      typeof data === 'object' ? data.message || '팀 경기 조회 실패' : '팀 경기 조회 실패',
      res.status,
      data
    );
  }

  const rows = Array.isArray(data) ? data : [data];

  // 서버 스키마 → GamePage 스키마 매핑
  return rows.map((g) => ({
    gameKey: g.gameKey,                         // 예: 'SNSU20240907'
    date: (g.date || '').slice(0, 10),         // '2024-09-07'
    type: g.type || 'Season',
    location: g.location || '',
    homeId: g.homeTeam,                         // 서버가 팀 id/코드 문자열 제공
    awayId: g.awayTeam,
    homeScore: g?.score?.home ?? 0,
    awayScore: g?.score?.away ?? 0,
    length: g.length || '-',                    // 없으면 '-'
    report: !!g.report,                         // bool
  }));
}
