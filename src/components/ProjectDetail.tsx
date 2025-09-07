import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Heart, Star, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { ImageWithFallback } from './atoms/ImageWithFallback';
import { PaymentModal } from './PaymentModal';
import { fundingAPI, interactionAPI } from '../services/api';

interface ProjectDetailProps {
  projectId: number;
  onBack: () => void;
}

export function ProjectDetail({ projectId, onBack }: ProjectDetailProps) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await fundingAPI.getProject(projectId.toString()) as any;

        if (response.success && response.data) {
          setProject(response.data);
        } else {
          setError('프로젝트를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('프로젝트 로드 실패:', error);
        setError('프로젝트를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleBackProject = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      const response = await fundingAPI.backProject(projectId.toString(), {
        amount: paymentData.amount,
        message: paymentData.message || '',
        rewardId: paymentData.rewardId
      }) as any;

      if (response.success) {
        // 프로젝트 정보 새로고침
        const updatedResponse = await fundingAPI.getProject(projectId.toString()) as any;
        if (updatedResponse.success && updatedResponse.data) {
          setProject(updatedResponse.data);
        }
        setShowPaymentModal(false);
      }
    } catch (error) {
      console.error('후원 처리 실패:', error);
    }
  };

  const handleLike = async () => {
    try {
      const response = await fundingAPI.likeProject(projectId.toString()) as any;
      if (response.success) {
        setIsLiked(!isLiked);
        // 프로젝트 정보 새로고침
        const updatedResponse = await fundingAPI.getProject(projectId.toString()) as any;
        if (updatedResponse.success && updatedResponse.data) {
          setProject(updatedResponse.data);
        }
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      alert('좋아요 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await fundingAPI.bookmarkProject(projectId.toString()) as any;
      if (response.success) {
        setIsBookmarked(!isBookmarked);
        // 프로젝트 정보 새로고침
        const updatedResponse = await fundingAPI.getProject(projectId.toString()) as any;
        if (updatedResponse.success && updatedResponse.data) {
          setProject(updatedResponse.data);
        }
      }
    } catch (error) {
      console.error('북마크 처리 실패:', error);
      alert('북마크 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project?.title,
        text: project?.description,
        url: window.location.href
      });
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">프로젝트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={onBack}>돌아가기</Button>
        </div>
      </div>
    );
  }

  const getProgressPercentage = (current: number, target: number) => {
    if (!current || !target || target <= 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      "음악": "bg-blue-100 text-blue-800",
      "미술": "bg-purple-100 text-purple-800",
      "문학": "bg-green-100 text-green-800",
      "공연": "bg-red-100 text-red-800",
      "사진": "bg-pink-100 text-pink-800",
      "도서": "bg-indigo-100 text-indigo-800"
    };
    return colorMap[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBack} className="mb-6">
          ← 프로젝트 목록으로
        </Button>

        {/* Project Header */}
        <Card className="mb-8">
          <div className="relative aspect-video">
            <ImageWithFallback
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            {project.featured && (
              <Badge className="absolute top-4 left-4 bg-yellow-500 text-white">
                주목 프로젝트
              </Badge>
            )}
            <Badge className={`absolute top-4 right-4 ${getCategoryColor(project.category)}`}>
              {project.category}
            </Badge>
          </div>

          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{project.title}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={project.artistAvatar} alt={project.artist} />
                    <AvatarFallback>{project.artist.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">by {project.artist}</p>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{project.artistRating}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={handleBookmark}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="text-lg text-gray-700 mb-6">{project.description}</p>

            {/* Progress Section */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">₩{project.currentAmount?.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">현재 모금액</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">₩{project.targetAmount?.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">목표 금액</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{project.backers}</p>
                  <p className="text-sm text-gray-600">후원자 수</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{project.daysLeft}</p>
                  <p className="text-sm text-gray-600">일 남음</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>진행률</span>
                  <span>{getProgressPercentage(project.currentAmount || 0, project.targetAmount).toFixed(1)}%</span>
                </div>
                <Progress
                  value={getProgressPercentage(project.currentAmount || 0, project.targetAmount)}
                  className="h-3"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button size="lg" className="flex-1" onClick={handleBackProject}>
                프로젝트 후원하기
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
                onClick={async () => {
                  try {
                    const response = await interactionAPI.followArtist(project.artistId || project.artist.id) as any;
                    if (response.success) {
                      alert('아티스트를 팔로우했습니다!');
                    }
                  } catch (error) {
                    console.error('팔로우 실패:', error);
                    alert('팔로우에 실패했습니다. 다시 시도해주세요.');
                  }
                }}
              >
                아티스트 팔로우
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Project Details Tabs */}
        <Tabs defaultValue="story" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="story">스토리</TabsTrigger>
            <TabsTrigger value="rewards">후원 옵션</TabsTrigger>
            <TabsTrigger value="updates">업데이트</TabsTrigger>
            <TabsTrigger value="comments">댓글</TabsTrigger>
          </TabsList>

          <TabsContent value="story" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">프로젝트 스토리</h3>
                  <div dangerouslySetInnerHTML={{ __html: project.story || project.description }} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">후원 옵션</h3>
                <div className="grid gap-4">
                  {project.rewards?.map((reward: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-lg">₩{reward.amount?.toLocaleString()}</h4>
                        <Badge variant="secondary">{reward.backers}명 후원</Badge>
                      </div>
                      <h5 className="font-medium text-gray-900 mb-2">{reward.title}</h5>
                      <p className="text-gray-600 mb-3">{reward.description}</p>
                      <Button onClick={handleBackProject}>이 옵션으로 후원하기</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="updates" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">프로젝트 업데이트</h3>
                <div className="space-y-4">
                  {project.updates?.map((update: any, index: number) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{update.title}</h4>
                        <span className="text-sm text-gray-500">{update.date}</span>
                      </div>
                      <p className="text-gray-600 mb-2">{update.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{update.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{update.comments}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">댓글</h3>
                <div className="space-y-4">
                  {project.comments?.map((comment: any, index: number) => (
                    <div key={index} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.author.avatar} alt={comment.author.username} />
                        <AvatarFallback>{comment.author.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.author.username}</span>
                          <span className="text-xs text-gray-500">{comment.createdAt}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          project={project}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
