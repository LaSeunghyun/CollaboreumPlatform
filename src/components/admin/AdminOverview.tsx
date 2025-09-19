import { MessageSquare, Users, DollarSign, Clock } from 'lucide-react';
import { Inquiry, MatchingRequest, FinancialData } from '@/types/admin';
import { Card } from '@/shared/ui';

interface AdminOverviewProps {
    inquiries: Inquiry[];
    matchingRequests: MatchingRequest[];
    financialData: FinancialData[];
}

export const AdminOverview = ({ inquiries, matchingRequests, financialData }: AdminOverviewProps) => (
    <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>문의사항</CardTitle>
                    <MessageSquare className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>{inquiries.length}</div>
                    <p className='text-xs text-muted-foreground'>처리 대기중</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>매칭 요청</CardTitle>
                    <Users className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>{matchingRequests.length}</div>
                    <p className='text-xs text-muted-foreground'>활성 요청</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>총 수익</CardTitle>
                    <DollarSign className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>
                        ₩{financialData.reduce((sum, data) => sum + data.totalRevenue, 0).toLocaleString()}
                    </div>
                    <p className='text-xs text-muted-foreground'>이번 달</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>평균 처리시간</CardTitle>
                    <Clock className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>2.4일</div>
                    <p className='text-xs text-muted-foreground'>문의 처리</p>
                </CardContent>
            </Card>
        </div>
    </div>
);
