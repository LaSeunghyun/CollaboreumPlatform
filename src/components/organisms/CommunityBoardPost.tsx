import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Eye, MessageCircle, ThumbsUp } from 'lucide-react';
import { ShareButton } from '../atoms/ShareButton';

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
    rank?: number;
    onClick?: () => void;
}

export const CommunityBoardPost: React.FC<CommunityBoardPostProps> = ({
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
    rank,
    onClick
}) => {
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
            {/* Desktop/Tablet Layout - IssueLink 스타일 */}
            <div
                className="hidden md:block border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={onClick}
            >
                <div className="p-4">
                    <div className="flex items-start gap-4">
                        {/* 순위 표시 */}
                        {rank && (
                            <div className="flex-shrink-0 w-8 text-center">
                                <span className="text-sm font-medium text-gray-500">#{rank}</span>
                            </div>
                        )}

                        {/* 카테고리 및 핫 배지 */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            {isPinned && (
                                <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs px-2 py-1">
                                    📌 고정
                                </Badge>
                            )}
                            {isHot && (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs px-2 py-1">
                                    🔥 HOT
                                </Badge>
                            )}
                            <Badge className={`${getCategoryColor()} text-xs px-2 py-1`}>
                                {getCategoryLabel()}
                            </Badge>
                        </div>
                    </div>

                    {/* 제목과 내용 */}
                    <div className="mt-3">
                        <h3 className="text-lg font-medium line-clamp-2 hover:text-blue-600 transition-colors mb-2">
                            {title}
                        </h3>
                        <p className="text-gray-600 line-clamp-2 leading-relaxed text-sm">
                            {content}
                        </p>
                    </div>

                    {/* 하단 정보 */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                    <AvatarImage src={author.avatar} />
                                    <AvatarFallback className="text-xs">{author.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm text-gray-600">{author.name}</span>
                                    {author.isVerified && (
                                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="text-sm text-gray-500">
                                {timeAgo(createdAt)}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span className="tabular-nums">{views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4" />
                                <span className="tabular-nums">{likes.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                <span className="tabular-nums">{comments.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Layout - IssueLink 스타일 */}
            <div
                className="md:hidden border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={onClick}
            >
                <div className="p-4">
                    <div className="flex items-start gap-3">
                        {/* 순위 표시 */}
                        {rank && (
                            <div className="flex-shrink-0 w-6 text-center">
                                <span className="text-xs font-medium text-gray-500">#{rank}</span>
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            {/* 카테고리 및 핫 배지 */}
                            <div className="flex items-center gap-1 flex-wrap mb-2">
                                {isPinned && (
                                    <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5">
                                        📌
                                    </Badge>
                                )}
                                {isHot && (
                                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5">
                                        🔥
                                    </Badge>
                                )}
                                <Badge className={`${getCategoryColor()} text-xs px-1.5 py-0.5`}>
                                    {getCategoryLabel()}
                                </Badge>
                            </div>

                            {/* 제목 */}
                            <h3 className="line-clamp-2 hover:text-blue-600 transition-colors leading-snug font-medium text-sm mb-2">
                                {title}
                            </h3>

                            {/* 하단 정보 */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                    <span>{author.name}</span>
                                    {author.isVerified && (
                                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
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
                </div>
            </div>
        </>
    );
};
