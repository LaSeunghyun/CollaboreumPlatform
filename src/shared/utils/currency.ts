import { CurrencyFormat } from '../types';

/**
 * 원 단위 정수를 포맷된 문자열로 변환
 * @param amount 원 단위 정수 (예: 1000000)
 * @returns 포맷된 통화 문자열 (예: "1,000,000원")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * 원 단위 정수를 CurrencyFormat 객체로 변환
 * @param amount 원 단위 정수
 * @returns CurrencyFormat 객체
 */
export function createCurrencyFormat(amount: number): CurrencyFormat {
  return {
    amount,
    formatted: formatCurrency(amount),
    currency: 'KRW',
  };
}

/**
 * 문자열을 원 단위 정수로 변환 (콤마 제거)
 * @param value 포맷된 문자열 (예: "1,000,000원")
 * @returns 원 단위 정수
 */
export function parseCurrency(value: string): number {
  const numericValue = value.replace(/[^\d]/g, '');
  return parseInt(numericValue, 10) || 0;
}

/**
 * 백분율 계산
 * @param current 현재 값
 * @param target 목표 값
 * @returns 백분율 (0-100)
 */
export function calculatePercentage(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}
