// Utility to validate and clean up YouTube tokens
import { refreshAccessToken } from '@/configs/youtubeConfig';

export const validateYouTubeToken = async (token, userEmail) => {
  if (!token || !token.refreshToken) {
    return { isValid: false, needsCleanup: true };
  }

  // If no access token or expired, try to refresh
  if (!token.accessToken || (token.expiresAt && token.expiresAt <= Date.now())) {
    try {
      console.log('Token expired or missing, attempting refresh...');
      await refreshAccessToken(userEmail);
      return { isValid: true, needsCleanup: false, refreshed: true };
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, token is invalid
      return { isValid: false, needsCleanup: true, error: error.message };
    }
  }

  // Token appears valid
  return { isValid: true, needsCleanup: false };
};

// Function to test token validity without making API calls
export const isTokenStructureValid = (token) => {
  if (!token) return false;
  
  // Must have a refresh token
  if (!token.refreshToken || !token.refreshToken.trim()) {
    return false;
  }
  
  // Check if access token is not expired (if we have one)
  if (token.expiresAt && token.accessToken) {
    const now = Date.now();
    const buffer = 5 * 60 * 1000; // 5 minute buffer
    return token.expiresAt > (now + buffer);
  }
  
  // If we don't have an access token, we can still be valid with just refresh token
  return true;
};
