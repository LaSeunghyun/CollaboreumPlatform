import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"
import { forwardRef } from "react"

const cardStyles = cva(
    "bg-card text-card-foreground flex flex-col gap-6 rounded-3xl border border-border/50 shadow-apple",
    {
        variants: {
            variant: {
                default: "border-border/50 bg-card",
                outlined: "border-border bg-transparent",
                filled: "border-transparent bg-secondary/50",
                elevated: "border-border/50 bg-card shadow-apple-lg",
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
    "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
    {
        variants: {
            size: {
                sm: "px-3 pt-3 pb-2",
                md: "px-6 pt-6 pb-3",
                lg: "px-6 pt-6 pb-4",
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
    "px-6 [&:last-child]:pb-6",
    {
        variants: {
            size: {
                sm: "px-3 pt-0 text-xs",
                md: "px-6 pt-0 text-sm",
                lg: "px-6 pt-0 text-base",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
)

const cardFooterStyles = cva(
    "flex items-center px-6 pb-6 [.border-t]:pt-6",
    {
        variants: {
            size: {
                sm: "px-3 pt-0",
                md: "px-6 pt-0",
                lg: "px-6 pt-0",
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

export interface CardActionProps
    extends React.HTMLAttributes<HTMLDivElement> { }

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

const CardAction = forwardRef<HTMLDivElement, CardActionProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            data-slot="card-action"
            className={cn(
                "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
                className
            )}
            {...props}
        />
    )
)
CardAction.displayName = "CardAction"

export {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent,
    CardFooter,
    cardStyles,
}