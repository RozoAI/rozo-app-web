import { format } from 'date-fns';
import { ClockIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';

import { Badge, BadgeText } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { getShortId, getStatusActionType } from '@/lib';
import { type MerchantOrder } from '@/resources/schema/order';

interface OrderCardProps {
  order: MerchantOrder;
  onPress?: (order: MerchantOrder) => void;
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => onPress?.(order)}>
      <View className="items-start justify-between rounded-xl border border-background-300 bg-background-0 px-4 py-2">
        {/* Main Order Info */}
        <View className="w-full flex-row items-start justify-between">
          <View className="flex flex-1 flex-col gap-1.5">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">
                #{order.number ?? getShortId(order.order_id, 6)}
              </Text>

              <Badge size="md" variant="solid" action={getStatusActionType(order.status)}>
                <BadgeText>{t(`order.status.${order.status.toLowerCase()}`)}</BadgeText>
              </Badge>
            </View>
            <Text className="text-2xl font-bold text-black dark:text-white">
              {order.display_amount} {order.display_currency}
            </Text>
            {order.created_at && (
              <View className="flex-row items-center gap-1">
                <Icon as={ClockIcon} className="text-gray-500 dark:text-gray-400" size="xs" />
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(order.created_at), 'MMM dd yyyy, HH:mm')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
