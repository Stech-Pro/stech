import { Controller, Get, Post, Query, Param, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { KafaStatsService } from './kafa-stats.service';

@ApiTags('KAFA Stats')
@Controller('kafa-stats')
export class KafaStatsController {
  constructor(private readonly kafaStatsService: KafaStatsService) {}

  // 대학 팀 스탯 조회
  @Get('uni/teams')
  @ApiOperation({
    summary: '🏫 대학 팀 러싱 스탯 조회',
    description: `
    ## 🏫 대학 리그 팀별 러싱 스탯 조회

    KAFA 웹사이트에서 대학 리그 팀들의 러싱 스탯을 실시간으로 가져옵니다.
    
    ### 📋 포함된 정보
    - **순위**: 러싱 야드 기준 순위
    - **팀명**: 대학교 팀명 (예: "한양대학교 LIONS")
    - **러싱 야드**: 총 러싱 야드 (전진/후퇴 구분 포함)
    - **평균**: 어템트당 평균 야드
    - **어템트**: 총 러싱 시도 횟수
    - **터치다운**: 러싱 터치다운 횟수
    - **최장거리**: 최장 러싱 거리
    
    ### 🔍 필터링 옵션
    - year: 특정 연도 조회
    - team: 특정 팀명 필터링
    `,
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: '조회할 연도 (예: 2025)',
    example: '2025',
  })
  @ApiQuery({
    name: 'team',
    required: false,
    description: '특정 팀 필터링 (팀명 일부만 입력 가능)',
    example: '한양대',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 대학 팀 스탯 조회 성공',
    schema: {
      example: {
        success: true,
        message: '대학 팀 스탯을 조회했습니다.',
        data: {
          league: '대학',
          type: '팀 스탯',
          totalCount: 15,
          stats: [
            {
              rank: 1,
              teamName: '경성대학교 Dragons',
              rushYards: '798 (전진 : 850 / 후퇴 : -52)',
              yardsPerAttempt: 5.4,
              attempts: 147,
              touchdowns: 9,
              longest: 48,
            },
          ],
        },
      },
    },
  })
  async getUniversityTeamStats(
    @Query('year') year?: string,
    @Query('team') teamFilter?: string,
  ) {
    let stats = await this.kafaStatsService.getTeamStats('uni', year);

    // 팀 필터링
    if (teamFilter) {
      stats = stats.filter((stat) =>
        stat.teamName.includes(teamFilter) || teamFilter.includes(stat.teamName),
      );
    }

    return {
      success: true,
      message: '대학 팀 스탯을 조회했습니다.',
      data: {
        league: '대학',
        type: '팀 스탯',
        year: year || '2025',
        totalCount: stats.length,
        stats,
      },
    };
  }

  // 대학 개인 선수 스탯 조회
  @Get('uni/players')
  @ApiOperation({
    summary: '🎓 대학 개인 선수 러싱 스탯 조회',
    description: `
    ## 🎓 대학 리그 개인 선수별 러싱 스탯 조회

    KAFA 웹사이트에서 대학 리그 개인 선수들의 러싱 스탯을 실시간으로 가져옵니다.
    
    ### 📋 포함된 정보
    - **순위**: 개인 러싱 야드 기준 순위
    - **선수명**: 선수 실명
    - **소속대학**: 선수가 속한 대학교
    - **등번호**: 선수 등번호
    - **러싱 야드**: 개인 러싱 야드 (전진/후퇴 구분 포함)
    - **평균**: 어템트당 평균 야드
    - **어템트**: 개인 러싱 시도 횟수
    - **터치다운**: 개인 러싱 터치다운 횟수
    - **최장거리**: 개인 최장 러싱 거리
    `,
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: '조회할 연도',
    example: '2025',
  })
  @ApiQuery({
    name: 'team',
    required: false,
    description: '특정 팀 선수들만 조회',
    example: '한양대',
  })
  @ApiQuery({
    name: 'player',
    required: false,
    description: '특정 선수명 검색',
    example: '이효원',
  })
  async getUniversityPlayerStats(
    @Query('year') year?: string,
    @Query('team') teamFilter?: string,
    @Query('player') playerFilter?: string,
  ) {
    let stats = await this.kafaStatsService.getPlayerStats('uni', year);

    // 팀 필터링
    if (teamFilter) {
      stats = stats.filter((stat) =>
        stat.university.includes(teamFilter) || teamFilter.includes(stat.university),
      );
    }

    // 선수 필터링
    if (playerFilter) {
      stats = stats.filter((stat) =>
        stat.playerName.includes(playerFilter) || playerFilter.includes(stat.playerName),
      );
    }

    return {
      success: true,
      message: '대학 개인 선수 스탯을 조회했습니다.',
      data: {
        league: '대학',
        type: '개인 스탯',
        year: year || '2025',
        totalCount: stats.length,
        stats,
      },
    };
  }

  // 사회인 팀 스탯 조회
  @Get('soc/teams')
  @ApiOperation({
    summary: '🏢 사회인 팀 러싱 스탯 조회',
    description: 'KAFA 웹사이트에서 사회인 리그 팀들의 러싱 스탯을 실시간으로 가져옵니다.',
  })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'team', required: false })
  async getSocialTeamStats(
    @Query('year') year?: string,
    @Query('team') teamFilter?: string,
  ) {
    let stats = await this.kafaStatsService.getTeamStats('soc', year);

    if (teamFilter) {
      stats = stats.filter((stat) =>
        stat.teamName.includes(teamFilter) || teamFilter.includes(stat.teamName),
      );
    }

    return {
      success: true,
      message: '사회인 팀 스탯을 조회했습니다.',
      data: {
        league: '사회인',
        type: '팀 스탯',
        year: year || '2025',
        totalCount: stats.length,
        stats,
      },
    };
  }

  // 사회인 개인 선수 스탯 조회
  @Get('soc/players')
  @ApiOperation({
    summary: '👨‍💼 사회인 개인 선수 러싱 스탯 조회',
    description: 'KAFA 웹사이트에서 사회인 리그 개인 선수들의 러싱 스탯을 실시간으로 가져옵니다.',
  })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'team', required: false })
  @ApiQuery({ name: 'player', required: false })
  async getSocialPlayerStats(
    @Query('year') year?: string,
    @Query('team') teamFilter?: string,
    @Query('player') playerFilter?: string,
  ) {
    let stats = await this.kafaStatsService.getPlayerStats('soc', year);

    if (teamFilter) {
      stats = stats.filter((stat) =>
        stat.university.includes(teamFilter) || teamFilter.includes(stat.university),
      );
    }

    if (playerFilter) {
      stats = stats.filter((stat) =>
        stat.playerName.includes(playerFilter) || playerFilter.includes(stat.playerName),
      );
    }

    return {
      success: true,
      message: '사회인 개인 선수 스탯을 조회했습니다.',
      data: {
        league: '사회인',
        type: '개인 스탯',
        year: year || '2025',
        totalCount: stats.length,
        stats,
      },
    };
  }

  // 특정 팀 스탯 조회 (대학/사회인 자동 감지)
  @Get('team/:teamName')
  @ApiOperation({
    summary: '🔍 특정 팀 스탯 조회',
    description: '팀명으로 해당 팀의 스탯을 조회합니다. 대학/사회인 리그를 자동으로 감지합니다.',
  })
  @ApiParam({
    name: 'teamName',
    description: '팀명 (일부만 입력 가능)',
    example: '한양대',
  })
  @ApiQuery({ name: 'year', required: false })
  async getTeamStatsByName(
    @Param('teamName') teamName: string,
    @Query('year') year?: string,
  ) {
    // 대학과 사회인 둘 다 검색
    const [uniTeamStats, socTeamStats] = await Promise.all([
      this.kafaStatsService.getSpecificTeamStats('uni', teamName, year),
      this.kafaStatsService.getSpecificTeamStats('soc', teamName, year),
    ]);

    const result = [];
    if (uniTeamStats) result.push({ ...uniTeamStats, league: '대학' });
    if (socTeamStats) result.push({ ...socTeamStats, league: '사회인' });

    return {
      success: true,
      message: `${teamName} 팀 스탯을 조회했습니다.`,
      data: {
        searchTeam: teamName,
        year: year || '2025',
        totalCount: result.length,
        stats: result,
      },
    };
  }

  // 한양대 전용 엔드포인트 (Ken 팀)
  @Get('hanyang')
  @ApiOperation({
    summary: '🦁 한양대 LIONS 스탯 조회',
    description: '한양대학교 LIONS 팀과 선수들의 스탯을 한번에 조회합니다.',
  })
  @ApiQuery({ name: 'year', required: false })
  async getHanyangStats(@Query('year') year?: string) {
    const [teamStats, playerStats] = await Promise.all([
      this.kafaStatsService.getHanyangTeamStats(year),
      this.kafaStatsService.getHanyangPlayerStats(year),
    ]);

    return {
      success: true,
      message: '한양대학교 LIONS 스탯을 조회했습니다.',
      data: {
        team: '한양대학교 LIONS',
        year: year || '2025',
        teamStats,
        playerStats: {
          totalCount: playerStats.length,
          players: playerStats,
        },
      },
    };
  }

  // 크롤링 실행 및 DB 저장 API
  @Post('crawl-and-save')
  @ApiOperation({
    summary: '🤖 KAFA 스탯 크롤링 및 DB 저장',
    description: `
    ## 🤖 KAFA 통계 크롤링 실행
    
    KAFA 웹사이트에서 선수 스탯을 크롤링하고 DB에 저장합니다.
    
    ### 📋 파라미터
    - **league**: uni(대학) 또는 soc(사회인)
    - **season**: 시즌 연도 (예: 2024, 2025)
    
    ### 🔄 동작 과정
    1. KAFA 사이트에서 데이터 크롤링
    2. 러싱 야드 파싱 (전진/후퇴 분리)
    3. MongoDB에 저장 (중복 시 업데이트)
    
    ### ⚠️ 주의사항
    - 포지션은 현재 'Unknown'으로 저장
    - 협회에서 포지션 추가 시 업데이트 필요
    `,
  })
  @ApiQuery({
    name: 'league',
    required: true,
    enum: ['uni', 'soc'],
    description: '리그 구분',
  })
  @ApiQuery({
    name: 'season',
    required: true,
    example: '2025',
    description: '시즌 연도',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 크롤링 및 저장 성공',
    schema: {
      example: {
        success: true,
        message: '45명의 선수 스탯을 성공적으로 저장했습니다.',
        data: {
          league: 'uni',
          season: '2025',
          savedCount: 45,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '❌ 크롤링 실패',
  })
  async crawlAndSavePlayerStats(
    @Query('league') league: 'uni' | 'soc',
    @Query('season') season: string,
  ) {
    if (!league || !season) {
      return {
        success: false,
        message: 'league와 season은 필수 파라미터입니다.',
      };
    }

    const result = await this.kafaStatsService.fetchAndSavePlayerStats(
      league,
      season,
    );

    return {
      success: result.success,
      message: result.message,
      data: {
        league,
        season,
        savedCount: result.savedCount,
      },
    };
  }

  // DB에 저장된 KAFA 스탯 조회 API
  @Get('db-stats')
  @ApiOperation({
    summary: '💾 DB에 저장된 KAFA 선수 스탯 조회',
    description: `
    ## 💾 저장된 KAFA 스탯 조회
    
    크롤링해서 DB에 저장된 KAFA 선수 스탯을 조회합니다.
    
    ### 📋 필터링 옵션
    - **league**: uni(대학) 또는 soc(사회인)
    - **season**: 시즌 연도
    - **team**: 팀명 (부분 검색 가능)
    `,
  })
  @ApiQuery({ name: 'league', required: false, enum: ['uni', 'soc'] })
  @ApiQuery({ name: 'season', required: false, example: '2025' })
  @ApiQuery({ name: 'team', required: false, example: '한양대' })
  @ApiResponse({
    status: 200,
    description: '✅ DB 스탯 조회 성공',
    schema: {
      example: {
        success: true,
        message: '15명의 KAFA 스탯을 조회했습니다.',
        data: {
          league: 'uni',
          season: '2025',
          totalCount: 15,
          stats: [
            {
              playerName: '홍길동',
              teamName: '한양대학교',
              jerseyNumber: 10,
              position: 'Unknown',
              season: '2025',
              league: 'uni',
              rushing: {
                totalYards: 383,
                forwardYards: 434,
                backwardYards: -51,
                yardsPerAttempt: 5.2,
                attempts: 73,
                touchdowns: 4,
                longest: 35,
              },
              rank: 1,
            },
          ],
        },
      },
    },
  })
  async getKafaStatsFromDB(
    @Query('league') league?: 'uni' | 'soc',
    @Query('season') season?: string,
    @Query('team') teamName?: string,
  ) {
    const stats = await this.kafaStatsService.getKafaPlayerStatsFromDB(
      league,
      season,
      teamName,
    );

    return {
      success: true,
      message: `${stats.length}명의 KAFA 스탯을 조회했습니다.`,
      data: {
        league: league || '전체',
        season: season || '전체',
        teamName: teamName || '전체',
        totalCount: stats.length,
        stats,
      },
    };
  }

  // DB 상태 디버깅 API
  @Get('debug-db')
  @ApiOperation({
    summary: '🔍 DB 상태 디버깅',
    description: 'KAFA 컬렉션의 실제 데이터를 확인합니다.',
  })
  async debugDB() {
    const totalCount = await this.kafaStatsService.debugKafaDB();
    return {
      message: `총 ${totalCount}개의 데이터가 저장되어 있습니다.`,
      totalCount,
    };
  }

  // 잘못된 KAFA 데이터 삭제 API
  @Post('clear-db')
  @ApiOperation({
    summary: '🗑️ KAFA DB 데이터 삭제',
    description: '잘못 저장된 KAFA 데이터를 모두 삭제합니다.',
  })
  async clearKafaDB() {
    const result = await this.kafaStatsService.clearKafaDB();
    return {
      success: true,
      message: `${result.deletedCount}개의 데이터를 삭제했습니다.`,
      deletedCount: result.deletedCount,
    };
  }

  // 모든 스탯 페이지 탐색 API
  @Get('explore-all')
  @ApiOperation({
    summary: '🔍 모든 스탯 페이지 탐색',
    description: `
    ## 🔍 KAFA 전체 스탯 페이지 분석
    
    ind_uni1부터 ind_uni11까지 모든 페이지를 탐색하여
    각 페이지가 어떤 스탯을 다루는지 분석합니다.
    
    ### 📊 예상 스탯 타입
    - ind_uni1: 러싱
    - ind_uni2: 패싱
    - ind_uni3: 리시빙
    - ind_uni4-11: 기타 스탯들
    `,
  })
  @ApiQuery({ 
    name: 'league', 
    required: false, 
    enum: ['uni', 'soc'],
    description: '리그 구분 (기본값: uni)'
  })
  async exploreAllStats(@Query('league') league: 'uni' | 'soc' = 'uni') {
    const results = await this.kafaStatsService.exploreAllStatPages(league);
    return {
      success: true,
      message: '모든 스탯 페이지 탐색 완료',
      data: results
    };
  }

  // 모든 스탯 크롤링 및 통합 API
  @Post('crawl-all-stats')
  @ApiOperation({
    summary: '🚀 전체 스탯 크롤링 및 통합',
    description: `
    ## 🚀 모든 KAFA 스탯 타입 크롤링
    
    ind_uni1부터 ind_uni11까지 모든 스탯을 크롤링하고
    선수별로 데이터를 통합합니다.
    
    ### 📋 특징
    - 한 선수의 모든 스탯을 하나로 통합
    - 러싱, 패싱, 리시빙 등 모든 스탯 포함
    - 선수명, 팀명, 등번호로 매칭
    `,
  })
  @ApiQuery({
    name: 'league',
    required: false,
    enum: ['uni', 'soc'],
    description: '리그 구분 (기본값: uni)',
  })
  @ApiQuery({
    name: 'season',
    required: false,
    example: '2025',
    description: '시즌 연도 (기본값: 2025)',
  })
  async crawlAllStats(
    @Query('league') league: 'uni' | 'soc' = 'uni',
    @Query('season') season: string = '2025',
  ) {
    const result = await this.kafaStatsService.crawlAndMergeAllStats(league, season);
    return result;
  }

  // KAFA 로그인 API
  @Post('admin/login')
  @ApiOperation({
    summary: '🔐 KAFA 관리자 로그인',
    description: `
    ## 🔐 KAFA 관리자 계정으로 로그인
    
    관리자 페이지 접근을 위한 로그인 API입니다.
    로그인 후 세션 쿠키가 저장되어 관리자 전용 페이지에 접근할 수 있습니다.
    `,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', description: 'KAFA 아이디' },
        password: { type: 'string', description: 'KAFA 비밀번호' },
      },
      required: ['username', 'password'],
      example: {
        username: 'your_kafa_id',
        password: 'your_password'
      }
    }
  })
  async loginToKafa(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    const success = await this.kafaStatsService.loginToKafa(username, password);
    return {
      success,
      message: success ? '로그인 성공' : '로그인 실패',
    };
  }

  // 경기 데이터 크롤링 API
  @Get('admin/match/:matchId')
  @ApiOperation({
    summary: '⚔️ 경기 상세 데이터 크롤링',
    description: `
    ## ⚔️ 관리자 페이지의 경기 상세 데이터 크롤링
    
    로그인 후 특정 경기의 상세 정보를 크롤링합니다.
    
    ### 📋 포함 데이터
    - 경기 일정, 장소
    - 양팀 정보 및 스코어
    - 선수별 개인 기록
    - 경기 상세 스탯
    
    ### ⚠️ 주의사항
    - 먼저 /admin/login으로 로그인 필요
    - 로그인 세션이 유지되어야 함
    `,
  })
  @ApiParam({
    name: 'matchId',
    description: '경기 ID (L_index)',
    example: 295,
  })
  async crawlMatchData(@Param('matchId') matchId: string) {
    try {
      const matchData = await this.kafaStatsService.crawlMatchData(parseInt(matchId));
      return {
        success: true,
        message: '경기 데이터 크롤링 성공',
        data: matchData,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}