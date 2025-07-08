export const Layers = () => {
  return (
    <section id="layers" className="px-8 py-12 font-extrabold text-center">
      <h2 className="text-[#00fff7] font-['Orbitron',sans-serif] text-2xl mb-3">Three Core Layers</h2>
      <div className="flex flex-wrap justify-center gap-8 mt-8">
        <div className="bg-[#1a1a1a] p-8 rounded-xl w-[280px] shadow-[0_0_10px_rgba(0,255,247,0.1)]">
          <h3 className="text-[#00fff7] font-['Orbitron',sans-serif] mb-3 text-xl">Voice Layer</h3>
          <p className="font-['Inter',sans-serif] font-medium text-white">Robots can speak clearly and show emotion with their voice.</p>
        </div>
        <div className="bg-[#1a1a1a] p-8 rounded-xl w-[280px] shadow-[0_0_10px_rgba(0,255,247,0.1)]">
          <h3 className="text-[#00fff7] font-['Orbitron',sans-serif] mb-3 text-xl" >Intelligence Layer</h3>
          <p className="font-['Inter',sans-serif] font-medium text-white">VibOS helps robots understand, learn, and make smart choices.</p>
        </div>
        <div className="bg-[#1a1a1a] p-8 rounded-xl w-[280px] shadow-[0_0_10px_rgba(0,255,247,0.1)]">
          <h3 className="text-[#00fff7] font-['Orbitron',sans-serif] mb-3 text-xl">Behavior Layer</h3>
          <p className="font-['Inter',sans-serif] font-medium text-white">Robots remember things and show unique personalities.</p>
        </div>
      </div>
    </section>
  );
};
