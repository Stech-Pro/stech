"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const player_schema_1 = require("../src/schemas/player.schema");
const mongoose_1 = require("@nestjs/mongoose");
async function fixIndexes() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const playerModel = app.get((0, mongoose_1.getModelToken)(player_schema_1.Player.name));
    console.log('🔍 현재 인덱스 확인...');
    const indexes = await playerModel.collection.getIndexes();
    console.log('현재 인덱스:', Object.keys(indexes));
    try {
        console.log('🗑️ 기존 중복 인덱스 삭제 시도...');
        try {
            await playerModel.collection.dropIndex('teamName_1_jerseyNumber_1');
            console.log('✅ teamName_1_jerseyNumber_1 인덱스 삭제됨');
        }
        catch (e) {
            console.log('⚠️ teamName_1_jerseyNumber_1 인덱스가 존재하지 않음');
        }
        console.log('🆕 새 인덱스 생성...');
        await playerModel.collection.createIndex({ teamName: 1, jerseyNumber: 1, position: 1 }, { unique: true });
        console.log('✅ 새 유니크 인덱스 생성: teamName + jerseyNumber + position');
    }
    catch (error) {
        console.error('❌ 인덱스 수정 실패:', error.message);
    }
    await app.close();
}
if (require.main === module) {
    fixIndexes().catch(console.error);
}
//# sourceMappingURL=fix-indexes.js.map