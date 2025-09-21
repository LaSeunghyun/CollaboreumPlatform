const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// 알림 생성 헬퍼 함수
const createNotification = async (
  userId,
  type,
  title,
  message,
  url = null,
  data = {},
) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      url,
      data,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('알림 생성 실패:', error);
    throw error;
  }
};

// 알림 목록 조회
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 10, read, page = 1 } = req.query;
    const userId = req.user.id;

    // 쿼리 조건 구성
    const query = { user: userId, isActive: true };

    // 읽음 상태 필터링
    if (read !== undefined) {
      query.read = read === 'true';
    }

    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 알림 조회
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({
        user: userId,
        read: false,
        isActive: true,
      }),
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      unreadCount,
    });
  } catch (error) {
    console.error('알림 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '알림을 불러오는데 실패했습니다.',
    });
  }
});

// 알림 읽음 처리
router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: '알림을 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      message: '알림을 읽음 처리했습니다.',
    });
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error);
    res.status(500).json({
      success: false,
      message: '알림 읽음 처리에 실패했습니다.',
    });
  }
});

// 모든 알림 읽음 처리
router.put('/read-all', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { user: userId, read: false, isActive: true },
      { read: true },
    );

    res.json({
      success: true,
      message: '모든 알림을 읽음 처리했습니다.',
    });
  } catch (error) {
    console.error('모든 알림 읽음 처리 실패:', error);
    res.status(500).json({
      success: false,
      message: '모든 알림 읽음 처리에 실패했습니다.',
    });
  }
});

// 알림 삭제
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { isActive: false },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: '알림을 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      message: '알림을 삭제했습니다.',
    });
  } catch (error) {
    console.error('알림 삭제 실패:', error);
    res.status(500).json({
      success: false,
      message: '알림 삭제에 실패했습니다.',
    });
  }
});

// 알림 생성 (관리자용 또는 시스템용)
router.post('/', auth, async (req, res) => {
  try {
    const { userId, type, title, message, url, data } = req.body;

    // 관리자만 알림 생성 가능하도록 제한 (선택사항)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 알림을 생성할 수 있습니다.',
      });
    }

    const notification = await createNotification(
      userId,
      type,
      title,
      message,
      url,
      data,
    );

    res.status(201).json({
      success: true,
      data: notification,
      message: '알림이 생성되었습니다.',
    });
  } catch (error) {
    console.error('알림 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: '알림 생성에 실패했습니다.',
    });
  }
});

// 헬퍼 함수를 모듈로 내보내기
module.exports = { router, createNotification };
