import React from 'react';
import { View } from 'react-native';

import { Button, ButtonText } from '@/components/ui/button';

import { type DynamicStyles } from './types';

type PaymentButtonProps = {
  isDisabled: boolean;
  dynamicStyles: DynamicStyles;
  onPress: () => void;
};

export function PaymentButton({ isDisabled, dynamicStyles, onPress }: PaymentButtonProps) {
  return (
    <View className="mt-4 px-3 pb-2">
      <Button
        onPress={onPress}
        size={dynamicStyles.size.buttonSize as 'sm' | 'md' | 'lg'}
        isDisabled={isDisabled}
        className="rounded-xl"
      >
        <ButtonText>Continue to Payment</ButtonText>
      </Button>
    </View>
  );
}
