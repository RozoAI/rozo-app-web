import { NumPad } from '@umit-turk/react-native-num-pad';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, useWindowDimensions, View } from 'react-native';

import LogoSvg from '@/components/svg/logo';
import LogoWhiteSvg from '@/components/svg/logo-white';
import { Text } from '@/components/ui/text';
import { useSelectedTheme } from '@/hooks/use-selected-theme';
import { getRedirectUri, showToast } from '@/lib';
import { useApp } from '@/providers/app.provider';
import { useCreateOrder } from '@/resources/api/merchant/orders';
import { type OrderResponse } from '@/resources/schema/order';

import { AmountDisplay } from './amount-display';
import { PaymentButton } from './payment-button';
import { PaymentModal } from './payment-modal';
import { ActionSheetPaymentNote } from './payment-note';
import { type DynamicStyles } from './types';

export function PaymentScreen() {
  const { defaultCurrency, merchant } = useApp();
  // Get screen dimensions
  const { width, height } = useWindowDimensions();
  const [amount, setAmount] = useState('0');
  const [description, setDescription] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderResponse>();

  const { selectedTheme } = useSelectedTheme();

  const { mutateAsync: createOrder, isPending } = useCreateOrder();

  // Calculate dynamic sizes based on screen dimensions
  const isSmallWidth = width <= 360; // iPhone SE and similar small width devices
  const isMediumWidth = width > 360 && width < 400;

  // Calculate height-based constraints
  const isSmallHeight = height <= 667; // iPhone SE and similar small height devices
  const isMediumHeight = height > 667 && height < 736;

  // Combined size detection for more accurate responsive design
  const isSmallScreen = isSmallWidth || isSmallHeight;
  const isMediumScreen = (isMediumWidth && !isSmallHeight) || (isMediumHeight && !isSmallWidth);

  // Detect extremely constrained devices (both small width and height)
  const isExtremelyConstrained = isSmallWidth && isSmallHeight;

  // Dynamic style values using memoization for performance
  const dynamicStyles = useMemo<DynamicStyles>(
    () => ({
      fontSize: {
        // Adjust font sizes based on both width and height
        amount: isExtremelyConstrained ? 'text-xl' : isSmallScreen ? 'text-2xl' : isMediumScreen ? 'text-3xl' : 'text-4xl',
        label: isSmallScreen ? 'text-xs' : 'text-sm',
        quickAmount: isSmallScreen ? 'text-xs' : 'text-xs',
        modalTitle: isSmallScreen ? 'text-base' : isMediumScreen ? 'text-lg' : 'text-xl',
        modalAmount: isExtremelyConstrained
          ? 'text-base'
          : isSmallScreen
            ? 'text-lg'
            : isMediumScreen
              ? 'text-xl'
              : 'text-2xl',
        title: isSmallScreen ? 'text-lg' : 'text-xl',
      },
      spacing: {
        // Optimize spacing for different screen sizes
        cardPadding: isExtremelyConstrained ? 'p-2' : isSmallScreen ? 'p-3' : isMediumScreen ? 'p-4' : 'p-5',
        quickAmountGap: isSmallScreen ? 'gap-1' : 'gap-1.5',
        containerMargin: isSmallHeight ? 'my-0.5' : isSmallScreen ? 'my-1' : isMediumScreen ? 'my-2' : 'my-3',
      },
      size: {
        // Adjust component sizes based on available space
        quickAmountMinWidth: isExtremelyConstrained
          ? 'min-w-[50px]'
          : isSmallScreen
            ? 'min-w-[55px]'
            : isMediumScreen
              ? 'min-w-[60px]'
              : 'min-w-[70px]',
        tapCardImage: isExtremelyConstrained
          ? 'size-24'
          : isSmallScreen
            ? 'size-28'
            : isMediumScreen
              ? 'size-32'
              : 'size-40',
        buttonSize: isSmallScreen ? 'md' : isMediumScreen ? 'lg' : 'xl',
      },
      numpad: {
        // Optimize numpad for different screen sizes
        height: isExtremelyConstrained
          ? 34 // Extremely constrained devices (both small width and height)
          : isSmallHeight
            ? 42 // Small height devices need taller buttons for better touch targets
            : isSmallScreen
              ? 40 // Small screen devices (width-constrained)
              : isMediumScreen
                ? 48 // Medium screen devices
                : 56, // Large screen devices
        fontSize: isExtremelyConstrained
          ? 18 // Smaller font for extremely constrained devices
          : isSmallHeight
            ? 22 // Slightly smaller font for height-constrained devices
            : isSmallScreen
              ? 24 // Small screen devices
              : isMediumScreen
                ? 28 // Medium screen devices
                : 36, // Large screen devices
        margin: isExtremelyConstrained
          ? 1 // Minimal margin for extremely constrained devices
          : isSmallHeight
            ? 2 // Small margin for height-constrained devices
            : isSmallScreen
              ? 2 // Small screen devices
              : isMediumScreen
                ? 3 // Medium screen devices
                : 6, // Large screen devices
      },
    }),
    [isSmallScreen, isMediumScreen, isSmallHeight, isExtremelyConstrained]
  );

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
        />
      </View>
    </View>
  );
}
