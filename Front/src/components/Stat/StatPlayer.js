import React, { useMemo, useState, useEffect, useRef } from 'react';
import { RxTriangleDown } from 'react-icons/rx';
import { FaChevronDown } from 'react-icons/fa';
import './StatPosition.css';

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
  '인터셉트',
  '필드골',
  '킥오프',
  '킥오프리턴',
  '펀트',
  '펀트리턴'
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
const STAT_COLUMNS = {
  '런': [
    { key: 'rushingYards', label: '러싱\n야드' },
    { key: 'rushingAttempts', label: '러싱\n시도 수' },
    { key: 'yardsPerCarry', label: '볼 캐리 당\n러싱 야드' },
    { key: 'rushingTouchdowns', label: '러싱\n터치다운' },
    { key: 'longestRush', label: '가장 긴\n러싱야드' },
  ],
  '패스': [
    { key: 'passingYards', label: '패싱\n야드' },
    { key: 'avgYardsPerAttempt', label: '패스 시도당\n패싱야드' },
    { key: 'completionPercentage', label: '패스\n성공률' },
    { key: 'passingAttempts', label: '패스\n시도' },
    { key: 'passingCompletions', label: '패스\n성공' },
    { key: 'passingTouchdowns', label: '패싱\n터치다운' },
    { key: 'interceptions', label: '인터셉트' },
    { key: 'longestPass', label: '가장\n긴 패스' },
  ],
  '리시빙': [
    { key: 'receptions', label: '패스\n캐치 수' },
    { key: 'receivingYards', label: '리시빙\n야드' },
    { key: 'yardsPerReception', label: '타겟 당\n리시빙 야드' },
    { key: 'receivingTouchdowns', label: '리시빙\n터치다운' },
    { key: 'longestReception', label: '가장 긴\n리시빙 야드' },
  ],
  '펌블': [
    { key: 'fumbles', label: '펌블' },
    { key: 'fumblesLost', label: '펌블\n턴오버' },
    { key: 'fumbleTouchdowns', label: '펌블\n터치다운' },
  ],
  '태클': [
    { key: 'tackles', label: '태클' },
    { key: 'sacks', label: '색' },
    { key: 'soloTackles', label: '솔로\n태클' },
    { key: 'assistTackles', label: '콤보\n태클' },
  ],
  '인터셉트': [
    { key: 'interceptions', label: '인터셉트' },
    { key: 'interceptionTouchdowns', label: '인터셉트\n터치다운' },
    { key: 'interceptionYards', label: '인터셉트\n야드' },
    { key: 'longestInterception', label: '가장 긴\n인터셉트 야드' },
  ],
  '필드골': [
    { key: 'fieldGoalPercentage', label: '필드골\n성공률' },
    { key: 'averageFieldGoalDistance', label: '평균\n필드골 거리' },
    { key: 'fieldGoalsMade', label: '필드골\n성공' },
    { key: 'fieldGoalsAttempted', label: '필드골\n시도' },
    { key: 'fieldGoalYards', label: '필드골\n야드' },
    { key: 'longestFieldGoal', label: '가장\n긴 필드골' },
  ],
  '킥오프': [
    { key: 'averageKickoffYards', label: '평균\n킥 야드' },
    { key: 'kickoffCount', label: '킥오프 수' },
    { key: 'kickoffYards', label: '킥오프\n야드' },
    { key: 'kickoffTouchdowns', label: '킥오프\n터치다운' },
    { key: 'longestKickoff', label: '가장\n긴 킥오프' },
  ],
  '킥오프리턴': [
    { key: 'averageKickReturnYards', label: '평균 킥\n리턴 야드' },
    { key: 'kickReturnCount', label: '킥 리턴 수' },
    { key: 'kickReturnYards', label: '킥 리턴\n야드' },
    { key: 'kickReturnTouchdowns', label: '킥 리턴\n터치다운' },
    { key: 'longestKickReturn', label: '가장 긴\n킥 리턴' },
  ],
  '펀트': [
    { key: 'averagePuntYards', label: '평균\n펀트 야드' },
    { key: 'puntCount', label: '펀트 수' },
    { key: 'puntYards', label: '펀트\n야드' },
    { key: 'puntTouchdowns', label: '펀트\n터치다운' },
    { key: 'longestPunt', label: '가장\n긴 펀트' },
  ],
  '펀트리턴': [
    { key: 'averagePuntReturnYards', label: '평균 펀트\n리턴 야드' },
    { key: 'puntReturnCount', label: '펀트\n리턴 수' },
    { key: 'puntReturnYards', label: '펀트\n리턴 야드' },
    { key: 'puntReturnTouchdowns', label: '펀트 리턴\n터치다운' },
    { key: 'longestPuntReturn', label: '가장 긴\n펀트리턴' },
  ],
};

// 각 유형별 기본 정렬 키
const PRIMARY_METRIC = {
  '런': 'rushingYards',
  '패스': 'passingYards',
  '리시빙': 'receivingYards',
  '펌블': 'fumbles',
  '태클': 'tackles',
  '인터셉트': 'interceptions',
  '필드골': 'fieldGoalPercentage',
  '킥오프': 'averageKickoffYards',
  '킥오프리턴': 'averageKickReturnYards',
  '펀트': 'averagePuntYards',
  '펀트리턴': 'averagePuntReturnYards',
};

const LOWER_IS_BETTER = new Set(['interceptions', 'fumbles', 'fumblesLost']);

