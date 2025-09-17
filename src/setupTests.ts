// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jest-axe 설정
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

// 전역 테스트 설정
beforeEach(() => {
    // 각 테스트 전에 DOM 정리
    document.body.innerHTML = '';
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
    root = null;
    rootMargin = '';
    thresholds = [];
    takeRecords() { return []; }
} as unknown as typeof globalThis.IntersectionObserver;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: jest.fn(),
});

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
        getPropertyValue: () => '',
    }),
});