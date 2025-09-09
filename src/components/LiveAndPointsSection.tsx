import { Card, CardContent, CardHeader, CardTitle } from "../shared/ui/Card";
import { Badge } from "../shared/ui/Badge";
import { Button } from "../shared/ui/Button";
import { Play, Radio, Eye } from "lucide-react";
import { ImageWithFallback } from "./atoms/ImageWithFallback";
import { useLiveStreams } from "../lib/api/useLiveStreams";
import { getCategoryColor } from "../constants/categories";

export function LiveAndPointsSection() {
  const { data: liveStreamsData, isLoading, error } = useLiveStreams();

  const liveStreams = (liveStreamsData as any)?.data?.streams || (liveStreamsData as any)?.streams || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">라이브 스트림 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">라이브 스트림 데이터를 불러오는데 실패했습니다.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section id="live" className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">라이브 스트리밍</h2>
          <p className="text-xl text-muted-foreground">실시간 창작 과정을 지켜보고 함께 소통하세요</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Live Streaming Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">현재 라이브 중</h3>
              <Button variant="outline">
                <Radio className="w-4 h-4 mr-2" />
                라이브 시작하기
              </Button>
            </div>

            <div className="space-y-4">
              {liveStreams.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <Radio className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">현재 라이브 중인 스트림이 없습니다</h4>
                  <p className="text-gray-600 mb-4">첫 번째 라이브를 시작해보세요!</p>
                  <Button>라이브 시작하기</Button>
                </div>
              ) : (
                liveStreams.map((stream: any) => (
                  <Card key={stream.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative">
                          <ImageWithFallback
                            src={stream.thumbnail}
                            alt={stream.title}
                            className="w-32 h-20 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stream.status === 'live' ? 'bg-red-500' : 'bg-gray-500'
                              }`}>
                              <Play className="w-4 h-4 text-white fill-current" />
                            </div>
                          </div>
                          {stream.status === 'live' && (
                            <Badge className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1">
                              LIVE
                            </Badge>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <Badge
                              className={getCategoryColor(stream.category)}
                            >
                              {stream.category}
                            </Badge>
                            {stream.status === 'scheduled' && (
                              <span className="text-sm text-muted-foreground">{stream.scheduledTime} 시작 예정</span>
                            )}
                          </div>

                          <h4 className="font-medium text-foreground mb-1 line-clamp-1">
                            {stream.title}
                          </h4>

                          <p className="text-sm text-muted-foreground mb-2">by {stream.artist}</p>

                          {stream.status === 'live' && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Eye className="w-4 h-4" />
                              <span>{stream.viewers}명 시청 중</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground mb-1">라이브 스케줄 알림</h4>
                  <p className="text-sm text-muted-foreground">관심 아티스트의 라이브를 놓치지 마세요!</p>
                </div>
                <Button variant="outline" size="sm">
                  알림 설정
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}