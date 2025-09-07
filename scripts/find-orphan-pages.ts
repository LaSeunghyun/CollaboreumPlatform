#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface PageInfo {
    filePath: string;
    componentName: string;
    isInRoutes: boolean;
    importReferences: string[];
    linkReferences: string[];
    testReferences: string[];
    isOrphan: boolean;
    reasons: string[];
}

interface OrphanCheckResult {
    totalPages: number;
    orphanPages: PageInfo[];
    safePages: PageInfo[];
    summary: {
        canDelete: number;
        shouldKeep: number;
        warnings: string[];
    };
}

class OrphanPageFinder {
    private projectRoot: string;
    private pagesDir: string;
    private srcDir: string;

    constructor() {
        this.projectRoot = process.cwd();
        this.pagesDir = path.join(this.projectRoot, 'src', 'pages');
        this.srcDir = path.join(this.projectRoot, 'src');
    }

    /**
     * App.tsx에서 등록된 라우트들을 추출
     */
    private extractRoutesFromApp(): string[] {
        const appPath = path.join(this.srcDir, 'App.tsx');
        if (!fs.existsSync(appPath)) {
            throw new Error('App.tsx를 찾을 수 없습니다.');
        }

        const appContent = fs.readFileSync(appPath, 'utf-8');
        const routes: string[] = [];

        // import 문에서 페이지 컴포넌트 추출
        const importRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"](\.\/pages\/[^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(appContent)) !== null) {
            const imports = match[1].split(',').map(imp => imp.trim());
            const importPath = match[2];
            imports.forEach(imp => {
                if (imp.includes('Page')) {
                    routes.push(imp);
                }
            });
        }

        // Route 컴포넌트에서 사용되는 컴포넌트 추출
        const routeRegex = /<Route[^>]*element=\{<[^>]*>([^<]+)<\/[^>]*>\}/g;
        while ((match = routeRegex.exec(appContent)) !== null) {
            const componentName = match[1].trim();
            if (componentName.includes('Page')) {
                routes.push(componentName);
            }
        }

