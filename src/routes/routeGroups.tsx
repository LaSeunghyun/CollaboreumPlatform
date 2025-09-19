import { lazy } from 'react';

import { AboutRoute } from './wrappers/AboutRoute';
import { AdminDashboardRoute } from './wrappers/AdminDashboardRoute';
import { ArtistGalleryRoute } from './wrappers/ArtistGalleryRoute';
import { ArtistProfileRoute } from './wrappers/ArtistProfileRoute';
import { CommunityFullRoute } from './wrappers/CommunityFullRoute';
import { CommunityMainRoute } from './wrappers/CommunityMainRoute';
import { CommunityPostDetailRoute } from './wrappers/CommunityPostDetailRoute';
import { CommunityPostFormRoute } from './wrappers/CommunityPostFormRoute';
import { EventDetailRoute } from './wrappers/EventDetailRoute';
import { LoginRoute } from './wrappers/LoginRoute';
import { NotFoundRoute } from './wrappers/NotFoundRoute';
import { ProjectDetailRoute } from './wrappers/ProjectDetailRoute';
import { SignupRoute } from './wrappers/SignupRoute';
import type { RouteGroup } from './types';

const HomePage = lazy(() => import('@/pages/home/HomePage').then(module => ({ default: module.HomePage })));
const ArtistsPage = lazy(() => import('@/pages/artists/ArtistsPage').then(module => ({ default: module.ArtistsPage })));
const ProjectsPage = lazy(() => import('@/pages/projects/ProjectsPage').then(module => ({ default: module.ProjectsPage })));
const CommunityPage = lazy(() => import('@/pages/community/CommunityPage').then(module => ({ default: module.CommunityPage })));
const NoticesPage = lazy(() => import('@/pages/notices/NoticesPage').then(module => ({ default: module.NoticesPage })));
const EventsPage = lazy(() => import('@/pages/events/EventsPage').then(module => ({ default: module.EventsPage })));
const AccountPage = lazy(() => import('@/pages/account/AccountPage').then(module => ({ default: module.AccountPage })));
const SearchPage = lazy(() => import('@/pages/search/SearchPage').then(module => ({ default: module.SearchPage })));
const CreateProjectPage = lazy(() => import('@/pages/projects/CreateProjectPage').then(module => ({ default: module.CreateProjectPage })));
const CreateEventPage = lazy(() => import('@/pages/events/CreateEventPage').then(module => ({ default: module.CreateEventPage })));
const CreateArtworkPage = lazy(() => import('@/pages/gallery/CreateArtworkPage').then(module => ({ default: module.CreateArtworkPage })));
const CreatePostPage = lazy(() => import('@/pages/community/CreatePostPage').then(module => ({ default: module.CreatePostPage })));
const EditPostPage = lazy(() => import('@/pages/community/EditPostPage').then(module => ({ default: module.EditPostPage })));
const ArtistDashboard = lazy(() => import('@/components/ArtistDashboard').then(module => ({ default: module.ArtistDashboard })));

const routeGroups: RouteGroup[] = [
  {
    name: 'public',
    routes: [
      { path: '/', component: HomePage, layout: 'app' },
      { path: '/artists', component: ArtistsPage, layout: 'app' },
      { path: '/artists/:handle', component: ArtistProfileRoute, layout: 'app', suspense: false },
      { path: '/projects', component: ProjectsPage, layout: 'app' },
      { path: '/projects/create', component: CreateProjectPage, layout: 'app' },
      { path: '/projects/:slug', component: ProjectDetailRoute, layout: 'app', suspense: false },
      { path: '/funding/create', component: CreateProjectPage, layout: 'app' },
      { path: '/community', component: CommunityPage, layout: 'app' },
      { path: '/community/create', component: CreatePostPage, layout: 'app' },
      { path: '/community/edit/:postId', component: EditPostPage, layout: 'app' },
      { path: '/community/post/:id', component: CommunityPostDetailRoute, layout: 'app', suspense: false },
      { path: '/notices', component: NoticesPage, layout: 'app' },
      { path: '/notices/:id', component: CommunityPostDetailRoute, layout: 'app', suspense: false },
      { path: '/events', component: EventsPage, layout: 'app' },
      { path: '/events/create', component: CreateEventPage, layout: 'app' },
      { path: '/events/:id', component: EventDetailRoute, layout: 'app', suspense: false },
      { path: '/search', component: SearchPage, layout: 'app' },
      { path: '/account', component: AccountPage, layout: 'app' },
    ],
  },
  {
    name: 'auth',
    routes: [
      { path: '/login', component: LoginRoute, suspense: false },
      { path: '/signup', component: SignupRoute, suspense: false },
    ],
  },
  {
    name: 'legacy',
    routes: [
      { path: '/dashboard', component: ArtistDashboard, layout: 'app' },
      { path: '/mypage', component: AccountPage, layout: 'app' },
      { path: '/admin', component: AdminDashboardRoute, suspense: false },
      { path: '/gallery', component: ArtistGalleryRoute, layout: 'app', suspense: false },
      { path: '/gallery/create', component: CreateArtworkPage, layout: 'app' },
      { path: '/community-full', component: CommunityFullRoute, layout: 'app', suspense: false },
      { path: '/community-main', component: CommunityMainRoute, layout: 'app', suspense: false },
      { path: '/post-detail/:id', component: CommunityPostDetailRoute, layout: 'app', suspense: false },
      { path: '/create-post', component: CommunityPostFormRoute, layout: 'app', suspense: false },
      { path: '/about', component: AboutRoute, layout: 'app', suspense: false },
    ],
  },
  {
    name: 'redirects',
    routes: [
      { path: '/home', redirectTo: '/', suspense: false },
      { path: '/funding', redirectTo: '/projects', suspense: false },
      { path: '/notice', redirectTo: '/notices', suspense: false },
    ],
  },
  {
    name: 'fallback',
    routes: [
      { path: '*', component: NotFoundRoute, layout: 'app', suspense: false },
    ],
  },
];

export default routeGroups;
