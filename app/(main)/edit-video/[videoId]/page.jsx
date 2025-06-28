"use client";
import React, { useEffect, useState } from 'react';
import { useConvex, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams, useRouter } from 'next/navigation';
import RemotionPlayer from '../_components/RemotionPlayer';
import TrackList from '../_components/TrackList';
import Link from 'next/link'
import { Button } from '@/components/ui/button';
import { ArrowLeft, DownloadIcon } from 'lucide-react';

function VideoEditor() {
  const convex = useConvex();
  const { videoId } = useParams();
  const [videoData, setVideoData] = useState();
  // const router = useRouter();
  // const updateVideo = useMutation(api.videoData.UpdateVideo);

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
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 p-2">
      <div className="md:col-span-3">
      <Link href={'/play-video/' +videoData?._id}>
          <h2 className='flex gap-2 items-center pb-2'>
            <ArrowLeft/>
            Back to play video
          </h2>
        </Link>
        {/* Remotion Player */}
        <RemotionPlayer videoData={videoData} />
      </div>
      <div className="md:col-span-1">
        <TrackList videoData={videoData} />
      </div>
    </div>
  );
  
}

export default VideoEditor;