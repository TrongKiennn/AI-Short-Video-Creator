"use client";
import React, { useState, useEffect, useRef } from "react";
import Topic from "./_components/Topic";
import VideoStyle from "./_components/VideoStyle";
import Voice from "./_components/Voice";
import Captions from "./_components/Captions";
import Preview from "./_components/Preview";
import GenerateAudio from "./_components/GenerateAudio";
import { Loader2Icon, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthContext } from "@/app/provider";
import TextToSpeech from "@/app/_components/TextToSpeech";
import { Textarea } from "@/components/ui/textarea";

function CreateNewVideo() {
  const [formData, setFormData] = useState({});
  const CreateInitialVideoRecord = useMutation(api.videoData.CreateVideoData);
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [ttsText, setTtsText] = useState("");
  const [mergeLoading, setMergeLoading] = useState(false);
  const [mergedVideoUrl, setMergedVideoUrl] = useState(null);
  const [lastVideoId, setLastVideoId] = useState(null);

  console.log("User ne", user);

  const onHandleInputChange = (fieldName, fieldValue) => {
    setFormData((prev) => ({ ...prev, [fieldName]: fieldValue }));
    if (fieldName === "script") {
      setTtsText(fieldValue); // Đồng bộ ttsText với script
    }
  };


  const GenerateVideo = async () => {
    if (
      !formData?.topic ||
      !formData?.script ||
      !formData.videoStyle ||
      !formData.caption ||
      !formData.voice ||
      !ttsAudioUrl
    ) {
      console.log("ERROR", "Enter All Field");
      return;
    }

    setLoading(true);

    const resp = await CreateInitialVideoRecord({
      title: formData.title,
      topic: formData.topic,
      script: formData.script,
      videoStyle: formData.videoStyle,
      caption: formData.caption.name,
      voice: formData.voice,
      audioUrl: ttsAudioUrl,
      uid: user?._id,
      createdBy: user?.email,
    });

    setLastVideoId(resp); // Lưu lại id video vừa tạo để merge sau
    setTtsText(formData.script);
    const result = await axios.post("/api/generate_video_data", {
      ...formData,
      recordId: resp,
      audioUrl: ttsAudioUrl,
    });

    // console.log(result);
    setLoading(false);
  };

  // Hàm gọi API merge audio vào video
  // const handleMergeAudio = async () => {
  //   if (!ttsText || !lastVideoId) return;
  //   setMergeLoading(true);
  //   try {
  //     // Gọi API text-to-speech để lấy audioUrl
  //     const ttsRes = await axios.post("/api/tts", {
  //       text: ttsText,
  //       voice: formData?.voice || "",
  //     });
  //     const audioUrl = ttsRes.data.audioUrl;
  //     // Gọi API merge audio vào video
  //     const mergeRes = await axios.post("/api/video-merge", {
  //       videoId: lastVideoId,
  //       audioUrl,
  //     });
  //     setMergedVideoUrl(mergeRes.data.videoUrl);
  //   } catch (err) {
  //     alert("Lỗi khi ghép giọng nói vào video: " + err.message);
  //   } finally {
  //     setMergeLoading(false);
  //   }
  // };

  // --- TTS xử lý trực tiếp, không gọi API backend ---
  const [ttsAudioUrl, setTtsAudioUrl] = useState(null);
  const [ttsIsLoading, setTtsIsLoading] = useState(false);
  const [ttsIsPlaying, setTtsIsPlaying] = useState(false);
  const ttsAudioRef = useRef(null);

  // Hàm chuyển văn bản thành giọng nói (client-side, Web Speech API demo)
  // const handleTTS = () => {
  //   if (!ttsText) return;
  //   setTtsIsLoading(true);
  //   // Nếu trình duyệt hỗ trợ Web Speech API
  //   if (window.speechSynthesis) { 
  //     const utter = new window.SpeechSynthesisUtterance(ttsText);
  //     utter.onend = () => setTtsIsLoading(false);
  //     window.speechSynthesis.speak(utter);
  //     setTtsIsPlaying(true);
  //     setTimeout(() => setTtsIsPlaying(false), 2000);
  //     setTtsAudioUrl(null);
  //   } else {
  //     alert('Trình duyệt không hỗ trợ Web Speech API');
  //     setTtsIsLoading(false);
  //   }
  // };

  useEffect(() => {
    console.log("formData updated:", formData);
  }, [formData]);

  return (
    <div>
      <h2 className="text-3xl">Create New Video</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 mt-8 gap-7">
        <div className="col-span-2 p-7 border rounded-xl h-[72vh] overflow-auto">
          {/* Topic and script */}
          <Topic onHandleInputChange={onHandleInputChange} />
          {/* Video image style */}
          <VideoStyle onHandleInputChange={onHandleInputChange} />
          {/* Voice */}

          <Voice onHandleInputChange={onHandleInputChange} />

          <GenerateAudio
            formData={formData}
            ttsText={ttsText}
            setTtsText={setTtsText}
            ttsAudioUrl={ttsAudioUrl}
            setTtsAudioUrl={setTtsAudioUrl}
            ttsIsLoading={ttsIsLoading}
            setTtsIsLoading={setTtsIsLoading}
          />
          
          {/* Captions */}
          <Captions onHandleInputChange={onHandleInputChange} />
          <Button
            className="w-full mt-5"
            disabled={loading}
            onClick={GenerateVideo}
          >
            {loading ? <Loader2Icon className="animate-spin" /> : <WandSparkles />}Generate Video
          </Button>
          
        </div>
        <div>
          <Preview formData={formData} />
        </div>
      </div>
    </div>
  );
}

export default CreateNewVideo;
