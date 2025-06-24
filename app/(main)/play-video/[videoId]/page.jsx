"use client";
import React, { useEffect, useState } from 'react';
import VideoInfo from '../_components/VideoInfo';
import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams, useRouter } from 'next/navigation';
import RemotionPlayer from '../_components/RemotionPlayer';

function PlayVideo() {
  const convex = useConvex();
  const { videoId } = useParams();
  const [videoData, setVideoData] = useState();
  const router = useRouter();

  useEffect(() => {
    if (videoId) {
      GetVideoDataById();
    }
  }, [videoId]);

  const GetVideoDataById = async () => {
    const result = await convex.query(api.videoData.GetVideoById, {
      videoId: videoId,
    });
    setVideoData(result);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-4">
      <div>
        {/* Remotion Player */}
        <RemotionPlayer videoData={videoData} />
        
      </div>
      <div>
        {/* Video Information */}
        <VideoInfo videoData={videoData} />
      </div>
    </div>
  );
}

export default PlayVideo;