/* ─────────────────────────  KAFA 크롤링된 서울 리그 데이터  ───────────────────────── */
const seoulPlayerData = {
  first: {
    '런': [
      { name: '김민겸', team: '한양대학교', rushingYards: 319, rushingAttempts: 62, yardsPerCarry: 5.1, rushingTouchdowns: 4, longestRush: 42 },
      { name: '이재성', team: '연세대학교', rushingYards: 299, rushingAttempts: 49, yardsPerCarry: 6.1, rushingTouchdowns: 3, longestRush: 35 },
      { name: '이준상', team: '연세대학교', rushingYards: 286, rushingAttempts: 48, yardsPerCarry: 6.0, rushingTouchdowns: 3, longestRush: 32 },
      { name: '차경훈', team: '한양대학교', rushingYards: 253, rushingAttempts: 67, yardsPerCarry: 3.8, rushingTouchdowns: 2, longestRush: 30 },
      { name: '이명환', team: '서울대학교', rushingYards: 169, rushingAttempts: 25, yardsPerCarry: 6.8, rushingTouchdowns: 1, longestRush: 39 },
      { name: '이찬희', team: '한양대학교', rushingYards: 169, rushingAttempts: 42, yardsPerCarry: 4.0, rushingTouchdowns: 0, longestRush: 17 },
      { name: '황승연', team: '연세대학교', rushingYards: 153, rushingAttempts: 41, yardsPerCarry: 3.7, rushingTouchdowns: 3, longestRush: 68 },
      { name: '이동규', team: '서울대학교', rushingYards: 145, rushingAttempts: 32, yardsPerCarry: 4.5, rushingTouchdowns: 0, longestRush: 18 },
      { name: '권순웅', team: '홍익대학교', rushingYards: 144, rushingAttempts: 21, yardsPerCarry: 6.9, rushingTouchdowns: 0, longestRush: 54 },
      { name: '김준호', team: '홍익대학교', rushingYards: 127, rushingAttempts: 29, yardsPerCarry: 4.4, rushingTouchdowns: 1, longestRush: 20 },
      { name: '김건원', team: '서울시립대학교', rushingYards: 107, rushingAttempts: 20, yardsPerCarry: 5.4, rushingTouchdowns: 1, longestRush: 65 },
      { name: '허우인', team: '건국대학교', rushingYards: 93, rushingAttempts: 14, yardsPerCarry: 6.6, rushingTouchdowns: 1, longestRush: 32 },
    ],
    '패스': [
      { name: '윤여진', team: '연세대학교', passingYards: 886, avgYardsPerAttempt: 6.5, completionPercentage: 47.8, passingAttempts: 136, passingCompletions: 65, passingTouchdowns: 17, interceptions: 8, longestPass: 80 },
      { name: '이찬희', team: '한양대학교', passingYards: 481, avgYardsPerAttempt: 4.7, completionPercentage: 43.1, passingAttempts: 102, passingCompletions: 44, passingTouchdowns: 7, interceptions: 9, longestPass: 57 },
      { name: '한상천', team: '서울시립대학교', passingYards: 204, avgYardsPerAttempt: 3.0, completionPercentage: 29.0, passingAttempts: 69, passingCompletions: 20, passingTouchdowns: 1, interceptions: 4, longestPass: 38 },
      { name: '최준', team: '서울대학교', passingYards: 127, avgYardsPerAttempt: 3.1, completionPercentage: 34.1, passingAttempts: 41, passingCompletions: 14, passingTouchdowns: 1, interceptions: 6, longestPass: 18 },
      { name: '박기석', team: '한국외국어대학교', passingYards: 108, avgYardsPerAttempt: 4.7, completionPercentage: 39.1, passingAttempts: 23, passingCompletions: 9, passingTouchdowns: 0, interceptions: 0, longestPass: 32 },
      { name: '이종혁', team: '서울대학교', passingYards: 99, avgYardsPerAttempt: 5.0, completionPercentage: 55.0, passingAttempts: 20, passingCompletions: 11, passingTouchdowns: 0, interceptions: 1, longestPass: 33 },
      { name: '우재윤', team: '국민대학교', passingYards: 92, avgYardsPerAttempt: 1.7, completionPercentage: 21.8, passingAttempts: 55, passingCompletions: 12, passingTouchdowns: 2, interceptions: 5, longestPass: 18 },
      { name: '김서진', team: '건국대학교', passingYards: 85, avgYardsPerAttempt: 2.7, completionPercentage: 54.8, passingAttempts: 31, passingCompletions: 17, passingTouchdowns: 0, interceptions: 3, longestPass: 24 },
      { name: '정택훈', team: '연세대학교', passingYards: 82, avgYardsPerAttempt: 5.5, completionPercentage: 40.0, passingAttempts: 15, passingCompletions: 6, passingTouchdowns: 1, interceptions: 0, longestPass: 32 },
      { name: '원재훈', team: '국민대학교', passingYards: 47, avgYardsPerAttempt: 3.1, completionPercentage: 26.7, passingAttempts: 15, passingCompletions: 4, passingTouchdowns: 0, interceptions: 0, longestPass: 22 },
      { name: '강승구', team: '서울시립대학교', passingYards: 26, avgYardsPerAttempt: 2.9, completionPercentage: 11.1, passingAttempts: 9, passingCompletions: 1, passingTouchdowns: 0, interceptions: 2, longestPass: 26 },
      { name: '권용욱', team: '홍익대학교', passingYards: 17, avgYardsPerAttempt: 0.7, completionPercentage: 46.2, passingAttempts: 26, passingCompletions: 12, passingTouchdowns: 1, interceptions: 1, longestPass: 15 },
    ],
    '리시빙': [
      { name: '최윤수', team: '연세대학교', receptions: 37, receivingYards: 676, yardsPerReception: 18.3, receivingTouchdowns: 13, longestReception: 80 },
      { name: '이건', team: '한양대학교', receptions: 11, receivingYards: 115, yardsPerReception: 10.5, receivingTouchdowns: 0, longestReception: 24 },
      { name: '권용준', team: '서울시립대학교', receptions: 10, receivingYards: 70, yardsPerReception: 7.0, receivingTouchdowns: 1, longestReception: 17 },
      { name: '이선우', team: '서울대학교', receptions: 10, receivingYards: 106, yardsPerReception: 10.6, receivingTouchdowns: 0, longestReception: 45 },
      { name: '임현성', team: '한양대학교', receptions: 9, receivingYards: 231, yardsPerReception: 25.7, receivingTouchdowns: 3, longestReception: 57 },
      { name: '남현석', team: '연세대학교', receptions: 7, receivingYards: 72, yardsPerReception: 10.3, receivingTouchdowns: 0, longestReception: 25 },
      { name: '소진규', team: '한양대학교', receptions: 7, receivingYards: 63, yardsPerReception: 9.0, receivingTouchdowns: 1, longestReception: 24 },
      { name: '이명환', team: '서울대학교', receptions: 7, receivingYards: 42, yardsPerReception: 6.0, receivingTouchdowns: 1, longestReception: 18 },
      { name: '양데이빗', team: '한양대학교', receptions: 6, receivingYards: 114, yardsPerReception: 19.0, receivingTouchdowns: 1, longestReception: 34 },
      { name: 'Sol Timothy', team: '연세대학교', receptions: 6, receivingYards: 73, yardsPerReception: 12.2, receivingTouchdowns: 1, longestReception: 20 },
      { name: '오성민', team: '한국외국어대학교', receptions: 6, receivingYards: 51, yardsPerReception: 8.5, receivingTouchdowns: 0, longestReception: 19 },
      { name: '권현수', team: '연세대학교', receptions: 6, receivingYards: 82, yardsPerReception: 13.7, receivingTouchdowns: 1, longestReception: 32 },
      { name: '박상원', team: '서울대학교', receptions: 5, receivingYards: 51, yardsPerReception: 10.2, receivingTouchdowns: 0, longestReception: 24 },
    ],
    '펌블': [
      { name: '윤여진', team: '연세대학교', fumbles: 10, fumblesLost: 4, fumbleTouchdowns: 0 },
      { name: '우재윤', team: '국민대학교', fumbles: 5, fumblesLost: 3, fumbleTouchdowns: 0 },
      { name: '이기쁨', team: '연세대학교', fumbles: 4, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '이찬희', team: '한양대학교', fumbles: 4, fumblesLost: 1, fumbleTouchdowns: 0 },
      { name: '김서진', team: '건국대학교', fumbles: 3, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '정택훈', team: '연세대학교', fumbles: 3, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '이준상', team: '연세대학교', fumbles: 3, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '김건원', team: '서울시립대학교', fumbles: 2, fumblesLost: 0, fumbleTouchdowns: 0 },
      { name: '이종혁', team: '서울대학교', fumbles: 2, fumblesLost: 1, fumbleTouchdowns: 0 },
      { name: '김민겸', team: '한양대학교', fumbles: 2, fumblesLost: 4, fumbleTouchdowns: 0 },
      { name: '원재훈', team: '국민대학교', fumbles: 2, fumblesLost: 1, fumbleTouchdowns: 0 },
    ],
    '태클': [
      { name: '김민겸', team: '한양대학교', tackles: 25, sacks: 0, soloTackles: 19, assistTackles: 6 },
      { name: '강미루', team: '연세대학교', tackles: 21, sacks: 2, soloTackles: 12, assistTackles: 7 },
      { name: '여언론', team: '한양대학교', tackles: 21, sacks: 2, soloTackles: 11, assistTackles: 8 },
      { name: '이대희', team: '연세대학교', tackles: 21, sacks: 4, soloTackles: 11, assistTackles: 6 },
      { name: '이현민', team: '연세대학교', tackles: 19, sacks: 1, soloTackles: 9, assistTackles: 9 },
      { name: '이재욱', team: '한양대학교', tackles: 19, sacks: 0, soloTackles: 15, assistTackles: 4 },
      { name: '차경훈', team: '한양대학교', tackles: 19, sacks: 0, soloTackles: 13, assistTackles: 6 },
      { name: '조성환', team: '연세대학교', tackles: 19, sacks: 0, soloTackles: 15, assistTackles: 4 },
      { name: 'Rintaro', team: '연세대학교', tackles: 17, sacks: 0, soloTackles: 11, assistTackles: 6 },
      { name: '남상범', team: '연세대학교', tackles: 16, sacks: 0, soloTackles: 11, assistTackles: 5 },
      { name: '김진혁', team: '서울대학교', tackles: 14, sacks: 7, soloTackles: 6, assistTackles: 1 },
      { name: '이기원', team: '한양대학교', tackles: 14, sacks: 1, soloTackles: 9, assistTackles: 4 },
      { name: '최영환', team: '국민대학교', tackles: 13, sacks: 0, soloTackles: 9, assistTackles: 4 },
      { name: 'Ryan Pham', team: '연세대학교', tackles: 12, sacks: 1, soloTackles: 6, assistTackles: 5 },
    ],
    '인터셉트': [
      { name: '양병욱', team: '서울시립대학교', interceptions: 5, interceptionTouchdowns: 1, interceptionYards: 106, longestInterception: 54 },
      { name: '김정헌', team: '서울대학교', interceptions: 4, interceptionTouchdowns: 0, interceptionYards: 27, longestInterception: 18 },
      { name: '정재연', team: '국민대학교', interceptions: 3, interceptionTouchdowns: 0, interceptionYards: 89, longestInterception: 43 },
      { name: '최승종', team: '연세대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 3, longestInterception: 3 },
      { name: '노건호', team: '한양대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 3, longestInterception: 3 },
      { name: '김민겸', team: '한양대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 26, longestInterception: 22 },
      { name: '서동주', team: '서울대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 10, longestInterception: 9 },
      { name: '윤석진', team: '서울시립대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 6, longestInterception: 6 },
      { name: '김성민', team: '서울대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 44, longestInterception: 25 },
      { name: '윤석주', team: '국민대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 0, longestInterception: 0 },
      { name: '유철', team: '연세대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 3, longestInterception: 3 },
      { name: '이현민', team: '연세대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 7, longestInterception: 7 },
    ],
    '필드골': [
      { name: '윤석진', team: '서울시립대학교', fieldGoalPercentage: 100.0, averageFieldGoalDistance: 14.0, fieldGoalsMade: 2, fieldGoalsAttempted: 2, fieldGoalYards: 28, longestFieldGoal: 28 },
      { name: '김진혁', team: '서울대학교', fieldGoalPercentage: 100.0, averageFieldGoalDistance: 25.0, fieldGoalsMade: 2, fieldGoalsAttempted: 2, fieldGoalYards: 50, longestFieldGoal: 27 },
      { name: '김대웅', team: '홍익대학교', fieldGoalPercentage: 100.0, averageFieldGoalDistance: 0.0, fieldGoalsMade: 1, fieldGoalsAttempted: 1, fieldGoalYards: 0, longestFieldGoal: 0 },
      { name: '공성욱', team: '건국대학교', fieldGoalPercentage: 100.0, averageFieldGoalDistance: 53.0, fieldGoalsMade: 1, fieldGoalsAttempted: 1, fieldGoalYards: 53, longestFieldGoal: 53 },
      { name: '이재성', team: '연세대학교', fieldGoalPercentage: 100.0, averageFieldGoalDistance: 11.0, fieldGoalsMade: 2, fieldGoalsAttempted: 2, fieldGoalYards: 22, longestFieldGoal: 22 },
      { name: '소진규', team: '한양대학교', fieldGoalPercentage: 75.0, averageFieldGoalDistance: 18.3, fieldGoalsMade: 3, fieldGoalsAttempted: 4, fieldGoalYards: 55, longestFieldGoal: 30 },
      { name: '최윤수', team: '연세대학교', fieldGoalPercentage: 66.7, averageFieldGoalDistance: 30.0, fieldGoalsMade: 2, fieldGoalsAttempted: 3, fieldGoalYards: 60, longestFieldGoal: 35 },
      { name: '이종혁', team: '서울대학교', fieldGoalPercentage: 50.0, averageFieldGoalDistance: 22.0, fieldGoalsMade: 1, fieldGoalsAttempted: 2, fieldGoalYards: 22, longestFieldGoal: 22 },
      { name: '오성민', team: '한국외국어대학교', fieldGoalPercentage: 50.0, averageFieldGoalDistance: 0.0, fieldGoalsMade: 2, fieldGoalsAttempted: 4, fieldGoalYards: 0, longestFieldGoal: 0 },
    ],
    '킥오프': [
      { name: '이종혁', team: '서울대학교', averageKickoffYards: 64.0, kickoffCount: 1, kickoffYards: 64, kickoffTouchdowns: 0, longestKickoff: 64 },
      { name: '윤석진', team: '서울시립대학교', averageKickoffYards: 60.0, kickoffCount: 1, kickoffYards: 60, kickoffTouchdowns: 0, longestKickoff: 60 },
      { name: '김진혁', team: '서울대학교', averageKickoffYards: 53.6, kickoffCount: 9, kickoffYards: 482, kickoffTouchdowns: 0, longestKickoff: 65 },
      { name: '장혜인', team: '서울시립대학교', averageKickoffYards: 48.3, kickoffCount: 4, kickoffYards: 193, kickoffTouchdowns: 0, longestKickoff: 65 },
      { name: '최윤수', team: '연세대학교', averageKickoffYards: 45.5, kickoffCount: 28, kickoffYards: 1274, kickoffTouchdowns: 0, longestKickoff: 75 },
      { name: '소진규', team: '한양대학교', averageKickoffYards: 44.1, kickoffCount: 22, kickoffYards: 971, kickoffTouchdowns: 1, longestKickoff: 65 },
      { name: '이찬희', team: '한양대학교', averageKickoffYards: 43.0, kickoffCount: 1, kickoffYards: 43, kickoffTouchdowns: 0, longestKickoff: 43 },
      { name: '원재훈', team: '국민대학교', averageKickoffYards: 39.3, kickoffCount: 3, kickoffYards: 118, kickoffTouchdowns: 0, longestKickoff: 65 },
      { name: '황현석', team: '건국대학교', averageKickoffYards: 35.7, kickoffCount: 3, kickoffYards: 107, kickoffTouchdowns: 0, longestKickoff: 54 },
    ],
    '킥오프리턴': [
      { name: '이선우', team: '서울대학교', averageKickReturnYards: 57.5, kickReturnCount: 2, kickReturnYards: 107, kickReturnTouchdowns: 1, longestKickReturn: 88 },
      { name: '황승연', team: '연세대학교', averageKickReturnYards: 28.0, kickReturnCount: 1, kickReturnYards: 30, kickReturnTouchdowns: 0, longestKickReturn: 28 },
      { name: '조성환', team: '연세대학교', averageKickReturnYards: 28.0, kickReturnCount: 3, kickReturnYards: 181, kickReturnTouchdowns: 0, longestKickReturn: 30 },
      { name: '박상원', team: '서울대학교', averageKickReturnYards: 26.5, kickReturnCount: 2, kickReturnYards: 110, kickReturnTouchdowns: 0, longestKickReturn: 31 },
      { name: '소진규', team: '한양대학교', averageKickReturnYards: 21.5, kickReturnCount: 8, kickReturnYards: 219, kickReturnTouchdowns: 0, longestKickReturn: 40 },
      { name: '이원호', team: '서울시립대학교', averageKickReturnYards: 18.0, kickReturnCount: 2, kickReturnYards: 115, kickReturnTouchdowns: 0, longestKickReturn: 25 },
      { name: '이준상', team: '연세대학교', averageKickReturnYards: 18.0, kickReturnCount: 2, kickReturnYards: 57, kickReturnTouchdowns: 0, longestKickReturn: 22 },
      { name: '정재연', team: '국민대학교', averageKickReturnYards: 18.3, kickReturnCount: 3, kickReturnYards: 125, kickReturnTouchdowns: 0, longestKickReturn: 30 },
      { name: '김세윤', team: '홍익대학교', averageKickReturnYards: 19.0, kickReturnCount: 1, kickReturnYards: 0, kickReturnTouchdowns: 0, longestKickReturn: 19 },
    ],
    '펀트': [
      { name: '신재영', team: '연세대학교', puntCount: 3, puntYards: 146, averagePuntYards: 48.7, longestPunt: 57, puntTouchdowns: 0 },
      { name: '이종혁', team: '서울대학교', puntCount: 2, puntYards: 93, averagePuntYards: 46.5, longestPunt: 47, puntTouchdowns: 0 },
      { name: '공성욱', team: '건국대학교', puntCount: 6, puntYards: 239, averagePuntYards: 39.8, longestPunt: 64, puntTouchdowns: 0 },
      { name: '엄홍재', team: '서강대학교', puntCount: 13, puntYards: 486, averagePuntYards: 37.4, longestPunt: 53, puntTouchdowns: 0 },
      { name: '박도현', team: '동국대학교', puntCount: 9, puntYards: 335, averagePuntYards: 37.2, longestPunt: 54, puntTouchdowns: 0 },
      { name: '장혜인', team: '서울시립대학교', puntCount: 19, puntYards: 659, averagePuntYards: 34.7, longestPunt: 52, puntTouchdowns: 0 },
      { name: '여언론', team: '한양대학교', puntCount: 8, puntYards: 276, averagePuntYards: 34.5, longestPunt: 54, puntTouchdowns: 0 },
      { name: '원재훈', team: '국민대학교', puntCount: 5, puntYards: 171, averagePuntYards: 34.2, longestPunt: 45, puntTouchdowns: 0 },
      { name: '소진규', team: '한양대학교', puntCount: 9, puntYards: 303, averagePuntYards: 33.7, longestPunt: 52, puntTouchdowns: 0 },
      { name: '김진혁', team: '서울대학교', puntCount: 6, puntYards: 195, averagePuntYards: 32.5, longestPunt: 45, puntTouchdowns: 0 },
      { name: '배민수', team: '중앙대학교', puntCount: 6, puntYards: 178, averagePuntYards: 29.7, longestPunt: 40, puntTouchdowns: 0 },
      { name: '김대웅', team: '홍익대학교', puntCount: 11, puntYards: 312, averagePuntYards: 28.4, longestPunt: 48, puntTouchdowns: 0 }
    ],
    '펀트리턴': [
      { name: '동방상원', team: '동아대학교', puntReturnCount: 1, puntReturnYards: 54, averagePuntReturnYards: 54.0, longestPuntReturn: 54, puntReturnTouchdowns: 0 },
      { name: '김승원', team: '숭실대학교', puntReturnCount: 1, puntReturnYards: 33, averagePuntReturnYards: 33.0, longestPuntReturn: 33, puntReturnTouchdowns: 0 },
      { name: '문태웅', team: '동국대학교', puntReturnCount: 1, puntReturnYards: 31, averagePuntReturnYards: 31.0, longestPuntReturn: 31, puntReturnTouchdowns: 0 },
      { name: '유동윤', team: '경일대학교', puntReturnCount: 7, puntReturnYards: 184, averagePuntReturnYards: 26.3, longestPuntReturn: 58, puntReturnTouchdowns: 1 },
      { name: '김정헌', team: '서울대학교', puntReturnCount: 1, puntReturnYards: 25, averagePuntReturnYards: 25.0, longestPuntReturn: 25, puntReturnTouchdowns: 0 },
      { name: '전민우', team: '경북대학교', puntReturnCount: 1, puntReturnYards: 25, averagePuntReturnYards: 25.0, longestPuntReturn: 25, puntReturnTouchdowns: 0 },
      { name: '권용준', team: '서울시립대학교', puntReturnCount: 2, puntReturnYards: 42, averagePuntReturnYards: 21.0, longestPuntReturn: 30, puntReturnTouchdowns: 0 },
      { name: '정성준', team: '한국해양대학교', puntReturnCount: 1, puntReturnYards: 20, averagePuntReturnYards: 20.0, longestPuntReturn: 20, puntReturnTouchdowns: 1 },
      { name: '손주익', team: '서울시립대학교', puntReturnCount: 1, puntReturnYards: 19, averagePuntReturnYards: 19.0, longestPuntReturn: 19, puntReturnTouchdowns: 0 },
      { name: '이우진', team: '홍익대학교', puntReturnCount: 1, puntReturnYards: 18, averagePuntReturnYards: 18.0, longestPuntReturn: 18, puntReturnTouchdowns: 0 },
      { name: '배병찬', team: '성균관대학교', puntReturnCount: 1, puntReturnYards: 18, averagePuntReturnYards: 18.0, longestPuntReturn: 18, puntReturnTouchdowns: 0 },
      { name: '임지민', team: '동의대학교', puntReturnCount: 1, puntReturnYards: 18, averagePuntReturnYards: 18.0, longestPuntReturn: 18, puntReturnTouchdowns: 0 },
      { name: '이상현', team: '단국대학교', puntReturnCount: 1, puntReturnYards: 17, averagePuntReturnYards: 17.0, longestPuntReturn: 17, puntReturnTouchdowns: 0 },
      { name: '허우인', team: '건국대학교', puntReturnCount: 2, puntReturnYards: 30, averagePuntReturnYards: 15.0, longestPuntReturn: 30, puntReturnTouchdowns: 0 },
      { name: '이민준', team: '영남대학교', puntReturnCount: 1, puntReturnYards: 15, averagePuntReturnYards: 15.0, longestPuntReturn: 15, puntReturnTouchdowns: 0 },
      { name: '최준환', team: '금오공과대학교', puntReturnCount: 1, puntReturnYards: 14, averagePuntReturnYards: 14.0, longestPuntReturn: 14, puntReturnTouchdowns: 0 },
      { name: '이무진', team: '대구가톨릭대학교', puntReturnCount: 1, puntReturnYards: 13, averagePuntReturnYards: 13.0, longestPuntReturn: 13, puntReturnTouchdowns: 0 },
      { name: '조다빈', team: '성균관대학교', puntReturnCount: 7, puntReturnYards: 85, averagePuntReturnYards: 12.1, longestPuntReturn: 50, puntReturnTouchdowns: 0 },
      { name: '이예승', team: '부산외국어대학교', puntReturnCount: 1, puntReturnYards: 12, averagePuntReturnYards: 12.0, longestPuntReturn: 12, puntReturnTouchdowns: 0 },
      { name: '조현영', team: '경북대학교', puntReturnCount: 4, puntReturnYards: 47, averagePuntReturnYards: 11.8, longestPuntReturn: 38, puntReturnTouchdowns: 0 },
      { name: '오승욱', team: '숭실대학교', puntReturnCount: 2, puntReturnYards: 23, averagePuntReturnYards: 11.5, longestPuntReturn: 15, puntReturnTouchdowns: 0 },
      { name: '정종은', team: '동국대학교', puntReturnCount: 2, puntReturnYards: 21, averagePuntReturnYards: 10.5, longestPuntReturn: 21, puntReturnTouchdowns: 0 },
      { name: '김강민', team: '경북대학교', puntReturnCount: 3, puntReturnYards: 30, averagePuntReturnYards: 10.0, longestPuntReturn: 17, puntReturnTouchdowns: 0 },
      { name: '박온', team: '성균관대학교', puntReturnCount: 1, puntReturnYards: 10, averagePuntReturnYards: 10.0, longestPuntReturn: 10, puntReturnTouchdowns: 0 },
      { name: '정재연', team: '국민대학교', puntReturnCount: 1, puntReturnYards: 10, averagePuntReturnYards: 10.0, longestPuntReturn: 10, puntReturnTouchdowns: 0 }
    ],
  },
  second: {
    '런': [
      { name: '김태현', team: '고려대학교', rushingYards: 427, rushingAttempts: 61, yardsPerCarry: 7.0, rushingTouchdowns: 4, longestRush: 59 },
      { name: '김도훈', team: '고려대학교', rushingYards: 248, rushingAttempts: 34, yardsPerCarry: 7.3, rushingTouchdowns: 2, longestRush: 35 },
      { name: '장우영', team: '숭실대학교', rushingYards: 169, rushingAttempts: 46, yardsPerCarry: 3.7, rushingTouchdowns: 1, longestRush: 28 },
      { name: '이주헌', team: '동국대학교', rushingYards: 148, rushingAttempts: 8, yardsPerCarry: 18.5, rushingTouchdowns: 1, longestRush: 96 },
      { name: '배수환', team: '중앙대학교', rushingYards: 105, rushingAttempts: 23, yardsPerCarry: 4.6, rushingTouchdowns: 1, longestRush: 21 },
      { name: '이재승', team: '중앙대학교', rushingYards: 100, rushingAttempts: 12, yardsPerCarry: 8.3, rushingTouchdowns: 0, longestRush: 47 },
    ],
    '패스': [
      { name: '문찬호', team: '고려대학교', passingYards: 527, avgYardsPerAttempt: 5.4, completionPercentage: 59.2, passingAttempts: 98, passingCompletions: 58, passingTouchdowns: 6, interceptions: 2, longestPass: 37 },
      { name: '백운성', team: '서강대학교', passingYards: 292, avgYardsPerAttempt: 5.1, completionPercentage: 31.6, passingAttempts: 57, passingCompletions: 18, passingTouchdowns: 2, interceptions: 4, longestPass: 72 },
      { name: '최은찬', team: '동국대학교', passingYards: 215, avgYardsPerAttempt: 2.6, completionPercentage: 43.9, passingAttempts: 82, passingCompletions: 36, passingTouchdowns: 0, interceptions: 6, longestPass: 38 },
      { name: '김도윤', team: '숭실대학교', passingYards: 148, avgYardsPerAttempt: 2.4, completionPercentage: 52.5, passingAttempts: 61, passingCompletions: 32, passingTouchdowns: 5, interceptions: 3, longestPass: 33 },
      { name: '손혁빈', team: '경희대학교', passingYards: 56, avgYardsPerAttempt: 2.7, completionPercentage: 23.8, passingAttempts: 21, passingCompletions: 5, passingTouchdowns: 2, interceptions: 4, longestPass: 31 },
      { name: '배수환', team: '중앙대학교', passingYards: 41, avgYardsPerAttempt: 2.4, completionPercentage: 29.4, passingAttempts: 17, passingCompletions: 5, passingTouchdowns: 0, interceptions: 4, longestPass: 10 },
      { name: '김제민', team: '중앙대학교', passingYards: 20, avgYardsPerAttempt: 3.3, completionPercentage: 33.3, passingAttempts: 6, passingCompletions: 2, passingTouchdowns: 0, interceptions: 0, longestPass: 12 },
      { name: '이재호', team: '동국대학교', passingYards: 10, avgYardsPerAttempt: 0.9, completionPercentage: 27.3, passingAttempts: 11, passingCompletions: 3, passingTouchdowns: 0, interceptions: 2, longestPass: 15 },
    ],
    '리시빙': [
      { name: '윤상준', team: '고려대학교', receptions: 19, receivingYards: 180, yardsPerReception: 9.5, receivingTouchdowns: 2, longestReception: 33 },
      { name: '김태현', team: '고려대학교', receptions: 11, receivingYards: 85, yardsPerReception: 7.7, receivingTouchdowns: 1, longestReception: 33 },
      { name: '정종은', team: '동국대학교', receptions: 10, receivingYards: 58, yardsPerReception: 5.8, receivingTouchdowns: 0, longestReception: 21 },
      { name: '문영민', team: '동국대학교', receptions: 9, receivingYards: 88, yardsPerReception: 9.8, receivingTouchdowns: 0, longestReception: 21 },
      { name: '정민영', team: '고려대학교', receptions: 9, receivingYards: 89, yardsPerReception: 9.9, receivingTouchdowns: 2, longestReception: 26 },
      { name: '김승원', team: '숭실대학교', receptions: 9, receivingYards: 70, yardsPerReception: 7.8, receivingTouchdowns: 0, longestReception: 18 },
      { name: '김록겸', team: '고려대학교', receptions: 7, receivingYards: 74, yardsPerReception: 10.6, receivingTouchdowns: 0, longestReception: 33 },
      { name: '김도훈', team: '고려대학교', receptions: 6, receivingYards: 39, yardsPerReception: 6.5, receivingTouchdowns: 0, longestReception: 14 },
      { name: '오승욱', team: '숭실대학교', receptions: 6, receivingYards: 101, yardsPerReception: 16.8, receivingTouchdowns: 2, longestReception: 81 },
      { name: '정명우', team: '숭실대학교', receptions: 6, receivingYards: 51, yardsPerReception: 8.5, receivingTouchdowns: 0, longestReception: 22 },
    ],
    '펌블': [
      { name: '문찬호', team: '고려대학교', fumbles: 4, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '최수종', team: '고려대학교', fumbles: 4, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '김도윤', team: '숭실대학교', fumbles: 4, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '배수환', team: '중앙대학교', fumbles: 4, fumblesLost: 0, fumbleTouchdowns: 0 },
      { name: '이재승', team: '중앙대학교', fumbles: 3, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '장우영', team: '숭실대학교', fumbles: 3, fumblesLost: 1, fumbleTouchdowns: 0 },
      { name: '양선빈', team: '동국대학교', fumbles: 2, fumblesLost: 0, fumbleTouchdowns: 0 },
      { name: '김태우', team: '동국대학교', fumbles: 2, fumblesLost: 0, fumbleTouchdowns: 0 },
      { name: '이재호', team: '동국대학교', fumbles: 2, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '최은찬', team: '동국대학교', fumbles: 2, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '백운성', team: '서강대학교', fumbles: 2, fumblesLost: 1, fumbleTouchdowns: 0 },
    ],
    '태클': [
      { name: '김민겸', team: '한양대학교', tackles: 2, sacks: 2, soloTackles: 4, assistTackles: 0 },
      { name: '이재욱', team: '한양대학교', tackles: 0, sacks: 1, soloTackles: 0, assistTackles: 0 },
      { name: '노건호', team: '한양대학교', tackles: 0, sacks: 2, soloTackles: 0, assistTackles: 0 },
      { name: '이재혁', team: '서강대학교', tackles: 0, sacks: 4, soloTackles: 0, assistTackles: 0 },
      { name: '엄홍재', team: '서강대학교', tackles: 0, sacks: 3, soloTackles: 0, assistTackles: 0 },
      { name: '박서준', team: '서강대학교', tackles: 0, sacks: 2, soloTackles: 0, assistTackles: 0 },
    ],
    '인터셉트': [
      { name: '이재혁', team: '서강대학교', interceptions: 4, interceptionTouchdowns: 0, interceptionYards: 4, longestInterception: 2 },
      { name: '윤상준', team: '고려대학교', interceptions: 3, interceptionTouchdowns: 0, interceptionYards: 20, longestInterception: 20 },
      { name: '엄홍재', team: '서강대학교', interceptions: 3, interceptionTouchdowns: 1, interceptionYards: 38, longestInterception: 25 },
      { name: '오승욱', team: '숭실대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 32, longestInterception: 32 },
      { name: '김태우', team: '동국대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 13, longestInterception: 13 },
      { name: '곽효석', team: '중앙대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 2, longestInterception: 2 },
      { name: '박서준', team: '서강대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 5, longestInterception: 5 },
      { name: '변예준', team: '중앙대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 0, longestInterception: 0 },
      { name: '이재승', team: '중앙대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 18, longestInterception: 18 },
      { name: '윤영균', team: '숭실대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 8, longestInterception: 8 },
      { name: '문태웅', team: '동국대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 20, longestInterception: 20 },
      { name: '반태우', team: '경희대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 13, longestInterception: 13 },
    ],
    '필드골': [
      { name: '최수종', team: '고려대학교', fieldGoalPercentage: 20.0, averageFieldGoalDistance: 0, fieldGoalsMade: 1, fieldGoalsAttempted: 5, fieldGoalYards: 0, longestFieldGoal: 0 },
      { name: '권준호', team: '경희대학교', fieldGoalPercentage: 0.0, averageFieldGoalDistance: 0, fieldGoalsMade: 0, fieldGoalsAttempted: 2, fieldGoalYards: 0, longestFieldGoal: 0 },
    ],
    '킥오프': [
      { name: '데이터 없음', team: '동국대학교', averageKickoffYards: 0, kickoffCount: 0, kickoffYards: 0, kickoffTouchdowns: 0, longestKickoff: 0 },
    ],
    '킥오프리턴': [
      { name: '민경훈', team: '동국대학교', averageKickReturnYards: 47.0, kickReturnCount: 1, kickReturnYards: 47, kickReturnTouchdowns: 0, longestKickReturn: 29 },
      { name: '양선빈', team: '동국대학교', averageKickReturnYards: 46.0, kickReturnCount: 1, kickReturnYards: 46, kickReturnTouchdowns: 0, longestKickReturn: 20 },
      { name: '공덕현', team: '중앙대학교', averageKickReturnYards: 37.7, kickReturnCount: 3, kickReturnYards: 113, kickReturnTouchdowns: 0, longestKickReturn: 23 },
      { name: '변예준', team: '중앙대학교', averageKickReturnYards: 25.0, kickReturnCount: 1, kickReturnYards: 25, kickReturnTouchdowns: 0, longestKickReturn: 20 },
    ],
    '펀트': [
      { name: '이찬유', team: '한신대학교', puntCount: 10, puntYards: 391, averagePuntYards: 39.1, longestPunt: 53, puntTouchdowns: 0 },
      { name: '권준호', team: '경희대학교', puntCount: 7, puntYards: 244, averagePuntYards: 34.9, longestPunt: 57, puntTouchdowns: 0 }
    ],
    '펀트리턴': [
      { name: '이상현', team: '단국대학교', puntReturnCount: 1, puntReturnYards: 17, averagePuntReturnYards: 17.0, longestPuntReturn: 17, puntReturnTouchdowns: 0 },
      { name: '오승욱', team: '숭실대학교', puntReturnCount: 2, puntReturnYards: 23, averagePuntReturnYards: 11.5, longestPuntReturn: 15, puntReturnTouchdowns: 0 },
      { name: '이정환', team: '고려대학교', puntReturnCount: 3, puntReturnYards: 15, averagePuntReturnYards: 5.0, longestPuntReturn: 12, puntReturnTouchdowns: 0 },
      { name: '엄홍재', team: '서강대학교', puntReturnCount: 1, puntReturnYards: 0, averagePuntReturnYards: 0.0, longestPuntReturn: 0, puntReturnTouchdowns: 0 },
      { name: '신재용', team: '중앙대학교', puntReturnCount: 1, puntReturnYards: 0, averagePuntReturnYards: 0.0, longestPuntReturn: 0, puntReturnTouchdowns: 0 },
      { name: '김두호', team: '경희대학교', puntReturnCount: 1, puntReturnYards: 0, averagePuntReturnYards: 0.0, longestPuntReturn: 0, puntReturnTouchdowns: 0 }
    ],
  },
};

/* ─────────────────────────  경기강원 리그 데이터  ───────────────────────── */
const gyeonggiPlayerData = {
  first: {
    '런': [
      { name: '이기쁨', team: '강원대학교', rushingYards: 232, rushingAttempts: 30, yardsPerCarry: 7.7, rushingTouchdowns: 2, longestRush: 41 },
      { name: '이민석', team: '강원대학교', rushingYards: 136, rushingAttempts: 27, yardsPerCarry: 5.0, rushingTouchdowns: 2, longestRush: 22 },
      { name: '김하은', team: '성균관대학교', rushingYards: 99, rushingAttempts: 32, yardsPerCarry: 3.1, rushingTouchdowns: 3, longestRush: 38 },
      { name: '유현석', team: '강원대학교', rushingYards: 95, rushingAttempts: 32, yardsPerCarry: 3.0, rushingTouchdowns: 0, longestRush: 16 },
      { name: '장우혁', team: '인하대학교', rushingYards: 93, rushingAttempts: 6, yardsPerCarry: 15.5, rushingTouchdowns: 0, longestRush: 80 },
    ],
    '패스': [
      { name: '장혜성', team: '성균관대학교', passingYards: 366, avgYardsPerAttempt: 4.5, completionPercentage: 29.3, passingAttempts: 82, passingCompletions: 24, passingTouchdowns: 5, interceptions: 3, longestPass: 59 },
      { name: '신재윤', team: '인하대학교', passingYards: 229, avgYardsPerAttempt: 4.3, completionPercentage: 43.4, passingAttempts: 53, passingCompletions: 23, passingTouchdowns: 1, interceptions: 6, longestPass: 37 },
      { name: '변지성', team: '성균관대학교', passingYards: 176, avgYardsPerAttempt: 3.2, completionPercentage: 27.3, passingAttempts: 55, passingCompletions: 15, passingTouchdowns: 0, interceptions: 6, longestPass: 38 },
      { name: '이민석', team: '강원대학교', passingYards: 147, avgYardsPerAttempt: 7.0, completionPercentage: 47.6, passingAttempts: 21, passingCompletions: 10, passingTouchdowns: 0, interceptions: 1, longestPass: 33 },
      { name: '송지헌', team: '단국대학교', passingYards: 80, avgYardsPerAttempt: 4.0, completionPercentage: 30.0, passingAttempts: 20, passingCompletions: 6, passingTouchdowns: 1, interceptions: 3, longestPass: 80 },
      { name: '한시훈', team: '단국대학교', passingYards: 74, avgYardsPerAttempt: 5.7, completionPercentage: 23.1, passingAttempts: 13, passingCompletions: 3, passingTouchdowns: 2, interceptions: 3, longestPass: 28 },
      { name: '이기쁨', team: '강원대학교', passingYards: 50, avgYardsPerAttempt: 2.4, completionPercentage: 38.1, passingAttempts: 21, passingCompletions: 8, passingTouchdowns: 0, interceptions: 1, longestPass: 21 },
    ], '리시빙': [
      { name: '박온', team: '성균관대학교', receptions: 13, receivingYards: 193, yardsPerReception: 14.8, receivingTouchdowns: 1, longestReception: 38 },
      { name: '박지훈', team: '강원대학교', receptions: 11, receivingYards: 101, yardsPerReception: 9.2, receivingTouchdowns: 0, longestReception: 30 },
      { name: '배성민', team: '성균관대학교', receptions: 8, receivingYards: 105, yardsPerReception: 13.1, receivingTouchdowns: 1, longestReception: 46 },
      { name: '이한재', team: '성균관대학교', receptions: 7, receivingYards: 73, yardsPerReception: 10.4, receivingTouchdowns: 0, longestReception: 33 },
      { name: '이승재', team: '인하대학교', receptions: 7, receivingYards: 16, yardsPerReception: 2.3, receivingTouchdowns: 1, longestReception: 12 },
      { name: '정재성', team: '성균관대학교', receptions: 6, receivingYards: 81, yardsPerReception: 13.5, receivingTouchdowns: 1, longestReception: 26 },
    ], '펌블': [
      { name: '이기쁨', team: '강원대학교', fumbles: 4, fumblesLost: 2, fumbleReturnYards: 0 },
      { name: '장혜성', team: '성균관대학교', fumbles: 3, fumblesLost: 1, fumbleReturnYards: 0 }
    ], '태클': [
      { name: '배성민', team: '성균관대학교', totalTackles: 45, soloTackles: 25, assistedTackles: 20, tacklesForLoss: 8, tackles1stDown: 12 },
      { name: '박온', team: '성균관대학교', totalTackles: 38, soloTackles: 22, assistedTackles: 16, tacklesForLoss: 5, tackles1stDown: 9 }
    ], '인터셉션': [
      { name: '이한재', team: '성균관대학교', interceptions: 4, interceptionYards: 52, interceptionTouchdowns: 0, longestInterception: 28 },
      { name: '박지훈', team: '강원대학교', interceptions: 3, interceptionYards: 41, interceptionTouchdowns: 1, longestInterception: 35 }
    ], 
    '필드골': [
      { name: '김하은', team: '성균관대학교', fieldGoalsMade: 6, fieldGoalAttempts: 9, fieldGoalPercentage: 66.7, longestFieldGoal: 42, fieldGoals19Yards: '0/0', fieldGoals29Yards: '3/4', fieldGoals39Yards: '2/3', fieldGoals49Yards: '1/2', fieldGoals50Yards: '0/0' }
    ], '킥오프': [
      { name: '유현석', team: '강원대학교', kickoffs: 38, kickoffYards: 2394, touchbacks: 18, kickoffAverage: 63.0, onsidesAttempted: 1, onsidesSuccessful: 0, kickoffOutOfBounds: 2 }
    ], '킥오프리턴': [
      { name: '장우혁', team: '인하대학교', kickoffReturns: 8, kickoffReturnYards: 224, kickoffReturnTouchdowns: 1, longestKickoffReturn: 80, kickoffReturnAverage: 28.0 }
    ], '펀트': [
      { name: '이기쁨', team: '강원대학교', puntCount: 5, puntYards: 192, averagePuntYards: 38.4, longestPunt: 45, puntTouchdowns: 0 },
      { name: '이민석', team: '강원대학교', puntCount: 8, puntYards: 268, averagePuntYards: 33.5, longestPunt: 46, puntTouchdowns: 0 },
      { name: '장용준', team: '인하대학교', puntCount: 7, puntYards: 208, averagePuntYards: 29.7, longestPunt: 42, puntTouchdowns: 0 },
      { name: '이동건', team: '강원대학교', puntCount: 3, puntYards: 85, averagePuntYards: 28.3, longestPunt: 42, puntTouchdowns: 0 }
    ], '펀트리턴': [
      { name: '배병찬', team: '성균관대학교', puntReturnCount: 1, puntReturnYards: 18, averagePuntReturnYards: 18.0, longestPuntReturn: 18, puntReturnTouchdowns: 0 },
      { name: '조다빈', team: '성균관대학교', puntReturnCount: 7, puntReturnYards: 85, averagePuntReturnYards: 12.1, longestPuntReturn: 50, puntReturnTouchdowns: 0 },
      { name: '박온', team: '성균관대학교', puntReturnCount: 1, puntReturnYards: 10, averagePuntReturnYards: 10.0, longestPuntReturn: 10, puntReturnTouchdowns: 0 }
    ],
  },
  second: {
    '런': [
      { name: '김상구', team: '용인대학교', rushingYards: 127, rushingAttempts: 6, yardsPerCarry: 21.2, rushingTouchdowns: 1, longestRush: 63 },
      { name: '안태현', team: '용인대학교', rushingYards: 94, rushingAttempts: 19, yardsPerCarry: 4.9, rushingTouchdowns: 0, longestRush: 16 },
    ],
    '패스': [
      { name: '이수민', team: '용인대학교', passingYards: 330, avgYardsPerAttempt: 7.9, completionPercentage: 47.6, passingAttempts: 42, passingCompletions: 20, passingTouchdowns: 7, interceptions: 3, longestPass: 72 },
      { name: '임규성', team: '카이스트', passingYards: 31, avgYardsPerAttempt: 2.8, completionPercentage: 36.4, passingAttempts: 11, passingCompletions: 4, passingTouchdowns: 1, interceptions: 1, longestPass: 22 },
    ], '리시빙': [], '펌블': [
      { name: '정태영', team: '아주대학교', fumbles: 5, fumblesLost: 2, fumbleReturnYards: 0 }
    ], '태클': [
      { name: '이경동', team: '아주대학교', totalTackles: 32, soloTackles: 18, assistedTackles: 14, tacklesForLoss: 4, tackles1stDown: 8 }
    ], '인터셉션': [
      { name: '정태영', team: '아주대학교', interceptions: 6, interceptionYards: 73, interceptionTouchdowns: 1, longestInterception: 45 }
    ], 
    '필드골': [
      { name: '최준형', team: '경희대학교', fieldGoalsMade: 8, fieldGoalAttempts: 12, fieldGoalPercentage: 66.7, longestFieldGoal: 35, fieldGoals19Yards: '0/0', fieldGoals29Yards: '5/7', fieldGoals39Yards: '2/3', fieldGoals49Yards: '1/2', fieldGoals50Yards: '0/0' }
    ], '킥오프': [
      { name: '최준형', team: '경희대학교', kickoffs: 45, kickoffYards: 2835, touchbacks: 22, kickoffAverage: 63.0, onsidesAttempted: 2, onsidesSuccessful: 0, kickoffOutOfBounds: 1 }
    ], '킥오프리턴': [
      { name: '정태영', team: '아주대학교', kickoffReturns: 12, kickoffReturnYards: 312, kickoffReturnTouchdowns: 1, longestKickoffReturn: 95, kickoffReturnAverage: 26.0 }
    ], '펀트': [
      { name: '박현기', team: '카이스트', puntCount: 4, puntYards: 154, averagePuntYards: 38.5, longestPunt: 43, puntTouchdowns: 0 },
      { name: '김찬희', team: '용인대학교', puntCount: 6, puntYards: 195, averagePuntYards: 32.5, longestPunt: 45, puntTouchdowns: 0 },
      { name: '엄정훈', team: '카이스트', puntCount: 1, puntYards: 34, averagePuntYards: 34.0, longestPunt: 34, puntTouchdowns: 0 },
      { name: '송영민', team: '카이스트', puntCount: 1, puntYards: 32, averagePuntYards: 32.0, longestPunt: 32, puntTouchdowns: 0 }
    ], '펀트리턴': [],
  },
};

/* ─────────────────────────  대구경북 리그 데이터  ───────────────────────── */
const daeguPlayerData = {
  first: {
    '런': [
      { name: '이효원', team: '경북대학교', rushingYards: 383, rushingAttempts: 57, yardsPerCarry: 6.7, rushingTouchdowns: 1, longestRush: 85 },
      { name: '변지욱', team: '경일대학교', rushingYards: 382, rushingAttempts: 63, yardsPerCarry: 6.1, rushingTouchdowns: 3, longestRush: 32 },
      { name: '고승주', team: '경북대학교', rushingYards: 134, rushingAttempts: 25, yardsPerCarry: 5.4, rushingTouchdowns: 3, longestRush: 37 },
      { name: '구도현', team: '경북대학교', rushingYards: 90, rushingAttempts: 25, yardsPerCarry: 3.6, rushingTouchdowns: 0, longestRush: 17 },
    ],
    '패스': [
      { name: '고승주', team: '경북대학교', passingYards: 738, avgYardsPerAttempt: 5.2, completionPercentage: 53.8, passingAttempts: 143, passingCompletions: 77, passingTouchdowns: 12, interceptions: 5, longestPass: 90 },
      { name: '박병민', team: '경일대학교', passingYards: 246, avgYardsPerAttempt: 4.4, completionPercentage: 39.3, passingAttempts: 56, passingCompletions: 22, passingTouchdowns: 4, interceptions: 6, longestPass: 47 },
      { name: '김민우', team: '대구한의대학교', passingYards: 176, avgYardsPerAttempt: 2.7, completionPercentage: 36.9, passingAttempts: 65, passingCompletions: 24, passingTouchdowns: 1, interceptions: 1, longestPass: 17 },
      { name: '이주람', team: '한동대학교', passingYards: 171, avgYardsPerAttempt: 4.8, completionPercentage: 36.1, passingAttempts: 36, passingCompletions: 13, passingTouchdowns: 1, interceptions: 6, longestPass: 30 },
      { name: '이무진', team: '대구가톨릭대학교', passingYards: 66, avgYardsPerAttempt: 4.1, completionPercentage: 56.3, passingAttempts: 16, passingCompletions: 9, passingTouchdowns: 0, interceptions: 1, longestPass: 16 },
      { name: '유동윤', team: '경일대학교', passingYards: 58, avgYardsPerAttempt: 19.3, completionPercentage: 33.3, passingAttempts: 3, passingCompletions: 1, passingTouchdowns: 1, interceptions: 2, longestPass: 58 },
      { name: '김민석', team: '경일대학교', passingYards: 10, avgYardsPerAttempt: 10.0, completionPercentage: 100.0, passingAttempts: 1, passingCompletions: 1, passingTouchdowns: 0, interceptions: 0, longestPass: 10 },
    ], '리시빙': [
      { name: '전민우', team: '경북대학교', receptions: 18, receivingYards: 185, yardsPerReception: 10.3, receivingTouchdowns: 2, longestReception: 33 },
      { name: '황희재', team: '경북대학교', receptions: 18, receivingYards: 248, yardsPerReception: 13.8, receivingTouchdowns: 3, longestReception: 50 },
      { name: '조현영', team: '경북대학교', receptions: 16, receivingYards: 160, yardsPerReception: 10.0, receivingTouchdowns: 2, longestReception: 36 },
      { name: '배민재', team: '경일대학교', receptions: 13, receivingYards: 181, yardsPerReception: 13.9, receivingTouchdowns: 4, longestReception: 58 },
      { name: '김강민', team: '경북대학교', receptions: 11, receivingYards: 269, yardsPerReception: 24.5, receivingTouchdowns: 3, longestReception: 90 },
      { name: '김동혁', team: '대구한의대학교', receptions: 8, receivingYards: 69, yardsPerReception: 8.6, receivingTouchdowns: 0, longestReception: 17 },
      { name: '박기성', team: '한동대학교', receptions: 7, receivingYards: 61, yardsPerReception: 8.7, receivingTouchdowns: 0, longestReception: 21 },
      { name: '유동윤', team: '경일대학교', receptions: 6, receivingYards: 48, yardsPerReception: 8.0, receivingTouchdowns: 0, longestReception: 14 },
      { name: '현세영', team: '대구가톨릭대학교', receptions: 5, receivingYards: 50, yardsPerReception: 10.0, receivingTouchdowns: 0, longestReception: 16 },
    ], '펌블': [
      { name: '이효원', team: '경북대학교', fumbles: 7, fumblesLost: 3, fumbleReturnYards: 0 },
      { name: '고승주', team: '경북대학교', fumbles: 4, fumblesLost: 2, fumbleReturnYards: 0 }
    ], '태클': [
      { name: '전민우', team: '경북대학교', totalTackles: 52, soloTackles: 28, assistedTackles: 24, tacklesForLoss: 12, tackles1stDown: 15 },
      { name: '황희재', team: '경북대학교', totalTackles: 41, soloTackles: 23, assistedTackles: 18, tacklesForLoss: 8, tackles1stDown: 11 }
    ], '인터셉션': [
      { name: '조현영', team: '경북대학교', interceptions: 5, interceptionYards: 68, interceptionTouchdowns: 1, longestInterception: 42 },
      { name: '배민재', team: '경일대학교', interceptions: 4, interceptionYards: 91, interceptionTouchdowns: 2, longestInterception: 58 }
    ], 
    '필드골': [
      { name: '김강민', team: '경북대학교', fieldGoalsMade: 10, fieldGoalAttempts: 13, fieldGoalPercentage: 76.9, longestFieldGoal: 48, fieldGoals19Yards: '0/0', fieldGoals29Yards: '4/5', fieldGoals39Yards: '3/4', fieldGoals49Yards: '3/4', fieldGoals50Yards: '0/0' }
    ], '킥오프': [
      { name: '김동혁', team: '대구한의대학교', kickoffs: 42, kickoffYards: 2688, touchbacks: 19, kickoffAverage: 64.0, onsidesAttempted: 1, onsidesSuccessful: 1, kickoffOutOfBounds: 0 }
    ], '킥오프리턴': [
      { name: '변지욱', team: '경일대학교', kickoffReturns: 15, kickoffReturnYards: 378, kickoffReturnTouchdowns: 0, longestKickoffReturn: 32, kickoffReturnAverage: 25.2 }
    ], '펀트': [
      { name: '유동윤', team: '경일대학교', puntCount: 1, puntYards: 55, averagePuntYards: 55.0, longestPunt: 55, puntTouchdowns: 0 },
      { name: '이무진', team: '대구가톨릭대학교', puntCount: 5, puntYards: 213, averagePuntYards: 42.6, longestPunt: 54, puntTouchdowns: 0 },
      { name: '배민재', team: '경일대학교', puntCount: 24, puntYards: 961, averagePuntYards: 40.0, longestPunt: 56, puntTouchdowns: 0 },
      { name: '김민우', team: '대구한의대학교', puntCount: 12, puntYards: 400, averagePuntYards: 33.3, longestPunt: 47, puntTouchdowns: 0 },
      { name: '황희재', team: '경북대학교', puntCount: 5, puntYards: 146, averagePuntYards: 29.2, longestPunt: 53, puntTouchdowns: 0 },
      { name: '김진구', team: '대구가톨릭대학교', puntCount: 7, puntYards: 204, averagePuntYards: 29.1, longestPunt: 60, puntTouchdowns: 0 },
      { name: '김강민', team: '경북대학교', puntCount: 11, puntYards: 304, averagePuntYards: 27.6, longestPunt: 45, puntTouchdowns: 0 }
    ], '펀트리턴': [
      { name: '유동윤', team: '경일대학교', puntReturnCount: 7, puntReturnYards: 184, averagePuntReturnYards: 26.3, longestPuntReturn: 58, puntReturnTouchdowns: 1 },
      { name: '전민우', team: '경북대학교', puntReturnCount: 1, puntReturnYards: 25, averagePuntReturnYards: 25.0, longestPuntReturn: 25, puntReturnTouchdowns: 0 },
      { name: '이무진', team: '대구가톨릭대학교', puntReturnCount: 1, puntReturnYards: 13, averagePuntReturnYards: 13.0, longestPuntReturn: 13, puntReturnTouchdowns: 0 },
      { name: '조현영', team: '경북대학교', puntReturnCount: 4, puntReturnYards: 47, averagePuntReturnYards: 11.8, longestPuntReturn: 38, puntReturnTouchdowns: 0 },
      { name: '김강민', team: '경북대학교', puntReturnCount: 3, puntReturnYards: 30, averagePuntReturnYards: 10.0, longestPuntReturn: 17, puntReturnTouchdowns: 0 },
      { name: '황희재', team: '경북대학교', puntReturnCount: 4, puntReturnYards: 16, averagePuntReturnYards: 4.0, longestPuntReturn: 13, puntReturnTouchdowns: 0 }
    ],
  },
  second: {
    '런': [
      { name: '김범진', team: '대구대학교', rushingYards: 151, rushingAttempts: 22, yardsPerCarry: 6.9, rushingTouchdowns: 2, longestRush: 65 },
      { name: '허유현', team: '한동대학교', rushingYards: 116, rushingAttempts: 22, yardsPerCarry: 5.3, rushingTouchdowns: 2, longestRush: 38 },
      { name: '전민재', team: '영남대학교', rushingYards: 106, rushingAttempts: 26, yardsPerCarry: 4.1, rushingTouchdowns: 1, longestRush: 17 },
      { name: '김형준', team: '대구대학교', rushingYards: 95, rushingAttempts: 9, yardsPerCarry: 10.6, rushingTouchdowns: 1, longestRush: 67 },
      { name: '강경서', team: '금오공과대학교', rushingYards: 159, rushingAttempts: 33, yardsPerCarry: 4.8, rushingTouchdowns: 4, longestRush: 33 },
    ],
    '패스': [
      { name: '윤정근', team: '금오공과대학교', passingYards: 270, avgYardsPerAttempt: 5.5, completionPercentage: 44.9, passingAttempts: 49, passingCompletions: 22, passingTouchdowns: 1, interceptions: 3, longestPass: 35 },
      { name: '이재원', team: '계명대학교', passingYards: 36, avgYardsPerAttempt: 1.7, completionPercentage: 23.8, passingAttempts: 21, passingCompletions: 5, passingTouchdowns: 1, interceptions: 3, longestPass: 11 },
      { name: '강경서', team: '금오공과대학교', passingYards: 18, avgYardsPerAttempt: 18.0, completionPercentage: 100.0, passingAttempts: 1, passingCompletions: 1, passingTouchdowns: 1, interceptions: 0, longestPass: 18 },
      { name: '신재웅', team: '영남대학교', passingYards: 8, avgYardsPerAttempt: 0.8, completionPercentage: 30.0, passingAttempts: 10, passingCompletions: 3, passingTouchdowns: 0, interceptions: 1, longestPass: 8 },
    ], '리시빙': [
      { name: '이승욱', team: '금오공과대학교', receptions: 7, receivingYards: 93, yardsPerReception: 13.3, receivingTouchdowns: 1, longestReception: 31 },
      { name: '권용찬', team: '금오공과대학교', receptions: 6, receivingYards: 103, yardsPerReception: 17.2, receivingTouchdowns: 1, longestReception: 33 },
    ], '펌블': [
      { name: '김범진', team: '대구대학교', fumbles: 3, fumblesLost: 1, fumbleReturnYards: 0 }
    ], '태클': [
      { name: '허유현', team: '한동대학교', totalTackles: 28, soloTackles: 15, assistedTackles: 13, tacklesForLoss: 6, tackles1stDown: 7 }
    ], '인터셉션': [
      { name: '전민재', team: '영남대학교', interceptions: 2, interceptionYards: 25, interceptionTouchdowns: 0, longestInterception: 18 }
    ], 
    '필드골': [
      { name: '김형준', team: '대구대학교', fieldGoalsMade: 4, fieldGoalAttempts: 7, fieldGoalPercentage: 57.1, longestFieldGoal: 32, fieldGoals19Yards: '0/0', fieldGoals29Yards: '2/3', fieldGoals39Yards: '2/4', fieldGoals49Yards: '0/0', fieldGoals50Yards: '0/0' }
    ], '킥오프': [
      { name: '강경서', team: '금오공과대학교', kickoffs: 26, kickoffYards: 1586, touchbacks: 11, kickoffAverage: 61.0, onsidesAttempted: 0, onsidesSuccessful: 0, kickoffOutOfBounds: 1 }
    ], '킥오프리턴': [
      { name: '윤정근', team: '금오공과대학교', kickoffReturns: 6, kickoffReturnYards: 142, kickoffReturnTouchdowns: 0, longestKickoffReturn: 38, kickoffReturnAverage: 23.7 }
    ], '펀트': [
      { name: '전창목', team: '한동대학교', puntCount: 1, puntYards: 34, averagePuntYards: 34.0, longestPunt: 34, puntTouchdowns: 0 },
      { name: '곽도영', team: '대구대학교', puntCount: 7, puntYards: 198, averagePuntYards: 28.3, longestPunt: 42, puntTouchdowns: 0 },
      { name: '윤정근', team: '금오공과대학교', puntCount: 9, puntYards: 238, averagePuntYards: 26.4, longestPunt: 43, puntTouchdowns: 0 }
    ], '펀트리턴': [
      { name: '이민준', team: '영남대학교', puntReturnCount: 1, puntReturnYards: 15, averagePuntReturnYards: 15.0, longestPuntReturn: 15, puntReturnTouchdowns: 0 },
      { name: '최준환', team: '금오공과대학교', puntReturnCount: 1, puntReturnYards: 14, averagePuntReturnYards: 14.0, longestPuntReturn: 14, puntReturnTouchdowns: 0 },
      { name: '정훈민', team: '한동대학교', puntReturnCount: 3, puntReturnYards: 12, averagePuntReturnYards: 4.0, longestPuntReturn: 8, puntReturnTouchdowns: 0 },
      { name: '이창민', team: '대구대학교', puntReturnCount: 1, puntReturnYards: 5, averagePuntReturnYards: 5.0, longestPuntReturn: 5, puntReturnTouchdowns: 0 },
      { name: '임윤서', team: '대구한의대학교', puntReturnCount: 5, puntReturnYards: 14, averagePuntReturnYards: 2.8, longestPuntReturn: 7, puntReturnTouchdowns: 0 },
      { name: '구준수', team: '영남대학교', puntReturnCount: 2, puntReturnYards: 1, averagePuntReturnYards: 0.5, longestPuntReturn: 1, puntReturnTouchdowns: 0 }
    ],
  },
};

/* ─────────────────────────  부산경남 리그 데이터  ───────────────────────── */
const busanPlayerData = {
  first: {
    '런': [
      { name: '정재민', team: '경성대학교', rushingYards: 188, rushingAttempts: 33, yardsPerCarry: 5.7, rushingTouchdowns: 2, longestRush: 39 },
      { name: '김동현', team: '경성대학교', rushingYards: 140, rushingAttempts: 23, yardsPerCarry: 6.1, rushingTouchdowns: 3, longestRush: 37 },
      { name: '박종후', team: '경성대학교', rushingYards: 125, rushingAttempts: 26, yardsPerCarry: 4.8, rushingTouchdowns: 1, longestRush: 30 },
      { name: '김민준', team: '경성대학교', rushingYards: 122, rushingAttempts: 23, yardsPerCarry: 5.3, rushingTouchdowns: 1, longestRush: 27 },
      { name: '장민규', team: '울산대학교', rushingYards: 103, rushingAttempts: 19, yardsPerCarry: 5.4, rushingTouchdowns: 1, longestRush: 34 },
      { name: '김승현', team: '경성대학교', rushingYards: 103, rushingAttempts: 17, yardsPerCarry: 6.1, rushingTouchdowns: 0, longestRush: 37 },
    ],
    '패스': [
      { name: '천은수', team: '울산대학교', passingYards: 254, avgYardsPerAttempt: 5.2, completionPercentage: 63.3, passingAttempts: 49, passingCompletions: 31, passingTouchdowns: 4, interceptions: 3, longestPass: 37 },
      { name: '김동현', team: '경성대학교', passingYards: 245, avgYardsPerAttempt: 5.8, completionPercentage: 52.4, passingAttempts: 42, passingCompletions: 22, passingTouchdowns: 5, interceptions: 2, longestPass: 41 },
      { name: '신민호', team: '동의대학교', passingYards: 155, avgYardsPerAttempt: 4.1, completionPercentage: 31.6, passingAttempts: 38, passingCompletions: 12, passingTouchdowns: 2, interceptions: 4, longestPass: 27 },
      { name: '김혁', team: '동의대학교', passingYards: 56, avgYardsPerAttempt: 4.0, completionPercentage: 28.6, passingAttempts: 14, passingCompletions: 4, passingTouchdowns: 1, interceptions: 1, longestPass: 23 },
      { name: '김민서', team: '동아대학교', passingYards: 28, avgYardsPerAttempt: 1.2, completionPercentage: 20.8, passingAttempts: 24, passingCompletions: 5, passingTouchdowns: 0, interceptions: 2, longestPass: 14 },
    ], '리시빙': [
      { name: '임지민', team: '동의대학교', receptions: 11, receivingYards: 153, yardsPerReception: 13.9, receivingTouchdowns: 2, longestReception: 27 },
      { name: '박종후', team: '경성대학교', receptions: 10, receivingYards: 147, yardsPerReception: 14.7, receivingTouchdowns: 3, longestReception: 41 },
      { name: '김범수', team: '울산대학교', receptions: 8, receivingYards: 82, yardsPerReception: 10.3, receivingTouchdowns: 2, longestReception: 37 },
      { name: '김민성', team: '울산대학교', receptions: 6, receivingYards: 64, yardsPerReception: 10.7, receivingTouchdowns: 1, longestReception: 27 },
      { name: '김민준', team: '울산대학교', receptions: 6, receivingYards: 25, yardsPerReception: 4.2, receivingTouchdowns: 0, longestReception: 13 },
    ], '펌블': [
      { name: '정재민', team: '경성대학교', fumbles: 4, fumblesLost: 2, fumbleReturnYards: 0 },
      { name: '천은수', team: '울산대학교', fumbles: 3, fumblesLost: 1, fumbleReturnYards: 0 }
    ], '태클': [
      { name: '김동현', team: '경성대학교', totalTackles: 47, soloTackles: 26, assistedTackles: 21, tacklesForLoss: 9, tackles1stDown: 13 },
      { name: '박종후', team: '경성대학교', totalTackles: 39, soloTackles: 22, assistedTackles: 17, tacklesForLoss: 7, tackles1stDown: 10 }
    ], '인터셉션': [
      { name: '임지민', team: '동의대학교', interceptions: 5, interceptionYards: 84, interceptionTouchdowns: 1, longestInterception: 37 },
      { name: '김범수', team: '울산대학교', interceptions: 3, interceptionYards: 48, interceptionTouchdowns: 0, longestInterception: 27 }
    ], 
    '필드골': [
      { name: '김민성', team: '울산대학교', fieldGoalsMade: 7, fieldGoalAttempts: 10, fieldGoalPercentage: 70.0, longestFieldGoal: 41, fieldGoals19Yards: '0/0', fieldGoals29Yards: '3/4', fieldGoals39Yards: '3/4', fieldGoals49Yards: '1/2', fieldGoals50Yards: '0/0' }
    ], '킥오프': [
      { name: '김민준', team: '울산대학교', kickoffs: 32, kickoffYards: 2048, touchbacks: 14, kickoffAverage: 64.0, onsidesAttempted: 1, onsidesSuccessful: 0, kickoffOutOfBounds: 2 }
    ], '킥오프리턴': [
      { name: '장민규', team: '울산대학교', kickoffReturns: 9, kickoffReturnYards: 201, kickoffReturnTouchdowns: 0, longestKickoffReturn: 34, kickoffReturnAverage: 22.3 }
    ], '펀트': [
      { name: '성충근', team: '부산대학교', puntCount: 4, puntYards: 192, averagePuntYards: 48.0, longestPunt: 57, puntTouchdowns: 0 },
      { name: '정혜민', team: '경성대학교', puntCount: 6, puntYards: 262, averagePuntYards: 43.7, longestPunt: 55, puntTouchdowns: 0 },
      { name: '김동혁', team: '동아대학교', puntCount: 2, puntYards: 78, averagePuntYards: 39.0, longestPunt: 45, puntTouchdowns: 0 },
      { name: '이성수', team: '부산대학교', puntCount: 1, puntYards: 36, averagePuntYards: 36.0, longestPunt: 36, puntTouchdowns: 0 },
      { name: '김범수', team: '울산대학교', puntCount: 1, puntYards: 30, averagePuntYards: 30.0, longestPunt: 30, puntTouchdowns: 0 },
      { name: '김동현', team: '경성대학교', puntCount: 4, puntYards: 108, averagePuntYards: 27.0, longestPunt: 46, puntTouchdowns: 0 }
    ], '펀트리턴': [
      { name: '동방상원', team: '동아대학교', puntReturnCount: 1, puntReturnYards: 54, averagePuntReturnYards: 54.0, longestPuntReturn: 54, puntReturnTouchdowns: 0 },
      { name: '정성준', team: '한국해양대학교', puntReturnCount: 1, puntReturnYards: 20, averagePuntReturnYards: 20.0, longestPuntReturn: 20, puntReturnTouchdowns: 1 },
      { name: '임지민', team: '동의대학교', puntReturnCount: 1, puntReturnYards: 18, averagePuntReturnYards: 18.0, longestPuntReturn: 18, puntReturnTouchdowns: 0 },
      { name: '박종후', team: '경성대학교', puntReturnCount: 1, puntReturnYards: 8, averagePuntReturnYards: 8.0, longestPuntReturn: 8, puntReturnTouchdowns: 0 },
      { name: '김현성', team: '한동대학교', puntReturnCount: 1, puntReturnYards: 8, averagePuntReturnYards: 8.0, longestPuntReturn: 8, puntReturnTouchdowns: 0 },
      { name: '김민서', team: '동아대학교', puntReturnCount: 2, puntReturnYards: 5, averagePuntReturnYards: 2.5, longestPuntReturn: 5, puntReturnTouchdowns: 0 },
      { name: '김민준', team: '경성대학교', puntReturnCount: 1, puntReturnYards: 0, averagePuntReturnYards: 0.0, longestPuntReturn: 0, puntReturnTouchdowns: 0 }
    ],
  },
  second: {
    '런': [
      { name: '허준영', team: '부산외국어대학교', rushingYards: 256, rushingAttempts: 37, yardsPerCarry: 6.9, rushingTouchdowns: 3, longestRush: 24 },
      { name: '이민서', team: '부산외국어대학교', rushingYards: 255, rushingAttempts: 37, yardsPerCarry: 6.9, rushingTouchdowns: 0, longestRush: 34 },
      { name: '서한솔', team: '부산외국어대학교', rushingYards: 232, rushingAttempts: 43, yardsPerCarry: 5.4, rushingTouchdowns: 2, longestRush: 16 },
      { name: '김재민', team: '동의대학교', rushingYards: 191, rushingAttempts: 23, yardsPerCarry: 8.3, rushingTouchdowns: 1, longestRush: 35 },
      { name: '박건', team: '한국해양대학교', rushingYards: 190, rushingAttempts: 23, yardsPerCarry: 8.3, rushingTouchdowns: 3, longestRush: 26 },
      { name: '신민호', team: '동의대학교', rushingYards: 162, rushingAttempts: 20, yardsPerCarry: 8.1, rushingTouchdowns: 0, longestRush: 41 },
      { name: '이정우', team: '동의대학교', rushingYards: 136, rushingAttempts: 49, yardsPerCarry: 2.8, rushingTouchdowns: 4, longestRush: 16 },
      { name: '이준서', team: '동서대학교', rushingYards: 94, rushingAttempts: 23, yardsPerCarry: 4.1, rushingTouchdowns: 0, longestRush: 15 },
      { name: '손승우', team: '동아대학교', rushingYards: 92, rushingAttempts: 25, yardsPerCarry: 3.7, rushingTouchdowns: 2, longestRush: 19 },
      { name: '정운호', team: '한국해양대학교', rushingYards: 90, rushingAttempts: 9, yardsPerCarry: 10.0, rushingTouchdowns: 1, longestRush: 26 },
    ],
    '패스': [
      { name: '이민서', team: '부산외국어대학교', passingYards: 290, avgYardsPerAttempt: 2.9, completionPercentage: 46.0, passingAttempts: 100, passingCompletions: 46, passingTouchdowns: 10, interceptions: 2, longestPass: 53 },
      { name: '장지훈', team: '신라대학교', passingYards: 222, avgYardsPerAttempt: 6.2, completionPercentage: 55.6, passingAttempts: 36, passingCompletions: 20, passingTouchdowns: 4, interceptions: 0, longestPass: 79 },
      { name: '장현성', team: '동서대학교', passingYards: 121, avgYardsPerAttempt: 2.9, completionPercentage: 28.6, passingAttempts: 42, passingCompletions: 12, passingTouchdowns: 3, interceptions: 4, longestPass: 43 },
      { name: '서한솔', team: '부산외국어대학교', passingYards: 10, avgYardsPerAttempt: 10.0, completionPercentage: 100.0, passingAttempts: 1, passingCompletions: 1, passingTouchdowns: 0, interceptions: 0, longestPass: 10 },
      { name: '이예승', team: '부산외국어대학교', passingYards: 7, avgYardsPerAttempt: 0.4, completionPercentage: 27.8, passingAttempts: 18, passingCompletions: 5, passingTouchdowns: 1, interceptions: 0, longestPass: 7 },
    ], '리시빙': [
      { name: '이예승', team: '부산외국어대학교', receptions: 13, receivingYards: 159, yardsPerReception: 12.2, receivingTouchdowns: 2, longestReception: 53 },
      { name: '이시욱', team: '부산외국어대학교', receptions: 10, receivingYards: 126, yardsPerReception: 12.6, receivingTouchdowns: 2, longestReception: 28 },
      { name: '강채민', team: '부산외국어대학교', receptions: 8, receivingYards: 128, yardsPerReception: 16.0, receivingTouchdowns: 2, longestReception: 45 },
      { name: '박우진', team: '신라대학교', receptions: 7, receivingYards: 126, yardsPerReception: 18.0, receivingTouchdowns: 1, longestReception: 58 },
      { name: '허준영', team: '부산외국어대학교', receptions: 6, receivingYards: 40, yardsPerReception: 6.7, receivingTouchdowns: 0, longestReception: 10 },
    ], '펌블': [
      { name: '허준영', team: '부산외국어대학교', fumbles: 6, fumblesLost: 3, fumbleReturnYards: 0 },
      { name: '이민서', team: '부산외국어대학교', fumbles: 2, fumblesLost: 1, fumbleReturnYards: 0 }
    ], '태클': [
      { name: '서한솔', team: '부산외국어대학교', totalTackles: 35, soloTackles: 19, assistedTackles: 16, tacklesForLoss: 8, tackles1stDown: 9 },
      { name: '김재민', team: '동의대학교', totalTackles: 31, soloTackles: 17, assistedTackles: 14, tacklesForLoss: 5, tackles1stDown: 8 }
    ], '인터셉션': [
      { name: '박건', team: '한국해양대학교', interceptions: 4, interceptionYards: 63, interceptionTouchdowns: 1, longestInterception: 41 },
      { name: '신민호', team: '동의대학교', interceptions: 3, interceptionYards: 27, interceptionTouchdowns: 0, longestInterception: 21 }
    ], 
    '필드골': [
      { name: '이정우', team: '동의대학교', fieldGoalsMade: 5, fieldGoalAttempts: 8, fieldGoalPercentage: 62.5, longestFieldGoal: 38, fieldGoals19Yards: '0/0', fieldGoals29Yards: '2/3', fieldGoals39Yards: '3/5', fieldGoals49Yards: '0/0', fieldGoals50Yards: '0/0' }
    ], '킥오프': [
      { name: '이준서', team: '동서대학교', kickoffs: 28, kickoffYards: 1736, touchbacks: 12, kickoffAverage: 62.0, onsidesAttempted: 1, onsidesSuccessful: 0, kickoffOutOfBounds: 1 }
    ], '킥오프리턴': [
      { name: '손승우', team: '동아대학교', kickoffReturns: 7, kickoffReturnYards: 161, kickoffReturnTouchdowns: 0, longestKickoffReturn: 35, kickoffReturnAverage: 23.0 }
    ], '펀트': [
      { name: '이민서', team: '부산외국어대학교', puntCount: 7, puntYards: 234, averagePuntYards: 33.4, longestPunt: 54, puntTouchdowns: 0 },
      { name: '방정현', team: '한국해양대학교', puntCount: 2, puntYards: 65, averagePuntYards: 32.5, longestPunt: 45, puntTouchdowns: 0 },
      { name: '이한규', team: '동아대학교', puntCount: 3, puntYards: 94, averagePuntYards: 31.3, longestPunt: 44, puntTouchdowns: 0 },
      { name: '박기성', team: '한동대학교', puntCount: 10, puntYards: 292, averagePuntYards: 29.2, longestPunt: 45, puntTouchdowns: 0 },
      { name: '장현성', team: '동서대학교', puntCount: 5, puntYards: 146, averagePuntYards: 29.2, longestPunt: 35, puntTouchdowns: 0 }
    ], '펀트리턴': [
      { name: '이예승', team: '부산외국어대학교', puntReturnCount: 1, puntReturnYards: 12, averagePuntReturnYards: 12.0, longestPuntReturn: 12, puntReturnTouchdowns: 0 },
      { name: '장우인', team: '부산외국어대학교', puntReturnCount: 1, puntReturnYards: 3, averagePuntReturnYards: 3.0, longestPuntReturn: 3, puntReturnTouchdowns: 0 },
      { name: '이시욱', team: '부산외국어대학교', puntReturnCount: 1, puntReturnYards: 1, averagePuntReturnYards: 1.0, longestPuntReturn: 1, puntReturnTouchdowns: 0 }
    ],
  },
};

/* ─────────────────────────  사회인 리그 데이터  ───────────────────────── */
const socialData = {
  "first": {
    "런": [
      {
        "name": "김태현",
        "team": "고려대학교",
        "rushingYards": 427,
        "rushingAttempts": 61,
        "yardsPerCarry": 7,
        "rushingTouchdowns": 4,
        "longestRush": 59
      },
      {
        "name": "이효원",
        "team": "경북대학교",
        "rushingYards": 383,
        "rushingAttempts": 57,
        "yardsPerCarry": 6,
        "rushingTouchdowns": 1,
        "longestRush": 85
      },
      {
        "name": "변지욱",
        "team": "경일대학교",
        "rushingYards": 382,
        "rushingAttempts": 63,
        "yardsPerCarry": 6,
        "rushingTouchdowns": 3,
        "longestRush": 32
      },
      {
        "name": "김민겸",
        "team": "한양대학교",
        "rushingYards": 319,
        "rushingAttempts": 62,
        "yardsPerCarry": 5,
        "rushingTouchdowns": 4,
        "longestRush": 42
      },
      {
        "name": "이재성",
        "team": "연세대학교",
        "rushingYards": 299,
        "rushingAttempts": 49,
        "yardsPerCarry": 6,
        "rushingTouchdowns": 3,
        "longestRush": 35
      },
      {
        "name": "이준상",
        "team": "연세대학교",
        "rushingYards": 286,
        "rushingAttempts": 48,
        "yardsPerCarry": 6,
        "rushingTouchdowns": 3,
        "longestRush": 32
      },
      {
        "name": "허준영",
        "team": "부산외국어대학교",
        "rushingYards": 256,
        "rushingAttempts": 37,
        "yardsPerCarry": 6,
        "rushingTouchdowns": 3,
        "longestRush": 24
      },
      {
        "name": "이민서",
        "team": "부산외국어대학교",
        "rushingYards": 255,
        "rushingAttempts": 37,
        "yardsPerCarry": 6,
        "rushingTouchdowns": 0,
        "longestRush": 34
      },
      {
        "name": "차경훈",
        "team": "한양대학교",
        "rushingYards": 253,
        "rushingAttempts": 67,
        "yardsPerCarry": 3,
        "rushingTouchdowns": 2,
        "longestRush": 30
      },
      {
        "name": "김도훈",
        "team": "고려대학교",
        "rushingYards": 248,
        "rushingAttempts": 34,
        "yardsPerCarry": 7,
        "rushingTouchdowns": 2,
        "longestRush": 35
      },
      {
        "name": "이기쁨",
        "team": "강원대학교",
        "rushingYards": 232,
        "rushingAttempts": 30,
        "yardsPerCarry": 7,
        "rushingTouchdowns": 2,
        "longestRush": 41
      },
      {
        "name": "서한솔",
        "team": "부산외국어대학교",
        "rushingYards": 232,
        "rushingAttempts": 43,
        "yardsPerCarry": 5,
        "rushingTouchdowns": 2,
        "longestRush": 16
      },
      {
        "name": "박건",
        "team": "한국해양대학교",
        "rushingYards": 190,
        "rushingAttempts": 23,
        "yardsPerCarry": 8,
        "rushingTouchdowns": 3,
        "longestRush": 26
      },
      {
        "name": "정재민",
        "team": "경성대학교",
        "rushingYards": 188,
        "rushingAttempts": 33,
        "yardsPerCarry": 5,
        "rushingTouchdowns": 2,
        "longestRush": 39
      },
      {
        "name": "이명환",
        "team": "서울대학교",
        "rushingYards": 169,
        "rushingAttempts": 25,
        "yardsPerCarry": 6,
        "rushingTouchdowns": 1,
        "longestRush": 39
      },
      {
        "name": "이찬희",
        "team": "한양대학교",
        "rushingYards": 169,
        "rushingAttempts": 42,
        "yardsPerCarry": 4,
        "rushingTouchdowns": 0,
        "longestRush": 17
      },
      {
        "name": "장우영",
        "team": "숭실대학교",
        "rushingYards": 169,
        "rushingAttempts": 46,
        "yardsPerCarry": 3,
        "rushingTouchdowns": 1,
        "longestRush": 28
      },
      {
        "name": "강경서",
        "team": "금오공과대학교",
        "rushingYards": 159,
        "rushingAttempts": 33,
        "yardsPerCarry": 4,
        "rushingTouchdowns": 4,
        "longestRush": 33
      },
      {
        "name": "황승연",
        "team": "연세대학교",
        "rushingYards": 153,
        "rushingAttempts": 41,
        "yardsPerCarry": 3,
        "rushingTouchdowns": 3,
        "longestRush": 68
      },
      {
        "name": "이주헌",
        "team": "동국대학교",
        "rushingYards": 148,
        "rushingAttempts": 8,
        "yardsPerCarry": 18,
        "rushingTouchdowns": 1,
        "longestRush": 96
      },
      {
        "name": "이동규",
        "team": "서울대학교",
        "rushingYards": 145,
        "rushingAttempts": 32,
        "yardsPerCarry": 4,
        "rushingTouchdowns": 0,
        "longestRush": 18
      },
      {
        "name": "권순웅",
        "team": "홍익대학교",
        "rushingYards": 144,
        "rushingAttempts": 21,
        "yardsPerCarry": 6,
        "rushingTouchdowns": 0,
        "longestRush": 54
      },
      {
        "name": "김동현",
        "team": "경성대학교",
        "rushingYards": 140,
        "rushingAttempts": 23,
        "yardsPerCarry": 6,
        "rushingTouchdowns": 3,
        "longestRush": 37
      },
      {
        "name": "이민석",
        "team": "강원대학교",
        "rushingYards": 136,
        "rushingAttempts": 27,
        "yardsPerCarry": 5,
        "rushingTouchdowns": 2,
        "longestRush": 22
      },
      {
        "name": "고승주",
        "team": "경북대학교",
        "rushingYards": 134,
        "rushingAttempts": 25,
        "yardsPerCarry": 5,
        "rushingTouchdowns": 3,
        "longestRush": 37
      },
      {
        "name": "김준호",
        "team": "홍익대학교",
        "rushingYards": 127,
        "rushingAttempts": 29,
        "yardsPerCarry": 4,
        "rushingTouchdowns": 1,
        "longestRush": 20
      },
      {
        "name": "박종후",
        "team": "경성대학교",
        "rushingYards": 125,
        "rushingAttempts": 26,
        "yardsPerCarry": 4,
        "rushingTouchdowns": 1,
        "longestRush": 30
      },
      {
        "name": "김민준",
        "team": "경성대학교",
        "rushingYards": 122,
        "rushingAttempts": 23,
        "yardsPerCarry": 5,
        "rushingTouchdowns": 1,
        "longestRush": 27
      },
      {
        "name": "김건원",
        "team": "서울시립대학교",
        "rushingYards": 107,
        "rushingAttempts": 20,
        "yardsPerCarry": 5,
        "rushingTouchdowns": 1,
        "longestRush": 65
      },
      {
        "name": "배수환",
        "team": "중앙대학교",
        "rushingYards": 105,
        "rushingAttempts": 23,
        "yardsPerCarry": 4,
        "rushingTouchdowns": 1,
        "longestRush": 21
      },
      {
        "name": "김승현",
        "team": "경성대학교",
        "rushingYards": 103,
        "rushingAttempts": 17,
        "yardsPerCarry": 6,
        "rushingTouchdowns": 0,
        "longestRush": 37
      },
      {
        "name": "이재승",
        "team": "중앙대학교",
        "rushingYards": 100,
        "rushingAttempts": 12,
        "yardsPerCarry": 8,
        "rushingTouchdowns": 0,
        "longestRush": 47
      },
      {
        "name": "김하은",
        "team": "성균관대학교",
        "rushingYards": 99,
        "rushingAttempts": 32,
        "yardsPerCarry": 3,
        "rushingTouchdowns": 3,
        "longestRush": 38
      },
      {
        "name": "유현석",
        "team": "강원대학교",
        "rushingYards": 95,
        "rushingAttempts": 32,
        "yardsPerCarry": 3,
        "rushingTouchdowns": 0,
        "longestRush": 16
      },
      {
        "name": "장우혁",
        "team": "인하대학교",
        "rushingYards": 93,
        "rushingAttempts": 6,
        "yardsPerCarry": 15,
        "rushingTouchdowns": 0,
        "longestRush": 80
      },
      {
        "name": "허우인",
        "team": "건국대학교",
        "rushingYards": 93,
        "rushingAttempts": 14,
        "yardsPerCarry": 6,
        "rushingTouchdowns": 1,
        "longestRush": 32
      },
      {
        "name": "구도현",
        "team": "경북대학교",
        "rushingYards": 90,
        "rushingAttempts": 25,
        "yardsPerCarry": 3,
        "rushingTouchdowns": 0,
        "longestRush": 17
      },
      {
        "name": "정운호",
        "team": "한국해양대학교",
        "rushingYards": 90,
        "rushingAttempts": 9,
        "yardsPerCarry": 10,
        "rushingTouchdowns": 1,
        "longestRush": 26
      }
    ],
    "패스": [
      {
        "name": "윤여진",
        "team": "연세대학교",
        "passingYards": 886,
        "avgYardsPerAttempt": 6,
        "completionPercentage": 47.8,
        "passingAttempts": 136,
        "passingCompletions": 65,
        "passingTouchdowns": 17,
        "interceptions": 8,
        "longestPass": 80
      },
      {
        "name": "고승주",
        "team": "경북대학교",
        "passingYards": 738,
        "avgYardsPerAttempt": 5,
        "completionPercentage": 53.8,
        "passingAttempts": 143,
        "passingCompletions": 77,
        "passingTouchdowns": 12,
        "interceptions": 5,
        "longestPass": 90
      },
      {
        "name": "문찬호",
        "team": "고려대학교",
        "passingYards": 527,
        "avgYardsPerAttempt": 5,
        "completionPercentage": 59.2,
        "passingAttempts": 98,
        "passingCompletions": 58,
        "passingTouchdowns": 6,
        "interceptions": 2,
        "longestPass": 37
      },
      {
        "name": "이찬희",
        "team": "한양대학교",
        "passingYards": 481,
        "avgYardsPerAttempt": 4,
        "completionPercentage": 43.1,
        "passingAttempts": 102,
        "passingCompletions": 44,
        "passingTouchdowns": 7,
        "interceptions": 9,
        "longestPass": 57
      },
      {
        "name": "장혜성",
        "team": "성균관대학교",
        "passingYards": 366,
        "avgYardsPerAttempt": 4,
        "completionPercentage": 29.3,
        "passingAttempts": 82,
        "passingCompletions": 24,
        "passingTouchdowns": 5,
        "interceptions": 3,
        "longestPass": 59
      },
      {
        "name": "백운성",
        "team": "서강대학교",
        "passingYards": 292,
        "avgYardsPerAttempt": 5,
        "completionPercentage": 31.6,
        "passingAttempts": 57,
        "passingCompletions": 18,
        "passingTouchdowns": 2,
        "interceptions": 4,
        "longestPass": 72
      },
      {
        "name": "이민서",
        "team": "부산외국어대학교",
        "passingYards": 290,
        "avgYardsPerAttempt": 2,
        "completionPercentage": 46,
        "passingAttempts": 100,
        "passingCompletions": 46,
        "passingTouchdowns": 10,
        "interceptions": 2,
        "longestPass": 53
      },
      {
        "name": "윤정근",
        "team": "금오공과대학교",
        "passingYards": 270,
        "avgYardsPerAttempt": 5,
        "completionPercentage": 44.9,
        "passingAttempts": 49,
        "passingCompletions": 22,
        "passingTouchdowns": 1,
        "interceptions": 3,
        "longestPass": 35
      },
      {
        "name": "박병민",
        "team": "경일대학교",
        "passingYards": 246,
        "avgYardsPerAttempt": 4,
        "completionPercentage": 39.3,
        "passingAttempts": 56,
        "passingCompletions": 22,
        "passingTouchdowns": 4,
        "interceptions": 6,
        "longestPass": 47
      },
      {
        "name": "김동현",
        "team": "경성대학교",
        "passingYards": 245,
        "avgYardsPerAttempt": 5,
        "completionPercentage": 52.4,
        "passingAttempts": 42,
        "passingCompletions": 22,
        "passingTouchdowns": 5,
        "interceptions": 2,
        "longestPass": 41
      },
      {
        "name": "신재윤",
        "team": "인하대학교",
        "passingYards": 229,
        "avgYardsPerAttempt": 4,
        "completionPercentage": 43.4,
        "passingAttempts": 53,
        "passingCompletions": 23,
        "passingTouchdowns": 1,
        "interceptions": 6,
        "longestPass": 37
      },
      {
        "name": "최은찬",
        "team": "동국대학교",
        "passingYards": 215,
        "avgYardsPerAttempt": 2,
        "completionPercentage": 43.9,
        "passingAttempts": 82,
        "passingCompletions": 36,
        "passingTouchdowns": 0,
        "interceptions": 6,
        "longestPass": 38
      },
      {
        "name": "한상천",
        "team": "서울시립대학교",
        "passingYards": 204,
        "avgYardsPerAttempt": 3,
        "completionPercentage": 29,
        "passingAttempts": 69,
        "passingCompletions": 20,
        "passingTouchdowns": 1,
        "interceptions": 4,
        "longestPass": 38
      },
      {
        "name": "변지성",
        "team": "성균관대학교",
        "passingYards": 176,
        "avgYardsPerAttempt": 3,
        "completionPercentage": 27.3,
        "passingAttempts": 55,
        "passingCompletions": 15,
        "passingTouchdowns": 0,
        "interceptions": 6,
        "longestPass": 38
      },
      {
        "name": "김도윤",
        "team": "숭실대학교",
        "passingYards": 148,
        "avgYardsPerAttempt": 2,
        "completionPercentage": 52.5,
        "passingAttempts": 61,
        "passingCompletions": 32,
        "passingTouchdowns": 5,
        "interceptions": 3,
        "longestPass": 33
      },
      {
        "name": "이민석",
        "team": "강원대학교",
        "passingYards": 147,
        "avgYardsPerAttempt": 7,
        "completionPercentage": 47.6,
        "passingAttempts": 21,
        "passingCompletions": 10,
        "passingTouchdowns": 0,
        "interceptions": 1,
        "longestPass": 33
      },
      {
        "name": "최준",
        "team": "서울대학교",
        "passingYards": 127,
        "avgYardsPerAttempt": 3,
        "completionPercentage": 34.1,
        "passingAttempts": 41,
        "passingCompletions": 14,
        "passingTouchdowns": 1,
        "interceptions": 6,
        "longestPass": 18
      },
      {
        "name": "박기석",
        "team": "한국외국어대학교",
        "passingYards": 108,
        "avgYardsPerAttempt": 4,
        "completionPercentage": 39.1,
        "passingAttempts": 23,
        "passingCompletions": 9,
        "passingTouchdowns": 0,
        "interceptions": 0,
        "longestPass": 32
      },
      {
        "name": "이종혁",
        "team": "서울대학교",
        "passingYards": 99,
        "avgYardsPerAttempt": 5,
        "completionPercentage": 55,
        "passingAttempts": 20,
        "passingCompletions": 11,
        "passingTouchdowns": 0,
        "interceptions": 1,
        "longestPass": 33
      },
      {
        "name": "우재윤",
        "team": "국민대학교",
        "passingYards": 92,
        "avgYardsPerAttempt": 1,
        "completionPercentage": 21.8,
        "passingAttempts": 55,
        "passingCompletions": 12,
        "passingTouchdowns": 2,
        "interceptions": 5,
        "longestPass": 18
      },
      {
        "name": "김서진",
        "team": "건국대학교",
        "passingYards": 85,
        "avgYardsPerAttempt": 2,
        "completionPercentage": 54.8,
        "passingAttempts": 31,
        "passingCompletions": 17,
        "passingTouchdowns": 0,
        "interceptions": 3,
        "longestPass": 24
      },
      {
        "name": "정택훈",
        "team": "연세대학교",
        "passingYards": 82,
        "avgYardsPerAttempt": 5,
        "completionPercentage": 40,
        "passingAttempts": 15,
        "passingCompletions": 6,
        "passingTouchdowns": 1,
        "interceptions": 0,
        "longestPass": 32
      },
      {
        "name": "유동윤",
        "team": "경일대학교",
        "passingYards": 58,
        "avgYardsPerAttempt": 19,
        "completionPercentage": 33.3,
        "passingAttempts": 3,
        "passingCompletions": 1,
        "passingTouchdowns": 1,
        "interceptions": 2,
        "longestPass": 58
      },
      {
        "name": "손혁빈",
        "team": "경희대학교",
        "passingYards": 56,
        "avgYardsPerAttempt": 2,
        "completionPercentage": 23.8,
        "passingAttempts": 21,
        "passingCompletions": 5,
        "passingTouchdowns": 2,
        "interceptions": 4,
        "longestPass": 31
      },
      {
        "name": "이기쁨",
        "team": "강원대학교",
        "passingYards": 50,
        "avgYardsPerAttempt": 2,
        "completionPercentage": 38.1,
        "passingAttempts": 21,
        "passingCompletions": 8,
        "passingTouchdowns": 0,
        "interceptions": 1,
        "longestPass": 21
      },
      {
        "name": "원재훈",
        "team": "국민대학교",
        "passingYards": 47,
        "avgYardsPerAttempt": 3,
        "completionPercentage": 26.7,
        "passingAttempts": 15,
        "passingCompletions": 4,
        "passingTouchdowns": 0,
        "interceptions": 0,
        "longestPass": 22
      },
      {
        "name": "배수환",
        "team": "중앙대학교",
        "passingYards": 41,
        "avgYardsPerAttempt": 2,
        "completionPercentage": 29.4,
        "passingAttempts": 17,
        "passingCompletions": 5,
        "passingTouchdowns": 0,
        "interceptions": 4,
        "longestPass": 10
      },
      {
        "name": "강승구",
        "team": "서울시립대학교",
        "passingYards": 26,
        "avgYardsPerAttempt": 2,
        "completionPercentage": 11.1,
        "passingAttempts": 9,
        "passingCompletions": 1,
        "passingTouchdowns": 0,
        "interceptions": 2,
        "longestPass": 26
      },
      {
        "name": "김제민",
        "team": "중앙대학교",
        "passingYards": 20,
        "avgYardsPerAttempt": 3,
        "completionPercentage": 33.3,
        "passingAttempts": 6,
        "passingCompletions": 2,
        "passingTouchdowns": 0,
        "interceptions": 0,
        "longestPass": 12
      },
      {
        "name": "강경서",
        "team": "금오공과대학교",
        "passingYards": 18,
        "avgYardsPerAttempt": 18,
        "completionPercentage": 100,
        "passingAttempts": 1,
        "passingCompletions": 1,
        "passingTouchdowns": 1,
        "interceptions": 0,
        "longestPass": 18
      },
      {
        "name": "권용욱",
        "team": "홍익대학교",
        "passingYards": 17,
        "avgYardsPerAttempt": 0.7,
        "completionPercentage": 46.2,
        "passingAttempts": 26,
        "passingCompletions": 12,
        "passingTouchdowns": 1,
        "interceptions": 1,
        "longestPass": 15
      },
      {
        "name": "서한솔",
        "team": "부산외국어대학교",
        "passingYards": 10,
        "avgYardsPerAttempt": 10,
        "completionPercentage": 100,
        "passingAttempts": 1,
        "passingCompletions": 1,
        "passingTouchdowns": 0,
        "interceptions": 0,
        "longestPass": 10
      },
      {
        "name": "김민석",
        "team": "경일대학교",
        "passingYards": 10,
        "avgYardsPerAttempt": 10,
        "completionPercentage": 100,
        "passingAttempts": 1,
        "passingCompletions": 1,
        "passingTouchdowns": 0,
        "interceptions": 0,
        "longestPass": 10
      },
      {
        "name": "이재호",
        "team": "동국대학교",
        "passingYards": 10,
        "avgYardsPerAttempt": 0.9,
        "completionPercentage": 27.3,
        "passingAttempts": 11,
        "passingCompletions": 3,
        "passingTouchdowns": 0,
        "interceptions": 2,
        "longestPass": 15
      }
    ],
    "리시빙": [
      {
        "name": "최윤수",
        "team": "연세대학교",
        "receptions": 37,
        "receivingYards": 676,
        "yardsPerReception": 18,
        "receivingTouchdowns": 13,
        "longestReception": 80
      },
      {
        "name": "윤상준",
        "team": "고려대학교",
        "receptions": 19,
        "receivingYards": 180,
        "yardsPerReception": 9,
        "receivingTouchdowns": 2,
        "longestReception": 33
      },
      {
        "name": "전민우",
        "team": "경북대학교",
        "receptions": 18,
        "receivingYards": 185,
        "yardsPerReception": 10,
        "receivingTouchdowns": 2,
        "longestReception": 33
      },
      {
        "name": "황희재",
        "team": "경북대학교",
        "receptions": 18,
        "receivingYards": 248,
        "yardsPerReception": 13,
        "receivingTouchdowns": 3,
        "longestReception": 50
      },
      {
        "name": "조현영",
        "team": "경북대학교",
        "receptions": 16,
        "receivingYards": 160,
        "yardsPerReception": 10,
        "receivingTouchdowns": 2,
        "longestReception": 36
      },
      {
        "name": "박온",
        "team": "성균관대학교",
        "receptions": 13,
        "receivingYards": 193,
        "yardsPerReception": 14,
        "receivingTouchdowns": 1,
        "longestReception": 38
      },
      {
        "name": "이예승",
        "team": "부산외국어대학교",
        "receptions": 13,
        "receivingYards": 159,
        "yardsPerReception": 12,
        "receivingTouchdowns": 2,
        "longestReception": 53
      },
      {
        "name": "배민재",
        "team": "경일대학교",
        "receptions": 13,
        "receivingYards": 181,
        "yardsPerReception": 13,
        "receivingTouchdowns": 4,
        "longestReception": 58
      },
      {
        "name": "김강민",
        "team": "경북대학교",
        "receptions": 11,
        "receivingYards": 269,
        "yardsPerReception": 24,
        "receivingTouchdowns": 3,
        "longestReception": 90
      },
      {
        "name": "이건",
        "team": "한양대학교",
        "receptions": 11,
        "receivingYards": 115,
        "yardsPerReception": 10,
        "receivingTouchdowns": 0,
        "longestReception": 24
      },
      {
        "name": "김태현",
        "team": "고려대학교",
        "receptions": 11,
        "receivingYards": 85,
        "yardsPerReception": 7,
        "receivingTouchdowns": 1,
        "longestReception": 33
      },
      {
        "name": "박지훈",
        "team": "강원대학교",
        "receptions": 11,
        "receivingYards": 101,
        "yardsPerReception": 9,
        "receivingTouchdowns": 0,
        "longestReception": 30
      },
      {
        "name": "정종은",
        "team": "동국대학교",
        "receptions": 10,
        "receivingYards": 58,
        "yardsPerReception": 5,
        "receivingTouchdowns": 0,
        "longestReception": 21
      },
      {
        "name": "박종후",
        "team": "경성대학교",
        "receptions": 10,
        "receivingYards": 147,
        "yardsPerReception": 14,
        "receivingTouchdowns": 3,
        "longestReception": 41
      },
      {
        "name": "이시욱",
        "team": "부산외국어대학교",
        "receptions": 10,
        "receivingYards": 126,
        "yardsPerReception": 12,
        "receivingTouchdowns": 2,
        "longestReception": 28
      },
      {
        "name": "권용준",
        "team": "서울시립대학교",
        "receptions": 10,
        "receivingYards": 70,
        "yardsPerReception": 7,
        "receivingTouchdowns": 1,
        "longestReception": 17
      },
      {
        "name": "이선우",
        "team": "서울대학교",
        "receptions": 10,
        "receivingYards": 106,
        "yardsPerReception": 10,
        "receivingTouchdowns": 0,
        "longestReception": 45
      },
      {
        "name": "문영민",
        "team": "동국대학교",
        "receptions": 9,
        "receivingYards": 88,
        "yardsPerReception": 9,
        "receivingTouchdowns": 0,
        "longestReception": 21
      },
      {
        "name": "정민영",
        "team": "고려대학교",
        "receptions": 9,
        "receivingYards": 89,
        "yardsPerReception": 9,
        "receivingTouchdowns": 2,
        "longestReception": 26
      },
      {
        "name": "김승원",
        "team": "숭실대학교",
        "receptions": 9,
        "receivingYards": 70,
        "yardsPerReception": 7,
        "receivingTouchdowns": 0,
        "longestReception": 18
      },
      {
        "name": "임현성",
        "team": "한양대학교",
        "receptions": 9,
        "receivingYards": 231,
        "yardsPerReception": 25,
        "receivingTouchdowns": 3,
        "longestReception": 57
      },
      {
        "name": "배성민",
        "team": "성균관대학교",
        "receptions": 8,
        "receivingYards": 105,
        "yardsPerReception": 13,
        "receivingTouchdowns": 1,
        "longestReception": 46
      },
      {
        "name": "강채민",
        "team": "부산외국어대학교",
        "receptions": 8,
        "receivingYards": 128,
        "yardsPerReception": 16,
        "receivingTouchdowns": 2,
        "longestReception": 45
      },
      {
        "name": "이승재",
        "team": "인하대학교",
        "receptions": 7,
        "receivingYards": 16,
        "yardsPerReception": 2,
        "receivingTouchdowns": 1,
        "longestReception": 12
      },
      {
        "name": "이한재",
        "team": "성균관대학교",
        "receptions": 7,
        "receivingYards": 73,
        "yardsPerReception": 10,
        "receivingTouchdowns": 0,
        "longestReception": 33
      },
      {
        "name": "이명환",
        "team": "서울대학교",
        "receptions": 7,
        "receivingYards": 42,
        "yardsPerReception": 6,
        "receivingTouchdowns": 1,
        "longestReception": 18
      },
      {
        "name": "김록겸",
        "team": "고려대학교",
        "receptions": 7,
        "receivingYards": 74,
        "yardsPerReception": 10,
        "receivingTouchdowns": 0,
        "longestReception": 33
      },
      {
        "name": "이승욱",
        "team": "금오공과대학교",
        "receptions": 7,
        "receivingYards": 93,
        "yardsPerReception": 13,
        "receivingTouchdowns": 1,
        "longestReception": 31
      },
      {
        "name": "남현석",
        "team": "연세대학교",
        "receptions": 7,
        "receivingYards": 72,
        "yardsPerReception": 10,
        "receivingTouchdowns": 0,
        "longestReception": 25
      },
      {
        "name": "소진규",
        "team": "한양대학교",
        "receptions": 7,
        "receivingYards": 63,
        "yardsPerReception": 9,
        "receivingTouchdowns": 1,
        "longestReception": 24
      },
      {
        "name": "오승욱",
        "team": "숭실대학교",
        "receptions": 6,
        "receivingYards": 101,
        "yardsPerReception": 16,
        "receivingTouchdowns": 2,
        "longestReception": 81
      },
      {
        "name": "정명우",
        "team": "숭실대학교",
        "receptions": 6,
        "receivingYards": 51,
        "yardsPerReception": 8,
        "receivingTouchdowns": 0,
        "longestReception": 22
      },
      {
        "name": "김도훈",
        "team": "고려대학교",
        "receptions": 6,
        "receivingYards": 39,
        "yardsPerReception": 6,
        "receivingTouchdowns": 0,
        "longestReception": 14
      },
      {
        "name": "양데이빗",
        "team": "한양대학교",
        "receptions": 6,
        "receivingYards": 114,
        "yardsPerReception": 19,
        "receivingTouchdowns": 1,
        "longestReception": 34
      },
      {
        "name": "Sol Timothy",
        "team": "연세대학교",
        "receptions": 6,
        "receivingYards": 73,
        "yardsPerReception": 12,
        "receivingTouchdowns": 1,
        "longestReception": 20
      },
      {
        "name": "허준영",
        "team": "부산외국어대학교",
        "receptions": 6,
        "receivingYards": 40,
        "yardsPerReception": 6,
        "receivingTouchdowns": 0,
        "longestReception": 10
      },
      {
        "name": "유동윤",
        "team": "경일대학교",
        "receptions": 6,
        "receivingYards": 48,
        "yardsPerReception": 8,
        "receivingTouchdowns": 0,
        "longestReception": 14
      },
      {
        "name": "권용찬",
        "team": "금오공과대학교",
        "receptions": 6,
        "receivingYards": 103,
        "yardsPerReception": 17,
        "receivingTouchdowns": 1,
        "longestReception": 33
      },
      {
        "name": "오성민",
        "team": "한국외국어대학교",
        "receptions": 6,
        "receivingYards": 51,
        "yardsPerReception": 8,
        "receivingTouchdowns": 0,
        "longestReception": 19
      },
      {
        "name": "권현수",
        "team": "연세대학교",
        "receptions": 6,
        "receivingYards": 82,
        "yardsPerReception": 13,
        "receivingTouchdowns": 1,
        "longestReception": 32
      },
      {
        "name": "정재성",
        "team": "성균관대학교",
        "receptions": 6,
        "receivingYards": 81,
        "yardsPerReception": 13,
        "receivingTouchdowns": 1,
        "longestReception": 26
      },
      {
        "name": "박상원",
        "team": "서울대학교",
        "receptions": 5,
        "receivingYards": 51,
        "yardsPerReception": 10,
        "receivingTouchdowns": 0,
        "longestReception": 24
      }
    ],
    "펌블": [
      {
        "name": "윤여진",
        "team": "연세대학교",
        "fumbles": 10,
        "fumblesLost": 4,
        "fumbleTouchdowns": 0
      },
      {
        "name": "박병민",
        "team": "경일대학교",
        "fumbles": 7,
        "fumblesLost": 5,
        "fumbleTouchdowns": 0
      },
      {
        "name": "장혜성",
        "team": "성균관대학교",
        "fumbles": 5,
        "fumblesLost": 3,
        "fumbleTouchdowns": 0
      },
      {
        "name": "우재윤",
        "team": "국민대학교",
        "fumbles": 5,
        "fumblesLost": 3,
        "fumbleTouchdowns": 0
      },
      {
        "name": "이기쁨",
        "team": "강원대학교",
        "fumbles": 4,
        "fumblesLost": 2,
        "fumbleTouchdowns": 0
      },
      {
        "name": "이찬희",
        "team": "한양대학교",
        "fumbles": 4,
        "fumblesLost": 1,
        "fumbleTouchdowns": 0
      },
      {
        "name": "김도윤",
        "team": "숭실대학교",
        "fumbles": 4,
        "fumblesLost": 2,
        "fumbleTouchdowns": 0
      },
      {
        "name": "배수환",
        "team": "중앙대학교",
        "fumbles": 4,
        "fumblesLost": 0,
        "fumbleTouchdowns": 0
      },
      {
        "name": "문찬호",
        "team": "고려대학교",
        "fumbles": 4,
        "fumblesLost": 2,
        "fumbleTouchdowns": 0
      },
      {
        "name": "최수종",
        "team": "고려대학교",
        "fumbles": 4,
        "fumblesLost": 2,
        "fumbleTouchdowns": 0
      },
      {
        "name": "정택훈",
        "team": "연세대학교",
        "fumbles": 3,
        "fumblesLost": 2,
        "fumbleTouchdowns": 0
      },
      {
        "name": "김동현",
        "team": "경성대학교",
        "fumbles": 3,
        "fumblesLost": 1,
        "fumbleTouchdowns": 0
      },
      {
        "name": "서한솔",
        "team": "부산외국어대학교",
        "fumbles": 3,
        "fumblesLost": 0,
        "fumbleTouchdowns": 0
      },
      {
        "name": "변지성",
        "team": "성균관대학교",
        "fumbles": 3,
        "fumblesLost": 3,
        "fumbleTouchdowns": 0
      },
      {
        "name": "이준상",
        "team": "연세대학교",
        "fumbles": 3,
        "fumblesLost": 2,
        "fumbleTouchdowns": 0
      },
      {
        "name": "이재승",
        "team": "중앙대학교",
        "fumbles": 3,
        "fumblesLost": 2,
        "fumbleTouchdowns": 0
      },
      {
        "name": "구도현",
        "team": "경북대학교",
        "fumbles": 3,
        "fumblesLost": 1,
        "fumbleTouchdowns": 1
      },
      {
        "name": "장우영",
        "team": "숭실대학교",
        "fumbles": 3,
        "fumblesLost": 1,
        "fumbleTouchdowns": 0
      },
      {
        "name": "김서진",
        "team": "건국대학교",
        "fumbles": 3,
        "fumblesLost": 2,
        "fumbleTouchdowns": 0
      },
      {
        "name": "제용현",
        "team": "국민대학교",
        "fumbles": 2,
        "fumblesLost": 2,
        "fumbleTouchdowns": 0
      },
      {
        "name": "김민겸",
        "team": "한양대학교",
        "fumbles": 2,
        "fumblesLost": 4,
        "fumbleTouchdowns": 0
      },
      {
        "name": "김하은",
        "team": "성균관대학교",
        "fumbles": 2,
        "fumblesLost": 0,
        "fumbleTouchdowns": 0
      },
      {
        "name": "원재훈",
        "team": "국민대학교",
        "fumbles": 2,
        "fumblesLost": 1,
        "fumbleTouchdowns": 0
      },
      {
        "name": "홍세민",
        "team": "경성대학교",
        "fumbles": 2,
        "fumblesLost": 1,
        "fumbleTouchdowns": 0
      },
      {
        "name": "배성민",
        "team": "성균관대학교",
        "fumbles": 2,
        "fumblesLost": 2,
        "fumbleTouchdowns": 0
      },
      {
        "name": "최은찬",
        "team": "동국대학교",
        "fumbles": 2,
        "fumblesLost": 2,
        "fumbleTouchdowns": 0
      },
      {
        "name": "백운성",
        "team": "서강대학교",
        "fumbles": 2,
        "fumblesLost": 1,
        "fumbleTouchdowns": 0
      },
      {
        "name": "이민석",
        "team": "강원대학교",
        "fumbles": 2,
        "fumblesLost": 1,
        "fumbleTouchdowns": 0
      },
      {
        "name": "김민성",
        "team": "홍익대학교",
        "fumbles": 2,
        "fumblesLost": 1,
        "fumbleTouchdowns": 0
      },
      {
        "name": "박윤서",
        "team": "인하대학교",
        "fumbles": 2,
        "fumblesLost": 1,
        "fumbleTouchdowns": 0
      },
      {
        "name": "이동규",
        "team": "서울대학교",
        "fumbles": 3,
        "fumblesLost": 0,
        "fumbleTouchdowns": 0
      },
      {
        "name": "박종후",
        "team": "경성대학교",
        "fumbles": 2,
        "fumblesLost": 0,
        "fumbleTouchdowns": 0
      },
      {
        "name": "김대웅",
        "team": "홍익대학교",
        "fumbles": 2,
        "fumblesLost": 2,
        "fumbleTouchdowns": 0
      },
      {
        "name": "권우진",
        "team": "서울시립대학교",
        "fumbles": 2,
        "fumblesLost": 0,
        "fumbleTouchdowns": 0
      },
      {
        "name": "김두호",
        "team": "경희대학교",
        "fumbles": 2,
        "fumblesLost": 1,
        "fumbleTouchdowns": 0
      },
      {
        "name": "손혁빈",
        "team": "경희대학교",
        "fumbles": 2,
        "fumblesLost": 0,
        "fumbleTouchdowns": 0
      },
      {
        "name": "이시욱",
        "team": "부산외국어대학교",
        "fumbles": 2,
        "fumblesLost": 1,
        "fumbleTouchdowns": 0
      }
    ],
    "태클": [
      {
        "name": "정재민",
        "team": "경성대학교",
        "tackles": 28,
        "sacks": 0,
        "soloTackles": 15,
        "assistTackles": 13
      },
      {
        "name": "김민겸",
        "team": "한양대학교",
        "tackles": 25,
        "sacks": 0,
        "soloTackles": 19,
        "assistTackles": 6
      },
      {
        "name": "김민준",
        "team": "경성대학교",
        "tackles": 24,
        "sacks": 0,
        "soloTackles": 17,
        "assistTackles": 7
      },
      {
        "name": "정재성",
        "team": "성균관대학교",
        "tackles": 24,
        "sacks": 0,
        "soloTackles": 19,
        "assistTackles": 5
      },
      {
        "name": "이대희",
        "team": "연세대학교",
        "tackles": 21,
        "sacks": 4,
        "soloTackles": 11,
        "assistTackles": 6
      },
      {
        "name": "강미루",
        "team": "연세대학교",
        "tackles": 21,
        "sacks": 2,
        "soloTackles": 12,
        "assistTackles": 7
      },
      {
        "name": "여언론",
        "team": "한양대학교",
        "tackles": 21,
        "sacks": 2,
        "soloTackles": 11,
        "assistTackles": 8
      },
      {
        "name": "선민혁",
        "team": "부산외국어대학교",
        "tackles": 20,
        "sacks": 0,
        "soloTackles": 19,
        "assistTackles": 1
      },
      {
        "name": "심윤범",
        "team": "경북대학교",
        "tackles": 20,
        "sacks": 1,
        "soloTackles": 17,
        "assistTackles": 2
      },
      {
        "name": "차경훈",
        "team": "한양대학교",
        "tackles": 19,
        "sacks": 0,
        "soloTackles": 13,
        "assistTackles": 6
      },
      {
        "name": "조성환",
        "team": "연세대학교",
        "tackles": 19,
        "sacks": 0,
        "soloTackles": 15,
        "assistTackles": 4
      },
      {
        "name": "김민석",
        "team": "경일대학교",
        "tackles": 19,
        "sacks": 1,
        "soloTackles": 16,
        "assistTackles": 2
      },
      {
        "name": "이현민",
        "team": "연세대학교",
        "tackles": 19,
        "sacks": 1,
        "soloTackles": 9,
        "assistTackles": 9
      },
      {
        "name": "이재욱",
        "team": "한양대학교",
        "tackles": 19,
        "sacks": 0,
        "soloTackles": 15,
        "assistTackles": 4
      },
      {
        "name": "유동윤",
        "team": "경일대학교",
        "tackles": 18,
        "sacks": 0,
        "soloTackles": 13,
        "assistTackles": 5
      },
      {
        "name": "Rintaro",
        "team": "연세대학교",
        "tackles": 17,
        "sacks": 0,
        "soloTackles": 11,
        "assistTackles": 6
      },
      {
        "name": "김승현",
        "team": "경성대학교",
        "tackles": 17,
        "sacks": 0,
        "soloTackles": 13,
        "assistTackles": 4
      },
      {
        "name": "정현식",
        "team": "경북대학교",
        "tackles": 17,
        "sacks": 2,
        "soloTackles": 13,
        "assistTackles": 2
      },
      {
        "name": "배민재",
        "team": "경일대학교",
        "tackles": 17,
        "sacks": 2,
        "soloTackles": 11,
        "assistTackles": 4
      },
      {
        "name": "이재혁",
        "team": "서강대학교",
        "tackles": 17,
        "sacks": 0,
        "soloTackles": 15,
        "assistTackles": 2
      },
      {
        "name": "김법선",
        "team": "부산외국어대학교",
        "tackles": 16,
        "sacks": 2,
        "soloTackles": 12,
        "assistTackles": 2
      },
      {
        "name": "장우인",
        "team": "부산외국어대학교",
        "tackles": 16,
        "sacks": 0,
        "soloTackles": 15,
        "assistTackles": 1
      },
      {
        "name": "남상범",
        "team": "연세대학교",
        "tackles": 16,
        "sacks": 0,
        "soloTackles": 11,
        "assistTackles": 5
      },
      {
        "name": "황희재",
        "team": "경북대학교",
        "tackles": 15,
        "sacks": 0,
        "soloTackles": 14,
        "assistTackles": 1
      },
      {
        "name": "최준환",
        "team": "금오공과대학교",
        "tackles": 15,
        "sacks": 0,
        "soloTackles": 12,
        "assistTackles": 3
      },
      {
        "name": "정민수",
        "team": "고려대학교",
        "tackles": 15,
        "sacks": 0,
        "soloTackles": 10,
        "assistTackles": 5
      },
      {
        "name": "이기원",
        "team": "한양대학교",
        "tackles": 14,
        "sacks": 1,
        "soloTackles": 9,
        "assistTackles": 4
      },
      {
        "name": "문태웅",
        "team": "동국대학교",
        "tackles": 14,
        "sacks": 0,
        "soloTackles": 7,
        "assistTackles": 7
      },
      {
        "name": "김록겸",
        "team": "고려대학교",
        "tackles": 14,
        "sacks": 0,
        "soloTackles": 10,
        "assistTackles": 4
      },
      {
        "name": "조다빈",
        "team": "성균관대학교",
        "tackles": 14,
        "sacks": 0,
        "soloTackles": 11,
        "assistTackles": 3
      },
      {
        "name": "김진혁",
        "team": "서울대학교",
        "tackles": 14,
        "sacks": 7,
        "soloTackles": 6,
        "assistTackles": 1
      },
      {
        "name": "이시욱",
        "team": "부산외국어대학교",
        "tackles": 14,
        "sacks": 0,
        "soloTackles": 12,
        "assistTackles": 2
      },
      {
        "name": "박지민",
        "team": "경북대학교",
        "tackles": 14,
        "sacks": 1,
        "soloTackles": 13,
        "assistTackles": 0
      },
      {
        "name": "옥기주",
        "team": "경성대학교",
        "tackles": 13,
        "sacks": 0,
        "soloTackles": 5,
        "assistTackles": 8
      },
      {
        "name": "변지욱",
        "team": "경일대학교",
        "tackles": 13,
        "sacks": 0,
        "soloTackles": 9,
        "assistTackles": 4
      },
      {
        "name": "이호준",
        "team": "숭실대학교",
        "tackles": 13,
        "sacks": 1,
        "soloTackles": 7,
        "assistTackles": 5
      },
      {
        "name": "박준서",
        "team": "성균관대학교",
        "tackles": 13,
        "sacks": 0,
        "soloTackles": 12,
        "assistTackles": 1
      },
      {
        "name": "김주원",
        "team": "동국대학교",
        "tackles": 13,
        "sacks": 0,
        "soloTackles": 7,
        "assistTackles": 6
      },
      {
        "name": "최영환",
        "team": "국민대학교",
        "tackles": 13,
        "sacks": 0,
        "soloTackles": 9,
        "assistTackles": 4
      },
      {
        "name": "황성현",
        "team": "고려대학교",
        "tackles": 12,
        "sacks": 0,
        "soloTackles": 6,
        "assistTackles": 6
      },
      {
        "name": "배병찬",
        "team": "성균관대학교",
        "tackles": 12,
        "sacks": 0,
        "soloTackles": 7,
        "assistTackles": 5
      },
      {
        "name": "김도훈",
        "team": "고려대학교",
        "tackles": 12,
        "sacks": 7,
        "soloTackles": 4,
        "assistTackles": 1
      }
    ],
    "인터셉트": [
      {
        "name": "양병욱",
        "team": "서울시립대학교",
        "interceptions": 5,
        "interceptionTouchdowns": 1,
        "interceptionYards": 106,
        "longestInterception": 54
      },
      {
        "name": "이재혁",
        "team": "서강대학교",
        "interceptions": 4,
        "interceptionTouchdowns": 0,
        "interceptionYards": 4,
        "longestInterception": 2
      },
      {
        "name": "김정헌",
        "team": "서울대학교",
        "interceptions": 4,
        "interceptionTouchdowns": 0,
        "interceptionYards": 27,
        "longestInterception": 18
      },
      {
        "name": "윤상준",
        "team": "고려대학교",
        "interceptions": 3,
        "interceptionTouchdowns": 0,
        "interceptionYards": 20,
        "longestInterception": 20
      },
      {
        "name": "정재연",
        "team": "국민대학교",
        "interceptions": 3,
        "interceptionTouchdowns": 0,
        "interceptionYards": 89,
        "longestInterception": 43
      },
      {
        "name": "황희재",
        "team": "경북대학교",
        "interceptions": 3,
        "interceptionTouchdowns": 0,
        "interceptionYards": 31,
        "longestInterception": 16
      },
      {
        "name": "엄홍재",
        "team": "서강대학교",
        "interceptions": 3,
        "interceptionTouchdowns": 1,
        "interceptionYards": 38,
        "longestInterception": 25
      },
      {
        "name": "옥기주",
        "team": "경성대학교",
        "interceptions": 3,
        "interceptionTouchdowns": 0,
        "interceptionYards": 28,
        "longestInterception": 16
      },
      {
        "name": "최승종",
        "team": "연세대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 3,
        "longestInterception": 3
      },
      {
        "name": "변지욱",
        "team": "경일대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 32,
        "longestInterception": 27
      },
      {
        "name": "박승원",
        "team": "성균관대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 5,
        "longestInterception": 5
      },
      {
        "name": "박병민",
        "team": "경일대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 30,
        "longestInterception": 18
      },
      {
        "name": "이승호",
        "team": "강원대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 16,
        "longestInterception": 16
      },
      {
        "name": "황성현",
        "team": "고려대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 1,
        "interceptionYards": 58,
        "longestInterception": 32
      },
      {
        "name": "노건호",
        "team": "한양대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 3,
        "longestInterception": 3
      },
      {
        "name": "김민겸",
        "team": "한양대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 26,
        "longestInterception": 22
      },
      {
        "name": "조다빈",
        "team": "성균관대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 13,
        "longestInterception": 13
      },
      {
        "name": "박종후",
        "team": "경성대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 96,
        "longestInterception": 71
      },
      {
        "name": "오승욱",
        "team": "숭실대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 32,
        "longestInterception": 32
      },
      {
        "name": "김태우",
        "team": "동국대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 13,
        "longestInterception": 13
      },
      {
        "name": "곽효석",
        "team": "중앙대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 2,
        "longestInterception": 2
      },
      {
        "name": "서동주",
        "team": "서울대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 10,
        "longestInterception": 9
      },
      {
        "name": "박현우",
        "team": "경북대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 0,
        "longestInterception": 0
      },
      {
        "name": "김민재",
        "team": "금오공과대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 13,
        "longestInterception": 8
      },
      {
        "name": "윤석진",
        "team": "서울시립대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 6,
        "longestInterception": 6
      },
      {
        "name": "박서준",
        "team": "서강대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 5,
        "longestInterception": 5
      },
      {
        "name": "김성민",
        "team": "서울대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 44,
        "longestInterception": 25
      },
      {
        "name": "정재성",
        "team": "성균관대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 24,
        "longestInterception": 20
      },
      {
        "name": "박재형",
        "team": "강원대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 62,
        "longestInterception": 39
      },
      {
        "name": "윤정근",
        "team": "금오공과대학교",
        "interceptions": 1,
        "interceptionTouchdowns": 0,
        "interceptionYards": 3,
        "longestInterception": 3
      },
      {
        "name": "조현영",
        "team": "경북대학교",
        "interceptions": 1,
        "interceptionTouchdowns": 0,
        "interceptionYards": 4,
        "longestInterception": 4
      },
      {
        "name": "변예준",
        "team": "중앙대학교",
        "interceptions": 1,
        "interceptionTouchdowns": 0,
        "interceptionYards": 0,
        "longestInterception": 0
      },
      {
        "name": "이재승",
        "team": "중앙대학교",
        "interceptions": 1,
        "interceptionTouchdowns": 0,
        "interceptionYards": 18,
        "longestInterception": 18
      },
      {
        "name": "배민재",
        "team": "경일대학교",
        "interceptions": 1,
        "interceptionTouchdowns": 0,
        "interceptionYards": 45,
        "longestInterception": 45
      },
      {
        "name": "홍세민",
        "team": "경성대학교",
        "interceptions": 1,
        "interceptionTouchdowns": 0,
        "interceptionYards": 0,
        "longestInterception": 0
      },
      {
        "name": "윤석주",
        "team": "국민대학교",
        "interceptions": 1,
        "interceptionTouchdowns": 0,
        "interceptionYards": 0,
        "longestInterception": 0
      },
      {
        "name": "최준환",
        "team": "금오공과대학교",
        "interceptions": 1,
        "interceptionTouchdowns": 0,
        "interceptionYards": 3,
        "longestInterception": 3
      },
      {
        "name": "유철",
        "team": "연세대학교",
        "interceptions": 1,
        "interceptionTouchdowns": 0,
        "interceptionYards": 3,
        "longestInterception": 3
      },
      {
        "name": "윤영균",
        "team": "숭실대학교",
        "interceptions": 1,
        "interceptionTouchdowns": 0,
        "interceptionYards": 8,
        "longestInterception": 8
      },
      {
        "name": "문태웅",
        "team": "동국대학교",
        "interceptions": 1,
        "interceptionTouchdowns": 0,
        "interceptionYards": 20,
        "longestInterception": 20
      },
      {
        "name": "이현민",
        "team": "연세대학교",
        "interceptions": 1,
        "interceptionTouchdowns": 0,
        "interceptionYards": 7,
        "longestInterception": 7
      },
      {
        "name": "반태우",
        "team": "경희대학교",
        "interceptions": 1,
        "interceptionTouchdowns": 0,
        "interceptionYards": 13,
        "longestInterception": 13
      }
    ],
    "필드골": [
      {
        "name": "윤석진",
        "team": "서울시립대학교",
        "fieldGoalPercentage": 100,
        "averageFieldGoalDistance": 14,
        "fieldGoalsMade": 2,
        "fieldGoalsAttempted": 2,
        "fieldGoalYards": 28,
        "longestFieldGoal": 28
      },
      {
        "name": "김진혁",
        "team": "서울대학교",
        "fieldGoalPercentage": 100,
        "averageFieldGoalDistance": 25,
        "fieldGoalsMade": 2,
        "fieldGoalsAttempted": 2,
        "fieldGoalYards": 50,
        "longestFieldGoal": 27
      },
      {
        "name": "김대웅",
        "team": "홍익대학교",
        "fieldGoalPercentage": 100,
        "averageFieldGoalDistance": 0,
        "fieldGoalsMade": 1,
        "fieldGoalsAttempted": 1,
        "fieldGoalYards": 0,
        "longestFieldGoal": 0
      },
      {
        "name": "강지민",
        "team": "서강대학교",
        "fieldGoalPercentage": 100,
        "averageFieldGoalDistance": 0,
        "fieldGoalsMade": 1,
        "fieldGoalsAttempted": 1,
        "fieldGoalYards": 0,
        "longestFieldGoal": 0
      },
      {
        "name": "공성욱",
        "team": "건국대학교",
        "fieldGoalPercentage": 100,
        "averageFieldGoalDistance": 53,
        "fieldGoalsMade": 1,
        "fieldGoalsAttempted": 1,
        "fieldGoalYards": 53,
        "longestFieldGoal": 53
      },
      {
        "name": "이재성",
        "team": "연세대학교",
        "fieldGoalPercentage": 100,
        "averageFieldGoalDistance": 11,
        "fieldGoalsMade": 2,
        "fieldGoalsAttempted": 2,
        "fieldGoalYards": 22,
        "longestFieldGoal": 22
      },
      {
        "name": "이준섭",
        "team": "부산외국어대학교",
        "fieldGoalPercentage": 75,
        "averageFieldGoalDistance": 15,
        "fieldGoalsMade": 3,
        "fieldGoalsAttempted": 4,
        "fieldGoalYards": 45,
        "longestFieldGoal": 25
      },
      {
        "name": "소진규",
        "team": "한양대학교",
        "fieldGoalPercentage": 75,
        "averageFieldGoalDistance": 18,
        "fieldGoalsMade": 3,
        "fieldGoalsAttempted": 4,
        "fieldGoalYards": 55,
        "longestFieldGoal": 30
      },
      {
        "name": "최윤수",
        "team": "연세대학교",
        "fieldGoalPercentage": 66.7,
        "averageFieldGoalDistance": 30,
        "fieldGoalsMade": 2,
        "fieldGoalsAttempted": 3,
        "fieldGoalYards": 60,
        "longestFieldGoal": 35
      },
      {
        "name": "이종혁",
        "team": "서울대학교",
        "fieldGoalPercentage": 50,
        "averageFieldGoalDistance": 22,
        "fieldGoalsMade": 1,
        "fieldGoalsAttempted": 2,
        "fieldGoalYards": 22,
        "longestFieldGoal": 22
      },
      {
        "name": "배민재",
        "team": "경일대학교",
        "fieldGoalPercentage": 50,
        "averageFieldGoalDistance": 30,
        "fieldGoalsMade": 1,
        "fieldGoalsAttempted": 2,
        "fieldGoalYards": 30,
        "longestFieldGoal": 30
      },
      {
        "name": "박지훈",
        "team": "강원대학교",
        "fieldGoalPercentage": 50,
        "averageFieldGoalDistance": 20,
        "fieldGoalsMade": 3,
        "fieldGoalsAttempted": 6,
        "fieldGoalYards": 61,
        "longestFieldGoal": 36
      },
      {
        "name": "오성민",
        "team": "한국외국어대학교",
        "fieldGoalPercentage": 50,
        "averageFieldGoalDistance": 0,
        "fieldGoalsMade": 2,
        "fieldGoalsAttempted": 4,
        "fieldGoalYards": 0,
        "longestFieldGoal": 0
      },
      {
        "name": "최수종",
        "team": "고려대학교",
        "fieldGoalPercentage": 20,
        "averageFieldGoalDistance": 0,
        "fieldGoalsMade": 1,
        "fieldGoalsAttempted": 5,
        "fieldGoalYards": 0,
        "longestFieldGoal": 0
      },
      {
        "name": "조다빈",
        "team": "성균관대학교",
        "fieldGoalPercentage": 0,
        "averageFieldGoalDistance": 0,
        "fieldGoalsMade": 0,
        "fieldGoalsAttempted": 3,
        "fieldGoalYards": 0,
        "longestFieldGoal": 0
      },
      {
        "name": "권준호",
        "team": "경희대학교",
        "fieldGoalPercentage": 0,
        "averageFieldGoalDistance": 0,
        "fieldGoalsMade": 0,
        "fieldGoalsAttempted": 2,
        "fieldGoalYards": 0,
        "longestFieldGoal": 0
      },
      {
        "name": "황희재",
        "team": "경북대학교",
        "fieldGoalPercentage": 0,
        "averageFieldGoalDistance": 0,
        "fieldGoalsMade": 0,
        "fieldGoalsAttempted": 2,
        "fieldGoalYards": 0,
        "longestFieldGoal": 0
      },
      {
        "name": "박재우",
        "team": "중앙대학교",
        "fieldGoalPercentage": 0,
        "averageFieldGoalDistance": 0,
        "fieldGoalsMade": 0,
        "fieldGoalsAttempted": 1,
        "fieldGoalYards": 0,
        "longestFieldGoal": 0
      }
    ],
    "킥오프": [
      {
        "name": "이종혁",
        "team": "서울대학교",
        "averageKickoffYards": 64,
        "kickoffCount": 1,
        "kickoffYards": 64,
        "kickoffTouchdowns": 0,
        "longestKickoff": 64
      },
      {
        "name": "윤석진",
        "team": "서울시립대학교",
        "averageKickoffYards": 60,
        "kickoffCount": 1,
        "kickoffYards": 60,
        "kickoffTouchdowns": 0,
        "longestKickoff": 60
      },
      {
        "name": "김진혁",
        "team": "서울대학교",
        "averageKickoffYards": 55,
        "kickoffCount": 14,
        "kickoffYards": 777,
        "kickoffTouchdowns": 0,
        "longestKickoff": 63
      },
      {
        "name": "이준섭",
        "team": "부산외국어대학교",
        "averageKickoffYards": 55,
        "kickoffCount": 4,
        "kickoffYards": 220,
        "kickoffTouchdowns": 0,
        "longestKickoff": 62
      },
      {
        "name": "이태균",
        "team": "연세대학교",
        "averageKickoffYards": 54,
        "kickoffCount": 3,
        "kickoffYards": 163,
        "kickoffTouchdowns": 0,
        "longestKickoff": 65
      },
      {
        "name": "소진규",
        "team": "한양대학교",
        "averageKickoffYards": 54,
        "kickoffCount": 18,
        "kickoffYards": 981,
        "kickoffTouchdowns": 0,
        "longestKickoff": 65
      },
      {
        "name": "이재성",
        "team": "연세대학교",
        "averageKickoffYards": 52,
        "kickoffCount": 17,
        "kickoffYards": 898,
        "kickoffTouchdowns": 0,
        "longestKickoff": 60
      },
      {
        "name": "최윤수",
        "team": "연세대학교",
        "averageKickoffYards": 52,
        "kickoffCount": 18,
        "kickoffYards": 941,
        "kickoffTouchdowns": 0,
        "longestKickoff": 60
      },
      {
        "name": "공성욱",
        "team": "건국대학교",
        "averageKickoffYards": 52,
        "kickoffCount": 7,
        "kickoffYards": 368,
        "kickoffTouchdowns": 0,
        "longestKickoff": 65
      },
      {
        "name": "박지훈",
        "team": "강원대학교",
        "averageKickoffYards": 52,
        "kickoffCount": 19,
        "kickoffYards": 999,
        "kickoffTouchdowns": 0,
        "longestKickoff": 63
      },
      {
        "name": "김민성",
        "team": "홍익대학교",
        "averageKickoffYards": 51,
        "kickoffCount": 2,
        "kickoffYards": 103,
        "kickoffTouchdowns": 0,
        "longestKickoff": 53
      },
      {
        "name": "강지민",
        "team": "서강대학교",
        "averageKickoffYards": 51,
        "kickoffCount": 3,
        "kickoffYards": 154,
        "kickoffTouchdowns": 0,
        "longestKickoff": 60
      },
      {
        "name": "김태균",
        "team": "연세대학교",
        "averageKickoffYards": 50,
        "kickoffCount": 1,
        "kickoffYards": 50,
        "kickoffTouchdowns": 0,
        "longestKickoff": 50
      },
      {
        "name": "변지욱",
        "team": "경일대학교",
        "averageKickoffYards": 50,
        "kickoffCount": 10,
        "kickoffYards": 509,
        "kickoffTouchdowns": 0,
        "longestKickoff": 60
      },
      {
        "name": "김대웅",
        "team": "홍익대학교",
        "averageKickoffYards": 49,
        "kickoffCount": 11,
        "kickoffYards": 542,
        "kickoffTouchdowns": 0,
        "longestKickoff": 55
      },
      {
        "name": "김기찬",
        "team": "고려대학교",
        "averageKickoffYards": 49,
        "kickoffCount": 2,
        "kickoffYards": 98,
        "kickoffTouchdowns": 0,
        "longestKickoff": 50
      },
      {
        "name": "김동현",
        "team": "경성대학교",
        "averageKickoffYards": 49,
        "kickoffCount": 20,
        "kickoffYards": 985,
        "kickoffTouchdowns": 0,
        "longestKickoff": 65
      },
      {
        "name": "이진헌",
        "team": "성균관대학교",
        "averageKickoffYards": 49,
        "kickoffCount": 3,
        "kickoffYards": 148,
        "kickoffTouchdowns": 0,
        "longestKickoff": 63
      },
      {
        "name": "배민재",
        "team": "경일대학교",
        "averageKickoffYards": 48,
        "kickoffCount": 21,
        "kickoffYards": 1026,
        "kickoffTouchdowns": 0,
        "longestKickoff": 60
      },
      {
        "name": "권준호",
        "team": "경희대학교",
        "averageKickoffYards": 48,
        "kickoffCount": 8,
        "kickoffYards": 389,
        "kickoffTouchdowns": 0,
        "longestKickoff": 60
      },
      {
        "name": "오성민",
        "team": "한국외국어대학교",
        "averageKickoffYards": 47,
        "kickoffCount": 11,
        "kickoffYards": 522,
        "kickoffTouchdowns": 0,
        "longestKickoff": 60
      },
      {
        "name": "송정범",
        "team": "한양대학교",
        "averageKickoffYards": 47,
        "kickoffCount": 1,
        "kickoffYards": 47,
        "kickoffTouchdowns": 0,
        "longestKickoff": 47
      },
      {
        "name": "최수종",
        "team": "고려대학교",
        "averageKickoffYards": 45,
        "kickoffCount": 11,
        "kickoffYards": 500,
        "kickoffTouchdowns": 0,
        "longestKickoff": 60
      },
      {
        "name": "배수환",
        "team": "중앙대학교",
        "averageKickoffYards": 45,
        "kickoffCount": 9,
        "kickoffYards": 410,
        "kickoffTouchdowns": 0,
        "longestKickoff": 60
      },
      {
        "name": "황희재",
        "team": "경북대학교",
        "averageKickoffYards": 44,
        "kickoffCount": 11,
        "kickoffYards": 490,
        "kickoffTouchdowns": 0,
        "longestKickoff": 57
      },
      {
        "name": "박기호",
        "team": "숭실대학교",
        "averageKickoffYards": 43,
        "kickoffCount": 5,
        "kickoffYards": 216,
        "kickoffTouchdowns": 0,
        "longestKickoff": 58
      },
      {
        "name": "우현석",
        "team": "인하대학교",
        "averageKickoffYards": 42,
        "kickoffCount": 16,
        "kickoffYards": 682,
        "kickoffTouchdowns": 0,
        "longestKickoff": 55
      },
      {
        "name": "한상천",
        "team": "서울시립대학교",
        "averageKickoffYards": 38,
        "kickoffCount": 11,
        "kickoffYards": 426,
        "kickoffTouchdowns": 0,
        "longestKickoff": 60
      },
      {
        "name": "김동일",
        "team": "금오공과대학교",
        "averageKickoffYards": 36,
        "kickoffCount": 5,
        "kickoffYards": 185,
        "kickoffTouchdowns": 0,
        "longestKickoff": 48
      },
      {
        "name": "이재호",
        "team": "동국대학교",
        "averageKickoffYards": 35,
        "kickoffCount": 3,
        "kickoffYards": 107,
        "kickoffTouchdowns": 0,
        "longestKickoff": 52
      }
    ],
    "킥오프리턴": [
      {
        "name": "정운호",
        "team": "한국해양대학교",
        "averageKickReturnYards": 32,
        "kickReturnCount": 1,
        "kickReturnYards": 32,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 32
      },
      {
        "name": "김태현",
        "team": "고려대학교",
        "averageKickReturnYards": 30,
        "kickReturnCount": 9,
        "kickReturnYards": 274,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 35
      },
      {
        "name": "이주헌",
        "team": "동국대학교",
        "averageKickReturnYards": 28,
        "kickReturnCount": 4,
        "kickReturnYards": 113,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 96
      },
      {
        "name": "이재성",
        "team": "연세대학교",
        "averageKickReturnYards": 27,
        "kickReturnCount": 10,
        "kickReturnYards": 271,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 56
      },
      {
        "name": "황승연",
        "team": "연세대학교",
        "averageKickReturnYards": 26,
        "kickReturnCount": 3,
        "kickReturnYards": 78,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 68
      },
      {
        "name": "권순웅",
        "team": "홍익대학교",
        "averageKickReturnYards": 26,
        "kickReturnCount": 1,
        "kickReturnYards": 26,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 26
      },
      {
        "name": "이민석",
        "team": "강원대학교",
        "averageKickReturnYards": 24,
        "kickReturnCount": 6,
        "kickReturnYards": 146,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 37
      },
      {
        "name": "정재민",
        "team": "경성대학교",
        "averageKickReturnYards": 24,
        "kickReturnCount": 7,
        "kickReturnYards": 170,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 36
      },
      {
        "name": "임현성",
        "team": "한양대학교",
        "averageKickReturnYards": 23,
        "kickReturnCount": 4,
        "kickReturnYards": 95,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 28
      },
      {
        "name": "김민준",
        "team": "경성대학교",
        "averageKickReturnYards": 23,
        "kickReturnCount": 5,
        "kickReturnYards": 117,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 30
      },
      {
        "name": "서한솔",
        "team": "부산외국어대학교",
        "averageKickReturnYards": 22,
        "kickReturnCount": 3,
        "kickReturnYards": 66,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 24
      },
      {
        "name": "김건원",
        "team": "서울시립대학교",
        "averageKickReturnYards": 22,
        "kickReturnCount": 6,
        "kickReturnYards": 132,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 33
      },
      {
        "name": "조현영",
        "team": "경북대학교",
        "averageKickReturnYards": 21,
        "kickReturnCount": 7,
        "kickReturnYards": 149,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 28
      },
      {
        "name": "김흥덕",
        "team": "성균관대학교",
        "averageKickReturnYards": 21,
        "kickReturnCount": 2,
        "kickReturnYards": 43,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 22
      },
      {
        "name": "강채민",
        "team": "부산외국어대학교",
        "averageKickReturnYards": 20,
        "kickReturnCount": 6,
        "kickReturnYards": 122,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 30
      },
      {
        "name": "김승현",
        "team": "경성대학교",
        "averageKickReturnYards": 20,
        "kickReturnCount": 2,
        "kickReturnYards": 40,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 27
      },
      {
        "name": "김강민",
        "team": "경북대학교",
        "averageKickReturnYards": 20,
        "kickReturnCount": 1,
        "kickReturnYards": 20,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 20
      },
      {
        "name": "김록겸",
        "team": "고려대학교",
        "averageKickReturnYards": 19,
        "kickReturnCount": 7,
        "kickReturnYards": 135,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 32
      },
      {
        "name": "변지욱",
        "team": "경일대학교",
        "averageKickReturnYards": 19,
        "kickReturnCount": 11,
        "kickReturnYards": 215,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 32
      },
      {
        "name": "박지민",
        "team": "경북대학교",
        "averageKickReturnYards": 19,
        "kickReturnCount": 2,
        "kickReturnYards": 39,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 20
      },
      {
        "name": "김도훈",
        "team": "고려대학교",
        "averageKickReturnYards": 19,
        "kickReturnCount": 3,
        "kickReturnYards": 58,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 29
      },
      {
        "name": "유현석",
        "team": "강원대학교",
        "averageKickReturnYards": 19,
        "kickReturnCount": 3,
        "kickReturnYards": 58,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 24
      },
      {
        "name": "김윤찬",
        "team": "인하대학교",
        "averageKickReturnYards": 19,
        "kickReturnCount": 3,
        "kickReturnYards": 58,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 23
      },
      {
        "name": "배성민",
        "team": "성균관대학교",
        "averageKickReturnYards": 18,
        "kickReturnCount": 4,
        "kickReturnYards": 74,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 25
      },
      {
        "name": "장우영",
        "team": "숭실대학교",
        "averageKickReturnYards": 18,
        "kickReturnCount": 13,
        "kickReturnYards": 241,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 28
      },
      {
        "name": "정민영",
        "team": "고려대학교",
        "averageKickReturnYards": 18,
        "kickReturnCount": 2,
        "kickReturnYards": 36,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 18
      },
      {
        "name": "김민겸",
        "team": "한양대학교",
        "averageKickReturnYards": 18,
        "kickReturnCount": 5,
        "kickReturnYards": 92,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 27
      },
      {
        "name": "유영민",
        "team": "강원대학교",
        "averageKickReturnYards": 18,
        "kickReturnCount": 1,
        "kickReturnYards": 18,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 18
      },
      {
        "name": "김서진",
        "team": "건국대학교",
        "averageKickReturnYards": 18,
        "kickReturnCount": 3,
        "kickReturnYards": 55,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 22
      },
      {
        "name": "배민재",
        "team": "경일대학교",
        "averageKickReturnYards": 17,
        "kickReturnCount": 6,
        "kickReturnYards": 106,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 25
      },
      {
        "name": "이생광",
        "team": "숭실대학교",
        "averageKickReturnYards": 17,
        "kickReturnCount": 1,
        "kickReturnYards": 17,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 17
      },
      {
        "name": "김성민",
        "team": "서울대학교",
        "averageKickReturnYards": 16,
        "kickReturnCount": 1,
        "kickReturnYards": 16,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 16
      }
    ],
    "펀트": [
      {
        "name": "공성욱",
        "team": "건국대학교",
        "averagePuntYards": 56,
        "puntCount": 1,
        "puntYards": 56,
        "puntTouchdowns": 0,
        "longestPunt": 56
      },
      {
        "name": "김진혁",
        "team": "서울대학교",
        "averagePuntYards": 47,
        "puntCount": 14,
        "puntYards": 668,
        "puntTouchdowns": 0,
        "longestPunt": 58
      },
      {
        "name": "김대웅",
        "team": "홍익대학교",
        "averagePuntYards": 45,
        "puntCount": 13,
        "puntYards": 591,
        "puntTouchdowns": 0,
        "longestPunt": 58
      },
      {
        "name": "박지훈",
        "team": "강원대학교",
        "averagePuntYards": 44,
        "puntCount": 19,
        "puntYards": 843,
        "puntTouchdowns": 0,
        "longestPunt": 58
      },
      {
        "name": "오성민",
        "team": "한국외국어대학교",
        "averagePuntYards": 43,
        "puntCount": 11,
        "puntYards": 483,
        "puntTouchdowns": 0,
        "longestPunt": 53
      },
      {
        "name": "우현석",
        "team": "인하대학교",
        "averagePuntYards": 42,
        "puntCount": 15,
        "puntYards": 634,
        "puntTouchdowns": 0,
        "longestPunt": 56
      },
      {
        "name": "이준섭",
        "team": "부산외국어대학교",
        "averagePuntYards": 42,
        "puntCount": 4,
        "puntYards": 170,
        "puntTouchdowns": 0,
        "longestPunt": 55
      },
      {
        "name": "소진규",
        "team": "한양대학교",
        "averagePuntYards": 42,
        "puntCount": 17,
        "puntYards": 717,
        "puntTouchdowns": 0,
        "longestPunt": 53
      },
      {
        "name": "이재성",
        "team": "연세대학교",
        "averagePuntYards": 42,
        "puntCount": 16,
        "puntYards": 682,
        "puntTouchdowns": 0,
        "longestPunt": 58
      },
      {
        "name": "배민재",
        "team": "경일대학교",
        "averagePuntYards": 41,
        "puntCount": 19,
        "puntYards": 787,
        "puntTouchdowns": 0,
        "longestPunt": 58
      },
      {
        "name": "김동현",
        "team": "경성대학교",
        "averagePuntYards": 40,
        "puntCount": 19,
        "puntYards": 776,
        "puntTouchdowns": 0,
        "longestPunt": 60
      },
      {
        "name": "최윤수",
        "team": "연세대학교",
        "averagePuntYards": 40,
        "puntCount": 17,
        "puntYards": 694,
        "puntTouchdowns": 0,
        "longestPunt": 58
      },
      {
        "name": "윤석진",
        "team": "서울시립대학교",
        "averagePuntYards": 39,
        "puntCount": 1,
        "puntYards": 39,
        "puntTouchdowns": 0,
        "longestPunt": 39
      },
      {
        "name": "김동일",
        "team": "금오공과대학교",
        "averagePuntYards": 39,
        "puntCount": 5,
        "puntYards": 198,
        "puntTouchdowns": 0,
        "longestPunt": 58
      },
      {
        "name": "한상천",
        "team": "서울시립대학교",
        "averagePuntYards": 38,
        "puntCount": 11,
        "puntYards": 426,
        "puntTouchdowns": 0,
        "longestPunt": 58
      },
      {
        "name": "권준호",
        "team": "경희대학교",
        "averagePuntYards": 38,
        "puntCount": 8,
        "puntYards": 310,
        "puntTouchdowns": 0,
        "longestPunt": 58
      },
      {
        "name": "강지민",
        "team": "서강대학교",
        "averagePuntYards": 38,
        "puntCount": 3,
        "puntYards": 115,
        "puntTouchdowns": 0,
        "longestPunt": 45
      },
      {
        "name": "이태균",
        "team": "연세대학교",
        "averagePuntYards": 38,
        "puntCount": 3,
        "puntYards": 115,
        "puntTouchdowns": 0,
        "longestPunt": 55
      },
      {
        "name": "황희재",
        "team": "경북대학교",
        "averagePuntYards": 36,
        "puntCount": 11,
        "puntYards": 403,
        "puntTouchdowns": 0,
        "longestPunt": 58
      },
      {
        "name": "이재호",
        "team": "동국대학교",
        "averagePuntYards": 36,
        "puntCount": 3,
        "puntYards": 108,
        "puntTouchdowns": 0,
        "longestPunt": 48
      },
      {
        "name": "변지욱",
        "team": "경일대학교",
        "averagePuntYards": 36,
        "puntCount": 9,
        "puntYards": 329,
        "puntTouchdowns": 0,
        "longestPunt": 54
      },
      {
        "name": "최수종",
        "team": "고려대학교",
        "averagePuntYards": 36,
        "puntCount": 11,
        "puntYards": 402,
        "puntTouchdowns": 0,
        "longestPunt": 49
      },
      {
        "name": "김태균",
        "team": "연세대학교",
        "averagePuntYards": 36,
        "puntCount": 1,
        "puntYards": 36,
        "puntTouchdowns": 0,
        "longestPunt": 36
      },
      {
        "name": "배수환",
        "team": "중앙대학교",
        "averagePuntYards": 35,
        "puntCount": 9,
        "puntYards": 316,
        "puntTouchdowns": 0,
        "longestPunt": 50
      },
      {
        "name": "박기호",
        "team": "숭실대학교",
        "averagePuntYards": 34,
        "puntCount": 5,
        "puntYards": 172,
        "puntTouchdowns": 0,
        "longestPunt": 43
      },
      {
        "name": "김민성",
        "team": "홍익대학교",
        "averagePuntYards": 33,
        "puntCount": 2,
        "puntYards": 67,
        "puntTouchdowns": 0,
        "longestPunt": 40
      },
      {
        "name": "이진헌",
        "team": "성균관대학교",
        "averagePuntYards": 32,
        "puntCount": 3,
        "puntYards": 97,
        "puntTouchdowns": 0,
        "longestPunt": 48
      }
    ],
    "펀트리턴": [
      {
        "name": "김태현",
        "team": "고려대학교",
        "averagePuntReturnYards": 23,
        "puntReturnCount": 11,
        "puntReturnYards": 257,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 32
      },
      {
        "name": "이재성",
        "team": "연세대학교",
        "averagePuntReturnYards": 22,
        "puntReturnCount": 10,
        "puntReturnYards": 222,
        "puntReturnTouchdowns": 1,
        "longestPuntReturn": 84
      },
      {
        "name": "장우영",
        "team": "숭실대학교",
        "averagePuntReturnYards": 17,
        "puntReturnCount": 13,
        "puntReturnYards": 229,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 43
      },
      {
        "name": "김건원",
        "team": "서울시립대학교",
        "averagePuntReturnYards": 17,
        "puntReturnCount": 6,
        "puntReturnYards": 102,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 25
      },
      {
        "name": "이주헌",
        "team": "동국대학교",
        "averagePuntReturnYards": 16,
        "puntReturnCount": 4,
        "puntReturnYards": 67,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 36
      },
      {
        "name": "박지훈",
        "team": "강원대학교",
        "averagePuntReturnYards": 16,
        "puntReturnCount": 2,
        "puntReturnYards": 32,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 20
      },
      {
        "name": "정재민",
        "team": "경성대학교",
        "averagePuntReturnYards": 15,
        "puntReturnCount": 7,
        "puntReturnYards": 109,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 26
      },
      {
        "name": "이현민",
        "team": "연세대학교",
        "averagePuntReturnYards": 14,
        "puntReturnCount": 1,
        "puntReturnYards": 14,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 14
      },
      {
        "name": "김흥덕",
        "team": "성균관대학교",
        "averagePuntReturnYards": 13,
        "puntReturnCount": 2,
        "puntReturnYards": 26,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 20
      },
      {
        "name": "변지욱",
        "team": "경일대학교",
        "averagePuntReturnYards": 13,
        "puntReturnCount": 11,
        "puntReturnYards": 148,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 24
      },
      {
        "name": "김민준",
        "team": "경성대학교",
        "averagePuntReturnYards": 12,
        "puntReturnCount": 5,
        "puntReturnYards": 62,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 19
      },
      {
        "name": "임현성",
        "team": "한양대학교",
        "averagePuntReturnYards": 11,
        "puntReturnCount": 4,
        "puntReturnYards": 45,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 15
      },
      {
        "name": "김록겸",
        "team": "고려대학교",
        "averagePuntReturnYards": 11,
        "puntReturnCount": 7,
        "puntReturnYards": 80,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 16
      },
      {
        "name": "조현영",
        "team": "경북대학교",
        "averagePuntReturnYards": 11,
        "puntReturnCount": 7,
        "puntReturnYards": 81,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 15
      },
      {
        "name": "유현석",
        "team": "강원대학교",
        "averagePuntReturnYards": 11,
        "puntReturnCount": 3,
        "puntReturnYards": 33,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 14
      },
      {
        "name": "김윤찬",
        "team": "인하대학교",
        "averagePuntReturnYards": 10,
        "puntReturnCount": 3,
        "puntReturnYards": 31,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 15
      },
      {
        "name": "배성민",
        "team": "성균관대학교",
        "averagePuntReturnYards": 10,
        "puntReturnCount": 4,
        "puntReturnYards": 41,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 13
      },
      {
        "name": "김도훈",
        "team": "고려대학교",
        "averagePuntReturnYards": 10,
        "puntReturnCount": 3,
        "puntReturnYards": 31,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 17
      },
      {
        "name": "유동윤",
        "team": "경일대학교",
        "averagePuntReturnYards": 10,
        "puntReturnCount": 2,
        "puntReturnYards": 20,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 13
      },
      {
        "name": "권우진",
        "team": "서울시립대학교",
        "averagePuntReturnYards": 10,
        "puntReturnCount": 1,
        "puntReturnYards": 10,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 10
      },
      {
        "name": "김서진",
        "team": "건국대학교",
        "averagePuntReturnYards": 10,
        "puntReturnCount": 3,
        "puntReturnYards": 31,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 17
      },
      {
        "name": "한창혁",
        "team": "건국대학교",
        "averagePuntReturnYards": 10,
        "puntReturnCount": 1,
        "puntReturnYards": 10,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 10
      },
      {
        "name": "김강민",
        "team": "경북대학교",
        "averagePuntReturnYards": 10,
        "puntReturnCount": 1,
        "puntReturnYards": 10,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 10
      },
      {
        "name": "김민겸",
        "team": "한양대학교",
        "averagePuntReturnYards": 9,
        "puntReturnCount": 5,
        "puntReturnYards": 49,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 19
      },
      {
        "name": "정민영",
        "team": "고려대학교",
        "averagePuntReturnYards": 9,
        "puntReturnCount": 2,
        "puntReturnYards": 19,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 18
      },
      {
        "name": "이승원",
        "team": "서울시립대학교",
        "averagePuntReturnYards": 9,
        "puntReturnCount": 1,
        "puntReturnYards": 9,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 9
      },
      {
        "name": "서한솔",
        "team": "부산외국어대학교",
        "averagePuntReturnYards": 9,
        "puntReturnCount": 3,
        "puntReturnYards": 28,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 13
      },
      {
        "name": "황승연",
        "team": "연세대학교",
        "averagePuntReturnYards": 8,
        "puntReturnCount": 3,
        "puntReturnYards": 26,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 15
      },
      {
        "name": "김승현",
        "team": "경성대학교",
        "averagePuntReturnYards": 8,
        "puntReturnCount": 2,
        "puntReturnYards": 16,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 14
      },
      {
        "name": "강채민",
        "team": "부산외국어대학교",
        "averagePuntReturnYards": 8,
        "puntReturnCount": 6,
        "puntReturnYards": 50,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 12
      },
      {
        "name": "배민재",
        "team": "경일대학교",
        "averagePuntReturnYards": 7,
        "puntReturnCount": 6,
        "puntReturnYards": 45,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 13
      },
      {
        "name": "박지민",
        "team": "경북대학교",
        "averagePuntReturnYards": 7,
        "puntReturnCount": 2,
        "puntReturnYards": 14,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 8
      },
      {
        "name": "황희재",
        "team": "경북대학교",
        "averagePuntReturnYards": 7,
        "puntReturnCount": 2,
        "puntReturnYards": 14,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 12
      },
      {
        "name": "이생광",
        "team": "숭실대학교",
        "averagePuntReturnYards": 6,
        "puntReturnCount": 1,
        "puntReturnYards": 6,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 6
      },
      {
        "name": "백지환",
        "team": "홍익대학교",
        "averagePuntReturnYards": 5,
        "puntReturnCount": 1,
        "puntReturnYards": 5,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 5
      },
      {
        "name": "김성민",
        "team": "서울대학교",
        "averagePuntReturnYards": 5,
        "puntReturnCount": 1,
        "puntReturnYards": 5,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 5
      },
      {
        "name": "전민우",
        "team": "경북대학교",
        "averagePuntReturnYards": 4,
        "puntReturnCount": 2,
        "puntReturnYards": 8,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 6
      },
      {
        "name": "김준호",
        "team": "홍익대학교",
        "averagePuntReturnYards": 3,
        "puntReturnCount": 1,
        "puntReturnYards": 3,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 3
      },
      {
        "name": "이지수",
        "team": "숭실대학교",
        "averagePuntReturnYards": 2,
        "puntReturnCount": 1,
        "puntReturnYards": 2,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 2
      }
    ]
  },
  "second": {
    "런": [
      {
        "name": "김재민",
        "team": "동의대학교",
        "rushingYards": 191,
        "rushingAttempts": 23,
        "yardsPerCarry": 8,
        "rushingTouchdowns": 1,
        "longestRush": 35
      },
      {
        "name": "신민호",
        "team": "동의대학교",
        "rushingYards": 162,
        "rushingAttempts": 20,
        "yardsPerCarry": 8,
        "rushingTouchdowns": 0,
        "longestRush": 41
      },
      {
        "name": "김범진",
        "team": "대구대학교",
        "rushingYards": 151,
        "rushingAttempts": 22,
        "yardsPerCarry": 6,
        "rushingTouchdowns": 2,
        "longestRush": 65
      },
      {
        "name": "이정우",
        "team": "동의대학교",
        "rushingYards": 136,
        "rushingAttempts": 49,
        "yardsPerCarry": 2,
        "rushingTouchdowns": 4,
        "longestRush": 16
      },
      {
        "name": "김상구",
        "team": "용인대학교",
        "rushingYards": 127,
        "rushingAttempts": 6,
        "yardsPerCarry": 21,
        "rushingTouchdowns": 1,
        "longestRush": 63
      },
      {
        "name": "허유현",
        "team": "한동대학교",
        "rushingYards": 116,
        "rushingAttempts": 22,
        "yardsPerCarry": 5,
        "rushingTouchdowns": 2,
        "longestRush": 38
      },
      {
        "name": "전민재",
        "team": "영남대학교",
        "rushingYards": 106,
        "rushingAttempts": 26,
        "yardsPerCarry": 4,
        "rushingTouchdowns": 1,
        "longestRush": 17
      },
      {
        "name": "장민규",
        "team": "울산대학교",
        "rushingYards": 103,
        "rushingAttempts": 19,
        "yardsPerCarry": 5,
        "rushingTouchdowns": 1,
        "longestRush": 34
      },
      {
        "name": "김형준",
        "team": "대구대학교",
        "rushingYards": 95,
        "rushingAttempts": 9,
        "yardsPerCarry": 10,
        "rushingTouchdowns": 1,
        "longestRush": 67
      },
      {
        "name": "안태현",
        "team": "용인대학교",
        "rushingYards": 94,
        "rushingAttempts": 19,
        "yardsPerCarry": 4,
        "rushingTouchdowns": 0,
        "longestRush": 16
      },
      {
        "name": "이준서",
        "team": "동서대학교",
        "rushingYards": 94,
        "rushingAttempts": 23,
        "yardsPerCarry": 4,
        "rushingTouchdowns": 0,
        "longestRush": 15
      },
      {
        "name": "손승우",
        "team": "동아대학교",
        "rushingYards": 92,
        "rushingAttempts": 25,
        "yardsPerCarry": 3,
        "rushingTouchdowns": 2,
        "longestRush": 19
      }
    ],
    "패스": [
      {
        "name": "김상구",
        "team": "용인대학교",
        "passingYards": 1079,
        "avgYardsPerAttempt": 9,
        "completionPercentage": 38.8,
        "passingAttempts": 121,
        "passingCompletions": 47,
        "passingTouchdowns": 8,
        "interceptions": 10,
        "longestPass": 86
      },
      {
        "name": "정유성",
        "team": "대구대학교",
        "passingYards": 731,
        "avgYardsPerAttempt": 4,
        "completionPercentage": 55.2,
        "passingAttempts": 152,
        "passingCompletions": 84,
        "passingTouchdowns": 9,
        "interceptions": 3,
        "longestPass": 90
      },
      {
        "name": "신민호",
        "team": "동의대학교",
        "passingYards": 643,
        "avgYardsPerAttempt": 5,
        "completionPercentage": 34.5,
        "passingAttempts": 119,
        "passingCompletions": 41,
        "passingTouchdowns": 9,
        "interceptions": 3,
        "longestPass": 90
      },
      {
        "name": "이정우",
        "team": "동의대학교",
        "passingYards": 524,
        "avgYardsPerAttempt": 6,
        "completionPercentage": 42,
        "passingAttempts": 81,
        "passingCompletions": 34,
        "passingTouchdowns": 9,
        "interceptions": 5,
        "longestPass": 57
      },
      {
        "name": "홍동욱",
        "team": "영남대학교",
        "passingYards": 337,
        "avgYardsPerAttempt": 3,
        "completionPercentage": 48.5,
        "passingAttempts": 99,
        "passingCompletions": 48,
        "passingTouchdowns": 5,
        "interceptions": 0,
        "longestPass": 51
      },
      {
        "name": "전민재",
        "team": "영남대학교",
        "passingYards": 288,
        "avgYardsPerAttempt": 3,
        "completionPercentage": 50,
        "passingAttempts": 84,
        "passingCompletions": 42,
        "passingTouchdowns": 5,
        "interceptions": 3,
        "longestPass": 38
      },
      {
        "name": "진우혁",
        "team": "용인대학교",
        "passingYards": 248,
        "avgYardsPerAttempt": 4,
        "completionPercentage": 48.5,
        "passingAttempts": 68,
        "passingCompletions": 33,
        "passingTouchdowns": 3,
        "interceptions": 6,
        "longestPass": 49
      },
      {
        "name": "허유현",
        "team": "한동대학교",
        "passingYards": 171,
        "avgYardsPerAttempt": 2,
        "completionPercentage": 48.9,
        "passingAttempts": 86,
        "passingCompletions": 42,
        "passingTouchdowns": 3,
        "interceptions": 1,
        "longestPass": 26
      },
      {
        "name": "김재한",
        "team": "용인대학교",
        "passingYards": 168,
        "avgYardsPerAttempt": 6,
        "completionPercentage": 33.3,
        "passingAttempts": 27,
        "passingCompletions": 9,
        "passingTouchdowns": 2,
        "interceptions": 3,
        "longestPass": 30
      },
      {
        "name": "손승우",
        "team": "동아대학교",
        "passingYards": 133,
        "avgYardsPerAttempt": 3,
        "completionPercentage": 35,
        "passingAttempts": 37,
        "passingCompletions": 13,
        "passingTouchdowns": 1,
        "interceptions": 2,
        "longestPass": 31
      },
      {
        "name": "이준서",
        "team": "동서대학교",
        "passingYards": 129,
        "avgYardsPerAttempt": 3,
        "completionPercentage": 36.4,
        "passingAttempts": 44,
        "passingCompletions": 16,
        "passingTouchdowns": 1,
        "interceptions": 4,
        "longestPass": 27
      },
      {
        "name": "장민규",
        "team": "울산대학교",
        "passingYards": 118,
        "avgYardsPerAttempt": 3,
        "completionPercentage": 31.3,
        "passingAttempts": 32,
        "passingCompletions": 10,
        "passingTouchdowns": 2,
        "interceptions": 0,
        "longestPass": 31
      },
      {
        "name": "안태현",
        "team": "용인대학교",
        "passingYards": 103,
        "avgYardsPerAttempt": 3,
        "completionPercentage": 26.9,
        "passingAttempts": 26,
        "passingCompletions": 7,
        "passingTouchdowns": 1,
        "interceptions": 2,
        "longestPass": 38
      },
      {
        "name": "박재영",
        "team": "동서대학교",
        "passingYards": 83,
        "avgYardsPerAttempt": 4,
        "completionPercentage": 60,
        "passingAttempts": 20,
        "passingCompletions": 12,
        "passingTouchdowns": 1,
        "interceptions": 4,
        "longestPass": 17
      },
      {
        "name": "김형준",
        "team": "대구대학교",
        "passingYards": 80,
        "avgYardsPerAttempt": 2,
        "completionPercentage": 31.4,
        "passingAttempts": 35,
        "passingCompletions": 11,
        "passingTouchdowns": 0,
        "interceptions": 5,
        "longestPass": 14
      },
      {
        "name": "차현수",
        "team": "한동대학교",
        "passingYards": 42,
        "avgYardsPerAttempt": 1,
        "completionPercentage": 40,
        "passingAttempts": 25,
        "passingCompletions": 10,
        "passingTouchdowns": 0,
        "interceptions": 1,
        "longestPass": 10
      }
    ],
    "리시빙": [
      {
        "name": "이승하",
        "team": "대구대학교",
        "receptions": 14,
        "receivingYards": 185,
        "yardsPerReception": 13,
        "receivingTouchdowns": 2,
        "longestReception": 33
      },
      {
        "name": "강석진",
        "team": "영남대학교",
        "receptions": 13,
        "receivingYards": 247,
        "yardsPerReception": 19,
        "receivingTouchdowns": 3,
        "longestReception": 51
      },
      {
        "name": "이현",
        "team": "영남대학교",
        "receptions": 12,
        "receivingYards": 132,
        "yardsPerReception": 11,
        "receivingTouchdowns": 3,
        "longestReception": 38
      },
      {
        "name": "김재한",
        "team": "용인대학교",
        "receptions": 11,
        "receivingYards": 316,
        "yardsPerReception": 28,
        "receivingTouchdowns": 2,
        "longestReception": 86
      },
      {
        "name": "임희걸",
        "team": "대구대학교",
        "receptions": 10,
        "receivingYards": 128,
        "yardsPerReception": 12,
        "receivingTouchdowns": 2,
        "longestReception": 43
      },
      {
        "name": "전가을",
        "team": "동아대학교",
        "receptions": 9,
        "receivingYards": 86,
        "yardsPerReception": 9,
        "receivingTouchdowns": 1,
        "longestReception": 31
      },
      {
        "name": "서덕균",
        "team": "대구대학교",
        "receptions": 9,
        "receivingYards": 50,
        "yardsPerReception": 5,
        "receivingTouchdowns": 0,
        "longestReception": 15
      },
      {
        "name": "서재호",
        "team": "한동대학교",
        "receptions": 8,
        "receivingYards": 78,
        "yardsPerReception": 9,
        "receivingTouchdowns": 1,
        "longestReception": 21
      },
      {
        "name": "문승현",
        "team": "대구대학교",
        "receptions": 7,
        "receivingYards": 90,
        "yardsPerReception": 12,
        "receivingTouchdowns": 1,
        "longestReception": 29
      },
      {
        "name": "이정진",
        "team": "대구대학교",
        "receptions": 7,
        "receivingYards": 65,
        "yardsPerReception": 9,
        "receivingTouchdowns": 0,
        "longestReception": 33
      },
      {
        "name": "임채광",
        "team": "대구대학교",
        "receptions": 6,
        "receivingYards": 100,
        "yardsPerReception": 16,
        "receivingTouchdowns": 1,
        "longestReception": 90
      },
      {
        "name": "김범진",
        "team": "대구대학교",
        "receptions": 6,
        "receivingYards": 39,
        "yardsPerReception": 6,
        "receivingTouchdowns": 0,
        "longestReception": 10
      },
      {
        "name": "최우혁",
        "team": "용인대학교",
        "receptions": 6,
        "receivingYards": 155,
        "yardsPerReception": 25,
        "receivingTouchdowns": 2,
        "longestReception": 67
      },
      {
        "name": "윤주현",
        "team": "한동대학교",
        "receptions": 6,
        "receivingYards": 49,
        "yardsPerReception": 8,
        "receivingTouchdowns": 1,
        "longestReception": 20
      },
      {
        "name": "안태현",
        "team": "용인대학교",
        "receptions": 5,
        "receivingYards": 126,
        "yardsPerReception": 25,
        "receivingTouchdowns": 1,
        "longestReception": 56
      },
      {
        "name": "진우혁",
        "team": "용인대학교",
        "receptions": 5,
        "receivingYards": 147,
        "yardsPerReception": 29,
        "receivingTouchdowns": 2,
        "longestReception": 60
      },
      {
        "name": "이규재",
        "team": "동의대학교",
        "receptions": 5,
        "receivingYards": 94,
        "yardsPerReception": 18,
        "receivingTouchdowns": 3,
        "longestReception": 28
      },
      {
        "name": "박준형",
        "team": "동의대학교",
        "receptions": 5,
        "receivingYards": 176,
        "yardsPerReception": 35,
        "receivingTouchdowns": 3,
        "longestReception": 90
      },
      {
        "name": "김상구",
        "team": "용인대학교",
        "receptions": 5,
        "receivingYards": 145,
        "yardsPerReception": 29,
        "receivingTouchdowns": 2,
        "longestReception": 48
      },
      {
        "name": "이상민",
        "team": "울산대학교",
        "receptions": 5,
        "receivingYards": 66,
        "yardsPerReception": 13,
        "receivingTouchdowns": 2,
        "longestReception": 31
      },
      {
        "name": "김형준",
        "team": "대구대학교",
        "receptions": 5,
        "receivingYards": 45,
        "yardsPerReception": 9,
        "receivingTouchdowns": 1,
        "longestReception": 19
      },
      {
        "name": "최홍민",
        "team": "용인대학교",
        "receptions": 4,
        "receivingYards": 52,
        "yardsPerReception": 13,
        "receivingTouchdowns": 0,
        "longestReception": 19
      },
      {
        "name": "손승우",
        "team": "동아대학교",
        "receptions": 4,
        "receivingYards": 47,
        "yardsPerReception": 11,
        "receivingTouchdowns": 0,
        "longestReception": 16
      },
      {
        "name": "김재민",
        "team": "동의대학교",
        "receptions": 4,
        "receivingYards": 142,
        "yardsPerReception": 35,
        "receivingTouchdowns": 1,
        "longestReception": 74
      },
      {
        "name": "성시환",
        "team": "동의대학교",
        "receptions": 4,
        "receivingYards": 254,
        "yardsPerReception": 63,
        "receivingTouchdowns": 3,
        "longestReception": 90
      },
      {
        "name": "신민호",
        "team": "동의대학교",
        "receptions": 4,
        "receivingYards": 102,
        "yardsPerReception": 25,
        "receivingTouchdowns": 2,
        "longestReception": 57
      },
      {
        "name": "이강민",
        "team": "동서대학교",
        "receptions": 4,
        "receivingYards": 67,
        "yardsPerReception": 16,
        "receivingTouchdowns": 1,
        "longestReception": 26
      },
      {
        "name": "김동현",
        "team": "동서대학교",
        "receptions": 4,
        "receivingYards": 42,
        "yardsPerReception": 10,
        "receivingTouchdowns": 0,
        "longestReception": 14
      },
      {
        "name": "최재혁",
        "team": "한동대학교",
        "receptions": 4,
        "receivingYards": 23,
        "yardsPerReception": 5,
        "receivingTouchdowns": 0,
        "longestReception": 13
      },
      {
        "name": "김승구",
        "team": "동서대학교",
        "receptions": 4,
        "receivingYards": 30,
        "yardsPerReception": 7,
        "receivingTouchdowns": 0,
        "longestReception": 13
      },
      {
        "name": "이정우",
        "team": "동의대학교",
        "receptions": 3,
        "receivingYards": 104,
        "yardsPerReception": 34,
        "receivingTouchdowns": 2,
        "longestReception": 42
      },
      {
        "name": "한동혁",
        "team": "대구대학교",
        "receptions": 3,
        "receivingYards": 33,
        "yardsPerReception": 11,
        "receivingTouchdowns": 1,
        "longestReception": 17
      },
      {
        "name": "김두호",
        "team": "영남대학교",
        "receptions": 3,
        "receivingYards": 42,
        "yardsPerReception": 14,
        "receivingTouchdowns": 1,
        "longestReception": 29
      },
      {
        "name": "전민재",
        "team": "영남대학교",
        "receptions": 3,
        "receivingYards": 33,
        "yardsPerReception": 11,
        "receivingTouchdowns": 1,
        "longestReception": 18
      },
      {
        "name": "류재환",
        "team": "한동대학교",
        "receptions": 3,
        "receivingYards": 42,
        "yardsPerReception": 14,
        "receivingTouchdowns": 1,
        "longestReception": 26
      },
      {
        "name": "전형진",
        "team": "용인대학교",
        "receptions": 2,
        "receivingYards": 45,
        "yardsPerReception": 22,
        "receivingTouchdowns": 0,
        "longestReception": 37
      },
      {
        "name": "유대한",
        "team": "영남대학교",
        "receptions": 2,
        "receivingYards": 3,
        "yardsPerReception": 1,
        "receivingTouchdowns": 0,
        "longestReception": 3
      },
      {
        "name": "주석민",
        "team": "동서대학교",
        "receptions": 2,
        "receivingYards": 7,
        "yardsPerReception": 3,
        "receivingTouchdowns": 0,
        "longestReception": 5
      },
      {
        "name": "고태영",
        "team": "동서대학교",
        "receptions": 2,
        "receivingYards": 13,
        "yardsPerReception": 6,
        "receivingTouchdowns": 1,
        "longestReception": 11
      },
      {
        "name": "이하늘",
        "team": "울산대학교",
        "receptions": 2,
        "receivingYards": 20,
        "yardsPerReception": 10,
        "receivingTouchdowns": 0,
        "longestReception": 13
      },
      {
        "name": "김진욱",
        "team": "울산대학교",
        "receptions": 2,
        "receivingYards": 15,
        "yardsPerReception": 7,
        "receivingTouchdowns": 0,
        "longestReception": 14
      },
      {
        "name": "권민철",
        "team": "대구대학교",
        "receptions": 1,
        "receivingYards": 11,
        "yardsPerReception": 11,
        "receivingTouchdowns": 0,
        "longestReception": 11
      }
    ],
    "펌블": [
      {
        "name": "전민재",
        "team": "영남대학교",
        "fumbles": 6,
        "fumblesLost": 2,
        "fumbleTouchdowns": 0
      },
      {
        "name": "안세훈",
        "team": "한동대학교",
        "fumbles": 6,
        "fumblesLost": 2,
        "fumbleTouchdowns": 0
      },
      {
        "name": "신민호",
        "team": "동의대학교",
        "fumbles": 5,
        "fumblesLost": 3,
        "fumbleTouchdowns": 0
      },
      {
        "name": "이정우",
        "team": "동의대학교",
        "fumbles": 5,
        "fumblesLost": 3,
        "fumbleTouchdowns": 0
      },
      {
        "name": "김상구",
        "team": "용인대학교",
        "fumbles": 5,
        "fumblesLost": 4,
        "fumbleTouchdowns": 0
      },
      {
        "name": "김형준",
        "team": "대구대학교",
        "fumbles": 5,
        "fumblesLost": 1,
        "fumbleTouchdowns": 0
      },
      {
        "name": "주석민",
        "team": "동서대학교",
        "fumbles": 3,
        "fumblesLost": 1,
        "fumbleTouchdowns": 0
      },
      {
        "name": "김성민",
        "team": "울산대학교",
        "fumbles": 3,
        "fumblesLost": 0,
        "fumbleTouchdowns": 0
      },
      {
        "name": "정유성",
        "team": "대구대학교",
        "fumbles": 2,
        "fumblesLost": 1,
        "fumbleTouchdowns": 0
      },
      {
        "name": "진우혁",
        "team": "용인대학교",
        "fumbles": 2,
        "fumblesLost": 1,
        "fumbleTouchdowns": 0
      },
      {
        "name": "허유현",
        "team": "한동대학교",
        "fumbles": 2,
        "fumblesLost": 1,
        "fumbleTouchdowns": 0
      },
      {
        "name": "홍동욱",
        "team": "영남대학교",
        "fumbles": 1,
        "fumblesLost": 0,
        "fumbleTouchdowns": 0
      }
    ],
    "태클": [
      {
        "name": "김용",
        "team": "동의대학교",
        "tackles": 17,
        "sacks": 2,
        "soloTackles": 12,
        "assistTackles": 3
      },
      {
        "name": "김보성",
        "team": "울산대학교",
        "tackles": 13,
        "sacks": 0,
        "soloTackles": 11,
        "assistTackles": 2
      },
      {
        "name": "고동욱",
        "team": "동아대학교",
        "tackles": 10,
        "sacks": 0,
        "soloTackles": 8,
        "assistTackles": 2
      },
      {
        "name": "김성민",
        "team": "울산대학교",
        "tackles": 9,
        "sacks": 0,
        "soloTackles": 8,
        "assistTackles": 1
      },
      {
        "name": "안세훈",
        "team": "한동대학교",
        "tackles": 9,
        "sacks": 0,
        "soloTackles": 9,
        "assistTackles": 0
      },
      {
        "name": "최재혁",
        "team": "한동대학교",
        "tackles": 9,
        "sacks": 0,
        "soloTackles": 8,
        "assistTackles": 1
      },
      {
        "name": "나영진",
        "team": "용인대학교",
        "tackles": 9,
        "sacks": 1,
        "soloTackles": 7,
        "assistTackles": 1
      },
      {
        "name": "김진웅",
        "team": "동서대학교",
        "tackles": 7,
        "sacks": 0,
        "soloTackles": 3,
        "assistTackles": 4
      }
    ],
    "인터셉트": [
      {
        "name": "조성우",
        "team": "대구대학교",
        "interceptions": 3,
        "interceptionTouchdowns": 2,
        "interceptionYards": 120,
        "longestInterception": 84
      },
      {
        "name": "한영웅",
        "team": "울산대학교",
        "interceptions": 3,
        "interceptionTouchdowns": 0,
        "interceptionYards": 5,
        "longestInterception": 5
      },
      {
        "name": "김성민",
        "team": "울산대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 0,
        "longestInterception": 0
      },
      {
        "name": "나영진",
        "team": "용인대학교",
        "interceptions": 2,
        "interceptionTouchdowns": 0,
        "interceptionYards": 4,
        "longestInterception": 4
      },
      {
        "name": "이준서",
        "team": "동서대학교",
        "interceptions": 1,
        "interceptionTouchdowns": 0,
        "interceptionYards": 0,
        "longestInterception": 0
      },
      {
        "name": "안세훈",
        "team": "한동대학교",
        "interceptions": 1,
        "interceptionTouchdowns": 0,
        "interceptionYards": 26,
        "longestInterception": 26
      },
      {
        "name": "김용",
        "team": "동의대학교",
        "interceptions": 1,
        "interceptionTouchdowns": 0,
        "interceptionYards": 0,
        "longestInterception": 0
      },
      {
        "name": "황기범",
        "team": "영남대학교",
        "interceptions": 1,
        "interceptionTouchdowns": 0,
        "interceptionYards": 17,
        "longestInterception": 17
      }
    ],
    "필드골": [
      {
        "name": "최홍민",
        "team": "용인대학교",
        "fieldGoalPercentage": 100,
        "averageFieldGoalDistance": 29,
        "fieldGoalsMade": 1,
        "fieldGoalsAttempted": 1,
        "fieldGoalYards": 29,
        "longestFieldGoal": 29
      },
      {
        "name": "한동혁",
        "team": "대구대학교",
        "fieldGoalPercentage": 100,
        "averageFieldGoalDistance": 29,
        "fieldGoalsMade": 1,
        "fieldGoalsAttempted": 1,
        "fieldGoalYards": 29,
        "longestFieldGoal": 29
      },
      {
        "name": "박동현",
        "team": "영남대학교",
        "fieldGoalPercentage": 0,
        "averageFieldGoalDistance": 0,
        "fieldGoalsMade": 0,
        "fieldGoalsAttempted": 3,
        "fieldGoalYards": 0,
        "longestFieldGoal": 0
      },
      {
        "name": "오석민",
        "team": "동의대학교",
        "fieldGoalPercentage": 0,
        "averageFieldGoalDistance": 0,
        "fieldGoalsMade": 0,
        "fieldGoalsAttempted": 1,
        "fieldGoalYards": 0,
        "longestFieldGoal": 0
      }
    ],
    "킥오프": [
      {
        "name": "최홍민",
        "team": "용인대학교",
        "averageKickoffYards": 60,
        "kickoffCount": 1,
        "kickoffYards": 60,
        "kickoffTouchdowns": 0,
        "longestKickoff": 60
      },
      {
        "name": "황기범",
        "team": "영남대학교",
        "averageKickoffYards": 59,
        "kickoffCount": 2,
        "kickoffYards": 118,
        "kickoffTouchdowns": 0,
        "longestKickoff": 60
      },
      {
        "name": "안세훈",
        "team": "한동대학교",
        "averageKickoffYards": 53,
        "kickoffCount": 4,
        "kickoffYards": 215,
        "kickoffTouchdowns": 0,
        "longestKickoff": 60
      },
      {
        "name": "한동혁",
        "team": "대구대학교",
        "averageKickoffYards": 51,
        "kickoffCount": 21,
        "kickoffYards": 1088,
        "kickoffTouchdowns": 0,
        "longestKickoff": 62
      },
      {
        "name": "오석민",
        "team": "동의대학교",
        "averageKickoffYards": 47,
        "kickoffCount": 13,
        "kickoffYards": 613,
        "kickoffTouchdowns": 0,
        "longestKickoff": 60
      },
      {
        "name": "박동현",
        "team": "영남대학교",
        "averageKickoffYards": 45,
        "kickoffCount": 10,
        "kickoffYards": 450,
        "kickoffTouchdowns": 0,
        "longestKickoff": 60
      },
      {
        "name": "진우혁",
        "team": "용인대학교",
        "averageKickoffYards": 45,
        "kickoffCount": 3,
        "kickoffYards": 135,
        "kickoffTouchdowns": 0,
        "longestKickoff": 55
      },
      {
        "name": "이승하",
        "team": "대구대학교",
        "averageKickoffYards": 45,
        "kickoffCount": 2,
        "kickoffYards": 90,
        "kickoffTouchdowns": 0,
        "longestKickoff": 50
      },
      {
        "name": "김민규",
        "team": "울산대학교",
        "averageKickoffYards": 44,
        "kickoffCount": 3,
        "kickoffYards": 133,
        "kickoffTouchdowns": 0,
        "longestKickoff": 48
      },
      {
        "name": "장수진",
        "team": "울산대학교",
        "averageKickoffYards": 42,
        "kickoffCount": 7,
        "kickoffYards": 295,
        "kickoffTouchdowns": 0,
        "longestKickoff": 58
      },
      {
        "name": "임재민",
        "team": "동아대학교",
        "averageKickoffYards": 41,
        "kickoffCount": 11,
        "kickoffYards": 458,
        "kickoffTouchdowns": 0,
        "longestKickoff": 55
      },
      {
        "name": "이하늘",
        "team": "울산대학교",
        "averageKickoffYards": 37,
        "kickoffCount": 2,
        "kickoffYards": 75,
        "kickoffTouchdowns": 0,
        "longestKickoff": 52
      },
      {
        "name": "장동욱",
        "team": "동서대학교",
        "averageKickoffYards": 35,
        "kickoffCount": 3,
        "kickoffYards": 107,
        "kickoffTouchdowns": 0,
        "longestKickoff": 40
      },
      {
        "name": "주석민",
        "team": "동서대학교",
        "averageKickoffYards": 35,
        "kickoffCount": 9,
        "kickoffYards": 321,
        "kickoffTouchdowns": 0,
        "longestKickoff": 60
      },
      {
        "name": "이기홍",
        "team": "용인대학교",
        "averageKickoffYards": 34,
        "kickoffCount": 18,
        "kickoffYards": 624,
        "kickoffTouchdowns": 0,
        "longestKickoff": 55
      },
      {
        "name": "허유현",
        "team": "한동대학교",
        "averageKickoffYards": 32,
        "kickoffCount": 5,
        "kickoffYards": 160,
        "kickoffTouchdowns": 0,
        "longestKickoff": 50
      },
      {
        "name": "김성범",
        "team": "동서대학교",
        "averageKickoffYards": 24,
        "kickoffCount": 1,
        "kickoffYards": 24,
        "kickoffTouchdowns": 0,
        "longestKickoff": 24
      },
      {
        "name": "김동욱",
        "team": "동아대학교",
        "averageKickoffYards": 24,
        "kickoffCount": 1,
        "kickoffYards": 24,
        "kickoffTouchdowns": 0,
        "longestKickoff": 24
      },
      {
        "name": "최재혁",
        "team": "한동대학교",
        "averageKickoffYards": 23,
        "kickoffCount": 1,
        "kickoffYards": 23,
        "kickoffTouchdowns": 0,
        "longestKickoff": 23
      },
      {
        "name": "정수민",
        "team": "용인대학교",
        "averageKickoffYards": 22,
        "kickoffCount": 2,
        "kickoffYards": 45,
        "kickoffTouchdowns": 0,
        "longestKickoff": 30
      }
    ],
    "킥오프리턴": [
      {
        "name": "이정우",
        "team": "동의대학교",
        "averageKickReturnYards": 35,
        "kickReturnCount": 7,
        "kickReturnYards": 251,
        "kickReturnTouchdowns": 1,
        "longestKickReturn": 86
      },
      {
        "name": "김재한",
        "team": "용인대학교",
        "averageKickReturnYards": 29,
        "kickReturnCount": 9,
        "kickReturnYards": 264,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 42
      },
      {
        "name": "최재혁",
        "team": "한동대학교",
        "averageKickReturnYards": 27,
        "kickReturnCount": 4,
        "kickReturnYards": 109,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 36
      },
      {
        "name": "김범진",
        "team": "대구대학교",
        "averageKickReturnYards": 25,
        "kickReturnCount": 11,
        "kickReturnYards": 284,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 38
      },
      {
        "name": "김재민",
        "team": "동의대학교",
        "averageKickReturnYards": 23,
        "kickReturnCount": 7,
        "kickReturnYards": 165,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 30
      },
      {
        "name": "진우혁",
        "team": "용인대학교",
        "averageKickReturnYards": 21,
        "kickReturnCount": 9,
        "kickReturnYards": 195,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 37
      },
      {
        "name": "이강민",
        "team": "동서대학교",
        "averageKickReturnYards": 21,
        "kickReturnCount": 3,
        "kickReturnYards": 63,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 29
      },
      {
        "name": "안세훈",
        "team": "한동대학교",
        "averageKickReturnYards": 20,
        "kickReturnCount": 5,
        "kickReturnYards": 100,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 33
      },
      {
        "name": "안태현",
        "team": "용인대학교",
        "averageKickReturnYards": 20,
        "kickReturnCount": 2,
        "kickReturnYards": 41,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 26
      },
      {
        "name": "김두호",
        "team": "영남대학교",
        "averageKickReturnYards": 20,
        "kickReturnCount": 11,
        "kickReturnYards": 220,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 30
      },
      {
        "name": "김상구",
        "team": "용인대학교",
        "averageKickReturnYards": 18,
        "kickReturnCount": 1,
        "kickReturnYards": 18,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 18
      },
      {
        "name": "정유성",
        "team": "대구대학교",
        "averageKickReturnYards": 18,
        "kickReturnCount": 5,
        "kickReturnYards": 92,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 23
      },
      {
        "name": "이승하",
        "team": "대구대학교",
        "averageKickReturnYards": 17,
        "kickReturnCount": 7,
        "kickReturnYards": 119,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 24
      },
      {
        "name": "이규재",
        "team": "동의대학교",
        "averageKickReturnYards": 17,
        "kickReturnCount": 2,
        "kickReturnYards": 34,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 21
      },
      {
        "name": "전형진",
        "team": "용인대학교",
        "averageKickReturnYards": 17,
        "kickReturnCount": 1,
        "kickReturnYards": 17,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 17
      },
      {
        "name": "김민규",
        "team": "울산대학교",
        "averageKickReturnYards": 16,
        "kickReturnCount": 1,
        "kickReturnYards": 16,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 16
      },
      {
        "name": "한영웅",
        "team": "울산대학교",
        "averageKickReturnYards": 16,
        "kickReturnCount": 7,
        "kickReturnYards": 117,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 27
      },
      {
        "name": "장민규",
        "team": "울산대학교",
        "averageKickReturnYards": 15,
        "kickReturnCount": 3,
        "kickReturnYards": 47,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 29
      },
      {
        "name": "신민호",
        "team": "동의대학교",
        "averageKickReturnYards": 14,
        "kickReturnCount": 2,
        "kickReturnYards": 28,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 22
      },
      {
        "name": "이준서",
        "team": "동서대학교",
        "averageKickReturnYards": 13,
        "kickReturnCount": 5,
        "kickReturnYards": 69,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 15
      },
      {
        "name": "고태영",
        "team": "동서대학교",
        "averageKickReturnYards": 11,
        "kickReturnCount": 1,
        "kickReturnYards": 11,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 11
      },
      {
        "name": "조성우",
        "team": "대구대학교",
        "averageKickReturnYards": 6,
        "kickReturnCount": 1,
        "kickReturnYards": 6,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 6
      },
      {
        "name": "손승우",
        "team": "동아대학교",
        "averageKickReturnYards": 5,
        "kickReturnCount": 8,
        "kickReturnYards": 41,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 15
      },
      {
        "name": "나영진",
        "team": "용인대학교",
        "averageKickReturnYards": 1,
        "kickReturnCount": 1,
        "kickReturnYards": 1,
        "kickReturnTouchdowns": 0,
        "longestKickReturn": 1
      }
    ],
    "펀트": [
      {
        "name": "최재혁",
        "team": "한동대학교",
        "averagePuntYards": 55,
        "puntCount": 3,
        "puntYards": 167,
        "puntTouchdowns": 0,
        "longestPunt": 66
      },
      {
        "name": "한동혁",
        "team": "대구대학교",
        "averagePuntYards": 42,
        "puntCount": 22,
        "puntYards": 940,
        "puntTouchdowns": 0,
        "longestPunt": 64
      },
      {
        "name": "허유현",
        "team": "한동대학교",
        "averagePuntYards": 40,
        "puntCount": 7,
        "puntYards": 280,
        "puntTouchdowns": 0,
        "longestPunt": 52
      },
      {
        "name": "정수민",
        "team": "용인대학교",
        "averagePuntYards": 38,
        "puntCount": 3,
        "puntYards": 116,
        "puntTouchdowns": 0,
        "longestPunt": 48
      },
      {
        "name": "이기홍",
        "team": "용인대학교",
        "averagePuntYards": 38,
        "puntCount": 18,
        "puntYards": 695,
        "puntTouchdowns": 0,
        "longestPunt": 58
      },
      {
        "name": "박동현",
        "team": "영남대학교",
        "averagePuntYards": 37,
        "puntCount": 11,
        "puntYards": 412,
        "puntTouchdowns": 0,
        "longestPunt": 58
      },
      {
        "name": "장수진",
        "team": "울산대학교",
        "averagePuntYards": 36,
        "puntCount": 7,
        "puntYards": 254,
        "puntTouchdowns": 0,
        "longestPunt": 52
      },
      {
        "name": "오석민",
        "team": "동의대학교",
        "averagePuntYards": 35,
        "puntCount": 13,
        "puntYards": 461,
        "puntTouchdowns": 0,
        "longestPunt": 55
      },
      {
        "name": "임재민",
        "team": "동아대학교",
        "averagePuntYards": 34,
        "puntCount": 9,
        "puntYards": 313,
        "puntTouchdowns": 0,
        "longestPunt": 52
      },
      {
        "name": "주석민",
        "team": "동서대학교",
        "averagePuntYards": 34,
        "puntCount": 11,
        "puntYards": 380,
        "puntTouchdowns": 0,
        "longestPunt": 57
      },
      {
        "name": "장동욱",
        "team": "동서대학교",
        "averagePuntYards": 30,
        "puntCount": 2,
        "puntYards": 60,
        "puntTouchdowns": 0,
        "longestPunt": 33
      },
      {
        "name": "황기범",
        "team": "영남대학교",
        "averagePuntYards": 24,
        "puntCount": 2,
        "puntYards": 48,
        "puntTouchdowns": 0,
        "longestPunt": 33
      }
    ],
    "펀트리턴": [
      {
        "name": "김범진",
        "team": "대구대학교",
        "averagePuntReturnYards": 17,
        "puntReturnCount": 11,
        "puntReturnYards": 189,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 50
      },
      {
        "name": "김재한",
        "team": "용인대학교",
        "averagePuntReturnYards": 16,
        "puntReturnCount": 9,
        "puntReturnYards": 152,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 47
      },
      {
        "name": "이정우",
        "team": "동의대학교",
        "averagePuntReturnYards": 14,
        "puntReturnCount": 7,
        "puntReturnYards": 99,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 25
      },
      {
        "name": "진우혁",
        "team": "용인대학교",
        "averagePuntReturnYards": 14,
        "puntReturnCount": 9,
        "puntReturnYards": 133,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 30
      },
      {
        "name": "김두호",
        "team": "영남대학교",
        "averagePuntReturnYards": 12,
        "puntReturnCount": 11,
        "puntReturnYards": 137,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 24
      },
      {
        "name": "김재민",
        "team": "동의대학교",
        "averagePuntReturnYards": 11,
        "puntReturnCount": 7,
        "puntReturnYards": 79,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 20
      },
      {
        "name": "안세훈",
        "team": "한동대학교",
        "averagePuntReturnYards": 10,
        "puntReturnCount": 5,
        "puntReturnYards": 54,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 17
      },
      {
        "name": "이승하",
        "team": "대구대학교",
        "averagePuntReturnYards": 8,
        "puntReturnCount": 7,
        "puntReturnYards": 60,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 23
      },
      {
        "name": "이준서",
        "team": "동서대학교",
        "averagePuntReturnYards": 8,
        "puntReturnCount": 5,
        "puntReturnYards": 43,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 13
      },
      {
        "name": "이강민",
        "team": "동서대학교",
        "averagePuntReturnYards": 7,
        "puntReturnCount": 3,
        "puntReturnYards": 21,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 15
      },
      {
        "name": "정유성",
        "team": "대구대학교",
        "averagePuntReturnYards": 7,
        "puntReturnCount": 5,
        "puntReturnYards": 36,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 12
      },
      {
        "name": "한영웅",
        "team": "울산대학교",
        "averagePuntReturnYards": 7,
        "puntReturnCount": 7,
        "puntReturnYards": 52,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 15
      },
      {
        "name": "손승우",
        "team": "동아대학교",
        "averagePuntReturnYards": 6,
        "puntReturnCount": 8,
        "puntReturnYards": 48,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 8
      },
      {
        "name": "장민규",
        "team": "울산대학교",
        "averagePuntReturnYards": 6,
        "puntReturnCount": 3,
        "puntReturnYards": 18,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 8
      },
      {
        "name": "고태영",
        "team": "동서대학교",
        "averagePuntReturnYards": 5,
        "puntReturnCount": 1,
        "puntReturnYards": 5,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 5
      },
      {
        "name": "최재혁",
        "team": "한동대학교",
        "averagePuntReturnYards": 5,
        "puntReturnCount": 4,
        "puntReturnYards": 20,
        "puntReturnTouchdowns": 0,
        "longestPuntReturn": 12
      }
    ]
  }
};

/* ─────────────────────────  메인 컴포넌트  ───────────────────────── */
export default function StatPlayer({ teams = [] }) {
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

  // 데이터 가져오기
  const getCurrentData = () => {
    let leagueData;
    
    if (league === '서울') {
      leagueData = seoulPlayerData;
    } else if (league === '경기강원') {
      leagueData = gyeonggiPlayerData;
    } else if (league === '대구경북') {
      leagueData = daeguPlayerData;
    } else if (league === '부산경남') {
      leagueData = busanPlayerData;
    } else if (league === '사회인') {
      const socialData = {
        '런': [
          {"name":"김영인","team":"서울 골든이글스","rushingYards":407,"yardsPerCarry":6.4,"rushingAttempts":64,"rushingTouchdowns":5,"longestRush":42},
          {"name":"이기태","team":"부산 그리폰즈","rushingYards":315,"yardsPerCarry":6.1,"rushingAttempts":52,"rushingTouchdowns":5,"longestRush":64},
          {"name":"배준호","team":"삼성 블루스톰","rushingYards":277,"yardsPerCarry":5.0,"rushingAttempts":55,"rushingTouchdowns":2,"longestRush":37},
          {"name":"최재혁","team":"부산 그리폰즈","rushingYards":268,"yardsPerCarry":6.0,"rushingAttempts":45,"rushingTouchdowns":3,"longestRush":61},
          {"name":"손창민","team":"삼성 블루스톰","rushingYards":236,"yardsPerCarry":6.6,"rushingAttempts":36,"rushingTouchdowns":0,"longestRush":30},
          {"name":"박용운","team":"서울 디펜더스","rushingYards":213,"yardsPerCarry":5.9,"rushingAttempts":36,"rushingTouchdowns":2,"longestRush":39},
          {"name":"이민우","team":"군위 피닉스","rushingYards":208,"yardsPerCarry":5.3,"rushingAttempts":39,"rushingTouchdowns":2,"longestRush":27},
          {"name":"박지호","team":"인천 라이노스","rushingYards":197,"yardsPerCarry":19.7,"rushingAttempts":10,"rushingTouchdowns":2,"longestRush":89},
          {"name":"최경서","team":"삼성 블루스톰","rushingYards":156,"yardsPerCarry":8.2,"rushingAttempts":19,"rushingTouchdowns":2,"longestRush":47},
          {"name":"김남기","team":"서울 디펜더스","rushingYards":156,"yardsPerCarry":3.3,"rushingAttempts":48,"rushingTouchdowns":0,"longestRush":18},
          {"name":"한재덕","team":"서울 바이킹스","rushingYards":152,"yardsPerCarry":3.5,"rushingAttempts":43,"rushingTouchdowns":0,"longestRush":15},
          {"name":"전재영","team":"군위 피닉스","rushingYards":124,"yardsPerCarry":3.3,"rushingAttempts":38,"rushingTouchdowns":0,"longestRush":20},
          {"name":"이찬우","team":"삼성 블루스톰","rushingYards":124,"yardsPerCarry":3.9,"rushingAttempts":32,"rushingTouchdowns":3,"longestRush":21},
          {"name":"최훈식","team":"군위 피닉스","rushingYards":111,"yardsPerCarry":7.4,"rushingAttempts":15,"rushingTouchdowns":1,"longestRush":31},
          {"name":"고도영","team":"부산 그리폰즈","rushingYards":101,"yardsPerCarry":5.6,"rushingAttempts":18,"rushingTouchdowns":0,"longestRush":21},
          {"name":"황병하","team":"서울 골든이글스","rushingYards":97,"yardsPerCarry":2.9,"rushingAttempts":34,"rushingTouchdowns":2,"longestRush":17},
          {"name":"손지우","team":"군위 피닉스","rushingYards":96,"yardsPerCarry":3.8,"rushingAttempts":25,"rushingTouchdowns":2,"longestRush":14},
          {"name":"스위프트(Gregg Swift)","team":"서울 디펜더스","rushingYards":78,"yardsPerCarry":5.6,"rushingAttempts":14,"rushingTouchdowns":1,"longestRush":13},
          {"name":"염준석","team":"서울 골든이글스","rushingYards":74,"yardsPerCarry":5.7,"rushingAttempts":13,"rushingTouchdowns":0,"longestRush":23},
          {"name":"문민섭","team":"부산 그리폰즈","rushingYards":73,"yardsPerCarry":3.8,"rushingAttempts":19,"rushingTouchdowns":0,"longestRush":14},
          {"name":"강도형","team":"부산 그리폰즈","rushingYards":69,"yardsPerCarry":4.3,"rushingAttempts":16,"rushingTouchdowns":0,"longestRush":18},
          {"name":"김세종","team":"군위 피닉스","rushingYards":64,"yardsPerCarry":5.3,"rushingAttempts":12,"rushingTouchdowns":2,"longestRush":27},
          {"name":"박영화","team":"서울 디펜더스","rushingYards":60,"yardsPerCarry":2.9,"rushingAttempts":21,"rushingTouchdowns":0,"longestRush":26},
          {"name":"이재건","team":"부산 그리폰즈","rushingYards":60,"yardsPerCarry":10.0,"rushingAttempts":6,"rushingTouchdowns":1,"longestRush":18},
          {"name":"신정한","team":"인천 라이노스","rushingYards":56,"yardsPerCarry":3.3,"rushingAttempts":17,"rushingTouchdowns":2,"longestRush":14},
          {"name":"김상완","team":"삼성 블루스톰","rushingYards":55,"yardsPerCarry":5.0,"rushingAttempts":11,"rushingTouchdowns":1,"longestRush":13},
          {"name":"정명주","team":"부산 그리폰즈","rushingYards":52,"yardsPerCarry":5.2,"rushingAttempts":10,"rushingTouchdowns":0,"longestRush":20},
          {"name":"고동현","team":"인천 라이노스","rushingYards":50,"yardsPerCarry":3.3,"rushingAttempts":15,"rushingTouchdowns":0,"longestRush":13},
          {"name":"이대기","team":"서울 골든이글스","rushingYards":44,"yardsPerCarry":5.5,"rushingAttempts":8,"rushingTouchdowns":0,"longestRush":20},
          {"name":"Willie Woodard","team":"서울 디펜더스","rushingYards":37,"yardsPerCarry":5.3,"rushingAttempts":7,"rushingTouchdowns":0,"longestRush":20},
          {"name":"김민수","team":"서울 바이킹스","rushingYards":34,"yardsPerCarry":0.8,"rushingAttempts":44,"rushingTouchdowns":0,"longestRush":12},
          {"name":"김현호","team":"부산 그리폰즈","rushingYards":24,"yardsPerCarry":2.4,"rushingAttempts":10,"rushingTouchdowns":0,"longestRush":18},
          {"name":"이도현","team":"서울 바이킹스","rushingYards":22,"yardsPerCarry":2.2,"rushingAttempts":10,"rushingTouchdowns":1,"longestRush":8},
          {"name":"신용우","team":"인천 라이노스","rushingYards":18,"yardsPerCarry":2.0,"rushingAttempts":9,"rushingTouchdowns":1,"longestRush":9},
          {"name":"이동환","team":"부산 그리폰즈","rushingYards":18,"yardsPerCarry":3.0,"rushingAttempts":6,"rushingTouchdowns":1,"longestRush":6},
          {"name":"손해원","team":"삼성 블루스톰","rushingYards":17,"yardsPerCarry":5.7,"rushingAttempts":3,"rushingTouchdowns":0,"longestRush":12},
          {"name":"강지원","team":"삼성 블루스톰","rushingYards":15,"yardsPerCarry":1.7,"rushingAttempts":9,"rushingTouchdowns":0,"longestRush":5},
          {"name":"이정윤","team":"서울 골든이글스","rushingYards":15,"yardsPerCarry":1.9,"rushingAttempts":8,"rushingTouchdowns":0,"longestRush":8},
          {"name":"조현수","team":"군위 피닉스","rushingYards":15,"yardsPerCarry":1.7,"rushingAttempts":9,"rushingTouchdowns":0,"longestRush":3},
          {"name":"김우혁","team":"서울 바이킹스","rushingYards":14,"yardsPerCarry":4.7,"rushingAttempts":3,"rushingTouchdowns":0,"longestRush":8},
          {"name":"정우진","team":"삼성 블루스톰","rushingYards":12,"yardsPerCarry":12.0,"rushingAttempts":1,"rushingTouchdowns":0,"longestRush":12},
          {"name":"하민수","team":"군위 피닉스","rushingYards":11,"yardsPerCarry":3.7,"rushingAttempts":3,"rushingTouchdowns":0,"longestRush":11},
          {"name":"류태정","team":"부산 그리폰즈","rushingYards":10,"yardsPerCarry":10.0,"rushingAttempts":1,"rushingTouchdowns":0,"longestRush":10},
          {"name":"김찬솔","team":"인천 라이노스","rushingYards":10,"yardsPerCarry":5.0,"rushingAttempts":2,"rushingTouchdowns":0,"longestRush":5},
          {"name":"최근수","team":"인천 라이노스","rushingYards":9,"yardsPerCarry":4.5,"rushingAttempts":2,"rushingTouchdowns":0,"longestRush":8},
          {"name":"현봉민","team":"부산 그리폰즈","rushingYards":8,"yardsPerCarry":1.3,"rushingAttempts":6,"rushingTouchdowns":0,"longestRush":6},
          {"name":"황준근","team":"삼성 블루스톰","rushingYards":7,"yardsPerCarry":7.0,"rushingAttempts":1,"rushingTouchdowns":0,"longestRush":7},
          {"name":"조지훈","team":"삼성 블루스톰","rushingYards":7,"yardsPerCarry":1.0,"rushingAttempts":7,"rushingTouchdowns":0,"longestRush":14},
          {"name":"지현학","team":"군위 피닉스","rushingYards":7,"yardsPerCarry":2.3,"rushingAttempts":3,"rushingTouchdowns":0,"longestRush":11},
          {"name":"유서백","team":"삼성 블루스톰","rushingYards":7,"yardsPerCarry":3.5,"rushingAttempts":2,"rushingTouchdowns":0,"longestRush":4}
        ],
        '패스': [
          {"name":"이민우","team":"군위 피닉스","passingYards":827,"avgYardsPerAttempt":6.3,"completionPercentage":48.5,"passingAttempts":132,"passingCompletions":64,"passingTouchdowns":8,"interceptions":2,"longestPass":64},
          {"name":"박용운","team":"서울 디펜더스","passingYards":564,"avgYardsPerAttempt":6.4,"completionPercentage":54.5,"passingAttempts":88,"passingCompletions":48,"passingTouchdowns":3,"interceptions":2,"longestPass":58},
          {"name":"이찬우","team":"삼성 블루스톰","passingYards":537,"avgYardsPerAttempt":7.6,"completionPercentage":56.3,"passingAttempts":71,"passingCompletions":40,"passingTouchdowns":3,"interceptions":7,"longestPass":75},
          {"name":"정승호","team":"서울 골든이글스","passingYards":521,"avgYardsPerAttempt":4.6,"completionPercentage":45.6,"passingAttempts":114,"passingCompletions":52,"passingTouchdowns":4,"interceptions":7,"longestPass":32},
          {"name":"고도영","team":"부산 그리폰즈","passingYards":373,"avgYardsPerAttempt":4.1,"completionPercentage":45.6,"passingAttempts":90,"passingCompletions":41,"passingTouchdowns":1,"interceptions":6,"longestPass":72},
          {"name":"남현욱","team":"서울 바이킹스","passingYards":351,"avgYardsPerAttempt":7.6,"completionPercentage":45.7,"passingAttempts":46,"passingCompletions":21,"passingTouchdowns":4,"interceptions":0,"longestPass":72},
          {"name":"신정한","team":"인천 라이노스","passingYards":350,"avgYardsPerAttempt":5.7,"completionPercentage":55.7,"passingAttempts":61,"passingCompletions":34,"passingTouchdowns":3,"interceptions":1,"longestPass":65},
          {"name":"신용우","team":"인천 라이노스","passingYards":236,"avgYardsPerAttempt":5.1,"completionPercentage":58.7,"passingAttempts":46,"passingCompletions":27,"passingTouchdowns":1,"interceptions":1,"longestPass":28},
          {"name":"김상완","team":"삼성 블루스톰","passingYards":202,"avgYardsPerAttempt":3.5,"completionPercentage":36.2,"passingAttempts":58,"passingCompletions":21,"passingTouchdowns":2,"interceptions":5,"longestPass":26},
          {"name":"하민수","team":"군위 피닉스","passingYards":123,"avgYardsPerAttempt":6.8,"completionPercentage":50.0,"passingAttempts":18,"passingCompletions":9,"passingTouchdowns":0,"interceptions":2,"longestPass":33},
          {"name":"김연준","team":"인천 라이노스","passingYards":101,"avgYardsPerAttempt":4.0,"completionPercentage":60.0,"passingAttempts":25,"passingCompletions":15,"passingTouchdowns":0,"interceptions":1,"longestPass":22},
          {"name":"스위프트(Gregg Swift)","team":"서울 디펜더스","passingYards":87,"avgYardsPerAttempt":6.2,"completionPercentage":50.0,"passingAttempts":14,"passingCompletions":7,"passingTouchdowns":1,"interceptions":2,"longestPass":33},
          {"name":"이대기","team":"서울 골든이글스","passingYards":68,"avgYardsPerAttempt":4.0,"completionPercentage":47.1,"passingAttempts":17,"passingCompletions":8,"passingTouchdowns":1,"interceptions":2,"longestPass":40},
          {"name":"염준석","team":"서울 골든이글스","passingYards":39,"avgYardsPerAttempt":13.0,"completionPercentage":33.3,"passingAttempts":3,"passingCompletions":1,"passingTouchdowns":1,"interceptions":0,"longestPass":39},
          {"name":"배준호","team":"삼성 블루스톰","passingYards":34,"avgYardsPerAttempt":34.0,"completionPercentage":100.0,"passingAttempts":1,"passingCompletions":1,"passingTouchdowns":1,"interceptions":0,"longestPass":34},
          {"name":"김세종","team":"군위 피닉스","passingYards":13,"avgYardsPerAttempt":1.3,"completionPercentage":20.0,"passingAttempts":10,"passingCompletions":2,"passingTouchdowns":1,"interceptions":1,"longestPass":7},
          {"name":"지현학","team":"군위 피닉스","passingYards":0,"avgYardsPerAttempt":0.0,"completionPercentage":0.0,"passingAttempts":1,"passingCompletions":0,"passingTouchdowns":0,"interceptions":0,"longestPass":0},
          {"name":"이승엽","team":"서울 바이킹스","passingYards":0,"avgYardsPerAttempt":0.0,"completionPercentage":0.0,"passingAttempts":1,"passingCompletions":0,"passingTouchdowns":0,"interceptions":1,"longestPass":0}
        ],
        '리시빙': [
          {"name":"신승한","team":"인천 라이노스","receptions":29,"receivingYards":322,"yardsPerReception":11.1,"receivingTouchdowns":1,"longestReception":65},
          {"name":"염준석","team":"서울 골든이글스","receptions":19,"receivingYards":163,"yardsPerReception":8.6,"receivingTouchdowns":1,"longestReception":25},
          {"name":"김세종","team":"군위 피닉스","receptions":19,"receivingYards":339,"yardsPerReception":17.8,"receivingTouchdowns":3,"longestReception":64},
          {"name":"조지훈","team":"삼성 블루스톰","receptions":19,"receivingYards":197,"yardsPerReception":10.4,"receivingTouchdowns":0,"longestReception":26},
          {"name":"최경서","team":"삼성 블루스톰","receptions":17,"receivingYards":393,"yardsPerReception":23.1,"receivingTouchdowns":5,"longestReception":77},
          {"name":"안정원","team":"서울 디펜더스","receptions":16,"receivingYards":189,"yardsPerReception":11.8,"receivingTouchdowns":1,"longestReception":41},
          {"name":"지현학","team":"군위 피닉스","receptions":16,"receivingYards":161,"yardsPerReception":10.1,"receivingTouchdowns":3,"longestReception":28},
          {"name":"이지누폴","team":"서울 바이킹스","receptions":15,"receivingYards":196,"yardsPerReception":13.1,"receivingTouchdowns":1,"longestReception":59},
          {"name":"김우혁","team":"서울 바이킹스","receptions":14,"receivingYards":196,"yardsPerReception":14.0,"receivingTouchdowns":3,"longestReception":72},
          {"name":"김현호","team":"부산 그리폰즈","receptions":13,"receivingYards":151,"yardsPerReception":11.6,"receivingTouchdowns":0,"longestReception":54},
          {"name":"권예준","team":"서울 골든이글스","receptions":12,"receivingYards":120,"yardsPerReception":10.0,"receivingTouchdowns":1,"longestReception":32},
          {"name":"이상윤","team":"부산 그리폰즈","receptions":12,"receivingYards":151,"yardsPerReception":12.6,"receivingTouchdowns":1,"longestReception":72},
          {"name":"신현솔","team":"군위 피닉스","receptions":11,"receivingYards":115,"yardsPerReception":10.5,"receivingTouchdowns":1,"longestReception":33},
          {"name":"김동휘","team":"서울 디펜더스","receptions":9,"receivingYards":158,"yardsPerReception":17.6,"receivingTouchdowns":1,"longestReception":58},
          {"name":"박수호","team":"서울 디펜더스","receptions":9,"receivingYards":86,"yardsPerReception":9.6,"receivingTouchdowns":0,"longestReception":17},
          {"name":"손해원","team":"삼성 블루스톰","receptions":9,"receivingYards":82,"yardsPerReception":9.1,"receivingTouchdowns":0,"longestReception":21},
          {"name":"스위프트(Gregg Swift)","team":"서울 디펜더스","receptions":9,"receivingYards":144,"yardsPerReception":16.0,"receivingTouchdowns":1,"longestReception":45},
          {"name":"김태형","team":"인천 라이노스","receptions":9,"receivingYards":88,"yardsPerReception":9.8,"receivingTouchdowns":0,"longestReception":22},
          {"name":"오성찬","team":"군위 피닉스","receptions":8,"receivingYards":89,"yardsPerReception":11.1,"receivingTouchdowns":0,"longestReception":36},
          {"name":"Donovan Lee Hunt","team":"서울 골든이글스","receptions":7,"receivingYards":97,"yardsPerReception":13.9,"receivingTouchdowns":2,"longestReception":40},
          {"name":"김찬솔","team":"인천 라이노스","receptions":7,"receivingYards":76,"yardsPerReception":10.9,"receivingTouchdowns":1,"longestReception":28},
          {"name":"손창민","team":"삼성 블루스톰","receptions":6,"receivingYards":88,"yardsPerReception":14.7,"receivingTouchdowns":0,"longestReception":35},
          {"name":"강도형","team":"부산 그리폰즈","receptions":6,"receivingYards":28,"yardsPerReception":4.7,"receivingTouchdowns":0,"longestReception":8},
          {"name":"최재훈","team":"인천 라이노스","receptions":6,"receivingYards":60,"yardsPerReception":10.0,"receivingTouchdowns":0,"longestReception":21},
          {"name":"이준연","team":"군위 피닉스","receptions":5,"receivingYards":45,"yardsPerReception":9.0,"receivingTouchdowns":0,"longestReception":16},
          {"name":"정태영","team":"서울 디펜더스","receptions":5,"receivingYards":79,"yardsPerReception":15.8,"receivingTouchdowns":1,"longestReception":35},
          {"name":"최근수","team":"인천 라이노스","receptions":5,"receivingYards":28,"yardsPerReception":5.6,"receivingTouchdowns":0,"longestReception":10},
          {"name":"김우영","team":"서울 바이킹스","receptions":5,"receivingYards":39,"yardsPerReception":7.8,"receivingTouchdowns":0,"longestReception":16},
          {"name":"김상현","team":"군위 피닉스","receptions":5,"receivingYards":63,"yardsPerReception":12.6,"receivingTouchdowns":1,"longestReception":17},
          {"name":"한재덕","team":"서울 바이킹스","receptions":5,"receivingYards":29,"yardsPerReception":5.8,"receivingTouchdowns":0,"longestReception":12},
          {"name":"이준영","team":"서울 골든이글스","receptions":5,"receivingYards":27,"yardsPerReception":5.4,"receivingTouchdowns":0,"longestReception":10},
          {"name":"정우진","team":"삼성 블루스톰","receptions":4,"receivingYards":41,"yardsPerReception":10.3,"receivingTouchdowns":0,"longestReception":24},
          {"name":"류태정","team":"부산 그리폰즈","receptions":4,"receivingYards":22,"yardsPerReception":5.5,"receivingTouchdowns":0,"longestReception":9},
          {"name":"최재혁","team":"부산 그리폰즈","receptions":4,"receivingYards":20,"yardsPerReception":5.0,"receivingTouchdowns":0,"longestReception":12},
          {"name":"정진","team":"서울 골든이글스","receptions":4,"receivingYards":64,"yardsPerReception":16.0,"receivingTouchdowns":0,"longestReception":21},
          {"name":"김민수","team":"서울 바이킹스","receptions":3,"receivingYards":9,"yardsPerReception":3.0,"receivingTouchdowns":0,"longestReception":5},
          {"name":"박신천","team":"군위 피닉스","receptions":3,"receivingYards":33,"yardsPerReception":11.0,"receivingTouchdowns":0,"longestReception":18},
          {"name":"은종현","team":"서울 골든이글스","receptions":3,"receivingYards":25,"yardsPerReception":8.3,"receivingTouchdowns":0,"longestReception":9},
          {"name":"이휘채","team":"서울 골든이글스","receptions":3,"receivingYards":26,"yardsPerReception":8.7,"receivingTouchdowns":0,"longestReception":11},
          {"name":"Cory Creshaw","team":"서울 바이킹스","receptions":3,"receivingYards":3,"yardsPerReception":1.0,"receivingTouchdowns":0,"longestReception":2},
          {"name":"김남기","team":"서울 디펜더스","receptions":3,"receivingYards":20,"yardsPerReception":6.7,"receivingTouchdowns":0,"longestReception":8},
          {"name":"배준호","team":"삼성 블루스톰","receptions":3,"receivingYards":64,"yardsPerReception":21.3,"receivingTouchdowns":1,"longestReception":42},
          {"name":"부윤재","team":"인천 라이노스","receptions":3,"receivingYards":8,"yardsPerReception":2.7,"receivingTouchdowns":0,"longestReception":6},
          {"name":"민승현","team":"군위 피닉스","receptions":2,"receivingYards":40,"yardsPerReception":20.0,"receivingTouchdowns":0,"longestReception":33},
          {"name":"고동현","team":"인천 라이노스","receptions":2,"receivingYards":20,"yardsPerReception":10.0,"receivingTouchdowns":0,"longestReception":12},
          {"name":"박지호","team":"인천 라이노스","receptions":2,"receivingYards":2,"yardsPerReception":1.0,"receivingTouchdowns":0,"longestReception":2},
          {"name":"손지우","team":"군위 피닉스","receptions":2,"receivingYards":14,"yardsPerReception":7.0,"receivingTouchdowns":1,"longestReception":12},
          {"name":"전홍덕","team":"삼성 블루스톰","receptions":2,"receivingYards":11,"yardsPerReception":5.5,"receivingTouchdowns":0,"longestReception":8},
          {"name":"말릭 (Malik)","team":"서울 디펜더스","receptions":2,"receivingYards":12,"yardsPerReception":6.0,"receivingTouchdowns":0,"longestReception":7},
          {"name":"안준범","team":"인천 라이노스","receptions":2,"receivingYards":16,"yardsPerReception":8.0,"receivingTouchdowns":0,"longestReception":9}
        ],
        '펌블': [
          {"name":"정승호","team":"서울 골든이글스","fumbles":7,"fumblesLost":3,"fumbleTouchdowns":0},
          {"name":"남현욱","team":"서울 바이킹스","fumbles":5,"fumblesLost":3,"fumbleTouchdowns":0},
          {"name":"박용운","team":"서울 디펜더스","fumbles":4,"fumblesLost":1,"fumbleTouchdowns":0},
          {"name":"김영인","team":"서울 골든이글스","fumbles":4,"fumblesLost":3,"fumbleTouchdowns":0},
          {"name":"이기태","team":"부산 그리폰즈","fumbles":4,"fumblesLost":3,"fumbleTouchdowns":0},
          {"name":"이찬우","team":"삼성 블루스톰","fumbles":4,"fumblesLost":2,"fumbleTouchdowns":0},
          {"name":"손창민","team":"삼성 블루스톰","fumbles":4,"fumblesLost":1,"fumbleTouchdowns":0},
          {"name":"이민우","team":"군위 피닉스","fumbles":4,"fumblesLost":1,"fumbleTouchdowns":0},
          {"name":"한재덕","team":"서울 바이킹스","fumbles":4,"fumblesLost":1,"fumbleTouchdowns":0},
          {"name":"현봉민","team":"부산 그리폰즈","fumbles":3,"fumblesLost":0,"fumbleTouchdowns":0},
          {"name":"배준호","team":"삼성 블루스톰","fumbles":3,"fumblesLost":0,"fumbleTouchdowns":0},
          {"name":"신정한","team":"인천 라이노스","fumbles":3,"fumblesLost":2,"fumbleTouchdowns":0},
          {"name":"고도영","team":"부산 그리폰즈","fumbles":3,"fumblesLost":1,"fumbleTouchdowns":0},
          {"name":"신용우","team":"인천 라이노스","fumbles":2,"fumblesLost":1,"fumbleTouchdowns":0},
          {"name":"하민수","team":"군위 피닉스","fumbles":2,"fumblesLost":1,"fumbleTouchdowns":0},
          {"name":"김연준","team":"인천 라이노스","fumbles":2,"fumblesLost":0,"fumbleTouchdowns":0},
          {"name":"안정원","team":"서울 디펜더스","fumbles":1,"fumblesLost":0,"fumbleTouchdowns":0},
          {"name":"최훈식","team":"군위 피닉스","fumbles":1,"fumblesLost":1,"fumbleTouchdowns":0},
          {"name":"이재건","team":"부산 그리폰즈","fumbles":1,"fumblesLost":0,"fumbleTouchdowns":0},
          {"name":"김영훈","team":"인천 라이노스","fumbles":1,"fumblesLost":0,"fumbleTouchdowns":0},
          {"name":"강지원","team":"삼성 블루스톰","fumbles":1,"fumblesLost":0,"fumbleTouchdowns":0},
          {"name":"조지훈","team":"삼성 블루스톰","fumbles":1,"fumblesLost":1,"fumbleTouchdowns":0},
          {"name":"고동현","team":"인천 라이노스","fumbles":1,"fumblesLost":0,"fumbleTouchdowns":0},
          {"name":"염준석","team":"서울 골든이글스","fumbles":1,"fumblesLost":0,"fumbleTouchdowns":0},
          {"name":"김우혁","team":"서울 바이킹스","fumbles":1,"fumblesLost":0,"fumbleTouchdowns":0},
          {"name":"안준범","team":"인천 라이노스","fumbles":1,"fumblesLost":0,"fumbleTouchdowns":0},
          {"name":"황윤경","team":"군위 피닉스","fumbles":1,"fumblesLost":0,"fumbleTouchdowns":0},
          {"name":"지현학","team":"군위 피닉스","fumbles":1,"fumblesLost":0,"fumbleTouchdowns":0},
          {"name":"이대기","team":"서울 골든이글스","fumbles":1,"fumblesLost":1,"fumbleTouchdowns":0},
          {"name":"김남기","team":"서울 디펜더스","fumbles":1,"fumblesLost":0,"fumbleTouchdowns":0},
          {"name":"최재훈","team":"인천 라이노스","fumbles":1,"fumblesLost":0,"fumbleTouchdowns":0},
          {"name":"이정규","team":"인천 라이노스","fumbles":1,"fumblesLost":0,"fumbleTouchdowns":0},
          {"name":"김찬솔","team":"인천 라이노스","fumbles":1,"fumblesLost":1,"fumbleTouchdowns":0},
          {"name":"전홍덕","team":"삼성 블루스톰","fumbles":1,"fumblesLost":0,"fumbleTouchdowns":0}
        ],
        '태클': [
          {"name":"우제욱","team":"삼성 블루스톰","tackles":27,"sacks":0,"soloTackles":18,"assistTackles":9},
          {"name":"박경균","team":"서울 바이킹스","tackles":22,"sacks":0,"soloTackles":17,"assistTackles":5},
          {"name":"김병규","team":"부산 그리폰즈","tackles":20,"sacks":1,"soloTackles":13,"assistTackles":6},
          {"name":"황준근","team":"삼성 블루스톰","tackles":20,"sacks":2,"soloTackles":14,"assistTackles":4},
          {"name":"이용준","team":"인천 라이노스","tackles":19,"sacks":0,"soloTackles":11,"assistTackles":8},
          {"name":"박시현","team":"서울 바이킹스","tackles":19,"sacks":1,"soloTackles":11,"assistTackles":7},
          {"name":"류도현","team":"서울 골든이글스","tackles":18,"sacks":0,"soloTackles":13,"assistTackles":5},
          {"name":"황미륵","team":"서울 디펜더스","tackles":18,"sacks":3,"soloTackles":11,"assistTackles":4},
          {"name":"김상진","team":"삼성 블루스톰","tackles":16,"sacks":0,"soloTackles":14,"assistTackles":2},
          {"name":"김도헌","team":"인천 라이노스","tackles":16,"sacks":0,"soloTackles":11,"assistTackles":5},
          {"name":"김용환","team":"군위 피닉스","tackles":16,"sacks":0,"soloTackles":12,"assistTackles":4},
          {"name":"김현호","team":"부산 그리폰즈","tackles":16,"sacks":0,"soloTackles":12,"assistTackles":4},
          {"name":"이재복","team":"서울 바이킹스","tackles":16,"sacks":0,"soloTackles":11,"assistTackles":5},
          {"name":"권순우","team":"서울 골든이글스","tackles":15,"sacks":2,"soloTackles":7,"assistTackles":6},
          {"name":"강대련","team":"인천 라이노스","tackles":15,"sacks":0,"soloTackles":10,"assistTackles":5},
          {"name":"민홍","team":"서울 골든이글스","tackles":15,"sacks":0,"soloTackles":11,"assistTackles":4},
          {"name":"안준호","team":"서울 바이킹스","tackles":15,"sacks":1,"soloTackles":10,"assistTackles":4},
          {"name":"박준수","team":"부산 그리폰즈","tackles":15,"sacks":2,"soloTackles":7,"assistTackles":6},
          {"name":"이재건","team":"부산 그리폰즈","tackles":14,"sacks":0,"soloTackles":11,"assistTackles":3},
          {"name":"안태현","team":"군위 피닉스","tackles":14,"sacks":4,"soloTackles":8,"assistTackles":2},
          {"name":"정현우","team":"부산 그리폰즈","tackles":13,"sacks":0,"soloTackles":6,"assistTackles":7},
          {"name":"정예담","team":"서울 골든이글스","tackles":12,"sacks":2,"soloTackles":8,"assistTackles":2},
          {"name":"박영화","team":"서울 디펜더스","tackles":12,"sacks":0,"soloTackles":11,"assistTackles":1},
          {"name":"이준기","team":"서울 바이킹스","tackles":12,"sacks":0,"soloTackles":9,"assistTackles":3},
          {"name":"이정규","team":"인천 라이노스","tackles":12,"sacks":1,"soloTackles":7,"assistTackles":4},
          {"name":"김성연","team":"군위 피닉스","tackles":12,"sacks":0,"soloTackles":9,"assistTackles":3},
          {"name":"김태수","team":"삼성 블루스톰","tackles":11,"sacks":0,"soloTackles":8,"assistTackles":3},
          {"name":"양두열","team":"군위 피닉스","tackles":11,"sacks":0,"soloTackles":8,"assistTackles":3},
          {"name":"김한주","team":"삼성 블루스톰","tackles":11,"sacks":1,"soloTackles":4,"assistTackles":6},
          {"name":"이지윤","team":"서울 골든이글스","tackles":11,"sacks":0,"soloTackles":8,"assistTackles":3},
          {"name":"엄재원","team":"군위 피닉스","tackles":11,"sacks":1,"soloTackles":7,"assistTackles":3},
          {"name":"최정희","team":"서울 바이킹스","tackles":11,"sacks":1,"soloTackles":7,"assistTackles":3},
          {"name":"김우석","team":"부산 그리폰즈","tackles":11,"sacks":2,"soloTackles":8,"assistTackles":1},
          {"name":"임준형","team":"서울 바이킹스","tackles":11,"sacks":0,"soloTackles":9,"assistTackles":2},
          {"name":"스위프트","team":"서울 디펜더스","tackles":11,"sacks":0,"soloTackles":8,"assistTackles":3},
          {"name":"배용희","team":"군위 피닉스","tackles":10,"sacks":0,"soloTackles":9,"assistTackles":1},
          {"name":"김도헌","team":"삼성 블루스톰","tackles":10,"sacks":0,"soloTackles":8,"assistTackles":2},
          {"name":"현성준","team":"부산 그리폰즈","tackles":10,"sacks":0,"soloTackles":10,"assistTackles":0},
          {"name":"박재상","team":"서울 디펜더스","tackles":10,"sacks":0,"soloTackles":6,"assistTackles":4},
          {"name":"권오윤","team":"서울 바이킹스","tackles":10,"sacks":1,"soloTackles":8,"assistTackles":1},
          {"name":"홍재화","team":"인천 라이노스","tackles":10,"sacks":0,"soloTackles":8,"assistTackles":2},
          {"name":"김희준","team":"인천 라이노스","tackles":10,"sacks":0,"soloTackles":6,"assistTackles":4},
          {"name":"정기훈","team":"서울 골든이글스","tackles":10,"sacks":0,"soloTackles":9,"assistTackles":1},
          {"name":"김민수","team":"서울 디펜더스","tackles":10,"sacks":0,"soloTackles":6,"assistTackles":4},
          {"name":"서호진","team":"부산 그리폰즈","tackles":10,"sacks":0,"soloTackles":7,"assistTackles":3},
          {"name":"김광록","team":"삼성 블루스톰","tackles":9,"sacks":0,"soloTackles":3,"assistTackles":6},
          {"name":"황윤경","team":"군위 피닉스","tackles":9,"sacks":0,"soloTackles":9,"assistTackles":0},
          {"name":"조문현","team":"서울 골든이글스","tackles":9,"sacks":0,"soloTackles":4,"assistTackles":5},
          {"name":"윤석규","team":"인천 라이노스","tackles":9,"sacks":0,"soloTackles":5,"assistTackles":4},
          {"name":"이준하","team":"서울 골든이글스","tackles":9,"sacks":0,"soloTackles":7,"assistTackles":2}
        ],
        '인터셉트': [
          {"name":"스위프트","team":"서울 디펜더스","interceptions":4,"interceptionTouchdowns":0,"interceptionYards":58,"longestInterception":20},
          {"name":"임준형","team":"서울 바이킹스","interceptions":3,"interceptionTouchdowns":0,"interceptionYards":0,"longestInterception":0},
          {"name":"김승혁","team":"서울 디펜더스","interceptions":3,"interceptionTouchdowns":0,"interceptionYards":22,"longestInterception":22},
          {"name":"강대련","team":"인천 라이노스","interceptions":2,"interceptionTouchdowns":0,"interceptionYards":67,"longestInterception":45},
          {"name":"안준호","team":"서울 바이킹스","interceptions":2,"interceptionTouchdowns":0,"interceptionYards":0,"longestInterception":0},
          {"name":"황윤경","team":"군위 피닉스","interceptions":2,"interceptionTouchdowns":0,"interceptionYards":6,"longestInterception":6},
          {"name":"정기훈","team":"서울 골든이글스","interceptions":2,"interceptionTouchdowns":0,"interceptionYards":8,"longestInterception":8},
          {"name":"김용환","team":"군위 피닉스","interceptions":2,"interceptionTouchdowns":0,"interceptionYards":12,"longestInterception":12},
          {"name":"문형원","team":"서울 골든이글스","interceptions":2,"interceptionTouchdowns":0,"interceptionYards":1,"longestInterception":1},
          {"name":"김봉재","team":"삼성 블루스톰","interceptions":2,"interceptionTouchdowns":0,"interceptionYards":0,"longestInterception":0},
          {"name":"현성준","team":"부산 그리폰즈","interceptions":2,"interceptionTouchdowns":2,"interceptionYards":93,"longestInterception":60},
          {"name":"박경균","team":"서울 바이킹스","interceptions":1,"interceptionTouchdowns":0,"interceptionYards":0,"longestInterception":0},
          {"name":"이준기","team":"서울 바이킹스","interceptions":1,"interceptionTouchdowns":1,"interceptionYards":22,"longestInterception":22},
          {"name":"김도헌","team":"삼성 블루스톰","interceptions":1,"interceptionTouchdowns":0,"interceptionYards":1,"longestInterception":1},
          {"name":"다리우스","team":"서울 디펜더스","interceptions":1,"interceptionTouchdowns":0,"interceptionYards":5,"longestInterception":5},
          {"name":"김희준","team":"인천 라이노스","interceptions":1,"interceptionTouchdowns":0,"interceptionYards":0,"longestInterception":0},
          {"name":"이상윤","team":"부산 그리폰즈","interceptions":1,"interceptionTouchdowns":0,"interceptionYards":17,"longestInterception":17},
          {"name":"박영화","team":"서울 디펜더스","interceptions":1,"interceptionTouchdowns":0,"interceptionYards":0,"longestInterception":0},
          {"name":"배용희","team":"군위 피닉스","interceptions":1,"interceptionTouchdowns":0,"interceptionYards":2,"longestInterception":2},
          {"name":"민홍","team":"서울 골든이글스","interceptions":1,"interceptionTouchdowns":0,"interceptionYards":29,"longestInterception":29},
          {"name":"윤석규","team":"인천 라이노스","interceptions":1,"interceptionTouchdowns":0,"interceptionYards":0,"longestInterception":0},
          {"name":"김도헌","team":"인천 라이노스","interceptions":1,"interceptionTouchdowns":0,"interceptionYards":8,"longestInterception":8},
          {"name":"정승훈","team":"삼성 블루스톰","interceptions":1,"interceptionTouchdowns":0,"interceptionYards":10,"longestInterception":10},
          {"name":"조지훈","team":"삼성 블루스톰","interceptions":1,"interceptionTouchdowns":0,"interceptionYards":0,"longestInterception":0},
          {"name":"이찬우","team":"삼성 블루스톰","interceptions":1,"interceptionTouchdowns":0,"interceptionYards":5,"longestInterception":5},
          {"name":"최종현","team":"인천 라이노스","interceptions":1,"interceptionTouchdowns":0,"interceptionYards":8,"longestInterception":8},
          {"name":"황준근","team":"삼성 블루스톰","interceptions":1,"interceptionTouchdowns":0,"interceptionYards":14,"longestInterception":14},
          {"name":"김한주","team":"삼성 블루스톰","interceptions":1,"interceptionTouchdowns":0,"interceptionYards":0,"longestInterception":0},
          {"name":"양두열","team":"군위 피닉스","interceptions":1,"interceptionTouchdowns":0,"interceptionYards":0,"longestInterception":0}
        ],
        '필드골': [
          {"name":"이준기","team":"서울 바이킹스","fieldGoalPercentage":100.0,"averageFieldGoalDistance":30.0,"fieldGoalsMade":1,"fieldGoalsAttempted":1,"fieldGoalYards":30,"longestFieldGoal":30},
          {"name":"최경서","team":"삼성 블루스톰","fieldGoalPercentage":80.0,"averageFieldGoalDistance":34.5,"fieldGoalsMade":4,"fieldGoalsAttempted":5,"fieldGoalYards":138,"longestFieldGoal":40},
          {"name":"박준수","team":"부산 그리폰즈","fieldGoalPercentage":66.7,"averageFieldGoalDistance":16.5,"fieldGoalsMade":2,"fieldGoalsAttempted":3,"fieldGoalYards":33,"longestFieldGoal":33},
          {"name":"김세종","team":"군위 피닉스","fieldGoalPercentage":40.0,"averageFieldGoalDistance":25.0,"fieldGoalsMade":2,"fieldGoalsAttempted":5,"fieldGoalYards":50,"longestFieldGoal":26},
          {"name":"한규철","team":"서울 골든이글스","fieldGoalPercentage":0.0,"averageFieldGoalDistance":0.0,"fieldGoalsMade":0,"fieldGoalsAttempted":1,"fieldGoalYards":0,"longestFieldGoal":0},
          {"name":"이기태","team":"부산 그리폰즈","fieldGoalPercentage":0.0,"averageFieldGoalDistance":0.0,"fieldGoalsMade":0,"fieldGoalsAttempted":1,"fieldGoalYards":0,"longestFieldGoal":0},
          {"name":"신승한","team":"인천 라이노스","fieldGoalPercentage":0.0,"averageFieldGoalDistance":0.0,"fieldGoalsMade":0,"fieldGoalsAttempted":1,"fieldGoalYards":0,"longestFieldGoal":0}
        ],
        '킥오프': [
          {"name":"김상진","team":"삼성 블루스톰","averageKickoffYards":58.0,"kickoffCount":1,"kickoffYards":58,"kickoffTouchdowns":0,"longestKickoff":58},
          {"name":"이기태","team":"부산 그리폰즈","averageKickoffYards":52.7,"kickoffCount":3,"kickoffYards":158,"kickoffTouchdowns":0,"longestKickoff":60},
          {"name":"최경서","team":"삼성 블루스톰","averageKickoffYards":52.6,"kickoffCount":24,"kickoffYards":1263,"kickoffTouchdowns":0,"longestKickoff":70},
          {"name":"김세종","team":"군위 피닉스","averageKickoffYards":51.0,"kickoffCount":25,"kickoffYards":1275,"kickoffTouchdowns":0,"longestKickoff":63},
          {"name":"소윤호","team":"인천 라이노스","averageKickoffYards":50.3,"kickoffCount":3,"kickoffYards":151,"kickoffTouchdowns":0,"longestKickoff":58},
          {"name":"황미륵","team":"서울 디펜더스","averageKickoffYards":49.4,"kickoffCount":10,"kickoffYards":494,"kickoffTouchdowns":0,"longestKickoff":55},
          {"name":"박준수","team":"부산 그리폰즈","averageKickoffYards":49.4,"kickoffCount":20,"kickoffYards":987,"kickoffTouchdowns":0,"longestKickoff":60},
          {"name":"김주오","team":"서울 바이킹스","averageKickoffYards":48.0,"kickoffCount":12,"kickoffYards":576,"kickoffTouchdowns":0,"longestKickoff":60},
          {"name":"이준기","team":"서울 바이킹스","averageKickoffYards":44.0,"kickoffCount":10,"kickoffYards":440,"kickoffTouchdowns":0,"longestKickoff":57},
          {"name":"김연준","team":"인천 라이노스","averageKickoffYards":37.4,"kickoffCount":5,"kickoffYards":187,"kickoffTouchdowns":0,"longestKickoff":48},
          {"name":"이지원","team":"군위 피닉스","averageKickoffYards":35.0,"kickoffCount":1,"kickoffYards":35,"kickoffTouchdowns":0,"longestKickoff":35},
          {"name":"한규철","team":"서울 골든이글스","averageKickoffYards":31.2,"kickoffCount":19,"kickoffYards":593,"kickoffTouchdowns":0,"longestKickoff":57}
        ],
        '킥오프리턴': [
          {"name":"김남기","team":"서울 디펜더스","averageKickReturnYards":37.5,"kickReturnCount":4,"kickReturnYards":183,"kickReturnTouchdowns":1,"longestKickReturn":80},
          {"name":"강대련","team":"인천 라이노스","averageKickReturnYards":35.0,"kickReturnCount":1,"kickReturnYards":52,"kickReturnTouchdowns":0,"longestKickReturn":35},
          {"name":"최경서","team":"삼성 블루스톰","averageKickReturnYards":33.5,"kickReturnCount":2,"kickReturnYards":98,"kickReturnTouchdowns":0,"longestKickReturn":35},
          {"name":"이지누폴","team":"서울 바이킹스","averageKickReturnYards":32.0,"kickReturnCount":1,"kickReturnYards":59,"kickReturnTouchdowns":0,"longestKickReturn":32},
          {"name":"안준범","team":"인천 라이노스","averageKickReturnYards":28.0,"kickReturnCount":2,"kickReturnYards":97,"kickReturnTouchdowns":0,"longestKickReturn":55},
          {"name":"김우혁","team":"서울 바이킹스","averageKickReturnYards":24.6,"kickReturnCount":12,"kickReturnYards":627,"kickReturnTouchdowns":0,"longestKickReturn":84},
          {"name":"신현솔","team":"군위 피닉스","averageKickReturnYards":22.3,"kickReturnCount":3,"kickReturnYards":161,"kickReturnTouchdowns":0,"longestKickReturn":27},
          {"name":"김영인","team":"서울 골든이글스","averageKickReturnYards":22.3,"kickReturnCount":11,"kickReturnYards":508,"kickReturnTouchdowns":0,"longestKickReturn":45},
          {"name":"정범수","team":"인천 라이노스","averageKickReturnYards":22.0,"kickReturnCount":1,"kickReturnYards":47,"kickReturnTouchdowns":0,"longestKickReturn":22},
          {"name":"민승현","team":"군위 피닉스","averageKickReturnYards":22.0,"kickReturnCount":1,"kickReturnYards":55,"kickReturnTouchdowns":0,"longestKickReturn":22},
          {"name":"신승한","team":"인천 라이노스","averageKickReturnYards":22.0,"kickReturnCount":2,"kickReturnYards":89,"kickReturnTouchdowns":0,"longestKickReturn":27},
          {"name":"최재혁","team":"부산 그리폰즈","averageKickReturnYards":22.0,"kickReturnCount":14,"kickReturnYards":694,"kickReturnTouchdowns":1,"longestKickReturn":77},
          {"name":"최근수","team":"인천 라이노스","averageKickReturnYards":21.9,"kickReturnCount":8,"kickReturnYards":404,"kickReturnTouchdowns":0,"longestKickReturn":33},
          {"name":"염준석","team":"서울 골든이글스","averageKickReturnYards":21.8,"kickReturnCount":5,"kickReturnYards":246,"kickReturnTouchdowns":0,"longestKickReturn":33},
          {"name":"조윤호","team":"서울 골든이글스","averageKickReturnYards":20.0,"kickReturnCount":1,"kickReturnYards":48,"kickReturnTouchdowns":0,"longestKickReturn":20},
          {"name":"부윤재","team":"인천 라이노스","averageKickReturnYards":20.0,"kickReturnCount":1,"kickReturnYards":54,"kickReturnTouchdowns":0,"longestKickReturn":20},
          {"name":"조지훈","team":"삼성 블루스톰","averageKickReturnYards":19.2,"kickReturnCount":5,"kickReturnYards":227,"kickReturnTouchdowns":0,"longestKickReturn":25},
          {"name":"최재훈","team":"인천 라이노스","averageKickReturnYards":17.5,"kickReturnCount":2,"kickReturnYards":101,"kickReturnTouchdowns":0,"longestKickReturn":27},
          {"name":"Deangelo Collins","team":"인천 라이노스","averageKickReturnYards":17.0,"kickReturnCount":1,"kickReturnYards":55,"kickReturnTouchdowns":0,"longestKickReturn":17},
          {"name":"박순후","team":"서울 골든이글스","averageKickReturnYards":17.0,"kickReturnCount":1,"kickReturnYards":50,"kickReturnTouchdowns":0,"longestKickReturn":17},
          {"name":"김용환","team":"군위 피닉스","averageKickReturnYards":17.0,"kickReturnCount":3,"kickReturnYards":105,"kickReturnTouchdowns":0,"longestKickReturn":36},
          {"name":"김승혁","team":"서울 디펜더스","averageKickReturnYards":16.8,"kickReturnCount":4,"kickReturnYards":219,"kickReturnTouchdowns":0,"longestKickReturn":20},
          {"name":"이재건","team":"부산 그리폰즈","averageKickReturnYards":16.3,"kickReturnCount":3,"kickReturnYards":139,"kickReturnTouchdowns":0,"longestKickReturn":22},
          {"name":"김상진","team":"삼성 블루스톰","averageKickReturnYards":14.8,"kickReturnCount":5,"kickReturnYards":236,"kickReturnTouchdowns":0,"longestKickReturn":22},
          {"name":"정준희","team":"인천 라이노스","averageKickReturnYards":13.0,"kickReturnCount":3,"kickReturnYards":160,"kickReturnTouchdowns":0,"longestKickReturn":18},
          {"name":"황윤경","team":"군위 피닉스","averageKickReturnYards":12.3,"kickReturnCount":6,"kickReturnYards":300,"kickReturnTouchdowns":0,"longestKickReturn":18},
          {"name":"스위프트","team":"서울 디펜더스","averageKickReturnYards":12.0,"kickReturnCount":2,"kickReturnYards":101,"kickReturnTouchdowns":0,"longestKickReturn":24},
          {"name":"황병하","team":"서울 골든이글스","averageKickReturnYards":11.0,"kickReturnCount":1,"kickReturnYards":59,"kickReturnTouchdowns":0,"longestKickReturn":11},
          {"name":"곽채원","team":"서울 디펜더스","averageKickReturnYards":10.0,"kickReturnCount":1,"kickReturnYards":45,"kickReturnTouchdowns":0,"longestKickReturn":10},
          {"name":"다리우스","team":"서울 디펜더스","averageKickReturnYards":10.0,"kickReturnCount":1,"kickReturnYards":35,"kickReturnTouchdowns":0,"longestKickReturn":10},
          {"name":"안정원","team":"서울 디펜더스","averageKickReturnYards":8.7,"kickReturnCount":3,"kickReturnYards":147,"kickReturnTouchdowns":0,"longestKickReturn":15},
          {"name":"임재한","team":"서울 디펜더스","averageKickReturnYards":7.0,"kickReturnCount":1,"kickReturnYards":42,"kickReturnTouchdowns":0,"longestKickReturn":7},
          {"name":"백용주","team":"서울 바이킹스","averageKickReturnYards":5.0,"kickReturnCount":1,"kickReturnYards":64,"kickReturnTouchdowns":0,"longestKickReturn":5},
          {"name":"김동휘","team":"서울 디펜더스","averageKickReturnYards":5.0,"kickReturnCount":1,"kickReturnYards":45,"kickReturnTouchdowns":0,"longestKickReturn":5},
          {"name":"김찬솔","team":"인천 라이노스","averageKickReturnYards":0.0,"kickReturnCount":1,"kickReturnYards":45,"kickReturnTouchdowns":0,"longestKickReturn":0}
        ],
        '펀트': [
          {"name":"말릭","team":"서울 디펜더스","averagePuntYards":50.0,"puntCount":1,"puntYards":50,"puntTouchdowns":0,"longestPunt":50},
          {"name":"김주오","team":"서울 바이킹스","averagePuntYards":47.0,"puntCount":2,"puntYards":94,"puntTouchdowns":0,"longestPunt":47},
          {"name":"박준수","team":"부산 그리폰즈","averagePuntYards":43.5,"puntCount":22,"puntYards":957,"puntTouchdowns":0,"longestPunt":63},
          {"name":"이준기","team":"서울 바이킹스","averagePuntYards":39.9,"puntCount":21,"puntYards":838,"puntTouchdowns":0,"longestPunt":55},
          {"name":"황미륵","team":"서울 디펜더스","averagePuntYards":39.7,"puntCount":18,"puntYards":714,"puntTouchdowns":0,"longestPunt":60},
          {"name":"염준석","team":"서울 골든이글스","averagePuntYards":39.1,"puntCount":22,"puntYards":860,"puntTouchdowns":0,"longestPunt":55},
          {"name":"백용주","team":"서울 바이킹스","averagePuntYards":37.5,"puntCount":6,"puntYards":225,"puntTouchdowns":0,"longestPunt":43},
          {"name":"이정규","team":"인천 라이노스","averagePuntYards":35.6,"puntCount":15,"puntYards":534,"puntTouchdowns":0,"longestPunt":52},
          {"name":"이민우","team":"군위 피닉스","averagePuntYards":35.5,"puntCount":2,"puntYards":71,"puntTouchdowns":0,"longestPunt":49},
          {"name":"강대련","team":"인천 라이노스","averagePuntYards":35.4,"puntCount":5,"puntYards":177,"puntTouchdowns":0,"longestPunt":53},
          {"name":"김세종","team":"군위 피닉스","averagePuntYards":34.8,"puntCount":16,"puntYards":556,"puntTouchdowns":0,"longestPunt":53},
          {"name":"최경서","team":"삼성 블루스톰","averagePuntYards":34.1,"puntCount":16,"puntYards":545,"puntTouchdowns":0,"longestPunt":48},
          {"name":"Donovan Lee Hunt","team":"서울 골든이글스","averagePuntYards":28.0,"puntCount":1,"puntYards":28,"puntTouchdowns":0,"longestPunt":28},
          {"name":"이규호","team":"서울 디펜더스","averagePuntYards":22.0,"puntCount":1,"puntYards":22,"puntTouchdowns":0,"longestPunt":22}
        ],
        '펀트리턴': [
          {"name":"신승한","team":"인천 라이노스","averagePuntReturnYards":25.0,"puntReturnCount":2,"puntReturnYards":50,"puntReturnTouchdowns":0,"longestPuntReturn":25},
          {"name":"정준희","team":"인천 라이노스","averagePuntReturnYards":19.0,"puntReturnCount":1,"puntReturnYards":19,"puntReturnTouchdowns":0,"longestPuntReturn":19},
          {"name":"신현솔","team":"군위 피닉스","averagePuntReturnYards":18.8,"puntReturnCount":4,"puntReturnYards":75,"puntReturnTouchdowns":0,"longestPuntReturn":33},
          {"name":"김상진","team":"삼성 블루스톰","averagePuntReturnYards":15.7,"puntReturnCount":3,"puntReturnYards":47,"puntReturnTouchdowns":0,"longestPuntReturn":25},
          {"name":"정범수","team":"인천 라이노스","averagePuntReturnYards":9.3,"puntReturnCount":3,"puntReturnYards":28,"puntReturnTouchdowns":0,"longestPuntReturn":16},
          {"name":"안태현","team":"군위 피닉스","averagePuntReturnYards":9.0,"puntReturnCount":1,"puntReturnYards":9,"puntReturnTouchdowns":1,"longestPuntReturn":9},
          {"name":"염준석","team":"서울 골든이글스","averagePuntReturnYards":7.0,"puntReturnCount":1,"puntReturnYards":7,"puntReturnTouchdowns":0,"longestPuntReturn":7},
          {"name":"김영인","team":"서울 골든이글스","averagePuntReturnYards":6.0,"puntReturnCount":4,"puntReturnYards":24,"puntReturnTouchdowns":0,"longestPuntReturn":13},
          {"name":"손해원","team":"삼성 블루스톰","averagePuntReturnYards":5.0,"puntReturnCount":1,"puntReturnYards":5,"puntReturnTouchdowns":0,"longestPuntReturn":5},
          {"name":"이상윤","team":"부산 그리폰즈","averagePuntReturnYards":5.0,"puntReturnCount":1,"puntReturnYards":5,"puntReturnTouchdowns":0,"longestPuntReturn":5},
          {"name":"황윤경","team":"군위 피닉스","averagePuntReturnYards":4.6,"puntReturnCount":5,"puntReturnYards":23,"puntReturnTouchdowns":0,"longestPuntReturn":13},
          {"name":"민승현","team":"군위 피닉스","averagePuntReturnYards":4.5,"puntReturnCount":2,"puntReturnYards":9,"puntReturnTouchdowns":0,"longestPuntReturn":9},
          {"name":"최근수","team":"인천 라이노스","averagePuntReturnYards":4.3,"puntReturnCount":3,"puntReturnYards":13,"puntReturnTouchdowns":0,"longestPuntReturn":8},
          {"name":"권예준","team":"서울 골든이글스","averagePuntReturnYards":3.0,"puntReturnCount":1,"puntReturnYards":3,"puntReturnTouchdowns":0,"longestPuntReturn":3},
          {"name":"황병하","team":"서울 골든이글스","averagePuntReturnYards":1.0,"puntReturnCount":1,"puntReturnYards":1,"puntReturnTouchdowns":0,"longestPuntReturn":1},
          {"name":"이찬우","team":"삼성 블루스톰","averagePuntReturnYards":0.0,"puntReturnCount":1,"puntReturnYards":0,"puntReturnTouchdowns":0,"longestPuntReturn":0},
          {"name":"강대련","team":"인천 라이노스","averagePuntReturnYards":0.0,"puntReturnCount":1,"puntReturnYards":0,"puntReturnTouchdowns":0,"longestPuntReturn":0},
          {"name":"박영화","team":"서울 디펜더스","averagePuntReturnYards":0.0,"puntReturnCount":1,"puntReturnYards":0,"puntReturnTouchdowns":0,"longestPuntReturn":0},
          {"name":"이재건","team":"부산 그리폰즈","averagePuntReturnYards":0.0,"puntReturnCount":1,"puntReturnYards":0,"puntReturnTouchdowns":0,"longestPuntReturn":0},
          {"name":"정한샘","team":"인천 라이노스","averagePuntReturnYards":0.0,"puntReturnCount":1,"puntReturnYards":0,"puntReturnTouchdowns":0,"longestPuntReturn":0},
          {"name":"최경서","team":"삼성 블루스톰","averagePuntReturnYards":0.0,"puntReturnCount":2,"puntReturnYards":0,"puntReturnTouchdowns":0,"longestPuntReturn":0},
          {"name":"이정윤","team":"서울 골든이글스","averagePuntReturnYards":0.0,"puntReturnCount":1,"puntReturnYards":0,"puntReturnTouchdowns":0,"longestPuntReturn":0},
          {"name":"최재혁","team":"부산 그리폰즈","averagePuntReturnYards":0.0,"puntReturnCount":1,"puntReturnYards":0,"puntReturnTouchdowns":0,"longestPuntReturn":0},
          {"name":"조지훈","team":"삼성 블루스톰","averagePuntReturnYards":0.0,"puntReturnCount":1,"puntReturnYards":0,"puntReturnTouchdowns":0,"longestPuntReturn":0},
          {"name":"김우혁","team":"서울 바이킹스","averagePuntReturnYards":0.0,"puntReturnCount":1,"puntReturnYards":0,"puntReturnTouchdowns":0,"longestPuntReturn":0}
        ]
      };
      return socialData[statType] || [];
    }
    
    if (!leagueData) return [];
    
    const divisionKey = division === '1부' ? 'first' : 'second';
    return leagueData[divisionKey]?.[statType] || [];
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
            <div className="table-row">
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
                    <div className="table-cell team-name">
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
                      <span>{row.team}</span>
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