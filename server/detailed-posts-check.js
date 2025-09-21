const mongoose = require('mongoose');
const CommunityPost = require('./models/CommunityPost');

async function checkDetailedPosts() {
  try {
    // MongoDB 연결
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboreum';
    await mongoose.connect(mongoUri);
    console.log('✅ 데이터베이스 연결 성공');

    // 모든 게시글 상세 조회
    const allPosts = await CommunityPost.find({ isActive: true })
      .populate('author', 'name role avatar email')
      .sort({ createdAt: -1 });

    console.log(`📊 총 ${allPosts.length}개의 활성 게시글 발견\n`);

    allPosts.forEach((post, index) => {
      console.log(`📝 게시글 ${index + 1}:`);
      console.log('='.repeat(60));
      console.log(`제목: ${post.title}`);
      console.log(`ID: ${post._id}`);
      console.log(
        `작성자: ${post.author?.name || post.authorName || 'Unknown'}`,
      );
      console.log(`작성자 ID: ${post.author?._id || 'N/A'}`);
      console.log(`작성자 역할: ${post.author?.role || 'N/A'}`);
      console.log(`카테고리: ${post.category}`);
      console.log(
        `내용: ${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}`,
      );
      console.log(`태그: ${post.tags?.join(', ') || '없음'}`);
      console.log(`이미지: ${post.images?.length || 0}개`);
      console.log(`조회수: ${post.viewCount || 0}`);
      console.log(`좋아요: ${post.likes?.length || 0}개`);
      console.log(`싫어요: ${post.dislikes?.length || 0}개`);
      console.log(`댓글: ${post.comments?.length || 0}개`);
      console.log(`신고: ${post.reports?.length || 0}개`);
      console.log(`상태: ${post.isActive ? '활성' : '비활성'}`);
      console.log(`신고됨: ${post.isReported ? '예' : '아니오'}`);
      console.log(`작성일: ${post.createdAt}`);
      console.log(`수정일: ${post.updatedAt}`);
      console.log(`삭제일: ${post.deletedAt || '없음'}`);

      // 댓글 상세 정보
      if (post.comments && post.comments.length > 0) {
        console.log('\n💬 댓글 목록:');
        post.comments.forEach((comment, commentIndex) => {
          console.log(
            `  ${commentIndex + 1}. ${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''}`,
          );
          console.log(
            `     작성자: ${comment.author?.name || comment.authorName || 'Unknown'}`,
          );
          console.log(`     작성일: ${comment.createdAt}`);
          console.log(`     좋아요: ${comment.likes?.length || 0}개`);
          console.log(`     싫어요: ${comment.dislikes?.length || 0}개`);
          console.log(`     대댓글: ${comment.replies?.length || 0}개`);
        });
      }

      console.log('\n' + '='.repeat(80) + '\n');
    });

    // 통계 정보
    console.log('📈 상세 통계:');
    console.log(`- 총 게시글: ${allPosts.length}개`);
    console.log(
      `- 총 조회수: ${allPosts.reduce((sum, post) => sum + (post.viewCount || 0), 0)}회`,
    );
    console.log(
      `- 총 좋아요: ${allPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0)}개`,
    );
    console.log(
      `- 총 댓글: ${allPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)}개`,
    );
    console.log(
      `- 총 신고: ${allPosts.reduce((sum, post) => sum + (post.reports?.length || 0), 0)}개`,
    );

    // 카테고리별 상세 통계
    const categoryStats = {};
    allPosts.forEach(post => {
      categoryStats[post.category] = (categoryStats[post.category] || 0) + 1;
    });

    console.log('\n📊 카테고리별 상세 통계:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`- ${category}: ${count}개`);
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
checkDetailedPosts();
