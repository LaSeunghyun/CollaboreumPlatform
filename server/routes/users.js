const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const FundingProject = require('../models/FundingProject');
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

// 특정 사용자 프로필 조회
router.get('/:userId/profile', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다'
      });
    }
    
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

// 사용자 프로젝트 목록 조회
router.get('/:userId/projects', async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const userId = req.params.userId;
    
    // 일반 프로젝트 조회
    const projectQuery = { userId };
    if (status) projectQuery.status = status;
    if (category) projectQuery.category = category;
    
    const projects = await Project.find(projectQuery)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // 펀딩 프로젝트 조회
    const fundingQuery = { creatorId: userId };
    if (status) fundingQuery.status = status;
    if (category) fundingQuery.category = category;
    
    const fundingProjects = await FundingProject.find(fundingQuery)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const allProjects = [...projects, ...fundingProjects];
    
    res.json({
      success: true,
      data: {
        projects: allProjects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: allProjects.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '프로젝트 조회 중 오류가 발생했습니다'
    });
  }
});

// 사용자 백킹 내역 조회
router.get('/:userId/backings', async (req, res) => {
  try {
    const { status, projectId, page = 1, limit = 10 } = req.query;
    const userId = req.params.userId;
    
    // 백킹 내역 조회 (실제 구현에서는 백킹 모델이 필요)
    // 임시로 빈 배열 반환
    const backings = [];
    
    res.json({
      success: true,
      data: {
        backings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: backings.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '백킹 내역 조회 중 오류가 발생했습니다'
    });
  }
});

// 사용자 수익 내역 조회
router.get('/:userId/revenues', async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const userId = req.params.userId;
    
    // 수익 내역 조회 (실제 구현에서는 수익 모델이 필요)
    // 임시로 빈 배열 반환
    const revenues = [];
    
    res.json({
      success: true,
      data: {
        revenues,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: revenues.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '수익 내역 조회 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
