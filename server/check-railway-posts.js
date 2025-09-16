const mongoose = require('mongoose');
const CommunityPost = require('./models/CommunityPost');
const User = require('./models/User');

async function checkRailwayPosts() {
  try {
    console.log('🚀 Railway 데이터베이스 연결 시도...\n');
    
    // Railway MongoDB URI (환경변수에서 가져오거나 직접 설정)
    const railwayMongoUri = process.env.MONGODB_URI_PROD || 
                           process.env.MONGODB_URI || 
                           'mongodb+srv://rmwl2356_db_user:실제비밀번호@collaboreum-cluster.tdwqiwn.mongodb.net/?retryWrites=true&w=majority&appName=collaboreum-cluster';
    
    if (!railwayMongoUri || railwayMongoUri.includes('실제비밀번호')) {
      console.log('❌ Railway MongoDB URI가 올바르게 설정되지 않았습니다.');
      console.log('환경변수 MONGODB_URI 또는 MONGODB_URI_PROD를 확인하거나');
      console.log('스크립트에서 실제 MongoDB URI를 설정해주세요.');
      return;
    }
    
    console.log('🔗 연결 URI:', railwayMongoUri.replace(/\/\/.*@/, '//***:***@')); // 비밀번호 숨김
    
    // Railway MongoDB 연결
    await mongoose.connect(railwayMongoUri);
    console.log('✅ Railway 데이터베이스 연결 성공\n');
    
    // 전체 게시글 수 조회
    const totalPosts = await CommunityPost.countDocuments({ isActive: true });
    console.log(`📊 Railway DB 전체 활성 게시글 수: ${totalPosts}\n`);
    
    if (totalPosts === 0) {
      console.log('❌ Railway 데이터베이스에 게시글이 없습니다.');
      await mongoose.disconnect();
      return;
    }
    
    // 최근 게시글 10개 조회
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
      console.log(`   작성자 역할: ${post.author?.role || 'N/A'}`);
      console.log(`   카테고리: ${post.category}`);
      console.log(`   내용: ${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}`);
      console.log(`   태그: ${post.tags?.join(', ') || '없음'}`);
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
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📈 Railway DB 카테고리별 게시글 수:');
    categoryStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}개`);
    });
    
    // 인기 게시글 (좋아요 기준)
    const popularPosts = await CommunityPost.find({ isActive: true })
      .populate('author', 'name role avatar')
      .sort({ 'likes': -1, 'viewCount': -1 })
      .limit(5);
    
    console.log('\n🔥 Railway DB 인기 게시글 TOP 5:');
    popularPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title} (좋아요: ${post.likes?.length || 0}, 조회: ${post.viewCount || 0})`);
    });
    
    // 전체 통계
    const totalViews = await CommunityPost.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);
    
    const totalLikes = await CommunityPost.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalLikes: { $sum: { $size: '$likes' } } } }
    ]);
    
    const totalComments = await CommunityPost.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalComments: { $sum: { $size: '$comments' } } } }
    ]);
    
    console.log('\n📊 Railway DB 전체 통계:');
    console.log(`   총 조회수: ${totalViews[0]?.totalViews || 0}회`);
    console.log(`   총 좋아요: ${totalLikes[0]?.totalLikes || 0}개`);
    console.log(`   총 댓글: ${totalComments[0]?.totalComments || 0}개`);
    
    await mongoose.disconnect();
    console.log('\n✅ Railway 데이터베이스 연결 종료');
    
  } catch (error) {
    console.error('❌ Railway 데이터베이스 연결 실패:', error.message);
    console.error('스택:', error.stack);
    process.exit(1);
  }
}

// 스크립트 실행
checkRailwayPosts();
