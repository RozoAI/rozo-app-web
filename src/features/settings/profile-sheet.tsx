import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { CameraIcon } from 'lucide-react-native';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Keyboard } from 'react-native';

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { VStack } from '@/components/ui/vstack';
import { showToast } from '@/lib';
import { useApp } from '@/providers/app.provider';
import { useUpdateProfile } from '@/resources/api';
import { type UpdateMerchantProfile, UpdateMerchantProfileSchema } from '@/resources/schema/merchant';

// Define the ProfileSheet ref interface
export type ProfileSheetRefType = {
  open: () => void;
  close: () => void;
};

// Define the form schema using Zod
export const ProfileSheet = forwardRef<ProfileSheetRefType>((_, ref) => {
  const { merchant, setMerchant } = useApp();
  const { t } = useTranslation();

  const { mutateAsync: updateProfile } = useUpdateProfile();

  const [isOpen, setIsOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(merchant?.logo_url || null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
  } = useForm<UpdateMerchantProfile>({
    resolver: zodResolver(UpdateMerchantProfileSchema),
    defaultValues: {
      display_name: merchant?.display_name || '',
      email: merchant?.email || '',
    },
  });

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarPreview(result.assets[0].uri);
      setAvatarBase64(result.assets[0].uri);
    }
  }

  const onSubmit = async (data: UpdateMerchantProfile) => {
    Keyboard.dismiss();
    setIsSubmitting(true);

    updateProfile({
      ...data,
      logo: avatarBase64,
    })
      .then((res) => {
        setAvatarBase64(null);
        setAvatarPreview(res.logo_url);

        setMerchant(res);
        setIsOpen(false); // Close sheet after successful update
      })
      .catch((err) => {
        showToast({
          message: err.message,
          type: 'danger',
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    open: () => {
      setIsOpen(true);
      // Reset form values when opened
      setValue('display_name', merchant?.display_name || '');
      setValue('email', merchant?.email || '');
      setAvatarBase64(null);
      setAvatarPreview(merchant?.logo_url || null);
    },
    close: () => {
      setIsOpen(false);
    },
  }));

  return (
    <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ActionsheetBackdrop />

      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <VStack className="w-full" space="lg">
          <Box className="items-center">
            <Heading size="lg" className="text-typography-950">
              {t('profile.title')}
            </Heading>
          </Box>
          <VStack space="lg">
            {/* Avatar Section */}
            <VStack className="items-center justify-center">
              <Pressable onPress={pickImage} className="relative">
                <Avatar size="xl">
                  {avatarPreview ? (
                    <AvatarImage source={{ uri: avatarPreview }} alt="Profile" />
                  ) : (
                    <AvatarFallbackText>{merchant?.display_name?.slice(0, 2) || '-'}</AvatarFallbackText>
                  )}
                </Avatar>

                <Box className="absolute bottom-0 right-0 rounded-full bg-white p-1.5">
                  <Icon as={CameraIcon} size="lg" />
                </Box>
              </Pressable>
            </VStack>

            <VStack space="md">
              <Controller
                control={control}
                name="display_name"
                render={({ field: { onChange, value } }) => (
                  <FormControl isInvalid={!!errors.display_name}>
                    <FormControlLabel>
                      <FormControlLabelText size="sm">{t('profile.displayName')}</FormControlLabelText>
                    </FormControlLabel>
                    <Input className="rounded-xl" isInvalid={!!errors.display_name}>
                      <InputField
                        placeholder={t('profile.placeholder.displayName')}
                        value={value}
                        onChangeText={onChange}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </Input>
                    {errors.display_name && (
                      <FormControlError>
                        <FormControlErrorText>{errors.display_name.message}</FormControlErrorText>
                      </FormControlError>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <FormControl isInvalid={!!errors.email}>
                    <FormControlLabel>
                      <FormControlLabelText size="sm">{t('profile.email')}</FormControlLabelText>
                    </FormControlLabel>
                    <Input className="rounded-xl" isDisabled={true} isReadOnly={true}>
                      <InputField
                        placeholder={t('profile.placeholder.email')}
                        value={value}
                        onChangeText={onChange}
                        autoCapitalize="none"
                        autoCorrect={false}
                        readOnly
                        keyboardType="email-address"
                      />
                    </Input>
                  </FormControl>
                )}
              />
            </VStack>
          </VStack>

          <HStack space="sm" className="grid grid-rows-2">
            <Button
              onPress={handleSubmit(onSubmit)}
              isDisabled={isSubmitting || !isValid || (!isDirty && !avatarBase64)}
              className="w-full rounded-xl"
            >
              {isSubmitting && <ButtonSpinner />}
              <ButtonText>{isSubmitting ? t('general.updating') : t('general.update')}</ButtonText>
            </Button>
            <Button onPress={() => setIsOpen(false)} isDisabled={isSubmitting} className="w-full rounded-xl" variant="link">
              <ButtonText>{t('general.cancel')}</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </ActionsheetContent>
    </Actionsheet>
  );
});
