import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PlayerService } from './player.service';
import {
  CreatePlayerDto,
  UpdatePlayerStatsDto,
  PlayerResponseDto,
  PlayersListResponseDto,
} from '../common/dto/player.dto';
import { AnalyzeNewClipsDto } from '../common/dto/new-clip.dto';
import { GameDataDto } from '../common/dto/game-data.dto';
import { StatsManagementService } from '../common/services/stats-management.service';
import { TeamStatsAnalyzerService } from '../team/team-stats-analyzer.service';
import { GameService } from '../game/game.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User as UserSchema, UserDocument } from '../schemas/user.schema';
import { NotificationService } from '../notification/notification.service';

@ApiTags('Player')
@Controller('player')
export class PlayerController {
  constructor(
    private readonly playerService: PlayerService,
    private readonly statsManagementService: StatsManagementService,
    private readonly teamStatsService: TeamStatsAnalyzerService,
    private readonly gameService: GameService,
    @InjectModel(UserSchema.name) private userModel: Model<UserDocument>,
    private readonly notificationService: NotificationService,
  ) {}

  @Post('reset-all')
  @ApiOperation({ summary: '모든 선수 데이터 및 게임 데이터 초기화' })
  @ApiResponse({ status: 200, description: '선수 데이터와 게임 데이터 초기화 성공' })
  @HttpCode(HttpStatus.OK)
  async resetAllPlayers() {
    console.log('🔄 모든 선수 데이터 및 게임 데이터 초기화 요청');

    try {
      // 1. 선수 데이터 삭제
      const playerResult = await this.playerService.resetAllPlayerData();
      
      // 2. 모든 게임 데이터 삭제
      const allGames = await this.gameService.findAllGames();
      let totalGamesDeleted = 0;
      
      for (const game of allGames) {
        try {
          await this.gameService.deleteGameInfo(game.gameKey);
          totalGamesDeleted++;
        } catch (error) {
          console.error(`❌ 게임 ${game.gameKey} 삭제 실패:`, error);
        }
      }
      
      console.log(`✅ 총 ${totalGamesDeleted}개의 게임 데이터가 삭제되었습니다.`);
      
      return {
        success: true,
        message: `${playerResult.deletedCount}명의 선수 데이터와 ${totalGamesDeleted}개의 게임 데이터가 삭제되었습니다.`,
        deletedCount: {
          players: playerResult.deletedCount,
          games: totalGamesDeleted
        },
      };
    } catch (error) {
      console.error('❌ 데이터 초기화 실패:', error);
      return {
        success: false,
        message: '데이터 초기화에 실패했습니다.',
        error: error.message,
      };
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '선수 생성' })
  @ApiResponse({ status: 201, description: '선수 생성 성공' })
  async createPlayer(
    @Body() createPlayerDto: CreatePlayerDto,
    @User() user: any,
  ) {
    // 임시로 첫 번째 팀 ID 사용 (실제로는 요청에서 받아야 함)
    const teamId = '507f1f77bcf86cd799439011'; // 임시 ObjectId
    return this.playerService.createPlayer(createPlayerDto, teamId);
  }

  @Get('code/:playerId')
  @ApiOperation({ summary: 'PlayerCode로 개별 선수 조회' })
  @ApiResponse({
    status: 200,
    description: '선수 조회 성공',
    type: PlayerResponseDto,
  })
  @ApiResponse({ status: 404, description: '선수를 찾을 수 없음' })
  async getPlayerByCode(@Param('playerId') playerId: string) {
    return this.playerService.getPlayerByCode(playerId);
  }

  @Get('position/:position')
  @ApiOperation({ summary: '포지션별 선수 목록 조회' })
  @ApiQuery({ name: 'league', required: false, enum: ['1부', '2부'] })
  @ApiResponse({
    status: 200,
    description: '포지션별 선수 목록 조회 성공',
    type: PlayersListResponseDto,
  })
  async getPlayersByPosition(
    @Param('position') position: string,
    @Query('league') league?: string,
  ) {
    return this.playerService.getPlayersByPosition(position, league);
  }

