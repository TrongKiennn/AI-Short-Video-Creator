import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthContext } from '@/app/provider';

export const useYouTubeConnection = () => {
  const { user } = useAuthContext();

  const youtubeToken = useQuery(
    api.youtubeTokens.getYouTubeToken,
    user?._id ? { userId: user._id } : 'skip'
  );

  return {
    isConnected: !!youtubeToken,
    isLoading: youtubeToken === undefined,
    tokenData: youtubeToken,
  };
};
