// 팀 스탯 인터페이스
export interface TeamOffenseStats {
  rank: number;
  teamName: string;
  rushYards: string; // "718 (전진 : 791 / 후퇴 : -73)" 형태
  yardsPerAttempt: number;
  attempts: number;
  touchdowns: number;
  longest: number;
}

// 개인 선수 스탯 인터페이스
export interface PlayerStats {
  rank: number;
  playerName: string;
  university: string; // 또는 teamName
  jerseyNumber: number;
  rushYards: string; // "383 (전진 : 434 / 후퇴 : -51)" 형태
  yardsPerAttempt: number;
  attempts: number;
  touchdowns: number;
  longest: number;
}

// API 요청 옵션
export interface KafaStatsOptions {
  league: 'uni' | 'soc'; // 대학 vs 사회인
  type: 'team' | 'individual'; // 팀 vs 개인
  year?: string; // 연도 (선택사항)
  teamFilter?: string; // 특정 팀 필터 (선택사항)
}

// API 응답 공통 형태
export interface KafaStatsResponse<T> {
  success: boolean;
  message: string;
  data: {
    league: string;
    type: string;
    year?: string;
    totalCount: number;
    stats: T[];
  };
}

// 경기 기록지 통계 인터페이스
export interface GameRecordStats {
  // 경기 일반 정보
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  totalPlays: number;
  
  // 팀별 통계
  teamStats: {
    [teamCode: string]: {
      teamName: string;
      totalPlays: number;
      rushingPlays: number;
      passingPlays: number;
      totalYards: number;
      rushingYards: number;
      passingYards: number;
      turnovers: number;
      penalties: number;
      penaltyYards: number;
      scores: number;
      thirdDownAttempts: number;
      thirdDownConversions: number;
      thirdDownPercentage: number;
    };
  };
  
  // 쿼터별 통계
  quarterStats: {
    [quarter: string]: {
      plays: number;
      scores: number;
    };
  };
}