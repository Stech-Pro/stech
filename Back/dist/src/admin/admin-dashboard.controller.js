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
exports.AdminDashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const admin_guard_1 = require("../common/guards/admin.guard");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../schemas/user.schema");
const player_game_stats_schema_1 = require("../schemas/player-game-stats.schema");
const player_season_stats_schema_1 = require("../schemas/player-season-stats.schema");
const game_info_schema_1 = require("../schemas/game-info.schema");
const game_service_1 = require("../game/game.service");
const player_service_1 = require("../player/player.service");
let AdminDashboardController = class AdminDashboardController {
    userModel;
    playerGameStatsModel;
    playerSeasonStatsModel;
    gameInfoModel;
    gameService;
    playerService;
    constructor(userModel, playerGameStatsModel, playerSeasonStatsModel, gameInfoModel, gameService, playerService) {
        this.userModel = userModel;
        this.playerGameStatsModel = playerGameStatsModel;
        this.playerSeasonStatsModel = playerSeasonStatsModel;
        this.gameInfoModel = gameInfoModel;
        this.gameService = gameService;
        this.playerService = playerService;
    }
    async getDashboard() {
        const totalUsers = await this.userModel.countDocuments();
        const usersByRole = await this.userModel.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                },
            },
        ]);
        const totalGames = await this.gameInfoModel.countDocuments();
        const allGames = await this.gameInfoModel.find();
        const teamStats = new Map();
        allGames.forEach((game) => {
            if (!teamStats.has(game.homeTeam)) {
                teamStats.set(game.homeTeam, {
                    teamName: game.homeTeam,
                    totalGames: 0,
                    wins: 0,
                    losses: 0,
                });
            }
            teamStats.get(game.homeTeam).totalGames++;
            if (!teamStats.has(game.awayTeam)) {
                teamStats.set(game.awayTeam, {
                    teamName: game.awayTeam,
                    totalGames: 0,
                    wins: 0,
                    losses: 0,
                });
            }
            teamStats.get(game.awayTeam).totalGames++;
        });
        const playersByTeam = await this.userModel.aggregate([
            { $match: { role: 'player', teamName: { $exists: true } } },
            {
                $group: {
                    _id: '$teamName',
                    playerCount: { $sum: 1 },
                },
            },
        ]);
        playersByTeam.forEach((item) => {
            if (teamStats.has(item._id)) {
                teamStats.get(item._id).totalPlayers = item.playerCount;
            }
        });
        const roleStats = {};
        usersByRole.forEach((item) => {
            roleStats[item._id || 'unknown'] = item.count;
        });
        return {
            success: true,
            message: 'Admin 대시보드 데이터 조회 성공',
            data: {
                systemOverview: {
                    totalUsers,
                    totalPlayers: roleStats.player || 0,
                    totalCoaches: roleStats.coach || 0,
                    totalAdmins: roleStats.admin || 0,
                    totalGames,
                    totalTeams: teamStats.size,
                },
                teamStatistics: Array.from(teamStats.values()),
                userStatistics: roleStats,
            },
            timestamp: new Date().toISOString(),
        };
    }
    async getAllUsers(role, team) {
        const filter = {};
        if (role)
            filter.role = role;
        if (team)
            filter.teamName = team;
        const users = await this.userModel.find(filter).select('-password');
        return {
            success: true,
            message: '모든 사용자 목록 조회 성공',
            data: users,
            totalCount: users.length,
            filters: { role, team },
        };
    }
    async getAllTeamsStats() {
        const games = await this.gameInfoModel.find();
        const teams = new Set();
        games.forEach((game) => {
            if (game.homeTeam)
                teams.add(game.homeTeam);
            if (game.awayTeam)
                teams.add(game.awayTeam);
        });
        const teamStatsArray = [];
        for (const teamName of teams) {
            const teamGames = await this.gameInfoModel.find({
                $or: [{ homeTeam: teamName }, { awayTeam: teamName }],
            });
            const teamPlayers = await this.userModel.find({
                teamName,
                role: 'player',
            });
            teamStatsArray.push({
                teamName,
                totalGames: teamGames.length,
                totalPlayers: teamPlayers.length,
                gameKeys: teamGames.map((g) => g.gameKey),
            });
        }
        return {
            success: true,
            message: '모든 팀 통계 조회 성공',
            data: teamStatsArray,
            totalTeams: teams.size,
        };
    }
    async getAllPlayersStats(team, position) {
        const filter = { role: 'player' };
        if (team)
            filter.teamName = team;
        const players = await this.userModel.find(filter);
        const playerStatsArray = [];
        for (const player of players) {
            if (!player.profile?.playerKey)
                continue;
            try {
                const seasonStats = await this.playerSeasonStatsModel.findOne({
                    playerId: player.profile?.playerKey,
                });
                const gameCount = await this.playerGameStatsModel.countDocuments({
                    playerId: player.profile?.playerKey,
                });
                playerStatsArray.push({
                    playerId: player.profile?.playerKey,
                    username: player.username,
                    teamName: player.teamName,
                    position: seasonStats?.position || 'Unknown',
                    gamesPlayed: gameCount,
                    seasonStats: seasonStats || null,
                });
            }
            catch (error) {
                console.error(`Error fetching stats for player ${player.profile?.playerKey}:`, error);
            }
        }
        const filteredStats = position
            ? playerStatsArray.filter((p) => p.position === position)
            : playerStatsArray;
        return {
            success: true,
            message: '모든 선수 통계 조회 성공',
            data: filteredStats,
            totalPlayers: filteredStats.length,
            filters: { team, position },
        };
    }
    async getSystemLogs(limit = 50) {
        const recentGames = await this.gameInfoModel
            .find()
            .sort({ createdAt: -1 })
            .limit(Number(limit));
        const recentUsers = await this.userModel
            .find()
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(10);
        return {
            success: true,
            message: '시스템 로그 조회 성공',
            data: {
                recentGames: recentGames.map((game) => ({
                    gameKey: game.gameKey,
                    date: game.date,
                    teams: `${game.homeTeam} vs ${game.awayTeam}`,
                    uploadedAt: game.createdAt || new Date(),
                })),
                recentUsers: recentUsers.map((user) => ({
                    username: user.username,
                    role: user.role,
                    team: user.teamName,
                    joinedAt: user.createdAt || new Date(),
                })),
            },
        };
    }
};
exports.AdminDashboardController = AdminDashboardController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({
        summary: '📊 Admin 대시보드 - 전체 시스템 통계',
        description: '시스템 전체의 통계 정보를 한눈에 볼 수 있는 대시보드',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 대시보드 데이터 조회 성공',
        schema: {
            example: {
                success: true,
                data: {
                    systemOverview: {
                        totalUsers: 150,
                        totalPlayers: 120,
                        totalCoaches: 25,
                        totalAdmins: 5,
                        totalGames: 48,
                        totalTeams: 12,
                    },
                    teamStatistics: [
                        {
                            teamName: 'HYLions',
                            totalPlayers: 25,
                            totalGames: 8,
                            wins: 6,
                            losses: 2,
                        },
                    ],
                    recentActivity: {
                        lastGameUpload: '2025-09-04',
                        recentLogins: 45,
                        activeToday: 32,
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('all-users'),
    (0, swagger_1.ApiOperation)({
        summary: '👥 모든 사용자 목록 조회',
        description: 'Admin 전용 - 시스템의 모든 사용자 정보를 조회합니다.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'role',
        required: false,
        description: '역할별 필터링 (player, coach, admin)',
        enum: ['player', 'coach', 'admin'],
    }),
    (0, swagger_1.ApiQuery)({
        name: 'team',
        required: false,
        description: '팀별 필터링',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 사용자 목록 조회 성공',
    }),
    __param(0, (0, common_1.Query)('role')),
    __param(1, (0, common_1.Query)('team')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('all-teams-stats'),
    (0, swagger_1.ApiOperation)({
        summary: '🏈 모든 팀 통계 조회',
        description: 'Admin 전용 - 모든 팀의 시즌 및 누적 통계를 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 모든 팀 통계 조회 성공',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getAllTeamsStats", null);
__decorate([
    (0, common_1.Get)('all-players-stats'),
    (0, swagger_1.ApiOperation)({
        summary: '🏃 모든 선수 통계 조회',
        description: 'Admin 전용 - 모든 선수의 개인 통계를 조회합니다.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'team',
        required: false,
        description: '팀별 필터링',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'position',
        required: false,
        description: '포지션별 필터링',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 모든 선수 통계 조회 성공',
    }),
    __param(0, (0, common_1.Query)('team')),
    __param(1, (0, common_1.Query)('position')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getAllPlayersStats", null);
__decorate([
    (0, common_1.Get)('system-logs'),
    (0, swagger_1.ApiOperation)({
        summary: '📜 시스템 로그 조회',
        description: 'Admin 전용 - 최근 게임 업로드 및 시스템 활동 로그',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: '조회할 로그 수 (기본: 50)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 시스템 로그 조회 성공',
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getSystemLogs", null);
exports.AdminDashboardController = AdminDashboardController = __decorate([
    (0, swagger_1.ApiTags)('Admin Dashboard'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(player_game_stats_schema_1.PlayerGameStats.name)),
    __param(2, (0, mongoose_1.InjectModel)(player_season_stats_schema_1.PlayerSeasonStats.name)),
    __param(3, (0, mongoose_1.InjectModel)(game_info_schema_1.GameInfo.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        game_service_1.GameService,
        player_service_1.PlayerService])
], AdminDashboardController);
//# sourceMappingURL=admin-dashboard.controller.js.map