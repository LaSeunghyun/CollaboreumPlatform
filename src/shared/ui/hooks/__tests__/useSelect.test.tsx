import { renderHook, act } from '@testing-library/react';
import { useSelect } from '../useSelect';
import * as React from 'react';

const mockChildren = (
  <>
    <div value='option1'>Option 1</div>
    <div value='option2'>Option 2</div>
    <div value='option3'>Option 3</div>
  </>
);

describe('useSelect Hook', () => {
  const defaultProps = {
    children: mockChildren,
    onValueChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useSelect(defaultProps));

    expect(result.current.open).toBe(false);
    expect(result.current.selectedItem).toBeNull();
    expect(result.current.triggerRef.current).toBeNull();
    expect(result.current.contentRef.current).toBeNull();
  });

  it('updates selectedItem when value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useSelect({ ...defaultProps, value }),
      { initialProps: { value: undefined } },
    );

    expect(result.current.selectedItem).toBeNull();

    rerender({ value: 'option1' });

    expect(result.current.selectedItem).toEqual({
      value: 'option1',
      label: 'Option 1',
    });
  });

  it('handles value change correctly', () => {
    const onValueChange = jest.fn();
    const { result } = renderHook(() =>
      useSelect({ ...defaultProps, onValueChange }),
    );

    act(() => {
      result.current.handleValueChange('option2');
    });

    expect(result.current.selectedItem).toEqual({
      value: 'option2',
      label: 'Option 2',
    });
    expect(onValueChange).toHaveBeenCalledWith('option2');
    expect(result.current.open).toBe(false);
  });

  it('toggles open state with setOpen', () => {
    const { result } = renderHook(() => useSelect(defaultProps));

    expect(result.current.open).toBe(false);

    act(() => {
      result.current.setOpen(true);
    });

    expect(result.current.open).toBe(true);

    act(() => {
      result.current.setOpen(false);
    });

    expect(result.current.open).toBe(false);
  });

  it('handles keyboard navigation for trigger', () => {
    const { result } = renderHook(() => useSelect(defaultProps));

    const mockEvent = {
      key: 'Enter',
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(result.current.open).toBe(true);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('handles Escape key to close', () => {
    const { result } = renderHook(() => useSelect(defaultProps));

    // First open the select
    act(() => {
      result.current.setOpen(true);
    });

    const mockEvent = {
      key: 'Escape',
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(result.current.open).toBe(false);
  });

  it('handles ArrowDown key to open and focus', () => {
    const { result } = renderHook(() => useSelect(defaultProps));

    const mockEvent = {
      key: 'ArrowDown',
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(result.current.open).toBe(true);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('handles item keyboard navigation', () => {
    const onValueChange = jest.fn();
    const { result } = renderHook(() =>
      useSelect({ ...defaultProps, onValueChange }),
    );

    const mockEvent = {
      key: 'Enter',
      preventDefault: jest.fn(),
      currentTarget: document.createElement('div'),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleItemKeyDown(mockEvent, 'option1');
    });

    expect(onValueChange).toHaveBeenCalledWith('option1');
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('handles Escape key in item to close and focus trigger', () => {
    const { result } = renderHook(() => useSelect(defaultProps));

    // Mock triggerRef
    const mockTrigger = document.createElement('div');
    mockTrigger.focus = jest.fn();
    result.current.triggerRef.current = mockTrigger;

    const mockEvent = {
      key: 'Escape',
      preventDefault: jest.fn(),
      currentTarget: document.createElement('div'),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleItemKeyDown(mockEvent, 'option1');
    });

    expect(result.current.open).toBe(false);
    expect(mockTrigger.focus).toHaveBeenCalled();
  });

  it('renders children correctly', () => {
    const { result } = renderHook(() => useSelect(defaultProps));

    expect(result.current.renderedChildren).toBeDefined();
    expect(Array.isArray(result.current.renderedChildren)).toBe(true);
    expect(result.current.renderedChildren).toHaveLength(3);
  });

  it('memoizes rendered children', () => {
    const { result, rerender } = renderHook(
      ({ children }) => useSelect({ ...defaultProps, children }),
      { initialProps: { children: mockChildren } },
    );

    const firstRender = result.current.renderedChildren;

    // Rerender with same props
    rerender({ children: mockChildren });

    expect(result.current.renderedChildren).toBe(firstRender);
  });

  it('handles disabled state', () => {
    const { result } = renderHook(() =>
      useSelect({ ...defaultProps, disabled: true }),
    );

    // Should still work normally when disabled
    expect(result.current.open).toBe(false);
    expect(result.current.selectedItem).toBeNull();
  });
});
