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

  /* 훈련 영상을 클립 형태로 변환 */
  const trainingClips = useMemo(() => {
    const videos = game?.videoUrls?.Training || game?.videoUrls?.training;
    if (!videos) return [];

    return videos.map((fileName, index) => ({
      id: `training-${index}`,
      clipKey: `training-${index}`,
      playIndex: index,
      fileName: fileName,
      clipUrl: null, // VideoPlayer에서 getVideoUrl로 가져올 예정
      quarter: 'Training',
      isTraining: true,
    }));
  }, [game?.videoUrls?.Training, game?.videoUrls?.training]);

  /* 클립 클릭 → 비디오 플레이어로 이동 */
  const onClickClip = async (clip) => {
    try {
      // AWS S3에서 실제 영상 URL 가져오기
      const videoUrl = await getVideoUrl(resolvedGameKey, 'Training', clip.fileName);

      // URL을 포함한 클립 데이터로 업데이트
      const clipsWithUrl = trainingClips.map((c) => {
        if (c.clipKey === clip.clipKey) {
          return { ...c, clipUrl: videoUrl };
        }
        return c;
      });

      navigate('/service/video', {
        state: {
          // 훈련 영상 데이터 전달 (URL 포함)
          rawClips: clipsWithUrl,
          initialFilters: {}, // 훈련은 필터 없음
          teamOptions: [],

          // 비디오 플레이어 UI 구성 정보
          initialPlayId: String(clip.clipKey),
          initialPlayIndex: clip.playIndex,
          clipKey: clip.clipKey,
          gameKey: resolvedGameKey,
          isTraining: true, // 훈련 영상 플래그
          teamMeta: {
            teamName: trainingTeamMeta?.name,
            teamLogo: trainingTeamMeta?.logo,
          },
          fileName: clip.fileName, // 훈련 영상 파일명
        },
      });
    } catch (error) {
      console.error('영상 URL 가져오기 실패:', error);
      alert(error.message || '영상을 불러올 수 없습니다.');
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
            {trainingClips.length > 0 ? (
              trainingClips.map((clip) => (
                <div
                  key={clip.id}
                  className="training-video-item"
                  onClick={() => onClickClip(clip)}
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
                    {clip.fileName}
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
