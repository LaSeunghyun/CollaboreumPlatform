const axios = require('axios');
const crypto = require('crypto');

// 결제 게이트웨이 설정
const PAYMENT_CONFIG = {
  // 토스페이먼츠 설정 (실제 키로 교체 필요)
  toss: {
    clientKey: process.env.TOSS_CLIENT_KEY || 'test_ck_xxx',
    secretKey: process.env.TOSS_SECRET_KEY || 'test_sk_xxx',
    baseURL: process.env.NODE_ENV === 'production' 
      ? 'https://api.tosspayments.com' 
      : 'https://api.tosspayments.com',
  },
  // 아임포트 설정 (백업용)
  iamport: {
    impKey: process.env.IMP_KEY || 'imp_xxx',
    impSecret: process.env.IMP_SECRET || 'imp_xxx',
    baseURL: 'https://api.iamport.kr',
  }
};

class PaymentService {
  constructor() {
    this.tossClient = axios.create({
      baseURL: PAYMENT_CONFIG.toss.baseURL,
      headers: {
        'Authorization': `Basic ${Buffer.from(PAYMENT_CONFIG.toss.secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    this.iamportClient = axios.create({
      baseURL: PAYMENT_CONFIG.iamport.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // 토스페이먼츠 결제 요청 생성
  async createTossPayment(paymentData) {
    try {
      const { projectId, amount, backerInfo, rewardId } = paymentData;
      
      // 주문 ID 생성 (고유성 보장)
      const orderId = `collaboreum_${projectId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const paymentRequest = {
        orderId,
        amount: amount,
        currency: 'KRW',
        orderName: `콜라보리움 프로젝트 후원`,
        customerName: backerInfo.name,
        customerEmail: backerInfo.email,
        customerMobilePhone: backerInfo.phone,
        successUrl: `${process.env.CLIENT_URL}/payment/success`,
        failUrl: `${process.env.CLIENT_URL}/payment/fail`,
        metadata: {
          projectId,
          rewardId,
          backerName: backerInfo.name,
        }
      };

      const response = await this.tossClient.post('/v1/payments', paymentRequest);
      
      return {
        success: true,
        data: {
          paymentId: response.data.paymentKey,
          orderId: orderId,
          amount: amount,
          status: 'pending',
          paymentUrl: response.data.checkoutPage,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30분 후 만료
        }
      };
    } catch (error) {
      console.error('토스페이먼츠 결제 생성 실패:', error.response?.data || error.message);
      return {
        success: false,
        message: '결제 요청 생성에 실패했습니다.',
        error: error.response?.data?.message || error.message
      };
    }
  }

  // 결제 승인 처리
  async confirmTossPayment(paymentKey, orderId, amount) {
    try {
      const response = await this.tossClient.post(`/v1/payments/${paymentKey}`, {
        orderId,
        amount
      });

      return {
        success: true,
        data: {
          paymentId: paymentKey,
          orderId: orderId,
          amount: amount,
          status: 'completed',
          transactionId: response.data.transactionKey,
          approvedAt: response.data.approvedAt,
          method: response.data.method,
          card: response.data.card,
        }
      };
    } catch (error) {
      console.error('토스페이먼츠 결제 승인 실패:', error.response?.data || error.message);
      return {
        success: false,
        message: '결제 승인에 실패했습니다.',
        error: error.response?.data?.message || error.message
      };
    }
  }

  // 결제 취소
  async cancelTossPayment(paymentKey, cancelReason, cancelAmount) {
    try {
      const response = await this.tossClient.post(`/v1/payments/${paymentKey}/cancel`, {
        cancelReason,
        cancelAmount
      });

      return {
        success: true,
        data: {
          paymentId: paymentKey,
          status: 'cancelled',
          cancelledAt: response.data.cancelledAt,
          cancelAmount: cancelAmount,
          cancelReason: cancelReason,
        }
      };
    } catch (error) {
      console.error('토스페이먼츠 결제 취소 실패:', error.response?.data || error.message);
      return {
        success: false,
        message: '결제 취소에 실패했습니다.',
        error: error.response?.data?.message || error.message
      };
    }
  }

  // 환불 처리
  async refundTossPayment(paymentKey, refundReason, refundAmount) {
    try {
      const response = await this.tossClient.post(`/v1/payments/${paymentKey}/cancel`, {
        cancelReason: refundReason,
        cancelAmount: refundAmount,
        refundableAmount: refundAmount
      });

      return {
        success: true,
        data: {
          paymentId: paymentKey,
          refundId: response.data.cancelId,
          amount: refundAmount,
          status: 'completed',
          refundedAt: response.data.cancelledAt,
          reason: refundReason,
        }
      };
    } catch (error) {
      console.error('토스페이먼츠 환불 실패:', error.response?.data || error.message);
      return {
        success: false,
        message: '환불 처리에 실패했습니다.',
        error: error.response?.data?.message || error.message
      };
    }
  }

  // 결제 상태 조회
  async getTossPaymentStatus(paymentKey) {
    try {
      const response = await this.tossClient.get(`/v1/payments/${paymentKey}`);

      return {
        success: true,
        data: {
          paymentId: paymentKey,
          orderId: response.data.orderId,
          amount: response.data.totalAmount,
          status: response.data.status === 'DONE' ? 'completed' : 'pending',
          method: response.data.method,
          approvedAt: response.data.approvedAt,
          card: response.data.card,
        }
      };
    } catch (error) {
      console.error('토스페이먼츠 결제 상태 조회 실패:', error.response?.data || error.message);
      return {
        success: false,
        message: '결제 상태 조회에 실패했습니다.',
        error: error.response?.data?.message || error.message
      };
    }
  }

  // 웹훅 서명 검증
  verifyWebhookSignature(payload, signature, secret) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // 결제 검증 (중복 결제 방지)
  async validatePayment(paymentData) {
    const { projectId, amount, backerInfo } = paymentData;
    
    // 1. 프로젝트 존재 여부 확인
    const Project = require('../models/FundingProject');
    const project = await Project.findById(projectId);
    if (!project) {
      return { valid: false, message: '존재하지 않는 프로젝트입니다.' };
    }

    // 2. 프로젝트 상태 확인
    if (project.status !== 'active') {
      return { valid: false, message: '현재 후원을 받지 않는 프로젝트입니다.' };
    }

    // 3. 목표 금액 달성 여부 확인
    if (project.currentAmount >= project.targetAmount) {
      return { valid: false, message: '이미 목표 금액을 달성한 프로젝트입니다.' };
    }

    // 4. 최소/최대 후원 금액 확인
    if (amount < 1000) {
      return { valid: false, message: '최소 후원 금액은 1,000원입니다.' };
    }

    if (amount > 10000000) {
      return { valid: false, message: '최대 후원 금액은 10,000,000원입니다.' };
    }

    // 5. 중복 결제 확인 (같은 사용자가 같은 프로젝트에 중복 결제 방지)
    const Payment = require('../models/Payment');
    const existingPayment = await Payment.findOne({
      projectId,
      backerEmail: backerInfo.email,
      status: { $in: ['pending', 'completed'] }
    });

    if (existingPayment) {
      return { valid: false, message: '이미 후원한 프로젝트입니다.' };
    }

    return { valid: true };
  }
}

module.exports = new PaymentService();
