// src/api/videoUploadAPI.js
import { API_CONFIG } from '../config/api';
import { getToken } from '../utils/tokenUtils';

const jsonOrText = async (res) => {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return await res.json(); } catch { return {}; }
  }
  try { return await res.text(); } catch { return ''; }
};

function authHeaders(extra = {}) {
  const token = getToken?.();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
    ...extra,
  };
}

/** 1) 준비단계: presigned URL 발급 */
export async function prepareMatchUpload(payload) {
  const res = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PREPARE_MATCH_UPLOAD}`,
    { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) }
  );
  const data = await jsonOrText(res);
  if (!res.ok) throw new Error(data?.message || 'prepare-match-upload 실패');
  return data; // { success, data: { gameKey, totalVideos, uploadUrls, expiresIn } }
}

/** 3) 완료단계: 업로드 완료 알림 */
export async function completeMatchUpload(payload) {
  const res = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPLETE_MATCH_UPLOAD}`,
    { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) }
  );
  const data = await jsonOrText(res);
  if (!res.ok) throw new Error(data?.message || 'complete-match-upload 실패');
  return data;
}

/** S3 PUT 업로드 (지수 백오프 재시도) */
export async function putToS3(url, file, { contentType = 'video/mp4', maxRetries = 2, signal } = {}) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': contentType }, body: file, signal });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`S3 업로드 실패 (HTTP ${res.status}) ${text || ''}`);
      }
      return true;
    } catch (e) {
      if (signal?.aborted) throw e;
      const retriable = !e.status || e.status >= 500 || [408, 409, 425, 429].includes(e.status);
      if (!retriable || attempt === maxRetries) throw e;
      await new Promise(r => setTimeout(r, Math.min(2000 * 2 ** attempt, 8000)));
      attempt += 1;
    }
  }
}
