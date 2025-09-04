import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft, Users, Play, ExternalLink, MessageCircle, Heart, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useEffect, useState } from "react";
import { artistAPI } from '../services/api';

interface ArtistProfileProps {
  artistId: number;
  onBack?: () => void;
}

export function ArtistProfile({ artistId, onBack }: ArtistProfileProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artistData, setArtistData] = useState<any>(null);
  const [artistPosts] = useState<any[]>([]);
  const [portfolio] = useState<any[]>([]);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        setError(null);

        const artistResponse = await artistAPI.getArtistById(artistId.toString()) as any;

        if (artistResponse.success && artistResponse.data) {
          setArtistData(artistResponse.data);
        } else {
          throw new Error('아티스트 정보를 불러올 수 없습니다.');
        }
      } catch (error) {
        console.error('아티스트 데이터 로드 실패:', error);
        setError(error instanceof Error ? error.message : '아티스트 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [artistId]);

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
      } catch (error) {
        console.error('뒤로가기 실패:', error);
        // 에러 발생 시 홈으로 이동
        window.location.href = '/';
      }
    }
  };

  // 로딩 상태 처리
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">아티스트 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error || !artistData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || '아티스트 정보를 찾을 수 없습니다.'}</p>
          <Button onClick={onBack || (() => window.history.back())}>돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Section */}
      <div className="relative h-64 md:h-80">
        <ImageWithFallback
          src={artistData.coverImage}
          alt={`${artistData.name} cover`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Back Button */}
        <Button
          variant="secondary"
          onClick={handleBack}
          className="absolute top-4 left-4 bg-white/90 hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로가기
        </Button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="relative -mt-20 mb-8">
          <Card className="pt-24 pb-8">
            <CardContent>
              {/* Profile Image */}
              <div className="absolute -top-16 left-8">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={artistData.profileImage} alt={artistData.name} />
                  <AvatarFallback className="text-2xl">{artistData.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="md:flex md:justify-between md:items-start">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{artistData.name}</h1>
                    <Badge className="bg-blue-100 text-blue-800">{artistData.category}</Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{artistData.username}</p>
                  <p className="text-gray-700 mb-4 max-w-2xl">{artistData.bio}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <span>📍 {artistData.location}</span>
                    <span>📅 가입일: {artistData.joinDate}</span>
                    <span>🌐 <a href={artistData.website} className="text-blue-600 hover:underline">웹사이트</a></span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {artistData.tags.map((tag: any, index: number) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="flex-1 md:flex-initial bg-blue-600 hover:bg-blue-700 text-white">
                    <Users className="w-4 h-4 mr-2" />
                    팔로우
                  </Button>
                  <Button variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    라이브 보기
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-gray-900">{artistData.followers}</div>
            <div className="text-sm text-gray-600">팔로워</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-gray-900">{artistData.posts}</div>
            <div className="text-sm text-gray-600">게시물</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-gray-900">{artistData.following}</div>
            <div className="text-sm text-gray-600">팔로잉</div>
          </Card>
        </div>

        {/* Active Project */}
        {artistData.activeProject && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">진행 중인 프로젝트</h3>
                <Badge className="bg-blue-100 text-blue-800">{(artistData.activeProject as any).status}</Badge>
              </div>
              <h4 className="font-medium text-lg mb-2">{(artistData.activeProject as any).title}</h4>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>{(artistData.activeProject as any).supporters}명이 후원 중</span>
                <span>{(artistData.activeProject as any).progress}% 달성</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(artistData.activeProject as any).progress}%` }}
                />
              </div>
              <Button>프로젝트 지원하기</Button>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="posts" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">게시물 ({artistData.posts})</TabsTrigger>
            <TabsTrigger value="portfolio">포트폴리오</TabsTrigger>
            <TabsTrigger value="projects">프로젝트</TabsTrigger>
            <TabsTrigger value="about">소개</TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              {artistPosts.map((post: any) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={artistData.profileImage} alt={artistData.name} />
                        <AvatarFallback>{artistData.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{artistData.name}</p>
                        <p className="text-sm text-gray-600">{post.date}</p>
                      </div>
                    </div>

                    <h3 className="font-medium text-lg mb-3">{post.title}</h3>
                    <p className="text-gray-700 mb-4">{post.content}</p>

                    {post.images && (
                      <div className="mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {post.images.map((image: any, index: number) => (
                            <div key={index} className="rounded-lg overflow-hidden">
                              <ImageWithFallback
                                src={image}
                                alt={`${post.title} image ${index + 1}`}
                                className="w-full h-48 object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.replies}</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {portfolio.map((item: any, index: number) => (
                <Card key={index} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    <ImageWithFallback
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-6">
            <div className="text-center py-12">
              <p className="text-gray-500">프로젝트 내역을 준비 중입니다...</p>
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">아티스트 소개</h3>
                <p className="text-gray-700 leading-relaxed mb-6">{artistData.bio}</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">장르 & 스타일</h4>
                    <div className="flex flex-wrap gap-2">
                      {artistData.tags.map((tag: any, index: number) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">연락처</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>📧 contact@example.com</p>
                      <p>🌐 {artistData.website}</p>
                      <p>📍 {artistData.location}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}