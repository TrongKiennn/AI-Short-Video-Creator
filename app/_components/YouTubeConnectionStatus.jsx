'use client';
import React from 'react';
import { useAuthContext } from '@/app/provider';

function YouTubeConnectionStatus() {
  const { user, youtubeConnected } = useAuthContext();

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-pink-50 shadow-2xl rounded-lg">
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            youtubeConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-lg font-medium text-black">
          YouTube:{' '}
          {youtubeConnected ? 'Ready to upload videos' : 'Not ready to upload'}
        </span>
        {youtubeConnected && user.email && (
          <span className="text-sm text-green-300 font-bold">
            ({user.email})
          </span>
        )}
      </div>

      {!youtubeConnected && (
        <span className="text-sm text-gray-900 dark:text-gray-400">
          Sign in to YouTube in sidebar to upload videos
        </span>
      )}
    </div>
  );
}

export default YouTubeConnectionStatus;
