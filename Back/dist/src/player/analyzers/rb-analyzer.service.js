"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const base_analyzer_service_1 = require("./base-analyzer.service");
let RbAnalyzerService = class RbAnalyzerService extends base_analyzer_service_1.BaseAnalyzerService {
    async analyzeClips(clips, gameData) {
        console.log(`\n🏃‍♂️ RB 분석 시작 - ${clips.length}개 클립`);
        if (clips.length === 0) {
            console.log('⚠️ RB 클립이 없습니다.');
            return { rbCount: 0, message: 'RB 클립이 없습니다.' };
        }
        const rbStatsMap = new Map();
        const processedClipKeys = new Set();
        for (const clip of clips) {
            this.processClipForRB(clip, rbStatsMap, gameData, processedClipKeys);
        }
        let savedCount = 0;
        const results = [];
        for (const [rbKey, rbStats] of rbStatsMap) {
            this.calculateFinalStats(rbStats);
            console.log(`🏈 RB ${rbStats.jerseyNumber}번 (${rbStats.teamName}) 최종 스탯:`);
            console.log(`   === 패스 유형 ===`);
            console.log(`   리시빙 타겟: ${rbStats.receivingTargets}`);
            console.log(`   리셉션: ${rbStats.receptions}`);
            console.log(`   리시빙야드: ${rbStats.receivingYards}`);
            console.log(`   평균야드: ${rbStats.yardsPerReception}`);
            console.log(`   리시빙TD: ${rbStats.receivingTouchdowns}`);
            console.log(`   가장 긴 리셉션: ${rbStats.longestReception}`);
            console.log(`   1다운: ${rbStats.receivingFirstDowns}`);
            console.log(`   패스 펌블: ${rbStats.passingFumbles}`);
            console.log(`   패스 펌블 턴오버: ${rbStats.passingFumblesLost}`);
            console.log(`   === 런 유형 ===`);
            console.log(`   러싱 시도: ${rbStats.rushingAttempts}, 야드: ${rbStats.rushingYards}`);
            console.log(`   런 펌블: ${rbStats.rushingFumbles}`);
            console.log(`   런 펌블 턴오버: ${rbStats.rushingFumblesLost}`);
            console.log(`   === 스페셜팀 ===`);
            console.log(`   킥오프 리턴: ${rbStats.kickoffReturn}, 야드: ${rbStats.kickoffReturnYard}`);
            console.log(`   펀트 리턴: ${rbStats.puntReturn}, 야드: ${rbStats.puntReturnYard}`);
            const saveResult = await this.savePlayerStats(rbStats.jerseyNumber, rbStats.teamName, 'RB', {
                gamesPlayed: rbStats.gamesPlayed,
                rbReceivingTargets: rbStats.receivingTargets,
                rbReceptions: rbStats.receptions,
                rbReceivingYards: rbStats.receivingYards,
                rbYardsPerReception: rbStats.yardsPerReception,
                rbReceivingTouchdowns: rbStats.receivingTouchdowns,
                rbLongestReception: rbStats.longestReception,
                rbReceivingFirstDowns: rbStats.receivingFirstDowns,
                rbRushingAttempts: rbStats.rushingAttempts,
                rbRushingYards: rbStats.rushingYards,
                rbYardsPerCarry: rbStats.yardsPerCarry,
                rbRushingTouchdowns: rbStats.rushingTouchdowns,
                rbLongestRush: rbStats.longestRush,
                fumbles: rbStats.fumbles,
                fumblesLost: rbStats.fumblesLost,
                passingFumbles: rbStats.passingFumbles,
                rushingFumbles: rbStats.rushingFumbles,
                passingFumblesLost: rbStats.passingFumblesLost,
                rushingFumblesLost: rbStats.rushingFumblesLost,
                kickReturns: rbStats.kickoffReturn,
                kickReturnYards: rbStats.kickoffReturnYard,
                yardsPerKickReturn: rbStats.yardPerKickoffReturn,
                puntReturns: rbStats.puntReturn,
                puntReturnYards: rbStats.puntReturnYard,
                yardsPerPuntReturn: rbStats.yardPerPuntReturn,
                returnTouchdowns: rbStats.returnTouchdown,
                puntReturnTouchdowns: rbStats.puntReturnTouchdowns,
            }, gameData);
            if (saveResult.success) {
                savedCount++;
            }
            results.push(saveResult);
        }
        console.log(`✅ RB 분석 완료: ${savedCount}명의 RB 스탯 저장\n`);
        return {
            rbCount: savedCount,
            message: `${savedCount}명의 RB 스탯이 분석되었습니다.`,
            results,
        };
    }
    processClipForRB(clip, rbStatsMap, gameData, processedClipKeys) {
        const rbPlayers = [];
        if (clip.car?.pos === 'RB') {
            rbPlayers.push({ number: clip.car.num, role: 'car' });
        }
        if (clip.car2?.pos === 'RB') {
            rbPlayers.push({ number: clip.car2.num, role: 'car2' });
        }
        console.log(`🔍 RB 클립 분석: playType=${clip.playType}, RB선수=${rbPlayers.length}명, significantPlays=${clip.significantPlays?.join(',')}`);
        for (const rbPlayer of rbPlayers) {
            const rbKey = this.getRBKey(rbPlayer.number, clip.offensiveTeam, gameData);
            if (!rbStatsMap.has(rbKey)) {
                rbStatsMap.set(rbKey, this.initializeRBStats(rbPlayer.number, clip.offensiveTeam, gameData));
            }
            const rbStats = rbStatsMap.get(rbKey);
            console.log(`📈 RB ${rbPlayer.number}번 처리 중...`);
            this.processPlay(clip, rbStats, processedClipKeys);
        }
    }
    processPlay(clip, rbStats, processedClipKeys) {
        const playType = clip.playType?.toUpperCase();
        const gainYard = clip.gainYard || 0;
        const significantPlays = clip.significantPlays || [];
        if (playType === 'PASS') {
            const hasFumbleRecOff = significantPlays.includes('FUMBLERECOFF');
            const hasTurnover = significantPlays.includes('FUMBLERECDEF') &&
                significantPlays.includes('TURNOVER');
            if (!hasFumbleRecOff && !hasTurnover) {
                rbStats.receivingTargets++;
                console.log(`   📊 RB 패스 타겟 +1 (총: ${rbStats.receivingTargets})`);
                const isIncomplete = significantPlays.includes('INCOMP');
                if (!isIncomplete) {
                    rbStats.receptions++;
                    rbStats.receivingYards += gainYard;
                    if (rbStats.receptions === 1 || gainYard > rbStats.longestReception) {
                        rbStats.longestReception = gainYard;
                    }
                    if (clip.toGoYard && gainYard >= clip.toGoYard) {
                        rbStats.receivingFirstDowns++;
                    }
                    console.log(`   📡 RB 패스 캐치 +1: ${gainYard}야드 (리셉션: ${rbStats.receptions}, 총야드: ${rbStats.receivingYards})`);
                }
                else {
                    console.log(`   ❌ RB 패스 인컴플리트`);
                }
            }
        }
        if (playType === 'NOPASS') {
            rbStats.receivingTargets++;
            console.log(`   📊 RB NOPASS 타겟 +1 (총: ${rbStats.receivingTargets})`);
        }
        if (playType === 'RUN') {
            const hasFumbleRecOff = significantPlays.includes('FUMBLERECOFF');
            const hasTurnover = significantPlays.includes('FUMBLERECDEF') &&
                significantPlays.includes('TURNOVER');
            if (!hasFumbleRecOff && !hasTurnover) {
                rbStats.rushingAttempts++;
                const hasTFL = significantPlays.some((play) => play === 'TFL');
                const hasSAFETY = significantPlays.some((play) => play === 'SAFETY');
                if (hasTFL || hasSAFETY) {
                    rbStats.backRushYard += Math.abs(gainYard);
                }
                else {
                    rbStats.frontRushYard += gainYard;
                }
                if (gainYard > rbStats.longestRush) {
                    rbStats.longestRush = gainYard;
                }
            }
        }
        if (playType === 'RETURN') {
            const hasKickoff = significantPlays.some((play) => play === 'KICKOFF');
            const hasPunt = significantPlays.some((play) => play === 'PUNT');
            if (hasKickoff) {
                rbStats.kickoffReturn++;
                rbStats.kickoffReturnYard += gainYard;
            }
            if (hasPunt) {
                rbStats.puntReturn++;
                rbStats.puntReturnYard += gainYard;
                if (gainYard > (rbStats.longestPuntReturn || 0)) {
                    rbStats.longestPuntReturn = gainYard;
                    console.log(`   🟡 RB 펀트 리턴: ${gainYard}야드 (신기록!)`);
                }
                else {
                    console.log(`   🟡 RB 펀트 리턴: ${gainYard}야드`);
                }
                if (significantPlays.includes('TOUCHDOWN')) {
                    rbStats.puntReturnTouchdowns =
                        (rbStats.puntReturnTouchdowns || 0) + 1;
                    console.log(`   🏆 RB 펀트 리턴 터치다운!`);
                }
            }
        }
        const fumbleKey = `${clip.clipKey}_FUMBLE`;
        const hasFumble = significantPlays.some((play) => play?.trim() === 'FUMBLE');
        const hasFumbleRecOff = significantPlays.some((play) => play?.trim() === 'FUMBLERECOFF');
        const hasFumbleRecDef = significantPlays.some((play) => play?.trim() === 'FUMBLERECDEF');
        if (hasFumble && !hasFumbleRecOff && !processedClipKeys.has(fumbleKey)) {
            processedClipKeys.add(fumbleKey);
            console.log(`   🔥 펌블 카운트: clipKey=${clip.clipKey}, playType=${playType}`);
            if (playType === 'PASS') {
                rbStats.passingFumbles++;
                console.log(`   📡 패스 펌블 +1 (총: ${rbStats.passingFumbles})`);
            }
            else if (playType === 'RUN') {
                rbStats.rushingFumbles++;
                console.log(`   🏃 런 펌블 +1 (총: ${rbStats.rushingFumbles})`);
            }
        }
        if (playType === 'PASS' && hasFumble && hasFumbleRecDef) {
            rbStats.passingFumblesLost++;
            console.log(`   💔 패스 펌블 턴오버 +1`);
        }
        if (playType === 'RUN' && hasFumble && hasFumbleRecDef) {
            rbStats.rushingFumblesLost++;
            console.log(`   💔 런 펌블 턴오버 +1`);
        }
        if (significantPlays.includes('TOUCHDOWN')) {
            this.processTouchdown(rbStats, playType);
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
    calculateFinalStats(rbStats) {
        rbStats.rushingYards = rbStats.frontRushYard - rbStats.backRushYard;
        rbStats.fumbles = rbStats.passingFumbles + rbStats.rushingFumbles;
        rbStats.fumblesLost =
            rbStats.passingFumblesLost + rbStats.rushingFumblesLost;
        rbStats.yardsPerCarry =
            rbStats.rushingAttempts > 0
                ? Math.round((rbStats.rushingYards / rbStats.rushingAttempts) * 10) / 10
                : 0;
        rbStats.yardsPerReception =
            rbStats.receptions > 0
                ? Math.round((rbStats.receivingYards / rbStats.receptions) * 10) / 10
                : 0;
        rbStats.yardPerKickoffReturn =
            rbStats.kickoffReturn > 0
                ? Math.round((rbStats.kickoffReturnYard / rbStats.kickoffReturn) * 10) /
                    10
                : 0;
        rbStats.yardPerPuntReturn =
            rbStats.puntReturn > 0
                ? Math.round((rbStats.puntReturnYard / rbStats.puntReturn) * 10) / 10
                : 0;
        rbStats.gamesPlayed = 1;
    }
    initializeRBStats(jerseyNumber, offensiveTeam, gameData) {
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
    processDefensiveFumbleForces(clip, gameData) {
        if (!clip.significantPlays?.includes('FUMBLE'))
            return;
        const defensiveTeam = clip.offensiveTeam === 'Home' ? 'Away' : 'Home';
        const tacklers = [clip.tkl, clip.tkl2].filter((t) => t?.num && t?.pos);
        for (const tackler of tacklers) {
            if (tackler.pos && ['DL', 'LB', 'DB'].includes(tackler.pos)) {
                console.log(`   💪 ${tackler.pos} ${tackler.num}번이 펌블 강제 유도`);
            }
        }
    }
    getRBKey(jerseyNumber, offensiveTeam, gameData) {
        const teamName = offensiveTeam === 'Home' ? gameData.homeTeam : gameData.awayTeam;
        return `${teamName}_RB_${jerseyNumber}`;
    }
};
exports.RbAnalyzerService = RbAnalyzerService;
exports.RbAnalyzerService = RbAnalyzerService = __decorate([
    (0, common_1.Injectable)()
], RbAnalyzerService);
//# sourceMappingURL=rb-analyzer.service.js.map