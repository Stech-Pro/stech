import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameInfo, GameInfoDocument } from '../schemas/game-info.schema';
import { GameClips, GameClipsDocument } from '../schemas/game-clips.schema';
import {
  TeamGameStats,
  TeamGameStatsDocument,
} from '../schemas/team-game-stats.schema';
import {
  TeamTotalStats,
  TeamTotalStatsDocument,
} from '../schemas/team-total-stats.schema';

@Injectable()
export class GameService {

  constructor(
    @InjectModel(GameInfo.name)
    private gameInfoModel: Model<GameInfoDocument>,
    @InjectModel(GameClips.name)
    private gameClipsModel: Model<GameClipsDocument>,
    @InjectModel(TeamGameStats.name)
    private teamGameStatsModel: Model<TeamGameStatsDocument>,
    @InjectModel(TeamTotalStats.name)
    private teamTotalStatsModel: Model<TeamTotalStatsDocument>,
  ) {}


  async createGameInfo(gameData: any): Promise<GameInfo> {
    console.log('🔍 createGameInfo 호출됨, gameData 필드들:');
    console.log('  gameKey:', gameData.gameKey);
    console.log('  date:', gameData.date);
    console.log('  type:', gameData.type);
    console.log('  score:', gameData.score);
    console.log('  region:', gameData.region);
    console.log('  location:', gameData.location);
    console.log('  homeTeam:', gameData.homeTeam);
    console.log('  awayTeam:', gameData.awayTeam);
    console.log('  uploadStatus:', gameData.uploadStatus);
    console.log('  uploader:', gameData.uploader);

    // 팀명은 그대로 사용
    const fixedHomeTeam = gameData.homeTeam;
    const fixedAwayTeam = gameData.awayTeam;

    // 중복 체크: 같은 gameKey가 이미 존재하는지 확인
    const existingGame = await this.gameInfoModel.findOne({ gameKey: gameData.gameKey });
    if (existingGame) {
      console.log(`⚠️ 게임 데이터 중복: ${gameData.gameKey} 이미 존재함. 덮어쓰기 진행.`);
      
      // 기존 데이터 업데이트
      const updateData: any = {
        date: gameData.date,
        type: gameData.type,
        score: gameData.score,
        region: gameData.region,
        location: gameData.location,
        homeTeam: fixedHomeTeam,
        awayTeam: fixedAwayTeam,
        uploader: gameData.uploader || existingGame.uploader,
      };
      
      // uploadStatus가 있으면 포함
      if (gameData.uploadStatus) {
        updateData.uploadStatus = gameData.uploadStatus;
        console.log(`📝 uploadStatus 업데이트: ${existingGame.uploadStatus} → ${gameData.uploadStatus}`);
      }
      
      // report가 있으면 포함
      if (gameData.report !== undefined) {
        updateData.report = gameData.report;
        console.log(`📝 report 업데이트: ${(existingGame as any).report} → ${gameData.report}`);
      }
      
      const updatedGame = await this.gameInfoModel.findOneAndUpdate(
        { gameKey: gameData.gameKey },
        updateData,
        { new: true }
      );
      console.log('✅ GameInfo 업데이트 성공:', updatedGame._id);
      return updatedGame;
    }

    const gameInfo = {
      gameKey: gameData.gameKey,
      date: gameData.date,
      type: gameData.type,
      score: gameData.score,
      region: gameData.region,
      location: gameData.location,
      homeTeam: fixedHomeTeam,
      awayTeam: fixedAwayTeam,
      uploader: gameData.uploader, // JWT 토큰에서 가져온 팀명
      uploadStatus: gameData.uploadStatus || 'pending', // 기본값 pending
    };
    
    console.log(`📝 새 게임 생성 - uploadStatus: ${gameInfo.uploadStatus}`);

    console.log('📝 새로운 gameInfo 저장:', JSON.stringify(gameInfo, null, 2));

    try {
      const createdGameInfo = new this.gameInfoModel(gameInfo);
      const result = await createdGameInfo.save();
      console.log('✅ GameInfo 저장 성공:', result._id);
      return result;
    } catch (error) {
      console.error('❌ GameInfo 저장 실패:', error.message);
      console.error('❌ 상세 에러:', error);
      throw error;
    }
  }

