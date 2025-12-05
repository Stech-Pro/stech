import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as puppeteer from 'puppeteer';
import { KafaMatch } from '../schemas/kafa-match.schema';
import { KafaLeague } from '../schemas/kafa-league.schema';

@Injectable()
export class KafaBatchService {
  private readonly logger = new Logger(KafaBatchService.name);
  private browser: puppeteer.Browser = null;
  private cookies: any[] = [];

  constructor(
    @InjectModel(KafaMatch.name) private readonly kafaMatchModel: Model<any>,
    @InjectModel(KafaLeague.name) private readonly kafaLeagueModel: Model<any>,
  ) {}

  // KAFA 사이트 로그인
  private async loginToKafa(): Promise<boolean> {
    try {
      if (!this.browser) {
        this.browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
      }

      const page = await this.browser.newPage();
      await page.goto('https://member.kafa.or.kr/sign.html');

      await page.type('#user_id', 'stech');
      await page.type('#user_password', 'Startup901()');
      
      await page.click('#login_btn');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      this.cookies = await page.cookies();
      await page.close();

      this.logger.log('✅ KAFA 로그인 성공');
      return true;
    } catch (error) {
      this.logger.error('❌ KAFA 로그인 실패:', error.message);
      return false;
    }
  }

  // 특정 경기 크롤링 및 저장
  async crawlSpecificMatch(matchId: number) {
    try {
      this.logger.log(`🎯 경기 ${matchId} 크롤링 시작...`);

      if (!this.cookies.length) {
        await this.loginToKafa();
      }

      const page = await this.browser.newPage();
      await page.setCookie(...this.cookies);

      // 경기 상세 페이지 크롤링
      const matchUrl = `https://member.kafa.or.kr/match_info.html?L_index=${matchId}`;
      await page.goto(matchUrl, { waitUntil: 'networkidle2' });

      // 경기 정보 추출
      const matchData = await page.evaluate((matchId) => {
        const data: any = {
          matchId,
          leagueId: 0,
          gameDate: '',
          venue: '',
          homeTeam: {},
          awayTeam: {},
          homeScore: {
            quarter1: 0,
            quarter2: 0,
            quarter3: 0,
            quarter4: 0,
            total: 0,
          },
          awayScore: {
            quarter1: 0,
            quarter2: 0,
            quarter3: 0,
            quarter4: 0,
            total: 0,
          },
          plays: [],
          totalPlays: 0,
        };

        // 리그 정보
        const leagueSelect = document.querySelector('select[id*="L_league"]') as HTMLSelectElement;
        data.leagueType = leagueSelect?.selectedOptions?.[0]?.textContent?.trim() || '';

        // 경기 날짜
        const dateInput = document.querySelector('input[id*="day"]');
        data.gameDate = (dateInput as HTMLInputElement)?.value || '';

        // 경기장
        const venueInput = document.querySelector('input[id*="place"]');
        data.venue = (venueInput as HTMLInputElement)?.value || '';

        // 팀 정보
        const homeTeamSelect = document.querySelector('select[name*="home_team"]') as HTMLSelectElement;
        const homeTeamOption = homeTeamSelect?.selectedOptions?.[0];
        data.homeTeam = {
          name: homeTeamOption?.textContent?.trim() || '',
          initial: homeTeamOption?.getAttribute('value') || '',
          fullName: homeTeamOption?.textContent?.trim() || '',
        };

        const awayTeamSelect = document.querySelector('select[name*="away_team"]') as HTMLSelectElement;
        const awayTeamOption = awayTeamSelect?.selectedOptions?.[0];
        data.awayTeam = {
          name: awayTeamOption?.textContent?.trim() || '',
          initial: awayTeamOption?.getAttribute('value') || '',
          fullName: awayTeamOption?.textContent?.trim() || '',
        };

        // 점수 정보
        const scoreTable = document.querySelector('table.match_score');
        if (scoreTable) {
          const rows = scoreTable.querySelectorAll('tr');
          
          const homeRow = rows[1];
          if (homeRow) {
            const cells = homeRow.querySelectorAll('td');
            data.homeScore = {
              quarter1: parseInt(cells[1]?.textContent || '0'),
              quarter2: parseInt(cells[2]?.textContent || '0'),
              quarter3: parseInt(cells[3]?.textContent || '0'),
              quarter4: parseInt(cells[4]?.textContent || '0'),
              total: parseInt(cells[5]?.textContent || '0'),
            };
          }

          const awayRow = rows[2];
          if (awayRow) {
            const cells = awayRow.querySelectorAll('td');
            data.awayScore = {
              quarter1: parseInt(cells[1]?.textContent || '0'),
              quarter2: parseInt(cells[2]?.textContent || '0'),
              quarter3: parseInt(cells[3]?.textContent || '0'),
              quarter4: parseInt(cells[4]?.textContent || '0'),
              total: parseInt(cells[5]?.textContent || '0'),
            };
          }
        }

        return data;
      }, matchId);

      // 플레이 데이터 크롤링
      const playUrl = `https://member.kafa.or.kr/match_play.html?L_index=${matchId}`;
      await page.goto(playUrl, { waitUntil: 'networkidle2' });

      const playData = await page.evaluate(() => {
        const plays: any[] = [];
        const quarterTabs = document.querySelectorAll('.quarter-tab');

        quarterTabs.forEach((tab) => {
          const quarterName = tab.textContent?.trim() || '';
          const playTable = document.querySelector(`#${quarterName}_plays`);
          
          if (playTable) {
            const rows = playTable.querySelectorAll('tr');
            rows.forEach((row, index) => {
              if (index === 0) return;

              const cells = row.querySelectorAll('td');
              if (cells.length > 0) {
                plays.push({
                  quarter: quarterName,
                  playNumber: cells[0]?.textContent?.trim() || '',
                  time: cells[1]?.textContent?.trim() || '',
                  offenseTeam: cells[2]?.textContent?.trim() || '',
                  ballOn: cells[3]?.textContent?.trim() || '',
                  down: cells[4]?.textContent?.trim() || '',
                  quarterback: cells[5]?.textContent?.trim() || '',
                  playType: cells[6]?.textContent?.trim() || '',
                  gainYd: cells[7]?.textContent?.trim() || '',
                  tackleBy: cells[8]?.textContent?.trim() || '',
                  sack: cells[9]?.textContent?.trim() || '',
                  penalty: cells[10]?.textContent?.trim() || '',
                  penaltyName: cells[11]?.textContent?.trim() || '',
                  score: cells[12]?.textContent?.trim() || '',
                  remark: cells[13]?.textContent?.trim() || '',
                });
              }
            });
          }
        });

        return plays;
      });

      matchData.plays = playData;
      matchData.totalPlays = playData.length;
      matchData.status = 'crawled';
      matchData.crawledAt = new Date();
      matchData.lastUpdatedAt = new Date();

      // DB에 저장
      await this.kafaMatchModel.findOneAndUpdate(
        { matchId },
        { $set: matchData },
        { upsert: true, new: true },
      );

      await page.close();

      this.logger.log(`✅ 경기 ${matchId} 크롤링 및 저장 완료`);
      return {
        success: true,
        message: `경기 ${matchId} 크롤링 완료`,
        data: {
          matchId,
          totalPlays: matchData.totalPlays,
          homeTeam: matchData.homeTeam.name,
          awayTeam: matchData.awayTeam.name,
          score: `${matchData.homeScore.total} - ${matchData.awayScore.total}`,
        },
      };
    } catch (error) {
      this.logger.error(`❌ 경기 ${matchId} 크롤링 실패:`, error.message);
      return {
        success: false,
        message: `경기 ${matchId} 크롤링 실패: ${error.message}`,
      };
    }
  }

