import { CheckIcon } from 'lucide-react-native';
import React, { createRef, type RefObject, useEffect, useMemo, useRef, useState } from 'react';

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/ui/actionsheet';
import { Pressable } from '@/components/ui/pressable';
import { showToast } from '@/lib';
import { useApp } from '@/providers/app.provider';
import { useCreateProfile } from '@/resources/api';

const currencies = [
  {
    label: 'USD - United State Dollar ($)',
    value: 'usd',
  },
  {
    label: 'MYR - Malaysian Ringgit (RM)',
    value: 'myr',
  },
  {
    label: 'SGP - Singapore Dollar ($)',
    value: 'sgp',
  },
  {
    label: 'IDR - Indonesian Rupiah (IDR)',
    value: 'idr',
  },
];

type ActionSheetCurrencySwitcherProps = {
  trigger: (curr: string) => React.ReactNode;
  defaultValue?: string;
  value?: string;
};

export function ActionSheetCurrencySwitcher({ trigger, value }: ActionSheetCurrencySwitcherProps) {
  const [selectedValue, setSelectedValue] = useState(value);

  const [showActionsheet, setShowActionsheet] = useState(false);
  const handleClose = () => setShowActionsheet(false);

  const { mutate: createProfile, data } = useCreateProfile();
  const { merchant, setMerchant } = useApp();

  useEffect(() => {
    currencies.forEach((cur) => {
      if (!itemRefs.current[cur.value]) {
        itemRefs.current[cur.value] = createRef();
      }
    });
  }, []);

  useEffect(() => {
    if (merchant && merchant.default_currency) {
      setSelectedValue(merchant.default_currency.toLowerCase());
    }
  }, [merchant]);

  useEffect(() => {
    if (data) {
      setMerchant(data);

      showToast({
        message: 'Currency updated successfully',
        type: 'success',
      });
    }
  }, [data]);

  const initialLabel = useMemo(() => {
    return currencies.find((curr) => curr.value === selectedValue)?.label || '-';
  }, [selectedValue]);

  const selectedLabel = useMemo(() => {
    return currencies.find((curr) => curr.value === selectedValue)?.label;
  }, [selectedValue]);

  const itemRefs = useRef<{ [key: string]: RefObject<any> }>({});

  const initialFocusRef = useMemo(() => {
    const currentTheme = selectedValue ?? 'usd';
    return itemRefs.current[currentTheme];
  }, [selectedValue]);

  function handleCurrencyChange(value: string) {
    if (!merchant?.email) return;

    setSelectedValue(value);

    // eslint-disable-next-line unused-imports/no-unused-vars
    const { created_at, ...rest } = merchant;
    createProfile({
      ...rest,
      default_currency: value?.toUpperCase(),
    });

    handleClose();
  }

  return (
    <>
      <Pressable onPress={() => setShowActionsheet(true)} className="w-full">
        {trigger(selectedLabel ?? initialLabel)}
      </Pressable>

      <Actionsheet isOpen={showActionsheet} onClose={handleClose} trapFocus={false} initialFocusRef={initialFocusRef}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {currencies.map((curr) => {
            const isActive = curr.value === selectedValue;

            return (
              <ActionsheetItem
                key={curr.value}
                ref={itemRefs.current[curr.value]}
                onPress={() => handleCurrencyChange(curr.value)}
                data-active={isActive}
              >
                <ActionsheetItemText className="flex w-full items-center justify-between">
                  {curr.label}
                  {isActive && <CheckIcon />}
                </ActionsheetItemText>
              </ActionsheetItem>
            );
          })}
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
