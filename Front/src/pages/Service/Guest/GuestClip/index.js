import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
// import './ClipPage.css';
import { TEAMS } from '../../../../data/TEAMS';
import { GUEST_CLIPS } from '../../../../data/guestClips';

import { useClipFilter } from '../../../../hooks/useClipFilter';
import UploadVideoModal from '../../../../components/UploadVideoModal';
import defaultLogo from '../../../../assets/images/logos/Stechlogo.svg';
import { useAuth } from '../../../../context/AuthContext';

/* ========== 공용 드롭다운 ========== */
function Dropdown({ label, summary, isOpen, onToggle, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    if (isOpen) {
      document.addEventListener('mousedown', onClickOutside);
      document.addEventListener('keydown', onKey);
    }
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose, isOpen]);

  return (
    <div className="ff-dropdown" ref={ref}>
      <button
        type="button"
        className={`ff-dd-btn ${isOpen ? 'open' : ''}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
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

/* ========== 라벨 ========== */
export const PT_LABEL = {
  RUN: '런',
  PASS: '패스',
  KICKOFF: '킥오프',
  RETURN: '리턴',
  PUNT: '펀트',
  PAT: 'PAT',
  TPT: '2PT',
  FG: 'FG',
  SACK: '색',
  NOPASS: '패스 실패', // 데이터에 존재하므로 표기 추가
};

const PLAY_TYPES = {
  RUN: 'RUN',
  PASS: 'PASS',
  KICKOFF: 'KICKOFF',
  RETURN: 'RETURN',
  PUNT: 'PUNT',
  PAT: 'PAT',
  TWOPT: 'TWOPT',
  FIELDGOAL: 'FIELDGOAL',
  SACK: 'SACK',
  NOPASS: 'NOPASS',
};

/* 고정 라벨 — PENALTY.*는 동적으로 처리 (공/수 판단) */
const SIGNIFICANT_PLAYS = {
  TOUCHDOWN: '터치다운',
  'TWOPTCONV.GOOD': '2PT 성공',
  'TWOPTCONV.NOGOOD': '2PT 실패',
  PATGOOD: 'PAT 성공',
  PATNOGOOD: 'PAT 실패',
  FIELDGOALGOOD: 'FG 성공',
  FIELDGOALNOGOOD: 'FG 실패',
  SACK: '색',
  TFL: 'TFL',
  KICKOFF: '킥오프',
  PUNT: '펀트',
  FUMBLE: '펌블',
  FUMBLERECOFF: '공격 펌블 리커버리',
  FUMBLERECDEF: '수비 펌블 리커버리',
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
};

/* ================= 팀 이름 정규화/표시 ================= */
// 공백/중점/하이픈/점 제거 → 소문자 (비교용)
const normTeam = (s) =>
  String(s ?? '')
    .replace(/[.\-·\s]/g, '')
    .toLowerCase();
// 공백/중점/하이픈/점 제거 (표시용: 붙여쓰기 강제)
const compactTeam = (s) => String(s ?? '').replace(/[.\-·\s]/g, '');

/* TEAMS에서 이름/영문/코드로 팀 찾기 (정규화 비교) */
const findTeamMeta = (raw) => {
  if (!raw) return { name: '', logo: null, display: '' };
  const key = normTeam(raw);
  const hit =
    TEAMS.find((t) =>
      [t.name, t.enName, t.code].some((v) => normTeam(v) === key),
    ) || null;
  if (hit) return { ...hit, display: compactTeam(hit.name || raw) };
  // 매칭 실패 시에도 표시명은 붙여쓰기 강제
  return { name: String(raw), logo: null, display: compactTeam(raw) };
};

const TEAM_BY_ID = TEAMS.reduce((m, t) => ((m[t.id] = t), m), {});

/* ======== Guest Clip Page (fetch 없음) ======== */
export default function GuestClipPage() {
  const { gameKey } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // 상단 팀 표기 (게스트: 기본값)
  const MY_TEAM_ID = 'GCF';
  const selfTeam = useMemo(
    () => (MY_TEAM_ID ? TEAM_BY_ID[MY_TEAM_ID] : null) || TEAMS[0] || null,
    [MY_TEAM_ID],
  );
  const logoSrc = selfTeam?.logo || defaultLogo;
  const label = selfTeam?.name || 'Choose Team';

  const [showUpload, setShowUpload] = useState(false);

  // Game 정보 (부모 state 우선)
  const gameFromState = location.state?.game || null;
  const [game] = useState(
    gameFromState || {
      gameKey: gameKey || 'guest-game',
      home: '경기강원 올스타', // 원본에 공백 있어도 정규화로 처리됨
      away: '서울 바이킹스',
      date: 'N/A',
    },
  );

  // 홈/원정 메타 (필터용)
  const homeMeta = useMemo(() => findTeamMeta(game?.home), [game?.home]);
  const awayMeta = useMemo(() => findTeamMeta(game?.away), [game?.away]);

  // 팀 드롭다운 옵션 (붙여쓰기 display 사용)
  const teamOptions = useMemo(() => {
    const arr = [];
    if (homeMeta?.display)
      arr.push({
        value: homeMeta.display,
        label: homeMeta.display,
        logo: homeMeta.logo,
      });
    if (awayMeta?.display)
      arr.push({
        value: awayMeta.display,
        label: awayMeta.display,
        logo: awayMeta.logo,
      });
    // 중복 제거
    return arr.filter(
      (v, i, a) => a.findIndex((x) => x.value === v.value) === i,
    );
  }, [homeMeta?.display, homeMeta?.logo, awayMeta?.display, awayMeta?.logo]);

  // 드롭다운 상태
  const [openMenu, setOpenMenu] = useState(null);
  const closeAll = () => setOpenMenu(null);
  const handleMenuToggle = (menuName) =>
    setOpenMenu(openMenu === menuName ? null : menuName);

  // ↓↓↓ 엑셀에서 변환해온 클립 배열 사용 (fetch 없음) — 팀명 붙여쓰기 통일
const rawClips = useMemo(() => {
  return (GUEST_CLIPS || []).map((clip, idx) => {
    const ot = clip.offensiveTeam ?? homeMeta?.display ?? '홈팀';

    const startScoreSrc = clip.StartScore ?? clip.startScore ?? null;
    const startScoreArray = Array.isArray(startScoreSrc)
      ? startScoreSrc
      : startScoreSrc && typeof startScoreSrc === 'object'
      ? [startScoreSrc]
      : clip.Home != null && clip.Away != null
      ? [{ Home: Number(clip.Home) || 0, Away: Number(clip.Away) || 0 }]
      : null;

    const scoreHome =
      clip.scoreHome ??
      (Array.isArray(startScoreArray) ? Number(startScoreArray[0]?.Home) || 0 : 0);

    const scoreAway =
      clip.scoreAway ??
      (Array.isArray(startScoreArray) ? Number(startScoreArray[0]?.Away) || 0 : 0);

    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★★★ 여기가 수정된 부분입니다. VideoPlayer와 구조를 통일합니다. ★★★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    return {
      id: String(clip.id ?? `row${idx + 1}`),
      quarter: Number(clip.quarter ?? 0),
      playType: String(clip.playType ?? '').toUpperCase(),
      down: clip.down ?? clip.Down ?? null,
      yardsToGo: clip.yardsToGo ?? clip.RemainYard ?? null,
      significantPlay: Array.isArray(clip.significantPlay)
        ? clip.significantPlay
        : [],
      offensiveTeam: compactTeam(ot),
      gainYard: clip.gainYard ?? null,
      videoUrl: clip.videoUrl ?? clip.clipUrl ?? clip.ClipUrl ?? null,
      startScore: startScoreArray,
      scoreHome,
      scoreAway,
      raw: clip, // ★★★ 원본 데이터를 'raw' 속성에 추가! ★★★
    };
  });
}, [homeMeta?.display]);
  // useClipFilter 훅
  const persistKey = `clipFilters:${game?.gameKey || gameKey || 'guest'}`;
  const {
    filters,
    setFilters,
    summaries,
    clips,
    handleFilterChange,
    clearAllFilters,
  } = useClipFilter({
    persistKey,
    rawClips,
    teamOptions,
    opposites: OPPOSITES,
  });

  // 버튼 요약 텍스트
  const teamSummary = summaries.team; // 이미 붙여쓰기 형태
  const quarterSummary = summaries.quarter;
  const playTypeSummary = filters.playType
    ? PT_LABEL[filters.playType] || filters.playType
    : '유형';
  const significantSummary = summaries.significant;
  const clearSignificant = () =>
    setFilters((prev) => ({ ...prev, significantPlay: [] }));

  // 리스트 클릭 → 비디오 플레이어로 이동
const onClickClip = (c) => {
  navigate('/service/video', {
    state: {
      rawClips,
      initialFilters: filters,
      teamOptions,
      initialPlayId: String(c.id),
      teamMeta: {
        homeName: homeMeta?.display,
        awayName: awayMeta?.display,
        homeLogo: homeMeta?.logo,
        awayLogo: awayMeta?.logo,
        gameId: game?.gameKey || gameKey || 'guest-game',
      },
    },
  });
};

  // 플레이콜 비율 계산 (RUN vs PASS 계열)
  const rpStats = useMemo(() => {
    const calc = (teamName) => {
      if (!teamName) return { runPct: 0, passPct: 0, run: 0, pass: 0 };
      const arr = clips.filter(
        (c) =>
          c.offensiveTeam === teamName &&
          (c.playType === 'RUN' ||
            c.playType === 'PASS' ||
            c.playType === 'PASS_INCOMPLETE'),
      );
      const run = arr.filter((c) => c.playType === 'RUN').length;
      const pass = arr.length - run;
      const total = run + pass;
      if (total > 0) {
        const runPct = Math.round((run / total) * 100);
        return { runPct, passPct: 100 - runPct, run, pass };
      }
      return { runPct: 0, passPct: 0, run: 0, pass: 0 };
    };
    return {
      home: calc(homeMeta?.display),
      away: calc(awayMeta?.display),
    };
  }, [clips, homeMeta?.display, awayMeta?.display]);

  // down 표기
  const SPECIAL_DOWN_MAP = { TPT: '2PT', KICKOFF: '킥오프', PAT: 'PAT' };
  const getDownDisplay = (c) => {
    const pt = String(c.playType || '')
      .trim()
      .toUpperCase();
    const downRaw = c.down;
    const downStr = downRaw != null ? String(downRaw).trim().toUpperCase() : '';
    if (SPECIAL_DOWN_MAP[downStr]) return SPECIAL_DOWN_MAP[downStr];
    if (SPECIAL_DOWN_MAP[pt]) return SPECIAL_DOWN_MAP[pt];
    const d =
      typeof downRaw === 'number'
        ? downRaw
        : Number.isFinite(parseInt(downStr, 10))
        ? parseInt(downStr, 10)
        : null;
    if (d != null) {
      const ytg = c.yardsToGo ?? 0;
      return `${d} & ${ytg}`;
    }
    return '';
  };

  const renderPlayType = (v) => {
    const pt = (v ?? '').toString().trim().toUpperCase();
    return pt ? `#${PT_LABEL[pt] ?? pt}` : null;
  };

  /* ========= 페널티 동적 라벨링 ========= */
  const getPenaltyLabel = (c, key, homeDisplay, awayDisplay) => {
    // offensiveTeam은 붙여쓰기 display 사용
    const offenseIsHome =
      homeDisplay && c?.offensiveTeam ? c.offensiveTeam === homeDisplay : null;

    // PENALTY.HOME / PENALTY.AWAY
    const penalizedIsHome = key.endsWith('.HOME')
      ? true
      : key.endsWith('.AWAY')
      ? false
      : null;

    if (offenseIsHome === null || penalizedIsHome === null) {
      return '페널티'; // 정보 부족 시 일반 표기
    }
    // 같은 사이드면 "공격팀 페널티", 아니면 "수비팀 페널티"
    return penalizedIsHome === offenseIsHome ? '공격팀 페널티' : '수비팀 페널티';
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
                  logoSrc?.endsWith?.('.svg') ? 'svg-logo' : 'png-logo'
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
                  {Object.entries(PLAY_TYPES).map(([code]) => (
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
                    {Object.values(SIGNIFICANT_PLAYS).map((lab) => {
                      const selected =
                        Array.isArray(filters.significantPlay) &&
                        filters.significantPlay.includes(lab);
                      return (
                        <button
                          key={lab}
                          className={`ff-dd-item ${selected ? 'selected' : ''}`}
                          onClick={() =>
                            handleFilterChange('significantPlay', lab)
                          }
                        >
                          {lab}
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
          onUploaded={() => setShowUpload(false)}
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
            {clips.map((c) => (
              <div
                key={c.id}
                className="clip-row"
                onClick={() => onClickClip(c)}
              >
                <div className="quarter-name">
                  <div>{c.quarter}Q</div>
                </div>
                <div className="clip-rows">
                  <div className="clip-row1">
                    <div className="clip-down">{getDownDisplay(c)}</div>
                    <div className="clip-type">{renderPlayType(c.playType)}</div>
                  </div>
                  <div className="clip-row2">
                    <div className="clip-oT">{c.offensiveTeam}</div>
                    {Array.isArray(c.significantPlay) &&
                    c.significantPlay.length > 0 ? (
                      <div className="clip-sig">
                        {c.significantPlay.map((t, idx) => (
                          <span key={`${c.id}-sig-${idx}`}>
                            #
                            {labelSignificant(
                              c,
                              t,
                              homeMeta?.display,
                              awayMeta?.display
                            )}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="clip-sig" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {clips.length === 0 && (
              <div className="empty">일치하는 플레이가 없습니다.</div>
            )}
          </div>
        </div>

        <div className="clip-data">
          <div className="clip-playcall">
            <div className="clip-playcall-header">플레이콜 비율</div>
            <div className="clip-playcall-content">
              <div className="playcall-team">
                <div className="playcall-team-name">{homeMeta.display}</div>
                <div className="pc-run">
                  <div className="pc-row1">
                    <div>런</div>
                    <div>31.6%</div>
                  </div>
                  <div className="pc-row2">
                    <div className="bar bar-run" style={{ width: `31.6%` }} />
                  </div>
                </div>
                <div className="pc-pass">
                  <div className="pc-row1">
                    <div>패스</div>
                    <div>68.4%</div>
                  </div>
                  <div className="pc-row2">
                    <div className="bar bar-pass" style={{ width: `68.4%` }} />
                  </div>
                </div>
              </div>

              <div className="playcall-team">
                <div className="playcall-team-name">{awayMeta.display}</div>
                <div className="pc-run">
                  <div className="pc-row1">
                    <div>런</div>
                    <div>46.7%</div>
                  </div>
                  <div className="pc-row2">
                    <div className="bar bar-run" style={{ width: `46.7%` }} />
                  </div>
                </div>
                <div className="pc-pass">
                  <div className="pc-row1">
                    <div>패스</div>
                    <div>53.3%</div>
                  </div>
                  <div className="pc-row2">
                    <div className="bar bar-pass" style={{ width: `53.3%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="clip-teamstats">
            <div className="tsc-header">
              <div className="tsc-team tsc-left">
                {homeMeta?.logo && (
                  <img className="tsc-logo" src={homeMeta.logo} alt={homeMeta?.name} />
                )}
                <span className="tsc-pill">{homeMeta?.name}</span>
              </div>
              <div className="tsc-team tsc-right">
                {awayMeta?.logo && (
                  <img className="tsc-logo" src={awayMeta.logo} alt={awayMeta?.name} />
                )}
                <span className="tsc-pill">{awayMeta?.name}</span>
              </div>
            </div>

            <>
              <div className="tsc-row">
                <div>126</div>
                <div className="tsc-label">총 야드</div>
                <div>185</div>
              </div>
              <div className="tsc-row">
                <div>100</div>
                <div className="tsc-label">패싱 야드</div>
                <div>148</div>
              </div>
              <div className="tsc-row">
                <div>26</div>
                <div className="tsc-label">러싱 야드</div>
                <div>37</div>
              </div>
              <div className="tsc-row">
                <div>20%</div>
                <div className="tsc-label">3rd Down %</div>
                <div>36.4%</div>
              </div>
              <div className="tsc-row">
                <div>3</div>
                <div className="tsc-label">턴오버</div>
                <div>3</div>
              </div>
              <div className="tsc-row">
                <div>15</div>
                <div className="tsc-label">페널티 야드</div>
                <div>30</div>
              </div>
            </>
          </div>{' '}
        </div>
      </div>
    </div>
  );
}
