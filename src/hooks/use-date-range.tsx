import { useMemo, useState } from 'react';

import { type DateRangePreset } from '@/features/reports/types';

export function useDateRange() {
  const [preset, setPreset] = useState<DateRangePreset>('last7days');
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo, setCustomTo] = useState<Date | null>(null);

  const dateRange = useMemo(() => {
    const today = new Date();
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const subDays = (date: Date, days: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() - days);
      return result;
    };

    const startOfMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    const endOfMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    };

    switch (preset) {
      case 'today':
        return {
          from: formatDate(today),
          to: formatDate(today),
        };
      case 'last7days':
        return {
          from: formatDate(subDays(today, 6)),
          to: formatDate(today),
        };
      case 'last30days':
        return {
          from: formatDate(subDays(today, 29)),
          to: formatDate(today),
        };
      case 'thisMonth':
        return {
          from: formatDate(startOfMonth(today)),
          to: formatDate(today),
        };
      case 'lastMonth': {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        return {
          from: formatDate(startOfMonth(lastMonth)),
          to: formatDate(endOfMonth(lastMonth)),
        };
      }
      case 'custom':
        return {
          from: customFrom ? formatDate(customFrom) : formatDate(subDays(today, 6)),
          to: customTo ? formatDate(customTo) : formatDate(today),
        };
      default:
        return {
          from: formatDate(subDays(today, 6)),
          to: formatDate(today),
        };
    }
  }, [preset, customFrom, customTo]);

  return {
    preset,
    setPreset,
    dateRange,
    setCustomFrom,
    setCustomTo,
  };
}
