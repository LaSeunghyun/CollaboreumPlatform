import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "../shared/ui/Button";
import { Star, ExternalLink, Play, Users } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const artists = [
  {
    id: 1,
    name: "김민수",
    category: "싱어송라이터",
    location: "서울",
    followers: 1247,
    rating: 4.8,
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=150&fit=crop",
    bio: "10년간 길거리에서 시작한 음악 여행을 정규앨범으로 완성하고자 합니다.",
    tags: ["인디록", "포크", "발라드"],
    activeProjects: 1,
    completedProjects: 3,
    totalEarned: "₩45M"
  },
  {
    id: 2,
    name: "이지영",
    category: "현대미술가",
    location: "부산",
    followers: 892,
    rating: 4.9,
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b898?w=200&h=200&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=150&fit=crop",
    bio: "기억과 망각을 주제로 현대인의 내면을 그려내는 작업을 하고 있습니다.",
    tags: ["회화", "설치미술", "현대미술"],
    activeProjects: 1,
    completedProjects: 2,
    totalEarned: "₩32M"
  },
  {
    id: 3,
    name: "박소영",
    category: "소설가",
    location: "대구",
    followers: 1534,
    rating: 4.7,
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=150&fit=crop",
    bio: "일상 속 작은 이야기들을 통해 현대인의 감정을 따뜻하게 그려냅니다.",
    tags: ["단편소설", "에세이", "일상"],
    activeProjects: 1,
    completedProjects: 4,
    totalEarned: "₩28M"
  }
];

export function ArtistSection() {
  return (
    <section id="artists" className="py-12 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">주목받는 아티스트</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <Card key={artist.id} className="overflow-hidden hover:shadow-apple-lg transition-all duration-300 group border-border/50">
              {/* Cover Image */}
              <div className="relative h-36">
                <ImageWithFallback
                  src={artist.coverImage}
                  alt={`${artist.name} cover`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Profile Section */}
              <div className="relative px-6 pb-6">
                {/* Profile Image */}
                <div className="absolute -top-12 left-6">
                  <div className="w-24 h-24 rounded-full border-4 border-background overflow-hidden shadow-apple">
                    <ImageWithFallback
                      src={artist.profileImage}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Artist Info */}
                <div className="pt-16">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{artist.name}</h3>
                      <p className="text-muted-foreground font-medium">{artist.category}</p>
                      <p className="text-sm text-muted-foreground">{artist.location}</p>
                    </div>
                    <div className="flex items-center bg-primary/10 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-primary fill-current mr-1" />
                      <span className="text-sm font-medium text-primary">{artist.rating}</span>
                    </div>
                  </div>

                  <p className="text-foreground/80 text-sm mb-4 line-clamp-2 leading-relaxed">{artist.bio}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {artist.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-secondary/60 text-foreground rounded-lg px-2 py-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center py-4 border-t border-border/50 mb-4">
                    <div>
                      <div className="text-lg font-bold text-foreground">{artist.followers}</div>
                      <div className="text-xs text-muted-foreground font-medium">팔로워</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-foreground">{artist.completedProjects}</div>
                      <div className="text-xs text-muted-foreground font-medium">완료 프로젝트</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-foreground">{artist.totalEarned}</div>
                      <div className="text-xs text-muted-foreground font-medium">총 펀딩</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                      <Users className="w-4 h-4 mr-2" />
                      팔로우
                    </Button>
                    <Button variant="outline" size="sm" className="border-border hover:bg-secondary/50 rounded-xl px-3">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-border hover:bg-secondary/50 rounded-xl px-3">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Active Project Notice */}
                  {artist.activeProjects > 0 && (
                    <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-2xl text-center">
                      <span className="text-sm text-primary font-medium">
                        현재 진행 중인 프로젝트 {artist.activeProjects}개
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg" className="border-border bg-background/80 backdrop-blur-sm text-foreground hover:bg-secondary/50 font-medium px-8 py-4">
            더 많은 아티스트 보기
          </Button>
        </div>
      </div>
    </section>
  );
}