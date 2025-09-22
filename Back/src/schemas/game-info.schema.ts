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

  @Prop({ type: Object, required: true })
  score: {
    home: number;
    away: number;
  };

  @Prop({ required: true })
  region: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  homeTeam: string;

  @Prop({ required: true })
  awayTeam: string;

  @Prop({ required: true })
  uploader: string; // 업로드한 팀명

  @Prop({ default: 'pending' })
  uploadStatus: string; // pending, completed

  @Prop({ type: Object })
  videoUrls: any; // 업로드된 영상 URL들

  @Prop()
  uploadCompletedAt: string;
}

export const GameInfoSchema = SchemaFactory.createForClass(GameInfo);
