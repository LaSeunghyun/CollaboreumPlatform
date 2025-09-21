const errorHandler = (err, req, res, _next) => {
  const error = { ...err };
  error.message = err.message;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
    error.message = message;
    error.statusCode = 400;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field}가 이미 사용 중입니다`;
    error.statusCode = 400;
  }

  // Mongoose cast error (잘못된 ObjectId)
  if (err.name === 'CastError') {
    error.message = '유효하지 않은 ID입니다';
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = '유효하지 않은 토큰입니다';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = '토큰이 만료되었습니다';
    error.statusCode = 401;
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = '파일 크기가 너무 큽니다';
    error.statusCode = 400;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.message = '예상치 못한 파일 필드입니다';
    error.statusCode = 400;
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || '서버 오류가 발생했습니다';

  // Development 환경에서는 스택 트레이스 포함
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Pino 로거로 에러 기록
  const { logger } = require('../src/logger');
  logger.error(
    {
      err,
      reqId: req.reqId,
      userId: req.userId,
      statusCode,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
    'Unhandled error',
  );

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
