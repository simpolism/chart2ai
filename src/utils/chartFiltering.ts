/**
 * Chart Filtering Configuration
 *
 * This module contains all filtering logic for chart2txt v0.7.0 advanced workflow.
 * Separating these configurations makes them easy to modify and tune without
 * affecting the core chart generation logic.
 */

import { AspectData, AspectPattern, AstrologicalReport } from 'chart2txt';
import {
  FilteringSettings,
  PlanetWeights,
  DynamicOrbSettings,
  AspectCountLimits,
  PatternCountLimits,
  OrbSensitivity,
} from '../types';

// Default planet importance weights for aspect significance scoring
const DEFAULT_PLANET_WEIGHTS: PlanetWeights = {
  // Inner/Personal planets (highest priority)
  Sun: 5,
  Moon: 5,
  Mercury: 4,
  Venus: 4,
  Mars: 4,

  // Social planets (medium priority)
  Jupiter: 3,
  Saturn: 3,

  // Outer/Generational planets (lower priority)
  Uranus: 2,
  Neptune: 2,
  Pluto: 2,

  // Angles (highest priority when available)
  Ascendant: 5,
  Midheaven: 4,
  'North Node': 4,
};

// Aspect type weights for significance scoring
const ASPECT_TYPE_WEIGHTS = {
  conjunction: 5,
  opposition: 5,
  square: 4,
  trine: 4,
  sextile: 3,
  quincunx: 2,
  semisquare: 2,
  sesquiquadrate: 2,
  semisextile: 1,
  quintile: 1,
  biquintile: 1,
} as const;

// Default dynamic orb thresholds based on chart count
const DEFAULT_DYNAMIC_ORB_SETTINGS: DynamicOrbSettings = {
  single: { tight: 2.0, moderate: 5.0, wide: 8.0 },
  pair: { tight: 1.5, moderate: 4.0, wide: 6.0 },
  small: { tight: 1.0, moderate: 3.0, wide: 5.0 },
  large: { tight: 0.8, moderate: 2.0, wide: 4.0 },
};

/**
 * Creates dynamic orb settings based on user's orb sensitivity preference
 * These align with chart2txt's orb presets but scale with chart count
 */
const getDynamicOrbSettingsFromSensitivity = (
  orbSensitivity: OrbSensitivity
): DynamicOrbSettings => {
  switch (orbSensitivity) {
    case 'simple':
    case 'tight':
      return {
        single: { tight: 1.5, moderate: 3.0, wide: 5.0 },
        pair: { tight: 1.0, moderate: 2.5, wide: 4.0 },
        small: { tight: 0.8, moderate: 2.0, wide: 3.5 },
        large: { tight: 0.6, moderate: 1.5, wide: 3.0 },
      };
    case 'wide':
      return {
        single: { tight: 3.0, moderate: 7.0, wide: 12.0 },
        pair: { tight: 2.0, moderate: 5.5, wide: 9.0 },
        small: { tight: 1.5, moderate: 4.0, wide: 7.0 },
        large: { tight: 1.0, moderate: 3.0, wide: 5.5 },
      };
    case 'balanced':
    default:
      return DEFAULT_DYNAMIC_ORB_SETTINGS;
  }
};

// Default aspect count limits
const DEFAULT_ASPECT_COUNT_LIMITS: AspectCountLimits = {
  small: 100, // Limit for 4+ charts
  large: 50, // Limit for 6+ charts
};

// Default pattern count limits
const DEFAULT_PATTERN_COUNT_LIMITS: PatternCountLimits = {
  small: 12, // Limit for 4+ charts
  large: 8, // Limit for 6+ charts
  maxPerType: 2, // Max patterns per type for large groups
};

// Pattern type weights for significance scoring
const PATTERN_TYPE_WEIGHTS = {
  'Grand Cross': 6,
  'Grand Trine': 5,
  'T-Square': 4,
  Kite: 3,
  'Mystic Rectangle': 3,
  Yod: 2,
} as const;

/**
 * Creates default filtering settings
 */
export function getDefaultFilteringSettings(
  orbSensitivity?: OrbSensitivity
): FilteringSettings {
  return {
    planetWeights: DEFAULT_PLANET_WEIGHTS,
    dynamicOrbs: orbSensitivity
      ? getDynamicOrbSettingsFromSensitivity(orbSensitivity)
      : DEFAULT_DYNAMIC_ORB_SETTINGS,
    aspectCountLimits: DEFAULT_ASPECT_COUNT_LIMITS,
    patternCountLimits: DEFAULT_PATTERN_COUNT_LIMITS,
  };
}

