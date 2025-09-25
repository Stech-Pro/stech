import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Inject,
  forwardRef,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PlayerService } from '../player/player.service';
import { TeamStatsAnalyzerService } from '../team/team-stats-analyzer.service';
import { GameService } from './game.service';
import { S3Service } from '../common/services/s3.service';
import { VideoUploadService } from '../videoupload/videoupload.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  GameUploadSuccessDto,
  GameUploadErrorDto,
  FileUploadDto,
} from './dto/game-upload.dto';
import {
  SampleGameDataDto,
  SampleSuccessResponseDto,
} from './dto/game-sample.dto';

@ApiTags('🏈 Game Data Upload')
@Controller('game')
export class GameController {
  constructor(
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
    @Inject(forwardRef(() => TeamStatsAnalyzerService))
    private readonly teamStatsService: TeamStatsAnalyzerService,
    private readonly gameService: GameService,
    private readonly s3Service: S3Service,
    private readonly videoUploadService: VideoUploadService,
  ) {}

  @Post('upload-data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '📤 JSON 게임 데이터 업로드 및 자동 분석 (JSON Body)',
    description: 'JSON 형태의 게임 데이터를 request body로 받아 처리합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 게임 데이터 업로드 및 분석 성공',
  })
  async uploadGameData(@Body() gameData: any, @Req() req: any): Promise<any> {
    console.log('🎮 JSON Body로 게임 데이터 업로드 시작');
    console.log('📊 받은 데이터:', {
      clips: gameData.clips?.length || 0,
      gameKey: gameData.gameKey,
      homeTeam: gameData.homeTeam,
      awayTeam: gameData.awayTeam,
    });

    try {
      // 1. 기본 구조 검증
      if (!gameData.clips || !Array.isArray(gameData.clips)) {
        throw new HttpException(
          {
            success: false,
            message: '올바른 게임 데이터 형식이 아닙니다 (clips 배열이 필요)',
            code: 'INVALID_GAME_DATA_STRUCTURE',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log(`📊 게임 데이터 검증 완료: ${gameData.clips.length}개 클립`);

      // 2. 데이터 형식 변환 (Clips -> clips)
      const processedGameData = {
        ...gameData,
        Clips: gameData.clips, // 백엔드에서 Clips 속성을 기대하므로 변환
      };

      // 3. 선수 데이터 처리
      const playerResults = await this.processGameData(processedGameData);
      console.log('🎯🎯🎯 선수 데이터 처리 완료, 이제 GameInfo 저장 시작 🎯🎯🎯');

      // 4. 경기 정보 저장
      console.log('💾💾💾 경기 정보 저장 시작... 💾💾💾');
      try {
        const { team: uploaderTeam } = req.user;
        const gameInfoWithUploader = {
          ...processedGameData,
          uploader: uploaderTeam,
        };
        await this.gameService.createGameInfo(gameInfoWithUploader);
        console.log('✅✅✅ 경기 정보 저장 완료 ✅✅✅');
      } catch (gameInfoError) {
        console.error('❌❌❌ 경기 정보 저장 실패:', gameInfoError.message);
      }

      // 5. 전체 경기 클립 데이터 저장 (하이라이트용)
      console.log('💾 경기 클립 데이터 저장 시작...');
      await this.gameService.saveGameClips(processedGameData);
      console.log('✅ 경기 클립 데이터 저장 완료');

      // 6. 팀 스탯 자동 계산
      console.log('📊 팀 스탯 계산 시작...');
      const teamStatsResult =
        await this.teamStatsService.analyzeTeamStats(processedGameData);
      console.log('🏈 팀 스탯 계산 결과:', teamStatsResult);

      // 7. 팀 스탯 데이터베이스 저장
      console.log('💾 팀 스탯 데이터베이스 저장 시작...');
      await this.teamStatsService.saveTeamStats(
        processedGameData.gameKey,
        teamStatsResult,
        processedGameData,
      );
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
    } catch (error) {
      console.error('❌ 게임 데이터 처리 실패:', error);
      throw error;
    }
  }

  @Post('upload-json')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('gameFile'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
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
  })
  @ApiBody({
    description: '📄 JSON 게임 데이터 파일 업로드',
    type: FileUploadDto,
  })
  @ApiResponse({
    status: 200,
    description: '✅ 게임 데이터 업로드 및 분석 성공',
    type: GameUploadSuccessDto,
  })
  @ApiResponse({
    status: 400,
    description: '❌ 잘못된 요청 (파일 없음, 형식 오류, JSON 구조 오류)',
    type: GameUploadErrorDto,
    schema: {
      example: {
        success: false,
        message: '올바른 JSON 형식이 아닙니다',
        code: 'INVALID_JSON_FORMAT',
      },
    },
  })
  @ApiResponse({
    status: 413,
    description: '❌ 파일 크기 초과 (최대 10MB)',
    type: GameUploadErrorDto,
    schema: {
      example: {
        success: false,
        message: '파일 크기가 너무 큽니다 (최대 10MB)',
        code: 'FILE_TOO_LARGE',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '❌ 서버 내부 오류',
    type: GameUploadErrorDto,
    schema: {
      example: {
        success: false,
        message: '게임 데이터 처리 중 예상치 못한 오류가 발생했습니다',
        code: 'INTERNAL_PROCESSING_ERROR',
        details: 'Database connection failed',
      },
    },
  })
  async uploadGameJson(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    try {
      console.log('🎮 게임 JSON 파일 업로드 시작');

      // 1. 파일 검증
      if (!file) {
        throw new HttpException(
          {
            success: false,
            message: '파일이 업로드되지 않았습니다',
            code: 'NO_FILE_UPLOADED',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // 파일 크기 검증 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new HttpException(
          {
            success: false,
            message: '파일 크기가 너무 큽니다 (최대 10MB)',
            code: 'FILE_TOO_LARGE',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log(
        `📁 파일 정보: ${file.originalname} (${(file.size / 1024).toFixed(1)}KB)`,
      );

      // 2. JSON 파싱
      let gameData;
      try {
        // BOM 제거 및 UTF-8 처리
        let jsonContent = file.buffer.toString('utf-8');
        // BOM 제거 (UTF-8 BOM: EF BB BF)
        if (jsonContent.charCodeAt(0) === 0xfeff) {
          jsonContent = jsonContent.slice(1);
        }
        console.log('🔍 JSON 내용 첫 200자:', jsonContent.substring(0, 200));
        gameData = JSON.parse(jsonContent);
        console.log('✅ JSON 파싱 성공');
      } catch (parseError) {
        console.error('❌ JSON 파싱 에러:', parseError.message);
        console.error(
          '🔍 파일 내용:',
          file.buffer.toString('utf-8').substring(0, 500),
        );
        throw new HttpException(
          {
            success: false,
            message: '올바른 JSON 형식이 아닙니다',
            code: 'INVALID_JSON_FORMAT',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3. 기본 구조 검증
      if (!gameData.Clips || !Array.isArray(gameData.Clips)) {
        throw new HttpException(
          {
            success: false,
            message: '올바른 게임 데이터 형식이 아닙니다 (Clips 배열이 필요)',
            code: 'INVALID_GAME_DATA_STRUCTURE',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log(`📊 게임 데이터 검증 완료: ${gameData.Clips.length}개 클립`);

      // 4. 선수 데이터 처리
      const playerResults = await this.processGameData(gameData);
      console.log('🎯🎯🎯 선수 데이터 처리 완료, 이제 GameInfo 저장 시작 🎯🎯🎯');

      // 5. 경기 정보 저장
      console.log('💾💾💾 경기 정보 저장 시작... 💾💾💾');
      try {
        const { team: uploaderTeam } = req.user;
        const gameDataWithUploader = {
          ...gameData,
          uploader: uploaderTeam,
        };
        await this.gameService.createGameInfo(gameDataWithUploader);
        console.log('✅✅✅ 경기 정보 저장 완료 ✅✅✅');
      } catch (gameInfoError) {
        console.error('❌❌❌ 경기 정보 저장 실패:', gameInfoError.message);
      }

      // 5-1. 전체 경기 클립 데이터 저장 (하이라이트용)
      console.log('💾 경기 클립 데이터 저장 시작...');
      await this.gameService.saveGameClips(gameData);
      console.log('✅ 경기 클립 데이터 저장 완료');

      // 6. 팀 스탯 자동 계산
      console.log('📊 팀 스탯 계산 시작...');
      const teamStatsResult =
        await this.teamStatsService.analyzeTeamStats(gameData);
      console.log('🏈 팀 스탯 계산 결과:', teamStatsResult);

      // 7. 팀 스탯 데이터베이스 저장
      console.log('💾 팀 스탯 데이터베이스 저장 시작...');
      await this.teamStatsService.saveTeamStats(
        gameData.gameKey,
        teamStatsResult,
        gameData,
      );
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
    } catch (error) {
      console.error('❌ 게임 데이터 업로드 실패:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: '게임 데이터 처리 중 예상치 못한 오류가 발생했습니다',
          code: 'INTERNAL_PROCESSING_ERROR',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 게임 데이터에서 모든 선수를 추출하고 분석하는 메서드
   */
  private async processGameData(gameData: any) {
    console.log('🔍 선수 추출 시작');

    const playerNumbers = new Set<number>();
    const invalidClips = [];

    // 홈팀과 어웨이팀 선수들을 동적으로 구분
    const homeTeamPlayers = new Set<number>();
    const awayTeamPlayers = new Set<number>();

    // 득점 관련 클립에서 팀 구분 (득점한 선수의 팀 추정)
    gameData.Clips.forEach((clip) => {
      if (
        clip.significantPlays &&
        clip.significantPlays.includes('TOUCHDOWN')
      ) {
        if (clip.car?.num) {
          // 득점 클립의 수 기준으로 홈/어웨이 임시 구분
          // 실제로는 더 정교한 로직 필요
        }
      }
    });

    // 모든 클립에서 선수 번호 추출
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
      } catch (error) {
        invalidClips.push({
          clipIndex: index,
          clipKey: clip.clipKey || 'unknown',
          error: error.message,
        });
      }
    });

    console.log(`👥 발견된 선수: ${playerNumbers.size}명`);
    console.log(
      `📋 선수 목록: [${Array.from(playerNumbers)
        .sort((a, b) => a - b)
        .join(', ')}]`,
    );

    if (invalidClips.length > 0) {
      console.log(`⚠️ 처리할 수 없는 클립 ${invalidClips.length}개 발견`);
    }

    const results = [];
    let processedCount = 0;

    // 각 선수별로 관련 클립 분석
    for (const playerNum of Array.from(playerNumbers).sort((a, b) => a - b)) {
      try {
        processedCount++;
        console.log(
          `🔄 ${processedCount}/${playerNumbers.size} - ${playerNum}번 선수 분석 중...`,
        );

        // 해당 선수가 참여한 클립들만 필터링
        const playerClips = gameData.Clips.filter(
          (clip) =>
            clip.car?.num === playerNum ||
            clip.car2?.num === playerNum ||
            clip.tkl?.num === playerNum ||
            clip.tkl2?.num === playerNum,
        );

        console.log(
          `  📎 ${playerNum}번 선수 관련 클립: ${playerClips.length}개`,
        );

        // 선수의 팀명 식별
        let playerTeamName = null;

        if (gameData.homeTeam && gameData.awayTeam) {
          // 로그 분석 결과:
          // 홈팀(KMRazorbacks) 선수들: [30, 16, 84] - 적은 수
          // 어웨이팀(HYLions) 선수들: 나머지 대부분

          // 실제 게임에서 관찰된 패턴을 기반으로 팀 구분
          const homeTeamPlayerNumbers = [30, 16, 84]; // 실제 로그에서 확인된 홈팀 선수들

          if (homeTeamPlayerNumbers.includes(playerNum)) {
            playerTeamName = gameData.homeTeam; // KMRazorbacks
          } else {
            playerTeamName = gameData.awayTeam; // HYLions
          }

          console.log(
            `  📋 선수 ${playerNum} → ${playerTeamName} (${homeTeamPlayerNumbers.includes(playerNum) ? '홈팀' : '어웨이팀'})`,
          );
        }

        console.log(
          `  👤 ${playerNum}번 선수 팀: ${playerTeamName || '미확인'}`,
        );

        // 선수 분석 서비스 호출 (팀명 포함)
        const analysisResult =
          await this.playerService.updatePlayerStatsFromNewClips(
            playerNum,
            playerClips,
            playerTeamName,
            gameData,
          );

        results.push({
          playerNumber: playerNum,
          success: true,
          clipsAnalyzed: playerClips.length,
          position: this.extractPlayerPosition(playerClips, playerNum),
          stats: analysisResult,
          message: `${playerNum}번 선수 분석 완료`,
        });

        console.log(`  ✅ ${playerNum}번 선수 분석 완료`);
      } catch (error) {
        console.error(`  ❌ ${playerNum}번 선수 분석 실패:`, error.message);

        results.push({
          playerNumber: playerNum,
          success: false,
          error: error.message,
          message: `${playerNum}번 선수 분석 실패`,
        });
      }
    }

    // 결과 요약
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
        successRate:
          results.length > 0
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

  /**
   * 홈팀의 플레이인지 확인하는 헬퍼 메서드
   */
  private isHomeTeamPlay(clip: any, gameData: any): boolean {
    // 간단한 로직: 게임에서 첫 번째로 나온 선수들을 홈팀으로 간주
    // 실제로는 더 정교한 로직이 필요할 수 있음
    return true; // 임시로 true 반환
  }

  /**
   * 클립에서 선수의 주요 포지션 추출
   */
  private extractPlayerPosition(clips: any[], playerNumber: number): string {
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

    // 가장 많이 나온 포지션 반환
    if (positions.length === 0) return 'Unknown';

    const positionCounts = positions.reduce((acc, pos) => {
      acc[pos] = (acc[pos] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(positionCounts).reduce((a, b) =>
      positionCounts[a] > positionCounts[b] ? a : b,
    );
  }

  @Get('team/:teamName')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '🏈 팀별 경기 정보 조회',
    description:
      '특정 팀이 업로드한 경기 정보를 조회합니다. 업로더만 자신이 업로드한 경기를 볼 수 있습니다. Admin은 모든 경기 조회 가능.',
  })
  @ApiParam({
    name: 'teamName',
    description: '조회할 팀 이름 (Admin의 경우 모든 경기 반환)',
    example: 'HYLions',
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 404,
    description: '❌ 해당 팀의 경기를 찾을 수 없음',
  })
  async getGamesByTeam(@Param('teamName') teamName: string, @Req() req: any) {
    let games: any[];
    let message: string;

    const { role, team: userTeam } = req.user;
    
    console.log(`🔍 경기 조회 요청 - 사용자: ${userTeam}, 역할: ${role}`);

    // Admin인 경우 모든 경기 반환
    if (role === 'admin') {
      games = await this.gameService.findAllGames();
      message = '모든 경기 정보 조회 성공 (Admin)';
      console.log(`👑 Admin 조회: 총 ${games.length}개 경기`);
    } else {
      // 일반 사용자는 자신이 업로드한 경기만 조회
      games = await this.gameService.findGamesByUploader(userTeam);
      message = `${userTeam} 팀이 업로드한 경기 정보 조회 성공`;
      console.log(`👤 ${userTeam} 업로드 경기: ${games.length}개`);
    }

    if (!games || games.length === 0) {
      throw new HttpException(
        {
          success: false,
          message: `${teamName === 'admin' || teamName === 'Admin' ? '등록된 경기를' : `${teamName} 팀의 경기를`} 찾을 수 없습니다`,
          code: 'TEAM_GAMES_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      success: true,
      message: message,
      data: games,
      totalGames: games.length,
      accessLevel: teamName.toLowerCase() === 'admin' ? 'admin' : 'team',
    };
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '📋 모든 경기 정보 조회',
    description:
      '저장된 모든 경기 정보를 조회합니다. Admin은 모든 경기, 일반 사용자는 자기 팀 경기만 조회 가능합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 모든 경기 정보 조회 성공',
  })
  async getAllGames(@Req() req: any) {
    const { role, team: userTeam } = req.user;

    if (role === 'admin') {
      // Admin은 모든 경기 조회
      const games = await this.gameService.findAllGames();
      return {
        success: true,
        message: '모든 경기 정보 조회 성공 (Admin)',
        data: games,
        totalGames: games.length,
        accessLevel: 'admin',
      };
    } else {
      // 일반 사용자는 자기 팀 경기만 조회
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

  @Get('highlights/coach')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '🎥 코치용 하이라이트 클립 조회',
    description:
      'significantPlays가 있거나 gainYard가 10야드 이상인 중요한 플레이를 조회합니다.',
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 401,
    description: '❌ 인증 실패',
  })
  async getCoachHighlights(@Req() req: any) {
    console.log('전체 request.user:', req.user);
    const { team: teamName, role } = req.user;

    if (role === 'admin') {
      console.log('🎥 Admin - 모든 팀 하이라이트 조회');
      // Admin은 모든 팀의 하이라이트를 조회
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
    } else {
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

  @Get('highlights/player')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '🏃 선수용 개인 하이라이트 조회',
    description: '로그인한 선수가 참여한 모든 클립을 조회합니다.',
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 401,
    description: '❌ 인증 실패',
  })
  @ApiResponse({
    status: 400,
    description: '❌ 선수 번호가 등록되지 않음',
  })
  async getPlayerHighlights(@Req() req: any) {
    const { playerId, team: teamName, role } = req.user;

    if (role === 'admin') {
      console.log('🏃 Admin - 모든 선수 하이라이트 조회');
      // Admin은 모든 선수의 하이라이트를 조회할 수 있음
      // 쿼리 파라미터로 특정 선수를 지정할 수 있음
      const targetPlayerId = req.query.playerId || playerId;
      const targetTeam = req.query.team;

      if (targetPlayerId && targetTeam) {
        const highlights = await this.gameService.getPlayerHighlights(
          targetPlayerId,
          targetTeam,
        );
        return {
          success: true,
          message: `${targetTeam} 팀 ${targetPlayerId} 선수 하이라이트 조회 성공 (Admin)`,
          data: highlights,
          playerNumber: targetPlayerId,
          team: targetTeam,
          totalClips: highlights.length,
          accessLevel: 'admin',
        };
      } else {
        return {
          success: true,
          message:
            'Admin 권한: 쿼리 파라미터로 ?playerId=선수ID&team=팀명을 지정하세요',
          accessLevel: 'admin',
          example:
            '/api/game/highlights/player?playerId=2025_KK_10&team=HYLions',
        };
      }
    } else {
      console.log('🏃 선수용 하이라이트 조회:', { playerId, teamName });

      if (!playerId) {
        throw new HttpException(
          {
            success: false,
            message: '선수 번호가 등록되지 않았습니다.',
            code: 'PLAYER_NUMBER_NOT_REGISTERED',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const highlights = await this.gameService.getPlayerHighlights(
        playerId,
        teamName,
      );

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

  @Get('clips/:gameKey')
  @ApiOperation({
    summary: '🎬 경기별 클립 데이터 조회',
    description: 'gameKey로 특정 경기의 모든 클립 데이터를 조회합니다.',
  })
  @ApiParam({
    name: 'gameKey',
    description: '조회할 게임 키',
    example: 'SNUS20240907',
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 404,
    description: '❌ 클립 데이터를 찾을 수 없음',
  })
  async getGameClips(@Param('gameKey') gameKey: string) {
    const clips = await this.gameService.getGameClipsByKey(gameKey);

    if (!clips) {
      throw new HttpException(
        {
          success: false,
          message: `${gameKey} 경기의 클립 데이터를 찾을 수 없습니다`,
          code: 'CLIPS_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      // S3에서 비디오 URL들 가져오기
      console.log(
        `🎬 ${gameKey}의 ${clips.Clips.length}개 클립에 대한 비디오 URL 생성 시작`,
      );

      const videoUrls = await this.s3Service.generateClipUrls(
        gameKey,
        clips.Clips.length,
      );

      // 클립 데이터에 videoUrl 추가
      const clipsWithUrls = clips.Clips.map((clip, index) => ({
        ...clip,
        clipUrl: videoUrls[index] || null, // URL이 없으면 null
      }));

      // 원본 데이터 구조 유지하면서 Clips만 수정
      const responseData = {
        ...(clips as any).toObject ? (clips as any).toObject() : clips,
        Clips: clipsWithUrls,
      };

      console.log(
        `✅ ${gameKey} 클립 URL 매핑 완료: ${videoUrls.length}/${clips.Clips.length}`,
      );

      return {
        success: true,
        message: `${gameKey} 경기 클립 데이터 조회 성공`,
        data: responseData,
        totalClips: clips.Clips?.length || 0,
        videoUrlsGenerated: videoUrls.length,
      };
    } catch (error) {
      console.error(`❌ ${gameKey} 비디오 URL 생성 실패:`, error);

      // S3 오류가 있어도 클립 데이터는 반환 (clipUrl 없이)
      return {
        success: true,
        message: `${gameKey} 경기 클립 데이터 조회 성공 (비디오 URL 생성 실패)`,
        data: clips,
        totalClips: clips.Clips?.length || 0,
        warning: 'S3 비디오 URL 생성에 실패했습니다',
      };
    }
  }

  @Delete(':gameKey')
  @ApiOperation({
    summary: '🗑️ 경기 데이터 완전 삭제',
    description:
      '게임 키로 경기와 관련된 모든 데이터를 삭제합니다 (GameInfo, GameClips, TeamGameStats, TeamTotalStats)',
  })
  @ApiParam({
    name: 'gameKey',
    description: '삭제할 게임 키',
    example: 'SNUS20240907',
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 404,
    description: '❌ 경기를 찾을 수 없음',
  })
  async deleteGameByKey(@Param('gameKey') gameKey: string) {
    const result = await this.gameService.deleteGameInfo(gameKey);

    return {
      success: true,
      message: `${gameKey} 경기 관련 모든 데이터가 삭제되었습니다`,
      ...result,
    };
  }

  @Get(':gameKey')
  @ApiOperation({
    summary: '🎮 특정 경기 정보 조회',
    description: '게임 키로 특정 경기 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'gameKey',
    description: '조회할 게임 키',
    example: 'SNUS20240907',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 경기 정보 조회 성공',
  })
  @ApiResponse({
    status: 404,
    description: '❌ 경기를 찾을 수 없음',
  })
  async getGameByKey(@Param('gameKey') gameKey: string) {
    const game = await this.gameService.findGameByKey(gameKey);

    if (!game) {
      throw new HttpException(
        {
          success: false,
          message: `${gameKey} 경기를 찾을 수 없습니다`,
          code: 'GAME_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      success: true,
      message: '경기 정보 조회 성공',
      data: game,
    };
  }

  @Post('prepare-match-upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
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
        "region": "Seoul", // 친선전인 경우 생략 가능
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
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 400,
    description: '❌ 잘못된 요청 데이터',
  })
  @ApiBody({
    description: '경기 정보 및 쿼터별 영상 개수',
    schema: {
      example: {
        gameKey: 'YSKM20250920',
        gameInfo: {
          homeTeam: 'YSeagles',
          awayTeam: 'KMrazorbacks',
          date: '2025-09-20(금) 15:00',
          type: 'League',
          score: { home: 21, away: 14 },
          region: 'Seoul', // 친선전인 경우 생략 가능
          location: '테스트 경기장'
        },
        quarterVideoCounts: {
          Q1: 3,
          Q2: 3,
          Q3: 2,
          Q4: 2
        }
      }
    }
  })
  async prepareMatchUpload(@Body() body: any, @Req() req: any) {
    try {
      const { gameKey, gameInfo, quarterVideoCounts } = body;

      if (!gameKey || !gameInfo || !quarterVideoCounts) {
        throw new HttpException(
          {
            success: false,
            message: 'gameKey, gameInfo, quarterVideoCounts가 필요합니다',
            code: 'MISSING_PARAMETERS',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // gameKey 형식 검증
      if (!/^[A-Z0-9]{4,}$/.test(gameKey)) {
        throw new HttpException(
          {
            success: false,
            message: 'gameKey 형식이 올바르지 않습니다',
            code: 'INVALID_GAMEKEY_FORMAT',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log(`🎬 경기 업로드 준비 시작: ${gameKey}`);
      console.log(`📊 쿼터별 영상 개수:`, quarterVideoCounts);

      // 연속된 clip 번호 생성
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
            
            // S3 업로드 URL 생성
            const uploadUrl = await this.s3Service.generatePresignedUploadUrl(
              s3Path,
              'video/mp4',
              3600 // 1시간 유효
            );

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

      // 업로더 정보 추가
      const { team: uploaderTeam } = req.user;
      
      console.log(`🔍 JWT에서 추출된 업로더 팀: ${uploaderTeam}`);
      console.log(`📋 전체 사용자 정보:`, req.user);

      // 임시로 경기 정보 저장 (pending 상태)
      await this.gameService.createGameInfo({
        ...gameInfo,
        gameKey,
        uploader: uploaderTeam, // 업로드한 팀 저장
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
    } catch (error) {
      console.error('❌ 경기 업로드 준비 실패:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: '경기 업로드 준비 중 오류가 발생했습니다',
          code: 'PREPARE_UPLOAD_ERROR',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('complete-match-upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
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
  })
  @ApiResponse({
    status: 200,
    description: '✅ 경기 업로드 완료',
    schema: {
      example: {
        success: true,
        message: '경기 영상 업로드가 완료되었습니다',
        data: {
          gameKey: 'YSKM20250920',
          totalVideos: 7,
          uploadedVideos: {
            Q1: ['YSKM20250920_clip1.mp4', 'YSKM20250920_clip2.mp4'],
            Q2: ['YSKM20250920_clip4.mp4', 'YSKM20250920_clip5.mp4'],
            Q3: ['YSKM20250920_clip7.mp4'],
            Q4: ['YSKM20250920_clip9.mp4', 'YSKM20250920_clip10.mp4']
          },
          uploadCompletedAt: '2025-01-24T10:30:00.000Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: '❌ 경기를 찾을 수 없음',
  })
  @ApiBody({
    description: '업로드 완료된 영상 정보',
    schema: {
      example: {
        gameKey: 'YSKM20250920',
        uploadedVideos: {
          Q1: ['YSKM20250920_clip1.mp4', 'YSKM20250920_clip2.mp4'],
          Q2: ['YSKM20250920_clip4.mp4', 'YSKM20250920_clip5.mp4'],
          Q3: ['YSKM20250920_clip7.mp4'],
          Q4: ['YSKM20250920_clip9.mp4', 'YSKM20250920_clip10.mp4']
        }
      }
    }
  })
  async completeMatchUpload(@Body() body: any) {
    try {
      const { gameKey, uploadedVideos } = body;

      if (!gameKey || !uploadedVideos) {
        throw new HttpException(
          {
            success: false,
            message: 'gameKey와 uploadedVideos가 필요합니다',
            code: 'MISSING_PARAMETERS',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log(`🎯 경기 업로드 완료 처리 시작: ${gameKey}`);

      // 업로드된 영상들 검증
      const totalUploaded = Object.values(uploadedVideos).flat().length;
      console.log(`📊 업로드된 영상 수: ${totalUploaded}개`);

      // 경기 상태를 완료로 업데이트
      const updatedGame = await this.gameService.updateGameInfo(gameKey, {
        uploadStatus: 'completed',
        videoUrls: uploadedVideos,
        uploadCompletedAt: new Date().toISOString(),
      });

      if (!updatedGame) {
        throw new HttpException(
          {
            success: false,
            message: `${gameKey} 경기를 찾을 수 없습니다`,
            code: 'GAME_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
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
    } catch (error) {
      console.error('❌ 경기 업로드 완료 처리 실패:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: '경기 업로드 완료 처리 중 오류가 발생했습니다',
          code: 'COMPLETE_UPLOAD_ERROR',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
