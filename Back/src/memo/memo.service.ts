import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Memo, MemoDocument } from '../schemas/memo.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class MemoService {
  constructor(
    @InjectModel(Memo.name) private memoModel: Model<MemoDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notificationService: NotificationService,
  ) {}

  // 메모 작성
  async createMemo(
    userId: string,
    gameKey: string,
    clipKey: string,
    content: string,
    isPrivate: boolean = false,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    const memo = new this.memoModel({
      gameKey,
      clipKey,
      content,
      teamId: user.teamName,
      userId: user._id,
      userName: user.profile?.realName || user.username,
      userRole: user.role,
      isPrivate,
    });

    await memo.save();

    // 사용자의 memos 배열에 clipKey 추가 (중복 방지)
    console.log('🔍 메모 작성 전 user.memos:', user.memos);
    const existingMemo = user.memos.find(
      m => m.gameKey === gameKey && m.clipKey === clipKey
    );
    if (!existingMemo) {
      user.memos.push({ gameKey, clipKey });
      console.log('🔍 메모 추가 후 user.memos:', user.memos);
      await user.save();
      console.log('🔍 user.save() 완료');
    } else {
      console.log('🔍 이미 존재하는 메모:', existingMemo);
    }

    // 팀 메모인 경우 알림 발송
    if (!isPrivate) {
      await this.sendTeamNotification(user, gameKey, memo._id.toString());
    }

    return {
      success: true,
      message: '메모가 성공적으로 작성되었습니다.',
      memo,
    };
  }

  // 메모 목록 조회
  async getMemos(userId: string, gameKey?: string, clipKey?: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    const teamId = user.teamName;

    const query: any = {
      isDeleted: false,
      $or: [
        { teamId: teamId, isPrivate: false }, // 팀 공개 메모
        { userId: userId }, // 내가 작성한 모든 메모 (개인/공개 포함)
      ],
    };

    if (gameKey) query.gameKey = gameKey;
    if (clipKey) query.clipKey = clipKey;

    const memos = await this.memoModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();

    return {
      success: true,
      memos,
    };
  }

  // 특정 메모 조회
  async getMemoById(userId: string, memoId: string) {
    const memo = await this.memoModel.findById(memoId);
    if (!memo || memo.isDeleted) {
      throw new NotFoundException('메모를 찾을 수 없습니다.');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    const userTeamId = user.teamName;

    // 권한 체크: 같은 팀의 공개 메모이거나 본인이 작성한 메모만 조회 가능
    if (memo.isPrivate && memo.userId !== userId) {
      throw new ForbiddenException('이 메모를 조회할 권한이 없습니다.');
    }

    if (memo.teamId !== userTeamId && memo.userId !== userId) {
      throw new ForbiddenException('다른 팀의 메모는 조회할 수 없습니다.');
    }

    return {
      success: true,
      memo,
    };
  }

  // 메모 수정
  async updateMemo(userId: string, memoId: string, content: string) {
    // userId가 ObjectId일 수 있으므로 문자열로 변환
    const userIdString = userId.toString();
    const memo = await this.memoModel.findById(memoId);
    if (!memo || memo.isDeleted) {
      throw new NotFoundException('메모를 찾을 수 없습니다.');
    }

    if (memo.userId.toString() !== userIdString) {
      throw new ForbiddenException('본인이 작성한 메모만 수정할 수 있습니다.');
    }

    memo.content = content;
    // updatedAt은 timestamps: true로 자동 관리됨
    await memo.save();

    return {
      success: true,
      message: '메모가 성공적으로 수정되었습니다.',
      memo,
    };
  }

  // 메모 삭제 (soft delete)
  async deleteMemo(userId: string, memoId: string) {
    // userId가 ObjectId일 수 있으므로 문자열로 변환
    const userIdString = userId.toString();
    const memo = await this.memoModel.findById(memoId);
    if (!memo || memo.isDeleted) {
      throw new NotFoundException('메모를 찾을 수 없습니다.');
    }

    console.log('🔍 삭제 권한 체크:', {
      memoUserId: memo.userId,
      memoUserIdString: memo.userId.toString(),
      currentUserId: userId,
      currentUserIdString: userIdString,
      memoUserIdType: typeof memo.userId,
      currentUserIdType: typeof userId,
      isEqual: memo.userId.toString() === userIdString,
    });

    if (memo.userId.toString() !== userIdString) {
      throw new ForbiddenException('본인이 작성한 메모만 삭제할 수 있습니다.');
    }

    memo.isDeleted = true;
    await memo.save();

    return {
      success: true,
      message: '메모가 성공적으로 삭제되었습니다.',
    };
  }

  // 팀 알림 발송
  private async sendTeamNotification(
    user: UserDocument,
    gameKey: string,
    memoId: string,
  ) {
    const teamId = user.teamName;

    // 같은 팀의 모든 사용자 조회
    const teamMembers = await this.userModel.find({
      teamName: teamId,
      _id: { $ne: user._id }, // 작성자 본인 제외
    });

    const userName = user.profile?.realName || user.username;
    const userRole =
      user.role === 'player' ? '선수' : user.role === 'coach' ? '코치' : '';

    const notificationPromises = teamMembers.map((member) =>
      this.notificationService.createNotification({
        userId: member._id.toString(),
        team: teamId,
        gameKey: gameKey,
        type: 'memo',
        title: '새로운 메모',
        message: `${userName} ${userRole}가 ${gameKey} 경기에서 메모를 남겼습니다.`,
        gameInfo: {
          memoId,
          authorId: user._id.toString(),
          authorName: userName,
        },
      }),
    );

    await Promise.all(notificationPromises);
  }
}
