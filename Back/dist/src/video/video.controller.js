"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const video_service_1 = require("./video.service");
const s3_upload_service_1 = require("../utils/s3-upload.service");
let VideoController = class VideoController {
    videoService;
    s3UploadService;
    constructor(videoService, s3UploadService) {
        this.videoService = videoService;
        this.s3UploadService = s3UploadService;
    }
    async uploadVideo(file, body) {
        const uploadResult = await this.s3UploadService.uploadToS3(file, 'videos');
        if (!uploadResult.success) {
            return {
                success: false,
                message: '비디오 업로드에 실패했습니다.',
                error: uploadResult.error,
            };
        }
        return this.videoService.uploadVideo(file, uploadResult, body.title, body.description);
    }
    async getVideo(videoId) {
        return this.videoService.getVideo(videoId);
    }
    async getGameVideos(gameId) {
        return this.videoService.getGameVideos(gameId);
    }
    async deleteVideo(videoId) {
        return this.videoService.deleteVideo(videoId);
    }
    async getTeamCompleteData(teamId) {
        return this.videoService.getTeamCompleteData(teamId);
    }
};
exports.VideoController = VideoController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('video')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: '영상 업로드' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '영상 업로드 성공' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "uploadVideo", null);
__decorate([
    (0, common_1.Get)(':videoId'),
    (0, swagger_1.ApiOperation)({ summary: '영상 조회' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '영상 조회 성공' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '영상을 찾을 수 없음' }),
    __param(0, (0, common_1.Param)('videoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "getVideo", null);
__decorate([
    (0, common_1.Get)('game/:gameId'),
    (0, swagger_1.ApiOperation)({ summary: '특정 경기의 영상들 조회' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '경기 영상 조회 성공' }),
    __param(0, (0, common_1.Param)('gameId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "getGameVideos", null);
__decorate([
    (0, common_1.Delete)(':videoId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '영상 삭제' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '영상 삭제 성공' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '영상을 찾을 수 없음' }),
    __param(0, (0, common_1.Param)('videoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "deleteVideo", null);
__decorate([
    (0, common_1.Get)('team/:teamId/complete'),
    (0, swagger_1.ApiOperation)({ summary: '팀의 전체 데이터 조회' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '팀 데이터 조회 성공' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '팀을 찾을 수 없음' }),
    __param(0, (0, common_1.Param)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideoController.prototype, "getTeamCompleteData", null);
exports.VideoController = VideoController = __decorate([
    (0, swagger_1.ApiTags)('Video'),
    (0, common_1.Controller)('video'),
    __metadata("design:paramtypes", [video_service_1.VideoService,
        s3_upload_service_1.S3UploadService])
], VideoController);
//# sourceMappingURL=video.controller.js.map