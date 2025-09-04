import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft, Search, Filter, Play, Heart, Eye, Download, Share, Grid3X3, List, Music, Palette, BookOpen, Mic, User } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const artworks = [
  {
    id: 1,
    title: "도시의 밤",
    artist: "김민수",
    artistId: 1,
    category: "음악",
    type: "audio",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    description: "밤의 고독과 희망을 담은 인디 발라드",
    duration: "3:24",
    plays: 1247,
    likes: 89,
    date: "2025-08-01",
    tags: ["인디", "발라드", "어쿠스틱"]
  },
  {
    id: 2,
    title: "기억의 조각들 #1",
    artist: "이지영",
    artistId: 2,
    category: "미술",
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop",
    description: "현대인의 파편화된 기억을 표현한 혼합매체 작품",
    dimensions: "100x80cm",
    views: 892,
    likes: 156,
    date: "2025-07-28",
    tags: ["현대미술", "혼합매체", "기억"]
  },
  {
    id: 3,
    title: "서울역 3번 출구",
    artist: "박소영",
    artistId: 3,
    category: "문학",
    type: "text",
    thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop",
    description: "도시 속 만남과 이별을 그린 단편소설",
    wordCount: "약 2,500자",
    views: 634,
    likes: 78,
    date: "2025-07-25",
    tags: ["단편소설", "도시", "이별"]
  },
  {
    id: 4,
    title: "침묵의 춤",
    artist: "최동혁",
    artistId: 4,
    category: "공연",
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&h=400&fit=crop",
    description: "언어 없는 소통을 주제로 한 현대무용",
    duration: "12:30",
    views: 445,
    likes: 67,
    date: "2025-07-22",
    tags: ["현대무용", "창작", "소통"]
  },
  {
    id: 5,
    title: "새벽 카페",
    artist: "정아름",
    artistId: 5,
    category: "음악",
    type: "audio",
    thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop",
    description: "새벽의 고요함을 담은 어쿠스틱 곡",
    duration: "4:12",
    plays: 756,
    likes: 92,
    date: "2025-07-20",
    tags: ["어쿠스틱", "감성", "새벽"]
  },
  {
    id: 6,
    title: "디지털 네이처",
    artist: "김태현",
    artistId: 6,
    category: "미술",
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    description: "자연과 기술의 조화를 탐구한 디지털 아트",
    dimensions: "디지털",
    views: 1134,
    likes: 203,
    date: "2025-07-18",
    tags: ["디지털아트", "자연", "기술"]
  },
  {
    id: 7,
    title: "별빛 소나타",
    artist: "안유진",
    artistId: 7,
    category: "음악",
    type: "audio",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    description: "클래식과 현대 음악이 어우러진 크로스오버 작품",
    duration: "5:47",
    plays: 2134,
    likes: 187,
    date: "2025-07-15",
    tags: ["클래식", "크로스오버", "피아노"]
  },
  {
    id: 8,
    title: "도시 풍경 시리즈",
    artist: "장민호",
    artistId: 8,
    category: "미술",
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop",
    description: "변화하는 도시의 모습을 담은 유화 연작",
    dimensions: "120x90cm",
    views: 567,
    likes: 134,
    date: "2025-07-12",
    tags: ["유화", "도시", "풍경화"]
  }
];

const categories = [
  { id: "전체", label: "전체", icon: null },
  { id: "음악", label: "음악", icon: <Music className="w-4 h-4" /> },
  { id: "미술", label: "미술", icon: <Palette className="w-4 h-4" /> },
  { id: "문학", label: "문학", icon: <BookOpen className="w-4 h-4" /> },
  { id: "공연", label: "공연", icon: <Mic className="w-4 h-4" /> }
];

const sortOptions = ["최신순", "인기순", "조회수순"];

interface ArtistGalleryProps {
  onBack: () => void;
  onSelectArtwork?: (artworkId: number) => void;
}

export function ArtistGallery({ onBack, onSelectArtwork }: ArtistGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState("최신순");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArtworks = artworks.filter(artwork => {
    const categoryMatch = selectedCategory === "전체" || artwork.category === selectedCategory;
    const searchMatch = artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       artwork.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "음악": return <Music className="w-4 h-4" />;
      case "미술": return <Palette className="w-4 h-4" />;
      case "문학": return <BookOpen className="w-4 h-4" />;
      case "공연": return <Mic className="w-4 h-4" />;
      default: return null;
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case "audio": case "video": return <Play className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getCategoryCount = (category: string) => {
    if (category === "전체") return artworks.length;
    return artworks.filter(artwork => artwork.category === category).length;
  };

  const renderArtworkCard = (artwork: any) => (
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
          <Badge className={`${
            artwork.category === "음악" ? "bg-blue-500" :
            artwork.category === "미술" ? "bg-purple-500" :
            artwork.category === "문학" ? "bg-green-500" : "bg-red-500"
          }`}>
            {getCategoryIcon(artwork.category)}
            <span className="ml-1">{artwork.category}</span>
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{artwork.title}</h3>
        <p className="text-sm text-gray-600 mb-2">by {artwork.artist}</p>
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

  const renderArtworkList = (artwork: any) => (
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
                <p className="text-sm text-gray-600">by {artwork.artist}</p>
              </div>
              <Badge className={`${
                artwork.category === "음악" ? "bg-blue-100 text-blue-800" :
                artwork.category === "미술" ? "bg-purple-100 text-purple-800" :
                artwork.category === "문학" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
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
          <Button variant="ghost" onClick={onBack} className="p-2">
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
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex border border-gray-200 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-3"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                {category.icon}
                <span className="hidden sm:inline">{category.label}</span>
                <span className="sm:hidden">{category.icon ? category.label.charAt(0) : "전"}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {getCategoryCount(category.id)}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    {category.icon}
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
                    {category.icon && <div className="text-6xl mb-4">{category.icon}</div>}
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