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
exports.QbAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const player_schema_1 = require("../schemas/player.schema");
let QbAnalyzerService = class QbAnalyzerService {
    playerModel;
    constructor(playerModel) {
        this.playerModel = playerModel;
    }
    async analyzeQbStats(gameData) {
        try {
            console.log('\n🎯 게임 데이터 전처리 시작');
            if (!this.validateGameData(gameData)) {
                return { success: false, error: '유효하지 않은 게임 데이터' };
            }
            const processedData = this.preprocessGameData(gameData);
            const qbResults = await this.findAndAnalyzeQBs(processedData);
            this.generateSummaryReport(qbResults);
            console.log('\n✅ 분석 완료');
            return { success: true, results: qbResults };
        }
        catch (error) {
            console.error('❌ QB 분석 중 오류 발생:', error);
            return { success: false, error: error.message };
        }
    }
    validateGameData(gameData) {
        if (!gameData.homeTeam || !gameData.awayTeam) {
            console.error('❌ 필수 팀 정보가 없습니다');
            return false;
        }
        if (!gameData.Clips || !Array.isArray(gameData.Clips)) {
            console.error('❌ 클립 데이터가 유효하지 않습니다');
            return false;
        }
        console.log('✅ 데이터 검증 완료');
        return true;
    }
    preprocessGameData(gameData) {
        const { homeTeam, awayTeam, Clips } = gameData;
        console.log(`📋 게임 정보: ${homeTeam} vs ${awayTeam}`);
        console.log(`📎 총 클립 수: ${Clips.length}개`);
        const processedClips = Clips.map((clip) => {
            const actualOffensiveTeam = clip.offensiveTeam === 'Home' ? homeTeam : awayTeam;
            const actualDefensiveTeam = clip.offensiveTeam === 'Home' ? awayTeam : homeTeam;
            return {
                clipKey: clip.clipKey || '',
                offensiveTeam: clip.offensiveTeam || '',
                playType: clip.playType || '',
                gainYard: clip.gainYard || 0,
                car: clip.car || { num: null, pos: null },
                car2: clip.car2 || { num: null, pos: null },
                significantPlays: clip.significantPlays || [],
                actualOffensiveTeam,
                actualDefensiveTeam,
            };
        });
        return { homeTeam, awayTeam, processedClips };
    }
    async findAndAnalyzeQBs(data) {
        const qbResults = [];
        const qbPlayers = new Map();
        console.log('\n🔍 QB 선수 찾기');
        for (const clip of data.processedClips) {
            if (clip.car?.pos === 'QB' && clip.car.num !== null) {
                const key = `${clip.actualOffensiveTeam}-${clip.car.num}`;
                if (!qbPlayers.has(key)) {
                    qbPlayers.set(key, {
                        jerseyNumber: clip.car.num,
                        teamName: clip.actualOffensiveTeam,
                        clips: [],
                    });
                    console.log(`  발견: ${clip.actualOffensiveTeam} ${clip.car.num}번 QB`);
                }
            }
            if (clip.car2?.pos === 'QB' && clip.car2.num !== null) {
                const key = `${clip.actualOffensiveTeam}-${clip.car2.num}`;
                if (!qbPlayers.has(key)) {
                    qbPlayers.set(key, {
                        jerseyNumber: clip.car2.num,
                        teamName: clip.actualOffensiveTeam,
                        clips: [],
                    });
                    console.log(`  발견: ${clip.actualOffensiveTeam} ${clip.car2.num}번 QB`);
                }
            }
        }
        console.log(`\n📊 총 ${qbPlayers.size}명의 QB 발견`);
        for (const [key, qbInfo] of qbPlayers) {
            console.log(`\n=== ${qbInfo.teamName} ${qbInfo.jerseyNumber}번 QB 분석 ===`);
            const playerClips = this.filterQBClips(data.processedClips, qbInfo.jerseyNumber, qbInfo.teamName);
            console.log(`🎬 해당 QB 클립 수: ${playerClips.length}개`);
            const stats = this.analyzeQBStats(playerClips, qbInfo.jerseyNumber);
            qbResults.push({
                teamName: qbInfo.teamName,
                jerseyNumber: qbInfo.jerseyNumber,
                stats: stats,
            });
            await this.updatePlayerStats(qbInfo.jerseyNumber, qbInfo.teamName, stats);
        }
        return qbResults;
    }
    filterQBClips(clips, jerseyNumber, teamName) {
        return clips.filter((clip) => {
            if (clip.actualOffensiveTeam !== teamName)
                return false;
            const isPlayerInCar = clip.car?.num === jerseyNumber;
            const isPlayerInCar2 = clip.car2?.num === jerseyNumber;
            return isPlayerInCar || isPlayerInCar2;
        });
    }
    analyzeQBStats(clips, jerseyNumber) {
        let passingAttempts = 0;
        let passingCompletions = 0;
        let passingYards = 0;
        let passingTouchdowns = 0;
        let passingInterceptions = 0;
        let longestPass = 0;
        let sacks = 0;
        console.log(`\n📈 통계 계산 시작 (${clips.length}개 클립)`);
        for (const clip of clips) {
            const isPlayerInCar = clip.car?.num === jerseyNumber;
            const isPlayerInCar2 = clip.car2?.num === jerseyNumber;
            if (!isPlayerInCar && !isPlayerInCar2)
                continue;
            if (clip.playType === 'PASS' || clip.playType === 'NOPASS') {
                passingAttempts++;
                console.log(`  ✅ 패스 시도: ${clip.playType} (총 ${passingAttempts}회)`);
            }
            if (clip.playType === 'PASS') {
                passingCompletions++;
                console.log(`  ✅ 패스 성공: ${clip.gainYard}야드 (총 ${passingCompletions}회)`);
            }
            if (clip.playType === 'PASS') {
                passingYards += clip.gainYard;
                if (clip.gainYard > longestPass) {
                    longestPass = clip.gainYard;
                    console.log(`  🏈 새로운 최장 패스: ${longestPass}야드`);
                }
                console.log(`  ✅ 패싱 야드: +${clip.gainYard} (총 ${passingYards}야드)`);
            }
            if (clip.playType === 'SACK') {
                sacks++;
                console.log(`  💥 색(playType): 총 ${sacks}회`);
            }
            const hasSignificantPlay = clip.significantPlays &&
                Array.isArray(clip.significantPlays) &&
                clip.significantPlays.some((play) => play !== null);
            if (hasSignificantPlay) {
                const plays = clip.significantPlays.filter((play) => play !== null);
                for (const play of plays) {
                    if (play === 'TOUCHDOWN' && clip.playType === 'PASS') {
                        passingTouchdowns++;
                        console.log(`  🎯 패싱 터치다운: 총 ${passingTouchdowns}회`);
                    }
                    else if (play === 'INTERCEPT' || play === 'INTERCEPTION') {
                        passingInterceptions++;
                        console.log(`  ❌ 인터셉션: 총 ${passingInterceptions}회`);
                    }
                    else if (play === 'SACK') {
                        sacks++;
                        console.log(`  💥 색(significantPlay): 총 ${sacks}회`);
                    }
                }
            }
        }
        const completionPercentage = passingAttempts > 0
            ? Math.round((passingCompletions / passingAttempts) * 100)
            : 0;
        const finalStats = {
            gamesPlayed: 1,
            passingAttempts,
            passingCompletions,
            completionPercentage,
            passingYards,
            passingTouchdowns,
            passingInterceptions,
            longestPass,
            sacks,
        };
        console.log('\n📊 최종 통계 결과:');
        console.log(`  🎯 패스 시도: ${passingAttempts}회`);
        console.log(`  ✅ 패스 성공: ${passingCompletions}회`);
        console.log(`  📈 패스 성공률: ${completionPercentage}%`);
        console.log(`  🏈 패싱 야드: ${passingYards}야드`);
        console.log(`  🎯 패싱 터치다운: ${passingTouchdowns}회`);
        console.log(`  ❌ 인터셉션: ${passingInterceptions}회`);
        console.log(`  🏈 최장 패스: ${longestPass}야드`);
        console.log(`  💥 색: ${sacks}회`);
        return finalStats;
    }
    async updatePlayerStats(jerseyNumber, teamName, stats) {
        try {
            const player = await this.playerModel.findOneAndUpdate({ jerseyNumber: jerseyNumber, teamName: teamName }, {
                $set: {
                    'stats.gamesPlayed': stats.gamesPlayed,
                    'stats.passingAttempts': stats.passingAttempts,
                    'stats.passingCompletions': stats.passingCompletions,
                    'stats.completionPercentage': stats.completionPercentage,
                    'stats.passingYards': stats.passingYards,
                    'stats.passingTouchdowns': stats.passingTouchdowns,
                    'stats.passingInterceptions': stats.passingInterceptions,
                    'stats.longestPass': stats.longestPass,
                    'stats.sacks': stats.sacks,
                },
            }, { new: true });
            if (player) {
                console.log(`💾 데이터베이스 업데이트 완료: ${teamName} ${jerseyNumber}번`);
            }
            else {
                console.log(`❌ 선수를 찾을 수 없음: ${teamName} ${jerseyNumber}번`);
            }
        }
        catch (error) {
            console.error(`❌ 데이터베이스 업데이트 실패:`, error);
        }
    }
    generateSummaryReport(qbResults) {
        console.log('\n📋 ===== QB 분석 완료 요약 =====');
        console.log(`🏈 총 분석된 QB: ${qbResults.length}명`);
        qbResults.forEach((qb) => {
            console.log(`\n👤 ${qb.teamName} ${qb.jerseyNumber}번`);
            console.log(`   패스 성공률: ${qb.stats.completionPercentage}%`);
            console.log(`   총 패싱 야드: ${qb.stats.passingYards}야드`);
            console.log(`   터치다운: ${qb.stats.passingTouchdowns}회`);
            console.log(`   인터셉션: ${qb.stats.passingInterceptions}회`);
        });
        console.log('\n================================');
    }
};
exports.QbAnalyzerService = QbAnalyzerService;
exports.QbAnalyzerService = QbAnalyzerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(player_schema_1.Player.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], QbAnalyzerService);
//# sourceMappingURL=qb-analyzer.service.js.map