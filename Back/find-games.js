const mongoose = require('mongoose');

// GameClips 스키마 정의
const gameClipsSchema = new mongoose.Schema({
  gameKey: String,
  homeTeam: String,
  awayTeam: String,
  Clips: Array
});

async function findGames() {
  try {
    await mongoose.connect('mongodb://localhost:27017/stech_db');
    
    const GameClips = mongoose.model('GameClips', gameClipsSchema, 'gameclips');
    
    // GameInfo 스키마도 추가
    const gameInfoSchema = new mongoose.Schema({
      gameKey: String,
      homeTeam: String,
      awayTeam: String,
      uploader: String,
      date: String
    });
    const GameInfo = mongoose.model('GameInfo', gameInfoSchema, 'gameinfos');
    
    // 게임 클립 찾기
    const gameClips = await GameClips.find({}, {gameKey: 1, homeTeam: 1, awayTeam: 1}).lean();
    console.log(`📊 게임 클립 수: ${gameClips.length}개`);
    
    // 게임 정보 찾기
    const gameInfos = await GameInfo.find({}, {gameKey: 1, homeTeam: 1, awayTeam: 1, uploader: 1}).lean();
    console.log(`📊 게임 정보 수: ${gameInfos.length}개`);
    
    if (gameInfos.length > 0) {
      console.log('\n📋 게임 정보 목록:');
      gameInfos.forEach((game, i) => {
        console.log(`  ${i+1}. gameKey: ${game.gameKey}, 홈: ${game.homeTeam}, 어웨이: ${game.awayTeam}, 업로더: ${game.uploader}`);
      });
    }
    
    // 모든 게임 찾기 (클립 데이터)
    const games = gameClips;
    
    console.log(`📊 총 게임 수: ${games.length}개`);
    
    games.forEach((game, i) => {
      console.log(`${i+1}. gameKey: ${game.gameKey}, 홈: ${game.homeTeam}, 어웨이: ${game.awayTeam}`);
    });
    
    // KM팀 관련 게임 찾기
    const kmGames = games.filter(g => g.homeTeam === 'KMrazorbacks' || g.awayTeam === 'KMrazorbacks');
    console.log(`\n🔍 KMrazorbacks 관련 게임: ${kmGames.length}개`);
    
    kmGames.forEach((game, i) => {
      console.log(`  ${i+1}. ${game.gameKey} - ${game.homeTeam} vs ${game.awayTeam}`);
    });
    
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    mongoose.disconnect();
  }
}

findGames();