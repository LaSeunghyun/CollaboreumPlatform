import { Skeleton } from './skeleton';

interface LoadingSkeletonProps {
    type: 'card' | 'list' | 'stats' | 'profile';
    count?: number;
}

export function LoadingSkeleton({ type, count = 1 }: LoadingSkeletonProps) {
    const renderCardSkeleton = () => (
        <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    );

    const renderListSkeleton = () => (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );

    const renderStatsSkeleton = () => (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="space-y-3">
                    <Skeleton className="h-8 w-8 mx-auto rounded" />
                    <Skeleton className="h-8 w-20 mx-auto" />
                    <Skeleton className="h-4 w-16 mx-auto" />
                </div>
            ))}
        </div>
    );

    const renderProfileSkeleton = () => (
        <div className="flex items-center gap-6 mb-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-3 flex-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-16 rounded" />
                </div>
            </div>
        </div>
    );

    switch (type) {
        case 'card':
            return renderCardSkeleton();
        case 'list':
            return renderListSkeleton();
        case 'stats':
            return renderStatsSkeleton();
        case 'profile':
            return renderProfileSkeleton();
        default:
            return <Skeleton className="h-4 w-full" />;
    }
}
