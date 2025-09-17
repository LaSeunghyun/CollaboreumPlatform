import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Upload, Calendar, DollarSign, Users, Target } from 'lucide-react';
import { fundingAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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
    image: null as File | null
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      setLoading(true);

      const projectData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        goal: parseInt(formData.goal),
        duration: parseInt(formData.duration),
        revenueShare: parseInt(formData.revenueShare),
        tags: formData.tags.split(',').map(tag => tag.trim()),
        artistId: user.id
      };

      const response = await fundingAPI.createProject(projectData) as any;

      if (response.success) {
        alert('프로젝트가 성공적으로 등록되었습니다.');
        navigate('/projects');
      } else {
        alert('프로젝트 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로젝트 등록 오류:', error);
      alert('프로젝트 등록 중 오류가 발생했습니다.');
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
            onClick={() => navigate('/projects')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            프로젝트 목록으로 돌아가기
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">새 프로젝트 등록</h1>
          <p className="text-gray-600 mt-2">당신의 창작 프로젝트를 등록하고 후원을 받아보세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">프로젝트 제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="프로젝트 제목을 입력하세요"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">프로젝트 설명 *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="프로젝트에 대한 상세한 설명을 입력하세요"
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">카테고리 *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="music">음악</SelectItem>
                    <SelectItem value="art">미술</SelectItem>
                    <SelectItem value="design">디자인</SelectItem>
                    <SelectItem value="writing">글쓰기</SelectItem>
                    <SelectItem value="video">영상</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags">태그</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 음악, 앨범, 인디)"
                />
              </div>
            </CardContent>
          </Card>

          {/* 펀딩 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                펀딩 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="goal">목표 금액 (원) *</Label>
                <Input
                  id="goal"
                  type="number"
                  value={formData.goal}
                  onChange={(e) => handleInputChange('goal', e.target.value)}
                  placeholder="1000000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="duration">펀딩 기간 (일) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="30"
                  required
                />
              </div>

              <div>
                <Label htmlFor="revenueShare">수익 공유율 (%) *</Label>
                <Input
                  id="revenueShare"
                  type="number"
                  value={formData.revenueShare}
                  onChange={(e) => handleInputChange('revenueShare', e.target.value)}
                  placeholder="10"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  후원자들에게 분배할 수익의 비율을 입력하세요.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 프로젝트 이미지 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                프로젝트 이미지
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image">대표 이미지 업로드</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-2"
                  />
                </div>
                {formData.image && (
                  <div className="mt-4">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="프로젝트 미리보기"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
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
              onClick={() => navigate('/projects')}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo hover:bg-indigo/90"
            >
              {loading ? '등록 중...' : '프로젝트 등록하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
