import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { ArrowLeft, MessageSquare, Upload } from 'lucide-react';
import { communityPostAPI } from '../../services/api/community';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../../lib/api/useCategories';

// 타입 정의
declare global {
  interface Window {
    alert: (message?: any) => void;
  }
}

// 상수 정의
const ERROR_MESSAGES = {
  LOGIN_REQUIRED: '로그인이 필요합니다.',
  TITLE_REQUIRED: '제목을 입력해주세요.',
  CONTENT_REQUIRED: '내용을 입력해주세요.',
  CATEGORY_REQUIRED: '카테고리를 선택해주세요.',
  POST_SUCCESS: '게시글이 성공적으로 작성되었습니다.',
  POST_FAILED: '게시글 작성에 실패했습니다:',
  POST_ERROR: '게시글 작성 중 오류가 발생했습니다:',
  UNKNOWN_ERROR: '알 수 없는 오류',
} as const;

export const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    images: [] as File[],
  });
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const categoryOptions = useMemo(() => {
    if (!categories || !Array.isArray(categories)) {
      return [];
    }

    const unique = new Map<string, { value: string; label: string }>();

    categories.forEach(category => {
      const rawValue =
        (category as any).value ||
        (category as any).id ||
        (category as any).name ||
        (category as any).label;

      if (!rawValue || typeof rawValue !== 'string') {
        return;
      }

      const normalizedValue = rawValue.trim();
      if (!normalizedValue) {
        return;
      }

      const label =
        (category as any).label || (category as any).name || normalizedValue;

      if (!unique.has(normalizedValue)) {
        unique.set(normalizedValue, {
          value: normalizedValue,
          label,
        });
      }
    });

    return Array.from(unique.values());
  }, [categories]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      window.alert(ERROR_MESSAGES.LOGIN_REQUIRED);
      return;
    }

    // 필수 필드 검증
    if (!formData.title.trim()) {
      window.alert(ERROR_MESSAGES.TITLE_REQUIRED);
      return;
    }
    if (!formData.content.trim()) {
      window.alert(ERROR_MESSAGES.CONTENT_REQUIRED);
      return;
    }
    if (!formData.category) {
      window.alert(ERROR_MESSAGES.CATEGORY_REQUIRED);
      return;
    }

    try {
      setLoading(true);

      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags
          ? formData.tags
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag)
          : [],
        authorId: user.id,
        authorName: user.name || user.email || '사용자',
      };

      console.warn('게시글 작성 요청 데이터:', postData);

      const createdPost = (await communityPostAPI.createPost(postData)) as any;

      console.warn('게시글 작성 응답:', createdPost);

      if (createdPost && typeof createdPost === 'object') {
        const successMessage =
          typeof createdPost.title === 'string' && createdPost.title.trim()
            ? `"${createdPost.title.trim()}" 게시글이 성공적으로 작성되었습니다.`
            : ERROR_MESSAGES.POST_SUCCESS;
        window.alert(successMessage);
        navigate('/community');
      } else {
        window.alert(
          `${ERROR_MESSAGES.POST_FAILED} ${ERROR_MESSAGES.UNKNOWN_ERROR}`,
        );
      }
    } catch (error) {
      console.error('게시글 작성 오류:', error);
      window.alert(
        `${ERROR_MESSAGES.POST_ERROR} ${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <Button
            variant='ghost'
            onClick={() => navigate('/community')}
            className='mb-4'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            커뮤니티로 돌아가기
          </Button>
          <h1 className='text-3xl font-bold text-gray-900'>새 게시글 작성</h1>
          <p className='mt-2 text-gray-600'>
            커뮤니티에 새로운 이야기를 공유해보세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-8'>
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MessageSquare className='h-5 w-5' />
                게시글 정보
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div>
                <Label
                  htmlFor='category'
                  className='font-semibold text-red-500'
                >
                  카테고리 <span className='text-red-500'>*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={value => handleInputChange('category', value)}
                  disabled={categoriesLoading || loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='카테고리를 선택하세요' />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.length === 0 ? (
                      <div className='px-3 py-2 text-sm text-gray-500'>
                        {categoriesLoading
                          ? '카테고리를 불러오는 중입니다...'
                          : '사용 가능한 카테고리가 없습니다.'}
                      </div>
                    ) : (
                      categoryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {categoriesError && (
                  <div className='mt-2 flex items-center gap-2 text-sm text-red-500'>
                    <span>카테고리를 불러오지 못했습니다.</span>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='h-6 px-2 text-xs'
                      onClick={() => refetchCategories()}
                    >
                      다시 시도
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor='title' className='font-semibold text-red-500'>
                  제목 <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='title'
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  placeholder='게시글 제목을 입력하세요'
                  required
                />
              </div>

              <div>
                <Label htmlFor='content' className='font-semibold text-red-500'>
                  내용 <span className='text-red-500'>*</span>
                </Label>
                <Textarea
                  id='content'
                  value={formData.content}
                  onChange={e => handleInputChange('content', e.target.value)}
                  placeholder='게시글 내용을 입력하세요'
                  rows={10}
                  required
                />
              </div>

              <div>
                <Label htmlFor='tags'>태그</Label>
                <Input
                  id='tags'
                  value={formData.tags}
                  onChange={e => handleInputChange('tags', e.target.value)}
                  placeholder='태그를 쉼표로 구분하여 입력하세요 (예: 음악, 협업, 질문)'
                />
              </div>
            </CardContent>
          </Card>

          {/* 이미지 업로드 */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Upload className='h-5 w-5' />
                이미지 첨부
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='images'>이미지 업로드 (최대 5개)</Label>
                  <Input
                    id='images'
                    type='file'
                    accept='image/*'
                    multiple
                    onChange={handleImageUpload}
                    className='mt-2'
                  />
                </div>

                {formData.images.length > 0 && (
                  <div className='mt-4 grid grid-cols-2 gap-4 md:grid-cols-3'>
                    {formData.images.map((image, index) => (
                      <div key={index} className='relative'>
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`첨부 이미지 ${index + 1}`}
                          className='h-32 w-full rounded-lg object-cover'
                        />
                        <Button
                          type='button'
                          variant='solid'
                          tone='danger'
                          size='sm'
                          className='absolute right-2 top-2'
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 제출 버튼 */}
          <div className='flex justify-end gap-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate('/community')}
            >
              취소
            </Button>
            <Button type='submit' disabled={loading} variant='indigo'>
              {loading ? '작성 중...' : '게시글 작성하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
