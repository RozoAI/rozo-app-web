import React from 'react';

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/actionsheet';
import { Pressable } from '@/components/ui/pressable';
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
  const [selectedValue, setSelectedValue] = React.useState(value);

  const [showActionsheet, setShowActionsheet] = React.useState(false);
  const handleClose = () => setShowActionsheet(false);

  const { mutate: createProfile, data } = useCreateProfile();
  const { merchant, setMerchant } = useApp();

  React.useEffect(() => {
    currencies.forEach((cur) => {
      if (!itemRefs.current[cur.value]) {
        itemRefs.current[cur.value] = React.createRef();
      }
    });
  }, []);

  React.useEffect(() => {
    if (merchant && merchant.default_currency) {
      setSelectedValue(merchant.default_currency.toLowerCase());
    }
  }, [merchant]);

  React.useEffect(() => {
    setMerchant(data);
  }, [data]);

  const initialLabel = React.useMemo(() => {
    return currencies.find((curr) => curr.value === selectedValue)?.label || '-';
  }, [selectedValue]);

  const selectedLabel = React.useMemo(() => {
    return currencies.find((curr) => curr.value === selectedValue)?.label;
  }, [selectedValue]);

  const itemRefs = React.useRef<{ [key: string]: React.RefObject<any> }>({});

  const initialFocusRef = React.useMemo(() => {
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
      default_currency: value.toUpperCase(),
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
                <ActionsheetItemText>{curr.label}</ActionsheetItemText>
              </ActionsheetItem>
            );
          })}
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
