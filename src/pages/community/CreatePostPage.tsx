import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, MessageSquare, Upload } from 'lucide-react';
import { communityPostAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    images: [] as File[]
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      window.alert('로그인이 필요합니다.');
      return;
    }

    // 필수 필드 검증
    if (!formData.title.trim()) {
      window.alert('제목을 입력해주세요.');
      return;
    }
    if (!formData.content.trim()) {
      window.alert('내용을 입력해주세요.');
      return;
    }
    if (!formData.category) {
      window.alert('카테고리를 선택해주세요.');
      return;
    }

    try {
      setLoading(true);

      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        authorId: user.id,
        authorName: user.name || user.email || '사용자'
      };

      console.warn('게시글 작성 요청 데이터:', postData);

      const response = await communityPostAPI.createPost(postData) as any;

      console.warn('게시글 작성 응답:', response);

      if (response.success) {
        window.alert('게시글이 성공적으로 작성되었습니다.');
        navigate('/community');
      } else {
        window.alert(`게시글 작성에 실패했습니다: ${response.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('게시글 작성 오류:', error);
      window.alert(`게시글 작성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/community')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            커뮤니티로 돌아가기
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">새 게시글 작성</h1>
          <p className="text-gray-600 mt-2">커뮤니티에 새로운 이야기를 공유해보세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                게시글 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-red-500 font-semibold">
                  제목 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="게시글 제목을 입력하세요"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-red-500 font-semibold">
                  카테고리 <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">일반</SelectItem>
                    <SelectItem value="question">질문</SelectItem>
                    <SelectItem value="share">공유</SelectItem>
                    <SelectItem value="collaboration">협업</SelectItem>
                    <SelectItem value="feedback">피드백</SelectItem>
                    <SelectItem value="announcement">공지</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content" className="text-red-500 font-semibold">
                  내용 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="게시글 내용을 입력하세요"
                  rows={10}
                  required
                />
              </div>

              <div>
                <Label htmlFor="tags">태그</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 음악, 협업, 질문)"
                />
              </div>
            </CardContent>
          </Card>

          {/* 이미지 업로드 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                이미지 첨부
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="images">이미지 업로드 (최대 5개)</Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="mt-2"
                  />
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`첨부 이미지 ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
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
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/community')}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo hover:bg-indigo/90"
            >
              {loading ? '작성 중...' : '게시글 작성하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
