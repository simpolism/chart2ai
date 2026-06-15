import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { Button, HelperText, Text, Card } from 'react-native-paper';
import {
  ChartFormData,
  ChartData,
  SavedChart,
  OrbSensitivity,
} from '../../types';
import { validateChartData } from '../../utils/chartValidation';
import { getDefaultFilteringSettings } from '../../utils/chartFiltering';
import ChartQuickSelect from '../chart-management/ChartQuickSelect';
import ChartLibrary from '../chart-management/ChartLibrary';
import ChartForm from '../chart-input/ChartForm';
import AdvancedAstrologyOptions from './AdvancedAstrologyOptions';
import ReadingSettingsCard from './ReadingSettingsCard';
import UserPromptCard from './UserPromptCard';
import TransitAnalysisCard from './TransitAnalysisCard';
import SectionDivider from '../shared/SectionDivider';
import { useAppTheme } from '../../theme';
import { EmailSubscriptionForm } from '../shared/EmailSubscriptionForm';

interface AstroFormProps {
  onSubmit: (data: ChartFormData) => void;
  loading?: boolean;
  initialData?: ChartFormData;
  onDataChange?: (data: ChartFormData) => void;
  loadedData?: ChartFormData; // Separate prop for loading from Result Library
  error?: string; // Error message from parent (e.g., network errors)
}

// Remove ChartErrorData interface - now using ChartValidationErrors from utils

const MAX_CHARTS = 10;

