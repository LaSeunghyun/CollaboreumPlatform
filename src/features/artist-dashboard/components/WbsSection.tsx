import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Edit, Plus, Trash2 } from 'lucide-react';
import { WbsSectionData } from '@/features/artist-dashboard/hooks/useArtistDashboard';

const statusToneClassMap: Record<'completed' | 'inProgress' | 'default', string> = {
  completed: 'bg-green-100 text-green-800',
  inProgress: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
};

const statusDotClassMap: Record<'completed' | 'inProgress' | 'default', string> = {
  completed: 'bg-green-500',
  inProgress: 'bg-blue-500',
  default: 'bg-gray-300',
};

interface WbsSectionProps {
  data: WbsSectionData;
}

export const WbsSection = ({ data }: WbsSectionProps) => {
  const { header, emptyState, items } = data;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>작업 분해 구조 (WBS)</h2>
          <p className='text-gray-600'>현재 프로젝트의 세부 작업 계획을 관리하세요</p>
        </div>
        <Button>
          <Plus className='mr-2 h-4 w-4' />작업 추가
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{header.title}</CardTitle>
          <p className='text-gray-600'>{header.overallProgressLabel}</p>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {emptyState.isEmpty ? (
              <div className='py-8 text-center'>
                <p className='mb-4 text-gray-500'>{emptyState.message}</p>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  {emptyState.actionLabel}
                </Button>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className='rounded-lg border border-gray-200 p-4'>
                  <div className='mb-3 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className={`h-3 w-3 rounded-full ${statusDotClassMap[item.statusTone]}`} />
                      <h4 className='font-medium'>{item.task}</h4>
                      <Badge className={`text-xs ${statusToneClassMap[item.statusTone]}`}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className='flex gap-2'>
                      <Button variant='outline' size='sm'>
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button variant='outline' size='sm' className='text-red-600'>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>

                  <div className='grid gap-4 text-sm md:grid-cols-4'>
                    <div>
                      <span className='text-gray-600'>시작일:</span>
                      <p>{item.startDate}</p>
                    </div>
                    <div>
                      <span className='text-gray-600'>종료일:</span>
                      <p>{item.endDate}</p>
                    </div>
                    <div>
                      <span className='text-gray-600'>담당자:</span>
                      <p>{item.responsible}</p>
                    </div>
                    <div>
                      <span className='text-gray-600'>진행률:</span>
                      <div className='flex items-center gap-2'>
                        <Progress value={item.progressValue} className='h-2 flex-1' />
                        <span className='font-medium'>{item.progressLabel}</span>
                      </div>
                    </div>
                  </div>

                  {item.showInProgressHint && (
                    <div className='mt-3 rounded bg-blue-50 p-2 text-sm text-blue-800'>
                      <AlertCircle className='mr-2 inline h-4 w-4' />
                      진행 중인 작업입니다. 상태를 업데이트해주세요.
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>새 작업 추가</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <label className='mb-2 block text-sm font-medium'>작업명</label>
              <Input placeholder='작업명을 입력하세요' />
            </div>
            <div>
              <label className='mb-2 block text-sm font-medium'>담당자</label>
              <Input placeholder='담당자를 입력하세요' />
            </div>
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <label className='mb-2 block text-sm font-medium'>시작일</label>
              <Input type='date' />
            </div>
            <div>
              <label className='mb-2 block text-sm font-medium'>종료일</label>
              <Input type='date' />
            </div>
          </div>
          <div>
            <label className='mb-2 block text-sm font-medium'>작업 설명</label>
            <Textarea placeholder='작업에 대한 상세 설명을 입력하세요' rows={3} />
          </div>
          <Button className='w-full'>작업 추가</Button>
        </CardContent>
      </Card>
    </div>
  );
};
