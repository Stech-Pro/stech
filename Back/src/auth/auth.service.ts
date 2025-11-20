import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../schemas/user.schema';
import { Team, TeamDocument } from '../schemas/team.schema';
import {
  PlayerTotalStats,
  PlayerTotalStatsDocument,
} from '../schemas/player-total-stats.schema';
import {
  PlayerSeasonStats,
  PlayerSeasonStatsDocument,
} from '../schemas/player-season-stats.schema';
import {
  PlayerGameStats,
  PlayerGameStatsDocument,
} from '../schemas/player-game-stats.schema';
import {
  SignupDto,
  LoginDto,
  VerifyTokenDto,
  RefreshTokenDto,
  CreateProfileDto,
  UpdateProfileDto,
} from '../common/dto/auth.dto';
import { TEAM_CODES } from '../common/constants/team-codes';
import { EmailService } from '../utils/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(PlayerTotalStats.name)
    private playerTotalStatsModel: Model<PlayerTotalStatsDocument>,
    @InjectModel(PlayerSeasonStats.name)
    private playerSeasonStatsModel: Model<PlayerSeasonStatsDocument>,
    @InjectModel(PlayerGameStats.name)
    private playerGameStatsModel: Model<PlayerGameStatsDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { username, password, authCode } = signupDto;

    console.log('=== 회원가입 시도 ===');
    console.log('받은 데이터:', { username, authCode });

    // 아이디 중복 확인
    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) {
      throw new ConflictException('이미 존재하는 아이디입니다.');
    }

    // 인증코드 검증
    const teamInfo = TEAM_CODES[authCode];
    if (!teamInfo) {
      throw new BadRequestException('유효하지 않은 인증코드입니다.');
    }

    // 새 유저 생성
    const newUser = new this.userModel({
      username,
      password,
      teamName: teamInfo.team,
      role: teamInfo.role,
      region: teamInfo.region,
      authCode,
      isActive: true,
      profile: {
        // 선수 프로필 필드들을 null로 초기화
        playerKey: null,
        realName: null,
        status: null,
        positions: {
          PS1: null,
          PS2: null,
          PS3: null,
          PS4: null,
          PS5: null,
          PS6: null,
          PS7: null,
          PS8: null,
          PS9: null,
          PS10: null,
        },
        physicalInfo: {
          height: null,
          weight: null,
          age: null,
          grade: null,
          nationality: null,
        },
        contactInfo: {
          postalCode: null,
          address: null,
          phone: null,
          email: null,
        },
        career: null,
        totalStats: null,
        seasonStats: [],
        gameStats: [],
      },
    });

    console.log('유저 저장 전:', newUser);
    await newUser.save();
    console.log('✅ 유저 저장 완료:', newUser._id);

    // JWT 토큰 발급
    console.log('회원가입시 JWT_SECRET:', process.env.JWT_SECRET);
    const token = this.jwtService.sign({
      id: newUser._id,
      username: newUser.username,
      team: newUser.teamName,
      role: newUser.role,
      playerId: newUser.profile?.playerKey || null,
    });

    console.log('발급된 토큰:', token);

    // 회원가입 성공 후 토큰 반환 부분 확인
    return {
      success: true,
      message: '회원가입 성공!',
      data: {
        token, // 토큰이 여기 포함되어야 함
        user: {
          id: newUser._id,
          username: newUser.username,
          teamName: newUser.teamName,
          role: newUser.role,
          region: newUser.region,
        },
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    console.log('=== 로그인 시도 ===');
    console.log('받은 아이디:', username);

    const user = await this.userModel.findOne({ username: loginDto.username });
    if (!user) {
      console.log('❌ 아이디 불일치');
      throw new BadRequestException('존재하지 않는 아이디입니다.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ 비밀번호 불일치');
      throw new UnauthorizedException('비밀번호가 틀렸습니다.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('비활성화된 계정입니다.');
    }

    const token = this.jwtService.sign({
      id: user._id,
      username: user.username,
      team: user.teamName,
      role: user.role,
      playerId: user.profile?.playerKey || null,
    });

    console.log('✅ 로그인 성공');

    return {
      success: true,
      message: '로그인 성공',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          teamName: user.teamName,
          role: user.role,
          region: user.region,
          playerID: user.profile?.playerID || null,
          email: user.profile?.contactInfo?.email || null,
          bio: user.profile?.bio || null,
          avatar: user.profile?.avatar || null,
        },
      },
    };
  }

  async checkUsername(username: string) {
    console.log('=== 아이디 중복 확인 ===');
    console.log('받은 아이디:', username);

    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) {
      console.log('❌ 중복된 아이디');
      throw new ConflictException('중복된 아이디입니다.');
    }

    console.log('✅ 사용 가능한 아이디');
    return {
      success: true,
      message: '사용 가능한 아이디입니다.',
      data: { available: true },
    };
  }

  async verifyTeamCode(authCode: string) {
    console.log('=== 인증코드 검증 ===');
    console.log('받은 인증코드:', authCode);

    const teamInfo = TEAM_CODES[authCode];
    if (!teamInfo) {
      console.log('❌ 유효하지 않은 인증코드');
      throw new BadRequestException('유효하지 않은 인증코드입니다.');
    }

    console.log('✅ 유효한 인증코드:', teamInfo);
    return {
      success: true,
      message: '인증 완료',
      data: {
        team: teamInfo.team,
        role: teamInfo.role,
        region: teamInfo.region,
      },
    };
  }

  async findUserByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async updateProfile(userId: string, profileData: any) {
    console.log('=== 프로필 업데이트 ===');
    console.log('userId:', userId);
    console.log('profileData:', profileData);

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          'profile.avatar': profileData.avatar,
          'profile.bio': profileData.bio,
          'profile.playerID': profileData.playerID || null,
          'profile.email': profileData.email,
        },
      },
      { new: true },
    );

    if (!updatedUser) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    console.log('✅ 프로필 업데이트 완료');

    return {
      success: true,
      message: '프로필이 업데이트되었습니다.',
      data: {
        profile: updatedUser.profile,
      },
    };
  }

  async verifyToken(verifyTokenDto: VerifyTokenDto) {
    console.log('=== 토큰 검증 ===');

    try {
      const decoded = this.jwtService.verify(verifyTokenDto.token);

      const user = await this.userModel.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('유효하지 않은 사용자입니다.');
      }

      console.log('✅ 토큰 검증 성공:', decoded);
      return {
        success: true,
        message: '유효한 토큰입니다.',
        data: {
          user: {
            id: user._id,
            username: user.username,
            teamName: user.teamName,
            role: user.role,
            region: user.region,
            playerId: user.profile?.playerKey || null,
            playerID: user.profile?.playerID || null,
            email: user.profile?.contactInfo?.email || null,
            bio: user.profile?.bio || null,
            avatar: user.profile?.avatar || null,
          },
        },
      };
    } catch (error) {
      console.log('❌ 토큰 검증 실패:', error.message);
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    console.log('=== 토큰 갱신 ===');

    try {
      const decoded = this.jwtService.verify(refreshTokenDto.token);

      // 사용자 존재 확인
      const user = await this.userModel.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('유효하지 않은 사용자입니다.');
      }

      // 새로운 토큰 발급
      const newToken = this.jwtService.sign({
        id: user._id,
        username: user.username,
        team: user.teamName,
        role: user.role,
        playerId: user.profile?.playerKey || null,
      });

      console.log('✅ 토큰 갱신 성공');
      return {
        success: true,
        message: '토큰이 갱신되었습니다.',
        data: {
          token: newToken,
          user: {
            id: user._id,
            username: user.username,
            teamName: user.teamName,
            role: user.role,
            region: user.region,
            playerId: user.profile?.playerKey || null,
            playerID: user.profile?.playerID || null,
            email: user.profile?.contactInfo?.email || null,
            bio: user.profile?.bio || null,
            avatar: user.profile?.avatar || null,
          },
        },
      };
    } catch (error) {
      console.log('❌ 토큰 갱신 실패:', error.message);
      throw new UnauthorizedException('토큰 갱신에 실패했습니다.');
    }
  }

  async logout() {
    console.log('=== 로그아웃 ===');
    // JWT는 stateless이므로 클라이언트에서 토큰 삭제
    // 서버에서는 응답만 반환

    console.log('✅ 로그아웃 처리 완료');
    return {
      success: true,
      message: '로그아웃되었습니다.',
    };
  }

  // 0. 아이디 존재 확인 API (비밀번호 리셋 전 단계)
  async checkUserExists(username: string) {
    console.log('=== 아이디 존재 확인 ===');
    console.log('받은 아이디:', username);

    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new BadRequestException('존재하지 않는 아이디입니다.');
    }

    // 이메일이 등록되어 있는지도 확인
    if (!user.profile?.contactInfo?.email) {
      throw new BadRequestException('해당 계정에 등록된 이메일이 없습니다.');
    }

    console.log('✅ 아이디 존재 확인 완료');
    return {
      success: true,
      message: '아이디가 확인되었습니다.',
      data: {
        hasEmail: !!user.profile.contactInfo.email,
        teamName: user.teamName,
      },
    };
  }

  // 1. 이메일로 아이디 찾기 API
  async findUserByEmail(email: string) {
    console.log('=== 이메일로 아이디 찾기 ===');
    console.log('받은 이메일:', email);

    const user = await this.userModel.findOne({
      'profile.contactInfo.email': email,
    });

    if (!user) {
      throw new BadRequestException(
        '해당 이메일로 등록된 계정을 찾을 수 없습니다.',
      );
    }

    console.log('✅ 계정 찾기 성공:', user.username);
    return {
      success: true,
      message: '계정을 찾았습니다.',
      data: {
        username: user.username,
        teamName: user.teamName,
      },
    };
  }

  // 2. 패스워드 리셋 코드 전송 API
  async sendResetCode(email: string) {
    console.log('=== 패스워드 리셋 코드 전송 ===');
    console.log('받은 이메일:', email);

    const user = await this.userModel.findOne({
      'profile.contactInfo.email': email,
    });

    if (!user) {
      throw new BadRequestException(
        '해당 이메일로 등록된 계정을 찾을 수 없습니다.',
      );
    }

    // 재시도 횟수 체크 (5회 제한)
    if (user.passwordResetAttempts >= 5) {
      throw new BadRequestException(
        '재시도 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.',
      );
    }

    // 6자리 인증코드 생성
    const resetCode = this.emailService.generateResetCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료

    // DB에 인증코드 저장
    await this.userModel.findByIdAndUpdate(user._id, {
      passwordResetCode: resetCode,
      passwordResetExpires: expiresAt,
      $inc: { passwordResetAttempts: 1 },
    });

    // 이메일 발송
    const emailSent = await this.emailService.sendPasswordResetEmail(
      email,
      resetCode,
      user.username,
    );

    if (!emailSent) {
      throw new BadRequestException('이메일 발송에 실패했습니다.');
    }

    console.log('✅ 리셋 코드 전송 성공');
    return {
      success: true,
      message: '인증코드가 이메일로 전송되었습니다.',
      data: {
        expiresAt: expiresAt.toISOString(),
      },
    };
  }

  // 3. 패스워드 리셋 API
  async resetPassword(email: string, resetCode: string, newPassword: string) {
    console.log('=== 패스워드 리셋 ===');
    console.log('받은 이메일:', email);

    const user = await this.userModel.findOne({
      'profile.contactInfo.email': email,
    });

    if (!user) {
      throw new BadRequestException(
        '해당 이메일로 등록된 계정을 찾을 수 없습니다.',
      );
    }

    // 인증코드 확인
    if (!user.passwordResetCode || user.passwordResetCode !== resetCode) {
      throw new BadRequestException('잘못된 인증코드입니다.');
    }

    // 만료시간 확인
    if (!user.passwordResetExpires || new Date() > user.passwordResetExpires) {
      throw new BadRequestException('인증코드가 만료되었습니다.');
    }

    // 패스워드 업데이트 (pre-save hook에서 자동 해싱)
    user.password = newPassword;
    user.passwordResetCode = null;
    user.passwordResetExpires = null;
    user.passwordResetAttempts = 0;

    await user.save();

    console.log('✅ 패스워드 리셋 성공');
    return {
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    };
  }

  // 4. 마이페이지용 패스워드 검증 API
  async verifyPassword(userId: string, password: string) {
    console.log('=== 패스워드 검증 (마이페이지) ===');
    console.log('userId:', userId);

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다.');
    }

    console.log('✅ 패스워드 검증 성공');
    return {
      success: true,
      message: '비밀번호가 확인되었습니다.',
    };
  }
  // 프로필 생성
  async createProfile(userId: string, profileData: CreateProfileDto) {
    console.log('=== 프로필 생성 ===');
    console.log('userId:', userId);
    console.log('profileData:', profileData);

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          'profile.realName': profileData.realName,
          'profile.playerID': profileData.playerID,
          'profile.contactInfo.email': profileData.email,
          'profile.contactInfo.phone': profileData.phone,
          'profile.contactInfo.address': profileData.address,
          'profile.contactInfo.postalCode': profileData.postalCode || null,
          'profile.physicalInfo.height': profileData.height,
          'profile.physicalInfo.weight': profileData.weight,
          'profile.physicalInfo.age': profileData.age,
          'profile.physicalInfo.nationality': profileData.nationality,
          'profile.career': profileData.career,
          'profile.positions.PS1': profileData.position,
          'profile.joinDate': new Date(),
        },
      },
      { new: true },
    );

    console.log('업데이트된 사용자:', updatedUser);

    if (!updatedUser) {
      throw new BadRequestException('프로필 생성에 실패했습니다.');
    }

    // 새로운 토큰 발급
    const newToken = this.jwtService.sign({
      id: updatedUser._id,
      username: updatedUser.username,
      team: updatedUser.teamName,
      role: updatedUser.role,
      playerId: updatedUser.profile?.playerID || null,
      realName: updatedUser.profile?.realName || null,
    });

    console.log('✅ 프로필 생성 완료');

    return {
      success: true,
      message: '프로필이 성공적으로 생성되었습니다.',
      data: {
        token: newToken,
        profile: updatedUser.profile,
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          teamName: updatedUser.teamName,
          role: updatedUser.role,
          region: updatedUser.region,
          realName: updatedUser.profile?.realName,
          playerID: updatedUser.profile?.playerID,
        },
      },
    };
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('이미지 파일이 없습니다.');
    }

    // 파일 크기 제한 (예: 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('파일 크기는 5MB를 초과할 수 없습니다.');
    }

    // 이미지 파일 타입 확인
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('이미지 파일만 업로드 가능합니다.');
    }

    // S3 업로드 로직은 나중에 구현
    const fileName = `avatars/${userId}_${Date.now()}_${file.originalname}`;

    // 임시로 로컬 URL 반환
    const avatarUrl = `https://temp-url.com/${fileName}`;

    return {
      success: true,
      message: '프로필 이미지 업로드 성공',
      data: {
        avatarUrl,
      },
    };
  }

  // 프로필 존재 여부 확인
  async checkProfileExists(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    const hasCompleteProfile = !!(
      user.profile?.realName &&
      user.profile?.physicalInfo?.height &&
      user.profile?.contactInfo?.email
    );

    return {
      success: true,
      data: {
        hasProfile: hasCompleteProfile,
        profile: user.profile,
      },
    };
  }

  // 하이라이트 조회
  async getHighlights(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    return {
      success: true,
      highlights: user.highlights || [],
    };
  }

  // 자동 하이라이트 추가 (게임 분석 시 호출)
  async addHighlight(userId: string, gameKey: string, clipKey: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      return; // 사용자가 없으면 조용히 종료
    }

    // 중복 체크
    const alreadyExists = user.highlights.some(
      (highlight) =>
        highlight.gameKey === gameKey && highlight.clipKey === clipKey,
    );

    if (!alreadyExists) {
      user.highlights.push({ gameKey, clipKey });
      await user.save();
    }
  }

  // 마이페이지 프로필 정보 조회
  async getMyProfile(userId: string) {
    console.log('=== 마이페이지 프로필 조회 ===');
    console.log('userId:', userId);

    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    console.log('조회된 사용자:', {
      username: user.username,
      teamName: user.teamName,
      hasProfile: !!user.profile?.realName,
    });

    // 팀 정보 조회하여 league 정보 가져오기
    const team = await this.teamModel
      .findOne({ teamName: user.teamName })
      .lean();
    const league = team?.league || '1부'; // 기본값 1부

    // 프로필이 완성되지 않은 경우 체크
    const isProfileComplete = !!(
      user.profile?.realName &&
      user.profile?.contactInfo?.email &&
      user.profile?.physicalInfo?.height
    );

    const profileData = {
      username: user.username,
      playerID: user.profile?.playerID || '미설정', // playerID를 유저네임으로 사용
      realName: user.profile?.realName || '미설정',
      email: user.profile?.contactInfo?.email || '미설정',
      nationality: user.profile?.physicalInfo?.nationality || '미설정',
      postalCode: user.profile?.contactInfo?.postalCode || '미설정',
      phone: user.profile?.contactInfo?.phone || '미설정',
      address: user.profile?.contactInfo?.address || '미설정',
      height: user.profile?.physicalInfo?.height || 0,
      weight: user.profile?.physicalInfo?.weight || 0,
      age: user.profile?.physicalInfo?.age || 0,
      career: user.profile?.career || '미설정',
      position: this.formatPositions(user.profile?.positions),
      region: this.formatRegionWithLeague(user.region, league),
      teamName: user.teamName,
    };

    console.log('✅ 프로필 조회 완료');

    return {
      success: true,
      message: '프로필 정보를 조회했습니다.',
      data: profileData,
    };
  }

  // 마이페이지 프로필 정보 수정
  async updateMyProfile(userId: string, updateData: UpdateProfileDto) {
    console.log('=== 마이페이지 프로필 수정 ===');
    console.log('userId:', userId);
    console.log('updateData:', updateData);

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    // 수정할 데이터 준비
    const updateFields: any = {};

    // 기본 정보 수정
    if (updateData.realName !== undefined) {
      updateFields['profile.realName'] = updateData.realName;
    }
    if (updateData.playerID !== undefined) {
      updateFields['profile.playerID'] = updateData.playerID;
    }

    // 연락처 정보 수정
    if (updateData.email !== undefined) {
      updateFields['profile.contactInfo.email'] = updateData.email;
    }
    if (updateData.phone !== undefined) {
      updateFields['profile.contactInfo.phone'] = updateData.phone;
    }
    if (updateData.address !== undefined) {
      updateFields['profile.contactInfo.address'] = updateData.address;
    }
    if (updateData.postalCode !== undefined) {
      updateFields['profile.contactInfo.postalCode'] = updateData.postalCode;
    }

    // 신체 정보 수정
    if (updateData.height !== undefined) {
      updateFields['profile.physicalInfo.height'] = updateData.height;
    }
    if (updateData.weight !== undefined) {
      updateFields['profile.physicalInfo.weight'] = updateData.weight;
    }
    if (updateData.age !== undefined) {
      updateFields['profile.physicalInfo.age'] = updateData.age;
    }
    if (updateData.nationality !== undefined) {
      updateFields['profile.physicalInfo.nationality'] = updateData.nationality;
    }

    // 기타 정보 수정
    if (updateData.career !== undefined) {
      updateFields['profile.career'] = updateData.career;
    }
    if (updateData.position !== undefined) {
      updateFields['profile.positions.PS1'] = updateData.position; // 주 포지션은 PS1에 저장
    }

    // 업데이트할 필드가 없으면 에러
    if (Object.keys(updateFields).length === 0) {
      throw new BadRequestException('수정할 정보가 없습니다.');
    }

    console.log('업데이트할 필드들:', updateFields);

    // 데이터베이스 업데이트
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true, runValidators: true },
      )
      .lean();

    if (!updatedUser) {
      throw new BadRequestException('프로필 업데이트에 실패했습니다.');
    }

    console.log('✅ 프로필 업데이트 완료');

    // 업데이트된 프로필 정보 반환 (getMyProfile과 동일한 형태)
    const team = await this.teamModel
      .findOne({ teamName: updatedUser.teamName })
      .lean();
    const league = team?.league || '1부';

    const profileData = {
      username: updatedUser.username,
      playerID: updatedUser.profile?.playerID || '미설정',
      realName: updatedUser.profile?.realName || '미설정',
      email: updatedUser.profile?.contactInfo?.email || '미설정',
      nationality: updatedUser.profile?.physicalInfo?.nationality || '미설정',
      postalCode: updatedUser.profile?.contactInfo?.postalCode || '미설정',
      phone: updatedUser.profile?.contactInfo?.phone || '미설정',
      address: updatedUser.profile?.contactInfo?.address || '미설정',
      height: updatedUser.profile?.physicalInfo?.height || 0,
      weight: updatedUser.profile?.physicalInfo?.weight || 0,
      age: updatedUser.profile?.physicalInfo?.age || 0,
      career: updatedUser.profile?.career || '미설정',
      position: this.formatPositions(updatedUser.profile?.positions),
      region: this.formatRegionWithLeague(updatedUser.region, league),
      teamName: updatedUser.teamName,
    };

    return {
      success: true,
      message: '프로필이 성공적으로 수정되었습니다.',
      data: profileData,
    };
  }

  // 팀 선수들 스탯 조회
  async getMyTeamStats(userId: string, type: string = 'total') {
    console.log('=== 팀 선수 스탯 조회 ===');
    console.log('userId:', userId, 'type:', type);

    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    console.log('조회된 사용자:', {
      username: user.username,
      teamName: user.teamName,
      region: user.region,
    });

    // 팀 정보 조회하여 league 정보 가져오기
    const team = await this.teamModel
      .findOne({ teamName: user.teamName })
      .lean();
    const league = team?.league || '1부';

    // 타입에 따라 다른 스탯 조회
    let teamStats: any[] = [];
    let statsType = '';

    switch (type) {
      case 'total':
        teamStats = await this.playerTotalStatsModel
          .find({
            teamName: user.teamName,
          })
          .lean();
        statsType = '통산 커리어 스탯';
        break;

      case 'season':
        teamStats = await this.getTeamSeasonStats(user.teamName);
        statsType = '2024 시즌 스탯';
        break;

      case 'game':
        teamStats = await this.getTeamGameStats(user.teamName);
        statsType = '경기별 스탯';
        break;

      default:
        throw new BadRequestException(
          '유효하지 않은 스탯 타입입니다. (total, season, game)',
        );
    }

    console.log(`팀 선수 수: ${teamStats.length}명 (${statsType})`);

    // 포지션별로 그룹화
    const groupedStats = this.groupStatsByPosition(teamStats);

    return {
      success: true,
      message: `${statsType}을 조회했습니다.`,
      data: {
        teamName: user.teamName,
        teamRegion: this.formatRegionWithLeague(user.region, league),
        statsType: statsType,
        stats: groupedStats,
      },
    };
  }

  // 팀 시즌 스탯 조회 헬퍼 함수
  private async getTeamSeasonStats(teamName: string): Promise<any[]> {
    console.log('=== 팀 시즌 스탯 조회 ===');

    // 2024 시즌 스탯 조회
    const seasonStats = await this.playerSeasonStatsModel
      .find({
        teamName: teamName,
        season: '2024', // 현재 시즌
      })
      .lean();

    // PlayerTotalStats 형식과 맞추기 위해 데이터 변환
    const formattedStats = seasonStats.map((stat) => ({
      playerId: stat.playerId,
      playerName: '미설정', // playerName 필드가 스키마에 없으므로 기본값
      teamName: stat.teamName,
      jerseyNumber: stat.jerseyNumber,
      position: stat.position,
      totalGamesPlayed: stat.gamesPlayed || 0,
      ...stat.stats, // 시즌 스탯들을 펼쳐서 추가
    }));

    console.log(`시즌 스탯 조회 완료: ${formattedStats.length}명`);
    return formattedStats;
  }

  // 팀 경기별 스탯 조회 헬퍼 함수
  private async getTeamGameStats(teamName: string): Promise<any[]> {
    console.log('=== 팀 경기별 스탯 조회 ===');

    // 팀의 모든 경기별 스탯 조회
    const gameStats = await this.playerGameStatsModel
      .find({
        teamName: teamName,
      })
      .lean();

    // 선수별로 그룹화 (경기별 스탯을 선수당 배열로)
    const playerGameMap = new Map();

    gameStats.forEach((stat) => {
      const playerId = stat.playerId;
      if (!playerGameMap.has(playerId)) {
        playerGameMap.set(playerId, {
          playerId: stat.playerId,
          playerName: '미설정', // playerName 필드가 스키마에 없으므로 기본값
          teamName: stat.teamName,
          jerseyNumber: stat.jerseyNumber,
          position: stat.position,
          totalGamesPlayed: 0,
          games: [], // 경기별 스탯 배열
        });
      }

      const playerData = playerGameMap.get(playerId);
      playerData.games.push({
        gameKey: stat.gameKey,
        gameDate: stat.date, // date 필드 사용
        opponent: stat.opponent,
        ...stat.stats, // 경기 스탯들
      });
      playerData.totalGamesPlayed = playerData.games.length;
    });

    const formattedStats = Array.from(playerGameMap.values());

    console.log(`경기별 스탯 조회 완료: ${formattedStats.length}명`);
    return formattedStats;
  }

  // 포지션별 그룹화 헬퍼 함수
  private groupStatsByPosition(teamStats: any[]): any {
    const grouped: any = {};

    teamStats.forEach((player) => {
      const position = player.position;

      if (!grouped[position]) {
        grouped[position] = [];
      }

      // 선수 정보와 스탯을 함께 추가
      const playerData = {
        playerId: player.playerId,
        playerName: player.playerName,
        teamName: player.teamName,
        jerseyNumber: player.jerseyNumber,
        position: player.position,
        totalGamesPlayed: player.totalGamesPlayed,
        ...player.stats, // 포지션별 스탯들을 펼쳐서 추가
      };

      grouped[position].push(playerData);
    });

    console.log('포지션별 그룹화 완료:', Object.keys(grouped));

    return grouped;
  }

  // 지역 + 리그 정보 포맷팅 헬퍼 함수
  private formatRegionWithLeague(region: string, league: string): string {
    const regionMap = {
      Seoul: '서울',
      'Gyeonggi-Gangwon': '경기강원',
      'Daegu-Gyeongbuk': '대구경북',
      'Busan-Gyeongnam': '부산경남',
      Amateur: '사회인',
    };

    const koreanRegion = regionMap[region] || region;

    // 사회인의 경우 리그 구분 없이 표시
    if (region === 'Amateur') {
      return '사회인';
    }

    return `${koreanRegion} ${league} 리그`;
  }

  // 포지션 정보 포맷팅 헬퍼 함수
  private formatPositions(positions: any): string[] {
    if (!positions) return ['미설정'];

    const positionArray = [];
    for (let i = 1; i <= 10; i++) {
      const posKey = `PS${i}`;
      if (positions[posKey]) {
        positionArray.push(positions[posKey]);
      }
    }

    return positionArray.length > 0 ? positionArray : ['미설정'];
  }
}
