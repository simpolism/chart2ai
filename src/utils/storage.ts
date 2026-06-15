import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChartFormData } from '../types';
import { serializeDateForStorage, parseStoredDate } from './dateUtils';
import { getDefaultFilteringSettings } from './chartFiltering';

const STORAGE_KEY = 'chart2ai_form_data';

export const saveFormData = async (data: ChartFormData): Promise<void> => {
  try {
    const jsonValue = JSON.stringify({
      ...data,
      charts: data.charts.map(chart => ({
        ...chart,
        date: serializeDateForStorage(chart.date),
      })),
      transit: data.transit
        ? { ...data.transit, date: serializeDateForStorage(data.transit.date) }
        : undefined,
    });
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving form data:', error);
  }
};

export const loadFormData = async (): Promise<ChartFormData | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (!jsonValue) return null;

    const parsedData = JSON.parse(jsonValue);

    // Merge stored filteringSettings with defaults to handle missing properties
    const defaultSettings = getDefaultFilteringSettings();
    const migratedFilteringSettings = parsedData.filteringSettings
      ? {
          planetWeights: {
            ...defaultSettings.planetWeights,
            ...parsedData.filteringSettings.planetWeights,
          },
          dynamicOrbs: {
            ...defaultSettings.dynamicOrbs,
            ...parsedData.filteringSettings.dynamicOrbs,
          },
          aspectCountLimits: {
            ...defaultSettings.aspectCountLimits,
            ...parsedData.filteringSettings.aspectCountLimits,
          },
          patternCountLimits: {
            ...defaultSettings.patternCountLimits,
            ...parsedData.filteringSettings.patternCountLimits,
          },
        }
      : defaultSettings;

    return {
      ...parsedData,
      charts: parsedData.charts.map((chart: any) => ({
        ...chart,
        date: parseStoredDate(chart.date),
      })),
      transit: parsedData.transit
        ? {
            ...parsedData.transit,
            date: parseStoredDate(parsedData.transit.date),
          }
        : undefined,
      selectedPromptId: parsedData.selectedPromptId || null,
      userPromptText: parsedData.userPromptText || '', // Default to empty string
      systemPromptEnabled:
        parsedData.systemPromptEnabled !== undefined
          ? parsedData.systemPromptEnabled
          : true, // Default to enabled
      readingVoice: parsedData.readingVoice || 'standard', // Default to standard
      readingStyle: parsedData.readingStyle || 'modern', // Default to modern
      skipOutOfSignAspects:
        parsedData.skipOutOfSignAspects !== undefined
          ? parsedData.skipOutOfSignAspects
          : true,
      rawMode: parsedData.rawMode !== undefined ? parsedData.rawMode : false,
      filteringSettings: migratedFilteringSettings,
    };
  } catch (error) {
    console.error('Error loading form data:', error);
    return null;
  }
};

export const clearFormData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing form data:', error);
  }
};
