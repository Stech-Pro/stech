import { Module } from '@nestjs/common';
import { VideoUploadController } from './videoupload.controller';
import { VideoUploadService } from './videoupload.service';
import { S3Service } from '../common/services/s3.service';

@Module({
  controllers: [VideoUploadController],
  providers: [VideoUploadService, S3Service],
  exports: [VideoUploadService],
})
export class VideoUploadModule {}