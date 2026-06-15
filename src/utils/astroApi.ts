import axios from 'axios';
import { AstroApiResponse, ApiError } from '../types';
import { geocodeLocation } from './geocoding';

const API_ENDPOINT = 'https://simple-astro-api.netlify.app/api/positions';

/**
 * Fetches planetary positions from the astro API
 */
export const getAstroData = async (
  date: string, // YYYY-MM-DD
  time: string, // HH:MM:SS
  location: string,
  houseSystem: string = 'P'
): Promise<AstroApiResponse> => {
  try {
    // First geocode the location
    const coordinates = await geocodeLocation(location);

    // Then fetch astro data
    const response = await axios.get(API_ENDPOINT, {
      params: {
        date,
        time,
        lat: coordinates.latitude,
        lng: coordinates.longitude,
        house_system: houseSystem,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message: `Failed to fetch astrological data: ${error.response?.statusText || error.message}`,
        status: error.response?.status,
      } as ApiError;
    }
    throw error;
  }
};
