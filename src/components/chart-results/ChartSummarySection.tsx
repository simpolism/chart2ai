import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, IconButton, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../../theme';
import { ChartFormData } from '../../types';
import { generateDetailedSummary } from '../../utils/resultStorage';

interface ChartSummarySectionProps {
  formData: ChartFormData;
}

const SUMMARY_COLLAPSED_KEY = '@chart2ai_summary_collapsed';

const ChartSummarySection: React.FC<ChartSummarySectionProps> = ({
  formData,
}) => {
  const theme = useAppTheme();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load collapsed state from storage
  useEffect(() => {
    const loadCollapsedState = async () => {
      try {
        const stored = await AsyncStorage.getItem(SUMMARY_COLLAPSED_KEY);
        if (stored !== null) {
          setIsCollapsed(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load summary collapsed state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCollapsedState();
  }, []);

  // Save collapsed state to storage
  const toggleCollapsed = async () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);

    try {
      await AsyncStorage.setItem(
        SUMMARY_COLLAPSED_KEY,
        JSON.stringify(newState)
      );
    } catch (error) {
      console.error('Failed to save summary collapsed state:', error);
    }
  };

  // Don't render until we've loaded the state
  if (isLoading) {
    return null;
  }

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
          Chart Details
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
          <Text
            style={[
              theme.getTextStyle('body'),
              {
                lineHeight: 18,
                fontSize: 13,
                color: theme.app.colors.onSurfaceVariant,
              },
            ]}
          >
            {generateDetailedSummary(formData)}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ChartSummarySection;
