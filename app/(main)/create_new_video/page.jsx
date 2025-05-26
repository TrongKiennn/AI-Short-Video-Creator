"use client";
import React, { useState, useEffect } from "react";
import Topic from "./_components/Topic";
import VideoStyle from "./_components/VideoStyle";
import Voice from "./_components/Voice";
import Captions from "./_components/Captions";
import Preview from "./_components/Preview";
import { Loader2Icon, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthContext } from "@/app/provider";


function CreateNewVideo() {
  const [formData, setFormFata] = useState();
  const CreateInitialVideoRecord=useMutation(api.videoData.CreateVideoData);
  const {user}=useAuthContext();
  const [loading,setLoading]=useState(false);
  console.log("User ne",user);
  const onHandleInputChange = (fieldName, FieldValue) => {
    setFormFata((prev) => ({ ...prev, [fieldName]: FieldValue }));
  };
  const GenerateVideo =async()=>{
    if (
    !formData?.topic ||
    !formData?.script ||
    !formData.videoStyle ||
    !formData.caption ||
    !formData.voice
  ){
      console.log("ERROR","Enter All Field");
      return;
    }

    setLoading(true);

    const resp=await CreateInitialVideoRecord({
      title:formData.title,
      topic:formData.topic,
      script:formData.script,
      videoStyle:formData.videoStyle,
      caption:formData.caption.name,
      voice:formData.voice,
      uid:user?._id,
      createdBy:user?.email
    });

    // console.log(resp);

    const result=await axios.post('/api/generate_video_data',{
      ...formData
    })


    // console.log(result);
    setLoading(false);
  }
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
          {/* Captions */}
          <Captions onHandleInputChange={onHandleInputChange}/>
          <Button className="w-full mt-5"
          disabled={loading}
          onClick={GenerateVideo}
          > {loading?<Loader2Icon className="animate-spin"/>:<WandSparkles/>}Generate Video</Button>
        </div>
        <div>
          <Preview formData={formData}/>
        </div>
      </div>
    </div>
  );
}

export default CreateNewVideo;
