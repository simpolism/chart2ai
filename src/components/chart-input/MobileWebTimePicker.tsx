import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
  ListRenderItem,
  Platform,
} from 'react-native';
import { Switch } from 'react-native-paper';
import { useAppTheme } from '../../theme';
import {
  formatTimeToHM,
  parseTimeFromHMS,
  formatTimeToAMPM,
} from '../../utils/timeUtils';

interface MobileWebTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
  unknownTime?: boolean;
  onUnknownTimeChange?: (value: boolean) => void;
}

const ITEM_HEIGHT = 40;
const CONTAINER_HEIGHT = 120;

const MobileWebTimePicker: React.FC<MobileWebTimePickerProps> = ({
  value,
  onChange,
  disabled = false,
  unknownTime = false,
  onUnknownTimeChange,
}) => {
  const theme = useAppTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(() => {
    if (value && value !== 'Unknown') {
      return parseTimeFromHMS(value);
    } else {
      const defaultTime = new Date();
      defaultTime.setHours(12, 0, 0, 0);
      return defaultTime;
    }
  });

  // Local state for unknown time toggle (separate from parent)
  const [localUnknownTime, setLocalUnknownTime] = useState(unknownTime);

  // Reset local state when modal opens
  useEffect(() => {
    if (isVisible) {
      setLocalUnknownTime(unknownTime);
      if (unknownTime && value === 'Unknown') {
        // Default to 12:00 PM for unknown time modal opening
        const defaultTime = new Date();
        defaultTime.setHours(12, 0, 0, 0);
        setSelectedTime(defaultTime);
      }
    }
  }, [isVisible, unknownTime, value]);

  const hourScrollRef = useRef<FlatList<number>>(null);
  const minuteScrollRef = useRef<FlatList<number>>(null);
  const ampmScrollRef = useRef<FlatList<string>>(null);

  useEffect(() => {
    if (value && value !== 'Unknown') {
      setSelectedTime(parseTimeFromHMS(value));
    }
  }, [value]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const ampm = ['AM', 'PM'];

  const [isUserSelection, setIsUserSelection] = useState(false);
  const [expectedHourY, setExpectedHourY] = useState<number | null>(null);
  const resetCounterRef = useRef(0);
  const lastScrollCommandTime = useRef<number>(0);
  const isUserScrolling = useRef(false);

  const scrollToSelected = useCallback(() => {
    const timeout = !isUserSelection ? 100 : 0;

    setTimeout(() => {
      const currentHour = selectedTime.getHours();
      const displayHour = currentHour % 12 === 0 ? 12 : currentHour % 12;
      const currentMinute = selectedTime.getMinutes();
      const currentAmpm = currentHour >= 12 ? 'PM' : 'AM';

      const expectedY = (displayHour - 1) * 40; // ITEM_HEIGHT = 40
      setExpectedHourY(expectedY);
      resetCounterRef.current = 0;
      lastScrollCommandTime.current = Date.now();

      hourScrollRef.current?.scrollToIndex({
        index: displayHour - 1,
        animated: false,
        viewPosition: 0.5,
      });

      minuteScrollRef.current?.scrollToIndex({
        index: currentMinute,
        animated: false,
        viewPosition: 0.5,
      });

      ampmScrollRef.current?.scrollToIndex({
        index: ampm.indexOf(currentAmpm),
        animated: false,
        viewPosition: 0.5,
      });
    }, timeout);
  }, [selectedTime, isUserSelection]);

  useEffect(() => {
    if (isVisible) {
      setIsUserSelection(false);
      scrollToSelected();
    }
  }, [isVisible, scrollToSelected]);

  const handleConfirm = () => {
    if (localUnknownTime) {
      if (onUnknownTimeChange) {
        onUnknownTimeChange(true);
      }
      onChange('Unknown');
    } else {
      if (onUnknownTimeChange) {
        onUnknownTimeChange(false);
      }
      onChange(formatTimeToHM(selectedTime)); // This should be last to win
    }
    setIsVisible(false);
  };

  const handleCancel = () => {
    if (value && value !== 'Unknown') {
      setSelectedTime(parseTimeFromHMS(value));
    }
    setIsVisible(false);
  };

  const updateTime = (hour?: number, minute?: number, newAmpm?: string) => {
    if (localUnknownTime) {
      return; // Don't update time when unknown time is active
    }

    const newTime = new Date(selectedTime);
    let currentHour = newTime.getHours();
    const isPM = currentHour >= 12;

    if (hour !== undefined) {
      if (isPM && hour !== 12) {
        newTime.setHours(hour + 12);
      } else if (!isPM && hour === 12) {
        newTime.setHours(0);
      } else {
        newTime.setHours(hour);
      }
    }

    if (minute !== undefined) {
      newTime.setMinutes(minute);
    }

    if (newAmpm !== undefined) {
      if (newAmpm === 'PM' && !isPM) {
        newTime.setHours(currentHour + 12);
      } else if (newAmpm === 'AM' && isPM) {
        newTime.setHours(currentHour - 12);
      }
    }

    setIsUserSelection(true);
    setSelectedTime(newTime);
  };

  const renderPicker = () => {
    const currentHour = selectedTime.getHours();
    const displayHour = currentHour % 12 === 0 ? 12 : currentHour % 12;
    const currentMinute = selectedTime.getMinutes();
    const currentAmpm = currentHour >= 12 ? 'PM' : 'AM';

    const getItemLayout = (_data: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    });

    const renderHour: ListRenderItem<number> = ({ item }) => (
      <TouchableOpacity
        onPress={() =>
          !localUnknownTime && updateTime(item, undefined, undefined)
        }
        disabled={localUnknownTime}
        style={{
          height: ITEM_HEIGHT,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor:
            item === displayHour ? theme.app.colors.primary : 'transparent',
          borderRadius: 6,
        }}
      >
        <Text
          style={{
            color:
              item === displayHour ? '#1a0d2e' : theme.app.colors.onSurface,
            fontWeight: item === displayHour ? '600' : '400',
          }}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );

    const renderMinute: ListRenderItem<number> = ({ item }) => (
      <TouchableOpacity
        onPress={() =>
          !localUnknownTime && updateTime(undefined, item, undefined)
        }
        disabled={localUnknownTime}
        style={{
          height: ITEM_HEIGHT,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor:
            item === currentMinute ? theme.app.colors.primary : 'transparent',
          borderRadius: 6,
        }}
      >
        <Text
          style={{
            color:
              item === currentMinute ? '#1a0d2e' : theme.app.colors.onSurface,
            fontWeight: item === currentMinute ? '600' : '400',
          }}
        >
          {item.toString().padStart(2, '0')}
        </Text>
      </TouchableOpacity>
    );

    const renderAmpm: ListRenderItem<string> = ({ item }) => (
      <TouchableOpacity
        onPress={() =>
          !localUnknownTime && updateTime(undefined, undefined, item)
        }
        disabled={localUnknownTime}
        style={{
          height: ITEM_HEIGHT,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor:
            item === currentAmpm ? theme.app.colors.primary : 'transparent',
          borderRadius: 6,
        }}
      >
        <Text
          style={{
            color:
              item === currentAmpm ? '#1a0d2e' : theme.app.colors.onSurface,
            fontWeight: item === currentAmpm ? '600' : '400',
          }}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );

    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
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
              backgroundColor: theme.app.colors.surface,
              borderRadius: 12,
              padding: 20,
              width: '100%',
              maxWidth: 340,
              maxHeight: '80%',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: theme.app.colors.onSurface,
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              Select Time
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 20,
                height: CONTAINER_HEIGHT,
                opacity: localUnknownTime ? 0.5 : 1,
              }}
            >
              {/* Hour Picker */}
              <View style={{ flex: 1, marginRight: 8 }}>
                <FlatList
                  ref={hourScrollRef}
                  data={hours}
                  renderItem={renderHour}
                  keyExtractor={item => item.toString()}
                  onScroll={e => {
                    const currentY = e.nativeEvent.contentOffset?.y || 0;
                    const now = Date.now();
                    const timeSinceScrollCommand =
                      now - lastScrollCommandTime.current;

                    if (
                      expectedHourY !== null &&
                      currentY === 0 &&
                      expectedHourY > 0 &&
                      timeSinceScrollCommand < 500 &&
                      !isUserScrolling.current &&
                      resetCounterRef.current < 3
                    ) {
                      resetCounterRef.current++;
                      setTimeout(() => {
                        hourScrollRef.current?.scrollToIndex({
                          index: Math.round(expectedHourY / 40),
                          animated: false,
                          viewPosition: 0.5,
                        });
                      }, 10);
                    }
                  }}
                  onTouchStart={() => {
                    if (!localUnknownTime) {
                      isUserScrolling.current = true;
                    }
                  }}
                  onTouchEnd={() => {
                    setTimeout(() => {
                      isUserScrolling.current = false;
                    }, 100);
                  }}
                  showsVerticalScrollIndicator={false}
                  style={{
                    backgroundColor: theme.app.colors.background,
                    borderRadius: 8,
                  }}
                  getItemLayout={getItemLayout}
                  initialNumToRender={12}
                  scrollEnabled={!localUnknownTime}
                />
              </View>

              {/* Minute Picker */}
              <View style={{ flex: 1, marginHorizontal: 8 }}>
                <FlatList
                  ref={minuteScrollRef}
                  data={minutes}
                  renderItem={renderMinute}
                  keyExtractor={item => item.toString()}
                  showsVerticalScrollIndicator={false}
                  style={{
                    backgroundColor: theme.app.colors.background,
                    borderRadius: 8,
                  }}
                  getItemLayout={getItemLayout}
                  initialNumToRender={60}
                  scrollEnabled={!localUnknownTime}
                />
              </View>

              {/* AM/PM Picker */}
              <View style={{ flex: 1, marginLeft: 8 }}>
                <FlatList
                  ref={ampmScrollRef}
                  data={ampm}
                  renderItem={renderAmpm}
                  keyExtractor={item => item}
                  showsVerticalScrollIndicator={false}
                  style={{
                    backgroundColor: theme.app.colors.background,
                    borderRadius: 8,
                  }}
                  getItemLayout={getItemLayout}
                  initialNumToRender={2}
                  scrollEnabled={!localUnknownTime}
                />
              </View>
            </View>

            {/* Time Unknown Toggle */}
            {onUnknownTimeChange ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <Switch
                  value={localUnknownTime}
                  onValueChange={setLocalUnknownTime}
                  thumbColor={
                    localUnknownTime ? theme.app.colors.primary : undefined
                  }
                  trackColor={{
                    false: theme.app.colors.border,
                    true: theme.app.colors.primary + '50',
                  }}
                />
                <Text
                  style={{
                    color: theme.app.colors.onSurface,
                    fontSize: 16,
                  }}
                >
                  Time Unknown?
                </Text>
              </View>
            ) : null}

            {/* Action Buttons */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 20,
              }}
            >
              <TouchableOpacity
                onPress={handleCancel}
                style={{
                  flex: 1,
                  padding: 12,
                  marginRight: 8,
                  backgroundColor: theme.app.colors.background,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.app.colors.border,
                }}
              >
                <Text
                  style={{
                    color: theme.app.colors.onSurface,
                    textAlign: 'center',
                    fontWeight: '500',
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                style={{
                  flex: 1,
                  padding: 12,
                  marginLeft: 8,
                  backgroundColor: theme.app.colors.primary,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: '#1a0d2e',
                    textAlign: 'center',
                    fontWeight: '600',
                  }}
                >
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => !disabled && setIsVisible(true)}
        disabled={disabled}
        style={{
          backgroundColor: 'transparent',
          width: '100%',
          padding: 16,
          minHeight: 48,
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: disabled
              ? theme.app.colors.disabled
              : value === 'Unknown'
                ? theme.app.colors.onSurfaceVariant
                : theme.app.colors.onSurface,
            fontSize: 16,
          }}
        >
          {value === 'Unknown'
            ? '--:--'
            : value
              ? formatTimeToAMPM(parseTimeFromHMS(value))
              : 'Select time'}
        </Text>
      </TouchableOpacity>

      {renderPicker()}
    </>
  );
};

export default MobileWebTimePicker;
