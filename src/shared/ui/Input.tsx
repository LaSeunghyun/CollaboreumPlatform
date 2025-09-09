import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"
import { forwardRef } from "react"

const inputStyles = cva(
    "flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
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

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputStyles> { }

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, size, tone, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(inputStyles({ size, tone }), className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input, inputStyles }
