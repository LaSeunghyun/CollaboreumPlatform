import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"
import { forwardRef } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "./Button"

const errorMessageStyles = cva(
    "flex flex-col items-center justify-center space-y-4 p-6 text-center",
    {
        variants: {
            size: {
                sm: "p-4",
                md: "p-6",
                lg: "p-8",
            },
            variant: {
                default: "bg-white",
                card: "bg-white rounded-lg border border-neutral-200 shadow-sm",
                inline: "bg-transparent p-0",
            },
        },
        defaultVariants: {
            size: "md",
            variant: "default",
        },
    }
)

const errorIconStyles = cva(
    "text-danger-600",
    {
        variants: {
            size: {
                sm: "h-8 w-8",
                md: "h-12 w-12",
                lg: "h-16 w-16",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
)

const errorTitleStyles = cva(
    "font-semibold text-neutral-900",
    {
        variants: {
            size: {
                sm: "text-sm",
                md: "text-base",
                lg: "text-lg",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
)

const errorDescriptionStyles = cva(
    "text-neutral-600",
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

export interface ErrorMessageProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof errorMessageStyles> {
    error: string | Error
    title?: string
    onRetry?: () => void
    retryLabel?: string
    showIcon?: boolean
}

const ErrorMessage = forwardRef<HTMLDivElement, ErrorMessageProps>(
    ({
        className,
        size,
        variant,
        error,
        title = "오류가 발생했습니다",
        onRetry,
        retryLabel = "다시 시도",
        showIcon = true,
        ...props
    }, ref) => {
        const errorMessage = error instanceof Error ? error.message : error

        return (
            <div
                ref={ref}
                className={cn(errorMessageStyles({ size, variant }), className)}
                role="alert"
                aria-live="polite"
                {...props}
            >
                {showIcon && (
                    <AlertCircle className={cn(errorIconStyles({ size }))} />
                )}
                <div className="space-y-2">
                    <h3 className={cn(errorTitleStyles({ size }))}>
                        {title}
                    </h3>
                    <p className={cn(errorDescriptionStyles({ size }))}>
                        {errorMessage}
                    </p>
                </div>
                {onRetry && (
                    <Button
                        onClick={onRetry}
                        variant="outline"
                        size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"}
                        className="mt-4"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {retryLabel}
                    </Button>
                )}
            </div>
        )
    }
)
ErrorMessage.displayName = "ErrorMessage"

export { ErrorMessage, errorMessageStyles }
