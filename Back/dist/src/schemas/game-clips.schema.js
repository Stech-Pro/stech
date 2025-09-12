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
exports.GameClipsSchema = exports.GameClips = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let GameClips = class GameClips {
    gameKey;
    date;
    type;
    score;
    region;
    location;
    homeTeam;
    awayTeam;
    Clips;
};
exports.GameClips = GameClips;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GameClips.prototype, "gameKey", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GameClips.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GameClips.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], GameClips.prototype, "score", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GameClips.prototype, "region", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GameClips.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GameClips.prototype, "homeTeam", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GameClips.prototype, "awayTeam", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array, required: true }),
    __metadata("design:type", Array)
], GameClips.prototype, "Clips", void 0);
exports.GameClips = GameClips = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], GameClips);
exports.GameClipsSchema = mongoose_1.SchemaFactory.createForClass(GameClips);
//# sourceMappingURL=game-clips.schema.js.map