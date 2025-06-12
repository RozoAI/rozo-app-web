import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useApp } from '@/providers/app.provider';

export function AccountSection() {
  const { merchant } = useApp();

  return (
    <VStack space="sm">
      <Box className="flex-row items-center">
        <Avatar className="mr-3">
          <AvatarFallbackText>RZ</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: merchant?.logo_url || undefined,
            }}
            alt="image"
          />
        </Avatar>
        <VStack>
          <Heading size="sm" className="mb-1">
            {merchant?.display_name ?? '-'}
          </Heading>
          <Text size="sm">{merchant?.email ?? '-'}</Text>
        </VStack>
      </Box>
    </VStack>
  );
}
