"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const base_analyzer_service_1 = require("./base-analyzer.service");
let PAnalyzerService = class PAnalyzerService extends base_analyzer_service_1.BaseAnalyzerService {
    async analyzeClips(clips, gameData) {
        console.log(`\n🦶 P 분석 시작 - ${clips.length}개 클립`);
        if (clips.length === 0) {
            console.log('⚠️ P 클립이 없습니다.');
            return { pCount: 0, message: 'P 클립이 없습니다.' };
        }
        const pStatsMap = new Map();
        for (const clip of clips) {
            this.processClipForP(clip, pStatsMap, gameData);
        }
        let savedCount = 0;
        const results = [];
        for (const [pKey, pStats] of pStatsMap) {
            this.calculateFinalStats(pStats);
            console.log(`🦶 P ${pStats.jerseyNumber}번 (${pStats.teamName}) 최종 스탯:`);
            console.log(`   펀트 수: ${pStats.puntCount}`);
            console.log(`   펀트 야드: ${pStats.puntYards}`);
            console.log(`   평균 펀트 거리: ${pStats.averagePuntYard}`);
            console.log(`   가장 긴 펀트: ${pStats.longestPunt}`);
            console.log(`   터치백: ${pStats.touchbacks} (${pStats.touchbackPercentage}%)`);
            console.log(`   Inside20: ${pStats.inside20} (${pStats.inside20Percentage}%)`);
            const saveResult = await this.savePlayerStats(pStats.jerseyNumber, pStats.teamName, 'P', {
                gamesPlayed: pStats.gamesPlayed,
                puntCount: pStats.puntCount,
                puntYards: pStats.puntYards,
                averagePuntYard: pStats.averagePuntYard,
                longestPunt: pStats.longestPunt,
                touchbacks: pStats.touchbacks,
                touchbackPercentage: pStats.touchbackPercentage,
                inside20: pStats.inside20,
                inside20Percentage: pStats.inside20Percentage,
            }, gameData);
            if (saveResult.success) {
                savedCount++;
            }
            results.push(saveResult);
        }
        console.log(`✅ P 분석 완료: ${savedCount}명의 P 스탯 저장\n`);
        return {
            pCount: savedCount,
            message: `${savedCount}명의 P 스탯이 분석되었습니다.`,
            results,
        };
    }
    processClipForP(clip, pStatsMap, gameData) {
        if (clip.playType?.toUpperCase() !== 'PUNT') {
            return;
        }
        const pPlayers = [];
        if (clip.car?.pos === 'P') {
            pPlayers.push({ number: clip.car.num, role: 'car' });
        }
        if (clip.car2?.pos === 'P') {
            pPlayers.push({ number: clip.car2.num, role: 'car2' });
        }
        for (const pPlayer of pPlayers) {
            const pKey = this.getPKey(pPlayer.number, clip.offensiveTeam, gameData);
            if (!pStatsMap.has(pKey)) {
                pStatsMap.set(pKey, this.initializePStats(pPlayer.number, clip.offensiveTeam, gameData));
            }
            const pStats = pStatsMap.get(pKey);
            this.processPlay(clip, pStats);
        }
    }
    processPlay(clip, pStats) {
        const playType = clip.playType?.toUpperCase();
        const gainYard = clip.gainYard || 0;
        const significantPlays = clip.significantPlays || [];
        if (playType === 'PUNT') {
            const hasFumble = significantPlays.includes('FUMBLE');
            if (!hasFumble) {
                pStats.puntCount++;
                pStats.puntYards += gainYard;
                if (gainYard > pStats.longestPunt) {
                    pStats.longestPunt = gainYard;
                }
                if (clip.end.side === 'OPP' && clip.end.yard === 0) {
                    pStats.touchbacks++;
                    console.log(`   🏈 터치백! (OPP 0)`);
                }
                if (clip.end.side === 'OPP' &&
                    clip.end.yard >= 1 &&
                    clip.end.yard <= 20) {
                    pStats.inside20++;
                    console.log(`   🎯 Inside20! (${clip.end.yard}야드)`);
                }
                console.log(`   🦶 펀트: ${gainYard}야드 (end: ${clip.end.side} ${clip.end.yard})`);
            }
            else {
                console.log(`   🔄 FUMBLE 감지: 펀트 스탯에서 제외`);
            }
        }
    }
    calculateFinalStats(pStats) {
        pStats.averagePuntYard =
            pStats.puntCount > 0
                ? Math.round((pStats.puntYards / pStats.puntCount) * 10) / 10
                : 0;
        pStats.touchbackPercentage =
            pStats.puntCount > 0
                ? Math.round((pStats.touchbacks / pStats.puntCount) * 100 * 10) / 10
                : 0;
        pStats.inside20Percentage =
            pStats.puntCount > 0
                ? Math.round((pStats.inside20 / pStats.puntCount) * 100 * 10) / 10
                : 0;
        pStats.gamesPlayed = 1;
    }
    initializePStats(jerseyNumber, offensiveTeam, gameData) {
        const teamName = offensiveTeam === 'Home' ? gameData.homeTeam : gameData.awayTeam;
        return {
            jerseyNumber,
            teamName,
            gamesPlayed: 1,
            puntCount: 0,
            puntYards: 0,
            averagePuntYard: 0,
            longestPunt: 0,
            touchbacks: 0,
            touchbackPercentage: 0,
            inside20: 0,
            inside20Percentage: 0,
        };
    }
    getPKey(jerseyNumber, offensiveTeam, gameData) {
        const teamName = offensiveTeam === 'Home' ? gameData.homeTeam : gameData.awayTeam;
        return `${teamName}_P_${jerseyNumber}`;
    }
};
exports.PAnalyzerService = PAnalyzerService;
exports.PAnalyzerService = PAnalyzerService = __decorate([
    (0, common_1.Injectable)()
], PAnalyzerService);
//# sourceMappingURL=p-analyzer.service.js.map