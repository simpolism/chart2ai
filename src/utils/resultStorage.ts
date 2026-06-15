import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedResult, ChartFormData } from '../types';
import {
  serializeDateForStorage,
  parseStoredDate,
  formatDateToMDY,
} from './dateUtils';

const STORAGE_KEY = '@chart2ai_result_library';
const MAX_RESULTS = 100;

// Serialize dates for storage
const serializeResult = (result: SavedResult): any => ({
  ...result,
  timestamp: serializeDateForStorage(result.timestamp),
  formData: {
    ...result.formData,
    charts: result.formData.charts.map(chart => ({
      ...chart,
      date: serializeDateForStorage(chart.date),
    })),
    transit: result.formData.transit
      ? {
          ...result.formData.transit,
          date: serializeDateForStorage(result.formData.transit.date),
        }
      : undefined,
  },
});

// Deserialize dates from storage
const deserializeResult = (stored: any): SavedResult => ({
  ...stored,
  timestamp: parseStoredDate(stored.timestamp),
  formData: {
    ...stored.formData,
    charts: stored.formData.charts.map((chart: any) => ({
      ...chart,
      date: parseStoredDate(chart.date),
    })),
    transit: stored.formData.transit
      ? {
          ...stored.formData.transit,
          date: parseStoredDate(stored.formData.transit.date),
        }
      : undefined,
  },
});

// Generate auto-name from form data (without date)
const generateAutoName = (formData: ChartFormData): string => {
  const chartNames = formData.charts.map(
    chart => chart.name || `Chart ${formData.charts.indexOf(chart) + 1}`
  );

  let name = chartNames.join(', ');
  if (chartNames.length > 2) {
    name = `${chartNames[0]}, ${chartNames[1]} +${chartNames.length - 2} more`;
  }

  if (formData.enableTransit) {
    name += ' + Transit';
  }

  return name;
};

// Get all results, sorted by timestamp (newest first)
export const getAllResults = async (): Promise<SavedResult[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const results = JSON.parse(stored);
    return results
      .map(deserializeResult)
      .sort(
        (a: SavedResult, b: SavedResult) =>
          b.timestamp.getTime() - a.timestamp.getTime()
      );
  } catch (error) {
    console.error('Error loading results:', error);
    return [];
  }
};

// Save results to storage
const saveResults = async (results: SavedResult[]): Promise<void> => {
  const serialized = results.map(serializeResult);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
};

// Save a new result
export const saveResult = async (
  formData: ChartFormData,
  chartText: string,
  displayText: string,
  customName?: string
): Promise<SavedResult> => {
  const results = await getAllResults();

  const newResult: SavedResult = {
    id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: customName || generateAutoName(formData),
    timestamp: new Date(),
    formData,
    chartText,
    displayText,
  };

  // Add new result and limit to MAX_RESULTS (remove oldest if needed)
  const updatedResults = [newResult, ...results];
  if (updatedResults.length > MAX_RESULTS) {
    updatedResults.splice(MAX_RESULTS);
  }

  await saveResults(updatedResults);
  return newResult;
};

// Delete a result
export const deleteResult = async (id: string): Promise<void> => {
  const results = await getAllResults();
  const filtered = results.filter(r => r.id !== id);
  await saveResults(filtered);
};

// Update result name
export const updateResultName = async (
  id: string,
  newName: string
): Promise<void> => {
  const results = await getAllResults();
  const index = results.findIndex(r => r.id === id);

  if (index === -1) {
    throw new Error('Result not found');
  }

  results[index] = { ...results[index], name: newName };
  await saveResults(results);
};

// Get result by ID
export const getResultById = async (
  id: string
): Promise<SavedResult | null> => {
  const results = await getAllResults();
  return results.find(r => r.id === id) || null;
};

// Generate detailed summary for results (used by both dialog and library)
export const generateDetailedSummary = (formData: ChartFormData): string => {
  let summary = '';

  // Chart details - one line per chart with gender info
  formData.charts.forEach((chart, index) => {
    const chartName = chart.name || `Chart ${index + 1}`;
    const date = formatDateToMDY(chart.date);
    const time = chart.unknownTime ? 'unknown time' : chart.time;
    const location = chart.location;
    const genderFlag =
      chart.personGender && chart.personGender !== 'other'
        ? chart.personGender === 'male'
          ? ' (M)'
          : ' (F)'
        : '';

    summary += `${chartName}${genderFlag}: ${date}, ${time} - ${location}`;
    if (index < formData.charts.length - 1) summary += '\n';
  });

  // Transit info with full date if enabled
  if (formData.enableTransit && formData.transit) {
    const transitDate = formatDateToMDY(formData.transit.date);
    const transitTime = formData.transit.time;
    const transitLocation = formData.transit.location;
    summary += `\nTransit: ${transitDate}, ${transitTime} - ${transitLocation}`;
  }

  // Configuration
  const configItems = [];

  // House system mapping to full names (always included)
  const houseSystemMap: Record<string, string> = {
    W: 'Whole Sign',
    P: 'Placidus',
    E: 'Equal',
    O: 'Porphyry',
  };
  const houseSystemName =
    houseSystemMap[formData.houseSystem] || formData.houseSystem;
  configItems.push(`${houseSystemName} Houses`);

  // Voice (always included, capitalized)
  const capitalizedVoice = formData.readingVoice
    ? formData.readingVoice.charAt(0).toUpperCase() +
      formData.readingVoice.slice(1)
    : 'Standard';
  configItems.push(`${capitalizedVoice} Voice`);

  // Style and system prompt (only when non-default)
  if (formData.readingStyle !== 'modern')
    configItems.push(`${formData.readingStyle} Style`);
  if (!formData.systemPromptEnabled) configItems.push('No System Prompt');
  if (formData.orbSensitivity !== 'balanced') {
    const capitalizedSensitivity = formData.orbSensitivity
      ? formData.orbSensitivity.charAt(0).toUpperCase() +
        formData.orbSensitivity.slice(1)
      : 'Balanced';
    configItems.push(`${capitalizedSensitivity} Sensitivity`);
  }

  // Orb filtering is now handled automatically by dynamic filtering

  // Out-of-sign aspects (only when false, since true is default)
  if (formData.skipOutOfSignAspects === false) {
    configItems.push('Include Out-of-Sign Aspects');
  }

  if (configItems.length > 0) {
    summary += `\nConfig: ${configItems.join(', ')}`;
  }

  // User prompt preview
  if (formData.userPromptText?.trim()) {
    const promptPreview =
      formData.userPromptText.trim().length > 50
        ? `${formData.userPromptText.trim().substring(0, 50)}...`
        : formData.userPromptText.trim();
    summary += `\nPrompt: ${promptPreview}`;
  }

  return summary;
};

// Generate summary text for a result (2-3 lines) - legacy for backward compatibility
export const generateResultSummary = (result: SavedResult): string => {
  return generateDetailedSummary(result.formData);
};
