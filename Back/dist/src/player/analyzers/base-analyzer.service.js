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
exports.BaseAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const player_schema_1 = require("../../schemas/player.schema");
let BaseAnalyzerService = class BaseAnalyzerService {
    playerModel;
    playerService;
    constructor(playerModel, playerService) {
        this.playerModel = playerModel;
        this.playerService = playerService;
    }
    processSignificantPlays(clip, stats, playType) {
        if (!clip.significantPlays || !Array.isArray(clip.significantPlays))
            return;
        for (const play of clip.significantPlays) {
            if (!play)
                continue;
            switch (play) {
                case 'TOUCHDOWN':
                    this.processTouchdown(stats, playType);
                    break;
                case 'INTERCEPT':
                case 'INTERCEPTION':
                    this.processInterception(stats, playType);
                    break;
                case 'FUMBLE':
                    this.processFumble(stats, playType);
                    break;
                case 'SACK':
                    this.processSack(stats);
                    break;
            }
        }
    }
    processTouchdown(stats, playType) {
    }
    processInterception(stats, playType) {
        if (stats.passingInterceptions !== undefined) {
            stats.passingInterceptions++;
        }
    }
    processFumble(stats, playType) {
        if (stats.fumbles !== undefined) {
            stats.fumbles++;
        }
    }
    processSack(stats) {
        if (stats.sacks !== undefined) {
            stats.sacks++;
        }
    }
    async savePlayerStats(jerseyNumber, teamName, position, stats, gameData) {
        try {
            const playerId = `${teamName}_${jerseyNumber}`;
            const gameKey = gameData?.gameKey;
            console.log(`💾 선수 저장/업데이트 시도: playerId = ${playerId}, position = ${position}, gameKey = ${gameKey}`);
            const existingPlayer = await this.playerModel.findOne({
                teamName,
                jerseyNumber,
            });
            if (existingPlayer) {
                console.log(`🔄 기존 선수 발견: ${existingPlayer.name}`);
                if (!existingPlayer.positions.includes(position)) {
                    existingPlayer.positions.push(position);
                    console.log(`📍 새 포지션 추가: ${position} -> 총 포지션: ${existingPlayer.positions.join(', ')}`);
                }
                if (!existingPlayer.stats.gameStats) {
                    existingPlayer.stats.gameStats = {};
                }
                if (gameKey) {
                    if (!existingPlayer.stats.gameStats[gameKey]) {
                        existingPlayer.stats.gameStats[gameKey] = {};
                    }
                    existingPlayer.stats.gameStats[gameKey][position] = { ...stats };
                    console.log(`🔄 ${gameKey} 게임의 ${position} 스탯 덮어쓰기 완료`);
                    this.recalculateTotalStats(existingPlayer, position);
                }
                else {
                    if (!existingPlayer.stats[position]) {
                        existingPlayer.stats[position] = {};
                    }
                    const positionStats = existingPlayer.stats[position] || {};
                    for (const [key, value] of Object.entries(stats)) {
                        if (typeof value === 'number') {
                            positionStats[key] = (positionStats[key] || 0) + value;
                        }
                        else {
                            positionStats[key] = value;
                        }
                    }
                    existingPlayer.stats[position] = positionStats;
                    existingPlayer.stats.totalGamesPlayed =
                        (existingPlayer.stats.totalGamesPlayed || 0) +
                            (stats.gamesPlayed || 0);
                }
                await existingPlayer.save();
                console.log(`✅ ${position} 선수 스탯 업데이트 성공`);
                if (gameData && this.playerService) {
                    try {
                        const playerClips = [];
                        await this.playerService.savePlayerStatsWithNewStructure(existingPlayer, stats, gameData, playerClips);
                        console.log(`✅ ${position} 기존선수 4개 컬렉션 저장 완료: ${playerId}`);
                    }
                    catch (error) {
                        console.error(`❌ ${position} 기존선수 4개 컬렉션 저장 실패:`, error.message);
                    }
                }
                return {
                    success: true,
                    message: `${jerseyNumber}번 (${teamName}) ${position} 포지션 스탯 업데이트 완료`,
                    player: existingPlayer.name,
                };
            }
            else {
                console.log(`🆕 새 선수 생성: ${playerId}`);
                console.log(`📊 저장할 스탯:`, stats);
                const initialStats = {
                    totalGamesPlayed: stats.gamesPlayed || 0,
                };
                if (gameKey) {
                    initialStats.gameStats = {
                        [gameKey]: {
                            [position]: { ...stats },
                        },
                    };
                    initialStats[position] = { ...stats };
                }
                else {
                    initialStats[position] = { ...stats };
                }
                const newPlayer = new this.playerModel({
                    name: `${jerseyNumber}번`,
                    playerId,
                    positions: [position],
                    primaryPosition: position,
                    teamName,
                    jerseyNumber,
                    league: '1부',
                    season: '2024',
                    stats: initialStats,
                });
                await newPlayer.save();
                console.log(`✅ ${position} 선수 저장 성공: ${playerId}`);
                if (gameData && this.playerService) {
                    try {
                        const playerClips = [];
                        await this.playerService.savePlayerStatsWithNewStructure(newPlayer, stats, gameData, playerClips);
                        console.log(`✅ ${position} 신규선수 4개 컬렉션 저장 완료: ${playerId}`);
                    }
                    catch (error) {
                        console.error(`❌ ${position} 신규선수 4개 컬렉션 저장 실패:`, error.message);
                    }
                }
                return {
                    success: true,
                    message: `${jerseyNumber}번 (${teamName}) 신규 선수 생성 및 ${position} 스탯 저장 완료`,
                    player: newPlayer.name,
                };
            }
        }
        catch (error) {
            console.error(`${position} 스탯 저장 실패:`, error);
            return {
                success: false,
                message: `${position} ${jerseyNumber}번 스탯 저장 실패: ${error.message}`,
            };
        }
    }
    recalculateTotalStats(player, position) {
        if (!player.stats.gameStats)
            return;
        const totalStats = {};
        let totalGames = 0;
        for (const [gameKey, gameStats] of Object.entries(player.stats.gameStats)) {
            const positionStats = gameStats[position];
            if (positionStats) {
                totalGames++;
                for (const [key, value] of Object.entries(positionStats)) {
                    if (typeof value === 'number') {
                        totalStats[key] = (totalStats[key] || 0) + value;
                    }
                    else {
                        totalStats[key] = value;
                    }
                }
            }
        }
        player.stats[position] = totalStats;
        player.stats.totalGamesPlayed = totalGames;
        console.log(`🔄 ${position} 전체 스탯 재계산 완료: ${totalGames}게임`);
    }
};
exports.BaseAnalyzerService = BaseAnalyzerService;
exports.BaseAnalyzerService = BaseAnalyzerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(player_schema_1.Player.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => require('../player.service').PlayerService))),
    __metadata("design:paramtypes", [mongoose_2.Model, Function])
], BaseAnalyzerService);
//# sourceMappingURL=base-analyzer.service.js.map