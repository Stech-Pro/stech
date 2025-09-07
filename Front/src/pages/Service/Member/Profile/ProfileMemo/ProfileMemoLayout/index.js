// ProfileMemoLayout/index.js

import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
// import { useAuth } from '../../../../../../context/AuthContext'; // 실제 환경에서는 이 줄의 주석을 해제하고 사용하세요.

// 2️⃣ 원본 데이터 (이 Clips 배열 안에 아래 defaultKeys에 해당하는 clipKey가 있는지 확인)
export const SEED_GAMES = [
  {
    gameKey: '2024-10-05-BG-YS',
    date: '2024-10-05(토) 13:00',
    type: 'Season',
    score: { home: 28, away: 20 },
    region: 'Busan-Gyeongnam',
    location: '부산 구덕운동장',
    homeTeam: '부산 그리폰즈',
    awayTeam: '연세대 이글스',
    Clips: [
      { clipKey: 'BG-YS-1', offensiveTeam: 'Home', quarter: 1, down: '1', toGoYard: 10, playType: 'RUN', significantPlays: [null] },
      { clipKey: 'BG-YS-2', offensiveTeam: 'Home', quarter: 2, down: '3', toGoYard: 7, playType: 'PASS', significantPlays: ['TD', 'PATGOOD'] },
      { clipKey: 'BG-YS-3', offensiveTeam: 'Away', quarter: 4, down: 'PAT', toGoYard: 2, playType: 'PAT', specialTeam: 'PAT', significantPlays: ['PATNOGOOD'] },
    ],
  },
  {
    gameKey: '2024-09-20-BG-KU',
    date: '2024-09-20(금) 19:00',
    type: 'Friendly match',
    score: { home: 17, away: 16 },
    region: 'Busan-Gyeongnam',
    location: '사직보조경기장',
    homeTeam: '부산 그리폰즈',
    awayTeam: '고려대 타이거스',
    Clips: [
      { clipKey: 'BG-KU-1', offensiveTeam: 'Away', quarter: 2, down: '3', toGoYard: 12, playType: 'PASS', significantPlays: ['SACK'] },
      { clipKey: 'BG-KU-2', offensiveTeam: 'Home', quarter: 4, down: 'TPT', toGoYard: 1, playType: 'TWOPT', specialTeam: 'TPT', significantPlays: ['TWOPTCONV.NOGOOD'] },
      { clipKey: 'BG-KU-3', offensiveTeam: 'Home', quarter: 3, down: '4', toGoYard: 8, playType: 'FIELDGOAL', significantPlays: ['FIELDGOAL.GOOD'] },
    ],
  },
];

const MemoCtx = createContext({ list: [], map: {}, ready: true });
export const useProfileMemo = () => useContext(MemoCtx);

export default function ProfileMemoLayout() {
  const auth = { role: 'player', user: {} };
  const role = auth?.role || 'player';
  const user = auth?.user || {};

  // 1️⃣ 보여주고자 하는 클립 키 목록 (이 부분이 정확한지 확인)
  // 이 키 값들에 해당하는 클립이 SEED_GAMES에 없으면 목록이 비게 됩니다.
  const defaultKeys = ['BG-YS-2', 'BG-KU-3'];
  
  const memoKeys =
    role === 'coach'
      ? user?.teamMemoClipKeys || defaultKeys
      : user?.memoClipKeys || defaultKeys;

  const setOfKeys = useMemo(() => new Set((memoKeys || []).map(String)), [memoKeys]);

  // 3️⃣ 필터링 로직 (위 1, 2번을 바탕으로 경기 목록을 만듦)
  const value = useMemo(() => {
    const list = SEED_GAMES.map((g) => {
      const clips = (g.Clips || []).filter((c) => setOfKeys.has(String(c.clipKey)));
      if (!clips.length) return null;
      return { ...g, Clips: clips };
    }).filter(Boolean);

    const map = Object.fromEntries(list.map((g) => [g.gameKey, g]));
    return { list, map, ready: true };
  }, [setOfKeys]);

  useEffect(() => {
    console.log('[ProfileMemoLayout] games=', value.list.map((g) => g.gameKey));
  }, [value]);

  return (
    <MemoCtx.Provider value={value}>
      <Outlet />
    </MemoCtx.Provider>
  );
}