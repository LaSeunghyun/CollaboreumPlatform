const { logger } = require('./index');

/**
 * 도메인 이벤트 로깅 함수
 * @param {Object} e 이벤트 데이터
 * @param {string} e.event 이벤트 이름 (예: 'funding.closed')
 * @param {string} [e.projectId] 프로젝트 ID
 * @param {string} [e.userId] 사용자 ID
 * @param {string} [msg] 로그 메시지
 */
function logEvent(e, msg) {
  logger.info(
    { ...e },
    msg || e.event
  );
}

// 도메인별 이벤트 로거 헬퍼 함수들
const fundingEvents = {
  created: (projectId, userId, amount) => 
    logEvent({
      event: 'funding.created',
      projectId,
      userId,
      amount,
    }, 'Funding project created'),

  closed: (projectId, success, totalPledged) => 
    logEvent({
      event: 'funding.closed',
      projectId,
      success,
      totalPledged,
    }, 'Funding project closed'),

  pledged: (projectId, userId, amount) => 
    logEvent({
      event: 'funding.pledged',
      projectId,
      userId,
      amount,
    }, 'User pledged to funding project'),

  refunded: (projectId, userId, amount) => 
    logEvent({
      event: 'funding.refunded',
      projectId,
      userId,
      amount,
    }, 'Funding refunded'),
};

const paymentEvents = {
  initiated: (projectId, userId, amount, method) => 
    logEvent({
      event: 'payment.initiated',
      projectId,
      userId,
      amount,
      method,
    }, 'Payment initiated'),

  completed: (projectId, userId, amount, transactionId) => 
    logEvent({
      event: 'payment.completed',
      projectId,
      userId,
      amount,
      transactionId,
    }, 'Payment completed'),

  failed: (projectId, userId, amount, reason) => 
    logEvent({
      event: 'payment.failed',
      projectId,
      userId,
      amount,
      reason,
    }, 'Payment failed'),
};

const distributionEvents = {
  started: (projectId, totalAmount, recipientCount) => 
    logEvent({
      event: 'distribution.started',
      projectId,
      totalAmount,
      recipientCount,
    }, 'Revenue distribution started'),

  completed: (projectId, totalDistributed, recipientCount) => 
    logEvent({
      event: 'distribution.completed',
      projectId,
      totalDistributed,
      recipientCount,
    }, 'Revenue distribution completed'),

  failed: (projectId, reason) => 
    logEvent({
      event: 'distribution.failed',
      projectId,
      reason,
    }, 'Revenue distribution failed'),
};

const userEvents = {
  registered: (userId, email, role) => 
    logEvent({
      event: 'user.registered',
      userId,
      email,
      role,
    }, 'User registered'),

  login: (userId, email) => 
    logEvent({
      event: 'user.login',
      userId,
      email,
    }, 'User logged in'),

  logout: (userId) => 
    logEvent({
      event: 'user.logout',
      userId,
    }, 'User logged out'),

  profileUpdated: (userId, fields) => 
    logEvent({
      event: 'user.profile_updated',
      userId,
      fields,
    }, 'User profile updated'),
};

module.exports = {
  logEvent,
  fundingEvents,
  paymentEvents,
  distributionEvents,
  userEvents,
};
