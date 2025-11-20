import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TEAM_BY_ID, TEAM_BY_NAME } from '../data/TEAMS';

const STAT_INITIAL_STORAGE_KEY = 'stat_initial_settings';

// 리그 옵션 정의 (그대로)
const LEAGUE_OPTIONS = [
  { value: '서울', label: '서울', hasDivisions: true },
  { value: '경기강원', label: '경기강원', hasDivisions: true },
  { value: '대구경북', label: '대구경북', hasDivisions: true },
  { value: '부산경남', label: '부산경남', hasDivisions: true },
  { value: '사회인', label: '사회인', hasDivisions: false },
];

// region(영문) → league(한글)
const REGION_TO_LEAGUE = {
  Seoul: '서울',
  'Gyeonggi-Gangwon': '경기강원',
  'Daegu-Gyeongbuk': '대구경북',
  'Busan-Gyeongnam': '부산경남',
  Amateur: '사회인',
};

// 기본 초기값
const DEFAULT_INITIAL_VALUES = {
  league: '서울',
  division: '1부',
};

// ✅ 유저 정보에서 초기 리그/부 뽑기
const deriveInitialFromUser = (user) => {
  if (!user) return DEFAULT_INITIAL_VALUES;

  const rawTeamKey = user.teamId || user.teamID || user.team || user.teamName;
  const team =
    TEAM_BY_ID[rawTeamKey] ||
    TEAM_BY_NAME[rawTeamKey] ||
    null;

  if (!team) return DEFAULT_INITIAL_VALUES;

  const leagueKorean = REGION_TO_LEAGUE[team.region] || DEFAULT_INITIAL_VALUES.league;
  const leagueOption = LEAGUE_OPTIONS.find((l) => l.value === leagueKorean);

  if (!leagueOption) return DEFAULT_INITIAL_VALUES;

  let division;
  if (!leagueOption.hasDivisions) {
    division = '';
  } else {
    if (team.division === '1부' || team.division === '2부') {
      division = team.division;
    } else {
      division = '1부';
    }
  }

  return { league: leagueKorean, division };
};


export const useStatInitial = () => {
  const { user,isInitialized } = useAuth();            // ✅ AuthContext에서 user 가져오기
  const [initialValues, setInitialValues] = useState(DEFAULT_INITIAL_VALUES);
  const [loaded, setLoaded] = useState(false); // 처음 한 번만 초기화하기 위함

  // ✅ 초기 로딩: localStorage → 없으면 user 기준 → 없으면 DEFAULT
  useEffect(() => {
    if (!isInitialized || loaded) return;

    try {
      const stored = localStorage.getItem(STAT_INITIAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setInitialValues({
          ...DEFAULT_INITIAL_VALUES,
          ...parsed,
        });
        setLoaded(true);
        return;
      }

      if (user) {
        const inferred = deriveInitialFromUser(user);
        setInitialValues(inferred);
        setLoaded(true);
        return;
      }

      setInitialValues(DEFAULT_INITIAL_VALUES);
      setLoaded(true);
    } catch (error) {
      console.error('Failed to load stat initial settings:', error);
      setInitialValues(DEFAULT_INITIAL_VALUES);
      setLoaded(true);
    }
  }, [user, loaded, isInitialized]);

  // 설정이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(
        STAT_INITIAL_STORAGE_KEY,
        JSON.stringify(initialValues),
      );
    } catch (error) {
      console.error('Failed to save stat initial settings:', error);
    }
  }, [initialValues, loaded]);

  // 리그 업데이트
  const updateLeague = (league) => {
    const leagueOption = LEAGUE_OPTIONS.find((l) => l.value === league);

    setInitialValues((prev) => {
      const newValues = { ...prev, league };

      if (leagueOption && !leagueOption.hasDivisions) {
        newValues.division = '';
      } else if (leagueOption && leagueOption.hasDivisions && !prev.division) {
        newValues.division = '1부';
      }

      return newValues;
    });
  };

  // 디비전 업데이트
  const updateDivision = (division) => {
    setInitialValues((prev) => ({
      ...prev,
      division,
    }));
  };

  // 초기값 리셋 (유저 기준으로 다시)
  const resetInitialValues = () => {
    if (user) {
      setInitialValues(deriveInitialFromUser(user));
    } else {
      setInitialValues(DEFAULT_INITIAL_VALUES);
    }
  };

  // 리그가 디비전을 가지는지 확인
  const leagueHasDivisions = (leagueName) => {
    const league = LEAGUE_OPTIONS.find((l) => l.value === leagueName);
    return league ? league.hasDivisions : false;
  };

  // 현재 선택된 리그가 디비전을 가지는지
  const currentLeagueHasDivisions = () => {
    return leagueHasDivisions(initialValues.league);
  };

  // 리그 옵션 가져오기
  const getLeagueOptions = () => LEAGUE_OPTIONS;

  // 디비전 옵션 가져오기
  const getDivisionOptions = () => ['1부', '2부'];

  return {
    initialValues,
    updateLeague,
    updateDivision,
    resetInitialValues,
    leagueHasDivisions,
    currentLeagueHasDivisions,
    getLeagueOptions,
    getDivisionOptions,
    loaded,
  };
};
