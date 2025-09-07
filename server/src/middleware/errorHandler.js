const { AppError } = require('../errors/AppError');
const logger = require('./logger');

/**
 * 에러 핸들링 미들웨어
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 요청 ID 추가
  const requestId = req.id || req.headers['x-request-id'] || 'unknown';

  // 로그 레벨 결정
  const logLevel = error.statusCode >= 500 ? 'error' : 'warn';

  // 에러 로깅
  logger[logLevel]({
    requestId,
    error: {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      stack: error.stack,
      details: error.details,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
    },
    user: req.user ? {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    } : null,
  });

  // Mongoose 잘못된 ObjectId
  if (err.name === 'CastError') {
    const message = '잘못된 ID 형식입니다';
    error = new AppError(message, 400, 'INVALID_ID');
  }

  // Mongoose 중복 키 에러
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field}이(가) 이미 존재합니다`;
    error = new AppError(message, 409, 'DUPLICATE_FIELD', { field });
  }

  // Mongoose 유효성 검증 에러
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    const message = `입력 데이터가 유효하지 않습니다: ${errors.join(', ')}`;
    error = new AppError(message, 400, 'VALIDATION_ERROR', { errors });
  }

  // JWT 에러
  if (err.name === 'JsonWebTokenError') {
    const message = '유효하지 않은 토큰입니다';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = '토큰이 만료되었습니다';
    error = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  // Multer 에러
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = '파일 크기가 너무 큽니다';
    error = new AppError(message, 413, 'FILE_TOO_LARGE');
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = '파일 개수가 너무 많습니다';
    error = new AppError(message, 413, 'TOO_MANY_FILES');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = '예상치 못한 파일 필드입니다';
    error = new AppError(message, 400, 'UNEXPECTED_FILE_FIELD');
  }

  // 기본 에러 응답
  const response = {
    success: false,
    error: error.message,
    code: error.code || 'INTERNAL_ERROR',
    requestId,
    timestamp: error.timestamp || new Date().toISOString(),
  };

  // 개발 환경에서는 스택 트레이스 포함
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
    response.details = error.details;
  }

  // 프로덕션 환경이 아닌 경우에만 상세 정보 포함
  if (process.env.NODE_ENV !== 'production' && error.details) {
    response.details = error.details;
  }

  res.status(error.statusCode || 500).json(response);
};

/**
 * 404 에러 핸들러
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `요청한 경로를 찾을 수 없습니다: ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

/**
 * 비동기 에러 래퍼
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 에러 응답 포맷터
 */
const formatErrorResponse = (error, requestId = null) => {
  return {
    success: false,
    error: error.message,
    code: error.code || 'INTERNAL_ERROR',
    requestId,
    timestamp: error.timestamp || new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && error.details && { details: error.details }),
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  formatErrorResponse,
};
