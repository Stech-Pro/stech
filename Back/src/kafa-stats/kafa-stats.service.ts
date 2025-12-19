import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import * as fs from 'fs';
import * as path from 'path';
import { 
  TeamOffenseStats, 
  PlayerStats, 
  KafaStatsOptions,
  GameRecordStats
} from './interfaces/kafa-stats.interface';
import { 
  KafaPlayerStats, 
  KafaPlayerStatsDocument 
} from '../schemas/kafa-player-stats.schema';
import { parseRushingYards } from './utils/parse-rushing-yards.util';

@Injectable()
export class KafaStatsService {
  private readonly logger = new Logger(KafaStatsService.name);
  private readonly baseUrl = 'https://www.kafa.org/stats';
  private readonly kafaBaseUrl = 'https://www.kafa.org';
  private cookieJar: CookieJar;
  private axiosInstance: any;

  constructor(
    @InjectModel(KafaPlayerStats.name)
    private kafaPlayerStatsModel: Model<KafaPlayerStatsDocument>,
  ) {
    // 쿠키를 유지하는 axios 인스턴스 생성
    this.cookieJar = new CookieJar();
    this.axiosInstance = wrapper(axios.create({ 
      jar: this.cookieJar,
      withCredentials: true,
      timeout: 10000
    }));
  }

  // 팀 스탯 조회 (대학/사회인)
  async getTeamStats(league: 'uni' | 'soc', year?: string): Promise<TeamOffenseStats[]> {
    try {
      const url = `${this.baseUrl}/team_${league}_offense1.html`;
      this.logger.log(`Fetching team stats: ${url}`);
      
      const { data } = await axios.get(url, {
        params: year ? { year } : {},
        timeout: 10000,
      });
      
      const $ = cheerio.load(data);
      const stats: TeamOffenseStats[] = [];
      
      $('.stats_table tr').each((index, element) => {
        // 첫 번째 행(헤더)은 건너뛰기
        if (index === 0) return;
        
        const cells = $(element).find('td');
        
        if (cells.length >= 6) {
          const teamName = $(cells[0]).text().trim();
          const rushYards = $(cells[1]).text().trim();
          const yardsPerAttempt = parseFloat($(cells[2]).text().trim()) || 0;
          const attempts = parseInt($(cells[3]).text().trim()) || 0;
          const touchdowns = parseInt($(cells[4]).text().trim()) || 0;
          const longest = parseInt($(cells[5]).text().trim()) || 0;
          
          if (teamName) {
            stats.push({
              rank: index,
              teamName,
              rushYards,
              yardsPerAttempt,
              attempts,
              touchdowns,
              longest
            });
          }
        }
      });
      
      this.logger.log(`Successfully fetched ${stats.length} team stats for ${league}`);
      return stats;
    } catch (error) {
      this.logger.error(`Failed to fetch team stats: ${error.message}`);
      throw new Error(`Failed to fetch KAFA team stats: ${error.message}`);
    }
  }

  // 개인 선수 스탯 조회 (대학/사회인)
  async getPlayerStats(league: 'uni' | 'soc', year?: string): Promise<PlayerStats[]> {
    try {
      const url = `${this.baseUrl}/ind_${league}1.html`;
      this.logger.log(`Fetching player stats: ${url}`);
      
      const { data } = await axios.get(url, {
        params: year ? { year } : {},
        timeout: 10000,
      });
      
      const $ = cheerio.load(data);
      const stats: PlayerStats[] = [];
      
      $('.stats_table tr').each((index, element) => {
        // 첫 번째 행(헤더)은 건너뛰기
        if (index === 0) return;
        
        const cells = $(element).find('td');
        this.logger.log(`🔍 Row ${index}: ${cells.length}개 셀 발견`);
        
        // 모든 셀의 내용을 로그로 출력
        cells.each((cellIndex, cell) => {
          this.logger.log(`  셀 ${cellIndex}: "${$(cell).text().trim()}"`);
        });
        
        if (cells.length >= 6) {
          // 각 셀을 순서대로 확인해보자
          const cell0 = $(cells[0]).text().trim(); // 순위?
          const cell1 = $(cells[1]).text().trim(); // 선수 정보?
          const cell2 = $(cells[2]).text().trim(); // 러싱 야드?
          const cell3 = $(cells[3]).text().trim();
          const cell4 = $(cells[4]).text().trim();
          const cell5 = $(cells[5]).text().trim();
          
          this.logger.log(`🧐 셀 분석: [${cell0}] [${cell1}] [${cell2}] [${cell3}] [${cell4}] [${cell5}]`);
          
          // 선수 정보가 두 번째 셀에 있을 가능성
          let playerCell = cell1.includes('대학교') ? cell1 : 
                          cell0.includes('대학교') ? cell0 : 
                          cell2.includes('대학교') ? cell2 : cell0;
          
          const { playerName, university, jerseyNumber } = this.parsePlayerInfo(playerCell);
          
          const rushYards = cell1.includes('대학교') ? cell2 : cell1;
          const yardsPerAttempt = parseFloat(cell1.includes('대학교') ? cell3 : cell2) || 0;
          const attempts = parseInt(cell1.includes('대학교') ? cell4 : cell3) || 0;
          const touchdowns = parseInt(cell1.includes('대학교') ? cell5 : cell4) || 0;
          const longest = parseInt(cell1.includes('대학교') ? $(cells[6])?.text().trim() : cell5) || 0;
          
          if (playerName && university) {
            stats.push({
              rank: index,
              playerName,
              university,
              jerseyNumber,
              rushYards,
              yardsPerAttempt,
              attempts,
              touchdowns,
              longest
            });
          }
        }
      });
      
      this.logger.log(`Successfully fetched ${stats.length} player stats for ${league}`);
      return stats;
    } catch (error) {
      this.logger.error(`Failed to fetch player stats: ${error.message}`);
      throw new Error(`Failed to fetch KAFA player stats: ${error.message}`);
    }
  }

  // 선수 정보 파싱 헬퍼 함수
  private parsePlayerInfo(text: string): { playerName: string; university: string; jerseyNumber: number } {
    this.logger.log(`🔍 파싱 시도: "${text}"`);
    
    // "경북대학교 31번 이효원" 형태의 텍스트를 파싱
    const match = text.match(/^(.+?)\s+(\d+)번\s+(.+)$/);
    
    if (match) {
      const [, university, jerseyNum, playerName] = match;
      this.logger.log(`✅ 파싱 성공: ${university} ${jerseyNum}번 ${playerName}`);
      return {
        playerName: playerName.trim(),
        university: university.trim(),
        jerseyNumber: parseInt(jerseyNum)
      };
    }
    
    // 다른 패턴 시도 (공백이 다를 수 있음)
    const match2 = text.match(/(.+?)(\d+)번(.+)/);
    if (match2) {
      const [, university, jerseyNum, playerName] = match2;
      this.logger.log(`✅ 대안 파싱 성공: ${university.trim()} ${jerseyNum}번 ${playerName.trim()}`);
      return {
        playerName: playerName.trim(),
        university: university.trim(),
        jerseyNumber: parseInt(jerseyNum)
      };
    }
    
    // 파싱 실패 시 기본값
    this.logger.error(`❌ 파싱 실패: "${text}"`);
    return {
      playerName: text,
      university: '미상',
      jerseyNumber: 0
    };
  }

  // 러싱 야드 정보에서 숫자만 추출하는 헬퍼 함수
  private cleanRushingYards(rushingYardStr: string): string {
    // "383 (전진 : 434 / 후퇴 : -51)" 형식에서 383만 추출
    const match = rushingYardStr.match(/^(-?\d+)/);
    return match ? match[1] : rushingYardStr;
  }

  // 특정 팀의 팀 스탯 조회
  async getSpecificTeamStats(league: 'uni' | 'soc', teamName: string, year?: string): Promise<TeamOffenseStats | null> {
    const allStats = await this.getTeamStats(league, year);
    return allStats.find(stat => 
      stat.teamName.includes(teamName) || teamName.includes(stat.teamName)
    ) || null;
  }

  // 특정 팀의 선수들 스탯 조회
  async getTeamPlayerStats(league: 'uni' | 'soc', teamName: string, year?: string): Promise<PlayerStats[]> {
    const allStats = await this.getPlayerStats(league, year);
    return allStats.filter(stat => 
      stat.university.includes(teamName) || teamName.includes(stat.university)
    );
  }

  // 특정 선수 스탯 조회
  async getSpecificPlayerStats(league: 'uni' | 'soc', playerName: string, year?: string): Promise<PlayerStats | null> {
    const allStats = await this.getPlayerStats(league, year);
    return allStats.find(stat => 
      stat.playerName.includes(playerName) || playerName.includes(stat.playerName)
    ) || null;
  }

  // 크롤링한 데이터를 DB에 저장
  async savePlayerStatsToDB(
    playerStats: PlayerStats[], 
    season: string, 
    league: 'uni' | 'soc'
  ): Promise<void> {
    try {
      this.logger.log(`📊 DB 저장 시작: ${playerStats.length}명의 선수 스탯`);

      for (const stat of playerStats) {
        // 러싱 야드 파싱
        const parsedYards = parseRushingYards(stat.rushYards);

        // 포지션은 일단 'Unknown'으로 설정 (협회에서 추가하면 업데이트)
        const position = 'Unknown';

        // DB에 저장할 데이터 준비
        const kafaPlayerData = {
          playerName: stat.playerName,
          teamName: stat.university,
          jerseyNumber: stat.jerseyNumber,
          position,
          season,
          league,
          rushing: {
            totalYards: parsedYards.totalYards,
            forwardYards: parsedYards.forwardYards,
            backwardYards: parsedYards.backwardYards,
            yardsPerAttempt: stat.yardsPerAttempt,
            attempts: stat.attempts,
            touchdowns: stat.touchdowns,
            longest: stat.longest,
          },
          rank: stat.rank,
          lastUpdated: new Date(),
          sourceUrl: `${this.baseUrl}/ind_${league}1.html`,
          rawYardString: stat.rushYards,
        };

        // 기존 데이터가 있으면 업데이트, 없으면 생성
        await this.kafaPlayerStatsModel.findOneAndUpdate(
          {
            playerName: stat.playerName,
            teamName: stat.university,
            jerseyNumber: stat.jerseyNumber,
            season,
            league,
          },
          kafaPlayerData,
          { upsert: true, new: true }
        );

        this.logger.log(`✅ 저장 완료: ${stat.university} ${stat.jerseyNumber}번 ${stat.playerName}`);
      }

      this.logger.log(`🎉 총 ${playerStats.length}명의 선수 스탯 저장 완료`);
    } catch (error) {
      this.logger.error(`❌ DB 저장 실패: ${error.message}`);
      throw new Error(`Failed to save player stats to DB: ${error.message}`);
    }
  }

  // 크롤링 + DB 저장 통합 메서드
  async fetchAndSavePlayerStats(
    league: 'uni' | 'soc', 
    season: string
  ): Promise<{ success: boolean; savedCount: number; message: string }> {
    try {
      this.logger.log(`🚀 ${league} 리그 ${season} 시즌 크롤링 시작`);

      // 1. KAFA 사이트에서 데이터 크롤링
      const playerStats = await this.getPlayerStats(league, season);

      if (playerStats.length === 0) {
        return {
          success: false,
          savedCount: 0,
          message: '크롤링된 데이터가 없습니다.',
        };
      }

      // 2. DB에 저장
      await this.savePlayerStatsToDB(playerStats, season, league);

      return {
        success: true,
        savedCount: playerStats.length,
        message: `${playerStats.length}명의 선수 스탯을 성공적으로 저장했습니다.`,
      };
    } catch (error) {
      this.logger.error(`❌ 크롤링 및 저장 실패: ${error.message}`);
      return {
        success: false,
        savedCount: 0,
        message: `크롤링 실패: ${error.message}`,
      };
    }
  }

  // 한양대 팀 스탯 조회 (Ken 팀 전용)
  async getHanyangTeamStats(year?: string): Promise<TeamOffenseStats | null> {
    return this.getSpecificTeamStats('uni', '한양대', year);
  }

