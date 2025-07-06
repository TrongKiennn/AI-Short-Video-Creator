import { google } from 'googleapis';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

// Initialize Convex client for server-side operations
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// Initialize OAuth2 client with credentials from environment
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/youtube/auth'
);

// Only set refresh token from environment if no user-specific token is available
// This is for backward compatibility only
if (process.env.YOUTUBE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
  });
}

export const getAuthUrl = (state = null) => {
  const authUrlOptions = {
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.upload'],
    prompt: 'consent', // Forces refresh token to be returned
  };

  if (state) {
    authUrlOptions.state = state;
  }

  return oauth2Client.generateAuthUrl(authUrlOptions);
};

export const getTokensFromCode = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
};

// Get refresh token from database by user email
export const getRefreshTokenByEmail = async (email) => {
  try {
    const tokenData = await convex.query(
      api.youtubeTokens.getYouTubeTokenByEmail,
      {
        email: email,
      }
    );
    return tokenData?.refreshToken;
  } catch (error) {
    console.error('Error getting refresh token from database:', error);
    return null;
  }
};

// Set up OAuth client with user-specific refresh token
export const setupOAuthForUser = async (email) => {
  // First try to get token from database
  const refreshToken = await getRefreshTokenByEmail(email);

  if (refreshToken) {
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });
    return true;
  } else if (process.env.YOUTUBE_REFRESH_TOKEN) {
    // Fallback to environment variable (for backward compatibility)
    console.warn(
      'Using environment variable refresh token as fallback. Consider connecting your YouTube account for user-specific tokens.'
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
    });
    return true;
  }

  return false;
};

export const refreshAccessToken = async (email = null) => {
  try {
    // If email is provided, set up OAuth for that user
    if (email) {
      const setupSuccess = await setupOAuthForUser(email);
      if (!setupSuccess) {
        throw new Error('No refresh token found for user');
      }
    }

    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    // Update access token in database if we have user email
    if (email && credentials.access_token && credentials.expiry_date) {
      try {
        // Get user by email first
        const tokenData = await convex.query(
          api.youtubeTokens.getYouTubeTokenByEmail,
          {
            email: email,
          }
        );

        if (tokenData) {
          await convex.mutation(api.youtubeTokens.updateAccessToken, {
            userId: tokenData.userId,
            accessToken: credentials.access_token,
            expiresAt: credentials.expiry_date,
          });
        }
      } catch (dbError) {
        console.error('Error updating access token in database:', dbError);
        // Don't throw here, as the token refresh still succeeded
      }
    }

    return credentials;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
};

export const getYouTubeClient = (email = null) => {
  return google.youtube({ version: 'v3', auth: oauth2Client });
};

export { oauth2Client };
