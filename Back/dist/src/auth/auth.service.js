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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt_1 = require("@nestjs/jwt");
const user_schema_1 = require("../schemas/user.schema");
const team_codes_1 = require("../common/constants/team-codes");
const email_service_1 = require("../utils/email.service");
let AuthService = class AuthService {
    userModel;
    jwtService;
    emailService;
    constructor(userModel, jwtService, emailService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async signup(signupDto) {
        const { username, password, authCode } = signupDto;
        console.log('=== 회원가입 시도 ===');
        console.log('받은 데이터:', { username, authCode });
        const existingUser = await this.userModel.findOne({ username });
        if (existingUser) {
            throw new common_1.ConflictException('이미 존재하는 아이디입니다.');
        }
        const teamInfo = team_codes_1.TEAM_CODES[authCode];
        if (!teamInfo) {
            throw new common_1.BadRequestException('유효하지 않은 인증코드입니다.');
        }
        const newUser = new this.userModel({
            username,
            password,
            teamName: teamInfo.team,
            role: teamInfo.role,
            region: teamInfo.region,
            authCode,
            isActive: true,
            profile: {
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
        console.log('회원가입시 JWT_SECRET:', process.env.JWT_SECRET);
        const token = this.jwtService.sign({
            id: newUser._id,
            username: newUser.username,
            team: newUser.teamName,
            role: newUser.role,
            playerId: newUser.profile?.playerKey || null,
        });
        console.log('발급된 토큰:', token);
        return {
            success: true,
            message: '회원가입 성공!',
            data: {
                token,
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
    async login(loginDto) {
        const { username, password } = loginDto;
        console.log('=== 로그인 시도 ===');
        console.log('받은 아이디:', username);
        const user = await this.userModel.findOne({ username: loginDto.username });
        if (!user) {
            console.log('❌ 아이디 불일치');
            throw new common_1.BadRequestException('존재하지 않는 아이디입니다.');
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('❌ 비밀번호 불일치');
            throw new common_1.UnauthorizedException('비밀번호가 틀렸습니다.');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('비활성화된 계정입니다.');
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
    async checkUsername(username) {
        console.log('=== 아이디 중복 확인 ===');
        console.log('받은 아이디:', username);
        const existingUser = await this.userModel.findOne({ username });
        if (existingUser) {
            console.log('❌ 중복된 아이디');
            throw new common_1.ConflictException('중복된 아이디입니다.');
        }
        console.log('✅ 사용 가능한 아이디');
        return {
            success: true,
            message: '사용 가능한 아이디입니다.',
            data: { available: true },
        };
    }
    async verifyTeamCode(authCode) {
        console.log('=== 인증코드 검증 ===');
        console.log('받은 인증코드:', authCode);
        const teamInfo = team_codes_1.TEAM_CODES[authCode];
        if (!teamInfo) {
            console.log('❌ 유효하지 않은 인증코드');
            throw new common_1.BadRequestException('유효하지 않은 인증코드입니다.');
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
    async findUserByUsername(username) {
        return this.userModel.findOne({ username }).exec();
    }
    async findUserById(id) {
        return this.userModel.findById(id).exec();
    }
    async updateProfile(userId, profileData) {
        console.log('=== 프로필 업데이트 ===');
        console.log('userId:', userId);
        console.log('profileData:', profileData);
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, {
            $set: {
                'profile.avatar': profileData.avatar,
                'profile.bio': profileData.bio,
                'profile.playerID': profileData.playerID || null,
                'profile.email': profileData.email,
            },
        }, { new: true });
        if (!updatedUser) {
            throw new common_1.BadRequestException('사용자를 찾을 수 없습니다.');
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
    async verifyToken(verifyTokenDto) {
        console.log('=== 토큰 검증 ===');
        try {
            const decoded = this.jwtService.verify(verifyTokenDto.token);
            const user = await this.userModel.findById(decoded.id);
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('유효하지 않은 사용자입니다.');
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
        }
        catch (error) {
            console.log('❌ 토큰 검증 실패:', error.message);
            throw new common_1.UnauthorizedException('유효하지 않은 토큰입니다.');
        }
    }
    async refreshToken(refreshTokenDto) {
        console.log('=== 토큰 갱신 ===');
        try {
            const decoded = this.jwtService.verify(refreshTokenDto.token);
            const user = await this.userModel.findById(decoded.id);
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('유효하지 않은 사용자입니다.');
            }
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
        }
        catch (error) {
            console.log('❌ 토큰 갱신 실패:', error.message);
            throw new common_1.UnauthorizedException('토큰 갱신에 실패했습니다.');
        }
    }
    async logout() {
        console.log('=== 로그아웃 ===');
        console.log('✅ 로그아웃 처리 완료');
        return {
            success: true,
            message: '로그아웃되었습니다.',
        };
    }
    async checkUserExists(username) {
        console.log('=== 아이디 존재 확인 ===');
        console.log('받은 아이디:', username);
        const user = await this.userModel.findOne({ username });
        if (!user) {
            throw new common_1.BadRequestException('존재하지 않는 아이디입니다.');
        }
        if (!user.profile?.contactInfo?.email) {
            throw new common_1.BadRequestException('해당 계정에 등록된 이메일이 없습니다.');
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
    async findUserByEmail(email) {
        console.log('=== 이메일로 아이디 찾기 ===');
        console.log('받은 이메일:', email);
        const user = await this.userModel.findOne({
            'profile.contactInfo.email': email,
        });
        if (!user) {
            throw new common_1.BadRequestException('해당 이메일로 등록된 계정을 찾을 수 없습니다.');
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
    async sendResetCode(email) {
        console.log('=== 패스워드 리셋 코드 전송 ===');
        console.log('받은 이메일:', email);
        const user = await this.userModel.findOne({
            'profile.contactInfo.email': email,
        });
        if (!user) {
            throw new common_1.BadRequestException('해당 이메일로 등록된 계정을 찾을 수 없습니다.');
        }
        if (user.passwordResetAttempts >= 5) {
            throw new common_1.BadRequestException('재시도 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.');
        }
        const resetCode = this.emailService.generateResetCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.userModel.findByIdAndUpdate(user._id, {
            passwordResetCode: resetCode,
            passwordResetExpires: expiresAt,
            $inc: { passwordResetAttempts: 1 },
        });
        const emailSent = await this.emailService.sendPasswordResetEmail(email, resetCode, user.username);
        if (!emailSent) {
            throw new common_1.BadRequestException('이메일 발송에 실패했습니다.');
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
    async resetPassword(email, resetCode, newPassword) {
        console.log('=== 패스워드 리셋 ===');
        console.log('받은 이메일:', email);
        const user = await this.userModel.findOne({
            'profile.contactInfo.email': email,
        });
        if (!user) {
            throw new common_1.BadRequestException('해당 이메일로 등록된 계정을 찾을 수 없습니다.');
        }
        if (!user.passwordResetCode || user.passwordResetCode !== resetCode) {
            throw new common_1.BadRequestException('잘못된 인증코드입니다.');
        }
        if (!user.passwordResetExpires || new Date() > user.passwordResetExpires) {
            throw new common_1.BadRequestException('인증코드가 만료되었습니다.');
        }
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
    async verifyPassword(userId, password) {
        console.log('=== 패스워드 검증 (마이페이지) ===');
        console.log('userId:', userId);
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.BadRequestException('사용자를 찾을 수 없습니다.');
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('비밀번호가 틀렸습니다.');
        }
        console.log('✅ 패스워드 검증 성공');
        return {
            success: true,
            message: '비밀번호가 확인되었습니다.',
        };
    }
    async createProfile(userId, profileData) {
        console.log('=== 프로필 생성 ===');
        console.log('userId:', userId);
        console.log('profileData:', profileData);
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.BadRequestException('사용자를 찾을 수 없습니다.');
        }
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, {
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
        }, { new: true });
        console.log('업데이트된 사용자:', updatedUser);
        if (!updatedUser) {
            throw new common_1.BadRequestException('프로필 생성에 실패했습니다.');
        }
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
    async uploadAvatar(userId, file) {
        if (!file) {
            throw new common_1.BadRequestException('이미지 파일이 없습니다.');
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new common_1.BadRequestException('파일 크기는 5MB를 초과할 수 없습니다.');
        }
        if (!file.mimetype.startsWith('image/')) {
            throw new common_1.BadRequestException('이미지 파일만 업로드 가능합니다.');
        }
        const fileName = `avatars/${userId}_${Date.now()}_${file.originalname}`;
        const avatarUrl = `https://temp-url.com/${fileName}`;
        return {
            success: true,
            message: '프로필 이미지 업로드 성공',
            data: {
                avatarUrl,
            },
        };
    }
    async checkProfileExists(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.BadRequestException('사용자를 찾을 수 없습니다.');
        }
        const hasCompleteProfile = !!(user.profile?.realName &&
            user.profile?.physicalInfo?.height &&
            user.profile?.contactInfo?.email);
        return {
            success: true,
            data: {
                hasProfile: hasCompleteProfile,
                profile: user.profile,
            },
        };
    }
    async addMemo(userId, gameKey, clipKey) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.BadRequestException('사용자를 찾을 수 없습니다.');
        }
        const alreadyExists = user.memos.some((memo) => memo.gameKey === gameKey && memo.clipKey === clipKey);
        if (alreadyExists) {
            throw new common_1.BadRequestException('이미 메모에 추가된 클립입니다.');
        }
        user.memos.push({ gameKey, clipKey });
        await user.save();
        return {
            success: true,
            message: '메모가 성공적으로 추가되었습니다.',
            memos: user.memos,
        };
    }
    async removeMemo(userId, gameKey, clipKey) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.BadRequestException('사용자를 찾을 수 없습니다.');
        }
        const initialLength = user.memos.length;
        user.memos = user.memos.filter((memo) => !(memo.gameKey === gameKey && memo.clipKey === clipKey));
        if (user.memos.length === initialLength) {
            throw new common_1.BadRequestException('해당 메모를 찾을 수 없습니다.');
        }
        await user.save();
        return {
            success: true,
            message: '메모가 성공적으로 삭제되었습니다.',
            memos: user.memos,
        };
    }
    async getHighlights(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.BadRequestException('사용자를 찾을 수 없습니다.');
        }
        return {
            success: true,
            highlights: user.highlights || [],
        };
    }
    async getMemos(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.BadRequestException('사용자를 찾을 수 없습니다.');
        }
        return {
            success: true,
            memos: user.memos || [],
        };
    }
    async addHighlight(userId, gameKey, clipKey) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            return;
        }
        const alreadyExists = user.highlights.some((highlight) => highlight.gameKey === gameKey && highlight.clipKey === clipKey);
        if (!alreadyExists) {
            user.highlights.push({ gameKey, clipKey });
            await user.save();
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map