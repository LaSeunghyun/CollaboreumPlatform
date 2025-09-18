import React from "react";
import { Button, ButtonProps } from "./Button";
import { cn } from "../lib/cn";
import { forwardRef } from "react";

export interface IconButtonProps extends Omit<ButtonProps, 'size' | 'children'> {
    icon: React.ReactNode;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'solid' | 'outline' | 'ghost' | 'link' | 'indigo' | 'gradient' | 'glass';
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ icon, label, size = 'md', variant = 'ghost', className, ...props }, ref) => {
        const getSizeStyles = () => {
            switch (size) {
                case 'sm':
                    return 'size-8 rounded-xl';
                case 'md':
                    return 'size-10 rounded-2xl';
                case 'lg':
                    return 'size-12 rounded-2xl';
                default:
                    return 'size-10 rounded-2xl';
            }
        };

        return (
            <Button
                ref={ref}
                variant={variant}
                size="icon"
                className={cn(getSizeStyles(), className)}
                aria-label={label}
                {...props}
            >
                {icon}
            </Button>
        );
    }
);

IconButton.displayName = "IconButton";

export { IconButton };
