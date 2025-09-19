/**
 * Web Vitals 측정 및 성능 모니터링
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

interface WebVitalsMetric {
    name: string;
    value: number;
    delta: number;
    id: string;
    navigationType: string;
}

interface PerformanceConfig {
    enableLogging: boolean;
    enableAnalytics: boolean;
    enableReporting: boolean;
    reportingEndpoint?: string;
}

const defaultConfig: PerformanceConfig = {
    enableLogging: process.env.NODE_ENV === 'development',
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableReporting: false,
};

class PerformanceMonitor {
    private config: PerformanceConfig;
    private metrics: Map<string, WebVitalsMetric> = new Map();

    constructor(config: Partial<PerformanceConfig> = {}) {
        this.config = { ...defaultConfig, ...config };
    }

    private logMetric(metric: WebVitalsMetric) {
        if (this.config.enableLogging) {
            console.log(`[Web Vitals] ${metric.name}:`, {
                value: metric.value,
                delta: metric.delta,
                id: metric.id,
                navigationType: metric.navigationType,
            });
        }
    }

    private async reportMetric(metric: WebVitalsMetric) {
        if (!this.config.enableReporting || !this.config.reportingEndpoint) return;

        try {
            await fetch(this.config.reportingEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...metric,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                }),
            });
        } catch (error) {
            console.error('Failed to report metric:', error);
        }
    }

    private handleMetric(metric: WebVitalsMetric) {
        this.metrics.set(metric.name, metric);
        this.logMetric(metric);
        this.reportMetric(metric);
    }

    public startMonitoring() {
        // Core Web Vitals
        onCLS((metric: any) => this.handleMetric(metric));
        onINP((metric: any) => this.handleMetric(metric));
        onLCP((metric: any) => this.handleMetric(metric));

        // Additional metrics
        onFCP((metric: any) => this.handleMetric(metric));
        onTTFB((metric: any) => this.handleMetric(metric));
    }

    public getMetrics(): Map<string, WebVitalsMetric> {
        return new Map(this.metrics);
    }

    public getMetric(name: string): WebVitalsMetric | undefined {
        return this.metrics.get(name);
    }

    public getPerformanceScore(): number {
        const lcp = this.getMetric('LCP');
        const inp = this.getMetric('INP');
        const cls = this.getMetric('CLS');

        if (!lcp || !inp || !cls) return 0;

        // 간단한 성능 점수 계산 (0-100)
        let score = 100;

        // LCP 점수 (2.5초 이하가 좋음)
        if (lcp.value > 4000) score -= 30;
        else if (lcp.value > 2500) score -= 15;

        // INP 점수 (200ms 이하가 좋음)
        if (inp.value > 500) score -= 30;
        else if (inp.value > 200) score -= 15;

        // CLS 점수 (0.1 이하가 좋음)
        if (cls.value > 0.25) score -= 30;
        else if (cls.value > 0.1) score -= 15;

        return Math.max(0, score);
    }
}

// 전역 인스턴스
export const performanceMonitor = new PerformanceMonitor();

/**
 * 성능 측정 시작
 */
export function startPerformanceMonitoring(config?: Partial<PerformanceConfig>) {
    if (config) {
        Object.assign(performanceMonitor, config);
    }
    performanceMonitor.startMonitoring();
}

/**
 * 성능 점수 가져오기
 */
export function getPerformanceScore(): number {
    return performanceMonitor.getPerformanceScore();
}

/**
 * 특정 메트릭 가져오기
 */
export function getMetric(name: string): WebVitalsMetric | undefined {
    return performanceMonitor.getMetric(name);
}

/**
 * 모든 메트릭 가져오기
 */
export function getAllMetrics(): Map<string, WebVitalsMetric> {
    return performanceMonitor.getMetrics();
}

/**
 * 성능 경고 체크
 */
export function checkPerformanceWarnings(): string[] {
    const warnings: string[] = [];
    const metrics = performanceMonitor.getMetrics();

    const lcp = metrics.get('LCP');
    if (lcp && lcp.value > 4000) {
        warnings.push(`LCP가 너무 높습니다: ${lcp.value.toFixed(2)}ms (권장: 2500ms 이하)`);
    }

    const inp = metrics.get('INP');
    if (inp && inp.value > 500) {
        warnings.push(`INP가 너무 높습니다: ${inp.value.toFixed(2)}ms (권장: 200ms 이하)`);
    }

    const cls = metrics.get('CLS');
    if (cls && cls.value > 0.25) {
        warnings.push(`CLS가 너무 높습니다: ${cls.value.toFixed(3)} (권장: 0.1 이하)`);
    }

    return warnings;
}

/**
 * 성능 리포트 생성
 */
export function generatePerformanceReport(): {
    score: number;
    metrics: Record<string, WebVitalsMetric>;
    warnings: string[];
    recommendations: string[];
} {
    const score = getPerformanceScore();
    const metrics = Object.fromEntries(getAllMetrics());
    const warnings = checkPerformanceWarnings();

    const recommendations: string[] = [];

    if (score < 50) {
        recommendations.push('전체적인 성능 최적화가 필요합니다.');
    }

    if (warnings.some(w => w.includes('LCP'))) {
        recommendations.push('이미지 최적화 및 코드 스플리팅을 적용하세요.');
    }

    if (warnings.some(w => w.includes('INP'))) {
        recommendations.push('JavaScript 번들 크기를 줄이고 메인 스레드 블로킹을 최소화하세요.');
    }

    if (warnings.some(w => w.includes('CLS'))) {
        recommendations.push('이미지와 동적 콘텐츠에 적절한 크기를 설정하세요.');
    }

    return {
        score,
        metrics,
        warnings,
        recommendations,
    };
}

// 자동으로 성능 모니터링 시작
if (typeof window !== 'undefined') {
    startPerformanceMonitoring({
        enableLogging: process.env.NODE_ENV === 'development',
        enableAnalytics: process.env.NODE_ENV === 'production',
    });
}
