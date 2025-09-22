const mongoose = require('mongoose');

// GameInfo 스키마 정의 (실제 코드와 동일)
const gameInfoSchema = new mongoose.Schema({
  gameKey: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  type: { type: String, required: true },
  score: { 
    type: {
      home: Number,
      away: Number
    }, 
    required: true 
  },
  region: { type: String, required: true },
  location: { type: String, required: true },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  
  // 새로 추가된 필드들
  uploader: { type: String, required: true },
  uploadStatus: { type: String, default: 'pending' },
  videoUrls: { type: Object },
  uploadCompletedAt: { type: String }
}, { timestamps: true });

async function testGameInfoStorage() {
  try {
    await mongoose.connect('mongodb://localhost:27017/stech_db');
    
    const GameInfo = mongoose.model('GameInfo', gameInfoSchema, 'gameinfos');
    
    // 테스트 데이터 저장
    const testGameData = {
      gameKey: "TEST_STORAGE_20250920",
      date: "2025-09-20(금) 15:00",
      type: "League", 
      score: { home: 21, away: 14 },
      region: "Seoul",
      location: "테스트 경기장",
      homeTeam: "YSeagles",
      awayTeam: "KMrazorbacks",
      uploader: "KUtigers",
      uploadStatus: "pending"
    };
    
    console.log('📝 GameInfo 저장 시작...');
    const savedGame = await GameInfo.create(testGameData);
    
    console.log('✅ 저장 성공!');
    console.log('📍 컬렉션:', savedGame.collection.collectionName);
    console.log('🆔 문서 ID:', savedGame._id);
    console.log('📊 저장된 데이터:', JSON.stringify(savedGame.toObject(), null, 2));
    
    // 조회 테스트
    console.log('\n🔍 저장된 데이터 조회 테스트...');
    const foundGame = await GameInfo.findOne({ gameKey: "TEST_STORAGE_20250920" });
    console.log('📋 조회 결과:', {
      gameKey: foundGame.gameKey,
      uploader: foundGame.uploader,
      uploadStatus: foundGame.uploadStatus,
      createdAt: foundGame.createdAt
    });
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

testGameInfoStorage();