const mongoose = require('mongoose');
const { performanceLogger } = require('../src/middleware/logger');

/**
 * 데이터베이스 마이그레이션 스크립트
 */
class MigrationManager {
  constructor() {
    this.migrations = [];
    this.connection = null;
  }

  /**
   * 마이그레이션 등록
   */
  registerMigration(version, name, up, down) {
    this.migrations.push({
      version,
      name,
      up,
      down,
      applied: false,
    });
  }

  /**
   * 데이터베이스 연결
   */
  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboreum';
      this.connection = await mongoose.connect(mongoUri);
      console.log('✅ 데이터베이스 연결 성공');
    } catch (error) {
      console.error('❌ 데이터베이스 연결 실패:', error);
      throw error;
    }
  }

  /**
   * 마이그레이션 테이블 생성
   */
  async createMigrationsTable() {
    const migrationSchema = new mongoose.Schema({
      version: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      appliedAt: { type: Date, default: Date.now },
      executionTime: { type: Number, required: true },
    });

    return mongoose.model('Migration', migrationSchema);
  }

  /**
   * 적용된 마이그레이션 조회
   */
  async getAppliedMigrations() {
    const Migration = await this.createMigrationsTable();
    const applied = await Migration.find({}).sort({ version: 1 });
    return applied.map(m => m.version);
  }

  /**
   * 마이그레이션 실행
   */
  async runMigrations() {
    const startTime = Date.now();
    
    try {
      await this.connect();
      
      const appliedVersions = await this.getAppliedMigrations();
      const pendingMigrations = this.migrations.filter(
        m => !appliedVersions.includes(m.version)
      );

      if (pendingMigrations.length === 0) {
        console.log('✅ 적용할 마이그레이션이 없습니다');
        return;
      }

      console.log(`📦 ${pendingMigrations.length}개의 마이그레이션을 실행합니다...`);

      for (const migration of pendingMigrations) {
        await this.runMigration(migration);
      }

      const totalTime = Date.now() - startTime;
      console.log(`✅ 모든 마이그레이션 완료 (${totalTime}ms)`);
      
    } catch (error) {
      console.error('❌ 마이그레이션 실행 실패:', error);
      throw error;
    } finally {
      if (this.connection) {
        await mongoose.connection.close();
      }
    }
  }

  /**
   * 개별 마이그레이션 실행
   */
  async runMigration(migration) {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 마이그레이션 실행: ${migration.version} - ${migration.name}`);
      
      await migration.up();
      
      const executionTime = Date.now() - startTime;
      
      // 마이그레이션 기록 저장
      const Migration = await this.createMigrationsTable();
      await Migration.create({
        version: migration.version,
        name: migration.name,
        executionTime,
      });

      console.log(`✅ 마이그레이션 완료: ${migration.version} (${executionTime}ms)`);
      
    } catch (error) {
      console.error(`❌ 마이그레이션 실패: ${migration.version}`, error);
      throw error;
    }
  }

  /**
   * 마이그레이션 롤백
   */
  async rollback(version) {
    try {
      await this.connect();
      
      const Migration = await this.createMigrationsTable();
      const migration = this.migrations.find(m => m.version === version);
      
      if (!migration) {
        throw new Error(`마이그레이션을 찾을 수 없습니다: ${version}`);
      }

      console.log(`🔄 마이그레이션 롤백: ${version} - ${migration.name}`);
      
      await migration.down();
      
      await Migration.deleteOne({ version });
      
      console.log(`✅ 마이그레이션 롤백 완료: ${version}`);
      
    } catch (error) {
      console.error(`❌ 마이그레이션 롤백 실패: ${version}`, error);
      throw error;
    } finally {
      if (this.connection) {
        await mongoose.connection.close();
      }
    }
  }

  /**
   * 마이그레이션 상태 조회
   */
  async status() {
    try {
      await this.connect();
      
      const appliedVersions = await this.getAppliedMigrations();
      
      console.log('📊 마이그레이션 상태:');
      console.log('='.repeat(50));
      
      for (const migration of this.migrations) {
        const status = appliedVersions.includes(migration.version) ? '✅ 적용됨' : '⏳ 대기중';
        console.log(`${migration.version} - ${migration.name} [${status}]`);
      }
      
    } catch (error) {
      console.error('❌ 마이그레이션 상태 조회 실패:', error);
      throw error;
    } finally {
      if (this.connection) {
        await mongoose.connection.close();
      }
    }
  }
}

// 마이그레이션 인스턴스 생성
const migrationManager = new MigrationManager();

// 마이그레이션 정의
migrationManager.registerMigration(
  '001',
  'Create initial collections',
  async () => {
    // 초기 컬렉션 생성
    const { User } = require('../src/models/User');
    const { Category } = require('../src/models/Category');
    const { FundingProject } = require('../src/models/FundingProject');
    
    // 인덱스 생성
    await User.createIndexes();
    await Category.createIndexes();
    await FundingProject.createIndexes();
    
    console.log('✅ 초기 컬렉션 및 인덱스 생성 완료');
  },
  async () => {
    // 롤백 로직
    console.log('🔄 초기 컬렉션 롤백');
  }
);

migrationManager.registerMigration(
  '002',
  'Add funding project indexes',
  async () => {
    const { FundingProject } = require('../src/models/FundingProject');
    
    // 추가 인덱스 생성
    await FundingProject.collection.createIndex({ 'rewards.amount': 1 });
    await FundingProject.collection.createIndex({ 'tags': 1, 'status': 1 });
    await FundingProject.collection.createIndex({ 'createdAt': -1, 'isActive': 1 });
    
    console.log('✅ 펀딩 프로젝트 추가 인덱스 생성 완료');
  },
  async () => {
    const { FundingProject } = require('../src/models/FundingProject');
    
    await FundingProject.collection.dropIndex({ 'rewards.amount': 1 });
    await FundingProject.collection.dropIndex({ 'tags': 1, 'status': 1 });
    await FundingProject.collection.dropIndex({ 'createdAt': -1, 'isActive': 1 });
    
    console.log('🔄 펀딩 프로젝트 추가 인덱스 롤백 완료');
  }
);

migrationManager.registerMigration(
  '003',
  'Add user permissions field',
  async () => {
    const { User } = require('../src/models/User');
    
    // 기존 사용자에 permissions 필드 추가
    await User.updateMany(
      { permissions: { $exists: false } },
      { $set: { permissions: [] } }
    );
    
    console.log('✅ 사용자 권한 필드 추가 완료');
  },
  async () => {
    const { User } = require('../src/models/User');
    
    await User.updateMany(
      {},
      { $unset: { permissions: 1 } }
    );
    
    console.log('🔄 사용자 권한 필드 롤백 완료');
  }
);

migrationManager.registerMigration(
  '004',
  'Create event log collection',
  async () => {
    const { EventLog } = require('../src/models/EventLog');
    
    await EventLog.createIndexes();
    
    console.log('✅ 이벤트 로그 컬렉션 생성 완료');
  },
  async () => {
    const { EventLog } = require('../src/models/EventLog');
    
    await EventLog.collection.drop();
    
    console.log('🔄 이벤트 로그 컬렉션 롤백 완료');
  }
);

// CLI 인터페이스
async function main() {
  const command = process.argv[2];
  const version = process.argv[3];

  try {
    switch (command) {
      case 'up':
        await migrationManager.runMigrations();
        break;
      case 'down':
        if (!version) {
          throw new Error('롤백할 마이그레이션 버전을 지정해주세요');
        }
        await migrationManager.rollback(version);
        break;
      case 'status':
        await migrationManager.status();
        break;
      default:
        console.log('사용법:');
        console.log('  node migration.js up          - 마이그레이션 실행');
        console.log('  node migration.js down <ver>  - 마이그레이션 롤백');
        console.log('  node migration.js status      - 마이그레이션 상태 조회');
        break;
    }
  } catch (error) {
    console.error('❌ 마이그레이션 실행 실패:', error.message);
    process.exit(1);
  }
}

// 스크립트가 직접 실행된 경우
if (require.main === module) {
  main();
}

module.exports = migrationManager;
