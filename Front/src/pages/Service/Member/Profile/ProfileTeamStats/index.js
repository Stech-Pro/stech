// ProfileTeamStats.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RxTriangleDown } from 'react-icons/rx';
import { FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../../../../../context/AuthContext';
import { mockData } from '../../../../../data/teamplayermock';
import './ProfileTeamStats.css';

/* ───────── 공통 드롭다운 (pts- 접두사) ───────── */
function Dropdown({ value, options, onChange, label, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onClickOutside = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);
  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className="pts-dropdown-container" ref={ref} aria-label={label}>
      <button type="button" className={`pts-dropdown-trigger ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)}>
        <span className="pts-dropdown-text">{displayText}</span>
        <FaChevronDown size={16} className={`pts-dropdown-arrow ${open ? 'rotated' : ''}`} />
      </button>
      {open && (
        <div className="pts-dropdown-menu">
          <ul className="pts-dropdown-list">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  className={`pts-dropdown-option ${value === opt.value ? 'selected' : ''}`}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ───────── 키 별칭(데이터 키 불일치 대비) ───────── */
const VALUE_ALIASES = {
  // K
  field_goal: ['field_goal', 'fg'],
  field_goal_percentage: ['field_goal_percentage', 'fg_percentage'],
  field_goal_1_19: ['field_goal_1_19', 'field_1_19', 'fg_1_19'],
  field_goal_20_29: ['field_goal_20_29', 'field_20_29', 'fg_20_29'],
  field_goal_30_39: ['field_goal_30_39', 'field_30_39', '30-39', 'fg_30_39'],
  field_goal_40_49: ['field_goal_40_49', 'field_40_49', '40-49', 'field_goal_40_49', 'fg_40_49'],
  field_goal_50_plus: ['field_goal_50_plus', '50_plus', 'fg_50_plus', 'field_50_plus'],
  average_field_goal_length: ['average_field_goal_length', 'fg_average_length', 'avg_fg_length', 'avg'],
  longest_field_goal: ['longest_field_goal', 'fg_longest', 'longest_fg'],

  // P
  punts: ['punts', 'punt_count'],
  average_punt_yards: ['average_punt_yards', 'average_punt_yard'],
  punt_yards: ['punt_yards', 'total_punt_yards'],
  touchback_percentage: ['touchback_percentage', 'tb_percentage'],
  inside20: ['inside20', 'punts_inside_20'],
  inside20_percentage: ['inside20_percentage', 'punts_inside_20_percentage'],

  // Fumbles 통일
  fumbles: ['fumbles', 'rushingFumbles', 'passingFumbles'],
  fumbles_lost: ['fumbles_lost', 'rushingFumblesLost', 'passingFumblesLost'],
};

const getVal = (row, key) => {
  if (!row) return undefined;
  if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];
  const al = VALUE_ALIASES[key];
  if (al) {
    for (const k of al) if (Object.prototype.hasOwnProperty.call(row, k)) return row[k];
  }
  return undefined;
};

/* ───────── 상수/컬럼 정의 (스펙 반영) ───────── */
const POSITION_ORDER = ['QB','RB','WR','TE','OL','DL','LB','DB','K','P'];

const POSITION_CATEGORIES = {
  QB: ['pass', 'run'],
  RB: ['pass', 'run', '스페셜팀'],
  WR: ['pass', 'run', '스페셜팀'],
  TE: ['pass', 'run'],
  OL: ['pass'],                 // 패스 탭에서만 노출 (Pen, Sacks Allowed)
  DL: ['defense'],
  LB: ['defense'],
  DB: ['defense', '스페셜팀'],
  K:  ['스페셜팀'],
  P:  ['스페셜팀'],
};

const PRIMARY_METRIC = {
  QB: { pass: 'passing_yards', run: 'rushing_yards' },
  RB: { pass: 'receiving_yards', run: 'rushing_yards', 스페셜팀: 'kick_return_yards' },
  WR: { pass: 'receiving_yards', run: 'rushing_yards', 스페셜팀: 'kick_return_yards' },
  TE: { pass: 'receiving_yards', run: 'rushing_yards' },
  OL: { pass: 'sacks_allowed' },
  DL: { defense: 'sacks' },
  LB: { defense: 'tackles' },
  DB: { defense: 'interceptions', 스페셜팀: 'kick_return_yards' },
  K:  { 스페셜팀: 'field_goal_percentage' },
  P:  { 스페셜팀: 'average_punt_yards' },
};

const statColumns = {
  QB: {
    pass: [
      { key: 'games', label: '경기 수' },
      { key: 'passing_attempts', label: '패스 시도 수' },
      { key: 'pass_completions', label: '패스 성공 수' },
      { key: 'completion_percentage', label: '패스 성공률' },
      { key: 'passing_yards', label: '패싱 야드' },
      { key: 'passing_td', label: '패싱 터치다운' },
      { key: 'interceptions', label: '인터셉트' },
      { key: 'longest_pass', label: '가장 긴 패스' },
      { key: 'sacks', label: '경기 당 색 허용 수' },
    ],
    run: [
      { key: 'games', label: '경기 수' },
      { key: 'rushing_attempts', label: '러싱 시도 수' },
      { key: 'rushing_yards', label: '러싱 야드' },
      { key: 'yards_per_carry', label: '볼 캐리 당 러싱 야드' },
      { key: 'rushing_td', label: '러싱 터치다운' },
      { key: 'longest_rushing', label: '가장 긴 러싱 야드' },
    ],
  },
  RB: {
    pass: [
      { key: 'games', label: '경기 수' },
      { key: 'targets', label: '패스 타겟 수' },
      { key: 'receptions', label: '패스 캐치 수' },
      { key: 'receiving_yards', label: '리시빙 야드' },
      { key: 'yards_per_catch', label: '캐치 당 리시빙 야드' },
      { key: 'receiving_td', label: '리시빙 터치다운' },
      { key: 'longest_reception', label: '가장 긴 리시빙 야드' },
      { key: 'receiving_first_downs', label: '리시브 후 퍼스트 다운 수' },
      { key: 'fumbles', label: '펌블 수' },
      { key: 'fumbles_lost', label: '펌블 턴오버 수' },
    ],
    run: [
      { key: 'games', label: '경기 수' },
      { key: 'rushing_attempts', label: '러싱 시도 수' },
      { key: 'rushing_yards', label: '러싱 야드' },
      { key: 'yards_per_carry', label: '볼 캐리 당 러싱 야드' },
      { key: 'rushing_td', label: '러싱 터치다운' },
      { key: 'longest_rushing', label: '가장 긴 러싱 야드' },
      { key: 'fumbles', label: '펌블 수' },
      { key: 'fumbles_lost', label: '펌블 턴오버 수' },
    ],
    스페셜팀: [
      { key: 'games', label: '경기 수' },
      { key: 'kick_returns', label: '킥 리턴 시도 수' },
      { key: 'kick_return_yards', label: '킥 리턴 야드' },
      { key: 'yards_per_kick_return', label: '킥 리턴 시도 당 리턴 야드' },
      { key: 'punt_returns', label: '펀트 리턴 시도 수' },
      { key: 'punt_return_yards', label: '펀트 리턴 야드' },
      { key: 'yards_per_punt_return', label: '펀트 리턴 시도 당 리턴 야드' },
      { key: 'return_td', label: '리턴 터치다운' },
    ],
  },
  WR: {
    pass: [
      { key: 'games', label: '경기 수' },
      { key: 'targets', label: '패스 타겟 수' },
      { key: 'receptions', label: '패스 캐치 수' },
      { key: 'receiving_yards', label: '리시빙 야드' },
      { key: 'yards_per_catch', label: '캐치당 리시빙 야드' },
      { key: 'receiving_td', label: '리시빙 터치다운' },
      { key: 'longest_reception', label: '가장 긴 리시빙 야드' },
      { key: 'receiving_first_downs', label: '리시브 후 퍼스트 다운 수' },
      { key: 'fumbles', label: '펌블 수' },
      { key: 'fumbles_lost', label: '펌블 턴오버 수' },
    ],
    run: [
      { key: 'games', label: '경기 수' },
      { key: 'rushing_attempts', label: '러싱 시도 수' },
      { key: 'rushing_yards', label: '러싱 야드' },
      { key: 'yards_per_carry', label: '볼 캐리 당 러싱 야드' },
      { key: 'rushing_td', label: '러싱 터치다운' },
      { key: 'longest_rushing', label: '가장 긴 러싱 야드' },
      { key: 'fumbles', label: '펌블 수' },
      { key: 'fumbles_lost', label: '펌블 턴오버 수' },
    ],
    스페셜팀: [
      { key: 'games', label: '경기 수' },
      { key: 'kick_returns', label: '킥 리턴 시도 수' },
      { key: 'kick_return_yards', label: '킥 리턴 야드' },
      { key: 'yards_per_kick_return', label: '킥 리턴 시도 당 리턴 야드' },
      { key: 'punt_returns', label: '펀트 리턴 시도 수' },
      { key: 'punt_return_yards', label: '펀트 리턴 야드' },
      { key: 'yards_per_punt_return', label: '펀트 리턴 시도 당 리턴 야드' },
      { key: 'return_td', label: '리턴 터치다운' },
    ],
  },
  TE: {
    pass: [
      { key: 'games', label: '경기 수' },
      { key: 'targets', label: '패스 타겟 수' },
      { key: 'receptions', label: '패스 캐치 수' },
      { key: 'receiving_yards', label: '리시빙 야드' },
      { key: 'yards_per_catch', label: '캐치 당 리시빙 야드' },
      { key: 'receiving_td', label: '리시빙 터치다운' },
      { key: 'longest_reception', label: '가장 긴 리시빙 야드' },
      { key: 'receiving_first_downs', label: '리시브 후 퍼스트 다운 수' },
      { key: 'fumbles', label: '펌블 수' },
      { key: 'fumbles_lost', label: '펌블 턴오버 수' },
    ],
    run: [
      { key: 'games', label: '경기 수' },
      { key: 'rushing_attempts', label: '러싱 시도 수' },
      { key: 'rushing_yards', label: '러싱 야드' },
      { key: 'yards_per_carry', label: '볼 캐리 당 러싱 야드' },
      { key: 'rushing_td', label: '러싱 터치다운' },
      { key: 'longest_rushing', label: '가장 긴 러싱 야드' },
      { key: 'fumbles', label: '펌블 수' },
      { key: 'fumbles_lost', label: '펌블 턴오버 수' },
    ],
  },
  OL: {
    pass: [
      { key: 'penalties', label: '반칙 수' },
      { key: 'sacks_allowed', label: '색 허용 수' },
    ],
  },
  DL: {
    defense: [
      { key: 'games', label: '경기 수' },
      { key: 'tackles', label: '태클 수' },
      { key: 'sacks', label: '색' },
      { key: 'forced_fumbles', label: '펌블 유도 수' },
      { key: 'fumble_recovery', label: '펌블 리커버리 수' },
      { key: 'fumble_recovered_yards', label: '펌블 리커버리 야드' },
      { key: 'pass_defended', label: '패스를 막은 수' },
      { key: 'interceptions', label: '인터셉션' },
      { key: 'interception_yards', label: '인터셉션 야드' },
      { key: 'touchdowns', label: '수비 터치다운' },
    ],
  },
  LB: {
    defense: [
      { key: 'games', label: '경기 수' },
      { key: 'tackles', label: '태클 수' },
      { key: 'sacks', label: '색' },
      { key: 'forced_fumbles', label: '펌블 유도 수' },
      { key: 'fumble_recovery', label: '펌블 리커버리 수' },
      { key: 'fumble_recovered_yards', label: '펌블 리커버리 야드' },
      { key: 'pass_defended', label: '패스를 막은 수' },
      { key: 'interceptions', label: '인터셉션' },
      { key: 'interception_yards', label: '인터셉션 야드' },
      { key: 'touchdowns', label: '수비 터치다운' },
    ],
  },
  DB: {
    defense: [
      { key: 'games', label: '경기 수' },
      { key: 'tackles', label: '태클 수' },
      { key: 'sacks', label: '색' },
      { key: 'forced_fumbles', label: '펌블 유도 수' },
      { key: 'fumble_recovery', label: '펌블 리커버리 수' },
      { key: 'fumble_recovered_yards', label: '펌블 리커버리 야드' },
      { key: 'pass_defended', label: '패스를 막은 수' },
      { key: 'interceptions', label: '인터셉션' },
      { key: 'interception_yards', label: '인터셉션 야드' },
      { key: 'touchdowns', label: '수비 터치다운' },
    ],
    스페셜팀: [
      { key: 'games', label: '경기 수' },
      { key: 'kick_returns', label: '킥 리턴 시도 수' },
      { key: 'kick_return_yards', label: '킥 리턴 야드' },
      { key: 'yards_per_kick_return', label: '킥 리턴 시도 당 리턴 야드' },
      { key: 'punt_returns', label: '펀트 리턴 시도 수' },
      { key: 'punt_return_yards', label: '펀트 리턴 야드' },
      { key: 'yards_per_punt_return', label: '펀트 리턴 시도 당 리턴 야드' },
      { key: 'return_td', label: '리턴 터치다운' },
    ],
  },
  K: {
    스페셜팀: [
      { key: 'games', label: '경기 수' },
      { key: 'extra_points_attempted', label: 'PAT 시도' },
      { key: 'extra_points_made', label: 'PAT 성공' },
      { key: 'field_goal', label: '필드골 성공-시도' },
      { key: 'field_goal_percentage', label: '필드골 성공률' },
      { key: 'field_goal_1_19', label: '1-19' },
      { key: 'field_goal_20_29', label: '20-29' },
      { key: 'field_goal_30_39', label: '30-39' },
      { key: 'field_goal_40_49', label: '40-49' },
      { key: 'field_goal_50_plus', label: '50+' },
      { key: 'average_field_goal_length', label: '평균 필드골 거리' },
      { key: 'longest_field_goal', label: '가장 긴 필드골' },
    ],
  },
  P: {
    스페셜팀: [
      { key: 'games', label: '경기 수' },
      { key: 'punts', label: '펀트 수' },
      { key: 'average_punt_yards', label: '평균 펀트 거리' },
      { key: 'longest_punt', label: '가장 긴 펀트' },
      { key: 'punt_yards', label: '펀트 야드' },
      { key: 'touchback_percentage', label: '터치백 %' },
      { key: 'inside20', label: '20 야드 안쪽 펀트' },
      { key: 'inside20_percentage', label: '20 야드 안쪽 펀트 %' },
    ],
  },
};

const LOWER_IS_BETTER = new Set(['interceptions','sacks','fumbles','fumbles_lost','penalties','sacks_allowed','touchback_percentage']);
const PAIR_FIRST_DESC = new Set(['field_goal']);
const parsePair = (str) => {
  if (typeof str !== 'string') return [0, 0];
  const [a, b] = str.split('-').map((n) => parseFloat(n) || 0);
  return [a, b];
};

/* ───────── 포지션 섹션 (팀 컬럼 제거) ───────── */
function PositionSection({ title, rows, categoryKey, primaryKey }) {
  const columns = statColumns[title]?.[categoryKey] || [];

  // hooks must be called unconditionally
  const [sort, setSort] = useState(
    primaryKey ? { key: primaryKey, direction: 'desc' } : null
  );

  useEffect(() => {
    setSort(primaryKey ? { key: primaryKey, direction: 'desc' } : null);
  }, [primaryKey]);

  const toggleSort = (key) => {
    setSort((prev) =>
      !prev || prev.key !== key
        ? { key, direction: 'desc' }
        : { key, direction: prev.direction === 'desc' ? 'asc' : 'desc' }
    );
  };

  const sorted = useMemo(() => {
    const baseRows = Array.isArray(rows) ? rows : [];
    if (!sort) return baseRows;

    const { key, direction } = sort;
    return [...baseRows].sort((a, b) => {
      if (PAIR_FIRST_DESC.has(key)) {
        const [a1, a2] = parsePair(getVal(a, key) ?? '0-0');
        const [b1, b2] = parsePair(getVal(b, key) ?? '0-0');
        const prefSign = LOWER_IS_BETTER.has(key) ? 1 : -1;
        const dirSign = direction === 'asc' ? -1 : 1;
        const d1 = (a1 - b1) * prefSign * dirSign;
        if (d1 !== 0) return d1;
        return (a2 - b2) * prefSign * dirSign;
      }
      const av = Number(getVal(a, key) ?? 0);
      const bv = Number(getVal(b, key) ?? 0);
      const base = av < bv ? -1 : av > bv ? 1 : 0;
      const sign = direction === 'asc' ? 1 : -1;
      const low = LOWER_IS_BETTER.has(key) ? -1 : 1;
      return base * sign * low;
    });
  }, [rows, sort]);

  const ranked = useMemo(() => {
    if (!sorted.length || !sort) return sorted.map((r, i) => ({ ...r, __rank: i + 1 }));
    const { key } = sort;
    const valueOf = (r) =>
      PAIR_FIRST_DESC.has(key)
        ? parsePair(getVal(r, key) ?? '0-0').join('|')
        : getVal(r, key) ?? 0;

    let last = null, rank = 0, seen = 0;
    return sorted.map((r) => {
      seen++;
      const v = valueOf(r);
      if (v !== last) rank = seen;
      last = v;
      return { ...r, __rank: rank };
    });
  }, [sorted, sort]);

  const fmt = (k, vRaw) => {
    const v = getVal({ [k]: vRaw }, k);
    if (typeof v === 'number') {
      return String(k).includes('percentage') ? v.toFixed(1) : (v % 1 !== 0 ? v.toFixed(1) : v);
    }
    if (typeof v === 'string') return v || '0';
    return v ?? '0';
  };

  // ⬇️ 렌더 가드(훅 호출 후에 분기)
  if (!Array.isArray(rows) || rows.length === 0) return null;
  if (columns.length === 0) return null;

  return (
    <div className="pts-position-section">
      <div className="pts-table-header"><div className="pts-table-title">{title} 선수 스탯</div></div>
      <div className="pts-table-wrapper">
        <div className="pts-stat-table">
          <div className="pts-table-head">
            <div className="pts-table-row">
              <div className="pts-table-row1">
                <div className="pts-table-header-cell pts-rank-column">순위</div>
                <div className="pts-table-header-cell pts-player-column">선수 이름</div>
              </div>
              <div className="pts-table-row2" style={{ '--cols': columns.length }}>
                {columns.map((col) => {
                  const isActive = sort && sort.key === col.key;
                  const direction = isActive ? sort.direction : null;
                  const isPrimary = primaryKey === col.key;
                  return (
                    <div
                      key={col.key}
                      className={`pts-table-header-cell pts-stat-column sortable ${isActive ? 'pts-active-blue' : ''} ${isPrimary && !isActive ? 'pts-primary-orange' : ''}`}
                    >
                      <button
                        type="button"
                        className={`pts-sort-toggle one ${direction ?? 'none'}`}
                        onClick={() => toggleSort(col.key)}
                      >
                        <span className="pts-column-label">{col.label}</span>
                        <RxTriangleDown className={`pts-chev ${direction === 'asc' ? 'asc' : ''} ${isActive ? 'pts-active-blue' : ''}`} size={30} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pts-table-body">
            {ranked.map((row, idx) => (
              <div key={row.id || row.name || idx} className="pts-table-rows">
                <div className="pts-table-row1">
                  <div className="pts-table-cell">{row.__rank}위</div>
                  <div className="pts-table-cell pts-player-name">{row.name}</div>
                </div>
                <div className="pts-table-row2" style={{ '--cols': columns.length }}>
                  {columns.map((col) => (
                    <div key={col.key} className="pts-table-cell">
                      {fmt(col.key, getVal(row, col.key))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ───────── 메인 컴포넌트 ───────── */
const ProfileTeamStats = () => {
  const { user } = useAuth();

  const GAME_OPTIONS = [
    { value: '전체', label: '전체' },
    { value: '시즌', label: '시즌' },
    { value: '경기', label: '경기' },
  ];
  const CATEGORY_OPTIONS = [
    { value: 'pass', label: '패스' },
    { value: 'run', label: '런' },
    { value: 'defense', label: '수비' },
    { value: '스페셜팀', label: '스페셜팀' },
  ];

  const [gameType, setGameType] = useState('전체');
  const [globalCategory, setGlobalCategory] = useState('pass'); // 초기 화면 = 패스
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const flattened = Object.values(mockData).flat().map(p => ({
      ...p,
      division: p.division || '1부',
    }));
    setPlayers(flattened);
    setLoading(false);
  }, [gameType]);

  // 선택한 카테고리가 해당 포지션에 없으면 표시하지 않음
  const categoryFor = (pos) =>
    POSITION_CATEGORIES[pos]?.includes(globalCategory) ? globalCategory : null;

  // 해당 카테고리의 스탯이 하나도 없으면 선수 필터링(숨김)
  const hasAnyStat = (row, keys) => {
    for (const k of keys) {
      if (k === 'games') continue; // 순수 경기수는 제외
      const v = getVal(row, k);
      if (v == null) continue;
      if (typeof v === 'number' && v !== 0) return true;
      if (typeof v === 'string') {
        if (v.includes('-')) {
          const [a,b] = parsePair(v);
          if (a > 0 || b > 0) return true;
        } else {
          const n = parseFloat(v);
          if (!Number.isNaN(n) && n !== 0) return true;
          if (v.trim() !== '' && v.trim() !== '0') return true;
        }
      }
    }
    return false;
  };

  const byPos = useMemo(() => {
    const g = {};
    players.forEach((p) => {
      if (!g[p.position]) g[p.position] = [];
      g[p.position].push(p);
    });
    return g;
  }, [players]);

  return (
    <div className="pts-stat-position">
      <div className="pts-stat-header">
        <div className="pts-stat-dropdown-group">
          <Dropdown
            label="game"
            placeholder="게임 유형"
            value={gameType}
            options={GAME_OPTIONS}
            onChange={setGameType}
          />
          <Dropdown
            label="category"
            placeholder="스탯 유형"
            value={globalCategory}
            options={CATEGORY_OPTIONS}
            onChange={setGlobalCategory}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 16 }}>Loading...</div>
      ) : (
        <div className="pts-team-stats-by-position">
          {POSITION_ORDER.map((pos) => {
            const cat = categoryFor(pos);
            if (!cat) return null;

            const rows = byPos[pos] || [];
            const columns = statColumns[pos]?.[cat] || [];
            if (!columns.length) return null;

            const metricKeys = columns.map(c => c.key).filter(k => k !== 'games');
            const filteredRows = rows.filter(r => hasAnyStat(r, metricKeys));
            if (!filteredRows.length) return null;

            const primaryKey = PRIMARY_METRIC[pos]?.[cat] || null;

            return (
              <PositionSection
                key={pos}
                title={pos}
                rows={filteredRows}
                categoryKey={cat}
                primaryKey={primaryKey}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfileTeamStats;
