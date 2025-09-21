import React, { useState } from 'react';
import { Button } from '../shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit3,
  Save,
  X,
} from 'lucide-react';
import { fundingAPI } from '../services/api';

interface ExecutionStage {
  id: string;
  name: string;
  description: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: '계획' | '진행중' | '완료' | '지연';
  progress: number;
}

interface ExecutionPlan {
  stages: ExecutionStage[];
  totalBudget: number;
}

interface ExecutionStatusProps {
  executionPlan: ExecutionPlan;
  projectStatus: string;
  isArtist: boolean;
  projectId: string;
  onUpdate: () => void;
}

export const ExecutionStatus: React.FC<ExecutionStatusProps> = ({
  executionPlan,
  projectStatus,
  isArtist,
  projectId,
  onUpdate,
}) => {
  const [stages, setStages] = useState<ExecutionStage[]>(
    executionPlan.stages || [],
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editingStage, setEditingStage] = useState<ExecutionStage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '계획':
        return 'bg-gray-100 text-gray-800';
      case '진행중':
        return 'bg-blue-100 text-blue-800';
      case '완료':
        return 'bg-green-100 text-green-800';
      case '지연':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '계획':
        return <Clock className='h-4 w-4' />;
      case '진행중':
        return <TrendingUp className='h-4 w-4' />;
      case '완료':
        return <CheckCircle className='h-4 w-4' />;
      case '지연':
        return <AlertCircle className='h-4 w-4' />;
      default:
        return <Clock className='h-4 w-4' />;
    }
  };

  const canEdit = isArtist && projectStatus === '성공';
  const totalBudget = stages.reduce((sum, stage) => sum + stage.budget, 0);
  const completedBudget = stages
    .filter(stage => stage.status === '완료')
    .reduce((sum, stage) => sum + stage.budget, 0);
  const overallProgress =
    totalBudget > 0 ? (completedBudget / totalBudget) * 100 : 0;

  const handleAddStage = () => {
    const newStage: ExecutionStage = {
      id: `stage_${Date.now()}`,
      name: '',
      description: '',
      budget: 0,
      startDate: '',
      endDate: '',
      status: '계획',
      progress: 0,
    };
    setEditingStage(newStage);
    setIsEditing(true);
  };

  const handleEditStage = (stage: ExecutionStage) => {
    setEditingStage({ ...stage });
    setIsEditing(true);
  };

  const handleSaveStage = async () => {
    if (!editingStage) return;

    // 유효성 검사
    if (
      !editingStage.name ||
      !editingStage.description ||
      editingStage.budget <= 0
    ) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      let updatedStages: ExecutionStage[];

      if (editingStage.id.startsWith('stage_')) {
        // 새 단계 추가
        updatedStages = [
          ...stages,
          { ...editingStage, id: `stage_${Date.now()}` },
        ];
      } else {
        // 기존 단계 수정
        updatedStages = stages.map(stage =>
          stage.id === editingStage.id ? editingStage : stage,
        );
      }

      // API 호출하여 집행 계획 업데이트
      const response = await fundingAPI.updateExecutionPlan(projectId, {
        stages: updatedStages,
      });

      if (
        response &&
        typeof response === 'object' &&
        'success' in response &&
        response.success
      ) {
        setStages(updatedStages);
        setIsEditing(false);
        setEditingStage(null);
        onUpdate();
      } else {
        const errorMessage =
          response && typeof response === 'object' && 'message' in response
            ? String(response.message)
            : '집행 계획 업데이트에 실패했습니다.';
        setError(errorMessage);
      }
    } catch (error) {
      console.error('집행 계획 업데이트 오류:', error);
      setError('집행 계획 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingStage(null);
    setError(null);
  };

  const handleStageStatusChange = async (
    stageId: string,
    newStatus: string,
    newProgress: number,
  ) => {
    try {
      const updatedStages = stages.map(stage =>
        stage.id === stageId
          ? {
              ...stage,
              status: newStatus as '계획' | '진행중' | '완료' | '지연',
              progress: newProgress,
            }
          : stage,
      );

      const response = await fundingAPI.updateExecutionPlan(projectId, {
        stages: updatedStages,
      });

      if (
        response &&
        typeof response === 'object' &&
        'success' in response &&
        response.success
      ) {
        setStages(updatedStages);
        onUpdate();
      }
    } catch (error) {
      console.error('단계 상태 업데이트 오류:', error);
    }
  };

  const renderStageForm = () => {
    if (!editingStage) return null;

    return (
      <Card className='border-2 border-blue-200'>
        <CardHeader>
          <CardTitle className='text-lg'>
            {editingStage.id.startsWith('stage_')
              ? '새 단계 추가'
              : '단계 수정'}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label htmlFor='stageName' className='text-sm font-medium'>
                단계명 *
              </Label>
              <Input
                id='stageName'
                value={editingStage.name}
                onChange={e =>
                  setEditingStage(prev =>
                    prev ? { ...prev, name: e.target.value } : null,
                  )
                }
                placeholder='예: 기획 및 설계'
              />
            </div>
            <div>
              <Label htmlFor='stageBudget' className='text-sm font-medium'>
                예산 (원) *
              </Label>
              <Input
                id='stageBudget'
                type='number'
                value={editingStage.budget || ''}
                onChange={e =>
                  setEditingStage(prev =>
                    prev
                      ? { ...prev, budget: parseInt(e.target.value) || 0 }
                      : null,
                  )
                }
                placeholder='1000000'
                min='0'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='stageDescription' className='text-sm font-medium'>
              설명 *
            </Label>
            <Textarea
              id='stageDescription'
              value={editingStage.description}
              onChange={e =>
                setEditingStage(prev =>
                  prev ? { ...prev, description: e.target.value } : null,
                )
              }
              placeholder='이 단계에서 수행할 작업을 상세히 설명하세요'
              rows={3}
            />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label htmlFor='stageStartDate' className='text-sm font-medium'>
                시작일 *
              </Label>
              <Input
                id='stageStartDate'
                type='date'
                value={editingStage.startDate}
                onChange={e =>
                  setEditingStage(prev =>
                    prev ? { ...prev, startDate: e.target.value } : null,
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor='stageEndDate' className='text-sm font-medium'>
                종료일 *
              </Label>
              <Input
                id='stageEndDate'
                type='date'
                value={editingStage.endDate}
                onChange={e =>
                  setEditingStage(prev =>
                    prev ? { ...prev, endDate: e.target.value } : null,
                  )
                }
              />
            </div>
          </div>

          {!editingStage.id.startsWith('stage_') && (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <Label htmlFor='stageStatus' className='text-sm font-medium'>
                  상태
                </Label>
                <Select
                  value={editingStage.status}
                  onValueChange={value =>
                    setEditingStage(prev =>
                      prev
                        ? {
                            ...prev,
                            status: value as
                              | '계획'
                              | '진행중'
                              | '완료'
                              | '지연',
                          }
                        : null,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='계획'>계획</SelectItem>
                    <SelectItem value='진행중'>진행중</SelectItem>
                    <SelectItem value='완료'>완료</SelectItem>
                    <SelectItem value='지연'>지연</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor='stageProgress' className='text-sm font-medium'>
                  진행률 (%)
                </Label>
                <Input
                  id='stageProgress'
                  type='number'
                  value={editingStage.progress || ''}
                  onChange={e =>
                    setEditingStage(prev =>
                      prev
                        ? { ...prev, progress: parseInt(e.target.value) || 0 }
                        : null,
                    )
                  }
                  placeholder='0'
                  min='0'
                  max='100'
                />
              </div>
            </div>
          )}

          {error && (
            <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
              <div className='flex items-center gap-2 text-red-800'>
                <AlertCircle className='h-4 w-4' />
                <span className='text-sm'>{error}</span>
              </div>
            </div>
          )}

          <div className='flex justify-end gap-3'>
            <Button variant='outline' onClick={handleCancelEdit}>
              <X className='mr-2 h-4 w-4' />
              취소
            </Button>
            <Button onClick={handleSaveStage} disabled={isSubmitting}>
              <Save className='mr-2 h-4 w-4' />
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-semibold'>집행 현황</h3>
          <p className='text-sm text-gray-600'>
            프로젝트 집행 계획 및 진행 상황을 관리합니다
          </p>
        </div>
        {canEdit && (
          <Button onClick={handleAddStage} disabled={isEditing}>
            <Plus className='mr-2 h-4 w-4' />
            단계 추가
          </Button>
        )}
      </div>

      {/* 전체 진행률 */}
      <Card>
        <CardHeader>
          <CardTitle>전체 집행 진행률</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='mb-4 grid grid-cols-1 gap-6 md:grid-cols-3'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                ₩{totalBudget.toLocaleString()}
              </div>
              <div className='text-sm text-gray-500'>총 예산</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                ₩{completedBudget.toLocaleString()}
              </div>
              <div className='text-sm text-gray-500'>집행 완료</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-900'>
                {Math.round(overallProgress)}%
              </div>
              <div className='text-sm text-gray-500'>전체 진행률</div>
            </div>
          </div>
          <Progress value={overallProgress} className='h-3' />
        </CardContent>
      </Card>

      {/* 단계별 집행 현황 */}
      <div className='space-y-4'>
        {stages.length === 0 ? (
          <Card>
            <CardContent className='p-8 text-center text-gray-500'>
              <Clock className='mx-auto mb-4 h-12 w-12 opacity-50' />
              <p>아직 집행 계획이 설정되지 않았습니다.</p>
              {canEdit && (
                <p className='mt-2 text-sm'>
                  단계 추가 버튼을 클릭하여 집행 계획을 설정하세요.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          stages.map((stage, index) => (
            <Card key={stage.id} className='transition-shadow hover:shadow-md'>
              <CardContent className='p-6'>
                <div className='mb-4 flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='mb-2 flex items-center gap-3'>
                      <Badge variant='outline' className='text-xs'>
                        단계 {index + 1}
                      </Badge>
                      <Badge className={getStatusColor(stage.status)}>
                        {getStatusIcon(stage.status)}
                        {stage.status}
                      </Badge>
                    </div>
                    <h4 className='mb-2 text-lg font-medium'>{stage.name}</h4>
                    <p className='mb-3 text-gray-600'>{stage.description}</p>

                    <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-3'>
                      <div>
                        <span className='text-gray-500'>예산:</span>
                        <span className='ml-2 font-medium'>
                          ₩{stage.budget.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-500'>기간:</span>
                        <span className='ml-2 font-medium'>
                          {new Date(stage.startDate).toLocaleDateString()} ~{' '}
                          {new Date(stage.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-500'>진행률:</span>
                        <span className='ml-2 font-medium'>
                          {stage.progress}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {canEdit && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleEditStage(stage)}
                      disabled={isEditing}
                    >
                      <Edit3 className='h-4 w-4' />
                    </Button>
                  )}
                </div>

                {/* 진행률 바 */}
                <div className='mb-4'>
                  <div className='mb-2 flex justify-between text-sm text-gray-600'>
                    <span>진행률</span>
                    <span>{stage.progress}%</span>
                  </div>
                  <Progress value={stage.progress} className='h-2' />
                </div>

                {/* 상태 변경 (아티스트만) */}
                {canEdit && (
                  <div className='flex items-center gap-4 border-t pt-4'>
                    <div className='flex items-center gap-2'>
                      <Label htmlFor={`status-${stage.id}`} className='text-sm'>
                        상태:
                      </Label>
                      <Select
                        value={stage.status}
                        onValueChange={value =>
                          handleStageStatusChange(
                            stage.id,
                            value,
                            stage.progress,
                          )
                        }
                      >
                        <SelectTrigger className='w-32'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='계획'>계획</SelectItem>
                          <SelectItem value='진행중'>진행중</SelectItem>
                          <SelectItem value='완료'>완료</SelectItem>
                          <SelectItem value='지연'>지연</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='flex items-center gap-2'>
                      <Label
                        htmlFor={`progress-${stage.id}`}
                        className='text-sm'
                      >
                        진행률:
                      </Label>
                      <Input
                        id={`progress-${stage.id}`}
                        type='number'
                        value={stage.progress}
                        onChange={e =>
                          handleStageStatusChange(
                            stage.id,
                            stage.status,
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className='w-20'
                        min='0'
                        max='100'
                      />
                      <span className='text-sm text-gray-500'>%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 단계 추가/수정 폼 */}
      {isEditing && renderStageForm()}
    </div>
  );
};
