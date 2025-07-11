import Image from "next/image";
import {Button} from "@/components/ui/button"
import Header from "./_components/Header";
import Hero from "./_components/Hero"

export default function Home() {
  return (
  <div className="h-screen w-screen md:px-16 lg:px-24 xl:px-36 bg-white">
      {/*header*/}
      <Header/>

      {/*Hero */}
      <Hero />
  </div>
  );
}
