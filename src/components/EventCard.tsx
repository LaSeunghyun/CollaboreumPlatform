import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface EventCardProps {
    id: string;
    title: string;
    type: "campaign" | "collaboration" | "promotion";
    image: string;
    description: string;
    startDate: string;
    endDate?: string;
    location?: string;
    participants?: number;
    maxParticipants?: number;
    status: "upcoming" | "ongoing" | "ended";
    onClick?: () => void;
}

export function EventCard({
    title,
    type,
    image,
    description,
    startDate,
    endDate,
    location,
    participants,
    maxParticipants,
    status,
    onClick
}: EventCardProps) {
    const getTypeLabel = () => {
        switch (type) {
            case "campaign": return "특별 캠페인";
            case "collaboration": return "콜라보 이벤트";
            case "promotion": return "프로모션";
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case "upcoming": return "bg-blue-100 text-blue-700";
            case "ongoing": return "bg-green-100 text-green-700";
            case "ended": return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusLabel = () => {
        switch (status) {
            case "upcoming": return "진행 예정";
            case "ongoing": return "진행 중";
            case "ended": return "종료";
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={onClick}>
            <div className="aspect-[16/9] overflow-hidden relative">
                <ImageWithFallback
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                    <Badge className={getStatusColor()}>
                        {getStatusLabel()}
                    </Badge>
                </div>
            </div>

            <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                    <Badge variant="secondary" className="bg-sky/10 text-sky">
                        {getTypeLabel()}
                    </Badge>
                    <h3 className="line-clamp-2">{title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                            {formatDate(startDate)}
                            {endDate && ` - ${formatDate(endDate)}`}
                        </span>
                    </div>

                    {location && (
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{location}</span>
                        </div>
                    )}

                    {participants !== undefined && (
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>
                                {participants}명 참여
                                {maxParticipants && ` / ${maxParticipants}명`}
                            </span>
                        </div>
                    )}
                </div>

                {status === "ongoing" && (
                    <Button className="w-full bg-sky hover:bg-sky/90">
                        참여하기
                    </Button>
                )}

                {status === "upcoming" && (
                    <Button variant="outline" className="w-full">
                        <Clock className="w-4 h-4 mr-2" />
                        알림 받기
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
