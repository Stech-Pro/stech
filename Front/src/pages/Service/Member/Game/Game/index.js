// src/pages/Service/Member/Game/GamePage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { FaChevronDown, FaRegFileAlt, FaVideo } from 'react-icons/fa';
import { useAuth } from '../../../../../context/AuthContext.js';
import { fetchTeamGames } from '../../../../../api/gameAPI.js';
import './GamePage.css';
import { TEAMS, TEAM_BY_ID } from '../../../../../data/TEAMS';
import CalendarDropdown from '../../../../../components/Calendar.jsx';
import UploadVideoModal from '../../../../../components/UploadVideoModal';
import defaultLogo from '../../../../../assets/images/logos/Stechlogo.svg';
import NotificationHoverIcon from '../../../../../components/Notifications/NotificationHoverIcon';

/* ===== 상수 ===== */
const TYPES_LABEL = {
  League: '리그',
  Friendly: '친선전',
  Scrimmage: '스크리미지',
  Training: '훈련',
};
/** region 코드 → 한글 라벨 */
const REGION_LABEL = {
  Seoul: '서울',
  'Gyeonggi-Gangwon': '경기강원',
  'Daegu-Gyeongbuk': '대구경북',
  'Busan-Gyeongnam': '부산경남',
  Amateur: '사회인',
};

