import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

const YouTubeSuccessToast = ({ title, videoUrl, isAutoUpload = false }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = videoUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleOpenVideo = () => {
    window.open(videoUrl, '_blank');
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🎉</span>
        <span className="font-semibold">
          {isAutoUpload ? 'Auto-uploaded to YouTube!' : 'Uploaded to YouTube!'}
        </span>
      </div>

      <div className="space-y-3">
        <div className="text-sm">
          <span className="font-medium">Title:</span> {title}
        </div>

        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Video URL:</span>
          </div>

          <div className="bg-gray-100 rounded-md p-2">
            <div className="text-sm font-mono text-gray-700 mb-2 break-all">
              {videoUrl}
            </div>

            <div className="flex gap-2 justify-start">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                  isCopied
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                disabled={isCopied}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>

              <button
                onClick={handleOpenVideo}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
              >
                <ExternalLink className="w-3 h-3" />
                Open
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeSuccessToast;
