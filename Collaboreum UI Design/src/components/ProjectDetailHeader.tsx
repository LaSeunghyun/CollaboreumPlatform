import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { Calendar, Heart, Share2, Users } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProjectDetailHeaderProps {
  title: string;
  artist: {
    name: string;
    avatar?: string;
    followers?: number;
  };
  category: string;
  thumbnail: string;
  currentAmount: number;
  targetAmount: number;
  backers: number;
  daysLeft: number;
  isLiked?: boolean;
  onLike?: () => void;
  onShare?: () => void;
  onFollowArtist?: () => void;
}

export function ProjectDetailHeader({
  title,
  artist,
  category,
  thumbnail,
  currentAmount,
  targetAmount,
  backers,
  daysLeft,
  isLiked,
  onLike,
  onShare,
  onFollowArtist
}: ProjectDetailHeaderProps) {
  const progressPercentage = (currentAmount / targetAmount) * 100;
  
  return (
    <div className="space-y-6">
      {/* Hero Image */}
      <div className="aspect-[16/9] overflow-hidden rounded-lg">
        <ImageWithFallback
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Project Info */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Badge variant="secondary" className="bg-indigo/10 text-indigo">
              {category}
            </Badge>
            <h1>{title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className={isLiked ? 'text-red-500 border-red-200' : ''}
              onClick={onLike}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Artist Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={artist.avatar} />
              <AvatarFallback>{artist.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{artist.name}</p>
              {artist.followers && (
                <p className="text-sm text-muted-foreground">팔로워 {artist.followers.toLocaleString()}명</p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onFollowArtist}>
            팔로우
          </Button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">달성률</span>
                <span className="font-medium">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="space-y-1">
                <p className="font-semibold">{currentAmount.toLocaleString()}원</p>
                <p className="text-xs text-muted-foreground">목표: {targetAmount.toLocaleString()}원</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-4 h-4 text-sky" />
              <span className="text-sm text-muted-foreground">후원자</span>
            </div>
            <p className="font-semibold">{backers.toLocaleString()}명</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">남은 기간</span>
            </div>
            <p className="font-semibold">{daysLeft}일</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}