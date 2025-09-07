const { AuthenticationError, AuthorizationError } = require('../errors/AppError');
const { jwtService } = require('../services/auth/jwtService');
const { businessLogger } = require('./logger');

/**
 * 인증 미들웨어
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('인증 토큰이 필요합니다');
    }

    const token = authHeader.substring(7); // 'Bearer ' 제거
    
    // 토큰 검증
    const decoded = jwtService.verifyAccessToken(token);
    
    // 사용자 정보를 요청 객체에 추가
    req.user = {
      id: decoded.userId,
      userId: decoded.userId, // 호환성을 위해
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
    };
    
    // 요청 ID 추가 (로깅용)
    req.requestId = req.headers['x-request-id'] || require('uuid').v4();
    
    next();
  } catch (error) {
    businessLogger.auth.login(null, req.headers.authorization ? 'token_invalid' : 'no_token', false);
    next(error);
  }
};

/**
 * 선택적 인증 미들웨어 (토큰이 있으면 검증, 없으면 통과)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwtService.verifyAccessToken(token);
      
      req.user = {
        id: decoded.userId,
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || [],
      };
    }
    
    next();
  } catch (error) {
    // 토큰이 있지만 유효하지 않은 경우에만 에러
    if (req.headers.authorization) {
      return next(error);
    }
    next();
  }
};

/**
 * 역할 기반 권한 검증 미들웨어
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('인증이 필요합니다'));
    }

    if (!roles.includes(req.user.role)) {
      businessLogger.auth.login(req.user.id, req.user.email, false);
      return next(new AuthorizationError(`다음 역할이 필요합니다: ${roles.join(', ')}`));
    }

    next();
  };
};

/**
 * 권한 기반 검증 미들웨어
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('인증이 필요합니다'));
    }

    // 관리자는 모든 권한을 가짐
    if (req.user.role === 'admin') {
      return next();
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      businessLogger.auth.login(req.user.id, req.user.email, false);
      return next(new AuthorizationError(`다음 권한이 필요합니다: ${permission}`));
    }

    next();
  };
};

/**
 * 여러 권한 중 하나라도 있으면 통과
 */
const requireAnyPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('인증이 필요합니다'));
    }

    // 관리자는 모든 권한을 가짐
    if (req.user.role === 'admin') {
      return next();
    }

    const hasPermission = permissions.some(permission => 
      req.user.permissions && req.user.permissions.includes(permission)
    );

    if (!hasPermission) {
      businessLogger.auth.login(req.user.id, req.user.email, false);
      return next(new AuthorizationError(`다음 권한 중 하나가 필요합니다: ${permissions.join(', ')}`));
    }

    next();
  };
};

/**
 * 리소스 소유자 검증 미들웨어
 */
const requireOwnership = (resourceIdParam = 'id', resourceModel = null) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new AuthenticationError('인증이 필요합니다'));
      }

      // 관리자는 모든 리소스에 접근 가능
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params[resourceIdParam];
      
      if (!resourceId) {
        return next(new AuthorizationError('리소스 ID가 필요합니다'));
      }

      // 리소스 모델이 제공된 경우 소유자 확인
      if (resourceModel) {
        const resource = await resourceModel.findById(resourceId);
        
        if (!resource) {
          return next(new AuthorizationError('리소스를 찾을 수 없습니다'));
        }

        // 소유자 ID 필드 확인 (ownerId, userId, createdBy 등)
        const ownerField = resource.ownerId || resource.userId || resource.createdBy;
        
        if (!ownerField || ownerField.toString() !== req.user.id) {
          return next(new AuthorizationError('이 리소스에 대한 권한이 없습니다'));
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 펀딩 프로젝트 소유자 검증
 */
const requireProjectOwnership = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new AuthenticationError('인증이 필요합니다'));
    }

    // 관리자는 모든 프로젝트에 접근 가능
    if (req.user.role === 'admin') {
      return next();
    }

    const projectId = req.params.id || req.params.projectId;
    
    if (!projectId) {
      return next(new AuthorizationError('프로젝트 ID가 필요합니다'));
    }

    const { FundingProject } = require('../models/FundingProject');
    const project = await FundingProject.findById(projectId);
    
    if (!project) {
      return next(new AuthorizationError('프로젝트를 찾을 수 없습니다'));
    }

    if (project.ownerId.toString() !== req.user.id) {
      return next(new AuthorizationError('이 프로젝트에 대한 권한이 없습니다'));
    }

    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * 펀딩 프로젝트 상태별 접근 제어
 */
const requireProjectStatus = (...allowedStatuses) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id || req.params.projectId;
      
      if (!projectId) {
        return next(new AuthorizationError('프로젝트 ID가 필요합니다'));
      }

      const { FundingProject } = require('../models/FundingProject');
      const project = await FundingProject.findById(projectId);
      
      if (!project) {
        return next(new AuthorizationError('프로젝트를 찾을 수 없습니다'));
      }

      if (!allowedStatuses.includes(project.status)) {
        return next(new AuthorizationError(
          `프로젝트 상태가 허용되지 않습니다. 현재 상태: ${project.status}, 허용된 상태: ${allowedStatuses.join(', ')}`
        ));
      }

      req.project = project;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * API 키 인증 미들웨어
 */
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return next(new AuthenticationError('API 키가 필요합니다'));
  }

  // API 키 검증 로직 (실제로는 데이터베이스에서 확인)
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (!validApiKeys.includes(apiKey)) {
    return next(new AuthenticationError('유효하지 않은 API 키입니다'));
  }

  req.apiKey = apiKey;
  next();
};

/**
 * Rate Limiting 미들웨어
 */
const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // 오래된 요청 제거
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    } else {
      requests.set(key, []);
    }
    
    const userRequests = requests.get(key);
    
    if (userRequests.length >= max) {
      return next(new AuthorizationError('요청 제한을 초과했습니다'));
    }
    
    userRequests.push(now);
    next();
  };
};

/**
 * CORS 설정
 */
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'https://collaboreum-mvp-platform.vercel.app',
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS 정책에 의해 차단됨'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requirePermission,
  requireAnyPermission,
  requireOwnership,
  requireProjectOwnership,
  requireProjectStatus,
  authenticateApiKey,
  rateLimit,
  corsOptions,
};
