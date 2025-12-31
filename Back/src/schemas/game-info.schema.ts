import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameInfoDocument = GameInfo & Document;

@Schema({ timestamps: true })
export class GameInfo {
  @Prop({ required: true, unique: true })
  gameKey: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: Object, required: false })
  score: {
    home: number;
    away: number;
  };

  @Prop({ required: false })
  region: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: false })
  homeTeam: string;

  @Prop({ required: false })
  awayTeam: string;

  @Prop({ type: [String], default: [] })
  trainingPositions: string[]; // 훈련 시 선택된 포지션들

  @Prop({ required: true })
  uploader: string; // 업로드한 팀명

  @Prop({ default: 'pending' })
  uploadStatus: string; // pending, completed

  @Prop({ type: Object })
  videoUrls: any; // 업로드된 영상 URL들

  @Prop()
  uploadCompletedAt: string;

  @Prop({ default: false })
  report: boolean; // 보고서 생성 여부
}

export const GameInfoSchema = SchemaFactory.createForClass(GameInfo);
