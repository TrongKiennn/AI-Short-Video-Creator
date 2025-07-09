import { NextResponse } from 'next/server';
import { getAuthUrl, getTokensFromCode } from '@/configs/youtubeConfig';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(
      new URL(
        '/dashboard?youtube_error=' + encodeURIComponent(error),
        request.url
      )
    );
  }

  if (code) {
    try {
      const tokens = await getTokensFromCode(code);

      // Get user info from the state parameter
      let userInfo = null;
      if (state) {
        try {
          userInfo = JSON.parse(decodeURIComponent(state));
        } catch (e) {
          console.error('Error parsing state:', e);
        }
      }

      // If no user info in state, check if we have pending auth data
      if (!userInfo) {
        // For cases where sessionStorage was used (fallback)
        console.log('No user info in state, checking for pending auth');
        // In a real scenario, you might want to handle this differently
        // For now, we'll just log it and continue
      }

      if (userInfo && (userInfo.userId || userInfo.email)) {
        // Try to get or find the user ID
        let userId = userInfo.userId;

        if (!userId && userInfo.email) {
          // Try to find the user by email
          try {
            const existingUser = await convex.query(api.users.getUserByEmail, {
              email: userInfo.email,
            });
            if (existingUser) {
              userId = existingUser._id;
            }
          } catch (e) {
            console.error('Error finding user by email:', e);
          }
        }

        if (userId) {
          // Store the tokens in Convex
          await convex.mutation(api.youtubeTokens.storeYouTubeToken, {
            userId: userId,
            email: userInfo.email,
            refreshToken: tokens.refresh_token,
            accessToken: tokens.access_token,
            expiresAt: tokens.expiry_date,
          });

          console.log(
            'YouTube tokens stored successfully for user:',
            userInfo.email
          );

          // Redirect back to the dashboard with success
          return NextResponse.redirect(
            new URL('/dashboard?youtube_connected=true', request.url)
          );
        } else {
          console.error('Could not determine user ID for token storage');
          return NextResponse.redirect(
            new URL('/dashboard?youtube_error=user_not_found', request.url)
          );
        }
      } else {
        // For backward compatibility or fallback cases
        console.log(
          'No user info available, returning tokens for manual processing'
        );
        return NextResponse.json({
          success: true,
          tokens: tokens,
          message:
            'Tokens received. Please ensure your user is logged in for automatic storage.',
        });
      }
    } catch (error) {
      console.error('YouTube auth error:', error);
      return NextResponse.redirect(
        new URL(
          '/dashboard?youtube_error=' + encodeURIComponent(error.message),
          request.url
        )
      );
    }
  }

  // Generate auth URL without state parameter (for manual flow)
  const authUrl = getAuthUrl();
  return NextResponse.redirect(authUrl);
}
