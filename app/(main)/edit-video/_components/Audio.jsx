'use client';
import { AudioWaveform, Loader2, Play, Pause } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import axios from 'axios';
import { useRouter } from 'next/navigation';

function Audio({ videoData, currentTime, durationInFrames, fps, newAudio, setNewAudio }) {
  // const [newAudio, setNewAudio] = useState(null); // State is now managed by parent
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewProgress, setPreviewProgress] = useState({ currentTime: 0, duration: 0 });
  
  const audioInputRef = useRef(null);
  const previewAudioRef = useRef(null);

  const updateAudio = useMutation(api.videoData.UpdateAudioUrl);
  const router = useRouter();

  useEffect(() => {
    // Cleanup function to pause audio when component unmounts
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        setIsPreviewing(true);
      }
    };
  }, []);

  if (!videoData?.audioUrl) {
    return null;
  }

  const handleReplaceClick = () => {
    audioInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('file', file);

      // Upload tạm lên Supabase
      const result = await axios.post("/api/supabase", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Lưu cả file và url tạm thời vào state
      setNewAudio({ file, name: file.name, url: result.data.url });
      setIsSaving(false);
    }
  };

  const handlePreviewToggle = () => {
    if (!previewAudioRef.current) return;

    if (isPreviewing) {
      previewAudioRef.current.pause();
      setIsPreviewing(false);
    } else {
      // Ưu tiên dùng url public nếu có, nếu không thì dùng file local
      const source = newAudio?.url
        ? newAudio.url
        : newAudio?.file
          ? URL.createObjectURL(newAudio.file)
          : `${videoData.audioUrl}?v=${new Date().getTime()}`;

      previewAudioRef.current.src = source;
      previewAudioRef.current.play().catch(error => console.error("Audio play failed:", error));
      setIsPreviewing(true);
    }
  };

  const handleSave = async () => {
    if (!newAudio?.url) return;
    setIsSaving(true);
    try {
      // Gọi mutation để update audioUrl trong DB
      await updateAudio({
        recordId: videoData._id,
        audioUrl: newAudio.url,
      });
      window.location.reload();
    } catch (error) {
      console.error("Failed to replace audio:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const mainPlayerCurrentTime = currentTime / fps;
  const mainPlayerDuration = durationInFrames / fps;

  const hasNewAudioWithDuration = newAudio && previewProgress.duration > 0;
  const displayDuration = hasNewAudioWithDuration ? previewProgress.duration : mainPlayerDuration;
  const displayCurrentTime = isPreviewing ? previewProgress.currentTime : (hasNewAudioWithDuration ? 0 : mainPlayerCurrentTime);
  const progressPercentage = displayDuration > 0 ? (displayCurrentTime / displayDuration) * 100 : 0;

  const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  //const audioFileName = newAudio?.name || videoData.audioUrl.split('/').pop().split('?')[0];
  const audioFileName = newAudio?.name || videoData.audioUrl.split('/').pop().split('?')[0];
  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border border-purple-300 shadow-md relative group transition-all duration-300">
      <div className="flex items-center gap-4">
        <Button
          size="icon"
          variant="ghost"
          onClick={handlePreviewToggle}
          className="h-9 w-9 flex-shrink-0 text-purple-400 hover:text-purple-300"
        >
          {isPreviewing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-medium text-gray-800 truncate" title={audioFileName}>
              {audioFileName}
            </p>
            <p className="text-xs font-mono text-gray-400">
              {formatTime(displayCurrentTime)} / {formatTime(displayDuration)}
            </p>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" onClick={handleReplaceClick} disabled={isSaving}>
          Replace
        </Button>
        {newAudio && (
          <Button size="sm" variant="secondary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </Button>
        )}
      </div>
      <input
        type="file"
        ref={audioInputRef}
        onChange={handleFileChange}
        accept="audio/*"
        hidden
      />
      <audio 
        ref={previewAudioRef} 
        onEnded={() => {
          setIsPreviewing(false);
          setPreviewProgress(prev => ({ ...prev, currentTime: 0 }));
        }}
        onLoadedMetadata={() => {
          if (previewAudioRef.current) {
            setPreviewProgress({ currentTime: 0, duration: previewAudioRef.current.duration });
          }
        }}
        onTimeUpdate={() => {
          if (previewAudioRef.current) {
            setPreviewProgress(prev => ({ ...prev, currentTime: previewAudioRef.current.currentTime }));
          }
        }}
        hidden 
      />
    </div>
  );
}

export default Audio;