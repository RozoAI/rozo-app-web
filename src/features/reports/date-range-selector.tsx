import { Calendar } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { Button, ButtonText } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { type DateRangePreset } from '@/features/reports/types';

type DateRangeSelectorProps = {
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
};

export function DateRangeSelector({ preset, onPresetChange }: DateRangeSelectorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const presets: { value: DateRangePreset; label: string }[] = [
    { value: 'today', label: t('reports.dateRange.today') },
    { value: 'last7days', label: t('reports.dateRange.last7days') },
    { value: 'last30days', label: t('reports.dateRange.last30days') },
    { value: 'thisMonth', label: t('reports.dateRange.thisMonth') },
    { value: 'lastMonth', label: t('reports.dateRange.lastMonth') },
  ];

  const selectedLabel = presets.find((p) => p.value === preset)?.label || t('reports.dateRange.last7days');

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between rounded-xl border border-background-300 bg-background-0 px-4 py-3"
      >
        <Icon as={Calendar} className="text-gray-500" size="sm" />
        <Text className="flex-1 px-3 font-medium">{selectedLabel}</Text>
        <Text className="text-gray-400">▼</Text>
      </Pressable>

      <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <VStack space="sm" className="w-full p-4">
            <Text className="mb-2 text-lg font-semibold">{t('reports.selectDateRange')}</Text>
            {presets.map((p) => (
              <Button
                key={p.value}
                variant={preset === p.value ? 'solid' : 'outline'}
                action="primary"
                onPress={() => {
                  onPresetChange(p.value);
                  setIsOpen(false);
                }}
                className="w-full"
              >
                <ButtonText>{p.label}</ButtonText>
              </Button>
            ))}
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
