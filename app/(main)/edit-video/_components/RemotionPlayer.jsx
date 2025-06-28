"use client"
import React, { useState } from 'react'
import { Player } from "@remotion/player";
import { useVideoConfig } from 'remotion';
import RemotionEditor from '@/app/_components/RemotionEditor';

function RemotionPlayer({videoData}) {
  
  const [durationInFrames,setDurationInFrame]=useState(100)
  return (
    <div className='border rounded-2xl'>
        <Player
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
              setDurationInFrame:(frameValue)=>setDurationInFrame(frameValue)
            }}
        />
    </div>
  )
}

export default RemotionPlayer