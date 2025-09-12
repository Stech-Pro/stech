"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayAnalysisHelper = exports.SIGNIFICANT_PLAY = exports.PLAY_TYPE = void 0;
exports.PLAY_TYPE = {
    RUN: 'Run',
    PASS: 'PassComplete',
    NOPASS: 'PassIncomplete',
    KICKOFF: 'Kickoff',
    PUNT: 'Punt',
    PAT: 'PAT',
    TPT: '2pt',
    FG: 'FieldGoal',
    SACK: 'Sack',
    NONE: 'none',
};
exports.SIGNIFICANT_PLAY = {
    TOUCHDOWN: 'Touchdown',
    TWOPTCONV: {
        GOOD: '2pt Conversion(Good)',
        NOGOOD: '2pt Conversion(No Good)',
    },
    PAT: {
        GOOD: 'PAT(Good)',
        NOGOOD: 'PAT(No Good)',
    },
    FIELDGOAL: {
        GOOD: 'Field Goal(Good)',
        NOGOOD: 'Field Goal(No Good)',
    },
    PENALTY: {
        TEAM: 'OFF',
        YARD: '0',
    },
    SACK: 'Sack',
    TFL: 'TFL',
    FUMBLE: 'Fumble Situation',
    FUMBLERECOFF: 'Fumble recovered by off',
    FUMBLERECDEF: 'Fumble recovered by def',
    INTERCEPT: 'Intercept',
    TURNOVER: 'Turn Over',
    SAFETY: 'safety',
};
class PlayAnalysisHelper {
    static calculateFieldGoalDistance(side, yard) {
        if (side === 'OPP') {
            return yard + 17;
        }
        else if (side === 'OWN') {
            return 50 - yard + 50 + 17;
        }
        return 0;
    }
    static hasSignificantPlay(significantPlays, target) {
        return significantPlays.some((play) => play === target);
    }
}
exports.PlayAnalysisHelper = PlayAnalysisHelper;
//# sourceMappingURL=play-types.constants.js.map