  @Get('rankings')
  @ApiOperation({ summary: '전체 선수 스탯 랭킹 조회' })
  @ApiQuery({ name: 'league', required: false, enum: ['1부', '2부'] })
  @ApiQuery({ name: 'sortBy', required: false, example: 'passingYards' })
  @ApiResponse({ status: 200, description: '선수 랭킹 조회 성공' })
  async getAllPlayersRanking(
    @Query('league') league?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.playerService.getAllPlayersRanking(league, sortBy);
  }

  @Put(':playerId/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '선수 스탯 업데이트' })
  @ApiResponse({ status: 200, description: '스탯 업데이트 성공' })
  @ApiResponse({ status: 404, description: '선수를 찾을 수 없음' })
  async updatePlayerStats(
    @Param('playerId') playerId: string,
    @Body() updateStatsDto: UpdatePlayerStatsDto,
  ) {
    return this.playerService.updatePlayerStats(playerId, updateStatsDto);
  }

  @Get('team/:teamId')
  @ApiOperation({ summary: '팀별 선수 목록 조회' })
  @ApiResponse({ status: 200, description: '팀 선수 목록 조회 성공' })
  async getPlayersByTeam(@Param('teamId') teamId: string) {
    return this.playerService.getPlayersByTeam(teamId);
  }

  // 테스트용: 샘플 데이터 생성
  @Post('sample')
  @ApiOperation({ summary: '샘플 선수 데이터 생성 (테스트용)' })
  @ApiResponse({ status: 201, description: '샘플 데이터 생성 성공' })
  async createSamplePlayer() {
    const samplePlayer: CreatePlayerDto = {
      playerId: 'QB001',
      name: 'Ken Lee',
      jerseyNumber: 10,
      position: 'QB',
      league: '1부',
      season: '2024',
      stats: {
        passingYards: 200,
        passingTouchdowns: 5,
        completionPercentage: 60,
        passerRating: 85.5,
        gamesPlayed: 8,
        totalYards: 200,
        totalTouchdowns: 5,
      },
    };

    const teamId = '507f1f77bcf86cd799439011';
    return this.playerService.createPlayer(samplePlayer, teamId);
  }

  // === 새로운 클립 구조 관련 엔드포인트 ===

  @Post('jersey/:jerseyNumber/analyze-new-clips')
  @ApiOperation({
    summary: '새로운 형식의 클립 데이터 분석 및 스탯 업데이트',
    description:
      '새로운 car/tkl 형식의 클립 데이터를 받아서 선수 스탯을 자동으로 분석하고 업데이트합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '새 클립 스탯 분석 및 업데이트 성공',
  })
  @ApiResponse({ status: 404, description: '선수를 찾을 수 없음' })
  async updatePlayerStatsFromNewClips(
    @Param('jerseyNumber') jerseyNumber: string,
    @Body() analyzeNewClipsDto: AnalyzeNewClipsDto,
  ) {
    const jerseyNum = parseInt(jerseyNumber);
    const result = await this.playerService.updatePlayerStatsFromNewClips(
      jerseyNum,
      analyzeNewClipsDto.clips,
    );

    // 팀 스탯도 함께 업데이트
    try {
      if (analyzeNewClipsDto.clips && analyzeNewClipsDto.clips.length > 0) {
        const gameKey = analyzeNewClipsDto.clips[0]?.clipKey || 'unknown';

        // clipKey에서 시즌(연도) 추출 (예: HFHY20240907 → 2024)
        let season = '2024'; // 기본값
        if (gameKey && gameKey.length >= 8) {
          const extractedYear = gameKey.substring(4, 8);
          if (/^\d{4}$/.test(extractedYear)) {
            season = extractedYear;
          }
        }

        // DTO에서 팀 정보 가져오기
        const homeTeam = analyzeNewClipsDto.homeTeam;
        const awayTeam = analyzeNewClipsDto.awayTeam;

        console.log(
          `📊 팀 스탯 업데이트 - 홈팀: ${homeTeam}, 어웨이팀: ${awayTeam}`,
        );

        // 팀 시즌 스탯 업데이트 - 시즌별 스탯 제거로 임시 비활성화
        /*
        await this.teamSeasonStatsService.analyzeAndUpdateTeamStats(
          analyzeNewClipsDto.clips,
          gameKey,
          homeTeam,
          awayTeam,
          season,
        );
        */
      }
    } catch (error) {
      console.log('팀 스탯 업데이트 중 오류 발생:', error);
      // 팀 스탯 오류가 있어도 개인 스탯 결과는 반환
    }

    return result;
  }

  @Post('analyze-game-data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '전체 게임 데이터 분석 및 팀/선수 스탯 업데이트',
    description:
      '게임의 전체 JSON 데이터를 받아서 홈팀/어웨이팀 정보를 자동으로 추출하고 모든 선수 및 팀 스탯을 업데이트합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '게임 데이터 분석 및 스탯 업데이트 성공',
  })
  @ApiResponse({ status: 400, description: '잘못된 게임 데이터 형식' })
  async analyzeGameData(@Body() gameData: GameDataDto, @User() user: any) {
    console.log('게임 데이터 분석 시작:', gameData.gameKey);
    console.log('홈팀:', gameData.homeTeam, '어웨이팀:', gameData.awayTeam);
    console.log('클립 개수:', gameData.Clips?.length);

    const results = {
      gameKey: gameData.gameKey,
      homeTeam: gameData.homeTeam,
      awayTeam: gameData.awayTeam,
      clipsProcessed: gameData.Clips?.length || 0,
      playerStatsUpdated: 0,
      teamStatsUpdated: false,
      errors: [] as string[],
    };

    try {
      // ClipAnalyzer를 사용한 전체 선수 분석
      const clipResult = await this.playerService.analyzeGameData(gameData);
      console.log('🔍 ClipAnalyzer 결과:', {
        success: clipResult.success,
        qbCount: clipResult.qbCount,
        totalAnalyzed: clipResult.results?.length || 0
      });
      if (clipResult.success) {
        results.playerStatsUpdated = clipResult.results?.length || 0;
        results.teamStatsUpdated = true;
      }

      // 개별 선수 업데이트는 clipAnalyzer에서 처리하므로 주석 처리
      /*if (gameData.Clips && gameData.Clips.length > 0) {
        const allPlayers = new Set<number>();

        // 모든 클립에서 관련된 선수들의 저지 번호 수집
        gameData.Clips.forEach((clip) => {
          if (clip.car?.num) allPlayers.add(clip.car.num);
          if (clip.car2?.num) allPlayers.add(clip.car2.num);
          if (clip.tkl?.num) allPlayers.add(clip.tkl.num);
          if (clip.tkl2?.num) allPlayers.add(clip.tkl2.num);
        });

        console.log('관련된 선수들:', Array.from(allPlayers));

        // 홈팀과 어웨이팀 선수들을 분리해서 처리
        const homePlayerNumbers = new Set<number>();
        const awayPlayerNumbers = new Set<number>();

        // 클립별로 홈팀/어웨이팀 선수들 분류
        gameData.Clips.forEach((clip) => {
          if (clip.offensiveTeam === 'Home') {
            if (clip.car?.num) homePlayerNumbers.add(clip.car.num);
            if (clip.car2?.num) homePlayerNumbers.add(clip.car2.num);
          } else if (clip.offensiveTeam === 'Away') {
            if (clip.car?.num) awayPlayerNumbers.add(clip.car.num);
            if (clip.car2?.num) awayPlayerNumbers.add(clip.car2.num);
          }

          // 수비 선수들은 상대팀 공격 시 나타남
          if (clip.offensiveTeam === 'Home') {
            if (clip.tkl?.num) awayPlayerNumbers.add(clip.tkl.num);
            if (clip.tkl2?.num) awayPlayerNumbers.add(clip.tkl2.num);
          } else if (clip.offensiveTeam === 'Away') {
            if (clip.tkl?.num) homePlayerNumbers.add(clip.tkl.num);
            if (clip.tkl2?.num) homePlayerNumbers.add(clip.tkl2.num);
          }
        });

        console.log(
          `홈팀(${gameData.homeTeam}) 선수들:`,
          Array.from(homePlayerNumbers),
        );
        console.log(
          `어웨이팀(${gameData.awayTeam}) 선수들:`,
          Array.from(awayPlayerNumbers),
        );

        // 홈팀 선수들 스탯 업데이트
        for (const jerseyNumber of homePlayerNumbers) {
          try {
            const result =
              await this.playerService.updatePlayerStatsFromNewClips(
                jerseyNumber,
                gameData.Clips,
                gameData.homeTeam,
              );
            if (result.success !== false) {
              results.playerStatsUpdated++;
            }
          } catch (error) {
            console.error(
              `홈팀 선수 ${jerseyNumber} 스탯 업데이트 실패:`,
              error,
            );
            results.errors.push(`홈팀 선수 ${jerseyNumber}: ${error.message}`);
          }
        }

        // 어웨이팀 선수들 스탯 업데이트
        for (const jerseyNumber of awayPlayerNumbers) {
          try {
            const result =
              await this.playerService.updatePlayerStatsFromNewClips(
                jerseyNumber,
                gameData.Clips,
                gameData.awayTeam,
              );
            if (result.success !== false) {
              results.playerStatsUpdated++;
            }
          } catch (error) {
            console.error(
              `어웨이팀 선수 ${jerseyNumber} 스탯 업데이트 실패:`,
              error,
            );
            results.errors.push(
              `어웨이팀 선수 ${jerseyNumber}: ${error.message}`,
            );
          }
        }
      }*/

      // 팀 스탯 처리 추가
      console.log('📊 팀 스탯 계산 및 저장 시작...');

      require('fs').appendFileSync(
        '/tmp/team-stats-debug.log',
        `팀 스탯 분석 시작: gameKey=${gameData.gameKey}\n`,
      );

      const teamStatsResult =
        await this.teamStatsService.analyzeTeamStats(gameData);
      require('fs').appendFileSync(
        '/tmp/team-stats-debug.log',
        `팀 스탯 분석 결과: ${JSON.stringify(teamStatsResult)}\n`,
      );

      await this.teamStatsService.saveTeamStats(
        gameData.gameKey,
        teamStatsResult,
        gameData,
      );

      console.log('✅ 팀 스탯 업데이트 완료');

      // GameInfo 생성 전에 상태 저장
      let existingGameForNotification = null;
      let shouldSendNotification = false;
      
      // GameInfo 생성
      console.log('💾💾💾 경기 정보 저장 시작... 💾💾💾');
      try {
        // 기존 게임이 있는지 확인하고 uploader 유지
        const existingGame = await this.gameService.findGameByKey(gameData.gameKey);
        existingGameForNotification = existingGame; // 나중에 알림 생성용으로 저장
        const wasAlreadyCompleted = existingGame?.uploadStatus === 'completed';
        const uploaderTeam = existingGame?.uploader || user.team;
        console.log(`🔍 GameInfo uploader 정보: 기존=${existingGame?.uploader}, 현재 사용자=${user.team}, 최종=${uploaderTeam}`);
        console.log(`📝 기존 uploadStatus: ${existingGame?.uploadStatus}`);
        
        // 알림 조건 확인: pending → completed 변경인 경우
        shouldSendNotification = existingGame && existingGame.uploadStatus === 'pending' && !wasAlreadyCompleted;
        
        const gameDataWithUploader = {
          ...gameData,
          uploader: uploaderTeam, // 기존 uploader 유지 또는 새 사용자
          uploadStatus: 'completed', // JSON 업로드 시 완료 상태로 설정
          report: true, // 보고서 생성 완료 표시
        };
        await this.gameService.createGameInfo(gameDataWithUploader);
        console.log('✅✅✅ 경기 정보 저장 완료 ✅✅✅');
      } catch (gameInfoError) {
        console.error('❌❌❌ 경기 정보 저장 실패:', gameInfoError.message);
        results.errors.push(`GameInfo 생성: ${gameInfoError.message}`);
        shouldSendNotification = false; // 실패 시 알림 안 보냄
      }

      // GameClips 저장
      console.log('🎬🎬🎬 경기 클립 데이터 저장 시작... 🎬🎬🎬');
      try {
        // 기존 게임 정보에서 uploader 가져오기
        const existingGame = await this.gameService.findGameByKey(gameData.gameKey);
        const uploaderTeam = existingGame?.uploader || user.team;
        console.log(`🔍 GameClips uploader 정보: 기존=${existingGame?.uploader}, 현재 사용자=${user.team}, 최종=${uploaderTeam}`);
        
        const gameClipsData = {
          ...gameData,
          uploader: uploaderTeam,
        };
        await this.gameService.saveGameClips(gameClipsData);
        console.log('✅✅✅ 경기 클립 데이터 저장 완료 ✅✅✅');
      } catch (gameClipsError) {
        console.error('❌❌❌ 경기 클립 데이터 저장 실패:', gameClipsError.message);
        results.errors.push(`GameClips 생성: ${gameClipsError.message}`);
      }

    } catch (error) {
      console.error('게임 데이터 분석 중 전체 오류:', error);
      require('fs').appendFileSync(
        '/tmp/team-stats-debug.log',
        `오류 발생: ${error.message}\n`,
      );
      results.errors.push(`전체 분석: ${error.message}`);
      shouldSendNotification = false; // 전체 오류 발생 시 알림 안 보냄
    }

    // 🔔 모든 처리가 성공적으로 완료되고 알림 조건이 충족된 경우에만 알림 생성
    if (shouldSendNotification && results.errors.length === 0 && existingGameForNotification) {
      console.log('🔔 경기 분석 완료 알림 생성 시작');
      
      try {
        const uploaderTeam = existingGameForNotification.uploader || user.team;
        
        // 해당 팀의 모든 사용자 조회
        const teamUsers = await this.userModel.find({
          team: uploaderTeam,
          role: { $in: ['player', 'coach'] }
        }).select('username team');
        
        console.log(`📋 ${uploaderTeam} 팀 사용자 ${teamUsers.length}명 발견`);
        
        // 팀의 모든 사용자들에게 알림 생성
        if (teamUsers.length > 0) {
          const userIds = teamUsers.map(user => user.username);
          await this.notificationService.createTeamNotifications(
            uploaderTeam,
            gameData.gameKey,
            {
              homeTeam: gameData.homeTeam,
              awayTeam: gameData.awayTeam,
              date: gameData.date || new Date().toISOString(),
            },
            userIds,
          );
          
          console.log('✅ 알림 생성 완료');
        } else {
          console.log('⚠️ 해당 팀에 사용자가 없어 알림을 생성하지 않음');
        }
      } catch (notificationError) {
        console.error('❌ 알림 생성 실패:', notificationError.message);
        // 알림 실패는 전체 프로세스에 영향을 주지 않음
      }
    } else if (!shouldSendNotification) {
      console.log('ℹ️ 알림 생성 조건 미충족 (이미 completed 상태이거나 에러 발생)');
    }

    return {
      success: results.errors.length === 0,
      message: `게임 ${gameData.gameKey} 분석 완료`,
      data: results,
    };
  }

