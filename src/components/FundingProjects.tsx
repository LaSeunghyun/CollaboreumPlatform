import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Progress } from '@/shared/ui/Progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';
import { Input } from '@/shared/ui/Input';
import {
  Heart,
  Calendar,
  MapPin,
  Search,
  Star,
  Target,
  Eye,
} from 'lucide-react';
import { ImageWithFallback } from './atoms/ImageWithFallback';
import { PaymentModal } from './PaymentModal';
import {
  useFundingProjects,
  useBackFundingProject,
  useLikeFundingProject,
} from '../lib/api/useFunding';
import { useCategories } from '../lib/api/useCategories';
import { getFirstChar } from '../utils/typeGuards';
import { KOREAN_CATEGORIES } from '../constants/categories';
import { ACTION_LABELS } from '../constants/strings';

interface FundingProjectsProps {
  onViewProject?: (projectId: number) => void;
}

interface FundingProject {
  id: number;
  title: string;
  artist: string;
  category: string;
  thumbnail: string;
  currentAmount: number;
  targetAmount: number;
  backers: number;
  daysLeft: number;
  endDate: string;
  description: string;
  tags: string[];
  budgetBreakdown: Array<{ item: string; amount: number }>;
  rewards: Array<{ title: string; description: string; amount: number }>;
  updates: Array<{ title: string; content: string; date: string }>;
  image?: string;
  artistAvatar?: string;
  artistRating?: number;
  location?: string;
  featured?: boolean;
  isLiked?: boolean;
  isBookmarked?: boolean;
  likesCount?: number;
}

// 프로젝트 데이터 정규화 함수
const normalizeProjectData = (
  project: Partial<FundingProject>,
): FundingProject => {
  const getStringValue = (
    value: string | undefined,
    defaultValue: string,
  ): string => value || defaultValue;

  const getNumberValue = (
    value: number | undefined,
    defaultValue: number,
  ): number => value || defaultValue;

  const getArrayValue = <T,>(value: T[] | undefined, defaultValue: T[]): T[] =>
    value || defaultValue;

  const projectAny = project as any;
  const defaultImage = 'https://via.placeholder.com/400/300?text=이미지+없음';

  return {
    id: getNumberValue(project.id, 0),
    title: getStringValue(project.title, '제목 없음'),
    artist: getStringValue(
      project.artist || projectAny.creator || projectAny.artistName,
      '',
    ),
    category: getStringValue(project.category || projectAny.genre, ''),
    thumbnail: getStringValue(project.thumbnail || project.image, defaultImage),
    currentAmount: getNumberValue(
      project.currentAmount || projectAny.raisedAmount,
      0,
    ),
    targetAmount: getNumberValue(
      project.targetAmount || projectAny.goalAmount || projectAny.fundingGoal,
      0,
    ),
    backers: getNumberValue(project.backers || projectAny.supporters, 0),
    daysLeft: getNumberValue(project.daysLeft || projectAny.remainingDays, 0),
    endDate: getStringValue(
      project.endDate || projectAny.deadline || projectAny.fundingEndDate,
      '',
    ),
    description: getStringValue(project.description, '설명 없음'),
    tags: getArrayValue(project.tags || projectAny.keywords, []),
    budgetBreakdown: getArrayValue(
      project.budgetBreakdown || projectAny.budget,
      [],
    ),
    rewards: getArrayValue(project.rewards || projectAny.fundingTiers, []),
    updates: getArrayValue(project.updates || projectAny.posts, []),
    image: getStringValue(project.image || project.thumbnail, defaultImage),
    artistAvatar: getStringValue(project.artistAvatar, ''),
    artistRating: getNumberValue(project.artistRating, 0),
    location: getStringValue(project.location, '위치 정보 없음'),
    featured: project.featured || false,
    isLiked: project.isLiked || false,
    isBookmarked: project.isBookmarked || false,
    likesCount: getNumberValue(project.likesCount, 0),
  };
};

