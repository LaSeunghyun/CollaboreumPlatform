import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle, ArrowRight, Heart, Palette } from "lucide-react";

interface SignupSuccessPageProps {
    userData: {
        name: string;
        email: string;
        userType: 'artist' | 'fan';
    };
    onGoToLogin: () => void;
}

export function SignupSuccessPage({ userData, onGoToLogin }: SignupSuccessPageProps) {
    const { name, email, userType } = userData;

    const getUserTypeInfo = () => {
        if (userType === 'artist') {
            return {
                icon: <Palette className="w-16 h-16 text-purple-600" />,
                title: '아티스트 가입 완료!',
                description: '창작 활동과 펀딩을 통해 꿈을 실현하세요',
                color: 'text-purple-600',
                bgColor: 'bg-purple-50',
                borderColor: 'border-purple-200'
            };
        } else {
            return {
                icon: <Heart className="w-16 h-16 text-pink-600" />,
                title: '팬 가입 완료!',
                description: '아티스트를 후원하고 소통하세요',
                color: 'text-pink-600',
                bgColor: 'bg-pink-50',
                borderColor: 'border-pink-200'
            };
        }
    };

    const userTypeInfo = getUserTypeInfo();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            {/* Background Art Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200/25 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-pink-300/30 rotate-45 animate-spin-slow"></div>
            </div>

            <div className="w-full max-w-md relative">
                <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
                    <CardHeader className="space-y-4 text-center">
                        <div className="flex justify-center">
                            {userTypeInfo.icon}
                        </div>
                        <CardTitle className={`text-2xl font-bold ${userTypeInfo.color}`}>
                            {userTypeInfo.title}
                        </CardTitle>
                        <p className="text-gray-600">{userTypeInfo.description}</p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Success Animation */}
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                        </div>

                        {/* Welcome Message */}
                        <div className={`p-4 rounded-lg ${userTypeInfo.bgColor} ${userTypeInfo.borderColor} border`}>
                            <h3 className="font-semibold text-gray-900 mb-2">환영합니다, {name}님!</h3>
                            <p className="text-sm text-gray-600">
                                {email}으로 가입이 완료되었습니다.
                            </p>
                        </div>

                        {/* Next Steps */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 text-center">다음 단계</h4>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>이메일 인증 (선택사항)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>프로필 설정</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>커뮤니티 참여</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Button
                                onClick={onGoToLogin}
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                로그인 하러가기
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => window.open('https://collaboreum.com/guide', '_blank')}
                            >
                                이용 가이드 보기
                            </Button>
                        </div>

                        {/* Additional Info */}
                        <div className="text-center text-xs text-gray-500 space-y-1">
                            <p>궁금한 점이 있으시면 고객센터에 문의해주세요</p>
                            <p>이메일: support@collaboreum.com</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
