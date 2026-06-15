import React, { useState, useEffect } from 'react';
import { View, Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDateToYMD, parseDateFromYMD } from '../../utils/dateUtils';
import {
  formatTimeToHM,
  parseTimeFromHMS,
  formatTimeToAMPM,
} from '../../utils/timeUtils';
import { useAppTheme } from '../../theme';
import { usePlatformInfo } from '../../utils/platform';
import MobileWebDatePicker from './MobileWebDatePicker';
import MobileWebTimePicker from './MobileWebTimePicker';

interface DateTimeInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  mode: 'date' | 'time';
  icon: string;
  unknownTime?: boolean;
  onUnknownTimeChange?: (value: boolean) => void;
}

const DateTimeInput: React.FC<DateTimeInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  disabled = false,
  error,
  mode,
  icon,
  unknownTime,
  onUnknownTimeChange,
}) => {
  const theme = useAppTheme();
  const platformInfo = usePlatformInfo();
  const [showPicker, setShowPicker] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handlePickerPress = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };

  const handlePickerChange = (_: unknown, selectedValue?: Date) => {
    setShowPicker(false);
    if (selectedValue) {
      if (mode === 'date') {
        onChangeText(formatDateToYMD(selectedValue));
      } else {
        onChangeText(formatTimeToHM(selectedValue));
      }
    }
  };

  const getPickerValue = (): Date => {
    if (mode === 'date') {
      return value ? parseDateFromYMD(value) : new Date();
    } else {
      return value ? parseTimeFromHMS(value) : new Date();
    }
  };

  // Inject CSS to hide native HTML5 date/time picker controls
  useEffect(() => {
    if (platformInfo.isWeb) {
      const styleId = 'datetime-input-hide-native-controls';

      // Check if style already exists
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          input[type="date"]::-webkit-calendar-picker-indicator,
          input[type="time"]::-webkit-calendar-picker-indicator {
            display: none !important;
            -webkit-appearance: none !important;
          }
          input[type="date"]::-webkit-inner-spin-button,
          input[type="time"]::-webkit-inner-spin-button {
            display: none !important;
            -webkit-appearance: none !important;
          }
          input[type="date"]::-webkit-clear-button,
          input[type="time"]::-webkit-clear-button {
            display: none !important;
            -webkit-appearance: none !important;
          }
          input[type="time"]::placeholder {
            color: ${theme.app.colors.onSurfaceVariant} !important;
            opacity: 1 !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, [platformInfo.isWeb]);

  // Custom picker render function for mobile platforms
  const renderCustomInput = () => {
    const { isDesktop, isMobileWeb, isNative } = platformInfo;

    // Use custom date picker for mobile web and native platforms
    if ((isMobileWeb || isNative) && mode === 'date') {
      return (
        <MobileWebDatePicker
          value={value}
          onChange={onChangeText}
          disabled={disabled}
          minYear={1800}
          maxYear={2100}
        />
      );
    }

    // Use custom time picker for mobile web and native platforms
    if ((isMobileWeb || isNative) && mode === 'time') {
      return (
        <MobileWebTimePicker
          value={value}
          onChange={onChangeText}
          disabled={disabled}
          unknownTime={unknownTime}
          onUnknownTimeChange={onUnknownTimeChange}
        />
      );
    }

    // Use HTML5 inputs for desktop web inputs
    return (
      <input
        type={mode}
        value={value === 'Unknown' ? '' : isDesktop ? localValue : value}
        placeholder={value === 'Unknown' ? '--:--' : undefined}
        onChange={e => {
          if (isDesktop) {
            setLocalValue(e.target.value);
          } else {
            onChangeText(e.target.value);
          }
        }}
        onBlur={isDesktop ? e => onChangeText(e.target.value) : undefined}
        onKeyDown={e => {
          // Prevent Alt+Down from opening native picker
          if (e.altKey && e.key === 'ArrowDown') {
            e.preventDefault();
          }
        }}
        onClick={e => {
          // Prevent click from opening native picker
          e.preventDefault();
          e.stopPropagation();
        }}
        disabled={disabled}
        style={{
          backgroundColor: 'transparent',
          color: disabled
            ? theme.app.colors.disabled
            : value === 'Unknown'
              ? theme.app.colors.onSurfaceVariant
              : theme.app.colors.onSurface,
          borderWidth: 0,
          width: '100%',
          padding: '16px 12px',
          fontSize: 16,
          colorScheme: 'dark',
          accentColor: theme.app.colors.primary,
          boxSizing: 'border-box',
        }}
        {...(mode === 'date' && {
          min: '0000-01-01',
          max: '2999-12-31',
        })}
      />
    );
  };

  return (
    <View>
      <TextInput
        label={
          platformInfo.isDesktop ? label : label.replace(' (MM/DD/YYYY)', '')
        }
        value={value}
        onChangeText={onChangeText}
        mode="outlined"
        style={[theme.getInputStyle(), { flex: 1, minWidth: 0 }]}
        disabled={disabled}
        error={!!error}
        theme={{
          colors: {
            onSurfaceVariant: theme.app.colors.onSurface,
            primary: theme.app.colors.primary,
            outline: theme.app.colors.border,
            onSurfaceDisabled: theme.app.colors.disabled,
          } as any,
          fonts: {
            bodyLarge: {
              maxWidth: 'none',
            } as any,
          },
        }}
        placeholder={placeholder}
        render={renderCustomInput}
      />

      {/* Legacy native picker only for desktop web when needed */}
      {usePlatformInfo().isDesktop && showPicker ? (
        <DateTimePicker
          value={getPickerValue()}
          mode={mode}
          display={'default'}
          onChange={handlePickerChange}
          {...(mode === 'date' && {
            minimumDate: new Date('1900-01-01'),
            maximumDate: new Date('2100-12-31'),
          })}
        />
      ) : null}
    </View>
  );
};

export default DateTimeInput;
