"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamsInfo = getTeamsInfo;
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const mongoose_1 = require("@nestjs/mongoose");
async function getTeamsInfo() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        const teamModel = app.get((0, mongoose_1.getModelToken)('Team'));
        const playerModel = app.get((0, mongoose_1.getModelToken)('Player'));
        console.log('🏈 팀 정보:');
        const teams = await teamModel.find({}).exec();
        for (const team of teams) {
            const playerCount = await playerModel.countDocuments({ teamId: team._id });
            console.log(`\n📍 ${team.teamName} (${team.teamId})`);
            console.log(`   ObjectId: ${team._id}`);
            console.log(`   선수 수: ${playerCount}명`);
            console.log(`   API 호출: curl http://localhost:3000/player/team/${team._id}`);
        }
        console.log('\n🎯 개별 선수 조회 예시:');
        const samplePlayers = await playerModel.find({}).limit(3).populate('teamId');
        for (const player of samplePlayers) {
            console.log(`\n👤 ${player.name} (#${player.jerseyNumber})`);
            console.log(`   PlayerId: ${player.playerId}`);
            console.log(`   포지션: ${player.positions?.join(', ') || '없음'}`);
            console.log(`   팀: ${player.teamId.teamName}`);
            console.log(`   API 호출: curl http://localhost:3000/player/code/${player.playerId}`);
        }
    }
    catch (error) {
        console.error('❌ 에러 발생:', error);
    }
    finally {
        await app.close();
    }
}
if (require.main === module) {
    getTeamsInfo()
        .then(() => {
        console.log('\n✅ 조회 완료');
        process.exit(0);
    })
        .catch((error) => {
        console.error('❌ 실행 실패:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=get-teams.js.map