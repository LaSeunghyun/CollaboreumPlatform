const mongoose = require('mongoose');
const CommunityPost = require('./models/CommunityPost');

async function checkPosts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboreum');
    console.log('MongoDB 연결됨');
    
    const posts = await CommunityPost.find({}).sort({ createdAt: -1 }).limit(5);
    console.log('최근 5개 게시글:');
    console.log(JSON.stringify(posts, null, 2));
    
    const totalCount = await CommunityPost.countDocuments();
    console.log('전체 게시글 수:', totalCount);
    
    // isActive가 true인 게시글만 조회
    const activePosts = await CommunityPost.find({ isActive: true }).sort({ createdAt: -1 }).limit(5);
    console.log('활성 게시글 수:', activePosts.length);
    
    process.exit(0);
  } catch (error) {
    console.error('오류:', error);
    process.exit(1);
  }
}

checkPosts();
