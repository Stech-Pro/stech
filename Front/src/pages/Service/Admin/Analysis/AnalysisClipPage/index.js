import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlay, FaVideo } from 'react-icons/fa';
import { useAuth } from '../../../../../context/AuthContext.js';
import { fetchGameClips, getVideoUrl } from '../../../../../api/gameAPI.js';
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
    navigate(-1);
  };

  const playVideo = (clip) => {
    if (clip.clipUrl) {
      window.open(clip.clipUrl, '_blank');
    } else {
      alert('영상 URL이 없습니다.');
    }
  };

  const playVideoFile = async (quarter, fileName) => {
    try {
      const url = await getVideoUrl(gameKey, quarter, fileName);
      window.open(url, '_blank');
    } catch (error) {
      console.error('영상 재생 오류:', error);
      alert(error.message || '영상을 재생할 수 없습니다.');
    }
  };

  const getTeamInfo = (teamId) => {
    return TEAM_BY_ID[teamId] || { id: teamId, name: teamId, logo: defaultLogo };
  };

  const isTraining = gameInfo && (gameInfo.type === '훈련' || gameInfo.type === 'Training');
  const homeTeam = gameInfo && !isTraining ? getTeamInfo(gameInfo.homeTeam) : null;
  const awayTeam = gameInfo && !isTraining ? getTeamInfo(gameInfo.awayTeam) : null;
  const trainingTeam = isTraining ? getTeamInfo(gameInfo.team) : null;

  const clipsByQuarter = clips.reduce((acc, clip, index) => {
    const quarter = clip.quarter || (isTraining ? 'Training' : 1);
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
              {isTraining ? (
                /* 훈련 영상 헤더 */
                <div className="APgame-teams">
                  <div className="APteam-info">
                    {trainingTeam?.logo && (
                      <img
                        src={trainingTeam.logo}
                        alt={trainingTeam.name}
                        className="APteam-logo"
                      />
                    )}
                    <span className="APteam-name">{trainingTeam?.name || gameInfo.team} 훈련</span>
                  </div>
                  {gameInfo.position && (
                    <div className="APtraining-position">
                      <span>포지션: {gameInfo.position}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* 일반 경기 헤더 */
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
              )}

              <div className="APgame-details">
                <span className="APgame-date">{gameInfo.date}</span>
                {gameInfo.location && <span className="APgame-location">{gameInfo.location}</span>}
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

            {/* videoUrls가 있으면 표시 */}
            {gameInfo?.videoUrls && Object.keys(gameInfo.videoUrls).length > 0 && (
              <div style={{ marginTop: '30px', width: '100%' }}>
                <h3 style={{ marginBottom: '20px', color: '#666' }}>업로드된 영상 파일</h3>
                <div className="APquarters-container">
                  {Object.entries(gameInfo.videoUrls).map(([quarter, videos]) => {
                    if (!videos || videos.length === 0) return null;

                    const quarterLabel = quarter === 'Training' ? '훈련 영상' :
                                       quarter === 'training' ? '훈련 영상' :
                                       `${quarter} 영상`;

                    return (
                      <div key={quarter} className="APquarter-section">
                        <div className="APquarter-header">
                          <h3>{quarterLabel}</h3>
                          <span className="APquarter-count">{videos.length}개 파일</span>
                        </div>
                        <div className="APclips-grid">
                          {videos.map((videoFile, index) => (
                            <div
                              key={`${quarter}-${index}`}
                              className="APclip-card"
                              onClick={() => playVideoFile(quarter, videoFile)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="APclip-header">
                                <div className="APclip-number">#{index + 1}</div>
                                <div className="APplay-button">
                                  <FaPlay />
                                </div>
                              </div>
                              <div className="APclip-info">
                                <div className="APclip-type" style={{ fontSize: '14px', wordBreak: 'break-all' }}>
                                  {videoFile}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && !error && clips.length > 0 && (
          <div className="APquarters-container">
            {isTraining ? (
              /* 훈련 영상 표시 */
              Object.keys(clipsByQuarter).map(section => {
                const sectionClips = clipsByQuarter[section] || [];
                if (sectionClips.length === 0) return null;

                return (
                  <div key={section} className="APquarter-section">
                    <div className="APquarter-header">
                      <h3>훈련 영상</h3>
                      <span className="APquarter-count">{sectionClips.length}개 영상</span>
                    </div>

                    <div className="APclips-grid">
                      {sectionClips.map((clip, index) => (
                        <div
                          key={`${section}-${index}`}
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
                            <div className="APclip-type">
                              {clip.playType || clip.description || '훈련 영상'}
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

                            {clip.players && clip.players.length > 0 && (
                              <div className="APclip-players">
                                {clip.players.map((player, i) => (
                                  <span key={i} className="APplayer">
                                    #{player.number} ({player.position || '-'})
                                  </span>
                                ))}
                              </div>
                            )}
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
              })
            ) : (
              /* 일반 경기 쿼터별 표시 */
              [1, 2, 3, 4].map(quarter => {
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
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
