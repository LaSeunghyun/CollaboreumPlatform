import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"
import { forwardRef } from "react"

const cardStyles = cva(
    "rounded-lg border border-neutral-200 bg-white text-neutral-950 shadow-sm",
    {
        variants: {
            variant: {
                default: "border-neutral-200 bg-white",
                outlined: "border-neutral-300 bg-transparent",
                filled: "border-transparent bg-neutral-50",
                elevated: "border-neutral-200 bg-white shadow-md",
            },
            size: {
                sm: "p-3",
                md: "p-4",
                lg: "p-6",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
)

const cardHeaderStyles = cva(
    "flex flex-col space-y-1.5",
    {
        variants: {
            size: {
                sm: "p-3 pb-2",
                md: "p-4 pb-3",
                lg: "p-6 pb-4",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
)

const cardTitleStyles = cva(
    "text-lg font-semibold leading-none tracking-tight",
    {
        variants: {
            size: {
                sm: "text-base",
                md: "text-lg",
                lg: "text-xl",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
)

const cardDescriptionStyles = cva(
    "text-sm text-neutral-500",
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

const cardContentStyles = cva(
    "text-sm text-neutral-950",
    {
        variants: {
            size: {
                sm: "p-3 pt-0 text-xs",
                md: "p-4 pt-0 text-sm",
                lg: "p-6 pt-0 text-base",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
)

const cardFooterStyles = cva(
    "flex items-center",
    {
        variants: {
            size: {
                sm: "p-3 pt-0",
                md: "p-4 pt-0",
                lg: "p-6 pt-0",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
)

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardStyles> { }

export interface CardHeaderProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderStyles> { }

export interface CardTitleProps
    extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof cardTitleStyles> { }

export interface CardDescriptionProps
    extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof cardDescriptionStyles> { }

export interface CardContentProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentStyles> { }

export interface CardFooterProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterStyles> { }

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, size, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(cardStyles({ variant, size }), className)}
            {...props}
        />
    )
)
Card.displayName = "Card"

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, size, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(cardHeaderStyles({ size }), className)}
            {...props}
        />
    )
)
CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef<HTMLParagraphElement, CardTitleProps>(
    ({ className, size, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn(cardTitleStyles({ size }), className)}
            {...props}
        />
    )
)
CardTitle.displayName = "CardTitle"

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
    ({ className, size, ...props }, ref) => (
        <p
            ref={ref}
            className={cn(cardDescriptionStyles({ size }), className)}
            {...props}
        />
    )
)
CardDescription.displayName = "CardDescription"

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
    ({ className, size, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(cardContentStyles({ size }), className)}
            {...props}
        />
    )
)
CardContent.displayName = "CardContent"

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className, size, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(cardFooterStyles({ size }), className)}
            {...props}
        />
    )
)
CardFooter.displayName = "CardFooter"

export {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    cardStyles,
}