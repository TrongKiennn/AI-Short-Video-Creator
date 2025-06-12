import React, { useEffect, useState  } from 'react'
import { AbsoluteFill, Img, interpolate, Sequence, useCurrentFrame, useVideoConfig, Audio  } from 'remotion';

function RemotionComposition({videoData, setDurationInFrame}) {

  
  const [durationInFrames, setLocalDurationInFrames] = useState(100);
  const getAudioDuration = (url) => {
    return new Promise((resolve, reject) => {
      const audioElement = new window.Audio(url);
      audioElement.addEventListener("loadedmetadata", () => {
        resolve(audioElement.duration);
      });
      audioElement.addEventListener("error", (e) => {
        reject("Không thể tải audio: " + e.message);
      });
    });
  };
  
    const audioUrl=videoData?.audioUrl;
  
    const {fps}=useVideoConfig();
    const imageList=videoData?.images;
    const frame=useCurrentFrame();
    useEffect(()=>{
      videoData&&getDurationFrame();
    },[videoData])
  
    const getDurationFrame = async () => {
      
      try {
        const durationInSeconds = await getAudioDuration(audioUrl);
        const totalFrames = durationInSeconds * fps;
        console.log("Tổng frame:", totalFrames);
        setLocalDurationInFrames(totalFrames);
        setDurationInFrame(totalFrames)
        return totalFrames
      } catch (err) {
        console.error(err);
        return 0;
      }
    };

    
  
  return (
    <div className='w-full h-full'>
      <AbsoluteFill>
        {imageList?.map((item,index)=>{
        
        
          const duration=Number(durationInFrames.toFixed(0));
          const startTime=(index*duration)/imageList?.length;
          const scale=(index)=>interpolate(
            frame,
            [startTime,startTime+duration/2,startTime+duration],index%2==0?[1,1.8,1]:[1.8,1,1.8],
            {extrapolateLeft:'clamp',extrapolateRight:'clamp'}
          )

          return (
            <div key={index} >
              <Sequence from={startTime} durationInFrames={duration}>
                <AbsoluteFill>
                  <Img 
                    src={item}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform:`scale(${scale(index)})`
                    }}
                  />
                </AbsoluteFill>
              </Sequence>
            </div>
          );
          
        })}
        {videoData?.audioUrl&&<Audio src={videoData.audioUrl}/>}

      </AbsoluteFill>
    </div>
  )
}

export default RemotionComposition