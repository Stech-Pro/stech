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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../schemas/user.schema");
let AdminService = class AdminService {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
    }
    async getUnassignedUsers(teamName, role) {
        const filter = {
            $or: [{ playerId: null }, { playerId: { $exists: false } }],
        };
        if (teamName) {
            filter.teamName = teamName;
        }
        if (role) {
            filter.role = role;
        }
        const users = await this.userModel
            .find(filter)
            .select('username teamName role authCode createdAt profile')
            .sort({ createdAt: -1 })
            .lean();
        console.log(`📋 playerId 미배정 유저 ${users.length}명 조회 완료`);
        console.log(`🔍 필터: 팀=${teamName || '전체'}, 역할=${role || '전체'}`);
        return users;
    }
    async assignPlayerId(userId, playerId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('해당 사용자를 찾을 수 없습니다.');
        }
        if (user.profile?.playerKey) {
            throw new common_1.BadRequestException(`해당 사용자는 이미 playerId "${user.profile?.playerKey}"가 배정되어 있습니다.`);
        }
        const existingUser = await this.userModel.findOne({
            'profile.playerKey': playerId,
        });
        if (existingUser) {
            throw new common_1.BadRequestException(`playerId "${playerId}"는 이미 다른 사용자(${existingUser.username})에게 배정되었습니다.`);
        }
        const playerIdPattern = /^\d{4}_[A-Z]{2,3}_\d+$/;
        if (!playerIdPattern.test(playerId)) {
            throw new common_1.BadRequestException('playerId 형식이 올바르지 않습니다. (예: 2025_KK_10)');
        }
        if (!user.profile) {
            user.profile = {};
        }
        user.profile.playerKey = playerId;
        await user.save();
        console.log(`✅ PlayerId 배정 완료: ${user.username} → ${playerId}`);
        return {
            userId: user._id,
            username: user.username,
            playerId: user.profile?.playerKey,
            teamName: user.teamName,
            role: user.role,
            assignedAt: new Date(),
        };
    }
    async getAssignedUsers(teamName, role) {
        const filter = {
            playerId: { $ne: null, $exists: true },
        };
        if (teamName) {
            filter.teamName = teamName;
        }
        if (role) {
            filter.role = role;
        }
        const users = await this.userModel
            .find(filter)
            .select('username teamName role playerId createdAt updatedAt profile')
            .sort({ updatedAt: -1 })
            .lean();
        console.log(`📋 playerId 배정된 유저 ${users.length}명 조회 완료`);
        console.log(`🔍 필터: 팀=${teamName || '전체'}, 역할=${role || '전체'}`);
        return users;
    }
    async getUserByPlayerId(playerId) {
        const user = await this.userModel
            .findOne({ playerId })
            .select('-password')
            .lean();
        if (!user) {
            throw new common_1.NotFoundException(`playerId "${playerId}"에 해당하는 사용자를 찾을 수 없습니다.`);
        }
        return user;
    }
    async unassignPlayerId(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('해당 사용자를 찾을 수 없습니다.');
        }
        const oldPlayerId = user.profile?.playerKey;
        if (user.profile) {
            user.profile.playerKey = null;
        }
        await user.save();
        console.log(`🔄 PlayerId 배정 해제: ${user.username} (${oldPlayerId} → null)`);
        return {
            userId: user._id,
            username: user.username,
            oldPlayerId,
            unassignedAt: new Date(),
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AdminService);
//# sourceMappingURL=admin.service.js.map