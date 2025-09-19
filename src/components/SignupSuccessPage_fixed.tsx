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
                description: '창작 활동을 통해 꿈을 실현하세요!',
                color: 'text-purple-600',
                bgColor: 'bg-purple-50',
                borderColor: 'border-purple-200'
            };
        } else {
            return {
                icon: <Heart className="w-16 h-16 text-pink-600" />,
                title: '팬 가입 완료!',
                description: '아티스트를 후원하고 소통하세요!',
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
                <Card className={`${userTypeInfo.bgColor} ${userTypeInfo.borderColor} border-2 shadow-2xl backdrop-blur-sm`}>
                    <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                {userTypeInfo.icon}
                                <div className="absolute -top-1 -right-1">
                                    <CheckCircle className="w-6 h-6 text-green-500 bg-white rounded-full" />
                                </div>
                            </div>
                        </div>
                        <CardTitle className={`text-2xl font-bold ${userTypeInfo.color} mb-2`}>
                            {userTypeInfo.title}
                        </CardTitle>
                        <p className="text-gray-600 text-sm">
                            {userTypeInfo.description}
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* User Info */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/50">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">이름</span>
                                    <span className="text-sm font-medium">{name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">이메일</span>
                                    <span className="text-sm font-medium">{email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">회원 유형</span>
                                    <span className={`text-sm font-medium ${userTypeInfo.color}`}>
                                        {userType === 'artist' ? '아티스트' : '팬'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-800 text-center">다음 단계</h4>
                            <div className="space-y-2">
                                {userType === 'artist' ? (
                                    <>
                                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                            <span>프로필을 완성해주세요</span>
                                        </div>
                                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                            <span>첫 번째 프로젝트를 시작하세요</span>
                                        </div>
                                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                            <span>커뮤니티에 참여하세요</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                                            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                                            <span>관심 있는 아티스트를 팔로우하세요</span>
                                        </div>
                                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                                            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                                            <span>프로젝트에 후원해보세요</span>
                                        </div>
                                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                                            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                                            <span>커뮤니티에서 소통하세요</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Action Button */}
                        <Button
                            onClick={onGoToLogin}
                            className={`w-full ${userTypeInfo.color} bg-white hover:bg-gray-50 border-2 ${userTypeInfo.borderColor} shadow-lg hover:shadow-xl transition-all duration-300`}
                        >
                            로그인하러 가기
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>

                        {/* Additional Info */}
                        <div className="text-center">
                            <p className="text-xs text-gray-500">
                                이메일로 인증 링크를 보내드렸습니다.<br />
                                이메일을 확인해주세요.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
