import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VirtualizedList } from '../components/ui/VirtualizedList';

describe('VirtualizedList', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    title: `Item ${i}`,
    content: `Content for item ${i}`,
  }));

  const mockRenderItem = (item: any, index: number) => (
    <div key={item.id} data-testid={`item-${index}`}>
      {item.title}
    </div>
  );

  it('기본 렌더링이 올바르게 작동한다', () => {
    render(
      <VirtualizedList
        items={mockItems}
        itemHeight={50}
        containerHeight={300}
        renderItem={mockRenderItem}
      />,
    );

    // 화면에 보이는 아이템들만 렌더링되는지 확인
    const visibleItems = screen.getAllByTestId(/item-\d+/);
    expect(visibleItems.length).toBeLessThanOrEqual(10); // 300px / 50px + overscan
  });

  it('빈 배열을 올바르게 처리한다', () => {
    render(
      <VirtualizedList
        items={[]}
        itemHeight={50}
        containerHeight={300}
        renderItem={mockRenderItem}
      />,
    );

    expect(screen.queryByTestId(/item-\d+/)).not.toBeInTheDocument();
  });

  it('undefined items를 올바르게 처리한다', () => {
    render(
      <VirtualizedList
        items={undefined as any}
        itemHeight={50}
        containerHeight={300}
        renderItem={mockRenderItem}
      />,
    );

    expect(screen.queryByTestId(/item-\d+/)).not.toBeInTheDocument();
  });

  it('스크롤 시 올바르게 아이템이 업데이트된다', () => {
    render(
      <VirtualizedList
        items={mockItems}
        itemHeight={50}
        containerHeight={300}
        renderItem={mockRenderItem}
      />,
    );

    const container = screen.getByRole('listbox');

    // 스크롤 이벤트 시뮬레이션
    fireEvent.scroll(container, { target: { scrollTop: 1000 } });

    // 스크롤 후 다른 아이템들이 렌더링되는지 확인
    const visibleItems = screen.getAllByTestId(/item-\d+/);
    expect(visibleItems.length).toBeGreaterThan(0);
  });

  it('커스텀 className을 올바르게 적용한다', () => {
    render(
      <VirtualizedList
        items={mockItems}
        itemHeight={50}
        containerHeight={300}
        renderItem={mockRenderItem}
        className='custom-class'
      />,
    );

    const container = screen.getByRole('listbox');
    expect(container).toHaveClass('custom-class');
  });

  it('overscan이 올바르게 작동한다', () => {
    render(
      <VirtualizedList
        items={mockItems}
        itemHeight={50}
        containerHeight={300}
        renderItem={mockRenderItem}
        overscan={10}
      />,
    );

    // overscan이 적용되어 더 많은 아이템이 렌더링되는지 확인
    const visibleItems = screen.getAllByTestId(/item-\d+/);
    expect(visibleItems.length).toBeGreaterThan(6); // 기본 6개 + overscan 10개
  });
});
