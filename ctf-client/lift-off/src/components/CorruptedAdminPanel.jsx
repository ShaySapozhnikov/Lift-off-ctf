import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ShipIcon from "./shipIcon";
import HeaderBar from "./AdminComps/HeaderBar";
import Prompt from "./AdminComps/Prompt";
import HelpBlock from "./AdminComps/HelpBlock";

// Buddy Simulator 1999-inspired CRT monitor
// Black & white palette only. TailwindCSS for styling.
// Drop-in component: full-screen, responsive, with subtle scanlines, flicker, and bezel.

export default function CorruptedAdminPanel() {
  const [bootLines, setBootLines] = useState([]);
  const [cursorOn, setCursorOn] = useState(true);
  const typedRef = useRef(null);

  useEffect(() => {
    const script = [
      "BOOT> INIT SYSTEM",
      "CHECK> MEMORY . . . unknown",
      "CHECK> DISK   . . . unknown",
      "CHECK> NET    . . . unknown",
      "WARN> AN█████████ PR████ ████TED",
    ];
    let i = 0;
    const t = setInterval(() => {
      setBootLines((prev) => (i < script.length ? [...prev, script[i++]] : prev));
      if (i >= script.length) clearInterval(t);
    }, 350);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const blink = setInterval(() => setCursorOn((c) => !c), 500);
    return () => clearInterval(blink);
  }, []);

  useEffect(() => {
    // keep the latest line in view
    if (typedRef.current) {
      typedRef.current.scrollTop = typedRef.current.scrollHeight;
    }
  }, [bootLines]);

  return (
    <div className="min-h-screen w-full bg-black text-white flex items-center justify-center p-4 select-none">
      {/* Outer bezel frame */}
      <div className="relative w-full max-w-5xl aspect-[16/9]">
        {/* Bezel with curved corners */}
        <div className="absolute inset-0 rounded-[2rem] bg-black/90 shadow-2xl ring-1 ring-white/10">
          {/* Inner lip */}
          <div className="absolute inset-3 rounded-[1.5rem] bg-gradient-to-b from-white/5 to-white/0 ring-1 ring-white/10" />

          {/* Power LED (white only) */}
          <div className="absolute bottom-4 right-6 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
         
          </div>
        </div>

        {/* Screen cavity */}
        <div className="absolute inset-3 rounded-[1.5rem] overflow-hidden">
          {/* Slight curve illusion with radial gradient and vignette */}
          <div className="absolute inset-0 bg-black">
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(120% 100% at 50% 40%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 35%, rgba(255,255,255,0) 60%)",
              mixBlendMode: "screen",
            }} />
            <div className="absolute inset-0 pointer-events-none" style={{
              boxShadow: "inset 0 0 80px rgba(255,255,255,0.08), inset 0 0 300px rgba(0,0,0,0.9)",
            }} />

            {/* Background ASCII Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <ShipIcon className="!animate-none text-white/[0.3]"></ShipIcon>
              
            </div>

            {/* Content (terminal) */}
            <motion.div
              className="absolute inset-0 p-6 md:p-10 font-mono text-sm md:text-base leading-relaxed"
              initial={{ filter: "blur(0.6px)", opacity: 0.95 }}
              animate={{ filter: ["blur(0.6px)", "blur(0.4px)", "blur(0.5px)"], opacity: [0.95, 0.92, 0.94] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <div ref={typedRef} className="h-full w-full overflow-hidden">
                <div className="h-full w-full overflow-auto pr-6 space-y-1">
                  <HeaderBar />
                  {bootLines.map((line, idx) => (
                    <div key={idx} className="text-white/90">
                      {line}
                    </div>
                  ))}
                  <Prompt />
                  <HelpBlock />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>     
    </div>
  );
}
