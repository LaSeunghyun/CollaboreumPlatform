const mongoose = require('mongoose');
const Category = require('../models/Category');

// 데이터베이스 연결
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboreum');
    console.log('✅ MongoDB 연결 성공');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    process.exit(1);
  }
};

// 카테고리 데이터 생성
const createCategories = async () => {
  try {
    // 기존 카테고리 삭제
    await Category.deleteMany({});
    console.log('🗑️ 기존 카테고리 삭제 완료');

    const categories = [
      {
        id: 'music',
        label: '음악',
        icon: '🎵',
        order: 1,
        isActive: true
      },
      {
        id: 'art',
        label: '미술',
        icon: '🎨',
        order: 2,
        isActive: true
      },
      {
        id: 'literature',
        label: '문학',
        icon: '📚',
        order: 3,
        isActive: true
      },
      {
        id: 'performance',
        label: '공연',
        icon: '🎭',
        order: 4,
        isActive: true
      },
      {
        id: 'photo',
        label: '사진',
        icon: '📸',
        order: 5,
        isActive: true
      },
      {
        id: 'video',
        label: '영상',
        icon: '🎬',
        order: 6,
        isActive: true
      },
      {
        id: 'design',
        label: '디자인',
        icon: '🎨',
        order: 7,
        isActive: true
      },
      {
        id: 'craft',
        label: '공예',
        icon: '🛠️',
        order: 8,
        isActive: true
      },
      {
        id: 'other',
        label: '기타',
        icon: '🌟',
        order: 9,
        isActive: true
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('📂 카테고리 생성 완료');
    console.log(`생성된 카테고리: ${createdCategories.length}개`);
    
    createdCategories.forEach(category => {
      console.log(`  - ${category.icon} ${category.label} (${category.id})`);
    });

    return createdCategories;
  } catch (error) {
    console.error('❌ 카테고리 생성 실패:', error);
    throw error;
  }
};

// 메인 실행 함수
const seedCategories = async () => {
  try {
    await connectDB();
    await createCategories();
    
    console.log('🎉 카테고리 시드 완료!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 카테고리 시드 실패:', error);
    process.exit(1);
  }
};

// 스크립트 실행
if (require.main === module) {
  seedCategories();
}

module.exports = { seedCategories };
