import { format } from 'date-fns';
import { ClockIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';

import { Badge, BadgeText } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { getShortId } from '@/lib';
import { type Transaction } from '@/resources/schema/transaction';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
}

const getStatusActionType = (isInFlow: Transaction['direction']): 'success' | 'error' | 'warning' | 'info' | 'muted' => {
  const statusMap: Record<Transaction['direction'], 'success' | 'error' | 'warning' | 'info' | 'muted'> = {
    IN: 'success',
    OUT: 'error',
  };

  return statusMap[isInFlow] || 'muted';
};

export function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => onPress?.(transaction)}>
      <View className="items-start justify-between rounded-xl border border-background-300 bg-background-0 px-4 py-2">
        {/* Main Transaction Info */}
        <View className="w-full flex-row items-start justify-between">
          <View className="flex flex-1 flex-col gap-1.5">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {transaction.hash ? `#${getShortId(transaction.hash, 6)}` : t('general.unknown')} {transaction.direction}
              </Text>

              <Badge size="md" variant="solid" action={getStatusActionType(transaction.direction)}>
                <BadgeText>{t(`transaction.direction.${transaction.direction}`)}</BadgeText>
              </Badge>
            </View>
            <Text className="text-2xl font-bold text-black dark:text-white">
              {transaction.value} {transaction.tokenSymbol}
            </Text>
            {transaction.timestamp && (
              <View className="flex-row items-center gap-1">
                <Icon as={ClockIcon} className="text-gray-500 dark:text-gray-400" size="xs" />
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(transaction.timestamp), 'MMM dd yyyy, HH:mm')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
