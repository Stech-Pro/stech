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
exports.VideoSchema = exports.Video = exports.SignificantPlay = exports.PlayerInfo = exports.EndYard = exports.StartYard = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let StartYard = class StartYard {
    side;
    yard;
};
exports.StartYard = StartYard;
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['own', 'opp'] }),
    __metadata("design:type", String)
], StartYard.prototype, "side", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: -100, max: 100 }),
    __metadata("design:type", Number)
], StartYard.prototype, "yard", void 0);
exports.StartYard = StartYard = __decorate([
    (0, mongoose_1.Schema)()
], StartYard);
let EndYard = class EndYard {
    side;
    yard;
};
exports.EndYard = EndYard;
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['own', 'opp'] }),
    __metadata("design:type", String)
], EndYard.prototype, "side", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: -100, max: 100 }),
    __metadata("design:type", Number)
], EndYard.prototype, "yard", void 0);
exports.EndYard = EndYard = __decorate([
    (0, mongoose_1.Schema)()
], EndYard);
let PlayerInfo = class PlayerInfo {
    playerId;
    name;
    number;
    position;
    role;
};
exports.PlayerInfo = PlayerInfo;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlayerInfo.prototype, "playerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlayerInfo.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], PlayerInfo.prototype, "number", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlayerInfo.prototype, "position", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PlayerInfo.prototype, "role", void 0);
exports.PlayerInfo = PlayerInfo = __decorate([
    (0, mongoose_1.Schema)()
], PlayerInfo);
let SignificantPlay = class SignificantPlay {
    label;
    timestamp;
};
exports.SignificantPlay = SignificantPlay;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SignificantPlay.prototype, "label", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], SignificantPlay.prototype, "timestamp", void 0);
exports.SignificantPlay = SignificantPlay = __decorate([
    (0, mongoose_1.Schema)()
], SignificantPlay);
let Video = class Video {
    videoId;
    url;
    fileName;
    fileSize;
    quarter;
    playType;
    success;
    startYard;
    endYard;
    gainedYard;
    players;
    significantPlays;
    gameId;
};
exports.Video = Video;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Video.prototype, "videoId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Video.prototype, "url", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Video.prototype, "fileName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Video.prototype, "fileSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['1Q', '2Q', '3Q', '4Q'] }),
    __metadata("design:type", String)
], Video.prototype, "quarter", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['Run', 'Pass', 'Kick'] }),
    __metadata("design:type", String)
], Video.prototype, "playType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Boolean)
], Video.prototype, "success", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: StartYard, required: true }),
    __metadata("design:type", StartYard)
], Video.prototype, "startYard", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: EndYard, required: true }),
    __metadata("design:type", EndYard)
], Video.prototype, "endYard", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Video.prototype, "gainedYard", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [PlayerInfo], default: [] }),
    __metadata("design:type", Array)
], Video.prototype, "players", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [SignificantPlay], default: [] }),
    __metadata("design:type", Array)
], Video.prototype, "significantPlays", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Game', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Video.prototype, "gameId", void 0);
exports.Video = Video = __decorate([
    (0, mongoose_1.Schema)({ collection: 'videos', timestamps: true })
], Video);
exports.VideoSchema = mongoose_1.SchemaFactory.createForClass(Video);
exports.VideoSchema.index({ videoId: 1 });
exports.VideoSchema.index({ gameId: 1 });
exports.VideoSchema.index({ playType: 1 });
exports.VideoSchema.index({ success: 1 });
exports.VideoSchema.index({ 'players.playerId': 1 });
exports.VideoSchema.virtual('game', {
    ref: 'Game',
    localField: 'gameId',
    foreignField: '_id',
    justOne: true,
});
//# sourceMappingURL=video.schema.js.map