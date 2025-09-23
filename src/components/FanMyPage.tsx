import React, { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';

import { useAuth } from '@/contexts/AuthContext';
import { FanProfileBackingsTable } from '@/features/fan-profile/components/FanProfileBackingsTable';
import { FanProfileFavoritesEmptyState } from '@/features/fan-profile/components/FanProfileFavoritesEmptyState';
import { FanProfileFollowingList } from '@/features/fan-profile/components/FanProfileFollowingList';
import { FanProfileGuard } from '@/features/fan-profile/components/FanProfileGuard';
import { FanProfileHeader } from '@/features/fan-profile/components/FanProfileHeader';
import { FanProfileLoading } from '@/features/fan-profile/components/FanProfileLoading';
import { FanProfileOverview } from '@/features/fan-profile/components/FanProfileOverview';
import { useFanProfile } from '@/features/fan-profile/hooks/useFanProfile';

interface FanMyPageProps {
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    following?: number;
    totalPledges?: number;
    totalAmount?: number;
  };
  onEditProfile?: () => void;
  onViewProject?: (projectId: string) => void;
  onFollowArtist?: (artistId: string) => void;
}

const FanMyPage: React.FC<FanMyPageProps> = ({
  user,
  onEditProfile,
  onViewProject,
  onFollowArtist,
}) => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const userId = user?.id ?? authUser?.id;
  const fallbackUser = user ?? authUser ?? undefined;

  const {
    hasUser,
    aggregatedProfile,
    followingArtists,
    backings,
    monthlySummary,
    recentActivities,
    profileQuery,
    backingsQuery,
  } = useFanProfile({ userId, fallbackUser });

  const isInitialLoading = profileQuery.isLoading && backingsQuery.isLoading;

  return (
    <FanProfileGuard isAuthenticated={Boolean(hasUser)}>
      {isInitialLoading ? (
        <FanProfileLoading />
      ) : (
        <div className='min-h-screen bg-gray-50'>
          <div className='mx-auto max-w-7xl p-6'>
            <FanProfileHeader
              profile={aggregatedProfile}
              isLoading={profileQuery.isLoading}
              error={profileQuery.error}
              onRetry={() => profileQuery.refetch()}
              onEditProfile={onEditProfile}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='overview'>개요</TabsTrigger>
                <TabsTrigger value='pledges'>후원 내역</TabsTrigger>
                <TabsTrigger value='following'>팔로잉</TabsTrigger>
                <TabsTrigger value='favorites'>즐겨찾기</TabsTrigger>
              </TabsList>

              <TabsContent value='overview' className='mt-6'>
                <FanProfileOverview
                  activities={recentActivities}
                  monthlySummary={monthlySummary}
                />
              </TabsContent>

              <TabsContent value='pledges' className='mt-6'>
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold'>후원 내역</h3>
                  <FanProfileBackingsTable
                    backings={backings}
                    isLoading={backingsQuery.isLoading}
                    error={backingsQuery.error}
                    onRetry={() => backingsQuery.refetch()}
                    onViewProject={onViewProject}
                  />
                </div>
              </TabsContent>

              <TabsContent value='following' className='mt-6'>
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold'>팔로잉 중인 아티스트</h3>
                  <FanProfileFollowingList
                    following={followingArtists}
                    onFollowArtist={onFollowArtist}
                  />
                </div>
              </TabsContent>

              <TabsContent value='favorites' className='mt-6'>
                <FanProfileFavoritesEmptyState
                  onBrowseProjects={() => setActiveTab('overview')}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </FanProfileGuard>
  );
};

export default FanMyPage;
