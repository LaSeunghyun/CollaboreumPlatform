import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Eye, MessageCircle, ThumbsUp } from "lucide-react";
import { ShareButton } from "./ShareButton";

interface CommunityBoardPostProps {
    id: string;
    title: string;
    content: string;
    author: {
        name: string;
        avatar?: string;
        isVerified?: boolean;
    };
    category: "notice" | "free" | "question" | "review";
    createdAt: string;
    views: number;
    likes: number;
    comments: number;
    isPinned?: boolean;
    isHot?: boolean;
    onClick?: () => void;
}

export function CommunityBoardPost({
    id,
    title,
    content,
    author,
    category,
    createdAt,
    views,
    likes,
    comments,
    isPinned,
    isHot,
    onClick
}: CommunityBoardPostProps) {
    const getCategoryLabel = () => {
        switch (category) {
            case "notice": return "공지";
            case "free": return "자유";
            case "question": return "질문";
            case "review": return "후기";
        }
    };

    const getCategoryColor = () => {
        switch (category) {
            case "notice": return "bg-red-100 text-red-700";
            case "free": return "bg-blue-100 text-blue-700";
            case "question": return "bg-yellow-100 text-yellow-700";
            case "review": return "bg-green-100 text-green-700";
        }
    };

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
        <>
            {/* Desktop/Tablet Layout */}
            <div
                className="hidden md:block border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors cursor-pointer"
                onClick={onClick}
            >
                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            {isPinned && (
                                <Badge variant="secondary" className="bg-indigo/10 text-indigo text-xs">
                                    📌
                                </Badge>
                            )}
                            {isHot && (
                                <Badge variant="secondary" className="bg-danger-100 text-danger-700 text-xs">
                                    🔥 HOT
                                </Badge>
                            )}
                            <Badge className={`${getCategoryColor()} text-xs`}>
                                {getCategoryLabel()}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg line-clamp-2 hover:text-indigo transition-colors">
                            {title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                            {content}
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Avatar className="w-7 h-7">
                                    <AvatarImage src={author.avatar} />
                                    <AvatarFallback className="text-xs">{author.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm text-muted-foreground">{author.name}</span>
                                    {author.isVerified && (
                                        <div className="w-3 h-3 bg-sky rounded-full flex items-center justify-center">
                                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {timeAgo(createdAt)}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span className="tabular-nums">{views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4" />
                                <span className="tabular-nums">{likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                <span className="tabular-nums">{comments}</span>
                            </div>
                            <ShareButton
                                url={`/community/post/${id}`}
                                title={title}
                                description={content}
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Layout */}
            <div
                className="md:hidden border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors cursor-pointer group"
                onClick={onClick}
            >
                <div className="p-4 space-y-3">
                    <div className="flex items-start gap-2">
                        <div className="flex items-center gap-1 flex-wrap">
                            {isPinned && (
                                <Badge variant="secondary" className="bg-indigo/10 text-indigo text-xs px-1.5 py-0.5">
                                    📌
                                </Badge>
                            )}
                            {isHot && (
                                <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5">
                                    🔥
                                </Badge>
                            )}
                            <Badge className={`${getCategoryColor()} text-xs px-1.5 py-0.5`}>
                                {getCategoryLabel()}
                            </Badge>
                        </div>
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <ShareButton
                                url={`/community/post/${id}`}
                                title={title}
                                description={content}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            />
                        </div>
                    </div>

                    {/* Title only - compact for mobile */}
                    <h3 className="line-clamp-2 hover:text-indigo transition-colors leading-snug">
                        {title}
                    </h3>

                    {/* Compact author info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span>{author.name}</span>
                            {author.isVerified && (
                                <div className="w-3 h-3 bg-sky rounded-full flex items-center justify-center">
                                    <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            <span>·</span>
                            <span>{timeAgo(createdAt)}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span className="tabular-nums">{views > 999 ? `${Math.floor(views / 1000)}k` : views}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                <span className="tabular-nums">{comments}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                <span className="tabular-nums">{likes}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
