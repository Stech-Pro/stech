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
exports.SampleSuccessResponseDto = exports.SampleGameDataDto = exports.SampleClipDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class SampleClipDto {
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
exports.SampleClipDto = SampleClipDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '1',
        description: '클립 고유 키',
    }),
    __metadata("design:type", String)
], SampleClipDto.prototype, "clipKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Away',
        description: '공격팀 (Home/Away)',
    }),
    __metadata("design:type", String)
], SampleClipDto.prototype, "offensiveTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 2,
        description: '쿼터',
    }),
    __metadata("design:type", Number)
], SampleClipDto.prototype, "quarter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '4',
        description: '다운',
    }),
    __metadata("design:type", String)
], SampleClipDto.prototype, "down", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 7,
        description: '남은 야드',
    }),
    __metadata("design:type", Number)
], SampleClipDto.prototype, "toGoYard", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'PASS',
        description: '플레이 타입 (PASS, RUN, KICKOFF, PUNT, FG, PAT 등)',
    }),
    __metadata("design:type", String)
], SampleClipDto.prototype, "playType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: '스페셜팀 플레이 여부',
    }),
    __metadata("design:type", Boolean)
], SampleClipDto.prototype, "specialTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { side: 'OPP', yard: 8 },
        description: '시작 위치',
    }),
    __metadata("design:type", Object)
], SampleClipDto.prototype, "start", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { side: 'OPP', yard: 0 },
        description: '종료 위치',
    }),
    __metadata("design:type", Object)
], SampleClipDto.prototype, "end", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 8,
        description: '획득 야드',
    }),
    __metadata("design:type", Number)
], SampleClipDto.prototype, "gainYard", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { num: 33, pos: 'WR' },
        description: '첫 번째 선수 (볼 캐리어)',
    }),
    __metadata("design:type", Object)
], SampleClipDto.prototype, "car", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { num: 15, pos: 'QB' },
        description: '두 번째 선수 (QB, 리시버 등)',
        required: false,
    }),
    __metadata("design:type", Object)
], SampleClipDto.prototype, "car2", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { num: null, pos: null },
        description: '첫 번째 태클러',
        required: false,
    }),
    __metadata("design:type", Object)
], SampleClipDto.prototype, "tkl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { num: null, pos: null },
        description: '두 번째 태클러',
        required: false,
    }),
    __metadata("design:type", Object)
], SampleClipDto.prototype, "tkl2", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['TOUCHDOWN', null, null, null],
        description: '특별한 플레이 배열 (4개 고정)',
        type: [String],
        minItems: 4,
        maxItems: 4,
    }),
    __metadata("design:type", Array)
], SampleClipDto.prototype, "significantPlays", void 0);
class SampleGameDataDto {
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
exports.SampleGameDataDto = SampleGameDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'DGKM240908',
        description: '게임 고유 식별자',
    }),
    __metadata("design:type", String)
], SampleGameDataDto.prototype, "gameKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-09-08(일) 16:00',
        description: '경기 날짜 및 시간',
    }),
    __metadata("design:type", String)
], SampleGameDataDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'League',
        description: '경기 타입',
    }),
    __metadata("design:type", String)
], SampleGameDataDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { home: 0, away: 36 },
        description: '최종 점수',
    }),
    __metadata("design:type", Object)
], SampleGameDataDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Seoul',
        description: '경기 지역',
    }),
    __metadata("design:type", String)
], SampleGameDataDto.prototype, "region", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '서울대학교 종합운동장',
        description: '경기 장소',
    }),
    __metadata("design:type", String)
], SampleGameDataDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'DGTuskers',
        description: '홈팀 이름',
    }),
    __metadata("design:type", String)
], SampleGameDataDto.prototype, "homeTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'KMRazorbacks',
        description: '어웨이팀 이름',
    }),
    __metadata("design:type", String)
], SampleGameDataDto.prototype, "awayTeam", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [SampleClipDto],
        description: '경기 클립 데이터 배열',
    }),
    __metadata("design:type", Array)
], SampleGameDataDto.prototype, "Clips", void 0);
class SampleSuccessResponseDto {
    success;
    message;
    data;
    timestamp;
}
exports.SampleSuccessResponseDto = SampleSuccessResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], SampleSuccessResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '게임 데이터 업로드 및 분석이 완료되었습니다' }),
    __metadata("design:type", String)
], SampleSuccessResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            gameInfo: {
                gameKey: 'DGKM240908',
                date: '2024-09-08(일) 16:00',
                homeTeam: 'DGTuskers',
                awayTeam: 'KMRazorbacks',
                location: '서울대학교 종합운동장',
                finalScore: { home: 0, away: 36 },
                totalClips: 80,
                processedAt: '2024-12-26T10:30:00.000Z',
            },
            playerResults: [
                {
                    playerNumber: 15,
                    success: true,
                    clipsAnalyzed: 12,
                    position: 'QB',
                    stats: {
                        games: 1,
                        passAttempted: 15,
                        passCompletion: 12,
                        passingYards: 180,
                        passingTouchdown: 2,
                    },
                    message: '15번 선수 분석 완료',
                },
                {
                    playerNumber: 33,
                    success: true,
                    clipsAnalyzed: 8,
                    position: 'WR',
                    stats: {
                        games: 1,
                        target: 6,
                        reception: 5,
                        receivingYards: 85,
                        receivingTouchdown: 1,
                    },
                    message: '33번 선수 분석 완료',
                },
            ],
            summary: {
                totalPlayers: 15,
                successfulPlayers: 14,
                failedPlayers: 1,
                totalClipsProcessed: 80,
                invalidClips: 0,
                successRate: 93,
            },
            errors: {
                invalidClips: [],
                failedPlayers: [
                    {
                        playerNumber: 99,
                        error: '해당 선수는 DB에 존재하지 않습니다',
                    },
                ],
            },
        },
    }),
    __metadata("design:type", Object)
], SampleSuccessResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-12-26T10:30:00.000Z' }),
    __metadata("design:type", String)
], SampleSuccessResponseDto.prototype, "timestamp", void 0);
//# sourceMappingURL=game-sample.dto.js.map