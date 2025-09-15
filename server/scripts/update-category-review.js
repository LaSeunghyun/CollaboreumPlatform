const mongoose = require('mongoose');
const CommunityPost = require('../models/CommunityPost');
require('dotenv').config();

const updateCategoryReview = async () => {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboreum');
    console.log('MongoDB에 연결되었습니다.');

    // 'review' 카테고리를 가진 게시글 찾기
    const postsWithReview = await CommunityPost.find({ category: 'review' });
    console.log(`'review' 카테고리를 가진 게시글 수: ${postsWithReview.length}`);

    if (postsWithReview.length === 0) {
      console.log('업데이트할 게시글이 없습니다.');
      return;
    }

    // 각 게시글의 카테고리를 '자유'로 변경
    const updateResult = await CommunityPost.updateMany(
      { category: 'review' },
      { $set: { category: '자유' } }
    );

    console.log(`✅ ${updateResult.modifiedCount}개의 게시글 카테고리가 'review'에서 '자유'로 변경되었습니다.`);

    // 변경된 게시글 확인
    const updatedPosts = await CommunityPost.find({ category: '자유' });
    console.log(`현재 '자유' 카테고리 게시글 수: ${updatedPosts.length}`);

  } catch (error) {
    console.error('오류가 발생했습니다:', error);
  } finally {
    // MongoDB 연결 종료
    await mongoose.connection.close();
    console.log('MongoDB 연결이 종료되었습니다.');
  }
};

// 스크립트 실행
updateCategoryReview();
