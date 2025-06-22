import React from 'react';
import { useState } from 'react';

import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { ChevronRightIcon, Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ProfileSheet } from '@/features/settings/profile-sheet';
import { useApp } from '@/providers/app.provider';

export function AccountSection() {
  const { merchant } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <VStack space="sm" className="w-full">
      <Pressable onPress={() => setSheetOpen(true)} className="flex flex-row items-center justify-between">
        <Box className="flex-row items-center">
          <Avatar className="mr-2" size="sm">
            <AvatarFallbackText>{merchant?.display_name?.slice(0, 2) || '-'}</AvatarFallbackText>
            <AvatarImage
              source={{
                uri: merchant?.logo_url || undefined,
              }}
              alt="image"
            />
          </Avatar>
          <Box className="flex flex-col">
            <Heading size="sm">{merchant?.display_name ?? '-'}</Heading>
            {merchant?.display_name !== merchant?.email && (
              <Text size="xs" className="text-typography-500">
                {merchant?.email ?? '-'}
              </Text>
            )}
          </Box>
        </Box>
        <Icon as={ChevronRightIcon} className="text-gray-400 dark:text-gray-50" />
      </Pressable>

      <ProfileSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </VStack>
  );
}
