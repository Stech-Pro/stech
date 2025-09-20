// src/pages/Service/HighlightPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { getPlayerHighlights, getCoachHighlights } from '../../../../api/gameAPI';
import HighlightModal from '../../../../components/HighlightModal';

const GameItem = ({ gameKey, count, active, onClick }) => (
  <li>
    <button type="button" onClick={onClick} className={active ? 'active' : ''} aria-pressed={active}>
      <span className="game-key">{gameKey}</span>
      <span className="game-count">하이라이트 {count}개</span>
    </button>
  </li>
);

const ClipItem = ({ clip, onClick }) => (
  <li>
    <button type="button" onClick={onClick} title={clip?.clipKey}>
      <span className="clip-key">{clip?.clipKey}</span>
      <span className="clip-meta">
        Q{clip?.quarter ?? '-'} • {clip?.playType ?? '-'} • {clip?.gainYard ?? 0}yd
      </span>
    </button>
  </li>
);

export default function HighlightPage() {
  const navigate = useNavigate();
  const { token, isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // { [gameKey]: Array<ClipObj> }
  const [byGame, setByGame] = useState({});
  const [selectedGameKey, setSelectedGameKey] = useState(null);

  const role = (user?.role || '').toLowerCase();
  const isCoach = role === 'coach' || user?.isCoach === true || user?.accessLevel === 'team';

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

        // 역할에 따라 API
        const rowsRaw = isCoach
          ? await getCoachHighlights(token)
          : await getPlayerHighlights(token);

        // 서버 응답 모양: { accessLevel, data: [...] } or 그냥 배열
        const base = Array.isArray(rowsRaw?.data) ? rowsRaw.data
                   : Array.isArray(rowsRaw) ? rowsRaw
                   : [];

        // clip만 꺼내고 gameKey 달아주기 + 중복 제거
        const seen = new Set();
        const clips = base.map((r) => {
          const clip = r?.clip && typeof r.clip === 'object' ? r.clip : r;
          const gameKey = r?.gameKey ?? clip?.gameKey ?? 'UNKNOWN_GAME';
          if (!clip?.clipKey) return null;
          const key = `${gameKey}::${clip.clipKey}`;
          if (seen.has(key)) return null;
          seen.add(key);
          return { ...clip, gameKey };
        }).filter(Boolean);

        // gameKey별 그룹핑
        const grouped = clips.reduce((acc, c) => {
          (acc[c.gameKey] ||= []).push(c);
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
  }, [isAuthenticated, token, isCoach]);

  const gameList = useMemo(
    () => Object.keys(byGame).map((k) => ({ gameKey: k, count: byGame[k]?.length ?? 0 })),
    [byGame]
  );

  const totalHighlights = useMemo(
    () => Object.values(byGame).reduce((sum, arr) => sum + (arr?.length ?? 0), 0),
    [byGame]
  );

  const clipsForSelected = useMemo(
    () => (selectedGameKey ? (byGame[selectedGameKey] || []) : []),
    [selectedGameKey, byGame]
  );

  const goVideo = (clipKey) => {
    const g = encodeURIComponent(selectedGameKey || '');
    const c = encodeURIComponent(clipKey || '');
    navigate(`/video?gameKey=${g}&clipKey=${c}`);
  };

  // --- 렌더링 ---
  if (loading) return <p className="highlight-loading">불러오는 중…</p>;

  if (error)
    return (
      <div className="highlight-error-wrap">
        <p className="highlight-error" role="alert">⚠ {error}</p>
        <button type="button" onClick={() => navigate(-1)}>닫기</button>
      </div>
    );

  if (totalHighlights === 0) {
    return <HighlightModal onClose={() => navigate(-1)} />;
  }

  return (
    <div className="highlight-page">
      <div className="highlight-header">
        <h2>{isCoach ? '코치 하이라이트' : '선수 하이라이트'}</h2>
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

          {clipsForSelected.length === 0 ? (
            <HighlightModal onClose={() => null} />
          ) : (
            <ul className="clip-list">
              {clipsForSelected.map((clip) => (
                <ClipItem
                  key={`${clip.gameKey}-${clip.clipKey}`}
                  clip={clip}
                  onClick={() => goVideo(clip.clipKey)}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
