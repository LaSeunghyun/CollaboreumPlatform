import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ProjectsSectionData,
  WbsSectionData,
} from '@/features/artist-dashboard/hooks/useArtistDashboard';
import { ProjectsSection } from './ProjectsSection';
import { WbsSection } from './WbsSection';
import { AnalyticsPlaceholder } from './AnalyticsPlaceholder';
import { SettingsPlaceholder } from './SettingsPlaceholder';

interface DashboardTabsProps {
  projectsSection: ProjectsSectionData;
  wbsSection: WbsSectionData;
  analyticsMessage: string;
  settingsMessage: string;
}

export const DashboardTabs = ({
  projectsSection,
  wbsSection,
  analyticsMessage,
  settingsMessage,
}: DashboardTabsProps) => {
  return (
    <Tabs defaultValue='projects' className='space-y-6'>
      <TabsList className='grid w-full grid-cols-4'>
        <TabsTrigger value='projects'>진행 프로젝트</TabsTrigger>
        <TabsTrigger value='wbs'>작업 계획 (WBS)</TabsTrigger>
        <TabsTrigger value='analytics'>분석</TabsTrigger>
        <TabsTrigger value='settings'>설정</TabsTrigger>
      </TabsList>

      <TabsContent value='projects' className='space-y-6'>
        <ProjectsSection data={projectsSection} />
      </TabsContent>

      <TabsContent value='wbs' className='space-y-6'>
        <WbsSection data={wbsSection} />
      </TabsContent>

      <TabsContent value='analytics'>
        <AnalyticsPlaceholder message={analyticsMessage} />
      </TabsContent>

      <TabsContent value='settings'>
        <SettingsPlaceholder message={settingsMessage} />
      </TabsContent>
    </Tabs>
  );
};
