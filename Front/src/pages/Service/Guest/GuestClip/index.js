import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { GUEST_TEAMS } from '../../../../data/TEAMS';
import { GUEST_CLIPS } from '../../../../data/guestClips';
import { useClipFilter } from '../../../../hooks/useClipFilter';
import UploadVideoModal from '../../../../components/UploadVideoModal';
import defaultLogo from '../../../../assets/images/logos/Stechlogo.svg';
import { useAuth } from '../../../../context/AuthContext';

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
  'TWOPTCONV.GOOD': '2PT 성공',
  'TWOPTCONV.NOGOOD': '2PT 실패',
  PATGOOD: 'PAT 성공',
  PATNOGOOD: 'PAT 실패',
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
  '공격팀 리커버리': '수비팀 리커버리',
  '수비팀 리커버리': '공격팀 리커버리',
};

const normTeam = (s) =>
  String(s ?? '')
    .replace(/[.\-·\s]/g, '')
    .toLowerCase();
const compactTeam = (s) => String(s ?? '').replace(/[.\-·\s]/g, '');

const findTeamMeta = (raw) => {
  if (!raw) return { name: '', logo: null, display: '' };
  const key = normTeam(raw);
  const hit =
    GUEST_TEAMS.find((t) =>
      [t.name, t.enName, t.code].some((v) => normTeam(v) === key),
    ) || null;
  if (hit) return { ...hit, display: compactTeam(hit.name || raw) };
  return { name: String(raw), logo: null, display: compactTeam(raw) };
};

const TEAM_BY_ID = GUEST_TEAMS.reduce((m, t) => ((m[t.id] = t), m), {});

