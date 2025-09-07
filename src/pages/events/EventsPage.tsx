import React, { useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Calendar } from 'lucide-react';
import { EventCard } from '../../components/molecules/EventCard';
import { useEvents } from '../../lib/api/useEvents';
import { LoadingState, ErrorState, EmptyEventsState, SkeletonGrid } from '../../components/organisms/States';

export const EventsPage: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState("ongoing");

    // API 훅
    const { data: events, isLoading, error } = useEvents({
        status: activeFilter,
        sortBy: 'startDate',
        order: 'asc',
    });

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
    };

    const renderEvents = () => {
        if (isLoading) {
            return <SkeletonGrid count={6} cols={3} />;
        }

        if (error) {
            return (
                <ErrorState
                    title="이벤트 정보를 불러올 수 없습니다"
                    description="잠시 후 다시 시도해주세요."
                />
            );
        }

        if (!events?.data?.events || events.data.events.length === 0) {
            return (
                <EmptyEventsState
                    action={{
                        label: "전체 이벤트 보기",
                        onClick: () => setActiveFilter("all")
                    }}
                />
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.data.events.map((event: any) => (
                    <EventCard key={event.id} {...event} />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">이벤트</h1>
                <p className="text-muted-foreground">특별한 캠페인과 콜라보레이션에 참여하세요</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex gap-2">
                    <Badge
                        variant={activeFilter === "ongoing" ? "default" : "outline"}
                        className={activeFilter === "ongoing" ? "bg-green-100 text-green-700" : ""}
                        onClick={() => handleFilterChange("ongoing")}
                    >
                        <Calendar className="w-3 h-3 mr-1" />
                        진행 중
                    </Badge>
                    <Badge
                        variant={activeFilter === "upcoming" ? "default" : "outline"}
                        className={activeFilter === "upcoming" ? "bg-blue-100 text-blue-700" : ""}
                        onClick={() => handleFilterChange("upcoming")}
                    >
                        예정
                    </Badge>
                    <Badge
                        variant={activeFilter === "ended" ? "default" : "outline"}
                        className={activeFilter === "ended" ? "bg-gray-100 text-gray-700" : ""}
                        onClick={() => handleFilterChange("ended")}
                    >
                        종료
                    </Badge>
                    <Badge
                        variant={activeFilter === "all" ? "default" : "outline"}
                        onClick={() => handleFilterChange("all")}
                    >
                        전체
                    </Badge>
                </div>
            </div>

            {renderEvents()}
        </div>
    );
};
