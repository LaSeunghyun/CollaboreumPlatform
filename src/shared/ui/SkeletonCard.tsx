import { Skeleton } from "./Skeleton"
import { Card, CardContent, CardHeader } from "./Card"

interface SkeletonCardProps {
    className?: string
    showImage?: boolean
    showActions?: boolean
    lines?: number
}

export function SkeletonCard({
    className,
    showImage = true,
    showActions = true,
    lines = 3
}: SkeletonCardProps) {
    return (
        <Card className={className}>
            {showImage && (
                <div className="aspect-video w-full">
                    <Skeleton className="h-full w-full" variant="card" />
                </div>
            )}
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-2">
                {Array.from({ length: lines }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className={`h-4 ${i === lines - 1 ? 'w-1/3' : 'w-full'}`}
                    />
                ))}
                {showActions && (
                    <div className="flex space-x-2 pt-4">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// 특화된 스켈레톤 컴포넌트들
export function ProjectListSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    )
}

export function ArtistListSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <Card key={i}>
                    <div className="p-4">
                        <div className="flex items-center space-x-3">
                            <Skeleton className="h-12 w-12" variant="avatar" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export function CommunityPostSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                            <Skeleton className="h-10 w-10" variant="avatar" />
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <div className="flex space-x-4 pt-2">
                                    <Skeleton className="h-6 w-12" />
                                    <Skeleton className="h-6 w-12" />
                                    <Skeleton className="h-6 w-12" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
