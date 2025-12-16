// src/api/memoAPI.js
import { API_CONFIG } from '../config/api';
import { getToken } from '../utils/tokenUtils';

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

const buildHeaders = (token) => {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

const MEMOS = API_CONFIG.ENDPOINTS.MEMOS || '/memos';

/** 메모 작성 (POST /memos) */
export async function createMemo(payload, token = getToken()) {
  const res = await fetch(`${API_CONFIG.BASE_URL}${MEMOS}`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await jsonOrText(res);
  console.log('createMemo response data:', data);
  if (res.ok || res.status === 201) return data;
  throw new APIError(
    typeof data === 'object' ? data.message || '메모 작성 실패' : '메모 작성 실패',
    res.status,
    data
  );
}

/** 메모 목록 조회 (GET /memos?gameKey=&clipKey=) */
export async function listMemos({ gameKey, clipKey } = {}, token = getToken()) {
  const q = new URLSearchParams();
  if (gameKey) q.set('gameKey', gameKey);
  if (clipKey) q.set('clipKey', clipKey);
  const url = `${API_CONFIG.BASE_URL}${MEMOS}${q.toString() ? `?${q}` : ''}`;

  const res = await fetch(url, { headers: buildHeaders(token) });
  const data = await jsonOrText(res);
  if (!res.ok) {
    throw new APIError(
      typeof data === 'object' ? data.message || '메모 목록 조회 실패' : '메모 목록 조회 실패',
      res.status,
      data
    );
  }

  // 백엔드 응답: { success: true, memos: [...] }
  // memos 배열만 반환
  if (data && typeof data === 'object' && Array.isArray(data.memos)) {
    return data.memos;
  }

  // 응답이 이미 배열이면 그대로 반환
  if (Array.isArray(data)) {
    return data;
  }

  // 예상치 못한 응답 형식
  console.warn('예상치 못한 메모 응답 형식:', data);
  return [];
}

/** 특정 메모 조회 (GET /memos/:memoId) */
export async function getMemoById(memoId, token = getToken()) {
  if (!memoId) throw new APIError('memoId가 필요합니다.', 400);
  const res = await fetch(
    `${API_CONFIG.BASE_URL}${MEMOS}/${encodeURIComponent(memoId)}`,
    { headers: buildHeaders(token) }
  );
  const data = await jsonOrText(res);
  if (res.ok) return data;
  throw new APIError(
    typeof data === 'object' ? data.message || '메모 조회 실패' : '메모 조회 실패',
    res.status,
    data
  );
}

/** 메모 수정 (PUT /memos/:memoId) */
export async function updateMemo(memoId, body, token = getToken()) {
  if (!memoId) throw new APIError('memoId가 필요합니다.', 400);
  const res = await fetch(
    `${API_CONFIG.BASE_URL}${MEMOS}/${encodeURIComponent(memoId)}`,
    { method: 'PUT', headers: buildHeaders(token), body: JSON.stringify(body) }
  );
  const data = await jsonOrText(res);
  if (res.ok) return data;
  throw new APIError(
    typeof data === 'object' ? data.message || '메모 수정 실패' : '메모 수정 실패',
    res.status,
    data
  );
}

/** 메모 삭제 (DELETE /memos/:memoId) */
export async function deleteMemo(memoId, token = getToken()) {
  if (!memoId) throw new APIError('memoId가 필요합니다.', 400);
  const res = await fetch(
    `${API_CONFIG.BASE_URL}${MEMOS}/${encodeURIComponent(memoId)}`,
    { method: 'DELETE', headers: buildHeaders(token) }
  );
  const data = await jsonOrText(res);
  if (res.ok) return data;
  throw new APIError(
    typeof data === 'object' ? data.message || '메모 삭제 실패' : '메모 삭제 실패',
    res.status,
    data
  );
}
