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
exports.PlayersListResponseDto = exports.StatsAnalysisResponseDto = exports.PlayerResponseDto = exports.AnalyzeClipsDto = exports.ClipDataDto = exports.ScoreDto = exports.SignificantPlayDto = exports.CarrierDto = exports.YardDto = exports.UpdatePlayerStatsDto = exports.CreatePlayerDto = exports.PlayerStatsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class PlayerStatsDto {
    passingYards;
    passingTouchdowns;
    passingCompletions;
    passingAttempts;
    passingInterceptions;
    completionPercentage;
    passerRating;
    rushingYards;
    rushingTouchdowns;
    rushingAttempts;
    yardsPerCarry;
    longestRush;
    rushingFirstDowns;
    receivingYards;
    receivingTouchdowns;
    receptions;
    receivingTargets;
    yardsPerReception;
    longestReception;
    receivingFirstDowns;
    fieldGoalsMade;
    fieldGoalsAttempted;
    fieldGoalPercentage;
    longestFieldGoal;
    extraPointsMade;
    extraPointsAttempted;
    tackles;
    sacks;
    interceptions;
    passesDefended;
    forcedFumbles;
    fumbleRecoveries;
    defensiveTouchdowns;
    totalYards;
    totalTouchdowns;
    gamesPlayed;
    gamesStarted;
}
exports.PlayerStatsDto = PlayerStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "passingYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "passingTouchdowns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "passingCompletions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "passingAttempts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "passingInterceptions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "completionPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "passerRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "rushingYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "rushingTouchdowns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "rushingAttempts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "yardsPerCarry", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "longestRush", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "rushingFirstDowns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "receivingYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "receivingTouchdowns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "receptions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "receivingTargets", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "yardsPerReception", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "longestReception", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "receivingFirstDowns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "fieldGoalsMade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "fieldGoalsAttempted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "fieldGoalPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "longestFieldGoal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "extraPointsMade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "extraPointsAttempted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "tackles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "sacks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "interceptions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "passesDefended", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "forcedFumbles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "fumbleRecoveries", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "defensiveTouchdowns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "totalYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "totalTouchdowns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "gamesPlayed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PlayerStatsDto.prototype, "gamesStarted", void 0);
class CreatePlayerDto {
    playerId;
    name;
    jerseyNumber;
    position;
    studentId;
    email;
    playerID;
    league;
    season;
    stats;
}
exports.CreatePlayerDto = CreatePlayerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'QB001' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlayerDto.prototype, "playerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ken Lee' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlayerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePlayerDto.prototype, "jerseyNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'QB' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlayerDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023001', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlayerDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ken@example.com', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlayerDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Kenny', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlayerDto.prototype, "playerID", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1부' }),
    (0, class_validator_1.IsEnum)(['1부', '2부']),
    __metadata("design:type", String)
], CreatePlayerDto.prototype, "league", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlayerDto.prototype, "season", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PlayerStatsDto, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PlayerStatsDto),
    __metadata("design:type", PlayerStatsDto)
], CreatePlayerDto.prototype, "stats", void 0);
class UpdatePlayerStatsDto {
    stats;
}
exports.UpdatePlayerStatsDto = UpdatePlayerStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: PlayerStatsDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PlayerStatsDto),
    __metadata("design:type", PlayerStatsDto)
], UpdatePlayerStatsDto.prototype, "stats", void 0);
class YardDto {
    side;
    yard;
}
exports.YardDto = YardDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'own',
        description: 'own(자진영) 또는 opp(상대진영)',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], YardDto.prototype, "side", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25, description: '야드 라인 (0-50)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], YardDto.prototype, "yard", void 0);
