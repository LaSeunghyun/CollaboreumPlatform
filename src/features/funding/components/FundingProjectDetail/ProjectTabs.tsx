import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileText, DollarSign, CheckCircle, TrendingUp } from 'lucide-react';
import { FundingProject } from '@/types/fundingProject';

interface ProjectTabsProps {
    project: FundingProject;
}

export const ProjectTabs: React.FC<ProjectTabsProps> = ({ project }) => {
    const rewards = project.rewards ?? [];
    const updates = project.updates ?? [];
    const backers = project.backersList ?? [];
    const stages = project.executionPlan?.stages ?? [];
    const expenses = project.expenseRecords ?? [];
    const revenueDistribution = project.revenueDistribution;

    const totalRevenue = revenueDistribution?.totalRevenue ?? 0;
    const artistShareAmount = revenueDistribution?.artistShare?.amount ?? 0;
    const artistSharePercentage = revenueDistribution?.artistShare?.percentage ?? 0;
    const distributions = revenueDistribution?.distributions ?? [];

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
                                {project.description || '프로젝트 소개가 아직 등록되지 않았습니다.'}
                            </p>
                        </CardContent>
                    </Card>

                {/* 리워드 목록 */}
                <Card>
                    <CardHeader>
                        <CardTitle>리워드</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {rewards.length === 0 ? (
                            <p className="text-sm text-gray-500">등록된 리워드가 없습니다.</p>
                        ) : rewards.map((reward) => (
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
                                                {(reward.amount ?? 0).toLocaleString()}원
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                예상 전달일: {reward.estimatedDelivery ? new Date(reward.estimatedDelivery).toLocaleDateString() : '미정'}
                                            </div>
                                        </div>
                                    </div>
                                    {reward.maxClaim && (
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>
                                                {(reward.claimed ?? 0)} / {reward.maxClaim}명 선택
                                            </span>
                                            <span>
                                                {reward.maxClaim ? Math.round(((reward.claimed ?? 0) / reward.maxClaim) * 100) : 0}% 완료
                                            </span>
                                        </div>
                                    )}
                                </div>
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="updates" className="space-y-4">
                {updates.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-sm text-gray-500">
                            아직 등록된 업데이트가 없습니다.
                        </CardContent>
                    </Card>
                ) : updates.map((update) => (
                    <Card key={update.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{update.title}</CardTitle>
                                <Badge variant="outline">
                                    {update.type || '일반'}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                                {update.date ? new Date(update.date).toLocaleString() : ''}
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
                    {backers.length === 0 ? (
                        <Card>
                            <CardContent className="p-6 text-sm text-gray-500 text-center">
                                아직 후원자가 없습니다.
                            </CardContent>
                        </Card>
                    ) : backers.map((backer) => (
                        <Card key={backer.id}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>
                                                {backer.userName?.charAt?.(0) ?? '익'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{backer.userName}</p>
                                            <p className="text-sm text-gray-500">
                                                {backer.date ? new Date(backer.date).toLocaleString() : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">
                                            {(backer.amount ?? 0).toLocaleString()}원
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
                        {stages.length === 0 ? (
                            <p className="text-sm text-gray-500">등록된 집행 계획이 없습니다.</p>
                        ) : stages.map((stage) => (
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
                                            {(stage.budget ?? 0).toLocaleString()}원
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
                                    <span>{stage.startDate ? new Date(stage.startDate).toLocaleDateString() : ''} ~ {stage.endDate ? new Date(stage.endDate).toLocaleDateString() : ''}</span>
                                    <span>진행률: {(stage.progress ?? 0)}%</span>
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
                        {expenses.length === 0 ? (
                            <p className="text-sm text-gray-500">등록된 지출 내역이 없습니다.</p>
                        ) : expenses.map((expense) => (
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
                                            {(expense.amount ?? 0).toLocaleString()}원
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
                                    {expense.date ? new Date(expense.date).toLocaleDateString() : ''}
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
                                    {totalRevenue.toLocaleString()}원
                                </div>
                                <div className="text-sm text-gray-500">총 수익</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {artistShareAmount.toLocaleString()}원
                                </div>
                                <div className="text-sm text-gray-500">아티스트 수익 ({artistSharePercentage}%)</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold">분배 내역</h4>
                            {distributions.length === 0 ? (
                                <p className="text-sm text-gray-500">분배 내역이 없습니다.</p>
                            ) : distributions.map((distribution) => (
                                <div
                                    key={distribution.id}
                                    className="flex justify-between items-center p-3 border rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{distribution.userName}</p>
                                        <p className="text-sm text-gray-500">
                                            원래 후원: {(distribution.originalAmount ?? 0).toLocaleString()}원
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">
                                            {(distribution.amount ?? 0).toLocaleString()}원
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
