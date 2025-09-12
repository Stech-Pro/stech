"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const team_stats_analyzer_service_1 = require("../team/team-stats-analyzer.service");
async function generateTeamStats() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const teamStatsService = app.get(team_stats_analyzer_service_1.TeamStatsAnalyzerService);
    const mongoose = app.get('DatabaseConnection');
    try {
        console.log('🏈 팀 통계 생성 시작...');
        const allGames = await mongoose.connection
            .collection('game_clips')
            .find({})
            .toArray();
        console.log(`📊 총 ${allGames.length}개의 게임 발견`);
        for (const gameData of allGames) {
            console.log(`\n🎮 게임 처리 중: ${gameData.gameKey}`);
            console.log(`  홈팀: ${gameData.homeTeam} vs 어웨이팀: ${gameData.awayTeam}`);
            try {
                const teamStatsResult = await teamStatsService.analyzeTeamStats(gameData);
                await teamStatsService.saveTeamStats(gameData.gameKey, teamStatsResult, gameData);
                console.log('  ✅ 팀 통계 저장 완료');
            }
            catch (error) {
                console.error(`  ❌ 에러 발생:`, error.message);
            }
        }
        console.log('\n✅ 모든 게임의 팀 통계 생성 완료!');
        const allTeamStats = await teamStatsService.getAllTeamTotalStats();
        console.log(`\n📊 총 ${allTeamStats.length}개 팀의 누적 통계 생성됨:`);
        allTeamStats.forEach((team, index) => {
            console.log(`${index + 1}. ${team.teamName}: 총 ${team.totalYards}야드 (${team.gamesPlayed}경기)`);
        });
    }
    catch (error) {
        console.error('❌ 팀 통계 생성 중 오류:', error);
    }
    finally {
        await app.close();
    }
}
generateTeamStats();
//# sourceMappingURL=generate-team-stats.js.map