  // 배치 상태 조회
  async getBatchStatus() {
    try {
      const totalLeagues = await this.kafaLeagueModel.countDocuments();
      const totalMatches = await this.kafaMatchModel.countDocuments();
      const crawledMatches = await this.kafaMatchModel.countDocuments({ status: 'crawled' });

      const lastCrawled = await this.kafaMatchModel
        .findOne({ status: 'crawled' })
        .sort({ crawledAt: -1 })
        .exec();

      return {
        totalLeagues,
        totalMatches,
        crawledMatches,
        crawlingProgress: totalMatches > 0 ? Math.round((crawledMatches / totalMatches) * 100) : 0,
        lastCrawledMatch: lastCrawled ? {
          matchId: lastCrawled.matchId,
          homeTeam: lastCrawled.homeTeam?.name,
          awayTeam: lastCrawled.awayTeam?.name,
          crawledAt: lastCrawled.crawledAt,
        } : null,
      };
    } catch (error) {
      this.logger.error('배치 상태 조회 실패:', error);
      return null;
    }
  }

  // 모든 리그 조회
  async getAllLeagues() {
    try {
      return await this.kafaLeagueModel.find().sort({ leagueId: 1 }).exec();
    } catch (error) {
      this.logger.error('리그 목록 조회 실패:', error);
      return [];
    }
  }

