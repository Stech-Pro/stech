import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KafaMatch } from '../schemas/kafa-match.schema';

@Injectable()
export class KafaMatchInfoService {
  private readonly logger = new Logger(KafaMatchInfoService.name);
  private browser: puppeteer.Browser = null;
  private cookies: any[] = [];

  constructor(
    @InjectModel(KafaMatch.name) private readonly kafaMatchModel: Model<any>,
  ) {}

  // KAFA 사이트 자동 로그인
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

      // 로그인 폼 입력
      await page.type('#user_id', 'stech');
      await page.type('#user_password', 'Startup901()');
      
      // 로그인 버튼 클릭
      await page.click('#login_btn');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      // 쿠키 저장
      this.cookies = await page.cookies();
      await page.close();

      this.logger.log('✅ KAFA 로그인 성공');
      return true;
    } catch (error) {
      this.logger.error('❌ KAFA 로그인 실패:', error.message);
      return false;
    }
  }

  // 경기 일반 정보 추출 (6가지)
  async getMatchGeneralInfo(matchId: number) {
    try {
      // 로그인 확인
      if (this.cookies.length === 0) {
        const loginSuccess = await this.loginToKafa();
        if (!loginSuccess) {
          return {
            success: false,
            error: 'KAFA 로그인 실패',
            data: null,
          };
        }
      }

      const page = await this.browser.newPage();
      await page.setCookie(...this.cookies);

      // 경기 상세 페이지로 이동
      const matchUrl = `https://member.kafa.or.kr/match_info.html?L_index=${matchId}`;
      await page.goto(matchUrl, { waitUntil: 'networkidle2' });

      // 경기 정보 추출
      const generalInfo = await page.evaluate(() => {
        const result: any = {};

        // 1. 리그 종류
        const leagueSelect = document.querySelector('select[id*="L_league"]') as HTMLSelectElement;
        result.leagueType = leagueSelect?.selectedOptions?.[0]?.textContent?.trim() || '';

        // 2. 경기 날짜
        const dateInput = document.querySelector('input[id*="day"]');
        result.gameDate = (dateInput as HTMLInputElement)?.value || '';

        // 3. 홈팀 정보
        const homeTeamSelect = document.querySelector('select[name*="home_team"]') as HTMLSelectElement;
        const homeTeamOption = homeTeamSelect?.selectedOptions?.[0];
        result.homeTeam = {
          name: homeTeamOption?.textContent?.trim() || '',
          initial: homeTeamOption?.getAttribute('value') || '',
        };

        // 4. 어웨이팀 정보
        const awayTeamSelect = document.querySelector('select[name*="away_team"]') as HTMLSelectElement;
        const awayTeamOption = awayTeamSelect?.selectedOptions?.[0];
        result.awayTeam = {
          name: awayTeamOption?.textContent?.trim() || '',
          initial: awayTeamOption?.getAttribute('value') || '',
        };

        // 5. 경기장소
        const venueInput = document.querySelector('input[id*="place"]');
        result.venue = (venueInput as HTMLInputElement)?.value || '';

        return result;
      });

      // 6. 점수 정보 추출
      const detailedScores = await page.evaluate(() => {
        const scores: any = {
          quarterlyScores: {
            home: {},
            away: {},
          },
        };

        // 쿼터별 점수
        const scoreTable = document.querySelector('table.match_score');
        if (scoreTable) {
          const rows = scoreTable.querySelectorAll('tr');
          
          // 홈팀 점수 (첫번째 행)
          const homeRow = rows[1];
          if (homeRow) {
            const homeCells = homeRow.querySelectorAll('td');
            scores.quarterlyScores.home = {
              quarter1: parseInt(homeCells[1]?.textContent || '0'),
              quarter2: parseInt(homeCells[2]?.textContent || '0'),
              quarter3: parseInt(homeCells[3]?.textContent || '0'),
              quarter4: parseInt(homeCells[4]?.textContent || '0'),
              total: parseInt(homeCells[5]?.textContent || '0'),
            };
          }

          // 원정팀 점수 (두번째 행)
          const awayRow = rows[2];
          if (awayRow) {
            const awayCells = awayRow.querySelectorAll('td');
            scores.quarterlyScores.away = {
              quarter1: parseInt(awayCells[1]?.textContent || '0'),
              quarter2: parseInt(awayCells[2]?.textContent || '0'),
              quarter3: parseInt(awayCells[3]?.textContent || '0'),
              quarter4: parseInt(awayCells[4]?.textContent || '0'),
              total: parseInt(awayCells[5]?.textContent || '0'),
            };
          }
        }

        // 추가 정보
        const startTimeInput = document.querySelector('input[id*="start_time"]');
        scores.startTime = (startTimeInput as HTMLInputElement)?.value || '';

        const endTimeInput = document.querySelector('input[id*="end_time"]');
        scores.endTime = (endTimeInput as HTMLInputElement)?.value || '';

        const weatherInput = document.querySelector('input[id*="weather"]');
        scores.weather = (weatherInput as HTMLInputElement)?.value || '';

        return scores;
      });

      // 스코어 표시 문자열 생성
      if (generalInfo.homeTeam && generalInfo.awayTeam && detailedScores.quarterlyScores) {
        generalInfo.score = {
          home: detailedScores.quarterlyScores.home.total || 0,
          away: detailedScores.quarterlyScores.away.total || 0,
          display: `${generalInfo.homeTeam.initial} ${detailedScores.quarterlyScores.home.total || 0} - ${generalInfo.awayTeam.initial} ${detailedScores.quarterlyScores.away.total || 0}`,
        };
      }

      await page.close();

      return {
        success: true,
        data: {
          matchId,
          generalInfo,
          detailedScores,
        },
      };
    } catch (error) {
      this.logger.error(`❌ 경기 ${matchId} 일반 정보 추출 실패:`, error.message);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // 완전한 경기 데이터 조회 (일반 정보 + 플레이 데이터)
  async getCompleteMatchData(matchId: number) {
    try {
      // 1. DB에서 먼저 조회
      const savedMatch = await this.kafaMatchModel.findOne({ matchId }).exec();
      if (savedMatch) {
        this.logger.log(`✅ DB에서 경기 ${matchId} 데이터 조회 완료`);
        return {
          success: true,
          data: savedMatch,
        };
      }

      // 2. DB에 없으면 크롤링
      this.logger.log(`📋 경기 ${matchId} 크롤링 시작...`);

      // 일반 정보 크롤링
      const generalInfoResult = await this.getMatchGeneralInfo(matchId);
      if (!generalInfoResult.success) {
        return generalInfoResult;
      }

      // 플레이 데이터 크롤링
      const playDataResult = await this.crawlPlayByPlayData(matchId);
      if (!playDataResult.success) {
        return {
          ...generalInfoResult,
          data: {
            ...generalInfoResult.data,
            playByPlay: null,
          },
        };
      }

      return {
        success: true,
        data: {
          ...generalInfoResult.data,
          playByPlay: playDataResult.data,
        },
      };
    } catch (error) {
      this.logger.error(`❌ 경기 ${matchId} 완전한 데이터 조회 실패:`, error.message);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // 플레이별 데이터 크롤링
  private async crawlPlayByPlayData(matchId: number) {
    try {
      if (this.cookies.length === 0) {
        await this.loginToKafa();
      }

      const page = await this.browser.newPage();
      await page.setCookie(...this.cookies);

      const playUrl = `https://member.kafa.or.kr/match_play.html?L_index=${matchId}`;
      await page.goto(playUrl, { waitUntil: 'networkidle2' });

      // 플레이 데이터 추출
      const playData = await page.evaluate(() => {
        const quarters: any = {};
        const quarterTabs = document.querySelectorAll('.quarter-tab');

        quarterTabs.forEach((tab) => {
          const quarterName = tab.textContent?.trim() || '';
          const quarterData = {
            quarterName,
            plays: [] as any[],
          };

          // 해당 쿼터의 플레이 테이블 찾기
          const playTable = document.querySelector(`#${quarterName}_plays`);
          if (playTable) {
            const rows = playTable.querySelectorAll('tr');
            rows.forEach((row, index) => {
              if (index === 0) return; // 헤더 스킵

              const cells = row.querySelectorAll('td');
              if (cells.length > 0) {
                quarterData.plays.push({
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

          quarters[quarterName] = quarterData;
        });

        return quarters;
      });

      await page.close();

      return {
        success: true,
        data: {
          matchId,
          quarters: playData,
          totalPlays: Object.values(playData).reduce((sum: number, q: any) => sum + q.plays.length, 0),
        },
      };
    } catch (error) {
      this.logger.error(`❌ 경기 ${matchId} 플레이 데이터 크롤링 실패:`, error.message);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}