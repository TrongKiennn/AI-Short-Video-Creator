"use client"
import React from 'react'
import { Player } from "@remotion/player";
import RemotionEditor from '@/app/_components/RemotionEditor';

function RemotionPlayer({videoData, onTimeUpdate, onDurationUpdate, durationInFrames, newAudio}) {

  return (
    <div className='border rounded-2xl'>
        <Player
            // Add a key to force re-mount when the audio source changes
            key={newAudio?.name || videoData?.audioUrl}
            component={RemotionEditor}
            durationInFrames={Number(durationInFrames.toFixed(0))}
            compositionWidth={1440}
            compositionHeight={1080}
            fps={30}
            controls
            style={{
              width:'100%',
              height:'75vh',
            }}
            inputProps={{
              videoData:videoData,
              setDurationInFrame: onDurationUpdate,
              newAudio: newAudio
            }}
            onTimeUpdate={(frame) => {
              if (onTimeUpdate) {
                onTimeUpdate(frame);
              }
            }}
        />
    </div>
  )
}

export default RemotionPlayer