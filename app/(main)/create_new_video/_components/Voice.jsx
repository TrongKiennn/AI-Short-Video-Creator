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
      <h2 className="mt-5">Video Voice</h2>
      <p className="text-sm text-gray-400 mb-1">Select voice for your video</p>

      <div className="grid grid-cols-2 gap-3">
        {options?.map((voice, index) => (
          <h2
            
            className={`cursor-pointer p-3 dark:bg-slate-900 dark:border-white hover:border border-gray-300 rounded-lg flex items-center gap-2 
                ${(voice.name == selectedVoice && "border")}`}
            onClick={() => {
              setSelectedVoice(voice.name);
              onHandleInputChange("voice", voice.value);
            }}
            key={index}>{voice.name}</h2>
        ))}
      </div>
    </div>
  );
}

export default Voice;
