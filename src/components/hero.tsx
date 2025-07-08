"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export const HeroSection = () => {
  const router = useRouter();
  const handleWatchDemoBtn = () => {
    router.push("/voice-agent");
  };
  return (
    <section className="text-center px-8 py-16 bg-[radial-gradient(circle_at_center,#1a1a1a,#0c0c0c)]">
      <Image src="/logo-small-transparent.png" width={350} height={278} alt="logo" className="mx-auto mb-8" />
      <h1 className="text-[2.8rem] text-[#00fff7] font-['Orbitron',sans-serif] font-bold mb-6">
        The Missing Link for Humanoid Robots
      </h1>
      <p className="text-[1.2rem] text-[#aaa] font-['Inter',sans-serif]">Voice. Intelligence. Behavior.</p>
      <div className="mt-8">
        <button className="bg-[#00fff7] text-[#000] text-sm px-5 py-2.5 border-none rounded cursor-pointer transition-shadow duration-300 ease-in-out font-['Orbitron',sans-serif] hover:shadow-[0_0_12px_#00fff7] font-medium">
          Request Early Access
        </button>
        <button
          onClick={handleWatchDemoBtn}
          className="ml-4 bg-[#00fff7] text-[#000] text-sm px-5 py-2.5 border-none rounded cursor-pointer transition-shadow duration-300 ease-in-out font-['Orbitron',sans-serif] hover:shadow-[0_0_12px_#00fff7] font-medium"
        >
          Watch Demo
        </button>
      </div>
    </section>
  );
};
