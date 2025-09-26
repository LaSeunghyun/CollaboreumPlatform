#!/usr/bin/env node
/**
 * MongoDB (Mongoose) → Prisma 마이그레이션 스크립트
 * -------------------------------------------------
 * - Prisma Client와 기존 Mongoose 모델을 모두 로드합니다.
 * - 컬렉션 간 참조를 유지하기 위해 ObjectId → Prisma ID 매핑 테이블을 생성합니다.
 * - 중첩 문서를 정규화하여 FK 기반 레코드로 삽입합니다.
 * - 마이그레이션 단계별 실행 순서를 정의하고, 배치 단위 트랜잭션으로 안전하게 실행합니다.
 * - 샘플 데이터를 비교하여 마이그레이션 결과를 검증하는 리포트를 출력합니다.
 *
 * 사용 예시
 *   node scripts/migrate-mongo-to-prisma.js
 *   node scripts/migrate-mongo-to-prisma.js --dry-run --limit=100
 */

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// Mongo 모델 로드
const User = require('../models/User');
const Artist = require('../models/Artist');
const Project = require('../models/Project');
const FundingProject = require('../models/FundingProject');
const Payment = require('../models/Payment');

const DEFAULT_BATCH_SIZE = Number(process.env.PRISMA_MIGRATION_BATCH_SIZE) || 50;
const DRY_RUN = process.argv.includes('--dry-run');
const SAMPLE_LIMIT = parseInt(
  (process.argv.find(arg => arg.startsWith('--limit=')) || '').split('=')[1] ||
    process.env.PRISMA_MIGRATION_SAMPLE_LIMIT ||
    '0',
  10,
);

const ID_MAP_OUTPUT = path.resolve(
  __dirname,
  '../../reports/prisma-id-mapping.json',
);

const idMaps = {
  user: new Map(),
  artist: new Map(),
  project: new Map(),
  projectTask: new Map(),
  projectMilestone: new Map(),
  projectTeam: new Map(),
  projectNote: new Map(),
  fundingProject: new Map(),
  fundingStage: new Map(),
  fundingExpense: new Map(),
  fundingDistribution: new Map(),
  fundingBacker: new Map(),
  fundingReward: new Map(),
  fundingUpdate: new Map(),
  payment: new Map(),
};

const persistedMappings = Object.keys(idMaps).reduce((acc, key) => {
  acc[key] = [];
  return acc;
}, {});

const migrationSamples = {
  user: [],
  artist: [],
  project: [],
  fundingProject: [],
  payment: [],
};

const executionOrder = [
  'user',
  'artist',
  'project',
  'fundingProject',
  'payment',
];

process.on('unhandledRejection', error => {
  console.error('❌ Unhandled promise rejection', error);
  process.exitCode = 1;
});

function registerMapping(collection, legacyId, prismaId) {
  if (!legacyId) return;
  const legacyKey = legacyId.toString();
  idMaps[collection].set(legacyKey, prismaId);
  persistedMappings[collection].push({ legacyId: legacyKey, prismaId });
}

function resolveMapping(collection, legacyId, { allowNull = false } = {}) {
  if (!legacyId) {
    return allowNull ? null : undefined;
  }
  const mapped = idMaps[collection].get(legacyId.toString());
  if (!mapped && !allowNull) {
    throw new Error(
      `매핑되지 않은 참조 감지: collection=${collection}, legacyId=${legacyId}`,
    );
  }
  return mapped || null;
}

function writeIdMaps() {
  const payload = {
    generatedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    collections: persistedMappings,
  };
  fs.writeFileSync(ID_MAP_OUTPUT, JSON.stringify(payload, null, 2));
  console.log(`🗃️  ID 매핑 테이블 저장: ${ID_MAP_OUTPUT}`);
}

async function connectMongo() {
  const mongoUri =
    process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/collaboreum';
  console.log(`🌐 MongoDB 연결 시도: ${mongoUri}`);
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log('✅ MongoDB 연결 완료');
}

async function disconnectAll() {
  await Promise.allSettled([prisma.$disconnect(), mongoose.disconnect()]);
}

function maybeAddSample(collection, doc) {
  if (migrationSamples[collection] && migrationSamples[collection].length < 5) {
    migrationSamples[collection].push(doc);
  }
}

