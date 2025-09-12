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
exports.StatsManagementService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const player_game_stats_schema_1 = require("../../schemas/player-game-stats.schema");
const player_season_stats_schema_1 = require("../../schemas/player-season-stats.schema");
const player_total_stats_schema_1 = require("../../schemas/player-total-stats.schema");
const player_schema_1 = require("../../schemas/player.schema");
const team_total_stats_schema_1 = require("../../schemas/team-total-stats.schema");
const team_game_stats_schema_1 = require("../../schemas/team-game-stats.schema");
const game_info_schema_1 = require("../../schemas/game-info.schema");
const game_clips_schema_1 = require("../../schemas/game-clips.schema");
let StatsManagementService = class StatsManagementService {
    playerGameStatsModel;
    playerSeasonStatsModel;
    playerTotalStatsModel;
    playerModel;
    teamTotalStatsModel;
    teamGameStatsModel;
    gameInfoModel;
    gameClipsModel;
    constructor(playerGameStatsModel, playerSeasonStatsModel, playerTotalStatsModel, playerModel, teamTotalStatsModel, teamGameStatsModel, gameInfoModel, gameClipsModel) {
        this.playerGameStatsModel = playerGameStatsModel;
        this.playerSeasonStatsModel = playerSeasonStatsModel;
        this.playerTotalStatsModel = playerTotalStatsModel;
        this.playerModel = playerModel;
        this.teamTotalStatsModel = teamTotalStatsModel;
        this.teamGameStatsModel = teamGameStatsModel;
        this.gameInfoModel = gameInfoModel;
        this.gameClipsModel = gameClipsModel;
    }
    async updateGameStats(playerNumber, gameKey, gameDate, homeTeam, awayTeam, analyzedStats) {
        const player = await this.playerModel.findOne({
            jerseyNumber: playerNumber,
        });
        if (!player) {
            throw new Error(`등번호 ${playerNumber}번 선수를 찾을 수 없습니다.`);
        }
        const gameStats = await this.playerGameStatsModel.findOneAndUpdate({
            playerId: player._id,
            gameKey: gameKey,
        }, {
            $set: {
                playerNumber: playerNumber,
                gameDate: gameDate,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                position: player.primaryPosition || player.positions?.[0] || 'Unknown',
                gamesPlayed: 1,
                ...analyzedStats,
            },
        }, {
            upsert: true,
            new: true,
        });
        await this.updateSeasonStats(player._id, player.primaryPosition || player.positions?.[0] || 'Unknown', player.league, player.season, analyzedStats, gameKey);
        await this.updateCareerStats(player._id, player.primaryPosition || player.positions?.[0] || 'Unknown', player.season, analyzedStats);
        return gameStats;
    }
    async updateSeasonStats(playerId, position, league, season, newStats, gameKey) {
        const seasonStats = await this.playerSeasonStatsModel.findOne({
            playerId: playerId,
            season: season,
        });
        if (!seasonStats) {
            const newSeasonStats = new this.playerSeasonStatsModel({
                playerId: playerId,
                playerNumber: await this.getPlayerNumber(playerId),
                season: season,
                position: position,
                league: league,
                gamesPlayed: 1,
                gameKeys: [gameKey],
                ...newStats,
            });
            await newSeasonStats.save();
        }
        else {
            const updateData = {};
            if (!seasonStats.gameKeys.includes(gameKey)) {
                updateData.gameKeys = [...seasonStats.gameKeys, gameKey];
                updateData.gamesPlayed = seasonStats.gamesPlayed + 1;
            }
            this.accumulateStats(updateData, seasonStats, newStats);
            await this.playerSeasonStatsModel.findByIdAndUpdate(seasonStats._id, {
                $set: updateData,
            });
        }
    }
    async updateCareerStats(playerId, position, season, newStats) {
        const careerStats = await this.playerTotalStatsModel.findOne({
            playerId: playerId,
        });
        if (!careerStats) {
            const newCareerStats = new this.playerTotalStatsModel({
                playerId: playerId,
                playerNumber: await this.getPlayerNumber(playerId),
                position: position,
                seasonsPlayed: [season],
                totalGamesPlayed: 1,
                totalSeasons: 1,
                ...newStats,
            });
            await newCareerStats.save();
        }
        else {
            const updateData = {};
            if (!careerStats.seasonsPlayed.includes(season)) {
                updateData.seasonsPlayed = [...careerStats.seasonsPlayed, season];
                updateData.totalSeasons = careerStats.totalSeasons + 1;
            }
            updateData.totalGamesPlayed = careerStats.totalGamesPlayed + 1;
            this.accumulateStats(updateData, careerStats, newStats);
            this.updateCareerRecords(updateData, careerStats, newStats, season);
            await this.playerTotalStatsModel.findByIdAndUpdate(careerStats._id, {
                $set: updateData,
            });
        }
    }
    accumulateStats(updateData, existingStats, newStats) {
        const accumulativeStats = [
            'passingYards',
            'passingTouchdowns',
            'passingInterceptions',
            'completions',
            'passingAttempts',
            'rushingYards',
            'rushingTouchdowns',
            'rushingAttempts',
            'rushingFirstDowns',
            'receivingYards',
            'receivingTouchdowns',
            'receptions',
            'receivingTargets',
            'receivingFirstDowns',
            'kickoffReturnYards',
            'kickoffReturns',
            'kickoffReturnTouchdowns',
            'puntReturnYards',
            'puntReturns',
            'puntReturnTouchdowns',
            'totalYards',
            'totalTouchdowns',
            'fieldGoalsMade',
            'fieldGoalAttempts',
            'extraPointsMade',
            'extraPointAttempts',
            'kickoffYards',
            'kickoffs',
            'kickoffTouchbacks',
            'inside20Kicks',
            'inside10Kicks',
            'fieldGoals0_29',
            'fieldGoals30_39',
            'fieldGoals40_49',
            'fieldGoals50Plus',
            'totalKickingPoints',
            'puntingYards',
            'punts',
            'puntsInside20',
            'puntTouchbacks',
            'blockedPunts',
            'pancakeBlocks',
            'penalties',
            'tackles',
            'assistedTackles',
            'totalTackles',
            'tacklesForLoss',
            'quarterbackSacks',
            'interceptions',
            'passesDefended',
            'forcedFumbles',
            'fumbleRecoveries',
            'defensiveTouchdowns',
            'sacks',
            'rushing20Plus',
            'fumbles',
            'redZoneAttempts',
            'redZoneCompletions',
            'thirdDownAttempts',
            'thirdDownCompletions',
            'rushes20Plus',
            'catches20Plus',
        ];
        accumulativeStats.forEach((stat) => {
            if (newStats[stat] !== undefined) {
                updateData[stat] = (existingStats[stat] || 0) + newStats[stat];
            }
        });
        if (updateData.passingAttempts > 0 &&
            updateData.completions !== undefined) {
            updateData.completionPercentage =
                Math.round((updateData.completions / updateData.passingAttempts) * 100 * 10) / 10;
        }
        if (updateData.rushingAttempts > 0 &&
            updateData.rushingYards !== undefined) {
            updateData.yardsPerCarry =
                Math.round((updateData.rushingYards / updateData.rushingAttempts) * 10) / 10;
        }
        if (updateData.receptions > 0 && updateData.receivingYards !== undefined) {
            updateData.yardsPerReception =
                Math.round((updateData.receivingYards / updateData.receptions) * 10) /
                    10;
        }
        if (updateData.fieldGoalAttempts > 0 &&
            updateData.fieldGoalsMade !== undefined) {
            updateData.fieldGoalPercentage =
                Math.round((updateData.fieldGoalsMade / updateData.fieldGoalAttempts) * 100 * 10) / 10;
        }
        if (updateData.extraPointAttempts > 0 &&
            updateData.extraPointsMade !== undefined) {
            updateData.extraPointPercentage =
                Math.round((updateData.extraPointsMade / updateData.extraPointAttempts) *
                    100 *
                    10) / 10;
        }
        if (updateData.punts > 0 && updateData.puntingYards !== undefined) {
            updateData.puntAverage =
                Math.round((updateData.puntingYards / updateData.punts) * 10) / 10;
        }
        const maxStats = [
            'longestPass',
            'longestRush',
            'longestReception',
            'longestFieldGoal',
            'longestPunt',
        ];
        maxStats.forEach((stat) => {
            if (newStats[stat] !== undefined) {
                updateData[stat] = Math.max(existingStats[stat] || 0, newStats[stat]);
            }
        });
    }
    updateCareerRecords(updateData, careerStats, newStats, season) {
        if (newStats.totalYards &&
            newStats.totalYards > (careerStats.bestSeasonYards || 0)) {
            updateData.bestSeasonYards = newStats.totalYards;
            updateData.bestSeasonYear = season;
        }
        if (newStats.totalTouchdowns &&
            newStats.totalTouchdowns > (careerStats.mostTouchdownsInSeason || 0)) {
            updateData.mostTouchdownsInSeason = newStats.totalTouchdowns;
        }
    }
    async getPlayerGameStats(playerNumber, season) {
        const player = await this.playerModel.findOne({
            jerseyNumber: playerNumber,
        });
        if (!player) {
            throw new Error(`등번호 ${playerNumber}번 선수를 찾을 수 없습니다.`);
        }
        const query = { playerId: player._id };
        if (season) {
            query.gameKey = { $regex: season };
        }
        return await this.playerGameStatsModel.find(query).sort({ gameDate: -1 });
    }
    async getPlayerSeasonStats(playerNumber, season) {
        const player = await this.playerModel.findOne({
            jerseyNumber: playerNumber,
        });
        if (!player) {
            throw new Error(`등번호 ${playerNumber}번 선수를 찾을 수 없습니다.`);
        }
        const query = { playerId: player._id };
        if (season) {
            query.season = season;
        }
        return await this.playerSeasonStatsModel.find(query).sort({ season: -1 });
    }
    async getPlayerCareerStats(playerNumber) {
        const player = await this.playerModel.findOne({
            jerseyNumber: playerNumber,
        });
        if (!player) {
            throw new Error(`등번호 ${playerNumber}번 선수를 찾을 수 없습니다.`);
        }
        return await this.playerTotalStatsModel.findOne({ playerId: player._id });
    }
    async getSeasonRankings(season, league, position, sortBy = 'totalYards') {
        const query = { season, league };
        if (position) {
            query.position = position;
        }
        const sort = {};
        sort[sortBy] = -1;
        return await this.playerSeasonStatsModel
            .find(query)
            .sort(sort)
            .limit(50)
            .populate('playerId', 'name jerseyNumber teamId');
    }
    async getCareerRankings(position, sortBy = 'totalYards') {
        const query = { isActive: true };
        if (position) {
            query.position = position;
        }
        const sort = {};
        sort[sortBy] = -1;
        return await this.playerTotalStatsModel
            .find(query)
            .sort(sort)
            .limit(50)
            .populate('playerId', 'name jerseyNumber teamId');
    }
    async getPlayerNumber(playerId) {
        const player = await this.playerModel.findById(playerId);
        return player ? player.jerseyNumber : 0;
    }
    async updateMultiplePlayersGameStats(gameKey, gameDate, homeTeam, awayTeam, playersStats) {
        const results = [];
        for (const playerStat of playersStats) {
            try {
                const result = await this.updateGameStats(playerStat.playerNumber, gameKey, gameDate, homeTeam, awayTeam, playerStat.analyzedStats);
                results.push({
                    success: true,
                    playerNumber: playerStat.playerNumber,
                    data: result,
                });
            }
            catch (error) {
                results.push({
                    success: false,
                    playerNumber: playerStat.playerNumber,
                    error: error.message,
                });
            }
        }
        return results;
    }
    async resetTeamTotalStats() {
        const result = await this.teamTotalStatsModel.deleteMany({});
        console.log(`🗑️ ${result.deletedCount}개 팀의 누적 스탯이 삭제되었습니다`);
        return { deletedCount: result.deletedCount };
    }
    async resetTeamGameStats() {
        const result = await this.teamGameStatsModel.deleteMany({});
        console.log(`🗑️ ${result.deletedCount}개 팀의 경기별 스탯이 삭제되었습니다`);
        return { deletedCount: result.deletedCount };
    }
    async resetGameInfos() {
        const result = await this.gameInfoModel.deleteMany({});
        console.log(`🗑️ ${result.deletedCount}개 게임 정보가 삭제되었습니다`);
        return { deletedCount: result.deletedCount };
    }
    async resetGameClips() {
        const result = await this.gameClipsModel.deleteMany({});
        console.log(`🗑️ ${result.deletedCount}개 게임 클립이 삭제되었습니다`);
        return { deletedCount: result.deletedCount };
    }
    async resetPlayerStats() {
        const gameStatsResult = await this.playerGameStatsModel.deleteMany({});
        const seasonStatsResult = await this.playerSeasonStatsModel.deleteMany({});
        const totalStatsResult = await this.playerTotalStatsModel.deleteMany({});
        console.log(`🗑️ 선수 스탯 삭제: Game(${gameStatsResult.deletedCount}), Season(${seasonStatsResult.deletedCount}), Total(${totalStatsResult.deletedCount})`);
        return {
            gameStats: gameStatsResult.deletedCount,
            seasonStats: seasonStatsResult.deletedCount,
            totalStats: totalStatsResult.deletedCount,
        };
    }
};
exports.StatsManagementService = StatsManagementService;
exports.StatsManagementService = StatsManagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(player_game_stats_schema_1.PlayerGameStats.name)),
    __param(1, (0, mongoose_1.InjectModel)(player_season_stats_schema_1.PlayerSeasonStats.name)),
    __param(2, (0, mongoose_1.InjectModel)(player_total_stats_schema_1.PlayerTotalStats.name)),
    __param(3, (0, mongoose_1.InjectModel)(player_schema_1.Player.name)),
    __param(4, (0, mongoose_1.InjectModel)(team_total_stats_schema_1.TeamTotalStats.name)),
    __param(5, (0, mongoose_1.InjectModel)(team_game_stats_schema_1.TeamGameStats.name)),
    __param(6, (0, mongoose_1.InjectModel)(game_info_schema_1.GameInfo.name)),
    __param(7, (0, mongoose_1.InjectModel)(game_clips_schema_1.GameClips.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], StatsManagementService);
//# sourceMappingURL=stats-management.service.js.map