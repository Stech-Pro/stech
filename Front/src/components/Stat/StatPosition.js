import React, { useMemo, useState, useEffect, useRef } from 'react';
import { RxTriangleDown } from 'react-icons/rx';
import { FaChevronDown } from 'react-icons/fa';
import './StatPosition.css';


const SCHOOL_TO_TEAM_NAME = {
  // ───── 서울 1부 ─────
  '한양대학교': '한양대 라이온스',
  '연세대학교': '연세대 이글스',
  '홍익대학교': '홍익대 카우보이스',
  '서울대학교': '서울대 그린테러스',
  '건국대학교': '건국대 레이징불스',
  '서울시립대학교': '서울시립대 시티혹스',
  '국민대학교': '국민대 레이저백스',
  '한국외국어대학교': '한국외대 블랙나이츠',

  // ───── 서울 2부 ─────
  '고려대학교': '고려대 타이거스',
  '중앙대학교': '중앙대 블루드래곤스',
  '숭실대학교': '숭실대 크루세이더스',
  '경희대학교': '경희대 커맨더스',
  '동국대학교': '동국대 터스커스',
  '서강대학교': '서강대 알바트로스',

  // ───── 경기강원 1부 ─────
  '강원대학교': '강원대 카프라',            // TEAMS 기준 명칭
  '인하대학교': '인하대 틸 드래곤스',
  '성균관대학교': '성균관대 로얄스',
  '단국대학교': '단국대 코디악베어스',

  // ───── 경기강원 2부 ─────
  '용인대학교': '용인대 화이트타이거스',
  '한림대학교': '한림대 피닉스',
  '한신대학교': '한신대 킬러웨일스',
  '카이스트': '카이스트 매버릭스',

  // ───── 대구경북 1부 ─────
  '경북대학교': '경북대 오렌지파이터스',
  '경일대학교': '경일대 블랙베어스',
  '한동대학교': '한동대 홀리램스',
  '대구가톨릭대학교': '대구가톨릭대 스커드엔젤스',
  '대구한의대학교': '대구한의대 라이노스',

  // ───── 대구경북 2부 ─────
  '금오공과대학교': '금오공과대 레이븐스',
  '대구대학교': '대구대 플라잉타이거스',
  '영남대학교': '영남대 페가수스',
  '계명대학교': '계명대 슈퍼라이온스',
  // (2부 데이터에 '동국대학교'가 등장하는 구간이 있는데, 대구동국이면 아래로 매핑)
  // 필요 시 안전하게 추가:
  // '동국대학교(경주)': '동국대 화이트엘리펀츠',
  // 데이터가 그냥 '동국대학교'면 아래 라인을 켜세요:
  '동국대학교(대구경북)': '동국대 화이트엘리펀츠',

  // ───── 부산경남 1부 ─────
  '경성대학교': '경성대 드래곤스',
  '동의대학교': '동의대 터틀파이터스',
  '동아대학교': '동아대 레오파즈',
  '울산대학교': '울산대 유니콘스',

  // ───── 부산경남 2부 ─────
  '부산외국어대학교': '부산외국어대 토네이도',
  '한국해양대학교': '한국해양대 바이킹스',
  '동서대학교': '동서대 블루돌핀스',
  '신라대학교': '신라대 데빌스',
  '부산대학교': '부산대 이글스',

  // ───── 사회인 (이미 팀명 형태이므로 보통 필요 X) ─────
  // '부산 그리폰즈': '부산 그리폰즈',
  // '삼성 블루스톰': '삼성 블루스톰',
  // '서울 골든이글스': '서울 골든이글스',
  // '서울 디펜더스': '서울 디펜더스',
  // '서울 바이킹스': '서울 바이킹스',
  // '인천 라이노스': '인천 라이노스',
  // '군위 피닉스': '군위 피닉스',
};
/* ─────────────────────────  공통 드롭다운  ───────────────────────── */
function Dropdown({
  value,
  options = [],
  onChange,
  label,
  placeholder,
  disabled = false,
  onTouch,
}) {
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="dropdown-container" ref={ref} aria-label={label}>
      <button
        type="button"
        className={`dropdown-trigger ${open ? 'open' : ''} ${
          !touched ? 'placeholder' : ''
        } ${disabled ? 'disabled' : ''}`}
        onClick={() => {
          if (!disabled) {
            setOpen((o) => !o);
            onTouch && onTouch();
          }
        }}
        disabled={disabled}
      >
        <span className="dropdown-text">
          {touched ? value : placeholder ?? value}
        </span>
        <FaChevronDown
          size={16}
          className={`dropdown-arrow ${open ? 'rotated' : ''}`}
        />
      </button>

      {open && !disabled && (
        <div className="dropdown-menu">
          <ul className="dropdown-list">
            {options.map((opt) => (
              <li key={opt}>
                <button
                  className={`dropdown-option ${
                    value === opt ? 'selected' : ''
                  }`}
                  onClick={() => {
                    onChange(opt);
                    setTouched(true);
                    setOpen(false);
                  }}
                  role="option"
                  aria-selected={value === opt}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────  상수  ───────────────────────── */
const LEAGUE_OPTIONS = ['서울', '경기강원', '대구경북', '부산경남', '사회인'];
const DIVISION_OPTIONS = ['1부', '2부'];

// 11개 통계 유형
const STAT_TYPE_OPTIONS = [
  '런',
  '패스', 
  '리시빙',
  '펌블',
  '태클',
  '인터셉션',
  '필드골',
  '킥오프',
  '킥 오프 리턴',
  '펀트',
  '펀트 리턴'
];

const TEAM_TO_LEAGUE = {
  '연세대학교': '서울',
  '고려대학교': '서울', 
  '한양대학교': '서울',
  '서울대학교': '서울',
  '홍익대학교': '서울',
  '건국대학교': '서울',
  '중앙대학교': '서울',
  '숭실대학교': '서울',
  '동국대학교': '서울',
  '경희대학교': '서울',
  '서강대학교': '서울',
  '국민대학교': '서울',
  '서울시립대학교': '서울',
  '한국외국어대학교': '서울',
  '성균관대학교': '경기강원',
  '강원대학교': '경기강원',
  '단국대학교': '경기강원',
  '용인대학교': '경기강원',
  '인하대학교': '경기강원',
  '한림대학교': '경기강원',
  '한신대학교': '경기강원',
  '카이스트': '경기강원',
  '경북대학교': '대구경북',
  '경일대학교': '대구경북',
  '계명대학교': '대구경북',
  '금오공과대학교': '대구경북',
  '대구가톨릭대학교': '대구경북',
  '대구대학교': '대구경북',
  '대구한의대학교': '대구경북',
  '동국대학교(경북)': '대구경북',
  '영남대학교': '대구경북',
  '한동대학교': '대구경북',
  '경성대학교': '부산경남',
  '부산대학교': '부산경남',
  '한국해양대학교': '부산경남',
  '신라대학교': '부산경남',
  '동서대학교': '부산경남',
  '동의대학교': '부산경남',
  '동아대학교': '부산경남',
  '부산외국어대학교': '부산경남',
  '울산대학교': '부산경남',
  '군위 피닉스': '사회인',
  '부산 그리폰즈': '사회인',
  '삼성 블루스톰': '사회인',
  '서울 골든이글스': '사회인',
  '서울 디펜더스': '사회인',
  '서울 바이킹스': '사회인',
  '인천 라이노스': '사회인',
};

const leagueHasDivisions = (league) => {
  return league !== '사회인' && league;
};

// 통계 유형별 컬럼 정의
// KAFA JSON에 실제로 있는 필드만 포함
const STAT_COLUMNS = {
  '런': [
    { key: 'rushingYards', label: '러싱 야드' },
    { key: 'rushingAttempts', label: '러싱 시도 수' },
    { key: 'yardsPerCarry', label: '볼 캐리 당\n러싱 야드' },
    { key: 'rushingTouchdowns', label: '러싱 터치다운' },
    { key: 'longestRush', label: '가장 긴\n러싱야드' },
  ],
  '패스': [
    { key: 'passingYards', label: '패싱 야드' },
    { key: 'avgYardsPerAttempt', label: '패스 시도당\n패싱야드' },
    { key: 'completionPercentage', label: '패스 성공률' },
    { key: 'attempts', label: '패스 시도' },
    { key: 'completions', label: '패스 성공' },
    { key: 'touchdowns', label: '패싱\n터치다운' },
    { key: 'interceptions', label: '인터셉션' },
    { key: 'longest', label: '가장\n긴 패스' },
  ],
  '리시빙': [
    { key: 'receptions', label: '패스 캐치 수' },
    { key: 'receivingYards', label: '리시빙 야드' },
    { key: 'yardsPerReception', label: '타겟 당\n리시빙 야드' },
    { key: 'touchdowns', label: '리시빙\n터치다운' },
    { key: 'longest', label: '가장 긴\n리시빙 야드' },
  ],
  '펌블': [
    { key: 'fumbles', label: '펌블' },
    { key: 'fumblesLost', label: '펌블 턴오버' },
    { key: 'fumbleTouchdowns', label: '펌블 터치다운' },
  ],
  '태클': [
    { key: 'tackles', label: '태클' },
    { key: 'sacks', label: '색' },
    { key: 'soloTackles', label: '솔로 태클' },
    { key: 'assistTackles', label: '콤보 태클' },
  ],
  '인터셉션': [
    { key: 'interceptions', label: '인터셉션' },
    { key: 'interceptionTouchdowns', label: '인터셉트\n터치다운' },
    { key: 'interceptionYards', label: '인터셉트 야드' },
    { key: 'longestInterception', label: '가장 긴\n인터셉트 야드' },
  ],
  '필드골': [
    { key: 'fieldGoalPercentage', label: '필드골 성공률' },
    { key: 'averageFieldGoalDistance', label: '평균\n필드골 거리' },
    { key: 'fieldGoalsMade', label: '필드골 성공' },
    { key: 'fieldGoalsAttempted', label: '필드골 시도' },
    { key: 'fieldGoalYards', label: '필드골 야드' },
    { key: 'longestFieldGoal', label: '가장\n긴 필드골' },
  ],
  '킥오프': [
    { key: 'averageKickoffYards', label: '평균 킥 야드' },
    { key: 'kickoffCount', label: '킥오프 수' },
    { key: 'kickoffYards', label: '킥오프 야드' },
    { key: 'kickoffTouchdowns', label: '킥오프 터치다운' },
    { key: 'longestKickoff', label: '가장\n긴 킥오프' },
  ],
  '킥 오프 리턴': [
    { key: 'averageKickReturnYards', label: '평균 킥\n리턴 야드' },
    { key: 'kickReturnCount', label: '킥 리턴 수' },
    { key: 'kickReturnYards', label: '킥 리턴 야드' },
    { key: 'kickReturnTouchdowns', label: '킥 리턴\n터치다운' },
    { key: 'longestKickReturn', label: '가장 긴\n킥 리턴' },
  ],
  '펀트': [
    { key: 'averagePuntYards', label: '평균 펀트 야드' },
    { key: 'puntCount', label: '펀트 수' },
    { key: 'puntYards', label: '펀트 야드' },
    { key: 'puntTouchdowns', label: '펀트 터치다운' },
    { key: 'longestPunt', label: '가장\n긴 펀트' },
  ],
  '펀트 리턴': [
    { key: 'averagePuntReturnYards', label: '평균 펀트\n리턴 야드' },
    { key: 'puntReturnCount', label: '펀트 리턴 수' },
    { key: 'puntReturnYards', label: '펀트 리턴 야드' },
    { key: 'puntReturnTouchdowns', label: '펀트 리턴\n터치다운' },
    { key: 'longestPuntReturn', label: '가장 긴\n펀트 리턴' },
  ],
};

// 각 유형별 기본 정렬 키
const PRIMARY_METRIC = {
  '런': 'rushingYards',
  '패스': 'passingYards',
  '리시빙': 'receptions',
  '펌블': 'fumbles',
  '태클': 'tackles',
  '인터셉션': 'interceptions',
  '필드골': 'fieldGoalPercentage',
  '킥오프': 'averageKickoffYards',
  '킥 오프 리턴': 'averageKickReturnYards',
  '펀트': 'averagePuntYards',
  '펀트 리턴': 'averagePuntReturnYards',
};

const LOWER_IS_BETTER = new Set([]);

/* ─────────────────────────  메인 컴포넌트  ───────────────────────── */
export default function StatPosition({ teams = [], data = null }) {
  const [league, setLeague] = useState('서울');
  const [division, setDivision] = useState('1부');
  const [statType, setStatType] = useState('런');
  const [currentSort, setCurrentSort] = useState(null);
  const [leagueSelected, setLeagueSelected] = useState(false);

  // 리그 변경 시 division과 정렬 초기화
  useEffect(() => {
    const showDivision = leagueHasDivisions(league);
    if (showDivision && !['1부', '2부'].includes(division)) {
      setDivision('1부');
    }
    
    // 기본 정렬 설정
    const primaryKey = PRIMARY_METRIC[statType];
    setCurrentSort(primaryKey ? { key: primaryKey, direction: 'desc' } : null);
  }, [league, division, statType]);

  const showDivision = leagueHasDivisions(league);
  const currentColumns = STAT_COLUMNS[statType] || [];

  const toggleSort = (key) => {
    setCurrentSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'desc' };
      return { key, direction: prev.direction === 'desc' ? 'asc' : 'desc' };
    });
  };

  const getSortValue = (row, key) => {
    const val = row[key];
    return typeof val === 'number' ? val : 0;
  };

  // 데이터 가져오기 - API 데이터만 사용
  const getCurrentData = () => {
    // data prop이 없으면 빈 배열 반환
    if (!data || !data[league]) {
      console.warn(`⚠️ No data available for league: ${league}`);
      return [];
    }

    const leagueData = data[league];


    // 사회인 리그는 division이 없음
    if (league === '사회인') {
      const result = leagueData[statType] || [];

      return result;
    }

    // 대학 리그는 division 확인
    const divisionKey = division === '1부' ? 'first' : 'second';
    const result = leagueData[divisionKey]?.[statType] || [];
   
    return result;
  };

  const sortedPlayers = useMemo(() => {
    const data = getCurrentData();
    if (!currentSort || !Array.isArray(data)) return data;

    const { key, direction } = currentSort;
    const cmp = (a, b) => {
      const av = getSortValue(a, key);
      const bv = getSortValue(b, key);
      if (av === bv) return 0;
      let diff = av - bv;
      if (LOWER_IS_BETTER.has(key)) diff = -diff;
      return direction === 'asc' ? diff : -diff;
    };

    return [...data].sort(cmp);
  }, [league, division, statType, currentSort]);

  // 순위 추가
  const rankedPlayers = useMemo(() => {
    return sortedPlayers.map((player, index) => ({
      ...player,
      __rank: index + 1,
    }));
  }, [sortedPlayers]);

  return (
    <div className="stat-position">
      <div className="stat-header">
        <div className="stat-dropdown-group">
          <Dropdown
            label="League"
            placeholder={league}
            value={league}
            options={LEAGUE_OPTIONS}
            onChange={setLeague}
            onTouch={() => setLeagueSelected(true)}
          />
          {showDivision && (
            <Dropdown
              label="Division"
              placeholder={division}
              value={division}
              options={DIVISION_OPTIONS}
              onChange={setDivision}
            />
          )}
          <Dropdown
            label="StatType"
            placeholder="유형"
            value={statType}
            options={STAT_TYPE_OPTIONS}
            onChange={setStatType}
          />
        </div>
      </div>

      <div className="table-header">
        <div className="table-title">리그 선수 순위</div>
      </div>

      <div className="table-wrapper">
        <div className="stat-table">
          <div className="table-head">
            <div className="!grid !grid-cols-[21rem_1fr] !items-stretch !py-0 !text-[#a5a5a5] !font-bold">
              <div className="table-row1">
                <div className="table-header-cell rank-column">순위</div>
                <div className="table-header-cell player-column">선수</div>
                <div className="table-header-cell team-column">소속팀</div>
              </div>
              <div
                className="table-row2"
                style={{
                  '--cols': String(currentColumns.length || 0),
                  whiteSpace: 'pre-line',
                }}
              >
                {currentColumns.map((col) => {
                  const isActive = currentSort && currentSort.key === col.key;
                  const direction = isActive ? currentSort.direction : null;
                  const isPrimary = PRIMARY_METRIC[statType] === col.key;
                  
                  return (
                    <div
                      key={col.key}
                      className={`table-header-cell stat-column sortable
                        ${isActive ? 'active-blue' : ''} ${
                        isPrimary && !isActive ? 'primary-orange' : ''
                      }`}
                    >
                      <button
                        type="button"
                        className={`sort-toggle one ${direction ?? 'none'}`}
                        onClick={() => toggleSort(col.key)}
                        title={
                          direction
                            ? `정렬: ${
                                direction === 'desc' ? '내림차순' : '오름차순'
                              }`
                            : '정렬 적용'
                        }
                      >
                        <span className="column-label">{col.label}</span>
                        <RxTriangleDown
                          className={`chev ${
                            direction === 'asc' ? 'asc' : ''
                          } ${isActive ? 'active-blue' : ''}`}
                          size={30}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="table-body">
            {rankedPlayers.map((row) => {
              const teamInfo = teams.find((t) => t.name === row.team);
              const isSecondDiv = division === '2부';
              
              return (
                <div
                  key={`${row.name}-${row.team}`}
                  className={`table-rows ${
                    isSecondDiv ? 'is-division2' : ''
                  }`}
                >
                  <div className="table-row1">
                    <div className="table-cell">{row.__rank}위</div>
                    <div className="table-cell player-name">
                      {row.name}
                    </div>
                    <div className="self-center items-center justify-start grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                      {teamInfo?.logo && (
                        <div className="team-logo">
                          <img
                            src={teamInfo.logo}
                            alt={`${row.team} 로고`}
                            className={`team-logo-img ${
                              teamInfo.logo.endsWith('.svg')
                                ? 'svg-logo'
                                : 'png-logo'
                            }`}
                          />
                        </div>
                      )}
                      <div>{row.team}</div>
                    </div>
                  </div>
                  <div
                    className="table-row2"
                    style={{ '--cols': String(currentColumns.length || 0) }}
                  >
                    {currentColumns.map((col) => {
                      const v = row[col.key];
                      if (typeof v === 'number') {
                        const isPct = String(col.key).includes('Percentage');
                        const shown =
                          v % 1 !== 0 || isPct
                            ? isPct
                              ? `${v.toFixed(1)}%`
                              : v.toFixed(1)
                            : v;
                        return (
                          <div key={col.key} className="table-cell">
                            {shown}
                          </div>
                        );
                      }
                      return (
                        <div key={col.key} className="table-cell">
                          {v ?? '0'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {!rankedPlayers.length && (
              <div className="empty-rows">표시할 선수가 없습니다.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}