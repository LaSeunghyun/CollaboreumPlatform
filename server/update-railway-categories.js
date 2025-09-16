const mongoose = require('mongoose');
const CommunityPost = require('./models/CommunityPost');
const User = require('./models/User');

async function updateRailwayCategories() {
  try {
    console.log('🚀 Railway MongoDB 연결 및 카테고리 업데이트 시작...\n');
    
    // Railway MongoDB URI
    const railwayMongoUri = 'mongodb+srv://rmwl2356_db_user:f8NaljAJhfZpTc7J@collaboreum-cluster.tdwqiwn.mongodb.net/?retryWrites=true&w=majority&appName=collaboreum-cluster';
    
    console.log('🔗 Railway MongoDB 연결 중...');
    await mongoose.connect(railwayMongoUri);
    console.log('✅ Railway 데이터베이스 연결 성공\n');
    
    // 데이터베이스 이름 확인
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 연결된 데이터베이스: ${dbName}\n`);
    
    // 업데이트 전 상태 확인
    console.log('📋 업데이트 전 상태:');
    const beforeStats = await CommunityPost.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    beforeStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}개`);
    });
    
    // review 카테고리 게시글 조회
    const reviewPosts = await CommunityPost.find({ 
      category: 'review', 
      isActive: true 
    });
    
    console.log(`\n📝 'review' 카테고리 게시글 ${reviewPosts.length}개 발견:`);
    reviewPosts.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.title} (ID: ${post._id})`);
    });
    
    if (reviewPosts.length === 0) {
      console.log('❌ 업데이트할 게시글이 없습니다.');
      await mongoose.disconnect();
      return;
    }
    
    // 카테고리 업데이트 실행
    console.log('\n🔄 카테고리 업데이트 실행 중...');
    const updateResult = await CommunityPost.updateMany(
      { category: 'review', isActive: true },
      { $set: { category: '자유', updatedAt: new Date() } }
    );
    
    console.log(`✅ 업데이트 완료: ${updateResult.modifiedCount}개 게시글 수정됨`);
    
    // 업데이트 후 상태 확인
    console.log('\n📋 업데이트 후 상태:');
    const afterStats = await CommunityPost.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    afterStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}개`);
    });
    
    // 업데이트된 게시글 확인
    console.log('\n📝 업데이트된 게시글 목록:');
    const updatedPosts = await CommunityPost.find({ 
      category: '자유', 
      isActive: true 
    }).sort({ updatedAt: -1 });
    
    updatedPosts.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.title}`);
      console.log(`      ID: ${post._id}`);
      console.log(`      카테고리: ${post.category}`);
      console.log(`      수정일: ${post.updatedAt}`);
      console.log('      ---');
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Railway 데이터베이스 연결 종료');
    console.log('🎉 카테고리 업데이트 완료!');
    
  } catch (error) {
    console.error('❌ 업데이트 중 오류 발생:', error.message);
    console.error('스택:', error.stack);
    process.exit(1);
  }
}

// 스크립트 실행
updateRailwayCategories();
