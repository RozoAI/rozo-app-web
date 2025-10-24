import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { type CurrencyBreakdownType } from '@/features/reports/types';
import { formatCurrency } from '@/lib/utils';

type CurrencyBreakdownProps = {
  data: CurrencyBreakdownType[];
};

const COLORS = ['#0369A1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function CurrencyBreakdown({ data }: CurrencyBreakdownProps) {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Card className="border border-background-300 bg-background-0 p-4">
      <VStack space="md">
        <Box>
          <Text className="text-lg font-semibold">{t('reports.currencyBreakdown')}</Text>
          <Text className="text-xs text-gray-400">{t('reports.revenueByDisplayCurrency')}</Text>
        </Box>

        <VStack space="sm">
          {data.map((item, index) => {
            const color = COLORS[index % COLORS.length];
            return (
              <Box key={item.currency}>
                <HStack className="items-center justify-between">
                  <HStack space="sm" className="flex-1 items-center">
                    <Box className="size-3 rounded-full" style={{ backgroundColor: color }} />
                    <Text className="font-medium">{item.currency}</Text>
                  </HStack>
                  <HStack space="md" className="items-center">
                    <Text className="text-sm text-gray-500">{item.percentage.toFixed(1)}%</Text>
                    <Text className="min-w-[100px] text-right font-semibold">
                      {formatCurrency(item.amount, item.currency)}
                    </Text>
                  </HStack>
                </HStack>

                {/* Progress bar */}
                <Box className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <Box
                    className="h-full rounded-full"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: color,
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </VStack>
      </VStack>
    </Card>
  );
}
