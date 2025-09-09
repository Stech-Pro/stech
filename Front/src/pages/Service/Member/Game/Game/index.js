// src/pages/Service/Member/Game/GamePage.jsx
// (id 기반으로 전면 수정)
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { FaChevronDown, FaRegFileAlt } from 'react-icons/fa';
import { useAuth } from '../../../../../context/AuthContext.js';
import { fetchTeamGames } from '../../../../../api/gameAPI.js';
import './GamePage.css';
import { TEAMS } from '../../../../../data/TEAMS';
import CalendarDropdown from '../../../../../components/Calendar.jsx';
import UploadVideoModal from '../../../../../components/UploadVideoModal';
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

/** 빠른 조회용 맵 (id → 팀 메타) */
const TEAM_BY_ID = TEAMS.reduce((m, t) => {
  m[t.id] = t;
  return m;
}, {});

export default function GamePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 로딩/에러
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ===== 내 팀 (고정 표기) ===== */
  // 백엔드/스토리지에 따라 teamId가 다양한 키에 있을 수 있으니 방어적으로 가져오기
  const MY_TEAM_ID =   user?.team || user?.teamName ;

  const selfTeam = useMemo(
    () => (MY_TEAM_ID ? TEAM_BY_ID[MY_TEAM_ID] : null) || TEAMS[0] || null,
    [MY_TEAM_ID]
  );
  const logoSrc = selfTeam?.logo || defaultLogo;
  const label = selfTeam?.name || 'Choose Team';

  /* ===== 필터 상태 ===== */
  const [showDate, setShowDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [showType, setShowType] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const [showOpps, setShowOpps] = useState(false);
  const [selectedOpps, setSelectedOpps] = useState(null); // 선택한 상대: 팀 객체(= TEAMS의 요소)
  const [activeLeague, setActiveLeague] = useState(null);

  const [showUpload, setShowUpload] = useState(false);

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
      if (t.id === selfTeam?.id) return; // 내 팀 제외
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

  useEffect(() => {
    if (showOpps) {
      setActiveLeague((cur) =>
        cur && teamsByLeague[cur]?.length ? cur : leaguesList[0] || null
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
        if (alive) setError(e?.message || '경기 목록을 불러오지 못했습니다.');
        console.error(e);
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
      if (selectedDate && !dayjs(g.date).isSame(selectedDate, 'day')) return false;
      if (selectedType && g.type !== selectedType) return false;
      if (selectedOpps) {
        const oppId = selectedOpps.id;
        if (g.homeId !== oppId && g.awayId !== oppId) return false;
      }
      return true;
    });
  }, [games, selectedDate, selectedType, selectedOpps]);

  /* 이동 */
  const openClips = (game) => {
    navigate(`/service/game/${game.gameKey}/clip`, { state: { game } });
  };

  return (
    <div className="gamepage-root">
      {/* ===== 헤더 ===== */}
      <header className="stechHeader">
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

              {/* 상대 (리그 → 팀 메가드롭다운) */}
              <div className="oppsPickerWrap" ref={oppsWrapRef}>
                <button
                  className={`filterButton ${selectedOpps ? 'active' : ''}`}
                  onClick={() => setShowOpps((v) => !v)}
                >
                  {selectedOpps ? selectedOpps.name : '상대'} <FaChevronDown size={10} />
                </button>

                {showOpps && (
                  <div className="oppsMega" role="menu">
                    {/* 왼쪽: 리그 */}
                    <ul className="oppsLeagues" role="menu">
                      {leaguesList.map((lg) => (
                        <li key={lg}>
                          <button
                            type="button"
                            className={`leagueItem ${activeLeague === lg ? 'active' : ''}`}
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
                              setSelectedOpps(t); // 팀 객체 자체 저장
                              setShowOpps(false);
                            }}
                          >
                            {t.logo && (
                              <div className="opps-team-logo-img-box">
                                <img
                                  src={t.logo}
                                  alt={t.name}
                                  className={`opps-team-logo-img ${
                                    t.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                                  }`}
                                />
                              </div>
                            )}
                            {t.name}
                          </button>
                        </li>
                      ))}
                      {(!activeLeague || (teamsByLeague[activeLeague] || []).length === 0) && (
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

            {/* 업로드 모달 버튼 */}
            <button className="newVideoButton" onClick={() => setShowUpload(true)}>
              경기 업로드
            </button>
          </div>
        </div>

        {/* 업로드 모달 */}
        <UploadVideoModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            setShowUpload(false);
            // TODO: 업로드 후 목록 갱신
          }}
        />
      </header>

      {/* ===== 경기 표 ===== */}
    
      <div className="game-container" style={{ display: loading ? 'none' : 'block' }}>
        <div className="game-header">
          <div className="game-header-cell">날짜</div>
          <div className="game-header-cell">경기 결과</div>
          <div className="game-header-cell">세부사항</div>
          <div className="game-header-cell">경기보고서</div>
          <div className="game-header-cell">길이</div>
        </div>

        <div className="game-list">
            {loading && <div className="game-loading">불러오는 중…</div>}
            {error && <div className="game-error">{error}</div>}

          {filteredGames.map((g) => {
            const homeMeta = TEAM_BY_ID[g.homeId];
            const awayMeta = TEAM_BY_ID[g.awayId];

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
                    {homeMeta?.logo && (
                      <div className="game-team-logo">
                        <img
                          src={homeMeta.logo}
                          alt={`${homeMeta.name} 로고`}
                          className={`game-team-logo-img ${
                            homeMeta.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                          }`}
                        />
                      </div>
                    )}
                    <span className="game-team-name">{homeMeta?.name || g.homeId}</span>
                  </div>

                  <div className="game-score">
                    {g.homeScore} : {g.awayScore}
                  </div>

                  <div className="game-team right">
                    {awayMeta?.logo && (
                      <div className="game-team-logo">
                        <img
                          src={awayMeta.logo}
                          alt={`${awayMeta.name} 로고`}
                          className={`game-team-logo-img ${
                            awayMeta.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                          }`}
                        />
                      </div>
                    )}
                    <span className="game-team-name">{awayMeta?.name || g.awayId}</span>
                  </div>
                </div>

                <div className="meta">
                  <span>{g.location}</span>
                </div>

                <div className={`game-report ${g.report ? 'reportY' : 'reportN'}`}>
                  <span className="report-text">
                    {g.report ? '보고서 생성됨' : '보고서 생성 중…'}
                  </span>
                  {g.report ? <FaRegFileAlt size={16} /> : null}
                </div>

                <div className="game-length">{g.length}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
