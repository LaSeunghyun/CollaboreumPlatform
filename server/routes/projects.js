const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// 모든 프로젝트 조회
router.get('/', async (req, res) => {
  try {
    const { category, search, status, page = 1, limit = 20 } = req.query;
    
    // 쿼리 조건 구성
    const query = { isActive: true };
    if (category && category !== '전체') {
      query.category = category;
    }
    if (status && status !== '전체') {
      query.status = status;
    }
    if (search) {
      query.$text = { $search: search };
    }
    
    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 프로젝트 조회
    const projects = await Project.find(query)
      .populate('artist', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // 전체 개수 조회
    const total = await Project.countDocuments(query);
    
    // 응답 데이터 가공
    const formattedProjects = projects.map(project => ({
      id: project._id,
      title: project.title,
      description: project.description,
      artist: project.artist?.name || project.artistName,
      category: project.category,
      status: project.status,
      progress: project.progress,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget,
      spent: project.spent,
      image: project.image,
      tags: project.tags
    }));

    res.json({
      success: true,
      data: formattedProjects,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalProjects: total
      }
    });
  } catch (error) {
    console.error('프로젝트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '프로젝트 조회 중 오류가 발생했습니다.'
    });
  }
});

// 특정 프로젝트의 WBS 항목 조회
router.get('/:id/wbs', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    console.log(`📋 WBS 조회 요청: 프로젝트 ID ${projectId}`);
    
    // 프로젝트 존재 여부 확인 (실제로는 Project 모델에서 조회해야 함)
    if (!projectId) {
      console.log(`❌ WBS 조회 실패: 프로젝트 ID 누락`);
      return res.status(400).json({
        success: false,
        message: '프로젝트 ID가 필요합니다.'
      });
    }

    // WBS 데이터 (실제로는 WBS 모델에서 조회해야 함)
    const wbsItems = [
      {
        id: 1,
        task: '기획 및 컨셉 개발',
        description: '프로젝트의 전체적인 방향성과 컨셉을 정립',
        status: 'completed',
        progress: 100,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        assignee: '김아티스트',
        priority: 'high',
        dependencies: []
      },
      {
        id: 2,
        task: '스케치 및 디자인',
        description: '초기 스케치와 디자인 작업',
        status: 'completed',
        progress: 100,
        startDate: '2024-01-06',
        endDate: '2024-01-10',
        assignee: '김아티스트',
        priority: 'high',
        dependencies: [1]
      },
      {
        id: 3,
        task: '재료 준비',
        description: '작품 제작에 필요한 재료 구매 및 준비',
        status: 'completed',
        progress: 100,
        startDate: '2024-01-11',
        endDate: '2024-01-12',
        assignee: '김아티스트',
        priority: 'medium',
        dependencies: [2]
      },
      {
        id: 4,
        task: '작품 제작',
        description: '실제 작품 제작 작업',
        status: 'in_progress',
        progress: 75,
        startDate: '2024-01-13',
        endDate: '2024-01-18',
        assignee: '김아티스트',
        priority: 'high',
        dependencies: [3]
      },
      {
        id: 5,
        task: '품질 검수',
        description: '완성된 작품의 품질 검수 및 수정',
        status: 'pending',
        progress: 0,
        startDate: '2024-01-19',
        endDate: '2024-01-20',
        assignee: '김아티스트',
        priority: 'medium',
        dependencies: [4]
      }
    ];

    console.log(`✅ WBS 조회 성공: 프로젝트 ID ${projectId}, 항목 수 ${wbsItems.length}`);

    res.json({
      success: true,
      data: wbsItems
    });
  } catch (error) {
    console.error(`💥 WBS 조회 오류: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'WBS 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
