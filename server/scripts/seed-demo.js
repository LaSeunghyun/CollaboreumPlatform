const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FundingProject = require('../models/FundingProject');
const CommunityPost = require('../models/CommunityPost');
const Event = require('../models/Event');
const Category = require('../models/Category');

dotenv.config();

const connectDB = require('../config/database');

const seedDemoData = async () => {
  try {
    // 데이터베이스 연결
    await connectDB();

    // 기존 데이터 삭제
    await FundingProject.deleteMany({});
    await CommunityPost.deleteMany({});
    await Event.deleteMany({});
    await Category.deleteMany({});

    console.log('기존 데이터 삭제 완료');
    // 카테고리 데이터 추가
    const categories = [
      { id: 'music', label: '음악', icon: '🎵', order: 1, isActive: true },
      { id: 'art', label: '미술', icon: '🎨', order: 2, isActive: true },
      { id: 'literature', label: '문학', icon: '📚', order: 3, isActive: true },
      {
        id: 'performance',
        label: '공연',
        icon: '🎭',
        order: 4,
        isActive: true,
      },
      { id: 'photo', label: '사진', icon: '📸', order: 5, isActive: true },
    ];

    await Category.insertMany(categories);
    console.log('카테고리 데이터 추가 완료');

    // 간단한 펀딩 프로젝트 데이터 추가
    const fundingProjects = [
      {
        title: '인디 뮤지션의 첫 번째 앨범',
        description:
          '10년간 거리에서 공연해온 인디 뮤지션의 첫 번째 정규 앨범 제작 프로젝트입니다.',
        artist: new mongoose.Types.ObjectId(),
        artistName: '김아티스트',
        category: '음악',
        goalAmount: 5000000,
        currentAmount: 3200000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        status: '진행중',
        isActive: true,
        image: 'https://picsum.photos/400/300?random=1',
        tags: ['인디', '포크', '감성'],
        executionPlan: {
          stages: [
            {
              name: '녹음 및 믹싱',
              description: '전문 스튜디오에서 앨범 녹음 및 믹싱 작업',
              budget: 2000000,
              startDate: new Date('2024-01-15'),
              endDate: new Date('2024-02-15'),
              status: '진행중',
              progress: 60,
            },
          ],
          totalBudget: 5000000,
        },
        daysLeft: 45,
        progress: 64,
        rewards: [
          {
            title: '디지털 앨범',
            description: 'MP3 디지털 앨범 + 감사 메시지',
            amount: 10000,
            claimed: 50,
          },
        ],
        updates: [
          {
            title: '녹음 진행 상황',
            content: '첫 번째 곡 녹음이 완료되었습니다!',
            createdAt: new Date('2024-01-15'),
            type: '일반',
          },
        ],
      },
    ];

    await FundingProject.insertMany(fundingProjects);
    console.log('펀딩 프로젝트 데이터 추가 완료');

    // 커뮤니티 포스트 데이터 추가
    const communityPosts = [
      {
        title: '첫 번째 공연 후기',
        content:
          '어제 홍대에서 첫 번째 공연을 마쳤습니다. 많은 분들이 와주셔서 감사했어요!',
        author: new mongoose.Types.ObjectId(),
        category: '음악',
        likes: 24,
        views: 156,
        commentCount: 8,
        isActive: true,
        tags: ['공연', '홍대', '감사'],
        createdAt: new Date('2024-01-10'),
      },
    ];

    await CommunityPost.insertMany(communityPosts);
    console.log('커뮤니티 포스트 데이터 추가 완료');

    // 이벤트 데이터 추가
    const events = [
      {
        title: '아티스트와 함께하는 팬미팅',
        description: '인디 뮤지션들과 함께하는 소규모 팬미팅 이벤트입니다.',
        category: '음악',
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-03-15'),
        time: '19:00',
        location: '홍대 클럽 FF',
        address: '서울시 마포구 홍익로',
        currentAttendees: 25,
        maxAttendees: 50,
        status: 'upcoming',
        isActive: true,
        image: 'https://picsum.photos/400/300?random=3',
        tags: ['팬미팅', '홍대', '인디음악'],
        createdBy: new mongoose.Types.ObjectId(),
      },
    ];

    await Event.insertMany(events);
    console.log('이벤트 데이터 추가 완료');

    console.log('모든 데모 데이터 추가 완료!');
    process.exit(0);
  } catch (error) {
    console.error('데모 데이터 추가 실패:', error);
    process.exit(1);
  }
};

seedDemoData();
