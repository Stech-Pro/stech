import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { User, UserSchema } from '../schemas/user.schema';
import { Team, TeamSchema } from '../schemas/team.schema';
import {
  PlayerTotalStats,
  PlayerTotalStatsSchema,
} from '../schemas/player-total-stats.schema';
import {
  PlayerSeasonStats,
  PlayerSeasonStatsSchema,
} from '../schemas/player-season-stats.schema';
import {
  PlayerGameStats,
  PlayerGameStatsSchema,
} from '../schemas/player-game-stats.schema';
import { EmailService } from '../utils/email.service';
import { S3UploadService } from '../utils/s3-upload.service';
import { KafaStatsModule } from '../kafa-stats/kafa-stats.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Team.name, schema: TeamSchema },
      { name: PlayerTotalStats.name, schema: PlayerTotalStatsSchema },
      { name: PlayerSeasonStats.name, schema: PlayerSeasonStatsSchema },
      { name: PlayerGameStats.name, schema: PlayerGameStatsSchema },
    ]),
    PassportModule,
    JwtModule.register({
      secret: 'stech-super-secret-key-2025',
      signOptions: { expiresIn: '7d' },
    }),
    KafaStatsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailService, S3UploadService],
  exports: [AuthService, MongooseModule], // MongooseModule도 export하여 User 모델 사용 가능
})
export class AuthModule {}
