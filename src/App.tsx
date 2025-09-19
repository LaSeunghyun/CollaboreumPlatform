import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { Toast } from './components/organisms/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import { ArtistDashboard } from './components/ArtistDashboard';
import { ArtistGallery } from './components/ArtistGallery';
import { ArtistProfile } from './components/ArtistProfile';
import { CommunityFull } from './components/CommunityFull';
import { CommunityMain } from './components/CommunityMain';
import { ProjectDetail } from './components/ProjectDetail';
import { EventDetail } from './components/EventDetail';
import { CommunityPostDetail } from './components/CommunityPostDetail';
import { CommunityPostForm } from './components/CommunityPostForm';
import { About } from './components/About';
import { AdminDashboard } from './features/admin/components/AdminDashboard';
import { AppLayout } from './components/layout/AppLayout';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/home/HomePage').then(module => ({ default: module.HomePage })));
const ArtistsPage = lazy(() => import('./pages/artists/ArtistsPage').then(module => ({ default: module.ArtistsPage })));
const ProjectsPage = lazy(() => import('./pages/projects/ProjectsPage').then(module => ({ default: module.ProjectsPage })));
const CommunityPage = lazy(() => import('./pages/community/CommunityPage').then(module => ({ default: module.CommunityPage })));
const NoticesPage = lazy(() => import('./pages/notices/NoticesPage').then(module => ({ default: module.NoticesPage })));
const EventsPage = lazy(() => import('./pages/events/EventsPage').then(module => ({ default: module.EventsPage })));
const AccountPage = lazy(() => import('./pages/account/AccountPage').then(module => ({ default: module.AccountPage })));
const SearchPage = lazy(() => import('./pages/search/SearchPage').then(module => ({ default: module.SearchPage })));

// CRUD Pages
const CreateProjectPage = lazy(() => import('./pages/projects/CreateProjectPage').then(module => ({ default: module.CreateProjectPage })));
const CreateEventPage = lazy(() => import('./pages/events/CreateEventPage').then(module => ({ default: module.CreateEventPage })));
const CreateArtworkPage = lazy(() => import('./pages/gallery/CreateArtworkPage').then(module => ({ default: module.CreateArtworkPage })));
const CreatePostPage = lazy(() => import('./pages/community/CreatePostPage').then(module => ({ default: module.CreatePostPage })));
const EditPostPage = lazy(() => import('./pages/community/EditPostPage').then(module => ({ default: module.EditPostPage })));

// Loading component
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">페이지를 불러오는 중...</p>
    </div>
  </div>
);

