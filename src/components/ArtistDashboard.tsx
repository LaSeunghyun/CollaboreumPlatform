import { DashboardTabs } from '@/features/artist-dashboard/components/DashboardTabs';
import { OverviewCards } from '@/features/artist-dashboard/components/OverviewCards';
import { useArtistDashboard } from '@/features/artist-dashboard/hooks/useArtistDashboard';

export function ArtistDashboard() {
  const {
    isLoading,
    error,
    greetingName,
    overviewStats,
    projectsSection,
    wbsSection,
    analyticsMessage,
    settingsMessage,
  } = useArtistDashboard();

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='mt-4 text-gray-600'>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <p className='text-lg font-semibold text-red-600'>
            대시보드를 불러오지 못했습니다.
          </p>
          <p className='mt-2 text-gray-600'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>
            아티스트 대시보드
          </h1>
          <p className='text-gray-600'>
            안녕하세요, {greetingName}님! 현재 진행 상황을 확인해보세요.
          </p>
        </div>

        <OverviewCards stats={overviewStats} />

        <DashboardTabs
          projectsSection={projectsSection}
          wbsSection={wbsSection}
          analyticsMessage={analyticsMessage}
          settingsMessage={settingsMessage}
        />
      </div>
    </div>
  );
}
