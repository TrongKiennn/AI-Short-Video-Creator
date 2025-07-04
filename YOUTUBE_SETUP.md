# YouTube Integration Setup Guide

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

## Verify FFmpeg Installation

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

6. **Add Test Users** (if not part of an organization):

   - Go to "APIs & Services" > "OAuth consent screen" > "Audience" on the panel
   - In the "Test users" section, click "ADD USERS"
   - **Important**: Add the Gmail address that owns the YouTube channel where you want to upload videos
   - This Gmail account must be the same one you'll use for authentication
   - You cannot authenticate with Gmail A and upload to a YouTube channel owned by Gmail B
   - This is required for personal/unverified apps to access YouTube API

7. **Get a refresh token**:
   - Start your development server: `npm run dev`
   - Visit `http://localhost:3000/api/youtube/auth`
   - **Authorize with the same Gmail account** that you added as a test user and that owns your target YouTube channel
   - Copy the `refresh_token` from the response
   - Add it to your `.env.local`:
     ```env
     YOUTUBE_REFRESH_TOKEN=your_refresh_token_here
     ```

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

## Important Notes

### Authentication and Channel Ownership

- **The Gmail account used for authentication must own the YouTube channel** where videos will be uploaded
- You cannot authenticate with one Gmail account and upload to a different account's YouTube channel
- Each refresh token is tied to a specific Google/Gmail account
- If you want to upload to multiple YouTube channels owned by different accounts, you'll need separate API projects and refresh tokens for each account

### Video Privacy Settings

- Videos are uploaded as "private" by default for safety
- You can manually change them to "public" or "unlisted" on YouTube after upload
- This prevents accidental public uploads during testing

## Features

- ✅ **Automatic video export** from Remotion compositions
- ✅ **FFmpeg integration** for high-quality video rendering
- ✅ **Zoom/pan effects** on images for dynamic feel
- ✅ **Audio synchronization** with proper duration matching
- ✅ **YouTube API integration** with OAuth 2.0
- ✅ **Automatic metadata** generation for YouTube uploads
- ✅ **Error handling** and user feedback
- ✅ **File cleanup** after processing

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

### Logs

Check the server console for detailed error messages during video export and upload processes.
