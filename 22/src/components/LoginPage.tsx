import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";

interface LoginPageProps {
  onBack: () => void;
  onLogin: (email: string, password: string) => void;
  onSocialLogin: (provider: string) => void;
  onSignupClick: () => void;
}

export function LoginPage({ onBack, onLogin, onSocialLogin, onSignupClick }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading("email");
    // Simulate API call
    setTimeout(() => {
      onLogin(email, password);
      setIsLoading("");
    }, 1500);
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(provider);
    // Simulate social login
    setTimeout(() => {
      onSocialLogin(provider);
      setIsLoading("");
    }, 1500);
  };

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
          onClick={onBack}
          className="mb-6 bg-white/80 hover:bg-white backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로가기
        </Button>

        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Collaboreum</h1>
              <p className="text-gray-600">창작자와 팬을 연결하는 플랫폼</p>
            </div>
            <CardTitle className="text-xl text-gray-900">로그인</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Login */}
            <div className="space-y-3">
              {socialProviders.map((provider) => (
                <Button
                  key={provider.id}
                  variant="outline"
                  className={`w-full h-12 ${provider.color} transition-all duration-200`}
                  onClick={() => handleSocialLogin(provider.id)}
                  disabled={isLoading !== ""}
                >
                  {isLoading === provider.id ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-3" />
                  ) : (
                    <img src={provider.icon} alt={provider.name} className="w-5 h-5 mr-3" />
                  )}
                  {provider.name}으로 시작하기
                </Button>
              ))}
            </div>

            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">또는</span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">이메일</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="email"
                    placeholder="이메일을 입력하세요"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600">
                    로그인 상태 유지
                  </label>
                </div>
                <Button variant="link" className="text-sm text-blue-600 hover:text-blue-800 p-0">
                  비밀번호 찾기
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading !== ""}
              >
                {isLoading === "email" ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : null}
                로그인
              </Button>
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

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            로그인하면 <span className="text-blue-600">이용약관</span> 및{" "}
            <span className="text-blue-600">개인정보처리방침</span>에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}