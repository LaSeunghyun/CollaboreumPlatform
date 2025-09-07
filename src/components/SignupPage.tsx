import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Palette, Heart, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { authAPI } from '../services/api';
import { TermsOfService } from './TermsOfService';
import { PrivacyPolicy } from './PrivacyPolicy';
import { SignupSuccessPage } from './SignupSuccessPage';

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

  // 유효성 검사 상태
  const [emailValidation, setEmailValidation] = useState({
    isValid: false,
    isChecking: false,
    isDuplicate: false,
    message: ''
  });
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    hasLength: false,
    hasSpecial: false,
    hasNumber: false,
    hasUpper: false
  });

  // 약관 페이지 상태 관리
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // 오류 모달 상태 관리
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 회원가입 성공 상태 관리
  const [showSuccessPage, setShowSuccessPage] = useState(false);

  // 이메일 중복 검사 (디바운싱 적용)
  const checkEmailDuplicate = useCallback(async (email: string) => {
    if (!email || !isValidEmail(email)) return;

    setEmailValidation(prev => ({ ...prev, isChecking: true }));

    try {
      const response = await authAPI.checkEmailDuplicate(email) as any;

      if (response && response.success !== undefined) {
        setEmailValidation({
          isValid: !response.isDuplicate,
          isChecking: false,
          isDuplicate: response.isDuplicate,
          message: response.isDuplicate ? '이미 사용 중인 이메일입니다.' : '사용 가능한 이메일입니다.'
        });
      } else {
        // API 응답이 예상과 다른 경우
        console.warn('예상치 못한 API 응답:', response);
        setEmailValidation({
          isValid: true, // 일단 사용 가능하다고 가정
          isChecking: false,
          isDuplicate: false,
          message: '이메일 확인을 건너뜁니다.'
        });
      }
    } catch (error) {
      console.error('이메일 중복 검사 오류:', error);
      // 오류 발생 시에도 진행할 수 있도록 설정
      setEmailValidation({
        isValid: true, // 오류 시에도 사용 가능하다고 가정
        isChecking: false,
        isDuplicate: false,
        message: '이메일 확인을 건너뜁니다.'
      });
    }
  }, []);

  // 이메일 변경 시 중복 검사
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email && isValidEmail(formData.email)) {
        checkEmailDuplicate(formData.email);
      } else {
        setEmailValidation({
          isValid: false,
          isChecking: false,
          isDuplicate: false,
          message: ''
        });
      }
    }, 500); // 500ms 디바운싱

    return () => clearTimeout(timer);
  }, [formData.email, checkEmailDuplicate]);

  // 비밀번호 유효성 검사
  useEffect(() => {
    const password = formData.password;
    setPasswordValidation({
      isValid: password.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(password) && /\d/.test(password) && /[A-Z]/.test(password),
      hasLength: password.length >= 8,
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasNumber: /\d/.test(password),
      hasUpper: /[A-Z]/.test(password)
    });
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // 이메일 중복 확인
      if (emailValidation.isDuplicate) {
        setErrorMessage('이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.');
        setShowErrorModal(true);
        return;
      }
      setStep(3);
    } else {
      setIsLoading("signup");
      try {
        const response = await authAPI.signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: formData.userType,
          agreeTerms: formData.agreeTerms,
          agreePrivacy: formData.agreePrivacy,
          agreeMarketing: formData.agreeMarketing
        }) as any;

        if (response.success) {
          setShowSuccessPage(true);
        } else {
          console.error('회원가입 실패:', response.message);
          setErrorMessage(response.message);
          setShowErrorModal(true);
        }
      } catch (error: any) {
        console.error('회원가입 오류:', error);
        const errorMsg = error.message || '회원가입 중 오류가 발생했습니다.';
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
      } finally {
        setIsLoading("");
      }
    }
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

  const doPasswordsMatch = formData.password === confirmPassword && confirmPassword !== "";

  // 이메일 형식 검증
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 폼 유효성 검사
  const isFormValid = step === 1 ? formData.userType !== null :
    step === 2 ? (formData.name && formData.email && emailValidation.isValid && !emailValidation.isDuplicate && passwordValidation.isValid && doPasswordsMatch) :
      (formData.agreeTerms && formData.agreePrivacy);

  // 회원가입 성공 페이지 표시
  if (showSuccessPage) {
    return <SignupSuccessPage
      userData={formData}
      onGoToLogin={onLoginClick}
    />;
  }

  // 약관 페이지가 열려있으면 해당 페이지 표시
  if (showTerms) {
    return <TermsOfService onBack={() => setShowTerms(false)} />;
  }

  if (showPrivacy) {
    return <PrivacyPolicy onBack={() => setShowPrivacy(false)} />;
  }

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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= num ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
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
                        onClick={() => setFormData({ ...formData, userType: type.id })}
                        className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${formData.userType === type.id ? type.selectedColor : type.color
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
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                        className={`pl-10 ${formData.email && !isValidEmail(formData.email) ? 'border-red-500' : emailValidation.isDuplicate ? 'border-red-500' : emailValidation.isValid ? 'border-green-500' : ''}`}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                      {emailValidation.isChecking && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4 animate-spin" />
                      )}
                    </div>
                    {formData.email && (
                      <div className="text-xs">
                        {!isValidEmail(formData.email) && (
                          <p className="text-red-600">올바른 이메일 형식을 입력해주세요</p>
                        )}
                        {isValidEmail(formData.email) && emailValidation.message && (
                          <p className={emailValidation.isValid ? 'text-green-600' : 'text-red-600'}>
                            {emailValidation.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">비밀번호</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호를 입력하세요"
                        className="pl-10 pr-10"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                    {/* 비밀번호 요구사항 표시 */}
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">비밀번호는 다음을 포함해야 합니다:</p>
                      <div className="space-y-1">
                        <div className={`flex items-center text-xs ${passwordValidation.hasLength ? 'text-green-600' : 'text-red-600'}`}>
                          {passwordValidation.hasLength ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                          8자 이상
                        </div>
                        <div className={`flex items-center text-xs ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-red-600'}`}>
                          {passwordValidation.hasSpecial ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                          특수문자 포함
                        </div>
                        <div className={`flex items-center text-xs ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                          {passwordValidation.hasNumber ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                          숫자 포함
                        </div>
                        <div className={`flex items-center text-xs ${passwordValidation.hasUpper ? 'text-green-600' : 'text-red-600'}`}>
                          {passwordValidation.hasUpper ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                          대문자 포함
                        </div>
                      </div>
                    </div>
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
                  <div className="text-center mb-4">
                    <Badge className={
                      formData.userType === 'artist' ? 'bg-purple-100 text-purple-800' : 'bg-pink-100 text-pink-800'
                    }>
                      {formData.userType === 'artist' ? '아티스트' : '팬'} 가입
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
                      />
                      <div className="flex-1">
                        <label htmlFor="terms" className="text-sm font-medium text-gray-900 cursor-pointer">
                          [필수] 이용약관 동의
                        </label>
                        <p className="text-xs text-gray-600 mt-1">
                          서비스 이용을 위한 기본 약관에 동의합니다.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="link"
                        className="text-xs text-blue-600 p-0"
                        onClick={() => setShowTerms(true)}
                      >
                        보기
                      </Button>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="privacy"
                        checked={formData.agreePrivacy}
                        onCheckedChange={(checked) => setFormData({ ...formData, agreePrivacy: checked as boolean })}
                      />
                      <div className="flex-1">
                        <label htmlFor="privacy" className="text-sm font-medium text-gray-900 cursor-pointer">
                          [필수] 개인정보처리방침 동의
                        </label>
                        <p className="text-xs text-gray-600 mt-1">
                          개인정보 수집 및 이용에 동의합니다.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="link"
                        className="text-xs text-blue-600 p-0"
                        onClick={() => setShowPrivacy(true)}
                      >
                        보기
                      </Button>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="marketing"
                        checked={formData.agreeMarketing}
                        onCheckedChange={(checked) => setFormData({ ...formData, agreeMarketing: checked as boolean })}
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
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isFormValid || isLoading === "signup"}
                >
                  {isLoading === "signup" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      가입 중...
                    </>
                  ) : step === 1 ? '다음' : step === 2 ? '다음' : '회원가입 완료'}
                </Button>
              </div>
            </form>

            {/* Social Signup */}
            {step === 1 && (
              <>
                <Separator className="my-6" />
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">또는</p>
                  <div className="grid gap-3">
                    <Button
                      variant="outline"
                      onClick={() => onSocialSignup('google', formData.userType)}
                      className="w-full"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google로 계속하기
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onSocialSignup('kakao', formData.userType)}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-400"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 3C6.48 3 2 6.48 2 12s4.48 9 9 9 9-4.48 9-9-4.48-9-9-9zm-1 13.5c-2.49 0-4.5-2.01-4.5-4.5S8.51 6.5 11 6.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" />
                      </svg>
                      카카오로 계속하기
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  로그인
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">오류</h3>
            </div>
            <p className="text-gray-700 mb-6">{errorMessage}</p>
            <Button
              onClick={() => setShowErrorModal(false)}
              className="w-full"
            >
              확인
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}