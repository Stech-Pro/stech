const mongoose = require('mongoose');
require('dotenv').config();

async function checkGameStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const GameInfo = mongoose.model('GameInfo', {
      gameKey: String,
      date: String,
      uploadStatus: String,
      uploader: String,
      createdAt: Date,
      updatedAt: Date,
      homeTeam: String,
      awayTeam: String,
    });
    
    // 최근 게임들 조회
    const recentGames = await GameInfo.find({})
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();
    
    console.log('=== 최근 업데이트된 게임 10개 ===');
    recentGames.forEach((game, index) => {
      console.log(`\n${index + 1}. ${game.gameKey}`);
      console.log(`   - 팀: ${game.homeTeam} vs ${game.awayTeam}`);
      console.log(`   - 업로더: ${game.uploader}`);
      console.log(`   - 상태: ${game.uploadStatus}`);
      console.log(`   - 생성: ${game.createdAt}`);
      console.log(`   - 수정: ${game.updatedAt}`);
    });
    
    // YSSN20250105 게임 상세 확인
    const specificGame = await GameInfo.findOne({ gameKey: 'YSSN20250105' }).lean();
    if (specificGame) {
      console.log('\n=== YSSN20250105 게임 상세 정보 ===');
      console.log(JSON.stringify(specificGame, null, 2));
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkGameStatus();