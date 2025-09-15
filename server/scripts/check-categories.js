const mongoose = require('mongoose');
const CommunityPost = require('../models/CommunityPost');
require('dotenv').config();

const checkCategories = async () => {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboreum');
    console.log('MongoDB에 연결되었습니다.');

    // 모든 게시글의 카테고리 확인
    const posts = await CommunityPost.find({}, 'title category');
    console.log(`총 게시글 수: ${posts.length}`);
    
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
        console.log(`- ID: ${post._id}, 제목: ${post.title}, 카테고리: ${post.category}`);
      });
    }

  } catch (error) {
    console.error('오류가 발생했습니다:', error);
  } finally {
    // MongoDB 연결 종료
    await mongoose.connection.close();
    console.log('MongoDB 연결이 종료되었습니다.');
  }
};

// 스크립트 실행
checkCategories();
