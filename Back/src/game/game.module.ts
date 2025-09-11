import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { GameController } from './game.controller';
import { GameDocsController } from './game-docs.controller';
import { GameService } from './game.service';
import { PlayerModule } from '../player/player.module';
import { TeamModule } from '../team/team.module';
import { GameInfo, GameInfoSchema } from '../schemas/game-info.schema';
import { GameClips, GameClipsSchema } from '../schemas/game-clips.schema';
import {
  TeamGameStats,
  TeamGameStatsSchema,
} from '../schemas/team-game-stats.schema';
import {
  TeamTotalStats,
  TeamTotalStatsSchema,
} from '../schemas/team-total-stats.schema';
import { S3Service } from '../common/services/s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // Config 모듈 추가 (S3Service에서 환경변수 사용)
    ConfigModule,
    // Mongoose 스키마 등록
    MongooseModule.forFeature([
      { name: GameInfo.name, schema: GameInfoSchema },
      { name: GameClips.name, schema: GameClipsSchema },
      { name: TeamGameStats.name, schema: TeamGameStatsSchema },
      { name: TeamTotalStats.name, schema: TeamTotalStatsSchema },
    ]),
    // Multer 설정 - 파일 업로드 처리
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB 제한
        files: 1, // 한 번에 하나의 파일만
      },
      fileFilter: (req, file, cb) => {
        // JSON 파일만 허용
        if (
          file.mimetype === 'application/json' ||
          file.originalname.toLowerCase().endsWith('.json')
        ) {
          cb(null, true);
        } else {
          cb(new Error('JSON 파일만 업로드 가능합니다'), false);
        }
      },
    }),
    // PlayerModule을 import하여 PlayerService 사용
    forwardRef(() => PlayerModule),
    // TeamModule을 import하여 TeamStatsAnalyzerService 사용
    forwardRef(() => TeamModule),
  ],
  controllers: [GameController, GameDocsController],
  providers: [GameService, S3Service],
  exports: [GameService],
})
export class GameModule {}
