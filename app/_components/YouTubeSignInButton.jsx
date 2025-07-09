'use client';
import React, { useState } from 'react';
import { Youtube } from 'lucide-react';
import { useAuthContext } from '@/app/provider';

function YouTubeSignInButton() {
  const { user, youtubeConnected } = useAuthContext();
  const [isConnecting, setIsConnecting] = useState(false);

  // Don't show the button if YouTube is already connected
  if (youtubeConnected) {
    return null;
  }

  const connectYouTube = async () => {
    if (!user?._id) {
      alert('You must be logged in to connect YouTube.');
      return;
    }

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
        alert('Failed to connect to YouTube. Please try again.');
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('YouTube connection error:', error);
      alert('Failed to connect to YouTube. Please try again.');
      setIsConnecting(false);
    }
  };

  return (
    <button
      onClick={connectYouTube}
      disabled={isConnecting}
      className="flex items-center gap-4 p-3 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Youtube className="w-5 h-5 text-red-600" />
      <span className="text-sm">
        {isConnecting ? 'Connecting...' : 'Sign in to YouTube'}
      </span>
    </button>
  );
}

export default YouTubeSignInButton;
