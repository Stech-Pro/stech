import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileMemo } from '../ProfileMemoLayout';
import { TEAM_BY_ID } from '../../../../../../data/TEAMS';

export default function ProfileGame() {
  const navigate = useNavigate();
  const memo = useProfileMemo() || { list: [], loading: false, ready: false };

  const go = (g) => navigate(`/service/profile/clip/${encodeURIComponent(g.gameKey)}`);

  if (memo.loading) {
    return <div style={{ padding: 16, color: '#ffffff' }}>메모 클립 영상을 불러오는 중입니다...</div>;
  }

  if (memo.ready && (!memo.list?.length)) {
    return <div style={{ padding: 16, color: '#ffffff' }}>메모가 작성된 경기가 없습니다. 경기 클립에서 메모를 작성해보세요!</div>;
  }

  const games = [...(memo.list || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));

  return (
    <div className="game-container" style={{ paddingBottom: 24 }}>
      <div className="game-header">
        <div className="game-header-cell">날짜</div>
        <div className="game-header-cell">경기 결과</div>
        <div className="game-header-cell">세부사항</div>
      </div>

      <div className="game-list">
        {games.map((g) => {
          const homeMeta = TEAM_BY_ID[g.homeTeam];
          const awayMeta = TEAM_BY_ID[g.awayTeam];
          const homeName = homeMeta?.name || g.homeTeam || '홈팀';
          const awayName = awayMeta?.name || g.awayTeam || '원정팀';
          const homeLogo = homeMeta?.logo || '';
          const awayLogo = awayMeta?.logo || '';
          const dateText = g.date || '-';
          const scoreHome = g.score?.home ?? '-';
          const scoreAway = g.score?.away ?? '-';
          const location = g.location || '-';
          const memoCount = (typeof g.memoCount === 'number') ? g.memoCount : (g.Clips?.length ?? 0);

          return (
            <div
              key={g.gameKey}
              className="game-card"
              onClick={() => go(g)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && go(g)}
              style={{ cursor: 'pointer' }}
            >
              <div className="date">{dateText}</div>

              <div className="game-results">
                <div className="game-team left">
                  <span className="game-team-name">{homeName}</span>
                  {homeLogo && (
                    <div className="game-team-logo">
                      <img
                        src={homeLogo}
                        alt={`${homeName} 로고`}
                        className={`game-team-logo-img ${(homeLogo || '').endsWith('.svg') ? 'svg-logo' : 'png-logo'}`}
                      />
                    </div>
                  )}
                </div>

                <div className="game-score">{scoreHome} : {scoreAway}</div>

                <div className="game-team right">
                  {awayLogo && (
                    <div className="game-team-logo">
                      <img
                        src={awayLogo}
                        alt={`${awayName} 로고`}
                        className={`game-team-logo-img ${(awayLogo || '').endsWith('.svg') ? 'svg-logo' : 'png-logo'}`}
                      />
                    </div>
                  )}
                  <span className="game-team-name">{awayName}</span>
                </div>
              </div>

              <div className="meta"><span>{location}</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
