const { BusinessLogicError } = require('../../errors/AppError');

/**
 * 펀딩 프로젝트 상태 머신
 */
class FundingProjectStateMachine {
  constructor() {
    // 상태 전이 규칙 정의
    this.transitions = {
      draft: ['collecting'],
      collecting: ['succeeded', 'failed'],
      succeeded: ['executing'],
      failed: ['closed'],
      executing: ['distributing'],
      distributing: ['closed'],
      closed: [], // 종료 상태는 더 이상 전이할 수 없음
    };

    // 상태별 허용된 작업 정의
    this.allowedActions = {
      draft: [
        'update',
        'delete',
        'publish', // collecting으로 전이
      ],
      collecting: [
        'update',
        'receive_pledge',
        'check_goal', // 목표 달성 체크
        'extend_deadline', // 마감일 연장
      ],
      succeeded: [
        'start_execution', // executing으로 전이
        'create_execution',
        'view_executions',
      ],
      failed: [
        'process_refunds', // 환불 처리
        'close', // closed로 전이
      ],
      executing: [
        'create_execution',
        'approve_execution',
        'reject_execution',
        'upload_receipt',
        'start_distribution', // distributing으로 전이
      ],
      distributing: [
        'execute_distribution',
        'view_distributions',
        'close', // closed로 전이
      ],
      closed: [
        'view',
        'view_executions',
        'view_distributions',
      ],
    };
  }

  /**
   * 상태 전이가 유효한지 확인
   */
  canTransition(from, to) {
    return this.transitions[from]?.includes(to) || false;
  }

  /**
   * 특정 상태에서 작업이 허용되는지 확인
   */
  canPerformAction(status, action) {
    return this.allowedActions[status]?.includes(action) || false;
  }

  /**
   * 상태 전이 실행
   */
  transition(currentStatus, newStatus, context = {}) {
    if (!this.canTransition(currentStatus, newStatus)) {
      throw new BusinessLogicError(
        `상태 전이가 허용되지 않습니다: ${currentStatus} → ${newStatus}`,
        { currentStatus, newStatus, context }
      );
    }

    // 상태별 전이 검증
    this.validateTransition(currentStatus, newStatus, context);

    return {
      from: currentStatus,
      to: newStatus,
      timestamp: new Date(),
      context,
    };
  }

  /**
   * 상태별 전이 검증
   */
  validateTransition(from, to, context) {
    switch (from) {
      case 'draft':
        if (to === 'collecting') {
          this.validatePublishRequirements(context);
        }
        break;
      
      case 'collecting':
        if (to === 'succeeded') {
          this.validateSuccessRequirements(context);
        } else if (to === 'failed') {
          this.validateFailureRequirements(context);
        }
        break;
      
      case 'succeeded':
        if (to === 'executing') {
          this.validateExecutionStartRequirements(context);
        }
        break;
      
      case 'failed':
        if (to === 'closed') {
          this.validateRefundCompletion(context);
        }
        break;
      
      case 'executing':
        if (to === 'distributing') {
          this.validateDistributionStartRequirements(context);
        }
        break;
      
      case 'distributing':
        if (to === 'closed') {
          this.validateDistributionCompletion(context);
        }
        break;
    }
  }

  /**
   * 발행 요구사항 검증
   */
  validatePublishRequirements(context) {
    const { project } = context;
    
    if (!project) {
      throw new BusinessLogicError('프로젝트 정보가 필요합니다');
    }

    if (!project.title || !project.description) {
      throw new BusinessLogicError('제목과 설명은 필수입니다');
    }

    if (!project.targetAmount || project.targetAmount <= 0) {
      throw new BusinessLogicError('목표 금액은 0보다 커야 합니다');
    }

    if (!project.endDate || project.endDate <= new Date()) {
      throw new BusinessLogicError('마감일은 현재 시간보다 이후여야 합니다');
    }

    if (!project.rewards || project.rewards.length === 0) {
      throw new BusinessLogicError('최소 1개의 리워드가 필요합니다');
    }

    if (!project.images || project.images.length === 0) {
      throw new BusinessLogicError('최소 1개의 이미지가 필요합니다');
    }
  }

  /**
   * 성공 요구사항 검증
   */
  validateSuccessRequirements(context) {
    const { project } = context;
    
    if (!project) {
      throw new BusinessLogicError('프로젝트 정보가 필요합니다');
    }

    if (project.currentAmount < project.targetAmount) {
      throw new BusinessLogicError('목표 금액에 도달하지 않았습니다');
    }

    if (project.endDate > new Date()) {
      throw new BusinessLogicError('아직 마감일이 지나지 않았습니다');
    }
  }

