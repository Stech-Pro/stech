// src/api/videoUploadAPI.js
import { API_CONFIG } from '../config/api';
import { getToken } from '../utils/tokenUtils';

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
    { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) },
  );
  const data = await jsonOrText(res);
  if (!res.ok) throw new Error(data?.message || 'prepare-match-upload 실패');
  return data; // { success, data: { gameKey, totalVideos, uploadUrls, expiresIn } }
}

/** 3) 완료단계: 업로드 완료 알림 */
export async function completeMatchUpload({ gameKey, uploadedVideos, signal }) {
  const token = getToken?.();

  const res = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPLETE_MATCH_UPLOAD}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ gameKey, uploadedVideos }),
      signal, // <- AbortController용
    },
  );

  const text = await res.text(); // 백엔드가 빈 본문을 줄 수도 있으니 먼저 text로
  console.log('[completeMatchUpload] response:', res.status, text);
  if (!res.ok) {
    console.error('[completeMatchUpload] failed', res.status, text);
    throw new Error(`completeMatchUpload 실패 (${res.status}) ${text || ''}`);
  }

  try {
    return text ? JSON.parse(text) : {}; // 빈 본문도 허용
  } catch (e) {
    // Swagger에서 성공이더라도 본문이 문자열일 수 있으니 파싱 실패해도 객체로 반환
    return { raw: text };
  }
}

/** S3 PUT 업로드 (지수 백오프 재시도) */
export async function putToS3(
  url,
  file,
  { contentType = 'video/mp4', maxRetries = 2, signal } = {},
) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: file,
        signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`S3 업로드 실패 (HTTP ${res.status}) ${text || ''}`);
      }
      return true;
    } catch (e) {
      if (signal?.aborted) throw e;
      const retriable =
        !e.status || e.status >= 500 || [408, 409, 425, 429].includes(e.status);
      if (!retriable || attempt === maxRetries) throw e;
      await new Promise((r) =>
        setTimeout(r, Math.min(2000 * 2 ** attempt, 8000)),
      );
      attempt += 1;
    }
  }
}