  async findGamesByTeam(teamName: string): Promise<GameInfo[]> {
    console.log(`🔍 팀별 경기 조회: ${teamName} (pending + completed 상태)`);
    
    const games = await this.gameInfoModel
      .find({
        $or: [{ homeTeam: teamName }, { awayTeam: teamName }],
        uploadStatus: { $in: ['pending', 'completed'] }, // 👈 업로드된 경기 + 분석 완료된 경기
      })
      .sort({ date: -1 }) // 최신순 정렬
      .exec();
    
    console.log(`📊 ${teamName} 전체 경기 수: ${games.length}개 (pending + completed)`);
    
    // 팀명 수정 적용
    return games.map(game => {
      const gameObj = game.toObject();
      return gameObj;
    });
  }

  async findGamesByUploader(uploaderTeam: string): Promise<GameInfo[]> {
    console.log(`🔍 업로더별 경기 조회: ${uploaderTeam}`);
    
    const games = await this.gameInfoModel
      .find({ uploader: uploaderTeam })
      .exec();
    
    console.log(`📊 ${uploaderTeam} 업로드 경기 수: ${games.length}개`);
    
    if (games.length > 0) {
      console.log(`📋 첫 번째 경기 예시:`, {
        gameKey: games[0].gameKey,
        uploader: games[0].uploader,
        homeTeam: games[0].homeTeam,
        awayTeam: games[0].awayTeam,
        uploadStatus: games[0].uploadStatus,
        report: (games[0] as any).report
      });
    }
    
    return games.map(game => {
      const gameObj = game.toObject();
      return gameObj;
    });
  }

  async findAllGames(): Promise<GameInfo[]> {
    console.log(`🔍 모든 경기 조회 (pending + completed 상태)`);
    
    const games = await this.gameInfoModel
      .find({ uploadStatus: { $in: ['pending', 'completed'] } }) // 👈 Admin도 모든 상태 조회
      .sort({ date: -1 }) // 최신순 정렬
      .exec();
    
    console.log(`📊 전체 경기 수: ${games.length}개 (pending + completed)`);
    
    // 팀명 수정 적용
    return games.map(game => {
      const gameObj = game.toObject();
      return gameObj;
    });
  }

  async findPendingGames(): Promise<GameInfo[]> {
    console.log('🔍 pending 상태 경기 조회 시작');
    
    const games = await this.gameInfoModel
      .find({ uploadStatus: 'pending' })
      .sort({ date: -1 }) // 최신순 정렬
      .exec();
    
    console.log(`📊 pending 상태 경기 발견: ${games.length}개`);
    
    if (games.length > 0) {
      console.log(`📋 첫 번째 pending 경기:`, {
        gameKey: games[0].gameKey,
        date: games[0].date,
        homeTeam: games[0].homeTeam,
        awayTeam: games[0].awayTeam,
        uploader: games[0].uploader,
        uploadStatus: games[0].uploadStatus,
        videoUrls: games[0].videoUrls
      });
    }
    
    return games.map(game => {
      const gameObj = game.toObject();
      return gameObj;
    });
  }

  async findGameByKey(gameKey: string): Promise<GameInfo> {
    const game = await this.gameInfoModel.findOne({ gameKey }).exec();
    if (!game) {
      return null;
    }
    
    // 팀명은 그대로 사용
    const gameObj = game.toObject();
    return gameObj as any;
  }

  async updateGameInfo(gameKey: string, gameData: any): Promise<GameInfo> {
    // 기존 게임 정보 가져오기 (uploader 보존을 위해)
    const existingGame = await this.gameInfoModel.findOne({ gameKey });
    
    const updateData: any = {
      gameKey: gameData.gameKey,
      date: gameData.date,
      type: gameData.type,
      score: gameData.score,
      region: gameData.region,
      location: gameData.location,
      homeTeam: gameData.homeTeam,
      awayTeam: gameData.awayTeam,
    };

    // uploadStatus가 있으면 추가
    if (gameData.uploadStatus) {
      updateData.uploadStatus = gameData.uploadStatus;
      console.log(`📝 updateGameInfo에서 uploadStatus 업데이트: ${gameData.uploadStatus}`);
    }

    // uploader는 명시적으로 전달된 경우에만 업데이트, 아니면 기존 값 유지
    if (gameData.uploader) {
      updateData.uploader = gameData.uploader;
      console.log(`📝 updateGameInfo에서 uploader 업데이트: ${gameData.uploader}`);
    } else if (existingGame?.uploader) {
      updateData.uploader = existingGame.uploader;
      console.log(`📝 updateGameInfo에서 기존 uploader 유지: ${existingGame.uploader}`);
    }

    console.log(`📝 GameInfo 업데이트: ${gameKey}`, updateData);

    return this.gameInfoModel
      .findOneAndUpdate({ gameKey }, updateData, { new: true, upsert: true })
      .exec();
  }

