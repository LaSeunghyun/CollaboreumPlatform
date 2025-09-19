import { useState, useCallback, useMemo } from 'react';

export interface ValidationRule<T = any> {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: T) => string | null;
    message?: string;
}

export interface FormValidationConfig<T extends Record<string, any>> {
    [K in keyof T]: ValidationRule<T[K]>;
}

export interface FormValidationState<T extends Record<string, any>> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isValid: boolean;
    isSubmitting: boolean;
}

export interface FormValidationActions<T extends Record<string, any>> {
    setValue: <K extends keyof T>(field: K, value: T[K]) => void;
    setError: <K extends keyof T>(field: K, error: string) => void;
    clearError: <K extends keyof T>(field: K) => void;
    setTouched: <K extends keyof T>(field: K, touched: boolean) => void;
    validateField: <K extends keyof T>(field: K) => boolean;
    validateForm: () => boolean;
    reset: () => void;
    setSubmitting: (submitting: boolean) => void;
    handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e?: React.FormEvent) => void;
}

export function useFormValidation<T extends Record<string, any>>(
    initialValues: T,
    validationConfig: FormValidationConfig<T>
): FormValidationState<T> & FormValidationActions<T> {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 개별 필드 검증
    const validateField = useCallback(<K extends keyof T>(field: K): boolean => {
        const value = values[field];
        const rule = validationConfig[field];

        if (!rule) return true;

        // Required 검증
        if (rule.required && (value === undefined || value === null || value === '')) {
            setErrors(prev => ({ ...prev, [field]: rule.message || `${String(field)}는 필수입니다.` }));
            return false;
        }

        // 값이 없으면 다른 검증 스킵
        if (value === undefined || value === null || value === '') {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
            return true;
        }

        // 최소 길이 검증
        if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
            setErrors(prev => ({
                ...prev,
                [field]: rule.message || `${String(field)}는 최소 ${rule.minLength}자 이상이어야 합니다.`
            }));
            return false;
        }

        // 최대 길이 검증
        if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
            setErrors(prev => ({
                ...prev,
                [field]: rule.message || `${String(field)}는 최대 ${rule.maxLength}자까지 입력 가능합니다.`
            }));
            return false;
        }

        // 패턴 검증
        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
            setErrors(prev => ({
                ...prev,
                [field]: rule.message || `${String(field)} 형식이 올바르지 않습니다.`
            }));
            return false;
        }

        // 커스텀 검증
        if (rule.custom) {
            const customError = rule.custom(value);
            if (customError) {
                setErrors(prev => ({ ...prev, [field]: customError }));
                return false;
            }
        }

        // 에러 제거
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });

        return true;
    }, [values, validationConfig]);

    // 전체 폼 검증
    const validateForm = useCallback((): boolean => {
        const fields = Object.keys(validationConfig) as (keyof T)[];
        let isValid = true;

        fields.forEach(field => {
            const fieldValid = validateField(field);
            if (!fieldValid) {
                isValid = false;
            }
        });

        return isValid;
    }, [validateField, validationConfig]);

    // 값 설정
    const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
        setValues(prev => ({ ...prev, [field]: value }));

        // 값이 변경되면 해당 필드 검증
        if (touched[field]) {
            validateField(field);
        }
    }, [touched, validateField]);

    // 에러 설정
    const setError = useCallback(<K extends keyof T>(field: K, error: string) => {
        setErrors(prev => ({ ...prev, [field]: error }));
    }, []);

    // 에러 제거
    const clearError = useCallback(<K extends keyof T>(field: K) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    // 터치 상태 설정
    const setTouched = useCallback(<K extends keyof T>(field: K, touched: boolean) => {
        setTouched(prev => ({ ...prev, [field]: touched }));
    }, []);

    // 제출 상태 설정
    const setSubmitting = useCallback((submitting: boolean) => {
        setIsSubmitting(submitting);
    }, []);

    // 폼 리셋
    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    // 제출 핸들러
    const handleSubmit = useCallback((onSubmit: (values: T) => void | Promise<void>) => {
        return async (e?: React.FormEvent) => {
            e?.preventDefault();

            // 모든 필드를 터치 상태로 설정
            const allFields = Object.keys(validationConfig) as (keyof T)[];
            allFields.forEach(field => {
                setTouched(field, true);
            });

            // 폼 검증
            if (!validateForm()) {
                return;
            }

            setIsSubmitting(true);
            try {
                await onSubmit(values);
            } finally {
                setIsSubmitting(false);
            }
        };
    }, [values, validateForm, validationConfig]);

    // 폼 유효성 상태
    const isValid = useMemo(() => {
        return Object.keys(errors).length === 0 && Object.values(values).every(value =>
            value !== undefined && value !== null && value !== ''
        );
    }, [errors, values]);

    return {
        values,
        errors,
        touched,
        isValid,
        isSubmitting,
        setValue,
        setError,
        clearError,
        setTouched,
        validateField,
        validateForm,
        reset,
        setSubmitting,
        handleSubmit,
    };
}

// 일반적인 검증 규칙들
export const commonValidationRules = {
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: '올바른 이메일 주소를 입력해주세요.'
    },
    password: {
        required: true,
        minLength: 6,
        message: '비밀번호는 최소 6자 이상이어야 합니다.'
    },
    username: {
        required: true,
        minLength: 2,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_]+$/,
        message: '사용자명은 2-20자의 영문, 숫자, 언더스코어만 사용 가능합니다.'
    },
    phone: {
        pattern: /^01[0-9]-\d{3,4}-\d{4}$/,
        message: '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)'
    },
    url: {
        pattern: /^https?:\/\/.+/,
        message: '올바른 URL 형식을 입력해주세요. (http:// 또는 https://로 시작)'
    }
};
