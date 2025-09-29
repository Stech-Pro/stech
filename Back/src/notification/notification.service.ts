import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  /**
   * 새로운 알림 생성
   */
  async createNotification(data: {
    userId: string;
    team: string;
    gameKey: string;
    type: string;
    title: string;
    message: string;
    gameInfo?: any;
  }): Promise<Notification> {
    const notification = new this.notificationModel(data);
    return notification.save();
  }

  /**
   * 팀의 모든 선수들에게 알림 생성
   */
  async createTeamNotifications(
    team: string,
    gameKey: string,
    gameInfo: any,
    userIds: string[],
  ): Promise<void> {
    const notifications = userIds.map(userId => ({
      userId,
      team,
      gameKey,
      type: 'game_analysis_complete',
      title: '경기 분석 완료 🎉',
      message: `${gameInfo.homeTeam} vs ${gameInfo.awayTeam} 경기 분석이 완료되었습니다.`,
      gameInfo: {
        homeTeam: gameInfo.homeTeam,
        awayTeam: gameInfo.awayTeam,
        date: gameInfo.date,
      },
    }));

    await this.notificationModel.insertMany(notifications);
  }

  /**
   * 사용자의 알림 목록 조회
   */
  async getUserNotifications(
    userId: string,
    limit: number = 20,
  ): Promise<Notification[]> {
    return this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * 사용자의 안 읽은 알림 개수 조회
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId,
      isRead: false,
    });
  }

  /**
   * 알림 읽음 처리
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await this.notificationModel.updateOne(
      { _id: notificationId, userId },
      { isRead: true },
    );
    return result.modifiedCount > 0;
  }

  /**
   * 사용자의 모든 알림 읽음 처리
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  /**
   * 경기 관련 알림 삭제 (경기 삭제 시)
   */
  async deleteGameNotifications(gameKey: string): Promise<void> {
    await this.notificationModel.deleteMany({ gameKey });
  }
}