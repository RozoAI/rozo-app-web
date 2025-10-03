/* eslint-disable react/no-unstable-nested-components */
import { Redirect, Tabs } from 'expo-router';
import { CircleDollarSignIcon, Coins, Settings2Icon, ShoppingBagIcon, ShoppingCartIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/app.provider';
import { usePOSToggle } from '@/providers/pos-toggle.provider';

export default function TabLayout() {
  const theme = useColorScheme();
  const { isAuthenticated } = useApp();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { showPOS } = usePOSToggle();

  if (!isAuthenticated) {
    return <Redirect href="login" />;
  }

  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 64,
            paddingTop: 6,
            paddingBottom: 10,
            marginBottom: insets.bottom,
            backgroundColor: theme?.colorScheme === 'dark' ? '#222430' : '#FFFFFF',
            elevation: 0,
            shadowOpacity: 0.5,
            borderTopColor: theme?.colorScheme === 'dark' ? '#222430' : '#E5E7EB',
          },
          tabBarActiveTintColor: '#0369A1', // Primary blue color
          tabBarInactiveTintColor: theme?.colorScheme === 'dark' ? '#FFFFFF' : '#6B7280', // Gray-500
          tabBarIconStyle: {
            marginBottom: -4,
          },
          tabBarAllowFontScaling: true,
          animation: 'fade' as const,
          tabBarLabelPosition: 'below-icon',
          tabBarLabel: ({ children, color, focused }: { children: string; color: string; focused: boolean }) => (
            <Text className={cn('text-sm font-medium', focused && `font-semibold`)} style={{ color }}>
              {children}
            </Text>
          ),
          sceneStyle: {
            paddingTop: insets.top,
            paddingLeft: insets.left + 16,
            paddingRight: insets.right + 16,
            backgroundColor: theme?.colorScheme === 'dark' ? '#141419' : '#f8f8ff',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('balance.title'),
            tabBarIcon: ({ color }: any) => <Icon as={Coins} size="md" color={color} />,
            tabBarButtonTestID: 'balance-tab',
          }}
        />

        <Tabs.Screen
          name="pos"
          options={
            showPOS
              ? {
                  title: t('pos.title'),
                  tabBarIcon: ({ color }: any) => <Icon as={ShoppingCartIcon} size="md" color={color} />,
                  tabBarButtonTestID: 'pos-tab',
                }
              : {
                  href: null,
                }
          }
        />

        <Tabs.Screen
          name="orders"
          options={{
            title: t('order.title'),
            tabBarIcon: ({ color }: any) => <Icon as={ShoppingBagIcon} size="md" color={color} />,
            tabBarButtonTestID: 'orders-tab',
          }}
        />

        <Tabs.Screen
          name="transactions"
          options={{
            title: t('transactions.title'),
            tabBarIcon: ({ color }: any) => <Icon as={CircleDollarSignIcon} size="md" color={color} />,
            tabBarButtonTestID: 'transactions-tab',
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: t('settings.title'),
            tabBarIcon: ({ color }: any) => <Icon as={Settings2Icon} size="md" color={color} />,
            tabBarButtonTestID: 'settings-tab',
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}
