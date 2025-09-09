import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"
import { forwardRef } from "react"
import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { useSelect } from "./hooks/useSelect"

const selectStyles = cva(
    "flex w-full items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            size: {
                sm: "h-8 px-2 text-xs",
                md: "h-10 px-3 text-sm",
                lg: "h-12 px-4 text-base",
            },
            tone: {
                default: "",
                success: "border-success-300 focus:ring-success-300 focus:border-success-500",
                warning: "border-warning-300 focus:ring-warning-300 focus:border-warning-500",
                danger: "border-danger-300 focus:ring-danger-300 focus:border-danger-500",
            },
        },
        defaultVariants: {
            size: "md",
            tone: "default",
        },
    }
)

const selectContentStyles = cva(
    "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-neutral-200 bg-white shadow-md",
    {
        variants: {
            size: {
                sm: "text-xs",
                md: "text-sm",
                lg: "text-base",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
)

const selectItemStyles = cva(
    "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-neutral-100 focus:text-neutral-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    {
        variants: {
            size: {
                sm: "px-1.5 py-1 text-xs",
                md: "px-2 py-1.5 text-sm",
                lg: "px-3 py-2 text-base",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
)

export interface SelectProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof selectStyles> {
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    disabled?: boolean
    children: React.ReactNode
    'aria-label'?: string
    'aria-describedby'?: string
}

export interface SelectContentProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof selectContentStyles> {
    children: React.ReactNode
}

export interface SelectItemProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick' | 'onKeyDown'>,
    VariantProps<typeof selectItemStyles> {
    value: string
    children: React.ReactNode
    onSelect?: () => void
    onKeyDown?: (event: React.KeyboardEvent) => void
    isSelected?: boolean
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
    ({ className, size, tone, value, onValueChange, placeholder, disabled, children, ...props }, ref) => {
        const {
            open,
            setOpen,
            selectedItem,
            triggerRef,
            contentRef,
            handleKeyDown,
            renderedChildren
        } = useSelect({
            value,
            onValueChange,
            children,
            disabled
        })

        return (
            <div className="relative" ref={ref}>
                <div
                    ref={triggerRef}
                    className={cn(selectStyles({ size, tone }), className)}
                    onClick={() => !disabled && setOpen(!open)}
                    onKeyDown={handleKeyDown}
                    tabIndex={disabled ? -1 : 0}
                    role="combobox"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    aria-label={placeholder || "Select an option"}
                    aria-describedby={selectedItem ? undefined : `${props.id}-description`}
                    {...props}
                >
                    <span className={selectedItem ? "text-neutral-900" : "text-neutral-500"}>
                        {selectedItem ? selectedItem.label : placeholder}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </div>
                {open && (
                    <SelectContent
                        ref={contentRef}
                        size={size}
                        className="mt-1"
                    >
                        {renderedChildren}
                    </SelectContent>
                )}
            </div>
        )
    }
)
Select.displayName = "Select"

const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
    ({ className, size, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(selectContentStyles({ size }), className)}
            role="listbox"
            {...props}
        >
            {children}
        </div>
    )
)
SelectContent.displayName = "SelectContent"

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
    ({ className, size, value, children, onSelect, isSelected, onKeyDown, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(selectItemStyles({ size }), className)}
                onClick={onSelect}
                onKeyDown={onKeyDown}
                role="option"
                aria-selected={isSelected || false}
                data-value={value}
                tabIndex={-1}
                {...props}
            >
                <span className="flex-1">{children}</span>
                {isSelected && <Check className="h-4 w-4" />}
            </div>
        )
    }
)
SelectItem.displayName = "SelectItem"

export { Select, SelectContent, SelectItem, selectStyles }