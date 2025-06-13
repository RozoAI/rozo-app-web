import { useEffect, useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';

import { Box } from '@/components/ui/box';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { useOrdersQuery } from '@/resources/api/merchant/orders';
import { type MerchantOrder, type MerchantOrderResponse } from '@/resources/schema/order';

import EmptyOrdersState from './empty-orders';
import { OrderCard } from './order-card';

export function RecentOrdersScreen() {
  const limit = 20;
  const [offset, setOffset] = useState(0);
  const [orders, setOrders] = useState<MerchantOrder[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, isFetching } = useOrdersQuery(offset, limit)();

  useEffect(() => {
    const res = (data || []) as unknown as MerchantOrderResponse;

    if (res && res.orders && res.orders.length > 0) {
      setOrders((prev) => {
        const existingIds = new Set(prev.map((o) => o.order_id));
        const newUnique = res.orders.filter((o) => !existingIds.has(o.order_id));
        return [...prev, ...newUnique];
      });

      if (res.orders.length < limit) setHasMore(false);
    } else {
      setHasMore(false);
    }
  }, [data]);

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setOffset((prev) => prev + limit);
    }
  };

  const renderFooter = () =>
    isFetching ? (
      <Box className="py-4">
        <Spinner size="small" />
      </Box>
    ) : null;

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 py-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="mb-1 text-2xl font-bold">Recent Orders</Text>
          <Text className="text-sm text-gray-400">Below are your most recent orders</Text>
        </View>

        {isLoading && <Spinner size="small" />}

        {!isLoading && (
          <>
            {/* Orders List */}
            <View className="space-y-4">
              {orders.length === 0 ? (
                <EmptyOrdersState />
              ) : (
                <View className="space-y-4">
                  <FlatList
                    data={orders}
                    keyExtractor={(item) => item.order_id}
                    renderItem={(order) => <OrderCard key={order.item.order_id} order={order.item} />}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={renderFooter}
                    contentContainerClassName="gap-4"
                  />
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
