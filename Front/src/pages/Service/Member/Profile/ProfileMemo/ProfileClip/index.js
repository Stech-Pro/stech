// src/pages/Service/Member/Profile/ProfileMemo/ProfileClip/index.js
import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfileMemo } from '../ProfileMemoLayout';
import './ProfileClip.css';
import { TEAM_BY_ID } from '../../../../../../data/TEAMS';
import { fetchGameClips } from '../../../../../../api/gameAPI';
import { useAuth } from '../../../../../../context/AuthContext';

/* 플레이 타입 라벨 */
const PT_LABEL = {
  RUN: '런',
  PASS: '패스',
  KICKOFF: '킥오프',
  PUNT: '펀트',
  PAT: 'PAT',
  TWOPT: '2PT',
  FIELDGOAL: 'FG',
};

/* 시그니처 플레이 라벨 */
const SIG_MAP = {
  'TWOPTCONV.GOOD': '2PT 성공',
  'TWOPTCONV.NOGOOD': '2PT 실패',
  PATGOOD: 'PAT 성공',
  PATNOGOOD: 'PAT 실패',
  'FIELDGOAL.GOOD': 'FG 성공',
  'FIELDGOAL.NOGOOD': 'FG 실패',
  TD: '터치다운',
  SACK: '색',
};

/* 다운표시 라벨 */
const DOWN_ALIAS = { PAT: 'PAT', TPT: '2PT', KICKOFF: '킥오프' };

const getDownDisplay = (c) => {
  if (c?.specialTeam && DOWN_ALIAS[String(c.specialTeam).toUpperCase()])
    return DOWN_ALIAS[String(c.specialTeam).toUpperCase()];
  const ds = String(c?.down ?? '').toUpperCase();
  if (DOWN_ALIAS[ds]) return DOWN_ALIAS[ds];
  const dNum = parseInt(ds, 10);
  if (Number.isFinite(dNum)) {
    const ytg = c?.toGoYard ?? c?.yardsToGo ?? 0;
    return `${dNum} & ${ytg}`;
  }
  return '';
};

const getPenaltyLabel = (c, key, homeName, awayName) => {
  const offenseIsHome = c?.offensiveTeam === 'Home';
  const penalizedIsHome = key.endsWith('.HOME');
  if (key.endsWith('.OFF')) return '공격팀 페널티';
  if (key.endsWith('.DEF')) return '수비팀 페널티';
  if (key === 'PENALTY.HOME') return `${homeName} 페널티`;
  if (key === 'PENALTY.AWAY') return `${awayName} 페널티`;
  return penalizedIsHome === offenseIsHome ? '공격팀 페널티' : '수비팀 페널티';
};

export default function ProfileClip() {
  const { gameKey: raw } = useParams();
  const gameKey = decodeURIComponent(raw || '');
  const navigate = useNavigate();

  const { user } = useAuth(); // ✅ user.memos 사용
  const memo = useProfileMemo() || { map: {}, list: [] };
  const game = memo.map?.[gameKey] || null;

  // 팀 메타
  const homeMeta = game ? TEAM_BY_ID[game.homeTeam] : null;
  const awayMeta = game ? TEAM_BY_ID[game.awayTeam] : null;

  // 비디오 페이지 전달용 팀옵션
  const teamOptions = useMemo(() => {
    const arr = [];
    if (homeMeta?.name) arr.push({ value: 'Home', label: homeMeta.name, logo: homeMeta.logo });
    if (awayMeta?.name) arr.push({ value: 'Away', label: awayMeta.name, logo: awayMeta.logo });
    return arr;
  }, [homeMeta, awayMeta]);

  // 🔹 전체 클립 로딩
  const [rawClips, setRawClips] = useState([]);
  const [loadingClips, setLoadingClips] = useState(false);
  const [clipsError, setClipsError] = useState(null);

  useEffect(() => {
    if (!gameKey) return;
    let abort = false;
    setLoadingClips(true);
    setClipsError(null);

    fetchGameClips(gameKey)
      .then((clipsData) => {
        if (abort) return;

        const transformed = (clipsData || []).map((clip, idx) => {
          const clipKey = String(clip.clipKey ?? clip.id ?? idx);
          const sigRaw = clip.significantPlays?.filter(Boolean) || [];
          const displaySignificantPlays = sigRaw.map((token) => {
            const key = String(token).toUpperCase();
            if (key.startsWith('PENALTY.')) return getPenaltyLabel(clip, key, homeMeta?.name, awayMeta?.name);
            return SIG_MAP[key] || key;
          });

          return {
            id: `${clipKey}__${idx}`,
            clipKey,
            playIndex: clip.playIndex ?? idx,
            quarter: clip.quarter,
            playType: clip.playType,
            down: clip.down,
            yardsToGo: clip.toGoYard ?? clip.yardsToGo,
            offensiveTeam: clip.offensiveTeam,
            gainYard: clip.gainYard,
            clipUrl: clip.clipUrl || null,
            significantPlays: sigRaw,
            displaySignificantPlays,
          };
        });

        setRawClips(transformed);
      })
      .catch((err) => !abort && setClipsError(err))
      .finally(() => !abort && setLoadingClips(false));

  return () => { abort = true; };
  }, [gameKey, homeMeta, awayMeta]);

  // 🔹 user.memos에서 현재 gameKey의 메모만 취합 → clipKey별 그룹
  const memosByClip = useMemo(() => {
    const grouped = {};
    const src = Array.isArray(user?.memos) ? user.memos : [];
    for (const m of src) {
      if (String(m.gameKey) !== String(gameKey)) continue;
      const ck = String(m.clipKey ?? '');
      if (!ck) continue;
      (grouped[ck] = grouped[ck] || []).push(m);
    }
    return grouped;
  }, [user?.memos, gameKey]);

  const getClipMemos = (clipKey) => memosByClip[String(clipKey)] || [];

  // ✅ “메모가 달린 클립만” 보여주기
  const memoClipKeySet = useMemo(
    () => new Set(Object.keys(memosByClip).map(String)),
    [memosByClip]
  );
  const clipsWithMemos = useMemo(
    () => rawClips.filter((c) => memoClipKeySet.has(String(c.clipKey))),
    [rawClips, memoClipKeySet]
  );

  // 🔹 클릭 시 /service/video로 이동
  const onClickClip = (c, idxInFiltered) => {
    const targetClipKey = String(c.clipKey);
    const clipMemos = getClipMemos(targetClipKey);

    navigate('/service/video', {
      state: {
        // 재생/탐색은 전체 rawClips로, 리스트는 필터링만
        rawClips,
        initialFilters: { team: null, quarter: null, playType: null, significantPlay: [] },
        teamOptions,
        initialPlayId: targetClipKey,
        initialPlayIndex: (() => {
          const i = rawClips.findIndex((rc) => String(rc.clipKey) === targetClipKey);
          return i >= 0 ? i : 0;
        })(),
        clipKey: targetClipKey,
        gameKey,
        teamMeta: {
          homeName: homeMeta?.name,
          awayName: awayMeta?.name,
          homeLogo: homeMeta?.logo,
          awayLogo: awayMeta?.logo,
        },
        memos: clipMemos, // 해당 클립의 메모만
      },
    });
  };

  if (!game) return <div className="empty">경기를 찾을 수 없습니다.</div>;

  return (
    <div className="profile-clip-page-container">
      <div className="clip-page-header">
        <div className="matchup-header">
          <div className="team-display">
            {homeMeta?.logo && <img src={homeMeta.logo} alt={homeMeta?.name} className="team-logo" />}
            <span className="team-name">{homeMeta?.name || game.homeTeam}</span>
          </div>
          <span className="vs-text">VS</span>
          <div className="team-display">
            <span className="team-name">{awayMeta?.name || game.awayTeam}</span>
            {awayMeta?.logo && <img src={awayMeta.logo} alt={awayMeta?.name} className="team-logo" />}
          </div>
        </div>
      </div>

      {/* 진행 상태 */}
      {loadingClips && <div className="empty">전체 클립 불러오는 중…</div>}
      {clipsError && !loadingClips && <div className="empty">클립을 불러오지 못했습니다.</div>}

      {/* 클립 목록: 메모가 있는 클립만 */}
      <div className="profile-clip-list">
        {clipsWithMemos.map((c, idx) => {
          const clipMemos = getClipMemos(c.clipKey);
          const firstMemo = clipMemos[0];
          const preview =
            firstMemo?.content || firstMemo?.body || firstMemo?.text || '';

          return (
            <div
              key={c.clipKey ?? idx}
              className="clip-row"
              onClick={() => onClickClip(c, idx)}
            >
              <div className="quarter-name"><div>{c.quarter}Q</div></div>

              <div className="clip-rows">
                <div className="clip-row1">
                  <div className="clip-down">{getDownDisplay(c)}</div>
                  <div className="clip-type">#{PT_LABEL[c.playType] || c.playType}</div>
                </div>

                <div className="clip-row2">
                  <div className="clip-oT">
                    {c.offensiveTeam === 'Home'
                      ? (homeMeta?.name || game.homeTeam)
                      : (awayMeta?.name || game.awayTeam)}
                  </div>

                  {Array.isArray(c.significantPlays) && c.significantPlays.length > 0 ? (
                    <div className="clip-sig">
                      {c.significantPlays.map((t, i) => (
                        <span key={`${c.clipKey}-sig-${i}`}>#{SIG_MAP[t] || t}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="clip-sig" />
                  )}
                </div>

                {/* 메모 프리뷰 + 개수 */}
              </div>
            </div>
          );
        })}

        {clipsWithMemos.length === 0 && (
          <div className="empty">이 경기에서 내가 작성한 메모가 있는 클립이 없습니다.</div>
        )}
      </div>
    </div>
  );
}
