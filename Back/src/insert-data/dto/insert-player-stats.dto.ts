import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsObject, IsOptional } from 'class-validator';

export class CreatePlayerStatsDto {
  @ApiProperty({ description: '선수 ID', example: 'HYlions_10' })
  @IsString()
  playerId: string;

  @ApiProperty({ description: '선수 실명', example: '김철수' })
  @IsString()
  playerName: string;

  @ApiProperty({ description: '팀명', example: 'HYlions' })
  @IsString()
  teamName: string;

  @ApiProperty({ description: '등번호', example: 10 })
  @IsNumber()
  jerseyNumber: number;

  @ApiProperty({ description: '주 포지션', example: 'QB' })
  @IsString()
  position: string;

  @ApiProperty({
    description: '포지션별 스탯 데이터',
    example: {
      gamesPlayed: 5,
      passingAttempts: 50,
      passingCompletions: 30,
      completionPercentage: 60,
      passingYards: 450,
      passingTouchdowns: 3,
      passingInterceptions: 1,
      longestPass: 35,
      rushingAttempts: 8,
      rushingYards: 45,
      yardsPerCarry: 5.6,
      rushingTouchdowns: 1,
      longestRush: 15,
      sacks: 2,
      fumbles: 0,
    },
  })
  @IsObject()
  stats: any;

  @ApiProperty({ description: '총 출전 경기 수', example: 5 })
  @IsNumber()
  totalGamesPlayed: number;

  @ApiProperty({
    description: '활동 시즌 목록',
    example: ['2024', '2025'],
    required: false,
  })
  @IsOptional()
  seasons?: string[];

  @ApiProperty({
    description: '첫 경기 날짜',
    example: '2024-03-15',
    required: false,
  })
  @IsOptional()
  firstGameDate?: string;

  @ApiProperty({
    description: '마지막 경기 날짜',
    example: '2024-11-20',
    required: false,
  })
  @IsOptional()
  lastGameDate?: string;
}

export class UpdatePlayerStatsDto {
  @ApiProperty({ description: '선수 실명', example: '김철수', required: false })
  @IsOptional()
  @IsString()
  playerName?: string;

  @ApiProperty({ description: '팀명', example: 'HYlions', required: false })
  @IsOptional()
  @IsString()
  teamName?: string;

  @ApiProperty({ description: '등번호', example: 10, required: false })
  @IsOptional()
  @IsNumber()
  jerseyNumber?: number;

  @ApiProperty({ description: '주 포지션', example: 'QB', required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({
    description: '포지션별 스탯 데이터',
    required: false,
  })
  @IsOptional()
  @IsObject()
  stats?: any;

  @ApiProperty({ description: '총 출전 경기 수', example: 5, required: false })
  @IsOptional()
  @IsNumber()
  totalGamesPlayed?: number;

  @ApiProperty({
    description: '활동 시즌 목록',
    example: ['2024', '2025'],
    required: false,
  })
  @IsOptional()
  seasons?: string[];

  @ApiProperty({
    description: '첫 경기 날짜',
    example: '2024-03-15',
    required: false,
  })
  @IsOptional()
  firstGameDate?: string;

  @ApiProperty({
    description: '마지막 경기 날짜',
    example: '2024-11-20',
    required: false,
  })
  @IsOptional()
  lastGameDate?: string;
}

export class BulkCreatePlayerStatsDto {
  @ApiProperty({
    description: '여러 선수 스탯 데이터 배열',
    type: [CreatePlayerStatsDto],
  })
  players: CreatePlayerStatsDto[];
}
