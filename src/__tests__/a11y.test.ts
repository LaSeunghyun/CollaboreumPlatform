import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import App from '../App';
import { AuthProvider } from '../contexts/AuthContext';

// jest-axe 확장
expect.extend(toHaveNoViolations);

// 테스트 래퍼 컴포넌트
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AuthProvider>
    { children }
    </AuthProvider>
);

describe('접근성 테스트', () => {
    it('메인 앱이 접근성 위반 없이 렌더링되어야 함', async () => {
        const { container } = render(
            <TestWrapper>
            <App />
            </TestWrapper>
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('핵심 UI 요소들이 접근성 기준을 만족해야 함', async () => {
        const { container } = render(
            <TestWrapper>
            <App />
            </TestWrapper>
        );

        // 기본적인 접근성 요소들 확인
        expect(screen.getByRole('main')).toBeInTheDocument();

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
