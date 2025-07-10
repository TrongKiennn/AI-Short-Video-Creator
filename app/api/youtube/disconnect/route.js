import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(request) {
  try {
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Remove the YouTube token from the database
    await convex.mutation(api.youtubeTokens.removeYouTubeToken, {
      email: userEmail,
    });

    return NextResponse.json({
      success: true,
      message: 'YouTube disconnected successfully',
    });
  } catch (error) {
    console.error('YouTube disconnect error:', error);
    return NextResponse.json(
      {
        error: 'Failed to disconnect YouTube',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
