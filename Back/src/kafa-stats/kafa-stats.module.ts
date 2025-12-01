import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KafaStatsService } from './kafa-stats.service';
import { KafaMatchInfoService } from './kafa-match-info.service';
import { KafaLeagueCrawlerService } from './kafa-league-crawler.service';
import { KafaBatchService } from './kafa-batch.service';
import { KafaV2CrawlerService } from './kafa-v2-crawler.service';
import { KafaStatsController } from './kafa-stats.controller';
import { 
  KafaPlayerStats, 
  KafaPlayerStatsSchema 
} from '../schemas/kafa-player-stats.schema';
import {
  KafaLeague,
  KafaLeagueSchema
} from '../schemas/kafa-league.schema';
import {
  KafaMatch,
  KafaMatchSchema
} from '../schemas/kafa-match.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KafaPlayerStats.name, schema: KafaPlayerStatsSchema },
      { name: KafaLeague.name, schema: KafaLeagueSchema },
      { name: KafaMatch.name, schema: KafaMatchSchema },
    ]),
  ],
  providers: [
    KafaStatsService, 
    KafaMatchInfoService, 
    KafaLeagueCrawlerService,
    KafaBatchService,
    KafaV2CrawlerService
  ],
  controllers: [KafaStatsController],
  exports: [
    KafaStatsService, 
    KafaMatchInfoService, 
    KafaLeagueCrawlerService,
    KafaBatchService,
    KafaV2CrawlerService
  ], // 다른 모듈에서 사용 가능
})
export class KafaStatsModule {}