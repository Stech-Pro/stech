import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlay, FaVideo } from 'react-icons/fa';
import { useAuth } from '../../../../../context/AuthContext.js';
import { fetchGameClips } from '../../../../../api/gameAPI.js';
import './AnalysisClipsPage.css';
import { TEAMS, TEAM_BY_ID } from '../../../../../data/TEAMS.js';
import defaultLogo from '../../../../../assets/images/logos/Stechlogo.svg';

export default function AnalysisClipsPage() {
  const { gameKey } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clips, setClips] = useState([]);
  const [gameInfo, setGameInfo] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/service');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (location.state?.game) {
      setGameInfo(location.state.game);
    }
  }, [location.state]);

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

  const goBack = () => {
    navigate('/analysis');
  };

  const playVideo = (clip) => {
    if (clip.clipUrl) {
      window.open(clip.clipUrl, '_blank');
    } else {
      alert('영상 URL이 없습니다.');
    }
  };

  const getTeamInfo = (teamId) => {
    return TEAM_BY_ID[teamId] || { id: teamId, name: teamId, logo: defaultLogo };
  };

  const homeTeam = gameInfo ? getTeamInfo(gameInfo.homeTeam) : null;
  const awayTeam = gameInfo ? getTeamInfo(gameInfo.awayTeam) : null;

  const clipsByQuarter = clips.reduce((acc, clip, index) => {
    const quarter = clip.quarter || 1;
    if (!acc[quarter]) acc[quarter] = [];
    acc[quarter].push({ ...clip, originalIndex: index });
    return acc;
  }, {});

  if (!user) {
    return <div>로그인 확인 중...</div>;
  }
  
  if (user.role !== 'admin') {
    return <div>접근 권한이 없습니다.</div>;
  }

  return (
    <div className="APanalysis-clips-page">
      {/* 헤더 */}
      <header className="APanalysis-clips-header">
        <div className="APanalysis-clips-header-container">
          <button className="APback-button" onClick={goBack}>
            <FaArrowLeft />
            <span>분석 대시보드로 돌아가기</span>
          </button>

          {gameInfo && (
            <div className="APgame-info-header">
              <div className="APgame-teams">
                <div className="APteam-info">
                  {homeTeam?.logo && (
                    <img
                      src={homeTeam.logo}
                      alt={homeTeam.name}
                      className="APteam-logo"
                    />
                  )}
                  <span className="APteam-name">{homeTeam?.name || gameInfo.homeTeam}</span>
                </div>
                
                <div className="APvs-score">
                  <span className="APscore">
                    {gameInfo.score?.home || 0} : {gameInfo.score?.away || 0}
                  </span>
                  <span className="APvs">VS</span>
                </div>

                <div className="APteam-info">
                  {awayTeam?.logo && (
                    <img
                      src={awayTeam.logo}
                      alt={awayTeam.name}
                      className="APteam-logo"
                    />
                  )}
                  <span className="APteam-name">{awayTeam?.name || gameInfo.awayTeam}</span>
                </div>
              </div>

              <div className="APgame-details">
                <span className="APgame-date">{gameInfo.date}</span>
                <span className="APgame-location">{gameInfo.location}</span>
                <span className="APgame-type">{gameInfo.type}</span>
              </div>
            </div>
          )}

          <div className="APclips-count">
            <FaVideo className="APclips-icon" />
            <span>총 {clips.length}개 클립</span>
          </div>
        </div>
      </header>

      {/* 클립 목록 */}
      <main className="APanalysis-clips-main">
        {loading && (
          <div className="APanalysis-clips-loading">
            <div className="APspinner"></div>
            <span>클립을 불러오는 중...</span>
          </div>
        )}

        {error && (
          <div className="APanalysis-clips-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>다시 시도</button>
          </div>
        )}

        {!loading && !error && clips.length === 0 && (
          <div className="APanalysis-clips-empty">
            <FaVideo className="APempty-icon" />
            <p>이 경기의 클립 데이터가 없습니다.</p>
            <p>영상 업로드는 완료되었지만 분석 JSON이 아직 업로드되지 않았을 수 있습니다.</p>
          </div>
        )}

        {!loading && !error && clips.length > 0 && (
          <div className="APquarters-container">
            {[1, 2, 3, 4].map(quarter => {
              const quarterClips = clipsByQuarter[quarter] || [];
              
              if (quarterClips.length === 0) return null;

              return (
                <div key={quarter} className="APquarter-section">
                  <div className="APquarter-header">
                    <h3>{quarter}쿼터</h3>
                    <span className="APquarter-count">{quarterClips.length}개 클립</span>
                  </div>

                  <div className="APclips-grid">
                    {quarterClips.map((clip, index) => (
                      <div
                        key={`${quarter}-${index}`}
                        className="APclip-card"
                        onClick={() => playVideo(clip, clip.originalIndex)}
                      >
                        <div className="APclip-header">
                          <div className="APclip-number">#{clip.originalIndex + 1}</div>
                          <div className="APplay-button">
                            <FaPlay />
                          </div>
                        </div>

                        <div className="APclip-info">
                          <div className="APclip-basic">
                            <span className="APclip-quarter">{quarter}Q</span>
                            <span className="APclip-down">
                              {clip.down ? `${clip.down}다운` : '-'}
                            </span>
                            <span className="APclip-yard">
                              {clip.gainYard ? `${clip.gainYard}야드` : '0야드'}
                            </span>
                          </div>

                          <div className="APclip-type">
                            {clip.playType || '플레이 타입 미정'}
                          </div>

                          {clip.significantPlays && clip.significantPlays.some(play => play) && (
                            <div className="APsignificant-plays">
                              {clip.significantPlays
                                .filter(play => play)
                                .map((play, i) => (
                                  <span key={i} className="APsignificant-play">
                                    {play}
                                  </span>
                                ))}
                            </div>
                          )}

                          <div className="APclip-players">
                            {clip.car && clip.car.num && (
                              <span className="APplayer car">
                                CAR: #{clip.car.num} ({clip.car.pos || '-'})
                              </span>
                            )}
                            {clip.tkl && clip.tkl.num && (
                              <span className="APplayer tkl">
                                TKL: #{clip.tkl.num} ({clip.tkl.pos || '-'})
                              </span>
                            )}
                          </div>
                        </div>

                        {!clip.clipUrl && (
                          <div className="APno-video-warning">
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
