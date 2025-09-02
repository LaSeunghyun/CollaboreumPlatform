const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');

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

// 알림 데이터 생성
const createNotifications = async () => {
  try {
    // 기존 알림 삭제
    await Notification.deleteMany({});
    console.log('🗑️ 기존 알림 삭제 완료');

    // 사용자 조회
    const users = await User.find({ role: { $in: ['artist', 'fan'] } }).limit(5);
    
    if (users.length === 0) {
      console.log('⚠️ 알림을 생성할 사용자가 없습니다. 먼저 사용자를 생성해주세요.');
      return;
    }

    const notifications = [];
    
    // 각 사용자별로 다양한 알림 생성
    users.forEach((user, userIndex) => {
      const userNotifications = [
        {
          user: user._id,
          type: 'funding',
          title: '새로운 펀딩 프로젝트가 시작되었습니다',
          message: '새로운 아티스트의 프로젝트가 시작되었습니다. 지금 확인해보세요!',
          read: false,
          url: '/funding/projects',
          data: { projectId: 'sample-project-1' },
          createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30분 전
        },
        {
          user: user._id,
          type: 'event',
          title: '라이브 스트리밍 알림',
          message: '내일 오후 7시 라이브 스트리밍이 예정되어 있습니다.',
          read: false,
          url: '/events',
          data: { eventId: 'sample-event-1' },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2시간 전
        },
        {
          user: user._id,
          type: 'point',
          title: '포인트 적립',
          message: '펀딩 참여로 100포인트가 적립되었습니다.',
          read: true,
          url: '/mypage',
          data: { points: 100, reason: 'funding_participation' },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1일 전
        },
        {
          user: user._id,
          type: 'follow',
          title: '새로운 팔로워',
          message: '새로운 사용자가 당신을 팔로우했습니다.',
          read: false,
          url: '/mypage',
          data: { followerId: 'sample-follower-1' },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6시간 전
        },
        {
          user: user._id,
          type: 'project',
          title: '프로젝트 업데이트',
          message: '팔로우하는 아티스트의 프로젝트가 업데이트되었습니다.',
          read: true,
          url: '/projects',
          data: { projectId: 'sample-project-2' },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12) // 12시간 전
        }
      ];
      
      notifications.push(...userNotifications);
    });

    const createdNotifications = await Notification.insertMany(notifications);
    console.log('🔔 알림 생성 완료');
    console.log(`생성된 알림: ${createdNotifications.length}개`);
    console.log(`사용자별 알림: ${Math.floor(createdNotifications.length / users.length)}개`);
    
    return createdNotifications;
  } catch (error) {
    console.error('❌ 알림 생성 실패:', error);
    throw error;
  }
};

// 메인 실행 함수
const seedNotifications = async () => {
  try {
    await connectDB();
    await createNotifications();
    
    console.log('🎉 알림 시드 완료!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 알림 시드 실패:', error);
    process.exit(1);
  }
};

// 스크립트 실행
if (require.main === module) {
  seedNotifications();
}

module.exports = { seedNotifications };
