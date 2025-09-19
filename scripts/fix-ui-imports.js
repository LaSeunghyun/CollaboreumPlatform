#!/usr/bin/env node

/**
 * UI 컴포넌트 import 경로 통일 스크립트
 * @/shared/ui/ComponentName을 @/shared/ui로 변경
 */

const fs = require('fs');
const path = require('path');

function log(message) {
  console.log(`[FIX-IMPORTS] ${message}`);
}

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // @/shared/ui/ComponentName 패턴을 찾아서 수정
    const importPattern = /from ['"]@\/shared\/ui\/([A-Z][a-zA-Z]*)['"]/g;
    const matches = content.match(importPattern);
    
    if (matches) {
      log(`수정 중: ${filePath}`);
      
      // 모든 개별 import를 수집
      const individualImports = new Set();
      
      matches.forEach(match => {
        const componentName = match.match(/@\/shared\/ui\/([A-Z][a-zA-Z]*)/)[1];
        individualImports.add(componentName);
      });
      
      // 기존 import 문들을 제거하고 새로운 import 문으로 교체
      const lines = content.split('\n');
      const newLines = [];
      let inImportSection = false;
      let hasSharedUIImport = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // import 섹션 시작
        if (line.trim().startsWith('import ')) {
          inImportSection = true;
          
          // @/shared/ui/ComponentName import인 경우 건너뛰기
          if (line.includes('@/shared/ui/') && !line.includes('@/shared/ui\'')) {
            modified = true;
            continue;
          }
          
          // @/shared/ui import가 이미 있는지 확인
          if (line.includes("from '@/shared/ui'") || line.includes('from "@/shared/ui"')) {
            hasSharedUIImport = true;
            // 기존 import에 새로운 컴포넌트들 추가
            const importMatch = line.match(/import\s*\{([^}]+)\}\s*from\s*['"]@\/shared\/ui['"]/);
            if (importMatch) {
              const existingImports = importMatch[1].split(',').map(imp => imp.trim());
              const allImports = [...new Set([...existingImports, ...Array.from(individualImports)])];
              newLines.push(`import { ${allImports.join(', ')} } from '@/shared/ui';`);
              modified = true;
            } else {
              newLines.push(line);
            }
          } else {
            newLines.push(line);
          }
        } else if (inImportSection && line.trim() === '') {
          // 빈 줄이면 import 섹션 종료
          if (!hasSharedUIImport && individualImports.size > 0) {
            // @/shared/ui import가 없었다면 추가
            newLines.push(`import { ${Array.from(individualImports).join(', ')} } from '@/shared/ui';`);
            hasSharedUIImport = true;
            modified = true;
          }
          newLines.push(line);
          inImportSection = false;
        } else if (inImportSection && !line.trim().startsWith('import ')) {
          // import가 아닌 다른 문이 나오면 import 섹션 종료
          if (!hasSharedUIImport && individualImports.size > 0) {
            // @/shared/ui import가 없었다면 추가
            newLines.push(`import { ${Array.from(individualImports).join(', ')} } from '@/shared/ui';`);
            hasSharedUIImport = true;
            modified = true;
          }
          newLines.push(line);
          inImportSection = false;
        } else {
          newLines.push(line);
        }
      }
      
      // 파일 끝까지 import 섹션이었다면 마지막에 추가
      if (inImportSection && !hasSharedUIImport && individualImports.size > 0) {
        newLines.push(`import { ${Array.from(individualImports).join(', ')} } from '@/shared/ui';`);
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, newLines.join('\n'));
        log(`✅ 수정 완료: ${filePath}`);
        return true;
      }
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
        // node_modules, build, dist 등은 제외
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
  log('🚀 UI 컴포넌트 import 경로 통일 시작');
  
  const { totalFiles, modifiedFiles } = scanDirectory('src');
  
  log(`📊 처리 결과:`);
  log(`- 전체 파일: ${totalFiles}개`);
  log(`- 수정된 파일: ${modifiedFiles}개`);
  
  if (modifiedFiles > 0) {
    log('✅ import 경로 통일 완료');
  } else {
    log('ℹ️  수정할 파일이 없습니다');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixImportsInFile, scanDirectory };
