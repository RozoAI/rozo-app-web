import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, View } from 'react-native';

import { Box } from '@/components/ui/box';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useGetOrders } from '@/resources/api/merchant/orders';
import { type MerchantOrder, type MerchantOrderStatus } from '@/resources/schema/order';

import EmptyOrdersState from './empty-orders';
import { FilterOrderActionSheet } from './filter-order';
import { OrderCard } from './order-card';
import { OrderDetailActionSheet, type OrderDetailActionSheetRef } from './order-detail';

export function RecentOrdersScreen() {
  const { t } = useTranslation();

  const limit = 20;
  const [offset, setOffset] = useState(0);
  const [orders, setOrders] = useState<MerchantOrder[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState<MerchantOrderStatus>('COMPLETED');
  const [prevStatus, setPrevStatus] = useState<MerchantOrderStatus>('COMPLETED');

  const { data, isFetching, refetch } = useGetOrders({ offset, limit, status })();

  // Reset offset and clear orders when status changes
  useEffect(() => {
    if (status !== prevStatus) {
      setOffset(0);
      setOrders([]);
      setHasMore(true);
      setPrevStatus(status);
    }
  }, [status, prevStatus]);

  useEffect(() => {
    if (data && data.orders.length > 0) {
      setOrders((prev) => {
        // If offset is 0, we're starting fresh (either initial load or status change)
        if (offset === 0) {
          return data.orders;
        }

        // Otherwise, append new unique orders for pagination
        const existingIds = new Set(prev.map((o) => o.order_id));
        const newUnique = data.orders.filter((o) => !existingIds.has(o.order_id));
        return [...prev, ...newUnique];
      });

      setHasMore(data.orders.length === limit);
    } else if (data && data.orders.length === 0) {
      // Handle empty response
      if (offset === 0) {
        setOrders([]);
      }
      setHasMore(false);
    }
  }, [data, offset, limit]);

  useEffect(() => {
    refetch();
  }, [status]);

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setOffset((prev) => prev + limit);
    }
  };

  const handleStatusChange = (status: MerchantOrderStatus) => {
    setStatus(status);
  };

  const orderDetailRef = useRef<OrderDetailActionSheetRef>(null);

  const handleOrderPress = (orderId: string) => {
    orderDetailRef.current?.openOrder(orderId);
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
        <VStack className="flex flex-row items-start justify-between">
          <View className="mb-6">
            <Text className="mb-1 text-2xl font-bold">{t('order.recentOrders')}</Text>
            <Text className="text-sm text-gray-400">{t('order.recentOrdersDesc')}</Text>
          </View>

          <FilterOrderActionSheet onStatusChange={handleStatusChange} />
        </VStack>

        {isFetching && <Spinner size="small" />}

        {!isFetching && (
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
                    renderItem={(order) => (
                      <OrderCard
                        key={order.item.order_id}
                        order={order.item}
                        onPress={(order) => handleOrderPress(order.order_id)}
                      />
                    )}
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

      <OrderDetailActionSheet ref={orderDetailRef} />
    </SafeAreaView>
  );
}
