import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../shared/ui/Card";
import { Badge } from "../shared/ui/Badge";
import { Button } from "../shared/ui/Button";
import { Input } from "../shared/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../shared/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../shared/ui/Tabs";
import { ArrowLeft, Search, Play, Heart, Eye, Share, Grid3X3, List, Music, Palette, BookOpen, Mic, Video, Camera, Building } from "lucide-react";
import { ImageWithFallback } from "./atoms/ImageWithFallback";
import { useGalleryArtworks, useGalleryCategories, type Artwork, type Category } from "../lib/api/gallery";

interface ArtistGalleryProps {
  onBack?: () => void;
  onSelectArtwork?: (artworkId: number) => void;
  _onSelectArtwork?: (artworkId: number) => void;
}

export function ArtistGallery({ onBack, _onSelectArtwork }: ArtistGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState("최신순");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOptions] = useState<string[]>(["최신순", "인기순", "조회수순"]);

  // React Query 훅 사용
  const { data: artworks = [], isLoading: artworksLoading, error: artworksError } = useGalleryArtworks();
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useGalleryCategories();

  // 로딩 상태 계산
  const loading = artworksLoading || categoriesLoading;

  // 이전 페이지로 돌아가기
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // 더 안정적인 뒤로가기 방법
      try {
        // 브라우저 히스토리에서 이전 페이지로 이동
        if (window.history.length > 1) {
          window.history.back();
        } else {
          // 히스토리가 없으면 홈으로 이동
          window.location.href = '/';
        }
      } catch (_error) {
        // 에러 발생 시 홈으로 이동
        window.location.href = '/';
      }
    }
  };

  const filteredArtworks = artworks.filter((artwork: Artwork) => {
    const categoryMatch = selectedCategory === "전체" || artwork.category === selectedCategory;
    const artistName = typeof artwork.artist === 'string' ? artwork.artist : artwork.artist?.name || '';
    const searchMatch = artwork.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artistName.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const getCategoryIcon = (category: string) => {
    // 카테고리에서 아이콘 정보 찾기
    const categoryData = (categories as Category[]).find((cat: Category) => cat.id === category);
    if (categoryData?.icon) {
      switch (categoryData.icon) {
        case "Music": return <Music className="w-4 h-4" />;
        case "Palette": return <Palette className="w-4 h-4" />;
        case "BookOpen": return <BookOpen className="w-4 h-4" />;
        case "Mic": return <Mic className="w-4 h-4" />;
        case "Video": return <Video className="w-4 h-4" />;
        case "Camera": return <Camera className="w-4 h-4" />;
        case "Building": return <Building className="w-4 h-4" />;
        default: return null;
      }
    }
    return null;
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case "audio": case "video": return <Play className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getCategoryCount = (category: string) => {
    if (category === "전체") return artworks.length;
    return artworks.filter((artwork: Artwork) => artwork.category === category).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">갤러리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (artworksError || categoriesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">데이터를 불러올 수 없습니다</h2>
          <p className="text-gray-600 mb-4">잠시 후 다시 시도해주세요</p>
          <Button onClick={() => window.location.reload()}>새로고침</Button>
        </div>
      </div>
    );
  }

  const renderArtworkCard = (artwork: Artwork) => (
    <Card key={artwork.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative aspect-square">
        <ImageWithFallback
          src={artwork.thumbnail}
          alt={artwork.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            <Button size="sm" className="bg-white/90 text-gray-900 hover:bg-white">
              {getMetricIcon(artwork.type)}
            </Button>
            <Button size="sm" variant="outline" className="bg-white/90 border-white/90 hover:bg-white">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="absolute top-3 left-3">
          <Badge className="bg-blue-500">
            {getCategoryIcon(artwork.category)}
            <span className="ml-1">{artwork.category}</span>
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{artwork.title}</h3>
        <p className="text-sm text-gray-600 mb-2">by {typeof artwork.artist === 'string' ? artwork.artist : artwork.artist?.name || 'Unknown'}</p>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{artwork.description}</p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{artwork.date}</span>
          <span>{artwork.duration || artwork.dimensions || artwork.wordCount}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="flex items-center gap-1">
              {getMetricIcon(artwork.type)}
              <span>{artwork.plays || artwork.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{artwork.likes}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderArtworkList = (artwork: Artwork) => (
    <Card key={artwork.id} className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="w-24 h-24 flex-shrink-0">
            <ImageWithFallback
              src={artwork.thumbnail}
              alt={artwork.title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">{artwork.title}</h3>
                <p className="text-sm text-gray-600">by {typeof artwork.artist === 'string' ? artwork.artist : artwork.artist?.name || 'Unknown'}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {artwork.category}
              </Badge>
            </div>

            <p className="text-gray-700 text-sm mb-3 line-clamp-2">{artwork.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{artwork.date}</span>
                <span>{artwork.duration || artwork.dimensions || artwork.wordCount}</span>
                <div className="flex items-center gap-1">
                  {getMetricIcon(artwork.type)}
                  <span>{artwork.plays || artwork.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{artwork.likes}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Share className="w-4 h-4" />
                </Button>
                <Button size="sm">
                  {getMetricIcon(artwork.type)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={handleBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">아티스트 갤러리</h1>
            <p className="text-gray-600">창작자들의 작업물을 카테고리별로 감상하고 소통하세요</p>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="작품명이나 아티스트명으로 검색..."
                className="pl-10 h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 items-end">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex border border-gray-200 rounded-lg p-1 h-10">
              <Button
                variant={viewMode === "grid" ? "solid" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-3 h-8"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "solid" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-3 h-8"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            {(categories as Category[]).map((category: Category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                {getCategoryIcon(category.id)}
                <span className="hidden sm:inline">{category.label}</span>
                <span className="sm:hidden">{category.label.charAt(0)}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {getCategoryCount(category.id)}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {(categories as Category[]).map((category: Category) => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    {getCategoryIcon(category.id)}
                    {category.label} 작품
                    <Badge variant="outline">{getCategoryCount(category.id)}개</Badge>
                  </h2>
                  {searchQuery && (
                    <p className="text-sm text-gray-600">
                      '{searchQuery}' 검색 결과
                    </p>
                  )}
                </div>
              </div>

              {/* Artworks Display */}
              {viewMode === "grid" ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredArtworks.map(renderArtworkCard)}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredArtworks.map(renderArtworkList)}
                </div>
              )}

              {filteredArtworks.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    {getCategoryIcon(category.id) && <div className="text-6xl mb-4">{getCategoryIcon(category.id)}</div>}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? '검색 결과가 없습니다' : `${category.label} 작품이 없습니다`}
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery
                      ? '다른 검색어를 시도해보세요'
                      : `${category.label} 카테고리의 작품을 기다려보세요`
                    }
                  </p>
                </div>
              )}

              {/* Load More */}
              {filteredArtworks.length > 0 && filteredArtworks.length >= 12 && (
                <div className="text-center mt-12">
                  <Button variant="outline" size="lg">더 많은 작품 보기</Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}