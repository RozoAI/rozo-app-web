import { ReceiptIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';

export default function EmptyOrdersState() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="mb-6 size-24 items-center justify-center rounded-full bg-background-0">
        <Icon as={ReceiptIcon} size="xl" className="text-gray-600 dark:text-gray-400" />
      </View>

      <Text className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-white">{t('order.noOrdersYet')}</Text>

      <Text className="text-center text-base leading-6 text-gray-600 dark:text-gray-400">{t('order.noOrdersYetDesc')}</Text>
    </View>
  );
}
