import { DollarSign, ShoppingBag, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatCurrency } from '@/lib/utils';

type SummaryCardsProps = {
  summary: {
    total_completed_orders: number;
    total_required_amount_usd: number;
    total_display_amounts: Record<string, number>;
  };
};

export function SummaryCards({ summary }: SummaryCardsProps) {
  const { t } = useTranslation();

  const avgOrderValue =
    summary.total_completed_orders > 0 ? summary.total_required_amount_usd / summary.total_completed_orders : 0;

  const cards = [
    {
      icon: ShoppingBag,
      label: t('reports.totalOrders'),
      value: summary.total_completed_orders.toString(),
      color: 'text-primary-500',
      bgColor: 'bg-primary-50 dark:bg-primary-900/20',
    },
    {
      icon: DollarSign,
      label: t('reports.totalRevenue'),
      value: formatCurrency(summary.total_required_amount_usd, 'USD'),
      color: 'text-success-500',
      bgColor: 'bg-success-50 dark:bg-success-900/20',
    },
    {
      icon: TrendingUp,
      label: t('reports.avgOrder'),
      value: formatCurrency(avgOrderValue, 'USD'),
      color: 'text-info-500',
      bgColor: 'bg-info-50 dark:bg-info-900/20',
    },
  ];

  return (
    <VStack space="md">
      {cards.map((card, index) => (
        <Card key={index} className="border border-background-300 bg-background-0 p-4">
          <HStack space="md" className="items-center">
            <Box className={`size-12 items-center justify-center rounded-full ${card.bgColor}`}>
              <Icon as={card.icon} className={card.color} size="lg" />
            </Box>
            <VStack space="xs" className="flex-1">
              <Text className="text-sm text-gray-500 dark:text-gray-400">{card.label}</Text>
              <Text className="text-2xl font-bold">{card.value}</Text>
            </VStack>
          </HStack>
        </Card>
      ))}
    </VStack>
  );
}
