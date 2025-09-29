// src/pages/Analysis/AnalysisPage.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { FaChevronDown, FaVideo, FaUpload } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext.js';
import { fetchPendingGames } from '../../../api/gameAPI.js';
import './AnalysisPage.css';
import { TEAMS, TEAM_BY_ID } from '../../../data/TEAMS';
import CalendarDropdown from '../../../components/Calendar.jsx';
import defaultLogo from '../../../assets/images/logos/Stechlogo.svg';

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

  // 디버깅용 로그
  console.log('AnalysisPage - user:', user);
  console.log('AnalysisPage - role:', user?.role);

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
    // user가 로드되었고, admin이 아닌 경우에만 리다이렉트
    if (user && user.role !== 'admin') {
      navigate('/service');
    }
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
    return () => {
      alive = false;
    };
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

  /* 클립 페이지로 이동 */
  const openClips = (game) => {
    navigate(`/analysis/${game.gameKey}/clips`, { state: { game } });
  };

  // 영상 개수 계산 - 실제 비디오 파일 개수 우선 표시
  const getVideoCount = (game) => {
    console.log('🎬=== getVideoCount 시작 ===');
    console.log('🎬 게임 키:', game.gameKey);
    console.log('🎬 totalVideos:', game.totalVideos, '(타입:', typeof game.totalVideos, ')');
    console.log('🎬 totalClips:', game.totalClips, '(타입:', typeof game.totalClips, ')');
    
    // 실제 비디오 파일이 있는 경우 우선 표시
    if (typeof game.totalVideos === 'number' && game.totalVideos > 0) {
      console.log('✅ 실제 비디오 파일 개수 표시:', game.totalVideos);
      return `영상 ${game.totalVideos}개`;
    }
    
    // 비디오는 없지만 클립 데이터가 있는 경우
    if (typeof game.totalClips === 'number' && game.totalClips > 0) {
      console.log('📊 클립 데이터만 있음:', game.totalClips);
      // totalVideos가 명시적으로 0이면 비디오 없음 표시
      if (typeof game.totalVideos === 'number' && game.totalVideos === 0) {
        return 'URL 없음';
      }
      return `클립 ${game.totalClips}개`;
    }
    
    // 기존 videoUrls 기반 로직 (fallback)
    if (game.videoUrls) {
      try {
        const count = Object.values(game.videoUrls).flat().length;
        console.log('🔄 videoUrls 기반 계산:', count);
        if (count > 0) {
          return `영상 ${count}개`;
        }
      } catch (error) {
        console.error('❌ videoUrls 계산 오류:', error);
      }
    }
    
    // 모든 정보가 없는 경우
    console.log('❌ 영상 정보 없음 - 분석 대기 반환');
    console.log('🎬=== getVideoCount 끝 ===');
    return '분석 대기';
  };

  // 로딩 중이거나 권한이 없으면 렌더링하지 않음
  if (!user) {
    return <div>로그인 확인 중...</div>;
  }
  
  if (user.role !== 'admin') {
    return <div>접근 권한이 없습니다.</div>;
  }

  return (
    <div className="analysis-page-root">
      {/* ===== 헤더 ===== */}
      <header className="analysis-header">
        <div className="analysis-header-container">
          {/* 왼쪽: 제목 */}
          <div className="analysis-title-box">
            <FaVideo className="analysis-icon" />
            <h1 className="analysis-title">분석팀 대시보드</h1>
            <span className="analysis-subtitle">영상 분석 대기중 경기</span>
          </div>

          {/* 오른쪽: 필터 */}
          <div className="analysis-filters">
            <div className="filterGroup">
              {/* 날짜 */}
              <div className="datePickerWrap" ref={dateWrapRef}>
                <button
                  className={`filterButton ${showDate || selectedDate ? 'active' : ''}`}
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
              <div className="typePickerWrap" ref={typeWrapRef}>
                <button
                  className={`filterButton ${selectedType ? 'active' : ''}`}
                  onClick={() => setShowType(!showType)}
                >
                  {selectedType ?? '유형'} <FaChevronDown size={10} />
                </button>
                {showType && (
                  <ul className="typeDropdown">
                    {TYPES.map((t) => (
                      <li key={t}>
                        <button
                          className={`typeItem ${selectedType === t ? 'active' : ''}`}
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
              <div className="uploaderPickerWrap" ref={uploaderWrapRef}>
                <button
                  className={`filterButton ${selectedUploader ? 'active' : ''}`}
                  onClick={() => setShowUploader(!showUploader)}
                >
                  {selectedUploader ? selectedUploader.name : '업로더'} <FaChevronDown size={10} />
                </button>
                {showUploader && (
                  <ul className="uploaderDropdown">
                    {uploaderTeams.map((team) => (
                      <li key={team.id}>
                        <button
                          className={`uploaderItem ${selectedUploader?.id === team.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedUploader(team);
                            setShowUploader(false);
                          }}
                        >
                          {team.logo && (
                            <div className="uploader-team-logo">
                              <img
                                src={team.logo}
                                alt={team.name}
                                className={`uploader-team-logo-img ${
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
              <button className="resetButton" onClick={resetFilters}>
                초기화
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== 경기 표 ===== */}
      <div className="analysis-container" style={{ display: loading ? 'none' : 'block' }}>
        <div className="analysis-header-row">
          <div className="analysis-header-cell">날짜</div>
          <div className="analysis-header-cell">경기</div>
          <div className="analysis-header-cell">장소</div>
          <div className="analysis-header-cell">업로더</div>
          <div className="analysis-header-cell">영상 수</div>
          <div className="analysis-header-cell">상태</div>
        </div>

        <div className="analysis-list">
          {loading && <div className="analysis-loading">불러오는 중…</div>}
          {error && <div className="analysis-error">{error}</div>}

          {!loading && !error && filteredGames.length === 0 && (
            <div className="analysis-empty">분석 대기중인 경기가 없습니다.</div>
          )}

          {filteredGames.map((g) => {
            const homeMeta = TEAM_BY_ID[g.homeTeam];
            const awayMeta = TEAM_BY_ID[g.awayTeam];
            const uploaderMeta = TEAM_BY_ID[g.uploader];
            const videoCount = getVideoCount(g);

            return (
              <div
                key={g.gameKey}
                className="analysis-card"
                onClick={() => openClips(g)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openClips(g)}
              >
                <div className="analysis-date">{g.date}</div>

                <div className="analysis-game">
                  <div className="analysis-teams">
                    <div className="analysis-team">
                      {homeMeta?.logo && (
                        <div className="analysis-team-logo">
                          <img
                            src={homeMeta.logo}
                            alt={`${homeMeta.name} 로고`}
                            className={`analysis-team-logo-img ${
                              homeMeta.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                            }`}
                          />
                        </div>
                      )}
                      <span className="analysis-team-name">{homeMeta?.name || g.homeTeam}</span>
                    </div>

                    <div className="analysis-vs">VS</div>

                    <div className="analysis-team">
                      {awayMeta?.logo && (
                        <div className="analysis-team-logo">
                          <img
                            src={awayMeta.logo}
                            alt={`${awayMeta.name} 로고`}
                            className={`analysis-team-logo-img ${
                              awayMeta.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                            }`}
                          />
                        </div>
                      )}
                      <span className="analysis-team-name">{awayMeta?.name || g.awayTeam}</span>
                    </div>
                  </div>
                </div>

                <div className="analysis-location">{g.location}</div>

                <div className="analysis-uploader">
                  {uploaderMeta?.logo && (
                    <div className="analysis-uploader-logo">
                      <img
                        src={uploaderMeta.logo}
                        alt={`${uploaderMeta.name} 로고`}
                        className={`analysis-uploader-logo-img ${
                          uploaderMeta.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                        }`}
                      />
                    </div>
                  )}
                  <span className="analysis-uploader-name">{uploaderMeta?.name || g.uploader}</span>
                </div>

                <div className="analysis-video-count">
                  <FaVideo className="video-icon" />
                  <span>{typeof videoCount === 'number' ? `${videoCount}개` : videoCount}</span>
                </div>

                <div className="analysis-status pending">
                  <FaUpload className="status-icon" />
                  <span>분석 대기</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}