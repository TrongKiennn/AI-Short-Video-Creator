import { useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthContext } from '@/app/provider';
import { autoExportAndUploadToYouTube } from '@/lib/autoUpload';
import { toast } from 'react-toastify';

export const useVideoStatusPolling = (videoId, onComplete) => {
  const { user } = useAuthContext();
  
  // Use reactive query for real-time updates
  const videoData = useQuery(
    api.videoData.GetVideoById,
    videoId ? { videoId } : 'skip'
  );

  // Get user preferences to check if auto-upload is enabled
  const userPreferences = useQuery(
    api.users.getUserPreferences,
    user?._id ? { userId: user._id } : 'skip'
  );

  // Mutation to update video URL
  const updateVideoUrl = useMutation(api.videoData.UpdateVideoUrl);

  const hasCompletedRef = useRef(false);
  const hasTriggeredAutoUploadRef = useRef(false);

  // Stable callback to avoid re-creating on every render
  const handleComplete = useCallback((video) => {
    if (onComplete) {
      console.log('🎬 Video completed! Triggering completion callback:', video._id);
      onComplete(video);
    }
  }, [onComplete]);

  // Single unified completion handler
  useEffect(() => {
    if (
      videoData &&
      videoData.status === 'complete' &&
      !hasCompletedRef.current
    ) {
      hasCompletedRef.current = true;
      console.log('✅ Video completed!', videoData._id);

      // Show completion toast
      handleComplete(videoData);

      // Handle auto-upload if enabled and not already triggered
      if (
        userPreferences?.autoUploadToYoutube && 
        user?.email && 
        !hasTriggeredAutoUploadRef.current
      ) {
        hasTriggeredAutoUploadRef.current = true;
        console.log('🚀 Auto-upload enabled, starting process for video:', videoData._id);
        
        // Start auto-upload immediately
        autoExportAndUploadToYouTube(videoData, user, updateVideoUrl).catch(
          (error) => {
            console.error('Auto-upload failed:', error);
            // Reset flag on failure so user can manually retry
            hasTriggeredAutoUploadRef.current = false;
          }
        );
      }
    }
  }, [videoData, handleComplete, userPreferences, user, updateVideoUrl]);

  // Reset completion flags when videoId changes
  useEffect(() => {
    if (videoId) {
      console.log('🔄 Starting polling for new video:', videoId);
      hasCompletedRef.current = false;
      hasTriggeredAutoUploadRef.current = false;
    }
  }, [videoId]);

  return videoData;
};
