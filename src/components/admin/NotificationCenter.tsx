import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import {
  Bell,
  AlertTriangle,
  Clock,
  DollarSign,
  Users,
  MessageSquare,
  TrendingUp,
  Shield,
  CheckCircle,
  X
} from "lucide-react";

interface AdminNotification {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  category: 'funding' | 'user_management' | 'reports' | 'revenue' | 'system';
  title: string;
  message: string;
  timestamp: string;
  actionRequired: boolean;
  read: boolean;
  data?: any;
  relatedUser?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

// Mock notification data
const mockNotifications: AdminNotification[] = [
  {
    id: "1",
    type: "urgent",
    category: "funding",
    title: "펀딩 마감 임박",
    message: "김민수의 '정규앨범 Dreams' 프로젝트가 24시간 내 마감됩니다. 목표 달성률: 75%",
    timestamp: "2025-08-09T10:30:00Z",
    actionRequired: true,
    read: false,
    relatedUser: {
      id: 1,
      name: "김민수",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    }
  },
  {
    id: "2",
    type: "warning",
    category: "reports",
    title: "신고 누적 사용자",
    message: "박소영이 3건의 신고를 받았습니다. 즉시 검토가 필요합니다.",
    timestamp: "2025-08-09T09:15:00Z",
    actionRequired: true,
    read: false,
    relatedUser: {
      id: 2,
      name: "박소영",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face"
    }
  },
  {
    id: "3",
    type: "info",
    category: "user_management",
    title: "아티스트 승인 요청",
    message: "2명의 아티스트가 승인 대기 중입니다.",
    timestamp: "2025-08-09T08:45:00Z",
    actionRequired: true,
    read: false
  },
  {
    id: "4",
    type: "success",
    category: "revenue",
    title: "정산 완료",
    message: "8월 첫 주 수익 정산이 성공적으로 완료되었습니다. 총 ₩12,450,000",
    timestamp: "2025-08-09T07:20:00Z",
    actionRequired: false,
    read: false
  },
  {
    id: "5",
    type: "warning",
    category: "system",
    title: "시스템 부하 감지",
    message: "서버 응답 시간이 평소보다 20% 증가했습니다.",
    timestamp: "2025-08-08T23:10:00Z",
    actionRequired: false,
    read: true
  },
  {
    id: "6",
    type: "info",
    category: "funding",
    title: "새 펀딩 프로젝트 등록",
    message: "이지영이 '개인전 색채의 울림' 프로젝트를 등록했습니다.",
    timestamp: "2025-08-08T16:30:00Z",
    actionRequired: false,
    read: true,
    relatedUser: {
      id: 3,
      name: "이지영",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b898?w=40&h=40&fit=crop&crop=face"
    }
  }
];

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className = "" }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>(mockNotifications);
  const [filter, setFilter] = useState<string>("all");

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.read).length;

  const getNotificationIcon = (category: string, type: string) => {
    const iconClass = "w-4 h-4";

    switch (category) {
      case "funding":
        return <DollarSign className={iconClass} />;
      case "user_management":
        return <Users className={iconClass} />;
      case "reports":
        return <Shield className={iconClass} />;
      case "revenue":
        return <TrendingUp className={iconClass} />;
      case "system":
        return <AlertTriangle className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "border-l-red-500 bg-red-50";
      case "warning":
        return "border-l-yellow-500 bg-yellow-50";
      case "success":
        return "border-l-green-500 bg-green-50";
      case "info":
      default:
        return "border-l-blue-500 bg-blue-50";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "info":
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    if (filter === "action_required") return notification.actionRequired && !notification.read;
    return notification.category === filter;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else {
      return notificationTime.toLocaleDateString();
    }
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // This would be replaced with actual WebSocket or SSE in production
      const randomNotifications = [
        {
          id: Date.now().toString(),
          type: "info" as const,
          category: "system" as const,
          title: "새로운 활동",
          message: "플랫폼에서 새로운 활동이 감지되었습니다.",
          timestamp: new Date().toISOString(),
          actionRequired: false,
          read: false
        }
      ];

      // 10% 확률로 새 알림 추가 (데모용)
      if (Math.random() < 0.1 && randomNotifications[0]) {
        setNotifications(prev => [randomNotifications[0] as AdminNotification, ...prev]);
      }
    }, 30000); // 30초마다 체크

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <CardTitle>알림 센터</CardTitle>
            {unreadCount > 0 && (
              <Badge className="bg-red-100 text-red-800">{unreadCount}</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              모두 읽음
            </Button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 flex-wrap mt-3">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            전체
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            읽지 않음 {unreadCount > 0 && `(${unreadCount})`}
          </Button>
          <Button
            variant={filter === "action_required" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("action_required")}
          >
            조치 필요 {actionRequiredCount > 0 && `(${actionRequiredCount})`}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-2 p-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>알림이 없습니다</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    border-l-4 p-3 rounded-r-lg transition-all cursor-pointer
                    ${getNotificationColor(notification.type)}
                    ${!notification.read ? 'border-l-4' : 'border-l-2 opacity-70'}
                    hover:shadow-sm
                  `}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(notification.type)}
                        <span className="font-semibold text-sm">{notification.title}</span>
                        {notification.actionRequired && (
                          <Badge className="bg-orange-100 text-orange-800 text-xs">
                            조치 필요
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-700 mb-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {notification.relatedUser && (
                            <div className="flex items-center gap-1">
                              <Avatar className="w-4 h-4">
                                <AvatarImage
                                  src={notification.relatedUser.avatar}
                                  alt={notification.relatedUser.name}
                                />
                                <AvatarFallback className="text-xs">
                                  {notification.relatedUser.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-600">
                                {notification.relatedUser.name}
                              </span>
                            </div>
                          )}
                          {getNotificationIcon(notification.category, notification.type)}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notification.id);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0 ml-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}