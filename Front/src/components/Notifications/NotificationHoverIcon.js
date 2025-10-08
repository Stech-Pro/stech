// NotificationHoverIcon.jsx
import { useEffect, useRef, useState } from 'react';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../context/AuthContext';
import './NotificationHoverIcon.css';
import { fetchGameByKey } from '../../api/gameAPI';


export default function NotificationHoverIcon({
  limit = 20,
  pollMs = 0,
  iconSize = 24,
  className = '',
  staleMs = 60_000,
}) {
  const { items, unread, loading, refresh, readOne, readAll, clearLocal } =
    useNotifications({ limit, pollMs });
  const { isInitialized, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const lastRefreshAt = useRef(0);
  const nav = useNavigate();

  const openPanel = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = (ms = 120) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), ms);
  };



  // ✅ 로그인 완료 시 1회 fetch
  useEffect(() => {
    if (!isInitialized) return;
    if (isAuthenticated) {
      (async () => {
        await refresh();
        lastRefreshAt.current = Date.now();
      })();
    } else {
      // 로그아웃 시 처리(선택)
      setOpen(false);
      clearLocal?.();
      lastRefreshAt.current = 0;
    }
  }, [isInitialized, isAuthenticated, refresh, clearLocal]);

  // ✅ 창 포커스/가시성 복귀 시 오래됐으면만 갱신
  useEffect(() => {
    const maybeRefresh = async () => {
      if (!isAuthenticated) return;
      const now = Date.now();
      if (now - lastRefreshAt.current >= staleMs) {
        await refresh();
        lastRefreshAt.current = now;
      }
    };
    const onFocus = () => {
      if (!document.hidden) maybeRefresh();
    };
    const onVis = () => {
      if (!document.hidden) maybeRefresh();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [isAuthenticated, refresh, staleMs]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // 호버 시엔 패널만 열고, stale일 때만 조건부 새로고침
  const ensureFresh = async () => {
    if (!isAuthenticated) return;
    const now = Date.now();
    if (now - lastRefreshAt.current >= staleMs) {
      await refresh();
      lastRefreshAt.current = now;
    }
  };
  const onMouseEnter = () => {
    openPanel();
    ensureFresh();
  };

  const onClickItem = async (n) => {
  if (!n.isRead) readOne(n._id);
  if (n.gameKey) {
    const game = await fetchGameByKey(n.gameKey);
    nav(`/service/game/${encodeURIComponent(n.gamekey)}/clip`, { state: { game } });
  }
  setOpen(false);
};

  return (
    <div
      className={`nh-wrap ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={() => closeSoon()}
    >
      <button
        type="button"
        className="nh-bell"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <IoMdNotificationsOutline size={iconSize} />
        {unread > 0 && <span className="nh-badge">{unread}</span>}
      </button>

      {open && (
        <div className="nh-panel" role="menu">
          <div className="nh-header">
            <strong>알림</strong>
            <div className="nh-grow" />
            <button
              className="nh-readall"
              onClick={() => readAll()}
              disabled={unread === 0}
            >
              전체 읽음
            </button>
          </div>

          <div className="nh-list">
            {loading && items.length === 0 && (
              <div className="nh-empty">불러오는 중…</div>
            )}
            {!loading && items.length === 0 && (
              <div className="nh-empty">알림이 없습니다</div>
            )}
            {items.map((n) => (
              <button
                key={n._id}
                className={`nh-item ${n.isRead ? 'read' : 'unread'}`}
                onClick={() => onClickItem(n)}
                title={n.message}
              >
                <div className="nh-top">
                  <span className="nh-type">{labelType(n.type)}</span>
                  {!n.isRead && <span className="nh-dot" />}
                </div>
                <div className="nh-msg">{n.message}</div>
                <div className="nh-meta">
                  {n.teamName && <span>{n.teamName}</span>}
                  {n.gameKey && <span> · {n.gameKey}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function labelType(t) {
  switch (t) {
    case 'game_analysis_complete':
      return '경기 분석 완료';
    case 'clip_analysis_complete':
      return '클립 분석 완료';
    default:
      return '알림';
  }
}
