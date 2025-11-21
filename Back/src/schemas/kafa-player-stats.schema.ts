import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type KafaPlayerStatsDocument = KafaPlayerStats & Document;

@Schema({ 
  collection: 'kafa_player_stats'
})
export class KafaPlayerStats {
  @Prop({ required: true })
  playerName: string; // 선수명 (예: "홍길동")

  @Prop({ required: true })
  teamName: string; // 팀명 (예: "한양대학교")

  @Prop({ required: true })
  jerseyNumber: number; // 등번호

  @Prop({ required: true })
  position: string; // 포지션 (QB, RB, WR, TE, OL, DL, LB, DB, K, P 등)

  @Prop({ required: true })
  season: string; // 시즌 (예: "2024", "2025")

  @Prop({ required: true, enum: ['uni', 'soc'] })
  league: string; // 리그 구분 (uni: 대학, soc: 사회인)

  @Prop({ type: Object, required: true })
  rushing: {
    totalYards: number;      // 전체 러싱 야드 (전진 + 후퇴)
    forwardYards: number;    // 전진 야드
    backwardYards: number;   // 후퇴 야드 (음수값)
    yardsPerAttempt: number; // 평균 러싱 야드
    attempts: number;        // 러싱 시도 횟수
    touchdowns: number;      // 러싱 터치다운
    longest: number;         // 최장 러싱 거리
  };

  @Prop({ required: true })
  rank: number; // 러싱 야드 기준 순위

  @Prop({ required: true })
  lastUpdated: Date; // 마지막 크롤링 시간

  @Prop({ required: true })
  sourceUrl: string; // 크롤링 소스 URL (예: "https://www.kafa.org/stats/ind_uni1.html")

  @Prop()
  rawYardString?: string; // 원본 야드 문자열 저장 (예: "383 (전진 : 434 / 후퇴 : -51)")

  // 나중에 추가할 다른 스탯들을 위한 필드
  @Prop({ type: Object })
  passing?: {
    yards: number;
    completions: number;
    attempts: number;
    touchdowns: number;
    interceptions: number;
    completionPercentage: number;
  };

  @Prop({ type: Object })
  receiving?: {
    receptions: number;
    yards: number;
    yardsPerReception: number;
    touchdowns: number;
    longest: number;
  };

  @Prop({ type: Object })
  defense?: {
    tackles: number;
    sacks: number;
    interceptions: number;
    forcedFumbles: number;
  };

}

export const KafaPlayerStatsSchema = SchemaFactory.createForClass(KafaPlayerStats);