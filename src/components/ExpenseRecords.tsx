import React, { useState, useEffect } from 'react';
import { Button } from '../shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Plus,
  Receipt,
  Edit3,
  Save,
  X,
  Eye,
  Download,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import { dynamicConstantsService } from '../services/constantsService';
import { fundingAPI } from '../services/api';

interface ExpenseRecord {
  id: string;
  category: '인건비' | '재료비' | '장비비' | '마케팅비' | '기타';
  title: string;
  description: string;
  amount: number;
  receipt: string | null;
  date: string;
  stage: string | null;
  verified: boolean;
}

interface ExecutionStage {
  id: string;
  name: string;
  budget: number;
}

interface ExpenseRecordsProps {
  expenseRecords: ExpenseRecord[];
  executionPlan: {
    stages: ExecutionStage[];
    totalBudget: number;
  };
  projectStatus: string;
  isArtist: boolean;
  projectId: string;
  onUpdate: () => void;
}

export const ExpenseRecords: React.FC<ExpenseRecordsProps> = ({
  expenseRecords,
  executionPlan,
  projectStatus,
  isArtist,
  projectId,
  onUpdate,
}) => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(
    expenseRecords || [],
  );
  const [isAdding, setIsAdding] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expenseCategories, setExpenseCategories] = useState<
    Array<{ id: string; label: string; icon: string }>
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedStage, setSelectedStage] = useState<string>('전체');

  const canEdit = isArtist && projectStatus === '집행중';
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  useEffect(() => {
    const fetchExpenseCategories = async () => {
      try {
        const categories = await dynamicConstantsService.getExpenseCategories();
        setExpenseCategories(categories);
      } catch (error) {
        console.error('비용 카테고리를 가져오는 중 오류 발생:', error);
        setExpenseCategories([
          { id: 'labor', label: '인건비', icon: '👥' },
          { id: 'material', label: '재료비', icon: '🧱' },
          { id: 'equipment', label: '장비비', icon: '⚙️' },
          { id: 'marketing', label: '마케팅비', icon: '📢' },
          { id: 'other', label: '기타', icon: '📋' },
        ]);
      }
    };

    fetchExpenseCategories();
  }, []);
  const remainingBudget = executionPlan.totalBudget - totalExpenses;

  // 카테고리별 비용 통계
  const categoryStats = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  // 단계별 비용 통계
  const stageStats = expenses.reduce(
    (acc, expense) => {
      if (expense.stage) {
        acc[expense.stage] = (acc[expense.stage] || 0) + expense.amount;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  // 필터링된 비용 내역
  const filteredExpenses = expenses.filter(expense => {
    const categoryMatch =
      selectedCategory === '전체' || expense.category === selectedCategory;
    const stageMatch =
      selectedStage === '전체' || expense.stage === selectedStage;
    return categoryMatch && stageMatch;
  });

  const handleAddExpense = () => {
    const newExpense: ExpenseRecord = {
      id: `expense_${Date.now()}`,
      category: '기타',
      title: '',
      description: '',
      amount: 0,
      receipt: null,
      date: new Date().toISOString().split('T')[0] || '',
      stage: null,
      verified: false,
    };
    setEditingExpense(newExpense);
    setIsAdding(true);
  };

  const handleEditExpense = (expense: ExpenseRecord) => {
    setEditingExpense({ ...expense });
    setIsAdding(true);
  };

  const handleSaveExpense = async () => {
    if (!editingExpense) return;

    // 유효성 검사
    if (
      !editingExpense.title ||
      !editingExpense.description ||
      editingExpense.amount <= 0
    ) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      let updatedExpenses: ExpenseRecord[];

      if (editingExpense.id.startsWith('expense_')) {
        // 새 비용 내역 추가
        updatedExpenses = [
          ...expenses,
          { ...editingExpense, id: `expense_${Date.now()}` },
        ];
      } else {
        // 기존 비용 내역 수정
        updatedExpenses = expenses.map(expense =>
          expense.id === editingExpense.id ? editingExpense : expense,
        );
      }

      // API 호출하여 비용 내역 추가/수정
      const response = await fundingAPI.addExpense(projectId, {
        category: editingExpense.category,
        title: editingExpense.title,
        description: editingExpense.description,
        amount: editingExpense.amount,
        receipt: editingExpense.receipt,
        date: editingExpense.date,
        stageId: editingExpense.stage,
      });

      if (
        response &&
        typeof response === 'object' &&
        'success' in response &&
        response.success
      ) {
        setExpenses(updatedExpenses);
        setIsAdding(false);
        setEditingExpense(null);
        onUpdate();
      } else {
        const errorMessage =
          response && typeof response === 'object' && 'message' in response
            ? String(response.message)
            : '비용 내역 저장에 실패했습니다.';
        setError(errorMessage);
      }
    } catch (error) {
      console.error('비용 내역 저장 오류:', error);
      setError('비용 내역 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsAdding(false);
    setEditingExpense(null);
    setError(null);
  };

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 실제로는 파일 업로드 API 호출
      const reader = new (window as any).FileReader();
      reader.onload = (e: any) => {
        if (editingExpense) {
          setEditingExpense({
            ...editingExpense,
            receipt: e.target?.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const renderExpenseForm = () => {
    if (!editingExpense) return null;

    return (
      <Card className='border-2 border-blue-200'>
        <CardHeader>
          <CardTitle className='text-lg'>
            {editingExpense.id.startsWith('expense_')
              ? '새 비용 내역 추가'
              : '비용 내역 수정'}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label htmlFor='expenseCategory' className='text-sm font-medium'>
                카테고리 *
              </Label>
              <Select
                value={editingExpense.category}
                onValueChange={value =>
                  setEditingExpense(prev =>
                    prev
                      ? {
                          ...prev,
                          category: value as
                            | '인건비'
                            | '재료비'
                            | '장비비'
                            | '마케팅비'
                            | '기타',
                        }
                      : null,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='인건비'>인건비</SelectItem>
                  <SelectItem value='재료비'>재료비</SelectItem>
                  <SelectItem value='장비비'>장비비</SelectItem>
                  <SelectItem value='마케팅비'>마케팅비</SelectItem>
                  <SelectItem value='기타'>기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='expenseAmount' className='text-sm font-medium'>
                금액 (원) *
              </Label>
              <Input
                id='expenseAmount'
                type='number'
                value={editingExpense.amount || ''}
                onChange={e =>
                  setEditingExpense(prev =>
                    prev
                      ? { ...prev, amount: parseInt(e.target.value) || 0 }
                      : null,
                  )
                }
                placeholder='100000'
                min='0'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='expenseTitle' className='text-sm font-medium'>
              제목 *
            </Label>
            <Input
              id='expenseTitle'
              value={editingExpense.title}
              onChange={e =>
                setEditingExpense(prev =>
                  prev ? { ...prev, title: e.target.value } : null,
                )
              }
              placeholder='예: 디자인 작업비'
            />
          </div>

          <div>
            <Label htmlFor='expenseDescription' className='text-sm font-medium'>
              상세 설명 *
            </Label>
            <Textarea
              id='expenseDescription'
              value={editingExpense.description}
              onChange={e =>
                setEditingExpense(prev =>
                  prev ? { ...prev, description: e.target.value } : null,
                )
              }
              placeholder='비용 사용 내역을 상세히 설명하세요'
              rows={3}
            />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label htmlFor='expenseDate' className='text-sm font-medium'>
                사용일 *
              </Label>
              <Input
                id='expenseDate'
                type='date'
                value={editingExpense.date}
                onChange={e =>
                  setEditingExpense(prev =>
                    prev ? { ...prev, date: e.target.value } : null,
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor='expenseStage' className='text-sm font-medium'>
                관련 단계
              </Label>
              <Select
                value={editingExpense.stage || ''}
                onValueChange={value =>
                  setEditingExpense(prev =>
                    prev
                      ? { ...prev, stage: value === '' ? null : value }
                      : null,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='선택사항' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=''>선택하지 않음</SelectItem>
                  {executionPlan.stages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor='expenseReceipt' className='text-sm font-medium'>
              영수증 업로드
            </Label>
            <div className='flex items-center gap-3'>
              <Input
                id='expenseReceipt'
                type='file'
                accept='image/*,.pdf'
                onChange={handleReceiptUpload}
                className='flex-1'
              />
              {editingExpense.receipt && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => window.open(editingExpense.receipt!, '_blank')}
                >
                  <Eye className='mr-2 h-4 w-4' />
                  보기
                </Button>
              )}
            </div>
            <p className='mt-1 text-xs text-gray-500'>
              영수증, 인보이스, 계약서 등을 업로드하여 투명성을 높이세요
            </p>
          </div>

          {error && (
            <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
              <div className='flex items-center gap-2 text-red-800'>
                <span className='text-sm'>{error}</span>
              </div>
            </div>
          )}

          <div className='flex justify-end gap-3'>
            <Button variant='outline' onClick={handleCancelEdit}>
              <X className='mr-2 h-4 w-4' />
              취소
            </Button>
            <Button onClick={handleSaveExpense} disabled={isSubmitting}>
              <Save className='mr-2 h-4 w-4' />
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-semibold'>비용 사용 내역</h3>
          <p className='text-sm text-gray-600'>
            투명한 비용 공개를 통해 후원자들의 신뢰를 얻으세요
          </p>
        </div>
        {canEdit && (
          <Button onClick={handleAddExpense} disabled={isAdding}>
            <Plus className='mr-2 h-4 w-4' />
            비용 내역 추가
          </Button>
        )}
      </div>

      {/* 예산 현황 */}
      <Card>
        <CardHeader>
          <CardTitle>예산 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='mb-4 grid grid-cols-1 gap-6 md:grid-cols-3'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                ₩{executionPlan.totalBudget.toLocaleString()}
              </div>
              <div className='text-sm text-gray-500'>총 예산</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-orange-600'>
                ₩{totalExpenses.toLocaleString()}
              </div>
              <div className='text-sm text-gray-500'>사용된 금액</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                ₩{remainingBudget.toLocaleString()}
              </div>
              <div className='text-sm text-gray-500'>남은 예산</div>
            </div>
          </div>
          <div className='h-3 w-full rounded-full bg-gray-200'>
            <div
              className='h-3 rounded-full bg-blue-500 transition-all duration-300'
              style={{
                width: `${(totalExpenses / executionPlan.totalBudget) * 100}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 비용 통계 */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* 카테고리별 비용 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <PieChart className='h-5 w-5' />
              카테고리별 비용
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {Object.entries(categoryStats).map(([category, amount]) => (
                <div
                  key={category}
                  className='flex items-center justify-between'
                >
                  <span className='text-sm font-medium'>{category}</span>
                  <div className='flex items-center gap-2'>
                    <div className='h-2 w-24 rounded-full bg-gray-200'>
                      <div
                        className='h-2 rounded-full bg-blue-500'
                        style={{ width: `${(amount / totalExpenses) * 100}%` }}
                      />
                    </div>
                    <span className='w-20 text-right text-sm font-medium'>
                      ₩{amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 단계별 비용 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              단계별 비용
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {executionPlan.stages.map(stage => {
                const stageAmount = stageStats[stage.id] || 0;
                return (
                  <div
                    key={stage.id}
                    className='flex items-center justify-between'
                  >
                    <span className='text-sm font-medium'>{stage.name}</span>
                    <div className='flex items-center gap-2'>
                      <div className='h-2 w-24 rounded-full bg-gray-200'>
                        <div
                          className='h-2 rounded-full bg-green-500'
                          style={{
                            width: `${(stageAmount / stage.budget) * 100}%`,
                          }}
                        />
                      </div>
                      <span className='w-20 text-right text-sm font-medium'>
                        ₩{stageAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 */}
      <div className='flex gap-4'>
        <div className='flex-1'>
          <Label htmlFor='categoryFilter' className='text-sm font-medium'>
            카테고리
          </Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='전체'>전체</SelectItem>
              {expenseCategories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.icon} {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex-1'>
          <Label htmlFor='stageFilter' className='text-sm font-medium'>
            집행 단계
          </Label>
          <Select value={selectedStage} onValueChange={setSelectedStage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='전체'>전체</SelectItem>
              {executionPlan.stages.map(stage => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 비용 내역 목록 */}
      <div className='space-y-4'>
        {filteredExpenses.length === 0 ? (
          <Card>
            <CardContent className='p-8 text-center text-gray-500'>
              <Receipt className='mx-auto mb-4 h-12 w-12 opacity-50' />
              <p>아직 비용 내역이 없습니다.</p>
              {canEdit && (
                <p className='mt-2 text-sm'>
                  비용 내역 추가 버튼을 클릭하여 첫 번째 비용을 등록하세요.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredExpenses.map(expense => (
            <Card
              key={expense.id}
              className='transition-shadow hover:shadow-md'
            >
              <CardContent className='p-6'>
                <div className='mb-4 flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='mb-2 flex items-center gap-3'>
                      <Badge className='bg-blue-100 text-blue-800'>
                        {expense.category}
                      </Badge>
                      {expense.stage && (
                        <Badge variant='outline'>
                          {
                            executionPlan.stages.find(
                              s => s.id === expense.stage,
                            )?.name
                          }
                        </Badge>
                      )}
                      {expense.verified && (
                        <Badge className='bg-green-100 text-green-800'>
                          검증완료
                        </Badge>
                      )}
                    </div>
                    <h4 className='mb-2 text-lg font-medium'>
                      {expense.title}
                    </h4>
                    <p className='mb-3 text-gray-600'>{expense.description}</p>

                    <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-3'>
                      <div>
                        <span className='text-gray-500'>금액:</span>
                        <span className='ml-2 font-medium'>
                          ₩{expense.amount.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-500'>사용일:</span>
                        <span className='ml-2 font-medium'>
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-500'>영수증:</span>
                        <span className='ml-2 font-medium'>
                          {expense.receipt ? '있음' : '없음'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {canEdit && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleEditExpense(expense)}
                      disabled={isAdding}
                    >
                      <Edit3 className='h-4 w-4' />
                    </Button>
                  )}
                </div>

                {/* 영수증 표시 */}
                {expense.receipt && (
                  <div className='border-t pt-4'>
                    <div className='mb-2 flex items-center gap-2'>
                      <Receipt className='h-4 w-4 text-gray-500' />
                      <span className='text-sm font-medium'>영수증</span>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => window.open(expense.receipt!, '_blank')}
                      >
                        <Eye className='mr-2 h-4 w-4' />
                        보기
                      </Button>
                      <Button variant='outline' size='sm'>
                        <Download className='mr-2 h-4 w-4' />
                        다운로드
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 비용 내역 추가/수정 폼 */}
      {isAdding && renderExpenseForm()}
    </div>
  );
};
