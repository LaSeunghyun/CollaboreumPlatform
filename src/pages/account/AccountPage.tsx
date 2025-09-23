import React from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/shared/ui/Button';
import { Plus } from 'lucide-react';
import { useAccountPage } from '@/features/account/hooks/useAccountPage';
import { AccountHeader } from '@/features/account/components/AccountHeader';
import { AccountLoggedOutState } from '@/features/account/components/AccountLoggedOutState';
import { AccountProfileCard } from '@/features/account/components/AccountProfileCard';
import { AccountStatsGrid } from '@/features/account/components/AccountStatsGrid';
import { AccountProjectsTab } from '@/features/account/components/AccountProjectsTab';
import { AccountBackedProjectsTab } from '@/features/account/components/AccountBackedProjectsTab';
import { AccountCommunityTab } from '@/features/account/components/AccountCommunityTab';
import { AccountSettingsTab } from '@/features/account/components/AccountSettingsTab';

export const AccountPage: React.FC = () => {
  const {
    isLoggedIn,
    setIsLoggedIn,
    activeTab,
    setActiveTab,
    handleLogout,
    handleCreateProject,
    userProfile,
    profileQuery,
    projects,
    projectsQuery,
    backings,
    backingsQuery,
    ongoingProjectCount,
  } = useAccountPage();

  if (!isLoggedIn) {
    return <AccountLoggedOutState onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className='space-y-8'>
      <AccountHeader
        onOpenSettings={() => setActiveTab('settings')}
        onLogout={handleLogout}
      />

      <AccountProfileCard
        userProfile={userProfile}
        isLoading={profileQuery.isLoading}
        error={profileQuery.error}
        onEditProfile={() => setActiveTab('settings')}
      />

      <AccountStatsGrid
        ongoingProjects={ongoingProjectCount}
        backedProjects={backings.length}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
        <TabsList>
          <TabsTrigger value='my-projects'>내 프로젝트</TabsTrigger>
          <TabsTrigger value='backed-projects'>후원한 프로젝트</TabsTrigger>
          <TabsTrigger value='community-activity'>커뮤니티 활동</TabsTrigger>
          <TabsTrigger value='settings'>설정</TabsTrigger>
        </TabsList>

        <TabsContent value='my-projects' className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h3 className='text-xl font-semibold'>내 프로젝트</h3>
            <Button variant='indigo' onClick={handleCreateProject}>
              <Plus className='mr-2 h-4 w-4' />새 프로젝트
            </Button>
          </div>
          <AccountProjectsTab
            projects={projects}
            isLoading={projectsQuery.isLoading}
            error={projectsQuery.error}
            onCreateProject={handleCreateProject}
          />
        </TabsContent>

        <TabsContent value='backed-projects' className='space-y-6'>
          <AccountBackedProjectsTab
            backings={backings}
            isLoading={backingsQuery.isLoading}
            error={backingsQuery.error}
          />
        </TabsContent>

        <TabsContent value='community-activity' className='space-y-6'>
          <AccountCommunityTab />
        </TabsContent>

        <TabsContent value='settings' className='space-y-6'>
          <AccountSettingsTab userProfile={userProfile} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
