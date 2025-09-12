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
exports.TeamService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const uuid_1 = require("uuid");
const team_schema_1 = require("../schemas/team.schema");
const player_schema_1 = require("../schemas/player.schema");
let TeamService = class TeamService {
    teamModel;
    playerModel;
    constructor(teamModel, playerModel) {
        this.teamModel = teamModel;
        this.playerModel = playerModel;
    }
    async createTeam(createTeamDto, ownerId) {
        const { teamName, logoUrl } = createTeamDto;
        const teamId = `team_${(0, uuid_1.v4)().substring(0, 8)}`;
        const newTeam = new this.teamModel({
            teamId,
            teamName,
            logoUrl,
            ownerId,
        });
        await newTeam.save();
        return {
            success: true,
            message: '팀이 성공적으로 생성되었습니다.',
            data: newTeam,
        };
    }
    async getTeam(teamId) {
        const team = await this.teamModel
            .findOne({ teamId })
            .populate('ownerId', 'name email');
        if (!team) {
            throw new common_1.NotFoundException('팀을 찾을 수 없습니다.');
        }
        const players = await this.playerModel.find({ teamId: team._id });
        return {
            success: true,
            data: {
                ...team.toObject(),
                players,
            },
        };
    }
    async getMyTeams(ownerId) {
        const teams = await this.teamModel
            .find({ ownerId })
            .sort({ createdAt: -1 });
        return {
            success: true,
            data: teams,
        };
    }
    async updateTeam(teamId, updateTeamDto, ownerId) {
        const { teamName, logoUrl } = updateTeamDto;
        const team = await this.teamModel.findOne({ teamId });
        if (!team) {
            throw new common_1.NotFoundException('팀을 찾을 수 없습니다.');
        }
        if (team.ownerId.toString() !== ownerId) {
            throw new common_1.ForbiddenException('팀을 수정할 권한이 없습니다.');
        }
        const updatedTeam = await this.teamModel.findOneAndUpdate({ teamId }, { teamName, logoUrl }, { new: true });
        return {
            success: true,
            message: '팀 정보가 성공적으로 수정되었습니다.',
            data: updatedTeam,
        };
    }
    async deleteTeam(teamId, ownerId) {
        const team = await this.teamModel.findOne({ teamId });
        if (!team) {
            throw new common_1.NotFoundException('팀을 찾을 수 없습니다.');
        }
        if (team.ownerId.toString() !== ownerId) {
            throw new common_1.ForbiddenException('팀을 삭제할 권한이 없습니다.');
        }
        await this.playerModel.deleteMany({ teamId: team._id });
        await this.teamModel.findOneAndDelete({ teamId });
        return {
            success: true,
            message: '팀이 성공적으로 삭제되었습니다.',
        };
    }
};
exports.TeamService = TeamService;
exports.TeamService = TeamService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(team_schema_1.Team.name)),
    __param(1, (0, mongoose_1.InjectModel)(player_schema_1.Player.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], TeamService);
//# sourceMappingURL=team.service.js.map