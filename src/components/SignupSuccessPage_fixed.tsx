import { Button } from '@/shared/ui/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';
import { CheckCircle, ArrowRight, Heart, Palette } from 'lucide-react';

interface SignupSuccessPageProps {
  userData: {
    name: string;
    email: string;
    userType: 'artist' | 'fan';
  };
  onGoToLogin: () => void;
}

export function SignupSuccessPage({
  userData,
  onGoToLogin,
}: SignupSuccessPageProps) {
  const { name, email, userType } = userData;

  const getUserTypeInfo = () => {
    if (userType === 'artist') {
      return {
        icon: <Palette className='h-16 w-16 text-purple-600' />,
        title: '아티스트 가입 완료!',
        description: '창작 활동을 통해 꿈을 실현하세요!',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
      };
    } else {
      return {
        icon: <Heart className='h-16 w-16 text-pink-600' />,
        title: '팬 가입 완료!',
        description: '아티스트를 후원하고 소통하세요!',
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-200',
      };
    }
  };

  const userTypeInfo = getUserTypeInfo();

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4'>
      {/* Background Art Elements */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute left-10 top-10 h-32 w-32 animate-pulse rounded-full bg-blue-200/20 blur-xl'></div>
        <div className='absolute bottom-20 right-20 h-40 w-40 animate-pulse rounded-full bg-purple-200/25 blur-2xl delay-1000'></div>
        <div className='animate-spin-slow absolute left-1/4 top-1/2 h-16 w-16 rotate-45 border-2 border-pink-300/30'></div>
      </div>

      <div className='relative w-full max-w-md'>
        <Card
          className={`${userTypeInfo.bgColor} ${userTypeInfo.borderColor} border-2 shadow-2xl backdrop-blur-sm`}
        >
          <CardHeader className='pb-4 text-center'>
            <div className='mb-4 flex justify-center'>
              <div className='relative'>
                {userTypeInfo.icon}
                <div className='absolute -right-1 -top-1'>
                  <CheckCircle className='h-6 w-6 rounded-full bg-white text-green-500' />
                </div>
              </div>
            </div>
            <CardTitle
              className={`text-2xl font-bold ${userTypeInfo.color} mb-2`}
            >
              {userTypeInfo.title}
            </CardTitle>
            <p className='text-sm text-gray-600'>{userTypeInfo.description}</p>
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* User Info */}
            <div className='rounded-lg border border-white/50 bg-white/60 p-4 backdrop-blur-sm'>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>이름</span>
                  <span className='text-sm font-medium'>{name}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>이메일</span>
                  <span className='text-sm font-medium'>{email}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>회원 유형</span>
                  <span className={`text-sm font-medium ${userTypeInfo.color}`}>
                    {userType === 'artist' ? '아티스트' : '팬'}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className='space-y-3'>
              <h4 className='text-center font-medium text-gray-800'>
                다음 단계
              </h4>
              <div className='space-y-2'>
                {userType === 'artist' ? (
                  <>
                    <div className='flex items-center space-x-3 text-sm text-gray-600'>
                      <div className='h-2 w-2 rounded-full bg-purple-400'></div>
                      <span>프로필을 완성해주세요</span>
                    </div>
                    <div className='flex items-center space-x-3 text-sm text-gray-600'>
                      <div className='h-2 w-2 rounded-full bg-purple-400'></div>
                      <span>첫 번째 프로젝트를 시작하세요</span>
                    </div>
                    <div className='flex items-center space-x-3 text-sm text-gray-600'>
                      <div className='h-2 w-2 rounded-full bg-purple-400'></div>
                      <span>커뮤니티에 참여하세요</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className='flex items-center space-x-3 text-sm text-gray-600'>
                      <div className='h-2 w-2 rounded-full bg-pink-400'></div>
                      <span>관심 있는 아티스트를 팔로우하세요</span>
                    </div>
                    <div className='flex items-center space-x-3 text-sm text-gray-600'>
                      <div className='h-2 w-2 rounded-full bg-pink-400'></div>
                      <span>프로젝트에 후원해보세요</span>
                    </div>
                    <div className='flex items-center space-x-3 text-sm text-gray-600'>
                      <div className='h-2 w-2 rounded-full bg-pink-400'></div>
                      <span>커뮤니티에서 소통하세요</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={onGoToLogin}
              className={`w-full ${userTypeInfo.color} border-2 bg-white hover:bg-gray-50 ${userTypeInfo.borderColor} shadow-lg transition-all duration-300 hover:shadow-xl`}
            >
              로그인하러 가기
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>

            {/* Additional Info */}
            <div className='text-center'>
              <p className='text-xs text-gray-500'>
                이메일로 인증 링크를 보내드렸습니다.
                <br />
                이메일을 확인해주세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
