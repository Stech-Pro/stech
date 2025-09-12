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
exports.GameDataDto = exports.GameScoreDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const new_clip_dto_1 = require("./new-clip.dto");
class GameScoreDto {
    home;
    away;
}
exports.GameScoreDto = GameScoreDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 6, description: '홈팀 점수' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GameScoreDto.prototype, "home", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 27, description: '어웨이팀 점수' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GameScoreDto.prototype, "away", void 0);
class GameDataDto {
    gameKey;
    date;
    type;
    score;
    region;
    location;
    homeTeam;
    awayTeam;
    Clips;
}
exports.GameDataDto = GameDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'HFHY20240907', description: '게임 키' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GameDataDto.prototype, "gameKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-09-07(토) 16:00',
        description: '경기 날짜 및 시간',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GameDataDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'League', description: '경기 타입' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GameDataDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: GameScoreDto, description: '게임 스코어' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => GameScoreDto),
    __metadata("design:type", GameScoreDto)
], GameDataDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Seoul', description: '지역' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GameDataDto.prototype, "region", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '서울대 운동장', description: '경기장' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GameDataDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'HFBlackKnights', description: '홈팀명' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GameDataDto.prototype, "homeTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'HYLions', description: '어웨이팀명' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GameDataDto.prototype, "awayTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [new_clip_dto_1.NewClipDto],
        description: '클립 데이터 배열 (Clips 또는 clips 필드명 모두 지원)',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => new_clip_dto_1.NewClipDto),
    __metadata("design:type", Array)
], GameDataDto.prototype, "Clips", void 0);
//# sourceMappingURL=game-data.dto.js.map