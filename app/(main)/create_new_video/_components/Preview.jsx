import React from "react";
import { options } from "./VideoStyle";
import Image
 from "next/image";

function Preview({ fromData }) {
    const selectVideoStyle = fromData && options.find((item=>item?.name==fromData?.videoStyle));
    return (
        <div className="relative">
            <h2 className="mb-3 text-2xl">Preview</h2>
            <Image src={selectVideoStyle?.image} alt = {selectVideoStyle?.name} width={100} height={300}
            className="w-full h-[70vh] object-cover rounded-xl"/>
            <h2 className={`${fromData?.caption?.style} absolute bottom-7 text-center w-full`}>{fromData?.caption?.name}</h2>
        </div>
        
    )
}

export default Preview;