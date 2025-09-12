"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("../common/dto/auth.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async signup(signupDto) {
        return this.authService.signup(signupDto);
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    async checkUsername(checkUsernameDto) {
        return this.authService.checkUsername(checkUsernameDto.username);
    }
    async verifyTeamCode(verifyTeamCodeDto) {
        return this.authService.verifyTeamCode(verifyTeamCodeDto.authCode);
    }
    async updateProfile(req, profileData) {
        return this.authService.updateProfile(req.user.id, profileData);
    }
    async verifyToken(verifyTokenDto) {
        return this.authService.verifyToken(verifyTokenDto);
    }
    async refreshToken(refreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto);
    }
    async logout() {
        return this.authService.logout();
    }
    async checkUserExists(checkUserExistsDto) {
        return this.authService.checkUserExists(checkUserExistsDto.username);
    }
    async findUserByEmail(findUserByEmailDto) {
        return this.authService.findUserByEmail(findUserByEmailDto.email);
    }
    async sendResetCode(sendResetCodeDto) {
        return this.authService.sendResetCode(sendResetCodeDto.email);
    }
    async resetPassword(resetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto.email, resetPasswordDto.resetCode, resetPasswordDto.newPassword);
    }
    async verifyPassword(req, verifyPasswordDto) {
        return this.authService.verifyPassword(req.user.id, verifyPasswordDto.password);
    }
    async createProfile(req, createProfileDto) {
        return this.authService.createProfile(req.user.id, createProfileDto);
    }
    async checkProfile(req) {
        return this.authService.checkProfileExists(req.user.id);
    }
    async uploadAvatar(req, file) {
        return this.authService.uploadAvatar(req.user.id, file);
    }
    async addMemo(req, body) {
        return this.authService.addMemo(req.user.id, body.gameKey, body.clipKey);
    }
    async removeMemo(req, body) {
        return this.authService.removeMemo(req.user.id, body.gameKey, body.clipKey);
    }
    async getHighlights(req) {
        return this.authService.getHighlights(req.user.id);
    }
    async getMemos(req) {
        return this.authService.getMemos(req.user.id);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('signup'),
    (0, swagger_1.ApiOperation)({
        summary: '회원가입',
        description: '인증코드 기반 회원가입. 인증코드로 팀과 역할이 자동 설정됩니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '회원가입 성공' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '유효하지 않은 인증코드' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: '이미 존재하는 아이디' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SignupDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '로그인',
        description: '아이디와 비밀번호로 로그인',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '로그인 성공' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '존재하지 않는 아이디' }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: '비밀번호 불일치 또는 비활성화된 계정',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('check-username'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '아이디 중복 확인' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '사용 가능한 아이디' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: '중복된 아이디' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.CheckUsernameDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkUsername", null);
__decorate([
    (0, common_1.Post)('verify-team-code'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '인증코드 검증' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '유효한 인증코드' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '유효하지 않은 인증코드' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.VerifyTeamCodeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyTeamCode", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '프로필 업데이트',
        description: '로그인한 사용자의 프로필 정보를 업데이트합니다.',
    }),
    (0, swagger_1.ApiBody)({
        description: '업데이트할 프로필 정보',
        schema: {
            example: {
                avatar: 'https://example.com/avatar.jpg',
                bio: '소개글',
                playerID: '별명',
                email: 'email@example.com',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '프로필 업데이트 성공' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '인증 필요' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('verify-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🔐 JWT 토큰 검증',
        description: '제공된 JWT 토큰이 유효한지 확인하고 사용자 정보를 반환합니다.',
    }),
    (0, swagger_1.ApiBody)({
        description: '검증할 JWT 토큰',
        type: auth_dto_1.VerifyTokenDto,
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '❌ 유효하지 않은 토큰' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.VerifyTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyToken", null);
__decorate([
    (0, common_1.Post)('refresh-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🔄 JWT 토큰 갱신',
        description: '기존 토큰을 검증하고 새로운 토큰을 발급합니다.',
    }),
    (0, swagger_1.ApiBody)({
        description: '갱신할 JWT 토큰',
        type: auth_dto_1.RefreshTokenDto,
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '❌ 토큰 갱신 실패' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🚪 로그아웃',
        description: '사용자 로그아웃 처리. JWT는 stateless이므로 클라이언트에서 토큰을 삭제하세요.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 로그아웃 성공',
        schema: {
            example: {
                success: true,
                message: '로그아웃되었습니다.',
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('check-user-exists'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '👤 아이디 존재 확인',
        description: '비밀번호 리셋 전 아이디가 존재하는지 확인합니다.',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '❌ 존재하지 않는 아이디 또는 이메일 미등록',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.CheckUserExistsDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkUserExists", null);
__decorate([
    (0, common_1.Post)('find-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '📧 이메일로 아이디 찾기',
        description: '등록된 이메일 주소로 해당 계정의 아이디를 찾습니다.',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '❌ 해당 이메일로 등록된 계정 없음',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.FindUserByEmailDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "findUserByEmail", null);
__decorate([
    (0, common_1.Post)('send-reset-code'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '📨 패스워드 리셋 코드 전송',
        description: '이메일로 6자리 패스워드 리셋 인증코드를 전송합니다. (10분 유효)',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '❌ 해당 이메일로 등록된 계정 없음 또는 재시도 횟수 초과',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SendResetCodeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendResetCode", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🔐 비밀번호 재설정',
        description: '인증코드를 확인하고 새로운 비밀번호로 변경합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 비밀번호 변경 성공',
        schema: {
            example: {
                success: true,
                message: '비밀번호가 성공적으로 변경되었습니다.',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '❌ 잘못된 인증코드 또는 만료된 코드',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('verify-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🔍 패스워드 검증 (마이페이지)',
        description: '마이페이지 접근 시 현재 비밀번호 확인용 API',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 비밀번호 확인됨',
        schema: {
            example: {
                success: true,
                message: '비밀번호가 확인되었습니다.',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: '❌ 비밀번호 불일치 또는 인증 필요',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.VerifyPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyPassword", null);
__decorate([
    (0, common_1.Post)('create-profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '👤 프로필 생성',
        description: '회원가입 후 상세 프로필을 생성합니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '✅ 프로필 생성 성공' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '❌ 인증 필요' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.CreateProfileDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Post)('check-profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🔍 프로필 존재 여부 확인',
        description: '사용자의 프로필이 생성되어 있는지 확인합니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '✅ 프로필 상태 확인' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '❌ 인증 필요' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkProfile", null);
__decorate([
    (0, common_1.Post)('upload-avatar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar')),
    (0, swagger_1.ApiOperation)({
        summary: '프로필 이미지 업로드',
        description: '프로필 이미지를 S3에 업로드하고 URL을 반환합니다.',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Put)('memo'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '클립 메모 추가',
        description: '사용자가 특정 클립을 메모에 추가합니다.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                gameKey: { type: 'string', example: '2024_FALL_W1_HYU_KU' },
                clipKey: { type: 'string', example: 'clip_1' },
            },
            required: ['gameKey', 'clipKey'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '메모가 성공적으로 추가되었습니다.',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                memos: {
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
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "addMemo", null);
__decorate([
    (0, common_1.Delete)('memo'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '클립 메모 삭제',
        description: '사용자가 메모한 클립을 삭제합니다.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                gameKey: { type: 'string', example: '2024_FALL_W1_HYU_KU' },
                clipKey: { type: 'string', example: 'clip_1' },
            },
            required: ['gameKey', 'clipKey'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '메모가 성공적으로 삭제되었습니다.',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                memos: {
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
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "removeMemo", null);
__decorate([
    (0, common_1.Get)('highlights'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '사용자 하이라이트 조회',
        description: '사용자의 자동 생성된 하이라이트 클립 목록을 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getHighlights", null);
__decorate([
    (0, common_1.Get)('memos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '사용자 메모 조회',
        description: '사용자가 저장한 메모 클립 목록을 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '메모 목록 조회 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                memos: {
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
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMemos", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map