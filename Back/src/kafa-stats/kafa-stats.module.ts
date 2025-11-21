import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KafaStatsService } from './kafa-stats.service';
import { KafaStatsController } from './kafa-stats.controller';
import { 
  KafaPlayerStats, 
  KafaPlayerStatsSchema 
} from '../schemas/kafa-player-stats.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KafaPlayerStats.name, schema: KafaPlayerStatsSchema },
    ]),
  ],
  providers: [KafaStatsService],
  controllers: [KafaStatsController],
  exports: [KafaStatsService], // 다른 모듈에서 사용 가능
})
export class KafaStatsModule {}