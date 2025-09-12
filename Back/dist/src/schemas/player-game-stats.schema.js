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
exports.PlayerGameStatsSchema = exports.PlayerGameStats = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let PlayerGameStats = class PlayerGameStats {
    playerId;
    gameKey;
    date;
    season;
    teamName;
    jerseyNumber;
    position;
    opponent;
    stats;
    isHomeGame;
    gameResult;
};
exports.PlayerGameStats = PlayerGameStats;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlayerGameStats.prototype, "playerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlayerGameStats.prototype, "gameKey", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlayerGameStats.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlayerGameStats.prototype, "season", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlayerGameStats.prototype, "teamName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], PlayerGameStats.prototype, "jerseyNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlayerGameStats.prototype, "position", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PlayerGameStats.prototype, "opponent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], PlayerGameStats.prototype, "stats", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], PlayerGameStats.prototype, "isHomeGame", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PlayerGameStats.prototype, "gameResult", void 0);
exports.PlayerGameStats = PlayerGameStats = __decorate([
    (0, mongoose_1.Schema)({
        collection: 'players_game_stats',
        timestamps: true,
    })
], PlayerGameStats);
exports.PlayerGameStatsSchema = mongoose_1.SchemaFactory.createForClass(PlayerGameStats);
exports.PlayerGameStatsSchema.index({ playerId: 1 });
exports.PlayerGameStatsSchema.index({ gameKey: 1 });
exports.PlayerGameStatsSchema.index({ season: 1 });
exports.PlayerGameStatsSchema.index({ playerId: 1, gameKey: 1 }, { unique: true });
//# sourceMappingURL=player-game-stats.schema.js.map