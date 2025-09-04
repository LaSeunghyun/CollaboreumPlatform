import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ArtistSection } from './components/ArtistSection';
import { CommunitySection } from './components/CommunitySection';
import { LiveAndPointsSection } from './components/LiveAndPointsSection';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { ArtistDashboard } from './components/ArtistDashboard';
import { ArtistMyPage } from './components/ArtistMyPage';
import { FanMyPage } from './components/FanMyPage';
import { AdminDashboard } from './components/AdminDashboard';
import { ArtistGallery } from './components/ArtistGallery';
import { ArtistProfile } from './components/ArtistProfile';
import { CommunityFull } from './components/CommunityFull';
import { CommunityMain } from './components/CommunityMain';
import { FundingProjects } from './components/FundingProjects';
import { ProjectDetail } from './components/ProjectDetail';
import { EventDetail } from './components/EventDetail';
import { SearchResults } from './components/SearchResults';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HistoryProvider, useHistory } from './contexts/HistoryContext';
import { isSpecialPage, scrollToSection } from './utils/navigation';
import { CommunityPostDetail } from './components/CommunityPostDetail';
import { CommunityPostForm } from './components/CommunityPostForm';
import { QuickLinksSection } from './components/QuickLinksSection';
import { About } from './components/About';
import { EventsSection } from './components/EventsSection';

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const { user, isAuthenticated, login } = useAuth();
  const { history, currentIndex, navigateTo, goBack, canGoBack } = useHistory();

  // 히스토리 변경 감지 및 상태 업데이트
  useEffect(() => {
    const currentEntry = history[currentIndex];
    if (currentEntry) {
      setCurrentView(currentEntry.view);
      if (currentEntry.params) {
        setSelectedArtistId(currentEntry.params.selectedArtistId || null);
        setSelectedProjectId(currentEntry.params.selectedProjectId || null);
        setSearchQuery(currentEntry.params.searchQuery || '');
        setSelectedPostId(currentEntry.params.selectedPostId || null);
      }
    }
  }, [history, currentIndex]);

  // 해시 변경 감지
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'login') {
        navigateTo('login');
      } else if (hash === 'signup') {
        navigateTo('signup');
      } else if (hash.startsWith('search=')) {
        const query = decodeURIComponent(hash.split('=')[1]);
        navigateTo('search', { searchQuery: query });
      }
    };

    // 초기 해시 확인
    handleHashChange();

    // 해시 변경 이벤트 리스너
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [navigateTo]);

  const handleNavigation = (section: string) => {
    if (!isSpecialPage(section)) {
      scrollToSection(section);
      navigateTo('home');
    } else {
      navigateTo(section);
    }
  };

  const handleLogin = async (data: any) => {
    try {
      // data는 LoginPage에서 전달된 response.data (user와 token 포함)
      if (data && data.user && data.token) {
        // AuthContext를 통해 로그인 처리
        login(data.token, data.user);
        navigateTo('home');
      } else {
        // 에러 처리는 LoginPage에서 이미 하고 있음
      }
    } catch (error) {
      // 에러 처리는 LoginPage에서 이미 하고 있음
    }
  };

  const handleSignup = (data: any) => {
    // 회원가입 완료 후 홈으로 이동
    navigateTo('home');
  };

  const handleSocialSignup = (provider: string, userType: string) => {
    // 소셜 회원가입은 현재 지원하지 않음
  };

  const handleViewAllCommunity = () => navigateTo('community-main');
  const handleSelectArtist = (artistId: number) => {
    navigateTo('artist-profile', { selectedArtistId: artistId });
  };

  const handleViewProject = (projectId: number) => {
    navigateTo('project-detail', { selectedProjectId: projectId });
  };

  const handlePostClick = (postId: string) => {
    navigateTo('post-detail', { selectedPostId: postId });
  };

  const handleCreatePost = () => {
    // 로그인 체크 후 새글 작성 페이지로 이동
    if (!isAuthenticated) {
      navigateTo('login');
    } else {
      navigateTo('create-post');
    }
  };
  const handleViewArtistCommunity = (artistId: number) => {
    navigateTo('artist-profile', { selectedArtistId: artistId });
  };
  const handleBackToCommunity = () => navigateTo('community-full');
  const handleBackToHome = () => navigateTo('home');

  const headerProps = {
    activeSection: currentView,
    onNavigate: handleNavigation,
    isLoggedIn: isAuthenticated,
    userRole: user?.role || 'fan',
    onLogin: () => navigateTo('login'),
    onGoBack: goBack,
    canGoBack: canGoBack
  };

  // 디버깅: 인증 상태 로그


  // Auth Pages
  if (currentView === 'login') {
    return (
      <LoginPage
        onBack={handleBackToHome}
        onLogin={handleLogin}
        onSignupClick={() => navigateTo('signup')}
      />
    );
  }

  if (currentView === 'signup') {
    return (
      <SignupPage
        onBack={handleBackToHome}
        onSignup={handleSignup}
        onSocialSignup={handleSocialSignup}
        onLoginClick={() => navigateTo('login')}
      />
    );
  }

  // App Layout with Header
  const AppLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-white">
      <Header {...headerProps} />
      {children}
    </div>
  );

  // Dashboard Pages
  if (currentView === 'dashboard') {
    return (
      <AppLayout>
        <ProtectedRoute
          requiredRole="artist"
          onNavigateToLogin={() => navigateTo('login')}
          onNavigateToSignup={() => navigateTo('signup')}
        >
          <ArtistDashboard />
        </ProtectedRoute>
      </AppLayout>
    );
  }

  if (currentView === 'mypage') {
    return (
      <AppLayout>
        <ProtectedRoute
          onNavigateToLogin={() => navigateTo('login')}
          onNavigateToSignup={() => navigateTo('signup')}
        >
          {user?.role === 'artist' ? <ArtistMyPage /> : <FanMyPage />}
        </ProtectedRoute>
      </AppLayout>
    );
  }

  if (currentView === 'admin') {
    return (
      <AppLayout>
        <ProtectedRoute
          requiredRole="admin"
          onNavigateToLogin={() => navigateTo('login')}
          onNavigateToSignup={() => navigateTo('signup')}
        >
          <AdminDashboard onBack={handleBackToHome} />
        </ProtectedRoute>
      </AppLayout>
    );
  }

  if (currentView === 'gallery') {
    return (
      <AppLayout>
        <ProtectedRoute
          requiredRole="artist"
          onNavigateToLogin={() => navigateTo('login')}
          onNavigateToSignup={() => navigateTo('signup')}
        >
          <ArtistGallery onBack={handleBackToHome} />
        </ProtectedRoute>
      </AppLayout>
    );
  }

  if (currentView === 'community-full') {
    return (
      <AppLayout>
        <CommunityFull
          onBack={handleBackToHome}
          onSelectArtist={handleSelectArtist}
        />
      </AppLayout>
    );
  }

  if (currentView === 'community-main') {
    return (
      <AppLayout>
        <ProtectedRoute
          onNavigateToLogin={() => navigateTo('login')}
          onNavigateToSignup={() => navigateTo('signup')}
        >
          <CommunityMain onBack={handleBackToHome} />
        </ProtectedRoute>
      </AppLayout>
    );
  }

  if (currentView === 'artist-profile' && selectedArtistId) {
    return (
      <AppLayout>
        <ProtectedRoute
          onNavigateToLogin={() => setCurrentView('login')}
          onNavigateToSignup={() => setCurrentView('signup')}
        >
          <ArtistProfile
            artistId={selectedArtistId}
            onBack={handleBackToCommunity}
          />
        </ProtectedRoute>
      </AppLayout>
    );
  }

  if (currentView === 'project-detail' && selectedProjectId) {
    return (
      <AppLayout>
        <ProjectDetail
          projectId={selectedProjectId}
          onBack={() => setCurrentView('home')}
        />
      </AppLayout>
    );
  }

  if (currentView === 'event-detail' && selectedEventId) {
    return (
      <AppLayout>
        <EventDetail
          eventId={selectedEventId}
          onBack={() => setCurrentView('home')}
        />
      </AppLayout>
    );
  }

  if (currentView === 'search' && searchQuery) {
    return (
      <AppLayout>
        <SearchResults
          query={searchQuery}
          onBack={() => setCurrentView('home')}
        />
      </AppLayout>
    );
  }

  if (currentView === 'post-detail' && selectedPostId) {
    return (
      <AppLayout>
        <CommunityPostDetail
          postId={selectedPostId}
          onBack={() => setCurrentView('community-main')}
        />
      </AppLayout>
    );
  }

  if (currentView === 'create-post') {
    return (
      <AppLayout>
        <CommunityPostForm onBack={() => setCurrentView('community-main')} />
      </AppLayout>
    );
  }

  if (currentView === 'about') {
    return (
      <AppLayout>
        <About onBack={handleBackToHome} />
      </AppLayout>
    );
  }

  if (currentView === 'events') {
    return (
      <AppLayout>
        <EventsSection />
      </AppLayout>
    );
  }

  // Main Home Page
  return (
    <AppLayout>
      <main>
        <HeroSection onViewArtistCommunity={handleViewArtistCommunity} onNavigate={handleNavigation} />
        <div id="projects">
          <FundingProjects onViewProject={handleViewProject} />
        </div>
        <div id="artists">
          <ArtistSection />
        </div>
        <div id="live">
          <LiveAndPointsSection />
        </div>
        <div id="community">
          <CommunitySection onViewAllCommunity={handleViewAllCommunity} onPostClick={handlePostClick} onCreatePost={handleCreatePost} onNavigate={handleNavigation} />
        </div>
        <QuickLinksSection onNavigate={handleNavigation} />
        <Footer />
      </main>
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HistoryProvider>
        <AppContent />
      </HistoryProvider>
    </AuthProvider>
  );
}