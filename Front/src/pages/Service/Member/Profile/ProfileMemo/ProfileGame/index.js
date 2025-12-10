import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileMemo } from '../ProfileMemoLayout/index.js';

export default function ProfileGame() {
  const navigate = useNavigate();
  const memo = useProfileMemo() || { list: [], loading: false, ready: false };

  const go = (g) => navigate(`/service/profile/clip/${encodeURIComponent(g.gameKey)}`);

  if (memo.loading) {
    return <div style={{ padding: 16 }}>메모 클립 영상을 불러오는 중입니다...</div>;
  }

  if (memo.ready && (!memo.list?.length)) {
    return <div style={{ padding: 16 }}>메모가 작성된 경기가 없습니다. 경기 클립에서 메모를 작성해보세요!</div>;
  }

  return (
    <div className="game-container" style={{ paddingBottom: 24 }}>
      <div className="game-header">
        <div className="game-header-cell">날짜</div>
        <div className="game-header-cell">경기 결과</div>
        <div className="game-header-cell">세부사항</div>
        <div className="game-header-cell">경기보고서</div>
        <div className="game-header-cell">길이</div>
      </div>

      <div className="game-list">
        {memo.list.map((g) => (
          <div
            key={g.gameKey}
            className="game-card"
            onClick={() => go(g)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && go(g)}
            style={{ cursor: 'pointer' }}
          >
            <div className="date">{g.date}</div>
            <div className="game-results">
              <div className="game-team left"><span className="game-team-name">{g.homeTeam}</span></div>
              <div className="game-score">{(g.score?.home ?? '-')}{' : '}{(g.score?.away ?? '-')}</div>
              <div className="game-team right"><span className="game-team-name">{g.awayTeam}</span></div>
            </div>
            <div className="meta"><span>{g.location || '-'}</span></div>
            <div className="game-report reportY"><span className="report-text">보고서</span></div>
            <div className="game-length">-</div>
          </div>
        ))}
      </div>
    </div>
  );
}