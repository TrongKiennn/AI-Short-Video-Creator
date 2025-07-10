import React, { useContext, useEffect, useState, useMemo } from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  Audio,
} from 'remotion';
import { VideoFrameContext } from '../_context/VideoFramesContext';

function RemotionEditor({ videoData, setDurationInFrame, newAudio }) {
  const { frameList } = useContext(VideoFrameContext);
  const [durationInFrames, setLocalDurationInFrames] = useState(100);

  const getAudioDuration = (urlOrFile) => {
    return new Promise((resolve, reject) => {
      const source =
        typeof urlOrFile === 'string'
          ? urlOrFile
          : URL.createObjectURL(urlOrFile);
      const audioElement = new window.Audio(source);
      audioElement.addEventListener('loadedmetadata', () => {
        if (typeof urlOrFile !== 'string') URL.revokeObjectURL(source);
        resolve(audioElement.duration);
      });
      audioElement.addEventListener('error', (e) => {
        if (typeof urlOrFile !== 'string') URL.revokeObjectURL(source);
        reject('Unable to load audio: ' + e.message);
      });
    });
  };

  const audioUrl = videoData?.audioUrl;

  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  useEffect(() => {
    if (videoData) getDurationFrame();
  }, [videoData, newAudio]);

  const getDurationFrame = async () => {
    const audioSource =
      newAudio?.file ||
      (audioUrl ? `${audioUrl}?v=${new Date().getTime()}` : null);
    if (!audioSource) return 0;

    try {
      const durationInSeconds = await getAudioDuration(audioSource);
      const totalFrames = durationInSeconds * fps;
      setLocalDurationInFrames(totalFrames);
      setDurationInFrame(totalFrames);
      return totalFrames;
    } catch (err) {
      console.error(err);
      return 0;
    }
  };

  const finalAudioSrc = useMemo(() => {
    if (newAudio?.file) return URL.createObjectURL(newAudio.file);
    if (audioUrl) return `${audioUrl}?v=${new Date().getTime()}`;
    return null;
  }, [newAudio, audioUrl]);

  useEffect(() => {
    return () => {
      if (finalAudioSrc && newAudio?.file) {
        URL.revokeObjectURL(finalAudioSrc);
      }
    };
  }, [finalAudioSrc, newAudio]);

  return (
    <div className="w-full h-full">
      <AbsoluteFill>
        {frameList?.map((item, index) => {
          const duration = Number(durationInFrames.toFixed(0));
          const startTime = (index * duration) / frameList?.length;
          const scale = (index) =>
            interpolate(
              frame,
              [startTime, startTime + duration / 2, startTime + duration],
              index % 2 == 0 ? [1, 1.8, 1] : [1.8, 1, 1.8],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
          const src =
            item.type === 'file' ? URL.createObjectURL(item.value) : item.value;
          return (
            <div key={index}>
              <Sequence from={startTime} durationInFrames={duration}>
                <AbsoluteFill>
                  <Img
                    src={src}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: `scale(${scale(index)})`,
                    }}
                  />
                </AbsoluteFill>
              </Sequence>
            </div>
          );
        })}
        {finalAudioSrc && <Audio src={finalAudioSrc} />}
      </AbsoluteFill>
    </div>
  );
}

export default RemotionEditor;
