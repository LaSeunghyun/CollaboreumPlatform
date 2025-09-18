import React from "react";
import { Button, ButtonProps } from "./Button";
import { cn } from "../lib/cn";
import { forwardRef } from "react";

export interface ActionButtonProps extends Omit<ButtonProps, 'variant'> {
    action?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
    variant?: 'solid' | 'outline' | 'ghost' | 'link';
}

const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
    ({ action = 'primary', variant = 'solid', className, ...props }, ref) => {
        const getActionStyles = () => {
            switch (action) {
                case 'primary':
                    return variant === 'solid'
                        ? 'bg-indigo text-white hover:bg-indigo/90'
                        : 'border-indigo text-indigo hover:bg-indigo/10';
                case 'secondary':
                    return variant === 'solid'
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50';
                case 'success':
                    return variant === 'solid'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'border-green-300 text-green-700 hover:bg-green-50';
                case 'warning':
                    return variant === 'solid'
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'border-yellow-300 text-yellow-700 hover:bg-yellow-50';
                case 'danger':
                    return variant === 'solid'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'border-red-300 text-red-700 hover:bg-red-50';
                case 'info':
                    return variant === 'solid'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'border-blue-300 text-blue-700 hover:bg-blue-50';
                default:
                    return '';
            }
        };

        return (
            <Button
                ref={ref}
                variant={variant}
                className={cn(getActionStyles(), className)}
                {...props}
            />
        );
    }
);

ActionButton.displayName = "ActionButton";

export { ActionButton };
