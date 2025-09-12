"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const mongoose_1 = require("@nestjs/mongoose");
async function addStatsField() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const playerModel = app.get((0, mongoose_1.getModelToken)('Player'));
    console.log('기존 선수들에게 stats 필드 추가 중...');
    try {
        const totalPlayers = await playerModel.countDocuments({});
        console.log(`전체 선수 수: ${totalPlayers}명`);
        const result = await playerModel.updateMany({}, {
            $set: {
                'stats.qbPassingAttempts': 0,
                'stats.qbPassingCompletions': 0,
                'stats.qbPassingYards': 0,
                'stats.qbPassingTouchdowns': 0,
                'stats.qbPassingInterceptions': 0,
                'stats.qbCompletionPercentage': 0,
                'stats.qbLongestPass': 0,
                'stats.qbSacks': 0,
                'stats.gamesPlayed': 0
            }
        });
        console.log(`${result.modifiedCount}명의 선수에게 QB stats 필드 추가 완료`);
        const samplePlayer = await playerModel.findOne({ teamName: 'HYLions', jerseyNumber: 15 });
        if (samplePlayer) {
            console.log('\n샘플 확인:', samplePlayer.stats);
        }
    }
    catch (error) {
        console.error('스크립트 실행 실패:', error);
    }
    await app.close();
}
addStatsField();
//# sourceMappingURL=add-stats-field.js.map