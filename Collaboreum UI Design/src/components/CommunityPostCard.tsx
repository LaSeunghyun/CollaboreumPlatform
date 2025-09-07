import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";

interface CommunityPostCardProps {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  onClick?: () => void;
  onLike?: () => void;
  onComment?: () => void;
}

export function CommunityPostCard({
  author,
  content,
  createdAt,
  likes,
  comments,
  isLiked,
  onClick,
  onLike,
  onComment
}: CommunityPostCardProps) {
  const timeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffMs = now.getTime() - posted.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}일 전`;
    if (diffHours > 0) return `${diffHours}시간 전`;
    if (diffMins > 0) return `${diffMins}분 전`;
    return '방금 전';
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={author.avatar} />
              <AvatarFallback>{author.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{author.name}</p>
              <p className="text-xs text-muted-foreground">{timeAgo(createdAt)}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed line-clamp-3">{content}</p>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 h-8 px-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
            onClick={(e) => {
              e.stopPropagation();
              onLike?.();
            }}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs">{likes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 h-8 px-2 text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onComment?.();
            }}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">{comments}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}