  // 특정 리그 크롤링
  async crawlSpecificLeague(leagueId: number) {
    try {
      this.logger.log(`📋 리그 ${leagueId} 크롤링 시작...`);

      if (!this.cookies.length) {
        await this.loginToKafa();
      }

      const page = await this.browser.newPage();
      await page.setCookie(...this.cookies);

      let totalMatches = 0;
      let currentPage = 1;
      const matches: any[] = [];

      // 페이지네이션 처리
      while (true) {
        const url = `https://member.kafa.or.kr/match_list.html?L_l_index=${leagueId}&page=${currentPage}`;
        await page.goto(url, { waitUntil: 'networkidle2' });

        const pageMatches = await page.evaluate(() => {
          const matchRows = document.querySelectorAll('table.match-list tr');
          const matches: any[] = [];

          matchRows.forEach((row, index) => {
            if (index === 0) return; // 헤더 스킵

            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
              const matchLink = cells[0]?.querySelector('a');
              const matchId = matchLink?.getAttribute('href')?.match(/L_index=(\d+)/)?.[1];

              if (matchId) {
                matches.push({
                  matchId: parseInt(matchId),
                  gameDate: cells[1]?.textContent?.trim() || '',
                  homeTeam: cells[2]?.textContent?.trim() || '',
                  awayTeam: cells[3]?.textContent?.trim() || '',
                  venue: cells[4]?.textContent?.trim() || '',
                });
              }
            }
          });

          return matches;
        });

        if (pageMatches.length === 0) break;

        matches.push(...pageMatches);
        totalMatches += pageMatches.length;
        currentPage++;

        // 페이지네이션 딜레이
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // 리그 정보 업데이트
      await this.kafaLeagueModel.findOneAndUpdate(
        { leagueId },
        { 
          $set: {
            totalMatches,
            matches: matches.map((m) => m.matchId),
            lastUpdated: new Date(),
          },
        },
        { upsert: true },
      );

      // 경기 정보 저장
      for (const match of matches) {
        await this.kafaMatchModel.findOneAndUpdate(
          { matchId: match.matchId },
          { 
            $set: {
              ...match,
              leagueId,
              status: 'scheduled',
            },
          },
          { upsert: true },
        );
      }

      await page.close();

      this.logger.log(`✅ 리그 ${leagueId} 크롤링 완료: ${totalMatches}경기`);
      return {
        success: true,
        leagueId,
        totalMatches,
      };
    } catch (error) {
      this.logger.error(`❌ 리그 ${leagueId} 크롤링 실패:`, error.message);
      throw error;
    }
  }

  // 리그 목록 업데이트
  async updateLeagues() {
    try {
      if (!this.cookies.length) {
        await this.loginToKafa();
      }

      const page = await this.browser.newPage();
      await page.setCookie(...this.cookies);

      await page.goto('https://member.kafa.or.kr/match_result.html', { waitUntil: 'networkidle2' });

      const leagues = await page.evaluate(() => {
        const leagueOptions = document.querySelectorAll('select[name="L_l_index"] option');
        const leagues: any[] = [];

        leagueOptions.forEach((option) => {
          const value = option.getAttribute('value');
          const text = option.textContent?.trim();

          if (value && value !== '' && text) {
            leagues.push({
              leagueId: parseInt(value),
              name: text,
              category: text.includes('대학') ? 'university' : 'social',
              division: text.includes('2부') ? '2부' : '1부',
            });
          }
        });

        return leagues;
      });

      // 리그 정보 DB 저장
      for (const league of leagues) {
        await this.kafaLeagueModel.findOneAndUpdate(
          { leagueId: league.leagueId },
          { $set: league },
          { upsert: true },
        );
      }

      await page.close();

      this.logger.log(`✅ 리그 목록 업데이트 완료: ${leagues.length}개`);
      return {
        success: true,
        totalLeagues: leagues.length,
        leagues,
      };
    } catch (error) {
      this.logger.error('리그 목록 업데이트 실패:', error);
      throw error;
    }
  }

  // 모든 경기 업데이트
  async updateMatches() {
    try {
      const leagues = await this.kafaLeagueModel.find().exec();
      let totalUpdated = 0;

      for (const league of leagues) {
        const result = await this.crawlSpecificLeague(league.leagueId);
        totalUpdated += result.totalMatches || 0;

        // 리그 간 딜레이
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      return {
        success: true,
        totalLeagues: leagues.length,
        totalMatches: totalUpdated,
      };
    } catch (error) {
      this.logger.error('경기 목록 업데이트 실패:', error);
      throw error;
    }
  }

  // 경기 정보 조회
  async getMatchInfo(matchId: number) {
    return await this.kafaMatchModel.findOne({ matchId }).exec();
  }

  // 모든 경기 조회
  async getAllMatches() {
    return await this.kafaMatchModel.find().exec();
  }


  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}