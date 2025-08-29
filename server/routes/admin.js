const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const User = require('../models/User');
const Project = require('../models/Project');
const FundingProject = require('../models/FundingProject');
const CommunityPost = require('../models/CommunityPost');

// Apply admin middleware to all routes
router.use(authMiddleware, adminMiddleware);

// Get all inquiries (사용자 문의사항)
router.get('/inquiries', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    // 쿼리 조건 구성
    const query = {};
    if (status && status !== '전체') {
      query.status = status;
    }
    
    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 문의사항 조회 (사용자 프로필에서 문의사항 필드가 있다고 가정)
    const inquiries = await User.find({ 
      'inquiries': { $exists: true, $ne: [] } 
    })
      .populate('inquiries')
      .sort({ 'inquiries.createdAt': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // 전체 개수 조회
    const total = await User.countDocuments({ 
      'inquiries': { $exists: true, $ne: [] } 
    });
    
    // 응답 데이터 가공
    const formattedInquiries = inquiries.flatMap(user => 
      user.inquiries?.map(inquiry => ({
        id: inquiry._id,
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        subject: inquiry.subject,
        message: inquiry.message,
        status: inquiry.status || '대기중',
        category: inquiry.category,
        createdAt: inquiry.createdAt,
        assignedTo: inquiry.assignedTo
      })) || []
    );

    res.json({
      success: true,
      data: formattedInquiries,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalInquiries: total
      }
    });
  } catch (error) {
    console.error('문의사항 조회 오류:', error);
    res.status(500).json({ 
      success: false,
      message: '문의사항 조회에 실패했습니다.', 
      error: error.message 
    });
  }
});

// Get all matching requests (매칭 요청)
router.get('/matching-requests', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    // 쿼리 조건 구성
    const query = { status: { $in: ['대기중', '검토중', '완료'] } };
    if (status && status !== '전체') {
      query.status = status;
    }
    
    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 매칭 요청 조회 (프로젝트에서 매칭 요청 상태인 것들)
    const matchingRequests = await Project.find(query)
      .populate('artist', 'name email')
      .populate('client', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // 전체 개수 조회
    const total = await Project.countDocuments(query);
    
    // 응답 데이터 가공
    const formattedRequests = matchingRequests.map(request => ({
      id: request._id,
      projectTitle: request.title,
      artistName: request.artist?.name || '알 수 없음',
      artistEmail: request.artist?.email || '알 수 없음',
      clientName: request.client?.name || '알 수 없음',
      clientEmail: request.client?.email || '알 수 없음',
      category: request.category,
      budget: request.budget,
      deadline: request.deadline,
      status: request.status,
      createdAt: request.createdAt,
      description: request.description
    }));

    res.json({
      success: true,
      data: formattedRequests,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalRequests: total
      }
    });
  } catch (error) {
    console.error('매칭 요청 조회 오류:', error);
    res.status(500).json({ 
      success: false,
      message: '매칭 요청 조회에 실패했습니다.', 
      error: error.message 
    });
  }
});

// Get financial data (재무 데이터)
router.get('/financial-data', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // 기간별 데이터 계산
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    // 펀딩 프로젝트 통계
    const fundingStats = await FundingProject.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          totalGoalAmount: { $sum: '$goalAmount' },
          totalCurrentAmount: { $sum: '$currentAmount' },
          avgSuccessRate: { $avg: { $divide: ['$currentAmount', '$goalAmount'] } }
        }
      }
    ]);
    
    // 사용자 통계
    const userStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          newArtists: { $sum: { $cond: [{ $eq: ['$role', 'artist'] }, 1, 0] } },
          newFans: { $sum: { $cond: [{ $eq: ['$role', 'fan'] }, 1, 0] } }
        }
      }
    ]);
    
    // 프로젝트 통계
    const projectStats = await Project.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          completedProjects: { $sum: { $cond: [{ $eq: ['$status', '완료'] }, 1, 0] } },
          activeProjects: { $sum: { $cond: [{ $eq: ['$status', '진행중'] }, 1, 0] } }
        }
      }
    ]);
    
    const financialData = {
      period,
      startDate,
      endDate: now,
      funding: fundingStats[0] || {
        totalProjects: 0,
        totalGoalAmount: 0,
        totalCurrentAmount: 0,
        avgSuccessRate: 0
      },
      users: userStats[0] || {
        totalUsers: 0,
        newArtists: 0,
        newFans: 0
      },
      projects: projectStats[0] || {
        totalProjects: 0,
        completedProjects: 0,
        activeProjects: 0
      }
    };

    res.json({
      success: true,
      data: financialData
    });
  } catch (error) {
    console.error('재무 데이터 조회 오류:', error);
    res.status(500).json({ 
      success: false,
      message: '재무 데이터 조회에 실패했습니다.', 
      error: error.message 
    });
  }
});

