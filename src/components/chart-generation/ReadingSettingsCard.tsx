import React, { useState } from 'react';
import { View } from 'react-native';
import { Text, Button, Menu, HelperText, Card } from 'react-native-paper';
import { usePlatformInfo } from '../../utils/platform';
import { useAppTheme } from '../../theme';
import { OrbSensitivity } from '../../types';

interface ReadingSettingsCardProps {
  readingVoice: string;
  onReadingVoiceChange: (value: string) => void;
  orbSensitivity: OrbSensitivity;
  onOrbSensitivityChange: (value: OrbSensitivity) => void;
}

const READING_VOICES = [
  {
    value: 'standard',
    label: 'Standard',
    description: 'Accessible and warm with practical insights',
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Technical analysis for serious practitioners',
  },
  {
    value: 'mystical',
    label: 'Mystical',
    description: 'Poetic oracle with spiritual depth',
  },
  { value: 'none', label: 'None', description: 'Omit all stylistic guidance' },
];

const ORB_SENSITIVITY_OPTIONS = [
  {
    value: 'simple' as OrbSensitivity,
    label: 'Simple',
    description: 'Use fewer tokens',
  },
  {
    value: 'tight' as OrbSensitivity,
    label: 'Tight',
    description: 'Core themes only',
  },
  {
    value: 'balanced' as OrbSensitivity,
    label: 'Balanced',
    description: 'Complete picture',
  },
  {
    value: 'wide' as OrbSensitivity,
    label: 'Wide',
    description: 'Subtle connections',
  },
];

const ReadingSettingsCard: React.FC<ReadingSettingsCardProps> = ({
  readingVoice,
  onReadingVoiceChange,
  orbSensitivity,
  onOrbSensitivityChange,
}) => {
  const theme = useAppTheme();
  const [readingVoiceMenuVisible, setReadingVoiceMenuVisible] = useState(false);
  const [orbSensitivityMenuVisible, setOrbSensitivityMenuVisible] =
    useState(false);

  // Get platform info for responsive design
  const platformInfo = usePlatformInfo();
  const { isDesktop, screenWidth } = platformInfo;

  // Responsive widths
  const menuWidth = isDesktop ? 450 : Math.min(screenWidth - 32, 380);
  const itemWidth = menuWidth - 10;
  const textWidth = itemWidth - 24;

  return (
    <Card style={theme.getCardStyle()}>
      <Card.Content>
        <Text
          style={[
            theme.getHeaderStyle('medium'),
            { marginBottom: 16, fontWeight: 'bold' },
          ]}
        >
          Reading Settings
        </Text>

        {/* Voice Section */}
        <Text
          style={[
            theme.getTextStyle('body'),
            { marginBottom: 8, fontWeight: '600' },
          ]}
        >
          Voice
        </Text>
        <View style={{ marginBottom: 8 }}>
          <Menu
            visible={readingVoiceMenuVisible}
            onDismiss={() => setReadingVoiceMenuVisible(false)}
            contentStyle={{
              minWidth: menuWidth,
              width: menuWidth,
              backgroundColor: theme.app.colors.surfaceContainer,
              borderRadius: theme.app.effects.borderRadius,
              borderWidth: 1,
              borderColor: theme.app.colors.border,
              elevation: 8,
              shadowColor: theme.app.colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setReadingVoiceMenuVisible(true)}
                style={[
                  theme.getButtonStyle('outlined'),
                  {
                    width: '100%',
                    justifyContent: 'flex-start',
                    paddingHorizontal: 16,
                    alignSelf: 'stretch',
                  },
                ]}
                labelStyle={{
                  fontWeight: 'bold',
                }}
              >
                {READING_VOICES.find(r => r.value === readingVoice)?.label}
              </Button>
            }
          >
            {READING_VOICES.map(voice => (
              <Menu.Item
                key={voice.value}
                onPress={() => {
                  onReadingVoiceChange(voice.value);
                  setReadingVoiceMenuVisible(false);
                }}
                title={`${voice.label} - ${voice.description}`}
                titleStyle={{
                  color: theme.app.colors.onSurface,
                  fontSize: 14,
                  textAlign: 'left',
                  flexWrap: 'wrap',
                  ...(platformInfo.isWeb
                    ? {
                        width: textWidth,
                        minWidth: textWidth,
                        whiteSpace: isDesktop ? 'nowrap' : 'normal',
                      }
                    : {
                        width: '100%',
                      }),
                }}
                style={{
                  minHeight: platformInfo.isNative ? 56 : 48,
                  paddingHorizontal: 12,
                  ...(platformInfo.isWeb
                    ? {
                        width: itemWidth,
                        minWidth: itemWidth,
                      }
                    : {
                        width: '100%',
                        maxWidth: '100%',
                      }),
                }}
              />
            ))}
          </Menu>
        </View>

        <HelperText type="info" style={{ marginTop: 0, marginBottom: 24 }}>
          Choose the tone and style for your astrological interpretation.
        </HelperText>

        {/* Orb Sensitivity Section */}
        <Text
          style={[
            theme.getTextStyle('body'),
            { marginBottom: 8, fontWeight: '600' },
          ]}
        >
          Sensitivity
        </Text>
        <Menu
          visible={orbSensitivityMenuVisible}
          onDismiss={() => setOrbSensitivityMenuVisible(false)}
          contentStyle={{
            backgroundColor: theme.app.colors.surfaceContainer,
            borderRadius: theme.app.effects.borderRadius,
            borderWidth: 1,
            borderColor: theme.app.colors.border,
            elevation: 8,
            shadowColor: theme.app.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setOrbSensitivityMenuVisible(true)}
              style={[
                theme.getButtonStyle('outlined'),
                {
                  width: '100%',
                  justifyContent: 'flex-start',
                  paddingHorizontal: 16,
                  alignSelf: 'stretch',
                  marginBottom: 8,
                },
              ]}
              labelStyle={{
                fontWeight: 'bold',
              }}
            >
              {
                ORB_SENSITIVITY_OPTIONS.find(o => o.value === orbSensitivity)
                  ?.label
              }
            </Button>
          }
        >
          {ORB_SENSITIVITY_OPTIONS.map(option => (
            <Menu.Item
              key={option.value}
              onPress={() => {
                onOrbSensitivityChange(option.value);
                setOrbSensitivityMenuVisible(false);
              }}
              title={`${option.label} - ${option.description}`}
              titleStyle={{ color: theme.app.colors.onSurface }}
            />
          ))}
        </Menu>

        <HelperText type="info" style={{ marginTop: 0 }}>
          Controls aspect calculation sensitivity for LLM interpretation
        </HelperText>
      </Card.Content>
    </Card>
  );
};

export default ReadingSettingsCard;