const AstroForm: React.FC<AstroFormProps> = ({
  onSubmit,
  loading = false,
  initialData,
  onDataChange,
  loadedData,
  error,
}) => {
  const theme = useAppTheme();
  const [formData, setFormData] = useState<ChartFormData>(() => {
    if (initialData) {
      // Ensure all new fields have defaults if missing from initialData
      return {
        ...initialData,
        enableUserPrompt:
          initialData.enableUserPrompt !== undefined
            ? initialData.enableUserPrompt
            : false,
        userPromptText: initialData.userPromptText || '',
        systemPromptEnabled:
          initialData.systemPromptEnabled !== undefined
            ? initialData.systemPromptEnabled
            : true,
        readingVoice: initialData.readingVoice || 'standard',
        readingStyle: initialData.readingStyle || 'modern',
        skipOutOfSignAspects:
          initialData.skipOutOfSignAspects !== undefined
            ? initialData.skipOutOfSignAspects
            : true,
        rawMode:
          initialData.rawMode !== undefined ? initialData.rawMode : false,
        orbSensitivity: initialData.orbSensitivity || 'balanced',
        filteringSettings:
          initialData.filteringSettings || getDefaultFilteringSettings(),
      };
    }
    return {
      charts: [{ name: '', date: new Date(), time: '12:00', location: '' }],
      houseSystem: 'W',
      enableTransit: false,
      enableUserPrompt: false,
      userPromptText: '',
      systemPromptEnabled: true,
      readingVoice: 'standard',
      readingStyle: 'modern',
      skipOutOfSignAspects: true,
      rawMode: false,
      orbSensitivity: 'balanced',
      filteringSettings: getDefaultFilteringSettings(),
    };
  });

  const [errors, setErrors] = useState<{
    charts: { name?: string; location?: string; time?: string }[];
    transit?: { name?: string; location?: string; time?: string };
  }>({
    charts: [{}],
  });

  const [submitError, setSubmitError] = useState<string>('');

  // Update submit error when error prop changes
  useEffect(() => {
    if (error) {
      setSubmitError(error);
    }
  }, [error]);

  // Clear submit error when loading starts
  useEffect(() => {
    if (loading) {
      setSubmitError('');
    }
  }, [loading]);

  const [showChartLibrary, setShowChartLibrary] = useState(false);
  const [quickSelectVisible, setQuickSelectVisible] = useState<{
    chartIndex?: number;
  }>({});

  useEffect(() => {
    onDataChange?.(formData);
  }, [formData, onDataChange]);

  // Handle loaded data from Result Library
  useEffect(() => {
    if (loadedData) {
      const updatedData = {
        ...loadedData,
        userPromptText: loadedData.userPromptText || '',
        systemPromptEnabled:
          loadedData.systemPromptEnabled !== undefined
            ? loadedData.systemPromptEnabled
            : true,
        readingVoice: loadedData.readingVoice || 'standard',
        readingStyle: loadedData.readingStyle || 'modern',
        rawMode: loadedData.rawMode !== undefined ? loadedData.rawMode : false,
      };

      setFormData(updatedData);

      // Reset errors for new form data
      setErrors({
        charts: new Array(updatedData.charts.length).fill({}),
      });
    }
  }, [loadedData]);

  const updateFormData = (updates: Partial<ChartFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const addChart = () => {
    if (formData.charts.length >= MAX_CHARTS) return;

    const newChart: ChartData = {
      name: '',
      date: new Date(),
      time: '12:00',
      location: '',
    };

    updateFormData({ charts: [...formData.charts, newChart] });
    setErrors(prev => ({ ...prev, charts: [...prev.charts, {}] }));
  };

  const removeChart = (index: number) => {
    if (formData.charts.length <= 1) return;

    const newCharts = formData.charts.filter((_, i) => i !== index);
    const newErrors = errors.charts.filter((_, i) => i !== index);

    updateFormData({ charts: newCharts });
    setErrors(prev => ({ ...prev, charts: newErrors }));
  };

  const updateChart = (index: number, updates: Partial<ChartData>) => {
    const newCharts = [...formData.charts];
    newCharts[index] = { ...newCharts[index], ...updates };
    updateFormData({ charts: newCharts });
  };

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate each chart using shared validation
    formData.charts.forEach((chart, index) => {
      const validation = validateChartData(chart);
      if (!validation.isValid) {
        setErrors(prev => {
          const newErrors = [...prev.charts];
          newErrors[index] = validation.errors;
          return { ...prev, charts: newErrors };
        });
        isValid = false;
      } else {
        setErrors(prev => {
          const newErrors = [...prev.charts];
          newErrors[index] = {};
          return { ...prev, charts: newErrors };
        });
      }
    });

    // Validate transit if enabled
    if (formData.enableTransit && formData.transit) {
      if (!formData.transit.location?.trim()) {
        setErrors(prev => ({
          ...prev,
          transit: {
            ...prev.transit,
            location: 'Transit location is required',
          },
        }));
        isValid = false;
      } else {
        setErrors(prev => ({
          ...prev,
          transit: { ...prev.transit, location: undefined },
        }));
      }
    }

    return isValid;
  };

  const handleSubmit = () => {
    // Clear any previous submit errors
    setSubmitError('');

    if (validateForm()) {
      onSubmit(formData);
    } else {
      setSubmitError('Please fix the errors above before submitting.');
    }
  };

  const handleChartSelect = (chart: SavedChart, chartIndex?: number) => {
    if (chartIndex !== undefined) {
      updateChart(chartIndex, {
        name: chart.name,
        location: chart.location,
        date: chart.date,
        time: chart.time,
        personGender: chart.personGender,
        unknownTime: chart.unknownTime,
      });
    }
    setQuickSelectVisible({});
  };

  const handleReadingVoiceChange = (value: string) => {
    updateFormData({ readingVoice: value });
  };

  const handleEnableUserPromptChange = (enabled: boolean) => {
    updateFormData({ enableUserPrompt: enabled });
  };

  const handleUserPromptTextChange = (text: string) => {
    updateFormData({ userPromptText: text });
  };

  const handleEnableTransitChange = (enabled: boolean) => {
    updateFormData({ enableTransit: enabled });
  };

  const handleTransitChange = (transit: any) => {
    updateFormData({ transit });
  };

  const handleHouseSystemChange = (value: string) => {
    updateFormData({ houseSystem: value });
  };

  const handleSkipOutOfSignAspectsChange = (value: boolean) => {
    updateFormData({ skipOutOfSignAspects: value });
  };

  const handleRawModeChange = (value: boolean) => {
    updateFormData({ rawMode: value });
  };

  const handleOrbSensitivityChange = (value: OrbSensitivity) => {
    updateFormData({ orbSensitivity: value });
  };

  const renderChartForm = (chart: ChartData, index: number) => {
    const isFirstChart = index === 0;

    return (
      <Card key={index} style={theme.getCardStyle()}>
        <Card.Content>
          <ChartForm
            chart={chart}
            onUpdate={updates => updateChart(index, updates)}
            errors={errors.charts[index]}
            title={`Chart ${index + 1}`}
            showQuickSelect={true}
            onQuickSelectPress={() =>
              setQuickSelectVisible({ chartIndex: index })
            }
            showRemove={!isFirstChart}
            onRemove={() => removeChart(index)}
          />
        </Card.Content>
      </Card>
    );
  };
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.app.colors.background,
        padding: 16,
      }}
    >
      {/* Instructions */}
      <Card style={[theme.getCardStyle(), { marginBottom: 24 }]}>
        <Card.Content>
          <Text
            style={[
              theme.getHeaderStyle('medium'),
              {
                textAlign: 'center',
                marginBottom: 12,
                color: theme.app.colors.primary,
              },
            ]}
          >
            How Chart2AI Works
          </Text>
          <Text
            style={[
              theme.getTextStyle('body'),
              {
                textAlign: 'center',
                lineHeight: 24,
                fontSize: 16,
                opacity: 0.95,
              },
            ]}
          >
            Enter your birth chart details below (or include as many charts as
            you want for a multi-person reading), then generate your chart
            prompt.
          </Text>
        </Card.Content>
      </Card>

      {/* Chart Forms */}
      {formData.charts.map((chart, index) => renderChartForm(chart, index))}

      {/* Add Chart Button */}
      {formData.charts.length < MAX_CHARTS && (
        <Button
          mode="contained"
          onPress={addChart}
          style={[
            theme.getButtonStyle('primary'),
            {
              marginBottom: 16,
              paddingVertical: 8,
            },
          ]}
          labelStyle={{
            fontSize: 16,
            fontWeight: 'bold',
          }}
          icon="plus"
        >
          Add Another Chart
        </Button>
      )}

      <SectionDivider />

      {/* Transit Analysis */}
      <TransitAnalysisCard
        enableTransit={formData.enableTransit}
        transit={formData.transit}
        onEnableTransitChange={handleEnableTransitChange}
        onTransitChange={handleTransitChange}
        error={errors.transit?.location}
      />

      <SectionDivider />

      {/* Reading Settings */}
      <ReadingSettingsCard
        readingVoice={formData.readingVoice}
        onReadingVoiceChange={handleReadingVoiceChange}
        orbSensitivity={formData.orbSensitivity}
        onOrbSensitivityChange={handleOrbSensitivityChange}
      />

      <SectionDivider />

      {/* User Prompt */}
      <UserPromptCard
        enableUserPrompt={formData.enableUserPrompt}
        userPromptText={formData.userPromptText}
        onEnableUserPromptChange={handleEnableUserPromptChange}
        onUserPromptTextChange={handleUserPromptTextChange}
      />

      <SectionDivider />

      {/* Advanced Astrology Options */}
      <Card style={theme.getCardStyle()}>
        <Card.Content>
          <AdvancedAstrologyOptions
            houseSystem={formData.houseSystem}
            onHouseSystemChange={handleHouseSystemChange}
            skipOutOfSignAspects={formData.skipOutOfSignAspects}
            onSkipOutOfSignAspectsChange={handleSkipOutOfSignAspectsChange}
            rawMode={formData.rawMode}
            onRawModeChange={handleRawModeChange}
          />
        </Card.Content>
      </Card>

      <SectionDivider />

      {/* Submit Button */}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        labelStyle={{
          fontSize: 16,
          fontWeight: 'bold',
        }}
        style={[
          theme.getButtonStyle('primary'),
          {
            marginTop: 8,
            marginBottom: submitError ? 8 : 32,
            paddingVertical: 8,
          },
        ]}
      >
        Generate Chart Prompt
      </Button>

      {/* Error Display */}
      {submitError ? (
        <HelperText
          type="error"
          visible={true}
          style={{
            marginBottom: 32,
            textAlign: 'center',
            fontSize: 14,
          }}
        >
          {submitError}
        </HelperText>
      ) : null}

      <EmailSubscriptionForm />

      {/* Quick Select Modal */}
      {quickSelectVisible.chartIndex !== undefined && (
        <ChartQuickSelect
          visible={true}
          onDismiss={() => setQuickSelectVisible({})}
          onSelectChart={chart =>
            handleChartSelect(chart, quickSelectVisible.chartIndex)
          }
          onViewAll={() => setShowChartLibrary(true)}
        />
      )}

      {/* Chart Library Modal */}
      <ChartLibrary
        visible={showChartLibrary}
        onDismiss={() => setShowChartLibrary(false)}
      />
    </ScrollView>
  );
};

export default AstroForm;
