import { useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthContext } from '@/app/provider';
import { autoExportAndUploadToYouTube } from '@/lib/autoUpload';

export const useVideoStatusPolling = (videoId, onComplete) => {
  const { user } = useAuthContext();
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

  useEffect(() => {
    if (
      videoData &&
      videoData.status === 'complete' &&
      !hasCompletedRef.current
    ) {
      hasCompletedRef.current = true;

      // Call the original onComplete callback
      onComplete?.(videoData);

      // Check if auto-upload is enabled and trigger it with 20-second delay
      if (userPreferences?.autoUploadToYoutube && user?.email) {
        console.log(
          'Auto-upload enabled, scheduling auto-upload for video:',
          videoData._id,
          'in 20 seconds'
        );

        // Wait 20 seconds before triggering auto-upload
        setTimeout(() => {
          console.log('Starting auto-upload for video:', videoData._id);
          autoExportAndUploadToYouTube(videoData, user, updateVideoUrl).catch(
            (error) => {
              console.error('Auto-upload failed:', error);
            }
          );
        }, 20000); // 20 seconds delay
      }
    }
  }, [videoData, onComplete, userPreferences, user, updateVideoUrl]);

  useEffect(() => {
    // Reset when videoId changes
    if (videoId) {
      hasCompletedRef.current = false;
    }
  }, [videoId]);

  return videoData;
};
