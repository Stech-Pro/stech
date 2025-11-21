import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { 
  TeamOffenseStats, 
  PlayerStats, 
  KafaStatsOptions 
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
      
      this.logger.log(`✅ 전체 경기 데이터 크롤링 완료: ${matchData.meta.totalInputs}개 input, ${matchData.meta.totalSelects}개 select, ${matchData.meta.totalTables}개 테이블`);
      return matchData;
    } catch (error) {
      this.logger.error(`❌ 경기 데이터 크롤링 실패: ${error.message}`);
      throw new Error(`Failed to crawl match data: ${error.message}`);
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
}