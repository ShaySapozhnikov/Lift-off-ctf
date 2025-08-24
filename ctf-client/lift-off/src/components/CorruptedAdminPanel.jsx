import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ShipIcon from "./shipIcon";
import HeaderBar from "./AdminComps/HeaderBar";
import Prompt from "./AdminComps/Prompt";
import HelpBlock from "./AdminComps/HelpBlock";
import SnakeAdmin from "./AdminComps/snakeAdmin";

export default function CorruptedAdminPanel() {
  const [bootLines, setBootLines] = useState([]);
  const [snakeEvent, setSnakeEvent] = useState(null); // store event string
  const [fadeIn, setFadeIn] = useState(false);
  const typedRef = useRef(null);

  // Fade in effect on mount
  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  // Boot sequence
  useEffect(() => {
    const script = [
      "BOOT> INIT SYSTEM",
      "CHECK> MEMORY . . . unknown",
      "CHECK> DISK   . . . unknown", 
      "CHECK> NET    . . . unknown",
    ];
    let i = 0;
    const t = setInterval(() => {
      setBootLines((prev) =>
        i < script.length ? [...prev, script[i++]] : prev
      );
      if (i >= script.length) clearInterval(t);
    }, 350);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll
  useEffect(() => {
    const el = typedRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [bootLines, snakeEvent]);

  // Debug log
  useEffect(() => {
    console.log("Current snakeEvent state:", snakeEvent);
  }, [snakeEvent]);

  // --- Handler for Prompt events ---
  const handleEvent = (event) => {
    console.log("Prompt triggered event:", event);
    setSnakeEvent(event);
  };

  return (
    <div className={`min-h-screen w-full bg-zinc-900 text-white flex items-center justify-center p-4 select-none transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative w-full max-w-5xl aspect-[16/9]">
        {/* Bezel */}
        <div className="absolute inset-0 rounded-[2rem] bg-zinc-900 shadow-2xl ring-1 ring-white/10">
          <div className="absolute inset-3 rounded-[1.5rem] bg-gradient-to-b from-white/5 to-white/0 ring-1 ring-white/10" />
          <div className="absolute bottom-4 right-6 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-100 animate-pulse" />
          </div>
        </div>

        {/* Screen cavity */}
        <div className="absolute inset-3 rounded-[1.5rem] overflow-hidden">
          <div className="absolute inset-0 bg-zinc-900">
            {/* Curvature & vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(120% 100% at 50% 40%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 35%, rgba(255,255,255,0) 60%)",
                mixBlendMode: "screen",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow:
                  "inset 0 0 80px rgba(255,255,255,0.08), inset 0 0 300px rgba(68, 64, 60, 0.9)",
              }}
            />

            {/* Background ASCII Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <ShipIcon className="!animate-none text-white/30" />
            </div>

            {/* Terminal content */}
            <div
              className="absolute inset-0 p-6 md:p-10 font-mono text-sm md:text-base leading-relaxed flex flex-col"
              style={{
                animation: "randomFlicker 3.7s ease-in-out infinite"
              }}
            >
              <div className="flex-shrink-0">
                <HeaderBar />
              </div>

              <div
                ref={typedRef}
                className="flex-1 flex flex-col justify-end overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-amber-100/20 scrollbar-track-zinc-900/20"
              >
                {bootLines.map((line, idx) => (
                  <div key={idx} className="text-amber-100">
                    {line}
                  </div>
                ))}

                <Prompt onEvent={handleEvent} />
                <HelpBlock />
              </div>

              {/* Snake game overlay — move outside scrollable content */}
              {snakeEvent === "snakeGame" && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto">
                  <div className="w-full h-full relative">
                    <SnakeAdmin />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes randomFlicker {
          0% { 
            filter: blur(0.4px); 
            opacity: 0.94; 
          }
          2% { 
            filter: blur(0.6px); 
            opacity: 0.92; 
          }
          4% { 
            filter: blur(0.3px); 
            opacity: 0.96; 
          }
          6% { 
            filter: blur(0.5px); 
            opacity: 0.93; 
          }
          8% { 
            filter: blur(0.2px); 
            opacity: 0.97; 
          }
          15% { 
            filter: blur(0.7px); 
            opacity: 0.91; 
          }
          23% { 
            filter: blur(0.3px); 
            opacity: 0.95; 
          }
          31% { 
            filter: blur(0.4px); 
            opacity: 0.94; 
          }
          47% { 
            filter: blur(0.2px); 
            opacity: 0.97; 
          }
          52% { 
            filter: blur(0.8px); 
            opacity: 0.90; 
          }
          58% { 
            filter: blur(0.1px); 
            opacity: 0.98; 
          }
          73% { 
            filter: blur(0.5px); 
            opacity: 0.93; 
          }
          89% { 
            filter: blur(0.3px); 
            opacity: 0.96; 
          }
          94% { 
            filter: blur(0.6px); 
            opacity: 0.92; 
          }
          100% { 
            filter: blur(0.4px); 
            opacity: 0.94; 
          }
        }
      `}</style>
    </div>
  );
}