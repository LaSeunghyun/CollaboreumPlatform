import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Select, SelectContent, SelectItem } from '../Select'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('Select Component', () => {
    const defaultProps = {
        placeholder: 'Select an option',
        children: (
            <>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
            </>
        )
    }

    it('renders with placeholder text', () => {
        render(<Select {...defaultProps} />)
        expect(screen.getByText('Select an option')).toBeInTheDocument()
    })

    it('opens dropdown when clicked', async () => {
        const user = userEvent.setup()
        render(<Select {...defaultProps} />)

        const trigger = screen.getByRole('combobox')
        await user.click(trigger)

        expect(screen.getByRole('listbox')).toBeInTheDocument()
        expect(screen.getByText('Option 1')).toBeInTheDocument()
        expect(screen.getByText('Option 2')).toBeInTheDocument()
        expect(screen.getByText('Option 3')).toBeInTheDocument()
    })

    it('closes dropdown when option is selected', async () => {
        const user = userEvent.setup()
        const onValueChange = jest.fn()

        render(<Select {...defaultProps} onValueChange={onValueChange} />)

        const trigger = screen.getByRole('combobox')
        await user.click(trigger)

        const option1 = screen.getByText('Option 1')
        await user.click(option1)

        expect(onValueChange).toHaveBeenCalledWith('option1')
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
        expect(screen.getByText('Option 1')).toBeInTheDocument()
    })

    it('handles keyboard navigation', async () => {
        const user = userEvent.setup()
        render(<Select {...defaultProps} />)

        const trigger = screen.getByRole('combobox')
        trigger.focus()

        // Open with Enter
        await user.keyboard('{Enter}')
        expect(screen.getByRole('listbox')).toBeInTheDocument()

        // Navigate with arrow keys
        await user.keyboard('{ArrowDown}')
        const firstOption = screen.getByText('Option 1')
        expect(firstOption).toHaveFocus()

        await user.keyboard('{ArrowDown}')
        const secondOption = screen.getByText('Option 2')
        expect(secondOption).toHaveFocus()

        // Select with Enter
        await user.keyboard('{Enter}')
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
        expect(screen.getByText('Option 2')).toBeInTheDocument()
    })

    it('closes dropdown with Escape key', async () => {
        const user = userEvent.setup()
        render(<Select {...defaultProps} />)

        const trigger = screen.getByRole('combobox')
        await user.click(trigger)

        expect(screen.getByRole('listbox')).toBeInTheDocument()

        await user.keyboard('{Escape}')
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('closes dropdown when clicking outside', async () => {
        const user = userEvent.setup()
        render(
            <div>
                <Select {...defaultProps} />
                <div data-testid="outside">Outside element</div>
            </div>
        )

        const trigger = screen.getByRole('combobox')
        await user.click(trigger)

        expect(screen.getByRole('listbox')).toBeInTheDocument()

        const outside = screen.getByTestId('outside')
        await user.click(outside)

        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('displays selected value correctly', () => {
        render(<Select {...defaultProps} value="option2" />)
        expect(screen.getByText('Option 2')).toBeInTheDocument()
    })

    it('shows checkmark for selected item', async () => {
        const user = userEvent.setup()
        render(<Select {...defaultProps} value="option1" />)

        const trigger = screen.getByRole('combobox')
        await user.click(trigger)

        const selectedItem = screen.getByText('Option 1').closest('[role="option"]')
        expect(selectedItem).toHaveAttribute('aria-selected', 'true')
    })

    it('is disabled when disabled prop is true', () => {
        render(<Select {...defaultProps} disabled />)
        const trigger = screen.getByRole('combobox')
        expect(trigger).toHaveAttribute('tabIndex', '-1')
    })

    it('applies correct size variants', () => {
        const { rerender } = render(<Select {...defaultProps} size="sm" />)
        let trigger = screen.getByRole('combobox')
        expect(trigger).toHaveClass('h-8', 'px-2', 'text-xs')

        rerender(<Select {...defaultProps} size="lg" />)
        trigger = screen.getByRole('combobox')
        expect(trigger).toHaveClass('h-12', 'px-4', 'text-base')
    })

    it('applies correct tone variants', () => {
        const { rerender } = render(<Select {...defaultProps} tone="success" />)
        let trigger = screen.getByRole('combobox')
        expect(trigger).toHaveClass('border-success-300')

        rerender(<Select {...defaultProps} tone="danger" />)
        trigger = screen.getByRole('combobox')
        expect(trigger).toHaveClass('border-danger-300')
    })

    it('has no accessibility violations', async () => {
        const { container } = render(<Select {...defaultProps} />)
        const results = await axe(container)
        expect(results).toHaveNoViolations()
    })

    it('has proper ARIA attributes', () => {
        render(<Select {...defaultProps} />)
        const trigger = screen.getByRole('combobox')

        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
        expect(trigger).toHaveAttribute('aria-label', 'Select an option')
    })

    it('updates ARIA attributes when opened', async () => {
        const user = userEvent.setup()
        render(<Select {...defaultProps} />)

        const trigger = screen.getByRole('combobox')
        await user.click(trigger)

        expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })
})

describe('SelectItem Component', () => {
    it('renders with correct props', () => {
        render(
            <SelectItem value="test" isSelected>
                Test Option
            </SelectItem>
        )

        const item = screen.getByRole('option')
        expect(item).toHaveAttribute('data-value', 'test')
        expect(item).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByText('Test Option')).toBeInTheDocument()
    })

    it('calls onSelect when clicked', async () => {
        const user = userEvent.setup()
        const onSelect = jest.fn()

        render(
            <SelectItem value="test" onSelect={onSelect}>
                Test Option
            </SelectItem>
        )

        const item = screen.getByRole('option')
        await user.click(item)

        expect(onSelect).toHaveBeenCalled()
    })

    it('handles keyboard events', async () => {
        const user = userEvent.setup()
        const onKeyDown = jest.fn()

        render(
            <SelectItem value="test" onKeyDown={onKeyDown}>
                Test Option
            </SelectItem>
        )

        const item = screen.getByRole('option')
        item.focus()
        await user.keyboard('{Enter}')

        expect(onKeyDown).toHaveBeenCalled()
    })
})

describe('SelectContent Component', () => {
    it('renders with correct role', () => {
        render(
            <SelectContent>
                <SelectItem value="test">Test Option</SelectItem>
            </SelectContent>
        )

        expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('applies size variants', () => {
        const { rerender } = render(
            <SelectContent size="sm">
                <SelectItem value="test">Test Option</SelectItem>
            </SelectContent>
        )

        let content = screen.getByRole('listbox')
        expect(content).toHaveClass('text-xs')

        rerender(
            <SelectContent size="lg">
                <SelectItem value="test">Test Option</SelectItem>
            </SelectContent>
        )

        content = screen.getByRole('listbox')
        expect(content).toHaveClass('text-base')
    })
})
