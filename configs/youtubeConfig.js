import { google } from 'googleapis';

// Initialize OAuth2 client with credentials from environment
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/youtube/callback'
);

// Set refresh token from environment (you'll need to get this once)
if (process.env.YOUTUBE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN
  });
}

export const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.upload'],
    prompt: 'consent' // Forces refresh token to be returned
  });
};

export const getTokensFromCode = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
};

export const refreshAccessToken = async () => {
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);
    return credentials;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
};

export const getYouTubeClient = () => {
  return google.youtube({ version: 'v3', auth: oauth2Client });
};

export { oauth2Client };
