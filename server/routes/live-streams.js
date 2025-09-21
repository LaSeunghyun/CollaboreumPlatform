const express = require('express');
const router = express.Router();
const LiveStream = require('../models/LiveStream');
const auth = require('../middleware/auth');

// 라이브 스트림 목록 조회
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

    // 라이브 스트림 조회
    const liveStreams = await LiveStream.find(query)
      .populate('artist', 'name')
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // 전체 개수 조회
    const total = await LiveStream.countDocuments(query);

    // 응답 데이터 가공
    const formattedStreams = liveStreams.map(stream => ({
      id: stream._id,
      title: stream.title,
      artist: stream.artist?.name || stream.artistName,
      description: stream.description,
      thumbnail: stream.thumbnail,
      viewerCount: stream.viewerCount,
      isLive: stream.isLive,
      startedAt: stream.startedAt,
      category: stream.category,
      status: stream.status,
    }));

    res.json({
      success: true,
      data: formattedStreams,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalStreams: total,
      },
    });
  } catch (error) {
    console.error('라이브 스트림 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '라이브 스트림 조회 중 오류가 발생했습니다.',
    });
  }
});

// 예정된 스트림 조회
router.get('/scheduled', async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;

    // 쿼리 조건 구성
    const query = {
      isActive: true,
      status: 'scheduled',
      scheduledAt: { $gte: new Date() },
    };
    if (category && category !== '전체') {
      query.category = category;
    }

    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 예정된 스트림 조회
    const scheduledStreams = await LiveStream.find(query)
      .populate('artist', 'name')
      .sort({ scheduledAt: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // 전체 개수 조회
    const total = await LiveStream.countDocuments(query);

    // 응답 데이터 가공
    const formattedStreams = scheduledStreams.map(stream => ({
      id: stream._id,
      title: stream.title,
      artist: stream.artist?.name || stream.artistName,
      description: stream.description,
      thumbnail: stream.thumbnail,
      scheduledAt: stream.scheduledAt,
      category: stream.category,
      expectedDuration: stream.expectedDuration || 60,
      maxViewers: stream.maxViewers,
    }));

    res.json({
      success: true,
      data: formattedStreams,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalStreams: total,
      },
    });
  } catch (error) {
    console.error('예정된 스트림 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '예정된 스트림 조회 중 오류가 발생했습니다.',
    });
  }
});

module.exports = router;