  // DB에서 저장된 KAFA 선수 스탯 조회
  async getKafaPlayerStatsFromDB(
    league?: 'uni' | 'soc',
    season?: string,
    teamName?: string,
  ): Promise<KafaPlayerStats[]> {
    try {
      const query: any = {};
      
      if (league) query.league = league;
      if (season) query.season = season;
      if (teamName) query.teamName = { $regex: teamName, $options: 'i' };

      const stats = await this.kafaPlayerStatsModel
        .find(query)
        .sort({ rank: 1 }) // 순위순 정렬
        .exec();

      this.logger.log(`📊 DB에서 ${stats.length}명의 KAFA 스탯 조회 완료`);
      return stats;
    } catch (error) {
      this.logger.error(`❌ DB 조회 실패: ${error.message}`);
      throw new Error(`Failed to get KAFA stats from DB: ${error.message}`);
    }
  }

  // 한양대 선수들 스탯 조회 (Ken 팀 전용)
  async getHanyangPlayerStats(year?: string): Promise<PlayerStats[]> {
    return this.getTeamPlayerStats('uni', '한양대', year);
  }

  // DB 디버깅 메서드
  async debugKafaDB(): Promise<number> {
    try {
      // 전체 데이터 개수 확인
      const totalCount = await this.kafaPlayerStatsModel.countDocuments();
      this.logger.log(`🔍 총 ${totalCount}개의 KAFA 데이터 존재`);

      // 최근 5개 샘플 데이터 조회
      const sampleData = await this.kafaPlayerStatsModel
        .find()
        .limit(5)
        .exec();

      this.logger.log(`📊 샘플 데이터:`);
      sampleData.forEach((data, index) => {
        this.logger.log(
          `${index + 1}. ${data.teamName} ${data.jerseyNumber}번 ${data.playerName} (${data.season}년 ${data.league})`,
        );
      });

      // 팀별 분포 확인
      const teamDistribution = await this.kafaPlayerStatsModel.aggregate([
        { $group: { _id: '$teamName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      this.logger.log(`📈 팀별 분포:`);
      teamDistribution.forEach((team) => {
        this.logger.log(`  ${team._id}: ${team.count}명`);
      });

      return totalCount;
    } catch (error) {
      this.logger.error(`❌ DB 디버깅 실패: ${error.message}`);
      throw new Error(`Debug failed: ${error.message}`);
    }
  }

  // KAFA DB 데이터 전체 삭제
  async clearKafaDB(): Promise<{ deletedCount: number }> {
    try {
      const result = await this.kafaPlayerStatsModel.deleteMany({});
      this.logger.log(`🗑️ ${result.deletedCount}개의 KAFA 데이터 삭제 완료`);
      return { deletedCount: result.deletedCount };
    } catch (error) {
      this.logger.error(`❌ DB 삭제 실패: ${error.message}`);
      throw new Error(`Failed to clear KAFA DB: ${error.message}`);
    }
  }

  // 모든 스탯 페이지 탐색 및 분석
  async exploreAllStatPages(league: 'uni' | 'soc' = 'uni'): Promise<any> {
    const results = [];
    
    for (let i = 1; i <= 11; i++) {
      try {
        const url = `${this.baseUrl}/ind_${league}${i}.html`;
        this.logger.log(`\n🔍 스탯 페이지 ${i} 분석: ${url}`);
        
        const { data } = await axios.get(url, { timeout: 10000 });
        const $ = cheerio.load(data);
        
        // 테이블 헤더 추출하여 어떤 스탯인지 파악
        const headers = [];
        $('.stats_table tr:first-child th').each((index, element) => {
          headers.push($(element).text().trim());
        });
        
        // 첫 번째 데이터 행 샘플
        const sampleRow = [];
        const firstDataRow = $('.stats_table tr').eq(1);
        if (firstDataRow.length) {
          firstDataRow.find('td').each((index, element) => {
            sampleRow.push($(element).text().trim());
          });
        }
        
        // 페이지 제목 추출
        const pageTitle = $('h1, h2, .page-title').first().text().trim() || 
                         $('title').text().trim();
        
        results.push({
          pageNumber: i,
          url,
          pageTitle,
          headers,
          sampleData: sampleRow,
          totalRows: $('.stats_table tr').length - 1
        });
        
        this.logger.log(`📊 페이지 ${i} 정보:`);
        this.logger.log(`  - 제목: ${pageTitle}`);
        this.logger.log(`  - 헤더: ${headers.join(' | ')}`);
        this.logger.log(`  - 데이터 행 수: ${$('.stats_table tr').length - 1}`);
        
      } catch (error) {
        this.logger.error(`❌ 페이지 ${i} 크롤링 실패: ${error.message}`);
        results.push({
          pageNumber: i,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // 특정 스탯 페이지 크롤링 (일반화된 메서드)
  async crawlStatPage(
    league: 'uni' | 'soc', 
    pageNumber: number,
    year?: string
  ): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/ind_${league}${pageNumber}.html`;
      this.logger.log(`📊 스탯 페이지 크롤링: ${url}`);
      
      const { data } = await axios.get(url, {
        params: year ? { year } : {},
        timeout: 10000,
      });
      
      const $ = cheerio.load(data);
      const stats = [];
      
      // 헤더 추출
      const headers = [];
      $('.stats_table tr:first-child th').each((index, element) => {
        headers.push($(element).text().trim());
      });
      
      // 데이터 행 파싱
      $('.stats_table tr').each((rowIndex, element) => {
        if (rowIndex === 0) return; // 헤더 건너뛰기
        
        const cells = $(element).find('td');
        const rowData = {};
        
        cells.each((cellIndex, cell) => {
          const value = $(cell).text().trim();
          if (headers[cellIndex]) {
            rowData[headers[cellIndex]] = value;
          } else {
            rowData[`col_${cellIndex}`] = value;
          }
        });
        
        // 선수 정보 파싱 (두 번째 셀에서)
        if (cells.length > 1) {
          const playerCell = $(cells[1]).text().trim();
          const playerInfo = this.parsePlayerInfo(playerCell);
          
          if (playerInfo.playerName && playerInfo.university) {
            stats.push({
              ...playerInfo,
              pageNumber,
              statType: `type_${pageNumber}`,
              rawData: rowData,
              rank: rowIndex
            });
          }
        }
      });
      
      this.logger.log(`✅ 페이지 ${pageNumber}에서 ${stats.length}명의 선수 데이터 크롤링 완료`);
      return stats;
    } catch (error) {
      this.logger.error(`❌ 페이지 ${pageNumber} 크롤링 실패: ${error.message}`);
      throw new Error(`Failed to crawl page ${pageNumber}: ${error.message}`);
    }
  }

  // KAFA 로그인 메서드
  async loginToKafa(username: string, password: string): Promise<boolean> {
    try {
      this.logger.log(`🔐 KAFA 로그인 시도 중...`);
      
      // 먼저 로그인 페이지 접속하여 쿠키 받기
      const loginPageUrl = `${this.kafaBaseUrl}/member/login.html`;
      const loginPage = await this.axiosInstance.get(loginPageUrl);
      
      // 로그인 폼 데이터 준비
      const loginData = new URLSearchParams();
      loginData.append('login_mode', 'send');
      loginData.append('login_url', '');
      loginData.append('U_id', username);
      loginData.append('U_pass', password);
      
      // 로그인 요청 (form action이 같은 페이지)
      const loginResponse = await this.axiosInstance.post(
        loginPageUrl,
        loginData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': loginPageUrl,
          },
          maxRedirects: 5, // 리다이렉트 따라가기
        }
      );
      
      // 로그인 성공 여부 확인
      // 성공 시 보통 메인 페이지로 리다이렉트되거나 로그아웃 링크가 나타남
      if (loginResponse.data.includes('로그아웃') || 
          loginResponse.data.includes('Logout') ||
          loginResponse.data.includes(username) ||
          !loginResponse.data.includes('U_id')) {
        this.logger.log(`✅ KAFA 로그인 성공`);
        return true;
      }
      
      this.logger.error(`❌ KAFA 로그인 실패`);
      return false;
    } catch (error) {
      this.logger.error(`❌ 로그인 중 오류 발생: ${error.message}`);
      return false;
    }
  }

  // 관리자 경기 데이터 크롤링 (기록용지 포함)
  async crawlMatchData(matchId: number): Promise<any> {
    try {
      const url = `${this.kafaBaseUrl}/subadmin/league_matchedit.html?L_index=${matchId}&return_str=_WX2F_subadmin_WX2F_match_result.html_WX3F_page_WX3D_1_WX26_&return_str2=_WX2F_subadmin_WX2F_match_list.html_WX3F_page_WX3D_1_WX26_L_l_index_WX3D_24_WX26_return_str_WX3D__WX2F_subadmin_WX2F_match_result.html_WX3F_page_WX3D_1_WX26__WX26_return_str_WX3D__WX26_search_type_WX3D__WX26_search_str_WX3D_`;
      this.logger.log(`📊 경기 데이터 크롤링 (기록용지 포함): Match ID ${matchId}`);
      
      const response = await this.axiosInstance.get(url);
      const $ = cheerio.load(response.data);
      
      // HTML 구조 디버깅
      this.logger.log(`🔍 페이지 제목: ${$('title').text()}`);
      this.logger.log(`🔍 form 개수: ${$('form').length}`);
      this.logger.log(`🔍 input 개수: ${$('input').length}`);
      this.logger.log(`🔍 select 개수: ${$('select').length}`);
      
      // 모든 input 필드 찾기 (전체 출력)
      this.logger.log(`🔍 === 모든 INPUT 필드 ===`);
      $('input').each((index, element) => {
        const name = $(element).attr('name');
        const type = $(element).attr('type');
        const value = $(element).val();
        const id = $(element).attr('id');
        this.logger.log(`  Input ${index + 1}: name="${name}", type="${type}", value="${value}", id="${id}"`);
      });
      
      // 모든 select 필드 찾기 (전체 출력)
      this.logger.log(`🔍 === 모든 SELECT 필드 ===`);
      $('select').each((index, element) => {
        const name = $(element).attr('name');
        const selectedValue = $(element).val();
        const selectedText = $(element).find('option:selected').text();
        const id = $(element).attr('id');
        this.logger.log(`  Select ${index + 1}: name="${name}", value="${selectedValue}", text="${selectedText}", id="${id}"`);
        
        // select의 모든 option도 출력
        $(element).find('option').each((optIndex, option) => {
          const optValue = $(option).attr('value');
          const optText = $(option).text().trim();
          this.logger.log(`    Option ${optIndex + 1}: value="${optValue}", text="${optText}"`);
        });
      });
      
      // 텍스트 내용 샘플
      this.logger.log(`🔍 페이지 텍스트 샘플: ${$('body').text().substring(0, 200)}...`);
      
      // 모든 대학교에 대해 범용적으로 팀 이름 추출
      // 대학교 + 팀명 패턴을 찾아서 추출
      const universityTeamPattern = /(\w+대학교)\s*([A-Z\s]+)/g;
      const teamMatches = response.data.matchAll(universityTeamPattern);
      const foundTeams = Array.from(teamMatches).map(match => ({
        university: match[1],
        teamName: match[2].trim(),
        fullName: `${match[1]} ${match[2].trim()}`
      }));

      // JavaScript 함수에서 팀 ID 추출
      const teamIdMatches = response.data.match(/team_cat\('\d+','(\d+)','home'\).*?team_cat\('\d+','(\d+)','away'\)/);
      const homeTeamId = teamIdMatches ? teamIdMatches[1] : null;
      const awayTeamId = teamIdMatches ? teamIdMatches[2] : null;

      // 토너먼트 정보 추출
      const tournamentMatch = response.data.match(/제\s*\d+회[^<]*대회/);
      const tournamentName = tournamentMatch ? tournamentMatch[0] : '';

      // 페이지 전체 데이터 추출
      this.logger.log(`🔍 전체 페이지 데이터 크롤링 시작`);
      
      // 1. 모든 input 필드 추출
      const allInputs = [];
      $('input').each((index, input) => {
        const $input = $(input);
        allInputs.push({
          index,
          name: $input.attr('name') || '',
          id: $input.attr('id') || '',
          type: $input.attr('type') || 'text',
          value: $input.val() || '',
          placeholder: $input.attr('placeholder') || '',
          className: $input.attr('class') || ''
        });
      });

      // 2. 모든 select 필드 추출
      const allSelects = [];
      $('select').each((index, select) => {
        const $select = $(select);
        const options = [];
        
        $select.find('option').each((optIndex, option) => {
          const $option = $(option);
          options.push({
            value: $option.attr('value') || '',
            text: $option.text().trim(),
            selected: $option.prop('selected') || false
          });
        });
        
        allSelects.push({
          index,
          name: $select.attr('name') || '',
          id: $select.attr('id') || '',
          selectedValue: $select.val() || '',
          className: $select.attr('class') || '',
          options: options
        });
      });

      // 3. 모든 테이블 데이터 추출
      const allTables = [];
      $('table').each((tableIndex, table) => {
        const $table = $(table);
        const tableData = {
          tableIndex,
          className: $table.attr('class') || '',
          id: $table.attr('id') || '',
          headers: [],
          rows: []
        };
        
        // 헤더 추출 (th 또는 첫번째 tr의 td)
        const headerRow = $table.find('tr:first-child');
        headerRow.find('th, td').each((idx, cell) => {
          const $cell = $(cell);
          tableData.headers.push({
            text: $cell.text().trim(),
            colspan: parseInt($cell.attr('colspan')) || 1,
            rowspan: parseInt($cell.attr('rowspan')) || 1,
            className: $cell.attr('class') || ''
          });
        });
        
        // 모든 행 데이터 추출
        $table.find('tr').each((rowIdx, row) => {
          const $row = $(row);
          const rowData = {
            rowIndex: rowIdx,
            className: $row.attr('class') || '',
            cells: []
          };
          
          $row.find('td, th').each((cellIdx, cell) => {
            const $cell = $(cell);
            
            // 셀 안의 모든 form 요소들 추출
            const formElements = [];
            $cell.find('input, select, textarea, button').each((elemIdx, elem) => {
              const $elem = $(elem);
              formElements.push({
                tagName: $elem.prop('tagName')?.toLowerCase(),
                type: $elem.attr('type') || '',
                name: $elem.attr('name') || '',
                id: $elem.attr('id') || '',
                value: $elem.val() || '',
                text: $elem.text().trim(),
                className: $elem.attr('class') || ''
              });
            });
            
            rowData.cells.push({
              cellIndex: cellIdx,
              text: $cell.text().trim(),
              html: $cell.html(),
              className: $cell.attr('class') || '',
              colspan: parseInt($cell.attr('colspan')) || 1,
              rowspan: parseInt($cell.attr('rowspan')) || 1,
              formElements: formElements
            });
          });
          
          if (rowData.cells.length > 0) {
            tableData.rows.push(rowData);
          }
        });
        
        allTables.push(tableData);
      });

      // 4. 모든 JavaScript 코드 추출
      const allScripts = [];
      $('script').each((index, script) => {
        const $script = $(script);
        const src = $script.attr('src');
        const content = $script.html();
        
        if (src || content) {
          allScripts.push({
            index,
            src: src || '',
            content: content || '',
            type: $script.attr('type') || 'text/javascript'
          });
        }
      });

      // 5. 모든 폼 데이터 추출
      const allForms = [];
      $('form').each((index, form) => {
        const $form = $(form);
        const formFields = [];
        
        $form.find('input, select, textarea').each((fieldIndex, field) => {
          const $field = $(field);
          formFields.push({
            tagName: $field.prop('tagName')?.toLowerCase(),
            name: $field.attr('name') || '',
            id: $field.attr('id') || '',
            type: $field.attr('type') || '',
            value: $field.val() || '',
            required: $field.prop('required') || false
          });
        });
        
        allForms.push({
          index,
          action: $form.attr('action') || '',
          method: $form.attr('method') || 'get',
          id: $form.attr('id') || '',
          className: $form.attr('class') || '',
          fields: formFields
        });
      });

      // 6. 페이지 메타 정보 추출
      const pageMetadata = {
        title: $('title').text().trim(),
        description: $('meta[name="description"]').attr('content') || '',
        keywords: $('meta[name="keywords"]').attr('content') || '',
        viewport: $('meta[name="viewport"]').attr('content') || '',
        charset: $('meta[charset]').attr('charset') || '',
        totalElements: {
          divs: $('div').length,
          spans: $('span').length,
          paragraphs: $('p').length,
          headings: $('h1, h2, h3, h4, h5, h6').length,
          images: $('img').length,
          links: $('a').length
        }
      };

      // 전체 HTML 데이터 수집 + 파싱된 정보
      const matchData = {
        matchId,
        
        // 상세 경기 정보
        matchInfo: {
          tournament: tournamentName || '',
          date: $('#L_date').val() || '',
          startTime: $('#L_time_s').val() || '',
          endTime: $('#L_time_e').val() || '',
          location: $('#L_place').val() || '',
          weather: $('#L_weather').val() || '',
          temperature: $('#L_temperature').val() || '',
          wind: $('#L_wind').val() || '',
          supervisor: $('#L_supervisor').val() || '',
          reporters: {
            reporter1: $('#L_reporter1').val() || '',
            reporter2: $('#L_reporter2').val() || '',
            reporter3: $('#L_reporter3').val() || '',
          }
        },
        
        // 발견된 모든 팀들
        foundTeams: foundTeams,

        // 전체 페이지 데이터
        completePageData: {
          // 폼 관련 데이터
          formData: {
            allInputs: allInputs,
            allSelects: allSelects,
            allForms: allForms,
            totalInputs: allInputs.length,
            totalSelects: allSelects.length,
            totalForms: allForms.length
          },
          
          // 테이블 데이터
          tableData: {
            allTables: allTables,
            totalTables: allTables.length
          },
          
          // 스크립트 데이터
          scriptData: {
            allScripts: allScripts,
            totalScripts: allScripts.length
          },
          
          // 페이지 메타데이터
          pageMetadata: pageMetadata
        },
        
        // 팀 정보 (첫 번째와 두 번째 팀을 홈/어웨이로 가정)
        teams: {
          home: {
            name: foundTeams[0]?.fullName || 'Unknown Home Team',
            university: foundTeams[0]?.university || '',
            teamName: foundTeams[0]?.teamName || '',
            teamId: homeTeamId ? parseInt(homeTeamId) : null,
            scores: {
              quarter1: parseInt($('#L_score_1qr_home').val()) || 0,
              quarter2: parseInt($('#L_score_2qr_home').val()) || 0,
              quarter3: parseInt($('#L_score_3qr_home').val()) || 0,
              quarter4: parseInt($('#L_score_4qr_home').val()) || 0,
              sudden_death: parseInt($('#L_score_sd_home').val()) || 0,
              total: parseInt($('#L_score_total_home').val()) || 0
            }
          },
          away: {
            name: foundTeams[1]?.fullName || 'Unknown Away Team',
            university: foundTeams[1]?.university || '',
            teamName: foundTeams[1]?.teamName || '',
            teamId: awayTeamId ? parseInt(awayTeamId) : null,
            scores: {
              quarter1: parseInt($('#L_score_1qr_away').val()) || 0,
              quarter2: parseInt($('#L_score_2qr_away').val()) || 0,
              quarter3: parseInt($('#L_score_3qr_away').val()) || 0,
              quarter4: parseInt($('#L_score_4qr_away').val()) || 0,
              sudden_death: parseInt($('#L_score_sd_away').val()) || 0,
              total: parseInt($('#L_score_total_away').val()) || 0
            }
          }
        },
        
        // 추가 URLs (상세 리포트 링크들)
        reportUrls: {
          homeTeam2ndReport: homeTeamId ? `https://www.kafa.org/SCORES/report_2nd.html?result_idx=${matchId}&team_idx=${homeTeamId}` : null,
          awayTeam2ndReport: awayTeamId ? `https://www.kafa.org/SCORES/report_2nd.html?result_idx=${matchId}&team_idx=${awayTeamId}` : null,
          homeTeam3rdReport: homeTeamId ? `https://www.kafa.org/SCORES/report_3rd.html?result_idx=${matchId}&team_idx=${homeTeamId}` : null,
          awayTeam3rdReport: awayTeamId ? `https://www.kafa.org/SCORES/report_3rd.html?result_idx=${matchId}&team_idx=${awayTeamId}` : null,
          matchReport: `https://www.kafa.org/SCORES/report_4th.html?result_idx=${matchId}`
        },
        
        // 전체 HTML 원본 (모든 데이터 포함)
        rawHTML: response.data,
        
        // 메타 정보
        meta: {
          pageTitle: $('title').text(),
          totalInputs: $('input').length,
          totalSelects: $('select').length,
          totalTables: $('table').length,
          crawledAt: new Date().toISOString(),
          sourceUrl: url
        }
      };
      
      // 쿼터별 플레이 데이터 수집 추가
      const quarterPlayData = await this.crawlQuarterPlayData(matchId);
      
      // circular reference를 피하기 위해 안전하게 변환
      try {
        const safeQuarterPlayData = JSON.parse(JSON.stringify(quarterPlayData));
        (matchData as any).quarterPlayData = safeQuarterPlayData;
      } catch (jsonError) {
        this.logger.warn(`⚠️ quarterPlayData JSON 변환 실패, 요약 정보만 포함: ${jsonError.message}`);
        (matchData as any).quarterPlayData = {
          summary: `${Object.keys(quarterPlayData).length}개 쿼터 데이터 수집됨`,
          quarters: Object.keys(quarterPlayData),
          error: 'circular_reference_prevented'
        };
      }

      // 플레이 데이터를 DB에 저장
      await this.savePlayDataToDB(matchId, quarterPlayData);

      this.logger.log(`✅ 전체 경기 데이터 크롤링 완료: ${matchData.meta.totalInputs}개 input, ${matchData.meta.totalSelects}개 select, ${matchData.meta.totalTables}개 테이블`);
      return matchData;
    } catch (error) {
      this.logger.error(`❌ 경기 데이터 크롤링 실패: ${error.message}`);
      throw new Error(`Failed to crawl match data: ${error.message}`);
    }
  }

  // 쿼터별 플레이 데이터 크롤링
  async crawlQuarterPlayData(matchId: number): Promise<any> {
    this.logger.log(`🏈 쿼터별 플레이 데이터 크롤링 시작: Match ID ${matchId}`);
    
    const quarters = ['1qtr', '2qtr', '3qtr', '4qtr', 'SD'];
    const quarterData = {};

    try {
      for (const qtr of quarters) {
        this.logger.log(`⚡ ${qtr.toUpperCase()} 플레이 데이터 수집 중...`);
        
        const playData = await this.getQuarterData(matchId, qtr);
        quarterData[qtr] = playData;
        
        this.logger.log(`✅ ${qtr.toUpperCase()} 데이터 수집 완료: ${playData?.plays?.length || 0}개 플레이`);
      }

      this.logger.log(`🏆 전체 쿼터별 플레이 데이터 크롤링 완료`);
      return quarterData;
    } catch (error) {
      this.logger.error(`❌ 쿼터별 플레이 데이터 크롤링 실패: ${error.message}`);
      return {};
    }
  }

  // 특정 쿼터의 플레이 데이터 수집
  async getQuarterData(matchId: number, quarter: string): Promise<any> {
    try {
      // subadmin 경로를 사용해야 할 수도 있음
      const ajaxUrl = `${this.kafaBaseUrl}/subadmin/ajax_result.php`;
      
      // FormData 생성
      const formData = new URLSearchParams();
      formData.append('result_idx', matchId.toString());
      formData.append('qtr', quarter);
      formData.append('mode', 'read_result');

      this.logger.log(`🔍 ${quarter.toUpperCase()} AJAX 요청: ${ajaxUrl}`);
      this.logger.log(`📤 전송 데이터: ${formData.toString()}`);

      // KAFA 사이트의 정확한 헤더 재현
      const response = await this.axiosInstance.post(ajaxUrl, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': `${this.kafaBaseUrl}/subadmin/league_matchedit.html?L_index=${matchId}`,
          'Origin': this.kafaBaseUrl
        },
      });

      this.logger.log(`📥 ${quarter.toUpperCase()} 응답 타입: ${typeof response.data}`);
      this.logger.log(`📥 ${quarter.toUpperCase()} 응답 길이: ${response.data?.length || 0}자`);
      this.logger.log(`📥 ${quarter.toUpperCase()} 응답 내용: ${JSON.stringify(response.data)?.substring(0, 300)}...`);

      if (response.data) {
        // 이미 객체인 경우 (axios가 자동으로 JSON 파싱함)
        if (typeof response.data === 'object' && response.data.text && response.data.count !== undefined) {
          this.logger.log(`✅ ${quarter.toUpperCase()} JSON 객체 확인됨 - ${response.data.count}개 플레이`);
          return this.parsePlayData(response.data, quarter);
        }
        // 문자열인 경우 JSON 파싱 시도
        else if (typeof response.data === 'string') {
          try {
            const jsonData = JSON.parse(response.data);
            this.logger.log(`✅ ${quarter.toUpperCase()} JSON 파싱 성공`);
            return this.parsePlayData(jsonData, quarter);
          } catch (jsonError) {
            // HTML 응답인 경우 파싱
            this.logger.log(`🔄 ${quarter.toUpperCase()} HTML로 파싱 시도`);
            return this.parseHtmlPlayData(response.data, quarter);
          }
        }
      }

      return { quarter, plays: [], count: 0 };
    } catch (error) {
      this.logger.warn(`⚠️ ${quarter.toUpperCase()} 데이터 수집 실패: ${error.message}`);
      return { quarter, plays: [], count: 0, error: error.message };
    }
  }

  // JSON 형태 플레이 데이터 파싱
  private parsePlayData(data: any, quarter: string): any {
    try {
      if (data.text && data.count !== undefined) {
        // HTML 테이블 파싱 (table 태그로 감싸기)
        const wrappedHtml = `<table>${data.text}</table>`;
        const $ = cheerio.load(wrappedHtml);
        const plays = [];

        $('tr').each((index, row) => {
          const $row = $(row);
          const cells = [];
          
          $row.find('td, th').each((cellIdx, cell) => {
            const $cell = $(cell);
            cells.push({
              text: $cell.text().trim(),
              html: $cell.html()?.toString() || '',
              className: $cell.attr('class') || ''
            });
          });

          if (cells.length > 0) {
            // 플레이 데이터 구조화
            const playData = this.structurePlayData(cells, index);
            if (playData && Object.keys(playData).length > 0) {
              plays.push(playData);
            }
          }
        });

        return {
          quarter,
          plays,
          count: data.count || plays.length,
          rawHtml: typeof data.text === 'string' ? data.text : ''
        };
      }
      
      return { quarter, plays: [], count: 0 };
    } catch (error) {
      this.logger.error(`❌ ${quarter} JSON 플레이 데이터 파싱 실패: ${error.message}`);
      return { quarter, plays: [], count: 0, error: error.message };
    }
  }

  // HTML 형태 플레이 데이터 파싱
  private parseHtmlPlayData(html: string, quarter: string): any {
    try {
      const wrappedHtml = `<table>${html}</table>`;
      const $ = cheerio.load(wrappedHtml);
      const plays = [];

      $('tr').each((index, row) => {
        const $row = $(row);
        const cells = [];
        
        $row.find('td, th').each((cellIdx, cell) => {
          const $cell = $(cell);
          cells.push({
            text: $cell.text().trim(),
            html: $cell.html()?.toString() || '',
            className: $cell.attr('class') || ''
          });
        });

        if (cells.length > 0) {
          const playData = this.structurePlayData(cells, index);
          if (playData && Object.keys(playData).length > 0) {
            plays.push(playData);
          }
        }
      });

      return {
        quarter,
        plays,
        count: plays.length,
        rawHtml: typeof html === 'string' ? html : ''
      };
    } catch (error) {
      this.logger.error(`❌ ${quarter} HTML 플레이 데이터 파싱 실패: ${error.message}`);
      return { quarter, plays: [], count: 0, error: error.message };
    }
  }


  // 셀들에서 패널티 정보를 유연하게 찾는 메서드
  private findPenaltyInCells(cells: any[]): string {
    // 패널티 패턴 (예: KN-5YD, HY-10YD, P-5YD 등)
    const penaltyPattern = /^([A-Z]{1,3}[+-]?\d+YD|P[+-]\d+YD|DeclineYD|FD)$/;
    
    // cells 배열에서 패널티 패턴을 찾음 (19-23 인덱스 범위에서 우선 검색)
    for (let i = 19; i <= 23; i++) {
      const cellText = cells[i]?.text?.trim() || '';
      if (cellText && penaltyPattern.test(cellText)) {
        return cellText;
      }
    }
    
    // 못 찾으면 전체 셀에서 검색
    for (let i = 0; i < cells.length; i++) {
      const cellText = cells[i]?.text?.trim() || '';
      if (cellText && penaltyPattern.test(cellText)) {
        return cellText;
      }
    }
    
    return '';
  }

  // 플레이 데이터 구조화 (스크린샷 기준)
  private structurePlayData(cells: any[], index: number): any {
    if (cells.length < 10) return null; // 최소한의 셀 개수 체크 (20 → 10으로 완화)

    try {
      // 디버깅을 위한 로그 (첫 번째 플레이만)
      if (index === 1) {
        this.logger.log(`🔍 첫 번째 플레이 셀 분석 (총 ${cells.length}개 셀):`);
        cells.slice(0, 15).forEach((cell, idx) => {
          this.logger.log(`  셀 ${idx}: "${cell.text}" (class: ${cell.className})`);
        });
      }

      // rawCells[0]에서 실제 플레이 번호 추출 (숫자만)
      const actualPlayNumber = parseInt(cells[0]?.text?.replace(/\D/g, '') || index.toString());
      
      return {
        playNumber: actualPlayNumber,
        gameTime: cells[2]?.text?.replace(/\s+/g, ' ') || '',
        offenseTeam: cells[3]?.text || '',
        ballOn: cells[4]?.text || '',
        down: cells[5]?.text || '',
        qbPasser: cells[6]?.text || '',
        playDetail: cells[7]?.text || '',
        yards: cells[8]?.text || '',
        result: cells[9]?.text || '',
        sack: cells[10]?.text || '',
        gainYards: {
          offense: cells[11]?.text || '',
          penalty: cells[12]?.text || '',
          total: cells[13]?.text || ''
        },
        kickReturn: {
          playerNumber: cells[14]?.text || '',
          yards: cells[15]?.text || ''
        },
        fumble: {
          playerNumber: cells[16]?.text || '',
        },
        fumbleRecovery: {
          playerNumber: cells[17]?.text || '',
          yards: cells[18]?.text || ''
        },
        interception: {
          playerNumber: cells[19]?.text || '',
          yards: cells[20]?.text || ''
        },
        // 패널티는 여러 위치에 있을 수 있으므로 유연하게 검색
        penalty: this.findPenaltyInCells(cells) || '',
        penaltyName: cells[22]?.text || '',
        firstDown: cells[23]?.text || '',
        remark: cells[24]?.text || '',
        score: {
          type: cells[25]?.text || '',
          points: cells[26]?.text || ''
        },
        rawCells: cells.map(cell => ({
          text: cell.text,
          html: cell.html,
          className: cell.className
        }))
      };
    } catch (error) {
      this.logger.warn(`⚠️ 플레이 데이터 구조화 실패 (Row ${index}): ${error.message}`);
      return null;
    }
  }

  // 플레이 데이터를 DB에 저장
  async savePlayDataToDB(matchId: number, quarterData: any): Promise<void> {
    this.logger.log(`💾 플레이 데이터 DB 저장 시작: Match ID ${matchId}`);
    
    let totalSaved = 0;
    let totalErrors = 0;

    try {
      // 기존 데이터 삭제 (재크롤링 시 중복 방지)
      // V2에서는 KafaMatch.plays 사용
      // const deleteResult = await this.gamePlayDataModel.deleteMany({ matchId });
      const deleteResult = { deletedCount: 0 };
      this.logger.log(`🗑️ 기존 데이터 삭제: ${deleteResult.deletedCount}개`);

      for (const [quarter, data] of Object.entries(quarterData as any)) {
        const quarterPlayData = data as any;
        if (quarterPlayData?.plays && Array.isArray(quarterPlayData.plays)) {
          for (const play of quarterPlayData.plays) {
            try {
              // V2에서는 KafaMatch.plays 사용
              const playDocument = {
                matchId,
                quarter,
                playNumber: play.playNumber,
                gameTime: play.gameTime,
                offenseTeam: play.offenseTeam,
                ballOn: play.ballOn,
                down: play.down,
                qbPasser: play.qbPasser,
                playToNumber: play.playToNumber,
                kickPuntYards: play.kickPuntYards,
                tackleBy: play.tackleBy,
                sack: play.sack,
                gainYards: play.gainYards,
                kickReturn: play.kickReturn,
                fumble: play.fumble,
                fumbleRecovery: play.fumbleRecovery,
                interception: play.interception,
                penalty: play.penalty,
                penaltyName: play.penaltyName,
                firstDown: play.firstDown,
                remark: play.remark,
                score: play.score,
                rawCells: JSON.parse(JSON.stringify(play.rawCells || [])),
                rawHtml: quarterPlayData.rawHtml,
                crawledAt: new Date()
              };

              // await playDocument.save(); // V2에서는 다른 방식으로 저장
              totalSaved++;
            } catch (saveError) {
              totalErrors++;
              this.logger.warn(`⚠️ 플레이 데이터 저장 실패 (${quarter} Play ${play.playNumber}): ${saveError.message}`);
            }
          }
        }
      }

      this.logger.log(`✅ 플레이 데이터 DB 저장 완료: ${totalSaved}개 저장, ${totalErrors}개 실패`);
    } catch (error) {
      this.logger.error(`❌ 플레이 데이터 DB 저장 실패: ${error.message}`);
      throw error;
    }
  }

  // 저장된 플레이 데이터 조회
  async getPlayDataFromDB(matchId: number, quarter?: string): Promise<any[]> {
    try {
      const filter: any = { matchId };
      if (quarter) {
        filter.quarter = quarter;
      }

      // V2에서는 KafaMatch에서 직접 조회
      const playData = [] as any[];
      /* await this.gamePlayDataModel
        .find(filter)
        .sort({ quarter: 1, playNumber: 1 })
        .lean(); */

      this.logger.log(`📊 플레이 데이터 조회 완료: ${playData.length}개 플레이`);
      return playData;
    } catch (error) {
      this.logger.error(`❌ 플레이 데이터 조회 실패: ${error.message}`);
      throw error;
    }
  }

  // 모든 스탯 페이지 크롤링 및 통합
  async crawlAndMergeAllStats(
    league: 'uni' | 'soc' = 'uni',
    season: string = '2025'
  ): Promise<{ success: boolean; message: string; summary: any }> {
    try {
      this.logger.log(`🚀 전체 스탯 크롤링 시작: ${league} 리그 ${season} 시즌`);
      
      const playerMap = new Map(); // 선수별 데이터 통합을 위한 Map
      const crawlSummary = {
        totalPages: 0,
        successPages: 0,
        failedPages: [],
        totalPlayers: 0,
        statTypes: []
      };
      
      // 1-11 페이지 크롤링
      for (let pageNum = 1; pageNum <= 11; pageNum++) {
        try {
          const pageStats = await this.crawlStatPage(league, pageNum, season);
          
          if (pageStats.length > 0) {
            crawlSummary.successPages++;
            crawlSummary.statTypes.push({
              pageNumber: pageNum,
              playerCount: pageStats.length
            });
            
            // 선수별로 데이터 통합
            pageStats.forEach(stat => {
              const key = `${stat.teamName}_${stat.jerseyNumber}_${stat.playerName}`;
              
              if (!playerMap.has(key)) {
                playerMap.set(key, {
                  playerName: stat.playerName,
                  teamName: stat.teamName,
                  jerseyNumber: stat.jerseyNumber,
                  season,
                  league,
                  stats: {}
                });
              }
              
              // 스탯 타입별로 저장
              const player = playerMap.get(key);
              player.stats[`stat_type_${pageNum}`] = stat.rawData;
            });
          }
        } catch (error) {
          crawlSummary.failedPages.push({
            page: pageNum,
            error: error.message
          });
        }
        
        crawlSummary.totalPages++;
      }
      
      crawlSummary.totalPlayers = playerMap.size;
      
      this.logger.log(`\n📊 크롤링 완료 요약:`);
      this.logger.log(`  - 총 페이지: ${crawlSummary.totalPages}`);
      this.logger.log(`  - 성공: ${crawlSummary.successPages}`);
      this.logger.log(`  - 실패: ${crawlSummary.failedPages.length}`);
      this.logger.log(`  - 총 선수 수: ${crawlSummary.totalPlayers}`);
      
      return {
        success: true,
        message: `${crawlSummary.totalPlayers}명의 선수에 대한 ${crawlSummary.successPages}개 스탯 타입 크롤링 완료`,
        summary: crawlSummary
      };
      
    } catch (error) {
      this.logger.error(`❌ 전체 크롤링 실패: ${error.message}`);
      return {
        success: false,
        message: error.message,
        summary: null
      };
    }
  }

  /**
   * 경기 기록지 통계 계산
   * @param matchId 경기 ID
   * @param quarter 특정 쿼터 (선택사항)
   * @returns 경기 통계 데이터
   */
  async calculateGameRecordStats(matchId: number, quarter?: string): Promise<any> {
    try {
      this.logger.log(`📊 경기 ${matchId} 기록지 통계 계산 시작${quarter ? ` (${quarter})` : ''}`);

      // MongoDB에서 플레이 데이터 조회
      const query: any = { matchId };
      if (quarter) {
        query.quarter = quarter;
      }

      // V2에서는 KafaMatch에서 직접 조회
      const plays = [] as any[]; // await this.gamePlayDataModel.find(query).exec();
      
      if (plays.length === 0) {
        throw new Error(`경기 ${matchId}의 플레이 데이터를 찾을 수 없습니다.`);
      }

      // 팀 목록 추출
      const teams = [...new Set(plays.map(play => play.offenseTeam).filter(team => team))];
      this.logger.log(`🏈 참가 팀: ${teams.join(' vs ')}`);

      // 통계 초기화
      const stats = {
        matchId,
        homeTeam: teams[0] || '',
        awayTeam: teams[1] || '',
        totalPlays: plays.length,
        teamStats: {} as any,
        quarterStats: {} as any
      };

      // 팀별 통계 초기화
      teams.forEach(team => {
        stats.teamStats[team] = {
          teamName: team,
          totalPlays: 0,
          rushingPlays: 0,
          passingPlays: 0,
          totalYards: 0,
          rushingYards: 0,
          passingYards: 0,
          turnovers: 0,
          penalties: 0,
          penaltyYards: 0,
          scores: 0,
          thirdDownAttempts: 0,
          thirdDownConversions: 0,
          thirdDownPercentage: 0
        };
      });

      // 쿼터별 통계 초기화
      const quarters = [...new Set(plays.map(play => play.quarter).filter(q => q))];
      quarters.forEach(q => {
        stats.quarterStats[q] = {
          plays: 0,
          scores: 0
        };
      });

      // 플레이별 분석
      plays.forEach(play => {
        const team = play.offenseTeam;
        if (!team) return;

        const teamStat = stats.teamStats[team];
        const quarterStat = stats.quarterStats[play.quarter];

        // 기본 카운트
        teamStat.totalPlays++;
        quarterStat.plays++;

        // 패싱 vs 러싱 구분
        const playType = this.determinePlayType(play);
        
        // 디버깅: 첫 10개 플레이만 로그 출력
        if (play.playNumber <= 10) {
          this.logger.log(`🔍 플레이 ${play.playNumber}: ${play.offenseTeam} - playType: ${playType}`);
          this.logger.log(`  rawCells[7]: ${play.rawCells?.[7]?.text || 'undefined'}`);
          this.logger.log(`  rawCells length: ${play.rawCells?.length || 0}`);
          this.logger.log(`  gainYards.offense: ${play.gainYards?.offense || 'empty'}`);
        }
        
        if (playType === 'PASS') {
          teamStat.passingPlays++;
          // 패싱 야드 계산 (gainYards.offense 또는 rawCells[8] 사용)
          const passingYards = this.extractYards(play.gainYards?.offense || 
                                                 (play.rawCells?.[8]?.text || '0'));
          teamStat.passingYards += passingYards;
        } else if (playType === 'RUSH') {
          teamStat.rushingPlays++;
          // 러싱 야드 계산 (gainYards.offense 사용)
          const rushingYards = this.extractYards(play.gainYards?.offense || '0');
          teamStat.rushingYards += rushingYards;
        }

        // 총 야드 계산
        const totalYards = this.extractYards(play.gainYards?.total || '0');
        teamStat.totalYards += totalYards;

        // 턴오버 체크
        if (play.fumbleRecovery?.playerNumber || play.interception?.playerNumber) {
          teamStat.turnovers++;
        }

        // 반칙은 별도 처리로 이동 (공격/수비 구분 없이 처리하기 위해)

        // 득점 체크 (score 컬럼 직접 사용)
        const scoreTeam = play.score?.type?.trim() || '';
        const scorePoints = parseInt(play.score?.points?.trim() || '0') || 0;
        
        if (scorePoints > 0 && scoreTeam) {
          // 득점한 팀의 통계에 점수 추가
          if (stats.teamStats[scoreTeam]) {
            stats.teamStats[scoreTeam].scores += scorePoints;
            quarterStat.scores += scorePoints;
          }
        }

        // 3rd Down 분석
        if (play.down && play.down.startsWith('3-')) {
          teamStat.thirdDownAttempts++;
          // FD 필드 또는 remark에서 1st down 확인
          const remark = play.remark || '';
          if ((play.firstDown && play.firstDown.trim() === 'FD') ||
              (remark && (remark.includes('1st down') || remark.includes('FD')))) {
            teamStat.thirdDownConversions++;
          }
        }
      });

      // 패널티 별도 처리 (공격/수비 상관없이 전체 플레이에서 체크)
      // 먼저 패널티 초기화
      Object.values(stats.teamStats).forEach((teamStat: any) => {
        teamStat.penalties = 0;
        teamStat.penaltyYards = 0;
      });
      
      this.logger.log(`🔍 패널티 처리 시작: ${plays.length}개 플레이 분석`);
      let penaltyCount = 0;
      
      plays.forEach(play => {
        const penaltyValue = play.penalty?.trim();
        
        // 패널티 필드가 있는 플레이 로그
        if (penaltyValue) {
          this.logger.log(`패널티 필드 발견: "${penaltyValue}" (${play.quarter} Play ${play.playNumber})`);
          penaltyCount++;
        }
        
        // 패널티가 있고, DeclineYD나 FD가 아닌 경우
        if (penaltyValue && penaltyValue !== 'DeclineYD' && penaltyValue !== 'FD') {
          let penaltyTeam = this.extractPenaltyTeam(penaltyValue);
          
          // P±YD 형식인 경우 현재 공격팀을 패널티 팀으로 간주
          if (!penaltyTeam && penaltyValue.match(/^P[+-]\d+YD$/)) {
            penaltyTeam = play.offenseTeam;
          }
          
          if (penaltyTeam && stats.teamStats[penaltyTeam]) {
            stats.teamStats[penaltyTeam].penalties++;
            const penaltyYards = this.extractPenaltyYards(penaltyValue);
            stats.teamStats[penaltyTeam].penaltyYards += Math.abs(penaltyYards);
            
            // 디버그 로그
            this.logger.log(`✅ 패널티 카운트: ${penaltyValue} → 팀: ${penaltyTeam}, 야드: ${penaltyYards}, 플레이: ${play.quarter} ${play.playNumber}`);
          } else {
            this.logger.log(`❌ 패널티 팀 추출 실패: ${penaltyValue} → 팀: ${penaltyTeam}`);
          }
        }
      });
      
      this.logger.log(`🔍 패널티 처리 완료: 총 ${penaltyCount}개 패널티 필드 발견`);

      // 3rd Down 성공률 계산
      Object.values(stats.teamStats).forEach((teamStat: any) => {
        if (teamStat.thirdDownAttempts > 0) {
          teamStat.thirdDownPercentage = Math.round(
            (teamStat.thirdDownConversions / teamStat.thirdDownAttempts) * 100
          );
        }
      });

      this.logger.log(`✅ 경기 ${matchId} 통계 계산 완료: ${plays.length}개 플레이 분석`);
      return {
        success: true,
        message: `경기 ${matchId} 기록지 통계 계산 완료`,
        data: stats
      };

    } catch (error) {
      this.logger.error(`❌ 경기 기록지 통계 계산 실패: ${error.message}`);
      throw new Error(`경기 기록지 통계 계산 실패: ${error.message}`);
    }
  }

  /**
   * 야드 문자열에서 숫자 추출
   * @param yardString "73YD", "10YD", "-5YD" 등
   * @returns 숫자 값
   */
  private extractYards(yardString: string): number {
    if (!yardString) return 0;
    const match = yardString.match(/(-?\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * 반칙 야드 추출
   * @param penaltyString "YS-10YD", "KI+5YD" 등
   * @returns 야드 값 (음수/양수 구분)
   */
  private extractPenaltyYards(penaltyString: string): number {
    if (!penaltyString) return 0;
    const match = penaltyString.match(/([+-]?\d+)YD/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * 반칙 팀 추출
   * @param penaltyString "YS-10YD", "HY+5YD" 등
   * @returns 팀 코드 (YS, HY, KN 등)
   */
  private extractPenaltyTeam(penaltyString: string): string {
    if (!penaltyString) return '';
    const match = penaltyString.match(/^([A-Z]+)[+-]/);
    return match ? match[1] : '';
  }

  /**
   * 플레이 타입 판단 (러싱/패싱/기타)
   * @param play 플레이 데이터
   * @returns PASS, RUSH, KICK, PUNT, OTHER
   */
  private determinePlayType(play: any): string {
    // rawCells[7]에 실제 플레이 타입이 있음 ("R → HY11", "P → KN12" 등)
    let playTypeSource = '';
    
    if (play.rawCells && play.rawCells[7] && play.rawCells[7].text) {
      playTypeSource = play.rawCells[7].text;
    }
    
    // 패싱: "P → KN12" 패턴
    if (playTypeSource.includes('P →')) {
      return 'PASS';
    }
    
    // 러싱: "R → HY30" 패턴  
    if (playTypeSource.includes('R →')) {
      return 'RUSH';
    }
    
    // 킥: "K → KN08" 패턴
    if (playTypeSource.includes('K →')) {
      return 'KICK';
    }
    
    // 펀트: "PT → HY71" 패턴
    if (playTypeSource.includes('PT →')) {
      return 'PUNT';
    }
    
    return 'OTHER';
  }

  /**
   * 스코어보드에서 Total(자동합산) 점수 추출
   * @param matchData 크롤링된 경기 데이터
   * @returns 홈팀/어웨이팀 총점 및 쿼터별 점수
   */
  private extractScoreboardTotals(matchData: any) {
    const scores = {
      home: { quarter1: 0, quarter2: 0, quarter3: 0, quarter4: 0, total: 0 },
      away: { quarter1: 0, quarter2: 0, quarter3: 0, quarter4: 0, total: 0 }
    };

    // 완전한 크롤링 데이터에서 form input 찾기
    if (matchData.data?.completePageData?.formData?.allInputs) {
      const inputs = matchData.data.completePageData.formData.allInputs;
      
      inputs.forEach(input => {
        if (input.id === 'L_score_total_home') {
          scores.home.total = parseInt(input.value) || 0;
        } else if (input.id === 'L_score_total_away') {
          scores.away.total = parseInt(input.value) || 0;
        } else if (input.id === 'L_score_1qr_home') {
          scores.home.quarter1 = parseInt(input.value) || 0;
        } else if (input.id === 'L_score_1qr_away') {
          scores.away.quarter1 = parseInt(input.value) || 0;
        } else if (input.id === 'L_score_2qr_home') {
          scores.home.quarter2 = parseInt(input.value) || 0;
        } else if (input.id === 'L_score_2qr_away') {
          scores.away.quarter2 = parseInt(input.value) || 0;
        } else if (input.id === 'L_score_3qr_home') {
          scores.home.quarter3 = parseInt(input.value) || 0;
        } else if (input.id === 'L_score_3qr_away') {
          scores.away.quarter3 = parseInt(input.value) || 0;
        } else if (input.id === 'L_score_4qr_home') {
          scores.home.quarter4 = parseInt(input.value) || 0;
        } else if (input.id === 'L_score_4qr_away') {
          scores.away.quarter4 = parseInt(input.value) || 0;
        }
      });
    }

    return scores;
  }

  /**
   * 경기 일반 정보 추출 (크롤링 데이터 기반)
   * @param matchId 경기 ID
   * @returns 경기 일반 정보
   */
  async getGameGeneralInfo(matchId: number): Promise<any> {
    try {
      this.logger.log(`📊 경기 ${matchId} 일반 정보 추출 시작`);

      // 1. MongoDB에서 플레이 데이터 조회 (팀 정보 추출용)
      // V2에서는 KafaMatch에서 직접 조회
      const samplePlay = null; // await this.gamePlayDataModel.findOne({ matchId }).exec();
      
      // 2. 크롤링 파일에서 기본 정보 추출
      const fs = require('fs');
      const path = require('path');
      
      let matchInfo = null;
      let quarterData = null;
      
      // crawling_result.json에서 기본 정보 추출
      const crawlingResultPath = path.join(__dirname, '../../../crawling_result.json');
      if (fs.existsSync(crawlingResultPath)) {
        const crawlingResult = JSON.parse(fs.readFileSync(crawlingResultPath, 'utf8'));
        if (crawlingResult.data.matchId === matchId) {
          matchInfo = crawlingResult.data.matchInfo;
        }
      }
      
      // crawling_result_qtr1.json에서 팀 정보 추출
      const quarterDataPath = path.join(__dirname, '../../../crawling_result_qtr1.json');
      if (fs.existsSync(quarterDataPath)) {
        const quarterResult = JSON.parse(fs.readFileSync(quarterDataPath, 'utf8'));
        if (quarterResult.data.matchId === matchId) {
          quarterData = quarterResult.data;
        }
      }
      
      if (!matchInfo) {
        throw new Error(`경기 ${matchId}의 기본 정보를 찾을 수 없습니다.`);
      }
      
      // 3. 팀 정보 추출 (쿼터 데이터에서)
      const teams = new Set<string>();
      let homeTeam = '';
      let awayTeam = '';
      
      if (quarterData && quarterData.quarters) {
        Object.keys(quarterData.quarters).forEach(quarter => {
          quarterData.quarters[quarter].forEach((play: any) => {
            if (play.offenseTeam) {
              teams.add(play.offenseTeam);
            }
            
            // 킥리턴에서 수비팀 추출
            if (play.kickReturn?.playerNumber) {
              const kickInfo = play.kickReturn.playerNumber;
              if (kickInfo.includes('→')) {
                const parts = kickInfo.split('→');
                if (parts.length > 1 && parts[1].match(/^[A-Z]{2,3}/)) {
                  const team = parts[1].substring(0, 2);
                  teams.add(team);
                }
              }
            }
          });
        });
      }
      
      const teamList = Array.from(teams).sort();
      homeTeam = teamList[0] || '';
      awayTeam = teamList[1] || '';
      
      // 4. Total(자동합산) 스코어 추출
      let finalScores = null;
      
      // crawling_result.json에서 Total(자동합산) 점수 추출 시도
      if (fs.existsSync(crawlingResultPath)) {
        const crawlingResult = JSON.parse(fs.readFileSync(crawlingResultPath, 'utf8'));
        if (crawlingResult.data.matchId === matchId) {
          finalScores = this.extractScoreboardTotals(crawlingResult);
          this.logger.log(`✅ Total(자동합산) 점수 추출: 홈 ${finalScores.home.total} - 어웨이 ${finalScores.away.total}`);
        }
      }
      
      // Total(자동합산) 점수를 팀별로 매핑
      const teamScores = { [homeTeam]: 0, [awayTeam]: 0 };
      const quarterScores = {
        q1: { [homeTeam]: 0, [awayTeam]: 0 },
        q2: { [homeTeam]: 0, [awayTeam]: 0 },
        q3: { [homeTeam]: 0, [awayTeam]: 0 },
        q4: { [homeTeam]: 0, [awayTeam]: 0 }
      };
      
      if (finalScores) {
        // 홈팀은 첫 번째 팀, 어웨이팀은 두 번째 팀
        teamScores[homeTeam] = finalScores.home.total;
        teamScores[awayTeam] = finalScores.away.total;
        
        // 쿼터별 점수도 매핑
        quarterScores.q1[homeTeam] = finalScores.home.quarter1;
        quarterScores.q1[awayTeam] = finalScores.away.quarter1;
        quarterScores.q2[homeTeam] = finalScores.home.quarter2;
        quarterScores.q2[awayTeam] = finalScores.away.quarter2;
        quarterScores.q3[homeTeam] = finalScores.home.quarter3;
        quarterScores.q3[awayTeam] = finalScores.away.quarter3;
        quarterScores.q4[homeTeam] = finalScores.home.quarter4;
        quarterScores.q4[awayTeam] = finalScores.away.quarter4;
      } else {
        // 폴백: 기존 방식으로 계산 (플레이별 득점 합계)
        this.logger.warn(`⚠️ Total(자동합산) 점수 없음, 플레이별 계산으로 폴백`);
        
        if (quarterData && quarterData.quarters) {
          Object.keys(quarterData.quarters).forEach(quarter => {
            quarterData.quarters[quarter].forEach((play: any) => {
              if (play.score && play.score.type) {
                const points = parseInt(play.score.type) || 0;
                const scoreTeam = play.offenseTeam;
                
                if (points > 0 && scoreTeam && teamScores.hasOwnProperty(scoreTeam)) {
                  teamScores[scoreTeam] += points;
                  
                  if (quarter === '1qtr') {
                    quarterScores.q1[scoreTeam] += points;
                  } else if (quarter === '2qtr') {
                    quarterScores.q2[scoreTeam] += points;
                  } else if (quarter === '3qtr') {
                    quarterScores.q3[scoreTeam] += points;
                  } else if (quarter === '4qtr') {
                    quarterScores.q4[scoreTeam] += points;
                  }
                }
              }
            });
          });
        }
      }
      
      // 5. 리그 타입 추출 (대회명에서)
      let leagueType = '전체';
      if (matchInfo.tournament.includes('1부')) {
        leagueType = '1부';
      } else if (matchInfo.tournament.includes('2부')) {
        leagueType = '2부';
      }
      
      // 6. 팀 풀네임 매핑 (일반적인 대학교 코드 매핑)
      const teamNameMap = {
        'HY': '한양대학교',
        'KN': '고려대학교',
        'YS': '연세대학교',
        'KI': '경일대학교',
        'SN': '성균관대학교',
        'DK': '단국대학교',
        'CU': '중앙대학교'
      };
      
      const homeTeamFullName = teamNameMap[homeTeam as keyof typeof teamNameMap] || `${homeTeam} 대학교`;
      const awayTeamFullName = teamNameMap[awayTeam as keyof typeof teamNameMap] || `${awayTeam} 대학교`;
      
      // 7. 결과 구성
      const gameGeneralInfo = {
        matchId,
        leagueType,
        gameDate: new Date(matchInfo.date),
        venue: matchInfo.location,
        
        homeTeam: {
          fullName: homeTeamFullName,
          code: homeTeam,
          isHome: true
        },
        
        awayTeam: {
          fullName: awayTeamFullName,
          code: awayTeam,
          isHome: false
        },
        
        finalScore: {
          home: teamScores[homeTeam],
          away: teamScores[awayTeam]
        },
        
        quarterScores: {
          q1: { home: quarterScores.q1[homeTeam], away: quarterScores.q1[awayTeam] },
          q2: { home: quarterScores.q2[homeTeam], away: quarterScores.q2[awayTeam] },
          q3: { home: quarterScores.q3[homeTeam], away: quarterScores.q3[awayTeam] },
          q4: { home: quarterScores.q4[homeTeam], away: quarterScores.q4[awayTeam] }
        },
        
        processedAt: new Date(),
        dataSource: 'crawled'
      };
      
      this.logger.log(`✅ 경기 ${matchId} 일반 정보 추출 완료`);
      this.logger.log(`🏈 ${homeTeamFullName} vs ${awayTeamFullName}`);
      this.logger.log(`🏆 최종 스코어: ${teamScores[homeTeam]} - ${teamScores[awayTeam]}`);
      
      return {
        success: true,
        message: `경기 ${matchId} 일반 정보 추출 완료`,
        data: gameGeneralInfo
      };
      
    } catch (error) {
      this.logger.error(`❌ 경기 일반 정보 추출 실패: ${error.message}`);
      throw new Error(`경기 일반 정보 추출 실패: ${error.message}`);
    }
  }

  // 특정 페이지의 팀 스탯 크롤링 (일반화)
  async getTeamStatsByPage(league: 'uni' | 'soc', pageType: string, year?: string): Promise<any[]> {
    try {
      // KAFA 사이트의 오타를 위한 특별 처리: defense -> deffense
      let actualPageType = pageType;
      if (pageType === 'defense1' || pageType === 'defense2') {
        actualPageType = pageType.replace('defense', 'deffense');
      }
      const url = `${this.baseUrl}/team_${league}_${actualPageType}.html`;
      this.logger.log(`📊 팀 스탯 페이지 크롤링: ${url}`);
      
      const { data } = await axios.get(url, {
        params: year ? { year } : {},
        timeout: 10000,
      });
      
      const $ = cheerio.load(data);
      const stats: any[] = [];
      
      // 페이지 타입에 따른 필드 매핑 정의
      const fieldMappings = this.getTeamStatFieldMapping(pageType);
      
      $('.stats_table tr').each((index, element) => {
        // 첫 번째 행(헤더)은 건너뛰기
        if (index === 0) return;
        
        const cells = $(element).find('td');
        
        if (cells.length >= 3) {
          const teamName = $(cells[0]).text().trim();
          
          // 팀명이 유효한 경우만 추가
          if (teamName && teamName !== '팀명') {
            const statData: any = {
              rank: index,
              teamName,
            };

            // 각 셀의 데이터를 의미있는 필드명으로 파싱
            cells.each((cellIndex, cell) => {
              if (cellIndex === 0) return; // 팀명은 이미 처리됨
              
              const cellValue = $(cell).text().trim();
              const fieldName = fieldMappings[cellIndex] || `unknown${cellIndex}`;
              
              // 숫자인지 확인하고 적절히 파싱
              if (!isNaN(parseFloat(cellValue))) {
                statData[fieldName] = parseFloat(cellValue);
              } else {
                statData[fieldName] = cellValue;
              }
            });
            
            stats.push(statData);
          }
        }
      });
      
      this.logger.log(`✅ ${pageType} 팀 스탯 ${stats.length}개 크롤링 완료`);
      return stats;
    } catch (error) {
      this.logger.error(`❌ 팀 스탯 페이지 크롤링 실패 (${pageType}): ${error.message}`);
      return [];
    }
  }

  // 팀 스탯 필드 매핑 정의
  private getTeamStatFieldMapping(pageType: string): Record<number, string> {
    const mappings: Record<string, Record<number, string>> = {
      'offense1': { // 러싱
        1: 'rushingYards',
        2: 'yardsPerAttempt', 
        3: 'attempts',
        4: 'touchdowns',
        5: 'longestRush'
      },
      'offense2': { // 패싱
        1: 'passingYards',
        2: 'yardsPerAttempt',
        3: 'completionPercentage',
        4: 'attempts',
        5: 'completions',
        6: 'touchdowns',
        7: 'interceptions',
        8: 'longestPass'
      },
      'offense3': { // 리시빙
        1: 'receptions',
        2: 'receivingYards',
        3: 'yardsPerReception',
        4: 'targets',
        5: 'touchdowns',
        6: 'longestReception'
      },
      'defense1': { // 태클 (KAFA: ATT, SACK, SOLO, COMBO)
        1: 'totalTackles',    // ATT
        2: 'sacks',          // SACK
        3: 'soloTackles',    // SOLO
        4: 'assistTackles'   // COMBO
      },
      'defense2': { // 인터셉션 (KAFA: INT, INT TD, INT YDS, LNG)
        1: 'interceptions',          // INT
        2: 'interceptionTd',         // INT TD
        3: 'interceptionYards',      // INT YDS
        4: 'longestInterception'     // LNG
      },
      'defense3': { // 색
        1: 'sacks',
        2: 'sackYards',
        3: 'qbHurries',
        4: 'passesDefended'
      },
      'special1': { // 킥킹
        1: 'fieldGoalPercentage',
        2: 'averageDistance',
        3: 'fieldGoalsMade',
        4: 'fieldGoalsAttempted',
        5: 'longestMade',
        6: 'longestAttempted'
      },
      'special2': { // 킥오프
        1: 'avgKickoffYards',      // YDS AVG
        2: 'kickoffCount',         // KO
        3: 'kickoffYards',         // YDS
        4: 'kickoffTouchdowns',    // TD
        5: 'longestKickoff'        // LNG
      },
      'special3': { // 킥오프 리턴
        1: 'avgReturnYards',       // YDS AVG
        2: 'returns',              // KO RETURNS
        3: 'returnYards',          // YDS
        4: 'kickReturnTouchdowns', // TD
        5: 'longestReturn'         // LNG
      },
      'special4': { // 펀팅
        1: 'avgPuntYards',         // YDS AVG
        2: 'puntCount',            // PUNTS
        3: 'puntYards',            // YDS
        4: 'puntTouchdowns',       // TD
        5: 'longestPunt'           // LNG
      },
      'special5': { // 펀트 리턴
        1: 'avgReturnYards',       // YDS AVG
        2: 'returns',              // PUNT RETURNS
        3: 'returnYards',          // YDS
        4: 'puntReturnTouchdowns', // TD
        5: 'longestReturn'         // LNG
      }
    };
    
    return mappings[pageType] || {};
  }

  // 개인 스탯 필드 매핑 정의
  private getPlayerStatFieldMapping(pageNumber: number): Record<number, string> {
    const mappings: Record<number, Record<number, string>> = {
      1: { // 개인 러싱
        2: 'rushingYards',
        3: 'yardsPerAttempt',
        4: 'attempts', 
        5: 'touchdowns',
        6: 'longestRush'
      },
      2: { // 개인 패싱
        2: 'passingYards',
        3: 'yardsPerAttempt',
        4: 'completionPercentage',
        5: 'attempts',
        6: 'completions',
        7: 'touchdowns',
        8: 'interceptions',
        9: 'longestPass'
      },
      3: { // 개인 리시빙 (REC, REC YDS, YDS/ATT, TD, LNG)
        2: 'receptions',
        3: 'receivingYards', 
        4: 'yardsPerReception',
        5: 'targets',
        6: 'touchdowns',
        7: 'longestReception'
      },
      4: { // 개인 펌블 (FF, FR, FR TD)
        2: 'forcedFumbles',
        3: 'fumbleRecoveries', 
        4: 'fumbleRecoveryTDs'
      },
      5: { // 개인 태클 (ATT, SACK, SOLO, COMBO)
        2: 'totalTackles',
        3: 'sacks',
        4: 'soloTackles',
        5: 'assistTackles'
      },
      6: { // 개인 인터셉션 (INT, INT TD, INT YDS, LNG)
        2: 'interceptions',
        3: 'touchdowns',
        4: 'interceptionYards',
        5: 'longestReturn'
      },
      7: { // 개인 킥킹 (FG%, YDS AVG, FGM, ATT, YDS, LNG)
        2: 'fieldGoalPercentage',
        3: 'averageDistance',
        4: 'fieldGoalsMade',
        5: 'fieldGoalsAttempted',
        6: 'totalYards',
        7: 'longestMade'
      },
      8: { // 개인 킥오프 (YDS AVG, KO, YDS, TD, LNG)
        2: 'averageDistance',
        3: 'kickoffs',
        4: 'yards',
        5: 'touchdowns',
        6: 'longest'
      },
      9: { // 개인 킥오프 리턴 (YDS AVG, KO RETURNS, YDS, TD, LNG)
        2: 'yardsPerReturn',
        3: 'returns',
        4: 'returnYards',
        5: 'touchdowns',
        6: 'longestReturn'
      },
      10: { // 개인 펀팅 (YDS AVG, PUNTS, YDS, TD, LNG)
        2: 'averageDistance',
        3: 'totalPunts',
        4: 'totalYards',
        5: 'touchdowns',
        6: 'longestPunt'
      },
      11: { // 개인 펀트 리턴 (YDS AVG, PUNT RETURNS, YDS, TD, LNG)
        2: 'yardsPerReturn',
        3: 'returns',
        4: 'returnYards',
        5: 'touchdowns',
        6: 'longestReturn'
      }
    };
    
    return mappings[pageNumber] || {};
  }

  // 특정 페이지의 개인 스탯 크롤링 (일반화)
  async getPlayerStatsByPage(league: 'uni' | 'soc', pageNumber: number, year?: string): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/ind_${league}${pageNumber}.html`;
      this.logger.log(`📊 개인 스탯 페이지 크롤링: ${url}`);
      
      const { data } = await axios.get(url, {
        params: year ? { year } : {},
        timeout: 10000,
      });
      
      const $ = cheerio.load(data);
      const stats: any[] = [];
      
      // 페이지별 필드 매핑 가져오기
      const fieldMappings = this.getPlayerStatFieldMapping(pageNumber);
      
      $('.stats_table tr').each((index, element) => {
        // 첫 번째 행(헤더)은 건너뛰기
        if (index === 0) return;
        
        const cells = $(element).find('td');
        
        if (cells.length >= 3) {
          // 선수 정보 파싱 (일반적으로 두 번째 셀)
          const playerCell = $(cells[1]).text().trim();
          const playerInfo = this.parsePlayerInfo(playerCell);
          
          if (playerInfo.playerName && playerInfo.university) {
            const statData: any = {
              rank: index,
              playerName: playerInfo.playerName,
              university: playerInfo.university,
              jerseyNumber: playerInfo.jerseyNumber,
            };

            // 각 셀의 데이터를 의미있는 필드명으로 파싱
            cells.each((cellIndex, cell) => {
              if (cellIndex === 0 || cellIndex === 1) return; // 순위와 선수 정보는 이미 처리됨
              
              const cellValue = $(cell).text().trim();
              const fieldName = fieldMappings[cellIndex] || `unknown${cellIndex}`;
              
              // 러싱야드인 경우 전진/후퇴 정보 제거
              let processedValue = cellValue;
              if (fieldName === 'rushingYards') {
                processedValue = this.cleanRushingYards(cellValue);
              }
              
              // 숫자인지 확인하고 적절히 파싱
              if (!isNaN(parseFloat(processedValue))) {
                statData[fieldName] = parseFloat(processedValue);
              } else {
                statData[fieldName] = processedValue;
              }
            });
            
            stats.push(statData);
          }
        }
      });
      
      this.logger.log(`✅ 개인 스탯 페이지 ${pageNumber} - ${stats.length}개 크롤링 완료`);
      return stats;
    } catch (error) {
      this.logger.error(`❌ 개인 스탯 페이지 크롤링 실패 (페이지 ${pageNumber}): ${error.message}`);
      return [];
    }
  }

  // 전체 KAFA 통계 데이터 수집
  async getAllKafaStats(year?: string): Promise<any> {
    try {
      this.logger.log(`🚀 전체 KAFA 통계 데이터 수집 시작 (년도: ${year || 'current'})`);
      
      const result = {
        university: {
          team: {
            offense: {},
            defense: {},
            special: {}
          },
          individual: {
            offense: {},
            defense: {},
            special: {}
          }
        },
        social: {
          team: {
            offense: {},
            defense: {},
            special: {}
          },
          individual: {
            offense: {},
            defense: {},
            special: {}
          }
        }
      };

      // 대학 팀 스탯 수집
      this.logger.log('📊 대학 팀 스탯 수집 중...');
      result.university.team.offense = {
        rushing: await this.getTeamStatsByPage('uni', 'offense1', year),
        passing: await this.getTeamStatsByPage('uni', 'offense2', year),
        receiving: await this.getTeamStatsByPage('uni', 'offense3', year)
      };

      result.university.team.defense = {
        tackles: await this.getTeamStatsByPage('uni', 'defense1', year),
        interceptions: await this.getTeamStatsByPage('uni', 'defense2', year)
        // sacks는 defense1에 포함되어 있음
      };

      result.university.team.special = {
        kicking: await this.getTeamStatsByPage('uni', 'special1', year),
        kickoff: await this.getTeamStatsByPage('uni', 'special2', year),
        kickoffReturn: await this.getTeamStatsByPage('uni', 'special3', year),
        punting: await this.getTeamStatsByPage('uni', 'special4', year),
        puntReturn: await this.getTeamStatsByPage('uni', 'special5', year)
      };

      // 대학 개인 스탯 수집
      this.logger.log('👤 대학 개인 스탯 수집 중...');
      result.university.individual.offense = {
        rushing: await this.getPlayerStatsByPage('uni', 1, year),
        passing: await this.getPlayerStatsByPage('uni', 2, year),
        receiving: await this.getPlayerStatsByPage('uni', 3, year)
      };

      result.university.individual.defense = {
        tackles: await this.getPlayerStatsByPage('uni', 4, year),
        interceptions: await this.getPlayerStatsByPage('uni', 5, year),
        sacks: await this.getPlayerStatsByPage('uni', 6, year)
      };

      result.university.individual.special = {
        kicking: await this.getPlayerStatsByPage('uni', 7, year),
        punting: await this.getPlayerStatsByPage('uni', 8, year),
        returns: await this.getPlayerStatsByPage('uni', 9, year)
      };

      // 사회인 팀 스탯 수집
      this.logger.log('📊 사회인 팀 스탯 수집 중...');
      result.social.team.offense = {
        rushing: await this.getTeamStatsByPage('soc', 'offense1', year),
        passing: await this.getTeamStatsByPage('soc', 'offense2', year),
        receiving: await this.getTeamStatsByPage('soc', 'offense3', year)
      };

      result.social.team.defense = {
        tackles: await this.getTeamStatsByPage('soc', 'defense1', year),
        interceptions: await this.getTeamStatsByPage('soc', 'defense2', year)
        // sacks는 defense1에 포함되어 있음
      };

      result.social.team.special = {
        kicking: await this.getTeamStatsByPage('soc', 'special1', year),
        kickoff: await this.getTeamStatsByPage('soc', 'special2', year),
        kickoffReturn: await this.getTeamStatsByPage('soc', 'special3', year),
        punting: await this.getTeamStatsByPage('soc', 'special4', year),
        puntReturn: await this.getTeamStatsByPage('soc', 'special5', year)
      };

      // 사회인 개인 스탯 수집
      this.logger.log('👤 사회인 개인 스탯 수집 중...');
      result.social.individual.offense = {
        rushing: await this.getPlayerStatsByPage('soc', 1, year),
        passing: await this.getPlayerStatsByPage('soc', 2, year),
        receiving: await this.getPlayerStatsByPage('soc', 3, year)
      };

      result.social.individual.defense = {
        tackles: await this.getPlayerStatsByPage('soc', 4, year),
        interceptions: await this.getPlayerStatsByPage('soc', 5, year),
        sacks: await this.getPlayerStatsByPage('soc', 6, year)
      };

      result.social.individual.special = {
        kicking: await this.getPlayerStatsByPage('soc', 7, year),
        punting: await this.getPlayerStatsByPage('soc', 8, year),
        returns: await this.getPlayerStatsByPage('soc', 9, year)
      };

      this.logger.log('✅ 전체 KAFA 통계 데이터 수집 완료');
      return result;

    } catch (error) {
      this.logger.error(`❌ 전체 KAFA 통계 수집 실패: ${error.message}`);
      throw new Error(`Failed to get all KAFA stats: ${error.message}`);
    }
  }

  // JSON 파일 저장/조회 메서드 추가

  // KAFA 선수 데이터를 JSON 파일로 저장
  async savePlayersToJson(league: 'uni' | 'soc' = 'uni'): Promise<{
    success: boolean;
    message: string;
    savedCount: number;
    filePath: string;
  }> {
    try {
      this.logger.log(`📁 KAFA ${league} 선수 데이터를 JSON으로 저장 시작...`);
      
      // 1. KAFA 사이트에서 최신 선수 데이터 크롤링
      const players = await this.getPlayerStats(league);
      
      if (!players || players.length === 0) {
        return {
          success: false,
          message: '크롤링된 선수 데이터가 없습니다.',
          savedCount: 0,
          filePath: ''
        };
      }

      // 2. data 폴더 생성 (없으면)
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // 3. JSON 파일로 저장 (덮어쓰기)
      const fileName = `kafa-${league}-players.json`;
      const filePath = path.join(dataDir, fileName);

      const jsonData = {
        league,
        crawledAt: new Date().toISOString(),
        totalCount: players.length,
        players: players.map(player => ({
          rank: player.rank,
          playerName: player.playerName,
          university: player.university,
          jerseyNumber: player.jerseyNumber,
          rushYards: player.rushYards,
          yardsPerAttempt: player.yardsPerAttempt,
          attempts: player.attempts,
          touchdowns: player.touchdowns,
          longest: player.longest
        }))
      };

      // 단일 파일로 저장 (덮어쓰기)
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');

      this.logger.log(`✅ JSON 저장 완료: ${fileName} (${players.length}명)`);

      return {
        success: true,
        message: `${players.length}명의 선수 데이터를 JSON 파일로 저장했습니다.`,
        savedCount: players.length,
        filePath: filePath
      };

    } catch (error) {
      this.logger.error(`❌ JSON 저장 실패: ${error.message}`);
      return {
        success: false,
        message: `JSON 저장 실패: ${error.message}`,
        savedCount: 0,
        filePath: ''
      };
    }
  }

  // JSON 파일에서 선수 데이터 조회
  async getPlayersFromJson(league: 'uni' | 'soc' = 'uni'): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const fileName = `kafa-${league}-players.json`;
      const filePath = path.join(dataDir, fileName);

      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: `저장된 ${league} 선수 데이터가 없습니다. 먼저 크롤링하여 저장해주세요.`,
          data: null
        };
      }

      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      this.logger.log(`📖 JSON 파일에서 ${league} 선수 데이터 조회: ${jsonData.totalCount}명`);

      return {
        success: true,
        message: `${jsonData.totalCount}명의 선수 데이터를 조회했습니다.`,
        data: jsonData
      };

    } catch (error) {
      this.logger.error(`❌ JSON 조회 실패: ${error.message}`);
      return {
        success: false,
        message: `JSON 조회 실패: ${error.message}`,
        data: null
      };
    }
  }

  // 저장된 JSON 파일 목록 조회
  async getJsonFileList(): Promise<{
    success: boolean;
    files: Array<{
      fileName: string;
      league: string;
      size: string;
      createdAt: string;
    }>;
  }> {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      
      if (!fs.existsSync(dataDir)) {
        return { success: true, files: [] };
      }

      const files = fs.readdirSync(dataDir)
        .filter(file => file.startsWith('kafa-') && file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(dataDir, file);
          const stats = fs.statSync(filePath);
          const league = file.includes('-uni-') ? 'uni' : 'soc';
          
          return {
            fileName: file,
            league,
            size: `${(stats.size / 1024).toFixed(1)} KB`,
            createdAt: stats.mtime.toISOString()
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return { success: true, files };

    } catch (error) {
      this.logger.error(`❌ 파일 목록 조회 실패: ${error.message}`);
      return { success: false, files: [] };
    }
  }

  // 11개 스탯 타입 매핑 정의
  private readonly STAT_TYPE_MAPPING = {
    1: { key: 'rushing', name: 'RUSHING' },
    2: { key: 'passing', name: 'PASSING' },
    3: { key: 'receiving', name: 'RECEIVING' },
    4: { key: 'fumbles', name: 'FUMBLES' },
    5: { key: 'tackles', name: 'TACKLES' },
    6: { key: 'interceptions', name: 'INTERCEPTIONS' },
    7: { key: 'fieldgoals', name: 'FIELD GOALS' },
    8: { key: 'kickoffs', name: 'KICKOFFS' },
    9: { key: 'kickoffreturns', name: 'KICKOFF RETURNS' },
    10: { key: 'punting', name: 'PUNTING' },
    11: { key: 'puntreturns', name: 'PUNTING RETURNS' }
  };

  // 모든 스탯 타입 크롤링 및 JSON 저장
  async scrapeAllStatsToJson(league: 'uni' | 'soc' = 'uni'): Promise<{
    success: boolean;
    message: string;
    results: Array<{
      statType: string;
      success: boolean;
      count: number;
      filePath: string;
    }>;
  }> {
    try {
      this.logger.log(`📁 모든 KAFA ${league} 스탯 크롤링 시작...`);
      
      const results = [];
      
      // 11개 스탯 타입 순차적으로 크롤링
      for (const [pageNum, statInfo] of Object.entries(this.STAT_TYPE_MAPPING)) {
        try {
          this.logger.log(`🔄 ${statInfo.name} 크롤링 중... (페이지 ${pageNum})`);
          
          const players = await this.getPlayerStatsByPage(league, parseInt(pageNum));
          
          if (players && players.length > 0) {
            const saveResult = await this.saveStatTypeToJson(league, statInfo.key, statInfo.name, players);
            
            results.push({
              statType: statInfo.key,
              success: saveResult.success,
              count: saveResult.savedCount,
              filePath: saveResult.filePath
            });
            
            this.logger.log(`✅ ${statInfo.name}: ${players.length}명 저장 완료`);
          } else {
            results.push({
              statType: statInfo.key,
              success: false,
              count: 0,
              filePath: ''
            });
            
            this.logger.warn(`⚠️ ${statInfo.name}: 데이터 없음`);
          }
          
          // 서버 부하 방지를 위한 딜레이
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          this.logger.error(`❌ ${statInfo.name} 크롤링 실패: ${error.message}`);
          results.push({
            statType: statInfo.key,
            success: false,
            count: 0,
            filePath: ''
          });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const totalPlayers = results.reduce((sum, r) => sum + r.count, 0);
      
      this.logger.log(`✅ 전체 크롤링 완료: ${successCount}/11개 스탯, 총 ${totalPlayers}명`);
      
      return {
        success: true,
        message: `${successCount}/11개 스탯 타입 크롤링 완료, 총 ${totalPlayers}명 저장`,
        results
      };
      
    } catch (error) {
      this.logger.error(`❌ 전체 스탯 크롤링 실패: ${error.message}`);
      return {
        success: false,
        message: `전체 스탯 크롤링 실패: ${error.message}`,
        results: []
      };
    }
  }

  // 특정 스탯 타입을 JSON 파일로 저장
  private async saveStatTypeToJson(
    league: 'uni' | 'soc',
    statKey: string,
    statName: string,
    players: any[]
  ): Promise<{
    success: boolean;
    message: string;
    savedCount: number;
    filePath: string;
  }> {
    try {
      // data 폴더 생성
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // 파일명 생성
      const fileName = `kafa-${league}-${statKey}.json`;
      const filePath = path.join(dataDir, fileName);

      // JSON 데이터 구성
      const jsonData = {
        statType: statKey,
        statName: statName,
        league,
        crawledAt: new Date().toISOString(),
        totalCount: players.length,
        players: players.map((player, index) => ({
          rank: index + 1,
          playerName: player.playerName || '',
          university: player.university || '',
          jerseyNumber: player.jerseyNumber || 0,
          ...this.extractStatFields(player, statKey)
        }))
      };

      // JSON 파일 저장
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');

      return {
        success: true,
        message: `${statName} 데이터 저장 완료`,
        savedCount: players.length,
        filePath
      };

    } catch (error) {
      return {
        success: false,
        message: `${statName} 저장 실패: ${error.message}`,
        savedCount: 0,
        filePath: ''
      };
    }
  }

  // 스탯 타입별로 필드 추출
  private extractStatFields(player: any, statKey: string): any {
    switch (statKey) {
      case 'rushing':
        return {
          rushingYards: player.rushingYards || 0,
          yardsPerAttempt: player.yardsPerAttempt || 0,
          attempts: player.attempts || 0,
          touchdowns: player.touchdowns || 0,
          longest: player.longestRush || 0
        };
      
      case 'passing':
        return {
          completions: player.completions || 0,
          attempts: player.attempts || 0,
          passingYards: player.passingYards || 0,
          touchdowns: player.touchdowns || 0,
          interceptions: player.interceptions || 0,
          longest: player.longestPass || 0,
          yardsPerAttempt: player.yardsPerAttempt || 0,
          completionPercentage: player.completionPercentage || 0
        };
      
      case 'receiving':
        return {
          receptions: player.receptions || 0,
          receivingYards: player.receivingYards || 0,
          touchdowns: player.touchdowns || 0,
          longest: player.longestReception || 0,
          yardsPerReception: player.yardsPerReception || 0,
          targets: player.targets || 0
        };
      
      case 'fumbles':
        return {
          forcedFumbles: player.forcedFumbles || 0,
          fumbleRecoveries: player.fumbleRecoveries || 0,
          fumbleRecoveryTDs: player.fumbleRecoveryTDs || 0
        };
      
      case 'tackles':
        return {
          totalTackles: player.totalTackles || 0,
          sacks: player.sacks || 0,
          soloTackles: player.soloTackles || 0,
          assistTackles: player.assistTackles || 0
        };
      
      case 'interceptions':
        return {
          interceptions: player.interceptions || 0,
          touchdowns: player.touchdowns || 0,
          returnYards: player.interceptionYards || 0,
          longest: player.longestReturn || 0
        };
      
      case 'fieldgoals':
        return {
          percentage: player.fieldGoalPercentage || 0,
          averageDistance: player.averageDistance || 0,
          fieldGoalsMade: player.fieldGoalsMade || 0,
          fieldGoalsAttempted: player.fieldGoalsAttempted || 0,
          totalYards: player.totalYards || 0,
          longest: player.longestMade || 0
        };
      
      case 'kickoffs':
        return {
          averageDistance: player.averageDistance || 0,
          kickoffs: player.kickoffs || 0,
          yards: player.yards || 0,
          touchdowns: player.touchdowns || 0,
          longest: player.longest || 0
        };
      
      case 'kickoffreturns':
        return {
          average: player.yardsPerReturn || 0,
          returns: player.returns || 0,
          returnYards: player.returnYards || 0,
          touchdowns: player.touchdowns || 0,
          longest: player.longestReturn || 0
        };
      
      case 'punting':
        return {
          average: player.averageDistance || 0,
          punts: player.totalPunts || 0,
          yards: player.totalYards || 0,
          touchdowns: player.touchdowns || 0,
          longest: player.longestPunt || 0
        };
      
      case 'puntreturns':
        return {
          average: player.yardsPerReturn || 0,
          returns: player.returns || 0,
          returnYards: player.returnYards || 0,
          touchdowns: player.touchdowns || 0,
          longest: player.longestReturn || 0
        };
      
      default:
        // 기본값으로 모든 필드 반환
        return {
          value1: player.value1 || 0,
          value2: player.value2 || 0,
          value3: player.value3 || 0,
          value4: player.value4 || 0,
          value5: player.value5 || 0
        };
    }
  }

  // 저장된 특정 스탯 타입 조회
  async getStatTypeFromJson(league: 'uni' | 'soc', statType: string): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const fileName = `kafa-${league}-${statType}.json`;
      const filePath = path.join(dataDir, fileName);

      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: `저장된 ${league} ${statType} 데이터가 없습니다. 먼저 크롤링하여 저장해주세요.`,
          data: null
        };
      }

      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      this.logger.log(`📖 ${league} ${statType} 데이터 조회: ${jsonData.totalCount}명`);

      return {
        success: true,
        message: `${jsonData.totalCount}명의 ${jsonData.statName} 데이터를 조회했습니다.`,
        data: jsonData
      };

    } catch (error) {
      this.logger.error(`❌ ${statType} 조회 실패: ${error.message}`);
      return {
        success: false,
        message: `${statType} 조회 실패: ${error.message}`,
        data: null
      };
    }
  }

  // 저장된 모든 스탯 파일 목록 조회
  async getAllStatFiles(league?: 'uni' | 'soc'): Promise<{
    success: boolean;
    files: Array<{
      fileName: string;
      statType: string;
      statName: string;
      league: string;
      size: string;
      createdAt: string;
      playerCount: number;
    }>;
  }> {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      
      if (!fs.existsSync(dataDir)) {
        return { success: true, files: [] };
      }

      const files = fs.readdirSync(dataDir)
        .filter(file => {
          const isKafaStatFile = file.startsWith('kafa-') && 
                                file.endsWith('.json') && 
                                !file.includes('players.json'); // 기존 단일 파일 제외
          
          if (league) {
            return isKafaStatFile && file.includes(`-${league}-`);
          }
          return isKafaStatFile;
        })
        .map(file => {
          const filePath = path.join(dataDir, file);
          const stats = fs.statSync(filePath);
          
          // 파일명에서 정보 추출
          const parts = file.replace('.json', '').split('-');
          const fileLeague = parts[1]; // uni or soc
          const statType = parts[2]; // rushing, passing, etc.
          
          // 파일에서 플레이어 수 읽기
          let playerCount = 0;
          let statName = statType.toUpperCase();
          
          try {
            const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            playerCount = jsonData.totalCount || 0;
            statName = jsonData.statName || statType.toUpperCase();
          } catch (error) {
            // 파일 읽기 실패 시 기본값 사용
          }
          
          return {
            fileName: file,
            statType,
            statName,
            league: fileLeague,
            size: `${(stats.size / 1024).toFixed(1)} KB`,
            createdAt: stats.mtime.toISOString(),
            playerCount
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return { success: true, files };

    } catch (error) {
      this.logger.error(`❌ 스탯 파일 목록 조회 실패: ${error.message}`);
      return { success: false, files: [] };
    }
  }
}