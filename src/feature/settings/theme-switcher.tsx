import { LaptopIcon, MoonIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetIcon,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/actionsheet';
import { type ModeType } from '@/components/gluestack-ui-provider';
import { Pressable } from '@/components/ui/pressable';
import { useSelectedTheme } from '@/hooks';
import { cn } from '@/lib';

const themes = [
  { value: 'system', icon: LaptopIcon },
  { value: 'light', icon: SunIcon },
  { value: 'dark', icon: MoonIcon },
];

export function ActionSheetThemeSwitcher({ trigger }: { trigger: (them: ModeType) => React.ReactNode }) {
  const { t } = useTranslation();
  const { selectedTheme, setSelectedTheme } = useSelectedTheme();
  const { colorScheme } = useColorScheme();

  const [showActionsheet, setShowActionsheet] = React.useState(false);
  const handleClose = () => setShowActionsheet(false);

  function handleColorMode(value: ModeType) {
    setSelectedTheme(value);
    handleClose();
  }

  const itemRefs = React.useRef<{ [key: string]: React.RefObject<any> }>({});

  React.useEffect(() => {
    themes.forEach((theme) => {
      if (!itemRefs.current[theme.value]) {
        itemRefs.current[theme.value] = React.createRef();
      }
    });

    if (colorScheme !== selectedTheme && colorScheme) {
      setSelectedTheme(colorScheme);
    }
  }, []);

  const initialFocusRef = React.useMemo(() => {
    const currentTheme = selectedTheme ?? 'system';
    return itemRefs.current[currentTheme];
  }, [selectedTheme]);

  return (
    <>
      <Pressable onPress={() => setShowActionsheet(true)} className="w-full">
        {trigger((selectedTheme ?? 'system') as ModeType)}
      </Pressable>

      <Actionsheet isOpen={showActionsheet} onClose={handleClose} trapFocus={false} initialFocusRef={initialFocusRef}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {themes.map((th) => {
            return (
              <ActionsheetItem
                key={th.value}
                ref={itemRefs.current[th.value]}
                onPress={() => handleColorMode(th.value as ModeType)}
              >
                <ActionsheetIcon className={cn('stroke-[#747474]')} as={th.icon} />
                <ActionsheetItemText>{t(`settings.theme.${th.value}`)}</ActionsheetItemText>
              </ActionsheetItem>
            );
          })}
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
