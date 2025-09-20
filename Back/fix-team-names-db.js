const mongoose = require('mongoose');

// MongoDB 연결
mongoose.connect('mongodb://localhost:27017/stech_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 팀명 매핑 (잘못된 → 올바른)
const teamNameMappings = {
  // 서울 지역
  'KMRazorbacks': 'KMrazorbacks',
  'YSEagles': 'YSeagles',
  'SNGreenTerrors': 'SNgreenterrors',
  'HYLions': 'HYlions',
  'USCityhawks': 'UScityhawks',
  'HFBlackKnights': 'HFblackknights',
  'KKRagingbulls': 'KKragingbulls',
  'HICowboys': 'HIcowboys',
  'KUTigers': 'KUtigers',
  'DGTuskers': 'DongkukTuskers',
  'SSCrusaders': 'SScrusaders',
  'CABluedragons': 'CAbluedragons',
  'KHCommanders': 'KHcommanders',
  'SGAlbatross': 'SGalbatross',
  
  // 경기강원권
  'SKRoyals': 'SKroyals',
  'KWCapras': 'KWcapra',
  'DKKodiakBears': 'DKkodiakbears',
  'YIWhiteTigers': 'Ylwhitetigers',
  'IHTealDragons': 'IHtealdragons',
  'HLPhoenix': 'HLphoenix',
  'HSKillerWhales': 'HSkillerwhales',
  'KAMavericks': 'KAmavericks',
  
  // 대구경북권
  'KBOrangeFighters': 'KPorangefighters',
  'KIBlackBears': 'KIblackbears',
  'KMSuperLions': 'KeimyungSuperlions',
  'KOTRavens': 'KOravens',
  'DGWhiteElephants': 'DongkukWhiteelephants',
  'HDHolyRams': 'Hahorans',
  
  // 부산경남권
  'GSDragons': 'GSdrangons',
  'PNUEagles': 'BSeagles',
  'KMOUVikings': 'HHvikings',
  'SUDevils': 'SLdevils',
  'BKMadMobyDicks': 'BKmadmobydicks',
  'DEUTurtleFighters': 'DUturtlefighters',
  'DALeopards': 'DAleopards',
  'DSBlueDolphins': 'DSbluedolphins',
  'BUFSTornados': 'BFtornado',
  'UOUUnicorns': 'UUunicorns',
  
  // 사회인 팀
  'GunwiPhoenix': 'GunwiPheonix',
  'BusanGryphons': 'BusanGryphons',
  'SamsungBlueStorm': 'samsungBT',
  'SeoulGoldenEagles': 'SeoulGE',
  'SeoulDefenders': 'seoulDF',
  'SeoulVikings': 'seoulVI',
  'IncheonRhinos': 'incheonRH',
};

async function updateTeamNames() {
  try {
    console.log('🔄 팀명 업데이트 시작...');
    
    // 모든 컬렉션에서 팀명 업데이트
    const collections = [
      'gameinfos',      // game_infos
      'gameclips',      // game_clips
      'teamgamestats',  // team_game_stats
      'teamtotalstats', // team_total_stats
      'players',        // players
      'playergamestats', // player_game_stats
      'playerseasonstats', // player_season_stats
      'playercareerstats'  // player_career_stats
    ];
    
    for (const collectionName of collections) {
      console.log(`\n📊 ${collectionName} 컬렉션 업데이트 중...`);
      
      const collection = mongoose.connection.collection(collectionName);
      
      for (const [oldName, newName] of Object.entries(teamNameMappings)) {
        // homeTeam 필드 업데이트
        const homeResult = await collection.updateMany(
          { homeTeam: oldName },
          { $set: { homeTeam: newName } }
        );
        if (homeResult.modifiedCount > 0) {
          console.log(`  ✅ homeTeam: ${oldName} → ${newName} (${homeResult.modifiedCount}개)`);
        }
        
        // awayTeam 필드 업데이트
        const awayResult = await collection.updateMany(
          { awayTeam: oldName },
          { $set: { awayTeam: newName } }
        );
        if (awayResult.modifiedCount > 0) {
          console.log(`  ✅ awayTeam: ${oldName} → ${newName} (${awayResult.modifiedCount}개)`);
        }
        
        // teamName 필드 업데이트 (players, stats 컬렉션용)
        const teamResult = await collection.updateMany(
          { teamName: oldName },
          { $set: { teamName: newName } }
        );
        if (teamResult.modifiedCount > 0) {
          console.log(`  ✅ teamName: ${oldName} → ${newName} (${teamResult.modifiedCount}개)`);
        }
        
        // team 필드 업데이트 (일부 컬렉션용)
        const teamFieldResult = await collection.updateMany(
          { team: oldName },
          { $set: { team: newName } }
        );
        if (teamFieldResult.modifiedCount > 0) {
          console.log(`  ✅ team: ${oldName} → ${newName} (${teamFieldResult.modifiedCount}개)`);
        }
      }
    }
    
    console.log('\n🎉 모든 팀명 업데이트 완료!');
    
    // 업데이트 결과 확인
    console.log('\n📋 업데이트 결과 확인:');
    const gameInfos = mongoose.connection.collection('gameinfos');
    const sampleGames = await gameInfos.find({}).limit(5).toArray();
    sampleGames.forEach(game => {
      console.log(`  🎮 ${game.gameKey}: ${game.homeTeam} vs ${game.awayTeam}`);
    });
    
  } catch (error) {
    console.error('❌ 업데이트 실패:', error);
  } finally {
    mongoose.disconnect();
  }
}

updateTeamNames();