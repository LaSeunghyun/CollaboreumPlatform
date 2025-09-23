import { Button } from '../shared/ui/Button';
import { Input } from '@/shared/ui/shadcn/input';
import { Instagram, Twitter, Youtube, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className='bg-gray-900 py-16 text-white'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-8 grid gap-8 md:grid-cols-4'>
          {/* Company Info */}
          <div>
            <h3 className='mb-4 text-xl font-bold'>Collaboreum</h3>
            <p className='mb-4 text-gray-400'>
              아티스트와 팬이 함께 만드는 창작의 새로운 공간
            </p>
            <div className='flex space-x-4'>
              <Button
                variant='ghost'
                size='sm'
                className='p-2 text-gray-400 hover:text-white'
              >
                <Instagram className='h-5 w-5' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='p-2 text-gray-400 hover:text-white'
              >
                <Twitter className='h-5 w-5' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='p-2 text-gray-400 hover:text-white'
              >
                <Youtube className='h-5 w-5' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='p-2 text-gray-400 hover:text-white'
              >
                <Facebook className='h-5 w-5' />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className='mb-4 font-semibold'>빠른 링크</h4>
            <ul className='space-y-2'>
              <li>
                <button className='text-gray-400 transition-colors hover:text-white'>
                  아티스트 등록
                </button>
              </li>
              <li>
                <button className='text-gray-400 transition-colors hover:text-white'>
                  프로젝트 둘러보기
                </button>
              </li>
              <li>
                <button className='text-gray-400 transition-colors hover:text-white'>
                  커뮤니티
                </button>
              </li>
              <li>
                <button className='text-gray-400 transition-colors hover:text-white'>
                  이벤트
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className='mb-4 font-semibold'>고객지원</h4>
            <ul className='space-y-2'>
              <li>
                <button className='text-gray-400 transition-colors hover:text-white'>
                  도움말
                </button>
              </li>
              <li>
                <button className='text-gray-400 transition-colors hover:text-white'>
                  펀딩 가이드
                </button>
              </li>
              <li>
                <button className='text-gray-400 transition-colors hover:text-white'>
                  수수료 안내
                </button>
              </li>
              <li>
                <button className='text-gray-400 transition-colors hover:text-white'>
                  문의하기
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className='mb-4 font-semibold'>뉴스레터</h4>
            <p className='mb-4 text-sm text-gray-400'>
              새로운 프로젝트와 이벤트 소식을 받아보세요
            </p>
            <div className='flex gap-2'>
              <Input
                placeholder='이메일 주소'
                className='border-gray-700 bg-gray-800 text-white placeholder-gray-400'
              />
              <Button variant='secondary'>구독</Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className='border-t border-gray-800 pt-8'>
          <div className='flex flex-col items-center justify-between md:flex-row'>
            <div className='text-sm text-gray-400'>
              © 2025 Collaboreum. All rights reserved.
            </div>
            <div className='mt-4 flex space-x-6 md:mt-0'>
              <button className='text-sm text-gray-400 transition-colors hover:text-white'>
                개인정보처리방침
              </button>
              <button className='text-sm text-gray-400 transition-colors hover:text-white'>
                이용약관
              </button>
              <button className='text-sm text-gray-400 transition-colors hover:text-white'>
                쿠키 정책
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
