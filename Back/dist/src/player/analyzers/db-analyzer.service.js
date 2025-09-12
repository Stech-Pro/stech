"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const base_analyzer_service_1 = require("./base-analyzer.service");
let DbAnalyzerService = class DbAnalyzerService extends base_analyzer_service_1.BaseAnalyzerService {
    async analyzeClips(clips, gameData) {
        console.log(`\n🚨 DB 분석 시작 - ${clips.length}개 클립`);
        if (clips.length === 0) {
            console.log('⚠️ DB 클립이 없습니다.');
            return { dbCount: 0, message: 'DB 클립이 없습니다.' };
        }
        const dbStatsMap = new Map();
        for (const clip of clips) {
            this.processClipForDB(clip, dbStatsMap, gameData);
        }
        let savedCount = 0;
        const results = [];
        for (const [dbKey, dbStats] of dbStatsMap) {
            this.calculateFinalStats(dbStats);
            console.log(`🚨 DB ${dbStats.jerseyNumber}번 (${dbStats.teamName}) 최종 스탯:`);
            console.log(`   태클 수: ${dbStats.tackles}`);
            console.log(`   TFL: ${dbStats.tfl}`);
            console.log(`   색: ${dbStats.sacks}`);
            console.log(`   인터셉션: ${dbStats.interceptions}`);
            console.log(`   킥오프 리턴: ${dbStats.kickoffReturn}회, ${dbStats.kickoffReturnYard}야드, TD: ${dbStats.kickoffReturnTouchdowns}`);
            console.log(`   펀트 리턴: ${dbStats.puntReturn}회, ${dbStats.puntReturnYard}야드, TD: ${dbStats.puntReturnTouchdowns}`);
            const saveResult = await this.savePlayerStats(dbStats.jerseyNumber, dbStats.teamName, 'DB', {
                gamesPlayed: dbStats.gamesPlayed,
                tackles: dbStats.tackles,
                tfl: dbStats.tfl,
                sacks: dbStats.sacks,
                interceptions: dbStats.interceptions,
                forcedFumbles: dbStats.forcedFumbles,
                fumbleRecoveries: dbStats.fumbleRecoveries,
                fumbleRecoveryYards: dbStats.fumbleRecoveryYards,
                passesDefended: dbStats.passesDefended,
                interceptionYards: dbStats.interceptionYards,
                defensiveTouchdowns: dbStats.defensiveTouchdowns,
                soloTackles: dbStats.soloTackles,
                comboTackles: dbStats.comboTackles,
                att: dbStats.att,
                longestInterception: dbStats.longestInterception,
                kickReturns: dbStats.kickoffReturn,
                kickReturnYards: dbStats.kickoffReturnYard,
                yardsPerKickReturn: dbStats.yardPerKickoffReturn,
                puntReturns: dbStats.puntReturn,
                puntReturnYards: dbStats.puntReturnYard,
                yardsPerPuntReturn: dbStats.yardPerPuntReturn,
                returnTouchdowns: dbStats.kickoffReturnTouchdowns + dbStats.puntReturnTouchdowns,
            }, gameData);
            if (saveResult.success) {
                savedCount++;
            }
            results.push(saveResult);
        }
        console.log(`✅ DB 분석 완료: ${savedCount}명의 DB 스탯 저장\n`);
        return {
            dbCount: savedCount,
            message: `${savedCount}명의 DB 스탯이 분석되었습니다.`,
            results,
        };
    }
    processClipForDB(clip, dbStatsMap, gameData) {
        const dbPlayers = [];
        console.log(`   🔍 클립 ${clip.clipKey}: playType=${clip.playType}, car=${clip.car?.num}(${clip.car?.pos}), tkl=${clip.tkl?.num}(${clip.tkl?.pos})`);
        if (clip.tkl?.pos === 'DB') {
            dbPlayers.push({ number: clip.tkl.num, role: 'tkl' });
            console.log(`   → 수비 DB 발견: ${clip.tkl.num}번`);
        }
        if (clip.tkl2?.pos === 'DB') {
            dbPlayers.push({ number: clip.tkl2.num, role: 'tkl2' });
            console.log(`   → 수비 DB2 발견: ${clip.tkl2.num}번`);
        }
        if (clip.car?.pos === 'DB') {
            dbPlayers.push({ number: clip.car.num, role: 'car' });
            console.log(`   → 스페셜팀 DB 발견: ${clip.car.num}번`);
        }
        if (clip.car2?.pos === 'DB') {
            dbPlayers.push({ number: clip.car2.num, role: 'car2' });
            console.log(`   → 스페셜팀 DB2 발견: ${clip.car2.num}번`);
        }
        for (const dbPlayer of dbPlayers) {
            const dbKey = this.getDBKey(dbPlayer.number, clip.offensiveTeam, gameData, dbPlayer.role);
            console.log(`   → 생성된 DB Key: ${dbKey} (role: ${dbPlayer.role})`);
            if (!dbStatsMap.has(dbKey)) {
                let teamName;
                if (dbPlayer.role === 'car' || dbPlayer.role === 'car2') {
                    teamName =
                        clip.offensiveTeam === 'Home'
                            ? gameData.homeTeam
                            : gameData.awayTeam;
                }
                else {
                    teamName =
                        clip.offensiveTeam === 'Home'
                            ? gameData.awayTeam
                            : gameData.homeTeam;
                }
                dbStatsMap.set(dbKey, this.initializeDBStats(dbPlayer.number, teamName));
                console.log(`   → 새 DB 선수 초기화: ${dbKey} (팀: ${teamName})`);
            }
            const dbStats = dbStatsMap.get(dbKey);
            this.processPlay(clip, dbStats, dbPlayer.role);
        }
    }
    processPlay(clip, dbStats, playerRole) {
        const playType = clip.playType?.toUpperCase();
        const significantPlays = clip.significantPlays || [];
        if (playType === 'RUN' || playType === 'PASS') {
            const hasTkl = clip.tkl?.pos === 'DB';
            const hasTkl2 = clip.tkl2?.pos === 'DB';
            if (hasTkl && hasTkl2) {
                dbStats.comboTackles++;
                console.log(`   🤝 DB 콤보 태클!`);
            }
            else if (hasTkl || hasTkl2) {
                dbStats.soloTackles++;
                console.log(`   🎯 DB 솔로 태클!`);
            }
        }
        if (playerRole === 'tkl' || playerRole === 'tkl2') {
            if (playType === 'PASS' || playType === 'RUN' || playType === 'SACK') {
                dbStats.tackles++;
                console.log(`   🏈 DB 태클! (${playType})`);
            }
            else if (significantPlays.includes('FUMBLE')) {
                dbStats.tackles++;
                console.log(`   🏈 DB 태클! (FUMBLE 유도)`);
            }
            if ((playType === 'PASS' || playType === 'RUN') &&
                significantPlays.includes('TFL')) {
                dbStats.tfl++;
                console.log(`   ⚡ DB TFL!`);
            }
            if (significantPlays.includes('SACK')) {
                const hasTkl = clip.tkl?.pos === 'DB';
                const hasTkl2 = clip.tkl2?.pos === 'DB';
                if (hasTkl && hasTkl2) {
                    dbStats.sacks += 0.5;
                    console.log(`   💥 DB 색! (0.5 - 공동)`);
                }
                else {
                    dbStats.sacks++;
                    console.log(`   💥 DB 색!`);
                }
                dbStats.tfl++;
                console.log(`   ⚡ DB SACK-TFL 자동 추가!`);
                dbStats.tackles++;
                console.log(`   🏈 DB 태클! (SACK)`);
            }
            if (playType === 'NOPASS' && significantPlays.includes('INTERCEPT')) {
                dbStats.interceptions++;
                console.log(`   🛡️ DB 인터셉션!`);
            }
            if (playType === 'RETURN' &&
                significantPlays.includes('TURNOVER') &&
                !significantPlays.includes('FUMBLERECDEF')) {
                const returnYards = Math.abs(clip.gainYard || 0);
                dbStats.interceptionYards += returnYards;
                if (returnYards > dbStats.longestInterception) {
                    dbStats.longestInterception = returnYards;
                    console.log(`   🏃 DB 인터셉션 리턴: ${returnYards}야드 (신기록!)`);
                }
                else {
                    console.log(`   🏃 DB 인터셉션 리턴: ${returnYards}야드`);
                }
            }
            if (significantPlays.includes('FUMBLE')) {
                dbStats.forcedFumbles++;
                console.log(`   💪 DB 강제 펌블!`);
            }
            if (playType === 'RETURN' &&
                significantPlays.includes('FUMBLERECDEF') &&
                significantPlays.includes('TURNOVER')) {
                dbStats.fumbleRecoveries++;
                dbStats.fumbleRecoveryYards += Math.abs(clip.gainYard || 0);
                console.log(`   🟢 DB 펌블 리커버리: ${Math.abs(clip.gainYard || 0)}야드`);
            }
            if (playType === 'NOPASS' && !significantPlays.includes('INTERCEPT')) {
                dbStats.passesDefended++;
                console.log(`   🛡️ DB 패스 디펜드!`);
            }
            if (playType === 'RETURN' &&
                significantPlays.includes('TURNOVER') &&
                significantPlays.includes('TOUCHDOWN')) {
                dbStats.defensiveTouchdowns++;
                console.log(`   🏆 DB 수비 터치다운!`);
            }
        }
        else if (playerRole === 'car' || playerRole === 'car2') {
            if (playType === 'RETURN') {
                const hasKickoff = significantPlays.some((play) => play === 'KICKOFF');
                const hasPunt = significantPlays.some((play) => play === 'PUNT');
                const gainYard = clip.gainYard || 0;
                if (hasKickoff) {
                    dbStats.kickoffReturn++;
                    dbStats.kickoffReturnYard += gainYard;
                    console.log(`   🔄 DB 킥오프 리턴: ${gainYard}야드`);
                    if (significantPlays.includes('TOUCHDOWN')) {
                        dbStats.kickoffReturnTouchdowns++;
                        console.log(`   🏆 DB 킥오프 리턴 터치다운!`);
                    }
                }
                if (hasPunt) {
                    dbStats.puntReturn++;
                    dbStats.puntReturnYard += gainYard;
                    console.log(`   🔄 DB 펀트 리턴: ${gainYard}야드`);
                    if (significantPlays.includes('TOUCHDOWN')) {
                        dbStats.puntReturnTouchdowns++;
                        console.log(`   🏆 DB 펀트 리턴 터치다운!`);
                    }
                }
            }
        }
    }
    calculateFinalStats(dbStats) {
        dbStats.gamesPlayed = 1;
        dbStats.att = dbStats.sacks + dbStats.soloTackles + dbStats.comboTackles;
        dbStats.yardPerKickoffReturn =
            dbStats.kickoffReturn > 0
                ? Math.round((dbStats.kickoffReturnYard / dbStats.kickoffReturn) * 10) /
                    10
                : 0;
        dbStats.yardPerPuntReturn =
            dbStats.puntReturn > 0
                ? Math.round((dbStats.puntReturnYard / dbStats.puntReturn) * 10) / 10
                : 0;
    }
    initializeDBStats(jerseyNumber, teamName) {
        return {
            jerseyNumber,
            teamName,
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
            kickoffReturn: 0,
            kickoffReturnYard: 0,
            yardPerKickoffReturn: 0,
            puntReturn: 0,
            puntReturnYard: 0,
            yardPerPuntReturn: 0,
            kickoffReturnTouchdowns: 0,
            puntReturnTouchdowns: 0,
        };
    }
    getDBKey(jerseyNumber, offensiveTeam, gameData, role) {
        let teamName;
        if (role === 'car' || role === 'car2') {
            teamName =
                offensiveTeam === 'Home' ? gameData.homeTeam : gameData.awayTeam;
        }
        else {
            teamName =
                offensiveTeam === 'Home' ? gameData.awayTeam : gameData.homeTeam;
        }
        return `${teamName}_DB_${jerseyNumber}`;
    }
};
exports.DbAnalyzerService = DbAnalyzerService;
exports.DbAnalyzerService = DbAnalyzerService = __decorate([
    (0, common_1.Injectable)()
], DbAnalyzerService);
//# sourceMappingURL=db-analyzer.service.js.map