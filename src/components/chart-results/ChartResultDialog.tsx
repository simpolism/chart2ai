import React, { useState, useEffect } from 'react';
import { View, ScrollView, Share, Modal } from 'react-native';
import { Text, Button, Card, Checkbox } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { useAppTheme } from '../../theme';
import { usePlatformInfo } from '../../utils/platform';
import { ChartFormData } from '../../types';
import { trackEvent } from '../../utils/metrics';
import ShareInstructionsSection from './ShareInstructionsSection';
import ChartSummarySection from './ChartSummarySection';

interface ChartResultDialogProps {
  visible: boolean;
  onDismiss: () => void;
  displayText: string;
  formData: ChartFormData;
  onCopySuccess?: () => void;
  onCopyError?: () => void;
  onShareError?: () => void;
}

const ChartResultDialog: React.FC<ChartResultDialogProps> = ({
  visible,
  onDismiss,
  displayText,
  formData,
  onCopySuccess,
  onCopyError,
  onShareError,
}) => {
  const appTheme = useAppTheme();
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Detect if we're on desktop browser (vs mobile browser)
  const platformInfo = usePlatformInfo();
  const isDesktopBrowser =
    platformInfo.isDesktop &&
    !('ontouchstart' in (typeof window !== 'undefined' ? window : {}));

  // Clear copy feedback after 2 seconds
  useEffect(() => {
    if (copyFeedback) {
      const timer = setTimeout(() => {
        setCopyFeedback(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copyFeedback]);

  const handleCopyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(displayText);
      setCopyFeedback(true);
      trackEvent('chart_export', {
        export_type: 'copy',
        success: true,
      });
      onCopySuccess?.();
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      trackEvent('chart_export', {
        export_type: 'copy',
        success: false,
      });
      onCopyError?.();
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: displayText,
        title: 'Astrological Chart Analysis',
      });
      trackEvent('chart_export', {
        export_type: 'share',
        success: true,
      });
    } catch (error) {
      console.error('Failed to share chart data:', error);
      trackEvent('chart_export', {
        export_type: 'share',
        success: false,
      });
      onShareError?.();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: appTheme.app.colors.surfaceContainer,
            borderRadius: appTheme.app.effects.borderRadius,
            borderWidth: appTheme.app.effects.borderWidth,
            borderColor: appTheme.app.colors.border,
            width: '100%',
            maxHeight: '80%', //platformInfo.isWeb ? 650 : '80%',
            shadowColor: appTheme.app.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            ...(platformInfo.isWeb && {
              maxWidth: 800,
              width: '90%',
              boxShadow: `0 0 20px ${appTheme.app.effects.glow}`,
            }),
          }}
        >
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 16,
              borderBottomWidth: appTheme.app.effects.borderWidth,
              borderBottomColor: appTheme.app.colors.border,
            }}
          >
            <Text style={appTheme.getHeaderStyle('medium')}>
              Chart Analysis Ready
            </Text>
          </View>

          {/* Content */}
          <ScrollView
            style={{
              flexGrow: 0,
              maxHeight: platformInfo.isWeb ? 500 : 450,
            }}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 16,
              paddingBottom: 16,
            }}
            showsVerticalScrollIndicator={!platformInfo.isWeb}
          >
            {/* Collapsible Share Instructions */}
            <ShareInstructionsSection />

            {/* Tip for long prompts when not using simple sensitivity */}
            {formData.orbSensitivity !== 'simple' && (
              <Card
                style={{
                  marginBottom: 16,
                  backgroundColor: `${appTheme.app.colors.primary}15`,
                  borderWidth: 1,
                  borderColor: `${appTheme.app.colors.primary}30`,
                }}
              >
                <Card.Content style={{ paddingVertical: 12 }}>
                  <Text
                    style={{
                      color: appTheme.app.colors.primary,
                      fontSize: 13,
                      lineHeight: 18,
                    }}
                  >
                    💡 <Text style={{ fontWeight: '500' }}>Tip:</Text> If your
                    prompt is too long for your AI assistant, try setting Orb
                    Sensitivity to "Simple" in Reading Settings for a more
                    concise prompt.
                  </Text>
                </Card.Content>
              </Card>
            )}

            {/* Collapsible Summary Information */}
            <ChartSummarySection formData={formData} />
          </ScrollView>

          {/* Actions */}
          <View
            style={{
              paddingHorizontal: 24,
              paddingBottom: 24,
              paddingTop: 16,
              borderTopWidth: appTheme.app.effects.borderWidth,
              borderTopColor: appTheme.app.colors.border,
            }}
          >
            {/* Main Action Button */}
            <Button
              mode="contained"
              onPress={isDesktopBrowser ? handleCopyToClipboard : handleShare}
              style={{
                marginBottom: 12,
                paddingVertical: 8,
                ...(copyFeedback &&
                  isDesktopBrowser && {
                    backgroundColor: appTheme.app.colors.primary,
                  }),
              }}
              contentStyle={{
                paddingVertical: 8,
              }}
              labelStyle={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1a0d2e',
              }}
              icon={
                copyFeedback && isDesktopBrowser
                  ? 'check'
                  : isDesktopBrowser
                    ? 'content-copy'
                    : 'share-variant'
              }
            >
              {copyFeedback && isDesktopBrowser
                ? 'Copied!'
                : isDesktopBrowser
                  ? 'Copy Analysis'
                  : 'Share with AI Assistant'}
            </Button>

            {/* Secondary Actions */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: isDesktopBrowser ? 'center' : 'space-between',
                gap: 8,
              }}
            >
              {!isDesktopBrowser && (
                <Button
                  mode="text"
                  onPress={handleCopyToClipboard}
                  compact
                  labelStyle={{
                    fontSize: 12,
                    color: copyFeedback
                      ? appTheme.app.colors.primary
                      : appTheme.app.colors.primary,
                  }}
                  icon={copyFeedback ? 'check' : undefined}
                >
                  {copyFeedback ? 'Copied!' : 'Copy'}
                </Button>
              )}
              <Button
                mode="text"
                onPress={onDismiss}
                compact
                labelStyle={{
                  fontSize: 12,
                  color: appTheme.app.colors.primary,
                }}
              >
                Close
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ChartResultDialog;
