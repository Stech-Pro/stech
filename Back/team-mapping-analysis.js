const mongoose = require('mongoose');

// TEAM_CODES에서 추출한 팀명과 실제 DB 팀명 매핑 분석
async function analyzeTeamMapping() {
  try {
    console.log('🔗 MongoDB Atlas 연결 중...');
    await mongoose.connect('mongodb+srv://ceh1502:ceh9412@cluster0.97esexh.mongodb.net/stech?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ MongoDB Atlas 연결 성공\n');

    const playerSchema = new mongoose.Schema({}, { strict: false, collection: 'players' });
    const Player = mongoose.model('Player', playerSchema);

    console.log('🔍 팀 코드와 실제 DB 팀명 매핑 분석');
    console.log('='.repeat(60));

    // TEAM_CODES에서 추출한 팀명들 (실제 team-codes.ts에서)
    const teamCodes = {
      // Seoul Region Teams
      'HICowboys': { code: '1371', region: 'Seoul' },
      'KKRagingBulls': { code: '1871', region: 'Seoul' }, // 주목: 대소문자 차이
      'YSEagles': { code: '1211', region: 'Seoul' },
      'SNGreenTerrors': { code: '1231', region: 'Seoul' },
      'HYLions': { code: '1971', region: 'Seoul' },
      'KMRazorbacks': { code: '1741', region: 'Seoul' },
      'USCityhawks': { code: '1081', region: 'Seoul' },
      'HFBlackKnights': { code: '1511', region: 'Seoul' },
      'KUTigers': { code: '1271', region: 'Seoul' },
      'DGTuskers': { code: '1991', region: 'Seoul' },
      'SSCrusaders': { code: '1611', region: 'Seoul' },
      'CABlueDragons': { code: '1951', region: 'Seoul' },
      'KHCommanders': { code: '1071', region: 'Seoul' },
      'SGAlbatross': { code: '1421', region: 'Seoul' },
    };

    // 실제 DB에서 팀명 조회
    const dbTeams = await Player.aggregate([
      { $group: { _id: '$teamName', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📍 실제 DB 팀명들:');
    dbTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. "${team._id}" (${team.count}명)`);
    });

    console.log('\n📍 팀 코드에 정의된 팀명들:');
    Object.keys(teamCodes).forEach((teamName, index) => {
      console.log(`   ${index + 1}. "${teamName}" (코드: ${teamCodes[teamName].code}, 지역: ${teamCodes[teamName].region})`);
    });

    console.log('\n📍 매핑 분석:');
    
    // 정확히 일치하는 팀
    const exactMatches = [];
    // 대소문자만 다른 팀
    const caseMatches = [];
    // DB에만 있는 팀
    const dbOnlyTeams = [];

    const dbTeamNames = dbTeams.map(t => t._id);
    const codeTeamNames = Object.keys(teamCodes);

    dbTeamNames.forEach(dbTeam => {
      if (codeTeamNames.includes(dbTeam)) {
        exactMatches.push(dbTeam);
      } else {
        // 대소문자 구분 없이 비교
        const lowerCaseMatch = codeTeamNames.find(codeTeam => 
          codeTeam.toLowerCase() === dbTeam.toLowerCase()
        );
        if (lowerCaseMatch) {
          caseMatches.push({ db: dbTeam, code: lowerCaseMatch });
        } else {
          dbOnlyTeams.push(dbTeam);
        }
      }
    });

    console.log('\n✅ 정확히 일치하는 팀명:');
    exactMatches.forEach(team => {
      console.log(`   - "${team}"`);
    });

    console.log('\n⚠️  대소문자만 다른 팀명:');
    caseMatches.forEach(match => {
      console.log(`   - DB: "${match.db}" ↔ 코드: "${match.code}"`);
    });

    console.log('\n❓ DB에만 있는 팀명 (코드에 없음):');
    dbOnlyTeams.forEach(team => {
      console.log(`   - "${team}"`);
    });

    console.log('\n📍 구체적인 문제점 및 해결방안:');
    
    console.log('\n🔧 1. 대소문자 불일치 문제:');
    caseMatches.forEach(match => {
      console.log(`   문제: "${match.db}" vs "${match.code}"`);
      console.log(`   해결: 데이터베이스나 코드 중 하나를 통일해야 함`);
      console.log(`   권장: 코드의 "${match.code}" 형태로 DB 데이터 변경`);
    });

    console.log('\n🔧 2. 미등록 팀명 문제:');
    dbOnlyTeams.forEach(team => {
      console.log(`   문제: "${team}"이 team-codes.ts에 정의되지 않음`);
      console.log(`   해결: team-codes.ts에 해당 팀 정보 추가 필요`);
    });

    // 선수 데이터 상세 확인
    console.log('\n📍 각 팀의 선수 데이터 샘플:');
    for (const dbTeam of dbTeamNames) {
      console.log(`\n🏈 "${dbTeam}"`);
      const teamPlayers = await Player.find({ teamName: dbTeam }).limit(3).lean();
      teamPlayers.forEach(player => {
        console.log(`   - ${player.jerseyNumber}번 ${player.name} (${player.positions || player.position})`);
      });
      
      // 게임 관련 데이터가 있는지 확인
      const gameData = await Player.findOne({ 
        teamName: dbTeam,
        'stats.gameStats': { $exists: true, $ne: {} }
      }).lean();
      
      if (gameData) {
        const gameKeys = Object.keys(gameData.stats.gameStats || {});
        console.log(`   📊 게임 데이터: ${gameKeys.length}개 게임`);
      }
    }

    console.log('\n📍 권장 해결 방안:');
    console.log('1. "KKragingbulls" → "KKRagingBulls"로 DB 데이터 수정');
    console.log('2. 또는 team-codes.ts에서 "KKRagingBulls" → "KKragingbulls"로 코드 수정');
    console.log('3. 현재 실제 사용되는 팀은 2개뿐이므로 다른 팀들은 테스트 데이터 추가 필요');
    console.log('4. 팀명 일관성을 위해 camelCase 또는 kebab-case 중 하나로 통일 권장');

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

analyzeTeamMapping();