import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KafaLeague } from '../schemas/kafa-league.schema';
import { KafaMatch } from '../schemas/kafa-match.schema';

@Injectable()
export class KafaLeagueCrawlerService {
  private readonly logger = new Logger(KafaLeagueCrawlerService.name);
  private browser: puppeteer.Browser = null;
  private cookies: any[] = [];

  constructor(
    @InjectModel(KafaLeague.name) private readonly kafaLeagueModel: Model<any>,
    @InjectModel(KafaMatch.name) private readonly kafaMatchModel: Model<any>,
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

  // 모든 리그 목록 크롤링
  async crawlAllLeagues() {
    try {
      if (!this.cookies.length) {
        await this.loginToKafa();
      }

      const page = await this.browser.newPage();
      await page.setCookie(...this.cookies);

      // 경기 결과 페이지로 이동
      await page.goto('https://member.kafa.or.kr/match_result.html', { waitUntil: 'networkidle2' });

      // 리그 목록 추출
      const leagues = await page.evaluate(() => {
        const leagueSelect = document.querySelector('select[name="L_l_index"]');
        const options = leagueSelect?.querySelectorAll('option') || [];
        const leagueList: any[] = [];

        options.forEach((option) => {
          const value = option.getAttribute('value');
          const text = option.textContent?.trim();

          if (value && value !== '' && text) {
            leagueList.push({
              leagueId: parseInt(value),
              name: text,
              category: text.includes('대학') ? 'university' : 'social',
              division: text.includes('2부') ? '2부' : '1부',
              season: text.match(/\d{4}/)?.[0] || new Date().getFullYear().toString(),
            });
          }
        });

        return leagueList;
      });

      // DB에 저장
      for (const league of leagues) {
        await this.kafaLeagueModel.findOneAndUpdate(
          { leagueId: league.leagueId },
          { 
            $set: {
              ...league,
              lastUpdated: new Date(),
            },
          },
          { upsert: true },
        );
      }

      await page.close();

      this.logger.log(`✅ 리그 목록 크롤링 완료: ${leagues.length}개`);
      return {
        success: true,
        totalLeagues: leagues.length,
        leagues,
      };
    } catch (error) {
      this.logger.error('리그 목록 크롤링 실패:', error);
      throw error;
    }
  }

  // 특정 리그의 경기 목록 크롤링
  async crawlLeagueMatches(leagueId: number) {
    try {
      if (!this.cookies.length) {
        await this.loginToKafa();
      }

      const page = await this.browser.newPage();
      await page.setCookie(...this.cookies);

      const matches: any[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      // 페이지네이션 처리
      while (hasMorePages) {
        const url = `https://member.kafa.or.kr/match_list.html?L_l_index=${leagueId}&page=${currentPage}`;
        await page.goto(url, { waitUntil: 'networkidle2' });

        const pageData = await page.evaluate(() => {
          const matchTable = document.querySelector('table.match-list');
          if (!matchTable) return { matches: [], hasMore: false };

          const rows = matchTable.querySelectorAll('tbody tr');
          const matchList: any[] = [];

          rows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 5) {
              const matchLink = cells[0]?.querySelector('a');
              const href = matchLink?.getAttribute('href');
              const matchId = href?.match(/L_index=(\d+)/)?.[1];

              if (matchId) {
                matchList.push({
                  matchId: parseInt(matchId),
                  matchNumber: cells[0]?.textContent?.trim() || '',
                  gameDate: cells[1]?.textContent?.trim() || '',
                  homeTeam: cells[2]?.textContent?.trim() || '',
                  awayTeam: cells[3]?.textContent?.trim() || '',
                  venue: cells[4]?.textContent?.trim() || '',
                  score: cells[5]?.textContent?.trim() || '',
                });
              }
            }
          });

          // 다음 페이지 버튼 확인
          const nextButton = document.querySelector('.pagination a.next');
          const hasMore = nextButton && !nextButton.classList.contains('disabled');

          return { matches: matchList, hasMore };
        });

        matches.push(...pageData.matches);
        hasMorePages = pageData.hasMore;
        currentPage++;

        // 페이지 간 딜레이
        if (hasMorePages) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // 리그 정보 업데이트
      await this.kafaLeagueModel.findOneAndUpdate(
        { leagueId },
        {
          $set: {
            totalMatches: matches.length,
            lastMatchUpdate: new Date(),
          },
        },
      );

      // 경기 정보 저장
      for (const match of matches) {
        await this.kafaMatchModel.findOneAndUpdate(
          { matchId: match.matchId },
          {
            $set: {
              ...match,
              leagueId,
              status: match.score ? 'completed' : 'scheduled',
              lastUpdated: new Date(),
            },
          },
          { upsert: true },
        );
      }

      await page.close();

      this.logger.log(`✅ 리그 ${leagueId} 경기 목록 크롤링 완료: ${matches.length}경기`);
      return {
        success: true,
        leagueId,
        totalMatches: matches.length,
        matches,
      };
    } catch (error) {
      this.logger.error(`리그 ${leagueId} 경기 목록 크롤링 실패:`, error);
      throw error;
    }
  }

  // 리그별 통계 요약
  async getLeagueSummary(leagueId: number) {
    try {
      const league = await this.kafaLeagueModel.findOne({ leagueId }).exec();
      const matches = await this.kafaMatchModel.find({ leagueId }).exec();

      const completedMatches = matches.filter((m) => m.status === 'completed').length;
      const crawledMatches = matches.filter((m) => m.status === 'crawled').length;

      return {
        league: league?.name || `리그 ${leagueId}`,
        totalMatches: matches.length,
        completedMatches,
        crawledMatches,
        crawlingProgress: matches.length > 0 ? Math.round((crawledMatches / matches.length) * 100) : 0,
      };
    } catch (error) {
      this.logger.error(`리그 ${leagueId} 요약 정보 조회 실패:`, error);
      return null;
    }
  }

  // 모든 리그 상태 조회
  async getAllLeagueStatus() {
    try {
      const leagues = await this.kafaLeagueModel.find().sort({ leagueId: 1 }).exec();
      const summaries = [];

      for (const league of leagues) {
        const summary = await this.getLeagueSummary(league.leagueId);
        if (summary) {
          summaries.push(summary);
        }
      }

      return summaries;
    } catch (error) {
      this.logger.error('전체 리그 상태 조회 실패:', error);
      return [];
    }
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}