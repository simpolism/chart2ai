import { getPlatformInfo } from './platform';
import { LocationSuggestion } from '../types';
import { GeocodingResult } from './geocoding';

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
 * Attempt API request with fallback
 * @param primaryUrl Primary API URL
 * @param fallbackUrl Fallback API URL  
 * @param timeout Request timeout in milliseconds
 * @returns Response from successful API
 */
const fetchWithFallback = async (
  primaryUrl: string,
  fallbackUrl: string,
  timeout: number = 8000
): Promise<Response> => {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout);

  try {
    // Try primary API first
    const response = await fetch(primaryUrl, {
      signal: timeoutController.signal,
    });
    clearTimeout(timeoutId);
    
    // If successful response, return it
    if (response.ok) {
      return response;
    }
    
    // If not successful, fall through to fallback
    console.warn(`Primary geocoding API failed with status ${response.status}, trying fallback`);
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('Primary geocoding API failed, trying fallback:', error);
  }

  // Try fallback API
  const fallbackController = new AbortController();
  const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), timeout);
  
  try {
    const fallbackResponse = await fetch(fallbackUrl, {
      signal: fallbackController.signal,
    });
    clearTimeout(fallbackTimeoutId);
    
    if (fallbackResponse.ok) {
      console.info('Using fallback geocoding API');
      return fallbackResponse;
    }
    
    throw new Error(`Both APIs failed. Fallback status: ${fallbackResponse.status}`);
  } catch (error) {
    clearTimeout(fallbackTimeoutId);
    throw new Error(`Both geocoding APIs failed: ${error}`);
  }
};

// Conditionally import expo-location only on native platforms
let Location: any = null;
if (!getPlatformInfo().isWeb) {
  Location = require('expo-location');
}

/**
 * Get current GPS location (coordinates only)
 * This function requires React Native/Expo and is not available in Node.js
 */
export const getCurrentLocation = async (): Promise<GeocodingResult> => {
  if (getPlatformInfo().isWeb) {
    // Web implementation using navigator.geolocation
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported by browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          let message = 'Location access denied';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          reject(new Error(message));
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    });
  } else {
    // Mobile implementation using expo-location
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 0,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get current location');
    }
  }
};

/**
 * Get location suggestions as user types (typeahead/autocomplete)
 * @param inputValue The current input value to search for
 * @param limit Maximum number of suggestions to return
 * @returns Array of location suggestions
 */
export const getLocationSuggestions = async (
  inputValue: string,
  limit: number = 5
): Promise<LocationSuggestion[]> => {
  try {
    const params = `layer=city&layer=district&q=${encodeURIComponent(inputValue)}&limit=${limit}`;
    const primaryUrl = `${PRIMARY_GEO_API}?${params}`;
    const fallbackUrl = `${FALLBACK_GEO_API}?${params}`;

    const response = await fetchWithFallback(primaryUrl, fallbackUrl);
    const data = await response.json();

    if (data?.features?.length > 0) {
      return data.features.map((feature: any) => {
        const { properties, geometry } = feature;
        const coordinates = geometry.coordinates;

        // Create formatted address components
        const addressComponents = [];
        if (properties.name) addressComponents.push(properties.name);
        if (properties.street) {
          let streetAddress = properties.street;
          if (properties.housenumber)
            streetAddress += ` ${properties.housenumber}`;
          addressComponents.push(streetAddress);
        }
        if (properties.city) addressComponents.push(properties.city);
        if (properties.state) addressComponents.push(properties.state);
        if (properties.country) {
          addressComponents.push(properties.country);
        } else if (properties.countrycode) {
          addressComponents.push(properties.countrycode);
        }

        return {
          name: properties.name || 'Unknown location',
          latitude: coordinates[1],
          longitude: coordinates[0],
          fullAddress: addressComponents.join(', '),
        };
      });
    }

    return [];
  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    return [];
  }
};
