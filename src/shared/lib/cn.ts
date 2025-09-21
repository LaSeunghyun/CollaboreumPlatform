import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 클래스명을 병합하는 유틸리티 함수
 * clsx와 tailwind-merge를 조합하여 중복 클래스를 제거하고 충돌을 해결합니다.
 *
 * @param inputs - 병합할 클래스 값들
 * @returns 병합된 클래스 문자열
 *
 * @example
 * cn("px-2 py-1", "px-4") // "py-1 px-4"
 * cn("bg-red-500", { "bg-blue-500": true }) // "bg-blue-500"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