class CarrierDto {
    playercode;
    backnumber;
    team;
    position;
    action;
}
exports.CarrierDto = CarrierDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'QB001', description: '선수 코드' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CarrierDto.prototype, "playercode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, description: '등번호' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CarrierDto.prototype, "backnumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Away', description: '팀' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CarrierDto.prototype, "team", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'QB', description: '포지션' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CarrierDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'throw', description: '액션' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CarrierDto.prototype, "action", void 0);
class SignificantPlayDto {
    key;
    label;
}
exports.SignificantPlayDto = SignificantPlayDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TOUCHDOWN', description: '특별한 플레이 키' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignificantPlayDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Touchdown', description: '라벨', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignificantPlayDto.prototype, "label", void 0);
class ScoreDto {
    Home;
    Away;
}
exports.ScoreDto = ScoreDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, description: '홈팀 점수' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ScoreDto.prototype, "Home", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 7, description: '어웨이팀 점수' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ScoreDto.prototype, "Away", void 0);
class ClipDataDto {
    ClipKey;
    ClipUrl;
    Quarter;
    OffensiveTeam;
    PlayType;
    SpecialTeam;
    Down;
    RemainYard;
    StartYard;
    EndYard;
    Carrier;
    SignificantPlays;
    StartScore;
}
exports.ClipDataDto = ClipDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'GAME_001_PLAY_15', description: '클립 고유 식별자' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClipDataDto.prototype, "ClipKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/clip.mp4',
        description: '클립 URL',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClipDataDto.prototype, "ClipUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1', description: '쿼터' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClipDataDto.prototype, "Quarter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Away', description: '공격팀' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClipDataDto.prototype, "OffensiveTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Pass',
        description: '플레이 타입 (Pass, NoPass, Run, Sack, PAT, NoPAT, FieldGoal, NoFieldGoal, Punt, Kickoff, None)',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClipDataDto.prototype, "PlayType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: '스페셜팀 여부' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ClipDataDto.prototype, "SpecialTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: '다운' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClipDataDto.prototype, "Down", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, description: '남은 야드' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClipDataDto.prototype, "RemainYard", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: YardDto, description: '시작 야드' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => YardDto),
    __metadata("design:type", YardDto)
], ClipDataDto.prototype, "StartYard", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: YardDto, description: '종료 야드' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => YardDto),
    __metadata("design:type", YardDto)
], ClipDataDto.prototype, "EndYard", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CarrierDto], description: '관련 선수들' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CarrierDto),
    __metadata("design:type", Array)
], ClipDataDto.prototype, "Carrier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [SignificantPlayDto],
        description: '특별한 플레이들',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SignificantPlayDto),
    __metadata("design:type", Array)
], ClipDataDto.prototype, "SignificantPlays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ScoreDto, description: '시작 점수' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ScoreDto),
    __metadata("design:type", ScoreDto)
], ClipDataDto.prototype, "StartScore", void 0);
class AnalyzeClipsDto {
    clips;
}
exports.AnalyzeClipsDto = AnalyzeClipsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [ClipDataDto],
        description: '분석할 클립 데이터 배열',
        example: [
            {
                ClipKey: 'GAME_001_PLAY_15',
                ClipUrl: 'https://example.com/clip.mp4',
                Quarter: '1',
                OffensiveTeam: 'Away',
                PlayType: 'Pass',
                SpecialTeam: false,
                Down: 1,
                RemainYard: 10,
                StartYard: { side: 'own', yard: 25 },
                EndYard: { side: 'own', yard: 35 },
                Carrier: [
                    {
                        playercode: 'QB001',
                        backnumber: 10,
                        team: 'Away',
                        position: 'QB',
                        action: 'throw',
                    },
                ],
                SignificantPlays: [{ key: 'TOUCHDOWN', label: 'Touchdown' }],
                StartScore: { Home: 0, Away: 0 },
            },
        ],
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ClipDataDto),
    __metadata("design:type", Array)
], AnalyzeClipsDto.prototype, "clips", void 0);
class PlayerResponseDto {
    success;
    message;
    data;
}
exports.PlayerResponseDto = PlayerResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], PlayerResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '선수 조회 성공' }),
    __metadata("design:type", String)
], PlayerResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '선수 데이터' }),
    __metadata("design:type", Object)
], PlayerResponseDto.prototype, "data", void 0);
class StatsAnalysisResponseDto {
    success;
    message;
    analyzedStats;
    clipCount;
}
exports.StatsAnalysisResponseDto = StatsAnalysisResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], StatsAnalysisResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'QB 스탯 분석이 완료되었습니다.' }),
    __metadata("design:type", String)
], StatsAnalysisResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '분석된 스탯 데이터' }),
    __metadata("design:type", Object)
], StatsAnalysisResponseDto.prototype, "analyzedStats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], StatsAnalysisResponseDto.prototype, "clipCount", void 0);
class PlayersListResponseDto {
    success;
    data;
}
exports.PlayersListResponseDto = PlayersListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], PlayersListResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '선수 목록', type: [Object] }),
    __metadata("design:type", Array)
], PlayersListResponseDto.prototype, "data", void 0);
//# sourceMappingURL=player.dto.js.map