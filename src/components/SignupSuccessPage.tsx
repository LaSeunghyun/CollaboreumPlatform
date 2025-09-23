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
        description: '창작 활동과 펀딩을 통해 꿈을 실현하세요',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
      };
    } else {
      return {
        icon: <Heart className='h-16 w-16 text-pink-600' />,
        title: '팬 가입 완료!',
        description: '아티스트를 후원하고 소통하세요',
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
        <Card className='border-0 bg-white/90 shadow-xl backdrop-blur-sm'>
          <CardHeader className='space-y-4 text-center'>
            <div className='flex justify-center'>{userTypeInfo.icon}</div>
            <CardTitle className={`text-2xl font-bold ${userTypeInfo.color}`}>
              {userTypeInfo.title}
            </CardTitle>
            <p className='text-gray-600'>{userTypeInfo.description}</p>
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* Success Animation */}
            <div className='flex justify-center'>
              <div className='flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-green-100'>
                <CheckCircle className='h-12 w-12 text-green-600' />
              </div>
            </div>

            {/* Welcome Message */}
            <div
              className={`rounded-lg p-4 ${userTypeInfo.bgColor} ${userTypeInfo.borderColor} border`}
            >
              <h3 className='mb-2 font-semibold text-gray-900'>
                환영합니다, {name}님!
              </h3>
              <p className='text-sm text-gray-600'>
                {email}으로 가입이 완료되었습니다.
              </p>
            </div>

            {/* Next Steps */}
            <div className='space-y-3'>
              <h4 className='text-center font-medium text-gray-900'>
                다음 단계
              </h4>
              <div className='space-y-2 text-sm text-gray-600'>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                  <span>이메일 인증 (선택사항)</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                  <span>프로필 설정</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                  <span>커뮤니티 참여</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='space-y-3'>
              <Button
                onClick={onGoToLogin}
                className='h-12 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              >
                로그인 하러가기
                <ArrowRight className='ml-2 h-4 w-4' />
              </Button>

              <Button
                variant='outline'
                className='w-full'
                onClick={() =>
                  window.open('https://collaboreum.com/guide', '_blank')
                }
              >
                이용 가이드 보기
              </Button>
            </div>

            {/* Additional Info */}
            <div className='space-y-1 text-center text-xs text-gray-500'>
              <p>궁금한 점이 있으시면 고객센터에 문의해주세요</p>
              <p>이메일: support@collaboreum.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
