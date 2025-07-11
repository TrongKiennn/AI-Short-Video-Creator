import React from "react";
import { useState } from "react";

const options = [
  {
    name: "Youtuber",
    style:
      "text-yellow-400 text-3xl font-extrabold uppercase tracking-wide drop-shadow-md px-3 py-1 rounded-lg",
  },
  {
    name: "Minimalist",
    style: "text-purple-400 text-3xl font-light tracking-tight px-2 py-1 rounded-lg",
  },
  {
    name: "Bold Red",
    style:
      "text-red-500 text-3xl font-bold uppercase tracking-wider px-4 py-2 rounded-lg shadow-lg",
  },
  {
    name: "Elegant",
    style:
      "text-purple-600 text-3xl italic font-medium tracking-wide px-3 py-1 rounded-lg",
  },
  {
    name: "Retro",
    style:
      "text-green-600 text-3xl font-mono uppercase tracking-widest px-4 py-2 rounded-lg shadow-inner",
  },
  {
    name: "Neon",
    style:
      "text-pink-500 text-3xl font-extrabold uppercase tracking-wide px-3 py-1 rounded-lg shadow-lg",
  },
  {
    name: "Classic",
    style:
      "text-blue-800 text-3xl font-serif tracking-normal px-2 py-1 rounded-lg",
  },
  {
    name: "Playful",
    style:
      "text-orange-500 text-3xl font-bold tracking-wide px-3 py-2 rounded-lg shadow-md",
  },
  {
    name: "Modern",
    style:
      "text-gray-500 text-3xl font-semibold tracking-tight px-3 py-1 rounded-lg shadow-sm",
  },
  {
    name: "Futuristic",
    style:
      "text-cyan-500 text-3xl font-bold uppercase tracking-widest px-4 py-2 rounded-lg shadow-lg",
  },
];

function Captions({ onHandleInputChange }) {
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState();
  return (
    <div className="mt-5">
      <h2 className="text-black text-xl font-bold">Caption Style</h2>
      <p className="text-sm text-gray-600">Select caption style</p>

      <div className="flex flex-wrap gap-4 mt-2">
        {options.map((option, index) => (
          <div
            key={index}
            className={`p-1 bg-white-200 hover:border border-gray-500 cursor-pointer rounded-lg ${option.name == selectedCaptionStyle && "border"}`}
            onClick={() => {
              setSelectedCaptionStyle(option.name);
              onHandleInputChange("caption", option);
            }}
          >
            <h2 className={option.style}>{option.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Captions;
