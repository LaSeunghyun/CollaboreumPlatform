import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Building, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { FundingProject, FundingReward, mockPaymentProcess } from "../utils/funding";

interface PaymentModalProps {
  project: FundingProject;
  selectedReward?: FundingReward;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ project, selectedReward, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<'amount' | 'payment' | 'processing' | 'success' | 'error'>('amount');
  const [customAmount, setCustomAmount] = useState(selectedReward?.amount || 10000);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'phone'>('card');
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const presetAmounts = [10000, 30000, 50000, 100000];
  const platformFee = Math.ceil(customAmount * 0.03); // 3% 플랫폼 수수료
  const totalAmount = customAmount + platformFee;

  const handleAmountSelect = (amount: number) => {
    setCustomAmount(amount);
  };

  const handleNextStep = () => {
    if (step === 'amount') {
      setStep('payment');
    }
  };

  const handlePayment = async () => {
    if (!agreeTerms || !agreePrivacy) {
      setErrorMessage("필수 약관에 동의해주세요.");
      return;
    }

    if (!isAnonymous && (!donorName || !donorEmail)) {
      setErrorMessage("후원자 정보를 입력해주세요.");
      return;
    }

    setStep('processing');
    setErrorMessage("");

    try {
      const result = await mockPaymentProcess(totalAmount, paymentMethod);
      
      if (result.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setErrorMessage(result.error || "결제 처리 중 오류가 발생했습니다.");
        setStep('error');
      }
    } catch (error) {
      setErrorMessage("네트워크 오류가 발생했습니다.");
      setStep('error');
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard className="w-5 h-5" />;
      case 'phone': return <Smartphone className="w-5 h-5" />;
      case 'transfer': return <Building className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'card': return '신용카드';
      case 'phone': return '휴대폰 결제';
      case 'transfer': return '계좌이체';
      default: return '신용카드';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">
            {step === 'amount' && '후원 금액 선택'}
            {step === 'payment' && '결제 정보 입력'}
            {step === 'processing' && '결제 처리 중'}
            {step === 'success' && '후원 완료'}
            {step === 'error' && '결제 오류'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="cursor-pointer">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Project Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-1">{project.title}</h3>
            <p className="text-sm text-gray-600">by {project.artistName}</p>
            {selectedReward && (
              <div className="mt-2">
                <Badge className="bg-blue-100 text-blue-800">{selectedReward.title}</Badge>
              </div>
            )}
          </div>

          {/* Step 1: Amount Selection */}
          {step === 'amount' && (
            <div className="space-y-4">
              {selectedReward && (
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-medium text-gray-900 mb-2">{selectedReward.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{selectedReward.description}</p>
                  <p className="text-sm text-gray-500">예상 전달: {selectedReward.estimatedDelivery}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">후원 금액</label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {presetAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={customAmount === amount ? "default" : "outline"}
                      onClick={() => handleAmountSelect(amount)}
                      className="cursor-pointer"
                    >
                      ₩{amount.toLocaleString()}
                    </Button>
                  ))}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">직접 입력</label>
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    placeholder="후원 금액을 입력하세요"
                    min="1000"
                    step="1000"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>후원 금액</span>
                  <span>₩{customAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>플랫폼 수수료 (3%)</span>
                  <span>₩{platformFee.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>총 결제 금액</span>
                  <span>₩{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <Button 
                onClick={handleNextStep} 
                className="w-full cursor-pointer"
                disabled={customAmount < 1000}
              >
                다음 단계
              </Button>
            </div>
          )}

          {/* Step 2: Payment Information */}
          {step === 'payment' && (
            <div className="space-y-4">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">결제 방법</label>
                <div className="grid grid-cols-3 gap-2">
                  {['card', 'phone', 'transfer'].map((method) => (
                    <Button
                      key={method}
                      variant={paymentMethod === method ? "default" : "outline"}
                      onClick={() => setPaymentMethod(method as any)}
                      className="flex flex-col items-center p-3 h-auto cursor-pointer"
                    >
                      {getPaymentMethodIcon(method)}
                      <span className="text-xs mt-1">{getPaymentMethodName(method)}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Donor Information */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                  <label htmlFor="anonymous" className="text-sm text-gray-700 cursor-pointer">
                    익명으로 후원하기
                  </label>
                </div>

                {!isAnonymous && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                      <Input
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="실명을 입력하세요"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                      <Input
                        type="email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder="이메일을 입력하세요"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">휴대폰 번호</label>
                      <Input
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                        placeholder="010-0000-0000"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Agreement */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={setAgreeTerms}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                    [필수] 결제 서비스 이용약관에 동의합니다.
                  </label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={agreePrivacy}
                    onCheckedChange={setAgreePrivacy}
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-700 cursor-pointer">
                    [필수] 개인정보 수집 및 이용에 동의합니다.
                  </label>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">안전한 결제</p>
                  <p>SSL 암호화로 보안이 보장됩니다.</p>
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
              )}

              <div className="space-y-2">
                <Button 
                  onClick={handlePayment} 
                  className="w-full cursor-pointer"
                  disabled={!agreeTerms || !agreePrivacy}
                >
                  ₩{totalAmount.toLocaleString()} 결제하기
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setStep('amount')} 
                  className="w-full cursor-pointer"
                >
                  이전 단계
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 'processing' && (
            <div className="text-center py-8 space-y-4">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
              <div>
                <h3 className="font-medium text-gray-900">결제 처리 중</h3>
                <p className="text-sm text-gray-600">잠시만 기다려주세요...</p>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">후원이 완료되었습니다!</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {project.artistName}님의 프로젝트를 후원해주셔서 감사합니다.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>후원 금액:</span>
                    <span>₩{customAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>결제 방법:</span>
                    <span>{getPaymentMethodName(paymentMethod)}</span>
                  </div>
                  {selectedReward && (
                    <div className="flex justify-between">
                      <span>선택 리워드:</span>
                      <span>{selectedReward.title}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Error */}
          {step === 'error' && (
            <div className="text-center py-8 space-y-4">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">결제에 실패했습니다</h3>
                <p className="text-sm text-gray-600 mt-2">{errorMessage}</p>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={() => setStep('payment')} 
                  className="w-full cursor-pointer"
                >
                  다시 시도
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  className="w-full cursor-pointer"
                >
                  닫기
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}