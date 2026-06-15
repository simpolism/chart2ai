import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Dialog, Button } from 'react-native-paper';
import { ChartData, SavedChart } from '../../types';
import {
  validateChartData,
  ChartValidationErrors,
} from '../../utils/chartValidation';
import { saveChart, updateChart } from '../../utils/chartStorage';
import ChartForm from './ChartForm';
import ResponsiveDialog, {
  ScrollableContent,
  FixedActions,
} from '../shared/ResponsiveDialog';
import { useAppTheme } from '../../theme';

interface ChartFormDialogProps {
  visible: boolean;
  onDismiss: () => void;
  mode: 'create' | 'edit';
  existingChart?: SavedChart;
  onSuccess?: () => void;
}

const ChartFormDialog: React.FC<ChartFormDialogProps> = ({
  visible,
  onDismiss,
  mode,
  existingChart,
  onSuccess,
}) => {
  const theme = useAppTheme();
  const [chartData, setChartData] = useState<ChartData>(() => {
    if (mode === 'edit' && existingChart) {
      return {
        name: existingChart.name,
        personGender: existingChart.personGender,
        date: existingChart.date,
        time: existingChart.time,
        unknownTime: existingChart.unknownTime,
        location: existingChart.location,
      };
    }
    return {
      name: '',
      date: new Date(),
      time: '12:00',
      location: '',
      personGender: undefined,
      unknownTime: false,
    };
  });

  const [errors, setErrors] = useState<ChartValidationErrors>({});
  const [saving, setSaving] = useState(false);

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && existingChart) {
        setChartData({
          name: existingChart.name,
          personGender: existingChart.personGender,
          date: existingChart.date,
          time: existingChart.time,
          unknownTime: existingChart.unknownTime,
          location: existingChart.location,
        });
      } else {
        setChartData({
          name: '',
          date: new Date(),
          time: '12:00',
          location: '',
          personGender: undefined,
          unknownTime: false,
        });
      }
      setErrors({});
    }
  }, [visible, mode, existingChart]);

  const handleUpdate = (updates: Partial<ChartData>) => {
    setChartData(prev => ({ ...prev, ...updates }));

    // Clear related errors when user makes changes
    const newErrors = { ...errors };
    if (updates.name !== undefined && newErrors.name) {
      delete newErrors.name;
    }
    if (updates.location !== undefined && newErrors.location) {
      delete newErrors.location;
    }
    if (updates.time !== undefined && newErrors.time) {
      delete newErrors.time;
    }
    setErrors(newErrors);
  };

  const handleSave = async () => {
    const validation = validateChartData(chartData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);
    try {
      if (mode === 'edit' && existingChart) {
        await updateChart(existingChart.id, {
          name: chartData.name?.trim() || '',
          personGender: chartData.personGender,
          date: chartData.date,
          time: chartData.time || '12:00',
          unknownTime: chartData.unknownTime,
          location: chartData.location?.trim() || '',
        });
      } else {
        await saveChart({
          name: chartData.name?.trim() || '',
          personGender: chartData.personGender,
          date: chartData.date,
          time: chartData.time || '12:00',
          unknownTime: chartData.unknownTime,
          location: chartData.location?.trim() || '',
        });
      }

      onSuccess?.();
      onDismiss();
    } catch (error) {
      console.error(
        `Error ${mode === 'edit' ? 'updating' : 'saving'} chart:`,
        error
      );
      // Could add error state here if needed
    } finally {
      setSaving(false);
    }
  };

  const handleDismiss = () => {
    if (!saving) {
      onDismiss();
    }
  };

  const isFormValid = () => {
    const validation = validateChartData(chartData);
    return validation.isValid;
  };

  return (
    <ResponsiveDialog visible={visible} onDismiss={handleDismiss}>
      <Dialog.Title
        style={[
          theme.getHeaderStyle('medium'),
          { paddingHorizontal: 16, paddingTop: 16 },
        ]}
      >
        {mode === 'edit' ? 'Edit Chart' : 'Add New Chart'}
      </Dialog.Title>

      <ScrollableContent>
        <ChartForm chart={chartData} onUpdate={handleUpdate} errors={errors} />
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
          <Button onPress={handleDismiss} disabled={saving}>
            Cancel
          </Button>
          <Button
            onPress={handleSave}
            disabled={!isFormValid() || saving}
            loading={saving}
          >
            {mode === 'edit' ? 'Save Changes' : 'Add Chart'}
          </Button>
        </View>
      </FixedActions>
    </ResponsiveDialog>
  );
};

export default ChartFormDialog;
