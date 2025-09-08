const mongoose = require('mongoose');

async function testSchema() {
  try {
    await mongoose.connect('mongodb+srv://kenlee1016:1sTAw9tOqxpeFhWF@cluster0.v9wq6.mongodb.net/stech_data');
    
    const User = mongoose.model('User', {}, 'users');
    const user = await User.findOne();
    
    console.log('✅ User schema test:');
    console.log('Has memos:', user && user.memos !== undefined);
    console.log('Has highlights:', user && user.highlights !== undefined);  
    console.log('Memos value:', user?.memos);
    console.log('Highlights value:', user?.highlights);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSchema();