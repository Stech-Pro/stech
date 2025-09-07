import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfileMemo } from '../ProfileMemoLayout/index.js';
// import '../ProfileClip.css';

const PT_LABEL = {
  RUN: '런',
  PASS: '패스',
  PASS_INCOMPLETE: '패스 실패',
  KICKOFF: '킥오프',
  PUNT: '펀트',
  PAT: 'PAT',
  TWOPT: '2PT',
  FIELDGOAL: 'FG',
};

const SIG_MAP = {
  'TWOPTCONV.GOOD': '2PT 성공',
  'TWOPTCONV.NOGOOD': '2PT 실패',
  PATGOOD: 'PAT 성공',
  PATNOGOOD: 'PAT 실패',
  'FIELDGOAL.GOOD': 'FG 성공',
  'FIELDGOAL.NOGOOD': 'FG 실패',
  TD: '터치다운',
  TOUCHDOWN: '터치다운',
  SACK: '색',
  TFL: 'TFL',
  FUMBLE: '펌블',
  INTERCEPTION: '인터셉트',
  TURNOVER: '턴오버',
  SAFETY: '세이프티',
  PENALTY: '페널티',
};

const DOWN_ALIAS = { PAT: 'PAT', TPT: '2PT', '2PT': '2PT', KICKOFF: '킥오프' };
const getDownDisplay = (c) => {
  if (c.specialTeam && DOWN_ALIAS[String(c.specialTeam).toUpperCase()]) {
    return DOWN_ALIAS[String(c.specialTeam).toUpperCase()];
  }
  const ds = String(c.down ?? '').toUpperCase();
  if (DOWN_ALIAS[ds]) return DOWN_ALIAS[ds];
  const dNum = parseInt(ds, 10);
  if (Number.isFinite(dNum)) {
    const ytg = c.toGoYard ?? 0;
    return `${dNum} & ${ytg}`;
  }
  return '';
};

export default function ProfileClip() {
  const { gameKey: raw } = useParams();
  const gameKey = decodeURIComponent(raw || '');
  const navigate = useNavigate();

  const memo = useProfileMemo() || { map: {}, list: [] };
  const game = memo.map?.[gameKey];

  if (!game) {
    return (
      <div className="clip-page-container" style={{ padding: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: 700 }}>경기를 찾을 수 없습니다.</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          현재 URL의 gameKey: <code>{gameKey || '(빈값)'}</code><br />
          사용 가능한 gameKey: <code>{memo.list.map(g=>g.gameKey).join(', ') || '(없음)'}</code>
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="resetButton" onClick={() => navigate('/service/profile/clip')}>← 목록으로</button>
        </div>
      </div>
    );
  }

  return (
    <div className="clip-page-container">
      <div className="clip-page-header" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <button className="resetButton" onClick={() => navigate('/service/profile/clip')}>← 목록으로</button>
        <div style={{ fontWeight: 700 }}>{game.date}</div>
        <div style={{ opacity: 0.7 }}>{game.homeTeam} vs {game.awayTeam} · {game.location || '-'}</div>
      </div>

      <div className="clip-list">
        {game.Clips.map((c) => (
          <div key={c.clipKey} className="clip-row">
            <div className="quarter-name"><div>{c.quarter}Q</div></div>
            <div className="clip-rows">
              <div className="clip-row1">
                <div className="clip-down">{getDownDisplay(c)}</div>
                <div className="clip-type">#{PT_LABEL[c.playType] || c.playType}</div>
              </div>
              <div className="clip-row2">
                <div className="clip-oT">{c.offensiveTeam === 'Home' ? game.homeTeam : game.awayTeam}</div>
                {Array.isArray(c.significantPlays) && c.significantPlays.filter(Boolean).length > 0 ? (
                  <div className="clip-sig">
                    {c.significantPlays.filter(Boolean).map((t, i) => (
                      <span key={`${c.clipKey}-sig-${i}`}>#{SIG_MAP[t] || t}</span>
                    ))}
                  </div>
                ) : (
                  <div className="clip-sig" />
                )}
              </div>
            </div>
          </div>
        ))}
        {game.Clips.length === 0 && (
          <div className="empty" style={{ padding: 24 }}>이 경기에는 표시할 메모가 없습니다.</div>
        )}
      </div>
    </div>
  );
}