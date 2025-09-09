import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/cn"
import { forwardRef } from "react"
import { Plus, Search, FileText, Users, Calendar } from "lucide-react"
import { Button } from "./Button"

const emptyStateStyles = cva(
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

const emptyIconStyles = cva(
    "text-neutral-400",
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

const emptyTitleStyles = cva(
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

const emptyDescriptionStyles = cva(
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

export interface EmptyStateProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateStyles> {
    title: string
    description?: string
    icon?: React.ReactNode
    action?: {
        label: string
        onClick: () => void
    }
    secondaryAction?: {
        label: string
        onClick: () => void
    }
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
    ({
        className,
        size,
        variant,
        title,
        description,
        icon,
        action,
        secondaryAction,
        ...props
    }, ref) => {
        const defaultIcon = <FileText className={cn(emptyIconStyles({ size }))} />

        return (
            <div
                ref={ref}
                className={cn(emptyStateStyles({ size, variant }), className)}
                {...props}
            >
                {icon || defaultIcon}
                <div className="space-y-2">
                    <h3 className={cn(emptyTitleStyles({ size }))}>
                        {title}
                    </h3>
                    {description && (
                        <p className={cn(emptyDescriptionStyles({ size }))}>
                            {description}
                        </p>
                    )}
                </div>
                {(action || secondaryAction) && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        {action && (
                            <Button
                                onClick={action.onClick}
                                size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                {action.label}
                            </Button>
                        )}
                        {secondaryAction && (
                            <Button
                                onClick={secondaryAction.onClick}
                                variant="outline"
                                size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"}
                            >
                                {secondaryAction.label}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        )
    }
)
EmptyState.displayName = "EmptyState"

// 특화된 빈 상태 컴포넌트들
export function EmptyProjects({ onCreateProject }: { onCreateProject?: () => void }) {
    return (
        <EmptyState
            title="프로젝트가 없습니다"
            description="새로운 프로젝트를 생성하여 시작해보세요."
            icon={<FileText className="h-12 w-12 text-neutral-400" />}
            action={onCreateProject ? {
                label: "프로젝트 생성",
                onClick: onCreateProject
            } : undefined}
        />
    )
}

export function EmptyArtists({ onInviteArtist }: { onInviteArtist?: () => void }) {
    return (
        <EmptyState
            title="아티스트가 없습니다"
            description="아티스트를 초대하여 협업을 시작해보세요."
            icon={<Users className="h-12 w-12 text-neutral-400" />}
            action={onInviteArtist ? {
                label: "아티스트 초대",
                onClick: onInviteArtist
            } : undefined}
        />
    )
}

export function EmptyEvents({ onCreateEvent }: { onCreateEvent?: () => void }) {
    return (
        <EmptyState
            title="이벤트가 없습니다"
            description="새로운 이벤트를 생성하여 커뮤니티를 활성화해보세요."
            icon={<Calendar className="h-12 w-12 text-neutral-400" />}
            action={onCreateEvent ? {
                label: "이벤트 생성",
                onClick: onCreateEvent
            } : undefined}
        />
    )
}

export function EmptySearch({ query, onClearSearch }: { query: string; onClearSearch?: () => void }) {
    return (
        <EmptyState
            title={`"${query}"에 대한 검색 결과가 없습니다`}
            description="다른 키워드로 검색해보세요."
            icon={<Search className="h-12 w-12 text-neutral-400" />}
            secondaryAction={onClearSearch ? {
                label: "검색 초기화",
                onClick: onClearSearch
            } : undefined}
        />
    )
}

export { EmptyState, emptyStateStyles }
