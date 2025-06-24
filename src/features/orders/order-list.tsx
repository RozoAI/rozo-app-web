import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, View } from 'react-native';

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

  const [orders, setOrders] = useState<MerchantOrder[]>([]);
  const [status, setStatus] = useState<MerchantOrderStatus>('COMPLETED');

  const { data, isFetching } = useGetOrders({ variables: { status } });

  useEffect(() => {
    setOrders(data ?? []);
  }, [data]);

  const handleStatusChange = (status: MerchantOrderStatus) => {
    setStatus(status);
  };

  const orderDetailRef = useRef<OrderDetailActionSheetRef>(null);

  const handleOrderPress = (orderId: string) => {
    orderDetailRef.current?.openOrder(orderId);
  };

  return (
    <ScrollView className="my-6 flex-1">
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
                  scrollEnabled={false}
                  contentContainerClassName="gap-4"
                />
              </View>
            )}
          </View>
        </>
      )}
      <OrderDetailActionSheet ref={orderDetailRef} />
    </ScrollView>
  );
}
