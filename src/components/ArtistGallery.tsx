import React, { useState } from 'react';
import { Card, CardContent } from '../shared/ui/Card';
import { Badge } from '../shared/ui/Badge';
import { Button } from '../shared/ui/Button';
import { Input } from '../shared/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../shared/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../shared/ui/Tabs';
import {
  ArrowLeft,
  Search,
  Play,
  Heart,
  Eye,
  Share,
  Grid3X3,
  List,
  Music,
  Palette,
  BookOpen,
  Mic,
  Video,
  Camera,
  Building,
} from 'lucide-react';
import { ImageWithFallback } from './atoms/ImageWithFallback';
import {
  useGalleryArtworks,
  useGalleryCategories,
  type Artwork,
  type Category,
} from '../lib/api/gallery';

interface ArtistGalleryProps {
  onBack?: () => void;
  onSelectArtwork?: (artworkId: string) => void;
}

export function ArtistGallery({ onBack, onSelectArtwork }: ArtistGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [sortBy, setSortBy] = useState('최신순');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOptions] = useState<string[]>(['최신순', '인기순', '조회수순']);

  // React Query 훅 사용
  const {
    data: artworks = [],
    isLoading: artworksLoading,
    error: artworksError,
  } = useGalleryArtworks();
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useGalleryCategories();

  // 로딩 상태 계산
  const loading = artworksLoading || categoriesLoading;

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
      } catch (_error) {
        // 에러 발생 시 홈으로 이동
        window.location.href = '/';
      }
    }
  };

  const filteredArtworks = artworks.filter((artwork: Artwork) => {
    const categoryMatch =
      selectedCategory === '전체' || artwork.category === selectedCategory;
    const artistName =
      typeof artwork.artist === 'string'
        ? artwork.artist
        : artwork.artist?.name || '';
    const searchMatch =
      artwork.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artistName.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const getCategoryIcon = (category: string) => {
    // 카테고리에서 아이콘 정보 찾기
    const categoryData = (categories as Category[]).find(
      (cat: Category) => cat.id === category,
    );
    if (categoryData?.icon) {
      switch (categoryData.icon) {
        case 'Music':
          return <Music className='h-4 w-4' />;
        case 'Palette':
          return <Palette className='h-4 w-4' />;
        case 'BookOpen':
          return <BookOpen className='h-4 w-4' />;
        case 'Mic':
          return <Mic className='h-4 w-4' />;
        case 'Video':
          return <Video className='h-4 w-4' />;
        case 'Camera':
          return <Camera className='h-4 w-4' />;
        case 'Building':
          return <Building className='h-4 w-4' />;
        default:
          return null;
      }
    }
    return null;
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'audio':
      case 'video':
        return <Play className='h-4 w-4' />;
      default:
        return <Eye className='h-4 w-4' />;
    }
  };

  const getCategoryCount = (category: string) => {
    if (category === '전체') return artworks.length;
    return artworks.filter((artwork: Artwork) => artwork.category === category)
      .length;
  };

  const handleSelectArtwork = (artworkId: string) => {
    onSelectArtwork?.(artworkId);
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='mt-4 text-gray-600'>갤러리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (artworksError || categoriesError) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mb-4 text-6xl text-red-500'>⚠️</div>
          <h2 className='mb-2 text-xl font-semibold text-gray-900'>
            데이터를 불러올 수 없습니다
          </h2>
          <p className='mb-4 text-gray-600'>잠시 후 다시 시도해주세요</p>
          <Button onClick={() => window.location.reload()}>새로고침</Button>
        </div>
      </div>
    );
  }

  const renderArtworkCard = (artwork: Artwork) => (
    <Card
      key={artwork.id}
      className='group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg'
      onClick={() => handleSelectArtwork(artwork.id)}
    >
      <div className='relative aspect-square'>
        <ImageWithFallback
          src={artwork.thumbnail}
          alt={artwork.title}
          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
        />
        <div className='absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20'>
          <div className='flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
            <Button
              size='sm'
              className='bg-white/90 text-gray-900 hover:bg-white'
              onClick={event => event.stopPropagation()}
            >
              {getMetricIcon(artwork.type)}
            </Button>
            <Button
              size='sm'
              variant='outline'
              className='border-white/90 bg-white/90 hover:bg-white'
              onClick={event => event.stopPropagation()}
            >
              <Heart className='h-4 w-4' />
            </Button>
          </div>
        </div>
        <div className='absolute left-3 top-3'>
          <Badge className='bg-blue-500'>
            {getCategoryIcon(artwork.category)}
            <span className='ml-1'>{artwork.category}</span>
          </Badge>
        </div>
      </div>

      <CardContent className='p-4'>
        <h3 className='mb-1 line-clamp-1 font-medium text-gray-900'>
          {artwork.title}
        </h3>
        <p className='mb-2 text-sm text-gray-600'>
          by{' '}
          {typeof artwork.artist === 'string'
            ? artwork.artist
            : artwork.artist?.name || 'Unknown'}
        </p>
        <p className='mb-3 line-clamp-2 text-xs text-gray-500'>
          {artwork.description}
        </p>

        <div className='mb-3 flex items-center justify-between text-xs text-gray-500'>
          <span>{artwork.date}</span>
          <span>
            {artwork.duration || artwork.dimensions || artwork.wordCount}
          </span>
        </div>

        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center gap-3 text-gray-600'>
            <div className='flex items-center gap-1'>
              {getMetricIcon(artwork.type)}
              <span>{artwork.plays || artwork.views}</span>
            </div>
            <div className='flex items-center gap-1'>
              <Heart className='h-4 w-4' />
              <span>{artwork.likes}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderArtworkList = (artwork: Artwork) => (
    <Card
      key={artwork.id}
      className='cursor-pointer transition-shadow hover:shadow-lg'
      onClick={() => handleSelectArtwork(artwork.id)}
    >
      <CardContent className='p-6'>
        <div className='flex gap-6'>
          <div className='h-24 w-24 flex-shrink-0'>
            <ImageWithFallback
              src={artwork.thumbnail}
              alt={artwork.title}
              className='h-full w-full rounded-lg object-cover'
            />
          </div>

          <div className='min-w-0 flex-1'>
            <div className='mb-2 flex items-start justify-between'>
              <div>
                <h3 className='mb-1 font-medium text-gray-900'>
                  {artwork.title}
                </h3>
                <p className='text-sm text-gray-600'>
                  by{' '}
                  {typeof artwork.artist === 'string'
                    ? artwork.artist
                    : artwork.artist?.name || 'Unknown'}
                </p>
              </div>
              <Badge className='bg-blue-100 text-blue-800'>
                {artwork.category}
              </Badge>
            </div>

            <p className='mb-3 line-clamp-2 text-sm text-gray-700'>
              {artwork.description}
            </p>

            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4 text-sm text-gray-600'>
                <span>{artwork.date}</span>
                <span>
                  {artwork.duration || artwork.dimensions || artwork.wordCount}
                </span>
                <div className='flex items-center gap-1'>
                  {getMetricIcon(artwork.type)}
                  <span>{artwork.plays || artwork.views}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Heart className='h-4 w-4' />
                  <span>{artwork.likes}</span>
                </div>
              </div>
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={event => event.stopPropagation()}
                >
                  <Share className='h-4 w-4' />
                </Button>
                <Button size='sm' onClick={event => event.stopPropagation()}>
                  {getMetricIcon(artwork.type)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8 flex items-center gap-4'>
          <Button variant='ghost' onClick={handleBack} className='p-2'>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              아티스트 갤러리
            </h1>
            <p className='text-gray-600'>
              창작자들의 작업물을 카테고리별로 감상하고 소통하세요
            </p>
          </div>
        </div>

        {/* Search and Controls */}
        <div className='mb-8 flex flex-col gap-4 lg:flex-row'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
              <Input
                placeholder='작품명이나 아티스트명으로 검색...'
                className='h-10 pl-10'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className='flex items-end gap-4'>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className='h-10 w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className='flex h-10 rounded-lg border border-gray-200 p-1'>
              <Button
                variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('grid')}
                className='h-8 px-3'
              >
                <Grid3X3 className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'solid' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('list')}
                className='h-8 px-3'
              >
                <List className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className='mb-8'
        >
          <TabsList className='grid w-full max-w-2xl grid-cols-5'>
            {(categories as Category[]).map((category: Category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className='flex items-center gap-2'
              >
                {getCategoryIcon(category.id)}
                <span className='hidden sm:inline'>{category.label}</span>
                <span className='sm:hidden'>{category.label.charAt(0)}</span>
                <Badge variant='secondary' className='ml-1 text-xs'>
                  {getCategoryCount(category.id)}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {(categories as Category[]).map((category: Category) => (
            <TabsContent key={category.id} value={category.id} className='mt-6'>
              <div className='mb-6'>
                <div className='flex items-center justify-between'>
                  <h2 className='flex items-center gap-2 text-xl font-semibold text-gray-900'>
                    {getCategoryIcon(category.id)}
                    {category.label} 작품
                    <Badge variant='outline'>
                      {getCategoryCount(category.id)}개
                    </Badge>
                  </h2>
                  {searchQuery && (
                    <p className='text-sm text-gray-600'>
                      '{searchQuery}' 검색 결과
                    </p>
                  )}
                </div>
              </div>

              {/* Artworks Display */}
              {viewMode === 'grid' ? (
                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                  {filteredArtworks.map(renderArtworkCard)}
                </div>
              ) : (
                <div className='space-y-4'>
                  {filteredArtworks.map(renderArtworkList)}
                </div>
              )}

              {filteredArtworks.length === 0 && (
                <div className='py-12 text-center'>
                  <div className='mb-4 text-gray-400'>
                    {getCategoryIcon(category.id) && (
                      <div className='mb-4 text-6xl'>
                        {getCategoryIcon(category.id)}
                      </div>
                    )}
                  </div>
                  <h3 className='mb-2 text-lg font-medium text-gray-900'>
                    {searchQuery
                      ? '검색 결과가 없습니다'
                      : `${category.label} 작품이 없습니다`}
                  </h3>
                  <p className='text-gray-600'>
                    {searchQuery
                      ? '다른 검색어를 시도해보세요'
                      : `${category.label} 카테고리의 작품을 기다려보세요`}
                  </p>
                </div>
              )}

              {/* Load More */}
              {filteredArtworks.length > 0 && filteredArtworks.length >= 12 && (
                <div className='mt-12 text-center'>
                  <Button variant='outline' size='lg'>
                    더 많은 작품 보기
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
