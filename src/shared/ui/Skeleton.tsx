import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"
import { forwardRef } from "react"

const skeletonStyles = cva(
    "animate-pulse rounded-md bg-neutral-200",
    {
        variants: {
            variant: {
                default: "bg-neutral-200",
                card: "bg-neutral-100",
                text: "bg-neutral-200",
                avatar: "rounded-full bg-neutral-200",
            },
            size: {
                sm: "h-4",
                md: "h-6",
                lg: "h-8",
                xl: "h-12",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
)

export interface SkeletonProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonStyles> { }

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(skeletonStyles({ variant, size }), className)}
                {...props}
            />
        )
    }
)
Skeleton.displayName = "Skeleton"

export { Skeleton, skeletonStyles }
