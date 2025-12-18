// src/api/kafaStatsAPI.js
import { API_CONFIG } from '../config/api';
import { getToken } from '../utils/tokenUtils';

const BASE_URL = API_CONFIG.BASE_URL || 'https://api.stechpro.ai/api';

export class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

const buildHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

/**
 * KAFA 통계 크롤링 실행
 * @param {string} league - 'uni' (대학) 또는 'soc' (사회인)
 * @param {string} token - JWT 토큰
 */
export async function scrapeKafaStats(league, token = getToken()) {
  if (!['uni', 'soc'].includes(league)) {
    throw new APIError('리그는 uni 또는 soc만 가능합니다.', 400);
  }

  const url = `${BASE_URL}/kafa-stats/scrape-all-stats/${league}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(token),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new APIError(
        errorData.message || `크롤링 실패 (${res.status})`,
        res.status,
        errorData
      );
    }

    return await res.json();
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new APIError(err.message || '크롤링 중 오류 발생', 500);
  }
}

/**
 * KAFA 통계 데이터 조회
 * @param {string} league - 'uni' (대학) 또는 'soc' (사회인)
 * @param {string} statType - rushing, passing, receiving, tackles 등
 * @param {string} token - JWT 토큰
 */
export async function getKafaStats(league, statType, token = getToken()) {
  if (!['uni', 'soc'].includes(league)) {
    throw new APIError('리그는 uni 또는 soc만 가능합니다.', 400);
  }

  const url = `${BASE_URL}/kafa-stats/stat-json/${league}/${statType}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(token),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new APIError(
        errorData.message || `데이터 조회 실패 (${res.status})`,
        res.status,
        errorData
      );
    }

    return await res.json();
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new APIError(err.message || '데이터 조회 중 오류 발생', 500);
  }
}
