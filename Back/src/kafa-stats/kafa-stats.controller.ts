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
import { KafaMatchInfoService } from './kafa-match-info.service';
import { KafaBatchService } from './kafa-batch.service';
import { KafaV2CrawlerService } from './kafa-v2-crawler.service';

@ApiTags('KAFA Stats')
@Controller('kafa-stats')
export class KafaStatsController {
  constructor(
    private readonly kafaStatsService: KafaStatsService,
    private readonly kafaMatchInfoService: KafaMatchInfoService,
    private readonly kafaBatchService: KafaBatchService,
    private readonly kafaV2CrawlerService: KafaV2CrawlerService,
  ) {}

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
      stats = stats.filter(
        (stat) =>
          stat.teamName.includes(teamFilter) ||
          teamFilter.includes(stat.teamName),
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
      stats = stats.filter(
        (stat) =>
          stat.university.includes(teamFilter) ||
          teamFilter.includes(stat.university),
      );
    }

    // 선수 필터링
    if (playerFilter) {
      stats = stats.filter(
        (stat) =>
          stat.playerName.includes(playerFilter) ||
          playerFilter.includes(stat.playerName),
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
    description:
      'KAFA 웹사이트에서 사회인 리그 팀들의 러싱 스탯을 실시간으로 가져옵니다.',
  })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'team', required: false })
  async getSocialTeamStats(
    @Query('year') year?: string,
    @Query('team') teamFilter?: string,
  ) {
    let stats = await this.kafaStatsService.getTeamStats('soc', year);

    if (teamFilter) {
      stats = stats.filter(
        (stat) =>
          stat.teamName.includes(teamFilter) ||
          teamFilter.includes(stat.teamName),
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
    description:
      'KAFA 웹사이트에서 사회인 리그 개인 선수들의 러싱 스탯을 실시간으로 가져옵니다.',
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
      stats = stats.filter(
        (stat) =>
          stat.university.includes(teamFilter) ||
          teamFilter.includes(stat.university),
      );
    }

    if (playerFilter) {
      stats = stats.filter(
        (stat) =>
          stat.playerName.includes(playerFilter) ||
          playerFilter.includes(stat.playerName),
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
    description:
      '팀명으로 해당 팀의 스탯을 조회합니다. 대학/사회인 리그를 자동으로 감지합니다.',
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
    description: '리그 구분 (기본값: uni)',
  })
  async exploreAllStats(@Query('league') league: 'uni' | 'soc' = 'uni') {
    const results = await this.kafaStatsService.exploreAllStatPages(league);
    return {
      success: true,
      message: '모든 스탯 페이지 탐색 완료',
      data: results,
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
    const result = await this.kafaStatsService.crawlAndMergeAllStats(
      league,
      season,
    );
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
        password: 'your_password',
      },
    },
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
      const matchData = await this.kafaStatsService.crawlMatchData(
        parseInt(matchId),
      );
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

  // 저장된 플레이 데이터 조회 API
  @Get('play-data/:matchId')
  @ApiOperation({
    summary: '🏈 경기 플레이별 상세 데이터 조회',
    description: `
    ## 🏈 저장된 플레이별 상세 데이터 조회
    
    크롤링하여 저장된 경기의 플레이별 상세 데이터를 조회합니다.
    
    ### 📋 포함 데이터
    - 쿼터별 모든 플레이 데이터
    - 선수별 플레이 정보 (QB, 태클, 게인 야드 등)
    - 다운, 볼 위치, 득점 정보
    
    ### 🔍 선택 사항
    - quarter 파라미터로 특정 쿼터만 조회 가능
    `,
  })
  @ApiParam({
    name: 'matchId',
    description: '경기 ID',
    example: 295,
  })
  @ApiQuery({
    name: 'quarter',
    description: '특정 쿼터 (1qtr, 2qtr, 3qtr, 4qtr, SD)',
    required: false,
    example: '1qtr',
  })
  async getPlayData(
    @Param('matchId') matchId: string,
    @Query('quarter') quarter?: string,
  ) {
    try {
      const playData = await this.kafaStatsService.getPlayDataFromDB(
        parseInt(matchId),
        quarter,
      );

      // 쿼터별로 그룹핑
      const groupedData = playData.reduce((acc, play) => {
        if (!acc[play.quarter]) {
          acc[play.quarter] = [];
        }
        acc[play.quarter].push(play);
        return acc;
      }, {});

      return {
        success: true,
        message: `플레이 데이터 조회 성공`,
        data: {
          matchId: parseInt(matchId),
          totalPlays: playData.length,
          quarters: groupedData,
          playsByQuarter: Object.keys(groupedData).map((q) => ({
            quarter: q,
            playCount: groupedData[q].length,
          })),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `플레이 데이터 조회 실패: ${error.message}`,
      };
    }
  }

  // 경기 일반 정보 조회 API
  @Get('game-info/:matchId')
  @ApiOperation({
    summary: '🏆 경기 일반 정보 조회',
    description: `
    ## 🏆 경기 일반 정보 추출
    
    크롤링된 데이터에서 경기 일반 정보를 추출하여 구조화합니다.
    
    ### 📋 포함된 정보
    
    **기본 경기 정보**
    - 경기 ID, 리그 타입 (전체/1부/2부)
    - 경기 날짜, 경기장
    
    **팀 정보**
    - 홈팀/원정팀 (전체 팀명, 코드)
    - 최종 스코어
    
    **쿼터별 득점**
    - 1~4쿼터 각 팀 득점
    - 총합 스코어
    
    ### 🎯 활용 방안
    - 경기 결과 요약
    - 팀별 기본 정보 제공
    - 다른 시스템과 연동용 데이터
    `,
  })
  @ApiParam({
    name: 'matchId',
    description: '조회할 경기 ID',
    example: 295,
  })
  @ApiResponse({
    status: 200,
    description: '✅ 경기 일반 정보 조회 성공',
    schema: {
      example: {
        success: true,
        message: '경기 295 일반 정보 추출 완료',
        data: {
          matchId: 295,
          leagueType: '전체',
          gameDate: '2025-11-16T00:00:00.000Z',
          venue: '군위종합운동장',
          homeTeam: {
            fullName: '경희대학교',
            code: 'KI',
            isHome: true,
          },
          awayTeam: {
            fullName: '연세대학교',
            code: 'YS',
            isHome: false,
          },
          finalScore: {
            home: 12,
            away: 7,
          },
          quarterScores: {
            q1: { home: 6, away: 0 },
            q2: { home: 0, away: 7 },
            q3: { home: 6, away: 0 },
            q4: { home: 0, away: 0 },
          },
          processedAt: '2025-11-26T07:30:00.000Z',
          dataSource: 'crawled',
        },
      },
    },
  })
  async getGameGeneralInfo(@Param('matchId') matchId: string) {
    try {
      const result = await this.kafaStatsService.getGameGeneralInfo(
        parseInt(matchId),
      );
      return result;
    } catch (error) {
      return {
        success: false,
        message: `경기 일반 정보 조회 실패: ${error.message}`,
      };
    }
  }

  // 경기 기록지 통계 계산 API
  @Get('game-record/:matchId')
  @ApiOperation({
    summary: '📊 경기 기록지 통계 분석',
    description: `
    ## 📊 경기 기록지 통계 분석 및 계산
    
    저장된 플레이 데이터를 바탕으로 경기 기록지에 필요한 모든 통계를 계산합니다.
    
    ### 📋 분석되는 통계
    
    **경기 일반 정보**
    - 경기 ID, 홈팀, 어웨이팀
    - 총 플레이 수
    
    **팀별 상세 통계**
    - 총 플레이 수 (러싱/패싱 구분)
    - 총 획득 야드 (러싱/패싱 구분)
    - 턴오버 (펌블 리커버리, 인터셉션)
    - 반칙 횟수 및 야드
    - 득점 횟수
    - 3rd Down 성공률
    
    **쿼터별 통계**
    - 쿼터별 플레이 수
    - 쿼터별 득점 수
    
    ### 🎯 활용 방안
    - 클립바 시스템 연동 (3rd Down% 등)
    - 경기 기록지 자동 생성
    - 팀 분석 자료 제공
    `,
  })
  @ApiParam({
    name: 'matchId',
    description: '분석할 경기 ID',
    example: 295,
  })
  @ApiQuery({
    name: 'quarter',
    description: '특정 쿼터만 분석 (선택사항)',
    required: false,
    enum: ['1qtr', '2qtr', '3qtr', '4qtr', 'SD'],
    example: '1qtr',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 경기 기록지 통계 분석 성공',
    schema: {
      example: {
        success: true,
        message: '경기 295 기록지 통계 계산 완료',
        data: {
          matchId: 295,
          homeTeam: 'KI',
          awayTeam: 'YS',
          totalPlays: 127,
          teamStats: {
            KI: {
              teamName: 'KI',
              totalPlays: 65,
              rushingPlays: 45,
              passingPlays: 20,
              totalYards: 284,
              rushingYards: 180,
              passingYards: 104,
              turnovers: 2,
              penalties: 8,
              penaltyYards: 75,
              scores: 3,
              thirdDownAttempts: 12,
              thirdDownConversions: 7,
              thirdDownPercentage: 58,
            },
          },
          quarterStats: {
            '1qtr': { plays: 35, scores: 1 },
            '2qtr': { plays: 36, scores: 2 },
            '3qtr': { plays: 25, scores: 0 },
            '4qtr': { plays: 31, scores: 1 },
          },
        },
      },
    },
  })
  async calculateGameRecordStats(
    @Param('matchId') matchId: string,
    @Query('quarter') quarter?: string,
  ) {
    try {
      const stats = await this.kafaStatsService.calculateGameRecordStats(
        parseInt(matchId),
        quarter,
      );

      return stats;
    } catch (error) {
      return {
        success: false,
        message: `경기 기록지 통계 계산 실패: ${error.message}`,
      };
    }
  }

  // KAFA 경기 일반 정보 API (자동 로그인 포함)
  @Get('match-info/:matchId')
  @ApiOperation({
    summary: '🏈 KAFA 경기 일반 정보 조회',
    description: `
    ## 🏈 KAFA 경기 일반 정보 6가지 자동 추출
    
    KAFA 관리자 페이지에 자동 로그인하여 경기의 일반 정보를 추출합니다.
    
    ### 📋 추출되는 정보 (6가지)
    1. **리그종류**: 전체/1부/2부 구분
    2. **경기날짜**: YYYY-MM-DD 형식
    3. **홈팀**: 팀명 및 이니셜 (예: "한양대학교 LIONS (HY)")
    4. **어웨이팀**: 팀명 및 이니셜 (예: "경성대학교 Dragons (KS)")
    5. **경기장소**: 경기장 이름
    6. **스코어**: Total(자동합산) 점수 (예: "HY 17 - KS 14")
    
    ### 🔄 자동 처리 과정
    1. KAFA 사이트 자동 로그인 (stech 계정)
    2. 경기 목록에서 해당 ID 검색
    3. 경기 상세 페이지 접근
    4. 팀 정보 및 점수 데이터 추출
    5. 구조화된 JSON 응답 반환
    
    ### ⚠️ 주의사항
    - 로그인 실패 시 오류 반환
    - 존재하지 않는 경기 ID 시 오류 반환
    - 팀 정보가 입력되지 않은 경기는 부분 데이터만 제공
    `,
  })
  @ApiParam({
    name: 'matchId',
    description: '조회할 경기 ID (L_index)',
    example: 287,
  })
  @ApiResponse({
    status: 200,
    description: '✅ 경기 일반 정보 조회 성공',
    schema: {
      example: {
        success: true,
        data: {
          matchId: 287,
          generalInfo: {
            leagueType: '전체',
            gameDate: '2025-11-01',
            homeTeam: {
              name: '경성대학교',
              initial: 'KS',
            },
            awayTeam: {
              name: '한양대학교',
              initial: 'HY',
            },
            venue: '군위종합운동장',
            score: {
              home: 14,
              away: 17,
              display: 'KS 14 - HY 17',
            },
          },
          detailedScores: {
            quarterlyScores: {
              home: {
                quarter1: 8,
                quarter2: 0,
                quarter3: 6,
                quarter4: 0,
                total: 14,
              },
              away: {
                quarter1: 7,
                quarter2: 0,
                quarter3: 7,
                quarter4: 0,
                total: 17,
              },
            },
            startTime: '14:00',
            endTime: '16:45',
            weather: '',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '❌ 경기 정보 추출 실패',
    schema: {
      example: {
        success: false,
        error: '경기 ID 287을 찾을 수 없습니다.',
        data: null,
      },
    },
  })
  async getMatchGeneralInfo(@Param('matchId') matchId: string) {
    const result = await this.kafaMatchInfoService.getMatchGeneralInfo(
      parseInt(matchId),
    );
    return result;
  }

  // === 새로운 배치 시스템 API ===

  // 전체 경기 데이터 조회 (일반 정보 + 플레이 데이터)
  @Get('complete-match/:matchId')
  @ApiOperation({
    summary: '🏈 완전한 경기 데이터 조회',
    description: `
    ## 🏈 경기의 모든 정보를 한번에 조회
    
    일반 정보와 플레이별 상세 데이터를 모두 포함한 완전한 경기 정보를 제공합니다.
    프론트엔드에서 경기 ID만으로 모든 정보를 즉시 확인할 수 있습니다.
    
    ### 📋 포함된 정보
    1. **경기 일반 정보**: 날짜, 팀, 점수, 경기장
    2. **플레이별 데이터**: 모든 쿼터의 플레이 상세 정보
    3. **공격팀 정보**: 각 플레이의 공격팀 식별
    
    ### 🚀 사용 예시
    프론트에서 \`/complete-match/268\` 호출 시 268번 경기의 모든 데이터 즉시 반환
    `,
  })
  @ApiParam({
    name: 'matchId',
    description: '조회할 경기 ID',
    example: 268,
  })
  async getCompleteMatchData(@Param('matchId') matchId: string) {
    const result = await this.kafaMatchInfoService.getCompleteMatchData(
      parseInt(matchId),
    );
    return result;
  }

  // 수동 업데이트: 경기 데이터 저장
  @Post('update-match/:matchId')
  @ApiOperation({
    summary: '🔄 특정 경기 업데이트',
    description: `
    ## 🔄 프론트 "업데이트" 버튼용 API
    
    특정 경기를 KAFA에서 크롤링하여 우리 DB에 저장합니다.
    
    ### 🎯 동작 과정
    1. KAFA 사이트에서 해당 경기 최신 데이터 크롤링
    2. 우리 MongoDB에 저장 (기존 데이터 덮어쓰기)
    3. 저장 완료 후 결과 반환
    
    ### 💡 사용법
    - 경기 후 코치가 "업데이트" 버튼 클릭
    - 해당 경기 최신 데이터가 DB에 저장됨
    - 이후 조회는 DB에서 빠르게 응답
    `,
  })
  async updateMatch(@Param('matchId') matchId: string) {
    try {
      const matchIdNum = parseInt(matchId);

      // 1. KAFA에서 최신 데이터 크롤링
      const result =
        await this.kafaMatchInfoService.getCompleteMatchData(matchIdNum);

      if (!result.success || !result.data) {
        return {
          success: false,
          message: `경기 ${matchId} 크롤링 실패`,
          data: null,
        };
      }

      // 2. DB에 저장할 데이터 구조로 변환
      const matchData = {
        matchId: matchIdNum,
        leagueId: this.getLeagueIdByMatchId(matchIdNum),
        gameDate: result.data.generalInfo?.gameDate || '',
        venue: result.data.generalInfo?.venue || '',
        homeTeam: {
          name: result.data.generalInfo?.homeTeam?.name || '',
          initial: result.data.generalInfo?.homeTeam?.initial || '',
          fullName: result.data.generalInfo?.homeTeam?.name || '',
        },
        awayTeam: {
          name: result.data.generalInfo?.awayTeam?.name || '',
          initial: result.data.generalInfo?.awayTeam?.initial || '',
          fullName: result.data.generalInfo?.awayTeam?.name || '',
        },
        homeScore: result.data.detailedScores?.quarterlyScores?.home || {
          quarter1: 0,
          quarter2: 0,
          quarter3: 0,
          quarter4: 0,
          total: 0,
        },
        awayScore: result.data.detailedScores?.quarterlyScores?.away || {
          quarter1: 0,
          quarter2: 0,
          quarter3: 0,
          quarter4: 0,
          total: 0,
        },
        leagueType: result.data.generalInfo?.leagueType || '전체',
        startTime: result.data.detailedScores?.startTime || '',
        endTime: result.data.detailedScores?.endTime || '',
        weather: result.data.detailedScores?.weather || '',
        status: 'crawled',
        plays: [],
        totalPlays: 0,
        crawledAt: new Date(),
        lastUpdatedAt: new Date(),
      };

      // 3. 플레이 데이터 변환
      if (result.data.playByPlay?.quarters) {
        Object.entries(result.data.playByPlay.quarters).forEach(
          ([quarter, quarterData]: [string, any]) => {
            if (quarterData.plays) {
              quarterData.plays.forEach((play) => {
                matchData.plays.push({
                  quarter: play.quarter || quarter,
                  playNumber: play.playNumber || '',
                  time: play.time || '',
                  offenseTeam: play.offenseTeam || '',
                  ballOn: play.ballOn || '',
                  down: play.down || '',
                  quarterback: play.quarterback || '',
                  playType: play.playType || '',
                  gainYd: play.gainYd || '',
                  tackleBy: play.tackleBy || '',
                  sack: play.sack || '',
                  penalty: play.penalty || '',
                  penaltyName: play.penaltyName || '',
                  score: play.score || '',
                  remark: play.remark || '',
                });
              });
            }
          },
        );
        matchData.totalPlays = matchData.plays.length;
      }

      // 4. 수동으로 배치 서비스 호출해서 저장
      await this.kafaBatchService.crawlSpecificMatch(matchIdNum);

      return {
        success: true,
        message: `경기 ${matchId} 업데이트 완료`,
        data: {
          matchId: matchIdNum,
          homeTeam: matchData.homeTeam.name,
          awayTeam: matchData.awayTeam.name,
          score: `${matchData.homeScore.total} - ${matchData.awayScore.total}`,
          totalPlays: matchData.totalPlays,
          updatedAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `경기 ${matchId} 업데이트 실패: ${error.message}`,
        data: null,
      };
    }
  }

  // 저장된 경기 데이터 조회
  @Get('match/:matchId')
  @ApiOperation({
    summary: '📋 저장된 경기 데이터 조회',
    description: `
    ## 📋 DB에 저장된 경기 데이터 빠른 조회
    
    우리 MongoDB에 저장된 경기 데이터를 즉시 조회합니다.
    업데이트된 경기만 조회 가능합니다.
    `,
  })
  async getSavedMatch(@Param('matchId') matchId: string) {
    try {
      const matchIdNum = parseInt(matchId);

      // KafaBatchService를 통해 저장된 데이터 조회
      const mongoose = require('mongoose');
      const db = mongoose.connection.db;
      const match = await db
        .collection('kafa_matches')
        .findOne({ matchId: matchIdNum });

      if (!match) {
        return {
          success: false,
          message: `경기 ${matchId}가 저장되어 있지 않습니다. 먼저 업데이트하세요.`,
          data: null,
        };
      }

      return {
        success: true,
        message: `경기 ${matchId} 조회 완료`,
        data: match,
      };
    } catch (error) {
      return {
        success: false,
        message: `경기 ${matchId} 조회 실패: ${error.message}`,
        data: null,
      };
    }
  }

  // 헬퍼 함수: 경기 ID로 리그 ID 찾기
  private getLeagueIdByMatchId(matchId: number): number {
    const LEAGUE_RANGES = [
      { index: 19, min: 290, max: 300 },
      { index: 20, min: 194, max: 252 },
      { index: 21, min: 247, max: 277 }, // 268번이 여기에 속함
      { index: 22, min: 278, max: 285 },
      { index: 23, min: 286, max: 289 },
      { index: 24, min: 286, max: 297 },
    ];

    for (const league of LEAGUE_RANGES) {
      if (matchId >= league.min && matchId <= league.max) {
        return league.index;
      }
    }

    return 21; // 기본값
  }

  // 특정 경기 수동 크롤링
  @Post('batch/crawl-match/:matchId')
  @ApiOperation({
    summary: '🎯 특정 경기 수동 크롤링',
    description: `
    ## 🎯 개별 경기 데이터 즉시 크롤링
    
    특정 경기의 데이터를 즉시 크롤링하여 DB에 저장합니다.
    새로 완료된 경기나 업데이트된 경기를 즉시 반영할 때 사용합니다.
    `,
  })
  @ApiParam({
    name: 'matchId',
    description: '크롤링할 경기 ID',
    example: 268,
  })
  async crawlSpecificMatch(@Param('matchId') matchId: string) {
    const result = await this.kafaBatchService.crawlSpecificMatch(
      parseInt(matchId),
    );
    return result;
  }

  // 배치 작업 상태 조회
  @Get('batch/status')
  @ApiOperation({
    summary: '📊 배치 작업 상태 조회',
    description: `
    ## 📊 시스템 상태 및 진행률 확인
    
    현재 시스템에 저장된 리그 및 경기 정보 현황을 확인합니다.
    
    ### 📋 제공 정보
    - 전체 리그 수 / 활성 리그 수
    - 전체 경기 수 / 크롤링 완료된 경기 수
    - 크롤링 진행률 (%)
    - 마지막 크롤링된 경기 정보
    `,
  })
  async getBatchStatus() {
    const status = await this.kafaBatchService.getBatchStatus();
    return {
      success: true,
      message: '배치 상태 조회 완료',
      data: status,
    };
  }

  // DB에서 경기 목록 조회
  @Get('matches')
  @ApiOperation({
    summary: '📋 저장된 경기 목록 조회',
    description: `
    ## 📋 DB에 저장된 경기 목록 조회
    
    크롤링하여 저장된 모든 경기의 목록을 조회합니다.
    
    ### 🔍 필터링 옵션
    - leagueId: 특정 리그의 경기만 조회
    - status: 경기 상태별 필터링
    `,
  })
  @ApiQuery({
    name: 'leagueId',
    required: false,
    description: '특정 리그 ID로 필터링',
    example: 19,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['scheduled', 'completed', 'crawled', 'failed'],
    description: '경기 상태로 필터링',
  })
  async getMatches(
    @Query('leagueId') leagueId?: string,
    @Query('status') status?: string,
  ) {
    // 이 메서드는 KafaBatchService에 추가 구현이 필요함
    return {
      success: true,
      message: '경기 목록 조회 기능 구현 예정',
      data: {
        leagueId: leagueId || '전체',
        status: status || '전체',
        matches: [],
      },
    };
  }

  // 리그 목록 조회
  @Get('leagues')
  @ApiOperation({
    summary: '🏆 저장된 리그 목록 조회',
    description: `
    ## 🏆 DB에 저장된 리그 목록 조회
    
    크롤링하여 저장된 모든 리그의 목록을 조회합니다.
    각 리그별 경기 수와 크롤링 진행 상황을 확인할 수 있습니다.
    `,
  })
  async getLeagues() {
    try {
      const leagues = await this.kafaBatchService.getAllLeagues();
      return {
        success: true,
        message: '리그 목록 조회 성공',
        data: {
          totalLeagues: leagues.length,
          leagues: leagues.map((league) => ({
            leagueId: league.leagueId,
            name: league.name,
            category: league.category,
            division: league.division,
          })),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `리그 목록 조회 실패: ${error.message}`,
        data: { leagues: [] },
      };
    }
  }

  // 특정 리그의 경기 목록 업데이트 (페이지네이션 포함)
  @Post('update-league/:leagueId')
  @ApiOperation({
    summary: '🔄 리그 경기 목록 업데이트',
    description: `
    ## 🔄 특정 리그의 모든 페이지 경기 목록 업데이트
    
    개선된 페이지네이션 크롤링으로 특정 리그의 모든 경기를 가져옵니다.
    
    ### 📋 동작 과정
    1. 페이지 1부터 시작
    2. 경기가 없을 때까지 모든 페이지 크롤링
    3. 총 경기 수 정확히 계산
    4. DB에 저장
    `,
  })
  async updateLeague(@Param('leagueId') leagueId: string) {
    try {
      const leagueIdNum = parseInt(leagueId);

      // KafaLeagueCrawlerService로 특정 리그 크롤링
      const result =
        await this.kafaBatchService.crawlSpecificLeague(leagueIdNum);

      return {
        success: true,
        message: `리그 ${leagueId} 업데이트 완료`,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: `리그 ${leagueId} 업데이트 실패: ${error.message}`,
        data: null,
      };
    }
  }

  // 모든 리그 자동 업데이트
  @Post('update-all-leagues')
  @ApiOperation({
    summary: '🚀 모든 리그 자동 업데이트',
    description: `
    ## 🚀 KAFA의 모든 리그를 자동으로 감지하고 업데이트
    
    ### 📋 동작 과정
    1. KAFA 사이트에서 실제 리그 목록 크롤링 (모든 페이지)
    2. 각 리그별로 경기 목록 및 점수 정보 크롤링
    3. 완전한 6가지 정보로 DB 저장
    
    ### 🎯 결과
    - 20개 모든 리그의 모든 경기를 완전한 정보로 저장
    - 더 이상 하드코딩된 리그 ID에 의존하지 않음
    `,
  })
  async updateAllLeagues() {
    try {
      // 1. 먼저 리그 목록 업데이트
      const leagueResult = await this.kafaBatchService.updateLeagues();

      // 2. 모든 리그의 경기 업데이트
      const matchResult = await this.kafaBatchService.updateMatches();

      return {
        success: true,
        message: '모든 리그 업데이트 완료',
        data: {
          leagues: leagueResult,
          matches: matchResult,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `모든 리그 업데이트 실패: ${error.message}`,
        data: null,
      };
    }
  }

  // DB 직접 확인용 임시 API
  @Get('debug/match/:matchId')
  @ApiOperation({
    summary: '🔍 DB에서 특정 경기 직접 조회',
    description: 'MongoDB에서 특정 경기가 저장되어 있는지 직접 확인합니다.',
  })
  async debugMatch(@Param('matchId') matchId: string) {
    try {
      // KafaBatchService를 통해 올바른 DB 조회
      const match = await this.kafaBatchService.getMatchInfo(parseInt(matchId));
      const allMatches = await this.kafaBatchService.getAllMatches();

      return {
        success: true,
        message: `경기 ${matchId} DB 조회 결과`,
        data: {
          targetMatch: match,
          allMatchIds: allMatches.map((m) => m.matchId).sort((a, b) => a - b),
          totalMatches: allMatches.length,
          allMatches: allMatches.map((m) => ({
            matchId: m.matchId,
            homeTeam: m.homeTeam?.name || '미정',
            awayTeam: m.awayTeam?.name || '미정',
            leagueId: m.leagueId,
          })),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `DB 조회 실패: ${error.message}`,
        data: null,
      };
    }
  }

  // 268번 경기 직접 저장 API
  @Post('save-match/:matchId')
  @ApiOperation({
    summary: '💾 경기 데이터 직접 저장',
    description: `
    ## 💾 실시간 크롤링 데이터를 DB에 직접 저장
    
    complete-match API로 크롤링한 데이터를 MongoDB에 직접 저장합니다.
    배치 시스템 우회용 임시 솔루션입니다.
    `,
  })
  async saveMatchDirectly(@Param('matchId') matchId: string) {
    try {
      const matchIdNum = parseInt(matchId);

      // 1. 실시간 크롤링으로 데이터 가져오기
      const result =
        await this.kafaMatchInfoService.getCompleteMatchData(matchIdNum);

      if (!result.success || !result.data) {
        return {
          success: false,
          message: `경기 ${matchId} 크롤링 실패`,
          data: null,
        };
      }

      // 2. DB 저장 형태로 데이터 변환
      const matchData = {
        matchId: matchIdNum,
        leagueId: 21, // 268번은 리그 21에 속함
        gameDate: result.data.generalInfo?.gameDate || '',
        venue: result.data.generalInfo?.venue || '',
        homeTeam: {
          name: result.data.generalInfo?.homeTeam?.name || '',
          initial: result.data.generalInfo?.homeTeam?.initial || '',
          fullName:
            `${result.data.generalInfo?.homeTeam?.name} ${result.data.generalInfo?.homeTeam?.initial}` ||
            '',
        },
        awayTeam: {
          name: result.data.generalInfo?.awayTeam?.name || '',
          initial: result.data.generalInfo?.awayTeam?.initial || '',
          fullName:
            `${result.data.generalInfo?.awayTeam?.name} ${result.data.generalInfo?.awayTeam?.initial}` ||
            '',
        },
        homeScore: result.data.detailedScores?.quarterlyScores?.home || {
          quarter1: 0,
          quarter2: 0,
          quarter3: 0,
          quarter4: 0,
          total: 0,
        },
        awayScore: result.data.detailedScores?.quarterlyScores?.away || {
          quarter1: 0,
          quarter2: 0,
          quarter3: 0,
          quarter4: 0,
          total: 0,
        },
        leagueType: result.data.generalInfo?.leagueType || '전체',
        startTime: result.data.detailedScores?.startTime || '',
        endTime: result.data.detailedScores?.endTime || '',
        weather: result.data.detailedScores?.weather || '',
        status: 'crawled',
        plays: [],
        totalPlays: 0,
        crawledAt: new Date(),
        lastUpdatedAt: new Date(),
      };

      // 3. 플레이 데이터 변환
      if (result.data.playByPlay?.quarters) {
        Object.entries(result.data.playByPlay.quarters).forEach(
          ([quarter, quarterData]: [string, any]) => {
            if (quarterData.plays) {
              quarterData.plays.forEach((play) => {
                matchData.plays.push({
                  quarter: play.quarter || quarter,
                  playNumber: play.playNumber || '',
                  time: play.time || '',
                  offenseTeam: play.offenseTeam || '',
                  ballOn: play.ballOn || '',
                  down: play.down || '',
                  quarterback: play.quarterback || '',
                  playType: play.playType || '',
                  gainYd: play.gainYd || '',
                  tackleBy: play.tackleBy || '',
                  sack: play.sack || '',
                  penalty: play.penalty || '',
                  penaltyName: play.penaltyName || '',
                  score: play.score || '',
                  remark: play.remark || '',
                });
              });
            }
          },
        );
        matchData.totalPlays = matchData.plays.length;
      }

      // 4. MongoDB에 직접 저장 (임시 방법)
      // KafaBatchService의 private method 대신 직접 처리
      const mongoose = require('mongoose');
      const KafaMatch = mongoose.model('KafaMatch');

      // 기존 경기가 있으면 업데이트, 없으면 생성
      await KafaMatch.findOneAndUpdate(
        { matchId: matchIdNum },
        { $set: matchData },
        { upsert: true, new: true },
      );

      return {
        success: true,
        message: `경기 ${matchId} DB 저장 완료`,
        data: {
          matchId: matchIdNum,
          totalPlays: matchData.totalPlays,
          homeTeam: matchData.homeTeam.name,
          awayTeam: matchData.awayTeam.name,
          score: `${matchData.homeScore.total} - ${matchData.awayScore.total}`,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `경기 ${matchId} 저장 실패: ${error.message}`,
        data: null,
      };
    }
  }

  // === 새로운 V2 크롤링 시스템 API ===

  // V2: 리그 목록 크롤링
  // V2 리그 목록 조회
  @Get('v2/leagues')
  @ApiOperation({
    summary: '📋 V2: 리그 목록 조회',
    description: '크롤링된 리그 목록과 실제 L_l_index 매핑 정보를 조회합니다.',
  })
  async getLeaguesV2() {
    try {
      const leagues = await this.kafaV2CrawlerService.getAllLeagues();
      return {
        success: true,
        message: '리그 목록 조회 완료',
        data: {
          totalLeagues: leagues.length,
          leagues,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `리그 목록 조회 실패: ${error.message}`,
      };
    }
  }

  @Post('v2/crawl-leagues')
  @ApiOperation({
    summary: '🆕 V2: 모든 리그 목록 크롤링',
    description: `
    ## 🆕 새로운 구조의 리그 크롤링 시스템
    
    KAFA 사이트 구조에 맞춰 다음 순서로 크롤링합니다:
    1. match_result.html → 모든 리그 목록 수집 (페이지네이션 포함)
    2. 리그별로 독립적인 ID 관리
    3. 올바른 계층 구조로 DB 저장
    
    ### 🔄 변경사항
    - 기존: 글로벌 경기 ID 방식 (잘못된 구조)
    - 신규: 리그 → 경기 계층 구조 (KAFA 사이트와 동일)
    `,
  })
  async crawlAllLeaguesV2() {
    try {
      await this.kafaV2CrawlerService.crawlAllLeagues();
      return {
        success: true,
        message: '리그 목록 크롤링 완료',
      };
    } catch (error) {
      return {
        success: false,
        message: `리그 목록 크롤링 실패: ${error.message}`,
      };
    }
  }

  // V2: 특정 리그의 경기 목록 크롤링
  @Post('v2/crawl-league/:leagueId/matches')
  @ApiOperation({
    summary: '🆕 V2: 특정 리그의 경기 목록 크롤링',
    description: `
    ## 🆕 리그별 경기 목록 크롤링
    
    특정 리그의 모든 경기를 크롤링합니다:
    1. /match_list.html?L_l_index={리그번호} 접근
    2. 해당 리그의 모든 페이지 크롤링 (페이지네이션 지원)
    3. 리그 내 경기 순번으로 저장 (1, 2, 3...)
    
    ### 🎯 저장 구조
    - leagueId: KAFA 리그 번호
    - matchIndex: 해당 리그 내 경기 순번
    - 식별: (leagueId, matchIndex) 조합으로 유니크
    `,
  })
  @ApiParam({
    name: 'leagueId',
    description: 'KAFA 리그 번호',
    example: 21,
  })
  async crawlLeagueMatchesV2(@Param('leagueId') leagueId: string) {
    try {
      const leagueIdNum = parseInt(leagueId);
      await this.kafaV2CrawlerService.crawlMatchesForLeague(leagueIdNum);
      return {
        success: true,
        message: `리그 ${leagueId}의 경기 목록 크롤링 완료`,
      };
    } catch (error) {
      return {
        success: false,
        message: `리그 ${leagueId} 경기 목록 크롤링 실패: ${error.message}`,
      };
    }
  }

  // V2: 특정 경기의 상세 정보 크롤링
  @Post('v2/crawl-league/:leagueId/match/:matchIndex')
  @ApiOperation({
    summary: '🆕 V2: 특정 경기 상세 정보 크롤링',
    description: `
    ## 🆕 경기별 상세 정보 크롤링
    
    리그 내 특정 순번의 경기 상세 정보를 크롤링합니다:
    1. 해당 리그의 경기 목록에서 실제 KAFA matchId 찾기
    2. 경기 상세 페이지에서 점수, 플레이 데이터 크롤링
    3. DB에 상세 정보 저장
    
    ### 🎯 URL 구조
    - /v2/crawl-league/21/match/3 → 리그 21의 3번째 경기 크롤링
    `,
  })
  @ApiParam({
    name: 'leagueId',
    description: 'KAFA 리그 번호',
    example: 21,
  })
  @ApiParam({
    name: 'matchIndex',
    description: '해당 리그 내 경기 순번',
    example: 3,
  })
  async crawlMatchDetailsV2(
    @Param('leagueId') leagueId: string,
    @Param('matchIndex') matchIndex: string,
  ) {
    try {
      const leagueIdNum = parseInt(leagueId);
      const matchIndexNum = parseInt(matchIndex);

      await this.kafaV2CrawlerService.crawlMatchDetails(
        leagueIdNum,
        matchIndexNum,
      );

      return {
        success: true,
        message: `리그 ${leagueId} 경기 ${matchIndex} 상세 정보 크롤링 완료`,
      };
    } catch (error) {
      return {
        success: false,
        message: `리그 ${leagueId} 경기 ${matchIndex} 크롤링 실패: ${error.message}`,
      };
    }
  }

  // V2: 특정 리그의 경기 목록 조회
  @Get('v2/league/:leagueId/matches')
  @ApiOperation({
    summary: '🆕 V2: 특정 리그의 경기 목록 조회',
    description:
      '새로운 구조로 저장된 특정 리그의 모든 경기 목록을 조회합니다.',
  })
  @ApiParam({
    name: 'leagueId',
    description: 'KAFA 리그 번호',
    example: 19,
  })
  async getLeagueMatchesV2(@Param('leagueId') leagueId: string) {
    try {
      const leagueIdNum = parseInt(leagueId);
      const matches =
        await this.kafaV2CrawlerService.getLeagueMatches(leagueIdNum);

      return {
        success: true,
        message: `리그 ${leagueId}의 경기 목록 조회 완료`,
        data: {
          leagueId: leagueIdNum,
          totalMatches: matches.length,
          matches: matches,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `리그 ${leagueId} 경기 목록 조회 실패: ${error.message}`,
      };
    }
  }

  // V2: 전체 업데이트 - 새로운 리그와 경기 확인
  @Post('v2/update-all')
  @ApiOperation({
    summary: '🔄 V2: 전체 업데이트',
    description: `
    ## 🔄 새로운 리그와 경기 자동 확인 및 업데이트
    
    관리자가 버튼 클릭으로 실행할 수 있는 업데이트 기능입니다.
    
    ### 📋 수행 작업
    1. KAFA 사이트에서 새로운 리그 확인
    2. 각 리그의 새로운 경기 확인
    3. 변경사항만 크롤링하여 DB 업데이트
    
    ### 📊 반환 정보
    - 새로 추가된 리그 수
    - 업데이트된 리그 수
    - 새로 추가된 경기 수
    - 소요 시간
    
    ### ⚠️ 주의사항
    - 전체 리그를 순회하므로 시간이 걸릴 수 있습니다 (약 30초-1분)
    - 서버 부하 방지를 위해 리그별로 1초 딜레이가 있습니다
    `,
  })
  async updateAllV2() {
    try {
      const result = await this.kafaV2CrawlerService.updateAll();
      return result;
    } catch (error) {
      return {
        success: false,
        message: `전체 업데이트 실패: ${error.message}`,
      };
    }
  }

  // V2: 특정 리그만 업데이트
  @Post('v2/update-league/:leagueId')
  @ApiOperation({
    summary: '🔄 V2: 특정 리그 업데이트',
    description: `
    특정 리그의 새로운 경기만 확인하고 업데이트합니다.
    전체 업데이트보다 빠르게 특정 리그만 업데이트할 때 사용합니다.
    `,
  })
  @ApiParam({
    name: 'leagueId',
    type: 'number',
    description: '업데이트할 리그 ID (L_l_index)',
    example: 19,
  })
  async updateLeagueV2(@Param('leagueId') leagueId: string) {
    try {
      const result = await this.kafaV2CrawlerService.updateLeague(
        parseInt(leagueId),
      );
      return result;
    } catch (error) {
      return {
        success: false,
        message: `리그 ${leagueId} 업데이트 실패: ${error.message}`,
      };
    }
  }

  // 전체 KAFA 통계 데이터 API
  @Get('all-stats')
  @ApiOperation({
    summary: '🏈 전체 KAFA 통계 데이터 조회',
    description: `
    ## 🏈 전체 KAFA 통계 데이터 한 번에 조회
    
    대학/사회인 리그의 모든 팀/개인 통계를 오펜스/디펜스/스페셜팀으로 구분하여 제공합니다.
    프론트엔드에서 자유롭게 필터링하고 분류할 수 있는 완전한 데이터셋입니다.
    
    ### 📊 포함된 데이터 구조
    
    **대학 (University)**
    - **팀 스탯**: 오펜스(러싱/패싱/리시빙) + 디펜스(태클/인터셉션/색) + 스페셜(킥/펀트)
    - **개인 스탯**: 오펜스(러싱/패싱/리시빙) + 디펜스(태클/인터셉션/색) + 스페셜(킥/펀트/리턴)
    
    **사회인 (Social)**
    - **팀 스탯**: 동일 구조
    - **개인 스탯**: 동일 구조
    
    ### 🎯 활용 방안
    - 리그별 필터링 (대학/사회인)
    - 팀/개인 구분 필터링
    - 포지션별 필터링 (오펜스/디펜스/스페셜팀)
    - 스탯 타입별 필터링 (러싱/패싱/태클 등)
    - 순위별 정렬 및 검색
    
    ### ⚡ 성능 최적화
    - 실시간 KAFA 사이트 크롤링
    - DB 저장 없이 직접 제공
    - 캐싱 없이 항상 최신 데이터
    `,
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: '특정 연도 조회 (선택사항)',
    example: '2025',
  })
  @ApiResponse({
    status: 200,
    description: '전체 KAFA 통계 데이터 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '전체 KAFA 통계 데이터 조회 완료' },
        data: {
          type: 'object',
          properties: {
            university: {
              type: 'object',
              properties: {
                team: {
                  type: 'object',
                  properties: {
                    offense: {
                      type: 'object',
                      properties: {
                        rushing: { type: 'array', items: { type: 'object' } },
                        passing: { type: 'array', items: { type: 'object' } },
                        receiving: { type: 'array', items: { type: 'object' } },
                      },
                    },
                    defense: {
                      type: 'object',
                      properties: {
                        tackles: { type: 'array', items: { type: 'object' } },
                        interceptions: {
                          type: 'array',
                          items: { type: 'object' },
                        },
                        sacks: { type: 'array', items: { type: 'object' } },
                      },
                    },
                    special: {
                      type: 'object',
                      properties: {
                        kicking: { type: 'array', items: { type: 'object' } },
                        punting: { type: 'array', items: { type: 'object' } },
                      },
                    },
                  },
                },
                individual: {
                  type: 'object',
                  description: '개인 통계 (팀과 동일 구조)',
                },
              },
            },
            social: {
              type: 'object',
              description: '사회인 통계 (대학과 동일 구조)',
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            crawledAt: { type: 'string', example: '2025-12-01T13:45:00Z' },
            categories: {
              type: 'array',
              items: { type: 'string' },
              example: ['university', 'social'],
            },
            units: {
              type: 'array',
              items: { type: 'string' },
              example: ['team', 'individual'],
            },
            phases: {
              type: 'array',
              items: { type: 'string' },
              example: ['offense', 'defense', 'special'],
            },
            totalStatTypes: { type: 'number', example: 18 },
          },
        },
      },
    },
  })
  async getAllKafaStats(@Query('year') year?: string) {
    try {
      const startTime = Date.now();
      const data = await this.kafaStatsService.getAllKafaStats(year);
      const duration = Date.now() - startTime;

      return {
        success: true,
        message: `전체 KAFA 통계 데이터 조회 완료 (${Math.round(duration / 1000)}초 소요)`,
        data,
        meta: {
          crawledAt: new Date().toISOString(),
          categories: ['university', 'social'],
          units: ['team', 'individual'],
          phases: ['offense', 'defense', 'special'],
          totalStatTypes: 18,
          crawlDuration: `${Math.round(duration / 1000)}초`,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `전체 KAFA 통계 조회 실패: ${error.message}`,
        error: error.message,
      };
    }
  }

  // === JSON 파일 저장/조회 API ===

  // KAFA 선수 데이터 크롤링 및 JSON 저장 API
  @Post('scrape-and-save/:league')
  @ApiOperation({
    summary: '🔄 KAFA 선수 데이터 크롤링 및 JSON 저장',
    description: `
    ## 🔄 KAFA 사이트 크롤링 및 JSON 파일 저장

    버튼 클릭으로 실행할 수 있는 크롤링 + 저장 API입니다.
    
    ### 📋 동작 과정
    1. KAFA 사이트에서 최신 선수 데이터 크롤링
    2. 데이터 정제 및 구조화
    3. JSON 파일로 로컬 저장 (\`data/\` 폴더)
    4. 타임스탬프 파일 + 최신 파일 두 개 저장
    
    ### 💾 저장 형태
    - \`kafa-uni-players-latest.json\`: 항상 최신 데이터 (덮어쓰기)
    - \`kafa-uni-players-2025-12-16T10-30-00.json\`: 백업용 타임스탬프 파일
    
    ### 🎯 프론트엔드 연동
    - "최신 데이터 가져오기" 버튼 → 이 API 호출
    - 성공 시 → GET API로 데이터 조회하여 화면 표시
    `,
  })
  @ApiParam({
    name: 'league',
    enum: ['uni', 'soc'],
    description: '리그 구분 (uni: 대학, soc: 사회인)',
    example: 'uni',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 크롤링 및 JSON 저장 성공',
    schema: {
      example: {
        success: true,
        message: '45명의 선수 데이터를 JSON 파일로 저장했습니다.',
        data: {
          league: 'uni',
          savedCount: 45,
          filePath: '/path/to/data/kafa-uni-players-latest.json',
          crawledAt: '2025-12-16T10:30:00.000Z',
        },
      },
    },
  })
  async scrapeAndSaveToJson(@Param('league') league: 'uni' | 'soc') {
    try {
      const result = await this.kafaStatsService.savePlayersToJson(league);

      return {
        success: result.success,
        message: result.message,
        data: {
          league,
          savedCount: result.savedCount,
          filePath: result.filePath,
          crawledAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `크롤링 및 저장 실패: ${error.message}`,
        data: null,
      };
    }
  }

  // JSON 파일에서 선수 데이터 조회 API
  @Get('players-json/:league')
  @ApiOperation({
    summary: '📖 저장된 JSON에서 선수 데이터 조회',
    description: `
    ## 📖 JSON 파일에서 빠른 데이터 조회

    로컬에 저장된 JSON 파일에서 선수 데이터를 즉시 조회합니다.
    크롤링 없이 빠르게 응답하므로 프론트엔드 화면 표시용으로 적합합니다.
    
    ### 🚀 장점
    - 즉시 응답 (크롤링 시간 없음)
    - 네트워크 오류에 영향 받지 않음  
    - KAFA 사이트 부하 없음
    
    ### ⚠️ 주의사항
    - 먼저 \`POST /scrape-and-save/:league\`로 데이터 저장 필요
    - 저장된 파일이 없으면 404 에러 반환
    `,
  })
  @ApiParam({
    name: 'league',
    enum: ['uni', 'soc'],
    description: '리그 구분',
    example: 'uni',
  })
  @ApiResponse({
    status: 200,
    description: '✅ JSON 데이터 조회 성공',
    schema: {
      example: {
        success: true,
        message: '45명의 선수 데이터를 조회했습니다.',
        data: {
          league: 'uni',
          crawledAt: '2025-12-16T10:30:00.000Z',
          totalCount: 45,
          players: [
            {
              rank: 1,
              playerName: '홍길동',
              university: '한양대학교',
              jerseyNumber: 25,
              rushYards: 427,
              yardsPerAttempt: 7.0,
              attempts: 61,
              touchdowns: 4,
              longest: 59,
            },
          ],
        },
      },
    },
  })
  async getPlayersFromJson(@Param('league') league: 'uni' | 'soc') {
    const result = await this.kafaStatsService.getPlayersFromJson(league);

    if (!result.success) {
      return {
        success: false,
        message: result.message,
        data: null,
      };
    }

    return {
      success: true,
      message: result.message,
      data: result.data,
    };
  }

  // 저장된 JSON 파일 목록 조회 API
  @Get('json-files')
  @ApiOperation({
    summary: '📂 저장된 JSON 파일 목록 조회',
    description: `
    ## 📂 로컬에 저장된 모든 JSON 파일 목록

    \`data/\` 폴더에 저장된 모든 KAFA JSON 파일의 목록을 조회합니다.
    파일 크기, 생성 시간 등 메타 정보도 함께 제공합니다.
    
    ### 📋 활용 방안
    - 관리자 페이지에서 저장된 파일 현황 확인
    - 백업 파일 관리
    - 저장 용량 모니터링
    `,
  })
  async getJsonFiles() {
    try {
      const result = await this.kafaStatsService.getJsonFileList();

      return {
        success: result.success,
        message: `${result.files.length}개의 JSON 파일을 찾았습니다.`,
        data: {
          totalFiles: result.files.length,
          files: result.files,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `파일 목록 조회 실패: ${error.message}`,
        data: { files: [] },
      };
    }
  }

  // === 11개 스탯 타입별 JSON 저장/조회 API ===

  // 모든 스탯 타입 크롤링 및 저장 API
  @Post('scrape-all-stats/:league')
  @ApiOperation({
    summary: '🚀 모든 스탯 타입 크롤링 및 JSON 저장',
    description: `
    ## 🚀 11개 모든 스탯 타입을 한번에 크롤링

    RUSHING부터 PUNTING RETURNS까지 11개 스탯을 모두 크롤링하여 각각 별도 JSON 파일로 저장합니다.
    
    ### 📋 크롤링되는 스탯 타입
    1. **RUSHING** (ind_uni1) → \`kafa-uni-rushing.json\`
    2. **PASSING** (ind_uni2) → \`kafa-uni-passing.json\`
    3. **RECEIVING** (ind_uni3) → \`kafa-uni-receiving.json\`
    4. **FUMBLES** (ind_uni4) → \`kafa-uni-fumbles.json\`
    5. **TACKLES** (ind_uni5) → \`kafa-uni-tackles.json\`
    6. **INTERCEPTIONS** (ind_uni6) → \`kafa-uni-interceptions.json\`
    7. **FIELD GOALS** (ind_uni7) → \`kafa-uni-fieldgoals.json\`
    8. **KICKOFFS** (ind_uni8) → \`kafa-uni-kickoffs.json\`
    9. **KICKOFF RETURNS** (ind_uni9) → \`kafa-uni-kickoffreturns.json\`
    10. **PUNTING** (ind_uni10) → \`kafa-uni-punting.json\`
    11. **PUNTING RETURNS** (ind_uni11) → \`kafa-uni-puntreturns.json\`
    
    ### 🎯 장점
    - **포지션별 조회**: QB는 패싱만, RB는 러싱만 필요한 데이터만 가져오기
    - **빠른 응답**: 스탯별로 분리되어 있어 필요한 것만 조회
    - **구조화된 데이터**: 각 스탯 타입에 맞는 필드 구조로 저장
    - **실시간 업데이트**: 버튼 클릭으로 최신 KAFA 데이터 반영
    
    ### ⏱️ 소요 시간
    - 약 15-20초 (11개 페이지 + 1초씩 딜레이)
    - 진행 상황은 서버 로그에서 확인 가능
    `,
  })
  @ApiParam({
    name: 'league',
    enum: ['uni', 'soc'],
    description: '리그 구분 (uni: 대학, soc: 사회인)',
    example: 'uni',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 전체 스탯 크롤링 성공',
    schema: {
      example: {
        success: true,
        message: '11/11개 스탯 타입 크롤링 완료, 총 450명 저장',
        data: {
          league: 'uni',
          totalStats: 11,
          successCount: 11,
          totalPlayers: 450,
          completedAt: '2025-12-16T10:45:00.000Z',
          results: [
            {
              statType: 'rushing',
              success: true,
              count: 45,
              filePath: '/data/kafa-uni-rushing.json',
            },
            {
              statType: 'passing',
              success: true,
              count: 25,
              filePath: '/data/kafa-uni-passing.json',
            },
          ],
        },
      },
    },
  })
  async scrapeAllStatsToJson(@Param('league') league: 'uni' | 'soc') {
    try {
      const startTime = Date.now();
      const result = await this.kafaStatsService.scrapeAllStatsToJson(league);
      const duration = Date.now() - startTime;

      const successCount = result.results.filter((r) => r.success).length;
      const totalPlayers = result.results.reduce((sum, r) => sum + r.count, 0);

      return {
        success: result.success,
        message: result.message,
        data: {
          league,
          totalStats: 11,
          successCount,
          totalPlayers,
          duration: `${Math.round(duration / 1000)}초`,
          completedAt: new Date().toISOString(),
          results: result.results,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `전체 스탯 크롤링 실패: ${error.message}`,
        data: null,
      };
    }
  }

  // 특정 스탯 타입 조회 API
  @Get('stat-json/:league/:statType')
  @ApiOperation({
    summary: '📊 특정 스탯 타입 데이터 조회',
    description: `
    ## 📊 저장된 특정 스탯 타입 데이터 조회

    포지션별로 필요한 스탯만 빠르게 조회할 수 있습니다.
    
    ### 🎯 사용 예시
    - **QB 분석**: \`/stat-json/uni/passing\` → 패싱 스탯만
    - **RB 분석**: \`/stat-json/uni/rushing\` → 러싱 스탯만  
    - **WR 분석**: \`/stat-json/uni/receiving\` → 리시빙 스탯만
    - **K 분석**: \`/stat-json/uni/fieldgoals\` → 필드골 스탯만
    
    ### 📋 사용 가능한 스탯 타입
    - \`rushing\`, \`passing\`, \`receiving\`
    - \`fumbles\`, \`tackles\`, \`interceptions\`
    - \`fieldgoals\`, \`kickoffs\`, \`kickoffreturns\`
    - \`punting\`, \`puntreturns\`
    
    ### ⚡ 성능
    - 즉시 응답 (크롤링 없음)
    - 캐시된 JSON 파일에서 직접 읽기
    - 네트워크 의존 없음
    `,
  })
  @ApiParam({
    name: 'league',
    enum: ['uni', 'soc'],
    description: '리그 구분',
    example: 'uni',
  })
  @ApiParam({
    name: 'statType',
    enum: [
      'rushing',
      'passing',
      'receiving',
      'fumbles',
      'tackles',
      'interceptions',
      'fieldgoals',
      'kickoffs',
      'kickoffreturns',
      'punting',
      'puntreturns',
    ],
    description: '스탯 타입',
    example: 'rushing',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 스탯 데이터 조회 성공',
    schema: {
      example: {
        success: true,
        message: '45명의 RUSHING 데이터를 조회했습니다.',
        data: {
          statType: 'rushing',
          statName: 'RUSHING',
          league: 'uni',
          crawledAt: '2025-12-16T10:45:00Z',
          totalCount: 45,
          players: [
            {
              rank: 1,
              playerName: '김태현',
              university: '고려대학교',
              jerseyNumber: 25,
              rushingYards: 427,
              yardsPerAttempt: 7.0,
              attempts: 61,
              touchdowns: 4,
              longest: 59,
            },
          ],
        },
      },
    },
  })
  async getStatTypeFromJson(
    @Param('league') league: 'uni' | 'soc',
    @Param('statType') statType: string,
  ) {
    const result = await this.kafaStatsService.getStatTypeFromJson(
      league,
      statType,
    );

    return {
      success: result.success,
      message: result.message,
      data: result.data,
    };
  }

  // 저장된 모든 스탯 파일 목록 조회 API
  @Get('all-stat-files')
  @ApiOperation({
    summary: '📂 저장된 모든 스탯 파일 목록 조회',
    description: `
    ## 📂 스탯별로 분리된 모든 JSON 파일 목록

    11개 스탯 타입별로 저장된 JSON 파일들의 목록과 메타 정보를 조회합니다.
    
    ### 📋 제공 정보
    - **파일명**: \`kafa-uni-rushing.json\` 등
    - **스탯 타입**: \`rushing\`, \`passing\` 등
    - **스탯명**: \`RUSHING\`, \`PASSING\` 등  
    - **리그**: \`uni\` 또는 \`soc\`
    - **파일 크기**: KB 단위
    - **생성 시간**: ISO 형식
    - **선수 수**: 해당 스탯의 선수 수
    
    ### 🎯 활용 방안
    - 관리자 대시보드에서 현황 확인
    - 어떤 스탯이 언제 마지막으로 업데이트되었는지 확인
    - 각 스탯별 선수 수 비교
    `,
  })
  @ApiQuery({
    name: 'league',
    required: false,
    enum: ['uni', 'soc'],
    description: '특정 리그만 필터링 (선택사항)',
    example: 'uni',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 스탯 파일 목록 조회 성공',
    schema: {
      example: {
        success: true,
        message: '22개의 스탯 파일을 찾았습니다.',
        data: {
          totalFiles: 22,
          byLeague: {
            uni: 11,
            soc: 11,
          },
          files: [
            {
              fileName: 'kafa-uni-rushing.json',
              statType: 'rushing',
              statName: 'RUSHING',
              league: 'uni',
              size: '15.2 KB',
              createdAt: '2025-12-16T10:45:00.000Z',
              playerCount: 45,
            },
          ],
        },
      },
    },
  })
  async getAllStatFiles(@Query('league') league?: 'uni' | 'soc') {
    try {
      const result = await this.kafaStatsService.getAllStatFiles(league);

      // 리그별 통계 계산
      const byLeague = result.files.reduce(
        (acc, file) => {
          acc[file.league] = (acc[file.league] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        success: result.success,
        message: `${result.files.length}개의 스탯 파일을 찾았습니다.`,
        data: {
          totalFiles: result.files.length,
          byLeague,
          files: result.files,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `스탯 파일 목록 조회 실패: ${error.message}`,
        data: { files: [] },
      };
    }
  }

  // 러싱 스탯 다중 정렬 크롤링 API
  @Post('scrape-rushing-all-sorts/:league')
  @ApiOperation({
    summary: '🏃‍♂️ 러싱 스탯 모든 정렬 방식 크롤링',
    description: `
    ## 🏃‍♂️ 러싱 스탯을 5가지 정렬로 크롤링하여 모든 선수 수집

    기존의 50명 제한을 우회하기 위해 각 정렬 방식별로 크롤링합니다.
    
    ### 📋 크롤링하는 정렬 방식
    1. **RUSH YDS**: 러싱 야드순 (기본)
    2. **YDS/ATT**: 평균 야드순
    3. **ATT**: 시도 횟수순
    4. **TD**: 터치다운순
    5. **LNG**: 최장거리순
    
    ### 🎯 특징
    - **JavaScript 클릭 이벤트**: Puppeteer로 정렬 버튼 클릭
    - **중복 제거**: 선수명+팀명 기준으로 유니크
    - **완전한 데이터**: 모든 러싱 참여 선수 수집
    - **안전한 테스트**: 기존 API 보존
    
    ### ⚠️ 주의사항
    - 크롤링 시간이 기존보다 5배 더 소요될 수 있음
    - 각 정렬별로 3초씩 대기하여 안전하게 크롤링
    `,
  })
  @ApiResponse({
    status: 200,
    description: '✅ 러싱 스탯 다중 정렬 크롤링 성공',
    content: {
      'application/json': {
        schema: {
          example: {
            success: true,
            message: '대학 러싱 스탯을 5가지 정렬로 크롤링 완료',
            data: {
              league: 'uni',
              statType: 'rushing',
              sortMethods: [
                { name: 'RUSH YDS', players: 50, uniquePlayers: 45 },
                { name: 'YDS/ATT', players: 50, uniquePlayers: 38 },
                { name: 'ATT', players: 50, uniquePlayers: 42 },
                { name: 'TD', players: 50, uniquePlayers: 35 },
                { name: 'LNG', players: 50, uniquePlayers: 40 },
              ],
              totalCrawled: 250,
              uniquePlayers: 127,
              duplicatesRemoved: 123,
              processingTime: '45.2s',
              samplePlayers: [
                {
                  rank: 1,
                  playerName: '이효원',
                  university: '한양대학교',
                  jerseyNumber: 7,
                  rushingYards: 485,
                  yardsPerAttempt: 6.8,
                  attempts: 71,
                  touchdowns: 6,
                  longest: 45,
                  foundInSorts: ['YDS/ATT', 'ATT'],
                },
              ],
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '❌ 크롤링 실패',
    content: {
      'application/json': {
        schema: {
          example: {
            success: false,
            message: 'Puppeteer 초기화 실패',
            error: 'Browser launch failed',
          },
        },
      },
    },
  })
  async scrapeRushingAllSorts(@Param('league') league: 'uni' | 'soc') {
    try {
      const startTime = Date.now();

      const result =
        await this.kafaStatsService.scrapeRushingWithAllSorts(league);

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);

      return {
        success: true,
        message: `${league === 'uni' ? '대학' : '사회인'} 러싱 스탯을 5가지 정렬로 크롤링 완료`,
        data: {
          ...result,
          processingTime: `${processingTime}s`,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `러싱 다중 정렬 크롤링 실패: ${error.message}`,
        error: error.message,
      };
    }
  }

  // 패싱 스탯 다중 정렬 크롤링 API
  @Post('scrape-passing-all-sorts/:league')
  @ApiOperation({
    summary: '🏈 패싱 스탯 모든 정렬 방식 크롤링',
    description: `
    ## 🏈 패싱 스탯을 6가지 정렬로 크롤링하여 모든 선수 수집
    기존의 50명 제한을 우회하기 위해 각 정렬 방식별로 크롤링합니다.
    
    ### 📋 크롤링하는 정렬 방식
    1. **PASS YDS**: 패싱 야드순 (기본)
    2. **COMP %**: 패스 성공률순 (정확성 기준)
    3. **ATT**: 패스 시도순 (많이 던지는 QB)
    4. **TD**: 패싱 터치다운순 (득점 능력)
    5. **INT**: 인터셉션 적은순 (안전한 QB)
    6. **LNG**: 최장 패스순 (빅암 QB)

    ### 🎯 목적
    - 기존 컬럼 매핑 오류 해결 (0값 문제 수정)
    - 50명 → 80-100명으로 확장
    - 모든 카테고리별 상위 QB 발견
    
    ### ⚡ 개선사항
    - Chrome/Puppeteer 불필요
    - 기존 검증된 패싱 로직 활용
    - JSON 파일 자동 업데이트
    `,
  })
  @ApiParam({
    name: 'league',
    enum: ['uni', 'soc'],
    description: 'uni: 대학리그, soc: 사회인리그',
  })
  @ApiResponse({
    status: 200,
    description: '크롤링 성공 - 패싱 스탯 다중 정렬 완료',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: '대학 패싱 스탯을 6가지 정렬로 크롤링 완료',
        },
        data: {
          type: 'object',
          properties: {
            league: { type: 'string', example: 'uni' },
            statType: { type: 'string', example: 'passing' },
            uniquePlayers: { type: 'number', example: 85 },
            totalCrawled: { type: 'number', example: 300 },
            duplicatesRemoved: { type: 'number', example: 215 },
            processingTime: { type: 'string', example: '12.4s' },
          },
        },
      },
    },
  })
  async scrapePassingAllSorts(@Param('league') league: 'uni' | 'soc') {
    try {
      const startTime = Date.now();

      const result =
        await this.kafaStatsService.scrapePassingWithAllSorts(league);

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);

      return {
        success: true,
        message: `${league === 'uni' ? '대학' : '사회인'} 패싱 스탯을 6가지 정렬로 크롤링 완료`,
        data: {
          ...result,
          processingTime: `${processingTime}s`,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `패싱 다중 정렬 크롤링 실패: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Post('scrape-receiving-all-sorts/:league')
  @ApiOperation({
    summary: '🏈 리시빙 스탯 모든 정렬 방식 크롤링',
    description: `
    ## 🏈 리시빙 스탯을 5가지 정렬로 크롤링하여 모든 선수 수집
    기존의 50명 제한을 우회하기 위해 각 정렬 방식별로 크롤링합니다.
    
    ### 📋 크롤링하는 정렬 방식
    1. **REC**: 리시빙 횟수순 (캐치 능력)
    2. **REC YDS**: 리시빙 야드순 (야드 생산성)
    3. **AVG**: 리시빙당 야드순 (효율성)
    4. **TD**: 리시빙 터치다운순 (득점 능력)
    5. **LNG**: 최장 리시빙순 (빅플레이 능력)

    ### 🎯 목적
    - 50명 → 80-100명으로 확장
    - 다양한 특성별 상위 리시버 발견
    - 기존 0값 오류 해결
    
    ### ⚡ 특징
    - axios + cheerio 사용
    - 중복 제거 로직
    - JSON 파일 자동 업데이트
    `,
  })
  @ApiParam({
    name: 'league',
    enum: ['uni', 'soc'],
    description: 'uni: 대학리그, soc: 사회인리그',
  })
  @ApiResponse({
    status: 200,
    description: '크롤링 성공 - 리시빙 스탯 다중 정렬 완료',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: '대학 리시빙 스탯을 5가지 정렬로 크롤링 완료',
        },
        data: {
          type: 'object',
          properties: {
            league: { type: 'string', example: 'uni' },
            statType: { type: 'string', example: 'receiving' },
            uniquePlayers: { type: 'number', example: 75 },
            totalCrawled: { type: 'number', example: 250 },
            duplicatesRemoved: { type: 'number', example: 175 },
            processingTime: { type: 'string', example: '10.2s' },
          },
        },
      },
    },
  })
  async scrapeReceivingAllSorts(@Param('league') league: 'uni' | 'soc') {
    try {
      const startTime = Date.now();

      const result =
        await this.kafaStatsService.scrapeReceivingWithAllSorts(league);

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);

      return {
        success: true,
        message: `${league === 'uni' ? '대학' : '사회인'} 리시빙 스탯을 5가지 정렬로 크롤링 완료`,
        data: {
          ...result,
          processingTime: `${processingTime}s`,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `리시빙 다중 정렬 크롤링 실패: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Post('scrape-fumbles-all-sorts/:league')
  @ApiOperation({
    summary: '🏈 펌블 스탯 모든 정렬 방식 크롤링',
    description: `
    ## 🏈 펌블 스탯을 3가지 정렬로 크롤링하여 모든 선수 수집
    기존의 50명 제한을 우회하기 위해 각 정렬 방식별로 크롤링합니다.
    
    ### 📋 크롤링하는 정렬 방식
    1. **FF**: 강제 펌블순 (수비수들의 펌블 유발 능력)
    2. **FR**: 펌블 회수순 (펌블 볼 회수 능력)
    3. **TD**: 펌블 회수 터치다운순 (회수 후 득점)

    ### 🎯 목적
    - 50명 → 60-80명으로 확장
    - 다양한 수비 특성별 상위 선수 발견
    - 기존 0값 오류 해결
    
    ### ⚡ 특징
    - axios + cheerio 사용
    - 중복 제거 로직
    - JSON 파일 자동 업데이트
    `
  })
  @ApiParam({
    name: 'league',
    enum: ['uni', 'soc'],
    description: 'uni: 대학리그, soc: 사회인리그'
  })
  @ApiResponse({
    status: 200,
    description: '크롤링 성공 - 펌블 스탯 다중 정렬 완료',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '대학 펌블 스탯을 3가지 정렬로 크롤링 완료' },
        data: {
          type: 'object',
          properties: {
            league: { type: 'string', example: 'uni' },
            statType: { type: 'string', example: 'fumbles' },
            uniquePlayers: { type: 'number', example: 65 },
            totalCrawled: { type: 'number', example: 150 },
            duplicatesRemoved: { type: 'number', example: 85 },
            processingTime: { type: 'string', example: '4.2s' }
          }
        }
      }
    }
  })
  async scrapeFumblesAllSorts(@Param('league') league: 'uni' | 'soc') {
    try {
      const startTime = Date.now();
      
      const result = await this.kafaStatsService.scrapeFumblesWithAllSorts(league);
      
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      return {
        success: true,
        message: `${league === 'uni' ? '대학' : '사회인'} 펌블 스탯을 3가지 정렬로 크롤링 완료`,
        data: {
          ...result,
          processingTime: `${processingTime}s`
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `펌블 다중 정렬 크롤링 실패: ${error.message}`,
        error: error.message
      };
    }
  }

  @Post('scrape-tackles-all-sorts/:league')
  @ApiOperation({
    summary: '🏈 태클 스탯 모든 정렬 방식 크롤링',
    description: `
    ## 🏈 태클 스탯을 4가지 정렬로 크롤링하여 모든 선수 수집
    기존의 50명 제한을 우회하기 위해 각 정렬 방식별로 크롤링합니다.
    
    ### 📋 크롤링하는 정렬 방식
    1. **TOT**: 총 태클순 (전체 수비 기여도)
    2. **SACKS**: 색순 (QB 사이킹 전문)
    3. **SOLO**: 단독 태클순 (1대1 수비 능력)
    4. **AST**: 어시스트 태클순 (팀워크 수비)

    ### 🎯 목적
    - 50명 → 80-120명으로 확장
    - 다양한 수비 특성별 상위 선수 발견
    - 기존 0값 오류 해결
    
    ### ⚡ 특징
    - axios + cheerio 사용
    - 중복 제거 로직
    - JSON 파일 자동 업데이트
    `
  })
  @ApiParam({
    name: 'league',
    enum: ['uni', 'soc'],
    description: 'uni: 대학리그, soc: 사회인리그'
  })
  @ApiResponse({
    status: 200,
    description: '크롤링 성공 - 태클 스탯 다중 정렬 완료',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '대학 태클 스탯을 4가지 정렬로 크롤링 완료' },
        data: {
          type: 'object',
          properties: {
            league: { type: 'string', example: 'uni' },
            statType: { type: 'string', example: 'tackles' },
            uniquePlayers: { type: 'number', example: 95 },
            totalCrawled: { type: 'number', example: 200 },
            duplicatesRemoved: { type: 'number', example: 105 },
            processingTime: { type: 'string', example: '7.8s' }
          }
        }
      }
    }
  })
  async scrapeTacklesAllSorts(@Param('league') league: 'uni' | 'soc') {
    try {
      const startTime = Date.now();
      
      const result = await this.kafaStatsService.scrapeTacklesWithAllSorts(league);
      
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      return {
        success: true,
        message: `${league === 'uni' ? '대학' : '사회인'} 태클 스탯을 4가지 정렬로 크롤링 완료`,
        data: {
          ...result,
          processingTime: `${processingTime}s`
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `태클 다중 정렬 크롤링 실패: ${error.message}`,
        error: error.message
      };
    }
  }

  @Post('scrape-interceptions-all-sorts/:league')
  @ApiOperation({
    summary: '🏈 인터셉션 스탯 모든 정렬 방식 크롤링',
    description: `
    ## 🏈 인터셉션 스탯을 4가지 정렬로 크롤링하여 모든 선수 수집
    기존의 50명 제한을 우회하기 위해 각 정렬 방식별로 크롤링합니다.
    
    ### 📋 크롤링하는 정렬 방식
    1. **INT**: 인터셉션 개수순 (패스 차단 능력)
    2. **TD**: 인터셉션 터치다운순 (픽식스 득점)
    3. **YDS**: 인터셉션 리턴 야드순 (리턴 능력)
    4. **LNG**: 최장 인터셉션 리턴순 (빅플레이 능력)

    ### 🎯 목적
    - 50명 → 70-100명으로 확장
    - 다양한 수비 특성별 상위 선수 발견
    - 기존 0값 오류 해결
    
    ### ⚡ 특징
    - axios + cheerio 사용
    - 중복 제거 로직
    - JSON 파일 자동 업데이트
    `
  })
  @ApiParam({
    name: 'league',
    enum: ['uni', 'soc'],
    description: 'uni: 대학리그, soc: 사회인리그'
  })
  @ApiResponse({
    status: 200,
    description: '크롤링 성공 - 인터셉션 스탯 다중 정렬 완료',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '대학 인터셉션 스탯을 4가지 정렬로 크롤링 완료' },
        data: {
          type: 'object',
          properties: {
            league: { type: 'string', example: 'uni' },
            statType: { type: 'string', example: 'interceptions' },
            uniquePlayers: { type: 'number', example: 85 },
            totalCrawled: { type: 'number', example: 200 },
            duplicatesRemoved: { type: 'number', example: 115 },
            processingTime: { type: 'string', example: '6.4s' }
          }
        }
      }
    }
  })
  async scrapeInterceptionsAllSorts(@Param('league') league: 'uni' | 'soc') {
    try {
      const startTime = Date.now();
      
      const result = await this.kafaStatsService.scrapeInterceptionsWithAllSorts(league);
      
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      return {
        success: true,
        message: `${league === 'uni' ? '대학' : '사회인'} 인터셉션 스탯을 4가지 정렬로 크롤링 완료`,
        data: {
          ...result,
          processingTime: `${processingTime}s`
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `인터셉션 다중 정렬 크롤링 실패: ${error.message}`,
        error: error.message
      };
    }
  }

  @Post('scrape-fieldgoals-all-sorts/:league')
  @ApiOperation({
    summary: '🏈 필드골 스탯 모든 정렬 방식 크롤링',
    description: `
    ## 🏈 필드골 스탯을 6가지 정렬로 크롤링하여 모든 선수 수집
    기존의 50명 제한을 우회하기 위해 각 정렬 방식별로 크롤링합니다.
    
    ### 📋 크롤링하는 정렬 방식
    1. **FG%**: 필드골 성공률순 (정확도)
    2. **AVG**: 평균 야드순 (킥킹 거리)
    3. **FGM**: 필드골 성공 개수순 (득점 기여)
    4. **ATT**: 시도 횟수순 (킥킹 빈도)
    5. **YDS**: 총 야드순 (전체 거리)
    6. **LNG**: 최장거리순 (킥킹 파워)

    ### 🎯 목적
    - 50명 → 70-100명으로 확장
    - 다양한 킥킹 특성별 상위 선수 발견
    - 기존 0값 오류 해결
    
    ### ⚡ 특징
    - axios + cheerio 사용
    - 중복 제거 로직
    - JSON 파일 자동 업데이트
    `
  })
  @ApiParam({
    name: 'league',
    enum: ['uni', 'soc'],
    description: 'uni: 대학리그, soc: 사회인리그'
  })
  @ApiResponse({
    status: 200,
    description: '크롤링 성공 - 필드골 스탯 다중 정렬 완료',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '대학 필드골 스탯을 6가지 정렬로 크롤링 완료' },
        data: {
          type: 'object',
          properties: {
            league: { type: 'string', example: 'uni' },
            statType: { type: 'string', example: 'fieldgoals' },
            uniquePlayers: { type: 'number', example: 75 },
            totalCrawled: { type: 'number', example: 300 },
            duplicatesRemoved: { type: 'number', example: 225 },
            processingTime: { type: 'string', example: '8.2s' }
          }
        }
      }
    }
  })
  async scrapeFieldGoalsAllSorts(@Param('league') league: 'uni' | 'soc') {
    try {
      const startTime = Date.now();
      
      const result = await this.kafaStatsService.scrapeFieldGoalsWithAllSorts(league);
      
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      return {
        success: true,
        message: `${league === 'uni' ? '대학' : '사회인'} 필드골 스탯을 6가지 정렬로 크롤링 완료`,
        data: {
          ...result,
          processingTime: `${processingTime}s`
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `필드골 다중 정렬 크롤링 실패: ${error.message}`,
        error: error.message
      };
    }
  }

  @Post('scrape-kickoffs-all-sorts/:league')
  @ApiOperation({
    summary: '🏈 킥오프 스탯 모든 정렬 방식 크롤링',
    description: `
    ## 🏈 킥오프 스탯을 5가지 정렬로 크롤링하여 모든 선수 수집
    기존의 50명 제한을 우회하기 위해 각 정렬 방식별로 크롤링합니다.
    
    ### 📋 크롤링하는 정렬 방식
    1. **AVG**: 평균 야드순 (킥오프 거리)
    2. **KO**: 킥오프 횟수순 (킥킹 빈도)
    3. **YDS**: 총 야드순 (전체 거리)
    4. **TD**: 터치다운순 (킥오프 TD)
    5. **LNG**: 최장거리순 (킥킹 파워)

    ### 🎯 목적
    - 50명 → 70-100명으로 확장
    - 다양한 킥킹 특성별 상위 선수 발견
    - 기존 0값 오류 해결
    
    ### ⚡ 특징
    - axios + cheerio 사용
    - 중복 제거 로직
    - JSON 파일 자동 업데이트
    `
  })
  @ApiParam({
    name: 'league',
    enum: ['uni', 'soc'],
    description: 'uni: 대학리그, soc: 사회인리그'
  })
  @ApiResponse({
    status: 200,
    description: '크롤링 성공 - 킥오프 스탯 다중 정렬 완료',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '대학 킥오프 스탯을 5가지 정렬로 크롤링 완료' },
        data: {
          type: 'object',
          properties: {
            league: { type: 'string', example: 'uni' },
            statType: { type: 'string', example: 'kickoffs' },
            uniquePlayers: { type: 'number', example: 85 },
            totalCrawled: { type: 'number', example: 250 },
            duplicatesRemoved: { type: 'number', example: 165 },
            processingTime: { type: 'string', example: '5.2s' }
          }
        }
      }
    }
  })
  async scrapeKickoffsAllSorts(@Param('league') league: 'uni' | 'soc') {
    try {
      const startTime = Date.now();
      
      const result = await this.kafaStatsService.scrapeKickoffsWithAllSorts(league);
      
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      return {
        success: true,
        message: `${league === 'uni' ? '대학' : '사회인'} 킥오프 스탯을 5가지 정렬로 크롤링 완료`,
        data: {
          ...result,
          processingTime: `${processingTime}s`
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `킥오프 다중 정렬 크롤링 실패: ${error.message}`,
        error: error.message
      };
    }
  }

  @Post('scrape-kickoffreturns-all-sorts/:league')
  @ApiOperation({
    summary: '🏈 킥오프 리턴 스탯 모든 정렬 방식 크롤링',
    description: `
    ## 🏈 킥오프 리턴 스탯을 5가지 정렬로 크롤링하여 모든 선수 수집
    기존의 50명 제한을 우회하기 위해 각 정렬 방식별로 크롤링합니다.
    
    ### 📋 크롤링하는 정렬 방식
    1. **AVG**: 평균 야드순 (리턴 거리)
    2. **RET**: 킥오프 리턴 횟수순 (리턴 빈도)
    3. **YDS**: 총 리턴 야드순 (전체 거리)
    4. **TD**: 터치다운순 (리턴 TD)
    5. **LNG**: 최장 리턴순 (리턴 파워)

    ### 🎯 목적
    - 50명 → 70-100명으로 확장
    - 다양한 리턴 특성별 상위 선수 발견
    - 기존 0값 오류 해결
    
    ### ⚡ 특징
    - axios + cheerio 사용
    - 중복 제거 로직
    - JSON 파일 자동 업데이트
    `
  })
  @ApiParam({
    name: 'league',
    enum: ['uni', 'soc'],
    description: 'uni: 대학리그, soc: 사회인리그'
  })
  @ApiResponse({
    status: 200,
    description: '크롤링 성공 - 킥오프 리턴 스탯 다중 정렬 완료',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '대학 킥오프 리턴 스탯을 5가지 정렬로 크롤링 완료' },
        data: {
          type: 'object',
          properties: {
            league: { type: 'string', example: 'uni' },
            statType: { type: 'string', example: 'kickoffreturns' },
            uniquePlayers: { type: 'number', example: 75 },
            totalCrawled: { type: 'number', example: 250 },
            duplicatesRemoved: { type: 'number', example: 175 },
            processingTime: { type: 'string', example: '4.8s' }
          }
        }
      }
    }
  })
  async scrapeKickoffReturnsAllSorts(@Param('league') league: 'uni' | 'soc') {
    try {
      const startTime = Date.now();
      
      const result = await this.kafaStatsService.scrapeKickoffReturnsWithAllSorts(league);
      
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      return {
        success: true,
        message: `${league === 'uni' ? '대학' : '사회인'} 킥오프 리턴 스탯을 5가지 정렬로 크롤링 완료`,
        data: {
          ...result,
          processingTime: `${processingTime}s`
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `킥오프 리턴 다중 정렬 크롤링 실패: ${error.message}`,
        error: error.message
      };
    }
  }

  @Post('scrape-punts-all-sorts/:league')
  @ApiOperation({
    summary: '🏈 펀트 스탯 모든 정렬 방식 크롤링',
    description: `
    ## 🏈 펀트 스탯을 5가지 정렬로 크롤링하여 모든 선수 수집
    기존의 50명 제한을 우회하기 위해 각 정렬 방식별로 크롤링합니다.
    
    ### 📋 크롤링하는 정렬 방식
    1. **AVG**: 평균 야드순 (펀팅 거리)
    2. **PUNTS**: 펀트 횟수순 (펀팅 빈도)
    3. **YDS**: 총 야드순 (전체 거리)
    4. **TD**: 터치다운순 (펀트 TD)
    5. **LNG**: 최장거리순 (펀팅 파워)

    ### 🎯 목적
    - 50명 → 70-100명으로 확장
    - 다양한 펀팅 특성별 상위 선수 발견
    - 기존 0값 오류 해결
    
    ### ⚡ 특징
    - axios + cheerio 사용
    - 중복 제거 로직
    - JSON 파일 자동 업데이트
    `
  })
  @ApiParam({
    name: 'league',
    enum: ['uni', 'soc'],
    description: 'uni: 대학리그, soc: 사회인리그'
  })
  @ApiResponse({
    status: 200,
    description: '크롤링 성공 - 펀트 스탯 다중 정렬 완료',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '대학 펀트 스탯을 5가지 정렬로 크롤링 완료' },
        data: {
          type: 'object',
          properties: {
            league: { type: 'string', example: 'uni' },
            statType: { type: 'string', example: 'punts' },
            uniquePlayers: { type: 'number', example: 65 },
            totalCrawled: { type: 'number', example: 250 },
            duplicatesRemoved: { type: 'number', example: 185 },
            processingTime: { type: 'string', example: '5.8s' }
          }
        }
      }
    }
  })
  async scrapePuntsAllSorts(@Param('league') league: 'uni' | 'soc') {
    try {
      const startTime = Date.now();
      
      const result = await this.kafaStatsService.scrapePuntsWithAllSorts(league);
      
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      return {
        success: true,
        message: `${league === 'uni' ? '대학' : '사회인'} 펀트 스탯을 5가지 정렬로 크롤링 완료`,
        data: {
          ...result,
          processingTime: `${processingTime}s`
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `펀트 다중 정렬 크롤링 실패: ${error.message}`,
        error: error.message
      };
    }
  }

  @Post('scrape-puntreturns-all-sorts/:league')
  @ApiOperation({
    summary: '🏈 펀트 리턴 스탯 모든 정렬 방식 크롤링',
    description: `
    ## 🏈 펀트 리턴 스탯을 5가지 정렬로 크롤링하여 모든 선수 수집
    기존의 50명 제한을 우회하기 위해 각 정렬 방식별로 크롤링합니다.
    
    ### 📋 크롤링하는 정렬 방식
    1. **AVG**: 평균 야드순 (리턴 거리)
    2. **RET**: 펀트 리턴 횟수순 (리턴 빈도)
    3. **YDS**: 총 리턴 야드순 (전체 거리)
    4. **TD**: 터치다운순 (리턴 TD)
    5. **LNG**: 최장 리턴순 (리턴 파워)

    ### 🎯 목적
    - 50명 → 70-100명으로 확장
    - 다양한 리턴 특성별 상위 선수 발견
    - 기존 0값 오류 해결
    
    ### ⚡ 특징
    - axios + cheerio 사용
    - 중복 제거 로직
    - JSON 파일 자동 업데이트
    `
  })
  @ApiParam({
    name: 'league',
    enum: ['uni', 'soc'],
    description: 'uni: 대학리그, soc: 사회인리그'
  })
  @ApiResponse({
    status: 200,
    description: '크롤링 성공 - 펀트 리턴 스탯 다중 정렬 완료',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '대학 펀트 리턴 스탯을 5가지 정렬로 크롤링 완료' },
        data: {
          type: 'object',
          properties: {
            league: { type: 'string', example: 'uni' },
            statType: { type: 'string', example: 'puntreturns' },
            uniquePlayers: { type: 'number', example: 80 },
            totalCrawled: { type: 'number', example: 250 },
            duplicatesRemoved: { type: 'number', example: 170 },
            processingTime: { type: 'string', example: '5.1s' }
          }
        }
      }
    }
  })
  async scrapePuntReturnsAllSorts(@Param('league') league: 'uni' | 'soc') {
    try {
      const startTime = Date.now();
      
      const result = await this.kafaStatsService.scrapePuntReturnsWithAllSorts(league);
      
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      return {
        success: true,
        message: `${league === 'uni' ? '대학' : '사회인'} 펀트 리턴 스탯을 5가지 정렬로 크롤링 완료`,
        data: {
          ...result,
          processingTime: `${processingTime}s`
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `펀트 리턴 다중 정렬 크롤링 실패: ${error.message}`,
        error: error.message
      };
    }
  }
}
