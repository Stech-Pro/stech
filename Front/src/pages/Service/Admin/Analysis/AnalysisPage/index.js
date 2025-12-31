import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { FaChevronDown, FaVideo, FaUpload } from 'react-icons/fa';
import { useAuth } from '../../../../../context/AuthContext.js';
import { fetchPendingGames } from '../../../../../api/gameAPI.js';
import './AnalysisPage.css';
import { TEAMS, TEAM_BY_ID } from '../../../../../data/TEAMS.js';
import CalendarDropdown from '../../../../../components/Calendar.jsx';
import defaultLogo from '../../../../../assets/images/logos/Stechlogo.svg';

/* ===== 상수 ===== */
const TYPES = ['Scrimmage', 'Friendly match', 'Season'];

/** region 코드 → 한글 라벨 */
const REGION_LABEL = {
  Seoul: '서울',
  'Gyeonggi-Gangwon': '경기강원',
  'Daegu-Gyeongbuk': '대구경북',
  'Busan-Gyeongnam': '부산경남',
  Amateur: '사회인',
};

export default function AnalysisPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 로딩/에러
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ===== 필터 상태 ===== */
  const [showDate, setShowDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [showType, setShowType] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const [showUploader, setShowUploader] = useState(false);
  const [selectedUploader, setSelectedUploader] = useState(null);

  /* 바깥 클릭 닫기 */
  const dateWrapRef = useRef(null);
  const typeWrapRef = useRef(null);
  const uploaderWrapRef = useRef(null);

  useEffect(() => {
    const out = (e) => {
      const isIn = (ref) => ref.current && ref.current.contains(e.target);
      if (!isIn(dateWrapRef)) setShowDate(false);
      if (!isIn(typeWrapRef)) setShowType(false);
      if (!isIn(uploaderWrapRef)) setShowUploader(false);
    };
    document.addEventListener('mousedown', out);
    return () => document.removeEventListener('mousedown', out);
  }, []);

  const resetFilters = () => {
    setSelectedDate(null);
    setSelectedType(null);
    setSelectedUploader(null);
    setShowDate(false);
    setShowType(false);
    setShowUploader(false);
  };

  /* ===== 분석 대기중 경기 리스트 ===== */
  const [games, setGames] = useState([]);

  // 관리자 권한 확인
  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/service');
  }, [user, navigate]);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const list = await fetchPendingGames();
        if (alive) setGames(list);
      } catch (e) {
        if (alive) setError(e?.message || '분석 대기 경기 목록을 불러오지 못했습니다.');
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  // 업로더 팀 목록 추출
  const uploaderTeams = useMemo(() => {
    const teams = [...new Set(games.map(g => g.uploader))];
    return teams.map(teamId => TEAM_BY_ID[teamId] || { id: teamId, name: teamId });
  }, [games]);

  /* 필터 적용 */
  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      if (selectedDate && !dayjs(g.date).isSame(selectedDate, 'day')) return false;
      if (selectedType && g.type !== selectedType) return false;
      if (selectedUploader && g.uploader !== selectedUploader.id) return false;
      return true;
    });
  }, [games, selectedDate, selectedType, selectedUploader]);

  /* 경기와 훈련 분리 */
  const regularGames = useMemo(() =>
    filteredGames.filter(g => g.type !== '훈련' && g.type !== 'Training'),
    [filteredGames]
  );

  const trainingGames = useMemo(() =>
    filteredGames.filter(g => g.type === '훈련' || g.type === 'Training'),
    [filteredGames]
  );

  /* 클립 페이지로 이동 */
  const openClips = (game) => {
    navigate(`/service/admin/analysis/${game.gameKey}/clips`, { state: { game } });
  };

  // 영상 개수 계산
  const getVideoCount = (game) => {
    if (typeof game.totalVideos === 'number' && game.totalVideos > 0) {
      return `영상 ${game.totalVideos}개`;
    }
    if (typeof game.totalClips === 'number' && game.totalClips > 0) {
      if (typeof game.totalVideos === 'number' && game.totalVideos === 0) return 'URL 없음';
      return `클립 ${game.totalClips}개`;
    }
    if (game.videoUrls) {
      try {
        const count = Object.values(game.videoUrls).flat().length;
        if (count > 0) return `영상 ${count}개`;
      } catch {}
    }
    return '분석 대기';
  };

  if (!user) return <div>로그인 확인 중...</div>;
  if (user.role !== 'admin') return <div>접근 권한이 없습니다.</div>;

  return (
    <div className="APanalysis-page-root">
      {/* ===== 헤더 ===== */}
      <header className="APanalysis-header">
        <div className="APanalysis-header-container">
          {/* 왼쪽: 제목 */}
          <div className="APanalysis-title-box">
            <FaVideo className="APanalysis-icon" />
            <h1 className="APanalysis-title">분석팀 대시보드</h1>
            <span className="APanalysis-subtitle">영상 분석 대기중 경기</span>
          </div>

          {/* 오른쪽: 필터 */}
          <div className="APanalysis-filters">
            <div className="APfilterGroup">
              {/* 날짜 */}
              <div className="APdatePickerWrap" ref={dateWrapRef}>
                <button
                  className={`APfilterButton ${showDate || selectedDate ? 'active' : ''}`}
                  onClick={() => setShowDate(!showDate)}
                >
                  {selectedDate ? selectedDate.format('YYYY-MM-DD') : '날짜'}{' '}
                  <FaChevronDown size={10} />
                </button>
                {showDate && (
                  <CalendarDropdown
                    value={selectedDate || dayjs()}
                    onChange={(d) => {
                      setSelectedDate(d);
                      setShowDate(false);
                    }}
                  />
                )}
              </div>

              {/* 유형 */}
              <div className="APtypePickerWrap" ref={typeWrapRef}>
                <button
                  className={`APfilterButton ${selectedType ? 'active' : ''}`}
                  onClick={() => setShowType(!showType)}
                >
                  {selectedType ?? '유형'} <FaChevronDown size={10} />
                </button>
                {showType && (
                  <ul className="APtypeDropdown">
                    {TYPES.map((t) => (
                      <li key={t}>
                        <button
                          className={`APtypeItem ${selectedType === t ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedType(t);
                            setShowType(false);
                          }}
                        >
                          {t}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 업로더 팀 */}
              <div className="APuploaderPickerWrap" ref={uploaderWrapRef}>
                <button
                  className={`APfilterButton ${selectedUploader ? 'active' : ''}`}
                  onClick={() => setShowUploader(!showUploader)}
                >
                  {selectedUploader ? selectedUploader.name : '업로더'} <FaChevronDown size={10} />
                </button>
                {showUploader && (
                  <ul className="APuploaderDropdown">
                    {uploaderTeams.map((team) => (
                      <li key={team.id}>
                        <button
                          className={`APuploaderItem ${selectedUploader?.id === team.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedUploader(team);
                            setShowUploader(false);
                          }}
                        >
                          {team.logo && (
                            <div className="APuploader-team-logo">
                              <img
                                src={team.logo}
                                alt={team.name}
                                className={`APuploader-team-logo-img ${
                                  team.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                                }`}
                              />
                            </div>
                          )}
                          {team.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 초기화 */}
              <button className="APresetButton" onClick={resetFilters}>
                초기화
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== 경기 표 ===== */}
      <div className="APanalysis-container" style={{ display: loading ? 'none' : 'block' }}>
        <h2 style={{ marginBottom: '20px', paddingLeft: '20px' }}>경기 목록</h2>
        <div className="APanalysis-header-row">
          <div className="APanalysis-header-cell">날짜</div>
          <div className="APanalysis-header-cell">경기</div>
          <div className="APanalysis-header-cell">장소</div>
          <div className="APanalysis-header-cell">업로더</div>
          <div className="APanalysis-header-cell">영상 수</div>
          <div className="APanalysis-header-cell">상태</div>
        </div>

        <div className="APanalysis-list">
          {loading && <div className="APanalysis-loading">불러오는 중…</div>}
          {error && <div className="APanalysis-error">{error}</div>}

          {!loading && !error && regularGames.length === 0 && (
            <div className="APanalysis-empty">분석 대기중인 경기가 없습니다.</div>
          )}

          {regularGames.map((g) => {
            const homeMeta = TEAM_BY_ID[g.homeTeam];
            const awayMeta = TEAM_BY_ID[g.awayTeam];
            const uploaderMeta = TEAM_BY_ID[g.uploader];
            const videoCount = getVideoCount(g);

            return (
              <div
                key={g.gameKey}
                className="APanalysis-card"
                onClick={() => openClips(g)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openClips(g)}
              >
                <div className="APanalysis-date">{g.date}</div>

                <div className="APanalysis-game">
                  <div className="APanalysis-teams">
                    <div className="APanalysis-team">
                      {homeMeta?.logo && (
                        <div className="APanalysis-team-logo">
                          <img
                            src={homeMeta.logo}
                            alt={`${homeMeta.name} 로고`}
                            className={`APanalysis-team-logo-img ${
                              homeMeta.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                            }`}
                          />
                        </div>
                      )}
                      <span className="APanalysis-team-name">{homeMeta?.name || g.homeTeam}</span>
                    </div>

                    <div className="APanalysis-vs">VS</div>

                    <div className="APanalysis-team">
                      {awayMeta?.logo && (
                        <div className="APanalysis-team-logo">
                          <img
                            src={awayMeta.logo}
                            alt={`${awayMeta.name} 로고`}
                            className={`APanalysis-team-logo-img ${
                              awayMeta.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                            }`}
                          />
                        </div>
                      )}
                      <span className="APanalysis-team-name">{awayMeta?.name || g.awayTeam}</span>
                    </div>
                  </div>
                </div>

                <div className="APanalysis-location">{g.location}</div>

                <div className="APanalysis-uploader">
                  {uploaderMeta?.logo && (
                    <div className="APanalysis-uploader-logo">
                      <img
                        src={uploaderMeta.logo}
                        alt={`${uploaderMeta.name} 로고`}
                        className={`APanalysis-uploader-logo-img ${
                          uploaderMeta.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                        }`}
                      />
                    </div>
                  )}
                  <span className="APanalysis-uploader-name">{uploaderMeta?.name || g.uploader}</span>
                </div>

                <div className="APanalysis-video-count">
                  <FaVideo className="APvideo-icon" />
                  <span>{typeof videoCount === 'number' ? `${videoCount}개` : videoCount}</span>
                </div>

                <div className="APanalysis-status APpending">
                  <FaUpload className="APstatus-icon" />
                  <span>분석 대기</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== 훈련 영상 표 ===== */}
      {trainingGames.length > 0 && (
        <div className="APanalysis-container" style={{ marginTop: '40px' }}>
          <h2 style={{ marginBottom: '20px', paddingLeft: '20px' }}>훈련 영상 목록</h2>
          <div className="APanalysis-header-row">
            <div className="APanalysis-header-cell">날짜</div>
            <div className="APanalysis-header-cell">팀</div>
            <div className="APanalysis-header-cell">포지션</div>
            <div className="APanalysis-header-cell">업로더</div>
            <div className="APanalysis-header-cell">영상 수</div>
            <div className="APanalysis-header-cell">상태</div>
          </div>

          <div className="APanalysis-list">
            {trainingGames.map((g) => {
              const teamMeta = TEAM_BY_ID[g.team];
              const uploaderMeta = TEAM_BY_ID[g.uploader];
              const videoCount = getVideoCount(g);

              return (
                <div
                  key={g.gameKey}
                  className="APanalysis-card"
                  onClick={() => openClips(g)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && openClips(g)}
                >
                  <div className="APanalysis-date">{g.date}</div>

                  <div className="APanalysis-game">
                    <div className="APanalysis-teams">
                      <div className="APanalysis-team">
                        {teamMeta?.logo && (
                          <div className="APanalysis-team-logo">
                            <img
                              src={teamMeta.logo}
                              alt={`${teamMeta.name} 로고`}
                              className={`APanalysis-team-logo-img ${
                                teamMeta.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                              }`}
                            />
                          </div>
                        )}
                        <span className="APanalysis-team-name">{teamMeta?.name || g.team} 훈련</span>
                      </div>
                    </div>
                  </div>

                  <div className="APanalysis-location">{g.position || '-'}</div>

                  <div className="APanalysis-uploader">
                    {uploaderMeta?.logo && (
                      <div className="APanalysis-uploader-logo">
                        <img
                          src={uploaderMeta.logo}
                          alt={`${uploaderMeta.name} 로고`}
                          className={`APanalysis-uploader-logo-img ${
                            uploaderMeta.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                          }`}
                        />
                      </div>
                    )}
                    <span className="APanalysis-uploader-name">{uploaderMeta?.name || g.uploader}</span>
                  </div>

                  <div className="APanalysis-video-count">
                    <FaVideo className="APvideo-icon" />
                    <span>{typeof videoCount === 'number' ? `${videoCount}개` : videoCount}</span>
                  </div>

                  <div className="APanalysis-status APpending">
                    <FaUpload className="APstatus-icon" />
                    <span>분석 대기</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
