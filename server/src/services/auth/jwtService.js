const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
  AuthenticationError,
  BusinessLogicError,
} = require('../../errors/AppError');
const { businessLogger } = require('../../middleware/logger');

/**
 * JWT 서비스
 */
class JWTService {
  constructor() {
    this.accessTokenSecret =
      process.env.JWT_ACCESS_SECRET || 'default-access-secret';
    this.refreshTokenSecret =
      process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';

    // 토큰 블랙리스트 (Redis 사용 권장)
    this.tokenBlacklist = new Set();

    // 키 롤링을 위한 키 버전
    this.keyVersion = process.env.JWT_KEY_VERSION || '1';
  }

  /**
   * 액세스 토큰 생성
   */
  generateAccessToken(payload) {
    const tokenPayload = {
      ...payload,
      type: 'access',
      version: this.keyVersion,
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(tokenPayload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'collaboreum',
      audience: 'collaboreum-api',
    });
  }

  /**
   * 리프레시 토큰 생성
   */
  generateRefreshToken(payload) {
    const tokenPayload = {
      ...payload,
      type: 'refresh',
      version: this.keyVersion,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomUUID(), // JWT ID for tracking
    };

    return jwt.sign(tokenPayload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
      issuer: 'collaboreum',
      audience: 'collaboreum-api',
    });
  }

  /**
   * 토큰 쌍 생성
   */
  generateTokenPair(payload) {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiry(this.accessTokenExpiry),
    };
  }

  /**
   * 액세스 토큰 검증
   */
  verifyAccessToken(token) {
    try {
      // 블랙리스트 체크
      if (this.tokenBlacklist.has(token)) {
        throw new AuthenticationError('토큰이 블랙리스트에 등록되어 있습니다');
      }

      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'collaboreum',
        audience: 'collaboreum-api',
      });

      // 토큰 타입 검증
      if (decoded.type !== 'access') {
        throw new AuthenticationError('잘못된 토큰 타입입니다');
      }

      // 키 버전 검증
      if (decoded.version !== this.keyVersion) {
        throw new AuthenticationError('토큰이 만료되었습니다 (키 버전 불일치)');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('유효하지 않은 토큰입니다');
      } else if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('토큰이 만료되었습니다');
      } else if (error instanceof jwt.NotBeforeError) {
        throw new AuthenticationError('토큰이 아직 유효하지 않습니다');
      }
      throw error;
    }
  }

  /**
   * 리프레시 토큰 검증
   */
  verifyRefreshToken(token) {
    try {
      // 블랙리스트 체크
      if (this.tokenBlacklist.has(token)) {
        throw new AuthenticationError('토큰이 블랙리스트에 등록되어 있습니다');
      }

      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'collaboreum',
        audience: 'collaboreum-api',
      });

      // 토큰 타입 검증
      if (decoded.type !== 'refresh') {
        throw new AuthenticationError('잘못된 토큰 타입입니다');
      }

      // 키 버전 검증
      if (decoded.version !== this.keyVersion) {
        throw new AuthenticationError('토큰이 만료되었습니다 (키 버전 불일치)');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('유효하지 않은 리프레시 토큰입니다');
      } else if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('리프레시 토큰이 만료되었습니다');
      }
      throw error;
    }
  }

  /**
   * 토큰 갱신
   */
  refreshTokens(refreshToken) {
    const decoded = this.verifyRefreshToken(refreshToken);

    // 리프레시 토큰을 블랙리스트에 추가
    this.revokeToken(refreshToken);

    // 새로운 토큰 쌍 생성
    const newPayload = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions,
    };

    return this.generateTokenPair(newPayload);
  }

  /**
   * 토큰 폐기 (블랙리스트 추가)
   */
  revokeToken(token) {
    this.tokenBlacklist.add(token);

    // 메모리 정리 (실제로는 Redis TTL 사용 권장)
    setTimeout(
      () => {
        this.tokenBlacklist.delete(token);
      },
      this.parseExpiry(this.refreshTokenExpiry) * 1000,
    );
  }

  /**
   * 모든 토큰 폐기 (사용자 로그아웃)
   */
  revokeAllUserTokens(userId) {
    // 실제로는 Redis에서 사용자별 토큰들을 찾아서 폐기
    // 여기서는 간단히 로그만 남김
    businessLogger.auth.logout(userId, null);
  }

  /**
   * 토큰에서 사용자 정보 추출
   */
  extractUserFromToken(token) {
    const decoded = this.verifyAccessToken(token);

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
    };
  }

  /**
   * 권한 검증
   */
  hasPermission(token, requiredPermission) {
    try {
      const user = this.extractUserFromToken(token);

      // 관리자는 모든 권한을 가짐
      if (user.role === 'admin') {
        return true;
      }

      // 권한 배열에서 검색
      return user.permissions && user.permissions.includes(requiredPermission);
    } catch (error) {
      return false;
    }
  }

  /**
   * 역할 검증
   */
  hasRole(token, requiredRole) {
    try {
      const user = this.extractUserFromToken(token);
      return user.role === requiredRole;
    } catch (error) {
      return false;
    }
  }

  /**
   * 여러 역할 중 하나라도 있는지 검증
   */
  hasAnyRole(token, requiredRoles) {
    try {
      const user = this.extractUserFromToken(token);
      return requiredRoles.includes(user.role);
    } catch (error) {
      return false;
    }
  }

  /**
   * 만료 시간 파싱
   */
  parseExpiry(expiry) {
    const units = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new BusinessLogicError('잘못된 만료 시간 형식입니다');
    }

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  /**
   * 키 롤링 (보안 강화)
   */
  rotateKeys() {
    // 새로운 키 생성
    this.accessTokenSecret = crypto.randomBytes(64).toString('hex');
    this.refreshTokenSecret = crypto.randomBytes(64).toString('hex');
    this.keyVersion = (parseInt(this.keyVersion) + 1).toString();

    // 환경변수 업데이트 (실제로는 안전한 키 관리 시스템 사용)
    process.env.JWT_ACCESS_SECRET = this.accessTokenSecret;
    process.env.JWT_REFRESH_SECRET = this.refreshTokenSecret;
    process.env.JWT_KEY_VERSION = this.keyVersion;

    businessLogger.auth.tokenRefresh(null, true);
  }

  /**
   * 토큰 통계
   */
  getTokenStats() {
    return {
      blacklistSize: this.tokenBlacklist.size,
      keyVersion: this.keyVersion,
      accessTokenExpiry: this.accessTokenExpiry,
      refreshTokenExpiry: this.refreshTokenExpiry,
    };
  }

  /**
   * 보안 헤더 생성
   */
  generateSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    };
  }
}

module.exports = new JWTService();
