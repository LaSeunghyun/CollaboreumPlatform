import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { useSearchParams } from 'react-router-dom';
import { Button, Input, Card } from '@/shared/ui';

interface LoginPageProps {
  onBack: () => void;
  onLogin: (data: any) => void;
  onSignupClick: () => void;
}

interface LoginData {
  email: string;
  password: string;
}

export function LoginPage({ onBack: _onBack, onLogin: _onLogin, onSignupClick }: LoginPageProps) {
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  // 오류 모달 상태 관리
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // useAuth 훅 사용
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 리다이렉트 URL 처리
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login(formData) as any;

      if (response.success) {
        // AuthContext의 login 함수 호출
        login(response.data.token, response.data.user);
        // 로그인 성공 후 리다이렉트 URL로 이동
        window.location.href = redirectUrl;
      } else {
        setErrorMessage(response.message);
        setShowErrorModal(true);
      }
    } catch (error: any) {
      // 서버에서 반환된 오류 메시지가 있으면 사용, 없으면 기본 메시지
      const errorMsg = error.message || '로그인 중 오류가 발생했습니다.';
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center p-4">
      {/* Background Art Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary-200/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-secondary-200/25 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-accent-300/30 rotate-45 animate-spin-slow"></div>
      </div>

      <div className="w-full max-w-md relative">

        <Card className="backdrop-blur-sm bg-card/90 border-0 shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Collaboreum</h1>
              <p className="text-muted-foreground">창작자와 팬을 연결하는 플랫폼</p>
            </div>
            <CardTitle className="text-xl text-foreground">로그인</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">이메일</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="email"
                      placeholder="이메일을 입력하세요"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : null}
                  로그인
                </Button>
              </div>
            </form>

            <div className="text-center">
              <span className="text-sm text-gray-600">계정이 없으신가요? </span>
              <Button
                variant="link"
                onClick={onSignupClick}
                className="text-sm text-blue-600 hover:text-blue-800 p-0"
              >
                회원가입
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 오류 모달 */}
        {showErrorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">로그인 오류</h3>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                {errorMessage}
              </p>
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowErrorModal(false)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  확인
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}