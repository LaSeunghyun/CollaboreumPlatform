const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const Artist = require('../models/Artist');
const CommunityPost = require('../models/CommunityPost');
const mongoose = require('mongoose');

const router = express.Router();

// 플랫폼 전체 통계 조회
router.get('/platform', async (req, res) => {
  try {
    // 등록 아티스트 수 (role: "artist"인 사용자)
    const registeredArtists = await User.countDocuments({
      role: 'artist',
      isActive: true,
    });

    // 성공 프로젝트 수 (status: "성공" 또는 "완료")
    const successfulProjects = await Project.countDocuments({
      status: { $in: ['성공', '완료'] },
    });

    // 총 펀딩 금액 (모든 프로젝트의 currentAmount 합계)
    const totalFunding = await Project.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ['$currentAmount', 0] } },
        },
      },
    ]);

    // 활성 후원자 수 (최근 30일 내에 활동한 사용자)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeSupporters = await User.countDocuments({
      isActive: true,
      lastActivityAt: { $gte: thirtyDaysAgo },
    });

    // 이번주 신인 아티스트 수
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newArtistsThisWeek = await User.countDocuments({
      role: 'artist',
      isActive: true,
      createdAt: { $gte: oneWeekAgo },
    });

    // 카테고리별 아티스트 분포
    const artistsByCategory = await Artist.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // 월별 펀딩 추이 (최근 6개월)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyFunding = await Project.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: { $ifNull: ['$currentAmount', 0] } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalArtists: registeredArtists,
        totalProjects: successfulProjects,
        totalFunding: totalFunding[0]?.total || 0,
        totalUsers: activeSupporters,
        newArtistsThisWeek,
        artistsByCategory,
        monthlyFunding,
      },
    });
  } catch (error) {
    console.error('Platform stats error:', error);
    res.status(500).json({
      success: false,
      message: '플랫폼 통계 조회 중 오류가 발생했습니다',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// 아티스트별 통계 조회
router.get('/artist/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 아티스트 ID입니다',
      });
    }

    // 아티스트의 프로젝트 통계
    const projectStats = await Project.aggregate([
      {
        $match: { artistId: mongoose.Types.ObjectId(id) },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: { $ifNull: ['$currentAmount', 0] } },
        },
      },
    ]);

    // 아티스트의 총 수익
    const totalEarnings = await Project.aggregate([
      {
        $match: {
          artistId: mongoose.Types.ObjectId(id),
          status: { $in: ['성공', '완료'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ['$currentAmount', 0] } },
        },
      },
    ]);

    // 아티스트의 팔로워 수
    const artist = await Artist.findById(id);
    const followers = artist ? artist.followers || 0 : 0;

    res.json({
      success: true,
      data: {
        projectStats,
        totalEarnings: totalEarnings[0]?.total || 0,
        followers,
      },
    });
  } catch (error) {
    console.error('Artist stats error:', error);
    res.status(500).json({
      success: false,
      message: '아티스트 통계 조회 중 오류가 발생했습니다',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// 프로젝트 통계 조회
router.get('/projects', async (req, res) => {
  try {
    const { category, status, timeframe } = req.query;

    const matchStage = {};

    if (category) {
      matchStage.category = category;
    }

    if (status) {
      matchStage.status = status;
    }

    if (timeframe === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      matchStage.createdAt = { $gte: oneWeekAgo };
    } else if (timeframe === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      matchStage.createdAt = { $gte: oneMonthAgo };
    }

    const projectStats = await Project.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: { $ifNull: ['$currentAmount', 0] } },
          avgAmount: { $avg: { $ifNull: ['$currentAmount', 0] } },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        projectStats,
      },
    });
  } catch (error) {
    console.error('Project stats error:', error);
    res.status(500).json({
      success: false,
      message: '프로젝트 통계 조회 중 오류가 발생했습니다',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// 커뮤니티 통계 조회
router.get('/community', async (req, res) => {
  try {
    // 총 게시글 수
    const totalPosts = await CommunityPost.countDocuments({ isActive: true });

    // 활성 사용자 수 (최근 30일 내에 게시글을 작성한 사용자)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await CommunityPost.distinct('authorId', {
      createdAt: { $gte: thirtyDaysAgo },
    });

    // 총 댓글 수
    const totalComments = await CommunityPost.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $size: { $ifNull: ['$comments', []] } } },
        },
      },
    ]);

    // 평균 좋아요 수
    const avgLikes = await CommunityPost.aggregate([
      {
        $group: {
          _id: null,
          avg: { $avg: { $size: { $ifNull: ['$likes', []] } } },
        },
      },
    ]);

    // 지난 주 대비 증가율 계산
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // 지난 주 게시글 수
    const lastWeekPosts = await CommunityPost.countDocuments({
      isActive: true,
      createdAt: { $gte: oneWeekAgo },
    });

    // 그 전 주 게시글 수
    const previousWeekPosts = await CommunityPost.countDocuments({
      isActive: true,
      createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo },
    });

    // 지난 주 활성 사용자 수
    const lastWeekActiveUsers = await CommunityPost.distinct('authorId', {
      createdAt: { $gte: oneWeekAgo },
    });

    // 그 전 주 활성 사용자 수
    const previousWeekActiveUsers = await CommunityPost.distinct('authorId', {
      createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo },
    });

    // 증가율 계산
    const postsGrowthRate =
      previousWeekPosts > 0
        ? Math.round(
            ((lastWeekPosts - previousWeekPosts) / previousWeekPosts) * 100,
          )
        : 0;

    const usersGrowthRate =
      previousWeekActiveUsers.length > 0
        ? Math.round(
            ((lastWeekActiveUsers.length - previousWeekActiveUsers.length) /
              previousWeekActiveUsers.length) *
              100,
          )
        : 0;

    res.json({
      success: true,
      data: {
        totalPosts,
        activeUsers: activeUsers.length,
        totalComments: totalComments[0]?.total || 0,
        avgLikes: Math.round(avgLikes[0]?.avg || 0),
        postsGrowthRate,
        usersGrowthRate,
      },
    });
  } catch (error) {
    console.error('Community stats error:', error);
    res.status(500).json({
      success: false,
      message: '커뮤니티 통계 조회 중 오류가 발생했습니다',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
