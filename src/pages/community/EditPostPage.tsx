import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { ArrowLeft, Save, X } from 'lucide-react';
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
  POST_UPDATE_SUCCESS: '게시글이 성공적으로 수정되었습니다.',
  POST_UPDATE_FAILED: '게시글 수정에 실패했습니다:',
  POST_UPDATE_ERROR: '게시글 수정 중 오류가 발생했습니다:',
  UNKNOWN_ERROR: '알 수 없는 오류',
};

type CommunityPost = {
  id?: string;
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
};

export const EditPostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<CommunityPost | null>(null);
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

  // 게시글 데이터 로드
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      try {
        const fetchedPost = (await communityPostAPI.getPost(
          postId,
        )) as CommunityPost | null;

        if (fetchedPost && typeof fetchedPost === 'object') {
          setPost(fetchedPost);
          setFormData({
            title: fetchedPost.title || '',
            content: fetchedPost.content || '',
            category: fetchedPost.category || '',
            tags: Array.isArray(fetchedPost.tags)
              ? fetchedPost.tags.join(', ')
              : '',
            images: [],
          });
        } else {
          throw new Error('게시글 데이터를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('게시글 로드 실패:', error);
        window.alert('게시글을 불러올 수 없습니다.');
        navigate('/community');
      }
    };

    fetchPost();
  }, [postId, navigate]);

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

    if (!postId) {
      window.alert('게시글 ID가 없습니다.');
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

      const updateData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags
          ? formData.tags
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag)
          : [],
      };

      console.warn('게시글 수정 요청 데이터:', updateData);

      const updatedPost = (await communityPostAPI.updatePost(
        postId,
        updateData,
      )) as CommunityPost | null;

      console.warn('게시글 수정 응답:', updatedPost);

      if (updatedPost && typeof updatedPost === 'object') {
        setPost(updatedPost);
        const successMessage =
          typeof updatedPost.title === 'string' && updatedPost.title.trim()
            ? `"${updatedPost.title.trim()}" 게시글이 성공적으로 수정되었습니다.`
            : ERROR_MESSAGES.POST_UPDATE_SUCCESS;
        window.alert(successMessage);
        navigate(`/community/${postId}`);
      } else {
        window.alert(
          `${ERROR_MESSAGES.POST_UPDATE_FAILED} ${ERROR_MESSAGES.UNKNOWN_ERROR}`,
        );
      }
    } catch (error) {
      console.error('게시글 수정 오류:', error);
      window.alert(
        `${ERROR_MESSAGES.POST_UPDATE_ERROR} ${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (!post) {
    return (
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='mx-auto max-w-4xl px-4'>
          <div className='text-center'>
            <div className='text-lg'>게시글을 불러오는 중...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='mx-auto max-w-4xl px-4'>
        {/* 헤더 */}
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => navigate(-1)}
              className='flex items-center space-x-2'
            >
              <ArrowLeft className='h-4 w-4' />
              <span>뒤로가기</span>
            </Button>
            <h1 className='text-2xl font-bold text-gray-900'>게시글 수정</h1>
          </div>
        </div>

        {/* 수정 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>게시글 수정</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* 제목 */}
              <div>
                <Label htmlFor='title'>제목 *</Label>
                <Input
                  id='title'
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  placeholder='게시글 제목을 입력하세요'
                  className='mt-1'
                />
              </div>

              {/* 카테고리 */}
              <div>
                <Label htmlFor='category'>카테고리 *</Label>
                <Select
                  value={formData.category}
                  onValueChange={value => handleInputChange('category', value)}
                  disabled={categoriesLoading || loading}
                >
                  <SelectTrigger className='mt-1'>
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

              {/* 내용 */}
              <div>
                <Label htmlFor='content'>내용 *</Label>
                <Textarea
                  id='content'
                  value={formData.content}
                  onChange={e => handleInputChange('content', e.target.value)}
                  placeholder='게시글 내용을 입력하세요'
                  className='mt-1 min-h-[200px]'
                />
              </div>

              {/* 태그 */}
              <div>
                <Label htmlFor='tags'>태그</Label>
                <Input
                  id='tags'
                  value={formData.tags}
                  onChange={e => handleInputChange('tags', e.target.value)}
                  placeholder='태그를 쉼표로 구분하여 입력하세요 (예: React, JavaScript, 웹개발)'
                  className='mt-1'
                />
                <p className='mt-1 text-sm text-gray-500'>
                  태그는 쉼표(,)로 구분하여 입력하세요
                </p>
              </div>

              {/* 이미지 업로드 */}
              <div>
                <Label htmlFor='images'>이미지</Label>
                <Input
                  id='images'
                  type='file'
                  multiple
                  accept='image/*'
                  onChange={handleImageUpload}
                  className='mt-1'
                />
                {formData.images.length > 0 && (
                  <div className='mt-2 space-y-2'>
                    {formData.images.map((file, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between rounded bg-gray-100 p-2'
                      >
                        <span className='text-sm'>{file.name}</span>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => removeImage(index)}
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 버튼 */}
              <div className='flex justify-end space-x-3'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  취소
                </Button>
                <Button
                  type='submit'
                  disabled={loading}
                  className='flex items-center space-x-2'
                >
                  <Save className='h-4 w-4' />
                  <span>{loading ? '수정 중...' : '수정하기'}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
