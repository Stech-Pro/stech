import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VideoUploadService } from './videoupload.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Video Upload')
@Controller('videoupload')
export class VideoUploadController {
  constructor(private readonly videoUploadService: VideoUploadService) {}

  @Post('presigned-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '🎬 비디오 업로드용 Presigned URL 생성',
    description: 'S3에 비디오를 직접 업로드할 수 있는 임시 URL을 생성합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ Presigned URL 생성 성공',
    schema: {
      example: {
        success: true,
        uploadUrl: 'https://s3.amazonaws.com/bucket/stechpro-frontend/HFHY20240907/clip_0_20241216_143022.mp4?...',
        fileKey: 'stechpro-frontend/HFHY20240907/clip_0_20241216_143022.mp4',
        expiresIn: 3600,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '❌ 잘못된 요청 데이터',
  })
  async getPresignedUrl(
    @Body() body: { gameKey: string; fileName: string },
  ) {
    try {
      if (!body.gameKey || !body.fileName) {
        throw new HttpException(
          {
            success: false,
            message: 'gameKey와 fileName이 필요합니다',
            code: 'MISSING_PARAMETERS',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // gameKey 형식 검증 (4글자 + 8숫자)
      if (!/^[A-Z]{4}[0-9]{8}$/.test(body.gameKey)) {
        throw new HttpException(
          {
            success: false,
            message: 'gameKey 형식이 올바르지 않습니다 (예: HFHY20240907)',
            code: 'INVALID_GAMEKEY_FORMAT',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.videoUploadService.generatePresignedUrl(
        body.gameKey,
        body.fileName,
      );

      return {
        success: true,
        ...result,
        message: 'Presigned URL 생성 완료',
      };
    } catch (error) {
      console.error('❌ Presigned URL 생성 실패:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Presigned URL 생성 중 오류가 발생했습니다',
          code: 'PRESIGNED_URL_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('check/:gameKey')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '📋 경기별 기존 비디오 확인',
    description: '특정 경기에 이미 업로드된 비디오 파일들을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 비디오 목록 조회 성공',
    schema: {
      example: {
        success: true,
        gameKey: 'HFHY20240907',
        hasVideos: true,
        fileCount: 3,
        fileList: [
          'clip_0_20220604_103740.mp4',
          'clip_1_20220604_103850.mp4',
          'clip_2_20220604_103920.mp4',
        ],
        totalSize: '150MB',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '❌ 경기를 찾을 수 없음',
  })
  async checkExistingVideos(@Param('gameKey') gameKey: string) {
    try {
      if (!/^[A-Z]{4}[0-9]{8}$/.test(gameKey)) {
        throw new HttpException(
          {
            success: false,
            message: 'gameKey 형식이 올바르지 않습니다 (예: HFHY20240907)',
            code: 'INVALID_GAMEKEY_FORMAT',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.videoUploadService.checkExistingVideos(gameKey);

      return {
        success: true,
        gameKey,
        ...result,
        message: result.hasVideos
          ? `${result.fileCount}개의 기존 비디오를 찾았습니다`
          : '기존 비디오가 없습니다',
      };
    } catch (error) {
      console.error(`❌ 비디오 목록 조회 실패 (${gameKey}):`, error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: '비디오 목록 조회 중 오류가 발생했습니다',
          code: 'VIDEO_LIST_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}