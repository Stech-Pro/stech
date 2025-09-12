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
exports.TeamStatsErrorDto = exports.TeamStatsSuccessDto = exports.TeamStatsResultDto = exports.TeamStatsDataDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class TeamStatsDataDto {
    teamName;
    totalYards;
    passingYards;
    rushingYards;
    interceptionReturnYards;
    puntReturnYards;
    kickoffReturnYards;
    turnovers;
    penaltyYards;
    sackYards;
}
exports.TeamStatsDataDto = TeamStatsDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'DGTuskers',
        description: '팀 이름',
    }),
    __metadata("design:type", String)
], TeamStatsDataDto.prototype, "teamName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 425,
        description: '총 야드 (패싱+러싱+리턴야드 합계)',
    }),
    __metadata("design:type", Number)
], TeamStatsDataDto.prototype, "totalYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 280,
        description: '패싱 야드',
    }),
    __metadata("design:type", Number)
], TeamStatsDataDto.prototype, "passingYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 145,
        description: '러싱 야드 (sack 야드 차감)',
    }),
    __metadata("design:type", Number)
], TeamStatsDataDto.prototype, "rushingYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 45,
        description: '인터셉트 리턴 야드',
    }),
    __metadata("design:type", Number)
], TeamStatsDataDto.prototype, "interceptionReturnYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 25,
        description: '펀트 리턴 야드',
    }),
    __metadata("design:type", Number)
], TeamStatsDataDto.prototype, "puntReturnYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 35,
        description: '킥오프 리턴 야드',
    }),
    __metadata("design:type", Number)
], TeamStatsDataDto.prototype, "kickoffReturnYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 2,
        description: '턴오버 횟수',
    }),
    __metadata("design:type", Number)
], TeamStatsDataDto.prototype, "turnovers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 45,
        description: '페널티 야드 (추후 구현)',
    }),
    __metadata("design:type", Number)
], TeamStatsDataDto.prototype, "penaltyYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 15,
        description: 'Sack 야드 (러싱야드 차감용)',
    }),
    __metadata("design:type", Number)
], TeamStatsDataDto.prototype, "sackYards", void 0);
class TeamStatsResultDto {
    homeTeamStats;
    awayTeamStats;
}
exports.TeamStatsResultDto = TeamStatsResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: TeamStatsDataDto,
        description: '홈팀 스탯',
    }),
    __metadata("design:type", TeamStatsDataDto)
], TeamStatsResultDto.prototype, "homeTeamStats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: TeamStatsDataDto,
        description: '어웨이팀 스탯',
    }),
    __metadata("design:type", TeamStatsDataDto)
], TeamStatsResultDto.prototype, "awayTeamStats", void 0);
class TeamStatsSuccessDto {
    success;
    message;
    data;
    timestamp;
}
exports.TeamStatsSuccessDto = TeamStatsSuccessDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], TeamStatsSuccessDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '팀 스탯 조회가 완료되었습니다' }),
    __metadata("design:type", String)
], TeamStatsSuccessDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: TeamStatsResultDto,
        description: '팀 스탯 데이터',
    }),
    __metadata("design:type", TeamStatsResultDto)
], TeamStatsSuccessDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-12-26T10:30:00.000Z' }),
    __metadata("design:type", String)
], TeamStatsSuccessDto.prototype, "timestamp", void 0);
class TeamStatsErrorDto {
    success;
    message;
    code;
}
exports.TeamStatsErrorDto = TeamStatsErrorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], TeamStatsErrorDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '해당 게임의 팀 스탯을 찾을 수 없습니다',
        description: '에러 메시지',
    }),
    __metadata("design:type", String)
], TeamStatsErrorDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'TEAM_STATS_NOT_FOUND',
        description: '에러 코드',
    }),
    __metadata("design:type", String)
], TeamStatsErrorDto.prototype, "code", void 0);
//# sourceMappingURL=team-stats.dto.js.map