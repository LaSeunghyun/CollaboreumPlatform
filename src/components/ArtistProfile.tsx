import React from 'react';
import { Card, CardContent } from '@/shared/ui/shadcn/card';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Button } from '../shared/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/shadcn/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/shadcn/tabs';
import {
  ArrowLeft,
  Users,
  Play,
  ExternalLink,
  MessageCircle,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { ImageWithFallback } from '@/shared/ui/ImageWithFallback';
import { useEffect, useState } from 'react';
import { artistAPI } from '../services/api/artist';
import { getFirstChar } from '../utils/typeGuards';
import { ApiResponse } from '../types';

interface ArtistProfileProps {
  artistId: number;
  onBack?: () => void;
}

export function ArtistProfile({ artistId, onBack }: ArtistProfileProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artistData, setArtistData] = useState<any>(null);
  const [artistPosts] = useState<any[]>([]);
  const [portfolio] = useState<any[]>([]);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        setError(null);

        const artistResponse = (await artistAPI.getArtistById(
          artistId.toString(),
        )) as ApiResponse<any>;

        if (artistResponse.success && artistResponse.data) {
          setArtistData(artistResponse.data);
        } else {
          throw new Error('아티스트 정보를 불러올 수 없습니다.');
        }
      } catch (error) {
        console.error('아티스트 데이터 로드 실패:', error);
        setError(
          error instanceof Error
            ? error.message
            : '아티스트 정보를 불러올 수 없습니다.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [artistId]);

  // 이전 페이지로 돌아가기
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // 더 안정적인 뒤로가기 방법
      try {
        // 브라우저 히스토리에서 이전 페이지로 이동
        if (window.history.length > 1) {
          window.history.back();
        } else {
          // 히스토리가 없으면 홈으로 이동
          window.location.href = '/';
        }
      } catch (error) {
        console.error('뒤로가기 실패:', error);
        // 에러 발생 시 홈으로 이동
        window.location.href = '/';
      }
    }
  };

  // 로딩 상태 처리
  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='mt-4 text-gray-600'>아티스트 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error || !artistData) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <p className='mb-4 text-red-500'>
            {error || '아티스트 정보를 찾을 수 없습니다.'}
          </p>
          <Button onClick={onBack || (() => window.history.back())}>
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Cover Section */}
      <div className='relative h-64 md:h-80'>
        <ImageWithFallback
          src={artistData.coverImage}
          alt={`${artistData.name} cover`}
          className='h-full w-full object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />

        {/* Back Button */}
        <Button
          variant='secondary'
          onClick={handleBack}
          className='absolute left-4 top-4 bg-white/90 hover:bg-white'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          뒤로가기
        </Button>
      </div>

      <div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
        {/* Profile Header */}
        <div className='relative -mt-20 mb-8'>
          <Card className='pb-8 pt-24'>
            <CardContent>
              {/* Profile Image */}
              <div className='absolute -top-16 left-8'>
                <Avatar className='h-32 w-32 border-4 border-white shadow-lg'>
                  <AvatarImage
                    src={artistData.profileImage}
                    alt={artistData.name}
                  />
                  <AvatarFallback className='text-2xl'>
                    {getFirstChar(artistData.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className='md:flex md:items-start md:justify-between'>
                <div className='mb-4 md:mb-0'>
                  <div className='mb-2 flex items-center gap-3'>
                    <h1 className='text-3xl font-bold text-gray-900'>
                      {artistData.name}
                    </h1>
                    <Badge className='bg-blue-100 text-blue-800'>
                      {artistData.category}
                    </Badge>
                  </div>
                  <p className='mb-2 text-gray-600'>{artistData.username}</p>
                  <p className='mb-4 max-w-2xl text-gray-700'>
                    {artistData.bio}
                  </p>

                  <div className='mb-4 flex flex-wrap gap-4 text-sm text-gray-600'>
                    <span>📍 {artistData.location}</span>
                    <span>📅 가입일: {artistData.joinDate}</span>
                    <span>
                      🌐{' '}
                      <a
                        href={artistData.website}
                        className='text-blue-600 hover:underline'
                      >
                        웹사이트
                      </a>
                    </span>
                  </div>

                  <div className='mb-4 flex flex-wrap gap-2'>
                    {artistData.tags.map((tag: any, index: number) => (
                      <Badge key={index} variant='secondary'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-3'>
                  <Button className='flex-1 bg-blue-600 text-white hover:bg-blue-700 md:flex-initial'>
                    <Users className='mr-2 h-4 w-4' />
                    팔로우
                  </Button>
                  <Button variant='outline'>
                    <Play className='mr-2 h-4 w-4' />
                    라이브 보기
                  </Button>
                  <Button variant='outline' size='sm'>
                    <ExternalLink className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className='mb-8 grid grid-cols-3 gap-4'>
          <Card className='p-4 text-center'>
            <div className='text-2xl font-bold text-gray-900'>
              {artistData.followers}
            </div>
            <div className='text-sm text-gray-600'>팔로워</div>
          </Card>
          <Card className='p-4 text-center'>
            <div className='text-2xl font-bold text-gray-900'>
              {artistData.posts}
            </div>
            <div className='text-sm text-gray-600'>게시물</div>
          </Card>
          <Card className='p-4 text-center'>
            <div className='text-2xl font-bold text-gray-900'>
              {artistData.following}
            </div>
            <div className='text-sm text-gray-600'>팔로잉</div>
          </Card>
        </div>

        {/* Active Project */}
        {artistData.activeProject && (
          <Card className='mb-8 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center gap-3'>
                <TrendingUp className='h-5 w-5 text-blue-600' />
                <h3 className='font-medium text-gray-900'>
                  진행 중인 프로젝트
                </h3>
                <Badge className='bg-blue-100 text-blue-800'>
                  {(artistData.activeProject as any).status}
                </Badge>
              </div>
              <h4 className='mb-2 text-lg font-medium'>
                {(artistData.activeProject as any).title}
              </h4>
              <div className='mb-3 flex items-center justify-between text-sm text-gray-600'>
                <span>
                  {(artistData.activeProject as any).supporters}명이 후원 중
                </span>
                <span>{(artistData.activeProject as any).progress}% 달성</span>
              </div>
              <div className='mb-4 h-2 w-full rounded-full bg-gray-200'>
                <div
                  className='h-2 rounded-full bg-blue-500'
                  style={{
                    width: `${(artistData.activeProject as any).progress}%`,
                  }}
                />
              </div>
              <Button>프로젝트 지원하기</Button>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue='posts' className='mb-8'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='posts'>게시물 ({artistData.posts})</TabsTrigger>
            <TabsTrigger value='portfolio'>포트폴리오</TabsTrigger>
            <TabsTrigger value='projects'>프로젝트</TabsTrigger>
            <TabsTrigger value='about'>소개</TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value='posts' className='mt-6'>
            <div className='space-y-6'>
              {artistPosts.map((post: any) => (
                <Card key={post.id}>
                  <CardContent className='p-6'>
                    <div className='mb-4 flex items-center gap-3'>
                      <Avatar className='h-10 w-10'>
                        <AvatarImage
                          src={artistData.profileImage}
                          alt={artistData.name}
                        />
                        <AvatarFallback>
                          {getFirstChar(artistData.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='font-medium'>{artistData.name}</p>
                        <p className='text-sm text-gray-600'>{post.date}</p>
                      </div>
                    </div>

                    <h3 className='mb-3 text-lg font-medium'>{post.title}</h3>
                    <p className='mb-4 text-gray-700'>{post.content}</p>

                    {post.images && (
                      <div className='mb-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                          {post.images.map((image: any, index: number) => (
                            <div
                              key={index}
                              className='overflow-hidden rounded-lg'
                            >
                              <ImageWithFallback
                                src={image}
                                alt={`${post.title} image ${index + 1}`}
                                className='h-48 w-full object-cover'
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className='flex items-center gap-6 text-sm text-gray-600'>
                      <button className='flex items-center gap-2 transition-colors hover:text-red-500'>
                        <Heart className='h-4 w-4' />
                        <span>{post.likes}</span>
                      </button>
                      <button className='flex items-center gap-2 transition-colors hover:text-blue-500'>
                        <MessageCircle className='h-4 w-4' />
                        <span>{post.replies}</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value='portfolio' className='mt-6'>
            <div className='grid gap-6 md:grid-cols-2'>
              {portfolio.map((item: any, index: number) => (
                <Card
                  key={index}
                  className='cursor-pointer overflow-hidden transition-shadow hover:shadow-lg'
                >
                  <div className='relative aspect-video'>
                    <ImageWithFallback
                      src={item.thumbnail}
                      alt={item.title}
                      className='h-full w-full object-cover'
                    />
                    <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100'>
                      <Play className='h-12 w-12 text-white' />
                    </div>
                  </div>
                  <CardContent className='p-4'>
                    <h3 className='mb-2 font-medium'>{item.title}</h3>
                    <p className='text-sm text-gray-600'>{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value='projects' className='mt-6'>
            <div className='py-12 text-center'>
              <p className='text-gray-500'>프로젝트 내역을 준비 중입니다...</p>
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value='about' className='mt-6'>
            <Card>
              <CardContent className='p-6'>
                <h3 className='mb-4 font-medium'>아티스트 소개</h3>
                <p className='mb-6 leading-relaxed text-gray-700'>
                  {artistData.bio}
                </p>

                <div className='grid gap-6 md:grid-cols-2'>
                  <div>
                    <h4 className='mb-3 font-medium'>장르 & 스타일</h4>
                    <div className='flex flex-wrap gap-2'>
                      {artistData.tags.map((tag: any, index: number) => (
                        <Badge key={index} variant='outline'>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className='mb-3 font-medium'>연락처</h4>
                    <div className='space-y-2 text-sm text-gray-600'>
                      <p>📧 contact@example.com</p>
                      <p>🌐 {artistData.website}</p>
                      <p>📍 {artistData.location}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
