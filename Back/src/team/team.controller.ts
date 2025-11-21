import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
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
import { TeamService } from './team.service';
import { TeamStatsAnalyzerService } from './team-stats-analyzer.service';
import { GameService } from '../game/game.service';
import { S3Service } from '../common/services/s3.service';
import { CreateTeamDto, UpdateTeamDto } from '../common/dto/team.dto';
import { TeamStatsSuccessDto, TeamStatsErrorDto } from './dto/team-stats.dto';
import { TeamRankingResponseDto } from './dto/team-season-stats.dto';
import {
  GameAnalysisRequestDto,
  GameAnalysisResponseDto,
} from './dto/game-analysis.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';

@ApiTags('Team')
@Controller('team')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly teamStatsService: TeamStatsAnalyzerService,
    private readonly gameService: GameService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '팀 생성' })
  @ApiResponse({ status: 201, description: '팀 생성 성공' })
  async createTeam(@Body() createTeamDto: CreateTeamDto, @User() user: any) {
    return this.teamService.createTeam(createTeamDto, user._id);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 팀 목록 조회' })
  @ApiResponse({ status: 200, description: '내 팀 목록 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async getMyTeams(@User() user: any) {
    return this.teamService.getMyTeams(user._id);
  }

  @Get('all')
  @ApiOperation({
    summary: '🏈 모든 팀 목록 조회',
    description:
      '시스템에 등록된 모든 팀의 목록을 조회합니다. 팀 ID, 이름, 로고 등의 정보를 포함합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 모든 팀 목록 조회 성공',
    schema: {
      example: {
        success: true,
        message: '모든 팀 목록 조회가 완료되었습니다',
        data: [
          {
            id: 'YSEagles',
            name: '연세대 이글스',
            logo: '/assets/images/svg/teams/Yonsei.png',
            region: 'Seoul',
          },
          {
            id: 'SNGreenTerrors',
            name: '서울대 그린테러스',
            logo: '/assets/images/svg/teams/SNU.png',
            region: 'Seoul',
          },
        ],
        timestamp: '2024-12-26T10:30:00.000Z',
      },
    },
  })
  async getAllTeams() {
    // TODO: TeamService에 getAllTeams 메서드 구현 필요
    return { success: true, message: 'getAllTeams 메서드 구현 필요', data: [] };
  }

  @Get('total-stats')
  // @UseGuards(JwtAuthGuard)  // 팀 스탯은 공개 정보로 변경
  // @ApiBearerAuth()
  @ApiOperation({
    summary: '🏆 팀 누적 스탯 순위 조회',
    description:
      '모든 팀의 누적 스탯을 totalYards 기준으로 정렬하여 조회합니다. league 파라미터로 1부/2부 필터링 가능합니다.',
  })
  @ApiQuery({
    name: 'league',
    required: false,
    description: '리그 구분 (1부 또는 2부)',
    enum: ['1부', '2부'],
  })
  @ApiResponse({
    status: 200,
    description: '✅ 팀 누적 스탯 조회 성공',
  })
  async getAllTeamTotalStats(
    @User() user: any = null,
    @Query('league') league?: string,
  ) {
    try {
      const role = user?.role || 'guest';

      if (role === 'admin') {
        // Admin은 모든 팀 스탯 조회 (리그 필터링 지원)
        const teamStats =
          await this.teamStatsService.getAllTeamTotalStats(league);

        if (!teamStats || teamStats.length === 0) {
          return {
            success: false,
            message: league
              ? `${league} 팀 누적 스탯을 찾을 수 없습니다`
              : '팀 누적 스탯을 찾을 수 없습니다',
            data: [],
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          message: league
            ? `${league} 팀 누적 스탯 조회가 완료되었습니다 (Admin)`
            : '모든 팀 누적 스탯 조회가 완료되었습니다 (Admin)',
          data: teamStats,
          accessLevel: 'admin',
          league: league || 'all',
          timestamp: new Date().toISOString(),
        };
      } else {
        // 일반 사용자도 모든 팀 스탯 조회 가능 (리그 순위표는 공개 정보)
        const teamStats =
          await this.teamStatsService.getAllTeamTotalStats(league);

        return {
          success: true,
          message: league
            ? `${league} 팀 누적 스탯 조회가 완료되었습니다`
            : '팀 누적 스탯 조회가 완료되었습니다',
          data: teamStats,
          accessLevel: 'public',
          league: league || 'all',
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '팀 누적 스탯 조회 중 오류가 발생했습니다',
        data: [],
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get(':teamId')
  @ApiOperation({ summary: '팀 조회' })
  @ApiResponse({ status: 200, description: '팀 조회 성공' })
  @ApiResponse({ status: 404, description: '팀을 찾을 수 없음' })
  async getTeam(@Param('teamId') teamId: string) {
    return this.teamService.getTeam(teamId);
  }

  @Put(':teamId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '팀 정보 수정' })
  @ApiResponse({ status: 200, description: '팀 정보 수정 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '팀을 찾을 수 없음' })
  async updateTeam(
    @Param('teamId') teamId: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @User() user: any,
  ) {
    return this.teamService.updateTeam(teamId, updateTeamDto, user._id);
  }

  @Delete(':teamId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '팀 삭제' })
  @ApiResponse({ status: 200, description: '팀 삭제 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '팀을 찾을 수 없음' })
  async deleteTeam(@Param('teamId') teamId: string, @User() user: any) {
    return this.teamService.deleteTeam(teamId, user._id);
  }

  @Post('analyze-game-playcall')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🎯 [DEPRECATED] 경기 플레이콜 및 주요 스탯 분석 API',
    description: `
    ## ⚠️ DEPRECATED - /team/stats/{gameKey} API를 사용해주세요
    
    이 API는 더 이상 사용되지 않습니다. 
    팀 스탯 조회 API(/team/stats/{gameKey})에 플레이콜 비율과 3rd down 상세 정보가 추가되었습니다.
    
    ### 📊 경기 플레이콜 분석 API
    
    gameKey로 저장된 경기의 플레이콜 비율과 주요 스탯을 분석합니다.
    
    ### 📈 반환 데이터
    - **플레이콜 비율**: 홈/어웨이팀별 런/패스 비율
    - **총 야드**: 패싱+러싱 야드 합계
    - **패싱 야드**: 완성된 패스 야드
    - **러싱 야드**: 러싱 야드
    - **3rd down 성공률**: 3다운에서 1st down 획득 비율
    - **턴오버**: 인터셉트 + 펌블 로스트
    - **페널티 야드**: 총 페널티 야드
    `,
    deprecated: true,
  })
  @ApiResponse({
    status: 200,
    description: '✅ 경기 분석 성공',
    type: GameAnalysisResponseDto,
  })
  async analyzeGame(@Body() body: GameAnalysisRequestDto) {
    try {
      console.log('받은 요청 body:', body);

      if (!body || !body.gameKey) {
        return {
          success: false,
          message: 'gameKey가 필요합니다',
          timestamp: new Date().toISOString(),
        };
      }

      // 먼저 모든 gameKey 조회해서 확인
      const allGames = await this.gameService.findAllGames();
      console.log(
        '저장된 모든 gameKey들:',
        allGames.map((game) => game.gameKey),
      );

      // gameKey로 저장된 경기 데이터 조회
      const clips = await this.gameService.getGameClipsByKey(body.gameKey);
      console.log('조회된 gameData:', clips ? '있음' : '없음');

      if (!clips) {
        return {
          success: false,
          message: `${body.gameKey}에 해당하는 경기 데이터를 찾을 수 없습니다. 저장된 gameKey들: ${allGames.map((g) => g.gameKey).join(', ')}`,
          timestamp: new Date().toISOString(),
        };
      }

      // S3에서 비디오 URL들 가져오기
      console.log(
        `🎬 ${body.gameKey}의 ${clips.Clips.length}개 클립에 대한 비디오 URL 생성 시작`,
      );

      const videoUrls = await this.s3Service.generateClipUrls(
        body.gameKey,
        clips.Clips.length,
      );

      // 클립 데이터에 videoUrl 추가
      const clipsWithUrls = clips.Clips.map((clip, index) => ({
        ...clip,
        clipUrl: videoUrls[index] || null, // URL이 없으면 null
      }));

      // 원본 데이터 구조 유지하면서 Clips만 수정
      const gameData = {
        ...(clips as any).toObject(),
        Clips: clipsWithUrls,
      };

      console.log(
        `✅ ${body.gameKey} 클립 URL 매핑 완료: ${videoUrls.length}/${clips.Clips.length}`,
      );

      const result =
        await this.teamStatsService.analyzeGameForDisplay(gameData);

      return {
        success: true,
        message: '경기 분석이 완료되었습니다',
        ...result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: '경기 분석 중 오류가 발생했습니다',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('stats/:gameKey')
  @ApiOperation({
    summary: '🏈 게임별 팀 스탯 조회',
    description: `
    ## 📊 팀 스탯 조회 API
    
    특정 게임의 홈팀/어웨이팀 스탯을 조회합니다.
    
    ### 📈 포함된 스탯
    - **총 야드**: 패싱+러싱+리턴야드 합계
    - **패싱 야드**: 완성된 패스 야드 총합
    - **러싱 야드**: 러싱 야드 (sack 야드 차감)
    - **리턴 야드들**: 인터셉트/펀트/킥오프 리턴 야드
    - **턴오버**: 펌블(디펜스 리커버리) + 인터셉트 + 기타 턴오버
    - **페널티 야드**: 총 페널티 야드 (추후 구현)
    
    ### 🎯 사용 예시
    - 게임키: "DGKM240908"
    - 응답: 홈팀/어웨이팀 각각의 상세 스탯
    `,
  })
  @ApiResponse({
    status: 200,
    description: '✅ 팀 스탯 조회 성공',
    type: TeamStatsSuccessDto,
    schema: {
      example: {
        success: true,
        message: '팀 스탯 조회가 완료되었습니다',
        data: {
          homeTeamStats: {
            teamName: 'DGTuskers',
            totalYards: 425,
            passingYards: 280,
            rushingYards: 145,
            interceptionReturnYards: 0,
            puntReturnYards: 25,
            kickoffReturnYards: 35,
            turnovers: 2,
            penaltyYards: 45,
            sackYards: 15,
          },
          awayTeamStats: {
            teamName: 'KMRazorbacks',
            totalYards: 380,
            passingYards: 220,
            rushingYards: 160,
            interceptionReturnYards: 35,
            puntReturnYards: 15,
            kickoffReturnYards: 25,
            turnovers: 1,
            penaltyYards: 30,
            sackYards: 8,
          },
        },
        timestamp: '2024-12-26T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '❌ 팀 스탯을 찾을 수 없음',
    type: TeamStatsErrorDto,
    schema: {
      example: {
        success: false,
        message: '해당 게임의 팀 스탯을 찾을 수 없습니다',
        code: 'TEAM_STATS_NOT_FOUND',
      },
    },
  })
  async getTeamStatsByGame(@Param('gameKey') gameKey: string) {
    try {
      const teamStatsResult =
        await this.teamStatsService.getTeamStatsByGame(gameKey);

      if (!teamStatsResult) {
        return {
          success: false,
          message: '해당 게임의 팀 스탯을 찾을 수 없습니다',
          code: 'TEAM_STATS_NOT_FOUND',
        };
      }

      return {
        success: true,
        message: '팀 스탯 조회가 완료되었습니다',
        data: teamStatsResult,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: '팀 스탯 조회 중 오류가 발생했습니다',
        code: 'TEAM_STATS_ERROR',
      };
    }
  }

  /* 시즌별 스탯 제거로 임시 비활성화
  @Get('season-stats/:season')
  @ApiOperation({
    summary: '🏆 팀 시즌 스탯 순위 조회',
    description: `
    ## 📊 팀 시즌 스탯 순위 API
    
    시즌별 모든 팀의 종합 스탯을 조회합니다.
    
    ### 📈 포함된 스탯 카테고리
    
    **1. 득점**
    - 경기당 평균 득점 (총 득점/경기 수)
    - 총 득점 (시즌 기준)
    - 총 터치다운 (시즌 기준)
    - 총 전진야드
    - 경기 당 전진야드
    
    **2. 런**
    - 러싱 시도
    - 러싱 야드
    - 볼 캐리 당 러싱 야드
    - 경기당 러싱 야드
    - 러싱 터치다운
    
    **3. 패스**
    - 패스 성공-패스 시도
    - 패싱 야드
    - 패스 시도 당 패스 야드
    - 경기 당 패싱 야드
    - 패싱 터치다운
    - 인터셉트
    
    **4. 스페셜팀**
    - 총 펀트 야드
    - 평균 펀트 야드
    - 터치백 퍼센티지(펀트)
    - 필드골 성공-총 시도
    - 평균 킥 리턴 야드
    - 평균 펀트 리턴 야드
    
    **5. 기타**
    - 펌블 수-펌블 턴오버 수
    - 경기 당 턴오버 수
    - 턴오버 비율 (우리 팀 - 상대 팀)
    - 총 페널티 수-총 페널티 야드
    - 경기 당 페널티 야드
    `,
  })
  @ApiResponse({
    status: 200,
    description: '✅ 팀 시즌 스탯 조회 성공',
    type: TeamRankingResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '❌ 해당 시즌 데이터를 찾을 수 없음',
  })
  async getTeamSeasonStats(@Param('season') season: string) {
    try {
      const teamStats =
        await this.teamSeasonStatsService.getAllTeamSeasonStats(season);

      if (!teamStats || teamStats.length === 0) {
        return {
          success: false,
          message: `${season} 시즌의 팀 스탯을 찾을 수 없습니다`,
          data: [],
          timestamp: new Date().toISOString(),
        };
      }

      // 총 득점 기준으로 내림차순 정렬
      teamStats.sort((a, b) => b.totalPoints - a.totalPoints);

      return {
        success: true,
        message: `${season} 시즌 팀 순위 조회가 완료되었습니다`,
        data: teamStats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: '팀 시즌 스탯 조회 중 오류가 발생했습니다',
        data: [],
        timestamp: new Date().toISOString(),
      };
    }
  }
  */

  /* 시즌별 스탯 제거로 임시 비활성화 
  @Get('season-stats/:teamName/:season')
  @ApiOperation({
    summary: '🎯 특정 팀 시즌 스탯 조회',
    description: '특정 팀의 시즌 스탯을 상세하게 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 팀 시즌 스탯 조회 성공',
  })
  @ApiResponse({
    status: 404,
    description: '❌ 해당 팀 또는 시즌 데이터를 찾을 수 없음',
  })
  async getSpecificTeamSeasonStats(
    @Param('teamName') teamName: string,
    @Param('season') season: string,
  ) {
    try {
      const teamStats = await this.teamSeasonStatsService.getTeamSeasonStats(
        teamName,
        season,
      );

      if (!teamStats) {
        return {
          success: false,
          message: `${teamName} 팀의 ${season} 시즌 스탯을 찾을 수 없습니다`,
          data: null,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        message: `${teamName} 팀의 ${season} 시즌 스탯 조회가 완료되었습니다`,
        data: teamStats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: '팀 시즌 스탯 조회 중 오류가 발생했습니다',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }
  */

  /* 시즌별 스탯 제거로 임시 비활성화
  @Post('season-stats/aggregate/:season')
  @ApiOperation({
    summary: '🏆 팀 시즌 스탯 집계',
    description: '선수별 스탯을 팀별로 집계하여 팀 시즌 스탯을 업데이트합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 팀 시즌 스탯 집계 성공',
  })
  async aggregateTeamStats(@Param('season') season: string) {
    try {
      const result = await this.teamStatsAggregatorService.aggregateTeamStats(season);
      return {
        ...result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: '팀 시즌 스탯 집계 중 오류가 발생했습니다',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
  */
}
