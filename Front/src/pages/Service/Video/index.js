// src/pages/Service/Video/index.js
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  IoPlayCircleOutline,
  IoPauseCircleOutline,
  IoClose,
} from 'react-icons/io5';
import { HiOutlineMenuAlt3 } from 'react-icons/hi';
import { FaPencilAlt, FaStickyNote } from 'react-icons/fa';
import './index.css';
import { useVideoSettings } from '../../../hooks/useVideoSettings';
import { useClipFilter } from '../../../hooks/useClipFilter';
import MagicPencil from '../../../components/MagicPencil/MagicPencil';
import VideoMemo from '../../../components/VideoMemo/VideoMemo';
import GameDataEditModal from '../../../components/GameDataEditModal/GameDataEditModal';

/* ================= Dropdown ================= */
function Dropdown({ label, summary, isOpen, onToggle, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    if (isOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [onClose, isOpen]);
  return (
    <div className="ff-dropdown" ref={ref} style={{ marginBottom: '8px' }}>
      <button type="button" className={`ff-dd-btn ${isOpen ? 'open' : ''}`} onClick={onToggle}>
        <span className="ff-dd-label">{summary || label}</span>
        <span className="ff-dd-icon">▾</span>
      </button>
      {isOpen && <div className="ff-dd-menu" role="menu">{children}</div>}
    </div>
  );
}

/* ================= Labels / Consts ================= */
export const PT_LABEL = {
  RUN: '런',
  PASS: '패스',
  PASS_INCOMPLETE: '패스 실패',
  KICKOFF: '킥오프',
  PUNT: '펀트',
  PAT: 'PAT',
  TWOPT: '2PT',
  FIELDGOAL: 'FG',
};
const PLAY_TYPES = { RUN:'RUN', PASS:'PASS', KICKOFF:'KICKOFF', PUNT:'PUNT' };

const SIGNIFICANT_PLAYS = {
  TOUCHDOWN: '터치다운',
  TWOPTCONVGOOD: '2PT 성공',
  TWOPTCONVNOGOOD: '2PT 실패',
  PATSUCCESS: 'PAT 성공',
  PATFAIL: 'PAT 실패',
  FIELDGOALGOOD: 'FG 성공',
  FIELDGOALNOGOOD: 'FG 실패',
  PENALTY: '페널티',
  SACK: '색',
  TFL: 'TFL',
  FUMBLE: '펌블',
  INTERCEPTION: '인터셉트',
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

const normalizeClips = (clips = []) =>
  clips.map((c, idx) => {
    const startScoreArr = c?.StartScore || c?.startScore;
    const startScore = Array.isArray(startScoreArr) ? startScoreArr[0] : null;
    const id = c?.id ?? c?.ClipKey ?? c?.clipKey ?? c?.key ?? `idx-${idx}`;
    const url = c?.videoUrl ?? c?.clipUrl ?? c?.ClipUrl ?? null;
    const quarter = Number(c?.quarter ?? c?.Quarter) || 1;
    const downRaw = c?.down ?? c?.Down;
    const down =
      typeof downRaw === 'number' ? downRaw : parseInt(downRaw, 10) || null;
    const yardsToGo = c?.yardsToGo ?? c?.RemainYard ?? c?.remainYard ?? null;
    const playType = c?.playType ?? c?.PlayType ?? null;
    const offensiveTeam = c?.offensiveTeam ?? c?.OffensiveTeam ?? null;
    const significant = Array.isArray(c?.significantPlay)
      ? c.significantPlay
      : Array.isArray(c?.SignificantPlays)
      ? c.SignificantPlays.map((sp) => sp?.label || sp?.key).filter(Boolean)
      : [];
    return {
      id: String(id),
      videoUrl: url,
      quarter,
      offensiveTeam,
      specialTeam: !!(c?.specialTeam ?? c?.SpecialTeam),
      down,
      yardsToGo,
      playType,
      startYard: c?.startYard ?? c?.StartYard ?? null,
      endYard: c?.endYard ?? c?.EndYard ?? null,
      carriers: Array.isArray(c?.carriers)
        ? c.carriers
        : Array.isArray(c?.Carrier)
        ? c.Carrier
        : [],
      significant,
      scoreHome: startScore?.Home ?? c?.scoreHome ?? 0,
      scoreAway: startScore?.Away ?? c?.scoreAway ?? 0,
      raw: c,
    };
  });

const getOrdinal = (n) => (n===1?'st':n===2?'nd':n===3?'rd':'th');
const SPECIAL_DOWN_MAP = { TPT: '2PT', KICKOFF: '킥오프', PAT: 'PAT' };

const getDownDisplay = (c) => {
  const pt = String(c.playType || '').trim().toUpperCase();
  const downRaw = c.raw?.down ?? c.down;
  const downStr = downRaw != null ? String(downRaw).trim().toUpperCase() : '';
  if (SPECIAL_DOWN_MAP[downStr]) return SPECIAL_DOWN_MAP[downStr];
  if (SPECIAL_DOWN_MAP[pt]) return SPECIAL_DOWN_MAP[pt];
  const d =
    typeof c.down === 'number'
      ? c.down
      : Number.isFinite(parseInt(downStr, 10))
      ? parseInt(downStr, 10)
      : null;
  if (d != null) {
    const ytg = c.yardsToGo ?? 0;
    return `${d} & ${ytg}`;
  }
  return '';
};

/* ================= Core ================= */
function PlayerCore({ stateData }) {
  const navigate = useNavigate();
  const { settings } = useVideoSettings();

  const { rawClips, initialFilters, teamOptions, teamMeta, initialPlayId } =
    stateData;

  const filterHookResult =
    useClipFilter({
      rawClips,
      initialFilters,
      teamOptions,
      opposites: OPPOSITES,
      persistKey: `videoPlayerFilters:${teamMeta?.homeName}`,
    }) || {};

  const {
    clips = [],
    filters = {},
    setFilters = () => {},
    summaries = {},
    handleFilterChange = () => {},
    clearAllFilters = () => {},
  } = filterHookResult;

  const normalized = useMemo(() => normalizeClips(clips), [clips]);

  // Refs
  const videoRef = useRef(null);
  const timelineRef = useRef(null);
  const pendingAutoplayRef = useRef(false);

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [openMenu, setOpenMenu] = useState(null);
  const [showMagicPencil, setShowMagicPencil] = useState(false);
  const [showMemo, setShowMemo] = useState(false);
  const [memos, setMemos] = useState(() => {
    const saved = localStorage.getItem(`videoMemos:${teamMeta?.gameId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [showGameDataModal, setShowGameDataModal] = useState(false);

  /* ===== selection helpers ===== */
  const indexById = useMemo(() => {
    const map = new Map();
    normalized.forEach((c, i) => map.set(String(c.id), i));
    return map;
  }, [normalized]);

  const goNextClip = useCallback(() => {
    if (!selectedId || normalized.length === 0) return;
    const idx = indexById.get(String(selectedId));
    if (idx == null) return;
    const next = normalized[idx + 1];
    if (next) {
      selectPlay(next.id, { autoplay: true });
    }
  }, [selectedId, normalized, indexById]);

  const goPrevClip = useCallback(() => {
    if (!selectedId || normalized.length === 0) return;
    const idx = indexById.get(String(selectedId));
    if (idx == null) return;
    const prev = normalized[idx - 1];
    if (prev) {
      selectPlay(prev.id, { autoplay: true });
    }
  }, [selectedId, normalized, indexById]);

  /* ===== memos ===== */
  const handleSaveMemo = (clipId, memoData, playerID) => {
    setMemos((prev) => {
      const playerMemos = prev[playerID] || {};
      const memoKey = `memo_${clipId}`;
      const updated = {
        ...prev,
        [playerID]: {
          ...playerMemos,
          [memoKey]: memoData,
        },
      };
      localStorage.setItem(`videoMemos:${teamMeta?.gameId}`, JSON.stringify(updated));
      return updated;
    });
  };

  /* ===== context menu ===== */
  const handleVideoContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
  }, []);
  const closeContextMenu = useCallback(() => setContextMenu({ visible: false, x: 0, y: 0 }), []);
  const handleSystemSettings = useCallback(() => {
    navigate('../Member/Settings');
    closeContextMenu();
  }, [closeContextMenu, navigate]);
  const handleEditGameData = useCallback(() => {
    setShowGameDataModal(true);
    closeContextMenu();
  }, [closeContextMenu]);

  useEffect(() => {
    const handleClickOutside = () => contextMenu.visible && closeContextMenu();
    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [contextMenu.visible, closeContextMenu]);

  const closeAllMenus = useCallback(() => setOpenMenu(null), []);
  const handleMenuToggle = useCallback((menuName) => {
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  }, []);

  const selected = useMemo(
    () =>
      (normalized || []).find((p) => p.id === selectedId) ||
      (normalized || [])[0] ||
      null,
    [normalized, selectedId],
  );

  const hasNoVideo = !!selected && !selected.videoUrl;
  const isPlaySelected = useCallback((id) => id === selectedId, [selectedId]);

  /* ===== selectPlay with autoplay intent ===== */
  const selectPlay = useCallback((id, { autoplay = false } = {}) => {
    pendingAutoplayRef.current = autoplay;
    setSelectedId(id || null);
    setIsPlaying(false);
    setHasError(false);
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  /* ===== initial clip selection ===== */
  useEffect(() => {
    const isInitialClipAvailable =
      initialPlayId && clips.some((c) => String(c.id) === String(initialPlayId));
    if (isInitialClipAvailable) {
      if (selectedId !== initialPlayId) selectPlay(String(initialPlayId));
    } else if (clips.length > 0) {
      const inList = selectedId && clips.some((c) => String(c.id) === selectedId);
      if (!inList) selectPlay(String(clips[0].id));
    } else {
      selectPlay(null);
    }
  }, [clips, initialPlayId, selectedId, selectPlay]);

  /* ===== playback rate per clip ===== */
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.playbackRate = settings.playbackRate;
  }, [settings.playbackRate, selectedId]);


  /* ===== wire video events (single binding) ===== */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setIsLoading(false);
      setHasError(false);
      setCurrentTime(video.currentTime || 0);
    };
    const onTimeUpdate = () => setCurrentTime(video.currentTime || 0);
    const onEnded = () => {
      setIsPlaying(false);
      // 자동으로 다음 클립으로
      goNextClip();
    };
    const onError = () => {
      setHasError(true);
      setIsLoading(false);
    };
    const onCanPlay = () => {
      setIsLoading(false);
      if (pendingAutoplayRef.current) {
        pendingAutoplayRef.current = false;
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {/* 브라우저 자동재생 정책으로 막힐 수 있음 */});
      }
    };
    const onLoadStart = () => setIsLoading(true);

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('loadstart', onLoadStart);
    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('loadstart', onLoadStart);
    };
  }, [goNextClip]);

  /* ===== controls ===== */
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || hasError || !selected) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setHasError(true));
    }
  }, [isPlaying, hasError, selected]);

  const stepTime = useCallback(
    (seconds) => {
      const video = videoRef.current;
      if (!video || hasError || duration === 0) return;
      const newTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
      video.currentTime = newTime;
    },
    [duration, hasError],
  );

  const handleTimelineClick = useCallback(
    (e) => {
      const video = videoRef.current;
      const tl = timelineRef.current;
      if (!video || !tl || hasError || duration === 0) return;
      const rect = tl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const padding = 10;
      const trackWidth = rect.width - padding * 2;
      const rel = Math.max(0, Math.min(trackWidth, x - padding));
      const pct = rel / trackWidth;
      video.currentTime = pct * duration;
    },
    [duration, hasError],
  );

  const handleMouseDown = useCallback(
    (e) => {
      const video = videoRef.current;
      const tl = timelineRef.current;
      if (!video || !tl || hasError || duration === 0) return;
      handleTimelineClick(e);
      const onMove = (me) => handleTimelineClick(me);
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [duration, hasError, handleTimelineClick],
  );

  /* ===== hotkeys (A/D/N/M) ===== */
  useEffect(() => {
    const onKey = (e) => {
      if (showMagicPencil || showMemo) return;
      if (e.target?.tagName === 'INPUT' || e.target?.tagName === 'TEXTAREA') return;
      const key = e.key.toUpperCase();
      const backwardKey = settings?.hotkeys?.backward?.toUpperCase?.() || 'A';
      const forwardKey = settings?.hotkeys?.forward?.toUpperCase?.() || 'D';
      const nextKey = settings?.hotkeys?.nextVideo?.toUpperCase?.() || 'N';
      const prevKey = settings?.hotkeys?.prevVideo?.toUpperCase?.() || 'M';

      if (key === ' ' && !e.repeat) {
        e.preventDefault();
        togglePlay();
      } else if (key === backwardKey) {
        e.preventDefault();
        stepTime(-settings.skipTime);
      } else if (key === forwardKey) {
        e.preventDefault();
        stepTime(settings.skipTime);
      } else if (key === nextKey) {
        e.preventDefault();
        goNextClip();
      } else if (key === prevKey) {
        e.preventDefault();
        goPrevClip();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [togglePlay, stepTime, settings, showMagicPencil, showMemo, goNextClip, goPrevClip]);

  const formatTime = (sec) => {
    if (isNaN(sec) || sec === null) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const downLabel = useMemo(() => (selected ? getDownDisplay(selected) : ''), [selected]);

  /* ===== UI Data ===== */
  const homeName = teamMeta?.homeName || 'Home';
  const awayName = teamMeta?.awayName || 'Away';
  const homeLogo = teamMeta?.homeLogo || null;
  const awayLogo = teamMeta?.awayLogo || null;
  const scoreHome = selected?.scoreHome ?? 0;
  const scoreAway = selected?.scoreAway ?? 0;
  const quarter = selected?.quarter ?? 1;
  const down = selected?.down;
  const ytg = selected?.yardsToGo;

  const teamSummary = summaries.team;
  const quarterSummary = summaries.quarter;
  const playTypeSummary = filters.playType ? PT_LABEL[filters.playType] : '유형';
  const significantSummary = summaries.significant;
  const clearSignificant = () =>
    setFilters((prev) => ({ ...prev, significantPlay: [] }));

  return (
    <div className="videoPlayerPage">
      <div className="videoContainer">
        <button className="videoBackButton" onClick={() => navigate(-1)}>
          <IoClose size={24} />
        </button>
        <button className="videoModalToggleButton" onClick={() => setIsModalOpen((o) => !o)}>
          <HiOutlineMenuAlt3 size={24} />
        </button>

        {/* ===== Scoreboard ===== */}
        <div className="videoScoreboard">
          <div className="scoreTeam leftTeam">
            {awayLogo ? (
              <img src={awayLogo} alt={awayName} className="scoreTeamLogo" />
            ) : (
              <div className="scoreTeamLogo placeholder">{awayName[0]}</div>
            )}
            <div className="scoreTeamInfo">
              <span className="scoreTeamName">{awayName}</span>
              <span className="scoreTeamScore">{scoreAway}</span>
            </div>
          </div>
          <div className="scoreCenter">
            <div className="scoreQuarter">Q{quarter}</div>
            <div className="scoreDown">
              {downLabel ||
                (typeof down === 'number'
                  ? `${down}${getOrdinal(down)} & ${ytg ?? 0}`
                  : '--')}
            </div>
          </div>
          <div className="scoreTeam rightTeam">
            <div className="scoreTeamInfo">
              <span className="scoreTeamName">{homeName}</span>
              <span className="scoreTeamScore">{scoreHome}</span>
            </div>
            {homeLogo ? (
              <img src={homeLogo} alt={homeName} className="scoreTeamLogo" />
            ) : (
              <div className="scoreTeamLogo placeholder">{homeName[0]}</div>
            )}
          </div>
        </div>

        {/* ===== Video ===== */}
        <div className="videoScreen">
          <div className="videoPlaceholder">
            <div className="videoContent">
              {hasNoVideo && (
                <div className="videoNoVideoMessage">
                  <div className="videoNoVideoIcon">🎬</div>
                  <div className="videoNoVideoText">비디오가 없습니다</div>
                </div>
              )}
              {!selected && clips.length === 0 && (
                <div className="videoNoVideoMessage">
                  <div className="videoNoVideoIcon">🧐</div>
                  <div className="videoNoVideoText">표시할 클립이 없습니다</div>
                </div>
              )}
              {selected && (
                <>
                  {isLoading && <div className="videoLoadingMessage">Loading...</div>}
                  {hasError && (
                    <div className="videoErrorMessage">
                      <div>비디오를 로드할 수 없습니다</div>
                      <div className="videoErrorUrl">ID: {selected?.id}</div>
                    </div>
                  )}
                  <video
  key={selected?.id}              // 선택 바뀔 때 리마운트
  ref={videoRef}
  className={`videoElement ${isLoading || hasError ? 'hidden' : ''}`}
  src={selected?.videoUrl || ''}  // ★ src 직접 바인딩
  preload="metadata"
  controls={false}
  crossOrigin="anonymous"
  muted
  playsInline
  autoPlay={false}
  onContextMenu={handleVideoContextMenu}
/>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ===== Floating tools ===== */}
        <div className="floatingToolButtons">
          <button className="floatingToolBtn memoBtn" onClick={() => setShowMemo(true)} title="메모 작성">
            <FaStickyNote size={24} />
            {memos[selectedId] && <span className="memoIndicator"></span>}
          </button>
          <button
            className="floatingToolBtn magicPencilBtn"
            onClick={() => setShowMagicPencil(true)}
            disabled={isPlaying || hasError || !selected || hasNoVideo}
            title="매직펜슬 (일시정지 상태에서만 사용 가능)"
          >
            <FaPencilAlt size={24} />
          </button>
        </div>

        {/* ===== Editor controls ===== */}
        <div className="videoEditorControls">
          <div className="videoControlsTop">
            <button
              className="videoPlayButton"
              onClick={togglePlay}
              disabled={hasError || !selected || hasNoVideo}
            >
              {isPlaying ? <IoPauseCircleOutline size={32} /> : <IoPlayCircleOutline size={32} />}
            </button>
            <div className="videoTimeInfo">
              <span className="videoCurrentTime">{formatTime(currentTime)}</span>
              <span className="videoTimeDivider">/</span>
              <span className="videoDuration">{formatTime(duration)}</span>
            </div>
            <div className="videoFrameNavigation">
              <button
                className="videoFrameStepButton"
                onClick={() => stepTime(-0.5)}
                disabled={hasError || !selected}
                title="Previous 0.5s"
              >
                ◀ 0.5s
              </button>
              <button
                className="videoFrameStepButton"
                onClick={() => stepTime(0.5)}
                disabled={hasError || !selected}
                title="Next 0.5s"
              >
                0.5s ▶
              </button>
              <button className="videoFrameStepButton" onClick={goPrevClip} disabled={!selected}>
                이전 클립
              </button>
              <button className="videoFrameStepButton" onClick={goNextClip} disabled={!selected}>
                다음 클립
              </button>
            </div>
          </div>

          <div className="videoTimelineContainer">
            <div ref={timelineRef} className="videoTimeline" onMouseDown={handleMouseDown}>
              <div className="videoTimelineTrack">
                <div
                  className="videoTimelineProgress"
                  style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                />
                <div
                  className="videoTimelineHandle"
                  style={{ left: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Right side modal (list & filters) ===== */}
      <div className={`videoSideModal ${isModalOpen ? 'open' : ''}`}>
        <div className="videoModalClose">
          <button className="videoCloseButton" onClick={() => setIsModalOpen(false)}>
            <IoClose size={20} />
          </button>
        </div>
        <div className="videoModalContent">
          <div className="videoMatchInfo">
            <div className="videoMatchTeams">
              <div className="videoMatchHome">
                {homeLogo ? (
                  <img src={homeLogo} alt={homeName} className="videoTeamLogos" />
                ) : (
                  <div className="videoTeamLogos placeholder">{homeName[0]}</div>
                )}
                <span>{homeName}</span>
              </div>
              <div>VS</div>
              <div className="videoMatchAway">
                {awayLogo ? (
                  <img src={awayLogo} alt={awayName} className="videoTeamLogos" />
                ) : (
                  <div className="videoTeamLogos placeholder">{awayName[0]}</div>
                )}
                <span>{awayName}</span>
              </div>
            </div>
          </div>

          <div className="videoFilterControls" onClick={(e) => e.stopPropagation()}>
            <div className="filterRow">
              <Dropdown
                label="쿼터"
                summary={quarterSummary}
                isOpen={openMenu === 'quarter'}
                onToggle={() => handleMenuToggle('quarter')}
                onClose={closeAllMenus}
              >
                <button
                  className={`ff-dd-item ${!filters.quarter ? 'selected' : ''}`}
                  onClick={() => { handleFilterChange('quarter', null); closeAllMenus(); }}
                >
                  전체
                </button>
                {[1,2,3,4].map((q) => (
                  <button
                    key={q}
                    className={`ff-dd-item ${filters.quarter === q ? 'selected' : ''}`}
                    onClick={() => { handleFilterChange('quarter', q); closeAllMenus(); }}
                  >
                    Q{q}
                  </button>
                ))}
              </Dropdown>

              <Dropdown
                label="공격팀"
                summary={teamSummary}
                isOpen={openMenu === 'team'}
                onToggle={() => handleMenuToggle('team')}
                onClose={closeAllMenus}
              >
                <button
                  className={`ff-dd-item ${!filters.team ? 'selected' : ''}`}
                  onClick={() => { handleFilterChange('team', null); closeAllMenus(); }}
                >
                  전체
                </button>
                {teamOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={`ff-dd-item ${filters.team === opt.value ? 'selected' : ''}`}
                    onClick={() => { handleFilterChange('team', opt.value); closeAllMenus(); }}
                  >
                    {opt.logo && <img className="ff-dd-avatar" src={opt.logo} alt="" />}
                    {opt.label || opt.value}
                  </button>
                ))}
              </Dropdown>
            </div>

            <div className="filterRow">
              <Dropdown
                label="유형"
                summary={playTypeSummary}
                isOpen={openMenu === 'playType'}
                onToggle={() => handleMenuToggle('playType')}
                onClose={closeAllMenus}
              >
                <button
                  className={`ff-dd-item ${!filters.playType ? 'selected' : ''}`}
                  onClick={() => { handleFilterChange('playType', null); closeAllMenus(); }}
                >
                  전체
                </button>
                {Object.entries(PLAY_TYPES).map(([code]) => (
                  <button
                    key={code}
                    className={`ff-dd-item ${filters.playType === code ? 'selected' : ''}`}
                    onClick={() => { handleFilterChange('playType', code); closeAllMenus(); }}
                  >
                    {PT_LABEL[code] || code}
                  </button>
                ))}
              </Dropdown>

              <Dropdown
                label="중요플레이"
                summary={significantSummary}
                isOpen={openMenu === 'significant'}
                onToggle={() => handleMenuToggle('significant')}
                onClose={closeAllMenus}
              >
                <div className="ff-dd-section">
                  {Object.values(SIGNIFICANT_PLAYS).map((label) => (
                    <button
                      key={label}
                      className={`ff-dd-item ${filters.significantPlay?.includes(label) ? 'selected' : ''}`}
                      onClick={() => handleFilterChange('significantPlay', label)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="ff-dd-actions">
                  <button className="ff-dd-clear" onClick={() => setFilters((p)=>({...p, significantPlay:[]}))}>모두 해제</button>
                  <button className="ff-dd-close" onClick={closeAllMenus}>닫기</button>
                </div>
              </Dropdown>
            </div>

            <div className="filterRow">
              <button type="button" className="videoFilterResetButton" onClick={clearAllFilters}>
                초기화
              </button>
            </div>
          </div>

          {/* ===== Play list ===== */}
          <div className="videoPlaysList">
            {normalized.length > 0 ? (
              normalized.map((p) => (
                <div
                  key={p.id}
                  className={`clip-row ${isPlaySelected(p.id) ? 'selected' : ''}`}
                  onClick={() => selectPlay(p.id, { autoplay: true })}
                >
                  <div className="quarter-name"><div>{p.quarter}Q</div></div>
                  <div className="clip-rows">
                    <div className="vid-clip-row1">
                      <div className="clip-down">{getDownDisplay(p)}</div>
                      <div className="clip-type">#{PT_LABEL[p.playType] || p.playType}</div>
                    </div>
                    <div className="vid-clip-row2">
                      <div className="clip-oT">{p.offensiveTeam}</div>
                      {Array.isArray(p.significant) && p.significant.length > 0 ? (
                        <div className="clip-sig">
                          {p.significant.map((t, idx) => (
                            <span key={`${p.id}-sig-${idx}`}>#{t}</span>
                          ))}
                        </div>
                      ) : (
                        <div className="clip-sig" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="videoNoPlaysMessage">일치하는 클립이 없습니다.</div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && <div className="videoModalOverlay" onClick={() => setIsModalOpen(false)} />}

      {contextMenu.visible && (
        <div
          className="customContextMenu"
          style={{ position: 'fixed', left: `${contextMenu.x}px`, top: `${contextMenu.y}px`, zIndex: 9999 }}
        >
          <div className="contextMenuItem" onClick={handleSystemSettings}>⚙️ 시스템 설정</div>
          <div className="contextMenuItem" onClick={handleEditGameData}>📝 경기데이터 수정</div>
        </div>
      )}

      <GameDataEditModal
        isVisible={showGameDataModal}
        onClose={() => setShowGameDataModal(false)}
        clipId={selectedId}
        gameId={teamMeta?.gameId}
      />

      <MagicPencil
        videoElement={videoRef.current}
        isVisible={showMagicPencil && !isPlaying}
        onClose={() => setShowMagicPencil(false)}
      />

      <VideoMemo
        isVisible={showMemo}
        onClose={() => setShowMemo(false)}
        clipId={selectedId}
        memos={memos}
        onSaveMemo={handleSaveMemo}
        clipInfo={{
          quarter,
          down,
          yardsToGo: ytg,
          playType: selected?.playType,
          time: formatTime(currentTime),
        }}
      />
    </div>
  );
}

/* ================= Shell ================= */
export default function VideoPlayer() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state) {
    return (
      <div className="videoPlayerPage">
        <div className="videoContainer" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div className="videoErrorMessage">
            클립 정보를 찾을 수 없습니다.
            <button onClick={() => navigate(-1)} style={{ marginTop: '1rem', cursor: 'pointer' }}>
              이전 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <PlayerCore stateData={location.state} />;
}
