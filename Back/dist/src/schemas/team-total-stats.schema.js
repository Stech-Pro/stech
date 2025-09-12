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
exports.TeamTotalStatsSchema = exports.TeamTotalStats = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let TeamTotalStats = class TeamTotalStats {
    teamName;
    league;
    totalPoints;
    totalTouchdowns;
    totalYards;
    rushingAttempts;
    rushingYards;
    rushingTouchdowns;
    passAttempts;
    passCompletions;
    passingYards;
    passingTouchdowns;
    interceptions;
    totalPuntYards;
    totalPunts;
    puntTouchbacks;
    fieldGoalAttempts;
    fieldGoalMakes;
    kickReturnYards;
    kickReturns;
    puntReturnYards;
    puntReturns;
    fumbles;
    fumblesLost;
    totalTurnovers;
    opponentTurnovers;
    penalties;
    penaltyYards;
    season;
    processedGames;
    gamesPlayed;
    wins;
    losses;
    ties;
    updatedAt;
    createdAt;
};
exports.TeamTotalStats = TeamTotalStats;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], TeamTotalStats.prototype, "teamName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['1부', '2부'], default: '1부' }),
    __metadata("design:type", String)
], TeamTotalStats.prototype, "league", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "totalPoints", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "totalTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "totalYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "rushingAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "rushingYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "rushingTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "passAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "passCompletions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "passingYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "passingTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "interceptions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "totalPuntYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "totalPunts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "puntTouchbacks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "fieldGoalAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "fieldGoalMakes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "kickReturnYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "kickReturns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "puntReturnYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "puntReturns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "fumbles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "fumblesLost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "totalTurnovers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "opponentTurnovers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "penalties", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "penaltyYards", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], TeamTotalStats.prototype, "season", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], TeamTotalStats.prototype, "processedGames", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "gamesPlayed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "wins", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "losses", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TeamTotalStats.prototype, "ties", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], TeamTotalStats.prototype, "updatedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], TeamTotalStats.prototype, "createdAt", void 0);
exports.TeamTotalStats = TeamTotalStats = __decorate([
    (0, mongoose_1.Schema)({
        collection: 'team_total_stats',
        timestamps: true,
    })
], TeamTotalStats);
exports.TeamTotalStatsSchema = mongoose_1.SchemaFactory.createForClass(TeamTotalStats);
exports.TeamTotalStatsSchema.index({ teamName: 1 });
//# sourceMappingURL=team-total-stats.schema.js.map