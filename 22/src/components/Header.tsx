import { Button } from "./ui/button";
import { Menu, Search, Bell } from "lucide-react";
import { useState } from "react";
import { UserMenu } from "./Header/UserMenu";
import { MobileMenu } from "./Header/MobileMenu";
import { NAVIGATION_ITEMS } from "./Header/constants";
import { UserRole } from "./Header/utils";

interface HeaderProps {
  activeSection?: string; 
  onNavigate?: (section: string) => void;
  isLoggedIn?: boolean;
  userRole?: UserRole;
  onLogin?: () => void;
  onLogout?: () => void;
}

export function Header({ 
  activeSection, 
  onNavigate, 
  isLoggedIn = false, 
  userRole = 'fan',
  onLogin,
  onLogout 
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="glass-morphism sticky top-0 z-50 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNavigation('home')}
              className="text-2xl font-semibold text-foreground hover:text-primary transition-all duration-200 cursor-pointer tracking-tight"
            >
              Collaboreum
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`relative px-4 py-2.5 text-base font-medium transition-all duration-200 cursor-pointer rounded-xl whitespace-nowrap ${
                  activeSection === item.id 
                    ? 'text-primary bg-primary/10 shadow-apple' 
                    : 'text-foreground/80 hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden xl:flex items-center bg-input-background/80 rounded-2xl px-5 py-3 min-w-[280px] backdrop-blur-sm border border-border/30">
              <Search className="h-5 w-5 text-muted-foreground mr-3" />
              <input 
                type="text" 
                placeholder="아티스트, 프로젝트 검색..." 
                className="bg-transparent outline-none text-base flex-1 text-foreground placeholder-muted-foreground"
              />
            </div>
            
            {isLoggedIn && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-11 w-11 rounded-full hover:bg-secondary/60 transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-destructive text-white rounded-full text-xs min-w-[20px] h-5 flex items-center justify-center font-medium">3</span>
              </Button>
            )}

            {/* User Menu */}
            {isLoggedIn && onLogout ? (
              <UserMenu 
                userRole={userRole}
                onNavigate={handleNavigation}
                onLogout={onLogout}
              />
            ) : (
              <Button 
                onClick={onLogin} 
                className="hidden lg:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 h-11 rounded-2xl shadow-apple transition-all duration-200 text-base"
              >
                로그인
              </Button>
            )}
            
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden h-11 w-11 rounded-full hover:bg-secondary/60"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && onLogin && (
          <MobileMenu
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            onNavigate={handleNavigation}
            onLogin={onLogin}
          />
        )}
      </div>
    </header>
  );
}