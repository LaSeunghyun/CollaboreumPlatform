const mongoose = require('mongoose');
const CommunityPost = require('../models/CommunityPost');
require('dotenv').config();

const checkAllPosts = async () => {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboreum');
    console.log('MongoDB에 연결되었습니다.');

    // 모든 게시글 조회 (isActive 상관없이)
    const posts = await CommunityPost.find({}, 'title category authorName createdAt isActive');
    console.log(`총 게시글 수: ${posts.length}`);
    
    if (posts.length === 0) {
      console.log('게시글이 없습니다.');
      return;
    }

    // 카테고리별 개수 확인
    const categoryCount = {};
    posts.forEach(post => {
      const category = post.category || 'undefined';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    console.log('\n카테고리별 게시글 수:');
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`- ${category}: ${count}개`);
    });

    // 'review' 카테고리 게시글 상세 확인
    const reviewPosts = await CommunityPost.find({ category: 'review' });
    if (reviewPosts.length > 0) {
      console.log('\n"review" 카테고리 게시글:');
      reviewPosts.forEach(post => {
        console.log(`- ID: ${post._id}, 제목: ${post.title}, 카테고리: ${post.category}, 활성: ${post.isActive}`);
      });
    }

    // 최근 게시글 5개 확인
    console.log('\n최근 게시글 5개:');
    const recentPosts = await CommunityPost.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category authorName createdAt isActive');
    
    recentPosts.forEach((post, index) => {
      console.log(`${index + 1}. 제목: ${post.title}, 카테고리: ${post.category}, 작성자: ${post.authorName}, 활성: ${post.isActive}`);
    });

  } catch (error) {
    console.error('오류가 발생했습니다:', error);
  } finally {
    // MongoDB 연결 종료
    await mongoose.connection.close();
    console.log('MongoDB 연결이 종료되었습니다.');
  }
};

// 스크립트 실행
checkAllPosts();
