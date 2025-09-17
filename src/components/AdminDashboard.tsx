import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import {
  ArrowLeft,
  MessageSquare,
  Users,
  DollarSign,
  Clock,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Image,
  Palette,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { dynamicConstantsService } from '../services/constantsService';
import { getFirstChar } from '../utils/typeGuards';
import { ACTION_LABELS } from '../constants/strings';

// 상태별 색상 상수
const BG_RED_100 = 'bg-red-100';
const TEXT_RED_800 = 'text-red-800';
const BG_YELLOW_100 = 'bg-yellow-100';
const TEXT_YELLOW_800 = 'text-yellow-800';
const BG_GREEN_100 = 'bg-green-100';
const TEXT_GREEN_800 = 'text-green-800';

const RED_COLOR_CLASS = `${BG_RED_100} ${TEXT_RED_800}`;
const YELLOW_COLOR_CLASS = `${BG_YELLOW_100} ${TEXT_YELLOW_800}`;
const GREEN_COLOR_CLASS = `${BG_GREEN_100} ${TEXT_GREEN_800}`;

const STATUS_COLORS = {
  WAITING: RED_COLOR_CLASS,
  IN_PROGRESS: YELLOW_COLOR_CLASS,
  COMPLETED: GREEN_COLOR_CLASS,
} as const;

const _STATUS_LABELS = {
  WAITING: '대기중',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
} as const;

// 색상 클래스 상수 (사용하지 않으므로 제거)

// 타입 정의
interface Inquiry {
  id: string;
  subject: string;
  artist: string;
  artistAvatar?: string;
  category: string;
  priority: '높음' | '중간' | '낮음';
  status: '대기' | '진행중' | '완료';
  assignedTo?: string;
  date: string;
}

interface MatchingRequest {
  id: string;
  requestType: string;
  requester: string;
  requesterCategory: string;
  description: string;
  preferredCategory: string;
  budget: string;
  timeline: string;
  status: '대기' | '진행중' | '완료';
  applications: number;
  date: string;
}

interface FinancialData {
  month: string;
  totalRevenue: number;
  platformFee: number;
  artistPayouts: number;
  investorReturns: number;
  pendingPayments: number;
}

interface ArtworkCategory {
  id: string;
  label: string;
  icon: string;
}

interface AdminDashboardProps {
  onBack?: () => void;
}

interface Artwork {
  id: number;
  title: string;
  artist: string;
  artistAvatar?: string;
  category: string;
  medium: string;
  dimensions: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  uploadDate: string;
  description: string;
  imageUrl?: string;
  tags: string[];
  views: number;
  likes: number;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [inquiryFilter, setInquiryFilter] = useState('전체');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [matchingRequests, setMatchingRequests] = useState<MatchingRequest[]>(
    [],
  );
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [artworkFilter, setArtworkFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  // 새 작품 등록을 위한 상태
  const [newArtwork, setNewArtwork] = useState({
    title: '',
    artist: '',
    category: '',
    medium: '',
    dimensions: '',
    price: 0,
    description: '',
    tags: '',
    imageUrl: '',
  });
  const [artworkCategories, setArtworkCategories] = useState<ArtworkCategory[]>(
    [],
  );

  // 이전 페이지로 돌아가기
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // 더 안정적인 뒤로가기 방법
      try {
        // 브라우저 히스토리에서 이전 페이지로 이동
        if (window.history.length > 1) {
          window.history.back();
        } else {
          // 히스토리가 없으면 홈으로 이동
          window.location.href = '/';
        }
      } catch (error) {
        console.error('뒤로가기 실패:', error);
        // 에러 발생 시 홈으로 이동
        window.location.href = '/';
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [inquiriesData, matchingData, financialData, categoriesData] =
          await Promise.all([
            adminAPI.getInquiries(),
            adminAPI.getMatchingRequests(),
            adminAPI.getFinancialData(),
            dynamicConstantsService.getArtworkCategories(),
          ]);

        setInquiries(inquiriesData as Inquiry[]);
        setMatchingRequests(matchingData as MatchingRequest[]);
        setFinancialData(financialData as FinancialData[]);
        setArtworks([]);
        setArtworkCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        // API 실패 시 빈 데이터로 설정 (더미 데이터 사용 금지)
        setInquiries([]);
        setMatchingRequests([]);
        setFinancialData([]);
        setArtworks([]);
        setArtworkCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredInquiries = inquiries.filter(
    (inquiry: Inquiry) =>
      inquiryFilter === '전체' || inquiry.status === inquiryFilter,
  );

  const filteredArtworks = artworks.filter(artwork => {
    const matchesFilter =
      artworkFilter === '전체' || artwork.status === artworkFilter;
    const matchesSearch =
      artwork.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleArtworkStatusChange = (
    artworkId: number,
    newStatus: 'pending' | 'approved' | 'rejected',
  ) => {
    setArtworks(prev =>
      prev.map(artwork =>
        artwork.id === artworkId ? { ...artwork, status: newStatus } : artwork,
      ),
    );
  };

  const handleAddArtwork = () => {
    if (newArtwork.title && newArtwork.artist && newArtwork.category) {
      const artwork: Artwork = {
        id: Date.now(),
        title: newArtwork.title,
        artist: newArtwork.artist,
        category: newArtwork.category,
        medium: newArtwork.medium,
        dimensions: newArtwork.dimensions,
        price: newArtwork.price,
        status: 'pending',
        uploadDate: new Date().toISOString().split('T')[0] || '',
        description: newArtwork.description,
        imageUrl: newArtwork.imageUrl,
        tags: newArtwork.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag),
        views: 0,
        likes: 0,
      };
      setArtworks(prev => [artwork, ...prev]);
      setNewArtwork({
        title: '',
        artist: '',
        category: '',
        medium: '',
        dimensions: '',
        price: 0,
        description: '',
        tags: '',
        imageUrl: '',
      });
    }
  };

  const handleDeleteArtwork = (artworkId: number) => {
    setArtworks(prev => prev.filter(artwork => artwork.id !== artworkId));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className='bg-warning-100 text-warning-800'>대기중</Badge>
        );
      case 'approved':
        return (
          <Badge className='bg-success-100 text-success-800'>승인됨</Badge>
        );
      case 'rejected':
        return <Badge className='bg-danger-100 text-danger-800'>거부됨</Badge>;
      default:
        return (
          <Badge className='bg-neutral-100 text-neutral-800'>{status}</Badge>
        );
    }
  };

  const getStatusActions = (artwork: Artwork) => {
    if (artwork.status === 'pending') {
      return (
        <div className='flex gap-2'>
          <Button
            size='sm'
            onClick={() => handleArtworkStatusChange(artwork.id, 'approved')}
          >
            <CheckCircle2 className='mr-1 h-4 w-4' />
            승인
          </Button>
          <Button
            size='sm'
            variant='outline'
            tone='danger'
            onClick={() => handleArtworkStatusChange(artwork.id, 'rejected')}
          >
            <XCircle className='mr-1 h-4 w-4' />
            거부
          </Button>
        </div>
      );
    }
    return (
      <Button
        size='sm'
        variant='outline'
        onClick={() => handleArtworkStatusChange(artwork.id, 'pending')}
      >
        <Clock className='mr-1 h-4 w-4' />
        재검토
      </Button>
    );
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
        <div className='text-center'>
          <div className='mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-primary-600'></div>
          <p className='mt-4 text-muted-foreground'>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8 flex items-center gap-4'>
          <Button variant='ghost' onClick={handleBack} className='p-2'>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <h1 className='text-3xl font-bold text-foreground'>
              관리자 대시보드
            </h1>
            <p className='text-muted-foreground'>
              플랫폼 운영 현황을 관리하고 모니터링하세요
            </p>
          </div>
        </div>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className='space-y-6'
        >
          <TabsList className='grid w-full grid-cols-7'>
            <TabsTrigger value='overview'>개요</TabsTrigger>
            <TabsTrigger value='inquiries'>문의사항</TabsTrigger>
            <TabsTrigger value='matching'>매칭관리</TabsTrigger>
            <TabsTrigger value='gallery'>작품갤러리</TabsTrigger>
            <TabsTrigger value='add-artwork'>새작품등록</TabsTrigger>
            <TabsTrigger value='finance'>재정관리</TabsTrigger>
            <TabsTrigger value='users'>사용자관리</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='space-y-6'>
            {/* Key Metrics */}
            <div className='grid gap-6 md:grid-cols-4'>
              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        미처리 문의
                      </p>
                      <p className='text-2xl font-bold text-danger-600'>
                        {inquiries.filter(i => i.status === '대기').length}
                      </p>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-danger-100'>
                      <MessageSquare className='h-6 w-6 text-danger-600' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-muted-foreground'>매칭 대기</p>
                      <p className='text-2xl font-bold text-warning-600'>
                        {
                          matchingRequests.filter(r => r.status === '대기')
                            .length
                        }
                      </p>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-warning-100'>
                      <Users className='h-6 w-6 text-warning-600' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        대기중 작품
                      </p>
                      <p className='text-2xl font-bold text-primary-600'>
                        {artworks.filter(a => a.status === 'pending').length}
                      </p>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100'>
                      <Palette className='h-6 w-6 text-primary-600' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        이번 달 매출
                      </p>
                      <p className='text-2xl font-bold text-success-600'>
                        ₩
                        {(() => {
                          const firstData = financialData[0];
                          return firstData
                            ? (firstData.totalRevenue / 1000000).toFixed(1)
                            : '0.0';
                        })()}
                        M
                      </p>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-success-100'>
                      <DollarSign className='h-6 w-6 text-success-600' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <div className='grid gap-6 lg:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle>최근 문의사항</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {inquiries.slice(0, 3).map(inquiry => (
                      <div
                        key={inquiry.id}
                        className='flex items-center gap-3 rounded-lg border border-gray-200 p-3'
                      >
                        <Avatar className='h-10 w-10'>
                          <AvatarImage
                            src={inquiry.artistAvatar}
                            alt={inquiry.artist}
                          />
                          <AvatarFallback>
                            {getFirstChar(inquiry.artist)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='min-w-0 flex-1'>
                          <p className='text-sm font-medium'>
                            {inquiry.subject}
                          </p>
                          <p className='text-xs text-gray-600'>
                            by {inquiry.artist}
                          </p>
                        </div>
                        <Badge
                          className={
                            inquiry.status === '대기'
                              ? STATUS_COLORS.WAITING
                              : inquiry.status === '진행중'
                                ? STATUS_COLORS.IN_PROGRESS
                                : STATUS_COLORS.COMPLETED
                          }
                        >
                          {inquiry.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>최근 등록된 작품</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {(Array.isArray(artworks) ? artworks : [])
                      .slice(0, 3)
                      .map(artwork => (
                        <div
                          key={artwork.id}
                          className='rounded-lg border border-gray-200 p-3'
                        >
                          <div className='mb-2 flex items-start justify-between'>
                            <h4 className='text-sm font-medium'>
                              {artwork.title}
                            </h4>
                            {getStatusBadge(artwork.status)}
                          </div>
                          <p className='mb-2 text-xs text-gray-600'>
                            {artwork.artist} • {artwork.category}
                          </p>
                          <p className='text-sm'>
                            {artwork.description?.substring(0, 60) ||
                              '설명 없음'}
                            ...
                          </p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inquiries Tab */}
          <TabsContent value='inquiries' className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-bold'>문의사항 관리</h2>
              <div className='flex gap-3'>
                <Select value={inquiryFilter} onValueChange={setInquiryFilter}>
                  <SelectTrigger className='w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='전체'>전체</SelectItem>
                    <SelectItem value='대기'>대기</SelectItem>
                    <SelectItem value='진행중'>진행중</SelectItem>
                    <SelectItem value='완료'>완료</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant='outline'>
                  <Filter className='mr-2 h-4 w-4' />
                  필터
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className='p-0'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>아티스트</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead>제목</TableHead>
                      <TableHead>우선순위</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>담당자</TableHead>
                      <TableHead>날짜</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInquiries.map(inquiry => (
                      <TableRow key={inquiry.id}>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-8 w-8'>
                              <AvatarImage
                                src={inquiry.artistAvatar}
                                alt={inquiry.artist}
                              />
                              <AvatarFallback>
                                {getFirstChar(inquiry.artist)}
                              </AvatarFallback>
                            </Avatar>
                            <span className='font-medium'>
                              {inquiry.artist}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline'>{inquiry.category}</Badge>
                        </TableCell>
                        <TableCell className='max-w-xs'>
                          <p className='truncate'>{inquiry.subject}</p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              inquiry.priority === '높음'
                                ? RED_COLOR_CLASS
                                : inquiry.priority === '중간'
                                  ? YELLOW_COLOR_CLASS
                                  : GREEN_COLOR_CLASS
                            }
                          >
                            {inquiry.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              inquiry.status === '대기'
                                ? 'bg-red-100 text-red-800'
                                : inquiry.status === '진행중'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }
                          >
                            {inquiry.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {inquiry.assignedTo || (
                            <span className='text-gray-400'>미배정</span>
                          )}
                        </TableCell>
                        <TableCell>{inquiry.date}</TableCell>
                        <TableCell>
                          <div className='flex gap-2'>
                            <Button
                              size='sm'
                              variant='outline'
                              title='자세히 보기'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button size='sm' variant='outline' title='수정'>
                              <Edit className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matching Tab */}
          <TabsContent value='matching' className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-bold'>아티스트 매칭 관리</h2>
              <Button>새 매칭 생성</Button>
            </div>

            <div className='space-y-6'>
              {matchingRequests.map(request => (
                <Card key={request.id}>
                  <CardContent className='p-6'>
                    <div className='mb-4 flex items-start justify-between'>
                      <div>
                        <div className='mb-2 flex items-center gap-3'>
                          <h3 className='text-lg font-medium'>
                            {request.requestType}
                          </h3>
                          <Badge
                            className={
                              request.status === '대기'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <p className='text-gray-600'>
                          요청자: <strong>{request.requester}</strong> (
                          {request.requesterCategory})
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm text-gray-600'>{request.date}</p>
                        <p className='text-sm text-blue-600'>
                          {request.applications}개 지원
                        </p>
                      </div>
                    </div>

                    <p className='mb-4 text-gray-700'>{request.description}</p>

                    <div className='mb-4 grid gap-4 text-sm md:grid-cols-3'>
                      <div>
                        <span className='font-medium text-gray-900'>
                          희망 분야:
                        </span>
                        <p className='text-gray-600'>
                          {request.preferredCategory}
                        </p>
                      </div>
                      <div>
                        <span className='font-medium text-gray-900'>예산:</span>
                        <p className='text-gray-600'>{request.budget}</p>
                      </div>
                      <div>
                        <span className='font-medium text-gray-900'>기간:</span>
                        <p className='text-gray-600'>{request.timeline}</p>
                      </div>
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex gap-2'>
                        <Button size='sm' variant='outline'>
                          지원자 보기
                        </Button>
                        <Button size='sm' variant='outline'>
                          매칭 제안
                        </Button>
                      </div>
                      <div className='flex gap-2'>
                        <Button size='sm'>승인</Button>
                        <Button size='sm' variant='outline'>
                          보류
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value='gallery' className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-bold'>작품 갤러리 관리</h2>
            </div>

            {/* 필터 및 검색 */}
            <div className='flex items-center gap-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                  <Input
                    placeholder='작품명, 아티스트, 카테고리로 검색...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <Select value={artworkFilter} onValueChange={setArtworkFilter}>
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='전체'>전체</SelectItem>
                  <SelectItem value='pending'>대기중</SelectItem>
                  <SelectItem value='approved'>승인됨</SelectItem>
                  <SelectItem value='rejected'>거부됨</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 작품 목록 */}
            <Card>
              <CardContent className='p-0'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>작품</TableHead>
                      <TableHead>아티스트</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead>가격</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>조회수</TableHead>
                      <TableHead>등록일</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArtworks.map(artwork => (
                      <TableRow key={artwork.id}>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            <div className='flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100'>
                              {artwork.imageUrl ? (
                                <img
                                  src={artwork.imageUrl}
                                  alt={artwork.title}
                                  className='h-full w-full rounded-lg object-cover'
                                />
                              ) : (
                                <Image className='h-6 w-6 text-gray-400' />
                              )}
                            </div>
                            <div>
                              <p className='font-medium'>{artwork.title}</p>
                              <p className='text-sm text-gray-600'>
                                {artwork.medium} • {artwork.dimensions}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Avatar className='h-8 w-8'>
                              <AvatarImage
                                src={artwork.artistAvatar}
                                alt={artwork.artist}
                              />
                              <AvatarFallback>
                                {getFirstChar(artwork.artist)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{artwork.artist}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline'>{artwork.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className='font-medium'>
                            ₩{artwork.price?.toLocaleString() || '0'}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(artwork.status)}</TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1'>
                            <Eye className='h-4 w-4 text-gray-400' />
                            <span>{artwork.views}</span>
                          </div>
                        </TableCell>
                        <TableCell>{artwork.uploadDate}</TableCell>
                        <TableCell>
                          <div className='flex gap-2'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => setSelectedArtwork(artwork)}
                              title='자세히 보기'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button size='sm' variant='outline' title='수정'>
                              <Edit className='h-4 w-4' />
                            </Button>
                            {getStatusActions(artwork)}
                            <Button
                              size='sm'
                              variant='outline'
                              tone='danger'
                              onClick={() => handleDeleteArtwork(artwork.id)}
                              title='삭제'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Artwork Tab */}
          <TabsContent value='add-artwork' className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-bold'>새 작품 등록</h2>
            </div>

            <Card>
              <CardContent className='p-6'>
                <div className='space-y-6'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='title'>작품명 *</Label>
                      <Input
                        id='title'
                        value={newArtwork.title}
                        onChange={e =>
                          setNewArtwork(prev => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder='작품명을 입력하세요'
                      />
                    </div>
                    <div>
                      <Label htmlFor='artist'>아티스트 *</Label>
                      <Input
                        id='artist'
                        value={newArtwork.artist}
                        onChange={e =>
                          setNewArtwork(prev => ({
                            ...prev,
                            artist: e.target.value,
                          }))
                        }
                        placeholder='아티스트명을 입력하세요'
                      />
                    </div>
                  </div>
                  <div className='grid grid-cols-3 gap-4'>
                    <div>
                      <Label htmlFor='category'>카테고리 *</Label>
                      <Select
                        value={newArtwork.category}
                        onValueChange={value =>
                          setNewArtwork(prev => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='카테고리 선택' />
                        </SelectTrigger>
                        <SelectContent>
                          {artworkCategories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.icon} {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor='medium'>재료</Label>
                      <Input
                        id='medium'
                        value={newArtwork.medium}
                        onChange={e =>
                          setNewArtwork(prev => ({
                            ...prev,
                            medium: e.target.value,
                          }))
                        }
                        placeholder='재료를 입력하세요'
                      />
                    </div>
                    <div>
                      <Label htmlFor='dimensions'>크기</Label>
                      <Input
                        id='dimensions'
                        value={newArtwork.dimensions}
                        onChange={e =>
                          setNewArtwork(prev => ({
                            ...prev,
                            dimensions: e.target.value,
                          }))
                        }
                        placeholder='예: 100x80cm'
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor='price'>가격</Label>
                    <Input
                      id='price'
                      type='number'
                      value={newArtwork.price}
                      onChange={e =>
                        setNewArtwork(prev => ({
                          ...prev,
                          price: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder='가격을 입력하세요'
                    />
                  </div>
                  <div>
                    <Label htmlFor='description'>설명</Label>
                    <Textarea
                      id='description'
                      value={newArtwork.description}
                      onChange={e =>
                        setNewArtwork(prev => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder='작품에 대한 설명을 입력하세요'
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor='tags'>태그</Label>
                    <Input
                      id='tags'
                      value={newArtwork.tags}
                      onChange={e =>
                        setNewArtwork(prev => ({
                          ...prev,
                          tags: e.target.value,
                        }))
                      }
                      placeholder='쉼표로 구분하여 태그를 입력하세요'
                    />
                  </div>
                  <div>
                    <Label htmlFor='imageUrl'>이미지 URL</Label>
                    <Input
                      id='imageUrl'
                      value={newArtwork.imageUrl}
                      onChange={e =>
                        setNewArtwork(prev => ({
                          ...prev,
                          imageUrl: e.target.value,
                        }))
                      }
                      placeholder='이미지 URL을 입력하세요'
                    />
                  </div>
                  <div className='flex justify-end gap-2 pt-4'>
                    <Button
                      variant='outline'
                      onClick={() => {
                        setNewArtwork({
                          title: '',
                          artist: '',
                          category: '',
                          medium: '',
                          dimensions: '',
                          price: 0,
                          description: '',
                          tags: '',
                          imageUrl: '',
                        });
                      }}
                    >
                      초기화
                    </Button>
                    <Button onClick={handleAddArtwork}>
                      <Plus className='mr-2 h-4 w-4' />
                      작품 등록
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Finance Tab */}
          <TabsContent value='finance' className='space-y-6'>
            <h2 className='text-2xl font-bold'>재정 관리</h2>

            <div className='space-y-6'>
              {financialData.map((data, _index) => (
                <Card key={data.month}>
                  <CardHeader>
                    <CardTitle>{data.month} 재정 현황</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='grid gap-6 md:grid-cols-5'>
                      <div className='rounded-lg bg-blue-50 p-4 text-center'>
                        <p className='mb-1 text-sm text-gray-600'>총 매출</p>
                        <p className='text-xl font-bold text-blue-600'>
                          ₩{(data.totalRevenue / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div className='rounded-lg bg-green-50 p-4 text-center'>
                        <p className='mb-1 text-sm text-gray-600'>
                          플랫폼 수수료
                        </p>
                        <p className='text-xl font-bold text-green-600'>
                          ₩{(data.platformFee / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div className='rounded-lg bg-purple-50 p-4 text-center'>
                        <p className='mb-1 text-sm text-gray-600'>
                          아티스트 정산
                        </p>
                        <p className='text-xl font-bold text-purple-600'>
                          ₩{(data.artistPayouts / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div className='rounded-lg bg-yellow-50 p-4 text-center'>
                        <p className='mb-1 text-sm text-gray-600'>
                          투자자 수익
                        </p>
                        <p className='text-xl font-bold text-yellow-600'>
                          ₩{(data.investorReturns / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div className='rounded-lg bg-red-50 p-4 text-center'>
                        <p className='mb-1 text-sm text-gray-600'>보류 결제</p>
                        <p className='text-xl font-bold text-red-600'>
                          ₩{(data.pendingPayments / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value='users' className='space-y-6'>
            <div className='py-12 text-center'>
              <p className='text-gray-500'>
                사용자 관리 기능을 준비 중입니다...
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 작품 상세보기 다이얼로그 */}
      <Dialog
        open={!!selectedArtwork}
        onOpenChange={() => setSelectedArtwork(null)}
      >
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>{selectedArtwork?.title}</DialogTitle>
          </DialogHeader>
          {selectedArtwork && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-gray-700'>
                    아티스트
                  </Label>
                  <p className='text-gray-900'>{selectedArtwork.artist}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-gray-700'>
                    카테고리
                  </Label>
                  <p className='text-gray-900'>{selectedArtwork.category}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-gray-700'>
                    재료
                  </Label>
                  <p className='text-gray-900'>{selectedArtwork.medium}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-gray-700'>
                    크기
                  </Label>
                  <p className='text-gray-900'>{selectedArtwork.dimensions}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-gray-700'>
                    가격
                  </Label>
                  <p className='text-gray-900'>
                    ₩{selectedArtwork.price?.toLocaleString() || '0'}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-gray-700'>
                    상태
                  </Label>
                  <div className='mt-1'>
                    {getStatusBadge(selectedArtwork.status)}
                  </div>
                </div>
              </div>
              <div>
                <Label className='text-sm font-medium text-gray-700'>
                  설명
                </Label>
                <p className='mt-1 text-gray-900'>
                  {selectedArtwork.description}
                </p>
              </div>
              <div>
                <Label className='text-sm font-medium text-gray-700'>
                  태그
                </Label>
                <div className='mt-1 flex flex-wrap gap-2'>
                  {selectedArtwork.tags?.map((tag, index) => (
                    <Badge key={index} variant='outline'>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  variant='outline'
                  onClick={() => setSelectedArtwork(null)}
                >
                  {ACTION_LABELS.CLOSE}
                </Button>
                <Button
                  onClick={() =>
                    handleArtworkStatusChange(selectedArtwork.id, 'approved')
                  }
                >
                  승인
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
