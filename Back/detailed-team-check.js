const mongoose = require('mongoose');

async function detailedTeamCheck() {
  try {
    console.log('🔗 MongoDB Atlas 연결 중...');
    await mongoose.connect('mongodb+srv://ceh1502:ceh9412@cluster0.97esexh.mongodb.net/stech?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ MongoDB Atlas 연결 성공\n');

    const playerSchema = new mongoose.Schema({}, { strict: false, collection: 'players' });
    const teamTotalStatsSchema = new mongoose.Schema({}, { strict: false, collection: 'team_total_stats' });
    const teamGameStatsSchema = new mongoose.Schema({}, { strict: false, collection: 'team_game_stats' });
    const teamSchema = new mongoose.Schema({}, { strict: false, collection: 'teams' });

    const Player = mongoose.model('Player', playerSchema);
    const TeamTotalStats = mongoose.model('TeamTotalStats', teamTotalStatsSchema);
    const TeamGameStats = mongoose.model('TeamGameStats', teamGameStatsSchema);
    const Team = mongoose.model('Team', teamSchema);

    console.log('🔍 상세 데이터베이스 분석');
    console.log('='.repeat(50));

    // 1. 모든 컬렉션 확인
    console.log('\n📊 컬렉션 존재 여부 및 문서 수:');
    
    try {
      const playerCount = await Player.countDocuments();
      console.log(`   - players: ${playerCount}개 문서`);
    } catch (e) {
      console.log(`   - players: 컬렉션 없음 또는 오류`);
    }

    try {
      const totalStatsCount = await TeamTotalStats.countDocuments();
      console.log(`   - team_total_stats: ${totalStatsCount}개 문서`);
    } catch (e) {
      console.log(`   - team_total_stats: 컬렉션 없음 또는 오류`);
    }

    try {
      const gameStatsCount = await TeamGameStats.countDocuments();
      console.log(`   - team_game_stats: ${gameStatsCount}개 문서`);
    } catch (e) {
      console.log(`   - team_game_stats: 컬렉션 없음 또는 오류`);
    }

    try {
      const teamCount = await Team.countDocuments();
      console.log(`   - teams: ${teamCount}개 문서`);
    } catch (e) {
      console.log(`   - teams: 컬렉션 없음 또는 오류`);
    }

    // 2. Players 컬렉션 상세 분석
    console.log('\n📍 Players 컬렉션 상세 분석:');
    
    const allPlayers = await Player.find({}).lean();
    console.log(`총 선수 수: ${allPlayers.length}명`);

    // 팀별 선수 분포
    const teamDistribution = {};
    allPlayers.forEach(player => {
      const teamName = player.teamName;
      if (!teamDistribution[teamName]) {
        teamDistribution[teamName] = [];
      }
      teamDistribution[teamName].push({
        name: player.name,
        position: player.positions || player.position,
        jerseyNumber: player.jerseyNumber
      });
    });

    Object.keys(teamDistribution).forEach(teamName => {
      console.log(`\n🏈 "${teamName}" (${teamDistribution[teamName].length}명):`);
      teamDistribution[teamName].slice(0, 5).forEach(player => {
        console.log(`   - ${player.jerseyNumber}번 ${player.name} (${player.position})`);
      });
      if (teamDistribution[teamName].length > 5) {
        console.log(`   ... 그 외 ${teamDistribution[teamName].length - 5}명`);
      }
    });

    // 3. Team Total Stats 상세 분석
    console.log('\n📍 Team Total Stats 상세 분석:');
    const totalStats = await TeamTotalStats.find({}).lean();
    totalStats.forEach(stat => {
      console.log(`\n📊 "${stat.teamName}"`);
      console.log(`   시즌: ${stat.season}`);
      console.log(`   리그: ${stat.league}`);
      console.log(`   게임 수: ${stat.gamesPlayed}`);
      console.log(`   승-패-무: ${stat.wins}-${stat.losses}-${stat.ties}`);
      console.log(`   총 득점: ${stat.totalPoints}`);
      console.log(`   총 야드: ${stat.totalYards}`);
    });

    // 4. Team Game Stats 상세 분석
    console.log('\n📍 Team Game Stats 상세 분석:');
    const gameStats = await TeamGameStats.find({}).lean();
    gameStats.forEach(stat => {
      console.log(`\n🎮 "${stat.teamName}" vs "${stat.opponent}"`);
      console.log(`   게임키: ${stat.gameKey}`);
      console.log(`   날짜: ${stat.date}`);
      console.log(`   시즌: ${stat.season}`);
      console.log(`   홈/어웨이: ${stat.isHomeGame ? 'Home' : 'Away'}`);
      console.log(`   결과: ${stat.gameResult || 'N/A'}`);
      console.log(`   최종 점수: ${stat.finalScore?.own || 0} - ${stat.finalScore?.opponent || 0}`);
    });

    // 5. Teams 컬렉션 확인 (있다면)
    try {
      console.log('\n📍 Teams 컬렉션 분석:');
      const teams = await Team.find({}).lean();
      if (teams.length > 0) {
        teams.forEach(team => {
          console.log(`\n🏛️  팀 정보:`);
          console.log(`   팀명: "${team.teamName || team.name}"`);
          console.log(`   팀 ID: ${team.teamId || team._id}`);
          console.log(`   리그: ${team.league || 'N/A'}`);
          console.log(`   지역: ${team.region || 'N/A'}`);
        });
      } else {
        console.log('   Teams 컬렉션이 비어있거나 존재하지 않습니다.');
      }
    } catch (e) {
      console.log('   Teams 컬렉션에 접근할 수 없습니다.');
    }

    // 6. 데이터 일관성 검사
    console.log('\n📍 데이터 일관성 검사:');
    
    const playerTeamNames = [...new Set(allPlayers.map(p => p.teamName))].filter(n => n);
    const totalStatsTeamNames = [...new Set(totalStats.map(s => s.teamName))].filter(n => n);
    const gameStatsTeamNames = [...new Set(gameStats.map(s => s.teamName))].filter(n => n);
    
    console.log('\n팀명 일관성:');
    console.log(`   Players 컬렉션 팀명: [${playerTeamNames.join(', ')}]`);
    console.log(`   TotalStats 컬렉션 팀명: [${totalStatsTeamNames.join(', ')}]`);
    console.log(`   GameStats 컬렉션 팀명: [${gameStatsTeamNames.join(', ')}]`);

    // 7. 현재 상황 요약
    console.log('\n📍 현재 DB 상황 요약:');
    console.log('✅ 실제로 사용되고 있는 팀명:');
    const allDbTeamNames = [...new Set([...playerTeamNames, ...totalStatsTeamNames, ...gameStatsTeamNames])];
    allDbTeamNames.forEach((teamName, index) => {
      console.log(`   ${index + 1}. "${teamName}"`);
    });

  } catch (error) {
    console.error('❌ 오류:', error.message);
    console.error('스택 트레이스:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

detailedTeamCheck();