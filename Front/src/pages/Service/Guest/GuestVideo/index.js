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
  IoVolumeMedium,
  IoVolumeMute,
} from 'react-icons/io5';
import { GoScreenFull, GoScreenNormal } from 'react-icons/go';
import { TbArrowForwardUpDouble, TbPlayerTrackNext } from 'react-icons/tb';
import { HiOutlineMenuAlt3 } from 'react-icons/hi';
import { useClipFilter } from '../../../../hooks/useClipFilter';
import { useVideoSettings } from '../../../../hooks/useVideoSettings';
import VideoSettingModal from '../../../../components/VideoSettingModal';

/* ================= Dropdown (간소화된 버전) ================= */
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
  KICKOFF: '킥오프',
  PUNT: '펀트',
  PAT: 'PAT',
  TPT: '2PT',
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

const SPECIAL_DOWN_MAP = { TPT: '2PT', KICKOFF: '킥오프', PAT: 'PAT' };

const ordinal = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return '';
  const sfx = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return `${num}${sfx[(v - 20) % 10] || sfx[v] || sfx[0]}`;
};

const getDownDisplay = (c) => {
  if (!c) return '';
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

/* ================= Player Core for Guests ================= */
function GuestPlayerCore({ stateData }) {
  const navigate = useNavigate();
  const { settings } = useVideoSettings(); // 시스템 설정 훅 사용
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const { rawClips, initialFilters, teamOptions, teamMeta, initialPlayId } = stateData;

  const {
    clips,
    filters,
    setFilters,
    summaries,
    handleFilterChange,
    clearAllFilters,
  } = useClipFilter({
    rawClips: rawClips || [],
    initialFilters: initialFilters || {},
    teamOptions: teamOptions || [],
    opposites: OPPOSITES,
    significantPlayField: 'displaySignificantPlays',
    persistKey: `guestVideoFilters:${teamMeta?.gameId || 'default'}`,
  });

  const videoRef = useRef(null);
  const timelineRef = useRef(null);
  const pendingAutoplayRef = useRef(false);
  const menuRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [openMenu, setOpenMenu] = useState(null);
  const [showVideoSettingModal, setShowVideoSettingModal] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (clips && clips.length > 0 && !selectedId) {
      const targetClip = initialPlayId ? clips.find((c) => String(c.id) === String(initialPlayId)) : clips[0];
      setSelectedId(String(targetClip?.id || clips[0].id));
    }
  }, [clips, initialPlayId, selectedId]);

  useEffect(() => {
    if (!selectedId || !clips || clips.length === 0) return;
    const isCurrentClipInResults = clips.some((c) => String(c.id) === String(selectedId));
    if (!isCurrentClipInResults) {
      setSelectedId(String(clips[0].id));
    }
  }, [clips, selectedId]);

  // 컨텍스트 메뉴 핸들러
  const handleVideoContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(
    () => setContextMenu({ visible: false, x: 0, y: 0 }),
    [],
  );

  const handleSystemSettings = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setShowVideoSettingModal(true);
      closeContextMenu();
    },
    [closeContextMenu],
  );

  useEffect(() => {
    if (!contextMenu.visible) return;
    const onAnyPointer = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      closeContextMenu();
    };
    document.addEventListener('mousedown', onAnyPointer, true);
    document.addEventListener('contextmenu', onAnyPointer, true);
    const onKey = (e) => {
      if (e.key === 'Escape') closeContextMenu();
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onAnyPointer, true);
      document.removeEventListener('contextmenu', onAnyPointer, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [contextMenu.visible, closeContextMenu]);
  
  const selected = useMemo(() => clips.find((p) => String(p.id) === selectedId) || null, [clips, selectedId]);
  const videoSourceUrl = selected?.videoUrl || '';

  const initializationDone = useRef(false); 
  const selectPlay = useCallback((id) => {
    const newId = String(id);
    if (newId === selectedId) return;
    setSelectedId(newId);
    pendingAutoplayRef.current = true;
    setIsPlaying(false);
    setHasError(false);
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
  }, [selectedId]);
  useEffect(() => {
    if (initializationDone.current || !clips || clips.length === 0) return;

    const targetClip = initialPlayId 
      ? clips.find((c) => String(c.id) === String(initialPlayId)) 
      : clips[0];

    if (targetClip) {
      // setSelectedId 대신 selectPlay를 호출하여 자동 재생 로직을 트리거
      selectPlay(String(targetClip.id));
      initializationDone.current = true;
    }
  }, [clips, initialPlayId, selectPlay]);

  useEffect(() => {
    if (!selectedId || !clips || clips.length === 0) return;
    const isCurrentClipInResults = clips.some((c) => String(c.id) === String(selectedId));
    if (!isCurrentClipInResults) {
      setSelectedId(String(clips[0].id));
    }
  }, [clips, selectedId]);

  const clipPosition = useMemo(() => {
    if (!selectedId || !clips || clips.length === 0) return null;
    const currentIndex = clips.findIndex((c) => String(c.id) === String(selectedId));
    if (currentIndex === -1) return null;
    return {
      current: currentIndex + 1,
      total: clips.length,
      isFirst: currentIndex === 0,
      isLast: currentIndex === clips.length - 1,
    };
  }, [selectedId, clips]);

  const goNextClip = useCallback(() => {
    if (!clipPosition || clipPosition.isLast) return;
    const nextClip = clips[clipPosition.current];
    if (nextClip) selectPlay(nextClip.id);
  }, [clips, clipPosition, selectPlay]);

  const goPrevClip = useCallback(() => {
    if (!clipPosition || clipPosition.isFirst) return;
    const prevClip = clips[clipPosition.current - 2];
    if (prevClip) selectPlay(prevClip.id);
  }, [clips, clipPosition, selectPlay]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || hasError || !selected || !videoSourceUrl) return;
    
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      // 비디오가 로드되지 않았으면 먼저 로드
      if (video.readyState === 0) {
        video.load();
      }
      
      video.play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error('재생 실패:', error);
          setHasError(true);
        });
    }
  }, [isPlaying, hasError, selected, videoSourceUrl]);

  // 비디오 소스 변경 시 로드
  useEffect(() => {
    const video = videoRef.current;
    if (video && videoSourceUrl) {
      video.load();
    }
  }, [videoSourceUrl]);
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
    };
    
    const onTimeUpdate = () => setCurrentTime(video.currentTime || 0);
    
    const onEnded = () => { 
      setIsPlaying(false); 
      if (settings.autoNext) goNextClip(); 
    };
    
    const onError = () => { 
      setHasError(true); 
      setIsLoading(false); 
    };
    
    const onCanPlay = () => {
      setIsLoading(false);
      setHasError(false);
      if (pendingAutoplayRef.current) {
        pendingAutoplayRef.current = false;
        video.play()
          .then(() => setIsPlaying(true))
          .catch((error) => console.error('자동재생 실패:', error));
      }
    };
    
    const onLoadStart = () => setIsLoading(true);
    
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('loadstart', onLoadStart);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('loadstart', onLoadStart);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [selectedId, goNextClip, settings.autoNext]);

  const formatTime = (sec) => {
    if (isNaN(sec) || sec === null) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const stepTime = useCallback((seconds) => {
    const video = videoRef.current;
    if (!video || hasError || duration === 0) return;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  }, [duration, hasError]);
  
  // 키보드 단축키 - 설정값 사용
  useEffect(() => {
    const onKey = (e) => {
      if (e.target?.tagName === 'INPUT' || e.target?.tagName === 'TEXTAREA') return;
      
      const key = e.key.toUpperCase();
      const backwardKey = settings?.hotkeys?.backward?.toUpperCase?.() || 'A';
      const forwardKey = settings?.hotkeys?.forward?.toUpperCase?.() || 'D';
      const nextKey = settings?.hotkeys?.nextVideo?.toUpperCase?.() || 'N';
      const prevKey = settings?.hotkeys?.prevVideo?.toUpperCase?.() || 'M';
      
      if (key === ' ') { 
        e.preventDefault(); 
        togglePlay(); 
      }
      else if (key === backwardKey) { 
        e.preventDefault(); 
        stepTime(-settings.skipTime); 
      }
      else if (key === forwardKey) { 
        e.preventDefault(); 
        stepTime(settings.skipTime); 
      }
      else if (key === nextKey) { 
        e.preventDefault(); 
        goNextClip(); 
      }
      else if (key === prevKey) { 
        e.preventDefault(); 
        goPrevClip(); 
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [togglePlay, stepTime, goNextClip, goPrevClip, settings]);

  const handleTimelineClick = useCallback((e) => {
    const video = videoRef.current;
    const tl = timelineRef.current;
    if (!video || !tl || hasError || duration === 0) return;
    const rect = tl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    video.currentTime = (x / rect.width) * duration;
  }, [duration, hasError]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!document.fullscreenElement) {
      el?.requestFullscreen?.()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document.exitFullscreen?.()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const homeName = teamMeta?.homeName || 'Home';
  const awayName = teamMeta?.awayName || 'Away';
  const homeLogo = teamMeta?.homeLogo || null;
  const awayLogo = teamMeta?.awayLogo || null;
  const scoreHome = selected?.scoreHome ?? 0;
  const scoreAway = selected?.scoreAway ?? 0;
  const quarter = selected?.quarter ?? 1;
  const downLabel = useMemo(() => (selected ? getDownDisplay(selected) : ''), [selected]);

  const teamSummary = summaries.team;
  const quarterSummary = summaries.quarter;
  const playTypeSummary = filters.playType ? PT_LABEL[filters.playType] : '유형';
  const significantSummary = summaries.significant;
  const closeAllMenus = useCallback(() => setOpenMenu(null), []);
  const handleMenuToggle = useCallback((menuName) => { 
    setOpenMenu((prev) => (prev === menuName ? null : menuName)); 
  }, []);

  return (
    <div className="videoPlayerPage">
      <div className="videoContainer" ref={containerRef}>
        <button className="videoBackButton" onClick={() => navigate(-1)}>
          <IoClose size={24} />
        </button>
        <button className="videoModalToggleButton" onClick={() => setIsModalOpen((o) => !o)}>
          <HiOutlineMenuAlt3 size={24} />
        </button>

        <div className="videoScoreboard">
          <div className="scoreTeam leftTeam">
            {homeLogo && <img src={homeLogo} alt={homeName} className="scoreTeamLogo" />}
            <div className="scoreTeamInfo">
              <span className="scoreTeamName">{homeName}</span>
              <span className="scoreTeamScore">{scoreHome}</span>
            </div>
          </div>
          <div className="scoreCenter">
            <div className="scoreQuarter">Q{quarter}</div>
            <div className="scoreDown">{downLabel}</div>
          </div>
          <div className="scoreTeam rightTeam">
            <div className="scoreTeamInfo">
              <span className="scoreTeamName">{awayName}</span>
              <span className="scoreTeamScore">{scoreAway}</span>
            </div>
            {awayLogo && <img src={awayLogo} alt={awayName} className="scoreTeamLogo" />}
          </div>
        </div>

        <div className="videoScreen">
          <div className="videoContent">
            {isLoading && !hasError && <div className="videoLoadingMessage">Loading...</div>}
            {hasError && <div className="videoErrorMessage">비디오를 재생할 수 없습니다.</div>}
            {!selected && clips.length === 0 && <div className="videoNoVideoMessage">표시할 클립이 없습니다.</div>}
            <video
              key={selectedId}
              ref={videoRef}
              className={`videoElement ${isLoading || hasError ? 'hidden' : ''}`}
              src={videoSourceUrl}
              preload="metadata"
              autoPlay={false}
              playsInline
              muted
              onContextMenu={handleVideoContextMenu}
            />
          </div>
        </div>

        <div className="videoEditorControls">
          <div className="videoControlsTop">
            <button className="videoPlayButton" onClick={togglePlay} disabled={hasError || !selected}>
              {isPlaying ? <IoPauseCircleOutline size={32} /> : <IoPlayCircleOutline size={32} />}
            </button>
            <div className="videoFrameNavigation">
              <button 
                className="skipSquare skipSquare--back" 
                onClick={() => stepTime(-settings.skipTime)} 
                disabled={hasError || !selected}
                title={`Previous ${settings.skipTime}s (${settings.hotkeys.backward})`}
              >
                <TbArrowForwardUpDouble className="skipSquare__icon" />
                <span className="skipSquare__sec">{settings.skipTime}</span>
              </button>
              <button 
                className="skipSquare" 
                onClick={() => stepTime(settings.skipTime)} 
                disabled={hasError || !selected}
                title={`Next ${settings.skipTime}s (${settings.hotkeys.forward})`}
              >
                <TbArrowForwardUpDouble className="skipSquare__icon" />
                <span className="skipSquare__sec">{settings.skipTime}</span>
              </button>
              <button 
                className="videoFrameStepButton" 
                onClick={goPrevClip} 
                disabled={!clipPosition || clipPosition.isFirst}
                title={`Previous Clip (${settings.hotkeys.prevVideo})`}
              >
                <TbPlayerTrackNext style={{ transform: 'scaleX(-1)'}} />
              </button>
              <button 
                className="videoFrameStepButton" 
                onClick={goNextClip} 
                disabled={!clipPosition || clipPosition.isLast}
                title={`Next Clip (${settings.hotkeys.nextVideo})`}
              >
                <TbPlayerTrackNext />
              </button>
            </div>
          </div>
          <div className="videoTimelineContainer">
            <div className="timeLabel">{formatTime(currentTime)}</div>
            <div ref={timelineRef} className="ctrl timeline" onClick={handleTimelineClick}>
              <div className="timelineTrack" />
              <div className="timelineProgress" style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }} />
              <div className="timelineHandle" style={{ left: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }} />
            </div>
            <div className="timeLabel dim">{formatTime(duration)}</div>
            <div className="volume">
              <button className="ctrl volBtn" onClick={() => setVolume((v) => (v > 0 ? 0 : 0.5))}>
                {volume > 0 ? <IoVolumeMedium size={18} /> : <IoVolumeMute size={18} />}
              </button>
              <input 
                className="volSlider" 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))} 
              />
            </div>
            <button className="ctrl fsBtn" onClick={toggleFullscreen}>
              {isFullscreen ? <GoScreenNormal size={18} /> : <GoScreenFull size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className={`videoSideModal ${isModalOpen ? 'open' : ''}`}>
        <div className="videoModalClose">
          <button className="videoCloseButton" onClick={() => setIsModalOpen(false)}>
            <IoClose size={20} />
          </button>
        </div>
        <div className="videoModalContent">
          <div className="videoFilterControls">
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
                {[1, 2, 3, 4].map((q) => (
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
                {Object.entries(PT_LABEL).map(([code, label]) => (
                  <button 
                    key={code} 
                    className={`ff-dd-item ${filters.playType === code ? 'selected' : ''}`} 
                    onClick={() => { handleFilterChange('playType', code); closeAllMenus(); }}
                  >
                    {label}
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
                  {Object.entries(SIGNIFICANT_PLAYS).map(([code, label]) => (
                    <button 
                      key={code} 
                      className={`ff-dd-item ${filters.significantPlay?.includes(label) ? 'selected' : ''}`} 
                      onClick={() => handleFilterChange('significantPlay', label)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="ff-dd-actions">
                  <button 
                    className="ff-dd-clear" 
                    onClick={() => setFilters((p) => ({ ...p, significantPlay: [] }))}
                  >
                    모두 해제
                  </button>
                  <button className="ff-dd-close" onClick={closeAllMenus}>
                    닫기
                  </button>
                </div>
              </Dropdown>
            </div>
            <div className="filterRow">
              <button type="button" className="videoFilterResetButton" onClick={clearAllFilters}>
                초기화
              </button>
            </div>
          </div>
          <div className="videoPlaysList">
            {clips.length > 0 ? (
              clips.map((p) => (
                <div 
                  key={p.id} 
                  className={`clip-row ${String(p.id) === selectedId ? 'selected' : ''}`} 
                  onClick={() => selectPlay(p.id)}
                >
                  <div className="quarter-name"><div>{p.quarter}Q</div></div>
                  <div className="clip-rows">
                    <div className="vid-clip-row1">
                      <div className="clip-down">{getDownDisplay(p)}</div>
                      <div className="clip-type">#{PT_LABEL[p.playType] || p.playType}</div>
                    </div>
                    <div className="vid-clip-row2">
                      <div className="clip-oT">{p.offensiveTeam}</div>
                      {Array.isArray(p.displaySignificantPlays) && p.displaySignificantPlays.length > 0 ? (
                        <div className="clip-sig">
                          {p.displaySignificantPlays.map((t, idx) => (
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
      
      {/* 컨텍스트 메뉴 */}
      {contextMenu.visible && (
        <div
          ref={menuRef}
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
        </div>
      )}
      
      {/* 시스템 설정 모달 */}
      <VideoSettingModal
        isVisible={showVideoSettingModal}
        onClose={() => setShowVideoSettingModal(false)}
      />
    </div>
  );
}

/* ================= Shell for Guest Player ================= */
export default function GuestVideoPlayer() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state?.rawClips) {
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

  return <GuestPlayerCore stateData={location.state} />;
}