        return Array.from(new Set(routes));
    }

    /**
     * pages 디렉토리의 모든 페이지 파일 스캔
     */
    private scanPageFiles(): string[] {
        const pattern = path.join(this.pagesDir, '**', '*.{ts,tsx}');
        return glob.sync(pattern);
    }

    /**
     * 파일에서 컴포넌트 이름 추출
     */
    private extractComponentName(filePath: string): string {
        const content = fs.readFileSync(filePath, 'utf-8');

        // export default 또는 export const/function 패턴 찾기
        const exportDefaultRegex = /export\s+default\s+function\s+(\w+)/;
        const exportConstRegex = /export\s+const\s+(\w+)/;
        const exportFunctionRegex = /export\s+function\s+(\w+)/;

        let match = exportDefaultRegex.exec(content) ||
            exportConstRegex.exec(content) ||
            exportFunctionRegex.exec(content);

        if (match) {
            return match[1];
        }

        // 파일명에서 컴포넌트명 추출 (fallback)
        const fileName = path.basename(filePath, path.extname(filePath));
        return fileName;
    }

    /**
     * 코드베이스에서 컴포넌트 참조 검색
     */
    private findReferences(componentName: string): {
        imports: string[];
        links: string[];
        tests: string[];
    } {
        const imports: string[] = [];
        const links: string[] = [];
        const tests: string[] = [];

        // src 디렉토리의 모든 파일 검색
        const srcFiles = glob.sync(path.join(this.srcDir, '**', '*.{ts,tsx,js,jsx}'));

        srcFiles.forEach(filePath => {
            const content = fs.readFileSync(filePath, 'utf-8');

            // import 참조 검색
            const importRegex = new RegExp(`import.*{.*${componentName}.*}.*from|import.*${componentName}.*from`, 'g');
            if (importRegex.test(content)) {
                imports.push(filePath);
            }

            // JSX에서 사용 검색
            const jsxRegex = new RegExp(`<${componentName}[\\s>]`, 'g');
            if (jsxRegex.test(content)) {
                imports.push(filePath);
            }

            // Link/NavLink 참조 검색 (경로 기반)
            const linkRegex = /to=["']([^"']+)["']/g;
            let match;
            while ((match = linkRegex.exec(content)) !== null) {
                const linkPath = match[1];
                if (this.isPagePath(linkPath, componentName)) {
                    links.push(`${filePath}:${this.getLineNumber(content, match.index)}`);
                }
            }

            // 테스트 파일인지 확인
            if (filePath.includes('__tests__') || filePath.includes('.test.') || filePath.includes('.spec.')) {
                if (content.includes(componentName)) {
                    tests.push(filePath);
                }
            }
        });

        return { imports, links, tests };
    }

    /**
     * 경로가 페이지 경로인지 확인
     */
    private isPagePath(linkPath: string, componentName: string): boolean {
        const pageRoutes: { [key: string]: string } = {
            'HomePage': '/',
            'ArtistsPage': '/artists',
            'ProjectsPage': '/projects',
            'CommunityPage': '/community',
            'NoticesPage': '/notices',
            'EventsPage': '/events',
            'AccountPage': '/account'
        };

        return pageRoutes[componentName] === linkPath;
    }

    /**
     * 문자열에서 라인 번호 찾기
     */
    private getLineNumber(content: string, index: number): number {
        return content.substring(0, index).split('\n').length;
    }

    /**
     * 페이지가 orphan인지 판단
     */
    private isOrphanPage(pageInfo: PageInfo): boolean {
        const reasons: string[] = [];

        // 1. 라우트에 등록되지 않음
        if (!pageInfo.isInRoutes) {
            reasons.push('라우트에 등록되지 않음');
        }

        // 2. import 참조가 없음
        if (pageInfo.importReferences.length === 0) {
            reasons.push('import 참조가 없음');
        }

        // 3. 링크 참조가 없음
        if (pageInfo.linkReferences.length === 0) {
            reasons.push('링크 참조가 없음');
        }

        pageInfo.reasons = reasons;
        return reasons.length >= 2; // 2개 이상의 조건을 만족하면 orphan
    }

    /**
     * 메인 분석 실행
     */
    public analyze(): OrphanCheckResult {
        console.log('🔍 Orphan 페이지 분석을 시작합니다...\n');

        // 1. 등록된 라우트 추출
        const registeredRoutes = this.extractRoutesFromApp();
        console.log(`📋 등록된 라우트: ${registeredRoutes.join(', ')}`);

        // 2. 페이지 파일 스캔
        const pageFiles = this.scanPageFiles();
        console.log(`📁 발견된 페이지 파일: ${pageFiles.length}개\n`);

        const pages: PageInfo[] = [];
        const warnings: string[] = [];

        // 3. 각 페이지 분석
        for (const filePath of pageFiles) {
            const componentName = this.extractComponentName(filePath);
            const isInRoutes = registeredRoutes.includes(componentName);

            console.log(`🔎 ${componentName} 분석 중...`);

            const references = this.findReferences(componentName);

            const pageInfo: PageInfo = {
                filePath,
                componentName,
                isInRoutes,
                importReferences: references.imports,
                linkReferences: references.links,
                testReferences: references.tests,
                isOrphan: false,
                reasons: []
            };

            pageInfo.isOrphan = this.isOrphanPage(pageInfo);
            pages.push(pageInfo);

            // 경고 메시지 생성
            if (!isInRoutes && references.imports.length > 0) {
                warnings.push(`${componentName}: 라우트에 등록되지 않았지만 import 참조가 있음`);
            }
        }

        // 4. 결과 분류
        const orphanPages = pages.filter(p => p.isOrphan);
        const safePages = pages.filter(p => !p.isOrphan);

        const result: OrphanCheckResult = {
            totalPages: pages.length,
            orphanPages,
            safePages,
            summary: {
                canDelete: orphanPages.length,
                shouldKeep: safePages.length,
                warnings
            }
        };

        return result;
    }

    /**
     * 결과를 콘솔에 출력
     */
    public printResults(result: OrphanCheckResult): void {
        console.log('\n' + '='.repeat(60));
        console.log('📊 ORPHAN 페이지 분석 결과');
        console.log('='.repeat(60));

        console.log(`\n📈 요약:`);
        console.log(`  • 전체 페이지: ${result.totalPages}개`);
        console.log(`  • 삭제 가능: ${result.summary.canDelete}개`);
        console.log(`  • 보존 필요: ${result.summary.shouldKeep}개`);

        if (result.summary.warnings.length > 0) {
            console.log(`\n⚠️  경고:`);
            result.summary.warnings.forEach(warning => {
                console.log(`  • ${warning}`);
            });
        }

        if (result.orphanPages.length > 0) {
            console.log(`\n🗑️  삭제 후보 (${result.orphanPages.length}개):`);
            result.orphanPages.forEach(page => {
                console.log(`\n  📄 ${page.componentName}`);
                console.log(`     파일: ${path.relative(this.projectRoot, page.filePath)}`);
                console.log(`     이유: ${page.reasons.join(', ')}`);
                console.log(`     import 참조: ${page.importReferences.length}개`);
                console.log(`     링크 참조: ${page.linkReferences.length}개`);
                console.log(`     테스트 참조: ${page.testReferences.length}개`);
            });
        }

        if (result.safePages.length > 0) {
            console.log(`\n✅ 보존할 페이지 (${result.safePages.length}개):`);
            result.safePages.forEach(page => {
                console.log(`  📄 ${page.componentName} - ${page.importReferences.length}개 참조`);
            });
        }
    }

    /**
     * 결과를 JSON 파일로 저장
     */
    public saveResults(result: OrphanCheckResult): void {
        const outputPath = path.join(this.projectRoot, 'orphan-analysis.json');
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
        console.log(`\n💾 결과가 ${outputPath}에 저장되었습니다.`);
    }

    /**
     * PR 코멘트용 마크다운 생성
     */
    public generateMarkdown(result: OrphanCheckResult): string {
        let markdown = '# 🔍 Orphan 페이지 분석 결과\n\n';

        markdown += `## 📊 요약\n`;
        markdown += `- **전체 페이지**: ${result.totalPages}개\n`;
        markdown += `- **삭제 가능**: ${result.summary.canDelete}개\n`;
        markdown += `- **보존 필요**: ${result.summary.shouldKeep}개\n\n`;

        if (result.summary.warnings.length > 0) {
            markdown += `## ⚠️ 경고\n`;
            result.summary.warnings.forEach(warning => {
                markdown += `- ${warning}\n`;
            });
            markdown += '\n';
        }

        if (result.orphanPages.length > 0) {
            markdown += `## 🗑️ 삭제 후보 (${result.orphanPages.length}개)\n\n`;
            result.orphanPages.forEach(page => {
                markdown += `### ${page.componentName}\n`;
                markdown += `- **파일**: \`${path.relative(this.projectRoot, page.filePath)}\`\n`;
                markdown += `- **이유**: ${page.reasons.join(', ')}\n`;
                markdown += `- **참조 수**: import ${page.importReferences.length}개, 링크 ${page.linkReferences.length}개, 테스트 ${page.testReferences.length}개\n\n`;
            });
        }

        return markdown;
    }
}

// 메인 실행
if (import.meta.url === `file://${process.argv[1]}`) {
    const finder = new OrphanPageFinder();

    try {
        const result = finder.analyze();
        finder.printResults(result);
        finder.saveResults(result);

        // 마크다운 파일도 저장
        const markdown = finder.generateMarkdown(result);
        const markdownPath = path.join(process.cwd(), 'orphan-analysis.md');
        fs.writeFileSync(markdownPath, markdown);
        console.log(`📝 마크다운 결과가 ${markdownPath}에 저장되었습니다.`);

    } catch (error) {
        console.error('❌ 분석 중 오류가 발생했습니다:', error);
        process.exit(1);
    }
}

export { OrphanPageFinder };
export type { OrphanCheckResult, PageInfo };
