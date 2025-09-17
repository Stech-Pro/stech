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
exports.TeamController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const team_service_1 = require("./team.service");
const team_stats_analyzer_service_1 = require("./team-stats-analyzer.service");
const game_service_1 = require("../game/game.service");
const s3_service_1 = require("../common/services/s3.service");
const team_dto_1 = require("../common/dto/team.dto");
const team_stats_dto_1 = require("./dto/team-stats.dto");
const game_analysis_dto_1 = require("./dto/game-analysis.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const user_decorator_1 = require("../common/decorators/user.decorator");
let TeamController = class TeamController {
    teamService;
    teamStatsService;
    gameService;
    s3Service;
    constructor(teamService, teamStatsService, gameService, s3Service) {
        this.teamService = teamService;
        this.teamStatsService = teamStatsService;
        this.gameService = gameService;
        this.s3Service = s3Service;
    }
    async createTeam(createTeamDto, user) {
        return this.teamService.createTeam(createTeamDto, user._id);
    }
    async getMyTeams(user) {
        return this.teamService.getMyTeams(user._id);
    }
    async getAllTeamTotalStats(user = null, league) {
        try {
            const role = user?.role || 'guest';
            if (role === 'admin') {
                const teamStats = await this.teamStatsService.getAllTeamTotalStats(league);
                if (!teamStats || teamStats.length === 0) {
                    return {
                        success: false,
                        message: league
                            ? `${league} 팀 누적 스탯을 찾을 수 없습니다`
                            : '팀 누적 스탯을 찾을 수 없습니다',
                        data: [],
                        timestamp: new Date().toISOString(),
                    };
                }
                return {
                    success: true,
                    message: league
                        ? `${league} 팀 누적 스탯 조회가 완료되었습니다 (Admin)`
                        : '모든 팀 누적 스탯 조회가 완료되었습니다 (Admin)',
                    data: teamStats,
                    accessLevel: 'admin',
                    league: league || 'all',
                    timestamp: new Date().toISOString(),
                };
            }
            else {
                const teamStats = await this.teamStatsService.getAllTeamTotalStats(league);
                return {
                    success: true,
                    message: league
                        ? `${league} 팀 누적 스탯 조회가 완료되었습니다`
                        : '팀 누적 스탯 조회가 완료되었습니다',
                    data: teamStats,
                    accessLevel: 'public',
                    league: league || 'all',
                    timestamp: new Date().toISOString(),
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: '팀 누적 스탯 조회 중 오류가 발생했습니다',
                data: [],
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getTeam(teamId) {
        return this.teamService.getTeam(teamId);
    }
    async updateTeam(teamId, updateTeamDto, user) {
        return this.teamService.updateTeam(teamId, updateTeamDto, user._id);
    }
    async deleteTeam(teamId, user) {
        return this.teamService.deleteTeam(teamId, user._id);
    }
    async analyzeGame(body) {
        try {
            console.log('받은 요청 body:', body);
            if (!body || !body.gameKey) {
                return {
                    success: false,
                    message: 'gameKey가 필요합니다',
                    timestamp: new Date().toISOString(),
                };
            }
            const allGames = await this.gameService.findAllGames();
            console.log('저장된 모든 gameKey들:', allGames.map((game) => game.gameKey));
            const clips = await this.gameService.getGameClipsByKey(body.gameKey);
            console.log('조회된 gameData:', clips ? '있음' : '없음');
            if (!clips) {
                return {
                    success: false,
                    message: `${body.gameKey}에 해당하는 경기 데이터를 찾을 수 없습니다. 저장된 gameKey들: ${allGames.map((g) => g.gameKey).join(', ')}`,
                    timestamp: new Date().toISOString(),
                };
            }
            console.log(`🎬 ${body.gameKey}의 ${clips.Clips.length}개 클립에 대한 비디오 URL 생성 시작`);
            const videoUrls = await this.s3Service.generateClipUrls(body.gameKey, clips.Clips.length);
            const clipsWithUrls = clips.Clips.map((clip, index) => ({
                ...clip,
                clipUrl: videoUrls[index] || null,
            }));
            const gameData = {
                ...clips.toObject(),
                Clips: clipsWithUrls,
            };
            console.log(`✅ ${body.gameKey} 클립 URL 매핑 완료: ${videoUrls.length}/${clips.Clips.length}`);
            const result = await this.teamStatsService.analyzeGameForDisplay(gameData);
            return {
                success: true,
                message: '경기 분석이 완료되었습니다',
                ...result,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                message: '경기 분석 중 오류가 발생했습니다',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getTeamStatsByGame(gameKey) {
        try {
            const teamStatsResult = await this.teamStatsService.getTeamStatsByGame(gameKey);
            if (!teamStatsResult) {
                return {
                    success: false,
                    message: '해당 게임의 팀 스탯을 찾을 수 없습니다',
                    code: 'TEAM_STATS_NOT_FOUND',
                };
            }
            return {
                success: true,
                message: '팀 스탯 조회가 완료되었습니다',
                data: teamStatsResult,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                message: '팀 스탯 조회 중 오류가 발생했습니다',
                code: 'TEAM_STATS_ERROR',
            };
        }
    }
};
exports.TeamController = TeamController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '팀 생성' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '팀 생성 성공' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [team_dto_1.CreateTeamDto, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "createTeam", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '내 팀 목록 조회' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '내 팀 목록 조회 성공' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '인증 필요' }),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getMyTeams", null);
__decorate([
    (0, common_1.Get)('total-stats'),
    (0, swagger_1.ApiOperation)({
        summary: '🏆 팀 누적 스탯 순위 조회',
        description: '모든 팀의 누적 스탯을 totalYards 기준으로 정렬하여 조회합니다. league 파라미터로 1부/2부 필터링 가능합니다.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'league',
        required: false,
        description: '리그 구분 (1부 또는 2부)',
        enum: ['1부', '2부'],
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 팀 누적 스탯 조회 성공',
    }),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Query)('league')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getAllTeamTotalStats", null);
__decorate([
    (0, common_1.Get)(':teamId'),
    (0, swagger_1.ApiOperation)({ summary: '팀 조회' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '팀 조회 성공' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '팀을 찾을 수 없음' }),
    __param(0, (0, common_1.Param)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getTeam", null);
__decorate([
    (0, common_1.Put)(':teamId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '팀 정보 수정' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '팀 정보 수정 성공' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '권한 없음' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '팀을 찾을 수 없음' }),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, team_dto_1.UpdateTeamDto, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "updateTeam", null);
__decorate([
    (0, common_1.Delete)(':teamId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '팀 삭제' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '팀 삭제 성공' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '권한 없음' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '팀을 찾을 수 없음' }),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "deleteTeam", null);
__decorate([
    (0, common_1.Post)('analyze-game-playcall'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🎯 경기 플레이콜 및 주요 스탯 분석 API',
        description: `
    ## 📊 경기 플레이콜 분석 API
    
    gameKey로 저장된 경기의 플레이콜 비율과 주요 스탯을 분석합니다.
    
    ### 📈 반환 데이터
    - **플레이콜 비율**: 홈/어웨이팀별 런/패스 비율
    - **총 야드**: 패싱+러싱 야드 합계
    - **패싱 야드**: 완성된 패스 야드
    - **러싱 야드**: 러싱 야드
    - **3rd down 성공률**: 3다운에서 1st down 획득 비율
    - **턴오버**: 인터셉트 + 펌블 로스트
    - **페널티 야드**: 총 페널티 야드
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 경기 분석 성공',
        type: game_analysis_dto_1.GameAnalysisResponseDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [game_analysis_dto_1.GameAnalysisRequestDto]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "analyzeGame", null);
__decorate([
    (0, common_1.Get)('stats/:gameKey'),
    (0, swagger_1.ApiOperation)({
        summary: '🏈 게임별 팀 스탯 조회',
        description: `
    ## 📊 팀 스탯 조회 API
    
    특정 게임의 홈팀/어웨이팀 스탯을 조회합니다.
    
    ### 📈 포함된 스탯
    - **총 야드**: 패싱+러싱+리턴야드 합계
    - **패싱 야드**: 완성된 패스 야드 총합
    - **러싱 야드**: 러싱 야드 (sack 야드 차감)
    - **리턴 야드들**: 인터셉트/펀트/킥오프 리턴 야드
    - **턴오버**: 펌블(디펜스 리커버리) + 인터셉트 + 기타 턴오버
    - **페널티 야드**: 총 페널티 야드 (추후 구현)
    
    ### 🎯 사용 예시
    - 게임키: "DGKM240908"
    - 응답: 홈팀/어웨이팀 각각의 상세 스탯
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 팀 스탯 조회 성공',
        type: team_stats_dto_1.TeamStatsSuccessDto,
        schema: {
            example: {
                success: true,
                message: '팀 스탯 조회가 완료되었습니다',
                data: {
                    homeTeamStats: {
                        teamName: 'DGTuskers',
                        totalYards: 425,
                        passingYards: 280,
                        rushingYards: 145,
                        interceptionReturnYards: 0,
                        puntReturnYards: 25,
                        kickoffReturnYards: 35,
                        turnovers: 2,
                        penaltyYards: 45,
                        sackYards: 15,
                    },
                    awayTeamStats: {
                        teamName: 'KMRazorbacks',
                        totalYards: 380,
                        passingYards: 220,
                        rushingYards: 160,
                        interceptionReturnYards: 35,
                        puntReturnYards: 15,
                        kickoffReturnYards: 25,
                        turnovers: 1,
                        penaltyYards: 30,
                        sackYards: 8,
                    },
                },
                timestamp: '2024-12-26T10:30:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '❌ 팀 스탯을 찾을 수 없음',
        type: team_stats_dto_1.TeamStatsErrorDto,
        schema: {
            example: {
                success: false,
                message: '해당 게임의 팀 스탯을 찾을 수 없습니다',
                code: 'TEAM_STATS_NOT_FOUND',
            },
        },
    }),
    __param(0, (0, common_1.Param)('gameKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getTeamStatsByGame", null);
exports.TeamController = TeamController = __decorate([
    (0, swagger_1.ApiTags)('Team'),
    (0, common_1.Controller)('team'),
    __metadata("design:paramtypes", [team_service_1.TeamService,
        team_stats_analyzer_service_1.TeamStatsAnalyzerService,
        game_service_1.GameService,
        s3_service_1.S3Service])
], TeamController);
//# sourceMappingURL=team.controller.js.map