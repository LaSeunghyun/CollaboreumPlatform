import { Card, CardContent, CardHeader } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorMessage, ProjectListSkeleton } from '@/shared/ui';
import { Edit, Eye, Shield, Users as UsersIcon } from 'lucide-react';
import type { DashboardUser } from '../hooks/useAdminDashboardData';

interface UserListPanelProps {
  users: DashboardUser[];
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  onUserAction?: (action: string, userId: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export function UserListPanel({
  users,
  loading,
  error,
  onRetry,
  onUserAction,
  getStatusColor,
  getStatusText,
}: UserListPanelProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className='text-lg font-semibold'>사용자 관리</h3>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ProjectListSkeleton />
        ) : error ? (
          <ErrorMessage error={error as Error} onRetry={onRetry} />
        ) : users.length > 0 ? (
          <div className='space-y-4'>
            {users.map(user => (
              <div
                key={user.id}
                className='flex items-center justify-between rounded-lg border border-gray-200 p-4'
              >
                <div className='flex items-center space-x-4'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary-100'>
                    <UsersIcon className='h-5 w-5 text-primary-600' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900'>{user.name}</h4>
                    <p className='text-sm text-gray-600'>{user.email}</p>
                    <p className='text-xs text-gray-500'>
                      가입일:{' '}
                      {user.joinDate
                        ? new Date(user.joinDate).toLocaleDateString()
                        : '정보 없음'}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-4'>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                      user.status,
                    )}`}
                  >
                    {getStatusText(user.status)}
                  </span>
                  <div className='flex space-x-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onUserAction?.('view', user.id)}
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onUserAction?.('edit', user.id)}
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onUserAction?.('suspend', user.id)}
                    >
                      <Shield className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-sm text-gray-500'>표시할 사용자가 없습니다.</p>
        )}
      </CardContent>
    </Card>
  );
}
