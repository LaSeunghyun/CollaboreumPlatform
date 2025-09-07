/**
 * 로그 샘플링 유틸리티
 * 과다 로그를 방지하고 성능을 최적화하기 위한 샘플링 기능
 */

/**
 * 주어진 확률로 샘플링 여부를 결정
 * @param {number} rate 샘플링 비율 (0.0 ~ 1.0)
 * @returns {boolean} 샘플링할지 여부
 */
function shouldSample(rate = 1) {
  if (rate >= 1) return true;
  if (rate <= 0) return false;
  return Math.random() < rate;
}

/**
 * 요청 기반 샘플링 (요청 ID의 해시를 사용하여 일관된 샘플링)
 * @param {string} requestId 요청 ID
 * @param {number} rate 샘플링 비율 (0.0 ~ 1.0)
 * @returns {boolean} 샘플링할지 여부
 */
function shouldSampleByRequest(requestId, rate = 1) {
  if (rate >= 1) return true;
  if (rate <= 0) return false;
  
  // 요청 ID의 해시를 사용하여 일관된 샘플링
  let hash = 0;
  for (let i = 0; i < requestId.length; i++) {
    const char = requestId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit 정수로 변환
  }
  
  // 절댓값을 사용하여 양수로 변환하고 0-1 범위로 정규화
  const normalizedHash = Math.abs(hash) / 2147483647; // 2^31 - 1
  return normalizedHash < rate;
}

/**
 * 시간 기반 샘플링 (특정 시간 간격으로만 로그)
 * @param {number} intervalMs 샘플링 간격 (밀리초)
 * @param {Date} lastLogTime 마지막 로그 시간 (Date 객체)
 * @returns {boolean} 샘플링할지 여부
 */
function shouldSampleByTime(intervalMs, lastLogTime) {
  if (!lastLogTime) return true;
  
  const now = new Date();
  const timeDiff = now.getTime() - lastLogTime.getTime();
  return timeDiff >= intervalMs;
}

/**
 * 로그 레벨별 샘플링 설정
 */
const LOG_SAMPLING_CONFIG = {
  // 개발 환경에서는 모든 로그 허용
  development: {
    info: 1.0,
    warn: 1.0,
    error: 1.0,
    debug: 1.0,
  },
  // 프로덕션 환경에서는 일부 로그만 샘플링
  production: {
    info: 0.1,    // 10%만 로그
    warn: 0.5,    // 50%만 로그
    error: 1.0,   // 모든 에러 로그
    debug: 0.01,  // 1%만 로그
  },
  // 테스트 환경에서는 최소한의 로그
  test: {
    info: 0.0,
    warn: 0.0,
    error: 1.0,
    debug: 0.0,
  },
};

/**
 * 환경에 따른 샘플링 비율 반환
 * @param {string} level 로그 레벨
 * @returns {number} 샘플링 비율
 */
function getSamplingRate(level) {
  const env = process.env.NODE_ENV || 'development';
  const config = LOG_SAMPLING_CONFIG[env] || LOG_SAMPLING_CONFIG.development;
  return config[level] || 1.0;
}

/**
 * 샘플링이 필요한 로그인지 확인
 * @param {string} level 로그 레벨
 * @param {string} requestId 요청 ID (선택사항)
 * @returns {boolean} 샘플링할지 여부
 */
function shouldLog(level, requestId) {
  const rate = getSamplingRate(level);
  
  if (requestId) {
    return shouldSampleByRequest(requestId, rate);
  }
  
  return shouldSample(rate);
}

module.exports = {
  shouldSample,
  shouldSampleByRequest,
  shouldSampleByTime,
  getSamplingRate,
  shouldLog,
  LOG_SAMPLING_CONFIG,
};

// 사용 예시:
// const { shouldLog } = require('./src/logger/sampling');
// if (shouldLog('info', req.reqId)) {
//   logger.info({ ...data }, 'Heavy endpoint log');
// }
