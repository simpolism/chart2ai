import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { usePlatformInfo } from './src/utils/platform';
import {
  PaperProvider,
  Appbar,
  Text,
  ActivityIndicator,
  Portal,
} from 'react-native-paper';
import { useAppTheme, theme as paperTheme } from './src/theme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AstroForm } from './src/components/chart-generation';
import { ChartLibrary } from './src/components/chart-management';
import { ResultLibrary } from './src/components/chart-management';
import { ChartResultDialog } from './src/components/chart-results';
import { LoadingDialog } from './src/components/chart-generation';
import { WebResponsiveContainer } from './src/components/shared';
import { InfoDialog } from './src/components/shared';
import { ChartFormData, SavedResult } from './src/types';
import { trackEvent } from './src/utils/metrics';
import { loadFonts } from './src/utils/fonts';

import {
  generateChartText,
  generateDisplayText,
} from './src/utils/chartGenerator';
import { saveFormData, loadFormData } from './src/utils/storage';
import { autoSaveChartsFromForm } from './src/utils/chartStorage';
import { saveResult } from './src/utils/resultStorage';

/**
 * Add gender suffixes to chart text based on personGender
 */
const addGenderSuffixes = (
  chartText: string,
  formData: ChartFormData | null
): string => {
  let result = chartText;

  if (formData?.charts) {
    formData.charts.forEach(chart => {
      if (chart.name && chart.personGender && chart.personGender !== 'other') {
        const genderSuffix = chart.personGender === 'male' ? ' (M)' : ' (F)';
        const pattern = new RegExp(`\\[CHART: ${chart.name}\\]`, 'g');
        result = result.replace(
          pattern,
          `[CHART: ${chart.name}${genderSuffix}]`
        );
      }
    });
  }

  return result;
};

