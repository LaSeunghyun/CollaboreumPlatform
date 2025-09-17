import React from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Play, Radio, Eye, Calendar, Users } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const liveStreams = [
  {
    id: 1,
    title: "김민수의 작업실 라이브",
    artist: "김민수",
    viewers: 234,
    category: "음악",
    status: "live",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop"
  },
  {
    id: 2,
    title: "새 앨범 레코딩 현장 공개",
    artist: "이하나",
    viewers: 156,
    category: "음악",
    status: "live",
    thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=200&fit=crop"
  },
  {
    id: 3,
    title: "수채화 풍경화 그리기",
    artist: "박예진",
    viewers: 89,
    category: "미술",
    status: "scheduled",
    scheduledTime: "20:00",
    thumbnail: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200&fit=crop"
  }
];

export function LiveAndPointsSection() {
  return (
    <section id="live" className="py-12 bg-gradient-to-b from-secondary/10 to-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-primary/20">
            <Radio className="w-4 h-4" />
            실시간 창작 스튜디오
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
            아티스트와 함께하는 <span className="text-primary">라이브 스트리밍</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            창작 과정을 실시간으로 공유하고, 팬들과 소통하며 영감을 나누세요
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Featured Live Stream */}
          <div className="mb-8">
            <Card className="overflow-hidden border-0 shadow-apple-lg rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="relative">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop"
                      alt="Featured Live Stream"
                      className="w-full h-64 object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl"></div>
                    <Badge className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                      LIVE
                    </Badge>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-white">
                        <Eye className="w-4 h-4" />
                        <span className="font-medium">1,234명 시청 중</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Badge className="bg-chart-1/10 text-chart-1 border border-chart-1/20 mb-4">
                      음악
                    </Badge>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                      김민수의 작업실 라이브
                    </h3>
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      새 앨범의 타이틀곡 레코딩 과정을 실시간으로 공유합니다.
                      창작 과정의 고민과 영감을 함께 나눠보세요.
                    </p>
                    <div className="flex gap-4">
                      <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl">
                        <Play className="w-5 h-5 mr-2" />
                        시청하기
                      </Button>
                      <Button variant="outline" size="lg" className="rounded-xl">
                        <Users className="w-5 h-5 mr-2" />
                        채팅 참여
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Stream List */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-foreground">진행 중인 라이브</h3>
              <Button variant="outline" className="rounded-xl">
                <Radio className="w-4 h-4 mr-2" />
                라이브 시작하기
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveStreams.map((stream) => (
                <Card key={stream.id} className="group hover:shadow-apple-lg transition-all duration-300 cursor-pointer border-0 rounded-2xl overflow-hidden">
                  <div className="relative">
                    <ImageWithFallback
                      src={stream.thumbnail}
                      alt={stream.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                    {stream.status === 'live' ? (
                      <Badge className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                        LIVE
                      </Badge>
                    ) : (
                      <Badge className="absolute top-4 left-4 bg-primary/80 text-white px-3 py-1 rounded-full">
                        <Calendar className="w-3 h-3 mr-1" />
                        {stream.scheduledTime}
                      </Badge>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-white fill-current" />
                      </div>
                    </div>

                    {stream.status === 'live' && (
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 text-white">
                          <Eye className="w-4 h-4" />
                          <span className="font-medium">{stream.viewers}명 시청 중</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <Badge
                      className={`mb-3 ${stream.category === "음악" ? "bg-chart-1/10 text-chart-1 border border-chart-1/20" :
                          "bg-chart-5/10 text-chart-5 border border-chart-5/20"
                        }`}
                    >
                      {stream.category}
                    </Badge>

                    <h4 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      {stream.title}
                    </h4>

                    <p className="text-muted-foreground text-sm">by {stream.artist}</p>
                  </CardContent>
                </Card>
              ))}
            </div>


          </div>
        </div>
      </div>
    </section>
  );
}