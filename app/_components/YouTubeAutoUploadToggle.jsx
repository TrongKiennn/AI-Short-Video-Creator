'use client';
import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Youtube, Settings } from 'lucide-react';
import { useAuthContext } from '@/app/provider';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'react-toastify';

function YouTubeAutoUploadToggle() {
  const { user, youtubeConnected } = useAuthContext();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Get user preferences
  const userPreferences = useQuery(
    api.users.getUserPreferences,
    user?._id ? { userId: user._id } : 'skip'
  );

  const updateAutoUploadPreference = useMutation(
    api.users.updateAutoUploadPreference
  );

  useEffect(() => {
    if (userPreferences) {
      setIsEnabled(userPreferences.autoUploadToYoutube || false);
    }
  }, [userPreferences]);

  const connectYouTube = async () => {
    if (!user?._id) {
      toast.error('You must be logged in to connect YouTube.');
      return false;
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
        // Open YouTube auth in new window instead of redirecting
        const authWindow = window.open(
          authUrl,
          'youtube-auth',
          'width=500,height=600'
        );

        // Listen for auth completion
        const checkClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkClosed);
            setIsConnecting(false);
            // Check if connection was successful by reloading the page
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }, 1000);

        return true;
      } else {
        const error = await response.json();
        console.error('YouTube connect error:', error);
        toast.error('Failed to connect to YouTube. Please try again.');
        setIsConnecting(false);
        return false;
      }
    } catch (error) {
      console.error('YouTube connection error:', error);
      toast.error('Failed to connect to YouTube. Please try again.');
      setIsConnecting(false);
      return false;
    }
  };

  const handleToggleChange = async (checked) => {
    if (!user?._id) {
      toast.error('You must be logged in to change this setting.');
      return;
    }

    if (checked && !youtubeConnected) {
      // User wants to enable auto-upload but YouTube is not connected
      const shouldConnect = window.confirm(
        'To enable automatic YouTube uploads, you need to connect your YouTube account. Would you like to connect now?'
      );

      if (shouldConnect) {
        const connected = await connectYouTube();
        if (!connected) {
          // Connection failed, don't enable the toggle
          return;
        }
        // Note: The actual toggle update will happen after page reload when YouTube is connected
      } else {
        // User declined to connect, don't enable the toggle
        return;
      }
    }

    try {
      await updateAutoUploadPreference({
        userId: user._id,
        autoUploadToYoutube: checked,
      });

      setIsEnabled(checked);

      if (checked) {
        toast.success(
          '✅ Automatic YouTube upload enabled! New videos will be automatically uploaded and exported.'
        );
      } else {
        toast.info('❌ Automatic YouTube upload disabled.');
      }
    } catch (error) {
      console.error('Failed to update preference:', error);
      toast.error('Failed to update auto-upload preference.');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
          <Youtube className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="font-medium">Auto Upload to YouTube</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Automatically export and upload new videos to YouTube
          </p>
          {!youtubeConnected && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              ⚠️ YouTube connection required
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isConnecting && (
          <span className="text-sm text-blue-600">Connecting...</span>
        )}
        <Switch
          checked={isEnabled && youtubeConnected}
          onCheckedChange={handleToggleChange}
          disabled={isConnecting}
        />
      </div>
    </div>
  );
}

export default YouTubeAutoUploadToggle;
