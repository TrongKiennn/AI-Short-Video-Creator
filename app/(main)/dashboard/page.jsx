'use client';
import React, { useEffect, useState } from 'react';
import VideoList from './_components/VideoList';
import YouTubeConnectionStatus from '@/app/_components/YouTubeConnectionStatus';
import YouTubeAutoUploadToggle from '@/app/_components/YouTubeAutoUploadToggle';

function Dashboard() {
  const [statusMessage, setStatusMessage] = useState(null);
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    // Check URL parameters for YouTube connection success/error
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('youtube_connected') === 'true') {
      // Show success message
      setStatusMessage(
        'YouTube connected successfully! You can now upload videos.'
      );
      setMessageType('success');
      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      // Clear message after 5 seconds
      setTimeout(() => {
        setStatusMessage(null);
        setMessageType('');
      }, 5000);
    } else if (urlParams.get('youtube_error')) {
      // Show error message
      const error = urlParams.get('youtube_error');
      setStatusMessage(`YouTube connection failed: ${error}`);
      setMessageType('error');
      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      // Clear message after 8 seconds
      setTimeout(() => {
        setStatusMessage(null);
        setMessageType('');
      }, 8000);
    }
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-bold text-3xl mb-4">My Video</h2>

        {/* Status message display */}
        {statusMessage && (
          <div
            className={`mb-4 p-4 rounded-lg border ${
              messageType === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{statusMessage}</span>
              <button
                onClick={() => setStatusMessage(null)}
                className="ml-4 text-sm opacity-70 hover:opacity-100"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <YouTubeConnectionStatus />
        
        {/* Auto Upload Toggle */}
        <div className="mt-4">
          <YouTubeAutoUploadToggle />
        </div>
      </div>
      <VideoList />
    </div>
  );
}

export default Dashboard;
