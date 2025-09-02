const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// 임시 알림 데이터 (실제로는 데이터베이스에서 가져와야 함)
const mockNotifications = [
  {
    id: '1',
    type: 'funding',
    title: '새로운 펀딩 프로젝트가 시작되었습니다',
    message: '라승현의 새 앨범 프로젝트가 시작되었습니다.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30분 전
    url: '/funding/projects'
  },
  {
    id: '2',
    type: 'event',
    title: '이벤트 알림',
    message: '내일 오후 7시 라이브 스트리밍이 예정되어 있습니다.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2시간 전
    url: '/events'
  },
  {
    id: '3',
    type: 'point',
    title: '포인트 적립',
    message: '펀딩 참여로 100포인트가 적립되었습니다.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1일 전
    url: '/mypage'
  }
];

// 알림 목록 조회
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 10, read } = req.query;
    
    let filteredNotifications = [...mockNotifications];
    
    // 읽음 상태 필터링
    if (read !== undefined) {
      const isRead = read === 'true';
      filteredNotifications = filteredNotifications.filter(notif => notif.read === isRead);
    }
    
    // 최신순 정렬
    filteredNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 개수 제한
    if (limit) {
      filteredNotifications = filteredNotifications.slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      data: filteredNotifications,
      total: mockNotifications.length,
      unreadCount: mockNotifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error('알림 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '알림을 불러오는데 실패했습니다.'
    });
  }
});

// 알림 읽음 처리
router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 실제로는 데이터베이스에서 업데이트해야 함
    const notification = mockNotifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
    
    res.json({
      success: true,
      message: '알림을 읽음 처리했습니다.'
    });
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error);
    res.status(500).json({
      success: false,
      message: '알림 읽음 처리에 실패했습니다.'
    });
  }
});

// 모든 알림 읽음 처리
router.put('/read-all', auth, async (req, res) => {
  try {
    // 실제로는 데이터베이스에서 업데이트해야 함
    mockNotifications.forEach(notification => {
      notification.read = true;
    });
    
    res.json({
      success: true,
      message: '모든 알림을 읽음 처리했습니다.'
    });
  } catch (error) {
    console.error('모든 알림 읽음 처리 실패:', error);
    res.status(500).json({
      success: false,
      message: '모든 알림 읽음 처리에 실패했습니다.'
    });
  }
});

// 알림 삭제
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 실제로는 데이터베이스에서 삭제해야 함
    const index = mockNotifications.findIndex(n => n.id === id);
    if (index > -1) {
      mockNotifications.splice(index, 1);
    }
    
    res.json({
      success: true,
      message: '알림을 삭제했습니다.'
    });
  } catch (error) {
    console.error('알림 삭제 실패:', error);
    res.status(500).json({
      success: false,
      message: '알림 삭제에 실패했습니다.'
    });
  }
});

module.exports = router;