  async deleteGameInfo(gameKey: string): Promise<any> {
    console.log(`🗑️ 게임 ${gameKey} 관련 모든 데이터 삭제 시작...`);

    try {
      // 1. GameInfo 삭제
      const gameInfoResult = await this.gameInfoModel
        .deleteOne({ gameKey })
        .exec();
      console.log(`✅ GameInfo 삭제: ${gameInfoResult.deletedCount}개`);

      // 2. GameClips 삭제
      const gameClipsResult = await this.gameClipsModel
        .deleteOne({ gameKey })
        .exec();
      console.log(`✅ GameClips 삭제: ${gameClipsResult.deletedCount}개`);

      // 3. TeamGameStats 삭제 (해당 게임의 모든 팀 통계)
      const teamGameStatsResult = await this.teamGameStatsModel
        .deleteMany({ gameKey })
        .exec();
      console.log(
        `✅ TeamGameStats 삭제: ${teamGameStatsResult.deletedCount}개`,
      );

      // 4. TeamTotalStats는 재계산이 필요하므로 삭제 후 재생성
      const teamTotalStatsResult = await this.teamTotalStatsModel
        .deleteMany({})
        .exec();
      console.log(
        `✅ TeamTotalStats 삭제 (전체 재계산 필요): ${teamTotalStatsResult.deletedCount}개`,
      );

      console.log(`🎉 게임 ${gameKey} 관련 모든 데이터 삭제 완료`);

      return {
        success: true,
        deletedCounts: {
          gameInfo: gameInfoResult.deletedCount,
          gameClips: gameClipsResult.deletedCount,
          teamGameStats: teamGameStatsResult.deletedCount,
          teamTotalStats: teamTotalStatsResult.deletedCount,
        },
      };
    } catch (error) {
      console.error(`❌ 게임 ${gameKey} 삭제 실패:`, error);
      throw error;
    }
  }

  // 경기 클립 데이터 저장 (전체 데이터 포함)
  async saveGameClips(gameData: any): Promise<GameClips> {
    // 데이터 그대로 사용
    const fixedGameData = {
      ...gameData,
    };

    const existingClips = await this.gameClipsModel.findOne({
      gameKey: gameData.gameKey,
    });

    if (existingClips) {
      // 이미 존재하면 업데이트
      return this.gameClipsModel
        .findOneAndUpdate({ gameKey: gameData.gameKey }, fixedGameData, {
          new: true,
        })
        .exec();
    }

    // 새로 생성
    const createdGameClips = new this.gameClipsModel(fixedGameData);
    return createdGameClips.save();
  }

  // gameKey로 경기 클립 데이터 조회
  async getGameClipsByKey(gameKey: string): Promise<GameClips> {
    const clips = await this.gameClipsModel.findOne({ gameKey }).exec();
    if (!clips) {
      return null;
    }

    // 팀명 수정 적용
    const clipsObject = clips.toObject();
    // 팀명은 그대로 사용
    // clipsObject.homeTeam = clipsObject.homeTeam;
    // clipsObject.awayTeam = clipsObject.awayTeam;
    
    return clipsObject as any;
  }

