const mongoose = require('mongoose');

// MongoDB 연결 정보는 환경변수나 기존 코드에서 가져와서 사용
async function checkActualTeams() {
  try {
    console.log('🔗 MongoDB Atlas 연결 중...');
    // 기존 연결 정보를 기반으로 연결 (check-teams.js에서 확인한 연결 정보)
    await mongoose.connect('mongodb+srv://ceh1502:ceh9412@cluster0.97esexh.mongodb.net/stech?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ MongoDB Atlas 연결 성공\n');

    // 스키마 정의 (실제 컬렉션 구조를 반영)
    const playerSchema = new mongoose.Schema({}, { strict: false, collection: 'players' });
    const teamTotalStatsSchema = new mongoose.Schema({}, { strict: false, collection: 'team_total_stats' });
    const teamGameStatsSchema = new mongoose.Schema({}, { strict: false, collection: 'team_game_stats' });

    const Player = mongoose.model('Player', playerSchema);
    const TeamTotalStats = mongoose.model('TeamTotalStats', teamTotalStatsSchema);
    const TeamGameStats = mongoose.model('TeamGameStats', teamGameStatsSchema);

    console.log('🏈 실제 DB에 저장된 팀명들 확인');
    console.log('=' * 50);

    // 1. players 컬렉션에서 팀명 조회
    console.log('\n📍 1. Players 컬렉션의 팀명들:');
    const playerTeams = await Player.aggregate([
      { $group: { _id: '$teamName', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log(`총 ${playerTeams.length}개 팀 발견:`);
    playerTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. "${team._id}" (${team.count}명)`);
    });

    // 2. team_total_stats 컬렉션에서 팀명 조회
    console.log('\n📍 2. Team Total Stats 컬렉션의 팀명들:');
    const totalStatsTeams = await TeamTotalStats.aggregate([
      { $group: { _id: '$teamName', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log(`총 ${totalStatsTeams.length}개 팀 발견:`);
    totalStatsTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. "${team._id}" (${team.count}개 레코드)`);
    });

    // 3. team_game_stats 컬렉션에서 팀명 조회
    console.log('\n📍 3. Team Game Stats 컬렉션의 팀명들:');
    const gameStatsTeams = await TeamGameStats.aggregate([
      { $group: { _id: '$teamName', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log(`총 ${gameStatsTeams.length}개 팀 발견:`);
    gameStatsTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. "${team._id}" (${team.count}개 게임 레코드)`);
    });

    // 4. 팀 코드와 실제 팀명 매핑 비교
    console.log('\n📍 4. TEAM_CODES와 실제 DB 팀명 비교:');
    
    // team-codes.ts에서 추출한 팀명들
    const codeTeams = [
      'YSEagles', 'SNGreenTerrors', 'HYLions', 'KMRazorbacks', 'USCityhawks',
      'HFBlackKnights', 'KKRagingBulls', 'HICowboys', 'KUTigers', 'DGTuskers',
      'SSCrusaders', 'CABlueDragons', 'KHCommanders', 'SGAlbatross',
      'SKRoyals', 'KWCapras', 'DKKodiakBears', 'YIWhiteTigers', 'IHTealDragons',
      'HLPhoenix', 'HSKillerWhales', 'KBOrangeFighters', 'KIBlackBears',
      'KMSuperLions', 'KOTRavens', 'DCUScudAngels', 'DUFlyingTigers',
      'DHURhinos', 'DGWhiteElephants', 'YNPegasus', 'HDHolyRams',
      'GSDragons', 'DSBlueDolphins', 'DALeopards', 'DEUTurtleFighters',
      'PNUEagles', 'BUFSTornados', 'SUDevils', 'UOUUnicorns', 'KMOUVikings',
      'GunwiPhoenix', 'BusanGryphons', 'SamsungBlueStorm', 'SeoulGoldenEagles',
      'SeoulDefenders', 'SeoulVikings', 'IncheonRhinos'
    ];

    const dbTeamNames = [...new Set([
      ...playerTeams.map(t => t._id),
      ...totalStatsTeams.map(t => t._id),
      ...gameStatsTeams.map(t => t._id)
    ])].filter(name => name); // null/undefined 제거

    console.log('\n🔍 매칭 분석:');
    console.log('✅ 코드에 정의되어 있고 DB에도 존재하는 팀:');
    const matchedTeams = codeTeams.filter(team => dbTeamNames.includes(team));
    matchedTeams.forEach(team => console.log(`   - ${team}`));

    console.log('\n❌ 코드에 정의되어 있지만 DB에 없는 팀:');
    const missingInDb = codeTeams.filter(team => !dbTeamNames.includes(team));
    missingInDb.forEach(team => console.log(`   - ${team}`));

    console.log('\n⚠️  DB에 있지만 코드에 정의되지 않은 팀:');
    const extraInDb = dbTeamNames.filter(team => !codeTeams.includes(team));
    extraInDb.forEach(team => console.log(`   - "${team}"`));

    // 5. 샘플 데이터 확인
    console.log('\n📍 5. 각 컬렉션의 샘플 데이터:');
    
    const samplePlayer = await Player.findOne({}).lean();
    if (samplePlayer) {
      console.log('\n샘플 Player 데이터:');
      console.log(`   이름: ${samplePlayer.name}`);
      console.log(`   팀명: "${samplePlayer.teamName}"`);
      console.log(`   포지션: ${samplePlayer.positions || samplePlayer.position}`);
    }

    const sampleTotalStats = await TeamTotalStats.findOne({}).lean();
    if (sampleTotalStats) {
      console.log('\n샘플 TeamTotalStats 데이터:');
      console.log(`   팀명: "${sampleTotalStats.teamName}"`);
      console.log(`   시즌: ${sampleTotalStats.season}`);
      console.log(`   게임 수: ${sampleTotalStats.gamesPlayed}`);
    }

    const sampleGameStats = await TeamGameStats.findOne({}).lean();
    if (sampleGameStats) {
      console.log('\n샘플 TeamGameStats 데이터:');
      console.log(`   팀명: "${sampleGameStats.teamName}"`);
      console.log(`   게임키: ${sampleGameStats.gameKey}`);
      console.log(`   상대팀: "${sampleGameStats.opponent}"`);
    }

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

checkActualTeams();