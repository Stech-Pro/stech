import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { KafaLeague, KafaLeagueDocument } from '../schemas/kafa-league.schema';
import { KafaMatch, KafaMatchDocument } from '../schemas/kafa-match.schema';

@Injectable()
export class KafaV2CrawlerService {
  private readonly logger = new Logger(KafaV2CrawlerService.name);
  private readonly loginCredentials = {
    username: 'stech',
    password: 'stechpro1234',
  };

  constructor(
    @InjectModel(KafaLeague.name)
    private kafaLeagueModel: Model<KafaLeagueDocument>,
    @InjectModel(KafaMatch.name)
    private kafaMatchModel: Model<KafaMatchDocument>,
  ) {}

  /**
   * 1단계: KAFA 사이트에서 모든 리그 목록을 크롤링합니다
   */
  async crawlAllLeagues(): Promise<void> {
    try {
      this.logger.log('🏈 STEP 1: 리그 목록 크롤링 시작...');

      // 1. 로그인된 axios 인스턴스 생성
      const axiosInstance = await this.createAuthenticatedAxios();

      // 2. 리그 목록 페이지에서 모든 리그 크롤링 (페이지네이션 포함)
      const leagues = await this.crawlLeagueListPages(axiosInstance);

      this.logger.log(`🔍 총 ${leagues.length}개 리그 발견`);

      // 3. DB에 저장
      for (const league of leagues) {
        await this.saveOrUpdateLeague(league);
      }

      this.logger.log(`✅ STEP 1 완료: ${leagues.length}개 리그 저장됨`);
    } catch (error) {
      this.logger.error('❌ 리그 목록 크롤링 실패:', error.message);
      throw error;
    }
  }

