import React from 'react';
import { Platform } from 'react-native';
import { Dialog, Text, ActivityIndicator } from 'react-native-paper';
import ResponsiveDialog from '../shared/ResponsiveDialog';
import { useAppTheme } from '../../theme';

interface LoadingDialogProps {
  visible: boolean;
}

const LoadingDialog: React.FC<LoadingDialogProps> = ({ visible }) => {
  const appTheme = useAppTheme();

  return (
    <ResponsiveDialog
      visible={visible}
      dismissable={false}
      onDismiss={() => {}}
    >
      <Dialog.Content
        style={{
          alignItems: 'center' as const,
          paddingVertical: 32,
          paddingHorizontal: 24,
        }}
      >
        <ActivityIndicator size="large" style={{ marginBottom: 16 }} />
        <Text
          style={{
            fontSize: 16,
            textAlign: 'center' as const,
            marginBottom: 8,
            color: appTheme.app.colors.onSurface,
          }}
        >
          Calculating chart data...
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: appTheme.app.colors.disabled,
            textAlign: 'center' as const,
          }}
        >
          This may take a few moments
        </Text>
      </Dialog.Content>
    </ResponsiveDialog>
  );
};

export default LoadingDialog;
