/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable unused-imports/no-unused-imports */
import * as Application from 'expo-application';
import { DollarSign, Languages, Palette } from 'lucide-react-native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';

import { type ModeType } from '@/components/gluestack-ui-provider';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { ChevronRightIcon, Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { VStack } from '@/components/ui/vstack';
import { AccountSection } from '@/features/settings/account-section';
import { ActionSheetCurrencySwitcher } from '@/features/settings/select-currency';
import { ActionSheetLanguageSwitcher } from '@/features/settings/select-language';
import { ActionSheetThemeSwitcher } from '@/features/settings/theme-switcher';
import { getTokenBalance, transferTokenZeroDev } from '@/modules/dynamic/token-operations';
import { useApp } from '@/providers/app.provider';

export function SettingScreen() {
  const { logout, primaryWallet, merchantToken } = useApp();
  const { t } = useTranslation();

  /*  const getBalance = async () => {
    if (primaryWallet && merchantToken) {
      const balance = await getTokenBalance(primaryWallet, merchantToken);
      console.log(balance);
    }
  };

  useEffect(() => {
    if (primaryWallet) {
      getBalance();
    }
  }, [primaryWallet, merchantToken]);

  const testTransfer = async () => {
    if (primaryWallet && merchantToken) {
      const result = await transferTokenZeroDev(
        primaryWallet,
        '0xD891AC81ab4A1eb21750ba50b4eF3e9eb3DA4ada',
        '0.1',
        merchantToken
      );
      console.log(result);
    }
  }; */

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 py-6">
        <View className="mb-6">
          {/* <Button onPress={testTransfer}>
            <ButtonText>Test Transfer</ButtonText>
          </Button> */}
          <Text className="text-2xl font-bold">{t('settings.title')}</Text>
          <Text className="text-sm text-gray-400">{t('settings.description')}</Text>
        </View>
        <VStack space="lg">
          <VStack className="items-start justify-between rounded-xl border border-background-300 bg-background-0 px-4 py-2">
            <AccountSection />
          </VStack>

          {/* <VStack className="items-center justify-between divide-y divide-gray-200 rounded-xl border border-background-300 bg-background-0 px-4 py-2 dark:divide-[#2b2b2b]">
            <WalletAddressCard />
            <WalletBalanceCard />
          </VStack> */}

          <VStack className="items-center justify-between divide-y divide-gray-200 rounded-xl border border-background-300 bg-background-0 px-4 py-2 dark:divide-[#2b2b2b]">
            <ActionSheetCurrencySwitcher
              trigger={(curr) => (
                <HStack space="2xl" className="w-full flex-1 items-center justify-between px-2 py-3">
                  <HStack className="items-center" space="md">
                    <Icon as={DollarSign} className="mb-auto mt-1 stroke-[#747474]" />
                    <VStack className="items-start" space="xs">
                      <Text size="md">{t('settings.currency.title')}</Text>
                      <Text size="xs">{curr}</Text>
                    </VStack>
                  </HStack>
                  <Icon as={ChevronRightIcon} className="text-gray-400 dark:text-gray-50" />
                </HStack>
              )}
            />

            <Divider />

            <ActionSheetLanguageSwitcher
              trigger={(lg) => (
                <HStack space="2xl" className="w-full flex-1 items-center justify-between px-2 py-3">
                  <HStack className="items-center" space="md">
                    <Icon as={Languages} className="mb-auto mt-1 stroke-[#747474]" />
                    <VStack className="items-start" space="xs">
                      <Text size="md">{t('settings.language.title')}</Text>
                      <Text size="xs">{lg}</Text>
                    </VStack>
                  </HStack>
                  <Icon as={ChevronRightIcon} className="text-gray-400 dark:text-gray-50" />
                </HStack>
              )}
            />

            <Divider />
            <ActionSheetThemeSwitcher
              trigger={(selectedTheme: ModeType) => (
                <HStack space="2xl" className="w-full flex-1 items-center justify-between px-2 py-3">
                  <HStack className="items-center" space="md">
                    <Icon as={Palette} className="mb-auto mt-1 stroke-[#747474]" />
                    <VStack className="items-start" space="xs">
                      <Text size="md">{t('settings.theme.title')}</Text>
                      <Text size="xs">{t(`settings.theme.${selectedTheme}`)}</Text>
                    </VStack>
                  </HStack>
                  <Icon as={ChevronRightIcon} className="text-gray-400 dark:text-gray-50" />
                </HStack>
              )}
            />
          </VStack>

          <Button variant="solid" size="sm" action="negative" onPress={logout} className="rounded-xl">
            <ButtonText>{t('settings.logout')}</ButtonText>
          </Button>

          {Application.nativeApplicationVersion && (
            <VStack space="sm">
              <Text className="text-center text-xs">
                {t('settings.version')} - {Application.nativeApplicationVersion}
              </Text>
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