function sanitizeDate(value) {
  return value ? new Date(value) : null;
}

function transformUser(doc) {
  return {
    legacyId: doc._id.toString(),
    name: doc.name,
    username: doc.username || null,
    email: doc.email,
    passwordHash: doc.password,
    role: doc.role,
    avatarUrl: doc.avatar || null,
    bio: doc.bio || null,
    isVerified: Boolean(doc.isVerified),
    isActive: Boolean(doc.isActive),
    lastLoginAt: sanitizeDate(doc.lastLoginAt || doc.lastLogin),
    agreeTerms: Boolean(doc.agreeTerms),
    agreePrivacy: Boolean(doc.agreePrivacy),
    agreeMarketing: Boolean(doc.agreeMarketing),
    createdAt: sanitizeDate(doc.createdAt) || new Date(),
    updatedAt: sanitizeDate(doc.updatedAt) || new Date(),
  };
}

function transformArtist(doc) {
  return {
    legacyId: doc._id.toString(),
    userId: resolveMapping('user', doc.userId),
    category: doc.category,
    location: doc.location,
    rating: doc.rating || 0,
    tags: doc.tags || [],
    coverImageUrl: doc.coverImage || null,
    profileImageUrl: doc.profileImage || null,
    followers: doc.followers || 0,
    completedProjects: doc.completedProjects || 0,
    activeProjects: doc.activeProjects || 0,
    totalEarned: doc.totalEarned || 0,
    genres: doc.genre || [],
    totalStreams: doc.totalStreams || 0,
    monthlyListeners: doc.monthlyListeners || 0,
    socialLinks: doc.socialLinks || {},
    achievements: (doc.achievements || []).map(entry => ({
      title: entry.title,
      description: entry.description,
      date: sanitizeDate(entry.date),
      image: entry.image || null,
    })),
    isVerified: Boolean(doc.isVerified),
    verificationDate: sanitizeDate(doc.verificationDate),
    featured: Boolean(doc.featured),
    featuredDate: sanitizeDate(doc.featuredDate),
    createdAt: sanitizeDate(doc.createdAt) || new Date(),
    updatedAt: sanitizeDate(doc.updatedAt) || new Date(),
  };
}

function transformProject(doc) {
  return {
    legacyId: doc._id.toString(),
    artistId: resolveMapping('user', doc.artist),
    title: doc.title,
    description: doc.description,
    category: doc.category,
    status: doc.status,
    progress: doc.progress || 0,
    startDate: sanitizeDate(doc.startDate),
    endDate: sanitizeDate(doc.endDate),
    budget: doc.budget,
    spent: doc.spent || 0,
    imageUrl: doc.image || null,
    approvalStatus: doc.approvalStatus || 'pending',
    approvalReason: doc.approvalReason || null,
    approvedAt: sanitizeDate(doc.approvedAt),
    approvedById: doc.approvedBy ? resolveMapping('user', doc.approvedBy, { allowNull: true }) : null,
    tags: doc.tags || [],
    isActive: Boolean(doc.isActive),
    isPublic: Boolean(doc.isPublic),
    priority: doc.priority || '보통',
    createdAt: sanitizeDate(doc.createdAt) || new Date(),
    updatedAt: sanitizeDate(doc.updatedAt) || new Date(),
  };
}

function normalizeTasks(projectLegacyId, projectPrismaId, tasks = []) {
  return tasks.map(task => ({
    legacyId: task._id ? task._id.toString() : uuidv4(),
    projectId: projectPrismaId,
    number: task.id,
    title: task.title,
    description: task.description || null,
    status: task.status || '대기',
    progress: task.progress || 0,
    assignedToId: task.assignedTo
      ? resolveMapping('user', task.assignedTo, { allowNull: true })
      : null,
    dueDate: sanitizeDate(task.dueDate),
    completedAt: sanitizeDate(task.completedAt),
    createdAt: sanitizeDate(task.createdAt) || new Date(),
    updatedAt: sanitizeDate(task.updatedAt) || new Date(),
  }));
}

