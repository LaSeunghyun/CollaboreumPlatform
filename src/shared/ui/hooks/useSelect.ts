import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import * as React from "react"
// import { SelectItemProps } from "../Select"

export interface UseSelectProps {
    value?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
    disabled?: boolean
}

export interface UseSelectReturn {
    open: boolean
    setOpen: (open: boolean) => void
    selectedItem: { value: string; label: string } | null
    triggerRef: React.RefObject<HTMLDivElement>
    contentRef: React.RefObject<HTMLDivElement>
    handleValueChange: (newValue: string) => void
    handleKeyDown: (event: React.KeyboardEvent) => void
    handleItemKeyDown: (event: React.KeyboardEvent, currentValue: string) => void
    renderedChildren: React.ReactNode
}

export const useSelect = ({
    value,
    onValueChange,
    children,
    disabled = false
}: UseSelectProps): UseSelectReturn => {
    const [open, setOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<{ value: string; label: string } | null>(null)
    const triggerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    // Find selected item
    useEffect(() => {
        if (value) {
            const item = React.Children.toArray(children).find(
                (child) => React.isValidElement(child) && child.props.value === value
            ) as React.ReactElement<any>
            if (item) {
                setSelectedItem({
                    value: item.props.value,
                    label: item.props.children as string
                })
            }
        } else {
            setSelectedItem(null)
        }
    }, [value, children])

    const handleValueChange = useCallback((newValue: string) => {
        const item = React.Children.toArray(children).find(
            (child) => React.isValidElement(child) && child.props.value === newValue
        ) as React.ReactElement<any>

        if (item) {
            setSelectedItem({
                value: item.props.value,
                label: item.props.children as string
            })
        }

        onValueChange?.(newValue)
        setOpen(false)
    }, [children, onValueChange])

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                contentRef.current &&
                !contentRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setOpen(false)
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside)
            return () => document.removeEventListener("mousedown", handleClickOutside)
        }
        return undefined;
    }, [open])

    // Handle keyboard navigation
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            setOpen(!open)
        } else if (event.key === "Escape") {
            setOpen(false)
        } else if (event.key === "ArrowDown") {
            event.preventDefault()
            if (!open) {
                setOpen(true)
            } else {
                // Focus first item
                const firstItem = contentRef.current?.querySelector('[role="option"]') as HTMLElement
                firstItem?.focus()
            }
        } else if (event.key === "ArrowUp") {
            event.preventDefault()
            if (!open) {
                setOpen(true)
            } else {
                // Focus last item
                const items = contentRef.current?.querySelectorAll('[role="option"]')
                const lastItem = items?.[items.length - 1] as HTMLElement
                lastItem?.focus()
            }
        }
    }, [open])

    // Handle item keyboard navigation
    const handleItemKeyDown = useCallback((event: React.KeyboardEvent, currentValue: string) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            handleValueChange(currentValue)
        } else if (event.key === "Escape") {
            setOpen(false)
            triggerRef.current?.focus()
        } else if (event.key === "ArrowDown") {
            event.preventDefault()
            const currentItem = event.currentTarget as HTMLElement
            const nextItem = currentItem.nextElementSibling as HTMLElement
            if (nextItem) {
                nextItem.focus()
            } else {
                // Wrap to first item
                const firstItem = contentRef.current?.querySelector('[role="option"]') as HTMLElement
                firstItem?.focus()
            }
        } else if (event.key === "ArrowUp") {
            event.preventDefault()
            const currentItem = event.currentTarget as HTMLElement
            const prevItem = currentItem.previousElementSibling as HTMLElement
            if (prevItem) {
                prevItem.focus()
            } else {
                // Wrap to last item
                const items = contentRef.current?.querySelectorAll('[role="option"]')
                const lastItem = items?.[items.length - 1] as HTMLElement
                lastItem?.focus()
            }
        }
    }, [handleValueChange])

    // Memoize rendered children to prevent unnecessary re-renders
    const renderedChildren = useMemo(() => {
        return React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                    ...child.props,
                    onSelect: () => handleValueChange(child.props.value),
                    onKeyDown: (event: React.KeyboardEvent) => handleItemKeyDown(event, child.props.value),
                    isSelected: selectedItem?.value === child.props.value,
                })
            }
            return child
        })
    }, [children, handleValueChange, handleItemKeyDown, selectedItem?.value])

    return {
        open,
        setOpen,
        selectedItem,
        triggerRef,
        contentRef,
        handleValueChange,
        handleKeyDown,
        handleItemKeyDown,
        renderedChildren
    }
}
