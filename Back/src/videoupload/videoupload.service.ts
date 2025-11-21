import { Injectable } from '@nestjs/common';
import { S3Service } from '../common/services/s3.service';

@Injectable()
export class VideoUploadService {
  constructor(private readonly s3Service: S3Service) {}

  /**
   * S3 업로드용 Presigned URL 생성
   */
  async generatePresignedUrl(gameKey: string, fileName: string) {
    try {
      // S3 키 생성: videos/GAMEKEY/FILENAME
      const s3Key = `videos/${gameKey}/${fileName}`;

      console.log(`🔗 Presigned URL 생성 시작: ${s3Key}`);

      // S3Service를 통해 Presigned URL 생성
      const uploadUrl = await this.s3Service.generatePresignedUploadUrl(
        s3Key,
        'video/mp4',
        3600, // 1시간 유효
      );

      console.log(`✅ Presigned URL 생성 완료: ${gameKey}/${fileName}`);

      return {
        uploadUrl,
        fileKey: s3Key,
        expiresIn: 3600,
        gameKey,
        fileName,
      };
    } catch (error) {
      console.error(
        `❌ Presigned URL 생성 실패 (${gameKey}/${fileName}):`,
        error,
      );
      throw new Error(`Presigned URL 생성 실패: ${error.message}`);
    }
  }

  /**
   * 특정 경기의 기존 비디오 파일들 조회
   */
  async checkExistingVideos(gameKey: string) {
    try {
      console.log(`📋 기존 비디오 확인 시작: ${gameKey}`);

      // S3Service를 통해 기존 파일들 조회
      const files = await this.s3Service.listVideosByGameKey(gameKey);

      const hasVideos = files.length > 0;
      const fileList = files.map((file) => {
        // 전체 경로에서 파일명만 추출
        // videos/HFHY20240907/clip_0_xxx.mp4 → clip_0_xxx.mp4
        const parts = file.split('/');
        return parts[parts.length - 1];
      });

      // 파일 크기 정보 (선택사항)
      let totalSize = 'Unknown';
      try {
        const sizeInfo = await this.s3Service.getFilesSize(files);
        totalSize = this.formatFileSize(sizeInfo.totalSize);
      } catch (sizeError) {
        console.log('⚠️ 파일 크기 조회 실패:', sizeError.message);
      }

      console.log(
        `✅ 기존 비디오 확인 완료: ${gameKey} - ${files.length}개 파일`,
      );

      return {
        hasVideos,
        fileCount: files.length,
        fileList,
        totalSize,
        files: files, // 전체 경로 (내부 사용)
      };
    } catch (error) {
      console.error(`❌ 기존 비디오 확인 실패 (${gameKey}):`, error);
      throw new Error(`기존 비디오 확인 실패: ${error.message}`);
    }
  }

  /**
   * 바이트를 읽기 쉬운 형식으로 변환
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 클립 인덱스별 파일명 생성
   */
  generateClipFileName(clipIndex: number): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T]/g, '').substring(0, 14); // YYYYMMDDHHMMSS

    return `clip_${clipIndex}_${timestamp}.mp4`;
  }

  /**
   * 특정 경기의 모든 비디오 파일 삭제
   */
  async deleteVideos(gameKey: string) {
    try {
      console.log(`🗑️ ${gameKey} 비디오 삭제 요청 시작`);

      // S3Service를 통해 비디오 파일들 삭제
      const result = await this.s3Service.deleteVideosByGameKey(gameKey);

      console.log(
        `✅ ${gameKey} 비디오 삭제 완료: ${result.deletedCount}개 파일`,
      );

      return {
        deletedCount: result.deletedCount,
        deletedFiles: result.deletedFiles,
      };
    } catch (error) {
      console.error(`❌ ${gameKey} 비디오 삭제 실패:`, error);
      throw new Error(`비디오 삭제 실패: ${error.message}`);
    }
  }

  /**
   * 여러 파일에 대한 Presigned URL 일괄 생성
   */
  async generateMultiplePresignedUrls(gameKey: string, fileCount: number) {
    try {
      console.log(`🔗 ${gameKey}에 대한 ${fileCount}개 파일 URL 생성 시작`);

      const results = [];

      for (let i = 0; i < fileCount; i++) {
        const fileName = this.generateClipFileName(i);
        const result = await this.generatePresignedUrl(gameKey, fileName);
        results.push({
          clipIndex: i,
          ...result,
        });

        // API 호출 간격 (S3 Rate Limiting 방지)
        if (i < fileCount - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      console.log(`✅ ${gameKey} - ${results.length}개 URL 생성 완료`);

      return {
        gameKey,
        fileCount,
        urls: results,
      };
    } catch (error) {
      console.error(`❌ 다중 URL 생성 실패 (${gameKey}):`, error);
      throw new Error(`다중 URL 생성 실패: ${error.message}`);
    }
  }
}
