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
exports.TeamStatsAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const team_game_stats_schema_1 = require("../schemas/team-game-stats.schema");
const team_total_stats_schema_1 = require("../schemas/team-total-stats.schema");
let TeamStatsAnalyzerService = class TeamStatsAnalyzerService {
    teamGameStatsModel;
    teamTotalStatsModel;
    constructor(teamGameStatsModel, teamTotalStatsModel) {
        this.teamGameStatsModel = teamGameStatsModel;
        this.teamTotalStatsModel = teamTotalStatsModel;
    }
    async analyzeTeamStats(gameData) {
        console.log('팀 스탯 분석 시작:', gameData.gameKey);
        const homeTeamStats = this.createEmptyStats(gameData.homeTeam || 'Home');
        const awayTeamStats = this.createEmptyStats(gameData.awayTeam || 'Away');
        for (const clip of gameData.Clips || []) {
            this.analyzeClip(clip, homeTeamStats, awayTeamStats);
        }
        homeTeamStats.totalYards =
            homeTeamStats.passingYards + homeTeamStats.rushingYards;
        awayTeamStats.totalYards =
            awayTeamStats.passingYards + awayTeamStats.rushingYards;
        homeTeamStats.totalReturnYards =
            homeTeamStats.puntReturnYards +
                homeTeamStats.kickReturnYards +
                homeTeamStats.interceptionReturnYards;
        awayTeamStats.totalReturnYards =
            awayTeamStats.puntReturnYards +
                awayTeamStats.kickReturnYards +
                awayTeamStats.interceptionReturnYards;
        homeTeamStats.totalPoints =
            homeTeamStats.touchdowns * 6 +
                homeTeamStats.fieldGoals * 3 +
                homeTeamStats.patGood * 1 +
                homeTeamStats.twoPtGood * 2 +
                homeTeamStats.safeties * 2;
        awayTeamStats.totalPoints =
            awayTeamStats.touchdowns * 6 +
                awayTeamStats.fieldGoals * 3 +
                awayTeamStats.patGood * 1 +
                awayTeamStats.twoPtGood * 2 +
                awayTeamStats.safeties * 2;
        console.log('팀 스탯 분석 완료');
        return {
            homeTeamStats,
            awayTeamStats,
        };
    }
    analyzeClip(clip, homeTeamStats, awayTeamStats) {
        const gainYard = clip.gainYard || 0;
        const playType = clip.playType;
        const significantPlays = clip.significantPlays || [];
        const offensiveTeam = clip.offensiveTeam;
        const isHomeOffense = offensiveTeam === 'Home';
        const offenseStats = isHomeOffense ? homeTeamStats : awayTeamStats;
        const defenseStats = isHomeOffense ? awayTeamStats : homeTeamStats;
        if (playType === 'PASS' || playType === 'PassComplete') {
            offenseStats.passingAttempts += 1;
            offenseStats.passingCompletions += 1;
            if (gainYard > 0) {
                offenseStats.passingYards += gainYard;
            }
            if (significantPlays.includes('TOUCHDOWN') &&
                !significantPlays.includes('TURNOVER')) {
                offenseStats.passingTouchdowns =
                    (offenseStats.passingTouchdowns || 0) + 1;
            }
        }
        else if (playType === 'NOPASS' || playType === 'PassIncomplete') {
            offenseStats.passingAttempts += 1;
        }
        if (playType === 'RUN' || playType === 'Run') {
            offenseStats.rushingAttempts += 1;
            offenseStats.rushingYards += gainYard;
            if (significantPlays.includes('TOUCHDOWN') &&
                !significantPlays.includes('TURNOVER')) {
                offenseStats.rushingTouchdowns =
                    (offenseStats.rushingTouchdowns || 0) + 1;
            }
            if (significantPlays.includes('FUMBLE') && (clip.car?.pos === 'OL' || clip.car2?.pos === 'OL')) {
                offenseStats.fumbles += 1;
                console.log(`   🏈 팀 런 펌블 (OL 스냅 미스) 기록! 팀: ${isHomeOffense ? '홈' : '어웨이'}`);
            }
        }
        if (playType === 'PUNT' || playType === 'Punt') {
            offenseStats.puntAttempts += 1;
            const isBlocked = clip.tkl?.num || clip.tkl2?.num;
            if (isBlocked) {
                offenseStats.puntYards += 0;
            }
            else {
                const puntYards = Math.abs(gainYard);
                offenseStats.puntYards += puntYards;
            }
            if (!isBlocked && gainYard !== 0) {
                const returningTeam = isHomeOffense ? awayTeamStats : homeTeamStats;
                returningTeam.puntReturns += 1;
                returningTeam.puntReturnYards += Math.abs(gainYard);
            }
        }
        if (playType === 'KICKOFF' || playType === 'Kickoff') {
            const kickoffYards = Math.abs(gainYard);
            const returningTeam = isHomeOffense ? awayTeamStats : homeTeamStats;
            returningTeam.kickReturns += 1;
            returningTeam.kickReturnYards += kickoffYards;
        }
        if (significantPlays.includes('INTERCEPT') &&
            significantPlays.includes('TURNOVER')) {
            offenseStats.interceptions += 1;
            offenseStats.turnovers += 1;
            if (!defenseStats.opponentTurnovers)
                defenseStats.opponentTurnovers = 0;
            defenseStats.opponentTurnovers += 1;
            console.log(`   🔥 팀 인터셉트 기록! 팀: ${isHomeOffense ? '홈' : '어웨이'}`);
            if (gainYard > 0) {
                defenseStats.interceptionReturnYards += gainYard;
            }
        }
        if (significantPlays.includes('TOUCHDOWN')) {
            if (significantPlays.includes('TURNOVER')) {
                defenseStats.touchdowns += 1;
            }
            else {
                offenseStats.touchdowns += 1;
            }
        }
        if (significantPlays.includes('Sack') ||
            significantPlays.includes('SACK')) {
            defenseStats.sacks += 1;
            console.log(`   🔥 팀 색 기록! 팀: ${isHomeOffense ? '어웨이' : '홈'}`);
            if (gainYard < 0) {
                offenseStats.sackYards += Math.abs(gainYard);
            }
        }
        if (significantPlays.includes('FUMBLE')) {
            offenseStats.fumbles += 1;
            console.log(`   🔥 팀 펌블 기록! 팀: ${isHomeOffense ? '홈' : '어웨이'}`);
        }
        if (significantPlays.includes('TURNOVER') &&
            significantPlays.includes('FUMBLERECDEF')) {
            offenseStats.fumblesLost += 1;
            offenseStats.turnovers += 1;
            if (!defenseStats.opponentTurnovers)
                defenseStats.opponentTurnovers = 0;
            defenseStats.opponentTurnovers += 1;
            console.log(`   🔥 팀 펌블 로스트 기록! 팀: ${isHomeOffense ? '홈' : '어웨이'}`);
        }
        if (playType === 'FIELDGOAL' ||
            playType === 'FieldGoal' ||
            playType === 'FG') {
            offenseStats.fieldGoalAttempts += 1;
            if (significantPlays.includes('FIELDGOALGOOD') ||
                significantPlays.includes('FIELDGOAL') ||
                significantPlays.includes('FG')) {
                offenseStats.fieldGoals += 1;
            }
        }
        if (playType === 'PAT') {
            if (significantPlays.includes('PATGOOD')) {
                offenseStats.patGood += 1;
            }
        }
        if (playType === '2PT' || playType === 'TWOPOINT') {
            if (significantPlays.includes('2PTGOOD') ||
                significantPlays.includes('TWOPTGOOD')) {
                offenseStats.twoPtGood += 1;
            }
        }
        if (significantPlays.includes('SAFETY')) {
            defenseStats.safeties += 1;
        }
        const isPenalty = significantPlays.some((play) => play &&
            (play.includes('PENALTY.HOME') || play.includes('PENALTY.AWAY')));
        if (isPenalty) {
            const isHomePenalty = significantPlays.some((play) => play && play.includes('PENALTY.HOME'));
            const isAwayPenalty = significantPlays.some((play) => play && play.includes('PENALTY.AWAY'));
            if ((isHomeOffense && isHomePenalty) ||
                (!isHomeOffense && isAwayPenalty)) {
                offenseStats.penalties += 1;
                offenseStats.penaltyYards += Math.abs(gainYard);
            }
            else if ((isHomeOffense && isAwayPenalty) ||
                (!isHomeOffense && isHomePenalty)) {
                defenseStats.penalties += 1;
                defenseStats.penaltyYards += Math.abs(gainYard);
            }
        }
    }
    async saveTeamStats(gameKey, teamStatsResult, gameData) {
        console.log('팀 스탯 저장:', gameKey);
        try {
            const homeTeamGameStats = new this.teamGameStatsModel({
                teamName: teamStatsResult.homeTeamStats.teamName,
                gameKey,
                date: gameData.date || new Date().toISOString(),
                season: gameData.date
                    ? gameData.date.substring(0, 4)
                    : new Date().getFullYear().toString(),
                opponent: teamStatsResult.awayTeamStats.teamName,
                isHomeGame: true,
                stats: {
                    totalYards: teamStatsResult.homeTeamStats.totalYards,
                    passingYards: teamStatsResult.homeTeamStats.passingYards,
                    rushingYards: teamStatsResult.homeTeamStats.rushingYards,
                    passingAttempts: teamStatsResult.homeTeamStats.passingAttempts,
                    passingCompletions: teamStatsResult.homeTeamStats.passingCompletions,
                    passingTouchdowns: teamStatsResult.homeTeamStats.passingTouchdowns,
                    rushingAttempts: teamStatsResult.homeTeamStats.rushingAttempts,
                    touchdowns: teamStatsResult.homeTeamStats.touchdowns,
                    fieldGoals: teamStatsResult.homeTeamStats.fieldGoals,
                    turnovers: teamStatsResult.homeTeamStats.turnovers,
                    fumbles: teamStatsResult.homeTeamStats.fumbles,
                    sacks: teamStatsResult.homeTeamStats.sacks,
                    interceptions: teamStatsResult.homeTeamStats.interceptions,
                    puntAttempts: teamStatsResult.homeTeamStats.puntAttempts,
                    puntYards: teamStatsResult.homeTeamStats.puntYards,
                    penalties: teamStatsResult.homeTeamStats.penalties,
                    penaltyYards: teamStatsResult.homeTeamStats.penaltyYards,
                },
                finalScore: {
                    own: teamStatsResult.homeTeamStats.totalPoints,
                    opponent: teamStatsResult.awayTeamStats.totalPoints,
                },
            });
            const awayTeamGameStats = new this.teamGameStatsModel({
                teamName: teamStatsResult.awayTeamStats.teamName,
                gameKey,
                date: gameData.date || new Date().toISOString(),
                season: gameData.date
                    ? gameData.date.substring(0, 4)
                    : new Date().getFullYear().toString(),
                opponent: teamStatsResult.homeTeamStats.teamName,
                isHomeGame: false,
                stats: {
                    totalYards: teamStatsResult.awayTeamStats.totalYards,
                    passingYards: teamStatsResult.awayTeamStats.passingYards,
                    rushingYards: teamStatsResult.awayTeamStats.rushingYards,
                    passingAttempts: teamStatsResult.awayTeamStats.passingAttempts,
                    passingCompletions: teamStatsResult.awayTeamStats.passingCompletions,
                    passingTouchdowns: teamStatsResult.awayTeamStats.passingTouchdowns,
                    rushingAttempts: teamStatsResult.awayTeamStats.rushingAttempts,
                    touchdowns: teamStatsResult.awayTeamStats.touchdowns,
                    fieldGoals: teamStatsResult.awayTeamStats.fieldGoals,
                    turnovers: teamStatsResult.awayTeamStats.turnovers,
                    fumbles: teamStatsResult.awayTeamStats.fumbles,
                    sacks: teamStatsResult.awayTeamStats.sacks,
                    interceptions: teamStatsResult.awayTeamStats.interceptions,
                    puntAttempts: teamStatsResult.awayTeamStats.puntAttempts,
                    puntYards: teamStatsResult.awayTeamStats.puntYards,
                    penalties: teamStatsResult.awayTeamStats.penalties,
                    penaltyYards: teamStatsResult.awayTeamStats.penaltyYards,
                },
                finalScore: {
                    own: teamStatsResult.awayTeamStats.totalPoints,
                    opponent: teamStatsResult.homeTeamStats.totalPoints,
                },
            });
            await homeTeamGameStats.save();
            await awayTeamGameStats.save();
            console.log('✅ 게임별 팀 스탯 저장 완료');
            await this.updateTeamTotalStats(teamStatsResult.homeTeamStats, gameKey);
            await this.updateTeamTotalStats(teamStatsResult.awayTeamStats, gameKey);
            console.log('✅ 팀 누적 스탯 업데이트 완료');
        }
        catch (error) {
            console.error('❌ 팀 스탯 저장 중 오류:', error);
            throw error;
        }
    }
    async updateTeamTotalStats(teamStats, gameKey) {
        const existingStats = await this.teamTotalStatsModel.findOne({
            teamName: teamStats.teamName,
        });
        if (existingStats) {
            existingStats.totalYards =
                (existingStats.totalYards || 0) + teamStats.totalYards;
            existingStats.passingYards =
                (existingStats.passingYards || 0) + teamStats.passingYards;
            existingStats.rushingYards =
                (existingStats.rushingYards || 0) + teamStats.rushingYards;
            existingStats.passAttempts =
                (existingStats.passAttempts || 0) + teamStats.passingAttempts;
            existingStats.passCompletions =
                (existingStats.passCompletions || 0) + teamStats.passingCompletions;
            existingStats.passingTouchdowns =
                (existingStats.passingTouchdowns || 0) + teamStats.passingTouchdowns;
            existingStats.rushingAttempts =
                (existingStats.rushingAttempts || 0) + teamStats.rushingAttempts;
            existingStats.totalTouchdowns =
                (existingStats.totalTouchdowns || 0) + teamStats.touchdowns;
            existingStats.rushingTouchdowns =
                (existingStats.rushingTouchdowns || 0) + teamStats.rushingTouchdowns;
            existingStats.fieldGoalMakes =
                (existingStats.fieldGoalMakes || 0) + teamStats.fieldGoals;
            existingStats.totalPoints =
                (existingStats.totalPoints || 0) + teamStats.totalPoints;
            existingStats.interceptions =
                (existingStats.interceptions || 0) + teamStats.interceptions;
            existingStats.totalPunts =
                (existingStats.totalPunts || 0) + teamStats.puntAttempts;
            existingStats.totalPuntYards =
                (existingStats.totalPuntYards || 0) + teamStats.puntYards;
            existingStats.kickReturns =
                (existingStats.kickReturns || 0) + teamStats.kickReturns;
            existingStats.kickReturnYards =
                (existingStats.kickReturnYards || 0) + teamStats.kickReturnYards;
            existingStats.puntReturns =
                (existingStats.puntReturns || 0) + teamStats.puntReturns;
            existingStats.puntReturnYards =
                (existingStats.puntReturnYards || 0) + teamStats.puntReturnYards;
            existingStats.fumbles = (existingStats.fumbles || 0) + teamStats.fumbles;
            existingStats.fumblesLost =
                (existingStats.fumblesLost || 0) + teamStats.fumblesLost;
            existingStats.totalTurnovers =
                (existingStats.totalTurnovers || 0) + teamStats.turnovers;
            existingStats.opponentTurnovers =
                (existingStats.opponentTurnovers || 0) + teamStats.opponentTurnovers;
            existingStats.penalties =
                (existingStats.penalties || 0) + teamStats.penalties;
            existingStats.penaltyYards =
                (existingStats.penaltyYards || 0) + teamStats.penaltyYards;
            existingStats.gamesPlayed += 1;
            existingStats.processedGames.push(gameKey);
            await existingStats.save();
        }
        else {
            const newTeamStats = new this.teamTotalStatsModel({
                teamName: teamStats.teamName,
                totalYards: teamStats.totalYards,
                passingYards: teamStats.passingYards,
                rushingYards: teamStats.rushingYards,
                passAttempts: teamStats.passingAttempts,
                passCompletions: teamStats.passingCompletions,
                passingTouchdowns: teamStats.passingTouchdowns,
                rushingAttempts: teamStats.rushingAttempts,
                rushingTouchdowns: teamStats.rushingTouchdowns,
                totalTouchdowns: teamStats.touchdowns,
                fieldGoalMakes: teamStats.fieldGoals,
                totalPoints: teamStats.totalPoints,
                interceptions: teamStats.interceptions,
                totalPunts: teamStats.puntAttempts,
                totalPuntYards: teamStats.puntYards,
                kickReturns: teamStats.kickReturns,
                kickReturnYards: teamStats.kickReturnYards,
                puntReturns: teamStats.puntReturns,
                puntReturnYards: teamStats.puntReturnYards,
                fumbles: teamStats.fumbles,
                fumblesLost: teamStats.fumblesLost,
                totalTurnovers: teamStats.turnovers,
                opponentTurnovers: teamStats.opponentTurnovers,
                penalties: teamStats.penalties,
                penaltyYards: teamStats.penaltyYards,
                gamesPlayed: 1,
                wins: 0,
                losses: 0,
                ties: 0,
                processedGames: [gameKey],
                season: new Date().getFullYear().toString(),
            });
            await newTeamStats.save();
        }
    }
    async getTeamStatsByGame(gameKey) {
        console.log('🔍 팀 스탯 조회 시작:', gameKey);
        const gameStats = await this.teamGameStatsModel.find({ gameKey });
        if (gameStats.length !== 2) {
            console.log(`❌ 게임 스탯 개수 부족: ${gameStats.length}개 (2개 필요)`);
            return null;
        }
        const homeStats = gameStats.find((stat) => stat.isHomeGame);
        const awayStats = gameStats.find((stat) => !stat.isHomeGame);
        if (!homeStats || !awayStats) {
            console.log('❌ 홈/어웨이 스탯을 찾을 수 없습니다');
            return null;
        }
        console.log('✅ 팀 스탯 조회 성공');
        return {
            homeTeamStats: this.convertToTeamStatsData(homeStats),
            awayTeamStats: this.convertToTeamStatsData(awayStats),
        };
    }
    convertToTeamStatsData(stats) {
        const totalPlays = (stats.stats?.passingAttempts || 0) + (stats.stats?.rushingAttempts || 0);
        const playCallRatio = {
            runPlays: stats.stats?.rushingAttempts || 0,
            passPlays: stats.stats?.passingAttempts || 0,
            runPercentage: totalPlays > 0 ? Math.round(((stats.stats?.rushingAttempts || 0) / totalPlays) * 100) : 0,
            passPercentage: totalPlays > 0 ? Math.round(((stats.stats?.passingAttempts || 0) / totalPlays) * 100) : 0,
        };
        const thirdDownStats = {
            attempts: stats.stats?.thirdDownAttempts || 0,
            conversions: stats.stats?.thirdDownMade || 0,
            percentage: (stats.stats?.thirdDownAttempts || 0) > 0
                ? Math.round(((stats.stats?.thirdDownMade || 0) / (stats.stats?.thirdDownAttempts || 0)) * 100)
                : 0,
        };
        return {
            teamName: stats.teamName,
            totalYards: stats.stats?.totalYards || 0,
            passingYards: stats.stats?.passingYards || 0,
            rushingYards: stats.stats?.rushingYards || 0,
            interceptionReturnYards: stats.stats?.interceptionReturnYards || 0,
            puntReturnYards: stats.stats?.puntReturnYards || 0,
            kickoffReturnYards: stats.stats?.kickoffReturnYards || 0,
            turnovers: stats.stats?.turnovers || 0,
            penaltyYards: stats.stats?.penaltyYards || 0,
            sackYards: stats.stats?.sackYards || 0,
            puntAttempts: stats.stats?.puntAttempts || 0,
            puntYards: stats.stats?.puntYards || 0,
            fumbles: stats.stats?.fumbles || 0,
            fumblesLost: stats.stats?.fumblesLost || 0,
            passingAttempts: stats.stats?.passingAttempts || 0,
            passingCompletions: stats.stats?.passingCompletions || 0,
            passingTouchdowns: stats.stats?.passingTouchdowns || 0,
            rushingAttempts: stats.stats?.rushingAttempts || 0,
            rushingTouchdowns: stats.stats?.rushingTouchdowns || 0,
            interceptions: stats.stats?.interceptions || 0,
            sacks: stats.stats?.sacks || 0,
            kickReturns: stats.stats?.kickReturns || 0,
            puntReturns: stats.stats?.puntReturns || 0,
            interceptionReturns: stats.stats?.interceptionReturns || 0,
            kickReturnYards: stats.stats?.kickReturnYards || 0,
            totalReturnYards: stats.stats?.totalReturnYards || 0,
            penalties: stats.stats?.penalties || 0,
            touchbacks: stats.stats?.touchbacks || 0,
            fieldGoalAttempts: stats.stats?.fieldGoalAttempts || 0,
            touchdowns: stats.stats?.touchdowns,
            fieldGoals: stats.stats?.fieldGoals,
            playCallRatio: playCallRatio,
            thirdDownStats: thirdDownStats,
            totalPoints: stats.stats?.totalPoints,
        };
    }
    async analyzeGameForDisplay(gameData) {
        if (!gameData) {
            throw new Error('경기 데이터가 없습니다');
        }
        console.log('경기 분석 시작:', gameData.gameKey || '키없음');
        console.log('홈팀:', gameData.homeTeam, '어웨이팀:', gameData.awayTeam);
        const homeTeamStats = this.createEmptyStats(gameData.homeTeam || 'Home');
        const awayTeamStats = this.createEmptyStats(gameData.awayTeam || 'Away');
        const thirdDownData = {
            home: { attempts: 0, conversions: 0 },
            away: { attempts: 0, conversions: 0 },
        };
        for (let i = 0; i < (gameData.Clips || []).length; i++) {
            const clip = gameData.Clips[i];
            if (clip.down === 3) {
                const isHomeOffense = clip.offensiveTeam === 'Home';
                const thirdDownTeam = isHomeOffense
                    ? thirdDownData.home
                    : thirdDownData.away;
                thirdDownTeam.attempts++;
                if (i + 1 < gameData.Clips.length) {
                    const nextClip = gameData.Clips[i + 1];
                    if (nextClip.offensiveTeam === clip.offensiveTeam &&
                        nextClip.down === 1) {
                        thirdDownTeam.conversions++;
                    }
                }
            }
            this.analyzeClip(clip, homeTeamStats, awayTeamStats);
        }
        homeTeamStats.totalYards =
            homeTeamStats.passingYards + homeTeamStats.rushingYards;
        awayTeamStats.totalYards =
            awayTeamStats.passingYards + awayTeamStats.rushingYards;
        console.log('홈팀 스탯:', {
            팀명: homeTeamStats.teamName,
            패싱: homeTeamStats.passingAttempts,
            러싱: homeTeamStats.rushingAttempts,
            총야드: homeTeamStats.totalYards,
        });
        console.log('어웨이팀 스탯:', {
            팀명: awayTeamStats.teamName,
            패싱: awayTeamStats.passingAttempts,
            러싱: awayTeamStats.rushingAttempts,
            총야드: awayTeamStats.totalYards,
        });
        const calculatePlayCallRatio = (stats) => {
            const totalPlays = stats.passingAttempts + stats.rushingAttempts;
            return {
                runPlays: stats.rushingAttempts,
                passPlays: stats.passingAttempts,
                runPercentage: totalPlays > 0
                    ? Math.round((stats.rushingAttempts / totalPlays) * 100)
                    : 0,
                passPercentage: totalPlays > 0
                    ? Math.round((stats.passingAttempts / totalPlays) * 100)
                    : 0,
            };
        };
        const calculateThirdDownStats = (data) => {
            return {
                attempts: data.attempts,
                conversions: data.conversions,
                percentage: data.attempts > 0
                    ? Math.round((data.conversions / data.attempts) * 100)
                    : 0,
            };
        };
        return {
            homeTeam: {
                teamName: homeTeamStats.teamName,
                playCallRatio: calculatePlayCallRatio(homeTeamStats),
                totalYards: homeTeamStats.totalYards,
                passingYards: homeTeamStats.passingYards,
                rushingYards: homeTeamStats.rushingYards,
                thirdDownStats: calculateThirdDownStats(thirdDownData.home),
                turnovers: homeTeamStats.turnovers,
                penaltyYards: homeTeamStats.penaltyYards,
            },
            awayTeam: {
                teamName: awayTeamStats.teamName,
                playCallRatio: calculatePlayCallRatio(awayTeamStats),
                totalYards: awayTeamStats.totalYards,
                passingYards: awayTeamStats.passingYards,
                rushingYards: awayTeamStats.rushingYards,
                thirdDownStats: calculateThirdDownStats(thirdDownData.away),
                turnovers: awayTeamStats.turnovers,
                penaltyYards: awayTeamStats.penaltyYards,
            },
        };
    }
    async getAllTeamTotalStats(league) {
        console.log(`팀 누적 스탯 조회 - 리그: ${league || '전체'}`);
        try {
            const filter = league ? { league } : {};
            const teamTotalStats = await this.teamTotalStatsModel.find(filter);
            if (teamTotalStats.length > 0) {
                console.log(`✅ ${teamTotalStats.length}개 팀의 team_total_stats 데이터 조회`);
                const formattedStats = teamTotalStats
                    .map((team) => ({
                    teamName: team.teamName,
                    gamesPlayed: team.gamesPlayed || 0,
                    wins: team.wins || 0,
                    losses: team.losses || 0,
                    totalYards: team.totalYards || 0,
                    passingYards: team.passingYards || 0,
                    rushingYards: team.rushingYards || 0,
                    totalPoints: team.totalPoints || 0,
                    touchdowns: team.totalTouchdowns || 0,
                    avgYardsPerGame: team.gamesPlayed > 0
                        ? Math.round((team.totalYards || 0) / team.gamesPlayed)
                        : 0,
                    avgPointsPerGame: team.gamesPlayed > 0
                        ? Math.round((team.totalPoints || 0) / team.gamesPlayed)
                        : 0,
                    rushingAttempts: team.rushingAttempts || 0,
                    rushingTouchdowns: team.rushingTouchdowns || 0,
                    avgRushingYardsPerGame: team.gamesPlayed > 0
                        ? Math.round((team.rushingYards || 0) / team.gamesPlayed)
                        : 0,
                    avgRushingYardsPerCarry: (team.rushingAttempts || 0) > 0
                        ? ((team.rushingYards || 0) / team.rushingAttempts).toFixed(1)
                        : '0.0',
                    passAttempts: team.passAttempts || 0,
                    passCompletions: team.passCompletions || 0,
                    passingTouchdowns: team.passingTouchdowns || 0,
                    interceptions: team.interceptions || 0,
                    passCompletionRate: `${team.passCompletions || 0}-${team.passAttempts || 0}`,
                    avgPassingYardsPerGame: team.gamesPlayed > 0
                        ? Math.round((team.passingYards || 0) / team.gamesPlayed)
                        : 0,
                    avgPassingYardsPerAttempt: (team.passAttempts || 0) > 0
                        ? ((team.passingYards || 0) / team.passAttempts).toFixed(1)
                        : '0.0',
                    totalPuntYards: team.totalPuntYards || 0,
                    totalPunts: team.totalPunts || 0,
                    avgPuntYards: (team.totalPunts || 0) > 0
                        ? ((team.totalPuntYards || 0) / team.totalPunts).toFixed(1)
                        : '0.0',
                    touchbackPercentage: (team.totalPunts || 0) > 0
                        ? (((team.puntTouchbacks || 0) / team.totalPunts) *
                            100).toFixed(1)
                        : '0.0',
                    fieldGoalRate: `${team.fieldGoalMakes || 0}-${team.fieldGoalAttempts || 0}`,
                    avgKickReturnYards: (team.kickReturns || 0) > 0
                        ? ((team.kickReturnYards || 0) / team.kickReturns).toFixed(1)
                        : '0.0',
                    avgPuntReturnYards: (team.puntReturns || 0) > 0
                        ? ((team.puntReturnYards || 0) / team.puntReturns).toFixed(1)
                        : '0.0',
                    totalReturnYards: (team.kickReturnYards || 0) + (team.puntReturnYards || 0),
                    fumbles: team.fumbles || 0,
                    fumblesLost: team.fumblesLost || 0,
                    fumbleRate: `${team.fumbles || 0}-${team.fumblesLost || 0}`,
                    totalTurnovers: team.totalTurnovers || 0,
                    opponentTurnovers: team.opponentTurnovers || 0,
                    avgTurnoversPerGame: team.gamesPlayed > 0
                        ? ((team.totalTurnovers || 0) / team.gamesPlayed).toFixed(1)
                        : '0.0',
                    turnoverDifferential: (team.opponentTurnovers || 0) - (team.totalTurnovers || 0),
                    penalties: team.penalties || 0,
                    penaltyYards: team.penaltyYards || 0,
                    penaltyRate: `${team.penalties || 0}-${team.penaltyYards || 0}`,
                    avgPenaltyYardsPerGame: team.gamesPlayed > 0
                        ? Math.round((team.penaltyYards || 0) / team.gamesPlayed)
                        : 0,
                    lastUpdated: team.updatedAt || new Date(),
                }))
                    .sort((a, b) => b.totalYards - a.totalYards);
                console.log(`✅ ${formattedStats.length}개 팀의 누적 스탯 조회 완료`);
                return formattedStats;
            }
            else {
                console.log('⚠️ team_total_stats 컬렉션에 데이터가 없습니다');
                return [];
            }
        }
        catch (error) {
            console.error('❌ 팀 누적 스탯 조회 중 오류:', error);
            return [];
        }
    }
    createEmptyStats(teamName) {
        return {
            teamName,
            totalYards: 0,
            passingYards: 0,
            rushingYards: 0,
            interceptionReturnYards: 0,
            turnovers: 0,
            opponentTurnovers: 0,
            penaltyYards: 0,
            sackYards: 0,
            puntAttempts: 0,
            puntYards: 0,
            fumbles: 0,
            fumblesLost: 0,
            touchdowns: 0,
            fieldGoals: 0,
            patGood: 0,
            twoPtGood: 0,
            safeties: 0,
            totalPoints: 0,
            passingAttempts: 0,
            passingCompletions: 0,
            passingTouchdowns: 0,
            rushingAttempts: 0,
            rushingTouchdowns: 0,
            interceptions: 0,
            sacks: 0,
            kickReturns: 0,
            kickReturnYards: 0,
            puntReturns: 0,
            puntReturnYards: 0,
            kickoffReturnYards: 0,
            interceptionReturns: 0,
            totalReturnYards: 0,
            penalties: 0,
            touchbacks: 0,
            fieldGoalAttempts: 0,
        };
    }
};
exports.TeamStatsAnalyzerService = TeamStatsAnalyzerService;
exports.TeamStatsAnalyzerService = TeamStatsAnalyzerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(team_game_stats_schema_1.TeamGameStats.name)),
    __param(1, (0, mongoose_1.InjectModel)(team_total_stats_schema_1.TeamTotalStats.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], TeamStatsAnalyzerService);
//# sourceMappingURL=team-stats-analyzer.service.js.map