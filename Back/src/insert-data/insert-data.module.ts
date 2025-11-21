import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InsertDataController } from './insert-data.controller';
import { InsertDataService } from './insert-data.service';
import {
  PlayerTotalStats,
  PlayerTotalStatsSchema,
} from '../schemas/player-total-stats.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlayerTotalStats.name, schema: PlayerTotalStatsSchema },
    ]),
  ],
  controllers: [InsertDataController],
  providers: [InsertDataService],
  exports: [InsertDataService], // 다른 모듈에서 사용 가능하도록 export
})
export class InsertDataModule {}
