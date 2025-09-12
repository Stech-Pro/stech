"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const base_analyzer_service_1 = require("./base-analyzer.service");
let KAnalyzerService = class KAnalyzerService extends base_analyzer_service_1.BaseAnalyzerService {
    async analyzeClips(clips, gameData) {
        console.log(`\n🦶 키커 분석 시작 - ${clips.length}개 클립`);
        if (clips.length === 0) {
            console.log('⚠️ 키커 클립이 없습니다.');
            return { kCount: 0, message: '키커 클립이 없습니다.' };
        }
        const kStatsMap = new Map();
        for (const clip of clips) {
            this.processClipForK(clip, kStatsMap, gameData);
        }
        let savedCount = 0;
        const results = [];
        for (const [kKey, kStats] of kStatsMap) {
            this.calculateFinalStats(kStats);
            console.log(`🦶 키커 ${kStats.jerseyNumber}번 (${kStats.teamName}) 최종 스탯:`);
            console.log(`   필드골: ${kStats.fieldGoalsMade}/${kStats.fieldGoalsAttempted} (${kStats.fieldGoalPercentage}%)`);
            console.log(`   가장 긴 필드골: ${kStats.longestFieldGoal}야드`);
            console.log(`   평균 필드골: ${kStats.averageFieldGoalYard}야드`);
            console.log(`   PAT: ${kStats.extraPointsMade}/${kStats.extraPointsAttempted}`);
            console.log(`   거리별 필드골 (성공-시도):`);
            console.log(`     1-19야드: ${kStats.fieldGoals1To19}-${kStats.fieldGoalsAttempted1To19}`);
            console.log(`     20-29야드: ${kStats.fieldGoals20To29}-${kStats.fieldGoalsAttempted20To29}`);
            console.log(`     30-39야드: ${kStats.fieldGoals30To39}-${kStats.fieldGoalsAttempted30To39}`);
            console.log(`     40-49야드: ${kStats.fieldGoals40To49}-${kStats.fieldGoalsAttempted40To49}`);
            console.log(`     50+야드: ${kStats.fieldGoals50Plus}-${kStats.fieldGoalsAttempted50Plus}`);
            try {
                console.log(`💾 키커 ${kStats.jerseyNumber}번 (${kStats.teamName}) 저장 시도 시작...`);
                const saveResult = await this.savePlayerStats(kStats.jerseyNumber, kStats.teamName, 'K', {
                    gamesPlayed: kStats.gamesPlayed,
                    fieldGoalsAttempted: kStats.fieldGoalsAttempted,
                    fieldGoalsMade: kStats.fieldGoalsMade,
                    fieldGoalPercentage: kStats.fieldGoalPercentage,
                    longestFieldGoal: kStats.longestFieldGoal,
                    extraPointsAttempted: kStats.extraPointsAttempted,
                    extraPointsMade: kStats.extraPointsMade,
                }, gameData);
                if (saveResult.success) {
                    savedCount++;
                    console.log(`✅ 키커 저장 성공:`, saveResult.message);
                }
                else {
                    console.error(`❌ 키커 저장 실패:`, saveResult.message);
                }
                results.push(saveResult);
            }
            catch (error) {
                console.error(`💥 키커 저장 중 예외 발생:`, error);
                results.push({
                    success: false,
                    message: `키커 ${kStats.jerseyNumber}번 저장 중 예외: ${error.message}`,
                });
            }
        }
        console.log(`✅ 키커 분석 완료: ${savedCount}명의 키커 스탯 저장\n`);
        return {
            kCount: savedCount,
            message: `${savedCount}명의 키커 스탯이 분석되었습니다.`,
            results,
        };
    }
    processClipForK(clip, kStatsMap, gameData) {
        const kPlayers = [];
        if (clip.car?.pos === 'K') {
            kPlayers.push({ number: clip.car.num, role: 'car' });
        }
        if (clip.car2?.pos === 'K') {
            kPlayers.push({ number: clip.car2.num, role: 'car2' });
        }
        for (const kPlayer of kPlayers) {
            const kKey = this.getKKey(kPlayer.number, clip.offensiveTeam, gameData);
            if (!kStatsMap.has(kKey)) {
                kStatsMap.set(kKey, this.initializeKStats(kPlayer.number, clip.offensiveTeam, gameData));
            }
            const kStats = kStatsMap.get(kKey);
            this.processPlay(clip, kStats);
        }
    }
    processPlay(clip, kStats) {
        const playType = clip.playType?.toUpperCase();
        const gainYard = clip.gainYard || 0;
        const significantPlays = clip.significantPlays || [];
        if (playType === 'FG') {
            kStats.fieldGoalsAttempted++;
            const actualFieldGoalDistance = gainYard + 17;
            this.categorizeFieldGoalAttempt(actualFieldGoalDistance, kStats);
            if (significantPlays.includes('FIELDGOALGOOD')) {
                kStats.fieldGoalsMade++;
                kStats.totalFieldGoalYard += actualFieldGoalDistance;
                if (actualFieldGoalDistance > kStats.longestFieldGoal) {
                    kStats.longestFieldGoal = actualFieldGoalDistance;
                }
                this.categorizeFieldGoalMade(actualFieldGoalDistance, kStats);
                console.log(`   🎯 필드골 성공: ${actualFieldGoalDistance}야드 (라인: ${gainYard}야드)`);
            }
            else {
                console.log(`   ❌ 필드골 실패: ${actualFieldGoalDistance}야드 (라인: ${gainYard}야드)`);
            }
        }
        if (playType === 'PAT') {
            kStats.extraPointsAttempted++;
            if (significantPlays.includes('PATGOOD')) {
                kStats.extraPointsMade++;
                console.log(`   ✅ PAT 성공`);
            }
            else if (significantPlays.includes('PATNOGOOD')) {
                console.log(`   ❌ PAT 실패`);
            }
        }
        this.processSignificantPlays(clip, kStats, playType);
    }
    categorizeFieldGoalAttempt(distance, kStats) {
        if (distance >= 1 && distance <= 19) {
            kStats.fieldGoalsAttempted1To19++;
        }
        else if (distance >= 20 && distance <= 29) {
            kStats.fieldGoalsAttempted20To29++;
        }
        else if (distance >= 30 && distance <= 39) {
            kStats.fieldGoalsAttempted30To39++;
        }
        else if (distance >= 40 && distance <= 49) {
            kStats.fieldGoalsAttempted40To49++;
        }
        else if (distance >= 50) {
            kStats.fieldGoalsAttempted50Plus++;
        }
    }
    categorizeFieldGoalMade(distance, kStats) {
        if (distance >= 1 && distance <= 19) {
            kStats.fieldGoals1To19++;
        }
        else if (distance >= 20 && distance <= 29) {
            kStats.fieldGoals20To29++;
        }
        else if (distance >= 30 && distance <= 39) {
            kStats.fieldGoals30To39++;
        }
        else if (distance >= 40 && distance <= 49) {
            kStats.fieldGoals40To49++;
        }
        else if (distance >= 50) {
            kStats.fieldGoals50Plus++;
        }
    }
    processTouchdown(stats, playType) {
    }
    calculateFinalStats(kStats) {
        kStats.fieldGoalPercentage =
            kStats.fieldGoalsAttempted > 0
                ? Math.round((kStats.fieldGoalsMade / kStats.fieldGoalsAttempted) * 100)
                : 0;
        kStats.averageFieldGoalYard =
            kStats.fieldGoalsMade > 0
                ? Math.round((kStats.totalFieldGoalYard / kStats.fieldGoalsMade) * 10) /
                    10
                : 0;
        kStats.gamesPlayed = 1;
    }
    initializeKStats(jerseyNumber, offensiveTeam, gameData) {
        const teamName = offensiveTeam === 'Home' ? gameData.homeTeam : gameData.awayTeam;
        return {
            jerseyNumber,
            teamName,
            gamesPlayed: 1,
            fieldGoalsAttempted: 0,
            fieldGoalsMade: 0,
            fieldGoalPercentage: 0,
            longestFieldGoal: 0,
            totalFieldGoalYard: 0,
            averageFieldGoalYard: 0,
            fieldGoals1To19: 0,
            fieldGoals20To29: 0,
            fieldGoals30To39: 0,
            fieldGoals40To49: 0,
            fieldGoals50Plus: 0,
            fieldGoalsAttempted1To19: 0,
            fieldGoalsAttempted20To29: 0,
            fieldGoalsAttempted30To39: 0,
            fieldGoalsAttempted40To49: 0,
            fieldGoalsAttempted50Plus: 0,
            extraPointsAttempted: 0,
            extraPointsMade: 0,
        };
    }
    getKKey(jerseyNumber, offensiveTeam, gameData) {
        const teamName = offensiveTeam === 'Home' ? gameData.homeTeam : gameData.awayTeam;
        return `${teamName}_K_${jerseyNumber}`;
    }
};
exports.KAnalyzerService = KAnalyzerService;
exports.KAnalyzerService = KAnalyzerService = __decorate([
    (0, common_1.Injectable)()
], KAnalyzerService);
//# sourceMappingURL=k-analyzer.service.js.map