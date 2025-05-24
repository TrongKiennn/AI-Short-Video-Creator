import React from "react";
import { useState } from "react";
import Image from "next/image";

export const options = [
    { name: "3D", image: "/3D.png" },
    { name: "Cartoon", image: "/cartoon.png" },
    { name: "Anime", image: "/anim.png" },
    { name: "Realistic", image: "/realistic.png" },
    { name: "Water Color", image: "/water_color.png" },
    { name: "Cinematic", image: "/cinematic.png" },
    { name: "Digital", image: "/digital.png" },
];

function VideoStyle({ onHandleInputChange }) {
    const [selectedVideoStyle, setSelectedVideoStyle] = useState();
    return (
        <div className="mt-5">
            <h2>VideoStyle</h2>
            <p className="text=sm text-gray-400 mb-1">Select video</p>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
                {options?.map((option, index) => (
                    <div
                        className="relative"
                        key={index}
                        onClick={() => {
                            setSelectedVideoStyle(option.name);
                            onHandleInputChange("videoStyle", option.name);
                        }}
                    >
                        <Image
                            src={option.image}
                            alt={option.name}
                            width={500}
                            height={120}
                            className={`object-cover h-[90px] lg:h-[130px] xl:h-[180px] rounded-xl p-1 hover:border border-gray-300 cursor-pointer ${option.name == selectedVideoStyle && "border"}`}
                        />
                        <h2 className="absolute bottom-1 text-center w-full">
                            {option.name}
                        </h2>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default VideoStyle;
