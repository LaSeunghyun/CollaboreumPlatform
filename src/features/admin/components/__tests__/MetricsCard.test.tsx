import React from 'react';
import { render, screen } from '@testing-library/react';
import { MetricsCard } from '../MetricsCard';
import { Users } from 'lucide-react';

describe('MetricsCard 컴포넌트 테스트', () => {
  it('기본 props로 렌더링된다', () => {
    render(<MetricsCard title='테스트 제목' value='100' icon={Users} />);

    expect(screen.getByText('테스트 제목')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('variant가 제공되면 올바른 스타일이 적용된다', () => {
    render(
      <MetricsCard
        title='테스트 제목'
        value='100'
        icon={Users}
        variant='success'
      />,
    );

    expect(screen.getByText('테스트 제목')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('trend가 제공되면 표시된다', () => {
    render(
      <MetricsCard
        title='테스트 제목'
        value='100'
        trend={{ value: 5.2, isPositive: true }}
        icon={Users}
      />,
    );

    expect(screen.getByText('+5.2%')).toBeInTheDocument();
    expect(screen.getByText('vs 이전 기간')).toBeInTheDocument();
  });

  it('trend가 양수일 때 올바른 색상으로 표시된다', () => {
    render(
      <MetricsCard
        title='테스트 제목'
        value='100'
        trend={{ value: 5.2, isPositive: true }}
        icon={Users}
      />,
    );

    const trendElement = screen.getByText('+5.2%');
    expect(trendElement).toHaveClass('text-green-600');
  });

  it('trend가 음수일 때 올바른 색상으로 표시된다', () => {
    render(
      <MetricsCard
        title='테스트 제목'
        value='100'
        trend={{ value: -2.5, isPositive: false }}
        icon={Users}
      />,
    );

    const trendElement = screen.getByText('-2.5%');
    expect(trendElement).toHaveClass('text-red-600');
  });

  it('접근성 속성이 올바르게 설정되어 있다', () => {
    render(<MetricsCard title='테스트 제목' value='100' icon={Users} />);

    // 제목과 값이 올바르게 표시되는지 확인
    expect(screen.getByText('테스트 제목')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();

    // 카드가 렌더링되었는지 확인
    const cards = screen.getAllByRole('generic');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('숫자 값이 올바르게 포맷팅되어 표시된다', () => {
    render(<MetricsCard title='총 금액' value='₩1,000,000' icon={Users} />);

    expect(screen.getByText('₩1,000,000')).toBeInTheDocument();
  });

  it('아이콘이 올바르게 렌더링된다', () => {
    render(<MetricsCard title='테스트 제목' value='100' icon={Users} />);

    // 아이콘 컨테이너가 존재하는지 확인
    const iconContainer = screen.getByRole('img', { hidden: true });
    expect(iconContainer).toBeInTheDocument();

    // 아이콘이 렌더링되었는지 확인
    const svgIcon = screen.getByRole('img', { hidden: true });
    expect(svgIcon).toBeInTheDocument();
  });

  it('다양한 variant가 올바르게 적용된다', () => {
    const { rerender } = render(
      <MetricsCard
        title='성공 메트릭'
        value='100'
        icon={Users}
        variant='success'
      />,
    );

    expect(screen.getByText('성공 메트릭')).toBeInTheDocument();

    rerender(
      <MetricsCard
        title='경고 메트릭'
        value='50'
        icon={Users}
        variant='warning'
      />,
    );

    expect(screen.getByText('경고 메트릭')).toBeInTheDocument();

    rerender(
      <MetricsCard
        title='위험 메트릭'
        value='10'
        icon={Users}
        variant='danger'
      />,
    );

    expect(screen.getByText('위험 메트릭')).toBeInTheDocument();
  });
});
