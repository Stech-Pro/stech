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
import './HighlightPage.css';

function cloudinaryThumbFromVideo(url) {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('res.cloudinary.com')) return null;
    // /video/upload/(옵션)/.../file.mp4  →  /video/upload/(옵션)/.../file.jpg
    // 타임프레임: so_1 (1초 지점) - 필요에 따라 so_0.5 등 변경 가능
    const parts = u.pathname.split('/');
    const i = parts.findIndex((p) => p === 'upload');
    if (i === -1) return null;
    // 이미 변환 옵션이 있든 없든, so_1을 하나 추가
    if (parts[i + 1] && !parts[i + 1].includes('.')) {
      // 이미 옵션 존재 -> so_1 추가
      parts[i + 1] = `so_1,${parts[i + 1]}`;
    } else {
      // 옵션 없음 -> so_1 삽입
      parts.splice(i + 1, 0, 'so_1');
    }
    // 확장자 .mp4 → .jpg
    const last = parts[parts.length - 1];
    const dot = last.lastIndexOf('.');
    parts[parts.length - 1] =
      dot > 0 ? `${last.slice(0, dot)}.jpg` : `${last}.jpg`;
    u.pathname = parts.join('/');
    return u.toString();
  } catch {
    return null;
  }
}

// 비디오 프레임 캡처 → dataURL
async function captureFrameAsDataURL(videoUrl, timeSec = 0.5) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous'; // CORS 허용 서버여야 함
    video.preload = 'auto';
    video.muted = true; // 일부 브라우저 정책 우회
    video.src = videoUrl;

    const onError = () => {
      cleanup();
      reject(new Error('video load error'));
    };
    const onLoaded = () => {
      // 메타데이터 로드 후 시크
      const go = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 480;
          canvas.height = video.videoHeight || 270;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const url = canvas.toDataURL('image/jpeg', 0.8);
          cleanup();
          resolve(url);
        } catch (e) {
          cleanup();
          reject(e);
        }
      };
      const onSeeked = () => go();
      video.currentTime = Math.min(timeSec, (video.duration || 1) - 0.01);
      video.addEventListener('seeked', onSeeked, { once: true });
    };
    const cleanup = () => {
      video.removeEventListener('error', onError);
      video.removeEventListener('loadedmetadata', onLoaded);
      video.src = '';
      video.load();
    };

    video.addEventListener('error', onError);
    video.addEventListener('loadedmetadata', onLoaded, { once: true });
    // iOS 일부 환경에서 play()가 필요할 수 있으나, 썸네일 용도라 생략
  });
}

// 썸네일 렌더러: 1) clip.thumbnailUrl → 2) cloudinary 변환 → 3) 캡처
function GameThumbnail({ clip, alt = '썸네일' }) {
  const [src, setSrc] = React.useState(null);
  const [triedCapture, setTriedCapture] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      // 1) 명시적 썸네일
      if (clip?.thumbnailUrl) {
        if (alive) setSrc(clip.thumbnailUrl);
        return;
      }
      // 2) Cloudinary 변환
      const cloud = clip?.clipUrl
        ? cloudinaryThumbFromVideo(clip.clipUrl)
        : null;
      if (cloud) {
        if (alive) setSrc(cloud);
        return;
      }
      // 3) 클라이언트 캡처 (CORS 필요)
      try {
        const dataUrl = await captureFrameAsDataURL(clip?.clipUrl);
        if (alive) setSrc(dataUrl);
        setTriedCapture(true);
      } catch {
        if (alive) {
          setSrc(null);
          setTriedCapture(true);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [clip?.thumbnailUrl, clip?.clipUrl]);

  // 간단한 스켈레톤/플레이스홀더
  if (!src) {
    return (
      <div
        className="game-thumb placeholder"
        aria-label="thumbnail placeholder"
      >
        <div className="shimmer" />
        {!triedCapture && (
          <span className="visually-hidden">썸네일 생성 중…</span>
        )}
      </div>
    );
  }
  return <img className="game-thumb" src={src} alt={alt} loading="lazy" />;
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
        }
        else if (away.teamName && away.teamName === myTeamName) {
          mine = away;
          setEnemyName(home.teamName);
        }
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
    <div className="game-item">
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
            <div className='h-game-title'> vs {enemyName}</div>
            <div className='h-stat-rows'>
              <div className='h-row'>
                <div className='h-label'> 총 야드 </div>
                <div className='h-value'> {teamStats.totalYards} </div>
              </div>
              <div className='h-row'>
                <div className='h-label'> 패싱 야드 </div>
                <div className='h-value'> {teamStats.passingYards} </div>
              </div>
              <div className='h-row'>
                <div className='h-label'> 러싱 야드 </div>
                <div className='h-value'> {teamStats.rushingYards} </div>     
              </div>  
              <div className='h-row'> 
                <div className='h-label'> 3rd Down % </div>
                <div className='h-value'> {teamStats.thirdDownPct}% </div>     
              </div>
              <div className='h-row'>
                <div className='h-label'> 턴오버 </div>
                <div className='h-value'> {teamStats.turnovers} </div>     
              </div>
              <div className='h-row'>
                <div className='h-label'> 페널티 야드 </div>
                <div className='h-value'> {teamStats.penaltyYards} </div>     
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
        firstClip: (byGame[k] && byGame[k][0]) || null,
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
