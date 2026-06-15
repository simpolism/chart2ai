import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedChart } from '../types';
import {
  serializeDateForStorage,
  parseStoredDate,
  formatDateToMDY,
} from './dateUtils';

const CHARTS_STORAGE_KEY = '@chart2ai_charts';
const MAX_CHARTS = 100;

/**
 * Generate a simple UUID
 */
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Generate auto-name when no name provided
 */
const generateAutoChartName = (date: Date, location: string): string => {
  return `${formatDateToMDY(date)} - ${location}`;
};

/**
 * Get all saved charts from storage
 */
export const getSavedCharts = async (): Promise<SavedChart[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(CHARTS_STORAGE_KEY);
    if (jsonValue) {
      const parsed = JSON.parse(jsonValue);
      return parsed
        .map((chart: any) => ({
          ...chart,
          date: parseStoredDate(chart.date),
          createdAt: new Date(chart.createdAt),
          lastUsed: new Date(chart.lastUsed),
          // Migration: convert isEvent to personGender
          personGender:
            chart.personGender || (chart.isEvent ? 'other' : undefined),
          // Migration: add isStarred field with default false
          isStarred: chart.isStarred || false,
        }))
        .sort((a: SavedChart, b: SavedChart) => a.name.localeCompare(b.name));
    }
    return [];
  } catch (error) {
    console.error('Error loading saved charts:', error);
    return [];
  }
};

/**
 * Save all charts to storage
 */
const saveChartsToStorage = async (charts: SavedChart[]): Promise<void> => {
  try {
    const serialized = charts.map(chart => ({
      ...chart,
      date: serializeDateForStorage(chart.date),
      createdAt: chart.createdAt.toISOString(),
      lastUsed: chart.lastUsed.toISOString(),
    }));
    await AsyncStorage.setItem(CHARTS_STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error('Error saving charts:', error);
    throw error;
  }
};

/**
 * Find existing chart by exact date, time, and location match
 */
export const findExistingChart = async (
  date: Date,
  time: string,
  location: string
): Promise<SavedChart | null> => {
  const charts = await getSavedCharts();
  return (
    charts.find(
      chart =>
        chart.date.toDateString() === date.toDateString() &&
        chart.time === time &&
        chart.location === location
    ) || null
  );
};

/**
 * Save a new chart
 */
export const saveChart = async (chartData: {
  name?: string;
  personGender?: 'male' | 'female' | 'other';
  date: Date;
  time: string;
  unknownTime?: boolean;
  location: string;
}): Promise<SavedChart> => {
  const charts = await getSavedCharts();

  // Check if we're at the limit
  if (charts.length >= MAX_CHARTS) {
    throw new Error(`Cannot save more than ${MAX_CHARTS} charts`);
  }

  const now = new Date();
  const newChart: SavedChart = {
    id: generateId(),
    name:
      chartData.name ||
      generateAutoChartName(chartData.date, chartData.location),
    personGender: chartData.personGender,
    date: chartData.date,
    time: chartData.time,
    unknownTime: chartData.unknownTime,
    location: chartData.location,
    createdAt: now,
    lastUsed: now,
  };

  const updatedCharts = [...charts, newChart];
  await saveChartsToStorage(updatedCharts);

  return newChart;
};

/**
 * Update chart data
 */
export const updateChart = async (
  id: string,
  updates: {
    name?: string;
    personGender?: 'male' | 'female' | 'other';
    date?: Date;
    time?: string;
    unknownTime?: boolean;
    location?: string;
  }
): Promise<void> => {
  const charts = await getSavedCharts();
  const chartIndex = charts.findIndex(chart => chart.id === id);

  if (chartIndex === -1) {
    throw new Error('Chart not found');
  }

  // Update only the provided fields
  Object.assign(charts[chartIndex], {
    ...updates,
    name: updates.name?.trim() || charts[chartIndex].name,
  });

  await saveChartsToStorage(charts);
};

/**
 * Delete chart
 */
export const deleteChart = async (id: string): Promise<void> => {
  const charts = await getSavedCharts();
  const filteredCharts = charts.filter(chart => chart.id !== id);
  await saveChartsToStorage(filteredCharts);
};

/**
 * Update chart's last used timestamp
 */
export const updateChartLastUsed = async (id: string): Promise<void> => {
  const charts = await getSavedCharts();
  const chartIndex = charts.findIndex(chart => chart.id === id);

  if (chartIndex !== -1) {
    charts[chartIndex].lastUsed = new Date();
    await saveChartsToStorage(charts);
  }
};

/**
 * Auto-save charts from form data after chart generation
 */
export const autoSaveChartsFromForm = async (formData: any): Promise<void> => {
  try {
    // Auto-save all charts
    for (const chart of formData.charts) {
      const existing = await findExistingChart(
        chart.date,
        chart.time,
        chart.location
      );

      if (!existing) {
        await saveChart({
          name: chart.name,
          personGender: chart.personGender,
          date: chart.date,
          time: chart.time,
          unknownTime: chart.unknownTime,
          location: chart.location,
        });
      } else {
        // Update last used timestamp
        await updateChartLastUsed(existing.id);
      }
    }
  } catch (error) {
    console.error('Error auto-saving charts:', error);
    // Don't throw error - this shouldn't block chart generation
  }
};

/**
 * Update chart starred status
 */
export const updateChartStarred = async (
  id: string,
  isStarred: boolean
): Promise<void> => {
  const charts = await getSavedCharts();
  const chartIndex = charts.findIndex(chart => chart.id === id);

  if (chartIndex === -1) {
    throw new Error('Chart not found');
  }

  charts[chartIndex].isStarred = isStarred;
  await saveChartsToStorage(charts);
};

/**
 * Get starred charts
 */
export const getStarredCharts = async (): Promise<SavedChart[]> => {
  const charts = await getSavedCharts();
  return charts
    .filter(chart => chart.isStarred)
    .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Get charts for Quick Select (starred + recent, deduplicated)
 */
export const getQuickSelectCharts = async (): Promise<SavedChart[]> => {
  const charts = await getSavedCharts();

  // Get starred charts
  const starredCharts = charts
    .filter(chart => chart.isStarred)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Get recent charts that aren't already starred
  const recentCharts = charts
    .filter(chart => !chart.isStarred)
    .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
    .slice(0, 5);

  // Return starred first, then recent
  return [...starredCharts, ...recentCharts];
};

/**
 * Get recently used charts (last 5) - kept for backward compatibility
 */
export const getRecentCharts = async (): Promise<SavedChart[]> => {
  const charts = await getSavedCharts();
  return charts
    .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
    .slice(0, 5);
};
