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
import { isSpecialPage, scrollToSection } from './utils/navigation';
import { CommunityPostDetail } from './components/CommunityPostDetail';
import { CommunityPostForm } from './components/CommunityPostForm';

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostId] = useState<string | null>(null);
  const { user, isAuthenticated, login } = useAuth();

  // 해시 변경 감지
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'login') {
        setCurrentView('login');
      } else if (hash === 'signup') {
        setCurrentView('signup');
      } else if (hash.startsWith('search=')) {
        const query = decodeURIComponent(hash.split('=')[1]);
        setCurrentView('search');
        setSearchQuery(query);
      }
    };

    // 초기 해시 확인
    handleHashChange();

    // 해시 변경 이벤트 리스너
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigation = (section: string) => {
    setCurrentView(section);
    setSelectedArtistId(null);

    if (!isSpecialPage(section)) {
      scrollToSection(section);
      setCurrentView('home');
    }
  };

  const handleLogin = async (data: any) => {
    try {
      // data는 LoginPage에서 전달된 response.data (user와 token 포함)
      if (data && data.user && data.token) {
        // AuthContext를 통해 로그인 처리
        login(data.token, data.user);
        setCurrentView('home');
      } else {
        console.error('로그인 데이터 형식 오류:', data);
        // 에러 처리는 LoginPage에서 이미 하고 있음
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      // 에러 처리는 LoginPage에서 이미 하고 있음
    }
  };

  const handleSignup = (data: any) => {
    // 회원가입 완료 후 홈으로 이동
    setCurrentView('home');
  };

  const handleSocialSignup = (provider: string, userType: string) => {
    // 소셜 회원가입은 현재 지원하지 않음
  };

  const handleViewAllCommunity = () => setCurrentView('community-main');
  const handleSelectArtist = (artistId: number) => {
    setSelectedArtistId(artistId);
    setCurrentView('artist-profile');
  };

  const handleViewProject = (projectId: number) => {
    setSelectedProjectId(projectId);
    setCurrentView('project-detail');
  };

  const handlePostClick = (postId: string) => {
    // 포스트 상세 페이지로 이동 (향후 구현)
    console.log('포스트 클릭:', postId);
    // setCurrentView('post-detail');
  };

  const handleCreatePost = () => {
    // 로그인 체크 후 새글 작성 페이지로 이동
    if (!isAuthenticated) {
      setCurrentView('login');
    } else {
      // 새글 작성 페이지로 이동 (향후 구현)
      console.log('새글 작성 페이지로 이동');
      // setCurrentView('create-post');
    }
  };
  const handleViewArtistCommunity = (artistId: number) => {
    setSelectedArtistId(artistId);
    setCurrentView('artist-profile');
  };
  const handleBackToCommunity = () => setCurrentView('community-full');
  const handleBackToHome = () => setCurrentView('home');

  const headerProps = {
    activeSection: currentView,
    onNavigate: handleNavigation,
    isLoggedIn: isAuthenticated,
    userRole: user?.role || 'fan',
    onLogin: () => setCurrentView('login')
  };

  // 디버깅: 인증 상태 로그


  // Auth Pages
  if (currentView === 'login') {
    return (
      <LoginPage
        onBack={handleBackToHome}
        onLogin={handleLogin}
        onSignupClick={() => setCurrentView('signup')}
      />
    );
  }

  if (currentView === 'signup') {
    return (
      <SignupPage
        onBack={handleBackToHome}
        onSignup={handleSignup}
        onSocialSignup={handleSocialSignup}
        onLoginClick={() => setCurrentView('login')}
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
          onNavigateToLogin={() => setCurrentView('login')}
          onNavigateToSignup={() => setCurrentView('signup')}
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
          onNavigateToLogin={() => setCurrentView('login')}
          onNavigateToSignup={() => setCurrentView('signup')}
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
          onNavigateToLogin={() => setCurrentView('login')}
          onNavigateToSignup={() => setCurrentView('signup')}
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
          onNavigateToLogin={() => setCurrentView('login')}
          onNavigateToSignup={() => setCurrentView('signup')}
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
          onNavigateToLogin={() => setCurrentView('login')}
          onNavigateToSignup={() => setCurrentView('signup')}
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

  // Main Home Page
  return (
    <AppLayout>
      <main>
        <HeroSection onViewArtistCommunity={handleViewArtistCommunity} />
        <div id="artists"><ArtistSection /></div>
        <div id="community"><CommunitySection onViewAllCommunity={handleViewAllCommunity} onPostClick={handlePostClick} onCreatePost={handleCreatePost} /></div>
        <div id="live"><LiveAndPointsSection /></div>
        <div id="projects"><FundingProjects onViewProject={handleViewProject} /></div>
        <Footer />
      </main>
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}