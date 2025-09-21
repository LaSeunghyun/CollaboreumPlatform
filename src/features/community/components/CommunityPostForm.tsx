// 커뮤니티 게시글 작성/수정 폼 컴포넌트
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useCreateCommunityPost,
  useUpdateCommunityPost,
  useCommunityCategories,
  type CreateCommunityPostData,
  type UpdateCommunityPostData,
} from '../index';
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingButton,
  SuccessModal,
} from '../../../shared/ui';
import { useAuth } from '../../../contexts/AuthContext';

// 폼 검증 스키마
const postFormSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(100, '제목은 100자 이하로 입력해주세요'),
  content: z
    .string()
    .min(1, '내용을 입력해주세요')
    .max(5000, '내용은 5000자 이하로 입력해주세요'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  tags: z
    .string()
    .default('')
    .transform(val =>
      val
        ? val
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean)
        : [],
    ),
  status: z.enum(['published', 'draft']).default('published'),
});

type PostFormData = z.infer<typeof postFormSchema>;

interface CommunityPostFormProps {
  postId?: string;
  initialData?: Partial<CreateCommunityPostData>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CommunityPostForm({
  postId,
  initialData,
  onSuccess,
  onCancel,
}: CommunityPostFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const createPostMutation = useCreateCommunityPost();
  const updatePostMutation = useUpdateCommunityPost();
  const { data: categories = [] } = useCommunityCategories();

  const isEditing = !!postId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      category: initialData?.category || '',
      tags: initialData?.tags
        ? Array.isArray(initialData.tags)
          ? initialData.tags.join(', ')
          : String(initialData.tags)
        : ('' as any),
      status: initialData?.status || 'published',
    },
  });

  const _watchedTags = watch('tags');

  const onSubmit = async (data: PostFormData) => {
    if (!user) {
      setSuccessMessage('로그인이 필요합니다.');
      setShowSuccessModal(true);
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditing && postId) {
        const updateData: UpdateCommunityPostData = {
          title: data.title,
          content: data.content,
          category: data.category,
          tags: data.tags,
          status: data.status,
        };
        await updatePostMutation.mutateAsync({ postId, data: updateData });
        setSuccessMessage('게시글이 수정되었습니다.');
        setShowSuccessModal(true);
      } else {
        const createData: CreateCommunityPostData = {
          title: data.title,
          content: data.content,
          category: data.category,
          tags: data.tags,
          status: data.status,
        };
        await createPostMutation.mutateAsync(createData);
        setSuccessMessage('게시글이 작성되었습니다.');
        setShowSuccessModal(true);
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('게시글 저장 실패:', error);
      const errorMessage =
        error?.message || '게시글 저장에 실패했습니다. 다시 시도해주세요.';
      setSuccessMessage(errorMessage);
      setShowSuccessModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = () => {
    if (!user) {
      return (
        <Card>
          <CardContent className='p-6 text-center'>
            <p className='mb-4 text-neutral-600'>로그인이 필요합니다.</p>
            <Button onClick={() => (window.location.href = '/login')}>
              로그인하기
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? '게시글 수정' : '게시글 작성'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit as any)} className='space-y-6'>
            {/* 제목 */}
            <div className='space-y-2'>
              <label htmlFor='title' className='text-sm font-medium'>
                제목 *
              </label>
              <Input
                id='title'
                {...register('title')}
                placeholder='제목을 입력해주세요'
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {errors.title && (
                <p
                  id='title-error'
                  className='text-sm text-danger-600'
                  role='alert'
                >
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* 카테고리 */}
            <div className='space-y-2'>
              <label htmlFor='category' className='text-sm font-medium'>
                카테고리 *
              </label>
              <Select
                value={watch('category')}
                onValueChange={value => setValue('category', value)}
              >
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className='text-sm text-danger-600' role='alert'>
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* 내용 */}
            <div className='space-y-2'>
              <label htmlFor='content' className='text-sm font-medium'>
                내용 *
              </label>
              <Textarea
                id='content'
                {...register('content')}
                placeholder='내용을 입력해주세요'
                rows={8}
                aria-describedby={errors.content ? 'content-error' : undefined}
              />
              {errors.content && (
                <p
                  id='content-error'
                  className='text-sm text-danger-600'
                  role='alert'
                >
                  {errors.content.message}
                </p>
              )}
            </div>

            {/* 태그 */}
            <div className='space-y-2'>
              <label htmlFor='tags' className='text-sm font-medium'>
                태그
              </label>
              <Input
                id='tags'
                {...register('tags')}
                placeholder='태그를 쉼표로 구분하여 입력해주세요 (예: 음악, 공연, 협업)'
              />
              <p className='text-xs text-neutral-500'>
                쉼표(,)로 구분하여 여러 태그를 입력할 수 있습니다.
              </p>
            </div>

            {/* 상태 */}
            <div className='space-y-2'>
              <label htmlFor='status' className='text-sm font-medium'>
                상태
              </label>
              <Select
                value={watch('status')}
                onValueChange={value =>
                  setValue('status', value as 'published' | 'draft')
                }
              >
                <SelectContent>
                  <SelectItem value='published'>게시</SelectItem>
                  <SelectItem value='draft'>임시저장</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 버튼 */}
            <div className='flex justify-end space-x-2'>
              {onCancel && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
              )}
              <LoadingButton type='submit' loading={isSubmitting}>
                {isSubmitting
                  ? '저장 중...'
                  : isEditing
                    ? '수정하기'
                    : '작성하기'}
              </LoadingButton>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {renderForm()}
      <SuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        title={successMessage}
        message={
          successMessage.includes('실패')
            ? '다시 시도해주세요.'
            : '게시글이 성공적으로 처리되었습니다.'
        }
      />
    </>
  );
}
