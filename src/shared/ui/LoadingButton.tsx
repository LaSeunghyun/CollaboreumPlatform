import { forwardRef } from 'react'
import { Button, ButtonProps } from './Button'
import { Loader2 } from 'lucide-react'

interface LoadingButtonProps extends ButtonProps {
    isLoading?: boolean
    loadingText?: string
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
    ({
        isLoading = false,
        loadingText,
        children,
        disabled,
        ...props
    }, ref) => {
        return (
            <Button
                ref={ref}
                disabled={disabled || isLoading}
                aria-busy={isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {loadingText || '처리 중...'}
                    </>
                ) : (
                    children
                )}
            </Button>
        )
    }
)
LoadingButton.displayName = 'LoadingButton'

export { LoadingButton }
