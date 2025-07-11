import { NextResponse } from 'next/server';
import {
  getYouTubeClient,
  setupOAuthForUser,
  refreshAccessToken,
} from '@/configs/youtubeConfig';

export async function POST(request) {
  try {
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    console.log('Testing YouTube token for user:', userEmail);

    // Try to set up OAuth for the user
    const setupSuccess = await setupOAuthForUser(userEmail);
    if (!setupSuccess) {
      return NextResponse.json(
        {
          connected: false,
          error: 'No YouTube token found for this user',
        },
        { status: 200 }
      );
    }

    // Try to make a simple API call to test the token
    const youtube = getYouTubeClient();

    try {
      // Test with a simple call to get channel info
      const response = await youtube.channels.list({
        part: ['snippet'],
        mine: true,
      });

      if (
        response.data &&
        response.data.items &&
        response.data.items.length > 0
      ) {
        const channel = response.data.items[0];
        return NextResponse.json({
          connected: true,
          channelName: channel.snippet.title,
          channelId: channel.id,
          message: 'YouTube token is valid and working',
        });
      } else {
        return NextResponse.json({
          connected: false,
          error: 'No YouTube channel found for this account',
        });
      }
    } catch (apiError) {
      console.error('YouTube API call failed:', apiError);

      // If it's an auth error, try to refresh the token
      if (apiError.code === 401 || apiError.code === 403) {
        try {
          console.log('Attempting to refresh token...');
          await refreshAccessToken(userEmail);

          // Try the API call again
          const retryResponse = await youtube.channels.list({
            part: ['snippet'],
            mine: true,
          });

          if (
            retryResponse.data &&
            retryResponse.data.items &&
            retryResponse.data.items.length > 0
          ) {
            const channel = retryResponse.data.items[0];
            return NextResponse.json({
              connected: true,
              channelName: channel.snippet.title,
              channelId: channel.id,
              message: 'YouTube token refreshed and working',
            });
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          return NextResponse.json({
            connected: false,
            error: 'YouTube token is invalid and could not be refreshed',
          });
        }
      }

      return NextResponse.json({
        connected: false,
        error: `YouTube API error: ${apiError.message}`,
      });
    }
  } catch (error) {
    console.error('Token test error:', error);
    return NextResponse.json(
      {
        connected: false,
        error: 'Failed to test YouTube token',
      },
      { status: 500 }
    );
  }
}
