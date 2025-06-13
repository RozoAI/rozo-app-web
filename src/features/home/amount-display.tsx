import { Convert } from 'easy-currencies';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { type CurrencyConfig } from '@/lib/currency-config';

import type { DynamicStyles } from './types';

type AmountDisplayProps = {
  amount: string;
  currencyConfig: CurrencyConfig;
  dynamicStyles: DynamicStyles;
  onExchangeAmount: (amount: string) => void;
};

export function AmountDisplay({ amount, currencyConfig, dynamicStyles, onExchangeAmount }: AmountDisplayProps) {
  // State for USD equivalent amount
  const [usdAmount, setUsdAmount] = useState('0.00');
  const [exchangeLoading, setExchangeLoading] = useState(false);

  // Format amount with appropriate decimal and thousand separators
  const formattedAmount = useMemo(() => {
    if (amount === '0') return '0';
    // Remove leading zeros
    let value = amount.replace(/^0+/, '');
    if (value === '') return '0';
    // Add thousand separators
    const parts = [];
    for (let i = value.length; i > 0; i -= 3) {
      parts.unshift(value.substring(Math.max(0, i - 3), i));
    }
    return parts.join(currencyConfig.thousandSeparator);
  }, [amount, currencyConfig.thousandSeparator]);

  // Debounced currency conversion
  const debouncedConvertCurrency = useCallback(() => {
    // Convert to numeric value based on currency's decimal separator
    let numericAmount: number;
    if (currencyConfig.decimalSeparator === ',') {
      numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    } else {
      numericAmount = parseFloat(amount.replace(/,/g, ''));
    }

    if (isNaN(numericAmount) || numericAmount === 0) {
      setUsdAmount('0.00');
      return;
    }

    // If already in USD, return the same amount
    if (currencyConfig.code === 'USD') {
      setUsdAmount(numericAmount.toFixed(2));
      return;
    }

    // Use a timeout for debouncing
    const timer = setTimeout(async () => {
      try {
        setExchangeLoading(true);
        const converted = await Convert(numericAmount).from(currencyConfig.code).to('USD');
        setUsdAmount(converted.toFixed(2));

        setExchangeLoading(false);
      } catch (error) {
        console.error('Currency conversion error:', error);
        // Fallback calculation if API fails
        setUsdAmount('--');

        setExchangeLoading(false);
      }
    }, 500); // 500ms debounce time

    return () => clearTimeout(timer);
  }, [amount, currencyConfig]);

  useEffect(() => {
    onExchangeAmount(usdAmount);
  }, [usdAmount]);

  // Effect to trigger the debounced conversion
  useEffect(() => {
    const cleanup = debouncedConvertCurrency();
    return cleanup;
  }, [debouncedConvertCurrency]);

  return (
    <View className="items-center px-2">
      <Card className={`w-full rounded-xl shadow-soft-1 ${dynamicStyles.spacing.cardPadding}`}>
        <Text className="text-center text-gray-500 dark:text-gray-200">Amount</Text>
        <Text className={`my-3 text-center font-bold text-gray-800 dark:text-gray-200 ${dynamicStyles.fontSize.amount}`}>
          {`${currencyConfig.symbol} ${formattedAmount}`}
        </Text>
        {/* USD Conversion */}
        {currencyConfig.code !== 'USD' && (
          <View className="mt-1 rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
            <Text className={`text-center text-gray-600 dark:text-gray-200 ${dynamicStyles.fontSize.label}`}>
              {exchangeLoading ? <Spinner size="small" /> : `≈ ${usdAmount} USD`}
            </Text>
          </View>
        )}
        <Text className={`mt-2 text-center text-gray-500 ${dynamicStyles.fontSize.label}`}>Enter Payment Amount</Text>
      </Card>
    </View>
  );
}
