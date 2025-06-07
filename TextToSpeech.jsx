'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

const LANGUAGES = [
  { value: 'en', label: 'English' }
];

const TextToSpeech = ({ text }) => {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [audioDuration, setAudioDuration] = useState(null);
  const [audioSize, setAudioSize] = useState(null);
  const [waveformData, setWaveformData] = useState(null);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0].value);

  useEffect(() => {
    fetch(`/api/tts?lang=${selectedLang}`)
      .then(res => res.json())
      .then(data => {
        if (data.voices && data.voices.length > 0) {
          setVoices(data.voices);
          setSelectedVoice(data.voices[0].value);
        } else {
          setVoices([]);
          setSelectedVoice('');
        }
      });
  }, [selectedLang]);

  useEffect(() => {
    fetch('/api/tts')
      .then(res => res.json())
      .then(data => {
        if (data.voices && data.voices.length > 0) {
          setVoices(data.voices);
          setSelectedVoice(data.voices[0].value);
        }
      });
  }, []);

  useEffect(() => {
    if (audioUrl) {
      fetch(audioUrl)
        .then(res => res.blob())
        .then(blob => {
          setAudioSize(blob.size);
          const url = URL.createObjectURL(blob);
          const audio = new window.Audio(url);
          audio.onloadedmetadata = () => {
            setAudioDuration(audio.duration);
            URL.revokeObjectURL(url);
          };
        });
      setWaveformData(Array(32).fill(0).map(() => Math.random()));
    } else {
      setAudioDuration(null);
      setAudioSize(null);
      setWaveformData(null);
    }
  }, [audioUrl]);

  const handlePlay = async () => {
    if (!text || !selectedVoice) return;
    setIsLoading(true);
    setAudioUrl(null);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: selectedVoice, lang: selectedLang }),
      });
      const data = await response.json();
      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
        setIsPlaying(true);
      } else {
        alert('TTS failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('TTS error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Play button handler
  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Save button handler
  const handleSaveAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = audioUrl.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="p-4 space-y-4 relative">
      {/* Language selection */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">Language</label>
        <select
          id="lang-select"
          className="w-full p-2 text-sm border rounded-md dark:bg-slate-800 bg-white shadow-sm"
          onChange={e => setSelectedLang(e.target.value)}
          value={selectedLang}
        >
          {LANGUAGES.map(l => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>
      {/* Voice selection */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">Voice</label>
        <select
          id="voice-select"
          className="w-full p-2 text-sm border rounded-md dark:bg-slate-800 bg-white shadow-sm"
          onChange={e => setSelectedVoice(e.target.value)}
          value={selectedVoice}
          disabled={voices.length === 0}
        >
          {voices.map(v => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>
      </div>
      {/* Generate button */}
      <div className="pt-8">
        <div className="flex space-x-2">
          {isLoading ? (
            <Button disabled>Generating...</Button>
          ) : (
            <Button onClick={handlePlay} disabled={!text}>Generate</Button>
          )}
        </div>
      </div>
      {/* Result UI */}
      {audioUrl && (
        <div className="mt-8 bg-neutral-900 p-4 rounded-lg">
          <div className="text-white text-lg font-semibold mb-2">Speech Result</div>
          {/* Waveform visualization (placeholder) */}
          <div className="flex items-center mb-4">
            <div className="flex h-10 items-end gap-1 w-64 bg-neutral-800 rounded overflow-hidden">
              {waveformData && waveformData.map((v, i) => (
                <div key={i} style={{ height: `${10 + v * 30}px`, width: '3px', background: '#fff', opacity: 0.7 }} />
              ))}
            </div>
            <div className="ml-4 flex gap-2">
              <Button onClick={handlePlayAudio} size="sm" variant="secondary">
                ▶ Play
              </Button>
              <Button onClick={handleSaveAudio} size="sm" variant="outline">
                ⬇ Save
              </Button>
            </div>
          </div>
          <div className="text-gray-400 text-xs flex gap-6">
            <span>{audioDuration ? `${audioDuration.toFixed(2)} seconds` : ''}</span>
            <span>{audioSize ? `${(audioSize / 1024).toFixed(1)}KB` : ''}</span>
          </div>
          <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} hidden />
        </div>
      )}
    </div>
  );
};

export default TextToSpeech;
