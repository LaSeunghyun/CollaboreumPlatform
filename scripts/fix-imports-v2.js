#!/usr/bin/env node

/**
 * UI 컴포넌트 import 경로 수정 스크립트 v2
 * 잘못된 import 구문을 수정
 */

const fs = require('fs');
const path = require('path');

function log(message) {
  console.log(`[FIX-IMPORTS-V2] ${message}`);
}

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 잘못된 import 패턴들을 수정
    const patterns = [
      // import { 다음에 import { 가 오는 패턴
      {
        pattern: /import\s*\{\s*\nimport\s*\{([^}]+)\}\s*from\s*['"]@\/shared\/ui['"];\s*\n([^}]+)\}\s*from\s*['"][^'"]+['"];/g,
        replacement: (match, sharedImports, otherImports) => {
          const cleanSharedImports = sharedImports.trim();
          const cleanOtherImports = otherImports.trim();
          return `import { ${cleanOtherImports} } from '${match.match(/from\s*['"]([^'"]+)['"]/)[1]}';\nimport { ${cleanSharedImports} } from '@/shared/ui';`;
        }
      },
      // import { 다음에 import { 가 오는 패턴 (다른 형태)
      {
        pattern: /import\s*\{\s*\nimport\s*\{([^}]+)\}\s*from\s*['"]@\/shared\/ui['"];\s*\n([^}]+)\}\s*from\s*['"][^'"]+['"];/g,
        replacement: (match, sharedImports, otherImports) => {
          const cleanSharedImports = sharedImports.trim();
          const cleanOtherImports = otherImports.trim();
          return `import { ${cleanOtherImports} } from '${match.match(/from\s*['"]([^'"]+)['"]/)[1]}';\nimport { ${cleanSharedImports} } from '@/shared/ui';`;
        }
      }
    ];
    
    // 각 패턴에 대해 수정 시도
    patterns.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    // 더 간단한 패턴들도 처리
    const simplePatterns = [
      // import { 다음에 import { 가 오는 패턴
      {
        pattern: /import\s*\{\s*\nimport\s*\{([^}]+)\}\s*from\s*['"]@\/shared\/ui['"];\s*\n([^}]+)\}\s*from\s*['"]([^'"]+)['"];/g,
        replacement: 'import { $2 } from \'$3\';\nimport { $1 } from \'@/shared/ui\';'
      }
    ];
    
    simplePatterns.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      log(`✅ 수정 완료: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    log(`❌ 오류 발생: ${filePath} - ${error.message}`);
    return false;
  }
}

function scanDirectory(dir) {
  let totalFiles = 0;
  let modifiedFiles = 0;
  
  function scanRecursive(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    files.forEach(file => {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', 'build', 'dist', 'coverage', '.git'].includes(file)) {
          scanRecursive(filePath);
        }
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        totalFiles++;
        if (fixImportsInFile(filePath)) {
          modifiedFiles++;
        }
      }
    });
  }
  
  scanRecursive(dir);
  
  return { totalFiles, modifiedFiles };
}

function main() {
  log('🚀 잘못된 import 구문 수정 시작');
  
  const { totalFiles, modifiedFiles } = scanDirectory('src');
  
  log(`📊 처리 결과:`);
  log(`- 전체 파일: ${totalFiles}개`);
  log(`- 수정된 파일: ${modifiedFiles}개`);
  
  if (modifiedFiles > 0) {
    log('✅ import 구문 수정 완료');
  } else {
    log('ℹ️  수정할 파일이 없습니다');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixImportsInFile, scanDirectory };
