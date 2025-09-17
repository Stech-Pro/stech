import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
    this.bucketName = this.configService.get('AWS_BUCKET_NAME');
  }

  /**
   * gameKey 폴더의 비디오 파일들을 업로드 시간 순서로 조회
   */
  async getVideoFilesByGameKey(gameKey: string): Promise<string[]> {
    try {
      console.log(`🔍 S3에서 videos/${gameKey} 폴더의 파일들 조회 시작`);

      const params = {
        Bucket: this.bucketName,
        Prefix: `videos/${gameKey}/`,
        Delimiter: '/',
      };

      const data = await this.s3.listObjectsV2(params).promise();

      if (!data.Contents || data.Contents.length === 0) {
        console.log(`❌ videos/${gameKey} 폴더에 파일이 없습니다`);
        return [];
      }

      // 비디오 파일만 필터링 (mp4, avi, mov 등)
      const videoFiles = data.Contents.filter((obj) => {
        const key = obj.Key || '';
        return /\.(mp4|avi|mov|mkv|flv|wmv)$/i.test(key);
      });

      // 업로드 시간(LastModified) 기준으로 정렬
      const sortedFiles = videoFiles.sort((a, b) => {
        const dateA = a.LastModified ? new Date(a.LastModified).getTime() : 0;
        const dateB = b.LastModified ? new Date(b.LastModified).getTime() : 0;
        return dateA - dateB; // 오래된 것부터 (업로드 순서)
      });

      const fileKeys = sortedFiles.map((file) => file.Key).filter((key) => key);

      console.log(
        `✅ videos/${gameKey}에서 ${fileKeys.length}개 비디오 파일 발견:`,
        fileKeys,
      );

      return fileKeys;
    } catch (error) {
      console.error(`❌ S3 파일 조회 실패 (${gameKey}):`, error.message);
      return [];
    }
  }

  /**
   * S3 파일의 Signed URL 생성 (1시간 유효)
   */
  async getSignedUrl(
    fileKey: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: fileKey,
        Expires: expiresIn, // 기본 1시간
      };

      const signedUrl = await this.s3.getSignedUrlPromise('getObject', params);
      console.log(`🔗 Signed URL 생성 성공: ${fileKey}`);
      return signedUrl;
    } catch (error) {
      console.error(`❌ Signed URL 생성 실패 (${fileKey}):`, error.message);
      throw new Error(`S3 URL 생성 실패: ${error.message}`);
    }
  }

  /**
   * 게임 클립들에 대해 순서대로 Signed URL 생성
   */
  async generateClipUrls(
    gameKey: string,
    clipCount: number,
  ): Promise<string[]> {
    try {
      const fileKeys = await this.getVideoFilesByGameKey(gameKey);

      if (fileKeys.length === 0) {
        console.log(`⚠️ ${gameKey}에 비디오 파일이 없습니다`);
        return [];
      }

      // 클립 개수만큼만 URL 생성 (파일이 더 많을 수 있으므로)
      const urlsToGenerate = Math.min(clipCount, fileKeys.length);
      const signedUrls: string[] = [];

      for (let i = 0; i < urlsToGenerate; i++) {
        const signedUrl = await this.getSignedUrl(fileKeys[i]);
        signedUrls.push(signedUrl);
      }

      console.log(
        `✅ ${gameKey}에서 ${signedUrls.length}개 클립 URL 생성 완료`,
      );

      if (clipCount > fileKeys.length) {
        console.log(
          `⚠️ 클립 개수(${clipCount})가 파일 개수(${fileKeys.length})보다 많습니다`,
        );
      }

      return signedUrls;
    } catch (error) {
      console.error(`❌ 클립 URL 생성 실패 (${gameKey}):`, error.message);
      return [];
    }
  }

  /**
   * 업로드용 Presigned URL 생성 (PUT 방식)
   */
  async generatePresignedUploadUrl(
    fileKey: string,
    contentType: string = 'video/mp4',
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: fileKey,
        Expires: expiresIn,
        ContentType: contentType,
      };

      const uploadUrl = await this.s3.getSignedUrlPromise('putObject', params);
      console.log(`🔗 업로드 URL 생성 성공: ${fileKey}`);
      return uploadUrl;
    } catch (error) {
      console.error(`❌ 업로드 URL 생성 실패 (${fileKey}):`, error.message);
      throw new Error(`S3 업로드 URL 생성 실패: ${error.message}`);
    }
  }

  /**
   * gameKey별 비디오 파일 목록 조회 (새로운 경로 구조 사용)
   */
  async listVideosByGameKey(gameKey: string): Promise<string[]> {
    try {
      console.log(`🔍 S3에서 stechpro-frontend/${gameKey} 폴더의 파일들 조회 시작`);

      const params = {
        Bucket: this.bucketName,
        Prefix: `stechpro-frontend/${gameKey}/`,
        Delimiter: '/',
      };

      const data = await this.s3.listObjectsV2(params).promise();

      if (!data.Contents || data.Contents.length === 0) {
        console.log(`❌ stechpro-frontend/${gameKey} 폴더에 파일이 없습니다`);
        return [];
      }

      // 비디오 파일만 필터링 (mp4, avi, mov 등)
      const videoFiles = data.Contents.filter((obj) => {
        const key = obj.Key || '';
        return /\.(mp4|avi|mov|mkv|flv|wmv)$/i.test(key);
      });

      // clip_ 패턴으로 정렬 (인덱스 기준)
      const sortedFiles = videoFiles.sort((a, b) => {
        const keyA = a.Key || '';
        const keyB = b.Key || '';
        
        // clip_숫자_ 패턴에서 숫자 추출
        const indexA = parseInt(keyA.match(/clip_(\d+)_/)?.[1] || '999');
        const indexB = parseInt(keyB.match(/clip_(\d+)_/)?.[1] || '999');
        
        return indexA - indexB;
      });

      const fileKeys = sortedFiles.map((file) => file.Key).filter((key) => key);

      console.log(
        `✅ stechpro-frontend/${gameKey}에서 ${fileKeys.length}개 비디오 파일 발견:`,
        fileKeys.map(key => key.split('/').pop()), // 파일명만 표시
      );

      return fileKeys;
    } catch (error) {
      console.error(`❌ S3 파일 조회 실패 (${gameKey}):`, error.message);
      return [];
    }
  }

  /**
   * 파일들의 총 크기 계산
   */
  async getFilesSize(fileKeys: string[]): Promise<{ totalSize: number; fileSizes: Array<{ key: string; size: number }> }> {
    try {
      const fileSizes = [];
      let totalSize = 0;

      for (const key of fileKeys) {
        const params = {
          Bucket: this.bucketName,
          Key: key,
        };

        const headData = await this.s3.headObject(params).promise();
        const size = headData.ContentLength || 0;
        
        fileSizes.push({ key, size });
        totalSize += size;
      }

      return { totalSize, fileSizes };
    } catch (error) {
      console.error('❌ 파일 크기 조회 실패:', error.message);
      throw new Error(`파일 크기 조회 실패: ${error.message}`);
    }
  }
}
