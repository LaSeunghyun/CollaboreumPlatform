import { useState } from "react";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { FundingProjects } from "./components/FundingProjects";
import { ArtistSection } from "./components/ArtistSection";
import { CommunitySection } from "./components/CommunitySection";
import { CommunityFull } from "./components/CommunityFull";
import { ArtistProfile } from "./components/ArtistProfile";
import { ArtistGallery } from "./components/ArtistGallery";
import { LiveAndPointsSection } from "./components/LiveAndPointsSection";
import { EventsSection } from "./components/EventsSection";
import { QuickLinksSection } from "./components/QuickLinksSection";
import { ArtistDashboard } from "./components/ArtistDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { FanMyPage } from "./components/FanMyPage";
import { ArtistMyPage } from "./components/ArtistMyPage";
import { FundingProjectDetail } from "./components/FundingProjectDetail";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { About } from "./components/About";
import { Footer } from "./components/Footer";
import {
  UserRole,
  mockLogin,
  mockSocialLogin,
  mockSignup,
  mockSocialSignup,
} from "./utils/auth";
import {
  scrollToSection,
  isSpecialPage,
} from "./utils/navigation";

export default function App() {
  const [currentView, setCurrentView] = useState("home");
  const [selectedArtistId, setSelectedArtistId] = useState<
    number | null
  >(null);
  const [selectedProjectId, setSelectedProjectId] = useState<
    number | null
  >(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("fan");

  const handleNavigation = (section: string) => {
    setCurrentView(section);
    setSelectedArtistId(null);
    setSelectedProjectId(null);

    if (!isSpecialPage(section)) {
      scrollToSection(section);
      setCurrentView("home");
    }
  };

  const handleLogin = (email: string, password: string) => {
    const role = mockLogin(email, password);
    setIsLoggedIn(true);
    setUserRole(role);
    setCurrentView("home");
  };

  const handleSocialLogin = (provider: string) => {
    const role = mockSocialLogin(provider);
    setIsLoggedIn(true);
    setUserRole(role);
    setCurrentView("home");
  };

  const handleSignup = (data: any) => {
    const role = mockSignup(data);
    setIsLoggedIn(true);
    setUserRole(role);
    setCurrentView("home");
  };

  const handleSocialSignup = (
    provider: string,
    userType: string,
  ) => {
    const role = mockSocialSignup(provider, userType);
    setIsLoggedIn(true);
    setUserRole(role);
    setCurrentView("home");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("fan");
    setCurrentView("home");
  };

  const handleViewAllCommunity = () =>
    setCurrentView("community-full");
  const handleSelectArtist = (artistId: number) => {
    setSelectedArtistId(artistId);
    setCurrentView("artist-profile");
  };
  const handleViewArtistCommunity = (artistId: number) => {
    setSelectedArtistId(artistId);
    setCurrentView("artist-profile");
  };
  const handleViewProject = (projectId: number) => {
    setSelectedProjectId(projectId);
    setCurrentView("project-detail");
  };
  const handleBackToCommunity = () =>
    setCurrentView("community-full");
  const handleBackToHome = () => setCurrentView("home");
  const handleBackToProjects = () => setCurrentView("home");

  const headerProps = {
    activeSection: currentView,
    onNavigate: handleNavigation,
    isLoggedIn,
    userRole,
    onLogin: () => setCurrentView("login"),
    onLogout: handleLogout,
  };

  // Auth Pages
  if (currentView === "login") {
    return (
      <LoginPage
        onBack={handleBackToHome}
        onLogin={handleLogin}
        onSocialLogin={handleSocialLogin}
        onSignupClick={() => setCurrentView("signup")}
      />
    );
  }

  if (currentView === "signup") {
    return (
      <SignupPage
        onBack={handleBackToHome}
        onSignup={handleSignup}
        onSocialSignup={handleSocialSignup}
        onLoginClick={() => setCurrentView("login")}
      />
    );
  }

  // App Layout with Header
  const AppLayout = ({
    children,
  }: {
    children: React.ReactNode;
  }) => (
    <div className="min-h-screen bg-white">
      <Header {...headerProps} />
      {children}
    </div>
  );

  // Dashboard Pages
  if (currentView === "dashboard") {
    return (
      <AppLayout>
        <ArtistDashboard />
      </AppLayout>
    );
  }

  if (currentView === "mypage") {
    return (
      <AppLayout>
        {userRole === "artist" ? (
          <ArtistMyPage />
        ) : (
          <FanMyPage />
        )}
      </AppLayout>
    );
  }

  if (currentView === "admin") {
    return (
      <AppLayout>
        <AdminDashboard onBack={handleBackToHome} />
      </AppLayout>
    );
  }

  if (currentView === "gallery") {
    return (
      <AppLayout>
        <ArtistGallery onBack={handleBackToHome} />
      </AppLayout>
    );
  }

  if (currentView === "community-full") {
    return (
      <AppLayout>
        <CommunityFull
          onBack={handleBackToHome}
          onSelectArtist={handleSelectArtist}
        />
      </AppLayout>
    );
  }

  if (currentView === "artist-profile" && selectedArtistId) {
    return (
      <AppLayout>
        <ArtistProfile
          artistId={selectedArtistId}
          onBack={handleBackToCommunity}
        />
      </AppLayout>
    );
  }

  if (currentView === "project-detail" && selectedProjectId) {
    return (
      <AppLayout>
        <FundingProjectDetail
          projectId={selectedProjectId}
          onBack={handleBackToProjects}
          isLoggedIn={isLoggedIn}
          onLoginRequired={() => setCurrentView("login")}
        />
      </AppLayout>
    );
  }

  if (currentView === "about") {
    return (
      <AppLayout>
        <About onBack={handleBackToHome} />
      </AppLayout>
    );
  }

  if (currentView === "events") {
    return (
      <AppLayout>
        <EventsSection onBack={handleBackToHome} />
      </AppLayout>
    );
  }

  // Main Home Page
  return (
    <AppLayout>
      <main>
        <HeroSection
          onViewArtistCommunity={handleViewArtistCommunity}
        />
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
          <CommunitySection
            onViewAllCommunity={handleViewAllCommunity}
          />
        </div>
        <QuickLinksSection onNavigate={handleNavigation} />
      </main>
      <Footer />
    </AppLayout>
  );
}