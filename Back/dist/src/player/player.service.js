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
exports.PlayerService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const player_schema_1 = require("../schemas/player.schema");
const team_schema_1 = require("../schemas/team.schema");
const user_schema_1 = require("../schemas/user.schema");
const player_game_stats_schema_1 = require("../schemas/player-game-stats.schema");
const player_season_stats_schema_1 = require("../schemas/player-season-stats.schema");
const player_total_stats_schema_1 = require("../schemas/player-total-stats.schema");
const clip_analyzer_service_1 = require("./clip-analyzer.service");
const stats_management_service_1 = require("../common/services/stats-management.service");
let PlayerService = class PlayerService {
    playerModel;
    teamModel;
    userModel;
    playerGameStatsModel;
    playerSeasonStatsModel;
    playerTotalStatsModel;
    clipAnalyzer;
    statsManagement;
    constructor(playerModel, teamModel, userModel, playerGameStatsModel, playerSeasonStatsModel, playerTotalStatsModel, clipAnalyzer, statsManagement) {
        this.playerModel = playerModel;
        this.teamModel = teamModel;
        this.userModel = userModel;
        this.playerGameStatsModel = playerGameStatsModel;
        this.playerSeasonStatsModel = playerSeasonStatsModel;
        this.playerTotalStatsModel = playerTotalStatsModel;
        this.clipAnalyzer = clipAnalyzer;
        this.statsManagement = statsManagement;
    }
    mapTeamNameToSchoolCode(teamName) {
        const schoolMapping = {
            YSEagles: 'YS',
            '연세대 이글스': 'YS',
            SNGreenTerrors: 'SN',
            '서울대 그린테러스': 'SN',
            HYLions: 'HY',
            '한양대 라이온스': 'HY',
            KMRazorbacks: 'KM',
            '국민대 레이저백스': 'KM',
            USCityhawks: 'US',
            '서울시립대 시티혹스': 'US',
            HFBlackKnights: 'HF',
            '한국외대 블랙나이츠': 'HF',
            KKRagingBulls: 'KK',
            '건국대 레이징불스': 'KK',
            HICowboys: 'HI',
            '홍익대 카우보이스': 'HI',
            DGTuskers: 'DT',
            '동국대 터스커스': 'DT',
            KUTigers: 'KU',
            '고려대 타이거스': 'KU',
            CABlueDragons: 'CA',
            '중앙대 블루드래곤스': 'CA',
            SSCrusaders: 'SS',
            '숭실대 크루세이더스': 'SS',
            SGAlbatross: 'SG',
            '서강대 알바트로스': 'SG',
            KHCommanders: 'KH',
            '경희대 커맨더스': 'KH',
            KWCapras: 'KW',
            '강원대 카프라스': 'KW',
            DKKodiakBears: 'DK',
            '단국대 코디악베어스': 'DK',
            SKRoyals: 'SK',
            '성균관대 로얄스': 'SK',
            YIWhiteTigers: 'YI',
            '용인대 화이트타이거스': 'YI',
            IHTealDragons: 'IH',
            '인하대 틸 드래곤스': 'IH',
            HLPhoenix: 'HL',
            '한림대 피닉스': 'HL',
            HSKillerWhales: 'HS',
            '한신대 킬러웨일스': 'HS',
            KAMavericks: 'KA',
            '카이스트 매버릭스': 'KA',
            KBOrangeFighters: 'KP',
            '경북대 오렌지파이터스': 'KP',
            KIBlackBears: 'KI',
            '경일대 블랙베어스': 'KI',
            KMSuperLions: 'KS',
            '계명대 슈퍼라이온스': 'KS',
            KOTRavens: 'KO',
            '금오공과대 레이븐스': 'KO',
            DCUScudAngels: 'DC',
            '대구가톨릭대 스커드엔젤스': 'DC',
            DUFlyingTigers: 'DG',
            '대구대 플라잉타이거스': 'DG',
            DHURhinos: 'DH',
            '대구한의대 라이노스': 'DH',
            DGWhiteElephants: 'DW',
            '동국대 화이트엘리펀츠': 'DW',
            YNPegasus: 'YN',
            '영남대 페가수스': 'YN',
            HDHolyRams: 'HD',
            '한동대 홀리램스': 'HD',
            GSDragons: 'GS',
            '경성대 드래곤스': 'GS',
            DSBlueDolphins: 'DS',
            '동서대 블루돌핀스': 'DS',
            DALeopards: 'DA',
            '동아대 레오파즈': 'DA',
            DEUTurtleFighters: 'DU',
            '동의대 터틀파이터스': 'DU',
            PNUEagles: 'BS',
            '부산대 이글스': 'BS',
            BUFSTornados: 'BF',
            '부산외국어대 토네이도': 'BF',
            SUDevils: 'SL',
            '신라대 데빌스': 'SL',
            UOUUnicorns: 'UU',
            '울산대 유니콘스': 'UU',
            KMOUVikings: 'HH',
            '한국해양대 바이킹스': 'HH',
            GunwiPhoenix: 'GP',
            '군위 피닉스': 'GP',
            BusanGryphons: 'BG',
            '부산 그리폰즈': 'BG',
            SamsungBlueStorm: 'BT',
            '삼성 블루스톰': 'BT',
            SeoulGoldenEagles: 'GE',
            '서울 골든이글스': 'GE',
            SeoulDefenders: 'DF',
            '서울 디펜더스': 'DF',
            SeoulVikings: 'VI',
            '서울 바이킹스': 'VI',
            IncheonRhinos: 'RH',
            '인천 라이노스': 'RH',
        };
        return schoolMapping[teamName] || teamName;
    }
    mapJsonTeamNameToDbTeamName(jsonTeamName) {
        const teamMapping = {
            YSeagles: 'YSEagles',
            SNgreenterrors: 'SNGreenTerrors',
            HYlions: 'HYLions',
            KMrazorbacks: 'KMRazorbacks',
            UScityhawks: 'USCityhawks',
            HFblackknights: 'HFBlackKnights',
            KKragingbulls: 'KKRagingBulls',
            HIcowboys: 'HICowboys',
            KUtigers: 'KUTigers',
            DongkukTuskers: 'DGTuskers',
            SScrusaders: 'SSCrusaders',
            CAbluedragons: 'CABlueDragons',
            KHcommanders: 'KHCommanders',
            SGalbatross: 'SGAlbatross',
            SKroyals: 'SKRoyals',
            KWcapra: 'KWCapras',
            DKkodiakbears: 'DKKodiakBears',
            YIwhitetigers: 'YIWhiteTigers',
            IHtealdragons: 'IHTealDragons',
            HLphoenix: 'HLPhoenix',
            HSkillerwhales: 'HSKillerWhales',
            KAmavericks: 'KAMavericks',
            KPorangefighters: 'KBOrangeFighters',
            KIblackbears: 'KIBlackBears',
            KeimyungSuperlions: 'KMSuperLions',
            KOravens: 'KOTRavens',
            DCscudangels: 'DCUScudAngels',
            DGflyingtigers: 'DUFlyingTigers',
            DHrhinos: 'DHURhinos',
            DongkukWhiteelephants: 'DGWhiteElephants',
            YNpegasus: 'YNPegasus',
            HDholyrams: 'HDHolyRams',
            GSdrangons: 'GSDragons',
            BSeagles: 'PNUEagles',
            HHvikings: 'KMOUVikings',
            SLdevils: 'SUDevils',
            BKmadmobydicks: 'BKMadMobyDicks',
            DUturtlefighters: 'DEUTurtleFighters',
            DAleopards: 'DALeopards',
            DSbluedolphins: 'DSBlueDolphins',
            BFtornado: 'BUFSTornados',
            UUunicorns: 'UOUUnicorns',
            GunwiPheonix: 'GunwiPhoenix',
            BusanGryphons: 'BusanGryphons',
            samsungBT: 'SamsungBlueStorm',
            seoulGE: 'SeoulGoldenEagles',
            seoulDF: 'SeoulDefenders',
            seoulVI: 'SeoulVikings',
            incheonRH: 'IncheonRhinos',
        };
        const mappedName = teamMapping[jsonTeamName];
        if (!mappedName) {
            console.log(`⚠️ 알 수 없는 팀명: ${jsonTeamName}, 원본 팀명 사용`);
            return jsonTeamName;
        }
        console.log(`🔄 팀명 매핑: ${jsonTeamName} -> ${mappedName}`);
        return mappedName;
    }
    getDefaultStatsForPosition(position) {
        const baseStats = {
            games: 0,
        };
        switch (position) {
            case 'RB':
                return {
                    ...baseStats,
                    rushingAttempted: 0,
                    rushingYards: 0,
                    yardsPerCarry: 0,
                    rushingTouchdown: 0,
                    longestRushing: 0,
                    target: 0,
                    reception: 0,
                    receivingYards: 0,
                    yardsPerCatch: 0,
                    receivingTouchdown: 0,
                    longestReception: 0,
                    receivingFirstDowns: 0,
                    fumbles: 0,
                    fumblesLost: 0,
                    kickReturn: 0,
                    kickReturnYards: 0,
                    yardsPerKickReturn: 0,
                    puntReturn: 0,
                    puntReturnYards: 0,
                    yardsPerPuntReturn: 0,
                    returnTouchdown: 0,
                };
            case 'WR':
            case 'TE':
                return {
                    ...baseStats,
                    target: 0,
                    reception: 0,
                    receivingYards: 0,
                    yardsPerCatch: 0,
                    receivingTouchdown: 0,
                    longestReception: 0,
                    receivingFirstDowns: 0,
                    fumbles: 0,
                    fumblesLost: 0,
                    rushingAttempted: 0,
                    rushingYards: 0,
                    yardsPerCarry: 0,
                    rushingTouchdown: 0,
                    longestRushing: 0,
                    kickReturn: 0,
                    kickReturnYards: 0,
                    yardsPerKickReturn: 0,
                    puntReturn: 0,
                    puntReturnYards: 0,
                    yardsPerPuntReturn: 0,
                    returnTouchdown: 0,
                };
            case 'DB':
            case 'LB':
            case 'DL':
                return {
                    ...baseStats,
                    tackles: 0,
                    sacks: 0,
                    tacklesForLoss: 0,
                    forcedFumbles: 0,
                    fumbleRecovery: 0,
                    fumbleRecoveredYards: 0,
                    passDefended: 0,
                    interception: 0,
                    interceptionYards: 0,
                    touchdown: 0,
                };
            default:
                return baseStats;
        }
    }
    async createPlayer(createPlayerDto, teamId) {
        const newPlayer = new this.playerModel({
            ...createPlayerDto,
            teamId,
        });
        await newPlayer.save();
        return {
            success: true,
            message: '선수가 성공적으로 생성되었습니다.',
            data: newPlayer,
        };
    }
    async getPlayerByCode(playerId) {
        const player = await this.playerModel
            .findOne({ playerId })
            .populate('teamId', 'teamName');
        if (!player) {
            throw new common_1.NotFoundException('선수를 찾을 수 없습니다.');
        }
        return {
            success: true,
            data: player,
        };
    }
    async getPlayersByPosition(position, league) {
        const query = { positions: position };
        if (league) {
            query.league = league;
        }
        const players = await this.playerModel
            .find(query)
            .populate('teamId', 'teamName')
            .sort({ 'stats.totalGamesPlayed': -1 });
        return {
            success: true,
            data: players,
        };
    }
    async getAllPlayersRanking(league, sortBy) {
        const query = {};
        if (league) {
            query.league = league;
        }
        const players = await this.playerModel
            .find(query)
            .populate('teamId', 'teamName');
        const expandedPlayers = [];
        for (const player of players) {
            const playerStats = player.stats || {};
            for (const position of player.positions) {
                let positionStats = {};
                if (playerStats[position]) {
                    positionStats = playerStats[position];
                }
                else if (playerStats.totalGamesPlayed !== undefined) {
                    positionStats = playerStats;
                }
                const playerObject = {
                    _id: `${player._id}_${position}`,
                    playerId: player.playerId,
                    name: player.name,
                    position: position,
                    positions: player.positions,
                    primaryPosition: player.primaryPosition,
                    teamName: player.teamName,
                    teamId: player.teamId,
                    jerseyNumber: player.jerseyNumber,
                    league: player.league,
                    season: player.season,
                    stats: positionStats,
                    createdAt: player.createdAt,
                    updatedAt: player.updatedAt,
                };
                if (position === 'WR' && positionStats) {
                    playerObject.passingFumbles =
                        positionStats.passingFumbles || 0;
                    playerObject.rushingFumbles =
                        positionStats.rushingFumbles || 0;
                    playerObject.passingFumblesLost =
                        positionStats.passingFumblesLost || 0;
                    playerObject.rushingFumblesLost =
                        positionStats.rushingFumblesLost || 0;
                    console.log(`🐛 WR ${player.jerseyNumber}번 펌블 데이터:`, {
                        passingFumbles: playerObject.passingFumbles,
                        rushingFumbles: playerObject.rushingFumbles,
                        passingFumblesLost: playerObject.passingFumblesLost,
                        rushingFumblesLost: playerObject.rushingFumblesLost,
                    });
                }
                expandedPlayers.push(playerObject);
            }
        }
        const dbPlayers = expandedPlayers.filter((p) => p.position === 'DB');
        if (dbPlayers.length > 0) {
            console.log('🐛 원본 DB 선수 stats 구조:', players
                .filter((p) => p.positions.includes('DB'))
                .map((p) => ({
                name: p.name,
                positions: p.positions,
                dbStats: p.stats?.DB,
                totalStats: p.stats,
            })));
            console.log('🐛 API 응답 - DB 선수들:', dbPlayers.map((p) => ({
                name: p.name,
                position: p.position,
                kickReturns: p.stats?.kickReturns,
                kickReturnYards: p.stats?.kickReturnYards,
                yardsPerKickReturn: p.stats?.yardsPerKickReturn,
                puntReturns: p.stats?.puntReturns,
                puntReturnYards: p.stats?.puntReturnYards,
                yardsPerPuntReturn: p.stats?.yardsPerPuntReturn,
                returnTouchdowns: p.stats?.returnTouchdowns,
            })));
        }
        return {
            success: true,
            data: expandedPlayers,
        };
    }
    async updatePlayerStats(playerId, updateStatsDto) {
        const player = await this.playerModel.findOne({ playerId });
        if (!player) {
            throw new common_1.NotFoundException('선수를 찾을 수 없습니다.');
        }
        player.stats = { ...player.stats, ...updateStatsDto.stats };
        await player.save();
        return {
            success: true,
            message: '선수 스탯이 성공적으로 업데이트되었습니다.',
            data: player,
        };
    }
    async getPlayersByTeam(teamId) {
        const players = await this.playerModel
            .find({ teamId })
            .populate('teamId', 'teamName')
            .sort({ position: 1, jerseyNumber: 1 });
        return {
            success: true,
            data: players,
        };
    }
    async updatePlayerStatsFromNewClips(playerNumber, newClips, teamName, gameData) {
        let player;
        if (teamName) {
            const dbTeamName = this.mapJsonTeamNameToDbTeamName(teamName);
            player = await this.playerModel.findOne({
                jerseyNumber: playerNumber,
                teamName: dbTeamName,
            });
            if (!player) {
                console.log(`🔍 팀 ${teamName} (매핑: ${dbTeamName})의 등번호 ${playerNumber}번 선수를 찾을 수 없습니다.`);
                player = await this.playerModel.findOne({
                    jerseyNumber: playerNumber,
                });
                if (player) {
                    console.log(`✅ 등번호로 선수 발견: ${player.name} (${player.teamName})`);
                }
                else {
                    console.log(`❌ 등번호 ${playerNumber}번 선수를 전혀 찾을 수 없습니다.`);
                    return {
                        success: false,
                        message: `등번호 ${playerNumber}번 선수를 찾을 수 없습니다. (JSON팀명: ${teamName}, DB팀명: ${dbTeamName})`,
                        playerNumber,
                        teamName,
                        dbTeamName,
                    };
                }
            }
        }
        else {
            player = await this.playerModel.findOne({
                jerseyNumber: playerNumber,
            });
            if (!player) {
                throw new common_1.NotFoundException(`등번호 ${playerNumber}번 선수를 찾을 수 없습니다.`);
            }
        }
        const playerClips = newClips.filter((clip) => clip.car?.num === playerNumber ||
            clip.car2?.num === playerNumber ||
            clip.tkl?.num === playerNumber ||
            clip.tkl2?.num === playerNumber);
        if (playerClips.length === 0) {
            return {
                success: false,
                message: `등번호 ${playerNumber}번 선수의 플레이가 클립에서 발견되지 않았습니다.`,
                data: player,
            };
        }
        const position = player.primaryPosition || player.positions[0];
        let analyzedStats;
        switch (position) {
            case 'QB':
                console.log(`🏈 QB ${player.jerseyNumber}번 분석 시작 - ${player.name} (${player.teamName})`);
                analyzedStats = this.analyzeQBStats(playerClips, player.jerseyNumber, player.name, player.teamName);
                break;
            case 'RB':
                console.log(`🏃 RB ${player.jerseyNumber}번 분석 시작 - ${player.name} (${player.teamName})`);
                analyzedStats = this.analyzeRBStats(playerClips, player.jerseyNumber, player.name, player.teamName);
                break;
            case 'WR':
                console.log(`🎯 WR ${player.jerseyNumber}번 분석 시작 - ${player.name} (${player.teamName})`);
                analyzedStats = this.analyzeWRStats(playerClips, player.jerseyNumber, player.name, player.teamName);
                break;
            case 'TE':
                console.log(`🎯 TE ${player.jerseyNumber}번 분석 시작 - ${player.name} (${player.teamName})`);
                analyzedStats = this.analyzeTEStats(playerClips, player.jerseyNumber, player.name, player.teamName);
                break;
            case 'K':
                console.log(`🦶 K ${player.jerseyNumber}번 분석 시작 - ${player.name} (${player.teamName})`);
                analyzedStats = this.analyzeKStats(playerClips, player.jerseyNumber, player.name, player.teamName);
                break;
            case 'DB':
            case 'LB':
            case 'DL':
            case 'OL':
            case 'P':
                console.log(`⚠️ ${position} ${player.jerseyNumber}번 분석 건너뜀 - ${player.name} (${player.teamName})`);
                return {
                    success: true,
                    message: `${position} 포지션은 현재 분석을 지원하지 않습니다.`,
                    data: player,
                    skipped: true,
                };
            default:
                throw new Error(`알 수 없는 포지션입니다: ${position}`);
        }
        player.stats = { ...player.stats, ...analyzedStats };
        await player.save();
        if (gameData) {
            await this.savePlayerStatsWithNewStructure(player, analyzedStats, gameData, playerClips);
            return {
                success: true,
                message: `등번호 ${playerNumber}번 ${position} 선수의 스탯이 3-tier 시스템에 저장되었습니다.`,
                data: player,
                analyzedStats: analyzedStats,
                processedClips: playerClips.length,
                newStructureSaved: true,
                gameKey: gameData.gameKey,
                season: gameData.date
                    ? gameData.date.substring(0, 4)
                    : new Date().getFullYear().toString(),
            };
        }
        const gameKey = newClips.length > 0 && newClips[0].clipKey
            ? `GAME_${newClips[0].clipKey}`
            : `GAME_${Date.now()}`;
        const gameDate = new Date();
        const homeTeam = '홈팀';
        const awayTeam = '어웨이팀';
        const gameStatsResult = await this.statsManagement.updateGameStats(playerNumber, gameKey, gameDate, homeTeam, awayTeam, analyzedStats);
        return {
            success: true,
            message: `등번호 ${playerNumber}번 ${position} 선수의 스탯이 기존 3단계 시스템에 업데이트되었습니다.`,
            data: player,
            analyzedStats: analyzedStats,
            processedClips: playerClips.length,
            gameStatsCreated: !!gameStatsResult,
            tierSystemUpdate: {
                gameKey: gameKey,
                gameDate: gameDate,
                autoAggregated: true,
            },
        };
    }
    async analyzeGameData(gameData) {
        return await this.clipAnalyzer.analyzeGameData(gameData);
    }
    generateGameId(clip) {
        const date = new Date().toISOString().split('T')[0];
        const teams = [clip.car?.pos, clip.car2?.pos, clip.tkl?.pos, clip.tkl2?.pos]
            .filter(Boolean)
            .sort()
            .join('-');
        return `game-${date}-${teams.slice(0, 10)}`;
    }
    async resetAllPlayersStats() {
        try {
            const result = await this.playerModel.updateMany({}, {
                $unset: { stats: 1 },
            });
            return {
                success: true,
                message: `${result.modifiedCount}명의 선수 스탯이 초기화되었습니다.`,
                modifiedCount: result.modifiedCount,
            };
        }
        catch (error) {
            throw new Error(`스탯 초기화 실패: ${error.message}`);
        }
    }
    async resetProcessedGames() {
        try {
            const result = await this.playerModel.updateMany({}, {
                $unset: { processedGames: 1 },
            });
            return {
                success: true,
                message: '처리된 게임 목록이 초기화되었습니다.',
                modifiedCount: result.modifiedCount,
            };
        }
        catch (error) {
            throw new Error(`처리된 게임 목록 초기화 실패: ${error.message}`);
        }
    }
    analyzeQBStats(clips, jerseyNumber, playerName, teamName) {
        let passingAttempts = 0;
        let passingCompletions = 0;
        let passingYards = 0;
        let passingTouchdowns = 0;
        let passingInterceptions = 0;
        let longestPass = 0;
        let sacks = 0;
        console.log(`📈 ${playerName} ${jerseyNumber}번 QB 통계 계산 시작 (${clips.length}개 클립)`);
        clips.forEach((clip, index) => {
            console.log(`🔍 클립 ${index + 1}:`, {
                playType: clip.playType,
                gainYard: clip.gainYard,
                car: clip.car,
                car2: clip.car2,
                significantPlays: clip.significantPlays,
            });
        });
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
        console.log(`🏈 ${teamName} ${jerseyNumber}번 QB: 패스시도 ${passingAttempts}회, 패스성공 ${passingCompletions}회, 성공률 ${completionPercentage}%, 패싱야드 ${passingYards}야드`);
        return finalStats;
    }
    analyzeRBStats(clips, jerseyNumber, playerName, teamName) {
        let rushingAttempts = 0;
        let frontRushYard = 0;
        let backRushYard = 0;
        let rushingTouchdowns = 0;
        let longestRush = 0;
        let fumbles = 0;
        let fumblesLost = 0;
        console.log(`🏃 ${playerName} ${jerseyNumber}번 RB 통계 계산 시작 (${clips.length}개 클립)`);
        for (const clip of clips) {
            const isPlayerInCar = clip.car?.num === jerseyNumber;
            const isPlayerInCar2 = clip.car2?.num === jerseyNumber;
            if (!isPlayerInCar && !isPlayerInCar2)
                continue;
            if (clip.playType === 'RUN') {
                rushingAttempts++;
                const gainYard = clip.gainYard || 0;
                const hasTFL = clip.significantPlays?.includes('TFL');
                const hasSAFETY = clip.significantPlays?.includes('SAFETY');
                if (hasTFL || hasSAFETY) {
                    backRushYard += gainYard;
                    console.log(`  📉 BackRushYard: +${gainYard} (TFL/SAFETY) 총 ${backRushYard}야드`);
                }
                else {
                    frontRushYard += gainYard;
                    console.log(`  📈 FrontRushYard: +${gainYard} 총 ${frontRushYard}야드`);
                }
                if (gainYard > longestRush) {
                    longestRush = gainYard;
                    console.log(`  🏃 새로운 최장 러싱: ${longestRush}야드`);
                }
                console.log(`  ✅ 러싱 시도: +1 (총 ${rushingAttempts}회)`);
            }
            const hasSignificantPlay = clip.significantPlays &&
                Array.isArray(clip.significantPlays) &&
                clip.significantPlays.some((play) => play !== null);
            if (hasSignificantPlay) {
                const plays = clip.significantPlays.filter((play) => play !== null);
                for (const play of plays) {
                    if (play === 'TOUCHDOWN' && clip.playType === 'RUN') {
                        rushingTouchdowns++;
                        console.log(`  🎯 러싱 터치다운: 총 ${rushingTouchdowns}회`);
                    }
                    else if (play === 'FUMBLE') {
                        fumbles++;
                        console.log(`  💨 펌블: 총 ${fumbles}회`);
                    }
                    else if (play === 'FUMBLE_LOST') {
                        fumblesLost++;
                        console.log(`  ❌ 펌블 로스트: 총 ${fumblesLost}회`);
                    }
                }
            }
        }
        const totalRushingYards = frontRushYard - backRushYard;
        const yardsPerCarry = rushingAttempts > 0
            ? Math.round((totalRushingYards / rushingAttempts) * 100) / 100
            : 0;
        const finalStats = {
            gamesPlayed: 1,
            rbRushingAttempts: rushingAttempts,
            rbFrontRushYard: frontRushYard,
            rbBackRushYard: backRushYard,
            rbRushingYards: totalRushingYards,
            rbYardsPerCarry: yardsPerCarry,
            rbRushingTouchdowns: rushingTouchdowns,
            rbLongestRush: longestRush,
            rbFumbles: fumbles,
            rbFumblesLost: fumblesLost,
        };
        console.log(`🏃 ${teamName} ${jerseyNumber}번 RB: 러싱시도 ${rushingAttempts}회, 러싱야드 ${totalRushingYards}야드 (Front: ${frontRushYard}, Back: ${backRushYard}), 평균 ${yardsPerCarry}야드`);
        return finalStats;
    }
    analyzeWRStats(clips, jerseyNumber, playerName, teamName) {
        let receivingTargets = 0;
        let receptions = 0;
        let receivingYards = 0;
        let receivingTouchdowns = 0;
        let longestReception = 0;
        let receivingFirstDowns = 0;
        let rushingAttempts = 0;
        let rushingYards = 0;
        let rushingTouchdowns = 0;
        let longestRush = 0;
        let kickoffReturn = 0;
        let kickoffReturnYard = 0;
        let puntReturn = 0;
        let puntReturnYard = 0;
        let returnTouchdown = 0;
        let fumbles = 0;
        let fumblesLost = 0;
        console.log(`🎯 ${playerName} ${jerseyNumber}번 WR 통계 계산 시작 (${clips.length}개 클립)`);
        for (const clip of clips) {
            const isPlayerInCar = clip.car?.num === jerseyNumber;
            const isPlayerInCar2 = clip.car2?.num === jerseyNumber;
            if (!isPlayerInCar && !isPlayerInCar2)
                continue;
            const gainYard = clip.gainYard || 0;
            const significantPlays = clip.significantPlays || [];
            if (clip.playType === 'PASS') {
                receivingTargets++;
                if (!significantPlays.includes('INCOMPLETE')) {
                    receptions++;
                    receivingYards += gainYard;
                    console.log(`  🎯 리시빙: ${gainYard}야드 (총 ${receptions}캐치, ${receivingYards}야드)`);
                    if (gainYard > longestReception) {
                        longestReception = gainYard;
                    }
                }
                else {
                    console.log(`  ❌ 타겟만 (미완성 패스) 총 ${receivingTargets}타겟`);
                }
            }
            if (clip.playType === 'RUN') {
                rushingAttempts++;
                rushingYards += gainYard;
                console.log(`  🏃 러싱: ${gainYard}야드 (총 ${rushingAttempts}시도, ${rushingYards}야드)`);
                if (gainYard > longestRush) {
                    longestRush = gainYard;
                }
            }
            if (clip.playType === 'RETURN') {
                const hasKickoff = significantPlays.some((play) => play === 'KICKOFF');
                const hasPunt = significantPlays.some((play) => play === 'PUNT');
                if (hasKickoff) {
                    kickoffReturn++;
                    kickoffReturnYard += gainYard;
                    console.log(`  🟡 킥오프 리턴: ${gainYard}야드 (총 ${kickoffReturn}회, ${kickoffReturnYard}야드)`);
                }
                if (hasPunt) {
                    puntReturn++;
                    puntReturnYard += gainYard;
                    console.log(`  🟡 펀트 리턴: ${gainYard}야드 (총 ${puntReturn}회, ${puntReturnYard}야드)`);
                }
            }
            for (const play of significantPlays) {
                if (play === 'TOUCHDOWN') {
                    if (clip.playType === 'PASS') {
                        receivingTouchdowns++;
                        console.log(`  🏈 리시빙 터치다운: 총 ${receivingTouchdowns}회`);
                    }
                    else if (clip.playType === 'RUN') {
                        rushingTouchdowns++;
                        console.log(`  🏈 러싱 터치다운: 총 ${rushingTouchdowns}회`);
                    }
                    else if (clip.playType === 'RETURN') {
                        returnTouchdown++;
                        console.log(`  🏈 리턴 터치다운: 총 ${returnTouchdown}회`);
                    }
                }
                else if (play === 'FIRSTDOWN' && clip.playType === 'PASS') {
                    receivingFirstDowns++;
                    console.log(`  🚩 리시빙 퍼스트다운: 총 ${receivingFirstDowns}회`);
                }
                else if (play === 'FUMBLE') {
                    fumbles++;
                    console.log(`  💨 펌블: 총 ${fumbles}회`);
                }
                else if (play === 'FUMBLERECDEF') {
                    fumblesLost++;
                    console.log(`  ❌ 펌블 잃음: 총 ${fumblesLost}회`);
                }
            }
        }
        const yardsPerReception = receptions > 0 ? Math.round((receivingYards / receptions) * 10) / 10 : 0;
        const yardsPerCarry = rushingAttempts > 0
            ? Math.round((rushingYards / rushingAttempts) * 10) / 10
            : 0;
        const yardPerKickoffReturn = kickoffReturn > 0
            ? Math.round((kickoffReturnYard / kickoffReturn) * 10) / 10
            : 0;
        const yardPerPuntReturn = puntReturn > 0 ? Math.round((puntReturnYard / puntReturn) * 10) / 10 : 0;
        const finalStats = {
            gamesPlayed: 1,
            wrReceivingTargets: receivingTargets,
            wrReceptions: receptions,
            wrReceivingYards: receivingYards,
            wrYardsPerReception: yardsPerReception,
            wrReceivingTouchdowns: receivingTouchdowns,
            wrLongestReception: longestReception,
            wrReceivingFirstDowns: receivingFirstDowns,
            wrRushingAttempts: rushingAttempts,
            wrRushingYards: rushingYards,
            wrYardsPerCarry: yardsPerCarry,
            wrRushingTouchdowns: rushingTouchdowns,
            wrLongestRush: longestRush,
            wrKickReturns: kickoffReturn,
            wrKickReturnYards: kickoffReturnYard,
            wrYardsPerKickReturn: yardPerKickoffReturn,
            wrPuntReturns: puntReturn,
            wrPuntReturnYards: puntReturnYard,
            wrYardsPerPuntReturn: yardPerPuntReturn,
            wrReturnTouchdowns: returnTouchdown,
            fumbles: fumbles,
            fumblesLost: fumblesLost,
        };
        console.log(`🎯 ${teamName} ${jerseyNumber}번 WR: 타겟 ${receivingTargets}회, 캐치 ${receptions}회, 리시빙 ${receivingYards}야드, 러싱 ${rushingYards}야드, 리턴 ${kickoffReturn + puntReturn}회`);
        return finalStats;
    }
    analyzeTEStats(clips, jerseyNumber, playerName, teamName) {
        let receivingTargets = 0;
        let receptions = 0;
        let receivingYards = 0;
        let receivingTouchdowns = 0;
        let longestReception = 0;
        let rushingAttempts = 0;
        let rushingYards = 0;
        let rushingTouchdowns = 0;
        let longestRush = 0;
        let fumbles = 0;
        let fumblesLost = 0;
        console.log(`🎯 ${playerName} ${jerseyNumber}번 TE 통계 계산 시작 (${clips.length}개 클립)`);
        for (const clip of clips) {
            const isPlayerInCar = clip.car?.num === jerseyNumber;
            const isPlayerInCar2 = clip.car2?.num === jerseyNumber;
            if (!isPlayerInCar && !isPlayerInCar2)
                continue;
            const gainYard = clip.gainYard || 0;
            const significantPlays = clip.significantPlays || [];
            if (clip.playType === 'PASS') {
                receivingTargets++;
                if (!significantPlays.includes('INCOMPLETE')) {
                    receptions++;
                    receivingYards += gainYard;
                    console.log(`  🎯 리시빙: ${gainYard}야드 (총 ${receptions}캐치, ${receivingYards}야드)`);
                    if (gainYard > longestReception) {
                        longestReception = gainYard;
                    }
                }
                else {
                    console.log(`  ❌ 타겟만 (미완성 패스) 총 ${receivingTargets}타겟`);
                }
            }
            if (clip.playType === 'RUN') {
                rushingAttempts++;
                rushingYards += gainYard;
                console.log(`  🏃 러싱: ${gainYard}야드 (총 ${rushingAttempts}시도, ${rushingYards}야드)`);
                if (gainYard > longestRush) {
                    longestRush = gainYard;
                }
            }
            for (const play of significantPlays) {
                if (play === 'TOUCHDOWN') {
                    if (clip.playType === 'PASS') {
                        receivingTouchdowns++;
                        console.log(`  🏈 리시빙 터치다운: 총 ${receivingTouchdowns}회`);
                    }
                    else if (clip.playType === 'RUN') {
                        rushingTouchdowns++;
                        console.log(`  🏈 러싱 터치다운: 총 ${rushingTouchdowns}회`);
                    }
                }
                else if (play === 'FUMBLE') {
                    fumbles++;
                    console.log(`  💨 펌블: 총 ${fumbles}회`);
                }
                else if (play === 'FUMBLERECDEF') {
                    fumblesLost++;
                    console.log(`  ❌ 펌블 잃음: 총 ${fumblesLost}회`);
                }
            }
        }
        const yardsPerReception = receptions > 0 ? Math.round((receivingYards / receptions) * 10) / 10 : 0;
        const yardsPerCarry = rushingAttempts > 0
            ? Math.round((rushingYards / rushingAttempts) * 10) / 10
            : 0;
        const finalStats = {
            gamesPlayed: 1,
            teReceivingTargets: receivingTargets,
            teReceptions: receptions,
            teReceivingYards: receivingYards,
            teYardsPerReception: yardsPerReception,
            teReceivingTouchdowns: receivingTouchdowns,
            teLongestReception: longestReception,
            teRushingAttempts: rushingAttempts,
            teRushingYards: rushingYards,
            teYardsPerCarry: yardsPerCarry,
            teRushingTouchdowns: rushingTouchdowns,
            teLongestRush: longestRush,
            fumbles: fumbles,
            fumblesLost: fumblesLost,
        };
        console.log(`🎯 ${teamName} ${jerseyNumber}번 TE: 타겟 ${receivingTargets}회, 캐치 ${receptions}회, 리시빙 ${receivingYards}야드, 러싱 ${rushingYards}야드`);
        return finalStats;
    }
    analyzeKStats(clips, jerseyNumber, playerName, teamName) {
        let fieldGoalsAttempted = 0;
        let fieldGoalsMade = 0;
        let longestFieldGoal = 0;
        let extraPointsAttempted = 0;
        let extraPointsMade = 0;
        console.log(`🦶 ${playerName} ${jerseyNumber}번 K 통계 계산 시작 (${clips.length}개 클립)`);
        for (const clip of clips) {
            const isPlayerInCar = clip.car?.num === jerseyNumber && clip.car?.pos === 'K';
            const isPlayerInCar2 = clip.car2?.num === jerseyNumber && clip.car2?.pos === 'K';
            if (!isPlayerInCar && !isPlayerInCar2)
                continue;
            const gainYard = clip.gainYard || 0;
            const significantPlays = clip.significantPlays || [];
            if (clip.playType === 'FG') {
                fieldGoalsAttempted++;
                const actualDistance = gainYard + 17;
                if (significantPlays.includes('FIELDGOAL_GOOD')) {
                    fieldGoalsMade++;
                    if (actualDistance > longestFieldGoal) {
                        longestFieldGoal = actualDistance;
                    }
                    console.log(`  🎯 필드골 성공: ${actualDistance}야드`);
                }
                else {
                    console.log(`  ❌ 필드골 실패: ${actualDistance}야드`);
                }
            }
            if (clip.playType === 'PAT') {
                extraPointsAttempted++;
                if (significantPlays.includes('PAT_GOOD')) {
                    extraPointsMade++;
                    console.log(`  ✅ PAT 성공`);
                }
                else {
                    console.log(`  ❌ PAT 실패`);
                }
            }
        }
        const fieldGoalPercentage = fieldGoalsAttempted > 0
            ? Math.round((fieldGoalsMade / fieldGoalsAttempted) * 100)
            : 0;
        const finalStats = {
            gamesPlayed: 1,
            fieldGoalsAttempted,
            fieldGoalsMade,
            fieldGoalPercentage,
            longestFieldGoal,
            extraPointsAttempted,
            extraPointsMade,
        };
        console.log(`🦶 ${teamName} ${jerseyNumber}번 K: 필드골 ${fieldGoalsMade}/${fieldGoalsAttempted} (${fieldGoalPercentage}%), 최장 ${longestFieldGoal}야드, PAT ${extraPointsMade}/${extraPointsAttempted}`);
        return finalStats;
    }
    async resetAllPlayerData() {
        try {
            console.log('🗑️ 모든 선수 데이터 삭제 시작...');
            const result = await this.playerModel.deleteMany({});
            console.log(`✅ ${result.deletedCount}명의 선수 데이터가 삭제되었습니다.`);
            return {
                success: true,
                message: `${result.deletedCount}명의 선수 데이터가 삭제되었습니다.`,
                deletedCount: result.deletedCount,
            };
        }
        catch (error) {
            console.error('❌ 선수 데이터 삭제 실패:', error);
            throw new Error(`선수 데이터 삭제 실패: ${error.message}`);
        }
    }
    async savePlayerStatsWithNewStructure(player, analyzedStats, gameData, playerClips) {
        try {
            const season = gameData.date
                ? gameData.date.substring(0, 4)
                : new Date().getFullYear().toString();
            const schoolCode = this.mapTeamNameToSchoolCode(player.teamName);
            const playerId = `${season}_${schoolCode}_${player.jerseyNumber}`;
            const gameKey = gameData.gameKey;
            const date = gameData.date;
            const gameStats = await this.playerGameStatsModel.findOneAndUpdate({ playerId, gameKey }, {
                playerId,
                gameKey,
                date,
                season,
                teamName: player.teamName,
                jerseyNumber: player.jerseyNumber,
                position: player.primaryPosition || player.positions[0],
                stats: analyzedStats,
                opponent: this.getOpponentTeam(gameData, player.teamName),
                isHomeGame: gameData.homeTeam === player.teamName,
            }, { upsert: true, new: true });
            console.log(`✅ 경기별 스탯 저장 완료: ${playerId} - ${gameKey}`);
            await this.updateSeasonStats(playerId, season, player, analyzedStats, gameKey);
            await this.updateTotalStats(playerId, player, analyzedStats, season, date);
            await this.updateUserStatsReferences(player.playerId);
            return {
                success: true,
                playerId,
                gameKey,
                season,
            };
        }
        catch (error) {
            console.error('❌ 스탯 저장 실패:', error);
            throw error;
        }
    }
    async updateSeasonStats(playerId, season, player, gameStats, gameKey) {
        let seasonStats = await this.playerSeasonStatsModel.findOne({
            playerId,
            season,
        });
        if (!seasonStats) {
            seasonStats = await this.playerSeasonStatsModel.create({
                playerId,
                season,
                teamName: player.teamName,
                jerseyNumber: player.jerseyNumber,
                position: player.primaryPosition || player.positions[0],
                stats: gameStats,
                gamesPlayed: 1,
                gameKeys: [gameKey],
            });
        }
        else {
            const updatedStats = this.aggregateStats(seasonStats.stats, gameStats, player.primaryPosition || player.positions[0]);
            if (!seasonStats.gameKeys.includes(gameKey)) {
                seasonStats.gameKeys.push(gameKey);
                seasonStats.gamesPlayed = seasonStats.gameKeys.length;
            }
            seasonStats.stats = updatedStats;
            await seasonStats.save();
        }
        console.log(`✅ 시즌별 스탯 업데이트 완료: ${playerId} - ${season} (${seasonStats.gamesPlayed}경기)`);
    }
    async updateTotalStats(playerId, player, gameStats, season, date) {
        let totalStats = await this.playerTotalStatsModel.findOne({ playerId });
        if (!totalStats) {
            totalStats = await this.playerTotalStatsModel.create({
                playerId,
                teamName: player.teamName,
                jerseyNumber: player.jerseyNumber,
                position: player.primaryPosition || player.positions[0],
                stats: gameStats,
                totalGamesPlayed: 1,
                seasons: [season],
                firstGameDate: date,
                lastGameDate: date,
            });
        }
        else {
            const updatedStats = this.aggregateStats(totalStats.stats, gameStats, player.primaryPosition || player.positions[0]);
            if (!totalStats.seasons.includes(season)) {
                totalStats.seasons.push(season);
            }
            const allSeasonStats = await this.playerSeasonStatsModel.find({
                playerId,
            });
            totalStats.totalGamesPlayed = allSeasonStats.reduce((sum, s) => sum + s.gamesPlayed, 0);
            totalStats.stats = updatedStats;
            totalStats.lastGameDate = date;
            await totalStats.save();
        }
        console.log(`✅ 통합 스탯 업데이트 완료: ${playerId} (총 ${totalStats.totalGamesPlayed}경기)`);
    }
    aggregateStats(existingStats, newStats, position) {
        const aggregated = { ...existingStats };
        switch (position) {
            case 'QB':
                aggregated.passingYards =
                    (aggregated.passingYards || 0) + (newStats.passingYards || 0);
                aggregated.passingTouchdowns =
                    (aggregated.passingTouchdowns || 0) +
                        (newStats.passingTouchdowns || 0);
                aggregated.passingCompletions =
                    (aggregated.passingCompletions || 0) +
                        (newStats.passingCompletions || 0);
                aggregated.passingAttempts =
                    (aggregated.passingAttempts || 0) + (newStats.passingAttempts || 0);
                aggregated.passingInterceptions =
                    (aggregated.passingInterceptions || 0) +
                        (newStats.passingInterceptions || 0);
                aggregated.rushingYards =
                    (aggregated.rushingYards || 0) + (newStats.rushingYards || 0);
                aggregated.rushingTouchdowns =
                    (aggregated.rushingTouchdowns || 0) +
                        (newStats.rushingTouchdowns || 0);
                aggregated.sacks = (aggregated.sacks || 0) + (newStats.sacks || 0);
                if (aggregated.passingAttempts > 0) {
                    aggregated.completionPercentage = Math.round((aggregated.passingCompletions / aggregated.passingAttempts) * 100);
                }
                aggregated.longestPass = Math.max(aggregated.longestPass || 0, newStats.longestPass || 0);
                aggregated.longestRush = Math.max(aggregated.longestRush || 0, newStats.longestRush || 0);
                break;
            case 'RB':
                aggregated.rbRushingYards =
                    (aggregated.rbRushingYards || 0) + (newStats.rbRushingYards || 0);
                aggregated.rbRushingTouchdowns =
                    (aggregated.rbRushingTouchdowns || 0) +
                        (newStats.rbRushingTouchdowns || 0);
                aggregated.rbRushingAttempts =
                    (aggregated.rbRushingAttempts || 0) +
                        (newStats.rbRushingAttempts || 0);
                aggregated.rbReceivingTargets =
                    (aggregated.rbReceivingTargets || 0) +
                        (newStats.rbReceivingTargets || 0);
                aggregated.rbReceptions =
                    (aggregated.rbReceptions || 0) + (newStats.rbReceptions || 0);
                aggregated.rbReceivingYards =
                    (aggregated.rbReceivingYards || 0) + (newStats.rbReceivingYards || 0);
                aggregated.rbReceivingTouchdowns =
                    (aggregated.rbReceivingTouchdowns || 0) +
                        (newStats.rbReceivingTouchdowns || 0);
                if (aggregated.rbRushingAttempts > 0) {
                    aggregated.rbYardsPerCarry =
                        Math.round((aggregated.rbRushingYards / aggregated.rbRushingAttempts) * 10) / 10;
                }
                aggregated.rbLongestRush = Math.max(aggregated.rbLongestRush || 0, newStats.rbLongestRush || 0);
                aggregated.rbLongestReception = Math.max(aggregated.rbLongestReception || 0, newStats.rbLongestReception || 0);
                break;
            case 'WR':
            case 'TE':
                aggregated.targets =
                    (aggregated.targets || 0) + (newStats.targets || 0);
                aggregated.receptions =
                    (aggregated.receptions || 0) + (newStats.receptions || 0);
                aggregated.receivingYards =
                    (aggregated.receivingYards || 0) + (newStats.receivingYards || 0);
                aggregated.receivingTouchdowns =
                    (aggregated.receivingTouchdowns || 0) +
                        (newStats.receivingTouchdowns || 0);
                aggregated.receivingFirstDowns =
                    (aggregated.receivingFirstDowns || 0) +
                        (newStats.receivingFirstDowns || 0);
                if (aggregated.receptions > 0) {
                    aggregated.yardsPerCatch =
                        Math.round((aggregated.receivingYards / aggregated.receptions) * 10) / 10;
                }
                aggregated.longestReception = Math.max(aggregated.longestReception || 0, newStats.longestReception || 0);
                break;
            case 'K':
                aggregated.fieldGoalsAttempted =
                    (aggregated.fieldGoalsAttempted || 0) +
                        (newStats.fieldGoalsAttempted || 0);
                aggregated.fieldGoalsMade =
                    (aggregated.fieldGoalsMade || 0) + (newStats.fieldGoalsMade || 0);
                aggregated.extraPointsAttempted =
                    (aggregated.extraPointsAttempted || 0) +
                        (newStats.extraPointsAttempted || 0);
                aggregated.extraPointsMade =
                    (aggregated.extraPointsMade || 0) + (newStats.extraPointsMade || 0);
                if (aggregated.fieldGoalsAttempted > 0) {
                    aggregated.fieldGoalPercentage = Math.round((aggregated.fieldGoalsMade / aggregated.fieldGoalsAttempted) * 100);
                }
                aggregated.longestFieldGoal = Math.max(aggregated.longestFieldGoal || 0, newStats.longestFieldGoal || 0);
                break;
        }
        return aggregated;
    }
    getOpponentTeam(gameData, myTeamName) {
        if (gameData.homeTeam === myTeamName) {
            return gameData.awayTeam;
        }
        else if (gameData.awayTeam === myTeamName) {
            return gameData.homeTeam;
        }
        return 'Unknown';
    }
    async updateUserStatsReferences(playerId) {
        try {
            const user = await this.userModel.findOne({ playerId });
            if (!user) {
                console.log(`사용자를 찾을 수 없음: playerId=${playerId}`);
                return;
            }
            const gameStats = await this.playerGameStatsModel
                .find({ playerId })
                .select('_id');
            const seasonStats = await this.playerSeasonStatsModel
                .find({ playerId })
                .select('_id');
            const totalStats = await this.playerTotalStatsModel
                .findOne({ playerId })
                .select('_id');
            await this.userModel.updateOne({ playerId }, {
                $set: {
                    'profile.gameStats': gameStats.map((stat) => stat._id.toString()),
                    'profile.seasonStats': seasonStats.map((stat) => stat._id.toString()),
                    'profile.totalStats': totalStats ? totalStats._id.toString() : null,
                },
            });
            console.log(`✅ User 스탯 참조 업데이트 완료: ${user.username}`);
        }
        catch (error) {
            console.error('❌ User 스탯 참조 업데이트 실패:', error);
        }
    }
    async getPlayerStats(user) {
        try {
            if (!user.profile?.playerKey) {
                throw new Error('playerId가 배정되지 않았습니다. 관리자에게 문의하세요.');
            }
            const playerId = user.profile?.playerKey;
            console.log(`📊 선수 스탯 조회 시작: ${playerId} (${user.username})`);
            const gameStats = await this.playerGameStatsModel
                .find({ playerId })
                .sort({ date: -1 })
                .limit(10)
                .lean();
            const seasonStats = await this.playerSeasonStatsModel
                .find({ playerId })
                .sort({ season: -1 })
                .lean();
            const totalStats = await this.playerTotalStatsModel
                .findOne({ playerId })
                .lean();
            const playerInfo = await this.playerModel
                .findOne({
                $or: [
                    { playerId: playerId },
                    {
                        teamName: user.teamName,
                        jerseyNumber: parseInt(playerId.split('_')[2]),
                    },
                ],
            })
                .select('name teamName jerseyNumber primaryPosition positions')
                .lean();
            console.log(`✅ 스탯 조회 완료: 경기별 ${gameStats.length}개, 시즌별 ${seasonStats.length}개`);
            return {
                success: true,
                message: `${playerId} 선수의 스탯을 조회했습니다.`,
                data: {
                    playerInfo: {
                        playerId: playerId,
                        username: user.username,
                        teamName: user.teamName,
                        name: playerInfo?.name || '미등록',
                        jerseyNumber: playerInfo?.jerseyNumber || parseInt(playerId.split('_')[2]),
                        position: playerInfo?.primaryPosition ||
                            playerInfo?.positions?.[0] ||
                            '미등록',
                    },
                    gameStats: gameStats.map((game) => ({
                        gameKey: game.gameKey,
                        date: game.date,
                        season: game.season,
                        opponent: game.opponent,
                        isHomeGame: game.isHomeGame,
                        stats: game.stats,
                    })),
                    seasonStats: seasonStats.reduce((acc, season) => {
                        acc[season.season] = {
                            gamesPlayed: season.gamesPlayed,
                            stats: season.stats,
                        };
                        return acc;
                    }, {}),
                    totalStats: totalStats
                        ? {
                            totalGamesPlayed: totalStats.totalGamesPlayed,
                            seasons: totalStats.seasons,
                            stats: totalStats.stats,
                            firstGameDate: totalStats.firstGameDate,
                            lastGameDate: totalStats.lastGameDate,
                        }
                        : null,
                    summary: {
                        totalGames: gameStats.length,
                        seasonsPlayed: seasonStats.length,
                        hasStats: gameStats.length > 0,
                    },
                },
            };
        }
        catch (error) {
            console.error(`❌ 스탯 조회 실패 (${user.username}):`, error.message);
            if (error.message.includes('playerId가 배정되지')) {
                return {
                    success: false,
                    message: error.message,
                    code: 'PLAYER_ID_NOT_ASSIGNED',
                };
            }
            return {
                success: false,
                message: '스탯 조회 중 오류가 발생했습니다.',
                error: error.message,
            };
        }
    }
};
exports.PlayerService = PlayerService;
exports.PlayerService = PlayerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(player_schema_1.Player.name)),
    __param(1, (0, mongoose_1.InjectModel)(team_schema_1.Team.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(3, (0, mongoose_1.InjectModel)(player_game_stats_schema_1.PlayerGameStats.name)),
    __param(4, (0, mongoose_1.InjectModel)(player_season_stats_schema_1.PlayerSeasonStats.name)),
    __param(5, (0, mongoose_1.InjectModel)(player_total_stats_schema_1.PlayerTotalStats.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        clip_analyzer_service_1.ClipAnalyzerService,
        stats_management_service_1.StatsManagementService])
], PlayerService);
//# sourceMappingURL=player.service.js.map