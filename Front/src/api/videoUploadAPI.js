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

/** 업로드 완료 알림 (디버그용: 타임아웃/Abort 미사용) */
export async function completeMatchUpload(payload) {
  const res = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPLETE_MATCH_UPLOAD}`,
    { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) }
  );

  const raw = await res.text().catch(() => '');
  if (!res.ok) {
    throw new Error(`complete-match-upload 실패 (${res.status}) ${raw || ''}`);
  }
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return { raw }; }
}


export async function putToS3(
  url,
  file,
  {
    contentType,                 // contentTypeStrategy === 'force' 일 때 사용
    contentTypeStrategy = 'file' // 'file' | 'force' | 'omit'
  } = {}
) {
  const headers = {};
  if (contentTypeStrategy === 'file') {
    if (file?.type) headers['Content-Type'] = file.type;
  } else if (contentTypeStrategy === 'force' && contentType) {
    headers['Content-Type'] = contentType;
  } // 'omit'이면 Content-Type 보내지 않음

  let res;
  try {
    res = await fetch(url, { method: 'PUT', headers, body: file });
  } catch (e) {
    // 네트워크/CORS 차단 시 여기로 들어옴 (브라우저에선 TypeError: Failed to fetch)
    // AbortError가 더이상 나오지 않게 AbortController를 사용하지 않습니다.
    throw e;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`S3 업로드 실패 (HTTP ${res.status}) ${text || ''}`);
  }
  return true;
}