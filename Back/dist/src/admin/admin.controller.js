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
exports.AdminController = exports.UnassignedUserDto = exports.AssignPlayerDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const class_validator_1 = require("class-validator");
class AssignPlayerDto {
    playerId;
}
exports.AssignPlayerDto = AssignPlayerDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'PlayerId (형식: 시즌_학교코드_등번호)',
        example: '2025_KK_10',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{4}_[A-Z]{2,3}_\d+$/, {
        message: 'playerId는 "년도_학교코드_번호" 형식이어야 합니다 (예: 2025_KK_10)',
    }),
    __metadata("design:type", String)
], AssignPlayerDto.prototype, "playerId", void 0);
class UnassignedUserDto {
    _id;
    username;
    teamName;
    role;
    authCode;
    createdAt;
    profile;
}
exports.UnassignedUserDto = UnassignedUserDto;
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getUnassignedUsers(teamName, role) {
        try {
            const result = await this.adminService.getUnassignedUsers(teamName, role);
            return {
                success: true,
                message: `playerId 미배정 유저 ${result.length}명을 조회했습니다.`,
                data: result,
                count: result.length,
                filters: {
                    teamName: teamName || null,
                    role: role || null,
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: '미배정 유저 조회 중 오류가 발생했습니다.',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async assignPlayerId(userId, assignPlayerDto) {
        try {
            const result = await this.adminService.assignPlayerId(userId, assignPlayerDto.playerId);
            return {
                success: true,
                message: `${result.username} 사용자에게 playerId "${result.playerId}"가 성공적으로 배정되었습니다.`,
                data: result,
            };
        }
        catch (error) {
            if (error.message.includes('이미 배정')) {
                throw new common_1.HttpException({
                    success: false,
                    message: error.message,
                    code: 'PLAYER_ID_ALREADY_ASSIGNED',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (error.message.includes('찾을 수 없습니다')) {
                throw new common_1.HttpException({
                    success: false,
                    message: error.message,
                    code: 'USER_NOT_FOUND',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            throw new common_1.HttpException({
                success: false,
                message: 'PlayerId 배정 중 오류가 발생했습니다.',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAssignedUsers(teamName, role) {
        try {
            const result = await this.adminService.getAssignedUsers(teamName, role);
            return {
                success: true,
                message: `playerId 배정된 유저 ${result.length}명을 조회했습니다.`,
                data: result,
                count: result.length,
                filters: {
                    teamName: teamName || null,
                    role: role || null,
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: '배정된 유저 조회 중 오류가 발생했습니다.',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users/unassigned'),
    (0, swagger_1.ApiOperation)({
        summary: '🔍 PlayerId 미배정 유저 목록 조회',
        description: `
    ## 👑 관리자 전용 API

    playerId가 배정되지 않은 신규 가입자들을 조회합니다.
    
    ### 🎯 사용 목적
    - 신규 회원가입자 확인
    - 실제 명단과 대조 후 playerId 배정 준비
    - 팀별, 역할별 필터링 가능

    ### 📋 반환 정보
    - 사용자 기본 정보 (username, teamName, role)
    - 가입 시 사용한 인증코드
    - 프로필 정보 (이름, 학번, 이메일 등)
    - 가입 일시

    ### ⚠️ 주의사항
    - 관리자 권한 필요
    - playerId가 null인 사용자만 조회
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 미배정 유저 목록 조회 성공',
        schema: {
            example: {
                success: true,
                message: 'playerId 미배정 유저 3명을 조회했습니다.',
                data: [
                    {
                        _id: '507f1f77bcf86cd799439011',
                        username: 'kim_chulsu',
                        teamName: '건국대 레이징불스',
                        role: 'player',
                        authCode: '1802',
                        createdAt: '2025-01-15T09:30:00.000Z',
                        profile: {
                            playerID: '김철수',
                            email: 'kim@hanyang.ac.kr',
                            studentId: '2021001234',
                        },
                    },
                ],
                count: 3,
                filters: {
                    teamName: null,
                    role: null,
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('teamName')),
    __param(1, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUnassignedUsers", null);
__decorate([
    (0, common_1.Put)('users/:userId/assign-player'),
    (0, swagger_1.ApiOperation)({
        summary: '🎯 유저에게 PlayerId 배정',
        description: `
    ## 👑 관리자 전용 API

    특정 유저에게 playerId를 배정합니다.
    
    ### 🎯 사용 목적
    - 신규 회원의 신원 확인 후 playerId 배정
    - 해당 playerId로 스탯 데이터 연결
    - 선수의 마이페이지 활성화

    ### 📋 PlayerId 형식
    - 형식: \`시즌_학교코드_등번호\`
    - 예시: \`2025_KK_10\` (2025년 건국대 10번)

    ### 🏫 학교 코드
    - KK: 건국대, HY: 한양대, YS: 연세대
    - KU: 고려대, KH: 경희대, SN: 서울대 등

    ### ⚠️ 주의사항
    - 관리자 권한 필요
    - 중복 playerId 배정 불가
    - 배정 후 JWT 토큰 재발급 권장
    `,
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        description: '대상 유저의 MongoDB ObjectId',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiBody)({
        description: 'PlayerId 배정 정보',
        schema: {
            example: {
                playerId: '2025_KK_10',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ PlayerId 배정 성공',
        schema: {
            example: {
                success: true,
                message: 'kim_chulsu 사용자에게 playerId "2025_KK_10"가 성공적으로 배정되었습니다.',
                data: {
                    userId: '507f1f77bcf86cd799439011',
                    username: 'kim_chulsu',
                    playerId: '2025_KK_10',
                    teamName: '건국대 레이징불스',
                    role: 'player',
                    assignedAt: '2025-01-15T10:30:00.000Z',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '❌ 잘못된 요청 (이미 배정됨, 중복 playerId 등)',
        schema: {
            example: {
                success: false,
                message: 'playerId "2025_KK_10"는 이미 다른 사용자에게 배정되었습니다.',
                code: 'PLAYER_ID_ALREADY_ASSIGNED',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '❌ 사용자를 찾을 수 없음',
        schema: {
            example: {
                success: false,
                message: '해당 사용자를 찾을 수 없습니다.',
                code: 'USER_NOT_FOUND',
            },
        },
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AssignPlayerDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "assignPlayerId", null);
__decorate([
    (0, common_1.Get)('users/assigned'),
    (0, swagger_1.ApiOperation)({
        summary: '✅ PlayerId 배정된 유저 목록 조회',
        description: `
    ## 👑 관리자 전용 API

    playerId가 배정된 유저들을 조회합니다.
    
    ### 🎯 사용 목적
    - 배정 완료된 유저 확인
    - playerId와 사용자 매핑 현황 파악
    - 중복 배정 방지를 위한 확인
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ 배정된 유저 목록 조회 성공',
    }),
    __param(0, (0, common_1.Query)('teamName')),
    __param(1, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAssignedUsers", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('👑 Admin Management'),
    (0, common_1.Controller)('api/admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map