// CommunityPostDetail Wrapper for URL params
const CommunityPostDetailWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/community');
  };

  return <CommunityPostDetail postId={id || ''} onBack={handleBack} />;
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Toast />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                  <Suspense fallback={<PageLoading />}>
                    <AppLayout><HomePage /></AppLayout>
                  </Suspense>
                } />
                <Route path="/artists" element={
                  <Suspense fallback={<PageLoading />}>
                    <AppLayout><ArtistsPage /></AppLayout>
                  </Suspense>
                } />
                <Route path="/artists/:handle" element={<AppLayout><ArtistProfile artistId={0} onBack={() => { }} /></AppLayout>} />
                <Route path="/projects" element={
                  <Suspense fallback={<PageLoading />}>
                    <AppLayout><ProjectsPage /></AppLayout>
                  </Suspense>
                } />
                <Route path="/projects/create" element={
                  <Suspense fallback={<PageLoading />}>
                    <AppLayout><CreateProjectPage /></AppLayout>
                  </Suspense>
                } />
                <Route path="/projects/:slug" element={<AppLayout><ProjectDetail projectId={0} onBack={() => { }} /></AppLayout>} />
                <Route path="/funding/create" element={
                  <Suspense fallback={<PageLoading />}>
                    <AppLayout><CreateProjectPage /></AppLayout>
                  </Suspense>
                } />
                <Route path="/community" element={
                  <Suspense fallback={<PageLoading />}>
                    <AppLayout><CommunityPage /></AppLayout>
                  </Suspense>
                } />
                <Route path="/community/create" element={
                  <Suspense fallback={<PageLoading />}>
                    <AppLayout><CreatePostPage /></AppLayout>
                  </Suspense>
                } />
                <Route path="/community/edit/:postId" element={
                  <Suspense fallback={<PageLoading />}>
                    <AppLayout><EditPostPage /></AppLayout>
                  </Suspense>
                } />
                <Route path="/community/post/:id" element={<AppLayout><CommunityPostDetailWrapper /></AppLayout>} />
                <Route path="/notices" element={
                  <Suspense fallback={<PageLoading />}>
                    <AppLayout><NoticesPage /></AppLayout>
                  </Suspense>
                } />
                <Route path="/notices/:id" element={<AppLayout><CommunityPostDetail postId="" /></AppLayout>} />
                <Route path="/events" element={
                  <Suspense fallback={<PageLoading />}>
                    <AppLayout><EventsPage /></AppLayout>
                  </Suspense>
                } />
                <Route path="/events/create" element={
                  <Suspense fallback={<PageLoading />}>
                    <AppLayout><CreateEventPage /></AppLayout>
                  </Suspense>
                } />
                <Route path="/events/:id" element={<AppLayout><EventDetail eventId="" onBack={() => { }} /></AppLayout>} />
                <Route path="/search" element={
                  <Suspense fallback={<PageLoading />}>
                    <AppLayout><SearchPage /></AppLayout>
                  </Suspense>
                } />

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage onBack={() => window.history.back()} onLogin={() => { }} onSignupClick={() => { }} />} />
                <Route path="/signup" element={<SignupPage onBack={() => { }} onSignup={() => { }} onSocialSignup={() => { }} onLoginClick={() => { }} />} />

                {/* Protected Routes - 인증이 필요한 액션만 보호 */}
                <Route path="/account" element={
                  <Suspense fallback={<PageLoading />}>
                    <AppLayout><AccountPage /></AppLayout>
                  </Suspense>
                } />

                {/* Legacy Routes (기존 라우트들) */}
                <Route path="/dashboard" element={
                  <Suspense fallback={<PageLoading />}>
                    <AppLayout><ArtistDashboard /></AppLayout>
                  </Suspense>
                } />
                <Route path="/mypage" element={
                  <Suspense fallback={<PageLoading />}>
                    <AppLayout><AccountPage /></AppLayout>
                  </Suspense>
                } />
                <Route path="/admin" element={
                  <Suspense fallback={<PageLoading />}>
                    <AdminDashboard onBack={() => { }} />
                  </Suspense>
                } />
                <Route path="/gallery" element={
                  <Suspense fallback={<PageLoading />}>
                    <AppLayout><ArtistGallery onBack={() => { }} /></AppLayout>
                  </Suspense>
                } />
                <Route path="/gallery/create" element={
                  <Suspense fallback={<PageLoading />}>
                    <AppLayout><CreateArtworkPage /></AppLayout>
                  </Suspense>
                } />
                <Route path="/community-full" element={<AppLayout><CommunityFull onBack={() => { }} onSelectArtist={() => { }} /></AppLayout>} />
                <Route path="/community-main" element={
                  <Suspense fallback={<PageLoading />}>
                    <AppLayout><CommunityMain onBack={() => { }} /></AppLayout>
                  </Suspense>
                } />
                <Route path="/post-detail/:id" element={<AppLayout><CommunityPostDetail postId="" /></AppLayout>} />
                <Route path="/create-post" element={<AppLayout><CommunityPostForm onBack={() => { }} /></AppLayout>} />
                <Route path="/about" element={<AppLayout><About onBack={() => { }} /></AppLayout>} />

                {/* Redirects */}
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="/funding" element={<Navigate to="/projects" replace />} />
                <Route path="/notice" element={<Navigate to="/notices" replace />} />

                {/* 404 Route */}
                <Route path="*" element={
                  <AppLayout>
                    <div className="text-center py-12">
                      <h1 className="text-4xl font-bold mb-4">404</h1>
                      <p className="text-muted-foreground mb-6">페이지를 찾을 수 없습니다.</p>
                      <a href="/" className="text-indigo hover:underline">홈으로 돌아가기</a>
                    </div>
                  </AppLayout>
                } />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;