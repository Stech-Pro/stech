import React, { useEffect, useRef, useState, useCallback } from 'react';
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
import { useVideoSettings } from '../../../hooks/useVideoSettings';

// 💡 기존 스타일 그대로 재사용
import '../../Service/Video/index.css';

export default function TestVideo() {
  const navigate = useNavigate();
  const { state } = useLocation(); // { src } 넘겨받으면 사용
  const { settings } = useVideoSettings();

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const timelineRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // 안전한 샘플 mp4 (state?.src 있으면 그걸 사용)
  const src =
    state?.src ||
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  // 재생속도/볼륨 반영
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = settings.playbackRate;
  }, [settings.playbackRate]);
  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume]);

  // 메타/타임 이벤트
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoaded = () => {
      setDuration(v.duration || 0);
      setCurrentTime(v.currentTime || 0);
    };
    const onTime = () => setCurrentTime(v.currentTime || 0);
    v.addEventListener('loadedmetadata', onLoaded);
    v.addEventListener('timeupdate', onTime);
    return () => {
      v.removeEventListener('loadedmetadata', onLoaded);
      v.removeEventListener('timeupdate', onTime);
    };
  }, []);

  // 전체화면
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

  // 재생/일시정지
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
    } else {
      v.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  // 건너뛰기
  const stepTime = useCallback(
    (sec) => {
      const v = videoRef.current;
      if (!v || !duration) return;
      v.currentTime = Math.max(0, Math.min(duration, v.currentTime + sec));
    },
    [duration],
  );

  // 타임라인 드래그
  const handleTimelineClick = useCallback(
    (e) => {
      const v = videoRef.current;
      const tl = timelineRef.current;
      if (!v || !tl || duration === 0) return;
      const rect = tl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const padding = 10;
      const trackWidth = rect.width - padding * 2;
      const rel = Math.max(0, Math.min(trackWidth, x - padding));
      v.currentTime = (rel / trackWidth) * duration;
    },
    [duration],
  );
  const handleMouseDown = useCallback(
    (e) => {
      handleTimelineClick(e);
      const move = (me) => handleTimelineClick(me);
      const up = () => {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    },
    [handleTimelineClick],
  );

  // 단축키 (A/D/Space/ESC)
  useEffect(() => {
    const onKey = (e) => {
      if (
        e.target?.tagName === 'INPUT' ||
        e.target?.tagName === 'TEXTAREA' ||
        e.target?.isContentEditable
      ) return;
      const key = e.key.toUpperCase();
      const backwardKey = settings?.hotkeys?.backward?.toUpperCase?.() || 'A';
      const forwardKey = settings?.hotkeys?.forward?.toUpperCase?.() || 'D';
      if (key === ' ') {
        e.preventDefault(); togglePlay();
      } else if (key === backwardKey) {
        e.preventDefault(); stepTime(-settings.skipTime);
      } else if (key === forwardKey) {
        e.preventDefault(); stepTime(settings.skipTime);
      } else if (key === 'ESCAPE') {
        navigate(-1);
      }
    };
    document.addEventListener('keydown', onKey, { capture: true });
    return () => document.removeEventListener('keydown', onKey, { capture: true });
  }, [settings, togglePlay, stepTime, navigate]);

  const formatTime = (sec) => {
    if (!Number.isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="videoPlayerPage" ref={containerRef}>
      <div className="player-main-content">
        {/* 🎯 기존 레이아웃: 비디오 영역 + 하단 컨트롤만 남김 */}
        <div className="videoContainer" onClick={(e) => e.stopPropagation()}>
          <button
            className="videoBackButton"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(-1); }}
          >
            <IoClose size={24} />
          </button>

          {/* 상단 메뉴/스코어보드 제거 */}

          <div className="videoScreen">
            <div className="videoPlaceholder">
              <div className="videoContent">
                <video
                  ref={videoRef}
                  className="videoElement"
                  preload="metadata"
                  controls={false}
                  muted
                  playsInline
                >
                  <source src={src} type="video/mp4" />
                </video>
              </div>
            </div>
          </div>

          {/* 🔶 기존 오렌지 컨트롤 스타일 그대로 */}
          <div className="videoEditorControls">
            <div className="videoControlsTop">
              <button
                className="videoPlayButton"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePlay(); }}
              >
                {isPlaying ? <IoPauseCircleOutline size={32} /> : <IoPlayCircleOutline size={32} />}
              </button>

              <div className="videoFrameNavigation">
                <button
                  className="skipSquare skipSquare--back"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); stepTime(-settings.skipTime); }}
                  title={`Previous ${settings.skipTime}s (${settings.hotkeys?.backward || 'A'})`}
                >
                  <TbArrowForwardUpDouble className="skipSquare__icon" />
                  <span className="skipSquare__sec">{settings.skipTime}</span>
                </button>

                <button
                  className="skipSquare"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); stepTime(settings.skipTime); }}
                  title={`Next ${settings.skipTime}s (${settings.hotkeys?.forward || 'D'})`}
                >
                  <TbArrowForwardUpDouble className="skipSquare__icon" />
                  <span className="skipSquare__sec">{settings.skipTime}</span>
                </button>

                {/* 이전/다음은 TestVideo에서는 고정 비활성화 */}
                <button className="videoFrameStepButton" disabled title="Previous Clip (비활성화)">
                  <TbPlayerTrackNext
                    className="prevClipIcon"
                    style={{ transform: 'scaleX(-1)', transformOrigin: '50% 50%' }}
                  />
                </button>
                <button className="videoFrameStepButton" disabled title="Next Clip (비활성화)">
                  <TbPlayerTrackNext className="nextClipIcon" />
                </button>
              </div>
            </div>

            {/* 타임라인/볼륨/전체화면도 기존과 동일 */}
            <div className="videoTimelineContainer">
              <div className="timeLabel">{formatTime(currentTime)}</div>
              <div
                ref={timelineRef}
                className="ctrl timeline"
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleMouseDown(e); }}
                role="slider"
                aria-valuemin={0}
                aria-valuemax={duration || 0}
                aria-valuenow={currentTime || 0}
              >
                <div className="timelineTrack" />
                <div
                  className="timelineProgress"
                  style={{
                    width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                  }}
                />
                <div
                  className="timelineHandle"
                  style={{
                    left: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                  }}
                />
              </div>
              <div className="timeLabel dim">{formatTime(duration)}</div>

              <div className="volume">
                <button
                  className="ctrl volBtn"
                  onClick={() => setVolume((v) => (v > 0 ? 0 : 0.6))}
                  title="Mute/Unmute"
                >
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

              <button className="ctrl fsBtn" onClick={toggleFullscreen} title="Fullscreen">
                {isFullscreen ? <GoScreenNormal size={18} /> : <GoScreenFull size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 사이드모달/매직펜슬/메모 등은 제거 → 순수 테스트 화면 */}
    </div>
  );
}
