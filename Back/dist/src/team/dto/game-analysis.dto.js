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
exports.GameAnalysisResponseDto = exports.TeamGameAnalysisDto = exports.ThirdDownStatsDto = exports.PlayCallRatioDto = exports.GameAnalysisRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class GameAnalysisRequestDto {
    gameKey;
}
exports.GameAnalysisRequestDto = GameAnalysisRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '분석할 경기의 gameKey',
        example: 'SNUS240908',
    }),
    __metadata("design:type", String)
], GameAnalysisRequestDto.prototype, "gameKey", void 0);
class PlayCallRatioDto {
    runPlays;
    passPlays;
    runPercentage;
    passPercentage;
}
exports.PlayCallRatioDto = PlayCallRatioDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '런 플레이 수',
        example: 25,
    }),
    __metadata("design:type", Number)
], PlayCallRatioDto.prototype, "runPlays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '패스 플레이 수',
        example: 35,
    }),
    __metadata("design:type", Number)
], PlayCallRatioDto.prototype, "passPlays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '런 비율 (%)',
        example: 42,
    }),
    __metadata("design:type", Number)
], PlayCallRatioDto.prototype, "runPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '패스 비율 (%)',
        example: 58,
    }),
    __metadata("design:type", Number)
], PlayCallRatioDto.prototype, "passPercentage", void 0);
class ThirdDownStatsDto {
    attempts;
    conversions;
    percentage;
}
exports.ThirdDownStatsDto = ThirdDownStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '3rd down 시도 수',
        example: 12,
    }),
    __metadata("design:type", Number)
], ThirdDownStatsDto.prototype, "attempts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '3rd down 성공 수',
        example: 5,
    }),
    __metadata("design:type", Number)
], ThirdDownStatsDto.prototype, "conversions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '3rd down 성공률 (%)',
        example: 42,
    }),
    __metadata("design:type", Number)
], ThirdDownStatsDto.prototype, "percentage", void 0);
class TeamGameAnalysisDto {
    teamName;
    playCallRatio;
    totalYards;
    passingYards;
    rushingYards;
    thirdDownStats;
    turnovers;
    penaltyYards;
}
exports.TeamGameAnalysisDto = TeamGameAnalysisDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '팀명',
        example: 'SNGreenTerrors',
    }),
    __metadata("design:type", String)
], TeamGameAnalysisDto.prototype, "teamName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '플레이콜 비율',
        type: PlayCallRatioDto,
    }),
    __metadata("design:type", PlayCallRatioDto)
], TeamGameAnalysisDto.prototype, "playCallRatio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '총 야드',
        example: 325,
    }),
    __metadata("design:type", Number)
], TeamGameAnalysisDto.prototype, "totalYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '패싱 야드',
        example: 185,
    }),
    __metadata("design:type", Number)
], TeamGameAnalysisDto.prototype, "passingYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '러싱 야드',
        example: 140,
    }),
    __metadata("design:type", Number)
], TeamGameAnalysisDto.prototype, "rushingYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '3rd down 스탯',
        type: ThirdDownStatsDto,
    }),
    __metadata("design:type", ThirdDownStatsDto)
], TeamGameAnalysisDto.prototype, "thirdDownStats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '턴오버',
        example: 2,
    }),
    __metadata("design:type", Number)
], TeamGameAnalysisDto.prototype, "turnovers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '페널티 야드',
        example: 45,
    }),
    __metadata("design:type", Number)
], TeamGameAnalysisDto.prototype, "penaltyYards", void 0);
class GameAnalysisResponseDto {
    success;
    message;
    homeTeam;
    awayTeam;
    timestamp;
}
exports.GameAnalysisResponseDto = GameAnalysisResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '성공 여부',
        example: true,
    }),
    __metadata("design:type", Boolean)
], GameAnalysisResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '응답 메시지',
        example: '경기 분석이 완료되었습니다',
    }),
    __metadata("design:type", String)
], GameAnalysisResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '홈팀 분석 데이터',
        type: TeamGameAnalysisDto,
    }),
    __metadata("design:type", TeamGameAnalysisDto)
], GameAnalysisResponseDto.prototype, "homeTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '어웨이팀 분석 데이터',
        type: TeamGameAnalysisDto,
    }),
    __metadata("design:type", TeamGameAnalysisDto)
], GameAnalysisResponseDto.prototype, "awayTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '응답 시간',
        example: '2024-09-08T10:30:00.000Z',
    }),
    __metadata("design:type", String)
], GameAnalysisResponseDto.prototype, "timestamp", void 0);
//# sourceMappingURL=game-analysis.dto.js.map