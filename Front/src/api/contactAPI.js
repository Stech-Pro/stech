// src/api/contactAPI.js
import { API_CONFIG } from '../config/api';

export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status ?? 0;
    this.data = data ?? null;
  }
}

const CONTACT = (API_CONFIG.ENDPOINTS?.CONTACT) || '/contact';

const jsonOrText = async (res) => {
  if (res.status === 204 || res.status === 205) return null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) { try { return await res.json(); } catch { return {}; } }
  try { return await res.text(); } catch { return ''; }
};

export async function sendContact(payload) {
  const res = await fetch(`${API_CONFIG.BASE_URL}${CONTACT}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },  // 보통 인증 필요 없음
    body: JSON.stringify(payload),
  });
  const data = await jsonOrText(res);
  if (res.ok || res.status === 201) return data;
  throw new APIError(typeof data === 'object' ? data?.message || '전송 실패' : '전송 실패', res.status, data);
}
