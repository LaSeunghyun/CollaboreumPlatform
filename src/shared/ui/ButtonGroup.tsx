import React from "react";
import { cn } from "../lib/cn";
import { forwardRef } from "react";

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: 'horizontal' | 'vertical';
    spacing?: 'none' | 'sm' | 'md' | 'lg';
    variant?: 'default' | 'attached' | 'separated';
}

const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
    ({
        orientation = 'horizontal',
        spacing = 'sm',
        variant = 'default',
        className,
        children,
        ...props
    }, ref) => {
        const getSpacingStyles = () => {
            switch (spacing) {
                case 'none':
                    return 'gap-0';
                case 'sm':
                    return 'gap-1';
                case 'md':
                    return 'gap-2';
                case 'lg':
                    return 'gap-4';
                default:
                    return 'gap-1';
            }
        };

        const getVariantStyles = () => {
            switch (variant) {
                case 'attached':
                    return '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:border-l-0';
                case 'separated':
                    return 'divide-x divide-border';
                default:
                    return '';
            }
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'flex',
                    orientation === 'vertical' ? 'flex-col' : 'flex-row',
                    getSpacingStyles(),
                    getVariantStyles(),
                    className
                )}
                role="group"
                {...props}
            >
                {children}
            </div>
        );
    }
);

ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup };
