import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Badge } from '../../../shared/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../shared/ui/Avatar';
import { ScrollArea } from '../../../shared/ui/ScrollArea';
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
  X,
} from 'lucide-react';
import {
  useNotifications,
  useMarkNotificationAsRead,
} from '../hooks/useAdminData';
import {
  getFirstChar,
  getUsername,
  getAvatarUrl,
} from '../../../utils/typeGuards';
import { AdminNotification } from '../types';

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({
  className = '',
}: NotificationCenterProps) {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const [filter, setFilter] = useState<string>('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionRequiredCount = notifications.filter(
    n => n.actionRequired && !n.read,
  ).length;

  const getNotificationIcon = (category: string, type: string) => {
    const iconClass = 'w-4 h-4';

    switch (category) {
      case 'funding':
        return <DollarSign className={iconClass} />;
      case 'user_management':
        return <Users className={iconClass} />;
      case 'reports':
        return <Shield className={iconClass} />;
      case 'revenue':
        return <TrendingUp className={iconClass} />;
      case 'system':
        return <AlertTriangle className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className='h-4 w-4 text-red-500' />;
      case 'warning':
        return <AlertTriangle className='h-4 w-4 text-yellow-500' />;
      case 'success':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'info':
      default:
        return <Bell className='h-4 w-4 text-blue-500' />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'action_required')
      return notification.actionRequired && !notification.read;
    return notification.category === filter;
  });

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead.mutateAsync(id);
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - notificationTime.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - notificationTime.getTime()) / (1000 * 60),
      );
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else {
      return notificationTime.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <Card className={`w-full max-w-md ${className}`}>
        <CardContent className='p-6'>
          <div className='animate-pulse'>
            <div className='h-32 rounded-lg bg-gray-200'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Bell className='h-5 w-5' />
            <CardTitle>알림 센터</CardTitle>
            {unreadCount > 0 && (
              <Badge className='bg-red-100 text-red-800'>{unreadCount}</Badge>
            )}
          </div>
        </div>

        {/* Filter buttons */}
        <div className='mt-3 flex flex-wrap gap-2'>
          <Button
            variant={filter === 'all' ? 'solid' : 'outline'}
            size='sm'
            onClick={() => setFilter('all')}
          >
            전체
          </Button>
          <Button
            variant={filter === 'unread' ? 'solid' : 'outline'}
            size='sm'
            onClick={() => setFilter('unread')}
          >
            읽지 않음 {unreadCount > 0 && `(${unreadCount})`}
          </Button>
          <Button
            variant={filter === 'action_required' ? 'solid' : 'outline'}
            size='sm'
            onClick={() => setFilter('action_required')}
          >
            조치 필요 {actionRequiredCount > 0 && `(${actionRequiredCount})`}
          </Button>
        </div>
      </CardHeader>

      <CardContent className='p-0'>
        <ScrollArea className='h-96'>
          <div className='space-y-2 p-4'>
            {filteredNotifications.length === 0 ? (
              <div className='py-8 text-center text-gray-500'>
                <Bell className='mx-auto mb-2 h-8 w-8 opacity-50' />
                <p>알림이 없습니다</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`cursor-pointer rounded-r-lg border-l-4 p-3 transition-all ${getNotificationColor(notification.type)} ${!notification.read ? 'border-l-4' : 'border-l-2 opacity-70'} hover:shadow-sm`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='mb-1 flex items-center gap-2'>
                        {getTypeIcon(notification.type)}
                        <span className='text-sm font-semibold'>
                          {notification.title}
                        </span>
                        {notification.actionRequired && (
                          <Badge className='bg-orange-100 text-xs text-orange-800'>
                            조치 필요
                          </Badge>
                        )}
                      </div>

                      <p className='mb-2 text-sm text-gray-700'>
                        {notification.message}
                      </p>

                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          {notification.relatedUser && (
                            <div className='flex items-center gap-1'>
                              <Avatar className='h-4 w-4'>
                                <AvatarImage
                                  src={notification.relatedUser.avatar}
                                  alt={notification.relatedUser.name}
                                />
                                <AvatarFallback className='text-xs'>
                                  {getFirstChar(notification.relatedUser.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className='text-xs text-gray-600'>
                                {notification.relatedUser.name}
                              </span>
                            </div>
                          )}
                          {getNotificationIcon(
                            notification.category,
                            notification.type,
                          )}
                        </div>

                        <div className='flex items-center gap-2'>
                          <span className='flex items-center gap-1 text-xs text-gray-500'>
                            <Clock className='h-3 w-3' />
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!notification.read && (
                      <div className='ml-2 mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500'></div>
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