// Update inquiry status
router.put('/inquiries/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // 사용자 문서에서 문의사항 상태 업데이트
    const result = await User.updateOne(
      { 'inquiries._id': id },
      { $set: { 'inquiries.$.status': status } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: '문의사항을 찾을 수 없습니다.' 
      });
    }
    
    res.json({ 
      success: true,
      message: '문의사항 상태가 성공적으로 업데이트되었습니다.' 
    });
  } catch (error) {
    console.error('문의사항 상태 업데이트 오류:', error);
    res.status(500).json({ 
      success: false,
      message: '문의사항 상태 업데이트에 실패했습니다.', 
      error: error.message 
    });
  }
});

// Assign inquiry to admin
router.put('/inquiries/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    
    // 사용자 문서에서 문의사항 담당자 할당
    const result = await User.updateOne(
      { 'inquiries._id': id },
      { $set: { 'inquiries.$.assignedTo': assignedTo } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: '문의사항을 찾을 수 없습니다.' 
      });
    }
    
    res.json({ 
      success: true,
      message: '문의사항이 성공적으로 할당되었습니다.' 
    });
  } catch (error) {
    console.error('문의사항 할당 오류:', error);
    res.status(500).json({ 
      success: false,
      message: '문의사항 할당에 실패했습니다.', 
      error: error.message 
    });
  }
});

// 대시보드 통계 조회
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalProjects = await Project.countDocuments();
    const pendingProjects = await Project.countDocuments({ status: '계획중' });
    const completedProjects = await Project.countDocuments({ status: '완료' });
    const totalFunding = await FundingProject.aggregate([
      { $group: { _id: null, total: { $sum: '$currentAmount' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalProjects,
        pendingProjects,
        completedProjects,
        totalFunding: totalFunding[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('관리자 통계 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '통계를 불러올 수 없습니다.'
    });
  }
});

// 사용자 목록 조회
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', status = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status) query.isActive = status === 'active';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '사용자 목록을 불러올 수 없습니다.'
    });
  }
});

// 프로젝트 목록 조회
router.get('/projects', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '', category = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artistName: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (category) query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const projects = await Project.find(query)
      .populate('artist', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('프로젝트 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '프로젝트 목록을 불러올 수 없습니다.'
    });
  }
});

// 신고된 콘텐츠 목록 조회
router.get('/reported-content', async (req, res) => {
  try {
    const { page = 1, limit = 20, severity = '', status = '' } = req.query;
    
    const query = { isReported: true };
    if (severity) query.severity = severity;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reportedContent = await CommunityPost.find(query)
      .populate('author', 'name email avatar')
      .sort({ reportedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CommunityPost.countDocuments(query);

    res.json({
      success: true,
      data: reportedContent,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('신고된 콘텐츠 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '신고된 콘텐츠 목록을 불러올 수 없습니다.'
    });
  }
});

// 사용자 역할 변경
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['artist', 'fan', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 역할입니다.'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: user,
      message: '사용자 역할이 변경되었습니다.'
    });
  } catch (error) {
    console.error('사용자 역할 변경 실패:', error);
    res.status(500).json({
      success: false,
      message: '사용자 역할을 변경할 수 없습니다.'
    });
  }
});

// 사용자 상태 변경
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: user,
      message: `사용자가 ${isActive ? '활성화' : '비활성화'}되었습니다.`
    });
  } catch (error) {
    console.error('사용자 상태 변경 실패:', error);
    res.status(500).json({
      success: false,
      message: '사용자 상태를 변경할 수 없습니다.'
    });
  }
});

// 프로젝트 승인/거부
router.put('/projects/:id/approval', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 상태입니다.'
      });
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { 
        status: status === 'approved' ? '진행중' : '거부됨',
        approvalStatus: status,
        approvalReason: reason,
        approvedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: '프로젝트를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: project,
      message: `프로젝트가 ${status === 'approved' ? '승인' : '거부'}되었습니다.`
    });
  } catch (error) {
    console.error('프로젝트 승인/거부 실패:', error);
    res.status(500).json({
      success: false,
      message: '프로젝트 승인/거부를 처리할 수 없습니다.'
    });
  }
});

module.exports = router;
