'use client';
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/app/provider';

function YouTubeConnectionStatus() {
  const { user, youtubeConnected } = useAuthContext();
  const [isConnecting, setIsConnecting] = useState(false);

  const connectYouTube = async () => {
    if (!user?._id) return;

    setIsConnecting(true);
    try {
      const response = await fetch('/api/youtube/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          email: user.email,
          displayName: user.displayName,
        }),
      });

      if (response.ok) {
        const { authUrl } = await response.json();
        window.location.href = authUrl;
      } else {
        const error = await response.json();
        console.error('YouTube connect error:', error);
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('YouTube connection error:', error);
      setIsConnecting(false);
    }
  };

  // Check URL parameters for connection status
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('youtube_connected') === 'true') {
      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

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
          YouTube: {youtubeConnected ? 'Connected' : 'Not Connected'}
        </span>
      </div>

      {!youtubeConnected && (
        <button
          onClick={connectYouTube}
          disabled={isConnecting}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Connect YouTube'}
        </button>
      )}

      {youtubeConnected && (
        <span className="text-sm text-green-600 dark:text-green-400">
          Ready to upload videos
        </span>
      )}
    </div>
  );
}

export default YouTubeConnectionStatus;
