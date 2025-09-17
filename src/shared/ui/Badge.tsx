import React from "react";
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"
import { forwardRef } from "react"

const badgeStyles = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary-600 text-white hover:bg-primary-700",
                secondary: "border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
                destructive: "border-transparent bg-danger-600 text-white hover:bg-danger-700",
                outline: "text-neutral-950 border-neutral-200",
            },
            size: {
                sm: "px-2 py-0.5 text-xs",
                md: "px-2.5 py-0.5 text-xs",
                lg: "px-3 py-1 text-sm",
            },
            tone: {
                default: "",
                success: "border-transparent bg-success-600 text-white hover:bg-success-700",
                warning: "border-transparent bg-warning-600 text-white hover:bg-warning-700",
                danger: "border-transparent bg-danger-600 text-white hover:bg-danger-700",
            },
        },
        compoundVariants: [
            {
                variant: "default",
                tone: "success",
                class: "bg-success-600 text-white hover:bg-success-700",
            },
            {
                variant: "default",
                tone: "warning",
                class: "bg-warning-600 text-white hover:bg-warning-700",
            },
            {
                variant: "default",
                tone: "danger",
                class: "bg-danger-600 text-white hover:bg-danger-700",
            },
            {
                variant: "outline",
                tone: "success",
                class: "border-success-300 text-success-700",
            },
            {
                variant: "outline",
                tone: "warning",
                class: "border-warning-300 text-warning-700",
            },
            {
                variant: "outline",
                tone: "danger",
                class: "border-danger-300 text-danger-700",
            },
        ],
        defaultVariants: {
            variant: "default",
            size: "md",
            tone: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeStyles> { }

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant, size, tone, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(badgeStyles({ variant, size, tone }), className)}
                {...props}
            />
        )
    }
)
Badge.displayName = "Badge"

export { Badge, badgeStyles }