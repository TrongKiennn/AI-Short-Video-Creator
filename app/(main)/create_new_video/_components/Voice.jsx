import React from "react";
import { useState } from "react";

const options = [
  { value: "Aaliyah-PlayAI", name: "Aaliyah (PlayAI)" },
  { value: "Adelaide-PlayAI", name: "Adelaide (PlayAI)" },
  { value: "Angelo-PlayAI", name: "Angelo (PlayAI)" },
  { value: "Arista-PlayAI", name: "Arista (PlayAI)" },
  { value: "Atlas-PlayAI", name: "Atlas (PlayAI)" },
  { value: "Basil-PlayAI", name: "Basil (PlayAI)" },
  { value: "Briggs-PlayAI", name: "Briggs (PlayAI)" },
  { value: "Calum-PlayAI", name: "Calum (PlayAI)" },
  { value: "Celeste-PlayAI", name: "Celeste (PlayAI)" },
  { value: "Cheyenne-PlayAI", name: "Cheyenne (PlayAI)" },
  { value: "Chip-PlayAI", name: "Chip (PlayAI)" },
];

function Voice({ onHandleInputChange }) {
  const [selectedVoice, setSelectedVoice] = useState();

  return (
    <div>
      <h2 className="mt-5 text-xl font-bold text-gray-800">Video Voice</h2>
      <p className="text-sm text-gray-600 mb-3">Select voice for your video</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {options?.map((voice, index) => (
          <div
            key={index}
            className={`cursor-pointer p-4 rounded-xl transition-all duration-200 shadow-md backdrop-blur-lg 
              ${
                voice.name === selectedVoice
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg"
                  : "bg-white/50 text-gray-800 hover:bg-white/70 hover:shadow-lg"
              }`}
            onClick={() => {
              setSelectedVoice(voice.name);
              onHandleInputChange("voice", voice.value);
            }}
          >
            <h2 className="text-lg">{voice.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Voice;