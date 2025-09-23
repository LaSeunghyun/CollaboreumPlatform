export const formatCurrencyToMillions = (amount?: number | null) => {
  if (!amount) {
    return '₩0.0M';
  }

  const millionValue = amount / 1_000_000;
  return `₩${millionValue.toFixed(1)}M`;
};

export const formatInteger = (value?: number | null) => {
  if (!value) {
    return '0';
  }

  return value.toLocaleString();
};

export const formatPercentage = (
  value?: number | null,
  options?: { includeSign?: boolean },
) => {
  const percentage = value ?? 0;
  const prefix = options?.includeSign && percentage > 0 ? '+' : '';

  return `${prefix}${percentage}%`;
};

export const calculateProgress = (
  raised?: number | null,
  goal?: number | null,
) => {
  if (!goal || goal <= 0 || !raised) {
    return 0;
  }

  const percentage = (raised / goal) * 100;

  return Number.isFinite(percentage)
    ? Math.min(Math.max(percentage, 0), 100)
    : 0;
};

export const formatCountWithUnit = (value: number, unit: string) => {
  return `${formatInteger(value)}${unit}`;
};