  /**
   * 2단계: 특정 리그의 모든 경기 목록을 크롤링합니다
   */
  async crawlMatchesForLeague(leagueId: number): Promise<void> {
    try {
      this.logger.log(`🏈 STEP 2: 리그 ${leagueId}의 경기 목록 크롤링 시작...`);

      // 1. 로그인된 axios 인스턴스 생성
      const axiosInstance = await this.createAuthenticatedAxios();

      // 2. 해당 리그의 모든 페이지에서 경기 목록 크롤링
      const matches = await this.crawlMatchListForLeague(
        leagueId,
        axiosInstance,
      );

      this.logger.log(`🔍 리그 ${leagueId}에서 ${matches.length}개 경기 발견`);

      // 3. DB에 저장 (matchIndex 순서대로)
      for (let i = 0; i < matches.length; i++) {
        const matchData = {
          ...matches[i],
          leagueId,
          matchIndex: i + 1, // 1부터 시작
        };
        await this.saveOrUpdateMatch(matchData);
      }

      // 4. 리그 통계 업데이트
      await this.updateLeagueStats(leagueId, matches.length);

      this.logger.log(
        `✅ STEP 2 완료: 리그 ${leagueId}에 ${matches.length}개 경기 저장됨`,
      );
    } catch (error) {
      this.logger.error(
        `❌ 리그 ${leagueId} 경기 목록 크롤링 실패:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * 3단계: 특정 경기의 상세 정보를 크롤링합니다
   */
  async crawlMatchDetails(leagueId: number, matchIndex: number): Promise<void> {
    try {
      this.logger.log(
        `🏈 STEP 3: 리그 ${leagueId}의 경기 ${matchIndex} 상세 정보 크롤링...`,
      );

      // 1. 로그인된 axios 인스턴스 생성
      const axiosInstance = await this.createAuthenticatedAxios();

      // 2. 리그의 경기 목록에서 해당 경기의 실제 KAFA matchId 찾기
      const kafaMatchId = await this.findKafaMatchId(
        leagueId,
        matchIndex,
        axiosInstance,
      );

      if (!kafaMatchId) {
        throw new Error(
          `리그 ${leagueId}의 경기 ${matchIndex}를 찾을 수 없습니다.`,
        );
      }

      // 3. 경기 상세 정보 크롤링
      const detailData = await this.crawlSingleMatchDetail(
        kafaMatchId,
        axiosInstance,
      );

      // 4. DB 업데이트
      await this.kafaMatchModel.updateOne(
        { leagueId, matchIndex },
        {
          $set: {
            ...detailData,
            status: 'crawled',
            crawledAt: new Date(),
            lastUpdatedAt: new Date(),
          },
        },
      );

      this.logger.log(
        `✅ STEP 3 완료: 리그 ${leagueId} 경기 ${matchIndex} 상세 정보 저장됨`,
      );
    } catch (error) {
      this.logger.error(
        `❌ 리그 ${leagueId} 경기 ${matchIndex} 상세 크롤링 실패:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * 로그인된 axios 인스턴스를 생성합니다
   */
  private async createAuthenticatedAxios(): Promise<any> {
    const cookieJar = new CookieJar();
    const axiosInstance = wrapper(
      axios.create({
        jar: cookieJar,
        withCredentials: true,
        timeout: 15000,
      }),
    );

    // 로그인 수행
    const loginPageResponse = await axiosInstance.get(
      'https://www.kafa.org/member/login.html',
    );
    const $loginPage = cheerio.load(loginPageResponse.data);

    const loginData = {
      login_mode: $loginPage('input[name="login_mode"]').val() || '',
      login_url: $loginPage('input[name="login_url"]').val() || '',
      U_id: this.loginCredentials.username,
      U_pass: this.loginCredentials.password,
    };

    await axiosInstance.post(
      'https://www.kafa.org/member/login.html',
      loginData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Referer: 'https://www.kafa.org/member/login.html',
        },
      },
    );

    return axiosInstance;
  }

  /**
   * 리그 목록 페이지들을 크롤링합니다
   */
  private async crawlLeagueListPages(axiosInstance: any): Promise<any[]> {
    const allLeagues = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      try {
        const url = `https://www.kafa.org/subadmin/match_result.html?page=${currentPage}`;
        this.logger.log(`📄 리그 목록 페이지 ${currentPage}: ${url}`);

        const response = await axiosInstance.get(url);
        const $ = cheerio.load(response.data);

        // 해당 페이지의 리그 목록 파싱
        const pageLeagues = this.parseLeagueList($);

        if (pageLeagues.length === 0) {
          this.logger.log(`📄 페이지 ${currentPage}: 리그 없음 - 크롤링 종료`);
          hasMorePages = false;
        } else {
          allLeagues.push(...pageLeagues);
          this.logger.log(
            `📄 페이지 ${currentPage}: ${pageLeagues.length}개 리그 발견`,
          );

          // 다음 페이지 확인
          const hasNext = this.checkHasNextPage($, currentPage);

          if (hasNext && currentPage < 50) {
            // 무한루프 방지
            currentPage++;
            await this.delay(1000);
          } else {
            hasMorePages = false;
          }
        }
      } catch (error) {
        this.logger.error(
          `❌ 리그 목록 페이지 ${currentPage} 크롤링 실패:`,
          error.message,
        );
        hasMorePages = false;
      }
    }

    return allLeagues;
  }

