import { NextResponse } from 'next/server';
import { getYouTubeClient, refreshAccessToken } from '@/configs/youtubeConfig';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { videoPath, title, description, tags } = await request.json();

    if (!videoPath || !title) {
      return NextResponse.json(
        {
          error: 'Missing required fields: videoPath and title are required',
        },
        { status: 400 }
      );
    }

    // Refresh access token to ensure we have a valid token
    await refreshAccessToken();

    const youtube = getYouTubeClient();

    // Convert relative path to absolute path
    let fullVideoPath;
    if (videoPath.startsWith('/')) {
      // Remove leading slash and join with public directory
      fullVideoPath = path.join(
        process.cwd(),
        'public',
        videoPath.substring(1)
      );
    } else {
      fullVideoPath = path.join(process.cwd(), 'public', videoPath);
    }

    // Check if video file exists
    if (!fs.existsSync(fullVideoPath)) {
      return NextResponse.json(
        {
          error: 'Video file not found',
          path: fullVideoPath,
        },
        { status: 404 }
      );
    }

    // Get file stats for upload
    const stats = fs.statSync(fullVideoPath);
    const fileSizeInBytes = stats.size;

    console.log(`Uploading video: ${fullVideoPath} (${fileSizeInBytes} bytes)`);

    const uploadResponse = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: title,
          description:
            description ||
            `Generated with AI Video Creator\n\nTags: ${tags?.join(', ') || 'AI Generated Video'}`,
          tags: tags || ['AI Generated', 'Short Video', 'Automated'],
          categoryId: '22', // People & Blogs category
          defaultLanguage: 'en',
          defaultAudioLanguage: 'en',
        },
        status: {
          privacyStatus: 'private', // Start with private for safety
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: fs.createReadStream(fullVideoPath),
      },
    });

    const videoId = uploadResponse.data.id;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    console.log(`Video uploaded successfully: ${videoUrl}`);

    return NextResponse.json({
      success: true,
      videoId: videoId,
      videoUrl: videoUrl,
      title: uploadResponse.data.snippet.title,
      status: uploadResponse.data.status.privacyStatus,
    });
  } catch (error) {
    console.error('YouTube upload error:', error);

    // Handle specific errors
    if (error.code === 403) {
      return NextResponse.json(
        {
          error: 'YouTube API quota exceeded or insufficient permissions',
          details: error.message,
        },
        { status: 403 }
      );
    }

    if (error.code === 401) {
      return NextResponse.json(
        {
          error:
            'YouTube authentication failed. Please check your credentials.',
          details: error.message,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to upload to YouTube',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
