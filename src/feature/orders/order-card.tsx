import { format } from 'date-fns';
import { ClockIcon } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';

import { Badge, BadgeText } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { type MerchantOrder } from '@/resources/schema/order';

interface OrderCardProps {
  order: MerchantOrder;
}

export function OrderCard({ order }: OrderCardProps) {
  const displayAmount = order.display_amount;
  const displayCurrency = order.display_currency;

  // Format display amount with currency
  const formatDisplayAmount = () => {
    if (displayCurrency) {
      const currencySymbol = getCurrencySymbol(displayCurrency);
      return `${currencySymbol}${displayAmount.toFixed(2)}`;
    }
    return `$${displayAmount.toFixed(2)}`; // Fallback to USD
  };

  return (
    <TouchableOpacity activeOpacity={0.7}>
      <View className="items-start justify-between rounded-xl border border-background-300 bg-background-0 px-4 py-2">
        {/* Main Order Info */}
        <View className="mb-3 w-full flex-row items-start justify-between">
          <View className="flex flex-1 flex-col gap-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">#{order.order_id.slice(0, 8)}...</Text>

              <Badge size="md" variant="solid" action={getStatusActionType(order.status)}>
                <BadgeText>{order.status}</BadgeText>
              </Badge>
            </View>
            <Text className="text-2xl font-bold text-black dark:text-white">{formatDisplayAmount()}</Text>
            {order.created_at && (
              <View className="flex-row items-center gap-1">
                <Icon as={ClockIcon} className="text-gray-500 dark:text-gray-400" size="sm" />
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {format(order.created_at, 'MMM dd yyyy, HH:mm')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const getStatusActionType = (status: MerchantOrder['status']): 'success' | 'error' | 'warning' | 'info' | 'muted' => {
  const statusMap: Record<MerchantOrder['status'], 'success' | 'error' | 'warning' | 'info' | 'muted'> = {
    COMPLETED: 'success',
    PROCESSING: 'info',
    PENDING: 'warning',
    FAILED: 'error',
    DISCREPANCY: 'warning',
  };

  return statusMap[status] || 'muted';
};

// Helper function to get currency symbols
function getCurrencySymbol(currencyId: string): string {
  switch (currencyId) {
    case 'USD':
      return '$';
    case 'MYR':
      return 'RM';
    case 'SGP':
      return 'S$';
    case 'IDR':
      return 'Rp';
    default:
      return '';
  }
}
