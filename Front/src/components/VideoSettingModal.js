import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { IoPlayCircleOutline, IoCloseCircleOutline } from 'react-icons/io5';
import { useVideoSettings } from '../hooks/useVideoSettings';
import { useStatInitial } from '../hooks/useStatInitial';
import './VideoSettingModal.css';
import { useNavigate } from 'react-router-dom';
import { GoScreenFull } from 'react-icons/go';

export default function VideoSettingModal({ isVisible, onClose }) {
  const navigate = useNavigate();
  const {
    settings,
    updateSetting,
    updateHotkey,
    resetSettings,
    getKeyFromEvent,
  } = useVideoSettings();
  const {
    initialValues,
    updateLeague,
    updateDivision,
    leagueHasDivisions,
    getLeagueOptions,
    getDivisionOptions,
  } = useStatInitial();
  const [currentHotkey, setCurrentHotkey] = useState(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // ESC로 닫기
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // 재생속도 반영
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = settings.playbackRate;
  }, [settings.playbackRate]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying((v) => !v);
  };

  const handleHotkeyInput = (action, e) => {
    e.preventDefault();

    // getKeyFromEvent를 사용하여 언어 설정과 관계없이 키 인식
    const key = getKeyFromEvent(e);

    if (key) {
      updateHotkey(action, key);
      setCurrentHotkey(null);
    }
  };

  if (!isVisible) return null;

  return createPortal(
    <div className="vs-overlay" onClick={onClose}>
      <div
        className="vs-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="비디오 설정"
      >
        {/* === 기존 설정 UI 내용 시작 === */}
        <div className="settings-page-container">
          <div className="settings-panel">
            {/* 1. 비디오 */}
            <div className="settings-section video-settings-section">
              <div className="vs-top">
                <div className="section-header">
                  <span className="section-number">1</span>
                  <h4>비디오</h4>
                </div>
                <IoCloseCircleOutline className="vs-close" onClick={onClose} />
              </div>
              <div className="section-description">
                <div className="test-video-container">
                  <label>테스트 영상 재생</label>
                  <div className="video-player-frame">
                    <video
                      ref={videoRef}
                      src="https://www.pexels.com/ko-kr/download/video/9441427/"
                      controls={false}
                    />
                    <button className="play-button" onClick={togglePlay}>
                      <IoPlayCircleOutline size={48} />
                    </button>
                    <button
                      className="fullscreen-button"
                      onClick={() => navigate('/service/testvideo')}
                      aria-label="전체화면"
                    >
                      <GoScreenFull size={20} />
                    </button>
                  </div>
                </div>

                <div className="settings-row">
                  {/* 재생 속도 */}
                  <div className="setting-item">
                    <label htmlFor="vs-playback">영상 재생 속도 제어</label>

                    {/* 현재 값 표시 (실시간) */}
                    <div
                      className="sr-only"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {' '}
                    </div>

                    <div className="slider-control">
                      <span>0.1X</span>
                      <input
                        id="vs-playback"
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                        value={settings.playbackRate}
                        onChange={(e) =>
                          updateSetting(
                            'playbackRate',
                            parseFloat(e.target.value),
                          )
                        }
                        aria-valuemin={0.1}
                        aria-valuemax={2.0}
                        aria-valuenow={settings.playbackRate}
                        aria-label="재생 속도"
                      />
                      <span>2X</span>

                      {/* 우측 숫자 배지 */}
                      <span className="slider-value-badge">
                        {settings.playbackRate.toFixed(1)}X
                      </span>
                    </div>
                  </div>

                  {/* 건너뛰기 시간 */}
                  <div className="setting-item">
                    <label htmlFor="vs-skip">영상 건너뛰기 시간 조절</label>

                    {/* 현재 값 표시 (실시간) */}
                    <div
                      className="sr-only"
                      aria-live="polite"
                      aria-atomic="true"
                    ></div>

                    <div className="slider-control">
                      <span>0.1초</span>
                      <input
                        id="vs-skip"
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                        value={settings.skipTime}
                        onChange={(e) =>
                          updateSetting('skipTime', parseFloat(e.target.value))
                        }
                        aria-valuemin={0.1}
                        aria-valuemax={2.0}
                        aria-valuenow={settings.skipTime}
                        aria-label="건너뛰기 시간"
                      />
                      <span>2초</span>

                      {/* 우측 숫자 배지 */}
                      <span className="slider-value-badge">
                        {settings.skipTime.toFixed(1)}초
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 인터페이스 */}
            <div className="settings-section interface-settings-section">
              <div className="vs-top">
                <div className="section-header">
                  <span className="section-number">2</span>
                  <h4>인터페이스</h4>
                </div>
              </div>
              <div className="settings-row">
                <div
                  className="setting-item"
                  style={{ display: 'flex', gap: '25px' }}
                >
                  <label>언어 설정</label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    style={{ padding: '20px 30px', textSize: '24px' }}
                  >
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div
                  className="setting-item"
                  style={{ display: 'flex', gap: '25px' }}
                >
                  <label>화면 비율 설정</label>
                  <select
                    value={settings.screenRatio}
                    onChange={(e) =>
                      updateSetting('screenRatio', e.target.value)
                    }
                    style={{ padding: '20px 30px', textSize: '24px' }}
                  >
                    <option value="1920:1080">1920:1080</option>
                    <option value="1280:720">1280:720</option>
                  </select>
                </div>
                <div className="setting-item initial-screen-item">
                  <label>초기화면 설정</label>
                  <div className="initial-screen-settings">
                    <span>리그 / 부 </span>
                    <select
                      value={initialValues.league}
                      onChange={(e) => updateLeague(e.target.value)}
                    >
                      {getLeagueOptions().map((league) => (
                        <option key={league.value} value={league.value}>
                          {league.label}
                        </option>
                      ))}
                    </select>

                    {/* 선택된 리그가 디비전이 있는 경우에만 표시 */}
                    {leagueHasDivisions(initialValues.league) ? (
                      <select
                        value={initialValues.division}
                        onChange={(e) => updateDivision(e.target.value)}
                      >
                        {getDivisionOptions().map((division) => (
                          <option key={division} value={division}>
                            {division}
                          </option>
                        ))}
                      </select>
                    ) : (
                      // 부 구분이 없는 리그는 비활성화된 select 표시
                      <select value="" disabled>
                        <option value=""></option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. 단축키 */}
            <div className="settings-section hotkey-settings-section">
              <div className="vs-top">
                <div className="section-header">
                  <span className="section-number">3</span>
                  <h4>단축키 설정</h4>
                </div>
              </div>
              <div className="hotkey-grid">
                <div className="hotkey-item">
                  <label>앞으로 넘기기:</label>
                  <input
                    type="text"
                    value={
                      currentHotkey === 'forward'
                        ? ''
                        : settings.hotkeys.forward
                    }
                    readOnly
                    onFocus={() => setCurrentHotkey('forward')}
                    onBlur={() => setCurrentHotkey(null)}
                    onKeyDown={(e) => handleHotkeyInput('forward', e)}
                  />
                </div>

                <div className="hotkey-item">
                  <label>뒤로 넘기기:</label>
                  <input
                    type="text"
                    value={
                      currentHotkey === 'backward'
                        ? ''
                        : settings.hotkeys.backward
                    }
                    readOnly
                    onFocus={() => setCurrentHotkey('backward')}
                    onBlur={() => setCurrentHotkey(null)}
                    onKeyDown={(e) => handleHotkeyInput('backward', e)}
                  />
                </div>

                <div className="hotkey-item">
                  <label>다음 영상 재생:</label>
                  <input
                    type="text"
                    value={
                      currentHotkey === 'nextVideo'
                        ? ''
                        : settings.hotkeys.nextVideo
                    }
                    readOnly
                    onFocus={() => setCurrentHotkey('nextVideo')}
                    onBlur={() => setCurrentHotkey(null)}
                    onKeyDown={(e) => handleHotkeyInput('nextVideo', e)}
                  />
                </div>

                <div className="hotkey-item">
                  <label>이전 영상 재생:</label>
                  <input
                    type="text"
                    value={
                      currentHotkey === 'prevVideo'
                        ? ''
                        : settings.hotkeys.prevVideo
                    }
                    readOnly
                    onFocus={() => setCurrentHotkey('prevVideo')}
                    onBlur={() => setCurrentHotkey(null)}
                    onKeyDown={(e) => handleHotkeyInput('prevVideo', e)}
                  />
                </div>
              </div>

              <div className="settings-buttons">
                <button className="cancel-button" onClick={resetSettings}>
                  취소
                </button>
                <button className="primary-button" onClick={onClose}>
                  설정 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
