'use client';
import React, { use, useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useConvex, useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthContext } from '@/app/provider';
import moment from 'moment';
import { RefreshCcw } from 'lucide-react';

function VideoList() {
  const [videoList, setVideoList] = useState([]);
  const convex = useConvex();
  const { user } = useAuthContext();

  useEffect(() => {
    user && GetUserVideoList();
  }, [user]);

  const GetUserVideoList = async () => {
    const result = await convex.query(api.videoData.GetUserVideos, {
      uid: user?._id,
    });
    setVideoList(result);
    // Legacy polling removed - useVideoStatusPolling hook handles completion detection
  };
  return (
    <div>
      {videoList?.length == 0 ? (
        <div className="flex flex-col items-center justify-center mt-28 gap-5 p-5 border border-dashed rounded-2xl py-16">
          <Image src={'/logo.svg'} alt="logo" width={60} height={60} />
          <h2 className="text-gray-400 text-lg">
            You don't have any video created. Create new one
          </h2>
          <Link href={'create-new-video'}>
            <Button>+ Create New Video</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mt-10">
          {videoList?.map((video, index) => (
            <Link key={index} href={'play-video/' + video?._id}>
              <div className="relative">
                {video.status === 'complete' ? (
                  <Image
                    src={video?.images[0]}
                    alt={video?.title}
                    width={500}
                    height={500}
                    className="w-full object-cover rounded-xl aspect-[2/3]"
                  />
                ) : (
                  <div className="aspect-[2/3] p-5 w-full rounded-xl bg-slate-900 flex items-center justify-center">
                    <RefreshCcw className="animate-spin" />
                    <h2>Generating...</h2>
                  </div>
                )}
                <div className="absolute bottom-3 px-5 w-full">
                  <h2>{video?.title}</h2>
                  <h2 className="text-sm">
                    {moment(video?._creationTime).fromNow()}
                  </h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default VideoList;
