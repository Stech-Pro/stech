import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { InsertDataService } from './insert-data.service';
import {
  CreatePlayerStatsDto,
  UpdatePlayerStatsDto,
  BulkCreatePlayerStatsDto,
} from './dto/insert-player-stats.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@ApiTags('Insert Data - Player Stats')
@Controller('insert-data')
@UseGuards(JwtAuthGuard, AdminGuard) // 관리자 권한 필요
@ApiBearerAuth('JWT-auth')
export class InsertDataController {
  constructor(private readonly insertDataService: InsertDataService) {}

  @Post('player-stats')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '📝 개별 선수 스탯 등록',
    description: `
    ## 👤 개별 선수 스탯 등록 API
    
    협회에서 제공받은 선수 스탯 데이터를 개별로 등록합니다.
    
    ### 📋 등록 정보
    - **기본 정보**: 선수ID, 선수명, 팀명, 등번호, 포지션
    - **스탯 데이터**: 포지션별 모든 상세 스탯
    - **경기 정보**: 총 출전 경기 수, 활동 시즌
    
    ### 🎯 사용 목적
    - 협회 공식 스탯 데이터 입력
    - 수동 선수 정보 등록
    - 개별 선수 데이터 관리
    `,
  })
  @ApiBody({ type: CreatePlayerStatsDto })
  @ApiResponse({
    status: 201,
    description: '✅ 선수 스탯 등록 성공',
    schema: {
      example: {
        success: true,
        message: '선수 스탯이 성공적으로 생성되었습니다.',
        data: {
          _id: '507f1f77bcf86cd799439011',
          playerId: 'HYlions_10',
          playerName: '김철수',
          teamName: 'HYlions',
          jerseyNumber: 10,
          position: 'QB',
          stats: {
            gamesPlayed: 5,
            passingAttempts: 50,
            passingCompletions: 30,
            // ... 기타 스탯들
          },
          totalGamesPlayed: 5,
          createdAt: '2024-11-14T10:00:00.000Z',
          updatedAt: '2024-11-14T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '❌ 중복된 선수 ID',
    schema: {
      example: {
        success: false,
        message: "선수 ID 'HYlions_10'가 이미 존재합니다.",
        code: 'CONFLICT',
      },
    },
  })
  async createPlayerStats(@Body() createDto: CreatePlayerStatsDto) {
    return this.insertDataService.createPlayerStats(createDto);
  }

  @Post('player-stats/bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '📝 여러 선수 스탯 일괄 등록',
    description: `
    ## 👥 여러 선수 스탯 일괄 등록 API
    
    여러 선수의 스탯 데이터를 한번에 등록합니다.
    
    ### 📋 특징
    - **대용량 처리**: 여러 선수 데이터 한번에 처리
    - **에러 핸들링**: 실패한 선수는 별도 보고
    - **부분 성공**: 일부 실패해도 성공한 데이터는 저장
    
    ### 🎯 사용 목적
    - JSON 파일 일괄 업로드
    - 시즌 시작 시 전체 선수 데이터 입력
    - 대량 데이터 마이그레이션
    `,
  })
  @ApiBody({ type: BulkCreatePlayerStatsDto })
  @ApiResponse({
    status: 201,
    description: '✅ 벌크 등록 완료',
    schema: {
      example: {
        success: true,
        message: '벌크 생성 완료: 성공 8명, 실패 2명',
        data: {
          created: [
            // 성공한 선수들...
          ],
          errors: [
            {
              playerId: 'HYlions_99',
              error: '이미 존재하는 선수 ID',
            },
          ],
          summary: {
            total: 10,
            success: 8,
            failed: 2,
          },
        },
      },
    },
  })
  async createPlayerStatsBulk(@Body() bulkDto: BulkCreatePlayerStatsDto) {
    return this.insertDataService.createPlayerStatsBulk(bulkDto);
  }

  @Put('player-stats/:playerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '✏️ 선수 스탯 수정',
    description: '기존 선수의 스탯 정보를 수정합니다.',
  })
  @ApiParam({ name: 'playerId', description: '선수 ID', example: 'HYlions_10' })
  @ApiBody({ type: UpdatePlayerStatsDto })
  @ApiResponse({
    status: 200,
    description: '✅ 선수 스탯 수정 성공',
  })
  @ApiResponse({
    status: 404,
    description: '❌ 선수를 찾을 수 없음',
  })
  async updatePlayerStats(
    @Param('playerId') playerId: string,
    @Body() updateDto: UpdatePlayerStatsDto,
  ) {
    return this.insertDataService.updatePlayerStats(playerId, updateDto);
  }

  @Delete('player-stats/:playerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🗑️ 선수 스탯 삭제',
    description: '선수의 스탯 정보를 완전히 삭제합니다.',
  })
  @ApiParam({ name: 'playerId', description: '선수 ID', example: 'HYlions_10' })
  @ApiResponse({
    status: 200,
    description: '✅ 선수 스탯 삭제 성공',
  })
  @ApiResponse({
    status: 404,
    description: '❌ 선수를 찾을 수 없음',
  })
  async deletePlayerStats(@Param('playerId') playerId: string) {
    return this.insertDataService.deletePlayerStats(playerId);
  }

  @Get('player-stats')
  @ApiOperation({
    summary: '📋 선수 스탯 목록 조회',
    description:
      '등록된 모든 선수들의 스탯 목록을 조회합니다. 페이지네이션 및 필터링 지원.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '페이지 당 항목 수',
    example: 10,
  })
  @ApiQuery({
    name: 'teamName',
    required: false,
    description: '팀명 필터',
    example: 'HYlions',
  })
  @ApiQuery({
    name: 'position',
    required: false,
    description: '포지션 필터',
    example: 'QB',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 선수 스탯 목록 조회 성공',
  })
  async getPlayerStatsList(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('teamName') teamName?: string,
    @Query('position') position?: string,
  ) {
    return this.insertDataService.getPlayerStatsList(
      page || 1,
      limit || 10,
      teamName,
      position,
    );
  }

  @Get('player-stats/:playerId')
  @ApiOperation({
    summary: '👤 특정 선수 스탯 조회',
    description: '특정 선수의 상세 스탯 정보를 조회합니다.',
  })
  @ApiParam({ name: 'playerId', description: '선수 ID', example: 'HYlions_10' })
  @ApiResponse({
    status: 200,
    description: '✅ 선수 스탯 조회 성공',
  })
  @ApiResponse({
    status: 404,
    description: '❌ 선수를 찾을 수 없음',
  })
  async getPlayerStatsById(@Param('playerId') playerId: string) {
    return this.insertDataService.getPlayerStatsById(playerId);
  }
}
