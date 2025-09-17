import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Upload, Palette, Tag, DollarSign } from 'lucide-react';
import { galleryAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const CreateArtworkPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    medium: '',
    dimensions: '',
    year: '',
    price: '',
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
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      setLoading(true);

      const artworkData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        medium: formData.medium,
        dimensions: formData.dimensions,
        year: parseInt(formData.year),
        price: parseInt(formData.price),
        tags: formData.tags.split(',').map(tag => tag.trim()),
        artistId: user.id
      };

      const response = await galleryAPI.uploadArtwork(artworkData) as any;

      if (response.success) {
        alert('작품이 성공적으로 등록되었습니다.');
        navigate('/gallery');
      } else {
        alert('작품 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('작품 등록 오류:', error);
      alert('작품 등록 중 오류가 발생했습니다.');
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
            onClick={() => navigate('/gallery')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            갤러리로 돌아가기
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">새 작품 등록</h1>
          <p className="text-gray-600 mt-2">당신의 작품을 갤러리에 등록하고 전시해보세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">작품 제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="작품 제목을 입력하세요"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">작품 설명 *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="작품에 대한 상세한 설명을 입력하세요"
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">카테고리 *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="painting">회화</SelectItem>
                      <SelectItem value="sculpture">조각</SelectItem>
                      <SelectItem value="photography">사진</SelectItem>
                      <SelectItem value="digital">디지털 아트</SelectItem>
                      <SelectItem value="illustration">일러스트</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="medium">재료/매체 *</Label>
                  <Input
                    id="medium"
                    value={formData.medium}
                    onChange={(e) => handleInputChange('medium', e.target.value)}
                    placeholder="예: 캔버스에 유화, 디지털 프린트"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dimensions">크기 *</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                    placeholder="예: 50cm x 70cm"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="year">제작 연도 *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    placeholder="2024"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">태그</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 추상화, 컬러풀, 모던)"
                />
              </div>
            </CardContent>
          </Card>

          {/* 가격 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                가격 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="price">작품 가격 (원) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="100000"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  작품 판매를 원하지 않는 경우 0을 입력하세요.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 작품 이미지 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                작품 이미지
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="images">작품 이미지 업로드 (최대 5개) *</Label>
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
                          alt={`작품 이미지 ${index + 1}`}
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
              onClick={() => navigate('/gallery')}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo hover:bg-indigo/90"
            >
              {loading ? '등록 중...' : '작품 등록하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
