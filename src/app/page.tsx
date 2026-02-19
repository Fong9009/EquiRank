import Image from "next/image";
import Splash from "@/components/pages/home/Splash";
import Features from "@/components/pages/home/Features";
import Benefits from "@/components/pages/home/Benefits";
import Footer from "@/components/layout/Footer";

// Avoid prerender: home page uses SessionProvider/useSession (client context)
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
      <>
          <Splash/>
          <Features/>
          <Benefits/>
          <Footer />
      </>
  );
}
