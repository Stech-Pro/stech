import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemoController } from './memo.controller';
import { MemoService } from './memo.service';
import { Memo, MemoSchema } from '../schemas/memo.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Memo.name, schema: MemoSchema },
      { name: User.name, schema: UserSchema },
    ]),
    NotificationModule,
  ],
  controllers: [MemoController],
  providers: [MemoService],
  exports: [MemoService],
})
export class MemoModule {}