function normalizeMilestones(projectLegacyId, projectPrismaId, milestones = []) {
  return milestones.map(milestone => ({
    legacyId: milestone._id ? milestone._id.toString() : uuidv4(),
    projectId: projectPrismaId,
    number: milestone.id,
    title: milestone.title,
    description: milestone.description || null,
    status: milestone.status || '예정',
    scheduledAt: sanitizeDate(milestone.date),
    completedAt: sanitizeDate(milestone.completedAt),
    createdAt: sanitizeDate(milestone.createdAt) || new Date(),
    updatedAt: sanitizeDate(milestone.updatedAt) || new Date(),
  }));
}

function normalizeTeam(projectLegacyId, projectPrismaId, team = []) {
  return team.map(member => ({
    legacyId: member._id ? member._id.toString() : uuidv4(),
    projectId: projectPrismaId,
    userId: member.user
      ? resolveMapping('user', member.user, { allowNull: true })
      : null,
    role: member.role,
    joinedAt: sanitizeDate(member.joinedAt) || new Date(),
  }));
}

function normalizeNotes(projectLegacyId, projectPrismaId, notes = []) {
  return notes.map(note => ({
    legacyId: note._id ? note._id.toString() : uuidv4(),
    projectId: projectPrismaId,
    authorId: note.author
      ? resolveMapping('user', note.author, { allowNull: true })
      : null,
    content: note.content,
    createdAt: sanitizeDate(note.createdAt) || new Date(),
  }));
}

function transformFundingProject(doc) {
  return {
    legacyId: doc._id.toString(),
    artistId: resolveMapping('user', doc.artist),
    title: doc.title,
    description: doc.description,
    category: doc.category,
    goalAmount: doc.goalAmount,
    currentAmount: doc.currentAmount || 0,
    startDate: sanitizeDate(doc.startDate),
    endDate: sanitizeDate(doc.endDate),
    status: doc.status,
    progress: doc.progress || 0,
    daysLeft: doc.daysLeft || 0,
    imageUrl: doc.image || null,
    tags: doc.tags || [],
    isActive: Boolean(doc.isActive),
    isVerified: Boolean(doc.isVerified),
    featured: Boolean(doc.featured),
    createdAt: sanitizeDate(doc.createdAt) || new Date(),
    updatedAt: sanitizeDate(doc.updatedAt) || new Date(),
  };
}

function normalizeExecutionStages(legacyProjectId, prismaProjectId, executionPlan = {}) {
  return (executionPlan.stages || []).map(stage => ({
    legacyId: stage._id ? stage._id.toString() : uuidv4(),
    fundingProjectId: prismaProjectId,
    name: stage.name,
    description: stage.description,
    budget: stage.budget,
    startDate: sanitizeDate(stage.startDate),
    endDate: sanitizeDate(stage.endDate),
    status: stage.status || '계획',
    progress: stage.progress || 0,
  }));
}

function normalizeExpenseRecords(
  legacyProjectId,
  prismaProjectId,
  expenses = [],
) {
  return expenses.map(expense => ({
    legacyId: expense._id ? expense._id.toString() : uuidv4(),
    fundingProjectId: prismaProjectId,
    stageId: expense.stage
      ? resolveMapping('fundingStage', expense.stage, { allowNull: true })
      : null,
    category: expense.category,
    title: expense.title,
    description: expense.description,
    amount: expense.amount,
    receiptUrl: expense.receipt || null,
    spentAt: sanitizeDate(expense.date),
    verified: Boolean(expense.verified),
  }));
}

function normalizeDistributions(
  legacyProjectId,
  prismaProjectId,
  distributions = [],
) {
  return distributions.map(entry => ({
    legacyId: entry._id ? entry._id.toString() : uuidv4(),
    fundingProjectId: prismaProjectId,
    backerId: entry.backer
      ? resolveMapping('user', entry.backer, { allowNull: true })
      : null,
    userName: entry.userName || null,
    originalAmount: entry.originalAmount,
    profitShare: entry.profitShare || 0,
    totalReturn: entry.totalReturn || 0,
    distributedAt: sanitizeDate(entry.distributedAt),
    status: entry.status || '대기',
  }));
}

function normalizeBackers(legacyProjectId, prismaProjectId, backers = []) {
  return backers.map(backer => ({
    legacyId: backer._id ? backer._id.toString() : uuidv4(),
    fundingProjectId: prismaProjectId,
    userId: backer.user
      ? resolveMapping('user', backer.user, { allowNull: true })
      : null,
    userName: backer.userName || null,
    amount: backer.amount,
    rewardId: backer.reward
      ? resolveMapping('fundingReward', backer.reward, { allowNull: true })
      : null,
    backedAt: sanitizeDate(backer.backedAt) || new Date(),
    isAnonymous: Boolean(backer.isAnonymous),
    message: backer.message || null,
  }));
}

