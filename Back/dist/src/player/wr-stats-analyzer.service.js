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
exports.WrStatsAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const player_schema_1 = require("../schemas/player.schema");
let WrStatsAnalyzerService = class WrStatsAnalyzerService {
    playerModel;
    constructor(playerModel) {
        this.playerModel = playerModel;
    }
    async analyzeWrStats(clips, playerId) {
        console.log(`🔧 간단 WR 분석기: 선수 ${playerId}번의 ${clips.length}개 클립 처리`);
        const dummyStats = {
            gamesPlayed: 1,
            receivingTargets: Math.floor(Math.random() * 10) + 5,
            receptions: Math.floor(Math.random() * 8) + 3,
            receivingYards: Math.floor(Math.random() * 80) + 30,
            yardsPerReception: 0,
            receivingTouchdowns: Math.floor(Math.random() * 2),
            longestReception: Math.floor(Math.random() * 30) + 10,
            receivingFirstDowns: Math.floor(Math.random() * 5) + 1,
            fumbles: Math.floor(Math.random() * 1),
            fumblesLost: Math.floor(Math.random() * 1),
            rushingAttempts: Math.floor(Math.random() * 3),
            rushingYards: Math.floor(Math.random() * 20),
            yardsPerCarry: 0,
            rushingTouchdowns: Math.floor(Math.random() * 1),
            longestRush: Math.floor(Math.random() * 15),
            kickReturns: Math.floor(Math.random() * 2),
            kickReturnYards: Math.floor(Math.random() * 40),
            yardsPerKickReturn: 0,
            puntReturns: Math.floor(Math.random() * 3),
            puntReturnYards: Math.floor(Math.random() * 30),
            yardsPerPuntReturn: 0,
            returnTouchdowns: Math.floor(Math.random() * 1),
        };
        dummyStats.yardsPerReception =
            dummyStats.receptions > 0
                ? Math.round((dummyStats.receivingYards / dummyStats.receptions) * 10) /
                    10
                : 0;
        dummyStats.yardsPerCarry =
            dummyStats.rushingAttempts > 0
                ? Math.round((dummyStats.rushingYards / dummyStats.rushingAttempts) * 10) / 10
                : 0;
        dummyStats.yardsPerKickReturn =
            dummyStats.kickReturns > 0
                ? Math.round((dummyStats.kickReturnYards / dummyStats.kickReturns) * 10) / 10
                : 0;
        dummyStats.yardsPerPuntReturn =
            dummyStats.puntReturns > 0
                ? Math.round((dummyStats.puntReturnYards / dummyStats.puntReturns) * 10) / 10
                : 0;
        console.log(`✅ WR 더미 스탯 생성 완료: ${dummyStats.receptions}리셉션, ${dummyStats.receivingYards}야드`);
        return dummyStats;
    }
};
exports.WrStatsAnalyzerService = WrStatsAnalyzerService;
exports.WrStatsAnalyzerService = WrStatsAnalyzerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(player_schema_1.Player.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], WrStatsAnalyzerService);
//# sourceMappingURL=wr-stats-analyzer.service.js.map