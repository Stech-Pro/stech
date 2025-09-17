"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const AWS = __importStar(require("aws-sdk"));
let S3Service = class S3Service {
    configService;
    s3;
    bucketName;
    constructor(configService) {
        this.configService = configService;
        this.s3 = new AWS.S3({
            accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
            region: this.configService.get('AWS_REGION'),
        });
        this.bucketName = this.configService.get('AWS_BUCKET_NAME');
    }
    async getVideoFilesByGameKey(gameKey) {
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
            const videoFiles = data.Contents.filter((obj) => {
                const key = obj.Key || '';
                return /\.(mp4|avi|mov|mkv|flv|wmv)$/i.test(key);
            });
            const sortedFiles = videoFiles.sort((a, b) => {
                const dateA = a.LastModified ? new Date(a.LastModified).getTime() : 0;
                const dateB = b.LastModified ? new Date(b.LastModified).getTime() : 0;
                return dateA - dateB;
            });
            const fileKeys = sortedFiles.map((file) => file.Key).filter((key) => key);
            console.log(`✅ videos/${gameKey}에서 ${fileKeys.length}개 비디오 파일 발견:`, fileKeys);
            return fileKeys;
        }
        catch (error) {
            console.error(`❌ S3 파일 조회 실패 (${gameKey}):`, error.message);
            return [];
        }
    }
    async getSignedUrl(fileKey, expiresIn = 3600) {
        try {
            const params = {
                Bucket: this.bucketName,
                Key: fileKey,
                Expires: expiresIn,
            };
            const signedUrl = await this.s3.getSignedUrlPromise('getObject', params);
            console.log(`🔗 Signed URL 생성 성공: ${fileKey}`);
            return signedUrl;
        }
        catch (error) {
            console.error(`❌ Signed URL 생성 실패 (${fileKey}):`, error.message);
            throw new Error(`S3 URL 생성 실패: ${error.message}`);
        }
    }
    async generateClipUrls(gameKey, clipCount) {
        try {
            const fileKeys = await this.getVideoFilesByGameKey(gameKey);
            if (fileKeys.length === 0) {
                console.log(`⚠️ ${gameKey}에 비디오 파일이 없습니다`);
                return [];
            }
            const signedUrls = [];
            for (let i = 0; i < clipCount; i++) {
                if (i < fileKeys.length) {
                    const signedUrl = await this.getSignedUrl(fileKeys[i]);
                    signedUrls.push(signedUrl);
                }
                else {
                    signedUrls.push(null);
                }
            }
            const validUrls = signedUrls.filter(url => url !== null).length;
            console.log(`✅ ${gameKey}에서 ${validUrls}/${signedUrls.length}개 클립에 비디오 URL 생성 완료`);
            if (clipCount > fileKeys.length) {
                console.log(`ℹ️ 클립 개수(${clipCount})가 파일 개수(${fileKeys.length})보다 많습니다 - 일부 클립은 비디오 없음`);
            }
            return signedUrls;
        }
        catch (error) {
            console.error(`❌ 클립 URL 생성 실패 (${gameKey}):`, error.message);
            return [];
        }
    }
    async deleteVideosByGameKey(gameKey) {
        try {
            console.log(`🗑️ ${gameKey} 비디오 파일 삭제 시작`);
            const fileKeys = await this.getVideoFilesByGameKey(gameKey);
            if (fileKeys.length === 0) {
                console.log(`⚠️ ${gameKey}에 삭제할 비디오 파일이 없습니다`);
                return { deletedCount: 0, deletedFiles: [] };
            }
            console.log(`📁 삭제할 파일들:`, fileKeys.map(key => key.split('/').pop()));
            const deletedFiles = [];
            for (const fileKey of fileKeys) {
                try {
                    await this.s3.deleteObject({
                        Bucket: this.bucketName,
                        Key: fileKey,
                    }).promise();
                    deletedFiles.push(fileKey);
                    console.log(`✅ 파일 삭제 성공: ${fileKey.split('/').pop()}`);
                }
                catch (error) {
                    console.error(`❌ 파일 삭제 실패 (${fileKey}):`, error.message);
                }
            }
            console.log(`🎉 ${gameKey} 비디오 삭제 완료: ${deletedFiles.length}/${fileKeys.length}개 성공`);
            return {
                deletedCount: deletedFiles.length,
                deletedFiles: deletedFiles.map(key => key.split('/').pop()).filter(Boolean),
            };
        }
        catch (error) {
            console.error(`❌ ${gameKey} 비디오 삭제 실패:`, error.message);
            throw new Error(`비디오 삭제 실패: ${error.message}`);
        }
    }
    async generatePresignedUploadUrl(fileKey, contentType = 'video/mp4', expiresIn = 3600) {
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
        }
        catch (error) {
            console.error(`❌ 업로드 URL 생성 실패 (${fileKey}):`, error.message);
            throw new Error(`S3 업로드 URL 생성 실패: ${error.message}`);
        }
    }
    async listVideosByGameKey(gameKey) {
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
            const videoFiles = data.Contents.filter((obj) => {
                const key = obj.Key || '';
                return /\.(mp4|avi|mov|mkv|flv|wmv)$/i.test(key);
            });
            const sortedFiles = videoFiles.sort((a, b) => {
                const keyA = a.Key || '';
                const keyB = b.Key || '';
                const indexA = parseInt(keyA.match(/clip_(\d+)_/)?.[1] || '999');
                const indexB = parseInt(keyB.match(/clip_(\d+)_/)?.[1] || '999');
                return indexA - indexB;
            });
            const fileKeys = sortedFiles.map((file) => file.Key).filter((key) => key);
            console.log(`✅ videos/${gameKey}에서 ${fileKeys.length}개 비디오 파일 발견:`, fileKeys.map(key => key.split('/').pop()));
            return fileKeys;
        }
        catch (error) {
            console.error(`❌ S3 파일 조회 실패 (${gameKey}):`, error.message);
            return [];
        }
    }
    async getFilesSize(fileKeys) {
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
        }
        catch (error) {
            console.error('❌ 파일 크기 조회 실패:', error.message);
            throw new Error(`파일 크기 조회 실패: ${error.message}`);
        }
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map