import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({
    summary: '🔔 내 알림 목록 조회',
    description: '로그인한 사용자의 알림 목록을 최신순으로 조회합니다.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '조회할 알림 개수 (기본값: 20)',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '✅ 알림 목록 조회 성공',
    schema: {
      example: {
        success: true,
        data: {
          notifications: [
            {
              _id: '507f1f77bcf86cd799439011',
              userId: '2025_KK_10',
              team: 'HYLions',
              gameKey: 'HFHY20240907',
              type: 'game_analysis_complete',
              title: '경기 분석 완료 🎉',
              message: 'HYLions vs KMRazorbacks 경기 분석이 완료되었습니다.',
              isRead: false,
              gameInfo: {
                homeTeam: 'HYLions',
                awayTeam: 'KMRazorbacks',
                date: '2024-09-07(토) 10:00',
              },
              createdAt: '2025-01-24T10:30:00.000Z',
            },
          ],
          unreadCount: 5,
        },
      },
    },
  })
  async getMyNotifications(@Req() req: any, @Query('limit') limit?: number) {
    const userId = req.user.username || req.user.id;
    
    const notifications = await this.notificationService.getUserNotifications(
      userId,
      limit || 20,
    );
    
    const unreadCount = await this.notificationService.getUnreadCount(userId);

    return {
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    };
  }

  @Get('unread-count')
  @ApiOperation({
    summary: '📊 안 읽은 알림 개수 조회',
    description: '로그인한 사용자의 안 읽은 알림 개수만 빠르게 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 안 읽은 알림 개수 조회 성공',
    schema: {
      example: {
        success: true,
        data: {
          unreadCount: 5,
        },
      },
    },
  })
  async getUnreadCount(@Req() req: any) {
    const userId = req.user.username || req.user.id;
    const unreadCount = await this.notificationService.getUnreadCount(userId);

    return {
      success: true,
      data: {
        unreadCount,
      },
    };
  }

  @Put(':id/read')
  @ApiOperation({
    summary: '✅ 알림 읽음 처리',
    description: '특정 알림을 읽음 상태로 변경합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '알림 ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 알림 읽음 처리 성공',
  })
  @ApiResponse({
    status: 404,
    description: '❌ 알림을 찾을 수 없음',
  })
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.username || req.user.id;
    const success = await this.notificationService.markAsRead(id, userId);

    if (!success) {
      return {
        success: false,
        message: '알림을 찾을 수 없거나 권한이 없습니다.',
      };
    }

    return {
      success: true,
      message: '알림을 읽음 처리했습니다.',
    };
  }

  @Put('read-all')
  @ApiOperation({
    summary: '✅ 모든 알림 읽음 처리',
    description: '사용자의 모든 알림을 읽음 상태로 변경합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 모든 알림 읽음 처리 성공',
  })
  async markAllAsRead(@Req() req: any) {
    const userId = req.user.username || req.user.id;
    await this.notificationService.markAllAsRead(userId);

    return {
      success: true,
      message: '모든 알림을 읽음 처리했습니다.',
    };
  }
}