  /**
   * 실패 요구사항 검증
   */
  validateFailureRequirements(context) {
    const { project } = context;
    
    if (!project) {
      throw new BusinessLogicError('프로젝트 정보가 필요합니다');
    }

    if (project.currentAmount >= project.targetAmount) {
      throw new BusinessLogicError('목표 금액에 도달했으므로 실패 상태로 전이할 수 없습니다');
    }

    if (project.endDate > new Date()) {
      throw new BusinessLogicError('아직 마감일이 지나지 않았습니다');
    }
  }

  /**
   * 집행 시작 요구사항 검증
   */
  validateExecutionStartRequirements(context) {
    const { project } = context;
    
    if (!project) {
      throw new BusinessLogicError('프로젝트 정보가 필요합니다');
    }

    // 성공한 프로젝트만 집행할 수 있음
    if (project.status !== 'succeeded') {
      throw new BusinessLogicError('성공한 프로젝트만 집행할 수 있습니다');
    }
  }

  /**
   * 환불 완료 검증
   */
  validateRefundCompletion(context) {
    const { project } = context;
    
    if (!project) {
      throw new BusinessLogicError('프로젝트 정보가 필요합니다');
    }

    // 모든 환불이 완료되었는지 확인
    const pendingRefunds = project.pledges?.filter(
      pledge => pledge.status === 'authorized' || pledge.status === 'captured'
    ) || [];

    if (pendingRefunds.length > 0) {
      throw new BusinessLogicError('아직 환불되지 않은 후원이 있습니다');
    }
  }

  /**
   * 분배 시작 요구사항 검증
   */
  validateDistributionStartRequirements(context) {
    const { project } = context;
    
    if (!project) {
      throw new BusinessLogicError('프로젝트 정보가 필요합니다');
    }

    // 집행이 완료되었는지 확인
    const pendingExecutions = project.executions?.filter(
      execution => execution.status === 'pending' || execution.status === 'approved'
    ) || [];

    if (pendingExecutions.length > 0) {
      throw new BusinessLogicError('아직 완료되지 않은 집행이 있습니다');
    }
  }

  /**
   * 분배 완료 검증
   */
  validateDistributionCompletion(context) {
    const { project } = context;
    
    if (!project) {
      throw new BusinessLogicError('프로젝트 정보가 필요합니다');
    }

    // 모든 분배가 완료되었는지 확인
    const pendingDistributions = project.distributions?.filter(
      distribution => distribution.status !== 'executed'
    ) || [];

    if (pendingDistributions.length > 0) {
      throw new BusinessLogicError('아직 완료되지 않은 분배가 있습니다');
    }
  }

  /**
   * 자동 상태 전이 체크 (스케줄러에서 사용)
   */
  checkAutomaticTransitions(project) {
    const now = new Date();
    const transitions = [];

    // collecting → succeeded/failed 자동 전이
    if (project.status === 'collecting' && project.endDate <= now) {
      if (project.currentAmount >= project.targetAmount) {
        transitions.push({
          from: 'collecting',
          to: 'succeeded',
          reason: 'goal_achieved',
          timestamp: now,
        });
      } else {
        transitions.push({
          from: 'collecting',
          to: 'failed',
          reason: 'goal_not_achieved',
          timestamp: now,
        });
      }
    }

    return transitions;
  }

  /**
   * 상태별 허용된 API 엔드포인트 반환
   */
  getAllowedEndpoints(status) {
    const actionToEndpoints = {
      update: ['PUT /api/funding/projects/:id'],
      delete: ['DELETE /api/funding/projects/:id'],
      publish: ['POST /api/funding/projects/:id/publish'],
      receive_pledge: ['POST /api/funding/pledges'],
      check_goal: ['POST /api/funding/projects/:id/check-goal'],
      extend_deadline: ['POST /api/funding/projects/:id/extend-deadline'],
      start_execution: ['POST /api/funding/projects/:id/start-execution'],
      create_execution: ['POST /api/funding/executions'],
      view_executions: ['GET /api/funding/projects/:id/executions'],
      process_refunds: ['POST /api/funding/projects/:id/process-refunds'],
      close: ['POST /api/funding/projects/:id/close'],
      approve_execution: ['PUT /api/funding/executions/:id/approve'],
      reject_execution: ['PUT /api/funding/executions/:id/reject'],
      upload_receipt: ['POST /api/funding/executions/:id/receipts'],
      start_distribution: ['POST /api/funding/projects/:id/start-distribution'],
      execute_distribution: ['POST /api/funding/distributions/:id/execute'],
      view_distributions: ['GET /api/funding/projects/:id/distributions'],
      view: ['GET /api/funding/projects/:id'],
    };

    const allowedActions = this.allowedActions[status] || [];
    const allowedEndpoints = [];

    allowedActions.forEach(action => {
      const endpoints = actionToEndpoints[action] || [];
      allowedEndpoints.push(...endpoints);
    });

    return allowedEndpoints;
  }
}

module.exports = new FundingProjectStateMachine();
