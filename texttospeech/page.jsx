'use client';

import React, { useState } from 'react';
import TextToSpeech from '../../_components/TextToSpeech';
import { Textarea } from '@/components/ui/textarea';

function TextToSpeechPage() {
  const [text, setText] = useState('Welcome to the text to speech converter!');

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Text to Speech Converter</h1>
      <div className="space-y-4">
        <Textarea
          placeholder="Enter text to convert to speech..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[100px]"
        />
        <TextToSpeech text={text} />
      </div>
    </div>
  );
}

export default TextToSpeechPage;
