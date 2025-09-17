import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { Badge } from '@/shared/ui/Badge';
import { X, Plus } from 'lucide-react';
import { useCommunityCategories } from '../hooks/useCommunity';
import { PostFormProps, CreatePostData } from '../types/index';

export function PostForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'create'
}: PostFormProps) {
    const [formData, setFormData] = useState<CreatePostData>({
        title: '',
        content: '',
        category: '',
        tags: [],
        status: 'published',
        ...initialData
    });

    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { data: categoriesData } = useCommunityCategories();
    const categories = categoriesData?.categories || [];

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = '제목을 입력해주세요.';
        } else if (formData.title.length < 2) {
            newErrors.title = '제목은 2자 이상 입력해주세요.';
        } else if (formData.title.length > 100) {
            newErrors.title = '제목은 100자 이하로 입력해주세요.';
        }

        if (!formData.content.trim()) {
            newErrors.content = '내용을 입력해주세요.';
        } else if (formData.content.length < 10) {
            newErrors.content = '내용은 10자 이상 입력해주세요.';
        }

        if (!formData.category) {
            newErrors.category = '카테고리를 선택해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        onSubmit(formData);
    };

    const handleInputChange = (field: keyof CreatePostData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // 에러 메시지 제거
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleAddTag = () => {
        const tag = tagInput.trim();
        if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            handleAddTag();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {mode === 'create' ? '새 게시글 작성' : '게시글 수정'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 제목 */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            제목 *
                        </label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="게시글 제목을 입력하세요"
                            className={errors.title ? 'border-red-500' : ''}
                            disabled={isLoading}
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                        )}
                    </div>

                    {/* 카테고리 */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                            카테고리 *
                        </label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => handleInputChange('category', value)}
                            disabled={isLoading}
                        >
                            <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                                <SelectValue placeholder="카테고리를 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category && (
                            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                        )}
                    </div>

                    {/* 태그 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            태그 (최대 5개)
                        </label>
                        <div className="flex space-x-2 mb-2">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="태그를 입력하세요"
                                disabled={isLoading || formData.tags.length >= 5}
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                onClick={handleAddTag}
                                disabled={!tagInput.trim() || formData.tags.includes(tagInput.trim()) || formData.tags.length >= 5 || isLoading}
                                size="sm"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                        #{tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            disabled={isLoading}
                                            className="ml-1 hover:text-red-500"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 내용 */}
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                            내용 *
                        </label>
                        <Textarea
                            id="content"
                            value={formData.content}
                            onChange={(e) => handleInputChange('content', e.target.value)}
                            placeholder="게시글 내용을 입력하세요"
                            rows={10}
                            className={errors.content ? 'border-red-500' : ''}
                            disabled={isLoading}
                        />
                        {errors.content && (
                            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                            {formData.content.length} / 5000자
                        </p>
                    </div>

                    {/* 상태 (수정 모드에서만) */}
                    {mode === 'edit' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                게시 상태
                            </label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: 'published' | 'draft') =>
                                    setFormData(prev => ({ ...prev, status: value }))
                                }
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="published">게시</SelectItem>
                                    <SelectItem value="draft">임시저장</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* 버튼 */}
                    <div className="flex justify-end space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            취소
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? '처리 중...' : mode === 'create' ? '게시하기' : '수정하기'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
