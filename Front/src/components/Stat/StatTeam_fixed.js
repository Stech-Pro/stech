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
  '스페셜팀': ['필드골', '킥오프', '킥오프 리턴', '펀트', '펀트리턴'],
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
      { key: 'yardsPerAttempt', label: '패스 시도 당 패싱 야드' },
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
    '펀트리턴': [
      { key: 'avgPuntReturnYards', label: '평균 펀트 리턴 야드' },
      { key: 'puntReturnCount', label: '펀트 리턴 수' },
      { key: 'puntReturnYards', label: '펀트 리턴 야드' },
      { key: 'puntReturnTouchdowns', label: '펀트 리턴 터치다운' },
      { key: 'longestPuntReturn', label: '가장 긴 펀트리턴' },
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
    '펀트리턴': 'avgPuntReturnYards',
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
              { teamName: '한양대학교', rushingYards: 879, yardsPerCarry: 4.4, rushingTouchdowns: 7, longestRush: 54, rushingTd: 7, receivingTd: 7, totalTd: 14 },
              { teamName: '연세대학교', rushingYards: 800, yardsPerCarry: 4.7, rushingTouchdowns: 11, longestRush: 68, rushingTd: 11, receivingTd: 20, totalTd: 31 },
              { teamName: '서울대학교', rushingYards: 394, yardsPerCarry: 5.0, rushingTouchdowns: 2, longestRush: 39, rushingTd: 2, receivingTd: 1, totalTd: 3 },
              { teamName: '건국대학교', rushingYards: 289, yardsPerCarry: 4.8, rushingTouchdowns: 1, longestRush: 32, rushingTd: 1, receivingTd: 0, totalTd: 1 },
              { teamName: '홍익대학교', rushingYards: 563, yardsPerCarry: 5.1, rushingTouchdowns: 3, longestRush: 54, rushingTd: 3, receivingTd: 3, totalTd: 6 },
              { teamName: '국민대학교', rushingYards: 152, yardsPerCarry: 2.9, rushingTouchdowns: 2, longestRush: 27, rushingTd: 2, receivingTd: 2, totalTd: 4 },
              { teamName: '서울시립대학교', rushingYards: 177, yardsPerCarry: 2.6, rushingTouchdowns: 2, longestRush: 65, rushingTd: 2, receivingTd: 1, totalTd: 3 },
              { teamName: '한국외국어대학교', rushingYards: 106, yardsPerCarry: 3.4, rushingTouchdowns: 0, longestRush: 36, rushingTd: 0, receivingTd: 0, totalTd: 0 },
            ],
            passing: [
              { teamName: '연세대학교', passingYards: 968, yardsPerAttempt: 6.3, completionPercentage: 48.1, attempts: 154, completions: 74, passingTouchdowns: 20, interceptions: 8, longestPass: 80 },
              { teamName: '한양대학교', passingYards: 481, yardsPerAttempt: 4.6, completionPercentage: 42.9, attempts: 105, completions: 45, passingTouchdowns: 7, interceptions: 9, longestPass: 57 },
              { teamName: '서울대학교', passingYards: 227, yardsPerAttempt: 3.6, completionPercentage: 41.3, attempts: 63, completions: 26, passingTouchdowns: 1, interceptions: 8, longestPass: 33 },
              { teamName: '건국대학교', passingYards: 85, yardsPerAttempt: 2.3, completionPercentage: 48.6, attempts: 37, completions: 18, passingTouchdowns: 0, interceptions: 3, longestPass: 24 },
              { teamName: '홍익대학교', passingYards: 245, yardsPerAttempt: 4.2, completionPercentage: 45.0, attempts: 58, completions: 26, passingTouchdowns: 3, interceptions: 5, longestPass: 42 },
              { teamName: '국민대학교', passingYards: 158, yardsPerAttempt: 1.9, completionPercentage: 27.7, attempts: 83, completions: 23, passingTouchdowns: 2, interceptions: 8, longestPass: 22 },
              { teamName: '서울시립대학교', passingYards: 230, yardsPerAttempt: 2.5, completionPercentage: 28.6, attempts: 91, completions: 26, passingTouchdowns: 1, interceptions: 7, longestPass: 38 },
              { teamName: '한국외국어대학교', passingYards: 117, yardsPerAttempt: 4.9, completionPercentage: 41.7, attempts: 24, completions: 10, passingTouchdowns: 0, interceptions: 0, longestPass: 32 },
            ],
            receiving: [
              { teamName: '연세대학교', receptions: 74, receivingYards: 968, yardsPerTarget: 6.3, targets: 154, receivingTouchdowns: 20, longestReception: 80 },
              { teamName: '한양대학교', receptions: 45, receivingYards: 481, yardsPerTarget: 4.6, targets: 105, receivingTouchdowns: 7, longestReception: 57 },
              { teamName: '서울대학교', receptions: 26, receivingYards: 227, yardsPerTarget: 3.6, targets: 63, receivingTouchdowns: 1, longestReception: 33 },
              { teamName: '건국대학교', receptions: 18, receivingYards: 85, yardsPerTarget: 2.3, targets: 37, receivingTouchdowns: 0, longestReception: 24 },
              { teamName: '홍익대학교', receptions: 26, receivingYards: 245, yardsPerTarget: 4.2, targets: 58, receivingTouchdowns: 3, longestReception: 42 },
              { teamName: '국민대학교', receptions: 23, receivingYards: 210, yardsPerTarget: 2.5, targets: 83, receivingTouchdowns: 2, longestReception: 53 },
              { teamName: '서울시립대학교', receptions: 26, receivingYards: 242, yardsPerTarget: 2.7, targets: 91, receivingTouchdowns: 1, longestReception: 38 },
              { teamName: '한국외국어대학교', receptions: 10, receivingYards: 113, yardsPerTarget: 4.7, targets: 24, receivingTouchdowns: 0, longestReception: 32 },
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
              { teamName: '한양대학교', interceptions: 6, interceptionTd: 0, interceptionYards: 87, longestInterception: 45 },
              { teamName: '서울대학교', interceptions: 9, interceptionTd: 0, interceptionYards: 81, longestInterception: 25 },
              { teamName: '건국대학교', interceptions: 1, interceptionTd: 0, interceptionYards: 0, longestInterception: 0 },
              { teamName: '홍익대학교', interceptions: 5, interceptionTd: 0, interceptionYards: 15, longestInterception: 10 },
              { teamName: '국민대학교', interceptions: 4, interceptionTd: 0, interceptionYards: 0, longestInterception: 0 },
              { teamName: '서울시립대학교', interceptions: 10, interceptionTd: 0, interceptionYards: 0, longestInterception: 0 },
              { teamName: '한국외국어대학교', interceptions: 0, interceptionTd: 0, interceptionYards: 0, longestInterception: 0 },
            ]
          },
          special: {
            kicking: [
              { teamName: '건국대학교', fieldGoalPercentage: 100, avgFieldGoalDistance: 53, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 53, longestFieldGoal: 53 },
              { teamName: '연세대학교', fieldGoalPercentage: 80, avgFieldGoalDistance: 20.5, fieldGoalsMade: 4, fieldGoalAttempts: 5, fieldGoalYards: 82, longestFieldGoal: 25 },
              { teamName: '한양대학교', fieldGoalPercentage: 75, avgFieldGoalDistance: 18.3, fieldGoalsMade: 3, fieldGoalAttempts: 4, fieldGoalYards: 55, longestFieldGoal: 25 },
              { teamName: '서울대학교', fieldGoalPercentage: 75, avgFieldGoalDistance: 24, fieldGoalsMade: 3, fieldGoalAttempts: 4, fieldGoalYards: 72, longestFieldGoal: 24 },
              { teamName: '홍익대학교', fieldGoalPercentage: 60, avgFieldGoalDistance: 22, fieldGoalsMade: 3, fieldGoalAttempts: 5, fieldGoalYards: 66, longestFieldGoal: 28 },
              { teamName: '국민대학교', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 1, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '서울시립대학교', fieldGoalPercentage: 100, avgFieldGoalDistance: 14, fieldGoalsMade: 2, fieldGoalAttempts: 2, fieldGoalYards: 28, longestFieldGoal: 28 },
              { teamName: '한국외국어대학교', fieldGoalPercentage: 50, avgFieldGoalDistance: 0, fieldGoalsMade: 2, fieldGoalAttempts: 4, fieldGoalYards: 0, longestFieldGoal: 0 },
            ],
            punting: [
              { teamName: '서울대학교', avgPuntYards: 36.0, puntCount: 8, puntYards: 288, puntTouchdowns: 0, longestPunt: 65 },
              { teamName: '한양대학교', avgPuntYards: 28.4, puntCount: 21, puntYards: 596, puntTouchdowns: 0, longestPunt: 65 },
              { teamName: '연세대학교', avgPuntYards: 25.1, puntCount: 15, puntYards: 377, puntTouchdowns: 0, longestPunt: 75 },
              { teamName: '건국대학교', avgPuntYards: 26.6, puntCount: 9, puntYards: 239, puntTouchdowns: 0, longestPunt: 54 },
              { teamName: '홍익대학교', avgPuntYards: 22.6, puntCount: 17, puntYards: 384, puntTouchdowns: 0, longestPunt: 58 },
              { teamName: '국민대학교', avgPuntYards: 25.2, puntCount: 20, puntYards: 503, puntTouchdowns: 0, longestPunt: 60 },
              { teamName: '서울시립대학교', avgPuntYards: 32.9, puntCount: 23, puntYards: 757, puntTouchdowns: 0, longestPunt: 57 },
              { teamName: '한국외국어대학교', avgPuntYards: 30.8, puntCount: 5, puntYards: 154, puntTouchdowns: 0, longestPunt: 40 },
            ],
            kickoff: [
              { teamName: '서울대학교', avgKickYards: 54.6, kickoffCount: 10, kickoffYards: 546, kickoffTouchdowns: 0, longestKickoff: 65 },
              { teamName: '한양대학교', avgKickYards: 43.3, kickoffCount: 26, kickoffYards: 1126, kickoffTouchdowns: 1, longestKickoff: 65 },
              { teamName: '연세대학교', avgKickYards: 42.1, kickoffCount: 40, kickoffYards: 1684, kickoffTouchdowns: 0, longestKickoff: 75 },
              { teamName: '건국대학교', avgKickYards: 17.8, kickoffCount: 6, kickoffYards: 107, kickoffTouchdowns: 0, longestKickoff: 54 },
              { teamName: '홍익대학교', avgKickYards: 28.3, kickoffCount: 7, kickoffYards: 198, kickoffTouchdowns: 0, longestKickoff: 55 },
              { teamName: '국민대학교', avgKickYards: 0, kickoffCount: 0, kickoffYards: 0, kickoffTouchdowns: 0, longestKickoff: 0 },
              { teamName: '서울시립대학교', avgKickYards: 0, kickoffCount: 0, kickoffYards: 0, kickoffTouchdowns: 0, longestKickoff: 0 },
              { teamName: '한국외국어대학교', avgKickYards: 0, kickoffCount: 0, kickoffYards: 0, kickoffTouchdowns: 0, longestKickoff: 0 },
            ],
            'kickoff return': [
              { teamName: '서울대학교', avgKickReturnYards: 42, kickReturnCount: 4, kickReturnYards: 168, kickReturnTouchdowns: 1, longestKickReturn: 88 },
              { teamName: '한양대학교', avgKickReturnYards: 14.8, kickReturnCount: 18, kickReturnYards: 266, kickReturnTouchdowns: 0, longestKickReturn: 40 },
              { teamName: '연세대학교', avgKickReturnYards: 20.6, kickReturnCount: 11, kickReturnYards: 227, kickReturnTouchdowns: 0, longestKickReturn: 30 },
              { teamName: '건국대학교', avgKickReturnYards: 11.9, kickReturnCount: 7, kickReturnYards: 83, kickReturnTouchdowns: 0, longestKickReturn: 31 },
              { teamName: '홍익대학교', avgKickReturnYards: 10.3, kickReturnCount: 6, kickReturnYards: 62, kickReturnTouchdowns: 0, longestKickReturn: 25 },
              { teamName: '국민대학교', avgKickReturnYards: 0, kickReturnCount: 0, kickReturnYards: 0, kickReturnTouchdowns: 0, longestKickReturn: 0 },
              { teamName: '서울시립대학교', avgKickReturnYards: 0, kickReturnCount: 0, kickReturnYards: 0, kickReturnTouchdowns: 0, longestKickReturn: 0 },
              { teamName: '한국외국어대학교', avgKickReturnYards: 0, kickReturnCount: 0, kickReturnYards: 0, kickReturnTouchdowns: 0, longestKickReturn: 0 },
            ],
            'punt return': [
              { teamName: '서울대학교', avgPuntReturnYards: 6.3, puntReturnCount: 4, puntReturnYards: 25, puntReturnTouchdowns: 1, longestPuntReturn: 25 },
              { teamName: '한양대학교', avgPuntReturnYards: 2.1, puntReturnCount: 8, puntReturnYards: 17, puntReturnTouchdowns: 0, longestPuntReturn: 10 },
              { teamName: '연세대학교', avgPuntReturnYards: 0, puntReturnCount: 6, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
              { teamName: '건국대학교', avgPuntReturnYards: 10, puntReturnCount: 3, puntReturnYards: 30, puntReturnTouchdowns: 0, longestPuntReturn: 30 },
              { teamName: '홍익대학교', avgPuntReturnYards: 5.3, puntReturnCount: 8, puntReturnYards: 42, puntReturnTouchdowns: 0, longestPuntReturn: 18 },
              { teamName: '국민대학교', avgPuntReturnYards: 0, puntReturnCount: 0, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
              { teamName: '서울시립대학교', avgPuntReturnYards: 0, puntReturnCount: 0, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
              { teamName: '한국외국어대학교', avgPuntReturnYards: 0, puntReturnCount: 0, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
            ]
          }
        }
      },
      second: {
        team: {
          offense: {
            rushing: [
              { teamName: '고려대학교', rushingYards: 796, yardsPerCarry: 5.8, rushingTouchdowns: 7, longestRush: 59, rushingTd: 7, receivingTd: 6, totalTd: 13 },
              { teamName: '중앙대학교', rushingYards: 370, yardsPerCarry: 5.4, rushingTouchdowns: 4, longestRush: 55, rushingTd: 4, receivingTd: 0, totalTd: 4 },
              { teamName: '숭실대학교', rushingYards: 368, yardsPerCarry: 4.1, rushingTouchdowns: 2, longestRush: 28, rushingTd: 2, receivingTd: 6, totalTd: 8 },
              { teamName: '동국대학교', rushingYards: 250, yardsPerCarry: 7.6, rushingTouchdowns: 2, longestRush: 96, rushingTd: 2, receivingTd: 0, totalTd: 2 },
              { teamName: '경희대학교', rushingYards: 307, yardsPerCarry: 5, rushingTouchdowns: 2, longestRush: 52, rushingTd: 2, receivingTd: 2, totalTd: 4 },
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
              { teamName: '고려대학교', receptions: 58, receivingYards: 527, yardsPerTarget: 5.3, targets: 100, receivingTouchdowns: 6, longestReception: 37 },
              { teamName: '숭실대학교', receptions: 34, receivingYards: 170, yardsPerTarget: 2.6, targets: 65, receivingTouchdowns: 6, longestReception: 33 },
              { teamName: '중앙대학교', receptions: 7, receivingYards: 61, yardsPerTarget: 2.5, targets: 24, receivingTouchdowns: 0, longestReception: 12 },
              { teamName: '동국대학교', receptions: 37, receivingYards: 290, yardsPerTarget: 3.2, targets: 90, receivingTouchdowns: 0, longestReception: 38 },
              { teamName: '경희대학교', receptions: 5, receivingYards: 66, yardsPerTarget: 3.1, targets: 21, receivingTouchdowns: 2, longestReception: 31 },
              { teamName: '서강대학교', receptions: 19, receivingYards: 323, yardsPerTarget: 5.6, targets: 58, receivingTouchdowns: 3, longestReception: 72 },
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
              { teamName: '고려대학교', interceptions: 7, interceptionTd: 1, interceptionYards: 104, longestInterception: 32 },
              { teamName: '중앙대학교', interceptions: 4, interceptionTd: 0, interceptionYards: 2, longestInterception: 2 },
              { teamName: '숭실대학교', interceptions: 5, interceptionTd: 0, interceptionYards: 71, longestInterception: 32 },
              { teamName: '동국대학교', interceptions: 3, interceptionTd: 0, interceptionYards: 0, longestInterception: 0 },
              { teamName: '경희대학교', interceptions: 2, interceptionTd: 0, interceptionYards: 0, longestInterception: 0 },
              { teamName: '서강대학교', interceptions: 9, interceptionTd: 0, interceptionYards: 0, longestInterception: 0 },
            ]
          },
          special: {
            kicking: [
              { teamName: '고려대학교', fieldGoalPercentage: 66.7, avgFieldGoalDistance: 25.2, fieldGoalsMade: 6, fieldGoalAttempts: 9, fieldGoalYards: 151, longestFieldGoal: 35 },
              { teamName: '중앙대학교', fieldGoalPercentage: 50.0, avgFieldGoalDistance: 20.0, fieldGoalsMade: 2, fieldGoalAttempts: 4, fieldGoalYards: 40, longestFieldGoal: 25 },
              { teamName: '숭실대학교', fieldGoalPercentage: 33.3, avgFieldGoalDistance: 18.0, fieldGoalsMade: 1, fieldGoalAttempts: 3, fieldGoalYards: 18, longestFieldGoal: 18 },
              { teamName: '동국대학교', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 0, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '경희대학교', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 2, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '서강대학교', fieldGoalPercentage: 100, avgFieldGoalDistance: 0, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 0, longestFieldGoal: 0 },
            ],
            punting: [
              { teamName: '고려대학교', avgPuntYards: 26.2, puntCount: 16, puntYards: 419, puntTouchdowns: 0, longestPunt: 62 },
              { teamName: '중앙대학교', avgPuntYards: 29.7, puntCount: 6, puntYards: 178, puntTouchdowns: 0, longestPunt: 55 },
              { teamName: '숭실대학교', avgPuntYards: 10.5, puntCount: 10, puntYards: 105, puntTouchdowns: 0, longestPunt: 48 },
              { teamName: '동국대학교', avgPuntYards: 19.7, puntCount: 17, puntYards: 335, puntTouchdowns: 0, longestPunt: 54 },
              { teamName: '경희대학교', avgPuntYards: 37.8, puntCount: 8, puntYards: 302, puntTouchdowns: 0, longestPunt: 58 },
              { teamName: '서강대학교', avgPuntYards: 31.8, puntCount: 18, puntYards: 572, puntTouchdowns: 0, longestPunt: 53 },
            ],
            kickoff: [
              { teamName: '고려대학교', avgKickYards: 34.5, kickoffCount: 21, kickoffYards: 725, kickoffTouchdowns: 0, longestKickoff: 62 },
              { teamName: '중앙대학교', avgKickYards: 30.5, kickoffCount: 6, kickoffYards: 183, kickoffTouchdowns: 0, longestKickoff: 55 },
              { teamName: '숭실대학교', avgKickYards: 26.3, kickoffCount: 8, kickoffYards: 210, kickoffTouchdowns: 0, longestKickoff: 60 },
              { teamName: '동국대학교', avgKickYards: 0, kickoffCount: 0, kickoffYards: 0, kickoffTouchdowns: 0, longestKickoff: 0 },
              { teamName: '경희대학교', avgKickYards: 0, kickoffCount: 0, kickoffYards: 0, kickoffTouchdowns: 0, longestKickoff: 0 },
              { teamName: '서강대학교', avgKickYards: 0, kickoffCount: 0, kickoffYards: 0, kickoffTouchdowns: 0, longestKickoff: 0 },
            ],
            'kickoff return': [
              { teamName: '고려대학교', avgKickReturnYards: 12.2, kickReturnCount: 11, kickReturnYards: 134, kickReturnTouchdowns: 0, longestKickReturn: 22 },
              { teamName: '중앙대학교', avgKickReturnYards: 18.8, kickReturnCount: 4, kickReturnYards: 75, kickReturnTouchdowns: 0, longestKickReturn: 23 },
              { teamName: '숭실대학교', avgKickReturnYards: 22.4, kickReturnCount: 5, kickReturnYards: 112, kickReturnTouchdowns: 0, longestKickReturn: 43 },
              { teamName: '동국대학교', avgKickReturnYards: 0, kickReturnCount: 0, kickReturnYards: 0, kickReturnTouchdowns: 0, longestKickReturn: 0 },
              { teamName: '경희대학교', avgKickReturnYards: 0, kickReturnCount: 0, kickReturnYards: 0, kickReturnTouchdowns: 0, longestKickReturn: 0 },
              { teamName: '서강대학교', avgKickReturnYards: 0, kickReturnCount: 0, kickReturnYards: 0, kickReturnTouchdowns: 0, longestKickReturn: 0 },
            ],
            'punt return': [
              { teamName: '고려대학교', avgPuntReturnYards: 3, puntReturnCount: 5, puntReturnYards: 15, puntReturnTouchdowns: 0, longestPuntReturn: 12 },
              { teamName: '중앙대학교', avgPuntReturnYards: 5, puntReturnCount: 4, puntReturnYards: 20, puntReturnTouchdowns: 0, longestPuntReturn: 10 },
              { teamName: '숭실대학교', avgPuntReturnYards: 18.7, puntReturnCount: 3, puntReturnYards: 56, puntReturnTouchdowns: 0, longestPuntReturn: 33 },
              { teamName: '동국대학교', avgPuntReturnYards: 0, puntReturnCount: 0, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
              { teamName: '경희대학교', avgPuntReturnYards: 0, puntReturnCount: 0, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
              { teamName: '서강대학교', avgPuntReturnYards: 0, puntReturnCount: 0, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
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
              { teamName: '성균관대학교', rushingYards: 173, yardsPerCarry: 2.6, rushingTouchdowns: 5, longestRush: 38, rushingTd: 5, receivingTd: 5, totalTd: 10 },
              { teamName: '강원대학교', rushingYards: 535, yardsPerCarry: 3.8, rushingTouchdowns: 6, longestRush: 43, rushingTd: 6, receivingTd: 0, totalTd: 6 },
              { teamName: '단국대학교', rushingYards: 578, yardsPerCarry: 3.5, rushingTouchdowns: 4, longestRush: 32, rushingTd: 4, receivingTd: 5, totalTd: 9 },
            ],
            passing: [
              { teamName: '성균관대학교', passingYards: 541, yardsPerAttempt: 3.9, completionPercentage: 29.0, attempts: 138, completions: 40, passingTouchdowns: 5, interceptions: 9, longestPass: 59 },
              { teamName: '강원대학교', passingYards: 218, yardsPerAttempt: 3.8, completionPercentage: 36.8, attempts: 57, completions: 21, passingTouchdowns: 0, interceptions: 4, longestPass: 33 },
              { teamName: '단국대학교', passingYards: 314, yardsPerAttempt: 5.1, completionPercentage: 39.3, attempts: 61, completions: 24, passingTouchdowns: 5, interceptions: 9, longestPass: 58 },
            ],
            receiving: [
              { teamName: '성균관대학교', receptions: 40, receivingYards: 541, yardsPerTarget: 3.9, targets: 138, receivingTouchdowns: 5, longestReception: 59 },
              { teamName: '강원대학교', receptions: 21, receivingYards: 218, yardsPerTarget: 3.8, targets: 57, receivingTouchdowns: 0, longestReception: 33 },
              { teamName: '단국대학교', receptions: 24, receivingYards: 310, yardsPerTarget: 5.1, targets: 61, receivingTouchdowns: 5, longestReception: 58 },
            ]
          },
          defense: {
            tackles: [
              { teamName: '성균관대학교', tackles: 219, sacks: 5, soloTackles: 70, assistTackles: 25 },
              { teamName: '강원대학교', tackles: 215, sacks: 4, soloTackles: 74, assistTackles: 23 },
              { teamName: '단국대학교', tackles: 154, sacks: 1, soloTackles: 34, assistTackles: 3 },
            ],
            interceptions: [
              { teamName: '성균관대학교', interceptions: 4, interceptionTd: 0, interceptionYards: 27, longestInterception: 20 },
              { teamName: '강원대학교', interceptions: 7, interceptionTd: 0, interceptionYards: 91, longestInterception: 37 },
              { teamName: '단국대학교', interceptions: 9, interceptionTd: 0, interceptionYards: 0, longestInterception: 0 },
            ]
          },
          special: {
            kicking: [
              { teamName: '성균관대학교', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 0, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '강원대학교', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 0, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '단국대학교', fieldGoalPercentage: 33.3, avgFieldGoalDistance: 30, fieldGoalsMade: 1, fieldGoalAttempts: 3, fieldGoalYards: 30, longestFieldGoal: 30 },
            ],
            punting: [
              { teamName: '성균관대학교', avgPuntYards: 22.3, puntCount: 22, puntYards: 491, puntTouchdowns: 0, longestPunt: 40 },
              { teamName: '강원대학교', avgPuntYards: 28.1, puntCount: 21, puntYards: 590, puntTouchdowns: 0, longestPunt: 48 },
              { teamName: '단국대학교', avgPuntYards: 37.6, puntCount: 27, puntYards: 1, puntTouchdowns: 0, longestPunt: 56 },
            ],
            kickoff: [
              { teamName: '성균관대학교', avgKickYards: 48, kickoffCount: 15, kickoffYards: 720, kickoffTouchdowns: 0, longestKickoff: 65 },
              { teamName: '강원대학교', avgKickYards: 47.2, kickoffCount: 13, kickoffYards: 613, kickoffTouchdowns: 0, longestKickoff: 60 },
              { teamName: '단국대학교', avgKickYards: 0, kickoffCount: 0, kickoffYards: 0, kickoffTouchdowns: 0, longestKickoff: 0 },
            ],
            'kickoff return': [
              { teamName: '성균관대학교', avgKickReturnYards: 14.8, kickReturnCount: 8, kickReturnYards: 118, kickReturnTouchdowns: 0, longestKickReturn: 25 },
              { teamName: '강원대학교', avgKickReturnYards: 17.2, kickReturnCount: 12, kickReturnYards: 206, kickReturnTouchdowns: 0, longestKickReturn: 42 },
              { teamName: '단국대학교', avgKickReturnYards: 0, kickReturnCount: 0, kickReturnYards: 0, kickReturnTouchdowns: 0, longestKickReturn: 0 },
            ],
            'punt return': [
              { teamName: '성균관대학교', avgPuntReturnYards: 11.3, puntReturnCount: 10, puntReturnYards: 113, puntReturnTouchdowns: 0, longestPuntReturn: 50 },
              { teamName: '강원대학교', avgPuntReturnYards: 17, puntReturnCount: 1, puntReturnYards: 17, puntReturnTouchdowns: 0, longestPuntReturn: 17 },
              { teamName: '단국대학교', avgPuntReturnYards: 0, puntReturnCount: 0, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
            ]
          }
        }
      },
      second: {
        team: {
          offense: {
            rushing: [
              { teamName: '용인대학교', rushingYards: 258, yardsPerCarry: 7.4, rushingTouchdowns: 2, longestRush: 63, rushingTd: 2, receivingTd: 7, totalTd: 9 },
              { teamName: '한림대학교', rushingYards: 178, yardsPerCarry: 5.2, rushingTouchdowns: 2, longestRush: 35, rushingTd: 2, receivingTd: 0, totalTd: 2 },
              { teamName: '한신대학교', rushingYards: 111, yardsPerCarry: 2.6, rushingTouchdowns: 0, longestRush: 16, rushingTd: 0, receivingTd: 1, totalTd: 1 },
              { teamName: '카이스트', rushingYards: 170, yardsPerCarry: 3, rushingTouchdowns: 1, longestRush: 30, rushingTd: 1, receivingTd: 1, totalTd: 2 },
            ],
            passing: [
              { teamName: '용인대학교', passingYards: 330, yardsPerAttempt: 7.9, completionPercentage: 47.6, attempts: 42, completions: 20, passingTouchdowns: 7, interceptions: 3, longestPass: 72 },
              { teamName: '한림대학교', passingYards: 7, yardsPerAttempt: 0.6, completionPercentage: 16.7, attempts: 12, completions: 2, passingTouchdowns: 0, interceptions: 1, longestPass: 7 },
              { teamName: '한신대학교', passingYards: 0, yardsPerAttempt: 0, completionPercentage: 22.2, attempts: 18, completions: 4, passingTouchdowns: 1, interceptions: 2, longestPass: 0 },
              { teamName: '카이스트', passingYards: 31, yardsPerAttempt: 2.6, completionPercentage: 33.3, attempts: 12, completions: 4, passingTouchdowns: 1, interceptions: 2, longestPass: 22 },
            ],
            receiving: [
              { teamName: '용인대학교', receptions: 20, receivingYards: 330, yardsPerTarget: 7.9, targets: 42, receivingTouchdowns: 7, longestReception: 72 },
              { teamName: '한림대학교', receptions: 2, receivingYards: 7, yardsPerTarget: 0.6, targets: 12, receivingTouchdowns: 0, longestReception: 7 },
              { teamName: '한신대학교', receptions: 4, receivingYards: 1, yardsPerTarget: 0.1, targets: 18, receivingTouchdowns: 1, longestReception: 1 },
              { teamName: '카이스트', receptions: 4, receivingYards: 26, yardsPerTarget: 2.2, targets: 12, receivingTouchdowns: 1, longestReception: 22 },
            ]
          },
          defense: {
            tackles: [
              { teamName: '용인대학교', tackles: 102, sacks: 6, soloTackles: 29, assistTackles: 21 },
              { teamName: '한림대학교', tackles: 45, sacks: 0, soloTackles: 13, assistTackles: 1 },
              { teamName: '한신대학교', tackles: 113, sacks: 0, soloTackles: 42, assistTackles: 8 },
              { teamName: '카이스트', tackles: 100, sacks: 0, soloTackles: 30, assistTackles: 7 },
            ],
            interceptions: [
              { teamName: '용인대학교', interceptions: 2, interceptionTd: 1, interceptionYards: 45, longestInterception: 45 },
              { teamName: '한림대학교', interceptions: 2, interceptionTd: 0, interceptionYards: 0, longestInterception: 0 },
              { teamName: '한신대학교', interceptions: 1, interceptionTd: 0, interceptionYards: 0, longestInterception: 0 },
              { teamName: '카이스트', interceptions: 2, interceptionTd: 0, interceptionYards: 0, longestInterception: 0 },
            ]
          },
          special: {
            kicking: [
              { teamName: '용인대학교', fieldGoalPercentage: 100, avgFieldGoalDistance: 37, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 37, longestFieldGoal: 37 },
              { teamName: '한림대학교', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 0, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '한신대학교', fieldGoalPercentage: 100, avgFieldGoalDistance: 0, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '카이스트', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 0, fieldGoalYards: 0, longestFieldGoal: 0 },
            ],
            punting: [
              { teamName: '용인대학교', avgPuntYards: 32.5, puntCount: 6, puntYards: 195, puntTouchdowns: 0, longestPunt: 38 },
              { teamName: '한림대학교', avgPuntYards: 31, puntCount: 2, puntYards: 62, puntTouchdowns: 0, longestPunt: 35 },
              { teamName: '한신대학교', avgPuntYards: 39.1, puntCount: 10, puntYards: 391, puntTouchdowns: 0, longestPunt: 53 },
              { teamName: '카이스트', avgPuntYards: 36.7, puntCount: 6, puntYards: 220, puntTouchdowns: 0, longestPunt: 43 },
            ],
            kickoff: [
              { teamName: '용인대학교', avgKickYards: 40.9, kickoffCount: 10, kickoffYards: 409, kickoffTouchdowns: 0, longestKickoff: 54 },
              { teamName: '한림대학교', avgKickYards: 0, kickoffCount: 0, kickoffYards: 0, kickoffTouchdowns: 0, longestKickoff: 0 },
              { teamName: '한신대학교', avgKickYards: 0, kickoffCount: 0, kickoffYards: 0, kickoffTouchdowns: 0, longestKickoff: 0 },
              { teamName: '카이스트', avgKickYards: 0, kickoffCount: 0, kickoffYards: 0, kickoffTouchdowns: 0, longestKickoff: 0 },
            ],
            'kickoff return': [
              { teamName: '용인대학교', avgKickReturnYards: 16, kickReturnCount: 3, kickReturnYards: 48, kickReturnTouchdowns: 0, longestKickReturn: 23 },
              { teamName: '한림대학교', avgKickReturnYards: 0, kickReturnCount: 0, kickReturnYards: 0, kickReturnTouchdowns: 0, longestKickReturn: 0 },
              { teamName: '한신대학교', avgKickReturnYards: 0, kickReturnCount: 0, kickReturnYards: 0, kickReturnTouchdowns: 0, longestKickReturn: 0 },
              { teamName: '카이스트', avgKickReturnYards: 0, kickReturnCount: 0, kickReturnYards: 0, kickReturnTouchdowns: 0, longestKickReturn: 0 },
            ],
            'punt return': [
              { teamName: '용인대학교', avgPuntReturnYards: 0, puntReturnCount: 1, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
              { teamName: '한림대학교', avgPuntReturnYards: 0, puntReturnCount: 0, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
              { teamName: '한신대학교', avgPuntReturnYards: 0, puntReturnCount: 0, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
              { teamName: '카이스트', avgPuntReturnYards: 0, puntReturnCount: 0, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
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
              { teamName: '경북대학교', rushingYards: 673, yardsPerCarry: 4.7, rushingTouchdowns: 11, longestRush: 68, rushingTd: 11, receivingTd: 9, totalTd: 20 },
              { teamName: '경일대학교', rushingYards: 578, yardsPerCarry: 5.0, rushingTouchdowns: 7, longestRush: 66, rushingTd: 7, receivingTd: 8, totalTd: 15 },
              { teamName: '대구가톨릭대학교', rushingYards: 180, yardsPerCarry: 3.9, rushingTouchdowns: 3, longestRush: 23, rushingTd: 3, receivingTd: 3, totalTd: 6 },
              { teamName: '대구한의대학교', rushingYards: 42, yardsPerCarry: 3.2, rushingTouchdowns: 0, longestRush: 7, rushingTd: 0, receivingTd: 0, totalTd: 0 },
              { teamName: '한동대학교', rushingYards: 184, yardsPerCarry: 3.5, rushingTouchdowns: 1, longestRush: 23, rushingTd: 1, receivingTd: 1, totalTd: 2 },
            ],
            passing: [
              { teamName: '경북대학교', passingYards: 738, yardsPerAttempt: 5.2, completionPercentage: 58.7, attempts: 143, completions: 84, passingTouchdowns: 9, interceptions: 8, longestPass: 68 },
              { teamName: '경일대학교', passingYards: 665, yardsPerAttempt: 5.1, completionPercentage: 61.3, attempts: 129, completions: 79, passingTouchdowns: 8, interceptions: 5, longestPass: 58 },
              { teamName: '대구가톨릭대학교', passingYards: 171, yardsPerAttempt: 2.2, completionPercentage: 55.8, attempts: 77, completions: 43, passingTouchdowns: 3, interceptions: 4, longestPass: 23 },
              { teamName: '대구한의대학교', passingYards: 0, yardsPerAttempt: 0, completionPercentage: 0, attempts: 9, completions: 0, passingTouchdowns: 0, interceptions: 0, longestPass: 0 },
              { teamName: '한동대학교', passingYards: 79, yardsPerAttempt: 2.1, completionPercentage: 41.0, attempts: 39, completions: 16, passingTouchdowns: 1, interceptions: 2, longestPass: 16 },
            ],
            receiving: [
              { teamName: '경북대학교', receptions: 84, receivingYards: 738, yardsPerTarget: 5.2, targets: 143, receivingTouchdowns: 9, longestReception: 68 },
              { teamName: '경일대학교', receptions: 79, receivingYards: 665, yardsPerTarget: 5.1, targets: 129, receivingTouchdowns: 8, longestReception: 58 },
              { teamName: '대구가톨릭대학교', receptions: 43, receivingYards: 171, yardsPerTarget: 2.2, targets: 77, receivingTouchdowns: 3, longestReception: 23 },
              { teamName: '대구한의대학교', receptions: 0, receivingYards: 0, yardsPerTarget: 0, targets: 9, receivingTouchdowns: 0, longestReception: 0 },
              { teamName: '한동대학교', receptions: 16, receivingYards: 79, yardsPerTarget: 2.1, targets: 39, receivingTouchdowns: 1, longestReception: 16 },
            ]
          },
          defense: {
            tackles: [
              { teamName: '경북대학교', tackles: 290, sacks: 8, soloTackles: 90, assistTackles: 46 },
              { teamName: '경일대학교', tackles: 290, sacks: 11, soloTackles: 90, assistTackles: 37 },
              { teamName: '대구가톨릭대학교', tackles: 251, sacks: 7, soloTackles: 88, assistTackles: 42 },
              { teamName: '대구한의대학교', tackles: 40, sacks: 1, soloTackles: 16, assistTackles: 1 },
              { teamName: '한동대학교', tackles: 133, sacks: 3, soloTackles: 49, assistTackles: 15 },
            ],
            interceptions: [
              { teamName: '경북대학교', interceptions: 10, interceptionTd: 1, interceptionYards: 155, longestInterception: 45 },
              { teamName: '경일대학교', interceptions: 3, interceptionTd: 0, interceptionYards: 0, longestInterception: 0 },
              { teamName: '대구가톨릭대학교', interceptions: 9, interceptionTd: 0, interceptionYards: 65, longestInterception: 27 },
              { teamName: '대구한의대학교', interceptions: 0, interceptionTd: 0, interceptionYards: 0, longestInterception: 0 },
              { teamName: '한동대학교', interceptions: 3, interceptionTd: 0, interceptionYards: 45, longestInterception: 37 },
            ]
          },
          special: {
            kicking: [
              { teamName: '경북대학교', fieldGoalPercentage: 66.7, avgFieldGoalDistance: 23, fieldGoalsMade: 2, fieldGoalAttempts: 3, fieldGoalYards: 46, longestFieldGoal: 31 },
              { teamName: '경일대학교', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 1, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '대구가톨릭대학교', fieldGoalPercentage: 100, avgFieldGoalDistance: 17, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 17, longestFieldGoal: 17 },
              { teamName: '대구한의대학교', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 0, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '한동대학교', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 0, fieldGoalYards: 0, longestFieldGoal: 0 },
            ],
            punting: [
              { teamName: '경북대학교', avgPuntYards: 26.7, puntCount: 19, puntYards: 507, puntTouchdowns: 0, longestPunt: 54 },
              { teamName: '경일대학교', avgPuntYards: 37.6, puntCount: 27, puntYards: 1015, puntTouchdowns: 0, longestPunt: 69 },
              { teamName: '대구가톨릭대학교', avgPuntYards: 34.8, puntCount: 12, puntYards: 418, puntTouchdowns: 0, longestPunt: 50 },
              { teamName: '대구한의대학교', avgPuntYards: 33.3, puntCount: 12, puntYards: 400, puntTouchdowns: 0, longestPunt: 42 },
              { teamName: '한동대학교', avgPuntYards: 28.9, puntCount: 13, puntYards: 376, puntTouchdowns: 0, longestPunt: 48 },
            ],
            kickoff: [
              { teamName: '경북대학교', avgKickYards: 46.4, kickoffCount: 20, kickoffYards: 928, kickoffTouchdowns: 1, longestKickoff: 65 },
              { teamName: '경일대학교', avgKickYards: 54.1, kickoffCount: 20, kickoffYards: 1082, kickoffTouchdowns: 0, longestKickoff: 65 },
              { teamName: '대구가톨릭대학교', avgKickYards: 52.8, kickoffCount: 4, kickoffYards: 211, kickoffTouchdowns: 0, longestKickoff: 58 },
              { teamName: '대구한의대학교', avgKickYards: 34.8, kickoffCount: 6, kickoffYards: 209, kickoffTouchdowns: 0, longestKickoff: 69 },
              { teamName: '한동대학교', avgKickYards: 45.3, kickoffCount: 6, kickoffYards: 272, kickoffTouchdowns: 0, longestKickoff: 55 },
            ],
            'kickoff return': [
              { teamName: '경북대학교', avgKickReturnYards: 22.5, kickReturnCount: 11, kickReturnYards: 248, kickReturnTouchdowns: 0, longestKickReturn: 30 },
              { teamName: '경일대학교', avgKickReturnYards: 13, kickReturnCount: 22, kickReturnYards: 287, kickReturnTouchdowns: 0, longestKickReturn: 35 },
              { teamName: '대구가톨릭대학교', avgKickReturnYards: 16.5, kickReturnCount: 4, kickReturnYards: 66, kickReturnTouchdowns: 0, longestKickReturn: 35 },
              { teamName: '대구한의대학교', avgKickReturnYards: 9.7, kickReturnCount: 7, kickReturnYards: 68, kickReturnTouchdowns: 0, longestKickReturn: 25 },
              { teamName: '한동대학교', avgKickReturnYards: 15, kickReturnCount: 8, kickReturnYards: 120, kickReturnTouchdowns: 0, longestKickReturn: 25 },
            ],
            'punt return': [
              { teamName: '경북대학교', avgPuntReturnYards: 9.8, puntReturnCount: 12, puntReturnYards: 118, puntReturnTouchdowns: 0, longestPuntReturn: 38 },
              { teamName: '경일대학교', avgPuntReturnYards: 20.9, puntReturnCount: 9, puntReturnYards: 188, puntReturnTouchdowns: 1, longestPuntReturn: 58 },
              { teamName: '대구가톨릭대학교', avgPuntReturnYards: 7.5, puntReturnCount: 2, puntReturnYards: 15, puntReturnTouchdowns: 0, longestPuntReturn: 13 },
              { teamName: '대구한의대학교', avgPuntReturnYards: 2.8, puntReturnCount: 5, puntReturnYards: 14, puntReturnTouchdowns: 0, longestPuntReturn: 7 },
              { teamName: '한동대학교', avgPuntReturnYards: 5, puntReturnCount: 4, puntReturnYards: 20, puntReturnTouchdowns: 0, longestPuntReturn: 8 },
            ]
          }
        }
      },
      second: {
        team: {
          offense: {
            rushing: [
              { teamName: '계명대학교', rushingYards: 103, yardsPerCarry: 2.4, rushingTouchdowns: 1, longestRush: 17, rushingTd: 1, receivingTd: 1, totalTd: 2 },
              { teamName: '금오공과대학교', rushingYards: 355, yardsPerCarry: 3.9, rushingTouchdowns: 4, longestRush: 29, rushingTd: 4, receivingTd: 2, totalTd: 6 },
              { teamName: '대구대학교', rushingYards: 426, yardsPerCarry: 4.4, rushingTouchdowns: 2, longestRush: 39, rushingTd: 2, receivingTd: 1, totalTd: 3 },
              { teamName: '동국대학교', rushingYards: 377, yardsPerCarry: 4.0, rushingTouchdowns: 3, longestRush: 32, rushingTd: 3, receivingTd: 1, totalTd: 4 },
              { teamName: '영남대학교', rushingYards: 159, yardsPerCarry: 3.3, rushingTouchdowns: 1, longestRush: 17, rushingTd: 1, receivingTd: 3, totalTd: 4 },
            ],
            passing: [
              { teamName: '계명대학교', passingYards: 66, yardsPerAttempt: 2.8, completionPercentage: 29.2, attempts: 24, completions: 7, passingTouchdowns: 1, interceptions: 0, longestPass: 22 },
              { teamName: '금오공과대학교', passingYards: 207, yardsPerAttempt: 3.4, completionPercentage: 44.3, attempts: 61, completions: 27, passingTouchdowns: 2, interceptions: 3, longestPass: 29 },
              { teamName: '대구대학교', passingYards: 61, yardsPerAttempt: 1.5, completionPercentage: 26.7, attempts: 41, completions: 11, passingTouchdowns: 1, interceptions: 2, longestPass: 12 },
              { teamName: '동국대학교', passingYards: 130, yardsPerAttempt: 2.1, completionPercentage: 37.7, attempts: 61, completions: 23, passingTouchdowns: 1, interceptions: 6, longestPass: 18 },
              { teamName: '영남대학교', passingYards: 222, yardsPerAttempt: 4.5, completionPercentage: 48.0, attempts: 50, completions: 24, passingTouchdowns: 3, interceptions: 4, longestPass: 44 },
            ],
            receiving: [
              { teamName: '계명대학교', receptions: 7, receivingYards: 66, yardsPerTarget: 2.8, targets: 24, receivingTouchdowns: 1, longestReception: 22 },
              { teamName: '금오공과대학교', receptions: 27, receivingYards: 207, yardsPerTarget: 3.4, targets: 61, receivingTouchdowns: 2, longestReception: 29 },
              { teamName: '대구대학교', receptions: 11, receivingYards: 61, yardsPerTarget: 1.5, targets: 41, receivingTouchdowns: 1, longestReception: 12 },
              { teamName: '동국대학교', receptions: 23, receivingYards: 130, yardsPerTarget: 2.1, targets: 61, receivingTouchdowns: 1, longestReception: 18 },
              { teamName: '영남대학교', receptions: 24, receivingYards: 222, yardsPerTarget: 4.5, targets: 50, receivingTouchdowns: 3, longestReception: 44 },
            ]
          },
          defense: {
            tackles: [
              { teamName: '계명대학교', tackles: 93, sacks: 1, soloTackles: 29, assistTackles: 5 },
              { teamName: '금오공과대학교', tackles: 183, sacks: 7, soloTackles: 62, assistTackles: 23 },
              { teamName: '대구대학교', tackles: 154, sacks: 1, soloTackles: 52, assistTackles: 15 },
              { teamName: '동국대학교', tackles: 227, sacks: 5, soloTackles: 75, assistTackles: 29 },
              { teamName: '영남대학교', tackles: 181, sacks: 7, soloTackles: 62, assistTackles: 20 },
            ],
            interceptions: [
              { teamName: '계명대학교', interceptions: 0, interceptionTd: 0, interceptionYards: 0, longestInterception: 0 },
              { teamName: '금오공과대학교', interceptions: 5, interceptionTd: 0, interceptionYards: 60, longestInterception: 30 },
              { teamName: '대구대학교', interceptions: 7, interceptionTd: 1, interceptionYards: 65, longestInterception: 42 },
              { teamName: '동국대학교', interceptions: 6, interceptionTd: 0, interceptionYards: 75, longestInterception: 30 },
              { teamName: '영남대학교', interceptions: 7, interceptionTd: 0, interceptionYards: 46, longestInterception: 20 },
            ]
          },
          special: {
            kicking: [
              { teamName: '계명대학교', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 0, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '금오공과대학교', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 0, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '대구대학교', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 0, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '동국대학교', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 0, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '영남대학교', fieldGoalPercentage: 100, avgFieldGoalDistance: 21, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 21, longestFieldGoal: 21 },
            ],
            punting: [
              { teamName: '계명대학교', avgPuntYards: 21.4, puntCount: 5, puntYards: 107, puntTouchdowns: 0, longestPunt: 35 },
              { teamName: '금오공과대학교', avgPuntYards: 26.4, puntCount: 9, puntYards: 238, puntTouchdowns: 0, longestPunt: 42 },
              { teamName: '대구대학교', avgPuntYards: 28.3, puntCount: 7, puntYards: 198, puntTouchdowns: 0, longestPunt: 35 },
              { teamName: '동국대학교', avgPuntYards: 14.3, puntCount: 4, puntYards: 57, puntTouchdowns: 0, longestPunt: 25 },
              { teamName: '영남대학교', avgPuntYards: 23.4, puntCount: 11, puntYards: 257, puntTouchdowns: 0, longestPunt: 40 },
            ],
            kickoff: [
              { teamName: '계명대학교', avgKickYards: 35, kickoffCount: 1, kickoffYards: 35, kickoffTouchdowns: 0, longestKickoff: 35 },
              { teamName: '금오공과대학교', avgKickYards: 43.8, kickoffCount: 12, kickoffYards: 525, kickoffTouchdowns: 0, longestKickoff: 60 },
              { teamName: '대구대학교', avgKickYards: 46.9, kickoffCount: 9, kickoffYards: 422, kickoffTouchdowns: 0, longestKickoff: 65 },
              { teamName: '동국대학교', avgKickYards: 50, kickoffCount: 1, kickoffYards: 50, kickoffTouchdowns: 0, longestKickoff: 50 },
              { teamName: '영남대학교', avgKickYards: 50.5, kickoffCount: 6, kickoffYards: 303, kickoffTouchdowns: 0, longestKickoff: 60 },
            ],
            'kickoff return': [
              { teamName: '계명대학교', avgKickReturnYards: 28.5, kickReturnCount: 4, kickReturnYards: 114, kickReturnTouchdowns: 0, longestKickReturn: 42 },
              { teamName: '금오공과대학교', avgKickReturnYards: 19.6, kickReturnCount: 8, kickReturnYards: 157, kickReturnTouchdowns: 0, longestKickReturn: 30 },
              { teamName: '대구대학교', avgKickReturnYards: 13.1, kickReturnCount: 7, kickReturnYards: 92, kickReturnTouchdowns: 0, longestKickReturn: 25 },
              { teamName: '동국대학교', avgKickReturnYards: 19.7, kickReturnCount: 3, kickReturnYards: 59, kickReturnTouchdowns: 0, longestKickReturn: 25 },
              { teamName: '영남대학교', avgKickReturnYards: 14.3, kickReturnCount: 4, kickReturnYards: 57, kickReturnTouchdowns: 0, longestKickReturn: 20 },
            ],
            'punt return': [
              { teamName: '계명대학교', avgPuntReturnYards: 0, puntReturnCount: 1, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
              { teamName: '금오공과대학교', avgPuntReturnYards: 14, puntReturnCount: 1, puntReturnYards: 14, puntReturnTouchdowns: 0, longestPuntReturn: 14 },
              { teamName: '대구대학교', avgPuntReturnYards: 1.7, puntReturnCount: 3, puntReturnYards: 5, puntReturnTouchdowns: 0, longestPuntReturn: 5 },
              { teamName: '동국대학교', avgPuntReturnYards: 17.3, puntReturnCount: 3, puntReturnYards: 52, puntReturnTouchdowns: 0, longestPuntReturn: 30 },
              { teamName: '영남대학교', avgPuntReturnYards: 5.3, puntReturnCount: 3, puntReturnYards: 16, puntReturnTouchdowns: 0, longestPuntReturn: 12 },
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
              { teamName: '경성대학교', rushingYards: 798, yardsPerCarry: 4.3, rushingTouchdowns: 8, longestRush: 37, rushingTd: 8, receivingTd: 6, totalTd: 14 },
              { teamName: '동의대학교', rushingYards: 568, yardsPerCarry: 4.5, rushingTouchdowns: 9, longestRush: 59, rushingTd: 9, receivingTd: 4, totalTd: 13 },
              { teamName: '동아대학교', rushingYards: 293, yardsPerCarry: 3.4, rushingTouchdowns: 4, longestRush: 31, rushingTd: 4, receivingTd: 0, totalTd: 4 },
              { teamName: '울산대학교', rushingYards: 142, yardsPerCarry: 3.0, rushingTouchdowns: 1, longestRush: 25, rushingTd: 1, receivingTd: 0, totalTd: 1 },
            ],
            passing: [
              { teamName: '경성대학교', passingYards: 514, yardsPerAttempt: 5.0, completionPercentage: 54.4, attempts: 103, completions: 56, passingTouchdowns: 6, interceptions: 5, longestPass: 48 },
              { teamName: '동의대학교', passingYards: 398, yardsPerAttempt: 4.0, completionPercentage: 41.0, attempts: 100, completions: 41, passingTouchdowns: 4, interceptions: 8, longestPass: 53 },
              { teamName: '동아대학교', passingYards: 0, yardsPerAttempt: 0, completionPercentage: 0, attempts: 13, completions: 0, passingTouchdowns: 0, interceptions: 2, longestPass: 0 },
              { teamName: '울산대학교', passingYards: 0, yardsPerAttempt: 0, completionPercentage: 0, attempts: 11, completions: 0, passingTouchdowns: 0, interceptions: 1, longestPass: 0 },
            ],
            receiving: [
              { teamName: '경성대학교', receptions: 56, receivingYards: 514, yardsPerTarget: 5.0, targets: 103, receivingTouchdowns: 6, longestReception: 48 },
              { teamName: '동의대학교', receptions: 41, receivingYards: 398, yardsPerTarget: 4.0, targets: 100, receivingTouchdowns: 4, longestReception: 53 },
              { teamName: '동아대학교', receptions: 0, receivingYards: 0, yardsPerTarget: 0, targets: 13, receivingTouchdowns: 0, longestReception: 0 },
              { teamName: '울산대학교', receptions: 0, receivingYards: 0, yardsPerTarget: 0, targets: 11, receivingTouchdowns: 0, longestReception: 0 },
            ]
          },
          defense: {
            tackles: [
              { teamName: '경성대학교', tackles: 273, sacks: 7, soloTackles: 82, assistTackles: 26 },
              { teamName: '동의대학교', tackles: 262, sacks: 7, soloTackles: 96, assistTackles: 39 },
              { teamName: '동아대학교', tackles: 133, sacks: 7, soloTackles: 47, assistTackles: 16 },
              { teamName: '울산대학교', tackles: 104, sacks: 1, soloTackles: 28, assistTackles: 7 },
            ],
            interceptions: [
              { teamName: '경성대학교', interceptions: 8, interceptionTd: 1, interceptionYards: 91, longestInterception: 42 },
              { teamName: '동의대학교', interceptions: 8, interceptionTd: 0, interceptionYards: 78, longestInterception: 39 },
              { teamName: '동아대학교', interceptions: 4, interceptionTd: 0, interceptionYards: 34, longestInterception: 21 },
              { teamName: '울산대학교', interceptions: 2, interceptionTd: 0, interceptionYards: 5, longestInterception: 5 },
            ]
          },
          special: {
            kicking: [
              { teamName: '경성대학교', fieldGoalPercentage: 50, avgFieldGoalDistance: 20, fieldGoalsMade: 1, fieldGoalAttempts: 2, fieldGoalYards: 20, longestFieldGoal: 20 },
              { teamName: '동의대학교', fieldGoalPercentage: 100, avgFieldGoalDistance: 18.5, fieldGoalsMade: 2, fieldGoalAttempts: 2, fieldGoalYards: 37, longestFieldGoal: 22 },
              { teamName: '동아대학교', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 0, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '울산대학교', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 0, fieldGoalYards: 0, longestFieldGoal: 0 },
            ],
            punting: [
              { teamName: '경성대학교', avgPuntYards: 37, puntCount: 10, puntYards: 370, puntTouchdowns: 0, longestPunt: 60 },
              { teamName: '동의대학교', avgPuntYards: 27.4, puntCount: 14, puntYards: 384, puntTouchdowns: 0, longestPunt: 46 },
              { teamName: '동아대학교', avgPuntYards: 34.4, puntCount: 5, puntYards: 172, puntTouchdowns: 0, longestPunt: 45 },
              { teamName: '울산대학교', avgPuntYards: 42.5, puntCount: 2, puntYards: 85, puntTouchdowns: 0, longestPunt: 50 },
            ],
            kickoff: [
              { teamName: '경성대학교', avgKickYards: 45.1, kickoffCount: 17, kickoffYards: 767, kickoffTouchdowns: 0, longestKickoff: 61 },
              { teamName: '동의대학교', avgKickYards: 45, kickoffCount: 10, kickoffYards: 450, kickoffTouchdowns: 0, longestKickoff: 58 },
              { teamName: '동아대학교', avgKickYards: 21.4, kickoffCount: 8, kickoffYards: 171, kickoffTouchdowns: 0, longestKickoff: 51 },
              { teamName: '울산대학교', avgKickYards: 37.8, kickoffCount: 6, kickoffYards: 227, kickoffTouchdowns: 0, longestKickoff: 50 },
            ],
            'kickoff return': [
              { teamName: '경성대학교', avgKickReturnYards: 13.5, kickReturnCount: 8, kickReturnYards: 108, kickReturnTouchdowns: 0, longestKickReturn: 30 },
              { teamName: '동의대학교', avgKickReturnYards: 18.4, kickReturnCount: 14, kickReturnYards: 258, kickReturnTouchdowns: 0, longestKickReturn: 50 },
              { teamName: '동아대학교', avgKickReturnYards: 10, kickReturnCount: 3, kickReturnYards: 30, kickReturnTouchdowns: 0, longestKickReturn: 27 },
              { teamName: '울산대학교', avgKickReturnYards: 12.5, kickReturnCount: 6, kickReturnYards: 75, kickReturnTouchdowns: 0, longestKickReturn: 26 },
            ],
            'punt return': [
              { teamName: '경성대학교', avgPuntReturnYards: 4, puntReturnCount: 2, puntReturnYards: 8, puntReturnTouchdowns: 0, longestPuntReturn: 8 },
              { teamName: '동의대학교', avgPuntReturnYards: 18, puntReturnCount: 1, puntReturnYards: 18, puntReturnTouchdowns: 0, longestPuntReturn: 18 },
              { teamName: '동아대학교', avgPuntReturnYards: 19.7, puntReturnCount: 3, puntReturnYards: 59, puntReturnTouchdowns: 0, longestPuntReturn: 54 },
              { teamName: '울산대학교', avgPuntReturnYards: 0, puntReturnCount: 0, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
            ]
          }
        }
      },
      second: {
        team: {
          offense: {
            rushing: [
              { teamName: '부산대학교', rushingYards: 78, yardsPerCarry: 2.6, rushingTouchdowns: 1, longestRush: 15, rushingTd: 1, receivingTd: 2, totalTd: 3 },
              { teamName: '한국해양대학교', rushingYards: 389, yardsPerCarry: 3.8, rushingTouchdowns: 3, longestRush: 48, rushingTd: 3, receivingTd: 2, totalTd: 5 },
              { teamName: '신라대학교', rushingYards: 312, yardsPerCarry: 3.4, rushingTouchdowns: 2, longestRush: 35, rushingTd: 2, receivingTd: 1, totalTd: 3 },
              { teamName: '동서대학교', rushingYards: 78, yardsPerCarry: 3.5, rushingTouchdowns: 0, longestRush: 13, rushingTd: 0, receivingTd: 0, totalTd: 0 },
              { teamName: '부산외국어대학교', rushingYards: 456, yardsPerCarry: 4.1, rushingTouchdowns: 6, longestRush: 42, rushingTd: 6, receivingTd: 8, totalTd: 14 },
            ],
            passing: [
              { teamName: '부산대학교', passingYards: 164, yardsPerAttempt: 7.8, completionPercentage: 52.4, attempts: 21, completions: 11, passingTouchdowns: 2, interceptions: 0, longestPass: 26 },
              { teamName: '한국해양대학교', passingYards: 193, yardsPerAttempt: 3.2, completionPercentage: 38.3, attempts: 60, completions: 23, passingTouchdowns: 2, interceptions: 3, longestPass: 35 },
              { teamName: '신라대학교', passingYards: 85, yardsPerAttempt: 1.7, completionPercentage: 44.9, attempts: 49, completions: 22, passingTouchdowns: 1, interceptions: 4, longestPass: 25 },
              { teamName: '동서대학교', passingYards: 15, yardsPerAttempt: 0.7, completionPercentage: 13.6, attempts: 22, completions: 3, passingTouchdowns: 0, interceptions: 1, longestPass: 8 },
              { teamName: '부산외국어대학교', passingYards: 684, yardsPerAttempt: 4.4, completionPercentage: 64.5, attempts: 155, completions: 100, passingTouchdowns: 8, interceptions: 6, longestPass: 66 },
            ],
            receiving: [
              { teamName: '부산대학교', receptions: 11, receivingYards: 164, yardsPerTarget: 7.8, targets: 21, receivingTouchdowns: 2, longestReception: 26 },
              { teamName: '한국해양대학교', receptions: 23, receivingYards: 193, yardsPerTarget: 3.2, targets: 60, receivingTouchdowns: 2, longestReception: 35 },
              { teamName: '신라대학교', receptions: 22, receivingYards: 85, yardsPerTarget: 1.7, targets: 49, receivingTouchdowns: 1, longestReception: 25 },
              { teamName: '동서대학교', receptions: 3, receivingYards: 15, yardsPerTarget: 0.7, targets: 22, receivingTouchdowns: 0, longestReception: 8 },
              { teamName: '부산외국어대학교', receptions: 100, receivingYards: 684, yardsPerTarget: 4.4, targets: 155, receivingTouchdowns: 8, longestReception: 66 },
            ]
          },
          defense: {
            tackles: [
              { teamName: '부산대학교', tackles: 132, sacks: 2, soloTackles: 43, assistTackles: 9 },
              { teamName: '한국해양대학교', tackles: 182, sacks: 5, soloTackles: 59, assistTackles: 17 },
              { teamName: '신라대학교', tackles: 162, sacks: 6, soloTackles: 61, assistTackles: 21 },
              { teamName: '동서대학교', tackles: 150, sacks: 3, soloTackles: 51, assistTackles: 13 },
              { teamName: '부산외국어대학교', tackles: 308, sacks: 9, soloTackles: 112, assistTackles: 39 },
            ],
            interceptions: [
              { teamName: '부산대학교', interceptions: 4, interceptionTd: 0, interceptionYards: 38, longestInterception: 15 },
              { teamName: '한국해양대학교', interceptions: 5, interceptionTd: 1, interceptionYards: 75, longestInterception: 31 },
              { teamName: '신라대학교', interceptions: 3, interceptionTd: 0, interceptionYards: 31, longestInterception: 20 },
              { teamName: '동서대학교', interceptions: 2, interceptionTd: 0, interceptionYards: 24, longestInterception: 18 },
              { teamName: '부산외국어대학교', interceptions: 7, interceptionTd: 0, interceptionYards: 36, longestInterception: 12 },
            ]
          },
          special: {
            kicking: [
              { teamName: '부산대학교', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 0, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '한국해양대학교', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 0, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '신라대학교', fieldGoalPercentage: 50, avgFieldGoalDistance: 17, fieldGoalsMade: 1, fieldGoalAttempts: 2, fieldGoalYards: 17, longestFieldGoal: 17 },
              { teamName: '동서대학교', fieldGoalPercentage: 0, avgFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalAttempts: 0, fieldGoalYards: 0, longestFieldGoal: 0 },
              { teamName: '부산외국어대학교', fieldGoalPercentage: 100, avgFieldGoalDistance: 17, fieldGoalsMade: 2, fieldGoalAttempts: 2, fieldGoalYards: 34, longestFieldGoal: 17 },
            ],
            punting: [
              { teamName: '부산대학교', avgPuntYards: 38, puntCount: 6, puntYards: 228, puntTouchdowns: 0, longestPunt: 45 },
              { teamName: '한국해양대학교', avgPuntYards: 32, puntCount: 4, puntYards: 128, puntTouchdowns: 0, longestPunt: 40 },
              { teamName: '신라대학교', avgPuntYards: 5.9, puntCount: 9, puntYards: 53, puntTouchdowns: 0, longestPunt: 15 },
              { teamName: '동서대학교', avgPuntYards: 29.2, puntCount: 5, puntYards: 146, puntTouchdowns: 0, longestPunt: 36 },
              { teamName: '부산외국어대학교', avgPuntYards: 27.4, puntCount: 11, puntYards: 301, puntTouchdowns: 0, longestPunt: 41 },
            ],
            kickoff: [
              { teamName: '부산대학교', avgKickYards: 50, kickoffCount: 1, kickoffYards: 50, kickoffTouchdowns: 0, longestKickoff: 50 },
              { teamName: '한국해양대학교', avgKickYards: 47.4, kickoffCount: 12, kickoffYards: 569, kickoffTouchdowns: 0, longestKickoff: 54 },
              { teamName: '신라대학교', avgKickYards: 43.6, kickoffCount: 8, kickoffYards: 349, kickoffTouchdowns: 0, longestKickoff: 65 },
              { teamName: '동서대학교', avgKickYards: 39.3, kickoffCount: 6, kickoffYards: 236, kickoffTouchdowns: 0, longestKickoff: 62 },
              { teamName: '부산외국어대학교', avgKickYards: 28.9, kickoffCount: 25, kickoffYards: 722, kickoffTouchdowns: 1, longestKickoff: 60 },
            ],
            'kickoff return': [
              { teamName: '부산대학교', avgKickReturnYards: 26.8, kickReturnCount: 4, kickReturnYards: 107, kickReturnTouchdowns: 1, longestKickReturn: 63 },
              { teamName: '한국해양대학교', avgKickReturnYards: 17, kickReturnCount: 9, kickReturnYards: 153, kickReturnTouchdowns: 0, longestKickReturn: 25 },
              { teamName: '신라대학교', avgKickReturnYards: 15.4, kickReturnCount: 5, kickReturnYards: 77, kickReturnTouchdowns: 0, longestKickReturn: 28 },
              { teamName: '동서대학교', avgKickReturnYards: 14.7, kickReturnCount: 14, kickReturnYards: 206, kickReturnTouchdowns: 0, longestKickReturn: 25 },
              { teamName: '부산외국어대학교', avgKickReturnYards: 15.4, kickReturnCount: 11, kickReturnYards: 169, kickReturnTouchdowns: 0, longestKickReturn: 22 },
            ],
            'punt return': [
              { teamName: '부산대학교', avgPuntReturnYards: 0, puntReturnCount: 1, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
              { teamName: '한국해양대학교', avgPuntReturnYards: 20, puntReturnCount: 1, puntReturnYards: 20, puntReturnTouchdowns: 1, longestPuntReturn: 20 },
              { teamName: '신라대학교', avgPuntReturnYards: 0, puntReturnCount: 0, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
              { teamName: '동서대학교', avgPuntReturnYards: 0, puntReturnCount: 0, puntReturnYards: 0, puntReturnTouchdowns: 0, longestPuntReturn: 0 },
              { teamName: '부산외국어대학교', avgPuntReturnYards: 5.3, puntReturnCount: 3, puntReturnYards: 16, puntReturnTouchdowns: 0, longestPuntReturn: 12 },
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
            { teamName: '인천 라이노스', rushingYards: 760, yardsPerCarry: 5.4, rushingTouchdowns: 7, longestRush: 89, rushingTd: 7, receivingTd: 4, totalTd: 11 },
            { teamName: '군위 피닉스', rushingYards: 671, yardsPerCarry: 4.3, rushingTouchdowns: 7, longestRush: 31, rushingTd: 7, receivingTd: 9, totalTd: 16 },
            { teamName: '서울 골든이글스', rushingYards: 663, yardsPerCarry: 4.2, rushingTouchdowns: 8, longestRush: 42, rushingTd: 8, receivingTd: 6, totalTd: 14 },
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
            { teamName: '군위 피닉스', receptions: 75, receivingYards: 893, yardsPerTarget: 5.5, targets: 161, receivingTouchdowns: 9, longestReception: 64 },
            { teamName: '서울 바이킹스', receptions: 69, receivingYards: 804, yardsPerTarget: 6.3, targets: 127, receivingTouchdowns: 10, longestReception: 72 },
            { teamName: '삼성 블루스톰', receptions: 62, receivingYards: 880, yardsPerTarget: 6.8, targets: 130, receivingTouchdowns: 6, longestReception: 77 },
            { teamName: '서울 골든이글스', receptions: 61, receivingYards: 628, yardsPerTarget: 4.7, targets: 134, receivingTouchdowns: 6, longestReception: 40 },
            { teamName: '서울 디펜더스', receptions: 55, receivingYards: 679, yardsPerTarget: 6.7, targets: 102, receivingTouchdowns: 4, longestReception: 58 },
            { teamName: '부산 그리폰즈', receptions: 41, receivingYards: 361, yardsPerTarget: 4.0, targets: 90, receivingTouchdowns: 1, longestReception: 72 },
            { teamName: '인천 라이노스', receptions: 79, receivingYards: 712, yardsPerTarget: 5.2, targets: 138, receivingTouchdowns: 4, longestReception: 65 },
          ]
        },
        defense: {
          tackles: [
            { teamName: '군위 피닉스', tackles: 145, sacks: 8, soloTackles: 65, assistTackles: 25 },
            { teamName: '삼성 블루스톰', tackles: 132, sacks: 6, soloTackles: 58, assistTackles: 22 },
            { teamName: '인천 라이노스', tackles: 128, sacks: 5, soloTackles: 55, assistTackles: 20 },
            { teamName: '서울 골든이글스', tackles: 118, sacks: 4, soloTackles: 52, assistTackles: 18 },
            { teamName: '서울 디펜더스', tackles: 105, sacks: 3, soloTackles: 48, assistTackles: 15 },
            { teamName: '부산 그리폰즈', tackles: 98, sacks: 2, soloTackles: 45, assistTackles: 12 },
            { teamName: '서울 바이킹스', tackles: 89, sacks: 1, soloTackles: 42, assistTackles: 10 },
          ],
          interceptions: [
            { teamName: '서울 골든이글스', interceptions: 8, interceptionTd: 1, interceptionYards: 125, longestInterception: 45 },
            { teamName: '군위 피닉스', interceptions: 7, interceptionTd: 2, interceptionYards: 98, longestInterception: 38 },
            { teamName: '인천 라이노스', interceptions: 6, interceptionTd: 1, interceptionYards: 87, longestInterception: 32 },
            { teamName: '삼성 블루스톰', interceptions: 5, interceptionTd: 0, interceptionYards: 65, longestInterception: 28 },
            { teamName: '서울 디펜더스', interceptions: 4, interceptionTd: 1, interceptionYards: 52, longestInterception: 25 },
            { teamName: '부산 그리폰즈', interceptions: 3, interceptionTd: 0, interceptionYards: 35, longestInterception: 20 },
            { teamName: '서울 바이킹스', interceptions: 2, interceptionTd: 0, interceptionYards: 18, longestInterception: 15 },
          ]
        },
        special: {
          kicking: [
            { teamName: '군위 피닉스', fieldGoalPercentage: 80.0, avgFieldGoalDistance: 32.5, fieldGoalsMade: 8, fieldGoalAttempts: 10, fieldGoalYards: 260, longestFieldGoal: 48 },
            { teamName: '서울 골든이글스', fieldGoalPercentage: 75.0, avgFieldGoalDistance: 28.5, fieldGoalsMade: 9, fieldGoalAttempts: 12, fieldGoalYards: 257, longestFieldGoal: 42 },
            { teamName: '인천 라이노스', fieldGoalPercentage: 72.0, avgFieldGoalDistance: 30.2, fieldGoalsMade: 6, fieldGoalAttempts: 8, fieldGoalYards: 181, longestFieldGoal: 45 },
            { teamName: '부산 그리폰즈', fieldGoalPercentage: 70.0, avgFieldGoalDistance: 26.8, fieldGoalsMade: 7, fieldGoalAttempts: 10, fieldGoalYards: 188, longestFieldGoal: 38 },
            { teamName: '서울 디펜더스', fieldGoalPercentage: 68.0, avgFieldGoalDistance: 27.5, fieldGoalsMade: 5, fieldGoalAttempts: 7, fieldGoalYards: 138, longestFieldGoal: 35 },
            { teamName: '삼성 블루스톰', fieldGoalPercentage: 65.0, avgFieldGoalDistance: 25.2, fieldGoalsMade: 6, fieldGoalAttempts: 9, fieldGoalYards: 151, longestFieldGoal: 35 },
            { teamName: '서울 바이킹스', fieldGoalPercentage: 60.0, avgFieldGoalDistance: 24.0, fieldGoalsMade: 3, fieldGoalAttempts: 5, fieldGoalYards: 72, longestFieldGoal: 28 },
          ],
          punting: [
            { teamName: '군위 피닉스', avgPuntYards: 45.2, puntCount: 18, puntYards: 814, puntTouchdowns: 0, longestPunt: 62 },
            { teamName: '부산 그리폰즈', avgPuntYards: 43.5, puntCount: 22, puntYards: 957, puntTouchdowns: 0, longestPunt: 55 },
            { teamName: '인천 라이노스', avgPuntYards: 41.8, puntCount: 20, puntYards: 836, puntTouchdowns: 0, longestPunt: 58 },
            { teamName: '서울 바이킹스', avgPuntYards: 39.2, puntCount: 15, puntYards: 588, puntTouchdowns: 0, longestPunt: 52 },
            { teamName: '서울 골든이글스', avgPuntYards: 37.1, puntCount: 25, puntYards: 928, puntTouchdowns: 0, longestPunt: 48 },
            { teamName: '서울 디펜더스', avgPuntYards: 35.5, puntCount: 19, puntYards: 675, puntTouchdowns: 0, longestPunt: 46 },
            { teamName: '삼성 블루스톰', avgPuntYards: 34.1, puntCount: 16, puntYards: 546, puntTouchdowns: 0, longestPunt: 45 },
          ],
          kickoff: [
            { teamName: '군위 피닉스', avgKickYards: 54.2, kickoffCount: 16, kickoffYards: 867, kickoffTouchdowns: 0, longestKickoff: 68 },
            { teamName: '삼성 블루스톰', avgKickYards: 52.8, kickoffCount: 25, kickoffYards: 1320, kickoffTouchdowns: 0, longestKickoff: 70 },
            { teamName: '인천 라이노스', avgKickYards: 51.5, kickoffCount: 20, kickoffYards: 1030, kickoffTouchdowns: 0, longestKickoff: 65 },
            { teamName: '부산 그리폰즈', avgKickYards: 49.8, kickoffCount: 23, kickoffYards: 1145, kickoffTouchdowns: 0, longestKickoff: 60 },
            { teamName: '서울 디펜더스', avgKickYards: 47.2, kickoffCount: 18, kickoffYards: 850, kickoffTouchdowns: 0, longestKickoff: 58 },
            { teamName: '서울 바이킹스', avgKickYards: 45.6, kickoffCount: 15, kickoffYards: 684, kickoffTouchdowns: 0, longestKickoff: 55 },
            { teamName: '서울 골든이글스', avgKickYards: 33.8, kickoffCount: 22, kickoffYards: 743, kickoffTouchdowns: 0, longestKickoff: 57 },
          ],
          'kickoff return': [
            { teamName: '인천 라이노스', avgKickReturnYards: 24.5, kickReturnCount: 15, kickReturnYards: 368, kickReturnTouchdowns: 1, longestKickReturn: 82 },
            { teamName: '서울 바이킹스', avgKickReturnYards: 23.2, kickReturnCount: 18, kickReturnYards: 418, kickReturnTouchdowns: 0, longestKickReturn: 65 },
            { teamName: '군위 피닉스', avgKickReturnYards: 22.8, kickReturnCount: 20, kickReturnYards: 456, kickReturnTouchdowns: 0, longestKickReturn: 58 },
            { teamName: '부산 그리폰즈', avgKickReturnYards: 21, kickReturnCount: 17, kickReturnYards: 357, kickReturnTouchdowns: 1, longestKickReturn: 77 },
            { teamName: '서울 골든이글스', avgKickReturnYards: 21, kickReturnCount: 22, kickReturnYards: 462, kickReturnTouchdowns: 0, longestKickReturn: 45 },
            { teamName: '서울 디펜더스', avgKickReturnYards: 20.5, kickReturnCount: 14, kickReturnYards: 287, kickReturnTouchdowns: 0, longestKickReturn: 42 },
            { teamName: '삼성 블루스톰', avgKickReturnYards: 19.8, kickReturnCount: 12, kickReturnYards: 237, kickReturnTouchdowns: 0, longestKickReturn: 35 },
          ],
          'punt return': [
            { teamName: '군위 피닉스', avgPuntReturnYards: 8.5, puntReturnCount: 12, puntReturnYards: 102, puntReturnTouchdowns: 1, longestPuntReturn: 45 },
            { teamName: '인천 라이노스', avgPuntReturnYards: 7.2, puntReturnCount: 10, puntReturnYards: 72, puntReturnTouchdowns: 0, longestPuntReturn: 38 },
            { teamName: '삼성 블루스톰', avgPuntReturnYards: 6.5, puntReturnCount: 8, puntReturnYards: 52, puntReturnTouchdowns: 0, longestPuntReturn: 25 },
            { teamName: '서울 바이킹스', avgPuntReturnYards: 5.8, puntReturnCount: 9, puntReturnYards: 52, puntReturnTouchdowns: 0, longestPuntReturn: 22 },
            { teamName: '서울 디펜더스', avgPuntReturnYards: 5.2, puntReturnCount: 7, puntReturnYards: 36, puntReturnTouchdowns: 0, longestPuntReturn: 18 },
            { teamName: '서울 골든이글스', avgPuntReturnYards: 4.4, puntReturnCount: 8, puntReturnYards: 35, puntReturnTouchdowns: 0, longestPuntReturn: 13 },
            { teamName: '부산 그리폰즈', avgPuntReturnYards: 1.7, puntReturnCount: 3, puntReturnYards: 5, puntReturnTouchdowns: 0, longestPuntReturn: 5 },
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
      else if (playType === '펀트리턴') data = teamData.special['punt return'] || [];
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