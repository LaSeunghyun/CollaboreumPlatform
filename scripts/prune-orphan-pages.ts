#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { OrphanPageFinder } from './find-orphan-pages';
import type { OrphanCheckResult } from './find-orphan-pages';

interface PruneResult {
    deletedFiles: string[];
    updatedFiles: string[];
    errors: string[];
    changelog: string;
}

class OrphanPagePruner {
    private projectRoot: string;
    private finder: OrphanPageFinder;

    constructor() {
        this.projectRoot = process.cwd();
        this.finder = new OrphanPageFinder();
    }

    /**
     * 사용자 확인 프롬프트
     */
    private async confirmDeletion(orphanPages: any[]): Promise<boolean> {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('\n⚠️  다음 파일들이 삭제됩니다:');
        orphanPages.forEach(page => {
            console.log(`  • ${path.relative(this.projectRoot, page.filePath)}`);
        });

        return new Promise((resolve) => {
            rl.question('\n정말로 삭제하시겠습니까? (yes/no): ', (answer) => {
                rl.close();
                resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
            });
        });
    }

    /**
     * 파일 삭제
     */
    private deleteFile(filePath: string): boolean {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`✅ 삭제됨: ${path.relative(this.projectRoot, filePath)}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`❌ 삭제 실패: ${filePath}`, error);
            return false;
        }
    }

    /**
     * App.tsx에서 import 제거
     */
    private removeImportFromApp(componentName: string): boolean {
        const appPath = path.join(this.projectRoot, 'src', 'App.tsx');
        if (!fs.existsSync(appPath)) {
            return false;
        }

        try {
            let content = fs.readFileSync(appPath, 'utf-8');

            // import 문 제거
            const importRegex = new RegExp(`import\\s*{\\s*[^}]*${componentName}[^}]*}\\s*from\\s*['"][^'"]+['"];?\\s*\\n?`, 'g');
            content = content.replace(importRegex, '');

            // Route에서 사용하는 부분 제거
            const routeRegex = new RegExp(`<Route[^>]*element=\\{<[^>]*>${componentName}[^>]*>\\}[^>]*>\\s*\\n?`, 'g');
            content = content.replace(routeRegex, '');

            fs.writeFileSync(appPath, content);
            console.log(`✅ App.tsx에서 ${componentName} import 제거됨`);
            return true;
        } catch (error) {
            console.error(`❌ App.tsx 업데이트 실패:`, error);
            return false;
        }
    }

    /**
     * 테스트 파일에서 관련 테스트 제거
     */
    private removeTestReferences(componentName: string): string[] {
        const updatedFiles: string[] = [];
        const testFiles = [
            path.join(this.projectRoot, 'src', '__tests__'),
            path.join(this.projectRoot, 'src', 'components')
        ];

        testFiles.forEach(testDir => {
            if (fs.existsSync(testDir)) {
                const files = this.getAllFiles(testDir, ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx']);

                files.forEach(filePath => {
                    try {
                        let content = fs.readFileSync(filePath, 'utf-8');
                        const originalContent = content;

                        // 컴포넌트 관련 테스트 제거
                        const testRegex = new RegExp(`(describe|it|test)\\s*\\([^)]*${componentName}[^)]*\\)\\s*\\{[^}]*\\}`, 'gs');
                        content = content.replace(testRegex, '');

                        // import 제거
                        const importRegex = new RegExp(`import.*${componentName}.*from[^;]+;\\s*\\n?`, 'g');
                        content = content.replace(importRegex, '');

                        if (content !== originalContent) {
                            fs.writeFileSync(filePath, content);
                            updatedFiles.push(filePath);
                            console.log(`✅ 테스트 파일 업데이트: ${path.relative(this.projectRoot, filePath)}`);
                        }
                    } catch (error) {
                        console.error(`❌ 테스트 파일 업데이트 실패: ${filePath}`, error);
                    }
                });
            }
        });

        return updatedFiles;
    }

    /**
     * 디렉토리의 모든 파일 재귀적으로 가져오기
     */
    private getAllFiles(dir: string, extensions: string[]): string[] {
        const files: string[] = [];

        if (!fs.existsSync(dir)) {
            return files;
        }

        const items = fs.readdirSync(dir);

        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                files.push(...this.getAllFiles(fullPath, extensions));
            } else if (stat.isFile()) {
                const ext = path.extname(fullPath);
                if (extensions.includes(ext)) {
                    files.push(fullPath);
                }
            }
        });

        return files;
    }

    /**
     * CHANGELOG.md에 삭제 기록 추가
     */
    private updateChangelog(deletedFiles: string[]): boolean {
        const changelogPath = path.join(this.projectRoot, 'CHANGELOG.md');
        const timestamp = new Date().toISOString().split('T')[0];

        const entry = `## [${timestamp}] - Orphan 페이지 정리

