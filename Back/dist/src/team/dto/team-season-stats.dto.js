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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamRankingResponseDto = exports.TeamSeasonStatsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class TeamSeasonStatsDto {
    teamName;
    season;
    totalPoints;
    pointsPerGame;
    totalTouchdowns;
    totalYards;
    yardsPerGame;
    gamesPlayed;
    rushingAttempts;
    rushingYards;
    yardsPerCarry;
    rushingYardsPerGame;
    rushingTouchdowns;
    passCompletionAttempts;
    passingYards;
    yardsPerPassAttempt;
    passingYardsPerGame;
    passingTouchdowns;
    interceptions;
    totalPuntYards;
    averagePuntYards;
    puntTouchbackPercentage;
    fieldGoalStats;
    averageKickReturnYards;
    averagePuntReturnYards;
    totalReturnYards;
    fumbleStats;
    turnoversPerGame;
    turnoverRate;
    turnoverDifferential;
    penaltyStats;
    penaltyYardsPerGame;
}
exports.TeamSeasonStatsDto = TeamSeasonStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'DGTuskers', description: '팀 이름' }),
    __metadata("design:type", String)
], TeamSeasonStatsDto.prototype, "teamName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024', description: '시즌' }),
    __metadata("design:type", String)
], TeamSeasonStatsDto.prototype, "season", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 280, description: '총 득점 (시즌 기준)' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "totalPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 14.0, description: '경기당 평균 득점' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "pointsPerGame", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 35, description: '총 터치다운 (시즌 기준)' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "totalTouchdowns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4200, description: '총 전진야드' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "totalYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 350.0, description: '경기 당 전진야드' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "yardsPerGame", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12, description: '경기 수' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "gamesPlayed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 320, description: '러싱 시도' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "rushingAttempts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1450, description: '러싱 야드' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "rushingYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4.5, description: '볼 캐리 당 러싱 야드' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "yardsPerCarry", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 120.8, description: '경기당 러싱 야드' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "rushingYardsPerGame", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 18, description: '러싱 터치다운' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "rushingTouchdowns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '245-380', description: '패스 성공-패스 시도' }),
    __metadata("design:type", String)
], TeamSeasonStatsDto.prototype, "passCompletionAttempts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2750, description: '패싱 야드' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "passingYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 7.2, description: '패스 시도 당 패스 야드' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "yardsPerPassAttempt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 229.2, description: '경기 당 패싱 야드' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "passingYardsPerGame", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 17, description: '패싱 터치다운' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "passingTouchdowns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8, description: '인터셉트' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "interceptions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2100, description: '총 펀트 야드' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "totalPuntYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 42.5, description: '평균 펀트 야드' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "averagePuntYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25.0, description: '터치백 퍼센티지(펀트)' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "puntTouchbackPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '18-22', description: '필드골 성공-총 시도' }),
    __metadata("design:type", String)
], TeamSeasonStatsDto.prototype, "fieldGoalStats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 22.5, description: '평균 킥 리턴 야드' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "averageKickReturnYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8.3, description: '평균 펀트 리턴 야드' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "averagePuntReturnYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 450,
        description: '총 리턴 야드 (킥 리턴 + 펀트 리턴)',
    }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "totalReturnYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12-8', description: '펌블 수-펌블 턴오버 수' }),
    __metadata("design:type", String)
], TeamSeasonStatsDto.prototype, "fumbleStats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1.3, description: '경기 당 턴오버 수' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "turnoversPerGame", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 3.2,
        description: '턴오버 비율 (%) - 총 공격 기회 대비',
    }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "turnoverRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '+2',
        description: '턴오버 차이 (상대 팀 턴오버 - 우리 팀 턴오버)',
    }),
    __metadata("design:type", String)
], TeamSeasonStatsDto.prototype, "turnoverDifferential", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '85-650',
        description: '총 페널티 수-총 페널티 야드',
    }),
    __metadata("design:type", String)
], TeamSeasonStatsDto.prototype, "penaltyStats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 54.2, description: '경기 당 페널티 야드' }),
    __metadata("design:type", Number)
], TeamSeasonStatsDto.prototype, "penaltyYardsPerGame", void 0);
class TeamRankingResponseDto {
    success;
    message;
    data;
    timestamp;
}
exports.TeamRankingResponseDto = TeamRankingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], TeamRankingResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '팀 순위 조회가 완료되었습니다' }),
    __metadata("design:type", String)
], TeamRankingResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [TeamSeasonStatsDto], description: '팀 시즌 스탯 목록' }),
    __metadata("design:type", Array)
], TeamRankingResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-12-26T10:30:00.000Z' }),
    __metadata("design:type", String)
], TeamRankingResponseDto.prototype, "timestamp", void 0);
//# sourceMappingURL=team-season-stats.dto.js.map