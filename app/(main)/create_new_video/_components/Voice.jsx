import React from "react";
import { useState } from "react";
const options = [
  {
    value: "af_sarah",
    name: "🇺🇸 Sarah (Female)",
  },
  {
    value: "af_sky",
    name: "🇺🇸 Sky (Female)",
  },
  {
    value: "am_adam",
    name: "🇺🇸 Adam (Male)",
  },
  {
    value: "hf_alpha",
    name: "🇮🇳 Alpha (Female)",
  },
  {
    value: "hm_psi",
    name: "🇮🇳 Psi (Male)",
  },
  {
    value: "am_echo",
    name: "🇺🇸 Echo (Male)",
  },
  {
    value: "am_eric",
    name: "🇺🇸 Eric (Male)",
  },
  {
    value: "am_fenrir",
    name: "🇺🇸 Fenrir (Male)",
  },
  {
    value: "am_liam",
    name: "🇺🇸 Liam (Male)",
  },
  {
    value: "am_michael",
    name: "🇺🇸 Michael (Male)",
  },
  {
    value: "am_onyx",
    name: "🇺🇸 Onyx (Male)",
  },
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
