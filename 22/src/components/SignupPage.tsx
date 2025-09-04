import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Palette, Heart, CheckCircle } from "lucide-react";

interface SignupPageProps {
  onBack: () => void;
  onSignup: (data: SignupData) => void;
  onSocialSignup: (provider: string, userType: string) => void;
  onLoginClick: () => void;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  userType: 'artist' | 'fan';
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
}

export function SignupPage({ onBack, onSignup, onSocialSignup, onLoginClick }: SignupPageProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SignupData>({
    email: "",
    password: "",
    name: "",
    userType: 'fan',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      setIsLoading("signup");
      setTimeout(() => {
        onSignup(formData);
        setIsLoading("");
      }, 1500);
    }
  };

  const handleSocialSignup = async (provider: string) => {
    setIsLoading(provider);
    setTimeout(() => {
      onSocialSignup(provider, formData.userType);
      setIsLoading("");
    }, 1500);
  };

  const userTypes = [
    {
      id: 'fan' as const,
      name: '팬',
      description: '아티스트를 후원하고 소통하고 싶어요',
      icon: <Heart className="w-8 h-8" />,
      color: 'bg-pink-100 border-pink-300 text-pink-800',
      selectedColor: 'bg-pink-500 border-pink-500 text-white'
    },
    {
      id: 'artist' as const,
      name: '아티스트',
      description: '창작 활동과 펀딩을 통해 꿈을 실현하고 싶어요',
      icon: <Palette className="w-8 h-8" />,
      color: 'bg-purple-100 border-purple-300 text-purple-800',
      selectedColor: 'bg-purple-500 border-purple-500 text-white'
    }
  ];

  const socialProviders = [
    {
      id: "google",
      name: "Google",
      icon: "https://developers.google.com/identity/images/g-logo.png",
      color: "border-gray-300 hover:bg-gray-50"
    },
    {
      id: "kakao",
      name: "카카오",
      icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDNDNy4wMyAzIDMgNi4zNCAzIDEwLjRDMyAxMi45IDQuNjcgMTUuMDcgNy4xIDE2LjJMNi4xIDE5LjlDNS45NCAyMC41NCA2LjQ5IDIxLjEgNy4xNCAyMC44NEwxMS4zOCAxOC4yN0MxMS41OSAxOC4yOSAxMS43OSAxOC4zIDEyIDE4LjNDMTYuOTcgMTguMyAyMSAxNC45NiAyMSAxMC40QzIxIDYuMzQgMTYuOTcgMyAxMiAzWiIgZmlsbD0iIzAwMCIvPgo8L3N2Zz4K",
      color: "border-yellow-300 bg-yellow-400 hover:bg-yellow-500 text-black"
    },
    {
      id: "naver",
      name: "네이버",
      icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwYzczYyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyUzYuNDggMjIgMTIgMjJTMjIgMTcuNTIgMjIgMTJTMTcuNTIgMiAxMiAyWk0xNi44IDE2LjhIOC4yVjcuMkg5LjZWMTQuNEwxNS42IDcuMkgxNi44VjE2LjhaIiBmaWxsPSIjMDBjNzNjIi8+Cjwvc3ZnPgo=",
      color: "border-green-500 bg-green-500 hover:bg-green-600 text-white"
    }
  ];

  const isPasswordValid = formData.password.length >= 8;
  const doPasswordsMatch = formData.password === confirmPassword && confirmPassword !== "";
  const isFormValid = step === 1 ? formData.userType !== null :
                      step === 2 ? (formData.name && formData.email && isPasswordValid && doPasswordsMatch) :
                      (formData.agreeTerms && formData.agreePrivacy);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* Background Art Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200/25 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-pink-300/30 rotate-45 animate-spin-slow"></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={step === 1 ? onBack : () => setStep(step - 1)}
          className="mb-6 bg-white/80 hover:bg-white backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {step === 1 ? '뒤로가기' : '이전'}
        </Button>

        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Collaboreum</h1>
              <p className="text-gray-600">창작자와 팬을 연결하는 플랫폼</p>
            </div>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= num ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > num ? <CheckCircle className="w-4 h-4" /> : num}
                  </div>
                  {num < 3 && <div className={`w-8 h-0.5 ${step > num ? 'bg-blue-500' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
            <CardTitle className="text-xl text-gray-900">
              {step === 1 ? '가입 유형 선택' : step === 2 ? '계정 정보 입력' : '약관 동의'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit}>
              {/* Step 1: User Type Selection */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-center text-gray-600 mb-6">
                    Collaboreum에서 어떤 활동을 하고 싶으신가요?
                  </p>
                  <div className="grid gap-4">
                    {userTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({...formData, userType: type.id})}
                        className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                          formData.userType === type.id ? type.selectedColor : type.color
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {type.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{type.name}</h3>
                            <p className="text-sm opacity-90">{type.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Account Information */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <Badge className={
                      formData.userType === 'artist' ? 'bg-purple-100 text-purple-800' : 'bg-pink-100 text-pink-800'
                    }>
                      {formData.userType === 'artist' ? '아티스트' : '팬'} 가입
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">이름</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="실명을 입력하세요"
                        className="pl-10"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">이메일</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="email"
                        placeholder="이메일을 입력하세요"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">비밀번호</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호를 입력하세요 (8자 이상)"
                        className="pl-10 pr-10"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formData.password && (
                      <p className={`text-xs ${isPasswordValid ? 'text-green-600' : 'text-red-600'}`}>
                        {isPasswordValid ? '✓ 사용 가능한 비밀번호입니다' : '비밀번호는 8자 이상이어야 합니다'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">비밀번호 확인</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="비밀번호를 다시 입력하세요"
                        className="pl-10 pr-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && (
                      <p className={`text-xs ${doPasswordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                        {doPasswordsMatch ? '✓ 비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Terms Agreement */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => setFormData({...formData, agreeTerms: checked as boolean})}
                      />
                      <div className="flex-1">
                        <label htmlFor="terms" className="text-sm font-medium text-gray-900 cursor-pointer">
                          [필수] 이용약관 동의
                        </label>
                        <p className="text-xs text-gray-600 mt-1">
                          서비스 이용을 위한 기본 약관에 동의합니다.
                        </p>
                      </div>
                      <Button variant="link" className="text-xs text-blue-600 p-0">보기</Button>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="privacy"
                        checked={formData.agreePrivacy}
                        onCheckedChange={(checked) => setFormData({...formData, agreePrivacy: checked as boolean})}
                      />
                      <div className="flex-1">
                        <label htmlFor="privacy" className="text-sm font-medium text-gray-900 cursor-pointer">
                          [필수] 개인정보처리방침 동의
                        </label>
                        <p className="text-xs text-gray-600 mt-1">
                          개인정보 수집 및 이용에 동의합니다.
                        </p>
                      </div>
                      <Button variant="link" className="text-xs text-blue-600 p-0">보기</Button>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="marketing"
                        checked={formData.agreeMarketing}
                        onCheckedChange={(checked) => setFormData({...formData, agreeMarketing: checked as boolean})}
                      />
                      <div className="flex-1">
                        <label htmlFor="marketing" className="text-sm font-medium text-gray-900 cursor-pointer">
                          [선택] 마케팅 정보 수신 동의
                        </label>
                        <p className="text-xs text-gray-600 mt-1">
                          새로운 프로젝트와 이벤트 정보를 받아보세요.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 text-center">또는 소셜 계정으로 간편 가입</p>
                    {socialProviders.map((provider) => (
                      <Button
                        key={provider.id}
                        type="button"
                        variant="outline"
                        className={`w-full h-12 ${provider.color} transition-all duration-200`}
                        onClick={() => handleSocialSignup(provider.id)}
                        disabled={isLoading !== ""}
                      >
                        {isLoading === provider.id ? (
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-3" />
                        ) : (
                          <img src={provider.icon} alt={provider.name} className="w-5 h-5 mr-3" />
                        )}
                        {provider.name}으로 가입하기
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={!isFormValid || isLoading !== ""}
              >
                {isLoading === "signup" ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : null}
                {step === 3 ? '가입 완료' : '다음'}
              </Button>
            </form>

            {step === 1 && (
              <div className="text-center">
                <span className="text-sm text-gray-600">이미 계정이 있으신가요? </span>
                <Button
                  variant="link"
                  onClick={onLoginClick}
                  className="text-sm text-blue-600 hover:text-blue-800 p-0"
                >
                  로그인
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}