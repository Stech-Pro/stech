import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notificationAPI';

export function useNotifications({ limit = 20, pollMs = 0 } = {}) {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, cnt] = await Promise.all([
        fetchNotifications(limit),
        fetchUnreadCount(),
      ]);
      setItems(list);
      setUnread(cnt);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
    if (pollMs > 0) {
      timerRef.current = setInterval(load, pollMs);
      return clearTimer;
    }
  }, [load, pollMs]);

  const readOne = useCallback(async (id) => {
    setItems(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnread(c => Math.max(0, c - 1));
    try { await markNotificationRead(id); } catch { load(); }
  }, [load]);

  const readAll = useCallback(async () => {
    setItems(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
    try { await markAllNotificationsRead(); } catch { load(); }
  }, [load]);

  return { items, unread, loading, error, refresh: load, readOne, readAll };
}
