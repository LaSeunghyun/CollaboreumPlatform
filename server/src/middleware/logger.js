const pino = require('pino');

// 로거 설정
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  } : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
        'authorization': req.headers['authorization'] ? '[REDACTED]' : undefined,
      },
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: res.getHeaders(),
    }),
    err: (err) => ({
      type: err.constructor.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      statusCode: err.statusCode,
    }),
  },
});

/**
 * 요청 로깅 미들웨어
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // 요청 ID 생성
  req.id = req.headers['x-request-id'] || require('uuid').v4();
  
  // 응답 완료 시 로깅
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    const logData = {
      requestId: req.id,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      user: req.user ? {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      } : null,
    };

    // 로그 레벨 결정
    if (res.statusCode >= 500) {
      logger.error(logData, 'Server error');
    } else if (res.statusCode >= 400) {
      logger.warn(logData, 'Client error');
    } else {
      logger.info(logData, 'Request completed');
    }
  });

  next();
};

/**
 * 보안 로깅 미들웨어
 */
const securityLogger = (req, res, next) => {
  // 의심스러운 요청 감지
  const suspiciousPatterns = [
    /\.\./, // 경로 탐색
    /<script/i, // XSS 시도
    /union.*select/i, // SQL 인젝션 시도
    /javascript:/i, // JavaScript 프로토콜
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(req.url) || pattern.test(JSON.stringify(req.body))
  );

  if (isSuspicious) {
    logger.warn({
      requestId: req.id,
      type: 'SUSPICIOUS_REQUEST',
      method: req.method,
      url: req.url,
      body: req.body,
      headers: req.headers,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    }, 'Suspicious request detected');
  }

  next();
};

/**
 * 비즈니스 로직 로깅
 */
const businessLogger = {
  funding: {
    projectCreated: (projectId, userId, data) => {
      logger.info({
        type: 'BUSINESS_EVENT',
        event: 'FUNDING_PROJECT_CREATED',
        projectId,
        userId,
        data,
      }, 'Funding project created');
    },
    
    pledgeCreated: (pledgeId, projectId, userId, amount) => {
      logger.info({
        type: 'BUSINESS_EVENT',
        event: 'PLEDGE_CREATED',
        pledgeId,
        projectId,
        userId,
        amount,
      }, 'Pledge created');
    },
    
    projectStatusChanged: (projectId, oldStatus, newStatus, userId) => {
      logger.info({
        type: 'BUSINESS_EVENT',
        event: 'PROJECT_STATUS_CHANGED',
        projectId,
        oldStatus,
        newStatus,
        userId,
      }, 'Project status changed');
    },
  },
  
  auth: {
    login: (userId, email, success) => {
      logger.info({
        type: 'AUTH_EVENT',
        event: 'LOGIN',
        userId,
        email,
        success,
      }, 'User login attempt');
    },
    
    logout: (userId, email) => {
      logger.info({
        type: 'AUTH_EVENT',
        event: 'LOGOUT',
        userId,
        email,
      }, 'User logout');
    },
    
    tokenRefresh: (userId, success) => {
      logger.info({
        type: 'AUTH_EVENT',
        event: 'TOKEN_REFRESH',
        userId,
        success,
      }, 'Token refresh attempt');
    },
  },
  
  payment: {
    paymentProcessed: (paymentId, amount, userId, success) => {
      logger.info({
        type: 'PAYMENT_EVENT',
        event: 'PAYMENT_PROCESSED',
        paymentId,
        amount,
        userId,
        success,
      }, 'Payment processed');
    },
    
    refundProcessed: (refundId, amount, userId, reason) => {
      logger.info({
        type: 'PAYMENT_EVENT',
        event: 'REFUND_PROCESSED',
        refundId,
        amount,
        userId,
        reason,
      }, 'Refund processed');
    },
  },
};

/**
 * 성능 로깅
 */
const performanceLogger = {
  database: {
    query: (operation, collection, duration, success) => {
      logger.info({
        type: 'PERFORMANCE',
        category: 'DATABASE',
        operation,
        collection,
        duration,
        success,
      }, 'Database query executed');
    },
  },
  
  external: {
    api: (service, endpoint, duration, statusCode) => {
      logger.info({
        type: 'PERFORMANCE',
        category: 'EXTERNAL_API',
        service,
        endpoint,
        duration,
        statusCode,
      }, 'External API call');
    },
  },
};

module.exports = {
  logger,
  requestLogger,
  securityLogger,
  businessLogger,
  performanceLogger,
};
