const mongoose = require('mongoose');

// Railway MongoDB URI
const railwayMongoUri = 'mongodb+srv://rmwl2356_db_user:f8NaljAJhfZpTc7J@collaboreum-cluster.tdwqiwn.mongodb.net/?retryWrites=true&w=majority&appName=collaboreum-cluster';

async function testConnection() {
  try {
    console.log('🔗 Railway MongoDB 연결 테스트 시작...');
    console.log('📍 URI:', railwayMongoUri.replace(/\/\/.*@/, '//***:***@')); // 비밀번호 마스킹
    
    // MongoDB 연결
    await mongoose.connect(railwayMongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Railway MongoDB 연결 성공!');
    
    // 데이터베이스 정보 조회
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 데이터베이스 정보:');
    console.log(`- 데이터베이스명: ${db.databaseName}`);
    console.log(`- 컬렉션 수: ${collections.length}`);
    
    console.log('\n📁 컬렉션 목록:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // 커뮤니티 게시글 수 확인
    const CommunityPost = require('./models/CommunityPost');
    const postCount = await CommunityPost.countDocuments();
    console.log(`\n📝 커뮤니티 게시글 수: ${postCount}개`);
    
    // 사용자 수 확인
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    console.log(`👥 사용자 수: ${userCount}명`);
    
    // 아티스트 수 확인
    const artistCount = await User.countDocuments({ role: 'artist' });
    console.log(`🎨 아티스트 수: ${artistCount}명`);
    
    console.log('\n🎉 데이터베이스 연결 테스트 완료!');
    
  } catch (error) {
    console.error('❌ Railway MongoDB 연결 실패:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 데이터베이스 연결 종료');
  }
}

testConnection();
