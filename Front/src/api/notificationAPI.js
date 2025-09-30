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

const authHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});

const withBase = (path) => `${API_CONFIG.BASE_URL}${path}`;

/** 알림 목록 조회 */
export async function fetchNotifications(limit = 20) {
  const url = `${withBase(API_CONFIG.ENDPOINTS.NOTI_LIST)}?limit=${limit}`;
  const res = await fetch(url, { headers: authHeaders() });
  const data = await jsonOrText(res);
  if (!res.ok) throw new APIError(data?.message || '알림 목록 조회 실패', res.status, data);
  return data?.data?.notifications ?? [];
}

/** 안 읽은 개수 */
export async function fetchUnreadCount() {
  const url = withBase(API_CONFIG.ENDPOINTS.NOTI_UNREAD_COUNT);
  const res = await fetch(url, { headers: authHeaders() });
  const data = await jsonOrText(res);
  if (!res.ok) throw new APIError(data?.message || '안 읽은 개수 조회 실패', res.status, data);
  return data?.data?.unreadCount ?? 0;
}

/** 특정 알림 읽음 처리 */
export async function markNotificationRead(id) {
  const url = withBase(`${API_CONFIG.ENDPOINTS.NOTI_LIST}/${encodeURIComponent(id)}/read`);
  const res = await fetch(url, { method: 'PUT', headers: authHeaders() });
  const data = await jsonOrText(res);
  if (!res.ok) throw new APIError(data?.message || '알림 읽음 처리 실패', res.status, data);
  return true;
}

/** 전체 알림 읽음 처리 */
export async function markAllNotificationsRead() {
  const url = withBase(API_CONFIG.ENDPOINTS.NOTI_READ_ALL);
  const res = await fetch(url, { method: 'PUT', headers: authHeaders() });
  const data = await jsonOrText(res);
  if (!res.ok) throw new APIError(data?.message || '전체 읽음 처리 실패', res.status, data);
  return true;
}
