'use client';

import React, { useState } from 'react';
import TextToSpeech from '../../_components/TextToSpeech';
import { Textarea } from '@/components/ui/textarea';

function TextToSpeechPage() {
  const [text, setText] = useState('Welcome to the text-to-speech converter tool!');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 rounded-2xl via-blue-100 to-purple-100 p-4 md:p-8">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 drop-shadow-md mb-4">
            Text to Speech
          </h1>
          <p className="text-lg text-gray-700">
            Easily convert text to speech.
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/60 rounded-2xl backdrop-blur-lg rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
          <div>
            <label htmlFor="tts-input" className="block text-lg font-semibold text-gray-800 mb-3">
              Enter your text to convert to speech:
            </label>
            <Textarea
              id="tts-input"
              placeholder="Nhập văn bản để chuyển đổi..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[150px] shadow-amber-950 p-4 bg-white/50 rounded-xl border-2 border-white/30 focus:ring-purple-500 focus:border-purple-500 text-lg text-gray-800 placeholder-gray-500"
            />
          </div>
          <TextToSpeech text={text} />
        </div>
      </div>
    </div>
  );
}

export default TextToSpeechPage;