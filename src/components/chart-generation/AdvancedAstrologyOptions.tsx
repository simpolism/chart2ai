import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import {
  Text,
  Button,
  Menu,
  IconButton,
  TextInput,
  Checkbox,
  HelperText,
} from 'react-native-paper';
import { useAppTheme } from '../../theme';
interface AdvancedAstrologyOptionsProps {
  houseSystem: string;
  onHouseSystemChange: (value: string) => void;
  skipOutOfSignAspects: boolean;
  onSkipOutOfSignAspectsChange: (value: boolean) => void;
  rawMode: boolean;
  onRawModeChange: (value: boolean) => void;
}

const HOUSE_SYSTEMS = [
  { value: 'W', label: 'Whole Sign' },
  { value: 'P', label: 'Placidus' },
  { value: 'E', label: 'Equal' },
  { value: 'O', label: 'Porphyry' },
];

const AdvancedAstrologyOptions: React.FC<AdvancedAstrologyOptionsProps> = ({
  houseSystem,
  onHouseSystemChange,
  skipOutOfSignAspects,
  onSkipOutOfSignAspectsChange,
  rawMode,
  onRawModeChange,
}) => {
  const theme = useAppTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [houseSystemMenuVisible, setHouseSystemMenuVisible] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View>
      <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.7}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: isExpanded ? 16 : 0,
          }}
        >
          <Text style={theme.getHeaderStyle('medium')}>
            Advanced Astrology Options
          </Text>
          <IconButton
            icon={isExpanded ? 'chevron-up' : 'chevron-down'}
            iconColor={theme.getIconColor('primary')}
            size={20}
            style={{ margin: 0, padding: 0 }}
            onPress={() => setIsExpanded(!isExpanded)}
          />
        </View>
      </TouchableOpacity>

      {isExpanded ? (
        <View>
          <HelperText type="info" style={{ marginTop: -8, marginBottom: 16 }}>
            Advanced settings for house systems and output format. Aspect
            filtering is now handled automatically based on chart count.
          </HelperText>
          <Text style={[theme.getTextStyle('body'), { marginBottom: 8 }]}>
            House System
          </Text>
          <Menu
            visible={houseSystemMenuVisible}
            onDismiss={() => setHouseSystemMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setHouseSystemMenuVisible(true)}
                style={[theme.getButtonStyle('outlined'), { marginBottom: 16 }]}
              >
                {HOUSE_SYSTEMS.find(h => h.value === houseSystem)?.label}
              </Button>
            }
          >
            {HOUSE_SYSTEMS.map(system => (
              <Menu.Item
                key={system.value}
                onPress={() => {
                  onHouseSystemChange(system.value);
                  setHouseSystemMenuVisible(false);
                }}
                title={system.label}
                titleStyle={{ color: theme.app.colors.onSurface }}
              />
            ))}
          </Menu>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 16,
            }}
          >
            <Checkbox
              status={skipOutOfSignAspects ? 'unchecked' : 'checked'}
              onPress={() =>
                onSkipOutOfSignAspectsChange(!skipOutOfSignAspects)
              }
              uncheckedColor={theme.app.colors.outline}
              color={theme.app.colors.primary}
            />
            <Text
              style={[theme.getTextStyle('body'), { marginLeft: 8, flex: 1 }]}
              onPress={() =>
                onSkipOutOfSignAspectsChange(!skipOutOfSignAspects)
              }
            >
              Include out-of-sign aspects
            </Text>
          </View>

          <Text
            style={[
              theme.getTextStyle('caption'),
              { marginTop: 4, color: theme.app.colors.onSurfaceVariant },
            ]}
          >
            When unchecked, omits aspects between planets in different zodiac
            signs
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 16,
            }}
          >
            <Checkbox
              status={rawMode ? 'checked' : 'unchecked'}
              onPress={() => onRawModeChange(!rawMode)}
              uncheckedColor={theme.app.colors.outline}
              color={theme.app.colors.primary}
            />
            <Text
              style={[theme.getTextStyle('body'), { marginLeft: 8, flex: 1 }]}
              onPress={() => onRawModeChange(!rawMode)}
            >
              Raw Mode (advanced users only)
            </Text>
          </View>

          <Text
            style={[
              theme.getTextStyle('caption'),
              { marginTop: 4, color: theme.app.colors.onSurfaceVariant },
            ]}
          >
            Only outputs raw chart2txt data without any prompts. Use only if you
            know what you're doing.
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default AdvancedAstrologyOptions;