  /**
   * 리그 목록을 파싱합니다
   */
  private parseLeagueList($: any): any[] {
    const leagues = [];

    $('table tr').each((i, row) => {
      const $row = $(row);
      const cells = $row.find('td');

      if (cells.length >= 4) {
        const displayNumber = $row.find('td:first-child').text().trim();
        const name = $row.find('td:nth-child(2)').text().trim();
        const division = $row.find('td:nth-child(3)').text().trim();
        const category = $row.find('td:nth-child(4)').text().trim();

        // 실제 L_l_index를 링크에서 추출
        let actualLeagueId = null;

        // 경기결과 링크에서 L_l_index 파라미터 추출
        const resultLink = $row.find('a[href*="match_list.html"]');
        if (resultLink.length > 0) {
          const href = resultLink.attr('href');
          const match = href.match(/L_l_index=(\d+)/);
          if (match) {
            actualLeagueId = parseInt(match[1]);
          }
        }

        // 링크가 없으면 다른 방법으로 찾기
        if (!actualLeagueId) {
          $row.find('a').each((j, link) => {
            const href = $(link).attr('href');
            if (href && href.includes('L_l_index=')) {
              const match = href.match(/L_l_index=(\d+)/);
              if (match) {
                actualLeagueId = parseInt(match[1]);
                return false; // break
              }
            }
          });
        }

        if (actualLeagueId && name && name !== '리그명') {
          const displayNum = parseInt(displayNumber);

          this.logger.debug(
            `✅ 리그 발견: 화면번호=${displayNumber}, 실제ID=${actualLeagueId}, 이름=${name}`,
          );

          leagues.push({
            leagueId: actualLeagueId, // 실제 L_l_index 사용
            displayNumber: !isNaN(displayNum) ? displayNum : null, // 화면 표시 번호 (유효하지 않으면 null)
            name,
            category,
            division: division || '대학',
            sportType: '택클풋볼',
            status: 'active',
          });
        } else {
          this.logger.debug(
            `⚠️ 리그 정보 불완전: 화면번호=${displayNumber}, 실제ID=${actualLeagueId}, 이름=${name} - 건너뜀`,
          );
        }
      }
    });

    this.logger.log(`📊 유효한 리그 ${leagues.length}개 파싱 완료`);
    return leagues;
  }

  /**
   * 특정 리그의 경기 목록을 크롤링합니다
   */
  private async crawlMatchListForLeague(
    leagueId: number,
    axiosInstance: any,
  ): Promise<any[]> {
    const allMatches = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      try {
        // KAFA URL 구조: /match_list.html?page=1&L_l_index=21
        const url = `https://www.kafa.org/subadmin/match_list.html?page=${currentPage}&L_l_index=${leagueId}&return_str=&search_type=&search_str=`;
        this.logger.log(`📄 리그 ${leagueId} 페이지 ${currentPage}: ${url}`);

        const response = await axiosInstance.get(url);
        const $ = cheerio.load(response.data);

        // 경기 목록 파싱
        const pageMatches = this.parseMatchList($);

        if (pageMatches.length === 0) {
          this.logger.log(
            `📄 리그 ${leagueId} 페이지 ${currentPage}: 경기 없음 - 크롤링 종료`,
          );
          hasMorePages = false;
        } else {
          allMatches.push(...pageMatches);
          this.logger.log(
            `📄 리그 ${leagueId} 페이지 ${currentPage}: ${pageMatches.length}개 경기 발견`,
          );

          // 다음 페이지 확인
          const hasNext = this.checkHasNextPage($, currentPage);

          if (hasNext && currentPage < 50) {
            // 무한루프 방지
            currentPage++;
            await this.delay(1000);
          } else {
            hasMorePages = false;
          }
        }
      } catch (error) {
        this.logger.error(
          `❌ 리그 ${leagueId} 페이지 ${currentPage} 크롤링 실패:`,
          error.message,
        );
        hasMorePages = false;
      }
    }

