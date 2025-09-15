"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const player_controller_1 = require("./player.controller");
const player_service_1 = require("./player.service");
const clip_analyzer_service_1 = require("./clip-analyzer.service");
const qb_analyzer_controller_1 = require("./qb-analyzer.controller");
const qb_analyzer_service_1 = require("./analyzers/qb-analyzer.service");
const qb_analyzer_service_2 = require("./qb-analyzer.service");
const rb_analyzer_service_1 = require("./analyzers/rb-analyzer.service");
const wr_analyzer_service_1 = require("./analyzers/wr-analyzer.service");
const te_analyzer_service_1 = require("./analyzers/te-analyzer.service");
const k_analyzer_service_1 = require("./analyzers/k-analyzer.service");
const p_analyzer_service_1 = require("./analyzers/p-analyzer.service");
const ol_analyzer_service_1 = require("./analyzers/ol-analyzer.service");
const dl_analyzer_service_1 = require("./analyzers/dl-analyzer.service");
const lb_analyzer_service_1 = require("./analyzers/lb-analyzer.service");
const db_analyzer_service_1 = require("./analyzers/db-analyzer.service");
const stats_management_service_1 = require("../common/services/stats-management.service");
const game_service_1 = require("../game/game.service");
const team_module_1 = require("../team/team.module");
const auth_module_1 = require("../auth/auth.module");
const player_schema_1 = require("../schemas/player.schema");
const team_schema_1 = require("../schemas/team.schema");
const user_schema_1 = require("../schemas/user.schema");
const player_game_stats_schema_1 = require("../schemas/player-game-stats.schema");
const player_season_stats_schema_1 = require("../schemas/player-season-stats.schema");
const player_total_stats_schema_1 = require("../schemas/player-total-stats.schema");
const team_game_stats_schema_1 = require("../schemas/team-game-stats.schema");
const team_total_stats_schema_1 = require("../schemas/team-total-stats.schema");
const game_info_schema_1 = require("../schemas/game-info.schema");
const game_clips_schema_1 = require("../schemas/game-clips.schema");
let PlayerModule = class PlayerModule {
};
exports.PlayerModule = PlayerModule;
exports.PlayerModule = PlayerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: player_schema_1.Player.name, schema: player_schema_1.PlayerSchema },
                { name: team_schema_1.Team.name, schema: team_schema_1.TeamSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: player_game_stats_schema_1.PlayerGameStats.name, schema: player_game_stats_schema_1.PlayerGameStatsSchema },
                { name: player_season_stats_schema_1.PlayerSeasonStats.name, schema: player_season_stats_schema_1.PlayerSeasonStatsSchema },
                { name: player_total_stats_schema_1.PlayerTotalStats.name, schema: player_total_stats_schema_1.PlayerTotalStatsSchema },
                { name: team_game_stats_schema_1.TeamGameStats.name, schema: team_game_stats_schema_1.TeamGameStatsSchema },
                { name: team_total_stats_schema_1.TeamTotalStats.name, schema: team_total_stats_schema_1.TeamTotalStatsSchema },
                { name: game_info_schema_1.GameInfo.name, schema: game_info_schema_1.GameInfoSchema },
                { name: game_clips_schema_1.GameClips.name, schema: game_clips_schema_1.GameClipsSchema },
            ]),
            (0, common_1.forwardRef)(() => team_module_1.TeamModule),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
        ],
        controllers: [
            player_controller_1.PlayerController,
            qb_analyzer_controller_1.QbAnalyzerController,
        ],
        providers: [
            player_service_1.PlayerService,
            clip_analyzer_service_1.ClipAnalyzerService,
            qb_analyzer_service_1.QbAnalyzerService,
            qb_analyzer_service_2.QbAnalyzerService,
            rb_analyzer_service_1.RbAnalyzerService,
            wr_analyzer_service_1.WrAnalyzerService,
            te_analyzer_service_1.TeAnalyzerService,
            k_analyzer_service_1.KAnalyzerService,
            p_analyzer_service_1.PAnalyzerService,
            ol_analyzer_service_1.OlAnalyzerService,
            dl_analyzer_service_1.DlAnalyzerService,
            lb_analyzer_service_1.LbAnalyzerService,
            db_analyzer_service_1.DbAnalyzerService,
            stats_management_service_1.StatsManagementService,
            game_service_1.GameService,
        ],
        exports: [player_service_1.PlayerService],
    })
], PlayerModule);
//# sourceMappingURL=player.module.js.map