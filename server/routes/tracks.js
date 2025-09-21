const express = require('express');
const router = express.Router();
const Track = require('../models/Track');
const auth = require('../middleware/auth');

// 모든 트랙 조회
router.get('/', async (req, res) => {
  try {
    const { genre, search, page = 1, limit = 20 } = req.query;

    // 쿼리 조건 구성
    const query = { isActive: true };
    if (genre && genre !== '전체') {
      query.genre = genre;
    }
    if (search) {
      query.$text = { $search: search };
    }

    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 트랙 조회
    const tracks = await Track.find(query)
      .populate('artist', 'name')
      .sort({ releaseDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // 전체 개수 조회
    const total = await Track.countDocuments(query);

    // 응답 데이터 가공
    const formattedTracks = tracks.map(track => ({
      id: track._id,
      title: track.title,
      artist: track.artist?.name || track.artistName,
      album: track.album,
      duration: track.duration,
      genre: track.genre,
      releaseDate: track.releaseDate,
      plays: track.plays,
      likes: track.likes?.length || 0,
      image: track.image,
      audioUrl: track.audioUrl,
      tags: track.tags,
    }));

    res.json({
      success: true,
      data: formattedTracks,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalTracks: total,
      },
    });
  } catch (error) {
    console.error('트랙 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '트랙 조회 중 오류가 발생했습니다.',
    });
  }
});

// 특정 트랙 조회
router.get('/:id', async (req, res) => {
  try {
    const trackId = req.params.id;

    // 데이터베이스에서 트랙 조회
    const track = await Track.findById(trackId)
      .populate('artist', 'name email avatar')
      .lean();

    if (!track) {
      return res.status(404).json({
        success: false,
        message: '트랙을 찾을 수 없습니다.',
      });
    }

    // 응답 데이터 가공
    const formattedTrack = {
      id: track._id,
      title: track.title,
      artist: track.artist?.name || track.artistName,
      album: track.album,
      duration: track.duration,
      genre: track.genre,
      releaseDate: track.releaseDate,
      plays: track.plays || 0,
      likes: track.likes?.length || 0,
      image: track.image,
      audioUrl: track.audioUrl,
      lyrics: track.lyrics,
      credits: track.credits || {
        lyrics: track.artist?.name || track.artistName,
        music: track.artist?.name || track.artistName,
        arrangement: track.artist?.name || track.artistName,
        producer: track.artist?.name || track.artistName,
      },
      tags: track.tags || [],
      description: track.description,
      bpm: track.bpm,
      key: track.key,
      mood: track.mood,
      artistAvatar: track.artist?.avatar || null,
      artistId: track.artist?._id || null,
    };

    res.json({
      success: true,
      data: formattedTrack,
    });
  } catch (error) {
    console.error('트랙 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '트랙 상세 조회 중 오류가 발생했습니다.',
    });
  }
});

module.exports = router;
