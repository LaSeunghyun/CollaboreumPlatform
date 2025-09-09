import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"
import { forwardRef } from "react"

const textareaStyles = cva(
    "flex min-h-[80px] w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            size: {
                sm: "min-h-[60px] px-2 py-1.5 text-xs",
                md: "min-h-[80px] px-3 py-2 text-sm",
                lg: "min-h-[100px] px-4 py-3 text-base",
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

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaStyles> { }

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, size, tone, ...props }, ref) => {
        return (
            <textarea
                className={cn(textareaStyles({ size, tone }), className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaStyles }