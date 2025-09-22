import { render, screen } from '@testing-library/react';
import { Button } from '../shared/ui/Button';

describe('Button', () => {
  it('기본 버튼을 렌더링한다', () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole('button', { name: 'Click me' }),
    ).toBeInTheDocument();
  });

  it('다양한 variant를 올바르게 적용한다', () => {
    const { rerender } = render(<Button variant='solid'>Solid</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary-600');

    rerender(<Button variant='outline'>Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-border');

    rerender(<Button variant='ghost'>Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('hover:bg-secondary/60');
  });

  it('다양한 size를 올바르게 적용한다', () => {
    const { rerender } = render(<Button size='sm'>Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-8');

    rerender(<Button size='md'>Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-10');

    rerender(<Button size='lg'>Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-12');
  });

  it('다양한 tone을 올바르게 적용한다', () => {
    const { rerender } = render(<Button tone='success'>Success</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-success-600');

    rerender(<Button tone='warning'>Warning</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-warning-600');

    rerender(<Button tone='danger'>Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-danger-600');
  });

  it('로딩 상태를 올바르게 처리한다', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('disabled 상태를 올바르게 처리한다', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('ARIA 속성을 올바르게 전달한다', () => {
    render(
      <Button aria-label='Custom label' aria-describedby='description'>
        Button
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
    expect(button).toHaveAttribute('aria-describedby', 'description');
  });

  it('asChild prop을 올바르게 처리한다', () => {
    render(
      <Button asChild>
        <a href='/test'>Link Button</a>
      </Button>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
  });
});
