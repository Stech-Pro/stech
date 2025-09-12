"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const base_analyzer_service_1 = require("./base-analyzer.service");
let WrAnalyzerService = class WrAnalyzerService extends base_analyzer_service_1.BaseAnalyzerService {
    async analyzeClips(clips, gameData) {
        console.log(`\n📡 WR 분석 시작 - ${clips.length}개 클립`);
        if (clips.length === 0) {
            console.log('⚠️ WR 클립이 없습니다.');
            return { wrCount: 0, message: 'WR 클립이 없습니다.' };
        }
        const wrStatsMap = new Map();
        const processedClipKeys = new Set();
        for (const clip of clips) {
            this.processClipForWR(clip, wrStatsMap, gameData, processedClipKeys);
        }
        let savedCount = 0;
        const results = [];
        for (const [wrKey, wrStats] of wrStatsMap) {
            this.calculateFinalStats(wrStats);
            console.log(`📡 WR ${wrStats.jerseyNumber}번 (${wrStats.teamName}) 최종 스탯:`);
            console.log(`   리시빙 타겟: ${wrStats.receivingTargets}`);
            console.log(`   리셉션: ${wrStats.receptions}`);
            console.log(`   리시빙야드: ${wrStats.receivingYards}`);
            console.log(`   평균야드: ${wrStats.yardsPerReception}`);
            console.log(`   리시빙TD: ${wrStats.receivingTouchdowns}`);
            console.log(`   가장 긴 리셉션: ${wrStats.longestReception}`);
            console.log(`   1다운: ${wrStats.receivingFirstDowns}`);
            console.log(`   러싱 시도: ${wrStats.rushingAttempts}, 야드: ${wrStats.rushingYards}`);
            console.log(`   펌블: 총 ${wrStats.fumbles}개 (패스: ${wrStats.passingFumbles}, 런: ${wrStats.rushingFumbles})`);
            console.log(`   펌블 턴오버: 총 ${wrStats.fumblesLost}개 (패스: ${wrStats.passingFumblesLost}, 런: ${wrStats.rushingFumblesLost})`);
            console.log(`   킥오프 리턴: ${wrStats.kickoffReturn}, 야드: ${wrStats.kickoffReturnYard}`);
            console.log(`   펀트 리턴: ${wrStats.puntReturn}, 야드: ${wrStats.puntReturnYard}`);
            const saveResult = await this.savePlayerStats(wrStats.jerseyNumber, wrStats.teamName, 'WR', {
                gamesPlayed: wrStats.gamesPlayed,
                wrReceivingTargets: wrStats.receivingTargets,
                wrReceptions: wrStats.receptions,
                wrReceivingYards: wrStats.receivingYards,
                wrYardsPerReception: wrStats.yardsPerReception,
                wrReceivingTouchdowns: wrStats.receivingTouchdowns,
                wrLongestReception: wrStats.longestReception,
                wrReceivingFirstDowns: wrStats.receivingFirstDowns,
                wrRushingAttempts: wrStats.rushingAttempts,
                wrRushingYards: wrStats.rushingYards,
                wrYardsPerCarry: wrStats.yardsPerCarry,
                wrRushingTouchdowns: wrStats.rushingTouchdowns,
                wrLongestRush: wrStats.longestRush,
                fumbles: wrStats.fumbles,
                fumblesLost: wrStats.fumblesLost,
                passingFumbles: wrStats.passingFumbles,
                rushingFumbles: wrStats.rushingFumbles,
                passingFumblesLost: wrStats.passingFumblesLost,
                rushingFumblesLost: wrStats.rushingFumblesLost,
                kickReturns: wrStats.kickoffReturn,
                kickReturnYards: wrStats.kickoffReturnYard,
                yardsPerKickReturn: wrStats.yardPerKickoffReturn,
                puntReturns: wrStats.puntReturn,
                puntReturnYards: wrStats.puntReturnYard,
                yardsPerPuntReturn: wrStats.yardPerPuntReturn,
                returnTouchdowns: wrStats.returnTouchdown,
            }, gameData);
            if (saveResult.success) {
                savedCount++;
            }
            results.push(saveResult);
        }
        console.log(`✅ WR 분석 완료: ${savedCount}명의 WR 스탯 저장\n`);
        return {
            wrCount: savedCount,
            message: `${savedCount}명의 WR 스탯이 분석되었습니다.`,
            results,
        };
    }
    processClipForWR(clip, wrStatsMap, gameData, processedClipKeys) {
        const wrPlayers = [];
        if (clip.car?.pos === 'WR') {
            wrPlayers.push({ number: clip.car.num, role: 'car' });
        }
        if (clip.car2?.pos === 'WR') {
            wrPlayers.push({ number: clip.car2.num, role: 'car2' });
        }
        for (const wrPlayer of wrPlayers) {
            const wrKey = this.getWRKey(wrPlayer.number, clip.offensiveTeam, gameData);
            if (!wrStatsMap.has(wrKey)) {
                wrStatsMap.set(wrKey, this.initializeWRStats(wrPlayer.number, clip.offensiveTeam, gameData));
            }
            const wrStats = wrStatsMap.get(wrKey);
            this.processPlay(clip, wrStats, processedClipKeys);
        }
    }
    processPlay(clip, wrStats, processedClipKeys) {
        const playType = clip.playType?.toUpperCase();
        const gainYard = clip.gainYard || 0;
        const significantPlays = clip.significantPlays || [];
        if (playType === 'PASS') {
            const hasFumbleRecOff = significantPlays.includes('FUMBLERECOFF');
            const hasTurnover = significantPlays.includes('FUMBLERECDEF') &&
                significantPlays.includes('TURNOVER');
            if (!hasFumbleRecOff && !hasTurnover) {
                wrStats.receivingTargets++;
                const isIncomplete = significantPlays.includes('INCOMP');
                if (!isIncomplete) {
                    wrStats.receptions++;
                    wrStats.receivingYards += gainYard;
                    if (wrStats.receptions === 1 || gainYard > wrStats.longestReception) {
                        wrStats.longestReception = gainYard;
                    }
                    if (clip.toGoYard && gainYard >= clip.toGoYard) {
                        wrStats.receivingFirstDowns++;
                    }
                }
            }
        }
        if (playType === 'NOPASS') {
            wrStats.receivingTargets++;
        }
        if (playType === 'RUN') {
            const hasFumbleRecOff = significantPlays.includes('FUMBLERECOFF');
            const hasTurnover = significantPlays.includes('FUMBLERECDEF') &&
                significantPlays.includes('TURNOVER');
            if (!hasFumbleRecOff && !hasTurnover) {
                wrStats.rushingAttempts++;
                const hasTFL = significantPlays.some((play) => play === 'TFL');
                const hasSAFETY = significantPlays.some((play) => play === 'SAFETY');
                if (hasTFL || hasSAFETY) {
                    wrStats.backRushYard += Math.abs(gainYard);
                }
                else {
                    wrStats.frontRushYard += gainYard;
                }
                if (gainYard > wrStats.longestRush) {
                    wrStats.longestRush = gainYard;
                }
            }
        }
        if (playType === 'RETURN') {
            const hasKickoff = significantPlays.some((play) => play === 'KICKOFF');
            const hasPunt = significantPlays.some((play) => play === 'PUNT');
            if (hasKickoff) {
                wrStats.kickoffReturn++;
                wrStats.kickoffReturnYard += gainYard;
            }
            if (hasPunt) {
                wrStats.puntReturn++;
                wrStats.puntReturnYard += gainYard;
                if (gainYard > (wrStats.longestPuntReturn || 0)) {
                    wrStats.longestPuntReturn = gainYard;
                    console.log(`   🟡 WR 펀트 리턴: ${gainYard}야드 (신기록!)`);
                }
                else {
                    console.log(`   🟡 WR 펀트 리턴: ${gainYard}야드`);
                }
                if (significantPlays.includes('TOUCHDOWN')) {
                    wrStats.puntReturnTouchdowns =
                        (wrStats.puntReturnTouchdowns || 0) + 1;
                    console.log(`   🏆 WR 펀트 리턴 터치다운!`);
                }
            }
        }
        const fumbleKey = `${clip.clipKey}_FUMBLE`;
        const hasFumble = significantPlays.some((play) => play?.trim() === 'FUMBLE');
        const hasFumbleRecOff = significantPlays.some((play) => play?.trim() === 'FUMBLERECOFF');
        const hasFumbleRecDef = significantPlays.some((play) => play?.trim() === 'FUMBLERECDEF');
        if (hasFumble && !hasFumbleRecOff && !processedClipKeys.has(fumbleKey)) {
            processedClipKeys.add(fumbleKey);
            wrStats.fumbles++;
            console.log(`   🔥 펌블 카운트: clipKey=${clip.clipKey}, playType=${playType}`);
            if (playType === 'PASS') {
                wrStats.passingFumbles++;
                console.log(`   📡 패스 펌블 +1 (총: ${wrStats.passingFumbles})`);
            }
            else if (playType === 'RUN') {
                wrStats.rushingFumbles++;
                console.log(`   🏃 런 펌블 +1 (총: ${wrStats.rushingFumbles})`);
            }
        }
        if (playType === 'PASS' && hasFumble && hasFumbleRecDef) {
            wrStats.fumblesLost++;
            wrStats.passingFumblesLost++;
            console.log(`   💔 패스 펌블 턴오버 +1`);
        }
        if (playType === 'RUN' && hasFumble && hasFumbleRecDef) {
            wrStats.fumblesLost++;
            wrStats.rushingFumblesLost++;
            console.log(`   💔 런 펌블 턴오버 +1`);
        }
        if (significantPlays.includes('TOUCHDOWN')) {
            this.processTouchdown(wrStats, playType);
        }
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
        else if (playType === 'RETURN') {
            stats.returnTouchdown++;
            console.log(`   🏈 리턴 터치다운!`);
        }
    }
    calculateFinalStats(wrStats) {
        wrStats.rushingYards = wrStats.frontRushYard - wrStats.backRushYard;
        wrStats.yardsPerCarry =
            wrStats.rushingAttempts > 0
                ? Math.round((wrStats.rushingYards / wrStats.rushingAttempts) * 10) / 10
                : 0;
        wrStats.yardsPerReception =
            wrStats.receptions > 0
                ? Math.round((wrStats.receivingYards / wrStats.receptions) * 10) / 10
                : 0;
        wrStats.yardPerKickoffReturn =
            wrStats.kickoffReturn > 0
                ? Math.round((wrStats.kickoffReturnYard / wrStats.kickoffReturn) * 10) /
                    10
                : 0;
        wrStats.yardPerPuntReturn =
            wrStats.puntReturn > 0
                ? Math.round((wrStats.puntReturnYard / wrStats.puntReturn) * 10) / 10
                : 0;
        wrStats.gamesPlayed = 1;
    }
    initializeWRStats(jerseyNumber, offensiveTeam, gameData) {
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
            passingFumbles: 0,
            rushingFumbles: 0,
            passingFumblesLost: 0,
            rushingFumblesLost: 0,
            kickoffReturn: 0,
            kickoffReturnYard: 0,
            yardPerKickoffReturn: 0,
            puntReturn: 0,
            puntReturnYard: 0,
            yardPerPuntReturn: 0,
            returnTouchdown: 0,
            puntReturnTouchdowns: 0,
            longestPuntReturn: 0,
        };
    }
    getWRKey(jerseyNumber, offensiveTeam, gameData) {
        const teamName = offensiveTeam === 'Home' ? gameData.homeTeam : gameData.awayTeam;
        return `${teamName}_WR_${jerseyNumber}`;
    }
};
exports.WrAnalyzerService = WrAnalyzerService;
exports.WrAnalyzerService = WrAnalyzerService = __decorate([
    (0, common_1.Injectable)()
], WrAnalyzerService);
//# sourceMappingURL=wr-analyzer.service.js.map