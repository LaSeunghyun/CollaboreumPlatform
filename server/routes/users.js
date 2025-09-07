const express = require('express');
const User = require('../models/User');
const router = express.Router();

// 현재 사용자 프로필 조회
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '프로필 조회 중 오류가 발생했습니다'
    });
  }
});

// 사용자 프로필 업데이트
router.put('/profile', async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.user.id);
    
    await user.updateProfile(updates);
    
    res.json({
      success: true,
      message: '프로필이 업데이트되었습니다',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '프로필 업데이트 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
