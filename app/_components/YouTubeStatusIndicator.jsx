'use client';
import React, { useState } from 'react';
import { Youtube, CheckCircle, X } from 'lucide-react';
import { useAuthContext } from '@/app/provider';

function YouTubeStatusIndicator() {
  const { youtubeConnected, user } = useAuthContext();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (!user?.email) return;

    const confirmed = confirm(
      'Are you sure you want to disconnect YouTube? You will need to reconnect to upload videos.'
    );
    if (!confirmed) return;

    setIsDisconnecting(true);
    try {
      const response = await fetch('/api/youtube/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('YouTube disconnected successfully:', result);
        // Force refresh the page to update connection status
        window.location.reload();
      } else {
        console.error('YouTube disconnect error:', result);
        alert(
          `Failed to disconnect YouTube: ${result.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      console.error('YouTube disconnect error:', error);
      alert('Failed to disconnect YouTube. Please try again.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (!youtubeConnected) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
      <div className="flex items-center gap-2">
        <Youtube className="w-4 h-4 text-green-600" />
        <CheckCircle className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-600 dark:text-green-400">
          YouTube Connected
        </span>
      </div>
      <button
        onClick={handleDisconnect}
        disabled={isDisconnecting}
        className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
        title="Disconnect YouTube"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default YouTubeStatusIndicator;
