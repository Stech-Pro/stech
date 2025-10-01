const mongoose = require('mongoose');
require('dotenv').config();

async function checkTeamUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const User = mongoose.model('User', {
      username: String,
      teamName: String,
      role: String,
      email: String
    });
    
    // 모든 사용자 조회
    const allUsers = await User.find({}).lean();
    console.log('=== 전체 사용자 목록 ===');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username}`);
      console.log(`   - 팀: ${user.teamName}`);
      console.log(`   - 역할: ${user.role}`);
      console.log(`   - 이메일: ${user.email || '없음'}`);
    });
    
    // YSeagles 팀 사용자 확인
    console.log('\n=== YSeagles 팀 사용자 ===');
    const yseaglesUsers = await User.find({ 
      teamName: 'YSeagles',
      role: { $in: ['player', 'coach'] }
    }).lean();
    
    console.log(`YSeagles 팀 사용자 수: ${yseaglesUsers.length}명`);
    yseaglesUsers.forEach(user => {
      console.log(`- ${user.username} (${user.role})`);
    });
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTeamUsers();