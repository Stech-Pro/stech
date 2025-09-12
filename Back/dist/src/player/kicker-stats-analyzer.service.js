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
exports.KickerStatsAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const player_schema_1 = require("../schemas/player.schema");
let KickerStatsAnalyzerService = class KickerStatsAnalyzerService {
    playerModel;
    constructor(playerModel) {
        this.playerModel = playerModel;
    }
    async analyzeKickerStats(clips, playerId) {
        console.log(`🔧 간단 K 분석기: 선수 ${playerId}번의 ${clips.length}개 클립 처리`);
        const dummyStats = {
            gamesPlayed: 1,
            fieldGoalsMade: Math.floor(Math.random() * 3) + 1,
            fieldGoalAttempts: Math.floor(Math.random() * 4) + 2,
            fieldGoalPercentage: 0,
            longestFieldGoal: Math.floor(Math.random() * 20) + 35,
            extraPointsMade: Math.floor(Math.random() * 4) + 1,
            extraPointAttempts: Math.floor(Math.random() * 5) + 1,
            extraPointPercentage: 0,
        };
        dummyStats.fieldGoalPercentage =
            dummyStats.fieldGoalAttempts > 0
                ? Math.round((dummyStats.fieldGoalsMade / dummyStats.fieldGoalAttempts) * 100)
                : 0;
        dummyStats.extraPointPercentage =
            dummyStats.extraPointAttempts > 0
                ? Math.round((dummyStats.extraPointsMade / dummyStats.extraPointAttempts) * 100)
                : 0;
        console.log(`✅ K 더미 스탯 생성 완료: ${dummyStats.fieldGoalsMade}/${dummyStats.fieldGoalAttempts} FG`);
        return dummyStats;
    }
};
exports.KickerStatsAnalyzerService = KickerStatsAnalyzerService;
exports.KickerStatsAnalyzerService = KickerStatsAnalyzerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(player_schema_1.Player.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], KickerStatsAnalyzerService);
//# sourceMappingURL=kicker-stats-analyzer.service.js.map