// Default pattern orb limits by context
const DEFAULT_PATTERN_ORB_LIMITS = {
  natal: {
    default: 4.0,
    yod: 1.5,
    stellium: 30.0, // detect any stellium in natal charts
  },
  synastry: {
    default: 2.0,
    yod: 1.0,
    stellium: 3.0,
  },
  global: {
    default: 1.0,
    yod: 0.6,
    stellium: 1.5,
  },
  transit: {
    default: 0.8,
    yod: 0.4,
    stellium: 1.0,
  },
};

/**
 * Creates pattern orb limits scaled by user's orb sensitivity preference
 */
const getPatternOrbLimitsFromSensitivity = (orbSensitivity: OrbSensitivity) => {
  switch (orbSensitivity) {
    case 'simple':
    case 'tight':
      return {
        natal: {
          default: 2.0,
          yod: 1.0,
          stellium: 30.0, // always detect natal stelliums
        },
        synastry: {
          default: 1.5,
          yod: 0.8,
          stellium: 2.0,
        },
        global: {
          default: 0.8,
          yod: 0.4,
          stellium: 1.0,
        },
        transit: {
          default: 0.6,
          yod: 0.3,
          stellium: 0.8,
        },
      };
    case 'wide':
      return {
        natal: {
          default: 8.0,
          yod: 4.0,
          stellium: 30.0, // always detect natal stelliums
        },
        synastry: {
          default: 5.0,
          yod: 3.0,
          stellium: 6.0,
        },
        global: {
          default: 3.0,
          yod: 2.0,
          stellium: 4.0,
        },
        transit: {
          default: 2.5,
          yod: 1.5,
          stellium: 3.0,
        },
      };
    case 'balanced':
    default:
      return DEFAULT_PATTERN_ORB_LIMITS;
  }
};

/**
 * Determines the orb configuration based on chart count
 */
function getOrbThresholds(
  chartCount: number,
  dynamicOrbs: DynamicOrbSettings = DEFAULT_DYNAMIC_ORB_SETTINGS
) {
  if (chartCount === 1) return dynamicOrbs.single;
  if (chartCount === 2) return dynamicOrbs.pair;
  if (chartCount <= 5) return dynamicOrbs.small;
  return dynamicOrbs.large;
}

/**
 * Calculates aspect significance score for ranking and filtering
 */
function calculateAspectSignificance(
  aspect: AspectData,
  planetWeights: PlanetWeights = DEFAULT_PLANET_WEIGHTS
): number {
  // Base score from planet importance
  const planetAWeight =
    planetWeights[aspect.planetA as keyof PlanetWeights] || 1;
  const planetBWeight =
    planetWeights[aspect.planetB as keyof PlanetWeights] || 1;
  const planetScore = (planetAWeight + planetBWeight) / 2;

  // Aspect type weight
  const aspectWeight =
    ASPECT_TYPE_WEIGHTS[
      aspect.aspectType as keyof typeof ASPECT_TYPE_WEIGHTS
    ] || 1;

  // Orb tightness (inverse - tighter orbs get higher scores)
  const orbScore = Math.max(0, 10 - aspect.orb);

  // Combine all factors
  return planetScore * aspectWeight * (1 + orbScore / 10);
}

/**
 * Calculates pattern significance score for ranking and filtering
 */
