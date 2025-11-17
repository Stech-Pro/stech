import React, { useEffect, useRef, useState, useCallback } from 'react';
import { IoPlayCircleOutline, IoPauseCircleOutline, IoClose } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useVideoSettings } from '../../../../../hooks/useVideoSettings';
import './TestVideo.css';

export default function TestVideo() {
  const { settings } = useVideoSettings();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const src =
    'https://assets.mixkit.co/videos/preview/mixkit-football-players-throwing-a-ball-38747-large.mp4';

  // 재생속도 반영
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = settings.playbackRate;
  }, [settings.playbackRate]);

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

  const stepTime = useCallback(
    (sec) => {
      const v = videoRef.current;
      if (!v || !duration) return;
      v.currentTime = Math.max(0, Math.min(duration, v.currentTime + sec));
    },
    [duration],
  );

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoaded = () => setDuration(v.duration || 0);
    const onTime = () => setCurrentTime(v.currentTime || 0);
    v.addEventListener('loadedmetadata', onLoaded);
    v.addEventListener('timeupdate', onTime);
    return () => {
      v.removeEventListener('loadedmetadata', onLoaded);
      v.removeEventListener('timeupdate', onTime);
    };
  }, []);

  // 단축키 (A / D / Space / ESC)
  useEffect(() => {
    const onKey = (e) => {
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      )
        return;
      const key = e.key.toUpperCase();
      const backwardKey = settings?.hotkeys?.backward?.toUpperCase?.() || 'A';
      const forwardKey = settings?.hotkeys?.forward?.toUpperCase?.() || 'D';
      if (key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (key === backwardKey) {
        e.preventDefault();
        stepTime(-settings.skipTime);
      } else if (key === forwardKey) {
        e.preventDefault();
        stepTime(settings.skipTime);
      } else if (key === 'ESCAPE') {
        navigate(-1);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [settings, togglePlay, stepTime, navigate]);

  const format = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="testvideo-root">
      <header className="testvideo-topbar">
        <button className="testvideo-close" onClick={() => navigate(-1)} title="닫기(ESC)">
          <IoClose size={24} />
        </button>
        <div className="testvideo-title">비디오 세팅 테스트</div>
      </header>

      <main className="testvideo-main">
        <video
          ref={videoRef}
          className="testvideo-video"
          src={src}
          playsInline
          muted
          preload="metadata"
        />
        <button className="testvideo-play" onClick={togglePlay}>
          {isPlaying ? <IoPauseCircleOutline size={80} /> : <IoPlayCircleOutline size={80} />}
        </button>

        <div className="testvideo-controls">
          <button onClick={() => stepTime(-settings.skipTime)}>
            ← {settings.skipTime.toFixed(1)}초
          </button>
          <span>
            {format(currentTime)} / {format(duration)}
          </span>
          <button onClick={() => stepTime(settings.skipTime)}>
            {settings.skipTime.toFixed(1)}초 →
          </button>
        </div>

        <div className="testvideo-info">
          <span>속도: {settings.playbackRate.toFixed(1)}x</span>
          <span>건너뛰기: {settings.skipTime.toFixed(1)}s</span>
          <span>
            단축키: {settings.hotkeys.backward || 'A'} / {settings.hotkeys.forward || 'D'} / Space
          </span>
        </div>
      </main>
    </div>
  );
}
