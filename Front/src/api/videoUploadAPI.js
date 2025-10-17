// src/api/videoUploadAPI.js
import { API_CONFIG } from '../config/api';
import { getToken } from '../utils/tokenUtils';
import { apiFetch } from '../common/apiFetch';

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
  uploadData,
  file,
  {
    contentType,                 // contentTypeStrategy === 'force' 일 때 사용
    contentTypeStrategy = 'omit' // 'file' | 'force' | 'omit'
  } = {}
) {
  // 백엔드 프록시 업로드 사용 (Safari 호환)
  const formData = new FormData();
  formData.append('file', file);
  formData.append('gameKey', uploadData.gameKey);
  formData.append('fileName', uploadData.fileName);
  formData.append('s3Path', uploadData.s3Path);

  const token = getToken?.();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_CONFIG.BASE_URL}/game/upload-video`, {
      method: 'POST',
      headers,
      body: formData
    });
  } catch (e) {
    // 네트워크/CORS 차단 시 여기로 들어옴
    throw e;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`백엔드 업로드 실패 (HTTP ${res.status}) ${text || ''}`);
  }
  
  const result = await res.json().catch(() => ({}));
  if (!result.success) {
    throw new Error(result.message || '업로드 실패');
  }
  
  return true;
}

export async function deleteGameVideos(gameKey) {
  if (!gameKey) throw new Error('gameKey가 필요합니다.');
  const url = `${API_CONFIG.ENDPOINTS.DELETE_VIDEOS}/${encodeURIComponent(gameKey)}`;

  const res = await apiFetch(url, { method: 'DELETE' });
  const data = await jsonOrText(res);

  if (!res.ok) {
    const msg = typeof data === 'object' && data?.message
      ? data.message
      : `비디오 삭제 실패 (HTTP ${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;}