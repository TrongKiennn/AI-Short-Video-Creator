import React from 'react';
import { Button } from '@/components/ui/button';
import Authentication from './Authentication';

function Hero() {
  return (
    <div className="p-10 flex flex-col items-center justify-center mt-24 md:px-20 lg:px-36 xl:px-48 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg">
      <h2 className="font-extrabold text-6xl text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 drop-shadow-md">
        AI Short Video Generator
      </h2>
      <p className="mt-4 text-2xl text-center text-gray-600">
        🤖 AI generates scripts, images, and voiceovers in seconds. ⚡ Create,
        edit, and publish engaging shorts with ease!
      </p>

      <div className="mt-7 gap-8 flex w-full">
        <Button
          size="lg"
          variant="secondary"
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md"
        >
          Explore
        </Button>
        <Authentication>
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md"
          >
            Get Started
          </Button>
        </Authentication>
      </div>
    </div>
  );
}

export default Hero;