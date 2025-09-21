const mongoose = require('mongoose');
const CommunityPost = require('./models/CommunityPost');

async function checkCommunityPosts() {
  try {
    // MongoDB 연결
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboreum';
    await mongoose.connect(mongoUri);
    console.log('✅ 데이터베이스 연결 성공');

    // 전체 게시글 수 조회
    const totalPosts = await CommunityPost.countDocuments({ isActive: true });
    console.log(`📊 전체 활성 게시글 수: ${totalPosts}`);

    if (totalPosts === 0) {
      console.log('❌ 데이터베이스에 게시글이 없습니다.');
      await mongoose.disconnect();
      return;
    }

    // 최근 게시글 10개 조회
    const recentPosts = await CommunityPost.find({ isActive: true })
      .populate('author', 'name role avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log('\n📝 최근 게시글 목록:');
    console.log('='.repeat(80));

    recentPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   ID: ${post._id}`);
      console.log(
        `   작성자: ${post.author?.name || post.authorName || 'Unknown'}`,
      );
      console.log(`   카테고리: ${post.category}`);
      console.log(`   조회수: ${post.viewCount || 0}`);
      console.log(`   좋아요: ${post.likes?.length || 0}`);
      console.log(`   싫어요: ${post.dislikes?.length || 0}`);
      console.log(`   댓글: ${post.comments?.length || 0}`);
      console.log(`   작성일: ${post.createdAt}`);
      console.log(`   상태: ${post.isActive ? '활성' : '비활성'}`);
      console.log('-'.repeat(40));
    });

    // 카테고리별 통계
    const categoryStats = await CommunityPost.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log('\n📈 카테고리별 게시글 수:');
    categoryStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}개`);
    });

    // 인기 게시글 (좋아요 기준)
    const popularPosts = await CommunityPost.find({ isActive: true })
      .populate('author', 'name role avatar')
      .sort({ likes: -1, viewCount: -1 })
      .limit(5);

    console.log('\n🔥 인기 게시글 TOP 5:');
    popularPosts.forEach((post, index) => {
      console.log(
        `${index + 1}. ${post.title} (좋아요: ${post.likes?.length || 0}, 조회: ${post.viewCount || 0})`,
      );
    });

    await mongoose.disconnect();
    console.log('\n✅ 데이터베이스 연결 종료');
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error('스택:', error.stack);
    process.exit(1);
  }
}

// 스크립트 실행
checkCommunityPosts();
