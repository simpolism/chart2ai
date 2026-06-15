import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  Dimensions,
} from 'react-native';
import { TextInput, Text, ActivityIndicator } from 'react-native-paper';
import { LocationSuggestion } from '../../types';
import { useAppTheme } from '../../theme';

interface LocationModalProps {
  visible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  suggestions: LocationSuggestion[];
  isLoading: boolean;
  onSuggestionSelect: (suggestion: LocationSuggestion) => void;
  placeholder?: string;
  label?: string;
}

const LocationModal: React.FC<LocationModalProps> = ({
  visible,
  value,
  onChangeText,
  onConfirm,
  onCancel,
  suggestions,
  isLoading,
  onSuggestionSelect,
  placeholder = 'City, Country',
  label = 'Location',
}) => {
  const theme = useAppTheme();
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const screenWidth = Dimensions.get('window').width;

  const isCoordinateFormat = (text: string): boolean => {
    const coordPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
    return coordPattern.test(text.trim());
  };

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  const renderSuggestion = ({
    item,
    index,
  }: {
    item: LocationSuggestion;
    index: number;
  }) => {
    const isSelected = index === selectedIndex;

    return (
      <TouchableOpacity
        style={{
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.app.colors.border,
          backgroundColor: isSelected
            ? 'rgba(0, 191, 255, 0.1)'
            : 'transparent',
        }}
        onPress={() => onSuggestionSelect(item)}
      >
        <Text
          variant="bodyMedium"
          style={[
            theme.getTextStyle('body'),
            {
              color: isSelected
                ? theme.app.colors.primary
                : theme.app.colors.onSurface,
            },
          ]}
        >
          {item.fullAddress}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: theme.app.colors.surfaceContainer,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                maxHeight: '80%',
                minHeight: 300,
                maxWidth: Math.min(800, screenWidth - 32),
                alignSelf: 'center',
                width: '100%',
              }}
            >
              {/* Header */}
              <View
                style={{
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.app.colors.border,
                }}
              >
                <Text
                  variant="headlineSmall"
                  style={[
                    theme.getHeaderStyle('medium'),
                    { textAlign: 'center', marginBottom: 16 },
                  ]}
                >
                  {label}
                </Text>

                <TextInput
                  label={label}
                  value={value}
                  onChangeText={onChangeText}
                  mode="outlined"
                  placeholder={placeholder}
                  style={theme.getInputStyle()}
                  autoFocus
                  onKeyPress={e => {
                    if (suggestions.length === 0) return;

                    switch (e.nativeEvent.key) {
                      case 'ArrowDown':
                        e.preventDefault();
                        setSelectedIndex(prev =>
                          prev < suggestions.length - 1 ? prev + 1 : 0
                        );
                        break;
                      case 'ArrowUp':
                        e.preventDefault();
                        setSelectedIndex(prev =>
                          prev > 0 ? prev - 1 : suggestions.length - 1
                        );
                        break;
                      case 'Enter':
                        e.preventDefault();
                        if (
                          selectedIndex >= 0 &&
                          selectedIndex < suggestions.length
                        ) {
                          onSuggestionSelect(suggestions[selectedIndex]);
                        } else {
                          onConfirm();
                        }
                        break;
                      case 'Escape':
                        e.preventDefault();
                        onCancel();
                        break;
                    }
                  }}
                  right={
                    isLoading ? (
                      <TextInput.Icon icon="loading" />
                    ) : value ? (
                      <TextInput.Icon
                        icon="close"
                        onPress={() => onChangeText('')}
                      />
                    ) : null
                  }
                />
              </View>

              {/* Content */}
              <View style={{ flex: 1 }}>
                {isCoordinateFormat(value) ? (
                  <View style={{ padding: 16, alignItems: 'center' }}>
                    <Text
                      variant="bodyMedium"
                      style={[
                        theme.getTextStyle('body'),
                        { textAlign: 'center', marginBottom: 16 },
                      ]}
                    >
                      Coordinates detected: {value}
                    </Text>
                  </View>
                ) : isLoading && value.trim().length >= 3 ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 32,
                    }}
                  >
                    <ActivityIndicator
                      size="small"
                      color={theme.app.colors.primary}
                      style={{ marginBottom: 16 }}
                    />
                    <Text
                      variant="bodyMedium"
                      style={[
                        theme.getTextStyle('body'),
                        {
                          textAlign: 'center',
                          color: theme.app.colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      Searching for locations...
                    </Text>
                  </View>
                ) : suggestions.length > 0 ? (
                  <FlatList
                    data={suggestions}
                    renderItem={renderSuggestion}
                    keyExtractor={(item, index) =>
                      `${item.fullAddress}-${index}`
                    }
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={true}
                  />
                ) : value.trim().length >= 3 && !isLoading ? (
                  <View style={{ padding: 16, alignItems: 'center' }}>
                    <Text
                      variant="bodyMedium"
                      style={[
                        theme.getTextStyle('caption'),
                        { textAlign: 'center' },
                      ]}
                    >
                      No locations found. Try a different search term.
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Actions */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 16,
                  borderTopWidth: 1,
                  borderTopColor: theme.app.colors.border,
                }}
              >
                <TouchableOpacity
                  onPress={onCancel}
                  style={{
                    flex: 1,
                    marginRight: 8,
                    paddingVertical: 12,
                    alignItems: 'center',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.app.colors.border,
                  }}
                >
                  <Text
                    variant="bodyMedium"
                    style={[
                      theme.getTextStyle('body'),
                      { color: theme.app.colors.onSurface },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onConfirm}
                  style={{
                    flex: 1,
                    marginLeft: 8,
                    paddingVertical: 12,
                    alignItems: 'center',
                    borderRadius: 8,
                    backgroundColor: theme.app.colors.primary,
                  }}
                >
                  <Text
                    variant="bodyMedium"
                    style={[
                      theme.getTextStyle('body'),
                      { color: '#1a0d2e', fontWeight: '600' },
                    ]}
                  >
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default LocationModal;
