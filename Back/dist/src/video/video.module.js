"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const video_controller_1 = require("./video.controller");
const video_service_1 = require("./video.service");
const video_schema_1 = require("../schemas/video.schema");
const game_schema_1 = require("../schemas/game.schema");
const team_schema_1 = require("../schemas/team.schema");
const player_schema_1 = require("../schemas/player.schema");
const s3_upload_service_1 = require("../utils/s3-upload.service");
let VideoModule = class VideoModule {
};
exports.VideoModule = VideoModule;
exports.VideoModule = VideoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: video_schema_1.Video.name, schema: video_schema_1.VideoSchema },
                { name: game_schema_1.Game.name, schema: game_schema_1.GameSchema },
                { name: team_schema_1.Team.name, schema: team_schema_1.TeamSchema },
                { name: player_schema_1.Player.name, schema: player_schema_1.PlayerSchema },
            ]),
        ],
        controllers: [video_controller_1.VideoController],
        providers: [video_service_1.VideoService, s3_upload_service_1.S3UploadService],
        exports: [video_service_1.VideoService],
    })
], VideoModule);
//# sourceMappingURL=video.module.js.map