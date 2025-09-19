import { useCallback, useMemo, useState } from 'react';

export type ValidationRule<T> = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
  message?: string;
};

export type FormValidationConfig<T extends Record<string, unknown>> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export interface FormValidationState<T extends Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
}

export interface FormValidationActions<T extends Record<string, unknown>> {
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setError: <K extends keyof T>(field: K, error: string) => void;
  clearError: <K extends keyof T>(field: K) => void;
  setTouched: <K extends keyof T>(field: K, touched: boolean) => void;
  validateField: <K extends keyof T>(field: K) => boolean;
  validateForm: () => boolean;
  reset: () => void;
  setSubmitting: (value: boolean) => void;
  handleSubmit: (
    onSubmit: (values: T) => void | Promise<void>,
  ) => (event?: React.FormEvent) => Promise<void>;
}

const isEmpty = (value: unknown) =>
  value === undefined || value === null || value === '';

export function useFormValidation<T extends Record<string, unknown>>(
  initialValues: T,
  validationConfig: FormValidationConfig<T>,
): FormValidationState<T> & FormValidationActions<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyRule = useCallback(
    <K extends keyof T>(field: K, rule: ValidationRule<T[K]> | undefined): string | null => {
      if (!rule) {
        return null;
      }

      const value = values[field];

      if (rule.required && isEmpty(value)) {
        return rule.message ?? `${String(field)} 필드는 필수입니다.`;
      }

      if (isEmpty(value)) {
        return null;
      }

      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        return rule.message ?? `${String(field)}은(는) 최소 ${rule.minLength}자 이상이어야 합니다.`;
      }

      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        return rule.message ?? `${String(field)}은(는) 최대 ${rule.maxLength}자까지 허용됩니다.`;
      }

      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        return rule.message ?? `${String(field)} 형식이 올바르지 않습니다.`;
      }

      if (rule.custom) {
        return rule.custom(value);
      }

      return null;
    },
    [values],
  );

  const validateField = useCallback(
    <K extends keyof T>(field: K): boolean => {
      const message = applyRule(field, validationConfig[field]);

      setErrors(prev => {
        if (!message) {
          if (!(field in prev)) {
            return prev;
          }
          const { [field]: _omitted, ...rest } = prev as Partial<Record<keyof T, string>>;
          return rest as Partial<Record<keyof T, string>>;
        }

        return { ...prev, [field]: message };
      });

      return !message;
    },
    [applyRule, validationConfig],
  );

  const validateForm = useCallback(() => {
    const fields = Object.keys(validationConfig) as (keyof T)[];
    return fields.every(field => validateField(field));
  }, [validateField, validationConfig]);

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues(prev => ({ ...prev, [field]: value }));

      if (touched[field]) {
        validateField(field);
      }
    },
    [touched, validateField],
  );

  const setError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearError = useCallback(<K extends keyof T>(field: K) => {
    setErrors(prev => {
      if (!(field in prev)) {
        return prev;
      }
      const { [field]: _omitted, ...rest } = prev as Partial<Record<keyof T, string>>;
      return rest as Partial<Record<keyof T, string>>;
    });
  }, []);

  const setTouched = useCallback(<K extends keyof T>(field: K, next: boolean) => {
    setTouchedState(prev => ({ ...prev, [field]: next }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouchedState({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback(
    (onSubmit: (formValues: T) => void | Promise<void>) => {
      return async (event?: React.FormEvent) => {
        event?.preventDefault();

        const fields = Object.keys(validationConfig) as (keyof T)[];
        fields.forEach(field => setTouched(field, true));

        const valid = validateForm();
        if (!valid) {
          return;
        }

        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      };
    },
    [setTouched, validateForm, validationConfig, values],
  );

  const isValid = useMemo(() => {
    const noErrors = Object.keys(errors).length === 0;
    const allFilled = Object.keys(validationConfig).every(fieldKey => {
      const key = fieldKey as keyof T;
      if (!validationConfig[key]?.required) {
        return true;
      }
      return !isEmpty(values[key]);
    });

    return noErrors && allFilled;
  }, [errors, validationConfig, values]);

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
    setSubmitting: setIsSubmitting,
    handleSubmit,
  };
}

export const commonValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '올바른 이메일 주소를 입력해주세요.',
  },
  password: {
    required: true,
    minLength: 6,
    message: '비밀번호는 최소 6자 이상이어야 합니다.',
  },
  username: {
    required: true,
    minLength: 2,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: '사용자명은 2~20자의 영문, 숫자, 밑줄만 허용됩니다.',
  },
  phone: {
    pattern: /^01[0-9]-\d{3,4}-\d{4}$/,
    message: '전화번호 형식을 확인해주세요. (예: 010-1234-5678)',
  },
  url: {
    pattern: /^https?:\/\/.+/,
    message: 'URL 형식을 확인해주세요. (http:// 또는 https://)',
  },
};
