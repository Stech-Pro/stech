import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MemoService } from './memo.service';

@ApiTags('memos')
@Controller('memos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MemoController {
  constructor(private readonly memoService: MemoService) {}

  @Post()
  @ApiOperation({
    summary: '메모 작성',
    description: '클립에 대한 메모를 작성합니다. 팀 공개 메모는 같은 팀원에게 알림이 발송됩니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        gameKey: { type: 'string', example: '2024_FALL_W1_HYU_KU' },
        clipKey: { type: 'string', example: 'clip_1' },
        content: { type: 'string', example: '여기 디펜스 약하다' },
        isPrivate: { type: 'boolean', default: false, example: false },
      },
      required: ['gameKey', 'clipKey', 'content'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '메모 작성 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '메모가 성공적으로 작성되었습니다.' },
        memo: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            gameKey: { type: 'string' },
            clipKey: { type: 'string' },
            content: { type: 'string' },
            teamId: { type: 'string' },
            userId: { type: 'string' },
            userName: { type: 'string' },
            userRole: { type: 'string' },
            isPrivate: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async createMemo(
    @Request() req,
    @Body() body: {
      gameKey: string;
      clipKey: string;
      content: string;
      isPrivate?: boolean;
    },
  ) {
    return this.memoService.createMemo(
      req.user.id,
      body.gameKey,
      body.clipKey,
      body.content,
      body.isPrivate || false,
    );
  }

  @Get()
  @ApiOperation({
    summary: '메모 목록 조회',
    description: '내가 속한 팀의 공개 메모와 내가 작성한 개인 메모를 조회합니다.',
  })
  @ApiQuery({
    name: 'gameKey',
    required: false,
    description: '특정 게임의 메모만 조회',
    example: '2024_FALL_W1_HYU_KU',
  })
  @ApiQuery({
    name: 'clipKey',
    required: false,
    description: '특정 클립의 메모만 조회',
    example: 'clip_1',
  })
  @ApiResponse({
    status: 200,
    description: '메모 목록 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        memos: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              gameKey: { type: 'string' },
              clipKey: { type: 'string' },
              content: { type: 'string' },
              teamId: { type: 'string' },
              userId: { type: 'string' },
              userName: { type: 'string' },
              userRole: { type: 'string' },
              isPrivate: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async getMemos(
    @Request() req,
    @Query('gameKey') gameKey?: string,
    @Query('clipKey') clipKey?: string,
  ) {
    return this.memoService.getMemos(req.user.id, gameKey, clipKey);
  }

  @Get(':memoId')
  @ApiOperation({
    summary: '특정 메모 조회',
    description: '메모 ID로 특정 메모를 조회합니다.',
  })
  @ApiParam({
    name: 'memoId',
    description: '메모 ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: '메모 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        memo: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            gameKey: { type: 'string' },
            clipKey: { type: 'string' },
            content: { type: 'string' },
            teamId: { type: 'string' },
            userId: { type: 'string' },
            userName: { type: 'string' },
            userRole: { type: 'string' },
            isPrivate: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
  })
  @ApiResponse({
    status: 404,
    description: '메모를 찾을 수 없음',
  })
  async getMemoById(@Request() req, @Param('memoId') memoId: string) {
    return this.memoService.getMemoById(req.user.id, memoId);
  }

  @Put(':memoId')
  @ApiOperation({
    summary: '메모 수정',
    description: '본인이 작성한 메모만 수정할 수 있습니다.',
  })
  @ApiParam({
    name: 'memoId',
    description: '메모 ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', example: '수정된 메모 내용' },
      },
      required: ['content'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '메모 수정 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '메모가 성공적으로 수정되었습니다.' },
        memo: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            gameKey: { type: 'string' },
            clipKey: { type: 'string' },
            content: { type: 'string' },
            teamId: { type: 'string' },
            userId: { type: 'string' },
            userName: { type: 'string' },
            userRole: { type: 'string' },
            isPrivate: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음 (본인 메모만 수정 가능)',
  })
  @ApiResponse({
    status: 404,
    description: '메모를 찾을 수 없음',
  })
  async updateMemo(
    @Request() req,
    @Param('memoId') memoId: string,
    @Body('content') content: string,
  ) {
    return this.memoService.updateMemo(req.user.id, memoId, content);
  }

  @Delete(':memoId')
  @ApiOperation({
    summary: '메모 삭제',
    description: '본인이 작성한 메모만 삭제할 수 있습니다. (soft delete)',
  })
  @ApiParam({
    name: 'memoId',
    description: '메모 ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: '메모 삭제 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '메모가 성공적으로 삭제되었습니다.' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음 (본인 메모만 삭제 가능)',
  })
  @ApiResponse({
    status: 404,
    description: '메모를 찾을 수 없음',
  })
  async deleteMemo(@Request() req, @Param('memoId') memoId: string) {
    return this.memoService.deleteMemo(req.user.id, memoId);
  }
}