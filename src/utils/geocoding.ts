import axios from 'axios';
import { ApiError } from '../types';

/**
 * API endpoints for geocoding.
 *
 * Defaults to the public Photon endpoint (free, no key required).
 * Override via env vars to self-host or use a different geocoder:
 *   EXPO_PUBLIC_GEO_API_PRIMARY  — primary geocoding endpoint
 *   EXPO_PUBLIC_GEO_API_FALLBACK — fallback if primary fails
 *
 * Both endpoints must implement the Photon API response format.
 */
const PRIMARY_GEO_API =
  process.env.EXPO_PUBLIC_GEO_API_PRIMARY || 'https://photon.komoot.io/api/';
const FALLBACK_GEO_API =
  process.env.EXPO_PUBLIC_GEO_API_FALLBACK || 'https://photon.komoot.io/api/';

/**
 * Attempt axios request with fallback
 * @param primaryUrl Primary API URL
 * @param fallbackUrl Fallback API URL
 * @param params Request parameters  
 * @param timeout Request timeout in milliseconds
 * @returns Axios response from successful API
 */
const axiosWithFallback = async (
  primaryUrl: string,
  fallbackUrl: string,
  params: any,
  timeout: number = 8000
): Promise<any> => {
  try {
    // Try primary API first
    const response = await axios.get(primaryUrl, {
      params,
      timeout,
    });
    
    if (response.data) {
      return response;
    }
  } catch (error) {
    console.warn('Primary geocoding API failed, trying fallback:', error);
  }

  // Try fallback API
  try {
    const fallbackResponse = await axios.get(fallbackUrl, {
      params,
      timeout,
    });
    
    if (fallbackResponse.data) {
      console.info('Using fallback geocoding API');
      return fallbackResponse;
    }
    
    throw new Error('Both APIs returned no data');
  } catch (error) {
    console.error('Both geocoding APIs failed:', error);
    throw error;
  }
};

export interface GeocodingResult {
  latitude: number;
  longitude: number;
}

/**
 * Check if location string is coordinates format
 */
const isCoordinateFormat = (location: string): boolean => {
  const coordPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
  return coordPattern.test(location.trim());
};

/**
 * Parse coordinate string to lat/lng object
 */
const parseCoordinates = (location: string): GeocodingResult => {
  const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
  return { latitude: lat, longitude: lng };
};

/**
 * Converts a location string to coordinates using Photon API
 * This is React Native-free and can be used in Node.js environments
 */
export const geocodeLocationString = async (
  locationString: string
): Promise<GeocodingResult> => {
  try {
    const params = new URLSearchParams();
    params.append('layer', 'city');
    params.append('layer', 'district');
    params.append('q', locationString);
    params.append('limit', '1');

    const response = await axiosWithFallback(
      PRIMARY_GEO_API,
      FALLBACK_GEO_API,
      params
    );

    if (
      response.data &&
      response.data.features &&
      response.data.features.length > 0
    ) {
      const coordinates = response.data.features[0].geometry.coordinates;
      return {
        // Note: GeoJSON format returns [longitude, latitude]
        longitude: coordinates[0],
        latitude: coordinates[1],
      };
    }

    throw { message: 'Location not found' } as ApiError;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message: 'Failed to geocode location',
        status: error.response?.status,
      } as ApiError;
    }
    throw {
      message: 'An unexpected error occurred while geocoding',
    } as ApiError;
  }
};

/**
 * Converts a location string to coordinates using Photon API or direct coordinate parsing
 * This function is React Native-free and can be used in Node.js environments
 */
export const geocodeLocation = async (
  locationString: string
): Promise<GeocodingResult> => {
  // If location is already in coordinate format, parse and return
  if (isCoordinateFormat(locationString)) {
    return parseCoordinates(locationString);
  }

  // Otherwise, use the geocoding API
  return geocodeLocationString(locationString);
};
