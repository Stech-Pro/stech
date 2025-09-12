"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClipAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const player_schema_1 = require("../schemas/player.schema");
const user_schema_1 = require("../schemas/user.schema");
const qb_analyzer_service_1 = require("./analyzers/qb-analyzer.service");
const rb_analyzer_service_1 = require("./analyzers/rb-analyzer.service");
const wr_analyzer_service_1 = require("./analyzers/wr-analyzer.service");
const te_analyzer_service_1 = require("./analyzers/te-analyzer.service");
const k_analyzer_service_1 = require("./analyzers/k-analyzer.service");
const p_analyzer_service_1 = require("./analyzers/p-analyzer.service");
const ol_analyzer_service_1 = require("./analyzers/ol-analyzer.service");
const dl_analyzer_service_1 = require("./analyzers/dl-analyzer.service");
const lb_analyzer_service_1 = require("./analyzers/lb-analyzer.service");
const db_analyzer_service_1 = require("./analyzers/db-analyzer.service");
const auth_service_1 = require("../auth/auth.service");
let ClipAnalyzerService = class ClipAnalyzerService {
    playerModel;
    userModel;
    qbAnalyzer;
    rbAnalyzer;
    wrAnalyzer;
    teAnalyzer;
    kAnalyzer;
    pAnalyzer;
    olAnalyzer;
    dlAnalyzer;
    lbAnalyzer;
    dbAnalyzer;
    authService;
    constructor(playerModel, userModel, qbAnalyzer, rbAnalyzer, wrAnalyzer, teAnalyzer, kAnalyzer, pAnalyzer, olAnalyzer, dlAnalyzer, lbAnalyzer, dbAnalyzer, authService) {
        this.playerModel = playerModel;
        this.userModel = userModel;
        this.qbAnalyzer = qbAnalyzer;
        this.rbAnalyzer = rbAnalyzer;
        this.wrAnalyzer = wrAnalyzer;
        this.teAnalyzer = teAnalyzer;
        this.kAnalyzer = kAnalyzer;
        this.pAnalyzer = pAnalyzer;
        this.olAnalyzer = olAnalyzer;
        this.dlAnalyzer = dlAnalyzer;
        this.lbAnalyzer = lbAnalyzer;
        this.dbAnalyzer = dbAnalyzer;
        this.authService = authService;
    }
    async analyzeGameData(gameData) {
        console.log(`\n🎮 게임 분석 시작: ${gameData.gameKey}`);
        console.log(`📍 ${gameData.homeTeam} vs ${gameData.awayTeam}`);
        console.log(`📊 총 클립 수: ${gameData.Clips.length}`);
        const results = [];
        const qbResult = await this.qbAnalyzer.analyzeClips(gameData.Clips, gameData);
        if (qbResult.results) {
            results.push(...qbResult.results);
        }
        const rbResult = await this.analyzeRBClips(gameData.Clips, gameData);
        results.push(...rbResult.results);
        const wrResult = await this.wrAnalyzer.analyzeClips(gameData.Clips, gameData);
        if (wrResult.results) {
            results.push(...wrResult.results);
        }
        const teResult = await this.analyzeTEClips(gameData.Clips, gameData);
        results.push(...teResult.results);
        const kResult = await this.analyzeKClips(gameData.Clips, gameData);
        results.push(...kResult.results);
        const pResult = await this.analyzePClips(gameData.Clips, gameData);
        results.push(...pResult.results);
        const olResult = await this.analyzeOLClips(gameData.Clips, gameData);
        results.push(...olResult.results);
        const dlResult = await this.analyzeDLClips(gameData.Clips, gameData);
        results.push(...dlResult.results);
        const lbResult = await this.analyzeLBClips(gameData.Clips, gameData);
        results.push(...lbResult.results);
        const dbResult = await this.analyzeDBClips(gameData.Clips, gameData);
        results.push(...dbResult.results);
        console.log(`\n✅ 게임 분석 완료 - ${qbResult.qbCount || 0}명의 QB, ${rbResult.rbCount}명의 RB, ${wrResult.wrCount || 0}명의 WR, ${teResult.teCount}명의 TE, ${kResult.kCount}명의 K, ${pResult.pCount}명의 P, ${olResult.olCount}명의 OL, ${dlResult.dlCount}명의 DL, ${lbResult.lbCount}명의 LB, ${dbResult.dbCount}명의 DB 처리됨`);
        await this.processAutoHighlights(gameData);
        return {
            success: true,
            message: `${qbResult.qbCount}명의 QB, ${rbResult.rbCount}명의 RB, ${wrResult.wrCount}명의 WR, ${teResult.teCount}명의 TE, ${kResult.kCount}명의 K, ${pResult.pCount}명의 P, ${olResult.olCount}명의 OL, ${dlResult.dlCount}명의 DL, ${lbResult.lbCount}명의 LB, ${dbResult.dbCount}명의 DB 스탯이 업데이트되었습니다.`,
            qbCount: qbResult.qbCount,
            rbCount: rbResult.rbCount,
            wrCount: wrResult.wrCount,
            teCount: teResult.teCount,
            kCount: kResult.kCount,
            pCount: pResult.pCount,
            olCount: olResult.olCount,
            dlCount: dlResult.dlCount,
            lbCount: lbResult.lbCount,
            dbCount: dbResult.dbCount,
            results,
        };
    }
    async analyzeQBClips(clips, gameData) {
        const qbStatsMap = new Map();
        for (const clip of clips) {
            await this.analyzeQBClip(clip, gameData, qbStatsMap);
        }
        const results = [];
        for (const [qbKey, qbStats] of qbStatsMap) {
            this.calculateFinalStats(qbStats);
            const saveResult = await this.saveQBStats(qbStats);
            results.push(saveResult);
            console.log(`\n🏈 QB ${qbStats.jerseyNumber}번 (${qbStats.teamName}) 최종 스탯:`);
            console.log(`   패싱: ${qbStats.passingAttempts}시도/${qbStats.passingCompletions}성공 (${qbStats.completionPercentage}%)`);
            console.log(`   패싱야드: ${qbStats.passingYards}, TD: ${qbStats.passingTouchdowns}, INT: ${qbStats.passingInterceptions}`);
            console.log(`   러싱: ${qbStats.rushingAttempts}시도, ${qbStats.rushingYards}야드, TD: ${qbStats.rushingTouchdowns}`);
            console.log(`   색: ${qbStats.sacks}, 펌블: ${qbStats.fumbles}`);
        }
        return {
            qbCount: qbStatsMap.size,
            results,
        };
    }
    async analyzeRBClips(clips, gameData) {
        const rbClips = clips.filter((clip) => clip.car?.pos === 'RB' || clip.car2?.pos === 'RB');
        if (rbClips.length === 0) {
            return { rbCount: 0, results: [] };
        }
        return await this.rbAnalyzer.analyzeClips(rbClips, gameData);
    }
    async analyzeWRClips(clips, gameData) {
        const wrClips = clips.filter((clip) => clip.car?.pos === 'WR' || clip.car2?.pos === 'WR');
        if (wrClips.length === 0) {
            return { wrCount: 0, results: [] };
        }
        return await this.wrAnalyzer.analyzeClips(wrClips, gameData);
    }
    async analyzeTEClips(clips, gameData) {
        const teClips = clips.filter((clip) => clip.car?.pos === 'TE' || clip.car2?.pos === 'TE');
        if (teClips.length === 0) {
            return { teCount: 0, results: [] };
        }
        return await this.teAnalyzer.analyzeClips(teClips, gameData);
    }
    async analyzeKClips(clips, gameData) {
        console.log(`🦶 키커 클립 필터링 시작 - 전체 ${clips.length}개 클립`);
        const kClips = clips.filter((clip) => clip.car?.pos === 'K' || clip.car2?.pos === 'K');
        console.log(`🦶 키커 클립 필터링 완료 - ${kClips.length}개 키커 클립 발견`);
        if (kClips.length === 0) {
            console.log('⚠️ 키커 클립이 없어서 분석을 건너뜁니다.');
            return { kCount: 0, results: [] };
        }
        console.log(`🦶 키커 분석 서비스 호출 중...`);
        const result = await this.kAnalyzer.analyzeClips(kClips, gameData);
        console.log(`🦶 키커 분석 서비스 결과:`, result);
        return result;
    }
    async analyzePClips(clips, gameData) {
        console.log(`🦶 펀터 클립 필터링 시작 - 전체 ${clips.length}개 클립`);
        const pClips = clips.filter((clip) => clip.playType?.toUpperCase() === 'PUNT');
        console.log(`🦶 펀터 클립 필터링 완료 - ${pClips.length}개 펀터 클립 발견`);
        if (pClips.length === 0) {
            console.log('⚠️ 펀터 클립이 없어서 분석을 건너뜁니다.');
            return { pCount: 0, results: [] };
        }
        console.log(`🦶 펀터 분석 서비스 호출 중...`);
        const result = await this.pAnalyzer.analyzeClips(pClips, gameData);
        console.log(`🦶 펀터 분석 서비스 결과:`, result);
        return result;
    }
    async analyzeOLClips(clips, gameData) {
        console.log(`🛡️ OL 클립 필터링 시작 - 전체 ${clips.length}개 클립`);
        const olClips = clips.filter((clip) => clip.car?.pos === 'OL' ||
            clip.car2?.pos === 'OL' ||
            clip.playType?.toUpperCase() === 'NONE' ||
            clip.playType?.toUpperCase() === 'SACK');
        console.log(`🛡️ OL 클립 필터링 완료 - ${olClips.length}개 OL 클립 발견`);
        if (olClips.length === 0) {
            console.log('⚠️ OL 클립이 없어서 분석을 건너뜁니다.');
            return { olCount: 0, results: [] };
        }
        console.log(`🛡️ OL 분석 서비스 호출 중...`);
        const result = await this.olAnalyzer.analyzeClips(olClips, gameData);
        console.log(`🛡️ OL 분석 서비스 결과:`, result);
        return result;
    }
    async analyzeDLClips(clips, gameData) {
        console.log(`⚔️ DL 클립 필터링 시작 - 전체 ${clips.length}개 클립`);
        const dlClips = clips.filter((clip) => clip.tkl?.pos === 'DL' || clip.tkl2?.pos === 'DL');
        console.log(`⚔️ DL 클립 필터링 완료 - ${dlClips.length}개 DL 클립 발견`);
        if (dlClips.length === 0) {
            console.log('⚠️ DL 클립이 없어서 분석을 건너뜁니다.');
            return { dlCount: 0, results: [] };
        }
        console.log(`⚔️ DL 분석 서비스 호출 중...`);
        const result = await this.dlAnalyzer.analyzeClips(dlClips, gameData);
        console.log(`⚔️ DL 분석 서비스 결과:`, result);
        return result;
    }
    async analyzeLBClips(clips, gameData) {
        console.log(`🛡️ LB 클립 필터링 시작 - 전체 ${clips.length}개 클립`);
        const lbClips = clips.filter((clip) => clip.tkl?.pos === 'LB' || clip.tkl2?.pos === 'LB');
        console.log(`🛡️ LB 클립 필터링 완료 - ${lbClips.length}개 LB 클립 발견`);
        if (lbClips.length === 0) {
            console.log('⚠️ LB 클립이 없어서 분석을 건너뜁니다.');
            return { lbCount: 0, results: [] };
        }
        console.log(`🛡️ LB 분석 서비스 호출 중...`);
        const result = await this.lbAnalyzer.analyzeClips(lbClips, gameData);
        console.log(`🛡️ LB 분석 서비스 결과:`, result);
        return result;
    }
    async analyzeDBClips(clips, gameData) {
        console.log(`🚨 DB 클립 필터링 시작 - 전체 ${clips.length}개 클립`);
        const dbClips = clips.filter((clip) => clip.tkl?.pos === 'DB' ||
            clip.tkl2?.pos === 'DB' ||
            clip.car?.pos === 'DB' ||
            clip.car2?.pos === 'DB');
        console.log(`🚨 DB 클립 필터링 완료 - ${dbClips.length}개 DB 클립 발견`);
        if (dbClips.length === 0) {
            console.log('⚠️ DB 클립이 없어서 분석을 건너뜁니다.');
            return { dbCount: 0, results: [] };
        }
        console.log(`🚨 DB 분석 서비스 호출 중...`);
        const result = await this.dbAnalyzer.analyzeClips(dbClips, gameData);
        console.log(`🚨 DB 분석 서비스 결과:`, result);
        return result;
    }
    async analyzeQBClip(clip, gameData, qbStatsMap) {
        const offensiveTeam = clip.offensiveTeam === 'Home' ? gameData.homeTeam : gameData.awayTeam;
        let qb = null;
        if (clip.car?.pos === 'QB') {
            qb = clip.car;
        }
        else if (clip.car2?.pos === 'QB') {
            qb = { num: clip.car2.num, pos: clip.car2.pos };
        }
        if (qb) {
            this.processQBClip(clip, qb, offensiveTeam, qbStatsMap);
        }
    }
    processQBClip(clip, qb, offensiveTeam, qbStatsMap) {
        const qbKey = `${offensiveTeam}_QB_${qb.num}`;
        if (!qbStatsMap.has(qbKey)) {
            qbStatsMap.set(qbKey, {
                jerseyNumber: qb.num,
                teamName: offensiveTeam,
                gamesPlayed: 1,
                passingAttempts: 0,
                passingCompletions: 0,
                completionPercentage: 0,
                passingYards: 0,
                passingTouchdowns: 0,
                passingInterceptions: 0,
                longestPass: 0,
                sacks: 0,
                rushingAttempts: 0,
                rushingYards: 0,
                yardsPerCarry: 0,
                rushingTouchdowns: 0,
                longestRush: 0,
                fumbles: 0,
            });
        }
        const qbStats = qbStatsMap.get(qbKey);
        if (clip.playType === 'PASS' || clip.playType === 'NOPASS') {
            qbStats.passingAttempts++;
        }
        if (clip.playType === 'PASS') {
            qbStats.passingCompletions++;
            qbStats.passingYards += clip.gainYard || 0;
            if ((clip.gainYard || 0) > qbStats.longestPass) {
                qbStats.longestPass = clip.gainYard || 0;
            }
        }
        if (clip.playType === 'RUN') {
            qbStats.rushingAttempts++;
            qbStats.rushingYards += clip.gainYard || 0;
            if ((clip.gainYard || 0) > qbStats.longestRush) {
                qbStats.longestRush = clip.gainYard || 0;
            }
        }
        if (clip.playType === 'SACK') {
            qbStats.sacks++;
        }
        if (clip.significantPlays && Array.isArray(clip.significantPlays)) {
            for (const play of clip.significantPlays) {
                if (play === 'TOUCHDOWN') {
                    if (clip.playType === 'PASS') {
                        qbStats.passingTouchdowns++;
                    }
                    else if (clip.playType === 'RUN') {
                        qbStats.rushingTouchdowns++;
                    }
                }
                else if (play === 'INTERCEPT' || play === 'INTERCEPTION') {
                    qbStats.passingInterceptions++;
                }
                else if (play === 'SACK') {
                    qbStats.sacks++;
                }
                else if (play === 'FUMBLE') {
                    qbStats.fumbles++;
                }
            }
        }
        console.log(`🏈 QB ${qb.num}번: ${clip.playType}, ${clip.gainYard}야드`);
    }
    calculateFinalStats(qbStats) {
        qbStats.completionPercentage =
            qbStats.passingAttempts > 0
                ? Math.round((qbStats.passingCompletions / qbStats.passingAttempts) * 100)
                : 0;
        qbStats.yardsPerCarry =
            qbStats.rushingAttempts > 0
                ? Math.round((qbStats.rushingYards / qbStats.rushingAttempts) * 100) /
                    100
                : 0;
        qbStats.gamesPlayed = 1;
    }
    async saveQBStats(qbStats) {
        try {
            let player = await this.playerModel.findOne({
                jerseyNumber: qbStats.jerseyNumber,
                teamName: qbStats.teamName,
            });
            if (!player) {
                console.log(`🆕 새 QB 선수 생성: ${qbStats.jerseyNumber}번 (${qbStats.teamName})`);
                player = new this.playerModel({
                    playerId: `${qbStats.teamName}_${qbStats.jerseyNumber}`,
                    name: `${qbStats.jerseyNumber}번`,
                    jerseyNumber: qbStats.jerseyNumber,
                    positions: ['QB'],
                    primaryPosition: 'QB',
                    teamName: qbStats.teamName,
                    league: '1부',
                    season: '2024',
                    stats: {
                        QB: {
                            gamesPlayed: qbStats.gamesPlayed,
                            passingAttempts: qbStats.passingAttempts,
                            passingCompletions: qbStats.passingCompletions,
                            completionPercentage: qbStats.completionPercentage,
                            passingYards: qbStats.passingYards,
                            passingTouchdowns: qbStats.passingTouchdowns,
                            passingInterceptions: qbStats.passingInterceptions,
                            longestPass: qbStats.longestPass,
                            sacks: qbStats.sacks,
                            rushingAttempts: qbStats.rushingAttempts,
                            rushingYards: qbStats.rushingYards,
                            yardsPerCarry: qbStats.yardsPerCarry,
                            rushingTouchdowns: qbStats.rushingTouchdowns,
                            longestRush: qbStats.longestRush,
                        },
                        totalGamesPlayed: qbStats.gamesPlayed,
                    },
                });
            }
            else {
                console.log(`🔄 기존 QB 선수 업데이트: ${player.name}`);
                if (!player.positions.includes('QB')) {
                    player.positions.push('QB');
                }
                if (!player.stats.QB) {
                    player.stats.QB = {};
                }
                const qbStatsData = player.stats.QB;
                qbStatsData.gamesPlayed =
                    (qbStatsData.gamesPlayed || 0) + qbStats.gamesPlayed;
                qbStatsData.passingAttempts =
                    (qbStatsData.passingAttempts || 0) + qbStats.passingAttempts;
                qbStatsData.passingCompletions =
                    (qbStatsData.passingCompletions || 0) + qbStats.passingCompletions;
                qbStatsData.completionPercentage =
                    qbStatsData.passingAttempts > 0
                        ? Math.round((qbStatsData.passingCompletions / qbStatsData.passingAttempts) *
                            100)
                        : 0;
                qbStatsData.passingYards =
                    (qbStatsData.passingYards || 0) + qbStats.passingYards;
                qbStatsData.passingTouchdowns =
                    (qbStatsData.passingTouchdowns || 0) + qbStats.passingTouchdowns;
                qbStatsData.passingInterceptions =
                    (qbStatsData.passingInterceptions || 0) +
                        qbStats.passingInterceptions;
                qbStatsData.sacks = (qbStatsData.sacks || 0) + qbStats.sacks;
                qbStatsData.rushingAttempts =
                    (qbStatsData.rushingAttempts || 0) + qbStats.rushingAttempts;
                qbStatsData.rushingYards =
                    (qbStatsData.rushingYards || 0) + qbStats.rushingYards;
                qbStatsData.yardsPerCarry =
                    qbStatsData.rushingAttempts > 0
                        ? Math.round((qbStatsData.rushingYards / qbStatsData.rushingAttempts) * 100) / 100
                        : 0;
                qbStatsData.rushingTouchdowns =
                    (qbStatsData.rushingTouchdowns || 0) + qbStats.rushingTouchdowns;
                qbStatsData.longestRush = Math.max(qbStatsData.longestRush || 0, qbStats.longestRush);
                qbStatsData.longestPass = Math.max(qbStatsData.longestPass || 0, qbStats.longestPass);
                player.stats.totalGamesPlayed =
                    (player.stats.totalGamesPlayed || 0) + qbStats.gamesPlayed;
            }
            await player.save();
            return {
                success: true,
                player: {
                    name: player.name,
                    jerseyNumber: player.jerseyNumber,
                    positions: player.positions,
                    teamName: player.teamName,
                    stats: qbStats,
                },
            };
        }
        catch (error) {
            console.error(`❌ QB ${qbStats.jerseyNumber}번 저장 실패:`, error);
            return {
                success: false,
                error: error.message,
                qbStats,
            };
        }
    }
    async processAutoHighlights(gameData) {
        console.log('\n🌟 자동 하이라이트 처리 시작...');
        try {
            const users = await this.userModel.find({
                teamName: { $in: [gameData.homeTeam, gameData.awayTeam] },
                'profile.playerID': { $exists: true, $ne: null },
            });
            console.log(`📌 ${users.length}명의 사용자 확인 중...`);
            for (const user of users) {
                const playerNumber = user.profile?.playerID;
                if (!playerNumber)
                    continue;
                for (const clip of gameData.Clips) {
                    if (clip.significantPlays &&
                        clip.significantPlays.includes(playerNumber)) {
                        const clipTeam = clip.offensiveTeam === 'Home'
                            ? gameData.homeTeam
                            : gameData.awayTeam;
                        if (clipTeam === user.teamName) {
                            await this.authService.addHighlight(user._id.toString(), gameData.gameKey, clip.clipKey);
                            console.log(`✨ ${user.username}(${playerNumber}번)의 하이라이트 추가: ${clip.clipKey}`);
                        }
                    }
                    const isInClip = clip.car?.num?.toString() === playerNumber ||
                        clip.car2?.num?.toString() === playerNumber ||
                        clip.tkl?.num?.toString() === playerNumber ||
                        clip.tkl2?.num?.toString() === playerNumber;
                    if (isInClip && clip.significantPlays?.length > 0) {
                        if (clip.tkl?.num?.toString() === playerNumber ||
                            clip.tkl2?.num?.toString() === playerNumber) {
                            const defenseTeam = clip.offensiveTeam === 'Home'
                                ? gameData.awayTeam
                                : gameData.homeTeam;
                            if (defenseTeam === user.teamName) {
                                await this.authService.addHighlight(user._id.toString(), gameData.gameKey, clip.clipKey);
                                console.log(`✨ ${user.username}(${playerNumber}번)의 수비 하이라이트 추가: ${clip.clipKey}`);
                            }
                        }
                    }
                }
            }
            console.log('✅ 자동 하이라이트 처리 완료');
        }
        catch (error) {
            console.error('❌ 자동 하이라이트 처리 중 오류:', error);
        }
    }
};
exports.ClipAnalyzerService = ClipAnalyzerService;
exports.ClipAnalyzerService = ClipAnalyzerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(player_schema_1.Player.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        qb_analyzer_service_1.QbAnalyzerService,
        rb_analyzer_service_1.RbAnalyzerService,
        wr_analyzer_service_1.WrAnalyzerService,
        te_analyzer_service_1.TeAnalyzerService,
        k_analyzer_service_1.KAnalyzerService,
        p_analyzer_service_1.PAnalyzerService,
        ol_analyzer_service_1.OlAnalyzerService,
        dl_analyzer_service_1.DlAnalyzerService,
        lb_analyzer_service_1.LbAnalyzerService,
        db_analyzer_service_1.DbAnalyzerService,
        auth_service_1.AuthService])
], ClipAnalyzerService);
//# sourceMappingURL=clip-analyzer.service.js.map