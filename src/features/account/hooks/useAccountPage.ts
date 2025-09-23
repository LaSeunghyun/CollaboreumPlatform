import { useCallback, useMemo, useState } from 'react';
import {
  useUserBackings,
  useUserProfile,
  useUserProjects,
} from '@/lib/api/useUser';
import { UserBackings, UserProfile, UserProjects } from '../types';

const resolveProjects = (data: unknown): any[] => {
  const projectsData = data as UserProjects | undefined;
  if (!projectsData) {
    return [];
  }

  if (Array.isArray(projectsData.projects)) {
    return projectsData.projects;
  }

  if (Array.isArray(projectsData.data?.projects)) {
    return projectsData.data?.projects ?? [];
  }

  return [];
};

const resolveBackings = (data: unknown): any[] => {
  const backingsData = data as UserBackings | undefined;
  if (!backingsData) {
    return [];
  }

  if (Array.isArray(backingsData.backings)) {
    return backingsData.backings;
  }

  if (Array.isArray(backingsData.data?.backings)) {
    return backingsData.data?.backings ?? [];
  }

  return [];
};

export const useAccountPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState('my-projects');

  const profileQuery = useUserProfile('current-user');
  const projectsQuery = useUserProjects('current-user');
  const backingsQuery = useUserBackings('current-user');

  const userProfile = (profileQuery.data as UserProfile) || {};

  const projects = useMemo(
    () => resolveProjects(projectsQuery.data),
    [projectsQuery.data],
  );
  const backings = useMemo(
    () => resolveBackings(backingsQuery.data),
    [backingsQuery.data],
  );

  const ongoingProjectCount = useMemo(
    () => projects.filter(project => project?.status === 'ongoing').length,
    [projects],
  );

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  const handleCreateProject = useCallback(() => {
    window.location.href = '/funding/create';
  }, []);

  return {
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
  };
};
