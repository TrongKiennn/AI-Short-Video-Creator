'use client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useContext, useEffect, useRef, useState } from 'react';
import defaultImage from '@/public/default.png';
import { VideoFrameContext } from '@/app/_context/VideoFramesContext';

function TrackList({ videoData }) {
  const [imageList, setImageList] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedReplaceIndex, setSelectedReplaceIndex] = useState(null);
  const {frameList, setFrameList}=useContext(VideoFrameContext)
  useEffect(() => {
    if (videoData?.images) {
      const mapped = videoData.images.map((url) => ({
        type: 'url',
        value: url,
      }));
      setImageList(mapped);
    }
  }, [videoData]);

  const handleDelete = (index) => {
    const updated = [...imageList];
    updated[index] = { type: 'default', value: '/default.png' };
    setImageList(updated);
  };

  const handleReplaceClick = (index) => {
    setSelectedReplaceIndex(index);
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && selectedReplaceIndex !== null) {
      const updated = [...imageList];
      updated[selectedReplaceIndex] = { type: 'file', value: file };
      setImageList(updated);
      setSelectedReplaceIndex(null);
    }
  };

  const handleSave = async () => {
    const newImageUrls = await Promise.all(
      imageList.map(async (item) => {
        if (item.type === 'url' || item.type === 'default') {
          return item.value;
        } else if (item.type === 'file') {
          const formData = new FormData();
          formData.append('file', item.value);

          const res = await fetch('/api/supabase/upload-to-supabase', {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();
          return data.url;
        }
      })
    );

    console.log('Danh sách URL sau khi Save:', newImageUrls);

  
  };

  useEffect(()=>{
    setFrameList(imageList)
  },[imageList])

  console.log(frameList);

  return (
    <div className="h-[600px] p-5 rounded-lg flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {imageList.map((item, index) => {
          const src =
            item.type === 'url' || item.type === 'default'
              ? item.value
              : URL.createObjectURL(item.value);

          return (
            <div
              key={index}
              className="relative w-full aspect-square border rounded overflow-hidden group"
            >
              <Image
                src={src}
                alt={`frame-${index}`}
                fill
                className="object-cover"
              />
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <Button size="sm" variant="destructive" onClick={() => handleDelete(index)}>
                  X
                </Button>
                <Button size="sm" onClick={() => handleReplaceClick(index)}>
                  Replace
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        hidden
      />

      <Button size="sm" className="mt-4 w-full" onClick={handleSave}>
        Save frame
      </Button>
    </div>
  );
}

export default TrackList;
