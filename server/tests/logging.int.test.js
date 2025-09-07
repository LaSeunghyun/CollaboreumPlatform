const request = require('supertest');
const express = require('express');
const pino = require('pino');

// 간단한 테스트용 앱 생성
const app = express();

// Pino 로거 미들웨어 적용
const pinoHttp = require('pino-http');
const { randomUUID } = require('node:crypto');

// 테스트용 로거 생성
const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

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
    ignorePaths: ['/healthz', '/favicon.ico'],
  },
  customLogLevel: function (res, err) {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});

app.use(express.json());
app.use(httpLogger);

// 테스트용 라우트
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/test', (_req, res) => {
  res.status(200).json({ message: 'Test successful' });
});

app.get('/error', (_req, res) => {
  res.status(500).json({ error: 'Test error' });
});

// 404 핸들러
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

describe('Logging & Request ID Integration Tests', () => {
  it('should set X-Request-ID header for successful requests', async () => {
    const res = await request(app).get('/healthz');
    
    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBeTruthy();
    expect(typeof res.headers['x-request-id']).toBe('string');
    expect(res.headers['x-request-id'].length).toBeGreaterThan(0);
  });

  it('should set X-Request-ID header for error responses', async () => {
    const res = await request(app).get('/error');
    
    expect(res.status).toBe(500);
    expect(res.headers['x-request-id']).toBeTruthy();
    expect(typeof res.headers['x-request-id']).toBe('string');
  });

  it('should set X-Request-ID header for 404 responses', async () => {
    const res = await request(app).get('/nonexistent');
    
    expect(res.status).toBe(404);
    expect(res.headers['x-request-id']).toBeTruthy();
    expect(typeof res.headers['x-request-id']).toBe('string');
  });

  it('should accept custom X-Request-ID header', async () => {
    const customId = 'custom-request-id-123';
    const res = await request(app)
      .get('/test')
      .set('X-Request-ID', customId);
    
    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBe(customId);
  });

  it('should accept X-Correlation-ID header as fallback', async () => {
    const correlationId = 'correlation-id-456';
    const res = await request(app)
      .get('/test')
      .set('X-Correlation-ID', correlationId);
    
    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBe(correlationId);
  });

  it('should generate unique request IDs for multiple requests', async () => {
    const res1 = await request(app).get('/test');
    const res2 = await request(app).get('/test');
    
    expect(res1.headers['x-request-id']).toBeTruthy();
    expect(res2.headers['x-request-id']).toBeTruthy();
    expect(res1.headers['x-request-id']).not.toBe(res2.headers['x-request-id']);
  });

  it('should handle JSON request body logging', async () => {
    const testData = { message: 'test data', number: 123 };
    const res = await request(app)
      .post('/test')
      .send(testData);
    
    expect(res.status).toBe(404); // POST /test는 정의되지 않음
    expect(res.headers['x-request-id']).toBeTruthy();
  });
});

describe('Logger Configuration Tests', () => {
  it('should have proper logger configuration', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('should log with proper structure', (done) => {
    const originalInfo = logger.info;
    let loggedData = null;
    
    logger.info = function(data, message) {
      loggedData = { data, message };
      originalInfo.call(this, data, message);
    };

    logger.info({ test: 'data' }, 'Test message');
    
    expect(loggedData).toBeDefined();
    expect(loggedData.message).toBe('Test message');
    expect(loggedData.data.test).toBe('data');
    
    // 원래 함수 복원
    logger.info = originalInfo;
    done();
  });
});
