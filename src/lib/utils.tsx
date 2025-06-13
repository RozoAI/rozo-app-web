import clsx, { type ClassValue } from 'clsx';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Platform } from 'react-native';
import { Linking } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { twMerge } from 'tailwind-merge';
import type { StoreApi, UseBoundStore } from 'zustand';

// Platform
export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';
export const IS_WEB = Platform.OS === 'web';

// Dimensions
const { width, height } = Dimensions.get('screen');

export const WIDTH = width;
export const HEIGHT = height;

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const showToast = ({
  type = 'info',
  message = 'Something went wrong ',
}: {
  type: 'danger' | 'success' | 'warning' | 'info';
  message: string;
}) => {
  // Use different icon based on toast type
  const iconMap = {
    danger: <AlertCircle />,
    success: <CheckCircle />,
    warning: <AlertTriangle />,
    info: <Info />,
  };

  showMessage({
    message,
    type,
    duration: 4000,
    icon: iconMap[type],
  });
};

export function openLinkInBrowser(url: string) {
  Linking.canOpenURL(url).then((canOpen) => canOpen && Linking.openURL(url));
}

type WithSelectors<S> = S extends { getState: () => infer T } ? S & { use: { [K in keyof T]: () => T[K] } } : never;

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(_store: S) => {
  let store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (let k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};
