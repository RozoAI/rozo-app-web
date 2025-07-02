import { t } from 'i18next';
import { ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { TransactionList } from './transaction-list';

export function TransactionScreen() {
  return (
    <ScrollView className="my-6 flex-1">
      {/* Header */}
      <VStack className="flex flex-row items-start justify-between">
        <View className="mb-6">
          <Text className="mb-1 text-2xl font-bold">{t('transaction.recentTransactions')}</Text>
          <Text className="text-sm text-gray-400">{t('transaction.recentTransactionsDesc')}</Text>
        </View>
      </VStack>

      <View className="space-y-4">
        <TransactionList />
      </View>
    </ScrollView>
  );
}
