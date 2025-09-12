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
exports.DlStatsAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const player_schema_1 = require("../schemas/player.schema");
let DlStatsAnalyzerService = class DlStatsAnalyzerService {
    playerModel;
    constructor(playerModel) {
        this.playerModel = playerModel;
    }
    async analyzeDlStats(clips, playerId) {
        console.log(`🔧 간단 DL 분석기: 선수 ${playerId}번의 ${clips.length}개 클립 처리`);
        const dummyStats = {
            gamesPlayed: 1,
            tackles: Math.floor(Math.random() * 8) + 3,
            sacks: Math.floor(Math.random() * 3),
            tacklesForLoss: Math.floor(Math.random() * 2),
            forcedFumbles: Math.floor(Math.random() * 1),
            fumbleRecovery: Math.floor(Math.random() * 1),
            fumbleRecoveredYards: Math.floor(Math.random() * 10),
            passDefended: Math.floor(Math.random() * 2),
            interception: Math.floor(Math.random() * 1),
            interceptionYards: Math.floor(Math.random() * 15),
            touchdown: Math.floor(Math.random() * 1),
        };
        console.log(`✅ DL 더미 스탯 생성 완료: ${dummyStats.tackles}태클, ${dummyStats.sacks}색`);
        return dummyStats;
    }
};
exports.DlStatsAnalyzerService = DlStatsAnalyzerService;
exports.DlStatsAnalyzerService = DlStatsAnalyzerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(player_schema_1.Player.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], DlStatsAnalyzerService);
//# sourceMappingURL=dl-stats-analyzer.service.js.map