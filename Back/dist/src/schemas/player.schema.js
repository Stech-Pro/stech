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
exports.PlayerSchema = exports.Player = exports.PlayerStats = exports.DefensiveStats = exports.DBStats = exports.LBStats = exports.DLStats = exports.OLStats = exports.PStats = exports.KStats = exports.TEStats = exports.WRStats = exports.RBStats = exports.QBStats = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let QBStats = class QBStats {
    passingYards;
    passingTouchdowns;
    passingCompletions;
    passingAttempts;
    passingInterceptions;
    completionPercentage;
    passerRating;
    longestPass;
    sacks;
    gamesPlayed;
    rushingYards;
    rushingTouchdowns;
    rushingAttempts;
    yardsPerCarry;
    longestRush;
};
exports.QBStats = QBStats;
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], QBStats.prototype, "passingYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], QBStats.prototype, "passingTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], QBStats.prototype, "passingCompletions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], QBStats.prototype, "passingAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], QBStats.prototype, "passingInterceptions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], QBStats.prototype, "completionPercentage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], QBStats.prototype, "passerRating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], QBStats.prototype, "longestPass", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], QBStats.prototype, "sacks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], QBStats.prototype, "gamesPlayed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], QBStats.prototype, "rushingYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], QBStats.prototype, "rushingTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], QBStats.prototype, "rushingAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], QBStats.prototype, "yardsPerCarry", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], QBStats.prototype, "longestRush", void 0);
exports.QBStats = QBStats = __decorate([
    (0, mongoose_1.Schema)()
], QBStats);
let RBStats = class RBStats {
    rbReceivingTargets;
    rbReceptions;
    rbReceivingYards;
    rbYardsPerReception;
    rbReceivingTouchdowns;
    rbLongestReception;
    rbReceivingFirstDowns;
    rbRushingYards;
    rbRushingTouchdowns;
    rbRushingAttempts;
    rbYardsPerCarry;
    rbLongestRush;
    fumbles;
    fumblesLost;
    passingFumbles;
    rushingFumbles;
    passingFumblesLost;
    rushingFumblesLost;
    gamesPlayed;
    kickReturns;
    kickReturnYards;
    yardsPerKickReturn;
    puntReturns;
    puntReturnYards;
    yardsPerPuntReturn;
    returnTouchdowns;
    puntReturnTouchdowns;
    longestPuntReturn;
};
exports.RBStats = RBStats;
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "rbReceivingTargets", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "rbReceptions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "rbReceivingYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "rbYardsPerReception", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "rbReceivingTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], RBStats.prototype, "rbLongestReception", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "rbReceivingFirstDowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "rbRushingYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "rbRushingTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "rbRushingAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "rbYardsPerCarry", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], RBStats.prototype, "rbLongestRush", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "fumbles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "fumblesLost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "passingFumbles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "rushingFumbles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "passingFumblesLost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "rushingFumblesLost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "gamesPlayed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "kickReturns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "kickReturnYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "yardsPerKickReturn", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "puntReturns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "puntReturnYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "yardsPerPuntReturn", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "returnTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], RBStats.prototype, "puntReturnTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], RBStats.prototype, "longestPuntReturn", void 0);
exports.RBStats = RBStats = __decorate([
    (0, mongoose_1.Schema)()
], RBStats);
let WRStats = class WRStats {
    wrReceivingTargets;
    wrReceptions;
    wrReceivingYards;
    wrYardsPerReception;
    wrReceivingTouchdowns;
    wrLongestReception;
    wrReceivingFirstDowns;
    fumbles;
    fumblesLost;
    passingFumbles;
    rushingFumbles;
    passingFumblesLost;
    rushingFumblesLost;
    gamesPlayed;
    wrRushingAttempts;
    wrRushingYards;
    wrYardsPerCarry;
    wrRushingTouchdowns;
    wrLongestRush;
    kickReturns;
    kickReturnYards;
    yardsPerKickReturn;
    puntReturns;
    puntReturnYards;
    yardsPerPuntReturn;
    returnTouchdowns;
    puntReturnTouchdowns;
    longestPuntReturn;
};
exports.WRStats = WRStats;
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "wrReceivingTargets", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "wrReceptions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "wrReceivingYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "wrYardsPerReception", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "wrReceivingTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], WRStats.prototype, "wrLongestReception", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "wrReceivingFirstDowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "fumbles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "fumblesLost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "passingFumbles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "rushingFumbles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "passingFumblesLost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "rushingFumblesLost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "gamesPlayed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "wrRushingAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "wrRushingYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "wrYardsPerCarry", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "wrRushingTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], WRStats.prototype, "wrLongestRush", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "kickReturns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "kickReturnYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "yardsPerKickReturn", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "puntReturns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "puntReturnYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "yardsPerPuntReturn", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "returnTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WRStats.prototype, "puntReturnTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], WRStats.prototype, "longestPuntReturn", void 0);
exports.WRStats = WRStats = __decorate([
    (0, mongoose_1.Schema)()
], WRStats);
let TEStats = class TEStats {
    teReceivingTargets;
    teReceptions;
    teReceivingYards;
    teYardsPerReception;
    teReceivingTouchdowns;
    teLongestReception;
    teReceivingFirstDowns;
    fumbles;
    fumblesLost;
    gamesPlayed;
    teRushingAttempts;
    frontRushYard;
    backRushYard;
    teRushingYards;
    teYardsPerCarry;
    teRushingTouchdowns;
    teLongestRush;
};
exports.TEStats = TEStats;
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TEStats.prototype, "teReceivingTargets", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TEStats.prototype, "teReceptions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TEStats.prototype, "teReceivingYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TEStats.prototype, "teYardsPerReception", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TEStats.prototype, "teReceivingTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], TEStats.prototype, "teLongestReception", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TEStats.prototype, "teReceivingFirstDowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TEStats.prototype, "fumbles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TEStats.prototype, "fumblesLost", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TEStats.prototype, "gamesPlayed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TEStats.prototype, "teRushingAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TEStats.prototype, "frontRushYard", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TEStats.prototype, "backRushYard", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TEStats.prototype, "teRushingYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TEStats.prototype, "teYardsPerCarry", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TEStats.prototype, "teRushingTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], TEStats.prototype, "teLongestRush", void 0);
exports.TEStats = TEStats = __decorate([
    (0, mongoose_1.Schema)()
], TEStats);
let KStats = class KStats {
    fieldGoalsMade;
    fieldGoalsAttempted;
    fieldGoalPercentage;
    longestFieldGoal;
    extraPointsMade;
    extraPointsAttempted;
    gamesPlayed;
};
exports.KStats = KStats;
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], KStats.prototype, "fieldGoalsMade", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], KStats.prototype, "fieldGoalsAttempted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], KStats.prototype, "fieldGoalPercentage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], KStats.prototype, "longestFieldGoal", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], KStats.prototype, "extraPointsMade", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], KStats.prototype, "extraPointsAttempted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], KStats.prototype, "gamesPlayed", void 0);
exports.KStats = KStats = __decorate([
    (0, mongoose_1.Schema)()
], KStats);
let PStats = class PStats {
    puntCount;
    puntYards;
    averagePuntYard;
    longestPunt;
    touchbacks;
    touchbackPercentage;
    inside20;
    inside20Percentage;
    gamesPlayed;
};
exports.PStats = PStats;
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], PStats.prototype, "puntCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], PStats.prototype, "puntYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], PStats.prototype, "averagePuntYard", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], PStats.prototype, "longestPunt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], PStats.prototype, "touchbacks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], PStats.prototype, "touchbackPercentage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], PStats.prototype, "inside20", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], PStats.prototype, "inside20Percentage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], PStats.prototype, "gamesPlayed", void 0);
exports.PStats = PStats = __decorate([
    (0, mongoose_1.Schema)()
], PStats);
let OLStats = class OLStats {
    penalties;
    sacksAllowed;
    gamesPlayed;
};
exports.OLStats = OLStats;
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], OLStats.prototype, "penalties", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], OLStats.prototype, "sacksAllowed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], OLStats.prototype, "gamesPlayed", void 0);
exports.OLStats = OLStats = __decorate([
    (0, mongoose_1.Schema)()
], OLStats);
let DLStats = class DLStats {
    tackles;
    tfl;
    sacks;
    interceptions;
    forcedFumbles;
    fumbleRecoveries;
    fumbleRecoveryYards;
    passesDefended;
    interceptionYards;
    defensiveTouchdowns;
    gamesPlayed;
    soloTackles;
    comboTackles;
    att;
    longestInterception;
};
exports.DLStats = DLStats;
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DLStats.prototype, "tackles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DLStats.prototype, "tfl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DLStats.prototype, "sacks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DLStats.prototype, "interceptions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DLStats.prototype, "forcedFumbles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DLStats.prototype, "fumbleRecoveries", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DLStats.prototype, "fumbleRecoveryYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DLStats.prototype, "passesDefended", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DLStats.prototype, "interceptionYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DLStats.prototype, "defensiveTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DLStats.prototype, "gamesPlayed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DLStats.prototype, "soloTackles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DLStats.prototype, "comboTackles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DLStats.prototype, "att", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], DLStats.prototype, "longestInterception", void 0);
exports.DLStats = DLStats = __decorate([
    (0, mongoose_1.Schema)()
], DLStats);
let LBStats = class LBStats {
    tackles;
    tfl;
    sacks;
    interceptions;
    forcedFumbles;
    fumbleRecoveries;
    fumbleRecoveryYards;
    passesDefended;
    interceptionYards;
    defensiveTouchdowns;
    gamesPlayed;
    soloTackles;
    comboTackles;
    att;
    longestInterception;
};
exports.LBStats = LBStats;
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LBStats.prototype, "tackles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LBStats.prototype, "tfl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LBStats.prototype, "sacks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LBStats.prototype, "interceptions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LBStats.prototype, "forcedFumbles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LBStats.prototype, "fumbleRecoveries", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LBStats.prototype, "fumbleRecoveryYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LBStats.prototype, "passesDefended", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LBStats.prototype, "interceptionYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LBStats.prototype, "defensiveTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LBStats.prototype, "gamesPlayed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LBStats.prototype, "soloTackles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LBStats.prototype, "comboTackles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LBStats.prototype, "att", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], LBStats.prototype, "longestInterception", void 0);
exports.LBStats = LBStats = __decorate([
    (0, mongoose_1.Schema)()
], LBStats);
let DBStats = class DBStats {
    tackles;
    tfl;
    sacks;
    interceptions;
    forcedFumbles;
    fumbleRecoveries;
    fumbleRecoveryYards;
    passesDefended;
    interceptionYards;
    defensiveTouchdowns;
    gamesPlayed;
    soloTackles;
    comboTackles;
    att;
    longestInterception;
    kickReturns;
    kickReturnYards;
    yardsPerKickReturn;
    puntReturns;
    puntReturnYards;
    yardsPerPuntReturn;
    returnTouchdowns;
};
exports.DBStats = DBStats;
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "tackles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "tfl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "sacks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "interceptions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "forcedFumbles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "fumbleRecoveries", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "fumbleRecoveryYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "passesDefended", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "interceptionYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "defensiveTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "gamesPlayed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "soloTackles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "comboTackles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "att", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], DBStats.prototype, "longestInterception", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "kickReturns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "kickReturnYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "yardsPerKickReturn", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "puntReturns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "puntReturnYards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "yardsPerPuntReturn", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DBStats.prototype, "returnTouchdowns", void 0);
exports.DBStats = DBStats = __decorate([
    (0, mongoose_1.Schema)()
], DBStats);
let DefensiveStats = class DefensiveStats {
    tackles;
    sacks;
    interceptions;
    passesDefended;
    forcedFumbles;
    fumbleRecoveries;
    defensiveTouchdowns;
    gamesPlayed;
};
exports.DefensiveStats = DefensiveStats;
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DefensiveStats.prototype, "tackles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DefensiveStats.prototype, "sacks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DefensiveStats.prototype, "interceptions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DefensiveStats.prototype, "passesDefended", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DefensiveStats.prototype, "forcedFumbles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DefensiveStats.prototype, "fumbleRecoveries", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DefensiveStats.prototype, "defensiveTouchdowns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DefensiveStats.prototype, "gamesPlayed", void 0);
exports.DefensiveStats = DefensiveStats = __decorate([
    (0, mongoose_1.Schema)()
], DefensiveStats);
let PlayerStats = class PlayerStats {
    QB;
    RB;
    WR;
    TE;
    K;
    P;
    OL;
    DL;
    LB;
    DB;
    Defense;
    gameStats;
    totalGamesPlayed;
};
exports.PlayerStats = PlayerStats;
__decorate([
    (0, mongoose_1.Prop)({ type: QBStats, default: null }),
    __metadata("design:type", QBStats)
], PlayerStats.prototype, "QB", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: RBStats, default: null }),
    __metadata("design:type", RBStats)
], PlayerStats.prototype, "RB", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: WRStats, default: null }),
    __metadata("design:type", WRStats)
], PlayerStats.prototype, "WR", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: TEStats, default: null }),
    __metadata("design:type", TEStats)
], PlayerStats.prototype, "TE", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: KStats, default: null }),
    __metadata("design:type", KStats)
], PlayerStats.prototype, "K", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: PStats, default: null }),
    __metadata("design:type", PStats)
], PlayerStats.prototype, "P", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: OLStats, default: null }),
    __metadata("design:type", OLStats)
], PlayerStats.prototype, "OL", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: DLStats, default: null }),
    __metadata("design:type", DLStats)
], PlayerStats.prototype, "DL", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: LBStats, default: null }),
    __metadata("design:type", LBStats)
], PlayerStats.prototype, "LB", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: DBStats, default: null }),
    __metadata("design:type", DBStats)
], PlayerStats.prototype, "DB", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: DefensiveStats, default: null }),
    __metadata("design:type", DefensiveStats)
], PlayerStats.prototype, "Defense", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], PlayerStats.prototype, "gameStats", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerStats.prototype, "totalGamesPlayed", void 0);
exports.PlayerStats = PlayerStats = __decorate([
    (0, mongoose_1.Schema)()
], PlayerStats);
let Player = class Player {
    playerId;
    name;
    positions;
    studentId;
    email;
    playerID;
    teamId;
    teamName;
    jerseyNumber;
    stats;
    league;
    season;
    primaryPosition;
};
exports.Player = Player;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Player.prototype, "playerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Player.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: [String] }),
    __metadata("design:type", Array)
], Player.prototype, "positions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Player.prototype, "studentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Player.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Player.prototype, "playerID", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Team' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Player.prototype, "teamId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, required: true }),
    __metadata("design:type", String)
], Player.prototype, "teamName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Player.prototype, "jerseyNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: PlayerStats, default: () => ({}) }),
    __metadata("design:type", PlayerStats)
], Player.prototype, "stats", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['1부', '2부'], default: '1부' }),
    __metadata("design:type", String)
], Player.prototype, "league", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '2024' }),
    __metadata("design:type", String)
], Player.prototype, "season", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Player.prototype, "primaryPosition", void 0);
exports.Player = Player = __decorate([
    (0, mongoose_1.Schema)({ collection: 'players', timestamps: true, autoIndex: false })
], Player);
exports.PlayerSchema = mongoose_1.SchemaFactory.createForClass(Player);
exports.PlayerSchema.index({ playerId: 1 });
exports.PlayerSchema.index({ teamId: 1 });
exports.PlayerSchema.index({ teamName: 1, jerseyNumber: 1 }, { unique: true });
exports.PlayerSchema.virtual('team', {
    ref: 'Team',
    localField: 'teamId',
    foreignField: '_id',
    justOne: true,
});
//# sourceMappingURL=player.schema.js.map