function normalizeRewards(legacyProjectId, prismaProjectId, rewards = []) {
  return rewards.map(reward => ({
    legacyId: reward._id ? reward._id.toString() : uuidv4(),
    fundingProjectId: prismaProjectId,
    title: reward.title,
    description: reward.description,
    amount: reward.amount,
    claimed: reward.claimed || 0,
    maxClaim: reward.maxClaim,
    estimatedDelivery: sanitizeDate(reward.estimatedDelivery),
  }));
}

function normalizeUpdates(legacyProjectId, prismaProjectId, updates = []) {
  return updates.map(update => ({
    legacyId: update._id ? update._id.toString() : uuidv4(),
    fundingProjectId: prismaProjectId,
    title: update.title,
    content: update.content,
    type: update.type || '일반',
    createdAt: sanitizeDate(update.createdAt) || new Date(),
  }));
}

function transformPayment(doc) {
  return {
    legacyId: doc._id.toString(),
    legacyPaymentId: doc.paymentId,
    orderId: doc.orderId,
    fundingProjectId: resolveMapping('fundingProject', doc.projectId),
    backerId: resolveMapping('user', doc.backerId),
    backerName: doc.backerName,
    backerEmail: doc.backerEmail,
    backerPhone: doc.backerPhone,
    backerAddress: doc.backerAddress || null,
    rewardId: doc.rewardId
      ? resolveMapping('fundingReward', doc.rewardId, { allowNull: true })
      : null,
    rewardName: doc.rewardName || null,
    amount: doc.amount,
    paymentMethod: doc.paymentMethod,
    paymentProvider: doc.paymentProvider || 'toss',
    status: doc.status || 'pending',
    transactionId: doc.transactionId || null,
    paymentKey: doc.paymentKey || null,
    message: doc.message || null,
    createdAt: sanitizeDate(doc.createdAt) || new Date(),
    completedAt: sanitizeDate(doc.completedAt),
    cancelledAt: sanitizeDate(doc.cancelledAt),
    refundedAt: sanitizeDate(doc.refundedAt),
    refundId: doc.refundId || null,
    refundAmount: doc.refundAmount || 0,
    refundReason: doc.refundReason || null,
    metadata: doc.metadata ? Object.fromEntries(doc.metadata.entries()) : {},
    updatedAt: sanitizeDate(doc.updatedAt) || new Date(),
  };
}

async function migrateUsers() {
  const total = await User.countDocuments();
  console.log(`\n👥 사용자 마이그레이션 시작 (총 ${total}건)`);
  const batchSize = Math.min(DEFAULT_BATCH_SIZE, SAMPLE_LIMIT || DEFAULT_BATCH_SIZE);
  for (let skip = 0; skip < total; skip += batchSize) {
    const query = User.find().sort({ _id: 1 }).skip(skip).limit(batchSize).lean();
    const users = SAMPLE_LIMIT ? await query.limit(SAMPLE_LIMIT) : await query;
    for (const user of users) {
      maybeAddSample('user', user);
    }
    if (DRY_RUN) {
      users.forEach(user => {
        registerMapping('user', user._id, uuidv4());
      });
      continue;
    }

    await prisma.$transaction(async tx => {
      for (const user of users) {
        const created = await tx.user.create({ data: transformUser(user) });
        registerMapping('user', user._id, created.id);
      }
    });

    console.log(`  • ${Math.min(skip + batchSize, total)} / ${total} 사용자 처리`);
    if (SAMPLE_LIMIT && skip + batchSize >= SAMPLE_LIMIT) break;
  }
  console.log('✅ 사용자 마이그레이션 완료');
  await logSampleComparison('user', 'user');
}