export default function GamePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 로딩/에러
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ===== 내 팀 (고정 표기) ===== */
  // 백엔드/스토리지에 따라 teamId가 다양한 키에 있을 수 있으니 방어적으로 가져오기
  const MY_TEAM_ID = user?.team || user?.teamName || null;

  const selfTeam = useMemo(
    () => {
      if (!MY_TEAM_ID) return null;
      return TEAM_BY_ID[MY_TEAM_ID] || null;
    },
    [MY_TEAM_ID],
  );
  const logoSrc = selfTeam?.logo || defaultLogo;
  const label = selfTeam?.name || (MY_TEAM_ID ? '알 수 없는 팀' : '팀 없음');

  /* ===== 필터 상태 ===== */
  const [showDate, setShowDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [showType, setShowType] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const [showOpps, setShowOpps] = useState(false);
  const [selectedOpps, setSelectedOpps] = useState(null);
  const [activeLeague, setActiveLeague] = useState(null);

  const [showUpload, setShowUpload] = useState(false);
  const [showAnalysisAlert, setShowAnalysisAlert] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [mobileActiveLeague, setMobileActiveLeague] = useState(null);

  /* 바깥 클릭 닫기 */
  const dateWrapRef = useRef(null);
  const typeWrapRef = useRef(null);
  const oppsWrapRef = useRef(null);

  useEffect(() => {
    const out = (e) => {
      const isIn = (ref) => ref.current && ref.current.contains(e.target);
      if (!isIn(dateWrapRef)) setShowDate(false);
      if (!isIn(typeWrapRef)) setShowType(false);
      if (!isIn(oppsWrapRef)) setShowOpps(false);
    };
    document.addEventListener('mousedown', out);
    return () => document.removeEventListener('mousedown', out);
  }, []);

  /* ===== 상대팀 드롭다운: 리그별 묶기 (region → 한글 라벨) ===== */
  const teamsByLeague = useMemo(() => {
    const m = {};
    TEAMS.forEach((t) => {
      if (t.id === selfTeam?.id || t.id === 'ADMIN') return; // 내 팀 제외
      const label = REGION_LABEL[t.region] || '기타';
      (m[label] ||= []).push(t);
    });
    return m;
  }, [selfTeam]);

  const leaguesList = useMemo(() => {
    const base = ['서울', '경기강원', '대구경북', '부산경남', '사회인'];
    const keys = Object.keys(teamsByLeague);
    const extras = keys.filter((k) => !base.includes(k)).sort();
    return [...base.filter((k) => keys.includes(k)), ...extras];
  }, [teamsByLeague]);

  // 자기 팀의 지역을 기본값으로 설정
  const defaultLeague = useMemo(() => {
    if (!selfTeam) return leaguesList[0] || null;
    const teamRegion = REGION_LABEL[selfTeam.region];
    return teamRegion || leaguesList[0] || null;
  }, [selfTeam, leaguesList]);

  useEffect(() => {
    if (showOpps) {
      setActiveLeague((cur) =>
        cur && teamsByLeague[cur]?.length ? cur : leaguesList[0] || null,
      );
    }
  }, [showOpps, leaguesList, teamsByLeague]);

  const resetFilters = () => {
    setSelectedDate(null);
    setSelectedType(null);
    setSelectedOpps(null);
    setShowDate(false);
    setShowType(false);
    setShowOpps(false);
  };

  /* ===== 경기 리스트 ===== */
  const [games, setGames] = useState([]);

  useEffect(() => {
    if (!MY_TEAM_ID) {
      setGames([]);
      return;
    }
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const list = await fetchTeamGames(MY_TEAM_ID);
        if (alive) setGames(list);
      } catch (e) {
        // 404 에러는 경기가 없는 정상 상태로 처리
        if (e?.status === 404) {
          if (alive) setGames([]);
        } else {
          if (alive) setError(e?.message || '경기 목록을 불러오지 못했습니다.');
          console.error(e);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [MY_TEAM_ID]);

  /* 필터 적용 (모두 id 기준) */
  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const isTraining = g.type === 'Training' || g.type === '훈련';

      if (selectedDate && !dayjs(g.date).isSame(selectedDate, 'day'))
        return false;
      if (selectedType && g.type !== selectedType) return false;

      // 훈련 영상은 상대팀 필터 무시
      if (selectedOpps && !isTraining) {
        const oppId = selectedOpps.id;
        if (g.homeId !== oppId && g.awayId !== oppId) return false;
      }
      return true;
    });
  }, [games, selectedDate, selectedType, selectedOpps]);

  /* 일반 경기와 훈련 영상 분리 */
  const regularGames = useMemo(
    () =>
      filteredGames.filter((g) => g.type !== 'Training' && g.type !== '훈련'),
    [filteredGames],
  );

  const trainingGames = useMemo(
    () =>
      filteredGames.filter((g) => g.type === 'Training' || g.type === '훈련'),
    [filteredGames],
  );

  /* 팀 정보 가져오기 헬퍼 (N/A 처리 포함) */
  const getTeamInfo = (teamId) => {
    if (!teamId || teamId === 'N/A') {
      return {
        name: 'N/A',
        logo: defaultLogo,
        isDeleted: true,
      };
    }
    const team = TEAM_BY_ID[teamId];
    if (!team) {
      return {
        name: teamId,
        logo: defaultLogo,
        isDeleted: true,
      };
    }
    return {
      ...team,
      isDeleted: false,
    };
  };

  /* 이동 */
  const openClips = (game) => {
    const isTraining = game.type === 'Training' || game.type === '훈련';

    // 훈련 영상은 TrainingClipPage로 이동
    if (isTraining) {
      navigate(`/service/game/${game.gameKey}/training-clip`, {
        state: { game },
      });
      return;
    }

    // pending 상태 경기는 분석 중 팝업 표시
    if (game.uploadStatus === 'pending') {
      setShowAnalysisAlert(true);
      return;
    }

    navigate(`/service/game/${game.gameKey}/clip`, { state: { game } });
  };

  return (
    <div className="gamepage-root">
      {/* ===== 모바일 헤더 ===== */}
      <header className="md:hidden p-4 bg-[#141414] text-[#e5e7eb]">
        <div className="flex items-center justify-between h-16 border-b border-b-[#fff]">
          {/* 왼쪽: 내 팀 */}
          <div className="h-[3rem] flex items-center gap-2">
            <div className="w-auto h-auto">
              <img
                src={logoSrc}
                alt={label}
                className="object-cover w-8 h-8 position-center"
              />
            </div>
            <span className="text-white font-base">{label}</span>
          </div>
          <div className="flex items-center gap-2 text-base">
              <button
                className="rounded-2xl bg-[#2a2a2a] px-3 h-[2rem] text-white text-sm"
                onClick={() => setShowMobileFilter(true)}
              >
                필터
              </button>
              <button
                className="rounded-2xl bg-[#1a58e0] px-3 h-[2rem] text-white text-sm"
                onClick={() => setShowUpload(true)}
              >
                업로드
              </button>
          </div>

        </div>

        {/* 업로드 모달 */}
        <UploadVideoModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          onUploaded={async () => {
            setShowUpload(false);
            try {
              const list = await fetchTeamGames(MY_TEAM_ID);
              setGames(list);
            } catch (e) {
              // 404 에러는 경기가 없는 정상 상태로 처리
              if (e?.status === 404) {
                setGames([]);
              } else {
                console.error('경기 목록 갱신 실패:', e);
              }
            }
          }}
        />

        {/* 분석 중 알림 모달 */}
        {showAnalysisAlert && (
          <div
            className="modal-overlay"
            onClick={() => setShowAnalysisAlert(false)}
          >
            <div
              className="analysis-alert-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="analysis-alert-content">
                <div className="analysis-alert-icon">⏳</div>
                <h3 className="analysis-alert-title">영상 분석 중입니다</h3>
                <p className="analysis-alert-message">
                  분석팀에서 영상을 분석하고 있습니다.
                  <br />
                  잠시만 기다려주세요.
                </p>
                <button
                  className="analysis-alert-button"
                  onClick={() => setShowAnalysisAlert(false)}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 모바일 필터 바텀시트 */}
        {showMobileFilter && (
          <div className="mobile-filter-overlay" onClick={() => setShowMobileFilter(false)}>
            <div className="mobile-filter-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-filter-header">
                <h3>필터</h3>
                <button onClick={() => setShowMobileFilter(false)}>✕</button>
              </div>

              <div className="mobile-filter-content">
                {/* 날짜 필터 */}
                <div className="mobile-filter-section">
                  <label>날짜</label>
                  <div className="mobile-date-picker" ref={dateWrapRef}>
                    <button
                      className={`mobile-filter-button ${selectedDate ? 'has-value' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDate(!showDate);
                      }}
                    >
                      <span>{selectedDate ? selectedDate.format('YYYY년 MM월 DD일') : '날짜 선택'}</span>
                      <FaChevronDown size={12} style={{
                        transform: showDate ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }} />
                    </button>
                    {showDate && (
                      <div className="mobile-calendar-dropdown">
                        <CalendarDropdown
                          value={selectedDate || dayjs()}
                          onChange={(d) => {
                            setSelectedDate(d);
                            setShowDate(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 유형 필터 */}
                <div className="mobile-filter-section">
                  <label>유형</label>
                  <div className="mobile-type-options">
                    {Object.entries(TYPES_LABEL).map(([key, label]) => (
                      <button
                        key={key}
                        className={`mobile-chip ${selectedType === key ? 'active' : ''}`}
                        onClick={() => setSelectedType(selectedType === key ? null : key)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 상대팀 필터 */}
                <div className="mobile-filter-section">
                  <label>상대팀</label>

                  {/* 리그 탭 (가로 배치) */}
                  <div className="mobile-league-tabs">
                    {leaguesList.map((league) => (
                      <button
                        key={league}
                        className={`mobile-league-tab ${(mobileActiveLeague || defaultLeague) === league ? 'active' : ''}`}
                        onClick={() => setMobileActiveLeague(league)}
                      >
                        {league}
                      </button>
                    ))}
                  </div>

                  {/* 선택된 리그의 팀들 */}
                  <div className="mobile-team-chips">
                    {(teamsByLeague[mobileActiveLeague || defaultLeague] || []).map((t) => (
                      <button
                        key={t.id}
                        className={`mobile-team-chip ${selectedOpps?.id === t.id ? 'active' : ''}`}
                        onClick={() => setSelectedOpps(selectedOpps?.id === t.id ? null : t)}
                      >
                        {t.logo && (
                          <img
                            src={t.logo}
                            alt={t.name}
                            className="mobile-team-chip-logo"
                          />
                        )}
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mobile-filter-footer">
                <button className="mobile-filter-reset" onClick={() => {
                  resetFilters();
                  setMobileActiveLeague(defaultLeague);
                }}>
                  초기화
                </button>
                <button className="mobile-filter-apply" onClick={() => setShowMobileFilter(false)}>
                  적용
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ===== 데스크탑 헤더 ===== */}
      <header className="max-md:hidden p-[3.75rem] pb-0 bg-[#141414] text-[#e5e7eb]">
        <div className="headerContainer">
          {/* 왼쪽: 내 팀 */}
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

          {/* 오른쪽: 필터 + 업로드 */}
          <div className="bottomRow">
            <div className="filterGroup">
              {/* 날짜 */}
              <div className="datePickerWrap" ref={dateWrapRef}>
                <button
                  className={`filterButton ${
                    showDate || selectedDate ? 'active' : ''
                  }`}
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
                  {TYPES_LABEL[selectedType] ?? '유형'}{' '}
                  <FaChevronDown size={10} />
                </button>
                {showType && (
                  <ul className="typeDropdown">
                    {Object.entries(TYPES_LABEL).map(([key, label]) => (
                      <li key={key}>
                        <button
                          className={`typeItem ${
                            selectedType === key ? 'active' : ''
                          }`}
                          onClick={() => {
                            setSelectedType(key);
                            setShowType(false);
                          }}
                        >
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 상대 (리그 → 팀 메가드롭다운) */}
              <div className="oppsPickerWrap" ref={oppsWrapRef}>
                <button
                  className={`filterButton ${selectedOpps ? 'active' : ''}`}
                  onClick={() => setShowOpps((v) => !v)}
                >
                  {selectedOpps ? selectedOpps.name : '상대'}{' '}
                  <FaChevronDown size={10} />
                </button>

                {showOpps && (
                  <div className="oppsMega" role="menu">
                    {/* 왼쪽: 리그 */}
                    <ul className="oppsLeagues" role="menu">
                      {leaguesList.map((lg) => (
                        <li key={lg}>
                          <button
                            type="button"
                            className={`leagueItem ${
                              activeLeague === lg ? 'active' : ''
                            }`}
                            onMouseEnter={() => setActiveLeague(lg)}
                            onFocus={() => setActiveLeague(lg)}
                            onClick={() => setActiveLeague(lg)}
                          >
                            {lg}
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* 오른쪽: 팀 */}
                    <ul className="oppsTeams" role="menu">
                      {(teamsByLeague[activeLeague] || []).map((t) => (
                        <li key={t.id}>
                          <button
                            type="button"
                            className="oppsItem"
                            onClick={() => {
                              setSelectedOpps(t);
                              setShowOpps(false);
                            }}
                          >
                            {t.logo && (
                              <div className="opps-team-logo-img-box">
                                <img
                                  src={t.logo}
                                  alt={t.name}
                                  className={`opps-team-logo-img ${
                                    t.logo.endsWith('.svg')
                                      ? 'svg-logo'
                                      : 'png-logo'
                                  }`}
                                />
                              </div>
                            )}
                            {t.name}
                          </button>
                        </li>
                      ))}
                      {(!activeLeague ||
                        (teamsByLeague[activeLeague] || []).length === 0) && (
                        <li className="oppsEmpty">해당 리그 팀이 없습니다</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* 초기화 */}
              <button className="resetButton" onClick={resetFilters}>
                초기화
              </button>
            </div>

            <div className="header-right-group">
              <button
                className="newVideoButton"
                onClick={() => setShowUpload(true)}
              >
                경기 업로드
              </button>
              <NotificationHoverIcon
                className="notificationButton"
                iconSize={24}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ===== 경기 표 ===== */}

      {loading && <div className="game-loading">불러오는 중…</div>}
      {error && <div className="game-error">{error}</div>}

      {/* 빈 상태 - 경기가 없을 때 */}
      {!loading &&
        !error &&
        regularGames.length === 0 &&
        trainingGames.length === 0 && (
          <div className="game-empty">
            <FaVideo className="game-empty-icon" />
            <div className="game-empty-title">경기 영상이 없습니다</div>
            <div className="game-empty-message">
              첫 경기 영상을 업로드하고 <br />
              팀의 경기 분석을 시작해보세요
            </div>
            <button
              className="game-empty-upload-button"
              onClick={() => setShowUpload(true)}
            >
              경기 업로드
            </button>
          </div>
        )}

      {/* 일반 경기 컨테이너 */}
      {!loading && !error && regularGames.length > 0 && (
        <div className="flex flex-col px-[1rem] md:px-[3.75rem] mt-[1.5rem]">
          <h2 className="game-section-title">경기 목록</h2>
          <div className="game-header">
            <div className="game-header-cell">날짜</div>
            <div className="game-header-cell">경기 결과</div>
            <div className="game-header-cell">세부사항</div>
            <div className="game-header-cell">영상 분석</div>
          </div>

          <div className="game-list">
            {regularGames.map((g) => {
              const homeMeta = getTeamInfo(g.homeId);
              const awayMeta = getTeamInfo(g.awayId);

              return (
                <div
                  key={g.gameKey}
                  className="game-card"
                  onClick={() => openClips(g)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && openClips(g)}
                >
                  <div className="date">{g.date}</div>

                  <div className="game-results">
                    <div className="game-team left">
                      <span
                        className={`game-team-name ${
                          homeMeta.isDeleted ? 'deleted-team' : ''
                        }`}
                      >
                        {homeMeta.name}
                      </span>
                      <div className="game-team-logo">
                        <img
                          src={homeMeta.logo}
                          alt={`${homeMeta.name} 로고`}
                          className={`game-team-logo-img ${
                            homeMeta.logo.endsWith('.svg')
                              ? 'svg-logo'
                              : 'png-logo'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="game-score">
                      {g.homeScore} : {g.awayScore}
                    </div>

                    <div className="game-team right">
                      <div className="game-team-logo">
                        <img
                          src={awayMeta.logo}
                          alt={`${awayMeta.name} 로고`}
                          className={`game-team-logo-img ${
                            awayMeta.logo.endsWith('.svg')
                              ? 'svg-logo'
                              : 'png-logo'
                          }`}
                        />
                      </div>
                      <span
                        className={`game-team-name ${
                          awayMeta.isDeleted ? 'deleted-team' : ''
                        }`}
                      >
                        {awayMeta.name}
                      </span>
                    </div>
                  </div>

                  <div className="meta">
                    <span>{g.location}</span>
                  </div>

                  <div
                    className={`game-report ${
                      g.report ? 'reportY' : 'reportN'
                    }`}
                  >
                    <span className="report-text">
                      {g.report ? '분석 완료' : '분석 중…'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 훈련 영상 컨테이너 */}
      {!loading && !error && trainingGames.length > 0 && (
        <div className="flex flex-col px-[1rem] md:px-[3.75rem] mt-[3.75rem]">
          <h2 className="game-section-title">훈련 목록</h2>
          <div className="training-header">
            <div className="game-header-cell">날짜</div>
            <div className="game-header-cell">훈련 팀</div>
            <div className="game-header-cell">세부사항</div>
            <div className="game-header-cell">영상 개수</div>
          </div>

          <div className="game-list">
            {trainingGames.map((g) => {
              const trainingTeamMeta = getTeamInfo(g.uploader);
              // 여러 가능한 필드명 확인
              const videoCount =
                Array.isArray(g.videoUrls) ? g.videoUrls.length :
                Array.isArray(g.videos) ? g.videos.length :
                typeof g.videoCount === 'number' ? g.videoCount :
                typeof g.clipCount === 'number' ? g.clipCount : 0;

              // 디버깅: 첫 번째 훈련 데이터 확인
              if (trainingGames.indexOf(g) === 0) {
                console.log('훈련 데이터 샘플:', g);
                console.log('영상 개수:', videoCount);
              }

              return (
                <div
                  key={g.gameKey}
                  className="training-card"
                  onClick={() => openClips(g)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && openClips(g)}
                >
                  <div className="date">{g.date}</div>

                  <div className="training-team">
                    <div className="game-team-logo">
                      <img
                        src={trainingTeamMeta.logo}
                        alt={`${trainingTeamMeta.name} 로고`}
                        className={`game-team-logo-img ${
                          trainingTeamMeta.logo.endsWith('.svg')
                            ? 'svg-logo'
                            : 'png-logo'
                        }`}
                      />
                    </div>
                    <span
                      className={`game-team-name ${
                        trainingTeamMeta.isDeleted ? 'deleted-team' : ''
                      }`}
                    >
                      {trainingTeamMeta.name}
                    </span>
                  </div>

                  <div className="meta">
                    <span>{g.location}</span>
                  </div>

                  <div className="video-count">
                    <span>{videoCount}개</span>
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
