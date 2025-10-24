import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView } from 'react-native';

import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useDateRange } from '@/hooks/use-date-range';
import { useGetReportsSummary } from '@/resources/api/merchant/reports';

import { CurrencyBreakdown } from './currency-breakdown';
import { DateRangeSelector } from './date-range-selector';
import { EmptyReportsState } from './empty-reports-state';
import { OrderVolumeChart } from './order-volume-chart';
import { RevenueTrendChart } from './revenue-trend-chart';
import { SummaryCards } from './summary-cards';

export function ReportsScreen() {
  const { t } = useTranslation();
  const { preset, setPreset, dateRange } = useDateRange();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isFetching, refetch, error } = useGetReportsSummary({
    variables: {
      from: dateRange.from,
      to: dateRange.to,
      group_by: 'day',
    },
  });

  const hasData = data && data.summary.total_completed_orders > 0;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-4"
      refreshControl={<RefreshControl refreshing={refreshing || isFetching} onRefresh={onRefresh} />}
    >
      <VStack space="lg" className="py-6">
        {/* Header */}
        <Box className="mb-2">
          <Text className="text-2xl font-bold">{t('reports.title')}</Text>
          <Text className="text-sm text-gray-400">{t('reports.description')}</Text>
        </Box>

        {/* Date Range Selector */}
        <DateRangeSelector preset={preset} onPresetChange={setPreset} />

        {/* Loading State */}
        {isLoading && (
          <Box className="items-center justify-center py-20">
            <Spinner size="large" />
          </Box>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Box className="items-center justify-center py-20">
            <VStack space="md" className="items-center px-6">
              <Text className="text-center text-lg font-semibold text-error-500">{t('reports.errorLoading')}</Text>
              <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
                {error.message || 'Unable to load reports data'}
              </Text>
            </VStack>
          </Box>
        )}

        {/* Empty State */}
        {!isLoading && !error && !hasData && <EmptyReportsState dateRange={dateRange} />}

        {/* Data Display */}
        {!isLoading && !error && hasData && (
          <VStack space="lg">
            {/* Summary Cards */}
            <SummaryCards summary={data.summary} />

            {/* Revenue Trend Chart */}
            {data.charts.daily_trends && data.charts.daily_trends.length > 0 && (
              <RevenueTrendChart data={data.charts.daily_trends} />
            )}

            {/* Order Volume Chart */}
            {data.charts.order_volume && data.charts.order_volume.length > 0 && (
              <OrderVolumeChart data={data.charts.order_volume} />
            )}

            {/* Currency Breakdown */}
            {data.charts.currency_breakdown && data.charts.currency_breakdown.length > 0 && (
              <CurrencyBreakdown data={data.charts.currency_breakdown} />
            )}
          </VStack>
        )}
      </VStack>
    </ScrollView>
  );
}
