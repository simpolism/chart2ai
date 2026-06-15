import React from 'react';
import { Modal, TouchableOpacity, View, ScrollView } from 'react-native';
import { Dialog } from 'react-native-paper';
import { useAppTheme } from '../../theme';
import { usePlatformInfo } from '../../utils/platform';

interface ResponsiveDialogProps {
  children: React.ReactNode;
  visible: boolean;
  onDismiss: () => void;
  dismissable?: boolean;
  style?: any;
}

interface ScrollableContentProps {
  children: React.ReactNode;
  style?: any;
}

interface FixedActionsProps {
  children: React.ReactNode;
  style?: any;
}

// Scrollable content wrapper for dialog body
export const ScrollableContent: React.FC<ScrollableContentProps> = ({
  children,
  style,
}) => {
  const theme = useAppTheme();
  const platformInfo = usePlatformInfo();

  // Scale max height based on screen size
  const getMaxHeight = () => {
    const screenHeight = platformInfo.screenHeight;

    // For very small screens (like iPhone 13 mini at 812px), use smaller height
    if (screenHeight <= 850) {
      return Math.min(300, screenHeight * 0.4);
    }
    // For small screens (iPhone standard size ~844-926px), use moderate height
    if (screenHeight <= 950) {
      return Math.min(350, screenHeight * 0.45);
    }
    // For larger screens, use the original 400px or 50% of screen height
    return Math.min(400, screenHeight * 0.5);
  };

  return (
    <View
      style={[
        {
          maxHeight: getMaxHeight(),
          minHeight: 0,
          backgroundColor: theme.app.colors.surfaceContainer,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={true}
        bounces={false}
        style={{ backgroundColor: theme.app.colors.surfaceContainer }}
      >
        {children}
      </ScrollView>
    </View>
  );
};

// Fixed actions wrapper for dialog buttons
export const FixedActions: React.FC<FixedActionsProps> = ({
  children,
  style,
}) => {
  const theme = useAppTheme();

  return (
    <View
      style={[
        {
          paddingVertical: 16,
          paddingHorizontal: 16,
          borderTopWidth: 1,
          borderTopColor: theme.app.colors.border,
          backgroundColor: theme.app.colors.surfaceContainer,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const ResponsiveDialog: React.FC<ResponsiveDialogProps> = ({
  children,
  visible,
  onDismiss,
  dismissable = true,
  style,
  ...props
}) => {
  const theme = useAppTheme();
  const platformInfo = usePlatformInfo();

  // Use Modal for web to fix viewport positioning (both mobile and desktop)
  if (platformInfo.isWeb) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={dismissable ? onDismiss : undefined}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: platformInfo.isDesktop ? 40 : 20,
          }}
          activeOpacity={1}
          onPress={dismissable ? onDismiss : undefined}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              theme.getDialogStyle(),
              {
                backgroundColor: theme.app.colors.surfaceContainer,
                borderRadius: theme.app.effects.borderRadius,
                shadowColor: theme.app.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                maxHeight: platformInfo.isDesktop ? '85%' : '80%',
                width: '100%',
                maxWidth: platformInfo.isDesktop ? 600 : 500,
                ...(platformInfo.isWeb && {
                  boxShadow: `0 0 20px ${theme.app.colors.primary}30`,
                }),
              },
              style,
            ]}
          >
            {children}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }

  return (
    <Dialog
      visible={visible}
      onDismiss={onDismiss}
      dismissable={dismissable}
      style={[theme.getDialogStyle(), style]}
      {...props}
    >
      {children}
    </Dialog>
  );
};

export default ResponsiveDialog;
