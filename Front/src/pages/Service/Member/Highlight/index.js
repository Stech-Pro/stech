// src/pages/Service/HighlightPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import {
  getPlayerHighlights,
  getCoachHighlights,
} from '../../../../api/gameAPI';
import HighlightModal from '../../../../components/HighlightModal';
import { TEAMS, TEAM_BY_ID } from '../../../../data/TEAMS';
import { fetchTeamStatsByKey } from '../../../../api/teamAPI';

const normalizeTeamStats = (s) => {
  if (!s) {
    return {
      teamName: '',
      totalYards: 0,
      passingYards: 0,
      rushingYards: 0,
      thirdDownPct: 0,
      turnovers: 0,
      penaltyYards: 0,
      playCallRatio: {
        runPlays: 0,
        passPlays: 0,
        runPercentage: 0,
        passPercentage: 0,
      },
    };
  }
  return {
    teamName: s.teamName ?? '',
    totalYards: s.totalYards ?? 0,
    passingYards: s.passingYards ?? s.passYards ?? 0,
    rushingYards: s.rushingYards ?? s.rushYards ?? 0,
    thirdDownPct: s.thirdDownStats?.percentage ?? 0,
    turnovers: s.turnovers ?? 0,
    penaltyYards: s.penaltyYards ?? 0,
    playCallRatio: s.playCallRatio || {
      runPlays: s.runPlays ?? 0,
      passPlays: s.passPlays ?? 0,
      runPercentage: s.runPercentage ?? 0,
      passPercentage: s.passPercentage ?? 0,
    },
  };
};

// GameItem.jsx (동일 파일 내에 있으면 그대로 대체)
const GameItem = ({ gameKey, count, active, onClick, myTeamName, onStats }) => {
  const [teamStats, setTeamStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    if (!gameKey) return;

    const controller = new AbortController();
    const { signal } = controller;

    const run = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);

        const raw = await fetchTeamStatsByKey(gameKey, { signal });
        if (signal.aborted) return;

        const home = normalizeTeamStats(raw?.home);
        const away = normalizeTeamStats(raw?.away);

        // 내 팀 스탯만 선택
        let mine = null;
        if (home.teamName && home.teamName === myTeamName) mine = home;
        else if (away.teamName && away.teamName === myTeamName) mine = away;

        setTeamStats(mine);
        // 부모에도 저장 (게임키별로 모으기 위함)
        onStats?.(gameKey, mine);
      } catch (e) {
        if (!signal.aborted) {
          console.error('Error fetching team stats:', e);
          setStatsError(e);
          setTeamStats(null);
          onStats?.(gameKey, null);
        }
      } finally {
        if (!signal.aborted) setStatsLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [gameKey, myTeamName, onStats]);

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={active ? 'active' : ''}
        aria-pressed={active}
      >
        <div className="game-row">
          <span className="game-key">{gameKey}</span>
          <span className="game-count">하이라이트 {count}개</span>
        </div>

        {statsLoading && (
          <div className="game-stat small">스탯 불러오는 중…</div>
        )}
        {statsError && <div className="game-stat small">스탯 오류</div>}

        {teamStats && (
          console.log('Rendering teamStats:', teamStats) || ( 
          <div className="game-stat small">
            <span>{teamStats.teamName}</span>
            <span> • 총야드 {teamStats.totalYards}</span>
            <span> • 패스 {teamStats.passingYards}</span>
            <span> • 러시 {teamStats.rushingYards}</span>
            <span> • 3rd {teamStats.thirdDownPct}%</span>
            <span> • TO {teamStats.turnovers}</span>
            <span> • 페널티 {teamStats.penaltyYards}야드</span>
          </div>
          )
        )}
      </button>
    </li>
  );
};

const ClipItem = ({ clip, onClick }) => (
  <li>
    <button type="button" onClick={onClick} title={clip?.clipKey}>
      <span className="clip-key">{clip?.clipKey}</span>
      <span className="clip-meta">
        Q{clip?.quarter ?? '-'} • {clip?.playType ?? '-'} •{' '}
        {clip?.gainYard ?? 0}yd
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
  const isCoach =
    role === 'coach' || user?.isCoach === true || user?.accessLevel === 'team';

  const MY_TEAM_ID = user?.team || user?.teamName;
  const selfTeam = useMemo(
    () => (MY_TEAM_ID ? TEAM_BY_ID[MY_TEAM_ID] : null) || TEAMS[0] || null,
    [MY_TEAM_ID],
  );
  const logoSrc = selfTeam?.logo;
  const [myTeamStatsByGame, setMyTeamStatsByGame] = useState({});
  const handleStats = useCallback((gameKey, stat) => {
    setMyTeamStatsByGame((prev) => ({ ...prev, [gameKey]: stat }));
  }, []);
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
        const base = Array.isArray(rowsRaw?.data)
          ? rowsRaw.data
          : Array.isArray(rowsRaw)
          ? rowsRaw
          : [];

        // clip만 꺼내고 gameKey 달아주기 + 중복 제거
        const seen = new Set();
        const clips = base
          .map((r) => {
            const clip = r?.clip && typeof r.clip === 'object' ? r.clip : r;
            const gameKey = r?.gameKey ?? clip?.gameKey ?? 'UNKNOWN_GAME';
            if (!clip?.clipKey) return null;
            const key = `${gameKey}::${clip.clipKey}`;
            if (seen.has(key)) return null;
            seen.add(key);
            return { ...clip, gameKey };
          })
          .filter(Boolean);

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

    return () => {
      alive = false;
    };
  }, [isAuthenticated, token, isCoach]);

  const gameList = useMemo(
    () =>
      Object.keys(byGame).map((k) => ({
        gameKey: k,
        count: byGame[k]?.length ?? 0,
      })),
    [byGame],
  );

  const totalHighlights = useMemo(
    () =>
      Object.values(byGame).reduce((sum, arr) => sum + (arr?.length ?? 0), 0),
    [byGame],
  );

  const clipsForSelected = useMemo(
    () => (selectedGameKey ? byGame[selectedGameKey] || [] : []),
    [selectedGameKey, byGame],
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
        <p className="highlight-error" role="alert">
          ⚠ {error}
        </p>
        <button type="button" onClick={() => navigate(-1)}>
          닫기
        </button>
      </div>
    );

  if (totalHighlights === 0) {
    return <HighlightModal onClose={() => navigate(-1)} />;
  }

  return (
    <div className="highlight-page">
      <header className="stechHeader">
        <div className="headerContainer">
          {/* 왼쪽: 내 팀 */}
          <div className="header-team-box">
            <div className="header-team-logo-box">
              <img
                src={logoSrc}
                alt={selfTeam?.name || '팀 로고'}
                className={`header-team-logo-img ${
                  logoSrc?.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                }`}
              />
            </div>
            <span className="header-team-name">{selfTeam?.name}</span>
          </div>
        </div>
      </header>

      <div className="highlight-content">
        <section className="game-section">
          <ul className="game-list">
            {gameList.map((g) => (
              <GameItem
                key={g.gameKey}
                gameKey={g.gameKey}
                count={g.count}
                active={g.gameKey === selectedGameKey}
                onClick={() => setSelectedGameKey(g.gameKey)}
                myTeamName={selfTeam?.name} // 🔹 내 팀 이름 전달
                onStats={handleStats}
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
