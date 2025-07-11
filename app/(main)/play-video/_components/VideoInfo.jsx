import { Button } from '@/components/ui/button';
import { ArrowLeft, DownloadIcon, Youtube } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import axios from 'axios';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthContext } from '@/app/provider';
import { toast } from 'react-toastify';

function VideoInfo({ videoData }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const { user, youtubeConnected } = useAuthContext();

  const updateVideoUrl = useMutation(api.videoData.UpdateVideoUrl);

  const handleExportVideo = async () => {
    if (!videoData?.images || !videoData?.audioUrl) {
      toast.error('Video data incomplete. Missing images or audio.');
      return null;
    }

    setIsExporting(true);
    setUploadStatus('Exporting video...');

    try {
      const response = await axios.post('/api/export-video', {
        videoId: videoData._id,
        audioUrl: videoData.audioUrl,
        images: videoData.images,
        title: videoData.title,
      });

      if (response.data.success) {
        // Update the video URL in the database
        await updateVideoUrl({
          recordId: videoData._id,
          videoUrl: response.data.videoUrl,
        });

        setUploadStatus('Video exported successfully!');
        toast.success('🎬 Video exported successfully!');
        return response.data.videoUrl;
      }
    } catch (error) {
      console.error('Export failed:', error);
      setUploadStatus('Export failed');
      toast.error(
        'Failed to export video: ' +
          (error.response?.data?.error || error.message)
      );
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  const handleYouTubeUpload = async () => {
    // Check if user is authenticated
    if (!user?.email) {
      toast.error('You must be logged in to upload to YouTube.');
      return;
    }

    // Always try to export video first
    const videoUrl = await handleExportVideo();
    if (!videoUrl) {
      return; // Export failed
    }

    setIsUploading(true);
    setUploadStatus('Uploading to YouTube...');

    try {
      const response = await axios.post('/api/youtube/upload', {
        videoPath: videoUrl,
        title: videoData.title,
        description: `${videoData.script}\n\nGenerated with AI Video Creator\n\nTopic: ${videoData.topic}\nVideo Style: ${videoData.videoStyle}`,
        tags: [
          videoData.topic,
          videoData.videoStyle,
          'AI Generated',
          'Short Video',
          'Automated Content',
        ],
        userEmail: user.email,
      });

      if (response.data.success) {
        setUploadStatus('Successfully uploaded to YouTube!');
        toast.success(
          `🎉 Video uploaded successfully to YouTube!\nVideo URL: ${response.data.videoUrl}\nStatus: ${response.data.status}`,
          {
            autoClose: 8000,
          }
        );
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload failed');
      const errorMessage =
        error.response?.data?.error || 'Unknown error occurred';

      // Check if the error is related to YouTube authentication or no authorization
      if (
        errorMessage.includes('authentication') ||
        errorMessage.includes('token') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('No YouTube authorization found') ||
        errorMessage.includes('connect your YouTube account')
      ) {
        const shouldConnect = confirm(
          'YouTube authentication failed or not connected. You need to connect your YouTube account first. Would you like to connect now?'
        );
        if (shouldConnect) {
          try {
            const response = await fetch('/api/youtube/connect', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user._id,
                email: user.email,
                displayName: user.displayName,
              }),
            });

            if (response.ok) {
              const { authUrl } = await response.json();
              window.location.href = authUrl;
            } else {
              toast.error('Failed to connect to YouTube. Please try again.');
            }
          } catch (connectError) {
            console.error('YouTube connection error:', connectError);
            toast.error('Failed to connect to YouTube. Please try again.');
          }
        }
      } else {
        toast.error(`Failed to upload to YouTube: ${errorMessage}`);
      }
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(''), 5000); // Clear status after 5 seconds
    }
  };

  const handleDownload = async () => {
    // Always export the video first to ensure it exists
    setIsExporting(true);
    setUploadStatus('Exporting video...');

    const videoUrl = await handleExportVideo();
    if (!videoUrl) {
      setIsExporting(false);
      return; // Export failed
    }

    setIsExporting(false);
    setUploadStatus('');

    // Create download link
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${videoData.title || 'video'}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('📥 Video download started!');
  };

  return (
    <div className="p-5 border rounded-xl">
      <Link href={'/dashboard'}>
        <h2 className="flex gap-2 items-center">
          <ArrowLeft />
          Back to Dashboard
        </h2>
      </Link>
      <div className="flex flex-col gap-3">
        <h2 className="mt-5">Project Name: {videoData?.title}</h2>
        <p className="text-gray-500">Script: {videoData?.script}</p>
        <h2>Video Style: {videoData?.videoStyle}</h2>

        {uploadStatus && (
          <p
            className={`text-sm ${uploadStatus.includes('Success') ? 'text-green-600' : uploadStatus.includes('failed') ? 'text-red-600' : 'text-blue-600'}`}
          >
            {uploadStatus}
          </p>
        )}

        <div className="flex justify-between items-center mt-3">
          <Link href={`/edit-video/${videoData?._id}`}>
            <Button>Edit Video</Button>
          </Link>

          <div className="flex gap-2">
            <Button onClick={handleDownload} disabled={isExporting}>
              <DownloadIcon />
              {isExporting ? 'Exporting...' : 'Export & Download'}
            </Button>

            <Button
              onClick={handleYouTubeUpload}
              disabled={isUploading || isExporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Youtube className="w-4 h-4" />
              {isUploading
                ? 'Uploading...'
                : isExporting
                  ? 'Exporting...'
                  : 'Upload to YouTube'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoInfo;
