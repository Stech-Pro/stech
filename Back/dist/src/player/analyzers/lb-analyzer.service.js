"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LbAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const base_analyzer_service_1 = require("./base-analyzer.service");
let LbAnalyzerService = class LbAnalyzerService extends base_analyzer_service_1.BaseAnalyzerService {
    async analyzeClips(clips, gameData) {
        console.log(`\n🛡️ LB 분석 시작 - ${clips.length}개 클립`);
        if (clips.length === 0) {
            console.log('⚠️ LB 클립이 없습니다.');
            return { lbCount: 0, message: 'LB 클립이 없습니다.' };
        }
        const lbStatsMap = new Map();
        for (const clip of clips) {
            this.processClipForLB(clip, lbStatsMap, gameData);
        }
        let savedCount = 0;
        const results = [];
        for (const [lbKey, lbStats] of lbStatsMap) {
            this.calculateFinalStats(lbStats);
            console.log(`🛡️ LB ${lbStats.jerseyNumber}번 (${lbStats.teamName}) 최종 스탯:`);
            console.log(`   태클 수: ${lbStats.tackles}`);
            console.log(`   TFL: ${lbStats.tfl}`);
            console.log(`   색: ${lbStats.sacks}`);
            console.log(`   인터셉션: ${lbStats.interceptions}`);
            const saveResult = await this.savePlayerStats(lbStats.jerseyNumber, lbStats.teamName, 'LB', {
                gamesPlayed: lbStats.gamesPlayed,
                tackles: lbStats.tackles,
                tfl: lbStats.tfl,
                sacks: lbStats.sacks,
                interceptions: lbStats.interceptions,
                forcedFumbles: lbStats.forcedFumbles,
                fumbleRecoveries: lbStats.fumbleRecoveries,
                fumbleRecoveryYards: lbStats.fumbleRecoveryYards,
                passesDefended: lbStats.passesDefended,
                interceptionYards: lbStats.interceptionYards,
                defensiveTouchdowns: lbStats.defensiveTouchdowns,
                soloTackles: lbStats.soloTackles,
                comboTackles: lbStats.comboTackles,
                att: lbStats.att,
                longestInterception: lbStats.longestInterception,
            }, gameData);
            if (saveResult.success) {
                savedCount++;
            }
            results.push(saveResult);
        }
        console.log(`✅ LB 분석 완료: ${savedCount}명의 LB 스탯 저장\n`);
        return {
            lbCount: savedCount,
            message: `${savedCount}명의 LB 스탯이 분석되었습니다.`,
            results,
        };
    }
    processClipForLB(clip, lbStatsMap, gameData) {
        const lbPlayers = [];
        if (clip.tkl?.pos === 'LB') {
            lbPlayers.push({ number: clip.tkl.num, role: 'tkl' });
        }
        if (clip.tkl2?.pos === 'LB') {
            lbPlayers.push({ number: clip.tkl2.num, role: 'tkl2' });
        }
        for (const lbPlayer of lbPlayers) {
            const lbKey = this.getLBKey(lbPlayer.number, clip.offensiveTeam, gameData);
            if (!lbStatsMap.has(lbKey)) {
                lbStatsMap.set(lbKey, this.initializeLBStats(lbPlayer.number, clip.offensiveTeam, gameData));
            }
            const lbStats = lbStatsMap.get(lbKey);
            this.processPlay(clip, lbStats);
        }
    }
    processPlay(clip, lbStats) {
        const playType = clip.playType?.toUpperCase();
        const significantPlays = clip.significantPlays || [];
        if (playType === 'RUN' || playType === 'PASS') {
            const hasTkl = clip.tkl?.pos === 'LB';
            const hasTkl2 = clip.tkl2?.pos === 'LB';
            if (hasTkl && hasTkl2) {
                lbStats.comboTackles++;
                console.log(`   🤝 LB 콤보 태클!`);
            }
            else if (hasTkl || hasTkl2) {
                lbStats.soloTackles++;
                console.log(`   🎯 LB 솔로 태클!`);
            }
        }
        if (playType === 'PASS' || playType === 'RUN' || playType === 'SACK') {
            lbStats.tackles++;
            console.log(`   🏈 LB 태클! (${playType})`);
        }
        else if (significantPlays.includes('FUMBLE')) {
            lbStats.tackles++;
            console.log(`   🏈 LB 태클! (FUMBLE 유도)`);
        }
        if ((playType === 'PASS' || playType === 'RUN') &&
            significantPlays.includes('TFL')) {
            lbStats.tfl++;
            console.log(`   ⚡ LB TFL!`);
        }
        if (significantPlays.includes('SACK')) {
            const hasTkl = clip.tkl?.pos === 'LB';
            const hasTkl2 = clip.tkl2?.pos === 'LB';
            if (hasTkl && hasTkl2) {
                lbStats.sacks += 0.5;
                console.log(`   💥 LB 색! (0.5 - 공동)`);
            }
            else {
                lbStats.sacks++;
                console.log(`   💥 LB 색!`);
            }
            lbStats.tfl++;
            console.log(`   ⚡ LB SACK-TFL 자동 추가!`);
            lbStats.tackles++;
            console.log(`   🏈 LB 태클! (SACK)`);
        }
        if (playType === 'NOPASS' && significantPlays.includes('INTERCEPT')) {
            lbStats.interceptions++;
            console.log(`   🛡️ LB 인터셉션!`);
        }
        if (playType === 'RETURN' &&
            significantPlays.includes('TURNOVER') &&
            !significantPlays.includes('FUMBLERECDEF')) {
            const returnYards = Math.abs(clip.gainYard || 0);
            lbStats.interceptionYards += returnYards;
            if (returnYards > lbStats.longestInterception) {
                lbStats.longestInterception = returnYards;
                console.log(`   🏃 LB 인터셉션 리턴: ${returnYards}야드 (신기록!)`);
            }
            else {
                console.log(`   🏃 LB 인터셉션 리턴: ${returnYards}야드`);
            }
        }
        if (significantPlays.includes('FUMBLE')) {
            lbStats.forcedFumbles++;
            console.log(`   💪 LB 강제 펌블!`);
        }
        if (playType === 'RETURN' &&
            significantPlays.includes('FUMBLERECDEF') &&
            significantPlays.includes('TURNOVER')) {
            lbStats.fumbleRecoveries++;
            lbStats.fumbleRecoveryYards += Math.abs(clip.gainYard || 0);
            console.log(`   🟢 LB 펌블 리커버리: ${Math.abs(clip.gainYard || 0)}야드`);
        }
        if (playType === 'NOPASS' && !significantPlays.includes('INTERCEPT')) {
            lbStats.passesDefended++;
            console.log(`   🛡️ LB 패스 디펜드!`);
        }
        if (playType === 'RETURN' &&
            significantPlays.includes('TURNOVER') &&
            significantPlays.includes('TOUCHDOWN')) {
            lbStats.defensiveTouchdowns++;
            console.log(`   🏆 LB 수비 터치다운!`);
        }
    }
    calculateFinalStats(lbStats) {
        lbStats.gamesPlayed = 1;
        lbStats.att = lbStats.sacks + lbStats.soloTackles + lbStats.comboTackles;
    }
    initializeLBStats(jerseyNumber, offensiveTeam, gameData) {
        const defensiveTeam = offensiveTeam === 'Home' ? gameData.awayTeam : gameData.homeTeam;
        return {
            jerseyNumber,
            teamName: defensiveTeam,
            gamesPlayed: 1,
            tackles: 0,
            tfl: 0,
            sacks: 0,
            interceptions: 0,
            forcedFumbles: 0,
            fumbleRecoveries: 0,
            fumbleRecoveryYards: 0,
            passesDefended: 0,
            interceptionYards: 0,
            defensiveTouchdowns: 0,
            soloTackles: 0,
            comboTackles: 0,
            att: 0,
            longestInterception: 0,
        };
    }
    getLBKey(jerseyNumber, offensiveTeam, gameData) {
        const defensiveTeam = offensiveTeam === 'Home' ? gameData.awayTeam : gameData.homeTeam;
        return `${defensiveTeam}_LB_${jerseyNumber}`;
    }
};
exports.LbAnalyzerService = LbAnalyzerService;
exports.LbAnalyzerService = LbAnalyzerService = __decorate([
    (0, common_1.Injectable)()
], LbAnalyzerService);
//# sourceMappingURL=lb-analyzer.service.js.map