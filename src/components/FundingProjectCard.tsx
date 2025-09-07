import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { Clock, Users } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ShareButton } from "./ShareButton";

interface FundingProjectCardProps {
  id: string;
  title: string;
  artist: string;
  category: string;
  thumbnail: string;
  currentAmount: number;
  targetAmount: number;
  backers: number;
  daysLeft: number;
  onClick?: () => void;
}

export function FundingProjectCard({
  id,
  title,
  artist,
  category,
  thumbnail,
  currentAmount,
  targetAmount,
  backers,
  daysLeft,
  onClick
}: FundingProjectCardProps) {
  const progressPercentage = (currentAmount / targetAmount) * 100;
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group relative" onClick={onClick}>
      {/* Share button overlay */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <ShareButton 
          url={`/project/${id}`}
          title={title}
          description={`${artist}의 ${title} 프로젝트를 응원해주세요!`}
          variant="secondary"
          size="icon"
          className="bg-white/90 backdrop-blur-sm shadow-sm"
        />
      </div>
      
      <div className="aspect-video overflow-hidden relative">
        <ImageWithFallback
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Status badges */}
        <div className="absolute top-3 left-3">
          {daysLeft <= 7 && (
            <Badge className="bg-red-500/90 text-white text-xs backdrop-blur-sm">
              마감임박
            </Badge>
          )}
          {progressPercentage >= 100 && (
            <Badge className="bg-green-500/90 text-white text-xs backdrop-blur-sm ml-2">
              목표달성
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-5 space-y-4">
        <div className="space-y-3">
          <Badge variant="secondary" className="bg-indigo/10 text-indigo hover:bg-indigo/20">
            {category}
          </Badge>
          <div className="space-y-1">
            <h3 className="line-clamp-2 leading-snug">{title}</h3>
            <p className="text-muted-foreground">{artist}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <Progress value={progressPercentage} className="h-2.5" />
          <div className="flex justify-between text-sm">
            <span className="font-medium tabular-nums">
              {currentAmount.toLocaleString()}원
            </span>
            <span className="text-muted-foreground tabular-nums">
              목표 {targetAmount.toLocaleString()}원
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="tabular-nums">{progressPercentage.toFixed(1)}%</span> 달성
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="tabular-nums">{backers}명</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span className={`tabular-nums ${daysLeft <= 7 ? 'text-red-600 font-medium' : ''}`}>
              {daysLeft}일 남음
            </span>
          </div>
        </div>
        
        <Button 
          className="w-full bg-indigo hover:bg-indigo-hover hover-scale transition-button shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            // Handle backing logic
          }}
        >
          후원하기
        </Button>
      </CardContent>
    </Card>
  );
}
