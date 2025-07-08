export const Audience = () => {
  return (
    <section id="audience" className="px-8 py-12 font-extrabold text-center">
      <h2 className="text-[#00fff7] font-['Orbitron',sans-serif] text-2xl font-bold">Who It&apos;s For</h2>
      <div className="flex flex-wrap justify-center gap-8 mt-8">
        <div className="bg-[#1a1a1a] p-8 rounded-xl w-[280px] shadow-[0_0_10px_rgba(0,255,247,0.1)]">
          <h3 className="text-[#00fff7] font-['Orbitron',sans-serif] mb-3 text-xl">Robotics Startups</h3>
          <p className="font-['Inter',sans-serif] text-white font-medium">Add speech, memory, and intelligence to your robot faster.</p>
        </div>
        <div className="bg-[#1a1a1a] p-8 rounded-xl w-[280px] shadow-[0_0_10px_rgba(0,255,247,0.1)]">
          <h3 className="text-[#00fff7] font-['Orbitron',sans-serif] mb-3 text-xl">AI Developers</h3>
          <p className="font-['Inter',sans-serif] text-white font-medium">Build tools and features that work with VibOS.</p>
        </div>
        <div className="bg-[#1a1a1a] p-8 rounded-xl w-[280px] shadow-[0_0_10px_rgba(0,255,247,0.1)]">
          <h3 className="text-[#00fff7] font-['Orbitron',sans-serif] mb-3 text-xl">Investors</h3>
          <p className="font-['Inter',sans-serif] text-white font-medium">Support the future of human-like robots and AI.</p>
        </div>
      </div>
    </section>
  );
};
