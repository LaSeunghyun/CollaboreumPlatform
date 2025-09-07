const pinoHttp = require('pino-http');
const { randomUUID } = require('node:crypto');
const { logger } = require('../src/logger');

// Pino HTTP 로거 설정
const httpLogger = pinoHttp({
  logger,
  genReqId: function (req, res) {
    const headerId =
      req.headers['x-request-id'] ||
      req.headers['x-correlation-id'];
    const id = headerId || randomUUID();
    res.setHeader('X-Request-ID', id);
    return id;
  },
  autoLogging: {
    // 정적 파일/헬스체크 등 제외하고 싶으면 여기서 필터
    ignorePaths: ['/api/health', '/favicon.ico'],
  },
  customLogLevel: function (res, err) {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  // 요청/응답 객체를 과도하게 찍지 않게 serializer 사용
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        // 필요한 경우 헤더/바디 제한적으로 포함
        headers: {
          'user-agent': req.headers['user-agent'],
        },
        user: req.user ? {
          id: req.user._id,
          email: req.user.email,
          role: req.user.role
        } : undefined,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});

// 요청 컨텍스트 주입을 위한 미들웨어
const requestContextMiddleware = (req, res, next) => {
  const reqId = req.id || req.headers['x-request-id'] || randomUUID();
  const userId = req.user?.id;
  
  // AsyncLocalStorage를 사용하지 않고 req 객체에 직접 저장
  req.reqId = String(reqId);
  req.userId = userId;
  
  next();
};

// 기존 morgan 대신 Pino HTTP 로거 사용
const loggerMiddleware = (req, res, next) => {
  // Pino HTTP 로거 실행
  httpLogger(req, res, () => {
    // 요청 컨텍스트 주입
    requestContextMiddleware(req, res, next);
  });
};

module.exports = loggerMiddleware;
