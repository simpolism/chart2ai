import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, Switch, Card, Button, HelperText } from 'react-native-paper';
import { TransitData } from '../../types';
import { formatDateToYMD, parseDateFromYMD } from '../../utils/dateUtils';
import { getCurrentLocation } from '../../utils/geocodingService';
import { useAppTheme } from '../../theme';
import LocationAutocomplete from '../chart-input/LocationAutocomplete';
import DateTimeInput from '../chart-input/DateTimeInput';

interface TransitAnalysisCardProps {
  enableTransit: boolean;
  transit?: TransitData;
  onEnableTransitChange: (enabled: boolean) => void;
  onTransitChange: (transit: TransitData) => void;
  error?: string;
}

const TransitAnalysisCard: React.FC<TransitAnalysisCardProps> = ({
  enableTransit,
  transit,
  onEnableTransitChange,
  onTransitChange,
  error,
}) => {
  const theme = useAppTheme();
  const [gpsLoading, setGpsLoading] = useState(false);

  const toggleTransit = () => {
    if (!enableTransit) {
      // When enabling transit, set date and time to current
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // Create a date in local timezone without string conversion to avoid UTC interpretation
      const localDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      onEnableTransitChange(true);
      onTransitChange({
        location: transit?.location || '',
        date: localDate,
        time: timeString,
      });
    } else {
      onEnableTransitChange(false);
    }
  };

  const handleSetToHere = async () => {
    setGpsLoading(true);
    try {
      const coords = await getCurrentLocation();
      const coordString = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
      onTransitChange({
        ...transit,
        location: coordString,
        date: transit?.date || new Date(),
        time: transit?.time || '12:00',
      });
    } catch (error) {
      console.error('Failed to get current location:', error);
    } finally {
      setGpsLoading(false);
    }
  };

  const updateTransit = (updates: Partial<TransitData>) => {
    onTransitChange({
      location: transit?.location || '',
      date: transit?.date || new Date(),
      time: transit?.time || '12:00',
      ...updates,
    });
  };

  return (
    <Card style={theme.getCardStyle()}>
      <TouchableOpacity onPress={toggleTransit} activeOpacity={0.7}>
        <Card.Content>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 16,
            }}
          >
            <Text style={theme.getHeaderStyle('medium')}>
              Enable Transit (Today's Planets)
            </Text>
            <Switch
              value={enableTransit}
              onValueChange={toggleTransit}
              {...theme.getSwitchProps()}
            />
          </View>
        </Card.Content>
      </TouchableOpacity>

      {enableTransit ? (
        <Card.Content style={{ paddingTop: 0 }}>
          <HelperText type="info" style={{ marginTop: -8, marginBottom: 16 }}>
            Compare the charts above with planetary positions at a specific date
            and time to see current influences and timing.
          </HelperText>
          <View style={{ marginBottom: 12 }}>
            <LocationAutocomplete
              value={transit?.location || ''}
              onSelectLocation={location => updateTransit({ location })}
              onChangeText={location => updateTransit({ location })}
              placeholder="Enter location for transit analysis"
              error={error}
              testID="location-input-transit"
            />
            <Button
              mode="outlined"
              onPress={handleSetToHere}
              loading={gpsLoading}
              disabled={gpsLoading}
              style={[theme.getButtonStyle('outlined'), { marginTop: 8 }]}
              icon="crosshairs-gps"
            >
              Set to Here
            </Button>
          </View>

          <View style={{ marginBottom: 12 }}>
            <DateTimeInput
              label="Date (MM/DD/YYYY)"
              mode="date"
              icon="calendar"
              value={formatDateToYMD(transit?.date || new Date())}
              onChangeText={text => {
                const newDate = parseDateFromYMD(text);
                if (!isNaN(newDate.getTime())) {
                  updateTransit({ date: newDate });
                }
              }}
              placeholder="MM/DD/YYYY"
            />
          </View>

          <View style={{ marginBottom: 12 }}>
            <DateTimeInput
              label="Time"
              mode="time"
              icon="clock-outline"
              value={transit?.time || '12:00'}
              onChangeText={text => updateTransit({ time: text })}
              placeholder="HH:MM"
            />
          </View>

          <View style={{ marginBottom: 12 }}>
            <Button
              mode="outlined"
              onPress={() => {
                const now = new Date();
                const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                // Create a date in local timezone without string conversion to avoid UTC interpretation
                const localDate = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate()
                );

                updateTransit({
                  date: localDate,
                  time: timeString,
                });
              }}
              style={[theme.getButtonStyle('outlined'), { marginTop: 8 }]}
              icon="clock-fast"
            >
              Set to Now
            </Button>
          </View>
        </Card.Content>
      ) : null}
    </Card>
  );
};

export default TransitAnalysisCard;
