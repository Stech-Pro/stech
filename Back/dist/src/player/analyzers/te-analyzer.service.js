"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const base_analyzer_service_1 = require("./base-analyzer.service");
let TeAnalyzerService = class TeAnalyzerService extends base_analyzer_service_1.BaseAnalyzerService {
    async analyzeClips(clips, gameData) {
        console.log(`\n🎯 TE 분석 시작 - ${clips.length}개 클립`);
        if (clips.length === 0) {
            console.log('⚠️ TE 클립이 없습니다.');
            return { teCount: 0, message: 'TE 클립이 없습니다.' };
        }
        const teStatsMap = new Map();
        for (const clip of clips) {
            this.processClipForTE(clip, teStatsMap, gameData);
        }
        let savedCount = 0;
        const results = [];
        for (const [teKey, teStats] of teStatsMap) {
            this.calculateFinalStats(teStats);
            console.log(`🎯 TE ${teStats.jerseyNumber}번 (${teStats.teamName}) 최종 스탯:`);
            console.log(`   리시빙 타겟: ${teStats.receivingTargets}`);
            console.log(`   리셉션: ${teStats.receptions}`);
            console.log(`   리시빙야드: ${teStats.receivingYards}`);
            console.log(`   평균야드: ${teStats.yardsPerReception}`);
            console.log(`   리시빙TD: ${teStats.receivingTouchdowns}`);
            console.log(`   가장 긴 리셉션: ${teStats.longestReception}`);
            console.log(`   1다운: ${teStats.receivingFirstDowns}`);
            console.log(`   러싱 시도: ${teStats.rushingAttempts}, 야드: ${teStats.rushingYards}`);
            const saveResult = await this.savePlayerStats(teStats.jerseyNumber, teStats.teamName, 'TE', {
                gamesPlayed: teStats.gamesPlayed,
                teReceivingTargets: teStats.receivingTargets,
                teReceptions: teStats.receptions,
                teReceivingYards: teStats.receivingYards,
                teYardsPerReception: teStats.yardsPerReception,
                teReceivingTouchdowns: teStats.receivingTouchdowns,
                teLongestReception: teStats.longestReception,
                teReceivingFirstDowns: teStats.receivingFirstDowns,
                teRushingAttempts: teStats.rushingAttempts,
                frontRushYard: teStats.frontRushYard,
                backRushYard: teStats.backRushYard,
                teRushingYards: teStats.rushingYards,
                teYardsPerCarry: teStats.yardsPerCarry,
                teRushingTouchdowns: teStats.rushingTouchdowns,
                teLongestRush: teStats.longestRush,
                fumbles: teStats.fumbles,
                fumblesLost: teStats.fumblesLost,
            }, gameData);
            if (saveResult.success) {
                savedCount++;
            }
            results.push(saveResult);
        }
        console.log(`✅ TE 분석 완료: ${savedCount}명의 TE 스탯 저장\n`);
        return {
            teCount: savedCount,
            message: `${savedCount}명의 TE 스탯이 분석되었습니다.`,
            results,
        };
    }
    processClipForTE(clip, teStatsMap, gameData) {
        const tePlayers = [];
        if (clip.car?.pos === 'TE') {
            tePlayers.push({ number: clip.car.num, role: 'car' });
        }
        if (clip.car2?.pos === 'TE') {
            tePlayers.push({ number: clip.car2.num, role: 'car2' });
        }
        for (const tePlayer of tePlayers) {
            const teKey = this.getTEKey(tePlayer.number, clip.offensiveTeam, gameData);
            if (!teStatsMap.has(teKey)) {
                teStatsMap.set(teKey, this.initializeTEStats(tePlayer.number, clip.offensiveTeam, gameData));
            }
            const teStats = teStatsMap.get(teKey);
            this.processPlay(clip, teStats);
        }
    }
    processPlay(clip, teStats) {
        const playType = clip.playType?.toUpperCase();
        const gainYard = clip.gainYard || 0;
        const significantPlays = clip.significantPlays || [];
        if (playType === 'PASS') {
            teStats.receivingTargets++;
            const isIncomplete = significantPlays.includes('INCOMP');
            if (!isIncomplete) {
                teStats.receptions++;
                teStats.receivingYards += gainYard;
                if (teStats.receptions === 1 || gainYard > teStats.longestReception) {
                    teStats.longestReception = gainYard;
                }
                if (significantPlays.includes('1STDOWN')) {
                    teStats.receivingFirstDowns++;
                }
            }
        }
        if (playType === 'NOPASS') {
            teStats.receivingTargets++;
            console.log(`   📊 TE NOPASS 타겟 +1 (총: ${teStats.receivingTargets})`);
        }
        if (playType === 'RUN') {
            teStats.rushingAttempts++;
            const hasTFL = significantPlays.some((play) => play === 'TFL');
            const hasSAFETY = significantPlays.some((play) => play === 'SAFETY');
            if (hasTFL || hasSAFETY) {
                teStats.backRushYard += Math.abs(gainYard);
            }
            else {
                teStats.frontRushYard += gainYard;
            }
            if (gainYard > teStats.longestRush) {
                teStats.longestRush = gainYard;
            }
        }
        if (significantPlays.includes('FUMBLERECDEF')) {
            teStats.fumblesLost++;
        }
        this.processSignificantPlays(clip, teStats, playType);
    }
    processTouchdown(stats, playType) {
        if (playType === 'PASS') {
            stats.receivingTouchdowns++;
            console.log(`   🏈 리시빙 터치다운!`);
        }
        else if (playType === 'RUN') {
            stats.rushingTouchdowns++;
            console.log(`   🏈 러싱 터치다운!`);
        }
    }
    calculateFinalStats(teStats) {
        teStats.rushingYards = teStats.frontRushYard - teStats.backRushYard;
        teStats.yardsPerCarry =
            teStats.rushingAttempts > 0
                ? Math.round((teStats.rushingYards / teStats.rushingAttempts) * 10) / 10
                : 0;
        teStats.yardsPerReception =
            teStats.receptions > 0
                ? Math.round((teStats.receivingYards / teStats.receptions) * 10) / 10
                : 0;
        teStats.gamesPlayed = 1;
    }
    initializeTEStats(jerseyNumber, offensiveTeam, gameData) {
        const teamName = offensiveTeam === 'Home' ? gameData.homeTeam : gameData.awayTeam;
        return {
            jerseyNumber,
            teamName,
            gamesPlayed: 1,
            receivingTargets: 0,
            receptions: 0,
            receivingYards: 0,
            yardsPerReception: 0,
            receivingTouchdowns: 0,
            longestReception: 0,
            receivingFirstDowns: 0,
            rushingAttempts: 0,
            frontRushYard: 0,
            backRushYard: 0,
            rushingYards: 0,
            yardsPerCarry: 0,
            rushingTouchdowns: 0,
            longestRush: 0,
            fumbles: 0,
            fumblesLost: 0,
        };
    }
    getTEKey(jerseyNumber, offensiveTeam, gameData) {
        const teamName = offensiveTeam === 'Home' ? gameData.homeTeam : gameData.awayTeam;
        return `${teamName}_TE_${jerseyNumber}`;
    }
};
exports.TeAnalyzerService = TeAnalyzerService;
exports.TeAnalyzerService = TeAnalyzerService = __decorate([
    (0, common_1.Injectable)()
], TeAnalyzerService);
//# sourceMappingURL=te-analyzer.service.js.map