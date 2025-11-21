import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PlayerTotalStats,
  PlayerTotalStatsDocument,
} from '../schemas/player-total-stats.schema';
import {
  CreatePlayerStatsDto,
  UpdatePlayerStatsDto,
  BulkCreatePlayerStatsDto,
} from './dto/insert-player-stats.dto';

@Injectable()
export class InsertDataService {
  constructor(
    @InjectModel(PlayerTotalStats.name)
    private playerTotalStatsModel: Model<PlayerTotalStatsDocument>,
  ) {}

  // 개별 선수 스탯 생성
  async createPlayerStats(createDto: CreatePlayerStatsDto) {
    console.log('=== 선수 스탯 생성 ===');
    console.log('playerId:', createDto.playerId);

    // 중복 선수 확인
    const existingPlayer = await this.playerTotalStatsModel
      .findOne({ playerId: createDto.playerId })
      .lean();

    if (existingPlayer) {
      throw new ConflictException(
        `선수 ID '${createDto.playerId}'가 이미 존재합니다.`,
      );
    }

    // 새로운 선수 스탯 생성
    const newPlayerStats = new this.playerTotalStatsModel(createDto);
    const savedStats = await newPlayerStats.save();

    console.log('✅ 선수 스탯 생성 완료:', savedStats.playerId);

    return {
      success: true,
      message: '선수 스탯이 성공적으로 생성되었습니다.',
      data: savedStats,
    };
  }

  // 여러 선수 스탯 일괄 생성
  async createPlayerStatsBulk(bulkDto: BulkCreatePlayerStatsDto) {
    console.log('=== 벌크 선수 스탯 생성 ===');
    console.log('선수 수:', bulkDto.players.length);

    const results = [];
    const errors = [];

    for (const playerData of bulkDto.players) {
      try {
        // 중복 확인
        const existingPlayer = await this.playerTotalStatsModel
          .findOne({ playerId: playerData.playerId })
          .lean();

        if (existingPlayer) {
          errors.push({
            playerId: playerData.playerId,
            error: '이미 존재하는 선수 ID',
          });
          continue;
        }

        // 생성
        const newPlayerStats = new this.playerTotalStatsModel(playerData);
        const savedStats = await newPlayerStats.save();
        results.push(savedStats);
      } catch (error) {
        errors.push({
          playerId: playerData.playerId,
          error: error.message,
        });
      }
    }

    console.log(
      `✅ 벌크 생성 완료: 성공 ${results.length}명, 실패 ${errors.length}명`,
    );

    return {
      success: true,
      message: `벌크 생성 완료: 성공 ${results.length}명, 실패 ${errors.length}명`,
      data: {
        created: results,
        errors: errors,
        summary: {
          total: bulkDto.players.length,
          success: results.length,
          failed: errors.length,
        },
      },
    };
  }

  // 선수 스탯 수정
  async updatePlayerStats(playerId: string, updateDto: UpdatePlayerStatsDto) {
    console.log('=== 선수 스탯 수정 ===');
    console.log('playerId:', playerId);

    const updatedStats = await this.playerTotalStatsModel
      .findOneAndUpdate({ playerId }, updateDto, { new: true })
      .lean();

    if (!updatedStats) {
      throw new NotFoundException(`선수 ID '${playerId}'를 찾을 수 없습니다.`);
    }

    console.log('✅ 선수 스탯 수정 완료');

    return {
      success: true,
      message: '선수 스탯이 성공적으로 수정되었습니다.',
      data: updatedStats,
    };
  }

  // 선수 스탯 삭제
  async deletePlayerStats(playerId: string) {
    console.log('=== 선수 스탯 삭제 ===');
    console.log('playerId:', playerId);

    const deletedStats = await this.playerTotalStatsModel
      .findOneAndDelete({ playerId })
      .lean();

    if (!deletedStats) {
      throw new NotFoundException(`선수 ID '${playerId}'를 찾을 수 없습니다.`);
    }

    console.log('✅ 선수 스탯 삭제 완료');

    return {
      success: true,
      message: '선수 스탯이 성공적으로 삭제되었습니다.',
      data: deletedStats,
    };
  }

  // 전체 선수 스탯 목록 조회
  async getPlayerStatsList(
    page: number = 1,
    limit: number = 10,
    teamName?: string,
    position?: string,
  ) {
    console.log('=== 선수 스탯 목록 조회 ===');
    console.log('page:', page, 'limit:', limit);

    const filter: any = {};
    if (teamName) filter.teamName = teamName;
    if (position) filter.position = position;

    const skip = (page - 1) * limit;

    const [playerStats, total] = await Promise.all([
      this.playerTotalStatsModel.find(filter).skip(skip).limit(limit).lean(),
      this.playerTotalStatsModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    console.log(`✅ 선수 스탯 목록 조회 완료: ${playerStats.length}명`);

    return {
      success: true,
      message: '선수 스탯 목록을 조회했습니다.',
      data: {
        playerStats,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount: total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };
  }

  // 특정 선수 스탯 조회
  async getPlayerStatsById(playerId: string) {
    console.log('=== 특정 선수 스탯 조회 ===');
    console.log('playerId:', playerId);

    const playerStats = await this.playerTotalStatsModel
      .findOne({ playerId })
      .lean();

    if (!playerStats) {
      throw new NotFoundException(`선수 ID '${playerId}'를 찾을 수 없습니다.`);
    }

    console.log('✅ 선수 스탯 조회 완료');

    return {
      success: true,
      message: '선수 스탯을 조회했습니다.',
      data: playerStats,
    };
  }
}
