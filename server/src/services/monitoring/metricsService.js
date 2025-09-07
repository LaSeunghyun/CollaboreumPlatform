const { performanceLogger } = require('../../middleware/logger');

/**
 * 메트릭 수집 서비스
 */
class MetricsService {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byEndpoint: {},
        byMethod: {},
        responseTime: {
          min: Infinity,
          max: 0,
          sum: 0,
          count: 0,
        },
      },
      database: {
        queries: {
          total: 0,
          successful: 0,
          failed: 0,
          byCollection: {},
          responseTime: {
            min: Infinity,
            max: 0,
            sum: 0,
            count: 0,
          },
        },
        connections: {
          active: 0,
          total: 0,
          errors: 0,
        },
      },
      cache: {
        hits: 0,
        misses: 0,
        operations: {
          get: 0,
          set: 0,
          del: 0,
        },
        responseTime: {
          min: Infinity,
          max: 0,
          sum: 0,
          count: 0,
        },
      },
      business: {
        funding: {
          projectsCreated: 0,
          pledgesCreated: 0,
          totalAmount: 0,
          successfulProjects: 0,
          failedProjects: 0,
        },
        users: {
          registrations: 0,
          logins: 0,
          activeUsers: 0,
        },
      },
      system: {
        memory: {
          used: 0,
          free: 0,
          total: 0,
        },
        cpu: {
          usage: 0,
        },
        uptime: 0,
      },
    };

    this.startTime = Date.now();
    this.resetInterval = 24 * 60 * 60 * 1000; // 24시간마다 리셋
    
    // 주기적 리셋 설정
    setInterval(() => {
      this.resetDailyMetrics();
    }, this.resetInterval);
  }

  /**
   * 요청 메트릭 기록
   */
  recordRequest(method, endpoint, statusCode, responseTime) {
    this.metrics.requests.total++;
    
    if (statusCode >= 200 && statusCode < 400) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }

    // 엔드포인트별 통계
    const key = `${method} ${endpoint}`;
    if (!this.metrics.requests.byEndpoint[key]) {
      this.metrics.requests.byEndpoint[key] = {
        total: 0,
        successful: 0,
        failed: 0,
        responseTime: { min: Infinity, max: 0, sum: 0, count: 0 },
      };
    }
    
    const endpointMetrics = this.metrics.requests.byEndpoint[key];
    endpointMetrics.total++;
    if (statusCode >= 200 && statusCode < 400) {
      endpointMetrics.successful++;
    } else {
      endpointMetrics.failed++;
    }
    this.updateResponseTime(endpointMetrics.responseTime, responseTime);

    // 메서드별 통계
    if (!this.metrics.requests.byMethod[method]) {
      this.metrics.requests.byMethod[method] = {
        total: 0,
        successful: 0,
        failed: 0,
      };
    }
    
    const methodMetrics = this.metrics.requests.byMethod[method];
    methodMetrics.total++;
    if (statusCode >= 200 && statusCode < 400) {
      methodMetrics.successful++;
    } else {
      methodMetrics.failed++;
    }

    // 전체 응답 시간 통계
    this.updateResponseTime(this.metrics.requests.responseTime, responseTime);
  }

  /**
   * 데이터베이스 쿼리 메트릭 기록
   */
  recordDatabaseQuery(collection, operation, success, responseTime) {
    this.metrics.database.queries.total++;
    
    if (success) {
      this.metrics.database.queries.successful++;
    } else {
      this.metrics.database.queries.failed++;
    }

    // 컬렉션별 통계
    if (!this.metrics.database.queries.byCollection[collection]) {
      this.metrics.database.queries.byCollection[collection] = {
        total: 0,
        successful: 0,
        failed: 0,
        operations: {},
      };
    }
    
    const collectionMetrics = this.metrics.database.queries.byCollection[collection];
    collectionMetrics.total++;
    if (success) {
      collectionMetrics.successful++;
    } else {
      collectionMetrics.failed++;
    }

    // 작업별 통계
    if (!collectionMetrics.operations[operation]) {
      collectionMetrics.operations[operation] = 0;
    }
    collectionMetrics.operations[operation]++;

    // 응답 시간 통계
    this.updateResponseTime(this.metrics.database.queries.responseTime, responseTime);
  }

  /**
   * 캐시 메트릭 기록
   */
  recordCacheOperation(operation, hit, responseTime) {
    if (operation === 'get') {
      if (hit) {
        this.metrics.cache.hits++;
      } else {
        this.metrics.cache.misses++;
      }
    }

    this.metrics.cache.operations[operation]++;
    this.updateResponseTime(this.metrics.cache.responseTime, responseTime);
  }

  /**
   * 비즈니스 메트릭 기록
   */
  recordBusinessMetric(category, metric, value = 1) {
    if (!this.metrics.business[category]) {
      this.metrics.business[category] = {};
    }
    
    if (!this.metrics.business[category][metric]) {
      this.metrics.business[category][metric] = 0;
    }
    
    this.metrics.business[category][metric] += value;
  }

  /**
   * 시스템 메트릭 업데이트
   */
  updateSystemMetrics() {
    const memUsage = process.memoryUsage();
    this.metrics.system.memory.used = memUsage.heapUsed;
    this.metrics.system.memory.free = memUsage.heapTotal - memUsage.heapUsed;
    this.metrics.system.memory.total = memUsage.heapTotal;
    
    this.metrics.system.uptime = Date.now() - this.startTime;
  }

  /**
   * 응답 시간 통계 업데이트
   */
  updateResponseTime(stats, responseTime) {
    stats.min = Math.min(stats.min, responseTime);
    stats.max = Math.max(stats.max, responseTime);
    stats.sum += responseTime;
    stats.count++;
  }

  /**
   * 메트릭 조회
   */
  getMetrics() {
    this.updateSystemMetrics();
    return {
      ...this.metrics,
      calculated: this.calculateDerivedMetrics(),
    };
  }

  /**
   * 파생 메트릭 계산
   */
  calculateDerivedMetrics() {
    const requests = this.metrics.requests;
    const db = this.metrics.database.queries;
    const cache = this.metrics.cache;

    return {
      successRate: requests.total > 0 ? (requests.successful / requests.total) * 100 : 0,
      errorRate: requests.total > 0 ? (requests.failed / requests.total) * 100 : 0,
      avgResponseTime: requests.responseTime.count > 0 ? 
        requests.responseTime.sum / requests.responseTime.count : 0,
      dbSuccessRate: db.total > 0 ? (db.successful / db.total) * 100 : 0,
      cacheHitRate: (cache.hits + cache.misses) > 0 ? 
        (cache.hits / (cache.hits + cache.misses)) * 100 : 0,
      avgDbResponseTime: db.responseTime.count > 0 ? 
        db.responseTime.sum / db.responseTime.count : 0,
      avgCacheResponseTime: cache.responseTime.count > 0 ? 
        cache.responseTime.sum / cache.responseTime.count : 0,
    };
  }

  /**
   * SLO/SLI 계산
   */
  calculateSLOs() {
    const calculated = this.calculateDerivedMetrics();
    
    return {
      availability: {
        target: 99.9, // 99.9% 가용성 목표
        current: calculated.successRate,
        status: calculated.successRate >= 99.9 ? 'healthy' : 'degraded',
      },
      latency: {
        target: 200, // 200ms 응답 시간 목표
        current: calculated.avgResponseTime,
        status: calculated.avgResponseTime <= 200 ? 'healthy' : 'degraded',
      },
      errorRate: {
        target: 0.1, // 0.1% 에러율 목표
        current: calculated.errorRate,
        status: calculated.errorRate <= 0.1 ? 'healthy' : 'degraded',
      },
    };
  }

  /**
   * 알람 조건 확인
   */
  checkAlerts() {
    const slos = this.calculateSLOs();
    const alerts = [];

    // 가용성 알람
    if (slos.availability.status === 'degraded') {
      alerts.push({
        type: 'availability',
        severity: 'critical',
        message: `가용성이 목표치 이하: ${slos.availability.current.toFixed(2)}%`,
        threshold: slos.availability.target,
        current: slos.availability.current,
      });
    }

    // 응답 시간 알람
    if (slos.latency.status === 'degraded') {
      alerts.push({
        type: 'latency',
        severity: 'warning',
        message: `응답 시간이 목표치 초과: ${slos.latency.current.toFixed(2)}ms`,
        threshold: slos.latency.target,
        current: slos.latency.current,
      });
    }

    // 에러율 알람
    if (slos.errorRate.status === 'degraded') {
      alerts.push({
        type: 'error_rate',
        severity: 'critical',
        message: `에러율이 목표치 초과: ${slos.errorRate.current.toFixed(2)}%`,
        threshold: slos.errorRate.target,
        current: slos.errorRate.current,
      });
    }

    // 메모리 사용률 알람
    const memoryUsagePercent = (this.metrics.system.memory.used / this.metrics.system.memory.total) * 100;
    if (memoryUsagePercent > 90) {
      alerts.push({
        type: 'memory',
        severity: 'warning',
        message: `메모리 사용률이 높음: ${memoryUsagePercent.toFixed(2)}%`,
        threshold: 90,
        current: memoryUsagePercent,
      });
    }

    return alerts;
  }

  /**
   * 일일 메트릭 리셋
   */
  resetDailyMetrics() {
    this.metrics.requests = {
      total: 0,
      successful: 0,
      failed: 0,
      byEndpoint: {},
      byMethod: {},
      responseTime: { min: Infinity, max: 0, sum: 0, count: 0 },
    };

    this.metrics.database.queries = {
      total: 0,
      successful: 0,
      failed: 0,
      byCollection: {},
      responseTime: { min: Infinity, max: 0, sum: 0, count: 0 },
    };

    this.metrics.cache = {
      hits: 0,
      misses: 0,
      operations: { get: 0, set: 0, del: 0 },
      responseTime: { min: Infinity, max: 0, sum: 0, count: 0 },
    };

    console.log('📊 일일 메트릭 리셋 완료');
  }

  /**
   * 메트릭 내보내기 (Prometheus 형식)
   */
  exportPrometheusMetrics() {
    const metrics = this.getMetrics();
    const calculated = metrics.calculated;
    
    let prometheus = '';
    
    // HTTP 요청 메트릭
    prometheus += `# HELP http_requests_total Total number of HTTP requests\n`;
    prometheus += `# TYPE http_requests_total counter\n`;
    prometheus += `http_requests_total ${metrics.requests.total}\n\n`;
    
    prometheus += `# HELP http_requests_successful_total Total number of successful HTTP requests\n`;
    prometheus += `# TYPE http_requests_successful_total counter\n`;
    prometheus += `http_requests_successful_total ${metrics.requests.successful}\n\n`;
    
    prometheus += `# HELP http_request_duration_seconds Average HTTP request duration\n`;
    prometheus += `# TYPE http_request_duration_seconds gauge\n`;
    prometheus += `http_request_duration_seconds ${calculated.avgResponseTime / 1000}\n\n`;
    
    // 데이터베이스 메트릭
    prometheus += `# HELP database_queries_total Total number of database queries\n`;
    prometheus += `# TYPE database_queries_total counter\n`;
    prometheus += `database_queries_total ${metrics.database.queries.total}\n\n`;
    
    // 캐시 메트릭
    prometheus += `# HELP cache_hit_rate Cache hit rate\n`;
    prometheus += `# TYPE cache_hit_rate gauge\n`;
    prometheus += `cache_hit_rate ${calculated.cacheHitRate / 100}\n\n`;
    
    // 비즈니스 메트릭
    prometheus += `# HELP funding_projects_created_total Total number of funding projects created\n`;
    prometheus += `# TYPE funding_projects_created_total counter\n`;
    prometheus += `funding_projects_created_total ${metrics.business.funding.projectsCreated}\n\n`;
    
    return prometheus;
  }
}

module.exports = new MetricsService();
