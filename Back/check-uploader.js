const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/stech_db');

async function checkUploaders() {
  try {
    const gameInfos = mongoose.connection.collection('gameinfos');
    
    // 모든 경기의 업로더 확인
    const games = await gameInfos.find({}).limit(10).toArray();
    
    console.log('📋 경기별 업로더 정보:');
    games.forEach(game => {
      console.log(`🎮 ${game.gameKey}:`);
      console.log(`  📤 업로더: ${game.uploader || '없음'}`);
      console.log(`  🏠 홈팀: ${game.homeTeam}`);
      console.log(`  🚌 어웨이팀: ${game.awayTeam}`);
      console.log(`  📊 상태: ${game.uploadStatus || '없음'}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ 조회 실패:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkUploaders();