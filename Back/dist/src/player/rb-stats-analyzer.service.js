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
exports.RbStatsAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const player_schema_1 = require("../schemas/player.schema");
let RbStatsAnalyzerService = class RbStatsAnalyzerService {
    playerModel;
    constructor(playerModel) {
        this.playerModel = playerModel;
    }
    calculateYards(startYard, startSide, endYard, endSide) {
        if (startSide === endSide) {
            if (startSide === 'own') {
                return endYard - startYard;
            }
            else {
                return startYard - endYard;
            }
        }
        if (startSide === 'own' && endSide === 'opp') {
            return 50 - startYard + (50 - endYard);
        }
        else {
            return 50 - startYard + (50 - endYard);
        }
    }
    async analyzeRbStats(clips, playerId) {
        const rbStats = {
            gamesPlayed: 0,
            rushingAttempts: 0,
            rushingYards: 0,
            yardsPerCarry: 0,
            rushingTouchdowns: 0,
            longestRush: 0,
            receivingTargets: 0,
            receptions: 0,
            receivingYards: 0,
            yardsPerReception: 0,
            receivingTouchdowns: 0,
            longestReception: 0,
            receivingFirstDowns: 0,
            fumbles: 0,
            fumblesLost: 0,
            kickReturns: 0,
            kickReturnYards: 0,
            yardsPerKickReturn: 0,
            puntReturns: 0,
            puntReturnYards: 0,
            yardsPerPuntReturn: 0,
            returnTouchdowns: 0,
        };
        const gameIds = new Set();
        const player = await this.playerModel.findOne({
            jerseyNumber: parseInt(playerId),
        });
        if (!player) {
            throw new Error(`등번호 ${playerId}번 선수를 찾을 수 없습니다.`);
        }
        for (let i = 0; i < clips.length; i++) {
            const clip = clips[i];
            const nextClip = clips[i + 1];
            if (clip.clipKey) {
                gameIds.add(clip.clipKey);
            }
            const isOffender = this.isPlayerInOffense(clip, playerId);
            if (!isOffender) {
                continue;
            }
            this.analyzeSignificantPlaysNew(clip, rbStats, playerId, nextClip);
            this.analyzeBasicOffensivePlay(clip, rbStats, playerId, nextClip);
        }
        rbStats.gamesPlayed =
            (player.stats?.RB?.gamesPlayed ||
                player.stats?.totalGamesPlayed ||
                0) + 1;
        rbStats.yardsPerCarry =
            rbStats.rushingAttempts > 0
                ? Math.round((rbStats.rushingYards / rbStats.rushingAttempts) * 10) / 10
                : 0;
        rbStats.yardsPerReception =
            rbStats.receptions > 0
                ? Math.round((rbStats.receivingYards / rbStats.receptions) * 10) / 10
                : 0;
        rbStats.yardsPerKickReturn =
            rbStats.kickReturns > 0
                ? Math.round((rbStats.kickReturnYards / rbStats.kickReturns) * 10) / 10
                : 0;
        rbStats.yardsPerPuntReturn =
            rbStats.puntReturns > 0
                ? Math.round((rbStats.puntReturnYards / rbStats.puntReturns) * 10) / 10
                : 0;
        return rbStats;
    }
    analyzeRushingPlay(clip, stats, yards, hasTouchdown) {
        stats.rushingAttempts++;
        stats.rushingYards += yards;
        if (yards > stats.longestRush) {
            stats.longestRush = yards;
        }
        if (hasTouchdown) {
            stats.rushingTouchdowns++;
        }
    }
    analyzeReceivingPlay(clip, stats, yards, hasTouchdown, nextClip) {
        stats.receivingTargets++;
        stats.receptions++;
        stats.receivingYards += yards;
        if (yards > stats.longestReception) {
            stats.longestReception = yards;
        }
        if (hasTouchdown) {
            stats.receivingTouchdowns++;
        }
        if (nextClip && nextClip.down === '1') {
            stats.receivingFirstDowns++;
        }
    }
    analyzeKickReturnPlay(clip, stats, yards, hasTouchdown) {
        stats.kickReturns++;
        stats.kickReturnYards += yards;
        if (hasTouchdown) {
            stats.returnTouchdowns++;
        }
    }
    analyzePuntReturnPlay(clip, stats, yards, hasTouchdown) {
        stats.puntReturns++;
        stats.puntReturnYards += yards;
        if (hasTouchdown) {
            stats.returnTouchdowns++;
        }
    }
    isPlayerInOffense(clip, playerId) {
        const playerNum = parseInt(playerId);
        return ((clip.car?.num === playerNum && clip.car?.pos === 'RB') ||
            (clip.car2?.num === playerNum && clip.car2?.pos === 'RB'));
    }
    analyzeSignificantPlaysNew(clip, stats, playerId, nextClip) {
        if (!clip.significantPlays)
            return;
        const playerNum = parseInt(playerId);
        const isRB = (clip.car?.num === playerNum && clip.car?.pos === 'RB') ||
            (clip.car2?.num === playerNum && clip.car2?.pos === 'RB');
        if (!isRB)
            return;
        const significantPlays = clip.significantPlays;
        const playType = clip.playType;
        const gainYard = clip.gainYard || 0;
        if (significantPlays.includes('TOUCHDOWN') && playType === 'RUN') {
            stats.rushingTouchdowns += 1;
            stats.rushingAttempts += 1;
            stats.rushingYards += gainYard;
            if (gainYard > stats.longestRush) {
                stats.longestRush = gainYard;
            }
        }
        else if (significantPlays.includes('TOUCHDOWN') &&
            (playType === 'PASS' || playType === 'PassComplete')) {
            stats.receivingTouchdowns += 1;
            stats.receivingTargets += 1;
            stats.receptions += 1;
            stats.receivingYards += gainYard;
            if (gainYard > stats.longestReception) {
                stats.longestReception = gainYard;
            }
            stats.receivingFirstDowns += 1;
        }
        else if (significantPlays.includes('TOUCHDOWN') && playType === 'Kickoff') {
            stats.returnTouchdowns += 1;
            stats.kickReturns += 1;
            stats.kickReturnYards += gainYard;
        }
        else if (significantPlays.includes('TOUCHDOWN') && playType === 'Punt') {
            stats.returnTouchdowns += 1;
            stats.puntReturns += 1;
            stats.puntReturnYards += gainYard;
        }
        else if (significantPlays.includes('FUMBLE') && playType === 'RUN') {
            stats.fumbles += 1;
            stats.rushingAttempts += 1;
            if (significantPlays.includes('FUMBLERECOFF')) {
                const startYard = clip.start?.yard || 0;
                const endYard = clip.end?.yard || 0;
                const actualGain = gainYard < 0 ? gainYard : Math.min(gainYard, endYard - startYard);
                stats.rushingYards += actualGain;
            }
            else if (significantPlays.includes('FUMBLERECDEF')) {
                stats.rushingYards += gainYard;
                stats.fumblesLost += 1;
            }
        }
        else if (significantPlays.includes('FUMBLE') &&
            (playType === 'PASS' || playType === 'PassComplete')) {
            stats.fumbles += 1;
            stats.receivingTargets += 1;
            stats.receptions += 1;
            stats.receivingYards += gainYard;
            if (significantPlays.includes('FUMBLERECDEF')) {
                stats.fumblesLost += 1;
            }
        }
        else if (significantPlays.includes('TFL') && playType === 'RUN') {
            stats.rushingAttempts += 1;
            stats.rushingYards += gainYard;
        }
        else if (playType === 'PASS' || playType === 'PassComplete') {
            stats.receivingTargets += 1;
            if (gainYard > 0) {
                stats.receptions += 1;
                stats.receivingYards += gainYard;
                if (gainYard > stats.longestReception) {
                    stats.longestReception = gainYard;
                }
                if (nextClip && nextClip.down === '1') {
                    stats.receivingFirstDowns += 1;
                }
            }
        }
        else if (playType === 'NOPASS' || playType === 'PassIncomplete') {
            stats.receivingTargets += 1;
        }
        else if (playType === 'RUN') {
            stats.rushingAttempts += 1;
            stats.rushingYards += gainYard;
            if (gainYard > stats.longestRush) {
                stats.longestRush = gainYard;
            }
        }
        else if (playType === 'Kickoff') {
            stats.kickReturns += 1;
            stats.kickReturnYards += gainYard;
        }
        else if (playType === 'Punt') {
            stats.puntReturns += 1;
            stats.puntReturnYards += gainYard;
        }
    }
    analyzeBasicOffensivePlay(clip, stats, playerId, nextClip) {
        const playerNum = parseInt(playerId);
        const isThisPlayerCarrier = (clip.car?.num === playerNum && clip.car?.pos === 'RB') ||
            (clip.car2?.num === playerNum && clip.car2?.pos === 'RB');
        if (!isThisPlayerCarrier)
            return;
        const hasSpecialPlay = clip.significantPlays?.some((play) => play === 'TOUCHDOWN' || play === 'FUMBLE' || play === 'FUMBLELOSOFF');
        if (!hasSpecialPlay) {
            if (clip.playType === 'RUN') {
                stats.rushingAttempts += 1;
                if (clip.gainYard && clip.gainYard >= 0) {
                    stats.rushingYards += clip.gainYard;
                    if (clip.gainYard > stats.longestRush) {
                        stats.longestRush = clip.gainYard;
                    }
                }
            }
            else if (clip.playType === 'PASS' || clip.playType === 'PassComplete') {
                stats.receivingTargets += 1;
                if (clip.gainYard && clip.gainYard > 0) {
                    stats.receptions += 1;
                    stats.receivingYards += clip.gainYard;
                    if (clip.gainYard > stats.longestReception) {
                        stats.longestReception = clip.gainYard;
                    }
                    if (nextClip && nextClip.down === '1') {
                        stats.receivingFirstDowns += 1;
                    }
                }
            }
            else if (clip.playType === 'Kickoff') {
                stats.kickReturns += 1;
                if (clip.gainYard && clip.gainYard >= 0) {
                    stats.kickReturnYards += clip.gainYard;
                }
            }
            else if (clip.playType === 'Punt') {
                stats.puntReturns += 1;
                if (clip.gainYard && clip.gainYard >= 0) {
                    stats.puntReturnYards += clip.gainYard;
                }
            }
        }
    }
    async generateSampleRbStats(playerId = 'RB001') {
        const sampleClips = [
            {
                clipKey: 'SAMPLE_GAME_1',
                offensiveTeam: 'Away',
                quarter: 1,
                down: '1',
                toGoYard: 10,
                playType: 'RUN',
                specialTeam: false,
                start: { side: 'OWN', yard: 30 },
                end: { side: 'OWN', yard: 38 },
                gainYard: 8,
                car: { num: parseInt(playerId), pos: 'RB' },
                car2: { num: null, pos: null },
                tkl: { num: null, pos: null },
                tkl2: { num: null, pos: null },
                significantPlays: [null, null, null, null],
            },
            {
                clipKey: 'SAMPLE_GAME_1',
                offensiveTeam: 'Away',
                quarter: 1,
                down: '2',
                toGoYard: 5,
                playType: 'PASS',
                specialTeam: false,
                start: { side: 'OWN', yard: 38 },
                end: { side: 'OPP', yard: 47 },
                gainYard: 25,
                car: { num: parseInt(playerId), pos: 'RB' },
                car2: { num: null, pos: null },
                tkl: { num: null, pos: null },
                tkl2: { num: null, pos: null },
                significantPlays: ['TOUCHDOWN', null, null, null],
            },
        ];
        const result = await this.analyzeRbStats(sampleClips, playerId);
        return result;
    }
};
exports.RbStatsAnalyzerService = RbStatsAnalyzerService;
exports.RbStatsAnalyzerService = RbStatsAnalyzerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(player_schema_1.Player.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RbStatsAnalyzerService);
//# sourceMappingURL=rb-stats-analyzer.service.js.map