import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/configs/youtubeConfig';

export async function POST(request) {
  try {
    const { userId, email, displayName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Create state parameter with user info
    const state = encodeURIComponent(
      JSON.stringify({
        userId: userId || null,
        email,
        displayName,
      })
    );

    // Generate auth URL with state
    const authUrl = getAuthUrl(state);

    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    console.error('YouTube auth initiation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate YouTube auth',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
