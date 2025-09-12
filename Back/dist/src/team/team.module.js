"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const team_controller_1 = require("./team.controller");
const team_service_1 = require("./team.service");
const team_stats_analyzer_service_1 = require("./team-stats-analyzer.service");
const team_schema_1 = require("../schemas/team.schema");
const player_schema_1 = require("../schemas/player.schema");
const team_game_stats_schema_1 = require("../schemas/team-game-stats.schema");
const team_total_stats_schema_1 = require("../schemas/team-total-stats.schema");
const game_module_1 = require("../game/game.module");
let TeamModule = class TeamModule {
};
exports.TeamModule = TeamModule;
exports.TeamModule = TeamModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: team_schema_1.Team.name, schema: team_schema_1.TeamSchema },
                { name: player_schema_1.Player.name, schema: player_schema_1.PlayerSchema },
                { name: team_game_stats_schema_1.TeamGameStats.name, schema: team_game_stats_schema_1.TeamGameStatsSchema },
                { name: team_total_stats_schema_1.TeamTotalStats.name, schema: team_total_stats_schema_1.TeamTotalStatsSchema },
            ]),
            game_module_1.GameModule,
        ],
        controllers: [team_controller_1.TeamController],
        providers: [team_service_1.TeamService, team_stats_analyzer_service_1.TeamStatsAnalyzerService],
        exports: [team_service_1.TeamService, team_stats_analyzer_service_1.TeamStatsAnalyzerService],
    })
], TeamModule);
//# sourceMappingURL=team.module.js.map