import { RefreshCw } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, ButtonIcon } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useEVMWallet } from '@/hooks/use-evm-wallet';
import { getShortId } from '@/lib';
import { usePrivy } from '@/modules/privy/privy-client';

export function BalanceInfo() {
  const { t } = useTranslation();
  const { user } = usePrivy();
  const { getBalance, isBalanceLoading } = useEVMWallet();

  const [balance, setBalance] = useState('0');
  useEffect(() => {
    getBalance().then((data) => {
      if (data && data.length > 0) {
        setBalance(data[0].display_values.usdc);
      }
    });
  }, []);

  return (
    <VStack className="items-start" space="sm">
      <HStack className="w-full items-center justify-between">
        <Text size="sm" className="tracking-wide text-typography-600">
          {t('general.walletBalance')}
        </Text>

        <Button onPress={getBalance} disabled={isBalanceLoading} size="xs" variant="link" className="rounded-full p-2">
          <ButtonIcon as={RefreshCw} />
        </Button>
      </HStack>

      <HStack className="items-end" space="sm">
        <Heading size="4xl" className={`font-bold text-primary-600 ${isBalanceLoading ? 'animate-pulse' : ''}`}>
          {balance ?? '0.00'}
        </Heading>

        <Text size="lg" className={`font-medium text-typography-500 ${isBalanceLoading ? 'animate-pulse' : ''}`}>
          USDC
        </Text>
      </HStack>

      {user?.wallet?.address && (
        <Text className="text-typography-400" size="sm">
          {getShortId(user?.wallet?.address ?? '', 6, 4)}
        </Text>
      )}
    </VStack>
  );
}
