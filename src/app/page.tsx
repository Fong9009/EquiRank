import Image from "next/image";
import Splash from "@/components/pages/home/Splash";
import Features from "@/components/pages/home/Features";
import Benefits from "@/components/pages/home/Benefits";

export default function Home() {
  return (
      <>
          <Splash/>
          <Features/>
          <Benefits/>
      </>
  );
}
