// ProfileMemoLayout/index.js

import React, { createContext, useContext, useMemo, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../../../../../context/AuthContext';
import { fetchTeamGames, fetchGameClips } from '../../../../../../api/gameAPI';
import { listMemos } from '../../../../../../api/memoAPI';

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
  const { user, token } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  
  const role = user?.role || 'player';
  const teamId = user?.team || user?.teamName || '';

  useEffect(() => {
    const loadMemoGames = async () => {
      if (!teamId || !token) {
        console.log('No teamId or token, using seed data');
        // 비로그인 상태나 팀 정보 없을 때는 시드 데이터 사용
        const defaultKeys = ['BG-YS-2', 'BG-KU-3'];
        const setOfKeys = new Set(defaultKeys);
        
        const list = SEED_GAMES.map((g) => {
          const clips = (g.Clips || []).filter((c) => setOfKeys.has(String(c.clipKey)));
          if (!clips.length) return null;
          return { ...g, Clips: clips };
        }).filter(Boolean);
        
        setGames(list);
        setReady(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Loading games for team:', teamId);
        console.log('User memos:', user?.memos);
        
        // 1. 사용자가 메모를 작성한 클립 목록 가져오기
        const userMemoClips = user?.memos || [];
        if (userMemoClips.length === 0) {
          console.log('User has no memo clips');
          setGames([]);
          setReady(true);
          setLoading(false);
          return;
        }
        
        // 2. 팀 경기 목록 가져오기
        const teamGames = await fetchTeamGames(teamId);
        console.log('Team games:', teamGames);
        
        // 3. 메모가 있는 경기만 필터링
        const gamesWithMemoClips = [];
        
        for (const game of teamGames) {
          try {
            // 경기 클립 가져오기
            const clips = await fetchGameClips(game.gameKey);
            console.log(`Clips for ${game.gameKey}:`, clips);
            
            // 사용자가 메모를 작성한 클립만 필터링
            const clipsWithMemos = clips.filter(clip => 
              userMemoClips.some(memoClip => 
                memoClip.gameKey === game.gameKey && 
                memoClip.clipKey === clip.clipKey
              )
            );
            
            if (clipsWithMemos.length > 0) {
              gamesWithMemoClips.push({
                gameKey: game.gameKey,
                date: game.date,
                type: game.type,
                score: { home: game.homeScore, away: game.awayScore },
                location: game.location,
                homeTeam: game.homeId,
                awayTeam: game.awayId,
                Clips: clipsWithMemos
              });
            }
          } catch (err) {
            console.error('Error processing game:', game.gameKey, err);
          }
        }
        
        console.log('Games with memo clips:', gamesWithMemoClips);
        setGames(gamesWithMemoClips);
        
      } catch (error) {
        console.error('Error loading memo games:', error);
        // 오류 시 시드 데이터 사용
        const defaultKeys = ['BG-YS-2', 'BG-KU-3'];
        const setOfKeys = new Set(defaultKeys);
        
        const list = SEED_GAMES.map((g) => {
          const clips = (g.Clips || []).filter((c) => setOfKeys.has(String(c.clipKey)));
          if (!clips.length) return null;
          return { ...g, Clips: clips };
        }).filter(Boolean);
        
        setGames(list);
      } finally {
        setReady(true);
        setLoading(false);
      }
    };

    loadMemoGames();
  }, [teamId, token, user?.memos]);

  // 경기 목록과 맵 생성
  const value = useMemo(() => {
    const map = Object.fromEntries(games.map((g) => [g.gameKey, g]));
    return { list: games, map, ready, loading };
  }, [games, ready, loading]);

  return (
    <MemoCtx.Provider value={value}>
      <Outlet />
    </MemoCtx.Provider>
  );
}