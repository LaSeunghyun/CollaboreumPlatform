import { Badge } from "./ui/badge";
import { Eye, Calendar, AlertCircle } from "lucide-react";

interface NoticePostProps {
  id: string;
  title: string;
  content: string;
  isImportant?: boolean;
  isPinned?: boolean;
  createdAt: string;
  views: number;
  onClick?: () => void;
}

export function NoticePost({
  title,
  content,
  isImportant,
  isPinned,
  createdAt,
  views,
  onClick
}: NoticePostProps) {
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
    <div 
      className="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isPinned && (
              <Badge variant="secondary" className="bg-indigo/10 text-indigo text-xs">
                📌 고정
              </Badge>
            )}
            {isImportant && (
              <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                중요
              </Badge>
            )}
            <Badge className="bg-indigo text-white text-xs">
              공지사항
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg hover:text-indigo transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-muted-foreground line-clamp-3 leading-relaxed">
            {content}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo/10 rounded-full flex items-center justify-center">
                <span className="text-xs text-indigo font-medium">공</span>
              </div>
              <span className="font-medium">Collaboreum 운영팀</span>
              <Badge variant="secondary" className="bg-sky/10 text-sky text-xs px-2 py-0.5">
                ✓ OFFICIAL
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{timeAgo(createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span className="tabular-nums">{views.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}