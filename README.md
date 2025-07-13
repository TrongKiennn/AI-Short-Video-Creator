# AI Short Video Creator 🚀

An intelligent AI-powered platform for creating short videos with automated script generation, voice synthesis, image generation, video editing, and seamless YouTube integration.

## 🌟 Core Features

### 🎬 Video Creation Pipeline

- **AI Script Generation**: Generate compelling video scripts from topics using AI models (Gemini/Groq).
- **Text-to-Speech**: Convert scripts to natural voice audio with multiple voice options (PlayAI integration).
- **AI Image Generation**: Automatically generate relevant images for each scene using AI models.
- **Video Assembly**: Combine images, audio, and effects into professional videos using Remotion.
- **Custom Captions**: Choose from multiple caption styles (YouTuber, Minimalist, Bold, Elegant, etc.).
- **Video Styles**: Multiple visual styles available (3D, Cartoon, Anime, Realistic, Water Color, Cinematic, Digital).

### 🛠️ Advanced Video Editing

- **Visual Editor**: Real-time video preview with Remotion-powered player.
- **Image Replacement**: Replace any scene image with custom uploads.
- **Audio Replacement**: Swap video audio with custom audio files.
- **Timeline Control**: Precise frame-by-frame editing with visual timeline.
- **Dynamic Effects**: Zoom and pan effects on images for engaging visuals.
- **Export & Download**: High-quality video export using FFmpeg.

### 📊 Analytics & Performance

- **YouTube Video Analytics**: Comprehensive analytics for YouTube videos including:
  - View count, likes, comments, and engagement rates.
  - Performance metrics and growth tracking.
  - Keyword extraction and sentiment analysis.
  - View-to-like ratios and average daily views.
- **Real-time Status Tracking**: Monitor video processing status with live updates.
- **Performance Dashboard**: Track all your video projects in one place.

### 🎯 YouTube Integration

- **Seamless YouTube Upload**: Direct upload to YouTube with automatic metadata generation.
- **OAuth Authentication**: Secure YouTube account connection with automatic token management.
- **Enhanced Upload Success Toast**: Interactive post-upload notifications with:
  - One-click copy to clipboard functionality.
  - Direct "Open Video" button to view on YouTube.
  - Visual feedback for successful actions.
  - Support for both manual and automatic uploads.
- **Auto-Upload Feature**: Automatically export and upload videos upon completion.
- **Smart Metadata**: Auto-generated titles, descriptions, and tags based on video content.
- **Video Privacy Settings**: Videos are uploaded as "private" by default for safety.

### 🔧 Technical Features

- **Real-time Processing**: Background video generation with live status updates.
- **Database Integration**: Convex database for secure data storage.
- **File Management**: Supabase integration for media file storage.
- **User Authentication**: Firebase authentication with Google sign-in.
- **Responsive Design**: Modern, mobile-friendly interface with dark/light mode support.
- **Error Handling**: Robust error handling with user-friendly feedback.

## 🚀 Project Setup Guide

Follow these steps to set up and run the project completely.

### 📦 1. Install Dependencies

Run the following commands in the terminal to install the required libraries:

```bash
npm install
npm install next-themes
```

> 💡 `next-themes` is used to support dark/light mode switching in the Next.js application.

### 🐳 2. Start Docker

Open **Docker Desktop** on your computer.

### ⚙️ 3. Run Services with Docker Compose

Open terminal and run the command:

```bash
docker compose up
```

### 📝 4. Configure Environment Variables

Open the `.env.local` file and edit the values as required.  
**Note:** You will need to update the `ADMIN_KEY` in the `.env.local` file after initialization.

### 🔑 5. Generate Admin Key

Run the following command in terminal:

```bash
docker compose exec backend ./generate_admin_key.sh
```

This command will generate an **Admin Key** used to log into the admin system.

### 🛠️ 6. Update ADMIN_KEY

Open the `.env.local` file again and:

- Find the line `CONVEX_SELF_HOSTED_ADMIN_KEY=...`
- Replace it with the key value generated in the previous step.

### 🔐 7. Login to Admin System

Access the following address using your browser:

```
http://localhost:6791
```

- Paste the `ADMIN_KEY` to log in.

### 📦 8. Install Additional Dependencies

Run the following two commands in terminal:

```bash
npm install convex@latest
npx convex dev

npm install inngest
npx inngest-cli@latest dev
```

> 💡 **Note:** `convex@latest` ensures you always use the latest version of the library.

### 🖥️ 9. Start the Application

Finally, run the application with the command:

```bash
npm run dev
```

The application will start at the default address:  
[http://localhost:3000](http://localhost:3000) _(or depending on configuration)_

**After the first installation, to run the program locally, just run these 4 commands, each in a separate terminal:**

```bash
docker compose up
npx convex dev
npx inngest-cli dev
npm run dev
```

---

## 🎯 YouTube Integration Setup Guide

### Prerequisites

You need to have **FFmpeg** installed on your system (the server on which the app will be running) for video processing:

#### Windows

1. Download FFmpeg from https://ffmpeg.org/download.html
2. Extract to a folder (e.g., `C:\ffmpeg`)
3. Add the `bin` folder (e.g., `C:\ffmpeg\bin`) to your system **PATH environment variable**:
   - Open System Properties → Environment Variables
   - Edit the "Path" variable in System Variables
   - Add `your-absolute-path\ffmpeg\bin` to the list
   - Click OK and restart your terminal/IDE

#### macOS

```bash
brew install ffmpeg
```

#### Linux

```bash
sudo apt update
sudo apt install ffmpeg
```

#### Verify FFmpeg Installation

After installing FFmpeg, verify it's working correctly:

```bash
# Check FFmpeg version
ffmpeg -version

# Check FFprobe version
ffprobe -version
```

Both commands should return version information. If you get "command not found" errors, FFmpeg is not properly installed or not in your PATH.

### YouTube API Setup

1. **Go to Google Cloud Console** (https://console.cloud.google.com/)

2. **Create a new project** or select an existing one.

3. **Enable YouTube Data API v3**:

   - Go to "APIs & Services" > "Library".
   - Search for "YouTube Data API v3".
   - Click "Enable".

4. **Create OAuth 2.0 Credentials**:

   - Go to "APIs & Services" > "Credentials".
   - Click "Create Credentials" > "OAuth client ID".
   - Choose "Web application".
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/youtube/auth`
     - `https://yourdomain.com/api/youtube/auth` (for production).

5. **Copy your credentials** to your `.env.local` file:

   ```env
   YOUTUBE_CLIENT_ID=your_client_id_here
   YOUTUBE_CLIENT_SECRET=your_client_secret_here
   YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/auth
   ```

6. **Configure OAuth consent screen**:

   - Go to "APIs & Services" > "OAuth consent screen".
   - Fill in the required fields (App name, User support email, etc.).
   - Add your domain to authorized domains if needed.

7. **Add Test Users** (for development):

   - In the OAuth consent screen, go to "Test users".
   - Click "ADD USERS".
   - **Important**: Add the Gmail address that owns the YouTube channel where you want to upload videos.
   - This Gmail account must be the same one you'll use for authentication.

---

✅ **Thank you for using AI Short Video Creator! We hope you enjoy creating amazing videos with our platform.**
