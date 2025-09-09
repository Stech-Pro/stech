// src/pages/Service/HighlightPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { getUserHighlights } from '../../../../api/authAPI';
import HighlightModal from '../../../../components/HighlightModal';

const GameItem = ({ gameKey, count, active, onClick }) => (
  <li>
    <button type="button" onClick={onClick} className={active ? 'active' : ''} aria-pressed={active}>
      <span className="game-key">{gameKey}</span>
      <span className="game-count">하이라이트 {count}개</span>
    </button>
  </li>
);

const ClipItem = ({ clipKey, onClick }) => (
  <li>
    <button type="button" onClick={onClick} title={clipKey}>
      <span className="clip-key">{clipKey}</span>
    </button>
  </li>
);

export default function HighlightPage() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [byGame, setByGame] = useState({}); // { [gameKey]: string[] }
  const [selectedGameKey, setSelectedGameKey] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!isAuthenticated || !token) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        const rowsRaw = await getUserHighlights(token);  // ← 항상 배열 보장
        const rows = Array.isArray(rowsRaw) ? rowsRaw : []; // 추가 가드

        const grouped = rows.reduce((acc, r) => {
          const gk = r?.gameKey || 'UNKNOWN_GAME';
          const ck = r?.clipKey || r?.clipId || r?.clip || '';
          if (!ck) return acc;
          (acc[gk] ||= []).push(ck);
          return acc;
        }, {});

        if (!alive) return;
        setByGame(grouped);
        setSelectedGameKey(Object.keys(grouped)[0] || null);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || '하이라이트를 불러오지 못했습니다.');
        setByGame({});
        setSelectedGameKey(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [isAuthenticated, token]);

  const gameList = useMemo(
    () => Object.keys(byGame).map((k) => ({ gameKey: k, count: (byGame[k] || []).length })),
    [byGame]
  );

  const totalHighlights = useMemo(
    () => Object.values(byGame).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0),
    [byGame]
  );

  const clipsForSelected = useMemo(() => {
    if (!selectedGameKey) return [];
    return (byGame[selectedGameKey] || []).filter(Boolean);
  }, [selectedGameKey, byGame]);

  const goVideo = (clipKey) => {
    const g = encodeURIComponent(selectedGameKey || '');
    const c = encodeURIComponent(clipKey || '');
    navigate(`/video?gameKey=${g}&clipKey=${c}`);
  };

  // --- 렌더링 --------------------------------------------------

  if (loading) return <p className="highlight-loading">불러오는 중…</p>;
  if (error)   return (
    <div className="highlight-error-wrap">
      <p className="highlight-error" role="alert">⚠ {error}</p>
      <button type="button" onClick={() => navigate(-1)}>닫기</button>
    </div>
  );

  // ✅ 전체 하이라이트가 0개면 "모달만" 띄움 (뒤에 아무것도 없음)
  if (totalHighlights === 0) {
    return <HighlightModal onClose={() => navigate(-1)} />;
  }

  // ✅ 데이터가 있으면 목록 화면으로
  return (
    <div className="highlight-page">
      <div className="highlight-header">
        <h2>하이라이트</h2>
        <button type="button" onClick={() => navigate(-1)}>닫기</button>
      </div>

      <div className="highlight-content">
        <section className="game-section">
          <h3 className="section-title">경기 목록</h3>
          <ul className="game-list">
            {gameList.map((g) => (
              <GameItem
                key={g.gameKey}
                gameKey={g.gameKey}
                count={g.count}
                active={g.gameKey === selectedGameKey}
                onClick={() => setSelectedGameKey(g.gameKey)}
              />
            ))}
          </ul>
        </section>

        <section className="clip-section">
          <h3 className="section-title">{selectedGameKey || '선택된 경기'}</h3>

          {/* 선택된 경기의 클립이 0개면 우측에만 모달 */}
          {clipsForSelected.length === 0 ? (
            <HighlightModal onClose={() => null} />
          ) : (
            <ul className="clip-list">
              {clipsForSelected.map((clipKey) => (
                <ClipItem key={clipKey} clipKey={clipKey} onClick={() => goVideo(clipKey)} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
