import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from '../../schemas/player.schema';
import type { PlayerService } from '../player.service';

// 클립 데이터 기본 인터페이스
export interface ClipData {
  clipKey: string;
  offensiveTeam: string; // "Home" or "Away"
  quarter: number;
  down: string | null;
  toGoYard: number | null;
  playType: string;
  specialTeam: boolean;
  start: { side: string; yard: number };
  end: { side: string; yard: number };
  gainYard: number;
  car: { num: number; pos: string };
  car2: { num: number | null; pos: string | null };
  tkl: { num: number | null; pos: string | null };
  tkl2: { num: number | null; pos: string | null };
  significantPlays: (string | null)[];
}

// 게임 데이터 기본 인터페이스
export interface GameData {
  gameKey: string;
  date: string;
  type: string;
  score: { home: number; away: number };
  region: string;
  location: string;
  homeTeam: string;
  awayTeam: string;
  Clips: ClipData[];
}

@Injectable()
export abstract class BaseAnalyzerService {
  constructor(
    @InjectModel(Player.name) protected playerModel: Model<PlayerDocument>,
    @Inject(forwardRef(() => require('../player.service').PlayerService))
    protected playerService: PlayerService,
  ) {}

  /**
   * 공통: significantPlays 처리
   * 터치다운, 인터셉션, 펌블, 색 등 특별한 플레이 처리
   */
  protected processSignificantPlays(
    clip: ClipData,
    stats: any,
    playType: string,
  ): void {
    if (!clip.significantPlays || !Array.isArray(clip.significantPlays)) return;

    for (const play of clip.significantPlays) {
      if (!play) continue;

      switch (play) {
        case 'TOUCHDOWN':
          this.processTouchdown(stats, playType);
          break;
        case 'INTERCEPT':
        case 'INTERCEPTION':
          this.processInterception(stats, playType);
          break;
        case 'FUMBLE':
          this.processFumble(stats, playType);
          break;
        case 'SACK':
          this.processSack(stats);
          break;
      }
    }
  }

  /**
   * 공통: 터치다운 처리 (포지션별로 오버라이드 가능)
   */
  protected processTouchdown(stats: any, playType: string): void {
    // 기본 구현 - 각 포지션에서 오버라이드
  }

  /**
   * 공통: 인터셉션 처리
   */
  protected processInterception(stats: any, playType: string): void {
    if (stats.passingInterceptions !== undefined) {
      stats.passingInterceptions++;
    }
  }

  /**
   * 공통: 펌블 처리
   */
  protected processFumble(stats: any, playType: string): void {
    if (stats.fumbles !== undefined) {
      stats.fumbles++;
    }
  }

  /**
   * 공통: 색 처리
   */
  protected processSack(stats: any): void {
    if (stats.sacks !== undefined) {
      stats.sacks++;
    }
  }