export default function App() {
  const appTheme = useAppTheme();
  const platformInfo = usePlatformInfo();
  const [formData, setFormData] = useState<ChartFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showChartLibrary, setShowChartLibrary] = useState(false);
  const [showResultLibrary, setShowResultLibrary] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const [displayText, setDisplayText] = useState<string>('');
  const [loadedFormData, setLoadedFormData] = useState<
    ChartFormData | undefined
  >();
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [formError, setFormError] = useState<string>('');

  // Load saved form data and fonts on app startup
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Load fonts first
        await loadFonts();

        const savedData = await loadFormData();
        if (savedData) {
          setFormData(savedData);
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      } finally {
        setInitializing(false);
      }
    };

    loadSavedData();
  }, []);

  // Save form data whenever it changes
  useEffect(() => {
    if (formData && !initializing) {
      saveFormData(formData);
    }
  }, [formData, initializing]);

  const handleFormDataChange = (data: ChartFormData) => {
    setFormData(data);
  };

  const handleSubmit = async (data: ChartFormData) => {
    setLoading(true);
    setDisplayText('');
    setFormError(''); // Clear any previous errors

    // Track chart generation start
    trackEvent('chart_generation_started', {
      chart_count: data.charts.length,
      has_transit: data.enableTransit,
      reading_voice: data.readingVoice,
      house_system: data.houseSystem,
      user_prompt_length: data.userPromptText.length,
    });

    try {
      const result = await generateChartText(data);

      // Add gender suffixes to chart text
      const resultWithGender = addGenderSuffixes(result, data);

      // Generate display text with system and user prompts
      const textToDisplay = generateDisplayText(resultWithGender, data);
      setDisplayText(textToDisplay);

      setShowResult(true);

      // Track successful chart generation
      trackEvent('chart_generation_completed', {
        success: true,
      });

      // Auto-save charts after successful chart generation
      await autoSaveChartsFromForm(data);

      // Auto-save result to Result Library
      try {
        await saveResult(data, resultWithGender, textToDisplay);
      } catch (error) {
        console.error('Error saving result:', error);
        // Don't show error to user for this auto-save
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      setFormError(errorMessage); // Set form error instead of showing alert
      console.error('Chart generation error:', error);

      // Track chart generation error
      trackEvent('chart_generation_error', {
        error_message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const closeResultDialog = () => {
    setShowResult(false);
  };

  const handleLoadResult = (result: SavedResult) => {
    // Load the result and show it in the result dialog
    setDisplayText(result.displayText);

    setShowResult(true);
  };

  const handleLoadForm = (result: SavedResult) => {
    // Load the form data for re-generation using separate prop to avoid loops
    setLoadedFormData(result.formData);
    // Clear it after a brief moment to allow the effect to run
    setTimeout(() => setLoadedFormData(undefined), 100);
  };

  if (initializing) {
    return (
      <PaperProvider theme={paperTheme}>
        <SafeAreaProvider>
          <SafeAreaView
            style={{
              flex: 1,
              justifyContent: 'center' as const,
              alignItems: 'center' as const,
              backgroundColor: appTheme.app.colors.background,
            }}
          >
            <ActivityIndicator size="large" />
            <Text
              style={{
                marginTop: 16,
                fontSize: 16,
                color: appTheme.app.colors.onSurface,
              }}
            >
              Loading...
            </Text>
          </SafeAreaView>
        </SafeAreaProvider>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: appTheme.app.colors.background }}
          edges={platformInfo.isWeb ? [] : ['bottom', 'left', 'right']}
        >
          <WebResponsiveContainer>
            <Appbar.Header
              style={{
                backgroundColor: appTheme.app.colors.surfaceContainer,
                borderBottomWidth: appTheme.app.effects.borderWidth,
                borderBottomColor: appTheme.app.colors.border,
                borderLeftWidth: appTheme.app.effects.borderWidth,
                borderRightWidth: appTheme.app.effects.borderWidth,
                borderTopWidth: appTheme.app.effects.borderWidth,
                borderLeftColor: appTheme.app.colors.border,
                borderRightColor: appTheme.app.colors.border,
                borderTopColor: appTheme.app.colors.border,
                borderTopLeftRadius: appTheme.app.effects.borderRadius,
                borderTopRightRadius: appTheme.app.effects.borderRadius,
                paddingHorizontal: 8,
                paddingVertical: 4,
                shadowColor: appTheme.app.colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
                ...(platformInfo.isWeb && {
                  boxShadow: `0 0 12px ${appTheme.app.effects.glow}`,
                }),
              }}
            >
              <Appbar.Content
                title={
                  <Text
                    style={appTheme.getHeaderStyle('large')}
                    onPress={() => {
                      if (platformInfo.isWeb) {
                        window.location.href = '/';
                      }
                    }}
                  >
                    Chart2AI
                  </Text>
                }
              />
              <Appbar.Action
                icon="history"
                onPress={() => {
                  trackEvent('result_library_opened');
                  setShowResultLibrary(true);
                }}
                iconColor={appTheme.getIconColor('primary')}
              />
              <Appbar.Action
                icon="account-group"
                onPress={() => {
                  trackEvent('chart_library_opened');
                  setShowChartLibrary(true);
                }}
                iconColor={appTheme.getIconColor('primary')}
              />
              <Appbar.Action
                icon="information"
                onPress={() => {
                  trackEvent('info_dialog_opened');
                  setShowInfoDialog(true);
                }}
                iconColor={appTheme.getIconColor('primary')}
              />
            </Appbar.Header>

            <AstroForm
              onSubmit={handleSubmit}
              loading={loading}
              initialData={formData || undefined}
              onDataChange={handleFormDataChange}
              loadedData={loadedFormData}
              error={formError}
            />
          </WebResponsiveContainer>

          {/* Result Dialog */}
          {formData ? (
            <ChartResultDialog
              visible={showResult}
              onDismiss={closeResultDialog}
              displayText={displayText}
              formData={formData}
              onCopySuccess={() =>
                Alert.alert('Copied!', 'Chart data copied to clipboard')
              }
              onCopyError={() =>
                Alert.alert('Error', 'Failed to copy to clipboard')
              }
              onShareError={() =>
                Alert.alert('Error', 'Failed to share chart data')
              }
            />
          ) : null}

          {/* All Portals managed centrally for proper layering */}
          <Portal>
            <LoadingDialog visible={loading} />
          </Portal>

          <Portal>
            <ChartLibrary
              visible={showChartLibrary}
              onDismiss={() => setShowChartLibrary(false)}
            />
          </Portal>

          <Portal>
            <ResultLibrary
              visible={showResultLibrary}
              onDismiss={() => setShowResultLibrary(false)}
              onLoadResult={handleLoadResult}
              onLoadForm={handleLoadForm}
            />
          </Portal>

          <Portal>
            <InfoDialog
              visible={showInfoDialog}
              onDismiss={() => setShowInfoDialog(false)}
            />
          </Portal>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