function calculatePatternSignificance(
  pattern: AspectPattern,
  planetWeights: PlanetWeights = DEFAULT_PLANET_WEIGHTS
): number {
  // Extract planets from pattern
  const planets: string[] = [];
  const chartNames: Set<string> = new Set();

  const addPlanet = (p: any) => {
    if (p && p.name) {
      planets.push(p.name);
      if (p.chartName) chartNames.add(p.chartName);
    }
  };

  // Extract planets based on pattern type
  switch (pattern.type) {
    case 'T-Square':
      addPlanet((pattern as any).apex);
      if ((pattern as any).opposition) {
        (pattern as any).opposition.forEach(addPlanet);
      }
      break;
    case 'Grand Trine':
      if ((pattern as any).planets) {
        (pattern as any).planets.forEach(addPlanet);
      }
      break;
    case 'Grand Cross':
      if ((pattern as any).planets) {
        (pattern as any).planets.forEach(addPlanet);
      }
      break;
    case 'Yod':
      addPlanet((pattern as any).apex);
      if ((pattern as any).base) {
        (pattern as any).base.forEach(addPlanet);
      }
      break;
    case 'Mystic Rectangle':
      if ((pattern as any).oppositions) {
        (pattern as any).oppositions.flat().forEach(addPlanet);
      }
      break;
    case 'Kite':
      if ((pattern as any).grandTrine) {
        (pattern as any).grandTrine.forEach(addPlanet);
      }
      addPlanet((pattern as any).opposition);
      break;
  }

  // Calculate average planet weight
  const avgPlanetWeight =
    planets.length > 0
      ? planets.reduce((sum, planet) => {
          return sum + (planetWeights[planet as keyof PlanetWeights] || 1);
        }, 0) / planets.length
      : 1;

  // Pattern type weight
  const typeWeight =
    PATTERN_TYPE_WEIGHTS[pattern.type as keyof typeof PATTERN_TYPE_WEIGHTS] ||
    1;

  // Orb tightness bonus (tighter orbs get higher scores)
  const orbBonus = (pattern as any).averageOrb
    ? Math.max(0, 5 - (pattern as any).averageOrb)
    : 0;

  // Multi-person bonus for synastry patterns
  const multiPersonBonus = chartNames.size > 1 ? chartNames.size * 0.5 : 0;

  return (
    avgPlanetWeight * typeWeight * (1 + orbBonus / 5) * (1 + multiPersonBonus)
  );
}

/**
 * Removes redundant patterns that share too many planets
 */
function removeRedundantPatterns(patterns: AspectPattern[]): AspectPattern[] {
  const filtered: AspectPattern[] = [];

  for (const pattern of patterns) {
    const patternPlanets = extractPlanetNamesFromPattern(pattern);

    const isRedundant = filtered.some(existing => {
      const existingPlanets = extractPlanetNamesFromPattern(existing);
      const intersection = patternPlanets.filter(p =>
        existingPlanets.includes(p)
      );
      const union = [...new Set([...patternPlanets, ...existingPlanets])];

      // Consider redundant if patterns share >75% of planets
      return intersection.length / union.length > 0.75;
    });

    if (!isRedundant) {
      filtered.push(pattern);
    }
  }

  return filtered;
}

/**
 * Helper function to extract planet names from any pattern type
 */
function extractPlanetNamesFromPattern(pattern: AspectPattern): string[] {
  const planets: string[] = [];

  const addPlanet = (p: any) => {
    if (p && p.name) {
      planets.push(p.chartName ? `${p.name}-${p.chartName}` : p.name);
    }
  };

  switch (pattern.type) {
    case 'T-Square':
      addPlanet((pattern as any).apex);
      if ((pattern as any).opposition) {
        (pattern as any).opposition.forEach(addPlanet);
      }
      break;
    case 'Grand Trine':
      if ((pattern as any).planets) {
        (pattern as any).planets.forEach(addPlanet);
      }
      break;
    case 'Grand Cross':
      if ((pattern as any).planets) {
        (pattern as any).planets.forEach(addPlanet);
      }
      break;
    case 'Yod':
      addPlanet((pattern as any).apex);
      if ((pattern as any).base) {
        (pattern as any).base.forEach(addPlanet);
      }
      break;
    case 'Mystic Rectangle':
      if ((pattern as any).oppositions) {
        (pattern as any).oppositions.flat().forEach(addPlanet);
      }
      break;
    case 'Kite':
      if ((pattern as any).grandTrine) {
        (pattern as any).grandTrine.forEach(addPlanet);
      }
      addPlanet((pattern as any).opposition);
      break;
  }

  return planets;
}

/**
 * Filters aspects based on chart count and significance
 */
function filterAspects(
  aspects: AspectData[],
  chartCount: number,
  settings: FilteringSettings = getDefaultFilteringSettings()
): AspectData[] {
  const thresholds = getOrbThresholds(chartCount, settings.dynamicOrbs);

  // First pass: filter by orb
  const orbFiltered = aspects.filter(aspect => aspect.orb <= thresholds.wide);

  // If we have too many aspects for large chart sets, apply significance filtering
  if (
    chartCount >= 6 &&
    orbFiltered.length > settings.aspectCountLimits.large
  ) {
    // Score and sort by significance
    const scored = orbFiltered
      .map(aspect => ({
        aspect,
        score: calculateAspectSignificance(aspect, settings.planetWeights),
      }))
      .sort((a, b) => b.score - a.score);

    // Take top N most significant based on settings
    return scored
      .slice(0, settings.aspectCountLimits.large)
      .map(item => item.aspect);
  }

  if (
    chartCount >= 4 &&
    orbFiltered.length > settings.aspectCountLimits.small
  ) {
    // For medium chart sets, limit based on settings
    const scored = orbFiltered
      .map(aspect => ({
        aspect,
        score: calculateAspectSignificance(aspect, settings.planetWeights),
      }))
      .sort((a, b) => b.score - a.score);

    return scored
      .slice(0, settings.aspectCountLimits.small)
      .map(item => item.aspect);
  }

  return orbFiltered;
}

