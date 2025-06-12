import type { CurrencyConfig } from './types';

// Currency configuration by currency code
export const currencyConfigs: Record<string, CurrencyConfig> = {
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    decimalSeparator: ',',
    thousandSeparator: '.',
    quickAmounts: [
      { value: '10000', label: '10K' },
      { value: '20000', label: '20K' },
      { value: '50000', label: '50K' },
      { value: '100000', label: '100K' },
    ],
  },
  MYR: {
    code: 'MYR',
    symbol: 'RM',
    decimalSeparator: '.',
    thousandSeparator: ',',
    quickAmounts: [
      { value: '5', label: 'RM5' },
      { value: '10', label: 'RM10' },
      { value: '20', label: 'RM20' },
      { value: '50', label: 'RM50' },
    ],
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    decimalSeparator: '.',
    thousandSeparator: ',',
    quickAmounts: [
      { value: '5', label: 'S$5' },
      { value: '10', label: 'S$10' },
      { value: '20', label: 'S$20' },
      { value: '50', label: 'S$50' },
    ],
  },
  USD: {
    code: 'USD',
    symbol: '$',
    decimalSeparator: '.',
    thousandSeparator: ',',
    quickAmounts: [
      { value: '1', label: '$1' },
      { value: '5', label: '$5' },
      { value: '10', label: '$10' },
      { value: '20', label: '$20' },
    ],
  },
};
