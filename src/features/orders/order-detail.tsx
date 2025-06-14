import { format } from 'date-fns';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';

import CheckSvg from '@/components/svg/check';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { VStack } from '@/components/ui/vstack';
import { usePaymentStatus } from '@/hooks/use-payment-status';
import { getStatusActionType } from '@/lib/utils';
import { useApp } from '@/providers/app.provider';
import { useGetOrder } from '@/resources/api/merchant/orders';

export type OrderDetailActionSheetRef = {
  openOrder: (orderId: string) => void;
};

type OrderDetailActionSheetProps = {
  onClose?: () => void;
};

export const OrderDetailActionSheet = forwardRef<OrderDetailActionSheetRef, OrderDetailActionSheetProps>(
  ({ onClose }, ref) => {
    const { t } = useTranslation();
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const { merchant } = useApp();

    const {
      data: order,
      isLoading,
      refetch,
    } = useGetOrder({
      variables: { id: orderId ?? '' },
      enabled: !!orderId,
    });

    const { isCompleted } = usePaymentStatus(merchant?.merchant_id, orderId ?? undefined);

    // Generate QR code when actionsheet opens and order is pending
    useEffect(() => {
      if (isOpen && order && order.status === 'PENDING') {
        // End of Selection
        setQrCodeUrl(`https://pay.daimo.com/checkout?id=${order.payment_id}`);
      } else {
        setQrCodeUrl(null);
      }
    }, [isOpen, order]);

    useImperativeHandle(ref, () => ({
      openOrder: (id: string) => {
        setOrderId(id);
        setIsOpen(true);
      },
    }));

    useEffect(() => {
      if (isCompleted) {
        // Show success view after a brief delay
        setTimeout(() => {
          refetch();
        }, 500);
      }
    }, [isCompleted]);

    const handleClose = useCallback(() => {
      setIsOpen(false);
      setOrderId(null);
      onClose?.();
    }, [onClose]);

    if (!orderId) return null;

    return (
      <Actionsheet isOpen={isOpen} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="max-h-[80%]">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <VStack className="w-full p-4" space="md">
            {isLoading ? (
              <View className="items-center justify-center py-8">
                <Spinner size="large" />
                <Text className="mt-2 text-gray-600">{t('general.loading')}</Text>
              </View>
            ) : order ? (
              <>
                {/* Header */}
                <View className="items-center">
                  <Heading size="lg" className="text-typography-950">
                    {t('order.orderDetails')}
                  </Heading>
                  <Text className="text-sm text-gray-500">#{order.order_id}</Text>
                </View>

                {/* Order Status */}
                <View className="items-center">
                  <Badge size="md" variant="solid" action={getStatusActionType(order.status)}>
                    <BadgeText>{t(`order.status.${order.status.toLowerCase()}`)}</BadgeText>
                  </Badge>
                </View>

                {order.status === 'COMPLETED' && (
                  <View className="flex w-full flex-col items-center justify-center">
                    <CheckSvg width={200} height={150} />
                  </View>
                )}

                {/* QR Code for Pending Orders */}
                {order.status === 'PENDING' && (
                  <View className="items-center">
                    <Text className="mb-4 text-sm text-gray-600">{t('payment.scanToPay')}</Text>
                    <View className="mb-4 size-48 items-center justify-center rounded-xl border bg-white p-3">
                      {qrCodeUrl ? (
                        <QRCode value={qrCodeUrl} size={180} />
                      ) : (
                        <View className="items-center justify-center">
                          <Spinner />
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Order Details */}
                <VStack space="sm">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">{t('general.amount')}</Text>
                    <Text className="font-semibold">
                      {order.display_amount} {order.display_currency}
                    </Text>
                  </View>

                  {order.description && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600">{t('general.description')}</Text>
                      <Text className="font-medium">{order.description}</Text>
                    </View>
                  )}

                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">{t('general.createdAt')}</Text>
                    <Text className="font-medium">{format(new Date(order.created_at), 'MMM dd yyyy, HH:mm')}</Text>
                  </View>
                </VStack>
              </>
            ) : (
              <View className="items-center justify-center py-8">
                <Text className="text-gray-600">{t('general.notFound')}</Text>
              </View>
            )}

            {/* Actions */}
            <View className="mt-4">
              <Button variant="outline" onPress={handleClose} className="w-full">
                <ButtonText>{t('general.close')}</ButtonText>
              </Button>
            </View>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    );
  }
);
// End of Selection
