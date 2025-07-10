import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

// Test YouTube connection functionality
export async function testYouTubeConnection(userEmail) {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

  try {
    // Check if user has YouTube token
    const tokenData = await convex.query(
      api.youtubeTokens.getYouTubeTokenByEmail,
      {
        email: userEmail,
      }
    );

    if (tokenData) {
      console.log('✅ YouTube token found for user:', userEmail);
      console.log('Token created:', new Date(tokenData.createdAt));
      console.log('Token updated:', new Date(tokenData.updatedAt));

      // Check if access token is still valid
      if (tokenData.expiresAt && tokenData.expiresAt > Date.now()) {
        console.log('✅ Access token is still valid');
      } else {
        console.log('⚠️ Access token may need refresh');
      }

      return {
        connected: true,
        token: tokenData,
      };
    } else {
      console.log('❌ No YouTube token found for user:', userEmail);
      return {
        connected: false,
        message: 'User needs to connect YouTube account',
      };
    }
  } catch (error) {
    console.error('❌ Error checking YouTube connection:', error);
    return {
      connected: false,
      error: error.message,
    };
  }
}

// Test YouTube API functionality
export async function testYouTubeAPI(userEmail) {
  try {
    // This would typically be called from a server-side API route
    const response = await fetch('/api/youtube/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userEmail }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ YouTube API test successful:', result);
      return { success: true, data: result };
    } else {
      console.log('❌ YouTube API test failed:', result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('❌ Error testing YouTube API:', error);
    return { success: false, error: error.message };
  }
}

export default { testYouTubeConnection, testYouTubeAPI };
