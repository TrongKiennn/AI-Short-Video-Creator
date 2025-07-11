import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
  try {
    // Safely parse JSON with error handling
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (jsonError) {
      console.error('Invalid JSON in request body:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { videoId, audioUrl, images, title } = requestBody;

    console.log('Starting video export for:', videoId);

    if (!videoId || !audioUrl || !images || images.length === 0) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: videoId, audioUrl, and images are required',
        },
        { status: 400 }
      );
    }

    // Create exports directory if it doesn't exist
    const exportsDir = path.join(process.cwd(), 'public', 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const outputPath = path.join(exportsDir, `${videoId}.mp4`);

    // Check if video already exists
    if (fs.existsSync(outputPath)) {
      return NextResponse.json({
        success: true,
        videoUrl: `/exports/${videoId}.mp4`,
        message: 'Video already exported',
      });
    }

    // Create a temporary directory for processing
    const tempDir = path.join(process.cwd(), 'temp', videoId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Get audio file path (audio files are stored in public/ directory)
    // audioUrl format: "/speech-1234567890.wav"
    const audioFileName = audioUrl.startsWith('/')
      ? audioUrl.substring(1)
      : audioUrl;
    const audioPath = path.join(process.cwd(), 'public', audioFileName);

    // Verify audio file exists
    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found: ${audioPath}`);
    }

    // Get audio duration using ffprobe
    const getDuration = () => {
      return new Promise((resolve, reject) => {
        const ffprobe = spawn('ffprobe', [
          '-v',
          'error',
          '-show_entries',
          'format=duration',
          '-of',
          'csv=p=0',
          audioPath,
        ]);

        let duration = '';
        ffprobe.stdout.on('data', (data) => {
          duration += data.toString();
        });

        ffprobe.on('close', (code) => {
          if (code === 0) {
            resolve(parseFloat(duration.trim()));
          } else {
            reject(new Error('Failed to get audio duration'));
          }
        });

        ffprobe.on('error', (error) => {
          reject(
            new Error(
              `FFprobe command failed: ${error.message}. Make sure FFmpeg is installed and in your PATH.`
            )
          );
        });
      });
    };

    const audioDuration = await getDuration();
    const imageDuration = audioDuration / images.length;

    // Download and save images locally
    const imageFiles = [];
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      const imagePath = path.join(
        tempDir,
        `image_${i.toString().padStart(3, '0')}.jpg`
      );

      try {
        // Handle both local files (starting with /) and full URLs
        if (imageUrl.startsWith('/')) {
          // Local file - copy from public directory
          const localImagePath = path.join(
            process.cwd(),
            'public',
            imageUrl.substring(1)
          );
          if (fs.existsSync(localImagePath)) {
            fs.copyFileSync(localImagePath, imagePath);
            imageFiles.push(imagePath);
          } else {
            throw new Error(`Local image not found: ${localImagePath}`);
          }
        } else {
          // External URL - fetch it
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
          }
          const buffer = await response.arrayBuffer();
          fs.writeFileSync(imagePath, Buffer.from(buffer));
          imageFiles.push(imagePath);
        }
      } catch (error) {
        console.error(`Failed to process image ${i}:`, error);
        // Use a default image if processing fails
        const defaultImagePath = path.join(
          process.cwd(),
          'public',
          'default.png'
        );
        if (fs.existsSync(defaultImagePath)) {
          fs.copyFileSync(defaultImagePath, imagePath);
          imageFiles.push(imagePath);
        }
      }
    }

    // Create video using FFmpeg
    const createVideo = () => {
      return new Promise((resolve, reject) => {
        const inputPattern = path.join(tempDir, 'image_%03d.jpg');

        // Try to find ffmpeg in common Windows locations
        const possiblePaths = [
          'ffmpeg', // Try PATH first
          'C:\\ffmpeg\\bin\\ffmpeg.exe',
          'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
          process.env.FFMPEG_PATH || 'ffmpeg',
        ];

        let ffmpegPath = 'ffmpeg';
        for (const path of possiblePaths) {
          try {
            if (path.includes('\\') && fs.existsSync(path)) {
              ffmpegPath = path;
              break;
            }
          } catch (e) {
            // Continue to next path
          }
        }

        const ffmpegArgs = [
          '-y', // Overwrite output file
          '-framerate',
          `${1 / imageDuration}`, // Frame rate based on image duration
          '-i',
          inputPattern,
          '-i',
          audioPath,
          '-c:v',
          'libx264',
          '-preset',
          'medium', // Use medium preset for better quality
          '-c:a',
          'aac',
          '-b:a',
          '128k', // Set audio bitrate
          '-pix_fmt',
          'yuv420p',
          '-movflags',
          '+faststart', // Enable fast start for web playback
          '-shortest', // Stop when shortest input ends
          '-r',
          '30', // Output frame rate
          '-s',
          '1920x1080', // Output resolution
          '-vf',
          'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2', // Video filter
          outputPath,
        ];

        const ffmpeg = spawn(ffmpegPath, ffmpegArgs);

        ffmpeg.on('close', (code) => {
          if (code === 0) {
            // Verify the output file was created and has content
            if (fs.existsSync(outputPath)) {
              const stats = fs.statSync(outputPath);
              if (stats.size > 0) {
                // Cleanup temp directory
                fs.rmSync(tempDir, { recursive: true, force: true });
                resolve();
              } else {
                reject(new Error('Output file was created but is empty'));
              }
            } else {
              reject(new Error('Output file was not created'));
            }
          } else {
            reject(new Error(`FFmpeg process exited with code ${code}`));
          }
        });

        ffmpeg.on('error', (error) => {
          reject(
            new Error(
              `FFmpeg command failed: ${error.message}. Make sure FFmpeg is installed and in your PATH.`
            )
          );
        });
      });
    };

    await createVideo();
    console.log('Video export completed successfully');
    return NextResponse.json({
      success: true,
      videoUrl: `/exports/${videoId}.mp4`,
      message: 'Video exported successfully',
    });
  } catch (error) {
    console.error('Video export error:', error);
    return NextResponse.json(
      {
        error: 'Failed to export video',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
