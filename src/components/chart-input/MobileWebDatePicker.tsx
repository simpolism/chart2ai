import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
  Platform,
  ListRenderItem,
} from 'react-native';
import { useAppTheme } from '../../theme';
import {
  formatDateToYMD,
  parseDateFromYMD,
  formatDateToMDY,
} from '../../utils/dateUtils';

interface MobileWebDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
}

const ITEM_HEIGHT = 40;
const CONTAINER_HEIGHT = 120;

const MobileWebDatePicker: React.FC<MobileWebDatePickerProps> = ({
  value,
  onChange,
  disabled = false,
  minYear = 1800,
  maxYear = 2100,
}) => {
  const theme = useAppTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    return value ? parseDateFromYMD(value) : new Date();
  });

  // Refs for scroll views to enable auto-scrolling
  const monthScrollRef = useRef<FlatList<string>>(null);
  const dayScrollRef = useRef<FlatList<number>>(null);
  const yearScrollRef = useRef<FlatList<number>>(null);

  useEffect(() => {
    if (value) {
      setSelectedDate(parseDateFromYMD(value));
    }
  }, [value]);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  ).reverse();

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const [isUserSelection, setIsUserSelection] = useState(false);
  const [expectedMonthY, setExpectedMonthY] = useState<number | null>(null);
  const resetCounterRef = useRef(0);
  const lastScrollCommandTime = useRef<number>(0);
  const isUserScrolling = useRef(false);

  const scrollToSelected = useCallback(() => {
    const timeout = !isUserSelection ? 100 : 0;

    setTimeout(() => {
      const currentYear = selectedDate.getFullYear();
      const currentMonth = selectedDate.getMonth();
      const currentDay = selectedDate.getDate();

      const expectedY = currentMonth * 40; // ITEM_HEIGHT = 40
      setExpectedMonthY(expectedY);
      resetCounterRef.current = 0;
      lastScrollCommandTime.current = Date.now();

      monthScrollRef.current?.scrollToIndex({
        index: currentMonth,
        animated: false,
        viewPosition: 0.5,
      });

      dayScrollRef.current?.scrollToIndex({
        index: currentDay - 1,
        animated: false,
        viewPosition: 0.5,
      });

      const yearIndex = years.findIndex(year => year === currentYear);
      if (yearIndex !== -1) {
        yearScrollRef.current?.scrollToIndex({
          index: yearIndex,
          animated: false,
          viewPosition: 0.5,
        });
      }
    }, timeout);
  }, [selectedDate, years, isUserSelection]);

  useEffect(() => {
    if (isVisible) {
      setIsUserSelection(false);
      scrollToSelected();
    }
  }, [isVisible, scrollToSelected]);

  const handleConfirm = () => {
    onChange(formatDateToYMD(selectedDate));
    setIsVisible(false);
  };

  const handleCancel = () => {
    if (value) {
      setSelectedDate(parseDateFromYMD(value));
    }
    setIsVisible(false);
  };

  const updateDate = (year?: number, month?: number, day?: number) => {
    // Use current selected date components to avoid timezone issues
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth();
    const currentDay = selectedDate.getDate();

    // Create new date using explicit components (timezone-safe)
    const newYear = year !== undefined ? year : currentYear;
    const newMonth = month !== undefined ? month : currentMonth;
    let newDay = day !== undefined ? day : currentDay;

    // Ensure day is valid for the new month/year combination
    const maxDay = getDaysInMonth(newYear, newMonth);
    if (newDay > maxDay) {
      newDay = maxDay;
    }

    // Create new Date object with explicit components (avoids timezone shifts)
    const newDate = new Date(newYear, newMonth, newDay);

    setIsUserSelection(true);
    setSelectedDate(newDate);
  };

  const renderPicker = () => {
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth();
    const currentDay = selectedDate.getDate();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getItemLayout = (_data: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    });

    const renderMonth: ListRenderItem<string> = ({ item, index }) => (
      <TouchableOpacity
        onPress={() => updateDate(undefined, index)}
        style={{
          height: ITEM_HEIGHT,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor:
            index === currentMonth ? theme.app.colors.primary : 'transparent',
          borderRadius: 6,
        }}
      >
        <Text
          style={{
            color:
              index === currentMonth ? '#1a0d2e' : theme.app.colors.onSurface,
            fontWeight: index === currentMonth ? '600' : '400',
          }}
        >
          {item.slice(0, 3)}
        </Text>
      </TouchableOpacity>
    );

    const renderDay: ListRenderItem<number> = ({ item }) => (
      <TouchableOpacity
        onPress={() => updateDate(undefined, undefined, item)}
        style={{
          height: ITEM_HEIGHT,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor:
            item === currentDay ? theme.app.colors.primary : 'transparent',
          borderRadius: 6,
        }}
      >
        <Text
          style={{
            color: item === currentDay ? '#1a0d2e' : theme.app.colors.onSurface,
            fontWeight: item === currentDay ? '600' : '400',
          }}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );

    const renderYear: ListRenderItem<number> = ({ item }) => (
      <TouchableOpacity
        onPress={() => updateDate(item)}
        style={{
          height: ITEM_HEIGHT,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor:
            item === currentYear ? theme.app.colors.primary : 'transparent',
          borderRadius: 6,
        }}
      >
        <Text
          style={{
            color:
              item === currentYear ? '#1a0d2e' : theme.app.colors.onSurface,
            fontWeight: item === currentYear ? '600' : '400',
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
            {/* Header */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: theme.app.colors.onSurface,
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              Select Date
            </Text>

            {/* Date Selectors */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 20,
                height: CONTAINER_HEIGHT,
              }}
            >
              {/* Month Picker */}
              <View style={{ flex: 1, marginRight: 8 }}>
                <FlatList
                  ref={monthScrollRef}
                  data={months}
                  renderItem={renderMonth}
                  keyExtractor={item => item}
                  showsVerticalScrollIndicator={false}
                  style={{
                    backgroundColor: theme.app.colors.background,
                    borderRadius: 8,
                  }}
                  getItemLayout={getItemLayout}
                  initialNumToRender={12}
                  onScroll={e => {
                    const currentY = e.nativeEvent.contentOffset?.y || 0;
                    const now = Date.now();
                    const timeSinceScrollCommand =
                      now - lastScrollCommandTime.current;

                    if (
                      expectedMonthY !== null &&
                      currentY === 0 &&
                      expectedMonthY > 0 &&
                      timeSinceScrollCommand < 500 &&
                      !isUserScrolling.current &&
                      resetCounterRef.current < 3
                    ) {
                      resetCounterRef.current++;
                      setTimeout(() => {
                        monthScrollRef.current?.scrollToIndex({
                          index: Math.round(expectedMonthY / 40),
                          animated: false,
                          viewPosition: 0.5,
                        });
                      }, 10);
                    }
                  }}
                  onTouchStart={() => {
                    isUserScrolling.current = true;
                  }}
                  onTouchEnd={() => {
                    setTimeout(() => {
                      isUserScrolling.current = false;
                    }, 100);
                  }}
                />
              </View>

              {/* Day Picker */}
              <View style={{ flex: 1, marginHorizontal: 8 }}>
                <FlatList
                  ref={dayScrollRef}
                  data={days}
                  renderItem={renderDay}
                  keyExtractor={item => item.toString()}
                  showsVerticalScrollIndicator={false}
                  style={{
                    backgroundColor: theme.app.colors.background,
                    borderRadius: 8,
                  }}
                  getItemLayout={getItemLayout}
                  initialNumToRender={31}
                />
              </View>

              {/* Year Picker */}
              <View style={{ flex: 1, marginLeft: 8 }}>
                <FlatList
                  ref={yearScrollRef}
                  data={years}
                  renderItem={renderYear}
                  keyExtractor={item => item.toString()}
                  showsVerticalScrollIndicator={false}
                  style={{
                    backgroundColor: theme.app.colors.background,
                    borderRadius: 8,
                  }}
                  getItemLayout={getItemLayout}
                  initialNumToRender={years.length}
                />
              </View>
            </View>

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
              : theme.app.colors.onSurface,
            fontSize: 16,
          }}
        >
          {value ? formatDateToMDY(parseDateFromYMD(value)) : 'Select date'}
        </Text>
      </TouchableOpacity>

      {renderPicker()}
    </>
  );
};

export default MobileWebDatePicker;
