import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2Icon, Volume2Icon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';

function AudioGenerator({
  formData,
  ttsText,
  setTtsText,
  ttsAudioUrl,
  setTtsAudioUrl,
  ttsIsLoading,
  setTtsIsLoading,
}) {
  const handleGenerateAudio = async () => {
    if (!formData?.script || !formData?.voice || !formData?.topic) {
      alert(
        'Please select a topic, script, and voice before generating audio!'
      );
      return;
    }

    setTtsIsLoading(true);
    try {
      const ttsRes = await axios.post('/api/tts', {
        text: formData.script,
        voice: formData.voice,
        topic: formData.topic,
      });
      setTtsAudioUrl(ttsRes.data.audioUrl);
    } catch (err) {
      alert('Lỗi khi tạo audio: ' + err.message);
    } finally {
      setTtsIsLoading(false);
    }
  };

  return (
    <div className="mt-5">
      <h2 className="text-black text-xl font-bold mb-2">Create Audio</h2>
      <Textarea
        className="mb-4 shadow-amber-950 text-black"
        placeholder="Enter the text you want to convert to speech..."
        value={ttsText}
        onChange={(e) => setTtsText(e.target.value)}
        rows={3}
      />
      <Button
      className={` mt-5 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 
    bg-gradient-to-r from-purple-500 to-pink-500 shadow-md hover:from-purple-600 hover:to-pink-600 hover:shadow-lg`}

        onClick={handleGenerateAudio}
        disabled={ttsIsLoading || !formData?.script || !formData?.voice}
      >
        {ttsIsLoading ? (
          <Loader2Icon className="animate-spin mr-2" />
        ) : (
          <Volume2Icon className="mr-2" />
        )}
        Generate Audio
      </Button>
      {ttsAudioUrl && (
        <div className="mt-4">
          <audio src={ttsAudioUrl} controls className="w-full" />
          <div className="text-xs text-gray-500 mt-1">Generated audio</div>
        </div>
      )}
    </div>
  );
}

export default AudioGenerator;
