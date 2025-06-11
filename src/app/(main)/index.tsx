import React from 'react';
import { ScrollView } from 'react-native';

import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { FocusAwareStatusBar } from '@/components/ui/focus-aware-status-bar';
import { Heading } from '@/components/ui/heading';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export default function HomePage() {
  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView>
        <SafeAreaView className="flex-1">
          <Card className="m-3 max-w-[360px] rounded-lg p-5">
            <Text className="mb-2 text-sm font-normal text-typography-700">May 15, 2023</Text>
            <VStack className="mb-6">
              <Heading size="md" className="mb-4">
                The Power of Positive Thinking
              </Heading>
              <Text size="sm">
                Discover how the power of positive thinking can transform your life, boost your confidence, and help you
                overcome challenges. Explore practical tips and techniques to cultivate a positive mindset for greater
                happiness and success.
              </Text>
            </VStack>
            <Box className="flex-row">
              <Avatar className="mr-3">
                <AvatarFallbackText>RR</AvatarFallbackText>
                <AvatarImage
                  source={{
                    uri: 'https://gluestack.github.io/public-blog-video-assets/john.png',
                  }}
                  alt="image"
                />
              </Avatar>
              <VStack>
                <Heading size="sm" className="mb-1">
                  John Smith
                </Heading>
                <Text size="sm">Motivational Speaker</Text>
              </VStack>
            </Box>
          </Card>
        </SafeAreaView>
      </ScrollView>
    </>
  );
}
