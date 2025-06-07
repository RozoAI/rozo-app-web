/* eslint-disable react/no-unstable-nested-components */
import { Tabs } from 'expo-router';
import { HomeIcon, Settings2Icon, ShoppingBagIcon } from 'lucide-react-native';
import React from 'react';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

const tabScreenOptions = {
  headerShown: false,
  tabBarStyle: {
    height: 64,
    paddingTop: 6,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    elevation: 0,
    shadowOpacity: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 2,
  },
  tabBarActiveTintColor: '#6366F1',
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '500' as const, // Type assertion for fontWeight
    marginTop: 2,
  },
  tabBarIconStyle: {
    marginBottom: -4,
  },
  tabBarAllowFontScaling: true,
  animation: 'fade' as const,
  tabBarLabel: ({ children, color, focused }: { children: string; color: string; focused: boolean }) => (
    <Text className={cn('text-xs font-medium', focused && 'font-semibold')} style={{ color }}>
      {children}
    </Text>
  ),
};

export default function TabLayout() {
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
