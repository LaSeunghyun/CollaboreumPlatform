import React from 'react';
import { render, screen, waitFor } from '../test-utils/testUtils';
import { measurePerformance, measureMemory } from '../test-utils/testUtils';
import { VirtualizedList } from '../shared/ui/VirtualizedList';
import { OptimizedImage } from '../shared/ui/OptimizedImage';

describe('Performance Tests', () => {
  describe('Rendering Performance', () => {
    it('should render large lists efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        title: `Item ${i}`,
        description: `Description for item ${i}`,
      }));

      const renderTime = measurePerformance(() => {
        render(
          <VirtualizedList
            items={largeDataset}
            itemHeight={50}
            containerHeight={400}
            renderItem={item => (
              <div key={item.id} data-testid={`item-${item.id}`}>
                {item.title}
              </div>
            )}
          />,
        );
      });

      // 렌더링 시간이 100ms 이하여야 함
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle image loading efficiently', async () => {
      const renderTime = measurePerformance(() => {
        render(
          <OptimizedImage
            src='https://via.placeholder.com/400x300'
            alt='Test image'
            width={400}
            height={300}
            lazy={true}
          />,
        );
      });

      // 이미지 컴포넌트 렌더링 시간이 50ms 이하여야 함
      expect(renderTime).toBeLessThan(50);
    });

    it('should not cause memory leaks with frequent re-renders', () => {
      const initialMemory = measureMemory();

      if (initialMemory) {
        // 100번의 리렌더링 시뮬레이션
        for (let i = 0; i < 100; i++) {
          const { unmount } = render(
            <div data-testid={`test-${i}`}>
              <OptimizedImage
                src={`https://via.placeholder.com/400x300?text=${i}`}
                alt={`Test image ${i}`}
                width={400}
                height={300}
              />
            </div>,
          );
          unmount();
        }

        // 가비지 컬렉션 강제 실행
        if (global.gc) {
          global.gc();
        }

        const finalMemory = measureMemory();

        if (finalMemory && initialMemory) {
          // 메모리 사용량이 2배 이상 증가하지 않아야 함
          const memoryIncrease =
            finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
          const memoryIncreaseRatio =
            memoryIncrease / initialMemory.usedJSHeapSize;

          expect(memoryIncreaseRatio).toBeLessThan(1);
        }
      }
    });
  });

  describe('Component Performance', () => {
    it('should handle rapid state changes efficiently', () => {
      const TestComponent = () => {
        const [count, setCount] = React.useState(0);

        React.useEffect(() => {
          const interval = setInterval(() => {
            setCount(prev => prev + 1);
          }, 1);

          return () => clearInterval(interval);
        }, []);

        return <div data-testid='count'>{count}</div>;
      };

      const renderTime = measurePerformance(() => {
        render(<TestComponent />);
      });

      // 컴포넌트 렌더링 시간이 50ms 이하여야 함
      expect(renderTime).toBeLessThan(50);
    });

    it('should efficiently handle large form inputs', () => {
      const TestForm = () => {
        const [values, setValues] = React.useState<Record<string, string>>({});

        const handleChange = (key: string, value: string) => {
          setValues(prev => ({ ...prev, [key]: value }));
        };

        return (
          <form data-testid='large-form'>
            {Array.from({ length: 100 }, (_, i) => (
              <input
                key={i}
                data-testid={`input-${i}`}
                value={values[`input-${i}`] || ''}
                onChange={e => handleChange(`input-${i}`, e.target.value)}
                placeholder={`Input ${i}`}
              />
            ))}
          </form>
        );
      };

      const renderTime = measurePerformance(() => {
        render(<TestForm />);
      });

      // 대용량 폼 렌더링 시간이 200ms 이하여야 함
      expect(renderTime).toBeLessThan(200);
    });
  });

  describe('Memory Performance', () => {
    it('should not accumulate memory with component unmounting', () => {
      const initialMemory = measureMemory();

      if (initialMemory) {
        // 컴포넌트 마운트/언마운트 반복
        for (let i = 0; i < 50; i++) {
          const { unmount } = render(
            <div>
              <VirtualizedList
                items={Array.from({ length: 100 }, (_, j) => ({
                  id: j,
                  title: `Item ${j}`,
                }))}
                itemHeight={50}
                containerHeight={400}
                renderItem={item => <div key={item.id}>{item.title}</div>}
              />
            </div>,
          );
          unmount();
        }

        // 가비지 컬렉션 강제 실행
        if (global.gc) {
          global.gc();
        }

        const finalMemory = measureMemory();

        if (finalMemory && initialMemory) {
          // 메모리 사용량이 50% 이상 증가하지 않아야 함
          const memoryIncrease =
            finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
          const memoryIncreaseRatio =
            memoryIncrease / initialMemory.usedJSHeapSize;

          expect(memoryIncreaseRatio).toBeLessThan(0.5);
        }
      }
    });

    it('should handle large datasets without memory issues', () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        title: `Item ${i}`,
        description: `Description for item ${i}`,
        data: new Array(100).fill(0).map((_, j) => `data-${i}-${j}`),
      }));

      const initialMemory = measureMemory();

      if (initialMemory) {
        const { unmount } = render(
          <VirtualizedList
            items={largeDataset}
            itemHeight={50}
            containerHeight={400}
            renderItem={item => (
              <div key={item.id}>
                <div>{item.title}</div>
                <div>{item.description}</div>
              </div>
            )}
          />,
        );

        const afterRenderMemory = measureMemory();

        if (afterRenderMemory && initialMemory) {
          // 메모리 사용량이 10MB 이하로 증가해야 함
          const memoryIncrease =
            afterRenderMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
          const memoryIncreaseMB = memoryIncrease / (1024 * 1024);

          expect(memoryIncreaseMB).toBeLessThan(10);
        }

        unmount();
      }
    });
  });

  describe('Network Performance', () => {
    it('should handle slow network responses gracefully', async () => {
      // 느린 네트워크 응답 시뮬레이션
      const slowResponse = new Promise(resolve =>
        setTimeout(() => resolve({ data: 'slow response' }), 1000),
      );

      const startTime = performance.now();

      try {
        await Promise.race([
          slowResponse,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 500),
          ),
        ]);
      } catch (error) {
        // 타임아웃 예상됨
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 타임아웃이 500ms 내에 발생해야 함
      expect(duration).toBeLessThan(600);
    });

    it('should handle concurrent API calls efficiently', async () => {
      const apiCall = () =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: 'response' }), 100),
        );

      const startTime = performance.now();

      // 10개의 동시 API 호출
      const promises = Array.from({ length: 10 }, () => apiCall());
      await Promise.all(promises);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 동시 호출이 순차 호출보다 빠르게 완료되어야 함
      expect(duration).toBeLessThan(200);
    });
  });

  describe('User Interaction Performance', () => {
    it('should handle rapid user interactions efficiently', () => {
      const TestComponent = () => {
        const [count, setCount] = React.useState(0);
        const [isLoading, setIsLoading] = React.useState(false);

        const handleClick = async () => {
          setIsLoading(true);
          // 비동기 작업 시뮬레이션
          await new Promise(resolve => setTimeout(resolve, 10));
          setCount(prev => prev + 1);
          setIsLoading(false);
        };

        return (
          <div>
            <button
              data-testid='increment-button'
              onClick={handleClick}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : `Count: ${count}`}
            </button>
          </div>
        );
      };

      const { getByTestId } = render(<TestComponent />);
      const button = getByTestId('increment-button');

      const startTime = performance.now();

      // 10번의 빠른 클릭
      for (let i = 0; i < 10; i++) {
        button.click();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 10번의 클릭이 100ms 내에 처리되어야 함
      expect(duration).toBeLessThan(100);
    });

    it('should handle scroll events efficiently', () => {
      const TestComponent = () => {
        const [scrollPosition, setScrollPosition] = React.useState(0);

        const handleScroll = React.useCallback(
          (e: React.UIEvent<HTMLDivElement>) => {
            setScrollPosition(e.currentTarget.scrollTop);
          },
          [],
        );

        return (
          <div
            data-testid='scroll-container'
            style={{ height: '200px', overflow: 'auto' }}
            onScroll={handleScroll}
          >
            <div style={{ height: '1000px' }}>
              <div data-testid='scroll-position'>{scrollPosition}</div>
            </div>
          </div>
        );
      };

      const { getByTestId } = render(<TestComponent />);
      const container = getByTestId('scroll-container');

      const startTime = performance.now();

      // 빠른 스크롤 시뮬레이션
      for (let i = 0; i < 100; i++) {
        container.scrollTop = i * 10;
        container.dispatchEvent(new Event('scroll', { bubbles: true }));
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 스크롤 이벤트 처리가 50ms 내에 완료되어야 함
      expect(duration).toBeLessThan(50);
    });
  });
});
