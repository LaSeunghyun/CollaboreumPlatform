import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { Toast } from './components/organisms/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import { HomePage } from './pages/home/HomePage';
import { ArtistsPage } from './pages/artists/ArtistsPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { CommunityPage } from './pages/community/CommunityPage';
import { NoticesPage } from './pages/notices/NoticesPage';
import { EventsPage } from './pages/events/EventsPage';
import { AccountPage } from './pages/account/AccountPage';

// Legacy components (기존 컴포넌트들)
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { ArtistDashboard } from './components/ArtistDashboard';
import { AdminDashboard as LegacyAdminDashboard } from './components/AdminDashboard';
import { ArtistGallery } from './components/ArtistGallery';
import { ArtistProfile } from './components/ArtistProfile';
import { CommunityFull } from './components/CommunityFull';
import { CommunityMain } from './components/CommunityMain';
import { ProjectDetail } from './components/ProjectDetail';
import { EventDetail } from './components/EventDetail';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CommunityPostDetail } from './components/CommunityPostDetail';
import { useParams, useNavigate } from 'react-router-dom';
import { CommunityPostForm } from './components/CommunityPostForm';
import { About } from './components/About';

// New Admin Dashboard
import { AdminDashboard } from './features/admin/components/AdminDashboard';

// Layout component
import { AppLayout } from './components/layout/AppLayout';

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
                <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
                <Route path="/artists" element={<AppLayout><ArtistsPage /></AppLayout>} />
                <Route path="/artists/:handle" element={<AppLayout><ArtistProfile artistId={0} onBack={() => { }} /></AppLayout>} />
                <Route path="/projects" element={<AppLayout><ProjectsPage /></AppLayout>} />
                <Route path="/projects/:slug" element={<AppLayout><ProjectDetail projectId={0} onBack={() => { }} /></AppLayout>} />
                <Route path="/community" element={<AppLayout><CommunityPage /></AppLayout>} />
                <Route path="/community/post/:id" element={<AppLayout><CommunityPostDetailWrapper /></AppLayout>} />
                <Route path="/notices" element={<AppLayout><NoticesPage /></AppLayout>} />
                <Route path="/notices/:id" element={<AppLayout><CommunityPostDetail postId="" /></AppLayout>} />
                <Route path="/events" element={<AppLayout><EventsPage /></AppLayout>} />
                <Route path="/events/:id" element={<AppLayout><EventDetail eventId="" onBack={() => { }} /></AppLayout>} />

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage onBack={() => window.history.back()} onLogin={() => { }} onSignupClick={() => { }} />} />
                <Route path="/signup" element={<SignupPage onBack={() => { }} onSignup={() => { }} onSocialSignup={() => { }} onLoginClick={() => { }} />} />

                {/* Protected Routes */}
                <Route path="/account" element={
                  <ProtectedRoute>
                    <AppLayout><AccountPage /></AppLayout>
                  </ProtectedRoute>
                } />

                {/* Legacy Routes (기존 라우트들) */}
                <Route path="/dashboard" element={
                  <ProtectedRoute requiredRole="artist">
                    <AppLayout><ArtistDashboard /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/mypage" element={
                  <ProtectedRoute>
                    <AppLayout><AccountPage /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard onBack={() => { }} />
                  </ProtectedRoute>
                } />
                <Route path="/gallery" element={
                  <ProtectedRoute requiredRole="artist">
                    <AppLayout><ArtistGallery onBack={() => { }} /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/community-full" element={<AppLayout><CommunityFull onBack={() => { }} onSelectArtist={() => { }} /></AppLayout>} />
                <Route path="/community-main" element={
                  <ProtectedRoute>
                    <AppLayout><CommunityMain onBack={() => { }} /></AppLayout>
                  </ProtectedRoute>
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