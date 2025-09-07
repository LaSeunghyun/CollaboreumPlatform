const Redis = require('ioredis');
const { BusinessLogicError } = require('../../errors/AppError');
const { performanceLogger } = require('../../middleware/logger');

/**
 * Redis 캐시 서비스
 */
class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1시간
    this.retryDelay = 1000;
    this.maxRetries = 3;
    
    this.initializeConnection();
  }

  /**
   * Redis 연결 초기화
   */
  initializeConnection() {
    try {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: this.retryDelay,
        maxRetriesPerRequest: this.maxRetries,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
      };

      this.client = new Redis(redisConfig);

      this.client.on('connect', () => {
        console.log('✅ Redis 연결 성공');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        console.error('❌ Redis 연결 오류:', error);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('🔌 Redis 연결 종료');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Redis 재연결 시도 중...');
      });

    } catch (error) {
      console.error('❌ Redis 초기화 실패:', error);
      this.isConnected = false;
    }
  }

  /**
   * 연결 확인
   */
  async ensureConnection() {
    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        throw new BusinessLogicError(`Redis 연결 실패: ${error.message}`);
      }
    }
  }

  /**
   * 키 생성
   */
  generateKey(prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`;
  }

  /**
   * 값 저장
   */
  async set(key, value, ttl = this.defaultTTL) {
    const startTime = Date.now();
    
    try {
      await this.ensureConnection();
      
      const serializedValue = JSON.stringify(value);
      const result = await this.client.setex(key, ttl, serializedValue);
      
      performanceLogger.database.query('SET', 'redis', Date.now() - startTime, true);
      
      return result === 'OK';
    } catch (error) {
      performanceLogger.database.query('SET', 'redis', Date.now() - startTime, false);
      console.error(`Redis SET 오류 (${key}):`, error);
      return false;
    }
  }

  /**
   * 값 조회
   */
  async get(key) {
    const startTime = Date.now();
    
    try {
      await this.ensureConnection();
      
      const value = await this.client.get(key);
      
      performanceLogger.database.query('GET', 'redis', Date.now() - startTime, true);
      
      if (value === null) {
        return null;
      }
      
      return JSON.parse(value);
    } catch (error) {
      performanceLogger.database.query('GET', 'redis', Date.now() - startTime, false);
      console.error(`Redis GET 오류 (${key}):`, error);
      return null;
    }
  }

  /**
   * 값 삭제
   */
  async del(key) {
    const startTime = Date.now();
    
    try {
      await this.ensureConnection();
      
      const result = await this.client.del(key);
      
      performanceLogger.database.query('DEL', 'redis', Date.now() - startTime, true);
      
      return result > 0;
    } catch (error) {
      performanceLogger.database.query('DEL', 'redis', Date.now() - startTime, false);
      console.error(`Redis DEL 오류 (${key}):`, error);
      return false;
    }
  }

  /**
   * 여러 키 삭제
   */
  async delPattern(pattern) {
    const startTime = Date.now();
    
    try {
      await this.ensureConnection();
      
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      
      const result = await this.client.del(...keys);
      
      performanceLogger.database.query('DEL_PATTERN', 'redis', Date.now() - startTime, true);
      
      return result;
    } catch (error) {
      performanceLogger.database.query('DEL_PATTERN', 'redis', Date.now() - startTime, false);
      console.error(`Redis DEL_PATTERN 오류 (${pattern}):`, error);
      return 0;
    }
  }

  /**
   * TTL 설정
   */
  async expire(key, ttl) {
    try {
      await this.ensureConnection();
      return await this.client.expire(key, ttl);
    } catch (error) {
      console.error(`Redis EXPIRE 오류 (${key}):`, error);
      return false;
    }
  }

  /**
   * TTL 조회
   */
  async ttl(key) {
    try {
      await this.ensureConnection();
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`Redis TTL 오류 (${key}):`, error);
      return -1;
    }
  }

  /**
   * 해시 저장
   */
  async hset(key, field, value) {
    const startTime = Date.now();
    
    try {
      await this.ensureConnection();
      
      const serializedValue = JSON.stringify(value);
      const result = await this.client.hset(key, field, serializedValue);
      
      performanceLogger.database.query('HSET', 'redis', Date.now() - startTime, true);
      
      return result;
    } catch (error) {
      performanceLogger.database.query('HSET', 'redis', Date.now() - startTime, false);
      console.error(`Redis HSET 오류 (${key}:${field}):`, error);
      return false;
    }
  }

  /**
   * 해시 조회
   */
  async hget(key, field) {
    const startTime = Date.now();
    
    try {
      await this.ensureConnection();
      
      const value = await this.client.hget(key, field);
      
      performanceLogger.database.query('HGET', 'redis', Date.now() - startTime, true);
      
      if (value === null) {
        return null;
      }
      
      return JSON.parse(value);
    } catch (error) {
      performanceLogger.database.query('HGET', 'redis', Date.now() - startTime, false);
      console.error(`Redis HGET 오류 (${key}:${field}):`, error);
      return null;
    }
  }

  /**
   * 해시 전체 조회
   */
  async hgetall(key) {
    const startTime = Date.now();
    
    try {
      await this.ensureConnection();
      
      const hash = await this.client.hgetall(key);
      
      performanceLogger.database.query('HGETALL', 'redis', Date.now() - startTime, true);
      
      const result = {};
      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value;
        }
      }
      
      return result;
    } catch (error) {
      performanceLogger.database.query('HGETALL', 'redis', Date.now() - startTime, false);
      console.error(`Redis HGETALL 오류 (${key}):`, error);
      return {};
    }
  }

  /**
   * 해시 삭제
   */
  async hdel(key, field) {
    try {
      await this.ensureConnection();
      return await this.client.hdel(key, field);
    } catch (error) {
      console.error(`Redis HDEL 오류 (${key}:${field}):`, error);
      return false;
    }
  }

  /**
   * 리스트 추가
   */
  async lpush(key, ...values) {
    try {
      await this.ensureConnection();
      
      const serializedValues = values.map(v => JSON.stringify(v));
      return await this.client.lpush(key, ...serializedValues);
    } catch (error) {
      console.error(`Redis LPUSH 오류 (${key}):`, error);
      return false;
    }
  }

  /**
   * 리스트 조회
   */
  async lrange(key, start = 0, stop = -1) {
    try {
      await this.ensureConnection();
      
      const values = await this.client.lrange(key, start, stop);
      return values.map(v => {
        try {
          return JSON.parse(v);
        } catch {
          return v;
        }
      });
    } catch (error) {
      console.error(`Redis LRANGE 오류 (${key}):`, error);
      return [];
    }
  }

  /**
   * 캐시 또는 데이터베이스에서 조회 (Cache-Aside 패턴)
   */
  async getOrSet(key, fetchFunction, ttl = this.defaultTTL) {
    try {
      // 캐시에서 조회
      let value = await this.get(key);
      
      if (value !== null) {
        return value;
      }
      
      // 캐시에 없으면 데이터베이스에서 조회
      value = await fetchFunction();
      
      if (value !== null) {
        // 캐시에 저장
        await this.set(key, value, ttl);
      }
      
      return value;
    } catch (error) {
      console.error(`Redis getOrSet 오류 (${key}):`, error);
      // 캐시 오류 시 데이터베이스에서 직접 조회
      return await fetchFunction();
    }
  }

  /**
   * 캐시 무효화
   */
  async invalidate(pattern) {
    try {
      return await this.delPattern(pattern);
    } catch (error) {
      console.error(`Redis invalidate 오류 (${pattern}):`, error);
      return 0;
    }
  }

  /**
   * 캐시 통계
   */
  async getStats() {
    try {
      await this.ensureConnection();
      
      const info = await this.client.info('memory');
      const keyspace = await this.client.info('keyspace');
      
      return {
        connected: this.isConnected,
        memory: this.parseInfo(info),
        keyspace: this.parseInfo(keyspace),
        uptime: await this.client.uptime(),
      };
    } catch (error) {
      console.error('Redis 통계 조회 오류:', error);
      return {
        connected: false,
        error: error.message,
      };
    }
  }

  /**
   * Redis INFO 파싱
   */
  parseInfo(info) {
    const result = {};
    const lines = info.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * 연결 종료
   */
  async disconnect() {
    try {
      if (this.client) {
        await this.client.quit();
        this.isConnected = false;
      }
    } catch (error) {
      console.error('Redis 연결 종료 오류:', error);
    }
  }
}

module.exports = new RedisService();
