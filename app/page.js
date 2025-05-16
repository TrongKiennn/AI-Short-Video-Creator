import Image from "next/image";
import {Button} from "@/components/ui/button"
import Header from "./_component/Header";
import Hero from "./_component/Hero"

export default function Home() {
  return (
  <div className="md:px-16 lg:px-24 xl:px-36">
      {/*header*/}
      <Header/>

      {/*Hero */}
      <Hero />
  </div>
  );
}
