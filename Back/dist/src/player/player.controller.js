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
exports.PlayerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const player_service_1 = require("./player.service");
const player_dto_1 = require("../common/dto/player.dto");
const new_clip_dto_1 = require("../common/dto/new-clip.dto");
const game_data_dto_1 = require("../common/dto/game-data.dto");
const stats_management_service_1 = require("../common/services/stats-management.service");
const team_stats_analyzer_service_1 = require("../team/team-stats-analyzer.service");
const game_service_1 = require("../game/game.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const user_decorator_1 = require("../common/decorators/user.decorator");
let PlayerController = class PlayerController {
    playerService;
    statsManagementService;
    teamStatsService;
    gameService;
    constructor(playerService, statsManagementService, teamStatsService, gameService) {
        this.playerService = playerService;
        this.statsManagementService = statsManagementService;
        this.teamStatsService = teamStatsService;
        this.gameService = gameService;
    }
    async resetAllPlayers() {
        console.log('🔄 모든 선수 데이터 및 게임 데이터 초기화 요청');
        try {
            const playerResult = await this.playerService.resetAllPlayerData();
            const allGames = await this.gameService.findAllGames();
            let totalGamesDeleted = 0;
            for (const game of allGames) {
                try {
                    await this.gameService.deleteGameInfo(game.gameKey);
                    totalGamesDeleted++;
                }
                catch (error) {
                    console.error(`❌ 게임 ${game.gameKey} 삭제 실패:`, error);
                }
            }
            console.log(`✅ 총 ${totalGamesDeleted}개의 게임 데이터가 삭제되었습니다.`);
            return {
                success: true,
                message: `${playerResult.deletedCount}명의 선수 데이터와 ${totalGamesDeleted}개의 게임 데이터가 삭제되었습니다.`,
                deletedCount: {
                    players: playerResult.deletedCount,
                    games: totalGamesDeleted
                },
            };
        }
        catch (error) {
            console.error('❌ 데이터 초기화 실패:', error);
            return {
                success: false,
                message: '데이터 초기화에 실패했습니다.',
                error: error.message,
            };
        }
    }
    async createPlayer(createPlayerDto, user) {
        const teamId = '507f1f77bcf86cd799439011';
        return this.playerService.createPlayer(createPlayerDto, teamId);
    }
    async getPlayerByCode(playerId) {
        return this.playerService.getPlayerByCode(playerId);
    }
    async getPlayersByPosition(position, league) {
        return this.playerService.getPlayersByPosition(position, league);
    }
    async getAllPlayersRanking(league, sortBy) {
        return this.playerService.getAllPlayersRanking(league, sortBy);
    }
    async updatePlayerStats(playerId, updateStatsDto) {
        return this.playerService.updatePlayerStats(playerId, updateStatsDto);
    }
    async getPlayersByTeam(teamId) {
        return this.playerService.getPlayersByTeam(teamId);
    }
    async createSamplePlayer() {
        const samplePlayer = {
            playerId: 'QB001',
            name: 'Ken Lee',
            jerseyNumber: 10,
            position: 'QB',
            league: '1부',
            season: '2024',
            stats: {
                passingYards: 200,
                passingTouchdowns: 5,
                completionPercentage: 60,
                passerRating: 85.5,
                gamesPlayed: 8,
                totalYards: 200,
                totalTouchdowns: 5,
            },
        };
        const teamId = '507f1f77bcf86cd799439011';
        return this.playerService.createPlayer(samplePlayer, teamId);
    }
    async updatePlayerStatsFromNewClips(jerseyNumber, analyzeNewClipsDto) {
        const jerseyNum = parseInt(jerseyNumber);
        const result = await this.playerService.updatePlayerStatsFromNewClips(jerseyNum, analyzeNewClipsDto.clips);
        try {
            if (analyzeNewClipsDto.clips && analyzeNewClipsDto.clips.length > 0) {
                const gameKey = analyzeNewClipsDto.clips[0]?.clipKey || 'unknown';
                let season = '2024';
                if (gameKey && gameKey.length >= 8) {
                    const extractedYear = gameKey.substring(4, 8);
                    if (/^\d{4}$/.test(extractedYear)) {
                        season = extractedYear;
                    }
                }
                const homeTeam = analyzeNewClipsDto.homeTeam;
                const awayTeam = analyzeNewClipsDto.awayTeam;
                console.log(`📊 팀 스탯 업데이트 - 홈팀: ${homeTeam}, 어웨이팀: ${awayTeam}`);
            }
        }
        catch (error) {
            console.log('팀 스탯 업데이트 중 오류 발생:', error);
        }
        return result;
    }
    async analyzeGameData(gameData) {
        console.log('게임 데이터 분석 시작:', gameData.gameKey);
        console.log('홈팀:', gameData.homeTeam, '어웨이팀:', gameData.awayTeam);
        console.log('클립 개수:', gameData.Clips?.length);
        const results = {
            gameKey: gameData.gameKey,
            homeTeam: gameData.homeTeam,
            awayTeam: gameData.awayTeam,
            clipsProcessed: gameData.Clips?.length || 0,
            playerStatsUpdated: 0,
            teamStatsUpdated: false,
            errors: [],
        };
        try {
            const clipResult = await this.playerService.analyzeGameData(gameData);
            console.log('🔍 ClipAnalyzer 결과:', {
                success: clipResult.success,
                qbCount: clipResult.qbCount,
                totalAnalyzed: clipResult.results?.length || 0
            });
            if (clipResult.success) {
                results.playerStatsUpdated = clipResult.results?.length || 0;
                results.teamStatsUpdated = true;
            }
            console.log('📊 팀 스탯 계산 및 저장 시작...');
            require('fs').appendFileSync('/tmp/team-stats-debug.log', `팀 스탯 분석 시작: gameKey=${gameData.gameKey}\n`);
            const teamStatsResult = await this.teamStatsService.analyzeTeamStats(gameData);
            require('fs').appendFileSync('/tmp/team-stats-debug.log', `팀 스탯 분석 결과: ${JSON.stringify(teamStatsResult)}\n`);
            await this.teamStatsService.saveTeamStats(gameData.gameKey, teamStatsResult, gameData);
            console.log('✅ 팀 스탯 업데이트 완료');
            console.log('💾💾💾 경기 정보 저장 시작... 💾💾💾');
            try {
                await this.gameService.createGameInfo(gameData);
                console.log('✅✅✅ 경기 정보 저장 완료 ✅✅✅');
            }
            catch (gameInfoError) {
                console.error('❌❌❌ 경기 정보 저장 실패:', gameInfoError.message);
                results.errors.push(`GameInfo 생성: ${gameInfoError.message}`);
            }
            console.log('🎬🎬🎬 경기 클립 데이터 저장 시작... 🎬🎬🎬');
            try {
                await this.gameService.saveGameClips(gameData);
                console.log('✅✅✅ 경기 클립 데이터 저장 완료 ✅✅✅');
            }
            catch (gameClipsError) {
                console.error('❌❌❌ 경기 클립 데이터 저장 실패:', gameClipsError.message);
                results.errors.push(`GameClips 생성: ${gameClipsError.message}`);
            }
        }
        catch (error) {
            console.error('게임 데이터 분석 중 전체 오류:', error);
            require('fs').appendFileSync('/tmp/team-stats-debug.log', `오류 발생: ${error.message}\n`);
            results.errors.push(`전체 분석: ${error.message}`);
        }
        return {
            success: results.errors.length === 0,
            message: `게임 ${gameData.gameKey} 분석 완료`,
            data: results,
        };
    }
    async analyzeNewClipsOnly(jerseyNumber, analyzeNewClipsDto) {
        const jerseyNum = parseInt(jerseyNumber);
        return this.playerService.updatePlayerStatsFromNewClips(jerseyNum, analyzeNewClipsDto.clips);
    }
    async updateGameStats(gameData) {
        console.log('받은 데이터 구조:', JSON.stringify(gameData, null, 2));
        return this.playerService.analyzeGameData(gameData);
    }
    async getPlayerGameStats(jerseyNumber, season) {
        const jerseyNum = parseInt(jerseyNumber);
        return this.statsManagementService.getPlayerGameStats(jerseyNum, season);
    }
    async getPlayerSeasonStats(jerseyNumber, season) {
        const jerseyNum = parseInt(jerseyNumber);
        return this.statsManagementService.getPlayerSeasonStats(jerseyNum, season);
    }
    async getPlayerCareerStats(jerseyNumber) {
        const jerseyNum = parseInt(jerseyNumber);
        return this.statsManagementService.getPlayerCareerStats(jerseyNum);
    }
    async getSeasonRankings(season, league, position, sortBy) {
        return this.statsManagementService.getSeasonRankings(season, league, position, sortBy);
    }
    async getCareerRankings(position, sortBy) {
        return this.statsManagementService.getCareerRankings(position, sortBy);
    }
    async updateGameStatsBatch(batchData) {
        const gameDate = new Date(batchData.gameDate);
        return this.statsManagementService.updateMultiplePlayersGameStats(batchData.gameKey, gameDate, batchData.homeTeam, batchData.awayTeam, batchData.playersStats);
    }
    async resetAllPlayersStats() {
        return this.playerService.resetAllPlayersStats();
    }
    async resetProcessedGames() {
        return this.playerService.resetProcessedGames();
    }
    async resetTeamStats() {
        return this.resetTeamTotalStats();
    }
    async resetTeamTotalStats() {
        try {
            const result = await this.statsManagementService.resetTeamTotalStats();
            return {
                success: true,
                message: '팀 누적 스탯 초기화가 완료되었습니다',
                data: result,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                message: '팀 누적 스탯 초기화 중 오류가 발생했습니다',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async resetTeamGameStats() {
        try {
            const result = await this.statsManagementService.resetTeamGameStats();
            return {
                success: true,
                message: '팀 경기별 스탯이 삭제되었습니다',
                deletedCount: result.deletedCount,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            console.error('❌ 팀 경기별 스탯 삭제 실패:', error);
            return {
                success: false,
                message: '팀 경기별 스탯 삭제 중 오류가 발생했습니다',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async resetAllData() {
        try {
            console.log('🚨 모든 데이터 완전 삭제 시작...');
            const results = await Promise.all([
                this.playerService.resetAllPlayerData(),
                this.statsManagementService.resetPlayerStats(),
                this.statsManagementService.resetTeamTotalStats(),
                this.statsManagementService.resetTeamGameStats(),
                this.statsManagementService.resetGameInfos(),
                this.statsManagementService.resetGameClips(),
            ]);
            const deletedCounts = {
                players: results[0].deletedCount,
                playerStats: results[1],
                teamTotalStats: results[2].deletedCount,
                teamGameStats: results[3].deletedCount,
                gameInfos: results[4].deletedCount,
                gameClips: results[5].deletedCount,
            };
            console.log('🎉 모든 데이터 삭제 완료:', deletedCounts);
            return {
                success: true,
                message: '모든 데이터가 삭제되었습니다',
                deletedCounts,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            console.error('❌ 전체 데이터 삭제 실패:', error);
            return {
                success: false,
                message: '전체 데이터 삭제 중 오류가 발생했습니다',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getMyStats(user, queryPlayerId) {
        if (user.role === 'admin' && queryPlayerId) {
            console.log(`Admin이 ${queryPlayerId} 선수 스탯 조회`);
            const adminUser = { ...user, playerId: queryPlayerId };
            const stats = await this.playerService.getPlayerStats(adminUser);
            return {
                ...stats,
                accessLevel: 'admin',
                queriedPlayerId: queryPlayerId,
            };
        }
        return await this.playerService.getPlayerStats(user);
    }
};
exports.PlayerController = PlayerController;
__decorate([
    (0, common_1.Post)('reset-all'),
    (0, swagger_1.ApiOperation)({ summary: '모든 선수 데이터 및 게임 데이터 초기화' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '선수 데이터와 게임 데이터 초기화 성공' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "resetAllPlayers", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '선수 생성' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '선수 생성 성공' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [player_dto_1.CreatePlayerDto, Object]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "createPlayer", null);
__decorate([
    (0, common_1.Get)('code/:playerId'),
    (0, swagger_1.ApiOperation)({ summary: 'PlayerCode로 개별 선수 조회' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '선수 조회 성공',
        type: player_dto_1.PlayerResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '선수를 찾을 수 없음' }),
    __param(0, (0, common_1.Param)('playerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getPlayerByCode", null);
__decorate([
    (0, common_1.Get)('position/:position'),
    (0, swagger_1.ApiOperation)({ summary: '포지션별 선수 목록 조회' }),
    (0, swagger_1.ApiQuery)({ name: 'league', required: false, enum: ['1부', '2부'] }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '포지션별 선수 목록 조회 성공',
        type: player_dto_1.PlayersListResponseDto,
    }),
    __param(0, (0, common_1.Param)('position')),
    __param(1, (0, common_1.Query)('league')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getPlayersByPosition", null);
__decorate([
    (0, common_1.Get)('rankings'),
    (0, swagger_1.ApiOperation)({ summary: '전체 선수 스탯 랭킹 조회' }),
    (0, swagger_1.ApiQuery)({ name: 'league', required: false, enum: ['1부', '2부'] }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, example: 'passingYards' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '선수 랭킹 조회 성공' }),
    __param(0, (0, common_1.Query)('league')),
    __param(1, (0, common_1.Query)('sortBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getAllPlayersRanking", null);
__decorate([
    (0, common_1.Put)(':playerId/stats'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '선수 스탯 업데이트' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '스탯 업데이트 성공' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '선수를 찾을 수 없음' }),
    __param(0, (0, common_1.Param)('playerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, player_dto_1.UpdatePlayerStatsDto]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "updatePlayerStats", null);
__decorate([
    (0, common_1.Get)('team/:teamId'),
    (0, swagger_1.ApiOperation)({ summary: '팀별 선수 목록 조회' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '팀 선수 목록 조회 성공' }),
    __param(0, (0, common_1.Param)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getPlayersByTeam", null);
__decorate([
    (0, common_1.Post)('sample'),
    (0, swagger_1.ApiOperation)({ summary: '샘플 선수 데이터 생성 (테스트용)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '샘플 데이터 생성 성공' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "createSamplePlayer", null);
__decorate([
    (0, common_1.Post)('jersey/:jerseyNumber/analyze-new-clips'),
    (0, swagger_1.ApiOperation)({
        summary: '새로운 형식의 클립 데이터 분석 및 스탯 업데이트',
        description: '새로운 car/tkl 형식의 클립 데이터를 받아서 선수 스탯을 자동으로 분석하고 업데이트합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '새 클립 스탯 분석 및 업데이트 성공',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '선수를 찾을 수 없음' }),
    __param(0, (0, common_1.Param)('jerseyNumber')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, new_clip_dto_1.AnalyzeNewClipsDto]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "updatePlayerStatsFromNewClips", null);
__decorate([
    (0, common_1.Post)('analyze-game-data'),
    (0, swagger_1.ApiOperation)({
        summary: '전체 게임 데이터 분석 및 팀/선수 스탯 업데이트',
        description: '게임의 전체 JSON 데이터를 받아서 홈팀/어웨이팀 정보를 자동으로 추출하고 모든 선수 및 팀 스탯을 업데이트합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '게임 데이터 분석 및 스탯 업데이트 성공',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '잘못된 게임 데이터 형식' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [game_data_dto_1.GameDataDto]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "analyzeGameData", null);
__decorate([
    (0, common_1.Post)('jersey/:jerseyNumber/analyze-new-clips-only'),
    (0, swagger_1.ApiOperation)({
        summary: '새로운 형식의 클립 데이터 분석만 (DB 업데이트 안함)',
        description: '새로운 car/tkl 형식의 클립 데이터를 분석하여 예상 스탯을 반환하지만 DB에는 저장하지 않습니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '새 클립 스탯 분석 성공' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '선수를 찾을 수 없음' }),
    __param(0, (0, common_1.Param)('jerseyNumber')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, new_clip_dto_1.AnalyzeNewClipsDto]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "analyzeNewClipsOnly", null);
__decorate([
    (0, common_1.Post)('update-game-stats'),
    (0, swagger_1.ApiOperation)({
        summary: '게임별 스탯 업데이트',
        description: '새로운 형식의 클립 데이터로 게임의 모든 선수 스탯을 업데이트합니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '게임 스탯 업데이트 성공' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "updateGameStats", null);
__decorate([
    (0, common_1.Get)('jersey/:jerseyNumber/game-stats'),
    (0, swagger_1.ApiOperation)({
        summary: '선수의 게임별 스탯 조회',
        description: '특정 선수의 모든 게임별 개별 스탯을 조회합니다.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'season',
        required: false,
        description: '특정 시즌 필터링',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '게임별 스탯 조회 성공' }),
    __param(0, (0, common_1.Param)('jerseyNumber')),
    __param(1, (0, common_1.Query)('season')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getPlayerGameStats", null);
__decorate([
    (0, common_1.Get)('jersey/:jerseyNumber/season-stats'),
    (0, swagger_1.ApiOperation)({
        summary: '선수의 시즌별 스탯 조회',
        description: '특정 선수의 시즌별 누적 스탯을 조회합니다.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'season',
        required: false,
        description: '특정 시즌 필터링',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '시즌별 스탯 조회 성공' }),
    __param(0, (0, common_1.Param)('jerseyNumber')),
    __param(1, (0, common_1.Query)('season')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getPlayerSeasonStats", null);
__decorate([
    (0, common_1.Get)('jersey/:jerseyNumber/career-stats'),
    (0, swagger_1.ApiOperation)({
        summary: '선수의 커리어 스탯 조회',
        description: '특정 선수의 전체 커리어 누적 스탯을 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '커리어 스탯 조회 성공' }),
    __param(0, (0, common_1.Param)('jerseyNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getPlayerCareerStats", null);
__decorate([
    (0, common_1.Get)('season-rankings/:season/:league'),
    (0, swagger_1.ApiOperation)({
        summary: '시즌 리그별 랭킹 조회',
        description: '특정 시즌 및 리그에서의 선수 랭킹을 조회합니다.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'position', required: false, description: '포지션 필터링' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: '정렬 기준 스탯' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '시즌 랭킹 조회 성공' }),
    __param(0, (0, common_1.Param)('season')),
    __param(1, (0, common_1.Param)('league')),
    __param(2, (0, common_1.Query)('position')),
    __param(3, (0, common_1.Query)('sortBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getSeasonRankings", null);
__decorate([
    (0, common_1.Get)('career-rankings'),
    (0, swagger_1.ApiOperation)({
        summary: '커리어 랭킹 조회',
        description: '활성 선수들의 커리어 전체 랭킹을 조회합니다.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'position', required: false, description: '포지션 필터링' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: '정렬 기준 스탯' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '커리어 랭킹 조회 성공' }),
    __param(0, (0, common_1.Query)('position')),
    __param(1, (0, common_1.Query)('sortBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getCareerRankings", null);
__decorate([
    (0, common_1.Post)('game-stats-batch'),
    (0, swagger_1.ApiOperation)({
        summary: '게임 전체 선수 스탯 일괄 업데이트',
        description: '한 게임의 모든 참여 선수들의 스탯을 일괄 업데이트합니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '게임 스탯 일괄 업데이트 성공' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "updateGameStatsBatch", null);
__decorate([
    (0, common_1.Post)('reset-all-stats'),
    (0, swagger_1.ApiOperation)({
        summary: '모든 선수 스탯 초기화',
        description: '데이터베이스의 모든 선수 스탯을 초기화합니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '스탯 초기화 성공' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "resetAllPlayersStats", null);
__decorate([
    (0, common_1.Post)('reset-processed-games'),
    (0, swagger_1.ApiOperation)({
        summary: '처리된 게임 목록 초기화',
        description: 'JSON 중복 입력 방지를 위한 처리된 게임 목록을 초기화합니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '처리된 게임 목록 초기화 성공' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "resetProcessedGames", null);
__decorate([
    (0, common_1.Post)('reset-team-stats/all'),
    (0, swagger_1.ApiOperation)({
        summary: '🔄 모든 팀 누적 스탯 초기화',
        description: '시즌 관계없이 모든 팀의 누적 스탯을 초기화합니다. (개발/테스트용)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '팀 누적 스탯 초기화 성공' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "resetTeamStats", null);
__decorate([
    (0, common_1.Post)('reset-team-total-stats'),
    (0, swagger_1.ApiOperation)({
        summary: '🔄 팀 누적 스탯 초기화',
        description: '모든 팀의 누적 스탯을 초기화합니다. (개발/테스트용)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '팀 누적 스탯 초기화 성공' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "resetTeamTotalStats", null);
__decorate([
    (0, common_1.Post)('reset-team-game-stats'),
    (0, swagger_1.ApiOperation)({
        summary: '🗑️ 팀 경기별 스탯 전체 삭제',
        description: 'team_game_stats 컬렉션의 모든 데이터를 삭제합니다. (개발/테스트용)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '팀 경기별 스탯 삭제 성공',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "resetTeamGameStats", null);
__decorate([
    (0, common_1.Post)('reset-all-data'),
    (0, swagger_1.ApiOperation)({
        summary: '🚨 모든 데이터 완전 삭제',
        description: '선수, 게임정보, 클립, 팀통계 등 모든 데이터를 삭제합니다. (개발/테스트용 - 주의!)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '모든 데이터 삭제 성공',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "resetAllData", null);
__decorate([
    (0, common_1.Get)('my-stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: '🏈 내 선수 스탯 조회',
        description: `
    ## 🏈 선수 전용 API

    로그인한 선수의 개인 스탯을 조회합니다.
    
    ### 🎯 사용 목적
    - 마이페이지에서 개인 스탯 표시
    - 경기별/시즌별/통합 스탯 조회
    - 하이라이트 영상 연결을 위한 기본 정보

    ### 📋 반환 정보
    - 경기별 스탯 (최근 경기부터)
    - 시즌별 스탯
    - 통합 스탯 (커리어 전체)
    - 선수 기본 정보

    ### ⚠️ 주의사항
    - JWT 토큰 필요
    - playerId가 배정된 선수만 조회 가능
    - 관리자가 playerId를 배정해야 사용 가능
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 내 스탯 조회 성공',
        schema: {
            example: {
                success: true,
                message: '2024_HY_7 선수의 스탯을 조회했습니다.',
                data: {
                    playerInfo: {
                        playerId: '2024_HY_7',
                        username: 'kim_chulsu',
                        teamName: '한양대 라이온스',
                        position: 'QB',
                    },
                    gameStats: [
                        {
                            gameKey: 'HYKU241115',
                            date: '2024-11-15',
                            opponent: '고려대 타이거스',
                            stats: { passingYards: 245, passingTouchdowns: 2 },
                        },
                    ],
                    seasonStats: {
                        '2024': {
                            gamesPlayed: 8,
                            stats: { passingYards: 1856, passingTouchdowns: 12 },
                        },
                    },
                    totalStats: {
                        totalGamesPlayed: 8,
                        stats: { passingYards: 1856, passingTouchdowns: 12 },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: '❌ 인증 실패',
        schema: {
            example: {
                success: false,
                message: '로그인이 필요합니다.',
                code: 'UNAUTHORIZED',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: '❌ PlayerId 미배정',
        schema: {
            example: {
                success: false,
                message: 'playerId가 배정되지 않았습니다. 관리자에게 문의하세요.',
                code: 'PLAYER_ID_NOT_ASSIGNED',
            },
        },
    }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Query)('playerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getMyStats", null);
exports.PlayerController = PlayerController = __decorate([
    (0, swagger_1.ApiTags)('Player'),
    (0, common_1.Controller)('player'),
    __metadata("design:paramtypes", [player_service_1.PlayerService,
        stats_management_service_1.StatsManagementService,
        team_stats_analyzer_service_1.TeamStatsAnalyzerService,
        game_service_1.GameService])
], PlayerController);
//# sourceMappingURL=player.controller.js.map