export default function GuestClipPage() {
  const { gameKey } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const MY_TEAM_ID = 'GCF';
  const selfTeam = useMemo(
    () => (MY_TEAM_ID ? TEAM_BY_ID[MY_TEAM_ID] : null) || GUEST_TEAMS[0] || null,
    [MY_TEAM_ID],
  );
  const logoSrc = selfTeam?.logo || defaultLogo;
  const label = selfTeam?.name || 'Choose Team';

  const [showUpload, setShowUpload] = useState(false);

  const gameFromState = location.state?.game || null;
  const [game] = useState(
    gameFromState || {
      gameKey: gameKey || 'guest-game',
      home: '경기강원 올스타',
      away: '서울 바이킹스',
      date: 'N/A',
    },
  );

  const homeMeta = useMemo(() => findTeamMeta(game?.home), [game?.home]);
  const awayMeta = useMemo(() => findTeamMeta(game?.away), [game?.away]);

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
    return arr.filter(
      (v, i, a) => a.findIndex((x) => x.value === v.value) === i,
    );
  }, [homeMeta?.display, homeMeta?.logo, awayMeta?.display, awayMeta?.logo]);

  const [openMenu, setOpenMenu] = useState(null);
  const closeAll = () => setOpenMenu(null);
  const handleMenuToggle = (menuName) =>
    setOpenMenu(openMenu === menuName ? null : menuName);

  const getPenaltyLabel = (c, key, homeDisplay, awayDisplay) => {
    const offenseIsHome =
      homeDisplay && c?.offensiveTeam ? c.offensiveTeam === homeDisplay : null;
    const penalizedIsHome = key.endsWith('.HOME')
      ? true
      : key.endsWith('.AWAY')
      ? false
      : null;

    if (key.endsWith('.OFF')) return '공격팀 페널티';
    if (key.endsWith('.DEF')) return '수비팀 페널티';

    if (offenseIsHome === null || penalizedIsHome === null) {
      return '페널티';
    }
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

  // [수정 1] 데이터 전처리: 필터링과 UI 렌더링을 위해 한글 라벨 배열을 미리 생성합니다.
  const rawClips = useMemo(() => {
    return (GUEST_CLIPS || []).map((clip, idx) => {
      const ot = clip.offensiveTeam ?? homeMeta?.display ?? '홈팀';
      const significantPlayRaw = Array.isArray(clip.significantPlay)
        ? clip.significantPlay
        : [];

      // UI에 표시될 라벨을 미리 계산하여 새로운 필드에 저장합니다.
      const displaySignificantPlays = significantPlayRaw.map((token) =>
        labelSignificant(
          { ...clip, offensiveTeam: compactTeam(ot) },
          token,
          homeMeta?.display,
          awayMeta?.display,
        ),
      );

      return {
        id: String(clip.id ?? `row${idx + 1}`),
        quarter: Number(clip.quarter ?? 0),
        playType: String(clip.playType ?? '').toUpperCase(),
        down: clip.down ?? clip.Down ?? null,
        yardsToGo: clip.yardsToGo ?? clip.RemainYard ?? null,
        offensiveTeam: compactTeam(ot),
        gainYard: clip.gainYard ?? null,
        videoUrl: clip.videoUrl ?? clip.clipUrl ?? clip.ClipUrl ?? null,
        scoreHome: clip.StartScore?.[0]?.Home ?? 0,
        scoreAway: clip.StartScore?.[0]?.Away ?? 0,
        raw: clip,
        significantPlay: significantPlayRaw, // 원본 영문 코드 배열
        displaySignificantPlays: displaySignificantPlays, // 새로 추가된 한글 라벨 배열
      };
    });
  }, [homeMeta?.display, awayMeta?.display]);

  // [수정 2] 훅 설정: significantPlayField 옵션을 추가하여 필터링 기준을 변경합니다.
  const {
    filters,
    setFilters,
    summaries,
    clips,
    handleFilterChange,
    clearAllFilters,
  } = useClipFilter({
    persistKey: `clipFilters:${game?.gameKey || gameKey || 'guest'}`,
    rawClips,
    teamOptions,
    opposites: OPPOSITES,
    significantPlayField: 'displaySignificantPlays',
  });

  const teamSummary = summaries.team;
  const quarterSummary = summaries.quarter;
  const playTypeSummary = filters.playType
    ? PT_LABEL[filters.playType] || filters.playType
    : '유형';
  const significantSummary = summaries.significant;
  const clearSignificant = () =>
    setFilters((prev) => ({ ...prev, significantPlay: [] }));

  const [isNavigating, setIsNavigating] = useState(false);
  const onClickClip = useCallback(
    (c) => {
      if (isNavigating) return;
      setIsNavigating(true);

      const staticFilters = {
        quarter: filters.quarter,
        playType: filters.playType,
        significantPlay: [...(filters.significantPlay || [])],
        team: filters.team,
      };

      try {
        navigate('/service/guest/video', {
          state: {
            // [수정] 아래 부분을 확인하세요.
            // 기존 데이터는 그대로 전달합니다.
            rawClips,
            initialFilters: staticFilters,
            teamOptions,
            initialPlayId: String(c.id),

            // videoUrl과 clipUrl 두 이름으로 모두 보내서 호환성 문제를 해결합니다.
            videoUrl: c.videoUrl, // 기존 방식
            clipUrl: c.videoUrl,  // 혹시 모를 이전 이름으로도 전달

            teamMeta: {
              homeName: homeMeta?.display,
              awayName: awayMeta?.display,
              homeLogo: homeMeta?.logo,
              awayLogo: awayMeta?.logo,
              gameId: game?.gameKey || gameKey || 'guest-game',
            },
          },
        });
      } catch (error) {
        console.error('Navigation failed:', error);
        setIsNavigating(false);
      }
      setTimeout(() => setIsNavigating(false), 1000);
    },
    [ isNavigating, rawClips, filters, teamOptions, homeMeta, awayMeta, game, gameKey, navigate ],
  );

  useEffect(() => { return () => setIsNavigating(false); }, []);

  const SPECIAL_DOWN_MAP = { TPT: '2PT', KICKOFF: '킥오프', PAT: 'PAT' };
  const ordinal = (n) => {
    const num = Number(n);
    if (!Number.isFinite(num)) return '';
    const sfx = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return `${num}${sfx[(v - 20) % 10] || sfx[v] || sfx[0]}`;
  };
  const getDownDisplay = (c) => {
    const pt = String(c.playType || '').trim().toUpperCase();
    const downRaw = c.down;
    const downStr = downRaw != null ? String(downRaw).trim().toUpperCase() : '';
    if (SPECIAL_DOWN_MAP[downStr]) return SPECIAL_DOWN_MAP[downStr];
    if (SPECIAL_DOWN_MAP[pt]) return SPECIAL_DOWN_MAP[pt];
    const d = typeof downRaw === 'number' ? downRaw : Number.isFinite(parseInt(downStr, 10)) ? parseInt(downStr, 10) : null;
    if (d != null) {
      const ytg = c.yardsToGo != null && Number.isFinite(Number(c.yardsToGo)) ? Number(c.yardsToGo) : null;
      return ytg != null ? `${ordinal(d)} & ${ytg}` : `${ordinal(d)}`;
    }
    return '';
  };
  const renderPlayType = (v) => {
    const pt = (v ?? '').toString().trim().toUpperCase();
    if (pt==='NONE') return '';
    return pt ? `#${PT_LABEL[pt] ?? pt}` : null;
  };

  return (
    <div className="clip-root">
      <header className="stechHeader">
        <div className="headerContainer">
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
          <div className="bottomRow">
            <div className="filterGroup">
              <div className="ff-bar">
                <Dropdown
                  label="공격팀"
                  summary={teamSummary}
                  isOpen={openMenu === 'team'}
                  onToggle={() => handleMenuToggle('team')}
                  onClose={closeAll}
                >
                  <button className={`ff-dd-item ${!filters.team ? 'selected' : ''}`} onClick={() => { handleFilterChange('team', null); closeAll(); }}>
                    전체
                  </button>
                  {teamOptions.map((opt) => (
                    <button key={opt.value} className={`ff-dd-item ${ filters.team === opt.value ? 'selected' : '' }`} onClick={() => { handleFilterChange('team', opt.value); closeAll(); }}>
                      {opt.logo && ( <img className="ff-dd-avatar" src={opt.logo} alt="" /> )}
                      {opt.label || opt.value}
                    </button>
                  ))}
                </Dropdown>
                <Dropdown
                  label="쿼터"
                  summary={quarterSummary}
                  isOpen={openMenu === 'quarter'}
                  onToggle={() => handleMenuToggle('quarter')}
                  onClose={closeAll}
                >
                  <button className={`ff-dd-item ${ !filters.quarter ? 'selected' : '' }`} onClick={() => { handleFilterChange('quarter', null); closeAll(); }}>
                    전체
                  </button>
                  {[1, 2, 3, 4].map((q) => (
                    <button key={q} className={`ff-dd-item ${ filters.quarter === q ? 'selected' : '' }`} onClick={() => { handleFilterChange('quarter', q); closeAll(); }}>
                      Q{q}
                    </button>
                  ))}
                </Dropdown>
                <Dropdown
                  label="유형"
                  summary={playTypeSummary}
                  isOpen={openMenu === 'playType'}
                  onToggle={() => handleMenuToggle('playType')}
                  onClose={closeAll}
                >
                  <button className={`ff-dd-item ${ !filters.playType ? 'selected' : '' }`} onClick={() => { handleFilterChange('playType', null); closeAll(); }}>
                    전체
                  </button>
                  {Object.entries(PT_LABEL).map(([code]) => (
                    <button key={code} className={`ff-dd-item ${ filters.playType === code ? 'selected' : '' }`} onClick={() => { handleFilterChange('playType', code); closeAll(); }}>
                      {PT_LABEL[code] || code}
                    </button>
                  ))}
                </Dropdown>
                <Dropdown
                  label="중요플레이"
                  summary={significantSummary}
                  isOpen={openMenu === 'significant'}
                  onToggle={() => handleMenuToggle('significant')}
                  onClose={closeAll}
                >
                  <div className="ff-dd-section">
                    {Object.entries(SIGNIFICANT_PLAYS).map(([code, label]) => {
                      const selected = Array.isArray(filters.significantPlay) && filters.significantPlay.includes(label);
                      return (
                        <button key={code} className={`ff-dd-item ${selected ? 'selected' : ''}`} onClick={() => handleFilterChange('significantPlay', label) }>
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
                <button type="button" className="resetButton" onClick={clearAllFilters} >
                  초기화
                </button>
              </div>
            </div>
          </div>
        </div>
        <UploadVideoModal isOpen={showUpload} onClose={() => setShowUpload(false)} onUploaded={() => setShowUpload(false)} />
      </header>

      <div className="clip-page-container">
        <div className="clip-left">
          <div className="clip-header">
            <div className="clip-team left">
              {homeMeta?.logo && ( <div className="clip-team-logo"> <img src={homeMeta.logo} alt={`${homeMeta.name} 로고`} className={`clip-team-logo-img ${ homeMeta.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo' }`} /> </div> )}
              <span className="clip-team-name">{homeMeta?.name}</span>
            </div>
            <div className="clip-vs">VS</div>
            <div className="clip-team right">
              {awayMeta?.logo && ( <div className="clip-team-logo"> <img src={awayMeta.logo} alt={`${awayMeta.name} 로고`} className={`clip-team-logo-img ${ awayMeta.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo' }`} /> </div> )}
              <span className="clip-team-name">{awayMeta?.name}</span>
            </div>
          </div>
          <div className="clip-list">
            {clips.map((c) => (
              <div key={c.id} className="clip-row" onClick={() => onClickClip(c)} >
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
                    
                    {/* [수정 3] UI 렌더링: 미리 계산된 한글 라벨 배열을 직접 사용하여 성능을 최적화합니다. */}
                    {Array.isArray(c.displaySignificantPlays) &&
                    c.displaySignificantPlays.length > 0 ? (
                      <div className="clip-sig">
                        {c.displaySignificantPlays.map((label, idx) => (
                          <span key={`${c.id}-sig-${idx}`}>#{label}</span>
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
                {homeMeta?.logo && ( <img className="tsc-logo" src={homeMeta.logo} alt={homeMeta?.name} /> )}
                <span className="tsc-pill">{homeMeta?.name}</span>
              </div>
              <div className="tsc-team tsc-right">
                {awayMeta?.logo && ( <img className="tsc-logo" src={awayMeta.logo} alt={awayMeta?.name} /> )}
                <span className="tsc-pill">{awayMeta?.name}</span>
              </div>
            </div>
            <>
              <div className="tsc-row"> <div>126</div> <div className="tsc-label">총 야드</div> <div>185</div> </div>
              <div className="tsc-row"> <div>100</div> <div className="tsc-label">패싱 야드</div> <div>148</div> </div>
              <div className="tsc-row"> <div>26</div> <div className="tsc-label">러싱 야드</div> <div>37</div> </div>
              <div className="tsc-row"> <div>20%</div> <div className="tsc-label">3rd Down %</div> <div>36.4%</div> </div>
              <div className="tsc-row"> <div>3</div> <div className="tsc-label">턴오버</div> <div>3</div> </div>
              <div className="tsc-row"> <div>15</div> <div className="tsc-label">페널티 야드</div> <div>30</div> </div>
            </>
          </div>
        </div>
      </div>
    </div>
  );
}