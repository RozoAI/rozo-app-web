/* eslint-disable react/no-unstable-nested-components */
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Tabs, useRouter } from 'expo-router';
import { HomeIcon, Settings2Icon, ShoppingBagIcon } from 'lucide-react-native';
import React, { useEffect } from 'react';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/app.provider';

const tabScreenOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarStyle: {
    height: 64,
    paddingTop: 6,
    paddingBottom: 10,
    backgroundColor: 'rgb(var(--color-background-500))',
    elevation: 0,
    shadowOpacity: 0.5,
  },

  tabBarActiveTintColor: 'rgb(var(--color-primary-500))',
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
    padding: 16,
    backgroundColor: 'rgb(var(--color-background-500))',
  },
};

export default function TabLayout() {
  const { isAuthenticated } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.navigate('/login');
    }
  }, [isAuthenticated]);

  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon as={HomeIcon} size="md" color={color} />,
          tabBarButtonTestID: 'home-tab',
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <Icon as={ShoppingBagIcon} size="md" color={color} />,
          tabBarButtonTestID: 'orders-tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Icon as={Settings2Icon} size="md" color={color} />,
          tabBarButtonTestID: 'settings-tab',
        }}
      />
    </Tabs>
  );
}
