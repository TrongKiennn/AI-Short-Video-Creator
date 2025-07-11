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
      <h2 className="text-black text-xl font-semibold mb-2">Tạo Audio</h2>
      <Textarea
        className="mb-2"
        placeholder="Enter the text you want to convert to speech..."
        value={ttsText}
        onChange={(e) => setTtsText(e.target.value)}
        rows={3}
      />
      <Button
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
