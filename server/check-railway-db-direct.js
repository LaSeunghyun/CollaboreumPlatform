const mongoose = require('mongoose');
const CommunityPost = require('./models/CommunityPost');
const User = require('./models/User');

async function checkRailwayDB() {
  try {
    console.log('🚀 Railway MongoDB 직접 연결 시도...\n');
    
    // Railway MongoDB URI
    const railwayMongoUri = 'mongodb+srv://rmwl2356_db_user:f8NaljAJhfZpTc7J@collaboreum-cluster.tdwqiwn.mongodb.net/?retryWrites=true&w=majority&appName=collaboreum-cluster';
    
    console.log('🔗 연결 URI:', railwayMongoUri.replace(/\/\/.*@/, '//***:***@')); // 비밀번호 숨김
    
    console.log('\n🔗 Railway MongoDB 연결 시도...');
    await mongoose.connect(railwayMongoUri);
    console.log('✅ Railway 데이터베이스 연결 성공\n');
    
    // 데이터베이스 이름 확인
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 연결된 데이터베이스: ${dbName}\n`);
    
    // 전체 게시글 수 조회
    const totalPosts = await CommunityPost.countDocuments({ isActive: true });
    console.log(`📊 Railway DB 전체 활성 게시글 수: ${totalPosts}\n`);
    
    if (totalPosts === 0) {
      console.log('❌ Railway 데이터베이스에 게시글이 없습니다.');
      console.log('데이터를 추가하거나 다른 데이터베이스를 확인해주세요.');
      await mongoose.disconnect();
      return;
    }
    
    // 최근 게시글 조회
    const recentPosts = await CommunityPost.find({ isActive: true })
      .populate('author', 'name role avatar email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log('📝 Railway DB 최근 게시글 목록:');
    console.log('='.repeat(80));
    
    recentPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   ID: ${post._id}`);
      console.log(`   작성자: ${post.author?.name || post.authorName || 'Unknown'}`);
      console.log(`   카테고리: ${post.category}`);
      console.log(`   내용: ${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}`);
      console.log(`   조회수: ${post.viewCount || 0}`);
      console.log(`   좋아요: ${post.likes?.length || 0}`);
      console.log(`   댓글: ${post.comments?.length || 0}`);
      console.log(`   작성일: ${post.createdAt}`);
      console.log('-'.repeat(40));
    });
    
    // 카테고리별 통계
    const categoryStats = await CommunityPost.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📈 Railway DB 카테고리별 게시글 수:');
    categoryStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}개`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Railway 데이터베이스 연결 종료');
    
  } catch (error) {
    console.error('❌ Railway 데이터베이스 연결 실패:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 해결 방법:');
      console.log('1. MongoDB Atlas에서 사용자 비밀번호를 확인하세요');
      console.log('2. 사용자 권한이 올바른지 확인하세요');
      console.log('3. 네트워크 액세스에서 현재 IP가 허용되어 있는지 확인하세요');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 해결 방법:');
      console.log('1. MongoDB Atlas 클러스터가 실행 중인지 확인하세요');
      console.log('2. 연결 문자열이 올바른지 확인하세요');
    }
    
    process.exit(1);
  }
}

// 스크립트 실행
checkRailwayDB();
