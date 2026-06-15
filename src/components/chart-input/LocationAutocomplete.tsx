import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { getLocationSuggestions } from '../../utils/geocodingService';
import { LocationSuggestion } from '../../types';
import { useAppTheme } from '../../theme';
import LocationModal from './LocationModal';

interface LocationAutocompleteProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectLocation: (location: string) => void;
  error?: string;
  placeholder?: string;
  label?: string;
  testID?: string;
}

const MIN_SEARCH_LENGTH = 3;
const DEBOUNCE_MS = 300;

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChangeText,
  onSelectLocation,
  error,
  placeholder = 'City, Country',
  label = 'Location',
  testID = 'location-input',
}) => {
  const theme = useAppTheme();
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalValue, setModalValue] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const searchId = useRef(0);

  const fetchSuggestions = async (searchText: string) => {
    if (searchText.trim().length < MIN_SEARCH_LENGTH) {
      setSuggestions([]);
      return;
    }

    const currentSearchId = ++searchId.current;
    setIsLoading(true);

    try {
      const results = await getLocationSuggestions(searchText);

      if (currentSearchId === searchId.current) {
        setSuggestions(results);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      if (currentSearchId === searchId.current) {
        setSuggestions([]);
      }
    } finally {
      if (currentSearchId === searchId.current) {
        setIsLoading(false);
      }
    }
  };

  const isCoordinateFormat = (text: string): boolean => {
    const coordPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
    return coordPattern.test(text.trim());
  };

  const handleModalOpen = () => {
    setModalValue(value);
    setModalVisible(true);
    setSuggestions([]);
  };

  const handleModalConfirm = () => {
    onSelectLocation(modalValue);
    setModalVisible(false);
    setSuggestions([]);
  };

  const handleModalCancel = () => {
    setModalValue(value);
    setModalVisible(false);
    setSuggestions([]);
  };

  const handleModalTextChange = (text: string) => {
    setModalValue(text);
    // Trigger suggestions for modal input
    if (text.trim().length >= MIN_SEARCH_LENGTH) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        fetchSuggestions(text);
      }, DEBOUNCE_MS);
    } else {
      setSuggestions([]);
    }
  };

  const handleModalSuggestionSelect = (suggestion: LocationSuggestion) => {
    setModalValue(suggestion.fullAddress);
    onSelectLocation(suggestion.fullAddress);
    setModalVisible(false);
    setSuggestions([]);
  };

  return (
    <View style={{ width: '100%', position: 'relative' }}>
      <TouchableOpacity
        onPress={handleModalOpen}
        style={{
          backgroundColor: 'transparent',
          width: '100%',
        }}
        activeOpacity={0.7}
      >
        <TextInput
          label={label}
          value={value}
          mode="outlined"
          placeholder={placeholder}
          error={!!error}
          style={[theme.getInputStyle(), { marginBottom: 8 }]}
          testID={testID}
          editable={false}
          pointerEvents="none"
          showSoftInputOnFocus={false}
          right={
            value ? (
              <TextInput.Icon
                icon="close"
                onPress={e => {
                  e.stopPropagation();
                  onChangeText('');
                  setSuggestions([]);
                }}
              />
            ) : null
          }
        />
      </TouchableOpacity>

      {isCoordinateFormat(value) && (
        <HelperText
          type="info"
          visible={true}
          style={{
            marginTop: -8,
            marginBottom: 8,
            fontStyle: 'italic',
            color: theme.app.colors.primary,
          }}
        >
          Using current location coordinates for astrology calculations
        </HelperText>
      )}

      {error ? (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      ) : null}

      {/* Location modal */}
      <LocationModal
        visible={modalVisible}
        value={modalValue}
        onChangeText={handleModalTextChange}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
        suggestions={suggestions}
        isLoading={isLoading}
        onSuggestionSelect={handleModalSuggestionSelect}
        placeholder={placeholder}
        label={label}
      />
    </View>
  );
};

export default LocationAutocomplete;