    return allMatches;
  }

  /**
   * 경기 목록을 파싱합니다
   */
  private parseMatchList($: any): any[] {
    const matches = [];

    $('table tr').each((i, row) => {
      const $row = $(row);
      const cells = $row.find('td');

      if (cells.length >= 5) {
        // 첫 번째 셀에서 경기 번호 확인
        const matchNumberText = $row.find('td:first-child').text().trim();
        const matchNumber = parseInt(matchNumberText);

        // 경기 번호가 유효한 숫자인지 확인 (헤더나 기타 행 제외)
        if (!isNaN(matchNumber) && matchNumber > 0) {
          const gameDate = $row.find('td:nth-child(2)').text().trim();
          const venue = $row.find('td:nth-child(3)').text().trim();
          const homeTeamText = $row.find('td:nth-child(4)').text().trim();
          const awayTeamText = $row.find('td:nth-child(5)').text().trim();

          // 모든 필드가 유효한지 확인
          if (
            gameDate &&
            venue &&
            homeTeamText &&
            awayTeamText &&
            gameDate !== '경기날짜' &&
            venue !== '장소' &&
            homeTeamText !== 'HOME' &&
            awayTeamText !== 'AWAY'
          ) {
            this.logger.debug(
              `✅ 경기 ${matchNumber}: ${homeTeamText} vs ${awayTeamText} (${gameDate})`,
            );

            matches.push({
              kafaMatchNumber: matchNumber, // KAFA 사이트의 원본 경기 번호 저장
              gameDate,
              venue,
              homeTeam: this.parseTeamInfo(homeTeamText),
              awayTeam: this.parseTeamInfo(awayTeamText),
              status: 'scheduled',
            });
          } else {
            this.logger.debug(`⚠️ 경기 ${matchNumber}: 데이터 불완전 - 건너뜀`);
          }
        } else {
          this.logger.debug(
            `⚠️ 유효하지 않은 경기 번호: "${matchNumberText}" - 건너뜀`,
          );
        }
      }
    });

    // KAFA 사이트의 경기 번호 순서대로 정렬 (내림차순: 최신 경기가 먼저)
    matches.sort((a, b) => b.kafaMatchNumber - a.kafaMatchNumber);

    this.logger.log(`📊 유효한 경기 ${matches.length}개 파싱 완료`);
    return matches;
  }

  /**
   * 팀 정보를 파싱합니다
   */
  private parseTeamInfo(teamText: string): any {
    const teamNameMap: Record<string, string> = {
      한양대학교: 'HY',
      연세대학교: 'YS',
      고려대학교: 'KU',
      서울대학교: 'SU',
      서울시립대학교: 'UOS',
      건국대학교: 'KU',
      국민대학교: 'KMU',
      홍익대학교: 'HIU',
    };

    const parts = teamText.split(' ');
    const name = parts[0] || teamText;
    const initial = teamNameMap[name] || name.substring(0, 2).toUpperCase();

    return {
      name,
      initial,
      fullName: teamText,
    };
  }

  /**
   * 다음 페이지가 있는지 확인합니다
   */
  private checkHasNextPage($: any, currentPage: number): boolean {
    let hasNext = false;

    // 1. 다음 페이지 직접 링크 확인
    $('a').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && href.includes(`page=${currentPage + 1}`)) {
        hasNext = true;
        return false; // break
      }
    });

    // 2. "다음" 버튼 확인
    if (!hasNext) {
      const nextButton =
        $('a:contains("다음")').length > 0 ||
        $('a:contains("Next")').length > 0 ||
        $('a:contains(">")').filter((i, elem) => {
          const href = $(elem).attr('href');
          return href && href.includes('page=');
        }).length > 0;
      if (nextButton) hasNext = true;
    }

    return hasNext;
  }

  /**
   * 특정 리그, 경기 순번의 실제 KAFA matchId를 찾습니다
   */
  private async findKafaMatchId(
    leagueId: number,
    matchIndex: number,
    axiosInstance: any,
  ): Promise<number | null> {
    // 이 부분은 match_list.html에서 각 경기 행의 링크를 파싱해서 실제 matchId를 추출해야 함
    // 추후 구현 필요
    return null;
  }

  /**
   * 단일 경기의 상세 정보를 크롤링합니다
   */
  private async crawlSingleMatchDetail(
    kafaMatchId: number,
    axiosInstance: any,
  ): Promise<any> {
    // KafaMatchInfoService와 유사한 로직으로 구현
    // 추후 구현 필요
    return {};
  }

  /**
   * 리그 정보를 저장하거나 업데이트합니다
   */
  private async saveOrUpdateLeague(leagueData: any): Promise<void> {
    const existingLeague = await this.kafaLeagueModel.findOne({
      leagueId: leagueData.leagueId,
    });

    if (existingLeague) {
      await this.kafaLeagueModel.updateOne(
        { leagueId: leagueData.leagueId },
        { $set: { ...leagueData, lastUpdatedAt: new Date() } },
      );
      this.logger.log(`📝 리그 ${leagueData.leagueId} 업데이트됨`);
    } else {
      await this.kafaLeagueModel.create({
        ...leagueData,
        lastUpdatedAt: new Date(),
      });
      this.logger.log(
        `🆕 새 리그 ${leagueData.leagueId} 생성됨: ${leagueData.name}`,
      );
    }
  }

  /**
   * 경기 정보를 저장하거나 업데이트합니다
   */
  private async saveOrUpdateMatch(matchData: any): Promise<void> {
    const existingMatch = await this.kafaMatchModel.findOne({
      leagueId: matchData.leagueId,
      matchIndex: matchData.matchIndex,
    });

    if (existingMatch) {
      await this.kafaMatchModel.updateOne(
        { leagueId: matchData.leagueId, matchIndex: matchData.matchIndex },
        { $set: { ...matchData, lastUpdatedAt: new Date() } },
      );
      this.logger.log(
        `📝 리그 ${matchData.leagueId} 경기 ${matchData.matchIndex} 업데이트됨`,
      );
    } else {
      await this.kafaMatchModel.create({
        ...matchData,
        lastUpdatedAt: new Date(),
      });
      this.logger.log(
        `🆕 새 경기 생성됨: 리그 ${matchData.leagueId} 경기 ${matchData.matchIndex}`,
      );
    }
  }

  /**
   * 리그 통계를 업데이트합니다
   */
  private async updateLeagueStats(
    leagueId: number,
    totalMatches: number,
  ): Promise<void> {
    const crawledMatches = await this.kafaMatchModel.countDocuments({
      leagueId,
      status: 'crawled',
    });

    await this.kafaLeagueModel.updateOne(
      { leagueId },
      {
        $set: {
          totalMatches,
          crawledMatches,
          lastCrawledAt: new Date(),
        },
      },
    );
  }

  /**
   * 모든 리그 목록을 조회합니다
   */
  async getAllLeagues(): Promise<any[]> {
    try {
      const leagues = await this.kafaLeagueModel
        .find({})
        .sort({ displayNumber: 1 }) // 화면 순서대로 정렬
        .lean();

      return leagues;
    } catch (error) {
      this.logger.error(`❌ 리그 목록 조회 실패:`, error.message);
      throw error;
    }
  }

  /**
   * 특정 리그의 경기 목록을 조회합니다
   */
  async getLeagueMatches(leagueId: number): Promise<any[]> {
    try {
      const matches = await this.kafaMatchModel
        .find({ leagueId })
        .sort({ matchIndex: 1 })
        .lean(); // 성능을 위해 lean() 사용

      return matches;
    } catch (error) {
      this.logger.error(
        `❌ 리그 ${leagueId} 경기 목록 조회 실패:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * 전체 업데이트: 새로운 리그와 경기를 확인하고 크롤링합니다
   */
  async updateAll(): Promise<{
    success: boolean;
    message: string;
    stats?: {
      newLeagues: number;
      updatedLeagues: number;
      newMatches: number;
      totalLeagues: number;
      totalMatches: number;
    };
  }> {
    try {
      this.logger.log('🔄 V2 전체 업데이트 시작...');

      const startTime = Date.now();
      const stats = {
        newLeagues: 0,
        updatedLeagues: 0,
        newMatches: 0,
        totalLeagues: 0,
        totalMatches: 0,
      };

      // 1단계: 기존 리그 개수 확인
      const existingLeaguesCount = await this.kafaLeagueModel.countDocuments();

      // 2단계: 리그 목록 업데이트 (새로운 리그 확인)
      this.logger.log('📋 STEP 1: 리그 목록 업데이트...');
      await this.crawlAllLeagues();

      // 새로운 리그 개수 확인
      const newLeaguesCount = await this.kafaLeagueModel.countDocuments();
      stats.newLeagues = newLeaguesCount - existingLeaguesCount;
      stats.totalLeagues = newLeaguesCount;

      // 3단계: 모든 리그의 경기 목록 업데이트
      this.logger.log('🏈 STEP 2: 모든 리그의 경기 목록 업데이트...');
      const allLeagues = await this.getAllLeagues();

      for (const league of allLeagues) {
        try {
          // 기존 경기 수 확인
          const existingMatchCount = await this.kafaMatchModel.countDocuments({
            leagueId: league.leagueId,
          });

          // 경기 목록 크롤링
          await this.crawlMatchesForLeague(league.leagueId);

          // 새로운 경기 수 확인
          const newMatchCount = await this.kafaMatchModel.countDocuments({
            leagueId: league.leagueId,
          });

          const addedMatches = newMatchCount - existingMatchCount;
          if (addedMatches > 0) {
            stats.newMatches += addedMatches;
            stats.updatedLeagues++;
            this.logger.log(
              `✨ 리그 ${league.leagueId}: ${addedMatches}개 새 경기 추가됨`,
            );
          }

          // 서버 부하 방지
          await this.delay(1000);
        } catch (error) {
          this.logger.error(
            `❌ 리그 ${league.leagueId} 업데이트 실패:`,
            error.message,
          );
        }
      }

      // 전체 경기 수 계산
      stats.totalMatches = await this.kafaMatchModel.countDocuments();

      const duration = Math.round((Date.now() - startTime) / 1000);

      this.logger.log('✅ V2 전체 업데이트 완료!');
      this.logger.log(`📊 소요시간: ${duration}초`);
      this.logger.log(`📊 새 리그: ${stats.newLeagues}개`);
      this.logger.log(`📊 업데이트된 리그: ${stats.updatedLeagues}개`);
      this.logger.log(`📊 새 경기: ${stats.newMatches}개`);

      return {
        success: true,
        message: `업데이트 완료: ${stats.newLeagues}개 새 리그, ${stats.newMatches}개 새 경기 추가됨 (${duration}초 소요)`,
        stats,
      };
    } catch (error) {
      this.logger.error('❌ V2 전체 업데이트 실패:', error.message);

      return {
        success: false,
        message: `업데이트 실패: ${error.message}`,
      };
    }
  }

  /**
   * 특정 리그만 업데이트합니다
   */
  async updateLeague(leagueId: number): Promise<{
    success: boolean;
    message: string;
    newMatches?: number;
  }> {
    try {
      this.logger.log(`🔄 리그 ${leagueId} 업데이트 시작...`);

      // 기존 경기 수 확인
      const existingMatchCount = await this.kafaMatchModel.countDocuments({
        leagueId,
      });

      // 경기 목록 크롤링
      await this.crawlMatchesForLeague(leagueId);

      // 새로운 경기 수 확인
      const newMatchCount = await this.kafaMatchModel.countDocuments({
        leagueId,
      });
      const addedMatches = newMatchCount - existingMatchCount;

      if (addedMatches > 0) {
        this.logger.log(
          `✨ 리그 ${leagueId}: ${addedMatches}개 새 경기 추가됨`,
        );

        return {
          success: true,
          message: `리그 ${leagueId} 업데이트 완료: ${addedMatches}개 새 경기 추가됨`,
          newMatches: addedMatches,
        };
      } else {
        return {
          success: true,
          message: `리그 ${leagueId}: 새로운 경기 없음`,
          newMatches: 0,
        };
      }
    } catch (error) {
      this.logger.error(`❌ 리그 ${leagueId} 업데이트 실패:`, error.message);

      return {
        success: false,
        message: `리그 ${leagueId} 업데이트 실패: ${error.message}`,
      };
    }
  }

  /**
   * 지연 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
