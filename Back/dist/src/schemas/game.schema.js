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
exports.GameSchema = exports.Game = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Game = class Game {
    gameId;
    date;
    opponent;
    type;
    teamId;
};
exports.Game = Game;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Game.prototype, "gameId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Game.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Game.prototype, "opponent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['League', 'Practice'] }),
    __metadata("design:type", String)
], Game.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Team', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Game.prototype, "teamId", void 0);
exports.Game = Game = __decorate([
    (0, mongoose_1.Schema)({ collection: 'games', timestamps: true })
], Game);
exports.GameSchema = mongoose_1.SchemaFactory.createForClass(Game);
exports.GameSchema.index({ gameId: 1 });
exports.GameSchema.index({ teamId: 1 });
exports.GameSchema.index({ teamId: 1, date: -1 });
exports.GameSchema.virtual('team', {
    ref: 'Team',
    localField: 'teamId',
    foreignField: '_id',
    justOne: true,
});
exports.GameSchema.virtual('videos', {
    ref: 'Video',
    localField: '_id',
    foreignField: 'gameId',
});
//# sourceMappingURL=game.schema.js.map