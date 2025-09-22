import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/components/ui/input';

interface HomeHeroSectionProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
}

export const HomeHeroSection: React.FC<HomeHeroSectionProps> = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
}) => {
  return (
    <section className='relative flex min-h-screen items-center justify-center space-y-8 overflow-hidden py-8 text-center md:space-y-12 md:py-12'>
      <div className='via-secondary/20 to-muted/30 pointer-events-none absolute inset-0 bg-gradient-to-br from-background' />
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(79,70,229,0.1),transparent_50%)]' />
      <div className='pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform'>
        <div className='bg-gradient-top-to-center-strong h-full w-full rounded-full opacity-60 blur-3xl' />
      </div>
      <div className='bg-primary/10 animate-float pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full blur-3xl' />
      <div
        className='bg-primary/5 animate-float pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full blur-3xl'
        style={{ animationDelay: '1s' }}
      />
      <div
        className='bg-primary/8 animate-float pointer-events-none absolute left-1/2 top-3/4 h-48 w-48 rounded-full blur-2xl'
        style={{ animationDelay: '2s' }}
      />
      <div className='bg-gradient-radial pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full from-yellow-400/30 via-yellow-300/15 to-transparent opacity-60 blur-3xl' />

      <div className='relative z-10 space-y-8 px-4 md:space-y-12'>
        <div className='space-y-6 md:space-y-8'>
          <div className='bg-primary/10 mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-primary'>
            <span className='h-2 w-2 animate-pulse rounded-full bg-primary'></span>
            새로운 창작 생태계가 시작됩니다
          </div>

          <div className='space-y-4 md:space-y-6'>
            <h1 className='text-4xl font-bold leading-[0.95] tracking-tight md:text-5xl lg:text-6xl xl:text-7xl'>
              <span className='block bg-gradient-to-r from-indigo via-sky to-indigo bg-clip-text text-transparent'>
                아티스트와 팬이 함께 만드는
              </span>
              <span className='mt-2 block bg-gradient-to-r from-sky via-indigo to-sky bg-clip-text text-transparent'>
                크리에이티브 생태계
              </span>
            </h1>

            <div className='mx-auto max-w-4xl space-y-3 pt-4 md:space-y-4'>
              <p className='text-foreground/90 text-xl font-medium leading-relaxed md:text-2xl lg:text-3xl'>
                독립 아티스트의 꿈을 현실로 만들고
                <br />
                팬들과 함께 성장하는 새로운 플랫폼
              </p>
              <p className='text-muted-foreground/80 text-lg leading-relaxed md:text-xl'>
                신뢰와 투명성을 바탕으로 건강한 예술 생태계를 구축합니다.
              </p>
            </div>
          </div>
        </div>

        <div className='mx-auto flex max-w-3xl flex-col gap-4 pt-2 md:gap-5'>
          <div className='relative w-full'>
            <Search className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground' />
            <Input
              placeholder='아티스트, 프로젝트를 검색해보세요...'
              className='focus:border-indigo/50 h-12 w-full rounded-2xl border-2 bg-white/80 pl-12 text-base shadow-sm backdrop-blur md:h-14 md:text-lg'
              value={searchQuery}
              onChange={event => onSearchQueryChange(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  onSearch();
                }
              }}
            />
          </div>
          <Button
            size='lg'
            className='hover-scale transition-button h-12 w-full rounded-2xl bg-indigo px-8 text-base font-semibold text-white shadow-lg hover:bg-indigo-hover sm:w-auto md:h-14 md:px-10 md:text-lg'
            onClick={onSearch}
          >
            지금 시작하기
          </Button>
        </div>
      </div>
    </section>
  );
};
