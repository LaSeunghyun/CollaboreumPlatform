import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import {
    Search,
    TrendingUp,
    Clock,
    Users2,
    Heart,
    AlertCircle
} from 'lucide-react';
import { ArtistCard } from '../../components/molecules/ArtistCard';
import { FundingProjectCard } from '../../components/molecules/FundingProjectCard';
import { NoticePost } from '../../components/organisms/NoticePost';
import { CommunityBoardPost } from '../../components/organisms/CommunityBoardPost';
import { usePopularArtists } from '../../lib/api/useArtists';
import { useProjects } from '../../lib/api/useProjects';
import { useNotices } from '../../lib/api/useNotices';
import { useCommunityPosts } from '../../lib/api/useCommunity';
import { LoadingState, ErrorState, SkeletonGrid } from '../../components/organisms/States';

export const HomePage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");

    // API 훅들
    const { data: popularArtists, isLoading: artistsLoading, error: artistsError } = usePopularArtists(3);
    const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects({
        limit: 3,
        sortBy: 'popularity'
    });
    const { data: notices, isLoading: noticesLoading, error: noticesError } = useNotices({
        limit: 2,
        sortBy: 'createdAt',
        order: 'desc'
    });
    const { data: communityPosts, isLoading: communityLoading, error: communityError } = useCommunityPosts({
        limit: 4,
        sortBy: 'popularity',
        order: 'desc'
    });

    const handleSearch = () => {
        // 검색 로직 구현
    };

    return (
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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button
                            size="lg"
                            className="bg-indigo hover:bg-indigo-hover text-white h-12 md:h-14 px-8 md:px-10 hover-scale transition-button shadow-lg text-base md:text-lg font-semibold w-full sm:w-auto rounded-2xl"
                            onClick={handleSearch}
                        >
                            지금 시작하기
                        </Button>
                    </div>

                    {/* Stats */}
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
                    <h2 className="text-2xl font-bold">주목받는 아티스트</h2>
                    <Button variant="outline" size="sm">
                        더보기
                    </Button>
                </div>

                {artistsLoading ? (
                    <SkeletonGrid count={3} cols={3} />
                ) : artistsError ? (
                    <ErrorState
                        title="아티스트 정보를 불러올 수 없습니다"
                        description="잠시 후 다시 시도해주세요."
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {popularArtists?.data?.artists?.slice(0, 3).map((artist: any) => (
                            <ArtistCard key={artist.id} {...artist} />
                        ))}
                    </div>
                )}
            </section>

            {/* Featured Projects */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">진행 중인 프로젝트</h2>
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

                {projectsLoading ? (
                    <SkeletonGrid count={3} cols={3} />
                ) : projectsError ? (
                    <ErrorState
                        title="프로젝트 정보를 불러올 수 없습니다"
                        description="잠시 후 다시 시도해주세요."
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {projects?.data?.projects?.slice(0, 3).map((project: any) => (
                            <FundingProjectCard key={project.id} {...project} />
                        ))}
                    </div>
                )}
            </section>

            {/* Notice Preview */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">중요 공지사항</h2>
                    <Button variant="outline" size="sm">
                        전체보기
                    </Button>
                </div>

                {noticesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <LoadingState title="공지사항 로딩 중..." />
                        <LoadingState title="공지사항 로딩 중..." />
                    </div>
                ) : noticesError ? (
                    <ErrorState
                        title="공지사항을 불러올 수 없습니다"
                        description="잠시 후 다시 시도해주세요."
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {notices?.data?.posts?.slice(0, 2).map((notice: any) => (
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
                                        <h3 className="line-clamp-2 font-medium">{notice.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {notice.content}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                                            <span className="font-medium">Collaboreum 운영팀</span>
                                            <div className="flex items-center gap-3">
                                                <span>조회 {notice.views?.toLocaleString() || 0}</span>
                                                <span>{new Date(notice.createdAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* Community Preview */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">커뮤니티 인기글</h2>
                    <Button variant="outline" size="sm">
                        더보기
                    </Button>
                </div>

                {communityLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <LoadingState title="커뮤니티 로딩 중..." />
                        <LoadingState title="커뮤니티 로딩 중..." />
                    </div>
                ) : communityError ? (
                    <ErrorState
                        title="커뮤니티 정보를 불러올 수 없습니다"
                        description="잠시 후 다시 시도해주세요."
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {communityPosts?.data?.posts?.slice(0, 4).map((post: any) => (
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
                                        <h3 className="line-clamp-2 font-medium">{post.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {post.content}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <span>{post.author?.name}</span>
                                                {post.author?.isVerified && (
                                                    <div className="w-3 h-3 bg-sky rounded-full flex items-center justify-center">
                                                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>👍 {post.likes || 0}</span>
                                                <span>💬 {post.comments || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};
