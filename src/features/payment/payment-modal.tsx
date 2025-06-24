import { XIcon } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';

import { Button, ButtonText } from '@/components/ui/button';
import { CurrencyConverter } from '@/components/ui/currency-converter';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { usePaymentStatus } from '@/hooks/use-payment-status';
import { useSelectedLanguage } from '@/hooks/use-selected-language';
import { useApp } from '@/providers/app.provider';
import { useGetOrder } from '@/resources/api';
import { type OrderResponse } from '@/resources/schema/order';

import { PaymentSuccess } from './payment-success';
import { type DynamicStyles } from './types';

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  dynamicStyles: DynamicStyles;
  order?: OrderResponse;
};

export function PaymentModal({ isOpen, onClose, amount, dynamicStyles, order }: PaymentModalProps): React.ReactElement {
  const { t } = useTranslation();
  const { defaultCurrency, merchant } = useApp();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isSuccessPayment, setIsSuccessPayment] = useState(false);
  const { language } = useSelectedLanguage();

  const { data: fetchData, refetch } = useGetOrder({
    variables: { id: order?.order_id ?? '' },
    enabled: !!order?.order_id,
  });

  // Use our custom hook to handle payment status updates
  const { status, speakPaymentStatus } = usePaymentStatus(merchant?.merchant_id, order?.order_id);
  // Generate QR code when modal opens
  useEffect(() => {
    if (isOpen && order?.qrcode) {
      setQrCodeUrl(order.qrcode);
    } else {
      setQrCodeUrl(null);
    }

    // Reset states when modal opens
    if (isOpen) {
      setIsSuccessPayment(false);
    }
  }, [isOpen, order]);

  // Watch for payment status changes
  useEffect(() => {
    console.log(status);
    if (status === 'completed') {
      // Show success view after a brief delay
      refetch();
    }
  }, [status]);

  // Handle back to home
  const handleBackToHome = useCallback(() => {
    // Reset states
    setIsSuccessPayment(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (fetchData?.status === 'COMPLETED') {
      setIsSuccessPayment(true);

      // Speak the amount
      speakPaymentStatus({
        amount: Number(amount),
        currency: defaultCurrency?.code ?? 'USD',
        language,
      });
    }
  }, [fetchData]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent>
        {!isSuccessPayment && (
          <ModalHeader className="mb-2">
            <Heading size="md" className="text-typography-950">
              {t('payment.scanToPay')}
            </Heading>
            <ModalCloseButton>
              <Icon
                as={XIcon}
                size="md"
                className="stroke-background-400 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900 group-[:hover]/modal-close-button:stroke-background-700"
              />
            </ModalCloseButton>
          </ModalHeader>
        )}
        <ModalBody className={isSuccessPayment ? '!m-0' : ''}>
          {isSuccessPayment ? (
            <PaymentSuccess
              defaultCurrency={defaultCurrency}
              amount={amount}
              dynamicStyles={dynamicStyles}
              onPrintReceipt={() => {}}
              onBackToHome={handleBackToHome}
              order={order}
            />
          ) : (
            <View className="items-center justify-center">
              {/* QR Code */}
              <View className="mb-4 size-48 items-center justify-center rounded-xl border bg-white p-3">
                {qrCodeUrl ? (
                  <QRCode value={qrCodeUrl} size={180} />
                ) : (
                  <View className="mb-4 items-center justify-center">
                    <Spinner />
                  </View>
                )}
              </View>

              {/* Order Number */}
              {order?.order_number && (
                <View className="mb-4 items-center">
                  <Text className="text-sm text-gray-500 dark:text-gray-400">{t('payment.orderNumber')} </Text>
                  <Text className="text-center font-medium text-gray-800 dark:text-gray-200">#{order.order_number}</Text>
                </View>
              )}

              {/* Amount Information */}
              <View className="mb-6 w-full items-center">
                <Text className="text-sm text-gray-500 dark:text-gray-400">{t('payment.amountToPay')}</Text>
                <Text
                  className={`text-center font-bold text-gray-800 dark:text-gray-200 ${dynamicStyles.fontSize.modalAmount}`}
                >
                  {`${amount} ${defaultCurrency?.code}`}
                </Text>
                <View className="mt-1 rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                  {defaultCurrency?.code !== 'USD' && (
                    <CurrencyConverter
                      amount={Number(amount)}
                      customSourceCurrency={defaultCurrency?.code}
                      className={`text-center text-gray-600 dark:text-gray-200 ${dynamicStyles.fontSize.label}`}
                    />
                  )}
                </View>
              </View>
            </View>
          )}
        </ModalBody>
        {!isSuccessPayment && (
          <ModalFooter className="flex w-full flex-col items-center gap-2">
            <>
              {/* <Button
                onPress={handleVerifyPayment}
                isDisabled={isLoading || isCompleted}
                className="w-full rounded-xl"
                size={dynamicStyles.size.buttonSize as 'sm' | 'md' | 'lg'}
              >
                {isLoading ? <ButtonSpinner /> : <ButtonText>{t('payment.verifyPayment')}</ButtonText>}
              </Button> */}
              <Button
                variant="link"
                onPress={onClose}
                className="w-full"
                size={dynamicStyles.size.buttonSize as 'sm' | 'md' | 'lg'}
              >
                <ButtonText>{t('general.cancel')}</ButtonText>
              </Button>
            </>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}
