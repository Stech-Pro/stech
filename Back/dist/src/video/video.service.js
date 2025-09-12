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
exports.VideoService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const uuid_1 = require("uuid");
const video_schema_1 = require("../schemas/video.schema");
const game_schema_1 = require("../schemas/game.schema");
const team_schema_1 = require("../schemas/team.schema");
const player_schema_1 = require("../schemas/player.schema");
const s3_upload_service_1 = require("../utils/s3-upload.service");
let VideoService = class VideoService {
    videoModel;
    gameModel;
    teamModel;
    playerModel;
    s3UploadService;
    constructor(videoModel, gameModel, teamModel, playerModel, s3UploadService) {
        this.videoModel = videoModel;
        this.gameModel = gameModel;
        this.teamModel = teamModel;
        this.playerModel = playerModel;
        this.s3UploadService = s3UploadService;
    }
    async uploadVideo(file, uploadResult, title, description) {
        const videoId = `vid_${(0, uuid_1.v4)().substring(0, 8)}`;
        const newVideo = new this.videoModel({
            videoId,
            url: uploadResult.url,
            fileName: file.originalname,
            fileSize: file.size,
            quarter: '1Q',
            playType: 'Run',
            success: true,
            startYard: {
                side: 'own',
                yard: 0,
            },
            endYard: {
                side: 'own',
                yard: 0,
            },
            gainedYard: 0,
            players: [],
            significantPlays: [],
            gameId: new mongoose_2.Types.ObjectId(),
        });
        await newVideo.save();
        return {
            success: true,
            message: '영상이 성공적으로 업로드되었습니다.',
            data: newVideo,
        };
    }
    async getVideo(videoId) {
        const video = await this.videoModel.findOne({ videoId }).populate({
            path: 'gameId',
            populate: {
                path: 'teamId',
                select: 'teamName logoUrl',
            },
        });
        if (!video) {
            throw new common_1.NotFoundException('영상을 찾을 수 없습니다.');
        }
        return {
            success: true,
            data: video,
        };
    }
    async getGameVideos(gameId) {
        const videos = await this.videoModel
            .find({ gameId })
            .sort({ createdAt: -1 });
        return {
            success: true,
            data: videos,
        };
    }
    async deleteVideo(videoId) {
        const video = await this.videoModel.findOne({ videoId });
        if (!video) {
            throw new common_1.NotFoundException('영상을 찾을 수 없습니다.');
        }
        if (video.url.includes('amazonaws.com')) {
            const urlParts = video.url.split('/');
            const key = urlParts.slice(-2).join('/');
            await this.s3UploadService.deleteFromS3(key);
        }
        await this.videoModel.findOneAndDelete({ videoId });
        return {
            success: true,
            message: '영상이 성공적으로 삭제되었습니다.',
        };
    }
    async getTeamCompleteData(teamId) {
        const team = await this.teamModel.findOne({ teamId });
        if (!team) {
            throw new common_1.NotFoundException('팀을 찾을 수 없습니다.');
        }
        const players = await this.playerModel.find({ teamId: team._id });
        const games = await this.gameModel.find({ teamId: team._id });
        const gamesWithVideos = await Promise.all(games.map(async (game) => {
            const videos = await this.videoModel.find({ gameId: game._id });
            return {
                gameId: game.gameId,
                date: game.date,
                opponent: game.opponent,
                type: game.type,
                clips: videos,
            };
        }));
        const response = {
            team: {
                teamId: team.teamId,
                teamName: team.teamName,
                logoUrl: team.logoUrl,
                players: players,
                games: gamesWithVideos,
                createdAt: team.createdAt,
            },
        };
        return response;
    }
};
exports.VideoService = VideoService;
exports.VideoService = VideoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(video_schema_1.Video.name)),
    __param(1, (0, mongoose_1.InjectModel)(game_schema_1.Game.name)),
    __param(2, (0, mongoose_1.InjectModel)(team_schema_1.Team.name)),
    __param(3, (0, mongoose_1.InjectModel)(player_schema_1.Player.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        s3_upload_service_1.S3UploadService])
], VideoService);
//# sourceMappingURL=video.service.js.map