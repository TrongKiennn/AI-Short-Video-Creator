import { useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export const useVideoStatusPolling = (videoId, onComplete) => {
  const videoData = useQuery(
    api.videoData.GetVideoById,
    videoId ? { videoId } : 'skip'
  );
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (
      videoData &&
      videoData.status === 'complete' &&
      !hasCompletedRef.current
    ) {
      hasCompletedRef.current = true;
      onComplete?.(videoData);
    }
  }, [videoData, onComplete]);

  useEffect(() => {
    // Reset when videoId changes
    if (videoId) {
      hasCompletedRef.current = false;
    }
  }, [videoId]);

  return videoData;
};
