"use client";
import React, { useState, useEffect } from "react";
import Topic from "./_components/Topic";

function CreateNewVideo() {
  const [fromData, setFromData] = useState();

  const onHandleInputChange = (fieldName, FieldValue) => {
    setFromData((prev) => ({ ...prev, [fieldName]: FieldValue }));
  };

  useEffect(() => {
    console.log("Form Data", fromData);
  }, [fromData]);

  return (
    <div>
      <h2 className="text-3xl">Create New Video</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 mt-8">
        <div className="col-span-2 p-7 border rounded-xl">
          {/* Topic and script */}
          <Topic onHandleInputChange={onHandleInputChange} />
          {/* Video image style */}
          {/* Voice */}
          {/* Captions */}
        </div>
        <div></div>
      </div>
    </div>
  );
}

export default CreateNewVideo;
