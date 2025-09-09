const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Artwork = require('../models/Artwork');
const User = require('../models/User');
const Category = require('../models/Category');

// 모든 작품 조회 (필터링 및 정렬 포함)
router.get('/artworks', async (req, res) => {
  try {
    const { category, search, sortBy, page = 1, limit = 20 } = req.query;
    
    // 쿼리 빌더
    let query = {};
    
    // 카테고리 필터
    if (category && category !== "전체") {
      query.category = category;
    }
    
    // 검색 필터
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // 정렬 옵션
    let sortOption = {};
    if (sortBy === "인기순") {
      sortOption = { likes: -1, plays: -1, views: -1 };
    } else if (sortBy === "최신순") {
      sortOption = { createdAt: -1 };
    } else {
      sortOption = { createdAt: -1 }; // 기본값
    }
    
    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 작품 조회 (아티스트 정보 포함)
    const artworks = await Artwork.find(query)
      .populate('artist', 'name avatar bio')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // 전체 개수 조회
    const total = await Artwork.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        artworks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('작품 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '작품을 불러오는데 실패했습니다', 
      error: error.message 
    });
  }
});

// 특정 작품 조회
router.get('/artworks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const artwork = await Artwork.findById(id)
      .populate('artist', 'name avatar bio isVerified')
      .lean();
    
    if (!artwork) {
      return res.status(404).json({ 
        success: false, 
        message: '작품을 찾을 수 없습니다' 
      });
    }
    
    // 조회수 증가
    await Artwork.findByIdAndUpdate(id, { $inc: { views: 1 } });
    
    res.json({
      success: true,
      data: artwork
    });
  } catch (error) {
    console.error('작품 상세 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '작품을 불러오는데 실패했습니다', 
      error: error.message 
    });
  }
});

// 카테고리 조회
router.get('/categories', async (req, res) => {
  try {
    // 데이터베이스에서 활성화된 카테고리 조회
    const categories = await Category.find({ isActive: true }).sort('order');
    
    // "전체" 카테고리를 맨 앞에 추가
    const allCategories = [
      { id: "전체", label: "전체", icon: null },
      ...categories
    ];
    
    res.json({
      success: true,
      data: allCategories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '카테고리를 불러오는데 실패했습니다', 
      error: error.message 
    });
  }
});

// 새 작품 업로드
router.post('/artworks', auth, async (req, res) => {
  try {
    const { title, category, type, description, tags, duration, dimensions, metadata } = req.body;
    
    // 필수 필드 검증
    if (!title || !category || !type || !description) {
      return res.status(400).json({
        success: false,
        message: '필수 필드를 모두 입력해주세요'
      });
    }
    
    // 새 작품 생성
    const newArtwork = new Artwork({
      title,
      artist: req.user.id,
      category,
      type,
      description,
      tags: tags || [],
      duration,
      dimensions,
      metadata,
      thumbnail: req.body.thumbnail || '/thumbnails/default.jpg'
    });
    
    const savedArtwork = await newArtwork.save();
    
    // 아티스트 정보와 함께 반환
    const populatedArtwork = await Artwork.findById(savedArtwork._id)
      .populate('artist', 'name avatar bio');
    
    res.status(201).json({
      success: true,
      message: '작품이 성공적으로 업로드되었습니다',
      data: populatedArtwork
    });
  } catch (error) {
    console.error('작품 업로드 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '작품 업로드에 실패했습니다', 
      error: error.message 
    });
  }
});

// 작품 수정
router.put('/artworks/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // 작품 존재 확인 및 권한 확인
    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: '작품을 찾을 수 없습니다'
      });
    }
    
    // 아티스트 본인만 수정 가능
    if (artwork.artist.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '작품을 수정할 권한이 없습니다'
      });
    }
    
    // 수정 불가능한 필드 제거
    delete updates.artist;
    delete updates.createdAt;
    
    const updatedArtwork = await Artwork.findByIdAndUpdate(
      id, 
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('artist', 'name avatar bio');
    
    res.json({
      success: true,
      message: '작품이 성공적으로 수정되었습니다',
      data: updatedArtwork
    });
  } catch (error) {
    console.error('작품 수정 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '작품 수정에 실패했습니다', 
      error: error.message 
    });
  }
});

// 작품 삭제
router.delete('/artworks/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 작품 존재 확인 및 권한 확인
    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: '작품을 찾을 수 없습니다'
      });
    }
    
    // 아티스트 본인만 삭제 가능
    if (artwork.artist.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '작품을 삭제할 권한이 없습니다'
      });
    }
    
    await Artwork.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: '작품이 성공적으로 삭제되었습니다'
    });
  } catch (error) {
    console.error('작품 삭제 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '작품 삭제에 실패했습니다', 
      error: error.message 
    });
  }
});

// 작품 좋아요
router.post('/artworks/:id/like', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 작품 존재 확인
    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: '작품을 찾을 수 없습니다'
      });
    }
    
    // 좋아요 수 증가
    const updatedArtwork = await Artwork.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    
    res.json({
      success: true,
      message: '좋아요가 추가되었습니다',
      data: { likes: updatedArtwork.likes }
    });
  } catch (error) {
    console.error('좋아요 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '좋아요 처리에 실패했습니다', 
      error: error.message 
    });
  }
});

// 아티스트별 작품 조회
router.get('/artists/:artistId/artworks', async (req, res) => {
  try {
    const { artistId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const artworks = await Artwork.find({ artist: artistId })
      .populate('artist', 'name avatar bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Artwork.countDocuments({ artist: artistId });
    
    res.json({
      success: true,
      data: {
        artworks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('아티스트 작품 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '아티스트 작품을 불러오는데 실패했습니다', 
      error: error.message 
    });
  }
});

module.exports = router;
