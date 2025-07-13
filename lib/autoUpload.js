import axios from 'axios';
import { toast } from 'react-toastify';
import YouTubeSuccessToast from '@/components/YouTubeSuccessToast';

// Track videos that are currently being auto-uploaded to prevent duplicates
const uploadsInProgress = new Set();

/**
 * Automatically exports and uploads a video to YouTube
 * @param {Object} videoData - The video data object
 * @param {Object} user - The user object with email
 * @param {Function} updateVideoUrl - Function to update video URL in database (optional)
 * @returns {Promise<boolean>} - Success status
 */
export const autoExportAndUploadToYouTube = async (
  videoData,
  user,
  updateVideoUrl = null
) => {
  if (!videoData || !user?.email) {
    console.error('Missing video data or user information for auto-upload');
    return false;
  }

  // Check if this video is already being uploaded
  const uploadKey = `${videoData._id}-${user.email}`;
  if (uploadsInProgress.has(uploadKey)) {
    console.log('Auto-upload already in progress for video:', videoData._id);
    return false;
  }

  // Mark this upload as in progress
  uploadsInProgress.add(uploadKey);
  console.log('Auto-upload: Marked video as in progress:', uploadKey);

  try {
    // Show initial toast
    const toastId = toast.info(
      '🎬 Auto-exporting and uploading your video to YouTube...',
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );

    // Step 1: Export the video
    console.log('Auto-export: Starting video export for:', videoData._id);

    // Validate required data before making API call
    if (
      !videoData._id ||
      !videoData.audioUrl ||
      !videoData.images ||
      !videoData.title
    ) {
      throw new Error('Missing required video data for export');
    }

    const exportResponse = await axios.post(
      '/api/export-video',
      {
        videoId: videoData._id,
        audioUrl: videoData.audioUrl,
        images: videoData.images,
        title: videoData.title,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 300000, // 5 minute timeout for export
      }
    );

    if (!exportResponse.data.success) {
      throw new Error('Video export failed');
    }

    const videoUrl = exportResponse.data.videoUrl;
    console.log('Auto-export: Video exported successfully:', videoUrl);

    // Update video URL in database if function provided
    if (updateVideoUrl && videoData._id && videoUrl) {
      try {
        await updateVideoUrl({
          recordId: videoData._id,
          videoUrl: videoUrl,
        });
        console.log('Auto-upload: Updated video URL in database');
      } catch (dbError) {
        console.error('Failed to update video URL in database:', dbError);
        // Continue with upload even if DB update fails
      }
    }

    // Step 2: Upload to YouTube
    console.log('Auto-upload: Starting YouTube upload');

    // Validate required data for YouTube upload
    if (!videoUrl || !videoData.title || !user.email) {
      throw new Error('Missing required data for YouTube upload');
    }

    const uploadResponse = await axios.post(
      '/api/youtube/upload',
      {
        videoPath: videoUrl,
        title: videoData.title || 'AI Generated Video',
        description: `${videoData.script || 'AI Generated Video'}\n\n🎬 Generated with AI Video Creator\n\n📝 Topic: ${videoData.topic || 'General'}\n🎨 Video Style: ${videoData.videoStyle || 'Default'}\n\n#AIGenerated #ShortVideo #AutomatedContent #${(videoData.topic || 'general').replace(/\s+/g, '')}`,
        tags: [
          videoData.topic || 'AI Generated',
          videoData.videoStyle || 'Short Video',
          'AI Generated',
          'Short Video',
          'Automated Content',
          'AI Creator',
          'Video Generation',
        ]
          .filter(Boolean)
          .slice(0, 10), // YouTube allows max 10 tags
        userEmail: user.email,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 300000, // 5 minute timeout for upload
      }
    );

    if (uploadResponse.data.success) {
      console.log('Auto-upload: YouTube upload successful');

      // Update the toast with success message
      toast.update(toastId, {
        render: (
          <YouTubeSuccessToast
            title={videoData.title || 'AI Generated Video'}
            videoUrl={uploadResponse.data.videoUrl}
            isAutoUpload={true}
          />
        ),
        type: 'success',
        autoClose: 15000,
        closeOnClick: false,
        draggable: true,
      });

      // Remove from uploads in progress
      uploadsInProgress.delete(uploadKey);
      console.log(
        'Auto-upload: Removed video from progress (success):',
        uploadKey
      );

      return true;
    } else {
      throw new Error('YouTube upload failed');
    }
  } catch (error) {
    console.error('Auto-upload failed:', error);

    // Remove from uploads in progress on error
    uploadsInProgress.delete(uploadKey);
    console.log('Auto-upload: Removed video from progress (error):', uploadKey);

    let errorMessage = 'Unknown error occurred';

    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout - please try again';
    } else if (error.response) {
      // Server responded with error status
      errorMessage =
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.message;
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error - please check your connection';
    } else if (error.message && error.message.includes('JSON')) {
      // JSON parsing error
      errorMessage = 'Data formatting error - please try again';
    } else {
      errorMessage = error.message || 'Unknown error occurred';
    }

    // Check if it's a YouTube auth error
    if (
      errorMessage.includes('authentication') ||
      errorMessage.includes('token') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('No YouTube authorization found') ||
      errorMessage.includes('connect your YouTube account')
    ) {
      toast.error(
        '❌ Auto-upload failed: YouTube not connected. Please connect your YouTube account in the dashboard.',
        {
          autoClose: 8000,
        }
      );
    } else {
      toast.error(`❌ Auto-upload failed: ${errorMessage}`, {
        autoClose: 8000,
      });
    }

    return false;
  }
};
