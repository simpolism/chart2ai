import { ChartData } from '../types';

export interface ChartValidationErrors {
  name?: string;
  location?: string;
  time?: string;
  personGender?: string;
}

export const validateChartData = (
  chart: ChartData
): {
  isValid: boolean;
  errors: ChartValidationErrors;
} => {
  const errors: ChartValidationErrors = {};

  if (!chart.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!chart.location?.trim()) {
    errors.location = 'Location is required';
  }

  if (!chart.personGender) {
    errors.personGender = 'Gender selection is required';
  }

  // Time validation for manual input
  if (!chart.unknownTime && chart.time) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(chart.time)) {
      errors.time = 'Time must be in HH:MM format';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
