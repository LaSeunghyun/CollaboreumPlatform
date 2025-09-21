const mongoose = require('mongoose');
const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');
require('dotenv').config();

const createTestPosts = async () => {
  try {
    // MongoDB 연결
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboreum',
    );
    console.log('MongoDB에 연결되었습니다.');

    // 테스트 사용자 찾기 또는 생성
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = new User({
        name: '테스트 사용자',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'fan',
      });
      await testUser.save();
      console.log('테스트 사용자가 생성되었습니다.');
    }

    // 기존 테스트 게시글 삭제
    await CommunityPost.deleteMany({ authorName: '테스트 사용자' });
    console.log('기존 테스트 게시글을 삭제했습니다.');

    // 테스트 게시글 생성
    const testPosts = [
      {
        title: '테스트 게시글 1',
        content: '이것은 첫 번째 테스트 게시글입니다.',
        category: '자유',
        author: testUser._id,
        authorName: '테스트 사용자',
        tags: ['테스트', '자유'],
        isActive: true,
      },
      {
        title: '테스트 게시글 2',
        content: '이것은 두 번째 테스트 게시글입니다.',
        category: '질문',
        author: testUser._id,
        authorName: '테스트 사용자',
        tags: ['테스트', '질문'],
        isActive: true,
      },
      {
        title: '테스트 게시글 3',
        content: '이것은 세 번째 테스트 게시글입니다.',
        category: '음악',
        author: testUser._id,
        authorName: '테스트 사용자',
        tags: ['테스트', '음악'],
        isActive: true,
      },
    ];

    const createdPosts = await CommunityPost.insertMany(testPosts);
    console.log(
      `✅ ${createdPosts.length}개의 테스트 게시글이 생성되었습니다.`,
    );

    // 생성된 게시글 확인
    const allPosts = await CommunityPost.find(
      {},
      'title category authorName createdAt isActive',
    );
    console.log(`\n총 게시글 수: ${allPosts.length}`);

    allPosts.forEach((post, index) => {
      console.log(
        `${index + 1}. 제목: ${post.title}, 카테고리: ${post.category}, 작성자: ${post.authorName}, 활성: ${post.isActive}`,
      );
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
createTestPosts();
