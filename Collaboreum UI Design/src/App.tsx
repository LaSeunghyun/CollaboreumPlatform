import React, { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { SegmentedTabs } from "./components/ui/SegmentedTabs";
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

// Tabs 관련 컴포넌트 import 추가 (에러 수정)
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";

// API 서비스 import 추가
import {
  fundingAPI,
  artistAPI,
  eventManagementAPI,
  communityPostAPI,
  communityAPI
} from "../../src/services/api";

// 데이터 타입 정의
interface Project {
  id: string;
  title: string;
  artist: string;
  category: string;
  thumbnail: string;
  currentAmount: number;
  targetAmount: number;
  backers: number;
  daysLeft: number;
}

interface Artist {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  category: string;
  tags: string[];
  featuredWork: string;
  followers: number;
  isFollowing: boolean;
  isVerified: boolean;
  bio: string;
}

interface Event {
  id: string;
  title: string;
  type: "campaign" | "collaboration";
  image: string;
  description: string;
  startDate: string;
  endDate?: string;
  participants: number;
  maxParticipants?: number;
  status: "ongoing" | "upcoming" | "ended";
}

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  views: number;
  isPinned: boolean;
  isImportant: boolean;
}

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  category: "review" | "question" | "free";
  createdAt: string;
  views: number;
  likes: number;
  comments: number;
  isHot?: boolean;
}

type PageType = "home" | "artists" | "projects" | "notice" | "community" | "events" | "mypage";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [communityTab, setCommunityTab] = useState("all");
  const [projectSort, setProjectSort] = useState("deadline");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // API 데이터 상태
  const [projects, setProjects] = useState<Project[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로딩 함수들
  const fetchProjects = async () => {
    try {
      const response = await fundingAPI.getProjects() as any;
      if (response.success && response.data?.projects) {
        setProjects(response.data.projects);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('프로젝트 데이터 로딩 실패:', error);
      setProjects([]);
    }
  };

  const fetchArtists = async () => {
    try {
      const response = await artistAPI.getPopularArtists(20) as any;
      if (response.success && response.data?.artists) {
        setArtists(response.data.artists);
      } else {
        setArtists([]);
      }
    } catch (error) {
      console.error('아티스트 데이터 로딩 실패:', error);
      setArtists([]);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await eventManagementAPI.getEvents() as any;
      if (response.success && response.data?.events) {
        setEvents(response.data.events);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('이벤트 데이터 로딩 실패:', error);
      setEvents([]);
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await communityPostAPI.getPosts({ category: 'notice' }) as any;
      if (response.success && response.data) {
        setNotices(response.data);
      } else {
        setNotices([]);
      }
    } catch (error) {
      console.error('공지사항 데이터 로딩 실패:', error);
      setNotices([]);
    }
  };

  const fetchCommunityPosts = async () => {
    try {
      const response = await communityPostAPI.getPosts() as any;
      if (response.success && response.data) {
        setCommunityPosts(response.data);
      } else {
        setCommunityPosts([]);
      }
    } catch (error) {
      console.error('커뮤니티 게시글 데이터 로딩 실패:', error);
      setCommunityPosts([]);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchProjects(),
          fetchArtists(),
          fetchEvents(),
          fetchNotices(),
          fetchCommunityPosts()
        ]);
      } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // 필터링된 데이터
  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || artist.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProjects = [...projects].sort((a, b) => {
    if (projectSort === "deadline") return a.daysLeft - b.daysLeft;
    if (projectSort === "amount") return b.currentAmount - a.currentAmount;
    if (projectSort === "new") return Number(b.id) - Number(a.id);
    return 0;
  });

  const filteredCommunityPosts = communityPosts.filter(post => {
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
                {loading ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    아티스트 데이터를 불러오는 중...
                  </div>
                ) : filteredArtists.length > 0 ? (
                  filteredArtists.slice(0, 3).map((artist) => (
                    <ArtistCard key={artist.id} {...artist} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    아티스트 데이터가 없습니다.
                  </div>
                )}
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
                {loading ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    프로젝트 데이터를 불러오는 중...
                  </div>
                ) : sortedProjects.length > 0 ? (
                  sortedProjects.map((project) => (
                    <FundingProjectCard key={project.id} {...project} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    프로젝트 데이터가 없습니다.
                  </div>
                )}
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
                {loading ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    공지사항을 불러오는 중...
                  </div>
                ) : notices.length > 0 ? (
                  notices.slice(0, 2).map((notice) => (
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
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    공지사항이 없습니다.
                  </div>
                )}
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
                {loading ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    커뮤니티 게시글을 불러오는 중...
                  </div>
                ) : filteredCommunityPosts.length > 0 ? (
                  filteredCommunityPosts.slice(0, 4).map((post) => (
                    <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${post.category === "review" ? "bg-green-100 text-green-700" :
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
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    커뮤니티 게시글이 없습니다.
                  </div>
                )}
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

            <div className="space-y-6">
              <SegmentedTabs
                value={currentPage === "projects" ? "ongoing" : "ongoing"}
                onValueChange={(value) => {
                  // 탭 변경 로직
                }}
                options={[
                  { value: "ongoing", label: "진행 중인 펀딩" },
                  { value: "all", label: "전체 프로젝트" }
                ]}
                size="md"
                variant="segmented"
              />

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

              <Tabs defaultValue="ongoing" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ongoing">진행중</TabsTrigger>
                  <TabsTrigger value="all">전체</TabsTrigger>
                </TabsList>

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
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      공지사항을 불러오는 중...
                    </div>
                  ) : notices.length > 0 ? (
                    notices.map((notice) => (
                      <NoticePost key={notice.id} {...notice} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      공지사항이 없습니다.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Empty State for No Search Results */}
            {!loading && notices.length === 0 && (
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
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  이벤트를 불러오는 중...
                </div>
              ) : events.length > 0 ? (
                events.map((event) => (
                  <EventCard key={event.id} {...event} />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  이벤트가 없습니다.
                </div>
              )}
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
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      프로젝트를 불러오는 중...
                    </div>
                  ) : projects.length > 0 ? (
                    projects.slice(0, 1).map((project) => (
                      <FundingProjectCard key={project.id} {...project} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      프로젝트가 없습니다.
                    </div>
                  )}

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
                  {projects.slice(1, 3).map((project) => (
                    <FundingProjectCard key={project.id} {...project} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="community-activity" className="space-y-6">
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                          커뮤니티 게시글을 불러오는 중...
                        </div>
                      ) : communityPosts.length > 0 ? (
                        communityPosts.slice(1, 3).map((post) => (
                          <CommunityBoardPost key={post.id} {...post} />
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          커뮤니티 게시글이 없습니다.
                        </div>
                      )}
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