async function migrateArtists() {
  const total = await Artist.countDocuments();
  console.log(`\n🎨 아티스트 마이그레이션 시작 (총 ${total}건)`);
  const batchSize = Math.min(DEFAULT_BATCH_SIZE, SAMPLE_LIMIT || DEFAULT_BATCH_SIZE);
  for (let skip = 0; skip < total; skip += batchSize) {
    const artists = await Artist.find()
      .sort({ _id: 1 })
      .skip(skip)
      .limit(batchSize)
      .lean();
    artists.forEach(artist => maybeAddSample('artist', artist));

    if (DRY_RUN) {
      artists.forEach(artist => registerMapping('artist', artist._id, uuidv4()));
      continue;
    }

    await prisma.$transaction(async tx => {
      for (const artist of artists) {
        const data = transformArtist(artist);
        const { achievements, socialLinks, ...artistData } = data;
        const created = await tx.artist.create({
          data: {
            ...artistData,
            achievementsJson: JSON.stringify(achievements || []),
            socialLinksJson: JSON.stringify(socialLinks || {}),
          },
        });
        registerMapping('artist', artist._id, created.id);
      }
    });

    console.log(`  • ${Math.min(skip + batchSize, total)} / ${total} 아티스트 처리`);
    if (SAMPLE_LIMIT && skip + batchSize >= SAMPLE_LIMIT) break;
  }
  console.log('✅ 아티스트 마이그레이션 완료');
  await logSampleComparison('artist', 'artist');
}

async function migrateProjects() {
  const total = await Project.countDocuments();
  console.log(`\n📁 프로젝트 마이그레이션 시작 (총 ${total}건)`);
  const batchSize = Math.min(DEFAULT_BATCH_SIZE, SAMPLE_LIMIT || DEFAULT_BATCH_SIZE);

  for (let skip = 0; skip < total; skip += batchSize) {
    const projects = await Project.find()
      .sort({ _id: 1 })
      .skip(skip)
      .limit(batchSize)
      .lean();

    projects.forEach(project => maybeAddSample('project', project));

    if (DRY_RUN) {
      projects.forEach(project => {
        const newId = uuidv4();
        registerMapping('project', project._id, newId);
        normalizeTasks(project._id, newId, project.tasks).forEach(task =>
          registerMapping('projectTask', task.legacyId, uuidv4()),
        );
        normalizeMilestones(project._id, newId, project.milestones).forEach(milestone =>
          registerMapping('projectMilestone', milestone.legacyId, uuidv4()),
        );
        normalizeTeam(project._id, newId, project.team).forEach(member =>
          registerMapping('projectTeam', member.legacyId, uuidv4()),
        );
        normalizeNotes(project._id, newId, project.notes).forEach(note =>
          registerMapping('projectNote', note.legacyId, uuidv4()),
        );
      });
      continue;
    }

    await prisma.$transaction(async tx => {
      for (const project of projects) {
        const createdProject = await tx.project.create({
          data: transformProject(project),
        });
        registerMapping('project', project._id, createdProject.id);

        const tasks = normalizeTasks(project._id, createdProject.id, project.tasks);
        for (const task of tasks) {
          const created = await tx.projectTask.create({
            data: {
              ...task,
              legacyId: task.legacyId,
            },
          });
          registerMapping('projectTask', task.legacyId, created.id);
        }

        const milestones = normalizeMilestones(
          project._id,
          createdProject.id,
          project.milestones,
        );
        for (const milestone of milestones) {
          const created = await tx.projectMilestone.create({
            data: {
              ...milestone,
              legacyId: milestone.legacyId,
            },
          });
          registerMapping('projectMilestone', milestone.legacyId, created.id);
        }

        const teamMembers = normalizeTeam(project._id, createdProject.id, project.team);
        for (const member of teamMembers) {
          const created = await tx.projectTeamMember.create({
            data: {
              ...member,
              legacyId: member.legacyId,
            },
          });
          registerMapping('projectTeam', member.legacyId, created.id);
        }

        const notes = normalizeNotes(project._id, createdProject.id, project.notes);
        for (const note of notes) {
          const created = await tx.projectNote.create({
            data: {
              ...note,
              legacyId: note.legacyId,
            },
          });
          registerMapping('projectNote', note.legacyId, created.id);
        }
      }
    });

    console.log(`  • ${Math.min(skip + batchSize, total)} / ${total} 프로젝트 처리`);
    if (SAMPLE_LIMIT && skip + batchSize >= SAMPLE_LIMIT) break;
  }
  console.log('✅ 프로젝트 마이그레이션 완료');
  await logSampleComparison('project', 'project');
}

