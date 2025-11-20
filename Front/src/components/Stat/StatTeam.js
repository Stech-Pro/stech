// StatTeam.jsx
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

/* ─────────────────────────  리그 매핑/옵션  ───────────────────────── */
const TEAM_TO_LEAGUE = {
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
const PLAY_TYPES = ['득점/경기', '런', '패스', '스페셜팀', '기타'];

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

const TEAM_COLUMNS = {
  '득점/경기': [
    { key: 'points_per_game', label: '경기당 평균 득점' },
    { key: 'total_points', label: '총 득점' },
    { key: 'total_touchdowns', label: '총 터치다운' },
    { key: 'total_yards', label: '총 전진야드' },
    { key: 'yards_per_game', label: '경기당 전진 야드' },
  ],
  런: [
    { key: 'rushing_attempts', label: '러싱 시도' },
    { key: 'rushing_yards', label: '러싱 야드' },
    { key: 'yards_per_carry', label: '볼 캐리 당\n러싱 야드' },
    { key: 'rushing_yards_per_game', label: '경기당 러싱 야드' },
    { key: 'rushing_td', label: '러싱 터치다운' },
  ],
  패스: [
    { key: 'pass_completions-attempts', label: '패스 성공\n패스 시도' },
    { key: 'passing_yards', label: '패싱 야드' },
    {
      key: 'passing_yards_per_passing_attempts',
      label: '패스 시도 당\n패스 야드',
    },
    { key: 'passing_yards_per_game', label: '경기당\n패스 야드' },
    { key: 'passing_td', label: '패스\n터치다운' },
    { key: 'interceptions', label: '인터셉트' },
  ],
  스페셜팀: [
    { key: 'total_punt_yards', label: '총 펀트\n야드' },
    { key: 'average_punt_yards', label: '평균 펀트\n야드' },
    { key: 'touchback_percentage', label: '터치백\n퍼센티지' },

    { key: 'field_goal_completions-attempts', label: '필드골 성공총 시도' },
    { key: 'yards_per_kick_return', label: '평균 킥\n리턴 야드' },

    { key: 'yards_per_punt_return', label: '평균 펀트\n리턴 야드' },
    { key: 'total_return_yards', label: '총 리턴\n야드' },
  ],
  기타: [
    { key: 'fumble-turnover', label: '펌블 수\n펌블 턴오버 수' },
    { key: 'turnover_per_game', label: '경기 당\n턴오버 수' },
    { key: 'turnover_rate', label: '턴오버 비율' },
    { key: 'penalty-pen_yards', label: '총 페널티 수\n총 페널티 야드' },
    { key: 'pen_yards_per_game', label: '경기 당\n페널티 야드' },
  ],
};

/**
 * props:
 *  - fixedLeague: "서울"        // 게스트 고정 리그
 *  - fixedDivision: "1부"       // 게스트 고정 디비전
 */
export default function StatTeam({
  data,
  teams = [],
  fixedLeague,
  fixedDivision,
}) {
  const isGuestFixed = Boolean(fixedLeague && fixedDivision);

  // 🔹 유저/로컬스토리지 기반 초기 리그/부
  const { initialValues, loaded, leagueHasDivisions } = useStatInitial();

  // 🔹 리그/부 state를 초기값으로 세팅 (게스트면 props 우선)
  const [league, setLeague] = useState(() =>
    isGuestFixed ? fixedLeague : initialValues.league || '서울',
  );
  const [division, setDivision] = useState(() => {
    if (isGuestFixed) return fixedDivision;
    const hasDiv = leagueHasDivisions(initialValues.league);
    return hasDiv ? initialValues.division || '1부' : '';
  });

  const [playType, setPlayType] = useState('득점/경기');
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
  const currentColumns = TEAM_COLUMNS[playType] || [];

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

  const sortedTeams = useMemo(() => {
    const source = Array.isArray(data) ? data : [];
    const targetLeague = isGuestFixed ? fixedLeague : league;
    const targetDivision = isGuestFixed ? fixedDivision : division;

    const rows = source.filter((d) => {
      const teamLeague = TEAM_TO_LEAGUE[d.team] || '';
      if (targetLeague !== '전체' && teamLeague !== targetLeague) return false;
      if (targetLeague !== '사회인' && d.division !== targetDivision)
        return false;
      return true;
    });

    if (!currentSort) return rows;

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
    return [...rows].sort(cmp);
  }, [
    data,
    league,
    division,
    currentSort,
    isGuestFixed,
    fixedLeague,
    fixedDivision,
  ]);

  const rankedTeams = useMemo(() => {
    if (!sortedTeams.length || !currentSort)
      return sortedTeams.map((r, i) => ({ ...r, __rank: i + 1 }));
    const { key } = currentSort;
    let lastValue = null;
    let currentRank = 0;
    let seen = 0;
    return sortedTeams.map((r) => {
      seen += 1;
      const currentValue = r[key] ?? 0;
      if (currentValue !== lastValue) currentRank = seen;
      lastValue = currentValue;
      return { ...r, __rank: currentRank };
    });
  }, [sortedTeams, currentSort]);

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
          {/* 플레이 타입은 항상 선택 가능 */}
          <Dropdown
            label="PlayType"
            placeholder="유형"
            value={playType}
            options={PLAY_TYPES}
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
            {rankedTeams.map((row) => {
              const teamInfo = teams.find((t) => t.name === row.team);
              const isSecondDiv =
                (isGuestFixed ? fixedDivision : division) === '2부';
              return (
                <div
                  key={row.id || row.team}
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
                    className="team-table-row2"
                      style={{ '--cols': String(TEAM_COLUMNS[playType]?.length || 0) }}
                  >
                    {(TEAM_COLUMNS[playType] || []).map((col) => {
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
}