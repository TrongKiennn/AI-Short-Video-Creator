import React from 'react';
import { useState } from 'react';
import Image from 'next/image';

export const options = [
  { name: '3D', image: '/3D.png' },
  { name: 'Cartoon', image: '/cartoon.png' },
  { name: 'Anime', image: '/anim.png' },
  { name: 'Realistic', image: '/realistic.png' },
  { name: 'Water Color', image: '/water_color.png' },
  { name: 'Cinematic', image: '/cinematic.png' },
  { name: 'Digital', image: '/digital.png' },
];

function VideoStyle({ onHandleInputChange }) {
  const [selectedVideoStyle, setSelectedVideoStyle] = useState();
  return (
    <div className="mt-5">
      <h2 className="text-xl font-bold text-gray-800">Video Style</h2>
      <p className="text-sm text-gray-600 mb-3">
        Select a style for your video
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {options?.map((option, index) => (
          <div
            className={`relative p-2 rounded-xl transition-all duration-200 cursor-pointer shadow-md backdrop-blur-lg 
              ${
                option.name === selectedVideoStyle
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg '
                  : 'bg-white/50 hover:bg-white/70 hover:shadow-lg '
              }`}
            key={index}
            onClick={() => {
              setSelectedVideoStyle(option.name);
              onHandleInputChange('videoStyle', option.name);
            }}
          >
            <div className="overflow-hidden rounded-lg">
              <Image
                src={option.image}
                alt={option.name}
                width={500}
                height={120}
                className="object-cover h-[90px] lg:h-[130px] xl:h-[180px]"
              />
            </div>
            <h2
              className={`absolute bottom-2 left-0 right-0 text-center text-md font-semibold ${
                option.name === selectedVideoStyle
                  ? 'text-pink-600 text-lg text-bold'
                  : 'text-orange-400'
              }`}
            >
              {option.name}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VideoStyle;
