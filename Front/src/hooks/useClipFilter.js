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
}) {
  const hasInitialized = useRef(false);
  
  const [filters, setFilters] = useState(() => {
    // 초기화 시에만 localStorage 또는 initialFilters 사용
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

  // localStorage 저장은 디바운스로 처리
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
    }, 500); // 500ms 디바운스
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [filters, persistKey]);

  // 팀 옵션 변경 시에만 검증
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
    return rawClips.filter((r) => {
      if (filters.team && r.offensiveTeam !== filters.team) return false;
      if (filters.quarter && r.quarter !== filters.quarter) return false;
      if (filters.playType && r.playType !== filters.playType) return false;
      if (filters.significantPlay?.length) {
        if (!r.significantPlay || r.significantPlay.length === 0) return false;
        const hasAny = r.significantPlay.some((s) => filters.significantPlay.includes(s));
        if (!hasAny) return false;
      }
      return true;
    });
  }, [rawClips, filters]);

  const summaries = useMemo(() => ({
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