// MongoDB 팀명 수정 스크립트
// 사용법: node fix-team-names.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://ceh1502:ceh9412@cluster0.97esexh.mongodb.net/stech?retryWrites=true&w=majority&appName=Cluster0';

const teamNameFixes = {
  'KMRazorbacks': 'KMrazorbacks',
  'YSEagles': 'YSeagles',
  // 필요시 다른 잘못된 팀명들도 추가
};

async function fixTeamNames() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('stech'); // 실제 DB 이름
    
    console.log('GameInfo 컬렉션 수정 중...');
    // GameInfo 컬렉션 수정
    for (const [wrongName, correctName] of Object.entries(teamNameFixes)) {
      const result1 = await db.collection('gameinfos').updateMany(
        { homeTeam: wrongName },
        { $set: { homeTeam: correctName } }
      );
      
      const result2 = await db.collection('gameinfos').updateMany(
        { awayTeam: wrongName },
        { $set: { awayTeam: correctName } }
      );
      
      console.log(`GameInfo - ${wrongName} → ${correctName}: homeTeam ${result1.modifiedCount}개, awayTeam ${result2.modifiedCount}개 수정`);
    }

    console.log('\nGameClips 컬렉션 수정 중...');
    // GameClips 컬렉션도 수정
    for (const [wrongName, correctName] of Object.entries(teamNameFixes)) {
      const result3 = await db.collection('gameclips').updateMany(
        { homeTeam: wrongName },
        { $set: { homeTeam: correctName } }
      );
      
      const result4 = await db.collection('gameclips').updateMany(
        { awayTeam: wrongName },
        { $set: { awayTeam: correctName } }
      );
      
      console.log(`GameClips - ${wrongName} → ${correctName}: homeTeam ${result3.modifiedCount}개, awayTeam ${result4.modifiedCount}개 수정`);
    }
    
    console.log('\n✅ 모든 팀명 수정 완료!');
  } catch (error) {
    console.error('❌ 에러:', error);
  } finally {
    await client.close();
  }
}

fixTeamNames();