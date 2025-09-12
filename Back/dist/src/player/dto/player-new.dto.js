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
exports.UpdatePlayerNewDto = exports.CreatePlayerNewDto = exports.AchievementDto = exports.StatsDto = exports.CareerStatsDto = exports.SeasonStatsDto = exports.GameStatsDto = exports.FieldGoalsByDistanceDto = exports.FieldGoalDistanceDto = exports.ProfileDto = exports.TeamDto = exports.AccountDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class AccountDto {
    id;
    password;
}
exports.AccountDto = AccountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '계정 ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccountDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '비밀번호' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccountDto.prototype, "password", void 0);
class TeamDto {
    id;
    name;
    abbr;
    logo;
    color;
    location;
    coach;
    founded;
    website;
}
exports.TeamDto = TeamDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '팀 ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '팀 이름' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '팀 약어' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamDto.prototype, "abbr", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '팀 로고 URL', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamDto.prototype, "logo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '팀 컬러', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '팀 소재지', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '감독 이름', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamDto.prototype, "coach", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '창단일', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TeamDto.prototype, "founded", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '팀 웹사이트', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamDto.prototype, "website", void 0);
class ProfileDto {
    name;
    number;
    position;
    birth;
    age;
    grade;
    career;
    height;
    weight;
    email;
    phone;
    image;
    status;
}
exports.ProfileDto = ProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '선수 이름' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '등번호' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProfileDto.prototype, "number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '포지션' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '생년월일', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "birth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '나이', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProfileDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '년', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProfileDto.prototype, "grade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '경력', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProfileDto.prototype, "career", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '키 (cm)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProfileDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '몸무게 (kg)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProfileDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '이메일', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '전화번호', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '프로필 이미지 URL', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '상태', required: false, default: 'Active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "status", void 0);
class FieldGoalDistanceDto {
    made;
    attempt;
}
exports.FieldGoalDistanceDto = FieldGoalDistanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '성공 횟수' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FieldGoalDistanceDto.prototype, "made", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '시도 횟수' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FieldGoalDistanceDto.prototype, "attempt", void 0);
class FieldGoalsByDistanceDto {
    '0_19';
    '20_29';
    '30_39';
    '40_49';
    '50_plus';
}
exports.FieldGoalsByDistanceDto = FieldGoalsByDistanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '0-19야드' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FieldGoalDistanceDto),
    __metadata("design:type", FieldGoalDistanceDto)
], FieldGoalsByDistanceDto.prototype, "0_19", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '20-29야드' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FieldGoalDistanceDto),
    __metadata("design:type", FieldGoalDistanceDto)
], FieldGoalsByDistanceDto.prototype, "20_29", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '30-39야드' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FieldGoalDistanceDto),
    __metadata("design:type", FieldGoalDistanceDto)
], FieldGoalsByDistanceDto.prototype, "30_39", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '40-49야드' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FieldGoalDistanceDto),
    __metadata("design:type", FieldGoalDistanceDto)
], FieldGoalsByDistanceDto.prototype, "40_49", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '50야드 이상' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FieldGoalDistanceDto),
    __metadata("design:type", FieldGoalDistanceDto)
], FieldGoalsByDistanceDto.prototype, "50_plus", void 0);
class GameStatsDto {
    GamesPlayed;
    PassYards;
    PassATT;
    PassCmp;
    PassTD;
    Interceptions;
    LongPass;
    RushYards;
    RushAtt;
    RushTD;
    LongRush;
    Receptions;
    Target;
    ReceivingYards;
    ReceivingTD;
    LongReception;
    ReceivingFD;
    FieldGoalsByDistance;
}
exports.GameStatsDto = GameStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '출전 경기 수', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "GamesPlayed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '패싱 야드', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "PassYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '패스 시도', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "PassATT", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '패스 성공', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "PassCmp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '패싱 터치다운', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "PassTD", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '인터셉션', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "Interceptions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '최장 패스', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "LongPass", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '러싱 야드', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "RushYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '러싱 시도', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "RushAtt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '러싱 터치다운', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "RushTD", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '최장 러싱', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "LongRush", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '리셉션', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "Receptions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '타겟', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "Target", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '리시빙 야드', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "ReceivingYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '리시빙 터치다운', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "ReceivingTD", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '최장 리셉션', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "LongReception", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '리시빙 퍼스트다운',
        required: false,
        default: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GameStatsDto.prototype, "ReceivingFD", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '거리별 필드골 통계', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FieldGoalsByDistanceDto),
    __metadata("design:type", FieldGoalsByDistanceDto)
], GameStatsDto.prototype, "FieldGoalsByDistance", void 0);
class SeasonStatsDto extends GameStatsDto {
    year;
}
exports.SeasonStatsDto = SeasonStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '시즌 연도' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SeasonStatsDto.prototype, "year", void 0);
class CareerStatsDto {
    GamesPlayed;
    PassYards;
    PassATT;
    PassCmp;
    PassTD;
    Interceptions;
    RushYards;
    RushTD;
    ReceivingYards;
    ReceivingTD;
    Tackles;
    Sacks;
    DefTD;
    Punts;
    PuntYards;
    FieldGoalMade;
    FieldGoalAttempt;
}
exports.CareerStatsDto = CareerStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '총 출전 경기', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CareerStatsDto.prototype, "GamesPlayed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '총 패싱 야드', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CareerStatsDto.prototype, "PassYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '총 패스 시도', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CareerStatsDto.prototype, "PassATT", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '총 패스 성공', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CareerStatsDto.prototype, "PassCmp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '총 패싱 터치다운', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CareerStatsDto.prototype, "PassTD", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '총 인터셉션', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CareerStatsDto.prototype, "Interceptions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '총 러싱 야드', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CareerStatsDto.prototype, "RushYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '총 러싱 터치다운', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CareerStatsDto.prototype, "RushTD", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '총 리시빙 야드', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CareerStatsDto.prototype, "ReceivingYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '총 리시빙 터치다운',
        required: false,
        default: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CareerStatsDto.prototype, "ReceivingTD", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '총 태클', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CareerStatsDto.prototype, "Tackles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '총 색', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CareerStatsDto.prototype, "Sacks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '총 수비 터치다운', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CareerStatsDto.prototype, "DefTD", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '총 펀트', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CareerStatsDto.prototype, "Punts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '총 펀트 야드', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CareerStatsDto.prototype, "PuntYards", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '총 필드골 성공', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CareerStatsDto.prototype, "FieldGoalMade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '총 필드골 시도', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CareerStatsDto.prototype, "FieldGoalAttempt", void 0);
