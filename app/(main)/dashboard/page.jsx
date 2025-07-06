import React from 'react';
import VideoList from './_components/VideoList';
import YouTubeConnectionStatus from '@/app/_components/YouTubeConnectionStatus';

function Dashboard() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-bold text-3xl mb-4">My Video</h2>
        <YouTubeConnectionStatus />
      </div>
      <VideoList />
    </div>
  );
}

export default Dashboard;
