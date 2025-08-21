import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ShipIcon from "./shipIcon";
import HeaderBar from "./AdminComps/HeaderBar";
import Prompt from "./AdminComps/Prompt";
import HelpBlock from "./AdminComps/HelpBlock";
import SnakeAdmin from "./AdminComps/snakeAdmin";

export default function CorruptedAdminPanel() {
  const [bootLines, setBootLines] = useState([]);
  const [snakeEvent, setSnakeEvent] = useState(null);
  const typedRef = useRef(null);

  async function handleRunCommand(path, user) {
    const res = await fetch("https://lift-off-ctf.onrender.com/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, user }),
    });
    const data = await res.json();

    if (data.event) {
      setSnakeEvent(data.event); // trigger special rendering
    }

    return data.output; // still return normal output for logs
  }

  // Boot sequence
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
      setBootLines((prev) =>
        i < script.length ? [...prev, script[i++]] : prev
      );
      if (i >= script.length) clearInterval(t);
    }, 350);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll only if at bottom
  useEffect(() => {
    const el = typedRef.current;
    if (!el) return;
    const isAtBottom =
      el.scrollHeight - el.scrollTop <= el.clientHeight + 10;
    if (isAtBottom) el.scrollTop = el.scrollHeight;
  }, [bootLines, snakeEvent]);

  return (
    <div className="min-h-screen w-full bg-black text-white flex items-center justify-center p-4 select-none">
      <div className="relative w-full max-w-5xl aspect-[16/9]">
        {/* Bezel */}
        <div className="absolute inset-0 rounded-[2rem] bg-black/90 shadow-2xl ring-1 ring-white/10">
          <div className="absolute inset-3 rounded-[1.5rem] bg-gradient-to-b from-white/5 to-white/0 ring-1 ring-white/10" />
          <div className="absolute bottom-4 right-6 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
          </div>
        </div>

        {/* Screen cavity */}
        <div className="absolute inset-3 rounded-[1.5rem] overflow-hidden">
          <div className="absolute inset-0 bg-black">
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
                  "inset 0 0 80px rgba(255,255,255,0.08), inset 0 0 300px rgba(0,0,0,0.9)",
              }}
            />

            {/* Background ASCII Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <ShipIcon className="!animate-none text-white/[0.3]" />
            </div>

            {/* Terminal content */}
            <motion.div
              className="absolute inset-0 p-6 md:p-10 font-mono text-sm md:text-base leading-relaxed flex flex-col"
              initial={{ filter: "blur(0.6px)", opacity: 0.95 }}
              animate={{
                filter: ["blur(0.6px)", "blur(0.4px)", "blur(0.5px)"],
                opacity: [0.95, 0.92, 0.94],
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              {/* Header fixed at top */}
              <div className="flex-shrink-0">
                <HeaderBar />
              </div>

              {/* Scrollable content */}
              <div
                ref={typedRef}
                className="flex-1 flex flex-col justify-end overflow-y-auto pr-4
                           scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-black/20"
              >
                {bootLines.map((line, idx) => (
                  <div key={idx} className="text-white/90">
                    {line}
                  </div>
                ))}

                {/* Snake event render */}
                {snakeEvent === "snakeGame" && <SnakeAdmin />}

                <Prompt onRunCommand={handleRunCommand} />
                <HelpBlock />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