class StatsDto {
    game;
    season;
    career;
}
exports.StatsDto = StatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '경기 통계', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => GameStatsDto),
    __metadata("design:type", GameStatsDto)
], StatsDto.prototype, "game", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '시즌 통계', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SeasonStatsDto),
    __metadata("design:type", SeasonStatsDto)
], StatsDto.prototype, "season", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '커리어 통계', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CareerStatsDto),
    __metadata("design:type", CareerStatsDto)
], StatsDto.prototype, "career", void 0);
class AchievementDto {
    year;
    title;
    description;
}
exports.AchievementDto = AchievementDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '연도' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AchievementDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '성취 제목' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AchievementDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '성취 설명', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AchievementDto.prototype, "description", void 0);
class CreatePlayerNewDto {
    playerKey;
    role;
    account;
    team;
    profile;
    stats;
    achievements;
}
exports.CreatePlayerNewDto = CreatePlayerNewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '선수 고유 키' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlayerNewDto.prototype, "playerKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '역할', required: false, default: 'Player' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlayerNewDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '계정 정보' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AccountDto),
    __metadata("design:type", AccountDto)
], CreatePlayerNewDto.prototype, "account", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '팀 정보' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TeamDto),
    __metadata("design:type", TeamDto)
], CreatePlayerNewDto.prototype, "team", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '프로필 정보' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ProfileDto),
    __metadata("design:type", ProfileDto)
], CreatePlayerNewDto.prototype, "profile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '통계 정보', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => StatsDto),
    __metadata("design:type", StatsDto)
], CreatePlayerNewDto.prototype, "stats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '성취 목록', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AchievementDto),
    __metadata("design:type", Array)
], CreatePlayerNewDto.prototype, "achievements", void 0);
class UpdatePlayerNewDto extends (0, swagger_1.PartialType)(CreatePlayerNewDto) {
}
exports.UpdatePlayerNewDto = UpdatePlayerNewDto;
//# sourceMappingURL=player-new.dto.js.map