/**
 * Filters aspect patterns based on context, orb limits, chart count, and significance - Updated with suggestions 1-4
 */
function filterPatterns(
  patterns: AspectPattern[],
  context: 'natal' | 'synastry' | 'global' | 'transit',
  chartCount: number = 1,
  settings: FilteringSettings = getDefaultFilteringSettings(),
  orbSensitivity: OrbSensitivity = 'balanced'
): AspectPattern[] {
  const patternOrbLimits = getPatternOrbLimitsFromSensitivity(orbSensitivity);
  const limits = patternOrbLimits[context];

  // First pass: filter by orb limits
  const orbFiltered = patterns.filter(pattern => {
    const patternType = pattern.type.toLowerCase();

    // Stellium doesn't have averageOrb, it has span instead
    if (patternType === 'stellium') {
      return (pattern as any).span <= limits.stellium;
    }

    // All other patterns have averageOrb
    const patternWithOrb = pattern as any;
    if (!patternWithOrb.averageOrb) return true; // Keep patterns without orb data

    // Special handling for specific pattern types
    if (patternType === 'yod') {
      return patternWithOrb.averageOrb <= limits.yod;
    }

    // Default pattern filtering
    return patternWithOrb.averageOrb <= limits.default;
  });

  // Second pass: remove redundant patterns
  const deduped = removeRedundantPatterns(orbFiltered);

  // Third pass: apply count limits and significance filtering for large groups
  if (chartCount >= 6 && deduped.length > settings.patternCountLimits.large) {
    const scored = deduped
      .map(pattern => ({
        pattern,
        score: calculatePatternSignificance(pattern, settings.planetWeights),
      }))
      .sort((a, b) => b.score - a.score);

    return scored
      .slice(0, settings.patternCountLimits.large)
      .map(item => item.pattern);
  }

  if (chartCount >= 4 && deduped.length > settings.patternCountLimits.small) {
    const scored = deduped
      .map(pattern => ({
        pattern,
        score: calculatePatternSignificance(pattern, settings.planetWeights),
      }))
      .sort((a, b) => b.score - a.score);

    return scored
      .slice(0, settings.patternCountLimits.small)
      .map(item => item.pattern);
  }

  // Fourth pass: apply per-type limits for large groups
  if (chartCount >= 6) {
    const typeGroups = new Map<string, AspectPattern[]>();
    deduped.forEach(pattern => {
      if (!typeGroups.has(pattern.type)) {
        typeGroups.set(pattern.type, []);
      }
      typeGroups.get(pattern.type)!.push(pattern);
    });

    const filtered: AspectPattern[] = [];
    typeGroups.forEach((typePatterns, type) => {
      if (typePatterns.length > settings.patternCountLimits.maxPerType) {
        const scored = typePatterns
          .map(pattern => ({
            pattern,
            score: calculatePatternSignificance(
              pattern,
              settings.planetWeights
            ),
          }))
          .sort((a, b) => b.score - a.score);

        filtered.push(
          ...scored
            .slice(0, settings.patternCountLimits.maxPerType)
            .map(item => item.pattern)
        );
      } else {
        filtered.push(...typePatterns);
      }
    });

    return filtered;
  }

  return deduped;
}

/**
 * Creates dynamic aspect groups based on filtered aspects and chart count
 */
