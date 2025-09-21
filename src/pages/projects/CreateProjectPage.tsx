import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Label } from '@radix-ui/react-label';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/ui';
import { ArrowLeft, Upload, DollarSign, Target } from 'lucide-react';
import { FundingModeSelector } from '@/features/funding/components';
import { fundingAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// 타입 정의
declare global {
  interface Window {
    alert: (message?: any) => void;
  }
}

type FundingMode = 'all-or-nothing' | 'flexible';

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    goal: '',
    duration: '',
    revenueShare: '',
    tags: '',
    image: null as File | null,
    fundingMode: 'all-or-nothing' as FundingMode,
    secretPerks: '',
  });

  // 숫자 포맷팅 함수 (3자리마다 콤마)
  const formatNumber = (value: string) => {
    const num = value.replace(/,/g, '');
    if (isNaN(Number(num))) return value;
    return Number(num).toLocaleString();
  };

  // 숫자 입력을 위한 함수
  const handleNumberChange = (field: string, value: string) => {
    const num = value.replace(/,/g, '');
    if (num === '' || !isNaN(Number(num))) {
      setFormData(prev => ({
        ...prev,
        [field]: num,
      }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      window.alert('로그인이 필요합니다.');
      return;
    }

    // 클라이언트 검증
    if (
      !formData.title ||
      !formData.description ||
      !formData.category ||
      !formData.goal ||
      !formData.duration
    ) {
      window.alert(
        '제목, 설명, 카테고리, 목표 금액, 기간을 모두 입력해주세요.',
      );
      return;
    }

    const goalAmount = parseInt(formData.goal.replace(/,/g, ''));
    const duration = parseInt(formData.duration);

    if (goalAmount < 100000) {
      window.alert('목표 금액은 10만원 이상이어야 합니다.');
      return;
    }

    if (duration < 1) {
      window.alert('기간은 1일 이상이어야 합니다.');
      return;
    }

    try {
      setLoading(true);

      // 현재 날짜와 종료 날짜 계산
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration);

      const secretPerks = formData.secretPerks
        .split('\n')
        .map(perk => perk.trim())
        .filter(Boolean);

      const projectData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        goalAmount: goalAmount,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
        fundingMode: formData.fundingMode,
        secretPerks,
        rewards: [], // 기본 보상 없음
        executionPlan: formData.description, // 실행 계획은 설명으로 대체
      };

      const response = (await fundingAPI.createProject(projectData)) as any;

      if (response.success) {
        window.alert('프로젝트가 성공적으로 등록되었습니다.');
        navigate('/projects');
      } else {
        window.alert('프로젝트 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로젝트 등록 오류:', error);
      window.alert('프로젝트 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-surface py-8'>
      <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <Button
            variant='ghost'
            size='sm'
            tone='default'
            className='mb-4'
            onClick={() => navigate('/projects')}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            프로젝트 목록으로 돌아가기
          </Button>
          <h1 className='text-3xl font-bold text-foreground'>
            새 프로젝트 등록
          </h1>
          <p className='mt-2 text-base text-muted-foreground'>
            당신의 창작 프로젝트를 등록하고 후원을 받아보세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-8'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-foreground'>
                <Target className='h-5 w-5 text-primary-500' />
                카테고리 선택
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='category'
                  className='text-sm font-semibold text-foreground'
                >
                  카테고리 <span className='text-danger-500'>*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={value => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='카테고리를 선택하세요' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='music'>음악</SelectItem>
                    <SelectItem value='art'>미술</SelectItem>
                    <SelectItem value='design'>디자인</SelectItem>
                    <SelectItem value='writing'>글쓰기</SelectItem>
                    <SelectItem value='video'>영상</SelectItem>
                    <SelectItem value='other'>기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-foreground'>
                <Target className='h-5 w-5 text-primary-500' />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-2'>
                <Label
                  htmlFor='title'
                  className='text-sm font-semibold text-foreground'
                >
                  프로젝트 제목 <span className='text-danger-500'>*</span>
                </Label>
                <Input
                  id='title'
                  value={formData.title}
                  onChange={event =>
                    handleInputChange('title', event.target.value)
                  }
                  placeholder='프로젝트 제목을 입력하세요'
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='description'
                  className='text-sm font-semibold text-foreground'
                >
                  프로젝트 설명 <span className='text-danger-500'>*</span>
                </Label>
                <Textarea
                  id='description'
                  value={formData.description}
                  onChange={event =>
                    handleInputChange('description', event.target.value)
                  }
                  placeholder='프로젝트에 대한 상세한 설명을 입력하세요'
                  rows={6}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='tags'
                  className='text-sm font-semibold text-foreground'
                >
                  태그
                </Label>
                <Input
                  id='tags'
                  value={formData.tags}
                  onChange={event =>
                    handleInputChange('tags', event.target.value)
                  }
                  placeholder='태그를 쉼표로 구분하여 입력하세요 (예: 음악, 앨범, 인디)'
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <FundingModeSelector
                value={formData.fundingMode}
                onChange={mode => handleInputChange('fundingMode', mode)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-foreground'>
                <DollarSign className='h-5 w-5 text-primary-500' />
                펀딩 정보
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-2'>
                <Label
                  htmlFor='goal'
                  className='text-sm font-semibold text-foreground'
                >
                  목표 금액 (원) <span className='text-danger-500'>*</span>
                </Label>
                <Input
                  id='goal'
                  value={formData.goal ? formatNumber(formData.goal) : ''}
                  onChange={event =>
                    handleNumberChange('goal', event.target.value)
                  }
                  placeholder='1,000,000'
                  required
                />
                <p className='text-sm text-muted-foreground'>
                  숫자만 입력하세요. 자동으로 콤마가 추가됩니다.
                </p>
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='duration'
                  className='text-sm font-semibold text-foreground'
                >
                  펀딩 기간 (일) <span className='text-danger-500'>*</span>
                </Label>
                <Input
                  id='duration'
                  type='number'
                  value={formData.duration}
                  onChange={event =>
                    handleInputChange('duration', event.target.value)
                  }
                  placeholder='30'
                  min='1'
                  max='365'
                  required
                />
                <p className='text-sm text-muted-foreground'>
                  1일부터 365일까지 설정 가능합니다.
                </p>
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='revenueShare'
                  className='text-sm font-semibold text-foreground'
                >
                  수익 공유율 (%) <span className='text-danger-500'>*</span>
                </Label>
                <Input
                  id='revenueShare'
                  type='number'
                  value={formData.revenueShare}
                  onChange={event =>
                    handleInputChange('revenueShare', event.target.value)
                  }
                  placeholder='10'
                  min='1'
                  max='100'
                  required
                />
                <p className='text-sm text-muted-foreground'>
                  후원자들에게 분배할 수익의 비율을 입력하세요. (1% ~ 100%)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-foreground'>비밀 혜택 구성</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Label
                htmlFor='secretPerks'
                className='text-sm font-semibold text-foreground'
              >
                비밀 혜택 설명
              </Label>
              <Textarea
                id='secretPerks'
                value={formData.secretPerks}
                onChange={event =>
                  handleInputChange('secretPerks', event.target.value)
                }
                placeholder='예: 일정 금액 이상 후원자에게 한정판 굿즈 제공'
                rows={4}
              />
              <p className='text-sm text-muted-foreground'>
                줄바꿈으로 여러 혜택을 구분할 수 있습니다. 이 정보는 후원 완료
                시에만 공개됩니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-foreground'>
                <Upload className='h-5 w-5 text-primary-500' />
                프로젝트 이미지
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='image'
                    className='text-sm font-semibold text-foreground'
                  >
                    대표 이미지 업로드
                  </Label>
                  <Input
                    id='image'
                    type='file'
                    accept='image/*'
                    onChange={handleImageUpload}
                  />
                </div>
                {formData.image && (
                  <div className='mt-2'>
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt='프로젝트 미리보기'
                      className='h-32 w-32 rounded-2xl object-cover'
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className='flex justify-end gap-4'>
            <Button
              type='button'
              variant='outline'
              tone='muted'
              onClick={() => navigate('/projects')}
            >
              취소
            </Button>
            <Button
              type='submit'
              variant='solid'
              tone='default'
              loading={loading}
              disabled={loading}
            >
              {loading ? '등록 중...' : '프로젝트 등록하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
