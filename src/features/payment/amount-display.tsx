import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { CurrencyConverter } from '@/components/ui/currency-converter';
import { Text } from '@/components/ui/text';
import { useApp } from '@/providers/app.provider';

import type { DynamicStyles } from './types';

type AmountDisplayProps = {
  amount: string;
  dynamicStyles: DynamicStyles;
};

export function AmountDisplay({ amount, dynamicStyles }: AmountDisplayProps) {
  const { defaultCurrency } = useApp();
  const { t } = useTranslation();

  // Format amount with appropriate decimal and thousand separators
  const formattedAmount = useMemo(() => {
    if (!amount || amount === '0') return '0';

    // Handle decimal separator
    const decimalSeparator = defaultCurrency?.decimalSeparator || '.';
    const parts = amount.split(decimalSeparator);
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? parts[1] : '';

    // Format integer part with thousand separators
    const thousandSeparator = defaultCurrency?.thousandSeparator || ',';
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

    // Return formatted amount with decimal part if exists
    return decimalPart ? `${formattedInteger}${decimalSeparator}${decimalPart}` : formattedInteger;
  }, [amount, defaultCurrency]);

  return (
    <View className="items-center px-2">
      <Card className={`w-full rounded-xl shadow-soft-1 ${dynamicStyles.spacing.cardPadding}`}>
        <Text className="text-center text-gray-500 dark:text-gray-200">{t('general.amount')}</Text>
        <Text className={`my-3 text-center font-bold text-gray-800 dark:text-gray-200 ${dynamicStyles.fontSize.amount}`}>
          {`${formattedAmount} ${defaultCurrency?.code}`}
        </Text>
        {/* USD Conversion */}
        {defaultCurrency?.code !== 'USD' && (
          <Box className="mt-1 rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
            <CurrencyConverter
              amount={Number(amount)}
              className={`text-center text-gray-600 dark:text-gray-200 ${dynamicStyles.fontSize.label}`}
            />
          </Box>
        )}
        <Text className={`mt-2 text-center text-gray-500 ${dynamicStyles.fontSize.label}`}>
          {t('payment.enterPaymentAmount')}
        </Text>
      </Card>
    </View>
  );
}
// End of Selection
