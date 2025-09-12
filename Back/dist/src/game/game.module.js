"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const platform_express_1 = require("@nestjs/platform-express");
const game_controller_1 = require("./game.controller");
const game_docs_controller_1 = require("./game-docs.controller");
const game_service_1 = require("./game.service");
const player_module_1 = require("../player/player.module");
const team_module_1 = require("../team/team.module");
const game_info_schema_1 = require("../schemas/game-info.schema");
const game_clips_schema_1 = require("../schemas/game-clips.schema");
const team_game_stats_schema_1 = require("../schemas/team-game-stats.schema");
const team_total_stats_schema_1 = require("../schemas/team-total-stats.schema");
const s3_service_1 = require("../common/services/s3.service");
const config_1 = require("@nestjs/config");
let GameModule = class GameModule {
};
exports.GameModule = GameModule;
exports.GameModule = GameModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            mongoose_1.MongooseModule.forFeature([
                { name: game_info_schema_1.GameInfo.name, schema: game_info_schema_1.GameInfoSchema },
                { name: game_clips_schema_1.GameClips.name, schema: game_clips_schema_1.GameClipsSchema },
                { name: team_game_stats_schema_1.TeamGameStats.name, schema: team_game_stats_schema_1.TeamGameStatsSchema },
                { name: team_total_stats_schema_1.TeamTotalStats.name, schema: team_total_stats_schema_1.TeamTotalStatsSchema },
            ]),
            platform_express_1.MulterModule.register({
                limits: {
                    fileSize: 10 * 1024 * 1024,
                    files: 1,
                },
                fileFilter: (req, file, cb) => {
                    if (file.mimetype === 'application/json' ||
                        file.originalname.toLowerCase().endsWith('.json')) {
                        cb(null, true);
                    }
                    else {
                        cb(new Error('JSON 파일만 업로드 가능합니다'), false);
                    }
                },
            }),
            (0, common_1.forwardRef)(() => player_module_1.PlayerModule),
            (0, common_1.forwardRef)(() => team_module_1.TeamModule),
        ],
        controllers: [game_controller_1.GameController, game_docs_controller_1.GameDocsController],
        providers: [game_service_1.GameService, s3_service_1.S3Service],
        exports: [game_service_1.GameService],
    })
], GameModule);
//# sourceMappingURL=game.module.js.map