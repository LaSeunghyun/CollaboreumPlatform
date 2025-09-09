import { ReactNode } from 'react'
import { isFeatureEnabled } from '../features/flags'
import { EmptyState } from '../ui/EmptyState'
import { Construction } from 'lucide-react'

interface FeatureRouteProps {
    feature: string
    children: ReactNode
    fallback?: ReactNode
    redirectTo?: string
}

export function FeatureRoute({
    feature,
    children,
    fallback,
    redirectTo = '/coming-soon'
}: FeatureRouteProps) {
    const isEnabled = isFeatureEnabled(feature)

    if (!isEnabled) {
        if (fallback) {
            return <>{fallback}</>
        }

        // 기본 Coming Soon 페이지
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <EmptyState
                    title="곧 출시될 기능입니다"
                    description="이 기능은 현재 개발 중입니다. 곧 만나보실 수 있습니다."
                    icon={<Construction className="h-16 w-16 text-neutral-400" />}
                    size="lg"
                />
            </div>
        )
    }

    return <>{children}</>
}

// 특화된 Feature Route 컴포넌트들
export function CommunityBoardRoute({ children }: { children: ReactNode }) {
    return (
        <FeatureRoute feature="community.board">
            {children}
        </FeatureRoute>
    )
}

export function FundingPaymentsRoute({ children }: { children: ReactNode }) {
    return (
        <FeatureRoute feature="funding.payments">
            {children}
        </FeatureRoute>
    )
}

export function EventsLiveStreamingRoute({ children }: { children: ReactNode }) {
    return (
        <FeatureRoute feature="events.liveStreaming">
            {children}
        </FeatureRoute>
    )
}

export function ArtistsCollaborationRoute({ children }: { children: ReactNode }) {
    return (
        <FeatureRoute feature="artists.collaboration">
            {children}
        </FeatureRoute>
    )
}
