import { useCallback, useRef, DependencyList } from 'react';

/**
 * 메모이제이션된 콜백 훅
 * 의존성 배열이 변경되지 않는 한 동일한 함수 참조를 반환
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: DependencyList
): T {
    const ref = useRef<{ callback: T; deps: DependencyList }>();

    if (!ref.current || !areDepsEqual(ref.current.deps, deps)) {
        ref.current = { callback, deps };
    }

    return useCallback(ref.current.callback, deps);
}

/**
 * 의존성 배열이 동일한지 확인하는 헬퍼 함수
 */
function areDepsEqual(deps1: DependencyList, deps2: DependencyList): boolean {
    if (deps1.length !== deps2.length) return false;

    for (let i = 0; i < deps1.length; i++) {
        if (deps1[i] !== deps2[i]) return false;
    }

    return true;
}
