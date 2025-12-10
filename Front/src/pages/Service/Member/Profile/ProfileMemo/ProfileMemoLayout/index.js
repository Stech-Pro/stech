// src/pages/Service/Member/Profile/ProfileMemo/ProfileMemoLayout/index.js (혹은 동일 파일)
import React, { createContext, useContext, useMemo, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../../../../../context/AuthContext';
import { fetchTeamGames, fetchGameByKey } from '../../../../../../api/gameAPI';

const MemoCtx = createContext({ list: [], map: {}, ready: true });
export const useProfileMemo = () => useContext(MemoCtx);

// "1__0" -> "1" 정규화
const normalizeClipKey = (k) => String(k ?? '').split('__')[0];

export default function ProfileMemoLayout() {
  const { user, token } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const teamId = user?.team || user?.teamName || '';

  useEffect(() => {
    const load = async () => {
      if (!token || !user) {
        setGames([]);
        setReady(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // ✅ user.memos 그대로 사용
        const memos = Array.isArray(user.memos) ? user.memos : [];
        console.log('Loaded memos from user context:', memos);

        if (memos.length === 0) {
          setGames([]);
          setReady(true);
          setLoading(false);
          return;
        }

        // gameKey 기준으로 clipKey(정규화) 그룹핑 + 총 메모 수 집계
        // grouped[gk] = { clipSet: Set<string>, total: number }
        const grouped = new Map();
        for (const m of memos) {
          const gk = String(m.gameKey || '');
          const ck = normalizeClipKey(m.clipKey);
          if (!gk || !ck) continue;

          if (!grouped.has(gk)) grouped.set(gk, { clipSet: new Set(), total: 0 });
          const entry = grouped.get(gk);
          entry.clipSet.add(ck);
          entry.total += 1;                 // ✅ 총 메모 수
        }

        const gameKeys = Array.from(grouped.keys());

        // 팀 경기 메타
        let teamGamesByKey = {};
        try {
          if (teamId) {
            const tg = await fetchTeamGames(teamId);
            teamGamesByKey = Object.fromEntries((tg || []).map(g => [String(g.gameKey), g]));
          }
        } catch (e) {
          console.warn('⚠️ fetchTeamGames 실패, 메타 없이 진행:', e);
        }

        // 각 gameKey별 카드 구성
        const results = [];
        for (const gk of gameKeys) {
          const { clipSet, total } = grouped.get(gk) || { clipSet: new Set(), total: 0 };
          const memoClipKeys = Array.from(clipSet);    // 고유 clipKey 리스트
          const memoUniqueClipCount = memoClipKeys.length;
          const memoTotalCount = total;                // ✅ 총 메모 수

          let meta = teamGamesByKey[gk];
          if (!meta) {
            try {
              meta = await fetchGameByKey(gk);
            } catch {}
          }
          meta = meta || {};

          results.push({
            gameKey: gk,
            date: meta.date || '',
            type: meta.type || '',
            score: {
              home: meta.homeScore ?? meta.score?.home ?? '-',
              away: meta.awayScore ?? meta.score?.away ?? '-',
            },
            location: meta.location || '',
            homeTeam: meta.homeId || meta.homeTeam || '',
            awayTeam: meta.awayId || meta.awayTeam || '',
            memoClipKeys,             // 고유 clipKey 배열
            memoUniqueClipCount,      // ✅ 고유 clip 개수
            memoTotalCount,           // ✅ 총 메모 개수 (Auth에서 본 length와 비교용)
            Clips: [],
          });
        }

        setGames(results);
      } catch (err) {
        console.error('❌ 메모 게임 로딩 오류:', err);
        setGames([]);
      } finally {
        setReady(true);
        setLoading(false);
      }
    };

    // deps: user 객체가 바뀌거나 user.memos 배열이 바뀔 때 동작
    load();
  }, [user, token, user?.memos]);

  const value = useMemo(() => {
    const map = Object.fromEntries(games.map(g => [g.gameKey, g]));
    return { list: games, map, ready, loading };
  }, [games, ready, loading]);

  return (
    <MemoCtx.Provider value={value}>
      <Outlet />
    </MemoCtx.Provider>
  );
}
