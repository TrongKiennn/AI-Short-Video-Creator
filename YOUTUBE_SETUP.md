# YouTube Integration Setup Guide

## Overview

This guide shows how to set up YouTube integration for your AI Short Video Creator app. The app supports both **automatic YouTube OAuth integration** that synchronizes with your Gmail login and **manual token management** for backward compatibility.

## Prerequisites

You need to have **FFmpeg** installed on your system for video processing:

### Windows

1. Download FFmpeg from https://ffmpeg.org/download.html
2. Extract to a folder (e.g., `C:\ffmpeg`)
3. Add `C:\ffmpeg\bin` to your system **PATH environment variable**:
   - Open System Properties → Environment Variables
   - Edit the "Path" variable in System Variables
   - Add `C:\ffmpeg\bin` to the list
   - Click OK and restart your terminal/IDE

### macOS

```bash
brew install ffmpeg
```

### Linux

```bash
sudo apt update
sudo apt install ffmpeg
```

### Verify FFmpeg Installation

After installing FFmpeg, verify it's working correctly:

```bash
# Check FFmpeg version
ffmpeg -version

# Check FFprobe version
ffprobe -version
```

Both commands should return version information. If you get "command not found" errors, FFmpeg is not properly installed or not in your PATH.

## YouTube API Setup