async function migrateFundingProjects() {
  const total = await FundingProject.countDocuments();
  console.log(`\n🚀 펀딩 프로젝트 마이그레이션 시작 (총 ${total}건)`);
  const batchSize = Math.min(DEFAULT_BATCH_SIZE, SAMPLE_LIMIT || DEFAULT_BATCH_SIZE);

  for (let skip = 0; skip < total; skip += batchSize) {
    const fundingProjects = await FundingProject.find()
      .sort({ _id: 1 })
      .skip(skip)
      .limit(batchSize)
      .lean();

    fundingProjects.forEach(project => maybeAddSample('fundingProject', project));

    if (DRY_RUN) {
      fundingProjects.forEach(project => {
        const projectId = uuidv4();
        registerMapping('fundingProject', project._id, projectId);
        normalizeRewards(project._id, projectId, project.rewards).forEach(reward =>
          registerMapping('fundingReward', reward.legacyId, uuidv4()),
        );
        normalizeExecutionStages(
          project._id,
          projectId,
          project.executionPlan,
        ).forEach(stage => registerMapping('fundingStage', stage.legacyId, uuidv4()));
        normalizeBackers(project._id, projectId, project.backers).forEach(backer =>
          registerMapping('fundingBacker', backer.legacyId, uuidv4()),
        );
        normalizeExpenseRecords(
          project._id,
          projectId,
          project.expenseRecords,
        ).forEach(expense => registerMapping('fundingExpense', expense.legacyId, uuidv4()));
        normalizeDistributions(
          project._id,
          projectId,
          ((project.revenueDistribution || {}).distributions || []),
        ).forEach(distribution =>
          registerMapping('fundingDistribution', distribution.legacyId, uuidv4()),
        );
        normalizeUpdates(project._id, projectId, project.updates).forEach(update =>
          registerMapping('fundingUpdate', update.legacyId, uuidv4()),
        );
      });
      continue;
    }

    await prisma.$transaction(async tx => {
      for (const project of fundingProjects) {
        const createdProject = await tx.fundingProject.create({
          data: transformFundingProject(project),
        });
        registerMapping('fundingProject', project._id, createdProject.id);

        const rewards = normalizeRewards(
          project._id,
          createdProject.id,
          project.rewards,
        );
        for (const reward of rewards) {
          const created = await tx.fundingReward.create({
            data: {
              ...reward,
              legacyId: reward.legacyId,
            },
          });
          registerMapping('fundingReward', reward.legacyId, created.id);
        }

        const stages = normalizeExecutionStages(
          project._id,
          createdProject.id,
          project.executionPlan || {},
        );
        for (const stage of stages) {
          const created = await tx.fundingStage.create({
            data: {
              ...stage,
              legacyId: stage.legacyId,
            },
          });
          registerMapping('fundingStage', stage.legacyId, created.id);
        }

        const expenses = normalizeExpenseRecords(
          project._id,
          createdProject.id,
          project.expenseRecords,
        );
        for (const expense of expenses) {
          const created = await tx.fundingExpense.create({
            data: {
              ...expense,
              legacyId: expense.legacyId,
            },
          });
          registerMapping('fundingExpense', expense.legacyId, created.id);
        }

        const distributions = normalizeDistributions(
          project._id,
          createdProject.id,
          ((project.revenueDistribution || {}).distributions || []),
        );
        for (const distribution of distributions) {
          const created = await tx.fundingDistribution.create({
            data: {
              ...distribution,
              legacyId: distribution.legacyId,
            },
          });
          registerMapping('fundingDistribution', distribution.legacyId, created.id);
        }

        const backers = normalizeBackers(project._id, createdProject.id, project.backers);
        for (const backer of backers) {
          const created = await tx.fundingBacker.create({
            data: {
              ...backer,
              legacyId: backer.legacyId,
            },
          });
          registerMapping('fundingBacker', backer.legacyId, created.id);
        }

        const updates = normalizeUpdates(project._id, createdProject.id, project.updates);
        for (const update of updates) {
          const created = await tx.fundingUpdate.create({
            data: {
              ...update,
              legacyId: update.legacyId,
            },
          });
          registerMapping('fundingUpdate', update.legacyId, created.id);
        }
      }
    });

    console.log(`  • ${Math.min(skip + batchSize, total)} / ${total} 펀딩 프로젝트 처리`);
    if (SAMPLE_LIMIT && skip + batchSize >= SAMPLE_LIMIT) break;
  }

  console.log('✅ 펀딩 프로젝트 마이그레이션 완료');
  await logSampleComparison('fundingProject', 'fundingProject');
}

