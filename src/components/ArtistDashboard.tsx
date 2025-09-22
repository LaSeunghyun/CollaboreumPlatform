import React, { useState, useEffect } from 'react';
// import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from '../shared/ui/Button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { artistAPI } from '../services/api/artist';
import { useAuth } from '../contexts/AuthContext';

export function ArtistDashboard() {
  const [artistData, setArtistData] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [wbsItems, setWbsItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // 아티스트 데이터 로드
  useEffect(() => {
    const loadArtistData = async () => {
      try {
        setLoading(true);

        if (!user?.id) {
          throw new Error('사용자 정보를 찾을 수 없습니다.');
        }

        // API 서비스를 사용한 데이터 로드
        const [artistResponse, projectsResponse] = await Promise.all([
          artistAPI.getArtistById(user.id.toString()),
          artistAPI.getProjects(user.id),
        ]);

        if ((artistResponse as any).success && (artistResponse as any).data) {
          setArtistData((artistResponse as any).data);
        } else {
          throw new Error('아티스트 정보를 불러올 수 없습니다.');
        }

        if (
          (projectsResponse as any).success &&
          (projectsResponse as any).data
        ) {
          setProjects((projectsResponse as any).data);
        } else {
          setProjects([]);
        }

        // WBS 데이터는 임시로 빈 배열 설정
        setWbsItems([]);
      } catch (error) {
        console.error('아티스트 데이터 로드 실패:', error);

        // 에러 시 빈 데이터로 설정
        setArtistData(null);
        setProjects([]);
        setWbsItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadArtistData();
  }, [user]);

  if (loading || !artistData) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='mt-4 text-gray-600'>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>
            아티스트 대시보드
          </h1>
          <p className='text-gray-600'>
            안녕하세요, {artistData.name || user?.name || '사용자'}님! 현재 진행
            상황을 확인해보세요.
          </p>
        </div>

        {/* Overview Cards */}
        <div className='mb-8 grid gap-6 md:grid-cols-4'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>총 프로젝트</p>
                  <p className='text-2xl font-bold'>
                    {artistData.totalProjects || projects.length}
                  </p>
                </div>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100'>
                  <TrendingUp className='h-6 w-6 text-blue-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>총 펀딩 금액</p>
                  <p className='text-2xl font-bold'>
                    ₩{((artistData.totalFunding || 0) / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-green-100'>
                  <DollarSign className='h-6 w-6 text-green-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>팔로워</p>
                  <p className='text-2xl font-bold'>
                    {(artistData.followers || 0).toLocaleString()}
                  </p>
                </div>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100'>
                  <Users className='h-6 w-6 text-purple-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>월 성장률</p>
                  <p className='text-2xl font-bold'>
                    +{artistData.monthlyGrowth || 0}%
                  </p>
                </div>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100'>
                  <Calendar className='h-6 w-6 text-yellow-600' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue='projects' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='projects'>진행 프로젝트</TabsTrigger>
            <TabsTrigger value='wbs'>작업 계획 (WBS)</TabsTrigger>
            <TabsTrigger value='analytics'>분석</TabsTrigger>
            <TabsTrigger value='settings'>설정</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value='projects' className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-bold'>내 프로젝트</h2>
              <Button>
                <Plus className='mr-2 h-4 w-4' />새 프로젝트 등록
              </Button>
            </div>

            <div className='space-y-6'>
              {projects.length === 0 ? (
                <Card>
                  <CardContent className='p-8 text-center'>
                    <p className='mb-4 text-gray-500'>
                      아직 등록된 프로젝트가 없습니다.
                    </p>
                    <Button>
                      <Plus className='mr-2 h-4 w-4' />첫 번째 프로젝트 등록하기
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                projects.map(project => {
                  const progressPercentage =
                    (project.raised / project.goal) * 100;
                  const isCompleted = project.status === '완료';

                  return (
                    <Card key={project.id}>
                      <CardHeader>
                        <div className='flex items-start justify-between'>
                          <div>
                            <CardTitle className='mb-2'>
                              {project.title}
                            </CardTitle>
                            <Badge
                              className={
                                project.status === '진행중'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }
                            >
                              {project.status}
                            </Badge>
                          </div>
                          <div className='flex gap-2'>
                            <Button variant='outline' size='sm'>
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              className='border-red-600 text-red-600'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-4'>
                          {!isCompleted && (
                            <>
                              <div>
                                <div className='mb-2 flex items-center justify-between'>
                                  <span className='text-sm text-gray-600'>
                                    펀딩 진행률
                                  </span>
                                  <span className='text-sm font-medium'>
                                    {Math.round(progressPercentage)}%
                                  </span>
                                </div>
                                <Progress
                                  value={progressPercentage}
                                  className='h-3'
                                />
                              </div>

                              <div className='grid grid-cols-3 gap-4 text-center'>
                                <div>
                                  <p className='text-sm text-gray-600'>
                                    목표 금액
                                  </p>
                                  <p className='font-bold'>
                                    ₩{project.goal / 1000000}M
                                  </p>
                                </div>
                                <div>
                                  <p className='text-sm text-gray-600'>
                                    모금액
                                  </p>
                                  <p className='font-bold text-blue-600'>
                                    ₩{(project.raised / 1000000).toFixed(1)}M
                                  </p>
                                </div>
                                <div>
                                  <p className='text-sm text-gray-600'>
                                    후원자
                                  </p>
                                  <p className='font-bold'>
                                    {project.backers}명
                                  </p>
                                </div>
                              </div>

                              <div className='flex items-center justify-between rounded-lg bg-yellow-50 p-3'>
                                <span className='text-sm text-yellow-800'>
                                  수익 공유율:{' '}
                                  <strong>{project.revenueShare}%</strong>
                                </span>
                                <span className='text-sm text-yellow-800'>
                                  마감까지 <strong>{project.daysLeft}일</strong>
                                </span>
                              </div>
                            </>
                          )}

                          {isCompleted && (
                            <div className='grid grid-cols-2 gap-6'>
                              <div className='space-y-3'>
                                <h4 className='font-medium'>펀딩 결과</h4>
                                <div className='space-y-2 text-sm'>
                                  <div className='flex justify-between'>
                                    <span>목표 금액:</span>
                                    <span>₩{project.goal / 1000000}M</span>
                                  </div>
                                  <div className='flex justify-between'>
                                    <span>최종 모금액:</span>
                                    <span className='font-medium text-green-600'>
                                      ₩{(project.raised / 1000000).toFixed(1)}M
                                    </span>
                                  </div>
                                  <div className='flex justify-between'>
                                    <span>후원자 수:</span>
                                    <span>{project.backers}명</span>
                                  </div>
                                </div>
                              </div>
                              <div className='space-y-3'>
                                <h4 className='font-medium'>수익 현황</h4>
                                <div className='space-y-2 text-sm'>
                                  <div className='flex justify-between'>
                                    <span>총 매출:</span>
                                    <span>
                                      ₩
                                      {(
                                        project.totalRevenue! / 1000000
                                      ).toFixed(1)}
                                      M
                                    </span>
                                  </div>
                                  <div className='flex justify-between'>
                                    <span>후원자 분배:</span>
                                    <span className='text-blue-600'>
                                      ₩
                                      {(
                                        project.sharedRevenue! / 1000000
                                      ).toFixed(1)}
                                      M
                                    </span>
                                  </div>
                                  <div className='flex justify-between font-medium'>
                                    <span>순 수익:</span>
                                    <span className='text-green-600'>
                                      ₩
                                      {(
                                        (project.totalRevenue! -
                                          project.sharedRevenue!) /
                                        1000000
                                      ).toFixed(1)}
                                      M
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* WBS Tab */}
          <TabsContent value='wbs' className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-bold'>작업 분해 구조 (WBS)</h2>
                <p className='text-gray-600'>
                  현재 프로젝트의 세부 작업 계획을 관리하세요
                </p>
              </div>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                작업 추가
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>정규 앨범 '도시의 밤' 제작</CardTitle>
                <p className='text-gray-600'>전체 진행률: 32%</p>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {wbsItems.length === 0 ? (
                    <div className='py-8 text-center'>
                      <p className='mb-4 text-gray-500'>
                        아직 등록된 작업이 없습니다.
                      </p>
                      <Button>
                        <Plus className='mr-2 h-4 w-4' />첫 번째 작업 추가하기
                      </Button>
                    </div>
                  ) : (
                    wbsItems.map(item => (
                      <div
                        key={item.id}
                        className='rounded-lg border border-gray-200 p-4'
                      >
                        <div className='mb-3 flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <div
                              className={`h-3 w-3 rounded-full ${
                                item.status === '완료'
                                  ? 'bg-green-500'
                                  : item.status === '진행중'
                                    ? 'bg-blue-500'
                                    : 'bg-gray-300'
                              }`}
                            />
                            <h4 className='font-medium'>{item.task}</h4>
                            <Badge
                              className={`text-xs ${
                                item.status === '완료'
                                  ? 'bg-green-100 text-green-800'
                                  : item.status === '진행중'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <div className='flex gap-2'>
                            <Button variant='outline' size='sm'>
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              className='text-red-600'
                            >
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
                              <Progress
                                value={item.progress}
                                className='h-2 flex-1'
                              />
                              <span className='font-medium'>
                                {item.progress}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {item.status === '진행중' && (
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

            {/* Add New Task Form */}
            <Card>
              <CardHeader>
                <CardTitle>새 작업 추가</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div>
                    <label className='mb-2 block text-sm font-medium'>
                      작업명
                    </label>
                    <Input placeholder='작업명을 입력하세요' />
                  </div>
                  <div>
                    <label className='mb-2 block text-sm font-medium'>
                      담당자
                    </label>
                    <Input placeholder='담당자를 입력하세요' />
                  </div>
                </div>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div>
                    <label className='mb-2 block text-sm font-medium'>
                      시작일
                    </label>
                    <Input type='date' />
                  </div>
                  <div>
                    <label className='mb-2 block text-sm font-medium'>
                      종료일
                    </label>
                    <Input type='date' />
                  </div>
                </div>
                <div>
                  <label className='mb-2 block text-sm font-medium'>
                    작업 설명
                  </label>
                  <Textarea
                    placeholder='작업에 대한 상세 설명을 입력하세요'
                    rows={3}
                  />
                </div>
                <Button className='w-full'>작업 추가</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value='analytics'>
            <div className='py-12 text-center'>
              <p className='text-gray-500'>분석 데이터를 준비 중입니다...</p>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value='settings'>
            <div className='py-12 text-center'>
              <p className='text-gray-500'>설정 페이지를 준비 중입니다...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
