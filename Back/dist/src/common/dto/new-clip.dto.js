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
exports.AnalyzeNewClipsDto = exports.NewGameDto = exports.NewClipDto = exports.NewScoreDto = exports.NumPosDto = exports.NewSideYardDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class NewSideYardDto {
    side;
    yard;
}
exports.NewSideYardDto = NewSideYardDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'OWN',
        description: 'OWN(자진영) 또는 OPP(상대진영)',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NewSideYardDto.prototype, "side", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 20, description: '야드 라인 (0-50)', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], NewSideYardDto.prototype, "yard", void 0);
class NumPosDto {
    num;
    pos;
}
exports.NumPosDto = NumPosDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 88, description: '선수 등번호', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], NumPosDto.prototype, "num", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'QB', description: '포지션', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NumPosDto.prototype, "pos", void 0);
class NewScoreDto {
    home;
    away;
}
exports.NewScoreDto = NewScoreDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, description: '홈팀 점수', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], NewScoreDto.prototype, "home", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 7, description: '어웨이팀 점수', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], NewScoreDto.prototype, "away", void 0);
class NewClipDto {
    clipKey;
    offensiveTeam;
    quarter;
    down;
    toGoYard;
    playType;
    specialTeam;
    start;
    end;
    gainYard;
    car;
    car2;
    tkl;
    tkl2;
    significantPlays;
}
exports.NewClipDto = NewClipDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '12845',
        description: '클립 고유 식별자',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NewClipDto.prototype, "clipKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Home', description: '공격팀', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NewClipDto.prototype, "offensiveTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: '쿼터', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], NewClipDto.prototype, "quarter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1', description: '다운', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NewClipDto.prototype, "down", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, description: '남은 야드', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], NewClipDto.prototype, "toGoYard", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Kickoff',
        description: '플레이 타입',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NewClipDto.prototype, "playType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: '스페셜팀 여부', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NewClipDto.prototype, "specialTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: NewSideYardDto,
        description: '시작 야드',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NewSideYardDto),
    __metadata("design:type", NewSideYardDto)
], NewClipDto.prototype, "start", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: NewSideYardDto,
        description: '종료 야드',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NewSideYardDto),
    __metadata("design:type", NewSideYardDto)
], NewClipDto.prototype, "end", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 10,
        description: '획득 야드 (미리 계산됨)',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], NewClipDto.prototype, "gainYard", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: NumPosDto, description: '첫 번째 선수', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NumPosDto),
    __metadata("design:type", NumPosDto)
], NewClipDto.prototype, "car", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: NumPosDto, description: '두 번째 선수', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NumPosDto),
    __metadata("design:type", NumPosDto)
], NewClipDto.prototype, "car2", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: NumPosDto,
        description: '첫 번째 태클러',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NumPosDto),
    __metadata("design:type", NumPosDto)
], NewClipDto.prototype, "tkl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: NumPosDto,
        description: '두 번째 태클러',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NumPosDto),
    __metadata("design:type", NumPosDto)
], NewClipDto.prototype, "tkl2", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        description: '특별한 플레이들 (고정 4개 배열)',
        example: ['TOUCHDOWN', null, null, null],
        minItems: 4,
        maxItems: 4,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(4),
    (0, class_validator_1.ArrayMaxSize)(4),
    __metadata("design:type", Array)
], NewClipDto.prototype, "significantPlays", void 0);
class NewGameDto {
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
exports.NewGameDto = NewGameDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'KMHY241110',
        description: '게임 키',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NewGameDto.prototype, "gameKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-11-10(수) 10:00',
        description: '날짜 및 시간',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NewGameDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'League', description: '게임 타입', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NewGameDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: NewScoreDto, description: '최종 점수' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NewScoreDto),
    __metadata("design:type", NewScoreDto)
], NewGameDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Seoul', description: '지역', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NewGameDto.prototype, "region", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Hyochang Field',
        description: '장소',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NewGameDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Kookmin Razorbacks',
        description: '홈팀',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NewGameDto.prototype, "homeTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Hanyang Lions',
        description: '어웨이팀',
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NewGameDto.prototype, "awayTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [NewClipDto],
        description: '클립 데이터 배열',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => NewClipDto),
    __metadata("design:type", Array)
], NewGameDto.prototype, "Clips", void 0);
class AnalyzeNewClipsDto {
    clips;
    homeTeam;
    awayTeam;
}
exports.AnalyzeNewClipsDto = AnalyzeNewClipsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [NewClipDto],
        description: '새로운 형식의 클립 데이터 배열',
        example: [
            {
                clipKey: '12845',
                offensiveTeam: 'Home',
                quarter: 1,
                down: '1',
                toGoYard: 10,
                playType: 'Kickoff',
                specialTeam: true,
                start: { side: 'OWN', yard: 20 },
                end: { side: 'OPP', yard: 30 },
                gainYard: 10,
                car: { num: 88, pos: 'QB' },
                car2: { num: null, pos: null },
                tkl: { num: 34, pos: 'WR' },
                tkl2: { num: 11, pos: 'DB' },
                significantPlays: ['TOUCHDOWN', null, null, null],
            },
        ],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => NewClipDto),
    __metadata("design:type", Array)
], AnalyzeNewClipsDto.prototype, "clips", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'HFBlackKnights',
        description: '홈팀 ID (프론트 TEAMS.js의 id 값 사용)',
        required: true,
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalyzeNewClipsDto.prototype, "homeTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'HYLions',
        description: '어웨이팀 ID (프론트 TEAMS.js의 id 값 사용)',
        required: true,
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalyzeNewClipsDto.prototype, "awayTeam", void 0);
//# sourceMappingURL=new-clip.dto.js.map