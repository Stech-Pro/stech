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
exports.TeamGameStatsSchema = exports.TeamGameStats = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let TeamGameStats = class TeamGameStats {
    teamName;
    gameKey;
    date;
    season;
    league;
    opponent;
    isHomeGame;
    gameResult;
    stats;
    finalScore;
};
exports.TeamGameStats = TeamGameStats;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TeamGameStats.prototype, "teamName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TeamGameStats.prototype, "gameKey", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TeamGameStats.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TeamGameStats.prototype, "season", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['1부', '2부'], default: '1부' }),
    __metadata("design:type", String)
], TeamGameStats.prototype, "league", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TeamGameStats.prototype, "opponent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Boolean)
], TeamGameStats.prototype, "isHomeGame", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], TeamGameStats.prototype, "gameResult", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], TeamGameStats.prototype, "stats", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            own: Number,
            opponent: Number,
        },
        default: { own: 0, opponent: 0 },
    }),
    __metadata("design:type", Object)
], TeamGameStats.prototype, "finalScore", void 0);
exports.TeamGameStats = TeamGameStats = __decorate([
    (0, mongoose_1.Schema)({
        collection: 'team_game_stats',
        timestamps: true,
    })
], TeamGameStats);
exports.TeamGameStatsSchema = mongoose_1.SchemaFactory.createForClass(TeamGameStats);
exports.TeamGameStatsSchema.index({ teamName: 1 });
exports.TeamGameStatsSchema.index({ gameKey: 1 });
exports.TeamGameStatsSchema.index({ season: 1 });
exports.TeamGameStatsSchema.index({ teamName: 1, gameKey: 1 }, { unique: true });
//# sourceMappingURL=team-game-stats.schema.js.map