function createDynamicAspectGroups(
  aspects: AspectData[],
  chartCount: number,
  settings: FilteringSettings = getDefaultFilteringSettings()
): Map<string, AspectData[]> {
  const thresholds = getOrbThresholds(chartCount, settings.dynamicOrbs);
  const groups = new Map<string, AspectData[]>();

  // Sort aspects by significance for consistent grouping
  const sortedAspects = aspects
    .map(aspect => ({
      aspect,
      score: calculateAspectSignificance(aspect, settings.planetWeights),
    }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.aspect);

  // Create orb-based groups with dynamic labels, maintaining significance order within each group
  const tightAspects: AspectData[] = [];
  const moderateAspects: AspectData[] = [];
  const wideAspects: AspectData[] = [];

  sortedAspects.forEach(aspect => {
    if (aspect.orb <= thresholds.tight) {
      tightAspects.push(aspect);
    } else if (aspect.orb <= thresholds.moderate) {
      moderateAspects.push(aspect);
    } else {
      wideAspects.push(aspect);
    }
  });

  // Sort within each group by significance (already sorted from sortedAspects, but ensure consistency)
  // No need to re-sort since sortedAspects is already ordered by significance

  // Add groups with descriptive labels
  if (tightAspects.length > 0) {
    const label =
      chartCount === 1
        ? `[CORE ASPECTS: orb 0.0-${thresholds.tight.toFixed(1)}°]`
        : `[PRIMARY CONNECTIONS: orb 0.0-${thresholds.tight.toFixed(1)}°]`;
    groups.set(label, tightAspects);
  }

  if (moderateAspects.length > 0) {
    const label =
      chartCount === 1
        ? `[SUPPORTING ASPECTS: orb ${thresholds.tight.toFixed(1)}-${thresholds.moderate.toFixed(1)}°]`
        : `[SECONDARY CONNECTIONS: orb ${thresholds.tight.toFixed(1)}-${thresholds.moderate.toFixed(1)}°]`;
    groups.set(label, moderateAspects);
  }

  if (wideAspects.length > 0 && chartCount <= 3) {
    // Only include wide aspects for smaller chart sets
    const label = `[BACKGROUND INFLUENCES: orb ${thresholds.moderate.toFixed(1)}-${thresholds.wide.toFixed(1)}°]`;
    groups.set(label, wideAspects);
  }

  return groups;
}

/**
 * Main filtering function that processes an entire astrological report
 */
export function applyDynamicFiltering(
  report: AstrologicalReport,
  settings: FilteringSettings = getDefaultFilteringSettings(),
  orbSensitivity: OrbSensitivity = 'balanced'
): AstrologicalReport {
  const chartCount = report.chartAnalyses.length;

  // Filter single chart analyses (always get full treatment regardless of total chart count)
  report.chartAnalyses.forEach(ca => {
    ca.aspects = filterAspects(ca.aspects, 1, settings); // Single charts always get generous filtering
    ca.patterns = filterPatterns(
      ca.patterns,
      'natal',
      1,
      settings,
      orbSensitivity
    );
    // Sort aspects by significance before grouping to ensure proper order within groups
    ca.aspects = ca.aspects
      .map(aspect => ({
        aspect,
        score: calculateAspectSignificance(aspect, settings.planetWeights),
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.aspect);
    ca.groupedAspects = createDynamicAspectGroups(ca.aspects, 1, settings);
  });

  // Filter pairwise analyses (use full chart count for scaling)
  report.pairwiseAnalyses.forEach(pa => {
    pa.synastryAspects = filterAspects(
      pa.synastryAspects,
      chartCount,
      settings
    );
    pa.compositePatterns = filterPatterns(
      pa.compositePatterns,
      'synastry',
      chartCount,
      settings,
      orbSensitivity
    );
    // Sort synastry aspects by significance before grouping
    pa.synastryAspects = pa.synastryAspects
      .map(aspect => ({
        aspect,
        score: calculateAspectSignificance(aspect, settings.planetWeights),
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.aspect);
    pa.groupedSynastryAspects = createDynamicAspectGroups(
      pa.synastryAspects,
      chartCount,
      settings
    );
  });

  // Filter transit analyses
  report.transitAnalyses.forEach(ta => {
    ta.aspects = filterAspects(ta.aspects, chartCount, settings);
    ta.patterns = filterPatterns(
      ta.patterns,
      'transit',
      chartCount,
      settings,
      orbSensitivity
    );
    // Sort transit aspects by significance before grouping
    ta.aspects = ta.aspects
      .map(aspect => ({
        aspect,
        score: calculateAspectSignificance(aspect, settings.planetWeights),
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.aspect);
    ta.groupedAspects = createDynamicAspectGroups(
      ta.aspects,
      chartCount,
      settings
    );
  });

  // Filter global analyses
  if (report.globalAnalysis) {
    report.globalAnalysis.patterns = filterPatterns(
      report.globalAnalysis.patterns,
      'global',
      chartCount,
      settings,
      orbSensitivity
    );
  }

  if (report.globalTransitAnalysis) {
    report.globalTransitAnalysis.patterns = filterPatterns(
      report.globalTransitAnalysis.patterns,
      'global',
      chartCount,
      settings,
      orbSensitivity
    );
  }

  return report;
}
