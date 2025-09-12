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
exports.FileUploadDto = exports.GameUploadErrorDto = exports.GameUploadSuccessDto = exports.GameUploadDataDto = exports.ErrorDetailsDto = exports.FailedPlayerDto = exports.InvalidClipDto = exports.AnalysisSummaryDto = exports.PlayerResultDto = exports.GameInfoDto = exports.FinalScoreDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const team_stats_dto_1 = require("../../team/dto/team-stats.dto");
class FinalScoreDto {
    home;
    away;
}
exports.FinalScoreDto = FinalScoreDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, description: '홈팀 점수' }),
    __metadata("design:type", Number)
], FinalScoreDto.prototype, "home", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 36, description: '어웨이팀 점수' }),
    __metadata("design:type", Number)
], FinalScoreDto.prototype, "away", void 0);
class GameInfoDto {
    gameKey;
    date;
    homeTeam;
    awayTeam;
    location;
    finalScore;
    totalClips;
    processedAt;
}
exports.GameInfoDto = GameInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'DGKM240908',
        description: '게임 고유 키',
    }),
    __metadata("design:type", String)
], GameInfoDto.prototype, "gameKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-09-08(일) 16:00',
        description: '게임 날짜 및 시간',
        required: false,
    }),
    __metadata("design:type", String)
], GameInfoDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'DGTuskers',
        description: '홈팀 이름',
    }),
    __metadata("design:type", String)
], GameInfoDto.prototype, "homeTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'KMRazorbacks',
        description: '어웨이팀 이름',
    }),
    __metadata("design:type", String)
], GameInfoDto.prototype, "awayTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '서울대학교 종합운동장',
        description: '경기 장소',
        required: false,
    }),
    __metadata("design:type", String)
], GameInfoDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: FinalScoreDto,
        description: '최종 스코어',
        required: false,
    }),
    __metadata("design:type", FinalScoreDto)
], GameInfoDto.prototype, "finalScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 80,
        description: '총 클립 수',
    }),
    __metadata("design:type", Number)
], GameInfoDto.prototype, "totalClips", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-12-26T10:30:00.000Z',
        description: '처리 완료 시간',
    }),
    __metadata("design:type", String)
], GameInfoDto.prototype, "processedAt", void 0);
class PlayerResultDto {
    playerNumber;
    success;
    clipsAnalyzed;
    position;
    stats;
    message;
    error;
}
exports.PlayerResultDto = PlayerResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15, description: '선수 등번호' }),
    __metadata("design:type", Number)
], PlayerResultDto.prototype, "playerNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: '분석 성공 여부' }),
    __metadata("design:type", Boolean)
], PlayerResultDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 12,
        description: '분석된 클립 수',
        required: false,
    }),
    __metadata("design:type", Number)
], PlayerResultDto.prototype, "clipsAnalyzed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'QB',
        description: '선수 포지션',
        required: false,
    }),
    __metadata("design:type", String)
], PlayerResultDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '분석된 통계 데이터',
        required: false,
        example: {
            games: 1,
            passAttempted: 15,
            passCompletion: 12,
            passingYards: 180,
            passingTouchdown: 2,
        },
    }),
    __metadata("design:type", Object)
], PlayerResultDto.prototype, "stats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '15번 선수 분석 완료',
        description: '분석 결과 메시지',
    }),
    __metadata("design:type", String)
], PlayerResultDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '해당 선수는 DB에 존재하지 않습니다',
        description: '에러 메시지 (실패 시)',
        required: false,
    }),
    __metadata("design:type", String)
], PlayerResultDto.prototype, "error", void 0);
class AnalysisSummaryDto {
    totalPlayers;
    successfulPlayers;
    failedPlayers;
    totalClipsProcessed;
    invalidClips;
    successRate;
}
exports.AnalysisSummaryDto = AnalysisSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15, description: '총 참여 선수 수' }),
    __metadata("design:type", Number)
], AnalysisSummaryDto.prototype, "totalPlayers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 14, description: '분석 성공한 선수 수' }),
    __metadata("design:type", Number)
], AnalysisSummaryDto.prototype, "successfulPlayers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: '분석 실패한 선수 수' }),
    __metadata("design:type", Number)
], AnalysisSummaryDto.prototype, "failedPlayers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 80, description: '처리된 총 클립 수' }),
    __metadata("design:type", Number)
], AnalysisSummaryDto.prototype, "totalClipsProcessed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, description: '유효하지 않은 클립 수' }),
    __metadata("design:type", Number)
], AnalysisSummaryDto.prototype, "invalidClips", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 93, description: '성공률 (%)' }),
    __metadata("design:type", Number)
], AnalysisSummaryDto.prototype, "successRate", void 0);
class InvalidClipDto {
    clipIndex;
    clipKey;
    error;
}
exports.InvalidClipDto = InvalidClipDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5, description: '클립 인덱스' }),
    __metadata("design:type", Number)
], InvalidClipDto.prototype, "clipIndex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clip_001', description: '클립 키' }),
    __metadata("design:type", String)
], InvalidClipDto.prototype, "clipKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Missing player information',
        description: '에러 메시지',
    }),
    __metadata("design:type", String)
], InvalidClipDto.prototype, "error", void 0);
class FailedPlayerDto {
    playerNumber;
    error;
}
exports.FailedPlayerDto = FailedPlayerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 99, description: '선수 등번호' }),
    __metadata("design:type", Number)
], FailedPlayerDto.prototype, "playerNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '해당 선수는 DB에 존재하지 않습니다',
        description: '실패 원인',
    }),
    __metadata("design:type", String)
], FailedPlayerDto.prototype, "error", void 0);
class ErrorDetailsDto {
    invalidClips;
    failedPlayers;
}
exports.ErrorDetailsDto = ErrorDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [InvalidClipDto],
        description: '유효하지 않은 클립 목록',
    }),
    __metadata("design:type", Array)
], ErrorDetailsDto.prototype, "invalidClips", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [FailedPlayerDto],
        description: '분석 실패한 선수 목록',
    }),
    __metadata("design:type", Array)
], ErrorDetailsDto.prototype, "failedPlayers", void 0);
class GameUploadDataDto {
    gameInfo;
    playerResults;
    summary;
    errors;
    teamStats;
}
exports.GameUploadDataDto = GameUploadDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: GameInfoDto, description: '게임 기본 정보' }),
    __metadata("design:type", GameInfoDto)
], GameUploadDataDto.prototype, "gameInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [PlayerResultDto],
        description: '선수별 분석 결과',
    }),
    __metadata("design:type", Array)
], GameUploadDataDto.prototype, "playerResults", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AnalysisSummaryDto, description: '분석 결과 요약' }),
    __metadata("design:type", AnalysisSummaryDto)
], GameUploadDataDto.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ErrorDetailsDto, description: '에러 상세 정보' }),
    __metadata("design:type", ErrorDetailsDto)
], GameUploadDataDto.prototype, "errors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: team_stats_dto_1.TeamStatsResultDto,
        description: '팀 스탯 결과 (자동 계산)',
        required: false,
    }),
    __metadata("design:type", team_stats_dto_1.TeamStatsResultDto)
], GameUploadDataDto.prototype, "teamStats", void 0);
class GameUploadSuccessDto {
    success;
    message;
    data;
    timestamp;
}
exports.GameUploadSuccessDto = GameUploadSuccessDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: '업로드 성공 여부' }),
    __metadata("design:type", Boolean)
], GameUploadSuccessDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '게임 데이터 업로드 및 분석이 완료되었습니다',
        description: '응답 메시지',
    }),
    __metadata("design:type", String)
], GameUploadSuccessDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: GameUploadDataDto, description: '업로드 결과 데이터' }),
    __metadata("design:type", GameUploadDataDto)
], GameUploadSuccessDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-12-26T10:30:00.000Z',
        description: '처리 완료 시간',
    }),
    __metadata("design:type", String)
], GameUploadSuccessDto.prototype, "timestamp", void 0);
class GameUploadErrorDto {
    success;
    message;
    code;
    details;
}
exports.GameUploadErrorDto = GameUploadErrorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: '업로드 성공 여부' }),
    __metadata("design:type", Boolean)
], GameUploadErrorDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '파일이 업로드되지 않았습니다',
        description: '에러 메시지',
    }),
    __metadata("design:type", String)
], GameUploadErrorDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'NO_FILE_UPLOADED',
        description: '에러 코드',
        required: false,
    }),
    __metadata("design:type", String)
], GameUploadErrorDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Invalid file format',
        description: '에러 상세 정보',
        required: false,
    }),
    __metadata("design:type", String)
], GameUploadErrorDto.prototype, "details", void 0);
class FileUploadDto {
    gameFile;
}
exports.FileUploadDto = FileUploadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'binary',
        description: 'JSON 형식의 게임 데이터 파일 (최대 10MB)',
        example: 'game-data.json',
    }),
    __metadata("design:type", Object)
], FileUploadDto.prototype, "gameFile", void 0);
//# sourceMappingURL=game-upload.dto.js.map