import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Linking, RefreshControl, Text, View } from 'react-native';

import EmptyState from '@/components/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { useApp } from '@/providers/app.provider';
import { useBaseUSDCTransactions } from '@/resources/api/transactions';

import { TransactionCard } from './transaction-card';

export function TransactionList() {
  const { t } = useTranslation();
  const { primaryWallet } = useApp();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useBaseUSDCTransactions({
    variables: { address: primaryWallet?.address || '' },
  });

  const [refreshing, setRefreshing] = useState(false);

  const txs = data?.pages.flat() ?? [];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();
  }, [refetch]);

  if (isLoading) return <Spinner size="small" />;

  if (!isLoading && txs.length === 0) return <EmptyState title={t('transaction.noTransactionsFound')} />;

  return (
    <View className="space-y-4">
      <FlatList
        data={txs}
        keyExtractor={(item) => item.hash}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => <TransactionCard transaction={item} onPress={() => Linking.openURL(item.url)} />}
        ListFooterComponent={isFetchingNextPage ? <Text style={{ padding: 10 }}>Loading more…</Text> : null}
        contentContainerClassName="gap-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}
