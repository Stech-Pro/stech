import React, { useMemo, useState, useEffect, useRef } from 'react';
import { RxTriangleDown } from 'react-icons/rx';
import { FaChevronDown } from 'react-icons/fa';
import './StatTeam.css';
import { useStatInitial } from '../../hooks/useStatInitial';

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

/* ─────────────────────────  구조 정의  ───────────────────────── */
const LEAGUE_OPTIONS = ['서울', '경기강원', '대구경북', '부산경남', '사회인'];
const DIVISION_OPTIONS = ['1부', '2부'];

const TEAM_CATEGORIES = {
  '오펜스': ['런', '패스', '리시빙', '득점'],
  '디펜스': ['태클', '인터셉트'],
  '스페셜팀': ['필드골', '킥오프', '킥오프 리턴', '펀트', '펀트 리턴'],
};

const TEAM_CATEGORY_OPTIONS = Object.keys(TEAM_CATEGORIES);

// 팀별 컬럼 정의 (순위와 팀명 제외)
const TEAM_COLUMNS = {
  '오펜스': {
    '런': [
      { key: 'rushingYards', label: '러싱 야드' },
      { key: 'yardsPerCarry', label: '볼 캐리 당 러싱 야드' },
      { key: 'rushingTouchdowns', label: '러싱 터치다운' },
      { key: 'longestRush', label: '가장 긴 러싱야드' },
    ],
    '패스': [
      { key: 'passingYards', label: '패싱 야드' },
      { key: 'yardsPerAttempt', label: '패스 시도 당\n패싱 야드' },
      { key: 'completionPercentage', label: '패스 성공률' },
      { key: 'attempts', label: '패스 시도 수' },
      { key: 'completions', label: '패스 성공 수' },
      { key: 'passingTouchdowns', label: '패싱 터치다운' },
      { key: 'interceptions', label: '인터셉트' },
      { key: 'longestPass', label: '가장 긴 패스' },
    ],
    '리시빙': [
      { key: 'receptions', label: '패스 캐치 수' },
      { key: 'receivingYards', label: '리시빙 야드' },
      { key: 'yardsPerTarget', label: '타겟 당 리시빙 야드' },
      { key: 'targets', label: '패스 타겟 수' },
      { key: 'receivingTouchdowns', label: '리시빙 터치다운' },
      { key: 'longestReception', label: '가장 긴 리시빙 야드' },
    ],
    '득점': [
      { key: 'rushingTd', label: '러싱 터치다운' },
      { key: 'receivingTd', label: '리시빙 터치다운' },
      { key: 'totalTd', label: '총 터치다운' },
    ],
  },
  '디펜스': {
    '태클': [
      { key: 'tackles', label: '태클 수' },
      { key: 'sacks', label: '색' },
      { key: 'soloTackles', label: '솔로 태클' },
      { key: 'assistTackles', label: '콤보 태클' },
    ],
    '인터셉트': [
      { key: 'interceptions', label: '인터셉트' },
      { key: 'interceptionTd', label: '인터셉트 터치다운' },
      { key: 'interceptionYards', label: '인터셉트 야드' },
      { key: 'longestInterception', label: '가장 긴 인터셉트 야드' },
    ],
  },
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
      { key: 'kickoffTouchdowns', label: '킥오프 터치다운' },
      { key: 'longestKickoff', label: '가장 긴 킥오프' },
    ],
    '킥오프 리턴': [
      { key: 'avgKickReturnYards', label: '평균 킥 리턴 야드' },
      { key: 'kickReturnCount', label: '킥 리턴 수' },
      { key: 'kickReturnYards', label: '킥 리턴 야드' },
      { key: 'kickReturnTouchdowns', label: '킥 리턴 터치다운' },
      { key: 'longestKickReturn', label: '가장 긴 킥 리턴' },
    ],
    '펀트': [
      { key: 'avgPuntYards', label: '평균 펀트 야드' },
      { key: 'puntCount', label: '펀트 수' },
      { key: 'puntYards', label: '펀트 야드' },
      { key: 'puntTouchdowns', label: '펀트 터치다운' },
      { key: 'longestPunt', label: '가장 긴 펀트' },
    ],
    '펀트 리턴': [
      { key: 'avgPuntReturnYards', label: '평균 펀트 리턴 야드' },
      { key: 'puntReturnCount', label: '펀트 리턴 수' },
      { key: 'puntReturnYards', label: '펀트 리턴 야드' },
      { key: 'puntReturnTouchdowns', label: '펀트 리턴 터치다운' },
      { key: 'longestPuntReturn', label: '가장 긴 펀트 리턴' },
    ],
  },
};

const PRIMARY_TEAM_METRIC = {
  '오펜스': {
    '런': 'rushingYards',
    '패스': 'passingYards',
    '리시빙': 'receivingYards',
    '득점': 'totalTd',
  },
  '디펜스': {
    '태클': 'tackles',
    '인터셉트': 'interceptions',
  },
  '스페셜팀': {
    '필드골': 'fieldGoalPercentage',
    '킥오프': 'avgKickYards',
    '킥오프 리턴': 'avgKickReturnYards',
    '펀트': 'avgPuntYards',
    '펀트 리턴': 'avgPuntReturnYards',
  },
};

// 팀별 리그 매핑
const TEAM_TO_LEAGUE = {
  '한양대학교': '서울',
  '연세대학교': '서울',
  '서울대학교': '서울',
  '건국대학교': '서울',
  '홍익대학교': '서울',
  '고려대학교': '서울',
  '중앙대학교': '서울',
  '숭실대학교': '서울',
  '성균관대학교': '경기강원',
  '강원대학교': '경기강원',
  '용인대학교': '경기강원',
  '경북대학교': '대구경북',
  '경일대학교': '대구경북',
  '경성대학교': '부산경남',
  '부산 그리폰즈': '사회인',
  '서울 골든이글스': '사회인',
  '삼성 블루스톰': '사회인',
  '인천 라이노스': '사회인',
  '군위 피닉스': '사회인',
  '서울 디펜더스': '사회인',
  '서울 바이킹스': '사회인',
};

const leagueHasDivisions = (league) => {
  return league !== '사회인' && league;
};

/* ─────────────────────────  정렬/컬럼 정의  ───────────────────────── */
const LOWER_IS_BETTER = new Set([
  'interceptions',
  'sacks',
  'fumbles',
  'fumbles_lost',
  'penalties',
  'sacks_allowed',
  'touchback_percentage',
]);

const PAIR_FIRST_DESC = new Set([
  'pass_completions-attempts',
  'field_goal_completions-attempts',
  'fumble-turnover',
  'penalty-pen_yards',
]);

const parsePair = (v) => {
  if (typeof v === 'string' && v.includes('-')) {
    const [a, b] = v.split('-').map(Number);
    return [a || 0, b || 0];
  }
  return [parseFloat(v) || 0, 0];
};

const getSortValue = (row, key) => {
  const v = row[key];
  if (typeof v === 'string' && v.includes('%')) {
    return parseFloat(v.replace('%', '')) || 0;
  }
  if (typeof v === 'string' && v.includes('-')) {
    const [first] = v.split('-').map(Number);
    return first || 0;
  }
  return parseFloat(v) || 0;
};