### 삭제된 파일
${deletedFiles.map(file => `- ${path.relative(this.projectRoot, file)}`).join('\n')}

### 변경 사항
- 사용되지 않는 페이지 컴포넌트 제거
- 관련 import 및 라우트 정리
- 테스트 파일 업데이트

`;

        try {
            let content = '';
            if (fs.existsSync(changelogPath)) {
                content = fs.readFileSync(changelogPath, 'utf-8');
            }

            content = entry + content;
            fs.writeFileSync(changelogPath, content);
            console.log(`✅ CHANGELOG.md 업데이트됨`);
            return true;
        } catch (error) {
            console.error(`❌ CHANGELOG.md 업데이트 실패:`, error);
            return false;
        }
    }

    /**
     * 빈 디렉토리 제거
     */
    private removeEmptyDirectories(dir: string): void {
        if (!fs.existsSync(dir)) {
            return;
        }

        const items = fs.readdirSync(dir);

        if (items.length === 0) {
            fs.rmdirSync(dir);
            console.log(`✅ 빈 디렉토리 제거: ${path.relative(this.projectRoot, dir)}`);
            return;
        }

        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                this.removeEmptyDirectories(fullPath);
            }
        });

        // 다시 확인하여 빈 디렉토리 제거
        const remainingItems = fs.readdirSync(dir);
        if (remainingItems.length === 0) {
            fs.rmdirSync(dir);
            console.log(`✅ 빈 디렉토리 제거: ${path.relative(this.projectRoot, dir)}`);
        }
    }

    /**
     * 메인 정리 실행
     */
    public async prune(): Promise<PruneResult> {
        console.log('🧹 Orphan 페이지 정리를 시작합니다...\n');

        const result: PruneResult = {
            deletedFiles: [],
            updatedFiles: [],
            errors: [],
            changelog: ''
        };

        try {
            // 1. orphan 페이지 분석
            const analysis = this.finder.analyze();

            if (analysis.orphanPages.length === 0) {
                console.log('✅ 삭제할 orphan 페이지가 없습니다.');
                return result;
            }

            // 2. 사용자 확인
            const confirmed = await this.confirmDeletion(analysis.orphanPages);
            if (!confirmed) {
                console.log('❌ 사용자가 삭제를 취소했습니다.');
                return result;
            }

            console.log('\n🗑️  파일 삭제 중...');

            // 3. 각 orphan 페이지 처리
            for (const page of analysis.orphanPages) {
                console.log(`\n📄 ${page.componentName} 처리 중...`);

                // 파일 삭제
                if (this.deleteFile(page.filePath)) {
                    result.deletedFiles.push(page.filePath);
                } else {
                    result.errors.push(`파일 삭제 실패: ${page.filePath}`);
                }

                // App.tsx에서 import 제거
                if (this.removeImportFromApp(page.componentName)) {
                    result.updatedFiles.push('src/App.tsx');
                }

                // 테스트 파일 업데이트
                const updatedTests = this.removeTestReferences(page.componentName);
                result.updatedFiles.push(...updatedTests);
            }

            // 4. 빈 디렉토리 정리
            console.log('\n🧹 빈 디렉토리 정리 중...');
            this.removeEmptyDirectories(path.join(this.projectRoot, 'src', 'pages'));

            // 5. CHANGELOG 업데이트
            if (result.deletedFiles.length > 0) {
                this.updateChangelog(result.deletedFiles);
            }

            console.log('\n✅ 정리 완료!');
            console.log(`\n📊 결과:`);
            console.log(`  • 삭제된 파일: ${result.deletedFiles.length}개`);
            console.log(`  • 업데이트된 파일: ${result.updatedFiles.length}개`);
            console.log(`  • 오류: ${result.errors.length}개`);

            if (result.errors.length > 0) {
                console.log('\n❌ 오류 목록:');
                result.errors.forEach(error => console.log(`  • ${error}`));
            }

        } catch (error) {
            console.error('❌ 정리 중 오류가 발생했습니다:', error);
            result.errors.push(error.toString());
        }

        return result;
    }
}

// 메인 실행
if (import.meta.url === `file://${process.argv[1]}`) {
    const pruner = new OrphanPagePruner();

    pruner.prune()
        .then(result => {
            if (result.errors.length > 0) {
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ 예상치 못한 오류:', error);
            process.exit(1);
        });
}

export { OrphanPagePruner };
export type { PruneResult };
