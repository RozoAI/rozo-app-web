import { BarChart3 } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { type DateRange } from '@/features/reports/types';

type EmptyReportsStateProps = {
  dateRange: DateRange;
};

export function EmptyReportsState({ dateRange }: EmptyReportsStateProps) {
  const { t } = useTranslation();

  return (
    <Box className="items-center justify-center py-20">
      <VStack space="lg" className="items-center">
        <Box className="size-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <Icon as={BarChart3} size="xl" className="text-gray-400" />
        </Box>
        <VStack space="sm" className="items-center">
          <Text className="text-xl font-semibold">{t('reports.noDataTitle')}</Text>
          <Text className="text-center text-sm text-gray-500 dark:text-gray-400">{t('reports.noDataDescription')}</Text>
          <Text className="mt-2 text-xs text-gray-400">
            {dateRange.from} - {dateRange.to}
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
}