async function migratePayments() {
  const total = await Payment.countDocuments();
  console.log(`\n💳 결제 마이그레이션 시작 (총 ${total}건)`);
  const batchSize = Math.min(DEFAULT_BATCH_SIZE, SAMPLE_LIMIT || DEFAULT_BATCH_SIZE);

  for (let skip = 0; skip < total; skip += batchSize) {
    const payments = await Payment.find()
      .sort({ _id: 1 })
      .skip(skip)
      .limit(batchSize)
      .lean();
    payments.forEach(payment => maybeAddSample('payment', payment));

    if (DRY_RUN) {
      payments.forEach(payment => registerMapping('payment', payment._id, uuidv4()));
      continue;
    }

    await prisma.$transaction(async tx => {
      for (const payment of payments) {
        const data = transformPayment(payment);
        const { metadata, ...paymentData } = data;
        const created = await tx.payment.create({
          data: {
            ...paymentData,
            metadataJson: JSON.stringify(metadata || {}),
          },
        });
        registerMapping('payment', payment._id, created.id);
      }
    });

    console.log(`  • ${Math.min(skip + batchSize, total)} / ${total} 결제 처리`);
    if (SAMPLE_LIMIT && skip + batchSize >= SAMPLE_LIMIT) break;
  }

  console.log('✅ 결제 마이그레이션 완료');
  await logSampleComparison('payment', 'payment');
}

async function logSampleComparison(collection, prismaModelKey) {
  if (DRY_RUN) {
    console.log(`⚠️  ${collection} 샘플 비교는 dry-run 모드에서는 건너뜁니다.`);
    return;
  }
  const samples = migrationSamples[collection];
  if (!samples || samples.length === 0) {
    console.log(`ℹ️  ${collection} 샘플 데이터가 없어 비교를 건너뜁니다.`);
    return;
  }
  const legacyIds = samples.map(doc => doc._id.toString());
  const model = prisma[prismaModelKey];
  if (!model) {
    console.warn(`⚠️  Prisma 모델(${prismaModelKey})을 찾을 수 없습니다.`);
    return;
  }
  const freshRecords = await model.findMany({
    where: { legacyId: { in: legacyIds } },
    take: samples.length,
    orderBy: { createdAt: 'asc' },
  });

  const reportRows = samples.map(sample => {
    const migrated = freshRecords.find(item => item.legacyId === sample._id.toString());
    return {
      legacyId: sample._id.toString(),
      prismaId: migrated ? migrated.id : '미존재',
      legacyUpdatedAt: sanitizeDate(sample.updatedAt),
      prismaUpdatedAt: migrated ? migrated.updatedAt : null,
      status: migrated ? 'migrated' : 'missing',
    };
  });

  console.log(`\n📊 ${collection} 샘플 비교 리포트`);
  console.table(reportRows);
}

async function run() {
  console.log('🚚 Prisma 마이그레이션 스크립트를 시작합니다');
  console.log(`   • Dry run: ${DRY_RUN ? 'ON' : 'OFF'}`);
  console.log(`   • Batch size: ${DEFAULT_BATCH_SIZE}`);
  if (SAMPLE_LIMIT) {
    console.log(`   • Sample limit: ${SAMPLE_LIMIT}`);
  }

  await connectMongo();

  const executionMap = {
    user: migrateUsers,
    artist: migrateArtists,
    project: migrateProjects,
    fundingProject: migrateFundingProjects,
    payment: migratePayments,
  };

  for (const step of executionOrder) {
    const runner = executionMap[step];
    if (!runner) {
      console.warn(`⚠️  실행 가능한 마이그레이션이 없습니다: ${step}`);
      continue;
    }
    await runner();
  }

  writeIdMaps();
  console.log('\n🎉 모든 마이그레이션 단계가 완료되었습니다');
}

run()
  .catch(error => {
    console.error('❌ 마이그레이션 중 오류가 발생했습니다', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectAll();
  });
