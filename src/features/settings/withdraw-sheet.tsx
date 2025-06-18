import { BanknoteArrowDown } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard } from 'react-native';
import { type Address } from 'viem';

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useTokenTransfer } from '@/hooks/use-token-transfer';
import { useWalletBalance } from '@/hooks/use-wallet-balance';
import { showToast } from '@/lib';

type Props = {
  onClose?: () => void;
};

export function WithdrawActionSheet({ onClose }: Props) {
  const { t } = useTranslation();
  const { balance } = useWalletBalance();
  const { isAbleToTransfer, transfer } = useTokenTransfer();

  const [open, setOpen] = useState<boolean>(false);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<{
    withdrawAddress?: string;
    amount?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MIN_AMOUNT = 0.01;
  const maxAmount = balance?.balance ? parseFloat(balance.balance) : 0;

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!withdrawAddress.trim()) {
      newErrors.withdrawAddress = t('validation.required');
    }

    // Validate amount
    if (!amount.trim()) {
      newErrors.amount = t('validation.required');
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount)) {
        newErrors.amount = t('validation.invalidAmount');
      } else if (numAmount < MIN_AMOUNT) {
        newErrors.amount = t('validation.minAmount', { min: MIN_AMOUNT });
      } else if (numAmount > maxAmount) {
        newErrors.amount = t('validation.maxAmount', { max: maxAmount });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isAbleToTransfer) {
        const result = await transfer(withdrawAddress as Address, amount, true);

        if (result.success) {
          showToast({
            message: t('withdraw.success'),
            type: 'success',
          });

          handleClose();
        } else {
          throw result.error;
        }
      }
    } catch (error: any) {
      showToast({
        message: `${t('withdraw.error')}: ${error.message}`,
        type: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setWithdrawAddress('');
    setAmount('');
    setErrors({});
    setIsSubmitting(false);
    setOpen(false);
    onClose?.();
  };

  const setMaxAmount = () => {
    setAmount(maxAmount.toString());
    setErrors((prev) => ({ ...prev, amount: undefined }));
  };

  return (
    <>
      <Button
        disabled={balance?.balance ? parseFloat(balance.balance) < 0.01 : true}
        size="md"
        className="rounded-xl"
        onPress={() => setOpen(true)}
      >
        <ButtonIcon as={BanknoteArrowDown}></ButtonIcon>
        <ButtonText>{t('general.withdraw')}</ButtonText>
      </Button>

      <Actionsheet isOpen={open} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="pb-8">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <VStack className="w-full px-6 pt-4" space="lg">
            <Text size="xl" className="text-center font-semibold">
              {t('general.withdraw')}
            </Text>

            <VStack space="md">
              <FormControl isInvalid={!!errors.withdrawAddress}>
                <FormControlLabel>
                  <FormControlLabelText>{t('general.walletAddress')}</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    placeholder={t('withdraw.walletAddressPlaceholder')}
                    value={withdrawAddress}
                    onChangeText={(text) => {
                      setWithdrawAddress(text);
                      setErrors((prev) => ({ ...prev, withdrawAddress: undefined }));
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </Input>
                {errors.withdrawAddress && (
                  <FormControlError>
                    <FormControlErrorText>{errors.withdrawAddress}</FormControlErrorText>
                  </FormControlError>
                )}
                <Text size="sm" className="mt-1 text-gray-500">
                  {t('withdraw.supportedOnly', { currency: balance?.token.label || 'USDC Base' })}
                </Text>
              </FormControl>

              <FormControl isInvalid={!!errors.amount}>
                <FormControlLabel>
                  <FormControlLabelText>{t('general.amount')}</FormControlLabelText>
                </FormControlLabel>
                <VStack space="xs">
                  <Input>
                    <InputField
                      placeholder="0.00"
                      value={amount}
                      onChangeText={(text) => {
                        // Only allow numbers, comma, and dot - no negative signs
                        const sanitizedText = text.replace(/[^0-9.,]/g, '');
                        setAmount(sanitizedText);
                        setErrors((prev) => ({ ...prev, amount: undefined }));
                      }}
                      keyboardType="decimal-pad"
                    />
                  </Input>
                  <HStack className="items-center justify-between">
                    <Button size="xs" variant="link" className="underline" onPress={setMaxAmount} disabled={maxAmount === 0}>
                      <ButtonText>
                        {t('general.max')}: {maxAmount.toFixed(2)}
                      </ButtonText>
                    </Button>
                  </HStack>
                </VStack>
                {errors.amount && (
                  <FormControlError>
                    <FormControlErrorText>{errors.amount}</FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>
            </VStack>

            <HStack space="md" className="grid grid-cols-2 pt-4">
              <Button variant="outline" onPress={handleClose} disabled={isSubmitting} className="w-full">
                <ButtonText>{t('general.cancel')}</ButtonText>
              </Button>

              <Button onPress={handleSubmit} disabled={isSubmitting} className="w-full">
                <ButtonText>{isSubmitting ? t('general.processing') : t('general.withdraw')}</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
