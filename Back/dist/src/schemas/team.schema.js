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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamSchema = exports.Team = exports.Championships = exports.TeamStaff = exports.TeamPlayer = exports.TeamStatsDetail = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let TeamStatsDetail = class TeamStatsDetail {
    averagePointsPerGame;
    totalPoints;
    totalTouchdowns;
    totalOffenseYards;
    averageOffenseYardsPerGame;
    rushingAttempts;
    rushingYards;
    yardsPerCarry;
    averageRushingYardsPerGame;
    rushingTouchdowns;
    passingCompletions;
    passingAttempts;
    passingYards;
    yardsPerPass;
    averagePassingYardsPerGame;
    passingTouchdowns;
    interceptions;
    totalPuntYards;
    averagePuntYards;
    touchbackPercentage;
    fieldGoalsMade;
    fieldGoalsAttempted;
    averageKickReturnYards;
    averagePuntReturnYards;
    totalReturnYards;
    fumbles;
    fumblesLost;
    averageTurnoversPerGame;
    turnoverRatio;
    totalPenalties;
    totalPenaltyYards;
    averagePenaltyYardsPerGame;
    gamesPlayed;
};
exports.TeamStatsDetail = TeamStatsDetail;
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "averagePointsPerGame", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "totalPoints", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "totalTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "totalOffenseYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "averageOffenseYardsPerGame", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "rushingAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "rushingYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "yardsPerCarry", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "averageRushingYardsPerGame", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "rushingTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "passingCompletions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "passingAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "passingYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "yardsPerPass", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "averagePassingYardsPerGame", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "passingTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "interceptions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "totalPuntYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "averagePuntYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "touchbackPercentage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "fieldGoalsMade", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "fieldGoalsAttempted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "averageKickReturnYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "averagePuntReturnYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "totalReturnYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "fumbles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "fumblesLost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "averageTurnoversPerGame", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "turnoverRatio", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "totalPenalties", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "totalPenaltyYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "averagePenaltyYardsPerGame", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamStatsDetail.prototype, "gamesPlayed", void 0);
exports.TeamStatsDetail = TeamStatsDetail = __decorate([
    (0, mongoose_1.Schema)()
], TeamStatsDetail);
let TeamPlayer = class TeamPlayer {
    playerId;
    name;
    jerseyNumber;
    positions;
    status;
};
exports.TeamPlayer = TeamPlayer;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TeamPlayer.prototype, "playerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TeamPlayer.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], TeamPlayer.prototype, "jerseyNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: [String] }),
    __metadata("design:type", Array)
], TeamPlayer.prototype, "positions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['Active', 'Military', 'Graduate'], default: 'Active' }),
    __metadata("design:type", String)
], TeamPlayer.prototype, "status", void 0);
exports.TeamPlayer = TeamPlayer = __decorate([
    (0, mongoose_1.Schema)()
], TeamPlayer);
let TeamStaff = class TeamStaff {
    coaches;
    directors;
    managers;
    graduates;
};
exports.TeamStaff = TeamStaff;
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], TeamStaff.prototype, "coaches", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], TeamStaff.prototype, "directors", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], TeamStaff.prototype, "managers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], TeamStaff.prototype, "graduates", void 0);
exports.TeamStaff = TeamStaff = __decorate([
    (0, mongoose_1.Schema)()
], TeamStaff);
let Championships = class Championships {
    regional;
    tigerBowl;
    challengeBowl;
};
exports.Championships = Championships;
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Championships.prototype, "regional", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Championships.prototype, "tigerBowl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Championships.prototype, "challengeBowl", void 0);
exports.Championships = Championships = __decorate([
    (0, mongoose_1.Schema)()
], Championships);
let Team = class Team {
    teamKey;
    teamId;
    teamName;
    teamAbbr;
    logoUrl;
    teamColor;
    players;
    staff;
    region;
    championships;
    stats;
    league;
    ownerId;
};
exports.Team = Team;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Team.prototype, "teamKey", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Team.prototype, "teamId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Team.prototype, "teamName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Team.prototype, "teamAbbr", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Team.prototype, "logoUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Team.prototype, "teamColor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [TeamPlayer], default: [] }),
    __metadata("design:type", Array)
], Team.prototype, "players", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: TeamStaff, default: () => ({}) }),
    __metadata("design:type", TeamStaff)
], Team.prototype, "staff", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Team.prototype, "region", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Championships, default: () => ({}) }),
    __metadata("design:type", Championships)
], Team.prototype, "championships", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: TeamStatsDetail, default: () => ({}) }),
    __metadata("design:type", TeamStatsDetail)
], Team.prototype, "stats", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['1부', '2부'], default: '1부' }),
    __metadata("design:type", String)
], Team.prototype, "league", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Team.prototype, "ownerId", void 0);
exports.Team = Team = __decorate([
    (0, mongoose_1.Schema)({ collection: 'teams', timestamps: true })
], Team);
exports.TeamSchema = mongoose_1.SchemaFactory.createForClass(Team);
exports.TeamSchema.index({ teamId: 1 });
exports.TeamSchema.index({ ownerId: 1 });
exports.TeamSchema.virtual('playerDetails', {
    ref: 'Player',
    localField: '_id',
    foreignField: 'teamId',
});
//# sourceMappingURL=team.schema.js.map