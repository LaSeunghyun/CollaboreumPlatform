import { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { FundingProjectCard } from "./components/FundingProjectCard";
import { ArtistCard } from "./components/ArtistCard";
import { EventCard } from "./components/EventCard";
import { CommunityBoardPost } from "./components/CommunityBoardPost";
import { NoticePost } from "./components/NoticePost";
import { Toast } from "./components/Toast";
import { 
  Search, 
  Filter, 
  Bell, 
  Plus, 
  TrendingUp, 
  Clock, 
  Users2, 
  Heart,
  Grid3X3,
  List,
  Calendar,
  Star,
  Award,
  BarChart3,
  MessageSquare,
  Settings,
  User,
  LogOut,
  AlertCircle,
  Menu,
  X
} from "lucide-react";

// Mock Data
const mockProjects = [
  {
    id: "1",
    title: "독립 아티스트의 첫 번째 앨범 제작 프로젝트",
    artist: "김예리",
    category: "음악",
    thumbnail: "https://images.unsplash.com/photo-1617469859390-a3a579d11041?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpY2lhbiUyMGFydGlzdCUyMHJlY29yZGluZyUyMHN0dWRpb3xlbnwxfHx8fDE3NTcyMjQ5NzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    currentAmount: 8500000,
    targetAmount: 12000000,
    backers: 124,
    daysLeft: 15
  },
  {
    id: "2",
    title: "모던 아트 갤러리 전시 기획",
    artist: "박현우",
    category: "미술",
    thumbnail: "https://images.unsplash.com/photo-1552154083-5084dff5fb02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGZ1bmRpbmclMjBhcnQlMjBwcm9qZWN0fGVufDF8fHx8MTc1NzIyNDk3Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    currentAmount: 4200000,
    targetAmount: 8000000,
    backers: 87,
    daysLeft: 22
  },
  {
    id: "3",
    title: "인터랙티브 디지털 아트 인스톨레이션",
    artist: "이수진",
    category: "디지털아트",
    thumbnail: "https://images.unsplash.com/photo-1676238560626-45d35b63b38f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYXJ0JTIwdGVjaG5vbG9neSUyMGRlc2lnbnxlbnwxfHx8fDE3NTcyMjQ5Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    currentAmount: 15600000,
    targetAmount: 15000000,
    backers: 234,
    daysLeft: 8
  }
];

const mockArtists = [
  {
    id: "1",
    name: "김예리",
    avatar: "https://images.unsplash.com/photo-1730148137959-0dd8a27dead5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjBwb3J0cmFpdCUyMG11c2ljaWFuJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzU3MjI1NzM0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    coverImage: "https://images.unsplash.com/photo-1617469859390-a3a579d11041?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpY2lhbiUyMGFydGlzdCUyMHJlY29yZGluZyUyMHN0dWRpb3xlbnwxfHx8fDE3NTcyMjQ5NzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "음악",
    tags: ["인디", "어쿠스틱", "싱어송라이터"],
    featuredWork: "첫 번째 앨범 제작 프로젝트",
    followers: 1234,
    isFollowing: false,
    isVerified: true,
    bio: "5년간 인디 씬에서 활동하며 진정성 있는 음악을 만들어가고 있습니다."
  },
  {
    id: "2",
    name: "박현우",
    avatar: "https://images.unsplash.com/photo-1613746203812-717e6e5db3da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWludGluZyUyMGFydGlzdCUyMHN0dWRpbyUyMGNyZWF0aXZlfGVufDF8fHx8MTc1NzIyNTc0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    coverImage: "https://images.unsplash.com/photo-1552154083-5084dff5fb02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGZ1bmRpbmclMjBhcnQlMjBwcm9qZWN0fGVufDF8fHx8MTc1NzIyNDk3Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "미술",
    tags: ["모던아트", "설치미술", "갤러리"],
    featuredWork: "모던 아트 갤러리 전시",
    followers: 856,
    isFollowing: true,
    isVerified: false,
    bio: "현대 미술의 새로운 시각을 제시하는 작업을 하고 있습니다."
  },
  {
    id: "3",
    name: "이수진",
    avatar: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYXJ0aXN0JTIwZGVzaWduZXIlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzU3MjI1NzM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    coverImage: "https://images.unsplash.com/photo-1676238560626-45d35b63b38f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYXJ0JTIwdGVjaG5vbG9neSUyMGRlc2lnbnxlbnwxfHx8fDE3NTcyMjQ5Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "디지털아트",
    tags: ["인터랙티브", "미디어아트", "기술"],
    featuredWork: "인터랙티브 디지털 아트",
    followers: 2108,
    isFollowing: false,
    isVerified: true,
    bio: "기술과 예술의 융합을 통해 새로운 경험을 만들어갑니다."
  }
];

const mockEvents = [
  {
    id: "1",
    title: "2024 신진 아티스트 지원 캠페인",
    type: "campaign" as const,
    image: "https://images.unsplash.com/photo-1644959166965-8606f1ce1f06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldmVudCUyMGZlc3RpdmFsJTIwY29uY2VydCUyMGNyb3dkfGVufDF8fHx8MTc1NzIyNTc0M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "신진 아티스트들의 창작 활동을 지원하는 특별 캠페인입니다.",
    startDate: "2024-02-01",
    endDate: "2024-02-28",
    participants: 156,
    maxParticipants: 200,
    status: "ongoing" as const
  },
  {
    id: "2",
    title: "아티스트 x 브랜드 콜라보 프로젝트",
    type: "collaboration" as const,
    image: "https://images.unsplash.com/photo-1552154083-5084dff5fb02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGZ1bmRpbmclMjBhcnQlMjBwcm9qZWN0fGVufDF8fHx8MTc1NzIyNDk3Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "유명 브랜드와 함께하는 특별한 콜라보레이션 기회입니다.",
    startDate: "2024-03-15",
    status: "upcoming" as const
  }
];

const mockNotices = [
  {
    id: "1",
    title: "Collaboreum 2024 신규 기능 업데이트 안내",
    content: "안녕하세요! 새로운 기능들이 업데이트되었습니다. 아티스트 검증 시스템, 향상된 펀딩 시스템, 투명한 수수료 정책 등 다양한 개선사항을 확인해보세요. 더욱 신뢰할 수 있는 창작 생태계를 만들어가겠습니다.",
    createdAt: "2024-01-15T09:00:00Z",
    views: 2145,
    isPinned: true,
    isImportant: true
  },
  {
    id: "2",
    title: "2024년 1분기 아티스트 지원 프로그램 안내",
    content: "신진 아티스트들을 위한 특별 지원 프로그램을 시작합니다. 펀딩 수수료 할인, 마케팅 지원, 멘토링 프로그램 등 다양한 혜택을 제공합니다. 자세한 내용과 신청 방법을 확인해보세요.",
    createdAt: "2024-01-12T14:00:00Z",
    views: 1567,
    isPinned: false,
    isImportant: false
  },
  {
    id: "3",
    title: "서비스 이용약관 및 개인정보 처리방침 개정 안내",
    content: "더욱 투명하고 공정한 서비스 제공을 위해 이용약관과 개인정보 처리방침을 개정했습니다. 주요 변경사항과 적용일정을 안내드립니다.",
    createdAt: "2024-01-10T10:30:00Z",
    views: 892,
    isPinned: false,
    isImportant: false
  }
];

const mockCommunityPosts = [
  {
    id: "2",
    title: "첫 펀딩 프로젝트 성공 후기입니다!",
    content: "드디어 첫 펀딩이 성공했어요! 많은 분들의 응원 덕분에 목표 금액을 달성할 수 있었습니다. 정말 감사합니다.",
    author: {
      name: "김예리",
      avatar: "https://images.unsplash.com/photo-1730148137959-0dd8a27dead5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjBwb3J0cmFpdCUyMG11c2ljaWFuJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzU3MjI1NzM0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      isVerified: true
    },
    category: "review" as const,
    createdAt: "2024-01-14T18:30:00Z",
    views: 567,
    likes: 124,
    comments: 45,
    isHot: true
  },
  {
    id: "3",
    title: "펀딩 프로젝트 기획할 때 주의사항이 있을까요?",
    content: "처음 펀딩을 진행하려고 하는데, 어떤 점들을 유의해야 할지 궁금합니다. 경험자분들의 조언 부탁드려요!",
    author: {
      name: "새내기아티스트",
      avatar: "",
      isVerified: false
    },
    category: "question" as const,
    createdAt: "2024-01-14T14:20:00Z",
    views: 234,
    likes: 12,
    comments: 18
  },
  {
    id: "4",
    title: "아티스트와 팬의 소통, 어떻게 하면 더 좋을까요?",
    content: "프로젝트를 진행하면서 후원자분들과 더 깊이 있는 소통을 하고 싶어요. 좋은 아이디어가 있으면 공유해주세요!",
    author: {
      name: "박현우",
      avatar: "https://images.unsplash.com/photo-1613746203812-717e6e5db3da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWludGluZyUyMGFydGlzdCUyMHN0dWRpbyUyMGNyZWF0aXZlfGVufDF8fHx8MTc1NzIyNTc0MHww&ixlib=rb-4.1.0&q=80&w=1080",
      isVerified: false
    },
    category: "free" as const,
    createdAt: "2024-01-13T16:45:00Z",
    views: 145,
    likes: 8,
    comments: 12
  }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [communityTab, setCommunityTab] = useState("all");
  const [projectSort, setProjectSort] = useState("deadline");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const filteredArtists = mockArtists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artist.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || artist.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProjects = [...mockProjects].sort((a, b) => {
    if (projectSort === "deadline") return a.daysLeft - b.daysLeft;
    if (projectSort === "amount") return b.currentAmount - a.currentAmount;
    if (projectSort === "new") return new Date(b.id).getTime() - new Date(a.id).getTime();
    return 0;
  });

  const filteredCommunityPosts = mockCommunityPosts.filter(post => {
    if (communityTab === "all") return true;
    return post.category === communityTab;
  });

  return (
    <div className="min-h-screen bg-background">
      <Toast />
      
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 
                className="text-xl font-semibold text-indigo cursor-pointer" 
                onClick={() => {
                  setCurrentPage("home");
                  setShowMobileMenu(false);
                }}
              >
                Collaboreum
              </h1>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <button 
                  onClick={() => setCurrentPage("home")}
                  className={`text-sm transition-colors hover-scale ${currentPage === "home" ? "text-indigo font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  홈
                </button>
                <button 
                  onClick={() => setCurrentPage("artists")}
                  className={`text-sm transition-colors hover-scale ${currentPage === "artists" ? "text-indigo font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  아티스트
                </button>
                <button 
                  onClick={() => setCurrentPage("projects")}
                  className={`text-sm transition-colors hover-scale ${currentPage === "projects" ? "text-indigo font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  프로젝트
                </button>
                <button 
                  onClick={() => setCurrentPage("notice")}
                  className={`text-sm transition-colors hover-scale ${currentPage === "notice" ? "text-indigo font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  공지
                </button>
                <button 
                  onClick={() => setCurrentPage("community")}
                  className={`text-sm transition-colors hover-scale ${currentPage === "community" ? "text-indigo font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  커뮤니티
                </button>
                <button 
                  onClick={() => setCurrentPage("events")}
                  className={`text-sm transition-colors hover-scale ${currentPage === "events" ? "text-indigo font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  이벤트
                </button>
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-3">
                {isLoggedIn ? (
                  <>
                    <Button variant="ghost" size="sm" className="hover-scale">
                      <Bell className="w-4 h-4" />
                    </Button>
                    <div className="relative">
                      <Avatar 
                        className="w-8 h-8 cursor-pointer hover-scale transition-transform" 
                        onClick={() => setCurrentPage("mypage")}
                      >
                        <AvatarImage src="https://images.unsplash.com/photo-1730148137959-0dd8a27dead5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjBwb3J0cmFpdCUyMG11c2ljaWFuJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzU3MjI1NzM0fDA&ixlib=rb-4.1.0&q=80&w=1080" />
                        <AvatarFallback>김</AvatarFallback>
                      </Avatar>
                    </div>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hover-scale transition-button"
                      onClick={() => setIsLoggedIn(true)}
                    >
                      로그인
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-indigo hover:bg-indigo-hover hover-scale transition-button shadow-sm"
                      onClick={() => setIsLoggedIn(true)}
                    >
                      회원가입
                    </Button>
                  </>
                )}
              </div>
              
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 space-y-4">
              <nav className="flex flex-col space-y-3">
                <button 
                  onClick={() => {
                    setCurrentPage("home");
                    setShowMobileMenu(false);
                  }}
                  className={`text-left py-2 px-3 rounded-lg transition-colors ${currentPage === "home" ? "bg-indigo/10 text-indigo font-medium" : "text-muted-foreground hover:bg-surface"}`}
                >
                  홈
                </button>
                <button 
                  onClick={() => {
                    setCurrentPage("artists");
                    setShowMobileMenu(false);
                  }}
                  className={`text-left py-2 px-3 rounded-lg transition-colors ${currentPage === "artists" ? "bg-indigo/10 text-indigo font-medium" : "text-muted-foreground hover:bg-surface"}`}
                >
                  아티스트
                </button>
                <button 
                  onClick={() => {
                    setCurrentPage("projects");
                    setShowMobileMenu(false);
                  }}
                  className={`text-left py-2 px-3 rounded-lg transition-colors ${currentPage === "projects" ? "bg-indigo/10 text-indigo font-medium" : "text-muted-foreground hover:bg-surface"}`}
                >
                  프로젝트
                </button>
                <button 
                  onClick={() => {
                    setCurrentPage("notice");
                    setShowMobileMenu(false);
                  }}
                  className={`text-left py-2 px-3 rounded-lg transition-colors ${currentPage === "notice" ? "bg-indigo/10 text-indigo font-medium" : "text-muted-foreground hover:bg-surface"}`}
                >
                  공지
                </button>
                <button 
                  onClick={() => {
                    setCurrentPage("community");
                    setShowMobileMenu(false);
                  }}
                  className={`text-left py-2 px-3 rounded-lg transition-colors ${currentPage === "community" ? "bg-indigo/10 text-indigo font-medium" : "text-muted-foreground hover:bg-surface"}`}
                >
                  커뮤니티
                </button>
                <button 
                  onClick={() => {
                    setCurrentPage("events");
                    setShowMobileMenu(false);
                  }}
                  className={`text-left py-2 px-3 rounded-lg transition-colors ${currentPage === "events" ? "bg-indigo/10 text-indigo font-medium" : "text-muted-foreground hover:bg-surface"}`}
                >
                  이벤트
                </button>
              </nav>
              
              {/* Mobile Auth Actions */}
              <div className="pt-3 border-t border-border">
                {isLoggedIn ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="https://images.unsplash.com/photo-1730148137959-0dd8a27dead5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjBwb3J0cmFpdCUyMG11c2ljaWFuJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzU3MjI1NzM0fDA&ixlib=rb-4.1.0&q=80&w=1080" />
                        <AvatarFallback>김</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">김예리</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setCurrentPage("mypage");
                          setShowMobileMenu(false);
                        }}
                      >
                        마이페이지
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Bell className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setIsLoggedIn(true);
                        setShowMobileMenu(false);
                      }}
                    >
                      로그인
                    </Button>
                    <Button 
                      className="flex-1 bg-indigo hover:bg-indigo-hover"
                      onClick={() => {
                        setIsLoggedIn(true);
                        setShowMobileMenu(false);
                      }}
                    >
                      회원가입
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* Home Page */}
        {currentPage === "home" && (
          <div className="space-y-8 md:space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-8 md:space-y-12 py-12 md:py-20 lg:py-24 relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo/5 via-sky/5 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(79,70,229,0.1),transparent_50%)] pointer-events-none" />
              
              <div className="relative z-10 space-y-8 md:space-y-12 px-4">
                <div className="space-y-6 md:space-y-8">
                  <div className="space-y-4 md:space-y-6">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[0.95] tracking-tight">
                      <span className="block bg-gradient-to-r from-indigo via-sky to-indigo bg-clip-text text-transparent">
                        아티스트와 팬이 함께 만드는
                      </span>
                      <span className="block bg-gradient-to-r from-sky via-indigo to-sky bg-clip-text text-transparent mt-2">
                        크리에이티브 생태계
                      </span>
                    </h1>
                    
                    <div className="max-w-4xl mx-auto space-y-3 md:space-y-4 pt-4">
                      <p className="text-xl md:text-2xl lg:text-3xl text-foreground/90 leading-relaxed font-medium">
                        독립 아티스트의 꿈을 현실로 만들고, 팬들과 함께 성장하는 새로운 플랫폼.
                      </p>
                      <p className="text-lg md:text-xl text-muted-foreground/80 leading-relaxed">
                        신뢰와 투명성을 바탕으로 건강한 예술 생태계를 구축합니다.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 md:gap-5 max-w-3xl mx-auto pt-2">
                  <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      placeholder="아티스트, 프로젝트를 검색해보세요..." 
                      className="pl-12 h-12 md:h-14 text-base md:text-lg border-2 focus:border-indigo/50 bg-white/80 backdrop-blur w-full rounded-2xl shadow-sm"
                    />
                  </div>
                  <Button 
                    size="lg" 
                    className="bg-indigo hover:bg-indigo-hover text-white h-12 md:h-14 px-8 md:px-10 hover-scale transition-button shadow-lg text-base md:text-lg font-semibold w-full sm:w-auto rounded-2xl"
                  >
                    {isLoggedIn ? "프로젝트 만들기" : "지금 시작하기"}
                  </Button>
                </div>
                
                {/* Stats - Enhanced layout */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-8 md:pt-12 max-w-4xl mx-auto">
                  <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-indigo/10">
                    <div className="flex items-center gap-2">
                      <Users2 className="w-5 h-5 text-indigo" />
                      <span className="text-sm text-muted-foreground">아티스트</span>
                    </div>
                    <span className="text-2xl md:text-3xl font-bold text-indigo tabular-nums">1,200+</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-sky/10">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-sky" />
                      <span className="text-sm text-muted-foreground">진행 프로젝트</span>
                    </div>
                    <span className="text-2xl md:text-3xl font-bold text-sky tabular-nums">340+</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-red-100">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-muted-foreground">총 후원금액</span>
                    </div>
                    <span className="text-2xl md:text-3xl font-bold text-red-500 tabular-nums">12억원+</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Artists */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2>주목받는 아티스트</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage("artists")}
                >
                  더보기
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {mockArtists.slice(0, 3).map((artist) => (
                  <ArtistCard key={artist.id} {...artist} />
                ))}
              </div>
            </section>

            {/* Featured Projects */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2>진행 중인 프로젝트</h2>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-indigo/10 text-indigo">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    인기순
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    마감임박
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {mockProjects.map((project) => (
                  <FundingProjectCard key={project.id} {...project} />
                ))}
              </div>
            </section>

            {/* Notice Preview */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2>중요 공지사항</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage("notice")}
                >
                  전체보기
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockNotices.slice(0, 2).map((notice) => (
                  <Card key={notice.id} className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-indigo">
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-indigo text-white text-xs">
                            공지사항
                          </Badge>
                          {notice.isImportant && (
                            <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                              중요
                            </Badge>
                          )}
                          {notice.isPinned && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">
                              📌
                            </Badge>
                          )}
                        </div>
                        <h3 className="line-clamp-2">{notice.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notice.content}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                          <span className="font-medium">Collaboreum 운영팀</span>
                          <div className="flex items-center gap-3">
                            <span>조회 {notice.views.toLocaleString()}</span>
                            <span>{new Date(notice.createdAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Community Preview */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2>커뮤니티 인기글</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage("community")}
                >
                  더보기
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockCommunityPosts.slice(0, 4).map((post) => (
                  <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              post.category === "review" ? "bg-green-100 text-green-700" :
                              post.category === "question" ? "bg-blue-100 text-blue-700" :
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {post.category === "review" && "후기"}
                            {post.category === "question" && "질문"}
                            {post.category === "free" && "자유"}
                          </Badge>
                          {post.isHot && (
                            <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                              🔥 HOT
                            </Badge>
                          )}
                        </div>
                        <h3 className="line-clamp-2">{post.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>{post.author.name}</span>
                            {post.author.isVerified && (
                              <div className="w-3 h-3 bg-sky rounded-full flex items-center justify-center">
                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span>👍 {post.likes}</span>
                            <span>💬 {post.comments}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Artists Page */}
        {currentPage === "artists" && (
          <div className="space-y-8">
            <div className="space-y-6">
              <div>
                <h1>아티스트</h1>
                <p className="text-muted-foreground">재능 있는 아티스트들을 발견하고 팔로우하세요</p>
              </div>
              
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="아티스트 이름, 분야 검색..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="분야 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 분야</SelectItem>
                    <SelectItem value="음악">음악</SelectItem>
                    <SelectItem value="미술">미술</SelectItem>
                    <SelectItem value="디지털아트">디지털아트</SelectItem>
                    <SelectItem value="사진">사진</SelectItem>
                    <SelectItem value="영상">영상</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue="hot" className="space-y-6">
              <TabsList>
                <TabsTrigger value="hot">핫한 아티스트</TabsTrigger>
                <TabsTrigger value="new">신규 아티스트</TabsTrigger>
                <TabsTrigger value="all">전체 아티스트</TabsTrigger>
              </TabsList>
              
              <TabsContent value="hot" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArtists
                    .sort((a, b) => b.followers - a.followers)
                    .map((artist) => (
                      <ArtistCard key={artist.id} {...artist} />
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="new" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArtists
                    .sort((a, b) => b.id.localeCompare(a.id))
                    .map((artist) => (
                      <ArtistCard key={artist.id} {...artist} />
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="all" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArtists.map((artist) => (
                    <ArtistCard key={artist.id} {...artist} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Projects Page */}
        {currentPage === "projects" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1>펀딩 프로젝트</h1>
                <p className="text-muted-foreground">아티스트의 꿈을 응원하고 함께 성장하세요</p>
              </div>
              {isLoggedIn && (
                <Button className="bg-indigo hover:bg-indigo-hover hover-scale transition-button shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  프로젝트 등록
                </Button>
              )}
            </div>
            
            <Tabs defaultValue="ongoing" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="ongoing">진행 중인 펀딩</TabsTrigger>
                <TabsTrigger value="all">전체 프로젝트</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Select value={projectSort} onValueChange={setProjectSort}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="정렬 방식" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deadline">마감임박순</SelectItem>
                    <SelectItem value="amount">후원액순</SelectItem>
                    <SelectItem value="new">신규등록순</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                    <Clock className="w-3 h-3 mr-1" />
                    마감임박
                  </Badge>
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                    <Star className="w-3 h-3 mr-1" />
                    추천
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    인기
                  </Badge>
                </div>
              </div>
              
              <TabsContent value="ongoing" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProjects.filter(project => project.daysLeft > 0).map((project) => (
                    <FundingProjectCard key={project.id} {...project} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="all" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProjects.map((project) => (
                    <FundingProjectCard key={project.id} {...project} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Notice Page */}
        {currentPage === "notice" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1>공지사항</h1>
                <p className="text-muted-foreground">Collaboreum의 최신 소식과 정책을 확인하세요</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-indigo/10 text-indigo">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  OFFICIAL
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="공지사항 검색..." className="pl-10" />
              </div>
              <Select defaultValue="latest">
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="views">조회순</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {mockNotices.map((notice) => (
                    <NoticePost key={notice.id} {...notice} />
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Empty State for No Search Results */}
            {mockNotices.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">검색된 공지사항이 없습니다.</p>
              </div>
            )}
          </div>
        )}

        {/* Community Page */}
        {currentPage === "community" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1>커뮤니티</h1>
                <p className="text-muted-foreground">아티스트와 팬이 함께 만드는 소통의 공간</p>
              </div>
              {isLoggedIn && (
                <Button className="bg-indigo hover:bg-indigo-hover hover-scale transition-button shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  글쓰기
                </Button>
              )}
            </div>
            
            <Tabs value={communityTab} onValueChange={setCommunityTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 max-w-md">
                <TabsTrigger value="question">질문</TabsTrigger>
                <TabsTrigger value="review">후기</TabsTrigger>
                <TabsTrigger value="free">자유</TabsTrigger>
                <TabsTrigger value="all">전체</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="게시글 검색..." className="pl-10" />
                </div>
                <Select defaultValue="latest">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">최신순</SelectItem>
                    <SelectItem value="popular">인기순</SelectItem>
                    <SelectItem value="comments">댓글순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Card className="shadow-sm">
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredCommunityPosts.length > 0 ? (
                      filteredCommunityPosts.map((post) => (
                        <CommunityBoardPost key={post.id} {...post} />
                      ))
                    ) : (
                      <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2">아직 글이 없습니다</h3>
                        <p className="text-muted-foreground mb-6">
                          {communityTab === "question" && "첫 번째 질문을 올려보세요!"}
                          {communityTab === "review" && "첫 번째 후기를 공유해보세요!"}
                          {communityTab === "free" && "자유롭게 이야기를 시작해보세요!"}
                          {communityTab === "all" && "첫 번째 이야기를 남겨보세요!"}
                        </p>
                        {isLoggedIn && (
                          <Button className="bg-indigo hover:bg-indigo-hover">
                            <Plus className="w-4 h-4 mr-2" />
                            글쓰기
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Tabs>
          </div>
        )}

        {/* Events Page */}
        {currentPage === "events" && (
          <div className="space-y-8">
            <div>
              <h1>이벤트</h1>
              <p className="text-muted-foreground">특별한 캠페인과 콜라보레이션에 참여하세요</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Calendar className="w-3 h-3 mr-1" />
                  진행 중
                </Badge>
                <Badge variant="outline">
                  예정
                </Badge>
                <Badge variant="outline">
                  종료
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          </div>
        )}

        {/* MyPage */}
        {currentPage === "mypage" && isLoggedIn && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1>마이페이지</h1>
                <p className="text-muted-foreground">내 활동과 프로젝트를 관리하세요</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  설정
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsLoggedIn(false)}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </Button>
              </div>
            </div>
            
            {/* User Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src="https://images.unsplash.com/photo-1730148137959-0dd8a27dead5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjBwb3J0cmFpdCUyMG11c2ljaWFuJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzU3MjI1NzM0fDA&ixlib=rb-4.1.0&q=80&w=1080" />
                    <AvatarFallback>김</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3>김예리</h3>
                    <p className="text-sm text-muted-foreground">kim.yeri@example.com</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>팔로워 1,234명</span>
                      <span>팔로잉 567명</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-indigo" />
                    <span className="text-sm text-muted-foreground">진행 중인 프로젝트</span>
                  </div>
                  <p className="text-2xl">2개</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">후원한 프로젝트</span>
                  </div>
                  <p className="text-2xl">5개</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-sky" />
                    <span className="text-sm text-muted-foreground">커뮤니티 활동</span>
                  </div>
                  <p className="text-2xl">23개</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">달성한 목표</span>
                  </div>
                  <p className="text-2xl">1개</p>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="my-projects" className="space-y-6">
              <TabsList>
                <TabsTrigger value="my-projects">내 프로젝트</TabsTrigger>
                <TabsTrigger value="backed-projects">후원한 프로젝트</TabsTrigger>
                <TabsTrigger value="community-activity">커뮤니티 활동</TabsTrigger>
                <TabsTrigger value="settings">설정</TabsTrigger>
              </TabsList>
              
              <TabsContent value="my-projects" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3>내 프로젝트</h3>
                  <Button className="bg-indigo hover:bg-indigo/90">
                    <Plus className="w-4 h-4 mr-2" />
                    새 프로젝트
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockProjects.slice(0, 1).map((project) => (
                    <FundingProjectCard key={project.id} {...project} />
                  ))}
                  
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="w-12 h-12 bg-indigo/10 rounded-full flex items-center justify-center mx-auto">
                        <Plus className="w-6 h-6 text-indigo" />
                      </div>
                      <div>
                        <h3 className="mb-2">새 프로젝트 시작</h3>
                        <p className="text-sm text-muted-foreground">
                          창의적인 아이디어를 현실로 만들어보세요
                        </p>
                      </div>
                      <Button className="bg-indigo hover:bg-indigo/90">
                        프로젝트 만들기
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="backed-projects" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockProjects.slice(1, 3).map((project) => (
                    <FundingProjectCard key={project.id} {...project} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="community-activity" className="space-y-6">
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {mockCommunityPosts.slice(1, 3).map((post) => (
                        <CommunityBoardPost key={post.id} {...post} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>계정 설정</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm">이메일</label>
                      <Input defaultValue="kim.yeri@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">알림 설정</label>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">프로젝트 업데이트 알림</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">커뮤니티 댓글 알림</span>
                        </label>
                      </div>
                    </div>
                    <Button className="bg-indigo hover:bg-indigo/90">
                      설정 저장
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}