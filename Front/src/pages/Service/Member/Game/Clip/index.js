// src/pages/Service/Member/Game/Clip/index.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import './ClipPage.css';
import { TEAMS, TEAM_BY_ID } from '../../../../../data/TEAMS';
import { useClipFilter } from '../../../../../hooks/useClipFilter';
import UploadVideoModal from '../../../../../components/UploadVideoModal';
import defaultLogo from '../../../../../assets/images/logos/Stechlogo.svg';
import { useAuth } from '../../../../../context/AuthContext';
import { fetchTeamStatsByKey } from '../../../../../api/teamAPI';
import { fetchGameClips } from '../../../../../api/gameAPI';

/* ========== 공용 드롭다운 (이 페이지 내부 구현) ========== */
function Dropdown({ label, summary, isOpen, onToggle, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose?.();
      }
    };

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', onClickOutside);
      document.addEventListener('keydown', onKey);
    }

    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose, isOpen]); // isOpen 의존성 추가

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  return (
    <div className="ff-dropdown" ref={ref}>
      <button
        type="button"
        className={`ff-dd-btn ${isOpen ? 'open' : ''}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={handleToggle}
      >
        <span className="ff-dd-label">{summary || label}</span>
        <span className="ff-dd-icon">▾</span>
      </button>
      {isOpen && (
        <div className="ff-dd-menu" role="menu">
          {children}
        </div>
      )}
    </div>
  );
}

export const PT_LABEL = {
  RUN: '런',
  PASS: '패스',
  PUNT: '펀트',
  FG: 'FG',
  SACK: '색',
  NOPASS: '패스',
};

const SIGNIFICANT_PLAYS = {
  TOUCHDOWN: '터치다운',
  TWOPTCONVGOOD: '2PT 성공',
  TWOPTCONVNOGOOD: '2PT 실패',
  //PAT
  PATGOOD: 'PAT 성공',
  PATNOGOOD: 'PAT 실패',
  //FG
  FIELDGOALGOOD: 'FG 성공',
  FIELDGOALNOGOOD: 'FG 실패',
  'PENALTY.OFF': '공격팀 페널티',
  'PENALTY.DEF': '수비팀 페널티',
  SACK: '색',
  TFL: 'TFL',
  FUMBLE: '펌블',
  FUMBLERECOFF: '공격팀 리커버리',
  FUMBLERECDEF: '수비팀 리커버리',
  INTERCEPT: '인터셉트',
  TURNOVER: '턴오버',
  SAFETY: '세이프티',
};
const OPPOSITES = {
  '2PT 성공': '2PT 실패',
  '2PT 실패': '2PT 성공',
  'PAT 성공': 'PAT 실패',
  'PAT 실패': 'PAT 성공',
  'FG 성공': 'FG 실패',
  'FG 실패': 'FG 성공',
  '공격팀 페널티': '수비팀 페널티',
  '수비팀 페널티': '공격팀 페널티',
  '홈팀 페널티': '원정팀 페널티',
  '원정팀 페널티': '홈팀 페널티',
  '공격팀 리커버리': '수비팀 리커버리',
  '수비팀 리커버리': '공격팀 리커버리',
};

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

/* ========== 메인 컴포넌트 ========== */
export default function ClipPage() {
  const { gameKey: gameKeyParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [teamStats, setTeamStats] = useState(null); // {home, away}
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  const MY_TEAM_ID = user?.teamName || user?.team;

  const selfTeam = useMemo(
    () => (MY_TEAM_ID ? TEAM_BY_ID[MY_TEAM_ID] : null) || TEAMS[0] || null,
    [MY_TEAM_ID],
  );
  const logoSrc = selfTeam?.logo || defaultLogo;
  const label = selfTeam?.name || 'Choose Team';

  /* 업로드 모달 상태 */
  const [showUpload, setShowUpload] = useState(false);

  const gameFromState = location.state?.game || null;

  const resolvedGameKey = useMemo(
    () => gameFromState?.gameKey || gameKeyParam || null,
    [gameFromState?.gameKey, gameKeyParam],
  );

  const [game, setGame] = useState(gameFromState);

  useEffect(() => {
    if (!resolvedGameKey) {
      setStatsLoading(false);
      return;
    }

    // AbortController를 사용하여 클린업을 더 안전하게 처리합니다.
    const controller = new AbortController();
    const { signal } = controller;

    const fetchGameData = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const stats = await fetchTeamStatsByKey(resolvedGameKey, { signal });

        // signal.aborted 체크로 컴포넌트 언마운트 후의 상태 업데이트를 방지합니다.
        if (!signal.aborted) {
          setTeamStats({
            home: normalizeTeamStats(stats.home),
            away: normalizeTeamStats(stats.away),
          });
          // API 응답으로 game 상태도 함께 업데이트하여 데이터 일관성을 유지합니다.
          setGame((prevGame) => ({
            ...prevGame, // 기존에 gameKey 등 다른 정보가 있다면 유지
            home: stats.home?.teamName,
            away: stats.away?.teamName,
            // API가 제공하는 다른 게임 정보도 여기에 추가할 수 있습니다.
          }));
        }
      } catch (err) {
        if (!signal.aborted) {
          console.error('Failed to fetch game stats:', err);
          setStatsError(err);
        }
      } finally {
        if (!signal.aborted) {
          setStatsLoading(false);
        }
      }
    };

    fetchGameData();

    // 클린업 함수: 컴포넌트가 언마운트되거나 gameKey가 바뀌면 API 요청을 취소합니다.
    return () => {
      controller.abort();
    };
  }, [resolvedGameKey]); // gameKey가 변경될 때마다 이 effect를 다시 실행합니다.

  // 드롭다운 상태
  const [openMenu, setOpenMenu] = useState(null); // 'team'|'quarter'|'playType'|'significant'|null
  const closeAll = () => setOpenMenu(null);

  const handleMenuToggle = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };
  const homeMeta = TEAM_BY_ID[game.homeId];
  const awayMeta = TEAM_BY_ID[game.awayId];

  // 홈/원정 → 팀 드롭다운 옵션
  const teamOptions = useMemo(() => {
    const home = homeMeta;
    const away = awayMeta;
    const arr = [];
    if (home?.name)
      arr.push({ value: home.name, label: home.name, logo: home.logo });
    if (away?.name)
      arr.push({ value: away.name, label: away.name, logo: away.logo });
    // 중복 제거
    return arr.filter(
      (v, i, a) => a.findIndex((x) => x.value === v.value) === i,
    );
  }, [homeMeta, awayMeta]);

  const SPECIAL_DOWN_MAP = {
    TPT: '2PT',
    KICKOFF: '킥오프',
    PAT: 'PAT',
  };

  const ordinal = (n) => {
    const num = Number(n);
    if (!Number.isFinite(num)) return '';
    const sfx = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return `${num}${sfx[(v - 20) % 10] || sfx[v] || sfx[0]}`;
  };

  const getDownDisplay = (c) => {
    const pt = String(c.playType || '')
      .trim()
      .toUpperCase();
    const downRaw = c.down;
    const downStr = downRaw != null ? String(downRaw).trim().toUpperCase() : '';

    // 1) down 값이 특수 문자열이면 그 라벨만 표시 (야드투고 X)
    if (SPECIAL_DOWN_MAP[downStr]) return SPECIAL_DOWN_MAP[downStr];

    // 2) playType으로도 특수 플레이라면 라벨만 표시
    if (SPECIAL_DOWN_MAP[pt]) return SPECIAL_DOWN_MAP[pt];

    // 3) 일반 다운: "1st & ytg" / "2nd & ytg" ...
    const d =
      typeof downRaw === 'number'
        ? downRaw
        : Number.isFinite(parseInt(downStr, 10))
        ? parseInt(downStr, 10)
        : null;

    if (d != null) {
      const ytg =
        c.yardsToGo != null && Number.isFinite(Number(c.yardsToGo))
          ? Number(c.yardsToGo)
          : null;
      // yardsToGo가 없으면 "& ..." 생략
      return ytg != null ? `${ordinal(d)} & ${ytg}` : `${ordinal(d)}`;
    }

    // 다운 정보가 없으면 빈값/대시 등
    return '';
  };

  const [rawClips, setRawClips] = useState([]);
  const [clipsLoading, setClipsLoading] = useState(false);
  const [clipsError, setClipsError] = useState(null);
  useEffect(() => {
    if (!resolvedGameKey) return;

    let abort = false;
    setClipsLoading(true);
    setClipsError(null);

    fetchGameClips(resolvedGameKey)
      .then((clipsData) => {
        if (abort) return;

        const transformedClips = clipsData.map((clip, idx) => {
          const clipKey = String(clip.clipKey ?? clip.id ?? idx); // 도메인 식별자(필수)
          const uiId = `${clipKey}__${idx}`; // 렌더용 유니크 id
          const significantPlaysRaw =
            clip.significantPlays?.filter((p) => p != null) || [];
          const displaySignificantPlays = significantPlaysRaw.map(
            (token) =>
              labelSignificant(clip, token, homeMeta?.name, awayMeta?.name), // homeMeta와 awayMeta의 name을 전달
          );
          return {
            // 식별자들
            id: uiId,
            clipKey,
            playIndex: clip.playIndex ?? idx,

            // 데이터
            quarter: clip.quarter,
            playType: clip.playType,
            down: clip.down,
            yardsToGo: clip.toGoYard,
            offensiveTeam: clip.offensiveTeam,
            gainYard: clip.gainYard,
            clipUrl: clip.clipUrl || null,
            significantPlay: significantPlaysRaw, // 원본 데이터
            displaySignificantPlays: displaySignificantPlays, // 새로 추가된 UI용 라벨 배열
          };
        });
        setRawClips(transformedClips);
      })
      .catch((err) => {
        if (!abort) {
          console.error('클립 데이터 조회 오류:', err);
          setClipsError(err);
        }
      })
      .finally(() => {
        if (!abort) setClipsLoading(false);
      });

    return () => {
      abort = true;
    };
  }, [resolvedGameKey]);

  /* ========== 훅 사용 (필터/클립/요약/초기화/네비) ========== */
  const persistKey = `clipFilters:${
    game?.gameKey || resolvedGameKey || 'default'
  }`;
  const {
    filters,
    setFilters,
    summaries,
    activeFilters,
    clips,
    handleFilterChange,
    removeFilter,
    clearAllFilters,
    buildPlayerNavState,
  } = useClipFilter({
    persistKey,
    rawClips,
    teamOptions,
    opposites: OPPOSITES,
    significantPlayField: 'displaySignificantPlays',
  });

  /* 버튼 요약 텍스트 */
  const teamSummary = summaries.team;
  const quarterSummary = summaries.quarter;
  const playTypeSummary = filters.playType
    ? PT_LABEL[filters.playType]
    : '유형';
  const significantSummary = summaries.significant;
  const clearSignificant = () =>
    setFilters((prev) => ({ ...prev, significantPlay: [] }));

  /* 리스트 클릭 → 비디오 플레이어로 이동 */
  const onClickClip = (c) => {
    // navigate 함수의 state 객체에 더 많은 정보를 담아서 전달합니다.
    navigate('/service/video', {
      state: {
        // 1. 필터링에 필요한 원본 데이터 전달
        rawClips: rawClips,
        initialFilters: filters,
        teamOptions: teamOptions,

        // 2. 비디오 플레이어 UI 구성에 필요한 정보 전달
        initialPlayId: String(c.clipKey),
        initialPlayIndex: c.playIndex, // (선택) clipKey 중복 대비
        clipKey: c.clipKey,
        gameKey: resolvedGameKey,
        teamMeta: {
          homeName: homeMeta?.name,
          awayName: awayMeta?.name,
          homeLogo: homeMeta?.logo,
          awayLogo: awayMeta?.logo,
        },
      },
    });
  };
  const getPenaltyLabel = (c, key, homeName, awayName) => {
    const offenseIsHome = c?.offensiveTeam === 'Home';

    const penalizedIsHome = key.endsWith('.HOME');

    if (key.endsWith('.OFF')) return '공격팀 페널티';
    if (key.endsWith('.DEF')) return '수비팀 페널티';
    
    // PENALTY.HOME/AWAY 형식 처리 - 실제 팀 이름 사용
    if (key === 'PENALTY.HOME') return `${homeName} 페널티`;
    if (key === 'PENALTY.AWAY') return `${awayName} 페널티`;

    // penalizedIsHome과 offenseIsHome이 같으면 공격팀 페널티
    return penalizedIsHome === offenseIsHome
      ? '공격팀 페널티'
      : '수비팀 페널티';
  };

  const labelSignificant = (c, token, homeDisplay, awayDisplay) => {
    const raw = (token ?? '').toString().trim();
    if (!raw) return '';
    const key = raw.toUpperCase();

    if (key.startsWith('PENALTY.')) {
      return getPenaltyLabel(c, key, homeDisplay, awayDisplay);
    }

    if (Object.prototype.hasOwnProperty.call(SIGNIFICANT_PLAYS, key)) {
      const mapped = SIGNIFICANT_PLAYS[key];
      return mapped === '' ? key : mapped;
    }
    return key;
  };
  const renderPlayType = (v) => {
    const pt = (v ?? '').toString().trim().toUpperCase();
    if (pt === 'NONE' || !pt) {
      return null;
    }

    const label = PT_LABEL[pt]; // PT_LABEL에서 라벨을 조회

    // 조회된 라벨이 있을 경우에만 #을 붙여서 반환
    return label ? `#${label}` : null;
  };

  return (
    <div className="clip-root">
      {/* ===== 헤더 ===== */}
      <header className="stechHeader">
        <div className="headerContainer">
          {/* 왼쪽: 내 팀 고정 */}
          <div className="header-team-box">
            <div className="header-team-logo-box">
              <img
                src={logoSrc}
                alt={label}
                className={`header-team-logo-img ${
                  logoSrc?.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                }`}
              />
            </div>
            <span className="header-team-name">{label}</span>
          </div>

          {/* 오른쪽: 필터 + 업로드 */}
          <div className="bottomRow">
            <div className="filterGroup">
              <div className="ff-bar">
                {/* TEAM */}
                <Dropdown
                  label="공격팀"
                  summary={teamSummary}
                  isOpen={openMenu === 'team'}
                  onToggle={() => handleMenuToggle('team')}
                  onClose={closeAll}
                >
                  <button
                    className={`ff-dd-item ${!filters.team ? 'selected' : ''}`}
                    onClick={() => {
                      handleFilterChange('team', null);
                      closeAll();
                    }}
                  >
                    전체
                  </button>
                  {teamOptions.map((opt) => (
                    <button
                      key={opt.value}
                      className={`ff-dd-item ${
                        filters.team === opt.value ? 'selected' : ''
                      }`}
                      onClick={() => {
                        handleFilterChange('team', opt.value);
                        closeAll();
                      }}
                    >
                      {opt.logo && (
                        <img className="ff-dd-avatar" src={opt.logo} alt="" />
                      )}
                      {opt.label || opt.value}
                    </button>
                  ))}
                </Dropdown>

                {/* QUARTER */}
                <Dropdown
                  label="쿼터"
                  summary={quarterSummary}
                  isOpen={openMenu === 'quarter'}
                  onToggle={() => handleMenuToggle('quarter')}
                  onClose={closeAll}
                >
                  <button
                    className={`ff-dd-item ${
                      !filters.quarter ? 'selected' : ''
                    }`}
                    onClick={() => {
                      handleFilterChange('quarter', null);
                      closeAll();
                    }}
                  >
                    전체
                  </button>
                  {[1, 2, 3, 4].map((q) => (
                    <button
                      key={q}
                      className={`ff-dd-item ${
                        filters.quarter === q ? 'selected' : ''
                      }`}
                      onClick={() => {
                        handleFilterChange('quarter', q);
                        closeAll();
                      }}
                    >
                      Q{q}
                    </button>
                  ))}
                </Dropdown>

                {/* PLAY TYPE */}
                <Dropdown
                  label="유형"
                  summary={playTypeSummary}
                  isOpen={openMenu === 'playType'}
                  onToggle={() => handleMenuToggle('playType')}
                  onClose={closeAll}
                >
                  <button
                    className={`ff-dd-item ${
                      !filters.playType ? 'selected' : ''
                    }`}
                    onClick={() => {
                      handleFilterChange('playType', null);
                      closeAll();
                    }}
                  >
                    전체
                  </button>
                  {Object.entries(PT_LABEL).map(([code, label]) => (
                    <button
                      key={code}
                      className={`ff-dd-item ${
                        filters.playType === code ? 'selected' : ''
                      }`}
                      onClick={() => {
                        handleFilterChange('playType', code);
                        closeAll();
                      }}
                    >
                      {PT_LABEL[code] || code}
                    </button>
                  ))}
                </Dropdown>

                {/* SIGNIFICANT (다중선택) */}
                <Dropdown
                  label="중요플레이"
                  summary={significantSummary}
                  isOpen={openMenu === 'significant'}
                  onToggle={() => handleMenuToggle('significant')}
                  onClose={closeAll}
                >
                  <div className="ff-dd-section">
                    {Object.values(SIGNIFICANT_PLAYS).map((label) => {
                      const selected =
                        Array.isArray(filters.significantPlay) &&
                        filters.significantPlay.includes(label);
                      return (
                        <button
                          key={label}
                          className={`ff-dd-item ${selected ? 'selected' : ''}`}
                          onClick={() =>
                            handleFilterChange('significantPlay', label)
                          }
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="ff-dd-actions">
                    <button className="ff-dd-clear" onClick={clearSignificant}>
                      모두 해제
                    </button>
                    <button className="ff-dd-close" onClick={closeAll}>
                      닫기
                    </button>
                  </div>
                </Dropdown>

                {/* RESET */}
                <button
                  type="button"
                  className="resetButton"
                  onClick={clearAllFilters}
                >
                  초기화
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 업로드 모달 */}
        <UploadVideoModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            setShowUpload(false);
            // TODO: 업로드 후 목록 갱신
          }}
        />
      </header>

      {/* ===== 본문 ===== */}
      <div className="clip-page-container">
        <div className="clip-left">
          <div className="clip-header">
            <div className="clip-team left">
              {homeMeta?.logo && (
                <div className="clip-team-logo">
                  <img
                    src={homeMeta.logo}
                    alt={`${homeMeta.name} 로고`}
                    className={`clip-team-logo-img ${
                      homeMeta.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                    }`}
                  />
                </div>
              )}
              <span className="clip-team-name">{homeMeta?.name}</span>
            </div>

            <div className="clip-vs">VS</div>

            <div className="clip-team right">
              {awayMeta?.logo && (
                <div className="clip-team-logo">
                  <img
                    src={awayMeta.logo}
                    alt={`${awayMeta.name} 로고`}
                    className={`clip-team-logo-img ${
                      awayMeta.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                    }`}
                  />
                </div>
              )}
              <span className="clip-team-name">{awayMeta?.name}</span>
            </div>
          </div>
          <div className="clip-list">
            {clips.map((c, index) => {
              const safeKey = c.id ?? `${c.clipKey ?? 'noid'}__${index}`;
              return (
                <div
                  key={safeKey}
                  className="clip-row"
                  onClick={() => onClickClip(c)}
                >
                  <div className="quarter-name">
                    <div>{c.quarter}Q</div>
                  </div>

                  <div className="clip-rows">
                    <div className="clip-row1">
                      <div className="clip-down">{getDownDisplay(c)}</div>

                      <div className="clip-type">
                        {renderPlayType(c.playType)}
                      </div>
                    </div>

                    <div className="clip-row2">
                      <div className="clip-oT">
                        {c.offensiveTeam == 'Home'
                          ? `${homeMeta?.name}`
                          : `${awayMeta?.name}`}
                      </div>

                      {Array.isArray(c.displaySignificantPlays) &&
                      c.displaySignificantPlays.length > 0 ? (
                        <div className="clip-sig">
                          {c.displaySignificantPlays.map((label, idx) => (
                            <span key={`${safeKey}-sig-${idx}`}># {label}</span>
                          ))}
                        </div>
                      ) : (
                        <div className="clip-sig" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {clips.length === 0 && (
              <div className="empty">일치하는 플레이가 없습니다.</div>
            )}
          </div>
        </div>
        <div className="clip-data">
          {teamStats && !statsLoading && (
            <div className="clip-playcall">
              <div className="clip-playcall-header">플레이콜 비율</div>
              <div className="clip-playcall-content">
                <div className="playcall-team">
                  <div className="playcall-team-name">{homeMeta.name}</div>
                  <div className="pc-run">
                    <div className="pc-row1">
                      <div>런</div>
                      <div>
                        {teamStats.home?.playCallRatio?.runPercentage ?? 0}%
                      </div>
                    </div>
                    <div className="pc-row2">
                      <div
                        className="bar bar-run"
                        style={{
                          width: `${
                            teamStats.home?.playCallRatio?.runPercentage ?? 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="pc-pass">
                    <div className="pc-row1">
                      <div>패스</div>
                      <div>
                        {teamStats.home?.playCallRatio?.passPercentage ?? 0}%
                      </div>
                    </div>
                    <div className="pc-row2">
                      <div
                        className="bar bar-pass"
                        style={{
                          width: `${
                            teamStats.home?.playCallRatio?.passPercentage ?? 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="playcall-team">
                  <div className="playcall-team-name">{awayMeta.name}</div>
                  <div className="pc-run">
                    <div className="pc-row1">
                      <div>런</div>
                      <div>
                        {teamStats.away?.playCallRatio?.runPercentage ?? 0}%
                      </div>
                    </div>
                    <div className="pc-row2">
                      <div
                        className="bar bar-run"
                        style={{
                          width: `${
                            teamStats.away?.playCallRatio?.runPercentage ?? 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="pc-pass">
                    <div className="pc-row1">
                      <div>패스</div>
                      <div>
                        {teamStats.away?.playCallRatio?.passPercentage ?? 0}%
                      </div>
                    </div>
                    <div className="pc-row2">
                      <div
                        className="bar bar-pass"
                        style={{
                          width: `${
                            teamStats.away?.playCallRatio?.passPercentage ?? 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="clip-teamstats">
            <div className="tsc-header">
              <div className="tsc-team tsc-left">
                {homeMeta?.logo && (
                  <img
                    className="tsc-logo"
                    src={homeMeta.logo}
                    alt={homeMeta?.name}
                  />
                )}
                <span className="tsc-pill">
                  {homeMeta?.name || teamStats?.home?.teamName || '홈팀'}
                </span>
              </div>
              <div className="tsc-team tsc-right">
                {awayMeta?.logo && (
                  <img
                    className="tsc-logo"
                    src={awayMeta.logo}
                    alt={awayMeta?.name}
                  />
                )}
                <span className="tsc-pill">
                  {awayMeta?.name || teamStats?.away?.teamName || '원정팀'}
                </span>
              </div>
            </div>

            {statsLoading && (
              <div className="tsc-loading">팀 스탯 불러오는 중…</div>
            )}
            {statsError && !statsLoading && (
              <div className="tsc-error">팀 스탯을 불러올 수 없어요.</div>
            )}

            {teamStats && !statsLoading && (
              <>
                <div className="tsc-row">
                  <div>{teamStats.home.totalYards}</div>
                  <div className="tsc-label">총 야드</div>
                  <div>{teamStats.away.totalYards}</div>
                </div>
                <div className="tsc-row">
                  <div>{teamStats.home.passingYards}</div>
                  <div className="tsc-label">패싱 야드</div>
                  <div>{teamStats.away.passingYards}</div>
                </div>
                <div className="tsc-row">
                  <div>{teamStats.home.rushingYards}</div>
                  <div className="tsc-label">러싱 야드</div>
                  <div>{teamStats.away.rushingYards}</div>
                </div>
                <div className="tsc-row">
                  <div>{teamStats.home.thirdDownPct}%</div>
                  <div className="tsc-label">3rd Down %</div>
                  <div>{teamStats.away.thirdDownPct}%</div>
                </div>
                <div className="tsc-row">
                  <div>{teamStats.home.turnovers}</div>
                  <div className="tsc-label">턴오버</div>
                  <div>{teamStats.away.turnovers}</div>
                </div>
                <div className="tsc-row">
                  <div>{teamStats.home.penaltyYards}</div>
                  <div className="tsc-label">페널티 야드</div>
                  <div>{teamStats.away.penaltyYards}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
