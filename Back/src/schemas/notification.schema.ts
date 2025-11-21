import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  userId: string; // 받는 사용자 ID

  @Prop({ required: true })
  team: string; // 받는 사용자의 팀

  @Prop({ required: true })
  gameKey: string; // 관련 경기 키

  @Prop({
    required: true,
    enum: ['game_analysis_complete', 'game_deleted', 'system', 'memo'],
  })
  type: string; // 알림 타입

  @Prop({ required: true })
  title: string; // 알림 제목

  @Prop({ required: true })
  message: string; // 알림 내용

  @Prop({ default: false })
  isRead: boolean; // 읽음 여부

  @Prop({ type: Object })
  gameInfo?: {
    homeTeam: string;
    awayTeam: string;
    date: string;
  }; // 경기 정보 (선택사항)
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// 인덱스 설정
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ team: 1, createdAt: -1 });
