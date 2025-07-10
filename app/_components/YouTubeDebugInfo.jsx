'use client';
import React, { useState } from 'react';
import { useAuthContext } from '@/app/provider';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

function YouTubeDebugInfo() {
  const { user, youtubeConnected } = useAuthContext();
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  
  const youtubeToken = useQuery(
    api.youtubeTokens.getValidYouTubeToken,
    user?._id ? { userId: user._id } : 'skip'
  );

  const testConnection = async () => {
    if (!user?.email) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/youtube/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email,
        }),
      });
      
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ 
        connected: false, 
        error: 'Failed to test connection' 
      });
    } finally {
      setTesting(false);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-md">
      <h3 className="font-bold mb-2">YouTube Debug Info</h3>
      <div className="space-y-1">
        <div>User ID: {user?._id || 'None'}</div>
        <div>User Email: {user?.email || 'None'}</div>
        <div>YouTube Connected: {youtubeConnected ? 'TRUE' : 'FALSE'}</div>
        <div>Token Query Status: {youtubeToken === undefined ? 'Loading...' : 'Complete'}</div>
        <div>Has Token: {youtubeToken ? 'Yes' : 'No'}</div>
        <div>Has Refresh Token: {youtubeToken?.refreshToken ? 'Yes' : 'No'}</div>
        <div>Token Is Valid: {youtubeToken?.isValid ? 'Yes' : 'No'}</div>
        <div>Access Token Valid: {youtubeToken?.accessTokenValid ? 'Yes' : 'No'}</div>
        <div>Needs Refresh: {youtubeToken?.needsRefresh ? 'Yes' : 'No'}</div>
        <div>Token Created: {youtubeToken?.createdAt ? new Date(youtubeToken.createdAt).toLocaleString() : 'N/A'}</div>
        <div>Token Expires: {youtubeToken?.expiresAt ? new Date(youtubeToken.expiresAt).toLocaleString() : 'N/A'}</div>
        {youtubeToken?.error && <div className="text-red-300">Error: {youtubeToken.error}</div>}
      </div>
      
      {user?.email && (
        <div className="mt-3 pt-2 border-t border-gray-600">
          <button
            onClick={testConnection}
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-2 py-1 rounded text-xs"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          
          {testResult && (
            <div className="mt-2 text-xs">
              <div className={testResult.connected ? 'text-green-300' : 'text-red-300'}>
                Status: {testResult.connected ? 'Connected' : 'Not Connected'}
              </div>
              {testResult.channelName && (
                <div>Channel: {testResult.channelName}</div>
              )}
              {testResult.error && (
                <div className="text-red-300">Error: {testResult.error}</div>
              )}
              {testResult.message && (
                <div className="text-gray-300">{testResult.message}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default YouTubeDebugInfo;
