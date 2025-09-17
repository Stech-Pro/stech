import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TeamModule } from './team/team.module';
import { VideoModule } from './video/video.module';
import { PlayerModule } from './player/player.module';
import { GameModule } from './game/game.module';
import { AdminModule } from './admin/admin.module';
import { ContactModule } from './contact/contact.module';
import { VideoUploadModule } from './videoupload/videoupload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/stech',
      { autoIndex: false },
    ),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    MulterModule.register({
      dest: './uploads',
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
    AuthModule,
    TeamModule,
    VideoModule,
    PlayerModule,
    GameModule,
    AdminModule,
    ContactModule,
    VideoUploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
