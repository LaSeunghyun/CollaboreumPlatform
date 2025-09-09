import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithA11y } from '../../lib/a11y-test-utils';
import { Button } from '../Button';

describe('Button Accessibility Tests', () => {
    it('should have no accessibility violations', async () => {
        const { checkA11y } = renderWithA11y(
            <Button>Accessible Button</Button>
        );

        await checkA11y();
    });

    it('should have proper ARIA attributes when disabled', async () => {
        const { checkA11y } = renderWithA11y(
            <Button disabled>Disabled Button</Button>
        );

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute('aria-disabled', 'true');

        await checkA11y();
    });

    it('should be focusable and keyboard accessible', async () => {
        const { checkA11y } = renderWithA11y(
            <Button>Focusable Button</Button>
        );

        const button = screen.getByRole('button');
        button.focus();
        expect(button).toHaveFocus();

        // Tab 키로 포커스 이동 테스트
        await userEvent.tab();
        expect(button).toHaveFocus();

        await checkA11y();
    });

    it('should support keyboard interaction', async () => {
        const handleClick = jest.fn();
        const { checkA11y } = renderWithA11y(
            <Button onClick={handleClick}>Clickable Button</Button>
        );

        const button = screen.getByRole('button');

        // Enter 키로 클릭
        await userEvent.type(button, '{enter}');
        expect(handleClick).toHaveBeenCalledTimes(1);

        // Space 키로 클릭
        await userEvent.type(button, ' ');
        expect(handleClick).toHaveBeenCalledTimes(2);

        await checkA11y();
    });

    it('should have proper button role', async () => {
        const { checkA11y } = renderWithA11y(
            <Button>Button with Role</Button>
        );

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button.tagName).toBe('BUTTON');

        await checkA11y();
    });

    it('should work with different variants without accessibility issues', async () => {
        const variants = ['solid', 'outline', 'ghost', 'link'] as const;

        for (const variant of variants) {
            const { checkA11y } = renderWithA11y(
                <Button variant={variant}>{variant} Button</Button>
            );

            await checkA11y();
        }
    });

    it('should work with different sizes without accessibility issues', async () => {
        const sizes = ['sm', 'md', 'lg', 'icon'] as const;

        for (const size of sizes) {
            const { checkA11y } = renderWithA11y(
                <Button size={size}>{size} Button</Button>
            );

            await checkA11y();
        }
    });

    it('should work with different tones without accessibility issues', async () => {
        const tones = ['default', 'success', 'warning', 'danger'] as const;

        for (const tone of tones) {
            const { checkA11y } = renderWithA11y(
                <Button tone={tone}>{tone} Button</Button>
            );

            await checkA11y();
        }
    });

    it('should maintain accessibility with complex content', async () => {
        const { checkA11y } = renderWithA11y(
            <Button>
                <span>Complex</span>
                <span>Button</span>
                <span>Content</span>
            </Button>
        );

        await checkA11y();
    });

    it('should be accessible when used in a form', async () => {
        const { checkA11y } = renderWithA11y(
            <form>
                <label htmlFor="input">Test Input</label>
                <input id="input" type="text" />
                <Button type="submit">Submit</Button>
                <Button type="button">Cancel</Button>
            </form>
        );

        await checkA11y();
    });
});
