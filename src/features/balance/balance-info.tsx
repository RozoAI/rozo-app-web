import { RefreshCw } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Button, ButtonIcon } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useWalletBalance } from '@/hooks/use-wallet-balance';
import { getShortId } from '@/lib';
import { useApp } from '@/providers/app.provider';

export function BalanceInfo() {
  const { t } = useTranslation();
  const { balance, isLoading, refetch } = useWalletBalance();
  const { primaryWallet } = useApp();

  return (
    <VStack className="items-start" space="sm">
      <HStack className="w-full items-center justify-between">
        <Text size="sm" className="tracking-wide text-typography-600">
          {t('general.walletBalance')}
        </Text>

        <Button onPress={refetch} disabled={isLoading} size="xs" variant="link" className="rounded-full p-2">
          <ButtonIcon as={RefreshCw} />
        </Button>
      </HStack>

      <HStack className="items-end" space="sm">
        <Heading size="4xl" className={`font-bold text-primary-600 ${isLoading ? 'animate-pulse' : ''}`}>
          {balance?.formattedBalance ?? '0.00'}
        </Heading>

        <Text size="lg" className={`font-medium text-typography-500 ${isLoading ? 'animate-pulse' : ''}`}>
          {balance?.token.label ?? 'USDC'}
        </Text>
      </HStack>

      {primaryWallet && (
        <Text className="text-typography-400" size="sm">
          {getShortId(primaryWallet?.address ?? '', 6, 4)}
        </Text>
      )}
    </VStack>
  );
}
