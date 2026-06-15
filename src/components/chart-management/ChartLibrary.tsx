import React, { useState, useEffect } from 'react';
import { View, ScrollView, Platform } from 'react-native';
import {
  Dialog,
  Text,
  Button,
  Card,
  IconButton,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { SavedChart } from '../../types';
import { formatDateToMDY } from '../../utils/dateUtils';
import {
  getSavedCharts,
  deleteChart,
  updateChartStarred,
} from '../../utils/chartStorage';
import ChartFormDialog from '../chart-input/ChartFormDialog';
import ResponsiveDialog, {
  ScrollableContent,
  FixedActions,
} from '../shared/ResponsiveDialog';
import { useAppTheme } from '../../theme';

interface ChartLibraryProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectChart?: (chart: SavedChart) => void;
}

interface ChartItemProps {
  chart: SavedChart;
  onSelect?: (chart: SavedChart) => void;
  onEdit: (chart: SavedChart) => void;
  onDelete: (chart: SavedChart) => void;
  onToggleStar: (chart: SavedChart) => void;
}

const ChartItem: React.FC<ChartItemProps> = ({
  chart,
  onSelect,
  onEdit,
  onDelete,
  onToggleStar,
}) => {
  const theme = useAppTheme();

  const handleDelete = () => {
    onDelete(chart);
  };

  return (
    <Card
      style={[
        theme.getCardStyle(),
        {
          marginHorizontal: 16,
          marginVertical: 4,
          backgroundColor: chart.isStarred
            ? `rgba(${theme.app.colors.primary
                .slice(1)
                .match(/.{2}/g)
                ?.map(x => parseInt(x, 16))
                .join(', ')}, 0.08)`
            : theme.app.colors.surfaceVariant,
          borderWidth: 1,
          borderColor: chart.isStarred
            ? `rgba(${theme.app.colors.primary
                .slice(1)
                .match(/.{2}/g)
                ?.map(x => parseInt(x, 16))
                .join(', ')}, 0.2)`
            : theme.app.colors.border,
        },
      ]}
    >
      <Card.Content>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 4,
              }}
            >
              <Text
                variant="titleMedium"
                style={[theme.getHeaderStyle('small'), { flex: 1 }]}
              >
                {chart.name}
              </Text>
              {chart.personGender && chart.personGender !== 'other' ? (
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.app.colors.primary,
                    fontWeight: 'bold',
                    paddingHorizontal: 4,
                  }}
                >
                  {chart.personGender === 'male' ? '(M)' : '(F)'}
                </Text>
              ) : null}
            </View>
            <Text
              variant="bodySmall"
              style={[theme.getTextStyle('body'), { marginBottom: 2 }]}
            >
              {formatDateToMDY(chart.date)} •{' '}
              {chart.unknownTime ? 'unknown' : chart.time}
            </Text>
            <Text variant="bodySmall" style={theme.getTextStyle('caption')}>
              {chart.location}
            </Text>
          </View>
          <View
            style={{ flexDirection: 'column', alignItems: 'center', gap: 4 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconButton
                icon={chart.isStarred ? 'star' : 'star-outline'}
                size={16}
                iconColor={
                  chart.isStarred
                    ? theme.app.colors.primary
                    : theme.getIconColor('primary')
                }
                onPress={() => onToggleStar(chart)}
                style={{ margin: 2 }}
              />
              {onSelect ? (
                <IconButton
                  icon="chart-line"
                  size={16}
                  iconColor={theme.getIconColor('primary')}
                  onPress={() => onSelect(chart)}
                  style={{ margin: 2 }}
                />
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconButton
                icon="pencil"
                size={16}
                iconColor={theme.getIconColor('primary')}
                onPress={() => onEdit(chart)}
                style={{ margin: 2 }}
              />
              <IconButton
                icon="delete"
                size={16}
                iconColor={theme.getIconColor('error')}
                onPress={handleDelete}
                style={{ margin: 2 }}
              />
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const ChartLibrary: React.FC<ChartLibraryProps> = ({
  visible,
  onDismiss,
  onSelectChart,
}) => {
  const theme = useAppTheme();
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [loading, setLoading] = useState(false);

  const [chartFormDialog, setChartFormDialog] = useState<{
    visible: boolean;
    mode: 'create' | 'edit';
    chart: SavedChart | null;
  }>({
    visible: false,
    mode: 'create',
    chart: null,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    visible: boolean;
    chart: SavedChart | null;
  }>({
    visible: false,
    chart: null,
  });

  const loadCharts = async () => {
    setLoading(true);
    try {
      const savedCharts = await getSavedCharts();
      // Sort starred charts first, then alphabetically within each group
      const sortedCharts = savedCharts.sort((a, b) => {
        if (a.isStarred && !b.isStarred) return -1;
        if (!a.isStarred && b.isStarred) return 1;
        return a.name.localeCompare(b.name);
      });
      setCharts(sortedCharts);
    } catch (error) {
      console.error('Error loading charts:', error);
      // Could add an error state here instead of Alert
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadCharts();
    }
  }, [visible]);

  const handleAddNew = () => {
    setChartFormDialog({
      visible: true,
      mode: 'create',
      chart: null,
    });
  };

  const handleEdit = (chart: SavedChart) => {
    setChartFormDialog({
      visible: true,
      mode: 'edit',
      chart,
    });
  };

  const handleFormSuccess = () => {
    loadCharts(); // Refresh the list
  };

  const handleDelete = async (chart: SavedChart) => {
    setDeleteDialog({
      visible: true,
      chart,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.chart) return;

    try {
      await deleteChart(deleteDialog.chart.id);
      await loadCharts(); // Refresh the list
      setDeleteDialog({ visible: false, chart: null });
    } catch (error) {
      console.error('Error deleting chart:', error);
      // Show error in dialog instead of Alert
      setDeleteDialog({ visible: false, chart: null });
    }
  };

  const handleSelectChart = (chart: SavedChart) => {
    onSelectChart?.(chart);
    onDismiss();
  };

  const handleToggleStar = async (chart: SavedChart) => {
    try {
      await updateChartStarred(chart.id, !chart.isStarred);
      const updatedCharts = charts.map(c =>
        c.id === chart.id ? { ...c, isStarred: !c.isStarred } : c
      );
      setCharts(updatedCharts);
    } catch (error) {
      console.error('Failed to update chart starred status:', error);
    }
  };

  const renderEmptyState = () => (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
      }}
    >
      <Text
        variant="headlineSmall"
        style={[
          theme.getHeaderStyle('medium'),
          { marginBottom: 12, textAlign: 'center' },
        ]}
      >
        No Charts Saved Yet
      </Text>
      <Text
        variant="bodyMedium"
        style={[
          theme.getTextStyle('caption'),
          { textAlign: 'center', lineHeight: 20 },
        ]}
      >
        Charts will be automatically saved when you generate them.
      </Text>
    </View>
  );

  return (
    <>
      <ResponsiveDialog
        visible={visible}
        onDismiss={onDismiss}
        dismissable={true}
      >
        <Dialog.Title
          style={[
            theme.getHeaderStyle('medium'),
            { paddingHorizontal: 16, paddingTop: 16 },
          ]}
        >
          Chart Library ({charts.length}/100)
        </Dialog.Title>

        <ScrollableContent>
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="large" />
              <Text style={[theme.getTextStyle('body'), { marginTop: 16 }]}>
                Loading charts...
              </Text>
            </View>
          ) : charts.length === 0 ? (
            renderEmptyState()
          ) : (
            <View>
              {charts.map(chart => (
                <ChartItem
                  key={chart.id}
                  chart={chart}
                  onSelect={onSelectChart ? handleSelectChart : undefined}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStar={handleToggleStar}
                />
              ))}
            </View>
          )}
        </ScrollableContent>

        <FixedActions>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Button onPress={handleAddNew} icon="plus" mode="outlined">
              Add New Chart
            </Button>
            <Button onPress={onDismiss}>Close</Button>
          </View>
        </FixedActions>
      </ResponsiveDialog>

      {/* Chart Form Dialog (Add/Edit) */}
      <ChartFormDialog
        visible={chartFormDialog.visible}
        mode={chartFormDialog.mode}
        existingChart={chartFormDialog.chart || undefined}
        onDismiss={() =>
          setChartFormDialog({ visible: false, mode: 'create', chart: null })
        }
        onSuccess={handleFormSuccess}
      />

      {/* Delete Dialog */}
      <ResponsiveDialog
        visible={deleteDialog.visible}
        onDismiss={() => setDeleteDialog({ visible: false, chart: null })}
      >
        <Dialog.Title>Delete Chart</Dialog.Title>
        <Dialog.Content>
          <Text>
            Are you sure you want to delete "{deleteDialog.chart?.name}"?
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            onPress={() => setDeleteDialog({ visible: false, chart: null })}
          >
            Cancel
          </Button>
          <Button
            onPress={handleDeleteConfirm}
            buttonColor={theme.app.colors.error}
          >
            Delete
          </Button>
        </Dialog.Actions>
      </ResponsiveDialog>
    </>
  );
};

export default ChartLibrary;
