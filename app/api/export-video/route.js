import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
  try {
    const { videoId, audioUrl, images, title } = await request.json();

    console.log('Export video request:', {
      videoId,
      audioUrl,
      imagesCount: images?.length,
      title,
    });

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

    // Download and save images locally
    const imageFiles = [];
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      const imagePath = path.join(
        tempDir,
        `image_${i.toString().padStart(3, '0')}.jpg`
      );

      try {
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(imagePath, Buffer.from(buffer));
        imageFiles.push(imagePath);
      } catch (error) {
        console.error(`Failed to download image ${i}:`, error);
        // Use a default image if download fails
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

    console.log('Using audio file:', audioPath);

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
            console.log('Audio duration:', duration.trim(), 'seconds');
            resolve(parseFloat(duration.trim()));
          } else {
            reject(new Error('Failed to get audio duration'));
          }
        });

        ffprobe.on('error', (error) => {
          console.error('FFprobe error:', error.message);
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

    console.log(
      `Audio duration: ${audioDuration}s, Images: ${images.length}, Duration per image: ${imageDuration}s`
    );

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

        console.log('Using ffmpeg path:', ffmpegPath);

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
          '-c:a',
          'aac',
          '-pix_fmt',
          'yuv420p',
          '-color_range',
          'tv', // Specify TV range to avoid deprecated pixel format warnings
          '-shortest', // Stop when shortest input ends
          '-r',
          '30', // Output frame rate
          '-s',
          '1920x1080', // Output resolution
          '-vf',
          "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='min(zoom+0.0015,1.5)':d=125:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2):s=1920x1080,format=yuv420p", // Add format filter to handle pixel format conversion properly
          outputPath,
        ];

        const ffmpeg = spawn(ffmpegPath, ffmpegArgs);

        ffmpeg.stderr.on('data', (data) => {
          console.log('FFmpeg:', data.toString());
        });

        ffmpeg.on('close', (code) => {
          console.log('FFmpeg process finished with code:', code);
          if (code === 0) {
            // Cleanup temp directory
            fs.rmSync(tempDir, { recursive: true, force: true });
            resolve();
          } else {
            reject(new Error(`FFmpeg process exited with code ${code}`));
          }
        });

        ffmpeg.on('error', (error) => {
          console.error('FFmpeg spawn error:', error.message);
          reject(
            new Error(
              `FFmpeg command failed: ${error.message}. Make sure FFmpeg is installed and in your PATH.`
            )
          );
        });
      });
    };

    await createVideo();
    console.log(`Video exported successfully: ${outputPath}`);
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
