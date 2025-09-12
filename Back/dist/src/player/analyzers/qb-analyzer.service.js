"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QbAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const base_analyzer_service_1 = require("./base-analyzer.service");
let QbAnalyzerService = class QbAnalyzerService extends base_analyzer_service_1.BaseAnalyzerService {
    async analyzeClips(clips, gameData) {
        console.log(`\n🏈 QB 분석 시작 - 총 클립 수: ${clips.length}`);
        const qbStatsMap = new Map();
        for (const clip of clips) {
            await this.analyzeClip(clip, gameData, qbStatsMap);
        }
        const results = [];
        for (const [qbKey, qbStats] of qbStatsMap) {
            this.calculateFinalStats(qbStats);
            const saveResult = await this.savePlayerStats(qbStats.jerseyNumber, qbStats.teamName, 'QB', qbStats, gameData);
            results.push(saveResult);
            console.log(`\n🏈 QB ${qbStats.jerseyNumber}번 (${qbStats.teamName}) 최종 스탯:`);
            console.log(`   패싱: ${qbStats.passingAttempts}시도/${qbStats.passingCompletions}성공 (${qbStats.completionPercentage}%)`);
            console.log(`   패싱야드: ${qbStats.passingYards}, TD: ${qbStats.passingTouchdowns}, INT: ${qbStats.passingInterceptions}`);
            console.log(`   최장패스: ${qbStats.longestPass}야드`);
            console.log(`   러싱: ${qbStats.rushingAttempts}시도, ${qbStats.rushingYards}야드, TD: ${qbStats.rushingTouchdowns}`);
            console.log(`   최장러싱: ${qbStats.longestRush}야드`);
            console.log(`   색: ${qbStats.sacks}, 펌블: ${qbStats.fumbles}`);
        }
        console.log(`\n✅ QB 분석 완료 - ${qbStatsMap.size}명의 QB 처리됨`);
        return {
            success: true,
            message: `${qbStatsMap.size}명의 QB 스탯이 업데이트되었습니다.`,
            qbCount: qbStatsMap.size,
            results,
        };
    }
    async analyzeClip(clip, gameData, qbStatsMap) {
        const offensiveTeam = clip.offensiveTeam === 'Home' ? gameData.homeTeam : gameData.awayTeam;
        let qb = null;
        if (clip.car?.pos === 'QB') {
            qb = clip.car;
        }
        else if (clip.car2?.pos === 'QB') {
            qb = { num: clip.car2.num, pos: clip.car2.pos };
        }
        if (!qb)
            return;
        const qbKey = `${offensiveTeam}-${qb.num}`;
        if (!qbStatsMap.has(qbKey)) {
            qbStatsMap.set(qbKey, this.createEmptyQBStats(qb.num, offensiveTeam));
        }
        const qbStats = qbStatsMap.get(qbKey);
        this.processPlay(clip, qbStats);
        console.log(`📡 QB ${qb.num}번 (${offensiveTeam}): ${clip.playType}, ${clip.gainYard}야드`);
    }
    processPlay(clip, qbStats) {
        const playType = clip.playType;
        const gainYard = clip.gainYard;
        if (playType === 'PASS') {
            qbStats.passingAttempts++;
            qbStats.passingCompletions++;
            qbStats.passingYards += gainYard;
            console.log(`🔍 패스 거리 비교: 현재 ${gainYard}야드 vs 기존 최장 ${qbStats.longestPass}야드`);
            if (gainYard > qbStats.longestPass) {
                console.log(`✅ 최장 패스 업데이트: ${qbStats.longestPass} → ${gainYard}`);
                qbStats.longestPass = gainYard;
            }
        }
        else if (playType === 'NOPASS') {
            qbStats.passingAttempts++;
        }
        else if (playType === 'SACK') {
            qbStats.sacks++;
        }
        else if (playType === 'RUN') {
            const hasFumbleRecOff = clip.significantPlays?.includes('FUMBLERECOFF');
            if (!hasFumbleRecOff) {
                qbStats.rushingAttempts++;
                qbStats.rushingYards += gainYard;
                console.log(`🏃 러시 거리 비교: 현재 ${gainYard}야드 vs 기존 최장 ${qbStats.longestRush}야드`);
                if (gainYard > qbStats.longestRush) {
                    console.log(`✅ 최장 러시 업데이트: ${qbStats.longestRush} → ${gainYard}`);
                    qbStats.longestRush = gainYard;
                }
            }
            else {
                console.log(`🔄 FUMBLERECOFF 감지: 러싱 스탯에서 제외`);
            }
        }
        if (playType === 'SACK' && clip.significantPlays) {
            const filteredPlays = [...clip.significantPlays];
            const sackIndex = filteredPlays.indexOf('SACK');
            if (sackIndex !== -1) {
                filteredPlays[sackIndex] = null;
            }
            const modifiedClip = { ...clip, significantPlays: filteredPlays };
            this.processSignificantPlays(modifiedClip, qbStats, playType);
        }
        else {
            this.processSignificantPlays(clip, qbStats, playType);
        }
    }
    processTouchdown(stats, playType) {
        if (playType === 'PASS') {
            stats.passingTouchdowns++;
        }
        else if (playType === 'RUN') {
            stats.rushingTouchdowns++;
        }
    }
    calculateFinalStats(qbStats) {
        qbStats.completionPercentage =
            qbStats.passingAttempts > 0
                ? Math.round((qbStats.passingCompletions / qbStats.passingAttempts) * 100)
                : 0;
        qbStats.yardsPerCarry =
            qbStats.rushingAttempts > 0
                ? Math.round((qbStats.rushingYards / qbStats.rushingAttempts) * 10) / 10
                : 0;
        qbStats.gamesPlayed = 1;
    }
    createEmptyQBStats(jerseyNumber, teamName) {
        return {
            jerseyNumber,
            teamName,
            gamesPlayed: 0,
            passingAttempts: 0,
            passingCompletions: 0,
            completionPercentage: 0,
            passingYards: 0,
            passingTouchdowns: 0,
            passingInterceptions: 0,
            longestPass: 0,
            rushingAttempts: 0,
            rushingYards: 0,
            yardsPerCarry: 0,
            rushingTouchdowns: 0,
            longestRush: 0,
            sacks: 0,
            fumbles: 0,
        };
    }
};
exports.QbAnalyzerService = QbAnalyzerService;
exports.QbAnalyzerService = QbAnalyzerService = __decorate([
    (0, common_1.Injectable)()
], QbAnalyzerService);
//# sourceMappingURL=qb-analyzer.service.js.map