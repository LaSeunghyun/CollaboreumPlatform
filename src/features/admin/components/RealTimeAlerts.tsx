import { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Badge } from '../../../shared/ui/Badge';
import { Card, CardContent } from '../../../shared/ui/Card';
import { AlertTriangle, Clock, X, Bell, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RealTimeAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
  autoClose?: number; // milliseconds
}

const mockAlerts: RealTimeAlert[] = [
  {
    id: 'alert-1',
    type: 'critical',
    title: '서버 부하 임계점 도달',
    message: '서버 CPU 사용률이 85%를 넘었습니다. 즉시 확인이 필요합니다.',
    timestamp: new Date().toISOString(),
    actionUrl: '/admin/system',
    actionLabel: '시스템 확인',
  },
  {
    id: 'alert-2',
    type: 'warning',
    title: '펀딩 마감 24시간 전',
    message: "김민수의 '정규앨범 Dreams' 프로젝트가 내일 마감됩니다.",
    timestamp: new Date().toISOString(),
    actionUrl: '/admin/funding',
    actionLabel: '프로젝트 보기',
  },
  {
    id: 'alert-3',
    type: 'info',
    title: '일간 목표 달성',
    message: '오늘 신규 가입자 목표 50명을 달성했습니다!',
    timestamp: new Date().toISOString(),
    autoClose: 5000,
  },
];

export function RealTimeAlerts() {
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // 컴포넌트 마운트 시 초기 알림 설정
    setAlerts(mockAlerts);

    // 실시간 알림 시뮬레이션 (실제 환경에서는 WebSocket 사용)
    const interval = setInterval(() => {
      const randomAlert: RealTimeAlert = {
        id: `alert-${Date.now()}`,
        type:
          Math.random() > 0.7
            ? 'critical'
            : Math.random() > 0.4
              ? 'warning'
              : 'info',
        title: '실시간 알림',
        message: '새로운 활동이 감지되었습니다.',
        timestamp: new Date().toISOString(),
        autoClose: 4000,
      };

      // 20% 확률로 새 알림 생성 (데모용)
      if (Math.random() < 0.2) {
        setAlerts(prev => [
          randomAlert,
          ...(Array.isArray(prev) ? prev : []).slice(0, 9),
        ]); // 최대 10개 유지
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // 자동 닫기 처리
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.autoClose && !dismissed.has(alert.id)) {
        setTimeout(() => {
          dismissAlert(alert.id);
        }, alert.autoClose);
      }
    });
  }, [alerts, dismissed]);

  const dismissAlert = (alertId: string) => {
    setDismissed(prev => new Set(prev).add(alertId));
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      setDismissed(prev => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
    }, 300); // 애니메이션 시간
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className='h-5 w-5 text-red-500' />;
      case 'warning':
        return <Clock className='h-5 w-5 text-yellow-500' />;
      case 'info':
        return <CheckCircle className='h-5 w-5 text-blue-500' />;
      default:
        return <Bell className='h-5 w-5' />;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-l-red-500 bg-red-50 shadow-md';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 shadow-md';
      case 'info':
        return 'border-l-blue-500 bg-blue-50 shadow-md';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const visibleAlerts = alerts.filter(alert => !dismissed.has(alert.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className='fixed right-4 top-4 z-50 w-96 max-w-sm'>
      <AnimatePresence>
        {visibleAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              delay: index * 0.1,
            }}
            className={`mb-3 ${index > 2 ? 'hidden' : ''}`} // 최대 3개만 표시
          >
            <Card
              className={`border-l-4 ${getAlertStyle(alert.type)} backdrop-blur-sm`}
            >
              <CardContent className='p-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex flex-1 items-start gap-3'>
                    {getAlertIcon(alert.type)}
                    <div className='min-w-0 flex-1'>
                      <div className='mb-1 flex items-center gap-2'>
                        <h4 className='text-sm font-semibold'>{alert.title}</h4>
                        <Badge
                          className={
                            alert.type === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : alert.type === 'warning'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                          }
                        >
                          {alert.type === 'critical'
                            ? '긴급'
                            : alert.type === 'warning'
                              ? '경고'
                              : '정보'}
                        </Badge>
                      </div>

                      <p className='mb-2 text-sm text-gray-700'>
                        {alert.message}
                      </p>

                      <div className='flex items-center justify-between'>
                        <span className='text-xs text-gray-500'>
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>

                        {alert.actionUrl && alert.actionLabel && (
                          <Button
                            size='sm'
                            variant='outline'
                            className='h-6 text-xs'
                          >
                            {alert.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant='ghost'
                    size='sm'
                    className='ml-2 h-6 w-6 p-0 opacity-50 hover:opacity-100'
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>

                {/* 자동 닫기 프로그레스 바 */}
                {alert.autoClose && (
                  <motion.div
                    className='mt-2 h-1 overflow-hidden rounded-full bg-gray-200'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className={`h-full ${
                        alert.type === 'critical'
                          ? 'bg-red-500'
                          : alert.type === 'warning'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                      }`}
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{
                        duration: alert.autoClose / 1000,
                        ease: 'linear',
                      }}
                    />
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 추가 알림이 있는 경우 표시 */}
      {visibleAlerts.length > 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'
        >
          <Button variant='outline' size='sm' className='text-xs'>
            +{visibleAlerts.length - 3}개 더 보기
          </Button>
        </motion.div>
      )}
    </div>
  );
}
