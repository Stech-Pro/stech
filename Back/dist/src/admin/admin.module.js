"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const admin_controller_1 = require("./admin.controller");
const admin_dashboard_controller_1 = require("./admin-dashboard.controller");
const admin_service_1 = require("./admin.service");
const user_schema_1 = require("../schemas/user.schema");
const player_game_stats_schema_1 = require("../schemas/player-game-stats.schema");
const player_season_stats_schema_1 = require("../schemas/player-season-stats.schema");
const game_info_schema_1 = require("../schemas/game-info.schema");
const game_module_1 = require("../game/game.module");
const player_module_1 = require("../player/player.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: player_game_stats_schema_1.PlayerGameStats.name, schema: player_game_stats_schema_1.PlayerGameStatsSchema },
                { name: player_season_stats_schema_1.PlayerSeasonStats.name, schema: player_season_stats_schema_1.PlayerSeasonStatsSchema },
                { name: game_info_schema_1.GameInfo.name, schema: game_info_schema_1.GameInfoSchema },
            ]),
            game_module_1.GameModule,
            player_module_1.PlayerModule,
        ],
        controllers: [admin_controller_1.AdminController, admin_dashboard_controller_1.AdminDashboardController],
        providers: [admin_service_1.AdminService],
        exports: [admin_service_1.AdminService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map