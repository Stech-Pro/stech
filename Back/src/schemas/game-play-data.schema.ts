import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GamePlayDataDocument = GamePlayData & Document;

@Schema({ collection: 'game-play-data', timestamps: true })
export class GamePlayData {
  @Prop({ required: true, index: true })
  matchId: number; // 경기 ID

  @Prop({ required: true })
  quarter: string; // '1qtr', '2qtr', '3qtr', '4qtr', 'SD'

  @Prop({ required: true })
  playNumber: number; // 플레이 번호

  @Prop()
  gameTime: string; // 게임 시간 (예: '12:00')

  @Prop()
  offenseTeam: string; // 공격팀 (HY, KN 등)

  @Prop()
  ballOn: string; // 볼 위치 (KN-35, HY-29 등)

  @Prop()
  down: string; // 다운 정보 (1-10, 2-6 등)

  @Prop()
  qbPasser: string; // QB/Passer (HY12, KN15 등)

  @Prop()
  playToNumber: string; // 플레이 대상 선수 번호

  @Prop()
  kickPuntYards: string; // 킥/펀트 야드

  @Prop()
  tackleBy: string; // 태클한 선수 (KN08, KN77 등)

  @Prop()
  sack: string; // 색 정보

  @Prop({
    type: {
      offense: String, // 오펜스 게인 야드
      penalty: String, // 페널티 야드
      total: String,   // 총 게인 야드
    },
    default: {}
  })
  gainYards: {
    offense?: string;
    penalty?: string;
    total?: string;
  };

  @Prop({
    type: {
      playerNumber: String, // 킥/펀트 리턴 선수 번호
      yards: String,        // 리턴 야드
    },
    default: {}
  })
  kickReturn: {
    playerNumber?: string;
    yards?: string;
  };

  @Prop({
    type: {
      playerNumber: String, // 펌블한 선수 번호
    },
    default: {}
  })
  fumble: {
    playerNumber?: string;
  };

  @Prop({
    type: {
      playerNumber: String, // 펌블 리커버리한 선수 번호
      yards: String,        // 리커버리 야드
    },
    default: {}
  })
  fumbleRecovery: {
    playerNumber?: string;
    yards?: string;
  };

  @Prop({
    type: {
      playerNumber: String, // 인터셉션한 선수 번호
      yards: String,        // 인터셉션 야드
    },
    default: {}
  })
  interception: {
    playerNumber?: string;
    yards?: string;
  };

  @Prop()
  penalty: string; // 페널티 여부

  @Prop()
  penaltyName: string; // 페널티명

  @Prop()
  firstDown: string; // 퍼스트다운 여부 (FD)

  @Prop()
  remark: string; // 비고

  @Prop({
    type: {
      type: String,   // 득점 타입 (TD, FG, PAT 등)
      points: String, // 득점
    },
    default: {}
  })
  score: {
    type?: string;
    points?: string;
  };

  @Prop({ type: Object })
  rawCells: any; // 원본 셀 데이터 (디버깅용)

  @Prop()
  rawHtml: string; // 원본 HTML (디버깅용)

  @Prop({ default: Date.now })
  crawledAt: Date; // 크롤링 시간
}

export const GamePlayDataSchema = SchemaFactory.createForClass(GamePlayData);

// 인덱스 설정
GamePlayDataSchema.index({ matchId: 1, quarter: 1, playNumber: 1 }, { unique: true });
GamePlayDataSchema.index({ matchId: 1 });
GamePlayDataSchema.index({ quarter: 1 });
GamePlayDataSchema.index({ offenseTeam: 1 });