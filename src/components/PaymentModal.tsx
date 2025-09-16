import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  X,
  Lock,
  Shield,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dynamicConstantsService } from '../services/constantsService';
import { fundingAPI } from '../services/api';

interface PaymentModalProps {
  project: any;
  onClose: () => void;
  onSuccess: (paymentData: any) => void;
}

interface PaymentForm {
  amount: number;
  rewardId: string | null;
  isAnonymous: boolean;
  message: string;
  paymentMethod: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardHolder: string;
  phoneNumber: string;
  bankAccount: string;
  bankName: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  project,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<Array<{ id: string, label: string, icon: string }>>([]);

  const [formData, setFormData] = useState<PaymentForm>({
    amount: 0,
    rewardId: null,
    isAnonymous: false,
    message: '',
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardHolder: '',
    phoneNumber: '',
    bankAccount: '',
    bankName: '',
    termsAccepted: false,
    privacyAccepted: false
  });

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const methods = await dynamicConstantsService.getPaymentMethods();
        setPaymentMethods(methods);
      } catch (error) {
        console.error('결제 방법을 가져오는 중 오류 발생:', error);
        setPaymentMethods([
          { id: 'card', label: '신용카드', icon: '💳' },
          { id: 'phone', label: '휴대폰 결제', icon: '📱' },
          { id: 'bank', label: '계좌이체', icon: '🏦' }
        ]);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleInputChange = (field: keyof PaymentForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRewardSelect = (rewardId: string, amount: number) => {
    setFormData(prev => ({
      ...prev,
      rewardId,
      amount
    }));
  };

  const handleCustomAmount = (amount: number) => {
    setFormData(prev => ({
      ...prev,
      amount,
      rewardId: null
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // 후원 금액 및 리워드 선택
        return formData.amount >= 1000;
      case 2: // 후원자 정보
        return true; // 기본값이 설정되어 있음
      case 3: // 결제 정보
        if (formData.paymentMethod === 'card') {
          return !!(formData.cardNumber && formData.cardExpiry && formData.cardCvv && formData.cardHolder);
        } else if (formData.paymentMethod === 'phone') {
          return !!formData.phoneNumber;
        } else if (formData.paymentMethod === 'bank') {
          return !!(formData.bankAccount && formData.bankName);
        }
        return false;
      case 4: // 약관 동의
        return formData.termsAccepted && formData.privacyAccepted;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setError(null);
    } else {
      // 단계별 에러 메시지 설정
      switch (currentStep) {
        case 1:
          if (formData.amount < 1000) {
            setError('최소 후원 금액은 1,000원입니다.');
          }
          break;
        case 3:
          setError('결제 정보를 모두 입력해주세요.');
          break;
        case 4:
          setError('약관에 동의해주세요.');
          break;
        default:
          setError('필수 항목을 입력해주세요.');
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const response = await fundingAPI.backProject(project.id, {
        amount: formData.amount,
        rewardId: formData.rewardId,
        isAnonymous: formData.isAnonymous,
        message: formData.message
      });

      if ((response as any).success) {
        onSuccess((response as any).data);
      } else {
        setError((response as any).message || '후원 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('후원 처리 오류:', error);
      setError('후원 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">후원 금액 및 리워드 선택</h3>

              {/* 리워드 옵션 */}
              {project.rewards && project.rewards.length > 0 && (
                <div className="space-y-3 mb-6">
                  <Label className="text-sm font-medium">리워드 선택 (선택사항)</Label>
                  {project.rewards.map((reward: any, index: number) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${formData.rewardId === reward.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      onClick={() => handleRewardSelect(reward.id, reward.amount)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{reward.title}</h4>
                        <Badge variant="secondary">₩{reward.amount.toLocaleString()}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                      <div className="text-xs text-gray-500">
                        선택한 후원자: {reward.claimed}명
                        {reward.maxClaim && ` / 제한: ${reward.maxClaim}명`}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 커스텀 금액 */}
              <div className="space-y-3">
                <Label htmlFor="amount" className="text-sm font-medium">후원 금액</Label>
                <Label className="text-sm font-medium">직접 입력</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[1000, 5000, 10000, 50000, 100000].map((amount) => (
                    <Button
                      key={amount}
                      variant={formData.amount === amount && !formData.rewardId ? 'default' : 'outline'}
                      onClick={() => handleCustomAmount(amount)}
                      className="w-full"
                    >
                      ₩{amount.toLocaleString()}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="직접 입력"
                    value={formData.amount || ''}
                    onChange={(e) => handleCustomAmount(parseInt(e.target.value) || 0)}
                    min="1000"
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500 self-center">원</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">후원자 정보</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={formData.isAnonymous}
                    onCheckedChange={(checked) => handleInputChange('isAnonymous', checked)}
                  />
                  <Label htmlFor="anonymous">익명으로 후원하기</Label>
                </div>

                {!formData.isAnonymous && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>{user?.name}</strong>님으로 후원됩니다.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="message" className="text-sm font-medium">
                    후원 메시지 (선택사항)
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="창작자에게 전할 메시지를 입력하세요..."
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    maxLength={500}
                    rows={3}
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {formData.message.length}/500
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">결제 방법 선택</h3>

              <div className="space-y-4">
                <Label htmlFor="paymentMethod" className="text-sm font-medium">결제 방법</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleInputChange('paymentMethod', value)}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="결제 방법을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex items-center gap-2">
                          <span>{method.icon}</span>
                          {method.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 신용카드 입력 폼 */}
                {formData.paymentMethod === 'card' && (
                  <div className="space-y-3 p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="cardNumber" className="text-sm font-medium">카드번호</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          maxLength={19}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardExpiry" className="text-sm font-medium">만료일</Label>
                        <Input
                          id="cardExpiry"
                          placeholder="MM/YY"
                          value={formData.cardExpiry}
                          onChange={(e) => handleInputChange('cardExpiry', e.target.value)}
                          maxLength={5}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="cardCvv" className="text-sm font-medium">CVV</Label>
                        <Input
                          id="cardCvv"
                          placeholder="123"
                          value={formData.cardCvv}
                          onChange={(e) => handleInputChange('cardCvv', e.target.value)}
                          maxLength={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardHolder" className="text-sm font-medium">카드소지자</Label>
                        <Input
                          id="cardHolder"
                          placeholder="홍길동"
                          value={formData.cardHolder}
                          onChange={(e) => handleInputChange('cardHolder', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 휴대폰 결제 입력 폼 */}
                {formData.paymentMethod === 'phone' && (
                  <div className="space-y-3 p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="phoneNumber" className="text-sm font-medium">휴대폰 번호</Label>
                      <Input
                        id="phoneNumber"
                        placeholder="010-1234-5678"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* 계좌이체 입력 폼 */}
                {formData.paymentMethod === 'bank' && (
                  <div className="space-y-3 p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="bankName" className="text-sm font-medium">은행명</Label>
                        <Input
                          id="bankName"
                          placeholder="신한은행"
                          value={formData.bankName}
                          onChange={(e) => handleInputChange('bankName', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bankAccount" className="text-sm font-medium">계좌번호</Label>
                        <Input
                          id="bankAccount"
                          placeholder="123-456789-01"
                          value={formData.bankAccount}
                          onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 보안 정보 */}
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    모든 결제 정보는 SSL 암호화를 통해 안전하게 처리됩니다.
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">약관 동의 및 확인</h3>

              <div className="space-y-4">
                {/* 후원 요약 */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">후원 요약</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>후원 금액:</span>
                      <span className="font-medium">₩{formData.amount.toLocaleString()}</span>
                    </div>
                    {formData.rewardId && (
                      <div className="flex justify-between">
                        <span>선택한 리워드:</span>
                        <span className="font-medium">
                          {project.rewards.find((r: any) => r.id === formData.rewardId)?.title}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>후원자:</span>
                      <span className="font-medium">
                        {formData.isAnonymous ? '익명' : user?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 약관 동의 */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => handleInputChange('termsAccepted', checked)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      <a href="/terms" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        이용약관
                      </a>에 동의합니다
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privacy"
                      checked={formData.privacyAccepted}
                      onCheckedChange={(checked) => handleInputChange('privacyAccepted', checked)}
                    />
                    <Label htmlFor="privacy" className="text-sm">
                      <a href="/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        개인정보처리방침
                      </a>에 동의합니다
                    </Label>
                  </div>
                </div>

                {/* 최종 확인 */}
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">후원 전 확인사항</p>
                      <ul className="space-y-1 text-xs">
                        <li>• 후원은 프로젝트 성공 시에만 처리됩니다.</li>
                        <li>• 프로젝트 실패 시 자동으로 환불됩니다.</li>
                        <li>• 후원 후에는 취소할 수 없습니다.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">프로젝트 후원하기</h2>
            <p className="text-sm text-gray-600">{project.title}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 진행률 바 */}
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>단계 {currentStep} / {totalSteps}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* 스텝 콘텐츠 */}
        <div className="p-6">
          <div className="space-y-6">
            {/* 에러 메시지 표시 */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {renderStepContent()}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-between p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            이전
          </Button>

          <div className="flex gap-3">
            {currentStep < totalSteps ? (
              <Button onClick={nextStep} disabled={!validateStep(currentStep)}>
                다음
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep(currentStep) || isProcessing}
                className="min-w-[100px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    처리중...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    후원하기
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
