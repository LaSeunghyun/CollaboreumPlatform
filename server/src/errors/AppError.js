/**
 * 애플리케이션 에러 클래스
 */
class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();

    // 스택 트레이스 캡처
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 인증 에러
 */
class AuthenticationError extends AppError {
  constructor(message = '인증이 필요합니다', details = null) {
    super(message, 401, 'AUTHENTICATION_ERROR', details);
  }
}

/**
 * 권한 에러
 */
class AuthorizationError extends AppError {
  constructor(message = '권한이 없습니다', details = null) {
    super(message, 403, 'AUTHORIZATION_ERROR', details);
  }
}

/**
 * 유효성 검증 에러
 */
class ValidationError extends AppError {
  constructor(message = '입력 데이터가 유효하지 않습니다', details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * 리소스 없음 에러
 */
class NotFoundError extends AppError {
  constructor(message = '리소스를 찾을 수 없습니다', details = null) {
    super(message, 404, 'NOT_FOUND_ERROR', details);
  }
}

/**
 * 충돌 에러
 */
class ConflictError extends AppError {
  constructor(message = '리소스 충돌이 발생했습니다', details = null) {
    super(message, 409, 'CONFLICT_ERROR', details);
  }
}

/**
 * 비즈니스 로직 에러
 */
class BusinessLogicError extends AppError {
  constructor(message = '비즈니스 로직 오류가 발생했습니다', details = null) {
    super(message, 422, 'BUSINESS_LOGIC_ERROR', details);
  }
}

/**
 * 외부 서비스 에러
 */
class ExternalServiceError extends AppError {
  constructor(message = '외부 서비스 오류가 발생했습니다', details = null) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', details);
  }
}

/**
 * 데이터베이스 에러
 */
class DatabaseError extends AppError {
  constructor(message = '데이터베이스 오류가 발생했습니다', details = null) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

/**
 * 결제 에러
 */
class PaymentError extends AppError {
  constructor(message = '결제 처리 중 오류가 발생했습니다', details = null) {
    super(message, 402, 'PAYMENT_ERROR', details);
  }
}

/**
 * 파일 업로드 에러
 */
class FileUploadError extends AppError {
  constructor(message = '파일 업로드 중 오류가 발생했습니다', details = null) {
    super(message, 413, 'FILE_UPLOAD_ERROR', details);
  }
}

/**
 * 요청 제한 에러
 */
class RateLimitError extends AppError {
  constructor(message = '요청 제한을 초과했습니다', details = null) {
    super(message, 429, 'RATE_LIMIT_ERROR', details);
  }
}

module.exports = {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  BusinessLogicError,
  ExternalServiceError,
  DatabaseError,
  PaymentError,
  FileUploadError,
  RateLimitError,
};