export default function StatTeam({
  teams = [],
  fixedLeague,
  fixedDivision,
}) {
  const isGuestFixed = Boolean(fixedLeague && fixedDivision);

  // 🔹 유저/로컬스토리지 기반 초기 리그/부
  const { initialValues, loaded } = useStatInitial();

  // 🔹 리그/부 state를 초기값으로 세팅 (게스트면 props 우선)
  const [league, setLeague] = useState(() =>
    isGuestFixed ? fixedLeague : initialValues.league || '서울',
  );
  const [division, setDivision] = useState(() => {
    if (isGuestFixed) return fixedDivision;
    const hasDiv = leagueHasDivisions(initialValues.league);
    return hasDiv ? initialValues.division || '1부' : '';
  });

  const [playCategory, setPlayCategory] = useState('오펜스');
  const [playType, setPlayType] = useState('런');
  const [leagueSelected, setLeagueSelected] = useState(false);

  // 🔹 initialValues가 바뀌었을 때(처음 로딩 등) 유저가 아직 직접 선택 안 했으면 동기화
  useEffect(() => {
    if (isGuestFixed) return;
    if (leagueSelected) return; // 이미 사용자가 직접 선택한 후면 건드리지 않음

    setLeague(initialValues.league || '서울');
    const hasDiv = leagueHasDivisions(initialValues.league);
    if (hasDiv) {
      setDivision(initialValues.division || '1부');
    } else {
      setDivision('');
    }
  }, [initialValues, isGuestFixed, leagueSelected]);

  // 🔹 리그가 바뀌면 디비전을 해당 리그 기본값으로
  useEffect(() => {
    if (leagueHasDivisions(league)) {
      if (!division || (division !== '1부' && division !== '2부')) {
        setDivision('1부');
      }
    } else {
      setDivision('');
    }
  }, [league, division]);

  // 🔹 게스트 고정값이 바뀌면 반영
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
  const currentColumns = TEAM_COLUMNS[playCategory]?.[playType] || [];

  const [currentSort, setCurrentSort] = useState(null);
  useEffect(() => {
    const baseKey = PRIMARY_TEAM_METRIC[playCategory]?.[playType];
    setCurrentSort(baseKey ? { key: baseKey, direction: 'desc' } : null);
  }, [playCategory, playType]);

  const toggleSort = (key) => {
    setCurrentSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'desc' };
      return { key, direction: prev.direction === 'desc' ? 'asc' : 'desc' };
    });
  };

  // 🔹 KAFA 크롤링 데이터 (2024-12-05 최신 하드코딩) - 전체 리그별/부별 구조
  const kafaData = {
    서울: {
      first: {
        team: {
          offense: {
            rushing: [
              { teamName: '한양대학교', rushingYards: 879, yardsPerCarry: 4.4, rushingTouchdowns: 7, longestRush: 54, rushingTd: 8, receivingTd: 5, totalTd: 14 },
              { teamName: '연세대학교', rushingYards: 800, yardsPerCarry: 4.7, rushingTouchdowns: 11, longestRush: 68, rushingTd: 11, receivingTd: 19, totalTd: 32 },
              { teamName: '홍익대학교', rushingYards: 563, yardsPerCarry: 5.1, rushingTouchdowns: 3, longestRush: 54, rushingTd: 3, receivingTd: 1, totalTd: 4 },
              { teamName: '서울대학교', rushingYards: 394, yardsPerCarry: 5.0, rushingTouchdowns: 2, longestRush: 39, rushingTd: 2, receivingTd: 1, totalTd: 5 },
              { teamName: '건국대학교', rushingYards: 289, yardsPerCarry: 4.8, rushingTouchdowns: 1, longestRush: 32, rushingTd: 1, receivingTd: 0, totalTd: 2 },
              { teamName: '서울시립대학교', rushingYards: 177, yardsPerCarry: 2.6, rushingTouchdowns: 2, longestRush: 65, rushingTd: 1, receivingTd: 1, totalTd: 3 },
              { teamName: '국민대학교', rushingYards: 152, yardsPerCarry: 2.9, rushingTouchdowns: 2, longestRush: 27, rushingTd: 2, receivingTd: 0, totalTd: 2 },
              { teamName: '한국외국어대학교', rushingYards: 106, yardsPerCarry: 3.4, rushingTouchdowns: 0, longestRush: 36, rushingTd: 0, receivingTd: 0, totalTd: 0 },
            ],
            passing: [
              { teamName: '연세대학교', passingYards: 968, yardsPerAttempt: 6.3, completionPercentage: 48.1, attempts: 154, completions: 74, passingTouchdowns: 20, interceptions: 8, longestPass: 80 },
              { teamName: '한양대학교', passingYards: 481, yardsPerAttempt: 4.6, completionPercentage: 42.9, attempts: 105, completions: 45, passingTouchdowns: 7, interceptions: 9, longestPass: 57 },
              { teamName: '서울시립대학교', passingYards: 230, yardsPerAttempt: 2.5, completionPercentage: 28.6, attempts: 91, completions: 26, passingTouchdowns: 1, interceptions: 7, longestPass: 38 },
              { teamName: '서울대학교', passingYards: 227, yardsPerAttempt: 3.6, completionPercentage: 41.3, attempts: 63, completions: 26, passingTouchdowns: 1, interceptions: 8, longestPass: 33 },
              { teamName: '한국외국어대학교', passingYards: 117, yardsPerAttempt: 4.9, completionPercentage: 41.7, attempts: 24, completions: 10, passingTouchdowns: 0, interceptions: 0, longestPass: 32 },
              { teamName: '건국대학교', passingYards: 85, yardsPerAttempt: 2.3, completionPercentage: 48.6, attempts: 37, completions: 18, passingTouchdowns: 0, interceptions: 3, longestPass: 24 },
              { teamName: '국민대학교', passingYards: 158, yardsPerAttempt: 1.9, completionPercentage: 27.7, attempts: 83, completions: 23, passingTouchdowns: 2, interceptions: 8, longestPass: 22 },
              { teamName: '홍익대학교', passingYards: 17, yardsPerAttempt: 0.5, completionPercentage: 37.1, attempts: 35, completions: 13, passingTouchdowns: 1, interceptions: 1, longestPass: 15 },
            ],
            receiving: [
              { teamName: '연세대학교', receptions: 74, receivingYards: 1081, yardsPerTarget: 7.0, targets: 154, receivingTouchdowns: 20, longestReception: 80 },
              { teamName: '한양대학교', receptions: 45, receivingYards: 666, yardsPerTarget: 6.3, targets: 105, receivingTouchdowns: 7, longestReception: 57 },
              { teamName: '서울대학교', receptions: 26, receivingYards: 245, yardsPerTarget: 3.9, targets: 63, receivingTouchdowns: 1, longestReception: 45 },
              { teamName: '서울시립대학교', receptions: 26, receivingYards: 242, yardsPerTarget: 2.7, targets: 91, receivingTouchdowns: 1, longestReception: 38 },
              { teamName: '국민대학교', receptions: 23, receivingYards: 210, yardsPerTarget: 2.5, targets: 83, receivingTouchdowns: 2, longestReception: 53 },
              { teamName: '건국대학교', receptions: 18, receivingYards: 185, yardsPerTarget: 5.0, targets: 37, receivingTouchdowns: 0, longestReception: 26 },
              { teamName: '한국외국어대학교', receptions: 10, receivingYards: 113, yardsPerTarget: 4.7, targets: 24, receivingTouchdowns: 0, longestReception: 32 },
              { teamName: '홍익대학교', receptions: 13, receivingYards: 58, yardsPerTarget: 1.7, targets: 35, receivingTouchdowns: 1, longestReception: 37 },
            ]
          },
          defense: {
            tackles: [
              { teamName: '연세대학교', tackles: 394, sacks: 10, soloTackles: 115, assistTackles: 41 },
              { teamName: '한양대학교', tackles: 358, sacks: 5, soloTackles: 119, assistTackles: 29 },
              { teamName: '서울대학교', tackles: 209, sacks: 8, soloTackles: 58, assistTackles: 7 },
              { teamName: '건국대학교', tackles: 118, sacks: 0, soloTackles: 44, assistTackles: 5 },
              { teamName: '홍익대학교', tackles: 193, sacks: 1, soloTackles: 65, assistTackles: 19 },
              { teamName: '국민대학교', tackles: 198, sacks: 4, soloTackles: 43, assistTackles: 14 },
              { teamName: '서울시립대학교', tackles: 231, sacks: 1, soloTackles: 50, assistTackles: 14 },
              { teamName: '한국외국어대학교', tackles: 50, sacks: 0, soloTackles: 23, assistTackles: 6 },
            ],
            interceptions: [
              { teamName: '연세대학교', interceptions: 13, interceptionTd: 2, interceptionYards: 83, longestInterception: 25 },
              { teamName: '서울시립대학교', interceptions: 10, interceptionTd: 1, interceptionYards: 187, longestInterception: 54 },
              { teamName: '서울대학교', interceptions: 9, interceptionTd: 0, interceptionYards: 81, longestInterception: 25 },
              { teamName: '한양대학교', interceptions: 6, interceptionTd: 0, interceptionYards: 87, longestInterception: 45 },
              { teamName: '홍익대학교', interceptions: 5, interceptionTd: 0, interceptionYards: 15, longestInterception: 10 },
              { teamName: '국민대학교', interceptions: 4, interceptionTd: 0, interceptionYards: 89, longestInterception: 43 },
              { teamName: '건국대학교', interceptions: 1, interceptionTd: 0, interceptionYards: 0, longestInterception: 0 },
            ]
          },
          special: {
            kicking: [
              { teamName: '건국대학교', fieldGoalPercentage: 100.0, avgFieldGoalDistance: 53.0, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 53, longestFieldGoal: 53 },
              { teamName: '서울시립대학교', fieldGoalPercentage: 100.0, avgFieldGoalDistance: 14.0, fieldGoalsMade: 2, fieldGoalAttempts: 2, fieldGoalYards: 28, longestFieldGoal: 28 },
              { teamName: '연세대학교', fieldGoalPercentage: 80.0, avgFieldGoalDistance: 20.5, fieldGoalsMade: 4, fieldGoalAttempts: 5, fieldGoalYards: 82, longestFieldGoal: 35 },
              { teamName: '한양대학교', fieldGoalPercentage: 75.0, avgFieldGoalDistance: 18.3, fieldGoalsMade: 3, fieldGoalAttempts: 4, fieldGoalYards: 55, longestFieldGoal: 30 },
              { teamName: '서울대학교', fieldGoalPercentage: 75.0, avgFieldGoalDistance: 24.0, fieldGoalsMade: 3, fieldGoalAttempts: 4, fieldGoalYards: 72, longestFieldGoal: 27 },
              { teamName: '홍익대학교', fieldGoalPercentage: 100.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '한국외국어대학교', fieldGoalPercentage: 50.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 2, fieldGoalAttempts: 4, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '국민대학교', fieldGoalPercentage: 0.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 0, fieldGoalAttempts: 1, fieldGoalYards: 0, longestFieldGoal: 0 },
            ],
            punting: [
              { teamName: '서울대학교', avgPuntYards: 36.0, puntCount: 8, puntYards: 288, puntTouchdowns: 0, longestPunt: 47 },
              { teamName: '서울시립대학교', avgPuntYards: 32.9, puntCount: 23, puntYards: 757, puntTouchdowns: 0, longestPunt: 57 },
              { teamName: '한국외국어대학교', avgPuntYards: 30.8, puntCount: 5, puntYards: 154, puntTouchdowns: 0, longestPunt: 40 },
              { teamName: '한양대학교', avgPuntYards: 28.4, puntCount: 21, puntYards: 596, puntTouchdowns: 0, longestPunt: 54 },
              { teamName: '건국대학교', avgPuntYards: 26.6, puntCount: 9, puntYards: 239, puntTouchdowns: 0, longestPunt: 64 },
              { teamName: '국민대학교', avgPuntYards: 25.2, puntCount: 20, puntYards: 503, puntTouchdowns: 0, longestPunt: 60 },
              { teamName: '연세대학교', avgPuntYards: 25.1, puntCount: 15, puntYards: 377, puntTouchdowns: 0, longestPunt: 57 },
              { teamName: '홍익대학교', avgPuntYards: 22.6, puntCount: 17, puntYards: 385, puntTouchdowns: 0, longestPunt: 48 },
            ],
            kickoff: [
              { teamName: '서울대학교', avgKickYards: 54.6, kickoffCount: 10, kickoffYards: 546, kickoffTouchdowns: 0, longestKickoff: 65 },
              { teamName: '서울시립대학교', avgKickYards: 50.6, kickoffCount: 5, kickoffYards: 253, kickoffTouchdowns: 0, longestKickoff: 65 },
              { teamName: '한양대학교', avgKickYards: 43.3, kickoffCount: 26, kickoffYards: 1127, kickoffTouchdowns: 1, longestKickoff: 65 },
              { teamName: '연세대학교', avgKickYards: 42.1, kickoffCount: 40, kickoffYards: 1684, kickoffTouchdowns: 0, longestKickoff: 75 },
              { teamName: '국민대학교', avgKickYards: 29.6, kickoffCount: 5, kickoffYards: 148, kickoffTouchdowns: 0, longestKickoff: 65 },
              { teamName: '홍익대학교', avgKickYards: 28.3, kickoffCount: 7, kickoffYards: 198, kickoffTouchdowns: 0, longestKickoff: 55 },
              { teamName: '한국외국어대학교', avgKickYards: 27.5, kickoffCount: 2, kickoffYards: 55, kickoffTouchdowns: 0, longestKickoff: 55 },
              { teamName: '건국대학교', avgKickYards: 17.8, kickoffCount: 6, kickoffYards: 107, kickoffTouchdowns: 0, longestKickoff: 54 },
            ],
            'kickoff return': [
              { teamName: '서울대학교', avgKickReturnYards: 42.0, kickReturnCount: 4, kickReturnYards: 168, kickReturnTouchdowns: 1, longestKickReturn: 88 },
              { teamName: '서울시립대학교', avgKickReturnYards: 21.4, kickReturnCount: 5, kickReturnYards: 107, kickReturnTouchdowns: 0, longestKickReturn: 33 },
              { teamName: '연세대학교', avgKickReturnYards: 20.6, kickReturnCount: 11, kickReturnYards: 227, kickReturnTouchdowns: 0, longestKickReturn: 30 },
              { teamName: '한양대학교', avgKickReturnYards: 14.8, kickReturnCount: 18, kickReturnYards: 266, kickReturnTouchdowns: 0, longestKickReturn: 40 },
              { teamName: '국민대학교', avgKickReturnYards: 14.8, kickReturnCount: 4, kickReturnYards: 59, kickReturnTouchdowns: 0, longestKickReturn: 30 },
              { teamName: '건국대학교', avgKickReturnYards: 11.9, kickReturnCount: 7, kickReturnYards: 83, kickReturnTouchdowns: 0, longestKickReturn: 31 },
              { teamName: '홍익대학교', avgKickReturnYards: 10.3, kickReturnCount: 6, kickReturnYards: 62, kickReturnTouchdowns: 0, longestKickReturn: 25 },
              { teamName: '한국외국어대학교', avgKickReturnYards: 9.5, kickReturnCount: 2, kickReturnYards: 19, kickReturnTouchdowns: 0, longestKickReturn: 12 },
            ],
            'punt return': [
              { teamName: '서울시립대학교', avgPuntReturnYards: 10.2, puntReturnCount: 6, puntReturnYards: 61, puntReturnTouchdowns: 0, longestPuntReturn: 30 },
              { teamName: '건국대학교', avgPuntReturnYards: 10.0, puntReturnCount: 3, puntReturnYards: 30, puntReturnTouchdowns: 0, longestPuntReturn: 30 },
              { teamName: '국민대학교', avgPuntReturnYards: 10.0, puntReturnCount: 1, puntReturnYards: 10, puntReturnTouchdowns: 0, longestPuntReturn: 10 },
              { teamName: '서울대학교', avgPuntReturnYards: 6.3, puntReturnCount: 4, puntReturnYards: 25, puntReturnTouchdowns: 1, longestPuntReturn: 25 },
              { teamName: '홍익대학교', avgPuntReturnYards: 5.3, puntReturnCount: 8, puntReturnYards: 42, puntReturnTouchdowns: 0, longestPuntReturn: 18 },
              { teamName: '한양대학교', avgPuntReturnYards: 2.1, puntReturnCount: 8, puntReturnYards: 17, puntReturnTouchdowns: 0, longestPuntReturn: 10 },
              { teamName: '연세대학교', avgPuntReturnYards: 0.0, puntReturnCount: 6, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
            ]
          }
        }
      },
      second: {
        team: {
          offense: {
            rushing: [
              { teamName: '고려대학교', rushingYards: 796, yardsPerCarry: 5.8, rushingTouchdowns: 7, longestRush: 59, rushingTd: 8, receivingTd: 6, totalTd: 16 },
              { teamName: '중앙대학교', rushingYards: 370, yardsPerCarry: 5.4, rushingTouchdowns: 4, longestRush: 55, rushingTd: 3, receivingTd: 0, totalTd: 3 },
              { teamName: '숭실대학교', rushingYards: 368, yardsPerCarry: 4.1, rushingTouchdowns: 2, longestRush: 28, rushingTd: 2, receivingTd: 5, totalTd: 7 },
              { teamName: '경희대학교', rushingYards: 307, yardsPerCarry: 5.0, rushingTouchdowns: 2, longestRush: 52, rushingTd: 2, receivingTd: 1, totalTd: 3 },
              { teamName: '동국대학교', rushingYards: 250, yardsPerCarry: 7.6, rushingTouchdowns: 2, longestRush: 96, rushingTd: 2, receivingTd: 0, totalTd: 2 },
              { teamName: '서강대학교', rushingYards: 180, yardsPerCarry: 2.6, rushingTouchdowns: 1, longestRush: 24, rushingTd: 1, receivingTd: 3, totalTd: 4 },
            ],
            passing: [
              { teamName: '고려대학교', passingYards: 527, yardsPerAttempt: 5.3, completionPercentage: 58.0, attempts: 100, completions: 58, passingTouchdowns: 6, interceptions: 2, longestPass: 37 },
              { teamName: '숭실대학교', passingYards: 170, yardsPerAttempt: 2.6, completionPercentage: 52.3, attempts: 65, completions: 34, passingTouchdowns: 6, interceptions: 4, longestPass: 33 },
              { teamName: '중앙대학교', passingYards: 61, yardsPerAttempt: 2.5, completionPercentage: 29.2, attempts: 24, completions: 7, passingTouchdowns: 0, interceptions: 4, longestPass: 12 },
              { teamName: '동국대학교', passingYards: 215, yardsPerAttempt: 2.4, completionPercentage: 41.1, attempts: 90, completions: 37, passingTouchdowns: 0, interceptions: 7, longestPass: 38 },
              { teamName: '경희대학교', passingYards: 56, yardsPerAttempt: 2.7, completionPercentage: 23.8, attempts: 21, completions: 5, passingTouchdowns: 2, interceptions: 4, longestPass: 31 },
              { teamName: '서강대학교', passingYards: 316, yardsPerAttempt: 5.4, completionPercentage: 32.8, attempts: 58, completions: 19, passingTouchdowns: 3, interceptions: 4, longestPass: 72 },
            ],
            receiving: [
              { teamName: '고려대학교', receptions: 58, receivingYards: 530, yardsPerTarget: 5.3, targets: 100, receivingTouchdowns: 6, longestReception: 37 },
              { teamName: '동국대학교', receptions: 37, receivingYards: 290, yardsPerTarget: 3.2, targets: 90, receivingTouchdowns: 0, longestReception: 38 },
              { teamName: '숭실대학교', receptions: 34, receivingYards: 313, yardsPerTarget: 4.8, targets: 65, receivingTouchdowns: 6, longestReception: 81 },
              { teamName: '서강대학교', receptions: 19, receivingYards: 323, yardsPerTarget: 5.6, targets: 58, receivingTouchdowns: 3, longestReception: 72 },
              { teamName: '중앙대학교', receptions: 7, receivingYards: 90, yardsPerTarget: 3.8, targets: 24, receivingTouchdowns: 0, longestReception: 20 },
              { teamName: '경희대학교', receptions: 5, receivingYards: 66, yardsPerTarget: 3.1, targets: 21, receivingTouchdowns: 2, longestReception: 31 },
            ]
          },
          defense: {
            tackles: [
              { teamName: '고려대학교', tackles: 256, sacks: 8, soloTackles: 84, assistTackles: 21 },
              { teamName: '중앙대학교', tackles: 126, sacks: 5, soloTackles: 35, assistTackles: 3 },
              { teamName: '숭실대학교', tackles: 161, sacks: 2, soloTackles: 46, assistTackles: 11 },
              { teamName: '동국대학교', tackles: 197, sacks: 2, soloTackles: 74, assistTackles: 30 },
              { teamName: '경희대학교', tackles: 119, sacks: 6, soloTackles: 41, assistTackles: 10 },
              { teamName: '서강대학교', tackles: 184, sacks: 1, soloTackles: 57, assistTackles: 12 },
            ],
            interceptions: [
              { teamName: '서강대학교', interceptions: 9, interceptionTd: 1, interceptionYards: 47, longestInterception: 25 },
              { teamName: '고려대학교', interceptions: 7, interceptionTd: 1, interceptionYards: 104, longestInterception: 32 },
              { teamName: '숭실대학교', interceptions: 5, interceptionTd: 0, interceptionYards: 71, longestInterception: 32 },
              { teamName: '중앙대학교', interceptions: 4, interceptionTd: 0, interceptionYards: 2, longestInterception: 2 },
              { teamName: '동국대학교', interceptions: 3, interceptionTd: 0, interceptionYards: 21, longestInterception: 20 },
              { teamName: '경희대학교', interceptions: 2, interceptionTd: 0, interceptionYards: 3, longestInterception: 3 },
            ]
          },
          special: {
            kicking: [
              { teamName: '서강대학교', fieldGoalPercentage: 100.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '고려대학교', fieldGoalPercentage: 20.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 1, fieldGoalAttempts: 5, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '경희대학교', fieldGoalPercentage: 0.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 0, fieldGoalAttempts: 2, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '중앙대학교', fieldGoalPercentage: 0.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 0, fieldGoalAttempts: 1, fieldGoalYards: 0, longestFieldGoal: 0 },
            ],
            punting: [
              { teamName: '경희대학교', avgPuntYards: 37.8, puntCount: 8, puntYards: 302, puntTouchdowns: 0, longestPunt: 58 },
              { teamName: '서강대학교', avgPuntYards: 31.8, puntCount: 18, puntYards: 572, puntTouchdowns: 0, longestPunt: 53 },
              { teamName: '중앙대학교', avgPuntYards: 29.7, puntCount: 6, puntYards: 178, puntTouchdowns: 0, longestPunt: 40 },
              { teamName: '고려대학교', avgPuntYards: 26.2, puntCount: 16, puntYards: 419, puntTouchdowns: 0, longestPunt: 46 },
              { teamName: '동국대학교', avgPuntYards: 19.7, puntCount: 17, puntYards: 335, puntTouchdowns: 0, longestPunt: 54 },
              { teamName: '숭실대학교', avgPuntYards: 10.5, puntCount: 10, puntYards: 105, puntTouchdowns: 0, longestPunt: 33 },
            ],
            kickoff: [
              { teamName: '경희대학교', avgKickYards: 42.8, kickoffCount: 5, kickoffYards: 214, kickoffTouchdowns: 0, longestKickoff: 59 },
              { teamName: '서강대학교', avgKickYards: 41.1, kickoffCount: 8, kickoffYards: 329, kickoffTouchdowns: 0, longestKickoff: 65 },
              { teamName: '고려대학교', avgKickYards: 34.5, kickoffCount: 21, kickoffYards: 725, kickoffTouchdowns: 0, longestKickoff: 62 },
              { teamName: '동국대학교', avgKickYards: 33.4, kickoffCount: 5, kickoffYards: 167, kickoffTouchdowns: 0, longestKickoff: 55 },
              { teamName: '중앙대학교', avgKickYards: 30.5, kickoffCount: 6, kickoffYards: 183, kickoffTouchdowns: 0, longestKickoff: 55 },
              { teamName: '숭실대학교', avgKickYards: 26.3, kickoffCount: 8, kickoffYards: 210, kickoffTouchdowns: 0, longestKickoff: 60 },
            ],
            'kickoff return': [
              { teamName: '경희대학교', avgKickReturnYards: 27.1, kickReturnCount: 8, kickReturnYards: 217, kickReturnTouchdowns: 0, longestKickReturn: 75 },
              { teamName: '숭실대학교', avgKickReturnYards: 22.4, kickReturnCount: 5, kickReturnYards: 112, kickReturnTouchdowns: 0, longestKickReturn: 43 },
              { teamName: '동국대학교', avgKickReturnYards: 19.7, kickReturnCount: 3, kickReturnYards: 59, kickReturnTouchdowns: 0, longestKickReturn: 29 },
              { teamName: '중앙대학교', avgKickReturnYards: 18.8, kickReturnCount: 4, kickReturnYards: 75, kickReturnTouchdowns: 0, longestKickReturn: 23 },
              { teamName: '서강대학교', avgKickReturnYards: 16.5, kickReturnCount: 6, kickReturnYards: 99, kickReturnTouchdowns: 0, longestKickReturn: 32 },
              { teamName: '고려대학교', avgKickReturnYards: 12.2, kickReturnCount: 11, kickReturnYards: 134, kickReturnTouchdowns: 0, longestKickReturn: 22 },
            ],
            'punt return': [
              { teamName: '숭실대학교', avgPuntReturnYards: 18.7, puntReturnCount: 3, puntReturnYards: 56, puntReturnTouchdowns: 0, longestPuntReturn: 33 },
              { teamName: '중앙대학교', avgPuntReturnYards: 5.0, puntReturnCount: 4, puntReturnYards: 20, puntReturnTouchdowns: 0, longestPuntReturn: 10 },
              { teamName: '고려대학교', avgPuntReturnYards: 3.0, puntReturnCount: 5, puntReturnYards: 15, puntReturnTouchdowns: 0, longestPuntReturn: 12 },
              { teamName: '서강대학교', avgPuntReturnYards: 0.0, puntReturnCount: 1, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
              { teamName: '경희대학교', avgPuntReturnYards: 0.0, puntReturnCount: 2, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
            ]
          }
        }
      }
    },
    경기강원: {
      first: {
        team: {
          offense: {
            rushing: [
              { teamName: '강원대학교', rushingYards: 535, yardsPerCarry: 3.8, rushingTouchdowns: 6, longestRush: 43, rushingTd: 6, receivingTd: 0, totalTd: 7 },
              { teamName: '인하대학교', rushingYards: 187, yardsPerCarry: 5.1, rushingTouchdowns: 3, longestRush: 80, rushingTd: 3, receivingTd: 1, totalTd: 7 },
              { teamName: '성균관대학교', rushingYards: 173, yardsPerCarry: 2.6, rushingTouchdowns: 5, longestRush: 38, rushingTd: 5, receivingTd: 5, totalTd: 11 },
              { teamName: '단국대학교', rushingYards: 34, yardsPerCarry: 0.6, rushingTouchdowns: 0, longestRush: 15, rushingTd: 0, receivingTd: 2, totalTd: 2 },
            ],
            passing: [
              { teamName: '성균관대학교', passingYards: 541, yardsPerAttempt: 3.9, completionPercentage: 29.0, attempts: 138, completions: 40, passingTouchdowns: 5, interceptions: 9, longestPass: 59 },
              { teamName: '인하대학교', passingYards: 229, yardsPerAttempt: 4.3, completionPercentage: 43.4, attempts: 53, completions: 23, passingTouchdowns: 1, interceptions: 6, longestPass: 37 },
              { teamName: '강원대학교', passingYards: 218, yardsPerAttempt: 3.8, completionPercentage: 36.8, attempts: 57, completions: 21, passingTouchdowns: 0, interceptions: 4, longestPass: 33 },
              { teamName: '단국대학교', passingYards: 154, yardsPerAttempt: 4.7, completionPercentage: 27.3, attempts: 33, completions: 9, passingTouchdowns: 3, interceptions: 6, longestPass: 80 },
            ],
            receiving: [
              { teamName: '성균관대학교', receptions: 40, receivingYards: 583, yardsPerTarget: 4.2, targets: 138, receivingTouchdowns: 5, longestReception: 59 },
              { teamName: '인하대학교', receptions: 23, receivingYards: 227, yardsPerTarget: 4.3, targets: 53, receivingTouchdowns: 1, longestReception: 37 },
              { teamName: '강원대학교', receptions: 21, receivingYards: 172, yardsPerTarget: 3.0, targets: 57, receivingTouchdowns: 0, longestReception: 33 },
              { teamName: '단국대학교', receptions: 9, receivingYards: 156, yardsPerTarget: 4.7, targets: 33, receivingTouchdowns: 3, longestReception: 80 },
            ]
          },
          defense: {
            tackles: [
              { teamName: '성균관대학교', tackles: 265, sacks: 1, soloTackles: 105, assistTackles: 19 },
              { teamName: '강원대학교', tackles: 249, sacks: 4, soloTackles: 59, assistTackles: 14 },
              { teamName: '인하대학교', tackles: 154, sacks: 1, soloTackles: 34, assistTackles: 3 },
              { teamName: '단국대학교', tackles: 154, sacks: 2, soloTackles: 38, assistTackles: 8 },
            ],
            interceptions: [
              { teamName: '강원대학교', interceptions: 9, interceptionTd: 1, interceptionYards: 142, longestInterception: 39 },
              { teamName: '성균관대학교', interceptions: 8, interceptionTd: 0, interceptionYards: 46, longestInterception: 20 },
              { teamName: '인하대학교', interceptions: 3, interceptionTd: 0, interceptionYards: 28, longestInterception: 20 },
              { teamName: '단국대학교', interceptions: 3, interceptionTd: 0, interceptionYards: 80, longestInterception: 62 },
            ]
          },
          special: {
            kicking: [
              { teamName: '강원대학교', fieldGoalPercentage: 42.9, avgFieldGoalDistance: 20.3, fieldGoalsMade: 3, fieldGoalAttempts: 7, fieldGoalYards: 61, longestFieldGoal: 36 },
              { teamName: '단국대학교', fieldGoalPercentage: 0.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 0, fieldGoalAttempts: 2, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '성균관대학교', fieldGoalPercentage: 0.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 0, fieldGoalAttempts: 3, fieldGoalYards: 0, longestFieldGoal: 0 },
            ],
            punting: [
              { teamName: '인하대학교', avgPuntYards: 29.7, puntCount: 7, puntYards: 208, puntTouchdowns: 0, longestPunt: 42 },
              { teamName: '강원대학교', avgPuntYards: 28.1, puntCount: 21, puntYards: 591, puntTouchdowns: 0, longestPunt: 46 },
              { teamName: '성균관대학교', avgPuntYards: 22.3, puntCount: 22, puntYards: 490, puntTouchdowns: 0, longestPunt: 44 },
            ],
            kickoff: [
              { teamName: '성균관대학교', avgKickYards: 48.0, kickoffCount: 15, kickoffYards: 720, kickoffTouchdowns: 0, longestKickoff: 65 },
              { teamName: '강원대학교', avgKickYards: 47.2, kickoffCount: 13, kickoffYards: 613, kickoffTouchdowns: 0, longestKickoff: 60 },
              { teamName: '인하대학교', avgKickYards: 44.6, kickoffCount: 11, kickoffYards: 491, kickoffTouchdowns: 0, longestKickoff: 57 },
              { teamName: '단국대학교', avgKickYards: 26.8, kickoffCount: 4, kickoffYards: 107, kickoffTouchdowns: 0, longestKickoff: 35 },
            ],
            'kickoff return': [
              { teamName: '인하대학교', avgKickReturnYards: 29.3, kickReturnCount: 11, kickReturnYards: 322, kickReturnTouchdowns: 3, longestKickReturn: 90 },
              { teamName: '강원대학교', avgKickReturnYards: 17.2, kickReturnCount: 12, kickReturnYards: 206, kickReturnTouchdowns: 0, longestKickReturn: 42 },
              { teamName: '단국대학교', avgKickReturnYards: 15.7, kickReturnCount: 7, kickReturnYards: 110, kickReturnTouchdowns: 0, longestKickReturn: 32 },
              { teamName: '성균관대학교', avgKickReturnYards: 14.8, kickReturnCount: 8, kickReturnYards: 118, kickReturnTouchdowns: 0, longestKickReturn: 25 },
            ],
            'punt return': [
              { teamName: '강원대학교', avgPuntReturnYards: 17.0, puntReturnCount: 1, puntReturnYards: 17, puntReturnTouchdowns: 0, longestPuntReturn: 17 },
              { teamName: '성균관대학교', avgPuntReturnYards: 11.3, puntReturnCount: 10, puntReturnYards: 113, puntReturnTouchdowns: 0, longestPuntReturn: 50 },
              { teamName: '단국대학교', avgPuntReturnYards: 8.5, puntReturnCount: 2, puntReturnYards: 17, puntReturnTouchdowns: 0, longestPuntReturn: 17 },
            ]
          }
        }
      },
      second: {
        team: {
          offense: {
            rushing: [
              { teamName: '용인대학교', rushingYards: 258, yardsPerCarry: 7.4, rushingTouchdowns: 2, longestRush: 63, rushingTd: 2, receivingTd: 7, totalTd: 9 },
              { teamName: '한림대학교', rushingYards: 178, yardsPerCarry: 5.2, rushingTouchdowns: 2, longestRush: 35, rushingTd: 2, receivingTd: 1, totalTd: 3 },
              { teamName: '한신대학교', rushingYards: 111, yardsPerCarry: 2.6, rushingTouchdowns: 0, longestRush: 16, rushingTd: 0, receivingTd: 1, totalTd: 1 },
              { teamName: '카이스트', rushingYards: 170, yardsPerCarry: 3.0, rushingTouchdowns: 1, longestRush: 30, rushingTd: 1, receivingTd: 0, totalTd: 1 },
            ],
            passing: [
              { teamName: '용인대학교', passingYards: 330, yardsPerAttempt: 7.9, completionPercentage: 47.6, attempts: 42, completions: 20, passingTouchdowns: 7, interceptions: 3, longestPass: 72 },
              { teamName: '한림대학교', passingYards: 7, yardsPerAttempt: 0.6, completionPercentage: 16.7, attempts: 12, completions: 2, passingTouchdowns: 0, interceptions: 1, longestPass: 7 },
              { teamName: '한신대학교', passingYards: 0, yardsPerAttempt: 0, completionPercentage: 22.2, attempts: 18, completions: 4, passingTouchdowns: 1, interceptions: 2, longestPass: 0 },
              { teamName: '카이스트', passingYards: 31, yardsPerAttempt: 2.6, completionPercentage: 33.3, attempts: 12, completions: 4, passingTouchdowns: 1, interceptions: 2, longestPass: 22 },
            ],
            receiving: [
              { teamName: '용인대학교', receptions: 20, receivingYards: 327, yardsPerTarget: 7.8, targets: 42, receivingTouchdowns: 7, longestReception: 72 },
              { teamName: '카이스트', receptions: 4, receivingYards: 26, yardsPerTarget: 2.2, targets: 12, receivingTouchdowns: 1, longestReception: 22 },
              { teamName: '한신대학교', receptions: 4, receivingYards: 1, yardsPerTarget: 0.1, targets: 18, receivingTouchdowns: 1, longestReception: 1 },
              { teamName: '한림대학교', receptions: 2, receivingYards: 7, yardsPerTarget: 0.6, targets: 12, receivingTouchdowns: 0, longestReception: 7 },
            ]
          },
          defense: {
            tackles: [
              { teamName: '용인대학교', tackles: 114, sacks: 3, soloTackles: 42, assistTackles: 4 },
              { teamName: '한림대학교', tackles: 45, sacks: 0, soloTackles: 13, assistTackles: 1 },
              { teamName: '한신대학교', tackles: 113, sacks: 0, soloTackles: 42, assistTackles: 8 },
              { teamName: '카이스트', tackles: 100, sacks: 0, soloTackles: 30, assistTackles: 7 },
            ],
            interceptions: [
              { teamName: '용인대학교', interceptions: 1, interceptionTd: 0, interceptionYards: 3, longestInterception: 3 },
              { teamName: '한림대학교', interceptions: 2, interceptionTd: 1, interceptionYards: 3, longestInterception: 3 },
              { teamName: '한신대학교', interceptions: 1, interceptionTd: 0, interceptionYards: 0, longestInterception: 0 },
              { teamName: '카이스트', interceptions: 2, interceptionTd: 0, interceptionYards: 12, longestInterception: 12 },
            ]
          },
          special: {
            kicking: [
              { teamName: '한신대학교', fieldGoalPercentage: 100.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 0, longestFieldGoal: 0 },
            ],
            punting: [
              { teamName: '한신대학교', avgPuntYards: 39.1, puntCount: 10, puntYards: 391, puntTouchdowns: 0, longestPunt: 53 },
              { teamName: '카이스트', avgPuntYards: 36.7, puntCount: 6, puntYards: 220, puntTouchdowns: 0, longestPunt: 43 },
              { teamName: '용인대학교', avgPuntYards: 32.5, puntCount: 6, puntYards: 195, puntTouchdowns: 0, longestPunt: 45 },
              { teamName: '한림대학교', avgPuntYards: 31.0, puntCount: 2, puntYards: 62, puntTouchdowns: 0, longestPunt: 35 },
              { teamName: '단국대학교', avgPuntYards: 7.3, puntCount: 8, puntYards: 58, puntTouchdowns: 0, longestPunt: 43 },
              { teamName: '카이스트', avgPuntYards: 36.7, puntCount: 6, puntYards: 220, puntTouchdowns: 0, longestPunt: 43 },
            ],
            kickoff: [
              { teamName: '카이스트', avgKickYards: 49.3, kickoffCount: 3, kickoffYards: 148, kickoffTouchdowns: 0, longestKickoff: 52 },
              { teamName: '용인대학교', avgKickYards: 40.9, kickoffCount: 10, kickoffYards: 409, kickoffTouchdowns: 0, longestKickoff: 54 },
              { teamName: '한림대학교', avgKickYards: 40.8, kickoffCount: 4, kickoffYards: 163, kickoffTouchdowns: 0, longestKickoff: 53 },
              { teamName: '한신대학교', avgKickYards: 35.0, kickoffCount: 5, kickoffYards: 175, kickoffTouchdowns: 0, longestKickoff: 54 },
            ],
            'kickoff return': [
              { teamName: '한림대학교', avgKickReturnYards: 45.0, kickReturnCount: 1, kickReturnYards: 45, kickReturnTouchdowns: 0, longestKickReturn: 45 },
              { teamName: '한신대학교', avgKickReturnYards: 16.5, kickReturnCount: 10, kickReturnYards: 165, kickReturnTouchdowns: 0, longestKickReturn: 34 },
              { teamName: '용인대학교', avgKickReturnYards: 16.0, kickReturnCount: 3, kickReturnYards: 48, kickReturnTouchdowns: 0, longestKickReturn: 23 },
              { teamName: '카이스트', avgKickReturnYards: 9.7, kickReturnCount: 6, kickReturnYards: 58, kickReturnTouchdowns: 0, longestKickReturn: 23 },
            ],
            'punt return': [
              { teamName: '용인대학교', avgPuntReturnYards: 0.0, puntReturnCount: 1, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
              { teamName: '카이스트', avgPuntReturnYards: 0.0, puntReturnCount: 1, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
            ]
          }
        }
      }
    },
    대구경북: {
      first: {
        team: {
          offense: {
            rushing: [
              { teamName: '경북대학교', rushingYards: 673, yardsPerCarry: 5.3, rushingTouchdowns: 5, longestRush: 85, rushingTd: 5, receivingTd: 11, totalTd: 18 },
              { teamName: '경일대학교', rushingYards: 578, yardsPerCarry: 3.5, rushingTouchdowns: 4, longestRush: 32, rushingTd: 4, receivingTd: 5, totalTd: 12 },
              { teamName: '한동대학교', rushingYards: 184, yardsPerCarry: 3.4, rushingTouchdowns: 3, longestRush: 38, rushingTd: 3, receivingTd: 1, totalTd: 4 },
              { teamName: '대구가톨릭대학교', rushingYards: 180, yardsPerCarry: 2.4, rushingTouchdowns: 2, longestRush: 15, rushingTd: 2, receivingTd: 0, totalTd: 2 },
              { teamName: '대구한의대학교', rushingYards: 42, yardsPerCarry: 1.3, rushingTouchdowns: 0, longestRush: 22, rushingTd: 0, receivingTd: 1, totalTd: 1 },
            ],
            passing: [
              { teamName: '경북대학교', passingYards: 738, yardsPerAttempt: 5.1, completionPercentage: 52.7, attempts: 146, completions: 77, passingTouchdowns: 12, interceptions: 5, longestPass: 90 },
              { teamName: '경일대학교', passingYards: 314, yardsPerAttempt: 5.1, completionPercentage: 39.3, attempts: 61, completions: 24, passingTouchdowns: 5, interceptions: 9, longestPass: 58 },
              { teamName: '대구가톨릭대학교', passingYards: 66, yardsPerAttempt: 3.7, completionPercentage: 50.0, attempts: 18, completions: 9, passingTouchdowns: 0, interceptions: 1, longestPass: 16 },
              { teamName: '대구한의대학교', passingYards: 176, yardsPerAttempt: 2.7, completionPercentage: 36.9, attempts: 65, completions: 24, passingTouchdowns: 1, interceptions: 1, longestPass: 17 },
              { teamName: '한동대학교', passingYards: 171, yardsPerAttempt: 3.3, completionPercentage: 30.8, attempts: 52, completions: 16, passingTouchdowns: 1, interceptions: 6, longestPass: 30 },
            ],
            receiving: [
              { teamName: '경북대학교', receptions: 77, receivingYards: 901, yardsPerTarget: 6.2, targets: 146, receivingTouchdowns: 12, longestReception: 90 },
              { teamName: '경일대학교', receptions: 24, receivingYards: 310, yardsPerTarget: 5.1, targets: 61, receivingTouchdowns: 5, longestReception: 58 },
              { teamName: '대구한의대학교', receptions: 24, receivingYards: 161, yardsPerTarget: 2.5, targets: 65, receivingTouchdowns: 1, longestReception: 17 },
              { teamName: '한동대학교', receptions: 16, receivingYards: 198, yardsPerTarget: 3.8, targets: 52, receivingTouchdowns: 1, longestReception: 30 },
              { teamName: '대구가톨릭대학교', receptions: 9, receivingYards: 76, yardsPerTarget: 4.2, targets: 18, receivingTouchdowns: 0, longestReception: 16 },
            ]
          },
          defense: {
            tackles: [
              { teamName: '경일대학교', tackles: 332, sacks: 6, soloTackles: 99, assistTackles: 15 },
              { teamName: '경북대학교', tackles: 279, sacks: 5, soloTackles: 105, assistTackles: 12 },
              { teamName: '한동대학교', tackles: 155, sacks: 1, soloTackles: 38, assistTackles: 5 },
              { teamName: '대구한의대학교', tackles: 148, sacks: 2, soloTackles: 48, assistTackles: 10 },
              { teamName: '대구가톨릭대학교', tackles: 122, sacks: 0, soloTackles: 37, assistTackles: 5 },
            ],
            interceptions: [
              { teamName: '경북대학교', interceptions: 7, interceptionTd: 0, interceptionYards: 35, longestInterception: 16 },
              { teamName: '경일대학교', interceptions: 9, interceptionTd: 1, interceptionYards: 235, longestInterception: 60 },
              { teamName: '한동대학교', interceptions: 2, interceptionTd: 0, interceptionYards: 20, longestInterception: 20 },
              { teamName: '대구한의대학교', interceptions: 3, interceptionTd: 0, interceptionYards: 13, longestInterception: 13 },
              { teamName: '대구가톨릭대학교', interceptions: 1, interceptionTd: 0, interceptionYards: 6, longestInterception: 6 },
            ]
          },
          special: {
            kicking: [
              { teamName: '경일대학교', fieldGoalPercentage: 33.3, avgFieldGoalDistance: 30.0, fieldGoalsMade: 1, fieldGoalAttempts: 3, fieldGoalYards: 30, longestFieldGoal: 30 },
              { teamName: '경북대학교', fieldGoalPercentage: 0.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 0, fieldGoalAttempts: 2, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '대구한의대학교', fieldGoalPercentage: 0.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 0, fieldGoalAttempts: 2, fieldGoalYards: 0, longestFieldGoal: 0 },
            ],
            punting: [
              { teamName: '경일대학교', avgPuntYards: 37.6, puntCount: 27, puntYards: 1016, puntTouchdowns: 0, longestPunt: 56 },
              { teamName: '대구가톨릭대학교', avgPuntYards: 34.8, puntCount: 12, puntYards: 417, puntTouchdowns: 0, longestPunt: 60 },
              { teamName: '대구한의대학교', avgPuntYards: 33.3, puntCount: 12, puntYards: 400, puntTouchdowns: 0, longestPunt: 47 },
              { teamName: '한동대학교', avgPuntYards: 28.9, puntCount: 13, puntYards: 376, puntTouchdowns: 0, longestPunt: 50 },
              { teamName: '경북대학교', avgPuntYards: 26.7, puntCount: 19, puntYards: 508, puntTouchdowns: 0, longestPunt: 53 },
            ],
            kickoff: [
              { teamName: '경일대학교', avgKickYards: 54.1, kickoffCount: 20, kickoffYards: 1081, kickoffTouchdowns: 0, longestKickoff: 65 },
              { teamName: '대구가톨릭대학교', avgKickYards: 52.8, kickoffCount: 4, kickoffYards: 211, kickoffTouchdowns: 0, longestKickoff: 58 },
              { teamName: '경북대학교', avgKickYards: 46.4, kickoffCount: 20, kickoffYards: 928, kickoffTouchdowns: 1, longestKickoff: 65 },
              { teamName: '한동대학교', avgKickYards: 45.3, kickoffCount: 6, kickoffYards: 272, kickoffTouchdowns: 0, longestKickoff: 55 },
              { teamName: '대구한의대학교', avgKickYards: 34.8, kickoffCount: 6, kickoffYards: 209, kickoffTouchdowns: 0, longestKickoff: 69 },
            ],
            'kickoff return': [
              { teamName: '경북대학교', avgKickReturnYards: 22.5, kickReturnCount: 11, kickReturnYards: 248, kickReturnTouchdowns: 0, longestKickReturn: 30 },
              { teamName: '대구가톨릭대학교', avgKickReturnYards: 16.5, kickReturnCount: 4, kickReturnYards: 66, kickReturnTouchdowns: 0, longestKickReturn: 35 },
              { teamName: '한동대학교', avgKickReturnYards: 15.0, kickReturnCount: 8, kickReturnYards: 120, kickReturnTouchdowns: 0, longestKickReturn: 25 },
              { teamName: '경일대학교', avgKickReturnYards: 13.0, kickReturnCount: 22, kickReturnYards: 287, kickReturnTouchdowns: 0, longestKickReturn: 35 },
              { teamName: '대구한의대학교', avgKickReturnYards: 9.7, kickReturnCount: 7, kickReturnYards: 68, kickReturnTouchdowns: 0, longestKickReturn: 25 },
            ],
            'punt return': [
              { teamName: '경일대학교', avgPuntReturnYards: 20.9, puntReturnCount: 9, puntReturnYards: 188, puntReturnTouchdowns: 1, longestPuntReturn: 58 },
              { teamName: '경북대학교', avgPuntReturnYards: 9.8, puntReturnCount: 12, puntReturnYards: 118, puntReturnTouchdowns: 0, longestPuntReturn: 38 },
              { teamName: '대구가톨릭대학교', avgPuntReturnYards: 7.5, puntReturnCount: 2, puntReturnYards: 15, puntReturnTouchdowns: 0, longestPuntReturn: 13 },
              { teamName: '한동대학교', avgPuntReturnYards: 5.0, puntReturnCount: 4, puntReturnYards: 20, puntReturnTouchdowns: 0, longestPuntReturn: 8 },
              { teamName: '대구한의대학교', avgPuntReturnYards: 2.8, puntReturnCount: 5, puntReturnYards: 14, puntReturnTouchdowns: 0, longestPuntReturn: 7 },
            ]
          }
        }
      },
      second: {
        team: {
          offense: {
            rushing: [
              { teamName: '금오공과대학교', rushingYards: 355, yardsPerCarry: 3.8, rushingTouchdowns: 7, longestRush: 33, rushingTd: 7, receivingTd: 2, totalTd: 9 },
              { teamName: '대구대학교', rushingYards: 426, yardsPerCarry: 5.5, rushingTouchdowns: 6, longestRush: 67, rushingTd: 6, receivingTd: 1, totalTd: 7 },
              { teamName: '영남대학교', rushingYards: 159, yardsPerCarry: 3.2, rushingTouchdowns: 3, longestRush: 17, rushingTd: 3, receivingTd: 0, totalTd: 5 },
              { teamName: '계명대학교', rushingYards: 103, yardsPerCarry: 4.0, rushingTouchdowns: 0, longestRush: 18, rushingTd: 0, receivingTd: 0, totalTd: 0 },
            ],
            passing: [
              { teamName: '금오공과대학교', passingYards: 294, yardsPerAttempt: 5.5, completionPercentage: 45.3, attempts: 53, completions: 24, passingTouchdowns: 2, interceptions: 3, longestPass: 35 },
              { teamName: '계명대학교', passingYards: 36, yardsPerAttempt: 1.7, completionPercentage: 23.8, attempts: 21, completions: 5, passingTouchdowns: 1, interceptions: 3, longestPass: 11 },
              { teamName: '대구대학교', passingYards: 14, yardsPerAttempt: 0.9, completionPercentage: 40.0, attempts: 15, completions: 6, passingTouchdowns: 1, interceptions: 5, longestPass: 14 },
              { teamName: '영남대학교', passingYards: 13, yardsPerAttempt: 0.4, completionPercentage: 26.7, attempts: 30, completions: 8, passingTouchdowns: 0, interceptions: 2, longestPass: 8 },
            ],
            receiving: [
              { teamName: '금오공과대학교', receptions: 24, receivingYards: 299, yardsPerTarget: 5.6, targets: 53, receivingTouchdowns: 2, longestReception: 35 },
              { teamName: '대구대학교', receptions: 6, receivingYards: 47, yardsPerTarget: 3.1, targets: 15, receivingTouchdowns: 1, longestReception: 23 },
              { teamName: '영남대학교', receptions: 8, receivingYards: 102, yardsPerTarget: 3.4, targets: 30, receivingTouchdowns: 0, longestReception: 33 },
              { teamName: '계명대학교', receptions: 5, receivingYards: 36, yardsPerTarget: 1.7, targets: 21, receivingTouchdowns: 1, longestReception: 11 },
            ]
          },
          defense: {
            tackles: [
              { teamName: '금오공과대학교', tackles: 152, sacks: 1, soloTackles: 61, assistTackles: 9 },
              { teamName: '대구대학교', tackles: 147, sacks: 2, soloTackles: 46, assistTackles: 15 },
              { teamName: '영남대학교', tackles: 103, sacks: 0, soloTackles: 41, assistTackles: 11 },
              { teamName: '계명대학교', tackles: 72, sacks: 0, soloTackles: 21, assistTackles: 2 },
            ],
            interceptions: [
              { teamName: '금오공과대학교', interceptions: 5, interceptionTd: 0, interceptionYards: 19, longestInterception: 8 },
              { teamName: '대구대학교', interceptions: 3, interceptionTd: 0, interceptionYards: 5, longestInterception: 3 },
              { teamName: '영남대학교', interceptions: 5, interceptionTd: 1, interceptionYards: 65, longestInterception: 50 },
              { teamName: '계명대학교', interceptions: 1, interceptionTd: 0, interceptionYards: 5, longestInterception: 5 },
            ]
          },
          special: {
            kicking: [],
            punting: [
              { teamName: '대구대학교', avgPuntYards: 28.3, puntCount: 7, puntYards: 198, puntTouchdowns: 0, longestPunt: 42 },
              { teamName: '금오공과대학교', avgPuntYards: 26.4, puntCount: 9, puntYards: 238, puntTouchdowns: 0, longestPunt: 43 },
              { teamName: '영남대학교', avgPuntYards: 23.4, puntCount: 11, puntYards: 257, puntTouchdowns: 0, longestPunt: 45 },
              { teamName: '계명대학교', avgPuntYards: 21.4, puntCount: 5, puntYards: 107, puntTouchdowns: 0, longestPunt: 47 },
              { teamName: '동국대학교', avgPuntYards: 14.3, puntCount: 4, puntYards: 57, puntTouchdowns: 0, longestPunt: 25 },
            ],
            kickoff: [
              { teamName: '영남대학교', avgKickYards: 50.5, kickoffCount: 6, kickoffYards: 303, kickoffTouchdowns: 0, longestKickoff: 56 },
              { teamName: '동국대학교', avgKickYards: 50.0, kickoffCount: 1, kickoffYards: 50, kickoffTouchdowns: 0, longestKickoff: 50 },
              { teamName: '대구대학교', avgKickYards: 46.9, kickoffCount: 9, kickoffYards: 422, kickoffTouchdowns: 0, longestKickoff: 65 },
              { teamName: '금오공과대학교', avgKickYards: 43.8, kickoffCount: 12, kickoffYards: 525, kickoffTouchdowns: 0, longestKickoff: 57 },
              { teamName: '계명대학교', avgKickYards: 35.0, kickoffCount: 1, kickoffYards: 35, kickoffTouchdowns: 0, longestKickoff: 35 },
            ],
            'kickoff return': [
              { teamName: '계명대학교', avgKickReturnYards: 28.5, kickReturnCount: 4, kickReturnYards: 114, kickReturnTouchdowns: 0, longestKickReturn: 47 },
              { teamName: '금오공과대학교', avgKickReturnYards: 19.6, kickReturnCount: 8, kickReturnYards: 157, kickReturnTouchdowns: 0, longestKickReturn: 33 },
              { teamName: '영남대학교', avgKickReturnYards: 14.3, kickReturnCount: 4, kickReturnYards: 57, kickReturnTouchdowns: 0, longestKickReturn: 20 },
              { teamName: '대구대학교', avgKickReturnYards: 13.1, kickReturnCount: 7, kickReturnYards: 92, kickReturnTouchdowns: 0, longestKickReturn: 21 },
              { teamName: '동국대학교', avgKickReturnYards: 9.8, kickReturnCount: 5, kickReturnYards: 49, kickReturnTouchdowns: 0, longestKickReturn: 15 },
            ],
            'punt return': [
              { teamName: '동국대학교', avgPuntReturnYards: 17.3, puntReturnCount: 3, puntReturnYards: 52, puntReturnTouchdowns: 0, longestPuntReturn: 31 },
              { teamName: '금오공과대학교', avgPuntReturnYards: 14.0, puntReturnCount: 1, puntReturnYards: 14, puntReturnTouchdowns: 0, longestPuntReturn: 14 },
              { teamName: '영남대학교', avgPuntReturnYards: 5.3, puntReturnCount: 3, puntReturnYards: 16, puntReturnTouchdowns: 0, longestPuntReturn: 15 },
              { teamName: '대구대학교', avgPuntReturnYards: 1.7, puntReturnCount: 3, puntReturnYards: 5, puntReturnTouchdowns: 0, longestPuntReturn: 5 },
              { teamName: '계명대학교', avgPuntReturnYards: 0.0, puntReturnCount: 1, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
            ]
          }
        }
      }
    },
    부산경남: {
      first: {
        team: {
          offense: {
            rushing: [
              { teamName: '경성대학교', rushingYards: 798, yardsPerCarry: 5.4, rushingTouchdowns: 9, longestRush: 48, rushingTd: 9, receivingTd: 5, totalTd: 15 },
              { teamName: '동의대학교', rushingYards: 568, yardsPerCarry: 5.2, rushingTouchdowns: 6, longestRush: 41, rushingTd: 5, receivingTd: 3, totalTd: 8 },
              { teamName: '동아대학교', rushingYards: 293, yardsPerCarry: 3.8, rushingTouchdowns: 3, longestRush: 19, rushingTd: 3, receivingTd: 0, totalTd: 3 },
              { teamName: '울산대학교', rushingYards: 142, yardsPerCarry: 3.2, rushingTouchdowns: 1, longestRush: 34, rushingTd: 1, receivingTd: 3, totalTd: 4 },
            ],
            passing: [
              { teamName: '울산대학교', passingYards: 254, yardsPerAttempt: 5.1, completionPercentage: 62.0, attempts: 50, completions: 31, passingTouchdowns: 4, interceptions: 3, longestPass: 37 },
              { teamName: '경성대학교', passingYards: 245, yardsPerAttempt: 5.7, completionPercentage: 51.2, attempts: 43, completions: 22, passingTouchdowns: 5, interceptions: 2, longestPass: 41 },
              { teamName: '동의대학교', passingYards: 211, yardsPerAttempt: 4.0, completionPercentage: 30.2, attempts: 53, completions: 16, passingTouchdowns: 3, interceptions: 6, longestPass: 27 },
              { teamName: '동아대학교', passingYards: 28, yardsPerAttempt: 1.2, completionPercentage: 20.8, attempts: 24, completions: 5, passingTouchdowns: 0, interceptions: 2, longestPass: 14 },
            ],
            receiving: [
              { teamName: '경성대학교', receptions: 22, receivingYards: 227, yardsPerTarget: 5.3, targets: 43, receivingTouchdowns: 5, longestReception: 41 },
              { teamName: '동의대학교', receptions: 16, receivingYards: 211, yardsPerTarget: 4.0, targets: 53, receivingTouchdowns: 3, longestReception: 27 },
              { teamName: '울산대학교', receptions: 31, receivingYards: 287, yardsPerTarget: 5.7, targets: 50, receivingTouchdowns: 4, longestReception: 37 },
              { teamName: '동아대학교', receptions: 5, receivingYards: 45, yardsPerTarget: 1.9, targets: 24, receivingTouchdowns: 0, longestReception: 14 },
            ]
          },
          defense: {
            tackles: [
              { teamName: '동의대학교', tackles: 246, sacks: 2, soloTackles: 106, assistTackles: 27 },
              { teamName: '경성대학교', tackles: 231, sacks: 1, soloTackles: 96, assistTackles: 27 },
              { teamName: '동아대학교', tackles: 102, sacks: 0, soloTackles: 46, assistTackles: 14 },
              { teamName: '울산대학교', tackles: 97, sacks: 0, soloTackles: 29, assistTackles: 3 },
            ],
            interceptions: [
              { teamName: '경성대학교', interceptions: 9, interceptionTd: 1, interceptionYards: 174, longestInterception: 71 },
              { teamName: '동의대학교', interceptions: 1, interceptionTd: 0, interceptionYards: 35, longestInterception: 35 },
              { teamName: '동아대학교', interceptions: 1, interceptionTd: 0, interceptionYards: 0, longestInterception: 0 },
              { teamName: '울산대학교', interceptions: 2, interceptionTd: 0, interceptionYards: 38, longestInterception: 25 },
            ]
          },
          special: {
            kicking: [
              { teamName: '울산대학교', fieldGoalPercentage: 100.0, avgFieldGoalDistance: 25.0, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 25, longestFieldGoal: 25 },
              { teamName: '동아대학교', fieldGoalPercentage: 0.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 0, fieldGoalAttempts: 1, fieldGoalYards: 0, longestFieldGoal: 0 },
            ],
            punting: [
              { teamName: '울산대학교', avgPuntYards: 42.5, puntCount: 2, puntYards: 85, puntTouchdowns: 0, longestPunt: 55 },
              { teamName: '경성대학교', avgPuntYards: 37.0, puntCount: 10, puntYards: 370, puntTouchdowns: 0, longestPunt: 55 },
              { teamName: '동아대학교', avgPuntYards: 34.4, puntCount: 5, puntYards: 172, puntTouchdowns: 0, longestPunt: 45 },
              { teamName: '동의대학교', avgPuntYards: 27.4, puntCount: 14, puntYards: 383, puntTouchdowns: 0, longestPunt: 48 },
            ],
            kickoff: [
              { teamName: '경성대학교', avgKickYards: 45.1, kickoffCount: 17, kickoffYards: 767, kickoffTouchdowns: 0, longestKickoff: 61 },
              { teamName: '동의대학교', avgKickYards: 45.0, kickoffCount: 10, kickoffYards: 450, kickoffTouchdowns: 0, longestKickoff: 58 },
              { teamName: '울산대학교', avgKickYards: 37.8, kickoffCount: 6, kickoffYards: 227, kickoffTouchdowns: 0, longestKickoff: 50 },
              { teamName: '동아대학교', avgKickYards: 21.4, kickoffCount: 8, kickoffYards: 171, kickoffTouchdowns: 0, longestKickoff: 51 },
            ],
            'kickoff return': [
              { teamName: '동의대학교', avgKickReturnYards: 18.4, kickReturnCount: 14, kickReturnYards: 258, kickReturnTouchdowns: 0, longestKickReturn: 50 },
              { teamName: '경성대학교', avgKickReturnYards: 13.5, kickReturnCount: 8, kickReturnYards: 108, kickReturnTouchdowns: 0, longestKickReturn: 30 },
              { teamName: '울산대학교', avgKickReturnYards: 12.5, kickReturnCount: 6, kickReturnYards: 75, kickReturnTouchdowns: 0, longestKickReturn: 26 },
              { teamName: '동아대학교', avgKickReturnYards: 10.0, kickReturnCount: 3, kickReturnYards: 30, kickReturnTouchdowns: 0, longestKickReturn: 27 },
            ],
            'punt return': [
              { teamName: '동아대학교', avgPuntReturnYards: 19.7, puntReturnCount: 3, puntReturnYards: 59, puntReturnTouchdowns: 0, longestPuntReturn: 54 },
              { teamName: '동의대학교', avgPuntReturnYards: 18.0, puntReturnCount: 1, puntReturnYards: 18, puntReturnTouchdowns: 0, longestPuntReturn: 18 },
              { teamName: '경성대학교', avgPuntReturnYards: 4.0, puntReturnCount: 2, puntReturnYards: 8, puntReturnTouchdowns: 0, longestPuntReturn: 8 },
            ]
          }
        }
      },
      second: {
        team: {
          offense: {
            rushing: [
              { teamName: '부산외국어대학교', rushingYards: 772, yardsPerCarry: 6.2, rushingTouchdowns: 6, longestRush: 34, rushingTd: 6, receivingTd: 11, totalTd: 18 },
              { teamName: '한국해양대학교', rushingYards: 480, yardsPerCarry: 5.9, rushingTouchdowns: 8, longestRush: 26, rushingTd: 8, receivingTd: 2, totalTd: 11 },
              { teamName: '동서대학교', rushingYards: 221, yardsPerCarry: 4.1, rushingTouchdowns: 2, longestRush: 40, rushingTd: 1, receivingTd: 3, totalTd: 4 },
              { teamName: '신라대학교', rushingYards: 90, yardsPerCarry: 3.1, rushingTouchdowns: 2, longestRush: 40, rushingTd: 2, receivingTd: 4, totalTd: 6 },
              { teamName: '부산대학교', rushingYards: 51, yardsPerCarry: 2.0, rushingTouchdowns: 0, longestRush: 16, rushingTd: 0, receivingTd: 1, totalTd: 2 },
            ],
            passing: [
              { teamName: '부산외국어대학교', passingYards: 307, yardsPerAttempt: 2.6, completionPercentage: 43.3, attempts: 120, completions: 52, passingTouchdowns: 11, interceptions: 2, longestPass: 53 },
              { teamName: '신라대학교', passingYards: 222, yardsPerAttempt: 6.2, completionPercentage: 55.6, attempts: 36, completions: 20, passingTouchdowns: 4, interceptions: 0, longestPass: 79 },
              { teamName: '동서대학교', passingYards: 121, yardsPerAttempt: 2.9, completionPercentage: 28.6, attempts: 42, completions: 12, passingTouchdowns: 3, interceptions: 4, longestPass: 43 },
              { teamName: '한국해양대학교', passingYards: 31, yardsPerAttempt: 2.8, completionPercentage: 18.2, attempts: 11, completions: 2, passingTouchdowns: 2, interceptions: 1, longestPass: 31 },
              { teamName: '부산대학교', passingYards: 0, yardsPerAttempt: 0.0, completionPercentage: 23.1, attempts: 13, completions: 3, passingTouchdowns: 1, interceptions: 0, longestPass: 0 },
            ],
            receiving: [
              { teamName: '부산외국어대학교', receptions: 52, receivingYards: 582, yardsPerTarget: 4.9, targets: 120, receivingTouchdowns: 11, longestReception: 53 },
              { teamName: '신라대학교', receptions: 20, receivingYards: 274, yardsPerTarget: 7.6, targets: 36, receivingTouchdowns: 4, longestReception: 79 },
              { teamName: '동서대학교', receptions: 12, receivingYards: 245, yardsPerTarget: 5.8, targets: 42, receivingTouchdowns: 3, longestReception: 43 },
              { teamName: '부산대학교', receptions: 3, receivingYards: 42, yardsPerTarget: 3.2, targets: 13, receivingTouchdowns: 1, longestReception: 31 },
              { teamName: '한국해양대학교', receptions: 2, receivingYards: 71, yardsPerTarget: 6.5, targets: 11, receivingTouchdowns: 2, longestReception: 40 },
            ]
          },
          defense: {
            tackles: [
              { teamName: '부산외국어대학교', tackles: 258, sacks: 6, soloTackles: 97, assistTackles: 16 },
              { teamName: '신라대학교', tackles: 133, sacks: 0, soloTackles: 30, assistTackles: 10 },
              { teamName: '동서대학교', tackles: 118, sacks: 2, soloTackles: 42, assistTackles: 9 },
              { teamName: '한국해양대학교', tackles: 111, sacks: 0, soloTackles: 30, assistTackles: 2 },
              { teamName: '부산대학교', tackles: 66, sacks: 0, soloTackles: 31, assistTackles: 5 },
            ],
            interceptions: [
              { teamName: '부산외국어대학교', interceptions: 2, interceptionTd: 0, interceptionYards: 15, longestInterception: 10 },
              { teamName: '신라대학교', interceptions: 3, interceptionTd: 0, interceptionYards: 35, longestInterception: 20 },
              { teamName: '한국해양대학교', interceptions: 2, interceptionTd: 0, interceptionYards: 3, longestInterception: 3 },
              { teamName: '동서대학교', interceptions: 1, interceptionTd: 0, interceptionYards: 0, longestInterception: 0 },
            ]
          },
          special: {
            kicking: [
              { teamName: '부산외국어대학교', fieldGoalPercentage: 75.0, avgFieldGoalDistance: 15.0, fieldGoalsMade: 3, fieldGoalAttempts: 4, fieldGoalYards: 45, longestFieldGoal: 25 },
            ],
            punting: [
              { teamName: '부산대학교', avgPuntYards: 38.0, puntCount: 6, puntYards: 228, puntTouchdowns: 0, longestPunt: 57 },
              { teamName: '한국해양대학교', avgPuntYards: 32.0, puntCount: 4, puntYards: 128, puntTouchdowns: 0, longestPunt: 45 },
              { teamName: '동서대학교', avgPuntYards: 29.2, puntCount: 5, puntYards: 146, puntTouchdowns: 0, longestPunt: 35 },
              { teamName: '부산외국어대학교', avgPuntYards: 27.4, puntCount: 11, puntYards: 301, puntTouchdowns: 0, longestPunt: 54 },
              { teamName: '신라대학교', avgPuntYards: 5.9, puntCount: 9, puntYards: 53, puntTouchdowns: 0, longestPunt: 53 },
            ],
            kickoff: [
              { teamName: '부산대학교', avgKickYards: 50.0, kickoffCount: 1, kickoffYards: 50, kickoffTouchdowns: 0, longestKickoff: 50 },
              { teamName: '한국해양대학교', avgKickYards: 47.4, kickoffCount: 12, kickoffYards: 569, kickoffTouchdowns: 0, longestKickoff: 54 },
              { teamName: '신라대학교', avgKickYards: 43.6, kickoffCount: 8, kickoffYards: 349, kickoffTouchdowns: 0, longestKickoff: 65 },
              { teamName: '동서대학교', avgKickYards: 39.3, kickoffCount: 6, kickoffYards: 236, kickoffTouchdowns: 0, longestKickoff: 62 },
              { teamName: '부산외국어대학교', avgKickYards: 28.9, kickoffCount: 25, kickoffYards: 722, kickoffTouchdowns: 1, longestKickoff: 60 },
            ],
            'kickoff return': [
              { teamName: '부산대학교', avgKickReturnYards: 26.8, kickReturnCount: 4, kickReturnYards: 107, kickReturnTouchdowns: 1, longestKickReturn: 63 },
              { teamName: '한국해양대학교', avgKickReturnYards: 17.0, kickReturnCount: 9, kickReturnYards: 153, kickReturnTouchdowns: 0, longestKickReturn: 25 },
              { teamName: '신라대학교', avgKickReturnYards: 15.4, kickReturnCount: 5, kickReturnYards: 77, kickReturnTouchdowns: 0, longestKickReturn: 28 },
              { teamName: '부산외국어대학교', avgKickReturnYards: 15.4, kickReturnCount: 11, kickReturnYards: 169, kickReturnTouchdowns: 0, longestKickReturn: 22 },
              { teamName: '동서대학교', avgKickReturnYards: 14.7, kickReturnCount: 14, kickReturnYards: 206, kickReturnTouchdowns: 0, longestKickReturn: 25 },
            ],
            'punt return': [
              { teamName: '한국해양대학교', avgPuntReturnYards: 20.0, puntReturnCount: 1, puntReturnYards: 20, puntReturnTouchdowns: 1, longestPuntReturn: 20 },
              { teamName: '부산외국어대학교', avgPuntReturnYards: 5.3, puntReturnCount: 3, puntReturnYards: 16, puntReturnTouchdowns: 0, longestPuntReturn: 12 },
              { teamName: '부산대학교', avgPuntReturnYards: 0.0, puntReturnCount: 1, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
            ]
          }
        }
      }
    },
    사회인: {
      team: {
        offense: {
          rushing: [
            { teamName: '부산 그리폰즈', rushingYards: 998, yardsPerCarry: 5.2, rushingTouchdowns: 10, longestRush: 64, rushingTd: 10, receivingTd: 1, totalTd: 11 },
            { teamName: '삼성 블루스톰', rushingYards: 913, yardsPerCarry: 5.1, rushingTouchdowns: 8, longestRush: 47, rushingTd: 8, receivingTd: 6, totalTd: 14 },
            { teamName: '서울 골든이글스', rushingYards: 663, yardsPerCarry: 4.2, rushingTouchdowns: 8, longestRush: 42, rushingTd: 8, receivingTd: 6, totalTd: 14 },
            { teamName: '인천 라이노스', rushingYards: 760, yardsPerCarry: 5.4, rushingTouchdowns: 7, longestRush: 89, rushingTd: 7, receivingTd: 4, totalTd: 11 },
            { teamName: '군위 피닉스', rushingYards: 671, yardsPerCarry: 4.3, rushingTouchdowns: 7, longestRush: 31, rushingTd: 7, receivingTd: 9, totalTd: 16 },
            { teamName: '서울 디펜더스', rushingYards: 574, yardsPerCarry: 4.0, rushingTouchdowns: 3, longestRush: 39, rushingTd: 3, receivingTd: 4, totalTd: 7 },
            { teamName: '서울 바이킹스', rushingYards: 217, yardsPerCarry: 1.7, rushingTouchdowns: 1, longestRush: 16, rushingTd: 1, receivingTd: 10, totalTd: 11 },
          ],
          passing: [
            { teamName: '군위 피닉스', passingYards: 963, yardsPerAttempt: 6.0, completionPercentage: 46.6, attempts: 161, completions: 75, passingTouchdowns: 9, interceptions: 5, longestPass: 64 },
            { teamName: '서울 바이킹스', passingYards: 821, yardsPerAttempt: 6.5, completionPercentage: 54.3, attempts: 127, completions: 69, passingTouchdowns: 10, interceptions: 3, longestPass: 72 },
            { teamName: '삼성 블루스톰', passingYards: 773, yardsPerAttempt: 5.9, completionPercentage: 47.7, attempts: 130, completions: 62, passingTouchdowns: 6, interceptions: 12, longestPass: 75 },
            { teamName: '서울 디펜더스', passingYards: 679, yardsPerAttempt: 6.7, completionPercentage: 53.9, attempts: 102, completions: 55, passingTouchdowns: 4, interceptions: 8, longestPass: 58 },
            { teamName: '서울 골든이글스', passingYards: 628, yardsPerAttempt: 4.7, completionPercentage: 45.5, attempts: 134, completions: 61, passingTouchdowns: 6, interceptions: 11, longestPass: 40 },
            { teamName: '인천 라이노스', passingYards: 712, yardsPerAttempt: 5.2, completionPercentage: 57.2, attempts: 138, completions: 79, passingTouchdowns: 4, interceptions: 9, longestPass: 65 },
            { teamName: '부산 그리폰즈', passingYards: 361, yardsPerAttempt: 4.0, completionPercentage: 45.6, attempts: 90, completions: 41, passingTouchdowns: 1, interceptions: 5, longestPass: 72 },
          ],
          receiving: [
            { teamName: '인천 라이노스', receptions: 79, receivingYards: 712, yardsPerTarget: 5.2, targets: 138, receivingTouchdowns: 4, longestReception: 65 },
            { teamName: '군위 피닉스', receptions: 75, receivingYards: 893, yardsPerTarget: 5.5, targets: 161, receivingTouchdowns: 9, longestReception: 64 },
            { teamName: '서울 바이킹스', receptions: 69, receivingYards: 804, yardsPerTarget: 6.3, targets: 127, receivingTouchdowns: 10, longestReception: 72 },
            { teamName: '삼성 블루스톰', receptions: 62, receivingYards: 880, yardsPerTarget: 6.8, targets: 130, receivingTouchdowns: 6, longestReception: 77 },
            { teamName: '서울 골든이글스', receptions: 61, receivingYards: 628, yardsPerTarget: 4.7, targets: 134, receivingTouchdowns: 6, longestReception: 40 },
            { teamName: '서울 디펜더스', receptions: 55, receivingYards: 679, yardsPerTarget: 6.7, targets: 102, receivingTouchdowns: 4, longestReception: 58 },
            { teamName: '부산 그리폰즈', receptions: 41, receivingYards: 361, yardsPerTarget: 4.0, targets: 90, receivingTouchdowns: 1, longestReception: 72 },
          ]
        },
        defense: {
          tackles: [
            { teamName: '서울 바이킹스', tackles: 384, sacks: 7, soloTackles: 116, assistTackles: 26 },
            { teamName: '서울 디펜더스', tackles: 379, sacks: 4, soloTackles: 92, assistTackles: 24 },
            { teamName: '서울 골든이글스', tackles: 371, sacks: 6, soloTackles: 113, assistTackles: 30 },
            { teamName: '인천 라이노스', tackles: 368, sacks: 4, soloTackles: 111, assistTackles: 27 },
            { teamName: '부산 그리폰즈', tackles: 363, sacks: 5, soloTackles: 102, assistTackles: 21 },
            { teamName: '군위 피닉스', tackles: 344, sacks: 8, soloTackles: 112, assistTackles: 17 },
            { teamName: '삼성 블루스톰', tackles: 339, sacks: 5, soloTackles: 100, assistTackles: 25 },
          ],
          interceptions: [
            { teamName: '서울 디펜더스', interceptions: 9, interceptionTd: 0, interceptionYards: 85, longestInterception: 22 },
            { teamName: '서울 바이킹스', interceptions: 8, interceptionTd: 1, interceptionYards: 26, longestInterception: 22 },
            { teamName: '삼성 블루스톰', interceptions: 8, interceptionTd: 0, interceptionYards: 30, longestInterception: 14 },
            { teamName: '군위 피닉스', interceptions: 6, interceptionTd: 0, interceptionYards: 18, longestInterception: 12 },
            { teamName: '인천 라이노스', interceptions: 6, interceptionTd: 0, interceptionYards: 83, longestInterception: 45 },
            { teamName: '서울 골든이글스', interceptions: 5, interceptionTd: 0, interceptionYards: 38, longestInterception: 29 },
            { teamName: '부산 그리폰즈', interceptions: 3, interceptionTd: 2, interceptionYards: 110, longestInterception: 60 },
          ]
        },
        special: {
          kicking: [
            { teamName: '서울 바이킹스', fieldGoalPercentage: 100.0, avgFieldGoalDistance: 30.0, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 30, longestFieldGoal: 30 },
            { teamName: '삼성 블루스톰', fieldGoalPercentage: 80.0, avgFieldGoalDistance: 34.5, fieldGoalsMade: 4, fieldGoalAttempts: 5, fieldGoalYards: 138, longestFieldGoal: 40 },
            { teamName: '부산 그리폰즈', fieldGoalPercentage: 50.0, avgFieldGoalDistance: 16.5, fieldGoalsMade: 2, fieldGoalAttempts: 4, fieldGoalYards: 33, longestFieldGoal: 33 },
            { teamName: '군위 피닉스', fieldGoalPercentage: 40.0, avgFieldGoalDistance: 25.0, fieldGoalsMade: 2, fieldGoalAttempts: 5, fieldGoalYards: 50, longestFieldGoal: 26 },
            { teamName: '서울 디펜더스', fieldGoalPercentage: 25.0, avgFieldGoalDistance: 27.0, fieldGoalsMade: 1, fieldGoalAttempts: 4, fieldGoalYards: 27, longestFieldGoal: 27 },
            { teamName: '서울 골든이글스', fieldGoalPercentage: 0.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 0, fieldGoalAttempts: 2, fieldGoalYards: 0, longestFieldGoal: 0 },
            { teamName: '인천 라이노스', fieldGoalPercentage: 0.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 0, fieldGoalAttempts: 1, fieldGoalYards: 0, longestFieldGoal: 0 },
          ],
          punting: [
            { teamName: '부산 그리폰즈', avgPuntYards: 43.5, puntCount: 22, puntYards: 957, puntTouchdowns: 0, longestPunt: 63 },
            { teamName: '서울 바이킹스', avgPuntYards: 40.1, puntCount: 30, puntYards: 1204, puntTouchdowns: 0, longestPunt: 55 },
            { teamName: '서울 골든이글스', avgPuntYards: 37.1, puntCount: 25, puntYards: 927, puntTouchdowns: 0, longestPunt: 55 },
            { teamName: '서울 디펜더스', avgPuntYards: 36.1, puntCount: 23, puntYards: 831, puntTouchdowns: 0, longestPunt: 60 },
            { teamName: '삼성 블루스톰', avgPuntYards: 34.1, puntCount: 16, puntYards: 545, puntTouchdowns: 0, longestPunt: 48 },
            { teamName: '군위 피닉스', avgPuntYards: 33.0, puntCount: 19, puntYards: 627, puntTouchdowns: 0, longestPunt: 53 },
            { teamName: '인천 라이노스', avgPuntYards: 31.8, puntCount: 25, puntYards: 796, puntTouchdowns: 0, longestPunt: 55 },
          ],
          kickoff: [
            { teamName: '삼성 블루스톰', avgKickYards: 52.8, kickoffCount: 25, kickoffYards: 1321, kickoffTouchdowns: 0, longestKickoff: 70 },
            { teamName: '군위 피닉스', avgKickYards: 50.4, kickoffCount: 26, kickoffYards: 1310, kickoffTouchdowns: 0, longestKickoff: 63 },
            { teamName: '부산 그리폰즈', avgKickYards: 49.8, kickoffCount: 23, kickoffYards: 1145, kickoffTouchdowns: 0, longestKickoff: 60 },
            { teamName: '서울 디펜더스', avgKickYards: 49.1, kickoffCount: 15, kickoffYards: 737, kickoffTouchdowns: 0, longestKickoff: 59 },
            { teamName: '서울 바이킹스', avgKickYards: 46.2, kickoffCount: 22, kickoffYards: 1016, kickoffTouchdowns: 0, longestKickoff: 60 },
            { teamName: '인천 라이노스', avgKickYards: 44.8, kickoffCount: 17, kickoffYards: 762, kickoffTouchdowns: 0, longestKickoff: 58 },
            { teamName: '서울 골든이글스', avgKickYards: 33.8, kickoffCount: 22, kickoffYards: 743, kickoffTouchdowns: 0, longestKickoff: 57 },
          ],
          'kickoff return': [
            { teamName: '서울 바이킹스', avgKickReturnYards: 25.4, kickReturnCount: 24, kickReturnYards: 609, kickReturnTouchdowns: 0, longestKickReturn: 90 },
            { teamName: '서울 골든이글스', avgKickReturnYards: 21.0, kickReturnCount: 22, kickReturnYards: 462, kickReturnTouchdowns: 0, longestKickReturn: 45 },
            { teamName: '부산 그리폰즈', avgKickReturnYards: 21.0, kickReturnCount: 17, kickReturnYards: 357, kickReturnTouchdowns: 1, longestKickReturn: 77 },
            { teamName: '인천 라이노스', avgKickReturnYards: 20.1, kickReturnCount: 22, kickReturnYards: 443, kickReturnTouchdowns: 0, longestKickReturn: 55 },
            { teamName: '삼성 블루스톰', avgKickReturnYards: 19.8, kickReturnCount: 12, kickReturnYards: 237, kickReturnTouchdowns: 0, longestKickReturn: 35 },
            { teamName: '서울 디펜더스', avgKickReturnYards: 17.6, kickReturnCount: 17, kickReturnYards: 299, kickReturnTouchdowns: 1, longestKickReturn: 80 },
            { teamName: '군위 피닉스', avgKickReturnYards: 16.5, kickReturnCount: 13, kickReturnYards: 214, kickReturnTouchdowns: 0, longestKickReturn: 36 },
          ],
          'punt return': [
            { teamName: '인천 라이노스', avgPuntReturnYards: 10.0, puntReturnCount: 11, puntReturnYards: 110, puntReturnTouchdowns: 0, longestPuntReturn: 25 },
            { teamName: '군위 피닉스', avgPuntReturnYards: 9.7, puntReturnCount: 12, puntReturnYards: 116, puntReturnTouchdowns: 1, longestPuntReturn: 33 },
            { teamName: '삼성 블루스톰', avgPuntReturnYards: 6.5, puntReturnCount: 8, puntReturnYards: 52, puntReturnTouchdowns: 0, longestPuntReturn: 25 },
            { teamName: '서울 골든이글스', avgPuntReturnYards: 4.4, puntReturnCount: 8, puntReturnYards: 35, puntReturnTouchdowns: 0, longestPuntReturn: 13 },
            { teamName: '부산 그리폰즈', avgPuntReturnYards: 1.7, puntReturnCount: 3, puntReturnYards: 5, puntReturnTouchdowns: 0, longestPuntReturn: 5 },
            { teamName: '서울 바이킹스', avgPuntReturnYards: 0.0, puntReturnCount: 2, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
            { teamName: '서울 디펜더스', avgPuntReturnYards: 0.0, puntReturnCount: 1, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
          ]
        }
      }
    }
  };

  const sortedTeams = useMemo(() => {
    // 리그별 데이터 선택
    let leagueData;
    if (league === '사회인') {
      leagueData = kafaData.사회인;
    } else {
      const universityData = kafaData[league];
      if (!universityData) return [];
      
      if (division === '1부') {
        leagueData = universityData.first;
      } else if (division === '2부') {
        leagueData = universityData.second;
      } else {
        leagueData = universityData.first;
      }
    }
    
    if (!leagueData) return [];
    
    const teamData = leagueData.team;
    if (!teamData) return [];
    
    // 카테고리와 유형에 맞는 데이터 추출
    let data = [];
    
    if (playCategory === '오펜스' && teamData.offense) {
      if (playType === '런') data = teamData.offense.rushing || [];
      else if (playType === '패스') data = teamData.offense.passing || [];
      else if (playType === '리시빙') data = teamData.offense.receiving || [];
      else if (playType === '득점') data = teamData.offense.rushing || []; // 득점은 러싱 데이터를 기반으로
    } else if (playCategory === '디펜스' && teamData.defense) {
      if (playType === '태클') data = teamData.defense.tackles || [];
      else if (playType === '인터셉트') data = teamData.defense.interceptions || [];
    } else if (playCategory === '스페셜팀' && teamData.special) {
      if (playType === '필드골') data = teamData.special.kicking || [];
      else if (playType === '펀트') data = teamData.special.punting || [];
      else if (playType === '킥오프') data = teamData.special.kickoff || [];
      else if (playType === '킥오프 리턴') data = teamData.special['kickoff return'] || [];
      else if (playType === '펀트 리턴') data = teamData.special['punt return'] || [];
    }
    
    if (!data || !Array.isArray(data)) return [];
    
    const rows = [...data];
    
    // 정렬
    if (currentSort) {
      const { key, direction } = currentSort;
      const cmp = (a, b) => {
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
      };
      rows.sort(cmp);
    }
    
    // 순위 추가
    return rows.map((r, i) => ({ ...r, __rank: i + 1 }));
  }, [kafaData, league, division, playCategory, playType, currentSort]);

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
          {/* 팀 카테고리 선택 */}
          <Dropdown
            label="TeamCategory"
            placeholder="카테고리"
            value={playCategory}
            options={TEAM_CATEGORY_OPTIONS}
            onChange={(newCategory) => {
              setPlayCategory(newCategory);
              // 카테고리 변경시 해당 카테고리의 첫번째 타입으로 초기화
              const firstType = TEAM_CATEGORIES[newCategory]?.[0] || '';
              setPlayType(firstType);
            }}
          />
          {/* 플레이 타입은 선택된 카테고리에 따라 옵션 변경 */}
          <Dropdown
            label="PlayType"
            placeholder="유형"
            value={playType}
            options={TEAM_CATEGORIES[playCategory] || []}
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
                  const isPrimary = PRIMARY_TEAM_METRIC[playCategory]?.[playType] === col.key;
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
            {sortedTeams.map((row) => {
              const teamInfo = teams.find((t) => t.name === row.teamName);
              const isSecondDiv = (isGuestFixed ? fixedDivision : division) === '2부';
              return (
                <div
                  key={row.teamName || row.__rank}
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
                            alt={`${row.teamName} 로고`}
                            className={`team-logo-img ${
                              teamInfo.logo.endsWith('.svg')
                                ? 'svg-logo'
                                : 'png-logo'
                            }`}
                          />
                        </div>
                      )}
                      <span>{row.teamName}</span>
                    </div>
                  </div>
                  <div
                    className="team-table-row2"
                      style={{ '--cols': String(currentColumns.length || 0) }}
                  >
                    {currentColumns.map((col) => {
                      const v = row[col.key];
                      if (typeof v === 'number') {
                        const isPct = String(col.key).includes('percentage') || String(col.key).includes('Percentage');
                        const shown =
                          v % 1 !== 0 || isPct
                            ? isPct
                              ? `${v.toFixed(1)}%`
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
}