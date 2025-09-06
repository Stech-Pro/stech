import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RxTriangleDown } from 'react-icons/rx';
import { FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { mockData } from '../../data/teamplayermock';


/* ───────── 공통 드롭다운 (버그 수정) ───────── */
function Dropdown({ value, options, onChange, label, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onClickOutside = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // ✨ 수정: value에 해당하는 label을 찾아서 표시하도록 변경
  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className="dropdown-container" ref={ref} aria-label={label}>
      <button type="button" className={`dropdown-trigger ${open ? 'open' : ''}`} onClick={() => setOpen((o) => !o)}>
        {/* ✨ 수정: displayText를 사용해 한글 라벨이 보이도록 함 */}
        <span className="dropdown-text">{displayText}</span>
        <FaChevronDown size={16} className={`dropdown-arrow ${open ? 'rotated' : ''}`} />
      </button>
      {open && (
        <div className="dropdown-menu">
          <ul className="dropdown-list">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  className={`dropdown-option ${value === opt.value ? 'selected' : ''}`}
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


/* ───────── 상수/컬럼 정의 ───────── */
const POSITION_ORDER = ['QB','RB','WR','TE','OL','DL','LB','DB','K','P'];
// ... 기존 statColumns, PRIMARY_METRIC 등 모든 상수는 여기에 그대로 붙여넣으세요 ...
const POSITION_CATEGORIES = { /* ... */ };
const PRIMARY_METRIC = { /* ... */ };
const statColumns = { /* ... */ };
const LOWER_IS_BETTER = new Set(['interceptions','sacks','fumbles','fumbles_lost','penalties','sacks_allowed','touchback_percentage']);
const PAIR_FIRST_DESC = new Set(['field_goal']);
const parsePair = (str) => {
  if (typeof str !== 'string') return [0, 0];
  const [a, b] = str.split('-').map((n) => parseFloat(n) || 0);
  return [a, b];
};


/* ───────── 포지션별 테이블 섹션 (수정: 소속팀 컬럼 추가) ───────── */
function PositionSection({ title, rows, categoryKey, primaryKey }) {
  const columns = statColumns[title]?.[categoryKey] || statColumns[title]?.default || [];
  const [sort, setSort] = useState(primaryKey ? { key: primaryKey, direction: 'desc' } : null);
  useEffect(() => { setSort(primaryKey ? { key: primaryKey, direction: 'desc' } : null); }, [primaryKey]);

  const toggleSort = (key) => {
setSort((prev) => (!prev || prev.key !== key ? { key, direction: 'desc' } : { key, direction: prev.direction === 'desc' ? 'asc' : 'desc' }));  };

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const { key, direction } = sort;
    return [...rows].sort((a,b) => {
      if (PAIR_FIRST_DESC.has(key)) {
        const [a1,a2] = parsePair(a[key] ?? '0-0');
        const [b1,b2] = parsePair(b[key] ?? '0-0');
        const prefSign = LOWER_IS_BETTER.has(key) ? 1 : -1;
        const dirSign  = direction === 'asc' ? -1 : 1;
        const d1 = (a1-b1)*prefSign*dirSign;
        if (d1 !== 0) return d1;
        return (a2-b2)*prefSign*dirSign;
      }
      const av = a[key] ?? 0, bv = b[key] ?? 0;
      const base = av<bv ? -1 : av>bv ? 1 : 0;
      const sign = direction === 'asc' ? 1 : -1;
      const low  = LOWER_IS_BETTER.has(key) ? -1 : 1;
      return base*sign*low;
    });
  }, [rows, sort]);

  const ranked = useMemo(() => {
    if (!sorted.length || !sort) return sorted.map((r,i)=>({...r,__rank:i+1}));
    const { key } = sort;
    const valueOf = (r)=> (PAIR_FIRST_DESC.has(key) ? parsePair(r[key] ?? '0-0').join('|') : r[key] ?? 0);
    let last=null, rank=0, seen=0;
    return sorted.map((r)=>{ seen++; const v=valueOf(r); if(v!==last) rank=seen; last=v; return {...r,__rank:rank}; });
  }, [sorted, sort]);

  const fmt = (k,v) => (typeof v === 'number' ? (String(k).includes('percentage') ? v.toFixed(1) : v%1!==0 ? v.toFixed(1) : v) : v ?? '0');

  if (!rows.length) return null;

  return (
    <div className="stat-position-section">
      <div className="table-header"><div className="table-title">{title} 선수 스탯</div></div>
      <div className="table-wrapper">
        <div className="stat-table">
          <div className="table-head">
            <div className="table-row">
              <div className="table-row1">
                <div className="table-header-cell rank-column">순위</div>
                <div className="table-header-cell player-column">선수 이름</div>
                {/* ✨ 수정: 소속팀 헤더 추가 */}
                <div className="table-header-cell team-column">소속팀</div>
              </div>
              <div className="table-row2" style={{ '--cols': columns.length }}>
                {columns.map((col) => {
                  const isActive = sort && sort.key === col.key;
                  const direction = isActive ? sort.direction : null;
                  const isPrimary = primaryKey === col.key;
                  return (
                    <div
                      key={col.key}
                      className={`table-header-cell stat-column sortable ${isActive ? 'active-blue' : ''} ${isPrimary && !isActive ? 'primary-orange' : ''}`}
                    >
                      <button type="button" className={`sort-toggle one ${direction ?? 'none'}`} onClick={() => toggleSort(col.key)}>
                        <span className="column-label">{col.label}</span>
                        <RxTriangleDown className={`chev ${direction === 'asc' ? 'asc' : ''} ${isActive ? 'active-blue' : ''}`} size={30} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="table-body">
            {ranked.map((row, idx) => (
              <div key={row.id || row.name || idx} className="table-rows">
                <div className="table-row1">
                  <div className="table-cell">{row.__rank}위</div>
                  <div className="table-cell player-name">{row.name}</div>
                  {/* ✨ 수정: 소속팀 데이터 셀 추가 */}
                  <div className="table-cell team-name"><span>{row.team}</span></div>
                </div>
                <div className="table-row2" style={{ '--cols': columns.length }}>
                  {columns.map((col) => (
                    <div key={col.key} className="table-cell">{fmt(col.key, row[col.key])}</div>
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
export default function CoachTeamStats () {
  const { user } = useAuth();

  const GAME_OPTIONS = [
    { value: '전체', label: '전체 경기' },
    { value: '시즌', label: '시즌' },
    { value: '친선전', label: '친선전' },
  ];
  
  // ✨ 수정: '전체' 옵션을 추가하여 상태와 UI를 일치시킴
  const CATEGORY_OPTIONS = [
    { value: '전체', label: '전체 유형' },
    { value: 'pass', label: '패스' },
    { value: 'run', label: '런' },
    { value: '스페셜팀', label: '스페셜팀' },
    { value: 'defense', label: '수비' },
  ];

  const [gameType, setGameType] = useState('전체');
  const [globalCategory, setGlobalCategory] = useState('전체'); // 초기값 '전체' 유지
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

  const categoryFor = (pos) => {
    if (globalCategory === '전체' || !POSITION_CATEGORIES[pos]?.includes(globalCategory)) {
        return POSITION_CATEGORIES[pos]?.[0] || 'default';
    }
    return globalCategory;
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
    <div className="stat-position">
      <div className="stat-header">
        <div className="stat-dropdown-group">
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
        <div className="team-stats-by-position">
          {POSITION_ORDER.map((pos) => {
            const rows = byPos[pos] || [];
            if (!rows.length) return null;
            const cat = categoryFor(pos);
            const primaryKey = PRIMARY_METRIC[pos]?.[cat] || PRIMARY_METRIC[pos]?.default || null;
            return (
              <PositionSection
                key={pos}
                title={pos}
                rows={rows}
                categoryKey={cat}
                primaryKey={primaryKey}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}