import { DaimoPayButton } from '@daimo/pay';
import { NumPad } from '@umit-turk/react-native-num-pad';
import { disconnect } from '@wagmi/core';
import React, { useCallback, useMemo, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { getAddress } from 'viem';

import { Image } from '@/components/ui/image';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { useSelectedTheme } from '@/hooks';
import { currencyConfigs } from '@/lib/currency-config';
import { useApp } from '@/providers/app.provider';
import { daimoConfig } from '@/providers/query.provider';

import { AmountDisplay } from './amount-display';
import { PaymentButton } from './payment-button';
import { QuickAmountList } from './quick-amount';
import { type DynamicStyles } from './types';

export function PaymentScreen() {
  const { merchant } = useApp();
  // Get screen dimensions
  const { width } = useWindowDimensions();
  const [amount, setAmount] = useState('0');
  const [exchangeAmount, setExchangeAmount] = useState('0');

  const { selectedTheme } = useSelectedTheme();

  // Get currency configuration based on merchant's default currency
  const defaultCurrency = merchant?.default_currency || 'IDR';
  const currencyConfig = currencyConfigs[defaultCurrency] || currencyConfigs.IDR;

  // Calculate dynamic sizes based on screen dimensions
  const isSmallScreen = width < 360; // iPhone SE and similar small devices
  const isMediumScreen = width >= 360 && width < 400;

  // Dynamic style values using memoization for performance
  const dynamicStyles = useMemo<DynamicStyles>(
    () => ({
      fontSize: {
        amount: isSmallScreen ? 'text-2xl' : isMediumScreen ? 'text-3xl' : 'text-4xl',
        label: isSmallScreen ? 'text-xs' : 'text-sm',
        quickAmount: isSmallScreen ? 'text-xs' : 'text-xs',
        modalTitle: isSmallScreen ? 'text-base' : isMediumScreen ? 'text-lg' : 'text-xl',
        modalAmount: isSmallScreen ? 'text-lg' : isMediumScreen ? 'text-xl' : 'text-2xl',
      },
      spacing: {
        cardPadding: isSmallScreen ? 'p-3' : isMediumScreen ? 'p-4' : 'p-5',
        quickAmountGap: isSmallScreen ? 'gap-1' : 'gap-1.5',
        containerMargin: isSmallScreen ? 'my-1' : isMediumScreen ? 'my-2' : 'my-3',
      },
      size: {
        quickAmountMinWidth: isSmallScreen ? 'min-w-[55px]' : isMediumScreen ? 'min-w-[60px]' : 'min-w-[70px]',
        tapCardImage: isSmallScreen ? 'size-28' : isMediumScreen ? 'size-32' : 'size-40',
        buttonSize: isSmallScreen ? 'sm' : isMediumScreen ? 'md' : 'lg',
      },
      numpad: {
        height: isSmallScreen ? 40 : isMediumScreen ? 45 : 50,
        fontSize: isSmallScreen ? 16 : isMediumScreen ? 18 : 22,
        margin: isSmallScreen ? 2 : isMediumScreen ? 3 : 4,
      },
    }),
    [isSmallScreen, isMediumScreen]
  );

  // Handle numpad button press
  const handlePress = useCallback(
    (digit: string) => {
      if (digit === 'delete') {
        // Delete last digit
        setAmount((prev) => {
          if (prev.length <= 1) return '0';
          return prev.slice(0, -1);
        });
      } else if (digit === 'C') {
        // Clear amount
        setAmount('0');
      } else {
        // Add digit
        setAmount((prev) => {
          // Don't allow multiple decimal separators
          if (digit === currencyConfig.decimalSeparator && prev.includes(currencyConfig.decimalSeparator)) {
            return prev;
          }

          // Replace 0 with digit if amount is only 0
          if (prev === '0' && digit !== currencyConfig.decimalSeparator) {
            return digit;
          }

          return prev + digit;
        });
      }
    },
    [currencyConfig.decimalSeparator]
  );

  // Handle quick amount selection
  const handleQuickAmount = useCallback((value: string) => {
    setAmount(value);
  }, []);

  const onPaymentCompleted = async (e: any) => {
    console.log(e);
    await disconnect(daimoConfig);
    setAmount('0');
    setExchangeAmount('0');
  };

  return (
    <View className="flex-1">
      <SafeAreaView className="flex-1">
        {/* Logo and Brand Name */}
        <View className="mb-2 flex-row items-center justify-center gap-2 py-1">
          <Image
            source={
              selectedTheme === 'dark' ? require('@/components/svg/logo-white.svg') : require('@/components/svg/logo.svg')
            }
            size="2xs"
          />
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-200">Rozo POS</Text>
        </View>

        <View className={`flex-1 ${dynamicStyles.spacing.containerMargin}`}>
          {/* Amount Display */}
          <AmountDisplay
            amount={amount}
            currencyConfig={currencyConfig}
            dynamicStyles={dynamicStyles}
            onExchangeAmount={setExchangeAmount}
          />

          {/* Quick Amount Buttons */}
          <View className={`px-2 ${dynamicStyles.spacing.containerMargin}`}>
            <QuickAmountList
              quickAmounts={currencyConfig.quickAmounts}
              dynamicStyles={dynamicStyles}
              onSelectQuickAmount={handleQuickAmount}
            />
          </View>
        </View>

        {/* Numpad Section */}
        <View className="mt-auto dark:[&_svg]:fill-gray-200">
          <NumPad
            onPress={handlePress}
            decimalSeparator={currencyConfig.decimalSeparator === '.' ? '.' : ','}
            containerStyle={{
              padding: 0,
              backgroundColor: 'transparent',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
            buttonStyle={{
              backgroundColor: selectedTheme === 'dark' ? '#141419' : '#ffffff',
              borderRadius: 16,
              margin: dynamicStyles.numpad.margin,
              height: dynamicStyles.numpad.height,
              width: '30%',
              shadowColor: 'rgba(38, 38, 38, 0.15)',
              shadowOffset: { width: -1, height: 1 },
              shadowOpacity: 0.6,
              shadowRadius: 3,
              elevation: 1,
            }}
            buttonTextStyle={{
              fontSize: dynamicStyles.numpad.fontSize,
              fontWeight: '500',
              color: selectedTheme === 'dark' ? '#ffffff' : '#000000',
            }}
          />

          {/* Payment Button */}

          {merchant?.wallet_address && Number(exchangeAmount) > 0 ? (
            <DaimoPayButton.Custom
              appId={process.env.DAIMO_PAY_APP_ID ?? 'pay-demo'}
              toAddress={(merchant?.wallet_address ?? '') as `0x${string}`}
              toChain={8453} /* BASE */
              toUnits={exchangeAmount}
              toToken={getAddress('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913')} /* BASE USDC */
              onPaymentCompleted={onPaymentCompleted}
            >
              {({ show }) => (
                <PaymentButton isDisabled={Number(amount) === 0} dynamicStyles={dynamicStyles} onPress={show} />
              )}
            </DaimoPayButton.Custom>
          ) : (
            <PaymentButton isDisabled={true} dynamicStyles={dynamicStyles} onPress={() => {}} />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
