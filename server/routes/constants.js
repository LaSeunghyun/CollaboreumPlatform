const express = require('express');
const router = express.Router();
const { ENUMS, CSV_HEADERS, STATUS_COLORS, STATUS_ICONS } = require('../constants/enums');

// 모든 enum 값들을 조회하는 엔드포인트
router.get('/enums', async (req, res) => {
  try {
    res.json({
      success: true,
      data: ENUMS
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Enum 값 조회 중 오류가 발생했습니다.', 
      error: error.message 
    });
  }
});

// CSV 헤더를 조회하는 엔드포인트
router.get('/csv-headers', async (req, res) => {
  try {
    res.json({
      success: true,
      data: CSV_HEADERS
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'CSV 헤더 조회 중 오류가 발생했습니다.', 
      error: error.message 
    });
  }
});

// 상태별 색상을 조회하는 엔드포인트
router.get('/status-colors', async (req, res) => {
  try {
    res.json({
      success: true,
      data: STATUS_COLORS
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '상태 색상 조회 중 오류가 발생했습니다.', 
      error: error.message 
    });
  }
});

// 상태별 아이콘을 조회하는 엔드포인트
router.get('/status-icons', async (req, res) => {
  try {
    res.json({
      success: true,
      data: STATUS_ICONS
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '상태 아이콘 조회 중 오류가 발생했습니다.', 
      error: error.message 
    });
  }
});

// 특정 카테고리의 enum 값들을 조회하는 엔드포인트
router.get('/enums/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!ENUMS[category]) {
      return res.status(404).json({
        success: false,
        message: `해당 카테고리(${category})를 찾을 수 없습니다.`
      });
    }

    res.json({
      success: true,
      data: ENUMS[category]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Enum 값 조회 중 오류가 발생했습니다.', 
      error: error.message 
    });
  }
});

module.exports = router;
