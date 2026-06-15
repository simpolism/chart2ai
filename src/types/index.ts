export interface ApiError {
  message: string;
  status?: number;
}

export interface ChartData {
  name?: string;
  personGender?: 'male' | 'female' | 'other'; // Person's gender
  date: Date;
  time: string; // HH:MM format
  unknownTime?: boolean; // Flag for unknown birth time
  location: string;
  isEvent?: boolean; // Flag for event charts vs natal charts
}

export interface TransitData {
  location: string;
  date: Date;
  time: string;
}

export interface PlanetWeights {
  Sun: number;
  Moon: number;
  Mercury: number;
  Venus: number;
  Mars: number;
  Jupiter: number;
  Saturn: number;
  Uranus: number;
  Neptune: number;
  Pluto: number;
  Ascendant: number;
  Midheaven: number;
  'North Node': number;
}

export interface OrbThresholds {
  tight: number;
  moderate: number;
  wide: number;
}

export interface DynamicOrbSettings {
  single: OrbThresholds; // 1 chart
  pair: OrbThresholds; // 2 charts
  small: OrbThresholds; // 3-5 charts
  large: OrbThresholds; // 6+ charts
}

export interface AspectCountLimits {
  small: number; // Limit for 4+ charts
  large: number; // Limit for 6+ charts
}

export interface PatternCountLimits {
  small: number; // Limit for 4+ charts
  large: number; // Limit for 6+ charts
  maxPerType: number; // Max patterns per type for large groups
}

export interface FilteringSettings {
  planetWeights: PlanetWeights;
  dynamicOrbs: DynamicOrbSettings;
  aspectCountLimits: AspectCountLimits;
  patternCountLimits: PatternCountLimits;
}

export type OrbSensitivity = 'simple' | 'tight' | 'balanced' | 'wide';

export interface ChartFormData {
  charts: ChartData[];
  transit?: TransitData;
  houseSystem: string; // P, W, E, O
  enableTransit: boolean;
  enableUserPrompt: boolean; // Toggle for user prompt section (default: false)
  userPromptText: string; // Editable user prompt text
  systemPromptEnabled: boolean; // Toggle for including system prompt
  readingVoice: string; // "standard" | "none"
  readingStyle: string; // "modern" | "traditional" | "none"
  skipOutOfSignAspects: boolean; // Skip aspects between planets in different signs (default: true)
  rawMode: boolean; // Raw mode - only output chart2txt data without any prompts (default: false)
  orbSensitivity: OrbSensitivity; // Orb sensitivity setting for aspect calculation and filtering (default: 'balanced')
  filteringSettings: FilteringSettings; // Advanced filtering configuration
}

export interface LocationSuggestion {
  name: string;
  latitude: number;
  longitude: number;
  fullAddress: string;
}

export interface AstroApiResponse {
  planets: Array<{
    name: string;
    longitude: number;
    speed: number;
  }>;
  ascendant: number;
  midheaven: number;
  houseCusps: number[];
  houseSystemName: string;
  date: string;
  time: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timezone?: string;
}

export interface SavedChart {
  id: string; // UUID
  name: string; // Display name (user-editable)
  personGender?: 'male' | 'female' | 'other'; // Person's gender
  date: Date; // Birth date
  time: string; // Birth time (HH:MM format)
  unknownTime?: boolean; // Flag for unknown birth time
  location: string; // Birth location
  createdAt: Date; // When first saved
  lastUsed: Date; // When last used
  isStarred?: boolean; // Flag for starred/favorite charts
}

export type ChartType = 'natal' | 'event' | 'transit';

export interface SavedResult {
  id: string; // UUID
  name: string; // User-editable display name
  timestamp: Date; // When generated
  formData: ChartFormData; // Complete configuration
  chartText: string; // Raw chart data from chart2txt
  displayText: string; // Complete text including prompts
}
