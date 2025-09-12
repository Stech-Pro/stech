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
exports.PlayerSeasonStatsSchema = exports.PlayerSeasonStats = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let PlayerSeasonStats = class PlayerSeasonStats {
    playerId;
    season;
    teamName;
    jerseyNumber;
    position;
    stats;
    gamesPlayed;
    gameKeys;
};
exports.PlayerSeasonStats = PlayerSeasonStats;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlayerSeasonStats.prototype, "playerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlayerSeasonStats.prototype, "season", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlayerSeasonStats.prototype, "teamName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], PlayerSeasonStats.prototype, "jerseyNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlayerSeasonStats.prototype, "position", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], PlayerSeasonStats.prototype, "stats", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerSeasonStats.prototype, "gamesPlayed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], PlayerSeasonStats.prototype, "gameKeys", void 0);
exports.PlayerSeasonStats = PlayerSeasonStats = __decorate([
    (0, mongoose_1.Schema)({
        collection: 'players_season_stats',
        timestamps: true,
    })
], PlayerSeasonStats);
exports.PlayerSeasonStatsSchema = mongoose_1.SchemaFactory.createForClass(PlayerSeasonStats);
exports.PlayerSeasonStatsSchema.index({ playerId: 1 });
exports.PlayerSeasonStatsSchema.index({ season: 1 });
exports.PlayerSeasonStatsSchema.index({ playerId: 1, season: 1 }, { unique: true });
//# sourceMappingURL=player-season-stats.schema.js.map