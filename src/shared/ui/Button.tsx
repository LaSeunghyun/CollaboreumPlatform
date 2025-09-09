import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"
import { forwardRef } from "react"

const buttonStyles = cva(
    "inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
    {
        variants: {
            variant: {
                solid: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-300",
                outline: "border border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-50 focus:ring-primary-300",
                ghost: "bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-primary-300",
                link: "bg-transparent text-primary-600 underline-offset-4 hover:underline focus:ring-primary-300",
            },
            size: {
                sm: "h-8 px-3 text-sm",
                md: "h-10 px-4 text-sm",
                lg: "h-12 px-6 text-base",
                icon: "h-10 w-10",
            },
            tone: {
                default: "",
                success: "bg-success-600 text-white hover:bg-success-700 focus:ring-success-300",
                warning: "bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-300",
                danger: "bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-300",
            },
        },
        compoundVariants: [
            // tone이 설정된 경우 variant를 무시하고 tone 색상 사용
            {
                tone: "success",
                variant: "solid",
                class: "bg-success-600 text-white hover:bg-success-700 focus:ring-success-300",
            },
            {
                tone: "success",
                variant: "outline",
                class: "border-success-300 text-success-700 hover:bg-success-50 focus:ring-success-300",
            },
            {
                tone: "success",
                variant: "ghost",
                class: "text-success-700 hover:bg-success-100 focus:ring-success-300",
            },
            {
                tone: "warning",
                variant: "solid",
                class: "bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-300",
            },
            {
                tone: "warning",
                variant: "outline",
                class: "border-warning-300 text-warning-700 hover:bg-warning-50 focus:ring-warning-300",
            },
            {
                tone: "warning",
                variant: "ghost",
                class: "text-warning-700 hover:bg-warning-100 focus:ring-warning-300",
            },
            {
                tone: "danger",
                variant: "solid",
                class: "bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-300",
            },
            {
                tone: "danger",
                variant: "outline",
                class: "border-danger-300 text-danger-700 hover:bg-danger-50 focus:ring-danger-300",
            },
            {
                tone: "danger",
                variant: "ghost",
                class: "text-danger-700 hover:bg-danger-100 focus:ring-danger-300",
            },
        ],
        defaultVariants: {
            variant: "solid",
            size: "md",
            tone: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
    asChild?: boolean
    loading?: boolean
    'aria-label'?: string
    'aria-describedby'?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, tone, asChild = false, loading = false, ...props }, ref) => {
        const Comp = asChild ? "span" : "button"

        return (
            <Comp
                className={cn(buttonStyles({ variant, size, tone }), className)}
                ref={ref}
                type={asChild ? undefined : "button"}
                disabled={loading || props.disabled}
                aria-busy={loading}
                aria-disabled={loading || props.disabled}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonStyles }
