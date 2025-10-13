import { useEffect, useMemo, useState, useRef } from "react";

const DEFAULT_FILTERS = {
  quarter: null,
  playType: null,
  significantPlay: [],
  team: null,
};

export function useClipFilter({
  persistKey = "clipFilters:default",
  rawClips = [],
  teamOptions = [],
  opposites = {},
  initialFilters = {},
  // ===================== [변경점 1] 새로운 옵션 추가 =====================
  // significantPlay 필터링에 사용할 필드 이름을 외부에서 지정할 수 있도록 합니다.
  // 기본값은 'significantPlay'로 설정하여 기존 코드가 깨지지 않도록 합니다. (하위 호환성)
  significantPlayField = 'significantPlay',
  // ====================================================================
}) {
  const hasInitialized = useRef(false);
  
  // ... (useState, useEffect 등 다른 로직은 변경할 필요 없습니다)
  const [filters, setFilters] = useState(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      hasInitialized.current = true;
      return { ...DEFAULT_FILTERS, ...initialFilters };
    }
    try {
      const raw = localStorage.getItem(persistKey);
      if (raw) {
        const p = JSON.parse(raw);
        hasInitialized.current = true;
        return {
          quarter: p?.quarter ?? null,
          playType: p?.playType ?? null,
          significantPlay: Array.isArray(p?.significantPlay) ? p.significantPlay : [],
          team: p?.team ?? null,
        };
      }
    } catch {}
    hasInitialized.current = true;
    return { ...DEFAULT_FILTERS };
  });

  const saveTimeoutRef = useRef(null);
  useEffect(() => {
    if (!hasInitialized.current) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      try { 
        localStorage.setItem(persistKey, JSON.stringify(filters)); 
      } catch {}
    }, 500);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [filters, persistKey]);

  const prevTeamOptionsRef = useRef(teamOptions);
  useEffect(() => {
    if (JSON.stringify(prevTeamOptionsRef.current) !== JSON.stringify(teamOptions)) {
      prevTeamOptionsRef.current = teamOptions;
      
      if (filters.team && !teamOptions.some((o) => o.value === filters.team)) {
        setFilters((f) => ({ ...f, team: null }));
      }
    }
  }, [teamOptions, filters.team]);

  const handleFilterChange = (category, value) => {
    setFilters((prev) => {
      const next = { ...prev };
      switch (category) {
        case "team":
          next.team = value || null;
          break;
        case "quarter":
          next.quarter = value ?? null;
          break;
        case "playType":
          next.playType = value || null;
          break;
        case "significantPlay": {
          const arr = [...(prev.significantPlay || [])];
          const idx = arr.indexOf(value);
          if (idx >= 0) {
            arr.splice(idx, 1);
          } else {
            const opp = opposites?.[value];
            if (opp) {
              const oppIdx = arr.indexOf(opp);
              if (oppIdx >= 0) arr.splice(oppIdx, 1);
            }
            arr.push(value);
          }
          next.significantPlay = arr;
          break;
        }
        default:
          break;
      }
      return next;
    });
  };

  const clearAllFilters = () => setFilters({ ...DEFAULT_FILTERS });

  const clips = useMemo(() => {
    if (!rawClips) return [];
    return rawClips.filter((clip) => { // 'r'을 'clip'으로 변경하여 가독성 향상
      if (filters.team && clip.offensiveTeam !== filters.team) return false;
      if (filters.quarter && clip.quarter !== filters.quarter) return false;
      if (filters.playType && clip.playType !== filters.playType) return false;
      if (filters.significantPlay?.length) {
        // ============= [변경점 2] 동적 필드 이름을 사용하여 필터링 =============
        // 기존: clip.significantPlay
        // 변경: clip[significantPlayField]
        // 이렇게 하면 'significantPlay' 또는 'displaySignificantPlays' 등 원하는 필드를 사용할 수 있습니다.
        const targetArray = clip[significantPlayField];
        if (!targetArray || !Array.isArray(targetArray) || targetArray.length === 0) return false;
        
        const hasAny = targetArray.some((s) => filters.significantPlay.includes(s));
        if (!hasAny) return false;
        // ====================================================================
      }
      return true;
    });
  // =================== [변경점 3] 의존성 배열에 추가 ===================
  }, [rawClips, filters, significantPlayField]);
  // ====================================================================


  const summaries = useMemo(() => ({
    // ... (이 부분은 변경할 필요 없습니다)
    team: filters.team || "공격팀",
    quarter: filters.quarter ? `Q${filters.quarter}` : "쿼터",
    playType: filters.playType || "유형",
    significant: (() => {
      const arr = filters.significantPlay || [];
      if (arr.length === 0) return "중요플레이";
      if (arr.length === 1) return arr[0];
      return `${arr[0]} 외 ${arr.length - 1}`;
    })(),
  }), [filters]);

  return {
    filters,
    setFilters,
    summaries,
    clips,
    handleFilterChange,
    clearAllFilters,
  };
}