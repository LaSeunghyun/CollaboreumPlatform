#!/usr/bin/env node

/**
 * 컴포넌트 리팩토링 자동화 스크립트
 * 5줄 코딩 원칙 적용 및 거대 컴포넌트 분해
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 거대한 컴포넌트 파일들 (200줄 이상)
const LARGE_COMPONENTS = [
  'src/components/AdminDashboardSystem.tsx',
  'src/components/FundingProjects.tsx',
  'src/components/CommunityPostDetail.tsx',
  'src/components/SignupPage.tsx',
];

// 중복 파일들
const DUPLICATE_FILES = ['src/components/ExpenseRecords_new.tsx'];

function log(message) {
  console.log(`[REFACTOR] ${message}`);
}

function checkFileSize(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    return { exists: true, lines };
  } catch (error) {
    return { exists: false, lines: 0 };
  }
}

function removeDuplicateFiles() {
  log('중복 파일 제거 시작...');

  DUPLICATE_FILES.forEach(filePath => {
    const { exists, lines } = checkFileSize(filePath);
    if (exists) {
      fs.unlinkSync(filePath);
      log(`✅ 제거됨: ${filePath} (${lines}줄)`);
    } else {
      log(`⚠️  파일 없음: ${filePath}`);
    }
  });
}

function analyzeLargeComponents() {
  log('거대 컴포넌트 분석 시작...');

  const analysis = [];

  LARGE_COMPONENTS.forEach(filePath => {
    const { exists, lines } = checkFileSize(filePath);
    if (exists) {
      analysis.push({ file: filePath, lines });
      log(`📊 ${filePath}: ${lines}줄`);
    }
  });

  return analysis;
}

function generateRefactorPlan(analysis) {
  log('리팩토링 계획 생성...');

  const plan = {
    highPriority: analysis.filter(item => item.lines > 500),
    mediumPriority: analysis.filter(
      item => item.lines > 200 && item.lines <= 500,
    ),
    lowPriority: analysis.filter(item => item.lines <= 200),
  };

  log('📋 리팩토링 우선순위:');
  log(`🔥 High Priority (500줄+): ${plan.highPriority.length}개`);
  log(`🟡 Medium Priority (200-500줄): ${plan.mediumPriority.length}개`);
  log(`🟢 Low Priority (200줄-): ${plan.lowPriority.length}개`);

  return plan;
}

function runLinting() {
  log('코드 품질 검사 실행...');

  try {
    execSync('npm run lint', { stdio: 'inherit' });
    log('✅ ESLint 검사 통과');
  } catch (error) {
    log('❌ ESLint 검사 실패 - 수정이 필요합니다');
    process.exit(1);
  }
}

function main() {
  log('🚀 컴포넌트 리팩토링 자동화 시작');

  // 1. 중복 파일 제거
  removeDuplicateFiles();

  // 2. 거대 컴포넌트 분석
  const analysis = analyzeLargeComponents();

  // 3. 리팩토링 계획 생성
  const plan = generateRefactorPlan(analysis);

  // 4. 코드 품질 검사
  runLinting();

  log('✅ 리팩토링 자동화 완료');
  log('다음 단계: 수동으로 거대 컴포넌트들을 분해하세요');
}

if (require.main === module) {
  main();
}

module.exports = {
  removeDuplicateFiles,
  analyzeLargeComponents,
  generateRefactorPlan,
};
