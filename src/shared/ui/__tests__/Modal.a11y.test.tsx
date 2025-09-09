import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithA11y } from '../../lib/a11y-test-utils';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalDescription,
    ModalContentWrapper,
    ModalFooter
} from '../Modal';
import { Button } from '../Button';

// Modal 테스트를 위한 래퍼 컴포넌트
function TestModal({ open, onOpenChange, ...props }: any) {
    return (
        <Modal open={open} onOpenChange={onOpenChange} {...props}>
            <ModalHeader>
                <ModalTitle>Test Modal</ModalTitle>
                <ModalDescription>This is a test modal for accessibility testing.</ModalDescription>
            </ModalHeader>
            <ModalContentWrapper>
                <p>Modal content goes here.</p>
                <input type="text" placeholder="Test input" />
                <button>Test button</button>
            </ModalContentWrapper>
            <ModalFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                </Button>
                <Button onClick={() => onOpenChange(false)}>
                    Confirm
                </Button>
            </ModalFooter>
        </Modal>
    );
}

describe('Modal Accessibility Tests', () => {
    it('should have no accessibility violations when closed', async () => {
        const { checkA11y } = renderWithA11y(
            <TestModal open={false} onOpenChange={jest.fn()} />
        );

        await checkA11y();
    });

    it('should have no accessibility violations when open', async () => {
        const { checkA11y } = renderWithA11y(
            <TestModal open={true} onOpenChange={jest.fn()} />
        );

        await checkA11y();
    });

    it('should have proper ARIA attributes', async () => {
        const { checkA11y } = renderWithA11y(
            <TestModal open={true} onOpenChange={jest.fn()} />
        );

        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby');
        expect(dialog).toHaveAttribute('aria-describedby');

        await checkA11y();
    });

    it('should trap focus when open', async () => {
        const { checkA11y } = renderWithA11y(
            <div>
                <button>Before Modal</button>
                <TestModal open={true} onOpenChange={jest.fn()} />
                <button>After Modal</button>
            </div>
        );

        // 모달이 열렸을 때 첫 번째 포커스 가능한 요소에 포커스가 있어야 함
        const firstFocusable = screen.getByRole('button', { name: /cancel/i });
        expect(firstFocusable).toHaveFocus();

        await checkA11y();
    });

    it('should close on Escape key', async () => {
        const onOpenChange = jest.fn();
        const { checkA11y } = renderWithA11y(
            <TestModal open={true} onOpenChange={onOpenChange} />
        );

        const dialog = screen.getByRole('dialog');
        await userEvent.type(dialog, '{escape}');

        expect(onOpenChange).toHaveBeenCalledWith(false);

        await checkA11y();
    });

    it('should close on overlay click', async () => {
        const onOpenChange = jest.fn();
        const { checkA11y } = renderWithA11y(
            <TestModal open={true} onOpenChange={onOpenChange} closeOnOverlayClick={true} />
        );

        // 배경 오버레이 클릭 (dialog의 부모 요소)
        const overlay = screen.getByRole('dialog').parentElement;
        await userEvent.click(overlay!);

        expect(onOpenChange).toHaveBeenCalledWith(false);

        await checkA11y();
    });

    it('should not close on modal content click', async () => {
        const onOpenChange = jest.fn();
        const { checkA11y } = renderWithA11y(
            <TestModal open={true} onOpenChange={onOpenChange} />
        );

        const dialog = screen.getByRole('dialog');
        await userEvent.click(dialog);

        expect(onOpenChange).not.toHaveBeenCalled();

        await checkA11y();
    });

    it('should cycle focus with Tab key', async () => {
        const { checkA11y } = renderWithA11y(
            <TestModal open={true} onOpenChange={jest.fn()} />
        );

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        const input = screen.getByRole('textbox');
        const testButton = screen.getByRole('button', { name: /test button/i });

        // Tab 순서 테스트
        await userEvent.tab();
        expect(testButton).toHaveFocus();

        await userEvent.tab();
        expect(cancelButton).toHaveFocus();

        await userEvent.tab();
        expect(confirmButton).toHaveFocus();

        // 마지막 요소에서 Tab을 누르면 첫 번째 요소로 돌아가야 함
        await userEvent.tab();
        expect(testButton).toHaveFocus();

        await checkA11y();
    });

    it('should cycle focus with Shift+Tab key', async () => {
        const { checkA11y } = renderWithA11y(
            <TestModal open={true} onOpenChange={jest.fn()} />
        );

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        const input = screen.getByRole('textbox');
        const testButton = screen.getByRole('button', { name: /test button/i });

        // Shift+Tab 순서 테스트
        await userEvent.tab({ shift: true });
        expect(confirmButton).toHaveFocus();

        await userEvent.tab({ shift: true });
        expect(cancelButton).toHaveFocus();

        await userEvent.tab({ shift: true });
        expect(testButton).toHaveFocus();

        // 첫 번째 요소에서 Shift+Tab을 누르면 마지막 요소로 돌아가야 함
        await userEvent.tab({ shift: true });
        expect(confirmButton).toHaveFocus();

        await checkA11y();
    });

    it('should work with different sizes without accessibility issues', async () => {
        const sizes = ['sm', 'md', 'lg', 'xl', '2xl'] as const;

        for (const size of sizes) {
            const { checkA11y } = renderWithA11y(
                <TestModal open={true} onOpenChange={jest.fn()} size={size} />
            );

            await checkA11y();
        }
    });

    it('should have proper heading structure', async () => {
        const { checkA11y } = renderWithA11y(
            <TestModal open={true} onOpenChange={jest.fn()} />
        );

        const heading = screen.getByRole('heading', { level: 2 });
        expect(heading).toHaveTextContent('Test Modal');

        await checkA11y();
    });

    it('should be accessible with screen readers', async () => {
        const { checkA11y } = renderWithA11y(
            <TestModal open={true} onOpenChange={jest.fn()} />
        );

        // 모달이 열렸을 때 스크린 리더가 인식할 수 있는 요소들이 있어야 함
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('heading')).toBeInTheDocument();
        expect(screen.getByText('This is a test modal for accessibility testing.')).toBeInTheDocument();

        await checkA11y();
    });
});