// 정렬 옵션
const SORT_OPTIONS = [
  { value: 'popular', label: '인기순' },
  { value: 'latest', label: '최신순' },
  { value: 'deadline', label: '마감임박' },
  { value: 'progress', label: '달성률' },
];

// 로딩 스켈레톤 컴포넌트
const ProjectCardSkeleton = () => (
  <Card className='overflow-hidden rounded-3xl'>
    <div className='aspect-video animate-pulse bg-muted' />
    <CardContent className='p-6'>
      <div className='mb-4 flex items-center gap-4'>
        <div className='h-12 w-12 animate-pulse rounded-full bg-muted' />
        <div className='flex-1'>
          <div className='mb-2 h-4 animate-pulse rounded bg-muted' />
          <div className='h-3 w-2/3 animate-pulse rounded bg-muted' />
        </div>
      </div>
      <div className='mb-4 space-y-2'>
        <div className='h-3 animate-pulse rounded bg-muted' />
        <div className='h-3 w-3/4 animate-pulse rounded bg-muted' />
      </div>
      <div className='mb-6 flex gap-2'>
        <div className='h-6 w-16 animate-pulse rounded bg-muted' />
        <div className='h-6 w-20 animate-pulse rounded bg-muted' />
        <div className='h-6 w-14 animate-pulse rounded bg-muted' />
      </div>
      <div className='mb-6 grid grid-cols-3 gap-4'>
        <div className='text-center'>
          <div className='mb-1 h-6 animate-pulse rounded bg-muted' />
          <div className='h-3 animate-pulse rounded bg-muted' />
        </div>
        <div className='text-center'>
          <div className='mb-1 h-6 animate-pulse rounded bg-muted' />
          <div className='h-3 animate-pulse rounded bg-muted' />
        </div>
        <div className='text-center'>
          <div className='mb-1 h-6 animate-pulse rounded bg-muted' />
          <div className='h-3 animate-pulse rounded bg-muted' />
        </div>
      </div>
      <div className='flex gap-3'>
        <div className='h-10 flex-1 animate-pulse rounded-xl bg-muted' />
        <div className='h-10 w-10 animate-pulse rounded-xl bg-muted' />
        <div className='h-10 w-10 animate-pulse rounded-xl bg-muted' />
      </div>
    </CardContent>
  </Card>
);

// 에러 상태 컴포넌트
const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className='flex min-h-screen items-center justify-center bg-background'>
    <div className='text-center'>
      <div className='bg-destructive/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full'>
        <Target className='h-10 w-10 text-destructive' />
      </div>
      <h3 className='mb-2 text-xl font-semibold text-foreground'>
        데이터를 불러올 수 없습니다
      </h3>
      <p className='mb-6 text-muted-foreground' aria-live='polite'>
        {error}
      </p>
      <Button onClick={onRetry} className='hover:bg-primary/90 bg-primary'>
        다시 시도
      </Button>
    </div>
  </div>
);

// 빈 상태 컴포넌트
const EmptyState = () => (
  <div className='py-20 text-center'>
    <div className='glass-morphism rounded-3xl p-12'>
      <Target className='mx-auto mb-6 h-20 w-20 text-muted-foreground' />
      <h3 className='mb-4 text-2xl font-semibold text-foreground'>
        검색 결과가 없습니다
      </h3>
      <p className='text-lg text-muted-foreground'>
        다른 검색어나 카테고리를 시도해보세요
      </p>
    </div>
  </div>
);

