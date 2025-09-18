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
      <button
        type="button"
        className={`ff-dd-btn ${isOpen ? 'open' : ''}`}
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
const PLAY_TYPES = {
  RUN: 'RUN',
  PASS: 'PASS',
  KICKOFF: 'KICKOFF',
  PUNT: 'PUNT',
};

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

const SPECIAL_DOWN_MAP = { TPT: '2PT', KICKOFF: '킥오프', PAT: 'PAT' };

const getDownDisplay = (c) => {
  if (!c) return '';
  const pt = String(c.playType || '')
    .trim()
    .toUpperCase();
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

  const { rawClips, initialFilters, teamOptions, teamMeta, initialPlayId } = stateData;

  // useClipFilter를 실제 데이터가 변경될 때마다 업데이트되도록 수정
  const clipFilterParams = useMemo(() => ({
    rawClips: rawClips || [],
    initialFilters: initialFilters || {},
    teamOptions: teamOptions || [],
    opposites: OPPOSITES,
    persistKey: `videoPlayerFilters:${teamMeta?.homeName || 'default'}`,
  }), [rawClips, initialFilters, teamOptions, teamMeta?.homeName]); // 실제 의존성 추가

  const {
    clips = [],
    filters = {},
    setFilters = () => {},
    summaries = {},
    handleFilterChange = () => {},
    clearAllFilters = () => {},
  } = useClipFilter(clipFilterParams);

  const videoRef = useRef(null);
  const timelineRef = useRef(null);
  const pendingAutoplayRef = useRef(false);

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

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const [showGameDataModal, setShowGameDataModal] = useState(false);

  // 초기화를 한 번만 수행
  const initializationDone = useRef(false);
  
  useEffect(() => {
    if (initializationDone.current) return;
    
    if (clips && clips.length > 0) {
      // initialPlayId는 clipKey 값이므로 clipKey로 매칭해서 실제 id를 찾아야 함
      const targetClip = initialPlayId && clips.find(c => String(c.clipKey) === String(initialPlayId));
      const targetId = targetClip ? String(targetClip.id) : String(clips[0].id);
      
      setSelectedId(targetId);
      initializationDone.current = true;
    }
  }, [clips, initialPlayId]); // 실제 clips 배열과 initialPlayId 변경 시 실행

  // 필터 변경 시 현재 클립이 결과에 없으면 첫 번째 클립으로 이동
  useEffect(() => {
    if (!selectedId || !clips || clips.length === 0) return;
    
    const isCurrentClipInResults = clips.some(c => String(c.id) === String(selectedId));
    if (!isCurrentClipInResults && clips.length > 0) {
      setSelectedId(String(clips[0].id));
      setIsPlaying(false);
      setHasError(false);
      setIsLoading(true);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [clips, selectedId]);

  const handleSaveMemo = (clipId, memoData, playerID) => {
    setMemos((prev) => {
      const playerMemos = prev[playerID] || {};
      const memoKey = `memo_${clipId}`;
      const updated = {
        ...prev,
        [playerID]: { ...playerMemos, [memoKey]: memoData },
      };
      localStorage.setItem(
        `videoMemos:${teamMeta?.gameId}`,
        JSON.stringify(updated),
      );
      return updated;
    });
  };

  const handleVideoContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(
    () => setContextMenu({ visible: false, x: 0, y: 0 }),
    [],
  );

  const handleSystemSettings = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('../Member/Settings');
    closeContextMenu();
  }, [closeContextMenu, navigate]);

  const handleEditGameData = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
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
    () => clips.find((p) => String(p.id) === selectedId) || null,
    [clips, selectedId],
  );

  const hasNoVideo = !!selected && !selected.clipUrl;
  const isPlaySelected = useCallback(
    (id) => String(id) === selectedId,
    [selectedId],
  );

  // selectPlay를 단순화
  const selectPlay = useCallback((id, options = {}) => {
    const newId = String(id);
    if (newId === selectedId) return;
    
    setSelectedId(newId);
    
    if (options.autoplay) {
      pendingAutoplayRef.current = true;
    }
    
    setIsPlaying(false);
    setHasError(false);
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
  }, [selectedId]);

  // 현재 클립의 위치 정보
  const getCurrentClipPosition = useCallback(() => {
    if (!selectedId || !clips || clips.length === 0) return null;
    
    const currentIndex = clips.findIndex(c => String(c.id) === String(selectedId));
    if (currentIndex === -1) return null;
    
    return {
      current: currentIndex + 1,
      total: clips.length,
      isFirst: currentIndex === 0,
      isLast: currentIndex === clips.length - 1
    };
  }, [selectedId, clips]);

  const clipPosition = getCurrentClipPosition();

  // 필터링된 클립들 기준으로 네비게이션
  const goNextClip = useCallback(() => {
    if (!selectedId || !clips || clips.length === 0) return;
    
    const currentIndex = clips.findIndex(c => String(c.id) === String(selectedId));
    
    if (currentIndex === -1 || currentIndex >= clips.length - 1) return;
    
    const nextClip = clips[currentIndex + 1];
    if (nextClip) {
      setSelectedId(String(nextClip.id));
      pendingAutoplayRef.current = true;
      setIsPlaying(false);
      setHasError(false);
      setIsLoading(true);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [selectedId, clips]);

  const goPrevClip = useCallback(() => {
    if (!selectedId || !clips || clips.length === 0) return;
    
    const currentIndex = clips.findIndex(c => String(c.id) === String(selectedId));
    
    if (currentIndex <= 0) return;
    
    const prevClip = clips[currentIndex - 1];
    if (prevClip) {
      setSelectedId(String(prevClip.id));
      pendingAutoplayRef.current = true;
      setIsPlaying(false);
      setHasError(false);
      setIsLoading(true);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [selectedId, clips]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.playbackRate = settings.playbackRate;
  }, [settings.playbackRate, selectedId]);

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
          .catch(() => {});
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
  }, [selectedId, goNextClip]);

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
      video.currentTime = Math.max(
        0,
        Math.min(duration, video.currentTime + seconds),
      );
    },
    [duration, hasError],
  );

  // 이벤트 전파 차단을 포함한 핸들러들
  const handleTogglePlay = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    togglePlay();
  }, [togglePlay]);

  const handleStepTime = useCallback((e, seconds) => {
    e.preventDefault();
    e.stopPropagation();
    stepTime(seconds);
  }, [stepTime]);

  const handleGoNextClip = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    goNextClip();
  }, [goNextClip]);

  const handleGoPrevClip = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    goPrevClip();
  }, [goPrevClip]);

  const handleTimelineClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const video = videoRef.current;
      const tl = timelineRef.current;
      if (!video || !tl || hasError || duration === 0) return;
      const rect = tl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const padding = 10;
      const trackWidth = rect.width - padding * 2;
      const rel = Math.max(0, Math.min(trackWidth, x - padding));
      video.currentTime = (rel / trackWidth) * duration;
    },
    [duration, hasError],
  );

  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const video = videoRef.current;
      const tl = timelineRef.current;
      if (!video || !tl || hasError || duration === 0) return;
      handleTimelineClick(e);
      const onMove = (me) => {
        me.preventDefault();
        me.stopPropagation();
        handleTimelineClick(me);
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [duration, hasError, handleTimelineClick],
  );

  // 키보드 이벤트 중복 방지
  useEffect(() => {
    const onKey = (e) => {
      if (
        showMagicPencil ||
        showMemo ||
        e.target?.tagName === 'INPUT' ||
        e.target?.tagName === 'TEXTAREA' ||
        e.target?.isContentEditable
      ) {
        return;
      }

      if (e.defaultPrevented) return;

      const key = e.key.toUpperCase();
      const backwardKey = settings?.hotkeys?.backward?.toUpperCase?.() || 'A';
      const forwardKey = settings?.hotkeys?.forward?.toUpperCase?.() || 'D';
      const nextKey = settings?.hotkeys?.nextVideo?.toUpperCase?.() || 'N';
      const prevKey = settings?.hotkeys?.prevVideo?.toUpperCase?.() || 'M';

      let handled = false;

      if (key === ' ' && !e.repeat) {
        e.preventDefault();
        e.stopPropagation();
        togglePlay();
        handled = true;
      } else if (key === backwardKey) {
        e.preventDefault();
        e.stopPropagation();
        stepTime(-settings.skipTime);
        handled = true;
      } else if (key === forwardKey) {
        e.preventDefault();
        e.stopPropagation();
        stepTime(settings.skipTime);
        handled = true;
      } else if (key === nextKey) {
        e.preventDefault();
        e.stopPropagation();
        goNextClip();
        handled = true;
      } else if (key === prevKey) {
        e.preventDefault();
        e.stopPropagation();
        goPrevClip();
        handled = true;
      }

      if (handled) {
        e.stopImmediatePropagation();
      }
    };

    document.addEventListener('keydown', onKey, { capture: true });
    return () => document.removeEventListener('keydown', onKey, { capture: true });
  }, [
    togglePlay,
    stepTime,
    settings,
    showMagicPencil,
    showMemo,
    goNextClip,
    goPrevClip,
  ]);

  const formatTime = (sec) => {
    if (isNaN(sec) || sec === null) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const downLabel = useMemo(
    () => (selected ? getDownDisplay(selected) : ''),
    [selected],
  );

  const homeName = teamMeta?.homeName || 'Home';
  const awayName = teamMeta?.awayName || 'Away';
  const homeLogo = teamMeta?.homeLogo || null;
  const awayLogo = teamMeta?.awayLogo || null;
const scoreHome = selected?.StartScore?.[0]?.Home ?? selected?.scoreHome ?? 0;
const scoreAway = selected?.StartScore?.[0]?.Away ?? selected?.scoreAway ?? 0;
  const quarter = selected?.quarter ?? 1;

  const teamSummary = summaries.team;
  const quarterSummary = summaries.quarter;
  const playTypeSummary = filters.playType
    ? PT_LABEL[filters.playType]
    : '유형';
  const significantSummary = summaries.significant;

  // 컨테이너 클릭 이벤트 차단
  const handleContainerClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="videoPlayerPage">
      <div className="videoContainer" onClick={handleContainerClick}>
        <button 
          className="videoBackButton" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(-1);
          }}
        >
          <IoClose size={24} />
        </button>
        <button
          className="videoModalToggleButton"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsModalOpen((o) => !o);
          }}
        >
          <HiOutlineMenuAlt3 size={24} />
        </button>
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
            <div className="scoreDown">{downLabel}</div>
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
                  {isLoading && (
                    <div className="videoLoadingMessage">Loading...</div>
                  )}
                  {hasError && (
                    <div className="videoErrorMessage">
                      <div>비디오를 로드할 수 없습니다</div>
                      <div className="videoErrorUrl">ID: {selected?.id}</div>
                    </div>
                  )}
                  <video
                    key={`${selected?.id}_${selected?.clipUrl}`}
                    ref={videoRef}
                    className={`videoElement ${
                      isLoading || hasError ? 'hidden' : ''
                    }`}
                    src={selected?.clipUrl || ''}
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
        <div className="floatingToolButtons">
          <button
            className="floatingToolBtn memoBtn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMemo(true);
            }}
            title="메모 작성"
          >
            <FaStickyNote size={24} />
            {memos[selectedId] && <span className="memoIndicator"></span>}
          </button>
          <button
            className="floatingToolBtn magicPencilBtn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMagicPencil(true);
            }}
            disabled={isPlaying || hasError || !selected || hasNoVideo}
            title="매직펜슬 (일시정지 상태에서만 사용 가능)"
          >
            <FaPencilAlt size={24} />
          </button>
        </div>
        <div className="videoEditorControls">
          <div className="videoControlsTop">
            <button
              className="videoPlayButton"
              onClick={handleTogglePlay}
              disabled={hasError || !selected || hasNoVideo}
            >
              {isPlaying ? (
                <IoPauseCircleOutline size={32} />
              ) : (
                <IoPlayCircleOutline size={32} />
              )}
            </button>
            <div className="videoTimeInfo">
              <span className="videoCurrentTime">
                {formatTime(currentTime)}
              </span>
              <span className="videoTimeDivider">/</span>
              <span className="videoDuration">{formatTime(duration)}</span>
            </div>
            <div className="videoFrameNavigation">
              <button
                className="videoFrameStepButton"
                onClick={(e) => handleStepTime(e, -settings.skipTime)}
                disabled={hasError || !selected}
                title={`Previous ${settings.skipTime}s (A)`}
              >
                ◀ {settings.skipTime}s
              </button>
              <button
                className="videoFrameStepButton"
                onClick={(e) => handleStepTime(e, settings.skipTime)}
                disabled={hasError || !selected}
                title={`Next ${settings.skipTime}s (D)`}
              >
                {settings.skipTime}s ▶
              </button>
              <button
                className="videoFrameStepButton"
                onClick={handleGoPrevClip}
                disabled={!selected || !clipPosition || clipPosition.isFirst}
                title="Previous Clip (M)"
              >
                이전 클립
              </button>
              <button
                className="videoFrameStepButton"
                onClick={handleGoNextClip}
                disabled={!selected || !clipPosition || clipPosition.isLast}
                title="Next Clip (N)"
              >
                다음 클립
              </button>
            </div>
          </div>
          <div className="videoTimelineContainer">
            <div
              ref={timelineRef}
              className="videoTimeline"
              onMouseDown={handleMouseDown}
            >
              <div className="videoTimelineTrack">
                <div
                  className="videoTimelineProgress"
                  style={{
                    width:
                      duration > 0
                        ? `${(currentTime / duration) * 100}%`
                        : '0%',
                  }}
                />
                <div
                  className="videoTimelineHandle"
                  style={{
                    left:
                      duration > 0
                        ? `${(currentTime / duration) * 100}%`
                        : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`videoSideModal ${isModalOpen ? 'open' : ''}`}>
        <div className="videoModalClose">
          <button
            className="videoCloseButton"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsModalOpen(false);
            }}
          >
            <IoClose size={20} />
          </button>
        </div>
        <div className="videoModalContent">
          <div className="videoMatchInfo">
            <div className="videoMatchTeams">
              <div className="videoMatchHome">
                {homeLogo ? (
                  <img
                    src={homeLogo}
                    alt={homeName}
                    className="videoTeamLogos"
                  />
                ) : (
                  <div className="videoTeamLogos placeholder">
                    {awayName[0]}
                  </div>
                )}
                <span>{awayName}</span>
              </div>
            </div>
          </div>
          <div
            className="videoFilterControls"
            onClick={(e) => e.stopPropagation()}
          >
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFilterChange('quarter', null);
                    closeAllMenus();
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFilterChange('quarter', q);
                      closeAllMenus();
                    }}
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFilterChange('team', null);
                    closeAllMenus();
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFilterChange('team', opt.value);
                      closeAllMenus();
                    }}
                  >
                    {opt.logo && (
                      <img className="ff-dd-avatar" src={opt.logo} alt="" />
                    )}
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
                  className={`ff-dd-item ${
                    !filters.playType ? 'selected' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFilterChange('playType', null);
                    closeAllMenus();
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFilterChange('playType', code);
                      closeAllMenus();
                    }}
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
                      className={`ff-dd-item ${
                        filters.significantPlay?.includes(label)
                          ? 'selected'
                          : ''
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFilterChange('significantPlay', label);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="ff-dd-actions">
                  <button
                    className="ff-dd-clear"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFilters((p) => ({ ...p, significantPlay: [] }));
                    }}
                  >
                    모두 해제
                  </button>
                  <button 
                    className="ff-dd-close" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      closeAllMenus();
                    }}
                  >
                    닫기
                  </button>
                </div>
              </Dropdown>
            </div>
            <div className="filterRow">
              <button
                type="button"
                className="videoFilterResetButton"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearAllFilters();
                }}
              >
                초기화
              </button>
            </div>
          </div>
          <div className="videoPlaysList">
            {clips.length > 0 ? (
              clips.map((p) => (
                <div
                  key={p.id}
                  className={`clip-row ${
                    isPlaySelected(p.id) ? 'selected' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selectPlay(p.id, { autoplay: true });
                  }}
                >
                  <div className="quarter-name">
                    <div>{p.quarter}Q</div>
                  </div>
                  <div className="clip-rows">
                    <div className="vid-clip-row1">
                      <div className="clip-down">{getDownDisplay(p)}</div>
                      <div className="clip-type">
                        #{PT_LABEL[p.playType] || p.playType}
                      </div>
                    </div>
                    <div className="vid-clip-row2">
                      <div className="clip-oT">{p.offensiveTeam}</div>
                      {Array.isArray(p.significant) &&
                      p.significant.length > 0 ? (
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
              <div className="videoNoPlaysMessage">
                일치하는 클립이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="videoModalOverlay"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsModalOpen(false);
          }}
        />
      )}
      {contextMenu.visible && (
        <div
          className="customContextMenu"
          style={{
            position: 'fixed',
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            zIndex: 9999,
          }}
        >
          <div className="contextMenuItem" onClick={handleSystemSettings}>
            ⚙️ 시스템 설정
          </div>
          <div className="contextMenuItem" onClick={handleEditGameData}>
            📝 경기데이터 수정
          </div>
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
          down: selected?.down,
          yardsToGo: selected?.yardsToGo,
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
        <div
          className="videoContainer"
          style={{ justifyContent: 'center', alignItems: 'center' }}
        >
          <div className="videoErrorMessage">
            클립 정보를 찾을 수 없습니다.
            <button
              onClick={() => navigate(-1)}
              style={{ marginTop: '1rem', cursor: 'pointer' }}
            >
              이전 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <PlayerCore stateData={location.state} />;
}