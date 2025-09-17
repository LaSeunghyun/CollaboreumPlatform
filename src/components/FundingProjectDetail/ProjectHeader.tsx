import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
    ArrowLeft,
    Heart,
    Share2,
    // Calendar,
    // Target,
    // Users,
    // TrendingUp
} from 'lucide-react';
import { FundingProject } from '../../types/fundingProject';

interface ProjectHeaderProps {
    project: FundingProject;
    onBack: () => void;
    onLike: () => void;
    onShare: () => void;
    onSupport: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
    project,
    onBack,
    onLike,
    onShare,
    onSupport
}) => {
    return (
        <div className="space-y-6">
            {/* 뒤로가기 버튼 */}
            <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2"
            >
                <ArrowLeft className="h-4 w-4" />
                뒤로가기
            </Button>

            {/* 프로젝트 이미지 */}
            <div className="relative">
                <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={onLike}
                        className="bg-white/80 hover:bg-white"
                    >
                        <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={onShare}
                        className="bg-white/80 hover:bg-white"
                    >
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* 프로젝트 기본 정보 */}
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">{project.title}</h1>
                        <p className="text-gray-600">{project.description}</p>
                    </div>
                    <Badge variant="outline" className="text-sm">
                        {project.category}
                    </Badge>
                </div>

                {/* 아티스트 정보 */}
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback>{project.artist.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{project.artist}</p>
                        <p className="text-sm text-gray-500">아티스트</p>
                    </div>
                </div>

                {/* 진행률 */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>진행률</span>
                        <span>{project.progressPercentage}%</span>
                    </div>
                    <Progress value={project.progressPercentage} className="h-2" />
                </div>

                {/* 통계 */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {project.currentAmount.toLocaleString()}원
                        </div>
                        <div className="text-sm text-gray-500">모금액</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{project.backers}</div>
                        <div className="text-sm text-gray-500">후원자</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{project.daysLeft}</div>
                        <div className="text-sm text-gray-500">남은 일수</div>
                    </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-3">
                    <Button
                        onClick={onSupport}
                        className="flex-1"
                        size="lg"
                    >
                        후원하기
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onLike}
                        className="flex items-center gap-2"
                    >
                        <Heart className="h-4 w-4" />
                        좋아요
                    </Button>
                </div>
            </div>
        </div>
    );
};