  /**
   * 멀티포지션 지원: 선수 데이터베이스 저장 (게임별 덮어쓰기)
   */
  protected async savePlayerStats(
    jerseyNumber: number,
    teamName: string,
    position: string,
    stats: any,
    gameData?: GameData,
  ): Promise<any> {
    try {
      const playerId = `${teamName}_${jerseyNumber}`;
      const gameKey = gameData?.gameKey;

      console.log(
        `💾 선수 저장/업데이트 시도: playerId = ${playerId}, position = ${position}, gameKey = ${gameKey}`,
      );

      // 팀명+등번호로 기존 선수 찾기 (멀티포지션 지원)
      const existingPlayer = await this.playerModel.findOne({
        teamName,
        jerseyNumber,
      });

      if (existingPlayer) {
        console.log(`🔄 기존 선수 발견: ${existingPlayer.name}`);

        // 포지션이 기존 리스트에 없으면 추가
        if (!existingPlayer.positions.includes(position)) {
          existingPlayer.positions.push(position);
          console.log(
            `📍 새 포지션 추가: ${position} -> 총 포지션: ${existingPlayer.positions.join(', ')}`,
          );
        }

        // 게임별 스탯 구조 초기화
        if (!existingPlayer.stats.gameStats) {
          existingPlayer.stats.gameStats = {};
        }

        if (gameKey) {
          // 게임별 스탯 덮어쓰기
          if (!existingPlayer.stats.gameStats[gameKey]) {
            existingPlayer.stats.gameStats[gameKey] = {};
          }
          existingPlayer.stats.gameStats[gameKey][position] = { ...stats };
          console.log(`🔄 ${gameKey} 게임의 ${position} 스탯 덮어쓰기 완료`);

          // 전체 스탯 재계산
          this.recalculateTotalStats(existingPlayer, position);
        } else {
          // 기존 방식 (gameKey가 없는 경우)
          if (!existingPlayer.stats[position]) {
            existingPlayer.stats[position] = {};
          }

          const positionStats = existingPlayer.stats[position] || {};
          for (const [key, value] of Object.entries(stats)) {
            if (typeof value === 'number') {
              positionStats[key] = (positionStats[key] || 0) + value;
            } else {
              positionStats[key] = value;
            }
          }
          existingPlayer.stats[position] = positionStats;
          existingPlayer.stats.totalGamesPlayed =
            (existingPlayer.stats.totalGamesPlayed || 0) +
            (stats.gamesPlayed || 0);
        }

        await existingPlayer.save();
        console.log(`✅ ${position} 선수 스탯 업데이트 성공`);

        // gameData가 있으면 4개 컬렉션에도 저장 (기존 선수)
        if (gameData && this.playerService) {
          try {
            const playerClips = []; // TODO: 해당 선수의 클립들만 필터링
            await this.playerService.savePlayerStatsWithNewStructure(
              existingPlayer,
              stats,
              gameData,
              playerClips,
            );
            console.log(
              `✅ ${position} 기존선수 4개 컬렉션 저장 완료: ${playerId}`,
            );
          } catch (error) {
            console.error(
              `❌ ${position} 기존선수 4개 컬렉션 저장 실패:`,
              error.message,
            );
          }
        }

        return {
          success: true,
          message: `${jerseyNumber}번 (${teamName}) ${position} 포지션 스탯 업데이트 완료`,
          player: existingPlayer.name,
        };
      } else {
        // 새 선수 생성
        console.log(`🆕 새 선수 생성: ${playerId}`);
        console.log(`📊 저장할 스탯:`, stats);

        const initialStats: any = {
          totalGamesPlayed: stats.gamesPlayed || 0,
        };

        if (gameKey) {
          // 게임별 스탯 구조로 저장
          initialStats.gameStats = {
            [gameKey]: {
              [position]: { ...stats },
            },
          };
          // 전체 스탯도 동일하게 설정
          initialStats[position] = { ...stats };
        } else {
          // 기존 방식
          initialStats[position] = { ...stats };
        }

        const newPlayer = new this.playerModel({
          name: `${jerseyNumber}번`,
          playerId,
          positions: [position],
          primaryPosition: position,
          teamName,
          jerseyNumber,
          league: '1부',
          season: '2024',
          stats: initialStats,
        });

        await newPlayer.save();
        console.log(`✅ ${position} 선수 저장 성공: ${playerId}`);

        // gameData가 있으면 4개 컬렉션에도 저장 (신규 선수)
        if (gameData && this.playerService) {
          try {
            const playerClips = []; // TODO: 해당 선수의 클립들만 필터링
            await this.playerService.savePlayerStatsWithNewStructure(
              newPlayer,
              stats,
              gameData,
              playerClips,
            );
            console.log(
              `✅ ${position} 신규선수 4개 컬렉션 저장 완료: ${playerId}`,
            );
          } catch (error) {
            console.error(
              `❌ ${position} 신규선수 4개 컬렉션 저장 실패:`,
              error.message,
            );
          }
        }

        return {
          success: true,
          message: `${jerseyNumber}번 (${teamName}) 신규 선수 생성 및 ${position} 스탯 저장 완료`,
          player: newPlayer.name,
        };
      }
    } catch (error) {
      console.error(`${position} 스탯 저장 실패:`, error);
      return {
        success: false,
        message: `${position} ${jerseyNumber}번 스탯 저장 실패: ${error.message}`,
      };
    }
  }

  /**
   * 게임별 스탯에서 전체 스탯 재계산
   */
  private recalculateTotalStats(player: any, position: string): void {
    if (!player.stats.gameStats) return;

    const totalStats: any = {};
    let totalGames = 0;

    // 모든 게임의 해당 포지션 스탯을 합산
    for (const [gameKey, gameStats] of Object.entries(player.stats.gameStats)) {
      const positionStats = (gameStats as any)[position];
      if (positionStats) {
        totalGames++;
        for (const [key, value] of Object.entries(positionStats)) {
          if (typeof value === 'number') {
            totalStats[key] = (totalStats[key] || 0) + value;
          } else {
            totalStats[key] = value;
          }
        }
      }
    }

    // 전체 스탯 업데이트
    player.stats[position] = totalStats;
    player.stats.totalGamesPlayed = totalGames;

    console.log(`🔄 ${position} 전체 스탯 재계산 완료: ${totalGames}게임`);
  }

  /**
   * 추상 메서드: 각 포지션별로 구현 필요
   */
  abstract analyzeClips(clips: ClipData[], gameData: GameData): Promise<any>;
}
