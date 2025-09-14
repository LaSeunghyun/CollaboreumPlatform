import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Search, Filter, MessageCircle, Heart, ArrowLeft } from "lucide-react";
import { communityAPI, userAPI, categoryAPI } from "../services/api";
import { KOREAN_CATEGORIES, getCategoryColor } from "../constants/categories";

interface CommunityFullProps {
  onBack: () => void;
  onSelectArtist: (artistId: number) => void;
}

export function CommunityFull({ onBack, onSelectArtist }: CommunityFullProps) {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<number | null>(null);
  const [artists, setArtists] = useState<any[]>([]);
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["전체"]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 카테고리 목록 가져오기
        const categoriesResponse = await communityAPI.getCategories() as any;
        if (categoriesResponse.success) {
          const categoryLabels = ["전체", ...(categoriesResponse as any).data.map((cat: any) => cat.label)];
          setCategories(categoryLabels);
        } else {
          setCategories(KOREAN_CATEGORIES);
        }

        // 아티스트 목록 가져오기
        const artistsResponse = await userAPI.getFollowingArtists('current-user') as any;
        if (artistsResponse.success) {
          setArtists(artistsResponse.data || []);
        }

        // 포럼 게시물 가져오기
        const postsResponse = await communityAPI.getForumPosts() as any;
        if (postsResponse.success) {
          setForumPosts(postsResponse.data || []);
        }

      } catch (err) {
        console.error('Failed to fetch community data:', err);
        setError('데이터를 불러오는데 실패했습니다.');
        setCategories(KOREAN_CATEGORIES);
      } finally {
        setLoading(false);
        setIsLoadingCategories(false);
      }
    };

    fetchData();
  }, []);

  const filteredArtists = artists.filter(artist => {
    const categoryMatch = selectedCategory === "전체" || artist.category === selectedCategory;
    const searchMatch = artist.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const filteredPosts = forumPosts.filter(post => {
    const categoryMatch = selectedCategory === "전체" || post.category === selectedCategory;
    const artistMatch = selectedArtist === null || post.artistId === selectedArtist;
    return categoryMatch && artistMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">커뮤니티 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

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
                  {isLoadingCategories ? (
                    <div className="text-sm text-gray-500">카테고리 로딩 중...</div>
                  ) : (
                    categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setSelectedArtist(null);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category
                          ? "bg-blue-100 text-blue-800 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                          }`}
                      >
                        {category}
                      </button>
                    ))
                  )}
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
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedArtist === null
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
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-3 ${selectedArtist === artist.id
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
                          className={getCategoryColor(post.category)}
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