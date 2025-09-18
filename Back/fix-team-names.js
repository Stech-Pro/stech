// MongoDB 팀명 수정 스크립트
// 사용법: node fix-team-names.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'your-mongodb-connection-string'; // .env에서 가져올 것

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
      
      console.log(`${wrongName} → ${correctName}: homeTeam ${result1.modifiedCount}개, awayTeam ${result2.modifiedCount}개 수정`);
    }
    
    console.log('팀명 수정 완료!');
  } catch (error) {
    console.error('에러:', error);
  } finally {
    await client.close();
  }
}

fixTeamNames();