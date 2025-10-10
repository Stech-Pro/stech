import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GameDataEditRequestDto {
  @ApiProperty({
    description: '게임 키',
    example: 'CHA_HYL_2024-09-15',
  })
  @IsString()
  @IsNotEmpty()
  gameKey: string;

  @ApiProperty({
    description: '클립 키',
    example: 'CHA_HYL_2024-09-15_Q1_00:05:23',
  })
  @IsString()
  @IsNotEmpty()
  clipKey: string;

  @ApiProperty({
    description: '요청자 이름',
    example: '홍길동',
  })
  @IsString()
  @IsNotEmpty()
  requesterName: string;

  @ApiProperty({
    description: '요청자 팀',
    example: '한양대학교',
  })
  @IsString()
  @IsNotEmpty()
  requesterTeam: string;

  @ApiProperty({
    description: '요청자 역할',
    example: 'player',
    enum: ['player', 'coach', 'admin'],
  })
  @IsString()
  @IsNotEmpty()
  requesterRole: string;

  @ApiProperty({
    description: '수정 사유',
    example: '잘못된 플레이어 태깅',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}