// StatTeam.jsx
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { RxTriangleDown } from 'react-icons/rx';
import { FaChevronDown } from 'react-icons/fa';
import './StatTeam.css';
import { useStatInitial } from '../../hooks/useStatInitial';
import axios from 'axios';

/* ─────────────────────────  공통 드롭다운  ───────────────────────── */
function Dropdown({
  value,
  options,
  onChange,
  label,
  placeholder,
  onTouch,
  disabled = false,
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
        }`}
        onClick={() => {
          if (disabled) return;
          setOpen((o) => !o);
          if (onTouch) onTouch();
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
                  type="button"
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

/* ─────────────────────────  리그 매핑/옵션  ───────────────────────── */
const TEAM_TO_LEAGUE = {
  // 실제 KAFA 팀명에 맞춘 매핑
  '한양대학교': '서울',
  '연세대학교': '서울', 
  '고려대학교': '서울',
  '서울대학교': '서울',
  '중앙대학교': '서울',
  '건국대학교': '서울',
  '홍익대학교': '서울',
  '숭실대학교': '서울',
  '성균관대학교': '경기강원',
  '용인대학교': '경기강원',
  '강원대학교': '경기강원',
  '경북대학교': '대구경북',
  '경일대학교': '대구경북', 
  '대구대학교': '대구경북',
  '경성대학교': '부산경남',
  '부산외국어대학교': '부산경남',
  '동의대학교': '부산경남',
  '한국해양대학교': '부산경남',
  
  // 기존 매핑도 유지 (호환성)
  '연세대 이글스': '서울',
  '서울대 그린테러스': '서울',
  '한양대 라이온스': '서울',
  '국민대 레이저백스': '서울',
  '서울시립대 시티혹스': '서울',
  '한국외대 블랙나이츠': '서울',
  '건국대 레이징불스': '서울',
  '홍익대 카우보이스': '서울',
  '동국대 터스커스': '서울',
  '고려대 타이거스': '서울',
  '중앙대 블루드래곤스': '서울',
  '숭실대 크루세이더스': '서울',
  '서강대 알바트로스': '서울',
  '경희대 커맨더스': '서울',
  '강원대 카프라스': '경기강원',
  '단국대 코디악베어스': '경기강원',
  '성균관대 로얄스': '경기강원',
  '용인대 화이트타이거스': '경기강원',
  '인하대 틸 드래곤스': '경기강원',
  '한림대 피닉스': '경기강원',
  '한신대 킬러웨일스': '경기강원',
  '경북대 오렌지파이터스': '대구경북',
  '경일대 블랙베어스': '대구경북',
  '계명대 슈퍼라이온스': '대구경북',
  '금오공과대 레이븐스': '대구경북',
  '대구가톨릭대 스커드엔젤스': '대구경북',
  '대구대 플라잉타이거스': '대구경북',
  '대구한의대 라이노스': '대구경북',
  '동국대 화이트엘리펀츠': '대구경북',
  '영남대 페가수스': '대구경북',
  '한동대 홀리램스': '대구경북',
  '경성대 드래곤스': '부산경남',
  '동서대 블루돌핀스': '부산경남',
  '동아대 레오파즈': '부산경남',
  '동의대 터틀파이터스': '부산경남',
  '부산대 이글스': '부산경남',
  '부산외국어대 토네이도': '부산경남',
  '신라대 데빌스': '부산경남',
  '울산대 유니콘스': '부산경남',
  '한국해양대 바이킹스': '부산경남',
  '군위 피닉스': '사회인',
  '부산 그리폰즈': '사회인',
  '삼성 블루스톰': '사회인',
  '서울 골든이글스': '사회인',
  '서울 디펜더스': '사회인',
  '서울 바이킹스': '사회인',
  '인천 라이노스': '사회인',
};

const LEAGUE_OPTIONS = [...Array.from(new Set(Object.values(TEAM_TO_LEAGUE)))];
const DIVISION_OPTIONS = ['1부', '2부'];
// 새로운 3단계 구조: 오펜스/디펜스/스페셜팀 -> 세부 유형
const TEAM_CATEGORIES = {
  '오펜스': ['런', '패스', '리시빙', '득점'],
  '디펜스': ['태클', '인터셉트'],
  '스페셜팀': ['필드골', '킥오프', '킥오프 리턴', '펀트', '펀트 리턴']
};

const PLAY_TYPES = Object.keys(TEAM_CATEGORIES);

/* ─────────────────────────  정렬/컬럼 정의  ───────────────────────── */
const LOWER_IS_BETTER = new Set([
  'interceptions',
  'sacks',
  'fumbles',
  'fumbles_lost',
  'penalties',
  'sacks_allowed',
  'touchback_percentage',
  'fumble-turnover',
  'turnover_per_game',
  'turnover_rate',
  'penalty-pen_yards',
  'pen_yards_per_game',
]);

const PAIR_FIRST_DESC = new Set([
  'pass_completions-attempts',
  'field_goal_completions-attempts',
  'fumble-turnover',
  'penalty-pen_yards',
]);

const parsePair = (str) => {
  if (typeof str !== 'string') return [0, 0];
  const [a, b] = str.split('-').map((n) => parseFloat(n) || 0);
  return [a, b];
};

const getSortValue = (row, key) => {
  const v = row?.[key];
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    switch (key) {
      case 'pass_completions-attempts': {
        const [c, a] = parsePair(v);
        return a > 0 ? c / a : 0;
      }
      case 'field_goal_completions-attempts': {
        const [m, a] = parsePair(v);
        return a > 0 ? m / a : 0;
      }
      case 'fumble-turnover': {
        const [, t] = parsePair(v);
        return t;
      }
      case 'penalty-pen_yards': {
        const [, y] = parsePair(v);
        return y;
      }
      default:
        return parseFloat(v) || 0;
    }
  }
  return 0;
};

const PRIMARY_TEAM_METRIC = {
  '득점/경기': 'total_yards',
  패스: 'pass_completions-attempts',
  런: 'rushing_attempts',
  스페셜팀: 'total_return_yards',
  기타: 'turnover_per_game',
};

// 새로운 구조의 컬럼 정의 (순위와 팀명 제외 - 기본 표시됨)
const NEW_TEAM_COLUMNS = {
  // 오펜스 카테고리
  '오펜스': {
    '런': [
      { key: 'rushingYards', label: '러싱 야드' },
      { key: 'yardsPerCarry', label: '볼 캐리 당\n러싱 야드' },
      { key: 'rushingTouchdowns', label: '러싱\n터치다운' },
      { key: 'longestRush', label: '가장 긴\n러싱야드' },
    ],
    '패스': [
      { key: 'passingYards', label: '패싱 야드' },
      { key: 'yardsPerAttempt', label: '패스 시도 당\n패싱 야드' },
      { key: 'completionPercentage', label: '패스 성공률' },
      { key: 'attempts', label: '패스 시도 수' },
      { key: 'completions', label: '패스 성공 수' },
      { key: 'passingTouchdowns', label: '패싱\n터치다운' },
      { key: 'interceptions', label: '인터셉트' },
      { key: 'longestPass', label: '가장 긴 패스' },
    ],
    '리시빙': [
      { key: 'receptions', label: '패스 캐치 수' },
      { key: 'receivingYards', label: '리시빙 야드' },
      { key: 'yardsPerTarget', label: '타겟 당\n리시빙 야드' },
      { key: 'targets', label: '패스 타겟 수' },
      { key: 'receivingTouchdowns', label: '리시빙\n터치다운' },
      { key: 'longestReception', label: '가장 긴\n리시빙 야드' },
    ],
    '득점': [
      { key: 'rushingTd', label: '러싱\n터치다운' },
      { key: 'receivingTd', label: '리시빙\n터치다운' },
      { key: 'totalTd', label: '총 터치다운' },
    ],
  },
  // 디펜스 카테고리
  '디펜스': {
    '태클': [
      { key: 'tackles', label: '태클 수' },
      { key: 'sacks', label: '색' },
      { key: 'soloTackles', label: '솔로 태클' },
      { key: 'assistTackles', label: '콤보 태클' },
    ],
    '인터셉트': [
      { key: 'interceptions', label: '인터셉트' },
      { key: 'interceptionTd', label: '인터셉트\n터치다운' },
      { key: 'interceptionYards', label: '인터셉트 야드' },
      { key: 'longestInterception', label: '가장 긴\n인터셉트 야드' },
    ],
  },
  // 스페셜팀 카테고리
  '스페셜팀': {
    '필드골': [
      { key: 'fieldGoalPercentage', label: '필드골 성공률' },
      { key: 'avgFieldGoalDistance', label: '평균 필드골 거리' },
      { key: 'fieldGoalsMade', label: '필드골 성공' },
      { key: 'fieldGoalAttempts', label: '필드골 시도' },
      { key: 'fieldGoalYards', label: '필드골 야드' },
      { key: 'longestFieldGoal', label: '가장 긴 필드골' },
    ],
    '킥오프': [
      { key: 'avgKickYards', label: '평균 킥 야드' },
      { key: 'kickoffCount', label: '킥오프 수' },
      { key: 'kickoffYards', label: '킥오프 야드' },
      { key: 'kickoffTouchdowns', label: '킥오프\n터치다운' },
      { key: 'longestKickoff', label: '가장 긴 킥오프' },
    ],
    '킥오프 리턴': [
      { key: 'avgKickReturnYards', label: '평균 킥 리턴 야드' },
      { key: 'kickReturns', label: '킥 리턴 수' },
      { key: 'kickReturnYards', label: '킥 리턴 야드' },
      { key: 'kickReturnTouchdowns', label: '킥 리턴\n터치다운' },
      { key: 'longestKickReturn', label: '가장 긴\n킥 리턴' },
    ],
    '펀트': [
      { key: 'avgPuntYards', label: '평균 펀트 야드' },
      { key: 'puntCount', label: '펀트 수' },
      { key: 'puntYards', label: '펀트 야드' },
      { key: 'puntTouchdowns', label: '펀트\n터치다운' },
      { key: 'longestPunt', label: '가장 긴 펀트' },
    ],
    '펀트 리턴': [
      { key: 'avgPuntReturnYards', label: '평균 펀트\n리턴 야드' },
      { key: 'puntReturns', label: '펀트 리턴 수' },
      { key: 'puntReturnYards', label: '펀트 리턴 야드' },
      { key: 'puntReturnTouchdowns', label: '펀트 리턴\n터치다운' },
      { key: 'longestPuntReturn', label: '가장 긴\n펀트 리턴' },
    ],
  },
};

/**
 * props:
 *  - fixedLeague: "서울"        // 게스트 고정 리그
 *  - fixedDivision: "1부"       // 게스트 고정 디비전
 */
export default function StatTeam({
  teams = [],
  fixedLeague,
  fixedDivision,
}) {
  const isGuestFixed = Boolean(fixedLeague && fixedDivision);

  // 🔹 유저/로컬스토리지 기반 초기 리그/부
  const { initialValues, loaded, leagueHasDivisions } = useStatInitial();

  // 🔹 API 데이터 상태
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 리그/부 state를 초기값으로 세팅 (게스트면 props 우선)
  const [league, setLeague] = useState(() =>
    isGuestFixed ? fixedLeague : initialValues.league || '서울',
  );
  const [division, setDivision] = useState(() => {
    if (isGuestFixed) return fixedDivision;
    const hasDiv = leagueHasDivisions(initialValues.league);
    return hasDiv ? initialValues.division || '1부' : '';
  });

  const [playCategory, setPlayCategory] = useState('오펜스'); // 1단계: 오펜스/디펜스/스페셜팀
  const [playType, setPlayType] = useState('런'); // 2단계: 세부 유형
  const [leagueSelected, setLeagueSelected] = useState(false);

  // 🔹 initialValues가 바뀌었을 때(처음 로딩 등) 유저가 아직 직접 선택 안 했으면 동기화
  useEffect(() => {
    if (isGuestFixed) return;
    if (leagueSelected) return; // 이미 사용자가 직접 선택한 후면 건드리지 않음

    setLeague(initialValues.league || '서울');
    const hasDiv = leagueHasDivisions(initialValues.league);
    setDivision(hasDiv ? initialValues.division || '1부' : '');
  }, [
    initialValues.league,
    initialValues.division,
    isGuestFixed,
    leagueSelected,
    leagueHasDivisions,
  ]);

  // 게스트용: 부모에서 props 바뀌면 따라감 (기존 로직 유지)
  useEffect(() => {
    if (fixedLeague) setLeague(fixedLeague);
  }, [fixedLeague]);
  useEffect(() => {
    if (fixedDivision) setDivision(fixedDivision);
  }, [fixedDivision]);

  // 🔹 디비전 드롭다운 노출 조건
  const showDivision = isGuestFixed
    ? leagueHasDivisions(fixedLeague)         // 게스트면 해당 리그가 부를 가지면 항상 표시
    : leagueHasDivisions(league) && leagueSelected;
  
  // 현재 선택된 카테고리의 세부 유형들
  const currentPlayTypes = TEAM_CATEGORIES[playCategory] || [];
  
  // 현재 컬럼들
  const currentColumns = NEW_TEAM_COLUMNS[playCategory]?.[playType] || [];
  
  // 카테고리 변경 시 첫 번째 세부 유형으로 자동 변경
  useEffect(() => {
    const firstPlayType = TEAM_CATEGORIES[playCategory]?.[0];
    if (firstPlayType && firstPlayType !== playType) {
      setPlayType(firstPlayType);
    }
  }, [playCategory]);

  // 🔹 실제 KAFA API 호출 (나중에 운영시 사용)
  /*
  const fetchAllStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 로컬 백엔드 서버에서 실제 KAFA 스탯 가져오기
      const response = await axios.get('http://localhost:4000/api/kafa-stats/all-stats', { 
        timeout: 30000 // KAFA 크롤링에 시간이 걸리므로 30초 타임아웃
      });
      
      console.log('API 응답:', response.data);
      
      // 실제 데이터 구조에서 data 필드 확인
      const responseData = response.data.data || response.data;
      setApiData(responseData);
      setLoading(false);
    } catch (error) {
      console.error('KAFA API 에러:', error);
      setError(`KAFA 스탯을 불러오는 중 오류가 발생했습니다: ${error.response?.data?.message || error.message}`);
      setLoading(false);
    }
  };
  */

  // 🔹 데모용 하드코딩된 실제 KAFA 스타일 스탯 데이터
  const fetchAllStats = async () => {
    setLoading(true);
    setError(null);
    
    // 🔹 실제 KAFA 2025년 시즌 데이터 - 리그별 1부/2부 구분
    const kafaStyleData = {
      서울: {
        first: {
          team: {
            offense: {
              rushing: [
                { teamName: '한양대학교', rushingYards: 879, yardsPerCarry: 4.4, rushingTouchdowns: 7, longestRush: 54 },
                { teamName: '연세대학교', rushingYards: 800, yardsPerCarry: 4.7, rushingTouchdowns: 11, longestRush: 68 },
                { teamName: '서울대학교', rushingYards: 394, yardsPerCarry: 5.0, rushingTouchdowns: 2, longestRush: 39 },
                { teamName: '건국대학교', rushingYards: 289, yardsPerCarry: 4.8, rushingTouchdowns: 1, longestRush: 32 },
                { teamName: '홍익대학교', rushingYards: 563, yardsPerCarry: 5.1, rushingTouchdowns: 3, longestRush: 54 },
            ],
            passing: [
              // 1부 팀들만
              { teamName: '연세대학교', passingYards: 968, yardsPerAttempt: 6.3, completionPercentage: 48.1, attempts: 154, completions: 74, passingTouchdowns: 20, interceptions: 8, longestPass: 80 },
              { teamName: '경북대학교', passingYards: 738, yardsPerAttempt: 5.1, completionPercentage: 52.7, attempts: 146, completions: 77, passingTouchdowns: 12, interceptions: 5, longestPass: 90 },
              { teamName: '성균관대학교', passingYards: 541, yardsPerAttempt: 3.9, completionPercentage: 29.0, attempts: 138, completions: 40, passingTouchdowns: 5, interceptions: 9, longestPass: 59 },
              { teamName: '한양대학교', passingYards: 481, yardsPerAttempt: 4.6, completionPercentage: 42.9, attempts: 105, completions: 45, passingTouchdowns: 7, interceptions: 9, longestPass: 57 },
              { teamName: '경일대학교', passingYards: 314, yardsPerAttempt: 5.1, completionPercentage: 39.3, attempts: 61, completions: 24, passingTouchdowns: 5, interceptions: 9, longestPass: 58 },
              { teamName: '경성대학교', passingYards: 245, yardsPerAttempt: 5.7, completionPercentage: 51.2, attempts: 43, completions: 22, passingTouchdowns: 5, interceptions: 2, longestPass: 41 },
              { teamName: '서울대학교', passingYards: 227, yardsPerAttempt: 3.6, completionPercentage: 41.3, attempts: 63, completions: 26, passingTouchdowns: 1, interceptions: 8, longestPass: 33 },
              { teamName: '강원대학교', passingYards: 218, yardsPerAttempt: 3.8, completionPercentage: 36.8, attempts: 57, completions: 21, passingTouchdowns: 0, interceptions: 4, longestPass: 33 },
              { teamName: '건국대학교', passingYards: 85, yardsPerAttempt: 2.3, completionPercentage: 48.6, attempts: 37, completions: 18, passingTouchdowns: 0, interceptions: 3, longestPass: 24 },
            ],
            receiving: [
              // 1부 팀들만
              { teamName: '경북대학교', receptions: 77, receivingYards: 901, yardsPerTarget: 6.2, targets: 146, receivingTouchdowns: 12, longestReception: 90 },
              { teamName: '연세대학교', receptions: 74, receivingYards: 968, yardsPerTarget: 6.3, targets: 154, receivingTouchdowns: 20, longestReception: 80 },
              { teamName: '한양대학교', receptions: 45, receivingYards: 666, yardsPerTarget: 6.3, targets: 105, receivingTouchdowns: 7, longestReception: 57 },
              { teamName: '성균관대학교', receptions: 40, receivingYards: 583, yardsPerTarget: 4.2, targets: 138, receivingTouchdowns: 5, longestReception: 59 },
              { teamName: '서울대학교', receptions: 26, receivingYards: 245, yardsPerTarget: 3.9, targets: 63, receivingTouchdowns: 1, longestReception: 45 },
              { teamName: '경일대학교', receptions: 24, receivingYards: 310, yardsPerTarget: 5.1, targets: 61, receivingTouchdowns: 5, longestReception: 58 },
              { teamName: '경성대학교', receptions: 22, receivingYards: 227, yardsPerTarget: 5.3, targets: 43, receivingTouchdowns: 5, longestReception: 41 },
              { teamName: '강원대학교', receptions: 21, receivingYards: 172, yardsPerTarget: 3.0, targets: 57, receivingTouchdowns: 0, longestReception: 33 },
              { teamName: '건국대학교', receptions: 18, receivingYards: 185, yardsPerTarget: 5.0, targets: 37, receivingTouchdowns: 0, longestReception: 26 },
            ]
          },
          defense: {
            tackles: [
              // 1부 팀 디펜스 데이터 (추정값)
              { teamName: '연세대학교', tackles: 95, sacks: 12, soloTackles: 58, assistTackles: 37 },
              { teamName: '한양대학교', tackles: 89, sacks: 8, soloTackles: 54, assistTackles: 35 },
              { teamName: '경북대학교', tackles: 85, sacks: 6, soloTackles: 51, assistTackles: 34 },
            ],
            interceptions: [
              { teamName: '연세대학교', interceptions: 8, interceptionTd: 2, interceptionYards: 128, longestInterception: 68 },
              { teamName: '한양대학교', interceptions: 5, interceptionTd: 0, interceptionYards: 65, longestInterception: 38 },
            ]
          },
          special: {
            kicking: [
              { teamName: '건국대학교', fieldGoalPercentage: 100, avgFieldGoalDistance: 53, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 53, longestFieldGoal: 53 },
              { teamName: '연세대학교', fieldGoalPercentage: 80, avgFieldGoalDistance: 20.5, fieldGoalsMade: 4, fieldGoalAttempts: 5, fieldGoalYards: 82, longestFieldGoal: 82 },
              { teamName: '한양대학교', fieldGoalPercentage: 75, avgFieldGoalDistance: 18.3, fieldGoalsMade: 3, fieldGoalAttempts: 4, fieldGoalYards: 55, longestFieldGoal: 55 },
              { teamName: '서울대학교', fieldGoalPercentage: 75, avgFieldGoalDistance: 24, fieldGoalsMade: 3, fieldGoalAttempts: 4, fieldGoalYards: 72, longestFieldGoal: 72 },
              { teamName: '강원대학교', fieldGoalPercentage: 42.9, avgFieldGoalDistance: 20.3, fieldGoalsMade: 3, fieldGoalAttempts: 7, fieldGoalYards: 61, longestFieldGoal: 61 },
              { teamName: '경일대학교', fieldGoalPercentage: 33.3, avgFieldGoalDistance: 30, fieldGoalsMade: 1, fieldGoalAttempts: 3, fieldGoalYards: 30, longestFieldGoal: 30 }
            ],
            punting: [
              { teamName: '서울대학교', avgPuntYards: 54.6, puntCount: 10, puntYards: 546, puntTouchdowns: 0, longestPunt: 65 },
              { teamName: '경일대학교', avgPuntYards: 54.1, puntCount: 20, puntYards: 1082, puntTouchdowns: 0, longestPunt: 65 },
              { teamName: '성균관대학교', avgPuntYards: 48.0, puntCount: 15, puntYards: 720, puntTouchdowns: 0, longestPunt: 65 },
              { teamName: '강원대학교', avgPuntYards: 47.2, puntCount: 13, puntYards: 613, puntTouchdowns: 0, longestPunt: 60 },
              { teamName: '경북대학교', avgPuntYards: 46.4, puntCount: 20, puntYards: 928, puntTouchdowns: 0, longestPunt: 65 },
              { teamName: '경성대학교', avgPuntYards: 45.1, puntCount: 17, puntYards: 767, puntTouchdowns: 0, longestPunt: 61 },
              { teamName: '한양대학교', avgPuntYards: 43.3, puntCount: 26, puntYards: 1126, puntTouchdowns: 0, longestPunt: 65 },
              { teamName: '연세대학교', avgPuntYards: 42.1, puntCount: 40, puntYards: 1684, puntTouchdowns: 0, longestPunt: 75 },
              { teamName: '건국대학교', avgPuntYards: 17.8, puntCount: 6, puntYards: 107, puntTouchdowns: 0, longestPunt: 54 }
            ]
          }
        },
        second: {
          team: {
            offense: {
              rushing: [
                // 2부 팀들
                { teamName: '고려대학교', rushingYards: 796, yardsPerCarry: 5.8, rushingTouchdowns: 7, longestRush: 59 },
                { teamName: '중앙대학교', rushingYards: 370, yardsPerCarry: 5.4, rushingTouchdowns: 4, longestRush: 55 },
                { teamName: '숭실대학교', rushingYards: 368, yardsPerCarry: 4.1, rushingTouchdowns: 2, longestRush: 28 },
                { teamName: '용인대학교', rushingYards: 258, yardsPerCarry: 7.4, rushingTouchdowns: 2, longestRush: 63 },
                { teamName: '부산외국어대학교', rushingYards: 772, yardsPerCarry: 6.2, rushingTouchdowns: 6, longestRush: 34 },
                { teamName: '한국해양대학교', rushingYards: 480, yardsPerCarry: 5.9, rushingTouchdowns: 8, longestRush: 26 },
                { teamName: '대구대학교', rushingYards: 426, yardsPerCarry: 5.5, rushingTouchdowns: 6, longestRush: 67 },
              ],
              passing: [
                { teamName: '고려대학교', passingYards: 527, yardsPerAttempt: 5.3, completionPercentage: 58.0, attempts: 100, completions: 58, passingTouchdowns: 6, interceptions: 2, longestPass: 37 },
                { teamName: '용인대학교', passingYards: 330, yardsPerAttempt: 7.9, completionPercentage: 47.6, attempts: 42, completions: 20, passingTouchdowns: 7, interceptions: 3, longestPass: 72 },
                { teamName: '부산외국어대학교', passingYards: 307, yardsPerAttempt: 2.6, completionPercentage: 43.3, attempts: 120, completions: 52, passingTouchdowns: 11, interceptions: 2, longestPass: 53 },
                { teamName: '숭실대학교', passingYards: 170, yardsPerAttempt: 2.6, completionPercentage: 52.3, attempts: 65, completions: 34, passingTouchdowns: 6, interceptions: 4, longestPass: 33 },
                { teamName: '중앙대학교', passingYards: 61, yardsPerAttempt: 2.5, completionPercentage: 29.2, attempts: 24, completions: 7, passingTouchdowns: 0, interceptions: 4, longestPass: 12 },
              ],
              receiving: [
                { teamName: '고려대학교', receptions: 58, receivingYards: 530, yardsPerTarget: 5.3, targets: 100, receivingTouchdowns: 6, longestReception: 37 },
                { teamName: '부산외국어대학교', receptions: 52, receivingYards: 582, yardsPerTarget: 4.9, targets: 120, receivingTouchdowns: 11, longestReception: 53 },
                { teamName: '숭실대학교', receptions: 34, receivingYards: 313, yardsPerTarget: 4.8, targets: 65, receivingTouchdowns: 6, longestReception: 81 },
                { teamName: '용인대학교', receptions: 20, receivingYards: 327, yardsPerTarget: 7.8, targets: 42, receivingTouchdowns: 7, longestReception: 72 },
                { teamName: '중앙대학교', receptions: 7, receivingYards: 90, yardsPerTarget: 3.8, targets: 24, receivingTouchdowns: 0, longestReception: 20 },
              ]
            },
            defense: {
              tackles: [
                { teamName: '고려대학교', tackles: 82, sacks: 9, soloTackles: 49, assistTackles: 33 },
                { teamName: '중앙대학교', tackles: 76, sacks: 6, soloTackles: 45, assistTackles: 31 },
                { teamName: '숭실대학교', tackles: 70, sacks: 4, soloTackles: 42, assistTackles: 28 },
                { teamName: '용인대학교', tackles: 68, sacks: 3, soloTackles: 40, assistTackles: 28 },
                { teamName: '부산외국어대학교', tackles: 74, sacks: 7, soloTackles: 44, assistTackles: 30 },
                { teamName: '한국해양대학교', tackles: 71, sacks: 5, soloTackles: 42, assistTackles: 29 },
                { teamName: '대구대학교', tackles: 73, sacks: 6, soloTackles: 43, assistTackles: 30 },
              ],
              interceptions: [
                { teamName: '고려대학교', interceptions: 6, interceptionTd: 1, interceptionYards: 78, longestInterception: 42 },
                { teamName: '중앙대학교', interceptions: 4, interceptionTd: 1, interceptionYards: 52, longestInterception: 28 },
                { teamName: '숭실대학교', interceptions: 3, interceptionTd: 0, interceptionYards: 28, longestInterception: 18 },
                { teamName: '용인대학교', interceptions: 5, interceptionTd: 1, interceptionYards: 65, longestInterception: 35 },
                { teamName: '부산외국어대학교', interceptions: 7, interceptionTd: 2, interceptionYards: 89, longestInterception: 48 },
                { teamName: '한국해양대학교', interceptions: 4, interceptionTd: 0, interceptionYards: 42, longestInterception: 25 },
                { teamName: '대구대학교', interceptions: 5, interceptionTd: 1, interceptionYards: 58, longestInterception: 32 },
              ]
            },
            special: {
              kicking: [
                { teamName: '고려대학교', fieldGoalPercentage: 66.7, avgFieldGoalDistance: 25.2, fieldGoalsMade: 6, fieldGoalAttempts: 9, fieldGoalYards: 151, longestFieldGoal: 35 },
                { teamName: '중앙대학교', fieldGoalPercentage: 50.0, avgFieldGoalDistance: 20.0, fieldGoalsMade: 2, fieldGoalAttempts: 4, fieldGoalYards: 40, longestFieldGoal: 25 },
                { teamName: '숭실대학교', fieldGoalPercentage: 33.3, avgFieldGoalDistance: 18.0, fieldGoalsMade: 1, fieldGoalAttempts: 3, fieldGoalYards: 18, longestFieldGoal: 18 },
                { teamName: '부산외국어대학교', fieldGoalPercentage: 75, avgFieldGoalDistance: 15, fieldGoalsMade: 3, fieldGoalAttempts: 4, fieldGoalYards: 45, longestFieldGoal: 45 },
                { teamName: '용인대학교', fieldGoalPercentage: 50, avgFieldGoalDistance: 22, fieldGoalsMade: 2, fieldGoalAttempts: 4, fieldGoalYards: 44, longestFieldGoal: 44 },
                { teamName: '한국해양대학교', fieldGoalPercentage: 40.0, avgFieldGoalDistance: 25.0, fieldGoalsMade: 2, fieldGoalAttempts: 5, fieldGoalYards: 50, longestFieldGoal: 30 },
                { teamName: '대구대학교', fieldGoalPercentage: 60.0, avgFieldGoalDistance: 28.0, fieldGoalsMade: 3, fieldGoalAttempts: 5, fieldGoalYards: 84, longestFieldGoal: 35 },
              ],
              punting: [
                { teamName: '고려대학교', avgPuntYards: 35.8, puntCount: 28, puntYards: 1002, puntTouchdowns: 0, longestPunt: 48 },
                { teamName: '중앙대학교', avgPuntYards: 33.5, puntCount: 26, puntYards: 871, puntTouchdowns: 0, longestPunt: 44 },
                { teamName: '숭실대학교', avgPuntYards: 32.2, puntCount: 28, puntYards: 902, puntTouchdowns: 0, longestPunt: 42 },
                { teamName: '용인대학교', avgPuntYards: 38.5, puntCount: 15, puntYards: 578, puntTouchdowns: 0, longestPunt: 52 },
                { teamName: '부산외국어대학교', avgPuntYards: 36.2, puntCount: 20, puntYards: 724, puntTouchdowns: 0, longestPunt: 48 },
                { teamName: '한국해양대학교', avgPuntYards: 34.8, puntCount: 18, puntYards: 626, puntTouchdowns: 0, longestPunt: 45 },
                { teamName: '대구대학교', avgPuntYards: 37.1, puntCount: 22, puntYards: 816, puntTouchdowns: 0, longestPunt: 50 },
              ]
            }
          }
        }
      },
      social: {
        team: {
          offense: {
            rushing: [
              { teamName: '부산 그리폰즈', rushingYards: 542, yardsPerCarry: 4.8, rushingTouchdowns: 7, longestRush: 38 },
              { teamName: '서울 골든이글스', rushingYards: 498, yardsPerCarry: 4.2, rushingTouchdowns: 5, longestRush: 32 },
              { teamName: '삼성 블루스톰', rushingYards: 456, yardsPerCarry: 3.9, rushingTouchdowns: 4, longestRush: 28 },
              { teamName: '서울 디펜더스', rushingYards: 412, yardsPerCarry: 3.6, rushingTouchdowns: 3, longestRush: 25 },
              { teamName: '인천 라이노스', rushingYards: 387, yardsPerCarry: 3.4, rushingTouchdowns: 2, longestRush: 22 },
            ],
            passing: [
              { teamName: '서울 골든이글스', passingYards: 876, yardsPerAttempt: 6.8, completionPercentage: 62.3, attempts: 129, completions: 80, passingTouchdowns: 9, interceptions: 6, longestPass: 58 },
              { teamName: '부산 그리폰즈', passingYards: 834, yardsPerAttempt: 6.5, completionPercentage: 59.1, attempts: 128, completions: 76, passingTouchdowns: 8, interceptions: 7, longestPass: 52 },
              { teamName: '삼성 블루스톰', passingYards: 756, yardsPerAttempt: 5.9, completionPercentage: 55.8, attempts: 128, completions: 71, passingTouchdowns: 6, interceptions: 9, longestPass: 45 },
            ],
            receiving: [
              { teamName: '서울 골든이글스', receptions: 80, receivingYards: 876, yardsPerTarget: 6.8, targets: 129, receivingTouchdowns: 9, longestReception: 58 },
              { teamName: '부산 그리폰즈', receptions: 76, receivingYards: 834, yardsPerTarget: 6.5, targets: 128, receivingTouchdowns: 8, longestReception: 52 },
            ]
          }
        },
        defense: {
            tackles: [
              { teamName: '부산 그리폰즈', tackles: 89, sacks: 8, soloTackles: 54, assistTackles: 35 },
              { teamName: '서울 골든이글스', tackles: 85, sacks: 6, soloTackles: 51, assistTackles: 34 },
              { teamName: '삼성 블루스톰', tackles: 78, sacks: 7, soloTackles: 47, assistTackles: 31 },
            ],
            interceptions: [
              { teamName: '서울 골든이글스', interceptions: 6, interceptionTd: 1, interceptionYards: 78, longestInterception: 42 },
              { teamName: '부산 그리폰즈', interceptions: 4, interceptionTd: 0, interceptionYards: 52, longestInterception: 28 },
            ]
          },
          special: {
            kicking: [
              { teamName: '서울 골든이글스', fieldGoalPercentage: 75.0, avgFieldGoalDistance: 28.5, fieldGoalsMade: 9, fieldGoalAttempts: 12, fieldGoalYards: 257, longestFieldGoal: 42 },
              { teamName: '부산 그리폰즈', fieldGoalPercentage: 70.0, avgFieldGoalDistance: 26.8, fieldGoalsMade: 7, fieldGoalAttempts: 10, fieldGoalYards: 188, longestFieldGoal: 38 },
            ],
            punting: [
              { teamName: '부산 그리폰즈', avgPuntYards: 38.2, puntCount: 18, puntYards: 688, puntTouchdowns: 0, longestPunt: 55 },
              { teamName: '서울 골든이글스', avgPuntYards: 35.8, puntCount: 22, puntYards: 788, puntTouchdowns: 0, longestPunt: 48 },
            ]
          }
        }
      }
    };
    
    console.log('데모용 KAFA 스타일 데이터 로딩 완료');
    setApiData(kafaStyleData);
    setLoading(false);
  };

  // 🔹 컴포넌트 마운트 시 한 번만 API 호출
  useEffect(() => {
    fetchAllStats();
  }, []);

  const [currentSort, setCurrentSort] = useState(null);
  useEffect(() => {
    const baseKey = PRIMARY_TEAM_METRIC[playType];
    setCurrentSort(baseKey ? { key: baseKey, direction: 'desc' } : null);
  }, [playType]);

  const toggleSort = (key) => {
    setCurrentSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'desc' };
      return { key, direction: prev.direction === 'desc' ? 'asc' : 'desc' };
    });
  };

  // 🔹 간단한 데이터 필터링 로직: 리그 → 부 → 카테고리/유형
  const currentData = useMemo(() => {
    if (!apiData) return [];
    
    // 사회인은 부 구분 없음
    if (league === '사회인') {
      const teamData = apiData[league]?.team;
      if (!teamData) return [];
      
      let data = [];
      if (playCategory === '오펜스' && teamData.offense) {
        if (playType === '런') data = teamData.offense.rushing || [];
        else if (playType === '패스') data = teamData.offense.passing || [];
        else if (playType === '리시빙') data = teamData.offense.receiving || [];
      } else if (playCategory === '디펜스' && teamData.defense) {
        if (playType === '태클') data = teamData.defense.tackles || [];
        else if (playType === '인터셉트') data = teamData.defense.interceptions || [];
      } else if (playCategory === '스페셜팀' && teamData.special) {
        if (playType === '필드골') data = teamData.special.kicking || [];
        else if (playType === '펀트') data = teamData.special.punting || [];
      }
      
      console.log(`${league} 데이터:`, data.map(team => team.teamName));
      return data;
    }
    
    // 대학 리그: 리그[부].team 구조로 직접 접근
    const divisionKey = division === '1부' ? 'first' : 'second';
    const teamData = apiData[league]?.[divisionKey]?.team;
    
    if (!teamData) {
      console.log(`${league} ${division} 데이터 없음`);
      return [];
    }
    
    let data = [];
    if (playCategory === '오펜스' && teamData.offense) {
      if (playType === '런') data = teamData.offense.rushing || [];
      else if (playType === '패스') data = teamData.offense.passing || [];
      else if (playType === '리시빙') data = teamData.offense.receiving || [];
    } else if (playCategory === '디펜스' && teamData.defense) {
      if (playType === '태클') data = teamData.defense.tackles || [];
      else if (playType === '인터셉트') data = teamData.defense.interceptions || [];
    } else if (playCategory === '스페셜팀' && teamData.special) {
      if (playType === '필드골') data = teamData.special.kicking || [];
      else if (playType === '펀트') data = teamData.special.punting || [];
    }
    
    console.log(`${league} ${division} 데이터:`, data.map(team => team.teamName));
    return data;
  }, [apiData, league, division, playCategory, playType]);

  const sortedTeams = useMemo(() => {
    if (!currentData || !Array.isArray(currentData)) return [];

    const rows = [...currentData];
    
    // 기본적으로 첫 번째 컬럼의 값을 기준으로 내림차순 정렬
    if (currentColumns.length > 0) {
      const mainStatKey = currentColumns[0].key;
      
      rows.sort((a, b) => {
        const aValue = parseFloat(a[mainStatKey]) || 0;
        const bValue = parseFloat(b[mainStatKey]) || 0;
        return bValue - aValue; // 내림차순 (높은 값이 1위)
      });
    }
    
    // 사용자가 특정 컬럼을 클릭했을 때의 정렬
    if (currentSort) {
      const { key, direction } = currentSort;
      rows.sort((a, b) => {
        if (PAIR_FIRST_DESC.has(key)) {
          const [a1, a2] = parsePair(a[key] ?? '0-0');
          const [b1, b2] = parsePair(b[key] ?? '0-0');
          const prefSign = LOWER_IS_BETTER.has(key) ? 1 : -1;
          const dirSign = direction === 'asc' ? -1 : 1;
          const d1 = (a1 - b1) * prefSign * dirSign;
          if (d1 !== 0) return d1;
          const d2 = (a2 - b2) * prefSign * dirSign;
          return d2;
        }
        const av = getSortValue(a, key);
        const bv = getSortValue(b, key);
        if (av === bv) return 0;
        let diff = av - bv;
        if (LOWER_IS_BETTER.has(key)) diff = -diff;
        return direction === 'asc' ? diff : -diff;
      });
    }
    
    return rows;
  }, [currentData, currentSort, currentColumns]);

  const rankedTeams = useMemo(() => {
    if (!sortedTeams.length) {
      return sortedTeams.map((r, i) => ({ ...r, __rank: i + 1 }));
    }
    
    // 기본적으로 첫 번째 컬럼(러싱 야드 등)을 기준으로 순위 계산
    const columns = currentColumns;
    if (columns.length === 0) {
      return sortedTeams.map((r, i) => ({ ...r, __rank: i + 1 }));
    }
    
    // 첫 번째 컬럼을 기준으로 순위 계산 (보통 주요 스탯)
    const mainStatKey = columns[0]?.key;
    if (!mainStatKey) {
      return sortedTeams.map((r, i) => ({ ...r, __rank: i + 1 }));
    }
    
    // 값에 따라 순위 계산
    let lastValue = null;
    let currentRank = 0;
    let seen = 0;
    
    return sortedTeams.map((r) => {
      seen += 1;
      const currentValue = r[mainStatKey] ?? 0;
      
      // 값이 다르면 새로운 순위
      if (currentValue !== lastValue) {
        currentRank = seen;
      }
      
      lastValue = currentValue;
      return { ...r, __rank: currentRank };
    });
  }, [sortedTeams, currentColumns]);

  return (
    <div className="stat-position">
      <div className="stat-header">
        <div className="stat-dropdown-group">
          {/* 리그: 게스트면 옵션 1개(서울) + 비활성화 */}
          <Dropdown
            label="League"
            placeholder={league}
            value={league}
            options={isGuestFixed ? [fixedLeague] : LEAGUE_OPTIONS}
            onChange={setLeague}
            onTouch={() => setLeagueSelected(true)}
            disabled={isGuestFixed}
          />
          {/* 디비전: 게스트면 옵션 1개(1부) + 항상 노출 + 비활성화 */}
          {showDivision && (
            <Dropdown
              label="Division"
              placeholder={division}
              value={division}
              options={isGuestFixed ? [fixedDivision] : DIVISION_OPTIONS}
              onChange={setDivision}
              disabled={isGuestFixed}
            />
          )}
          {/* 새로운 3단계 구조: 카테고리 -> 세부 유형 */}
          <Dropdown
            label="Category"
            placeholder="카테고리"
            value={playCategory}
            options={PLAY_TYPES}
            onChange={setPlayCategory}
          />
          <Dropdown
            label="PlayType"
            placeholder="세부 유형"
            value={playType}
            options={currentPlayTypes}
            onChange={setPlayType}
          />
        </div>
      </div>

      <div className="table-header">
        <div className="table-title">팀 순위</div>
      </div>

      <div className="table-wrapper">
        <div className="stat-table">
          <div className="table-head">
            <div className="team-table-row">
              <div className="team-table-row1">
                <div className="team-table-header-cell rank-column">순위</div>
                <div className="team-table-header-cell team-column">팀</div>
              </div>
              <div
                className="team-table-row2"
                style={{
                  '--cols': String(currentColumns.length),
                  whiteSpace: 'pre-line',
                }}
              >
                {currentColumns.map((col) => {
                  const isActive = currentSort && currentSort.key === col.key;
                  const direction = isActive ? currentSort.direction : null;
                  const isPrimary = PRIMARY_TEAM_METRIC[playType] === col.key;
                  return (
                    <div
                      key={col.key}
                      className={`team-table-header-cell stat-column sortable
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
            {loading ? (
              <div className="loading-state">데이터를 불러오는 중...</div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : rankedTeams.length === 0 ? (
              <div className="empty-state">데이터가 없습니다.</div>
            ) : (
              rankedTeams.map((row) => {
                const teamName = row.teamName || row.team; // API 데이터에 맞게 수정
                const teamInfo = teams.find((t) => t.name === teamName);
                const isSecondDiv =
                  (isGuestFixed ? fixedDivision : division) === '2부';
                return (
                  <div
                    key={row.id || teamName || Math.random()}
                    className={`team-table-rows ${
                      isSecondDiv ? 'is-division2' : ''
                    }`}
                  >
                    <div className="team-table-row1">
                      <div className="team-table-cell">{row.__rank}위</div>
                      <div className="team-table-cell team-name">
                        {teamInfo?.logo && (
                          <div className="team-logo">
                            <img
                              src={teamInfo.logo}
                              alt={`${teamName} 로고`}
                              className={`team-logo-img ${
                                teamInfo.logo.endsWith('.svg')
                                  ? 'svg-logo'
                                  : 'png-logo'
                              }`}
                            />
                          </div>
                        )}
                        <span>{teamName}</span>
                      </div>
                    </div>
                    <div
                      className="team-table-row2"
                        style={{ '--cols': String(currentColumns.length || 0) }}
                    >
                      {currentColumns.map((col) => {
                        const v = row[col.key];
                        if (typeof v === 'number') {
                          const isPct = String(col.key).includes('percentage');
                          const shown =
                            v % 1 !== 0 || isPct
                              ? isPct
                                ? `${v.toFixed(1)}`
                                : v.toFixed(1)
                              : v;
                          return (
                            <div key={col.key} className="team-table-cell">
                              {shown}
                            </div>
                          );
                        }
                        return (
                          <div key={col.key} className="team-table-cell">
                            {v ?? '0'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}