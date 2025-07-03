import { NextResponse } from 'next/server';
import { getAuthUrl, getTokensFromCode } from '@/configs/youtubeConfig';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    try {
      const tokens = await getTokensFromCode(code);

      // In a real app, you'd save these tokens securely
      // For now, we'll just return them so you can add the refresh_token to your .env
      return NextResponse.json({
        success: true,
        tokens: tokens,
        message:
          'Add the refresh_token to your .env file as YOUTUBE_REFRESH_TOKEN',
      });
    } catch (error) {
      console.error('YouTube auth error:', error);
      return NextResponse.json(
        {
          error: 'Failed to get tokens',
          details: error.message,
        },
        { status: 500 }
      );
    }
  }

  // Redirect to YouTube OAuth
  const authUrl = getAuthUrl();
  return NextResponse.redirect(authUrl);
}
