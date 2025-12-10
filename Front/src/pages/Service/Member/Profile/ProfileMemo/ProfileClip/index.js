import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfileMemo } from '../ProfileMemoLayout';
import './ProfileClip.css'; // CSS 파일 임포트
import {TEAMS, TEAM_BY_ID} from '../../../../../../data/TEAMS';
import { getMemoById } from '../../../../../../api/memoAPI';


const PT_LABEL = { RUN: '런', PASS: '패스', KICKOFF: '킥오프', PUNT: '펀트', PAT: 'PAT', TWOPT: '2PT', FIELDGOAL: 'FG' };
const SIG_MAP = { 'TWOPTCONV.GOOD': '2PT 성공', 'TWOPTCONV.NOGOOD': '2PT 실패', PATGOOD: 'PAT 성공', PATNOGOOD: 'PAT 실패', 'FIELDGOAL.GOOD': 'FG 성공', 'FIELDGOAL.NOGOOD': 'FG 실패', TD: '터치다운', SACK: '색' };
const DOWN_ALIAS = { PAT: 'PAT', TPT: '2PT', KICKOFF: '킥오프' };
const getDownDisplay = (c) => {
  if (c.specialTeam && DOWN_ALIAS[String(c.specialTeam).toUpperCase()]) {
    return DOWN_ALIAS[String(c.specialTeam).toUpperCase()];
  }
  const ds = String(c.down ?? '').toUpperCase();
  if (DOWN_ALIAS[ds]) return DOWN_ALIAS[ds];
  const dNum = parseInt(ds, 10);
  if (Number.isFinite(dNum)) {
    const ytg = c.toGoYard ?? c.yardsToGo ?? 0;
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
    return <div>경기를 찾을 수 없습니다.</div>;
  }

  // 실제 TEAMS 데이터를 사용해 정보 조회
  const homeMeta = TEAM_BY_ID[game.homeTeam];
  const awayMeta = TEAM_BY_ID[game.awayTeam];

  return (
    <div className="profile-clip-page-container">
      <div className="clip-page-header">
        {/* "목록으로" 버튼이 없는 버전 */}
        <div className="matchup-header">
          <div className="team-display">
            <img src={homeMeta.logo} alt={homeMeta.name} className="team-logo" />
            <span className="team-name">{homeMeta.name}</span>
          </div>
          <span className="vs-text">VS</span>
          <div className="team-display">
            <span className="team-name">{awayMeta.name}</span>
            <img src={awayMeta.logo} alt={awayMeta.name} className="team-logo" />
          </div>
        </div>
      </div>


      {/* 전폭 클립 리스트 */}
      <div className="profile-clip-list">
        {game.Clips.map((c) => {
      
        return(
          <div key={c.clipKey} className="clip-row" >
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
              <div className='clip-row3'>
                
              </div>
            </div>
          </div>
        );})}
        {game.Clips.length === 0 && (
          <div className="empty">
            이 경기에는 표시할 메모가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}