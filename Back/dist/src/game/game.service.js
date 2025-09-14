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
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const game_info_schema_1 = require("../schemas/game-info.schema");
const game_clips_schema_1 = require("../schemas/game-clips.schema");
const team_game_stats_schema_1 = require("../schemas/team-game-stats.schema");
const team_total_stats_schema_1 = require("../schemas/team-total-stats.schema");
let GameService = class GameService {
    gameInfoModel;
    gameClipsModel;
    teamGameStatsModel;
    teamTotalStatsModel;
    constructor(gameInfoModel, gameClipsModel, teamGameStatsModel, teamTotalStatsModel) {
        this.gameInfoModel = gameInfoModel;
        this.gameClipsModel = gameClipsModel;
        this.teamGameStatsModel = teamGameStatsModel;
        this.teamTotalStatsModel = teamTotalStatsModel;
    }
    async createGameInfo(gameData) {
        console.log('🔍 createGameInfo 호출됨, gameData 필드들:');
        console.log('  gameKey:', gameData.gameKey);
        console.log('  date:', gameData.date);
        console.log('  type:', gameData.type);
        console.log('  score:', gameData.score);
        console.log('  region:', gameData.region);
        console.log('  location:', gameData.location);
        console.log('  homeTeam:', gameData.homeTeam);
        console.log('  awayTeam:', gameData.awayTeam);
        const gameInfo = {
            gameKey: gameData.gameKey,
            date: gameData.date,
            type: gameData.type,
            score: gameData.score,
            region: gameData.region,
            location: gameData.location,
            homeTeam: gameData.homeTeam,
            awayTeam: gameData.awayTeam,
        };
        console.log('📝 저장할 gameInfo 객체:', JSON.stringify(gameInfo, null, 2));
        try {
            const createdGameInfo = new this.gameInfoModel(gameInfo);
            const result = await createdGameInfo.save();
            console.log('✅ GameInfo 저장 성공:', result._id);
            return result;
        }
        catch (error) {
            console.error('❌ GameInfo 저장 실패:', error.message);
            console.error('❌ 상세 에러:', error);
            throw error;
        }
    }
    async findGamesByTeam(teamName) {
        return this.gameInfoModel
            .find({
            $or: [{ homeTeam: teamName }, { awayTeam: teamName }],
        })
            .exec();
    }
    async findAllGames() {
        return this.gameInfoModel.find().exec();
    }
    async findGameByKey(gameKey) {
        return this.gameInfoModel.findOne({ gameKey }).exec();
    }
    async updateGameInfo(gameKey, gameData) {
        const updateData = {
            gameKey: gameData.gameKey,
            date: gameData.date,
            type: gameData.type,
            score: gameData.score,
            region: gameData.region,
            location: gameData.location,
            homeTeam: gameData.homeTeam,
            awayTeam: gameData.awayTeam,
        };
        return this.gameInfoModel
            .findOneAndUpdate({ gameKey }, updateData, { new: true, upsert: true })
            .exec();
    }
    async deleteGameInfo(gameKey) {
        console.log(`🗑️ 게임 ${gameKey} 관련 모든 데이터 삭제 시작...`);
        try {
            const gameInfoResult = await this.gameInfoModel
                .deleteOne({ gameKey })
                .exec();
            console.log(`✅ GameInfo 삭제: ${gameInfoResult.deletedCount}개`);
            const gameClipsResult = await this.gameClipsModel
                .deleteOne({ gameKey })
                .exec();
            console.log(`✅ GameClips 삭제: ${gameClipsResult.deletedCount}개`);
            const teamGameStatsResult = await this.teamGameStatsModel
                .deleteMany({ gameKey })
                .exec();
            console.log(`✅ TeamGameStats 삭제: ${teamGameStatsResult.deletedCount}개`);
            const teamTotalStatsResult = await this.teamTotalStatsModel
                .deleteMany({})
                .exec();
            console.log(`✅ TeamTotalStats 삭제 (전체 재계산 필요): ${teamTotalStatsResult.deletedCount}개`);
            console.log(`🎉 게임 ${gameKey} 관련 모든 데이터 삭제 완료`);
            return {
                success: true,
                deletedCounts: {
                    gameInfo: gameInfoResult.deletedCount,
                    gameClips: gameClipsResult.deletedCount,
                    teamGameStats: teamGameStatsResult.deletedCount,
                    teamTotalStats: teamTotalStatsResult.deletedCount,
                },
            };
        }
        catch (error) {
            console.error(`❌ 게임 ${gameKey} 삭제 실패:`, error);
            throw error;
        }
    }
    async saveGameClips(gameData) {
        const existingClips = await this.gameClipsModel.findOne({
            gameKey: gameData.gameKey,
        });
        if (existingClips) {
            return this.gameClipsModel
                .findOneAndUpdate({ gameKey: gameData.gameKey }, gameData, {
                new: true,
            })
                .exec();
        }
        const createdGameClips = new this.gameClipsModel(gameData);
        return createdGameClips.save();
    }
    async getGameClipsByKey(gameKey) {
        return this.gameClipsModel.findOne({ gameKey }).exec();
    }
    async getCoachHighlights(teamName) {
        const games = await this.gameClipsModel
            .find({
            $or: [{ homeTeam: teamName }, { awayTeam: teamName }],
        })
            .exec();
        const highlights = [];
        for (const game of games) {
            const highlightClips = game.Clips.filter((clip) => {
                const hasSignificantPlay = clip.significantPlays.some((play) => play !== null);
                const hasLongGain = clip.gainYard >= 10;
                return hasSignificantPlay || hasLongGain;
            });
            highlightClips.forEach((clip) => {
                highlights.push({
                    gameKey: game.gameKey,
                    date: game.date,
                    homeTeam: game.homeTeam,
                    awayTeam: game.awayTeam,
                    location: game.location,
                    clip: clip,
                });
            });
        }
        return highlights;
    }
    async getPlayerHighlights(playerId, teamName) {
        const playerNumber = this.extractPlayerNumberFromId(playerId);
        const games = await this.gameClipsModel
            .find({
            $or: [{ homeTeam: teamName }, { awayTeam: teamName }],
        })
            .exec();
        const highlights = [];
        for (const game of games) {
            const isHomeTeam = game.homeTeam === teamName;
            const isAwayTeam = game.awayTeam === teamName;
            console.log(`경기 ${game.gameKey}: ${teamName}는 ${isHomeTeam ? '홈팀' : '어웨이팀'}`);
            const playerClips = game.Clips.filter((clip) => {
                const participatesInClip = clip.car?.num === playerNumber ||
                    clip.car2?.num === playerNumber ||
                    clip.tkl?.num === playerNumber ||
                    clip.tkl2?.num === playerNumber;
                if (!participatesInClip)
                    return false;
                const isOffensivePlay = (clip.offensiveTeam === 'Home' && isHomeTeam) ||
                    (clip.offensiveTeam === 'Away' && isAwayTeam);
                if (isOffensivePlay &&
                    (clip.car?.num === playerNumber || clip.car2?.num === playerNumber)) {
                    console.log(`✅ ${playerNumber}번 공격 플레이 매칭 (${clip.offensiveTeam})`);
                    return true;
                }
                const isDefensivePlay = (clip.offensiveTeam === 'Home' && isAwayTeam) ||
                    (clip.offensiveTeam === 'Away' && isHomeTeam);
                if (isDefensivePlay &&
                    (clip.tkl?.num === playerNumber || clip.tkl2?.num === playerNumber)) {
                    console.log(`✅ ${playerNumber}번 수비 플레이 매칭 (상대: ${clip.offensiveTeam})`);
                    return true;
                }
                console.log(`❌ ${playerNumber}번 플레이 제외: ${clip.offensiveTeam} 공격, 우리팀 ${isHomeTeam ? 'Home' : 'Away'}`);
                return false;
            });
            playerClips.forEach((clip) => {
                highlights.push({
                    gameKey: game.gameKey,
                    date: game.date,
                    homeTeam: game.homeTeam,
                    awayTeam: game.awayTeam,
                    location: game.location,
                    clip: clip,
                });
            });
        }
        return highlights;
    }
    extractPlayerNumberFromId(playerId) {
        const parts = playerId.split('_');
        const lastPart = parts[parts.length - 1];
        const playerNumber = parseInt(lastPart, 10);
        console.log(`playerId "${playerId}"에서 선수 번호 ${playerNumber} 추출`);
        return playerNumber;
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(game_info_schema_1.GameInfo.name)),
    __param(1, (0, mongoose_1.InjectModel)(game_clips_schema_1.GameClips.name)),
    __param(2, (0, mongoose_1.InjectModel)(team_game_stats_schema_1.TeamGameStats.name)),
    __param(3, (0, mongoose_1.InjectModel)(team_total_stats_schema_1.TeamTotalStats.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], GameService);
//# sourceMappingURL=game.service.js.map