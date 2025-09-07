import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import {
    Loader2,
    AlertCircle,
    Search,
    MessageSquare,
    Users,
    Calendar,
    FileText,
    Heart,
    TrendingUp,
    RefreshCw
} from 'lucide-react';

interface StateProps {
    title?: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

// 로딩 상태 컴포넌트
export const LoadingState: React.FC<StateProps> = ({
    title = "로딩 중...",
    description = "데이터를 불러오고 있습니다.",
    className = ""
}) => {
    return (
        <Card className={`border-dashed ${className}`}>
            <CardContent className="flex flex-col items-center justify-center py-12 px-6">
                <Loader2 className="w-8 h-8 animate-spin text-indigo mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground text-center">{description}</p>
            </CardContent>
        </Card>
    );
};

// 에러 상태 컴포넌트
export const ErrorState: React.FC<StateProps> = ({
    title = "오류가 발생했습니다",
    description = "데이터를 불러오는 중 문제가 발생했습니다. 다시 시도해주세요.",
    action,
    className = ""
}) => {
    return (
        <Card className={`border-dashed border-red-200 ${className}`}>
            <CardContent className="flex flex-col items-center justify-center py-12 px-6">
                <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground text-center mb-6">{description}</p>
                {action && (
                    <Button
                        variant="outline"
                        onClick={action.onClick}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        {action.label}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

// 빈 상태 컴포넌트 (범용)
export const EmptyState: React.FC<StateProps & { icon?: React.ReactNode }> = ({
    title = "데이터가 없습니다",
    description = "표시할 데이터가 없습니다.",
    action,
    icon,
    className = ""
}) => {
    return (
        <Card className={`border-dashed ${className}`}>
            <CardContent className="flex flex-col items-center justify-center py-12 px-6">
                {icon || <Search className="w-8 h-8 text-muted-foreground mb-4" />}
                <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground text-center mb-6">{description}</p>
                {action && (
                    <Button
                        onClick={action.onClick}
                        className="bg-indigo hover:bg-indigo-hover"
                    >
                        {action.label}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

// 프로젝트 빈 상태
export const EmptyProjectsState: React.FC<StateProps> = ({ action, className = "" }) => {
    return (
        <EmptyState
            title="진행 중인 프로젝트가 없습니다"
            description="새로운 프로젝트를 시작하거나 다른 프로젝트를 둘러보세요."
            action={action}
            icon={<TrendingUp className="w-8 h-8 text-muted-foreground mb-4" />}
            className={className}
        />
    );
};

// 아티스트 빈 상태
export const EmptyArtistsState: React.FC<StateProps> = ({ action, className = "" }) => {
    return (
        <EmptyState
            title="아티스트가 없습니다"
            description="검색 조건에 맞는 아티스트를 찾을 수 없습니다."
            action={action}
            icon={<Users className="w-8 h-8 text-muted-foreground mb-4" />}
            className={className}
        />
    );
};

// 커뮤니티 빈 상태
export const EmptyCommunityState: React.FC<StateProps> = ({ action, className = "" }) => {
    return (
        <EmptyState
            title="게시글이 없습니다"
            description="아직 작성된 게시글이 없습니다. 첫 번째 글을 작성해보세요!"
            action={action}
            icon={<MessageSquare className="w-8 h-8 text-muted-foreground mb-4" />}
            className={className}
        />
    );
};

// 이벤트 빈 상태
export const EmptyEventsState: React.FC<StateProps> = ({ action, className = "" }) => {
    return (
        <EmptyState
            title="이벤트가 없습니다"
            description="진행 중이거나 예정된 이벤트가 없습니다."
            action={action}
            icon={<Calendar className="w-8 h-8 text-muted-foreground mb-4" />}
            className={className}
        />
    );
};

// 공지사항 빈 상태
export const EmptyNoticesState: React.FC<StateProps> = ({ action, className = "" }) => {
    return (
        <EmptyState
            title="공지사항이 없습니다"
            description="등록된 공지사항이 없습니다."
            action={action}
            icon={<FileText className="w-8 h-8 text-muted-foreground mb-4" />}
            className={className}
        />
    );
};

// 검색 결과 빈 상태
export const EmptySearchState: React.FC<StateProps> = ({ action, className = "" }) => {
    return (
        <EmptyState
            title="검색 결과가 없습니다"
            description="검색 조건에 맞는 결과를 찾을 수 없습니다. 다른 키워드로 시도해보세요."
            action={action}
            icon={<Search className="w-8 h-8 text-muted-foreground mb-4" />}
            className={className}
        />
    );
};

// 좋아요/팔로우 빈 상태
export const EmptyLikesState: React.FC<StateProps> = ({ action, className = "" }) => {
    return (
        <EmptyState
            title="좋아요한 항목이 없습니다"
            description="마음에 드는 프로젝트나 아티스트에 좋아요를 눌러보세요."
            action={action}
            icon={<Heart className="w-8 h-8 text-muted-foreground mb-4" />}
            className={className}
        />
    );
};

// 스켈레톤 로딩 컴포넌트
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = "" }) => {
    return (
        <Card className={`animate-pulse ${className}`}>
            <div className="aspect-video bg-muted rounded-t-lg" />
            <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-2 bg-muted rounded w-full" />
                <div className="h-2 bg-muted rounded w-2/3" />
            </CardContent>
        </Card>
    );
};

// 스켈레톤 리스트 컴포넌트
export const SkeletonList: React.FC<{ count?: number; className?: string }> = ({
    count = 3,
    className = ""
}) => {
    return (
        <div className={`space-y-4 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="animate-pulse">
                    <div className="flex items-center space-x-4 p-4">
                        <div className="w-10 h-10 bg-muted rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// 스켈레톤 그리드 컴포넌트
export const SkeletonGrid: React.FC<{
    count?: number;
    className?: string;
    cols?: 1 | 2 | 3 | 4;
}> = ({
    count = 6,
    className = "",
    cols = 3
}) => {
        const gridCols = {
            1: 'grid-cols-1',
            2: 'grid-cols-1 md:grid-cols-2',
            3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
            4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        };

        return (
            <div className={`grid ${gridCols[cols]} gap-6 ${className}`}>
                {Array.from({ length: count }).map((_, index) => (
                    <SkeletonCard key={index} />
                ))}
            </div>
        );
    };
