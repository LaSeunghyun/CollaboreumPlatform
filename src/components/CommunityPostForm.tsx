import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { ApiResponse, User } from '../types';

interface CommunityPostFormProps {
  onBack: () => void;
}

const CATEGORIES = [
  { value: '음악', label: '음악' },
  { value: '미술', label: '미술' },
  { value: '문학', label: '문학' },
  { value: '공연', label: '공연' },
  { value: '사진', label: '사진' },
  { value: '기타', label: '기타' }
];

export const CommunityPostForm: React.FC<CommunityPostFormProps> = ({
  onBack
}) => {
  const { user } = useAuth();
  const typedUser = user as User | null;
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '음악',
    images: [] as File[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      setError('이미지는 최대 5개까지 업로드할 수 있습니다.');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB 제한
        setError('이미지 크기는 5MB 이하여야 합니다.');
        return false;
      }
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드할 수 있습니다.');
        return false;
      }
      return true;
    });

    setFormData(prev => ({ ...prev, images: validFiles }));
    setError('');
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    if (!typedUser) {
      setError('로그인이 필요합니다.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 이미지 업로드 처리
      const imageUrls: string[] = [];

      if (formData.images.length > 0) {
        const formDataForImages = new FormData();
        formData.images.forEach((image, index) => {
          formDataForImages.append('images', image);
        });

        // 이미지 업로드는 FormData를 직접 fetch로 처리
        const token = localStorage.getItem('authToken');
        const API_BASE_URL = process.env.REACT_APP_API_URL || 
          (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://collaboreumplatform-production.up.railway.app/api');
        const imageResponse = await fetch(`${API_BASE_URL}/upload/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataForImages
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          if (imageData.success) {
            imageUrls.push(...imageData.urls);
          }
        }
      }

      // 포스트 생성
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        images: imageUrls,
        author: typedUser.id,
        authorName: typedUser.name || typedUser.username || '사용자'
      };

      const response = await authAPI.post('/community/posts', postData) as ApiResponse<any>;

      if (response.success) {
        setFormData({
          title: '',
          content: '',
          category: '음악',
          images: []
        });
        onBack(); // 포스트 생성 성공 시 뒤로가기
      } else {
        setError(response.message || '포스트 생성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('포스트 생성 오류:', error);
      setError(error.response?.data?.message || '포스트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">새 글 작성</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 제목 입력 */}
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="제목을 입력하세요"
              maxLength={200}
              required
            />
            <div className="text-sm text-gray-500 text-right">
              {formData.title.length}/200
            </div>
          </div>

          {/* 내용 입력 */}
          <div className="space-y-2">
            <Label htmlFor="content">내용</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="내용을 입력하세요"
              rows={8}
              maxLength={5000}
              required
            />
            <div className="text-sm text-gray-500 text-right">
              {formData.content.length}/5000
            </div>
          </div>

          {/* 이미지 업로드 */}
          <div className="space-y-2">
            <Label htmlFor="images">이미지 첨부 (선택사항)</Label>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
            <div className="text-sm text-gray-500">
              최대 5개, 각 파일 5MB 이하, 이미지 파일만 가능
            </div>

            {/* 이미지 미리보기 */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`미리보기 ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {/* 버튼 그룹 */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? '작성 중...' : '글 작성'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
