import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

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
            <span className="text-[10px] tracking-widest uppercase text-white/60">Power</span>
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

            {/* Scanlines & subtle flicker */}
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: "repeating-linear-gradient( to bottom, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 3px)",
              animation: "crtFlicker 6s infinite steps(60)",
            }} />

            {/* Glare strip */}
            <div className="absolute -left-10 top-0 h-full w-20 rotate-6 bg-gradient-to-b from-white/20 via-white/5 to-transparent blur-[2px] opacity-30 pointer-events-none" />

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

        {/* Subtle drop shadow to sell the CRT bulk */}
        <div className="absolute -inset-2 rounded-[2.25rem] blur-xl opacity-40" style={{ boxShadow: "0 80px 100px rgba(255,255,255,0.06)" }} />
      </div>

      {/* Local styles for keyframes (kept self-contained) */}
      <style>{`
        @keyframes crtFlicker {
          0% { opacity: 0.32; }
          10% { opacity: 0.28; }
          20% { opacity: 0.34; }
          30% { opacity: 0.26; }
          40% { opacity: 0.35; }
          50% { opacity: 0.27; }
          60% { opacity: 0.33; }
          70% { opacity: 0.29; }
          80% { opacity: 0.31; }
          90% { opacity: 0.28; }
          100% { opacity: 0.32; }
        }
      `}</style>
    </div>
  );
}

function HeaderBar() {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-[11px] tracking-widest uppercase text-white/60">
        <div className="flex items-center gap-3">
          <span className="inline-block h-2 w-2 rounded-full bg-white/80 animate-pulse" />
          <span>International Chat // ADMIN</span>
        </div>
        <div className="flex items-center gap-4">
          <span>v2.1</span>
          <span>[ Unhackable ]</span>
        </div>
      </div>
      <div className="mt-2 h-px w-full bg-gradient-to-r from-white/40 via-white/20 to-transparent" />
    </div>
  );
}

function Prompt() {
  const [buf, setBuf] = useState("");
  const [history, setHistory] = useState([]);
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);

  const onSubmit = (value) => {
    const v = value.trim().toLowerCase();
    if (!v) return;
    const out = [];
    if (v === "help") {
      out.push("AVAILABLE> help, status, clear, shutdown");
    } else if (v === "status") {
      out.push("STATUS> processes: 7 | anomaly: ACTIVE | net: OFFLINE");
    } else if (v === "shutdown") {
      out.push("SYSTEM> permission denied. anomaly intercept.");
    } else if (v === "clear") {
      setHistory([]);
      setBuf("");
      setIdx(0);
      return;
    } else {
      out.push(`UNKNOWN> ${v}`);
    }
    setHistory((h) => [...h, `> ${v}`, ...out]);
    setBuf("");
    setIdx(0);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="mt-4">
      {history.map((h, i) => (
        <div key={i} className="text-white/80">{h}</div>
      ))}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-white/70">&gt;</span>
        {/* Invisible input to capture keystrokes while we render custom caret */}
        <input
          ref={inputRef}
          value={buf}
          onChange={(e) => setBuf(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit(buf);
            if (e.key === "ArrowUp") setIdx((n) => Math.min(n + 1, history.length - 1));
            if (e.key === "ArrowDown") setIdx((n) => Math.max(n - 1, 0));
          }}
          className="absolute opacity-0 pointer-events-none"
        />
        <TerminalInput value={buf} />
      </div>
    </div>
  );
}

function TerminalInput({ value }) {
  const [cursorOn, setCursorOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setCursorOn((c) => !c), 550);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="font-mono text-white/90">
      <span>{value}</span>
      <span className={"ml-0.5 inline-block w-2 h-4 align-[-2px] " + (cursorOn ? "bg-white/80" : "bg-transparent border border-white/30")}></span>
    </div>
  );
}

function HelpBlock() {
  return (
    <div className="mt-6 text-[11px] text-white/50 leading-6">
      <div className="uppercase tracking-widest">Controls</div>
      <ul className="list-disc list-inside">
        <li>Type <span className="px-1 rounded-sm bg-white/10">help</span> for commands</li>
        <li>Try <span className="px-1 rounded-sm bg-white/10">status</span> or <span className="px-1 rounded-sm bg-white/10">shutdown</span></li>
        <li>Use <span className="px-1 rounded-sm bg-white/10">clear</span> to wipe the console</li>
      </ul>
    </div>
  );
}