  // 코치용 하이라이트 조회
  async getCoachHighlights(teamName: string): Promise<any[]> {
    // 해당 팀이 업로드한 모든 경기 찾기
    const games = await this.gameClipsModel
      .find({
        uploader: teamName, // 자신의 팀이 업로드한 경기만
      })
      .exec();

    const highlights = [];

    for (const game of games) {
      // 각 경기에서 하이라이트 클립 필터링
      const highlightClips = game.Clips.filter((clip) => {
        // significantPlays에 null이 아닌 값이 있는지 확인
        const hasSignificantPlay = clip.significantPlays.some(
          (play) => play !== null,
        );
        // gainYard가 10 이상인지 확인
        const hasLongGain = clip.gainYard >= 10;

        return hasSignificantPlay || hasLongGain;
      });

      // 하이라이트 클립에 경기 정보 추가
      highlightClips.forEach((clip) => {
        highlights.push({
          gameKey: game.gameKey,
          date: game.date,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          location: game.location,
          clip: clip,
        });
      });
    }

    return highlights;
  }

  // 선수용 하이라이트 조회
  async getPlayerHighlights(
    playerId: string,
    teamName: string,
  ): Promise<any[]> {
    // playerId에서 실제 선수 번호 추출 (예: "2025_KK_10" -> 10)
    const playerNumber = this.extractPlayerNumberFromId(playerId);
    // 해당 팀이 업로드한 모든 경기 찾기
    const games = await this.gameClipsModel
      .find({
        uploader: teamName, // 자신의 팀이 업로드한 경기만
      })
      .exec();

    const highlights = [];

    for (const game of games) {
      // 현재 팀이 홈팀인지 어웨이팀인지 확인
      const isHomeTeam = game.homeTeam === teamName;
      const isAwayTeam = game.awayTeam === teamName;

      console.log(
        `경기 ${game.gameKey}: ${teamName}는 ${isHomeTeam ? '홈팀' : '어웨이팀'}`,
      );

      // 각 경기에서 해당 선수가 참여한 클립 필터링 (팀 구분 포함)
      const playerClips = game.Clips.filter((clip) => {
        const participatesInClip =
          clip.car?.num === playerNumber ||
          clip.car2?.num === playerNumber ||
          clip.tkl?.num === playerNumber ||
          clip.tkl2?.num === playerNumber;

        if (!participatesInClip) return false;

        // offensiveTeam을 기준으로 팀 구분
        // "Home"이면 홈팀 공격, "Away"면 어웨이팀 공격
        const isOffensivePlay =
          (clip.offensiveTeam === 'Home' && isHomeTeam) ||
          (clip.offensiveTeam === 'Away' && isAwayTeam);

        // 공격 플레이인 경우: car, car2가 우리 팀 선수여야 함
        if (
          isOffensivePlay &&
          (clip.car?.num === playerNumber || clip.car2?.num === playerNumber)
        ) {
          console.log(
            `✅ ${playerNumber}번 공격 플레이 매칭 (${clip.offensiveTeam})`,
          );
          return true;
        }

        // 수비 플레이인 경우: tkl, tkl2가 우리 팀 선수여야 함
        const isDefensivePlay =
          (clip.offensiveTeam === 'Home' && isAwayTeam) ||
          (clip.offensiveTeam === 'Away' && isHomeTeam);

        if (
          isDefensivePlay &&
          (clip.tkl?.num === playerNumber || clip.tkl2?.num === playerNumber)
        ) {
          console.log(
            `✅ ${playerNumber}번 수비 플레이 매칭 (상대: ${clip.offensiveTeam})`,
          );
          return true;
        }

        console.log(
          `❌ ${playerNumber}번 플레이 제외: ${clip.offensiveTeam} 공격, 우리팀 ${isHomeTeam ? 'Home' : 'Away'}`,
        );
        return false;
      });

      // 선수 클립에 경기 정보 추가
      playerClips.forEach((clip) => {
        highlights.push({
          gameKey: game.gameKey,
          date: game.date,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          location: game.location,
          clip: clip,
        });
      });
    }

    return highlights;
  }

  // playerId에서 실제 선수 번호 추출하는 헬퍼 메서드
  private extractPlayerNumberFromId(playerId: string): number {
    // "2025_KK_10" 형식에서 마지막 숫자 추출
    const parts = playerId.split('_');
    const lastPart = parts[parts.length - 1];
    const playerNumber = parseInt(lastPart, 10);

    console.log(`playerId "${playerId}"에서 선수 번호 ${playerNumber} 추출`);
    return playerNumber;
  }
}
