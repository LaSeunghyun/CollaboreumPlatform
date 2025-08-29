const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');

dotenv.config();

const connectDB = require('../config/database');

const seedSimpleData = async () => {
  try {
    // 데이터베이스 연결
    await connectDB();

    // 기존 카테고리 데이터 삭제
    await Category.deleteMany({});

    console.log('기존 카테고리 데이터 삭제 완료');

    // 카테고리 데이터 추가
    const categories = [
      { id: 'music', label: '음악', icon: '🎵', order: 1, isActive: true },
      { id: 'art', label: '미술', icon: '🎨', order: 2, isActive: true },
      { id: 'literature', label: '문학', icon: '📚', order: 3, isActive: true },
      { id: 'performance', label: '공연', icon: '🎭', order: 4, isActive: true },
      { id: 'photo', label: '사진', icon: '📸', order: 5, isActive: true }
    ];

    await Category.insertMany(categories);
    console.log('카테고리 데이터 추가 완료');

    console.log('간단한 시드 데이터 추가 완료!');
    process.exit(0);

  } catch (error) {
    console.error('시드 데이터 추가 실패:', error);
    process.exit(1);
  }
};

seedSimpleData();
