import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type KafaMatchDocument = KafaMatch & Document;

// 팀 정보 서브스키마
@Schema({ _id: false })
export class TeamInfo {
  @Prop({ required: true })
  name: string; // 한양대학교

  @Prop({ required: true })
  initial: string; // HY

  @Prop({ required: true })
  fullName: string; // 한양대학교 LIONS
}

// 점수 정보 서브스키마
@Schema({ _id: false })
export class QuarterScore {
  @Prop({ default: 0 })
  quarter1: number;

  @Prop({ default: 0 })
  quarter2: number;

  @Prop({ default: 0 })
  quarter3: number;

  @Prop({ default: 0 })
  quarter4: number;

  @Prop({ default: 0 })
  total: number;
}

// 플레이 데이터 서브스키마
@Schema({ _id: false })
export class PlayData {
  @Prop({ required: true })
  quarter: string; // 1qtr, 2qtr, 3qtr, 4qtr

  @Prop({ required: true })
  playNumber: string; // 플레이 번호

  @Prop()
  time: string; // 경기 시간

  @Prop()
  offenseTeam: string; // 공격팀 (HY, YS 등)

  @Prop()
  ballOn: string; // Ball On 위치

  @Prop()
  down: string; // Down 상황 (1-10, 2-7 등)

  @Prop()
  quarterback: string; // QB

  @Prop()
  playType: string; // 플레이 타입

  @Prop()
  gainYd: string; // GAIN YD

  @Prop()
  tackleBy: string; // TACKLE BY

  @Prop()
  sack: string; // SACK

  @Prop()
  penalty: string; // 반칙

  @Prop()
  penaltyName: string; // 반칙명

  @Prop()
  score: string; // 득점

  @Prop()
  remark: string; // 비고
}

@Schema({
  timestamps: true,
  collection: 'kafa_matches',
})
export class KafaMatch {
  @Prop({ required: true })
  leagueId: number; // 소속 리그 ID

  @Prop({ required: true })
  matchIndex: number; // 해당 리그 내 경기 순번 (1, 2, 3...)

  @Prop()
  kafaMatchNumber: number; // KAFA 사이트의 원본 경기 번호 (20, 19, 18...)

  @Prop({ required: true })
  gameDate: string; // 경기 날짜

  @Prop({ required: true })
  venue: string; // 경기장

  @Prop({ required: true, type: TeamInfo })
  homeTeam: TeamInfo;

  @Prop({ required: true, type: TeamInfo })
  awayTeam: TeamInfo;

  @Prop({ type: QuarterScore })
  homeScore: QuarterScore;

  @Prop({ type: QuarterScore })
  awayScore: QuarterScore;

  @Prop()
  leagueType: string; // 리그 타입

  @Prop()
  startTime: string; // 경기 시작 시간

  @Prop()
  endTime: string; // 경기 종료 시간

  @Prop()
  weather: string; // 날씨

  @Prop({
    type: String,
    enum: ['scheduled', 'completed', 'crawled', 'failed'],
    default: 'scheduled',
  })
  status: string;

  @Prop({ type: [PlayData] })
  plays: PlayData[]; // 플레이별 상세 데이터

  @Prop({ default: 0 })
  totalPlays: number; // 총 플레이 수

  @Prop()
  crawledAt: Date; // 크롤링 완료 시간

  @Prop()
  lastUpdatedAt: Date; // 마지막 업데이트 시간
}

export const KafaMatchSchema = SchemaFactory.createForClass(KafaMatch);

// 복합 인덱스: (leagueId, matchIndex) 조합이 유니크해야 함
KafaMatchSchema.index({ leagueId: 1, matchIndex: 1 }, { unique: true });
