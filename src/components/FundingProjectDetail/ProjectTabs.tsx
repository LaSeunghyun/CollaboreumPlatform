import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { FileText, DollarSign, CheckCircle, TrendingUp } from 'lucide-react';
import { FundingProject } from '../../types/fundingProject';

interface ProjectTabsProps {
    project: FundingProject;
}

export const ProjectTabs: React.FC<ProjectTabsProps> = ({ project }) => {
    return (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="updates">업데이트</TabsTrigger>
                <TabsTrigger value="backers">후원자</TabsTrigger>
                <TabsTrigger value="execution">집행현황</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            프로젝트 소개
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 leading-relaxed">
                            {project.description}
                        </p>
                    </CardContent>
                </Card>

                {/* 리워드 목록 */}
                <Card>
                    <CardHeader>
                        <CardTitle>리워드</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {project.rewards.map((reward) => (
                            <div
                                key={reward.id}
                                className="border rounded-lg p-4 space-y-2"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{reward.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            {reward.description}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg">
                                            {reward.amount.toLocaleString()}원
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            예상 전달일: {reward.estimatedDelivery}
                                        </div>
                                    </div>
                                </div>
                                {reward.maxClaim && (
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>
                                            {reward.claimed || 0} / {reward.maxClaim}명 선택
                                        </span>
                                        <span>
                                            {Math.round(((reward.claimed || 0) / reward.maxClaim) * 100)}% 완료
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="updates" className="space-y-4">
                {project.updates.map((update) => (
                    <Card key={update.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{update.title}</CardTitle>
                                <Badge variant="outline">
                                    {update.type || '일반'}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                                {update.date}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 leading-relaxed">
                                {update.content}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </TabsContent>

            <TabsContent value="backers" className="space-y-4">
                <div className="grid gap-4">
                    {project.backersList.map((backer) => (
                        <Card key={backer.id}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>
                                                {backer.userName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{backer.userName}</p>
                                            <p className="text-sm text-gray-500">
                                                {backer.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">
                                            {backer.amount.toLocaleString()}원
                                        </div>
                                        <Badge
                                            variant={backer.status === '완료' ? 'default' : 'secondary'}
                                            className="text-xs"
                                        >
                                            {backer.status}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="execution" className="space-y-6">
                {/* 집행 계획 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            집행 계획
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {project.executionPlan.stages.map((stage) => (
                            <div
                                key={stage.id}
                                className="border rounded-lg p-4 space-y-2"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{stage.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            {stage.description}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">
                                            {stage.budget.toLocaleString()}원
                                        </div>
                                        <Badge
                                            variant={
                                                stage.status === '완료' ? 'default' :
                                                    stage.status === '진행중' ? 'secondary' : 'outline'
                                            }
                                        >
                                            {stage.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>{stage.startDate} ~ {stage.endDate}</span>
                                    <span>진행률: {stage.progress}%</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 지출 내역 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            지출 내역
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {project.expenseRecords.map((expense) => (
                            <div
                                key={expense.id}
                                className="border rounded-lg p-4 space-y-2"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{expense.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            {expense.description}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {expense.category} • {expense.stage}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">
                                            {expense.amount.toLocaleString()}원
                                        </div>
                                        <Badge
                                            variant={expense.verified ? 'default' : 'secondary'}
                                            className="text-xs"
                                        >
                                            {expense.verified ? '검증완료' : '검증대기'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {expense.date}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 수익 분배 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            수익 분배
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {project.revenueDistribution.totalRevenue.toLocaleString()}원
                                </div>
                                <div className="text-sm text-gray-500">총 수익</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {project.revenueDistribution.artistShare.toLocaleString()}원
                                </div>
                                <div className="text-sm text-gray-500">아티스트 수익</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold">분배 내역</h4>
                            {project.revenueDistribution.distributions.map((distribution) => (
                                <div
                                    key={distribution.id}
                                    className="flex justify-between items-center p-3 border rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{distribution.userName}</p>
                                        <p className="text-sm text-gray-500">
                                            원래 후원: {distribution.originalAmount.toLocaleString()}원
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">
                                            {distribution.amount.toLocaleString()}원
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {distribution.profitShare}% 수익
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
};
