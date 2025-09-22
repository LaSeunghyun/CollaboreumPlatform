const express = require('express');
const router = express.Router();
const { ENUMS, CSV_HEADERS, STATUS_COLORS, STATUS_ICONS } = require('../constants/enums');
const { resolveSortOptions } = require('../constants/sortOptions');

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

// 아트워크 카테고리 조회
router.get('/artwork-categories', async (req, res) => {
  try {
    const artworkCategories = [
      { id: 'painting', label: '회화', icon: '🎨' },
      { id: 'sculpture', label: '조각', icon: '🗿' },
      { id: 'photography', label: '사진', icon: '📸' },
      { id: 'digital', label: '디지털아트', icon: '💻' },
      { id: 'craft', label: '공예', icon: '🛠️' }
    ];

    res.json({
      success: true,
      data: artworkCategories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '아트워크 카테고리 조회 중 오류가 발생했습니다.', 
      error: error.message 
    });
  }
});

// 비용 카테고리 조회
router.get('/expense-categories', async (req, res) => {
  try {
    const expenseCategories = [
      { id: 'labor', label: '인건비', icon: '👥' },
      { id: 'material', label: '재료비', icon: '🧱' },
      { id: 'equipment', label: '장비비', icon: '⚙️' },
      { id: 'marketing', label: '마케팅비', icon: '📢' },
      { id: 'other', label: '기타', icon: '📋' }
    ];

    res.json({
      success: true,
      data: expenseCategories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '비용 카테고리 조회 중 오류가 발생했습니다.', 
      error: error.message 
    });
  }
});

// 결제 방법 조회
router.get('/payment-methods', async (req, res) => {
  try {
    const paymentMethods = [
      { id: 'card', label: '신용카드', icon: '💳' },
      { id: 'phone', label: '휴대폰 결제', icon: '📱' },
      { id: 'bank', label: '계좌이체', icon: '🏦' }
    ];

    res.json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '결제 방법 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 정렬 옵션 조회
router.get('/sort-options/:type?', async (req, res) => {
  try {
    const sortOptions = resolveSortOptions(req.params.type);
    res.json({
      success: true,
      data: sortOptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '정렬 옵션 조회 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
});

// 상태 설정 조회 (프로젝트, 펀딩 등)
router.get('/status-config/:type', async (req, res) => {
  try {
    const { type } = req.params;
    let statusConfig = {};

    switch (type) {
      case 'project':
        statusConfig = {
          planning: { label: '계획중', variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' },
          in_progress: { label: '진행중', variant: 'default', color: 'bg-blue-100 text-blue-800' },
          completed: { label: '완료', variant: 'success', color: 'bg-green-100 text-green-800' },
          pending: { label: '보류', variant: 'warning', color: 'bg-orange-100 text-orange-800' },
          cancelled: { label: '취소', variant: 'destructive', color: 'bg-red-100 text-red-800' }
        };
        break;
      case 'funding':
        statusConfig = {
          preparing: { label: '준비중', variant: 'secondary', color: 'bg-gray-100 text-gray-800' },
          in_progress: { label: '진행중', variant: 'default', color: 'bg-blue-100 text-blue-800' },
          success: { label: '성공', variant: 'success', color: 'bg-green-100 text-green-800' },
          failed: { label: '실패', variant: 'destructive', color: 'bg-red-100 text-red-800' },
          cancelled: { label: '취소', variant: 'destructive', color: 'bg-red-100 text-red-800' },
          executing: { label: '집행중', variant: 'warning', color: 'bg-orange-100 text-orange-800' },
          completed: { label: '완료', variant: 'success', color: 'bg-green-100 text-green-800' }
        };
        break;
      case 'event':
        statusConfig = {
          scheduled: { label: '예정', variant: 'default', color: 'bg-blue-100 text-blue-800' },
          in_progress: { label: '진행중', variant: 'success', color: 'bg-green-100 text-green-800' },
          completed: { label: '완료', variant: 'secondary', color: 'bg-gray-100 text-gray-800' },
          cancelled: { label: '취소', variant: 'destructive', color: 'bg-red-100 text-red-800' }
        };
        break;
      default:
        return res.status(404).json({
          success: false,
          message: `해당 타입(${type})의 상태 설정을 찾을 수 없습니다.`
        });
    }

    res.json({
      success: true,
      data: statusConfig
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '상태 설정 조회 중 오류가 발생했습니다.', 
      error: error.message 
    });
  }
});

module.exports = router;
