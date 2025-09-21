import { useState } from 'react';
import { Card, CardContent } from '../../../../shared/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../shared/ui/Table';
import { Badge } from '../../../../shared/ui/Badge';
import { Button } from '../../../../shared/ui/Button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../../shared/ui/Avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../shared/ui/Select';
import { Input } from '../../../../shared/ui/Input';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  Users,
  TrendingUp,
} from 'lucide-react';
import { useReports, useResolveReport } from '../../hooks/useAdminData';
import { getFirstChar } from '../../../../utils/typeGuards';
import { Report } from '../../types';

export function CommunityManagementSection() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const {
    data: reportsData,
    isLoading,
    error,
  } = useReports({
    status: filter === 'all' ? undefined : filter,
    page,
    limit: 20,
  });

  const resolveReport = useResolveReport();

  const reports = reportsData?.reports || [];
  const pagination = reportsData?.pagination;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className='bg-yellow-100 text-yellow-800'>대기중</Badge>;
      case 'investigating':
        return <Badge className='bg-blue-100 text-blue-800'>조사중</Badge>;
      case 'resolved':
        return <Badge className='bg-green-100 text-green-800'>해결됨</Badge>;
      case 'dismissed':
        return <Badge className='bg-gray-100 text-gray-800'>기각됨</Badge>;
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'spam':
        return <Badge className='bg-red-100 text-red-800'>스팸</Badge>;
      case 'harassment':
        return <Badge className='bg-orange-100 text-orange-800'>괴롭힘</Badge>;
      case 'inappropriate_content':
        return (
          <Badge className='bg-yellow-100 text-yellow-800'>
            부적절한 콘텐츠
          </Badge>
        );
      case 'fraud':
        return <Badge className='bg-red-100 text-red-800'>사기</Badge>;
      case 'copyright':
        return <Badge className='bg-purple-100 text-purple-800'>저작권</Badge>;
      default:
        return <Badge variant='outline'>{reason}</Badge>;
    }
  };

  const getContentTypeBadge = (type: string) => {
    switch (type) {
      case 'user':
        return <Badge className='bg-blue-100 text-blue-800'>사용자</Badge>;
      case 'project':
        return <Badge className='bg-green-100 text-green-800'>프로젝트</Badge>;
      case 'post':
        return <Badge className='bg-purple-100 text-purple-800'>게시글</Badge>;
      case 'comment':
        return <Badge className='bg-yellow-100 text-yellow-800'>댓글</Badge>;
      case 'live_stream':
        return <Badge className='bg-red-100 text-red-800'>라이브</Badge>;
      default:
        return <Badge variant='outline'>{type}</Badge>;
    }
  };

  const handleResolveReport = async (reportId: string, resolution: string) => {
    try {
      await resolveReport.mutateAsync({
        reportId,
        resolution,
        actionTaken:
          resolution === 'resolved'
            ? '신고가 수용되어 조치가 취해졌습니다.'
            : '신고가 기각되었습니다.',
        notes: '관리자에 의한 처리',
      });
    } catch (error) {
      console.error('신고 처리 실패:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='animate-pulse'>
          <div className='h-64 rounded-lg bg-gray-200'></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-12 text-center'>
        <p className='text-red-600'>
          신고 데이터를 불러오는 중 오류가 발생했습니다.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>커뮤니티 관리</h2>
        <div className='flex gap-3'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
            <Input
              placeholder='신고 내용 검색...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-64 pl-10'
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>전체</SelectItem>
              <SelectItem value='pending'>대기중</SelectItem>
              <SelectItem value='investigating'>조사중</SelectItem>
              <SelectItem value='resolved'>해결됨</SelectItem>
              <SelectItem value='dismissed'>기각됨</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 커뮤니티 통계 */}
      <div className='grid gap-6 md:grid-cols-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>미처리 신고</p>
                <p className='text-2xl font-bold text-red-600'>
                  {reports.filter((r: Report) => r.status === 'pending').length}
                </p>
              </div>
              <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-red-100'>
                <MessageSquare className='h-6 w-6 text-red-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>이번 주 게시글</p>
                <p className='text-2xl font-bold text-blue-600'>156</p>
              </div>
              <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100'>
                <MessageSquare className='h-6 w-6 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>활성 토론</p>
                <p className='text-2xl font-bold text-green-600'>42</p>
              </div>
              <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-green-100'>
                <Users className='h-6 w-6 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>활동 증가율</p>
                <p className='text-2xl font-bold text-purple-600'>+15.7%</p>
              </div>
              <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100'>
                <TrendingUp className='h-6 w-6 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>신고자</TableHead>
                <TableHead>신고 대상</TableHead>
                <TableHead>콘텐츠 유형</TableHead>
                <TableHead>신고 사유</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>담당자</TableHead>
                <TableHead>신고일</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report: Report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src={report.reporter.avatar}
                          alt={report.reporter.name}
                        />
                        <AvatarFallback>
                          {getFirstChar(report.reporter.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='font-medium'>
                          {report.reporter.name}
                        </div>
                        <div className='text-sm text-gray-500'>
                          ID: {report.reporter.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src={report.reportedUser.avatar}
                          alt={report.reportedUser.name}
                        />
                        <AvatarFallback>
                          {getFirstChar(report.reportedUser.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='font-medium'>
                          {report.reportedUser.name}
                        </div>
                        <div className='text-sm text-gray-500'>
                          ID: {report.reportedUser.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getContentTypeBadge(report.contentType)}
                  </TableCell>
                  <TableCell>{getReasonBadge(report.reason)}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    {report.assignedTo || (
                      <span className='text-gray-400'>미배정</span>
                    )}
                  </TableCell>
                  <TableCell>{report.createdAt}</TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      <Button size='sm' variant='outline' title='자세히 보기'>
                        <Eye className='h-4 w-4' />
                      </Button>
                      {report.status === 'pending' && (
                        <>
                          <Button
                            size='sm'
                            variant='outline'
                            className='text-green-600 hover:text-green-700'
                            onClick={() =>
                              handleResolveReport(
                                report.id.toString(),
                                'resolved',
                              )
                            }
                            disabled={resolveReport.isPending}
                          >
                            <CheckCircle className='h-4 w-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            className='text-red-600 hover:text-red-700'
                            onClick={() =>
                              handleResolveReport(
                                report.id.toString(),
                                'dismissed',
                              )
                            }
                            disabled={resolveReport.isPending}
                          >
                            <XCircle className='h-4 w-4' />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className='flex items-center justify-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            이전
          </Button>
          <span className='text-sm text-gray-600'>
            {page} / {pagination.totalPages} 페이지
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.totalPages}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