// 프로젝트 카드 컴포넌트
const ProjectCard = ({
  project,
  onBackProject,
  onViewProject,
  onLikeProject,
}: {
  project: FundingProject;
  onBackProject: (project: FundingProject) => void;
  onViewProject: (project: FundingProject) => void;
  onLikeProject: (project: FundingProject) => void;
}) => {
  const getProgressPercentage = (current: number, target: number) => {
    if (!current || !target || target <= 0) return 0;
    if (typeof current !== 'number' || typeof target !== 'number') return 0;
    if (isNaN(current) || isNaN(target)) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const calculateSuccessRate = (current: number, target: number) => {
    if (!current || !target || target <= 0) return 0;
    if (typeof current !== 'number' || typeof target !== 'number') return 0;
    if (isNaN(current) || isNaN(target)) return 0;
    return Math.round((current / target) * 100);
  };

  const progressPercentage = getProgressPercentage(
    project.currentAmount,
    project.targetAmount,
  );
  const successRate = calculateSuccessRate(
    project.currentAmount,
    project.targetAmount,
  );

  return (
    <Card
      className='hover:shadow-apple-lg group cursor-pointer overflow-hidden rounded-3xl transition-all duration-300'
      role='article'
      aria-label={`${project.title} 프로젝트`}
    >
      <div className='relative aspect-video'>
        <ImageWithFallback
          src={project.image || project.thumbnail}
          alt={project.title}
          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
        />
        {project.featured && (
          <Badge className='absolute left-4 top-4 rounded-xl bg-warning font-medium text-warning-foreground'>
            주목 프로젝트
          </Badge>
        )}
        <Badge
          className={`absolute right-4 top-4 rounded-xl font-medium ${
            project.category === '음악'
              ? 'bg-primary text-primary-foreground'
              : project.category === '미술'
                ? 'bg-accent text-accent-foreground'
                : project.category === '문학'
                  ? 'bg-success text-success-foreground'
                  : 'bg-destructive text-destructive-foreground'
          }`}
        >
          {project.category}
        </Badge>
        <div className='absolute bottom-4 left-4 right-4'>
          <div className='glass-morphism rounded-2xl p-4 text-white'>
            <div className='mb-2 flex justify-between text-sm'>
              <span className='font-medium'>
                ₩{(project.currentAmount || 0).toLocaleString()}
              </span>
              <span className='font-medium'>
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={progressPercentage}
              className='h-2 bg-white/20'
              aria-label={`진행률 ${progressPercentage.toFixed(1)}%`}
            />
          </div>
        </div>
      </div>

      <CardContent className='p-6'>
        <div className='mb-4 flex items-center gap-4'>
          <Avatar className='h-12 w-12'>
            <AvatarImage
              src={project.artistAvatar || ''}
              alt={project.artist}
            />
            <AvatarFallback>{getFirstChar(project.artist)}</AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <h3 className='line-clamp-1 text-lg font-semibold text-foreground'>
              {project.title}
            </h3>
            <div className='flex items-center gap-2'>
              <p className='text-sm text-muted-foreground'>
                by {project.artist}
              </p>
              <div className='flex items-center gap-1'>
                <Star className='h-3 w-3 fill-current text-primary' />
                <span className='text-xs text-muted-foreground'>
                  {project.artistRating || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className='text-foreground/80 mb-4 line-clamp-2 text-sm leading-relaxed'>
          {project.description}
        </p>

        <div className='mb-6 flex flex-wrap gap-2'>
          {(project.tags || []).map((tag: string, index: number) => (
            <Badge
              key={index}
              variant='secondary'
              className='bg-secondary/80 rounded-lg px-3 py-1 text-xs text-foreground'
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className='mb-6 grid grid-cols-3 gap-4 text-center text-sm'>
          <div>
            <p className='text-lg font-bold text-foreground'>
              {project.backers}
            </p>
            <p className='font-medium text-muted-foreground'>후원자</p>
          </div>
          <div>
            <p className='text-lg font-bold text-foreground'>
              {project.daysLeft}
            </p>
            <p className='font-medium text-muted-foreground'>일 남음</p>
          </div>
          <div>
            <p className='text-lg font-bold text-foreground'>{successRate}%</p>
            <p className='font-medium text-muted-foreground'>성공률</p>
          </div>
        </div>

        <div className='mb-6 flex items-center justify-between text-sm text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <MapPin className='h-4 w-4' />
            <span>{project.location || '위치 정보 없음'}</span>
          </div>
          <div className='flex items-center gap-1'>
            <Calendar className='h-4 w-4' />
            <span>~{project.endDate}</span>
          </div>
        </div>

        <div className='flex gap-3'>
          <Button
            className='hover:bg-primary/90 flex-1 rounded-xl bg-primary font-medium text-primary-foreground'
            onClick={() => onBackProject(project)}
            aria-label={`${project.title} 프로젝트 후원하기`}
          >
            후원하기
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='hover:bg-secondary/50 cursor-pointer rounded-xl px-4'
            onClick={() => onViewProject(project)}
            aria-label={`${project.title} 프로젝트 상세보기`}
          >
            <Eye className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            className={`hover:bg-secondary/50 cursor-pointer rounded-xl px-4 ${
              project.isLiked ? 'text-primary' : ''
            }`}
            onClick={() => onLikeProject(project)}
            aria-label={`${project.title} 프로젝트 좋아요 ${project.isLiked ? '취소' : ''}`}
          >
            <Heart
              className={`h-4 w-4 ${project.isLiked ? 'fill-current' : ''}`}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export function FundingProjects({
  onViewProject: _onViewProject,
}: FundingProjectsProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('인기순');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProjectForPayment, setSelectedProjectForPayment] =
    useState<FundingProject | null>(null);

  // API 훅 사용
  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useFundingProjects({
    category: selectedCategory !== '전체' ? selectedCategory : undefined,
    search: searchQuery || undefined,
    sortBy: sortBy,
    page: 1,
    limit: 20,
  });

  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();

  const backProjectMutation = useBackFundingProject();
  const likeProjectMutation = useLikeFundingProject();

  // 프로젝트 데이터 정규화
  const projects = useMemo(() => {
    if (!projectsData) return [];
    const data = projectsData as any;
    if (!data?.data?.projects) return [];
    return data.data.projects.map((project: any) =>
      normalizeProjectData(project),
    );
  }, [projectsData]);

  // 카테고리 데이터 처리
  const categories = useMemo(() => {
    if (categoriesLoading) return ['전체'];
    if (Array.isArray(categoriesData)) {
      return ['전체', ...categoriesData];
    }
    if (
      (categoriesData as any)?.data &&
      Array.isArray((categoriesData as any).data)
    ) {
      const categoryLabels = (categoriesData as any).data.map(
        (cat: { label?: string; name?: string }) => cat.label || cat.name || '',
      );
      return [
        '전체',
        ...categoryLabels.filter((label: string) => label !== ''),
      ];
    }
    return KOREAN_CATEGORIES;
  }, [categoriesData, categoriesLoading]);

  const handleBackProject = (project: FundingProject) => {
    setSelectedProjectForPayment(project);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentData: {
    amount: number;
    message?: string;
    rewardId?: string;
  }) => {
    if (!selectedProjectForPayment) return;

    try {
      const response = await backProjectMutation.mutateAsync({
        projectId: selectedProjectForPayment.id.toString(),
        amount: paymentData.amount,
        message: paymentData.message || '',
        rewardId: paymentData.rewardId,
      });

      if (response.success) {
        setShowPaymentModal(false);
        setSelectedProjectForPayment(null);
        // React Query가 자동으로 데이터를 새로고침함
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const handleViewProject = (project: FundingProject) => {
    try {
      // 팝업창으로 프로젝트 상세 정보 표시
      const popup = window.open(
        '',
        '_blank',
        'width=600,height=400,scrollbars=yes,resizable=yes',
      );
      if (popup) {
        popup.document.write(`
          <html>
            <head>
              <title>${project.title} - 상세 정보</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                .info { margin: 10px 0; }
                .close-btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${project.title}</h1>
                <p><strong>아티스트:</strong> ${project.artist || '정보 없음'}</p>
              </div>
              <div class="info">
                <p><strong>설명:</strong> ${project.description || '설명 없음'}</p>
                <p><strong>목표 금액:</strong> ₩${(project.targetAmount || 0).toLocaleString()}</p>
                <p><strong>현재 금액:</strong> ₩${(project.currentAmount || 0).toLocaleString()}</p>
                <p><strong>후원자 수:</strong> ${project.backers || 0}명</p>
              </div>
              <button class="close-btn" onclick="window.close()">${ACTION_LABELS.CLOSE}</button>
            </body>
          </html>
        `);
        popup.document.close();
      }
    } catch (error) {
      console.error('Failed to open project details:', error);
    }
  };

  const handleLikeProject = async (project: FundingProject) => {
    try {
      await likeProjectMutation.mutateAsync({
        projectId: project.id.toString(),
      });
    } catch (error) {
      console.error('Failed to like project:', error);
    }
  };

  const handleRetry = () => {
    refetchProjects();
  };

  // 로딩 상태
  if (projectsLoading) {
    return (
      <section
        id='projects'
        className='to-secondary/10 bg-gradient-to-b from-background py-24 lg:py-32'
      >
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mb-20 text-center'>
            <div className='from-primary/10 to-primary/5 mb-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-6 py-3 text-sm font-semibold text-primary'>
              <span className='text-lg'>🎯</span>
              활발한 펀딩 프로젝트
            </div>
            <h2 className='mb-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl'>
              창의적인 <span className='text-primary'>프로젝트</span>를
              후원하세요
            </h2>
            <p className='mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl'>
              독립 아티스트들의 꿈을 현실로 만들어가는 프로젝트들을 만나보세요
            </p>
          </div>

          <div
            className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'
            aria-busy='true'
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 에러 상태
  if (projectsError) {
    return (
      <ErrorState
        error={
          projectsError instanceof Error
            ? projectsError.message
            : '알 수 없는 오류가 발생했습니다.'
        }
        onRetry={handleRetry}
      />
    );
  }

  return (
    <section
      id='projects'
      className='to-secondary/10 bg-gradient-to-b from-background py-24 lg:py-32'
    >
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-20 text-center'>
          <div className='from-primary/10 to-primary/5 mb-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-6 py-3 text-sm font-semibold text-primary'>
            <span className='text-lg'>🎯</span>
            활발한 펀딩 프로젝트
          </div>
          <h2 className='mb-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl'>
            창의적인 <span className='text-primary'>프로젝트</span>를 후원하세요
          </h2>
          <p className='mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl'>
            독립 아티스트들의 꿈을 현실로 만들어가는 프로젝트들을 만나보세요
          </p>
        </div>

        {/* Filters */}
        <div className='mb-12 flex flex-col gap-4 lg:flex-row'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
              <Input
                placeholder='프로젝트나 아티스트 이름으로 검색...'
                className='h-10 rounded-lg border border-border bg-background pl-10'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label='프로젝트 검색'
              />
            </div>
          </div>

          <div className='flex gap-3'>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className='h-10 w-24 rounded-lg border border-border bg-background'>
                <SelectValue aria-label='카테고리 선택' />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className='h-10 w-24 rounded-lg border border-border bg-background'>
                <SelectValue aria-label='정렬 기준 선택' />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {projects.map((project: FundingProject) => (
            <ProjectCard
              key={project.id}
              project={project}
              onBackProject={handleBackProject}
              onViewProject={handleViewProject}
              onLikeProject={handleLikeProject}
            />
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && !projectsLoading && <EmptyState />}

        {/* Load More */}
        <div className='mt-16 text-center'>
          <Button
            variant='outline'
            size='lg'
            className='bg-background/80 hover:bg-secondary/50 cursor-pointer rounded-2xl px-8 py-4 font-medium text-foreground backdrop-blur-sm'
          >
            더 많은 프로젝트 보기
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedProjectForPayment && (
        <PaymentModal
          project={selectedProjectForPayment}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedProjectForPayment(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </section>
  );
}
