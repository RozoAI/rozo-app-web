import { useRouter } from 'expo-router';
import { DollarSign, Languages, Palette } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';

import { type ModeType } from '@/components/gluestack-ui-provider';
import { Button, ButtonText } from '@/components/ui/button';
import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { HStack } from '@/components/ui/hstack';
import { ChevronRightIcon, Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { AccountSection } from '@/feature/settings/account-section';
import { ActionSheetCurrencySwitcher } from '@/feature/settings/select-currency';
import { ActionSheetLanguageSwitcher } from '@/feature/settings/select-language';
import { ActionSheetThemeSwitcher } from '@/feature/settings/theme-switcher';
import { useDynamic } from '@/modules/dynamic/dynamic-client';
import { useApp } from '@/providers/app.provider';

export default function SettingsPage() {
  const { auth } = useDynamic();
  const { setToken, setMerchant, isAuthenticated } = useApp();
  const { t } = useTranslation();
  const router = useRouter();

  const handleLogout = () => {
    auth.logout();
    setToken(undefined);
    setMerchant(undefined);

    router.replace('/login');
  };

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView className="px-4">
        <SafeAreaView className="pb-6">
          <Text className="my-4 text-center text-xl font-semibold">{t('settings.title')}</Text>

          <VStack space="lg">
            <VStack className="border-border-300 items-start justify-between rounded-xl border bg-background-0 px-4 py-2 dark:border-background-300">
              {isAuthenticated && <AccountSection />}
            </VStack>

            <VStack className="border-border-300 items-center justify-between divide-y divide-[#747474] rounded-xl border bg-background-0 px-4 py-2 dark:divide-[#2b2b2b] dark:border-background-300">
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
                    <Icon as={ChevronRightIcon} />
                  </HStack>
                )}
              />

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
                    <Icon as={ChevronRightIcon} />
                  </HStack>
                )}
              />

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
                    <Icon as={ChevronRightIcon} />
                  </HStack>
                )}
              />
            </VStack>

            <Button variant="outline" size="sm" action="negative" onPress={handleLogout} className="rounded-xl">
              <ButtonText>{t('settings.logout')}</ButtonText>
            </Button>

            <VStack space="sm">
              <Text className="text-center text-xs">{t('settings.version')} - </Text>
              <Text className="text-center text-xs">
                {t('general.termsOfService')} & {t('general.privacyPolicy')}
              </Text>
            </VStack>
          </VStack>
        </SafeAreaView>
      </ScrollView>
    </>
  );
}
