import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MemoDocument = Memo & Document;

@Schema({ timestamps: true })
export class Memo {
  @Prop({ required: true })
  gameKey: string;

  @Prop({ required: true })
  clipKey: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  teamId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true, enum: ['player', 'coach', 'admin'] })
  userRole: string;

  @Prop({ default: false })
  isPrivate: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const MemoSchema = SchemaFactory.createForClass(Memo);

// 인덱스 설정
MemoSchema.index({ gameKey: 1, clipKey: 1 });
MemoSchema.index({ teamId: 1 });
MemoSchema.index({ userId: 1 });
MemoSchema.index({ createdAt: -1 });