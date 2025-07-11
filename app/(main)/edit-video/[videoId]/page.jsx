"use client";
import React, { useEffect, useState } from 'react';
import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams } from 'next/navigation';
import RemotionPlayer from '../_components/RemotionPlayer';
import TrackList from '../_components/TrackList';
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react';
import Audio from '../_components/Audio';

function VideoEditor() {
  const convex = useConvex();
  const { videoId } = useParams();
  const [videoData, setVideoData] = useState();
  const [currentTime, setCurrentTime] = useState(0);
  const [durationInFrames, setDurationInFrames] = useState(100);
  const [newAudio, setNewAudio] = useState(null); // State for the new audio file

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
          <h2 className='flex gap-2 items-center pb-2 text-black'>
            <ArrowLeft/>
            Back to play video
          </h2>
        </Link>
        {/* Remotion Player */}
        <RemotionPlayer 
          videoData={videoData} 
          onTimeUpdate={setCurrentTime}
          onDurationUpdate={setDurationInFrames}
          durationInFrames={durationInFrames}
          newAudio={newAudio} // Pass new audio state
        />
        {/* Audio Track */}
        <Audio 
          videoData={videoData} 
          currentTime={currentTime}
          durationInFrames={durationInFrames}
          fps={30}
          newAudio={newAudio} // Pass new audio state
          setNewAudio={setNewAudio} // Pass handler to update state
        />
      </div>
      <div className="md:col-span-1">
        <TrackList videoData={videoData} />
      </div>
    </div>
  );
  
}

export default VideoEditor;