import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import { usePlatformInfo } from '../../utils/platform';
import { formatDateToMDY } from '../../utils/dateUtils';
import {
  Text,
  Card,
  IconButton,
  Button,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { SavedChart } from '../../types';
import {
  getQuickSelectCharts,
  updateChartLastUsed,
  updateChartStarred,
} from '../../utils/chartStorage';
import { useAppTheme } from '../../theme';

interface ChartQuickSelectProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectChart: (chart: SavedChart) => void;
  onViewAll: () => void;
}

const ChartQuickSelect: React.FC<ChartQuickSelectProps> = ({
  visible,
  onDismiss,
  onSelectChart,
  onViewAll,
}) => {
  const theme = useAppTheme();
  const [quickSelectCharts, setQuickSelectCharts] = useState<SavedChart[]>([]);
  const [loading, setLoading] = useState(false);

  const loadQuickSelectCharts = async () => {
    setLoading(true);
    try {
      const charts = await getQuickSelectCharts();
      setQuickSelectCharts(charts);
    } catch (error) {
      console.error('Error loading quick select charts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadQuickSelectCharts();
    }
  }, [visible]);

  const handleSelectChart = async (chart: SavedChart) => {
    try {
      await updateChartLastUsed(chart.id);
      onSelectChart(chart);
      onDismiss();
    } catch (error) {
      console.error('Error updating chart last used:', error);
      // Still proceed with selection
      onSelectChart(chart);
      onDismiss();
    }
  };

  const handleToggleStar = async (chart: SavedChart) => {
    try {
      await updateChartStarred(chart.id, !chart.isStarred);
      // Update the local state instead of reloading to preserve scroll position
      setQuickSelectCharts(prev =>
        prev.map(c =>
          c.id === chart.id ? { ...c, isStarred: !c.isStarred } : c
        )
      );
    } catch (error) {
      console.error('Failed to update chart starred status:', error);
    }
  };

  const handleViewAll = () => {
    onDismiss();
    onViewAll();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
          alignItems: 'center',
          ...(usePlatformInfo().isWeb && {
            zIndex: 9999,
          }),
        }}
        activeOpacity={1}
        onPress={onDismiss}
      >
        <View
          style={{
            backgroundColor: theme.app.colors.surfaceContainer,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderWidth: 1,
            borderColor: theme.app.colors.border,
            maxHeight: '70%',
            minHeight: 300,
            width: '100%',
            shadowColor: theme.app.colors.primary,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            ...Platform.select({
              web: {
                maxWidth: 500,
                alignSelf: 'center',
                marginBottom: 40,
                borderRadius: 20,
                minHeight: 300,
                boxShadow: `0 0 20px ${theme.app.effects.glow}`,
              },
            }),
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <View
              style={{
                alignItems: 'center',
                paddingTop: 12,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: theme.app.colors.outline,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: `rgba(${theme.app.colors.primary
                    .slice(1)
                    .match(/.{2}/g)
                    ?.map(x => parseInt(x, 16))
                    .join(', ')}, 0.5)`,
                  borderRadius: 2,
                  marginBottom: 12,
                }}
              />
              <Text
                variant="titleMedium"
                style={[theme.getTextStyle('title'), { fontWeight: 'bold' }]}
              >
                Quick Select
              </Text>
            </View>

            {/* Content */}
            {loading ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="small" />
                <Text style={[theme.getTextStyle('body'), { marginTop: 8 }]}>
                  Loading...
                </Text>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                  showsVerticalScrollIndicator={true}
                  bounces={false}
                >
                  {quickSelectCharts.length > 0 ? (
                    <>
                      {/* Show starred charts section if any exist */}
                      {quickSelectCharts.some(chart => chart.isStarred) && (
                        <>
                          <Text
                            variant="bodySmall"
                            style={[
                              theme.getTextStyle('caption'),
                              {
                                marginTop: 16,
                                marginBottom: 8,
                                fontWeight: '500',
                              },
                            ]}
                          >
                            Starred Charts
                          </Text>
                          {quickSelectCharts
                            .filter(chart => chart.isStarred)
                            .map(chart => (
                              <TouchableOpacity
                                key={chart.id}
                                onPress={() => handleSelectChart(chart)}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  paddingVertical: 12,
                                  paddingLeft: 12,
                                  paddingRight: 4,
                                  marginVertical: 2,
                                  backgroundColor: `rgba(${theme.app.colors.primary
                                    .slice(1)
                                    .match(/.{2}/g)
                                    ?.map(x => parseInt(x, 16))
                                    .join(', ')}, 0.1)`,
                                  borderRadius: 8,
                                  borderWidth: 1,
                                  borderColor: `rgba(${theme.app.colors.primary
                                    .slice(1)
                                    .match(/.{2}/g)
                                    ?.map(x => parseInt(x, 16))
                                    .join(', ')}, 0.3)`,
                                }}
                              >
                                <View style={{ flex: 1 }}>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      gap: 8,
                                      marginBottom: 2,
                                    }}
                                  >
                                    <Text
                                      variant="bodyMedium"
                                      style={[
                                        theme.getTextStyle('title'),
                                        { flex: 1, fontWeight: '600' },
                                      ]}
                                    >
                                      {chart.name}
                                    </Text>
                                    {chart.personGender &&
                                    chart.personGender !== 'other' ? (
                                      <Text
                                        style={{
                                          fontSize: 10,
                                          color: theme.app.colors.primary,
                                          fontWeight: 'bold',
                                          paddingHorizontal: 4,
                                        }}
                                      >
                                        {chart.personGender === 'male'
                                          ? '(M)'
                                          : '(F)'}
                                      </Text>
                                    ) : null}
                                  </View>
                                  <Text
                                    variant="bodySmall"
                                    style={theme.getTextStyle('caption')}
                                  >
                                    {formatDateToMDY(chart.date)} •{' '}
                                    {chart.location}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}
                                >
                                  <IconButton
                                    icon="star"
                                    size={16}
                                    iconColor={theme.app.colors.primary}
                                    onPress={e => {
                                      e.stopPropagation();
                                      handleToggleStar(chart);
                                    }}
                                  />
                                  <IconButton
                                    icon="chevron-right"
                                    size={16}
                                    iconColor={theme.getIconColor('primary')}
                                  />
                                </View>
                              </TouchableOpacity>
                            ))}
                        </>
                      )}

                      {/* Show recent charts section if any exist */}
                      {quickSelectCharts.some(chart => !chart.isStarred) && (
                        <>
                          <Text
                            variant="bodySmall"
                            style={[
                              theme.getTextStyle('caption'),
                              {
                                marginTop: quickSelectCharts.some(
                                  chart => chart.isStarred
                                )
                                  ? 20
                                  : 16,
                                marginBottom: 8,
                                fontWeight: '500',
                              },
                            ]}
                          >
                            Recently Used
                          </Text>
                          {quickSelectCharts
                            .filter(chart => !chart.isStarred)
                            .map(chart => (
                              <TouchableOpacity
                                key={chart.id}
                                onPress={() => handleSelectChart(chart)}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  paddingVertical: 12,
                                  paddingLeft: 12,
                                  paddingRight: 4,
                                  marginVertical: 2,
                                  backgroundColor:
                                    theme.app.colors.surfaceVariant,
                                  borderRadius: 8,
                                  borderWidth: 1,
                                  borderColor: theme.app.colors.outline,
                                }}
                              >
                                <View style={{ flex: 1 }}>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      gap: 8,
                                      marginBottom: 2,
                                    }}
                                  >
                                    <Text
                                      variant="bodyMedium"
                                      style={[
                                        theme.getTextStyle('title'),
                                        { flex: 1, fontWeight: '500' },
                                      ]}
                                    >
                                      {chart.name}
                                    </Text>
                                    {chart.personGender &&
                                    chart.personGender !== 'other' ? (
                                      <Text
                                        style={{
                                          fontSize: 10,
                                          color: theme.app.colors.primary,
                                          fontWeight: 'bold',
                                          paddingHorizontal: 4,
                                        }}
                                      >
                                        {chart.personGender === 'male'
                                          ? '(M)'
                                          : '(F)'}
                                      </Text>
                                    ) : null}
                                  </View>
                                  <Text
                                    variant="bodySmall"
                                    style={theme.getTextStyle('caption')}
                                  >
                                    {formatDateToMDY(chart.date)} •{' '}
                                    {chart.location}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}
                                >
                                  <IconButton
                                    icon="star-outline"
                                    size={16}
                                    iconColor={theme.getIconColor('primary')}
                                    onPress={e => {
                                      e.stopPropagation();
                                      handleToggleStar(chart);
                                    }}
                                  />
                                  <IconButton
                                    icon="chevron-right"
                                    size={16}
                                    iconColor={theme.getIconColor('primary')}
                                  />
                                </View>
                              </TouchableOpacity>
                            ))}
                        </>
                      )}

                      {/* Show explanation text if no starred charts exist */}
                      {!quickSelectCharts.some(chart => chart.isStarred) && (
                        <Text
                          variant="bodySmall"
                          style={[
                            theme.getTextStyle('caption'),
                            {
                              marginTop: 8,
                              marginBottom: 8,
                              fontStyle: 'italic',
                              textAlign: 'center',
                            },
                          ]}
                        >
                          Tap the star icon to pin charts to the top of this
                          list
                        </Text>
                      )}
                    </>
                  ) : (
                    <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                      <Text
                        variant="bodyMedium"
                        style={[
                          theme.getTextStyle('caption'),
                          { textAlign: 'center' },
                        ]}
                      >
                        No charts saved yet
                      </Text>
                      <Text
                        variant="bodySmall"
                        style={[
                          theme.getTextStyle('caption'),
                          {
                            textAlign: 'center',
                            marginTop: 8,
                            fontStyle: 'italic',
                          },
                        ]}
                      >
                        Charts are auto-saved when you generate them
                      </Text>
                    </View>
                  )}
                </ScrollView>

                {/* Fixed Actions at bottom */}
                <View
                  style={{
                    paddingVertical: 20,
                    paddingHorizontal: 20,
                    borderTopWidth: 1,
                    borderTopColor: theme.app.colors.outline,
                    backgroundColor: theme.app.colors.surfaceContainer,
                  }}
                >
                  <Button
                    mode="outlined"
                    onPress={handleViewAll}
                    style={[
                      theme.getButtonStyle('outlined'),
                      {
                        backgroundColor: `rgba(${theme.app.colors.primary
                          .slice(1)
                          .match(/.{2}/g)
                          ?.map(x => parseInt(x, 16))
                          .join(', ')}, 0.1)`,
                      },
                    ]}
                    contentStyle={{ paddingVertical: 8 }}
                  >
                    View All Charts
                  </Button>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ChartQuickSelect;
