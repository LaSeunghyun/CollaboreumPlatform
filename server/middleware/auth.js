const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // 토큰 추출
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: '인증 토큰이 필요합니다' 
      });
    }

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 사용자 찾기
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: '유효하지 않은 토큰입니다' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: '비활성화된 계정입니다' 
      });
    }

    // 요청 객체에 사용자 정보 추가
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: '유효하지 않은 토큰입니다' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: '토큰이 만료되었습니다' 
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다' 
    });
  }
};

// 역할 기반 권한 확인
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: '인증이 필요합니다' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: '접근 권한이 없습니다' 
      });
    }

    next();
  };
};

// 아티스트 전용 권한
const requireArtist = requireRole(['artist', 'admin']);

// 관리자 전용 권한
const requireAdmin = requireRole(['admin']);

module.exports = auth;
