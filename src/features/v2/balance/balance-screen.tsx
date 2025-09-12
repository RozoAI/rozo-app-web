import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { VStack } from '@/components/ui/vstack';

import { BalanceInfo } from './balance-info';

export function BalanceScreenV2() {
  const { t } = useTranslation();
  // const depositDialogRef = useRef<DepositDialogRef>(null);

  // const handleReceivePress = () => {
  //   depositDialogRef.current?.open();
  // };

  return (
    <ScrollView className="my-6 flex-1">
      {/* Header */}
      <VStack className="flex flex-row items-start justify-between">
        <View className="mb-6">
          <Text className="mb-1 text-2xl font-bold">{t('balance.title')}</Text>
          <Text className="text-sm text-gray-400">{t('balance.description')}</Text>
        </View>
      </VStack>

      <VStack space="lg">
        {/* Balance Card */}

        <VStack className="rounded-xl border border-background-300 bg-background-0 px-4 py-2">
          <BalanceInfo />
        </VStack>

        {/* Action Buttons */}
        {/* <VStack space="md" className="flex-1 justify-center">
          <HStack space="md" className="w-full">
            <Button size="sm" className="flex-1 rounded-xl" variant="solid" action="secondary" onPress={handleReceivePress}>
              <ButtonIcon as={ArrowDownIcon}></ButtonIcon>
              <ButtonText>{t('general.receive')}</ButtonText>
            </Button>
            <View className="flex-1">
              <WithdrawActionSheet onSuccess={() => refetch()} balance={balance ?? undefined} />
            </View>
          </HStack>
        </VStack> */}
      </VStack>

      {/* Receive Sheet */}
      {/* <TopupSheet ref={depositDialogRef} onConfirm={handleTopUpConfirm} /> */}
    </ScrollView>
  );
}
