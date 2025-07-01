/* eslint-disable unused-imports/no-unused-vars */
import { NumPad } from '@umit-turk/react-native-num-pad';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, useWindowDimensions, View } from 'react-native';

import LogoSvg from '@/components/svg/logo';
import LogoWhiteSvg from '@/components/svg/logo-white';
import { Text } from '@/components/ui/text';
import { useSelectedTheme } from '@/hooks/use-selected-theme';
import { getRedirectUri, showToast } from '@/lib';
import { useApp } from '@/providers/app.provider';
import { useCreateOrder } from '@/resources/api/merchant/orders';
import { type OrderResponse } from '@/resources/schema/order';

import { useDynamicStyles } from '.';
import { AmountDisplay } from './amount-display';
import { PaymentButton } from './payment-button';
import { PaymentModal } from './payment-modal';
import { ActionSheetPaymentNote } from './payment-note';

export function PaymentScreen() {
  const { defaultCurrency, merchant } = useApp();
  // Get screen dimensions
  const { height } = useWindowDimensions();
  const [amount, setAmount] = useState('0');
  const [description, setDescription] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderResponse>();
  const router = useRouter();
  const { selectedTheme } = useSelectedTheme();

  const { mutateAsync: createOrder, isPending } = useCreateOrder();

  const isSmallHeight = height <= 667; // iPhone SE and similar small height devices
  const dynamicStyles = useDynamicStyles();

  // Handle numpad button press
  const handlePress = useCallback(
    (digit: string) => {
      if (digit === 'delete') {
        // Delete last digit
        setAmount((prev) => {
          if (prev.length <= 1) return '0';
          const newValue = prev.slice(0, -1);

          // If we're left with just a decimal separator, return '0'
          const decimalSeparator = defaultCurrency?.decimalSeparator || '.';
          if (newValue === decimalSeparator) {
            return '0';
          }

          // Check if the new value would be less than 0.01 (but not exactly 0)
          const numericValue = parseFloat(newValue.replace(decimalSeparator, '.'));
          if (!isNaN(numericValue) && numericValue > 0 && numericValue < 0.01) {
            return '0';
          }

          return newValue;
        });
      } else if (digit === 'C') {
        // Clear amount
        setAmount('0');
      } else {
        // Add digit
        setAmount((prev) => {
          const decimalSeparator = defaultCurrency?.decimalSeparator || '.';

          // Don't allow multiple decimal separators
          if (digit === decimalSeparator && prev.includes(decimalSeparator)) {
            return prev;
          }

          // Special case for decimal separator after 0
          if (prev === '0' && digit === decimalSeparator) {
            return `0${decimalSeparator}`;
          }

          // Replace 0 with digit if amount is only 0
          if (prev === '0' && digit !== decimalSeparator) {
            return digit;
          }

          const newValue = prev + digit;

          // If we just added a decimal separator, return immediately
          if (digit === decimalSeparator) {
            return newValue;
          }

          // Validate the new value
          const numericValue = parseFloat(newValue.replace(decimalSeparator, '.'));

          // Allow exactly 0 or values >= 0.01
          if (!isNaN(numericValue) && numericValue > 0 && numericValue < 0.01) {
            // Don't update if the value would be between 0 and 0.01 (exclusive)
            return prev;
          }

          // Additional check: limit decimal places to 2
          if (newValue.includes(decimalSeparator)) {
            const parts = newValue.split(decimalSeparator);
            if (parts[1] && parts[1].length > 2) {
              return prev; // Don't allow more than 2 decimal places
            }
          }

          return newValue;
        });
      }
    },
    [defaultCurrency?.decimalSeparator]
  );

  // Handle quick amount selection
  // const handleQuickAmount = useCallback((value: string) => {
  //   setAmount(value);
  // }, []);

  const resetPayment = useCallback(() => {
    setAmount('0');
    setDescription('');
  }, []);

  const handleOpenPaymentModal = async () => {
    try {
      const response = await createOrder({
        display_amount: Number(amount),
        display_currency: defaultCurrency?.code ?? 'USD',
        description: description,
        redirect_uri: getRedirectUri('/orders'),
      });

      resetPayment();
      setAmount(amount);
      setCreatedOrder({
        qrcode: response.qrcode,
        order_id: response.order_id,
        order_number: response.order_number,
      });
      setIsPaymentModalOpen(true);
    } catch (error: any) {
      console.error('Error creating order:', error);
      showToast({ type: 'danger', message: error.message as string });
    }
  };

  const handleClosePaymentModal = useCallback(() => {
    resetPayment();

    setCreatedOrder(undefined);
    setIsPaymentModalOpen(false);
  }, []);

  const handleBackToHome = useCallback(() => {
    handleClosePaymentModal();
    router.replace('/');
  }, []);

  const handleNote = useCallback((note: string) => {
    setDescription(note);
  }, []);

  return (
    <View className={`h-full flex-1 flex-col justify-between ${isSmallHeight ? 'py-3' : 'py-6'}`}>
      <View className="flex-1 flex-col gap-2">
        {/* Logo and Brand Name */}
        <View className="mb-2 flex-row items-center justify-center gap-2 py-1">
          {merchant?.logo_url ? (
            <Image source={{ uri: merchant.logo_url }} className="size-8 rounded-full" resizeMode="contain" />
          ) : selectedTheme === 'dark' ? (
            <LogoWhiteSvg width={24} height={24} />
          ) : (
            <LogoSvg width={24} height={24} />
          )}
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-200">{merchant?.display_name || 'Rozo POS'}</Text>
        </View>

        <View className={`flex-1 gap-4 ${dynamicStyles.spacing.containerMargin}`}>
          {/* Amount Display */}
          <AmountDisplay amount={amount} dynamicStyles={dynamicStyles} />

          {/* Quick Amount Buttons */}
          <View className={`px-2 ${dynamicStyles.spacing.containerMargin}`}>
            {/* <QuickAmountList
              quickAmounts={defaultCurrency?.quickAmounts ?? []}
              dynamicStyles={dynamicStyles}
              onSelectQuickAmount={handleQuickAmount}
            /> */}
            <ActionSheetPaymentNote onSubmit={handleNote} value={description} isEdit={description !== ''} />
          </View>
        </View>
      </View>

      {/* Numpad Section */}
      <View className="mt-5 dark:[&_svg]:fill-gray-200">
        <NumPad
          onPress={handlePress}
          decimalSeparator={defaultCurrency?.decimalSeparator === '.' ? '.' : ','}
          containerStyle={{
            padding: 0,
            backgroundColor: 'transparent',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
          buttonStyle={{
            backgroundColor: selectedTheme === 'dark' ? '#222430' : '#ffffff',
            borderRadius: 16,
            margin: dynamicStyles.numpad.margin,
            height: dynamicStyles.numpad.height,
            // width: '30%',
            shadowColor: 'rgba(38, 38, 38, 0.15)',
            shadowOffset: { width: -1, height: 1 },
            shadowOpacity: 1,
            shadowRadius: 3,
            elevation: 1,
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
            borderColor: selectedTheme === 'light' ? '#222430' : '#ffffff',
            borderWidth: 1,
          }}
          buttonTextStyle={{
            fontSize: dynamicStyles.numpad.fontSize,
            fontWeight: '500',
            color: selectedTheme === 'dark' ? '#ffffff' : '#000000',
          }}
        />

        {/* Payment Button */}
        <PaymentButton
          isLoading={isPending}
          isDisabled={Number(amount) === 0 || isPending}
          dynamicStyles={dynamicStyles}
          onPress={handleOpenPaymentModal}
        />
        {/* Payment Modal */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          dynamicStyles={dynamicStyles}
          amount={amount}
          order={createdOrder}
          onBackToHome={handleBackToHome}
        />
      </View>
    </View>
  );
}
