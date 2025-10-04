import { RefreshCw } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Button, ButtonIcon } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { VStack } from '@/components/ui/vstack';
import { getShortId } from '@/lib';
import { type TokenBalanceResult } from '@/lib/tokens';
import { useApp } from '@/providers/app.provider';

export function BalanceInfo({
  balance,
  isLoading,
  refetch,
}: {
  balance: TokenBalanceResult | undefined;
  isLoading: boolean;
  refetch: () => void;
}) {
  const { t } = useTranslation();
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

      <View>
        {isLoading ? (
          <Spinner size="small" color="grey" />
        ) : (
          <HStack space="sm" className="items-end">
            <Heading size="4xl" className={`font-bold text-primary-600`}>
              {balance?.formattedBalance ?? '0.00'}
            </Heading>

            <Text size="lg" className={`font-medium text-typography-500`}>
              {balance?.token.label ?? 'USD'}
            </Text>
          </HStack>
        )}
      </View>

      {primaryWallet && (
        <Text className="text-typography-400" size="sm">
          {getShortId(primaryWallet?.address ?? '', 6, 4)}
        </Text>
      )}
    </VStack>
  );
}
