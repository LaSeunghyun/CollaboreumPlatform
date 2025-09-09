const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

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
router.post('/', auth, async (req, res) => {
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

// 특정 이벤트 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id)
      .populate('createdBy', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: '이벤트를 찾을 수 없습니다.'
      });
    }

    if (!event.isActive) {
      return res.status(404).json({
        success: false,
        message: '삭제된 이벤트입니다.'
      });
    }

    // 조회수 증가
    await Event.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: {
        id: event._id,
        title: event.title,
        description: event.description,
        category: event.category,
        startDate: event.startDate,
        endDate: event.endDate,
        time: event.time,
        location: event.location,
        address: event.address,
        currentAttendees: event.currentAttendees,
        maxAttendees: event.maxAttendees,
        status: event.status,
        image: event.image,
        tags: event.tags,
        tickets: event.tickets,
        performers: event.performers,
        createdBy: event.createdBy,
        participants: event.participants,
        views: (event.views || 0) + 1,
        likes: event.likes || 0,
        bookmarks: event.bookmarks || 0,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      }
    });
  } catch (error) {
    console.error('이벤트 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 상세 조회 중 오류가 발생했습니다.'
    });
  }
});

// 이벤트 수정 (관리자용)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 관리자 권한 확인
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '이벤트 수정 권한이 없습니다.'
      });
    }

    const updateData = req.body;
    
    // 업데이트 가능한 필드들
    const allowedFields = [
      'title', 'description', 'category', 'startDate', 'endDate', 
      'time', 'location', 'address', 'maxAttendees', 'tickets', 
      'performers', 'tags', 'image'
    ];

    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { ...filteredData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email avatar');

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: '이벤트를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '이벤트가 성공적으로 수정되었습니다.',
      data: updatedEvent
    });

  } catch (error) {
    console.error('이벤트 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 수정 중 오류가 발생했습니다.'
    });
  }
});

// 이벤트 삭제 (관리자용)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 관리자 권한 확인
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '이벤트 삭제 권한이 없습니다.'
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: '이벤트를 찾을 수 없습니다.'
      });
    }

    // 실제 삭제 대신 비활성화
    event.isActive = false;
    event.deletedAt = new Date();
    await event.save();

    res.json({
      success: true,
      message: '이벤트가 삭제되었습니다.'
    });

  } catch (error) {
    console.error('이벤트 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 삭제 중 오류가 발생했습니다.'
    });
  }
});

// 이벤트 참가
router.post('/:id/join', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const event = await Event.findById(id);
    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: '이벤트를 찾을 수 없습니다.'
      });
    }

    // 이미 참가했는지 확인
    const existingParticipant = event.participants.find(
      p => p.user.toString() === userId
    );

    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: '이미 참가한 이벤트입니다.'
      });
    }

    // 정원 확인
    if (event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({
        success: false,
        message: '이벤트 정원이 마감되었습니다.'
      });
    }

    // 참가자 추가
    event.participants.push({
      user: userId,
      joinedAt: new Date(),
      status: 'confirmed'
    });
    event.currentAttendees += 1;

    await event.save();

    res.json({
      success: true,
      message: '이벤트 참가가 완료되었습니다.',
      data: {
        currentAttendees: event.currentAttendees,
        maxAttendees: event.maxAttendees
      }
    });

  } catch (error) {
    console.error('이벤트 참가 오류:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 참가 중 오류가 발생했습니다.'
    });
  }
});

// 이벤트 참가 취소
router.delete('/:id/leave', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const event = await Event.findById(id);
    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: '이벤트를 찾을 수 없습니다.'
      });
    }

    // 참가자 찾기
    const participantIndex = event.participants.findIndex(
      p => p.user.toString() === userId
    );

    if (participantIndex === -1) {
      return res.status(400).json({
        success: false,
        message: '참가하지 않은 이벤트입니다.'
      });
    }

    // 참가자 제거
    event.participants.splice(participantIndex, 1);
    event.currentAttendees -= 1;

    await event.save();

    res.json({
      success: true,
      message: '이벤트 참가가 취소되었습니다.',
      data: {
        currentAttendees: event.currentAttendees,
        maxAttendees: event.maxAttendees
      }
    });

  } catch (error) {
    console.error('이벤트 참가 취소 오류:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 참가 취소 중 오류가 발생했습니다.'
    });
  }
});

// 이벤트 참가자 목록 조회
router.get('/:id/participants', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    
    const event = await Event.findById(id)
      .populate('participants.user', 'name email avatar')
      .lean();

    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: '이벤트를 찾을 수 없습니다.'
      });
    }

    // 상태별 필터링
    let participants = event.participants;
    if (status) {
      participants = participants.filter(p => p.status === status);
    }

    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedParticipants = participants.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginatedParticipants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: participants.length,
        pages: Math.ceil(participants.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('이벤트 참가자 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 참가자 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// 이벤트 좋아요
router.post('/:id/like', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const event = await Event.findById(id);
    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: '이벤트를 찾을 수 없습니다.'
      });
    }

    // 좋아요 토글
    const likeIndex = event.likedBy ? event.likedBy.indexOf(userId) : -1;
    
    if (likeIndex === -1) {
      // 좋아요 추가
      if (!event.likedBy) event.likedBy = [];
      event.likedBy.push(userId);
      event.likes = (event.likes || 0) + 1;
    } else {
      // 좋아요 제거
      event.likedBy.splice(likeIndex, 1);
      event.likes = Math.max((event.likes || 0) - 1, 0);
    }

    await event.save();

    res.json({
      success: true,
      message: likeIndex === -1 ? '이벤트를 좋아요했습니다.' : '이벤트 좋아요를 취소했습니다.',
      data: {
        likes: event.likes,
        isLiked: likeIndex === -1
      }
    });

  } catch (error) {
    console.error('이벤트 좋아요 오류:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 좋아요 처리 중 오류가 발생했습니다.'
    });
  }
});

// 이벤트 북마크
router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const event = await Event.findById(id);
    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: '이벤트를 찾을 수 없습니다.'
      });
    }

    // 북마크 토글
    const bookmarkIndex = event.bookmarkedBy ? event.bookmarkedBy.indexOf(userId) : -1;
    
    if (bookmarkIndex === -1) {
      // 북마크 추가
      if (!event.bookmarkedBy) event.bookmarkedBy = [];
      event.bookmarkedBy.push(userId);
      event.bookmarks = (event.bookmarks || 0) + 1;
    } else {
      // 북마크 제거
      event.bookmarkedBy.splice(bookmarkIndex, 1);
      event.bookmarks = Math.max((event.bookmarks || 0) - 1, 0);
    }

    await event.save();

    res.json({
      success: true,
      message: bookmarkIndex === -1 ? '이벤트를 북마크했습니다.' : '이벤트 북마크를 취소했습니다.',
      data: {
        bookmarks: event.bookmarks,
        isBookmarked: bookmarkIndex === -1
      }
    });

  } catch (error) {
    console.error('이벤트 북마크 오류:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 북마크 처리 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
