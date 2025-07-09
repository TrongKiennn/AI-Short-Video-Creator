'use client';
import React from 'react';
import { useAuthContext } from '@/app/provider';

function YouTubeConnectionStatus() {
  const { user, youtubeConnected } = useAuthContext();

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            youtubeConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-sm font-medium">
          YouTube:{' '}
          {youtubeConnected ? 'Ready to upload videos' : 'Not ready to upload'}
        </span>
      </div>

      {!youtubeConnected && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Sign in to YouTube in sidebar to upload videos
        </span>
      )}
    </div>
  );
}

export default YouTubeConnectionStatus;
