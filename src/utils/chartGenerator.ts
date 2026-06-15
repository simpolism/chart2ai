import {
  analyzeCharts,
  formatReportToText,
  ChartData,
  AnalysisSettings,
} from 'chart2txt';
import {
  ChartFormData,
  AstroApiResponse,
  ChartData as AppChartData,
  TransitData,
  OrbSensitivity,
} from '../types';
import { getAstroData } from './astroApi';
import { SYSTEM_PROMPT } from '../data/systemPrompt';
import {
  READING_VOICE_PROMPTS,
  READING_STYLE_PROMPTS,
  READING_VOICE_SECTIONS,
  READING_STYLE_SECTIONS,
  combineFilteredSections,
} from '../data/promptSections';
import type { ReadingContext } from '../data/promptSections';
import {
  applyDynamicFiltering,
  getDefaultFilteringSettings,
} from './chartFiltering';
import { formatDateToYMD, formatDateToMDY } from './dateUtils';

/**
 * Maps orb sensitivity setting to chart2txt aspect definitions
 */
const getAspectDefinitionsFromOrbSensitivity = (
  orbSensitivity: OrbSensitivity
): 'tight' | 'modern' | 'wide' => {
  switch (orbSensitivity) {
    case 'simple':
    case 'tight':
      return 'tight';
    case 'balanced':
      return 'modern';
    case 'wide':
      return 'wide';
    default:
      return 'modern';
  }
};

const convertToChartData = (
  chart: AppChartData,
  apiResponse: AstroApiResponse,
  chartName: string,
  chartType: 'natal' | 'event' | 'transit' = 'natal'
): ChartData => {
  return {
    name: chartName,
    planets: apiResponse.planets.map(planet => ({
      name: planet.name,
      degree: planet.longitude,
      speed: planet.speed,
    })),
    ascendant: !chart.unknownTime ? apiResponse.ascendant : undefined,
    midheaven: !chart.unknownTime ? apiResponse.midheaven : undefined,
    houseCusps: !chart.unknownTime ? apiResponse.houseCusps : undefined,
    houseSystemName: apiResponse.houseSystemName,
    location: chart.location,
    timestamp: new Date(`${formatDateToYMD(chart.date)}T${chart.time}:00`),
    chartType,
  };
};

const convertTransitToChartData = (
  transit: TransitData,
  apiResponse: AstroApiResponse
): ChartData => {
  return {
    name: `Transits for ${formatDateToMDY(transit.date)} at ${transit.location}`,
    planets: apiResponse.planets.map(planet => ({
      name: planet.name,
      degree: planet.longitude,
      speed: planet.speed,
    })),
    ascendant: apiResponse.ascendant,
    midheaven: apiResponse.midheaven,
    houseCusps: apiResponse.houseCusps,
    houseSystemName: apiResponse.houseSystemName,
    location: transit.location,
    timestamp: new Date(`${formatDateToYMD(transit.date)}T${transit.time}:00`),
    chartType: 'transit',
  };
};

export const generateChartText = async (
  formData: ChartFormData
): Promise<string> => {
  try {
    const chartData: ChartData[] = [];

    // Process all charts in the array
    for (let i = 0; i < formData.charts.length; i++) {
      const chart = formData.charts[i];
      const date = formatDateToYMD(chart.date);
      const time = `${chart.time}:00`;
      const apiResponse = await getAstroData(
        date,
        time,
        chart.location,
        formData.houseSystem
      );

      const chartName = chart.name || `Chart ${i + 1}`;
      const chartType = chart.isEvent ? 'event' : 'natal';
      const convertedChart = convertToChartData(
        chart,
        apiResponse,
        chartName,
        chartType
      );
      chartData.push(convertedChart);
    }

    // Add transit data if enabled
    if (formData.enableTransit && formData.transit) {
      const transitDate = formatDateToYMD(formData.transit.date);
      const transitTime = `${formData.transit.time}:00`;
      const transitApiResponse = await getAstroData(
        transitDate,
        transitTime,
        formData.transit.location,
        formData.houseSystem
      );
      const transitChart = convertTransitToChartData(
        formData.transit,
        transitApiResponse
      );
      chartData.push(transitChart);
    }

    // Step 1: Analyze charts using advanced workflow
    const analysisSettings: AnalysisSettings = {
      aspectDefinitions: getAspectDefinitionsFromOrbSensitivity(
        formData.orbSensitivity
      ),
      skipOutOfSignAspects: formData.skipOutOfSignAspects,
      includeAspectPatterns: true,
      includeSignDistributions: true,
      includeHouseOverlays: true,
      includeDispositors: true,
    };

    // Apply orb sensitivity-based flag adjustments
    const totalChartCount =
      formData.enableTransit && formData.transit
        ? chartData.length + 1
        : chartData.length;

    if (formData.orbSensitivity === 'simple') {
      // For "simple" setting: disable patterns, house overlays, set dispositors to finals only
      analysisSettings.includeAspectPatterns = false;
      analysisSettings.includeHouseOverlays = false;
      analysisSettings.includeDispositors = 'finals';
    } else {
      if (totalChartCount > 2 && totalChartCount <= 5) {
        // "small" configuration: set dispositors to finals only
        analysisSettings.includeDispositors = 'finals';
      } else if (totalChartCount > 5) {
        // "large" configuration: set dispositors to finals, disable house overlays
        analysisSettings.includeDispositors = 'finals';
        analysisSettings.includeHouseOverlays = false;
      }
    }

    const inputData = chartData.length === 1 ? chartData[0] : chartData;
    const rawReport = analyzeCharts(inputData, analysisSettings);

    // Step 2: Apply dynamic filtering and grouping
    // Create filtering settings that respect the user's orb sensitivity preference
    const effectiveFilteringSettings = {
      ...formData.filteringSettings,
      dynamicOrbs: getDefaultFilteringSettings(formData.orbSensitivity)
        .dynamicOrbs,
    };

    const filteredReport = applyDynamicFiltering(
      rawReport,
      effectiveFilteringSettings,
      formData.orbSensitivity
    );

    // Step 3: Ensure consistent date formatting before converting to text
    // Override the report's settings to explicitly set US date format
    const reportWithFixedSettings = {
      ...filteredReport,
      settings: {
        ...filteredReport.settings,
        dateFormat: 'MM/DD/YYYY', // Explicitly set US date format to prevent locale fallback
      },
    };

    return formatReportToText(reportWithFixedSettings);
  } catch (error) {
    console.error('Error generating chart text:', error);
    throw error;
  }
};

