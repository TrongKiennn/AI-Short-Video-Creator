import React from 'react';
import { options } from './VideoStyle';
import Image from 'next/image';

function Preview({ formData }) {
  const selectVideoStyle =
    formData && options.find((item) => item?.name === formData?.videoStyle);

  return (
    <div className="relative">
      <h2 className="mb-3 text-2xl">Preview</h2>

      {selectVideoStyle?.image ? (
        <Image
          src={selectVideoStyle.image}
          alt={selectVideoStyle.name || 'Video Style'}
          width={100}
          height={300}
          className="w-full h-[70vh] object-cover rounded-xl"
        />
      ) : (
        <div className="w-full h-[70vh] bg-gray-200 flex items-center justify-center rounded-xl">
          <span className="text-gray-500">Select your video style</span>
        </div>
      )}

      {/* Display topic on top of preview */}
      {formData?.topic && formData.topic.trim() !== '' && (
        <h2 className="absolute top-11 text-center w-full text-yellow-500 text-3xl font-bold bg-gray-900 rounded-xl">
          {formData.topic}
        </h2>
      )}

      {/* Display caption at bottom of preview */}
      <h2
        className={`${formData?.caption?.style} absolute bottom-7 text-center w-full`}
      >
        {formData?.caption?.name}
      </h2>
    </div>
  );
}

export default Preview;
