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
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const player_service_1 = require("../player/player.service");
const team_stats_analyzer_service_1 = require("../team/team-stats-analyzer.service");
const game_service_1 = require("./game.service");
const s3_service_1 = require("../common/services/s3.service");
const videoupload_service_1 = require("../videoupload/videoupload.service");
const common_2 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const game_upload_dto_1 = require("./dto/game-upload.dto");
let GameController = class GameController {
    playerService;
    teamStatsService;
    gameService;
    s3Service;
    videoUploadService;
    constructor(playerService, teamStatsService, gameService, s3Service, videoUploadService) {
        this.playerService = playerService;
        this.teamStatsService = teamStatsService;
        this.gameService = gameService;
        this.s3Service = s3Service;
        this.videoUploadService = videoUploadService;
    }
    async uploadGameData(gameData, req) {
        console.log('🎮 JSON Body로 게임 데이터 업로드 시작');
        console.log('📊 받은 데이터:', {
            clips: gameData.clips?.length || 0,
            gameKey: gameData.gameKey,
            homeTeam: gameData.homeTeam,
            awayTeam: gameData.awayTeam,
        });
        try {
            if (!gameData.clips || !Array.isArray(gameData.clips)) {
                throw new common_1.HttpException({
                    success: false,
                    message: '올바른 게임 데이터 형식이 아닙니다 (clips 배열이 필요)',
                    code: 'INVALID_GAME_DATA_STRUCTURE',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            console.log(`📊 게임 데이터 검증 완료: ${gameData.clips.length}개 클립`);
            const processedGameData = {
                ...gameData,
                Clips: gameData.clips,
            };
            const playerResults = await this.processGameData(processedGameData);
            console.log('🎯🎯🎯 선수 데이터 처리 완료, 이제 GameInfo 저장 시작 🎯🎯🎯');
            console.log('💾💾💾 경기 정보 저장 시작... 💾💾💾');
            try {
                const { team: uploaderTeam } = req.user;
                const gameInfoWithUploader = {
                    ...processedGameData,
                    uploader: uploaderTeam,
                };
                await this.gameService.createGameInfo(gameInfoWithUploader);
                console.log('✅✅✅ 경기 정보 저장 완료 ✅✅✅');
            }
            catch (gameInfoError) {
                console.error('❌❌❌ 경기 정보 저장 실패:', gameInfoError.message);
            }
            console.log('💾 경기 클립 데이터 저장 시작...');
            await this.gameService.saveGameClips(processedGameData);
            console.log('✅ 경기 클립 데이터 저장 완료');
            console.log('📊 팀 스탯 계산 시작...');
            const teamStatsResult = await this.teamStatsService.analyzeTeamStats(processedGameData);
            console.log('🏈 팀 스탯 계산 결과:', teamStatsResult);
            console.log('💾 팀 스탯 데이터베이스 저장 시작...');
            await this.teamStatsService.saveTeamStats(processedGameData.gameKey, teamStatsResult, processedGameData);
            console.log('✅ 팀 스탯 데이터베이스 저장 완료');
            console.log('✅ 게임 데이터 및 팀 스탯 처리 완료');
            return {
                success: true,
                message: '게임 데이터 분석 및 저장이 완료되었습니다',
                data: {
                    totalClips: gameData.clips.length,
                    gameKey: gameData.gameKey,
                    playerResults,
                    teamStats: teamStatsResult,
                },
            };
        }
        catch (error) {
            console.error('❌ 게임 데이터 처리 실패:', error);
            throw error;
        }
    }
    async uploadGameJson(file, req) {
        try {
            console.log('🎮 게임 JSON 파일 업로드 시작');
            if (!file) {
                throw new common_1.HttpException({
                    success: false,
                    message: '파일이 업로드되지 않았습니다',
                    code: 'NO_FILE_UPLOADED',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (file.size > 10 * 1024 * 1024) {
                throw new common_1.HttpException({
                    success: false,
                    message: '파일 크기가 너무 큽니다 (최대 10MB)',
                    code: 'FILE_TOO_LARGE',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            console.log(`📁 파일 정보: ${file.originalname} (${(file.size / 1024).toFixed(1)}KB)`);
            let gameData;
            try {
                let jsonContent = file.buffer.toString('utf-8');
                if (jsonContent.charCodeAt(0) === 0xfeff) {
                    jsonContent = jsonContent.slice(1);
                }
                console.log('🔍 JSON 내용 첫 200자:', jsonContent.substring(0, 200));
                gameData = JSON.parse(jsonContent);
                console.log('✅ JSON 파싱 성공');
            }
            catch (parseError) {
                console.error('❌ JSON 파싱 에러:', parseError.message);
                console.error('🔍 파일 내용:', file.buffer.toString('utf-8').substring(0, 500));
                throw new common_1.HttpException({
                    success: false,
                    message: '올바른 JSON 형식이 아닙니다',
                    code: 'INVALID_JSON_FORMAT',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (!gameData.Clips || !Array.isArray(gameData.Clips)) {
                throw new common_1.HttpException({
                    success: false,
                    message: '올바른 게임 데이터 형식이 아닙니다 (Clips 배열이 필요)',
                    code: 'INVALID_GAME_DATA_STRUCTURE',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            console.log(`📊 게임 데이터 검증 완료: ${gameData.Clips.length}개 클립`);
            const playerResults = await this.processGameData(gameData);
            console.log('🎯🎯🎯 선수 데이터 처리 완료, 이제 GameInfo 저장 시작 🎯🎯🎯');
            console.log('💾💾💾 경기 정보 저장 시작... 💾💾💾');
            try {
                const { team: uploaderTeam } = req.user;
                const gameDataWithUploader = {
                    ...gameData,
                    uploader: uploaderTeam,
                };
                await this.gameService.createGameInfo(gameDataWithUploader);
                console.log('✅✅✅ 경기 정보 저장 완료 ✅✅✅');
            }
            catch (gameInfoError) {
                console.error('❌❌❌ 경기 정보 저장 실패:', gameInfoError.message);
            }
            console.log('💾 경기 클립 데이터 저장 시작...');
            await this.gameService.saveGameClips(gameData);
            console.log('✅ 경기 클립 데이터 저장 완료');
            console.log('📊 팀 스탯 계산 시작...');
            const teamStatsResult = await this.teamStatsService.analyzeTeamStats(gameData);
            console.log('🏈 팀 스탯 계산 결과:', teamStatsResult);
            console.log('💾 팀 스탯 데이터베이스 저장 시작...');
            await this.teamStatsService.saveTeamStats(gameData.gameKey, teamStatsResult, gameData);
            console.log('✅ 팀 스탯 데이터베이스 저장 완료');
            console.log('✅ 게임 데이터 및 팀 스탯 처리 완료');
            return {
                success: true,
                message: '게임 데이터 및 팀 스탯 업로드 분석이 완료되었습니다',
                data: {
                    ...playerResults,
                    teamStats: teamStatsResult,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            console.error('❌ 게임 데이터 업로드 실패:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: '게임 데이터 처리 중 예상치 못한 오류가 발생했습니다',
                code: 'INTERNAL_PROCESSING_ERROR',
                details: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async processGameData(gameData) {
        console.log('🔍 선수 추출 시작');
        const playerNumbers = new Set();
        const invalidClips = [];
        const homeTeamPlayers = new Set();
        const awayTeamPlayers = new Set();
        gameData.Clips.forEach((clip) => {
            if (clip.significantPlays &&
                clip.significantPlays.includes('TOUCHDOWN')) {
                if (clip.car?.num) {
                }
            }
        });
        gameData.Clips.forEach((clip, index) => {
            try {
                if (clip.car?.num && typeof clip.car.num === 'number') {
                    playerNumbers.add(clip.car.num);
                }
                if (clip.car2?.num && typeof clip.car2.num === 'number') {
                    playerNumbers.add(clip.car2.num);
                }
                if (clip.tkl?.num && typeof clip.tkl.num === 'number') {
                    playerNumbers.add(clip.tkl.num);
                }
                if (clip.tkl2?.num && typeof clip.tkl2.num === 'number') {
                    playerNumbers.add(clip.tkl2.num);
                }
            }
            catch (error) {
                invalidClips.push({
                    clipIndex: index,
                    clipKey: clip.clipKey || 'unknown',
                    error: error.message,
                });
            }
        });
        console.log(`👥 발견된 선수: ${playerNumbers.size}명`);
        console.log(`📋 선수 목록: [${Array.from(playerNumbers)
            .sort((a, b) => a - b)
            .join(', ')}]`);
        if (invalidClips.length > 0) {
            console.log(`⚠️ 처리할 수 없는 클립 ${invalidClips.length}개 발견`);
        }
        const results = [];
        let processedCount = 0;
        for (const playerNum of Array.from(playerNumbers).sort((a, b) => a - b)) {
            try {
                processedCount++;
                console.log(`🔄 ${processedCount}/${playerNumbers.size} - ${playerNum}번 선수 분석 중...`);
                const playerClips = gameData.Clips.filter((clip) => clip.car?.num === playerNum ||
                    clip.car2?.num === playerNum ||
                    clip.tkl?.num === playerNum ||
                    clip.tkl2?.num === playerNum);
                console.log(`  📎 ${playerNum}번 선수 관련 클립: ${playerClips.length}개`);
                let playerTeamName = null;
                if (gameData.homeTeam && gameData.awayTeam) {
                    const homeTeamPlayerNumbers = [30, 16, 84];
                    if (homeTeamPlayerNumbers.includes(playerNum)) {
                        playerTeamName = gameData.homeTeam;
                    }
                    else {
                        playerTeamName = gameData.awayTeam;
                    }
                    console.log(`  📋 선수 ${playerNum} → ${playerTeamName} (${homeTeamPlayerNumbers.includes(playerNum) ? '홈팀' : '어웨이팀'})`);
                }
                console.log(`  👤 ${playerNum}번 선수 팀: ${playerTeamName || '미확인'}`);
                const analysisResult = await this.playerService.updatePlayerStatsFromNewClips(playerNum, playerClips, playerTeamName, gameData);
                results.push({
                    playerNumber: playerNum,
                    success: true,
                    clipsAnalyzed: playerClips.length,
                    position: this.extractPlayerPosition(playerClips, playerNum),
                    stats: analysisResult,
                    message: `${playerNum}번 선수 분석 완료`,
                });
                console.log(`  ✅ ${playerNum}번 선수 분석 완료`);
            }
            catch (error) {
                console.error(`  ❌ ${playerNum}번 선수 분석 실패:`, error.message);
                results.push({
                    playerNumber: playerNum,
                    success: false,
                    error: error.message,
                    message: `${playerNum}번 선수 분석 실패`,
                });
            }
        }
        const successfulPlayers = results.filter((r) => r.success);
        const failedPlayers = results.filter((r) => !r.success);
        console.log(`📊 분석 완료 요약:`);
        console.log(`  ✅ 성공: ${successfulPlayers.length}명`);
        console.log(`  ❌ 실패: ${failedPlayers.length}명`);
        return {
            gameInfo: {
                gameKey: gameData.gameKey || 'UNKNOWN',
                date: gameData.date || null,
                homeTeam: gameData.homeTeam || 'Unknown',
                awayTeam: gameData.awayTeam || 'Unknown',
                location: gameData.location || null,
                finalScore: gameData.score || null,
                totalClips: gameData.Clips.length,
                processedAt: new Date().toISOString(),
            },
            playerResults: results,
            summary: {
                totalPlayers: results.length,
                successfulPlayers: successfulPlayers.length,
                failedPlayers: failedPlayers.length,
                totalClipsProcessed: gameData.Clips.length,
                invalidClips: invalidClips.length,
                successRate: results.length > 0
                    ? Math.round((successfulPlayers.length / results.length) * 100)
                    : 0,
            },
            errors: {
                invalidClips: invalidClips,
                failedPlayers: failedPlayers.map((p) => ({
                    playerNumber: p.playerNumber,
                    error: p.error,
                })),
            },
        };
    }
    isHomeTeamPlay(clip, gameData) {
        return true;
    }
    extractPlayerPosition(clips, playerNumber) {
        const positions = [];
        clips.forEach((clip) => {
            if (clip.car?.num === playerNumber && clip.car?.pos) {
                positions.push(clip.car.pos);
            }
            if (clip.car2?.num === playerNumber && clip.car2?.pos) {
                positions.push(clip.car2.pos);
            }
            if (clip.tkl?.num === playerNumber && clip.tkl?.pos) {
                positions.push(clip.tkl.pos);
            }
            if (clip.tkl2?.num === playerNumber && clip.tkl2?.pos) {
                positions.push(clip.tkl2.pos);
            }
        });
        if (positions.length === 0)
            return 'Unknown';
        const positionCounts = positions.reduce((acc, pos) => {
            acc[pos] = (acc[pos] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(positionCounts).reduce((a, b) => positionCounts[a] > positionCounts[b] ? a : b);
    }
    async getGamesByTeam(teamName, req) {
        let games;
        let message;
        const { role, team: userTeam } = req.user;
        console.log(`🔍 경기 조회 요청 - 사용자: ${userTeam}, 역할: ${role}`);
        if (role === 'admin') {
            games = await this.gameService.findAllGames();
            message = '모든 경기 정보 조회 성공 (Admin)';
            console.log(`👑 Admin 조회: 총 ${games.length}개 경기`);
        }
        else {
            games = await this.gameService.findGamesByUploader(userTeam);
            message = `${userTeam} 팀이 업로드한 경기 정보 조회 성공`;
            console.log(`👤 ${userTeam} 업로드 경기: ${games.length}개`);
        }
        if (!games || games.length === 0) {
            throw new common_1.HttpException({
                success: false,
                message: `${teamName === 'admin' || teamName === 'Admin' ? '등록된 경기를' : `${teamName} 팀의 경기를`} 찾을 수 없습니다`,
                code: 'TEAM_GAMES_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        return {
            success: true,
            message: message,
            data: games,
            totalGames: games.length,
            accessLevel: teamName.toLowerCase() === 'admin' ? 'admin' : 'team',
        };
    }
    async getAllGames(req) {
        const { role, team: userTeam } = req.user;
        if (role === 'admin') {
            const games = await this.gameService.findAllGames();
            return {
                success: true,
                message: '모든 경기 정보 조회 성공 (Admin)',
                data: games,
                totalGames: games.length,
                accessLevel: 'admin',
            };
        }
        else {
            const games = await this.gameService.findGamesByTeam(userTeam);
            return {
                success: true,
                message: `${userTeam} 팀의 경기 정보 조회 성공`,
                data: games,
                totalGames: games.length,
                accessLevel: 'team',
            };
        }
    }
    async getCoachHighlights(req) {
        console.log('전체 request.user:', req.user);
        const { team: teamName, role } = req.user;
        if (role === 'admin') {
            console.log('🎥 Admin - 모든 팀 하이라이트 조회');
            const allTeams = await this.gameService.findAllGames();
            const uniqueTeams = [
                ...new Set(allTeams.flatMap((game) => [game.homeTeam, game.awayTeam])),
            ];
            const allHighlights = [];
            for (const team of uniqueTeams) {
                const teamHighlights = await this.gameService.getCoachHighlights(team);
                allHighlights.push(...teamHighlights);
            }
            return {
                success: true,
                message: '모든 팀 하이라이트 클립 조회 성공 (Admin)',
                data: allHighlights,
                totalClips: allHighlights.length,
                accessLevel: 'admin',
                teamsIncluded: uniqueTeams,
            };
        }
        else {
            console.log('🎥 코치용 하이라이트 조회:', teamName);
            const highlights = await this.gameService.getCoachHighlights(teamName);
            return {
                success: true,
                message: '하이라이트 클립 조회 성공',
                data: highlights,
                totalClips: highlights.length,
                accessLevel: 'team',
            };
        }
    }
    async getPlayerHighlights(req) {
        const { playerId, team: teamName, role } = req.user;
        if (role === 'admin') {
            console.log('🏃 Admin - 모든 선수 하이라이트 조회');
            const targetPlayerId = req.query.playerId || playerId;
            const targetTeam = req.query.team;
            if (targetPlayerId && targetTeam) {
                const highlights = await this.gameService.getPlayerHighlights(targetPlayerId, targetTeam);
                return {
                    success: true,
                    message: `${targetTeam} 팀 ${targetPlayerId} 선수 하이라이트 조회 성공 (Admin)`,
                    data: highlights,
                    playerNumber: targetPlayerId,
                    team: targetTeam,
                    totalClips: highlights.length,
                    accessLevel: 'admin',
                };
            }
            else {
                return {
                    success: true,
                    message: 'Admin 권한: 쿼리 파라미터로 ?playerId=선수ID&team=팀명을 지정하세요',
                    accessLevel: 'admin',
                    example: '/api/game/highlights/player?playerId=2025_KK_10&team=HYLions',
                };
            }
        }
        else {
            console.log('🏃 선수용 하이라이트 조회:', { playerId, teamName });
            if (!playerId) {
                throw new common_1.HttpException({
                    success: false,
                    message: '선수 번호가 등록되지 않았습니다.',
                    code: 'PLAYER_NUMBER_NOT_REGISTERED',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const highlights = await this.gameService.getPlayerHighlights(playerId, teamName);
            return {
                success: true,
                message: '선수 하이라이트 클립 조회 성공',
                data: highlights,
                playerNumber: playerId,
                totalClips: highlights.length,
                accessLevel: 'player',
            };
        }
    }
    async getGameClips(gameKey) {
        const clips = await this.gameService.getGameClipsByKey(gameKey);
        if (!clips) {
            throw new common_1.HttpException({
                success: false,
                message: `${gameKey} 경기의 클립 데이터를 찾을 수 없습니다`,
                code: 'CLIPS_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        try {
            console.log(`🎬 ${gameKey}의 ${clips.Clips.length}개 클립에 대한 비디오 URL 생성 시작`);
            const videoUrls = await this.s3Service.generateClipUrls(gameKey, clips.Clips.length);
            const clipsWithUrls = clips.Clips.map((clip, index) => ({
                ...clip,
                clipUrl: videoUrls[index] || null,
            }));
            const responseData = {
                ...clips.toObject ? clips.toObject() : clips,
                Clips: clipsWithUrls,
            };
            console.log(`✅ ${gameKey} 클립 URL 매핑 완료: ${videoUrls.length}/${clips.Clips.length}`);
            return {
                success: true,
                message: `${gameKey} 경기 클립 데이터 조회 성공`,
                data: responseData,
                totalClips: clips.Clips?.length || 0,
                videoUrlsGenerated: videoUrls.length,
            };
        }
        catch (error) {
            console.error(`❌ ${gameKey} 비디오 URL 생성 실패:`, error);
            return {
                success: true,
                message: `${gameKey} 경기 클립 데이터 조회 성공 (비디오 URL 생성 실패)`,
                data: clips,
                totalClips: clips.Clips?.length || 0,
                warning: 'S3 비디오 URL 생성에 실패했습니다',
            };
        }
    }
    async deleteGameByKey(gameKey) {
        const result = await this.gameService.deleteGameInfo(gameKey);
        return {
            success: true,
            message: `${gameKey} 경기 관련 모든 데이터가 삭제되었습니다`,
            ...result,
        };
    }
    async getGameByKey(gameKey) {
        const game = await this.gameService.findGameByKey(gameKey);
        if (!game) {
            throw new common_1.HttpException({
                success: false,
                message: `${gameKey} 경기를 찾을 수 없습니다`,
                code: 'GAME_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        return {
            success: true,
            message: '경기 정보 조회 성공',
            data: game,
        };
    }
    async prepareMatchUpload(body, req) {
        try {
            const { gameKey, gameInfo, quarterVideoCounts } = body;
            if (!gameKey || !gameInfo || !quarterVideoCounts) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'gameKey, gameInfo, quarterVideoCounts가 필요합니다',
                    code: 'MISSING_PARAMETERS',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (!/^[A-Z0-9]{4,}$/.test(gameKey)) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'gameKey 형식이 올바르지 않습니다',
                    code: 'INVALID_GAMEKEY_FORMAT',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            console.log(`🎬 경기 업로드 준비 시작: ${gameKey}`);
            console.log(`📊 쿼터별 영상 개수:`, quarterVideoCounts);
            let clipCounter = 1;
            const uploadUrls = {};
            let totalVideos = 0;
            for (const quarter of ['Q1', 'Q2', 'Q3', 'Q4']) {
                const videoCount = quarterVideoCounts[quarter] || 0;
                if (videoCount > 0) {
                    uploadUrls[quarter] = [];
                    for (let i = 0; i < videoCount; i++) {
                        const fileName = `${gameKey}_clip${clipCounter}.mp4`;
                        const s3Path = `videos/${gameKey}/${quarter}/${fileName}`;
                        const uploadUrl = await this.s3Service.generatePresignedUploadUrl(s3Path, 'video/mp4', 3600);
                        uploadUrls[quarter].push({
                            clipNumber: clipCounter,
                            fileName,
                            uploadUrl,
                            s3Path,
                            quarter,
                        });
                        clipCounter++;
                        totalVideos++;
                    }
                }
            }
            const { team: uploaderTeam } = req.user;
            console.log(`🔍 JWT에서 추출된 업로더 팀: ${uploaderTeam}`);
            console.log(`📋 전체 사용자 정보:`, req.user);
            await this.gameService.createGameInfo({
                ...gameInfo,
                gameKey,
                uploader: uploaderTeam,
                uploadStatus: 'pending',
            });
            console.log(`✅ ${gameKey} 경기 저장 완료 - 업로더: ${uploaderTeam}`);
            console.log(`✅ ${gameKey} 업로드 URL 생성 완료: 총 ${totalVideos}개`);
            return {
                success: true,
                message: '업로드 URL 생성 완료',
                data: {
                    gameKey,
                    totalVideos,
                    uploadUrls,
                    expiresIn: 3600,
                },
            };
        }
        catch (error) {
            console.error('❌ 경기 업로드 준비 실패:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: '경기 업로드 준비 중 오류가 발생했습니다',
                code: 'PREPARE_UPLOAD_ERROR',
                details: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async completeMatchUpload(body) {
        try {
            const { gameKey, uploadedVideos } = body;
            if (!gameKey || !uploadedVideos) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'gameKey와 uploadedVideos가 필요합니다',
                    code: 'MISSING_PARAMETERS',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            console.log(`🎯 경기 업로드 완료 처리 시작: ${gameKey}`);
            const totalUploaded = Object.values(uploadedVideos).flat().length;
            console.log(`📊 업로드된 영상 수: ${totalUploaded}개`);
            const updatedGame = await this.gameService.updateGameInfo(gameKey, {
                uploadStatus: 'completed',
                videoUrls: uploadedVideos,
                uploadCompletedAt: new Date().toISOString(),
            });
            if (!updatedGame) {
                throw new common_1.HttpException({
                    success: false,
                    message: `${gameKey} 경기를 찾을 수 없습니다`,
                    code: 'GAME_NOT_FOUND',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            console.log(`✅ ${gameKey} 경기 업로드 완료 처리 성공`);
            return {
                success: true,
                message: '경기 영상 업로드가 완료되었습니다',
                data: {
                    gameKey,
                    totalVideos: totalUploaded,
                    uploadedVideos,
                    uploadCompletedAt: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            console.error('❌ 경기 업로드 완료 처리 실패:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: '경기 업로드 완료 처리 중 오류가 발생했습니다',
                code: 'COMPLETE_UPLOAD_ERROR',
                details: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.GameController = GameController;
__decorate([
    (0, common_1.Post)('upload-data'),
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '📤 JSON 게임 데이터 업로드 및 자동 분석 (JSON Body)',
        description: 'JSON 형태의 게임 데이터를 request body로 받아 처리합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 게임 데이터 업로드 및 분석 성공',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "uploadGameData", null);
__decorate([
    (0, common_1.Post)('upload-json'),
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('gameFile')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({
        summary: '📤 JSON 게임 데이터 파일 업로드 및 자동 분석',
        description: `
    ## 🏈 게임 데이터 자동 분석 시스템

    이 API는 경기 분석 JSON 파일을 업로드하면 다음과 같이 자동으로 처리합니다:

    ### 📤 처리 과정
    1. **파일 검증**: JSON 형식 및 크기 확인 (최대 10MB)
    2. **데이터 파싱**: 게임 정보 및 클립 데이터 추출
    3. **선수 추출**: 모든 클립에서 참여 선수 자동 탐지
    4. **선수 통계 분석**: 포지션별 전용 분석기로 개별 선수 분석
    5. **팀 통계 분석**: 홈팀/어웨이팀 스탯 자동 계산 ✨
    6. **3-Tier 저장**: Game/Season/Career 통계 자동 업데이트

    ### 📊 지원하는 JSON 구조
    \`\`\`json
    {
      "gameKey": "DGKM240908",
      "homeTeam": "DGTuskers",
      "awayTeam": "KMRazorbacks",
      "Clips": [
        {
          "car": {"num": 15, "pos": "QB"},
          "car2": {"num": 33, "pos": "WR"},
          "tkl": {"num": 35, "pos": "DB"},
          "gainYard": 15,
          "significantPlays": ["TOUCHDOWN", null, null, null]
        }
      ]
    }
    \`\`\`

    ### ⚡ 자동 분석 범위
    - **개별 선수 (9개 포지션)**: QB, RB, WR, TE, K, P, OL, DL, LB, DB
    - **팀 통계**: 총야드, 패싱야드, 러싱야드, 리턴야드, 턴오버 ✨
    - **모든 통계**: 패싱, 러싱, 리시빙, 수비, 스페셜팀
    - **3-Tier 시스템**: 게임별 → 시즌별 → 커리어 자동 집계
    `,
    }),
    (0, swagger_1.ApiBody)({
        description: '📄 JSON 게임 데이터 파일 업로드',
        type: game_upload_dto_1.FileUploadDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 게임 데이터 업로드 및 분석 성공',
        type: game_upload_dto_1.GameUploadSuccessDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '❌ 잘못된 요청 (파일 없음, 형식 오류, JSON 구조 오류)',
        type: game_upload_dto_1.GameUploadErrorDto,
        schema: {
            example: {
                success: false,
                message: '올바른 JSON 형식이 아닙니다',
                code: 'INVALID_JSON_FORMAT',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 413,
        description: '❌ 파일 크기 초과 (최대 10MB)',
        type: game_upload_dto_1.GameUploadErrorDto,
        schema: {
            example: {
                success: false,
                message: '파일 크기가 너무 큽니다 (최대 10MB)',
                code: 'FILE_TOO_LARGE',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '❌ 서버 내부 오류',
        type: game_upload_dto_1.GameUploadErrorDto,
        schema: {
            example: {
                success: false,
                message: '게임 데이터 처리 중 예상치 못한 오류가 발생했습니다',
                code: 'INTERNAL_PROCESSING_ERROR',
                details: 'Database connection failed',
            },
        },
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "uploadGameJson", null);
__decorate([
    (0, common_1.Get)('team/:teamName'),
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '🏈 팀별 경기 정보 조회',
        description: '특정 팀이 업로드한 경기 정보를 조회합니다. 업로더만 자신이 업로드한 경기를 볼 수 있습니다. Admin은 모든 경기 조회 가능.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'teamName',
        description: '조회할 팀 이름 (Admin의 경우 모든 경기 반환)',
        example: 'HYLions',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 팀 경기 정보 조회 성공',
        schema: {
            example: [
                {
                    gameKey: 'SNUS20240907',
                    date: '2024-09-07(토) 10:00',
                    type: 'League',
                    score: { home: 38, away: 7 },
                    region: 'Seoul',
                    location: '서울대 운동장',
                    homeTeam: 'SNGreenTerrors',
                    awayTeam: 'USCityhawks',
                },
            ],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '❌ 해당 팀의 경기를 찾을 수 없음',
    }),
    __param(0, (0, common_1.Param)('teamName')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getGamesByTeam", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '📋 모든 경기 정보 조회',
        description: '저장된 모든 경기 정보를 조회합니다. Admin은 모든 경기, 일반 사용자는 자기 팀 경기만 조회 가능합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 모든 경기 정보 조회 성공',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getAllGames", null);
__decorate([
    (0, common_1.Get)('highlights/coach'),
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '🎥 코치용 하이라이트 클립 조회',
        description: 'significantPlays가 있거나 gainYard가 10야드 이상인 중요한 플레이를 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 코치용 하이라이트 조회 성공',
        schema: {
            example: {
                success: true,
                message: '하이라이트 클립 조회 성공',
                data: [
                    {
                        gameKey: 'SNUS20240907',
                        date: '2024-09-07(토) 10:00',
                        homeTeam: 'SNGreenTerrors',
                        awayTeam: 'USCityhawks',
                        location: '서울대 운동장',
                        clip: {
                            clipKey: '1',
                            playType: 'PASSING',
                            gainYard: 25,
                            significantPlays: ['TOUCHDOWN', null, null, null],
                        },
                    },
                ],
                totalClips: 15,
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: '❌ 인증 실패',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getCoachHighlights", null);
__decorate([
    (0, common_1.Get)('highlights/player'),
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '🏃 선수용 개인 하이라이트 조회',
        description: '로그인한 선수가 참여한 모든 클립을 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 선수 하이라이트 조회 성공',
        schema: {
            example: {
                success: true,
                message: '선수 하이라이트 클립 조회 성공',
                data: [
                    {
                        gameKey: 'SNUS20240907',
                        date: '2024-09-07(토) 10:00',
                        homeTeam: 'SNGreenTerrors',
                        awayTeam: 'USCityhawks',
                        location: '서울대 운동장',
                        clip: {
                            clipKey: '5',
                            playType: 'RUSHING',
                            gainYard: 15,
                            car: { num: 23, pos: 'RB' },
                        },
                    },
                ],
                playerNumber: 23,
                totalClips: 8,
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: '❌ 인증 실패',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '❌ 선수 번호가 등록되지 않음',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getPlayerHighlights", null);
__decorate([
    (0, common_1.Get)('clips/:gameKey'),
    (0, swagger_1.ApiOperation)({
        summary: '🎬 경기별 클립 데이터 조회',
        description: 'gameKey로 특정 경기의 모든 클립 데이터를 조회합니다.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'gameKey',
        description: '조회할 게임 키',
        example: 'SNUS20240907',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 클립 데이터 조회 성공',
        schema: {
            example: {
                success: true,
                message: 'SNUS20240907 경기 클립 데이터 조회 성공',
                data: {
                    gameKey: 'SNUS20240907',
                    homeTeam: 'SNGreenTerrors',
                    awayTeam: 'USCityhawks',
                    date: '2024-09-07(토) 10:00',
                    Clips: [
                        {
                            clipKey: '1',
                            offensiveTeam: 'SNGreenTerrors',
                            quarter: 1,
                            down: 1,
                            toGoYard: 10,
                            playType: 'PASSING',
                            gainYard: 15,
                            car: { num: 12, pos: 'QB' },
                            significantPlays: ['TOUCHDOWN', null, null, null],
                        },
                    ],
                },
                totalClips: 45,
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '❌ 클립 데이터를 찾을 수 없음',
    }),
    __param(0, (0, common_1.Param)('gameKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getGameClips", null);
__decorate([
    (0, common_1.Delete)(':gameKey'),
    (0, swagger_1.ApiOperation)({
        summary: '🗑️ 경기 데이터 완전 삭제',
        description: '게임 키로 경기와 관련된 모든 데이터를 삭제합니다 (GameInfo, GameClips, TeamGameStats, TeamTotalStats)',
    }),
    (0, swagger_1.ApiParam)({
        name: 'gameKey',
        description: '삭제할 게임 키',
        example: 'SNUS20240907',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 경기 데이터 삭제 성공',
        schema: {
            example: {
                success: true,
                message: 'SNUS20240907 경기 관련 모든 데이터가 삭제되었습니다',
                deletedCounts: {
                    gameInfo: 1,
                    gameClips: 1,
                    teamGameStats: 2,
                    teamTotalStats: 5,
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '❌ 경기를 찾을 수 없음',
    }),
    __param(0, (0, common_1.Param)('gameKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "deleteGameByKey", null);
__decorate([
    (0, common_1.Get)(':gameKey'),
    (0, swagger_1.ApiOperation)({
        summary: '🎮 특정 경기 정보 조회',
        description: '게임 키로 특정 경기 정보를 조회합니다.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'gameKey',
        description: '조회할 게임 키',
        example: 'SNUS20240907',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 경기 정보 조회 성공',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '❌ 경기를 찾을 수 없음',
    }),
    __param(0, (0, common_1.Param)('gameKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getGameByKey", null);
__decorate([
    (0, common_1.Post)('prepare-match-upload'),
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '🎬 경기 영상 업로드 준비',
        description: `
    ## 🏈 경기 + 쿼터별 영상 업로드 준비

    경기 정보와 쿼터별 영상 개수를 받아서 S3 업로드용 Presigned URL들을 생성합니다.

    ### 📤 요청 형태
    \`\`\`json
    {
      "gameKey": "YSKM20250920",
      "gameInfo": {
        "homeTeam": "YSeagles",
        "awayTeam": "KMrazorbacks",
        "date": "2025-09-20(금) 15:00",
        "type": "League",
        "score": {"home": 21, "away": 14},
        "region": "Seoul",
        "location": "테스트 경기장"
      },
      "quarterVideoCounts": {
        "Q1": 3,
        "Q2": 3, 
        "Q3": 2,
        "Q4": 2
      }
    }
    \`\`\`

    ### 📥 응답 형태
    - 각 영상별 S3 업로드 URL
    - 연속된 clip 번호 (Q1: clip1,2,3 → Q2: clip4,5,6 ...)
    - S3 경로: videos/{gameKey}/Q{n}/{gameKey}_clip{n}.mp4
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 업로드 URL 생성 성공',
        schema: {
            example: {
                success: true,
                message: '업로드 URL 생성 완료',
                data: {
                    gameKey: 'YSKM20250920',
                    totalVideos: 10,
                    uploadUrls: {
                        Q1: [
                            {
                                clipNumber: 1,
                                fileName: 'YSKM20250920_clip1.mp4',
                                uploadUrl: 'https://s3.amazonaws.com/...',
                                s3Path: 'videos/YSKM20250920/Q1/YSKM20250920_clip1.mp4'
                            }
                        ],
                        Q2: [
                            {
                                clipNumber: 4,
                                fileName: 'YSKM20250920_clip4.mp4',
                                uploadUrl: 'https://s3.amazonaws.com/...',
                                s3Path: 'videos/YSKM20250920/Q2/YSKM20250920_clip4.mp4'
                            }
                        ]
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '❌ 잘못된 요청 데이터',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "prepareMatchUpload", null);
__decorate([
    (0, common_1.Post)('complete-match-upload'),
    (0, swagger_1.ApiOperation)({
        summary: '🎯 경기 영상 업로드 완료',
        description: `
    ## ✅ 경기 영상 업로드 완료 처리

    S3에 영상 업로드가 완료된 후, 최종 경기 데이터를 처리합니다.

    ### 📤 요청 형태
    \`\`\`json
    {
      "gameKey": "YSKM20250920",
      "uploadedVideos": {
        "Q1": ["YSKM20250920_clip1.mp4", "YSKM20250920_clip2.mp4"],
        "Q2": ["YSKM20250920_clip4.mp4", "YSKM20250920_clip5.mp4"],
        "Q3": ["YSKM20250920_clip7.mp4"],
        "Q4": ["YSKM20250920_clip9.mp4", "YSKM20250920_clip10.mp4"]
      }
    }
    \`\`\`
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 경기 업로드 완료',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '❌ 경기를 찾을 수 없음',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "completeMatchUpload", null);
exports.GameController = GameController = __decorate([
    (0, swagger_1.ApiTags)('🏈 Game Data Upload'),
    (0, common_1.Controller)('game'),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => player_service_1.PlayerService))),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => team_stats_analyzer_service_1.TeamStatsAnalyzerService))),
    __metadata("design:paramtypes", [player_service_1.PlayerService,
        team_stats_analyzer_service_1.TeamStatsAnalyzerService,
        game_service_1.GameService,
        s3_service_1.S3Service,
        videoupload_service_1.VideoUploadService])
], GameController);
//# sourceMappingURL=game.controller.js.map