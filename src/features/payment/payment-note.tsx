import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Textarea, TextareaInput } from '@/components/textarea';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { Button } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { VStack } from '@/components/ui/vstack';

type ActionSheetPaymentNoteProps = {
  isEdit?: boolean;
  value?: string;
  onAddNote?: (note: string) => void;
};

export function ActionSheetPaymentNote({
  isEdit = false,
  value,
  onAddNote,
}: ActionSheetPaymentNoteProps): React.ReactElement {
  const [note, setNote] = useState<string>(value || '');
  const [showActionsheet, setShowActionsheet] = useState<boolean>(false);
  const { t } = useTranslation();

  const noteInputRef = useRef<any>(null);

  // Callbacks
  const handleClose = useCallback(() => {
    setShowActionsheet(false);
  }, []);

  const handleOpen = useCallback(() => {
    setShowActionsheet(true);
    // Focus on input when opened
    setTimeout(() => {
      noteInputRef.current?.focus();
    }, 100);
  }, []);

  const handleOnCancelNote = useCallback(() => {
    setShowActionsheet(false);
    handleOnChangeNote('');
  }, []);

  const handleOnSubmitNote = useCallback(() => {
    const trimmedNote = note.trim();
    onAddNote?.(trimmedNote);
    handleClose();
  }, [note, onAddNote, handleClose]);

  const handleOnChangeNote = useCallback((text: string) => {
    setNote(text);
  }, []);

  return (
    <>
      <Button className="text-center underline underline-offset-1" variant="link" onPress={handleOpen}>
        {note ? `${t('general.note')}: ${note}` : t('general.addNote')}
      </Button>

      <Actionsheet isOpen={showActionsheet} onClose={handleClose} trapFocus={false}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <VStack space="md" className="w-full">
            <Text className="text-center text-lg font-semibold">{t('payment.notes.title')}</Text>

            <View className="space-y-2">
              <Textarea size="md" isReadOnly={false} className="rounded-xl">
                <TextareaInput
                  placeholder={t('payment.notes.enterNote')}
                  ref={noteInputRef}
                  value={note}
                  onChangeText={handleOnChangeNote}
                  onSubmitEditing={handleOnSubmitNote}
                  returnKeyType="done"
                />
              </Textarea>

              <HStack space="md" className="grid grid-cols-2">
                <Button className="w-full rounded-xl" variant="outline" onPress={isEdit ? handleClose : handleOnCancelNote}>
                  {isEdit ? 'Close' : 'Cancel'}
                </Button>
                <Button className="w-full rounded-xl text-white" onPress={handleOnSubmitNote}>
                  {t('general.submit')}
                </Button>
              </HStack>
            </View>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
