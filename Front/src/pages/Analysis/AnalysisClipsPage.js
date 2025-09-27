// src/pages/Analysis/AnalysisClipsPage.js
import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlay, FaVideo } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext.js';
import { fetchGameClips } from '../../api/gameAPI.js';
import './AnalysisClipsPage.css';
import { TEAMS, TEAM_BY_ID } from '../../data/TEAMS';
import defaultLogo from '../../assets/images/logos/Stechlogo.svg';

export default function AnalysisClipsPage() {
  const { gameKey } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clips, setClips] = useState([]);
  const [gameInfo, setGameInfo] = useState(null);

  // 관리자 권한 확인
  useEffect(() => {
    // user가 로드되었고, admin이 아닌 경우에만 리다이렉트
    if (user && user.role !== 'admin') {
      navigate('/service');
    }
  }, [user, navigate]);

  // location state에서 게임 정보 가져오기
  useEffect(() => {
    if (location.state?.game) {
      setGameInfo(location.state.game);
    }
  }, [location.state]);

  // 클립 데이터 로드
  useEffect(() => {
    if (!gameKey) return;

    let alive = true;
    async function loadClips() {
      try {
        setLoading(true);
        setError(null);
        const clipsData = await fetchGameClips(gameKey);
        if (alive) {
          setClips(clipsData || []);
        }
      } catch (e) {
        if (alive) {
          setError(e?.message || '클립 데이터를 불러오지 못했습니다.');
        }
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadClips();
    return () => {
      alive = false;
    };
  }, [gameKey]);

  // 뒤로가기
  const goBack = () => {
    navigate('/analysis');
  };

  // 영상 재생
  const playVideo = (clip, index) => {
    if (clip.clipUrl) {
      window.open(clip.clipUrl, '_blank');
    } else {
      alert('영상 URL이 없습니다.');
    }
  };

  // 팀 정보 가져오기
  const getTeamInfo = (teamId) => {
    return TEAM_BY_ID[teamId] || { id: teamId, name: teamId, logo: defaultLogo };
  };

  const homeTeam = gameInfo ? getTeamInfo(gameInfo.homeTeam) : null;
  const awayTeam = gameInfo ? getTeamInfo(gameInfo.awayTeam) : null;

  // 쿼터별로 클립 그룹화
  const clipsByQuarter = clips.reduce((acc, clip, index) => {
    const quarter = clip.quarter || 1;
    if (!acc[quarter]) acc[quarter] = [];
    acc[quarter].push({ ...clip, originalIndex: index });
    return acc;
  }, {});

  // 로딩 중이거나 권한이 없으면 렌더링하지 않음
  if (!user) {
    return <div>로그인 확인 중...</div>;
  }
  
  if (user.role !== 'admin') {
    return <div>접근 권한이 없습니다.</div>;
  }

  return (
    <div className="analysis-clips-page">
      {/* 헤더 */}
      <header className="analysis-clips-header">
        <div className="analysis-clips-header-container">
          <button className="back-button" onClick={goBack}>
            <FaArrowLeft />
            <span>분석 대시보드로 돌아가기</span>
          </button>

          {gameInfo && (
            <div className="game-info-header">
              <div className="game-teams">
                <div className="team-info">
                  {homeTeam?.logo && (
                    <img
                      src={homeTeam.logo}
                      alt={homeTeam.name}
                      className="team-logo"
                    />
                  )}
                  <span className="team-name">{homeTeam?.name || gameInfo.homeTeam}</span>
                </div>
                
                <div className="vs-score">
                  <span className="score">
                    {gameInfo.score?.home || 0} : {gameInfo.score?.away || 0}
                  </span>
                  <span className="vs">VS</span>
                </div>

                <div className="team-info">
                  {awayTeam?.logo && (
                    <img
                      src={awayTeam.logo}
                      alt={awayTeam.name}
                      className="team-logo"
                    />
                  )}
                  <span className="team-name">{awayTeam?.name || gameInfo.awayTeam}</span>
                </div>
              </div>

              <div className="game-details">
                <span className="game-date">{gameInfo.date}</span>
                <span className="game-location">{gameInfo.location}</span>
                <span className="game-type">{gameInfo.type}</span>
              </div>
            </div>
          )}

          <div className="clips-count">
            <FaVideo className="clips-icon" />
            <span>총 {clips.length}개 클립</span>
          </div>
        </div>
      </header>

      {/* 클립 목록 */}
      <main className="analysis-clips-main">
        {loading && (
          <div className="analysis-clips-loading">
            <div className="spinner"></div>
            <span>클립을 불러오는 중...</span>
          </div>
        )}

        {error && (
          <div className="analysis-clips-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>다시 시도</button>
          </div>
        )}

        {!loading && !error && clips.length === 0 && (
          <div className="analysis-clips-empty">
            <FaVideo className="empty-icon" />
            <p>이 경기의 클립 데이터가 없습니다.</p>
            <p>영상 업로드는 완료되었지만 분석 JSON이 아직 업로드되지 않았을 수 있습니다.</p>
          </div>
        )}

        {!loading && !error && clips.length > 0 && (
          <div className="quarters-container">
            {[1, 2, 3, 4].map(quarter => {
              const quarterClips = clipsByQuarter[quarter] || [];
              
              if (quarterClips.length === 0) return null;

              return (
                <div key={quarter} className="quarter-section">
                  <div className="quarter-header">
                    <h3>{quarter}쿼터</h3>
                    <span className="quarter-count">{quarterClips.length}개 클립</span>
                  </div>

                  <div className="clips-grid">
                    {quarterClips.map((clip, index) => (
                      <div
                        key={`${quarter}-${index}`}
                        className="clip-card"
                        onClick={() => playVideo(clip, clip.originalIndex)}
                      >
                        <div className="clip-header">
                          <div className="clip-number">#{clip.originalIndex + 1}</div>
                          <div className="play-button">
                            <FaPlay />
                          </div>
                        </div>

                        <div className="clip-info">
                          <div className="clip-basic">
                            <span className="clip-quarter">{quarter}Q</span>
                            <span className="clip-down">
                              {clip.down ? `${clip.down}다운` : '-'}
                            </span>
                            <span className="clip-yard">
                              {clip.gainYard ? `${clip.gainYard}야드` : '0야드'}
                            </span>
                          </div>

                          <div className="clip-type">
                            {clip.playType || '플레이 타입 미정'}
                          </div>

                          {clip.significantPlays && clip.significantPlays.some(play => play) && (
                            <div className="significant-plays">
                              {clip.significantPlays
                                .filter(play => play)
                                .map((play, i) => (
                                  <span key={i} className="significant-play">
                                    {play}
                                  </span>
                                ))}
                            </div>
                          )}

                          <div className="clip-players">
                            {clip.car && clip.car.num && (
                              <span className="player car">
                                CAR: #{clip.car.num} ({clip.car.pos || '-'})
                              </span>
                            )}
                            {clip.tkl && clip.tkl.num && (
                              <span className="player tkl">
                                TKL: #{clip.tkl.num} ({clip.tkl.pos || '-'})
                              </span>
                            )}
                          </div>
                        </div>

                        {!clip.clipUrl && (
                          <div className="no-video-warning">
                            영상 URL 없음
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}