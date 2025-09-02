import { ShoppingCartIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { usePOSToggle } from '@/providers/pos-toggle.provider';

export function POSToggleSetting() {
  const { t } = useTranslation();
  const { showPOS, togglePOS } = usePOSToggle();

  return (
    <View className="w-full flex-1 flex-row items-center justify-between gap-4 px-2 py-3">
      <View className="flex-row items-center gap-2">
        <Icon as={ShoppingCartIcon} className="mb-auto mt-1 stroke-[#747474]" />
        <View className="flex-col items-start gap-1">
          <Text size="md">{t('settings.pointOfSales.title')}</Text>
          <Text size="sm">{t('settings.pointOfSales.description')}</Text>
        </View>
      </View>
      <Switch value={showPOS} onValueChange={togglePOS} size="md" />
    </View>
  );
}
