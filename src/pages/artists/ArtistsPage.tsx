import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Search } from 'lucide-react';
import { ArtistCard } from '../../components/molecules/ArtistCard';
import { useArtists, usePopularArtists, useNewArtists } from '../../lib/api/useArtists';
import { LoadingState, ErrorState, EmptyArtistsState, SkeletonGrid } from '../../components/organisms/States';

export const ArtistsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [activeTab, setActiveTab] = useState("hot");

    // API 훅들
    const { data: allArtists, isLoading: allArtistsLoading, error: allArtistsError } = useArtists({
        search: searchQuery || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
    });

    const { data: popularArtists, isLoading: popularLoading, error: popularError } = usePopularArtists();
    const { data: newArtists, isLoading: newLoading, error: newError } = useNewArtists();

    const handleSearch = () => {
        // 검색 로직은 useArtists 훅이 자동으로 처리
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
    };

    const renderArtists = (artists: any[], loading: boolean, error: any) => {
        if (loading) {
            return <SkeletonGrid count={6} cols={3} />;
        }

        if (error) {
            return (
                <ErrorState
                    title="아티스트 정보를 불러올 수 없습니다"
                    description="잠시 후 다시 시도해주세요."
                />
            );
        }

        if (!artists || artists.length === 0) {
            return (
                <EmptyArtistsState
                    action={{
                        label: "전체 아티스트 보기",
                        onClick: () => setActiveTab("all")
                    }}
                />
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artists.map((artist: any) => (
                    <ArtistCard key={artist.id} {...artist} />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">아티스트</h1>
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
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="hot">핫한 아티스트</TabsTrigger>
                    <TabsTrigger value="new">신규 아티스트</TabsTrigger>
                    <TabsTrigger value="all">전체 아티스트</TabsTrigger>
                </TabsList>

                <TabsContent value="hot" className="space-y-6">
                    {renderArtists(
                        popularArtists?.data?.artists || [],
                        popularLoading,
                        popularError
                    )}
                </TabsContent>

                <TabsContent value="new" className="space-y-6">
                    {renderArtists(
                        newArtists?.data?.artists || [],
                        newLoading,
                        newError
                    )}
                </TabsContent>

                <TabsContent value="all" className="space-y-6">
                    {renderArtists(
                        allArtists?.data?.artists || [],
                        allArtistsLoading,
                        allArtistsError
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};
