const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth');
const { logger } = require('../src/logger');
const { userEvents } = require('../src/logger/event');

// 회원가입
router.post('/signup', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      userType,
      agreeTerms,
      agreePrivacy,
      agreeMarketing,
    } = req.body;

    // 필수 필드 검증
    if (!name || !email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: '모든 필수 필드를 입력해주세요.',
      });
    }

    // 약관 동의 검증
    if (!agreeTerms || !agreePrivacy) {
      return res.status(400).json({
        success: false,
        message: '필수 약관에 동의해주세요.',
      });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '올바른 이메일 형식을 입력해주세요.',
      });
    }

    // 비밀번호 길이 검증
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: '비밀번호는 8자 이상이어야 합니다.',
      });
    }

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 등록된 이메일입니다.',
      });
    }

    // 비밀번호 해시화
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 새 사용자 생성
    const newUser = new User({
      name,
      username: name, // name을 username으로도 설정
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userType,
      isActive: true,
      agreeTerms: agreeTerms || false,
      agreePrivacy: agreePrivacy || false,
      agreeMarketing: agreeMarketing || false,
      lastActivityAt: new Date(),
    });

    await newUser.save();

    // 회원가입 성공 로그
    userEvents.registered(newUser._id.toString(), newUser.email, newUser.role);
    logger.info(
      {
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        userType: userType,
        agreeTerms,
        agreePrivacy,
        agreeMarketing,
      },
      'User registration successful',
    );

    // 아티스트인 경우 추가 정보 설정 (User 모델에만 저장)
    if (userType === 'artist') {
      // User 모델에 아티스트 관련 기본 정보 추가
      newUser.bio = newUser.bio || '새로운 아티스트입니다.';
      await newUser.save();

      // 아티스트 프로필 생성 로그
      logger.info(
        {
          userId: newUser._id,
          name: newUser.name,
          role: newUser.role,
        },
        'Artist profile created',
      );
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' },
    );

    // 토큰 발급 로그
    logger.info(
      {
        userId: newUser._id,
        email: newUser.email,
        role: newUser.role,
        tokenExpiry: '24h',
        tokenPreview: token.substring(0, 20) + '...',
      },
      'JWT token issued',
    );

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      },
    });
  } catch (error) {
    logger.error(
      {
        error: error.message,
        stack: error.stack,
        requestData: {
          name: req.body?.name,
          email: req.body?.email,
          userType: req.body?.userType,
          agreeTerms: req.body?.agreeTerms,
          agreePrivacy: req.body?.agreePrivacy,
          agreeMarketing: req.body?.agreeMarketing,
        },
      },
      'User registration error',
    );
    res.status(500).json({
      success: false,
      message: '회원가입 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info({ email }, 'Login attempt');

    // 이메일과 비밀번호 검증
    if (!email || !password) {
      logger.warn('Login failed: missing email or password');
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 모두 입력해주세요.',
      });
    }

    // 사용자 찾기
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      logger.warn({ email }, 'Login failed: user not found');
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    // 비밀번호 확인
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn({ email }, 'Login failed: invalid password');
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    // 계정 활성화 확인
    if (!user.isActive) {
      logger.warn({ email }, 'Login failed: inactive account');
      return res.status(403).json({
        success: false,
        message: '계정이 비활성화되었습니다. 관리자에게 문의하세요.',
      });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
    );

    // 마지막 로그인 시간 업데이트
    user.lastLogin = new Date();
    await user.save();

    userEvents.login(user._id.toString(), user.email);
    logger.info(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      'Login successful',
    );

    res.json({
      success: true,
      message: '로그인되었습니다.',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Login error');
    res.status(500).json({
      success: false,
      message: '로그인 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// 로그아웃
router.post('/logout', async (req, res) => {
  try {
    // 클라이언트에서 토큰을 제거하도록 안내
    res.json({
      success: true,
      message: '로그아웃되었습니다.',
    });
  } catch (error) {
    logger.error({ error }, 'Logout error');
    res.status(500).json({
      success: false,
      message: '로그아웃 중 오류가 발생했습니다.',
    });
  }
});

// 토큰 검증
router.get('/verify', auth, async (req, res) => {
  try {
    // auth에서 이미 토큰 검증이 완료됨
    // req.user에는 검증된 사용자 정보가 포함되어 있음

    console.log(`🔍 토큰 검증 요청: ${req.user.email} (${req.user.role})`);

    res.json({
      success: true,
      message: '토큰이 유효합니다.',
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          role: req.user.role,
          avatar: req.user.avatar,
          bio: req.user.bio,
          isVerified: req.user.isVerified,
        },
      },
    });
  } catch (error) {
    console.error(`💥 토큰 검증 오류: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '토큰 검증 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// 이메일 중복 확인
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: '이메일을 입력해주세요.',
      });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '올바른 이메일 형식을 입력해주세요.',
      });
    }

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.json({
        success: false,
        message: '이미 등록된 이메일입니다.',
        data: {
          isAvailable: false,
          email: email,
        },
      });
    }

    // 사용 가능한 이메일
    res.json({
      success: true,
      message: '사용 가능한 이메일입니다.',
      data: {
        isAvailable: true,
        email: email,
      },
    });
  } catch (error) {
    console.error(`💥 이메일 중복 확인 오류: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '이메일 중복 확인 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
