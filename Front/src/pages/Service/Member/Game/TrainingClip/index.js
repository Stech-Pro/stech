// src/pages/Service/Member/Game/TrainingClip/index.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { TEAMS, TEAM_BY_ID } from '../../../../../data/TEAMS';
import defaultLogo from '../../../../../assets/images/logos/Stechlogo.svg';
import { useAuth } from '../../../../../context/AuthContext';
import { getVideoUrl } from '../../../../../api/gameAPI';
import '../Clip/ClipPage.css';

export default function TrainingClipPage() {
  const { gameKey: gameKeyParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const MY_TEAM_ID = user?.teamName || user?.team;

  const selfTeam = useMemo(
    () => (MY_TEAM_ID ? TEAM_BY_ID[MY_TEAM_ID] : null) || TEAMS[0] || null,
    [MY_TEAM_ID],
  );
  const logoSrc = selfTeam?.logo || defaultLogo;
  const label = selfTeam?.name || 'Choose Team';

  const gameFromState = location.state?.game || null;

  const resolvedGameKey = useMemo(
    () => gameFromState?.gameKey || gameKeyParam || null,
    [gameFromState?.gameKey, gameKeyParam],
  );

  const [game, setGame] = useState(gameFromState);

  const trainingTeamId = game?.uploader || game?.team;
  const trainingTeamMeta = trainingTeamId ? TEAM_BY_ID[trainingTeamId] : null;

  /* 비디오 파일 재생 함수 (ClipPage와 동일) */
  const playVideoFile = async (quarter, fileName) => {
    try {
      const url = await getVideoUrl(resolvedGameKey, quarter, fileName);
      window.open(url, '_blank');
    } catch (error) {
      console.error('영상 재생 오류:', error);
      alert(error.message || '영상을 재생할 수 없습니다.');
    }
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
        </div>
      </header>

      {/* ===== 본문 ===== */}
      <div className="clip-page-container">
        <div className="clip-left">
          {/* 훈련 영상 헤더 */}
          <div className="clip-header">
            <div className="clip-team left">
              {trainingTeamMeta?.logo && (
                <div className="clip-team-logo">
                  <img
                    src={trainingTeamMeta.logo}
                    alt={`${trainingTeamMeta.name} 로고`}
                    className={`clip-team-logo-img ${
                      trainingTeamMeta.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                    }`}
                  />
                </div>
              )}
              <span className="clip-team-name">
                {trainingTeamMeta?.name || trainingTeamId} 훈련
              </span>
            </div>
            {game?.position && (
              <div className="clip-vs" style={{ fontSize: '14px' }}>
                {game.position}
              </div>
            )}
            <div className="clip-team right"></div>
          </div>

          {/* 훈련 영상 목록 */}
          <div className="clip-list">
            {(game?.videoUrls?.Training || game?.videoUrls?.training) &&
             (game.videoUrls.Training || game.videoUrls.training).length > 0 ? (
              (game.videoUrls.Training || game.videoUrls.training).map((fileName, index) => (
                <div
                  key={`training-video-${index}`}
                  className="training-video-item"
                  onClick={() => playVideoFile('Training', fileName)}
                  style={{
                    cursor: 'pointer',
                    padding: '16px 20px',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#fff',
                    flex: 1,
                  }}>
                    {fileName}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty">업로드된 훈련 영상이 없습니다.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
