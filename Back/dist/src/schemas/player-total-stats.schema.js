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
exports.PlayerTotalStatsSchema = exports.PlayerTotalStats = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let PlayerTotalStats = class PlayerTotalStats {
    playerId;
    teamName;
    jerseyNumber;
    position;
    stats;
    totalGamesPlayed;
    seasons;
    firstGameDate;
    lastGameDate;
    seasonsPlayed;
    totalSeasons;
};
exports.PlayerTotalStats = PlayerTotalStats;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], PlayerTotalStats.prototype, "playerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlayerTotalStats.prototype, "teamName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], PlayerTotalStats.prototype, "jerseyNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlayerTotalStats.prototype, "position", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], PlayerTotalStats.prototype, "stats", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerTotalStats.prototype, "totalGamesPlayed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], PlayerTotalStats.prototype, "seasons", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PlayerTotalStats.prototype, "firstGameDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PlayerTotalStats.prototype, "lastGameDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], PlayerTotalStats.prototype, "seasonsPlayed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerTotalStats.prototype, "totalSeasons", void 0);
exports.PlayerTotalStats = PlayerTotalStats = __decorate([
    (0, mongoose_1.Schema)({
        collection: 'players_total_stats',
        timestamps: true,
    })
], PlayerTotalStats);
exports.PlayerTotalStatsSchema = mongoose_1.SchemaFactory.createForClass(PlayerTotalStats);
exports.PlayerTotalStatsSchema.index({ playerId: 1 });
exports.PlayerTotalStatsSchema.index({ teamName: 1 });
exports.PlayerTotalStatsSchema.index({ jerseyNumber: 1 });
//# sourceMappingURL=player-total-stats.schema.js.map