import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Heart, Reply } from "lucide-react";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

interface CommentThreadProps {
  comments: Comment[];
  onLike?: (commentId: string) => void;
  onReply?: (commentId: string) => void;
}

function CommentItem({ 
  comment, 
  depth = 0, 
  onLike, 
  onReply 
}: { 
  comment: Comment; 
  depth?: number; 
  onLike?: (commentId: string) => void;
  onReply?: (commentId: string) => void;
}) {
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
    <div className={`${depth > 0 ? 'ml-12 mt-3' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
            </div>
            <p className="text-sm leading-relaxed">{comment.content}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 h-7 px-2 ${comment.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
              onClick={() => onLike?.(comment.id)}
            >
              <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{comment.likes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 h-7 px-2 text-muted-foreground"
              onClick={() => onReply?.(comment.id)}
            >
              <Reply className="w-3 h-3" />
              <span className="text-xs">답글</span>
            </Button>
          </div>
        </div>
      </div>
      
      {comment.replies && comment.replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          onLike={onLike}
          onReply={onReply}
        />
      ))}
    </div>
  );
}

export function CommentThread({ comments, onLike, onReply }: CommentThreadProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onLike={onLike}
          onReply={onReply}
        />
      ))}
    </div>
  );
}