export const generateDisplayText = (
  chartText: string,
  formData: ChartFormData
): string => {
  // If raw mode is enabled, return only the chart text without any prompts
  if (formData.rawMode) {
    return chartText;
  }

  const sections: string[] = [];

  // Reconstruct analysis settings to determine flags
  let includeHouseOverlays = true;
  let includeAspectPatterns = true;

  const totalChartCount =
    formData.enableTransit && formData.transit
      ? formData.charts.length + 1
      : formData.charts.length;

  // Used condensed mode if set to simple or using many charts
  let condensed = false;
  if (formData.orbSensitivity === 'simple') {
    includeAspectPatterns = false;
    includeHouseOverlays = false;
    condensed = true;
  } else if (totalChartCount > 5) {
    includeHouseOverlays = false;
    condensed = true;
  }

  // Create reading context for filtering
  const readingContext: ReadingContext = {
    nCharts: formData.charts.length,
    hasTransits: formData.enableTransit && !!formData.transit,
    includeHouseOverlays,
    includeAspectPatterns,
  };

  // Add system prompt if enabled
  if (formData.systemPromptEnabled) {
    sections.push(SYSTEM_PROMPT.text);
  }

  // Chart text goes after initial system prompt
  sections.push(
    `=== CHART DATA FOR ANALYSIS ===\n${chartText}\n=== END CHART DATA ===`
  );

  // Add reading voice if not 'none'
  if (
    formData.readingVoice !== 'none' &&
    READING_VOICE_SECTIONS[
      formData.readingVoice as keyof typeof READING_VOICE_SECTIONS
    ]
  ) {
    const voiceSections =
      READING_VOICE_SECTIONS[
        formData.readingVoice as keyof typeof READING_VOICE_SECTIONS
      ];
    const voiceText = condensed
      ? combineFilteredSections(voiceSections, readingContext)
      : READING_VOICE_PROMPTS[
          formData.readingVoice as keyof typeof READING_VOICE_PROMPTS
        ];

    if (voiceText) {
      sections.push(
        `=== VOICE AND STYLE GUIDELINES ===\n${voiceText}\n=== END VOICE AND STYLE GUIDELINES ===`
      );
    }
  }

  // Add reading style if not 'none'
  if (
    formData.readingStyle !== 'none' &&
    READING_STYLE_SECTIONS[
      formData.readingStyle as keyof typeof READING_STYLE_SECTIONS
    ]
  ) {
    const styleSections =
      READING_STYLE_SECTIONS[
        formData.readingStyle as keyof typeof READING_STYLE_SECTIONS
      ];
    const styleText = condensed
      ? combineFilteredSections(styleSections, readingContext)
      : READING_STYLE_PROMPTS[
          formData.readingStyle as keyof typeof READING_STYLE_PROMPTS
        ];

    if (styleText) {
      sections.push(
        `=== INTERPRETIVE GUIDELINES ===\n${styleText}\n=== END INTERPRETIVE GUIDELINES ===`
      );
    }
  }

  // Add user prompt if enabled and provided
  if (formData.enableUserPrompt && formData.userPromptText.trim()) {
    sections.push(`ADDITIONAL USER PROMPT: ${formData.userPromptText.trim()}`);
  }

  // Join all sections with double newlines, then add reading prompt
  let result = sections.join('\n\n') + '\n\nBEGIN INTERPRETATION:';

  return result;
};
