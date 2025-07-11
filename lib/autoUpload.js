import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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
    const toastId = toast.info('🎬 Auto-uploading your video to YouTube...', {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
    });

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

    // Small delay to ensure file is ready (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Validate required data for YouTube upload
    if (!videoUrl || !videoData.title || !user.email) {
      throw new Error('Missing required data for YouTube upload');
    }

    const uploadResponse = await axios.post(
      '/api/youtube/upload',
      {
        videoPath: videoUrl,
        title: videoData.title,
        description: `${videoData.script || 'AI Generated Video'}\n\nGenerated with AI Video Creator\n\nTopic: ${videoData.topic || 'General'}\nVideo Style: ${videoData.videoStyle || 'Default'}`,
        tags: [
          videoData.topic || 'AI Generated',
          videoData.videoStyle || 'Short Video',
          'AI Generated',
          'Short Video',
          'Automated Content',
        ],
        userEmail: user.email,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 120000, // 2 minute timeout for upload
      }
    );

    if (uploadResponse.data.success) {
      console.log('Auto-upload: YouTube upload successful');
      
      const youtubeUrl = uploadResponse.data.videoUrl;

      // Create a custom toast with copiable link
      const ToastContent = () => (
        <div className="flex flex-col gap-2">
          <div className="font-semibold">🎉 Video uploaded to YouTube!</div>
          <div className="text-sm">Title: {videoData.title}</div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-blue-600 underline break-all">{youtubeUrl}</div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(youtubeUrl);
                toast.success('Link copied to clipboard!', { autoClose: 2000 });
              }}
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Copy
            </button>
          </div>
          <div className="text-xs text-gray-500">Video is public and ready to share!</div>
        </div>
      );

      // Update the toast with success message and copiable link
      toast.update(toastId, {
        render: <ToastContent />,
        type: 'success',
        autoClose: 15000, // Longer duration for copying
        closeOnClick: true,
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
