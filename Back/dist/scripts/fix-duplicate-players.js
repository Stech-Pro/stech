"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const player_schema_1 = require("../src/schemas/player.schema");
const mongoose_1 = require("@nestjs/mongoose");
async function fixDuplicatePlayers() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const playerModel = app.get((0, mongoose_1.getModelToken)(player_schema_1.Player.name));
    console.log('🔍 중복 선수 데이터 검사 시작...');
    const duplicates = await playerModel.aggregate([
        {
            $group: {
                _id: { teamName: '$teamName', jerseyNumber: '$jerseyNumber' },
                count: { $sum: 1 },
                docs: { $push: '$$ROOT' }
            }
        },
        {
            $match: { count: { $gt: 1 } }
        }
    ]);
    console.log(`📊 중복 그룹 ${duplicates.length}개 발견`);
    for (const duplicate of duplicates) {
        const { teamName, jerseyNumber } = duplicate._id;
        const docs = duplicate.docs;
        console.log(`\n🔍 ${teamName} #${jerseyNumber} - ${docs.length}개 중복`);
        const positionGroups = {};
        docs.forEach(doc => {
            if (!positionGroups[doc.position]) {
                positionGroups[doc.position] = [];
            }
            positionGroups[doc.position].push(doc);
        });
        console.log(`   포지션: ${Object.keys(positionGroups).join(', ')}`);
        let keepDoc = null;
        if (positionGroups['K']) {
            keepDoc = positionGroups['K'][0];
            console.log(`   ✅ 키커로 유지: ${keepDoc.name}`);
        }
        else {
            keepDoc = docs[0];
            console.log(`   ✅ 첫 번째로 유지: ${keepDoc.name} (${keepDoc.position})`);
        }
        const toDelete = docs.filter(doc => doc._id.toString() !== keepDoc._id.toString());
        for (const doc of toDelete) {
            console.log(`   🗑️ 삭제: ${doc.name} (${doc.position})`);
            await playerModel.deleteOne({ _id: doc._id });
        }
    }
    console.log('\n✅ 중복 선수 정리 완료');
    await app.close();
}
if (require.main === module) {
    fixDuplicatePlayers().catch(console.error);
}
//# sourceMappingURL=fix-duplicate-players.js.map