  @Post('jersey/:jerseyNumber/analyze-new-clips-only')
  @ApiOperation({
    summary: '새로운 형식의 클립 데이터 분석만 (DB 업데이트 안함)',
    description:
      '새로운 car/tkl 형식의 클립 데이터를 분석하여 예상 스탯을 반환하지만 DB에는 저장하지 않습니다.',
  })
  @ApiResponse({ status: 200, description: '새 클립 스탯 분석 성공' })
  @ApiResponse({ status: 404, description: '선수를 찾을 수 없음' })
  async analyzeNewClipsOnly(
    @Param('jerseyNumber') jerseyNumber: string,
    @Body() analyzeNewClipsDto: AnalyzeNewClipsDto,
  ) {
    const jerseyNum = parseInt(jerseyNumber);
    // analyzeNewClipsOnly 메서드는 제거됨 - updatePlayerStatsFromNewClips 사용
    return this.playerService.updatePlayerStatsFromNewClips(
      jerseyNum,
      analyzeNewClipsDto.clips,
    );
  }

  @Post('update-game-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '게임별 스탯 업데이트',
    description:
      '새로운 형식의 클립 데이터로 게임의 모든 선수 스탯을 업데이트합니다.',
  })
  @ApiResponse({ status: 200, description: '게임 스탯 업데이트 성공' })
  async updateGameStats(@Body() gameData: any, @User() user: any) {
    console.log('받은 데이터 구조:', JSON.stringify(gameData, null, 2));
    console.log('업로더 정보:', user);
    
    // 업로더 정보를 게임 데이터에 추가
    const gameDataWithUploader = {
      ...gameData,
      uploader: user.team,
    };
    
    return this.playerService.analyzeGameData(gameDataWithUploader);
  }

  // === 3단계 스탯 관리 시스템 엔드포인트 ===

  @Get('jersey/:jerseyNumber/game-stats')
  @ApiOperation({
    summary: '선수의 게임별 스탯 조회',
    description: '특정 선수의 모든 게임별 개별 스탯을 조회합니다.',
  })
  @ApiQuery({
    name: 'season',
    required: false,
    description: '특정 시즌 필터링',
  })
  @ApiResponse({ status: 200, description: '게임별 스탯 조회 성공' })
  async getPlayerGameStats(
    @Param('jerseyNumber') jerseyNumber: string,
    @Query('season') season?: string,
  ) {
    const jerseyNum = parseInt(jerseyNumber);
    return this.statsManagementService.getPlayerGameStats(jerseyNum, season);
  }

  @Get('jersey/:jerseyNumber/season-stats')
  @ApiOperation({
    summary: '선수의 시즌별 스탯 조회',
    description: '특정 선수의 시즌별 누적 스탯을 조회합니다.',
  })
  @ApiQuery({
    name: 'season',
    required: false,
    description: '특정 시즌 필터링',
  })
  @ApiResponse({ status: 200, description: '시즌별 스탯 조회 성공' })
  async getPlayerSeasonStats(
    @Param('jerseyNumber') jerseyNumber: string,
    @Query('season') season?: string,
  ) {
    const jerseyNum = parseInt(jerseyNumber);
    return this.statsManagementService.getPlayerSeasonStats(jerseyNum, season);
  }

  @Get('jersey/:jerseyNumber/career-stats')
  @ApiOperation({
    summary: '선수의 커리어 스탯 조회',
    description: '특정 선수의 전체 커리어 누적 스탯을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '커리어 스탯 조회 성공' })
  async getPlayerCareerStats(@Param('jerseyNumber') jerseyNumber: string) {
    const jerseyNum = parseInt(jerseyNumber);
    return this.statsManagementService.getPlayerCareerStats(jerseyNum);
  }

  @Get('season-rankings/:season/:league')
  @ApiOperation({
    summary: '시즌 리그별 랭킹 조회',
    description: '특정 시즌 및 리그에서의 선수 랭킹을 조회합니다.',
  })
  @ApiQuery({ name: 'position', required: false, description: '포지션 필터링' })
  @ApiQuery({ name: 'sortBy', required: false, description: '정렬 기준 스탯' })
  @ApiResponse({ status: 200, description: '시즌 랭킹 조회 성공' })
  async getSeasonRankings(
    @Param('season') season: string,
    @Param('league') league: string,
    @Query('position') position?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.statsManagementService.getSeasonRankings(
      season,
      league,
      position,
      sortBy,
    );
  }

  @Get('career-rankings')
  @ApiOperation({
    summary: '커리어 랭킹 조회',
    description: '활성 선수들의 커리어 전체 랭킹을 조회합니다.',
  })
  @ApiQuery({ name: 'position', required: false, description: '포지션 필터링' })
  @ApiQuery({ name: 'sortBy', required: false, description: '정렬 기준 스탯' })
  @ApiResponse({ status: 200, description: '커리어 랭킹 조회 성공' })
  async getCareerRankings(
    @Query('position') position?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.statsManagementService.getCareerRankings(position, sortBy);
  }

  @Post('game-stats-batch')
  @ApiOperation({
    summary: '게임 전체 선수 스탯 일괄 업데이트',
    description: '한 게임의 모든 참여 선수들의 스탯을 일괄 업데이트합니다.',
  })
  @ApiResponse({ status: 200, description: '게임 스탯 일괄 업데이트 성공' })
  async updateGameStatsBatch(
    @Body()
    batchData: {
      gameKey: string;
      gameDate: string;
      homeTeam: string;
      awayTeam: string;
      playersStats: Array<{
        playerNumber: number;
        analyzedStats: any;
      }>;
    },
  ) {
    const gameDate = new Date(batchData.gameDate);
    return this.statsManagementService.updateMultiplePlayersGameStats(
      batchData.gameKey,
      gameDate,
      batchData.homeTeam,
      batchData.awayTeam,
      batchData.playersStats,
    );
  }

  @Post('reset-all-stats')
  @ApiOperation({
    summary: '모든 선수 스탯 초기화',
    description: '데이터베이스의 모든 선수 스탯을 초기화합니다.',
  })
  @ApiResponse({ status: 200, description: '스탯 초기화 성공' })
  async resetAllPlayersStats() {
    return this.playerService.resetAllPlayersStats();
  }

  @Post('reset-processed-games')
  @ApiOperation({
    summary: '처리된 게임 목록 초기화',
    description: 'JSON 중복 입력 방지를 위한 처리된 게임 목록을 초기화합니다.',
  })
  @ApiResponse({ status: 200, description: '처리된 게임 목록 초기화 성공' })
  async resetProcessedGames() {
    return this.playerService.resetProcessedGames();
  }

  @Post('reset-team-stats/all')
  @ApiOperation({
    summary: '🔄 모든 팀 누적 스탯 초기화',
    description:
      '시즌 관계없이 모든 팀의 누적 스탯을 초기화합니다. (개발/테스트용)',
  })
  @ApiResponse({ status: 200, description: '팀 누적 스탯 초기화 성공' })
  async resetTeamStats() {
    return this.resetTeamTotalStats();
  }

  @Post('reset-team-total-stats')
  @ApiOperation({
    summary: '🔄 팀 누적 스탯 초기화',
    description: '모든 팀의 누적 스탯을 초기화합니다. (개발/테스트용)',
  })
  @ApiResponse({ status: 200, description: '팀 누적 스탯 초기화 성공' })
  async resetTeamTotalStats() {
    try {
      const result = await this.statsManagementService.resetTeamTotalStats();

      return {
        success: true,
        message: '팀 누적 스탯 초기화가 완료되었습니다',
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: '팀 누적 스탯 초기화 중 오류가 발생했습니다',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('reset-team-game-stats')
  @ApiOperation({
    summary: '🗑️ 팀 경기별 스탯 전체 삭제',
    description:
      'team_game_stats 컬렉션의 모든 데이터를 삭제합니다. (개발/테스트용)',
  })
  @ApiResponse({
    status: 200,
    description: '팀 경기별 스탯 삭제 성공',
  })
  async resetTeamGameStats() {
    try {
      const result = await this.statsManagementService.resetTeamGameStats();

      return {
        success: true,
        message: '팀 경기별 스탯이 삭제되었습니다',
        deletedCount: result.deletedCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ 팀 경기별 스탯 삭제 실패:', error);
      return {
        success: false,
        message: '팀 경기별 스탯 삭제 중 오류가 발생했습니다',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('reset-all-data')
  @ApiOperation({
    summary: '🚨 모든 데이터 완전 삭제',
    description:
      '선수, 게임정보, 클립, 팀통계 등 모든 데이터를 삭제합니다. (개발/테스트용 - 주의!)',
  })
  @ApiResponse({
    status: 200,
    description: '모든 데이터 삭제 성공',
  })
  async resetAllData() {
    try {
      console.log('🚨 모든 데이터 완전 삭제 시작...');

      const results = await Promise.all([
        this.playerService.resetAllPlayerData(),
        this.statsManagementService.resetPlayerStats(),
        this.statsManagementService.resetTeamTotalStats(),
        this.statsManagementService.resetTeamGameStats(),
        this.statsManagementService.resetGameInfos(),
        this.statsManagementService.resetGameClips(),
      ]);

      const deletedCounts = {
        players: results[0].deletedCount,
        playerStats: results[1],
        teamTotalStats: results[2].deletedCount,
        teamGameStats: results[3].deletedCount,
        gameInfos: results[4].deletedCount,
        gameClips: results[5].deletedCount,
      };

      console.log('🎉 모든 데이터 삭제 완료:', deletedCounts);

      return {
        success: true,
        message: '모든 데이터가 삭제되었습니다',
        deletedCounts,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ 전체 데이터 삭제 실패:', error);
      return {
        success: false,
        message: '전체 데이터 삭제 중 오류가 발생했습니다',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('my-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '🏈 내 선수 스탯 조회',
    description: `
    ## 🏈 선수 전용 API

    로그인한 선수의 개인 스탯을 조회합니다.
    
    ### 🎯 사용 목적
    - 마이페이지에서 개인 스탯 표시
    - 경기별/시즌별/통합 스탯 조회
    - 하이라이트 영상 연결을 위한 기본 정보

    ### 📋 반환 정보
    - 경기별 스탯 (최근 경기부터)
    - 시즌별 스탯
    - 통합 스탯 (커리어 전체)
    - 선수 기본 정보

    ### ⚠️ 주의사항
    - JWT 토큰 필요
    - playerId가 배정된 선수만 조회 가능
    - 관리자가 playerId를 배정해야 사용 가능
    `,
  })
  @ApiResponse({
    status: 200,
    description: '✅ 내 스탯 조회 성공',
    schema: {
      example: {
        success: true,
        message: '2024_HY_7 선수의 스탯을 조회했습니다.',
        data: {
          playerInfo: {
            playerId: '2024_HY_7',
            username: 'kim_chulsu',
            teamName: '한양대 라이온스',
            position: 'QB',
          },
          gameStats: [
            {
              gameKey: 'HYKU241115',
              date: '2024-11-15',
              opponent: '고려대 타이거스',
              stats: { passingYards: 245, passingTouchdowns: 2 },
            },
          ],
          seasonStats: {
            '2024': {
              gamesPlayed: 8,
              stats: { passingYards: 1856, passingTouchdowns: 12 },
            },
          },
          totalStats: {
            totalGamesPlayed: 8,
            stats: { passingYards: 1856, passingTouchdowns: 12 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '❌ 인증 실패',
    schema: {
      example: {
        success: false,
        message: '로그인이 필요합니다.',
        code: 'UNAUTHORIZED',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '❌ PlayerId 미배정',
    schema: {
      example: {
        success: false,
        message: 'playerId가 배정되지 않았습니다. 관리자에게 문의하세요.',
        code: 'PLAYER_ID_NOT_ASSIGNED',
      },
    },
  })
  async getMyStats(
    @User() user: any,
    @Query('playerId') queryPlayerId?: string,
  ) {
    // Admin은 쿼리 파라미터로 특정 선수 조회 가능
    if (user.role === 'admin' && queryPlayerId) {
      console.log(`Admin이 ${queryPlayerId} 선수 스탯 조회`);
      const adminUser = { ...user, playerId: queryPlayerId };
      const stats = await this.playerService.getPlayerStats(adminUser);
      return {
        ...stats,
        accessLevel: 'admin',
        queriedPlayerId: queryPlayerId,
      };
    }

    // 일반 사용자는 자기 스탯만 조회
    return await this.playerService.getPlayerStats(user);
  }
}
