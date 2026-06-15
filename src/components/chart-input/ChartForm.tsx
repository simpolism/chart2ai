import React from 'react';
import { View } from 'react-native';
import {
  TextInput,
  Switch,
  Text,
  HelperText,
  IconButton,
  RadioButton,
  TouchableRipple,
} from 'react-native-paper';
import { ChartData } from '../../types';
import { ChartValidationErrors } from '../../utils/chartValidation';
import LocationAutocomplete from './LocationAutocomplete';
import DateTimeInput from './DateTimeInput';
import { formatDateToYMD, parseDateFromYMD } from '../../utils/dateUtils';
import { useAppTheme } from '../../theme';
import { usePlatformInfo } from '../../utils/platform';

interface ChartFormProps {
  chart: ChartData;
  onUpdate: (updates: Partial<ChartData>) => void;
  errors?: ChartValidationErrors;
  showQuickSelect?: boolean;
  onQuickSelectPress?: () => void;
  showRemove?: boolean;
  onRemove?: () => void;
  title?: string;
}

const ChartForm: React.FC<ChartFormProps> = ({
  chart,
  onUpdate,
  errors = {},
  showQuickSelect = false,
  onQuickSelectPress,
  showRemove = false,
  onRemove,
  title,
}) => {
  const theme = useAppTheme();
  const platformInfo = usePlatformInfo();

  return (
    <View>
      {/* Header with title and optional remove button */}
      {title || showRemove ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          {title ? (
            <Text style={theme.getHeaderStyle('medium')}>{title}</Text>
          ) : null}
          {showRemove ? (
            <IconButton
              icon="close"
              iconColor={theme.app.colors.error}
              size={20}
              onPress={onRemove}
            />
          ) : null}
        </View>
      ) : null}

      {/* Name Input */}
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <TextInput
            label="Name"
            value={chart.name || ''}
            onChangeText={text => onUpdate({ name: text })}
            mode="outlined"
            style={[theme.getInputStyle(), { flex: 1 }]}
            theme={{
              colors: { onSurfaceVariant: theme.app.colors.onSurface },
            }}
            error={!!errors.name}
          />
          {showQuickSelect ? (
            <IconButton
              icon="account"
              iconColor={theme.getIconColor('primary')}
              size={24}
              onPress={onQuickSelectPress}
              style={theme.getIconButtonStyle()}
            />
          ) : null}
        </View>
        <HelperText type="error" visible={!!errors.name}>
          {errors.name}
        </HelperText>
      </View>

      {/* Gender Selection */}
      <View style={{ marginBottom: 12 }}>
        <Text style={[theme.getTextStyle('body'), { marginBottom: 8 }]}>
          Gender
        </Text>
        <RadioButton.Group
          onValueChange={value =>
            onUpdate({ personGender: value as 'male' | 'female' | 'other' })
          }
          value={chart.personGender || ''}
        >
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <TouchableRipple
              onPress={() => onUpdate({ personGender: 'male' })}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <>
                <RadioButton value="male" />
                <Text style={theme.getTextStyle('body')}>Male</Text>
              </>
            </TouchableRipple>
            <TouchableRipple
              onPress={() => onUpdate({ personGender: 'female' })}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <>
                <RadioButton value="female" />
                <Text style={theme.getTextStyle('body')}>Female</Text>
              </>
            </TouchableRipple>
            <TouchableRipple
              onPress={() => onUpdate({ personGender: 'other' })}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <>
                <RadioButton value="other" />
                <Text style={theme.getTextStyle('body')}>Other</Text>
              </>
            </TouchableRipple>
          </View>
        </RadioButton.Group>
        <HelperText type="error" visible={!!errors?.personGender}>
          {errors?.personGender}
        </HelperText>
      </View>

      {/* Date Input */}
      <View style={{ marginBottom: 12 }}>
        <DateTimeInput
          label="Birth Date (MM/DD/YYYY)"
          mode="date"
          icon="calendar"
          value={formatDateToYMD(chart.date)}
          onChangeText={text => {
            const newDate = parseDateFromYMD(text);
            if (!isNaN(newDate.getTime())) {
              onUpdate({ date: newDate });
            }
          }}
          placeholder="MM/DD/YYYY"
        />
      </View>

      {/* Time Input */}
      <View style={{ marginBottom: 12 }}>
        <DateTimeInput
          label="Birth Time"
          mode="time"
          icon="clock-outline"
          value={chart.unknownTime ? 'Unknown' : chart.time || '12:00'}
          onChangeText={text => {
            if (text !== 'Unknown') {
              onUpdate({ time: text, unknownTime: false });
            }
          }}
          placeholder={chart.unknownTime ? 'Unknown' : 'HH:MM'}
          disabled={false}
          error={errors.time}
          unknownTime={chart.unknownTime}
          onUnknownTimeChange={value => {
            if (value) {
              // Only set time to 12:00 when enabling unknown time
              onUpdate({
                unknownTime: value,
                time: '12:00',
              });
            } else {
              // When disabling unknown time, just update the flag
              // The time will be set by the onChange call
              onUpdate({
                unknownTime: value,
              });
            }
          }}
        />

        {/* Time Unknown Toggle - Desktop Only */}
        {platformInfo.isDesktop ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginTop: 16,
            }}
          >
            <Switch
              value={chart.unknownTime || false}
              onValueChange={value => {
                onUpdate({
                  unknownTime: value,
                  time: value ? '12:00' : chart.time || '12:00',
                });
              }}
              {...theme.getSwitchProps()}
            />
            <Text style={theme.getTextStyle('body')}>Time Unknown?</Text>
          </View>
        ) : null}

        <HelperText type="error" visible={!!errors.time}>
          {errors.time}
        </HelperText>
      </View>

      {/* Location Input */}
      <View style={{ marginBottom: 12 }}>
        <LocationAutocomplete
          value={chart.location || ''}
          onSelectLocation={location => onUpdate({ location })}
          onChangeText={text => onUpdate({ location: text })}
          placeholder="Enter city, country"
          error={errors.location}
        />
      </View>
    </View>
  );
};

export default ChartForm;
