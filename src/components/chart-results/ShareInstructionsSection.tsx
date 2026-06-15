import React, { useState, useEffect } from 'react';
import { View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Text, IconButton, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../../theme';
import { usePlatformInfo } from '../../utils/platform';

interface ShareInstructionsSectionProps {
  // Remove props since we'll use the hook for responsiveness
}

const INSTRUCTIONS_COLLAPSED_KEY = '@chart2ai_instructions_collapsed';

const ShareInstructionsSection: React.FC<
  ShareInstructionsSectionProps
> = () => {
  const theme = useAppTheme();
  const platformInfo = usePlatformInfo();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Detect if we're on desktop browser (vs mobile browser) - responsive
  const isDesktopBrowser =
    platformInfo.isDesktop &&
    !('ontouchstart' in (typeof window !== 'undefined' ? window : {}));

  // Load collapsed state and selected tab from storage
  useEffect(() => {
    const loadState = async () => {
      try {
        const storedCollapsed = await AsyncStorage.getItem(
          INSTRUCTIONS_COLLAPSED_KEY
        );

        if (storedCollapsed !== null) {
          setIsCollapsed(JSON.parse(storedCollapsed));
        }

        // No longer need to manage tab state since we auto-detect
      } catch (error) {
        console.error('Failed to load instructions state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);

  // Save collapsed state to storage
  const toggleCollapsed = async () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);

    try {
      await AsyncStorage.setItem(
        INSTRUCTIONS_COLLAPSED_KEY,
        JSON.stringify(newState)
      );
    } catch (error) {
      console.error('Failed to save instructions collapsed state:', error);
    }
  };

  // Don't render until we've loaded the state
  if (isLoading) {
    return null;
  }

  const getStepText = () => {
    if (isDesktopBrowser) {
      return {
        title: 'How to Use with AI',
        step1: 'Hit copy button below',
        step2: 'Open ChatGPT, Claude, or other AI tool',
        step3: 'Paste the analysis for your reading',
      };
    } else {
      return {
        title: 'How to Share with AI',
        step1: 'Hit share button below',
        step2: 'Select ChatGPT, Claude, or other AI tool',
        step3: 'Send the prompt for your reading',
      };
    }
  };

  const stepText = getStepText();

  // Render iOS-specific instructions
  const renderIOSInstructions = () => (
    <View>
      {/* Step 1 */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={[
            theme.getTextStyle('body'),
            {
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 8,
              color: theme.app.colors.primary,
            },
          ]}
        >
          1. {stepText.step1}
        </Text>
      </View>

      {/* Step 2 */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={[
            theme.getTextStyle('body'),
            {
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 8,
              color: theme.app.colors.primary,
            },
          ]}
        >
          2. Tap "More" if ChatGPT isn't visible
        </Text>
        <Image
          source={require('../../../assets/images/iphone-more-button.jpg')}
          style={{
            width: '100%',
            height: 120,
            borderRadius: 8,
            marginBottom: 8,
          }}
          resizeMode="contain"
        />
        <Text
          style={[
            theme.getTextStyle('caption'),
            {
              fontSize: 12,
              color: theme.app.colors.onSurfaceVariant,
              fontStyle: 'italic',
              textAlign: 'center',
            },
          ]}
        >
          Scroll through your apps to the right in the share window and look for
          the ChatGPT icon, or use your preferred AI assistant. Look for the
          "More" button if your AI app isn't immediately visible
        </Text>
      </View>

      {/* Step 3 */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={[
            theme.getTextStyle('body'),
            {
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 8,
              color: theme.app.colors.primary,
            },
          ]}
        >
          3. Select ChatGPT from the list
        </Text>
        <Image
          source={require('../../../assets/images/iphone-more-chatgpt.jpg')}
          style={{
            width: '100%',
            height: 120,
            borderRadius: 8,
            marginBottom: 8,
          }}
          resizeMode="contain"
        />
        <Text
          style={[
            theme.getTextStyle('caption'),
            {
              fontSize: 12,
              color: theme.app.colors.onSurfaceVariant,
              fontStyle: 'italic',
              textAlign: 'center',
            },
          ]}
        >
          Tap ChatGPT or your preferred AI assistant
        </Text>
      </View>

      {/* Step 4 */}
      <View>
        <Text
          style={[
            theme.getTextStyle('body'),
            {
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 8,
              color: theme.app.colors.primary,
            },
          ]}
        >
          4. Send your chart prompt
        </Text>
        <Image
          source={require('../../../assets/images/iphone-send-chatgpt.jpg')}
          style={{
            width: '100%',
            height: 120,
            borderRadius: 8,
            marginBottom: 8,
          }}
          resizeMode="contain"
        />
        <Text
          style={[
            theme.getTextStyle('caption'),
            {
              fontSize: 12,
              color: theme.app.colors.onSurfaceVariant,
              fontStyle: 'italic',
              textAlign: 'center',
            },
          ]}
        >
          Tap send to start the reading!
        </Text>
      </View>
    </View>
  );

  // Render Android-specific instructions
  const renderAndroidInstructions = () => (
    <View>
      {/* Step 1 */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={[
            theme.getTextStyle('body'),
            {
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 8,
              color: theme.app.colors.primary,
            },
          ]}
        >
          1. {stepText.step1}
        </Text>
      </View>

      {/* Step 2 */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={[
            theme.getTextStyle('body'),
            {
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 8,
              color: theme.app.colors.primary,
            },
          ]}
        >
          2. Select ChatGPT from the share menu
        </Text>
        <Image
          source={require('../../../assets/images/android-share-chatgpt.png')}
          style={{
            width: '100%',
            height: 120,
            borderRadius: 8,
            marginBottom: 8,
          }}
          resizeMode="contain"
        />
        <Text
          style={[
            theme.getTextStyle('caption'),
            {
              fontSize: 12,
              color: theme.app.colors.onSurfaceVariant,
              fontStyle: 'italic',
              textAlign: 'center',
            },
          ]}
        >
          Scroll through your apps in the share window and look for the ChatGPT
          icon, or use your preferred AI assistant
        </Text>
      </View>

      {/* Step 3 */}
      <View>
        <Text
          style={[
            theme.getTextStyle('body'),
            {
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 8,
              color: theme.app.colors.primary,
            },
          ]}
        >
          3. Send your chart prompt
        </Text>
        <Image
          source={require('../../../assets/images/android-send-chatgpt.png')}
          style={{
            width: '100%',
            height: 100,
            borderRadius: 8,
            marginBottom: 8,
          }}
          resizeMode="contain"
        />
        <Text
          style={[
            theme.getTextStyle('caption'),
            {
              fontSize: 12,
              color: theme.app.colors.onSurfaceVariant,
              fontStyle: 'italic',
              textAlign: 'center',
            },
          ]}
        >
          Tap send to start the reading!
        </Text>
      </View>
    </View>
  );

  // Render Desktop-specific instructions
  const renderDesktopInstructions = () => (
    <View>
      {/* Step 1 */}
      <View style={{ marginBottom: 12 }}>
        <Text
          style={[
            theme.getTextStyle('body'),
            {
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 4,
              color: theme.app.colors.primary,
            },
          ]}
        >
          1. {stepText.step1}
        </Text>
      </View>

      {/* Step 2 */}
      <View style={{ marginBottom: 12 }}>
        <Text
          style={[
            theme.getTextStyle('body'),
            {
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 4,
              color: theme.app.colors.primary,
            },
          ]}
        >
          2. {stepText.step2}
        </Text>
      </View>

      {/* Step 3 */}
      <View>
        <Text
          style={[
            theme.getTextStyle('body'),
            {
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 4,
              color: theme.app.colors.primary,
            },
          ]}
        >
          3. {stepText.step3}
        </Text>
      </View>
    </View>
  );

  return (
    <View
      style={{
        marginBottom: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.app.colors.border,
      }}
    >
      <TouchableOpacity
        onPress={toggleCollapsed}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isCollapsed ? 0 : 16,
        }}
      >
        <Text
          style={[theme.getHeaderStyle('small'), { flex: 1, fontSize: 16 }]}
        >
          {stepText.title}
        </Text>
        <IconButton
          icon={isCollapsed ? 'chevron-down' : 'chevron-up'}
          size={20}
          iconColor={theme.getIconColor('primary')}
          onPress={toggleCollapsed}
          style={{ margin: 0 }}
        />
      </TouchableOpacity>

      {!isCollapsed && (
        <View>
          <Divider
            style={{
              marginBottom: 16,
              backgroundColor: theme.app.colors.outline,
            }}
          />

          {/* Content based on auto-detected platform */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {isDesktopBrowser
              ? renderDesktopInstructions()
              : platformInfo.isIOSDevice
                ? renderIOSInstructions()
                : renderAndroidInstructions()}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default ShareInstructionsSection;
