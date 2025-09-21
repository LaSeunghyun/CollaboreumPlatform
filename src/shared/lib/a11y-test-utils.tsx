import { render, RenderOptions } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ReactElement } from 'react';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

/**
 * 접근성 테스트를 위한 커스텀 렌더 함수
 * @param ui 렌더할 컴포넌트
 * @param options 렌더 옵션
 * @returns 렌더 결과와 접근성 테스트 함수
 */
export function renderWithA11y(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  const result = render(ui, options);

  return {
    ...result,
    checkA11y: async () => {
      const { container } = result;
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      return results;
    },
  };
}

/**
 * 접근성 테스트만 실행하는 함수
 * @param container 테스트할 DOM 컨테이너
 * @returns 접근성 검사 결과
 */
export async function checkA11y(container: HTMLElement) {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
  return results;
}

/**
 * 접근성 테스트를 위한 기본 설정
 */
export const a11yTestConfig = {
  rules: {
    // 특정 규칙 비활성화 (필요시)
    'color-contrast': { enabled: false }, // 색상 대비는 디자인에서 처리
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
};
