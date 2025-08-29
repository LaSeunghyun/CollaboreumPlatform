const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const authMiddleware = require('../middleware/auth');

// 모든 이벤트 조회
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    
    // 쿼리 조건 구성
    const query = { isActive: true };
    if (category && category !== '전체') {
      query.category = category;
    }
    if (search) {
      query.$text = { $search: search };
    }
    
    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 이벤트 조회
    const events = await Event.find(query)
      .populate('createdBy', 'name')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // 전체 개수 조회
    const total = await Event.countDocuments(query);
    
    // 응답 데이터 가공
    const formattedEvents = events.map(event => ({
      id: event._id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      time: event.time,
      location: event.location,
      category: event.category,
      currentAttendees: event.currentAttendees,
      maxAttendees: event.maxAttendees,
      status: event.status,
      image: event.image,
      tags: event.tags
    }));

    res.json({
      success: true,
      data: formattedEvents,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalEvents: total
      }
    });
  } catch (error) {
    console.error('이벤트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 조회 중 오류가 발생했습니다.'
    });
  }
});

// 관리자 이벤트 생성 (관리자 권한 필요)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '이벤트 생성 권한이 없습니다.'
      });
    }
    
    const {
      title,
      description,
      category,
      startDate,
      endDate,
      time,
      location,
      address,
      maxAttendees,
      tickets,
      performers,
      tags
    } = req.body;
    
    // 필수 필드 검증
    if (!title || !description || !category || !startDate || !endDate || !time || !location || !maxAttendees) {
      return res.status(400).json({
        success: false,
        message: '필수 필드를 모두 입력해주세요.'
      });
    }
    
    // 날짜 유효성 검증
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    if (start < now) {
      return res.status(400).json({
        success: false,
        message: '시작일은 현재 날짜 이후여야 합니다.'
      });
    }
    
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: '종료일은 시작일 이후여야 합니다.'
      });
    }
    
    // 새 이벤트 생성
    const newEvent = new Event({
      title,
      description,
      category,
      startDate: start,
      endDate: end,
      time,
      location,
      address,
      maxAttendees: parseInt(maxAttendees),
      tickets: tickets || [],
      performers: performers || [],
      tags: tags || [],
      createdBy: req.user.id
    });
    
    await newEvent.save();
    
    // 생성된 이벤트 반환
    const savedEvent = await Event.findById(newEvent._id)
      .populate('createdBy', 'name')
      .lean();
    
    res.status(201).json({
      success: true,
      message: '이벤트가 성공적으로 생성되었습니다.',
      data: {
        id: savedEvent._id,
        title: savedEvent.title,
        description: savedEvent.description,
        category: savedEvent.category,
        startDate: savedEvent.startDate,
        endDate: savedEvent.endDate,
        time: savedEvent.time,
        location: savedEvent.location,
        status: savedEvent.status
      }
    });
    
  } catch (error) {
    console.error('이벤트 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 생성 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
