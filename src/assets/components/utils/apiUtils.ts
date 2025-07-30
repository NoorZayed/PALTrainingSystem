import axios from 'axios';

// Base URL for the backend API
export const API_BASE_URL = 'http://localhost:5001';

// Simple function to make an API call without mock data fallback
export const apiCall = async <T>(
  url: string,
  params: Record<string, any> = {},
  errorMessage: string = 'API call failed'
): Promise<T> => {
  try {
    const response = await axios.get(url, { params, timeout: 8000 });
    return response.data;
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw new Error(`${errorMessage}: ${(error as Error).message}`);
  }
};

// Check if the server is reachable
export const isServerAvailable = async (): Promise<boolean> => {
  try {
    // Simple ping to the server with a short timeout
    const response = await axios.get(`${API_BASE_URL}/ping`, { timeout: 3000 });
    console.log('Backend server ping response:', response.status);
    return response.status === 200;
  } catch (error) {
    console.error('Backend server is not available', error);
    return false;
  }
};