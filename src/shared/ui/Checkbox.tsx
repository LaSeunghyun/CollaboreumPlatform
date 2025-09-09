import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"
import { forwardRef } from "react"
import { Check } from "lucide-react"

const checkboxStyles = cva(
    "peer h-4 w-4 shrink-0 rounded-sm border border-neutral-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary-600 data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary-600",
    {
        variants: {
            size: {
                sm: "h-3 w-3",
                md: "h-4 w-4",
                lg: "h-5 w-5",
            },
            tone: {
                default: "data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600",
                success: "data-[state=checked]:bg-success-600 data-[state=checked]:border-success-600",
                warning: "data-[state=checked]:bg-warning-600 data-[state=checked]:border-warning-600",
                danger: "data-[state=checked]:bg-danger-600 data-[state=checked]:border-danger-600",
            },
        },
        defaultVariants: {
            size: "md",
            tone: "default",
        },
    }
)

const checkboxIconStyles = cva(
    "h-3 w-3",
    {
        variants: {
            size: {
                sm: "h-2 w-2",
                md: "h-3 w-3",
                lg: "h-4 w-4",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
)

export interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxStyles> {
    label?: string
    description?: string
    error?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, size, tone, label, description, error, id, ...props }, ref) => {
        const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
        const hasError = !!error

        return (
            <div className="flex items-start space-x-2">
                <div className="relative">
                    <input
                        ref={ref}
                        type="checkbox"
                        id={checkboxId}
                        className="sr-only"
                        {...props}
                    />
                    <label
                        htmlFor={checkboxId}
                        className={cn(
                            checkboxStyles({ size, tone }),
                            hasError && "border-danger-300 focus-visible:ring-danger-300",
                            className
                        )}
                        data-state={props.checked ? "checked" : "unchecked"}
                    >
                        {props.checked && (
                            <Check className={cn(checkboxIconStyles({ size }), "text-white")} />
                        )}
                    </label>
                </div>
                {(label || description || error) && (
                    <div className="flex-1 space-y-1">
                        {label && (
                            <label
                                htmlFor={checkboxId}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {label}
                            </label>
                        )}
                        {description && (
                            <p className="text-xs text-neutral-500">{description}</p>
                        )}
                        {error && (
                            <p className="text-xs text-danger-600" role="alert">
                                {error}
                            </p>
                        )}
                    </div>
                )}
            </div>
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox, checkboxStyles }