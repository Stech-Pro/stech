"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OlAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const base_analyzer_service_1 = require("./base-analyzer.service");
let OlAnalyzerService = class OlAnalyzerService extends base_analyzer_service_1.BaseAnalyzerService {
    async analyzeClips(clips, gameData) {
        console.log(`\n🛡️ OL 분석 시작 - ${clips.length}개 클립`);
        if (clips.length === 0) {
            console.log('⚠️ OL 클립이 없습니다.');
            return { olCount: 0, message: 'OL 클립이 없습니다.' };
        }
        const olStatsMap = new Map();
        for (const clip of clips) {
            this.processClipForOL(clip, olStatsMap, gameData);
        }
        let savedCount = 0;
        const results = [];
        for (const [olKey, olStats] of olStatsMap) {
            this.calculateFinalStats(olStats);
            console.log(`🛡️ OL ${olStats.jerseyNumber}번 (${olStats.teamName}) 최종 스탯:`);
            console.log(`   반칙 수: ${olStats.penalties}`);
            console.log(`   색 허용 수: ${olStats.sacksAllowed}`);
            console.log(`   런 펌블: ${olStats.fumbles}`);
            const saveResult = await this.savePlayerStats(olStats.jerseyNumber, olStats.teamName, 'OL', {
                gamesPlayed: olStats.gamesPlayed,
                penalties: olStats.penalties,
                sacksAllowed: olStats.sacksAllowed,
                fumbles: olStats.fumbles,
            }, gameData);
            if (saveResult.success) {
                savedCount++;
            }
            results.push(saveResult);
        }
        console.log(`✅ OL 분석 완료: ${savedCount}명의 OL 스탯 저장\n`);
        return {
            olCount: savedCount,
            message: `${savedCount}명의 OL 스탯이 분석되었습니다.`,
            results,
        };
    }
    processClipForOL(clip, olStatsMap, gameData) {
        const olPlayers = [];
        if (clip.car?.pos === 'OL') {
            olPlayers.push({ number: clip.car.num, role: 'car' });
        }
        if (clip.car2?.pos === 'OL') {
            olPlayers.push({ number: clip.car2.num, role: 'car2' });
        }
        for (const olPlayer of olPlayers) {
            const olKey = this.getOLKey(olPlayer.number, clip.offensiveTeam, gameData);
            if (!olStatsMap.has(olKey)) {
                olStatsMap.set(olKey, this.initializeOLStats(olPlayer.number, clip.offensiveTeam, gameData));
            }
            const olStats = olStatsMap.get(olKey);
            this.processPlay(clip, olStats);
        }
    }
    processPlay(clip, olStats) {
        const playType = clip.playType?.toUpperCase();
        const significantPlays = clip.significantPlays || [];
        if (playType === 'NONE') {
            const hasPenalty = significantPlays.some((play) => play === 'penalty.home' || play === 'penalty.away');
            if (hasPenalty) {
                olStats.penalties++;
                console.log(`   🚩 OL 반칙!`);
            }
        }
        if (playType === 'SACK') {
            const hasSack = significantPlays.includes('SACK');
            if (hasSack) {
                olStats.sacksAllowed++;
                console.log(`   🔴 OL 색 허용!`);
            }
        }
        if (playType === 'RUN') {
            const hasFumble = significantPlays.includes('FUMBLE');
            if (hasFumble) {
                olStats.fumbles++;
                console.log(`   🏈 OL 런 펌블 (스냅 미스)!`);
            }
        }
    }
    calculateFinalStats(olStats) {
        olStats.gamesPlayed = 1;
    }
    initializeOLStats(jerseyNumber, offensiveTeam, gameData) {
        const teamName = offensiveTeam === 'Home' ? gameData.homeTeam : gameData.awayTeam;
        return {
            jerseyNumber,
            teamName,
            gamesPlayed: 1,
            penalties: 0,
            sacksAllowed: 0,
            fumbles: 0,
        };
    }
    getOLKey(jerseyNumber, offensiveTeam, gameData) {
        const teamName = offensiveTeam === 'Home' ? gameData.homeTeam : gameData.awayTeam;
        return `${teamName}_OL_${jerseyNumber}`;
    }
};
exports.OlAnalyzerService = OlAnalyzerService;
exports.OlAnalyzerService = OlAnalyzerService = __decorate([
    (0, common_1.Injectable)()
], OlAnalyzerService);
//# sourceMappingURL=ol-analyzer.service.js.map