1. **Go to Google Cloud Console** (https://console.cloud.google.com/)

2. **Create a new project** or select an existing one

3. **Enable YouTube Data API v3**:

   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**:

   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/youtube/auth`
     - `https://yourdomain.com/api/youtube/auth` (for production)

5. **Copy your credentials** to your `.env.local` file:

   ```env
   YOUTUBE_CLIENT_ID=your_client_id_here
   YOUTUBE_CLIENT_SECRET=your_client_secret_here
   YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/auth
   ```

6. **Configure OAuth consent screen**:

   - Go to "APIs & Services" > "OAuth consent screen"
   - Fill in the required fields (App name, User support email, etc.)
   - Add your domain to authorized domains if needed

7. **Add Test Users** (for development):

   - In the OAuth consent screen, go to "Test users"
   - Click "ADD USERS"
   - **Important**: Add the Gmail address that owns the YouTube channel where you want to upload videos
   - This Gmail account must be the same one you'll use for authentication
   - You cannot authenticate with Gmail A and upload to a YouTube channel owned by Gmail B
   - This is required for personal/unverified apps to access YouTube API

## Setup Methods

### Method 1: Automatic OAuth Integration (Recommended)

This is the modern approach that provides seamless user experience:

**For End Users:**

1. **Sign in with Google** - Users click the login button and authenticate with their Gmail account
2. **Automatic YouTube Connection** - The app automatically prompts for YouTube permissions
3. **One-time Authorization** - Users grant permission once, and the app stores the refresh token
4. **Seamless Video Upload** - Videos can be uploaded directly to their YouTube channel

**For Developers:**

- No manual token management required
- Tokens are securely stored in Convex database
- Automatic token refresh handled by the system
- Fallback to environment variables for backward compatibility

### Method 2: Manual Token Setup (Legacy)

For development or backward compatibility:

1. **Get a refresh token**:
   - Start your development server: `npm run dev`
   - Visit `http://localhost:3000/api/youtube/auth`
   - **Authorize with the same Gmail account** that you added as a test user and that owns your target YouTube channel
   - Copy the `refresh_token` from the response
   - Add it to your `.env.local`:
     ```env
     YOUTUBE_REFRESH_TOKEN=your_refresh_token_here
     ```

## Environment Variables

Your `.env.local` should contain:

```env
# YouTube API Configuration
YOUTUBE_CLIENT_ID=your_youtube_client_id_here
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret_here
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/auth

# Optional: Fallback refresh token for development
# YOUTUBE_REFRESH_TOKEN=your_refresh_token_here
```

## Technical Documentation

### Database Schema

The app uses a `youtubeTokens` table in Convex with the following structure:

```javascript
youtubeTokens: defineTable({
  userId: v.id('users'),
  email: v.string(),
  refreshToken: v.string(),
  accessToken: v.optional(v.string()),
  expiresAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index('by_user', ['userId']).index('by_email', ['email']),
```

### API Endpoints

- `GET /api/youtube/auth` - Handles OAuth callback and token storage
- `POST /api/youtube/connect` - Initiates YouTube connection for a user
- `POST /api/youtube/upload` - Uploads videos using user-specific tokens

### Security Features

- **Secure Token Storage**: Refresh tokens are stored in the database, not in client-side code
- **Automatic Token Refresh**: Access tokens are automatically refreshed when needed
- **User-Specific Tokens**: Each user's tokens are isolated and secure
- **Fallback Mechanism**: Environment variable fallback for development

### Development vs Production

- **Development**: Use test users in OAuth consent screen
- **Production**: Submit for OAuth verification if you need to serve unverified users
- **Scopes**: The app requests `https://www.googleapis.com/auth/youtube.upload` scope

### Migration from Manual Setup

If you were previously using manual token setup with environment variables:

1. The app will continue to work with existing `YOUTUBE_REFRESH_TOKEN` environment variable
2. New users will automatically use the database-stored tokens
3. Existing users can reconnect their YouTube accounts to migrate to the new system
4. The environment variable serves as a fallback for backward compatibility

## How It Works

### Automatic Process

When you click "Upload to YouTube":

1. **Video Export**: If not already exported, the system automatically:

   - Downloads all images from your video
   - Downloads the audio file
   - Uses FFmpeg to create a video with zoom/pan effects
   - Saves the video to `/public/exports/`

2. **Database Update**: Updates the Convex database with the video URL

3. **YouTube Upload**: Uploads the exported video to YouTube with:
   - Your video title
   - Generated description including script and metadata
   - Automatic tags based on topic and style
   - Set to "private" by default for safety

### Manual Process

You can also export videos manually using the "Export & Download" button.

## Features

- ✅ **Automatic video export** from Remotion compositions
- ✅ **FFmpeg integration** for high-quality video rendering
- ✅ **Zoom/pan effects** on images for dynamic feel
- ✅ **Audio synchronization** with proper duration matching
- ✅ **YouTube API integration** with OAuth 2.0
- ✅ **Automatic metadata** generation for YouTube uploads
- ✅ **Error handling** and user feedback
- ✅ **File cleanup** after processing

## Testing

1. Start your development server: `npm run dev`
2. Log in with a Gmail account that owns a YouTube channel
3. The app should automatically prompt for YouTube permissions
4. Check the database to see if tokens are stored correctly
5. Try uploading a test video to verify the integration

## Important Notes

### Authentication and Channel Ownership

- **The Gmail account used for authentication should be that of the YouTube channel** where videos will be uploaded
- You _can_ authenticate with one Gmail account and upload to a different account's YouTube channel
- Each refresh token is tied to a specific Google/Gmail account (the one for _YouTube_)
- If you want to upload to multiple YouTube channels owned by different accounts, each account needs to authenticate individually

### Video Privacy Settings

- Videos are uploaded as "private" by default for safety
- Users can manually change them to "public" or "unlisted" on YouTube after upload
- This prevents accidental public uploads during testing

## Troubleshooting

### Common Issues

1. **"FFmpeg not found"**:

   - Make sure FFmpeg is installed and in your system **PATH environment variable**
   - Verify installation by running `ffmpeg -version` in your terminal
   - Restart your terminal/IDE after adding FFmpeg to PATH
   - On Windows, ensure `C:\ffmpeg\bin` is added to the "Path" variable in System Environment Variables

2. **"Video file not found"**:

   - The video export process failed
   - Check server logs for FFmpeg errors

3. **"YouTube API quota exceeded"**:

   - You've hit the daily quota limit
   - Wait 24 hours or increase your quota in Google Cloud Console

4. **"Authentication failed"**:

   - Check your YouTube API credentials
   - Make sure the refresh token is valid
   - Re-run the auth flow if needed

5. **"User not found" error**: The user's Convex ID couldn't be determined

   - Solution: Ensure the user is properly logged in and their profile is created

6. **"No refresh token found"**: The user hasn't connected their YouTube account

   - Solution: Have the user click "Connect YouTube" in the app

7. **"Channel not found"**: The authenticated account doesn't have a YouTube channel

   - Solution: Create a YouTube channel for the Google account

8. **Token refresh errors**: The stored refresh token is invalid
   - Solution: Have the user reconnect their YouTube account

### Debug Steps

1. Check browser console for authentication errors
2. Verify OAuth redirect URIs match exactly
3. Ensure the Gmail account owns a YouTube channel
4. Check that the user is added as a test user (for development)
5. Check server logs for detailed error messages during video export and upload processes

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify your Google Cloud Console configuration
3. Ensure your Gmail account has a YouTube channel
4. Review the troubleshooting section above

The new automated system provides a much better user experience while maintaining security and reliability.
