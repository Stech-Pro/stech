"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DlAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const base_analyzer_service_1 = require("./base-analyzer.service");
let DlAnalyzerService = class DlAnalyzerService extends base_analyzer_service_1.BaseAnalyzerService {
    async analyzeClips(clips, gameData) {
        console.log(`\n⚔️ DL 분석 시작 - ${clips.length}개 클립`);
        if (clips.length === 0) {
            console.log('⚠️ DL 클립이 없습니다.');
            return { dlCount: 0, message: 'DL 클립이 없습니다.' };
        }
        const dlStatsMap = new Map();
        for (const clip of clips) {
            this.processClipForDL(clip, dlStatsMap, gameData);
        }
        let savedCount = 0;
        const results = [];
        for (const [dlKey, dlStats] of dlStatsMap) {
            this.calculateFinalStats(dlStats);
            console.log(`⚔️ DL ${dlStats.jerseyNumber}번 (${dlStats.teamName}) 최종 스탯:`);
            console.log(`   태클 수: ${dlStats.tackles}`);
            console.log(`   TFL: ${dlStats.tfl}`);
            console.log(`   색: ${dlStats.sacks}`);
            console.log(`   인터셉션: ${dlStats.interceptions}`);
            const saveResult = await this.savePlayerStats(dlStats.jerseyNumber, dlStats.teamName, 'DL', {
                gamesPlayed: dlStats.gamesPlayed,
                tackles: dlStats.tackles,
                tfl: dlStats.tfl,
                sacks: dlStats.sacks,
                interceptions: dlStats.interceptions,
                forcedFumbles: dlStats.forcedFumbles,
                fumbleRecoveries: dlStats.fumbleRecoveries,
                fumbleRecoveryYards: dlStats.fumbleRecoveryYards,
                passesDefended: dlStats.passesDefended,
                interceptionYards: dlStats.interceptionYards,
                defensiveTouchdowns: dlStats.defensiveTouchdowns,
                soloTackles: dlStats.soloTackles,
                comboTackles: dlStats.comboTackles,
                att: dlStats.att,
                longestInterception: dlStats.longestInterception,
            }, gameData);
            if (saveResult.success) {
                savedCount++;
            }
            results.push(saveResult);
        }
        console.log(`✅ DL 분석 완료: ${savedCount}명의 DL 스탯 저장\n`);
        return {
            dlCount: savedCount,
            message: `${savedCount}명의 DL 스탯이 분석되었습니다.`,
            results,
        };
    }
    processClipForDL(clip, dlStatsMap, gameData) {
        const dlPlayers = [];
        if (clip.tkl?.pos === 'DL') {
            dlPlayers.push({ number: clip.tkl.num, role: 'tkl' });
        }
        if (clip.tkl2?.pos === 'DL') {
            dlPlayers.push({ number: clip.tkl2.num, role: 'tkl2' });
        }
        for (const dlPlayer of dlPlayers) {
            const dlKey = this.getDLKey(dlPlayer.number, clip.offensiveTeam, gameData);
            if (!dlStatsMap.has(dlKey)) {
                dlStatsMap.set(dlKey, this.initializeDLStats(dlPlayer.number, clip.offensiveTeam, gameData));
            }
            const dlStats = dlStatsMap.get(dlKey);
            this.processPlay(clip, dlStats);
        }
    }
    processPlay(clip, dlStats) {
        const playType = clip.playType?.toUpperCase();
        const significantPlays = clip.significantPlays || [];
        if (playType === 'RUN' || playType === 'PASS') {
            const hasTkl = clip.tkl?.pos === 'DL';
            const hasTkl2 = clip.tkl2?.pos === 'DL';
            if (hasTkl && hasTkl2) {
                dlStats.comboTackles++;
                console.log(`   🤝 DL 콤보 태클!`);
            }
            else if (hasTkl || hasTkl2) {
                dlStats.soloTackles++;
                console.log(`   🎯 DL 솔로 태클!`);
            }
        }
        if (playType === 'PASS' || playType === 'RUN' || playType === 'SACK') {
            dlStats.tackles++;
            console.log(`   🏈 DL 태클! (${playType})`);
        }
        else if (significantPlays.includes('FUMBLE')) {
            dlStats.tackles++;
            console.log(`   🏈 DL 태클! (FUMBLE 유도)`);
        }
        if ((playType === 'PASS' || playType === 'RUN') &&
            significantPlays.includes('TFL')) {
            dlStats.tfl++;
            console.log(`   ⚡ DL TFL!`);
        }
        if (significantPlays.includes('SACK')) {
            const hasTkl = clip.tkl?.pos === 'DL';
            const hasTkl2 = clip.tkl2?.pos === 'DL';
            if (hasTkl && hasTkl2) {
                dlStats.sacks += 0.5;
                console.log(`   💥 DL 색! (0.5 - 공동)`);
            }
            else {
                dlStats.sacks++;
                console.log(`   💥 DL 색!`);
            }
            dlStats.tfl++;
            console.log(`   ⚡ DL SACK-TFL 자동 추가!`);
            dlStats.tackles++;
            console.log(`   🏈 DL 태클! (SACK)`);
        }
        if (playType === 'NOPASS' && significantPlays.includes('INTERCEPT')) {
            dlStats.interceptions++;
            console.log(`   🛡️ DL 인터셉션!`);
        }
        if (playType === 'RETURN' &&
            significantPlays.includes('TURNOVER') &&
            !significantPlays.includes('FUMBLERECDEF')) {
            const returnYards = Math.abs(clip.gainYard || 0);
            dlStats.interceptionYards += returnYards;
            if (returnYards > dlStats.longestInterception) {
                dlStats.longestInterception = returnYards;
                console.log(`   🏃 DL 인터셉션 리턴: ${returnYards}야드 (신기록!)`);
            }
            else {
                console.log(`   🏃 DL 인터셉션 리턴: ${returnYards}야드`);
            }
        }
        if (significantPlays.includes('FUMBLE')) {
            dlStats.forcedFumbles++;
            console.log(`   💪 DL 강제 펌블!`);
        }
        if (playType === 'RETURN' &&
            significantPlays.includes('FUMBLERECDEF') &&
            significantPlays.includes('TURNOVER')) {
            dlStats.fumbleRecoveries++;
            dlStats.fumbleRecoveryYards += Math.abs(clip.gainYard || 0);
            console.log(`   🟢 DL 펌블 리커버리: ${Math.abs(clip.gainYard || 0)}야드`);
        }
        if (playType === 'NOPASS' && !significantPlays.includes('INTERCEPT')) {
            dlStats.passesDefended++;
            console.log(`   🛡️ DL 패스 디펜드!`);
        }
        if (playType === 'RETURN' &&
            significantPlays.includes('TURNOVER') &&
            significantPlays.includes('TOUCHDOWN')) {
            dlStats.defensiveTouchdowns++;
            console.log(`   🏆 DL 수비 터치다운!`);
        }
    }
    calculateFinalStats(dlStats) {
        dlStats.gamesPlayed = 1;
        dlStats.att = dlStats.sacks + dlStats.soloTackles + dlStats.comboTackles;
    }
    initializeDLStats(jerseyNumber, offensiveTeam, gameData) {
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
    getDLKey(jerseyNumber, offensiveTeam, gameData) {
        const defensiveTeam = offensiveTeam === 'Home' ? gameData.awayTeam : gameData.homeTeam;
        return `${defensiveTeam}_DL_${jerseyNumber}`;
    }
};
exports.DlAnalyzerService = DlAnalyzerService;
exports.DlAnalyzerService = DlAnalyzerService = __decorate([
    (0, common_1.Injectable)()
], DlAnalyzerService);
//# sourceMappingURL=dl-analyzer.service.js.map