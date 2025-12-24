import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type KafaLeagueDocument = KafaLeague & Document;

@Schema({
  timestamps: true,
  collection: 'kafa_leagues',
})
export class KafaLeague {
  @Prop({ required: true, unique: true })
  leagueId: number; // KAFA 실제 L_l_index (19, 24, 17...)

  @Prop()
  displayNumber: number; // 화면에 표시되는 순번 (1, 2, 3...)

  @Prop({ required: true })
  name: string; // 제65회 전국대학미식축구 선수권 대회

  @Prop({ required: true })
  category: string; // 전국대회, 서울협회, 대구·경북 협회

  @Prop({ required: true })
  sportType: string; // 택클풋볼

  @Prop({ required: true })
  division: string; // 대학, 사회인

  @Prop({
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active',
  })
  status: string;

  @Prop({ default: 0 })
  totalMatches: number; // 해당 리그의 총 경기 수

  @Prop({ default: 0 })
  crawledMatches: number; // 크롤링 완료된 경기 수

  @Prop()
  lastCrawledAt: Date; // 마지막 크롤링 시간

  @Prop()
  lastUpdatedAt: Date; // 리그 정보 마지막 업데이트
}

export const KafaLeagueSchema = SchemaFactory.createForClass(KafaLeague);
