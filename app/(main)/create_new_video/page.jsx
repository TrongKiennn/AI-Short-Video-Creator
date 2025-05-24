"use client";
import React, { useState, useEffect } from "react";
import Topic from "./_components/Topic";
import VideoStyle from "./_components/VideoStyle";
import Voice from "./_components/Voice";
import Captions from "./_components/Captions";
import Preview from "./_components/Preview";
import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

function CreateNewVideo() {
  const [fromData, setFromData] = useState();

  const onHandleInputChange = (fieldName, FieldValue) => {
    setFromData((prev) => ({ ...prev, [fieldName]: FieldValue }));
  };

  useEffect(() => {
    console.log("fromData updated:", fromData);
  }, [fromData]);

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
          <Button className="w-full mt-5"><WandSparkles/>Generate Video</Button>
        </div>
        <div>
          <Preview fromData={fromData}/>
        </div>
      </div>
    </div>
  );
}

export default CreateNewVideo;
