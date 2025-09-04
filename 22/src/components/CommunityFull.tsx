import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Search, Filter, MessageCircle, Heart, Calendar, Users, ArrowLeft } from "lucide-react";

const categories = ["전체", "음악", "미술", "문학", "공연", "사진"];

const artists = [
  {
    id: 1,
    name: "김민수",
    category: "음악",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
    followers: 1247,
    posts: 23
  },
  {
    id: 2,
    name: "이지영",
    category: "미술",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b898?w=50&h=50&fit=crop&crop=face",
    followers: 892,
    posts: 15
  },
  {
    id: 3,
    name: "박소영",
    category: "문학",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
    followers: 1534,
    posts: 31
  },
  {
    id: 4,
    name: "최동혁",
    category: "공연",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
    followers: 687,
    posts: 18
  }
];

const forumPosts = [
  {
    id: 1,
    title: "인디음악 페스티벌 추천해주세요!",
    author: "음악러버",
    artistId: 1,
    category: "음악",
    replies: 23,
    likes: 45,
    timeAgo: "2시간 전",
    isHot: true,
    content: "올해 참가할만한 인디음악 페스티벌이 있을까요? 특히 신인 아티스트들 위주로..."
  },
  {
    id: 2,
    title: "젊은 작가들의 현대미술 트렌드",
    author: "아트크리틱",
    artistId: 2,
    category: "미술",
    replies: 12,
    likes: 28,
    timeAgo: "4시간 전",
    isHot: false,
    content: "요즘 20-30대 작가들이 주로 다루는 주제나 기법들이 궁금합니다."
  },
  {
    id: 3,
    title: "독립 출판의 새로운 방향성에 대해",
    author: "북워커",
    artistId: 3,
    category: "문학",
    replies: 8,
    likes: 19,
    timeAgo: "6시간 전",
    isHot: false,
    content: "전자책과 종이책, 독립 출판사들은 어떤 전략을 취해야 할까요?"
  },
  {
    id: 4,
    title: "소극장 연극의 매력을 알려주세요",
    author: "연극팬",
    artistId: 4,
    category: "공연",
    replies: 15,
    likes: 32,
    timeAgo: "8시간 전",
    isHot: false,
    content: "대극장 뮤지컬만 보다가 소극장 연극에 관심이 생겼습니다."
  }
];

interface CommunityFullProps {
  onBack: () => void;
  onSelectArtist: (artistId: number) => void;
}

export function CommunityFull({ onBack, onSelectArtist }: CommunityFullProps) {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<number | null>(null);

  const filteredArtists = artists.filter(artist => {
    const categoryMatch = selectedCategory === "전체" || artist.category === selectedCategory;
    const searchMatch = artist.name.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const filteredPosts = forumPosts.filter(post => {
    const categoryMatch = selectedCategory === "전체" || post.category === selectedCategory;
    const artistMatch = selectedArtist === null || post.artistId === selectedArtist;
    return categoryMatch && artistMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">커뮤니티</h1>
            <p className="text-gray-600">아티스트와 팬들이 소통하는 공간</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Category Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">카테고리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedArtist(null);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category
                          ? "bg-blue-100 text-blue-800 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Artist Search & Select */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">아티스트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="아티스트 검색..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => setSelectedArtist(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedArtist === null
                          ? "bg-blue-100 text-blue-800 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      전체 아티스트
                    </button>
                    {filteredArtists.map((artist) => (
                      <button
                        key={artist.id}
                        onClick={() => setSelectedArtist(artist.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                          selectedArtist === artist.id
                            ? "bg-blue-100 text-blue-800 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={artist.avatar} alt={artist.name} />
                          <AvatarFallback className="text-xs">{artist.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{artist.name}</p>
                          <p className="text-xs text-gray-500">{artist.posts}개 글</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {filteredPosts.length}개의 글
                  {selectedArtist && (
                    <span className="ml-2">
                      • {artists.find(a => a.id === selectedArtist)?.name}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  정렬
                </Button>
                <Button>새 글 작성</Button>
              </div>
            </div>

            {/* Selected Artist Info */}
            {selectedArtist && (
              <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={artists.find(a => a.id === selectedArtist)?.avatar} 
                        alt={artists.find(a => a.id === selectedArtist)?.name} 
                      />
                      <AvatarFallback>
                        {artists.find(a => a.id === selectedArtist)?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {artists.find(a => a.id === selectedArtist)?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        팔로워 {artists.find(a => a.id === selectedArtist)?.followers}명 • 
                        글 {artists.find(a => a.id === selectedArtist)?.posts}개
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onSelectArtist(selectedArtist)}
                    >
                      아티스트 프로필 보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts */}
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <Badge 
                          className={
                            post.category === "음악" ? "bg-blue-100 text-blue-800" :
                            post.category === "미술" ? "bg-purple-100 text-purple-800" :
                            post.category === "문학" ? "bg-green-100 text-green-800" :
                            "bg-red-100 text-red-800"
                          }
                        >
                          {post.category}
                        </Badge>
                        {post.isHot && (
                          <Badge className="bg-red-100 text-red-800">HOT</Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{post.timeAgo}</span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{post.content}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage 
                            src={artists.find(a => a.id === post.artistId)?.avatar} 
                            alt={post.author} 
                          />
                          <AvatarFallback className="text-xs">{post.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">by {post.author}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.replies}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline">더 많은 글 보기</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}