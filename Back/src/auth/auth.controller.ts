import {
  Controller,
  Post,
  Put,
  Get,
  Patch,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  SignupDto,
  LoginDto,
  CheckUsernameDto,
  VerifyTeamCodeDto,
  VerifyTokenDto,
  RefreshTokenDto,
  FindUserByEmailDto,
  SendResetCodeDto,
  ResetPasswordDto,
  VerifyPasswordDto,
  CheckUserExistsDto,
  CreateProfileDto,
  UpdateProfileDto,
} from '../common/dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({
    summary: '회원가입',
    description:
      '인증코드 기반 회원가입. 인증코드로 팀과 역할이 자동 설정됩니다.',
  })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 400, description: '유효하지 않은 인증코드' })
  @ApiResponse({ status: 409, description: '이미 존재하는 아이디' })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '로그인',
    description: '아이디와 비밀번호로 로그인',
  })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 400, description: '존재하지 않는 아이디' })
  @ApiResponse({
    status: 401,
    description: '비밀번호 불일치 또는 비활성화된 계정',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('check-username')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '아이디 중복 확인' })
  @ApiResponse({ status: 200, description: '사용 가능한 아이디' })
  @ApiResponse({ status: 409, description: '중복된 아이디' })
  async checkUsername(@Body() checkUsernameDto: CheckUsernameDto) {
    return this.authService.checkUsername(checkUsernameDto.username);
  }

  @Post('verify-team-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '인증코드 검증' })
  @ApiResponse({ status: 200, description: '유효한 인증코드' })
  @ApiResponse({ status: 400, description: '유효하지 않은 인증코드' })
  async verifyTeamCode(@Body() verifyTeamCodeDto: VerifyTeamCodeDto) {
    return this.authService.verifyTeamCode(verifyTeamCodeDto.authCode);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '프로필 업데이트',
    description: '로그인한 사용자의 프로필 정보를 업데이트합니다.',
  })
  @ApiBody({
    description: '업데이트할 프로필 정보',
    schema: {
      example: {
        avatar: 'https://example.com/avatar.jpg',
        bio: '소개글',
        playerID: '별명',
        email: 'email@example.com',
      },
    },
  })
  @ApiResponse({ status: 200, description: '프로필 업데이트 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async updateProfile(@Request() req, @Body() profileData: any) {
    return this.authService.updateProfile(req.user.id, profileData);
  }

  @Post('verify-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔐 JWT 토큰 검증',
    description:
      '제공된 JWT 토큰이 유효한지 확인하고 사용자 정보를 반환합니다.',
  })
  @ApiBody({
    description: '검증할 JWT 토큰',
    type: VerifyTokenDto,
  })
  @ApiResponse({
    status: 200,
    description: '✅ 유효한 토큰',
    schema: {
      example: {
        success: true,
        message: '유효한 토큰입니다.',
        data: {
          user: {
            id: '507f1f77bcf86cd799439011',
            username: 'testuser',
            teamName: 'KKRagingBulls',
            role: 'player',
            region: 'Seoul',
            playerId: '2025_KK_10',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '❌ 유효하지 않은 토큰' })
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto) {
    return this.authService.verifyToken(verifyTokenDto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔄 JWT 토큰 갱신',
    description: '기존 토큰을 검증하고 새로운 토큰을 발급합니다.',
  })
  @ApiBody({
    description: '갱신할 JWT 토큰',
    type: RefreshTokenDto,
  })
  @ApiResponse({
    status: 200,
    description: '✅ 토큰 갱신 성공',
    schema: {
      example: {
        success: true,
        message: '토큰이 갱신되었습니다.',
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: '507f1f77bcf86cd799439011',
            username: 'testuser',
            teamName: 'KKRagingBulls',
            role: 'player',
            region: 'Seoul',
            playerId: '2025_KK_10',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '❌ 토큰 갱신 실패' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🚪 로그아웃',
    description:
      '사용자 로그아웃 처리. JWT는 stateless이므로 클라이언트에서 토큰을 삭제하세요.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 로그아웃 성공',
    schema: {
      example: {
        success: true,
        message: '로그아웃되었습니다.',
      },
    },
  })
  async logout() {
    return this.authService.logout();
  }

  @Post('check-user-exists')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '👤 아이디 존재 확인',
    description: '비밀번호 리셋 전 아이디가 존재하는지 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 아이디 존재 확인',
    schema: {
      example: {
        success: true,
        message: '아이디가 확인되었습니다.',
        data: {
          hasEmail: true,
          teamName: 'KKRagingBulls',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '❌ 존재하지 않는 아이디 또는 이메일 미등록',
  })
  async checkUserExists(@Body() checkUserExistsDto: CheckUserExistsDto) {
    return this.authService.checkUserExists(checkUserExistsDto.username);
  }

  @Post('find-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '📧 이메일로 아이디 찾기',
    description: '등록된 이메일 주소로 해당 계정의 아이디를 찾습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 계정 찾기 성공',
    schema: {
      example: {
        success: true,
        message: '계정을 찾았습니다.',
        data: {
          username: 'user123',
          teamName: 'KKRagingBulls',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '❌ 해당 이메일로 등록된 계정 없음',
  })
  async findUserByEmail(@Body() findUserByEmailDto: FindUserByEmailDto) {
    return this.authService.findUserByEmail(findUserByEmailDto.email);
  }

  @Post('send-reset-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '📨 패스워드 리셋 코드 전송',
    description:
      '이메일로 6자리 패스워드 리셋 인증코드를 전송합니다. (10분 유효)',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 인증코드 전송 성공',
    schema: {
      example: {
        success: true,
        message: '인증코드가 이메일로 전송되었습니다.',
        data: {
          expiresAt: '2024-09-04T12:10:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '❌ 해당 이메일로 등록된 계정 없음 또는 재시도 횟수 초과',
  })
  async sendResetCode(@Body() sendResetCodeDto: SendResetCodeDto) {
    return this.authService.sendResetCode(sendResetCodeDto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔐 비밀번호 재설정',
    description: '인증코드를 확인하고 새로운 비밀번호로 변경합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 비밀번호 변경 성공',
    schema: {
      example: {
        success: true,
        message: '비밀번호가 성공적으로 변경되었습니다.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '❌ 잘못된 인증코드 또는 만료된 코드',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.resetCode,
      resetPasswordDto.newPassword,
    );
  }

  @Post('verify-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔍 패스워드 검증 (마이페이지)',
    description: '마이페이지 접근 시 현재 비밀번호 확인용 API',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 비밀번호 확인됨',
    schema: {
      example: {
        success: true,
        message: '비밀번호가 확인되었습니다.',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '❌ 비밀번호 불일치 또는 인증 필요',
  })
  async verifyPassword(
    @Request() req,
    @Body() verifyPasswordDto: VerifyPasswordDto,
  ) {
    return this.authService.verifyPassword(
      req.user.id,
      verifyPasswordDto.password,
    );
  }
  @Post('create-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '👤 프로필 생성',
    description: '회원가입 후 상세 프로필을 생성합니다.',
  })
  @ApiResponse({ status: 200, description: '✅ 프로필 생성 성공' })
  @ApiResponse({ status: 401, description: '❌ 인증 필요' })
  async createProfile(
    @Request() req,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.authService.createProfile(req.user.id, createProfileDto);
  }

  @Post('check-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔍 프로필 존재 여부 확인',
    description: '사용자의 프로필이 생성되어 있는지 확인합니다.',
  })
  @ApiResponse({ status: 200, description: '✅ 프로필 상태 확인' })
  @ApiResponse({ status: 401, description: '❌ 인증 필요' })
  async checkProfile(@Request() req) {
    return this.authService.checkProfileExists(req.user.id);
  }

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({
    summary: '프로필 이미지 업로드',
    description: '프로필 이미지를 S3에 업로드하고 URL을 반환합니다.',
  })
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.authService.uploadAvatar(req.user.id, file);
  }

  @Post('create-profile-with-avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '👤 프로필 + 이미지 생성',
    description: '회원가입 후 프로필과 프로필 이미지를 함께 생성합니다.',
  })
  async createProfileWithAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.authService.createProfileWithAvatar(
      req.user.id,
      createProfileDto,
      file,
    );
  }

  @Get('highlights')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '사용자 하이라이트 조회',
    description: '사용자의 자동 생성된 하이라이트 클립 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '하이라이트 목록 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        highlights: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              gameKey: { type: 'string' },
              clipKey: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getHighlights(@Request() req) {
    return this.authService.getHighlights(req.user.id);
  }

  @Get('my-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '📋 마이페이지 프로필 조회',
    description: `
    ## 👤 개인 프로필 정보 조회 API

    로그인한 사용자의 상세 프로필 정보를 조회합니다.
    
    ### 📋 포함된 정보
    - **필수 정보**: 유저ID, 유저네임(playerID), 풀네임
    - **연락처**: 이메일, 연락처, 주소, 우편번호
    - **신체 정보**: 키, 몸무게, 나이, 국적
    - **선수 정보**: 경력, 포지션(배열)
    - **소속 정보**: 지역, 팀명
    
    ### 🎯 사용 목적
    - 마이페이지에서 개인 정보 표시
    - 프로필 수정 페이지 초기값 제공
    - 선수 정보 확인 및 검증
    `,
  })
  @ApiResponse({
    status: 200,
    description: '✅ 프로필 조회 성공',
    schema: {
      example: {
        success: true,
        message: '프로필 정보를 조회했습니다.',
        data: {
          username: 'player123',
          playerID: '건국이',
          realName: '김철수',
          email: 'kim.chulsu@example.com',
          nationality: '대한민국',
          postalCode: '05029',
          phone: '010-1234-5678',
          address: '서울시 광진구 능동로 120',
          height: 180,
          weight: 75,
          age: 22,
          career: '고등학교 3년, 대학교 2년',
          position: ['QB', 'RB'],
          region: '서울권',
          teamName: '건국대 레이징불스',
          kafaStats: {
            totalPlayers: 3,
            season: '2025',
            league: '대학',
            players: [
              {
                playerName: '김민겸',
                jerseyNumber: 26,
                position: 'Unknown',
                rushing: {
                  rank: 5,
                  totalYards: 258,
                  forwardYards: 295,
                  backwardYards: -37,
                  yardsPerAttempt: 4.8,
                  attempts: 54,
                  touchdowns: 3,
                  longest: 25,
                },
                rawYardString: '258 (전진 : 295 / 후퇴 : -37)',
                lastUpdated: '2025-01-15T10:30:00.000Z',
              },
            ],
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '❌ 인증 필요',
    schema: {
      example: {
        success: false,
        message: '로그인이 필요합니다.',
        code: 'UNAUTHORIZED',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '❌ 사용자를 찾을 수 없음',
    schema: {
      example: {
        success: false,
        message: '사용자를 찾을 수 없습니다.',
        code: 'USER_NOT_FOUND',
      },
    },
  })
  async getMyProfile(@Request() req) {
    return this.authService.getMyProfile(req.user.id);
  }

  @Patch('my-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '✏️ 마이페이지 프로필 수정',
    description: `
    ## ✏️ 개인 프로필 정보 수정 API

    로그인한 사용자가 자신의 프로필 정보를 수정할 수 있습니다.
    
    ### 📋 수정 가능한 필드들
    - **기본 정보**: 실명, 플레이어ID/유저네임
    - **연락처**: 이메일, 연락처, 주소, 우편번호  
    - **신체 정보**: 키, 몸무게, 나이, 국적
    - **선수 정보**: 경력, 주포지션
    
    ### 🎯 특징
    - **부분 수정 지원**: 필요한 필드만 전송하면 됩니다
    - **실시간 반영**: 수정된 정보를 즉시 반환합니다
    - **유효성 검증**: 각 필드별 데이터 타입 및 형식을 검증합니다
    
    ### 📝 사용 예시
    \`\`\`json
    // 이름과 이메일만 수정하고 싶은 경우
    {
      "realName": "김철수",
      "email": "new.email@example.com"
    }
    
    // 신체 정보만 수정하고 싶은 경우  
    {
      "height": 185,
      "weight": 80,
      "age": 23
    }
    \`\`\`
    `,
  })
  @ApiResponse({
    status: 200,
    description: '✅ 프로필 수정 성공',
    schema: {
      example: {
        success: true,
        message: '프로필이 성공적으로 수정되었습니다.',
        data: {
          username: 'player123',
          playerID: '건국이',
          realName: '김철수',
          email: 'new.email@example.com',
          nationality: '대한민국',
          postalCode: '05029',
          phone: '010-1234-5678',
          address: '서울시 광진구 능동로 120',
          height: 185,
          weight: 80,
          age: 23,
          career: '고등학교 3년, 대학교 2년',
          position: ['QB'],
          region: '서울 1부 리그',
          teamName: '한양대 라이온즈',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '❌ 잘못된 요청 (수정할 정보 없음, 유효하지 않은 데이터)',
    schema: {
      example: {
        success: false,
        message: '수정할 정보가 없습니다.',
        code: 'NO_UPDATE_DATA',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '❌ 인증 필요',
    schema: {
      example: {
        success: false,
        message: '로그인이 필요합니다.',
        code: 'UNAUTHORIZED',
      },
    },
  })
  async updateMyProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateMyProfile(req.user.id, updateProfileDto);
  }

  @Get('my-team-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '🏆 팀 선수들 스탯 조회',
    description: `
    ## 👥 팀 선수들 스탯 조회 API

    로그인한 사용자와 같은 팀의 모든 선수들의 스탯을 포지션별로 그룹화하여 조회합니다.
    
    ### 📋 스탯 유형
    - **total**: 통산 커리어 스탯 (기본값)
    - **season**: 올해 시즌 스탯
    - **game**: 경기별 스탯 목록
    
    ### 📋 포함된 정보
    - **팀 정보**: 팀명, 지역 (예: "서울 1부 리그")
    - **선수별 정보**: 선수명, 등번호, 포지션
    - **포지션별 스탯**: QB, WR, RB, TE 등 포지션에 맞는 모든 스탯
    
    ### 🎯 사용 목적
    - 마이페이지에서 팀 선수들 스탯 표시
    - 포지션별 팀 성과 분석
    - 선수별 상세 스탯 비교
    `,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: '스탯 유형 (total: 통산, season: 시즌, game: 경기별)',
    enum: ['total', 'season', 'game'],
    example: 'total',
  })
  @ApiResponse({
    status: 200,
    description: '✅ 팀 스탯 조회 성공',
    schema: {
      example: {
        success: true,
        message: '팀 선수 스탯을 조회했습니다.',
        data: {
          teamName: 'HYlions',
          teamRegion: '서울 1부 리그',
          stats: {
            QB: [
              {
                playerId: 'HYlions_10',
                playerName: '김철수',
                teamName: 'HYlions',
                jerseyNumber: 10,
                position: 'QB',
                totalGamesPlayed: 5,
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
            ],
            WR: [
              {
                playerId: 'HYlions_80',
                playerName: '박민수',
                teamName: 'HYlions',
                jerseyNumber: 80,
                position: 'WR',
                totalGamesPlayed: 5,
                // WR 관련 스탯들...
              },
            ],
            RB: [],
            TE: [],
            // 다른 포지션들...
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '❌ 인증 필요',
    schema: {
      example: {
        success: false,
        message: '로그인이 필요합니다.',
        code: 'UNAUTHORIZED',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '❌ 사용자를 찾을 수 없음',
    schema: {
      example: {
        success: false,
        message: '사용자를 찾을 수 없습니다.',
        code: 'USER_NOT_FOUND',
      },
    },
  })
  async getMyTeamStats(@Request() req, @Query('type') type?: string) {
    return this.authService.getMyTeamStats(req.user.id, type || 'total');
  }

  @Delete('withdraw')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🗑️ 계정 탈퇴',
    description: `
    ## 🗑️ 계정 완전 탈퇴 API

    사용자의 계정을 완전히 삭제합니다.
    
    ### 🔥 주의사항
    - **복구 불가능**: 삭제된 계정은 복구할 수 없습니다
    - **즉시 로그아웃**: 탈퇴 즉시 로그인이 불가능해집니다
    - **팀 접근 차단**: 팀 소속이 해제되어 경기 영상 등 접근이 차단됩니다
    
    ### 📋 삭제되는 데이터
    - 사용자 계정 정보 (로그인 불가)
    - 팀 소속 정보 (팀 컨텐츠 접근 불가)
    
    ### 📋 보존되는 데이터  
    - 작성한 메모 및 기록들 (다른 팀원들이 볼 수 있음)
    - 경기 통계 데이터 (경기 기록 보존)
    `,
  })
  @ApiResponse({
    status: 200,
    description: '✅ 탈퇴 완료',
    schema: {
      example: {
        success: true,
        message: '계정이 성공적으로 탈퇴되었습니다. 이용해 주셔서 감사합니다.',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '❌ 인증 필요',
    schema: {
      example: {
        success: false,
        message: '로그인이 필요합니다.',
        code: 'UNAUTHORIZED',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '❌ 사용자를 찾을 수 없음',
    schema: {
      example: {
        success: false,
        message: '탈퇴할 계정을 찾을 수 없습니다.',
        code: 'USER_NOT_FOUND',
      },
    },
  })
  async withdrawUser(@Request() req) {
    return this.authService.withdrawUser(req.user.id);
  }
}
