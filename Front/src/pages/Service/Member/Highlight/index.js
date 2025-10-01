// src/pages/Service/HighlightPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { getPlayerHighlights, getCoachHighlights } from '../../../../api/gameAPI';
import HighlightModal from '../../../../components/HighlightModal';
import { TEAMS, TEAM_BY_ID } from '../../../../data/TEAMS';
import { fetchTeamStatsByKey } from '../../../../api/teamAPI';
import './HighlightPage.css';

// === 디버그 가능한 썸네일 비디오 (drop-in) ===
function VideoThumb({ src, alt = '썸네일' }) {
  const ref = React.useRef(null);
  const [state, setState] = React.useState({
    ready: false,
    error: null,
    lastEvt: 'init',
  });

  React.useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;

    let raf = null;
    let tm = null;
    let done = false;

    const finish = (why) => {
      if (done) return;
      done = true;
      setState((s) => ({ ...s, ready: true, lastEvt: why || s.lastEvt }));
      try { v.pause(); } catch {}
      if (raf) cancelAnimationFrame(raf);
      if (tm) clearTimeout(tm);
    };

    // 3초 안전망: 어떤 이벤트도 못 받으면 강제로 표시
    tm = setTimeout(() => finish('timeout-3s'), 3000);

    const tag = (name) => {
      setState((s) => ({ ...s, lastEvt: name }));
      // 이벤트 로그 (필요하면 끄기)
      // eslint-disable-next-line no-console
      console.log(`[VideoThumb] ${name}`, { src });
    };

    const onPlaying = () => { tag('playing'); raf = requestAnimationFrame(() => finish('playing')); };
    const onCanPlay = () => { tag('canplay'); raf = requestAnimationFrame(() => finish('canplay')); };
    const onLoadedData = () => { tag('loadeddata'); raf = requestAnimationFrame(() => finish('loadeddata')); };
    const onLoadedMeta = () => {
      tag('loadedmetadata');
      try {
        const seekTo = Math.min(0.8, (v.duration || 1) - 0.05);
        v.currentTime = seekTo;
      } catch {}
    };
    const onError = () => {
      const err = (v.error && v.error.message) || 'video error';
      tag(`error:${err}`);
      setState((s) => ({ ...s, error: err }));
      finish('error');
    };
    const onStalled = () => tag('stalled');
    const onSuspend = () => tag('suspend');
    const onWaiting = () => tag('waiting');

    // autoplay 시도
    Promise.resolve(v.play()).catch(() => {
      tag('autoplay-blocked');
      // autoplay가 막혀도 canplay/loadeddata가 오면 finish 처리됨
    });

    v.addEventListener('playing', onPlaying);
    v.addEventListener('canplay', onCanPlay);
    v.addEventListener('loadeddata', onLoadedData);
    v.addEventListener('loadedmetadata', onLoadedMeta);
    v.addEventListener('error', onError);
    v.addEventListener('stalled', onStalled);
    v.addEventListener('suspend', onSuspend);
    v.addEventListener('waiting', onWaiting);

    return () => {
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('canplay', onCanPlay);
      v.removeEventListener('loadeddata', onLoadedData);
      v.removeEventListener('loadedmetadata', onLoadedMeta);
      v.removeEventListener('error', onError);
      v.removeEventListener('stalled', onStalled);
      v.removeEventListener('suspend', onSuspend);
      v.removeEventListener('waiting', onWaiting);
      if (raf) cancelAnimationFrame(raf);
      if (tm) clearTimeout(tm);
      try { v.pause(); } catch {}
    };
  }, [src]);

  const { ready, error, lastEvt } = state;
  const cls = `thumb-wrap ${ready ? 'is-ready' : 'is-loading'} ${error ? 'has-error' : ''}`;

  return (
    <div className={cls} title={lastEvt}>
      {!ready && (
        <div className="thumb-skeleton">
          <div className="shimmer" />
        </div>
      )}
      {error && (
        <div className="thumb-error-badge">
          썸네일 오류
        </div>
      )}
      {/* NOTE: 항상 렌더. key로 강제 리로드 */}
      <video
        key={src}
        ref={ref}
        src={src}
        preload="metadata"
        muted
        autoPlay
        playsInline
        controls={false}
        aria-label={alt}
        className="thumb-video"
      />
    </div>
  );
}

function GameThumbnail({ clip, alt = '썸네일' }) {
  const src = clip?.clipUrl;
  if (!src) {
    return (
      <div className="thumb-wrap is-loading">
        <div className="thumb-skeleton"><div className="shimmer" /></div>
      </div>
    );
  }
  return <VideoThumb src={src} alt={alt} />;
}




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
  };
};

// GameItem.jsx (동일 파일 내에 있으면 그대로 대체)
const GameItem = ({
  gameKey,
  count,
  active,
  onClick,
  myTeamName,
  onStats,
  firstClip,
}) => {
  const [teamStats, setTeamStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [enemyName, setEnemyName] = useState('');

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
        if (home.teamName && home.teamName === myTeamName) {
          mine = home;
          setEnemyName(away.teamName);
        } else if (away.teamName && away.teamName === myTeamName) {
          mine = away;
          setEnemyName(home.teamName);
        }
        setTeamStats(mine);
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
          console.log('Rendering GameThumbnail with firstClip:', firstClip);
  return (
    <div className="game-item" onClick={onClick} role="button" tabIndex={0}>
      <div className="game-thumbanil">
        <div className="game-thumbnail-box">
          {/* 🔹 썸네일 */}

          {firstClip ? (
            <GameThumbnail clip={firstClip} alt={`${gameKey} 첫 클립 썸네일`} />
          ) : (
            <div className="game-thumb placeholder">
              <div className="shimmer" />
            </div>
          )}
        </div>
      </div>

      {statsLoading && <div className="game-stat small">스탯 불러오는 중…</div>}
      {statsError && <div className="game-stat small">스탯 오류</div>}

      {teamStats &&
        (console.log('Rendering teamStats:', teamStats) || (
          <div className="game-stat small">
            <div className="h-game-title">vs {enemyName}</div>
            <div className="h-stat-rows">
              <div className="h-row">
                <div className="h-label">총 야드</div>
                <div className="h-value">{teamStats.totalYards}</div>
              </div>
              <div className="h-row">
                <div className="h-label">패싱 야드</div>
                <div className="h-value">{teamStats.passingYards}</div>
              </div>
              <div className="h-row">
                <div className="h-label">러싱 야드</div>
                <div className="h-value">{teamStats.rushingYards}</div>
              </div>
              <div className="h-row">
                <div className="h-label">3rd Down %</div>
                <div className="h-value">{teamStats.thirdDownPct}%</div>
              </div>
              <div className="h-row">
                <div className="h-label">턴오버</div>
                <div className="h-value">{teamStats.turnovers}</div>
              </div>
              <div className="h-row">
                <div className="h-label">페널티 야드</div>
                <div className="h-value">{teamStats.penaltyYards}</div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

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
        firstClip: (byGame[k] && byGame[k][0]) || null,
      })),
    [byGame],
  );

  const totalHighlights = useMemo(
    () => Object.values(byGame).reduce((sum, arr) => sum + (arr?.length ?? 0), 0),
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
        <p className="highlight-error" role="alert">⚠ {error}</p>
        <button type="button" onClick={() => navigate(-1)}>닫기</button>
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
                className={`header-team-logo-img ${logoSrc?.endsWith('.svg') ? 'svg-logo' : 'png-logo'}`}
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
                myTeamName={MY_TEAM_ID}
                onStats={handleStats}
                firstClip={g.firstClip}
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
